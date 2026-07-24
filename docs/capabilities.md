# Righting capability catalog

This reference is generated from Righting's package-owned, adapter-neutral capability records. Inspection reports applicable records by default; use `righting inspect --all` to see every record.

## `role-dependency`

Coverage: `statically-enforceable`

### Establishes

- `configured-role-dependency-boundaries`
- `unresolved-local-import-is-forbidden`

### Does not establish

- `files-outside-coverage`
- `runtime-dependency-behavior`

### Policy rules

- `righting/role-dependency`
- `righting/unresolved-local-import`
- `righting/unclassified-source`
- `righting/ambiguous-source`
- `righting/test-dependency`

## `manager-interaction`

Coverage: `partially-checkable`

### Establishes

- `direct-manager-import-is-forbidden`

### Does not establish

- `queued-interaction-semantics`

### Policy rules

- `righting/role-dependency`

## `protected-dependency`

Coverage: `statically-enforceable`

### Establishes

- `configured-resource-and-utility-package-classification`

### Does not establish

- `external-service-runtime-behavior`
- `utility-package-access-restriction`

### Policy rules

- `righting/role-dependency`

## `context-firewall`

Coverage: `statically-enforceable`

### Establishes

- `cross-context-source-import-is-forbidden`
- `shared-to-context-source-import-is-forbidden`

### Does not establish

- `cross-context-runtime-behavior`

### Policy rules

- `righting/cross-context-dependency`
- `righting/shared-to-context-dependency`
- `righting/ambiguous-scope`

## `design-judgment`

Coverage: `guidance-only`

### Establishes

- None

### Does not establish

- `role-responsibility`
- `real-volatility`
- `contract-quality`
- `runtime-behavior`
- `use-case-validity`

### Policy rules

- None
