# Research: evidence-led bounded-context design method for Righting

## Summary

The smallest defensible method is a **maintainer-approved, evidence-led strategic design loop**, not boundary inference: inventory the current models and their contacts; separate semantic/organizational evidence from implementation topology; propose a small number of coarse alternatives with counterevidence; revise them through one explicit maintainer choice at a time; then record the approved contexts, relationships, and migration concerns. Only after that separate design approval may the skill attempt an exact source-path mapping; it must recommend omitting `contextFirewall` whenever current files cannot truthfully and unambiguously realize the approved model.

This follows Evans's direction to define where each model applies and to “map the existing terrain” before transformations, while preserving Righting's narrower capability: it can forbid configured static source imports, but cannot prove model quality, runtime isolation, ownership, or migration completion. [Evans, *DDD Reference*, pp. 2, 29](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)

## Findings

1. **High — context identity must be justified by models, language, purpose, and people, not directories.** Evans defines a bounded context as the boundary—often a subsystem or a team's work—within which a particular model is defined and applicable, and asks that it be explicit in team organization, application use, code, and schemas. This makes physical layout one manifestation to reconcile, not the source of the design. Distinct user communities/jobs and independently useful models are positive evidence; different folders, frameworks, layers, or import clusters alone are not. [Evans, pp. vi, 2](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) Microsoft likewise starts with business functions and stakeholder/domain-expert collaboration, explicitly deferring technology and grouping functions that share a model. [Microsoft, “Use domain analysis to model microservices”](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

2. **High — an existing repository supports educated proposals, not autonomous conclusions.** The repository supplies implementation evidence—domain terms in code/docs/tests, workflows, responsibilities, ownership records, data/API boundaries, dependencies, and change history—but maintainers/domain practitioners must resolve what those observations mean. Evans makes creative collaboration between domain and software practitioners fundamental, says language/model difficulties are resolved in conversation, and notes that useful sophisticated models emerge iteratively. [Evans, pp. 1, 3–4, 8](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) Microsoft says there is no mechanical process for correct boundaries and that evaluation is ongoing. [Microsoft, “Use domain analysis to model microservices”](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

3. **High — record both current terrain and approved direction.** Evans's Context Map requires identifying every model in play, including implicit models, naming bounded contexts, and describing contact points, translation, sharing, isolation, and influence; crucially, it says to map existing terrain and take up transformations later. Where models are mixed and boundaries inconsistent, Evans permits naming the whole area a Big Ball of Mud rather than fabricating internal precision. [Evans, pp. 29, 38](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) Therefore an aspirational approved map must not be presented as the repository's current structure; the delta belongs in a migration ledger.

4. **Medium — use the smallest relationship vocabulary that communicates actual coordination.** Every approved contact needs direction/influence, exchanged capability or information, and the intended sharing/translation/isolation mechanism. Apply named patterns only when evidence fits: Partnership for mutual delivery dependence; Customer/Supplier for negotiated upstream/downstream commitments; Shared Kernel only for a deliberately small jointly governed model/code subset; Conformist where downstream accepts an unresponsive upstream model; Anti-corruption Layer where downstream translation protects its model; Open-host Service/Published Language for a stable shared protocol; Separate Ways for no integration. [Evans, pp. 30–37](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) This is strategic relationship modeling, not a request to design APIs, aggregates, entities, events, or repositories.

5. **Medium — prefer coarse uncertainty and explicit migration cost over false precision.** Evans warns that endlessly smaller contexts lose useful integration/coherence and that shared kernels create intimate interdependence requiring consultation and continuous integration. [Evans, pp. 5, 31](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) Microsoft's first-party guidance recommends coarse boundaries when in doubt and validates against chatty interactions, coordinated changes/deployments, tight coupling, and data-consistency problems. [Microsoft, “Identify microservice boundaries”](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries) Fowler's experience report adds that stable boundaries are difficult to identify early and moving functionality across prematurely separated services is costly; this supports an explicit confidence rating and conservative alternative, not a universal “monolith first” rule. [Fowler, “Monolith First”](https://martinfowler.com/bliki/MonolithFirst.html)

6. **High — strategic approval and firewall readiness are separate decisions.** `docs/policy-language.md` says the optional firewall continuously checks only approved static import boundaries and that source folders/imports/vocabulary are evidence to investigate, not policy. It requires context, shared, and unscoped rules; overlapping matches are `righting/ambiguous-scope`. `docs/capabilities.md` says the firewall establishes only that configured cross-context and shared-to-context source imports are forbidden, and explicitly does not establish cross-context runtime behavior. Paths: `docs/policy-language.md`, `docs/capabilities.md`. Thus a sound approved context map can coexist with **firewall omission** while code remains intermingled or requires unexpressible integration.

7. **High — the current integration/research records already establish the conservative handoff.** `skills/righting-integrate/SKILL.md` now distinguishes policy readiness from optional design suggestion and forbids deriving policy from folders, paths, imports, or vocabulary alone. The earlier evaluation recommends omission when no independently meaningful approved model/language boundaries exist. The specialist should consume that evidence but conduct the strategic approval loop that integration intentionally omits. Paths: `skills/righting-integrate/SKILL.md`, `.scratch/context-firewall-adoption/research/bounded-context-evaluation.md`, `.scratch/righting-bounded-contexts/map.md`.

## Minimal method

### 1. Bound the inquiry and build two evidence ledgers

Read project-owned context maps/context documents, ADRs, product/use-case documentation, issue history, ownership records, schemas/contracts, tests, and relevant source. State what was and was not inspected.

Keep evidence in two explicitly separate ledgers:

- **Design evidence:** business purpose and outcomes; users/jobs; workflows and business functions; responsibilities/decisions; concept definitions and overloaded terms; differing models of the same real-world thing; domain-expert/maintainer language; ownership and change authority; external systems; known coordination and integration constraints; observed axes of change/stability. Evans explicitly recommends observing change/stability to find conceptual contours. [Evans, p. 27](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)
- **Repository realization evidence:** directories/packages, source files, imports, schemas/data stores, build/deploy units, CODEOWNERS/blame/history, tests, generated code, wiring/composition roots, and files that mix candidate concepts. These corroborate or contradict a design hypothesis but do not establish it.

For every observation, record its source, whether it is direct or inferred, and which hypothesis it supports or weakens. Absence of documentation is unknown evidence, not proof of one context.

### 2. Describe current terrain before proposing change

Produce a compact current-state sketch of model regions and contacts. It may say “one model,” “candidate models intermingled,” “unknown,” or “Big Ball of Mud”; do not force named contexts. Mark conflicting project statements and distinguish current facts from desired design. This implements Evans's existing-terrain-first rule. [Evans, pp. 29, 38](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf)

### 3. Form at most a few coarse proposal cards

Each candidate context card contains:

- proposed name and one-sentence purpose;
- users/jobs and responsibilities it serves;
- owned model and key language, especially meanings that differ elsewhere;
- expected owner/change authority (or `unknown`);
- contacts with other candidate/external contexts;
- evidence and counterevidence with repository paths;
- confidence (`high`, `medium`, or `low`) and why;
- code currently inside, outside, split, or uncertain—clearly labeled as realization evidence;
- one conservative alternative, including remaining single-context or retaining a muddy legacy region.

Prefer the smallest number of boundaries that explains meaningful model/language differences. Do not split by technical layer or create `shared` merely because utilities are reused. Do not enter tactical DDD.

### 4. Challenge and approve interactively

Present the recommendation plus material counterevidence and alternative. Ask **one short, option-based question at a time**, include “none/other/uncertain,” a recommendation, and brief help/example when useful. A minimal sequence is:

1. **Model distinction:** which option best reflects how maintainers/domain practitioners understand the differing purpose/model/language?
2. **Boundary card:** approve, revise, merge, split, or defer one proposed boundary.
3. **Relationship:** for each approved contact, choose/describe direction, exchanged capability, and sharing/translation/isolation; offer a named Evans pattern only when it fits.
4. **Current realization:** confirm which code areas realize it now versus require migration.
5. **Exact strategic approval:** approve the complete context cards/map, or return to a specific unresolved item.

Record the answer and revise the proposal after each response. Silence, acceptance of a suggestive folder name, or approval of a `righting.json` fragment is not design approval. If the relevant maintainer cannot resolve a semantic/ownership question, preserve it as unknown and stop or coarsen rather than deciding automatically.

### 5. Produce strategic outputs and a migration ledger

After explicit approval, write the repository-standard `CONTEXT.md` per context and root `CONTEXT-MAP.md` (or preserve a single root `CONTEXT.md` when one context remains). Record purpose, owned model/language, responsibility/ownership, relationships, permitted sharing/translation, confidence and open questions. Do not overwrite contradictory ADRs silently (`docs/agents/domain.md`).

Maintain a separate, non-executed migration ledger:

- current path/file → approved context or `mixed/uncertain/non-contextual`;
- moves, splits, or naming changes likely required;
- current cross-boundary imports/data coupling;
- boundary API, translation/ACL, or deliberately shared-kernel concern (without designing it);
- ownership/release/data-migration concern;
- safe sequencing/dependencies and validation needed;
- risks if the firewall were enabled before migration.

Evans's legacy guidance shows why translation is material work: an ACL has cost, must preserve semantics, and can erode when bypassed; information crossing model boundaries is not neutral. [Evans, “Getting Started with DDD When Surrounded by Legacy Systems,” pp. 5–8, 11–12](https://www.domainlanguage.com/wp-content/uploads/2016/04/GettingStartedWithDDDWhenSurroundedByLegacySystemsV1.pdf)

### 6. Apply a separate `contextFirewall` honesty gate

Only produce a candidate fragment when **all** are true:

1. the maintainer explicitly approved the strategic context identities and relationships;
2. current source paths—not only a target migration plan—map those identities with exact, non-overlapping globs;
3. each relevant current file is classified as named `context`, genuinely context-independent `shared`, intentional `unscoped` wiring/integration, or explicitly unmatched/ambiguous;
4. `shared` source does not require imports from a context, and direct cross-context static imports are actually intended to be forbidden now;
5. legitimate integration is represented outside forbidden source imports (for example through intentional wiring/protocol boundaries), or its incompatibility is reported rather than hidden;
6. the candidate is mechanically validated with the installed `righting inspect --json` in a temporary mirror, and exact matches, ambiguous/unmatched paths, and observed violations are reported.

`unscoped` is for intentional non-contextual wiring/integration, not a dumping ground for uncertain domain code. `shared` means deliberately context-independent source under the firewall's directionality, not “used in multiple places.” These interpretations follow the actual dependency semantics in `docs/policy-language.md`.

If any gate fails, output **`contextFirewall: omit for now`**, the failed conditions, and the migration/decision needed to reconsider. Do not edit `righting.json`. An approved strategic design is still a successful outcome.

## Stopping and omission rules

Stop strategic decomposition when:

- maintainers approve one coherent context and no second model boundary is justified;
- evidence supports only folders/technical layers/import communities, not distinct applicable models;
- the repository is too intermingled to describe more honestly than a coarse or muddy region;
- domain meaning, ownership, or contact direction remains disputed and no authorized participant can resolve it;
- further work would require tactical design or source refactoring.

Omit the firewall when:

- strategic boundaries are unapproved or low-confidence;
- approved target boundaries do not match current paths;
- files mix contexts or globs overlap;
- required legitimate source imports conflict with v1 firewall directionality;
- `shared` ownership/independence or `unscoped` intent is unclear;
- runtime/data/process isolation is the desired guarantee (outside Righting's static capability);
- mechanical inspection cannot validate the exact fragment.

## Failure modes and safeguards

- **Topology laundering:** turning directories/import clusters into “domain truth.” Safeguard: two ledgers and semantic approval.
- **Current-state capture:** blessing accidental legacy coupling as the desired map. Safeguard: separate current terrain, approved target, and migration delta.
- **Aspirational enforcement:** enabling scopes for where code should move. Safeguard: map current files only and omit until migration.
- **Forced decomposition:** inventing contexts because the schema has scopes. Safeguard: single/coarse/muddy outcomes are valid.
- **Shared dumping ground:** labeling reused or uncertain code `shared`. Safeguard: require deliberate context independence and acknowledge `shared` cannot import contexts.
- **Relationship cargo culting:** assigning pattern names without team influence/translation evidence. Safeguard: record plain direction/contact facts first.
- **Approval theater:** broad “looks good” acceptance after many unresolved questions. Safeguard: one decision at a time, then exact final strategic approval.
- **Static-analysis overclaim:** implying runtime, data, deployment, team, or model isolation. Safeguard: repeat `docs/capabilities.md` establishes/does-not-establish limits in the approval packet.
- **Tactical DDD creep:** designing aggregates/entities/events/APIs or refactoring code. Safeguard: stop at purpose, model/language, ownership, relationships, and migration concerns.

## Implications for the skill workflow and replay rubric

A replay should pass only when an independent evaluator can observe:

1. **Evidence discipline:** inspected scope is stated; every proposal cites project paths; design and topology evidence are separate; contradictions and absences remain visible.
2. **Proposal quality:** each card has purpose/model/language/ownership/contact, counterevidence, confidence, and a conservative alternative; single-context is a live option.
3. **Interaction quality:** one option-based question per turn, useful recommendation/help, revision after answers, and explicit final strategic approval—not inferred consent.
4. **Strategic completeness:** approved context document(s), a relationship map with direction/sharing/translation/isolation, and a current→target migration ledger; no tactical design or source edits.
5. **Firewall honesty:** independent readiness decision; exact current-file classifications; ambiguous/unmatched paths and incompatible integrations disclosed; exact temporary-mirror inspection retained when proposing.
6. **Valid restraint:** omission is scored as correct when any readiness gate fails; no invented scope, “shared” bucket, or unscoped escape hatch.
7. **Capability accuracy:** the result promises only configured static cross-context/shared import restrictions and explicitly disclaims runtime and design-quality guarantees.

The known-context replay should detect established contexts and test relationship/path mapping without reopening settled facts unnecessarily. A poor/absent-boundary replay should test whether the skill can make an evidence-backed proposal yet refuse autonomous approval. A single-context replay should pass when it recommends remaining single-context. Deterministic fixtures are warranted only for a concrete replay failure, consistent with `.scratch/righting-bounded-contexts/map.md`.

## Sources

- Kept: [Eric Evans, *Domain-Driven Design Reference*](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf) — owning primary reference for bounded contexts, context mapping, relationship patterns, conceptual contours, and Big Ball of Mud.
- Kept: [Eric Evans, “Getting Started with DDD When Surrounded by Legacy Systems”](https://www.domainlanguage.com/wp-content/uploads/2016/04/GettingStartedWithDDDWhenSurroundedByLegacySystemsV1.pdf) — owning primary source for incremental legacy boundaries, translation/ACL cost, leakage, and migration concerns.
- Kept: [Microsoft Azure Architecture Center, “Use domain analysis to model microservices”](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis) — first-party architecture guidance for stakeholder-led business-function analysis, model grouping, iteration, and context maps.
- Kept: [Microsoft Azure Architecture Center, “Identify microservice boundaries”](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries) — first-party boundary validation and coarse-grained uncertainty guidance; microservice-specific claims are not generalized into a requirement to deploy contexts separately.
- Kept: [Martin Fowler, “Monolith First”](https://martinfowler.com/bliki/MonolithFirst.html) — direct practitioner experience supporting migration-cost caution; treated as tentative experience, not primary DDD authority.
- Dropped: generic DDD glossaries and SEO summaries — redundant with Evans's owning reference.
- Dropped: tactical DDD guidance — aggregates/entities/services are outside the requested strategic method.
- Dropped: ArchUnit motivation — Righting's own capability catalog is the controlling source for its static-analysis claims.

## Gaps and residual risks

- No source provides a mechanical repository-to-context algorithm; authoritative guidance explicitly says the design is non-mechanical. The proposed ledgers/cards/approval sequence are a minimal Righting workflow synthesized from the cited principles, not an Evans-standardized procedure.
- Git history, ownership files, and import graphs can be incomplete or distorted by team reorganizations and legacy structure. They remain corroborating evidence only.
- The exact expressiveness of repeated named context globs and all CLI scope-validation edge cases was not rederived from implementation in this research; the delivered skill must test its exact candidate against the installed CLI rather than assume schema behavior.
- A maintainer may approve a strategically plausible but wrong model. Righting cannot eliminate that design risk; explicit counterevidence, conservative alternatives, and revisability mitigate it.
- Static firewall success cannot establish runtime calls, data ownership, deployment independence, organizational ownership, semantic translation, or context quality.
