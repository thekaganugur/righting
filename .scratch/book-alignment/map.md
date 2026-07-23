# Book alignment for righting

Status: active
Labels: wayfinder:map

## Destination

Define Righting's AI-oriented operating model, then use it to decide which book-alignment gaps righting should close and how. Each identified gap — bands 2–5 of the book-rule spectrum below, plus the dogfood-derived Engine-to-Engine product tension — ends in an implementation-ready decision or an explicit rejection.

## Notes

- Book knowledge base: `/Users/kgnugur/Codes/Bucket/righting-software/book/` — start at `INDEX.md`; `role-cheatsheet.md` for call rules, `GLOSSARY.md` for terms, `appendix-c-design-standard.md` for the condensed rule checklist.
- Standing product intent: prevent AI slop and help coding agents produce higher-quality systems. Working hypothesis: deterministic facts and guardrails → evidence-led agent recommendations → maintainer decisions → durable repository records. **Define Righting's AI-oriented operating model** resolves the exact ownership boundaries.
- Skills to consult: `/grilling` and `/domain-modeling` for grilling tickets; `/research` for the research ticket.
- Planning only: this map produces decisions, not deliverables. Implementation is a later handoff.
- The external project `/Users/kgnugur/Codes/Personal/uets-to-task` is read-only product evidence only; its architecture and adoption decisions remain in that project's own process.
- Already landed before this map (no ticket needed): the Client-composition idiom paragraph and the `clientReadsAccess` semi-open cost note in `docs/policy-language.md`, and the naming/cardinality/event probes (checklist items 3, 6, 7) in `skills/righting-design-review/SKILL.md`.

### The book-rule spectrum (reference table)

Every book rule, sorted by the evidence it needs — the evidence type constrains where a rule can live. **Define Righting's AI-oriented operating model** decides the tooling, agent, human, and durable-record owner for each row:

| Band | Evidence | Nature | righting today |
|---|---|---|---|
| 1. Import-graph (who calls whom) | static imports, binary | directive | Enforced: `role-dependency`, protected packages, `contextFirewall`, unresolved-import ban |
| 2. Code-shape (counts, names, sizes) | static, numeric | guideline ("avoid"/"strive") | Partially probed in `righting-design-review`; no aggregate reporting |
| 3. Interaction mechanism (queued, pub/sub, events) | code-visible, runtime semantics | directive-ish | Honestly unproven (`queued-interaction-semantics` not established) |
| 4. Decomposition truth (is the classification right?) | git history + judgment | core guideline | Advisory only; no change-evidence used |
| 5. Design process (how decisions get made) | none (behavioral) | method | Skills embody some; use-case validation missing |
| 6. Business alignment (why the system exists) | human conversation | prime directive | Untouched — correctly |

## Decisions so far

<!-- Closed tickets only. -->

- [Define Righting's AI-oriented operating model](issues/01-define-rightings-ai-oriented-operating-model.md) — `righting.json` is the approved architecture manifest consumed selectively by deterministic adapters and focused advisory skills, with maintainers retaining decision authority.
- [Define Righting's response to dogfood Engine-to-Engine conflicts](issues/02-rule-on-the-dogfood-engine-to-engine-edges.md) — existing forbidden edges are explicitly baselined debt under the strict desired graph; only an intended future relationship warrants a policy override.
- [Assess a code-shape evidence surface](issues/03-assess-a-code-shape-evidence-surface.md) — reject a separate evidence surface; add an alias-driven adapter role-visibility warning while leaving semantic naming and cardinality to agent review.
- [Research change-history evidence for volatility classification](issues/04-research-change-history-evidence-for-volatility.md) — use bounded Git churn, co-change, declaration-join, and coverage facts to guide agent judgment without treating history as volatility proof.

## Not yet specified

- None currently; the operating-model decision made the remaining capability and routing questions precise enough to ticket.

## Out of scope

- Band 6, business alignment (prime directive, core-use-case discovery, "there is no feature"): permanently human; the tool must not automate it.
- Implementing any decision; this map ends at implementation-ready handoffs.
- Committing the already-landed cost notes and design-review probes; that is ordinary worktree flow, not a wayfinding decision.
