import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  allowedRoleEdges,
  conformanceScenarioFamilyIds,
  dependencyForms,
  roleDirectories,
  roles,
  type ConformanceScenarioFamilyId,
  type Role,
  type RoleEdge,
} from "./conformance-cases.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const sourceFixtureDirectory = resolve(repositoryDirectory, "test/fixtures/dependency-conformance");
const protectedFixtureDirectory = resolve(repositoryDirectory, "test/fixtures/oxlint-protected-dependency");
const protectedPolicy = JSON.parse(readFileSync(resolve(protectedFixtureDirectory, "righting.json"), "utf8")) as object;
const protectedSourceFiles = Object.fromEntries(
  [
    "src/client/protected-utility.js",
    "src/manager/protected-resource.js",
    "src/resource-access/protected-resource.js",
    "src/resource/protected-utility.js",
  ].map((path) => [path, readFileSync(resolve(protectedFixtureDirectory, path), "utf8")]),
);
const fixtureDirectory = mkdtempSync(resolve(tmpdir(), "righting-oxlint-conformance-"));
const canonicalFixtureDirectory = realpathSync(fixtureDirectory);
const fixturePolicyPath = resolve(fixtureDirectory, "righting.json");
const fixturePackagePath = resolve(fixtureDirectory, "package.json");
const oxlint = resolve(repositoryDirectory, "node_modules/.bin/oxlint");
const executableScenarioFamilyIds = new Set<ConformanceScenarioFamilyId>();
type NativeExecution = {
  command: string;
  exitStatus: number;
  diagnostics: string[];
  inspectionSha256: string;
  stdout: string;
  stderr: string;
};
const nativeExecutions = new Map<ConformanceScenarioFamilyId, NativeExecution[]>();
const inspectionCaptures = new Map<string, string>();
let activeScenarioFamily: ConformanceScenarioFamilyId | undefined;
const policyRuleIds = [
  "righting/role-dependency",
  "righting/unresolved-local-import",
  "righting/unclassified-source",
  "righting/ambiguous-source",
  "righting/test-dependency",
];

cpSync(sourceFixtureDirectory, fixtureDirectory, { recursive: true });
writeFileSync(
  resolve(fixtureDirectory, ".oxlintrc.json"),
  `${JSON.stringify(
    {
      jsPlugins: [{ name: "righting", specifier: resolve(repositoryDirectory, "dist/src/oxlint.js") }],
      rules: Object.fromEntries(policyRuleIds.map((ruleId) => [ruleId, "error"])),
    },
    null,
    2,
  )}\n`,
);
writeFileSync(fixturePackagePath, '{"private":true,"type":"module","imports":{"#/*":"./src/*"}}\n');

function conformanceTest(id: ConformanceScenarioFamilyId, name: string, run: () => void) {
  assert.equal(executableScenarioFamilyIds.has(id), false, `duplicate executable scenario family: ${id}`);
  executableScenarioFamilyIds.add(id);
  test(`${id}: ${name}`, () => {
    activeScenarioFamily = id;
    nativeExecutions.set(id, []);
    try {
      run();
    } finally {
      activeScenarioFamily = undefined;
    }
  });
}

after(() => {
  try {
    const familyIds = [...Object.values(conformanceScenarioFamilyIds)].sort();
    assert.deepEqual(
      [...executableScenarioFamilyIds].sort(),
      familyIds,
      "every registered scenario family must have one executable family test",
    );
    if (nativeExecutions.size === familyIds.length) {
      const evidence = {
        schemaVersion: 1,
        generatedBy: "node --test dist/test/oxlint.test.js",
        fixture: "isolated copy of test/fixtures/dependency-conformance with per-family additions from test/oxlint.test.ts",
        executable: "node_modules/.bin/oxlint",
        inspectionCaptures: Object.fromEntries([...inspectionCaptures].sort(([left], [right]) => left.localeCompare(right))),
        families: Object.fromEntries(familyIds.map((id) => [id, nativeExecutions.get(id)])),
      };
      const evidencePath = resolve(repositoryDirectory, "docs/evidence/oxlint-native-executions.json");
      if (process.env.UPDATE_OXLINT_EVIDENCE === "1") {
        writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
      } else {
        assert.deepEqual(JSON.parse(readFileSync(evidencePath, "utf8")), evidence);
      }
    }
  } finally {
    rmSync(fixtureDirectory, { recursive: true, force: true });
  }
});

const aliases = [
  { name: "client", role: "Client", directorySegments: ["client"] },
  { name: "manager", role: "Manager", directorySegments: ["manager"] },
  { name: "engine", role: "Engine", directorySegments: ["engine"] },
  { name: "resourceAccess", role: "ResourceAccess", directorySegments: ["resource-access"] },
  { name: "resource", role: "Resource", directorySegments: ["resource"] },
  { name: "utility", role: "Utility", directorySegments: ["utility"] },
];

function policy(extra: Record<string, unknown> = {}) {
  return { preset: "volatility@1", coverage: ["src/**/*.{js,cjs,mts}"], aliases, ...extra };
}

function withJson(path: string, candidate: object, action: () => void) {
  const original = readFileSync(path, "utf8");
  writeFileSync(path, `${JSON.stringify(candidate, null, 2)}\n`);
  try {
    action();
  } finally {
    writeFileSync(path, original);
  }
}

function withPolicy(candidate: object, action: () => void) {
  withJson(fixturePolicyPath, candidate, action);
}

function withPackage(candidate: object, action: () => void) {
  withJson(fixturePackagePath, candidate, action);
}

function withFiles(files: Record<string, string>, action: () => void) {
  for (const [path, contents] of Object.entries(files)) {
    const target = resolve(fixtureDirectory, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, contents);
  }
  try {
    action();
  } finally {
    for (const path of Object.keys(files)) rmSync(resolve(fixtureDirectory, path), { force: true });
  }
}

function stableNativeOutput(value: string): string {
  const lines = value
    .replaceAll(canonicalFixtureDirectory, "<fixture>")
    .replaceAll(fixtureDirectory, "<fixture>")
    .split(/\r?\n/)
    .filter(Boolean)
    .sort();
  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

function retainInspection(workingDirectory: string): string {
  const cli = resolve(repositoryDirectory, "dist/src/cli.js");
  const inspection = spawnSync(process.execPath, [cli, "inspect", "--json"], {
    cwd: workingDirectory,
    encoding: "utf8",
  });
  assert.equal(inspection.status, 0, inspection.stderr);
  const sha256 = createHash("sha256").update(inspection.stdout).digest("hex");
  inspectionCaptures.set(sha256, inspection.stdout);
  return sha256;
}

function runLint(
  targets: string | readonly string[],
  options: readonly string[] = [],
  workingDirectory = fixtureDirectory,
) {
  const arguments_ = [...options, ...(typeof targets === "string" ? [targets] : targets)];
  const inspectionSha256 =
    activeScenarioFamily === undefined ? undefined : retainInspection(workingDirectory);
  const result = spawnSync(oxlint, arguments_, { cwd: workingDirectory, encoding: "utf8" });
  if (activeScenarioFamily !== undefined) {
    const text = output(result);
    nativeExecutions.get(activeScenarioFamily)!.push({
      command: `node_modules/.bin/oxlint ${arguments_.map((argument) => JSON.stringify(argument)).join(" ")}`,
      exitStatus: result.status ?? -1,
      diagnostics: policyRuleIds.filter((ruleId) => text.includes(ruleId)),
      inspectionSha256: inspectionSha256!,
      stdout: stableNativeOutput(result.stdout),
      stderr: stableNativeOutput(result.stderr),
    });
  }
  return result;
}

function output(result: ReturnType<typeof runLint>): string {
  return `${result.stdout}\n${result.stderr}`;
}

test("the Oxlint support record retains reproducible inspection captures", () => {
  const cli = resolve(repositoryDirectory, "dist/src/cli.js");
  const captures = [
    {
      fixture: sourceFixtureDirectory,
      evidence: "oxlint-inspection.json",
      sha256: "d3fe86488eee441bc1645100e67cd3a0c050b79ef09febc76c8580278574b608",
    },
    {
      fixture: protectedFixtureDirectory,
      evidence: "oxlint-protected-inspection.json",
      sha256: "d767397c535bfb24fb496e06916505c8dcfeef4a61f4ef85b0b0d623e04f28d3",
    },
  ];
  for (const capture of captures) {
    const inspection = spawnSync(process.execPath, [cli, "inspect", "--json"], {
      cwd: capture.fixture,
      encoding: "utf8",
    });
    assert.equal(inspection.status, 0, inspection.stderr);
    const expected = readFileSync(resolve(repositoryDirectory, "docs/evidence", capture.evidence), "utf8");
    assert.equal(inspection.stdout, expected);
    assert.equal(createHash("sha256").update(expected).digest("hex"), capture.sha256);
  }
});

type RoleDependency = readonly [Role, Role];

function runRoleDependencies(dependencies: readonly RoleDependency[]) {
  const files = Object.fromEntries(
    dependencies.map(([from, to]) => {
      const fromDirectory = roleDirectories[from];
      const toDirectory = roleDirectories[to];
      const path = `src/${fromDirectory}/oxlint-to-${toDirectory}.js`;
      const dependency = from === to ? "./value.js" : `../${toDirectory}/value.js`;
      return [path, `import { value } from "${dependency}";\nexport { value };\n`];
    }),
  );
  let result!: ReturnType<typeof runLint>;
  withFiles(files, () => {
    result = runLint(Object.keys(files));
  });
  return { result, targets: Object.keys(files) };
}

conformanceTest(conformanceScenarioFamilyIds.defaultRoleEdges, "Oxlint 1.75.0 enforces all 36 default role edges", () => {
  const allowed: RoleDependency[] = [];
  const forbidden: RoleDependency[] = [];
  for (const from of roles) {
    for (const to of roles) {
      (allowedRoleEdges.has(`${from}:${to}` as RoleEdge) ? allowed : forbidden).push([from, to]);
    }
  }
  const allowedResult = runRoleDependencies(allowed).result;
  assert.equal(allowedResult.status, 0, output(allowedResult));
  const forbiddenResult = runRoleDependencies(forbidden);
  assert.equal(forbiddenResult.result.status, 1, output(forbiddenResult.result));
  assert.match(output(forbiddenResult.result), /righting\/role-dependency/);
  for (const target of forbiddenResult.targets) assert.ok(output(forbiddenResult.result).includes(target), target);
});

conformanceTest(conformanceScenarioFamilyIds.staticDependencyForms, "Oxlint covers static dependency forms, extension and index resolution, package imports, and unresolved locals", () => {
  const allowed = runLint(dependencyForms.map(({ allowed: target }) => target));
  assert.equal(allowed.status, 0, output(allowed));
  const forbidden = runLint(dependencyForms.map(({ forbidden: target }) => target));
  assert.equal(forbidden.status, 1, output(forbidden));
  assert.match(output(forbidden), /righting\/role-dependency/);
  for (const { forbidden: target } of dependencyForms) assert.ok(output(forbidden).includes(target), target);

  withFiles(
    {
      "src/client/package-import.js": 'import { value } from "#/manager/value.js";\nexport { value };\n',
      "src/manager/package-import.js": 'import { value } from "#/client/value.js";\nexport { value };\n',
    },
    () => {
      assert.equal(runLint("src/client/package-import.js").status, 0);
      const result = runLint("src/manager/package-import.js");
      assert.equal(result.status, 1, output(result));
      assert.match(output(result), /righting\/role-dependency/);
    },
  );

  withFiles(
    {
      "src/manager/specific-package-import.js":
        'import { value } from "#x/client/value.js";\nexport { value };\n',
      "src/client/exact-package-import.js":
        'import { value } from "#manager";\nexport { value };\n',
      "src/manager/exact-package-import.js":
        'import { value } from "#client";\nexport { value };\n',
      "src/manager/copy-manager.js": "export const value = 1;\n",
      "src/client/repeated-wildcard-import.js":
        'import { value } from "#pair/manager";\nexport { value };\n',
    },
    () => {
      withPackage(
        {
          private: true,
          type: "module",
          imports: {
            "#*": "./src/utility/value.js",
            "#x/*": "./src/*",
            "#manager": "./src/manager/value.js",
            "#client": "./src/client/value.js",
            "#pair/*": "./src/*/copy-*",
          },
        },
        () => {
          const specific = runLint("src/manager/specific-package-import.js");
          assert.equal(specific.status, 1, output(specific));
          assert.match(output(specific), /Manager cannot depend on Client/);
          const allowedExact = runLint(["src/client/exact-package-import.js", "src/client/repeated-wildcard-import.js"]);
          assert.equal(allowedExact.status, 0, output(allowedExact));
          const forbiddenExact = runLint("src/manager/exact-package-import.js");
          assert.equal(forbiddenExact.status, 1, output(forbiddenExact));
          assert.match(output(forbiddenExact), /Manager cannot depend on Client/);
        },
      );
    },
  );

  withFiles(
    {
      "src/client/unresolved-package.js": 'import "#missing";\n',
      "src/client/unresolved-package-name.js": 'import "missing-package";\n',
      "src/client/conditional-package-import.js": 'import "#conditional/manager/value.js";\n',
      "src/manager/conditional-package-import.js": 'import "#conditional/client/value.js";\n',
      "src/client/conditional-import.js": 'import "#conditioned";\n',
      "src/manager/conditional-require.cjs": 'require("#conditioned");\n',
      "src/client/array-package-import.js": 'import "#array/manager/value.js";\n',
      "src/manager/array-package-import.js": 'import "#array/client/value.js";\n',
      "src/client/ts-path.mts": 'import "@local/manager/value.js";\n',
      "src/manager/ts-path.mts": 'import "@local/client/value.js";\n',
      "tsconfig.json": `${JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@local/*": ["src/*"] } } })}\n`,
    },
    () => {
      const unresolvedPackage = runLint(["src/client/unresolved-package.js", "src/client/unresolved-package-name.js"]);
      assert.equal(unresolvedPackage.status, 1, output(unresolvedPackage));
      assert.match(output(unresolvedPackage), /righting\/unresolved-local-import/);
      withPackage(
        {
          private: true,
          type: "module",
          imports: {
            "#*": "./src/utility/value.js",
            "#conditional/*": { import: "./src/*", default: "./src/utility/value.js" },
            "#conditioned": {
              import: "./src/manager/value.js",
              require: "./src/client/value.js",
            },
            "#array/*": ["../invalid/*", "./src/*"],
          },
        },
        () => {
          const allowedAliases = runLint([
            "src/client/conditional-package-import.js",
            "src/client/conditional-import.js",
            "src/client/array-package-import.js",
            "src/client/ts-path.mts",
          ]);
          assert.equal(allowedAliases.status, 0, output(allowedAliases));
          const forbiddenAliases = runLint([
            "src/manager/conditional-package-import.js",
            "src/manager/conditional-require.cjs",
            "src/manager/array-package-import.js",
            "src/manager/ts-path.mts",
          ]);
          assert.equal(forbiddenAliases.status, 1, output(forbiddenAliases));
          assert.match(output(forbiddenAliases), /righting\/role-dependency/);
        },
      );
    },
  );
  withFiles(
    {
      "src/manager/external-and-builtin.js": 'import "ordinary/subpath";\nimport "node:fs";\n',
      "node_modules/ordinary/package.json":
        '{"name":"ordinary","type":"module","exports":{"./subpath":"./subpath.js"}}\n',
      "node_modules/ordinary/subpath.js": "export {};\n",
    },
    () => {
      const external = runLint("src/manager/external-and-builtin.js");
      assert.equal(external.status, 0, output(external));
    },
  );
  const unresolved = runLint("src/client/unresolved.js");
  assert.equal(unresolved.status, 1, output(unresolved));
  assert.match(output(unresolved), /righting\/unresolved-local-import/);
});

test("Oxlint ignores calls to locally shadowed require functions", () => {
  withFiles(
    {
      "src/manager/shadowed-require.js":
        'function require(value) { return value; }\nexport const value = require("../client/value.js");\n',
    },
    () => {
      const result = runLint("src/manager/shadowed-require.js");
      assert.equal(result.status, 0, output(result));
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.canonicalAndAliasClassification, "Oxlint gives canonical and project aliases the same role semantics", () => {
  withFiles(
    {
      "src/page.client.js": 'import { value } from "./work.manager.js";\nexport { value };\n',
      "src/work.manager.js": 'export const value = "manager";\n',
      "src/page.screen.js": 'import { value } from "./work.manager.js";\nexport { value };\n',
      "src/clients/page.js": 'import { value } from "../work.manager.js";\nexport { value };\n',
      "src/screens/page.js": 'import { value } from "../work.manager.js";\nexport { value };\n',
      "src/screens/page.client.js": 'import { value } from "../work.manager.js";\nexport { value };\n',
      "src/reject-screen.manager.js": 'import { value } from "./page.screen.js";\nexport { value };\n',
      "src/managers/reject-screen.js": 'import { value } from "../screens/page.js";\nexport { value };\n',
    },
    () => {
      withPolicy(
        {
          preset: "volatility@1",
          coverage: ["src/**/*.js"],
          aliases: [
            {
              name: "screen",
              role: "Client",
              filenameSuffixes: [".screen."],
              directorySegments: ["screens"],
            },
          ],
        },
        () => {
          const result = runLint([
            "src/page.client.js",
            "src/page.screen.js",
            "src/clients/page.js",
            "src/screens/page.js",
            "src/screens/page.client.js",
          ]);
          assert.equal(result.status, 0, output(result));
          const forbidden = runLint(["src/reject-screen.manager.js", "src/managers/reject-screen.js"]);
          assert.equal(forbidden.status, 1, output(forbidden));
          assert.match(output(forbidden), /righting\/role-dependency/);
        },
      );
    },
  );

  const suffixes: Record<Role, string> = {
    Client: "client",
    Manager: "manager",
    Engine: "engine",
    ResourceAccess: "access",
    Resource: "resource",
    Utility: "utility",
  };
  const directories: Record<Role, string> = {
    Client: "clients",
    Manager: "managers",
    Engine: "engines",
    ResourceAccess: "access",
    Resource: "resources",
    Utility: "utilities",
  };
  const files: Record<string, string> = { "src/target.utility.js": "export const value = 1;\n" };
  for (const role of roles) {
    files[`src/canonical-${role}.${suffixes[role]}.js`] =
      'import { value } from "./target.utility.js";\nexport { value };\n';
    files[`src/${directories[role]}/canonical.js`] =
      'import { value } from "../target.utility.js";\nexport { value };\n';
  }
  withFiles(files, () => {
    withPolicy({ preset: "volatility@1", coverage: ["src/**/*.js"] }, () => {
      const result = runLint(Object.keys(files));
      assert.equal(result.status, 0, output(result));
    });
  });
});

conformanceTest(conformanceScenarioFamilyIds.policyVariationsAndProtectedDependencies, "Oxlint consumes normalized variations, overrides, and protected dependencies", () => {
  withFiles(
    {
      "src/client/read-access.js": 'import { value } from "../resource-access/value.js";\nexport { value };\n',
      "src/client/read-resource.js": 'import { value } from "../resource/value.js";\nexport { value };\n',
      "src/engine/read-access.js": 'import { value } from "../resource-access/value.js";\nexport { value };\n',
    },
    () => {
      withPolicy(policy(), () => {
        assert.equal(runLint("src/client/read-access.js").status, 1);
        assert.equal(runLint("src/engine/read-access.js").status, 0);
      });
      withPolicy(
        policy({
          variations: ["clientReadsAccess", "pureEngines"],
          overrides: [
            {
              name: "client-reads-resource",
              from: "Client",
              to: "Resource",
              effect: "allow",
              reason: "Approved read model.",
            },
          ],
        }),
        () => {
          assert.equal(runLint(["src/client/read-access.js", "src/client/read-resource.js"]).status, 0);
          const engine = runLint("src/engine/read-access.js");
          assert.equal(engine.status, 1, output(engine));
          assert.match(output(engine), /righting\/role-dependency/);
        },
      );
    },
  );

  withFiles(
    {
      ...protectedSourceFiles,
      "src/manager/protected-import-map.js": 'import "#protected-resource";\n',
      "src/resource-access/protected-import-map.js": 'import "#protected-resource";\n',
      "node_modules/protected-resource/package.json":
        '{"name":"protected-resource","type":"module","exports":{".":"./index.js","./subpath":"./subpath.js"}}\n',
      "node_modules/protected-resource/index.js": "export {};\n",
      "node_modules/protected-resource/subpath.js": "export {};\n",
      "node_modules/@example/protected-utility/package.json":
        '{"name":"@example/protected-utility","type":"module","exports":{"./subpath":"./subpath.js"}}\n',
      "node_modules/@example/protected-utility/subpath.js": "export {};\n",
    },
    () => {
      withPackage(
        {
          private: true,
          type: "module",
          imports: { "#protected-resource": "protected-resource" },
        },
        () => {
          withPolicy(
            protectedPolicy,
            () => {
              const manager = runLint(["src/manager/protected-resource.js", "src/manager/protected-import-map.js"]);
              assert.equal(manager.status, 1, output(manager));
              assert.match(output(manager), /righting\/role-dependency/);
              assert.equal(
                runLint(["src/resource-access/protected-resource.js", "src/resource-access/protected-import-map.js"]).status,
                0,
              );
              const client = runLint("src/client/protected-utility.js");
              assert.equal(client.status, 1, output(client));
              assert.match(output(client), /righting\/role-dependency/);
              assert.equal(runLint("src/resource/protected-utility.js").status, 0);
            },
          );
        },
      );
    },
  );
});

test("unresolved configured protected packages fail closed from allowed and forbidden roles", () => {
  withFiles(
    {
      "src/resource-access/missing-protected.js": 'import "missing-protected/subpath";\n',
      "src/manager/missing-protected.js": 'import "missing-protected/subpath";\n',
    },
    () => {
      withPolicy(
        policy({ protectedDependencies: [{ package: "missing-protected", role: "Resource" }] }),
        () => {
          const result = runLint([
            "src/resource-access/missing-protected.js",
            "src/manager/missing-protected.js",
          ]);
          assert.equal(result.status, 1, output(result));
          assert.match(output(result), /righting\/unresolved-local-import/);
          assert.match(output(result), /src[\\/]resource-access[\\/]missing-protected\.js/);
          assert.match(output(result), /src[\\/]manager[\\/]missing-protected\.js/);
        },
      );
    },
  );
});

test("Oxlint discovers the policy root when invoked from a project subdirectory", () => {
  const workingDirectory = resolve(fixtureDirectory, "src");
  const allowed = runLint("client/client.js", ["--config", "../.oxlintrc.json"], workingDirectory);
  assert.equal(allowed.status, 0, output(allowed));
  const forbidden = runLint("manager/forbidden.js", ["--config", "../.oxlintrc.json"], workingDirectory);
  assert.equal(forbidden.status, 1, output(forbidden));
  assert.match(output(forbidden), /righting\/role-dependency/);
});

test("Oxlint keeps normalized contracts isolated across project roots in one process", () => {
  withFiles(
    {
      "workspace-a/righting.json": '{"preset":"volatility@1","coverage":["src/**/*.js"]}\n',
      "workspace-a/package.json": '{"private":true,"type":"module"}\n',
      "workspace-a/src/page.client.js": 'import "./work.manager.js";\n',
      "workspace-a/src/work.manager.js": "export {};\n",
      "workspace-b/righting.json": '{"preset":"volatility@1","coverage":["src/**/*.js"]}\n',
      "workspace-b/package.json": '{"private":true,"type":"module"}\n',
      "workspace-b/src/work.manager.js": 'import "./page.client.js";\n',
      "workspace-b/src/page.client.js": "export {};\n",
    },
    () => {
      const result = runLint(["workspace-a/src/page.client.js", "workspace-b/src/work.manager.js"]);
      assert.equal(result.status, 1, output(result));
      assert.match(output(result), /workspace-b[\\/]src[\\/]work\.manager\.js/);
      assert.doesNotMatch(output(result), /workspace-a[\\/]src[\\/]page\.client\.js/);
    },
  );
});

test("an invalid enclosing policy does not block a valid nested project", () => {
  withFiles(
    {
      "nested/righting.json": '{"preset":"volatility@1","coverage":["src/**/*.js"]}\n',
      "nested/package.json": '{"private":true,"type":"module"}\n',
      "nested/src/value.utility.js": "export {};\n",
    },
    () => {
      withPolicy({ preset: "volatility@1", status: "incomplete" }, () => {
        const result = runLint("nested/src/value.utility.js");
        assert.equal(result.status, 0, output(result));
      });
    },
  );
});

test("Oxlint fails closed when inspection is incomplete or invalid", () => {
  withPolicy({ preset: "volatility@1", status: "incomplete" }, () => {
    const result = runLint("src/client/client.js");
    assert.equal(result.status, 1, output(result));
    assert.match(output(result), /must return a valid normalized contract/);
  });
  withPolicy({ preset: "volatility@1" }, () => {
    const result = runLint("src/client/client.js");
    assert.equal(result.status, 1, output(result));
    assert.match(output(result), /coverage must be a non-empty array/);
  });
});

test("Oxlint acquires one contract per project before parallel file traversal", () => {
  const pluginDirectory = mkdtempSync(resolve(repositoryDirectory, "dist/oxlint-inspection-stress-"));
  const acquisitionPath = resolve(pluginDirectory, "acquisitions");
  const files = {
    "stress-project/righting.json": '{"preset":"volatility@1","coverage":["src/**/*.js"]}\n',
    "stress-project/package.json": '{"private":true,"type":"module"}\n',
    ...Object.fromEntries(
      Array.from({ length: 64 }, (_, index) => [`stress-project/src/value-${index}.utility.js`, "export {};\n"]),
    ),
  };
  try {
    copyFileSync(resolve(repositoryDirectory, "dist/src/oxlint.js"), resolve(pluginDirectory, "oxlint.js"));
    const inspection = JSON.parse(
      readFileSync(resolve(repositoryDirectory, "docs/evidence/oxlint-inspection.json"), "utf8"),
    ) as { contract: object };
    writeFileSync(acquisitionPath, "");
    writeFileSync(
      resolve(pluginDirectory, "adapter-inspection.js"),
      `import { appendFileSync } from "node:fs";\nexport function loadNormalizedContract(projectDirectory) {\n  appendFileSync(${JSON.stringify(acquisitionPath)}, projectDirectory + "\\n");\n  if (new Error().stack.includes("lintFileImpl")) throw new Error("Righting adapter: could not run righting inspect --json: spawnSync node ENOMEM");\n  return ${JSON.stringify(inspection.contract)};\n}\n`,
    );
    withFiles(files, () => {
      withJson(
        resolve(fixtureDirectory, ".oxlintrc.json"),
        {
          jsPlugins: [{ name: "righting", specifier: resolve(pluginDirectory, "oxlint.js") }],
          rules: Object.fromEntries(policyRuleIds.map((ruleId) => [ruleId, "error"])),
        },
        () => {
          const result = runLint("stress-project/src", ["--threads=2"]);
          assert.equal(result.status, 0, output(result));
          assert.deepEqual(readFileSync(acquisitionPath, "utf8").trim().split("\n").sort(), [
            canonicalFixtureDirectory,
            realpathSync(resolve(fixtureDirectory, "stress-project")),
          ].sort());
        },
      );
    });
  } finally {
    rmSync(pluginDirectory, { recursive: true, force: true });
  }
});

test("Oxlint fails closed on an unknown future applicable capability", () => {
  const pluginDirectory = mkdtempSync(resolve(repositoryDirectory, "dist/oxlint-future-capability-"));
  try {
    copyFileSync(resolve(repositoryDirectory, "dist/src/oxlint.js"), resolve(pluginDirectory, "oxlint.js"));
    const inspection = JSON.parse(
      readFileSync(resolve(repositoryDirectory, "docs/evidence/oxlint-inspection.json"), "utf8"),
    ) as { contract: { effective: { capabilities: object[] } } };
    inspection.contract.effective.capabilities.push({
      id: "future-static",
      applies: true,
      reason: "Future static capability fixture.",
      establishes: [],
      doesNotEstablish: [],
      policyRuleIds: [],
      requiredScenarioFamilies: [],
    });
    writeFileSync(
      resolve(pluginDirectory, "adapter-inspection.js"),
      `export function loadNormalizedContract() { return ${JSON.stringify(inspection.contract)}; }\n`,
    );
    withJson(
      resolve(fixtureDirectory, ".oxlintrc.json"),
      {
        jsPlugins: [{ name: "righting", specifier: resolve(pluginDirectory, "oxlint.js") }],
        rules: { "righting/role-dependency": "error" },
      },
      () => {
        const result = runLint("src/client/client.js");
        assert.notEqual(result.status, 0, output(result));
        assert.match(output(result), /unsupported capabilities: future-static/);
      },
    );
  } finally {
    rmSync(pluginDirectory, { recursive: true, force: true });
  }
});

conformanceTest(conformanceScenarioFamilyIds.declaredCoverage, "Oxlint leaves source outside declared coverage unchecked", () => {
  withFiles(
    {
      "outside/value.js": 'export const value = "outside";\n',
      "outside/unchecked.manager.js": 'import { value } from "../src/client/value.js";\nexport { value };\n',
      "src/client/import-outside.js": 'import { value } from "../../outside/value.js";\nexport { value };\n',
    },
    () => {
      const result = runLint(["src/client/import-outside.js", "outside/unchecked.manager.js"]);
      assert.equal(result.status, 0, output(result));
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.sourceClassificationViolations, "Oxlint reports unclassified and ambiguous covered source", () => {
  withFiles(
    {
      "src/plain.js": "export {};\n",
      "src/engines/page.client.js": "export {};\n",
    },
    () => {
      withPolicy({ preset: "volatility@1", coverage: ["src/**/*.js"] }, () => {
        const result = runLint(["src/plain.js", "src/engines/page.client.js"]);
        assert.equal(result.status, 1, output(result));
        assert.match(output(result), /righting\/unclassified-source/);
        assert.match(output(result), /righting\/ambiguous-source/);
      });
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.testSourceTreatment, "Oxlint keeps test source visible while exempting only its outgoing dependencies", () => {
  withFiles(
    {
      "src/manager/forbidden.test.js": 'import { value } from "../client/value.js";\nexport { value };\n',
      "src/manager/target.test.js": 'export const value = "test";\n',
      "src/client/import-test.js": 'import { value } from "../manager/target.test.js";\nexport { value };\n',
      "src/tests/manager/forbidden.js": 'import { value } from "../../client/value.js";\nexport { value };\n',
      "src/manager/unresolved.test.js": 'import "./missing.js";\n',
      "src/tests/manager/unresolved.js": 'import "./missing.js";\n',
      "src/tests/manager/target.js": 'export const value = "test directory";\n',
      "src/client/import-test-directory.js": 'import { value } from "../tests/manager/target.js";\nexport { value };\n',
    },
    () => {
      assert.equal(runLint(["src/manager/forbidden.test.js", "src/tests/manager/forbidden.js"]).status, 0);
      const unresolved = runLint(["src/manager/unresolved.test.js", "src/tests/manager/unresolved.js"]);
      assert.equal(unresolved.status, 1, output(unresolved));
      assert.match(output(unresolved), /righting\/unresolved-local-import/);
      const production = runLint(["src/client/import-test.js", "src/client/import-test-directory.js"]);
      assert.equal(production.status, 1, output(production));
      assert.match(output(production), /righting\/test-dependency/);
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.generatedSourceAndCompositionRoots, "Oxlint governs generated roles and keeps composition roots exact", () => {
  withFiles(
    {
      "src/manager/forbidden.generated.js": 'import { value } from "../client/value.js";\nexport { value };\n',
      "src/generated/manager/forbidden.js": 'import { value } from "../../client/value.js";\nexport { value };\n',
      "src/composition-root.js": 'import "./client/value.js";\nimport "./manager/value.js";\n',
      "src/client/import-root.js": 'import "../composition-root.js";\n',
      "src/manager/not-composition-root.js": 'import { value } from "../client/value.js";\nexport { value };\n',
    },
    () => {
      const generated = runLint(["src/manager/forbidden.generated.js", "src/generated/manager/forbidden.js"]);
      assert.equal(generated.status, 1, output(generated));
      assert.match(output(generated), /righting\/role-dependency/);
      assert.equal(runLint("src/composition-root.js").status, 0);
      const production = runLint("src/client/import-root.js");
      assert.equal(production.status, 1, output(production));
      assert.match(output(production), /righting\/role-dependency/);
      const suffixCollision = runLint("src/manager/not-composition-root.js");
      assert.equal(suffixCollision.status, 1, output(suffixCollision));
      assert.match(output(suffixCollision), /Manager cannot depend on Client/);
    },
  );
});

test("Oxlint native directives suppress exact dependency and classification findings and reject stale directives", () => {
  withFiles(
    {
      "src/manager/suppressed.js":
        '// oxlint-disable-next-line righting/role-dependency -- approved legacy dependency\nimport { value } from "../client/value.js";\nexport { value };\n',
      "src/suppressed-plain.js":
        "// oxlint-disable righting/unclassified-source -- approved legacy classification\nexport {};\n",
      "src/engines/suppressed.client.js":
        "// oxlint-disable righting/ambiguous-source -- approved legacy classification\nexport {};\n",
      "src/client/suppressed-unresolved.js":
        '// oxlint-disable-next-line righting/unresolved-local-import -- approved unresolved dependency\nimport "./missing.js";\n',
      "src/manager/suppressed-target.test.js": "export {};\n",
      "src/client/suppressed-test.js":
        '// oxlint-disable-next-line righting/test-dependency -- approved test dependency\nimport "../manager/suppressed-target.test.js";\n',
    },
    () => {
      const result = runLint(
        [
          "src/manager/suppressed.js",
          "src/suppressed-plain.js",
          "src/engines/suppressed.client.js",
          "src/client/suppressed-unresolved.js",
          "src/client/suppressed-test.js",
        ],
        ["--report-unused-disable-directives"],
      );
      assert.equal(result.status, 0, output(result));
    },
  );
  withFiles(
    {
      "src/client/stale.js":
        '// oxlint-disable-next-line righting/role-dependency -- stale on purpose\nimport { value } from "../manager/value.js";\nexport { value };\n',
    },
    () => {
      const result = runLint("src/client/stale.js", ["--deny-warnings", "--report-unused-disable-directives"]);
      assert.equal(result.status, 1, output(result));
      assert.match(output(result), /Unused oxlint-disable directive/);
    },
  );
});
