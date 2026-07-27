# Shape the specialist workflow and result contract

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Working context: unclaimed
Blocked by: 01

## Question

What minimal interactive workflow and result contract lets `righting-bounded-contexts` move from repository evidence through an educated, maintainer-approved context design to standard domain documents and a validated `contextFirewall` candidate or honest omission, while giving `righting-integrate` an unambiguous resumable handoff?

## Answer

Use a caller-neutral, evidence-led workflow:

1. Inspect project-owned domain records, decisions, workflows, ownership, history, and source, stating what was and was not inspected.
2. Keep design evidence—purpose, responsibilities, models, language, ownership, workflows, and change patterns—separate from repository-realization evidence such as files, folders, imports, schemas, and tests. Describe current terrain without treating topology as domain truth.
3. Recommend one coarse context design plus one conservative alternative, including remaining single-context. Each proposed context records purpose, owned model and language, responsibilities, ownership, relationships, evidence, counterevidence, confidence, and current-code fit.
4. Shape through one simple, option-based maintainer question at a time. Each question gives brief help, an example when useful, alternatives, and a recommendation. Require explicit approval of the complete strategic design.
5. After approval, record the design in the standard `CONTEXT.md` / `CONTEXT-MAP.md` structure and advise concrete migration or refactoring concerns—mixed files, moves or splits, dependency seams, sequencing, risks, and validation—without changing application code.
6. Evaluate firewall readiness independently. Classify every relevant current path as a named context, genuinely shared, intentionally unscoped, ambiguous, or unmatched; validate the exact candidate in a temporary mirror with the installed CLI; and return an honest omission whenever current code cannot realize the approved design.

Return one fixed-heading Markdown result directly to the caller; do not create a dedicated result artifact. The result is usable standalone and may also be consumed by `righting-integrate`:

- `Outcome`: exactly `candidate`, `omit-for-now`, or `unresolved`.
- `Evidence`: inspected scope, material evidence and counterevidence, and confidence.
- `Approval`: what was explicitly approved or the unresolved decision.
- `Approved design`: contexts, purposes, owned language, responsibilities, ownership, and relationships.
- `Domain documents`: files written or changed; none when unresolved.
- `Migration advice`: recommended refactoring, sequencing, risks, and validation; no application-code changes.
- `Context firewall`: the exact fragment and focused validation evidence—temporary policy, command result, every current-file classification, ambiguity, unmatched path, and observed violation—or the failed gates and reconsideration conditions.
- `Capability limits`: the static-import guarantees and what the result does not establish.
- `Next step`: a caller-neutral continuation action, optionally noting how to pass the result into Righting integration.

`candidate` means the design is approved and current code supports a mechanically validated candidate. `omit-for-now` means the design is approved but current code needs migration or refactoring before a credible firewall exists. `unresolved` means strategic approval is incomplete, so no domain document or candidate is presented as approved. A later policy-adoption workflow must revalidate and obtain approval for the complete `righting.json`; this specialist never edits it.
