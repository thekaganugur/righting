## Outcome

unresolved

The repository contains strong product semantics and several plausible model boundaries, but no authoritative record approves bounded-context identities, complete relationships, or context change authority. No authorized maintainer was available in this replay, so neither the recommendation nor the conservative alternative is presented as approved.

## Evidence

### Inspected scope

- Repository instructions and policy: `AGENTS.md`, `righting.json`, and the normalized output of `npx righting inspect --json`.
- Domain and product records: `CONTEXT.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/adr/0001-home-local-message-diagnosis.md`, `docs/specs/reminder-deliveries.md`, `docs/specs/new-task-alerts.md`, `docs/specs/device-test-notification.md`, `docs/web-push-transport.md`, `tickets.md`, and `README.md`.
- Realization evidence: tracked source under `src/`, the home connector under `scripts/`, migrations, Worker and browser configuration, tests, imports, schema relationships, composition roots, and recent Git history.
- Installed Righting references: `righting-software-tooling/docs/policy-language.md` and `righting-software-tooling/docs/capabilities.md`. They state that repository topology is not context approval and that `contextFirewall` establishes configured static import restrictions only.
- Verification: `npm test` passed 34 files and 166 tests; `npm run check` passed formatting, lint, and type checking. `npx righting inspect --json` returned `ok: true`, 76 covered TypeScript/TSX files, no role-classification violations, no scopes, and `context-firewall` not applicable. These checks support realization quality, not strategic-context approval.
- The replay made no repository changes. The target worktree already had modifications to `package.json` and `package-lock.json`; they remained present after inspection.

### Current terrain

**Candidate models intermingled in one deployed application**, not established bounded contexts. The root vocabulary distinguishes Home Gmail connector, attention workflow, reminder, calendar, and external-system terms (`CONTEXT.md:5-25`), while the product journey connects acquisition, task creation, follow-up, and push delivery (`docs/SPEC.md:12-17`). Those labels are useful direct design evidence, but “Future …” module assignments are not complete strategic cards or explicit context-map approval.

### Design evidence

- The product has one coarse outcome: turn notification emails into private follow-up work while UETS remains authoritative (`docs/SPEC.md:3-5`). This supports the conservative one-context alternative.
- Acquisition has distinct rules and language: exact Gmail sender admission, UID cursor, bounded backfill, Message-ID diagnosis/replay, heartbeat, and safe failure categories (`docs/SPEC.md:38-49`; `docs/DECISIONS.md:43-69,91-93`; ADR `docs/adr/0001-home-local-message-diagnosis.md:1-3`). This supports a Notification Acquisition boundary.
- Follow-up work has its own decisions: a Product task is active or completed, completion records manual UETS review, and a Reminder is a user-entered date rather than a legal deadline (`docs/DECISIONS.md:71-81`; `docs/SPEC.md:33-36,45`). Calendar entries and color slots represent task work rather than official UETS state (`CONTEXT.md:14-15`; `docs/DECISIONS.md:83-89`). This supports an Attention Workflow boundary.
- Prompt delivery has an independently applicable model: Device enrollment, bounded candidates/targets/attempts, retry/expiry, Web Push outcomes, and the rule that attempts never mutate or prove task state (`docs/specs/reminder-deliveries.md:44-75`; `docs/specs/new-task-alerts.md:35-59`). This supports a Prompt Delivery boundary.
- New task alerts and Reminder deliveries share transport and destinations but are explicitly different events (`docs/specs/new-task-alerts.md:79-81`). This supports one coarse delivery context with translated workflow intents, rather than a context per notification type.
- The UETS authority boundary is explicit: no UETS login, scraping, verification, official-document download, or legal deadline calculation (`docs/SPEC.md:33-35,51-59`). Gmail transport and UETS authority must therefore not be collapsed into one external party.

### Repository realization evidence

- `scripts/home_uets_connector.py:47-70,157-212,262-296,431-498` contains acquisition-specific polling, backfill, diagnosis/replay selection, ingestion, heartbeat, and failure reporting.
- `src/connector-message.manager.ts:50-69` admits connector messages, creates tasks, and triggers New task alert work in one workflow, crossing all three proposed concepts.
- `src/access/tasks.access.ts:22-115` mixes Product-task persistence, acquisition identity, Device-enrollment snapshots, and New task alert creation. Its task mutations also directly suppress or restore delivery state (`src/access/tasks.access.ts:192-304`). This is the clearest mixed file.
- Prompt delivery already has strong seams: `src/new-task-alert.manager.ts:69-126`, `src/reminder-delivery.manager.ts:76-168`, `src/device-enrollment.manager.ts:21-54`, the corresponding access/engine files, and `src/access/web-push.access.ts`.
- `src/worker.ts:19-106` is a real composition root that wires ingestion, task creation, both delivery workflows, Web Push, and scheduled cleanup. It is plausible future `unscoped` wiring, but that does not make mixed domain files unscoped.
- The schema deliberately couples the models: reminder candidates reference tasks and Device enrollments (`migrations/0008_reminder_delivery_candidates.sql:4-75`), while New task alerts reference both (`migrations/0011_new_task_alerts.sql:1-52`). Shared D1 storage is valid realization evidence, not proof of one domain model.
- Current policy is technical-role-based: `righting.json:2-39` covers only `src/**/*.{ts,tsx}`, has no scopes, and excludes the Python connector and public service worker. The source layout (`src/engines`, `src/access`, `src/components`) is organized by volatility (`AGENTS.md:3-14`), so directories cannot be adopted as context boundaries.

### Counterevidence and confidence

- **Against the three-context recommendation:** one user journey, one Worker, one database, atomic task/alert creation, and task-state transactions that suppress delivery all favor a coarser model. No ownership or independent release evidence distinguishes the candidates.
- **Against the single-context alternative:** acquisition, follow-up state, and delivery have materially different language, external systems, privacy rules, and change drivers. The detailed delivery model can change with browser/push constraints without changing what a Product task means.
- Recommendation confidence is **medium**: the semantic and integration differences are well evidenced, but ownership is unknown and the exact boundary between workflow intent and delivery lifecycle needs maintainer approval.
- Conservative-alternative confidence is **medium**: it matches the present personal product and atomic realization, but risks allowing acquisition and transport concerns to continue shaping the task model.

### Material evidence unavailable

- No `CONTEXT-MAP.md`, CODEOWNERS, MAINTAINERS, ownership register, or record assigning bounded-context change authority was found.
- `README.md` links to missing `docs/tebligat-product-context.md` and `docs/branding.md`; their intended evidence was unavailable.
- Production ownership, independent release cadence, team boundaries, and current actual-device/connector operational evidence were unavailable.
- Git history is predominantly one author identity, but singular authorship does **not** establish ownership or operation of the whole model. The documented singular lawyer, product-owner, maintainer, or home-operator roles likewise do not establish bounded-context ownership. Every proposed owner/change-authority field therefore remains `unknown`.

## Approval

Explicit project records approve many product rules: UETS authority, exact Gmail admission, privacy/retention limits, the two-state task workflow, Reminder semantics, Device-enrollment limits, and delivery-attempt honesty. They do **not** approve a complete bounded-context design.

`CONTEXT.md` is an authoritative glossary with “Owning module” labels (`CONTEXT.md:3-25`), but it does not define context purposes, context owners/change authority, complete relationships, permitted model sharing/translation, or an approved context map. `righting.json` approves volatility roles only and contains no `contextFirewall` or scopes (`righting.json:2-39`).

No authorized maintainer approved either proposal during this replay. Strategic approval is therefore incomplete, and context ownership remains `unknown` rather than inferred from roles or Git authorship.

## Approved design

**None.** The following are complete proposals for maintainer decision, not approved design.

### Recommendation — three coarse contexts

#### Context card: Notification Acquisition

- **Purpose:** Reliably identify genuine UETS notification emails in the private Gmail inbox and turn them into a minimal, auditable ingestion request without treating email as official tebligat.
- **Users/jobs and responsibilities:** The home-server operator polls, backfills, diagnoses, and replays; the lawyer sees connector health. The context owns Gmail selection, exact-sender admission, Message-ID/UID handling, `Geldiği yer` extraction, cursor safety, local diagnosis, heartbeat/failure reporting, and connector-side interpretation of ingestion acknowledgement.
- **Owned model and language:** UETS notification email, Connector message identity, Connector diagnosis, Connector replay, Ambiguous connector selection, Body-visible diagnosis, Connector diagnostic outcome, Gmail connector status, safe failure category, and notification-origin `Geldiği yer`. It does not own Official electronic tebligat or Product-task state.
- **Owner/change authority:** `unknown`.
- **Relationships:**
  - **Attention Workflow:** **direction:** bidirectional request/acknowledgement; **influence:** mutual at the published contract—Acquisition shapes admissible source evidence, while Attention Workflow shapes deduplication and creation acknowledgement; **Acquisition → Attention Workflow exchange:** accepted minimal candidate (`Message-ID` or fallback identity, sender, subject, received instant, `Geldiği yer`); **Attention Workflow → Acquisition exchange:** `created`, `duplicate`, or `rejected` acknowledgement; **model treatment:** `translate`.
  - **Gmail:** **direction:** bidirectional protocol interaction; **influence:** Gmail/IMAP rules shape polling, search, authentication, and failure handling; Acquisition does not shape Gmail’s mailbox model; **Acquisition → Gmail exchange:** IMAP login, INBOX UID/header/body/search requests; **Gmail → Acquisition exchange:** message headers/content for local extraction or explicit diagnosis, UIDs, Message-ID matches, and IMAP outcomes; **model treatment:** `translate`.
  - **UETS as notification source:** **direction:** UETS → Acquisition indirectly through Gmail; **influence:** UETS sender address and notification wording shape admission/extraction, while Acquisition does not shape UETS; **UETS → Acquisition exchange:** notification email signal and parseable source/case wording via Gmail; **Acquisition → UETS exchange:** `none`; **model treatment:** `translate`.
  - **Home-server operator:** **direction:** bidirectional human-operated interaction; **influence:** the operator chooses commands and disclosures, while Acquisition constrains fail-closed selection and safe outputs; **operator → Acquisition exchange:** poll/backfill/diagnose/replay command and exact Message-ID; **Acquisition → operator exchange:** machine-readable diagnosis/replay outcome, operational failure category, and decoded body only for the explicit accepted diagnosis; **model treatment:** `translate`.
  - **Coding-agent transcript:** **direction:** Acquisition → transcript only, manually mediated by the operator; **influence:** Acquisition’s disclosure contract constrains content, while the transcript has no direct change authority or system access; **Acquisition → transcript exchange:** operator-selected diagnostic JSON, potentially including exact Message-ID and decoded text; **transcript → Acquisition exchange:** `none` (any advice returns through the operator, not a software integration); **model treatment:** `isolate`.
- **Design evidence:** `CONTEXT.md:5-6,16-25`; `docs/SPEC.md:14-15,21-24,38-41,48-49`; `docs/DECISIONS.md:43-69,91-93`; ADR `docs/adr/0001-home-local-message-diagnosis.md:1-3`.
- **Counterevidence:** app-side admission, task creation, and alert triggering are currently one manager flow (`src/connector-message.manager.ts:50-69`), and the main dashboard renders connector health beside tasks. No distinct ownership record exists.
- **Confidence:** **medium**, because purpose/language/external-system differences are strong but ownership and the exact ingestion seam are not approved.
- **Current code fit — realization evidence:** **mixed**. `scripts/home_uets_connector.py` and connector engines fit inside; `src/connector-message.manager.ts`, `src/access/tasks.access.ts`, `src/routes/index.tsx`, and `src/worker.ts` mix this context with others.

#### Context card: Attention Workflow

- **Purpose:** Maintain the lawyer’s private, durable follow-up work after a possible UETS item is noticed, while requiring manual UETS review and avoiding legal interpretation.
- **Users/jobs and responsibilities:** The lawyer reviews, annotates, reminds, completes/reopens, deletes, filters, and views tasks in list/calendar form. The context owns idempotent Product-task creation from translated source evidence, task lifecycle, notes, Reminder intention/date, task search/filter, calendar representation/color semantics, and the business intent for a New task alert. It never verifies UETS service or treats a delivery attempt as work completion.
- **Owned model and language:** Product task, active/completed, manual UETS review confirmation, notes, Reminder as a date-only personal intention, Calendar entry, Task color slot, and New task alert intent. “Reminder” here means the lawyer’s intended return date; “Reminder delivery candidate/attempt” belongs to Prompt Delivery.
- **Owner/change authority:** `unknown`.
- **Relationships:**
  - **Notification Acquisition:** **direction:** bidirectional request/acknowledgement; **influence:** mutual at the published contract—Acquisition controls admissible evidence, while Attention Workflow controls task identity/lifecycle and acknowledgement meaning; **Acquisition → Attention Workflow exchange:** translated candidate source identity and retained fields; **Attention Workflow → Acquisition exchange:** `created`, `duplicate`, or `rejected`; **model treatment:** `translate`.
  - **Prompt Delivery:** **direction:** Attention Workflow → Prompt Delivery for work intent and lifecycle facts; **influence:** primarily Attention Workflow shapes eligibility, payload meaning, and suppression, while Prompt Delivery’s platform constraints shape delivery-only limits and timing but must not shape task state; **Attention Workflow → Prompt Delivery exchange:** opaque task identity, safe `Geldiği yer`/subject snapshot, Product-task-created alert intent, Reminder version/date or due intent, and active/completed/deleted lifecycle facts; **Prompt Delivery → Attention Workflow exchange:** `none`—attempt, acceptance, display, click, retry, expiry, or enrollment state does not mutate Product-task state; **model treatment:** `translate`.
  - **UETS as official authority:** **direction:** no software integration; the lawyer separately consults UETS; **influence:** UETS’s authority constrains workflow language and prohibits verification/deadline claims, while Attention Workflow does not shape UETS; **Attention Workflow → UETS exchange:** `none`; **UETS → Attention Workflow exchange:** `none` in software (official tebligat is read independently by the lawyer); **model treatment:** `isolate`.
- **Design evidence:** `CONTEXT.md:7-10,14-15`; `docs/SPEC.md:16-17,25-26,33-36,42-45`; `docs/DECISIONS.md:75-85`; `docs/specs/new-task-alerts.md:37-51`.
- **Counterevidence:** fixed Reminder candidates and New task alert rows are created transactionally inside task persistence (`src/access/tasks.access.ts:46-101,247-304`), so the intended intent/delivery seam does not exist cleanly. The glossary assigns New task alerts to “Future attention workflow” but Reminder delivery to “Future reminder,” which supports a distinction without approving this exact split (`CONTEXT.md:9-13`).
- **Confidence:** **medium**, because Product-task meaning is clear but the ownership of alert/reminder intent versus delivery lifecycle needs approval.
- **Current code fit — realization evidence:** **mixed**. Task-action, product-summary, calendar, and task UI code mostly fit inside; `src/access/tasks.access.ts`, `src/routes/index.tsx`, and several migrations mix acquisition and delivery state.

#### Context card: Prompt Delivery

- **Purpose:** Manage explicitly enrolled browser destinations and make bounded, best-effort attempts to return the lawyer’s attention without claiming delivery, attention, UETS review, or task completion.
- **Users/jobs and responsibilities:** The lawyer enrolls/reconciles/removes/tests browser destinations; scheduled and immediate workflows claim targets, retry safely, expire work, revoke terminal endpoints, build minimal payloads, and record honest outcomes. The context owns transport lifecycle and privacy, not the lawyer’s work state.
- **Owned model and language:** Device enrollment, delivery candidate, target snapshot, Reminder delivery, New task alert delivery target, Delivery attempt, `accepted`, `rejected-terminal`, `retryable-failure`, expiry, TTL, duplicate suppression, no-current-enrollment, and Web Push payload/endpoint treatment. It consumes Product-task identity and safe display fields as translated values, not as its own Product-task model.
- **Owner/change authority:** `unknown`.
- **Relationships:**
  - **Attention Workflow:** **direction:** Attention Workflow → Prompt Delivery; **influence:** workflow meaning and lifecycle shape eligibility/suppression, while browser/push constraints shape only delivery policies; **Attention Workflow → Prompt Delivery exchange:** task-created alert intent, Reminder intent/version, safe display snapshot, opaque task destination, and completion/deletion suppression facts; **Prompt Delivery → Attention Workflow exchange:** `none`—delivery results and clicks never change task state; **model treatment:** `translate`.
  - **Supported browser installation:** **direction:** bidirectional; **influence:** browser capabilities/permission/service-worker rules shape enrollment, while Prompt Delivery shapes explicit opt-in, three-device limits, payload wording, and management behavior; **browser → Prompt Delivery exchange:** permission/subscription state, endpoint and subscription keys at the protected transport boundary, normalized capability facts, enroll/reconcile/remove/test commands, and notification click navigation; **Prompt Delivery → browser exchange:** authenticated device-management UI, public VAPID key, service-worker behavior, minimal notification content, and opaque same-origin task destination; **model treatment:** `translate`.
  - **Web Push service:** **direction:** bidirectional request/outcome; **influence:** Web Push protocol and provider status semantics shape encryption, VAPID, TTL, retry, and revocation handling; Prompt Delivery shapes only the permitted payload and attempt policy; **Prompt Delivery → Web Push service exchange:** encrypted push request, VAPID authorization, endpoint, and TTL; **Web Push service → Prompt Delivery exchange:** HTTP/network acceptance, terminal rejection, or retryable failure only—no display, attention, or UETS-review receipt; **model treatment:** `translate`.
- **Design evidence:** `CONTEXT.md:11-13`; `docs/SPEC.md:27,36-37,43-44`; `docs/specs/reminder-deliveries.md:44-75`; `docs/specs/new-task-alerts.md:35-59`.
- **Counterevidence:** delivery rows are tightly foreign-keyed to Product tasks and Device enrollments, and task mutations directly suppress/restore them (`migrations/0008_reminder_delivery_candidates.sql:4-75`; `migrations/0011_new_task_alerts.sql:1-52`; `src/access/tasks.access.ts:192-304`). New task alert meaning is explicitly an attention-workflow concern in the glossary (`CONTEXT.md:9`).
- **Confidence:** **medium**, because the delivery model and external parties are distinct but no ownership or independently approved boundary exists.
- **Current code fit — realization evidence:** **mixed**. Delivery managers, repositories, engines, Device-enrollment code, Web Push access, and service-worker code fit mostly inside; `src/access/tasks.access.ts`, `src/connector-message.manager.ts`, and `src/worker.ts` cross the proposed seam.

The recommendation deliberately proposes **no direct Notification Acquisition → Prompt Delivery relationship**. A newly admitted message should first become Attention Workflow work; only the resulting task-created intent should be translated to Prompt Delivery. The current direct callback in `src/connector-message.manager.ts:64-69` is realization counterevidence, not an approved relationship.

### Conservative alternative — one context

#### Context card: Private UETS Follow-up

- **Purpose:** Operate the entire private journey from noticing a UETS notification email through durable follow-up work and best-effort browser prompts for one lawyer, while keeping UETS authoritative.
- **Users/jobs and responsibilities:** The home-server operator polls/diagnoses/replays; the lawyer reviews, annotates, reminds, completes, searches, views calendar entries, and manages devices; the documented product-owner role supplies privacy/release needs but does not establish change authority. The context owns acquisition, task workflow, calendar, reminders, delivery attempts, device enrollment, connector health, and their end-to-end invariants.
- **Owned model and language:** All project terms in `CONTEXT.md`, except Official electronic tebligat, Home-server operator, and Diagnostic transcript remain external. Within the context, UETS notification email, Product task, Reminder, New task alert, Reminder delivery, Device enrollment, connector diagnosis/replay, and calendar concepts remain separate modules but not separate bounded contexts.
- **Owner/change authority:** `unknown`.
- **Relationships:**
  - **Gmail:** **direction:** bidirectional protocol interaction; **influence:** Gmail/IMAP shapes mailbox access and failures; the context does not shape Gmail; **context → Gmail exchange:** login, search, header/body fetch; **Gmail → context exchange:** notification messages, UIDs, exact Message-ID matches, and IMAP outcomes; **model treatment:** `translate`.
  - **UETS notification-source flow:** **direction:** UETS → context indirectly via Gmail; **influence:** UETS sender/wording shapes admission and extraction; the context does not shape UETS; **UETS → context exchange:** notification signal and source/case wording via Gmail; **context → UETS exchange:** `none`; **model treatment:** `translate`.
  - **UETS official-authority boundary:** **direction:** no software integration; the lawyer separately checks UETS; **influence:** UETS authority constrains product claims; the context does not shape UETS; **context → UETS exchange:** `none`; **UETS → context exchange:** `none` in software; **model treatment:** `isolate`.
  - **Home-server operator:** **direction:** bidirectional human-operated interaction; **influence:** the operator chooses explicit commands/disclosures and the context enforces safe/fail-closed behavior; **operator → context exchange:** poll/backfill/diagnose/replay commands and exact Message-ID; **context → operator exchange:** outcomes, safe failure categories, and explicit diagnosis text; **model treatment:** `translate`.
  - **Coding-agent transcript:** **direction:** context → transcript only through deliberate operator copy; **influence:** the context constrains permitted diagnostic content and the transcript has no direct system access; **context → transcript exchange:** selected diagnostic JSON and decoded text; **transcript → context exchange:** `none`; **model treatment:** `isolate`.
  - **Supported browser installation:** **direction:** bidirectional; **influence:** browser capability/permission rules shape enrollment and the context shapes opt-in, cap, and notification semantics; **browser → context exchange:** subscription/permission/capability state and device-management commands; **context → browser exchange:** authenticated UI, public VAPID key, service worker, notification, and task destination; **model treatment:** `translate`.
  - **Web Push service:** **direction:** bidirectional request/outcome; **influence:** protocol/provider semantics shape transport; the context shapes payload and retry/expiry policy; **context → service exchange:** encrypted request, authorization, endpoint, and TTL; **service → context exchange:** accepted, terminal-rejected, or retryable outcome, with no attention receipt; **model treatment:** `translate`.
- **Design evidence:** the single product goal and linear journey (`docs/SPEC.md:3-17`), one private user workflow (`docs/SPEC.md:51-59`), shared deployment/database, and atomic creation/suppression behavior (`src/access/tasks.access.ts:46-101,192-304`).
- **Counterevidence:** acquisition, attention work, and prompt delivery have different language, privacy boundaries, external parties, and detailed specifications. Browser/push volatility is independently applicable to other prompts, while Product-task state remains useful with no enrollment (`docs/specs/reminder-deliveries.md:32-35`; `docs/specs/new-task-alerts.md:27-31`).
- **Confidence:** **medium**, because it honestly matches current realization and personal scope but may preserve avoidable model coupling.
- **Current code fit — realization evidence:** **inside**, at the coarse repository level, except external connector runtime state and external services; internal module boundaries are still mixed and should not be mistaken for strategic approval.

Cloudflare Worker, D1, cron, and the repository’s volatility roles are treated here as realization/integration constraints rather than strategic external-domain relationships. They do not justify additional bounded contexts.

## Domain documents

None. The result is unresolved, so no `CONTEXT.md`, `CONTEXT-MAP.md`, ADR, source, policy, or application file was written or changed.

## Migration advice

No migration should execute before strategic approval. If the three-context recommendation is approved later:

1. Record the approved context map and complete relationship treatments before moving code. Assign or explicitly retain `unknown` change authority only through maintainer decision; do not infer it from the lawyer/product-owner/operator roles or Git history.
2. Define a translated Acquisition → Attention Workflow contract around minimal candidate data and `created | duplicate | rejected`. Keep Gmail body/diagnosis data out of Attention Workflow.
3. Split `src/access/tasks.access.ts` first by responsibility. It currently combines source admission types, Product-task state/calendar, Reminder candidate creation, New task alert creation, Device-enrollment snapshots, and suppression (`src/access/tasks.access.ts:1-304`). Moving directories first would only hide the coupling.
4. Let Attention Workflow publish translated task-created and Reminder/lifecycle facts to Prompt Delivery. Preserve the invariant that delivery attempts and clicks return **no** task-state mutation. Decide whether atomic same-D1 writes remain a deliberate integration mechanism or become an outbox/queued handoff; do not assume physical database separation.
5. Keep `src/worker.ts` as intentional composition wiring only after context entry points exist. Do not label domain-heavy files such as `src/access/tasks.access.ts` as `unscoped` merely to silence a firewall.
6. Separate realization gradually: likely Acquisition files include the Python connector and connector message/health logic; Attention Workflow includes Product-task/action/summary/calendar logic; Prompt Delivery includes Device enrollment, candidate/target/attempt workflows, Web Push, and service-worker handling. `src/routes/index.tsx` needs composition or view-model seams because it currently combines connector status and task/calendar UI.
7. Treat `Europe/Istanbul` conversion and opaque identifiers deliberately. They may be small context-independent utilities only if approved and dependency-free; reuse alone does not make them a Shared Kernel or a `shared` scope.
8. Preserve data and release safety: current cross-table foreign keys and atomic batches encode deletion, suppression, retry, and privacy invariants. Use backward-compatible schema changes, contract tests, replay/duplicate tests, due-delivery race tests, privacy checks, connector smoke tests, actual-device validation, `npm test`, `npm run check`, and `npx righting inspect --json` at each safe stage.

If the conservative alternative is approved, retain one context but still split mixed role contracts for clarity. A single bounded context does not justify expanding ResourceAccess files indefinitely or treating external Gmail/UETS/Web Push models as shared internal models.

## Context firewall

No fragment is proposed and no temporary-mirror candidate validation was run, because strategic approval is incomplete.

- **Gate 1 failed:** no authoritative record or maintainer answer approves the proposed context identities, full relationships, and change authority.
- **Gate 2 failed for the recommendation in the current layout:** exact non-overlapping path globs cannot honestly map the proposed identities. The technical-layer directories contain multiple candidate contexts, while `src/access/tasks.access.ts`, `src/routes/index.tsx`, and `src/connector-message.manager.ts` are mixed. Existing coverage also excludes the strategic Python connector and public service worker (`righting.json:3`).
- **Gate 3 failed:** relevant source has not been fully classifiable into approved named contexts/shared/unscoped categories because the identities are unresolved and material files are mixed. The existing Righting report classifies volatility roles only.
- **Gate 4 failed for an immediate three-context firewall:** direct proposed cross-boundary imports exist, including connector workflow → task access/New-task-alert engine and task access → connector/reminder/calendar engines (`src/connector-message.manager.ts:1-13`; `src/access/tasks.access.ts:1-20`).
- **Gate 5 failed:** legitimate integration is not yet represented through approved context entry points. `src/worker.ts` is plausible unscoped composition, but using `unscoped` for mixed domain files would hide incompatible imports.
- **Gate 6 was not attempted:** there is no honest exact candidate to validate. The successful current `npx righting inspect --json` run validates only the existing non-firewall role policy.

Reconsider `contextFirewall` only after a maintainer approves one complete strategic design, resolves ownership/relationship treatment, mixed files are split behind translated entry points, policy coverage accounts for every relevant source language/path, every source file is classified, and an exact temporary-mirror candidate validates with no ambiguous/unmatched paths or prohibited imports. A later policy-adoption workflow must then revalidate and obtain approval for the complete `righting.json`.

## Capability limits

`contextFirewall` can establish configured static cross-context and shared-to-context source-import restrictions. It does not establish runtime behavior, data or deployment isolation, organizational ownership, migration completion, or the quality of the context design.

The existing successful Righting inspection establishes only its configured static role/import policy for covered TypeScript/TSX source. It does not cover the Python connector or public service worker, prove adapter activation, approve contexts, or verify Gmail, UETS, Web Push, Cloudflare, browser, or D1 runtime behavior.

## Next step

Pending maintainer question: **Which strategic model should be approved as the basis for a context map: (A) the recommended three contexts—Notification Acquisition, Attention Workflow, and Prompt Delivery, with translated seams as shown; (B) the conservative single Private UETS Follow-up context; (C) another boundary proposal; or (D) uncertain/defer?** A bounded context is a semantic/change boundary, not a folder; for example, in A the lawyer’s Reminder date belongs to Attention Workflow while delivery candidates and attempts belong to Prompt Delivery. **Recommendation: A**, because it best explains the distinct language and external-system rules while keeping only three coarse boundaries.