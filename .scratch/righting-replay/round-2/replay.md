# Righting approval packet — UETS to Task

## Proposed policy (approval required; not applied)

```json
{
  "preset": "volatility@1",
  "coverage": ["src/**/*.{ts,tsx}"],
  "aliases": [
    {
      "name": "ui",
      "role": "Client",
      "filenameSuffixes": [".component."],
      "directorySegments": ["components", "routes"]
    },
    {
      "name": "library",
      "role": "Utility",
      "directorySegments": ["lib"]
    }
  ],
  "generated": { "filenameMarkers": [".gen."] },
  "compositionRoots": ["router", "worker"],
  "overrides": [
    {
      "name": "client-composes-client",
      "from": "Client",
      "to": "Client",
      "effect": "allow",
      "reason": "React route and component composition is UI mechanics; the repository has no narrower role for reusable client components."
    }
  ],
  "guidance": { "domainVocabulary": "CONTEXT.md" }
}
```

### Normalized contract

`righting inspect --json` in a temporary tracked-file mirror returned `ok: true`, policy `valid`, contract version 1, and adapter status `unknown`.

- Effective Client dependencies: `Manager`, `Utility`, and the approved `Client` override.
- Manager: `Engine`, `ResourceAccess`, `Utility`; Engine: `ResourceAccess`, `Utility`; ResourceAccess: `Resource`, `Utility`; Resource and Utility retain their preset edges.
- Conventions add `.component.` and `components`/`routes` to Client, `lib` to Utility, `.gen.` to generated, and `router`/`worker` as composition roots.
- No protected packages, scopes, or variations are configured. Guidance points to `CONTEXT.md`.

## Evidence ledger

### Coverage ledger (exhaustive for tracked TypeScript/TSX under `src`)

`src/**/*.{ts,tsx}` currently matches 69 files and means every future TypeScript/TSX source file below `src` is included.

| Disposition | Current files | Evidence / treatment |
| --- | --- | --- |
| Client (20) | `src/components/ThemeToggle.tsx`; `src/components/calendar-color.component.tsx`; `src/components/calendar-dashboard.component.tsx`; `src/components/dashboard-access.component.tsx`; `src/components/device-enrollment.component.tsx`; `src/components/easter-egg.component.tsx`; `src/components/task-actions.component.tsx`; `src/components/task-detail.component.tsx`; `src/components/ui/{button,calendar,card,dialog,drawer,popover,sheet,toggle-group,toggle}.tsx`; `src/routes/{__root,devices,index}.tsx` | Repository guideline assigns UI mechanics to `*.component.tsx`; components and routes are the evidenced UI vocabulary. |
| Manager (6) | `src/{connector-message,dashboard-access,device-enrollment,device-test-notification,reminder-delivery,task-action}.manager.ts` | Canonical `.manager.` convention. |
| Engine (11) | `src/engines/{calendar-color,calendar-entry,connector-health,connector-message,dashboard-access,device-enrollment,easter-egg,product-task-summary,reminder-delivery,task-action,turkey-time}.engine.ts` | Canonical `.engine.` convention and `AGENTS.md` decision/computation ownership. |
| ResourceAccess (4) | `src/access/{device-enrollments,reminder-deliveries,tasks,web-push}.access.ts` | Canonical `.access.` convention and data/transport ownership. |
| Utility (1) | `src/lib/utils.ts` | `lib` is the sole established reusable helper directory; alias is a directory convention, not a file map. |
| Composition root (2) | `src/router.tsx`, `src/worker.ts` | Router assembles generated routes; Worker assembles handlers and workflow/access dependencies. |
| Generated (1) | `src/routeTree.gen.ts` | `.gen.` is evidenced by TanStack route generation and the instruction not to edit this file. |
| Test (24) | `src/access/{device-enrollments,reminder-deliveries,tasks-reminders,tasks,web-push}.access.test.ts`; `src/components/{calendar-color,calendar-dashboard,device-enrollment}.component.test.tsx`; `src/engines/{calendar-color,calendar-entry,connector-health,connector-message,dashboard-access,device-enrollment,easter-egg,product-task-summary,reminder-delivery,task-action,turkey-time}.engine.test.ts`; `src/{connector-message.manager,device-test-notification.manager,reminder-delivery.manager,service-worker,worker}.test.ts` | Standard `.test.` treatment: visible, outgoing production dependencies exempt. |

There are no ambiguous or unclassified files in coverage.

**Intentionally unchecked source and adjunct areas:** `migrations/**/*.sql` (D1 migrations); `migrations/*.{test.ts}` (three migration tests); `scripts/home_uets_connector.py`, `scripts/test_home_uets_connector.py`, and `scripts/ci-workflow.test.ts` (home-server/CI tooling); `public/service-worker.js` (browser asset); root `vite.config.ts` and `vitest.config.ts` (tool configuration); and root `worker-configuration.d.ts` (Wrangler-generated bindings). The last is generated source outside the active coverage glob: its generator is evidenced by `package.json` `cf-typegen` and `AGENTS.md`, but it has no active generated treatment because root declaration files are intentionally not covered. `src/styles.css` is an intentionally unchecked non-code asset.

### Dependency ledger (exhaustive static AST scan of covered TS/TSX)

Method: TypeScript AST traversal of all 69 covered files for static `import`/`export ... from`, `require`, and literal dynamic `import`, followed by resolution of relative and `#/` paths. No partial boundary exists within covered TS/TSX. The scan found 217 occurrences: 120 local and 97 external.

- **External (97):** all are ordinary, unprotected dependencies; no package has evidence for a global Resource or Utility classification. The major specifiers are `vitest` (24), `react` (16), `cloudflare:workers` (11), `radix-ui` (6), `lucide-react` (6), `@tanstack/react-router` (5), and `@tanstack/react-start` (5). Remaining occurrences are UI, Node, test, and Web Push packages declared in `package.json`.
- **Local permitted (60):** role-graph permitted edges, including 31 Client→Client composition edges admitted only by `client-composes-client`.
- **Test outgoing exemptions (27):** all are permitted by the explicit test treatment; no production source imports a test.
- **Composition/generated wiring (11):** `src/worker.ts`, `src/router.tsx`, and `src/routeTree.gen.ts` are non-role wiring/generated treatment.
- **Unchecked target (1):** `src/routes/__root.tsx:4` imports `src/styles.css?url`; the target is the intentionally unchecked CSS asset, not a governed source role.

### Existing policy violations under the exact candidate

These are intentionally retained as visible legacy debt; no baseline or enforcement activation is requested.

| Severity | Rule / count | Locations |
| --- | --- | --- |
| High | `righting/role-dependency`: ResourceAccess→Engine (7) | `src/access/device-enrollments.access.ts:1`; `src/access/reminder-deliveries.access.ts:1`; `src/access/tasks.access.ts:1,5,10,14,15` |
| High | `righting/role-dependency`: Client→Engine (10) | `src/components/calendar-color.component.tsx:2`; `src/components/calendar-dashboard.component.tsx:38,45`; `src/components/device-enrollment.component.tsx:18,19`; `src/components/easter-egg.component.tsx:12`; `src/components/task-actions.component.tsx:12`; `src/routes/index.tsx:31,37,42` |
| High | `righting/role-dependency`: Client→ResourceAccess (1) | `src/routes/index.tsx:9` |
| High | `righting/role-dependency`: Manager→Client (1) | `src/dashboard-access.manager.ts:1` |
| Medium | `righting/role-dependency`: Engine→Engine (2) | `src/engines/calendar-entry.engine.ts:1`; `src/engines/reminder-delivery.engine.ts:1` |

The candidate has **21 forbidden local role edges**. There are zero `righting/unclassified-source`, `righting/ambiguous-source`, `righting/test-dependency`, or governed-source unresolved-local-import occurrences. The CSS asset above is outside the source policy boundary, not represented as a governed-source violation.

## Decisions considered

- **Override `client-composes-client`: propose.** Default policy does not fit React component/route composition (31 concrete edges). The code remains UI mechanics, and no narrower role exists for reusable React components. This single global allowance is the tightest available policy-language expression.
- **Other possible overrides: omit.** Client→Engine/ResourceAccess, ResourceAccess→Engine, Manager→Client, and Engine→Engine conflict with the documented roles. A global relaxation would hide responsibility/extraction candidates, so they remain visible debt.
- **`clientReadsAccess`: omit.** It would hide `src/routes/index.tsx:9`, contrary to the Manager workflow boundary.
- **`pureEngines`: omit.** No maintainer decision or repository convention requires every Engine to exclude ResourceAccess; enabling it would only add tightening not requested by evidence.
- **`contextFirewall`: omit.** The repository has module directories, but no approved bounded contexts plus shared/unscoped scope taxonomy. Inventing scopes would create unsupported ambiguity.
- **Protected dependencies, more aliases, golden examples, and generated directories: omit.** No evidence supports them. In particular, `.page.` has no current match; `ui` and `library` are reusable conventions rather than path mappings.

## Validation and limits

- Candidate syntax and semantics were validated in a temporary mirror, not this project, with `righting inspect --json`; configured provenance and effective semantics above match both ledgers.
- `npm run check` passed: Biome checked 71 files with no fixes.
- Righting reports adapter status `unknown`; no ESLint adapter is configured or evaluated. The policy establishes static boundaries only after separately approved enforcement; it cannot establish role responsibility, runtime behavior, UETS/legal safety, external package behavior, or files outside coverage.
- Repository state was not changed. The only working-tree entry is pre-existing untracked `.agents/skills/righting-integrate`; there are no staged files.

## Requested approval

Please explicitly approve or revise this exact policy and the single `client-composes-client` override. If approved, authorize only: (1) add this `righting.json`; (2) run `npx righting init --json` as needed to add the managed `AGENTS.md` pointer while preserving the approved policy; and (3) rerun `npx righting inspect --json`. No ESLint adapter/enforcement, baseline, legacy-debt record, refactor, or commit is requested or authorized by this packet.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Concrete coverage and dependency findings name exact repository paths, rule IDs, counts, and High/Medium severities."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "righting inspect --json (temporary tracked-file mirror with exact candidate)",
      "result": "passed",
      "summary": "Policy valid; normalized contract version 1; adapter unknown."
    },
    {
      "command": "TypeScript AST dependency scan of src/**/*.{ts,tsx}",
      "result": "passed",
      "summary": "69 files and 217 dependency occurrences classified exhaustively."
    },
    {
      "command": "npm run check",
      "result": "passed",
      "summary": "Biome checked 71 files; no fixes applied."
    },
    {
      "command": "git diff --check && git diff --cached --check && git diff --cached --name-only && git status --short",
      "result": "passed",
      "summary": "No diff errors or staged files; only pre-existing untracked skill directory is present."
    }
  ],
  "validationOutput": [
    "Exact candidate passed righting inspection in a temporary mirror.",
    "21 High/Medium existing forbidden role edges remain visible as unapproved legacy debt.",
    "No project files were modified."
  ],
  "residualRisks": [
    "Adapter status is unknown; no ESLint enforcement was inspected or activated.",
    "21 existing forbidden role dependencies require future refactor or separately approved legacy-debt handling.",
    "Python, SQL, public JavaScript, root tooling, generated bindings, and CSS are intentionally outside coverage."
  ],
  "noStagedFiles": true,
  "diffSummary": "No project diff. This approval packet was written only to the required external replay artifact.",
  "reviewFindings": [
    "high: src/access/tasks.access.ts:1,5,10,14,15 - ResourceAccess imports Engines contrary to the proposed graph.",
    "high: src/routes/index.tsx:9,31,37,42 - Client directly imports ResourceAccess and Engines.",
    "medium: src/engines/calendar-entry.engine.ts:1 and src/engines/reminder-delivery.engine.ts:1 - Engine-to-Engine imports require extraction or an unapproved relaxation."
  ],
  "manualNotes": "Approval is required before adding righting.json, a managed guidance pointer, enforcement, a baseline, or any refactor."
}
```