# Fresh UETS → Righting Oxlint replay

**Decision:** do **not** approve the current project-local adapter's documented complete `role-dependency` claim. Approve the replacement proposal below only after its required ledger is green.

## Scope and non-mutation

- Dogfood repository: `/Users/kgnugur/Codes/Personal/uets-to-task`, revision `806a18680a5f4c2f6d4fcb0ae8f5cfd4785c6cd2`.
- It was clean before and after this replay; `git diff --check` exited 0. No dogfood file was changed, staged, or committed.
- Product evidence read: `AGENTS.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, and `tickets.md`. They do not alter the architecture-policy boundary; `AGENTS.md` requires normalized inspection before covered-code changes and says adapter activation is separately verified.
- Normal native path is exactly `npm run lint` → `oxlint --deny-warnings --report-unused-disable-directives .`.

## Trust-boundary capture

Command, working directory, and raw-capture identity:

```sh
cd /Users/kgnugur/Codes/Personal/uets-to-task
npx righting inspect --json > /tmp/uets-righting-inspect-806a186.json
shasum -a 256 /tmp/uets-righting-inspect-806a186.json
# bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b
```

The capture exited 0: `schemaVersion: 1`, `ok: true`, policy path `righting.json`, policy status `valid`, adapter status `unknown`, and `contract.contractVersion: 1`. The unknown adapter status is not treated as activation evidence.

The exact captured normalized facts are: preset `volatility@1`; coverage `src/**/*.{ts,tsx}`; six roles `Client, Manager, Engine, ResourceAccess, Resource, Utility`; aliases `page → Client` (`.page.`, `routes`), `component → Client` (`.component.`, `components`), and `lib → Utility` (`lib`); generated markers `.generated.` and `.gen.`; variation `pureEngines`; approved `Client → Client` override; composition roots `composition-root`, `router`, `routeTree`, `worker`; no protected dependencies and no scopes. Its effective graph is:

```json
{"Client":["Manager","Utility","Client"],"Manager":["Engine","ResourceAccess","Utility"],"Engine":["Utility"],"ResourceAccess":["Resource","Utility"],"Resource":["Utility"],"Utility":["Utility"]}
```

Inspection source evidence was 76 covered files (Client 23, Manager 11, Engine 24, ResourceAccess 12, Resource 0, Utility 1), 28 tests, 4 composition roots, and zero unclassified, ambiguous, or source violations. The policy rule IDs are `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, `righting/test-dependency`, `righting/cross-context-dependency`, `righting/shared-to-context-dependency`, and `righting/ambiguous-scope`.

The raw JSON remains at the named capture path above and is bound by its SHA-256. A second target-consumer capture through the proposed packed public entry point had the *same* SHA-256.

## Artifact and host evidence

| Item | Observed identity / disposition |
|---|---|
| Current declared package artifact | `vendor/righting-0.1.0-569b9eb.tgz`, SHA-256 `0d9a62bc7a4e308f5e6b087dce87bcee42b8e3a18846daee1107ba29c884295b`, lock integrity `sha512-kK3wzq3oXWcipshhRPsNpPLHfhBFJh9SyjRoMKm25fNVW34/svnDciQRoGoXQus+JKHcSxEaQ8SVRYS04054Jg==`. It has no `./oxlint` export, no Oxlint peer, and ships neither `docs/oxlint.md` nor `docs/adapter-conformance.md`. It cannot be the claimed adapter artifact. |
| Actual current runtime | `node_modules/righting` is a mutable symlink to `/Users/kgnugur/Codes/Personal/righting-software-tooling` at source revision `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd`; that checkout is dirty outside this task. `npm ls` reports the declared Righting dependency invalid. Thus normal lint currently exercises a mutable checkout, not the locked vendor artifact. |
| Current project-local implementation | `.oxlintrc.json` loads `./tools/righting-oxlint-plugin.mjs`; it consumes inspection JSON but validates only contract version, implements five rules, and is documented in `tools/righting-oxlint-adapter.md`. Its four-test suite is not a complete record of every conformance family. |
| Candidate reusable adapter | Current Righting source provides `righting/oxlint`, public `docs/oxlint.md`, `docs/adapter-conformance.md`, `test/oxlint.test.ts`, and `test/packed-oxlint.test.ts`. It pins Oxlint `1.75.0`, validates inspection schema plus contract version, rejects applicable protected/context contracts fail-closed, preserves stable messages, and tests resolution precedence/unsupported mappings. This is the selected adapter. |
| Other reusable adapter considered | `righting/eslint` / `eslint-plugin-boundaries` are ESLint-specific. This host is Oxlint JavaScript plugins, so they do not provide an activation seam here. No composition is proposed. |
| Native tuple actually observed | Node `v26.5.0`, npm `11.17.0`, Oxlint runtime `1.75.0`, Micromatch `4.0.8`, Righting `0.1.0`, inspection schema `1`, contract `1`. |

Two fresh materializations of Righting source revision `66d9c4e6a186521b5c61ed92f1bc80fa3e17a5cd`, each with `npm ci --ignore-scripts` followed by `npm pack`, produced byte-identical artifacts after the same literal build step (`prepack` → `npm run build`):

```text
SHA-256 d63e0e09b72f904d7e19e419fa839800017a3f1a254f0fb5a9f3daaf8922db64
size    42029 bytes
npm integrity sha512-f9TnoiJMvwj5p2r97NM3TFLEDsGdQVbOUncsufntbLrhTeccCrj2R4zVv3h2AjRkPZ2m6hNI5iMmA7ziUmcJ2A==
```

That artifact ships `dist/src/oxlint.js`, `docs/oxlint.md`, and `docs/adapter-conformance.md`. It is the one proposed immutable artifact; it is distinct from the currently declared vendor tarball despite sharing package version `0.1.0`.

## Capability boundary

| Capability | Target applies | Proposed disposition | Establishes / does not establish | Rules |
|---|---:|---|---|---|
| `role-dependency` | yes | **claim complete only after required ledger passes** | establishes `configured-role-dependency-boundaries`, `unresolved-local-import-is-forbidden`; does not establish `files-outside-coverage`, `runtime-dependency-behavior` | five role-dependency rules listed below |
| `manager-interaction` | yes | partial only | establishes `direct-manager-import-is-forbidden`; does not establish `queued-interaction-semantics` | `righting/role-dependency` |
| `protected-dependency` | no | unsupported; public adapter must reject it if it becomes applicable | establishes `configured-resource-and-utility-package-classification`; does not establish external-service runtime behavior or utility-package access restriction | `righting/role-dependency` |
| `context-firewall` | no | unsupported; public adapter must reject it if it becomes applicable | establishes source-only cross/shared restrictions; does not establish cross-context runtime behavior | `righting/cross-context-dependency`, `righting/shared-to-context-dependency`, `righting/ambiguous-scope` |
| `design-judgment` | yes | unsupported/guidance only | establishes nothing; does not establish responsibility, volatility, contract quality, runtime behavior, or use-case validity | none |

The complete claim's stable IDs are `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, and `righting/test-dependency`.

## Passed ledger (executed evidence, not planned evidence)

### Package conformance

| Scenario / check | Executed artifact and fixture | Public command | Observed |
|---|---|---|---|
| Adapter-conformance registration parity | packed-source build at `66d9c4e`; adapter conformance fixture | `node --test dist/test/adapter-conformance.test.js dist/test/oxlint.test.js dist/test/packed-oxlint.test.js` | exit 0; 13/13 passed |
| `default-role-edges` | packaged `righting/oxlint`; dependency conformance fixture | same command | exit 0; all 36, forbidden identity `righting/role-dependency` |
| `static-dependency-forms` | same | same command | exit 0; static, named/star re-export, require, dynamic/type, extension/index, package imports, precedence, unsupported/unmatched local-like mappings; forbidden identity `righting/unresolved-local-import` or `righting/role-dependency` |
| classification, variations, coverage, source violations, tests, generated/composition | same | same command | exit 0; all applicable role-dependency families passed with the required stable IDs |
| native directives | same | same command | exit 0; exact dependency/classification directives pass and stale directive fails |
| packed clean consumer | produced `d63e…db64` tarball | same command's packed-consumer test | exit 0; allowed normal lint 0 and intentional forbidden lint 1 with `righting/role-dependency` |
| deterministic artifact | two fresh source materializations | `npm ci --ignore-scripts && npm pack` twice | exit 0; equal SHA-256 `d63e…db64` |

### Target activation

| Check | Fixture / command | Observed |
|---|---|---|
| Existing local-adapter focused suite | `npx vitest run tools/righting-oxlint-plugin.test.ts` | exit 0; 1 file, 4 tests. This is evidence of current behavior, not complete conformance. |
| Existing normal lint | `npm run lint` | exit 0; project-local plugin loads on the normal path. |
| Target product regression checks | `npm test`, `npm run format:check`, `npm run typecheck`, `git diff --check` | all exit 0; 34/34 test files and 166/166 tests passed. |
| Proposed packed adapter, exact target policy/source/config in an isolated consumer | install immutable `d63e…db64` tarball and `oxlint@1.75.0`; `npm run lint` | exit 0; public `righting/oxlint` loads and full target source lint is clean. The inspection capture SHA was `bfb18…4e7b`. |
| Intentional target forbidden edge | isolated `src/replay-forbidden.manager.ts` importing `./replay-forbidden.client`; same normal command | exit 1; `righting/role-dependency: Manager cannot depend on Client.` |

## Required ledger (blocks approval of the support claim)

| Blocking item | Exact planned fixture and command | Expected result | Observed |
|---|---|---|---|
| Righting package full gate | Repair the portable symlink-target assertion in `righting-software-tooling/test/init.test.ts`, then `npm test` | exit 0; 49 tests passed | **pending**. Fresh run had 48 pass/1 fail: `righting init --skills creates repeatable relative links and preflights collisions` compared lexical `/tmp/...` to canonical `/private/tmp/...`. It is unrelated to Oxlint semantics but blocks the skill's full-package gate. |
| Package typecheck/build/diff after repair | `npm run typecheck && npm run build && git diff --check` in Righting source | all exit 0 | **pending** |
| Final immutable artifact proof | Two fresh clones of the repaired Righting source, `npm ci --ignore-scripts && npm pack` each, `cmp`, and SHA check | both SHA-256 `d63e0e09b72f904d7e19e419fa839800017a3f1a254f0fb5a9f3daaf8922db64` | **pending** after repair (the pre-repair package bytes already matched this value) |
| Final target lock and public activation | clean clone of UETS final tree; `npm ci`, `npx righting inspect --json`, `npm run lint`, then the isolated intentional forbidden file | inspect SHA `bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b`; allowed exit 0; forbidden exit 1 with `righting/role-dependency` | **pending** |
| Final target regressions | `npm test && npm run check && git diff --check` | all exit 0 | **pending** |

## Exact proposed scope

### Add

1. `uets-to-task/vendor/righting-0.1.0-66d9c4e.tgz`: the byte-identical `d63e0e09b72f904d7e19e419fa839800017a3f1a254f0fb5a9f3daaf8922db64` artifact, with the stated SHA-512 lock integrity.

### Change

1. `righting-software-tooling/test/init.test.ts`: make only the symlink-target comparison canonical (`realpathSync` on both resolved target paths). This repairs the demonstrated `/tmp` versus `/private/tmp` test-only false failure; it changes no shipped adapter code or tarball contents.
2. `uets-to-task/package.json`: replace exactly `file:vendor/righting-0.1.0-569b9eb.tgz` with `file:vendor/righting-0.1.0-66d9c4e.tgz`.
3. `uets-to-task/package-lock.json`: resolve `node_modules/righting` to `file:vendor/righting-0.1.0-66d9c4e.tgz`, integrity `sha512-f9TnoiJMvwj5p2r97NM3TFLEDsGdQVbOUncsufntbLrhTeccCrj2R4zVv3h2AjRkPZ2m6hNI5iMmA7ziUmcJ2A==`, with the packed artifact's `oxlint: 1.75.0` optional peer. Do not retain the old tar's ESLint-only peer record.
4. `uets-to-task/.oxlintrc.json`: replace the string JS plugin `"./tools/righting-oxlint-plugin.mjs"` with the explicit public entry `{ "name": "righting", "specifier": "righting/oxlint" }`; retain the five enabled stable rules, categories, options, overrides, and unchanged `npm run lint` command.

### Delete

1. `uets-to-task/vendor/righting-0.1.0-569b9eb.tgz`.
2. `uets-to-task/tools/righting-oxlint-plugin.mjs`.
3. `uets-to-task/tools/righting-oxlint-plugin.test.ts`.
4. `uets-to-task/tools/righting-oxlint-adapter.md`.

No changes to `righting.json`, source architecture, normal lint script, suppression directives, product tickets, or generated routes are proposed. The old focused local-plugin test is retired only because the packaged adapter's `test/oxlint.test.ts`, `test/packed-oxlint.test.ts`, shipped `docs/oxlint.md`, and the final clean-target activation replay replace it by name.

## Literal final-tree acceptance commands

Run after the listed adds/changes/deletes, from the stated directories.

```sh
# 1. Repair and validate the adapter source; this is outside the dogfood repository.
cd /Users/kgnugur/Codes/Personal/righting-software-tooling
npm ci --ignore-scripts
npm test                         # expected: 49 pass, 0 fail
npm run typecheck                # expected: exit 0
npm run build                    # expected: exit 0
git diff --check                 # expected: exit 0

# 2. Produce the one approved artifact twice from fresh materializations.
rm -rf /tmp/righting-oxlint-pack-one /tmp/righting-oxlint-pack-two
mkdir -p /tmp/righting-oxlint-pack-one /tmp/righting-oxlint-pack-two
git clone --no-local /Users/kgnugur/Codes/Personal/righting-software-tooling /tmp/righting-oxlint-pack-one/source
git clone --no-local /Users/kgnugur/Codes/Personal/righting-software-tooling /tmp/righting-oxlint-pack-two/source
(cd /tmp/righting-oxlint-pack-one/source && npm ci --ignore-scripts && npm pack --pack-destination /tmp/righting-oxlint-pack-one)
(cd /tmp/righting-oxlint-pack-two/source && npm ci --ignore-scripts && npm pack --pack-destination /tmp/righting-oxlint-pack-two)
cmp /tmp/righting-oxlint-pack-one/righting-0.1.0.tgz /tmp/righting-oxlint-pack-two/righting-0.1.0.tgz
shasum -a 256 /tmp/righting-oxlint-pack-one/righting-0.1.0.tgz
# expected: d63e0e09b72f904d7e19e419fa839800017a3f1a254f0fb5a9f3daaf8922db64
cp /tmp/righting-oxlint-pack-one/righting-0.1.0.tgz /Users/kgnugur/Codes/Personal/uets-to-task/vendor/righting-0.1.0-66d9c4e.tgz

# 3. Verify the project lock resolves only that artifact and uses the public plugin.
cd /Users/kgnugur/Codes/Personal/uets-to-task
npm ci
node -e 'const p=require("./package-lock.json"); const x=p.packages["node_modules/righting"]; if (x.resolved!=="file:vendor/righting-0.1.0-66d9c4e.tgz" || x.integrity!=="sha512-f9TnoiJMvwj5p2r97NM3TFLEDsGdQVbOUncsufntbLrhTeccCrj2R4zVv3h2AjRkPZ2m6hNI5iMmA7ziUmcJ2A==") process.exit(1)'
node -e 'const p=require("./node_modules/righting/package.json"); if (p.exports["./oxlint"]!=="./dist/src/oxlint.js" || p.peerDependencies.oxlint!=="1.75.0") process.exit(1)'
npx oxlint --version            # expected: Version: 1.75.0
npx righting inspect --json > /tmp/uets-final-righting-inspect.json
shasum -a 256 /tmp/uets-final-righting-inspect.json
# expected: bfb18a555bb2d79c4026c9b553687af39daedaa623ce77cb48017fcf81cc4e7b
npm run lint                     # expected: exit 0
npm test                          # expected: exit 0
npm run check                     # expected: exit 0
git diff --check                 # expected: exit 0

# 4. Black-box activation with the final tree, without changing it.
rm -rf /tmp/uets-final-oxlint-consumer
git clone --no-local /Users/kgnugur/Codes/Personal/uets-to-task /tmp/uets-final-oxlint-consumer
(cd /tmp/uets-final-oxlint-consumer && npm ci && npm run lint)
printf 'export const clientValue = 1;\n' > /tmp/uets-final-oxlint-consumer/src/replay-forbidden.client.ts
printf 'import { clientValue } from "./replay-forbidden.client";\nexport { clientValue };\n' > /tmp/uets-final-oxlint-consumer/src/replay-forbidden.manager.ts
(cd /tmp/uets-final-oxlint-consumer && npm run lint); test "$?" -eq 1
# expected diagnostic: righting/role-dependency: Manager cannot depend on Client.
rm -rf /tmp/uets-final-oxlint-consumer /tmp/righting-oxlint-pack-one /tmp/righting-oxlint-pack-two
```

## Residual limits

- This is one supported tuple, not a compatibility matrix. Oxlint's JavaScript-plugin API is alpha; only `1.75.0` is supported.
- The adapter intentionally supports relative imports and string exact/wildcard `package.json#imports` targets. Conditional/array targets, TypeScript `paths`, bundler aliases, package-export resolution, non-root invocation, and multi-policy workspaces remain unsupported.
- Native directives are supported only as exact per-rule legacy debt; the normal command detects stale directives. They do not expand the contract or prove repaired architecture.
- Static diagnostics do not prove runtime behavior, queued Manager interaction semantics, files outside coverage, or maintainer approval.

## Approval request

**Approve this single option:** repair the one portable Righting test assertion, then replace UETS's mutable project-local Oxlint plugin and obsolete vendor tarball with the immutable `d63e0e09b72f904d7e19e419fa839800017a3f1a254f0fb5a9f3daaf8922db64` `righting/oxlint` artifact and exact final-tree scope above; authorize the claim of complete `role-dependency` only when every required-ledger row passes.

## Exact inspection JSON (raw capture)

```json
{
  "schemaVersion": 1,
  "command": "inspect",
  "ok": true,
  "policy": {
    "path": "righting.json",
    "status": "valid"
  },
  "adapter": {
    "status": "unknown"
  },
  "contract": {
    "contractVersion": 1,
    "preset": "volatility@1",
    "roles": [
      "Client",
      "Manager",
      "Engine",
      "ResourceAccess",
      "Resource",
      "Utility"
    ],
    "configured": {
      "coverage": [
        "src/**/*.{ts,tsx}"
      ],
      "aliases": [
        {
          "name": "page",
          "role": "Client",
          "filenameSuffixes": [
            ".page."
          ],
          "directorySegments": [
            "routes"
          ]
        },
        {
          "name": "component",
          "role": "Client",
          "filenameSuffixes": [
            ".component."
          ],
          "directorySegments": [
            "components"
          ]
        },
        {
          "name": "lib",
          "role": "Utility",
          "filenameSuffixes": [],
          "directorySegments": [
            "lib"
          ]
        }
      ],
      "generated": {
        "filenameMarkers": [
          ".gen."
        ],
        "directorySegments": []
      },
      "protectedDependencies": [],
      "variations": [
        "pureEngines"
      ],
      "overrides": [
        {
          "name": "client-composition",
          "from": "Client",
          "to": "Client",
          "effect": "allow",
          "reason": "Pages and components compose other client-facing components in the approved project structure."
        }
      ],
      "scopes": [],
      "compositionRoots": [
        "router",
        "routeTree",
        "worker"
      ],
      "guidance": {
        "domainVocabulary": "CONTEXT.md"
      }
    },
    "effective": {
      "allowedDependencies": {
        "Client": [
          "Manager",
          "Utility",
          "Client"
        ],
        "Manager": [
          "Engine",
          "ResourceAccess",
          "Utility"
        ],
        "Engine": [
          "Utility"
        ],
        "ResourceAccess": [
          "Resource",
          "Utility"
        ],
        "Resource": [
          "Utility"
        ],
        "Utility": [
          "Utility"
        ]
      },
      "conventions": {
        "roles": {
          "Client": {
            "filenameSuffixes": [
              ".client.",
              ".page.",
              ".component."
            ],
            "directorySegments": [
              "clients",
              "routes",
              "components"
            ]
          },
          "Manager": {
            "filenameSuffixes": [
              ".manager."
            ],
            "directorySegments": [
              "managers"
            ]
          },
          "Engine": {
            "filenameSuffixes": [
              ".engine."
            ],
            "directorySegments": [
              "engines"
            ]
          },
          "ResourceAccess": {
            "filenameSuffixes": [
              ".access."
            ],
            "directorySegments": [
              "access"
            ]
          },
          "Resource": {
            "filenameSuffixes": [
              ".resource."
            ],
            "directorySegments": [
              "resources"
            ]
          },
          "Utility": {
            "filenameSuffixes": [
              ".utility."
            ],
            "directorySegments": [
              "utilities",
              "lib"
            ]
          }
        },
        "tests": {
          "filenameMarkers": [
            ".test.",
            ".spec."
          ],
          "directorySegments": [
            "test",
            "tests",
            "__tests__"
          ]
        },
        "generated": {
          "filenameMarkers": [
            ".generated.",
            ".gen."
          ],
          "directorySegments": [
            "generated"
          ]
        },
        "compositionRoots": [
          "composition-root",
          "router",
          "routeTree",
          "worker"
        ]
      },
      "policyRuleIds": [
        "righting/role-dependency",
        "righting/unresolved-local-import",
        "righting/unclassified-source",
        "righting/ambiguous-source",
        "righting/test-dependency",
        "righting/cross-context-dependency",
        "righting/shared-to-context-dependency",
        "righting/ambiguous-scope"
      ],
      "protectedDependencyRules": [],
      "scopeRules": [],
      "scopeClassification": null,
      "capabilities": [
        {
          "id": "role-dependency",
          "applies": true,
          "coverage": "statically-enforceable",
          "policyRuleIds": [
            "righting/role-dependency",
            "righting/unresolved-local-import",
            "righting/unclassified-source",
            "righting/ambiguous-source",
            "righting/test-dependency"
          ],
          "establishes": [
            "configured-role-dependency-boundaries",
            "unresolved-local-import-is-forbidden"
          ],
          "doesNotEstablish": [
            "files-outside-coverage",
            "runtime-dependency-behavior"
          ]
        },
        {
          "id": "manager-interaction",
          "applies": true,
          "coverage": "partially-checkable",
          "policyRuleIds": [
            "righting/role-dependency"
          ],
          "establishes": [
            "direct-manager-import-is-forbidden"
          ],
          "doesNotEstablish": [
            "queued-interaction-semantics"
          ]
        },
        {
          "id": "protected-dependency",
          "applies": false,
          "coverage": "statically-enforceable",
          "policyRuleIds": [
            "righting/role-dependency"
          ],
          "establishes": [
            "configured-resource-and-utility-package-classification"
          ],
          "doesNotEstablish": [
            "external-service-runtime-behavior",
            "utility-package-access-restriction"
          ]
        },
        {
          "id": "context-firewall",
          "applies": false,
          "coverage": "statically-enforceable",
          "policyRuleIds": [
            "righting/cross-context-dependency",
            "righting/shared-to-context-dependency",
            "righting/ambiguous-scope"
          ],
          "establishes": [
            "cross-context-source-import-is-forbidden",
            "shared-to-context-source-import-is-forbidden"
          ],
          "doesNotEstablish": [
            "cross-context-runtime-behavior"
          ]
        },
        {
          "id": "design-judgment",
          "applies": true,
          "coverage": "guidance-only",
          "policyRuleIds": [],
          "establishes": [],
          "doesNotEstablish": [
            "role-responsibility",
            "real-volatility",
            "contract-quality",
            "runtime-behavior",
            "use-case-validity"
          ]
        }
      ],
      "evidenceLimits": [
        "files-outside-coverage",
        "matched-files-are-inspection-evidence",
        "runtime-behavior",
        "maintainer-approval",
        "adapter-activation"
      ]
    }
  },
  "evidence": {
    "sourceSummary": {
      "covered": 76,
      "roles": {
        "Client": 23,
        "Manager": 11,
        "Engine": 24,
        "ResourceAccess": 12,
        "Resource": 0,
        "Utility": 1
      },
      "tests": 28,
      "compositionRoots": 4,
      "unclassified": 0,
      "ambiguous": 0
    },
    "sourceViolations": []
  }
}
```
