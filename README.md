# Righting

Righting is a local, static architecture-policy tool. It validates the policy you declare; it never infers an architecture, approves decisions, activates an adapter, or proves runtime behavior.

## First run

Requires Node.js 20 or later. Install it in the project:

```sh
npm install --save-dev righting
```

### 1. Set up — choose one route

**Maintainer alone**

```sh
npx righting init
npx righting inspect
```

`inspect` confirms that the starter is intentionally incomplete and names the next decision. Continue with the [manual maintainer route](docs/manual-maintainer.md).

**Maintainer with a compatible agent**

Use this route when the agent supports project-skill discovery. `init --skills` creates `.agents/skills` for it to discover; otherwise use the manual route.

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

This validates and explains the declared adapter-neutral contract. `inspect --json` also reports current covered-source classification counts and concrete classification violations outside the contract. It does **not** check imports, dependency edges, approval provenance, or adapter activation. Coding agents and independent consumers can use the same helpers through `righting/core`; to enforce imports, separately approve a compatible guardrail adapter such as the [additive ESLint integration](docs/eslint.md) or the [pinned Oxlint integration](docs/oxlint.md).

## References

- [Capability catalog](docs/capabilities.md) — static evidence and its limits, generated from the records used by `inspect`.
- [Guardrail adapter conformance](docs/adapter-conformance.md) — the adapter-neutral scenario families and support gate.
- [Oxlint adapter](docs/oxlint.md) — the centrally supported, exact-version native integration.
- [`righting-adapter-authoring`](skills/righting-adapter-authoring/SKILL.md) — the generic, conformance-led authoring path for compatible agents.
- [Legacy ESLint debt](docs/legacy-debt.md) — approved native suppression, growth detection, and pruning.
- [Orders/Returns dogfood record](docs/dogfood.md) — a worked record, not onboarding guidance.
