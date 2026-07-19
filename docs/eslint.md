# ESLint adapter

Righting's ESLint adapter is optional and separate from policy approval. It supports an existing modern ESLint flat config; it does not install ESLint, migrate legacy `.eslintrc*` files, rewrite a lint script, or choose policy decisions.

## Prerequisites

Before proposing a change, confirm:

- `righting.json` is an approved complete policy, not the incomplete starter;
- the project has an existing `eslint.config.*` flat config and established lint command;
- `righting/eslint` resolves from that project; and
- the existing resolver resolves the policy's local import aliases.

Preserve all existing config entries, parser settings, resolver settings, and typed-lint configuration. Typed lint is neither required nor added by Righting. If a required resolver is absent or the config is not safely additive, report the prerequisite rather than changing lint tooling.

## Add the smallest approved patch

For an array-style flat config, add only the import and one config entry:

```js
import { eslintConfig } from "righting/eslint";

export default [
  // existing entries remain unchanged
  eslintConfig(),
];
```

If already-approved TypeScript path aliases need resolver configuration, reuse the project's existing resolver and retain its settings. Do not restructure the configuration or lint script.

## Verify and manage legacy debt

Run the project's established lint command unchanged before and after the approved patch. `righting inspect` describes policy semantics and capability limits, but does not establish that this adapter is active.

When a maintainer separately approves existing Righting findings as legacy debt, use ESLint's native namespaced suppression flow and then the core baseline ratchet. See [legacy debt](legacy-debt.md). The [capability catalog](capabilities.md) states the static evidence and limits for the adapter diagnostics.
