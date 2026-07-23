# Assess a code-shape evidence surface

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 01

## Question

Should righting report band-2 code-shape evidence — and if so, where?

Band-2 rules are mechanical but guideline-level: numbers and names against book thresholds, never lint errors. The candidates:

- **Cardinality**: Manager and Engine counts and their ratio. Book thresholds: avoid more than five Managers (eight = failed design), golden ratio of Engines to Managers, a handful of subsystems (`appendix-c-design-standard.md`); smallest-set sizes of 2–5 Managers, 2–3 Engines, 3–8 ResourceAccess/Resources, half-dozen Utilities (`04-composition.md`, "Smallest Set").
- **Naming**: noun-named Managers and ResourceAccess, gerunds only for Engines, atomic business verbs confined to operation names (`03-structure.md`, "What's in a Name").
- **Contract shape**: CRUD-shaped ResourceAccess contracts versus atomic business verbs; contract-size metrics (`appendix-b-contract-design.md`).

Apply the operating model from [Define Righting's AI-oriented operating model](01-define-rightings-ai-oriented-operating-model.md): `inspect --json` stays an orientation/router, repeatable facts belong on focused stable JSON surfaces, `righting.json` owns approved advisory declarations/status, and a focused agent skill interprets rather than scores the facts.

Decide which code-shape facts warrant a focused surface, the declaration shapes an agent consumes or proposes, and the boundary between `code-shape-review` and a deeper `contract-design` capability. Decide what becomes of the naming/cardinality/event probes already landed in transitional `righting-design-review`. Preserve the explicit non-goals: no enforcement of book guidelines, scoring, architecture verdict, or runtime claim. The v1 map deferred a health surface; this ticket may reopen or confirm that deferral — see `.scratch/righting-onboarding-release/map.md` Out of scope.

## Answer

Righting will not add a `code-shape` JSON command, aggregate evidence API, or architecture-health surface. Live inspection of code shape belongs to adapters and, when requested, coding agents. Righting owns the architectural decisions they apply. This deliberately narrows the operating-model preference for stable deterministic facts: current band-2 facts do not justify another package-owned inspection contract.

### Mechanical naming guardrail

Add one opinionated `volatility@1` adapter warning using the existing approved aliases and mappings; add no policy field or variation.

- Every mapped canonical role must be visible through its approved project alias.
- Visibility may come from either a role container or a filename suffix. Both forms may coexist in one project: for example, `engines/pricing.ts` and `checkout/pricing.engine.ts`.
- A file matching both forms is still one component candidate.
- The rule applies to all six canonical roles. This is a Righting consistency guardrail, not a claim that the book mandates suffixes for every role.
- When a project alias differs from the canonical role name, the approved alias supplies the naming vocabulary; canonical terminology is not an additional accepted alternative.
- The adapter emits a warning, not a book-guideline error or an architecture verdict.

Adapters own current diagnostics and any eventual enforcement behavior. Righting will not introduce a parallel guardrail lifecycle or run code-shape analysis during `init`.

### Agent-owned guidance

Keep these advisory checks in transitional `righting-design-review` until [Specify compositional change routing](09-specify-compositional-change-routing.md) performs the broader focused-skill split:

- semantic naming: noun-named Managers and ResourceAccess, gerunds only for Engines, and atomic business verbs confined to operations;
- raw role counts plus only the generally applicable Manager-count and Engine-to-Manager guidance.

Agents inspect the relevant code when a review calls for it. They do not receive package-owned live counts, threshold observations, scores, or compliance status. No cardinality status, configurable threshold, approved-deviation schema, or other `righting.json` addition is warranted until repeated use demonstrates sufficient value.

### Capability boundaries and migration

- Existing aliases and mappings are the only declarations consumed by the naming adapter; the retained agent checks propose no new declaration kind.
- CRUD-shaped ResourceAccess operations, contract operation vocabulary, and contract-size metrics belong to `contract-design`, not code shape.
- Event probes remain in transitional `righting-design-review` until `interaction-semantics` ships.
- Probes move one at a time only when their focused replacement ships, avoiding both review gaps and duplicate ownership.
- The previously deferred architecture-health surface remains out of scope.
