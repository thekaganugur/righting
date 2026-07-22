import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const cliPath = resolve(testDirectory, "../src/cli.js");
const managedStart = "<!-- righting:managed:start -->";
const managedEnd = "<!-- righting:managed:end -->";
const policyPointer = "This project has a Righting architecture policy in `righting.json`.\nRead it before changing mapped code.";
const skills = ["righting-design-review", "righting-eslint", "righting-integrate"];

function createProject(): string {
  return mkdtempSync(resolve(tmpdir(), "righting-init-"));
}

function run(projectDirectory: string, ...arguments_: string[]) {
  return spawnSync(process.execPath, [cliPath, ...arguments_], {
    cwd: projectDirectory,
    encoding: "utf8",
    input: "",
  });
}

function json(result: ReturnType<typeof run>): Record<string, unknown> {
  assert.notEqual(result.stdout, "", result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

function assertSuccessEnvelope(result: ReturnType<typeof run>) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, "init");
  assert.equal(output.ok, true);
  return output;
}

function assertFailureEnvelope(result: ReturnType<typeof run>, code: string, path: string | undefined, nextAction: string) {
  assert.notEqual(result.status, 0);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, "init");
  assert.equal(output.ok, false);
  const error = output.error as { code: string; path?: string; message: string; nextAction: string };
  assert.equal(error.code, code);
  assert.equal(error.path, path);
  assert.equal(error.nextAction, nextAction);
  assert.match(error.message, /.+/);
}

const validPolicy = `${JSON.stringify(
  {
    preset: "volatility@1",
    aliases: { page: "Client", useCase: "Manager" },
    mappings: [
      { alias: "page", path: "src/page/**" },
      { alias: "useCase", path: "src/use-case/**" },
    ],
  },
  null,
  2,
)}\n`;

test("righting init creates only the exact starter and minimal policy pointer", () => {
  const projectDirectory = createProject();

  try {
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), "# Project guidance\n\nKeep this project-owned instruction.\n");

    const output = assertSuccessEnvelope(run(projectDirectory, "init", "--json"));
    assert.deepEqual(output.policy, {
      path: "righting.json",
      created: true,
      status: "incomplete",
      required: ["aliases", "mappings", "maintainer-approval"],
    });
    assert.equal(output.nextAction, "obtain-policy-approval");
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "righting.json"), "utf8")), {
      preset: "volatility@1",
      status: "incomplete",
    });

    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /Keep this project-owned instruction\./);
    assert.match(guidance, new RegExp(`${managedStart}\n${policyPointer}\n${managedEnd}`));
    assert.doesNotMatch(guidance, /Righting setup|righting init --skills|aliases|mappings/i);

    const repeat = assertSuccessEnvelope(run(projectDirectory, "init", "--json"));
    assert.deepEqual(repeat.policy, {
      path: "righting.json",
      created: false,
      status: "incomplete",
      required: ["aliases", "mappings", "maintainer-approval"],
    });
    assert.equal(repeat.nextAction, "obtain-policy-approval");
    assert.deepEqual(repeat.guidance, { path: "AGENTS.md", updated: false });
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);

    const humanReadable = run(projectDirectory, "init");
    assert.equal(humanReadable.status, 0, humanReadable.stderr);
    assert.match(humanReadable.stdout, /Kept Righting-managed guidance/);
    assert.match(humanReadable.stdout, /define and approve the replacement/i);
    assert.match(humanReadable.stdout, /node_modules\/righting\/docs\/manual-maintainer\.md/);
    assert.match(humanReadable.stdout, /righting init --skills/);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init preserves a valid policy without claiming approval or adapter activation", () => {
  const projectDirectory = createProject();
  const priorGuidance = `# Project guidance\n\nKeep this before.\n\n${managedStart}\nOutdated Righting guidance.\n${managedEnd}\n\nKeep this after.\n`;

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), validPolicy);
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), priorGuidance);

    const output = assertSuccessEnvelope(run(projectDirectory, "init", "--json"));
    assert.deepEqual(output.policy, { path: "righting.json", created: false, status: "valid" });
    assert.equal("nextAction" in output, false);
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), validPolicy);

    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /Keep this before\./);
    assert.match(guidance, /Keep this after\./);
    assert.doesNotMatch(guidance, /Outdated Righting guidance/);
    assert.match(guidance, new RegExp(`${managedStart}\n${policyPointer}\n${managedEnd}`));

    const humanReadable = run(projectDirectory, "init");
    assert.equal(humanReadable.status, 0, humanReadable.stderr);
    assert.match(humanReadable.stdout, /Kept Righting-managed guidance/);
    assert.doesNotMatch(humanReadable.stdout, /approval|adapter|onboarding complete/i);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init rejects a configured incomplete starter before changing the project", () => {
  const projectDirectory = createProject();
  const policy = '{"preset":"volatility@1","status":"incomplete","aliases":{"page":"Client"}}\n';
  const guidance = "# Project guidance\n\nKeep this untouched.\n";

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), guidance);

    const result = run(projectDirectory, "init", "--skills", "--json");
    assertFailureEnvelope(result, "invalid-policy", "righting.json", "repair-policy");
    assert.match((json(result).error as { message: string }).message, /may contain only.*preset.*status/i);
    assert.match((json(result).error as { message: string }).message, /replace.*remove.*incomplete/i);
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), policy);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
    assert.equal(existsSync(resolve(projectDirectory, ".agents")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init treats only the exact starter as incomplete", () => {
  const projectDirectory = createProject();
  const policy = '{"preset":"other@1","status":"incomplete"}\n';

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);

    const result = run(projectDirectory, "init", "--json");
    assertFailureEnvelope(result, "invalid-policy", "righting.json", "repair-policy");
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), policy);
    assert.equal(existsSync(resolve(projectDirectory, "AGENTS.md")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init reports malformed guidance as a structured failure before creating a policy", () => {
  const projectDirectory = createProject();
  const guidance = `# Project guidance\n\n${managedStart}\n`;

  try {
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), guidance);

    const result = run(projectDirectory, "init", "--json");
    assertFailureEnvelope(result, "invalid-managed-guidance", "AGENTS.md", "repair-managed-guidance");
    assert.match((json(result).error as { message: string }).message, /one start marker followed by one end marker/i);
    assert.equal(existsSync(resolve(projectDirectory, "righting.json")), false);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init --skills creates repeatable relative links and preflights collisions", () => {
  const projectDirectory = createProject();
  const collisionDirectory = createProject();
  const ancestorCollisionDirectory = createProject();
  const packagedSkillsDirectory = resolve(repositoryDirectory, "skills");

  try {
    const output = assertSuccessEnvelope(run(projectDirectory, "init", "--skills", "--json"));
    assert.deepEqual(output.skills, { path: ".agents/skills", linked: skills });

    for (const skill of skills) {
      const link = resolve(projectDirectory, ".agents/skills", skill);
      assert.ok(lstatSync(link).isSymbolicLink(), link);
      assert.equal(isAbsolute(readlinkSync(link)), false);
      assert.equal(resolve(dirname(link), readlinkSync(link)), resolve(packagedSkillsDirectory, skill));
    }

    const repeat = assertSuccessEnvelope(run(projectDirectory, "init", "--skills", "--json"));
    assert.deepEqual(repeat.skills, { path: ".agents/skills", linked: skills });

    const projectOwnedSkill = resolve(collisionDirectory, ".agents/skills/righting-eslint");
    mkdirSync(projectOwnedSkill, { recursive: true });
    writeFileSync(resolve(projectOwnedSkill, "SKILL.md"), "# Project-owned skill\n");

    const collision = run(collisionDirectory, "init", "--skills", "--json");
    assertFailureEnvelope(collision, "skill-collision", ".agents/skills/righting-eslint", "resolve-skill-collision");
    assert.equal(readFileSync(resolve(projectOwnedSkill, "SKILL.md"), "utf8"), "# Project-owned skill\n");
    assert.equal(existsSync(resolve(collisionDirectory, "righting.json")), false);
    assert.equal(existsSync(resolve(collisionDirectory, "AGENTS.md")), false);

    writeFileSync(resolve(ancestorCollisionDirectory, ".agents"), "Project-owned path\n");
    const ancestorCollision = run(ancestorCollisionDirectory, "init", "--skills", "--json");
    assertFailureEnvelope(ancestorCollision, "skill-collision", ".agents", "resolve-skill-collision");
    assert.equal(readFileSync(resolve(ancestorCollisionDirectory, ".agents"), "utf8"), "Project-owned path\n");
    assert.equal(existsSync(resolve(ancestorCollisionDirectory, "righting.json")), false);
    assert.equal(existsSync(resolve(ancestorCollisionDirectory, "AGENTS.md")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
    rmSync(collisionDirectory, { recursive: true, force: true });
    rmSync(ancestorCollisionDirectory, { recursive: true, force: true });
  }
});

test("righting help makes setup, configuration, and inspection discoverable without changing the project", () => {
  const projectDirectory = createProject();

  try {
    const root = run(projectDirectory, "--help");
    assert.equal(root.status, 0, root.stderr);
    assert.equal(root.stderr, "");
    assert.match(root.stdout, /Maintainer alone: righting init/);
    assert.match(root.stdout, /Compatible agent: righting init --skills --json/);

    const init = run(projectDirectory, "init", "--help", "--json");
    assert.equal(init.status, 0, init.stderr);
    assert.match(init.stdout, /does not infer or approve a policy/i);
    assert.match(init.stdout, /--skills/);

    const inspect = run(projectDirectory, "inspect", "--json", "-h");
    assert.equal(inspect.status, 0, inspect.stderr);
    assert.match(inspect.stdout, /does not check approval, ESLint activation, or lint results/i);

    const invalidRoot = run(projectDirectory, "--help", "unexpected");
    assert.notEqual(invalidRoot.status, 0);
    assert.match(invalidRoot.stderr, /Usage: righting init/);
    assert.equal(existsSync(resolve(projectDirectory, "righting.json")), false);
    assert.equal(existsSync(resolve(projectDirectory, "AGENTS.md")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init reports invalid options with the schema-version-1 failure envelope", () => {
  const projectDirectory = createProject();

  try {
    const result = run(projectDirectory, "init", "--json", "--unknown");
    assertFailureEnvelope(result, "invalid-options", undefined, "review-command-options");
    assert.equal(existsSync(resolve(projectDirectory, "righting.json")), false);
    assert.equal(existsSync(resolve(projectDirectory, "AGENTS.md")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
