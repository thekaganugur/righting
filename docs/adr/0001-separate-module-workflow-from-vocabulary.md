---
status: accepted
---

# Separate the Architecture Module workflow from its specialists

The Architecture Module vocabulary is owned by [`righting-module-design`](../../skills/righting-module-design/SKILL.md). To keep skill routing predictable, `righting-volatility-review` owns review-only discovery, `righting-deep-modules` routes the end-to-end decision flow, and `righting-module-design` supplies vocabulary and shape guidance underneath.

## Considered options

We rejected equal, overlapping design workflows and making the vocabulary private. The chosen split preserves direct access when Module shape is the question without making users coordinate the end-to-end flow themselves.
