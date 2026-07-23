# Assess use-case validation in design review

Type: grilling
Labels: wayfinder:grilling
Status: open
Blocked by: 01

## Question

What should the focused `use-case-validation` capability own, and in what form?

The book's claim (`04-composition.md`, "Architecture Validation"): a design is valid when you can produce an interaction among its components for each core use case — call chain or sequence diagram — without changing the components. Systems typically have two or three core use cases, rarely written down. This is band-5 (design process): it validates the decomposition itself, which no import check can do, and it is currently missing from every righting surface.

Apply the operating model from [Define Righting's AI-oriented operating model](01-define-rightings-ai-oriented-operating-model.md). Decide:

- the focused skill's trigger and whether it runs per material change, policy adoption, or explicit request;
- which approved declarations/status belong in `righting.json`, and which use-case lists or activity diagrams are semantic inputs referenced from it;
- how the skill walks a core use case as a call chain over mapped roles and behaves when inputs are absent or unresolved;
- how it keeps "the design composes for this use case" distinct from "this import is allowed";
- which patterns to adapt from `improve-codebase-volatility`'s composition validation.

Keep the focused skill one-question-at-a-time and evidence-before-judgment, with no mechanical proof, score, or architecture verdict.
