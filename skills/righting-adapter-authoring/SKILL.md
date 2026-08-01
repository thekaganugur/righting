---
name: righting-adapter-authoring
description: Author, assess, or extend a Righting guardrail adapter from the normalized JSON contract and prove its claims through adapter-neutral conformance. Use when a maintainer wants a guardrail integration, an approval-ready adapter change, or expanded support.
compatibility: Requires the local righting CLI and an established native guardrail command.
---

# Conformance-led adapter authoring

Build a thin native adapter around the normalized contract. Read the conformance contract shipped by the same package at `node_modules/righting/docs/adapter-conformance.md`; it is the support gate.

## 1. Capture the trust boundary

Run `npx righting inspect --json` from the target project before designing adapter mechanics. Keep the exact JSON as the test input. Proceed only when `ok` is true, the policy status is `valid`, and the top-level `schemaVersion` and `contract.contractVersion` are versions the adapter explicitly supports.

Consume the JSON `contract` through the CLI boundary. Keep normalization in Righting: the adapter must not parse or normalize `righting.json`, import `righting/core`, infer roles from the repository, or treat inspection's unknown adapter status as activation evidence.

A JavaScript or TypeScript adapter may optionally import `classifySource` from `righting/contract` as Righting's reference interpreter after validating the inspection envelope and contract version. This optional helper covers source classification only; it does not replace native resolution, diagnostics, capability checks, or black-box conformance.

**Completion:** retain the exact inspection JSON inline or at a named path with its SHA-256, target revision, CLI artifact identity, inspected contract versions, policy path, exact command, and fail-closed behavior. Every later fixture and claim references this capture or a named isolated-fixture capture.

## 2. Bound the capability claim

Treat complete `role-dependency` behavior as the minimum support claim. Read `contract.effective.capabilities`; list each additional capability as claimed or unsupported, and claim one only when every applicable conformance family will run. Carry its `establishes`, `doesNotEstablish`, and `policyRuleIds` into the support record without widening them.

When the adapter intends to claim a capability that is not applicable to the target project's contract, create an isolated complete fixture policy that makes it applicable and run `righting inspect --json` there. Use that returned nonempty normalized shape as the implementation and test input; keep the target project's policy unchanged.

**Completion:** every applicable capability has one explicit disposition and every claim points to its required scenario families.

## 3. Choose the compose/own seam

Inspect the immutable installed artifact and approved candidate artifacts for an adapter that already supports the target host and tuple. Prefer activation or upgrade; propose owned runtime only after a public-native test records the gap that prevents reuse.

Compose the host's native plugin lifecycle, dependency-node traversal, resolver ecosystem, policy matcher, diagnostics, and suppression where established components provide them. On ESLint and version-pinned ESLint-compatible hosts, prefer `eslint-plugin-boundaries` for traversal, resolution, and matching only after the complete Righting suite passes against that exact tuple. Keep a direct native implementation when composition cannot meet the contract or conformance gate with less owned surface.

Own only the thin Righting layer:

- contract and version validation;
- exact source classification from normalized conventions;
- translation of effective role and protected-dependency rules;
- stable `righting/*` identities in observable findings;
- fail-closed unresolved-local behavior; and
- capability claims and their conformance record.

Use the host's resolver configuration for every local alias the project claims, and test those aliases. Define which native specifier forms are local-like before resolving them: unmatched or unsupported local-like specifiers remain local and fail closed as unresolved rather than becoming external. For overlapping exact or wildcard mappings, preserve host precedence; when the most-specific match is unsupported, do not fall through to a broader supported mapping. Test exact matches, overlapping patterns, unmatched local-like specifiers, and unsupported mappings wherever the host exposes them. Add custom traversal or resolution only when the native ecosystem lacks a conforming path. Filename-case plugins enforce casing, not Righting's semantic roles; compose one only for a separately declared case requirement.

**Completion:** the implementation plan names the reusable adapters evaluated and their black-box disposition, each composed mechanic, each thin-layer responsibility, pinned versions, and every unresolved compatibility risk. Every proposed owned behavior maps to a reproduced defect, an applicable conformance mismatch in current code, or an explicitly requested support claim.

### Approval branch

When the maintainer asks for a proposal, approval packet, or read-only assessment, gather non-mutating evidence and stop at one exact approval request. Name one immutable adapter artifact and version tuple; separate current state from the proposed add/change/delete scope; include the retained inspection capture; and keep separate package-conformance and target-activation ledgers. For every applicable scenario family, a `passed` row names the executed artifact, fixture, public command, observed exit, and stable diagnostic; a `required` row names the planned fixture and command, records expected results, and says `observed: pending`. Planned fixtures are not evidence, and isolated capability policies are package evidence rather than target activation. Either incomplete evidence class blocks a support claim.

Make the proposed scope and acceptance gate executable together. Every required command block names its working directory, creates its prerequisites, uses literal paths and expected values rather than placeholders or multi-artifact globs, and is copy-paste runnable after the listed adds, deletes, and renames; map every retired proof to a named surviving or replacement test. Use one artifact identity: either a release locator plus integrity, or a source revision packed twice from two fresh materializations after identical literal build steps, with both digests equal to the approved digest. Record how the public entry point, shipped support record, peer tuple, and lock resolution will be verified. Present alternatives as separate approval options.

**Completion:** one exact implementation decision, artifact, evidence ledger, final-tree command sequence, and support boundary are ready for approval. Commands assert promised identities and stable diagnostics; isolated consumers materialize the proposed final tree or a named final revision. The request separately states what is approved now and which support claim waits on required rows. Stop until explicit approval; an implementation request that already names the scope is approval to continue.

## 4. Implement through the native entry point

Translate `contract.effective.allowedDependencies`, conventions, protected-dependency rules, and stable policy-rule IDs into the host's native configuration or visitor/report API. Preserve static imports, re-exports, literal `require`, dynamic imports, and type-only imports when the host can observe them. Make unresolved would-be local dependencies diagnostic rather than external-by-default bypasses.

Emit native diagnostics at actionable source locations. When the native rule ID cannot equal a stable Righting identity, include the exact `righting/*` identity in structured diagnostic data or the message and prove that mapping black-box.

**Completion:** the project's normal native lint command loads the adapter, allowed smoke fixtures pass, and one intentional forbidden fixture reports its expected stable identity.

## 5. Run black-box conformance

Read every family in `node_modules/righting/docs/adapter-conformance.md`. Supply native fixtures and commands for all families required by `role-dependency` and each additional claim. Execute them through the public native lint command against the exact captured contract; helper-level policy tests do not satisfy conformance.

Record allowed and forbidden outcomes, exact stable identities, commands, and version tuple. For classification and dependency matrices, exercise every canonical role through its filename and directory conventions plus every configured alias. Test both directions across the declared coverage boundary: a covered importer may reach outside coverage without expanding it, and source outside coverage remains unchecked. Do not mark a broad family complete from one representative case when the family names multiple forms or treatments. Diagnostics are mandatory. If native suppression exists, separately test a dependency diagnostic, a file-level classification diagnostic, and unused suppression detection; suppression support is declared evidence rather than a prerequisite for adapter support.

**Completion:** every required family has a recorded passing native execution, with no undocumented skip or capability claim.

## 6. Leave an honest support record

Run the adapter's focused tests, the package's full tests, typecheck, build, normal lint command, and `git diff --check`. Pin the exact host, plugin, and resolver versions in the test installation; when the host exposes its actual runtime version, verify it instead of trusting installation metadata alone. Record the exact tested Righting, adapter, guardrail, plugin, and resolver versions; claimed and unsupported capabilities; commands; native suppression and legacy-debt limits; and known resolver or host-API gaps.

The support record must include each capability's `establishes`, `doesNotEstablish`, and `policyRuleIds`; each scenario family's fixture, native command, allowed and forbidden exit status, and stable diagnostics; and every validation command with its observed outcome. Recheck that commands address the final file tree and that retired proofs have named replacements. When the adapter is published, use a clean consumer to install the one approved immutable packed or released artifact, verify its integrity, peer tuple, lock resolution, and shipped support record, and load it through its public package specifier.

A passing tuple is one support record, not a compatibility matrix. Keep adapter runtime code in its chosen native package or project; this skill introduces no public SDK, manifest, generated matrix, or ecosystem-specific skill.

**Completion:** all final-tree checks and required scenario rows pass, and another agent can reproduce the exact artifact, contract input, native finding, and support boundary.
