# Compatible-agent handoff

Use this route when the coding agent supports project-skill discovery; `init --skills` creates `.agents/skills` for it to discover. Otherwise, use the [manual maintainer route](manual-maintainer.md). This route adds discoverability; it does not automate maintainer decisions.

## 1. Set up skill discovery

Requires Node.js 20 or later.

```sh
npm install --save-dev righting
npx righting init --skills --json
```

The command creates repeatable relative links under `.agents/skills` and refuses project-owned name collisions. The JSON response is the stable machine-facing contract: agents use its codes and next actions instead of parsing human output.

## 2. Configure and obtain approval

Have the agent use [`righting-integrate`](../skills/righting-integrate/SKILL.md). That skill renders the candidate policy and requests explicit maintainer approval before replacing the incomplete starter.

## 3. Review the approved policy

After the approved policy is in place, run:

```sh
npx righting inspect --json
```

It reports normalized configuration, effective role relationships, applicable [capabilities](capabilities.md), and unknown adapter status. It does not verify approval or active enforcement.

## 4. Optionally hand off adapter work

Only after separately approving adapter work, hand it to [`righting-eslint`](../skills/righting-eslint/SKILL.md). It preserves an existing supported ESLint flat-config loop; it does not install, migrate, or restructure lint tooling.

The policy reference remains the source for policy semantics, and the linked skills remain the source for their procedures. The short `AGENTS.md` block only points agents to `righting.json` before mapped-code changes.
