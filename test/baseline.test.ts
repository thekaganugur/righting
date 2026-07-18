import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(testDirectory, "../src/cli.js");

function createProject(): string {
  return mkdtempSync(resolve(tmpdir(), "righting-baseline-"));
}

function writeProject(projectDirectory: string, typedLint = false): void {
  writeFileSync(
    resolve(projectDirectory, "package.json"),
    `${JSON.stringify(
      {
        private: true,
        type: "module",
        devDependencies: { eslint: "^9.0.0" },
        scripts: { lint: "eslint ." },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    resolve(projectDirectory, "eslint.config.mjs"),
    `export default [{ languageOptions: { parserOptions: ${typedLint ? '{ project: "./tsconfig.json" }' : "{}"} }];\n`,
  );
}

function writePolicy(projectDirectory: string): void {
  writeFileSync(
    resolve(projectDirectory, "righting.json"),
    `${JSON.stringify(
      {
        preset: "volatility@1",
        aliases: { screen: "Client" },
        mappings: [{ alias: "screen", path: "src/client/**" }],
      },
      null,
      2,
    )}\n`,
  );
}

function writeSuppressions(projectDirectory: string, count: number): void {
  writeFileSync(
    resolve(projectDirectory, "eslint-suppressions.json"),
    `${JSON.stringify(
      {
        "src/client/legacy.js": {
          "righting/role-dependency": { count },
          "no-undef": { count: 3 },
        },
      },
      null,
      2,
    )}\n`,
  );
}

function git(projectDirectory: string, ...arguments_: string[]): void {
  const result = spawnSync("git", arguments_, { cwd: projectDirectory, encoding: "utf8" });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

function commit(projectDirectory: string, message: string): void {
  git(projectDirectory, "add", ".");
  git(projectDirectory, "commit", "-m", message);
}

function runBaseline(projectDirectory: string, arguments_: readonly string[]) {
  return spawnSync(process.execPath, [cliPath, "baseline", ...arguments_], {
    cwd: projectDirectory,
    encoding: "utf8",
  });
}

test("righting baseline preserves a modern ESLint setup and ignores unrelated native suppressions", () => {
  const projectDirectory = createProject();

  try {
    writeProject(projectDirectory, true);
    writePolicy(projectDirectory);
    writeSuppressions(projectDirectory, 2);
    git(projectDirectory, "init");
    git(projectDirectory, "config", "user.email", "righting@example.test");
    git(projectDirectory, "config", "user.name", "Righting Test");
    commit(projectDirectory, "baseline");

    const packageBefore = readFileSync(resolve(projectDirectory, "package.json"), "utf8");
    const configBefore = readFileSync(resolve(projectDirectory, "eslint.config.mjs"), "utf8");
    writeSuppressions(projectDirectory, 1);

    const result = runBaseline(projectDirectory, ["--base", "HEAD", "--json"]);

    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.command, "baseline");
    assert.deepEqual(output.adapter, {
      flatConfig: "eslint.config.mjs",
      lintScript: "eslint .",
      typedLint: true,
    });
    assert.deepEqual(output.debt.current, {
      "src/client/legacy.js": { "righting/role-dependency": 1 },
    });
    assert.equal(output.debt.status, "within-baseline");
    assert.match(output.limitations[0], /same file and rule/i);
    assert.equal(readFileSync(resolve(projectDirectory, "package.json"), "utf8"), packageBefore);
    assert.equal(readFileSync(resolve(projectDirectory, "eslint.config.mjs"), "utf8"), configBefore);
    assert.equal(
      JSON.parse(readFileSync(resolve(projectDirectory, "eslint-suppressions.json"), "utf8"))["src/client/legacy.js"]
        ["no-undef"].count,
      3,
    );
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting baseline ratchets legacy Righting debt and permits policy expansion only with a migration reason", () => {
  const projectDirectory = createProject();

  try {
    writeProject(projectDirectory);
    git(projectDirectory, "init");
    git(projectDirectory, "config", "user.email", "righting@example.test");
    git(projectDirectory, "config", "user.name", "Righting Test");
    commit(projectDirectory, "before-righting");

    writePolicy(projectDirectory);
    writeSuppressions(projectDirectory, 1);

    const missingReason = runBaseline(projectDirectory, ["--base", "HEAD"]);
    assert.notEqual(missingReason.status, 0);
    assert.match(missingReason.stderr, /migration reason/i);

    const initial = runBaseline(projectDirectory, ["--base", "HEAD", "--migration-reason", "Adopt existing Client debt."]);
    assert.equal(initial.status, 0, initial.stderr);
    assert.match(initial.stdout, /migration baseline/i);
    commit(projectDirectory, "adopt legacy debt");

    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      `${JSON.stringify(
        {
          preset: "volatility@1",
          aliases: { screen: "Client", useCase: "Manager" },
          mappings: [
            { alias: "screen", path: "src/client/**" },
            { alias: "useCase", path: "src/manager/**" },
          ],
        },
        null,
        2,
      )}\n`,
    );
    const expansionWithoutDebt = runBaseline(projectDirectory, ["--base", "HEAD"]);
    assert.notEqual(expansionWithoutDebt.status, 0);
    assert.match(expansionWithoutDebt.stderr, /migration reason/i);
    writePolicy(projectDirectory);

    writeSuppressions(projectDirectory, 2);
    const growth = runBaseline(projectDirectory, ["--base", "HEAD"]);
    assert.notEqual(growth.status, 0);
    assert.match(growth.stderr, /legacy debt grew/i);

    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      `${readFileSync(resolve(projectDirectory, "righting.json"), "utf8")}\n`,
    );
    const formattingOnly = runBaseline(projectDirectory, [
      "--base",
      "HEAD",
      "--migration-reason",
      "This is not an enforcement expansion.",
    ]);
    assert.notEqual(formattingOnly.status, 0);
    assert.match(formattingOnly.stderr, /does not expand/i);

    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      `${JSON.stringify(
        {
          preset: "volatility@1",
          aliases: { screen: "Client", useCase: "Manager" },
          mappings: [
            { alias: "screen", path: "src/client/**" },
            { alias: "useCase", path: "src/manager/**" },
          ],
        },
        null,
        2,
      )}\n`,
    );
    const expanded = runBaseline(projectDirectory, [
      "--base",
      "HEAD",
      "--migration-reason",
      "The Manager mapping exposes existing legacy debt.",
      "--json",
    ]);
    assert.equal(expanded.status, 0, expanded.stderr);
    assert.equal(JSON.parse(expanded.stdout).debt.status, "migration-baseline");
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting baseline documents its same-file, same-rule count limitation in behavior", () => {
  const projectDirectory = createProject();

  try {
    writeProject(projectDirectory);
    writePolicy(projectDirectory);
    mkdirSync(resolve(projectDirectory, "src/client"), { recursive: true });
    writeFileSync(resolve(projectDirectory, "src/client/legacy.js"), "// legacy boundary violation A\n");
    writeSuppressions(projectDirectory, 1);
    git(projectDirectory, "init");
    git(projectDirectory, "config", "user.email", "righting@example.test");
    git(projectDirectory, "config", "user.name", "Righting Test");
    commit(projectDirectory, "baseline");

    writeFileSync(resolve(projectDirectory, "src/client/legacy.js"), "// legacy boundary violation B\n");
    const result = runBaseline(projectDirectory, ["--base", "HEAD", "--json"]);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).debt.status, "within-baseline");
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting baseline reports unsupported ESLint setups without changing them", () => {
  const projectDirectory = createProject();

  try {
    writeFileSync(resolve(projectDirectory, "package.json"), '{"scripts":{"lint":"eslint ."}}\n');
    writeFileSync(resolve(projectDirectory, ".eslintrc.json"), "{}\n");
    const legacy = runBaseline(projectDirectory, ["--base", "main"]);
    assert.notEqual(legacy.status, 0);
    assert.match(legacy.stderr, /legacy ESLint configuration is unsupported/i);

    rmSync(resolve(projectDirectory, ".eslintrc.json"));
    const absent = runBaseline(projectDirectory, ["--base", "main"]);
    assert.notEqual(absent.status, 0);
    assert.match(absent.stderr, /modern ESLint flat config/i);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
