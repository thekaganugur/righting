# Reframe adoption and agent handoff

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 07

## Question

How should onboarding, `righting-integrate`, inspection, and adapter handoff present the lifecycle of target policy, convention coverage, existing inconsistencies, adapter-native grandfathering, and active guardrails without treating adoption as a source migration?

## Answer

Use one explicit, evidence-strengthening lifecycle with maintainer-owned approvals:

1. `righting-integrate` owns policy shaping, the exact approval packet, and normalized-contract verification. Policy approval may complete with observed inconsistencies still visible; existing code does not become a policy exception or force adoption to become a source migration.
2. Coding agents consume the exact normalized contract through `righting inspect --json`, rather than independently interpreting `righting.json` or copying resolved rules into managed guidance. Inspection reports adapter activation as unknown and makes no enforcement claim.
3. After approval, always list the currently available guardrail adapters and recommend a compatible fit. The maintainer explicitly chooses whether to invoke one; there is no automatic handoff. V1 ships only `righting-eslint`, but onboarding must not present ESLint as universal.
4. A chosen adapter consumes the normalized contract unchanged. For ESLint, `righting-eslint` owns technical configuration and lint verification while the maintainer separately approves the exact adapter patch and any native legacy-debt adoption.
5. Name evidence according to what has been established: an integration scan produces an **observed inconsistency**, a verified adapter produces an **adapter finding**, and maintainer-approved native suppression produces **adapter-native legacy debt**. Only a successful run of the project's normal lint command establishes active ESLint guardrails.
6. Keep adapter discovery future-friendly. A possible `write-righting-adapter` skill deserves a separate future investigation once an adapter-authoring contract exists; it is not an available v1 adapter or part of this delivery.
