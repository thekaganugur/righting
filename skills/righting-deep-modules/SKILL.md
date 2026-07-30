---
name: righting-deep-modules
description: Design and validate a deep Interface and Seam for a selected volatility candidate, or run that discovery-to-design workflow end to end. Use when the user wants an accepted Module design, test strategy, or migration slice—not only a ranked architecture review.
compatibility: Requires the sibling righting-volatility-review, righting-module-design, and righting-domain-modeling skills packaged with this skill.
---

# Volatility-driven deep modules

Volatility determines what deserves a box. Deep-module design determines the box's Interface. Righting roles constrain dependencies inside and between boxes.

Default to one incremental candidate. Produce a coarse map only when the user explicitly requests it and mark accepted Modules, unaccepted candidates, and unassessed regions separately.

## Load the specialists

Before starting, read these sibling skill files completely:

- [`righting-volatility-review`](../righting-volatility-review/SKILL.md), including [`LANGUAGE.md`](../righting-volatility-review/LANGUAGE.md) and its linked method guidance;
- [`righting-module-design`](../righting-module-design/SKILL.md), including [`DEEPENING.md`](../righting-module-design/DEEPENING.md); and
- [`righting-domain-modeling`](../righting-domain-modeling/SKILL.md) only when terms or architectural decisions need to be changed.

[`DESIGN-IT-TWICE.md`](../righting-module-design/DESIGN-IT-TWICE.md) is the sole alternative-Interface workflow. Apply the Righting constraints from `LANGUAGE.md` when judging its alternatives.

## 1. Consume discovery

Consume the producer-owned `schema: volatility-candidate/v1` packet defined by `righting-volatility-review`. It supplies core use cases, volatility axes and evidence tier, affected files, current ripple, role hypothesis, open calls, leaked knowledge, ADR conflicts, and the smallest plausible correction—never a predesigned Interface.

If the user supplies an existing selected `volatility-candidate/v1` packet, verify that its evidence is still current and do not rerun discovery. Otherwise run `righting-volatility-review` through candidate selection and consume its handoff. Do not design an Interface or edit code during discovery.

For the default incremental run, use quick inline findings and keep the architecture overview focused on the core use cases and affected areas. Reserve the full HTML report and a whole-codebase candidate map for an explicitly requested broad review.

Consume only a packet whose `decision` is `selected`. A Speculative candidate cannot proceed as an accepted Module boundary.

## 2. Create the handoff

Before designing, inspect the selected files, callers, tests, and dependencies to gather constraints—not to propose an Interface. Resolve the candidate's role hypothesis, smallest correction, named volatility scenarios, current caller obligations, dependency categories, and observable behavior. Ask the user only for decisions that the repository cannot answer.

Enrich the selected packet in chat, or in a Markdown file when the user requests an artifact. Embed the producer packet rather than copying its fields:

```yaml
schema: volatility-module-candidate/v1
discovery: <complete volatility-candidate/v1 packet>
candidate:
  responsibility:
  exclusions: []
volatilityScenarios: []
currentShape:
  callers: []
  callees: []
interfaceNeeds:
  businessVerbs: []
  invariants: []
  ordering: []
  errors: []
  configuration: []
  performance: []
dependencies:
  - name:
    category: in-process | local-substitutable | remote-owned | true-external
    existingAdapters: []
    testStandIn:
constraints:
  relevantADRs: []
  behaviorToPreserve: []
decision: pending | needs-revision | accepted | rejected
```

Return to discovery if evidence, scope, or core use cases are missing. Keep the handoff pending until every field is resolved or marked as an explicit decision for the user. If a supplied packet contains Interface members, facets, Seam placement, dependency strategy, or test migration, treat them as unvalidated suggestions rather than discovery evidence.

When the design resolves a genuine domain term or architectural decision, invoke `righting-domain-modeling`; do not edit `CONTEXT.md` or create an ADR under a weaker local rule.

## Vocabulary bridge

Keep each specialist's native vocabulary within its phase:

- A volatility **component candidate** becomes a **Module candidate**, not yet a proven Module.
- Its **contract obligations** constrain the Module's complete **Interface**.
- Client, Manager, Engine, ResourceAccess, Resource, and Utility remain architectural roles, not top-level boxes.
- A contract facet is a coherent view within the Interface, not automatically another Module.
- A directory is neither a Module nor evidence of a Seam.

## 3. Design the Module candidate

Apply `righting-module-design` to the handoff and verify its dependency classifications against `DEEPENING.md`. Propose one Module with one complete Interface, its Seam, hidden implementation, dependency strategy, Interface-level test surface, and smallest behavior-preserving migration slice.

When alternatives are needed, use `DESIGN-IT-TWICE.md` and compare them by Interface stability under the named volatility, Depth, Leverage, Locality, composition, and Seam placement. Supply each brief with the candidate's Righting role, allowed callers and callees under closed architecture, core-use-case call chains, named volatility scenarios, and domain business verbs. Replace the generic alternative constraints with Righting factoring constraints: smallest coherent Interface, factoring sideways into independent facets for distinct caller families, and factoring up around the abstraction shared by the business verbs. For ResourceAccess candidates add an alternative constrained to atomic business verbs with no CRUD or transport leakage. Require each alternative to report facet and member counts plus any property-like or CRUD members, but treat those metrics from `LANGUAGE.md` as factoring signals, not quotas.

## 4. Validate and stop

Accept the Module candidate only when all are true:

1. Its evidence is Observed, or Projected with credible lifespan relevance and current friction.
2. Its Interface includes invariants, ordering, errors, configuration, and relevant performance semantics—not only type signatures.
3. Each named volatility scenario changes the implementation without changing the Interface.
4. Caller knowledge materially decreases.
5. The deletion test would redistribute real complexity to callers rather than remove a pass-through.
6. Every core use case composes through the Module without modifying it.
7. Each dependency meets its `DEEPENING.md` precondition: in-process needs no adapter, local-substitutable has a real stand-in, remote-owned has a port with production and in-memory adapters, and true-external has an injected port with a mock adapter. Righting role calls introduce no open call.
8. Tests can observe outcomes through the Interface.

When a design or test-strategy gate fails, mark the candidate `needs-revision` and return to the relevant phase. Reject it only when the evidence or scope does not justify that boundary, and state what would have to change before reconsideration.

Stop before moving folders, adding architecture-policy enforcement, or editing application code. Continue only after the user explicitly requests implementation and the candidate is accepted with a behavior-preserving migration slice.
