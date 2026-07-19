# Manual maintainer route

Use this route when no compatible coding agent will consume the packaged skills. Righting records only the policy you approve; it does not choose roles, mappings, or adapter work for you.

## 1. Set up

```sh
npm install --save-dev righting
npx righting init
npx righting inspect
```

`init` writes the exact incomplete starter and a short managed pointer in `AGENTS.md`. `inspect` should report that the starter is incomplete and name aliases, mappings, and maintainer approval as the next requirements. The starter is intentionally not enforceable.

## 2. Configure

Use the [policy language reference](policy-language.md) to choose local aliases, mappings, and only the variations, scopes, overrides, and protected dependencies that apply. Its [minimal complete shape](policy-language.md#minimal-complete-shape) shows the JSON structure; it does not recommend roles, names, or folders.

## 3. Approve and replace the starter

Render the exact replacement `righting.json`, review it, and record explicit maintainer approval in your issue, PR, or other integration record. Replace the starter only after approval; remove `"status": "incomplete"` rather than extending it.

## 4. Review the declared policy

```sh
npx righting inspect
```

Inspection reports normalized policy semantics and applicable [capability limits](capabilities.md). It does not check adapter activation, lint results, approval provenance, or runtime behavior.

## 5. Optionally enforce imports

If ESLint enforcement is separately wanted and the project already has a supported flat config, follow the [additive ESLint route](eslint.md). Approve adapter changes and any [legacy-debt](legacy-debt.md) adoption separately from policy approval.

## If setup stops at managed guidance

Keep all project-owned `AGENTS.md` text. Repair only the Righting-managed section so it contains one `<!-- righting:managed:start -->` marker followed by one `<!-- righting:managed:end -->` marker, in that order, then rerun `init`.
