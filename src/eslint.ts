import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import boundaries from "eslint-plugin-boundaries";

const roles = ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"] as const;
type Role = (typeof roles)[number];

type Policy = {
  preset: "volatility@1";
  aliases: Record<string, Role>;
  mappings: Array<{ alias: string; path: string }>;
};

const allowedDependencies: Record<Role, Role[]> = {
  Client: ["Manager", "Utility"],
  Manager: ["Engine", "ResourceAccess", "Utility"],
  Engine: ["ResourceAccess", "Utility"],
  ResourceAccess: ["Resource", "Utility"],
  Resource: ["Utility"],
  Utility: ["Utility"],
};

function readPolicy(policyPath: string): Policy {
  const policy: unknown = JSON.parse(readFileSync(policyPath, "utf8"));
  if (
    typeof policy !== "object" ||
    policy === null ||
    !("preset" in policy) ||
    policy.preset !== "volatility@1" ||
    !("aliases" in policy) ||
    typeof policy.aliases !== "object" ||
    policy.aliases === null ||
    !("mappings" in policy) ||
    !Array.isArray(policy.mappings)
  ) {
    throw new Error("righting.json must define a volatility@1 policy with aliases and mappings.");
  }

  return policy as Policy;
}

export function eslintConfig(policyPath = resolve(process.cwd(), "righting.json")) {
  const policy = readPolicy(policyPath);
  const aliasesByRole: Record<Role, string[]> = {
    Client: [],
    Manager: [],
    Engine: [],
    ResourceAccess: [],
    Resource: [],
    Utility: [],
  };

  for (const [alias, role] of Object.entries(policy.aliases)) {
    aliasesByRole[role].push(alias);
  }

  return {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": policy.mappings.map(({ alias, path }) => ({ type: alias, pattern: path })),
      "boundaries/dependency-nodes": ["import", "export", "require", "dynamic-import"],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          checkInternals: true,
          default: "disallow",
          message: "righting/role-dependency: {{from.element.types}} cannot depend on {{to.element.types}}.",
          policies: roles.map((from) => ({
            from: { element: { types: aliasesByRole[from] } },
            allow: {
              to: {
                element: {
                  types: allowedDependencies[from].flatMap((to) => aliasesByRole[to]),
                },
              },
            },
          })),
        },
      ],
    },
  };
}
