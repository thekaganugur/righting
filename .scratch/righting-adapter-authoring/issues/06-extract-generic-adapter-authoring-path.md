# Extract the generic adapter-authoring path

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: resolved
Working context: generic-adapter-extraction validation — session `019f9edf-b67f-7606-aac4-f08e26aa9491` (`/Users/kgnugur/.pi/agent/sessions/--Users-kgnugur-Codes-Personal-righting-software-tooling--/2026-07-26T14-41-29-215Z_019f9edf-b67f-7606-aac4-f08e26aa9491.jsonl`)
Blocked by: 07, 08

## Outcome

Righting ships a generic, ecosystem-neutral `write-righting-adapter` path extracted from the validated Oxlint dogfood evidence, with a reusable conformance contract and honest guidance on composing existing guardrail tools before writing adapter mechanics.

## Evidence

- The packaged authoring guidance starts from `righting inspect --json`, stable policy-rule identities, capability claims, and adapter-neutral black-box scenarios rather than Oxlint-specific implementation details.
- A fresh agent can use the path to reproduce or meaningfully extend the validated adapter without importing Righting core or reimplementing policy normalization.
- The path tells authors when to compose established native or ESLint-compatible guardrails and when a small custom layer remains necessary, backed by the composition investigation.
- Package documentation and tests make the path discoverable and verify that all required assets ship.
- Focused tests, full package tests, typecheck, build, and `git diff --check` pass.

## Delivery

Stage: delivered
Working context: generic-adapter-extraction validation — session `019f9edf-b67f-7606-aac4-f08e26aa9491` (`/Users/kgnugur/.pi/agent/sessions/--Users-kgnugur-Codes-Personal-righting-software-tooling--/2026-07-26T14-41-29-215Z_019f9edf-b67f-7606-aac4-f08e26aa9491.jsonl`)
Handoff: /tmp/righting-adapter-extraction-implementation-handoff.md
Implementation: commit `4022aca` — `skills/write-righting-adapter/`, `docs/adapter-conformance.md`, and ID-linked executable registrations/fixtures under `test/`.
Checks: current-worktree focused adapter/package tests (14 passed), `npm test` (37 passed), `npm run typecheck`, `npm run build`, and `git diff --check`; independent clean-archive validation reproduced the generic path and passed its focused tests (22 passed). Review artifact: `/var/folders/0g/nvztjn4d1pv5hxlz9py_nynm0000gn/T/pi-subagents-uid-501/async-subagent-runs/99db5462-b122-4346-8d3b-b9bac5d2b0aa/output-0.log`.

## Answer

Validated commit `4022aca`. The package ships a discoverable ecosystem-neutral `write-righting-adapter` skill and adapter-neutral conformance contract, keeps all nine executable scenario-family registrations internal under `test/`, and directs authors to consume `righting inspect --json`, preserve stable `righting/*` identities, bound capability claims, and compose established native mechanics before owning custom behavior. Package installation/discovery checks, two-way documentation/execution parity, the full 37-test suite, typecheck, build, and diff checks pass. A fresh-context reviewer reproduced the public native lint path from a clean archive without importing `righting/core` in the fixture and found no blocker; reusable Oxlint runtime publication remains deliberately deferred.
