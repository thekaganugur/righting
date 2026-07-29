# Oxlint adapter

Righting's Oxlint adapter is optional and separate from the normalized contract. It is supported only for the exact tuple recorded below; this is not a compatibility range.

## Prerequisites

- an approved complete `righting.json` whose applicable static capabilities do not include `protected-dependency`;
- Oxlint exactly `1.75.0`, which requires Node.js `^20.19.0 || >=22.12.0`;
- an established project-root Oxlint command; and
- local imports that use relative paths or string targets in `package.json#imports`.

Install the native guardrail explicitly:

```sh
npm install --save-dev --save-exact oxlint@1.75.0
```

Righting keeps Oxlint as an optional peer, so installing Righting alone does not activate or install a guardrail.

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

Preserve the project's existing Oxlint plugins, categories, rules, and command. Run that command from the project root. Adapter loading invokes the adjacent packaged CLI as `righting inspect --json`, requires inspection schema 1 and normalized contract version 2, and fails before linting when inspection is unsuccessful, the policy is incomplete, a version is unsupported, or an unsupported static capability applies. It neither imports `righting/core` nor reads or normalizes `righting.json` itself.

## Native suppression

Oxlint's exact rule directives can record separately approved existing findings:

```js
// oxlint-disable-next-line righting/role-dependency -- approved legacy dependency
import { legacy } from "./legacy.engine.js";
```

Use the project's normal lint command with `--deny-warnings --report-unused-disable-directives` so stale directives fail. Dependency and file-classification diagnostics accept native rule-specific directives. Righting adds no baseline file, suppression command, or approval store; review each project-owned directive and remove it when the finding is repaired.

## Support record

Tested tuple:

- Righting and adapter: `0.1.0-alpha.3`;
- inspection `schemaVersion`: `1`;
- normalized `contractVersion`: `2`;
- Oxlint: `1.75.0` JavaScript-plugin API;
- Micromatch: `4.0.8`;
- validation runtime: Node.js `26.5.0`.

Claimed capability: complete `role-dependency`, including all 36 canonical role edges, normalized variations and overrides, static imports, named and star re-exports, literal `require`, dynamic and type-only imports, extension and index resolution, declared coverage, canonical and alias classification, tests, generated source, composition roots, and unresolved local imports.

- Establishes: `configured-role-dependency-boundaries`, `unresolved-local-import-is-forbidden`.
- Does not establish: `files-outside-coverage`, `runtime-dependency-behavior`.
- Policy rules: `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, `righting/test-dependency`.

`manager-interaction` remains partially checkable: it establishes `direct-manager-import-is-forbidden` through `righting/role-dependency`, but does not establish `queued-interaction-semantics`.

Unsupported capabilities: `protected-dependency` and guidance-only `design-judgment`. Contracts where `protected-dependency` applies are rejected at plugin load rather than partially enforced. Files outside declared coverage and runtime dependency behavior remain outside static evidence.

Resolution is intentionally limited to relative local paths plus string exact or wildcard `package.json#imports` targets. Conditional or array `imports` targets, TypeScript `paths`, bundler aliases, package export resolution, non-project-root invocation, and multi-policy workspaces are unsupported. Use another supported adapter when those mechanics are required.

The JavaScript-plugin API is alpha in the pinned Oxlint release. The adapter verifies the host parser's Oxlint `1.75.0` version before rule traversal, and its exact optional peer pin and native black-box suite bound that risk; no other Oxlint version is implied supported.

## Reproduce the support claim

The conformance fixture policy is `test/fixtures/dependency-conformance/righting.json`; temporary policies in `test/oxlint.test.ts` exercise normalized variations, overrides, and rejected capabilities. The reproducible contract-capture command is `npx righting inspect --json`. During native scenarios the adapter invokes the same adjacent packaged CLI entry point as `node <righting-cli> inspect --json`, then executes through Oxlint's public JavaScript-plugin entry point.

```sh
npm run build
node --test dist/test/oxlint.test.js
node --test dist/test/packed-oxlint.test.js
npm test
npm run typecheck
npm run build
git diff --check
```

For the tuple above, 11 focused native tests passed with allowed exits `0`, forbidden exits `1`, and the expected stable identities; the clean packed-consumer test passed its allowed normal lint run and failed its intentional dependency with `righting/role-dependency`. The full 47-test package suite, typecheck, build, and diff check passed.
