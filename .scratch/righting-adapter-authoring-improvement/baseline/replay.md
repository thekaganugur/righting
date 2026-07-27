# Fresh UETS-to-Task Oxlint adapter replay

**Replay date:** 2026-07-27
**Dogfood repository:** `/Users/kgnugur/Codes/Personal/uets-to-task` at `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2` (`chore: refresh local Righting skill links`)
**Repository treatment:** read-only; no project file, index, or commit was changed. `git status --short` was empty and `git diff --check` exited 0.

## Decision requested

**Do not approve the current project-local adapter's broad “complete `role-dependency`” support record as a reusable/currently reproducible claim.** Approve the narrow migration below, conditional on a clean-consumer validation. No new adapter runtime behavior is needed: the already-tested package-owned `righting/oxlint` implementation is the approval candidate.

**Maintainer approval request:**

> Approve replacing UETS-to-Task's obsolete project-local Oxlint plugin with the exact packaged Righting artifact at `righting-software-tooling` commit `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd` and its public `righting/oxlint` entry point, pinned to Oxlint `1.75.0`. Preserve the five existing `righting/*` rules and the 21 exact native legacy-debt directives. Accept the capability and limits stated below, after the listed clean-install validation passes.

This is deliberately not approval of the 21 suppressed imports as allowed architecture. The existing recorded decision keeps them as individually approved pre-adapter legacy debt.

## Trust boundary and inspected contract

Command run from the dogfood root:

```sh
npx righting inspect --json
```

It exited 0 with `ok: true`, `schemaVersion: 1`, policy `{ path: "righting.json", status: "valid" }`, `adapter.status: "unknown"`, and `contract.contractVersion: 1`. `unknown` is inspection state, not activation evidence.

The normalized input is `volatility@1`, coverage `src/**/*.{ts,tsx}`, roles `Client`, `Manager`, `Engine`, `ResourceAccess`, `Resource`, and `Utility`; aliases `page → Client` (`.page.`, `routes`), `component → Client` (`.component.`, `components`), and `lib → Utility` (`lib`); generated marker `.gen.`; variation `pureEngines`; the approved Client→Client `client-composition` override; and composition roots `router`, `routeTree`, `worker`. There are no protected dependencies or scopes.

Inspection source evidence was: **76 covered files**, roles Client 23 / Manager 11 / Engine 24 / ResourceAccess 12 / Resource 0 / Utility 1, 28 tests, 4 composition roots, and zero unclassified, ambiguous, or source violations.

Applicable capability dispositions:

| Capability | Disposition | Contract evidence |
|---|---|---|
| `role-dependency` | **claim, after migration validation** | Rules: `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, `righting/test-dependency`. Establishes `configured-role-dependency-boundaries` and `unresolved-local-import-is-forbidden`; does not establish `files-outside-coverage` or `runtime-dependency-behavior`. |
| `manager-interaction` | **partially checkable only** | `righting/role-dependency` establishes `direct-manager-import-is-forbidden`; it does not establish `queued-interaction-semantics`. |
| `protected-dependency` | **unsupported, not applicable** | `applies: false`; package adapter rejects load if it later applies. |
| `context-firewall` | **unsupported, not applicable** | `applies: false`; package adapter rejects load if it later applies. |
| `design-judgment` | **not an enforcement claim** | Guidance only; does not establish role responsibility, real volatility, contract quality, runtime behavior, or use-case validity. |

## What is active today, and why approval is not yet warranted

The established configuration is `.oxlintrc.json`:

```json
"jsPlugins": ["./tools/righting-oxlint-plugin.mjs"]
```

with the five stable rules enabled as errors and the normal command:

```sh
oxlint --deny-warnings --report-unused-disable-directives .
```

The local plugin (`tools/righting-oxlint-plugin.mjs`) does consume `righting inspect --json`, has the five stable native rule identities, and does not import `righting/core`. Its focused suite passed:

```sh
npx vitest run tools/righting-oxlint-plugin.test.ts --config vitest.config.ts
# PASS (4) FAIL (0)
```

The current direct native command also exited 0:

```sh
./node_modules/.bin/oxlint --deny-warnings --report-unused-disable-directives .
```

However, the local implementation/support record is an older, frozen project copy (its source SHA-256 is unchanged from dogfood commit `90e8192`), not the complete published adapter. It does not explicitly validate inspection `ok`, policy validity, or inspection schema version; does not reject newly applicable `protected-dependency` or `context-firewall`; does not verify the runtime host version; and its four project tests do not supply the complete adapter-neutral proof for the support record's broad resolution/variation claim. In particular, it is not the package implementation that proves overlapping package-import precedence and fail-closed unsupported mappings, nor the packed-consumer entry point.

There is a reproducibility blocker in the committed dependency state:

- `package.json` and `package-lock.json` name `file:vendor/righting-0.1.0-569b9eb.tgz`.
- That tarball's `package.json` exports only `./core` and `./eslint`; it contains neither `./oxlint` nor `docs/oxlint.md`.
- `npm ls righting oxlint --depth=0` reported Righting **invalid**.
- The installed `node_modules/righting` is instead a symlink to the mutable sibling checkout `/Users/kgnugur/Codes/Personal/righting-software-tooling`.

Therefore the apparent installed `righting/oxlint` export is masked by a local symlink and cannot be claimed from this project's committed lock/artifact.

## Approval candidate: package-owned adapter

The sibling Righting checkout at exact commit `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd` supplies `righting/oxlint`, version `0.1.0`, with exact peer `oxlint: 1.75.0`; the actual host reported `Oxlint 1.75.0`, Node `v26.5.0`, and Micromatch `4.0.8` is the adapter dependency. It uses the packaged CLI boundary (`inspect --json`), supports inspection and contract version 1, verifies the Oxlint 1.75.0 parser, and fails closed for invalid inspection, unsupported version, unresolved local package import, and newly applicable unsupported static capabilities.

`node_modules/righting/docs/adapter-conformance.md` requires every `role-dependency` family: all 36 default edges; static dependency forms; canonical/alias classification; variations; coverage; classification violations; test treatment; and generated/composition-root treatment. It requires further families only for additionally claimed applicable capabilities.

`node_modules/righting/docs/oxlint.md` records the supported tuple and the same five stable diagnostics. Its direct resolver limit is intentional: relative paths plus string exact/wildcard `package.json#imports` targets; no conditional/array imports, TypeScript paths, bundler aliases, package-export resolution, non-root invocation, or multi-policy workspaces. This project uses the supported `#/* → ./src/*` form.

Package validation was run from that exact Righting checkout:

```sh
npm test                         # 49 passed, 0 failed
npm run typecheck                # passed
npm run build                    # passed
git diff --check                 # passed
```

The 49 passing tests include all 11 native Oxlint conformance tests and one clean packed-consumer test. The latter installed the packed artifact, configured `{ "name": "righting", "specifier": "righting/oxlint" }`, passed allowed normal lint, and failed an intentional forbidden Manager→Client import with `righting/role-dependency`.

A read-only temporary mirror of this exact dogfood contract and `src/`, with copied `.gitignore`/`CONTEXT.md` and only the proposed plugin registration substituted, also passed:

```sh
oxlint --deny-warnings --report-unused-disable-directives .
# CENTRAL_MIRROR_EXIT=0
```

This is target-contract smoke evidence, not a replacement for the clean consumer gate.

## Proposed project change scope

1. **Reproducible artifact:** package the exact Righting commit above (or a released artifact with the same verified source), add that tarball under `vendor/`, and update `package.json` and `package-lock.json` together. The resulting lock must resolve the artifact that exports `righting/oxlint`, ships `docs/oxlint.md`, and declares exact Oxlint `1.75.0` peer support. Do not retain the old `righting-0.1.0-569b9eb.tgz` as the dependency source.
2. **Activation:** in `.oxlintrc.json`, replace only
   ```json
   "jsPlugins": ["./tools/righting-oxlint-plugin.mjs"]
   ```
   with
   ```json
   "jsPlugins": [{ "name": "righting", "specifier": "righting/oxlint" }]
   ```
   Keep categories, existing non-Righting plugins/rules, the five Righting rules, `respectEslintDisableDirectives: false`, route-tree override, and the normal lint command unchanged.
3. **Retire duplicate local runtime and proof:** delete `tools/righting-oxlint-plugin.mjs` and `tools/righting-oxlint-plugin.test.ts`. Update or replace `tools/righting-oxlint-adapter.md` so it points to the package support record and only records this project's activation tuple, 21 native directives, and residual limits; it must not independently claim unproven generic support.
4. **Do not change:** `righting.json`, production source, policy role graph, or any of the 21 exact `righting/role-dependency` directives. No ESLint/plugin composition, resolver package, generated manifest, or new SDK is needed.

## Required acceptance validation after the change

Run from a clean checkout after `npm ci` (so the symlink cannot mask the vendored artifact):

```sh
npx righting inspect --json
npm run lint
npm run check
npx vitest run tools/righting-oxlint-plugin.test.ts --config vitest.config.ts   # replace with an activation/consumer smoke test; do not retain the deleted local test
npm test
npm run build
git diff --check
npm ls righting oxlint --depth=0
```

The activation smoke must use the public `righting/oxlint` specifier, demonstrate an allowed file exits 0 and an intentional forbidden local fixture exits 1 with the expected stable `righting/role-dependency` diagnostic, and prove one current `#/*` alias. Retain separate proof that an unused exact native directive fails under `--report-unused-disable-directives`; retain the existing proof that a second unsuppressed violation in a debt-bearing file fails.

A harness anomaly should be resolved/rechecked during that clean run: two standalone invocations of `npm run lint` in this replay returned 127 with `sh: eslint: command not found`, while the exact same lint script ran and exited 0 inside `npm run check`, and direct Oxlint exited 0. Do not count the standalone command as green until a clean process/checkout yields 0; it is not evidence of an adapter diagnostic failure.

## Residual limits

- Static evidence does not establish files outside `src/**/*.{ts,tsx}`, runtime dependency behavior, queued Manager interaction semantics, design quality, or maintainer approval.
- The adapter remains intentionally pinned to the single Oxlint `1.75.0` JavaScript-plugin API tuple; that API is alpha. No compatibility range is claimed.
- If protected dependencies or context scopes become applicable, the adapter must fail at load and must not be silently partially enforced; another conformance-backed capability expansion is required.
- The package-import resolver ceiling above remains. This project is currently within it; adding TS/bundler aliases, conditional mappings, or multi-policy workspace operation requires a fresh adapter decision and test.
- Native directives are exact, line-local legacy debt only. They are neither a baseline nor a policy exception and must be removed when each offending import is repaired.

## Replay conclusion

The normalized project policy is valid and its current local guardrail is demonstrably active, but its broader support record is superseded by a better package-owned adapter and is not reproducible from the committed Righting tarball. The only material approval work is artifact/lock repair plus the narrow public-entry-point activation and duplicate-local-runtime retirement. With the clean-install validation above, approve the package-owned adapter for this exact project/Righting/Oxlint tuple and the stated `role-dependency` claim—no wider claim.
