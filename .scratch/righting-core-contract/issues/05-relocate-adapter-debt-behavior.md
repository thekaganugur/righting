# Relocate adapter-owned debt behavior

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 04

## Question

After the adapter-neutral contract exists, what is the smallest change that removes ESLint flat-config and suppression ownership from core while preserving an explicit, reviewable ESLint adoption and debt-growth path under the adapter?

## Answer

Use ESLint's native bulk-suppression lifecycle without a parallel Righting baseline abstraction:

- Remove `righting baseline`, its Git-base comparison, custom suppression normalization, and their public surfaces. Add no replacement adapter command, metadata file, compatibility layer, or speculative suppression utility.
- The Righting ESLint adapter consumes the normalized contract and emits native ESLint rules; ESLint owns `eslint-suppressions.json`, applies existing counts during the project's unchanged lint command, reports new findings, and prunes resolved debt through `--prune-suppressions`.
- During initial adapter integration only, the `righting-eslint` skill reports existing Righting findings and asks the maintainer before running ESLint's `--suppress-rule righting/role-dependency`. If there is no adapter integration or no existing debt, this step does not occur.
- Approval recording remains the project's existing chat, PR, commit, or tracker concern. Righting defines no approval storage format.
- Adapter tests should exercise native suppression adoption, failure on new violations, and pruning. This replaces the custom baseline suite while retaining the adapter's known count-based limitation.

This keeps user friction in the established lint loop and avoids duplicating functionality already owned by ESLint.
