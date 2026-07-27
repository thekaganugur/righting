## Outcome
unresolved

## Evidence
**Decision packet — current terrain:** **intermingled candidates**. The product has a crisp single-lawyer outcome—turn a genuine UETS notification signal into private follow-up work without replacing UETS (`docs/SPEC.md:3-17`)—and a maintained vocabulary that distinguishes connector, Product task, Reminder, Device enrollment, delivery attempt, calendar entry, and alert (`CONTEXT.md:5-25`). Those are design evidence, not an approved bounded-context map. The records explicitly make UETS an external authority, not a product model (`CONTEXT.md:7`; `docs/DECISIONS.md:7-9`). They name owning *modules*, but no record declares strategic contexts, their authorities, or an approved context relationship.

**Recommendation (medium confidence):** develop a three-context design for later explicit approval:

1. **Connector Intake** — translate the home Gmail signal into a safe, deduplicated intake outcome and connector-health information.
2. **Follow-up Work** — own the lawyer's durable Product task workflow and its calendar representation.
3. **Attention Delivery** — own opt-in device destinations and bounded best-effort New task alert/Reminder delivery work; it never owns task completion or UETS review.

This is the fewest split that preserves the materially different models and rules: mailbox/intake acceptance; lawyer-owned follow-up state; and browser-push eligibility, retry, expiry, and transport outcome. The strongest evidence is that alerts and reminders share enrolled destinations and transport while remaining distinct domain events (`docs/specs/new-task-alerts.md:55-59,79-81`), and that delivery explicitly never changes task state (`src/reminder-delivery.manager.ts:76-81`; `src/new-task-alert.manager.ts:69-76`).

**Conservative alternative (medium confidence):** retain **Connector Intake** as one context and combine all private application models—Product task, calendar, Reminder, Device enrollment, New task alert, and Reminder delivery—into one **Private Follow-up** context. This avoids a boundary while the product has one lawyer and one Worker. It is credible because the current task ResourceAccess atomically creates tasks, alert work, and alert targets (`src/access/tasks.access.ts:46-114`), and completion directly suppresses both reminder and alert work (`src/access/tasks.access.ts:192-213`). Its counterevidence is the detailed independent delivery lifecycle, device cap, and transport privacy constraints (`docs/specs/reminder-deliveries.md:44-75`).

**Highest-impact uncertainty:** whether Device enrollment plus alert/reminder delivery has independent product change authority and is expected to evolve independently from the Product task workflow. No project-owned record answers that; a sole user/product-owner description does not establish authority (`docs/DECISIONS.md:15-17`). Resolving it decides whether Attention Delivery is a real boundary or remains inside Private Follow-up.

**Inspected:** `AGENTS.md`; `CONTEXT.md`; `docs/SPEC.md`; `docs/DECISIONS.md`; `tickets.md`; `docs/adr/0001-home-local-message-diagnosis.md`; `docs/specs/reminder-deliveries.md`; `docs/specs/new-task-alerts.md`; representative Worker, Manager, Engine/Access imports and test inventory under `src`; `righting.json`; recent relevant Git history; and installed Righting policy/capability references. The home-server connector implementation, production runtime/deployment records, named change authorities, and an approved context map were unavailable in this worktree.

**Realization evidence:** `/opt/homebrew/bin/righting` resolves to `/Users/kgnugur/Codes/Personal/righting-software-tooling/dist/src/cli.js`. Its read-only `inspect --json` from this repository reports valid `righting.json`, adapter `unknown`, 76 covered source files (23 Client, 11 Manager, 24 Engine, 12 ResourceAccess, 1 Utility), 28 tests, four composition roots, no unclassified/ambiguous source, and no source violations. The normalized contract has no scopes and `contextFirewall` is not applicable; its current policy declares only `pureEngines` (`righting.json:1-39`). This is mechanical realization evidence only. Current `src/access/tasks.access.ts` mixes connector intake, Product-task mutations, calendar colors, reminder candidates, and alert persistence (`src/access/tasks.access.ts:1-20,46-114,192-300`); `src/worker.ts` composes intake, access boundary, alert, and reminder flows in one Worker (`src/worker.ts:1-17,29-70`). Thus present paths do not validate a context split.

**Counterevidence and confidence:** The vocabulary's separate “Future attention,” “Future reminder,” and “Future calendar” module labels (`CONTEXT.md:8-15`) support semantic candidates, but are not strategic approval. Calendar is explicitly a representation of connector-origin Product tasks (`docs/DECISIONS.md:83-89`), which weakens treating Calendar as a fourth context. The task/access intermingling and one-worker composition weaken any claim that the recommended three are realized today. Confidence is medium: purpose and behavioral models are well recorded, but authority and desired independent evolution are unknown.

## Approval
No explicit or authoritative approval of a complete strategic design exists. The recommendation and conservative alternative below are proposals only; neither is approved. The pending decision is the single boundary-changing uncertainty stated above.

## Approved design
**Unapproved proposal — recommended three-context design**

### 1. Connector Intake
- **Purpose, users/jobs, responsibilities:** For the home-server operator, accept only a genuine UETS notification signal; extract safe metadata and `Geldiği yer`; deduplicate intake; return `created`/`duplicate`/`rejected`; retain safe rejected diagnostics; and expose connector health. It does not model Official electronic tebligat or retain email bodies.
- **Owned model and language:** `UETS notification email`, `Geldiği yer`, `Connector message identity`, `Connector ingestion outcome`, `Connector diagnosis`, `Connector replay`, `Gmail connector status`, and `Ambiguous connector selection`—with UETS itself external (`CONTEXT.md:5-7,16-25`).
- **Owner/change authority:** unknown.
- **Relationships:**
  - **Home Gmail/IMAP (external) → Connector Intake:** message headers, received time, Message-ID, and mailbox selection; **Connector Intake → Home Gmail/IMAP:** polling/selection requests and UID-cursor progress. **Influence:** Gmail origin and exact sender rules constrain acceptance. **Treatment:** translate; Gmail message is never a Product task. The detailed connector program is unavailable, but the specified request/return behavior is documented (`docs/SPEC.md:14-15,38-42`; `docs/DECISIONS.md:43-45,59-69`).
  - **Connector Intake → Follow-up Work:** accepted safe metadata (`from`, `subject`, `receivedAt`, `Geldiği yer`, identity/fingerprint) and intake decision; **Follow-up Work → Connector Intake:** `created`/`duplicate`/`rejected` acknowledgement. **Influence:** acceptance and duplicate rules decide whether work exists. **Treatment:** translate; notification signal is not the Product task. The request is parsed and decided before the task write, which returns the outcome (`src/connector-message.manager.ts:50-69`; `src/access/tasks.access.ts:46-114`).
- **Design evidence / counterevidence:** Exact-source acceptance, local diagnosis/replay, and no-body rules are durable decisions (`docs/SPEC.md:38-46`; `docs/DECISIONS.md:63-69`). Counterevidence: the current ingress Manager writes through the mixed task access file, so no code boundary realizes this proposal (`src/connector-message.manager.ts:1-13`; `src/access/tasks.access.ts:1-20`).
- **Confidence:** high for distinct model/purpose; medium overall because authority is unknown.
- **Current code fit (realization evidence):** mixed.

### 2. Follow-up Work
- **Purpose, users/jobs, responsibilities:** For the lawyer, hold the durable follow-up record after checking UETS: Product task state, notes, user-entered Reminder intent, completion/reopen/deletion, and calendar-visible representations. It is the only durable user-facing work record.
- **Owned model and language:** `Product task` (active/completed), manual UETS review, notes, `Calendar entry`, and `Task color slot`; it owns the distinction that a `Reminder` is a date entered for a task, not a legal deadline. `Official electronic tebligat` remains outside this model (`CONTEXT.md:7-15`; `docs/DECISIONS.md:75-85`).
- **Owner/change authority:** unknown.
- **Relationships:**
  - **Connector Intake → Follow-up Work / return:** as stated above; it controls creation only through the translated accepted intake outcome.
  - **Follow-up Work → Attention Delivery:** a task-created signal and read-only eligibility data: task ID, retained `Geldiği yer`, subject, active/completed state, Reminder date/version, and deletion/completion/reopen effects. **Attention Delivery → Follow-up Work:** none; notification click only opens the authenticated task and does not mutate task state. **Influence:** work-state changes suppress or restore only the permitted future delivery work. **Treatment:** translate; Attention Delivery must not share or own the Product task model. The proposed flow is evidenced by the specified lifecycle (`docs/specs/reminder-deliveries.md:46-58`) and current read-only active-state check before sending (`src/reminder-delivery.manager.ts:131-153`).
- **Design evidence / counterevidence:** The core journey ends with the lawyer recording a reminder and completing a private task after checking UETS (`docs/SPEC.md:12-17`), and calendar is specified as a task representation (`docs/DECISIONS.md:83-89`). Counterevidence: the current task access implementation directly persists delivery and alert effects, rather than crossing a contract (`src/access/tasks.access.ts:192-300`).
- **Confidence:** high for Product task and calendar belonging together; medium for locating Reminder intent here rather than wholly in Attention Delivery.
- **Current code fit (realization evidence):** mixed.

### 3. Attention Delivery
- **Purpose, users/jobs, responsibilities:** For the lawyer, explicitly enroll up to three browser destinations and receive bounded, best-effort prompts that return attention to a Product task. It owns candidate/target/attempt state, retry/expiry, endpoint revocation, and safe Web Push outcomes. It never owns UETS review or task completion.
- **Owned model and language:** `Device enrollment`, `Reminder delivery`, `Reminder delivery attempt`, `New task alert`, and push outcome categories. A `New task alert` is a creation prompt; a `Reminder delivery` is a due-date prompt; neither is an Official electronic tebligat, delivery proof, attention proof, or legal deadline (`CONTEXT.md:9-13`; `docs/specs/new-task-alerts.md:79-81`).
- **Owner/change authority:** unknown.
- **Relationships:**
  - **Follow-up Work → Attention Delivery / return:** as stated above; the only reverse exchange is **none**, because alert/reminder click does not mutate a task (`docs/specs/new-task-alerts.md:45-51`; `docs/specs/reminder-deliveries.md:11-13`).
  - **Attention Delivery → Web Push service (external):** subscription, bounded safe payload, and TTL; **Web Push service → Attention Delivery:** accepted, terminal-rejection, or retryable-failure outcome. **Influence:** external outcomes determine retry/revocation only, not workflow state. **Treatment:** translate. The sending Manager maps those outcomes without changing task state (`src/reminder-delivery.manager.ts:143-167`; `src/new-task-alert.manager.ts:104-126`).
- **Design evidence / counterevidence:** Dedicated device-enrollment rules, privacy limits, candidate identities, and bounded delivery behavior are extensive (`docs/specs/reminder-deliveries.md:44-75`); alert and reminder intentionally share transport/destinations but retain different triggers and expiry (`docs/specs/new-task-alerts.md:7-11,37-43,55-56`). Counterevidence: New task alert is labelled an attention-workflow Manager in the vocabulary, and current task creation atomically writes alert work (`CONTEXT.md:8-10`; `src/access/tasks.access.ts:73-98`).
- **Confidence:** medium; its model/rules differ materially, but the authority/evolution question is unanswered.
- **Current code fit (realization evidence):** mixed.

**Unapproved conservative two-context design**

### 1. Connector Intake
- **Purpose, users/jobs, responsibilities:** Same as the recommended Connector Intake: home-server operator converts only a genuine UETS notification signal into safe, deduplicated intake and health outcomes.
- **Owned model and language:** `UETS notification email`, `Geldiği yer`, connector identity/diagnosis/replay/outcome/status; UETS remains external (`CONTEXT.md:5-7,16-25`).
- **Owner/change authority:** unknown.
- **Decision-relevant relationship:** **Connector Intake → Private Follow-up:** safe accepted metadata and intake outcome; **Private Follow-up → Connector Intake:** `created`/`duplicate`/`rejected`. **Influence:** admission and duplicate rules decide whether private work exists. **Treatment:** translate, never share email-message semantics. Evidence: `docs/SPEC.md:38-45`; `src/connector-message.manager.ts:50-69`.
- **Design evidence / counterevidence:** Same durable ingress/privacy evidence as above; the mixed task access file is realization counterevidence to a currently separated boundary (`src/access/tasks.access.ts:46-149`).
- **Confidence:** high for the model distinction; medium overall for unrecorded authority.
- **Current code fit (realization evidence):** mixed.

### 2. Private Follow-up
- **Purpose, users/jobs, responsibilities:** For the one lawyer, own the complete private loop: Product task and calendar, Reminder date, Device enrollment, creation alerts, reminder delivery, safe push attempts, and task-state-triggered suppression. It remains one bounded personal-work model until independent change is established.
- **Owned model and language:** `Product task`, `Reminder`, `Calendar entry`, `Task color slot`, `Device enrollment`, `New task alert`, `Reminder delivery`, and `Reminder delivery attempt`; it preserves their documented distinctions and the external status of UETS (`CONTEXT.md:7-15`).
- **Owner/change authority:** unknown.
- **Decision-relevant relationships:** **Connector Intake → Private Follow-up / return** as above. **Private Follow-up → Web Push service (external):** subscription/payload/TTL; **Web Push service → Private Follow-up:** safe outcome. **Influence:** outcome affects only delivery retry/revocation, never task workflow. **Treatment:** translate. Evidence: `docs/specs/reminder-deliveries.md:53-66`; `src/worker.ts:45-70`.
- **Design evidence / counterevidence:** One lawyer and the atomic task/alert write support coarsening (`docs/DECISIONS.md:15-17`; `src/access/tasks.access.ts:46-114`). The independent delivery rules and browser-privacy model are strong counterevidence (`docs/specs/reminder-deliveries.md:44-75`).
- **Confidence:** medium.
- **Current code fit (realization evidence):** inside/mixed: task, alert, and reminder data already intermix in `src/access/tasks.access.ts` and the single Worker composes delivery (`src/worker.ts:1-17,45-105`), though sources are organized by technical role rather than this context name.

No design is approved. No fourth Calendar context is proposed: its language is expressly a representation of a connector-origin Product task, and the same task lifecycle owns its color state (`CONTEXT.md:14-15`; `docs/DECISIONS.md:83-89`). Dashboard session and connector bearer mechanisms are security boundaries, not proposed contexts: the records distinguish their credentials but give no independent business model (`docs/SPEC.md:47-49`).

## Domain documents
None. Strategic approval is incomplete; this read-only replay changed no project document.

## Migration advice
No application-code or policy change is advised now. If the recommended design is later explicitly approved, first record the approved map and relationship contracts; then separately decide whether the existing intermingled access/Worker realization warrants staged contract extraction. Preserve the atomic created-task/alert invariant and task-linked delivery cleanup during any later migration (`docs/specs/new-task-alerts.md:37-43`; `docs/specs/reminder-deliveries.md:46-58`). Do not infer directory scopes from current paths.

## Context firewall
Unresolved. No `contextFirewall` candidate is presented because the complete strategic design has no explicit or authoritative approval. The current normalized Righting contract has no scopes and does not enable the firewall. Righting's own policy reference requires maintainer-identified context identities, relationships, and exact scopes before enabling it, and says to omit scopes/firewall otherwise (`/Users/kgnugur/Codes/Personal/righting-software-tooling/docs/policy-language.md:88-95`). Full firewall-path classification and mechanical candidate validation are intentionally deferred until approval; `righting.json` remains unchanged.

## Capability limits
The inspection proves only the current static role-policy result inside configured `src/**/*.{ts,tsx}` coverage: no reported source violations, unclassified files, or ambiguous classifications. Adapter activation is `unknown`. It does not establish runtime behavior, the external home connector, ownership/change authority, design quality, or approval. A future `contextFirewall` would statically forbid configured cross-context and shared-to-context source imports, not prove runtime isolation or a correct boundary (`/Users/kgnugur/Codes/Personal/righting-software-tooling/docs/capabilities.md:60-93`).

## Next step
**Which proposal should be developed into the complete design for your explicit approval?** Recommendation: **A — three contexts** (Connector Intake, Follow-up Work, Attention Delivery) because delivery has distinct lifecycle and privacy rules. **B — conservative two contexts** (Connector Intake, Private Follow-up) if one personal workflow should retain one authority. **C — keep one context** if the connector is not to be a strategic boundary. **D — other/uncertain** (briefly state what should remain together or split).