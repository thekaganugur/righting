// Internal registrations for the adapter-neutral scenario families documented in docs/adapter-conformance.md.
export const conformanceScenarioFamilyIds = {
  defaultRoleEdges: "default-role-edges",
  staticDependencyForms: "static-dependency-forms",
  canonicalAndAliasClassification: "canonical-and-alias-classification",
  policyVariationsAndProtectedDependencies: "policy-variations-and-protected-dependencies",
  declaredCoverage: "declared-coverage",
  sourceClassificationViolations: "source-classification-violations",
  testSourceTreatment: "test-source-treatment",
  generatedSourceAndCompositionRoots: "generated-source-and-composition-roots",
} as const;
export type ConformanceScenarioFamilyId = (typeof conformanceScenarioFamilyIds)[keyof typeof conformanceScenarioFamilyIds];

export const roles = ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"] as const;
export type Role = (typeof roles)[number];
export type RoleEdge = `${Role}:${Role}`;

export const roleDirectories: Record<Role, string> = {
  Client: "client",
  Manager: "manager",
  Engine: "engine",
  ResourceAccess: "resource-access",
  Resource: "resource",
  Utility: "utility",
};

export const allowedRoleEdges = new Set<RoleEdge>([
  "Client:Manager",
  "Client:Utility",
  "Manager:Engine",
  "Manager:ResourceAccess",
  "Manager:Utility",
  "Engine:ResourceAccess",
  "Engine:Utility",
  "ResourceAccess:Resource",
  "ResourceAccess:Utility",
  "Resource:Utility",
  "Utility:Utility",
]);

// Adapter-neutral source cases future adapters must execute against test/fixtures/dependency-conformance.
export const dependencyForms = [
  { allowed: "src/client/client.js", forbidden: "src/manager/forbidden.js" },
  { allowed: "src/client/reexport-manager.js", forbidden: "src/manager/reexport-client.js" },
  { allowed: "src/client/reexport-all-manager.js", forbidden: "src/manager/reexport-all-client.js" },
  { allowed: "src/client/require-manager.cjs", forbidden: "src/manager/require-client.cjs" },
  { allowed: "src/client/dynamic-manager.js", forbidden: "src/manager/dynamic-client.js" },
  { allowed: "src/client/type-manager.mts", forbidden: "src/manager/type-client.mts" },
  { allowed: "src/client/extension-manager.js", forbidden: "src/manager/extension-client.js" },
  { allowed: "src/client/index-manager.js", forbidden: "src/manager/index-client.js" },
];
