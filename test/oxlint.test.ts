import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  allowedRoleEdges,
  dependencyForms,
  roleDirectories,
  roles,
  type Role,
  type RoleEdge,
} from "./conformance-cases.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const sourceFixtureDirectory = resolve(repositoryDirectory, "test/fixtures/dependency-conformance");
const fixtureDirectory = mkdtempSync(resolve(tmpdir(), "righting-oxlint-conformance-"));
const fixturePolicyPath = resolve(fixtureDirectory, "righting.json");
const fixturePackagePath = resolve(fixtureDirectory, "package.json");
const oxlint = resolve(repositoryDirectory, "node_modules/.bin/oxlint");

cpSync(sourceFixtureDirectory, fixtureDirectory, { recursive: true });
writeFileSync(
  resolve(fixtureDirectory, ".oxlintrc.json"),
  `${JSON.stringify(
    {
      jsPlugins: [{ name: "righting", specifier: resolve(repositoryDirectory, "dist/src/oxlint.js") }],
      rules: {
        "righting/role-dependency": "error",
        "righting/unresolved-local-import": "error",
        "righting/unclassified-source": "error",
        "righting/ambiguous-source": "error",
        "righting/test-dependency": "error",
      },
    },
    null,
    2,
  )}\n`,
);
writeFileSync(fixturePackagePath, '{"private":true,"type":"module","imports":{"#/*":"./src/*"}}\n');

after(() => rmSync(fixtureDirectory, { recursive: true, force: true }));

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

function withPolicy(candidate: object, action: () => void) {
  const original = readFileSync(fixturePolicyPath, "utf8");
  writeFileSync(fixturePolicyPath, `${JSON.stringify(candidate, null, 2)}\n`);
  try {
    action();
  } finally {
    writeFileSync(fixturePolicyPath, original);
  }
}

function withPackage(candidate: object, action: () => void) {
  const original = readFileSync(fixturePackagePath, "utf8");
  writeFileSync(fixturePackagePath, `${JSON.stringify(candidate, null, 2)}\n`);
  try {
    action();
  } finally {
    writeFileSync(fixturePackagePath, original);
  }
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

function runLint(targets: string | readonly string[], options: readonly string[] = []) {
  return spawnSync(oxlint, [...options, ...(typeof targets === "string" ? [targets] : targets)], {
    cwd: fixtureDirectory,
    encoding: "utf8",
  });
}

function output(result: ReturnType<typeof runLint>): string {
  return `${result.stdout}\n${result.stderr}`;
}

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

test("Oxlint 1.75.0 enforces all 36 default role edges", () => {
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

test("Oxlint covers static dependency forms, extension and index resolution, package imports, and unresolved locals", () => {
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
      "src/client/unsupported-package-import.js": 'import "#blocked/manager/value.js";\n',
    },
    () => {
      const unresolvedPackage = runLint("src/client/unresolved-package.js");
      assert.equal(unresolvedPackage.status, 1, output(unresolvedPackage));
      assert.match(output(unresolvedPackage), /righting\/unresolved-local-import/);
      withPackage(
        {
          private: true,
          type: "module",
          imports: {
            "#*": "./src/utility/value.js",
            "#blocked/*": { default: "./src/*" },
          },
        },
        () => {
          const unsupported = runLint("src/client/unsupported-package-import.js");
          assert.equal(unsupported.status, 1, output(unsupported));
          assert.match(output(unsupported), /righting\/unresolved-local-import/);
        },
      );
    },
  );
  const unresolved = runLint("src/client/unresolved.js");
  assert.equal(unresolved.status, 1, output(unresolved));
  assert.match(output(unresolved), /righting\/unresolved-local-import/);
});

test("Oxlint gives canonical and project aliases the same role semantics", () => {
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
});

test("Oxlint classifies every canonical filename and directory convention", () => {
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

test("Oxlint consumes normalized variations and overrides and rejects unsupported static capabilities", () => {
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

  withPolicy(policy({ protectedDependencies: [{ package: "protected-resource", role: "Resource" }] }), () => {
    const result = runLint("src/client/client.js");
    assert.equal(result.status, 1, output(result));
    assert.match(output(result), /unsupported capabilities: protected-dependency/);
  });
  withPolicy(
    policy({
      variations: ["contextFirewall"],
      scopes: [
        { kind: "context", name: "orders", path: "src/orders/**" },
        { kind: "shared", path: "src/shared/**" },
        { kind: "unscoped", path: "src/application/**" },
      ],
    }),
    () => {
      const result = runLint("src/client/client.js");
      assert.equal(result.status, 1, output(result));
      assert.match(output(result), /unsupported capabilities: context-firewall/);
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

test("Oxlint leaves source outside declared coverage unchecked", () => {
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

test("Oxlint reports unclassified and ambiguous covered source", () => {
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

test("Oxlint keeps test source visible while exempting only its outgoing dependencies", () => {
  withFiles(
    {
      "src/manager/forbidden.test.js": 'import { value } from "../client/value.js";\nexport { value };\n',
      "src/manager/target.test.js": 'export const value = "test";\n',
      "src/client/import-test.js": 'import { value } from "../manager/target.test.js";\nexport { value };\n',
      "src/tests/manager/forbidden.js": 'import { value } from "../../client/value.js";\nexport { value };\n',
      "src/tests/manager/target.js": 'export const value = "test directory";\n',
      "src/client/import-test-directory.js": 'import { value } from "../tests/manager/target.js";\nexport { value };\n',
    },
    () => {
      assert.equal(runLint(["src/manager/forbidden.test.js", "src/tests/manager/forbidden.js"]).status, 0);
      const production = runLint(["src/client/import-test.js", "src/client/import-test-directory.js"]);
      assert.equal(production.status, 1, output(production));
      assert.match(output(production), /righting\/test-dependency/);
    },
  );
});

test("Oxlint governs generated roles and keeps composition roots exact", () => {
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
    },
    () => {
      const result = runLint(["src/manager/suppressed.js", "src/suppressed-plain.js"], [
        "--report-unused-disable-directives",
      ]);
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
