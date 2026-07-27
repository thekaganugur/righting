# Critique of the fresh adapter replay

## Review

- **Correct:** The replay correctly separates the active project-local plugin from the proposed package-owned plugin (`replay.md:41-77`, `107-120`), does not treat `adapter.status: "unknown"` as activation (`replay.md:25`), pins the dogfood and Righting commits (`replay.md:3-5`, `81`), and bounds static evidence and resolver/host limits (`replay.md:141-147`). The old vendored package really lacks `./oxlint`, while the working install is an invalid sibling symlink; the 21 exact directives and the stated Oxlint command also match the dogfood repository. These are useful dogfood findings, not generalized skill requirements.
- **Blocker:** The replay is not yet maintainer approval-ready for the exact `role-dependency` claim because its acceptance procedure is internally impossible and its claim is not tied to an exhaustive, target-contract scenario-family ledger.

## Ranked concrete defects

### 1. Blocker — the required acceptance sequence invokes proof that the proposed scope deletes

The scope deletes `tools/righting-oxlint-plugin.test.ts` (`replay.md:119`), but the required command block still runs exactly that path (`replay.md:126-135`). The inline comment “replace with an activation/consumer smoke test” is an instruction placeholder, not an executable command. The following prose also says to retain the stale-directive and second-unsuppressed-violation proofs (`replay.md:137`), but those proofs currently live in the test being deleted (dogfood `tools/righting-oxlint-plugin.test.ts:288-336`). No replacement path, test name, fixture lifecycle, or command is specified.

This makes the requested decision and change scope non-checkable: a maintainer cannot apply the stated file operations and then run the stated required gate. It is a **model execution failure**, but the skill has a gap too: it never requires checking acceptance commands against the proposed file lifecycle.

**Smallest generalized skill change:** In the final support-record completion check, require a scope/validation consistency pass: every required command must be copy-paste runnable after the proposed adds/deletes/renames; every deleted proof must be mapped to a named surviving or replacement test; placeholders and “replace/update as needed” are not allowed in required gates. This should replace, not duplicate, the broad “all checks pass” wording at `SKILL.md:68`.

### 2. Blocker — the exact project claim is not bounded by scenario-family evidence

The replay proposes claiming complete `role-dependency` for the exact dogfood tuple (`replay.md:35`, `151`). Its evidence consists of:

- a count of 11 package Oxlint tests (`replay.md:87-96`);
- a green lint of the existing dogfood source mirror (`replay.md:98-105`); and
- a proposed replacement smoke covering one allowed edge, one forbidden edge, and one `#/*` alias (`replay.md:137`).

The underlying Righting suite does contain substantial generic conformance evidence, including all default edges (`test/oxlint.test.ts:123-137`) and the other role families. But neither the replay nor `docs/oxlint.md:77-91` supplies the required family-by-family mapping of contract fixture, native fixtures, command, allowed/forbidden statuses, and stable diagnostics. More importantly, those package tests use package fixture policies; the candidate package adapter is not shown running every required family against the captured dogfood contract. The target contract has three configured aliases, `pureEngines`, and a Client→Client override (`replay.md:27`), while the target mirror merely establishes that today’s source is green and the proposed smoke proves only one alias.

That falls short of the skill’s explicit rule to run every required family through the candidate against the exact captured contract and every configured alias (`SKILL.md:54-58`), as well as the conformance evidence contract (`docs/adapter-conformance.md:15`, `21-51`). A green real-source lint is activation/regression evidence, not exhaustive capability evidence. This is principally a **model execution failure**, not proof that the package implementation is wrong.

**Smallest generalized skill change:** Make the existing Step 5 completion criterion a mandatory approval table rather than prose: one row per applicable scenario family with `claim/contract fixture/native fixture/public command/expected and observed exit/stable diagnostic/status`. Add two explicit evidence classes: package-level conformance and target-contract activation. A claim is blocked when either required class has an incomplete row. This is a hierarchy/checkability improvement; it should replace the scattered Step 5/Step 6 record requirements rather than repeat them.

### 3. Major — the exact inspection input was summarized, not retained as reproducible evidence

The replay reports the inspection command and selected fields (`replay.md:19-29`) but provides no exact JSON, capture path, or digest. Consequently another maintainer cannot identify the precise normalized object used by the temporary mirror or reuse it as scenario input. This matters especially because the current `npx righting` resolves through the mutable sibling symlink that the replay itself identifies (`replay.md:70-77`). Re-running later is not the same as retaining the input from this run.

The skill already says “Keep the exact JSON as the test input” (`SKILL.md:13`), so omission is a **model execution failure**. The skill also weakens its own instruction: Step 1’s completion list requires only versions, path, command, and fail-closed behavior (`SKILL.md:17`), not the capture itself.

**Smallest generalized skill change:** Add “capture locator plus SHA-256 (or inline exact JSON), target repository revision, and CLI artifact identity” to Step 1 completion. Later scenario rows must reference that capture or an explicitly named isolated fixture capture. This makes evidence reproducible without prescribing a repository-specific storage location.

### 4. Major — artifact provenance and the requested artifact are ambiguous and not accepted by the proposed checks

The approval request names the exact artifact from Righting commit `66d9…` (`replay.md:13`), but the scope broadens that to “the exact Righting commit above **or a released artifact with the same verified source**” (`replay.md:109`). “Same verified source” has no verification procedure. The proposal gives no pack command, resulting tarball name, tarball digest/integrity, or immutable release identity. Its acceptance commands (`replay.md:124-135`) do not verify the source commit, package integrity, shipped `docs/oxlint.md`, or exact peer metadata. `npm ls` is insufficient because both the obsolete and candidate packages report version `0.1.0`; an activation smoke proves the export loads but not the exact requested provenance or all asserted package contents.

This is both a **model execution failure** (the exact decision is broadened later) and a **skill defect**: the clean-consumer instruction at `SKILL.md:64` allows “packed or released artifact” without requiring an immutable identity and provenance check.

**Smallest generalized skill change:** Extend the published-artifact completion criterion with one immutable artifact choice per approval request: source revision plus reproducible pack command and digest, or registry/release locator plus integrity. Record the install command and checks for the claimed public export, shipped support record, peer tuple, and lock resolution. Alternatives should be separate decision options, not an “or” inside an exact approval scope.

## Skill-level synthesis

The six-step authoring flow is technically strong, and most replay defects violate requirements already present in Steps 1, 5, and 6. The smallest improvement is therefore not more Oxlint-, alias-, vendoring-, or dogfood-specific prose. Add a compact **approval/proposal output mode** at the top, then make the final completion gate emit, in order:

1. one exact decision and immutable artifact/tuple;
2. current state versus proposed file scope;
3. the retained inspection capture;
4. the scenario-family evidence table; and
5. copy-paste post-change acceptance commands with no deleted paths or placeholders.

This supplies the missing information hierarchy and exhaustive stop condition. It also avoids adding sediment: fold the existing repeated completion statements into that ledger instead of appending another narrative checklist.

## Dogfood-only facts that should not become skill rules

- The obsolete `vendor/righting-0.1.0-569b9eb.tgz`, invalid sibling symlink, exact 21 directives, and `#/*` mapping are project evidence only.
- The unexplained standalone `npm run lint` exit-127 anomaly (`replay.md:139`) is correctly left red pending a clean rerun. It is a dogfood harness issue, not evidence of an adapter failure and not a reason to add environment-specific skill instructions.
