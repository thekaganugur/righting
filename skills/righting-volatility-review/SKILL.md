---
name: righting-volatility-review
description: Find, evidence, rank, and present uncontained-volatility candidates and incomplete accepted Architecture Modules, stopping before Interface design. Reports actionable work as quick inline findings or a visual HTML report. Use when the user wants a volatility-based architecture review, asks to apply The Method or Righting Software, wants to rank volatility by observed evidence (git history, co-change, existing variation), wants to fix functional decomposition, leaky ResourceAccess, or open calls, or wants a more LLM-navigable architecture.
---

# Improve Codebase Volatility

Surface architectural friction, accepted Architecture Module follow-ups, and **containment opportunities**. The aim is change containment, composability, testability, and AI-navigability.

## Vocabulary

Read [LANGUAGE.md](LANGUAGE.md) completely before exploration, then use its discovery terms exactly in every suggestion. For Architecture Module placement, read the **Architecture Module** and **Physical realization** definitions in [`righting-module-design`](../righting-module-design/SKILL.md); use that vocabulary without crossing this review's stop before Interface design.

The six **roles**: **Client** (presentation), **Manager** (workflow, the "what"), **Engine** (activity, the "how"), **ResourceAccess** (atomic business verbs — never CRUD), **Resource** (state), **Utility** (cross-cutting). Components encapsulate **volatility** — open-ended change found via its **axes** (what changes for one customer over time; what differs across customers at once) — never functionality. Calls step down one **layer** under **closed architecture**; anything else is an **open call**.

An **Accepted Module follow-up** is unfinished realization work derived from an accepted Architecture Module document. It starts from accepted responsibility and Interface rather than a new volatility hypothesis and has one status:

- **Partial migration** — accepted behavior or an accepted Implementation responsibility is absent from current source.
- **Partial placement** — accepted behavior and Implementation responsibilities are present, but the module root, ownership, or target location remains unresolved or unrealized.

Partial migration takes precedence when both conditions exist. Follow-ups carry no Observed / Projected / Speculative tier.

Guardrails:

- Smallest correction that contains the volatility; preserve behavior and existing project style.
- A seam is justified only when the volatility is real, likely within the system lifespan, or already causing ripple edits — never for imaginary change.
- Large systems: group Managers/Engines/ResourceAccess into a handful of vertical **subsystems**, not one flat layer.
- Informed by the domain model: CONTEXT.md names the business verbs and volatile areas; ADRs record decisions not to re-litigate.

## Process

### 1. Explore

Before exploring, read the root `CONTEXT-MAP.md` when present and then each applicable `CONTEXT.md`; otherwise read the root `CONTEXT.md`. Read relevant ADRs for the area. If these files do not exist, proceed silently.

Inventory accepted Architecture Module documents, current module roots, global role folders, and host-required source locations that intersect the area. Compare each accepted target with current source. Record complete realization or an Accepted Module follow-up, including the remaining work and whether it is partial placement or partial migration. Accepted documents establish existing ownership; paths without that evidence do not establish a Module.

Then walk the codebase. If a sub-agent delegation tool is available (an `Agent`, `Task`, or `subagent` tool — whatever the harness registers), delegate the recon pass to a read-only exploration role (e.g. `Explore` or `scout`); fan out in parallel across areas if the tool supports it — recon output is high-volume and throwaway, and the main context must survive through candidate selection and handoff, so a delegated role carries that weight instead of the orchestrator. If no such tool is registered, explore inline via `read`, `bash`, and `grep`. Establish two anchors before hunting smells:

- **Core use cases** — the few behaviors the system exists to support. Not every route or endpoint.
- **Volatility list** — apply the axes of volatility. Separate volatility from variability, and from changes to the nature of the business. Watch for solutions masquerading as requirements. Tag each entry **Observed / Projected / Speculative** by evidence — tiers in [method-checklist.md](method-checklist.md).

Then map files to roles and hypothesized volatility ownership, and note where you experience friction:

- Where is an accepted Architecture Module scattered across global role folders instead of colocated under its root?
- Where is the structure shaped by required functionality instead of volatility (functional decomposition)?
- Where do Clients orchestrate — stitching Managers or calling Engines/ResourceAccess directly?
- Where does ResourceAccess leak — callers knowing CRUD, transport, storage shape, or generated API names?
- Where do open calls break closed architecture — sideways same-role calls, upward imports?
- Which Managers fail the expendable test — hoarding rules (too expensive) or pure pass-throughs (too expendable)?
- Where is a reusable volatile activity trapped in one Client or Manager (missing Engine)?

The full smell catalog per role, the closed-architecture red flags, and the frontend role translation live in [method-checklist.md](method-checklist.md). Apply roles as architectural roles, not deployment units; do not propose distributed services for an in-process codebase.

Done when every core use case is named, every volatility is stated via an axis and tagged Observed / Projected / Speculative, every architecture-relevant source file used as evidence or included in a candidate has a role hypothesis or explicit non-role treatment, and every accepted Module in scope is marked complete or has an explicit follow-up. Surface actionable work only after these anchors hold.

### 2. Present actionable work

Lead with the volatility list and do NOT design contracts yet — whichever medium you pick. Present Accepted Module follow-ups before new candidates. Each follow-up names its status, accepted document and root, remaining work, readiness, blockers, and next workflow:

- unresolved placement ownership, target, or migration design routes to `righting-deep-modules` without rediscovering the accepted Module;
- a current accepted slice with settled decisions and no blockers routes to the project's normal implementation workflow; and
- a blocked follow-up records `blocked` as its next workflow and names the evidence or dependency that must resolve first.

`ready` has no blockers and pairs with `righting-deep-modules` or `normal-implementation`; `blocked` names at least one blocker and pairs only with `blocked`.

Keep accepted follow-ups out of the volatility tiers and preserve their accepted responsibility and Interface unless the maintainer reopens them. Compare ready follow-ups with candidates when choosing the top recommendation; use accepted commitment, readiness, project sequencing, and containment payoff for follow-ups, and evidence tier plus containment payoff for candidates. A Speculative candidate cannot be the top recommendation; neither can a blocked follow-up.

Default to the **HTML report**: the before/after visuals are this skill's signature. Drop to **quick inline findings** when the user wants it fast, in-terminal, or without a browser — follow the text format in [method-checklist.md](method-checklist.md) (volatility list, Accepted Module follow-ups, candidate blocks, top recommendation).

**HTML report.** Read [HTML-REPORT.md](HTML-REPORT.md) completely, then write its single-file, network-dependent report to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/volatility-review-<timestamp>.html` so each run gets a fresh file. Open it for the user — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows — and tell them the absolute path.

The reference owns the report structure, follow-up and candidate fields, diagrams, styling, and Top recommendation.

Use `CONTEXT.md` vocabulary for the domain and `LANGUAGE.md` vocabulary for the architecture. Surface an ADR conflict only when evidenced friction justifies reopening it.

After presenting, ask the user: "Which actionable item, if any, should proceed?"

### 3. Record selection and hand off

When the user selects a candidate, record only the discovery evidence and directional hypotheses in chat, or in a Markdown file when the user requests an artifact:

```yaml
schema: volatility-candidate/v1
candidate:
  name:
  files: []
  currentShape:
  roleHypothesis:
  smallestCorrection:
volatility:
  axes: []
  tier: Observed | Projected | Speculative
  evidence: []
  currentRipple:
coreUseCases:
  - name:
    currentCallChain: []
architecture:
  roles: []
  treatments: []
  openCalls: []
  leakedKnowledge: []
  adrConflicts: []
decision: selected | rejected
unresolved: []
```

The role and correction remain hypotheses. The packet contains no Interface members, facets, Seam, dependency or Adapter strategy, or test migration. Stop before designing an Interface. Hand a selected candidate packet to `righting-deep-modules`.

When the user selects an Accepted Module follow-up, record its accepted state and route instead:

```yaml
schema: architecture-module-follow-up/v1
module:
  name:
  document:
  status: partial placement | partial migration
  acceptedRoot:
remaining:
  work: []
  files: []
  decisions: []
readiness: ready | blocked
blockers: []
next:
  workflow: righting-deep-modules | normal-implementation | blocked
  reason:
decision: selected | deferred
```

Accepted responsibility and Interface are authoritative. Record the classification and route established in stage 2; do not recalculate them during handoff. A standalone volatility review ends after this handoff.

If the user rejects every candidate for a load-bearing reason, record `decision: rejected`. Invoke `righting-domain-modeling` to evaluate whether the reason merits an ADR under its eligibility gate.
