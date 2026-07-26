# Establish the uets-to-task normalized Righting contract

Type: task
Labels: wayfinder:task
Status: resolved
Blocked by:

## Question

Complete the separately owned, maintainer-approved Righting policy integration in `/Users/kgnugur/Codes/Personal/uets-to-task` and record the evidence adapter authoring may rely on:

- the exact approved complete policy;
- the approval context pointer;
- a successful `righting inspect --json` result containing the normalized contract; and
- the branch, commit, or working-context pointer containing the validated policy baseline.

Do not infer policy decisions or add Oxlint adapter behavior while establishing this prerequisite.

## Answer

Approved in Pi session `019f9e2c-8c29-711b-9115-e11e51afd632` from the exact [policy approval packet](../uets-righting-policy-approval.md), then applied in `/Users/kgnugur/Codes/Personal/uets-to-task` on branch `main` at commit `d75906c03309f625e7bc4894ff3f0f3606e82fbf`.

- The exact approved policy is committed as `righting.json`; it covers `src/**/*.{ts,tsx}`, defines the approved page/component/lib aliases, `.gen.` treatment, pure Engines, Client composition, router/routeTree/worker composition roots, and `CONTEXT.md` guidance.
- Righting `0.1.0` from source commit `569b9eba240de0e6197c028529fa3c176c10a408` is pinned as the vendored artifact `vendor/righting-0.1.0-569b9eb.tgz` with SHA-1 `42c4d297086e02eb84188c4cef584abfa65636a2`.
- `npx righting inspect --json` passed. Its complete normalized contract and evidence are recorded in [uets-righting-inspect.json](../uets-righting-inspect.json): 69 covered files, no unclassified or ambiguous source, contract version 1, and adapter status unknown.
- The approved dependency ledger records 21 existing `righting/role-dependency` observations as inconsistencies, not policy exceptions or adapter-native debt.
- `npm run check` and `git diff --check` passed.
- The managed `AGENTS.md` pointer and packaged skill links were added. No Oxlint plugin, rule, configuration, suppression, or adapter behavior was added.
