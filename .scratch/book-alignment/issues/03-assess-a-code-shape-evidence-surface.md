# Assess a code-shape evidence surface

Type: grilling
Labels: wayfinder:grilling
Status: open
Blocked by: 01

## Question

Should righting report band-2 code-shape evidence — and if so, where?

Band-2 rules are mechanical but guideline-level: numbers and names against book thresholds, never lint errors. The candidates:

- **Cardinality**: Manager and Engine counts and their ratio. Book thresholds: avoid more than five Managers (eight = failed design), golden ratio of Engines to Managers, a handful of subsystems (`appendix-c-design-standard.md`); smallest-set sizes of 2–5 Managers, 2–3 Engines, 3–8 ResourceAccess/Resources, half-dozen Utilities (`04-composition.md`, "Smallest Set").
- **Naming**: noun-named Managers and ResourceAccess, gerunds only for Engines, atomic business verbs confined to operation names (`03-structure.md`, "What's in a Name").
- **Contract shape**: CRUD-shaped ResourceAccess contracts versus atomic business verbs; contract-size metrics (`appendix-b-contract-design.md`).

Apply the operating model from [Define Righting's AI-oriented operating model](01-define-rightings-ai-oriented-operating-model.md): `inspect --json` stays an orientation/router, repeatable facts belong on focused stable JSON surfaces, `righting.json` owns approved advisory declarations/status, and a focused agent skill interprets rather than scores the facts.

Decide which code-shape facts warrant a focused surface, the declaration shapes an agent consumes or proposes, and the boundary between `code-shape-review` and a deeper `contract-design` capability. Decide what becomes of the naming/cardinality/event probes already landed in transitional `righting-design-review`. Preserve the explicit non-goals: no enforcement of book guidelines, scoring, architecture verdict, or runtime claim. The v1 map deferred a health surface; this ticket may reopen or confirm that deferral — see `.scratch/righting-onboarding-release/map.md` Out of scope.
