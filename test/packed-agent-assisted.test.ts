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
const policyPointer = "This project has a Righting architecture policy in `righting.json`.\nBefore changing covered code, run `npx righting inspect --json` and use its normalized `contract`.\nAdapter activation remains unknown until separately verified.";
const skills = [
  "righting-bounded-contexts",
  "righting-design-review",
  "righting-eslint",
  "righting-integrate",
  "write-righting-adapter",
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
    const adapterAuthoringSkill = readFileSync(
      resolve(projectDirectory, ".agents/skills/write-righting-adapter/SKILL.md"),
      "utf8",
    );
    assert.match(adapterAuthoringSkill, /node_modules\/righting\/docs\/adapter-conformance\.md/);
    assert.ok(existsSync(resolve(projectDirectory, "node_modules/righting/docs/adapter-conformance.md")));

    const integrationSkill = readFileSync(resolve(projectDirectory, ".agents/skills/righting-integrate/SKILL.md"), "utf8");
    assert.match(integrationSkill, /dependency ledger[\s\S]*observed inconsistencies/i);
    assert.match(integrationSkill, /list the available guardrail adapters[\s\S]*recommend[\s\S]*maintainer explicitly chooses/i);
    assert.match(integrationSkill, /unchanged normalized contract[\s\S]*righting-eslint/i);
    assert.match(
      integrationSkill,
      /recommend[^\n]*righting-bounded-contexts[\s\S]*pros and cons[\s\S]*ask permission[\s\S]*after approval[\s\S]*resume/i,
    );
    const boundedContextsSkill = readFileSync(
      resolve(projectDirectory, ".agents/skills/righting-bounded-contexts/SKILL.md"),
      "utf8",
    );
    assert.match(boundedContextsSkill, /Outcome[\s\S]*candidate[\s\S]*omit-for-now[\s\S]*unresolved/);
    assert.match(boundedContextsSkill, /explicit approval[\s\S]*complete strategic design/i);
    assert.match(boundedContextsSkill, /two bounded passes[\s\S]*highest-impact uncertainty/i);
    assert.match(boundedContextsSkill, /node_modules\/\.bin\/righting[\s\S]*PATH\/global executable is not project-local/i);
    assert.match(boundedContextsSkill, /referenced path is absent[\s\S]*not inspected/i);
    assert.match(boundedContextsSkill, /representative documented contract or producer\/consumer path/i);
    assert.match(boundedContextsSkill, /external actors\/services separately[\s\S]*not a reverse context exchange/i);
    assert.match(boundedContextsSkill, /verbatim project language[\s\S]*no grouped label[\s\S]*producer[\s\S]*return/i);
    assert.match(boundedContextsSkill, /approved-design-and-firewall\.md[\s\S]*completely/i);
    const boundedContextsApprovalBranch = readFileSync(
      resolve(projectDirectory, ".agents/skills/righting-bounded-contexts/references/approved-design-and-firewall.md"),
      "utf8",
    );
    assert.match(boundedContextsApprovalBranch, /classification universe[\s\S]*every version-controlled file/i);
    assert.match(boundedContextsApprovalBranch, /absolute project-local Righting executable/i);
    assert.match(boundedContextsApprovalBranch, /temporary mirror[\s\S]*inspect --json/i);

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
