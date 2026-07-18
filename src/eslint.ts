import { resolve } from "node:path";
import boundaries from "eslint-plugin-boundaries";
import { allowedDependencies, readPolicy, roles, type Role } from "./policy.js";

const externalOrigins = ["external", "core"];

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

export function eslintConfig(policyPath = resolve(process.cwd(), "righting.json")) {
  const policy = readPolicy(policyPath);
  const aliasesByRole = emptyRoleMap();

  for (const [alias, role] of Object.entries(policy.aliases)) {
    aliasesByRole[role].push(alias);
  }

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

  return {
    files: policy.mappings.flatMap((mapping) => (mapping.path === undefined ? [] : [mapping.path])),
    plugins: { boundaries },
    settings: {
      "boundaries/elements": policy.mappings.flatMap((mapping) =>
        mapping.path === undefined ? [] : [{ type: mapping.alias, pattern: mapping.path }],
      ),
      "boundaries/dependency-nodes": ["import", "export", "require", "dynamic-import"],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          checkAllOrigins: true,
          checkInternals: true,
          checkUnknownLocals: true,
          default: "disallow",
          message: "righting/role-dependency: {{from.element.types}} cannot depend on {{to.element.types}}.",
          policies: [
            ...roles.map((from) => ({
              from: { element: { types: aliasesByRole[from] } },
              allow: { to: { element: { types: allowed[from].flatMap((to) => aliasesByRole[to]) } } },
            })),
            { allow: { to: { module: { origin: externalOrigins } } } },
            ...roles.flatMap((from) => {
              const packages = protectedPackages(from);
              return packages.length === 0
                ? []
                : [
                    {
                      from: { element: { types: aliasesByRole[from] } },
                      disallow: { to: { module: { origin: externalOrigins, source: packages } } },
                    },
                  ];
            }),
            ...roles.map((from) => ({
              from: { element: { types: aliasesByRole[from] } },
              disallow: { to: { element: { isUnknown: true }, module: { origin: "local" } } },
              message: "righting/unresolved-local-import: Local dependencies must match an explicit policy mapping.",
            })),
          ],
        },
      ],
    },
  };
}
