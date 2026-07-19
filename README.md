# Righting

Righting is a local, static architecture-policy tool. It validates the policy you declare; it never infers an architecture, approves decisions, activates an adapter, or proves runtime behavior.

## First run

Install it in the project:

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

Both routes require a maintainer to choose and explicitly approve aliases, mappings, and any applicable optional decisions. Replace — never extend — the incomplete starter with that approved policy. The [policy language](docs/policy-language.md) defines the decisions and shows the minimal complete shape.

### 3. Use the policy

```sh
npx righting inspect
```

This validates and explains declared policy only. It does **not** check source imports, approval provenance, or adapter activation. To check imports, separately approve the [additive ESLint integration](docs/eslint.md) and run the project’s lint command.

## References

- [Capability catalog](docs/capabilities.md) — static evidence and its limits, generated from the records used by `inspect`.
- [Legacy debt](docs/legacy-debt.md) — approved native suppression and baseline flow.
- [Orders/Returns dogfood record](docs/dogfood.md) — a worked record, not onboarding guidance.
