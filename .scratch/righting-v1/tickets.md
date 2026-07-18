# Tickets: righting v1

Status: ready-for-agent

Tracer-bullet implementation plan for the agreed righting v1 PRD.

Work the **frontier**: any ticket whose blockers are all done. Tickets 6 and 7 may proceed in parallel once ticket 5 is complete; ticket 9 may proceed in parallel with ticket 8 once ticket 7 is complete.

## 01. Bootstrap the safe `righting` CLI

**What to build:** A project maintainer can run a local, non-interactive `righting init` command and receive an intentionally incomplete policy starter plus managed agent guidance, without the tool inferring architecture, activating enforcement prematurely, rewriting lint configuration, or overwriting project-owned guidance.

**Blocked by:** None — can start immediately.

- [x] A maintainer can invoke `init` in a supported local project and receive a clear, machine-readable result where appropriate.
- [x] The starter policy identifies the pinned v1 preset but remains explicitly incomplete until approved architecture decisions are supplied.
- [x] Re-running `init` preserves project-owned agent guidance while updating only Righting-managed guidance.
- [x] Public command tests prove non-interactive operation and safe reruns.

## 02. Prove the policy-to-ESLint feedback loop

**What to build:** A project with a modern ESLint flat config can configure a Client and Manager mapping, run its normal lint command, and receive an actionable stable-policy diagnostic for a forbidden dependency while an allowed Client-to-Manager dependency passes.

**Blocked by:** Bootstrap the safe `righting` CLI.

- [x] A minimal policy can be read and translated into existing ESLint enforcement without rewriting the project’s lint command.
- [x] Allowed and forbidden Client/Manager dependencies are distinguishable in a runnable fixture project.
- [x] Findings expose a stable `righting` policy-rule key even if ESLint uses a different native rule identifier.
- [x] The fixture tests the observable lint outcome rather than adapter internals.

## 03. Complete the default `volatility@1` dependency graph

**What to build:** A project can use all six canonical roles under the default `volatility@1` graph and receive complete static dependency enforcement, including dependency forms that could otherwise bypass the normal import path.

**Blocked by:** Prove the policy-to-ESLint feedback loop.

- [x] The default Client, Manager, Engine, ResourceAccess, Resource, and Utility permissions and prohibitions are enforced through ESLint.
- [x] Every role can depend on Utility, while Resources and Utilities cannot reach into business roles and direct Manager-to-Manager imports fail.
- [x] Imports, exports/re-exports, `require`, dynamic imports, and type-only imports receive equivalent architectural treatment.
- [x] A reusable allowed/forbidden dependency conformance fixture suite becomes the support gate for future adapters.

## 04. Make policies strict and exceptions deliberate

**What to build:** A maintainer can express local aliases and explicit mappings while the tool rejects ambiguous or unresolved policy conditions and permits only documented, intentional deviations from the default graph.

**Blocked by:** Complete the default `volatility@1` dependency graph.

- [x] Aliases retain canonical role behavior, and explicit path or package mappings determine policy coverage.
- [x] Ambiguous role or scope matches and unresolved local imports fail clearly instead of silently bypassing enforcement.
- [x] Ordinary external dependencies remain allowed, while explicitly protected Resource or Utility dependencies are constrained by policy.
- [x] The named `clientReadsAccess`, `pureEngines`, and `contextFirewall` variations and reason-required global role-edge overrides change behavior only when explicitly configured.
- [x] No per-file or per-line Righting waiver mechanism is introduced.

## 05. Enforce context-firewall scopes

**What to build:** A project that enables `contextFirewall` can declare contextual, shared, and unscoped areas and receive the agreed scope protections while retaining permitted Client composition and entry-point wiring.

**Blocked by:** Make policies strict and exceptions deliberate.

- [x] Cross-context imports and shared-to-context imports fail with actionable policy diagnostics.
- [x] Contextual code can use shared code when the role graph permits it.
- [x] Contextual Clients can compose shared Clients and Clients in the same context.
- [x] Unscoped application or router code can wire context entry points without introducing a v1 composition-root scope.
- [x] Fixtures demonstrate the allowed and forbidden scope behavior independently of framework naming.

## 06. Adopt safely with a legacy-debt ratchet

**What to build:** A maintainer with a supported existing ESLint setup can adopt Righting without disrupting established lint behavior, record legitimate legacy debt through native suppressions, and prevent that debt from growing.

**Blocked by:** Enforce context-firewall scopes.

- [x] The adapter preserves existing flat-config, lint-script, and typed-lint settings; unsupported legacy or absent ESLint setups are reported rather than migrated.
- [x] Righting uses namespaced entries in the project’s native ESLint suppression storage without affecting unrelated suppressions.
- [x] A maintainer can establish an initial legacy baseline, and normal work passes only when per-file/per-policy-rule debt does not grow.
- [x] CI can compare against an explicitly supplied Git base ref; intentional policy expansion requires an explicit migration reason.
- [x] Ordinary boundary linting remains available without Git, and documentation states the same-file/same-rule count-swap limitation.

## 07. Generate policy and agent guidance

**What to build:** A maintainer can generate durable guidance that tells agents how the local Righting policy works, what enforcement can prove, and where configured domain vocabulary and golden examples are available.

**Blocked by:** Enforce context-firewall scopes.

- [x] The `docs` command renders aliases, enforced boundaries, adapter limitations, and the available design-review workflow from the policy.
- [x] Each rule is identified as lint-enforced, partially checked, or guidance only.
- [x] Optional domain-vocabulary and golden-example references are checked for existence without Righting judging their contents.
- [x] Generated guidance remains safe to regenerate and preserves project-owned agent instructions outside its managed block.

## 08. Guide deliberate Righting integrations

**What to build:** An agent and maintainer can use packaged integration skills to make and approve policy decisions, wire the ESLint adapter without destructive config changes, establish baseline intent, and verify the existing lint loop.

**Blocked by:** Adopt safely with a legacy-debt ratchet; Generate policy and agent guidance.

- [ ] `righting-integrate` leads aliases, scopes, approval, generated guidance, and baseline-intent decisions without inferring architecture.
- [ ] `righting-eslint` inspects the existing modern flat config, preserves its settings, adds only adapter configuration, and runs the established lint command.
- [ ] The ESLint integration reports typed-lint presence and outcome and never restructures lint commands without approval.
- [ ] Both skills conform to the Agent Skills standard without harness-specific assumptions.

## 09. Offer read-only Righting design review

**What to build:** A developer can opt into a policy-aware design review that examines the proposed behavior and relevant code, asks focused design questions, and returns evidence, risks, open questions, and static-analysis limitations without changing the project.

**Blocked by:** Generate policy and agent guidance.

- [ ] The skill reads the policy and relevant code before questioning and uses configured vocabulary and golden examples when present.
- [ ] It asks one question at a time, uses an original Righting-inspired checklist, and does not issue scores or pass/fail verdicts.
- [ ] It flags when a constraint is only partially checkable by an adapter and suggests policy changes conservatively.
- [ ] It changes no policy, CI, or project files automatically; a Markdown artifact is written only when explicitly requested.

## 10. Dogfood the complete v1 workflow

**What to build:** In a real TypeScript project, an agent and maintainer can complete the full approved Righting workflow—from deliberate integration through a repaired boundary failure—and leave CI green without a human architecture intervention.

**Blocked by:** Guide deliberate Righting integrations; Offer read-only Righting design review.

- [ ] The dogfood project completes non-interactive integration with user-approved aliases, scopes or managed area, generated guidance, and committed legacy debt where needed.
- [ ] A normal feature change encounters an actionable boundary failure in the project’s normal lint loop and is repaired using the policy or a golden example.
- [ ] The final project passes CI without a human architecture intervention.
- [ ] The dogfood record identifies evidence and open refinement questions for design review, adapter performance, composition-root scope, stronger baseline identity, and future adapters.
