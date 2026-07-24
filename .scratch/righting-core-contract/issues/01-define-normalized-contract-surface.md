# Define the normalized contract surface

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Working context: unclaimed

## Question

What is the smallest versioned contract that `righting.json` and core normalization must expose so coding agents and independently implemented adapters receive the same authoritative roles, relationships, conventions, scopes, protected dependencies, variations, overrides, and evidence limits without learning adapter mechanics?

## Answer

The approved policy normalizes to one standalone, JSON-compatible `NormalizedContract`:

- `contractVersion: 1` versions the contract independently from the `volatility@1` preset. Consumers reject unsupported contract versions.
- Only a complete, valid policy produces a contract. The incomplete starter retains its existing non-contract inspection result.
- The contract always contains all six canonical roles and explicit empty collections for inactive optional features.
- Configured maintainer decisions remain visible: coverage, aliases and convention tokens, protected dependencies, variations, reasoned overrides, scopes, and guidance references.
- Effective semantics are also explicit: a closed allowed-edge graph, protected-dependency rules, and applicable structured conventions, stable core policy-rule IDs, capabilities, and evidence limits.
- Configured decisions retain provenance separately from the effective rules derived from them.
- Coverage and scopes define durable pattern rules; matched-file snapshots are inspection evidence, not contract data.
- Core normalization returns this object unchanged, and `inspect --json` exposes it under `contract` while keeping command metadata, policy paths, warnings, and adapter status outside it.
- ESLint configuration, native diagnostic IDs, suppression formats, baseline storage, and other adapter mechanics are excluded.

The normalized contract is the shared source of truth for coding-agent and guardrail-adapter consumers. Core owns its semantics; adapters translate those semantics into native enforcement.

Context: [`CONTEXT.md`](../../../CONTEXT.md).
