import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const packagedResources = [
  "dist/src/cli.js",
  "dist/src/policy.js",
  "dist/src/capabilities.js",
  "dist/src/suppressions.js",
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

function run(command: string, arguments_: string[], cwd = repositoryDirectory) {
  return spawnSync(command, arguments_, { cwd, encoding: "utf8" });
}

test("the integration skill keeps unsupported source treatments visible", () => {
  const skill = readFileSync(resolve(repositoryDirectory, "skills/righting-integrate/SKILL.md"), "utf8");
  const syntheticGeneratedPath = "source/catalog/catalog-map.auto.ts";

  assert.match(
    skill,
    /generated source[\s\S]*active generated convention[\s\S]*righting\/unclassified-source/,
    syntheticGeneratedPath,
  );
  assert.match(
    skill,
    /do not[\s\S]*(role|composition root)[\s\S]*hide[\s\S]*generated treatment/i,
    syntheticGeneratedPath,
  );
  assert.match(skill, /version-controlled file inventory[\s\S]*outside coverage/, "public/catalog-worker.js");
  assert.match(skill, /composition-root token[\s\S]*non-test[\s\S]*maintainer statement/, "source/launchpad.test.ts");
  assert.match(skill, /exact[\s\S]*contract[\s\S]*evidence[\s\S]*JSON[\s\S]*prose/i, "source/catalog.client.ts");
});

test("the integration skill keeps contextFirewall optional and context design separate", () => {
  const skill = readFileSync(resolve(repositoryDirectory, "skills/righting-integrate/SKILL.md"), "utf8");
  const start = skill.indexOf("### `contextFirewall`");
  const end = skill.indexOf("\nValidate the exact candidate", start);
  assert.ok(start >= 0 && end > start);
  const guidance = skill.slice(start, end);

  assert.match(guidance, /policy readiness[\s\S]*design suggestion/i);
  assert.match(guidance, /single-context[\s\S]*does not[\s\S]*(good|sound)/i);
  assert.match(guidance, /bounded-context specialist[\s\S]*optional[\s\S]*do not invoke/i);
  assert.match(guidance, /for each result[\s\S]*recommendation[\s\S]*pros and cons/i);
  assert.match(guidance, /one question at a time/i);
  assert.match(guidance, /do not[\s\S]*(infer|derive)[\s\S]*context policy[\s\S]*domain vocabulary alone/i);
});

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
    assert.equal(files.has("docs/agents/issue-tracker.md"), false);
    assert.equal(files.has("docs/agents/domain.md"), false);

    const consumerDirectory = resolve(packageDirectory, "consumer");
    mkdirSync(consumerDirectory);
    writeFileSync(resolve(consumerDirectory, "package.json"), '{"name":"consumer","private":true}\n');
    const installed = run("npm", ["install", "--save-dev", "--ignore-scripts", tarball], consumerDirectory);
    assert.equal(installed.status, 0, installed.stderr);
    const initialized = run("npx", ["righting", "init"], consumerDirectory);
    assert.equal(initialized.status, 0, initialized.stderr);
    assert.equal(existsSync(resolve(consumerDirectory, "node_modules/eslint")), false);
    assert.equal(existsSync(resolve(consumerDirectory, "node_modules/eslint-plugin-boundaries")), false);

    const extracted = run("tar", ["-xzf", tarball, "-C", packageDirectory]);
    assert.equal(extracted.status, 0, extracted.stderr);
    for (const resource of packagedResources) {
      assert.doesNotMatch(readFileSync(resolve(packageDirectory, "package", resource), "utf8"), /righting docs/);
    }
    for (const resource of ["dist/src/policy.js", "dist/src/policy.d.ts", "docs/policy-language.md", "docs/capabilities.md"]) {
      const contents = readFileSync(resolve(packageDirectory, "package", resource), "utf8");
      assert.doesNotMatch(contents, /eslint|suppression-file/i, `${resource} leaks adapter mechanics into the core contract`);
    }
  } finally {
    rmSync(packageDirectory, { recursive: true, force: true });
  }
});
