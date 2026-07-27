# Fresh dogfood replay — project-local Oxlint adapter

**Decision requested: do not approve the current complete `role-dependency` claim. Approve the three-file hardening and conformance scope below; no product, policy, source-under-`src`, staging, or commit change is proposed in this replay.**

## Replay boundary and immutable inputs

- Target: `/Users/kgnugur/Codes/Personal/uets-to-task`, Git `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2`; working tree was clean before and after all commands.
- Current local-adapter source identity: Git blob `06e6e7f4d3b13f4fabbd84617218fe8f032ad3a7`, SHA-256 `781a358301fb9ec3bb92343a91542a2287b26447d3ff1b4c1a0a7051a6f26871`, `tools/righting-oxlint-plugin.mjs` (267 lines). Its test blob is `8d58a879975633f8b412d5078fda9ad447d5bdbe`, SHA-256 `f4aa165a52a9e7fbf08c7d3d933846a501c57f685a4abbb02f95d4b470d9c640`.
- The Righting CLI artifact intended by `package-lock.json` is `vendor/righting-0.1.0-569b9eb.tgz`, package `righting@0.1.0`, lock integrity `sha512-kK3wzq3oXWcipshhRPsNpPLHfhBFJh9SyjRoMKm25fNVW34/svnDciQRoGoXQus+JKHcSxEaQ8SVRYS04054Jg==`, SHA-256 `0d9a62bc7a4e308f5e6b087dce87bcee42b8e3a18846daee1107ba29c884295b`.
- Native tuple observed: Oxlint `1.75.0` (lock integrity `sha512-m9WzjRcRYA/uqIZDa9tclrieoPJ/ln1QYTKdFx6NUOs8uY5DiHlIwRQoCrHT6OM6O3ww3l2skY5gO7G7ZphE7g==`), Micromatch `4.0.8`, Node `v26.5.0`, npm `11.17.0`, macOS arm64 binding `@oxlint/binding-darwin-arm64@1.75.0`.
- Native public entry point is `npm run lint` → `oxlint --deny-warnings --report-unused-disable-directives .`. `.oxlintrc.json` explicitly loads `./tools/righting-oxlint-plugin.mjs` and enables the five stable `righting/*` rules. Thus the normal command does load the project-local adapter; Righting inspection's `adapter.status: "unknown"` is not used as activation evidence.

### Installation integrity finding

The *actual* `node_modules/righting` is a symlink to `/Users/kgnugur/Codes/Personal/righting-software-tooling` at `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd`, not the locked vendor archive; `npm ls righting` reports it invalid. That linked working tree is modified and exposes `righting/oxlint`, while the immutable vendor archive does **not** export `./oxlint` and does not ship the Oxlint docs. The local adapter does not use that export, but this means the installed docs/source are not immutable package evidence. Do **not** change `.oxlintrc.json` to `righting/oxlint` for the locked artifact.

A temporary, read-only reconstruction of the vendor package (with its declared Micromatch dependency made available) ran `node <extracted-vendor>/dist/src/cli.js inspect --json` from the target root. Its output was byte-for-byte identical to the capture below. Therefore the local adapter can continue to consume the pinned vendor CLI; before final approval, restore a lock-faithful install with `npm ci` and re-run the gate.

## Exact normalized-contract capture

Command, from target root:

```sh
npx righting inspect --json
```

Exit: `0`. Capture SHA-256: `bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b`. Policy: `righting.json`, status `valid`; inspection schema `1`; normalized contract version `1`; `ok: true`.

```json
{
  "schemaVersion": 1,
  "command": "inspect",
  "ok": true,
  "policy": { "path": "righting.json", "status": "valid" },
  "adapter": { "status": "unknown" },
  "contract": {
    "contractVersion": 1,
    "preset": "volatility@1",
    "roles": ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"],
    "configured": {
      "coverage": ["src/**/*.{ts,tsx}"],
      "aliases": [
        { "name": "page", "role": "Client", "filenameSuffixes": [".page."], "directorySegments": ["routes"] },
        { "name": "component", "role": "Client", "filenameSuffixes": [".component."], "directorySegments": ["components"] },
        { "name": "lib", "role": "Utility", "filenameSuffixes": [], "directorySegments": ["lib"] }
      ],
      "generated": { "filenameMarkers": [".gen."], "directorySegments": [] },
      "protectedDependencies": [],
      "variations": ["pureEngines"],
      "overrides": [{ "name": "client-composition", "from": "Client", "to": "Client", "effect": "allow", "reason": "Pages and components compose other client-facing components in the approved project structure." }],
      "scopes": [],
      "compositionRoots": ["router", "routeTree", "worker"],
      "guidance": { "domainVocabulary": "CONTEXT.md" }
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
          "Client": { "filenameSuffixes": [".client.", ".page.", ".component."], "directorySegments": ["clients", "routes", "components"] },
          "Manager": { "filenameSuffixes": [".manager."], "directorySegments": ["managers"] },
          "Engine": { "filenameSuffixes": [".engine."], "directorySegments": ["engines"] },
          "ResourceAccess": { "filenameSuffixes": [".access."], "directorySegments": ["access"] },
          "Resource": { "filenameSuffixes": [".resource."], "directorySegments": ["resources"] },
          "Utility": { "filenameSuffixes": [".utility."], "directorySegments": ["utilities", "lib"] }
        },
        "tests": { "filenameMarkers": [".test.", ".spec."], "directorySegments": ["test", "tests", "__tests__"] },
        "generated": { "filenameMarkers": [".generated.", ".gen."], "directorySegments": ["generated"] },
        "compositionRoots": ["composition-root", "router", "routeTree", "worker"]
      },
      "policyRuleIds": ["righting/role-dependency", "righting/unresolved-local-import", "righting/unclassified-source", "righting/ambiguous-source", "righting/test-dependency", "righting/cross-context-dependency", "righting/shared-to-context-dependency", "righting/ambiguous-scope"],
      "protectedDependencyRules": [],
      "scopeRules": [],
      "scopeClassification": null,
      "capabilities": [
        { "id": "role-dependency", "applies": true, "coverage": "statically-enforceable", "policyRuleIds": ["righting/role-dependency", "righting/unresolved-local-import", "righting/unclassified-source", "righting/ambiguous-source", "righting/test-dependency"], "establishes": ["configured-role-dependency-boundaries", "unresolved-local-import-is-forbidden"], "doesNotEstablish": ["files-outside-coverage", "runtime-dependency-behavior"] },
        { "id": "manager-interaction", "applies": true, "coverage": "partially-checkable", "policyRuleIds": ["righting/role-dependency"], "establishes": ["direct-manager-import-is-forbidden"], "doesNotEstablish": ["queued-interaction-semantics"] },
        { "id": "protected-dependency", "applies": false, "coverage": "statically-enforceable", "policyRuleIds": ["righting/role-dependency"], "establishes": ["configured-resource-and-utility-package-classification"], "doesNotEstablish": ["external-service-runtime-behavior", "utility-package-access-restriction"] },
        { "id": "context-firewall", "applies": false, "coverage": "statically-enforceable", "policyRuleIds": ["righting/cross-context-dependency", "righting/shared-to-context-dependency", "righting/ambiguous-scope"], "establishes": ["cross-context-source-import-is-forbidden", "shared-to-context-source-import-is-forbidden"], "doesNotEstablish": ["cross-context-runtime-behavior"] },
        { "id": "design-judgment", "applies": true, "coverage": "guidance-only", "policyRuleIds": [], "establishes": [], "doesNotEstablish": ["role-responsibility", "real-volatility", "contract-quality", "runtime-behavior", "use-case-validity"] }
      ],
      "evidenceLimits": ["files-outside-coverage", "matched-files-are-inspection-evidence", "runtime-behavior", "maintainer-approval", "adapter-activation"]
    }
  },
  "evidence": { "sourceSummary": { "covered": 76, "roles": { "Client": 23, "Manager": 11, "Engine": 24, "ResourceAccess": 12, "Resource": 0, "Utility": 1 }, "tests": 28, "compositionRoots": 4, "unclassified": 0, "ambiguous": 0 }, "sourceViolations": [] }
}
```

## What current evidence establishes—and does not

Current `tools/righting-oxlint-plugin.test.ts` passes 4 tests and does exercise all 36 default role pairs, five main dependency forms, the target `#/` alias, basic classification/test/generated/root cases, and stale-directive behavior. `npm run lint` also exits `0`; it found 21 exact `righting/role-dependency` native directives, with no broad disable or baseline.

That is useful dogfood evidence, but it is not the shipped conformance gate. The installed `adapter-conformance.md` requires separate public-native rows for declared coverage; canonical **and each configured alias** classification; both test treatments; complete generated/root treatment; extension/index and named/star re-export forms; variations/overrides; and fail-closed local-like aliases. The current four condensed tests do not furnish all of those rows.

There is also a reproduced correctness gap. In an isolated temporary fixture using the current public Oxlint configuration and current project-local plugin:

```ts
// src/unknown.client.ts
import "#not-configured";
```

exited `0` with no finding. The control `import "./does-not-exist"` exited `1` with `righting/unresolved-local-import`. The source cause is `localTarget()` returning `{ local: false }` when `aliasPath()` has no mapping (lines 104–117). An unmapped `#` package import is local-like and must fail closed, not be treated as external. This alone blocks the claimed complete `role-dependency` capability.

The plugin also accepts only `contractVersion: 1` (lines 7–18); it does not explicitly require `ok`, inspection schema 1, command `inspect`, or `policy.status: valid`; it neither pins/checks the host API version nor rejects a contract where unsupported static `protected-dependency` or `context-firewall` becomes applicable. These are trust-boundary gaps, even though the captured target does not apply either static extra capability.

## Proposed approval scope

**Modify only these tracked files:**

1. `tools/righting-oxlint-plugin.mjs`
   - Validate the complete CLI envelope before reading the contract: successful process/JSON, `ok === true`, `schemaVersion === 1`, command `inspect`, valid policy, and `contractVersion === 1`.
   - Pin the JavaScript-plugin host at Oxlint `1.75.0` and fail before traversal on another host/parser version.
   - Reject load when `protected-dependency` or `context-firewall` applies; retain only the five rule identities for this local adapter.
   - Define relative paths and `#` package-import specifiers as local-like. Resolve only string exact/wildcard `package.json#imports` targets; preserve exact-over-wildcard and most-specific wildcard precedence; do not fall through from an unsupported/matched mapping. Unmatched or unsupported `#` mappings must report `righting/unresolved-local-import`. Keep extension/index resolution and the target’s `#/* → ./src/*` behavior.
   - Continue to consume only normalized inspection JSON; do not parse `righting.json` or import `righting/core`.

2. `tools/righting-oxlint-plugin.test.ts`
   - Replace the four compressed cases with public-Oxlint, temporary-fixture rows for every applicable `role-dependency` family: all 36 edges; static/named/star re-export/literal-require/dynamic/type-only forms; extension/index and target alias; all canonical and configured-alias filename/directory conventions; the target variation and override from isolated normalized inspections; covered/outside-coverage boundary; unclassified/ambiguous; filename and directory test treatment; generated role source and exact roots; native exact suppression plus stale detection.
   - Add explicit unmatched `#`, unsupported mapping, exact-vs-wildcard and overlapping wildcard precedence cases; assert stable diagnostics and exits (`0` allowed, `1` forbidden).
   - Add invalid/incomplete inspection and unsupported-applicable-capability load-failure cases.

3. `tools/righting-oxlint-adapter.md`
   - Replace the current 17-line assertion with the final support record: final source commit/blob identity; vendor/archive and lock identity; capture hash; exact tuple; all matrix rows and observed exits/diagnostics; the 21-directive native-suppression evidence; and the capability limits below. It must say this is a **project-local** adapter, not imply a `righting/oxlint` export from `righting-0.1.0-569b9eb.tgz`.

**No changes:** `righting.json`, `.oxlintrc.json`, `package.json`, `package-lock.json`, `vendor/righting-0.1.0-569b9eb.tgz`, application files, or legacy-debt directives. The normal lint command remains the public entry point.

## Post-change acceptance gate

After the approved changes, first restore the intended lock resolution with `npm ci`; verify `readlink node_modules/righting` is not an external workspace link and `npm ls righting oxlint micromatch --depth=0` is clean. Then run:

```sh
npx righting inspect --json
npx vitest run tools/righting-oxlint-plugin.test.ts
npm run lint
npm test
npm run check
npx oxfmt --check tools/righting-oxlint-plugin.mjs tools/righting-oxlint-plugin.test.ts
git diff --check
```

The final support record must capture the first command, attach its SHA-256, and record each scenario command’s allowed/forbidden exits and `righting/*` finding. A clean consumer-style temporary fixture must load the local plugin through the same normal `npm run lint` command with the locked vendor CLI, not through an internal helper.

## Capability disposition after the gate

- **Claim: `role-dependency` (complete, only after every listed row passes).** Establishes `configured-role-dependency-boundaries` and `unresolved-local-import-is-forbidden`; rules are `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, and `righting/test-dependency`. It does not establish `files-outside-coverage` or `runtime-dependency-behavior`.
- **Claim: `manager-interaction` only in its normalized partial sense.** The role-edge matrix establishes `direct-manager-import-is-forbidden` through `righting/role-dependency`; it does not establish `queued-interaction-semantics`.
- **Unsupported/inapplicable: `protected-dependency` and `context-firewall`.** They are `applies: false` in this capture. A policy that makes either apply must fail adapter load, not yield a partial claim. Their normalized establishes/does-not-establish strings are not claimed by this adapter.
- **Unsupported: `design-judgment`.** It is guidance-only and establishes none of role responsibility, real volatility, contract quality, runtime behavior, or use-case validity.

## Observed validation in this read-only replay

| Command / check | Result |
| --- | --- |
| `npx righting inspect --json` | PASS, exit 0; exact capture above. |
| Extracted immutable vendor CLI against the same target | PASS; byte-identical capture and SHA-256. |
| `npx vitest run tools/righting-oxlint-plugin.test.ts` | PASS, 1 file / 4 tests, 2.70 s. Evidence only; insufficient family coverage. |
| `npm run lint` | PASS, exit 0. |
| `npx oxfmt --check tools/righting-oxlint-plugin.mjs tools/righting-oxlint-plugin.test.ts` | PASS. |
| `git diff --check` and status | PASS; no diff and clean target worktree. |
| Current unmapped `#not-configured` fixture | **FAIL**, exit 0/no diagnostic; blocks approval. |
| Current missing-relative control | PASS, exit 1 with `righting/unresolved-local-import`. |
| `npm test`, `npm run check`, clean-install consumer run | Not run in this read-only replay; required post-change. |

## Residual limits

Even after approval, this remains one exact version tuple, not a compatibility matrix. Oxlint’s JavaScript-plugin API is alpha; only Oxlint 1.75.0 is supported. Resolver coverage remains intentionally bounded to relative source paths and string `package.json#imports` mappings—no TypeScript `paths`, bundler aliases, package-export resolution, conditional/array import targets, multi-policy workspaces, or non-root invocation. Static findings do not prove runtime behavior, architectural quality, authority over UETS, or maintainer approval; they govern only covered source. The 21 legacy directives remain debt and can hide precisely their annotated old edge until repaired, although stale directives are rejected.

## Explicit approval request

**Approve exactly the three-file local-adapter hardening scope and acceptance gate above, with the current complete `role-dependency` claim withheld until its final matrix passes under a lock-faithful `npm ci` install.**
