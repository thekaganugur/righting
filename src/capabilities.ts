import { normalizePolicy, type ContractCapability, type Policy } from "./policy.js";

export type { CapabilityCoverage } from "./policy.js";
export type Capability = ContractCapability;

export function capabilitiesFor(policy: Policy): Capability[] {
  return normalizePolicy(policy).effective.capabilities;
}

function markdownList(items: readonly string[]): string {
  return items.length === 0 ? "- None" : items.map((item) => `- \`${item}\``).join("\n");
}

export function renderCapabilityCatalogReference(): string {
  const sample: Policy = {
    preset: "volatility@1",
    coverage: ["**/*"],
    aliases: [],
    protectedDependencies: [{ package: "example-resource", role: "Resource" }],
    variations: ["contextFirewall"],
    overrides: [],
    scopes: [
      { kind: "context", name: "example", path: "example/**" },
      { kind: "shared", path: "shared/**" },
      { kind: "unscoped", path: "application/**" },
    ],
    compositionRoots: [],
    guidance: {},
  };
  const capabilities = capabilitiesFor(sample);
  return `# Righting capability catalog

This reference is generated from Righting's package-owned, adapter-neutral capability records. Inspection reports applicable records by default; use \`righting inspect --all\` to see every record.

${capabilities
    .map(
      (capability) => `## \`${capability.id}\`

Coverage: \`${capability.coverage}\`

### Establishes

${markdownList(capability.establishes)}

### Does not establish

${markdownList(capability.doesNotEstablish)}

### Policy rules

${markdownList(capability.policyRuleIds)}`,
    )
    .join("\n\n")}
`;
}
