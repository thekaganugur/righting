# Lightweight contextFirewall adoption guidance

Status: resolved
Labels: wayfinder:map

## Destination

Deliver a deliberately small, evidence-led `contextFirewall` evaluation in `righting-integrate`: it briefly investigates applicability, gives maintainers concise pros, cons, and a recommendation, never requires or infers bounded contexts, and refers deeper boundary design to an optional specialist rather than absorbing it.

## Notes

- Preserve Righting policy as maintainer-owned intent; repository structure is evidence, not inferred policy.
- `contextFirewall` remains an optional named variation. Its configured scopes remain explicit maintainer decisions.
- Keep `righting-integrate` focused on integration. Do not turn it into a bounded-context discovery or design interview.
- Questions must be simple, asked one at a time, and include a concise recommendation plus the material pros and cons.
- Consult `CONTEXT.md`, `design/2026-07-18-righting-v1.md`, `docs/policy-language.md`, `docs/capabilities.md`, `skills/righting-integrate/SKILL.md`, and `.scratch/righting-integrate-dogfood/PRD.md`.

### Rolling delivery

Current waypoint: None — destination reached.

Delivered:
- [Deliver the lightweight contextFirewall decision gate](issues/03-deliver-lightweight-context-firewall-decision-gate.md) — `righting-integrate` now separates firewall readiness from optional boundary-quality advice without absorbing context design.

## Decisions so far

<!-- Closed decision tickets only. -->

- [Research contextFirewall adoption signals](issues/01-research-context-firewall-adoption-signals.md) — Use maintainer-owned semantic and ownership evidence rather than repository topology to judge firewall readiness and specialist referral.
- [Set the integration and specialist seam](issues/02-set-integration-specialist-seam.md) — Report firewall policy readiness separately from an optional boundary-quality suggestion; integration never performs context discovery or design.

## Not yet specified

<!-- None. -->

## Out of scope

- Creating, naming, or specifying the optional bounded-context specialist skill; that belongs to a separate future effort.
- Requiring bounded contexts for Righting adoption.
- Inferring context policy or scope paths from repository folders, imports, or domain vocabulary.
- Turning `righting-integrate` into a general DDD or bounded-context design workflow.
- Changing `contextFirewall` core or adapter enforcement semantics unless investigation finds a concrete contradiction.
