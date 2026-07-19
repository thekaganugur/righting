# Tickets: Release-ready Righting onboarding

Deliver the approval-first, non-interactive Righting onboarding journey described in [PRD.md](PRD.md), with packed-artifact and human release evidence.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

## Approval-first `init` and v1 JSON contract

**Status:** ready-for-agent

**What to build:** A maintainer or compatible agent can initialize a project safely without architecture inference: `init` creates only the exact incomplete policy starter and minimal policy pointer, while its human and JSON results make the approval checkpoint and optional agent-support route clear.

**Blocked by:** None — can start immediately.

- [x] The exact starter is the only successful incomplete policy; a starter combined with configuration fails with precise replacement/removal remediation, without partial project writes.
- [x] Managed policy guidance contains only the policy pointer and preserves project-owned content; repeat initialization preserves an existing valid policy without claiming approval, adapter activation, or onboarding completion.
- [x] `init --json` provides the additive schema-version-1 success and expected-failure envelopes, including machine-actionable error codes and next actions; baseline JSON semantics remain unchanged.
- [x] Opt-in skill links remain relative, repeatable, collision-safe, and fully preflighted; normal `init` output mentions the optional skills route once.

## Read-only policy inspection and capability catalog

**Status:** ready-for-agent

**What to build:** Maintainers and compatible agents can use `inspect` to understand a policy’s normalized decisions, effective allowed role relationships, applicable static evidence, and explicit limits without changing the project or treating policy validity as a health check.

**Blocked by:** Approval-first `init` and v1 JSON contract.

- [x] Exact incomplete starters inspect successfully with requirements and next action but no effective rules; malformed policies return the common non-zero structured failure.
- [x] Valid inspection exposes aliases, mappings, variations, scopes, overrides, protected dependencies, and computed allowed dependencies in human and JSON forms.
- [x] A package-owned capability catalog supplies stable semantic IDs, coverage classifications, established and unproven claims, and adapter diagnostic mappings; default inspection shows applicable records and `--all` separates available-but-unconfigured records.
- [x] Inspection is demonstrably read-only and explicitly states that adapter activation, runtime behavior, and queued Manager interaction semantics are unproven or unknown.

## Publish onboarding routes and retire generated guidance

**Status:** ready-for-agent

**What to build:** A maintainer can choose a complete manual or compatible-agent-assisted onboarding route from the published package, while project guidance stays a minimal policy pointer and package-owned references remain the single source of explanatory detail.

**Blocked by:** Approval-first `init` and v1 JSON contract; Read-only policy inspection and capability catalog.

- [x] Publish a concise route chooser plus focused manual, agent-handoff, policy-language, capability, and additive ESLint references without prescribing a project architecture.
- [x] The capability reference and revised skills consume or reference the shared capability catalog; policy approval, adapter changes, and legacy-debt adoption remain separate explicit decisions.
- [x] Remove `docs` and every route or reference to it; generated project guidance is no longer a source of policy prose.
- [x] The packed package contains the runtime, skills, capability data, and every resource reachable from either onboarding route.

## Prove the packed manual-maintainer journey

**Status:** ready-for-agent

**What to build:** Release automation proves that a maintainer who does not install skills can use only a packed Righting artifact and `npx righting` to initialize, replace the starter with a pre-approved policy, inspect it, and follow the documented additive ESLint path.

**Blocked by:** Publish onboarding routes and retire generated guidance.

- [ ] The isolated fixture installs a tarball and never relies on workspace imports, copied packages, or linking.
- [ ] It verifies the exact starter, minimal project pointer, valid-policy repeat initialization, read-only inspection, documentation-linked resources, and the documented ESLint integration outcome.
- [ ] A shared semantic JSON assertion suite covers incomplete, valid, malformed, inspection, and `inspect --all` states while accepting additive fields.

## Prove the packed agent-assisted journey

**Status:** ready-for-agent

**What to build:** Release automation proves the same clean onboarding journey works for a compatible agent through `init --skills --json`, using the stable JSON contract and safely discoverable packaged skills without treating automated steps as maintainer approval.

**Blocked by:** Prove the packed manual-maintainer journey.

- [ ] The agent fixture starts from the same clean and pre-approved-policy fixtures as the manual route, differing only in opt-in skill discovery.
- [ ] It verifies relative skill links, collision-safe ownership, schema-version-1 JSON semantics, and a JSON-driven progression to the approved policy and inspection result.
- [ ] It never parses human output or claims that a maintainer’s architecture or adapter decision was automated.

## Preserve Orders/Returns post-approval repair evidence

**Status:** ready-for-agent

**What to build:** The Orders/Returns fixture remains candid packed-artifact proof of the post-approval enforcement and repair loop, while clean-route fixtures own all first-run assertions.

**Blocked by:** Publish onboarding routes and retire generated guidance.

- [ ] The fixture starts from an approved policy and retains additive flat-config wiring, the unchanged lint command, approved native legacy-debt capture, baseline migration, normal boundary feedback and repair, normal baseline result, and green CI.
- [ ] The dogfood narrative records real decisions, friction, repair, and static-analysis limits without presenting a universal architecture or onboarding guide.

## Record release-candidate walkthroughs

**Status:** ready-for-human

**What to build:** A release reviewer receives real, versioned maintainer-alone and maintainer-with-agent walkthrough records for the packed release candidate, supplementing—not replacing—the automated evidence.

**Blocked by:** Prove the packed manual-maintainer journey; Prove the packed agent-assisted journey; Preserve Orders/Returns post-approval repair evidence.

- [ ] Each completed record identifies the artifact/version, starting fixture, commands and outcomes, changed files, explicit approval evidence, adapter/lint/baseline/CI outcomes, static-analysis limits, and observed friction.
- [ ] The records capture the separate policy-approval and adapter-approval checkpoints and do not claim architecture inference, automatic approval, adapter activation proof, runtime proof, or queued-interaction proof.
- [ ] Release readiness is assessed only after the contract suite, both clean journeys, the post-approval repair fixture, and both human walkthrough records succeed.
