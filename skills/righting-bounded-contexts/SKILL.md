---
name: righting-bounded-contexts
description: Design or reassess strategic bounded contexts, record the maintainer-approved model, advise migration, and return a validated contextFirewall candidate or an evidence-backed omission.
compatibility: Requires the local righting CLI for candidate validation.
---

# Evidence-led bounded-context design

Use this specialist when a maintainer wants to discover or reassess bounded contexts. Remaining one context, preserving an approved map, and omitting `contextFirewall` are valid outcomes. This skill may be called directly or by `righting-integrate`; return the final result to the caller so integration can resume.

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

**Completion criterion:** the recommendation, conservative alternative, strongest counterevidence, confidence, and one boundary-changing uncertainty are all supported without an exhaustive pre-approval source inventory.

## 2. Build the recommendation

Recommend one coarse design and one conservative alternative, including one context when credible. Prefer the fewest boundaries explained by meaningful differences in purpose, model, language, responsibility, or ownership; technical layers are not contexts.

Give each proposed context in both designs a compact card with:

- name, purpose, users/jobs, and responsibilities;
- owned model and exact project language, especially overloaded terms;
- owner/change authority or `unknown`;
- decision-relevant relationships and exchanged capability/information;
- design evidence and counterevidence with paths;
- `high`, `medium`, or `low` confidence with reason; and
- current code fit as `inside`, `outside`, `mixed`, or `uncertain`, explicitly labeled realization evidence.

A relationship is decision-relevant when another model's rules or exchanged information crosses a proposed boundary or materially constrains it. For each one, separately record **direction**, **influence**, **exchange in each direction** (`none` when genuinely one-way), and **model treatment** (`share`, `translate`, or `isolate`). Trace a representative documented contract or producer/consumer path to verify request and return flow. Name external actors/services separately when they supply distinct rules or a return flow. A user/browser action following delivered navigation is an external-party flow, not a reverse context exchange, unless the receiving context consumes response data from the sender. Use named DDD relationships only when evidenced; reused utilities alone are neither a Shared Kernel nor a reason for a `shared` scope.

**Completion criterion:** every card has every field; each owned term is verbatim project language or explicitly labeled proposed; each relationship entry names one actor/service (no grouped label) and has an evidence-checked producer, consumer, request, and return; and both designs explain the same evidence without presenting either as approved.

## 3. Shape and approve

Before the first question, present a concise decision packet: current terrain, recommendation, conservative alternative, distinguishing evidence/counterevidence, confidence, and the highest-impact uncertainty. Ask that one question and revise only affected cards after each answer.

Preserve settled project facts unless contradictory evidence appears. On a known-context replay, validate authoritative semantic boundaries and current realization rather than demanding redundant approval. When material evidence contradicts an approved decision, ask whether to preserve, revise, or defer it.

Before writing domain documents, show the complete strategic design and ask for explicit approval or revision. If the maintainer cannot resolve a material semantic, authority, or relationship decision, coarsen the design or return `unresolved`.

**Completion criterion:** either the complete design has explicit/authoritative approval, or the unresolved decision is named and no design is labeled approved.

## 4. Finish the applicable branch

- For `unresolved`, write no domain documents and present no firewall candidate. Return the fixed result below with the pending single question.
- After explicit approval, or for a non-contradicted authoritative map, read [`references/approved-design-and-firewall.md`](references/approved-design-and-firewall.md) completely before writing domain documents, classifying firewall paths, or choosing `candidate` versus `omit-for-now`.

Return one standalone Markdown result with exactly these headings:

```markdown
## Outcome
candidate | omit-for-now | unresolved

## Evidence
<inspected scope, design evidence, realization evidence, counterevidence, confidence>

## Approval
<explicit or authoritative approval, or unresolved decision>

## Approved design
<approved cards; for unresolved, clearly labeled proposals only>

## Domain documents
<files changed; none when unresolved>

## Migration advice
<concerns, sequencing, risks, validation; no application-code changes>

## Context firewall
<validated fragment and evidence, failed gates, or unresolved status>

## Capability limits
<static-import guarantees and limits>

## Next step
<one caller-neutral continuation or pending question>
```

`candidate` requires approved design and a mechanically validated fragment. `omit-for-now` requires approved design but at least one failed firewall gate. `unresolved` means strategic approval is incomplete. `contextFirewall` checks configured static cross-context and shared-to-context source imports; it does not prove runtime behavior, isolation, ownership, migration completion, or design quality. Complete-policy adoption always requires later revalidation and approval.
