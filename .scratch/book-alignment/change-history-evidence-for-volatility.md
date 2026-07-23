# Change-history evidence for volatility classification

## Summary

Git history can cheaply and reproducibly establish **where change has occurred, how large it was, and which paths appeared in the same recorded changeset**. Those facts can sharpen a volatility investigation, but they do not establish that a component encapsulates a real volatility: commits are records of development practice, not observations of customer axes, business intent, fear, cost, or future change.

The minimal useful surface is therefore a deterministic, bounded Git fact extractor: per-path revision/churn facts, symmetric and directional co-change facts, cross-declaration summaries, and explicit coverage/quality metadata. An agent interprets those facts alongside code, use cases, the two axes of volatility, and the Observed/Projected/Speculative tiers; a maintainer alone approves classifications in `righting.json`.

## Scope and conceptual guardrail

The book defines volatility-based decomposition as containing an area of potential open-ended change so that a change does not ripple through the system (`book/02-decomposition.md`, “Volatility-Based Decomposition”). It distinguishes volatility from locally handled variability and tests candidates on two axes: change for one customer over time and differences across customers at one time (`book/02-decomposition.md`, “Volatile Versus Variable” and “Axes of Volatility”). It also expects volatility to decrease down the Client → Manager → Engine → ResourceAccess → Resource gradient and Managers to be **almost expendable**, rather than expensive or empty pass-throughs (`book/03-structure.md`, “Key Observations”).

History is relevant to the first axis only indirectly: it records edits over repository time, not “the same customer” unless customer identity is supplied by trustworthy external metadata. It says essentially nothing about the second axis unless variants are already represented in code and an agent inspects them. Consequently:

> **History establishes edit patterns. It neither proves volatility nor assigns a role.**

This is the operating-model boundary already decided in `.scratch/book-alignment/issues/01-define-rightings-ai-oriented-operating-model.md`: tooling owns reproducible facts; an agent applies the axes and separates facts, inferences, recommendations, and uncertainty; a maintainer approves current architectural intent in `righting.json`. Raw evidence and candidate recommendations do not become approved project state.

## What the existing `improve-codebase-volatility` skill already does

The relevant files are:

- `/Users/kgnugur/.agents/skills/improve-codebase-volatility/SKILL.md`
- `/Users/kgnugur/.agents/skills/improve-codebase-volatility/LANGUAGE.md`
- `/Users/kgnugur/.agents/skills/improve-codebase-volatility/method-checklist.md`
- `/Users/kgnugur/.agents/skills/improve-codebase-volatility/HTML-REPORT.md`
- `/Users/kgnugur/.agents/skills/improve-codebase-volatility/CONTRACT-DESIGN.md` (relevant downstream context; it does not add history analysis)

The skill already:

1. requires a volatility list formed by the two axes and explicitly separates volatility, variability, changes to the nature of the business, and solutions masquerading as requirements;
2. assigns **Observed / Projected / Speculative** evidence tiers;
3. treats “a past change forced edits across these files (`git log` / blame)” as one possible Observed signal;
4. asks “what has changed over the system lifespan, and which files did that change touch?” and reports evidence such as “changed together in N commits”;
5. maps files to the six book roles and inspects functional decomposition, open calls, leaky ResourceAccess, missing Engines, and Managers that are too expensive or too expendable;
6. presents candidate files, current shape, axis-framed volatility, evidence, correction, benefit, tier, and a composition check, either inline or in an HTML ripple/architecture view.

What it **does not** define is just as important: it has no reproducible Git command, history window, merge/rename policy, exclusion policy, co-change formula, denominator, minimum support, broad-commit treatment, machine-readable output, or provenance/coverage record. Its phrase “changed together in N commits” can therefore vary between agents. It also permits history to qualify a candidate as Observed but correctly does not say that co-change itself proves volatility. A focused Righting capability should retain the vocabulary, tiers, axes, containment framing, and agent investigation while replacing ad hoc counting with stable facts.

## Techniques and primary-source evidence

### 1. Revision frequency and line churn

`git log --numstat` emits added lines, deleted lines, and an unabbreviated path in a machine-oriented format; binary entries use `-` for both counts. `--name-status` supplies add/modify/delete/rename status, and `-z` avoids ambiguity from unusual path characters. Git also documents that line-based directory statistics are more expensive than file-count statistics, which do not inspect file contents. [Git `log` documentation](https://git-scm.com/docs/git-log)

Useful facts per path are:

- number of included revisions touching it;
- added and deleted text lines, separately and summed;
- first and last included change time;
- number of distinct canonical authors (diagnostic context, not a volatility measure);
- binary/unknown-line-count flag;
- add/delete/rename status and current/deleted status.

**Book mapping.** High revision frequency says “this path has often participated in recorded changes.” It is evidence worth investigating against the time axis and can prioritize a hotspot. It does not distinguish open-ended volatility from ordinary variability, defects, formatting, dependency updates, generated output, or a single prolonged rewrite. Low frequency does not establish that a Resource is correctly stable or that a Manager is pass-through: it may mean mature code, dead code, sparse history, hidden changes upstream, or missing history.

A hotspot is best kept as a ranking, not a verdict. CodeScene’s official definition is a module with high development activity; it combines that activity with a separate code-health perspective to prioritize maintenance work and explicitly notes that low-health stable code is lower priority. [CodeScene, “What is a Hotspot?”](https://docs.enterprise.codescene.io/latest/guides/technical/hotspots.html#what-is-a-hotspot) This supports emitting activity facts, not inventing a “volatility score.”

### 2. Same-commit co-change (edit/temporal/logical coupling)

The foundational logical-coupling paper uses release history to uncover dependencies and change patterns at module level rather than deriving them from one code snapshot. [Gall, Hajek, and Jazayeri, *Detection of Logical Coupling Based on Product Release History* (ICSM 1998)](https://doi.org/10.1109/ICSM.1998.738508) Modern lightweight tools typically use commits as changesets: CodeScene calls two modules temporally coupled when they are modified in the same commit (and also offers ticket/time-window variants), while Hercules defines file couples as files changed in the same commit. [CodeScene temporal coupling](https://docs.enterprise.codescene.io/versions/3.5.9/guides/technical/temporal-coupling.html) [Hercules README, “Couples”](https://github.com/src-d/hercules/blob/v10.3.0/README.md#couples)

For each unordered pair `A,B`, calculate:

- `sharedRevisions = |revisions(A) ∩ revisions(B)|`;
- `revisionsA`, `revisionsB`;
- directional rates `P(B|A) = sharedRevisions / revisionsA` and `P(A|B) = sharedRevisions / revisionsB`;
- optionally, for tool comparison, Code Maat’s symmetric `degree = sharedRevisions / mean(revisionsA,revisionsB)` as a percentage, plus `averageRevisions`. This exact formula and output are in the author’s source. [Code Maat logical-coupling source](https://github.com/adamtornhill/code-maat/blob/v1.0.1/src/code_maat/analysis/logical_coupling.clj)

Directional rates are valuable because a frequently edited central file may accompany every edit to a small file while the converse is weak. Always emit raw numerators and denominators; a percentage without support is misleading. CodeScene likewise exposes degree and average revisions specifically so one creation commit does not look conclusive. [CodeScene temporal coupling](https://docs.enterprise.codescene.io/versions/3.5.9/guides/technical/temporal-coupling.html#understand-temporal-coupling)

**Book mapping.** Repeated co-change inside an approved component is consistent with a cohesive change boundary; repeated co-change across approved components is evidence of ripple edits or another relationship to investigate. Neither implication is automatic. Expected positive couples include production code and its test, documentation and implementation, and intentionally parallel platform implementations; CodeScene explicitly documents these counterexamples and says interpretation depends on context. [CodeScene temporal coupling](https://docs.enterprise.codescene.io/versions/3.5.9/guides/technical/temporal-coupling.html#use-temporal-coupling-to-predict-omissions) Co-change may expose a missing containment boundary, duplicated knowledge, an open call, or simply an atomic commit convention.

### 3. Boundary and role summaries

Once paths are mapped by **approved declarations**, the same raw facts can be aggregated without inferring architecture:

- per declaration/component: path count, touched-path count, revision count, added/deleted lines, last change;
- pair facts labeled `withinDeclaration` or `crossDeclaration`;
- role-group distributions for declared Clients, Managers, Engines, ResourceAccess, Resources, and Utilities;
- changeset spread: number of approved declarations and roles touched by each included commit.

This is a deterministic join, not automatic architecture inference. A cross-boundary pair can direct the agent to ask whether one volatility leaks across vaults. Role distributions let the agent compare the observed history with the book’s expected top-down gradient, but they cannot prove or disprove it: path size, work allocation, component age, and release cadence confound raw counts.

For a declared Manager, evidence should prompt two different questions:

- **frequent/broad change:** is workflow change contained here, or is the Manager expensive because it hoards Engine/ResourceAccess logic?
- **little/no change and little substance:** is it an expendable pass-through, or merely a correct, mature, currently unused Manager?

“Every change is feared” and “cheap to rewrite” are human/process facts absent from Git. History can show large or cross-component Manager changes; only an agent and maintainer can determine fear, cost, and almost-expendability.

### 4. Blame, age, ownership, ticket coupling, and semantic-unit history

These are useful follow-ups, not MVP facts:

- `git blame`/`git log -L` can trace surviving lines or a selected function, but surviving-line age is not edit frequency and deleted code disappears from the present snapshot. `-L` is limited to a single starting revision and cannot take pathspec limiters. [Git `log -L`](https://git-scm.com/docs/git-log#Documentation/git-log.txt--Lltstartgtltendgtltfilegt)
- Ticket-ID or same-author/time-window coupling can span commits and repositories, as CodeScene documents, but it depends on project-management metadata and identity/time-window policy; commit-level coupling is its primary, stronger inspection point. [CodeScene temporal coupling](https://docs.enterprise.codescene.io/versions/3.5.9/guides/technical/temporal-coupling.html#change-the-temporal-coupling-thresholds-depending-on-your-codebase)
- Hercules can compute full-history burndown, ownership, file/developer co-occurrence matrices, and structural hotness at function level, but its own Linux example took 1h40m and its caveats report a 1.5 GB couples output requiring over an hour and 180 GB RAM to parse. [Hercules README](https://github.com/src-d/hercules/blob/v10.3.0/README.md) Those analyses violate the “seconds” target for a default orientation surface.
- PyDriller offers a convenient Python API with rename-aware file-history lookup and modified-file/change-type objects, but adds a runtime dependency and is unnecessary for the minimal counters Git already emits. Its docs also warn that merge commits can have empty modification lists. [PyDriller API reference](https://pydriller.readthedocs.io/en/latest/reference.html)

## Existing-tool comparison

| Tool | Primary capability | Strength | Mismatch with minimal Righting evidence |
|---|---|---|---|
| Git CLI | `log`, `numstat`, status, rename and path filtering | Already present, scriptable, deterministic with explicit flags; `-z` is safe for paths | Requires a small parser and explicit policy; no built-in co-change aggregation |
| Code Maat | churn, revisions, coupling, sum-of-coupling, author/effort analyses | Technique-author implementation; transparent formulas and CSV output | Java/Clojure artifact and intermediate log; README’s preferred `git2` example disables renames; no Righting declaration join. [README](https://github.com/adamtornhill/code-maat) |
| CodeScene | hotspots, change coupling, architectural views, configurable filters | Rich maintained product; distinguishes expected/unexpected coupling and tunes thresholds per codebase | External/commercial analysis and broader quality interpretation; not a cheap local deterministic primitive |
| Hercules | full-history single-pass analyses, file/developer couples, semantic hotness | Broad, fast relative to blame-heavy alternatives, merge/branch aware | Heavy outputs/dependencies and potentially extreme time/RAM; far beyond MVP |
| PyDriller | programmatic commit/file/diff traversal | Good for research prototypes and richer mining | Python dependency and more object/diff work than counts require |

Code Maat’s own input command and vendor exclusion example confirm that `git log --numstat --after=…` plus pathspec filtering is a sufficient substrate for churn/coupling analysis. [Code Maat README, “Generating input data”](https://github.com/adamtornhill/code-maat#generating-input-data)

## Recommended minimal deterministic evidence set

### Invocation contract

Use the repository’s current `HEAD`, never the worktree or index. Make all policy explicit and echo it in output:

```sh
git rev-parse HEAD
git log HEAD --no-merges --date-order \
  --format=<NUL/record-separated hash,parents,author-email,author-time,committer-time> \
  --raw --numstat -z -M \
  --since=<configured-date> -- <configured include/exclude pathspecs>
```

`--raw` supplies status while `--numstat` supplies line counts; using `--name-status` with `--numstat` would select one summary format rather than reliably emitting both. The exact combined pretty/diff encoding should be fixture-tested rather than copied from this illustrative shell form; an implementation may instead use plumbing commands per commit. Important semantics are: one named tip; non-merge changesets; NUL-safe paths; rename detection; machine-readable line counts and status; bounded time/range; and recorded exclusions. Do **not** use `--all` by default, because duplicate/cherry-picked branch histories and abandoned work answer a different question. Offer `ref` and range as inputs.

Git normally omits merge diffs unless a merge-diff mode is requested; `--first-parent` changes that default. The surface should avoid accidental version-dependent topology semantics by choosing and reporting a policy. [Git merge-diff documentation](https://git-scm.com/docs/git-log#Documentation/git-log.txt---diff-mergesltformatgt)

### Implementation-neutral algorithm

1. Resolve the requested ref to an object ID; record Git version, ref, head, window/range, merge mode, rename mode, filters, limits, and elapsed time.
2. Stream commits. Canonicalize authors through `.mailmap`/`--use-mailmap` only for author facts; author identity does not affect path coupling.
3. Build the unique eligible path set for each commit after exclusions. Preserve rename old/new/status evidence and attribute the event to the current path where Git identifies a rename. Mark binary numstat as unknown rather than zero.
4. Record commit-level `eligiblePathCount`, original path count, excluded counts/reasons, declaration/role spread, and flags (`broad`, `bot`, `merge`, `formatting/refactor` only when configured or externally identified—never guessed from a message as truth).
5. Increment per-path revision and churn counters once per commit.
6. For each included, non-broad commit path set of size `k`, increment each unordered pair once (`k(k-1)/2`).
7. Join paths to approved `righting.json` declarations; retain `unmapped` and overlapping-mapping diagnostics rather than silently assigning them.
8. Emit top pairs by raw support and by degree, but preserve complete deterministic records up to a configured output cap and report truncation.

This costs approximately `O(total changed-path records + Σ k²)` time and `O(paths + retained pairs)` memory. Filtering broad commits bounds the quadratic term. Streaming `git log` avoids checking out revisions or reading source blobs; Git says file-count statistics are its cheapest directory-stat mode because they do not inspect contents. [Git `--dirstat=files`](https://git-scm.com/docs/git-log#Documentation/git-log.txt-files)

### Suggested output

```json
{
  "coverage": {
    "head": "<full oid>",
    "ref": "HEAD",
    "since": "<input>",
    "oldestIncludedCommit": "<time>",
    "commitCountSeen": 0,
    "commitCountIncluded": 0,
    "mergePolicy": "exclude",
    "renamePolicy": "git-default-50-percent",
    "broadCommitPathLimit": 50,
    "excludedCommitsByReason": {},
    "excludedPathsByReason": {},
    "truncated": false
  },
  "paths": [{
    "path": "src/example.ts",
    "declarationId": "...",
    "role": "Manager",
    "revisions": 0,
    "linesAdded": 0,
    "linesDeleted": 0,
    "lineCountsKnown": true,
    "firstChange": "...",
    "lastChange": "...",
    "authors": 0
  }],
  "pairs": [{
    "pathA": "...",
    "pathB": "...",
    "sharedRevisions": 0,
    "revisionsA": 0,
    "revisionsB": 0,
    "aWithBGivenA": 0.0,
    "bWithAGivenB": 0.0,
    "codeMaatDegree": 0.0,
    "averageRevisions": 0.0,
    "boundary": "within|cross|unmapped"
  }],
  "declarations": [],
  "warnings": []
}
```

Names should avoid `volatility`, `quality`, `risk`, `cohesion`, `correct`, and `violation`; those would turn facts into conclusions.

### Filters and thresholds

No primary source found supports a universal volatility threshold, and none should be invented. Emit ranks, raw support, and denominators. For an optional conservative starter profile, CodeScene documents an example that ignores entities with fewer than **10 revisions** and commits touching more than **50 files**, specifically to avoid one-commit and large-reorganization bias; it also says thresholds must vary by codebase and may be lowered when no coupling appears. [CodeScene threshold example](https://docs.enterprise.codescene.io/versions/3.5.9/guides/technical/temporal-coupling.html#change-the-temporal-coupling-thresholds-depending-on-your-codebase)

Accordingly:

- `>50 eligible paths` may default to **excluded from pair counting but retained in commit/churn facts and reported as broad**. It is a noise/cost guardrail borrowed from that example, not an architectural cutoff.
- `<10 path revisions` should be a **low-support flag**, not suppression, so young repositories remain inspectable.
- never call a degree “strong” solely because it exceeds a fixed percentage; show `sharedRevisions` and both denominators.
- exclude generated/vendor/lock/build/minified paths only from checked-in configuration and standard repository attributes/patterns, never from an opaque hard-coded language list. Report every exclusion category.
- bot exclusion likewise requires an explicit identity/email pattern or supplied identity map. Preserve bot-included and bot-excluded counts if consumers need both views.

## Failure modes and required cautions

| Failure mode | Distortion | Required treatment |
|---|---|---|
| Squash merges | A whole feature becomes one broad commit; internal sequencing/support disappears and unrelated feature files become coupled | Report topology/policy and commit-size distribution; retain churn, flag/exclude broad pair formation; state that pre-squash evidence is unrecoverable from this repo |
| Ordinary merge commits | Default Git diff output may omit them; first-parent or per-parent diffs answer different questions and can duplicate branch edits | Default to non-merges for atomic edit facts; expose an explicit alternative mode, never silently mix modes |
| Young/shallow repositories | Small denominators create 100% pairs; prior history may be absent | Detect shallow state, report age/oldest commit/count; flag low support; return “insufficient history,” not “stable” |
| Generated, vendored, minified, lock, snapshots | Mechanical fan-out dominates churn and couples | Configured exclusions with reason/count; optionally retain separate category; never silently discard |
| Renames and moves | Old/new paths split one entity; rename-only reorganizations manufacture churn/coupling | Use `-M` and preserve rename evidence. Git’s default similarity threshold is 50%; exhaustive fallback can be `O(N²)` and is bounded by rename limits. [Git rename docs](https://git-scm.com/docs/git-log#Documentation/git-log.txt--Mn) |
| Broad formatting/refactor/reorganization commits | Many unrelated pairs and huge line churn | Broad-commit guardrail; allow configured ignored commit IDs (similar in spirit to blame-ignore lists); do not infer “formatting” reliably from message alone |
| Bots | Dependency/generated updates dominate activity and author counts | Explicit bot identity policy; report both policy and excluded count; use mailmap for canonical identities |
| Monorepos | Global hotspots reflect team/product scale; unrelated projects share commits; pair space explodes | Scope by approved context/path/ref; aggregate within and across declared boundaries; report unmapped paths; never compare raw counts across unequal components without normalization/context |
| Binary files | `--numstat` yields `-`, not line counts | Count revisions, mark line churn unknown; do not coerce to zero. [Git `--numstat`](https://git-scm.com/docs/git-log#Documentation/git-log.txt---numstat) |
| Commit granularity | “One concern per commit,” drive-by cleanup, cherry-picks, and commit splitting/combining change coupling without changing architecture | Treat the commit as the observed recording unit; expose size distribution and directional denominators; ask the agent to inspect representative commits |
| Branch selection/cherry-picks | `--all` can count the same logical change multiple times; mainline-only can omit work | Default to one resolved ref; make alternative refs/ranges explicit; optionally deduplicate only by exact commit ID, not guessed patch equivalence |
| Deletions and dormant code | Current-only file lists erase removed hotspots; no recent changes looks “stable” | Include deleted historical paths with status; distinguish current, deleted, untouched-current, and out-of-window |
| Author timestamps | Rebases can preserve author time while changing integration time | Record author and committer times; choose one documented window clock (committer time is usually the repository integration fact) |
| Path/declaration changes | Applying today’s `righting.json` to old paths can misclassify historical boundaries | Label the join as “current declaration applied to historical path”; preserve rename aliases and unmapped evidence; do not claim historical intent |

## Agent interpretation protocol

A focused `volatility-classification` investigation should consume the facts in this order:

1. **Coverage first:** Is history deep, non-shallow, properly scoped, and free enough of broad/mechanical changes to support an inference?
2. **Facts:** Cite exact path/declaration counts, ranges, pair numerators/denominators, filters, and representative commit IDs.
3. **Axis test:** Ask what changed for the same customer over time and what differs across customers now. Git activity alone is not an answer. Separate open-ended volatility from local variability and from a change to the nature of the business.
4. **Tier:** A repeated, semantically coherent past ripple can support **Observed**; current friction plus credible lifespan/roadmap evidence can support **Projected**; a merely possible axis remains **Speculative**. A percentage without inspected semantics is not Observed volatility.
5. **Book-specific inference:** Compare cross-boundary edits with containment, role distributions with the expected gradient, and Manager changes with orchestration responsibility. State plausible alternatives (tests, generation, atomic commits, team workflow).
6. **Recommendation:** Propose a classification or investigation, never an architecture score or automatic edit.
7. **Approval:** Only a direct maintainer affirmation changes approved advisory declarations/status in `righting.json`. Store neither raw history nor unapproved candidates there.

A good inference reads: “Fact: `A` and `B` shared 12 of A’s 15 and 12 of B’s 40 included revisions, across 9 non-broad commits after exclusions. Inspection shows all 9 implement notification-transport changes. Inference: transport change currently crosses the declared boundary and is Observed evidence for one uncontained volatility. Recommendation: investigate a Notification Engine boundary. Uncertainty: the repository contains only one customer variant.”

A bad inference reads: “80% coupling proves A and B are one volatility.”

## Recommendation

Adopt a **Git-only, bounded, JSON fact extractor** for (1) per-path revision/churn facts, (2) same-commit pair support with both directional denominators and optional Code Maat-compatible degree, (3) commit-size/exclusion/coverage metadata, and (4) deterministic joins to current approved declarations. Default to one resolved ref, exclude merge commits from atomic edit analysis, enable rename detection, flag low support, and omit commits over 50 eligible paths from pair formation while retaining them as reported churn facts. Keep every cutoff configurable and visible.

This is enough to run in seconds on ordinary bounded histories, eliminate agent-to-agent counting drift, and direct semantic inspection. Defer blame, ticket/time-window coupling, semantic-unit mining, ownership, defect prediction, visualization, and automatic threshold tuning until evidence shows the minimal surface is insufficient.

## Explicit non-goals

- inferring, scoring, approving, or rewriting architecture automatically;
- claiming that churn, hotspots, co-change, stability, or a layer gradient proves volatility;
- discovering customers, use cases, business meaning, fear, maintenance cost, or future lifespan from Git;
- generic code-quality, defect-risk, developer-productivity, or ownership scoring;
- using author facts for personnel evaluation;
- persisting raw evidence or unapproved recommendations in `righting.json`;
- replacing runtime, roadmap, cross-customer, maintainer, vocabulary, ADR, or golden-example evidence;
- reproducing CodeScene, Code Maat, Hercules, or a general repository-mining platform.

## Sources

### Primary sources kept

- Git project, [`git-log` documentation](https://git-scm.com/docs/git-log) — authoritative output, merge, rename, path, binary, and cost semantics.
- Harald Gall, Karin Hajek, and Mehdi Jazayeri, [*Detection of Logical Coupling Based on Product Release History*](https://doi.org/10.1109/ICSM.1998.738508) — technique-author paper establishing release-history logical coupling.
- Adam Tornhill, [Code Maat repository and README](https://github.com/adamtornhill/code-maat) — author-owned implementation, commands, filters, and supported analyses.
- Adam Tornhill, [Code Maat logical-coupling implementation](https://github.com/adamtornhill/code-maat/blob/v1.0.1/src/code_maat/analysis/logical_coupling.clj) — exact degree formula and output fields.
- CodeScene, [Temporal Coupling documentation](https://docs.enterprise.codescene.io/versions/3.5.9/guides/technical/temporal-coupling.html) — author/vendor definitions, expected couples, boundary use, and configurable threshold rationale.
- CodeScene, [Hotspots documentation](https://docs.enterprise.codescene.io/latest/guides/technical/hotspots.html) — official activity/hotspot semantics and separation from code health.
- source{d}, [Hercules v10.3.0 README](https://github.com/src-d/hercules/blob/v10.3.0/README.md) — tool-owner capabilities, commands, performance examples, and caveats.
- PyDriller, [official API reference](https://pydriller.readthedocs.io/en/latest/reference.html) — rename-aware traversal and merge behavior.
- Juval Löwy, local working summaries `book/02-decomposition.md` and `book/03-structure.md` — governing book concepts supplied for this decision.
- Local resolved operating-model ticket and `improve-codebase-volatility` skill files listed above — current project contract and existing process behavior.

### Sources dropped

- Blogs, comparison articles, marketplace tools, and SEO surveys — secondary and unnecessary after official documentation/source was available.
- Defect/churn correlation claims in comments or vendor prose — outside the volatility question and not needed for the recommendation.
- Universal numeric coupling/hotspot thresholds — no strong primary evidence found that transfers across repositories; the report retains only CodeScene’s explicitly contextual example.

## Gaps

No primary evidence found validates a repository-independent mapping from any churn/coupling value to Löwy’s volatility axes, role gradient, or almost-expendable Manager test; this report therefore makes none. The “seconds” target is an engineering budget, not benchmarked here against Righting’s target repositories; before productizing, benchmark the proposed bounded stream on representative small and large monorepos and fixture-test squash, rename, merge, unusual-path, and binary histories.

