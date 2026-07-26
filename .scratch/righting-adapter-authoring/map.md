# Agent-assisted Righting adapter authoring

Status: resolved
Labels: wayfinder:map

## Destination

Deliver and validate a generic, agent-guided adapter-authoring path that turns the normalized Righting contract into a reusable supported guardrail adapter, proven first by an Oxlint adapter dogfooded in `uets-to-task` and then made discoverable through Righting.

## Notes

- Consult `CONTEXT.md`, `design/2026-07-18-righting-v1.md`, `docs/policy-language.md`, `docs/capabilities.md`, and the packaged Righting skills.
- A guardrail adapter consumes the normalized output of `righting inspect --json`; it never reimplements policy normalization or becomes the source of architectural truth.
- Authoring and conformance must remain generic across JavaScript, Go, Rust, Ruby, and other ecosystems.
- A supported guardrail adapter implements the complete `role-dependency` capability and passes every scenario for each additional capability it claims. Unsupported behavior remains explicit.
- Righting defines language-neutral black-box scenarios; adapters provide native fixtures and commands and map findings to stable Righting policy-rule identities.
- Diagnostics are mandatory. Native suppression and legacy-debt handling are recommended when available but separately declared and tested.
- The first Oxlint dogfood loop uses one pinned version. Support records that tested version only; no compatibility matrix is maintained.
- Prefer the smallest observed interface. Do not introduce a public adapter SDK, ecosystem-specific skill family, or reusable packaging before dogfood evidence requires it.

### Rolling delivery

Current waypoint: none

Delivered:
- [Prove project-local Oxlint adapter authoring](issues/04-prove-project-local-oxlint-adapter-authoring.md) — `uets-to-task` commit `90e8192` consumes contract version 1 through pinned Oxlint, passes complete local `role-dependency` conformance, and keeps exactly 21 approved native legacy-debt suppressions while rejecting new and stale findings.
- [Extract the generic adapter-authoring path](issues/06-extract-generic-adapter-authoring-path.md) — Righting commit `4022aca` ships the generic authoring skill, adapter-neutral conformance contract, and nine ID-linked executable scenario families; clean-archive reproduction and all package checks passed.

## Decisions so far

- [Investigate agent-assisted Righting adapter authoring](issues/01-investigate-agent-assisted-adapter-authoring.md) — Prove a generic authoring path with a project-local Oxlint adapter in `uets-to-task`, then extract only from validated dogfood evidence and grant support through black-box conformance and a Righting-owned catalog.
- [Establish the uets-to-task Oxlint baseline](issues/02-establish-uets-oxlint-baseline.md) — Oxlint 1.75.0 is pinned at `65bfefa9`; the existing lint/check entry points and required project checks passed without Righting adapter behavior.
- [Establish the uets-to-task normalized Righting contract](issues/03-establish-uets-normalized-contract.md) — The approved contract is committed at `d75906c0`; inspection covers 69 files without classification violations and leaves adapter activation explicitly unknown.
- [Decide how the first Oxlint activation handles existing uets-to-task boundary findings](issues/05-decide-existing-uets-boundary-findings.md) — Adopt the 21 approved observations as exact, reasoned native Oxlint legacy-debt suppressions; keep the policy strict, reject broad disables, and fail stale directives and every new finding.
- [Evaluate established guardrail-plugin composition](issues/07-evaluate-guardrail-plugin-composition.md) — Compose host traversal, resolution, policy matching, and suppression where pinned conformance permits; keep normalized semantics, stable identities, unresolved-local behavior, and capability evidence in a thin Righting layer.
- [Choose the first reusable extraction boundary](issues/08-choose-first-extraction-boundary.md) — Ship one generic authoring skill plus documented, ID-linked internal conformance scenarios; defer runtime Oxlint publication and all SDK, manifest, ecosystem-skill, and compatibility-matrix surfaces.

## Not yet specified

- None; the destination is validated.

## Out of scope

- Implementing or deciding the separate `uets-to-task` Biome-to-Oxlint migration.
- Inferring or approving the `uets-to-task` Righting policy as part of adapter authoring.
- Building multiple adapters or testing multiple dogfood projects concurrently.
- Reimplementing Righting policy normalization in adapter languages.
- A universal suppression or legacy-debt format.
- Broad native-tool compatibility matrices.
- The central supported-adapter catalog's storage and presentation; the delivered destination is the reusable authoring path, not a catalog.
- Additional supported Oxlint capability claims; runtime Oxlint publication remains a later effort.
- Ecosystem-specific guidance or a public SDK; the current evidence supports only one generic skill and internal conformance assets.
- A next dogfood project or guardrail ecosystem; selecting one is beyond this validated extraction.
