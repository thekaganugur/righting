# Manual maintainer route

Use this route when no compatible coding agent will consume the packaged skills. Righting records only the policy you approve; it does not choose coverage, conventions, roles, or adapter work for you.

## 1. Set up

Requires Node.js 20 or later.

```sh
npm install --save-dev righting
npx righting init
npx righting inspect
```

`init` writes the exact incomplete starter and a short managed pointer in `AGENTS.md`. `inspect` should report that the starter is incomplete and name coverage and maintainer approval as the next requirements. The starter produces no normalized contract.

## 2. Configure

Use the [policy language reference](policy-language.md) to choose broad source coverage, any local convention aliases, and only the composition-root tokens, variations, scopes, overrides, protected dependencies, and guidance references that apply. Its [minimal complete policy](policy-language.md#minimal-complete-policy) shows the smallest JSON shape; it does not recommend roles, names, or folders.

## 3. Approve and replace the starter

Render the exact replacement `righting.json`, review it, and record explicit maintainer approval in your issue, PR, or other integration record. Replace the starter only after approval; remove `"status": "incomplete"` rather than extending it.

## 4. Review the declared policy

```sh
npx righting inspect
```

Inspection reports normalized policy semantics and applicable [capability limits](capabilities.md). `inspect --json` also reports current covered-source classification counts plus unclassified or ambiguous paths outside the contract. These are **observed inconsistencies**, not policy exceptions or required source-migration work. Inspection does not check imports, dependency edges, adapter activation, lint results, approval provenance, or runtime behavior.

## 5. Separately choose whether to enforce imports

Available guardrail adapters:

- [ESLint](eslint.md) — recommended only when the project already has a supported ESLint flat config.

ESLint is optional, not universal. Separately choose and approve whether to invoke it after policy approval.

A verified adapter diagnostic is an **adapter finding**. Only maintainer-approved native suppression becomes **adapter-native legacy debt**; follow the separate [legacy-debt lifecycle](legacy-debt.md). Only a successful run of the project's normal lint command establishes active ESLint guardrails.

## If setup stops at managed guidance

Keep all project-owned `AGENTS.md` text. Repair only the Righting-managed section so it contains one `<!-- righting:managed:start -->` marker followed by one `<!-- righting:managed:end -->` marker, in that order, then rerun `init`.
