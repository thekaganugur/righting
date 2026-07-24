---
name: righting-integrate
description: Integrate Righting when a maintainer wants to adopt or revise righting.json or record legacy-debt intent.
compatibility: Requires the local righting CLI.
---

# Evidence-led Righting integration

Righting records maintainer decisions. Close two evidence ledgers before proposing a policy: **coverage** and **dependencies**.

## 1. Close the evidence ledgers

Read the existing `righting.json`, root `AGENTS.md`, architecture documentation, and any configured `guidance.domainVocabulary` or `guidance.goldenExamples` references. When starter files are absent, explain that `npx righting init --json` creates only the exact incomplete policy and managed guidance pointer.

Build from a version-controlled file inventory such as `git ls-files`, not only from proposed coverage directories. Identify source and architecture-relevant executable, configuration, schema, seed, and generated files outside coverage; classify each as covered or intentionally unchecked with a reason.

- **Coverage ledger:** enumerate project source files and classify each as inside a proposed broad coverage rule or intentionally unchecked with a reason. Within coverage, classify each source by a canonical filename convention, a proposed project alias token, test status, generated status paired with a role or composition root, composition root, ambiguity, or `righting/unclassified-source`. Generated status never classifies source by itself. An alias records reusable project vocabulary, not an inventory or path mapping. For each coverage glob, state its future inclusion rule and list current matches. When project evidence identifies generated source that does not match an active generated convention, record the unsupported generated treatment and retain the contract's actual classification, including `righting/unclassified-source` when no independent role applies. Do not assign a role or composition root solely to hide an unsupported generated treatment.
- **Dependency ledger:** scan static `import`, `export`, `require`, and dynamic import forms from covered source. Classify each local or protected external dependency by source role, target role or treatment, scope, and effective policy result. Group forbidden and unresolved occurrences by stable `righting/...` policy-rule ID, retaining counts and concrete locations.

Record how each ledger was produced. Label dependency-scan completeness as exhaustive or partial and state every partial boundary.

Completion: every source file has one coverage disposition; every covered source has one deterministic classification or explicit violation; every scanned dependency occurrence is classified; zero-match coverage, ambiguity, forbidden, unresolved, and partial evidence are explicit.

## 2. Derive the candidate

Start with the smallest complete policy: `{"preset":"volatility@1","coverage":[...]}`. Add an alias only when project vocabulary needs exact filename-suffix or directory-segment tokens beyond the active canonical conventions. Add generated filename markers or directory segments only for evidenced generator vocabulary. For each composition-root token, list all current matches and their test/generated status; require a non-test current match or an explicit maintainer statement, because a test-only match is not production-root evidence. Add protected Resource or Utility packages, scopes, variations, overrides, and guidance references only from maintainer statements or project evidence.

Explicitly evaluate every named variation in the installed `docs/policy-language.md` and record an evidence-backed `propose` or `omit` disposition. For each override, evaluate default-policy fit, responsibility clarification or extraction, and tightening before proposing a reasoned global relaxation.

### `contextFirewall`

Keep this check small and report two independent results:

- **Policy readiness:** propose it only when maintainer statements or project-owned architecture documentation already identify context boundaries and relationships that map unambiguously to context, shared, and unscoped paths. Otherwise omit the variation and scopes; omission does not make Righting adoption incomplete. A single-context declaration settles current readiness only; it does not establish that the existing boundary is good.
- **Design suggestion:** use already gathered architecture, vocabulary, ownership, and dependency evidence to note possible boundary pressure, such as conflicting models or terms, unclear shared ownership, or recurring cross-area coupling. These observations may justify a bounded-context specialist; recommend it only as an optional next step when the existing boundaries deserve reassessment. Do not invoke it, conduct context discovery, or block the rest of Righting adoption. Do not infer or derive context policy from directories, folder names, paths, the import graph, or domain vocabulary alone.

For each result, report the recommendation, evidence, and material pros and cons. When maintainer input is needed, ask one question at a time and keep it short.

Validate the exact candidate by running the project's installed `righting inspect --json` in a temporary mirror of the project tree. Treat its `evidence.sourceSummary` counts and `evidence.sourceViolations` paths as authoritative for covered-source classification; resolve any ledger disagreement instead of recalculating or overriding them. Retain the exact `contract` and `evidence` JSON returned by inspection and include them verbatim in the approval packet; a prose projection or renamed summary does not satisfy exact validation. Compare the returned `contract.configured` provenance and `contract.effective` semantics with both ledgers. Reclassify the separately produced dependency ledger against that exact contract.

Completion: the candidate is structurally valid; every optional field has evidence; every coverage rule has known matches; aliases are convention tokens rather than path mappings; classifications are deterministic or explicitly violating; both ledgers describe the exact normalized contract.

## 3. Obtain exact approval

Present one approval packet containing:

- the exact candidate `righting.json` and normalized contract;
- each variation's `propose` or `omit` disposition and evidence;
- each override's evidence and alternatives considered;
- covered and intentionally unchecked source areas, including each glob's future inclusion rule;
- aliases, composition roots, test/generated treatment, ambiguities, and unclassified source;
- forbidden or unresolved dependencies with counts and locations;
- the contract's evidence limits and the separate unknown adapter status;
- files and commands that would change; and
- any separately requested adapter, legacy-debt, baseline, or commit scope.

Ask the maintainer to approve or revise that exact packet. Stop at the approval request; continue only after an explicit response covering the policy and requested actions.

## 4. Apply and verify

Apply only the approved replacement policy and setup actions. Run `npx righting init --json` when starter files or managed guidance are needed, then `npx righting inspect --json`. Compare the returned normalized contract with the approved packet and confirm the retired mapping policy and top-level inspection projections are absent.

When enforcement is separately approved, hand the unchanged policy to `righting-eslint`. When legacy-debt adoption is separately approved, follow the [legacy-debt reference](../../docs/legacy-debt.md) with the approved base ref and reason.

Report approved decisions, ledger summaries, changed files, command outcomes, contract differences, and remaining evidence limits.
