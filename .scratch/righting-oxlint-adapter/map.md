# Centrally supported Oxlint adapter

Status: resolved
Labels: wayfinder:map

## Destination

Deliver and validate a discoverable Righting-owned Oxlint adapter that consumes the normalized contract through the shipped authoring path, supports one pinned Oxlint version, and carries reproducible black-box conformance evidence.

## Notes

- Consult `CONTEXT.md`, `docs/adapter-conformance.md`, `docs/capabilities.md`, `skills/righting-adapter-authoring/SKILL.md`, and the validated `uets-to-task` Oxlint dogfood record.
- Preserve the guardrail-adapter boundary: consume `righting inspect --json`; do not import Righting core or normalize `righting.json` in the adapter.
- Support means complete `role-dependency` behavior plus every additional claimed capability passing Righting's black-box scenario families for the declared contract and native-tool versions.
- Pin and support one Oxlint tuple only; do not imply a compatibility range or matrix.
- Prefer the smallest package-owned runtime, configuration surface, support record, and packed-artifact proof that make the adapter central and reproducible.

### Rolling delivery

Current waypoint: none

Delivered:
- [Deliver the pinned Oxlint adapter](issues/01-deliver-pinned-oxlint-adapter.md) — Righting commit `b6aa8f7` exports the exact-Oxlint-1.75.0 adapter, passes complete claimed-capability conformance plus packed-consumer activation, and publishes its reproducible support record.

## Decisions so far

- [Choose the first reusable extraction boundary](../righting-adapter-authoring/issues/08-choose-first-extraction-boundary.md) — The shipped generic authoring skill and conformance contract are the approved authoring path; reusable Oxlint runtime publication waits for complete pinned-version conformance.

## Not yet specified

- None visible before the first complete pinned-tuple conformance run.

## Out of scope

- Supporting more than one Oxlint version or publishing a compatibility matrix.
- Migrating existing projects from project-local adapters or another lint tool.
- Adding a public adapter SDK, manifest schema, generator, or ecosystem-specific authoring skill.
- Changing the normalized contract or inferring project architecture from source.
