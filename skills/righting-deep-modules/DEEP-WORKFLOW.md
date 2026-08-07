# Exhaustive Architecture Module workflow

Use this branch only after the escalation gate in [`SKILL.md`](SKILL.md) is accepted. It preserves the full evidence, comparison, placement, and acceptance process for consequential or genuinely ambiguous Module work.

## 1. Re-establish exhaustive evidence

Inspect the selected work item's files, callers, tests, dependencies, domain documents, relevant ADRs, accepted neighboring Modules, current branch, and active migration state. Facts come from the repository; decisions come from the maintainer.

Reuse current discovery evidence. When the escalation trigger leaves independent evidence gaps, delegate one fresh read-only scout per gap in parallel. Give each scout a bounded question and require compressed evidence with paths and symbols. Keep overlapping questions in the main agent and never rerun completed reconnaissance.

For a candidate, verify its core use cases, volatility axes and tier, ripple evidence, role hypotheses, open calls, leaked knowledge, and smallest local correction. For an accepted follow-up, verify the accepted document, root, remaining work, readiness, blockers, and neighboring ownership without reopening its responsibility or Interface.

This stage is complete when every fact used by the escalation trigger has current repository evidence, each delegated area has one owner, and no active migration or accepted Module conflict remains implicit.

## 2. Apply the exhaustive grilling gate

Build a **living placement inventory** for every affected current file and every already-known planned file:

| File | Owner | Current path | Target path | Righting role or explicit treatment | Outside-root reason |
| --- | --- | --- | --- | --- | --- |

Owners are the selected Module, another accepted Module, a composition root, a host-required entrypoint, or genuinely module-neutral code. A framework, runtime, build tool, or deployment host justifies an outside location only when the repository proves that location is required.

For a candidate, settle responsibility, exclusions, volatility scenarios, caller obligations, dependency categories, behavior to preserve, placement ownership, outside-root exceptions, and trade-offs. For a follow-up, limit decisions to recorded placement or migration gaps; accepted responsibility and Interface remain authoritative.

Ask one question at a time, give the recommended answer, and wait. Use [`righting-domain-modeling`](../righting-domain-modeling/SKILL.md) when a domain term changes or a durable architectural trade-off meets its ADR gate. Skip a question only when authoritative project evidence already resolves it.

This stage is complete when every inventory entry and escalation-trigger decision is settled, explicitly rejected, or recorded as a blocker.

## 3. Complete design through the vocabulary layer

Read [`DEEPENING.md`](../righting-module-design/DEEPENING.md) completely. Read [`DESIGN-IT-TWICE.md`](../righting-module-design/DESIGN-IT-TWICE.md) only when the escalation trigger was competing Interface or Seam designs and the maintainer accepted that comparison.

For a candidate, design one conceptual Interface, which may expose several cohesive facets or entry points. Describe everything callers must know: business verbs, invariants, ordering, errors, configuration, and relevant performance semantics. A code-level facade requires a real caller; dependency ports follow `DEEPENING.md`.

For a follow-up, reuse the accepted Interface and complete only its missing placement inventory, target tree, or migration slice. When current evidence conflicts with the accepted design, return the conflict to the maintainer instead of silently redesigning it.

Show the hidden Implementation and map every internal responsibility to its applicable Client, Manager, Engine, ResourceAccess, Resource, or Utility role. Apply the closed-architecture constraints from [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md). A larger subsystem may compose role-bearing Modules but is not a seventh role.

Lay out the target **module root first**, with canonical role suffixes identifying responsibilities inside it. Files owned by another accepted Module target that Module's root. A host-required entrypoint remains at its required location, stays thin, and delegates through the Module's Interface.

Finalize the living inventory as a **complete placement inventory** by adding every file introduced by the Interface and Implementation design.

Prepare a draft dedicated Architecture Module document for a candidate, or a focused revision to the accepted document for a follow-up, containing:

- volatility evidence and change ownership;
- responsibility and exclusions;
- Interface facets and caller obligations;
- hidden Implementation and internal Righting roles;
- dependencies and composition;
- relevant core-use-case call chains;
- the complete placement inventory and module-first target tree;
- the smallest behavior-preserving migration slice, naming the target root and every moved or new file with its Righting role; and
- Interface-level test strategy at agreed Seams.

Prefer a slice that moves all existing Implementation and tests owned by the selected Module into the root. When independent validation requires an incremental move, mark the slice **partial**, list every residual placement, and name the evidence needed for the next move. A partial slice must not be described as established, realized, or fully colocated.

This stage is complete when the draft accounts for every inventory entry, every caller obligation and relevant failure or performance semantic, complete versus partial realization, and every remaining assumption.

## 4. Validate, review, accept, and hand off

Validate that each named volatility scenario changes the Implementation without changing the Interface, caller knowledge materially decreases, tests observe behavior through the Interface, and dependency treatment satisfies `DEEPENING.md`. A candidate supports its relevant core use cases; a follow-up preserves the accepted ones. The resulting architecture continues to support every core use case.

Validate placement separately: no known file owned by the selected Module remains outside its root without an explicit inventory exception. Host-required entrypoints remain thin, module-neutral files are independent of the volatility, and neighboring accepted Modules communicate through Interfaces rather than Implementation reach-through.

Run one independent read-only review after the draft is complete. Apply actionable findings. Re-review only when a correction changes the Module boundary, Interface, placement decision, or migration outcome; otherwise validate the correction inline.

Return to the failing stage when evidence, design, placement, or test strategy is insufficient. Reject a candidate when its volatility does not justify an Architecture Module. Defer a follow-up when its accepted design is stale, contradictory, or blocked, naming what must resolve. Otherwise present the exact draft or revision and wait until the maintainer accepts it or requests revision.

After the maintainer accepts the draft or revision, write it using the repository's architecture-document convention, updating the accepted document for a follow-up or using `docs/architecture/<module-name>.md` when none exists. Keep domain vocabulary in `CONTEXT.md`, durable trade-off rationale in ADRs, and enforceable policy in `righting.json`. Label the handoff's migration outcome as complete or partial.

Stop before moving folders, changing architecture-policy enforcement, or editing application code. Continue through the project's normal specification or implementation workflow only after the accepted document and migration slice exist.
