---
name: righting-deep-modules
description: End-to-end workflow for a volatility-backed Architecture Module, from candidate discovery through maintainer acceptance. Use when the user wants to design an Architecture Module, its Interface-level test strategy, or its migration slice.
compatibility: Requires the sibling righting-volatility-review, righting-module-design, and righting-domain-modeling skills packaged with this skill.
---

# Volatility-driven deep Modules

This workflow routes one Architecture Module through specialist skills rather than duplicating them. Use the vocabulary defined by [`righting-module-design`](../righting-module-design/SKILL.md) throughout.

## 1. Route discovery

Read [`righting-volatility-review`](../righting-volatility-review/SKILL.md) and its [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md).

- For a review-only request, run `righting-volatility-review` and stop before Interface design.
- For an existing selected `volatility-candidate/v1` packet, verify that its evidence is current and do not rerun discovery.
- Otherwise run `righting-volatility-review` through candidate selection and consume its selected packet.

A Speculative candidate cannot proceed. Also inventory existing accepted Architecture Module documents that intersect the candidate, its callers, tests, or dependencies. Record their current module roots and any Implementation still scattered through global role folders; existing accepted ownership is authoritative unless the maintainer reopens it.

This stage is complete when one current, Observed or credible Projected candidate is selected and its relevant core use cases, volatility evidence, affected code, role hypotheses, open calls, leaked knowledge, and neighboring accepted Modules are known.

## 2. Apply the grilling gate

Inspect the candidate's files, callers, tests, dependencies, domain documents, relevant ADRs, and accepted Architecture Module documents. Facts come from the repository; decisions come from the maintainer.

Build a **living placement inventory** for every affected current file and every already-known planned file:

| File | Owner | Current path | Target path | Righting role or explicit treatment | Outside-root reason |
| --- | --- | --- | --- | --- | --- |

Owners are the selected Module, another accepted Module, a composition root, a host-owned entrypoint, or genuinely module-neutral code. A framework, runtime, build tool, or deployment host justifies an outside location only when the repository proves that location is required.

If decisions remain, ask one question at a time, give your recommended answer, and wait. Use [`righting-domain-modeling`](../righting-domain-modeling/SKILL.md) when a domain term changes or a real architectural decision merits an ADR. Skip the interview when authoritative project evidence already resolves every decision.

This stage is complete when responsibility, exclusions, volatility scenarios, caller obligations, dependency categories, behavior to preserve, placement ownership, outside-root exceptions, and unresolved trade-offs are either settled or explicitly rejected by the maintainer.

## 3. Design through the vocabulary layer

Read [`DEEPENING.md`](../righting-module-design/DEEPENING.md). Use [`DESIGN-IT-TWICE.md`](../righting-module-design/DESIGN-IT-TWICE.md) only when materially different Interfaces need comparison.

Design one conceptual Interface, which may expose several cohesive facets or entry points. Describe everything callers must know: business verbs, invariants, ordering, errors, configuration, and relevant performance semantics. A code-level facade requires a real caller; dependency ports follow `DEEPENING.md`.

Show the hidden Implementation and its internal Client, Manager, Engine, ResourceAccess, Resource, and Utility responsibilities. Apply the closed-architecture and contract-factoring constraints from `LANGUAGE.md`; a larger subsystem may compose role-bearing Modules but is not a seventh role.

Lay out the target **module root first**, with canonical role suffixes identifying responsibilities inside it. Do not default the target to global `clients/`, `managers/`, `engines/`, `access/`, or `resources/` folders. Files owned by another accepted Module target that Module's root rather than being absorbed into the selected one.

Keep a file outside a Module root only for an inventory reason accepted in stage 2. A host-owned entrypoint at a required location must stay thin and delegate through the Module's Interface; do not turn one framework's convention into a Righting-wide folder rule.

Finalize the living inventory as a **complete placement inventory** by adding every file introduced by the Interface and Implementation design.

Prepare a draft dedicated Architecture Module document containing:

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

Validate that each named volatility scenario changes the Implementation without changing the Interface, caller knowledge materially decreases, tests can observe behavior through the Interface, and dependency treatment satisfies `DEEPENING.md`. The candidate must support its relevant core use cases while the resulting architecture continues to support every core use case.

Validate placement separately: no known file whose responsibility or knowledge changes with the selected volatility remains outside the Module root without an explicit exception from the placement inventory. Host-owned entrypoints remain thin, module-neutral files are independent of the volatility, and neighboring accepted Modules communicate through Interfaces rather than Implementation reach-through.

Return to the failing stage when evidence, design, placement, or test strategy is insufficient. Reject the candidate when its volatility does not justify an Architecture Module. Otherwise present the exact draft and wait until the maintainer accepts it or requests revision.

After the maintainer accepts the draft, write it using the repository's architecture-document convention, or `docs/architecture/<module-name>.md` when none exists. Keep domain vocabulary in `CONTEXT.md`, durable trade-off rationale in ADRs, and enforceable policy in `righting.json`. Label the handoff's migration outcome as complete or partial; acceptance of the target design does not make a partial migration complete.

Stop before moving folders, changing architecture-policy enforcement, or editing application code. Continue through the project's normal specification or implementation workflow only after the accepted document and migration slice exist.
