import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
const fixtureDirectory = mkdtempSync(resolve(repositoryDirectory, "node_modules/righting-eslint-conformance-"));
const fixturePackageDirectory = resolve(fixtureDirectory, "node_modules");
const fixtureRightingPackage = resolve(fixturePackageDirectory, "righting");
const fixturePolicyPath = resolve(fixtureDirectory, "righting.json");
const executableScenarioFamilyIds = new Set<ConformanceScenarioFamilyId>();

cpSync(sourceFixtureDirectory, fixtureDirectory, { recursive: true });

function conformanceTest(id: ConformanceScenarioFamilyId, name: string, run: () => void) {
  assert.equal(executableScenarioFamilyIds.has(id), false, `duplicate executable scenario family: ${id}`);
  executableScenarioFamilyIds.add(id);
  test(`${id}: ${name}`, run);
}

after(() => {
  try {
    assert.deepEqual(
      [...executableScenarioFamilyIds].sort(),
      [...Object.values(conformanceScenarioFamilyIds)].sort(),
      "every registered scenario family must have one executable family test",
    );
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

function withPolicy(candidate: object, action: () => void) {
  const original = readFileSync(fixturePolicyPath, "utf8");
  writeFileSync(fixturePolicyPath, `${JSON.stringify(candidate, null, 2)}\n`);
  try {
    action();
  } finally {
    writeFileSync(fixturePolicyPath, original);
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
    for (const path of Object.keys(files)) {
      rmSync(resolve(fixtureDirectory, path), { force: true });
    }
  }
}

function runLint(targets: string | readonly string[], options: readonly string[] = []) {
  mkdirSync(fixturePackageDirectory, { recursive: true });
  symlinkSync(repositoryDirectory, fixtureRightingPackage, "dir");
  try {
    return spawnSync("npm", ["run", "lint", "--", ...options, ...(typeof targets === "string" ? [targets] : targets)], {
      cwd: fixtureDirectory,
      encoding: "utf8",
    });
  } finally {
    rmSync(fixtureRightingPackage, { recursive: true, force: true });
    rmSync(fixturePackageDirectory, { recursive: true, force: true });
  }
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
      const path = `src/${fromDirectory}/conformance-to-${toDirectory}.js`;
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

conformanceTest(conformanceScenarioFamilyIds.defaultRoleEdges, "the packaged adapter enforces every default contract edge", () => {
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

conformanceTest(conformanceScenarioFamilyIds.staticDependencyForms, "the adapter covers every configured static dependency form", () => {
  const allowed = runLint(dependencyForms.map(({ allowed }) => allowed));
  assert.equal(allowed.status, 0, output(allowed));
  const forbidden = runLint(dependencyForms.map(({ forbidden }) => forbidden));
  assert.equal(forbidden.status, 1, output(forbidden));
  assert.match(output(forbidden), /righting\/role-dependency/);
  for (const { forbidden: target } of dependencyForms) assert.ok(output(forbidden).includes(target), target);
  const unresolved = runLint("src/client/unresolved.js");
  assert.equal(unresolved.status, 1, output(unresolved));
  assert.match(output(unresolved), /righting\/unresolved-local-import/);
});

conformanceTest(conformanceScenarioFamilyIds.canonicalAndAliasClassification, "canonical and alias conventions classify the same Client semantics", () => {
  withFiles(
    {
      "src/page.client.js": 'import { value } from "./work.manager.js";\nexport { value };\n',
      "src/work.manager.js": 'export const value = "manager";\n',
      "src/page.screen.js": 'import { value } from "./work.manager.js";\nexport { value };\n',
      "src/clients/page.js": 'import { value } from "../work.manager.js";\nexport { value };\n',
      "src/screens/page.js": 'import { value } from "../work.manager.js";\nexport { value };\n',
      "src/screens/page.client.js": 'import { value } from "../work.manager.js";\nexport { value };\n',
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
        },
      );
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.policyVariationsAndProtectedDependencies, "variations, overrides, and protected dependencies translate from the contract", () => {
  withFiles(
    {
      "src/client/read-access.js": 'import { value } from "../resource-access/value.js";\nexport { value };\n',
      "src/client/read-resource.js": 'import { value } from "../resource/value.js";\nexport { value };\n',
      "src/engine/read-access.js": 'import { value } from "../resource-access/value.js";\nexport { value };\n',
      "src/manager/protected.js": 'import "protected-resource";\n',
      "src/resource-access/protected.js": 'import "protected-resource";\n',
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
          protectedDependencies: [{ package: "protected-resource", role: "Resource" }],
        }),
        () => {
          assert.equal(runLint(["src/client/read-access.js", "src/client/read-resource.js"]).status, 0);
          const engine = runLint("src/engine/read-access.js");
          assert.equal(engine.status, 1, output(engine));
          assert.match(output(engine), /righting\/role-dependency/);
          const manager = runLint("src/manager/protected.js");
          assert.equal(manager.status, 1, output(manager));
          assert.match(output(manager), /righting\/role-dependency/);
          const access = runLint("src/resource-access/protected.js");
          assert.equal(access.status, 0, output(access));
        },
      );
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.declaredCoverage, "source outside declared coverage remains unchecked", () => {
  withFiles(
    {
      "outside/value.js": 'export const value = "outside";\n',
      "src/client/import-outside.js": 'import { value } from "../../outside/value.js";\nexport { value };\n',
    },
    () => {
      const result = runLint("src/client/import-outside.js");
      assert.equal(result.status, 0, output(result));
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.sourceClassificationViolations, "classification reports ambiguity and unclassified covered source", () => {
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

conformanceTest(conformanceScenarioFamilyIds.testSourceTreatment, "tests are visible but exempt only on outgoing role dependencies", () => {
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
      const outgoing = runLint(["src/manager/forbidden.test.js", "src/tests/manager/forbidden.js"]);
      assert.equal(outgoing.status, 0, output(outgoing));
      const production = runLint(["src/client/import-test.js", "src/client/import-test-directory.js"]);
      assert.equal(production.status, 1, output(production));
      assert.match(output(production), /righting\/test-dependency/);
      assert.ok(output(production).includes("src/client/import-test.js"));
      assert.ok(output(production).includes("src/client/import-test-directory.js"));
    },
  );
});

conformanceTest(conformanceScenarioFamilyIds.generatedSourceAndCompositionRoots, "generated source remains role-governed and composition roots remain non-role wiring", () => {
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
      assert.ok(output(generated).includes("src/manager/forbidden.generated.js"));
      assert.ok(output(generated).includes("src/generated/manager/forbidden.js"));
      const root = runLint("src/composition-root.js");
      assert.equal(root.status, 0, output(root));
      const production = runLint("src/client/import-root.js");
      assert.equal(production.status, 1, output(production));
      assert.match(output(production), /righting\/role-dependency/);
      const suffixCollision = runLint("src/manager/not-composition-root.js");
      assert.equal(suffixCollision.status, 1, output(suffixCollision));
      assert.match(output(suffixCollision), /Manager cannot depend on Client/);
    },
  );
});
