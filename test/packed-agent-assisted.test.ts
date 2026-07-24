import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assertFailureEnvelope, assertSuccessEnvelope, type Json } from "./json-contract.js";
import { createPackedProject, packRighting, righting, runCommand } from "./packed-artifact.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const fixtureDirectory = resolve(repositoryDirectory, "test/fixtures/manual-maintainer");
const approvedPolicyPath = resolve(fixtureDirectory, "righting-approved.json");
const policyPointer = "This project has a Righting architecture policy in `righting.json`.\nRead it before changing covered code.";
const skills = ["righting-design-review", "righting-eslint", "righting-integrate"];

test("a packed Righting artifact proves the agent-assisted JSON journey", () => {
  const packed = packRighting(repositoryDirectory, "righting-packed-agent-assisted-");
  const projectDirectory = createPackedProject(packed.tarball, fixtureDirectory, "righting-agent-assisted-");
  const collisionProjectDirectory = createPackedProject(packed.tarball, fixtureDirectory, "righting-agent-assisted-");

  try {
    const initialized = assertSuccessEnvelope(righting(projectDirectory, "init", "--skills", "--json"), "init", "incomplete");
    assert.equal((initialized.policy as Json).created, true);
    assert.deepEqual((initialized.policy as Json).required, ["coverage", "maintainer-approval"]);
    assert.equal(initialized.nextAction, "obtain-policy-approval");
    assert.deepEqual(initialized.skills, { path: ".agents/skills", linked: skills });
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "righting.json"), "utf8")), {
      preset: "volatility@1",
      status: "incomplete",
    });
    assert.equal(
      readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"),
      `# Project guidance\n\nKeep this project-owned instruction.\n\n<!-- righting:managed:start -->\n${policyPointer}\n<!-- righting:managed:end -->\n`,
    );

    for (const skill of skills) {
      const link = resolve(projectDirectory, ".agents/skills", skill);
      const source = resolve(projectDirectory, "node_modules/righting/skills", skill);
      assert.ok(lstatSync(link).isSymbolicLink(), link);
      assert.equal(isAbsolute(readlinkSync(link)), false);
      assert.equal(resolve(dirname(link), readlinkSync(link)), source);
    }

    const incompleteInspection = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--json"), "inspect", "incomplete");
    assert.deepEqual((incompleteInspection.policy as Json).required, ["coverage", "maintainer-approval"]);
    assert.equal(incompleteInspection.nextAction, "obtain-policy-approval");

    writeFileSync(resolve(projectDirectory, "righting.json"), readFileSync(approvedPolicyPath, "utf8"));
    const valid = assertSuccessEnvelope(righting(projectDirectory, "init", "--json"), "init", "valid");
    assert.equal((valid.policy as Json).created, false);
    assert.equal("nextAction" in valid, false);

    const inspection = assertSuccessEnvelope(righting(projectDirectory, "inspect", "--json"), "inspect", "valid");
    assert.equal((inspection.adapter as Json).status, "unknown");
    const contract = inspection.contract as Json;
    assert.equal(contract.preset, "volatility@1");
    assert.ok(((contract.effective as Json).capabilities as Json[]).some((capability) => capability.id === "role-dependency"));
    for (const retired of ["configuration", "effectivePolicy", "capabilities", "enforcementCoverage"]) {
      assert.equal(retired in inspection, false);
    }

    const consumer = runCommand(projectDirectory, process.execPath, [
      "--input-type=module",
      "--eval",
      'import { normalizePolicy, readPolicy } from "righting/core"; console.log(JSON.stringify(normalizePolicy(readPolicy("righting.json"))));',
    ]);
    assert.equal(consumer.status, 0, consumer.stderr);
    assert.deepEqual(JSON.parse(consumer.stdout), inspection.contract);

    const collisionGuidance = readFileSync(resolve(collisionProjectDirectory, "AGENTS.md"), "utf8");
    const collision = resolve(collisionProjectDirectory, ".agents/skills/righting-eslint");
    mkdirSync(collision, { recursive: true });
    writeFileSync(resolve(collision, "SKILL.md"), "# Project-owned skill\n");
    const refused = assertFailureEnvelope(righting(collisionProjectDirectory, "init", "--skills", "--json"), "init", "skill-collision", "resolve-skill-collision");
    assert.equal((refused.error as Json).path, relative(collisionProjectDirectory, collision));
    assert.equal(readFileSync(resolve(collision, "SKILL.md"), "utf8"), "# Project-owned skill\n");
    assert.equal(existsSync(resolve(collisionProjectDirectory, "righting.json")), false);
    assert.equal(readFileSync(resolve(collisionProjectDirectory, "AGENTS.md"), "utf8"), collisionGuidance);
    assert.equal(existsSync(resolve(collisionProjectDirectory, ".agents/skills/righting-design-review")), false);
    assert.equal(existsSync(resolve(collisionProjectDirectory, ".agents/skills/righting-integrate")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
    rmSync(collisionProjectDirectory, { recursive: true, force: true });
    rmSync(packed.directory, { recursive: true, force: true });
  }
});
