import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import boundaries from "eslint-plugin-boundaries";

type Role = "Client" | "Manager";

type Policy = {
  preset: "volatility@1";
  aliases: Record<string, Role>;
  mappings: Array<{ alias: string; path: string }>;
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
  const aliasesByRole = Object.entries(policy.aliases).reduce<Record<Role, string[]>>(
    (aliases, [alias, role]) => ({ ...aliases, [role]: [...aliases[role], alias] }),
    { Client: [], Manager: [] },
  );

  return {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": policy.mappings.map(({ alias, path }) => ({ type: alias, pattern: path })),
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message: "righting/role-dependency: {{from.element.types}} cannot depend on {{to.element.types}}.",
          policies: [
            {
              from: { element: { types: aliasesByRole.Client } },
              allow: { to: { element: { types: aliasesByRole.Manager } } },
            },
          ],
        },
      ],
    },
  };
}
