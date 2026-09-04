import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { ResolverFactory, type ResolveResult } from "oxc-resolver";
import { loadNormalizedContract } from "./adapter-inspection.js";
import type { NormalizedContract } from "./policy.js";

const packageRequire = createRequire(import.meta.url);
const { isMatch } = packageRequire("micromatch") as {
  isMatch(path: string, patterns: readonly string[]): boolean;
};

const supportedOxlintVersion = "1.75.0";
const roles = ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"] as const;
const recognizedCapabilities = new Set([
  "role-dependency",
  "manager-interaction",
  "protected-dependency",
  "design-judgment",
]);
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs", ".json"];
type Role = (typeof roles)[number];
type RuleId =
  | "righting/role-dependency"
  | "righting/unresolved-local-import"
  | "righting/unclassified-source"
  | "righting/ambiguous-source"
  | "righting/test-dependency";
type Convention = { filenameMarkers?: string[]; directorySegments?: string[] };
type Classification =
  | { kind: "outside" }
  | { kind: "ambiguous"; roles: Role[] }
  | { kind: "role"; role: Role; test: boolean }
  | { kind: "composition-root"; test: boolean }
  | { kind: "test" }
  | { kind: "unclassified" };
type Resolution =
  | { kind: "local"; path: string }
  | { kind: "external"; packageName?: string }
  | { kind: "builtin" }
  | { kind: "unresolved"; reason: string };
type DependencyAnalysis =
  | Exclude<Resolution, { kind: "local" }>
  | { kind: "local"; path: string; classification: Classification };
type DependencyKind = "import" | "require";
type SourceNode = { value?: unknown };
type Node = { source?: SourceNode; arguments?: SourceNode[]; callee?: { type?: string; name?: string } };
type ScopeVariable = { name?: string; defs?: unknown[] };
type Scope = { set?: Map<string, ScopeVariable>; variables?: ScopeVariable[]; upper?: Scope | null };
type SourceCode = { getScope?(node: unknown): Scope };
type RuleContext = {
  filename: string;
  sourceCode?: SourceCode;
  languageOptions: { parser: { name: string; version: string } };
  report(input: { node: unknown; message: string }): void;
};
type AdapterState = {
  projectDirectory: string;
  stamp: string;
  contract: NormalizedContract;
  importResolver: ResolverFactory;
  requireResolver: ResolverFactory;
  packageNames: Map<string, string | undefined>;
};

const states = new Map<string, AdapterState>();
const stateFailures = new Map<string, { stamp: string; error: unknown }>();
const analyses = new WeakMap<object, Map<string, DependencyAnalysis>>();
const preparedRoots = new WeakMap<object, Set<string>>();

function fail(message: string): never {
  throw new Error(`Righting Oxlint adapter: ${message}`);
}

function verifyOxlintVersion(context: RuleContext): void {
  const { name, version } = context.languageOptions.parser;
  if (name !== "oxlint" || version !== supportedOxlintVersion) {
    fail(`unsupported Oxlint version ${version}; expected ${supportedOxlintVersion}.`);
  }
}

function absoluteFilename(filename: string): string {
  return isAbsolute(filename) ? filename : resolve(process.cwd(), filename);
}

function searchProjectDirectory(start: string): string | undefined {
  let directory = start;
  while (true) {
    if (existsSync(resolve(directory, "righting.json"))) return realpathSync(directory);
    const parent = dirname(directory);
    if (parent === directory) return undefined;
    directory = parent;
  }
}

function findProjectDirectory(filename: string): string {
  const projectDirectory = searchProjectDirectory(dirname(absoluteFilename(filename)));
  if (projectDirectory === undefined) fail(`could not find righting.json for ${filename}.`);
  return projectDirectory;
}

function stateStamp(projectDirectory: string): string {
  return ["righting.json", "package.json", "tsconfig.json", "jsconfig.json"]
    .map((name) => {
      const path = resolve(projectDirectory, name);
      if (!existsSync(path)) return `${name}:missing`;
      const { ctimeMs, ino, mtimeMs, size } = statSync(path);
      return `${name}:${ino}:${ctimeMs}:${mtimeMs}:${size}`;
    })
    .join("|");
}

function createResolver(conditionNames: string[], mainFields: string[]): ResolverFactory {
  return new ResolverFactory({
    builtinModules: true,
    conditionNames,
    extensions,
    mainFields,
    tsconfig: "auto",
  });
}

function createState(projectDirectory: string, stamp: string): AdapterState {
  const contract = loadNormalizedContract(projectDirectory);
  const unsupported = contract.effective.capabilities.filter(
    (capability) => capability.applies && !recognizedCapabilities.has(capability.id),
  );
  if (unsupported.length > 0) {
    fail(`contract requires unsupported capabilities: ${unsupported.map(({ id }) => id).join(", ")}.`);
  }
  return {
    projectDirectory,
    stamp,
    contract,
    importResolver: createResolver(["node", "import", "default"], ["module", "main"]),
    requireResolver: createResolver(["node", "require", "default"], ["main", "module"]),
    packageNames: new Map(),
  };
}

function stateForProject(projectDirectory: string): AdapterState {
  const stamp = stateStamp(projectDirectory);
  const cached = states.get(projectDirectory);
  if (cached !== undefined && cached.stamp === stamp) return cached;
  const failed = stateFailures.get(projectDirectory);
  if (failed !== undefined && failed.stamp === stamp) throw failed.error;
  try {
    const state = createState(projectDirectory, stamp);
    states.set(projectDirectory, state);
    stateFailures.delete(projectDirectory);
    return state;
  } catch (error) {
    stateFailures.set(projectDirectory, { stamp, error });
    throw error;
  }
}

function stateFor(context: RuleContext): AdapterState {
  return stateForProject(findProjectDirectory(context.filename));
}

function projectPath(state: AdapterState, path: string): string {
  return relative(state.projectDirectory, path).split(sep).join("/");
}

function hasConvention(path: string, convention: Convention): boolean {
  const parts = path.split("/");
  const filename = parts.at(-1) ?? path;
  const directories = parts.slice(0, -1);
  return (
    convention.filenameMarkers?.some((marker) => filename.includes(marker)) === true ||
    convention.directorySegments?.some((segment) => directories.includes(segment)) === true
  );
}

function classify(state: AdapterState, path: string): Classification {
  const { contract } = state;
  const conventions = contract.effective.conventions;
  if (!isMatch(path, contract.configured.coverage)) return { kind: "outside" };
  const parts = path.split("/");
  const filename = parts.at(-1) ?? path;
  const directories = parts.slice(0, -1);
  const test = hasConvention(path, conventions.tests);
  const generated = hasConvention(path, conventions.generated);
  const matches = roles.filter((role) => {
    const rule = conventions.roles[role];
    return (
      rule.filenameSuffixes.some((marker) => filename.includes(marker)) ||
      rule.directorySegments.some((segment) => directories.includes(segment))
    );
  });
  if (matches.length > 1) return { kind: "ambiguous", roles: matches };
  if (matches.length === 1) return { kind: "role", role: matches[0]!, test };
  const basename = filename.includes(".") ? filename.slice(0, filename.indexOf(".")) : filename;
  if (conventions.compositionRoots.includes(basename)) return { kind: "composition-root", test };
  if (test && !generated) return { kind: "test" };
  return { kind: "unclassified" };
}

function cleanSpecifier(specifier: string): string {
  if (specifier.startsWith("#")) return specifier.split("?")[0]!;
  const query = specifier.indexOf("?");
  const fragment = specifier.indexOf("#");
  const end = [query, fragment].filter((index) => index !== -1).sort((left, right) => left - right)[0];
  return end === undefined ? specifier : specifier.slice(0, end);
}

function packageSpecifierName(specifier: string): string | undefined {
  if (specifier.startsWith(".") || specifier.startsWith("#") || isAbsolute(specifier)) return undefined;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? (parts.length >= 2 ? parts.slice(0, 2).join("/") : undefined) : parts[0];
}

function packageName(state: AdapterState, result: ResolveResult, specifier: string): string | undefined {
  const packageJsonPath = result.packageJsonPath;
  if (packageJsonPath !== undefined) {
    if (!state.packageNames.has(packageJsonPath)) {
      try {
        const metadata = JSON.parse(readFileSync(packageJsonPath, "utf8")) as { name?: unknown };
        state.packageNames.set(packageJsonPath, typeof metadata.name === "string" ? metadata.name : undefined);
      } catch {
        state.packageNames.set(packageJsonPath, undefined);
      }
    }
    const name = state.packageNames.get(packageJsonPath);
    if (name !== undefined && packageJsonPath !== resolve(state.projectDirectory, "package.json")) return name;
  }
  return packageSpecifierName(specifier);
}

function isProjectPath(state: AdapterState, path: string): boolean {
  const relativePath = projectPath(state, path);
  return (
    relativePath !== ".." &&
    !relativePath.startsWith("../") &&
    !isAbsolute(relativePath) &&
    !relativePath.split("/").includes("node_modules")
  );
}

function resolveDependency(
  state: AdapterState,
  filename: string,
  specifier: string,
  kind: DependencyKind,
): Resolution {
  const clean = cleanSpecifier(specifier);
  let result: ResolveResult;
  try {
    result = (kind === "require" ? state.requireResolver : state.importResolver).resolveFileSync(filename, clean);
  } catch (error) {
    return { kind: "unresolved", reason: error instanceof Error ? error.message : String(error) };
  }
  if (result.builtin !== undefined) return { kind: "builtin" };
  if (result.path !== undefined) {
    return isProjectPath(state, result.path)
      ? { kind: "local", path: projectPath(state, result.path) }
      : { kind: "external", packageName: packageName(state, result, clean) };
  }
  return { kind: "unresolved", reason: result.error ?? `Could not resolve ${clean}.` };
}

function analyzeDependency(
  context: RuleContext,
  state: AdapterState,
  filename: string,
  specifier: string,
  kind: DependencyKind,
): DependencyAnalysis {
  const calculate = () => {
    const resolution = resolveDependency(state, filename, specifier, kind);
    return resolution.kind === "local"
      ? { ...resolution, classification: classify(state, resolution.path) }
      : resolution;
  };
  const sourceCode = context.sourceCode;
  if (sourceCode === undefined || typeof sourceCode !== "object") return calculate();
  let roots = preparedRoots.get(sourceCode);
  if (roots === undefined) {
    roots = new Set();
    preparedRoots.set(sourceCode, roots);
  }
  if (!roots.has(state.projectDirectory)) {
    state.importResolver.clearCache();
    state.requireResolver.clearCache();
    roots.add(state.projectDirectory);
  }
  let cache = analyses.get(sourceCode);
  if (cache === undefined) {
    cache = new Map();
    analyses.set(sourceCode, cache);
  }
  const key = `${state.projectDirectory}\0${state.stamp}\0${filename}\0${kind}\0${specifier}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const analysis = calculate();
  cache.set(key, analysis);
  return analysis;
}

function sourceOf(node: Node): string | undefined {
  return typeof node.source?.value === "string" ? node.source.value : undefined;
}

function isModuleRequire(context: RuleContext, node: Node): boolean {
  const sourceCode = context.sourceCode;
  if (sourceCode?.getScope === undefined) return true;
  let scope: Scope | null | undefined = sourceCode.getScope(node);
  while (scope !== undefined && scope !== null) {
    const variable = scope.set?.get("require") ?? scope.variables?.find(({ name }) => name === "require");
    if (variable !== undefined && (variable.defs?.length ?? 0) > 0) return false;
    scope = scope.upper;
  }
  return true;
}

function dependencyRule(ruleId: RuleId) {
  return {
    meta: { type: "problem", schema: [] },
    create(context: RuleContext) {
      verifyOxlintVersion(context);
      const state = stateFor(context);
      const filename = absoluteFilename(context.filename);
      const from = classify(state, projectPath(state, filename));
      function report(node: unknown, message: string) {
        context.report({ node, message: `${ruleId}: ${message}` });
      }
      function inspect(node: unknown, specifier: string | undefined, kind: DependencyKind) {
        if (
          specifier === undefined ||
          (from.kind !== "role" && from.kind !== "composition-root" && from.kind !== "test")
        ) {
          return;
        }
        const target = analyzeDependency(context, state, filename, specifier, kind);
        if (target.kind === "unresolved") {
          if (ruleId === "righting/unresolved-local-import") {
            report(node, `Covered source cannot depend on unresolved import ${JSON.stringify(specifier)}: ${target.reason}`);
          }
          return;
        }
        if (target.kind === "builtin") return;
        if (target.kind === "external") {
          if (ruleId !== "righting/role-dependency" || from.kind !== "role" || from.test) return;
          const protectedDependency = state.contract.effective.protectedDependencyRules.find(
            ({ package: name }) => name === target.packageName,
          );
          if (protectedDependency !== undefined && protectedDependency.forbiddenFrom.includes(from.role)) {
            report(node, `${from.role} cannot depend on protected ${protectedDependency.role} package ${protectedDependency.package}.`);
          }
          return;
        }
        if ((from.kind === "role" || from.kind === "composition-root") && from.test) return;
        if (from.kind === "test") return;
        const to = target.classification;
        if (to.kind === "outside") return;
        if (to.kind === "test" || ((to.kind === "role" || to.kind === "composition-root") && to.test)) {
          if (ruleId === "righting/test-dependency") {
            report(node, "Governed production source cannot depend on test source.");
          }
          return;
        }
        if (from.kind === "composition-root") {
          if (
            to.kind !== "role" &&
            to.kind !== "composition-root" &&
            ruleId === "righting/unresolved-local-import"
          ) {
            report(node, "Composition roots can depend only on classified local source.");
          }
          return;
        }
        if (to.kind === "composition-root") {
          if (ruleId === "righting/role-dependency") {
            report(node, `${from.role} cannot depend on a composition root.`);
          }
          return;
        }
        if (to.kind !== "role") {
          if (ruleId === "righting/unresolved-local-import") {
            report(node, "Covered role source cannot depend on unclassified local source.");
          }
          return;
        }
        if (ruleId === "righting/role-dependency" && !state.contract.effective.allowedDependencies[from.role].includes(to.role)) {
          report(node, `${from.role} cannot depend on ${to.role}.`);
        }
      }
      const inspectImport = (node: Node) => inspect(node.source ?? node, sourceOf(node), "import");
      return {
        ImportDeclaration: inspectImport,
        ExportAllDeclaration: inspectImport,
        ExportNamedDeclaration: inspectImport,
        ImportExpression: inspectImport,
        CallExpression(node: Node) {
          if (
            node.callee?.type === "Identifier" &&
            node.callee.name === "require" &&
            isModuleRequire(context, node)
          ) {
            const argument = node.arguments?.[0];
            inspect(argument ?? node, typeof argument?.value === "string" ? argument.value : undefined, "require");
          }
        },
      };
    },
  };
}

function classificationRule(ruleId: RuleId) {
  return {
    meta: { type: "problem", schema: [] },
    create(context: RuleContext) {
      verifyOxlintVersion(context);
      const state = stateFor(context);
      return {
        Program(node: unknown) {
          const classification = classify(state, projectPath(state, absoluteFilename(context.filename)));
          if (ruleId === "righting/unclassified-source" && classification.kind === "unclassified") {
            context.report({
              node,
              message: `${ruleId}: This covered source does not match a canonical role or explicit source treatment.`,
            });
          }
          if (ruleId === "righting/ambiguous-source" && classification.kind === "ambiguous") {
            context.report({
              node,
              message: `${ruleId}: This covered source matches multiple canonical roles: ${classification.roles.join(", ")}.`,
            });
          }
        },
      };
    },
  };
}

const packageMetadata = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../package.json", import.meta.url)), "utf8"),
) as { version: string };

const workingDirectoryProject = searchProjectDirectory(realpathSync(process.cwd()));
if (workingDirectoryProject !== undefined) {
  try {
    stateForProject(workingDirectoryProject);
  } catch {
    // The cached failure is reported only if a linted file belongs to this root.
  }
}

export default {
  meta: { name: "righting", version: packageMetadata.version },
  rules: {
    "role-dependency": dependencyRule("righting/role-dependency"),
    "unresolved-local-import": dependencyRule("righting/unresolved-local-import"),
    "unclassified-source": classificationRule("righting/unclassified-source"),
    "ambiguous-source": classificationRule("righting/ambiguous-source"),
    "test-dependency": dependencyRule("righting/test-dependency"),
  },
};
