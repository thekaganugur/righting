---
name: righting-volatility-review
description: Find, evidence, rank, and present uncontained-volatility candidates in a codebase, stopping before Interface design. Reports candidates as quick inline findings or a visual HTML report. Use when the user wants a volatility-based architecture review, asks to apply The Method or Righting Software, wants to rank volatility by observed evidence (git history, co-change, existing variation), wants to fix functional decomposition, leaky ResourceAccess, or open calls, or wants a more LLM-navigable architecture.
---

# Improve Codebase Volatility

Surface architectural friction and propose **containment opportunities** — corrections that move the codebase from functional decomposition toward volatility-based decomposition. The aim is change containment, composability, testability, and AI-navigability.

## Vocabulary

Use these terms exactly in every suggestion — don't drift into "service layer," "repository," "helper," or "feature module." Full definitions in [LANGUAGE.md](LANGUAGE.md); read it before writing up candidates.

The six **roles**: **Client** (presentation), **Manager** (workflow, the "what"), **Engine** (activity, the "how"), **ResourceAccess** (atomic business verbs — never CRUD), **Resource** (state), **Utility** (cross-cutting). Components encapsulate **volatility** — open-ended change found via its **axes** (what changes for one customer over time; what differs across customers at once) — never functionality. Calls step down one **layer** under **closed architecture**; anything else is an **open call**.

Guardrails:

- Smallest correction that contains the volatility; preserve behavior and existing project style.
- A seam is justified only when the volatility is real, likely within the system lifespan, or already causing ripple edits — never for imaginary change.
- Large systems: group Managers/Engines/ResourceAccess into a handful of vertical **subsystems**, not one flat layer.
- Informed by the domain model: CONTEXT.md names the business verbs and volatile areas; ADRs record decisions not to re-litigate.

## Process

### 1. Explore

Before exploring, read the root `CONTEXT-MAP.md` when present and then each applicable `CONTEXT.md`; otherwise read the root `CONTEXT.md`. Read relevant ADRs for the area. If these files do not exist, proceed silently.

Then walk the codebase. If a sub-agent delegation tool is available (an `Agent`, `Task`, or `subagent` tool — whatever the harness registers), delegate the recon pass to a read-only exploration role (e.g. `Explore` or `scout`); fan out in parallel across areas if the tool supports it — recon output is high-volume and throwaway, and the main context must survive through candidate selection and handoff, so a delegated role carries that weight instead of the orchestrator. If no such tool is registered, explore inline via `read`, `bash`, and `grep`. Establish two anchors before hunting smells:

- **Core use cases** — the few behaviors the system exists to support. Not every route or endpoint.
- **Volatility list** — apply the axes of volatility. Separate volatility from variability, and from changes to the nature of the business. Watch for solutions masquerading as requirements. Tag each entry **Observed / Projected / Speculative** by evidence — tiers in [method-checklist.md](method-checklist.md).

Then map files to roles and note where you experience friction:

- Where is the structure shaped by required functionality instead of volatility (functional decomposition)?
- Where do Clients orchestrate — stitching Managers or calling Engines/ResourceAccess directly?
- Where does ResourceAccess leak — callers knowing CRUD, transport, storage shape, or generated API names?
- Where do open calls break closed architecture — sideways same-role calls, upward imports?
- Which Managers fail the expendable test — hoarding rules (too expensive) or pure pass-throughs (too expendable)?
- Where is a reusable volatile activity trapped in one Client or Manager (missing Engine)?

The full smell catalog per role, the closed-architecture red flags, and the frontend role translation live in [method-checklist.md](method-checklist.md). Apply roles as architectural roles, not deployment units; do not propose distributed services for an in-process codebase.

Done when every core use case is named, every volatility is stated via an axis and tagged Observed / Projected / Speculative, and every file you touched maps to one role. Don't surface a single candidate before these anchors hold — the smells only mean something against them.

### 2. Present candidates

Lead with the volatility list and do NOT design contracts yet — whichever medium you pick.

Default to the **HTML report**: the before/after visuals are this skill's signature. Drop to **quick inline findings** when the user wants it fast, in-terminal, or without a browser — follow the text format in [method-checklist.md](method-checklist.md) (volatility list, one block per candidate, top recommendation).

**HTML report.** Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/volatility-review-<timestamp>.html` so each run gets a fresh file. Open it for the user — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows — and tell them the absolute path.

The report uses **Tailwind via CDN** and **Mermaid via CDN**. Open with a **static architecture overview**: the current codebase drawn as taxonomy layers, open calls in red. Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card:

- **Files** — which files/modules are involved
- **Current shape** — how roles are mixed or which decomposition smell applies
- **Volatility** — the uncontained change, stated via the axes ("when X changes, today you edit N files")
- **Evidence** — strongest evidence or rationale: commits that changed these files together, the same rule duplicated across files, existing cross-customer variation, roadmap/lifespan signal plus current friction, or "none found"
- **Correction** — plain English role split, move, consolidation, or contract cleanup
- **Benefit** — in terms of containment, composability, and test surface
- **Before / After diagram** — side-by-side, showing the leak and the containment
- **Tier** — `Observed`, `Projected`, or `Speculative`, rendered as a badge (the tier is the evidence strength — see [method-checklist.md](method-checklist.md))

End the report with a **Top recommendation** section: which candidate you'd tackle first and why, including its tier and evidence, plus a one-line composition check — which core use cases the corrected components still serve unchanged. A Speculative candidate may be listed but cannot be the top recommendation.

**Use CONTEXT.md vocabulary for the domain, and [LANGUAGE.md](LANGUAGE.md) vocabulary for the architecture.** If `CONTEXT.md` defines "Order," talk about "the Order intake Manager" — not "the OrderService," and not "the order feature."

**ADR conflicts**: if a candidate contradicts an existing ADR, only surface it when the friction is real enough to warrant revisiting the ADR. Mark it clearly in the card (e.g. _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

After presenting, ask the user: "Which candidate, if any, should be handed to `righting-deep-modules`?"

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
  openCalls: []
  leakedKnowledge: []
  adrConflicts: []
decision: selected | rejected
unresolved: []
```

The role and correction remain hypotheses. The packet contains no Interface members, facets, Seam, dependency or Adapter strategy, or test migration. Stop before designing an Interface. Hand a selected packet to `righting-deep-modules`; a standalone volatility review ends here.

If the user rejects every candidate for a load-bearing reason, record `decision: rejected`. Invoke `righting-domain-modeling` to offer an ADR only when its hard-to-reverse, surprising, and real-trade-off conditions all hold.
