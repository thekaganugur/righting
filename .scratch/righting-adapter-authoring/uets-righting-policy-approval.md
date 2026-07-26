# uets-to-task Righting policy approval packet

Prepared for **Establish the uets-to-task normalized Righting contract**.

## Recommendation

Approve the exact policy below and the listed setup actions. It covers all TypeScript application source under `src`, preserves the project's page/component/lib vocabulary, recognizes generated route wiring and composition roots, and links `CONTEXT.md`. It does not add an Oxlint adapter or claim enforcement.

Current source inspection has no classification violations. The separate dependency ledger reports 21 existing `righting/role-dependency` observed inconsistencies; approval records the policy, not exceptions or cleanup approval.

## Exact candidate `righting.json`

```json
{
  "preset": "volatility@1",
  "coverage": ["src/**/*.{ts,tsx}"],
  "aliases": [
    {
      "name": "page",
      "role": "Client",
      "filenameSuffixes": [".page."],
      "directorySegments": ["routes"]
    },
    {
      "name": "component",
      "role": "Client",
      "filenameSuffixes": [".component."],
      "directorySegments": ["components"]
    },
    {
      "name": "lib",
      "role": "Utility",
      "directorySegments": ["lib"]
    }
  ],
  "generated": {
    "filenameMarkers": [".gen."]
  },
  "variations": ["pureEngines"],
  "overrides": [
    {
      "name": "client-composition",
      "from": "Client",
      "to": "Client",
      "effect": "allow",
      "reason": "Pages and components compose other client-facing components in the approved project structure."
    }
  ],
  "compositionRoots": ["router", "routeTree", "worker"],
  "guidance": {
    "domainVocabulary": "CONTEXT.md"
  }
}
```

## Optional decisions

- `pureEngines`: **propose**. Project guidance separates decisions/computation from where data lives; no current Engine → ResourceAccess imports exist. Benefit: preserves that separation. Cost: future Engines cannot access ResourceAccess directly without revisiting policy.
- `clientReadsAccess`: **omit**. One current Client → ResourceAccess import exists at `src/routes/index.tsx:9`, but project guidance routes workflow and access through Managers/ResourceAccess rather than approving a global Client shortcut. Benefit: keeps the strict boundary. Cost: the current edge remains an observed inconsistency.
- `contextFirewall`: **omit**. Project docs do not define context/shared/unscoped path identities. Benefit: avoids encoding accidental folder structure. Cost: “never import across modules” remains guidance rather than a declared context firewall. Optional design suggestion: revisit with a bounded-context specialist only if cross-module pressure becomes recurring.
- `client-composition` override: **propose**. The project explicitly treats pages and components as Client code and promotes shared UI to `src/components`; existing page/component composition therefore needs Client → Client. Alternative classification as Utility would misstate visible/clickable UI responsibilities. This is the only override.
- Protected dependencies: **omit**. No external package is maintainer-declared as a protected Resource or Utility.
- Guidance golden examples: **omit**. No project-owned golden example is designated.

## Coverage summary

- Future inclusion rule: every `.ts`/`.tsx` file anywhere under `src/` is covered by `src/**/*.{ts,tsx}`.
- Current matches: 69 covered files; Client 23, Manager 9, Engine 22, ResourceAccess 9, Utility 1, composition roots 4; 24 are tests. No unclassified or ambiguous covered source.
- Alias matches: `page` 3, `component` 20, `lib` 1.
- Composition-root matches: `router` → `src/router.tsx`; `routeTree` → generated `src/routeTree.gen.ts`; `worker` → `src/worker.ts` and `src/worker.test.ts`. Every token has a non-test current match.
- Intentionally unchecked: CSS and public static assets; Python/home-connector scripts; SQL/seeds/migrations and their migration tests; build/test/CI configuration; documentation, agent skills, and repository metadata. These sit outside the first TypeScript application role contract. In particular, `src/styles.css`, `public/service-worker.js`, `scripts/**`, `migrations/**`, and root tool configuration remain unchecked.
- Generated treatment: `.gen.` is evidenced by TanStack's `src/routeTree.gen.ts`; generated status combines with the `routeTree` composition root and does not invent a role.

## Dependency summary

- Method: complete current TypeScript source scan of static import/export declarations, `require`, and dynamic import forms, resolving relative and `#/` local imports against the exact candidate contract.
- 120 local dependency occurrences: 60 allowed role edges, 11 composition-root wiring edges, 27 test-outgoing exemptions, 1 target outside coverage, and 21 `righting/role-dependency` observed inconsistencies.
- No unresolved local imports or production-to-test imports were found.
- Inconsistency groups: ResourceAccess → Engine (7), Client → Engine (10), Manager → Client (1), Engine → Engine (2), Client → ResourceAccess (1).
- Adapter status is unknown. Inspection does not enforce imports, prove runtime behavior, verify approval, or activate a guardrail.

## Files and commands to apply after approval

1. Pack Righting `0.1.0` from source commit `569b9eba240de0e6197c028529fa3c176c10a408` and vendor the immutable 28,445-byte artifact in `uets-to-task` for pre-publication dogfood (SHA-1 `42c4d297086e02eb84188c4cef584abfa65636a2`; integrity `sha512-kK3wzq3oXWcipshhRPsNpPLHfhBFJh9SyjRoMKm25fNVW34/svnDciQRoGoXQus+JKHcSxEaQ8SVRYS04054Jg==`).
2. Add that artifact as a dev dependency and update `package-lock.json`.
3. Run `npx righting init --skills --json`, preserving project-owned `AGENTS.md` text and adding only Righting's managed pointer and discoverable skill links.
4. Replace the exact incomplete starter with the approved `righting.json` above.
5. Run `npx righting inspect --json`, `npm run check`, and `git diff --check`.
6. Commit only the policy/setup baseline. Do not add Oxlint plugin, rule, configuration, suppression, or adapter behavior.

Available adapter recommendation: none for this step. The packaged v1 adapter is ESLint-only and this project uses Oxlint; adapter selection remains separate and unapproved.

## Exact validated `righting inspect --json`

```json
{
  "schemaVersion": 1,
  "command": "inspect",
  "ok": true,
  "policy": {
    "path": "righting.json",
    "status": "valid"
  },
  "adapter": {
    "status": "unknown"
  },
  "contract": {
    "contractVersion": 1,
    "preset": "volatility@1",
    "roles": [
      "Client",
      "Manager",
      "Engine",
      "ResourceAccess",
      "Resource",
      "Utility"
    ],
    "configured": {
      "coverage": [
        "src/**/*.{ts,tsx}"
      ],
      "aliases": [
        {
          "name": "page",
          "role": "Client",
          "filenameSuffixes": [
            ".page."
          ],
          "directorySegments": [
            "routes"
          ]
        },
        {
          "name": "component",
          "role": "Client",
          "filenameSuffixes": [
            ".component."
          ],
          "directorySegments": [
            "components"
          ]
        },
        {
          "name": "lib",
          "role": "Utility",
          "filenameSuffixes": [],
          "directorySegments": [
            "lib"
          ]
        }
      ],
      "generated": {
        "filenameMarkers": [
          ".gen."
        ],
        "directorySegments": []
      },
      "protectedDependencies": [],
      "variations": [
        "pureEngines"
      ],
      "overrides": [
        {
          "name": "client-composition",
          "from": "Client",
          "to": "Client",
          "effect": "allow",
          "reason": "Pages and components compose other client-facing components in the approved project structure."
        }
      ],
      "scopes": [],
      "compositionRoots": [
        "router",
        "routeTree",
        "worker"
      ],
      "guidance": {
        "domainVocabulary": "CONTEXT.md"
      }
    },
    "effective": {
      "allowedDependencies": {
        "Client": [
          "Manager",
          "Utility",
          "Client"
        ],
        "Manager": [
          "Engine",
          "ResourceAccess",
          "Utility"
        ],
        "Engine": [
          "Utility"
        ],
        "ResourceAccess": [
          "Resource",
          "Utility"
        ],
        "Resource": [
          "Utility"
        ],
        "Utility": [
          "Utility"
        ]
      },
      "conventions": {
        "roles": {
          "Client": {
            "filenameSuffixes": [
              ".client.",
              ".page.",
              ".component."
            ],
            "directorySegments": [
              "clients",
              "routes",
              "components"
            ]
          },
          "Manager": {
            "filenameSuffixes": [
              ".manager."
            ],
            "directorySegments": [
              "managers"
            ]
          },
          "Engine": {
            "filenameSuffixes": [
              ".engine."
            ],
            "directorySegments": [
              "engines"
            ]
          },
          "ResourceAccess": {
            "filenameSuffixes": [
              ".access."
            ],
            "directorySegments": [
              "access"
            ]
          },
          "Resource": {
            "filenameSuffixes": [
              ".resource."
            ],
            "directorySegments": [
              "resources"
            ]
          },
          "Utility": {
            "filenameSuffixes": [
              ".utility."
            ],
            "directorySegments": [
              "utilities",
              "lib"
            ]
          }
        },
        "tests": {
          "filenameMarkers": [
            ".test.",
            ".spec."
          ],
          "directorySegments": [
            "test",
            "tests",
            "__tests__"
          ]
        },
        "generated": {
          "filenameMarkers": [
            ".generated.",
            ".gen."
          ],
          "directorySegments": [
            "generated"
          ]
        },
        "compositionRoots": [
          "composition-root",
          "router",
          "routeTree",
          "worker"
        ]
      },
      "policyRuleIds": [
        "righting/role-dependency",
        "righting/unresolved-local-import",
        "righting/unclassified-source",
        "righting/ambiguous-source",
        "righting/test-dependency",
        "righting/cross-context-dependency",
        "righting/shared-to-context-dependency",
        "righting/ambiguous-scope"
      ],
      "protectedDependencyRules": [],
      "scopeRules": [],
      "scopeClassification": null,
      "capabilities": [
        {
          "id": "role-dependency",
          "applies": true,
          "coverage": "statically-enforceable",
          "policyRuleIds": [
            "righting/role-dependency",
            "righting/unresolved-local-import",
            "righting/unclassified-source",
            "righting/ambiguous-source",
            "righting/test-dependency"
          ],
          "establishes": [
            "configured-role-dependency-boundaries",
            "unresolved-local-import-is-forbidden"
          ],
          "doesNotEstablish": [
            "files-outside-coverage",
            "runtime-dependency-behavior"
          ]
        },
        {
          "id": "manager-interaction",
          "applies": true,
          "coverage": "partially-checkable",
          "policyRuleIds": [
            "righting/role-dependency"
          ],
          "establishes": [
            "direct-manager-import-is-forbidden"
          ],
          "doesNotEstablish": [
            "queued-interaction-semantics"
          ]
        },
        {
          "id": "protected-dependency",
          "applies": false,
          "coverage": "statically-enforceable",
          "policyRuleIds": [
            "righting/role-dependency"
          ],
          "establishes": [
            "configured-resource-and-utility-package-classification"
          ],
          "doesNotEstablish": [
            "external-service-runtime-behavior",
            "utility-package-access-restriction"
          ]
        },
        {
          "id": "context-firewall",
          "applies": false,
          "coverage": "statically-enforceable",
          "policyRuleIds": [
            "righting/cross-context-dependency",
            "righting/shared-to-context-dependency",
            "righting/ambiguous-scope"
          ],
          "establishes": [
            "cross-context-source-import-is-forbidden",
            "shared-to-context-source-import-is-forbidden"
          ],
          "doesNotEstablish": [
            "cross-context-runtime-behavior"
          ]
        },
        {
          "id": "design-judgment",
          "applies": true,
          "coverage": "guidance-only",
          "policyRuleIds": [],
          "establishes": [],
          "doesNotEstablish": [
            "role-responsibility",
            "real-volatility",
            "contract-quality",
            "runtime-behavior",
            "use-case-validity"
          ]
        }
      ],
      "evidenceLimits": [
        "files-outside-coverage",
        "matched-files-are-inspection-evidence",
        "runtime-behavior",
        "maintainer-approval",
        "adapter-activation"
      ]
    }
  },
  "evidence": {
    "sourceSummary": {
      "covered": 69,
      "roles": {
        "Client": 23,
        "Manager": 9,
        "Engine": 22,
        "ResourceAccess": 9,
        "Resource": 0,
        "Utility": 1
      },
      "tests": 24,
      "compositionRoots": 4,
      "unclassified": 0,
      "ambiguous": 0
    },
    "sourceViolations": []
  }
}
```

## Full coverage ledger

```json
{
  "method": "git ls-files at uets-to-task HEAD, classified with exact candidate contract",
  "total": 150,
  "groups": {
    "outside-coverage": [
      ".agents/skills/shadcn/SKILL.md",
      ".agents/skills/shadcn/agents/openai.yml",
      ".agents/skills/shadcn/assets/shadcn-small.png",
      ".agents/skills/shadcn/assets/shadcn.png",
      ".agents/skills/shadcn/cli.md",
      ".agents/skills/shadcn/customization.md",
      ".agents/skills/shadcn/evals/evals.json",
      ".agents/skills/shadcn/mcp.md",
      ".agents/skills/shadcn/registry.md",
      ".agents/skills/shadcn/rules/base-vs-radix.md",
      ".agents/skills/shadcn/rules/chat.md",
      ".agents/skills/shadcn/rules/composition.md",
      ".agents/skills/shadcn/rules/forms.md",
      ".agents/skills/shadcn/rules/icons.md",
      ".agents/skills/shadcn/rules/styling.md",
      ".agents/skills/workers-best-practices/SKILL.md",
      ".agents/skills/workers-best-practices/references/review.md",
      ".agents/skills/workers-best-practices/references/rules.md",
      ".agents/skills/wrangler/SKILL.md",
      ".cta.json",
      ".cursorrules",
      ".dev.vars.example",
      ".github/workflows/ci.yml",
      ".gitignore",
      ".oxfmtrc.json",
      ".oxlintrc.json",
      ".vscode/settings.json",
      "AGENTS.md",
      "CLAUDE.md",
      "CONTEXT.md",
      "README.md",
      "components.json",
      "docs/DECISIONS.md",
      "docs/SPEC.md",
      "docs/adr/0001-home-local-message-diagnosis.md",
      "docs/research/calendar-entry-density.md",
      "docs/research/calendar-foundation.md",
      "docs/research/reminder-web-push-foundation.md",
      "docs/specs/device-test-notification.md",
      "docs/specs/reminder-deliveries.md",
      "docs/web-push-transport.md",
      "migrations/0001_seed_app_status.sql",
      "migrations/0002_inbound_email_tasks.sql",
      "migrations/0003_connector_tasks.sql",
      "migrations/0004_simplify_task_status.sql",
      "migrations/0005_task_origin.sql",
      "migrations/0006_task_calendar_colors.sql",
      "migrations/0006_task_calendar_colors.test.ts",
      "migrations/0007_device_enrollments.sql",
      "migrations/0007_device_enrollments.test.ts",
      "migrations/0008_reminder_delivery_candidates.sql",
      "migrations/0008_reminder_delivery_candidates.test.ts",
      "migrations/0009_reminder_delivery_target_outcomes.sql",
      "migrations/0010_reminder_delivery_target_claims.sql",
      "package-lock.json",
      "package.json",
      "public/easter-egg/01.gif",
      "public/easter-egg/02.gif",
      "public/easter-egg/03.gif",
      "public/easter-egg/04.gif",
      "public/easter-egg/05.gif",
      "public/favicon.ico",
      "public/logo192.png",
      "public/logo512.png",
      "public/manifest.json",
      "public/robots.txt",
      "public/service-worker.js",
      "scripts/README.md",
      "scripts/ci-workflow.test.ts",
      "scripts/home_uets_connector.py",
      "scripts/test_home_uets_connector.py",
      "seeds/local-dev.sql",
      "skills-lock.json",
      "src/styles.css",
      "tickets.md",
      "tsconfig.json",
      "tsr.config.json",
      "vite.config.ts",
      "vitest.config.ts",
      "worker-configuration.d.ts",
      "wrangler.jsonc"
    ],
    "ResourceAccess:test": [
      "src/access/device-enrollments.access.test.ts",
      "src/access/reminder-deliveries.access.test.ts",
      "src/access/tasks-reminders.access.test.ts",
      "src/access/tasks.access.test.ts",
      "src/access/web-push.access.test.ts"
    ],
    "ResourceAccess": [
      "src/access/device-enrollments.access.ts",
      "src/access/reminder-deliveries.access.ts",
      "src/access/tasks.access.ts",
      "src/access/web-push.access.ts"
    ],
    "Client": [
      "src/components/ThemeToggle.tsx",
      "src/components/calendar-color.component.tsx",
      "src/components/calendar-dashboard.component.tsx",
      "src/components/dashboard-access.component.tsx",
      "src/components/device-enrollment.component.tsx",
      "src/components/easter-egg.component.tsx",
      "src/components/task-actions.component.tsx",
      "src/components/task-detail.component.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/calendar.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/dialog.tsx",
      "src/components/ui/drawer.tsx",
      "src/components/ui/popover.tsx",
      "src/components/ui/sheet.tsx",
      "src/components/ui/toggle-group.tsx",
      "src/components/ui/toggle.tsx",
      "src/routes/__root.tsx",
      "src/routes/devices.tsx",
      "src/routes/index.tsx"
    ],
    "Client:test": [
      "src/components/calendar-color.component.test.tsx",
      "src/components/calendar-dashboard.component.test.tsx",
      "src/components/device-enrollment.component.test.tsx"
    ],
    "Manager:test": [
      "src/connector-message.manager.test.ts",
      "src/device-test-notification.manager.test.ts",
      "src/reminder-delivery.manager.test.ts"
    ],
    "Manager": [
      "src/connector-message.manager.ts",
      "src/dashboard-access.manager.ts",
      "src/device-enrollment.manager.ts",
      "src/device-test-notification.manager.ts",
      "src/reminder-delivery.manager.ts",
      "src/task-action.manager.ts"
    ],
    "Engine:test": [
      "src/engines/calendar-color.engine.test.ts",
      "src/engines/calendar-entry.engine.test.ts",
      "src/engines/connector-health.engine.test.ts",
      "src/engines/connector-message.engine.test.ts",
      "src/engines/dashboard-access.engine.test.ts",
      "src/engines/device-enrollment.engine.test.ts",
      "src/engines/easter-egg.engine.test.ts",
      "src/engines/product-task-summary.engine.test.ts",
      "src/engines/reminder-delivery.engine.test.ts",
      "src/engines/task-action.engine.test.ts",
      "src/engines/turkey-time.engine.test.ts"
    ],
    "Engine": [
      "src/engines/calendar-color.engine.ts",
      "src/engines/calendar-entry.engine.ts",
      "src/engines/connector-health.engine.ts",
      "src/engines/connector-message.engine.ts",
      "src/engines/dashboard-access.engine.ts",
      "src/engines/device-enrollment.engine.ts",
      "src/engines/easter-egg.engine.ts",
      "src/engines/product-task-summary.engine.ts",
      "src/engines/reminder-delivery.engine.ts",
      "src/engines/task-action.engine.ts",
      "src/engines/turkey-time.engine.ts"
    ],
    "Utility": [
      "src/lib/utils.ts"
    ],
    "composition-root:generated": [
      "src/routeTree.gen.ts"
    ],
    "composition-root": [
      "src/router.tsx",
      "src/worker.ts"
    ],
    "test": [
      "src/service-worker.test.ts"
    ],
    "composition-root:test": [
      "src/worker.test.ts"
    ]
  },
  "aliases": {
    "page": [
      "src/routes/__root.tsx",
      "src/routes/devices.tsx",
      "src/routes/index.tsx"
    ],
    "component": [
      "src/components/ThemeToggle.tsx",
      "src/components/calendar-color.component.test.tsx",
      "src/components/calendar-color.component.tsx",
      "src/components/calendar-dashboard.component.test.tsx",
      "src/components/calendar-dashboard.component.tsx",
      "src/components/dashboard-access.component.tsx",
      "src/components/device-enrollment.component.test.tsx",
      "src/components/device-enrollment.component.tsx",
      "src/components/easter-egg.component.tsx",
      "src/components/task-actions.component.tsx",
      "src/components/task-detail.component.tsx",
      "src/components/ui/button.tsx",
      "src/components/ui/calendar.tsx",
      "src/components/ui/card.tsx",
      "src/components/ui/dialog.tsx",
      "src/components/ui/drawer.tsx",
      "src/components/ui/popover.tsx",
      "src/components/ui/sheet.tsx",
      "src/components/ui/toggle-group.tsx",
      "src/components/ui/toggle.tsx"
    ],
    "lib": [
      "src/lib/utils.ts"
    ]
  },
  "compositionRoots": [
    "src/routeTree.gen.ts",
    "src/router.tsx",
    "src/worker.test.ts",
    "src/worker.ts"
  ]
}
```

## Full dependency ledger

```json
{
  "scan": "Whole-file static module-specifier scan covering import/export declarations, require calls, and dynamic imports; all covered source extensions; local relative and #/ resolution",
  "completeness": "exhaustive for the current TypeScript source forms; CSS and Python are outside policy coverage; ordinary external packages are unprotected and excluded",
  "totalLocalOccurrences": 120,
  "counts": {
    "test-outgoing-exempt": 27,
    "righting/role-dependency": 21,
    "allowed": 60,
    "composition-root-wiring": 11,
    "target-outside-coverage": 1
  },
  "violations": [
    {
      "sourcePath": "src/access/device-enrollments.access.ts",
      "line": 1,
      "specifier": "#/engines/device-enrollment.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/device-enrollment.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/access/reminder-deliveries.access.ts",
      "line": 1,
      "specifier": "#/engines/reminder-delivery.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/reminder-delivery.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/access/tasks.access.ts",
      "line": 1,
      "specifier": "#/engines/calendar-color.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/calendar-color.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/access/tasks.access.ts",
      "line": 5,
      "specifier": "#/engines/connector-health.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/connector-health.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/access/tasks.access.ts",
      "line": 10,
      "specifier": "#/engines/connector-message.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/connector-message.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/access/tasks.access.ts",
      "line": 14,
      "specifier": "#/engines/reminder-delivery.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/reminder-delivery.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/access/tasks.access.ts",
      "line": 15,
      "specifier": "#/engines/task-action.engine",
      "source": "ResourceAccess",
      "targetPath": "src/engines/task-action.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/calendar-color.component.tsx",
      "line": 2,
      "specifier": "#/engines/calendar-color.engine",
      "source": "Client",
      "targetPath": "src/engines/calendar-color.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/calendar-dashboard.component.tsx",
      "line": 38,
      "specifier": "#/engines/calendar-entry.engine",
      "source": "Client",
      "targetPath": "src/engines/calendar-entry.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/calendar-dashboard.component.tsx",
      "line": 45,
      "specifier": "#/engines/turkey-time.engine",
      "source": "Client",
      "targetPath": "src/engines/turkey-time.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/device-enrollment.component.tsx",
      "line": 18,
      "specifier": "#/engines/device-enrollment.engine",
      "source": "Client",
      "targetPath": "src/engines/device-enrollment.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/device-enrollment.component.tsx",
      "line": 19,
      "specifier": "#/engines/turkey-time.engine",
      "source": "Client",
      "targetPath": "src/engines/turkey-time.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/easter-egg.component.tsx",
      "line": 12,
      "specifier": "#/engines/easter-egg.engine",
      "source": "Client",
      "targetPath": "src/engines/easter-egg.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/components/task-actions.component.tsx",
      "line": 12,
      "specifier": "#/engines/turkey-time.engine",
      "source": "Client",
      "targetPath": "src/engines/turkey-time.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/dashboard-access.manager.ts",
      "line": 1,
      "specifier": "#/components/dashboard-access.component",
      "source": "Manager",
      "targetPath": "src/components/dashboard-access.component.tsx",
      "target": "Client",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/engines/calendar-entry.engine.ts",
      "line": 1,
      "specifier": "./turkey-time.engine",
      "source": "Engine",
      "targetPath": "src/engines/turkey-time.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/engines/reminder-delivery.engine.ts",
      "line": 1,
      "specifier": "./turkey-time.engine",
      "source": "Engine",
      "targetPath": "src/engines/turkey-time.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/routes/index.tsx",
      "line": 9,
      "specifier": "#/access/tasks.access",
      "source": "Client",
      "targetPath": "src/access/tasks.access.ts",
      "target": "ResourceAccess",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/routes/index.tsx",
      "line": 31,
      "specifier": "#/engines/connector-health.engine",
      "source": "Client",
      "targetPath": "src/engines/connector-health.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/routes/index.tsx",
      "line": 37,
      "specifier": "#/engines/product-task-summary.engine",
      "source": "Client",
      "targetPath": "src/engines/product-task-summary.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    },
    {
      "sourcePath": "src/routes/index.tsx",
      "line": 42,
      "specifier": "#/engines/turkey-time.engine",
      "source": "Client",
      "targetPath": "src/engines/turkey-time.engine.ts",
      "target": "Engine",
      "result": "righting/role-dependency"
    }
  ]
}
```

## Approval request

Approve or revise the exact `righting.json`, the 21 observed inconsistencies as findings rather than exceptions, and the six setup actions above. No adapter activation is included.
