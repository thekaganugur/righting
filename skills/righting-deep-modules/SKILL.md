---
name: righting-deep-modules
description: Discover volatility-backed module candidates, design deep interfaces for a selected candidate, and validate composition before restructuring. Use when the user wants understandable architectural boxes whose boundaries follow observed or credible projected change.
compatibility: Requires the sibling righting-volatility-review, righting-module-design, and righting-domain-modeling skills packaged with this skill.
---

# Volatility-driven deep modules

Volatility determines what deserves a box. Deep-module design determines the box's Interface. Righting roles constrain dependencies inside and between boxes.

Default to one incremental candidate. Produce a coarse map only when the user explicitly requests it and mark accepted Modules, unaccepted candidates, and unassessed regions separately.

## Load the specialists

Before starting, read these sibling skill files completely:

- [`righting-volatility-review`](../righting-volatility-review/SKILL.md), including its linked language and method guidance;
- [`righting-module-design`](../righting-module-design/SKILL.md), including [`DEEPENING.md`](../righting-module-design/DEEPENING.md); and
- [`righting-domain-modeling`](../righting-domain-modeling/SKILL.md) only when terms or architectural decisions need to be changed.

Use [`DESIGN-IT-TWICE.md`](../righting-module-design/DESIGN-IT-TWICE.md) when the Interface or Seam is non-obvious. Do not also run the parallel workflow from [`CONTRACT-DESIGN.md`](../righting-volatility-review/CONTRACT-DESIGN.md); use its Righting role, composition, atomic-business-verb, and contract-metric constraints as judging inputs instead.

## 1. Discover and select

Run `righting-volatility-review` through candidate presentation. Establish core use cases, volatility axes and evidence tiers, affected files, current ripple, role hypothesis, open calls, and the smallest plausible correction. Do not design an Interface or edit code yet.

For the default incremental run, use quick inline findings and keep the architecture overview focused on the core use cases and affected areas. Reserve the full HTML report and a whole-codebase candidate map for an explicitly requested broad review.

Ask the user to select one candidate. A Speculative candidate may be recorded but cannot be the top recommendation or proceed as an accepted Module boundary.

## 2. Create the handoff

Before designing, inspect the selected files, callers, tests, and dependencies to gather constraints—not to propose an Interface. Resolve the candidate's role hypothesis, smallest correction, named volatility scenarios, current caller obligations, dependency categories, and observable behavior. Ask the user only for decisions that the repository cannot answer.

Record the selected candidate in chat, or in a Markdown file when the user requests an artifact:

```yaml
schema: volatility-module-candidate/v1
candidate:
  name:
  files: []
  responsibility:
  exclusions: []
  roleHypothesis:
  smallestCorrection:
volatility:
  axes: []
  scenarios: []
  tier: Observed | Projected | Speculative
  evidence: []
  currentRipple:
coreUseCases:
  - name:
    currentCallChain: []
currentShape:
  roles: []
  callers: []
  callees: []
  openCalls: []
  leakedKnowledge: []
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

Return to discovery if evidence, scope, or core use cases are missing. Keep the handoff pending until every field is resolved or marked as an explicit decision for the user.

## Vocabulary bridge

Keep each specialist's native vocabulary within its phase:

- A volatility **component candidate** becomes a **Module candidate**, not yet a proven Module.
- Its **contract obligations** constrain the Module's complete **Interface**.
- Client, Manager, Engine, ResourceAccess, Resource, and Utility remain architectural roles, not top-level boxes.
- A contract facet is a coherent view within the Interface, not automatically another Module.
- A directory is neither a Module nor evidence of a Seam.

## 3. Design the Module candidate

Apply `righting-module-design` to the handoff and verify its dependency classifications against `DEEPENING.md`. Propose one Module with one complete Interface, its Seam, hidden implementation, dependency strategy, Interface-level test surface, and smallest behavior-preserving migration slice.

When alternatives are needed, use `DESIGN-IT-TWICE.md` and compare them by Interface stability under the named volatility, Depth, Leverage, Locality, composition, and Seam placement.

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
