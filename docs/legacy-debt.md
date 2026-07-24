# Legacy ESLint debt

Righting supports existing **ESLint 9-or-later flat-config** projects only. The adapter never creates or migrates lint configuration, rewrites `eslint.config.*`, changes the lint script, or owns a suppression format.

## Initial adoption

After adding `eslintConfig()` to an existing flat config, run the established lint command and report existing `righting/role-dependency` findings. Obtain explicit maintainer approval before asking ESLint to record them:

```sh
npm run lint -- --suppress-rule righting/role-dependency
```

ESLint writes namespaced entries to the project's `eslint-suppressions.json`; unrelated native suppressions remain ESLint's concern. Review and commit the resulting file with the adapter integration.

## Normal work

Use the unchanged lint command. ESLint applies the committed counts automatically, reports findings beyond them, and rejects stale suppression counts after their findings are fixed. Prune resolved debt with the native lifecycle:

```sh
npm run lint -- --prune-suppressions
```

No Righting lifecycle command or Git base is required.

## Limitation

ESLint stores counts per file and rule. This prevents count growth but cannot distinguish a same-count finding swap within the same file and `righting/role-dependency` rule.
