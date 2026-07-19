# Release-ready Righting onboarding

Status: resolved
Labels: wayfinder:map

## Destination

Produce an implementation-ready route to a release-ready, non-interactive Righting first-run experience for both a maintainer and a compatible coding agent. It must safely move an approved policy from incomplete to complete, expose a stable agent-facing JSON contract, and define automated plus manual release evidence.

## Notes

- Primary user: a maintainer who understands and approves architecture decisions, working with a compatible coding agent.
- V1 adds no setup command; `init` remains the setup entry point. A read-only inspection surface is assessed separately.
- `--json` is a stable public agent-integration contract, not incidental output.
- The map ends with an implementation handoff; it does not apply code changes or run release validation.
- Preserve Righting constraints: no architecture inference, no automatic lint migration, no interactive wizard, and no runtime-proof claims.
- `init` automatically maintains a minimal managed `AGENTS.md` pointer to `righting.json`. Omit facts compatible agents can already discover from project conventions, policy, or installed skills.
- Consult `.scratch/righting-v1/PRD.md`, `design/2026-07-18-righting-v1.md`, `skills/righting-integrate/SKILL.md`, and the domain vocabulary in the PRD.

## Decisions so far

<!-- Closed tickets only. -->

- [Clarify the incomplete-policy transition](issues/01-clarify-incomplete-policy-transition.md) — Keep approval in the human integration record; replace the exact incomplete starter with a valid policy that omits `status`.
- [Define the stable agent setup contract](issues/02-define-stable-agent-setup-contract.md) — Publish an additive `schemaVersion: 1` JSON envelope with inspectable policy condition, structured next actions, and machine-readable failures.
- [Design the human-and-agent setup handoff](issues/03-design-human-and-agent-setup-handoff.md) — Keep automatic project guidance to one policy pointer; use explicit discoverable skills or package onboarding for the separate agent and manual routes.
- [Assess a narrow setup command](issues/04-assess-a-narrow-setup-command.md) — Add no setup command: the remaining valuable command idea is a separately assessed read-only policy inspection surface.
- [Assess a read-only policy inspection command](issues/06-assess-a-read-only-policy-inspection-command.md) — Add `righting inspect` to render effective policy and structured capability limits without assessing adapter activation.
- [Define release onboarding evidence](issues/05-define-release-onboarding-evidence.md) — Gate release on packaged-CLI contract and route fixtures, the shared repair loop, and recorded maintainer-alone and maintainer-with-agent walkthroughs.
- [Specify package onboarding documentation](issues/07-specify-package-onboarding-documentation.md) — Publish a route-chooser README and focused references with one owner per concern, while keeping dogfood candid and project guidance minimal.

## Not yet specified


## Out of scope

- Implementing the onboarding changes, tests, or manual release walkthrough; this map stops at an approved handoff.
- Revising the journey after executing walkthroughs; this map defines the evidence records but does not perform release validation.
- A future health surface that assesses adapter integration or enforcement status, distinct from `righting inspect`.
- Architecture inference, automatic policy completion, lint-config migration, interactive setup, and runtime-behaviour verification.
