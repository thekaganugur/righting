# Define Righting's legacy-first adoption lifecycle

Type: grilling
Labels: wayfinder:grilling
Status: open
Blocked by: 06

## Question

Turn the adoption rule established by [Define Righting's response to dogfood Engine-to-Engine conflicts](02-rule-on-the-dogfood-engine-to-engine-edges.md) into a complete lifecycle for existing and new projects:

1. establish desired architectural intent in `righting.json`;
2. detect existing inconsistencies;
3. grandfather the approved initial inventory as legacy debt;
4. prevent new debt and baseline growth; and
5. leave the timing and method of refactoring to maintainers.

Decide:

- how Righting distinguishes new projects, existing projects, newly covered source, and policy expansion;
- the exact approval packet and atomic transition from candidate manifest to active manifest plus baseline;
- which legacy-debt intent belongs in `righting.json` and which occurrence state remains adapter-native;
- how enforceable and advisory inconsistencies represent grandfathered, unresolved, and removed debt without turning the manifest into an evidence ledger;
- how occurrence identity prevents same-count swaps while allowing moves or refactors to shrink debt;
- how incomplete scans, unsupported adapters, generated files, and changing resolution affect baseline trust;
- when an intended relationship is an override rather than debt and how misuse is corrected; and
- how onboarding, focused skills, capability records, inspection, CI, and baseline commands communicate the lifecycle without prescribing remediation.

Use [Design the deterministic agent-evidence contract](06-design-the-deterministic-agent-evidence-contract.md) for stable occurrence and coverage facts. End with an implementation-ready manifest, adapter, skill, CLI, and documentation handoff. This ticket defines adoption and ratcheting, not how maintainers refactor legacy architecture.
