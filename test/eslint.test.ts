import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
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
const fixtureDirectory = resolve(repositoryDirectory, "test/fixtures/dependency-conformance");
const fixturePackageDirectory = resolve(fixtureDirectory, "node_modules");
const fixtureRightingPackage = resolve(fixturePackageDirectory, "righting");
const fixturePolicyPath = resolve(fixtureDirectory, "righting.json");

function withPolicy(policy: object, action: () => void) {
  const originalPolicy = readFileSync(fixturePolicyPath, "utf8");
  writeFileSync(fixturePolicyPath, `${JSON.stringify(policy, null, 2)}\n`);

  try {
    action();
  } finally {
    writeFileSync(fixturePolicyPath, originalPolicy);
  }
}

function withFixtureFile(path: string, contents: string, action: () => void) {
  const fixturePath = resolve(fixtureDirectory, path);
  mkdirSync(dirname(fixturePath), { recursive: true });
  writeFileSync(fixturePath, contents);

  try {
    action();
  } finally {
    rmSync(fixturePath, { force: true });
  }
}

function runLint(targets: string | readonly string[]) {
  mkdirSync(fixturePackageDirectory, { recursive: true });
  symlinkSync(repositoryDirectory, fixtureRightingPackage, "dir");

  try {
    return spawnSync("npm", ["run", "lint", "--", ...(typeof targets === "string" ? [targets] : targets)], {
      cwd: fixtureDirectory,
      encoding: "utf8",
    });
  } finally {
    rmSync(fixtureRightingPackage, { recursive: true, force: true });
    rmSync(fixturePackageDirectory, { recursive: true, force: true });
  }
}

type RoleDependency = readonly [Role, Role];

function runRoleDependencies(dependencies: readonly RoleDependency[]) {
  const fixtureFiles = dependencies.map(([from, to]) => {
    const fromDirectory = roleDirectories[from];
    const toDirectory = roleDirectories[to];
    const target = `src/${fromDirectory}/conformance-to-${toDirectory}.js`;
    const fixturePath = resolve(fixtureDirectory, target);
    const dependencyPath = from === to ? "./value.js" : `../${toDirectory}/value.js`;

    writeFileSync(fixturePath, `import { value } from "${dependencyPath}";\n\nexport { value };\n`);
    return { fixturePath, target };
  });

  try {
    return { result: runLint(fixtureFiles.map(({ target }) => target)), targets: fixtureFiles.map(({ target }) => target) };
  } finally {
    for (const { fixturePath } of fixtureFiles) {
      rmSync(fixturePath, { force: true });
    }
  }
}

test("fixture conformance suite enforces every default volatility@1 role edge", () => {
  const allowed: RoleDependency[] = [];
  const forbidden: RoleDependency[] = [];

  for (const from of roles) {
    for (const to of roles) {
      (allowedRoleEdges.has(`${from}:${to}` as RoleEdge) ? allowed : forbidden).push([from, to]);
    }
  }

  const allowedResult = runRoleDependencies(allowed).result;
  assert.equal(allowedResult.status, 0, `${allowedResult.stdout}\n${allowedResult.stderr}`);

  const forbiddenResult = runRoleDependencies(forbidden);
  const output = `${forbiddenResult.result.stdout}\n${forbiddenResult.result.stderr}`;
  assert.equal(forbiddenResult.result.status, 1, output);
  assert.match(output, /righting\/role-dependency/);
  for (const target of forbiddenResult.targets) {
    assert.ok(output.includes(target), target);
  }
});

test("fixture lint command treats allowed and forbidden dependencies equally in every static form", () => {
  const allowedResult = runLint(dependencyForms.map(({ allowed }) => allowed));
  assert.equal(allowedResult.status, 0, `${allowedResult.stdout}\n${allowedResult.stderr}`);

  const forbiddenResult = runLint(dependencyForms.map(({ forbidden }) => forbidden));
  const output = `${forbiddenResult.stdout}\n${forbiddenResult.stderr}`;
  assert.equal(forbiddenResult.status, 1, output);
  assert.match(output, /righting\/role-dependency/);
  for (const { forbidden } of dependencyForms) {
    assert.ok(output.includes(forbidden), forbidden);
  }
});

test("fixture lint command reports a forbidden Manager dependency with a stable policy key", () => {
  const result = runLint("src/manager/forbidden.js");
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1, output);
  assert.match(output, /righting\/role-dependency/);
  assert.match(output, /boundaries\/dependencies/);
});

test("fixture lint command preserves its existing lint configuration", () => {
  const result = runLint("src/client/existing-lint.js");
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 1, output);
  assert.match(output, /no-undef/);
});

test("aliases retain Client behavior and clientReadsAccess changes it only when configured", () => {
  const policy = {
    preset: "volatility@1",
    aliases: { screen: "Client", useCase: "Manager", gateway: "ResourceAccess" },
    mappings: [
      { alias: "screen", path: "src/client/**" },
      { alias: "useCase", path: "src/manager/**" },
      { alias: "gateway", path: "src/resource-access/**" },
    ],
  };

  withFixtureFile(
    "src/client/read-resource-access.js",
    'import { value } from "../resource-access/value.js";\n\nexport { value };\n',
    () => {
      withPolicy(policy, () => {
        const result = runLint("src/client/read-resource-access.js");
        const output = `${result.stdout}\n${result.stderr}`;
        assert.equal(result.status, 1, output);
        assert.match(output, /righting\/role-dependency/);
      });

      withPolicy({ ...policy, variations: ["clientReadsAccess"] }, () => {
        const result = runLint("src/client/read-resource-access.js");
        assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
      });
    },
  );
});

test("ordinary external dependencies remain allowed while protected dependencies follow role policy", () => {
  const policy = {
    preset: "volatility@1",
    aliases: { screen: "Client", gateway: "ResourceAccess", database: "Resource", tools: "Utility" },
    mappings: [
      { alias: "screen", path: "src/client/**" },
      { alias: "gateway", path: "src/resource-access/**" },
      { alias: "database", path: "src/resource/**", package: "protected-resource" },
      { alias: "tools", path: "src/utility/**", package: "protected-utility" },
    ],
  };

  withFixtureFile(
    "src/client/protected-dependencies.js",
    'import "node:assert";\nimport "protected-resource";\nimport "protected-utility";\n',
    () => {
      withFixtureFile("src/resource-access/protected-resource.js", 'import "protected-resource";\n', () => {
        withPolicy(policy, () => {
          const clientResult = runLint("src/client/protected-dependencies.js");
          const clientOutput = `${clientResult.stdout}\n${clientResult.stderr}`;
          assert.equal(clientResult.status, 1, clientOutput);
          assert.match(clientOutput, /righting\/role-dependency/);

          const accessResult = runLint("src/resource-access/protected-resource.js");
          assert.equal(accessResult.status, 0, `${accessResult.stdout}\n${accessResult.stderr}`);
        });
      });
    },
  );
});

test("pureEngines and named role-edge overrides change only the configured edge", () => {
  const policy = {
    preset: "volatility@1",
    aliases: { screen: "Client", calculation: "Engine", gateway: "ResourceAccess", database: "Resource" },
    mappings: [
      { alias: "screen", path: "src/client/**" },
      { alias: "calculation", path: "src/engine/**" },
      { alias: "gateway", path: "src/resource-access/**" },
      { alias: "database", path: "src/resource/**" },
    ],
  };

  withFixtureFile(
    "src/engine/read-access.js",
    'import { value } from "../resource-access/value.js";\n\nexport { value };\n',
    () => {
      withFixtureFile(
        "src/client/read-resource.js",
        'import { value } from "../resource/value.js";\n\nexport { value };\n',
        () => {
          withPolicy(policy, () => {
            assert.equal(runLint("src/engine/read-access.js").status, 0);
            const result = runLint("src/client/read-resource.js");
            assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
          });

          withPolicy({ ...policy, variations: ["pureEngines"] }, () => {
            const result = runLint("src/engine/read-access.js");
            assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
          });

          withPolicy(
            {
              ...policy,
              overrides: [
                {
                  name: "client-reads-resource",
                  from: "Client",
                  to: "Resource",
                  effect: "allow",
                  reason: "The source is a deliberately global read model.",
                },
              ],
            },
            () => {
              assert.equal(runLint("src/client/read-resource.js").status, 0);
            },
          );
        },
      );
    },
  );
});

test("strict policy validation rejects unmapped imports, ambiguous matches, and waiver-like configuration", () => {
  const policy = {
    preset: "volatility@1",
    aliases: { screen: "Client", useCase: "Manager" },
    mappings: [
      { alias: "screen", path: "src/client/**" },
      { alias: "useCase", path: "src/manager/**" },
    ],
  };

  withFixtureFile("src/unmapped/value.js", 'export const value = "unmapped";\n', () => {
    withFixtureFile(
      "src/client/import-unmapped.js",
      'import { value } from "../unmapped/value.js";\n\nexport { value };\n',
      () => {
        withPolicy(policy, () => {
          const result = runLint("src/client/import-unmapped.js");
          const output = `${result.stdout}\n${result.stderr}`;
          assert.equal(result.status, 1, output);
          assert.match(output, /righting\/unresolved-local-import/);
        });
      },
    );
  });

  withPolicy(
    {
      ...policy,
      aliases: { ...policy.aliases, overlapping: "Engine" },
      mappings: [...policy.mappings, { alias: "overlapping", path: "src/**" }],
    },
    () => {
      const result = runLint("src/client/client.js");
      assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
      assert.match(`${result.stdout}\n${result.stderr}`, /maps .* ambiguously/);
    },
  );

  withPolicy(
    {
      ...policy,
      variations: ["contextFirewall"],
      scopes: [
        { kind: "context", name: "orders", path: "src/client/**" },
        { kind: "shared", path: "src/client/**" },
      ],
    },
    () => {
      const result = runLint("src/client/client.js");
      assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
      assert.match(`${result.stdout}\n${result.stderr}`, /scope policy maps .* ambiguously/);
    },
  );

  withPolicy(
    {
      ...policy,
      variations: ["contextFirewall"],
      scopes: [
        { kind: "context", name: "orders", path: "src/client/**" },
        { kind: "shared", path: "src/manager/**" },
        { kind: "unscoped", path: "src/application/**" },
      ],
    },
    () => {
      const result = runLint("src/client/client.js");
      assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    },
  );

  withPolicy({ ...policy, waivers: [{ path: "src/client/client.js" }] }, () => {
    const result = runLint("src/client/client.js");
    assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
    assert.match(`${result.stdout}\n${result.stderr}`, /unsupported property "waivers"/);
  });

  withPolicy(
    {
      ...policy,
      overrides: [{ name: "unexplained", from: "Client", to: "Resource", effect: "allow" }],
    },
    () => {
      const result = runLint("src/client/client.js");
      assert.equal(result.status, 2, `${result.stdout}\n${result.stderr}`);
      assert.match(`${result.stdout}\n${result.stderr}`, /override 0 reason/);
    },
  );
});
