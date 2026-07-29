import { readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, relative, sep } from "node:path";
import {
  classifySource,
  incompletePolicyRequirements,
  isExactIncompleteStarterFile,
  normalizePolicy,
  readPolicy,
  roles,
  type ContractCapability,
  type NormalizedContract,
  type Role,
} from "./policy.js";

const { isMatch } = createRequire(import.meta.url)("micromatch") as {
  isMatch(path: string, patterns: string | readonly string[]): boolean;
};

type IncompleteInspection = {
  schemaVersion: 1;
  command: "inspect";
  ok: true;
  policy: {
    path: "righting.json";
    status: "incomplete";
    required: typeof incompletePolicyRequirements;
  };
  adapter: { status: "unknown" };
  nextAction: "obtain-policy-approval";
};

type InspectionWarning = {
  code: "unmatched-coverage";
  path: string;
};

type ValidInspection = {
  schemaVersion: 1;
  command: "inspect";
  ok: true;
  policy: { path: "righting.json"; status: "valid" };
  adapter: { status: "unknown" };
  contract: NormalizedContract;
  evidence: {
    sourceSummary: {
      covered: number;
      roles: Record<Role, number>;
      tests: number;
      compositionRoots: number;
      unclassified: number;
      ambiguous: number;
    };
    sourceViolations: Array<{
      path: string;
      ruleId: "righting/unclassified-source" | "righting/ambiguous-source";
      roles?: Role[];
    }>;
  };
  warnings?: InspectionWarning[];
};

export type Inspection = IncompleteInspection | ValidInspection;

function projectFiles(projectDirectory: string): string[] {
  const files: string[] = [];
  const ignored = new Set([".git", "node_modules"]);
  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory() && !ignored.has(entry.name)) {
        visit(path);
      } else if (entry.isFile()) {
        files.push(relative(projectDirectory, path).split(sep).join("/"));
      }
    }
  }
  visit(projectDirectory);
  return files;
}

function sourceEvidence(contract: NormalizedContract, files: string[]): ValidInspection["evidence"] {
  const sourceSummary = {
    covered: 0,
    roles: Object.fromEntries(roles.map((role) => [role, 0])) as Record<Role, number>,
    tests: 0,
    compositionRoots: 0,
    unclassified: 0,
    ambiguous: 0,
  };
  const sourceViolations: ValidInspection["evidence"]["sourceViolations"] = [];

  for (const path of [...files].sort()) {
    const classification = classifySource(contract, path);
    if (classification.kind === "outside-coverage") {
      continue;
    }
    sourceSummary.covered++;
    if (classification.kind === "role") {
      sourceSummary.roles[classification.role]++;
      sourceSummary.tests += Number(classification.test);
    } else if (classification.kind === "test") {
      sourceSummary.tests++;
    } else if (classification.kind === "composition-root") {
      sourceSummary.compositionRoots++;
      sourceSummary.tests += Number(classification.test);
    } else {
      const kind = classification.ruleId === "righting/unclassified-source" ? "unclassified" : "ambiguous";
      sourceSummary[kind]++;
      sourceViolations.push({
        path,
        ruleId: classification.ruleId,
        ...(classification.ruleId === "righting/ambiguous-source" ? { roles: classification.roles } : {}),
      });
    }
  }

  return { sourceSummary, sourceViolations };
}

export function inspectPolicy(policyPath: string, _includeAll = false): Inspection {
  if (isExactIncompleteStarterFile(policyPath)) {
    return {
      schemaVersion: 1,
      command: "inspect",
      ok: true,
      policy: { path: "righting.json", status: "incomplete", required: incompletePolicyRequirements },
      adapter: { status: "unknown" },
      nextAction: "obtain-policy-approval",
    };
  }

  const contract = normalizePolicy(readPolicy(policyPath));
  const files = projectFiles(dirname(policyPath));
  const warnings = contract.configured.coverage.flatMap((path) =>
    files.some((file) => isMatch(file, path)) ? [] : [{ code: "unmatched-coverage" as const, path }],
  );
  return {
    schemaVersion: 1,
    command: "inspect",
    ok: true,
    policy: { path: "righting.json", status: "valid" },
    adapter: { status: "unknown" },
    contract,
    evidence: sourceEvidence(contract, files),
    ...(warnings.length === 0 ? {} : { warnings }),
  };
}

function list(items: readonly string[]): string {
  return items.length === 0 ? "None" : items.join(", ");
}

function renderCapability(capability: ContractCapability): string {
  return [
    `- ${capability.id} (${capability.coverage})`,
    `  Policy rules: ${list(capability.policyRuleIds)}`,
    `  Establishes: ${list(capability.establishes)}`,
    `  Does not establish: ${list(capability.doesNotEstablish)}`,
  ].join("\n");
}

export function renderInspection(inspection: Inspection, includeAll = false): string {
  const header = [`Righting policy: ${inspection.policy.status} (${inspection.policy.path})`];
  if ("nextAction" in inspection) {
    return [
      ...header,
      `Requires: ${inspection.policy.required.join(", ")}`,
      `Next action: ${inspection.nextAction}`,
      'Next: define and approve coverage and any project conventions in righting.json, then remove "status": "incomplete".',
      "With linked skills: ask your coding agent to use righting-integrate.",
      "Adapter activation: unknown (not checked)",
    ].join("\n");
  }

  const { contract } = inspection;
  const applicable = contract.effective.capabilities.filter((capability) => capability.applies);
  const available = contract.effective.capabilities.filter((capability) => !capability.applies);
  const aliases = contract.configured.aliases.map(
    (alias) =>
      `- ${alias.name}: ${alias.role}; suffixes ${list(alias.filenameSuffixes)}; directories ${list(alias.directorySegments)}`,
  );
  const overrides = contract.configured.overrides.map(
    (override) => `- ${override.name}: ${override.effect} ${override.from} -> ${override.to} (${override.reason})`,
  );
  const protectedDependencies = contract.configured.protectedDependencies.map(
    (dependency) => `- ${dependency.package}: ${dependency.role}`,
  );
  const relationships = Object.entries(contract.effective.allowedDependencies).map(
    ([role, allowed]) => `- ${role} -> ${allowed.join(", ")}`,
  );
  const goldenExamples = Object.entries(contract.configured.guidance.goldenExamples ?? {}).map(
    ([name, path]) => `- ${name}: ${path}`,
  );

  return [
    ...header,
    `Contract version: ${contract.contractVersion}`,
    "Policy syntax is valid; maintainer approval and adapter activation are not checked.",
    "Source coverage is limited to declared coverage patterns; all other files are unchecked.",
    ...(inspection.warnings === undefined
      ? [""]
      : ["", "Warnings", ...inspection.warnings.map((warning) => `- Coverage matches no current project file: ${warning.path}`), ""]),
    "Configured decisions",
    `Preset: ${contract.preset}`,
    `Coverage: ${list(contract.configured.coverage)}`,
    "Aliases",
    ...(aliases.length === 0 ? ["- None"] : aliases),
    `Generated filename markers: ${list(contract.configured.generated.filenameMarkers)}`,
    `Generated directories: ${list(contract.configured.generated.directorySegments)}`,
    `Composition roots: ${list(contract.configured.compositionRoots)}`,
    `Variations: ${list(contract.configured.variations)}`,
    "Overrides",
    ...(overrides.length === 0 ? ["- None"] : overrides),
    "Protected dependencies",
    ...(protectedDependencies.length === 0 ? ["- None"] : protectedDependencies),
    ...(Object.keys(contract.configured.guidance).length === 0
      ? []
      : [
          "Guidance",
          `Domain vocabulary: ${contract.configured.guidance.domainVocabulary ?? "None"}`,
          "Golden examples",
          ...(goldenExamples.length === 0 ? ["- None"] : goldenExamples),
        ]),
    "",
    "Effective role relationships",
    ...relationships,
    "",
    "Applicable capabilities",
    ...applicable.flatMap((capability) => renderCapability(capability).split("\n")),
    ...(includeAll && available.length > 0
      ? ["", "Available but unconfigured capabilities", ...available.flatMap((capability) => renderCapability(capability).split("\n"))]
      : []),
    "",
    "Adapter activation: unknown (not checked)",
  ].join("\n");
}
