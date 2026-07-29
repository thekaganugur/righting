---
name: righting-integrate
description: Integrate Righting through a concise decision brief when a maintainer wants to adopt or revise righting.json or record legacy-debt intent.
compatibility: Requires the local righting CLI.
---

# Evidence-led Righting integration

Righting records maintainer decisions. Close two working evidence ledgers before proposing a policy: **coverage** and **dependencies**. Keep the legwork behind a concise **decision brief**.

## 1. Close the evidence ledgers

Read the existing `righting.json`, root `AGENTS.md`, architecture documentation, and any configured `guidance.domainVocabulary` or `guidance.goldenExamples` references. When starter files are absent, explain that `npx righting init --json` creates only the exact incomplete policy and managed guidance pointer.

Build from a version-controlled file inventory such as `git ls-files`, not only from proposed coverage directories. Identify source and architecture-relevant executable, configuration, schema, seed, and generated files outside coverage; classify each as covered or intentionally unchecked with a reason. If the candidate may rely on uncommitted or untracked source or architecture evidence, disclose that dependency, ask which snapshot the maintainer wants evaluated, and stop. Resume candidate derivation and approval only after the maintainer confirms the snapshot.

- **Coverage ledger:** enumerate project source files and classify each as inside a proposed broad coverage rule or intentionally unchecked with a reason. Within coverage, classify each source by a canonical filename convention, a proposed project alias token, test status, generated status paired with a role or composition root, composition root, ambiguity, or `righting/unclassified-source`. Generated status never classifies source by itself. An alias records reusable project vocabulary, not an inventory or path mapping. For each coverage glob, state its future inclusion rule and list current matches. When project evidence identifies generated source that does not match an active generated convention, record the unsupported generated treatment and retain the contract's actual classification, including `righting/unclassified-source` when no independent role applies. Do not assign a role or composition root solely to hide an unsupported generated treatment.
- **Dependency ledger:** scan static `import`, `export`, `require`, and dynamic import forms from covered source. Classify each local or protected external dependency by source role, target role or treatment, and effective policy result. Record forbidden and unresolved occurrences as **observed inconsistencies**, grouped by stable `righting/...` policy-rule ID with counts and concrete locations.

Record how each ledger was produced. Label dependency-scan completeness as exhaustive or partial and state every partial boundary.

Completion: every source file has one coverage disposition; every covered source has one deterministic classification or explicit violation; every scanned dependency occurrence is classified; zero-match coverage, ambiguity, forbidden, unresolved, and partial evidence are explicit. Keep the complete ledgers as working evidence; put totals, material exceptions, and decision-relevant examples in the decision brief, and provide the full ledgers only on request.

## 2. Derive the candidate

Start with the smallest complete policy: `{"preset":"volatility@1","coverage":[...]}`. Add an alias only when project vocabulary needs exact filename-suffix or directory-segment tokens beyond the active canonical conventions. Add generated filename markers or directory segments only for evidenced generator vocabulary. For each composition-root token, list all current matches and their test/generated status; require a non-test current match or an explicit maintainer statement, because a test-only match is not production-root evidence. Add protected Resource or Utility packages, variations, overrides, and guidance references only from maintainer statements or project evidence.

Explicitly evaluate every named variation in the installed `docs/policy-language.md` as working evidence. In the decision brief, name proposed variations and only those omissions that materially affect the decision. For each override, evaluate default-policy fit, responsibility clarification or extraction, and tightening before proposing a reasoned global relaxation.

Validate the exact candidate by running the project's installed `righting inspect --json` in a temporary mirror of the project tree. Treat its `evidence.sourceSummary` counts and `evidence.sourceViolations` paths as authoritative for covered-source classification; resolve any ledger disagreement instead of recalculating or overriding them. Retain the exact `contract` and `evidence` JSON as working evidence, compare `contract.configured` and `contract.effective` with both ledgers, and reclassify the dependency ledger against that exact contract. Summarize validation in the decision brief and provide the raw inspection output only on request.

Completion: the candidate is structurally valid; every optional field has evidence; every coverage rule has known matches; aliases are convention tokens rather than path mappings; classifications are deterministic or explicitly violating; both ledgers describe the exact normalized contract.

## 3. Obtain exact approval

Present a decision brief containing:

- the recommendation and its plain-language consequence;
- the exact candidate `righting.json` and requested actions;
- coverage, observed inconsistencies, and evidence limits as totals with material exceptions or examples;
- decision-relevant optional fields or overrides; and
- files and commands that would change.

Keep exhaustive ledgers and raw inspection JSON out of the default reply; provide them on request. Ask the maintainer to approve or revise the exact candidate and requested actions. Stop at the approval request; continue only after an explicit response covering both.

## 4. Apply and verify

Apply only the approved replacement policy and setup actions. Run `npx righting init --json` when starter files or managed guidance are needed, then `npx righting inspect --json`. Compare the returned normalized contract with the approved packet and confirm the retired mapping policy and top-level inspection projections are absent. Report inspection violations as **observed inconsistencies**, not policy exceptions or source-migration work.

After policy approval, list the available guardrail adapters and recommend a compatible fit. V1 provides the optional `righting-eslint` adapter for an existing supported ESLint setup and the package-owned `righting/oxlint` adapter for exactly Oxlint 1.75.0 under the prerequisites and resolver limits in `docs/oxlint.md`; do not present either as universal. The maintainer explicitly chooses whether to activate an adapter—never invoke one automatically or infer adapter approval from policy approval.

When the maintainer chooses ESLint enforcement, hand the unchanged normalized contract to `righting-eslint`. When the maintainer chooses Oxlint enforcement, follow `docs/oxlint.md` and preserve the project's established native lint command and configuration. Verified diagnostics become **adapter findings**; obtain separate maintainer confirmation before recording approved findings as **adapter-native legacy debt**. Only a successful run of the project's normal lint command establishes active guardrails.

Finish with a compact decision brief: approved outcome, changed files, command results, remaining observed inconsistencies or evidence limits, and the optional adapter decision. Do not repeat unchanged approval evidence.
