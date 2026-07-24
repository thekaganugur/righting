import assert from "node:assert/strict";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assertFailureEnvelope, assertSuccessEnvelope, type Json } from "./json-contract.js";
import { assertCommandSucceeded, createPackedProject, packRighting, righting, runCommand } from "./packed-artifact.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const fixtureDirectory = resolve(repositoryDirectory, "test/fixtures/manual-maintainer");
const policyPointer = "This project has a Righting architecture policy in `righting.json`.\nBefore changing covered code, run `npx righting inspect --json` and use its normalized `contract`.\nAdapter activation remains unknown until separately verified.";
const approvedPolicyPath = resolve(fixtureDirectory, "righting-approved.json");
const documentation = ["README.md", "docs/manual-maintainer.md", "docs/policy-language.md", "docs/capabilities.md", "docs/eslint.md", "docs/legacy-debt.md"];

test("a packed Righting artifact proves the manual-maintainer route and JSON contract", () => {
  const packed = packRighting(repositoryDirectory, "righting-packed-manual-");
  const projectDirectory = createPackedProject(packed.tarball, fixtureDirectory, "righting-manual-maintainer-");

  try {
    const initialized = righting(projectDirectory, "init");
    assertCommandSucceeded(initialized);
    assert.match(initialized.stdout, /Created righting\.json/);
    assert.match(initialized.stdout, /Optional compatible-agent support/);
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "righting.json"), "utf8")), {
      preset: "volatility@1",
      status: "incomplete",
    });
    assert.equal(
      readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"),
      `# Project guidance\n\nKeep this project-owned instruction.\n\n<!-- righting:managed:start -->\n${policyPointer}\n<!-- righting:managed:end -->\n`,
    );
    assert.equal(existsSync(resolve(projectDirectory, ".agents")), false);

    for (const resource of documentation) {
      assert.ok(existsSync(resolve(projectDirectory, "node_modules/righting", resource)), `${resource} is missing from the packed artifact`);
    }
    const manualRoute = readFileSync(resolve(projectDirectory, "node_modules/righting/docs/manual-maintainer.md"), "utf8");
    assert.match(manualRoute, /righting init/);
    assert.match(manualRoute, /available guardrail adapter[\s\S]*ESLint[\s\S]*separately choose/i);
    assert.match(manualRoute, /observed inconsistenc[\s\S]*adapter finding[\s\S]*adapter-native legacy debt[\s\S]*normal lint command/i);
    assert.match(readFileSync(resolve(projectDirectory, "node_modules/righting/docs/eslint.md"), "utf8"), /eslintConfig\(\)/);

    const publicSurface = runCommand(projectDirectory, process.execPath, [
      "--input-type=module",
      "--eval",
      'console.log(JSON.stringify({ core: Object.keys(await import("righting/core")), eslint: Object.keys(await import("righting/eslint")) }));',
    ]);
    assertCommandSucceeded(publicSurface);
    const exports = JSON.parse(publicSurface.stdout) as { core: string[]; eslint: string[] };
    assert.equal(exports.core.includes("isPolicyExpansion"), false);
    assert.equal(exports.eslint.includes("normalizeEslintSuppressions"), false);

    const incomplete = assertSuccessEnvelope(righting(projectDirectory, "init", "--json"), "init", "incomplete");
    assert.equal((incomplete.policy as Json).created, false);
    assert.deepEqual((incomplete.policy as Json).required, ["coverage", "maintainer-approval"]);
    assert.equal((incomplete.guidance as Json).path, "AGENTS.md");
    assert.equal((incomplete.guidance as Json).updated, false);
    assert.equal(incomplete.nextAction, "obtain-policy-approval");

    const incompleteInspection = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--json"), "inspect", "incomplete");
    assert.deepEqual((incompleteInspection.policy as Json).required, ["coverage", "maintainer-approval"]);
    assert.equal(incompleteInspection.nextAction, "obtain-policy-approval");
    assert.equal("contract" in incompleteInspection, false);

    writeFileSync(resolve(projectDirectory, "righting.json"), readFileSync(approvedPolicyPath, "utf8"));
    const valid = assertSuccessEnvelope(righting(projectDirectory, "init", "--json"), "init", "valid");
    assert.equal((valid.policy as Json).created, false);
    assert.equal("nextAction" in valid, false);

    const beforeInspection = {
      policy: readFileSync(resolve(projectDirectory, "righting.json"), "utf8"),
      guidance: readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"),
    };
    const inspection = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--json"), "inspect", "valid");
    assert.equal((inspection.adapter as Json).status, "unknown");
    const contract = inspection.contract as Json;
    assert.equal(contract.preset, "volatility@1");
    assert.ok(Object.hasOwn(contract.effective as Json, "allowedDependencies"));
    assert.ok((((contract.effective as Json).capabilities as Json[]).some((capability) => capability.id === "role-dependency")));
    assert.deepEqual(
      {
        policy: readFileSync(resolve(projectDirectory, "righting.json"), "utf8"),
        guidance: readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"),
      },
      beforeInspection,
    );

    const all = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--all", "--json"), "inspect", "valid");
    const capabilities = (((all.contract as Json).effective as Json).capabilities as Json[]);
    assert.equal(capabilities.find((capability) => capability.id === "protected-dependency")?.applies, false);
    assert.equal("availableCapabilities" in all, false);

    const lintScript = (JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8")) as { scripts: { lint: string } }).scripts.lint;
    const configPath = resolve(projectDirectory, "eslint.config.mjs");
    const existingConfig = readFileSync(configPath, "utf8");
    writeFileSync(
      configPath,
      `import { eslintConfig } from "righting/eslint";\n\n${existingConfig.replace("\n];\n", ",\n  eslintConfig(),\n];\n")}`,
    );
    assert.equal((JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8")) as { scripts: { lint: string } }).scripts.lint, lintScript);
    assert.match(readFileSync(configPath, "utf8"), /ignores: \["node_modules\/\*\*"\]/);
    const lint = runCommand(projectDirectory, "npm", ["run", "lint"]);
    assertCommandSucceeded(lint);
    assert.doesNotMatch(`${lint.stdout}\n${lint.stderr}`, /deprecated|boundaries.*warning/i);

    writeFileSync(resolve(projectDirectory, "righting.json"), '{"preset":"volatility@1","status":"incomplete","aliases":{"screen":"Client"}}\n');
    const malformed = assertFailureEnvelope(righting(projectDirectory, "inspect", "--json"), "inspect", "invalid-policy", "repair-policy");
    assert.equal((malformed.error as Json).path, "righting.json");
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
    rmSync(packed.directory, { recursive: true, force: true });
  }
});
