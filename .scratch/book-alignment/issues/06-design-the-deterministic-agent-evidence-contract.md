# Design the deterministic agent-evidence contract

Type: prototype
Labels: wayfinder:prototype
Status: open

## Question

Prototype the focused machine surface that prevents agents from improvising architecture facts while keeping `righting inspect --json` a fast orientation/router.

Using the operating model in [Define Righting's AI-oriented operating model](01-define-rightings-ai-oriented-operating-model.md), produce a rough CLI/API and JSON contract for:

- validating a candidate manifest against the real project without applying it;
- expanding mapping and scope globs to concrete files;
- enumerating import occurrences and resolution outcomes;
- distinguishing covered, uncovered, unresolved, and external dependencies; and
- citing capability and proof limits without inferring roles, volatility, or architectural quality.

Test the prototype shape against the inconsistent counts observed in the `uets-to-task` dogfood replays. Decide command boundaries, stable identifiers, performance expectations, and whether focused evidence surfaces share one envelope. The result is an implementation-ready contract proposal, not implementation.
