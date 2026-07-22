# Assess use-case validation in design review

Type: grilling
Labels: wayfinder:grilling
Status: open

## Question

Should the book's only sanctioned design-validation method — architecture validation — belong in `righting-design-review`, and in what form?

The book's claim (`04-composition.md`, "Architecture Validation"): a design is valid when you can produce an interaction among its components for each core use case — call chain or sequence diagram — without changing the components. Systems typically have two or three core use cases, rarely written down. This is band-5 (design process): it validates the decomposition itself, which no import check can do, and it is currently missing from every righting surface.

Decide:

- whether design-review should ask for the project's core use cases and walk one as a call chain over the mapped roles (per change, per policy adoption, or on request);
- what a project must supply (use-case lists, activity diagrams — the book requires activity diagrams for use cases with nested conditions) and what the skill does when they are absent;
- how the walkthrough stays advisory and separates "the design supports this use case" from "this import is allowed";
- or whether validation belongs elsewhere — `righting-integrate`'s adoption flow, a separate skill — or nowhere.

Keep the review's existing shape: one question at a time, evidence before judgment, no scores or verdicts.
