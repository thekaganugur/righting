import { allowedDependencies, type Policy } from "./policy.js";

export type CapabilityCoverage = "lint-enforced" | "partially-checked" | "guidance-only";

type CapabilityApplicability = "always" | "mapped-manager" | "protected-dependency" | "context-firewall";

type CapabilityDefinition = {
  id: string;
  coverage: CapabilityCoverage;
  establishes: readonly string[];
  doesNotEstablish: readonly string[];
  adapterRules: readonly string[];
  applicability: CapabilityApplicability;
};

export type Capability = Omit<CapabilityDefinition, "applicability"> & {
  applies: boolean;
};

export const capabilityCatalog = [
  {
    id: "role-dependency",
    coverage: "lint-enforced",
    establishes: ["configured-role-dependency-boundaries", "unresolved-local-import-is-forbidden"],
    doesNotEstablish: ["files-outside-declared-paths", "runtime-dependency-behavior"],
    adapterRules: ["righting/role-dependency"],
    applicability: "always",
  },
  {
    id: "manager-interaction",
    coverage: "partially-checked",
    establishes: ["direct-manager-import-is-forbidden"],
    doesNotEstablish: ["queued-interaction-semantics"],
    adapterRules: ["righting/role-dependency"],
    applicability: "mapped-manager",
  },
  {
    id: "protected-dependency",
    coverage: "lint-enforced",
    establishes: ["configured-resource-and-utility-package-classification"],
    doesNotEstablish: ["external-service-runtime-behavior", "utility-package-access-restriction"],
    adapterRules: ["righting/role-dependency"],
    applicability: "protected-dependency",
  },
  {
    id: "context-firewall",
    coverage: "lint-enforced",
    establishes: ["cross-context-source-import-is-forbidden", "shared-to-context-source-import-is-forbidden"],
    doesNotEstablish: ["cross-context-runtime-behavior"],
    adapterRules: [
      "righting/role-dependency",
      "righting/cross-context-dependency",
      "righting/shared-to-context-dependency",
    ],
    applicability: "context-firewall",
  },
  {
    id: "design-judgment",
    coverage: "guidance-only",
    establishes: [],
    doesNotEstablish: ["role-responsibility", "real-volatility", "contract-quality", "runtime-behavior", "use-case-validity"],
    adapterRules: [],
    applicability: "always",
  },
] as const satisfies readonly CapabilityDefinition[];

function applies(policy: Policy, applicability: CapabilityApplicability): boolean {
  switch (applicability) {
    case "always":
      return true;
    case "mapped-manager":
      return Object.values(policy.aliases).includes("Manager") && !allowedDependencies(policy).Manager.includes("Manager");
    case "protected-dependency":
      return policy.mappings.some((mapping) => mapping.package !== undefined);
    case "context-firewall":
      return policy.variations.has("contextFirewall");
  }
}

export function capabilitiesFor(policy: Policy): Capability[] {
  return capabilityCatalog.map(({ applicability, ...capability }) => ({ ...capability, applies: applies(policy, applicability) }));
}

function markdownList(items: readonly string[]): string {
  return items.length === 0 ? "- None" : items.map((item) => `- \`${item}\``).join("\n");
}

export function renderCapabilityCatalogReference(): string {
  return `# Righting capability catalog

This reference is generated from Righting's package-owned capability records. Inspection reports only records applicable to the configured policy by default; use \`righting inspect --all\` to see every record.

${capabilityCatalog
  .map(
    (capability) => `## \`${capability.id}\`

Coverage: \`${capability.coverage}\`

### Establishes

${markdownList(capability.establishes)}

### Does not establish

${markdownList(capability.doesNotEstablish)}

### Adapter diagnostics

${markdownList(capability.adapterRules)}`,
  )
  .join("\n\n")}
`;
}
