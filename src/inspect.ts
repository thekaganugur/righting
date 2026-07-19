import { capabilitiesFor, type Capability } from "./capabilities.js";
import { allowedDependencies, incompletePolicyRequirements, isExactIncompleteStarterFile, readPolicy, type Policy } from "./policy.js";

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

type ValidInspection = {
  schemaVersion: 1;
  command: "inspect";
  ok: true;
  policy: { path: "righting.json"; status: "valid" };
  adapter: { status: "unknown" };
  configuration: ReturnType<typeof configurationFor>;
  effectivePolicy: { allowedDependencies: ReturnType<typeof allowedDependencies> };
  capabilities: Capability[];
  availableCapabilities?: Capability[];
};

export type Inspection = IncompleteInspection | ValidInspection;

function mappingForOutput(mapping: Policy["mappings"][number]) {
  return {
    alias: mapping.alias,
    ...(mapping.path === undefined ? {} : { path: mapping.path }),
    ...(mapping.package === undefined ? {} : { package: mapping.package }),
  };
}

function scopeForOutput(scope: Policy["scopes"][number]) {
  return {
    kind: scope.kind,
    ...(scope.name === undefined ? {} : { name: scope.name }),
    path: scope.path,
  };
}

function configurationFor(policy: Policy) {
  return {
    preset: policy.preset,
    aliases: policy.aliases,
    mappings: policy.mappings.map(mappingForOutput),
    variations: [...policy.variations],
    overrides: policy.overrides,
    scopes: policy.scopes.map(scopeForOutput),
    protectedDependencies: policy.mappings.flatMap((mapping) => {
      const packageName = mapping.package;
      if (packageName === undefined) {
        return [];
      }
      return [{ alias: mapping.alias, role: policy.aliases[mapping.alias], package: packageName }];
    }),
  };
}

export function inspectPolicy(policyPath: string, includeAll = false): Inspection {
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

  const policy = readPolicy(policyPath);
  const allCapabilities = capabilitiesFor(policy);
  const capabilities = allCapabilities.filter((capability) => capability.applies);
  const availableCapabilities = allCapabilities.filter((capability) => !capability.applies);
  return {
    schemaVersion: 1,
    command: "inspect",
    ok: true,
    policy: { path: "righting.json", status: "valid" },
    adapter: { status: "unknown" },
    configuration: configurationFor(policy),
    effectivePolicy: { allowedDependencies: allowedDependencies(policy) },
    capabilities,
    ...(includeAll ? { availableCapabilities } : {}),
  };
}

function list(items: readonly string[]): string {
  return items.length === 0 ? "None" : items.join(", ");
}

function renderCapability(capability: Capability): string {
  return [
    `- ${capability.id} (${capability.coverage})`,
    `  Establishes: ${list(capability.establishes)}`,
    `  Does not establish: ${list(capability.doesNotEstablish)}`,
    `  Adapter diagnostics: ${list(capability.adapterRules)}`,
  ].join("\n");
}

export function renderInspection(inspection: Inspection, includeAll = false): string {
  const header = [`Righting policy: ${inspection.policy.status} (${inspection.policy.path})`];
  if ("nextAction" in inspection) {
    return [
      ...header,
      `Requires: ${inspection.policy.required.join(", ")}`,
      `Next action: ${inspection.nextAction}`,
      "Adapter activation: unknown (not checked)",
    ].join("\n");
  }

  const configuration = inspection.configuration;
  const aliases = Object.entries(configuration.aliases).map(([alias, role]) => `- ${alias}: ${role}`);
  const mappings = configuration.mappings.map((mapping) =>
    `- ${mapping.alias}: ${[mapping.path, mapping.package].filter((value): value is string => value !== undefined).join(", ")}`,
  );
  const scopes = configuration.scopes.map((scope) => `- ${scope.kind}${"name" in scope ? `: ${scope.name}` : ""}: ${scope.path}`);
  const overrides = configuration.overrides.map(
    (override) => `- ${override.name}: ${override.effect} ${override.from} -> ${override.to} (${override.reason})`,
  );
  const protectedDependencies = configuration.protectedDependencies.map(
    (dependency) => `- ${dependency.alias} (${dependency.role}): ${dependency.package}`,
  );
  const relationships = Object.entries(inspection.effectivePolicy.allowedDependencies).map(
    ([role, allowed]) => `- ${role} -> ${allowed.join(", ")}`,
  );
  const applicable = inspection.capabilities;
  const available = inspection.availableCapabilities ?? [];

  return [
    ...header,
    "",
    "Configuration",
    `Preset: ${configuration.preset}`,
    "Aliases",
    ...aliases,
    "Mappings",
    ...mappings,
    `Variations: ${list(configuration.variations)}`,
    "Scopes",
    ...(scopes.length === 0 ? ["- None"] : scopes),
    "Overrides",
    ...(overrides.length === 0 ? ["- None"] : overrides),
    "Protected dependencies",
    ...(protectedDependencies.length === 0 ? ["- None"] : protectedDependencies),
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
