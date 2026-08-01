import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAdapterContract } from "./adapter-contract.js";
import { classifySource } from "./contract.js";

const projectDirectory = process.cwd();
const supportedOxlintVersion = "1.75.0";
type RuleId =
  | "righting/role-dependency"
  | "righting/unresolved-local-import"
  | "righting/unclassified-source"
  | "righting/ambiguous-source"
  | "righting/test-dependency";
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

const contract = loadAdapterContract(projectDirectory);
const unsupported = contract.effective.capabilities.filter(
  (capability) => capability.applies && capability.id === "protected-dependency",
);
if (unsupported.length > 0) {
  fail(`contract requires unsupported capabilities: ${unsupported.map(({ id }) => id).join(", ")}.`);
}
const allowed = contract.effective.allowedDependencies;
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];
const packageJson = JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8")) as {
  imports?: Record<string, unknown>;
};
const packageImports = packageJson.imports ?? {};

function projectPath(path: string): string {
  return relative(projectDirectory, path).split(sep).join("/");
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
      const from = classifySource(contract, projectPath(filename));
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
        const to = classifySource(contract, target.path);
        if (to.kind === "outside-coverage") return;
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
          const classification = classifySource(contract, projectPath(context.filename));
          if (classification.kind !== "violation" || classification.ruleId !== ruleId) return;
          if (ruleId === "righting/unclassified-source") {
            context.report({
              node,
              message: `${ruleId}: This covered source does not match a canonical role or explicit source treatment.`,
            });
          }
          if (ruleId === "righting/ambiguous-source" && classification.ruleId === "righting/ambiguous-source") {
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
