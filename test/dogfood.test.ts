import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, resolve } from "node:path";
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

function git(projectDirectory: string, ...arguments_: string[]): void {
  assertSuccess(run(projectDirectory, "git", arguments_));
}

function commit(projectDirectory: string, message: string): void {
  git(projectDirectory, "add", ".");
  git(projectDirectory, "commit", "-m", message);
}

function createDogfoodProject(): { projectDirectory: string; approvedPolicy: string } {
  const projectDirectory = mkdtempSync(resolve(tmpdir(), "righting-dogfood-"));
  cpSync(dogfoodDirectory, projectDirectory, { recursive: true });
  const approvedPolicy = readFileSync(resolve(projectDirectory, "righting.json"), "utf8");
  rmSync(resolve(projectDirectory, "righting.json"));
  rmSync(resolve(projectDirectory, "eslint-suppressions.json"));
  rmSync(resolve(projectDirectory, ".agents"), { recursive: true, force: true });
  rmSync(resolve(projectDirectory, "src/orders/workflow/refund-order.ts"));

  const configPath = resolve(projectDirectory, "eslint.config.mjs");
  writeFileSync(
    configPath,
    readFileSync(configPath, "utf8")
      .replace('import { eslintConfig } from "righting/eslint";\n\n', "")
      .replace("  },\n  eslintConfig(),\n", "  }\n"),
  );

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

  return { projectDirectory, approvedPolicy };
}

function righting(projectDirectory: string, ...arguments_: string[]) {
  return run(projectDirectory, "npx", ["righting", ...arguments_]);
}

function npm(projectDirectory: string, ...arguments_: string[]) {
  return run(projectDirectory, "npm", arguments_);
}

function configureApprovedPolicy(projectDirectory: string, approvedPolicy: string): void {
  writeFileSync(resolve(projectDirectory, "righting.json"), approvedPolicy);

  const configPath = resolve(projectDirectory, "eslint.config.mjs");
  const existing = readFileSync(configPath, "utf8");
  writeFileSync(
    configPath,
    `import { eslintConfig } from "righting/eslint";\n\n${existing.replace("\n];\n", ",\n  eslintConfig(),\n];\n")}`,
  );
}

test("dogfood project completes the approved Righting integration and repair workflow", () => {
  const { projectDirectory, approvedPolicy } = createDogfoodProject();

  try {
    git(projectDirectory, "init");
    git(projectDirectory, "config", "user.email", "righting@example.test");
    git(projectDirectory, "config", "user.name", "Righting Test");
    commit(projectDirectory, "before righting");

    const installedPackage = JSON.parse(readFileSync(resolve(projectDirectory, "package.json"), "utf8")) as {
      devDependencies: Record<string, string>;
    };
    assert.equal(typeof installedPackage.devDependencies.righting, "string");

    const initialized = righting(projectDirectory, "init", "--skills", "--json");
    assertSuccess(initialized);
    assert.deepEqual(JSON.parse(initialized.stdout), {
      schemaVersion: 1,
      command: "init",
      ok: true,
      policy: {
        path: "righting.json",
        created: true,
        status: "incomplete",
        required: ["aliases", "mappings", "maintainer-approval"],
      },
      guidance: { path: "AGENTS.md", updated: true },
      nextAction: "obtain-policy-approval",
      skills: {
        path: ".agents/skills",
        linked: ["righting-design-review", "righting-eslint", "righting-integrate"],
      },
    });
    for (const skill of ["righting-design-review", "righting-eslint", "righting-integrate"]) {
      const path = resolve(projectDirectory, ".agents/skills", skill);
      assert.ok(lstatSync(path).isSymbolicLink(), path);
      assert.equal(isAbsolute(readlinkSync(path)), false);
      assert.equal(resolve(dirname(path), readlinkSync(path)), resolve(projectDirectory, "node_modules/righting/skills", skill));
      assert.match(readFileSync(resolve(path, "SKILL.md"), "utf8"), new RegExp(`name: ${skill}`));
    }

    configureApprovedPolicy(projectDirectory, approvedPolicy);
    const refreshed = righting(projectDirectory, "init", "--json");
    assertSuccess(refreshed);
    assert.deepEqual(JSON.parse(refreshed.stdout), {
      schemaVersion: 1,
      command: "init",
      ok: true,
      policy: { path: "righting.json", created: false, status: "valid" },
      guidance: { path: "AGENTS.md", updated: true },
    });
    const agentGuidance = readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8");
    assert.match(agentGuidance, /Keep project-owned delivery instructions here\./);
    assert.match(agentGuidance, /This project has a Righting architecture policy in `righting\.json`\./);
    assert.match(agentGuidance, /Read it before changing mapped code\./);
    assert.doesNotMatch(agentGuidance, /context firewall|righting init --skills/i);

    const suppressedLegacyDebt = npm(projectDirectory, "run", "lint", "--", "--suppress-rule", "righting/role-dependency");
    assertSuccess(suppressedLegacyDebt);
    assert.deepEqual(JSON.parse(readFileSync(resolve(projectDirectory, "eslint-suppressions.json"), "utf8")), {
      "src/orders/workflow/legacy-order.ts": { "righting/role-dependency": { count: 1 } },
    });

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
      "HEAD",
      "--migration-reason",
      "Adopt the existing legacy order workflow dependency.",
      "--json",
    );
    assertSuccess(adopted);
    assert.equal(JSON.parse(adopted.stdout).debt.status, "migration-baseline");
    commit(projectDirectory, "adopt righting policy and legacy debt");

    const refundPath = resolve(projectDirectory, "src/orders/workflow/refund-order.ts");
    writeFileSync(
      refundPath,
      'import { acceptReturn } from "../../returns/workflow/accept-return.ts";\n\nexport function refundOrder() {\n  return acceptReturn();\n}\n',
    );
    const boundaryFailure = npm(projectDirectory, "run", "lint");
    assert.equal(boundaryFailure.status, 1, `${boundaryFailure.stdout}\n${boundaryFailure.stderr}`);
    assert.match(`${boundaryFailure.stdout}\n${boundaryFailure.stderr}`, /righting\/cross-context-dependency/);

    writeFileSync(
      refundPath,
      'import { returnStatus } from "../../shared/utility/return-status.ts";\n\nexport function refundOrder() {\n  return returnStatus();\n}\n',
    );
    commit(projectDirectory, "repair refund workflow boundary");

    const baseline = righting(projectDirectory, "baseline", "--base", "HEAD", "--json");
    assertSuccess(baseline);
    assert.equal(JSON.parse(baseline.stdout).debt.status, "within-baseline");
    assertSuccess(npm(projectDirectory, "run", "ci"));
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
