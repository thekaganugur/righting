import assert from "node:assert/strict";
import { mkdirSync, rmSync, symlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

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

test("fixture lint command allows a Client to depend on a Manager", () => {
  const result = runLint("src/client/client.js");

  assert.equal(result.status, 0, result.stderr);
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
