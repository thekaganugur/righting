# Righting approval packet — UETS to Task

**Status: proposed only.** No project file was created or changed. `righting.json` is currently absent. This packet requests approval for the exact policy below; it does not approve ESLint activation, a baseline, or legacy-debt suppressions.

## Exact proposed `righting.json`

```json
{
  "preset": "volatility@1",
  "coverage": ["src/**/*.ts", "src/**/*.tsx"],
  "aliases": [
    { "name": "component", "role": "Client", "directorySegments": ["components"] },
    { "name": "route", "role": "Client", "directorySegments": ["routes"] },
    { "name": "library", "role": "Utility", "directorySegments": ["lib"] }
  ],
  "generated": { "filenameMarkers": [".gen."] },
  "compositionRoots": ["worker", "router", "service-worker", "routeTree"],
  "guidance": { "domainVocabulary": "CONTEXT.md" }
}
```

## Evidence and coverage ledger

Produced by enumerating `src` files (`find src -type f`), reading `AGENTS.md`, `CONTEXT.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, and `tickets.md`, then validating the candidate in an isolated temporary mirror.

| Area / disposition | Current count | Evidence and future inclusion rule |
| --- | ---: | --- |
| `src/**/*.ts` | 52 | All current and future TypeScript source under `src`; candidate coverage. |
| `src/**/*.tsx` | 17 | All current and future TSX source under `src`; candidate coverage. |
| `src/access/**` | 9 | Canonical `ResourceAccess` directory convention. |
| `src/engines/**` | 22 | Canonical `Engine` directory convention. |
| `*.manager.ts` in `src/` | 9 | Canonical `Manager` filename convention. |
| `src/components/**` | 23 | Project UI vocabulary: `AGENTS.md` assigns user-facing mechanics to components; proposed `component` Client alias. This includes `components/ui/**`. |
| `src/routes/**` | 3 | Route UI/wiring vocabulary; proposed `route` Client alias. |
| `src/lib/utils.ts` | 1 | Reusable helper; proposed `library` Utility alias. |
| `src/worker.ts`, `src/router.tsx`, `src/service-worker.ts`, `src/routeTree.gen.ts` | 5 | Composition wiring. `routeTree.gen.ts` is also generated via evidenced `.gen.` marker and remains a generated composition root (not an invented role). |
| Tests within covered globs | 24 | `.test.` treatment; outgoing role dependencies are exempt. |
| `src/styles.css` | 1 | **Intentionally unchecked:** CSS has no Righting role convention and is imported as a Vite asset. It is excluded rather than falsely classified. |
| `scripts/home_uets_connector.py`, `scripts/test_home_uets_connector.py`, `scripts/ci-workflow.test.ts`, `scripts/README.md` | 4 files | **Intentionally unchecked:** home-server Python connector/operational scripts are outside this TypeScript application policy. |
| `migrations/*.sql` (10) and `migrations/*.test.ts` (3) | 13 | **Intentionally unchecked:** ordered D1 migration artifacts and their migration tests are not application-role source. |
| Root config/generated/type files (`vite.config.ts`, `vitest.config.ts`, `worker-configuration.d.ts`) | 3 | **Intentionally unchecked:** tool configuration/generated binding declaration, not application architecture. |

`righting inspect --json` is authoritative for candidate classification: 69 covered; Client 23, Manager 9, Engine 22, ResourceAccess 9, Utility 1, Resource 0; 24 tests; 5 composition roots; **0 unclassified and 0 ambiguous**. No zero-match coverage glob exists.

## Normalized contract and optional decisions

The normalized contract retains the two coverage globs, the three aliases, `.gen.` generated marker, four composition-root tokens, and `CONTEXT.md` guidance. It has the default role graph:

- Client → Manager, Utility
- Manager → Engine, ResourceAccess, Utility
- Engine → ResourceAccess, Utility
- ResourceAccess → Resource, Utility
- Resource → Utility; Utility → Utility

| Optional decision | Disposition | Evidence / reason |
| --- | --- | --- |
| `clientReadsAccess` | **Omit** | `AGENTS.md` says Clients own UI mechanics and Managers own workflows. The one Client → ResourceAccess occurrence is reported below rather than normalized into a global relaxation. |
| `pureEngines` | **Omit** | Existing dependency evidence shows no Engine → ResourceAccess imports, but the documents do not contain an explicit maintainer decision that every future engine must be pure. Do not encode an unapproved semantic constraint. |
| `contextFirewall` and `scopes` | **Omit** | No bounded contexts/shared/unscoped path taxonomy exists; `CONTEXT.md` names domain vocabulary, not contexts. |
| Protected dependencies | **Omit** | No package is evidenced as a project-wide Resource or Utility package. External imports remain ordinary dependencies. |
| Overrides | **Omit** | The candidate deliberately preserves the default graph. A global Client→Client, Client→Engine, ResourceAccess→Engine, Engine→Engine, or Manager→Client relaxation would conceal existing violations; extraction/responsibility clarification is preferable and no global relaxation is documented. |
| Golden examples | **Omit** | No named, maintainer-approved golden-example document was found. |

## Dependency ledger (candidate contract)

**Method:** a repository-local static text scan of all 69 covered `.ts`/`.tsx` files for literal `import`, `export … from`, `require`, and literal dynamic `import()` specifiers; `#/` was resolved using `package.json`’s `#/* → ./src/*` mapping and relative imports were resolved to TypeScript/TSX files. This is **partial**, not a TypeScript-AST or Righting adapter scan: it cannot prove computed dynamic imports, import-map/bundler behavior, type-only parser edge cases, or runtime loading. Righting itself currently validates policy/classification only; it does not scan import edges or activate an adapter.

All 121 discovered local literal occurrences have a disposition: 29 allowed default edges, 11 composition-root wiring edges, 27 test-outgoing exemptions, 53 forbidden role edges, and one `src/routes/__root.tsx → src/styles.css?url` Vite asset import outside coverage/adapter status unknown. There were no unresolved TS/TSX local specifiers. The 97 external-package occurrences are ordinary, unprotected dependencies; no protected dependency rule is proposed.

### Forbidden occurrences — severity: high (53)

All are `righting/role-dependency` under the proposed default contract. They are architectural debt to resolve before separately enabling a dependency adapter; they do **not** invalidate the structurally valid policy.

- **ResourceAccess → Engine (7):** `src/access/device-enrollments.access.ts` → `device-enrollment.engine`; `src/access/reminder-deliveries.access.ts` → `reminder-delivery.engine`; `src/access/tasks.access.ts` → `calendar-color.engine`, `connector-health.engine`, `connector-message.engine`, `reminder-delivery.engine`, `task-action.engine`.
- **Client → Client (32):** `src/components/ThemeToggle.tsx` (1); `src/components/calendar-dashboard.component.tsx` (7); `src/components/device-enrollment.component.tsx` (2); `src/components/easter-egg.component.tsx` (2); `src/components/task-actions.component.tsx` (3); `src/components/task-detail.component.tsx` (2); `src/components/ui/calendar.tsx`, `dialog.tsx`, `toggle-group.tsx` (1 each); `src/routes/devices.tsx` (2); `src/routes/index.tsx` (10).
- **Client → Engine (10):** `src/components/calendar-color.component.tsx` (1); `calendar-dashboard.component.tsx` (2); `device-enrollment.component.tsx` (2); `easter-egg.component.tsx` (1); `task-actions.component.tsx` (1); `src/routes/index.tsx` (3).
- **Client → ResourceAccess (1):** `src/routes/index.tsx` → `src/access/tasks.access.ts`.
- **Engine → Engine (2):** `src/engines/calendar-entry.engine.ts` and `src/engines/reminder-delivery.engine.ts` → `turkey-time.engine`.
- **Manager → Client (1):** `src/dashboard-access.manager.ts` → `src/components/dashboard-access.component.tsx`.

The Client→Client and Client→Engine findings are concentrated in UI composition and direct display calculation. The ResourceAccess→Engine findings are concentrated in task/access code. These are concrete candidates for extraction or direction correction, rather than evidence for a global override.

## Validation

- Candidate was written **only** in a temporary mirror, never in this repository.
- `npx righting inspect --json` passed in that mirror. It returned the exact configured provenance above, default effective graph, `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, and `righting/test-dependency` rule IDs, and no source violations.
- No test suite was run: no source or project policy file was changed. This validation is structural policy validation, not runtime or adapter validation.

## Evidence limits and uncertainties

1. Righting establishes declared classification and, only after separately approved adapter activation, static role boundaries. It does not establish maintainer approval, runtime behavior, files outside coverage, architecture quality, or adapter activation.
2. The dependency ledger is partial as described above. The non-TypeScript CSS asset import is deliberately outside the policy and has unknown adapter treatment.
3. The 53 findings are scan evidence, not Righting inspection output. No `righting-eslint` adapter has been approved or configured.
4. The untracked `.agents/skills/righting-integrate` path existed in the worktree; it was not created or changed by this task.

## Requested approval

Please explicitly approve or revise **this exact `righting.json`**, including: (1) broad TS/TSX-only coverage and intentional exclusions, (2) `component`, `route`, and `library` aliases, (3) `.gen.` and composition-root treatment, (4) no optional variations/overrides/protected packages/scopes, and (5) recording the 53 dependency findings as unremediated architecture debt without baseline or adapter activation.

On approval, the only proposed project change is adding/replacing root `righting.json` with the exact candidate. No ESLint adapter, baseline, legacy-debt record, generated route update, or commit is requested in this packet.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Concrete coverage, classification, dependency findings, counts, paths, and high severity are recorded above."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "npx righting inspect --json (temporary mirror)",
      "result": "passed",
      "summary": "69 covered; zero unclassified, ambiguous, or source violations."
    },
    {
      "command": "static literal import/export/require/dynamic-import ledger scan",
      "result": "passed",
      "summary": "121 local occurrences classified; 53 forbidden edges recorded; scan completeness is partial."
    },
    {
      "command": "git diff --cached --name-only",
      "result": "passed",
      "summary": "No staged files."
    }
  ],
  "validationOutput": [
    "Candidate policy passed Righting inspection in a temporary mirror.",
    "No project files were modified."
  ],
  "residualRisks": [
    "53 high-severity default role-edge violations remain before any adapter activation.",
    "Dependency evidence is partial and CSS asset adapter treatment is unknown.",
    "Maintainer approval is still required."
  ],
  "noStagedFiles": true,
  "diffSummary": "No project diff; approval packet written only to the required external replay path.",
  "reviewFindings": [
    "high: src/access/tasks.access.ts and related access files - 7 ResourceAccess-to-Engine dependencies violate the proposed default graph.",
    "high: src/components/** and src/routes/** - 43 Client-to-Client/Engine/ResourceAccess dependencies violate the proposed default graph.",
    "high: src/engines/calendar-entry.engine.ts, src/engines/reminder-delivery.engine.ts, and src/dashboard-access.manager.ts - 3 additional forbidden role edges."
  ],
  "manualNotes": "Approval is requested for the exact policy and for leaving the reported findings as debt; no adapter, baseline, or legacy-debt action is requested."
}
```
