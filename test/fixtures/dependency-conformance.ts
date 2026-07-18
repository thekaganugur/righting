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

export const forbiddenDependencyForms = [
  "src/manager/forbidden.js",
  "src/manager/reexport-client.js",
  "src/manager/require-client.cjs",
  "src/manager/dynamic-client.js",
  "src/manager/type-client.mts",
];
