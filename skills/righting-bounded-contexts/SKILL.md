---
name: righting-bounded-contexts
description: Design or reassess strategic bounded contexts through concise decision briefs, record the maintainer-approved model, and return a validated contextFirewall candidate or an evidence-backed omission.
compatibility: Requires the local righting CLI for candidate validation.
---

# Evidence-led bounded-context design

Use this specialist when a maintainer wants to discover or reassess bounded contexts. Remaining one context, preserving an approved map, and omitting `contextFirewall` are valid outcomes. Keep investigation behind a concise **decision brief**. This skill may be called directly or by `righting-integrate`; return the final result to the caller so integration can resume.

## Guardrails

- Work at strategic design: purpose, model and language, responsibilities, change authority, relationships, permitted sharing/translation, and migration concerns. Leave tactical DDD and application refactoring to later work.
- Treat repository topology as realization evidence, never domain approval. Project-owned context documents and explicit maintainer decisions outrank inference; surface contradictions.
- Keep analysis read-only until approved domain documents are recorded. Temporary work and candidate validation live outside the target worktree. Use existing tools without installing, initializing, relinking, or updating project dependencies or skills.
- Ask one short, option-based maintainer question per turn, with brief help, concrete options, `other/uncertain`, and an evidence-backed recommendation.
- Require explicit approval of the complete strategic design. Silence, path names, prior policy approval, and firewall-fragment approval are insufficient.
- Preserve `righting.json` unchanged.

## 1. Build the decision evidence

Read repository instructions; `CONTEXT-MAP.md` or `CONTEXT.md`; relevant ADRs; product, use-case, ownership, schema, and test records; representative source paths; useful history; and the installed Righting `docs/policy-language.md` and `docs/capabilities.md`. State what was inspected and what material evidence was unavailable.

Resolve the target project's existing `node_modules/.bin/righting` to an absolute executable path without invoking a package manager. A PATH/global executable is not project-local; if the target-local bin is absent or unusable, record the CLI as unavailable. When available, run its `inspect --json` command from the target project and record normalized coverage, source summary, violations, and warnings. Inspection is mechanical realization evidence, not design approval.

Use two bounded passes:

1. Before approval, read authoritative records and enough representative execution paths/history to identify the coarse models, strongest counterevidence, and highest-impact uncertainty. Stop when more repository narration would not change the first question.
2. After approval—or for an authoritative known-context replay—close the full firewall classification universe as described in the approval branch.

Keep two evidence views:

- **Design evidence:** purpose/outcomes, users/jobs, workflows, responsibilities, language, independently applicable models, ownership/change authority, external systems, integration constraints, and observed axes of change.
- **Realization evidence:** paths/imports, schemas/stores, build/deployment units, ownership/history, tests, generated source, composition roots, and mixed files.

Cite paths for material observations, label inference, and say what each fact supports or weakens. Verify a referenced path is absent before calling its evidence unavailable; accessible material left outside the bounded pass is `not inspected`. Missing documentation is unknown, not evidence for one context. A singular user/maintainer/operator or Git author does not establish change authority; use `unknown` absent a direct record or maintainer answer. Describe current terrain as coherent, established, intermingled candidates, unknown, or legacy before proposing change.

**Completion criterion:** the recommendation, credible alternative, strongest counterevidence, confidence, and one boundary-changing uncertainty are all supported without an exhaustive pre-approval source inventory.

## 2. Form the recommendation

Recommend one coarse design and one credible alternative, including one context when credible. Prefer the fewest boundaries explained by meaningful differences in purpose, model, language, responsibility, or ownership; technical layers are not contexts. Identify which design is conservative rather than assuming the alternative is.

Before the maintainer chooses a direction, keep both designs as working sketches. The decision brief gives their purpose, main boundary, strongest evidence and counterevidence, confidence, and current code fit without expanding them into complete context cards.

**Completion criterion:** both sketches explain the same evidence, their material difference is clear, and one boundary-changing uncertainty determines the next question.

## 3. Shape and approve

Before the first question, present a concise decision brief: current terrain, recommendation, credible alternative, which design is conservative, distinguishing evidence/counterevidence, confidence, current code fit, and the highest-impact uncertainty. Ask one direction-selection question through that uncertainty, include the recommendation and `other/uncertain`, and explain that approval follows the complete selected design.

After the maintainer chooses a direction, expand only that design into compact context cards covering purpose, users/jobs, responsibilities, owned project language, change authority, decision-relevant relationships, evidence/counterevidence, confidence, and current code fit. For each relationship, establish direction, influence, exchange in each direction, and whether models are shared, translated, or isolated. Verify a representative documented contract or producer/consumer path. Name each external actor or service separately when its rules or return flow matter. A user or browser action after delivered navigation is external-party flow, not a reverse context exchange, unless response data returns to the sender. Use named DDD relationships only when evidenced; reused utilities alone are neither a Shared Kernel nor a reason for a `shared` scope.

Preserve settled project facts unless contradictory evidence appears. On a known-context replay, validate authoritative semantic boundaries and current realization rather than demanding redundant approval. When material evidence contradicts an approved decision, ask whether to preserve, revise, or defer it.

Before writing domain documents, show the complete selected design and ask for explicit approval or revision. Each owned term must be verbatim project language or labeled proposed; every material relationship names one actor or service rather than a grouped label and has an evidence-checked producer, consumer, request, and return. If the maintainer cannot resolve a material semantic, authority, or relationship decision, coarsen the design or return `unresolved`.

**Completion criterion:** either the complete design has explicit/authoritative approval, or the unresolved decision is named and no design is labeled approved.

## 4. Finish the applicable branch

- For `unresolved`, write no domain documents and present no firewall candidate. Return only this decision brief and stop:

```markdown
## Outcome
unresolved

## Decision
<current terrain, recommendation, credible alternative, conservative choice, decisive evidence and counterevidence, confidence, current code fit, boundary-changing uncertainty>

## Next step
<one direction-selection question with the recommendation and other/uncertain; complete-design approval comes later>
```

- After explicit approval, or for a non-contradicted authoritative map, read [`references/approved-design-and-firewall.md`](references/approved-design-and-firewall.md) completely before writing domain documents, classifying firewall paths, or choosing `candidate` versus `omit-for-now`.

For `candidate` or `omit-for-now`, return one standalone Markdown result with exactly these headings:

```markdown
## Outcome
candidate | omit-for-now

## Evidence
<material design and realization evidence, counterevidence, confidence>

## Approval
<explicit or authoritative approval>

## Approved design
<approved cards>

## Domain documents
<files changed>

## Migration advice
<concerns, sequencing, risks, validation; no application-code changes>

## Context firewall
<validated fragment and evidence, or failed gates>

## Capability limits
<static-import guarantees and limits>

## Next step
<one caller-neutral continuation>
```

`candidate` requires approved design and a mechanically validated fragment. `omit-for-now` requires approved design but at least one failed firewall gate. `unresolved` means strategic approval is incomplete. `contextFirewall` checks configured static cross-context and shared-to-context source imports; it does not prove runtime behavior, isolation, ownership, migration completion, or design quality. Complete-policy adoption always requires later revalidation and approval.
