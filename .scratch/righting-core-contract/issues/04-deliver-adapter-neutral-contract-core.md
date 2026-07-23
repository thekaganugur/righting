# Deliver the adapter-neutral contract core

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: open
Stage: shaping
Blocked by: 01, 02, 03

## Outcome

A versioned, convention-led Righting contract and minimal normalization/inspection helpers exist as an adapter-neutral core interface. Canonical filename conventions and project alias semantics are implemented, the chosen compatibility behavior is observable, and consumers need no ESLint or suppression knowledge to interpret the contract.

## Evidence

- Contract fixtures demonstrate equivalent normalized semantics for a coding-agent consumer and a minimal adapter consumer.
- Canonical conventions, aliases, coverage, ambiguity, variations, overrides, scopes, and protected dependencies have deterministic contract tests.
- Core contract modules and public documentation contain no ESLint config or suppression-file requirements.
- Existing compatibility behavior is covered by the decision's required fixtures or migration diagnostics.
- `npm run typecheck`, `npm run build`, relevant contract/package tests, and `git diff --check` pass.
