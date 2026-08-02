import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assertSuccessEnvelope, type Json } from "./json-contract.js";
import { createPackedProject, packRighting, righting, runCommand } from "./packed-artifact.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const fixtureDirectory = resolve(repositoryDirectory, "test/fixtures/manual-maintainer");
const approvedPolicyPath = resolve(fixtureDirectory, "righting-approved.json");
const policyPointer = "This project has a Righting architecture policy in `righting.json`.\nBefore changing covered code, run `npx righting inspect --json` and use its normalized `contract`.\nAdapter activation remains unknown until separately verified.";
const skills = [
  "righting-integrate",
  "righting-adapter-authoring",
  "righting-deep-modules",
  "righting-volatility-review",
  "righting-module-design",
  "righting-domain-modeling",
];

test("a packed Righting artifact proves the agent-assisted JSON journey", () => {
  const packed = packRighting(repositoryDirectory, "righting-packed-agent-assisted-");
  const projectDirectory = createPackedProject(packed.tarball, fixtureDirectory, "righting-agent-assisted-");
  const collisionProjectDirectory = createPackedProject(packed.tarball, fixtureDirectory, "righting-agent-assisted-");

  try {
    const initialized = assertSuccessEnvelope(righting(projectDirectory, "init", "--skills", "--json"), "init", "incomplete");
    assert.equal((initialized.policy as Json).created, true);
    assert.deepEqual((initialized.policy as Json).required, ["coverage", "maintainer-approval"]);
    assert.equal(initialized.nextAction, "obtain-policy-approval");
    assert.deepEqual(initialized.skills, { path: ".agents/skills", claudePath: ".claude/skills", linked: skills });
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "righting.json"), "utf8")), {
      preset: "volatility@1",
      status: "incomplete",
    });
    assert.equal(
      readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"),
      `# Project guidance\n\nKeep this project-owned instruction.\n\n<!-- righting:managed:start -->\n${policyPointer}\n<!-- righting:managed:end -->\n`,
    );

    assert.equal(readFileSync(resolve(projectDirectory, "CLAUDE.md"), "utf8"), "@AGENTS.md\n");
    for (const directory of [".agents/skills", ".claude/skills"]) {
      for (const skill of skills) {
        const link = resolve(projectDirectory, directory, skill);
        const source = resolve(projectDirectory, "node_modules/righting/skills", skill);
        assert.ok(lstatSync(link).isSymbolicLink(), link);
        assert.equal(isAbsolute(readlinkSync(link)), false);
        assert.equal(resolve(dirname(link), readlinkSync(link)), source);
      }
    }
    const adapterAuthoringSkill = readFileSync(
      resolve(projectDirectory, ".agents/skills/righting-adapter-authoring/SKILL.md"),
      "utf8",
    );
    assert.match(adapterAuthoringSkill, /node_modules\/righting\/docs\/adapter-conformance\.md/);
    assert.match(adapterAuthoringSkill, /APPROVAL\.md/);
    assert.ok(existsSync(resolve(projectDirectory, ".agents/skills/righting-adapter-authoring/APPROVAL.md")));
    assert.ok(existsSync(resolve(projectDirectory, "node_modules/righting/docs/adapter-conformance.md")));

    const integrationSkill = readFileSync(resolve(projectDirectory, ".agents/skills/righting-integrate/SKILL.md"), "utf8");
    assert.match(integrationSkill, /dependency ledger[\s\S]*observed inconsistencies/i);
    assert.match(integrationSkill, /list the available guardrail adapters[\s\S]*recommend[\s\S]*maintainer explicitly chooses/i);
    assert.match(integrationSkill, /chooses ESLint[\s\S]*read `ESLINT\.md` completely/i);
    assert.ok(existsSync(resolve(projectDirectory, ".agents/skills/righting-integrate/ESLINT.md")));
    assert.equal(existsSync(resolve(projectDirectory, ".agents/skills/righting-eslint")), false);
    assert.match(
      integrationSkill,
      /decision brief[\s\S]*exact candidate `righting\.json`[\s\S]*raw inspection JSON out of the default reply/i,
    );
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
    const initResult = assertSuccessEnvelope(
      righting(collisionProjectDirectory, "init", "--skills", "--json"),
      "init",
      "incomplete",
    );
    assert.deepEqual(initResult.skills, { path: ".agents/skills", claudePath: ".claude/skills", linked: skills });
    assert.equal(readFileSync(resolve(collision, "SKILL.md"), "utf8"), "# Project-owned skill\n");
    assert.equal(lstatSync(collision).isSymbolicLink(), false);
    assert.equal(existsSync(resolve(collisionProjectDirectory, "righting.json")), true);
    assert.notEqual(readFileSync(resolve(collisionProjectDirectory, "AGENTS.md"), "utf8"), collisionGuidance);
    assert.ok(lstatSync(resolve(collisionProjectDirectory, ".agents/skills/righting-deep-modules")).isSymbolicLink());
    assert.ok(lstatSync(resolve(collisionProjectDirectory, ".agents/skills/righting-integrate")).isSymbolicLink());
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
    rmSync(collisionProjectDirectory, { recursive: true, force: true });
    rmSync(packed.directory, { recursive: true, force: true });
  }
});
