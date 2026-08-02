---
name: righting-adapter-authoring
description: Author, assess, or extend a Righting guardrail adapter from the normalized JSON contract and prove its claims through adapter-neutral conformance. Use when a maintainer wants a guardrail integration, an approval-ready adapter change, or expanded support.
compatibility: Requires the local righting CLI and an established native guardrail command.
---

# Conformance-led adapter authoring

Build a thin guardrail adapter around the normalized contract. Read the conformance contract shipped by the same package at `node_modules/righting/docs/adapter-conformance.md`; it is the support gate. Here **native** means the host's public command, configuration, diagnostics, and suppression—not the adapter's implementation language.

## 1. Capture the trust boundary

Run `npx righting inspect --json` from the target project before designing adapter mechanics. Keep the exact JSON as the test input. Proceed only when `ok` is true, the policy status is `valid`, and the top-level `schemaVersion` and `contract.contractVersion` are versions the adapter explicitly supports.

Consume the JSON `contract` through the CLI boundary. Keep normalization in Righting: the adapter must not parse or normalize `righting.json`, import `righting/core`, infer roles from the repository, or treat inspection's unknown adapter status as activation evidence.

**Completion:** retain the exact inspection JSON inline or at a named path with its SHA-256, target revision, CLI artifact identity, inspected contract versions, policy path, exact command, and fail-closed behavior. Every later fixture and claim references this capture or a named isolated-fixture capture.

## 2. Bound the capability claim

Treat complete `role-dependency` behavior as the minimum support claim. Read `contract.effective.capabilities`; list each additional capability as claimed or unsupported, and claim one only when every applicable conformance family will run. Carry its `establishes`, `doesNotEstablish`, and `policyRuleIds` into the support record without widening them.

When the adapter intends to claim a capability that is not applicable to the target project's contract, create an isolated complete fixture policy that makes it applicable and run `righting inspect --json` there. Use that returned nonempty normalized shape as the implementation and test input; keep the target project's policy unchanged.

**Completion:** every applicable capability has one explicit disposition and every claim points to its required scenario families.

## 3. Choose the compose/own seam

Inspect the immutable installed artifact and approved candidate artifacts for an adapter that already supports the target host and tuple. Prefer activation or upgrade; propose owned runtime only after a public-native test records the gap that prevents reuse.

Compose at the narrowest useful seam: native plugin lifecycle, dependency-node traversal, resolver ecosystem, policy matcher, diagnostics, or suppression. On hosts compatible with established plugin ecosystems, evaluate resolver-only, traversal-and-matcher, and complete-plugin candidates. Choose the smallest combined implementation that passes conformance and preserves stable native diagnostics and suppression; replace overlapping owned behavior rather than layering two dependency engines. Keep a direct native implementation when composition cannot meet the contract or conformance gate with less owned surface.

Own only the thin Righting layer:

- contract and version validation;
- exact source classification from normalized conventions;
- translation of effective role and protected-dependency rules;
- stable `righting/*` identities in observable findings;
- fail-closed unresolved-local behavior; and
- capability claims and their conformance record.

Treat resolution as a total outcome: resolved local target, resolved external dependency, host builtin, or unresolved with a reason. Preserve the outcome through classification: a resolved local target is classified against declared coverage, a resolved target outside coverage remains outside, and an unresolved bare reference becomes external only when the host resolver identifies it as external. On package-based hosts, normalize a protected dependency to its package identity before evaluating subpath imports.

Use the host's resolver configuration for every dependency-path mapping the project uses, and test those mappings. Define which native dependency-reference forms are local-like before resolving them: unmatched or unsupported local-like references remain local and fail closed as unresolved rather than becoming external. For overlapping exact or wildcard mappings, preserve host precedence; when the most-specific match is unsupported, keep that failure rather than falling through to a broader supported mapping. Exercise exact matches, overlapping patterns, unmatched local-like references, and unsupported mappings wherever the host exposes them. Add custom traversal or resolution only when the native ecosystem lacks a conforming path. Record every composed plugin and resolver as a direct runtime dependency or explicit project prerequisite rather than relying on a transitive installation.

Define the adapter lifecycle: project-root selection, contract and resolver snapshot lifetime, reload behavior in editor, watch, or other long-lived processes, and multi-root behavior. Support each case or fail once with an actionable configuration diagnostic.

**Completion:** the implementation plan names the candidates evaluated at each seam and their black-box disposition, the normalized resolution outcomes, each thin-layer responsibility, direct runtime requirements, root and state lifetime, pinned versions, and every unresolved compatibility risk. Every proposed owned behavior maps to a reproduced defect, an applicable conformance mismatch in current code, or an explicitly requested support claim.

### Approval branch

When the maintainer asks for a proposal, approval packet, or read-only assessment, read [`APPROVAL.md`](APPROVAL.md) completely and follow its evidence and approval gate. Continue to implementation only after that gate records explicit approval.

## 4. Implement through the native entry point

Translate `contract.effective.allowedDependencies`, conventions, protected-dependency rules, and stable policy-rule IDs into the host's native configuration or visitor/report interface. Preserve every static dependency form claimed by the support record. Make unresolved would-be local dependencies diagnostic rather than external-by-default bypasses. Create one authoritative analysis per observed dependency; share or cache that result across policy rules when the host exposes a safe run- or source-scoped lifetime.

Emit native diagnostics at the dependency reference or nearest actionable source location. Include resolution reasons and resolved targets when available. When the native rule ID cannot equal a stable Righting identity, include the exact `righting/*` identity in structured diagnostic data or the message and prove that mapping black-box. Claim policy-ID-specific suppression only when native directives target that identity; otherwise record the native rule's collapsed suppression granularity.

**Completion:** the project's normal native lint command loads the adapter, allowed smoke fixtures pass, one intentional forbidden fixture reports its expected stable identity at an actionable location, and the implemented suppression granularity is explicit.

## 5. Run black-box conformance

Read every family in `node_modules/righting/docs/adapter-conformance.md`. Supply native fixtures and commands for all families required by `role-dependency` and each additional claim. Execute them through the public native lint command against the exact captured contract; helper-level policy tests do not satisfy conformance.

Record allowed and forbidden outcomes, exact stable identities, commands, and version tuple. Derive the applicable family ledger from the shipped conformance contract, maintain an executable registration set, and assert that the registrations match that ledger. For classification and dependency matrices, exercise every canonical role through its filename and directory conventions plus every configured alias. Test both directions across the declared coverage boundary: a covered importer may reach outside coverage without expanding it, and source outside coverage remains unchecked. A broad family is complete only after every form and treatment it names has executed. Diagnostics are mandatory. If native suppression exists, separately test a dependency diagnostic, a file-level classification diagnostic, unused suppression detection, and any documented collapsed suppression granularity; suppression support is declared evidence rather than a prerequisite for adapter support.

**Completion:** every required family is registered exactly once and has a recorded passing native execution, with no undocumented skip or capability claim.

## 6. Leave an honest support record

Run the adapter's focused tests, the package's full tests, applicable type or static checks, build, normal guardrail command, and `git diff --check`. Pin the exact host, plugin, and resolver versions in the test installation; when the host exposes its actual runtime version, verify it instead of trusting installation metadata alone. Verify every composed runtime dependency from a clean installation. Record the exact tested Righting, adapter, guardrail, plugin, and resolver versions; claimed and unsupported capabilities; commands; native suppression and legacy-debt limits; lifecycle limits; and known resolver or host-API gaps.

The support record must include each capability's `establishes`, `doesNotEstablish`, and `policyRuleIds`; each scenario family's fixture, native command, allowed and forbidden exit status, and stable diagnostics; and every validation command with its observed outcome. Assert that the adapter version recorded in the shipped support record equals the immutable adapter artifact's version. Recheck that commands address the final file tree and that retired proofs have named replacements. When the adapter is published, use a clean consumer to install the one approved immutable packed or released artifact, verify its integrity, direct runtime requirements, declared host/dependency tuple, lock resolution, and shipped support record, and load it through its public installation locator.

When the host or adapter makes a performance claim, record a reproducible representative benchmark, cold and warm behavior where applicable, and the accepted regression budget. A passing tuple is one support record, not a compatibility matrix. Keep adapter runtime code in its chosen native package or project; this skill introduces no public SDK, manifest, generated matrix, or ecosystem-specific skill.

**Completion:** all final-tree checks and required scenario rows pass, every direct runtime requirement installs in a clean consumer, the support record matches the artifact, any performance claim has reproducible evidence, and another agent can reproduce the exact artifact, contract input, native finding, and support boundary.
