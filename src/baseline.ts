import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { normalizeEslintSuppressions, type LegacyDebt } from "./suppressions.js";
import { isPolicyExpansion, readPolicy, readPolicySource } from "./policy.js";

const flatConfigNames = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.cts",
];
const legacyConfigNames = [".eslintrc", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc.yaml", ".eslintrc.yml"];
const suppressionsFile = "eslint-suppressions.json";

type AdapterInfo = {
  flatConfig: string;
  lintScript: string;
  typedLint: boolean;
};

type DebtGrowth = {
  file: string;
  rule: string;
  base: number;
  current: number;
};

type JsonRecord = Record<string, unknown>;

export type BaselineResult = {
  command: "baseline";
  base: string;
  adapter: AdapterInfo;
  policy: { changed: boolean; expanded: boolean };
  debt: {
    status: "within-baseline" | "migration-baseline";
    base: LegacyDebt;
    current: LegacyDebt;
    growth: DebtGrowth[];
  };
  migration: { reason: string } | undefined;
  limitations: [string];
};

function fail(message: string): never {
  throw new Error(message);
}

function record(value: unknown, description: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${description} must be a JSON object.`);
  }

  return value as JsonRecord;
}

function readJson(path: string, description: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`${description} could not be read: ${message}`);
  }
}

function eslintDependency(projectDirectory: string): string {
  const packagePath = resolve(projectDirectory, "package.json");
  if (!existsSync(packagePath)) {
    fail("Righting ESLint adapter requires package.json with an existing lint script.");
  }

  const packageJson = record(readJson(packagePath, "package.json"), "package.json");
  const scripts = record(packageJson.scripts, "package.json scripts");
  if (typeof scripts.lint !== "string" || scripts.lint.trim() === "") {
    fail("Righting ESLint adapter requires an existing package.json lint script.");
  }

  for (const field of ["dependencies", "devDependencies", "peerDependencies"] as const) {
    const dependencies = packageJson[field];
    if (typeof dependencies === "object" && dependencies !== null && !Array.isArray(dependencies)) {
      const version = (dependencies as JsonRecord).eslint;
      if (typeof version === "string" && version.trim() !== "") {
        return scripts.lint;
      }
    }
  }

  fail("Righting ESLint adapter requires ESLint to be declared by the existing project.");
}

function inspectEslintAdapter(projectDirectory: string): AdapterInfo {
  const flatConfig = flatConfigNames.find((name) => existsSync(resolve(projectDirectory, name)));
  if (flatConfig === undefined) {
    const legacyConfig = legacyConfigNames.find((name) => existsSync(resolve(projectDirectory, name)));
    if (legacyConfig !== undefined) {
      fail(`Legacy ESLint configuration is unsupported (${legacyConfig}); Righting will not migrate it.`);
    }
    fail("Righting ESLint adapter requires an existing modern ESLint flat config; it will not install or migrate ESLint.");
  }

  const lintScript = eslintDependency(projectDirectory);
  const config = readFileSync(resolve(projectDirectory, flatConfig), "utf8");
  return {
    flatConfig,
    lintScript,
    typedLint: /\bparserOptions\s*:\s*\{[\s\S]*?\bproject(?:Service)?\s*:/.test(config),
  };
}

function git(projectDirectory: string, arguments_: string[]): string {
  const result = spawnSync("git", arguments_, { cwd: projectDirectory, encoding: "utf8" });
  if (result.status !== 0) {
    fail(`Git ${arguments_.join(" ")} failed: ${result.stderr || result.stdout}`.trim());
  }
  return result.stdout;
}

function gitFile(projectDirectory: string, base: string, path: string): string | undefined {
  const projectPrefix = git(projectDirectory, ["rev-parse", "--show-prefix"]).trim();
  const result = spawnSync("git", ["show", `${base}:${projectPrefix}${path}`], { cwd: projectDirectory, encoding: "utf8" });
  return result.status === 0 ? result.stdout : undefined;
}

function baseDebt(projectDirectory: string, base: string): LegacyDebt {
  const source = gitFile(projectDirectory, base, suppressionsFile);
  if (source === undefined) {
    return {};
  }

  try {
    return normalizeEslintSuppressions(JSON.parse(source));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(`Base ${suppressionsFile} could not be normalized: ${message}`);
  }
}

function currentDebt(projectDirectory: string): LegacyDebt {
  const path = resolve(projectDirectory, suppressionsFile);
  return existsSync(path) ? normalizeEslintSuppressions(readJson(path, suppressionsFile)) : {};
}

function debtGrowth(base: LegacyDebt, current: LegacyDebt): DebtGrowth[] {
  const growth: DebtGrowth[] = [];
  for (const [file, rules] of Object.entries(current)) {
    for (const [rule, count] of Object.entries(rules)) {
      const previous = base[file]?.[rule] ?? 0;
      if (count > previous) {
        growth.push({ file, rule, base: previous, current: count });
      }
    }
  }
  return growth;
}

export function checkBaseline(
  projectDirectory: string,
  base: string,
  migrationReason: string | undefined,
): BaselineResult {
  const adapter = inspectEslintAdapter(projectDirectory);
  git(projectDirectory, ["rev-parse", "--verify", `${base}^{commit}`]);
  const policyPath = resolve(projectDirectory, "righting.json");
  const currentPolicy = readPolicy(policyPath);
  const currentPolicySource = readFileSync(policyPath, "utf8");
  const basePolicySource = gitFile(projectDirectory, base, "righting.json");
  const policyChanged = currentPolicySource !== basePolicySource;
  const policyExpanded =
    basePolicySource === undefined ||
    (policyChanged && isPolicyExpansion(readPolicySource(basePolicySource, policyPath), currentPolicy));
  const baseline = baseDebt(projectDirectory, base);
  const current = currentDebt(projectDirectory);
  const growth = debtGrowth(baseline, current);
  const hasMigrationReason = migrationReason !== undefined && migrationReason.trim() !== "";

  if (policyExpanded && !hasMigrationReason) {
    fail("Righting policy expanded; supply an explicit migration reason with --migration-reason.");
  }
  if (growth.length > 0) {
    if (!policyExpanded) {
      if (policyChanged && hasMigrationReason) {
        fail("Righting policy changed but does not expand enforcement; a migration reason cannot permit legacy debt growth.");
      }
      fail(`Righting legacy debt grew: ${growth.map(({ file, rule }) => `${file} (${rule})`).join(", ")}.`);
    }
  }

  return {
    command: "baseline",
    base,
    adapter,
    policy: { changed: policyChanged, expanded: policyExpanded },
    debt: {
      status: growth.length > 0 && policyExpanded ? "migration-baseline" : "within-baseline",
      base: baseline,
      current,
      growth,
    },
    migration: hasMigrationReason ? { reason: migrationReason } : undefined,
    limitations: [
      "Counts cannot distinguish a same-count violation swap within the same file and rule.",
    ],
  };
}
