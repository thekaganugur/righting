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

The table is exhaustive: an edge it does not list is forbidden by default. In particular, same-role dependencies are forbidden except `Utility` depending on `Utility`. Allowing another same-role edge requires an override — except Client composition within a context, and from a context to shared Clients, which `contextFirewall` permits.

Aliases choose project vocabulary only; they do not create a new role or change its default behavior. A complete policy needs at least one alias and mapping, and every alias needs an explicit mapping. A mapping has an alias and one or both of:

- `path`: a project-relative, forward-slash glob for mapped source; or
- `package`: an external package protected as a `Resource` or `Utility`.

Unresolved local imports are forbidden from code that matches a role mapping. The ESLint adapter runs only for declared mapping and scope paths, so map every source area that needs role-boundary checks. `inspect` warns when a declared mapping or scope currently matches no project file. Mappings and scopes must not match the same project file ambiguously.

## Minimal complete shape

Use this to understand the JSON shape after approval, not as a recommendation for names, roles, or folders. Choose and approve your aliases and paths before replacing the incomplete starter.

```json
{
  "preset": "volatility@1",
  "aliases": {
    "ui": "Client",
    "application": "Manager"
  },
  "mappings": [
    { "alias": "ui", "path": "src/ui/**" },
    { "alias": "application", "path": "src/application/**" }
  ]
}
```

## Optional decisions

Keep each of these absent unless it is approved and applicable:

- `variations`: named policy-wide opt-ins. `clientReadsAccess` permits `Client` to depend on `ResourceAccess`; `pureEngines` removes `Engine` to `ResourceAccess`; `contextFirewall` enables context checks for projects with independently owned bounded contexts.
- `overrides`: a named, reason-required `allow` or `disallow` change to one canonical role edge. It must actually change the default or variation-derived edge.
- `scopes`: required when `contextFirewall` is enabled. Define at least one `context` (with `name`), `shared`, and `unscoped` relative-path scope. Context names are unique, and no project file may match more than one scope. Contexts cannot import other contexts; shared code cannot import a context; unscoped code may wire context entry points.
- `extras`: optional project-relative references for `domainVocabulary` and named `goldenExamples`, consumed by the advisory design-review skill.

### Optional field shapes

These are field-shape examples, not recommended decisions. Add only approved fields to the complete policy above.

```json
{
  "variations": ["pureEngines", "contextFirewall"],
  "overrides": [
    {
      "name": "client-reads-resource",
      "from": "Client",
      "to": "Resource",
      "effect": "allow",
      "reason": "Approved project-specific reason."
    }
  ],
  "scopes": [
    { "kind": "context", "name": "orders", "path": "src/orders/**" },
    { "kind": "shared", "path": "src/shared/**" },
    { "kind": "unscoped", "path": "src/application/**" }
  ],
  "extras": {
    "domainVocabulary": "docs/domain.md",
    "goldenExamples": { "create-order": "docs/examples/create-order.md" }
  }
}
```

Use `npx righting inspect` after replacing the starter to view the normalized configuration, declared-path coverage, guidance extras, and computed allowed role relationships. See the [capability catalog](capabilities.md) for what static analysis establishes and does not establish.
