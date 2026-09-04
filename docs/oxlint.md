# Oxlint adapter

Righting's Oxlint adapter is optional and separate from the normalized contract. It supports every lintable capability in normalized contract version 2 for the exact tuple recorded below; this is not a compatibility range.

## Prerequisites

- an approved complete `righting.json`;
- Oxlint exactly `1.75.0`, which requires Node.js `^20.19.0 || >=22.12.0`; and
- an established Oxlint command and configuration.

Install the native guardrail explicitly:

```sh
npm install --save-dev --save-exact oxlint@1.75.0
```

Righting keeps Oxlint as an optional peer, so installing Righting alone does not activate or install the guardrail. Righting includes the exact Oxc Resolver runtime used by the adapter.

## Activate the adapter

Add the package export under an explicit native plugin name and enable its five stable diagnostics:

```json
{
  "jsPlugins": [
    { "name": "righting", "specifier": "righting/oxlint" }
  ],
  "rules": {
    "righting/role-dependency": "error",
    "righting/unresolved-local-import": "error",
    "righting/unclassified-source": "error",
    "righting/ambiguous-source": "error",
    "righting/test-dependency": "error"
  }
}
```

Preserve the project's existing Oxlint plugins, categories, rules, and command. For each linted file, the adapter discovers the nearest canonical project root containing `righting.json`; invocation from a project subdirectory is supported when Oxlint is given or discovers the project configuration. When Oxlint loads the plugin, the adapter preloads the nearest root from the invocation directory through the adjacent packaged CLI as `righting inspect --json`, before per-file rule creation. Additional roots are acquired on their first rule context. Each canonical root has one process-scoped acquisition outcome, successful or failed, for a given policy/package/configuration stamp, so a failed subprocess cannot fan out across files. Inspection requires inspection schema 1 and normalized contract version 2 and fails before reporting policy evidence when inspection is unsuccessful, the policy is incomplete, a host version is unsupported, or an unknown applicable capability appears. Contract and resolver state is process-scoped and isolated by canonical root. Subdirectory root discovery and simultaneous multi-root linting are supported. Editor and watch hosts must restart after policy, package, or TypeScript/JavaScript configuration changes; live reload remains unclaimed. The adapter neither imports `righting/core` nor reads or normalizes `righting.json` itself.

## Resolution

The adapter resolves imports with Oxc Resolver rather than maintaining a partial filesystem resolver. It distinguishes resolved local source, resolved external packages, host builtins, and unresolved imports. Unresolved imports from covered role, test, or composition-root source fail closed as `righting/unresolved-local-import`; test source is exempt only from resolved outgoing role restrictions.

The tested resolution surface includes relative paths, extension and directory-index lookup, exact, wildcard, conditional, and array `package.json#imports` targets, import-versus-require conditions, TypeScript `paths` for TypeScript source, installed external packages, scoped package subpaths, and Node builtins. Protected package identity is retained through direct imports, scoped subpaths, and `package.json#imports` mappings to external packages.

Custom bundler-only aliases not represented in standard package or TypeScript configuration, Yarn Plug'n'Play, and cross-root architecture policy remain unclaimed. An unsupported or unresolved specifier does not silently become external.

## Native suppression

Oxlint's exact rule directives can record separately approved existing findings:

```js
// oxlint-disable-next-line righting/role-dependency -- approved legacy dependency
import { legacy } from "./legacy.engine.js";
```

Use the project's normal lint command with `--deny-warnings --report-unused-disable-directives` so stale directives fail. All five dependency and file-classification diagnostics accept native rule-specific directives. Righting adds no baseline file, suppression command, or approval store; review each project-owned directive and remove it when the finding is repaired.

## Support record

Tested tuple:

- Righting and adapter: `0.1.0-alpha.10`;
- inspection `schemaVersion`: `1`;
- normalized `contractVersion`: `2`;
- Oxlint: `1.75.0` JavaScript-plugin API;
- Oxc Resolver: `11.24.2`;
- Micromatch: `4.0.8`;
- validation runtime: Node.js `24.20.0`.

`role-dependency` disposition: claimed. The complete capability includes all 36 canonical role edges, normalized variations and overrides, static imports, named and star re-exports, scope-aware literal `require`, dynamic and type-only imports, the tested resolver surface above, declared coverage, canonical and alias classification, tests, generated source, composition roots, and unresolved imports.

- Establishes: `configured-role-dependency-boundaries`, `unresolved-local-import-is-forbidden`.
- Does not establish: `files-outside-coverage`, `runtime-dependency-behavior`.
- Policy rules: `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, `righting/test-dependency`.

`manager-interaction` disposition: claimed within its normalized-contract limits. It remains partially checkable: it establishes `direct-manager-import-is-forbidden` through `righting/role-dependency`, but does not establish `queued-interaction-semantics`. Its policy-rule ID is `righting/role-dependency`.

`protected-dependency` disposition: claimed. It establishes `configured-resource-and-utility-package-classification`; it does not establish `external-service-runtime-behavior` or `utility-package-access-restriction`. Its policy-rule ID is `righting/role-dependency`.

`design-judgment` disposition: unsupported for static enforcement because it is guidance-only.

- Establishes: none.
- Does not establish: `role-responsibility`, `real-volatility`, `contract-quality`, `runtime-behavior`, `use-case-validity`.
- Policy-rule IDs: none.

Files outside declared coverage and runtime dependency behavior remain outside static evidence. Unknown future applicable capabilities fail adapter initialization until the tuple and conformance record explicitly support them.

The JavaScript-plugin API is alpha in the pinned Oxlint release. The adapter verifies the host parser's Oxlint `1.75.0` version before rule traversal, and its exact optional peer pin and native black-box suite bound that risk; no other Oxlint version is implied supported.

## Reproduce the support claim

The base target fixture is `test/fixtures/dependency-conformance`. Target fixture tree revision: `fd59eb4051ac08120d5daed09c6f3f517c7875e1`; its policy SHA-256 is `7f5c53b453738d857fb0611d20395b4ba4c32b6bcdc44b0cf607b50c4312f83f`. From that directory, `node ../../../dist/src/cli.js inspect --json` reproduces `docs/evidence/oxlint-inspection.json` with SHA-256 `d3fe86488eee441bc1645100e67cd3a0c050b79ef09febc76c8580278574b608`.

The applicable protected-dependency target fixture is `test/fixtures/oxlint-protected-dependency`. Target fixture tree revision: `93ee989f544b6f230812595997d877fcde481f07`; its policy SHA-256 is `29bedcd0076dc08ba83d7ff2e17cfd7a1dbb73a91c9acf34a707ff520410bf45`. From that directory, `node ../../../dist/src/cli.js inspect --json` reproduces `docs/evidence/oxlint-protected-inspection.json` with SHA-256 `d767397c535bfb24fb496e06916505c8dcfeef4a61f4ef85b0b0d623e04f28d3`. This retained contract makes `protected-dependency` applicable and supplies the normalized shape used by its native family test.

`docs/evidence/oxlint-native-executions.json` retains the exact native commands, observed exit statuses, stable diagnostic identities, and complete native stdout/stderr normalized only for fixture roots and line order from all eight registered families. Every execution references the SHA-256 of its exact inline `righting inspect --json` capture; this includes the temporary variation, override, alias, coverage, and source-treatment policies. Their generated fixture definitions have target Git tree revision `7f627fb7ea9bcde42900349b60af1f16a4f78082`. It is regenerated and checked by `node --test dist/test/oxlint.test.js`; per-family source additions and policy states are declared in `test/oxlint.test.ts`. Native scenarios execute through Oxlint's public JavaScript-plugin entry point.

| Conformance family | Native fixtures | Test runner and expected outcome | Stable diagnostics |
| --- | --- | --- | --- |
| `default-role-edges` | generated `src/<from>/oxlint-to-<to>.js` for all 36 edges | `node --test --test-name-pattern='^default-role-edges:' dist/test/oxlint.test.js`; allowed `0`, forbidden `1` | `righting/role-dependency` |
| `static-dependency-forms` | `test/fixtures/dependency-conformance/src/{client,manager}` plus isolated resolver fixtures | `node --test --test-name-pattern='^static-dependency-forms:' dist/test/oxlint.test.js`; allowed/resolved `0`, forbidden/unresolved `1` | `righting/role-dependency`, `righting/unresolved-local-import` |
| `canonical-and-alias-classification` | generated canonical and `screen` alias source | `node --test --test-name-pattern='^canonical-and-alias-classification:' dist/test/oxlint.test.js`; allowed `0`, forbidden `1` | `righting/role-dependency` |
| `policy-variations-and-protected-dependencies` | isolated variation, override, direct/scoped/import-map package fixtures | `node --test --test-name-pattern='^policy-variations-and-protected-dependencies:' dist/test/oxlint.test.js`; allowed `0`, forbidden `1` | `righting/role-dependency` |
| `declared-coverage` | `outside/` and `src/client/import-outside.js` | `node --test --test-name-pattern='^declared-coverage:' dist/test/oxlint.test.js`; outside/crossing `0` | none |
| `source-classification-violations` | `src/plain.js`, `src/engines/page.client.js` | `node --test --test-name-pattern='^source-classification-violations:' dist/test/oxlint.test.js`; violations `1` | `righting/unclassified-source`, `righting/ambiguous-source` |
| `test-source-treatment` | filename- and directory-marked test importers/targets | `node --test --test-name-pattern='^test-source-treatment:' dist/test/oxlint.test.js`; exempt resolved outgoing `0`, production/test and unresolved `1` | `righting/test-dependency`, `righting/unresolved-local-import` |
| `generated-source-and-composition-roots` | generated roles, exact root, role-to-root source | `node --test --test-name-pattern='^generated-source-and-composition-roots:' dist/test/oxlint.test.js`; allowed root `0`, forbidden role edge `1` | `righting/role-dependency` |

Each registration invokes `node_modules/.bin/oxlint` from its isolated project root with the named targets and asserts the exits and identities above; the evidence ledger records those native invocations rather than substituting the test-runner commands. The separate `unresolved configured protected packages fail closed from allowed and forbidden roles` native test establishes `righting/unresolved-local-import` behavior without treating an unresolvable package as protected-dependency classification evidence.

Observed validation outcomes:

| Command | Observed outcome |
| --- | --- |
| `npm run build` | passed |
| `node --test dist/test/oxlint.test.js` | 18 tests passed |
| `node --test dist/test/packed-oxlint.test.js` | 1 test passed |
| `npm test` | 64 tests passed |
| `npm run typecheck` | passed |
| `git diff --check` | passed |

The focused native suite asserts allowed exit `0`, forbidden exit `1`, complete scenario-family registration, stable policy identities, and one pre-traversal contract acquisition while 64 files run on two Oxlint threads. The clean packed-consumer test installs the published-style artifact and exact Oxlint tuple, verifies Oxc Resolver `11.24.2`, injects the observed lint-time `spawnSync ... ENOMEM` failure mode, proves that the packaged adapter instead acquires once before traversal, passes the normal parallel lint run, and fails an intentional dependency with `righting/role-dependency`. No quantitative adapter performance claim is made for this tuple.
