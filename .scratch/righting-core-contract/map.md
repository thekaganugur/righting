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

Current waypoint: [Deliver the ESLint adapter boundary](issues/07-deliver-eslint-adapter-boundary.md)

Delivered:
- [Deliver the adapter-neutral contract core](issues/04-deliver-adapter-neutral-contract-core.md) — A versioned convention-led contract, deterministic core helpers, and matching coding-agent/adapter semantics now ship through `righting/core`.

## Decisions so far

<!-- Closed tickets only. -->

- [Define the normalized contract surface](issues/01-define-normalized-contract-surface.md) — Approved policies normalize to one versioned, self-contained, adapter-neutral rules contract shared by coding agents and guardrails; repository snapshots and adapter mechanics stay outside.
- [Define convention and alias semantics](issues/02-define-convention-and-alias-semantics.md) — `volatility@1` classifies declared coverage through additive canonical, project-alias, and evidenced project-generated filename conventions, with explicit test, generated-source, composition-root, ambiguity, and unmatched-source behavior; generated status may apply to a canonical role or composition root.
- [Choose compatibility for existing policies](issues/03-choose-existing-policy-compatibility.md) — The unused mapping-based policy and inspection projections are replaced atomically in place; the exact incomplete starter remains, while packaged consumers move together to the convention-led contract.

## Not yet specified

<!-- The current delivery frontier and live decision tickets own all presently specifiable concerns. -->

## Out of scope

- Migrating existing project code to zero architectural debt.
- A universal suppression or legacy-debt format in core.
- Automatic architecture inference, policy completion, or source refactoring.
- Runtime-behavior proof or automatic adapter generation.
