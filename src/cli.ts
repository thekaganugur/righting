#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkBaseline } from "./baseline.js";
import { renderPolicyGuidance } from "./docs.js";
import { readPolicy } from "./policy.js";

const managedStart = "<!-- righting:managed:start -->";
const managedEnd = "<!-- righting:managed:end -->";

const starterPolicy = `${JSON.stringify(
  {
    preset: "volatility@1",
    status: "incomplete",
  },
  null,
  2,
)}\n`;

const managedGuidance = `${managedStart}
## Righting guidance

\`righting.json\` selects \`volatility@1\` but is intentionally incomplete.

- No aliases, mappings, or enforced boundaries are configured yet. Do not infer them.
- Do not enable enforcement until a maintainer has supplied and approved architecture decisions about roles, mappings, scopes, and exceptions.
- No adapter is configured. Static adapters can only check source dependencies; they cannot prove runtime behavior.
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

function existingPolicyGuidance(policyPath: string): string {
  try {
    return `${managedStart}\n${renderPolicyGuidance(readPolicy(policyPath))}\n${managedEnd}`;
  } catch {
    return isIncompleteStarter(policyPath) ? managedGuidance : invalidPolicyGuidance;
  }
}

function updateGuidance(projectDirectory: string, content = managedGuidance): void {
  const path = guidancePath(projectDirectory);
  const existingGuidance = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  writeFileSync(path, replaceManagedGuidance(existingGuidance, content), "utf8");
}

function initialize(projectDirectory: string) {
  const policyPath = resolve(projectDirectory, "righting.json");
  const path = guidancePath(projectDirectory);
  const policyCreated = !existsSync(policyPath);
  const content = policyCreated ? managedGuidance : existingPolicyGuidance(policyPath);
  const guidance = replaceManagedGuidance(existsSync(path) ? readFileSync(path, "utf8") : undefined, content);

  if (policyCreated) {
    writeFileSync(policyPath, starterPolicy, { encoding: "utf8", flag: "wx" });
  }

  writeFileSync(path, guidance, "utf8");

  return {
    command: "init",
    policy: {
      path: "righting.json",
      created: policyCreated,
      status: policyCreated ? "incomplete" : "existing",
    },
    guidance: {
      path: "AGENTS.md",
      updated: true,
    },
  };
}

function generateDocs(projectDirectory: string) {
  const policy = readPolicy(resolve(projectDirectory, "righting.json"));
  const guidance = `${managedStart}\n${renderPolicyGuidance(policy)}\n${managedEnd}`;
  updateGuidance(projectDirectory, guidance);
  return {
    command: "docs",
    guidance: {
      path: "AGENTS.md",
      updated: true,
    },
  };
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
    const json = options.length === 1 && options[0] === "--json";
    if (options.length !== 0 && !json) {
      throw new Error("Usage: righting init [--json]");
    }

    const result = initialize(process.cwd());
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      return;
    }

    process.stdout.write(
      `${result.policy.created ? "Created" : "Kept"} righting.json. ${result.guidance.updated ? "Updated" : "Kept"} Righting-managed guidance in AGENTS.md.\n`,
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
    process.stdout.write("Updated Righting-managed guidance in AGENTS.md.\n");
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
    "Usage: righting init [--json] | righting docs [--json] | righting baseline --base <git-ref> [--migration-reason <reason>] [--json]",
  );
}

try {
  main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`righting: ${message}\n`);
  process.exitCode = 1;
}
