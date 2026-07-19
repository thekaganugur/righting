# Specify package onboarding documentation

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 04, 06

## Question

What package-level README/reference and dogfood narrative changes make the agreed manual-maintainer and agent-assisted onboarding routes discoverable without duplicating `righting.json`, installed skills, capability data, or the minimal managed `AGENTS.md` pointer?

Define the content ownership and the smallest ordered instructions from installation through an approved policy and optional ESLint integration. Include any accepted read-only inspection surface, but do not write implementation documentation yet.

## Answer

Publish progressive, package-level onboarding. The root README is the short npm/repository route chooser, not a complete guide. It states Righting’s static-policy purpose and limits, shows installation and `righting init`, mentions `righting init --skills` once for compatible-agent help, introduces `righting inspect`, and links to the focused references below.

Content has one owner per concern:

- **Manual-maintainer reference:** an approval-first checklist. It directs a maintainer to inspect the starter, use the policy reference to decide aliases/mappings and only applicable variations/scopes, review and approve the exact candidate, replace the starter, use `righting inspect` to see its effective policy and capability limits, then optionally follow the ESLint reference. It does not require skills.
- **Agent-assisted reference:** the human-facing handoff contract only. It explains `init --skills`, discovery of linked skills, `righting-integrate` owning candidate and approval work, and the separately approved `righting-eslint` handoff. It links to skills instead of copying their procedure.
- **Policy reference:** the policy language and semantics: incomplete transition, canonical roles, aliases, mappings, variations, scopes, overrides, extras, validation, and effective-rule derivation. It uses neutral syntax only; it never supplies a project architecture, folder layout, or recommended role assignment.
- **Capability reference:** a full catalog rendered from the same package-owned structured capability data used by `inspect`. It names semantic claims, coverage classifications, static evidence, unproven limits, and adapter mappings. Onboarding pages link to it rather than duplicating classifications.
- **ESLint integration reference:** only adapter prerequisites and the additive protocol: existing modern flat config, lint script/package/resolver checks, the smallest `eslintConfig()` patch, preservation of typed-lint settings, normal lint verification, and approved native suppressions/baseline flow. It links to policy and capability references rather than teaching architecture choices.
- **Dogfood narrative:** a candid worked Orders/Returns example for the product author and curious readers. It records real approved choices, integration, legacy debt, boundary repair, friction, and limits; it is not a benchmark, idealized showcase, universal recommendation, or duplicate onboarding guide. Release walkthrough records remain separate evidence artifacts.

The package documentation defines two small ordered routes:

1. **Maintainer alone:** install; run `righting init`; inspect the incomplete starter; use the manual and policy references to make and approve decisions; replace the starter; run `righting inspect`; and, only if desired and supported, follow the ESLint reference.
2. **Maintainer with a compatible agent:** install; run `righting init --skills`; follow the agent-assisted handoff to `righting-integrate`; approve the rendered candidate; replace the starter; run `righting inspect`; then, only if desired and supported, use `righting-eslint` through its separately approved adapter handoff.

`AGENTS.md` remains solely the minimal automatic pointer to `righting.json`. It does not repeat skills, commands, policy content, capability limits, or adapter instructions. `righting docs` is absent from all routes and documentation.
