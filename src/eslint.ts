import { relative, resolve, sep } from "node:path";
import boundaries from "eslint-plugin-boundaries";
import { loadAdapterContract } from "./adapter-contract.js";
import { classifySource, type NormalizedContract, type Role } from "./contract.js";
const externalOrigins = ["external", "core"];
const testElementType = "righting-treatment-test";
const generatedElementType = "righting-treatment-generated";
const compositionRootElementType = "righting-composition-root";
export const roleDependencyRule = "righting/role-dependency";
export const sourceClassificationRule = "righting/source-classification";

function emptyRoleMap(roles: readonly Role[]): Record<Role, string[]> {
  const result = {} as Record<Role, string[]>;
  for (const role of roles) result[role] = [];
  return result;
}

function roleElementType(role: Role): string {
  return `righting-role-${role}`;
}

function filenameDescriptor(type: string, marker: string) {
  return { type, pattern: `*${marker}*`, mode: "file" };
}

function exactFilenameDescriptor(type: string, token: string) {
  return { type, pattern: `${token}.*`, mode: "file" };
}

function directoryDescriptor(type: string, segment: string) {
  return { type, pattern: `**/${segment}/**`, partialMatch: false };
}

function classificationRule(contract: NormalizedContract, projectDirectory: string) {
  return {
    meta: {
      type: "problem",
      schema: [],
      messages: { violation: "{{message}}" },
    },
    create(context: { filename: string; report(input: { node: unknown; messageId: string; data: { message: string } }): void }) {
      return {
        Program(node: unknown) {
          const path = relative(projectDirectory, context.filename).split(sep).join("/");
          const classification = classifySource(contract, path);
          if (classification.kind === "violation") {
            const detail =
              classification.ruleId === "righting/ambiguous-source"
                ? ` matches multiple canonical roles: ${classification.roles.join(", ")}.`
                : " does not match a canonical role or explicit source treatment.";
            context.report({
              node,
              messageId: "violation",
              data: { message: `${classification.ruleId}: This covered source${detail}` },
            });
          }
        },
      };
    },
  };
}

export function eslintConfig() {
  const projectDirectory = resolve(process.cwd());
  const contract = loadAdapterContract(projectDirectory);
  const roles = contract.roles;
  const packagesByRole = emptyRoleMap(roles);
  for (const dependency of contract.configured.protectedDependencies) {
    packagesByRole[dependency.role].push(dependency.package);
  }
  const allowed = contract.effective.allowedDependencies;
  const protectedPackages = (role: Role) =>
    roles.filter((target) => !allowed[role].includes(target)).flatMap((target) => packagesByRole[target]);
  const productionRole = (role: Role) => ({ allOf: [roleElementType(role)], noneOf: [testElementType] });

  return {
    files: contract.configured.coverage,
    plugins: {
      boundaries,
      righting: {
        rules: {
          "role-dependency": (boundaries as unknown as { rules: { dependencies: unknown } }).rules.dependencies,
          "source-classification": classificationRule(contract, projectDirectory),
        },
      },
    },
    settings: {
      "boundaries/include": contract.configured.coverage,
      "boundaries/elements": [
        ...roles.flatMap((role) => {
          const conventions = contract.effective.conventions.roles[role];
          return [
            ...conventions.filenameSuffixes.map((marker) => filenameDescriptor(roleElementType(role), marker)),
            ...conventions.directorySegments.map((segment) => directoryDescriptor(roleElementType(role), segment)),
          ];
        }),
        ...contract.effective.conventions.tests.filenameMarkers.map((marker) => filenameDescriptor(testElementType, marker)),
        ...contract.effective.conventions.tests.directorySegments.map((segment) => directoryDescriptor(testElementType, segment)),
        ...contract.effective.conventions.generated.filenameMarkers.map((marker) => filenameDescriptor(generatedElementType, marker)),
        ...contract.effective.conventions.generated.directorySegments.map((segment) =>
          directoryDescriptor(generatedElementType, segment),
        ),
        ...contract.effective.conventions.compositionRoots.map((token) =>
          exactFilenameDescriptor(compositionRootElementType, token),
        ),
      ],
      "boundaries/elements-single-match": false,
      "boundaries/dependency-nodes": ["import", "export", "require", "dynamic-import"],
    },
    rules: {
      [sourceClassificationRule]: "error",
      [roleDependencyRule]: [
        "error",
        {
          checkAllOrigins: true,
          checkInternals: true,
          checkUnknownLocals: true,
          default: "disallow",
          message: "righting/role-dependency: This dependency is forbidden by the declared policy.",
          policies: [
            ...roles.flatMap((from) =>
              roles.map((to) => ({
                from: { element: { types: productionRole(from) } },
                ...(allowed[from].includes(to)
                  ? { allow: { to: { element: { types: { allOf: [roleElementType(to)], noneOf: [testElementType] } } } } }
                  : {
                      disallow: { to: { element: { types: { allOf: [roleElementType(to)] } } } },
                      message: `righting/role-dependency: ${from} cannot depend on ${to}.`,
                    }),
              })),
            ),
            {
              from: { element: { types: { noneOf: [testElementType] } } },
              disallow: { to: { element: { types: { allOf: [testElementType] } } } },
              message: "righting/test-dependency: Governed production source cannot depend on test source.",
            },
            {
              from: { element: { types: { allOf: [testElementType] } } },
              allow: { to: { module: { origin: ["local", ...externalOrigins] } } },
            },
            {
              from: { element: { types: { allOf: [compositionRootElementType] } } },
              allow: { to: { element: { types: { anyOf: roles.map(roleElementType) } } } },
            },
            {
              from: { element: { types: { allOf: [compositionRootElementType] } } },
              allow: { to: { module: { origin: externalOrigins } } },
            },
            ...roles.map((from) => {
              const forbidden = protectedPackages(from);
              return {
                from: { element: { types: productionRole(from) } },
                allow: {
                  to: {
                    module: {
                      origin: externalOrigins,
                      source: forbidden.length === 0 ? "**" : `!(${forbidden.join("|")})`,
                    },
                  },
                },
              };
            }),
            ...roles.map((from) => ({
              from: { element: { types: productionRole(from) } },
              disallow: { to: { element: { isUnknown: true }, module: { origin: "local" } } },
              message: "righting/unresolved-local-import: Covered role source cannot depend on unclassified local source.",
            })),
          ],
        },
      ],
    },
  };
}
