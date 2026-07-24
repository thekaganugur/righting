# Deliver the lightweight contextFirewall decision gate

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: resolved
Working context: unclaimed
Stage: delivered
Blocked by: 01, 02

## Outcome

`righting-integrate` performs only a compact applicability check for `contextFirewall`, presents a concise evidence-backed recommendation with material pros and cons, asks at most the simple maintainer decision needed for integration, and refers deeper context discovery or boundary design to an optional specialist.

## Evidence

- The integration skill explicitly keeps bounded contexts optional and prohibits inferred policy or scope paths.
- Its `contextFirewall` path distinguishes observed repository evidence from maintainer-owned boundary decisions.
- Maintainer-facing questions are one at a time, concise, and include recommendation, pros, and cons.
- The specialist handoff is optional and does not block ordinary Righting adoption.
- Documentation explains when the variation helps, what it costs, and what static enforcement cannot establish.
- Focused tests and the full project test suite pass.

## Answer

Delivered a compact `contextFirewall` section in [`righting-integrate`](../../../skills/righting-integrate/SKILL.md) that reports policy readiness separately from a boundary-quality design suggestion. It uses already gathered evidence, never derives context policy from repository topology or vocabulary alone, keeps the specialist optional, and requires concise recommendations with material pros and cons. The [policy reference](../../../docs/policy-language.md) now records the firewall's benefit, premature-boundary cost, optionality, and explicit-approval boundary.

Validation:

- Focused `contextFirewall` documentation contract test: passed.
- `npm test`: 41 tests passed.
- `git diff --check`: passed.
- Two-axis review: the initial findings about unconditional pros/cons and domain-vocabulary inference were corrected; no remaining blocker was found.
