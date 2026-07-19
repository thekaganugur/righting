import { resolve } from "node:path";
import boundaries from "eslint-plugin-boundaries";
import { allowedDependencies, readPolicy, roles, type Role } from "./policy.js";

const externalOrigins = ["external", "core"];
export const roleDependencyRule = "righting/role-dependency";

export type LegacyDebt = Record<string, Record<string, number>>;

type JsonRecord = Record<string, unknown>;

function record(value: unknown, description: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${description} must be a JSON object.`);
  }

  return value as JsonRecord;
}

// This is also the rule ID ESLint stores in eslint-suppressions.json.
export function normalizeEslintSuppressions(value: unknown): LegacyDebt {
  const suppressions = record(value, "eslint-suppressions.json");
  const debt: LegacyDebt = {};

  for (const [file, valueByRule] of Object.entries(suppressions)) {
    const rules = record(valueByRule, `eslint-suppressions.json entry "${file}"`);
    const suppression = rules[roleDependencyRule];
    if (suppression === undefined) {
      continue;
    }

    const count = record(suppression, `eslint-suppressions.json ${file} ${roleDependencyRule}`).count;
    if (typeof count !== "number" || !Number.isInteger(count) || count < 1) {
      throw new Error(`eslint-suppressions.json ${file} ${roleDependencyRule} count must be a positive integer.`);
    }
    debt[file] = { [roleDependencyRule]: count };
  }

  return debt;
}

function emptyRoleMap(): Record<Role, string[]> {
  return {
    Client: [],
    Manager: [],
    Engine: [],
    ResourceAccess: [],
    Resource: [],
    Utility: [],
  };
}

function roleElementType(role: Role): string {
  return `righting-role-${role}`;
}

function scopeElementType(index: number): string {
  return `righting-scope-${index}`;
}

export function eslintConfig(policyPath = resolve(process.cwd(), "righting.json")) {
  const policy = readPolicy(policyPath);
  const packagesByRole = emptyRoleMap();
  for (const mapping of policy.mappings) {
    const role = policy.aliases[mapping.alias];
    if (mapping.package !== undefined && role !== undefined) {
      packagesByRole[role].push(mapping.package);
    }
  }

  const allowed = allowedDependencies(policy);
  const protectedPackages = (role: Role) =>
    roles.filter((target) => !allowed[role].includes(target)).flatMap((target) => packagesByRole[target]);
  const contexts = policy.scopes.flatMap((scope, index) =>
    scope.kind === "context" ? [{ index, name: scope.name }] : [],
  );
  const sharedScopeIndexes = policy.scopes.flatMap((scope, index) => (scope.kind === "shared" ? [index] : []));
  const unscopedScopeIndexes = policy.scopes.flatMap((scope, index) => (scope.kind === "unscoped" ? [index] : []));

  return {
    files: [
      ...policy.mappings.flatMap((mapping) => (mapping.path === undefined ? [] : [mapping.path])),
      ...policy.scopes.map((scope) => scope.path),
    ],
    plugins: {
      boundaries,
      righting: {
        rules: {
          "role-dependency": (boundaries as unknown as { rules: { dependencies: unknown } }).rules.dependencies,
        },
      },
    },
    settings: {
      "boundaries/elements": [
        ...policy.mappings.flatMap((mapping) => {
          const role = policy.aliases[mapping.alias];
          return mapping.path === undefined || role === undefined
            ? []
            : [{ type: roleElementType(role), pattern: mapping.path }];
        }),
        ...policy.scopes.map((scope, index) => ({ type: scopeElementType(index), pattern: scope.path })),
      ],
      "boundaries/elements-single-type": false,
      "boundaries/dependency-nodes": ["import", "export", "require", "dynamic-import"],
    },
    rules: {
      [roleDependencyRule]: [
        "error",
        {
          checkAllOrigins: true,
          checkInternals: true,
          checkUnknownLocals: true,
          default: "disallow",
          message: "righting/role-dependency: {{from.element.types}} cannot depend on {{to.element.types}}.",
          policies: [
            ...roles.map((from) => ({
              from: { element: { types: { allOf: [roleElementType(from)] } } },
              allow: {
                to: { element: { types: { anyOf: allowed[from].map((to) => roleElementType(to)) } } },
              },
            })),
            { allow: { to: { module: { origin: externalOrigins } } } },
            ...roles.flatMap((from) => {
              const packages = protectedPackages(from);
              return packages.length === 0
                ? []
                : [
                    {
                      from: { element: { types: { allOf: [roleElementType(from)] } } },
                      disallow: { to: { module: { origin: externalOrigins, source: packages } } },
                    },
                  ];
            }),
            ...contexts.flatMap((from) =>
              contexts
                .filter((to) => to.index !== from.index)
                .map((to) => ({
                  from: { element: { types: { allOf: [scopeElementType(from.index)] } } },
                  disallow: { to: { element: { types: { allOf: [scopeElementType(to.index)] } } } },
                  message: `righting/cross-context-dependency: Context "${from.name}" cannot depend on context "${to.name}".`,
                })),
            ),
            ...sharedScopeIndexes.map((index) => ({
              from: { element: { types: { allOf: [scopeElementType(index)] } } },
              disallow: {
                to: { element: { types: { anyOf: contexts.map((context) => scopeElementType(context.index)) } } },
              },
              message: "righting/shared-to-context-dependency: Shared code cannot depend on contextual code.",
            })),
            ...unscopedScopeIndexes.map((index) => ({
              from: { element: { types: { allOf: [scopeElementType(index)] } } },
              allow: {
                to: { element: { types: { anyOf: contexts.map((context) => scopeElementType(context.index)) } } },
              },
            })),
            ...contexts.map((context) => ({
              from: {
                element: { types: { allOf: [roleElementType("Client"), scopeElementType(context.index)] } },
              },
              allow: {
                to: {
                  element: { types: { allOf: [roleElementType("Client"), scopeElementType(context.index)] } },
                },
              },
            })),
            ...contexts.flatMap((context) =>
              sharedScopeIndexes.map((index) => ({
                from: {
                  element: { types: { allOf: [roleElementType("Client"), scopeElementType(context.index)] } },
                },
                allow: { to: { element: { types: { allOf: [roleElementType("Client"), scopeElementType(index)] } } } },
              })),
            ),
            ...roles.flatMap((from) => [
              {
                from: { element: { types: { allOf: [roleElementType(from)] } } },
                disallow: { to: { element: { isUnknown: true }, module: { origin: "local" } } },
                message: "righting/unresolved-local-import: Local dependencies must match an explicit policy mapping.",
              },
              {
                from: { element: { types: { allOf: [roleElementType(from)] } } },
                disallow: {
                  to: {
                    element: { types: { noneOf: roles.map(roleElementType) } },
                    module: { origin: "local" },
                  },
                },
                message: "righting/unresolved-local-import: Local dependencies must match an explicit policy mapping.",
              },
            ]),
          ],
        },
      ],
    },
  };
}
