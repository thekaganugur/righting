# Fresh UETS Oxlint adapter replay — approval packet

**Decision requested:** do **not** approve the current project-local adapter's `complete role-dependency` claim. Approve the bounded replacement below: consume the already-conformant packaged `righting/oxlint` adapter from one newly built, immutable Righting artifact; retire the local plugin; and approve the claim only after the listed package and target activation gates pass against that artifact.

This was a read-only replay of `/Users/kgnugur/Codes/Personal/uets-to-task`. No target file was modified, staged, or committed.

## Capture and trust boundary

| Item | Evidence |
|---|---|
| Target revision | `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2` (`2026-07-27`, `chore: refresh local Righting skill links`) |
| Local-adapter introduction | `90e81927c96a823136eedcc1efa2ce33cd6d8b52`, `Prove project-local Righting Oxlint adapter` |
| Exact inspection command | `npx righting inspect --json` |
| Capture | `/tmp/uets-righting-inspect.json`, 7,628 bytes, SHA-256 `bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b` |
| Inspection result | exit 0; `ok: true`; policy `righting.json`, `valid`; `schemaVersion: 1`; `contract.contractVersion: 1`; adapter status `unknown` (not activation evidence) |
| Captured source evidence | 76 covered files; Client 23, Manager 11, Engine 24, ResourceAccess 12, Resource 0, Utility 1; tests 28; composition roots 4; unclassified 0; ambiguous 0; source violations `[]` |
| Actual host tuple | Node `v26.5.0`; npm `11.17.0`; Oxlint `1.75.0`; Righting declares `0.1.0`; Micromatch `4.0.8` |
| Normal native entry point | `npm run lint` = `oxlint --deny-warnings --report-unused-disable-directives .` |
| Current activation evidence | `.oxlintrc.json` loads `./tools/righting-oxlint-plugin.mjs` and enables all five `righting/*` diagnostics. `oxlint --print-config` confirms that plugin; `npm run lint` exited 0. This establishes the **local** plugin is active, not that a packaged adapter is active. |

The capture is suitable contract input: the policy is valid and both versions are 1. The target has `package.json#imports` `#/* -> ./src/*`; live source uses that alias extensively. There are no `protectedDependencies` or scopes in the captured contract.

## Current capability disposition

| Capability | Captured applicability and contract meaning | Current local disposition | Proposed packaged disposition |
|---|---|---|---|
| `role-dependency` | Applies; establishes `configured-role-dependency-boundaries` and `unresolved-local-import-is-forbidden`; does not establish `files-outside-coverage` or `runtime-dependency-behavior`; rules: `role-dependency`, `unresolved-local-import`, `unclassified-source`, `ambiguous-source`, `test-dependency` | **Not approvable as complete.** The source has fail-open `#` resolution cases below. | **Claim after gates pass.** Same five rule IDs and limits. |
| `manager-interaction` | Applies, partially checkable; establishes `direct-manager-import-is-forbidden`; does not establish `queued-interaction-semantics`; rule `role-dependency` | Direct edge is exercised by the 36-edge test, but must not be promoted beyond partial evidence. | Same partial claim only. |
| `protected-dependency` | Does not apply; establishes (when applicable) configured Resource/Utility package classification; does not establish external-service runtime behavior or Utility package access restriction; rule `role-dependency` | Unsupported, but the local code does not reject an applicable contract. | Unsupported and **fail closed at plugin load** if it becomes applicable. |
| `context-firewall` | Does not apply; establishes (when applicable) forbidden cross-context/shared-to-context source imports; does not establish cross-context runtime behavior; rules `cross-context-dependency`, `shared-to-context-dependency`, `ambiguous-scope` | Unsupported, but the local code does not reject an applicable contract. | Unsupported and **fail closed at plugin load** if it becomes applicable. |
| `design-judgment` | Applies, guidance-only; no rule IDs; establishes nothing; does not establish role responsibility, real volatility, contract quality, runtime behavior, or use-case validity | Unsupported / outside static enforcement. | Same. |

The current policy rule IDs are the five `role-dependency` IDs above; the three scope IDs remain unclaimed. `manager-interaction` and `design-judgment` must remain explicitly limited even after approval.

## Why the existing claim is blocked

### 1. Reproduced local-resolution fail-open

I copied only the existing local plugin into an isolated `/tmp` fixture, symlinked the target's installed dependencies, and invoked Oxlint's public command. The target was untouched.

| Scenario | Expected by conformance / skill boundary | Observed local-plugin result |
|---|---|---|
| Covered Client imports unmatched local-like `#missing` | exit 1 with `righting/unresolved-local-import` | **exit 0**, no diagnostic |
| Covered Client imports `#blocked/...` whose matching `package.json#imports` target is an unsupported object mapping | exit 1 with `righting/unresolved-local-import` | **exit 0**, no diagnostic |
| Overlapping `#*` then more-specific `#x/*`, Manager imports `#x/view.client.js` | Node-style most-specific mapping: a Client target, therefore `righting/role-dependency: Manager cannot depend on Client` | exit 1, but it resolved the earlier broad `#*` and reported `Manager cannot depend on Manager` |

`tools/righting-oxlint-plugin.mjs` returns `{ local: false }` when `aliasPath()` finds no candidate, silently treating unmatched `#` imports as external; it also uses first object insertion order rather than most-specific mapping precedence. The file has no contract-capability check, so an applicable protected-dependency or context-firewall contract would load without being enforced. These are not merely missing documentation: the first two are observed bypasses of the required unresolved-local diagnostic.

The existing local Vitest suite passed (`npx vitest run tools/righting-oxlint-plugin.test.ts --config vitest.config.ts`: 4/4), and normal lint passed. Those results are useful regression evidence for ordinary relative imports and the configured `#/*` happy path, but do not cover the failed cases above or make the broad support statement true.

### 2. The dependency actually executed is not the locked artifact

`package-lock.json` identifies `vendor/righting-0.1.0-569b9eb.tgz` with integrity `sha512-kK3wzq3oXWcipshhRPsNpPLHfhBFJh9SyjRoMKm25fNVW34/svnDciQRoGoXQus+JKHcSxEaQ8SVRYS04054Jg==`; its SHA-256 is `0d9a62bc7a4e308f5e6b087dce87bcee42b8e3a18846daee1107ba29c884295b`. That tarball contains neither `dist/src/oxlint.js` nor `docs/adapter-conformance.md`.

Instead, this working tree's `node_modules/righting` is a symlink to mutable `/Users/kgnugur/Codes/Personal/righting-software-tooling` at `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd`, not the lockfile's vendor archive. Thus this replay's inspect CLI was not loaded from the immutable artifact named by the project. The local plugin itself is tracked target source, but its contract producer was mutable. No immutable packaged adapter artifact is currently installed or activated by the target.

## Reusable candidate evaluated

The Righting repository already contains the narrower candidate at source revision `b6aa8f7c6381a0a98934f6c5ec3b20ea3b583629` (`Add pinned supported Oxlint adapter`), unchanged in `src/oxlint.ts`, `docs/oxlint.md`, `test/oxlint.test.ts`, and `test/packed-oxlint.test.ts` since that commit. It is preferable to patching/maintaining the project-local implementation:

- public entry point: `righting/oxlint`, configured as `{ "name": "righting", "specifier": "righting/oxlint" }`;
- thin layer: validates inspection `ok`, valid policy, inspection and contract version 1; rejects applicable unsupported static capabilities; classifies only from normalized conventions; translates effective edges; emits stable five `righting/*` identities; and treats unresolved local-like `#` specifiers as errors;
- local resolution: relative paths plus exact/wildcard string `package.json#imports`, exact before wildcard and most-specific pattern precedence; unsupported/absent mappings fail closed; documented exclusions are conditional/array imports targets, TypeScript/bundler aliases, package exports, workspaces, and non-root invocation;
- host composition: Oxlint's public JavaScript-plugin lifecycle/parser/traversal and native directive reporting. No `eslint-plugin-boundaries` composition is proposed: it is an ESLint integration and adds no smaller conforming Oxlint path.

I ran its already-built public-native tests in the tooling repository:

```sh
node --test dist/test/oxlint.test.js dist/test/packed-oxlint.test.js
npm run typecheck
```

Observed: 12/12 passing (11 conformance/native tests plus one packed clean-consumer public-entry test) and typecheck exit 0. The packed test installs a non-symlink package in a temporary consumer, passes its normal lint, and produces the deliberate forbidden `righting/role-dependency` finding. This is strong candidate evidence, but its temporary tarball was removed by the test and therefore is **not** the immutable artifact to approve.

## Proposed approved change scope

### Righting artifact repository

1. From a clean checkout at `b6aa8f7c6381a0a98934f6c5ec3b20ea3b583629`, build and retain a tarball containing the already-tested `righting/oxlint` export, its `docs/oxlint.md`, and `docs/adapter-conformance.md`.
2. Record the tarball filename, `npm pack --json` output, SHA-512/SHA-256, package version, lock resolution, and the exact source revision in its release/support record. Do not reuse or overwrite `righting-0.1.0-569b9eb.tgz`; it demonstrably predates the adapter. A release/version decision that makes the new archive distinguishable is required.
3. Run the documented final package checks from the clean checkout: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`, then a clean consumer install of that retained tarball with exact `oxlint@1.75.0`; confirm the installed package is not a symlink, its integrity/digest matches, `righting/oxlint` loads, and `docs/oxlint.md` is shipped.

No runtime change is currently required in `src/oxlint.ts`: the observed candidate tests cover the local-resolution defects, all required role-dependency families, unsupported-capability rejection, native suppression, and clean packed consumption. The artifact/release proof is required because no retained immutable artifact currently contains it.

### UETS target repository

| Action | Path | Purpose |
|---|---|---|
| Modify | `package.json`, `package-lock.json`, `vendor/<new-righting-artifact>.tgz` | Pin the retained artifact exactly; remove direct `micromatch` if no other target code needs it. Ensure lock integrity resolves to the new archive, not a symlink. |
| Modify | `.oxlintrc.json` | Replace `"./tools/righting-oxlint-plugin.mjs"` with `{ "name": "righting", "specifier": "righting/oxlint" }`; retain the existing five enabled stable rule IDs, native directives, and normal command. |
| Delete | `tools/righting-oxlint-plugin.mjs` | Retire the fail-open project-local implementation. |
| Rename and expand | `tools/righting-oxlint-plugin.test.ts` → `tools/righting-oxlint-adapter.test.ts` | Test the public package specifier through the normal Oxlint command, not a copied plugin. Preserve the legacy-debt test and add the target-contract matrix listed below. |
| Rewrite (retain as target activation record) | `tools/righting-oxlint-adapter.md` | Replace the present local implementation claim with artifact digest/revision, this inspection capture, version tuple, capability limits, command results, suppression policy, and one row per scenario family. |
| Add | `tools/righting-oxlint-contract.json` | Commit the exact final `righting inspect --json` capture used by the activation tests and record its SHA-256 in the activation record. |

No product source, policy semantics, coverage, legacy directives, staging, or commit history should change as part of this adapter migration.

## Acceptance gate and conformance ledger

The following is the final-tree, copy-paste execution sequence after the approved changes. Substitute only the approved retained tarball filename and digest; run in a clean target checkout after `npm ci`, not with a linked `node_modules/righting`.

```sh
# Righting clean release checkout at the approved source revision
npm ci
npm test
npm run typecheck
npm run build
git diff --check
npm pack --json --pack-destination /tmp/righting-oxlint-release
shasum -a 256 /tmp/righting-oxlint-release/*.tgz
shasum -a 512 /tmp/righting-oxlint-release/*.tgz

# Target checkout after the approved package/config/test/documentation edits
rm -rf node_modules
npm ci
node -p "require('./node_modules/righting/package.json').version"
test ! -L node_modules/righting
npx righting inspect --json > tools/righting-oxlint-contract.json
shasum -a 256 tools/righting-oxlint-contract.json
npx vitest run tools/righting-oxlint-adapter.test.ts --config vitest.config.ts
npm run lint
npm run check
git diff --check
```

| Applicable scenario family | Contract / native fixture and public command | Expected → required observed status |
|---|---|---|
| `default-role-edges` | Final `tools/righting-oxlint-contract.json`; all 36 target-effective role pairs through `npm run lint` | every allowed edge 0/no Righting finding; every other edge 1/`righting/role-dependency` |
| `static-dependency-forms` | Same capture; static import, named/star re-export, literal require, dynamic/type import, extension and index, configured `#/*`, unmatched local-like `#`, and unsupported mapping fixtures | allowed 0; forbidden 1 with `role-dependency`; unresolved 1 with `unresolved-local-import` |
| `canonical-and-alias-classification` | Canonical filename/directory forms plus `page`, `component`, and `lib` aliases from the final capture | allowed 0; role-equivalent aliases produce canonical semantics; conflict 1/`ambiguous-source` |
| `policy-variations-and-protected-dependencies` | Current `pureEngines` + `client-composition` effective graph is represented by the 36-edge matrix; isolated inspected policies exercise supported variation/override behavior and applicable protected rejection | graph outcomes as captured; protected contract plugin load exits 1/fail closed |
| `declared-coverage` | Covered importer crossing to outside plus outside importer fixture | both remain unchecked where the capture says outside (0) without expanding coverage |
| `source-classification-violations` | covered unclassified and multi-role fixtures | 1 with `unclassified-source` and `ambiguous-source` respectively |
| `test-source-treatment` | filename and directory test fixtures, outgoing test exemption, production-to-test dependency | test outgoing 0; production-to-test 1/`test-dependency` |
| `generated-source-and-composition-roots` | generated canonical role, exact `router`/`routeTree`/`worker` roots, unrelated suffix fixture | generated forbidden edge 1/`role-dependency`; root wiring 0; governed-to-root 1/`role-dependency` |

`context-firewall` is not applicable and remains explicitly unsupported/fail-closed; it has no target scenario row. The package's focused suite separately supplies its rejected-capability scenario. Native suppression is declared evidence, not part of the capability claim: retain one dependency and one classification directive fixture plus a stale-directive fixture under `--deny-warnings --report-unused-disable-directives`.

A target activation result is not package conformance: both classes above must pass. The package-level 12-test replay is candidate evidence only; rerun the final package commands against the retained artifact before recording `passed`.

## Residual limits after approval

- Exact tuple only: Righting artifact identified by its final digest/revision, inspection schema 1, contract version 1, Node 26.5.0, Oxlint 1.75.0, Micromatch 4.0.8. This is not a compatibility matrix. Oxlint's JavaScript-plugin API is alpha.
- Local resolution is deliberately limited to relative paths and string `package.json#imports` exact/wildcard targets. Conditional/array targets, `tsconfig`/bundler aliases, package exports, workspaces, absolute imports, and non-root execution are unsupported; unsupported local-like forms must fail closed rather than become external.
- Static evidence never establishes runtime dependency behavior, outside-coverage behavior, design judgment, queued Manager interaction semantics, external-service behavior, or bounded-context runtime behavior.
- Current 21 exact, rule-specific legacy directives remain debt, not approved architecture exceptions. The normal command rejects stale directives; each directive must be removed when its dependency is repaired.
- `adapter.status: unknown` in inspection remains non-evidence. Activation is established only by the public config/normal lint and the intentional forbidden fixture using the final installed archive.

## Exact approval request

**Approve the migration from `tools/righting-oxlint-plugin.mjs` to one newly retained, digest-pinned `righting/oxlint` artifact built from `b6aa8f7c6381a0a98934f6c5ec3b20ea3b583629`, with the UETS target scope and acceptance gate above. Do not approve the current local adapter's complete `role-dependency` support record; approve the packaged adapter claim only when the retained artifact and both package-level conformance and target-contract activation records pass.**
