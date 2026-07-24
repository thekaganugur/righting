# Deliver the ESLint adapter boundary

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: resolved
Working context: unclaimed
Stage: delivered
Blocked by: 05

## Outcome

ESLint-specific enforcement, diagnostics, suppression, and debt-growth behavior are owned behind the adapter boundary while consuming the normalized contract unchanged; core retains no ESLint flat-config or suppression lifecycle ownership.

## Evidence

- Core public interfaces and lifecycle commands contain no ESLint flat-config, native suppression, or adapter debt-growth behavior.
- The ESLint adapter exposes its required adoption and grandfathered-debt lifecycle explicitly without adding compatibility reads of retired contract projections.
- Common allowed/forbidden dependency fixtures and adapter-owned debt-growth checks pass through the normalized contract.
- Public documentation distinguishes core contract evidence from adapter activation, native diagnostics, limitations, and debt status.
- `npm run typecheck`, `npm run build`, relevant adapter/package tests, the full test suite, and `git diff --check` pass.

## Answer

Delivered the ESLint adapter boundary:

- Removed the `righting baseline` lifecycle, core policy-expansion comparison, suppression normalizer, and their public exports without compatibility reads.
- Kept `eslintConfig()` consuming the normalized contract and retained the common allowed/forbidden dependency conformance suite.
- Replaced custom baseline tests with native ESLint adoption, unchanged-lint growth failure, stale-count detection, and `--prune-suppressions` evidence in `test/eslint-suppressions.test.ts`.
- Updated `docs/eslint.md`, `docs/legacy-debt.md`, the packaged `righting-eslint`/`righting-integrate` skills, the design, and dogfood record so contract evidence, adapter activation, diagnostics, legacy-debt status, approval, and native lifecycle ownership remain distinct.
- Verified `npm run typecheck`, `npm run build`, relevant adapter/package tests, all 36 tests through `npm test`, and `git diff --check`.

Implementation: `src/cli.ts`, `src/eslint.ts`, `src/policy.ts`, removed `src/baseline.ts` and `src/suppressions.ts`; evidence: `test/eslint.test.ts`, `test/eslint-suppressions.test.ts`, and `test/package-documentation.test.ts`.
