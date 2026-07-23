# Adapter-neutral Righting contract

Status: open
Labels: wayfinder:map

## Destination

Deliver a small, versioned, opinionated Righting contract and minimal core helpers that coding agents and independently implemented adapters consume as the same source of truth, while adapter mechanics and legacy-debt storage remain outside core.

## Notes

- Core owns canonical roles, opinionated conventions, normalized policy semantics, and explicit maintainer decisions.
- Adapters own translation into native enforcement, resolution, suppression, and debt-growth behavior.
- Coding agents consume the same normalized contract to route new code and respect architectural intent before adapter feedback.
- Aliases express project vocabulary and alternate naming conventions; they are not an inventory of the codebase.
- Existing inconsistencies describe adoption impact and adapter-native debt, not automatic policy exceptions or a required migration.
- Preserve the book-aligned closed architecture in `/Users/kgnugur/Codes/Bucket/righting-software/book/INDEX.md`; deviations remain explicit maintainer decisions.
- Consult `design/2026-07-18-righting-v1.md`, `docs/policy-language.md`, `docs/capabilities.md`, and the packaged Righting skills.

### Rolling delivery

Current waypoint: [Deliver the adapter-neutral contract core](issues/04-deliver-adapter-neutral-contract-core.md)

Delivered:

## Decisions so far

<!-- Closed tickets only. -->

## Not yet specified

- The adapter-authoring and conformance surface after the normalized contract exists.
- How adapter-native suppression limitations and guardrail status are presented uniformly without core owning their formats.
- The agent-facing guidance and `righting-integrate` lifecycle after conventions replace exhaustive mappings.
- Release and migration evidence for existing consumers of the v1 policy language and JSON inspection contract.

## Out of scope

- Migrating existing project code to zero architectural debt.
- A universal suppression or legacy-debt format in core.
- Automatic architecture inference, policy completion, or source refactoring.
- Runtime-behavior proof or automatic adapter generation.
