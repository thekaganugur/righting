# Design It Twice

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this independent-design pattern. Run it in parallel when delegation is available and sequentially otherwise. Based on "Design It Twice" (Ousterhout) — your first idea is unlikely to be the best.

Uses the vocabulary in [SKILL.md](SKILL.md) — **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Before producing alternatives, write a user-facing explanation of the problem space for the chosen candidate. Honor all supplied domain-specific constraints from the calling skill:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints — not a proposal, just a way to make the constraints concrete

Show this to the user, then immediately proceed to Step 2. The user reads and thinks while the sub-agents work in parallel.

### 2. Produce independent alternatives

When a delegation tool is available, spawn 3+ sub-agents in parallel. When delegation is unavailable, produce the same independently framed alternatives sequentially; finish each against its own brief before reading or revising another. Each alternative must propose a **radically different** Interface for the deepened Module.

Give each designer a separate technical brief with file paths, coupling details, the dependency category from [DEEPENING.md](DEEPENING.md), what sits behind the Seam, and every constraint supplied by the calling skill. Keep each brief independent of both the user-facing explanation in Step 1 and the other alternatives. A calling skill may replace these defaults with its domain-specific factoring constraints; otherwise use:

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

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated — the user wants a strong read, not a menu.
