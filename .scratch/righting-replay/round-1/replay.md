# Righting approval packet — UETS to Task

## Proposed policy (exact `righting.json`)

```json
{
  "preset": "volatility@1",
  "coverage": ["src/**/*.{ts,tsx}"],
  "aliases": [
    { "name": "component", "role": "Client", "directorySegments": ["components"] },
    { "name": "route", "role": "Client", "directorySegments": ["routes"] },
    { "name": "library", "role": "Utility", "directorySegments": ["lib"] }
  ],
  "compositionRoots": ["router", "worker", "routeTree"],
  "protectedDependencies": [
    { "package": "web-push-neo", "role": "Resource" }
  ],
  "variations": ["clientReadsAccess", "pureEngines"],
  "overrides": [
    {
      "name": "client-composition",
      "from": "Client",
      "to": "Client",
      "effect": "allow",
      "reason": "Approved UI composition: routes and feature components compose reusable components from src/components."
    }
  ],
  "guidance": { "domainVocabulary": "CONTEXT.md" }
}
```

## Evidence and policy decisions

- `AGENTS.md` explicitly assigns UI mechanics to `*.page.tsx` / `*.component.tsx`, workflows to `*.manager.ts`, decisions to `*.engine.ts`, and data/transport to `*.access.ts`. The existing trees implement the last three canonical names directly: `src/engines/`, `src/access/`, and `*.manager.ts`.
- **Aliases proposed:** `components` and `routes` as `Client`, and `lib` as `Utility`. These are reusable directory-vocabulary tokens, not path maps. `src/components/` contains UI components (for example `src/components/task-detail.component.tsx`); `src/routes/` contains TanStack route clients; `src/lib/utils.ts` is shared utility code.
- **Composition roots proposed:** `router` (`src/router.tsx`), `worker` (`src/worker.ts`), and `routeTree` (`src/routeTree.gen.ts`). They wire framework routes/Worker handling rather than implement a role. `routeTree.gen.ts` is a composition root, not a role assignment.
- **Protected dependency proposed:** `web-push-neo` as `Resource`. It is imported only by the transport access module, `src/access/web-push.access.ts:1`, and `AGENTS.md` assigns transport to ResourceAccess. Its test import is exempt.
- **Guidance proposed:** `CONTEXT.md`, the documented domain vocabulary, is a maintained project-owned reference.

### Variations (all evaluated)

| Variation | Disposition | Evidence |
| --- | --- | --- |
| `clientReadsAccess` | **propose** | `src/routes/index.tsx:9` reads `#/access/tasks.access` in a route server function. This is the one observed production Client → ResourceAccess edge. |
| `pureEngines` | **propose** | `AGENTS.md` says engines decide/validate/compute. The scan found no Engine → ResourceAccess imports, so disallowing that default edge codifies the existing pure-computation practice. |
| `contextFirewall` | **omit** | No evidence-defined bounded contexts or shared/unscoped path ownership exists. Inventing scopes from feature names would make an unsupported architectural claim. |

### Override evaluation

**Propose `client-composition` (Client → Client):** 38 production Client-to-Client imports implement ordinary route/component and reusable UI composition (for example `src/routes/index.tsx:15-22` and `src/components/ui/calendar.tsx:12`). The alternative—reclassifying `components/ui` as Utility—cannot be expressed safely with the current directory alias because it would also classify those files as Client, creating ambiguity; it would require a source reorganization/renaming. A global Client → Client relaxation is therefore the smallest accurate policy statement. No tightening alternative fits this evidence.

No other override is proposed. In particular, the remaining Access → Engine, Client → Engine, Manager → Client, and Engine → Engine edges remain violations rather than being hidden by global relaxations.

## Coverage ledger

**Method:** `find src -type f` enumerated source, and the exact candidate was classified with Righting core in a temporary mirror. The candidate glob `src/**/*.{ts,tsx}` currently matches **69** files; it will include every future TypeScript/TSX file below `src/`.

| Disposition | Count | Current files |
| --- | ---: | --- |
| Test treatment (outgoing dependencies exempt) | 24 | `src/access/device-enrollments.access.test.ts`, `src/access/reminder-deliveries.access.test.ts`, `src/access/tasks-reminders.access.test.ts`, `src/access/tasks.access.test.ts`, `src/access/web-push.access.test.ts`, `src/components/calendar-color.component.test.tsx`, `src/components/calendar-dashboard.component.test.tsx`, `src/components/device-enrollment.component.test.tsx`, `src/connector-message.manager.test.ts`, `src/device-test-notification.manager.test.ts`, all 11 `src/engines/*.engine.test.ts`, `src/reminder-delivery.manager.test.ts`, `src/service-worker.test.ts`, `src/worker.test.ts` |
| ResourceAccess | 4 | `src/access/device-enrollments.access.ts`, `src/access/reminder-deliveries.access.ts`, `src/access/tasks.access.ts`, `src/access/web-push.access.ts` |
| Client | 20 | `src/components/ThemeToggle.tsx`, the 7 `src/components/*.component.tsx` files, the 9 `src/components/ui/*.tsx` files, `src/routes/__root.tsx`, `src/routes/devices.tsx`, `src/routes/index.tsx` |
| Manager | 6 | `src/connector-message.manager.ts`, `src/dashboard-access.manager.ts`, `src/device-enrollment.manager.ts`, `src/device-test-notification.manager.ts`, `src/reminder-delivery.manager.ts`, `src/task-action.manager.ts` |
| Engine | 11 | `src/engines/calendar-color.engine.ts`, `calendar-entry.engine.ts`, `connector-health.engine.ts`, `connector-message.engine.ts`, `dashboard-access.engine.ts`, `device-enrollment.engine.ts`, `easter-egg.engine.ts`, `product-task-summary.engine.ts`, `reminder-delivery.engine.ts`, `task-action.engine.ts`, `turkey-time.engine.ts` |
| Utility | 1 | `src/lib/utils.ts` |
| Composition root | 3 | `src/router.tsx`, `src/worker.ts`, `src/routeTree.gen.ts` |

There are no ambiguous or unclassified covered files. `src/routeTree.gen.ts` says it is generated (`src/routeTree.gen.ts:1-9`), but `.gen.` is **not** Righting's supported generated convention (`.generated.` or `generated/`). Its independent composition-root classification is retained; its generated treatment is unsupported and should not be inferred merely to avoid classification.

**Intentionally unchecked source:** `src/styles.css` (CSS is outside the TypeScript role model); `public/service-worker.js` (browser runtime asset); `scripts/home_uets_connector.py`, `scripts/test_home_uets_connector.py`, and `scripts/ci-workflow.test.ts` (connector/CI tooling); migrations `migrations/0001_seed_app_status.sql` through `migrations/0010_reminder_delivery_target_claims.sql` plus migration tests (schema/tooling); `seeds/local-dev.sql`; and root `vite.config.ts`, `vitest.config.ts`, and `worker-configuration.d.ts` (build/test/generated-binding configuration). Future files in these areas remain unchecked unless coverage is separately expanded.

## Dependency ledger

**Method and completeness:** An exhaustive TypeScript AST scan of every covered file recorded `import`, `export ... from`, `require`, and dynamic `import()` occurrences. It found **217** occurrences: **159 allowed**, **27 test-outgoing exemptions**, **11 composition-root-outgoing exemptions**, and **20 forbidden**. There were **zero unresolved local imports**, zero ambiguous sources, and no unclassified sources. Boundaries: this does not inspect JS/Python/CSS/SQL outside coverage, runtime-loaded names, generated route semantics, or runtime dependency behavior.

Target treatments: 95 ordinary external imports; 2 protected `web-push-neo` Resource imports (one production allowed, one test-exempt); 16 ResourceAccess, 39 Engine, 38 Client, 12 Utility, 11 Manager, 3 composition-root, and 1 outside-coverage local stylesheet reference. Ordinary external packages are not restricted by this policy.

### Forbidden occurrences — `righting/role-dependency` (20, high legacy-debt signal)

- **ResourceAccess → Engine (7):** `src/access/device-enrollments.access.ts:1`; `src/access/reminder-deliveries.access.ts:1`; `src/access/tasks.access.ts:1,5,10,14,15`.
- **Client → Engine (9):** `src/components/calendar-color.component.tsx:2`; `src/components/calendar-dashboard.component.tsx:38,45`; `src/components/device-enrollment.component.tsx:18,19`; `src/components/easter-egg.component.tsx:12`; `src/components/task-actions.component.tsx:12`; `src/routes/index.tsx:31,37,42`.
- **Manager → Client (1):** `src/dashboard-access.manager.ts:1`.
- **Engine → Engine (2):** `src/engines/calendar-entry.engine.ts:1`; `src/engines/reminder-delivery.engine.ts:1` (both import `turkey-time.engine`).
- **Client → Engine in the same grouped count above:** `src/components/calendar-dashboard.component.tsx:38,45` and `src/routes/index.tsx:31,37,42` are retained as individual concrete locations.

No `righting/unresolved-local-import`, `righting/test-dependency`, `righting/ambiguous-source`, `righting/unclassified-source`, `righting/cross-context-dependency`, or `righting/shared-to-context-dependency` occurrence was found. The context rules are present in the normalized rule-ID list but inactive because `contextFirewall` is omitted.

## Normalized contract and validation

`righting inspect --json` in `/tmp/uets-righting-1HNVJd` returned `ok: true`, policy status `valid`, and adapter status `unknown` for the exact candidate above.

```json
{
  "contractVersion": 1,
  "preset": "volatility@1",
  "configured": {
    "coverage": ["src/**/*.{ts,tsx}"],
    "aliases": [
      {"name":"component","role":"Client","filenameSuffixes":[],"directorySegments":["components"]},
      {"name":"route","role":"Client","filenameSuffixes":[],"directorySegments":["routes"]},
      {"name":"library","role":"Utility","filenameSuffixes":[],"directorySegments":["lib"]}
    ],
    "protectedDependencies": [{"package":"web-push-neo","role":"Resource"}],
    "variations": ["clientReadsAccess","pureEngines"],
    "overrides": [{"name":"client-composition","from":"Client","to":"Client","effect":"allow","reason":"Approved UI composition: routes and feature components compose reusable components from src/components."}],
    "scopes": [],
    "compositionRoots": ["router","worker","routeTree"],
    "guidance": {"domainVocabulary":"CONTEXT.md"}
  },
  "effective": {
    "allowedDependencies": {
      "Client": ["Manager","Utility","ResourceAccess","Client"],
      "Manager": ["Engine","ResourceAccess","Utility"],
      "Engine": ["Utility"],
      "ResourceAccess": ["Resource","Utility"],
      "Resource": ["Utility"],
      "Utility": ["Utility"]
    },
    "compositionRoots": ["composition-root","router","worker","routeTree"],
    "protectedDependencyRule": {"package":"web-push-neo","role":"Resource","allowedFrom":["ResourceAccess"],"forbiddenFrom":["Client","Manager","Engine","Resource","Utility"],"policyRuleId":"righting/role-dependency"},
    "scopeRules": [],
    "scopeClassification": null,
    "applicableCapabilities": ["role-dependency","manager-interaction","protected-dependency","design-judgment"],
    "inactiveCapability": "context-firewall",
    "evidenceLimits": ["files-outside-coverage","matched-files-are-inspection-evidence","runtime-behavior","maintainer-approval","adapter-activation"]
  }
}
```

The contract validates policy structure and declared static boundaries; it does **not** establish approval, adapter activation, runtime behavior, responsibility quality, or behavior outside coverage. No ESLint adapter was requested or evaluated.

## Approval request

Please approve or revise **this exact policy**, including the two variations, Client → Client override, `web-push-neo` Resource protection, and acceptance of the 20 listed legacy violations as current policy findings. This packet requests **policy adoption only**—not adapter/ESLint activation, a baseline, legacy-debt recording, or a commit.

After explicit approval, the only project changes would be: create `righting.json`; run `npx righting init --json` only if needed to create the managed `AGENTS.md` pointer/starter, then replace the starter with the approved policy; and run `npx righting inspect --json`. No project file was modified for this proposal.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Concrete coverage and dependency ledgers name all covered source classifications and 20 high-severity righting/role-dependency locations."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "git status --short && git diff --cached --name-only",
      "result": "passed",
      "summary": "No staged files; the pre-existing untracked .agents/skills/righting-integrate entry remains unstaged."
    },
    {
      "command": "npx righting --help; npx righting init --help; npx righting inspect --help",
      "result": "passed",
      "summary": "Installed Righting CLI and inspection interface confirmed."
    },
    {
      "command": "temporary-mirror righting inspect --json",
      "result": "passed",
      "summary": "Exact candidate is structurally valid (ok: true); adapter status is unknown."
    },
    {
      "command": "TypeScript AST dependency-ledger scan of src/**/*.{ts,tsx}",
      "result": "passed",
      "summary": "217 static dependency occurrences classified exhaustively; 20 policy violations, zero unresolved local imports."
    }
  ],
  "validationOutput": [
    "69 covered files: 24 tests, 4 ResourceAccess, 20 Client, 6 Manager, 11 Engine, 1 Utility, 3 composition roots.",
    "Candidate inspection returned valid normalized contract.",
    "20 high-severity righting/role-dependency findings remain intentionally visible."
  ],
  "residualRisks": [
    "High: 20 current role-dependency violations require future refactoring or separately approved policy changes before enforcement can be clean.",
    "Medium: src/routeTree.gen.ts is generated by repository evidence but does not match Righting's supported generated convention; it is classified only as a composition root.",
    "Righting has no active adapter and cannot validate runtime behavior or unchecked source areas."
  ],
  "noStagedFiles": true,
  "diffSummary": "No project files changed; this external replay artifact contains a proposed policy only.",
  "reviewFindings": [
    "high: src/access/tasks.access.ts:1,5,10,14,15 and six other Access-to-Engine imports violate the proposed ResourceAccess boundary.",
    "high: nine Client-to-Engine imports, one Manager-to-Client import, and two Engine-to-Engine imports violate the proposed policy.",
    "medium: src/routeTree.gen.ts:1-9 - generated treatment is unsupported by the active generated convention."
  ],
  "manualNotes": "Await explicit maintainer approval or revision of the exact policy packet; no enforcement, baseline, legacy-debt record, or commit was requested."
}
```