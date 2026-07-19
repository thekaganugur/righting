# Righting policy language

`righting.json` is a project-owned, JSON policy using the `volatility@1` preset. It declares decisions Righting can validate; it does not infer an architecture or record approval.

## Incomplete starter

`righting init` creates exactly this file:

```json
{
  "preset": "volatility@1",
  "status": "incomplete"
}
```

It is the only valid incomplete policy. Do not add configuration to it. After explicit maintainer approval, replace it with a complete policy and remove `status`.

## Canonical roles and aliases

A complete policy maps local aliases to these canonical roles:

| Role | Default allowed dependencies |
| --- | --- |
| `Client` | `Manager`, `Utility` |
| `Manager` | `Engine`, `ResourceAccess`, `Utility` |
| `Engine` | `ResourceAccess`, `Utility` |
| `ResourceAccess` | `Resource`, `Utility` |
| `Resource` | `Utility` |
| `Utility` | `Utility` |

Aliases choose project vocabulary only; they do not create a new role or change its default behavior. A complete policy needs at least one alias and mapping, and every alias needs an explicit mapping. A mapping has an alias and one or both of:

- `path`: a project-relative, forward-slash glob for mapped source; or
- `package`: an external package protected as a `Resource` or `Utility`.

Unresolved local imports are forbidden. Mappings and scopes must not match the same project file ambiguously.

## Optional decisions

Keep each of these absent unless it is approved and applicable:

- `variations`: named policy-wide opt-ins. `clientReadsAccess` permits `Client` to depend on `ResourceAccess`; `pureEngines` removes `Engine` to `ResourceAccess`; `contextFirewall` enables context checks.
- `overrides`: a named, reason-required `allow` or `disallow` change to one canonical role edge. It must actually change the default or variation-derived edge.
- `scopes`: required when `contextFirewall` is enabled. Define at least one `context` (with `name`), `shared`, and `unscoped` relative-path scope. Contexts cannot import other contexts; shared code cannot import a context; unscoped code may wire context entry points.
- `extras`: optional project-relative references for `domainVocabulary` and named `goldenExamples`, consumed by the advisory design-review skill.

Use `npx righting inspect` after replacing the starter to view the normalized configuration and computed allowed role relationships. See the [capability catalog](capabilities.md) for what static analysis establishes and does not establish.
