---
name: righting-eslint
description: Preserve an existing ESLint flat-config loop when adding and verifying the Righting adapter, including resolver and typed-lint behavior.
compatibility: Requires an existing ESLint flat config, a resolvable righting/eslint package, and the project's established lint command.
---

# Preserve the lint loop

Righting adds one ESLint config entry to an established flat-config loop. Preserve the loop and make its existing behavior observable before and after the addition. Use `righting inspect --json` capability records for static evidence and limits; do not duplicate policy guidance in project instructions.

## 1. Inspect the established setup

Read `package.json`, the existing lint script, `righting.json`, and the flat config: `eslint.config.js`, `eslint.config.mjs`, `eslint.config.cjs`, `eslint.config.ts`, `eslint.config.mts`, or `eslint.config.cts`. Confirm that `righting.json` is an approved complete policy rather than the `status: "incomplete"` starter, and capture existing config entries, parser and resolver settings, project import aliases, and whether typed lint is configured through `parserOptions.project` or `parserOptions.projectService`.

When no complete approved policy exists, report the prerequisite and hand policy decisions to `righting-integrate`; defer adapter configuration. Otherwise, confirm that `righting/eslint` resolves from the config's project and that the configured resolver resolves the mapped local imports. Reuse an existing resolver. For approved TypeScript path aliases, use an already-declared `eslint-import-resolver-typescript` through `settings["import/resolver"].typescript` with `alwaysTryTypes: true` and the project's actual `tsconfig` path; this resolver setting is independent of typed lint. Report a legacy `.eslintrc*`, absent flat config, missing lint script, missing ESLint, unresolved Righting package, or missing resolver as unsupported or as a prerequisite; leave lint tooling unchanged.

Run the unchanged lint command and record its outcome before proposing a patch.

Completion: the exact flat-config path, approved complete-policy state, unchanged lint command, pre-integration lint outcome, typed-lint presence, and adapter prerequisites are known.

## 2. Propose the smallest adapter patch

For a supported array-style flat config, propose only the import and a top-level `eslintConfig()` entry:

```js
import { eslintConfig } from "righting/eslint";

export default [
  // existing entries stay unchanged
  eslintConfig(),
];
```

When resolution needs configuration, include only the approved additive resolver entry alongside `eslintConfig()`; retain every existing resolver setting, config entry, plugin, ignore, parser, and typed-lint setting. If the project lacks the resolver needed for its aliases, report the exact prerequisite and request approval before adding it. If the config shape prevents a safe additive patch, report the required manual change instead of restructuring the config. Request approval for the exact patch before editing it.

Completion: an approved patch adds only approved adapter entries and leaves the existing lint command untouched.

## 3. Apply and verify

Apply the approved additive patch. Run the project's established lint command exactly as configured, using its existing package-manager invocation. Do not edit the lint script or add type-aware analysis for Righting.

Report:

- the flat-config path and that existing settings were preserved;
- the resolver used and whether mapped local imports resolved;
- whether typed lint was present, and the unchanged lint command's before/after pass or failure outcomes;
- the Righting diagnostics, if any, by their stable `righting/...` policy-rule key; and
- any resolver or configuration limitation that prevents verification.

Completion: the normal lint loop has run and its before/after configuration and outcome are recorded.

## 4. Use native suppressions only for approved legacy debt

When `righting-integrate` records approved legacy-debt adoption, run the unchanged lint script with the project's package-manager argument-forwarding syntax and ESLint's `--suppress-rule righting/role-dependency` argument (for npm: `npm run lint -- --suppress-rule righting/role-dependency`). Record the command outcome, review `eslint-suppressions.json` to confirm unrelated suppressions remain intact, then hand its pre-adoption migration base ref and reason to `righting baseline`.

Completion: the suppression command outcome is recorded, and any suppression is namespaced to `righting/role-dependency`, intentional, and ready for the core baseline ratchet.
