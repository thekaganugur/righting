# Deliver the ESLint adapter boundary

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: open
Working context: unclaimed
Stage: shaping
Blocked by: 05

## Outcome

ESLint-specific enforcement, diagnostics, suppression, and debt-growth behavior are owned behind the adapter boundary while consuming the normalized contract unchanged; core retains no ESLint flat-config or suppression lifecycle ownership.

## Evidence

- Core public interfaces and lifecycle commands contain no ESLint flat-config, native suppression, or adapter debt-growth behavior.
- The ESLint adapter exposes its required adoption and grandfathered-debt lifecycle explicitly without adding compatibility reads of retired contract projections.
- Common allowed/forbidden dependency fixtures and adapter-owned debt-growth checks pass through the normalized contract.
- Public documentation distinguishes core contract evidence from adapter activation, native diagnostics, limitations, and debt status.
- `npm run typecheck`, `npm run build`, relevant adapter/package tests, the full test suite, and `git diff --check` pass.
