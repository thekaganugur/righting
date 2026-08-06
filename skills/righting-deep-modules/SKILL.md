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

A Speculative candidate cannot proceed. This stage is complete when one current, Observed or credible Projected candidate is selected and its relevant core use cases, volatility evidence, affected code, role hypotheses, open calls, and leaked knowledge are known.

## 2. Apply the grilling gate

Inspect the candidate's files, callers, tests, dependencies, domain documents, and relevant ADRs. Facts come from the repository; decisions come from the maintainer.

If decisions remain, ask one question at a time, give your recommended answer, and wait. Use [`righting-domain-modeling`](../righting-domain-modeling/SKILL.md) when a domain term changes or a real architectural decision merits an ADR. Skip the interview when authoritative project evidence already resolves every decision.

This stage is complete when responsibility, exclusions, volatility scenarios, caller obligations, dependency categories, behavior to preserve, and unresolved trade-offs are either settled or explicitly rejected by the maintainer.

## 3. Design through the vocabulary layer

Read [`DEEPENING.md`](../righting-module-design/DEEPENING.md). Use [`DESIGN-IT-TWICE.md`](../righting-module-design/DESIGN-IT-TWICE.md) only when materially different Interfaces need comparison.

Design one conceptual Interface, which may expose several cohesive facets or entry points. Describe everything callers must know: business verbs, invariants, ordering, errors, configuration, and relevant performance semantics. A code-level facade requires a real caller; dependency ports follow `DEEPENING.md`.

Show the hidden Implementation and its internal Client, Manager, Engine, ResourceAccess, Resource, and Utility responsibilities. Apply the closed-architecture and contract-factoring constraints from `LANGUAGE.md`; a larger subsystem may compose role-bearing Modules but is not a seventh role.

Name the target module root and map each current or new file to its destination and Righting role, applying the Architecture Module placement rule from the vocabulary layer.

Prepare a draft dedicated Architecture Module document containing:

- the volatility evidence and change ownership;
- responsibility and exclusions;
- Interface facets and caller obligations;
- hidden Implementation and internal Righting roles;
- dependencies and composition;
- relevant core-use-case call chains; and
- the smallest behavior-preserving migration slice, naming the target module root and every moved or new file with its Righting role.

This stage is complete when the draft covers every item and names every unresolved assumption.

## 4. Validate, accept, and hand off

Validate that each named volatility scenario changes the Implementation without changing the Interface, caller knowledge materially decreases, tests can observe behavior through the Interface, and dependency treatment satisfies `DEEPENING.md`. The candidate must support its relevant core use cases while the resulting architecture continues to support every core use case.

Return to the failing stage when evidence, design, or test strategy is insufficient. Reject the candidate when its volatility does not justify an Architecture Module. Otherwise present the exact draft and wait until the maintainer accepts it or requests revision.

After the maintainer accepts the draft, write it using the repository's architecture-document convention, or `docs/architecture/<module-name>.md` when none exists. Keep domain vocabulary in `CONTEXT.md`, durable trade-off rationale in ADRs, and enforceable policy in `righting.json`.

Stop before moving folders, changing architecture-policy enforcement, or editing application code. Continue through the project's normal specification or implementation workflow only after the accepted document and migration slice exist.
