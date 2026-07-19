# Righting

Righting is a local, static architecture-policy tool. It validates declared dependency boundaries; it does not infer an architecture, approve decisions, activate an adapter, or prove runtime behavior.

## Choose a route

Install it in the project:

```sh
npm install --save-dev righting
```

### Maintainer alone

Run `npx righting init`, inspect the incomplete starter, make and approve the policy decisions outside Righting, replace the starter, then run `npx righting inspect`. Follow the [manual maintainer route](docs/manual-maintainer.md).

### Maintainer with a compatible agent

Run `npx righting init --skills` to expose the optional packaged skills, then follow the [agent-assisted handoff](docs/agent-assisted.md). The maintainer still approves the exact policy and any adapter changes.

## References

- [Policy language](docs/policy-language.md) — policy syntax and validation semantics.
- [Capability catalog](docs/capabilities.md) — static evidence and its limits, generated from the records used by `inspect`.
- [ESLint adapter](docs/eslint.md) — the additive flat-config protocol.
- [Legacy debt](docs/legacy-debt.md) — approved native suppression and baseline flow.
- [Orders/Returns dogfood record](docs/dogfood.md) — a worked record, not an onboarding guide.
