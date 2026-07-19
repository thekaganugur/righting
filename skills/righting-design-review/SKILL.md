---
name: righting-design-review
description: An advisory Righting policy-aware design review.
disable-model-invocation: true
compatibility: Requires a stated behavior or change goal and relevant files or diff; reads righting.json when present.
---

# Advisory Righting design review

Keep the review advisory and confine it to the stated behavior and supplied focus.

## 1. Establish the evidence

Read the root `AGENTS.md`; then read root `CONTEXT.md` or the relevant contexts from `CONTEXT-MAP.md`, plus relevant root or context-scoped `docs/adr/` records, when present. Read the stated behavior or change goal, focused diff or relevant files, `righting.json` when present, and configured `extras.domainVocabulary` and every configured `extras.goldenExamples` reference when present. Treat their local terms and examples as evidence for the stated behavior.

Use terms defined in the applicable context documentation in questions and the review record. Identify the mapped aliases, canonical roles, allowed edges, configured variations, overrides, and context scopes that apply. Record an explicit absence for a missing policy, focus, or configured reference before asking a question; surface any contradiction with a relevant ADR.

Completion: the record contains a concrete behavior, relevant code evidence, applicable policy and ADR evidence, and evidence or an explicit absence for every applicable source above.

## 2. Ask focused questions

Walk the following original Righting-inspired checklist in the order that the available evidence makes useful. Ask one question at a time and wait for the answer before continuing. When evidence already answers a checklist item, record that evidence and continue to the next item.

1. What observable behavior must this change deliver, and where does it enter the system?
2. Which local aliases should own delivery, coordination, rules, external access, external integration, and stable support for that behavior?
3. Does each proposed dependency follow an allowed policy edge, or can the behavior fit through an existing boundary by clarifying or extracting a responsibility?
4. If a Manager coordinates another Manager, what interaction boundary makes the coordination deliberate rather than a direct source dependency?
5. When contexts apply, which context owns the behavior, and does any dependency cross into another context or from shared code into contextual code?
6. Which contracts or inputs make the responsibility understandable without exposing another role's details?
7. What evidence would distinguish an intentional policy-wide variation from a local exception?

Evaluate default-policy fit first, then clarification or extraction, then a tightening. Only when those options cannot express a justified design, suggest a named variation or reason-required global override.

Completion: for every applicable checklist item, record an answer, supporting evidence, or an explicit open question; record the evidence that answers every skipped item.

## 3. Report the review record

Use these headings:

- **Evidence** — policy, code, vocabulary, and golden-example facts observed.
- **Risks** — boundary, responsibility, or context concerns tied to the evidence.
- **Open questions** — unanswered design decisions, including evidence gaps.
- **Adapter limitations** — what static enforcement can lint-enforce, what is only partially checked (including queued Manager interactions), and what requires design judgment.
- **Conservative policy considerations** — only justified policy-wide variations or overrides, with the design alternative considered first.

Return the five advisory sections in chat as a descriptive record rather than a score or pass/fail verdict. This review leaves policy, CI, and project files as it found them; create a Markdown artifact only on explicit request.

Completion: the chat record includes each of the five headings, separates evidence from judgment, remains advisory, and names static-analysis limits.
