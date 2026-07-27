## Outcome
unresolved

## Evidence
**Inspected.** `AGENTS.md`; the current root vocabulary in `CONTEXT.md`; `docs/SPEC.md`; `docs/DECISIONS.md`; all of `tickets.md`; `docs/specs/reminder-deliveries.md`; `docs/specs/new-task-alerts.md`; `README.md`; `scripts/README.md`; `scripts/home_uets_connector.py`; `wrangler.jsonc`; `righting.json`; the installed Righting `docs/policy-language.md` and `docs/capabilities.md`; representative application paths including `src/worker.ts`, `src/connector-message.manager.ts`, `src/access/tasks.access.ts`, `src/engines/connector-message.engine.ts`, `src/reminder-delivery.manager.ts`, `src/access/reminder-deliveries.access.ts`, `src/new-task-alert.manager.ts`, `src/access/new-task-alerts.access.ts`, `src/access/device-enrollments.access.ts`, `src/routes/index.tsx`, `src/routes/devices.tsx`, and `src/dashboard-access.manager.ts`; all current `src` path names; migrations; and relevant Git history. `npx righting inspect --json` succeeded: 76 covered source files, no source violations, and no configured scopes/context firewall.

**Unavailable or not established.** `README.md` links to `docs/tebligat-product-context.md`, but that file is absent. There is no `CONTEXT-MAP.md`, ownership record, or explicit bounded-context approval. Separate change authority is therefore **unknown**. I did not run product tests because this was a read-only strategic replay, not a code change. The current uncommitted skill changes shown by `git status` were not treated as product evidence.

**Design evidence.**
- The product purpose is one lawyer's private follow-up after a UETS notification; UETS remains authoritative and the app neither verifies it nor determines legal deadlines (`docs/SPEC.md`, `docs/DECISIONS.md`, `CONTEXT.md`).
- The home connector has distinct operational rules and custody: it runs on a private home server, holds Gmail App Password/cursor outside the repository, polls Gmail, accepts only the exact sender, extracts `Geldiği yer`, supports bounded backfill and operator-selected diagnose/replay, and posts through a distinct bearer credential (`docs/SPEC.md`; `scripts/README.md`; `scripts/home_uets_connector.py`; `src/engines/connector-message.engine.ts`).
- The private workflow has a separate, rich model: Product task state and deletion, manual UETS review, notes, Istanbul-date Reminders, calendar entries/color, Device enrollments, Reminder deliveries, and New task alerts (`CONTEXT.md`; `docs/specs/reminder-deliveries.md`; `docs/specs/new-task-alerts.md`; `tickets.md`; `src/engines/reminder-delivery.engine.ts`; `src/reminder-delivery.manager.ts`; `src/new-task-alert.manager.ts`).
- The intake-to-workflow handoff is semantically lossy by policy: the notification email is a signal; only sender, subject, received time, identifiers, and extracted origin are retained; email body/HTML/raw MIME/attachments are excluded (`docs/SPEC.md`; `CONTEXT.md`; `scripts/home_uets_connector.py`; `src/connector-message.manager.ts`). This supports translation rather than a shared model.

**Counterevidence and current terrain.** The product is deliberately a one-lawyer personal MVP, one Worker/D1 deployment, and its existing glossary assigns terms to volatility-oriented “owning module” roles rather than approved bounded contexts (`docs/SPEC.md`; `CONTEXT.md`; `wrangler.jsonc`). Current realization is a **muddy legacy region with one independently operated connector**: `src/access/tasks.access.ts` persists accepted connector messages and also owns Product-task state changes, reminder candidate lifecycle, calendar-color allocation, and alert suppression; `src/worker.ts` composes intake, reminders, and alerts in one deployment. This weakens an immediate claim that the two models are currently isolated, but does not negate their distinct purposes and language. Recent history also shows sustained, independently evolving delivery/calendar work alongside connector work (for example `52f1062`, `55a8871`, `243cfd9`).

**Recommendation confidence: medium.** Two coarse contexts best explain the separate external trust/operational model and the internal lawyer-work model, while retaining reminders, calendar, and push in the same workflow context because all are governed by Product-task state. Confidence is not high because no maintainer has stated that connector changes and personal-workflow changes have independent ownership or release authority.

## Approval
No bounded-context design has been explicitly approved. `CONTEXT.md` is authoritative vocabulary and names implementation-oriented owning modules, but it does not approve strategic context identities, ownership, or inter-context relationships. The present `righting.json` is a valid role policy, not approval of contexts; installed Righting guidance expressly says it does not infer architecture or record approval.

## Approved design
**None — proposal pending the decision below.**

### Recommended coarse design: two contexts

**UETS Notification Intake**
- **Purpose:** Turn a potentially relevant Gmail notification into an authenticated, minimized intake outcome without treating it as official tebligat.
- **Users/jobs and responsibilities:** The home-server operator runs/recoveries polling, backfill, diagnosis, and replay; the context validates the sender, extracts allowed origin metadata, prevents duplicate intake, reports connector health/failure, and produces accepted/rejected/duplicate outcomes.
- **Owned model and language:** UETS notification email (a signal, not official delivery), `Geldiği yer` extraction, Connector message identity, Connector diagnosis/replay, ambiguous connector selection, connector ingestion/diagnostic outcomes, and Gmail connector status. It does **not** own the Product task.
- **Owner/change authority:** unknown.
- **Relationships:**
  - **Personal UETS Follow-up:** direction Intake → Follow-up; influence unknown; exchange Intake → Follow-up is accepted, minimized notification metadata plus `created`/`duplicate`/`rejected` outcome, Follow-up → Intake is none; model treatment **translate**. No shared email/task model is proposed.
  - **Gmail:** direction Gmail → Intake; influence unknown; exchange Gmail → Intake is IMAP messages/headers, Intake → Gmail is none; model treatment **isolate**. Gmail transport rules are not Intake language.
  - **UETS:** direction UETS → Intake; influence UETS authority constrains Intake's safety claims; exchange in both directions is none (the notification signal arrives through Gmail, not a UETS integration); model treatment **isolate**.
- **Design evidence / counterevidence:** Separate secrets, cursor custody, cron, exact sender, and operator recovery behavior support this context (`docs/SPEC.md`, `scripts/README.md`, `scripts/home_uets_connector.py`). One Worker endpoint and `src/access/tasks.access.ts` currently combine creation with workflow persistence, weakening current separation.
- **Confidence:** medium — purpose and language differ sharply; independent authority is unknown.
- **Current code fit (realization evidence):** **mixed**. `scripts/home_uets_connector.py` is a strong fit; `src/connector-message.manager.ts` and `src/engines/connector-message.engine.ts` fit intake; `src/access/tasks.access.ts` is mixed.

**Personal UETS Follow-up**
- **Purpose:** Help the lawyer manage internal follow-up after manually checking UETS, without asserting UETS delivery, review, or legal deadlines.
- **Users/jobs and responsibilities:** The lawyer views, completes/reopens/deletes Product tasks, records notes and a date-only Reminder, uses calendar views, enrolls devices, and receives best-effort New task alerts and Reminder deliveries. It owns the task-state rules that suppress/restore delivery work.
- **Owned model and language:** Product task; New/active/completed task state; manual UETS review; Reminder; Reminder delivery/candidate/attempt; Device enrollment; New task alert; Calendar entry; Task color slot. `Official electronic tebligat` remains an external authoritative concept, not this context's model.
- **Owner/change authority:** unknown.
- **Relationships:**
  - **UETS Notification Intake:** direction Intake → Follow-up; influence unknown; exchange Intake → Follow-up is translated accepted metadata/outcome, Follow-up → Intake is none; model treatment **translate**.
  - **UETS:** direction UETS → Follow-up; influence UETS authority constrains workflow copy and forbids legal determination; exchange in both directions is none; model treatment **isolate**. The lawyer checks UETS outside the product.
  - **Web Push service:** direction Follow-up → Web Push service, then Web Push service → Follow-up; influence unknown; exchange Follow-up → service is the minimized prompt and opaque authenticated destination, service → Follow-up is safe accepted/terminal/retryable outcome; model treatment **isolate**.
- **Design evidence / counterevidence:** The rich, independently specified task, reminder, calendar, alert, and device lifecycle supports one internal workflow model (`CONTEXT.md`, `tickets.md`, both implementation specs). The personal-MVP scope, one lawyer, and shared Worker/D1 weaken a split from Intake (`docs/SPEC.md`, `wrangler.jsonc`).
- **Confidence:** medium — task state is the common decision center for calendar and all delivery behavior; owner/change authority is unknown.
- **Current code fit (realization evidence):** **mixed**. Reminder, alert, device, calendar, and task UI/engine/manager paths largely fit; `src/access/tasks.access.ts` also contains intake persistence; `src/worker.ts` is composition across both contexts.

### Conservative alternative: one context

**Personal UETS Notification Follow-up**
- **Purpose:** Operate the complete private flow from narrowly accepted UETS notification signal to lawyer-managed follow-up and best-effort prompts.
- **Users/jobs and responsibilities:** The home-server operator performs connector operations; the lawyer manages Product tasks, reminders, calendar, and devices. The context accepts/minimizes notifications, tracks connector health, creates/de-duplicates tasks, and governs every follow-up/delivery lifecycle.
- **Owned model and language:** All vocabulary listed above, with the explicit rule that UETS notification email is only a signal and Official electronic tebligat stays external.
- **Owner/change authority:** unknown.
- **Relationships:**
  - **Gmail:** direction Gmail → context; influence unknown; exchange Gmail → context is IMAP messages/headers, context → Gmail is none; model treatment **isolate**.
  - **UETS:** direction UETS → context; influence UETS authority constrains product claims; exchange in both directions is none; model treatment **isolate**.
  - **Web Push service:** direction context → service, then service → context; influence unknown; exchange context → service is safe prompt/destination, service → context is safe outcome; model treatment **isolate**.
- **Design evidence / counterevidence:** One lawyer, one Worker/D1, current mixed persistence, and absent ownership split support this alternative (`docs/SPEC.md`, `wrangler.jsonc`, `src/access/tasks.access.ts`, `src/worker.ts`). The separate home-server runtime, credentials, cursor, recovery workflow, and notification-to-task translation weaken it (`scripts/README.md`, `scripts/home_uets_connector.py`, `docs/SPEC.md`).
- **Confidence:** medium — it is conservative and matches current realization, but conflates different trust and operational language.
- **Current code fit (realization evidence):** **inside**, except that generated routing and UI utility code remain non-domain realization details.

## Domain documents
None. Read-only replay and no explicit strategic approval; no project document was created or changed.

## Migration advice
No code change is proposed. If the recommended two-context design is approved, first preserve the current contract through focused tests, then make the intake-to-follow-up translation an explicit seam around accepted minimal metadata/outcome. `scripts/home_uets_connector.py`, `src/connector-message.manager.ts`, and `src/engines/connector-message.engine.ts` are likely Intake-aligned; `src/access/tasks.access.ts` requires a careful split because it currently mixes intake write/deduplication with task, reminder, calendar, and alert lifecycle. Keep `src/worker.ts` intentional unscoped composition while it wires endpoints and scheduled work. Do not move code merely to make folders match a design: preserve atomic task/alert creation, no-body retention, deletion cascades, and safe retry semantics. Validate each extraction with connector, task/access, reminder/alert manager, migration, and Worker tests plus `npm run check` when implementation is authorized.

## Context firewall
**unresolved — no candidate fragment.**

- **Gate 1 fails:** no approved strategic context identities or relationships. `CONTEXT.md` is a vocabulary glossary, and `righting.json` has no scopes/context firewall; inspection reports `context-firewall` as not applied.
- **Gates 2–6 were intentionally not evaluated:** the skill requires approval before exhaustive relevant-source inventory, scope classification, temporary-mirror policy validation, and candidate presentation. No temporary mirror or temporary policy was created.
- Current evidence would require a migration decision before reconsideration: `src/access/tasks.access.ts` mixes proposed Intake and Follow-up responsibilities, and `src/worker.ts` composes both. It is therefore premature to claim exact non-overlapping path globs or to call reused paths `shared`/`unscoped` without hiding domain coupling.
- Reconsider only after the maintainer approves a complete design, the mixed seam is either deliberately retained as unscoped integration or separated, every relevant source file is classified, and an exact temporary-mirror candidate validates with the installed CLI. The project `righting.json` remains unchanged.

## Capability limits
`contextFirewall` can establish configured static cross-context and shared-to-context source-import restrictions. It does not establish runtime behavior, data or deployment isolation, organizational ownership, migration completion, or the quality of the context design. A later policy-adoption workflow must revalidate and obtain approval for the complete `righting.json`.

## Next step
**Decision needed (recommended: A):** Should the externally operated, trust-filtering **UETS Notification Intake** be a separate bounded context from **Personal UETS Follow-up**?

- **A — Separate (recommended):** preserve a translated, minimized Intake → Follow-up handoff; this recognizes the home-server/Gmail operational and trust model without splitting reminder/calendar/push from Product tasks.
- **B — One context:** keep connector acceptance and personal follow-up as one strategic model for this one-lawyer MVP; no internal context boundary is asserted.
- **C — Other/uncertain:** describe a different boundary or say what is unknown. Example: “Treat it as one context until connector operation is delegated.”
