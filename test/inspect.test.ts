import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { normalizePolicy, readPolicy } from "../src/policy.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(testDirectory, "../src/cli.js");
const incompleteRequirements = ["coverage", "maintainer-approval"];

function createProject(): string {
  return mkdtempSync(resolve(tmpdir(), "righting-inspect-"));
}

function run(projectDirectory: string, ...arguments_: string[]) {
  return spawnSync(process.execPath, [cliPath, ...arguments_], { cwd: projectDirectory, encoding: "utf8", input: "" });
}

function json(result: ReturnType<typeof run>): Record<string, unknown> {
  assert.notEqual(result.stdout, "", result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

function success(result: ReturnType<typeof run>): Record<string, unknown> {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, "inspect");
  assert.equal(output.ok, true);
  return output;
}

function failure(result: ReturnType<typeof run>, code: string): Record<string, unknown> {
  assert.notEqual(result.status, 0);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, "inspect");
  assert.equal(output.ok, false);
  assert.equal((output.error as Record<string, unknown>).code, code);
  return output;
}

const completePolicy = {
  preset: "volatility@1",
  coverage: ["src/**/*.ts"],
  aliases: [
    {
      name: "screen",
      role: "Client",
      filenameSuffixes: [".screen."],
      directorySegments: ["screens"],
    },
  ],
  protectedDependencies: [{ package: "@example/db", role: "Resource" }],
  variations: ["clientReadsAccess", "pureEngines"],
  overrides: [
    {
      name: "screen-reads-resource",
      from: "Client",
      to: "Resource",
      effect: "allow",
      reason: "The screen renders an approved read model.",
    },
  ],
  compositionRoots: ["main"],
} as const;

test("righting inspect keeps the exact incomplete starter outside the contract", () => {
  const directory = createProject();
  const source = '{"preset":"volatility@1","status":"incomplete"}\n';
  try {
    writeFileSync(resolve(directory, "righting.json"), source);
    const output = success(run(directory, "inspect", "--json"));
    assert.deepEqual(output.policy, { path: "righting.json", status: "incomplete", required: incompleteRequirements });
    assert.equal(output.nextAction, "obtain-policy-approval");
    assert.equal("contract" in output, false);
    assert.deepEqual(output.adapter, { status: "unknown" });
    const human = run(directory, "inspect");
    assert.equal(human.status, 0, human.stderr);
    assert.match(human.stdout, /define and approve coverage and any project conventions/i);
    assert.equal(readFileSync(resolve(directory, "righting.json"), "utf8"), source);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("righting inspect exposes normalized semantics exactly once under contract", () => {
  const directory = createProject();
  try {
    mkdirSync(resolve(directory, "src/screens"), { recursive: true });
    writeFileSync(resolve(directory, "src/screens/home.ts"), "export {};\n");
    writeFileSync(resolve(directory, "righting.json"), `${JSON.stringify(completePolicy, null, 2)}\n`);

    const output = success(run(directory, "inspect", "--json"));
    const expected = normalizePolicy(readPolicy(resolve(directory, "righting.json")));
    assert.deepEqual(output.contract, expected);
    assert.deepEqual(output.policy, { path: "righting.json", status: "valid" });
    assert.deepEqual(output.adapter, { status: "unknown" });
    for (const retired of ["configuration", "effectivePolicy", "capabilities", "enforcementCoverage"]) {
      assert.equal(retired in output, false, retired);
    }
    assert.equal(JSON.stringify(output).match(/"contractVersion"/g)?.length, 1);

    const human = run(directory, "inspect", "--all");
    assert.equal(human.status, 0, human.stderr);
    assert.match(human.stdout, /Contract version: 2/);
    assert.match(human.stdout, /Source coverage is limited to declared coverage patterns/);
    assert.match(human.stdout, /Applicable capabilities/);
    assert.match(human.stdout, /Adapter activation: unknown/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("righting inspect reports mechanical source evidence outside the contract", () => {
  const directory = createProject();
  try {
    mkdirSync(resolve(directory, "source/widgets"), { recursive: true });
    for (const path of [
      "source/widgets/catalog.ts",
      "source/widgets/catalog.test.ts",
      "source/wireup.auto.ts",
      "source/orphan.auto.ts",
      "source/widgets/conflict.manager.ts",
    ]) {
      writeFileSync(resolve(directory, path), "export {};\n");
    }
    writeFileSync(
      resolve(directory, "righting.json"),
      JSON.stringify({
        preset: "volatility@1",
        coverage: ["source/**/*.ts"],
        aliases: [{ name: "widget", role: "Client", directorySegments: ["widgets"] }],
        generated: { filenameMarkers: [".auto."] },
        compositionRoots: ["wireup"],
      }),
    );

    const output = success(run(directory, "inspect", "--json"));
    assert.deepEqual(output.evidence, {
      sourceSummary: {
        covered: 5,
        roles: { Client: 2, Manager: 0, Engine: 0, ResourceAccess: 0, Resource: 0, Utility: 0 },
        tests: 1,
        compositionRoots: 1,
        unclassified: 1,
        ambiguous: 1,
      },
      sourceViolations: [
        { path: "source/orphan.auto.ts", ruleId: "righting/unclassified-source" },
        {
          path: "source/widgets/conflict.manager.ts",
          ruleId: "righting/ambiguous-source",
          roles: ["Client", "Manager"],
        },
      ],
    });
    assert.equal("evidence" in (output.contract as Record<string, unknown>), false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("righting inspect warns when a coverage rule matches no current source", () => {
  const directory = createProject();
  try {
    writeFileSync(resolve(directory, "righting.json"), '{"preset":"volatility@1","coverage":["src/**/*.ts"]}\n');
    const output = success(run(directory, "inspect", "--json"));
    assert.deepEqual(output.warnings, [{ code: "unmatched-coverage", path: "src/**/*.ts" }]);
    const human = run(directory, "inspect");
    assert.match(human.stdout, /Coverage matches no current project file: src\/\*\*\/\*\.ts/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("righting inspect rejects the old complete-policy and projection formats", () => {
  const directory = createProject();
  try {
    writeFileSync(
      resolve(directory, "righting.json"),
      '{"preset":"volatility@1","aliases":{"screen":"Client"},"mappings":[{"alias":"screen","path":"src/**"}]}\n',
    );
    const output = failure(run(directory, "inspect", "--json"), "invalid-policy");
    assert.match((output.error as { message: string }).message, /unsupported property "mappings"/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("righting inspect returns schema-version-1 failures for malformed policy and options", () => {
  const directory = createProject();
  try {
    writeFileSync(resolve(directory, "righting.json"), '{"preset":"volatility@1","status":"incomplete","coverage":["src/**"]}\n');
    const malformed = failure(run(directory, "inspect", "--json"), "invalid-policy");
    assert.match((malformed.error as { message: string }).message, /may contain only.*preset.*status/i);
    const invalidOptions = failure(run(directory, "inspect", "--json", "--all", "--all"), "invalid-options");
    assert.equal((invalidOptions.error as Record<string, unknown>).nextAction, "review-command-options");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
