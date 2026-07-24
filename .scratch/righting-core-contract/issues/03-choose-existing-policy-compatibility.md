# Choose compatibility for existing policies

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Working context: unclaimed
Blocked by: 01, 02

## Question

How should the new convention-led contract treat existing complete and incomplete `righting.json` files, current alias/mapping semantics, the schema-version-1 CLI envelopes, and packaged consumers while keeping the core contract small and unambiguous?

## Answer

The current complete policy and machine-output shapes are unreleased development formats with no users beyond this repository. Replace them atomically rather than preserving compatibility:

- Remove the old complete-policy shape based on `aliases: Record<string, Role>` and `mappings`. Add no translation, dual parser, deprecation period, migration command, or legacy fixtures.
- Keep the exact incomplete starter `{ "preset": "volatility@1", "status": "incomplete" }`. It remains non-enforceable and produces no normalized contract.
- An incomplete inspection now requires `coverage` and maintainer approval. Aliases are optional because canonical filename conventions may cover a project without local vocabulary.
- The smallest complete policy is `{ "preset": "volatility@1", "coverage": ["src/**/*.ts"] }`; optional aliases use the convention-token model approved by [Define convention and alias semantics](02-define-convention-and-alias-semantics.md).
- Replace package mappings with a dedicated `protectedDependencies` collection whose entries classify an external package directly as `Resource` or `Utility`.
- Redefine the unreleased CLI `schemaVersion: 1` envelopes in place. A valid inspection retains command, success, policy-status, warning, and other envelope metadata, but exposes normalized semantics only once under `contract`; remove the old top-level `configuration`, `effectivePolicy`, `capabilities`, and `enforcementCoverage` projections.
- Update the packaged ESLint adapter, skills, documentation, fixtures, and tests atomically to consume the normalized contract. Add no compatibility reads of the removed projections.
- `init` continues to preserve existing files. An old complete policy is invalid until its owner manually replaces it; Righting never overwrites it.
- Keep the package at its intended initial release line; do not bump a package or envelope version merely to memorialize an unused format.

Context: [`CONTEXT.md`](../../../CONTEXT.md).
