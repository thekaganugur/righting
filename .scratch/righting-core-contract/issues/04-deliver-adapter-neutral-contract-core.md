# Deliver the adapter-neutral contract core

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: open
Working context: unclaimed
Stage: ready
Blocked by: 01, 02, 03

## Outcome

A versioned, convention-led Righting contract and minimal normalization/inspection helpers exist as an adapter-neutral core interface. Canonical filename conventions and project alias semantics are implemented, the chosen compatibility behavior is observable, and consumers need no ESLint or suppression knowledge to interpret the contract.

## Evidence

- Contract fixtures demonstrate equivalent normalized semantics for a coding-agent consumer and a minimal adapter consumer.
- Canonical conventions, aliases, coverage, ambiguity, variations, overrides, scopes, and protected dependencies have deterministic contract tests.
- Core contract modules and public documentation contain no ESLint config or suppression-file requirements.
- The exact incomplete starter, new minimal complete policy, no-overwrite behavior, and redefined schema-version-1 envelope are covered; no migration compatibility remains.
- `npm run typecheck`, `npm run build`, relevant contract/package tests, and `git diff --check` pass.

## Handoff

Delivery path: one fresh implementation context.

Read the map, [Define the normalized contract surface](01-define-normalized-contract-surface.md), [Define convention and alias semantics](02-define-convention-and-alias-semantics.md), [Choose compatibility for existing policies](03-choose-existing-policy-compatibility.md), and [`CONTEXT.md`](../../../CONTEXT.md). Replace the policy parser and inspection projection with the approved contract, translate that contract in the packaged ESLint adapter, then update package documentation, skills, fixtures, and tests atomically. Follow the repository's implementation and TDD skills; validate against every item under `## Evidence`.
