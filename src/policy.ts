import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { isAbsolute, relative, resolve, sep } from "node:path";

const { isMatch } = createRequire(import.meta.url)("micromatch") as {
  isMatch(path: string, patterns: string | readonly string[]): boolean;
};

export const roles = ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"] as const;
export type Role = (typeof roles)[number];
export type Variation = "clientReadsAccess" | "pureEngines" | "contextFirewall";
export type OverrideEffect = "allow" | "disallow";

export type AliasConvention = {
  name: string;
  role: Role;
  filenameSuffixes: string[];
  directorySegments: string[];
};

export type GeneratedConvention = {
  filenameMarkers: string[];
  directorySegments: string[];
};

export type ProtectedDependency = {
  package: string;
  role: "Resource" | "Utility";
};

export type RoleEdgeOverride = {
  name: string;
  from: Role;
  to: Role;
  effect: OverrideEffect;
  reason: string;
};

export type Scope = {
  kind: "context" | "shared" | "unscoped";
  name?: string;
  path: string;
};

export type Guidance = {
  domainVocabulary?: string;
  goldenExamples?: Record<string, string>;
};

export type Policy = {
  preset: "volatility@1";
  coverage: string[];
  aliases: AliasConvention[];
  generated: GeneratedConvention;
  protectedDependencies: ProtectedDependency[];
  variations: Variation[];
  overrides: RoleEdgeOverride[];
  scopes: Scope[];
  compositionRoots: string[];
  guidance: Guidance;
};

export type CapabilityCoverage = "statically-enforceable" | "partially-checkable" | "guidance-only";

export type ContractCapability = {
  id: string;
  applies: boolean;
  coverage: CapabilityCoverage;
  policyRuleIds: string[];
  establishes: string[];
  doesNotEstablish: string[];
};

export type NormalizedContract = {
  contractVersion: 1;
  preset: "volatility@1";
  roles: Role[];
  configured: {
    coverage: string[];
    aliases: AliasConvention[];
    generated: GeneratedConvention;
    protectedDependencies: ProtectedDependency[];
    variations: Variation[];
    overrides: RoleEdgeOverride[];
    scopes: Scope[];
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
    scopeRules: Array<{
      policyRuleId: "righting/role-dependency" | "righting/cross-context-dependency" | "righting/shared-to-context-dependency";
      effect: "allow" | "disallow";
      from: { scope: "context" | "shared" | "unscoped"; role?: "Client" };
      to: { scope: "context" | "shared"; relation?: "same" | "different"; role?: "Client" };
    }>;
    scopeClassification: null | {
      multipleMatches: { effect: "error"; policyRuleId: "righting/ambiguous-scope" };
      noMatches: "outside-declared-scopes";
    };
    capabilities: ContractCapability[];
    evidenceLimits: string[];
  };
};

export type ScopeClassification =
  | { kind: "not-applicable" }
  | { kind: "outside-declared-scopes" }
  | { kind: "context"; name: string }
  | { kind: "shared" | "unscoped" }
  | { kind: "violation"; ruleId: "righting/ambiguous-scope"; scopes: string[] };

export type SourceClassification =
  | { kind: "outside-coverage" }
  | { kind: "role"; role: Role; test: boolean; generated: boolean; editable: boolean }
  | { kind: "test"; generated: false; editable: true }
  | { kind: "composition-root"; test: boolean; generated: boolean; editable: boolean }
  | { kind: "violation"; ruleId: "righting/unclassified-source" }
  | { kind: "violation"; ruleId: "righting/ambiguous-source"; roles: Role[] };

const canonicalConventions: Record<Role, { filenameSuffixes: string[]; directorySegments: string[] }> = {
  Client: { filenameSuffixes: [".client."], directorySegments: ["clients"] },
  Manager: { filenameSuffixes: [".manager."], directorySegments: ["managers"] },
  Engine: { filenameSuffixes: [".engine."], directorySegments: ["engines"] },
  ResourceAccess: { filenameSuffixes: [".access."], directorySegments: ["access"] },
  Resource: { filenameSuffixes: [".resource."], directorySegments: ["resources"] },
  Utility: { filenameSuffixes: [".utility."], directorySegments: ["utilities"] },
};

const testConventions = {
  filenameMarkers: [".test.", ".spec."],
  directorySegments: ["test", "tests", "__tests__"],
};
const generatedConventions = { filenameMarkers: [".generated."], directorySegments: ["generated"] };
const defaultAllowedDependencies: Record<Role, Role[]> = {
  Client: ["Manager", "Utility"],
  Manager: ["Engine", "ResourceAccess", "Utility"],
  Engine: ["ResourceAccess", "Utility"],
  ResourceAccess: ["Resource", "Utility"],
  Resource: ["Utility"],
  Utility: ["Utility"],
};
const supportedVariations = new Set<Variation>(["clientReadsAccess", "pureEngines", "contextFirewall"]);
const policyKeys = new Set([
  "preset",
  "coverage",
  "aliases",
  "generated",
  "protectedDependencies",
  "variations",
  "overrides",
  "scopes",
  "compositionRoots",
  "guidance",
]);
const aliasKeys = new Set(["name", "role", "filenameSuffixes", "directorySegments"]);
const generatedKeys = new Set(["filenameMarkers", "directorySegments"]);
const protectedDependencyKeys = new Set(["package", "role"]);
const overrideKeys = new Set(["name", "from", "to", "effect", "reason"]);
const scopeKeys = new Set(["kind", "name", "path"]);
const guidanceKeys = new Set(["domainVocabulary", "goldenExamples"]);

type JsonRecord = Record<string, unknown>;

export const incompletePolicyRequirements = ["coverage", "maintainer-approval"] as const;

export function isExactIncompleteStarter(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 2 &&
    (value as JsonRecord).preset === "volatility@1" &&
    (value as JsonRecord).status === "incomplete"
  );
}

export function isExactIncompleteStarterFile(policyPath: string): boolean {
  try {
    return isExactIncompleteStarter(JSON.parse(readFileSync(policyPath, "utf8")));
  } catch {
    return false;
  }
}

function fail(message: string): never {
  throw new Error(`righting.json ${message}`);
}

function record(value: unknown, description: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`must define ${description}.`);
  }
  return value as JsonRecord;
}

function rejectUnknownKeys(value: JsonRecord, allowed: ReadonlySet<string>, description: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${description} contains unsupported property "${key}".`);
    }
  }
}

function nonEmptyString(value: unknown, description: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${description} must be a non-empty string.`);
  }
  return value;
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

function validatePath(path: string, description: string): void {
  if (isAbsolute(path) || path.startsWith("./") || path.startsWith("../") || path.includes("\\")) {
    fail(`${description} must be a relative forward-slash glob.`);
  }
}

function strings(value: unknown, description: string, required = false): string[] {
  if (value === undefined && !required) {
    return [];
  }
  if (!Array.isArray(value) || (required && value.length === 0)) {
    fail(`${description} must be ${required ? "a non-empty" : "an"} array.`);
  }
  const result = value.map((entry, index) => nonEmptyString(entry, `${description} ${index}`));
  if (new Set(result).size !== result.length) {
    fail(`${description} cannot contain duplicates.`);
  }
  return result;
}

function parseCoverage(value: unknown): string[] {
  const coverage = strings(value, "coverage", true);
  for (const [index, path] of coverage.entries()) {
    validatePath(path, `coverage ${index}`);
  }
  return coverage;
}

function parseAliases(value: unknown): AliasConvention[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    fail("aliases must be an array.");
  }
  const names = new Set<string>();
  return value.map((candidate, index) => {
    const alias = record(candidate, `alias ${index}`);
    rejectUnknownKeys(alias, aliasKeys, `alias ${index}`);
    const name = nonEmptyString(alias.name, `alias ${index} name`);
    if (names.has(name)) {
      fail(`aliases repeat the name "${name}".`);
    }
    names.add(name);
    if (!isRole(alias.role)) {
      fail(`alias "${name}" must map to one of: ${roles.join(", ")}.`);
    }
    const filenameSuffixes = strings(alias.filenameSuffixes, `alias ${index} filenameSuffixes`);
    const directorySegments = strings(alias.directorySegments, `alias ${index} directorySegments`);
    if (filenameSuffixes.length === 0 && directorySegments.length === 0) {
      fail(`alias "${name}" must define a filename suffix or directory segment.`);
    }
    for (const suffix of filenameSuffixes) {
      if (!suffix.startsWith(".") || !suffix.endsWith(".") || suffix.includes("/") || suffix.includes("\\")) {
        fail(`alias "${name}" filename suffix "${suffix}" must be an exact dotted filename token.`);
      }
    }
    for (const segment of directorySegments) {
      if (segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\")) {
        fail(`alias "${name}" directory segment "${segment}" must be one exact path segment.`);
      }
    }
    return { name, role: alias.role, filenameSuffixes, directorySegments };
  });
}

function parseGenerated(value: unknown): GeneratedConvention {
  if (value === undefined) {
    return { filenameMarkers: [], directorySegments: [] };
  }
  const generated = record(value, "generated conventions");
  rejectUnknownKeys(generated, generatedKeys, "generated conventions");
  const filenameMarkers = strings(generated.filenameMarkers, "generated filenameMarkers");
  const directorySegments = strings(generated.directorySegments, "generated directorySegments");
  if (filenameMarkers.length === 0 && directorySegments.length === 0) {
    fail("generated conventions must define a filename marker or directory segment.");
  }
  for (const marker of filenameMarkers) {
    if (!marker.startsWith(".") || !marker.endsWith(".") || marker.includes("/") || marker.includes("\\")) {
      fail(`generated filename marker "${marker}" must be an exact dotted filename token.`);
    }
  }
  for (const segment of directorySegments) {
    if (segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\")) {
      fail(`generated directory segment "${segment}" must be one exact path segment.`);
    }
  }
  return { filenameMarkers, directorySegments };
}

function validatePackage(packageName: string): void {
  if (packageName.startsWith(".") || packageName.startsWith("/") || packageName.startsWith("node:")) {
    fail("protected dependency must name an external package.");
  }
}

function parseProtectedDependencies(value: unknown): ProtectedDependency[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    fail("protectedDependencies must be an array.");
  }
  const packages = new Set<string>();
  return value.map((candidate, index) => {
    const dependency = record(candidate, `protected dependency ${index}`);
    rejectUnknownKeys(dependency, protectedDependencyKeys, `protected dependency ${index}`);
    const packageName = nonEmptyString(dependency.package, `protected dependency ${index} package`);
    validatePackage(packageName);
    if (dependency.role !== "Resource" && dependency.role !== "Utility") {
      fail(`protected dependency ${index} role must be "Resource" or "Utility".`);
    }
    if (packages.has(packageName)) {
      fail(`protectedDependencies repeat package "${packageName}".`);
    }
    packages.add(packageName);
    return { package: packageName, role: dependency.role };
  });
}

function parseVariations(value: unknown): Variation[] {
  const configured = strings(value, "variations") as Variation[];
  for (const variation of configured) {
    if (!supportedVariations.has(variation)) {
      fail(`variations contains unsupported opt-in "${variation}".`);
    }
  }
  return configured;
}

function parseOverrides(value: unknown): RoleEdgeOverride[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    fail("overrides must be an array.");
  }
  const names = new Set<string>();
  const edges = new Set<string>();
  return value.map((candidate, index) => {
    const override = record(candidate, `override ${index}`);
    rejectUnknownKeys(override, overrideKeys, `override ${index}`);
    const name = nonEmptyString(override.name, `override ${index} name`);
    const reason = nonEmptyString(override.reason, `override ${index} reason`);
    if (!isRole(override.from) || !isRole(override.to)) {
      fail(`override ${index} must use canonical roles.`);
    }
    if (override.effect !== "allow" && override.effect !== "disallow") {
      fail(`override ${index} effect must be "allow" or "disallow".`);
    }
    if (names.has(name)) {
      fail(`overrides repeat the name "${name}".`);
    }
    const edge = `${override.from}:${override.to}`;
    if (edges.has(edge)) {
      fail(`overrides repeat the ${edge} edge.`);
    }
    names.add(name);
    edges.add(edge);
    return { name, from: override.from, to: override.to, effect: override.effect, reason };
  });
}

function parseScopes(value: unknown): Scope[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length === 0) {
    fail("scopes must be a non-empty array.");
  }
  const contextNames = new Set<string>();
  return value.map((candidate, index) => {
    const scope = record(candidate, `scope ${index}`);
    rejectUnknownKeys(scope, scopeKeys, `scope ${index}`);
    const path = nonEmptyString(scope.path, `scope ${index} path`);
    validatePath(path, `scope ${index} path`);
    if (scope.kind === "context") {
      const name = nonEmptyString(scope.name, `scope ${index} name`);
      if (contextNames.has(name)) {
        fail(`scopes repeat context "${name}".`);
      }
      contextNames.add(name);
      return { kind: scope.kind, name, path };
    }
    if (scope.kind === "shared" || scope.kind === "unscoped") {
      if (scope.name !== undefined) {
        fail(`${scope.kind} scope ${index} cannot have a name.`);
      }
      return { kind: scope.kind, path };
    }
    fail(`scope ${index} kind must be "context", "shared", or "unscoped".`);
  });
}

function parseCompositionRoots(value: unknown): string[] {
  const tokens = strings(value, "compositionRoots");
  for (const token of tokens) {
    if (token.includes("/") || token.includes("\\") || token.includes(".")) {
      fail(`composition root "${token}" must be one exact extensionless filename token.`);
    }
  }
  return tokens;
}

function parseReference(value: unknown, description: string, projectDirectory: string): string {
  const reference = nonEmptyString(value, description);
  const path = resolve(projectDirectory, reference);
  const projectRelative = relative(projectDirectory, path);
  if (isAbsolute(reference) || projectRelative === ".." || projectRelative.startsWith(`..${sep}`) || isAbsolute(projectRelative)) {
    fail(`${description} must be a project-relative path.`);
  }
  if (!existsSync(path)) {
    fail(`${description} must reference an existing path.`);
  }
  return reference;
}

function parseGuidance(value: unknown, projectDirectory: string): Guidance {
  if (value === undefined) {
    return {};
  }
  const guidance = record(value, "guidance");
  rejectUnknownKeys(guidance, guidanceKeys, "guidance");
  const domainVocabulary =
    guidance.domainVocabulary === undefined
      ? undefined
      : parseReference(guidance.domainVocabulary, "guidance domainVocabulary", projectDirectory);
  let goldenExamples: Record<string, string> | undefined;
  if (guidance.goldenExamples !== undefined) {
    const examples = record(guidance.goldenExamples, "guidance goldenExamples");
    goldenExamples = {};
    for (const [name, reference] of Object.entries(examples)) {
      if (name.trim() === "") {
        fail("guidance goldenExamples cannot contain an empty name.");
      }
      goldenExamples[name] = parseReference(reference, `guidance goldenExamples "${name}"`, projectDirectory);
    }
  }
  return {
    ...(domainVocabulary === undefined ? {} : { domainVocabulary }),
    ...(goldenExamples === undefined ? {} : { goldenExamples }),
  };
}

export function allowedDependencies(policy: Policy): Record<Role, Role[]> {
  const allowed = Object.fromEntries(roles.map((role) => [role, [...defaultAllowedDependencies[role]]])) as Record<Role, Role[]>;
  if (policy.variations.includes("clientReadsAccess")) {
    allowed.Client.push("ResourceAccess");
  }
  if (policy.variations.includes("pureEngines")) {
    allowed.Engine = allowed.Engine.filter((role) => role !== "ResourceAccess");
  }
  for (const override of policy.overrides) {
    const currentlyAllowed = allowed[override.from].includes(override.to);
    if ((override.effect === "allow") === currentlyAllowed) {
      fail(`override "${override.name}" does not change the ${override.from}:${override.to} edge.`);
    }
    allowed[override.from] =
      override.effect === "allow"
        ? [...allowed[override.from], override.to]
        : allowed[override.from].filter((role) => role !== override.to);
  }
  return allowed;
}

function parsePolicy(source: unknown, policyPath: string): Policy {
  const policy = record(source, "a policy object");
  if (policy.status === "incomplete") {
    if (!isExactIncompleteStarter(policy)) {
      fail(
        'has an incomplete starter with configuration; an incomplete starter may contain only "preset" and "status". After approval, replace it with the complete policy and remove "status": "incomplete".',
      );
    }
    fail("is incomplete; obtain maintainer approval, then replace the starter with coverage and approved conventions.");
  }
  rejectUnknownKeys(policy, policyKeys, "policy");
  if (policy.preset !== "volatility@1") {
    fail("must select the volatility@1 preset.");
  }
  const projectDirectory = resolve(policyPath, "..");
  const result: Policy = {
    preset: "volatility@1",
    coverage: parseCoverage(policy.coverage),
    aliases: parseAliases(policy.aliases),
    generated: parseGenerated(policy.generated),
    protectedDependencies: parseProtectedDependencies(policy.protectedDependencies),
    variations: parseVariations(policy.variations),
    overrides: parseOverrides(policy.overrides),
    scopes: parseScopes(policy.scopes),
    compositionRoots: parseCompositionRoots(policy.compositionRoots),
    guidance: parseGuidance(policy.guidance, projectDirectory),
  };
  if (result.scopes.length > 0 && !result.variations.includes("contextFirewall")) {
    fail("scopes require the contextFirewall variation.");
  }
  if (result.variations.includes("contextFirewall")) {
    for (const kind of ["context", "shared", "unscoped"] as const) {
      if (!result.scopes.some((scope) => scope.kind === kind)) {
        fail(`contextFirewall requires at least one ${kind} scope.`);
      }
    }
  }
  allowedDependencies(result);
  return result;
}

function capabilitiesFor(policy: Policy): ContractCapability[] {
  const allowed = allowedDependencies(policy);
  const definitions = [
    {
      id: "role-dependency",
      applies: true,
      coverage: "statically-enforceable" as const,
      policyRuleIds: [
        "righting/role-dependency",
        "righting/unresolved-local-import",
        "righting/unclassified-source",
        "righting/ambiguous-source",
        "righting/test-dependency",
      ],
      establishes: ["configured-role-dependency-boundaries", "unresolved-local-import-is-forbidden"],
      doesNotEstablish: ["files-outside-coverage", "runtime-dependency-behavior"],
    },
    {
      id: "manager-interaction",
      applies: !allowed.Manager.includes("Manager"),
      coverage: "partially-checkable" as const,
      policyRuleIds: ["righting/role-dependency"],
      establishes: ["direct-manager-import-is-forbidden"],
      doesNotEstablish: ["queued-interaction-semantics"],
    },
    {
      id: "protected-dependency",
      applies: policy.protectedDependencies.length > 0,
      coverage: "statically-enforceable" as const,
      policyRuleIds: ["righting/role-dependency"],
      establishes: ["configured-resource-and-utility-package-classification"],
      doesNotEstablish: ["external-service-runtime-behavior", "utility-package-access-restriction"],
    },
    {
      id: "context-firewall",
      applies: policy.variations.includes("contextFirewall"),
      coverage: "statically-enforceable" as const,
      policyRuleIds: [
        "righting/cross-context-dependency",
        "righting/shared-to-context-dependency",
        "righting/ambiguous-scope",
      ],
      establishes: ["cross-context-source-import-is-forbidden", "shared-to-context-source-import-is-forbidden"],
      doesNotEstablish: ["cross-context-runtime-behavior"],
    },
    {
      id: "design-judgment",
      applies: true,
      coverage: "guidance-only" as const,
      policyRuleIds: [],
      establishes: [],
      doesNotEstablish: ["role-responsibility", "real-volatility", "contract-quality", "runtime-behavior", "use-case-validity"],
    },
  ];
  return definitions.map((capability) => ({ ...capability }));
}

export function normalizePolicy(policy: Policy): NormalizedContract {
  const roleConventions = Object.fromEntries(
    roles.map((role) => {
      const aliases = policy.aliases.filter((alias) => alias.role === role);
      return [
        role,
        {
          filenameSuffixes: [...canonicalConventions[role].filenameSuffixes, ...aliases.flatMap((alias) => alias.filenameSuffixes)],
          directorySegments: [
            ...canonicalConventions[role].directorySegments,
            ...aliases.flatMap((alias) => alias.directorySegments),
          ],
        },
      ];
    }),
  ) as NormalizedContract["effective"]["conventions"]["roles"];
  return {
    contractVersion: 1,
    preset: policy.preset,
    roles: [...roles],
    configured: {
      coverage: [...policy.coverage],
      aliases: policy.aliases.map((alias) => ({ ...alias, filenameSuffixes: [...alias.filenameSuffixes], directorySegments: [...alias.directorySegments] })),
      generated: {
        filenameMarkers: [...policy.generated.filenameMarkers],
        directorySegments: [...policy.generated.directorySegments],
      },
      protectedDependencies: policy.protectedDependencies.map((dependency) => ({ ...dependency })),
      variations: [...policy.variations],
      overrides: policy.overrides.map((override) => ({ ...override })),
      scopes: policy.scopes.map((scope) => ({ ...scope })),
      compositionRoots: [...policy.compositionRoots],
      guidance: {
        ...policy.guidance,
        ...(policy.guidance.goldenExamples === undefined ? {} : { goldenExamples: { ...policy.guidance.goldenExamples } }),
      },
    },
    effective: {
      allowedDependencies: allowedDependencies(policy),
      conventions: {
        roles: roleConventions,
        tests: { filenameMarkers: [...testConventions.filenameMarkers], directorySegments: [...testConventions.directorySegments] },
        generated: {
          filenameMarkers: [...generatedConventions.filenameMarkers, ...policy.generated.filenameMarkers],
          directorySegments: [...generatedConventions.directorySegments, ...policy.generated.directorySegments],
        },
        compositionRoots: ["composition-root", ...policy.compositionRoots],
      },
      policyRuleIds: [
        "righting/role-dependency",
        "righting/unresolved-local-import",
        "righting/unclassified-source",
        "righting/ambiguous-source",
        "righting/test-dependency",
        "righting/cross-context-dependency",
        "righting/shared-to-context-dependency",
        "righting/ambiguous-scope",
      ],
      protectedDependencyRules: policy.protectedDependencies.map((dependency) => {
        const allowed = allowedDependencies(policy);
        return {
          ...dependency,
          allowedFrom: roles.filter((role) => allowed[role].includes(dependency.role)),
          forbiddenFrom: roles.filter((role) => !allowed[role].includes(dependency.role)),
          policyRuleId: "righting/role-dependency" as const,
        };
      }),
      scopeRules: policy.variations.includes("contextFirewall")
        ? [
            {
              policyRuleId: "righting/cross-context-dependency",
              effect: "disallow",
              from: { scope: "context" },
              to: { scope: "context", relation: "different" },
            },
            {
              policyRuleId: "righting/shared-to-context-dependency",
              effect: "disallow",
              from: { scope: "shared" },
              to: { scope: "context" },
            },
            {
              policyRuleId: "righting/role-dependency",
              effect: "allow",
              from: { scope: "unscoped" },
              to: { scope: "context" },
            },
            {
              policyRuleId: "righting/role-dependency",
              effect: "allow",
              from: { scope: "context", role: "Client" },
              to: { scope: "context", relation: "same", role: "Client" },
            },
            {
              policyRuleId: "righting/role-dependency",
              effect: "allow",
              from: { scope: "context", role: "Client" },
              to: { scope: "shared", role: "Client" },
            },
          ]
        : [],
      scopeClassification: policy.variations.includes("contextFirewall")
        ? {
            multipleMatches: { effect: "error", policyRuleId: "righting/ambiguous-scope" },
            noMatches: "outside-declared-scopes",
          }
        : null,
      capabilities: capabilitiesFor(policy),
      evidenceLimits: [
        "files-outside-coverage",
        "matched-files-are-inspection-evidence",
        "runtime-behavior",
        "maintainer-approval",
        "adapter-activation",
      ],
    },
  };
}

function matchesMarker(filename: string, markers: readonly string[]): boolean {
  return markers.some((marker) => filename.includes(marker));
}

function matchesSegment(segments: readonly string[], conventions: readonly string[]): boolean {
  return conventions.some((convention) => segments.includes(convention));
}

export function classifyScope(contract: NormalizedContract, sourcePath: string): ScopeClassification {
  if (contract.effective.scopeClassification === null) {
    return { kind: "not-applicable" };
  }
  const path = sourcePath.replaceAll("\\", "/").replace(/^\.\//, "");
  const matches = contract.configured.scopes.filter((scope) => isMatch(path, scope.path));
  if (matches.length === 0) {
    return { kind: contract.effective.scopeClassification.noMatches };
  }
  if (matches.length > 1) {
    return {
      kind: "violation",
      ruleId: contract.effective.scopeClassification.multipleMatches.policyRuleId,
      scopes: matches.map((scope) => scope.name ?? scope.kind),
    };
  }
  const scope = matches[0]!;
  return scope.kind === "context" ? { kind: scope.kind, name: scope.name! } : { kind: scope.kind };
}

export function classifySource(contract: NormalizedContract, sourcePath: string): SourceClassification {
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
  const matches = roles.filter((role) => {
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

export function readPolicySource(source: string, policyPath: string): Policy {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`righting.json could not be read: ${message}`);
  }
  return parsePolicy(parsed, policyPath);
}

export function readPolicy(policyPath: string): Policy {
  let source: string;
  try {
    source = readFileSync(policyPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`righting.json could not be read: ${message}`);
  }
  return readPolicySource(source, policyPath);
}
