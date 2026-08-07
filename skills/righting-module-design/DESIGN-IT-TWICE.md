# Design It Twice

When the user wants to explore alternative Interfaces for a chosen deepening candidate, use fresh-context independent designs when delegation is available. When delegation is unavailable, run a constrained sequential comparison from orthogonal briefs. Based on "Design It Twice" (Ousterhout) — your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md) — **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before producing alternatives, write a user-facing explanation of the problem space for the chosen candidate. Honor all supplied domain-specific constraints from the calling skill:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints — not a proposal, just a way to make the constraints concrete

Show this to the user, then immediately proceed to Step 2. The user reads and thinks while fresh-context designers work in parallel, or while the sequential fallback is drafted.

**Completion:** the constraints, dependency categories, and grounding sketch are visible before any alternative is presented.

### 2. Produce alternatives

When a delegation tool is available, spawn 3+ fresh-context sub-agents in parallel; each produces an independent, materially different Interface for the deepened Module. When delegation is unavailable, produce at least three alternatives sequentially from the orthogonal briefs below and label the result a **constrained comparison**. Freeze each draft until every alternative exists, then compare them in Step 3.

Give each designer a separate technical brief with file paths, coupling details, the dependency category from [DEEPENING.md](DEEPENING.md), what sits behind the Seam, and every constraint supplied by the calling skill. Fresh-context briefs omit the user-facing explanation and other alternatives. The sequential fallback uses the same technical facts with one distinct objective per draft. A calling skill may replace these defaults with its domain-specific factoring constraints; otherwise use:

- Alternative 1: "Find the smallest coherent Interface. Maximise Leverage without optimizing for a numeric member target."
- Alternative 2: "Maximise flexibility — support many use cases and extension."
- Alternative 3: "Optimise for the most common caller — make the default case trivial."
- Alternative 4 (if applicable): "Design around ports and Adapters for cross-Seam dependencies."

Include both [SKILL.md](SKILL.md) vocabulary and CONTEXT.md vocabulary in the brief so each sub-agent names things consistently with the architecture language and the project's domain language.

Each designer outputs:

1. Interface: types, methods, parameters, invariants, ordering, error modes, required configuration, and relevant performance semantics
2. Usage example showing how callers use it
3. What the Implementation hides behind the Seam
4. Dependency strategy and Adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs — where Leverage is high, where it is thin

**Completion:** at least three complete alternatives use materially different Interface shapes or Seam placements and satisfy every supplied constraint.

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated — the user wants a strong read, not a menu.

**Completion:** the user receives every design, the comparison, and one reasoned recommendation or hybrid.
