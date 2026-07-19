#!/usr/bin/env node

import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkBaseline } from "./baseline.js";
import { renderPolicyGuidance } from "./docs.js";
import { readPolicy } from "./policy.js";

const managedStart = "<!-- righting:managed:start -->";
const managedEnd = "<!-- righting:managed:end -->";
const initUsage = "Usage: righting init [--skills] [--json]";
const rightingSkillNames = ["righting-design-review", "righting-eslint", "righting-integrate"];
const packagedSkillsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../skills");

type SkillLink = {
  source: string;
  target: string;
};

type PlannedSkillLinks = {
  directory: string;
  links: SkillLink[];
};

const starterPolicy = `${JSON.stringify(
  {
    preset: "volatility@1",
    status: "incomplete",
  },
  null,
  2,
)}\n`;

const starterPolicyExample = `{
  "preset": "volatility@1",
  "aliases": {
    "screen": "Client",
    "workflow": "Manager"
  },
  "mappings": [
    { "alias": "screen", "path": "src/screen/**" },
    { "alias": "workflow", "path": "src/workflow/**" }
  ]
}`;
const incompletePolicyRequirements = ["aliases", "mappings"] as const;

const managedGuidance = `${managedStart}
## Righting setup

\`righting.json\` selects \`volatility@1\` but is intentionally incomplete. Righting will not guess your architecture or enable enforcement yet.

### Complete the first policy

1. Choose only the code whose dependencies you want Righting to guard now. You can add mappings later.
2. Give each local name a canonical role: \`Client\` (interaction), \`Manager\` (workflow), \`Engine\` (decision), \`ResourceAccess\` (data or transport), \`Resource\` (external system), or \`Utility\` (stable shared code).
3. Add approved \`aliases\` and \`mappings\` to \`righting.json\`. An alias is your local name for a canonical role, such as \`screen\` for \`Client\`.

A minimal policy looks like:

\`\`\`json
${starterPolicyExample}
\`\`\`

Start without variations, scopes, or overrides unless you have a specific approved need. Once the policy is complete, run \`righting docs\` to refresh this guidance. Configure an enforcement adapter separately.

### Optional agent support

- Run \`righting init --skills\` to create relative symlinks to packaged Righting skills in \`.agents/skills\` for compatible agents.
- The \`righting-design-review\` workflow is advisory and never changes policy, CI, or project files automatically.
- Keep project-owned instructions outside this managed block.
${managedEnd}`;

const invalidPolicyGuidance = `${managedStart}
## Righting guidance

\`righting.json\` exists but does not contain a complete valid Righting policy.

- Righting enforcement remains blocked. Repair the policy, then run \`righting docs\` to generate policy guidance.
- Static adapters can only check source dependencies; they cannot prove runtime behavior.
- Keep project-owned instructions outside this managed block.
${managedEnd}`;

function replaceManagedGuidance(existing: string | undefined, guidance = managedGuidance): string {
  if (existing === undefined) {
    return `${guidance}\n`;
  }

  const starts = existing.split(managedStart).length - 1;
  const ends = existing.split(managedEnd).length - 1;

  if (starts === 0 && ends === 0) {
    const separator = existing.endsWith("\n") ? "\n" : "\n\n";
    return `${existing}${separator}${guidance}\n`;
  }

  const start = existing.indexOf(managedStart);
  const end = existing.indexOf(managedEnd);
  if (starts !== 1 || ends !== 1 || start > end) {
    throw new Error("AGENTS.md has an invalid Righting-managed block; repair it before rerunning init.");
  }

  return `${existing.slice(0, start)}${guidance}${existing.slice(end + managedEnd.length)}`;
}

function guidancePath(projectDirectory: string): string {
  return resolve(projectDirectory, "AGENTS.md");
}

function pathExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

function planSkillLinks(projectDirectory: string): PlannedSkillLinks {
  const directory = resolve(projectDirectory, ".agents/skills");
  const links = rightingSkillNames.map((name) => {
    const source = resolve(packagedSkillsDirectory, name);
    if (!existsSync(resolve(source, "SKILL.md"))) {
      throw new Error(`Righting package is missing the packaged skill "${name}".`);
    }

    const target = resolve(directory, name);
    if (pathExists(target)) {
      const expectedLink = lstatSync(target).isSymbolicLink() && resolve(dirname(target), readlinkSync(target)) === source;
      if (!expectedLink) {
        throw new Error(`righting init --skills cannot replace existing skill "${relative(projectDirectory, target)}".`);
      }
    }
    return { source, target };
  });

  return { directory, links };
}

function linkSkills(plan: PlannedSkillLinks): void {
  mkdirSync(plan.directory, { recursive: true });
  for (const { source, target } of plan.links) {
    if (!pathExists(target)) {
      symlinkSync(relative(dirname(target), source), target, "dir");
    }
  }
}

function isIncompleteStarter(policyPath: string): boolean {
  try {
    const policy = JSON.parse(readFileSync(policyPath, "utf8")) as Record<string, unknown>;
    return (
      typeof policy === "object" &&
      policy !== null &&
      !Array.isArray(policy) &&
      Object.keys(policy).length === 2 &&
      policy.preset === "volatility@1" &&
      policy.status === "incomplete"
    );
  } catch {
    return false;
  }
}

type PolicyStatus = "complete" | "incomplete" | "invalid";

type PolicyState = {
  status: PolicyStatus;
  guidance: string;
};

function inspectPolicy(policyPath: string): PolicyState {
  try {
    return {
      status: "complete",
      guidance: `${managedStart}\n${renderPolicyGuidance(readPolicy(policyPath))}\n${managedEnd}`,
    };
  } catch {
    return isIncompleteStarter(policyPath)
      ? { status: "incomplete", guidance: managedGuidance }
      : { status: "invalid", guidance: invalidPolicyGuidance };
  }
}

function policyResult(state: PolicyState, created?: boolean) {
  return {
    path: "righting.json",
    ...(created === undefined ? {} : { created }),
    status: state.status,
    ...(state.status === "incomplete" ? { required: incompletePolicyRequirements } : {}),
  };
}

function updateGuidance(projectDirectory: string, content = managedGuidance): void {
  const path = guidancePath(projectDirectory);
  const existingGuidance = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  writeFileSync(path, replaceManagedGuidance(existingGuidance, content), "utf8");
}

function initialize(projectDirectory: string, installSkills = false) {
  const skills = installSkills ? planSkillLinks(projectDirectory) : undefined;
  const policyPath = resolve(projectDirectory, "righting.json");
  const path = guidancePath(projectDirectory);
  const policyCreated = !existsSync(policyPath);
  const state = policyCreated ? { status: "incomplete" as const, guidance: managedGuidance } : inspectPolicy(policyPath);
  const guidance = replaceManagedGuidance(existsSync(path) ? readFileSync(path, "utf8") : undefined, state.guidance);

  if (policyCreated) {
    writeFileSync(policyPath, starterPolicy, { encoding: "utf8", flag: "wx" });
  }

  writeFileSync(path, guidance, "utf8");
  if (skills !== undefined) {
    linkSkills(skills);
  }

  return {
    command: "init",
    policy: policyResult(state, policyCreated),
    guidance: {
      path: "AGENTS.md",
      updated: true,
    },
    ...(skills === undefined ? {} : { skills: { path: ".agents/skills", linked: rightingSkillNames } }),
  };
}

function generateDocs(projectDirectory: string) {
  const policyPath = resolve(projectDirectory, "righting.json");
  const state = inspectPolicy(policyPath);
  if (state.status === "invalid") {
    readPolicy(policyPath);
  }
  updateGuidance(projectDirectory, state.guidance);
  return {
    command: "docs",
    policy: policyResult(state),
    guidance: {
      path: "AGENTS.md",
      updated: true,
    },
  };
}

function initOptions(options: string[]): { json: boolean; skills: boolean } {
  let json = false;
  let skills = false;

  for (const option of options) {
    if (option === "--json" && !json) {
      json = true;
    } else if (option === "--skills" && !skills) {
      skills = true;
    } else {
      throw new Error(initUsage);
    }
  }

  return { json, skills };
}

function baselineOptions(options: string[]): { base: string; migrationReason: string | undefined; json: boolean } {
  let base: string | undefined;
  let migrationReason: string | undefined;
  let json = false;

  for (let index = 0; index < options.length; index += 1) {
    const option = options[index];
    if (option === "--base" || option === "--migration-reason") {
      const value = options[index + 1];
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Usage: righting baseline --base <git-ref> [--migration-reason <reason>] [--json]`);
      }
      if (option === "--base") {
        if (base !== undefined) {
          throw new Error("Usage: righting baseline --base <git-ref> [--migration-reason <reason>] [--json]");
        }
        base = value;
      } else {
        if (migrationReason !== undefined) {
          throw new Error("Usage: righting baseline --base <git-ref> [--migration-reason <reason>] [--json]");
        }
        migrationReason = value;
      }
      index += 1;
    } else if (option === "--json" && !json) {
      json = true;
    } else {
      throw new Error("Usage: righting baseline --base <git-ref> [--migration-reason <reason>] [--json]");
    }
  }

  if (base === undefined) {
    throw new Error("Usage: righting baseline --base <git-ref> [--migration-reason <reason>] [--json]");
  }
  return { base, migrationReason, json };
}

function main(arguments_: string[]): void {
  const [command, ...options] = arguments_;
  if (command === "init") {
    const { json, skills } = initOptions(options);
    const result = initialize(process.cwd(), skills);
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const next =
      result.policy.status === "incomplete"
        ? " Next: add approved aliases and mappings to righting.json, then run righting docs. See the Righting setup section in AGENTS.md for roles and an example."
        : result.policy.status === "invalid"
          ? " Righting enforcement remains blocked until righting.json is valid."
          : "";
    process.stdout.write(
      `${result.policy.created ? "Created" : "Kept"} righting.json. ${result.guidance.updated ? "Updated" : "Kept"} Righting-managed guidance in AGENTS.md.${skills ? " Linked Righting skills in .agents/skills." : ""}${next}\n`,
    );
    return;
  }

  if (command === "docs") {
    const json = options.length === 1 && options[0] === "--json";
    if (options.length !== 0 && !json) {
      throw new Error("Usage: righting docs [--json]");
    }

    const result = generateDocs(process.cwd());
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      result.policy.status === "incomplete"
        ? "Righting is initialized but not enforcing anything yet. Add approved aliases and mappings to righting.json, then run righting docs again. See the Righting setup section in AGENTS.md for roles and an example.\n"
        : "Updated Righting-managed guidance in AGENTS.md.\n",
    );
    return;
  }

  if (command === "baseline") {
    const { base, migrationReason, json } = baselineOptions(options);
    const result = checkBaseline(process.cwd(), base, migrationReason);
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }
    process.stdout.write(
      `${result.debt.status === "migration-baseline" ? "Accepted migration baseline" : "Righting baseline is within policy"} against ${base}.\n`,
    );
    return;
  }

  throw new Error(
    "Usage: righting init [--skills] [--json] | righting docs [--json] | righting baseline --base <git-ref> [--migration-reason <reason>] [--json]",
  );
}

try {
  main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`righting: ${message}\n`);
  process.exitCode = 1;
}
