---
name: righting-integrate
description: Integrate Righting when a maintainer wants to adopt or revise righting.json or record legacy-debt intent.
compatibility: Requires the local righting CLI.
---

# Evidence-led Righting integration

Righting records maintainer decisions. Close two evidence ledgers before proposing a policy: **coverage** and **dependencies**.

## 1. Close the evidence ledgers

Read the existing `righting.json`, root `AGENTS.md`, architecture documentation, and any configured domain-vocabulary or golden-example references. When starter files are absent, explain that `npx righting init --json` creates only the incomplete policy and managed guidance pointer; when righting is not yet installed, make its installation one of the requested actions.

Build:

- **Coverage ledger:** enumerate every project source file and classify it as mapped to one alias and canonical role, or intentionally unchecked with a reason. Name production entry points, composition roots, generated files, and tests separately. For each proposed glob, record its intended future inclusion rule and expand its current matches; the expansion must contain only files the rule intends.
- **Dependency ledger:** scan every static `import`, `export`, `require`, and dynamic import from files the candidate would map. Classify each local or protected external dependency by source role, target role, and effective policy result, same-role edges included. Group forbidden and unresolved occurrences by role edge, retaining counts and concrete file locations.

Record how each ledger was produced. Label dependency-scan completeness as exhaustive or partial and state every partial boundary.

Completion: every source file appears once in the coverage ledger; every glob expresses its stated future inclusion rule; every scanned dependency occurrence is classified; zero-match, multi-match, forbidden, unresolved, and partial evidence are explicit.

## 2. Derive the candidate

Derive each alias, mapping, protected Resource or Utility package, scope, and optional reference from a maintainer statement or project evidence. Explicitly evaluate every named variation in the policy reference (`docs/policy-language.md` in the installed righting package) and record an evidence-backed `propose` or `omit` disposition; proposal evidence precedes maintainer approval.

For each override, evaluate the default policy first, then responsibility clarification or extraction, then tightening. Record those alternatives and propose the override only when they do not express the evidenced policy-wide decision.

Render the smallest exact replacement `righting.json`. Validate it by running the project's installed `righting inspect --json` with a temporary mirror of the project's file tree as the working directory — the same relative paths with empty contents suffice — so structure, glob matches, ambiguity, and extras existence resolve against the project without changing it. Compute its effective role relationships and reclassify the dependency ledger against that exact candidate.

Completion: the candidate is structurally valid; every field and variation disposition has recorded evidence; every override records the alternatives considered; every alias has a mapping; every path has known matches; no file matches roles ambiguously; both ledgers describe the exact candidate.

## 3. Obtain exact approval

Present one approval packet containing:

- the exact candidate `righting.json` and its effective role relationships;
- each named variation's `propose` or `omit` disposition and evidence;
- each override's evidence and alternatives considered;
- mapped and intentionally unchecked source areas, including each glob's future inclusion rule;
- every forbidden or unresolved role edge, with occurrence count and concrete locations;
- the inspection limits: coverage is limited to declared paths, and a valid policy establishes neither approval, adapter activation, nor runtime behavior;
- the files and commands that would change;
- any separately requested adapter, legacy-debt, baseline, or commit scope.

Ask the maintainer to approve or revise that exact packet. Stop at the approval request; continue only after an explicit response covering the policy and requested actions.

Completion: the maintainer has explicitly approved the exact policy and each additional action that will be performed.

## 4. Apply and verify

Apply only the approved replacement policy and setup actions. Run `npx righting init --json` when starter files or managed guidance are needed, then run `npx righting inspect --json`. Compare normalized configuration, effective relationships, declared-path coverage, capability records, and adapter status with the approved packet.

When enforcement is separately approved, hand the unchanged policy to `righting-eslint`. When legacy-debt adoption is separately approved, follow the [legacy-debt reference](../../docs/legacy-debt.md) with the approved base ref and reason.

Report the approved decisions, ledger summaries, changed files, command outcomes, inspection differences, and remaining evidence limits.

Completion: project files match the approved scope, inspection matches the approved policy, and every command outcome and evidence limit is recorded.
