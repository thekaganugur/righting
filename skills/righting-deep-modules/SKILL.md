---
name: righting-deep-modules
description: Design or complete an Architecture Module through a focused default workflow, with exhaustive analysis available through an explicit escalation gate. Use when the user wants an accepted Module design, physical-realization plan, Interface-level test strategy, or migration slice.
compatibility: Requires the sibling righting-volatility-review, righting-module-design, and righting-domain-modeling skills packaged with this skill.
---

# Volatility-driven deep Modules

Route one Architecture Module work item from current evidence to maintainer acceptance. Use the vocabulary bridge defined by [`righting-module-design`](../righting-module-design/SKILL.md). **Focused** is the default; exhaustive depth is disclosed only when the escalation gate fires.

## 1. Select current work

First inspect the current branch, worktree state, accepted Architecture Module documents, and active accepted migration. When the current branch or active migration belongs to an accepted Module, present that work and wait for the maintainer before any new-candidate discovery.

- For a review-only request, read [`righting-volatility-review`](../righting-volatility-review/SKILL.md) and its [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md), run that review, and stop before Interface design.
- For an existing selected `volatility-candidate/v1` packet, read [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md), then verify its evidence directly against the repository. Consume a current packet without rerunning discovery. When evidence is stale, refresh the affected discovery evidence; rerun full discovery only when a bounded refresh cannot restore a current packet.
- For an existing selected `architecture-module-follow-up/v1` packet routed here, read the accepted Architecture Module document and verify its remaining work directly against current source. Continue without rerunning volatility discovery. Accepted responsibility and Interface are authoritative unless the maintainer explicitly reopens them.
- Otherwise read [`righting-volatility-review`](../righting-volatility-review/SKILL.md) and its [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md), run discovery through actionable-item selection, and consume the selected packet. Use its focused output unless the maintainer already made an explicit visual or deep request.

A Speculative candidate cannot proceed. This stage is complete when one current candidate or accepted follow-up is selected, its relevant core use cases and affected code are known, and active work does not leave sequencing ambiguous.

## 2. Choose depth

Apply the **escalation gate**. Focused remains the default. Exhaustive depth is available when:

- the maintainer explicitly requests a deep, visual, formal, or alternative-Interface comparison;
- at least two materially different credible Module boundaries, Interfaces, or Seam placements remain after focused inspection;
- accepted Modules claim conflicting ownership;
- an architectural decision is difficult to reverse; or
- security, concurrency, or data integrity risk cannot be bounded by focused design.

Repository size and subagent availability are not escalation evidence. An explicit request matching the first trigger already accepts escalation. Otherwise state the concrete trigger and expected added work—parallel evidence gathering, alternative comparison, exhaustive inventory, and independent review—recommend whether it is warranted, and ask the maintainer before reading [`DEEP-WORKFLOW.md`](DEEP-WORKFLOW.md). When accepted, read it completely and follow it instead of the focused path below.

## 3. Focused design

Work inline. Use one read-only scout only when a named evidence gap spans an independent area and moving that recon out protects the main context; state the evidence gap before launching it.

Inspect the selected files, callers, tests, dependencies, domain documents, relevant ADRs, and accepted neighboring Modules. For a new candidate, verify the review's local correction against current evidence before designing a new Architecture Module. Proceed with the Module only when that correction leaves the evidenced volatility, caller knowledge, or ownership friction uncontained. For an accepted follow-up, preserve its accepted responsibility and Interface and settle only recorded placement or migration gaps.

Build one placement inventory for every affected current file and every already-known planned file:

| File | Owner | Current path | Target path | Righting role or explicit treatment | Outside-root reason |
| --- | --- | --- | --- | --- | --- |

Owners are the selected Module, another accepted Module, a composition root, a host-required entrypoint, or genuinely module-neutral code. A host-required entrypoint remains at its required location, stays thin, and delegates through the Module's Interface.

Ask unresolved decisions one at a time with a recommended answer. When a Module remains justified, design one conceptual Interface around real callers and observed behavior. Reuse an accepted Interface for a follow-up. Keep speculative features and implementation detail outside the draft.

Lay out the target **module root first**, retaining canonical role suffixes. Finalize the inventory, then prepare a concise Architecture Module draft containing:

- volatility evidence or accepted follow-up state;
- responsibility, exclusions, Interface, and caller obligations;
- hidden Implementation roles and dependencies;
- affected core-use-case call chains;
- the complete placement inventory and module-first target tree;
- the smallest behavior-preserving migration slice; and
- an Interface-level test strategy at agreed Seams, naming observable behavior, relevant failure and performance semantics, dependency substitution, and the disposition of moved or retained tests.

Prefer one complete placement slice. When independent validation requires increments, mark the outcome **partial**, list every residual placement, and name the evidence needed for the next move. A partial slice is never established, realized, or fully colocated.

Validate the draft once against the selected evidence, accepted neighboring ownership, Interface stability, observable behavior, dependency treatment, every test disposition, core use cases, placement inventory, and migration outcome. Use one independent reviewer only when the maintainer requests it or an escalation risk requires independent assurance; re-review only when a correction changes the boundary, Interface, or placement decision.

Present the exact draft and wait for acceptance. After acceptance, write it using the repository's architecture-document convention, updating an accepted document for a follow-up or using `docs/architecture/<module-name>.md` when none exists. Stop before moving source or editing application code; continue through the project's normal implementation workflow only after the accepted document and migration slice exist.

Focused design is complete when the local-correction comparison is resolved, every affected file has one placement disposition, every maintainer decision is explicit, the Interface-level test strategy observes required behavior through real Seams, and the accepted draft contains no speculative obligation.
