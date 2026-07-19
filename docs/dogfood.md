# Righting v1 dogfood record

The dogfood project is `dogfood/orders-and-returns`, an independent TypeScript project with its own package, policy, lint config, native suppression, and CI script. Its public workflow is replayed by `test/dogfood.test.ts` through the installed `righting` CLI and its normal `npm run lint` and `npm run ci` scripts.

A package user starts with:

```sh
npm install -D righting
npx righting init
```

`init` creates a safe incomplete policy and a minimal policy pointer in `AGENTS.md`. It never guesses architecture: inspect the starter, choose approved local aliases and path mappings, replace the starter after approval, then run `npx righting inspect`. Start with only the code you want to guard; variations, scopes, and overrides can wait.

For agent-assisted policy decisions, add packaged skills explicitly:

```sh
npx righting init --skills
```

## Approved integration

The project has two contexts: `orders` and `returns`, plus `shared` and unscoped `application` paths. It enables only `contextFirewall` and has no role-edge overrides.

| Local alias | Canonical role |
| --- | --- |
| `Screen` | Client |
| `Workflow` | Manager |
| `Rules` | Engine |
| `Gateway` | ResourceAccess |
| `Api` | Resource |
| `Shared` | Utility |

The exact approved mappings and scopes are in `dogfood/orders-and-returns/righting.json`.

## Evidence

1. The project starts as a TypeScript project with a modern ESLint flat config and unchanged `lint` script.
2. `righting init --skills --json` runs with no input, creates the incomplete starter, creates relative symlinks to the packaged skills under `.agents/skills`, and preserves the project-owned `AGENTS.md` text.
3. The approved policy and the additive `eslintConfig()` entry are applied, then `righting inspect --json` reports its context firewall, static capability limits, and unknown adapter activation without changing project files.
4. The pre-existing `src/orders/workflow/legacy-order.ts` dependency is captured only as `righting/role-dependency` native debt. `righting baseline --base HEAD --migration-reason "Adopt the existing legacy order workflow dependency." --json` accepts it, and the suppression is committed with the adopted policy.
5. A normal `refund-order` feature initially imports the Returns workflow. The unchanged `npm run lint` reports `righting/cross-context-dependency`. The repair imports the shared `return-status` Utility instead, following the approved policy; its normal baseline is within policy.
6. The project's unchanged `npm run ci` runs `typecheck` and the normal lint loop successfully. No interactive or human architecture step is required after approval.

## Open refinement questions

- **Design review:** Dogfood the advisory checklist against a proposed Orders/Returns behavior change and record whether its one-at-a-time questions identify useful evidence without duplicating lint feedback.
- **Adapter performance:** Measure the ESLint adapter on a substantially larger TypeScript project before setting any performance expectation.
- **Composition-root scope:** The unscoped application entry point remains sufficient here; revisit a declared composition root only if real application wiring becomes an uncontrolled boundary.
- **Baseline identity:** The native baseline still compares counts per file and rule, so it cannot distinguish a same-count violation swap.
- **Future adapters:** Require each adapter to run the shared conformance cases before calling it supported.
