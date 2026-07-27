# Round 1 critique

## Review

- **Correct:** The replay makes one explicit decision and withholds the current complete claim (`replay.md:3`, `replay.md:174-176`). It cleanly separates immutable/current evidence (`replay.md:5-110`), proposed changes (`replay.md:112-131`), future acceptance (`replay.md:133-147`), and observed versus unrun checks (`replay.md:156-168`).
- **Correct:** The trust-boundary evidence is unusually strong: target revision, adapter/test blobs, vendor digest and lock integrity, exact inspection capture and hash, native tuple, and public entry point are all recorded (`replay.md:7-27`). The unmapped-`#` bypass is both black-box reproduced and tied to current source (`replay.md:101-108`), so withholding `role-dependency` is justified.
- **Correct:** Capability disposition is complete for every capability in the capture and does not widen the normalized claims (`replay.md:149-154`). The replay also correctly distinguishes activation evidence from `adapter.status: "unknown"` (`replay.md:11`).
- **Blocker:** Do not approve the proposed three-file hardening yet. The replay skipped the smallest existing supported path and proposes retaining a duplicate 267-line adapter runtime plus its duplicate conformance suite.
- **Blocker:** The packet does not contain the scenario-family matrix or final-tree executable gate required by the skill it is replaying.
- **Blocker:** The current `SKILL.md` edit leaves Righting's own package-documentation test red.

## Ranked fixes worth making now

### 1. Re-evaluate adoption of the existing supported `righting/oxlint` adapter before hardening the duplicate

**Classification: model miss, with a small skill defect that allowed it.**

The replay notices `righting/oxlint` but dismisses it solely because the old locked archive does not contain that export (`replay.md:13-17`). That establishes only that the project cannot change `.oxlintrc.json` while keeping the old archive. It does not establish that continuing to own the project-local runtime is the smallest proposal.

Current Righting already has an immutable supported implementation at committed revision `66d9c4e`: `package.json:9-12` exports `./oxlint`; `docs/oxlint.md:52-91` records the exact Oxlint 1.75.0 tuple and complete support claim; `src/oxlint.ts:57-102,150-190` contains the same envelope, host-version, unsupported-capability, and fail-closed resolver hardening proposed in `replay.md:116-126`; and `test/packed-oxlint.test.ts:12-76` proves a packed consumer loads `righting/oxlint` through its normal lint command. These files have immutable HEAD blobs even though the working tree has an unrelated modified skill. A modified checkout does not make `git show HEAD:<path>` non-immutable.

The approval packet should first evaluate one source-revision-plus-pack-digest candidate that contains this supported export, then test it against the target capture and normal command. If that passes, the ponytail result is to upgrade the vendored Righting artifact, activate `righting/oxlint`, and retire the duplicate runtime/proof rather than copy the package implementation back into three project files. Because the old and new artifacts both report `0.1.0`, the candidate must be identified by source revision plus pack command/digest, not package version alone. Only retain the local hardening option if this consumer test exposes a concrete gap.

**Smallest generalized skill edit:** add one short “reuse before authoring” completion gate before the compose/own seam:

> Inspect the immutable installed artifact and available approved candidate artifacts for an adapter that already supports the target host and tuple. Prefer activation or upgrade; propose owned runtime only after recording the black-box gap that prevents reuse.

This is the missing first rung. The existing composition guidance at `skills/write-righting-adapter/SKILL.md:27-42` starts too late—after the model has already decided an adapter must be authored.

### 2. Replace aggregate prose with the required family ledger and a genuinely copy-paste final-tree gate

**Classification: model miss; the skill already says what to do.**

`skills/write-righting-adapter/SKILL.md:46-50` explicitly requires one row per applicable family, passed/required status, named replacement proofs, and commands runnable against the final tree. The replay supplies an implementation wish list (`replay.md:123-126`) and a command-level observation table (`replay.md:158-168`), not a family ledger.

The evidence supports this current status, which the packet should state explicitly:

| Conformance family | Current status supported by replay |
| --- | --- |
| `default-role-edges` | Passed for all 36 pairs of the captured effective graph; rerun required on the final artifact. |
| `static-dependency-forms` | Partial: main forms and `#/` exercised; named/star distinction, extension/index, and fail-closed alias cases are missing or failing. |
| `canonical-and-alias-classification` | Partial: canonical role suffixes occur in the edge test, but all canonical directory forms and the `page`/`component`/`lib` alias forms are not separately proved. |
| `policy-variations-and-protected-dependencies` | Partial: the target effective graph includes `pureEngines` and an override, but named isolated captures are absent; protected dependency is inapplicable and must remain explicitly unsupported. |
| `declared-coverage` | Partial: outside source is represented, but both crossing directions are not recorded as a family row. |
| `source-classification-violations` | Current unclassified and ambiguous examples pass; rerun required on the final artifact. |
| `test-source-treatment` | Partial: filename treatment is covered; configured directory treatment is not. |
| `generated-source-and-composition-roots` | Partial: representative generated/root behavior exists; complete filename/directory and exact-token treatment is not proved. |
| `context-firewall` | Not applicable and not claimed; an applicable contract must exercise the proposed load rejection. |
| Native suppression (separate evidence) | Partial: dependency suppression and stale detection pass; file-classification suppression is missing. |

The acceptance block also omits `npm ci`, `readlink`, and `npm ls` from the fenced commands despite making them prerequisites in prose (`replay.md:135-145`). The “clean consumer-style temporary fixture” has no setup command or named test (`replay.md:147`), and replacing four tests is not mapped to named surviving/replacement tests. Thus a maintainer cannot copy-paste the complete gate or verify the proposed final tree without inventing steps.

No generalized skill expansion is warranted here: the current completion criterion is already specific and exhaustive. Fix the replay, not the skill.

### 3. Restore the skill's tested conformance/support boundaries before accepting its edit

**Classification: skill defect.**

The edit renumbered and merged the old conformance and support-record sections (`skills/write-righting-adapter/SKILL.md:44-72`) without updating the package's assertions, and it removed explicit requirements those assertions protect. Running:

```sh
node --test dist/test/package-documentation.test.js
```

produced 2 passes and 1 failure: the packed-package test sliced an empty conformance section and failed `/allowed and forbidden/`. The source assertions still expect the old section boundaries and explicit content at `test/package-documentation.test.ts:135-152`, including allowed/forbidden outcomes, exact runtime-host verification, scenario fixture/command/status evidence, and clean packed public-specifier loading.

**Smallest generalized skill edit:** keep “Run black-box conformance” and “Leave an honest support record” as distinct steps with their existing checkable completion criteria; insert the approval gate as a conditional subsection before implementation rather than renumbering/merging those steps. Restore the explicit “allowed and forbidden outcomes” and “verify exposed runtime version” language. This preserves one responsibility per step and returns the existing contract test to green without weakening it.

## Evidence-to-change traceability

Most proposed mechanics have evidence, but the packet does not show the mapping:

- Full inspection-envelope validation is supported by current source checking only `contractVersion` (`replay.md:110`; `../uets-to-task/tools/righting-oxlint-plugin.mjs:7-18`).
- Fail-closed unmatched `#` handling is directly reproduced (`replay.md:101-108`).
- Exact/wildcard precedence and unsupported target handling are conformance requirements, but the replay does not present the current `aliasPath()` insertion-order/string-target source evidence alongside that scope (`../uets-to-task/tools/righting-oxlint-plugin.mjs:77-93`).
- Host pinning and unsupported-capability rejection are source-observed trust-boundary gaps, not reproduced target failures (`replay.md:110`). They should be labelled normative support-boundary requirements rather than dogfood regressions.
- Test expansion is supported by the documented family gaps (`replay.md:97-100`), but duplicating package-level conformance in a project test/doc is no longer justified if the supported packaged adapter is adopted.

A useful generalized addition to the approval gate is one sentence:

> Map every proposed owned behavior to a reproduced defect, a current-code mismatch with an applicable conformance requirement, or an explicitly requested support claim; omit speculative hardening.

## Dogfood-only facts that should not become skill instructions

- The invalid workspace symlink, old vendor filename/integrity, 21 UETS directives, target aliases, `pureEngines` override, composition roots, and UETS authority limits are project evidence only.
- The full inline JSON (`replay.md:29-93`) is valid evidence but unnecessary maintainer-facing bulk. The skill already permits a named retained capture (`SKILL.md:17`); use that plus hash/summary in the packet.
- Do not encode Oxlint 1.75.0, `package.json#imports`, the five Oxlint rules, or unsupported `protected-dependency`/`context-firewall` behavior as universal adapter-authoring instructions. Those belong to the chosen adapter's support record.

The generalized changes worth keeping are only: **reuse before authoring**, **evidence-map proposed owned behavior**, and **preserve separate, tested conformance/support completion gates**.
