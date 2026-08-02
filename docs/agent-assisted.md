# Compatible-agent handoff

Use this route when the coding agent supports project-skill discovery; `init --skills` creates links under `.agents/skills` and Claude Code's `.claude/skills`. Otherwise, use the [manual maintainer route](manual-maintainer.md). This route adds discoverability; it does not automate maintainer decisions.

## 1. Set up skill discovery

Requires Node.js 20 or later.

```sh
npm install --save-dev righting
npx righting init --skills --json
```

The command creates repeatable relative links under `.agents/skills` and `.claude/skills` and refuses project-owned name collisions. For Claude Code, it also creates `CLAUDE.md` with `@AGENTS.md`, or appends that import while preserving existing content; existing `CLAUDE.md` symlinks are left untouched. The JSON response is the stable machine-facing contract: agents use its codes and next actions instead of parsing human output.

## 2. Configure and obtain approval

Have the agent use [`righting-integrate`](../skills/righting-integrate/SKILL.md). That skill renders the candidate policy and requests explicit maintainer approval before replacing the incomplete starter.

## 3. Review the approved policy

After the approved policy is in place, run:

```sh
npx righting inspect --json
```

It reports the normalized contract once under `contract`, including configured provenance, effective role relationships, applicable [capabilities](capabilities.md), and evidence limits. Outside the contract, current `evidence` mechanically summarizes covered-source classifications and lists unclassified or ambiguous paths as **observed inconsistencies**, not policy exceptions or migration work. Adapter status remains separate and unknown; inspection does not verify approval, imports, dependency edges, or active enforcement.

## 4. Choose whether to hand off adapter work

After policy approval, `righting-integrate` lists available guardrail adapters and recommends a compatible fit. V1 provides an optional [ESLint workflow](../skills/righting-integrate/ESLINT.md) for an existing supported ESLint flat-config loop and the [pinned Oxlint adapter](oxlint.md) for its exact documented tuple and resolver limits. Neither is universal. The maintainer explicitly chooses and separately approves whether to invoke one; `righting-integrate` loads the ESLint workflow only after ESLint is selected.

The handoff gives the chosen adapter the unchanged normalized contract. Verified diagnostics become **adapter findings**; only separately approved native suppressions become **adapter-native legacy debt**. Only the project's successful normal lint command establishes active guardrails.

The policy reference remains the source for policy semantics, and the linked skills remain the source for their procedures. The short `AGENTS.md` block directs agents to inspect the normalized contract before covered-code changes and keeps adapter activation explicitly unverified.
