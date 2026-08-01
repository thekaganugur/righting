# Righting policy language

`righting.json` is a maintainer-owned, adapter-neutral policy using the `volatility@1` preset. Righting validates declared decisions; it does not infer architecture or record approval.

## Incomplete starter

`righting init` creates exactly:

```json
{
  "preset": "volatility@1",
  "status": "incomplete"
}
```

This exact starter is the only valid incomplete policy and produces no normalized contract. After explicit maintainer approval, replace it rather than extending it.

## Minimal complete policy

```json
{
  "preset": "volatility@1",
  "coverage": ["src/**/*.ts"]
}
```

`coverage` contains broad project-relative source globs. Source outside coverage is intentionally unchecked. Covered source is classified by canonical conventions, project aliases, or an explicit treatment.

## Canonical roles and dependency graph

| Role | Default allowed dependencies | Filename suffix | Directory segment |
| --- | --- | --- | --- |
| `Client` | `Manager`, `Utility` | `.client.` | `clients` |
| `Manager` | `Engine`, `ResourceAccess`, `Utility` | `.manager.` | `managers` |
| `Engine` | `ResourceAccess`, `Utility` | `.engine.` | `engines` |
| `ResourceAccess` | `Resource`, `Utility` | `.access.` | `access` |
| `Resource` | `Utility` | `.resource.` | `resources` |
| `Utility` | `Utility` | `.utility.` | `utilities` |

Suffix and directory conventions are additive and may be mixed. Multiple matches for one role are valid; matches for different roles produce `righting/ambiguous-source`. An edge absent from the table is forbidden by default.

## Aliases

Aliases add project vocabulary and exact filename or directory tokens to one canonical role. Canonical conventions remain active. An alias does not create a role, path-map individual files, or change dependency behavior.

```json
{
  "aliases": [
    {
      "name": "screen",
      "role": "Client",
      "filenameSuffixes": [".screen."],
      "directorySegments": ["screens"]
    },
    {
      "name": "repository",
      "role": "ResourceAccess",
      "filenameSuffixes": [".repository."]
    }
  ]
}
```

Each alias needs at least one token. Filename tokens are exact dotted markers; directory tokens are exact path segments. Multiple aliases for one role are peers.

## Explicit source treatments

- Tests use `.test.` / `.spec.` or the `test`, `tests`, and `__tests__` directory segments. They remain visible inside coverage. Their outgoing role dependencies are exempt, while governed production source cannot depend on them.
- Generated source uses `.generated.` or the `generated` directory segment. Add project markers only for evidenced generator vocabulary, for example `"generated": {"filenameMarkers": [".auto."], "directorySegments": ["autogen"]}`. Markers are exact dotted filename tokens and directories are exact path segments. Generated status does not classify source by itself: the file must also resolve to a canonical role or composition root, otherwise it produces `righting/unclassified-source`. Generated role source remains governed by its role, while generated classification tells coding agents not to edit the file.
- The extensionless filename token `composition-root` identifies non-role wiring source. Add project tokens with `compositionRoots`, for example `"compositionRoots": ["main", "bootstrap"]`. A generated composition root keeps its non-role wiring semantics and is reported as non-editable. Governed role source cannot depend on a composition root.
- Other covered source produces `righting/unclassified-source`. The violation does not remove or invalidate the normalized contract.

## Protected dependencies

External packages are ordinary dependencies unless explicitly classified as a protected `Resource` or `Utility`:

```json
{
  "protectedDependencies": [
    { "package": "@example/database", "role": "Resource" },
    { "package": "@example/shared", "role": "Utility" }
  ]
}
```

Protected packages follow the same effective role graph as source roles.

## Optional policy decisions

Keep optional fields absent unless approved and applicable:

- `variations`: `clientReadsAccess` and `pureEngines`. Each named opt-in changes the effective role graph.
- `overrides`: named, reason-required global `allow` or `disallow` changes to one canonical role edge. An override must change the effective edge.
- `guidance`: project-relative `domainVocabulary` and named `goldenExamples` references for coding-agent guidance.

```json
{
  "variations": ["pureEngines"],
  "overrides": [
    {
      "name": "client-reads-resource",
      "from": "Client",
      "to": "Resource",
      "effect": "allow",
      "reason": "Approved project-wide read model."
    }
  ],
  "guidance": {
    "domainVocabulary": "CONTEXT.md",
    "goldenExamples": { "create-order": "docs/examples/create-order.md" }
  }
}
```

## Normalized contract

`righting inspect --json` places approved semantics once under `contract`. `contractVersion` versions this adapter-neutral interface independently from `volatility@1`. The contract retains configured provenance and exposes effective conventions, the closed role graph, protected-dependency rules, stable `righting/...` policy-rule IDs, adapter-neutral capabilities, and evidence limits. Repository file snapshots and adapter mechanics are not contract data.

Core consumers can read and normalize a local policy through `righting/core`:

```js
import { normalizePolicy, readPolicy } from "righting/core";

const contract = normalizePolicy(readPolicy("righting.json"));
```

JavaScript and TypeScript consumers can apply the package-owned reference interpreter to any validated normalized contract through `righting/contract`:

```js
import { classifySource } from "righting/contract";

const classification = classifySource(contract, "src/orders/create.manager.ts");
```

`classifySource` rejects unsupported contract versions. It classifies source paths only; guardrail adapters still own native import resolution, diagnostics, capability checks, suppression, and conformance. Use `npx righting inspect` after replacing the starter to validate and explain the normalized contract.
