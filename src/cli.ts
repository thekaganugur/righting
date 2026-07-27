#!/usr/bin/env node

import { existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inspectPolicy as inspect, renderInspection } from "./inspect.js";
import { incompletePolicyRequirements, isExactIncompleteStarterFile, readPolicy } from "./policy.js";

const managedStart = "<!-- righting:managed:start -->";
const managedEnd = "<!-- righting:managed:end -->";
const manualPolicyNext = 'define and approve coverage and any project conventions in righting.json, then remove "status": "incomplete"';
const agentPolicyNext = "ask your coding agent to use the righting-integrate skill to propose a policy for your approval";
const initUsage = "Usage: righting init [--skills] [--json]";
const inspectUsage = "Usage: righting inspect [--all] [--json]";
const rootUsage = "Usage: righting init [--skills] [--json] | righting inspect [--all] [--json]";
const rootHelp = [
  "Righting validates declared architecture policy; it does not infer architecture, approve decisions, or activate a guardrail adapter.",
  "",
  rootUsage,
  "",
  "First use:",
  "  Maintainer alone: righting init",
  "  Compatible agent: righting init --skills --json",
  "",
  "Run `righting init --help` or `righting inspect --help` for command details.",
].join("\n");
const initHelp = [
  "Create or preserve righting.json and the managed policy pointer in AGENTS.md.",
  "It does not infer or approve a policy.",
  "",
  initUsage,
  "",
  "Options:",
  "  --skills  Link packaged skills under .agents/skills and .claude/skills.",
  "  --json    Emit the stable machine-facing response.",
  "",
  `Next without --skills: ${manualPolicyNext}.`,
  `Next with --skills: ${agentPolicyNext}.`,
].join("\n");
const inspectHelp = [
  "Validate and explain the declared policy without changing the project.",
  "It does not check approval, guardrail-adapter activation, or lint results.",
  "",
  inspectUsage,
  "",
  "Options:",
  "  --all   Include available but unconfigured capabilities.",
  "  --json  Emit the machine-facing policy interpretation.",
].join("\n");
const rightingSkillNames = [
  "righting-bounded-contexts",
  "righting-design-review",
  "righting-eslint",
  "righting-integrate",
  "righting-adapter-authoring",
];
const packagedSkillsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../skills");

type InitErrorCode = "invalid-managed-guidance" | "invalid-options" | "invalid-policy" | "missing-packaged-skill" | "skill-collision";

class InitError extends Error {
  constructor(
    readonly code: InitErrorCode,
    message: string,
    readonly nextAction: string,
    readonly path?: string,
  ) {
    super(message);
  }
}

function failInit(code: InitErrorCode, message: string, nextAction: string, path?: string): never {
  throw new InitError(code, message, nextAction, path);
}

type SkillLink = {
  source: string;
  target: string;
};

type PlannedSkillLinks = {
  directories: string[];
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

const managedGuidance = `${managedStart}
This project has a Righting architecture policy in \`righting.json\`.
Before changing covered code, run \`npx righting inspect --json\` and use its normalized \`contract\`.
Adapter activation remains unknown until separately verified.
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
    failInit(
      "invalid-managed-guidance",
      "AGENTS.md has an invalid Righting-managed block; keep project-owned text and restore one start marker followed by one end marker before rerunning init.",
      "repair-managed-guidance",
      "AGENTS.md",
    );
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
  const directories = [resolve(projectDirectory, ".agents/skills"), resolve(projectDirectory, ".claude/skills")];
  for (const directory of directories) {
    for (const path of [dirname(directory), directory]) {
      if (pathExists(path) && !lstatSync(path).isDirectory()) {
        failInit(
          "skill-collision",
          `righting init --skills cannot use existing path "${relative(projectDirectory, path)}" as a skills directory.`,
          "resolve-skill-collision",
          relative(projectDirectory, path),
        );
      }
    }
  }
  const links = directories.flatMap((directory) =>
    rightingSkillNames.map((name) => {
      const source = resolve(packagedSkillsDirectory, name);
      if (!existsSync(resolve(source, "SKILL.md"))) {
        failInit(
          "missing-packaged-skill",
          `Righting package is missing the packaged skill "${name}".`,
          "reinstall-righting",
        );
      }

      const target = resolve(directory, name);
      if (pathExists(target)) {
        const expectedLink = lstatSync(target).isSymbolicLink() && resolve(dirname(target), readlinkSync(target)) === source;
        if (!expectedLink) {
          failInit(
            "skill-collision",
            `righting init --skills cannot replace existing skill "${relative(projectDirectory, target)}".`,
            "resolve-skill-collision",
            relative(projectDirectory, target),
          );
        }
      }
      return { source, target };
    }),
  );

  return { directories, links };
}

function linkSkills(plan: PlannedSkillLinks): void {
  for (const directory of plan.directories) {
    mkdirSync(directory, { recursive: true });
  }
  for (const { source, target } of plan.links) {
    if (!pathExists(target)) {
      symlinkSync(relative(dirname(target), source), target, "dir");
    }
  }
}

type PolicyStatus = "incomplete" | "valid";

type PolicyState = {
  status: PolicyStatus;
};

function inspectPolicy(policyPath: string): PolicyState {
  if (isExactIncompleteStarterFile(policyPath)) {
    return { status: "incomplete" };
  }

  try {
    readPolicy(policyPath);
    return { status: "valid" };
  } catch (error) {
    failInit(
      "invalid-policy",
      `${error instanceof Error ? error.message : String(error)} Repair righting.json, then rerun the command.`,
      "repair-policy",
      "righting.json",
    );
  }
}

function initPolicyResult(state: PolicyState, created: boolean) {
  return {
    path: "righting.json",
    created,
    status: state.status,
    ...(state.status === "incomplete" ? { required: incompletePolicyRequirements } : {}),
  };
}

function addClaudeGuidance(existing: string | undefined): string {
  if (existing === undefined) {
    return "@AGENTS.md\n";
  }
  if (/(^|\n)[^\S\n]*@AGENTS\.md[^\S\n]*(?=\n|$)/.test(existing)) {
    return existing;
  }
  const separator = existing.endsWith("\n") ? "\n" : "\n\n";
  return `${existing}${separator}@AGENTS.md\n`;
}

function initialize(projectDirectory: string, installSkills = false) {
  const policyPath = resolve(projectDirectory, "righting.json");
  const path = guidancePath(projectDirectory);
  const claudePath = resolve(projectDirectory, "CLAUDE.md");
  const policyCreated = !existsSync(policyPath);
  const state = policyCreated ? { status: "incomplete" as const } : inspectPolicy(policyPath);
  const existingGuidance = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  const guidance = replaceManagedGuidance(existingGuidance);
  const guidanceUpdated = existingGuidance !== guidance;
  const skills = installSkills ? planSkillLinks(projectDirectory) : undefined;
  const claudeGuidance =
    installSkills && (!pathExists(claudePath) || !lstatSync(claudePath).isSymbolicLink())
      ? addClaudeGuidance(existsSync(claudePath) ? readFileSync(claudePath, "utf8") : undefined)
      : undefined;

  if (policyCreated) {
    writeFileSync(policyPath, starterPolicy, { encoding: "utf8", flag: "wx" });
  }

  if (guidanceUpdated) {
    writeFileSync(path, guidance, "utf8");
  }
  if (claudeGuidance !== undefined) {
    writeFileSync(claudePath, claudeGuidance, "utf8");
  }
  if (skills !== undefined) {
    linkSkills(skills);
  }

  return {
    schemaVersion: 1,
    command: "init" as const,
    ok: true as const,
    policy: initPolicyResult(state, policyCreated),
    guidance: {
      path: "AGENTS.md",
      updated: guidanceUpdated,
    },
    ...(state.status === "incomplete" ? { nextAction: "obtain-policy-approval" } : {}),
    ...(skills === undefined
      ? {}
      : { skills: { path: ".agents/skills", claudePath: ".claude/skills", linked: rightingSkillNames } }),
  };
}

function isHelp(options: string[]): boolean {
  return options.includes("--help") || options.includes("-h");
}

function writeHelp(help: string): void {
  process.stdout.write(`${help}\n`);
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
      failInit("invalid-options", initUsage, "review-command-options");
    }
  }

  return { json, skills };
}

function inspectOptions(options: string[]): { all: boolean; json: boolean } {
  let all = false;
  let json = false;

  for (const option of options) {
    if (option === "--all" && !all) {
      all = true;
    } else if (option === "--json" && !json) {
      json = true;
    } else {
      failInit("invalid-options", inspectUsage, "review-command-options");
    }
  }

  return { all, json };
}

function main(arguments_: string[]): void {
  const [command, ...options] = arguments_;
  if (command === undefined) {
    writeHelp(rootHelp);
    return;
  }
  if (command === "--help" || command === "-h") {
    if (options.length === 0) {
      writeHelp(rootHelp);
      return;
    }
    throw new Error(rootUsage);
  }

  if (command === "init") {
    if (isHelp(options)) {
      writeHelp(initHelp);
      return;
    }
    const { json, skills } = initOptions(options);
    const result = initialize(process.cwd(), skills);
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    const next = result.policy.status === "incomplete" ? ` Next: ${skills ? agentPolicyNext : manualPolicyNext}.` : "";
    const agentSupport = skills
      ? " Linked Righting skills in .agents/skills and .claude/skills."
      : " Optional compatible-agent support: run righting init --skills.";
    process.stdout.write(
      `${result.policy.created ? "Created" : "Kept"} righting.json. ${result.guidance.updated ? "Updated" : "Kept"} Righting-managed guidance in AGENTS.md.${agentSupport}${next}\n`,
    );
    return;
  }

  if (command === "inspect") {
    if (isHelp(options)) {
      writeHelp(inspectHelp);
      return;
    }
    const { all, json } = inspectOptions(options);
    let result: ReturnType<typeof inspect>;
    try {
      result = inspect(resolve(process.cwd(), "righting.json"), all);
    } catch (error) {
      failInit(
        "invalid-policy",
        `${error instanceof Error ? error.message : String(error)} Repair righting.json, then rerun the command.`,
        "repair-policy",
        "righting.json",
      );
    }
    process.stdout.write(`${json ? JSON.stringify(result, null, 2) : renderInspection(result, all)}\n`);
    return;
  }

  throw new Error(rootUsage);
}

const arguments_ = process.argv.slice(2);

try {
  main(arguments_);
} catch (error) {
  if ((arguments_[0] === "init" || arguments_[0] === "inspect") && arguments_.includes("--json")) {
    const failure =
      error instanceof InitError
        ? error
        : new InitError("invalid-policy", error instanceof Error ? error.message : String(error), "repair-policy");
    process.stdout.write(
      `${JSON.stringify(
        {
          schemaVersion: 1,
          command: arguments_[0],
          ok: false,
          error: {
            code: failure.code,
            ...(failure.path === undefined ? {} : { path: failure.path }),
            message: failure.message,
            nextAction: failure.nextAction,
          },
        },
        null,
        2,
      )}\n`,
    );
  } else {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`righting: ${message}\n`);
  }
  process.exitCode = 1;
}
