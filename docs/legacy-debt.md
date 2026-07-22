# Legacy ESLint debt

Righting supports existing **ESLint 9-or-later flat-config** projects only. It never creates or migrates lint configuration, rewrites `eslint.config.*`, or changes the `lint` script.

## Establish a baseline

After adding `eslintConfig()` to an existing flat config, let ESLint record only Righting findings in its normal suppression file:

```sh
npm run lint -- --suppress-rule righting/role-dependency
```

ESLint writes the namespaced `righting/role-dependency` entries to `eslint-suppressions.json`; unrelated entries remain untouched. Commit that file, then verify the intentional adoption or policy expansion against an explicit base ref:

```sh
npx righting baseline --base origin/main --migration-reason "Adopt existing boundary debt."
```

Normal work uses the same command without a migration reason. It passes only when Righting debt is unchanged or smaller:

```sh
npx righting baseline --base origin/main
```

Git is required only for `righting baseline`. Ordinary ESLint boundary linting remains available without Git.

## Limitation

The ratchet compares counts per file and `righting/role-dependency`. It detects growth, but cannot distinguish a same-count violation swap within the same file and rule.
