# righting v1

Status: ready-for-agent

Source: agreed dogfooding design, 2026-07-18

## Problem Statement

Project maintainers and coding agents need a practical way to state and preserve an architecture based on volatility boundaries. Today, a project can describe desired Client, Manager, Engine, ResourceAccess, Resource, and Utility responsibilities in prose, but ordinary source imports can silently erode those boundaries. Existing linting tools can check imports, but they do not provide a language-neutral policy model, stable architectural rule identities, agent-facing guidance, or a safe way to ratchet down inherited violations.

The result is that an agent making an otherwise small feature change can introduce a dependency that couples volatile business code to the wrong layer, cross a business context without an intentional boundary, or bypass the policy through an unresolved local import or a barrel. Maintainers also need enforcement that works within their current lint workflow, does not rewrite a working ESLint setup, stays local and private, and gives a clear migration path for legacy debt rather than requiring a clean rewrite before adoption.

## Solution

Deliver `righting` v1: a local TypeScript/Node architecture-policy tool with a versioned, language-neutral policy and a first ESLint enforcement adapter. A project declares explicit aliases, role mappings, optional context scopes, and any justified variations in `righting.json`; the `volatility@1` preset then validates source dependencies against the closed Righting role graph.

The core owns policy validation, stable policy-rule keys, agent guidance, and the non-growing legacy-debt ratchet. The ESLint adapter translates that policy into the project's existing modern flat-config lint loop and uses ESLint-native suppressions. The tool provides non-interactive `init`, `baseline`, and `docs` commands and integration skills for deliberate setup. It is strict by default, local-only, safe to re-run, explicit about what static analysis can and cannot establish, and validated through a real dogfooding integration before public release.

## User Stories

1. As a project maintainer, I want to declare a versioned architecture policy, so that dependency rules are reviewable and durable.
2. As a project maintainer, I want to select the pinned `volatility@1` preset, so that the project has an unambiguous baseline of canonical role behavior.
3. As a project maintainer, I want to name local aliases for canonical roles, so that the policy uses the project’s own vocabulary without changing the underlying architecture.
4. As a project maintainer, I want aliases to map only to Client, Manager, Engine, ResourceAccess, Resource, or Utility, so that teams cannot accidentally create incompatible role semantics.
5. As a project maintainer, I want to map paths or packages explicitly to aliases, so that enforcement has a deliberate and inspectable scope.
6. As a project maintainer, I want ambiguous role or scope matches rejected as configuration errors, so that a source file cannot receive a convenient but accidental interpretation.
7. As a developer, I want an unresolved local import to fail policy enforcement, so that broken resolution cannot become an architectural bypass.
8. As a developer, I want ordinary external dependencies to remain allowed by default, so that the policy only constrains dependencies that are architecturally meaningful.
9. As a project maintainer, I want to protect selected external Resource or Utility dependencies, so that business layers cannot casually bypass those declared boundaries.
10. As a developer, I want the default Client-to-Manager, Manager-to-Engine-or-ResourceAccess, Engine-to-ResourceAccess, and ResourceAccess-to-Resource flow enforced, so that source dependencies preserve the intended closed architecture.
11. As a developer, I want every canonical role to be able to use Utility code, so that common stable support can be shared without special exceptions.
12. As a project maintainer, I want Resources and Utilities prevented from importing business roles, so that infrastructure and support code do not become hidden business orchestrators.
13. As a developer, I want direct Manager-to-Manager source imports rejected, so that synchronous coordination does not silently violate the intended interaction model.
14. As a project maintainer, I want `clientReadsAccess` to be an explicit named opt-in, so that a Client-to-ResourceAccess variation is visible in policy review.
15. As a project maintainer, I want `pureEngines` to be an explicit named opt-in, so that a project can document an intentionally narrower Engine dependency model.
16. As a project maintainer, I want `contextFirewall` to be an explicit named opt-in, so that cross-context dependency rules apply only when contexts are meaningful to the project.
17. As a project maintainer, I want reason-required global role-edge overrides, so that any necessary loosening is deliberate and auditable.
18. As a project maintainer, I want the policy to favor fitting or clarifying the design before adding an override, so that exceptions do not become the primary architecture.
19. As a project maintainer using contexts, I want to identify contextual, shared, and unscoped areas, so that scope and role can be enforced as separate concepts.
20. As a developer, I want one context prevented from importing another context, so that captured business-context identity is not crossed by accident.
21. As a developer, I want shared code prevented from importing a context, so that shared code remains reusable rather than context-bound.
22. As a developer, I want contextual code to use shared code when the role graph permits it, so that reuse remains possible without opening the context firewall.
23. As a Client author, I want to compose shared Clients and Clients in my own context, so that UI or delivery composition works without framework-specific rules.
24. As a router or application-wiring author, I want unscoped code to wire context entry points in v1, so that a project can adopt the firewall without inventing a premature composition-root scope.
25. As a developer, I want type-only imports treated as architecture dependencies, so that type references cannot evade the policy.
26. As a developer, I want imports, re-exports, `require`, and dynamic imports checked, so that a barrel or alternate module syntax cannot launder a forbidden dependency.
27. As a maintainer, I want every stable policy rule to have a `righting` rule key, so that diagnostics remain meaningful even when enforcement adapters use different native rule IDs.
28. As a developer, I want generated guidance to state whether each rule is lint-enforced, partially checked, or guidance only, so that I do not mistake static evidence for proof of runtime behavior.
29. As a project maintainer with a modern ESLint flat config, I want to add Righting enforcement without changing existing lint scripts or typed-lint settings, so that architecture policy adoption is low risk.
30. As a developer, I want the ESLint adapter to use existing import/path enforcement capabilities rather than a new graph engine, so that the normal lint loop remains the single enforcement surface.
31. As a maintainer without modern ESLint flat config, I want a clear unsupported result rather than an automatic migration, so that the tool does not claim certainty or modify unrelated lint infrastructure.
32. As a developer, I want `righting init` to create an intentionally incomplete policy template non-interactively, so that an agent and developer must consciously supply architecture decisions before lint activation.
33. As a maintainer, I want `righting init` to be safe to re-run and preserve project-owned agent guidance, so that setup can be refreshed without overwriting local instructions.
34. As an agent, I want generated agent guidance to explain aliases, enforced boundaries, and adapter limitations, so that implementation work starts with the project’s architecture rather than assumptions.
35. As a maintainer, I want optional domain-vocabulary and golden-example references validated for existence, so that agents receive useful pointers without the tool pretending to judge their quality.
36. As an agent integrating the tool, I want a skill that leads policy, alias, scope, approval, documentation, and baseline decisions, so that strict setup is still practical.
37. As an agent integrating ESLint, I want a skill that preserves the current flat config and resolver setup while verifying the existing lint command, so that adapter wiring is repeatable and non-destructive.
38. As a developer inheriting violations, I want to create an initial legacy baseline, so that I can adopt strict architecture policy without blocking all work on pre-existing debt.
39. As a project maintainer, I want a baseline to only shrink during normal work, so that legacy debt cannot grow unnoticed.
40. As a CI maintainer, I want the baseline comparison to receive an explicit Git base reference, so that the ratchet compares the intended change boundary deterministically.
41. As a project maintainer expanding policy intentionally, I want a new initial baseline allowed only with a migration reason, so that a broader enforcement scope does not disguise new debt as routine work.
42. As a developer, I want ordinary boundary linting to work without Git, so that local policy feedback is available even when a repository history is unavailable.
43. As a developer, I want Righting suppressions stored through the project’s existing ESLint suppression workflow and namespaced to the adapter, so that legacy debt remains compatible with existing lint tooling.
44. As a maintainer, I want the count-based baseline limitation explained, so that I understand that a same-count swap within one file and rule is not distinguished.
45. As a future adapter author, I want common allowed and forbidden dependency fixtures, so that a new ecosystem adapter cannot be called supported without matching core policy behavior.
46. As a privacy-conscious maintainer, I want `righting` to run locally without telemetry or a hosted service, so that architecture information stays in the repository and local environment.
47. As the product author, I want to dogfood the complete integration and repair loop in a real TypeScript project, so that public release is based on proven agent usability rather than only fixtures.
48. As a maintainer who has installed Righting, I want an explicit `init --skills` option that exposes the packaged skills through the project-standard `.agents/skills` location without replacing project-owned skills, so that compatible agents can discover the integration workflow without stale copies.

## Implementation Decisions

### Product boundary and terminology

- `righting` is an agent-first, local TypeScript/Node tool. It has no telemetry and no hosted service.
- The product is split at a deep boundary: the `righting` core owns the policy language and its semantics; adapters translate those semantics into a particular enforcement ecosystem. ESLint is the first adapter, not a special case embedded into core policy behavior.
- V1 uses the canonical role names Client, Manager, Engine, ResourceAccess, Resource, and Utility. These names carry the `volatility@1` semantics. Project aliases change only local vocabulary and matching; they never create a seventh role or alter the behavior of a canonical one.
- The initial preset is version-pinned as `volatility@1`. The policy format is versioned, schema-validated, and language-neutral.

### Policy model and dependency semantics

- A policy declares explicit path and/or package mappings to aliases. A source item with ambiguous role or scope matches is invalid configuration. A local dependency that cannot be resolved is an error rather than an allowed unknown.
- The default role graph allows Client → Manager; Manager → Engine or ResourceAccess; Engine → ResourceAccess; ResourceAccess → Resource; and every role → Utility. Other canonical-role dependencies are forbidden unless an intentional variation or override permits them.
- Resources and Utilities cannot import business roles. Direct Manager → Manager source imports are forbidden. Generated guidance must distinguish this source-level restriction from the book’s queued-interaction intent, which static enforcement can only partially check.
- Ordinary external dependencies remain allowed unless a policy explicitly protects one as a Resource or Utility dependency. Protected dependencies follow the same architectural intent as local role boundaries.
- The only named v1 variations are `clientReadsAccess`, `pureEngines`, and `contextFirewall`. Global canonical-role edge overrides are supported only when named and reason-required. The integration workflow must favor default-policy fit, then design clarification or extraction, then tightening, and only finally a documented loosening.
- There is no v1 per-file or per-line `righting` waiver system. Deliberate policy-wide variations and grandfathered legacy debt are the sole exception mechanisms.

### Contexts and scopes

- Role and scope are independently calculated. Context behavior applies only when `contextFirewall` is enabled.
- A firewall-enabled policy explicitly identifies context paths, shared paths, and unscoped paths. One context cannot import another; shared code cannot import a context; contextual code may import shared code when the role graph permits it.
- Contextual Clients may compose shared Clients and Clients from the same context. This intentionally supports framework-neutral page/component or controller/view composition.
- V1 leaves unscoped application or router code able to wire context entry points. It does not add nested scopes, public cross-context APIs, arbitrary scope graphs, or a declared composition-root scope.

### Enforcement contract and adapter capabilities

- Static enforcement covers imports, exports and re-exports, `require`, dynamic imports, and type-only imports. Re-exports must not enable barrel laundering.
- The tool must never claim runtime proof. It cannot prove properties such as whether an allowed Manager interaction was actually queued.
- Every stable semantic policy rule has a `righting` policy-rule key. Adapters may use distinct native lint-rule identifiers but must map findings to the stable policy key.
- Generated guidance and adapter documentation label rules as lint-enforced, partially checked, or guidance only. Adapters declare their supported enforcement capabilities and limitations explicitly.

### Core commands and generated guidance

- V1 exposes only `init`, `baseline`, and `docs` commands. The commands are non-interactive by default, safe to re-run, and machine-readable where useful.
- `init` creates an explicitly incomplete policy template. It must not infer a repository architecture, silently choose aliases or scopes, activate linting before approval, or rewrite an ESLint configuration.
- `init` updates only a marked managed block in root `AGENTS.md`, preserving all project-owned content around it. The managed guidance explains local aliases, boundaries, adapter limits, and the opt-in `init --skills` discovery setup.
- `init --skills` creates relative symlinks to the packaged Righting skill directories under `.agents/skills`, the cross-agent discovery convention. It is safe to re-run and refuses to replace a non-Righting project-owned skill with the same name.
- The policy can include optional agent-only extras for domain vocabulary and golden examples. The core validates that configured references exist but does not parse a domain document or determine whether an example is architecturally sound.
- Skills follow the Agent Skills standard without harness-specific assumptions. `righting-integrate` owns deliberate policy and baseline decisions; `righting-eslint` owns flat-config wiring, resolver setup, native suppression workflow, and verification. The ESLint integration protocol inspects and preserves existing settings, adds only adapter configuration, runs the existing lint command, reports whether typed linting is present and its outcome, and does not restructure lint commands without approval.

### ESLint adapter

- The v1 ESLint adapter supports only repositories that already have a modern ESLint flat-config setup. Legacy ESLint configurations and repositories without ESLint receive an explicit unsupported result; the adapter neither installs nor migrates lint tooling.
- Adapter integration preserves existing lint scripts and typed-lint settings. Righting’s static source rules do not require or add type-aware analysis.
- The adapter uses existing ESLint path/import enforcement capabilities rather than building a second import-graph engine solely for Righting. It must cover all supported dependency-node forms, including re-exports.
- Legacy suppressions remain in the project’s shared `eslint-suppressions.json`. Righting entries are namespaced composed rule entries so they do not collide with unrelated ESLint suppressions.

### Legacy debt and ratchet

- The ESLint adapter owns native baseline-file mechanics and normalizes its namespaced entries for core comparison. The core owns the invariant that baseline debt may only shrink.
- Git is required only for baseline and ratchet operations. CI supplies the base ref explicitly. The v1 comparison measures per-file, per-policy-rule counts.
- A normal baseline cannot grow. A deliberately enabled or expanded policy may establish an initial legacy baseline only with an explicit migration reason.
- The count ratchet is intentionally transparent rather than exact: it detects increases but cannot distinguish a same-count violation swap within the same file and policy-rule pair.

### Future adapters

- A future adapter is not supported until it passes the common allowed and forbidden dependency fixtures. It must state capabilities and limitations using the shared policy-rule vocabulary.

## Testing Decisions

- The primary test seam is a black-box policy-conformance fixture repository: configure `righting` through its public commands and policy, wire the ESLint adapter as a project would, then assert externally visible validation results, generated guidance, lint diagnostics, suppression behavior, and command exit outcomes. This is the highest shared seam between core and the first adapter and keeps policy semantics from being duplicated in implementation-level tests.
- Tests are good when they describe a project author’s observable outcome: whether a policy is accepted or rejected, whether a dependency is allowed or reported with the stable policy-rule key, whether a managed guidance block preserves project text, or whether a baseline change passes or fails. Tests must not assert private data structures, internal translation steps, or particular third-party plugin call sequences.
- The shared conformance cases must cover every allowed default graph edge, every forbidden reverse or lateral edge, Utility access from all roles, Resource and Utility restrictions, direct Manager-to-Manager imports, aliases, explicit path/package mappings, ambiguity, protected externals, and unresolved local imports.
- The same fixture suite must cover all supported static dependency forms: normal imports, exports/re-exports, `require`, dynamic imports, and type-only imports. A re-export test is required specifically to prove that a barrel cannot launder a forbidden dependency.
- Context-fixture cases must cover same-context Client composition, shared Client composition, contextual-to-shared dependencies permitted by the role graph, cross-context rejection, shared-to-context rejection, and allowed unscoped entry-point wiring. Separate cases must prove the effect of each named variation and of reason-required edge overrides.
- Command-level fixture cases must cover non-interactive, repeatable `init`; intentional incompleteness before lint activation; opt-in packaged-skill links under `.agents/skills` without project-owned collisions; preservation of project-owned `AGENTS.md` content; generated documentation classifications; and validation of optional guidance references.
- ESLint integration cases must begin from a modern flat-config fixture with pre-existing lint and, where present, typed-lint settings. They must prove that the adapter adds only Righting behavior, does not require type-aware analysis, preserves the existing lint command, produces actionable diagnostics, and reports unsupported configurations clearly rather than migrating them.
- Baseline cases must use a disposable Git history and an explicitly supplied base ref. They must prove initial baseline establishment, pass-on-shrink, fail-on-growth, migration-reason requirements for intentional policy expansion, namespaced ESLint suppression normalization, and the documented same-file/same-rule count limitation.
- Every future adapter must execute the common conformance fixtures before it is called supported. Adapter-specific tests may cover native configuration mechanics, but they must not redefine policy semantics.
- There is no existing implementation test suite in this greenfield repository. The shared fixture repository and public-command tests are the initial testing precedent; they should become the model for subsequent adapters and regressions.

## Out of Scope

- Inferring an existing repository’s architecture or automatically assigning roles.
- Generating application code skeletons or framework templates.
- Generic AST or code-pattern rules unrelated to dependency architecture, including mutation or raw-state-string checks.
- Proving runtime behavior, queue semantics, contract quality, Manager/Engine ratios, real volatility, or use-case validity.
- A visual dashboard, hosted service, telemetry, or cloud account.
- A public adapter SDK in v1.
- A custom per-violation waiver framework.
- Cycle detection as a `righting` responsibility.
- Automatically installing, migrating, or restructuring ESLint or other lint configurations.
- Legacy ESLint config support or repositories without ESLint support through the v1 adapter.
- Oxlint, RuboCop, and other enforcement adapters.
- Nested scopes, public cross-context APIs, arbitrary scope graphs, and a declared composition-root scope.
- Exact baseline identity beyond per-file/per-rule counts.

## Further Notes

- The v1 design is agreed for dogfooding. Public `0.x` publication follows only after the stated dogfood acceptance path succeeds in a real TypeScript repository: approved non-interactive integration, managed policy aliases/scopes, committed legacy debt where needed, generated guidance, an actionable normal-lint boundary failure repaired using the policy or golden example, and green CI without human architecture intervention.
- Dogfooding is the evidence source for refining adapter performance, composition-root scope needs, stronger baseline identity, and future adapters.
- No project glossary or ADRs existed when this specification was produced. Terminology is therefore taken from the approved `righting` v1 design and should be added to the project glossary when domain-modeling work establishes durable definitions.
- The specification credits *Righting Software* as inspiration while requiring original product wording.
