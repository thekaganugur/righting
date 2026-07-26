---
name: write-righting-adapter
description: Author or extend a Righting guardrail adapter from the normalized JSON contract and prove its capability claims through adapter-neutral conformance. Use when a maintainer wants a new guardrail integration or needs to expand an existing adapter's supported behavior.
compatibility: Requires the local righting CLI and an established native guardrail command.
---

# Conformance-led adapter authoring

Build a thin native adapter around the normalized contract. Read the conformance contract shipped by the same package at `node_modules/righting/docs/adapter-conformance.md`; it is the support gate.

## 1. Capture the trust boundary

Run `npx righting inspect --json` from the target project before designing adapter mechanics. Keep the exact JSON as the test input. Proceed only when `ok` is true, the policy status is `valid`, and the top-level `schemaVersion` and `contract.contractVersion` are versions the adapter explicitly supports.

Consume the JSON `contract` through the CLI boundary. Keep normalization in Righting: the adapter must not parse or normalize `righting.json`, import `righting/core`, infer roles from the repository, or treat inspection's unknown adapter status as activation evidence.

**Completion:** the implementation record names the inspected contract versions, project policy path, exact inspect command, and fail-closed behavior for invalid or unsupported responses.

## 2. Bound the capability claim

Treat complete `role-dependency` behavior as the minimum support claim. Read `contract.effective.capabilities`; list each additional capability as claimed or unsupported, and claim one only when every applicable conformance family will run. Carry its `establishes`, `doesNotEstablish`, and `policyRuleIds` into the support record without widening them.

When the adapter intends to claim a capability that is not applicable to the target project's contract, create an isolated complete fixture policy that makes it applicable and run `righting inspect --json` there. Use that returned nonempty normalized shape as the implementation and test input; keep the target project's policy unchanged.

**Completion:** every applicable capability has one explicit disposition and every claim points to its required scenario families.

## 3. Choose the compose/own seam

Compose the host's native plugin lifecycle, dependency-node traversal, resolver ecosystem, policy matcher, diagnostics, and suppression where established components provide them. On ESLint and version-pinned ESLint-compatible hosts, prefer `eslint-plugin-boundaries` for traversal, resolution, and matching only after the complete Righting suite passes against that exact tuple. Keep a direct native implementation when composition cannot meet the contract or conformance gate with less owned surface.

Own only the thin Righting layer:

- contract and version validation;
- exact source and scope classification from normalized conventions;
- translation of effective role, protected-dependency, and scope rules;
- stable `righting/*` identities in observable findings;
- fail-closed unresolved-local behavior; and
- capability claims and their conformance record.

Use the host's resolver configuration for every local alias the project claims, and test those aliases. Add custom traversal or resolution only when the native ecosystem lacks a conforming path. Filename-case plugins enforce casing, not Righting's semantic roles; compose one only for a separately declared case requirement.

**Completion:** the implementation plan names each composed mechanic, each thin-layer responsibility, pinned versions, and every unresolved compatibility risk.

## 4. Implement through the native entry point

Translate `contract.effective.allowedDependencies`, conventions, protected-dependency rules, scope rules, and stable policy-rule IDs into the host's native configuration or visitor/report API. Preserve static imports, re-exports, literal `require`, dynamic imports, and type-only imports when the host can observe them. Make unresolved would-be local dependencies diagnostic rather than external-by-default bypasses.

Emit native diagnostics at actionable source locations. When the native rule ID cannot equal a stable Righting identity, include the exact `righting/*` identity in structured diagnostic data or the message and prove that mapping black-box.

**Completion:** the project's normal native lint command loads the adapter, allowed smoke fixtures pass, and one intentional forbidden fixture reports its expected stable identity.

## 5. Run black-box conformance

Read every family in `node_modules/righting/docs/adapter-conformance.md`. Supply native fixtures and commands for all families required by `role-dependency` and each additional claim. Execute them through the public native lint command against the exact captured contract; helper-level policy tests do not satisfy conformance.

Record allowed and forbidden outcomes, exact stable identities, commands, and version tuple. Diagnostics are mandatory. If native suppression exists, separately test a dependency diagnostic, a file-level classification diagnostic, and unused suppression detection; suppression support is declared evidence rather than a prerequisite for adapter support.

**Completion:** every required family has a recorded passing native execution, with no undocumented skip or capability claim.

## 6. Leave an honest support record

Run the adapter's focused tests, the package's full tests, typecheck, build, normal lint command, and `git diff --check`. Record the exact tested Righting, adapter, guardrail, plugin, and resolver versions; claimed and unsupported capabilities; commands; native suppression and legacy-debt limits; and known resolver or host-API gaps.

A passing tuple is one support record, not a compatibility matrix. Keep adapter runtime code in its chosen native package or project; this skill introduces no public SDK, manifest, generated matrix, or ecosystem-specific skill.

**Completion:** all checks pass and the record contains enough native fixtures, commands, versions, and limits for another agent to reproduce the claim.
