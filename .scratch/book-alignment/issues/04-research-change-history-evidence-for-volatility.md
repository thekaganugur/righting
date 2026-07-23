# Research change-history evidence for volatility classification

Type: research
Labels: wayfinder:research
Status: resolved

## Question

What objective change-history evidence could sharpen the focused `volatility-classification` capability — and what is the minimal viable evidence set deterministic tooling could compute cheaply for an agent?

The book's deepest question is not "does this file obey the edges" but "does this component encapsulate a real volatility" (`02-decomposition.md`: axes of volatility, volatile versus variable; `03-structure.md`: volatility decreases top-down, almost-expendable Managers). Today the review skill treats that as pure opinion. Change history is an unused objective source: files that change together may share a volatility (or leak one across a boundary); a Manager that never changes may be pass-through-expendable; one whose every change is feared may be expensive.

Survey, as a linked markdown asset:

- techniques and existing tools for git co-change, churn, and edit-coupling analysis (including what the author's `improve-codebase-volatility` skill already does with them);
- how each technique maps onto the book's volatility concepts above;
- a recommended minimal evidence set (commands or queries an agent can run in seconds) plus its known failure modes (squash merges, young repos, generated files).

Apply the operating model from [Define Righting's AI-oriented operating model](01-define-rightings-ai-oriented-operating-model.md): tooling may establish history facts but never volatility; an agent applies the axes and evidence tiers; the maintainer approves classifications in `righting.json`. The output is a survey and recommendation only — [Decide the volatility-classification capability](08-decide-the-volatility-classification-capability.md) decides the product and skill surface.

## Answer

[Change-history evidence for volatility classification](../change-history-evidence-for-volatility.md) surveys Git, Code Maat, CodeScene, Hercules, PyDriller, and the existing `improve-codebase-volatility` skill against primary sources.

The recommended minimal evidence is a bounded, Git-only deterministic fact extractor that reports:

- per-path revision frequency and added/deleted line counts;
- same-commit path pairs with raw shared-revision support and both directional denominators;
- cross-declaration joins using current approved `righting.json` mappings; and
- visible coverage and quality metadata: ref/range, shallow-history state, merge and rename policy, exclusions, broad commits, low support, binary paths, and truncation.

No universal volatility threshold is justified. Broad commits may be omitted from pair formation as an explicit cost/noise guardrail while remaining in churn facts; low-support evidence is flagged rather than suppressed. History establishes edit patterns only. An agent must inspect representative changes, apply the axes of volatility, separate volatility from variability and historical accidents, and assign Observed/Projected/Speculative evidence. Only a maintainer can approve a classification in `righting.json`.

Blame, ticket/time-window coupling, semantic-unit mining, ownership, visualizations, quality/risk scoring, and automatic inference are deferred or rejected from the minimal set. The proposed seconds-scale budget still needs representative benchmarks during implementation.
