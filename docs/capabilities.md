# Righting capability catalog

This reference is generated from Righting's package-owned capability records. Inspection reports only records applicable to the configured policy by default; use `righting inspect --all` to see every record.

## `role-dependency`

Coverage: `lint-enforced`

### Establishes

- `configured-role-dependency-boundaries`
- `unresolved-local-import-is-forbidden`

### Does not establish

- `files-outside-declared-paths`
- `runtime-dependency-behavior`

### Adapter diagnostics

- `righting/role-dependency`

## `manager-interaction`

Coverage: `partially-checked`

### Establishes

- `direct-manager-import-is-forbidden`

### Does not establish

- `queued-interaction-semantics`

### Adapter diagnostics

- `righting/role-dependency`

## `protected-dependency`

Coverage: `lint-enforced`

### Establishes

- `configured-resource-and-utility-package-classification`

### Does not establish

- `external-service-runtime-behavior`
- `utility-package-access-restriction`

### Adapter diagnostics

- `righting/role-dependency`

## `context-firewall`

Coverage: `lint-enforced`

### Establishes

- `cross-context-source-import-is-forbidden`
- `shared-to-context-source-import-is-forbidden`

### Does not establish

- `cross-context-runtime-behavior`

### Adapter diagnostics

- `righting/role-dependency`
- `righting/cross-context-dependency`
- `righting/shared-to-context-dependency`

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

### Adapter diagnostics

- None
