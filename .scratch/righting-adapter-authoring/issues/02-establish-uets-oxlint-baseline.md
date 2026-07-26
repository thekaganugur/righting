# Establish the uets-to-task Oxlint baseline

Type: task
Labels: wayfinder:task
Status: resolved
Blocked by:

## Question

Complete the separately owned Biome-to-Oxlint migration in `/Users/kgnugur/Codes/Personal/uets-to-task` and record the evidence adapter authoring may rely on:

- the pinned Oxlint version;
- the unchanged or approved replacement normal lint/check command;
- the passing lint, test, typecheck, and build outcomes required by that project; and
- the branch, commit, or working-context pointer containing the validated baseline.

Do not add Righting adapter behavior while establishing this prerequisite.

## Answer

Validated in `/Users/kgnugur/Codes/Personal/uets-to-task` on branch `main` at commit `65bfefa9b9ce84e10e67523ea0e03a763e8f86ed`.

- Oxlint is pinned at `1.75.0`.
- The normal lint command remains `npm run lint`; it runs `oxlint --deny-warnings .`.
- The normal aggregate command remains `npm run check`; it runs Oxfmt check, Oxlint, and `tsc --noEmit`.
- `npm run check` passed (format, lint, and typecheck).
- `npm test` passed: 28 files, 143 tests.
- `npm run test:connector` passed: 19 tests.
- `npm run build` passed. The existing local warning for unset VAPID secrets remained non-fatal.
- No Righting dependency, configuration, plugin, rule, or adapter behavior was added.
