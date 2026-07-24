## Review

### Correct
- Round 2 materially improves on baseline and round 1: it has the correct 69 covered TS/TSX files and 24 test-marked files (`.scratch/righting-replay/round-2/replay.md:48-61`), removes round 1's unsupported global `clientReadsAccess`, `pureEngines`, and `web-push-neo` decisions, and records evidence-backed omissions (`replay.md:93-98`).
- Configurable generated markers and generated composition roots are now implemented and documented (`src/policy.ts:751-766`; `docs/policy-language.md:69-70`). The `.gen.` marker is evidence-based for `src/routeTree.gen.ts`.
- The listed forbidden-edge groups total 21 (7 + 10 + 1 + 1 + 2) and their paths match recorded dogfood HEAD `da1d55ef9685e604aa911f1c50dc3c7cfb2e0c3e` (`replay.md:83-89`). The packet correctly keeps the adapter status separate and unknown (`replay.md:102-104`).

### Ranked defects
1. **Blocker — replay model: the exact candidate leaves `src/routeTree.gen.ts` unclassified, contrary to the coverage and dependency ledgers.**
   - The policy configures `.gen.` but omits `routeTree` from `compositionRoots` (`.scratch/righting-replay/round-2/replay.md:22-23`). It nevertheless calls the file a Generated treatment, claims zero unclassified files, treats its five imports as generated wiring, and claims zero `righting/unclassified-source` occurrences (`replay.md:60,63,74,89`).
   - Under the exact candidate, `classifySource()` finds no role, then no composition root, and returns `righting/unclassified-source` (`src/policy.ts:754-771`). Direct normalization/classification of the exact JSON returned `{ "kind": "violation", "ruleId": "righting/unclassified-source" }` for `src/routeTree.gen.ts`.
   - `src/routeTree.gen.ts:11-13,79-80` imports route and router wiring, so `routeTree` has independent composition-root evidence. Add `"routeTree"` to the candidate's `compositionRoots`; the current implementation then preserves generated/non-editable composition-root semantics (`src/policy.ts:765-766`). Do not approve the packet as exact until the ledger is regenerated. **This is a replay-model error, not a Righting defect:** round 2's intended Righting feature already supports this case.

2. **Medium — replay model: the unchecked-source ledger is incomplete.**
   - The skill requires every project source file to have a coverage disposition (`skills/righting-integrate/SKILL.md:17-22`). The purported unchecked-source inventory (`replay.md:65`) omits `seeds/local-dev.sql`, although recorded `package.json:23` executes it through `db:seed:local`. It is neither covered nor given an intentional-unchecked reason.
   - This is a regression from round 1, which explicitly listed that seed. Record it (and its D1 seed/tooling rationale) before claiming the ledger is closed. **Owner: replay model; not Righting.**

3. **Medium — replay process: the packet misstates dogfood-worktree hygiene.**
   - It says the candidate was validated only in a temporary mirror and the untracked skill directory was pre-existing (`replay.md:102-105,139-147`). Its own post-run record instead shows `?? .agents/skills/righting-integrate` (`.scratch/righting-replay/round-2/dogfood-post-replay.txt:1-3`) and cleanup explicitly removed it (`round-2/reset-after.log:1-2`).
   - Final cleanup restored the requested HEAD and left no staged files, so this is not a persistent dogfood change. But a transient target-worktree mutation is contrary to the stated validation path and must be disclosed. **Owner: replay model/process; not Righting.**

### Recommendation
**Stop; do not make another generalized Righting change from this replay.** The only blocker is repaired by using the already-added configurable generated marker together with the independently evidenced `routeTree` composition-root token. Changing Righting to introduce another standalone generated-source treatment would be unnecessary for this dogfood case and risks overfitting. Re-run the exact-candidate classification after that packet correction instead.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Three ranked concrete findings cite replay, skill, Righting implementation, and recorded dogfood paths with blocker/medium severity."
    }
  ],
  "changedFiles": [
    ".scratch/righting-replay/round-2/critique.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "node --input-type=module (normalize exact round-2 policy and classify representative paths)",
      "result": "passed",
      "summary": "Confirmed src/routeTree.gen.ts is righting/unclassified-source under the exact candidate; router and worker are composition roots."
    },
    {
      "command": "npm test",
      "result": "passed",
      "summary": "39 Righting tests passed."
    },
    {
      "command": "git -C /Users/kgnugur/Codes/Personal/uets-to-task ls-tree -r --name-only da1d55ef -- src | count TS/TSX and test-marked files",
      "result": "passed",
      "summary": "Verified 69 covered TS/TSX files and 24 test-marked files."
    },
    {
      "command": "git diff --check && git diff --cached --check; git -C /Users/kgnugur/Codes/Personal/uets-to-task rev-parse HEAD && git diff --cached --name-only",
      "result": "passed",
      "summary": "No whitespace errors or staged files; dogfood HEAD matches da1d55ef9685e604aa911f1c50dc3c7cfb2e0c3e."
    }
  ],
  "validationOutput": [
    "Round 2 fixes the prior generated-convention capability gap, but its exact policy omits the independently supported routeTree composition-root token.",
    "The exact candidate therefore has one unclassified covered source and cannot support its zero-unclassified or exhaustive dependency-ledger claims."
  ],
  "residualRisks": [
    "No ESLint adapter/resolver was activated or tested; CSS ?url behavior remains unverified.",
    "The proposed Client-to-Client global allowance still requires explicit maintainer approval.",
    "The current packet omits an unchecked disposition for seeds/local-dev.sql."
  ],
  "noStagedFiles": true,
  "diffSummary": "Review-only except for the required critique artifact; no Righting or dogfood source files were modified.",
  "reviewFindings": [
    "blocker: .scratch/righting-replay/round-2/replay.md:22-23,60,63,74,89 - routeTree.gen.ts is unclassified under the exact candidate.",
    "medium: .scratch/righting-replay/round-2/replay.md:65 - seeds/local-dev.sql lacks an intentional-unchecked coverage disposition.",
    "medium: .scratch/righting-replay/round-2/replay.md:102-105 - transient dogfood skill-link mutation is described as pre-existing/mirror-only."
  ],
  "manualNotes": "Recommendation is to correct and replay the packet, not to make a further generalized Righting change."
}
```