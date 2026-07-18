import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, relative, sep } from "node:path";

const { isMatch } = createRequire(import.meta.url)("micromatch") as {
  isMatch(path: string, patterns: string | readonly string[]): boolean;
};

export const roles = ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"] as const;
export type Role = (typeof roles)[number];

type Variation = "clientReadsAccess" | "pureEngines" | "contextFirewall";
type OverrideEffect = "allow" | "disallow";

type Mapping = {
  alias: string;
  path?: string;
  package?: string;
};

type RoleEdgeOverride = {
  name: string;
  from: Role;
  to: Role;
  effect: OverrideEffect;
  reason: string;
};

type Scope = {
  kind: "context" | "shared" | "unscoped";
  name?: string;
  path: string;
};

export type Policy = {
  preset: "volatility@1";
  aliases: Record<string, Role>;
  mappings: Mapping[];
  variations: ReadonlySet<Variation>;
  overrides: RoleEdgeOverride[];
  scopes: Scope[];
};

const defaultAllowedDependencies: Record<Role, Role[]> = {
  Client: ["Manager", "Utility"],
  Manager: ["Engine", "ResourceAccess", "Utility"],
  Engine: ["ResourceAccess", "Utility"],
  ResourceAccess: ["Resource", "Utility"],
  Resource: ["Utility"],
  Utility: ["Utility"],
};

const variations = new Set<Variation>(["clientReadsAccess", "pureEngines", "contextFirewall"]);
const mappingKeys = new Set(["alias", "path", "package"]);
const overrideKeys = new Set(["name", "from", "to", "effect", "reason"]);
const scopeKeys = new Set(["kind", "name", "path"]);
const policyKeys = new Set(["preset", "aliases", "mappings", "variations", "overrides", "scopes"]);

type JsonRecord = Record<string, unknown>;

function fail(message: string): never {
  throw new Error(`righting.json ${message}`);
}

function record(value: unknown, description: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`must define ${description}.`);
  }

  return value as JsonRecord;
}

function rejectUnknownKeys(value: JsonRecord, allowed: ReadonlySet<string>, description: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      fail(`${description} contains unsupported property "${key}".`);
    }
  }
}

function nonEmptyString(value: unknown, description: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${description} must be a non-empty string.`);
  }

  return value;
}

function optionalString(value: unknown, description: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return nonEmptyString(value, description);
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

function validatePath(path: string, description: string): void {
  if (isAbsolute(path) || path.startsWith("./") || path.startsWith("../") || path.includes("\\")) {
    fail(`${description} must be a relative forward-slash glob.`);
  }
}

function validatePackage(packageName: string): void {
  if (packageName.startsWith(".") || packageName.startsWith("/") || packageName.startsWith("node:")) {
    fail("mapping package must name an external package.");
  }
}

function projectFiles(projectDirectory: string): string[] {
  const files: string[] = [];
  const ignoredDirectories = new Set([".git", "node_modules"]);

  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) {
          visit(entryPath);
        }
      } else if (entry.isFile()) {
        files.push(relative(projectDirectory, entryPath).split(sep).join("/"));
      }
    }
  }

  visit(projectDirectory);
  return files;
}

function rejectAmbiguousPathMatches(
  projectDirectory: string,
  entries: ReadonlyArray<{ name: string; path: string }>,
  description: string,
): void {
  for (const file of projectFiles(projectDirectory)) {
    const matches = entries.filter((entry) => isMatch(file, entry.path));
    if (matches.length > 1) {
      fail(`${description} maps "${file}" ambiguously to ${matches.map(({ name }) => `"${name}"`).join(", ")}.`);
    }
  }
}

function parseAliases(value: unknown): Record<string, Role> {
  const aliasesRecord = record(value, "aliases");
  const aliases: Record<string, Role> = {};

  for (const [alias, role] of Object.entries(aliasesRecord)) {
    if (alias.trim() === "") {
      fail("aliases cannot contain an empty alias.");
    }
    if (!isRole(role)) {
      fail(`alias "${alias}" must map to a canonical role.`);
    }
    aliases[alias] = role;
  }

  if (Object.keys(aliases).length === 0) {
    fail("must define at least one alias.");
  }

  return aliases;
}

function parseMappings(value: unknown, aliases: Record<string, Role>): Mapping[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail("must define at least one mapping.");
  }

  const mappings: Mapping[] = [];
  const packageAliases = new Map<string, string>();

  for (const [index, candidate] of value.entries()) {
    const mapping = record(candidate, `mapping ${index}`);
    rejectUnknownKeys(mapping, mappingKeys, `mapping ${index}`);

    const alias = nonEmptyString(mapping.alias, `mapping ${index} alias`);
    const role = aliases[alias];
    if (role === undefined) {
      fail(`mapping ${index} references unknown alias "${alias}".`);
    }

    const path = optionalString(mapping.path, `mapping ${index} path`);
    const packageName = optionalString(mapping.package, `mapping ${index} package`);
    if (path === undefined && packageName === undefined) {
      fail(`mapping ${index} must define a path or package.`);
    }
    if (path !== undefined) {
      validatePath(path, `mapping ${index} path`);
    }
    if (packageName !== undefined) {
      validatePackage(packageName);
      if (role !== "Resource" && role !== "Utility") {
        fail(`mapping ${index} can protect only a Resource or Utility package.`);
      }
      const existingAlias = packageAliases.get(packageName);
      if (existingAlias !== undefined) {
        fail(`package "${packageName}" is mapped ambiguously to "${existingAlias}" and "${alias}".`);
      }
      packageAliases.set(packageName, alias);
    }

    mappings.push({ alias, path, package: packageName });
  }

  for (const alias of Object.keys(aliases)) {
    if (!mappings.some((mapping) => mapping.alias === alias)) {
      fail(`alias "${alias}" has no explicit mapping.`);
    }
  }

  if (!mappings.some((mapping) => mapping.path !== undefined)) {
    fail("must map at least one local path.");
  }

  return mappings;
}

function parseVariations(value: unknown): ReadonlySet<Variation> {
  if (value === undefined) {
    return new Set();
  }
  if (!Array.isArray(value)) {
    fail("variations must be an array of named opt-ins.");
  }

  const configured = new Set<Variation>();
  for (const variation of value) {
    if (typeof variation !== "string" || !variations.has(variation as Variation)) {
      fail("variations contains an unsupported opt-in.");
    }
    if (configured.has(variation as Variation)) {
      fail(`variations repeats "${variation}".`);
    }
    configured.add(variation as Variation);
  }

  return configured;
}

function parseOverrides(value: unknown): RoleEdgeOverride[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    fail("overrides must be an array.");
  }

  const names = new Set<string>();
  const edges = new Set<string>();
  return value.map((candidate, index) => {
    const override = record(candidate, `override ${index}`);
    rejectUnknownKeys(override, overrideKeys, `override ${index}`);

    const name = nonEmptyString(override.name, `override ${index} name`);
    const from = override.from;
    const to = override.to;
    const effect = override.effect;
    const reason = nonEmptyString(override.reason, `override ${index} reason`);
    if (!isRole(from) || !isRole(to)) {
      fail(`override ${index} must use canonical roles.`);
    }
    if (effect !== "allow" && effect !== "disallow") {
      fail(`override ${index} effect must be "allow" or "disallow".`);
    }
    if (names.has(name)) {
      fail(`overrides repeat the name "${name}".`);
    }
    const edge = `${from}:${to}`;
    if (edges.has(edge)) {
      fail(`overrides repeat the ${edge} edge.`);
    }
    names.add(name);
    edges.add(edge);
    return { name, from, to, effect, reason };
  });
}

function parseScopes(value: unknown): Scope[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value) || value.length === 0) {
    fail("scopes must be a non-empty array.");
  }

  const contextNames = new Set<string>();
  return value.map((candidate, index) => {
    const scope = record(candidate, `scope ${index}`);
    rejectUnknownKeys(scope, scopeKeys, `scope ${index}`);

    const kind = scope.kind;
    const path = nonEmptyString(scope.path, `scope ${index} path`);
    validatePath(path, `scope ${index} path`);
    if (kind === "context") {
      const name = nonEmptyString(scope.name, `scope ${index} name`);
      if (contextNames.has(name)) {
        fail(`scopes repeat context "${name}".`);
      }
      contextNames.add(name);
      return { kind, name, path };
    }
    if (kind === "shared" || kind === "unscoped") {
      if (scope.name !== undefined) {
        fail(`${kind} scope ${index} cannot have a name.`);
      }
      return { kind, path };
    }
    fail(`scope ${index} kind must be "context", "shared", or "unscoped".`);
  });
}

export function allowedDependencies(policy: Policy): Record<Role, Role[]> {
  const allowed = Object.fromEntries(
    roles.map((role) => [role, [...defaultAllowedDependencies[role]]]),
  ) as Record<Role, Role[]>;

  if (policy.variations.has("clientReadsAccess")) {
    allowed.Client.push("ResourceAccess");
  }
  if (policy.variations.has("pureEngines")) {
    allowed.Engine = allowed.Engine.filter((role) => role !== "ResourceAccess");
  }

  for (const override of policy.overrides) {
    const currentlyAllowed = allowed[override.from].includes(override.to);
    if ((override.effect === "allow") === currentlyAllowed) {
      fail(`override "${override.name}" does not change the ${override.from}:${override.to} edge.`);
    }
    if (override.effect === "allow") {
      allowed[override.from].push(override.to);
    } else {
      allowed[override.from] = allowed[override.from].filter((role) => role !== override.to);
    }
  }

  return allowed;
}

function parsePolicy(source: unknown, policyPath: string): Policy {
  const policy = record(source, "a policy object");
  if (policy.status === "incomplete") {
    fail("is incomplete; supply approved aliases and mappings before enabling enforcement.");
  }
  rejectUnknownKeys(policy, policyKeys, "policy");
  if (policy.preset !== "volatility@1") {
    fail("must select the volatility@1 preset.");
  }

  const aliases = parseAliases(policy.aliases);
  const mappings = parseMappings(policy.mappings, aliases);
  const configuredVariations = parseVariations(policy.variations);
  const overrides = parseOverrides(policy.overrides);
  const scopes = parseScopes(policy.scopes);
  if (scopes.length > 0 && !configuredVariations.has("contextFirewall")) {
    fail("scopes require the contextFirewall variation.");
  }
  if (configuredVariations.has("contextFirewall")) {
    for (const kind of ["context", "shared", "unscoped"] as const) {
      if (!scopes.some((scope) => scope.kind === kind)) {
        fail(`contextFirewall requires at least one ${kind} scope.`);
      }
    }
  }

  const projectDirectory = dirname(policyPath);
  rejectAmbiguousPathMatches(
    projectDirectory,
    mappings.flatMap((mapping) => (mapping.path === undefined ? [] : [{ name: mapping.alias, path: mapping.path }])),
    "policy",
  );
  rejectAmbiguousPathMatches(
    projectDirectory,
    scopes.map((scope) => ({ name: scope.name ?? scope.kind, path: scope.path })),
    "scope policy",
  );

  const result: Policy = {
    preset: "volatility@1",
    aliases,
    mappings,
    variations: configuredVariations,
    overrides,
    scopes,
  };
  allowedDependencies(result);
  return result;
}

function mappingIdentity(mapping: Mapping): string {
  return JSON.stringify(mapping);
}

function overrideIdentity(override: RoleEdgeOverride): string {
  return JSON.stringify(override);
}

function scopeIdentity(scope: Scope): string {
  return JSON.stringify(scope);
}

function preservesAll<T>(baseline: readonly T[], current: readonly T[], identity: (item: T) => string): boolean {
  const currentEntries = new Set(current.map(identity));
  return baseline.every((item) => currentEntries.has(identity(item)));
}

// A migration can add enforcement, but cannot use a policy edit to loosen or replace it.
export function isPolicyExpansion(baseline: Policy, current: Policy): boolean {
  if (Object.entries(baseline.aliases).some(([alias, role]) => current.aliases[alias] !== role)) {
    return false;
  }
  if (!preservesAll(baseline.mappings, current.mappings, mappingIdentity)) {
    return false;
  }
  if (!preservesAll(baseline.scopes, current.scopes, scopeIdentity)) {
    return false;
  }
  if (!preservesAll(baseline.overrides, current.overrides, overrideIdentity)) {
    return false;
  }
  if ([...baseline.variations].some((variation) => !current.variations.has(variation))) {
    return false;
  }

  const addedVariations = [...current.variations].filter((variation) => !baseline.variations.has(variation));
  const addedOverrides = current.overrides.filter(
    (override) => !baseline.overrides.some((baselineOverride) => overrideIdentity(baselineOverride) === overrideIdentity(override)),
  );
  if (addedVariations.includes("clientReadsAccess") || addedOverrides.some((override) => override.effect === "allow")) {
    return false;
  }

  return (
    current.mappings.length > baseline.mappings.length ||
    current.scopes.length > baseline.scopes.length ||
    addedVariations.length > 0 ||
    addedOverrides.length > 0
  );
}

export function readPolicySource(source: string, policyPath: string): Policy {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`righting.json could not be read: ${message}`);
  }

  return parsePolicy(parsed, policyPath);
}

export function readPolicy(policyPath: string): Policy {
  let source: string;
  try {
    source = readFileSync(policyPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`righting.json could not be read: ${message}`);
  }

  return readPolicySource(source, policyPath);
}
