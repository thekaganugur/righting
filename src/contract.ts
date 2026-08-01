import { createRequire } from "node:module";

const { isMatch } = createRequire(import.meta.url)("micromatch") as {
  isMatch(path: string, patterns: string | readonly string[]): boolean;
};

export type Role = "Client" | "Manager" | "Engine" | "ResourceAccess" | "Resource" | "Utility";

type AliasConvention = {
  name: string;
  role: Role;
  filenameSuffixes: string[];
  directorySegments: string[];
};

type GeneratedConvention = {
  filenameMarkers: string[];
  directorySegments: string[];
};

type ProtectedDependency = {
  package: string;
  role: "Resource" | "Utility";
};

type RoleEdgeOverride = {
  name: string;
  from: Role;
  to: Role;
  effect: "allow" | "disallow";
  reason: string;
};

type Guidance = {
  domainVocabulary?: string;
  goldenExamples?: Record<string, string>;
};

type ContractCapability = {
  id: string;
  applies: boolean;
  coverage: "statically-enforceable" | "partially-checkable" | "guidance-only";
  policyRuleIds: string[];
  establishes: string[];
  doesNotEstablish: string[];
};

export type NormalizedContract = {
  contractVersion: 2;
  preset: "volatility@1";
  roles: Role[];
  configured: {
    coverage: string[];
    aliases: AliasConvention[];
    generated: GeneratedConvention;
    protectedDependencies: ProtectedDependency[];
    variations: Array<"clientReadsAccess" | "pureEngines">;
    overrides: RoleEdgeOverride[];
    compositionRoots: string[];
    guidance: Guidance;
  };
  effective: {
    allowedDependencies: Record<Role, Role[]>;
    conventions: {
      roles: Record<Role, { filenameSuffixes: string[]; directorySegments: string[] }>;
      tests: { filenameMarkers: string[]; directorySegments: string[] };
      generated: { filenameMarkers: string[]; directorySegments: string[] };
      compositionRoots: string[];
    };
    policyRuleIds: string[];
    protectedDependencyRules: Array<{
      package: string;
      role: "Resource" | "Utility";
      allowedFrom: Role[];
      forbiddenFrom: Role[];
      policyRuleId: "righting/role-dependency";
    }>;
    capabilities: ContractCapability[];
    evidenceLimits: string[];
  };
};

export type SourceClassification =
  | { kind: "outside-coverage" }
  | { kind: "role"; role: Role; test: boolean; generated: boolean; editable: boolean }
  | { kind: "test"; generated: false; editable: true }
  | { kind: "composition-root"; test: boolean; generated: boolean; editable: boolean }
  | { kind: "violation"; ruleId: "righting/unclassified-source" }
  | { kind: "violation"; ruleId: "righting/ambiguous-source"; roles: Role[] };

function matchesMarker(filename: string, markers: readonly string[]): boolean {
  return markers.some((marker) => filename.includes(marker));
}

function matchesSegment(segments: readonly string[], conventions: readonly string[]): boolean {
  return conventions.some((convention) => segments.includes(convention));
}

export function classifySource(contract: NormalizedContract, sourcePath: string): SourceClassification {
  if (contract.contractVersion !== 2) {
    throw new Error(
      `Righting contract interpreter: unsupported contractVersion ${String(contract.contractVersion)}; expected 2.`,
    );
  }

  const path = sourcePath.replaceAll("\\", "/").replace(/^\.\//, "");
  if (!isMatch(path, contract.configured.coverage)) {
    return { kind: "outside-coverage" };
  }
  const parts = path.split("/");
  const filename = parts.at(-1) ?? path;
  const directories = parts.slice(0, -1);
  const test =
    matchesMarker(filename, contract.effective.conventions.tests.filenameMarkers) ||
    matchesSegment(directories, contract.effective.conventions.tests.directorySegments);
  const generated =
    matchesMarker(filename, contract.effective.conventions.generated.filenameMarkers) ||
    matchesSegment(directories, contract.effective.conventions.generated.directorySegments);
  const matches = contract.roles.filter((role) => {
    const convention = contract.effective.conventions.roles[role];
    return matchesMarker(filename, convention.filenameSuffixes) || matchesSegment(directories, convention.directorySegments);
  });
  if (matches.length > 1) {
    return { kind: "violation", ruleId: "righting/ambiguous-source", roles: matches };
  }
  if (matches.length === 1) {
    return { kind: "role", role: matches[0]!, test, generated, editable: !generated };
  }
  const basename = filename.includes(".") ? filename.slice(0, filename.indexOf(".")) : filename;
  if (contract.effective.conventions.compositionRoots.includes(basename)) {
    return { kind: "composition-root", test, generated, editable: !generated };
  }
  if (test && !generated) {
    return { kind: "test", generated: false, editable: true };
  }
  return { kind: "violation", ruleId: "righting/unclassified-source" };
}
