import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, lstatSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");
const dogfoodDirectory = resolve(repositoryDirectory, "dogfood/orders-and-returns");

function run(projectDirectory: string, command: string, arguments_: readonly string[]) {
  return spawnSync(command, arguments_, { cwd: projectDirectory, encoding: "utf8", input: "" });
}

function assertSuccess(result: ReturnType<typeof run>): void {
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function git(projectDirectory: string, ...arguments_: string[]): string {
  const result = run(projectDirectory, "git", arguments_);
  assertSuccess(result);
  return result.stdout.trim();
}

function createDogfoodProject(): string {
  const projectDirectory = mkdtempSync(resolve(tmpdir(), "righting-dogfood-"));
  cpSync(dogfoodDirectory, projectDirectory, { recursive: true });

  const packagePath = resolve(projectDirectory, "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf8")) as {
    devDependencies: Record<string, string>;
  };
  delete packageJson.devDependencies.righting;
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const packageDirectory = mkdtempSync(resolve(tmpdir(), "righting-package-"));
  try {
    const packed = run(projectDirectory, "npm", [
      "pack",
      repositoryDirectory,
      "--json",
      "--pack-destination",
      packageDirectory,
    ]);
    assertSuccess(packed);
    const tarball = (JSON.parse(packed.stdout) as Array<{ filename: string }>)[0]?.filename;
    if (tarball === undefined) {
      throw new Error("npm pack did not report a tarball.");
    }
    assertSuccess(
      run(projectDirectory, "npm", [
        "install",
        "--save-dev",
        "--no-package-lock",
        "--include=dev",
        "--ignore-scripts",
        resolve(packageDirectory, tarball),
      ]),
    );
  } finally {
    rmSync(packageDirectory, { recursive: true, force: true });
  }

  return projectDirectory;
}

function righting(projectDirectory: string, ...arguments_: string[]) {
  return run(projectDirectory, "npx", ["righting", ...arguments_]);
}

function npm(projectDirectory: string, ...arguments_: string[]) {
  return run(projectDirectory, "npm", arguments_);
}

function createApprovedIntegrationHistory(projectDirectory: string): string {
  git(projectDirectory, "init");
  git(projectDirectory, "config", "user.email", "righting@example.test");
  git(projectDirectory, "config", "user.name", "Righting Test");
  git(projectDirectory, "add", ".");
  const approvedTree = git(projectDirectory, "write-tree");
  git(projectDirectory, "read-tree", "--empty");
  const beforeTree = git(projectDirectory, "write-tree");
  const beforeIntegration = git(
    projectDirectory,
    "commit-tree",
    beforeTree,
    "-m",
    "before approved Righting integration",
  );
  const approvedIntegration = git(
    projectDirectory,
    "commit-tree",
    approvedTree,
    "-p",
    beforeIntegration,
    "-m",
    "adopt approved Righting policy and legacy debt",
  );
  git(projectDirectory, "update-ref", "refs/heads/main", approvedIntegration);
  git(projectDirectory, "symbolic-ref", "HEAD", "refs/heads/main");
  git(projectDirectory, "read-tree", approvedIntegration);
  return beforeIntegration;
}

test("dogfood project preserves the approved Righting repair workflow", () => {
  const projectDirectory = createDogfoodProject();

  try {
    const policyPath = resolve(projectDirectory, "righting.json");
    const configPath = resolve(projectDirectory, "eslint.config.mjs");
    const suppressionsPath = resolve(projectDirectory, "eslint-suppressions.json");
    const refundPath = resolve(projectDirectory, "src/orders/workflow/refund-order.ts");
    const approvedPolicy = readFileSync(policyPath, "utf8");
    const approvedConfig = readFileSync(configPath, "utf8");
    const repairedRefundWorkflow = readFileSync(refundPath, "utf8");

    assert.equal(lstatSync(resolve(projectDirectory, "node_modules/righting")).isSymbolicLink(), false);
    assert.match(approvedPolicy, /"preset": "volatility@1"/);
    assert.match(approvedConfig, /import \{ eslintConfig \} from "righting\/eslint"/);
    assert.match(approvedConfig, /eslintConfig\(\)/);
    assert.equal(
      (JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8")) as { scripts: { lint: string } }).scripts.lint,
      "eslint .",
    );
    assert.deepEqual(JSON.parse(readFileSync(suppressionsPath, "utf8")), {
      "src/orders/workflow/legacy-order.ts": { "righting/role-dependency": { count: 1 } },
    });

    const beforeIntegration = createApprovedIntegrationHistory(projectDirectory);

    assertSuccess(npm(projectDirectory, "run", "lint", "--", "--suppress-rule", "righting/role-dependency"));

    const typeOnlyImportPath = resolve(projectDirectory, "src/orders/screen/illegal-type-only-import.ts");
    writeFileSync(
      typeOnlyImportPath,
      'import type { saveOrder } from "../gateway/orders-gateway.ts";\n\nexport type SaveOrder = typeof saveOrder;\n',
    );
    const typeOnlyFailure = npm(projectDirectory, "run", "lint");
    assert.equal(typeOnlyFailure.status, 1, `${typeOnlyFailure.stdout}\n${typeOnlyFailure.stderr}`);
    assert.match(`${typeOnlyFailure.stdout}\n${typeOnlyFailure.stderr}`, /righting\/role-dependency/);
    rmSync(typeOnlyImportPath);

    const adopted = righting(
      projectDirectory,
      "baseline",
      "--base",
      beforeIntegration,
      "--migration-reason",
      "Adopt the existing legacy order workflow dependency.",
      "--json",
    );
    assertSuccess(adopted);
    assert.equal(JSON.parse(adopted.stdout).debt.status, "migration-baseline");

    writeFileSync(
      refundPath,
      'import { acceptReturn } from "../../returns/workflow/accept-return.ts";\n\nexport function refundOrder() {\n  return acceptReturn();\n}\n',
    );
    const boundaryFailure = npm(projectDirectory, "run", "lint");
    assert.equal(boundaryFailure.status, 1, `${boundaryFailure.stdout}\n${boundaryFailure.stderr}`);
    assert.match(`${boundaryFailure.stdout}\n${boundaryFailure.stderr}`, /righting\/cross-context-dependency/);

    writeFileSync(refundPath, repairedRefundWorkflow);

    const baseline = righting(projectDirectory, "baseline", "--base", "HEAD", "--json");
    assertSuccess(baseline);
    assert.equal(JSON.parse(baseline.stdout).debt.status, "within-baseline");
    assertSuccess(npm(projectDirectory, "run", "ci"));
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
