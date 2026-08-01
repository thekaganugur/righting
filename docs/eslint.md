# ESLint adapter

Righting's ESLint adapter is optional and separate from the normalized contract. `righting inspect` validates contract semantics and reports adapter-neutral evidence; it does not establish that ESLint is configured, active, resolving imports, or producing diagnostics.

## Prerequisites

Before proposing a change, confirm:

- `righting.json` is an approved complete policy, not the incomplete starter;
- the project has ESLint 9 or later, `eslint-plugin-boundaries` 7.1, an existing `eslint.config.*` flat config, and an established lint command;
- `righting/eslint` resolves from that project; and
- the existing resolver resolves any non-relative local import aliases the project actually uses.

If the adapter dependency is missing and its installation is approved, add it explicitly:

```sh
npm install --save-dev eslint-plugin-boundaries@^7.1.0
```

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

On configuration load, the adapter invokes the adjacent packaged CLI as `righting inspect --json`, validates inspection schema 1 and normalized contract version 2, and obtains one contract snapshot for the lint run. It uses the package-owned `righting/contract` reference interpreter for source classification while ESLint and `eslint-plugin-boundaries` retain native traversal, resolution, diagnostics, and suppression behavior. Inspection or version failure stops configuration before linting.

Run the project's established lint command unchanged. Its native `righting/...` diagnostics are the adapter evidence; the [capability catalog](capabilities.md) states what those static diagnostics do and do not establish. Adapter debt status comes from ESLint's lint/prune output and `eslint-suppressions.json`, not from `righting inspect`.

## Adopt and maintain legacy debt

During initial adapter integration, report existing `righting/role-dependency` findings and obtain explicit maintainer approval before recording them as legacy debt. Then let ESLint write only those findings to its normal suppression file:

```sh
npm run lint -- --suppress-rule righting/role-dependency
```

Normal lint runs automatically apply `eslint-suppressions.json`. Existing counts stay suppressed while a new finding fails the unchanged lint command. After fixing suppressed findings, remove stale counts through ESLint itself:

```sh
npm run lint -- --prune-suppressions
```

Review and commit the native suppression file with the adapter change. Righting adds no baseline command, suppression format, Git comparison, or compatibility read. ESLint's count-based storage cannot distinguish a same-count finding swap within one file and rule, and suppressions apply only to rules configured as errors.
