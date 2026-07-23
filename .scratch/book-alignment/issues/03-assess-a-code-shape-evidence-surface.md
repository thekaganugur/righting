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

Candidate homes: extend `righting inspect` with aggregate counts (the dogfood replays already observed that `inspect` reports no glob expansions or aggregates), keep it to `righting-design-review` probes (naming/cardinality/event probes already landed there — decide what, if anything, remains), a separate read-only report, or nothing.

Decide the surface, which evidence belongs on it, whether it warrants a stable JSON contract, and its explicit non-goals (no enforcement, no scoring, no runtime claims). The v1 map deferred a health surface; this ticket may reopen or confirm that deferral — see `.scratch/righting-onboarding-release/map.md` Out of scope.
