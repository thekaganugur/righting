#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

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

function replaceManagedGuidance(existing: string | undefined): string {
  if (existing === undefined) {
    return `${managedGuidance}\n`;
  }

  const starts = existing.split(managedStart).length - 1;
  const ends = existing.split(managedEnd).length - 1;

  if (starts === 0 && ends === 0) {
    const separator = existing.endsWith("\n") ? "\n" : "\n\n";
    return `${existing}${separator}${managedGuidance}\n`;
  }

  const start = existing.indexOf(managedStart);
  const end = existing.indexOf(managedEnd);
  if (starts !== 1 || ends !== 1 || start > end) {
    throw new Error("AGENTS.md has an invalid Righting-managed block; repair it before rerunning init.");
  }

  return `${existing.slice(0, start)}${managedGuidance}${existing.slice(end + managedEnd.length)}`;
}

function initialize(projectDirectory: string) {
  const policyPath = resolve(projectDirectory, "righting.json");
  const guidancePath = resolve(projectDirectory, "AGENTS.md");
  const policyCreated = !existsSync(policyPath);
  const existingGuidance = existsSync(guidancePath) ? readFileSync(guidancePath, "utf8") : undefined;
  const guidance = replaceManagedGuidance(existingGuidance);

  if (policyCreated) {
    writeFileSync(policyPath, starterPolicy, { encoding: "utf8", flag: "wx" });
  }

  writeFileSync(guidancePath, guidance, "utf8");

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

function main(arguments_: string[]): void {
  const [command, ...options] = arguments_;
  const json = options.length === 1 && options[0] === "--json";

  if (command !== "init" || (options.length !== 0 && !json)) {
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
}

try {
  main(process.argv.slice(2));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`righting: ${message}\n`);
  process.exitCode = 1;
}
