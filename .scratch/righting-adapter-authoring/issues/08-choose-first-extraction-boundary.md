# Choose the first reusable extraction boundary

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 07

## Question

Given the validated `uets-to-task` dogfood evidence and the guardrail-plugin composition recommendation, what is the smallest supported extraction boundary for the first reusable path: which artifacts belong in the generic `write-righting-adapter` skill, where adapter-neutral conformance scenarios live, and what Oxlint-specific implementation or publication remains for a later waypoint? Reject a public SDK, ecosystem-specific skill family, or compatibility matrix unless the observed evidence now requires it.

## Answer

Extract one generic packaged skill at `skills/write-righting-adapter/` containing the ecosystem-neutral authoring workflow and references to Righting-owned conformance assets, but no runtime adapter code. Publish the conformance specification in `docs/adapter-conformance.md`; keep executable fixtures and registrations under `test/`. Give the nine broad scenario families stable IDs and enforce two-way parity between documented IDs and executable registrations without introducing a manifest schema, generator, or public harness API.

Keep the validated `uets-to-task` Oxlint adapter as dogfood evidence only. A centrally supported or published Oxlint adapter remains a later waypoint and must first pass the complete adapter-neutral suite against pinned versions. Do not extract the local adapter unchanged, assume `eslint-plugin-boundaries` conforms on Oxlint, add an adapter SDK, create ecosystem-specific skills, or promise a compatibility matrix.
