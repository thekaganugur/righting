# Prove project-local Oxlint adapter authoring

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: resolved
Working context: Pi session 019f9e54-8849-78d9-bc78-dcb44957c270
Blocked by: 02, 03

## Outcome

A project-local Oxlint adapter in `uets-to-task` consumes the approved normalized contract from `righting inspect --json` and enforces the complete `role-dependency` capability through the project's normal pinned-Oxlint workflow, producing evidence strong enough to shape a generic reusable authoring path.

## Evidence

- Language-neutral black-box scenarios cover every required `role-dependency` behavior, with native TypeScript fixtures and commands supplied by the local Oxlint adapter.
- Allowed scenarios pass and forbidden scenarios fail with native diagnostics mapped to the expected stable Righting policy-rule identities.
- The project consumes the normalized JSON contract without reimplementing Righting policy normalization or importing adapter mechanics into core.
- One intentional boundary violation is detected through the project's normal Oxlint command, repaired, and rerun successfully.
- The adapter records its claimed and unsupported capabilities, pinned Oxlint version, and current suppression/legacy-debt limits honestly.
- The project's required lint, focused tests, typecheck, build, and `git diff --check` checks pass.
- The implementation and observed dogfood lessons are linked from this ticket for the next rolling horizon.

## Delivery

Stage: delivered
Working context: Pi session 019f9e54-8849-78d9-bc78-dcb44957c270
Handoff: /tmp/righting-oxlint-adapter-handoff.md

## Comments

A project-local prototype in Pi session `019f9e3f-8fd7-763f-8db6-1e94e8c91258` consumed the normalized contract, passed four black-box tests covering all 36 default role edges, static dependency forms, source classification, test boundaries, generated source, composition roots, coverage, package-import aliases, and unresolved local imports, then activated the five stable `role-dependency` policy-rule identities in Oxlint 1.75.0.

The normal lint path then reported exactly the 21 observations already recorded by the approved policy baseline. Because that approval explicitly classified them as inconsistencies rather than policy exceptions or adapter-native debt, making normal lint green requires a maintainer decision that can change this waypoint's implementation. The prototype was removed from the clean `uets-to-task` working tree; [Decide how the first Oxlint activation handles existing uets-to-task boundary findings](05-decide-existing-uets-boundary-findings.md) now blocks delivery.

## Answer

Delivered in `uets-to-task` commit `90e8192`.

- The project-local plugin consumes `righting inspect --json` contract version 1 without importing Righting core and exposes the five stable `role-dependency` rule identities through Oxlint 1.75.0.
- Four isolated black-box tests cover every role edge, static/type/re-export/require/dynamic forms, exact coverage globs, canonical and alias classification, tests, generated source, composition roots, package `imports`, unresolved local imports, and per-scenario policy-rule identities.
- Normal `npm run lint` keeps the 21 exact approved native suppressions green, rejects new findings in a debt-bearing file, rejects stale directives, and includes covered generated `routeTree` source while selectively suppressing only its native generated-code noise.
- `npm run check`, 147 tests, production build, and `git diff --check` passed; independent standards/spec review found no remaining blocker. The first parallel test run exposed three migration-test timeouts; all three and the full suite passed with one Vitest worker.
- [Support record and dogfood lessons](../../../../uets-to-task/tools/righting-oxlint-adapter.md) capture claims, limits, and the next extraction question. Established guardrail-plugin composition is deliberately deferred to extraction and recorded in map fog rather than changing this validated waypoint.
