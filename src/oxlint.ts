import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const packageRequire = createRequire(import.meta.url);
const { isMatch } = packageRequire("micromatch") as {
  isMatch(path: string, patterns: readonly string[]): boolean;
};

const projectDirectory = process.cwd();
const supportedOxlintVersion = "1.75.0";
const roles = ["Client", "Manager", "Engine", "ResourceAccess", "Resource", "Utility"] as const;
type Role = (typeof roles)[number];
type RuleId =
  | "righting/role-dependency"
  | "righting/unresolved-local-import"
  | "righting/unclassified-source"
  | "righting/ambiguous-source"
  | "righting/test-dependency";

type Convention = { filenameMarkers?: string[]; directorySegments?: string[] };
type Contract = {
  contractVersion: number;
  roles: Role[];
  configured: { coverage: string[] };
  effective: {
    allowedDependencies: Record<Role, Role[]>;
    capabilities: Array<{ id: string; applies: boolean }>;
    conventions: {
      roles: Record<Role, { filenameSuffixes: string[]; directorySegments: string[] }>;
      tests: Convention;
      generated: Convention;
      compositionRoots: string[];
    };
  };
};
type Classification =
  | { kind: "outside" }
  | { kind: "ambiguous"; roles: Role[] }
  | { kind: "role"; role: Role; test: boolean }
  | { kind: "composition-root"; test: boolean }
  | { kind: "test" }
  | { kind: "unclassified" };
type Node = { source?: { value?: unknown }; arguments?: Array<{ value?: unknown }>; callee?: { type?: string; name?: string } };
type RuleContext = {
  filename: string;
  languageOptions: { parser: { name: string; version: string } };
  report(input: { node: unknown; message: string }): void;
};

function fail(message: string): never {
  throw new Error(`Righting Oxlint adapter: ${message}`);
}

function verifyOxlintVersion(context: RuleContext): void {
  const { name, version } = context.languageOptions.parser;
  if (name !== "oxlint" || version !== supportedOxlintVersion) {
    fail(`unsupported Oxlint version ${version}; expected ${supportedOxlintVersion}.`);
  }
}

function inspectContract(): Contract {
  const cli = fileURLToPath(new URL("./cli.js", import.meta.url));
  const inspection = spawnSync(process.execPath, [cli, "inspect", "--json"], {
    cwd: projectDirectory,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (inspection.error !== undefined) fail(`could not run righting inspect --json: ${inspection.error.message}`);

  let response: {
    schemaVersion?: number;
    command?: string;
    ok?: boolean;
    policy?: { status?: string };
    contract?: Contract;
    error?: { message?: string };
  };
  try {
    response = JSON.parse(inspection.stdout) as typeof response;
  } catch {
    fail("righting inspect --json did not return JSON.");
  }
  if (inspection.status !== 0 || response.ok !== true) {
    fail(response.error?.message ?? "righting inspect --json failed.");
  }
  if (response.schemaVersion !== 1) fail(`unsupported inspection schemaVersion ${String(response.schemaVersion)}; expected 1.`);
  if (response.command !== "inspect" || response.policy?.status !== "valid" || response.contract === undefined) {
    fail("righting inspect --json must return a valid normalized contract.");
  }
  if (response.contract.contractVersion !== 2) {
    fail(`unsupported contractVersion ${String(response.contract.contractVersion)}; expected 2.`);
  }
  const unsupported = response.contract.effective.capabilities.filter(
    (capability) => capability.applies && capability.id === "protected-dependency",
  );
  if (unsupported.length > 0) {
    fail(`contract requires unsupported capabilities: ${unsupported.map(({ id }) => id).join(", ")}.`);
  }
  return response.contract;
}

const contract = inspectContract();
const conventions = contract.effective.conventions;
const allowed = contract.effective.allowedDependencies;
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];
const packageJson = JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8")) as {
  imports?: Record<string, unknown>;
};
const packageImports = packageJson.imports ?? {};

function projectPath(path: string): string {
  return relative(projectDirectory, path).split(sep).join("/");
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

function classify(path: string): Classification {
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

function packageImportPath(specifier: string): string | undefined {
  const match = Object.entries(packageImports)
    .filter(([pattern]) => {
      const wildcard = pattern.indexOf("*");
      return wildcard === -1
        ? specifier === pattern
        : specifier.startsWith(pattern.slice(0, wildcard)) && specifier.endsWith(pattern.slice(wildcard + 1));
    })
    .sort(([left], [right]) => {
      const leftWildcard = left.indexOf("*");
      const rightWildcard = right.indexOf("*");
      if (leftWildcard === -1) return -1;
      if (rightWildcard === -1) return 1;
      return rightWildcard - leftWildcard || right.length - left.length;
    })[0];
  if (match === undefined || typeof match[1] !== "string") return undefined;
  const [pattern, target] = match;
  const wildcard = pattern.indexOf("*");
  const value =
    wildcard === -1 ? "" : specifier.slice(wildcard, specifier.length - (pattern.length - wildcard - 1));
  return resolve(projectDirectory, target.replaceAll("*", value));
}

function existingPath(candidate: string): string | undefined {
  const candidates = [
    candidate,
    ...extensions.map((extension) => `${candidate}${extension}`),
    ...extensions.map((extension) => resolve(candidate, `index${extension}`)),
  ];
  return candidates.find((path) => existsSync(path) && statSync(path).isFile());
}

function localTarget(filename: string, specifier: string): { local: boolean; path?: string } {
  const clean = specifier.startsWith("#") ? specifier.split("?")[0]! : specifier.split(/[?#]/)[0]!;
  const packageImport = clean.startsWith("#");
  const candidate = clean.startsWith(".")
    ? resolve(dirname(filename), clean)
    : packageImport
      ? packageImportPath(clean)
      : undefined;
  if (candidate === undefined) return { local: packageImport };
  const path = existingPath(candidate);
  return { local: true, ...(path === undefined ? {} : { path: projectPath(path) }) };
}

function sourceOf(node: Node): string | undefined {
  return typeof node.source?.value === "string" ? node.source.value : undefined;
}

function dependencyRule(ruleId: RuleId) {
  return {
    meta: { type: "problem", schema: [] },
    create(context: RuleContext) {
      verifyOxlintVersion(context);
      const filename = context.filename;
      const from = classify(projectPath(filename));
      function report(node: unknown, message: string) {
        context.report({ node, message: `${ruleId}: ${message}` });
      }
      function inspect(node: unknown, specifier: string | undefined) {
        if (
          specifier === undefined ||
          (from.kind !== "role" && from.kind !== "composition-root") ||
          from.test
        ) {
          return;
        }
        const target = localTarget(filename, specifier);
        if (!target.local) return;
        if (target.path === undefined) {
          if (ruleId === "righting/unresolved-local-import") {
            report(node, "Covered source cannot depend on an unresolved local import.");
          }
          return;
        }
        const to = classify(target.path);
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
        if (ruleId === "righting/role-dependency" && !allowed[from.role].includes(to.role)) {
          report(node, `${from.role} cannot depend on ${to.role}.`);
        }
      }
      return {
        ImportDeclaration(node: Node) {
          inspect(node, sourceOf(node));
        },
        ExportAllDeclaration(node: Node) {
          inspect(node, sourceOf(node));
        },
        ExportNamedDeclaration(node: Node) {
          inspect(node, sourceOf(node));
        },
        ImportExpression(node: Node) {
          inspect(node, sourceOf(node));
        },
        CallExpression(node: Node) {
          if (node.callee?.type === "Identifier" && node.callee.name === "require") {
            const value = node.arguments?.[0]?.value;
            inspect(node, typeof value === "string" ? value : undefined);
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
      return {
        Program(node: unknown) {
          const classification = classify(projectPath(context.filename));
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
