# Rule on the dogfood Engine-to-Engine edges

Type: grilling
Labels: wayfinder:grilling
Status: open

## Question

As maintainer of the `uets-to-task` adoption, rule on the two `Engine → Engine` edges that every adoption replay surfaced: `src/engines/calendar-entry.engine.ts:1` and `src/engines/reminder-delivery.engine.ts:1` both import `turkey-time.engine`.

The book is blunt — "Engines never call each other" (Design Don'ts, `03-structure.md`): an Engine should already encapsulate everything about its activity, so an Engine-to-Engine call indicates functional decomposition. The project's own `AGENTS.md`, however, directs shared code to be promoted into `src/engines`. The two guides pull in opposite directions.

Choose one, with the reasoning recorded:

1. **Approve a reason-recorded `allow` override** — a conscious, named deviation from the book (the replay packets' majority proposal).
2. **Reclassify `turkey-time` as a Utility** — must pass the book's cappuccino-machine litmus (could any system use it?); project-specific Istanbul-time product rules likely fail it.
3. **Merge or restructure the engines** — if calendar values and reminder scheduling are one volatility, not two.

Also decide where the ruling is recorded (the adoption's integration record and/or the project's `docs/DECISIONS.md`), since this adoption is release evidence for the integration skill.
