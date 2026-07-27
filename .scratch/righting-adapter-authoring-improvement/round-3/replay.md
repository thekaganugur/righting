# UETS→Task Oxlint adapter — fresh read-only replay

**Recommendation: approve the package-adapter migration, not a new adapter implementation.** The target has a working project-local JS plugin today, but its pinned vendor tarball cannot supply the package adapter and the installed package is an invalid symlink to a mutable tooling checkout. The centrally packaged adapter already passes its complete conformance suite for the exact Oxlint tuple. The required work is packaging/activation proof and retirement of the duplicate local runtime.

## Exact approval request

Approve this one change set:

1. replace the target's local `righting` tarball with immutable **`righting@0.1.0` SHA-256 `327e2c1e6f96e7d0e378b8759f95d53375dfb1b2a359570607d4104fbcee6fa7`**, produced by `npm pack --json --ignore-scripts` from Righting source revision `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd` (the observed package contains `dist/src/oxlint.js`, `docs/oxlint.md`, and `docs/adapter-conformance.md`);
2. change UETS's `.oxlintrc.json` from `"./tools/righting-oxlint-plugin.mjs"` to `{ "name": "righting", "specifier": "righting/oxlint" }`, preserving all five enabled `righting/*` rules and the existing normal lint script;
3. update `package.json` and `package-lock.json` to refer to that artifact and its `oxlint: "1.75.0"` optional peer, with a clean non-symlink install;
4. delete the retired local runtime `tools/righting-oxlint-plugin.mjs`; replace its local conformance test with a package-public-specifier target-activation test; and revise `tools/righting-oxlint-adapter.md` into the target activation/debt record.

Do **not** change `righting.json`, governed source, or the 21 individually approved native directives as part of this approval.

The SHA above was reproduced twice during this replay. It identifies a package built from a tooling worktree that also has an unrelated modified skill and untracked replay files; before committing the target vendor file, recreate the tarball from the reviewed release tree and require this SHA. A mismatch blocks the migration rather than silently accepting a different same-version `0.1.0` tarball.

## Scope and current state

Target: `/Users/kgnugur/Codes/Personal/uets-to-task`, revision `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2`, clean before and after all commands; `git diff --check` passed.

Current target activation is **project-local**, not the package adapter:

- `.oxlintrc.json` loads `./tools/righting-oxlint-plugin.mjs`, enables the five stable diagnostics, and preserves `respectEslintDisableDirectives: false`.
- `package.json` normal command is exactly `oxlint --deny-warnings --report-unused-disable-directives .`; it passed, as did `npm run check` (format, lint, typecheck).
- `tools/righting-oxlint-plugin.test.ts` passed: 4 tests. It exercises the 36 edges, several import forms, classifications/test/generated/composition behavior, and native debt directives.
- The current support note claims complete `role-dependency`, partial `manager-interaction`, unsupported `protected-dependency`/`context-firewall`, and 21 approved exact directives. The directive count is exactly 21.

However, this is not an approval-ready immutable package activation:

- `vendor/righting-0.1.0-569b9eb.tgz` has SHA-256 `0d9a62bc7a4e308f5e6b087dce87bcee42b8e3a18846daee1107ba29c884295b` and **does not export `./oxlint` or contain the Oxlint adapter/docs**.
- `package-lock.json` describes that older tarball (integrity `sha512-kK3wzq3oXWcipshhRPsNpPLHfhBFJh9SyjRoMKm25fNVW34/svnDciQRoGoXQus+JKHcSxEaQ8SVRYS04054Jg==`) and has no Oxlint peer in the Righting record.
- The actual `node_modules/righting` resolves to `/Users/kgnugur/Codes/Personal/righting-software-tooling`; `npm ls righting --depth=0` reports it **invalid**. Thus the current passing local lint cannot establish a clean consumer installed from the committed vendor tarball.

## Trust-boundary capture

Command, from the target root:

```sh
npx righting inspect --json
```

- target revision: `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2`
- policy: `righting.json`, SHA-256 `7680dc72457976fd9f2a50cdf09fb76d0180bdabb322bbf0d99b99aa615429ff`
- exact JSON capture SHA-256: `bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b` (7,628 bytes; full capture below)
- `ok: true`; policy `valid`; inspection schema `1`; normalized contract `1`.

The capture has coverage `src/**/*.{ts,tsx}`, 76 covered files (23 Client, 11 Manager, 24 Engine, 12 ResourceAccess, 0 Resource, 1 Utility), 28 tests, four composition roots, and no unclassified/ambiguous source violations. Its configured aliases are `page`/Client, `component`/Client, and `lib`/Utility; it has `pureEngines` and the explicit Client→Client composition override. Its only package import mapping is `#/* → ./src/*`; no TypeScript paths, bundler aliases, conditional/array imports, or workspace policy is claimed.

`adapter.status: "unknown"` in this capture is intentionally **not** activation evidence.

## Proposed support boundary

**Tested tuple (one tuple, not a compatibility range)**

| Part | Value |
|---|---|
| Righting / adapter | `0.1.0`, candidate SHA above |
| inspection schema / normalized contract | `1` / `1` |
| native host | Oxlint `1.75.0` JS-plugin API (alpha) |
| resolver/matcher | Node relative resolution and string exact/wildcard `package.json#imports`; Micromatch `4.0.8` |
| validation runtime | Node `v26.5.0` |
| target normal command | `oxlint --deny-warnings --report-unused-disable-directives .` |

### Capability dispositions

| Capability | Target applicability | Proposed disposition |
|---|---:|---|
| `role-dependency` | yes | **Claim complete**, after immutable-artifact target activation gate below |
| `manager-interaction` | yes | Partially checkable only: direct Manager→Manager source import is forbidden through `righting/role-dependency`; queued interaction semantics are not established |
| `protected-dependency` | no | Unsupported; packaged adapter rejects a contract where it applies |
| `context-firewall` | no | Unsupported; packaged adapter rejects a contract where it applies |
| `design-judgment` | yes | Unsupported/guidance only |

For the complete claim, preserve the normalized record exactly:

- **establishes:** `configured-role-dependency-boundaries`, `unresolved-local-import-is-forbidden`
- **does not establish:** `files-outside-coverage`, `runtime-dependency-behavior`
- **stable identities:** `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, `righting/test-dependency`.

The additional current limits are contract limits, not defects: files outside coverage remain unchecked; the target's 21 exact rule directives are separately approved legacy debt; native directives are checked for staleness; static findings do not establish runtime behavior, architecture quality, legal/UETS correctness, or maintainer approval.

## Evidence ledger

### Package conformance (passed)

Immutable candidate behavior is package evidence, not target activation evidence. The installed Righting docs were read at `docs/adapter-conformance.md` and `docs/oxlint.md`; the runtime `src/oxlint.ts`, its fixtures, conformance registration, and packed-consumer test were inspected.

| Required family / evidence | Executed public-native command and result |
|---|---|
| all documented family registrations | `node --test dist/test/adapter-conformance.test.js …` — exit 0 |
| `default-role-edges` | package `dist/test/oxlint.test.js`: all 36 canonical ordered edges; allowed exit 0, forbidden exit 1 with `righting/role-dependency` |
| `static-dependency-forms` | same test: static imports, named and star re-exports, literal `require`, dynamic/type-only imports, extension/index, exact/wildcard package imports; forbidden exit 1 with `righting/role-dependency`; unresolved local-like exit 1 with `righting/unresolved-local-import` |
| `canonical-and-alias-classification` | same: canonical and aliases normalize to canonical role semantics; pass/fail exits as required |
| `policy-variations-and-protected-dependencies` | same: normalized variations/override graph is consumed; contracts with applying protected dependency are rejected at plugin load |
| `declared-coverage` | same: covered importer reaching outside coverage and outside importer remain unchecked; exit 0 |
| `source-classification-violations` | same: exit 1 with `righting/unclassified-source` and `righting/ambiguous-source` |
| `test-source-treatment` | same: test outgoing dependencies exit 0; production-to-test exit 1 with `righting/test-dependency` |
| `generated-source-and-composition-roots` | same: generated roles governed; root wiring allowed; production-to-root forbidden with `righting/role-dependency` |
| unsupported `context-firewall` | non-applicable to UETS; adapter rejects applying contracts rather than claiming it |
| native suppressions | same: exact dependency and classification directives exit 0; stale directive exits 1 with `Unused oxlint-disable directive` |
| packed clean consumer | `dist/test/packed-oxlint.test.js`: packs, installs immutable package, loads public `righting/oxlint` through normal pinned Oxlint command; allowed exit 0; intentional forbidden exit 1 with `righting/role-dependency` |

Focused package run:

```sh
cd /Users/kgnugur/Codes/Personal/righting-software-tooling
node --test dist/test/adapter-conformance.test.js dist/test/oxlint.test.js dist/test/packed-oxlint.test.js
```

passed 13/13. Full package validation then passed:

```sh
npm test
```

passed 49/49, including every row above and the packed consumer. `npm run typecheck` also passed. The package docs explicitly limit resolver support to relative paths plus string exact/wildcard `package.json#imports`; the adapter fail-closes unresolved `#` imports and unsupported mappings rather than treating them as external. It verifies Oxlint exactly `1.75.0` at rule traversal. No ESLint composition was adopted: the only evaluated reusable alternative is `eslint-plugin-boundaries` (an ESLint plugin); it is not the Oxlint native route and would add a host bridge without reducing the owned normalized-contract layer.

### Target activation (current vs. required)

| Evidence | Current observation | Approval status |
|---|---|---|
| normal native lint | `npm run lint` exit 0, but loads local `tools/righting-oxlint-plugin.mjs` | proves current local activation only |
| target check | `npm run check` exit 0; `npm test` exit 0 (34 files, 166 tests) | project health passed |
| current local adapter test | `npm exec -- vitest run tools/righting-oxlint-plugin.test.ts` exit 0 (4 tests) | local implementation evidence only |
| candidate adapter against target source | disposable copy of target config/contract/source, package adapter `dist/src/oxlint.js`, command `oxlint --deny-warnings --report-unused-disable-directives src` exit 0 | smoke only; not public package specifier/committed artifact |
| installed committed artifact/public specifier | impossible: committed vendor tar has no `./oxlint`; installed package is invalid symlink | **pending; blocks package activation claim** |

The package's packed consumer is strong package evidence, but it does not make this target active. The target needs the approved artifact installed normally, its public specifier loaded by its unchanged normal command, and a target-specific activation record.

## Exact file change scope

### Righting release artifact (no new adapter runtime required)

- **Add:** a reviewed immutable tarball under UETS `vendor/`, named with the approved digest (for example `righting-0.1.0-327e2c1e6f96.tgz`), whose SHA-256 is the approved value.
- The candidate source already has the required export `"./oxlint": "./dist/src/oxlint.js"`, optional peer `oxlint: "1.75.0"`, packaged docs, and passing test suite. No adapter source change is proposed.

### UETS target

- **Modify:** `package.json`, `package-lock.json` — point at the new tarball; lock the matching integrity and peer resolution.
- **Modify:** `.oxlintrc.json` — one `jsPlugins` entry becomes `{ "name": "righting", "specifier": "righting/oxlint" }`; retain all rule IDs, host plugins/categories, `respectEslintDisableDirectives`, overrides, and the lint script.
- **Delete:** `tools/righting-oxlint-plugin.mjs`.
- **Delete/replace:** `tools/righting-oxlint-plugin.test.ts` with `tools/righting-oxlint-activation.test.ts`. The replacement must use the installed public specifier, run `npm run lint`, and in a disposable project fixture prove one allowed exit 0 and one Manager→Client forbidden exit 1 containing `righting/role-dependency`; it must also retain a stale-directive failure assertion. This is the named replacement for the retired local proof.
- **Modify:** `tools/righting-oxlint-adapter.md` — replace the local-runtime narrative with this artifact identity, contract capture digest/revision, target activation ledger, the 21-directive count, capability limits, and the final commands below.

No source-role migration, policy exception, baseline, broad suppression, or external resolver plugin is proposed.

## Final-tree acceptance gate

After the approved tarball and files are in place, run from UETS root:

```sh
npm ci
npm ls righting oxlint --depth=0
node -p "require.resolve('righting/oxlint')"
npx righting inspect --json
npm exec -- vitest run tools/righting-oxlint-activation.test.ts
npm run lint
npm run check
npm test
git diff --check
```

Required results: `npm ls` has no `invalid` dependency; resolution points into the installed package, not a symlinked tooling checkout; inspection still hashes to the captured policy semantics; the activation fixture's allowed command exits 0 and its forbidden command exits 1 with the stable identity; normal lint passes with all 21 existing directives used; and all final commands exit 0 except the intentionally forbidden/stale fixture commands.

For the package release, retain this independent evidence too:

```sh
cd /Users/kgnugur/Codes/Personal/righting-software-tooling
npm run typecheck
npm test
npm pack --json --ignore-scripts --pack-destination <empty-dir>
shasum -a 256 <empty-dir>/righting-0.1.0.tgz
```

The tarball digest must equal the approved digest before copying it into UETS. The package's packed-consumer Oxlint test is already a clean public-entry-point proof; rerun it as part of `npm test` for the final exact artifact.

## Residual limits and risks

- Oxlint JavaScript plugins are alpha and the claim is exact Oxlint `1.75.0`, not a version range.
- Resolver support remains only relative and string `package.json#imports`; conditional/array imports, TypeScript `paths`, bundler aliases, package-export resolution, non-root invocation, and multi-policy workspaces are unsupported.
- `protected-dependency` and `context-firewall` must remain non-applying; a future policy making either apply must fail at plugin load and needs separate adapter work/conformance.
- `righting inspect` remains policy/classification evidence only. Its unknown adapter status, the normal pass, and 21 native debt directives do not approve architecture, prove runtime behavior, or prove UETS/product correctness.

## Normalized transcription of the retained inspection JSON

This is a formatting-normalized transcription of the captured response; the byte-exact command output is identified by the SHA-256 and byte count in the trust-boundary section above.

```json
{
  "schemaVersion": 1,
  "command": "inspect",
  "ok": true,
  "policy": {"path": "righting.json", "status": "valid"},
  "adapter": {"status": "unknown"},
  "contract": {
    "contractVersion": 1,
    "preset": "volatility@1",
    "roles": ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"],
    "configured": {
      "coverage": ["src/**/*.{ts,tsx}"],
      "aliases": [
        {"name": "page", "role": "Client", "filenameSuffixes": [".page."], "directorySegments": ["routes"]},
        {"name": "component", "role": "Client", "filenameSuffixes": [".component."], "directorySegments": ["components"]},
        {"name": "lib", "role": "Utility", "filenameSuffixes": [], "directorySegments": ["lib"]}
      ],
      "generated": {"filenameMarkers": [".gen."], "directorySegments": []},
      "protectedDependencies": [],
      "variations": ["pureEngines"],
      "overrides": [{"name": "client-composition", "from": "Client", "to": "Client", "effect": "allow", "reason": "Pages and components compose other client-facing components in the approved project structure."}],
      "scopes": [],
      "compositionRoots": ["router", "routeTree", "worker"],
      "guidance": {"domainVocabulary": "CONTEXT.md"}
    },
    "effective": {
      "allowedDependencies": {
        "Client": ["Manager", "Utility", "Client"],
        "Manager": ["Engine", "ResourceAccess", "Utility"],
        "Engine": ["Utility"],
        "ResourceAccess": ["Resource", "Utility"],
        "Resource": ["Utility"],
        "Utility": ["Utility"]
      },
      "conventions": {
        "roles": {
          "Client": {"filenameSuffixes": [".client.", ".page.", ".component."], "directorySegments": ["clients", "routes", "components"]},
          "Manager": {"filenameSuffixes": [".manager."], "directorySegments": ["managers"]},
          "Engine": {"filenameSuffixes": [".engine."], "directorySegments": ["engines"]},
          "ResourceAccess": {"filenameSuffixes": [".access."], "directorySegments": ["access"]},
          "Resource": {"filenameSuffixes": [".resource."], "directorySegments": ["resources"]},
          "Utility": {"filenameSuffixes": [".utility."], "directorySegments": ["utilities", "lib"]}
        },
        "tests": {"filenameMarkers": [".test.", ".spec."], "directorySegments": ["test", "tests", "__tests__"]},
        "generated": {"filenameMarkers": [".generated.", ".gen."], "directorySegments": ["generated"]},
        "compositionRoots": ["composition-root", "router", "routeTree", "worker"]
      },
      "policyRuleIds": ["righting/role-dependency", "righting/unresolved-local-import", "righting/unclassified-source", "righting/ambiguous-source", "righting/test-dependency", "righting/cross-context-dependency", "righting/shared-to-context-dependency", "righting/ambiguous-scope"],
      "protectedDependencyRules": [],
      "scopeRules": [],
      "scopeClassification": null,
      "capabilities": [
        {"id": "role-dependency", "applies": true, "coverage": "statically-enforceable", "policyRuleIds": ["righting/role-dependency", "righting/unresolved-local-import", "righting/unclassified-source", "righting/ambiguous-source", "righting/test-dependency"], "establishes": ["configured-role-dependency-boundaries", "unresolved-local-import-is-forbidden"], "doesNotEstablish": ["files-outside-coverage", "runtime-dependency-behavior"]},
        {"id": "manager-interaction", "applies": true, "coverage": "partially-checkable", "policyRuleIds": ["righting/role-dependency"], "establishes": ["direct-manager-import-is-forbidden"], "doesNotEstablish": ["queued-interaction-semantics"]},
        {"id": "protected-dependency", "applies": false, "coverage": "statically-enforceable", "policyRuleIds": ["righting/role-dependency"], "establishes": ["configured-resource-and-utility-package-classification"], "doesNotEstablish": ["external-service-runtime-behavior", "utility-package-access-restriction"]},
        {"id": "context-firewall", "applies": false, "coverage": "statically-enforceable", "policyRuleIds": ["righting/cross-context-dependency", "righting/shared-to-context-dependency", "righting/ambiguous-scope"], "establishes": ["cross-context-source-import-is-forbidden", "shared-to-context-source-import-is-forbidden"], "doesNotEstablish": ["cross-context-runtime-behavior"]},
        {"id": "design-judgment", "applies": true, "coverage": "guidance-only", "policyRuleIds": [], "establishes": [], "doesNotEstablish": ["role-responsibility", "real-volatility", "contract-quality", "runtime-behavior", "use-case-validity"]}
      ],
      "evidenceLimits": ["files-outside-coverage", "matched-files-are-inspection-evidence", "runtime-behavior", "maintainer-approval", "adapter-activation"]
    }
  },
  "evidence": {
    "sourceSummary": {"covered": 76, "roles": {"Client": 23, "Manager": 11, "Engine": 24, "ResourceAccess": 12, "Resource": 0, "Utility": 1}, "tests": 28, "compositionRoots": 4, "unclassified": 0, "ambiguous": 0},
    "sourceViolations": []
  }
}
```
