# Release-ready Righting onboarding

Status: open
Labels: wayfinder:map

## Destination

Produce an implementation-ready route to a release-ready, non-interactive Righting first-run experience for both a maintainer and a compatible coding agent. It must safely move an approved policy from incomplete to complete, expose a stable agent-facing JSON contract, and define automated plus manual release evidence.

## Notes

- Primary user: a maintainer who understands and approves architecture decisions, working with a compatible coding agent.
- The v1 `init` / `docs` workflow remains the baseline, but a narrowly justified non-interactive setup command is allowed if it reduces adoption friction.
- `--json` is a stable public agent-integration contract, not incidental output.
- The map ends with an implementation handoff; it does not apply code changes or run release validation.
- Preserve Righting constraints: no architecture inference, no automatic lint migration, no interactive wizard, and no runtime-proof claims.
- Consult `.scratch/righting-v1/PRD.md`, `design/2026-07-18-righting-v1.md`, `skills/righting-integrate/SKILL.md`, and the domain vocabulary in the PRD.

## Decisions so far

<!-- Closed tickets only. -->

## Not yet specified

- The final package README and dogfood narrative changes, once the setup workflow is decided.
- Whether a manual walkthrough should reveal further compatible-agent discovery constraints after the intended journey is concrete.

## Out of scope

- Implementing the onboarding changes, tests, or manual release walkthrough; this map stops at an approved handoff.
- Architecture inference, automatic policy completion, lint-config migration, interactive setup, and runtime-behaviour verification.
