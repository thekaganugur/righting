---
name: righting-deep-modules
description: End-to-end workflow for a volatility-backed Architecture Module or an accepted Module with unfinished placement or migration design. Use when the user wants to design an Architecture Module, complete its physical-realization plan, define its Interface-level test strategy, or settle its migration slice.
compatibility: Requires the sibling righting-volatility-review, righting-module-design, and righting-domain-modeling skills packaged with this skill.
---

# Volatility-driven deep Modules

This workflow routes one selected Architecture Module work item through specialist skills rather than duplicating them. Use the vocabulary bridge defined by [`righting-module-design`](../righting-module-design/SKILL.md).

## 1. Route discovery

- For a review-only request, read [`righting-volatility-review`](../righting-volatility-review/SKILL.md) and its [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md), run that review, and stop before Interface design.
- For an existing selected `volatility-candidate/v1` packet, read [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md), then verify its evidence directly against the repository. Consume a current packet without rerunning discovery. When evidence is stale, read [`righting-volatility-review`](../righting-volatility-review/SKILL.md) and refresh the affected discovery evidence; rerun full discovery only when a bounded refresh cannot restore a current packet.
- For an existing selected `architecture-module-follow-up/v1` packet routed here, read the accepted Architecture Module document and verify its remaining work directly against current source. Continue without rerunning volatility discovery. Accepted responsibility and Interface are authoritative unless the maintainer explicitly reopens them; complete only the unresolved placement or migration design.
- Otherwise read [`righting-volatility-review`](../righting-volatility-review/SKILL.md) and its [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md), run discovery through actionable-item selection, and consume its selected packet.

A Speculative candidate cannot proceed. For a candidate, inventory existing accepted Architecture Module documents that intersect its callers, tests, or dependencies. For a follow-up, start from the selected accepted Module and include intersecting neighbors. Record current module roots and any Implementation still scattered through global role folders; existing accepted ownership is authoritative unless the maintainer reopens it.

This stage is complete when one work item is selected and current: either an Observed or credible Projected candidate with its evidence and role hypotheses, or an accepted follow-up with its document, remaining work, readiness, blockers, and unresolved placement or migration decisions. In both cases, relevant core use cases, affected code, and neighboring accepted Modules are known.

## 2. Apply the grilling gate

Inspect the selected work item's files, callers, tests, dependencies, domain documents, relevant ADRs, and accepted Architecture Module documents. Facts come from the repository; decisions come from the maintainer. For a follow-up, limit decisions to the recorded placement or migration gaps; the accepted responsibility and Interface remain settled.

Build a **living placement inventory** for every affected current file and every already-known planned file:

| File | Owner | Current path | Target path | Righting role or explicit treatment | Outside-root reason |
| --- | --- | --- | --- | --- | --- |

Owners are the selected Module, another accepted Module, a composition root, a host-required entrypoint, or genuinely module-neutral code. A framework, runtime, build tool, or deployment host justifies an outside location only when the repository proves that location is required.

If decisions remain, ask one question at a time, give your recommended answer, and wait. Use [`righting-domain-modeling`](../righting-domain-modeling/SKILL.md) when a domain term changes or a real architectural decision merits an ADR. Skip the interview when authoritative project evidence already resolves every decision.

For a candidate, this stage is complete when responsibility, exclusions, volatility scenarios, caller obligations, dependency categories, behavior to preserve, placement ownership, outside-root exceptions, and unresolved trade-offs are settled or explicitly rejected. For a follow-up, it is complete when every recorded remaining item has a settled target, treatment, sequence, and blocker disposition without silently changing the accepted Module.

## 3. Design through the vocabulary layer

Read [`DEEPENING.md`](../righting-module-design/DEEPENING.md). Use [`DESIGN-IT-TWICE.md`](../righting-module-design/DESIGN-IT-TWICE.md) only when materially different Interfaces need comparison.

For a candidate, design one conceptual Interface, which may expose several cohesive facets or entry points. Describe everything callers must know: business verbs, invariants, ordering, errors, configuration, and relevant performance semantics. A code-level facade requires a real caller; dependency ports follow `DEEPENING.md`.

For a follow-up, reuse the accepted Interface and complete only its missing placement inventory, target tree, or migration slice. When current evidence conflicts with the accepted design, return the conflict to the maintainer instead of silently redesigning it.

Show the hidden Implementation and map each internal responsibility to its applicable Client, Manager, Engine, ResourceAccess, Resource, or Utility role. Apply the closed-architecture constraints from `LANGUAGE.md`, translating its Contract-factoring guidance into cohesive Interface facets through the vocabulary bridge. A larger subsystem may compose role-bearing Modules but is not a seventh role.

Lay out the target **module root first**, with canonical role suffixes identifying responsibilities inside it. Do not default the target to global `clients/`, `managers/`, `engines/`, `access/`, or `resources/` folders. Files owned by another accepted Module target that Module's root rather than being absorbed into the selected one.

Keep a file outside a Module root only for an inventory reason accepted in stage 2. A host-required entrypoint remains at its required location, stays thin, and delegates through the Module's Interface; do not turn one framework's convention into a Righting-wide folder rule.

Finalize the living inventory as a **complete placement inventory** by adding every file introduced by the Interface and Implementation design.

Prepare a draft dedicated Architecture Module document for a candidate, or a focused revision to the accepted document for a follow-up, containing:

- the volatility evidence and change ownership;
- responsibility and exclusions;
- Interface facets and caller obligations;
- hidden Implementation and internal Righting roles;
- dependencies and composition;
- relevant core-use-case call chains;
- the complete placement inventory and module-first target tree; and
- the smallest behavior-preserving migration slice, naming the target module root and every moved or new file with its Righting role.

Prefer a slice that moves all existing Implementation and tests owned by the selected Module into the root. When independent validation requires an incremental move, mark the slice **partial**, list every residual placement, and name the evidence needed for the next move. A partial slice must not be described as having established, realized, or fully colocated the Architecture Module.

This stage is complete when the draft covers every item, accounts for every inventory entry, distinguishes complete from partial realization, and names every unresolved assumption.

## 4. Validate, accept, and hand off

Validate that each named volatility scenario changes the Implementation without changing the Interface, caller knowledge materially decreases, tests can observe behavior through the Interface, and dependency treatment satisfies `DEEPENING.md`. A candidate must support its relevant core use cases; a follow-up must preserve the accepted ones. The resulting architecture continues to support every core use case.

Validate placement separately: no known file owned by the selected Module remains outside its root without an explicit exception from the placement inventory. Host-required entrypoints remain thin, module-neutral files are independent of the volatility, and neighboring accepted Modules communicate through Interfaces rather than Implementation reach-through.

Return to the failing stage when evidence, design, placement, or test strategy is insufficient. Reject a candidate when its volatility does not justify an Architecture Module. Defer a follow-up when its accepted design is stale, contradictory, or blocked, naming what must resolve. Otherwise present the exact draft or revision and wait until the maintainer accepts it or requests revision.

After the maintainer accepts the draft or revision, write it using the repository's architecture-document convention, updating the accepted document for a follow-up or using `docs/architecture/<module-name>.md` when none exists. Keep domain vocabulary in `CONTEXT.md`, durable trade-off rationale in ADRs, and enforceable policy in `righting.json`. Label the handoff's migration outcome as complete or partial; acceptance of the target design does not make a partial migration complete.

Stop before moving folders, changing architecture-policy enforcement, or editing application code. Continue through the project's normal specification or implementation workflow only after the accepted document and migration slice exist.
