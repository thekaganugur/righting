# Righting

Righting is a local, static architecture-policy tool. It validates the policy you declare; it never infers an architecture, approves decisions, activates an adapter, or proves runtime behavior.

> **Alpha:** APIs and policy formats may change before the first stable release.

## First run

Requires Node.js 20 or later. Install it in the project:

```sh
npm install --save-dev righting@alpha
```

### 1. Set up — choose one route

**Maintainer alone**

```sh
npx righting init
npx righting inspect
```

`inspect` confirms that the starter is intentionally incomplete and names the next decision. Continue with the [manual maintainer route](docs/manual-maintainer.md).

**Maintainer with a compatible agent**

Use this route when the agent supports project-skill discovery. `init --skills` creates links under `.agents/skills` and Claude Code's `.claude/skills`, and makes `CLAUDE.md` import the managed `AGENTS.md` guidance; otherwise use the manual route.

```sh
npx righting init --skills --json
```

The agent should consume the JSON codes and next actions, not human-oriented command output. Continue with the [agent-assisted handoff](docs/agent-assisted.md).

### 2. Configure and approve

Both routes require a maintainer to choose and explicitly approve broad source coverage plus any project aliases and optional decisions. Replace — never extend — the incomplete starter with that approved policy. The [policy language](docs/policy-language.md) defines the convention-led contract and its minimal complete shape.

### 3. Use the policy

```sh
npx righting inspect
```

This validates and explains the declared adapter-neutral contract. `inspect --json` also reports current covered-source classification counts and concrete classification violations outside the contract. It does **not** check imports, dependency edges, approval provenance, or adapter activation. Independent guardrail adapters consume the normalized JSON contract and prove their translation through black-box conformance; core consumers can read and normalize local policy through `righting/core`. To enforce imports, separately approve a compatible guardrail adapter such as the [additive ESLint integration](docs/eslint.md) or the [pinned Oxlint integration](docs/oxlint.md).

## References

- [Capability catalog](docs/capabilities.md) — static evidence and its limits, generated from the records used by `inspect`.
- [Guardrail adapter conformance](docs/adapter-conformance.md) — the adapter-neutral scenario families and support gate.
- [Oxlint adapter](docs/oxlint.md) — the centrally supported, exact-version native integration.
- [`righting-adapter-authoring`](skills/righting-adapter-authoring/SKILL.md) — the generic, conformance-led authoring path for compatible agents.
- [`righting-volatility-review`](skills/righting-volatility-review/SKILL.md) — review-only discovery and ranking of volatility-backed candidates, stopping before Interface design.
- [`righting-deep-modules`](skills/righting-deep-modules/SKILL.md) — the end-to-end workflow with a focused default and an explicitly escalated deep path, ending in an accepted, module-root-first Architecture Module design and an honestly complete or partial migration slice.
- [`righting-module-design`](skills/righting-module-design/SKILL.md) — the Module, Interface, Depth, and Seam vocabulary layer beneath that workflow.
- [Legacy ESLint debt](docs/legacy-debt.md) — approved native suppression, growth detection, and pruning.
- [Orders/Returns dogfood record](docs/dogfood.md) — a worked record, not onboarding guidance.
- [Third-party notices](THIRD_PARTY_NOTICES.md) — attribution and licenses for copied or adapted skill material.
