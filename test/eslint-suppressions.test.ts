import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const fixtureDirectory = resolve(repositoryDirectory, "test/fixtures/eslint-suppressions-conformance");

function run(projectDirectory: string, ...arguments_: string[]) {
  return spawnSync("npm", ["run", "lint", "--", ...arguments_], {
    cwd: projectDirectory,
    encoding: "utf8",
  });
}

function output(result: ReturnType<typeof run>): string {
  return `${result.stdout}\n${result.stderr}`;
}

test("the adapter delegates legacy debt growth and pruning to native ESLint suppressions", () => {
  const projectDirectory = mkdtempSync(resolve(tmpdir(), "righting-eslint-suppressions-"));
  cpSync(fixtureDirectory, projectDirectory, { recursive: true });
  const linked = spawnSync("npm", ["link", repositoryDirectory, "--no-package-lock", "--omit=dev", "--ignore-scripts"], {
    cwd: projectDirectory,
    encoding: "utf8",
  });
  assert.equal(linked.status, 0, output(linked));
  symlinkSync(resolve(repositoryDirectory, "node_modules/.bin/eslint"), resolve(projectDirectory, "node_modules/.bin/eslint"));

  try {
    assert.equal(existsSync(resolve(projectDirectory, ".git")), false);

    const adopted = run(projectDirectory, "--suppress-rule", "righting/role-dependency", "src/manager/forbidden.js");
    assert.equal(adopted.status, 0, output(adopted));
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "eslint-suppressions.json"), "utf8")), {
      "src/manager/forbidden.js": { "righting/role-dependency": { count: 1 } },
    });

    const legacy = run(projectDirectory, "src/manager/forbidden.js");
    assert.equal(legacy.status, 0, output(legacy));

    const newViolation = run(projectDirectory, "src/manager/reexport-client.js");
    assert.equal(newViolation.status, 1, output(newViolation));
    assert.match(output(newViolation), /righting\/role-dependency/);

    writeFileSync(
      resolve(projectDirectory, "src/manager/forbidden.js"),
      'import { value } from "../engines/value.js";\n\nexport { value };\n',
    );
    const stale = run(projectDirectory, "src/manager/forbidden.js");
    assert.notEqual(stale.status, 0, output(stale));
    assert.match(output(stale), /suppressions left that do not occur/i);

    rmSync(resolve(projectDirectory, "src/manager/reexport-client.js"));
    const pruned = run(projectDirectory, "--prune-suppressions");
    assert.equal(pruned.status, 0, output(pruned));
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "eslint-suppressions.json"), "utf8")), {});
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
