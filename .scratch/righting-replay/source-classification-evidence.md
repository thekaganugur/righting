# Source-classification evidence finding

Status: implemented

## Problem

A structurally valid candidate policy can disagree with an agent-written coverage ledger. The final replay claimed zero unclassified files even though `classifySource` returned `righting/unclassified-source` for one covered file.

## Accepted direction

Keep the normalized contract unchanged. Extend `righting inspect --json` with current-repository evidence produced by applying the existing pure `classifySource(contract, path)` helper to the files that inspection already enumerates.

Return a compact source summary and concrete source-classification violations outside `contract`. The integration skill must use those mechanical counts and violations rather than independently asserting them.

## Boundaries

This evidence is a repository snapshot, not contract data. It does not infer architectural responsibility, decide whether files outside coverage are intentionally unchecked, scan imports, classify dependency edges, inspect adapter activation, or prove runtime behavior.

Dependency parsing and resolution belong to guardrail adapters or dedicated tools such as dependency-cruiser, not Righting core or policy inspection. Righting may ship another adapter later, and users may build an independent adapter—manually or with an agent—against the normalized contract.
