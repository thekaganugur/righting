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
const policyPointer = "This project has a Righting architecture policy in `righting.json`.\nRead it before changing mapped code.";
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
    assert.match(readFileSync(resolve(projectDirectory, "node_modules/righting/docs/manual-maintainer.md"), "utf8"), /righting init/);
    assert.match(readFileSync(resolve(projectDirectory, "node_modules/righting/docs/eslint.md"), "utf8"), /eslintConfig\(\)/);

    const incomplete = assertSuccessEnvelope(righting(projectDirectory, "init", "--json"), "init", "incomplete");
    assert.equal((incomplete.policy as Json).created, false);
    assert.deepEqual((incomplete.policy as Json).required, ["aliases", "mappings", "maintainer-approval"]);
    assert.equal((incomplete.guidance as Json).path, "AGENTS.md");
    assert.equal((incomplete.guidance as Json).updated, false);
    assert.equal(incomplete.nextAction, "obtain-policy-approval");

    const incompleteInspection = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--json"), "inspect", "incomplete");
    assert.deepEqual((incompleteInspection.policy as Json).required, ["aliases", "mappings", "maintainer-approval"]);
    assert.equal(incompleteInspection.nextAction, "obtain-policy-approval");
    assert.equal("configuration" in incompleteInspection, false);
    assert.equal("effectivePolicy" in incompleteInspection, false);
    assert.equal("capabilities" in incompleteInspection, false);

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
    assert.equal((inspection.configuration as Json).preset, "volatility@1");
    assert.ok(Object.hasOwn(inspection.effectivePolicy as Json, "allowedDependencies"));
    assert.ok((inspection.capabilities as Json[]).some((capability) => capability.id === "role-dependency"));
    assert.deepEqual(
      {
        policy: readFileSync(resolve(projectDirectory, "righting.json"), "utf8"),
        guidance: readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"),
      },
      beforeInspection,
    );

    const all = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--all", "--json"), "inspect", "valid");
    assert.ok(Array.isArray(all.capabilities));
    assert.ok(Array.isArray(all.availableCapabilities));
    assert.equal((all.capabilities as Json[]).some((capability) => capability.id === "protected-dependency"), false);
    assert.ok((all.availableCapabilities as Json[]).some((capability) => capability.id === "protected-dependency"));

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
