# Research change-history evidence for volatility classification

Type: research
Labels: wayfinder:research
Status: open

## Question

What objective change-history evidence could sharpen band-4 volatility judgment in `righting-design-review` — and what is the minimal viable evidence set an agent could compute cheaply during a review?

The book's deepest question is not "does this file obey the edges" but "does this component encapsulate a real volatility" (`02-decomposition.md`: axes of volatility, volatile versus variable; `03-structure.md`: volatility decreases top-down, almost-expendable Managers). Today the review skill treats that as pure opinion. Change history is an unused objective source: files that change together may share a volatility (or leak one across a boundary); a Manager that never changes may be pass-through-expendable; one whose every change is feared may be expensive.

Survey, as a linked markdown asset:

- techniques and existing tools for git co-change, churn, and edit-coupling analysis (including what the author's `improve-codebase-volatility` skill already does with them);
- how each technique maps onto the book's volatility concepts above;
- a recommended minimal evidence set (commands or queries an agent can run in seconds) plus its known failure modes (squash merges, young repos, generated files).

The output is a survey and recommendation only — whether design-review adopts any of it is a later grilling ticket.
