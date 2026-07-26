# Investigate agent-assisted Righting adapter authoring

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by:

## Question

What delivered and validated change establishes the smallest generic path by which a coding agent can create, verify, and eventually publish a supported Righting guardrail adapter?

## Answer

Prove the path with one real adapter in one real project before extracting anything reusable:

- `uets-to-task` is the first dogfood project and Oxlint is the first new guardrail tool.
- Replacing Biome with a pinned Oxlint version and approving a complete Righting policy are separate prerequisites. Adapter work begins only when the normal Oxlint command is stable and `righting inspect --json` returns the approved normalized contract.
- The first delivery waypoint is a project-local Oxlint adapter. It consumes the language-neutral JSON contract, implements the complete `role-dependency` capability, passes black-box conformance scenarios, catches one intentional boundary violation through the project's normal Oxlint command, and finishes with that violation repaired and project checks green.
- Oxlint's alpha JavaScript-plugin API is acceptable for this deliberate dogfood loop. Support records only the one pinned version exercised by ordinary CI; there is no compatibility matrix.
- A supported adapter must implement all `role-dependency` behavior. It may claim additional capabilities only when every claimed behavior passes conformance, and it must state unimplemented limits explicitly.
- Conformance is language-neutral: Righting defines scenario identities and expected policy-rule outcomes; each adapter supplies native fixtures and commands. Native findings map back to stable Righting policy-rule identities.
- Diagnostics are mandatory. Native suppression and legacy-debt handling are recommended when available, but are separately declared and tested rather than required.
- The eventual authoring aid is one generic `write-righting-adapter` skill, not a public SDK or ecosystem-specific skill family. Adapters in Go, Rust, Ruby, and other ecosystems consume `righting inspect --json` rather than reimplementing normalization or importing a JavaScript API.
- Righting owns a central catalog that grants discoverability and the “supported” designation from recorded conformance evidence. The first adapter is developed locally; its reusable package location and final catalog shape wait for dogfood evidence.

Righting v1 continues to ship only `righting-eslint`. Do not advertise `write-righting-adapter` or the Oxlint adapter as available until the rolling map reaches validated reusable support.
