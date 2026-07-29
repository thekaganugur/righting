# Dogfood campaign: righting-integrate against uets-to-task

Status: resolved
Labels: dogfood:evidence

## Destination

Bring `skills/righting-integrate/SKILL.md` from provisional to release-trustworthy by replaying it from fresh agent context against the real, read-only dogfood project `uets-to-task` (incomplete starter, Biome-based, no ESLint adapter), fixing only general process defects each replay revealed. This record is the durable evidence for that campaign; it partially satisfies the maintainer-with-agent walkthrough record required by `.scratch/righting-onboarding-release/issues/05-define-release-onboarding-evidence.md`.

## Campaign

Nine fresh-context replays (2026-07-22): five adopt runs against the real dogfood project, plus four on small synthetic `/tmp` projects to reach the absent-starter, apply, backend, and library branches. Replay transcripts live in machine-local pi session dirs and are ephemeral; this file is the durable gist.

1. **Adopt, pre-fix (maintainer-run, model unknown):** trustworthy-looking packet with correct same-role overrides — its author had checked enforcement semantics directly rather than trusting the skill.
2. **Adopt, pre-fix (kimi-k3):** followed the skill literally and misclassified ~15 same-role edges as "ordinary", producing a packet that under-reported forbidden edges. This run exposed failure mode 1 in the table below.
3. **Adopt, post-skill-fix (gpt-5.6-terra:high):** same-role handled correctly; mirror validation worked; packet complete.
4. **Adopt + documentation audit (gpt-5.6-terra:high):** package docs rated complete; no source fallback needed.
5. **Adopt, post-docs-fix (gpt-5.6-terra:high):** same-role derived from docs alone; surfaced undocumented scope constraints.
6. **Absent-starter branch, synthetic plain-JS project (gpt-5.6-terra:high):** skill generalized; one gap (CLI not yet installed).
7. **Apply-and-verify after revise-and-approve, synthetic project (gpt-5.6-terra:high):** exact approved scope applied; verification compared against the packet; no scope creep.
8. **Genericness, pure backend shape (gpt-5.6-terra:high):** synthetic HTTP + queue-consumer project, no UI. The agent mapped route handlers and the consumer to Client, protected `pg` as Resource, kept the composition root intentionally unmapped, and cited the new `clientReadsAccess` cost note when omitting it. Gap: no docs guidance classified backend ingress or composition roots.
9. **Genericness, library shape (gpt-5.6-terra:high):** synthetic library with no entry point. The agent mapped no Client, classified the public facade as Manager, and resolved an Engine→Engine trap by responsibility clarification (helper → Utility). Gap: no docs guidance for library public-API classification; the Client discussion read UI-oriented.

Files changed by the campaign included the since-retired `skills/righting-design-review/SKILL.md`, plus `skills/righting-integrate/SKILL.md`, `docs/policy-language.md`, and this record.

## Failure modes found and fixes applied

| Failure mode (evidence) | Fix |
| --- | --- |
| Skill instructed "treat same-role dependencies as ordinary edges", contradicting enforcement (only `Utility→Utility` is allowed by default); one replay waved through ~15 forbidden edges | Skill: classify by effective policy result, "same-role edges included" |
| "Installed policy reference" unnamed | Skill now names `docs/policy-language.md` in the installed package |
| Glob rule presumed tests/generated files must be excluded; replays diverged | Skill: glob expansion must contain only intended files (neutral on mapping vs excluding) |
| "Isolated temporary location" validation mechanics unspecified; every replay improvised | Skill: run the project's installed `righting inspect --json` with an empty-content mirror of the file tree as cwd |
| Packet omitted effective role relationships and inspection limits; step 4 compared against them anyway | Skill: both added to the required approval packet |
| Fresh adoption has no installed CLI to run | Skill: installation becomes one of the requested actions |
| `docs/policy-language.md` never stated same-role edges are forbidden by default; one replay read package source to learn it | Docs: exhaustive-table sentence, including the `contextFirewall` Client-composition exception |
| `contextFirewall` proposed spuriously for a single-context app (1 of 5 runs) | Docs: variation is for independently owned bounded contexts |
| Context-name uniqueness and scope-path ambiguity rejected by CLI but undocumented | Docs: stated in the `scopes` bullet |
| Role-mapping guidance read UI/application-oriented; backend and library replays derived ingress, composition-root, and public-facade classification unaided | Docs: "Roles across project shapes" orientation (web, HTTP/queue backend, CLI, library); same-role composition paragraph generalized beyond UI |

## Recurring dogfood findings (uets-to-task, consistent across replays)

Every adopt replay, whatever its alias and glob choices, found the same substantive edges. These counts are the evidence base for the open maintainer decisions below:

- `Client→Client` composition: 31–36 occurrences (components, routes, generated route tree) — every run had to remediate this edge.
- `Client→Engine`: 10–11 occurrences across 7 files (pure display/date decisions read directly by UI).
- `Engine→Engine`: 2 occurrences, both sharing `turkey-time.engine` (`calendar-entry`, `reminder-delivery`).
- `ResourceAccess→Engine`: 7 occurrences across 3 access modules (pure decisions shaping transactional reads).
- `Client→ResourceAccess`: 1 occurrence (`src/routes/index.tsx:9`, dashboard server-function read).
- `Manager→Client`: 1 occurrence (`src/dashboard-access.manager.ts:1`, manager renders the sign-in component) — the only edge every run agreed to leave forbidden with no override.
- Tests (24 files), generated `routeTree.gen.ts`, composition roots (`worker.ts`, `router.tsx`), and non-TS assets: disposition diverged per run (mapped vs intentionally unchecked) — a maintainer decision, not a defect.

## Book-alignment findings (Righting Software, ch. 3 + Appendix C)

The default policy table is the book's closed architecture with its documented relaxations (utilities bar, business logic calling ResourceAccess, Manager→Engine, queued-only Manager→Manager); the capability catalog honestly records queued-interaction semantics and contract quality as not established. Residual tensions, assessed and recorded here:

- **Client granularity.** The book's Client is a whole application; mapping component files makes ordinary UI composition a forbidden `Client→Client` edge. All five adopt replays had to remediate it. Fixed in documentation: `docs/policy-language.md` now states the intra-Client composition idiom (explicit `allow` override with reason, or context-scoped Clients).
- **`clientReadsAccess` is the book's semi-open relaxation** (discouraged outside performance-critical or near-immutable code) and, unlike overrides, carries no required reason. Documented as a deliberate policy-wide relaxation in `docs/policy-language.md`.
- **Advisory coverage gaps.** The book's naming conventions, Manager cardinality/golden ratio, and event publish/subscribe don'ts had no home. Three probe questions were added to the design-review skill during this campaign; that skill has since been retired.

## Not yet specified

- **Maintainer decisions for uets-to-task (human).** No packet has been approved or revised by the maintainer; the approval gate is verified structurally, not socially. Decision points, with the evidence above: (a) approve an evidenced `Client→Client` composition override or use context-scoped Clients; (b) approve an `Engine→Engine` override for `turkey-time` or reclassify/merge — a conscious deviation the book flags as a red flag either way; (c) approve `Client→Engine` and/or `ResourceAccess→Engine` overrides for the pervasive pure-decision reads, or require routing through Managers; (d) repair, override, or legacy-debt the single `Manager→Client` edge; (e) `clientReadsAccess` versus extracting the one direct route read; (f) tests, generated files, and composition roots: mapped or intentionally unchecked.
- **`inspect` glob-expansion surface (product question).** Two replays noted `inspect` reports no per-glob match lists or dependency occurrences; agents reproduce that analysis by hand. The v1 map deferred health-surface expansion; assess separately before touching the CLI contract.
- **Adapter path unverified.** uets-to-task uses Biome; the `righting-eslint` handoff and `#/`-subpath-import resolver behavior were out of scope for this campaign.

## Validation

After every change: `npm run typecheck`, `npm run build`, `node --test dist/test/package-documentation.test.js` (plus packed-route tests), and `git diff --check` all pass. The dogfood project was never modified; no campaign work is committed.
