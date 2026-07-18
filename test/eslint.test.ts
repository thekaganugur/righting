import assert from "node:assert/strict";
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
