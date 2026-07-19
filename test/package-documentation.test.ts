import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const packagedResources = [
  "dist/src/cli.js",
  "dist/src/capabilities.js",
  "skills/righting-design-review/SKILL.md",
  "skills/righting-eslint/SKILL.md",
  "skills/righting-integrate/SKILL.md",
  "README.md",
  "docs/manual-maintainer.md",
  "docs/agent-assisted.md",
  "docs/policy-language.md",
  "docs/capabilities.md",
  "docs/eslint.md",
  "docs/legacy-debt.md",
  "docs/dogfood.md",
];

function run(command: string, arguments_: string[]) {
  return spawnSync(command, arguments_, { cwd: repositoryDirectory, encoding: "utf8" });
}

test("the packed package publishes every onboarding reference without the retired docs command", () => {
  const packageDirectory = mkdtempSync(resolve(tmpdir(), "righting-package-docs-"));

  try {
    const packed = run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", packageDirectory]);
    assert.equal(packed.status, 0, packed.stderr);
    const filename = (JSON.parse(packed.stdout) as Array<{ filename: string }>)[0]?.filename;
    if (filename === undefined) {
      throw new Error("npm pack did not report a tarball");
    }

    const tarball = resolve(packageDirectory, filename);
    const listed = run("tar", ["-tzf", tarball]);
    assert.equal(listed.status, 0, listed.stderr);
    const files = new Set(listed.stdout.trim().split("\n").map((path) => path.replace(/^package\//, "")));

    for (const resource of packagedResources) {
      assert.ok(files.has(resource), `${resource} is missing from the package`);
    }
    assert.equal(files.has("dist/src/docs.js"), false);

    const extracted = run("tar", ["-xzf", tarball, "-C", packageDirectory]);
    assert.equal(extracted.status, 0, extracted.stderr);
    for (const resource of packagedResources) {
      assert.doesNotMatch(readFileSync(resolve(packageDirectory, "package", resource), "utf8"), /righting docs/);
    }
  } finally {
    rmSync(packageDirectory, { recursive: true, force: true });
  }
});
