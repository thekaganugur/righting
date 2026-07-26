# Decide how the first Oxlint activation handles existing uets-to-task boundary findings

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by:

## Question

How should the project-local Oxlint adapter reach a green normal lint baseline without silently changing the meaning of the 21 maintainer-approved `uets-to-task` dependency observations?

A working adapter prototype consumed `righting inspect --json`, passed the complete local `role-dependency` conformance suite, and then reported all 21 approved observations through pinned Oxlint 1.75.0:

- 10 Client dependencies on Engine;
- 1 Client dependency on ResourceAccess;
- 7 ResourceAccess dependencies on Engine;
- 2 Engine dependencies on Engine; and
- 1 Manager dependency on Client.

The approved policy baseline explicitly records these as inconsistencies, not policy exceptions or adapter-native legacy debt. Activating the adapter therefore makes `npm run lint` fail. Choose and approve one route that preserves detection of new findings: repair the existing architecture, adopt exact native Oxlint suppressions as legacy debt, or revise the waypoint boundary with another explicit treatment. Broad file/rule disabling is not acceptable because it would hide new violations.

## Answer

Adopt the 21 approved observations as exact native Oxlint legacy debt:

- Place a rule-specific `righting/role-dependency` suppression at each existing import; do not disable the rule for a whole file or glob.
- Record a concise reason identifying the suppression as approved pre-adapter legacy debt.
- Keep `righting.json` unchanged: the dependencies remain policy inconsistencies, not allowed architecture.
- Add Oxlint's `--report-unused-disable-directives` check to the normal lint path so repaired debt cannot leave stale suppressions.
- Prove that an unsuppressed violation, including another violation in a file containing legacy debt, still fails normal lint.
- Use no custom baseline format or debt lifecycle. Remove each native directive when its dependency is repaired.

This approval applies only to the 21 observations recorded by the approved `uets-to-task` policy baseline. New findings require repair or separate maintainer approval.
