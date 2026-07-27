## Outcome
unresolved

## Evidence
### Decision packet
**Current terrain: intermingled candidates.** The repository has one product goal—turn a home-connector UETS signal into private follow-up work for one lawyer—while UETS remains authoritative (`docs/SPEC.md:3-17`). It has three materially different operational models: Gmail ingestion/diagnosis, Product-task attention management, and browser-device notification delivery. The current realization is role-oriented rather than context-oriented: one Worker composes ingestion, task access, alert delivery, reminder delivery, and Web Push (`src/worker.ts:1-70`); `tasks.access.ts` atomically creates a task, New task alert, and alert targets (`src/access/tasks.access.ts:46-114`).

**Recommendation (proposal, medium confidence):** refine a three-context design:
1. **Home Gmail Connector** translates Gmail/UETS notification input and operator recovery into a minimal ingestion contract.
2. **UETS Follow-up Work** owns the lawyer's Product task and its manual-UETS-review workflow.
3. **Device Notification Delivery** owns browser enrollment and best-effort New task alert/Reminder delivery execution.

This is supported by distinct purposes and external constraints: the home-local connector has its own IMAP cursor, sender filter, backfill, diagnosis, and replay workflow (`scripts/home_uets_connector.py:25-44`, `:132-159`); Product task state records the lawyer's manual review (`CONTEXT.md:8-11`; `docs/DECISIONS.md:75-81`); and device delivery has bounded attempts, endpoint outcomes, and an explicit no-task-state-change rule (`tickets.md:583-611`).

**Conservative alternative (proposal, medium confidence):** retain a single **Private UETS Follow-up** context containing connector, task, calendar/reminder, and device-delivery models. It better matches the explicit one-lawyer/one-private-workflow decision (`docs/DECISIONS.md:15-17`), the single Worker/D1 realization, and the absence of a maintainer-approved context map.

**Strongest counterevidence:** project records define modules, not strategic contexts (`CONTEXT.md:3-25`); change authority is not recorded; and the current transaction/query model directly joins task, reminder, and device-delivery data (`src/access/reminder-deliveries.access.ts:80-133`). Thus topology does not approve the recommended boundaries.

**Boundary-changing uncertainty:** should connector operations and browser-push delivery be independently changeable business responsibilities, or are they deliberately inseparable parts of one personal follow-up workflow? That decision determines whether any context boundary is appropriate.

### Inspected scope and evidence limits
- Read `AGENTS.md`, `CONTEXT.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `tickets.md`, `docs/adr/0001-home-local-message-diagnosis.md`, `righting.json`, the installed Righting policy-language and capability records, representative workflow source, the home-connector script, relevant history, and source topology.
- `CONTEXT-MAP.md` is absent. No authoritative bounded-context approval or change-authority record was found. Human ownership/change authority is therefore **unknown**, not inferred from module names, the single lawyer, or Git history.
- The project-local executable exists at `node_modules/.bin/righting` (a local symlink resolving to `/Users/kgnugur/Codes/Personal/righting-software-tooling/dist/src/cli.js`). Running it from the target produced a valid policy and normalized contract: 76 covered files; Client 23, Manager 11, Engine 24, ResourceAccess 12, Utility 1; 28 tests; 4 composition roots; no unclassified/ambiguous sources and no source violations. Adapter status is `unknown`. `righting.json:1-40` has `pureEngines` only—no `contextFirewall` or scopes. The inspection reported no warnings.
- The existing policy's context-firewall capability is inactive. Per the installed capability record, a future firewall could only statically forbid configured cross-context and shared-to-context source imports; it would not establish runtime behavior, ownership, migration completion, or design quality.
- Full migration/schema inventory and exhaustive source review were **not inspected** because approval is the current decision gate. No project files were changed.

## Approval
No explicit approval exists for either proposed design, and no authoritative context map supplies one. The strategic design is unresolved pending the single boundary decision below.

## Approved design
**No design is approved. The following are proposals only.**

### Recommended proposal — three contexts

**Home Gmail Connector**
- **Purpose; users/jobs; responsibilities:** safely turn a Gmail UETS notification into a minimal authenticated ingestion request; the Home-server operator polls, backfills, diagnoses, and replays. It owns sender acceptance, extraction, cursor progress, diagnosis/replay selection, and safe operational reporting—not UETS authority or Product-task state.
- **Owned model and language:** `UETS notification email`, `Geldiği yer`, `Connector message identity`, `Connector diagnosis`, `Connector replay`, `Connector ingestion outcome`, and `Gmail connector status` (`CONTEXT.md:5-6,16-25`). `Official electronic tebligat` remains an external UETS model (`CONTEXT.md:7`).
- **Owner/change authority:** unknown.
- **Relationships:** proposed translation to UETS Follow-up Work. Home Gmail Connector → UETS Follow-up Work: normalized message identity, sender, subject, received time, and `Geldiği yer`; UETS Follow-up Work → Home Gmail Connector: `created`/`duplicate`/`rejected` acknowledgment. The connector's acceptance/cursor rules influence what may enter follow-up work, but not its task state. Model treatment: **translate**, not share; the script advances only after an accepted acknowledgment (`scripts/home_uets_connector.py:25-44`, `:132-159`) and the app returns the three outcomes (`src/connector-message.manager.ts:50-69`). Gmail/UETS and the home-server operator are external actors, not reverse context exchanges.
- **Evidence/counterevidence:** separate home-server/IMAP and operator contract is specified in `docs/SPEC.md:14-15,38-41` and implemented in `scripts/home_uets_connector.py`; however, parsing/ingestion also lives under the same repository's `src/connector-message.manager.ts:1-69`.
- **Confidence:** medium—its independent external system and operational model are clear, but independent change authority is unknown.
- **Current code fit (realization evidence):** mixed: the connector script is separate under `scripts/` (outside Righting coverage), while receiving/validation code is in `src/`.

**UETS Follow-up Work**
- **Purpose; users/jobs; responsibilities:** let the lawyer turn a signal into private, manually reviewed follow-up work without replacing UETS. It owns Product-task creation/deduplication, active/completed state, notes, date-only Reminder intent, calendar representation/color, and deletion.
- **Owned model and language:** `Product task`, `Reminder`, `Calendar entry`, `Task color slot`, and the user-confirmed UETS review (`CONTEXT.md:8,10,14-15`; `docs/DECISIONS.md:75-85`). `Geldiği yer` is retained task data but does not make the app an authority.
- **Owner/change authority:** unknown.
- **Relationships:** receives translated notification metadata from Home Gmail Connector as above. Proposed UETS Follow-up Work → Device Notification Delivery: requests for a New task alert or due Reminder delivery, containing only a task reference/destination, `Geldiği yer`, subject, eligibility/expiry, and task lifecycle suppression. Device Notification Delivery → UETS Follow-up Work: **none**; a browser click is an external-party navigation, not a context return flow. The request influences what delivery work is eligible, while delivery outcome never changes Product-task state. Model treatment: **translate**, not share.
- **Evidence/counterevidence:** the core journey creates a task before the lawyer reviews UETS, enters notes/reminder, and completes it (`docs/SPEC.md:14-17`); product rules make task retention and deletion authoritative (`docs/SPEC.md:42-45`). Counterevidence is the current atomic task-plus-alert write and reminder lifecycle in the same access layer (`src/access/tasks.access.ts:46-114`).
- **Confidence:** medium—task language and responsibility are durable records, but the proposed outbound boundary is not approved.
- **Current code fit (realization evidence):** mixed: task/calendar UI, engines, managers, and `src/access/tasks.access.ts` are organized by technical role and include notification-side writes.

**Device Notification Delivery**
- **Purpose; users/jobs; responsibilities:** let the lawyer explicitly manage supported browser Devices and receive bounded, best-effort prompts; it owns delivery execution and truthful delivery outcomes, never proof of attention or UETS review.
- **Owned model and language:** `Device enrollment`, `Reminder delivery`, `Reminder delivery attempt`, and `New task alert` delivery work (`CONTEXT.md:9,11-13`). A `Reminder` remains a UETS Follow-up Work date-only intent in this proposal; its delivery candidates/targets are delivery execution state.
- **Owner/change authority:** unknown.
- **Relationships:** consumes the translated Follow-up request described above; it has no return context exchange. It interacts separately with browser push services, which supply endpoint acceptance/rejection but no task-state rule or return flow to Follow-up Work. Its delivery result affects enrollment revocation/retry behavior only; it does not mutate the Product task (`tickets.md:588-595`, `:624-629`). Model treatment: **translate**.
- **Evidence/counterevidence:** device privacy/capacity and endpoint material are distinct (`src/access/device-enrollments.access.ts:46-105,120-140`); scheduled delivery is bounded and explicitly does not change task state (`src/reminder-delivery.manager.ts:76-118`). Counterevidence is direct task joins/current-version checks in delivery access (`src/access/reminder-deliveries.access.ts:88-123`) and the single Worker composition (`src/worker.ts:45-70`).
- **Confidence:** medium—its technical/external rules are distinct, but records may intend it as a feature within one workflow rather than an independently governed context.
- **Current code fit (realization evidence):** mixed: named delivery/enrollment access and managers exist, but task access creates and suppresses related delivery work and all share D1/Worker wiring.

### Conservative proposal — one context

**Private UETS Follow-up**
- **Purpose; users/jobs; responsibilities:** provide one lawyer's private end-to-end workflow from home-Gmail signal through manual UETS review, task tracking, calendar/reminder, and optional best-effort device prompts. It would own all current internal models and integration contracts while preserving UETS as external authority.
- **Owned model and language:** all project terms above, including `UETS notification email`, `Geldiği yer`, `Product task`, `Reminder`, `New task alert`, `Device enrollment`, and `Reminder delivery attempt`; `Official electronic tebligat` remains external.
- **Owner/change authority:** unknown.
- **Relationships:** Home Gmail/Gmail → Private UETS Follow-up: normalized notification metadata; Private UETS Follow-up → Home Gmail: ingestion outcome. Private UETS Follow-up → browser push service: bounded delivery request; push service → Private UETS Follow-up: safe endpoint outcome. Both are **translate** relations with external services, not shared models; browser navigation is user action, not a reverse context exchange.
- **Evidence/counterevidence:** the personal-MVP decision and single core journey support one model (`docs/DECISIONS.md:15-17`; `docs/SPEC.md:12-17`), and the current realization composes all flows in one Worker/D1 (`src/worker.ts:1-70`). The counterevidence is the distinct operational language and independent external constraints described in the recommended proposal.
- **Confidence:** medium—this is the least boundary-committing interpretation of authoritative records, but it may hide independently changing connector and delivery responsibilities.
- **Current code fit (realization evidence):** inside: current repository realization is one application with shared Worker/D1 composition; scripts remain outside the policy coverage but in the same repository.

## Domain documents
None. Strategic approval is incomplete; `CONTEXT.md`, `docs/DECISIONS.md`, and `righting.json` remain unchanged.

## Migration advice
No migration or application-code change is authorized. If the three-context proposal is approved, first record the approved map and the two translated contracts; then inventory the current cross-model D1 transactions before assigning folders or firewall scopes. Keep task state and delivery outcome semantics intact during any later extraction, and validate the connector acknowledgment/cursor path plus task completion/deletion suppression paths. If the single-context alternative is chosen, record that deliberate omission and reassess only when ownership, deployment, or independent change pressure appears.

## Context firewall
Unresolved. No `contextFirewall` candidate is presented because the design has no explicit or authoritative approval. The current valid policy intentionally has no scopes (`righting.json:26-39`), and the pre-approval bounded pass does not classify the full firewall universe.

## Capability limits
The current inspection validates only the configured role/import policy over `src/**/*.{ts,tsx}`; it found no source violations. A later approved `contextFirewall` could statically check configured cross-context and shared-to-context source imports only. It cannot prove runtime isolation, external Gmail/browser-push behavior, transaction boundaries, ownership, actual migration completion, or the semantic quality of these proposals. `scripts/home_uets_connector.py` is outside current policy coverage.

## Next step
**Which strategic model should be refined for complete approval?** (This decides whether to create any boundary at all.) **A.** Recommended: three contexts—Home Gmail Connector, UETS Follow-up Work, and Device Notification Delivery; **B.** Conservative: one Private UETS Follow-up context for now; **C.** Other/uncertain. **Recommendation: A**, because the connector and browser delivery have distinct external rules and non-task-state models; choose B if their change authority and lifecycle are intentionally one workflow.
