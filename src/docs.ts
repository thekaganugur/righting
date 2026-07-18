import { allowedDependencies, roles, type Policy } from "./policy.js";

function mappingsFor(policy: Policy, alias: string): string {
  return policy.mappings
    .filter((mapping) => mapping.alias === alias)
    .flatMap((mapping) => [mapping.path, mapping.package].filter((value): value is string => value !== undefined))
    .map((value) => `\`${value}\``)
    .join(", ");
}

function configuredVariations(policy: Policy): string {
  return policy.variations.size === 0
    ? "- None."
    : [...policy.variations].map((variation) => `- \`${variation}\`.`).join("\n");
}

function configuredScopes(policy: Policy): string {
  if (!policy.variations.has("contextFirewall")) {
    return "";
  }

  const scopes = policy.scopes
    .map((scope) => `- \`${scope.kind}${scope.name === undefined ? "" : `: ${scope.name}`}\`: \`${scope.path}\``)
    .join("\n");
  return `

### Context firewall

${scopes}

Contextual code may use shared code when its role edge is allowed. Contextual Clients may compose same-context and shared Clients; unscoped code may wire context entry points. Cross-context and shared-to-context dependencies are lint-enforced as forbidden.`;
}

function projectReferences(policy: Policy): string {
  const extras = policy.extras;
  if (extras === undefined || (extras.domainVocabulary === undefined && extras.goldenExamples === undefined)) {
    return "";
  }

  const references = [
    extras.domainVocabulary === undefined ? undefined : `- Domain vocabulary: \`${extras.domainVocabulary}\`.`,
    ...Object.entries(extras.goldenExamples ?? {}).map(([name, path]) => `- Golden example \`${name}\`: \`${path}\`.`),
  ].filter((reference): reference is string => reference !== undefined);
  return `

## Project references

${references.join("\n")}

These references are checked only for existence; Righting does not assess their contents.`;
}

export function renderPolicyGuidance(policy: Policy): string {
  const allowed = allowedDependencies(policy);
  const aliases = Object.entries(policy.aliases)
    .map(([alias, role]) => `- \`${alias}\` (${role}) — ${mappingsFor(policy, alias)}.`)
    .join("\n");
  const boundaries = roles.map((role) => `- \`${role}\` → ${allowed[role].map((target) => `\`${target}\``).join(", ")}`).join("\n");
  const overrides =
    policy.overrides.length === 0
      ? ""
      : `

### Policy overrides

${policy.overrides
          .map((override) => `- \`${override.name}\`: ${override.effect} \`${override.from}\` → \`${override.to}\` — ${override.reason}`)
          .join("\n")}`;

  return `## Righting policy guidance

\`righting.json\` selects \`${policy.preset}\`.

### Local aliases

${aliases}

## Enforced boundaries

The ESLint adapter lint-enforces the configured role edges for mapped code. Other mapped role dependencies are forbidden unless a configured variation or override changes them.

${boundaries}

### Configured variations

${configuredVariations(policy)}${overrides}${configuredScopes(policy)}

## Rule coverage

- **lint-enforced** — role dependencies, protected Resource and Utility packages, and unresolved local imports across imports, exports/re-exports, \`require\`, dynamic imports, and type-only imports.
- **lint-enforced** — cross-context and shared-to-context dependencies when \`contextFirewall\` is configured.
- **partially checked** — direct Manager-to-Manager source imports are prohibited, but static analysis cannot prove that a permitted Manager interaction is queued.
- **guidance only** — role responsibilities, real volatility, contract quality, runtime behavior, and use-case validity require design judgment.

## ESLint adapter limitations

- It requires an existing modern ESLint flat config and does not install or migrate lint tooling, rewrite lint scripts, or add typed-lint analysis.
- Static dependency evidence cannot prove runtime behavior or queue semantics.
- Righting has no per-file or per-line waiver mechanism; policy-wide variations, overrides, and native legacy-debt suppressions are deliberate exceptions.

## Design review

Use \`righting-design-review\` for an opt-in advisory review. It examines the policy and relevant code, asks focused questions, and reports evidence, risks, open questions, and static-analysis limits. It does not score work or change policy, CI, or project files automatically.${projectReferences(policy)}`;
}
