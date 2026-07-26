# Deliver the pinned Oxlint adapter

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: claimed
Blocked by:

## Outcome

The Righting package owns a discoverable Oxlint adapter for the exact supported Oxlint tuple, and an installed project can activate it through Oxlint's native JavaScript-plugin entry point while the adapter consumes the unchanged normalized JSON contract.

## Evidence

- The packed package exposes the Oxlint adapter and documents the smallest native configuration that activates its stable `righting/*` diagnostics.
- The adapter fails closed on unsuccessful inspection and unsupported response or contract versions, consumes `righting inspect --json`, and neither imports Righting core nor normalizes `righting.json`.
- Native Oxlint executions pass every adapter-neutral scenario family required by each claimed capability, including all 36 default role edges, static dependency forms and resolution, exact classification and coverage, test/generated/composition-root treatment, variations, protected dependencies when claimed, and scopes when claimed.
- The support record names exact Righting, adapter, Oxlint, and resolver/dependency versions; capability claims and limits; native suppression behavior; commands; and known alpha-API or resolution limits without implying a compatibility matrix.
- A clean packed-artifact project loads the adapter by package specifier and proves one allowed and one forbidden dependency through its normal pinned Oxlint command.
- Focused tests, the full package tests, typecheck, build, and `git diff --check` pass.

## Delivery

Stage: validating
Working context: Oxlint adapter delivery — Pi session `019f9eeb-e0c4-76d3-a3a8-6303747fd641` (`/Users/kgnugur/.pi/agent/sessions/--Users-kgnugur-Codes-Personal-righting-software-tooling--/2026-07-26T14-54-46-468Z_019f9eeb-e0c4-76d3-a3a8-6303747fd641.jsonl`)
Handoff: none
Implementation: `src/oxlint.ts`, `docs/oxlint.md`, package export/dependency metadata, onboarding references, and native/packed evidence in `test/oxlint.test.ts` and `test/packed-oxlint.test.ts`.
Checks: 11 focused native tests, packed package-specifier activation, all 49 package tests, `npm run typecheck`, `npm run build`, and `git diff --check` passed; three review rounds resolved all reported blockers.
