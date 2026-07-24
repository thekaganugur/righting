## Review
- **Blocker — replay-model minimality:** `replay.md` proposes `service-worker` in `compositionRoots`, but no covered production file has that basename. The real worker is the intentionally uncovered `public/service-worker.js:1-54`, registered by `src/components/device-enrollment.component.tsx:60-63`. Under installed Righting's `classifySource`, the token instead classifies `src/service-worker.test.ts:1` as a composition root. Remove `service-worker`; it is unnecessary and falsely presents an uncovered JavaScript asset as covered wiring.
- **High — replay-model evidence gap:** The outside-coverage ledger does not dispose of executable `public/service-worker.js:1-54` (nor `seeds/local-dev.sql`), despite claiming source outside coverage is intentionally accounted for. It also omits `wrangler.jsonc`, which is the deployment configuration that makes `src/worker.ts` the entry point (`wrangler.jsonc:10`). Approval should name these exclusions and their rationale.
- **Medium — replay-model attestation gap:** The packet presents the raw candidate and a prose summary, not the exact normalized `contract` and `evidence` JSON claimed to be authoritative. Reproduction using installed `righting/core` confirms the stated effective default graph and source result, but the packet itself cannot support its “exact configured provenance” assertion without that output (or a retained command/output artifact).
- **Correct — mechanical classification:** Reproducing the candidate against HEAD `da1d55ef` with installed Righting yields 69 covered files: Client 23, Manager 9, Engine 22, ResourceAccess 9, Utility 1, composition roots 5, and one outside-coverage CSS file; no unclassified/ambiguous source occurs. Thus the new mechanical source evidence does fix the prior unclassified-source inconsistency. `routeTree` is necessary: `src/routeTree.gen.ts:1-10` is generated and non-role, while `src/router.tsx:1-7` imports it. `router` is independently evidenced by that TanStack router construction; `worker` is independently evidenced by `wrangler.jsonc:10` and `src/worker.ts:1`.
- **Note — why four tokens produce five roots:** Righting derives the basename through the first dot before checking composition roots. Consequently `worker` matches both `src/worker.ts` and `src/worker.test.ts`; `service-worker` matches `src/service-worker.test.ts`; `router` and `routeTree` match one each. The five are `src/worker.ts`, `src/worker.test.ts`, `src/service-worker.test.ts`, `src/router.tsx`, and `src/routeTree.gen.ts`. Test status remains true for the two test roots, so the reported 24-test total is not contradicted.
- **Righting product assessment:** No confirmed Righting defect. This behavior follows the installed `node_modules/righting/dist/src/policy.js` classifier’s documented extensionless-token implementation; it is the replay’s unsupported `service-worker` token and incomplete disposition ledger that create the approval problem. Adding product features to classify `public/service-worker.js`, or special-casing this repository’s root names, would overfit. A future generic documentation clarification about tokens matching test basenames could be useful but is not required for this approval.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Ranked findings cite replay.md, public/service-worker.js, src/components/device-enrollment.component.tsx, src/worker.ts, src/router.tsx, src/routeTree.gen.ts, wrangler.jsonc, and installed Righting classifier behavior."
    }
  ],
  "changedFiles": [
    "/Users/kgnugur/Codes/Personal/righting-software-tooling/.scratch/righting-replay/verification/critique.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "node --input-type=module (normalize/classify exact candidate with righting/core)",
      "result": "passed",
      "summary": "Reproduced 69 covered, five composition roots, and zero unclassified/ambiguous sources."
    },
    {
      "command": "git rev-parse HEAD and tracked-source inspection",
      "result": "passed",
      "summary": "Verified HEAD da1d55ef and identified uncovered public/service-worker.js and seeds/local-dev.sql."
    }
  ],
  "validationOutput": [
    "The candidate’s source-classification counts reproduce with the installed Righting package.",
    "The candidate is not minimally evidenced because service-worker only matches a covered test."
  ],
  "residualRisks": [
    "Approval is not ready until service-worker is removed and all outside-coverage executable/data artifacts are explicitly disposed.",
    "The packet lacks retained exact normalized contract/evidence JSON."
  ],
  "noStagedFiles": true,
  "diffSummary": "Review-only DOGFOOD inspection; only the required external critique artifact was written.",
  "reviewFindings": [
    "blocker: replay.md compositionRoots - service-worker has no covered production-root evidence and classifies src/service-worker.test.ts instead.",
    "high: replay.md coverage ledger - public/service-worker.js and seeds/local-dev.sql are outside coverage without a stated disposition.",
    "medium: replay.md normalized-contract section - it summarizes rather than presents exact normalized contract/evidence output.",
    "no confirmed Righting product defect; further repository-specific product changes would overfit."
  ],
  "manualNotes": "No DOGFOOD repository files were modified."
}
```