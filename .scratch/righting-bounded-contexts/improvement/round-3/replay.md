## Outcome
unresolved

## Evidence
**Bounded pass inspected.** `AGENTS.md`; the authoritative vocabulary in `CONTEXT.md`; `docs/SPEC.md`, `docs/DECISIONS.md`, `tickets.md`; the connector ADR and the two implementation specifications (`docs/adr/0001-home-local-message-diagnosis.md`, `docs/specs/reminder-deliveries.md`, `docs/specs/new-task-alerts.md`); representative Worker, connector, task, reminder-delivery, device, dashboard, migration, and connector-script paths; recent Git history; `righting.json`; and the installed Righting policy language/capability catalog. No `CONTEXT-MAP.md` exists. No maintainer-approved strategic context map, CODEOWNERS/ownership record, or explicit change-authority record was found. Individual test bodies were not inspected; their source inventory was inspected. Other accessible source and history outside this bounded pass are not inspected.

**Design evidence.** The product's single outcome is private follow-up after a UETS notification; UETS remains authoritative and the app does not calculate legal deadlines (`docs/SPEC.md`, `docs/DECISIONS.md`; `CONTEXT.md:5-15`). Three independently rule-heavy models nevertheless appear:

- **UETS signal intake** accepts only a particular sender, manages Gmail UID/replay/diagnosis/heartbeat semantics, and returns `created`/`duplicate`/`rejected` acknowledgements (`scripts/home_uets_connector.py:47-70,73-108,265-316`; `src/connector-message.manager.ts:50-69`). It translates a notification into retained source metadata rather than an official communication (`CONTEXT.md:5-8`).
- **Follow-up work** owns the Product task's active/completed lifecycle, user notes, Reminder date/version, calendar representation/color, and permanent deletion; the vocabulary explicitly treats it as manual UETS review (`CONTEXT.md:8,10,14-15`). Completion/reopening controls reminder and alert suppression (`src/access/tasks.access.ts:192-244`).
- **Attention prompts** own explicit Device enrollment and bounded, best-effort Reminder delivery/New task alert attempts; neither an attempt nor click changes task state (`CONTEXT.md:9-13`; `src/reminder-delivery.manager.ts:76-153`; `docs/specs/new-task-alerts.md`). Its different external constraint is browser push capability and endpoint outcome, not task workflow.

**Relationships checked from producer to consumer.**

1. **External UETS/Gmail signal → UETS signal intake:** direction is inbound only; its influence is that the sender and Gmail message are merely a possible-work signal, while official tebligat remains in UETS. Exchange into intake is a Gmail notification's header/body-derived `messageId`, sender, subject, received time, and extracted `Geldiği yer`; there is no return exchange. Treatment is **translate**, not shared official-document model. Evidence: `CONTEXT.md:5-7`, `scripts/home_uets_connector.py:57-70,299-316`.
2. **UETS signal intake → Follow-up work:** direction is intake to follow-up work; intake decides acceptance/deduplication and constrains what may be retained. Exchange forward is accepted metadata/fingerprint and `created|duplicate|rejected`; return exchange is the acknowledgement only. Treatment is **translate**: a UETS notification becomes a Product task, not an Official electronic tebligat. The current call path is `ingestConnectorMessage` to `createTaskFromConnectorMessage` (`src/connector-message.manager.ts:56-69`; `src/access/tasks.access.ts:46-114`).
3. **Follow-up work ↔ Attention prompts:** follow-up work influences prompt eligibility through task creation, active/completed status, current Reminder version, retained `Geldiği yer`, subject, and opaque task destination. Its forward exchange is New task alert work on task creation and Reminder candidate eligibility/data; prompt delivery's return exchange is only safe attempt/outcome data and an authenticated task navigation, never task-state mutation. Treatment is **translate**: prompt payload/candidate/target models are not Product tasks. Evidence: atomic task/alert/target creation (`src/access/tasks.access.ts:46-99`), completion suppression (`src/access/tasks.access.ts:192-212`), and scheduled wiring/payload construction (`src/worker.ts:45-70`, `src/reminder-delivery.manager.ts:131-153`).

**Realization evidence.** The current terrain is **intermingled candidates**, not an established context topology. All 76 covered TypeScript/TSX files are classified by technical role, and no context scopes are configured: project-local `/Users/kgnugur/Codes/Personal/uets-to-task/node_modules/.bin/righting inspect --json` succeeded with 76 covered files, 0 source violations, `pureEngines` only, empty `scopes`, and `context-firewall` not applicable. `righting.json:1-40` confirms no `contextFirewall`. The Worker composes connector ingress, dashboard access, new-task alerts, and reminders in one deployment unit (`src/worker.ts:1-72`); `src/access/tasks.access.ts` directly joins Product task persistence with alert targets and reminder/calendar rules (`src/access/tasks.access.ts:46-114,192-244`). These facts weaken any claim that current folder structure or database tables already realize a boundary. They do not disprove a strategic boundary.

**Recommendation — preliminary three-context design (confidence: medium).** This is the fewest design that keeps the distinct external-system intake rules, lawyer work-record rules, and best-effort browser-prompt rules from sharing one model. It is not approved.

- **UETS Signal Intake**
  - **Purpose/users/jobs/responsibilities:** let the home-server operator safely discover, diagnose, replay, and report the status of a genuine notification, while the lawyer receives only safe resultant follow-up work.
  - **Owned model/language:** *UETS notification email*, *Geldiği yer*, *Connector message identity*, *Connector diagnosis/replay*, *Connector ingestion outcome*, *Gmail connector status*, and bounded diagnostic facts. It does **not** own *Official electronic tebligat*.
  - **Owner/change authority:** unknown; the operator is an external actor, but no authority record establishes who approves model changes.
  - **Relationships:** receives/translates the external UETS/Gmail signal; translates accepted metadata to Follow-up work and receives its acknowledgement as described above. No shared model is proposed.
  - **Evidence/counterevidence:** `CONTEXT.md:5-7,16-25`, `scripts/home_uets_connector.py:47-70,265-316`, and `src/connector-message.manager.ts:50-69` support distinct acceptance/recovery rules. Counterevidence: the connector script and Worker endpoint remain in one repository/application and share task persistence.
  - **Confidence/current code fit:** medium because its vocabulary and external/system rules are explicit, but authority is unknown. **Mixed** realization fit: `scripts/home_uets_connector.py`, `src/connector-message.manager.ts`, and task access are not isolated.

- **Follow-up Work**
  - **Purpose/users/jobs/responsibilities:** let the lawyer retain, review in UETS, annotate, remind, complete/reopen, delete, list, and calendar-view a Product task without asserting legal or UETS authority.
  - **Owned model/language:** *Product task*, *Reminder* as a user-entered Istanbul date, notes, active/completed state, *Calendar entry*, and *Task color slot*. UETS review is a user confirmation, not a UETS fact.
  - **Owner/change authority:** unknown.
  - **Relationships:** consumes translated accepted intake metadata; supplies prompt eligibility and safe identifying data to Attention prompts; receives navigation only, not workflow-state changes. Model treatment is translate in both boundary crossings.
  - **Evidence/counterevidence:** `CONTEXT.md:8,10,14-15`, `docs/SPEC.md`, and `src/access/tasks.access.ts:192-244` support a distinct user-work lifecycle. Counterevidence: Product-task mutation directly creates/suppresses prompt records and carries calendar allocation, so the current persistence implementation crosses the proposed boundary.
  - **Confidence/current code fit:** medium: lifecycle language and consequences are explicit; change authority is not. **Mixed** realization fit: tasks, calendar, reminder candidates, and alert-target writes share `src/access/tasks.access.ts`; UI composes these concerns in `src/routes/index.tsx`.

- **Attention Prompts**
  - **Purpose/users/jobs/responsibilities:** let the lawyer explicitly enroll up to three browsers and receive bounded, best-effort New task alerts or Reminder deliveries that return attention to a Product task without asserting delivery, attention, or completion.
  - **Owned model/language:** *Device enrollment*, *Reminder delivery*, *Reminder delivery attempt*, *New task alert*, alert/target/attempt outcome, retry/expiry, and push endpoint lifecycle. It does not own the Product task or legal reminder meaning.
  - **Owner/change authority:** unknown.
  - **Relationships:** consumes translated task identity/retained source/subject/eligibility from Follow-up work; supplies only safe outcomes and authenticated navigation back. It interacts with browser push as an external delivery service. Model treatment is translate; no Shared Kernel is proposed.
  - **Evidence/counterevidence:** `CONTEXT.md:9-13`, `docs/specs/reminder-deliveries.md`, `docs/specs/new-task-alerts.md`, `src/reminder-delivery.manager.ts:76-153`, and `src/worker.ts:45-105` support a separately bounded delivery lifecycle. Counterevidence: both prompt kinds reuse the same Worker, D1 database, retained task fields, and a single scheduled handler.
  - **Confidence/current code fit:** medium: delivery rules are detailed and distinct, but no separate authority/deployment is recorded. **Mixed** realization fit: dedicated access/manager/engine files exist, but task access directly writes alert/reminder state and `src/worker.ts` composes all workflows.

**Conservative alternative — one Private UETS Follow-up context (confidence: medium).** One context would own connector intake/health, Product tasks/calendar/reminders, Device enrollments, and all best-effort prompts for the one lawyer. Its user/job is the full private workflow from possible UETS signal to manual review; its model uses every exact term above while preserving *Official electronic tebligat* as external; owner/change authority remains unknown. The external UETS/Gmail signal is translated into internal work, while browser push is an isolated external transport; no internal context relationship or shared scope would be declared. It fits the one Worker, one D1 database, shared task writes, and single product outcome (`src/worker.ts:1-72`, `src/access/tasks.access.ts:46-114`). Its counterevidence is the independently applicable intake and prompt lifecycle/policy language above. Current code fit is **inside** as a single realization, but that is not proof that it is the best strategic design.

The recommended design's strongest counterevidence is the deliberate one-lawyer, one-product outcome and shared deployment/persistence; its boundary-changing uncertainty is whether connector intake and browser prompting may evolve under independently approved policy/operational authority, or are intentionally one product model controlled together. Confidence is medium, not high, because project records establish semantics but not change authority or a prior strategic approval.

## Approval
No explicit or authoritative approval of a strategic context design exists. The three-context cards and one-context alternative above are proposals only; `righting.json` policy approval is not bounded-context approval.

## Approved design
None. Proposed designs are the preliminary three-context recommendation and the conservative one-context alternative in **Evidence**; neither is approved.

## Domain documents
None. The repository was read only; no domain document or policy was changed.

## Migration advice
Do not reorganize application code or add scopes yet. If the recommended shape receives explicit approval, first record the approved cards and translation contracts, then inventory mixed persistence/workflow responsibilities before choosing any gradual realization work. Preserve the UETS-authority and data-minimisation constraints throughout. Any later context-firewall adoption must use approved identities and exact scopes, not current folders or database tables; revalidate afterward.

## Context firewall
Unresolved; no candidate was produced or validated. The current normalized contract has no scopes and does not activate `contextFirewall`; the inspector reports that capability as not applicable. Adding it before complete strategic approval would encode inference as policy. Its eventual static guarantee would be limited to configured cross-context and shared-to-context source imports.

## Capability limits
The executed project-local Righting inspection is mechanical realization evidence only: it found a valid policy, 76 covered sources, no source violations, and no configured scopes. The installed capability catalog states that a context firewall—if later configured—checks static source imports only; it cannot establish runtime behavior, isolation, ownership/change authority, migration completion, or design quality. Adapter activation is separately unknown in the inspection, although `tools/righting-oxlint-adapter.md` documents a project-local adapter support record.

## Next step
Which preliminary shape should be developed into the complete design for your explicit approval? **A (recommended):** UETS Signal Intake, Follow-up Work, and Attention Prompts as three contexts; **B:** one Private UETS Follow-up context; **C:** other/uncertain. A preserves the three independently rule-heavy models; B preserves the current single-product model and avoids premature boundaries.
