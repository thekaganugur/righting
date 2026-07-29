# Guardrail adapter conformance

A supported Righting guardrail adapter consumes the normalized JSON contract, implements the complete `role-dependency` capability, and passes every scenario family applicable to each additional capability it claims. The scenarios are adapter-neutral: an adapter supplies native source fixtures and commands, and its observable findings map to stable `righting/*` policy-rule identities.

## Contract and evidence

Start every run with the exact output of:

```sh
npx righting inspect --json
```

Proceed only when the response is successful, the policy is valid, and both the response `schemaVersion` and `contract.contractVersion` are supported. The adapter consumes `contract.configured` provenance and `contract.effective` semantics; it does not normalize `righting.json`, infer architecture from files, or import Righting core. Inspection's `adapter.status` is not conformance evidence.

For each scenario, record the contract fixture, native source fixtures, exact native command, exit status, and diagnostics. Allowed cases pass without a Righting finding. Forbidden cases fail and identify the expected stable policy rule, even when the host uses a different native rule ID. Run cases through the adapter's public native lint entry point, not an internal policy helper.

The executable registrations and current ESLint fixtures are internal examples under `test/`; this document is the shipped conformance contract, not a public harness API or manifest.

## Scenario families

### `default-role-edges`

Execute all 36 ordered pairs of the six canonical roles against `effective.allowedDependencies`. Every effective allow passes; every other edge reports `righting/role-dependency`. This family also establishes the directly checkable part of `manager-interaction`: direct Manager-to-Manager source dependency remains forbidden when the effective contract forbids it.

### `static-dependency-forms`

Exercise static imports, named and star re-exports, literal `require`, dynamic imports, and type-only imports where the host supports them. Repeat the resolution forms the adapter claims, including extension/index resolution and configured aliases. Allowed and forbidden forms produce the same policy result. A local dependency that cannot be resolved or classified fails closed as `righting/unresolved-local-import`; it must not silently become external.

### `canonical-and-alias-classification`

Show that canonical filename and directory conventions and every configured alias classify to the same canonical role semantics. Multiple markers for one role are valid; markers for different roles belong in `source-classification-violations`. Dependency outcomes use canonical roles rather than alias names.

### `policy-variations-and-protected-dependencies`

Exercise normalized fixture contracts containing each named variation and global override the adapter supports. For every returned `effective.allowedDependencies` graph, test representative allowed and forbidden edges; obtain alternate graphs through `righting inspect --json` rather than reconstructing variation deltas in the adapter. When `protected-dependency` is claimed and applicable, exercise every configured protected Resource or Utility package from allowed and forbidden source roles. Findings map to `righting/role-dependency`.

### `declared-coverage`

Show that covered source is governed and source outside `configured.coverage` remains unchecked. Imports crossing the coverage boundary must preserve that distinction rather than expanding coverage from the observed repository tree.

### `source-classification-violations`

A covered source matching no canonical role or explicit treatment reports `righting/unclassified-source`. A covered source matching different roles reports `righting/ambiguous-source`. The adapter uses the contract's exact filename tokens and path segments.

### `test-source-treatment`

Test source remains visible. Its outgoing role dependencies are exempt, while governed production source depending on test source reports `righting/test-dependency`. Exercise both filename-marker and directory-segment treatment when configured.

### `generated-source-and-composition-roots`

Generated role source remains governed by its canonical role. A composition root may wire role entry points, while governed role source cannot depend on a composition root and receives `righting/role-dependency`. Exact composition-root filename tokens must not classify unrelated suffix matches.

## Capability and support record

`role-dependency` is the minimum support claim; all of its applicable cases above must pass. Claim `protected-dependency` only after its applicable cases pass against the exact declared contract and version tuple. Copy the contract's `establishes` and `doesNotEstablish` limits into the support record, and list unsupported capabilities explicitly.

Record one tested tuple of Righting contract version, adapter version, native guardrail version, and any composed plugin/resolver versions. A passing tuple does not imply a compatibility matrix. Native diagnostics are mandatory. Native suppression and legacy-debt behavior are recommended when the host provides them, but declare and test them separately from the support gate.
