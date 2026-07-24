## Review

### Correct
- Round 1 fixes baseline’s coverage arithmetic: the recorded dogfood HEAD has 69 covered `src/**/*.ts{,x}` files and 24 test-marked files, matching `replay.md:56-66`. Baseline’s 68/27 claims were wrong.
- The generated-source fix is applied correctly. `replay.md:68` explicitly retains the actual composition-root classification of `src/routeTree.gen.ts` and records that `.gen.` is unsupported. The file independently wires routes (`src/routeTree.gen.ts:10-12`), so this does not violate the revised skill’s prohibition on assigning a root solely to hide generated treatment (`skills/righting-integrate/SKILL.md:17`).
- The 20 listed remaining forbidden edges follow the proposed effective graph; the reduced count from baseline’s 53 is a policy change (Client → Client, Client → ResourceAccess), not a claimed source repair.

### Ranked defects
1. **High — replay model: the asserted normalized contract is not the contract returned by Righting** (`.scratch/righting-replay/round-1/replay.md:92-127`). The shown `effective.compositionRoots`, singular `protectedDependencyRule`, `applicableCapabilities`, and `inactiveCapability` fields do not exist in the normalized contract. Core returns `effective.conventions.compositionRoots`, `protectedDependencyRules`, and `capabilities` (`src/policy.ts:586-687`). Direct normalization of the proposed policy confirmed those real keys. This fails the skill’s requirement to present the normalized contract for the exact candidate (`SKILL.md:30-31`). Replace the projection with the complete returned `contract`, or explicitly label a faithful excerpt without inventing field names.

2. **Medium — replay model: two global variations are justified only by a local implementation detail, not a documented project-wide decision** (`replay.md:44-45`). `clientReadsAccess` permits *every* Client, including all `src/components`, to import ResourceAccess, but its only evidence is one ResourceAccess import in `src/routes/index.tsx:9-14`, inside a `createServerFn` handler (`src/routes/index.tsx:50-57`). `pureEngines` changes the default graph even though the cited evidence is only the current absence of Engine → ResourceAccess imports; `AGENTS.md:7-12` assigns engines decisions and access data/transport but does not require purity. Baseline correctly recorded the absent maintainer commitment (`baseline/replay.md:72-74`); no dogfood documentation changed at the fixed HEAD. These are valid *options for explicit approval*, but are not evidence-backed recommendations yet. Omit them pending a maintainer statement, or state their global consequences and ask for a separate decision. This is not a Righting correctness defect: the documented variations intentionally have global role semantics.

3. **Medium — replay process: it transiently changed the dogfood worktree while claiming the untracked skill link pre-existed and no project file was modified** (`replay.md:136,153,182`). Round 1’s own post-replay record has `?? .agents/skills/righting-integrate`, and `round-1/reset-after.log` removes it. Baseline’s cleanup had already removed the same link (`baseline/reset-after.log`), so it was not pre-existing for the round-1 replay. Final cleanup restored the requested HEAD and manifests, but validation should have occurred only in the temporary mirror and the packet should disclose the transient `init --skills`-style mutation.

4. **Medium — Righting defect/capability gap, correctly disclosed rather than caused by the replay: generated conventions cannot represent this repository’s generated route tree** (`src/policy.ts:141,727-733`; `src/routeTree.gen.ts:5-8`; `AGENTS.md:21`). Righting hard-codes only `.generated.` and `generated/`; `.gen.` cannot be configured, and a generated composition root is deliberately impossible because root classification requires `!generated`. Consequently the actual classification is editable `{ kind: "composition-root", generated: false }`, despite repository guidance forbidding edits. This is a Righting limitation, not a model hallucination in round 1; `replay.md:68,178` reports it accurately.

### Highest-impact generalized Righting fix
Make generated-source conventions configurable and permit a generated composition root to retain `generated: true` / `editable: false` while keeping composition-root dependency behavior. This addresses common generator naming (including TanStack Router’s `.gen.`) without forcing integrations to misrepresent generated wiring as editable or to invent a role.

### Residual risks
- No enforcement adapter was activated or tested against the exact candidate; the CSS `?url` local import at `src/routes/__root.tsx:4` remains only AST-ledger treatment, not an adapter result.
- The optional global variations and Client → Client override need explicit maintainer approval; structural `inspect` validity is not approval.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Four ranked concrete findings cite replay, installed Righting, and dogfood paths with severities and independently verified contract behavior."
    }
  ],
  "changedFiles": [
    ".scratch/righting-replay/round-1/critique.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "npm test",
      "result": "passed",
      "summary": "38 Righting tests passed, including the round-1 unsupported-generated-treatment skill test."
    },
    {
      "command": "node --input-type=module (normalize exact proposed policy and classify representative dogfood paths)",
      "result": "passed",
      "summary": "Confirmed actual effective contract keys and that src/routeTree.gen.ts is an editable, non-generated composition root."
    },
    {
      "command": "git -C /Users/kgnugur/Codes/Personal/uets-to-task rev-parse HEAD; git status --short; git diff --cached --name-only",
      "result": "passed",
      "summary": "Dogfood HEAD is da1d55ef9685e604aa911f1c50dc3c7cfb2e0c3e and has no staged or unstaged files."
    },
    {
      "command": "git ls-tree -r --name-only da1d55ef -- src | count TypeScript/TSX and .test. files",
      "result": "passed",
      "summary": "Verified 69 covered TypeScript/TSX files and 24 test-marked files."
    }
  ],
  "validationOutput": [
    "Round 1 correctly repairs baseline coverage/test counts and transparently records the unsupported .gen. treatment.",
    "The replay's displayed normalized-contract JSON does not match Righting core's schema."
  ],
  "residualRisks": [
    "Exact-candidate adapter behavior, including the CSS ?url import, was not evaluated.",
    "Global variation decisions remain pending explicit maintainer approval.",
    "Righting cannot faithfully classify generated composition roots using non-built-in generator naming."
  ],
  "noStagedFiles": true,
  "diffSummary": "Review-only: created the required critique artifact; no Righting or dogfood source files were modified.",
  "reviewFindings": [
    "high: .scratch/righting-replay/round-1/replay.md:92-127 - displayed normalized contract invents/renames effective fields.",
    "medium: replay.md:44-45 - global clientReadsAccess and pureEngines proposals lack project-wide policy evidence.",
    "medium: src/policy.ts:141,727-733 - generated .gen. composition roots cannot be represented faithfully."
  ],
  "manualNotes": "The final dogfood worktree and both indexes had no staged files. The only written file is the required critique artifact."
}
```