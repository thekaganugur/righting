## Outcome
unresolved

## Evidence
**Decision packet — current terrain:** Established product semantics but **mixed** realization. There is no `CONTEXT-MAP.md`; `CONTEXT.md` is an authoritative vocabulary/implementation-owner record, not an approved strategic map. It distinguishes the Home Gmail connector from the Future attention workflow and Future reminder, while the current Worker and `tasks` access layer compose their workflows together (`CONTEXT.md:5-23`, `src/worker.ts:29-52`, `src/access/tasks.access.ts:46-442`). The repository serves one lawyer and one private end-to-end journey (`docs/SPEC.md:5,14-17`), which is the strongest evidence for retaining one context.

**Recommendation (medium confidence):** approve two coarse contexts: **Home Gmail connector** and **Future attention workflow**. The connector has a separate external system, credentials/cursor, exact-source acceptance, recovery operations, and a request/response ingestion contract. The attention workflow has the lawyer-facing Product task lifecycle and decides reminders, device enrollment, calendar, and best-effort prompts. Their models and failure semantics differ materially.

**Conservative alternative (medium confidence):** retain a single proposed **Private UETS follow-up** context. It explains the one-user MVP and the existing transaction and runtime composition without inferring an independently evolving connector boundary.

**Distinguishing evidence:** the Python connector selects Gmail INBOX data, owns UID progress, and posts only accepted metadata, receiving `created`/`duplicate`/`rejected` (`scripts/home_uets_connector.py:47-72,215-260,431-482`). The receiving application translates that input into a Product task and independently launches alert work (`src/connector-message.manager.ts:45-61`, `src/access/tasks.access.ts:46-109`). The lawyer workflow then controls task completion/reopening/detail changes and reminder candidates (`src/task-action.manager.ts:1-36`, `src/access/tasks.access.ts:192-314`); scheduled reminder delivery rechecks the Product task rather than changing it (`src/reminder-delivery.manager.ts:77-163`).

**Strongest counterevidence:** the authoritative goal is explicitly one connector to one lawyer’s private follow-up work; the `tasks` table/access code owns both connector-created task data and reminder lifecycle, and the Worker composes ingestion, alerts, and reminders (`docs/SPEC.md:5-17`, `src/access/tasks.access.ts`, `src/worker.ts`). The tracker also treats “Complete home connector → product task” as one delivery (`tickets.md:37-60`). This supports the conservative one-context model and means topology alone cannot approve a split.

**Highest-impact uncertainty:** whether the Home Gmail connector has a separately authorized change authority and is intended to evolve/deploy independently from the lawyer’s attention workflow. Records identify a “Home-server operator” but do not establish change authority (`CONTEXT.md:15`); owner/change authority is therefore **unknown**.

**Design evidence inspected:** `AGENTS.md`; `CONTEXT.md`; `docs/SPEC.md`; `docs/DECISIONS.md`; `tickets.md`; `docs/adr/0001-home-local-message-diagnosis.md`; `docs/specs/reminder-deliveries.md`; `docs/specs/new-task-alerts.md`; `README.md`; connector script; representative Worker, manager, access, route, component, service-worker, migration, and test paths; `wrangler.jsonc`; recent Git history. `CONTEXT-MAP.md`, `docs/tebligat-product-context.md`, and `docs/branding.md` were verified absent. No separate ownership/change-authority record was found. Other repository material is **not inspected**.

**Realization evidence:** target-local `node_modules/.bin/righting` exists and resolves to `/Users/kgnugur/Codes/Personal/righting-software-tooling/dist/src/cli.js`. Its project-root `inspect --json` reports valid `righting.json`, adapter status `unknown`, 76 covered `src/**/*.{ts,tsx}` files (23 Client, 11 Manager, 24 Engine, 12 ResourceAccess, 1 Utility; 4 composition roots), no source violations, and no unclassified or ambiguous source. The effective contract has `pureEngines`, but no `contextFirewall`, scopes, or scope classification (`righting.json:3,26`). This is mechanical realization evidence only. The installed Righting policy/capability references say a firewall must follow maintainer-identified, approved contexts and can only establish static source-import boundaries, not runtime behavior or design quality (`node_modules/righting/docs/policy-language.md`, `node_modules/righting/docs/capabilities.md`).

## Approval
No explicit or authoritative approval of a complete strategic context design exists. `CONTEXT.md` supplies vocabulary and implementation ownership; `docs/DECISIONS.md` supplies durable product decisions; neither approves a bounded-context map. The decision remains unresolved pending the question in **Next step**.

## Approved design
**Proposals only — not approved.**

### Recommended design: two contexts

**Home Gmail connector**
- **Purpose; users/jobs; responsibilities:** turn a Gmail signal into safe notification metadata and maintain recoverable home-server ingestion. The Home-server operator polls, backfills, diagnoses, and explicitly replays; the context owns exact-sender selection, UID cursor progress, `Geldiği yer` extraction, safe failure/heartbeat reporting, and ingestion acknowledgement handling.
- **Owned model/language:** `UETS notification email`, `Geldiği yer`, `Gmail connector status`, `Connector diagnosis`, `Connector replay`, `Connector message identity`, `Connector diagnostic outcome`, `Connector ingestion outcome`, and `Ambiguous connector selection` — all verbatim `CONTEXT.md` language.
- **Owner/change authority:** unknown. The operator is an external operational actor, not evidence of authority to change this model.
- **Design evidence/counterevidence:** the separate IMAP/App Password/cursor and replay contract support a distinct anti-corruption boundary (`docs/SPEC.md:14-15,35-41`; `scripts/home_uets_connector.py:47-72,215-260,431-482`). Counterevidence: it serves only the same private product and its receiver is in the same Worker/repository (`docs/SPEC.md:5-17`; `src/worker.ts:29-52`).
- **Confidence:** medium — independent source system, model, and operational failure modes are explicit; separate change authority is not.
- **Current code fit (realization evidence):** mixed. The home behavior is `scripts/home_uets_connector.py`, but its receiving behavior is intermingled with application task access and Worker composition (`src/connector-message.manager.ts`, `src/access/tasks.access.ts`, `src/worker.ts`).

**Future attention workflow**
- **Purpose; users/jobs; responsibilities:** let the lawyer record and revisit private follow-up after independently checking UETS. It owns Product task state, notes, deletion, calendar representation, user-entered Reminders, Device enrollments, and best-effort Reminder deliveries/New task alerts without asserting UETS delivery, review, or legal deadlines.
- **Owned model/language:** `Product task`, `New task alert`, `Reminder`, `Reminder delivery`, `Device enrollment`, `Reminder delivery attempt`, `Calendar entry`, and `Task color slot` — verbatim `CONTEXT.md` language. `Future attention workflow` is also the existing vocabulary owner label.
- **Owner/change authority:** unknown. “Lawyer” is the user persona, not evidence of change authority.
- **Design evidence/counterevidence:** the Product task is deliberately an internal follow-up model and push/reminder actions never mutate its state (`CONTEXT.md:8-13`; `docs/SPEC.md:16-17,29-32`; `src/task-action.manager.ts:1-36`; `src/reminder-delivery.manager.ts:77-163`). Counterevidence: `CONTEXT.md` assigns reminder terms separately to “Future reminder,” so the exact internal submodel grouping has not been strategically approved.
- **Confidence:** medium — the lawyer-facing purpose and lifecycle are explicit, while its relationship to the separately named Future reminder remains a coarsening inference.
- **Current code fit (realization evidence):** mixed. Task mutations and reminder candidate creation share `src/access/tasks.access.ts`; delivery/access, UI, and Worker paths are spread across `src/access/`, `src/components/`, `src/routes/`, and `src/worker.ts`.

**Decision-relevant relationship: Home Gmail connector → Future attention workflow**
- **Direction and influence:** connector → attention workflow. Connector eligibility, extracted metadata, and acknowledgement outcome constrain whether a Product task is created; the attention workflow’s acknowledgement controls connector cursor/retry progress.
- **Exchange in each direction:** connector → attention: authenticated `POST /ingest` carrying Message-ID, sender, subject, received time, and `Geldiği yer`; attention → connector: `202` JSON `created`, `duplicate`, or `rejected` (or transport failure). This producer/consumer path is verified at `scripts/home_uets_connector.py:431-460` → `src/worker.ts:29-33` → `src/connector-message.manager.ts:45-61` → `src/access/tasks.access.ts:46-109` → connector response handling.
- **Model treatment:** translate. Notification metadata is not shared as the Product task model; the receiver derives/deduplicates an internal Product task and returns a connector ingestion outcome.

**External relationships (not proposed contexts):** Gmail IMAP supplies message/header/body reads to the Home Gmail connector; it has no application-domain return exchange beyond IMAP protocol responses (`scripts/home_uets_connector.py:83-172`). Web Push services receive a bounded delivery request from the Future attention workflow and return an HTTP outcome; they neither own nor mutate Product task state (`src/access/web-push.access.ts:115-148`, `src/reminder-delivery.manager.ts:131-158`). UETS is the external authority the lawyer checks directly, not an application integration (`docs/SPEC.md:17,53`).

### Conservative alternative: one context

**Private UETS follow-up** *(proposed name)*
- **Purpose; users/jobs; responsibilities:** provide the one lawyer’s entire private flow from a home Gmail notification signal through a Product task, manual UETS review, calendar/reminder, and best-effort device prompt; preserve UETS as the external authority.
- **Owned model/language:** the combined verbatim language above: `UETS notification email`, `Geldiği yer`, connector status/diagnosis/replay/outcome, `Product task`, `Reminder`, `Reminder delivery`, `New task alert`, `Device enrollment`, `Calendar entry`, and `Task color slot`.
- **Owner/change authority:** unknown.
- **Decision-relevant relationships:** Gmail IMAP → this context supplies notification data and receives protocol responses; this context → Web Push service sends a safe payload and receives a status; lawyer ↔ this context supplies task/reminder/device commands and receives dashboard/prompt views. Models are isolated at all three external boundaries. The connector’s `POST /ingest` request and `created`/`duplicate`/`rejected` return remain internal workflow steps rather than a context exchange.
- **Design evidence/counterevidence:** one-user purpose, one journey, one task persistence boundary, and one Worker composition support it (`docs/SPEC.md:5-17`; `src/access/tasks.access.ts`; `src/worker.ts`). Counterevidence: the connector’s Gmail/cursor/recovery model and its explicit translation contract are materially unlike Product task attention (`scripts/home_uets_connector.py:47-72,431-482`; `CONTEXT.md:5,8,16-23`).
- **Confidence:** medium — it is the least assumptive design, but may hide a real connector boundary if independent authority is confirmed.
- **Current code fit (realization evidence):** mixed. `src` has a unified policy coverage and no scopes, while connector behavior, Worker composition, persistence, and UI are distributed across `scripts/`, `src/`, and migrations.

## Domain documents
None. Strategic approval is incomplete, and the repository is read-only for this replay.

## Migration advice
No application-code or policy change is advised before approval. If the two-context design is approved later, first record the semantic map and the connector-to-attention translation contract; then assess whether the current mixed `src`/`scripts` terrain needs a gradual entry-point/adapter separation. Preserve the authenticated ingestion acknowledgement and UETS authority boundary during any migration. If the single-context alternative is approved, document why connector operations remain a submodel and revisit only if its change authority or delivery lifecycle separates. In either case, validate behavior with existing connector, task, reminder, alert, Worker, and service-worker suites; do not infer runtime isolation from static imports.

## Context firewall
Unresolved. No approved context identities, exact scope paths, or approved relationship map exist; `righting.json` has no `contextFirewall` variation or scopes. Per the installed policy language, a candidate cannot be classified or mechanically validated before approval. `righting.json` remains unchanged.

## Capability limits
The current Righting contract statically governs role dependencies only within `src/**/*.{ts,tsx}` and reports no current source violations. It does not cover the Python connector, migrations, public service worker, runtime network behavior, independent deployment/change authority, semantic translation correctness, or adapter activation. A later `contextFirewall` could statically forbid configured context-to-context and shared-to-context source imports only; it would not prove runtime isolation, ownership, migration completion, or design quality.

## Next step
Which model should be developed into the complete approval packet? **A. Recommended: two contexts — Home Gmail connector and Future attention workflow** (recommended; recognizes the evidenced translation boundary); **B. Conservative: one Private UETS follow-up context** (keeps the one-lawyer MVP whole); **C. Other/uncertain** (state the intended independent authority or boundary).