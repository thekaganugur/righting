---
name: righting-bounded-contexts
description: Design or reassess strategic bounded contexts, record the maintainer-approved model, advise migration, and return a validated contextFirewall candidate or an evidence-backed omission.
compatibility: Requires the local righting CLI for candidate validation.
---

# Evidence-led bounded-context design

Use this specialist when a maintainer wants to discover or reassess bounded contexts. A valid result may preserve one context, preserve an existing approved map, or omit `contextFirewall`. Do not invent boundaries to fill Righting scopes.

This skill may be called directly or by another skill. When called by `righting-integrate`, return the final result to it so integration can resume. Never edit `righting.json`.

## Guardrails

- Work at strategic design only: purpose, model and language, responsibilities, ownership, relationships, permitted sharing or translation, and code-to-boundary migration concerns.
- Do not design aggregates, entities, repositories, commands, events, or detailed interfaces. Do not refactor application code.
- Repository topology is realization evidence, never domain policy. Folders, imports, schemas, tests, and history may support or contradict a proposal but cannot approve it.
- Existing project-owned context documents and explicit maintainer decisions outrank inferred evidence. Surface contradictions; do not silently replace an approved semantic boundary with a folder-derived one.
- Ask one short, option-based maintainer question at a time. Include brief help, an example when useful, an `other/uncertain` option, and your recommendation.
- Require explicit approval of the complete strategic design. Silence, a directory name, prior policy approval, or approval of a firewall fragment is not bounded-context approval.

## 1. Inspect and separate the evidence

Read the repository's instructions, `CONTEXT-MAP.md` or `CONTEXT.md`, relevant ADRs, product and use-case documentation, ownership records, schemas, tests, source, and useful version-control history. Read the installed Righting `docs/policy-language.md` and `docs/capabilities.md`. State exactly what you inspected and what material evidence was unavailable.

Maintain two separate evidence views:

1. **Design evidence:** business purpose and outcomes; users and jobs; workflows; responsibilities and decisions; concept definitions and overloaded terms; independently applicable models; ownership and change authority; external systems; integration constraints; and observed axes of change.
2. **Repository realization evidence:** paths and packages; imports; schemas and stores; build or deployment units; ownership/history; tests; generated source; composition roots; and files that mix candidate concepts.

For material observations, cite project paths, distinguish direct evidence from inference, and say which proposal they support or weaken. Missing documentation is unknown evidence, not proof of a single context. A singular user role, maintainer role, operator role, or Git author does not establish that one person owns or operates the whole model; keep owner/change authority `unknown` unless a direct project record or maintainer answer establishes it.

Describe current terrain before proposing change: one coherent model, established contexts, candidate models intermingled, unknown, or a muddy legacy region. Distinguish current facts from desired design.

## 2. Make an educated recommendation

Recommend one coarse design and one conservative alternative, including remaining single-context where credible. Prefer the fewest boundaries that explain meaningful differences in purpose, model, language, responsibility, or ownership. Never split by technical layer.

For every proposed context in both the recommendation and the conservative alternative, present a compact card containing:

- name and one-sentence purpose;
- users/jobs and responsibilities;
- owned model and key language, especially terms with different meanings elsewhere;
- owner/change authority, or `unknown`;
- relationships and exchanged capability or information;
- design evidence and counterevidence with paths;
- confidence: `high`, `medium`, or `low`, with a reason; and
- current code fit: inside, outside, mixed, or uncertain, explicitly labeled as realization evidence.

For each relationship—including external systems—record these fields separately: **direction**, **influence** (who shapes whose rules, or `unknown`), **exchange in each direction** (write `none` when one-way), and **model treatment** (`share`, `translate`, or `isolate`). Do not collapse distinct external parties with different return flows into one relationship. Use a named DDD relationship only when the evidence fits. Do not call reused utilities a Shared Kernel, and do not create a `shared` scope merely because code is reused.

## 3. Shape and approve

Resolve uncertainties with the maintainer, one question per turn. Start with the uncertainty most capable of changing the proposed boundary. Offer concrete options and recommend one from the evidence. Revise the cards after each answer.

Do not reopen settled project facts without contradictory evidence. On a known-context replay, validate the documented semantic boundaries and their current realization; do not substitute folder inference or demand redundant approval of already explicit maintainer-owned decisions. If a material contradiction exists, ask whether to preserve, revise, or defer the affected decision.

Before writing domain documents, show the complete proposed strategic design and ask for explicit approval or a specific revision. If the authorized maintainer cannot resolve a semantic, ownership, or relationship question, coarsen the design or return `unresolved`; never answer for them.

## 4. Record only the approved design

After approval, follow the repository's own domain-document instructions and conventions. In their absence:

- keep one context as a root `CONTEXT.md` glossary;
- for multiple contexts, use a root `CONTEXT-MAP.md` that names each context, its purpose, owner, document location, relationships, permitted sharing/translation, confidence, and open questions; and
- use one `CONTEXT.md` per context for its implementation-free owned language and definitions.

Preserve useful existing content and vocabulary. Do not write implementation details into a `CONTEXT.md`. Do not overwrite an ADR conflict silently. When the outcome is `unresolved`, write no domain documents.

Give non-executed migration advice that identifies mixed or uncertain files, likely moves or splits, dependency seams, current cross-boundary coupling, translation or deliberately shared-model concerns, ownership/release/data risks, safe sequencing, and validation. Do not change application code.

## 5. Apply the independent firewall honesty gate

A sound context design does not imply that current code is ready for `contextFirewall`. Produce a candidate only when all gates pass:

1. the strategic context identities and relationships are explicitly approved or already explicit in authoritative project records;
2. current source paths map those identities with exact, non-overlapping globs;
3. every relevant current source file is classified as a named `context`, genuinely context-independent `shared`, intentional `unscoped` wiring/integration, ambiguous, or unmatched;
4. `shared` source does not import a context, and direct context-to-context static imports are intended to be forbidden now;
5. legitimate integration is represented without hiding incompatible imports; and
6. the exact candidate validates with the project's installed CLI.

`shared` means deliberately context-independent source, not “used more than once.” `unscoped` means intentional non-contextual wiring or integration, not uncertain domain code.

For a candidate, create a temporary mirror of the project tree, write only the temporary `righting.json`, and run `npx righting inspect --json` there. Keep the project's existing policy fields and add only the candidate fragment for validation. Report the temporary policy, command and status, authoritative inspection evidence, every current-file scope classification, every ambiguous or unmatched path, and any observed violation. Delete the mirror afterward. Do not edit the real `righting.json`.

If any gate fails, choose `omit-for-now`, list each failed gate and the evidence, and state the migration or decision that would justify reconsideration. If strategic approval is incomplete, choose `unresolved` instead.

## 6. Return the fixed result

Return one standalone Markdown result directly to the caller with exactly these headings:

```markdown
## Outcome
candidate | omit-for-now | unresolved

## Evidence
<inspected scope, design evidence, realization evidence, counterevidence, confidence>

## Approval
<what was explicitly approved, existing authoritative approval, or unresolved decision>

## Approved design
<contexts, purposes, owned language, responsibilities, ownership, relationships>

## Domain documents
<files written or changed; none when unresolved>

## Migration advice
<refactoring concerns, sequencing, risks, validation; no application-code changes>

## Context firewall
<exact fragment and focused temporary-mirror validation, file classifications, ambiguity, unmatched paths, and violations; or failed gates and reconsideration conditions>

## Capability limits
<what static import checks establish and do not establish>

## Next step
<caller-neutral continuation; optionally tell righting-integrate to resume from this result>
```

`candidate` means an approved design has a mechanically validated candidate fragment. `omit-for-now` means the design is approved but current code cannot support a credible fragment. `unresolved` means strategic approval is incomplete, so no domain document or candidate is presented as approved.

State the capability limit precisely: `contextFirewall` can establish configured static cross-context and shared-to-context source-import restrictions. It does not establish runtime behavior, data or deployment isolation, organizational ownership, migration completion, or the quality of the context design. A later policy-adoption workflow must revalidate and obtain approval for the complete `righting.json`.
