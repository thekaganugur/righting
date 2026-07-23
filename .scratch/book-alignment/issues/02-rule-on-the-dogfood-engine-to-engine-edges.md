# Define Righting's response to dogfood Engine-to-Engine conflicts

Type: grilling
Labels: wayfinder:grilling
Status: resolved

## Question

Use two `Engine → Engine` edges from the external `uets-to-task` adoption as read-only evidence for a Righting product decision, without deciding or changing that project's architecture. Every adoption replay found that `calendar-entry.engine.ts` and `reminder-delivery.engine.ts` import `turkey-time.engine`, while the project guidance tells agents to promote shared code into `src/engines`.

The book treats Engine-to-Engine calls as evidence of likely functional decomposition. Righting already forbids the edge mechanically but permits a reason-recorded global override. Decide what Righting should do when an adoption exposes this conflict between a deterministic rule and project guidance:

- what facts tooling reports without classifying the design;
- what focused agent investigation must distinguish among a conscious exception, Utility reclassification, and volatility-boundary restructuring;
- whether adoption may complete with an approved override or must remain blocked until the project resolves the classification;
- what `righting.json` must declare under the approved architecture-manifest model; and
- what generic guidance belongs in Righting's integration flow without encoding `uets-to-task`-specific conclusions.

End with an implementation-ready Righting product and adoption-protocol decision. The external project remains read-only and must make its own architectural ruling in its own process.

## Answer

An existing forbidden edge is not evidence that the relationship belongs in the desired architecture. Righting adoption separates **approved architecture** from **grandfathered implementation debt**:

- `righting.json` declares the desired role graph. It keeps `Engine → Engine` forbidden unless the maintainer explicitly says that relationship itself is intended architecture and approves a reason-recorded override.
- Existing forbidden occurrences that are inconsistent with, or uncertain under, the desired graph are grandfathered in the adapter's legacy baseline. Their presence does not broaden future policy.
- Adoption may complete with that approved baseline. New debt and baseline growth remain forbidden; removing debt tightens the baseline. When and how existing debt is refactored is the maintainer's concern, not an adoption requirement.

### Deterministic report

For each occurrence, tooling reports the source and target, configured roles, effective policy result, applicable diagnostic, current baseline status, and scan/coverage limits. These are facts. It does not classify the edge as functional decomposition, an incorrect role, or a justified exception.

### Adoption protocol

The integration agent asks one narrow question: **Is this relationship desired architecture?**

- **Yes:** propose the exact reason-recorded override for approval. The override is policy-wide, so future occurrences are allowed deliberately.
- **No or uncertain:** retain the strict default and include the current occurrences in the initial legacy-debt inventory. Strict-plus-baseline is the conservative response to uncertainty.

The agent presents one exact inventory-level approval packet containing all initial violations, covered files, evidence limits, and baseline files/commands. The maintainer approves grandfathering the packet as a whole; no separate architectural ruling is required for every occurrence. Baseline creation is never silent or automatic.

Adoption does not investigate or recommend Utility reclassification, Engine merging, or other remediation. A maintainer who wants design help invokes a focused advisory skill separately. This keeps integration from becoming a refactoring project.

### Product guidance

Package guidance uses a generic forbidden-edge example and teaches the distinction:

- an intended relationship changes `righting.json`;
- existing inconsistency or uncertainty changes legacy-debt state;
- optional remediation belongs to a separately invoked focused skill.

The external `uets-to-task` project remains read-only release evidence. Righting records no project-specific architectural conclusion and does not name the project in generic package guidance.

The broader semantics and mechanics—new versus existing projects, exact occurrence identity, same-count swaps, policy expansion, advisory legacy inconsistencies, and ownership between the manifest and adapter-native files—are delegated to [Define Righting's legacy-first adoption lifecycle](10-define-rightings-legacy-first-adoption-lifecycle.md).
