# Righting bounded-context specialist

Status: resolved
Labels: wayfinder:map

## Destination

Ship and validate a packaged `righting-bounded-contexts` skill that can design improved bounded contexts when current boundaries are absent or poor, obtain maintainer approval, record the approved model, identify migration concerns, and produce a validated candidate `contextFirewall` fragment—or recommend omission until a credible configuration exists.

## Notes

- This is a Righting-specific design specialist whose main downstream use is discovering what `contextFirewall` configuration can credibly look like.
- Assess both single- and multi-context repositories. Remaining single-context is a valid recommendation.
- Use domain language, responsibilities, workflows, ownership, dependencies, and change patterns as evidence. Repository topology is evidence, never policy.
- Make an educated recommendation with evidence, counterevidence, confidence, and an alternative; obtain maintainer approval one simple, option-based question at a time, with brief help, an example when useful, and a recommendation.
- Record approved domain boundaries using the repository's standard `CONTEXT.md` / `CONTEXT-MAP.md` structure.
- Stay at strategic bounded-context design: purpose, owned model and language, ownership, context relationships, permitted sharing, and code-to-boundary migration concerns. Do not perform tactical DDD or refactor project code.
- After boundary approval, produce a mechanically validated candidate `contextFirewall` fragment with context, shared, and unscoped patterns, current-file classifications, and every ambiguous or unmatched path. Do not edit `righting.json`.
- A valid outcome may omit `contextFirewall`; never invent a scope merely to satisfy the policy schema.
- `righting-integrate` should recommend the specialist with pros and cons, ask permission, invoke it after approval, and resume from its result.
- Validate through a tight project → run → result → independent evaluation → iterate loop. Start read-only with `../uets-to-task`, use `dogfood/orders-and-returns` as a known-context control, and add a synthetic fixture only when a discovered failure needs deterministic regression coverage.
- Consult `CONTEXT.md`, `docs/policy-language.md`, `docs/capabilities.md`, `skills/righting-integrate/SKILL.md`, the prior `.scratch/context-firewall-adoption/` record, and the `domain-modeling`, `grilling`, `codebase-design`, and `ponytail` skills.

### Rolling delivery

Current waypoint: none

Delivered:
- [Deliver and validate the first bounded-context specialist](issues/03-deliver-and-validate-first-specialist.md) — Published and independently validated the permission-gated bounded-context specialist, including an honest unresolved replay and a known-context firewall candidate control.

## Decisions so far

<!-- Closed decision tickets only. -->

- [Research an evidence-led bounded-context design method](issues/01-research-bounded-context-design-method.md) — Separate strategic design evidence from repository realization, approve coarse proposals interactively, and gate any firewall candidate on exact current-path honesty and CLI validation.
- [Shape the specialist workflow and result contract](issues/02-shape-specialist-workflow-and-result.md) — Use a caller-neutral approval workflow and return a fixed Markdown result as `candidate`, `omit-for-now`, or `unresolved`, with migration advice and focused firewall-validation evidence.

## Not yet specified

<!-- None. Replay defects were resolved in the delivered waypoint; no deterministic fixture was needed. -->

## Out of scope

- Full tactical DDD design of aggregates, entities, repositories, commands, or events.
- Refactoring adopter source code or completing the adopter's full Righting policy.
- Autonomous approval of inferred context boundaries or automatic `contextFirewall` adoption.
