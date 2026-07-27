# Approved-design recording and firewall gate

Load this branch only after the complete strategic design has explicit maintainer approval, or when authoritative project records already approve it and current evidence does not materially contradict it.

## Record the approved design

Follow project-owned domain-document instructions and conventions. In their absence:

- keep one context as a root `CONTEXT.md` glossary;
- for multiple contexts, use a root `CONTEXT-MAP.md` naming each context, purpose, owner, document location, relationships, permitted sharing/translation, confidence, and open questions; and
- use one `CONTEXT.md` per context for implementation-free owned language and definitions.

Preserve useful vocabulary and surface ADR conflicts. Give non-executed migration advice covering mixed files, dependency seams, current coupling, translation or deliberately shared-model concerns, ownership/release/data risks, safe sequencing, and validation. This branch is complete when every approved context and relationship is represented in the domain documents and every known realization mismatch appears in migration advice.

## Apply the independent firewall honesty gate

A sound design does not imply firewall readiness. Produce a candidate only when every gate passes:

1. Context identities and relationships have authoritative approval.
2. Exact, non-overlapping globs map the approved identities.
3. The **classification universe** is closed: enumerate every version-controlled file matching the normalized contract's configured coverage and classify each as a named `context`, genuinely context-independent `shared`, intentional `unscoped` wiring/integration, ambiguous, or unmatched. Separately list version-controlled source-like paths outside coverage that implement an approved context; they remain an unchecked limitation.
4. Shared source imports no context, and forbidding direct context-to-context static imports now matches the approved relationships.
5. Legitimate integration is represented without hiding mixed or uncertain domain code.
6. The exact complete candidate validates with the already verified project-local Righting executable.

`shared` means deliberately context-independent source, not code used more than once. `unscoped` means intentional non-contextual composition or integration, not uncertain domain code.

The gate is complete only when every file in the classification universe appears exactly once in the classification ledger, every ambiguous or unmatched path and every observed violation is listed, source-like paths outside coverage are disclosed, and each gate has a pass/fail result. A failed gate yields `omit-for-now`, with the evidence and the decision or migration that would justify reconsideration.

## Validate without installing

Use the absolute project-local Righting executable verified during discovery. If it is unavailable, gate 6 fails; do not invoke a package manager to obtain it.

Create a temporary mirror outside the target worktree, excluding `.git` and `node_modules`. In a cleanup-guaranteed block:

1. copy the project inputs needed by configured coverage;
2. retain every existing policy field and add only the candidate fragment to the mirror's `righting.json`;
3. run `<absolute-project-local-righting-executable> inspect --json` with the mirror as the working directory; and
4. capture the command, exit status, normalized contract, source summary, source violations, and warnings.

Remove the mirror in the cleanup block whether validation passes or fails. Report the exact candidate, the complete temporary policy, executable provenance, command/status, inspection evidence, classification ledger, out-of-coverage limitations, ambiguity, unmatched paths, and violations. The target `righting.json` remains unchanged.

## Capability statement

`contextFirewall` can establish configured static cross-context and shared-to-context source-import restrictions. It does not establish runtime behavior, data or deployment isolation, organizational ownership, migration completion, or design quality. A later policy-adoption workflow must revalidate and obtain approval for the complete `righting.json`.
