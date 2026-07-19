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

function createProject(): string {
  return mkdtempSync(resolve(tmpdir(), "righting-init-"));
}

function runInit(projectDirectory: string, json = false, skills = false) {
  return spawnSync(process.execPath, [cliPath, "init", ...(skills ? ["--skills"] : []), ...(json ? ["--json"] : [])], {
    cwd: projectDirectory,
    encoding: "utf8",
    input: "",
  });
}

function runDocs(projectDirectory: string, json = false) {
  return spawnSync(process.execPath, [cliPath, "docs", ...(json ? ["--json"] : [])], {
    cwd: projectDirectory,
    encoding: "utf8",
    input: "",
  });
}

test("righting init creates an incomplete starter policy and managed guidance", () => {
  const projectDirectory = createProject();

  try {
    writeFileSync(
      resolve(projectDirectory, "AGENTS.md"),
      "# Project guidance\n\nKeep this project-owned instruction.\n",
    );

    const result = runInit(projectDirectory, true);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      command: "init",
      policy: {
        path: "righting.json",
        created: true,
        status: "incomplete",
      },
      guidance: {
        path: "AGENTS.md",
        updated: true,
      },
    });
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "righting.json"), "utf8")), {
      preset: "volatility@1",
      status: "incomplete",
    });
    assert.equal(existsSync(resolve(projectDirectory, ".agents/skills")), false);

    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /Keep this project-owned instruction\./);
    assert.match(guidance, new RegExp(managedStart));
    assert.match(guidance, /intentionally incomplete/);
    assert.match(guidance, /No aliases, mappings, or enforced boundaries are configured yet/);
    assert.match(guidance, /Static adapters can only check source dependencies/);
    assert.match(guidance, /righting-design-review/);
    assert.match(guidance, /righting init --skills/);
    assert.match(guidance, new RegExp(managedEnd));

    const rerun = runInit(projectDirectory, true);

    assert.equal(rerun.status, 0, rerun.stderr);
    assert.deepEqual(JSON.parse(rerun.stdout), {
      command: "init",
      policy: {
        path: "righting.json",
        created: false,
        status: "existing",
      },
      guidance: {
        path: "AGENTS.md",
        updated: true,
      },
    });
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init --skills links packaged skills in the standard project location", () => {
  const projectDirectory = createProject();
  const skills = ["righting-design-review", "righting-eslint", "righting-integrate"];
  const packagedSkillsDirectory = resolve(repositoryDirectory, "skills");

  try {
    const result = runInit(projectDirectory, true, true);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      command: "init",
      policy: { path: "righting.json", created: true, status: "incomplete" },
      guidance: { path: "AGENTS.md", updated: true },
      skills: { path: ".agents/skills", linked: skills },
    });

    for (const skill of skills) {
      const link = resolve(projectDirectory, ".agents/skills", skill);
      assert.ok(lstatSync(link).isSymbolicLink(), link);
      assert.equal(isAbsolute(readlinkSync(link)), false);
      assert.equal(resolve(dirname(link), readlinkSync(link)), resolve(packagedSkillsDirectory, skill));
      assert.match(readFileSync(resolve(link, "SKILL.md"), "utf8"), new RegExp(`name: ${skill}`));
    }

    const rerun = runInit(projectDirectory, true, true);
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.deepEqual(JSON.parse(rerun.stdout).skills, { path: ".agents/skills", linked: skills });
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init --skills refuses to replace a project-owned skill", () => {
  const projectDirectory = createProject();
  const skillPath = resolve(projectDirectory, ".agents/skills/righting-eslint");

  try {
    mkdirSync(skillPath, { recursive: true });
    writeFileSync(resolve(skillPath, "SKILL.md"), "# Project-owned skill\n");

    const result = runInit(projectDirectory, true, true);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /cannot replace existing skill/i);
    assert.equal(readFileSync(resolve(skillPath, "SKILL.md"), "utf8"), "# Project-owned skill\n");
    assert.equal(existsSync(resolve(projectDirectory, "righting.json")), false);
    assert.equal(existsSync(resolve(projectDirectory, "AGENTS.md")), false);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init preserves an invalid existing policy and reports it accurately", () => {
  const projectDirectory = createProject();
  const policy = '{"preset":"project-owned-policy"}\n';

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);
    writeFileSync(
      resolve(projectDirectory, "AGENTS.md"),
      `# Project guidance\n\nKeep this before.\n\n${managedStart}\nOutdated Righting guidance.\n${managedEnd}\n\nKeep this after.\n`,
    );

    const result = runInit(projectDirectory, true);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      command: "init",
      policy: {
        path: "righting.json",
        created: false,
        status: "existing",
      },
      guidance: {
        path: "AGENTS.md",
        updated: true,
      },
    });
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), policy);

    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /Keep this before\./);
    assert.match(guidance, /Keep this after\./);
    assert.doesNotMatch(guidance, /Outdated Righting guidance/);
    assert.match(guidance, /does not contain a complete valid Righting policy/);
    assert.doesNotMatch(guidance, /selects `volatility@1`/);
    assert.doesNotMatch(guidance, /intentionally incomplete/);
    assert.equal(guidance.split(managedStart).length - 1, 1);
    assert.equal(guidance.split(managedEnd).length - 1, 1);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init does not mislabel an invalid incomplete-looking policy", () => {
  const projectDirectory = createProject();

  try {
    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      '{"preset":"not-volatility@1","status":"incomplete"}\n',
    );

    const result = runInit(projectDirectory, true);

    assert.equal(result.status, 0, result.stderr);
    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /does not contain a complete valid Righting policy/);
    assert.doesNotMatch(guidance, /selects `volatility@1`/);
    assert.doesNotMatch(guidance, /intentionally incomplete/);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting init refreshes valid existing policy guidance", () => {
  const projectDirectory = createProject();
  const policy = `${JSON.stringify(
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

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);
    writeFileSync(
      resolve(projectDirectory, "AGENTS.md"),
      `# Project guidance\n\n${managedStart}\nOutdated Righting guidance.\n${managedEnd}\n`,
    );

    const result = runInit(projectDirectory, true);

    assert.equal(result.status, 0, result.stderr);
    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /`page` \(Client\)/);
    assert.match(guidance, /`Client` → `Manager`, `Utility`/);
    assert.doesNotMatch(guidance, /intentionally incomplete/);
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), policy);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting docs generates durable policy guidance without replacing project instructions", () => {
  const projectDirectory = createProject();

  try {
    mkdirSync(resolve(projectDirectory, "src"));
    writeFileSync(resolve(projectDirectory, "CONTEXT.md"), "Not parsed by Righting.\n");
    writeFileSync(resolve(projectDirectory, "src/example.ts"), "Not judged by Righting.\n");
    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      `${JSON.stringify(
        {
          preset: "volatility@1",
          aliases: { page: "Client", useCase: "Manager" },
          mappings: [
            { alias: "page", path: "src/page/**" },
            { alias: "useCase", path: "src/use-case/**" },
          ],
          extras: {
            domainVocabulary: "CONTEXT.md",
            goldenExamples: { page: "src/example.ts" },
          },
        },
        null,
        2,
      )}\n`,
    );
    writeFileSync(
      resolve(projectDirectory, "AGENTS.md"),
      `# Project guidance\n\nKeep this before.\n\n${managedStart}\nOutdated Righting guidance.\n${managedEnd}\n\nKeep this after.\n`,
    );

    const result = runDocs(projectDirectory, true);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), {
      command: "docs",
      guidance: { path: "AGENTS.md", updated: true },
    });

    const guidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(guidance, /Keep this before\./);
    assert.match(guidance, /Keep this after\./);
    assert.doesNotMatch(guidance, /Outdated Righting guidance/);
    assert.match(guidance, /`page` \(Client\)/);
    assert.match(guidance, /`Client` → `Manager`, `Utility`/);
    assert.match(guidance, /lint-enforced/);
    assert.match(guidance, /partially checked/);
    assert.match(guidance, /guidance only/);
    assert.match(guidance, /righting-design-review/);
    assert.match(guidance, /righting init --skills/);
    assert.match(guidance, /`CONTEXT\.md`/);
    assert.match(guidance, /`src\/example\.ts`/);

    const rerun = runDocs(projectDirectory, true);
    assert.equal(rerun.status, 0, rerun.stderr);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting docs rejects missing agent references without changing guidance", () => {
  const projectDirectory = createProject();
  const guidance = "# Project guidance\n";

  try {
    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      `${JSON.stringify({
        preset: "volatility@1",
        aliases: { page: "Client" },
        mappings: [{ alias: "page", path: "src/page/**" }],
        extras: { domainVocabulary: "missing.md" },
      })}\n`,
    );
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), guidance);

    const result = runDocs(projectDirectory, true);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /domainVocabulary.*existing path/i);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting docs rejects agent references outside the project", () => {
  const projectDirectory = createProject();
  const externalDirectory = createProject();
  const guidance = "# Project guidance\n";

  try {
    const externalReference = resolve(externalDirectory, "vocabulary.md");
    writeFileSync(externalReference, "Outside the project.\n");
    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      `${JSON.stringify({
        preset: "volatility@1",
        aliases: { page: "Client" },
        mappings: [{ alias: "page", path: "src/page/**" }],
        extras: { domainVocabulary: relative(projectDirectory, externalReference) },
      })}\n`,
    );
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), guidance);

    const result = runDocs(projectDirectory, true);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /domainVocabulary.*project-relative/i);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
    rmSync(externalDirectory, { recursive: true, force: true });
  }
});

test("righting init leaves malformed managed guidance unchanged", () => {
  const projectDirectory = createProject();
  const guidance = `# Project guidance\n\n${managedStart}\n`;

  try {
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), guidance);

    const result = runInit(projectDirectory, true);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /invalid Righting-managed block/);
    assert.equal(existsSync(resolve(projectDirectory, "righting.json")), false);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
