# Decide the volatility-classification capability

Type: grilling
Labels: wayfinder:grilling
Status: open
Blocked by: 04

## Question

Using the findings from [Research change-history evidence for volatility classification](04-research-change-history-evidence-for-volatility.md), define the focused band-4 `volatility-classification` capability.

Apply the operating model in [Define Righting's AI-oriented operating model](01-define-rightings-ai-oriented-operating-model.md). Decide:

- the minimal deterministic history facts, if any, that Righting should expose;
- how the skill combines those facts with the axes of volatility and Observed/Projected/Speculative evidence tiers;
- how it distinguishes volatility, variability, historical accidents, and changes to the nature of the business;
- how approved classifications, unresolved questions, and non-applicability are declared in `righting.json`;
- which patterns to adapt from the external `improve-codebase-volatility` skill without coupling the package to it; and
- the focused capability's proof limits and material escalation triggers.

End with an implementation-ready product, manifest, and skill contract. Tooling must not infer volatility; the maintainer approves classifications.
