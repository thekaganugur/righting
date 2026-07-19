# Design the human-and-agent setup handoff

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 01

## Question

What should incomplete-policy guidance say and link to so a maintainer and a compatible coding agent can continue safely?

Decide the smallest clear sequence for policy approval, opt-in skill discovery (`init --skills`), `righting-integrate`, `righting-eslint`, regenerated guidance, adapter prerequisites, and static-analysis limits. Preserve the distinction between incomplete/no enforcement and a complete policy, and retain the PRD-required limitation classifications without duplicating divergent prose.

## Answer

Righting uses separate, minimal sources of truth rather than generating policy prose into a consuming project.

`righting init` always creates or refreshes the exact incomplete starter and a managed `AGENTS.md` block containing only:

```markdown
This project has a Righting architecture policy in `righting.json`.
Read it before changing mapped code.
```

The block is automatic because it is solely a discoverability bridge. It does not name skills, commands, aliases, mappings, boundaries, variations, coverage classifications, or limitations: compatible agents can discover those from project conventions, `righting.json`, and installed skills. The normal human-readable `init` output and package onboarding mention once that `righting init --skills` installs compatible-agent skills; `init` remains non-interactive.

There are two deliberate routes after initialization:

1. **Agent-assisted:** a maintainer explicitly runs `righting init --skills` before engaging a compatible agent. The discovered `righting-integrate` skill gathers policy decisions, renders the exact candidate, and obtains maintainer approval before replacing the starter. Its completion report says that, when ESLint enforcement is wanted, `righting-eslint` is next. That skill then inspects the existing flat config and lint command, reports support and prerequisites, proposes only the smallest additive patch, and obtains separate approval before changing lint configuration or handling approved legacy debt.
2. **Manual maintainer:** published package onboarding and reference documentation describe the same policy-decision and approval process plus the equivalent additive ESLint integration. It is a first-class route; a maintainer is never required to install or read agent skills. After replacement, `righting inspect` shows the completed policy’s effective meaning and applicable capability limits.

A valid policy is structurally usable but does not imply maintainer approval was witnessed, ESLint is desired or configured, a baseline exists, or runtime architecture is proven. Incomplete means no enforcement is enabled.

`righting docs` is removed from v1. Its former job—rendering detailed policy prose into `AGENTS.md`—would duplicate discoverable policy and skill information. Project guidance needs no regeneration beyond `init` maintaining the minimal pointer.

The `lint-enforced`, `partially checked`, and `guidance only` classifications remain Righting-owned capability data, not project configuration or managed guidance. Each classification records the observable evidence and any unproven part of the architectural claim (for example, direct Manager-to-Manager source imports can be rejected while queued interaction semantics cannot be proven). Package documentation and skills render or reference this one source; `righting inspect` exposes the configured policy alongside its applicable capabilities.
