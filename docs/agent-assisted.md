# Compatible-agent handoff

This route adds discoverability for a compatible coding agent; it does not automate maintainer decisions.

1. Initialize optional skills:

   ```sh
   npx righting init --skills
   ```

   The command creates repeatable relative links under `.agents/skills` and refuses project-owned name collisions. `righting init --json` is the stable machine-facing contract; use its codes and next actions rather than parsing human output.

2. Have the agent use [`righting-integrate`](../skills/righting-integrate/SKILL.md). That skill renders the candidate policy and requests explicit maintainer approval before replacing the incomplete starter.

3. After the approved policy is in place, run `npx righting inspect --json` to read the normalized configuration, effective role relationships, applicable [capabilities](capabilities.md), and unknown adapter status.

4. Only after separately approving adapter work, hand it to [`righting-eslint`](../skills/righting-eslint/SKILL.md). It preserves an existing supported ESLint flat-config loop; it does not install, migrate, or restructure lint tooling.

The policy reference remains the source for policy semantics, and the linked skills remain the source for their procedures. The short `AGENTS.md` block only points agents to `righting.json` before mapped-code changes.
