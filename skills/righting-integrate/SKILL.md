---
name: righting-integrate
description: Deliberate Righting integration when a maintainer needs to approve policy aliases, mappings, context scopes, or legacy-baseline intent.
compatibility: Requires the local righting CLI; use righting-eslint for an existing ESLint flat config.
---

# Deliberate Righting integration

Righting policy is maintainer-supplied. Turn stated decisions into the smallest approved policy; keep every unspecified architectural choice absent.

## 1. Establish the decision record

Read any existing `righting.json`, root `AGENTS.md`, and project documentation. If Righting is absent, explain that `righting init --json` creates only an incomplete starter policy and a managed guidance block.

Collect and record these maintainer decisions:

- each local alias, its canonical role (`Client`, `Manager`, `Engine`, `ResourceAccess`, `Resource`, or `Utility`), and every path mapping;
- protected external Resource or Utility packages, if any;
- named variations: `clientReadsAccess`, `pureEngines`, and, only when contexts are meaningful, `contextFirewall` with explicit context, shared, and unscoped paths;
- named role-edge overrides and their reasons, after considering the default policy fit, clarification or extraction, and tightening;
- optional domain-vocabulary and golden-example references; and
- whether existing Righting findings are intentional legacy debt, plus a pre-adoption migration base ref and reason when adoption is approved.

Completion: every proposed policy field is either supplied by the maintainer or intentionally absent.

## 2. Obtain policy approval

Render the exact candidate `righting.json`, the files and commands that would change, the baseline effect, and whether a commit is requested. Request explicit maintainer approval before creating or replacing policy, managed guidance, adapter configuration, suppressions, or a commit.

Write only approved decisions. Keep aliases, mappings, scopes, variations, and overrides out of the policy until they have been stated and approved.

Completion: the maintainer has approved the exact policy and any requested setup actions.

## 3. Apply the approved policy

Run `righting init --json` when the project needs its starter files; preserve existing policy when it is not approved for replacement. Apply the approved complete policy, then run `righting inspect --json` to report its normalized configuration, effective relationships, applicable capability records, and unknown adapter status.

Use `righting-eslint` to add the ESLint adapter when enforcement is approved. Keep any unsupported ESLint result as a reported prerequisite rather than changing lint tooling.

Completion: `righting.json` contains the approved decisions and read-only inspection reports that policy without claiming adapter activation.

## 4. Establish baseline intent deliberately

Use the post-integration lint outcome to decide whether legacy debt exists. When the maintainer approves adoption, record a migration base ref from before the policy adoption or enforcement expansion and its migration reason, then hand native suppression capture to `righting-eslint`. After it reports namespaced Righting debt, run:

```sh
righting baseline --base <approved-pre-adoption-ref> --migration-reason "<approved reason>"
```

Offer the approved suppression file and policy for the requested commit. When an approved post-adoption base ref includes both the adopted policy and suppression file, run `righting baseline --base <approved-post-adoption-ref>` and record its outcome. Otherwise, record the approved future base strategy. The count ratchet detects growth but cannot distinguish a same-count violation swap within one file and policy rule. Do not establish a baseline when there is no approved legacy-debt decision.

Completion: the migration base, migration reason, baseline outcome, normal-work verification outcome or future base strategy, and count-based limitation are recorded.

## 5. Report the integration record

Report the approved aliases, mappings, scopes, variations, overrides, changed files, inspection result, lint result, typed-lint result from `righting-eslint`, and any baseline result. Use the applicable `righting inspect --json` capability records for established and unproven claims; inspection does not establish adapter activation.

Completion: the record contains every approved decision, changed file, command outcome, prerequisite, baseline limitation, and static-analysis limitation.
