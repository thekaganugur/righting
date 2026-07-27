# Deliver and validate the first bounded-context specialist

Type: task
Labels: wayfinder:task, rolling-delivery:waypoint
Status: resolved
Blocked by: 02

## Outcome

A packaged `righting-bounded-contexts` skill and permission-gated `righting-integrate` handoff can design and record credible bounded contexts, report migration concerns, and return either a validated candidate `contextFirewall` fragment or an evidence-backed omission.

## Evidence

- Package-focused tests establish that the new skill is published and `righting-integrate` names and permission-gates the handoff.
- A fresh-agent, read-only replay against `../uets-to-task` produces a complete result that an independent evaluator passes for boundary reasoning, evidence quality, educated recommendations, question clarity, maintainer-approval discipline, domain-document accuracy, and configuration validity.
- A fresh-agent replay against `dogfood/orders-and-returns` acts as a known-context control and does not replace approved semantic boundaries with folder inference.
- Every replay defect is fed back into the skill and rerun; a synthetic fixture is added only when a discovered failure needs deterministic regression coverage.
- The focused checks, full project test suite, and `git diff --check` pass.

## Delivery

Stage: delivered
Working context: unclaimed
Handoff: none

## Answer

Delivered [`righting-bounded-contexts`](../../../skills/righting-bounded-contexts/SKILL.md) as a packaged, caller-neutral strategic-design specialist and made [`righting-integrate`](../../../skills/righting-integrate/SKILL.md) recommend it with pros/cons, ask permission, invoke only after approval, and resume from its fixed result. The specialist preserves authoritative context records, requires explicit strategic approval, records approved domain language, gives migration advice without changing application code, and returns either a temporary-mirror-validated firewall candidate, an evidence-backed omission, or an unresolved result.

Validation:

- Package-focused publication and handoff tests passed.
- The final fresh, read-only [`../uets-to-task` replay](../replays/uets-to-task.md) passed its [independent evaluation](../replays/uets-to-task-evaluation.md) across all required categories.
- The fresh [`orders-and-returns` control](../replays/orders-and-returns.md) preserved the approved semantic split and passed its [independent evaluation](../replays/orders-and-returns-evaluation.md).
- The [replay validation log](../replays/validation-log.md) records fresh-session provenance, both defect-feedback loops, and why no synthetic fixture was warranted.
- `npm test`: 49 tests passed.
- Focused packed-package tests: 4 tests passed after the final handoff correction.
- `git diff --cached --check HEAD`: passed.
- Final two-axis code review: Standards PASS; Spec PASS.
