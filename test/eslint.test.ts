import assert from "node:assert/strict";
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  allowedRoleEdges,
  forbiddenDependencyForms,
  roleDirectories,
  roles,
  type Role,
  type RoleEdge,
} from "./fixtures/dependency-conformance.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const fixtureDirectory = resolve(repositoryDirectory, "test/fixtures/policy-to-eslint");
const fixturePackageDirectory = resolve(fixtureDirectory, "node_modules");
const fixtureRightingPackage = resolve(fixturePackageDirectory, "righting");

function runLint(target: string) {
  mkdirSync(fixturePackageDirectory, { recursive: true });
  symlinkSync(repositoryDirectory, fixtureRightingPackage, "dir");

  try {
    return spawnSync("npm", ["run", "lint", "--", target], {
      cwd: fixtureDirectory,
      encoding: "utf8",
    });
  } finally {
    rmSync(fixtureRightingPackage, { recursive: true, force: true });
    rmSync(fixturePackageDirectory, { recursive: true, force: true });
  }
}

function runRoleDependency(from: Role, to: Role) {
  const fromDirectory = roleDirectories[from];
  const toDirectory = roleDirectories[to];
  const target = `src/${fromDirectory}/conformance-to-${toDirectory}.js`;
  const fixturePath = resolve(fixtureDirectory, target);
  const dependencyPath = from === to ? "./value.js" : `../${toDirectory}/value.js`;

  writeFileSync(fixturePath, `import { value } from "${dependencyPath}";\n\nexport { value };\n`);
  try {
    return runLint(target);
  } finally {
    rmSync(fixturePath, { force: true });
  }
}

test("fixture conformance suite enforces every default volatility@1 role edge", () => {
  for (const from of roles) {
    for (const to of roles) {
      const result = runRoleDependency(from, to);
      const output = `${result.stdout}\n${result.stderr}`;
      const dependency = `${from}:${to}` as RoleEdge;

      if (allowedRoleEdges.has(dependency)) {
        assert.equal(result.status, 0, `${dependency}\n${output}`);
      } else {
        assert.equal(result.status, 1, `${dependency}\n${output}`);
        assert.match(output, /righting\/role-dependency/, dependency);
      }
    }
  }
});

test("fixture lint command detects forbidden dependencies in every static form", () => {
  for (const target of forbiddenDependencyForms) {
    const result = runLint(target);
    const output = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 1, output);
    assert.match(output, /righting\/role-dependency/, target);
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
