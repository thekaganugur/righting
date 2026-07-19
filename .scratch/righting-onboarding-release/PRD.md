# Release-ready Righting onboarding

Status: ready-for-agent

Source: resolved onboarding-release Wayfinder map

## Problem Statement

A maintainer who installs Righting, with or without a compatible coding agent, cannot yet complete a safe and clearly documented first-run journey. The current starter policy can be mistakenly extended instead of replaced, generated project guidance duplicates information that belongs to the package, the JSON output is not a stable agent contract, and there is no read-only way to interpret a completed policy with its static-analysis limits. The existing dogfood test exercises an approved integration and repair loop, but it does not prove both clean onboarding routes through the packed package.

This leaves maintainers unable to distinguish a structurally valid policy from human approval, adapter activation, baseline adoption, or runtime proof. It also makes an agent depend on prose and workspace behavior where it needs a stable, additive contract from the published CLI.

## Solution

Make Righting’s first run a non-interactive, approval-first onboarding route with two equivalent entry paths: a maintainer-alone route and an opt-in compatible-agent route. `init` continues to create the exact incomplete starter and a minimal managed policy pointer; it never infers architecture or configures linting. A maintainer approves an exact replacement policy outside Righting, then may separately approve ESLint integration and legacy-debt work.

Publish a schema-versioned JSON contract for `init` and the new read-only `inspect` command. `inspect` composes the configured policy with package-owned capability data so people and agents can see effective role relationships, applicable static evidence, and explicit limits without implying adapter activation or runtime proof. Replace generated project prose with progressive package documentation and discoverable skills. Gate release on packed-artifact contract tests, both clean routes, the existing enforcement-and-repair dogfood loop, and recorded maintainer walkthroughs.

## User Stories

1. As a maintainer, I want `init` to create an exact incomplete policy starter, so that Righting never guesses my architecture.
2. As a maintainer, I want the incomplete starter to contain only the preset and incomplete marker, so that its non-enforcing state is unmistakable.
3. As a maintainer, I want an incomplete marker combined with configuration to fail with precise remediation, so that I replace the starter after approval instead of extending it accidentally.
4. As a maintainer, I want a complete policy to omit lifecycle and approval metadata, so that the policy contains only architecture decisions Righting can validate.
5. As a maintainer, I want approval to remain in my issue, PR, or other integration record, so that Righting does not falsely claim to witness a human decision.
6. As a maintainer, I want `init` to preserve an existing valid policy, so that a repeatable setup command does not overwrite approved decisions.
7. As a maintainer, I want `init` to maintain only a short policy pointer in project guidance, so that project-owned instructions and package-owned documentation do not drift.
8. As an agent, I want that pointer to tell me to read the policy before changing mapped code, so that I discover the applicable architecture constraint at the point of work.
9. As a maintainer, I want the managed policy pointer to preserve all content outside its marked block, so that Righting cannot replace project-owned guidance.
10. As a maintainer, I want the normal `init` result to mention the optional skills route once, so that compatible-agent support is discoverable without being required.
11. As a maintainer, I want `init --skills` to create only safe, relative links to packaged skills, so that agents can discover current integration guidance without stale copies.
12. As a maintainer, I want `init --skills` to refuse project-owned name collisions before writing, so that opt-in agent support cannot destroy local skills or partially initialize a project.
13. As a compatible coding agent, I want a schema-versioned JSON response from `init`, so that I can determine policy condition and performed effects without parsing prose.
14. As a compatible coding agent, I want an incomplete JSON result to name aliases, mappings, and maintainer approval as requirements, so that I can direct the next human decision without claiming it has occurred.
15. As a compatible coding agent, I want the structured incomplete next action to be obtaining policy approval, so that I know the next step is a maintainer interaction rather than an inferred CLI operation.
16. As a compatible coding agent, I want a valid policy result to omit onboarding-completion claims, so that I do not mistake structural validity for adapter activation, a baseline, or approval provenance.
17. As an integration author, I want JSON failures to carry stable error codes and next actions, so that a non-zero result remains machine-actionable.
18. As an integration author, I want schema version 1 to permit additive fields but preserve existing required meanings, so that agents can evolve safely with Righting.
19. As a maintainer, I want to inspect a complete policy without modifying my project, so that I can review its effective architectural meaning before or after adapter integration.
20. As a compatible coding agent, I want `inspect --json` to provide normalized configuration and effective allowed role relationships, so that I can reason from Righting’s computed policy rather than reimplementing it.
21. As a maintainer, I want inspection to show configured aliases, mappings, variations, scopes, overrides, and protected dependencies, so that intentional architectural choices are reviewable together.
22. As a maintainer, I want inspection to show only the capability claims applicable to my effective policy by default, so that I see relevant evidence without an undifferentiated catalog.
23. As a maintainer, I want `inspect --all` to separate available-but-unconfigured capabilities, so that I can discover optional behavior without believing it is active.
24. As a maintainer, I want every capability claim to state what static analysis establishes and does not establish, so that I do not mistake lint evidence for runtime proof.
25. As a maintainer, I want Manager-to-Manager capability output to distinguish prohibited direct source imports from unproven queued interaction semantics, so that the tool’s limits are candid.
26. As a maintainer, I want inspection to state that adapter activation is unknown, so that a policy view never becomes a misleading health check.
27. As a maintainer with an incomplete starter, I want `inspect` to succeed but show no effective rules, so that I can safely see why enforcement is blocked.
28. As a maintainer with a malformed policy, I want `inspect --json` to fail with the common structured error envelope, so that I can repair configuration deterministically.
29. As a maintainer, I want a short route chooser and focused references, so that I can follow onboarding without installing or reading agent skills.
30. As a maintainer, I want a manual reference that makes approval precede starter replacement and optional adapter work, so that I remain responsible for architecture decisions.
31. As a maintainer working with an agent, I want a documented handoff to `righting-integrate` and then separately approved `righting-eslint` work, so that policy and adapter changes remain deliberate.
32. As a maintainer, I want the policy reference to describe only Righting’s language and semantics, so that package documentation does not imply a recommended folder structure or role assignment.
33. As a maintainer, I want a capability reference rendered from the same data as inspection, skills, and human output, so that coverage classifications and adapter mappings have one owner.
34. As a maintainer, I want the ESLint reference to preserve my existing modern flat-config lint loop, so that onboarding does not silently install, migrate, or restructure lint tooling.
35. As the product author, I want the Orders/Returns dogfood narrative to describe real decisions, friction, repair, and limits, so that it is candid evidence rather than universal onboarding advice.
36. As a release manager, I want clean manual and agent-assisted first-run fixtures to install a packed package and invoke it through `npx`, so that tests prove the distributed artifact rather than the workspace.
37. As a release manager, I want both clean route fixtures to start from the same approved-policy fixture but differ only in optional skill discovery, so that no-agent support and agent entry behavior are independently proven.
38. As a release manager, I want shared semantic assertions for JSON envelopes rather than whole-response snapshots, so that additive schema fields remain compatible while required behavior is protected.
39. As a release manager, I want the dogfood enforcement-and-repair fixture retained after policy approval, so that onboarding changes do not weaken evidence for additive ESLint wiring, legacy-debt ratcheting, boundary feedback, repair, or green CI.
40. As a release manager, I want recorded maintainer-alone and maintainer-with-agent walkthroughs for each release candidate, so that automated fixtures are supplemented by real approval and usability evidence.
41. As a maintainer, I want release evidence to state static-analysis limits explicitly, so that a successful journey never claims architecture inference, automatic approval, runtime proof, or queued-interaction proof.

## Implementation Decisions

### Onboarding lifecycle

- Retain `init` as the only setup command. Do not add a setup wizard, policy-application command, architecture inference, automated approval, or ESLint configuration command.
- When no policy exists, `init` writes exactly the two-field `volatility@1` incomplete starter. The marker is valid only in that untouched representation and blocks enforcement.
- A maintainer or compatible agent must render an exact candidate, obtain explicit maintainer approval in an external integration record, and replace the starter with the approved structurally complete policy. The replacement omits `status`; there is no `complete` marker, approval field, or activation command.
- Policy validation must recognize an incomplete marker combined with aliases, mappings, or any other configuration as invalid and report the exact replacement/removal remediation. It must not collapse this case into generic invalid-policy prose.
- ESLint integration and legacy-baseline adoption remain separate, explicitly approved actions after policy replacement. A valid policy is not evidence that approval, adapter activation, native suppressions, a baseline, or runtime behavior exists.

### Project guidance and skills

- `init` maintains a marked block in root project guidance whose entire managed content is the two-sentence policy pointer required by the handoff: it identifies the project’s Righting architecture policy and tells agents to read it before changing mapped code. Content outside the block remains byte-preserved apart from the existing managed-block insertion/replacement mechanics.
- Remove the detailed generated policy guidance flow and the `docs` command. No skill, package reference, dogfood narrative, human output, or test may direct users to it.
- Retain explicit, non-interactive `init --skills` behavior and its current safety guarantees: relative links to packaged Righting skills, repeatability for Righting-owned links, collision refusal for project-owned names, and preflight before project writes.
- Revise the integration skill so it renders the candidate policy, records approval, and hands adapter work to the ESLint skill without calling a removed guidance command. Revise related skills to use the policy and inspection capability records rather than duplicated managed guidance.

### Public CLI and JSON contract

- The final command surface is `init`, `inspect`, and `baseline`. `inspect` is read-only; no command scans or changes adapter integration as part of policy inspection.
- `init --json` and `inspect --json` use schema version 1 envelopes. Successful responses include `schemaVersion`, `command`, `ok: true`, and policy condition. The only successful policy conditions are `incomplete` for the exact starter and `valid` for a structurally valid complete policy.
- `init` alone reports whether this invocation created the policy and its managed-guidance update; `inspect` reports only the read-only policy interpretation. Command-specific effects such as skills may remain additive.
- An incomplete successful result includes `required: ["aliases", "mappings", "maintainer-approval"]` and `nextAction: "obtain-policy-approval"`. A valid result omits both fields.
- Under `--json`, every expected failure emits the versioned failure envelope and exits non-zero. It contains `ok: false` and an authoritative structured error with a stable code, human-readable remediation, relevant path when available, and a machine-actionable next action. Agents branch on codes and actions, never message text. Additive fields are permitted within schema version 1; existing field names, enum values, meanings, and required-field semantics are not.
- Preserve existing baseline semantics and expose no new claim that baseline output establishes onboarding completion. Any separate future decision to version baseline JSON must preserve or explicitly migrate its established contract.

### Read-only policy interpretation

- Add `inspect` and `inspect --all`. Default human output is a compact policy card covering policy condition, normalized configuration, effective role relationships and configured protections, applicable capability claims, static evidence, limits, and the explicit unknown adapter-status boundary.
- `inspect --json` provides the common success envelope plus normalized configuration, effective policy, and capability records. Effective policy includes computed allowed dependencies; configuration includes the approved policy choices without introducing inferred architecture.
- Capability data is a package-owned structured catalog. Each capability has a stable semantic identifier; applicability; one coverage classification (`lint-enforced`, `partially-checked`, or `guidance-only`); established claims; unproven claims; and associated adapter diagnostic keys. Inspection, package references, skills, and rendered human output consume this catalog rather than owning duplicate prose.
- Default inspection returns only applicable capabilities. `--all` separately identifies available but unconfigured capabilities. The exact starter is a successful incomplete inspection with requirements and next action but no effective rules. A malformed non-starter returns the common structured failure.
- Inspection is definitive about validated policy semantics and Righting-declared adapter capability mappings only. It does not write files, infer architecture, witness approval, run lint, assess flat-config activation, establish a baseline, install skills, configure/migrate lint tooling, or prove runtime behavior.

### Package documentation and distribution

- Publish progressive package-level onboarding with one owner per concern: a short route-chooser README; an approval-first manual-maintainer reference; an agent-assisted handoff reference; a neutral policy-language reference; a capability catalog generated from the structured capability data; and an ESLint adapter reference.
- The two documented routes are: maintainer alone—install, initialize, inspect the starter, make and approve decisions, replace the policy, inspect it, then optionally integrate ESLint; and maintainer with a compatible agent—the same route with explicit skills discovery and the separate integration/adapter handoffs.
- The ESLint reference describes only prerequisites and the existing additive protocol: supported flat config, lint command/package/resolver checks, the smallest adapter addition, preservation of typed-lint settings, normal lint verification, and approved native suppression/baseline work. It does not recommend architecture decisions.
- Update the Orders/Returns dogfood narrative as a candid worked record of real approved choices, integration, legacy debt, boundary repair, friction, and limits. It is neither a universal architecture recommendation nor a substitute for route documentation or release walkthrough evidence.
- Ensure the published package includes the CLI runtime, capability data, packaged skills, and all package references needed by either route. Packaging must be validated from the tarball, not assumed from the repository layout.

### Release evidence

- Release readiness requires all four layers: a shared JSON-contract suite, clean manual-maintainer and agent-assisted packed-artifact route fixtures, the retained shared dogfood enforcement-and-repair fixture, and two versioned walkthrough records.
- Every release fixture installs a packed npm tarball into an isolated project and invokes the CLI through `npx righting`. Workspace dependencies, source imports, `npm link`, and copied local packages are not release evidence.
- The shared contract suite covers incomplete, valid, and malformed lifecycle states; `inspect`; `inspect --all`; command effects; structured requirements and next actions; inspection configuration/effective-policy/capability layers; and structured error codes. Assertions accept unknown additive fields.
- The clean manual route uses no skills, initializes without input, verifies the exact starter and minimal pointer, applies a checked-in pre-approved policy fixture, re-runs `init`, inspects the valid policy, and follows the documented additive ESLint route. It proves no agent skill is required; it does not automate human approval.
- The clean agent-assisted route begins equivalently, runs `init --skills --json`, verifies the stable contract and relative links, consumes JSON rather than prose to reach the same pre-approved policy fixture, and verifies inspection. It proves agent entry behavior, not automated approval.
- The existing Orders/Returns fixture remains focused on the post-approval loop: additive ESLint wiring against a modern flat config with an unchanged lint script, approved native legacy-debt capture and baseline migration, an actionable normal boundary failure, policy-guided repair, a normal baseline result, and green unchanged CI. First-run assertions move to the clean route fixtures.
- Record maintainer-alone and maintainer-with-agent walkthroughs for the packed artifact/version. Each captures start fixture, commands and exit outcomes, changed files, approval evidence where applicable, adapter/lint/baseline/CI outcomes, static-analysis limits, and observed friction. A transcript, video, or signoff may supplement but not replace these records.

## Testing Decisions

- The primary and highest test seam is the packaged CLI exercised through `npx righting` in isolated fixture projects. Good tests describe what a maintainer or agent can observe—created or preserved files, exit status, JSON semantics, read-only inspection, skill-link ownership, normal lint outcome, baseline result, and CI outcome—not internal parsing, renderer calls, or third-party plugin configuration sequences.
- Build a shared JSON semantic assertion helper for schema version 1. It verifies required fields, statuses, error codes, requirement/next-action semantics, and command effects while accepting unknown fields. Do not use whole-object snapshots or branch on human-readable messages.
- Cover exact starter creation, repeatable `init`, minimal managed block replacement while preserving project content, starter-plus-configuration remediation, valid policy replacement, `--skills` links and collision atomicity, human-readable route discovery, and JSON failures for every supported CLI lifecycle.
- Cover `inspect` in incomplete, valid, malformed, and `--all` states. Assert normalized configuration, computed allowed dependencies, applicable versus available capability separation, stable semantic IDs and coverage classifications, Manager interaction limits, and explicit unknown adapter activation. Assert that inspection leaves all project files unchanged.
- Reuse the existing disposable CLI-project test style as prior art for direct command behavior, then elevate release assertions to tarball-installed fixtures. Reuse the existing policy-conformance cases for default role edges, variations, scopes, overrides, protected dependencies, unresolved imports, re-exports, dynamic imports, `require`, and type-only imports; those cases remain the policy and ESLint enforcement precedent.
- Retain and narrow the existing packed Orders/Returns dogfood fixture to post-approval enforcement/repair behavior. Add separate clean manual and agent-assisted route fixtures, rather than making dogfood prove all first-run branches.
- Validate the packed artifact’s file inventory indirectly through both clean route fixtures: runtime CLI, skill links, capability inspection, and all documentation-linked resources must be available after installation. Run the normal package test/build checks before creating the artifact fixture.
- Treat the two versioned walkthrough records as release acceptance artifacts. Their review confirms the human approval checkpoint and observed usability that automated tests cannot establish.

## Out of Scope

- An interactive setup wizard, a new setup command, architecture inference, automatic role assignment, automatic policy completion, or automated maintainer approval.
- Policy approval metadata, a `status: "complete"` marker, or any Righting claim that policy validity witnesses human approval.
- Automatic ESLint installation, migration, resolver installation, lint-script restructuring, adapter activation detection, or a health command that assesses project enforcement status.
- Generated detailed Righting policy prose in project guidance or a replacement for project-owned instructions.
- Runtime behavior proof, queued Manager interaction proof, use-case validity, real-volatility assessment, contract-quality assessment, or any claim beyond static source evidence.
- New enforcement adapters, policy semantics unrelated to onboarding, changes to the existing role graph or baseline-ratchet behavior, and a baseline JSON-contract redesign.
- Treating the dogfood narrative or route fixtures as a universal architecture recommendation or as evidence that an agent approved policy on a maintainer’s behalf.

## Further Notes

- There is no project glossary or relevant ADR. This specification uses the agreed Righting vocabulary: Client, Manager, Engine, ResourceAccess, Resource, Utility, policy, variation, override, scope, context firewall, capability, and legacy debt.
- The removal of `docs` and reduction of the managed guidance block are intentional compatibility changes. Update command parsing, skills, documentation, dogfood evidence, package distribution, and tests together so no route points to a removed command or stale generated prose.
- A release passes only when the contract suite, both packed clean-route fixtures, the shared dogfood repair fixture, and both walkthrough records succeed. This is evidence for a reviewable, non-interactive onboarding journey and static source-level feedback—not inferred architecture, automatic approval, adapter activation, or runtime correctness.
