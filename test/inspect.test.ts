import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const cliPath = resolve(testDirectory, "../src/cli.js");
const incompleteRequirements = ["aliases", "mappings", "maintainer-approval"];

function createProject(): string {
  return mkdtempSync(resolve(tmpdir(), "righting-inspect-"));
}

function run(projectDirectory: string, ...arguments_: string[]) {
  return spawnSync(process.execPath, [cliPath, ...arguments_], {
    cwd: projectDirectory,
    encoding: "utf8",
    input: "",
  });
}

function json(result: ReturnType<typeof run>): Record<string, unknown> {
  assert.notEqual(result.stdout, "", result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

function assertSuccessEnvelope(result: ReturnType<typeof run>): Record<string, unknown> {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, "inspect");
  assert.equal(output.ok, true);
  return output;
}

function assertFailureEnvelope(result: ReturnType<typeof run>, code: string, path: string | undefined, nextAction: string): void {
  assert.notEqual(result.status, 0);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, "inspect");
  assert.equal(output.ok, false);
  const error = output.error as { code: string; path?: string; message: string; nextAction: string };
  assert.equal(error.code, code);
  assert.equal(error.path, path);
  assert.equal(error.nextAction, nextAction);
  assert.match(error.message, /.+/);
}

const completePolicy = `${JSON.stringify(
  {
    preset: "volatility@1",
    aliases: {
      page: "Client",
      useCase: "Manager",
      rule: "Engine",
      gateway: "ResourceAccess",
      api: "Resource",
      shared: "Utility",
    },
    mappings: [
      { alias: "page", path: "src/page/**" },
      { alias: "useCase", path: "src/use-case/**" },
      { alias: "rule", path: "src/rule/**" },
      { alias: "gateway", path: "src/gateway/**" },
      { alias: "api", path: "src/api/**" },
      { alias: "shared", path: "src/shared/**", package: "@example/shared" },
    ],
    variations: ["clientReadsAccess", "pureEngines", "contextFirewall"],
    overrides: [
      {
        name: "page-reads-api",
        from: "Client",
        to: "Resource",
        effect: "allow",
        reason: "The page renders a public asset.",
      },
    ],
    scopes: [
      { kind: "context", name: "catalog", path: "src/catalog/**" },
      { kind: "shared", path: "src/shared/**" },
      { kind: "unscoped", path: "src/application/**" },
    ],
  },
  null,
  2,
)}\n`;

test("righting inspect reports an incomplete starter without effective rules or project changes", () => {
  const projectDirectory = createProject();
  const policy = '{"preset":"volatility@1","status":"incomplete"}\n';
  const guidance = "# Project guidance\n";

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);
    writeFileSync(resolve(projectDirectory, "AGENTS.md"), guidance);

    const output = assertSuccessEnvelope(run(projectDirectory, "inspect", "--json"));
    assert.deepEqual(output.policy, {
      path: "righting.json",
      status: "incomplete",
      required: incompleteRequirements,
    });
    assert.equal(output.nextAction, "obtain-policy-approval");
    assert.equal("configuration" in output, false);
    assert.equal("effectivePolicy" in output, false);
    assert.equal("capabilities" in output, false);
    assert.deepEqual(output.adapter, { status: "unknown" });
    const humanOutput = run(projectDirectory, "inspect");
    assert.equal(humanOutput.status, 0, humanOutput.stderr);
    assert.match(humanOutput.stdout, /Guide: node_modules\/righting\/docs\/manual-maintainer\.md/);
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), policy);
    assert.equal(readFileSync(resolve(projectDirectory, "AGENTS.md"), "utf8"), guidance);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting inspect reports normalized policy semantics and capability limits without checking ESLint", () => {
  const projectDirectory = createProject();

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), completePolicy);

    const output = assertSuccessEnvelope(run(projectDirectory, "inspect", "--json"));
    assert.deepEqual(output.policy, { path: "righting.json", status: "valid" });
    assert.deepEqual(output.adapter, { status: "unknown" });
    assert.deepEqual(output.configuration, {
      preset: "volatility@1",
      aliases: {
        page: "Client",
        useCase: "Manager",
        rule: "Engine",
        gateway: "ResourceAccess",
        api: "Resource",
        shared: "Utility",
      },
      mappings: [
        { alias: "page", path: "src/page/**" },
        { alias: "useCase", path: "src/use-case/**" },
        { alias: "rule", path: "src/rule/**" },
        { alias: "gateway", path: "src/gateway/**" },
        { alias: "api", path: "src/api/**" },
        { alias: "shared", path: "src/shared/**", package: "@example/shared" },
      ],
      variations: ["clientReadsAccess", "pureEngines", "contextFirewall"],
      overrides: [
        {
          name: "page-reads-api",
          from: "Client",
          to: "Resource",
          effect: "allow",
          reason: "The page renders a public asset.",
        },
      ],
      scopes: [
        { kind: "context", name: "catalog", path: "src/catalog/**" },
        { kind: "shared", path: "src/shared/**" },
        { kind: "unscoped", path: "src/application/**" },
      ],
      protectedDependencies: [{ alias: "shared", role: "Utility", package: "@example/shared" }],
    });
    assert.deepEqual(output.effectivePolicy, {
      allowedDependencies: {
        Client: ["Manager", "Utility", "ResourceAccess", "Resource"],
        Manager: ["Engine", "ResourceAccess", "Utility"],
        Engine: ["Utility"],
        ResourceAccess: ["Resource", "Utility"],
        Resource: ["Utility"],
        Utility: ["Utility"],
      },
    });

    const capabilities = output.capabilities as Array<Record<string, unknown>>;
    assert.deepEqual(
      capabilities.map(({ id, applies, coverage }) => ({ id, applies, coverage })),
      [
        { id: "role-dependency", applies: true, coverage: "lint-enforced" },
        { id: "manager-interaction", applies: true, coverage: "partially-checked" },
        { id: "protected-dependency", applies: true, coverage: "lint-enforced" },
        { id: "context-firewall", applies: true, coverage: "lint-enforced" },
        { id: "design-judgment", applies: true, coverage: "guidance-only" },
      ],
    );
    assert.deepEqual(capabilities[1], {
      id: "manager-interaction",
      applies: true,
      coverage: "partially-checked",
      establishes: ["direct-manager-import-is-forbidden"],
      doesNotEstablish: ["queued-interaction-semantics"],
      adapterRules: ["righting/role-dependency"],
    });
    const humanOutput = run(projectDirectory, "inspect");
    assert.equal(humanOutput.status, 0, humanOutput.stderr);
    assert.match(humanOutput.stdout, /Policy syntax is valid; maintainer approval and active lint enforcement are not checked\./);
    assert.match(humanOutput.stdout, /Adapter activation: unknown \(not checked\)/);
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), completePolicy);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting inspect warns when a declared mapping matches no current project file", () => {
  const projectDirectory = createProject();
  const policy = `${JSON.stringify({
    preset: "volatility@1",
    aliases: { ui: "Client" },
    mappings: [{ alias: "ui", path: "src/missing/**" }],
    extras: {
      domainVocabulary: "righting.json",
      goldenExamples: { policy: "righting.json" },
    },
  })}\n`;

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);

    const output = assertSuccessEnvelope(run(projectDirectory, "inspect", "--json"));
    assert.deepEqual(output.warnings, [
      {
        code: "unmatched-policy-path",
        kind: "mapping",
        name: "ui",
        path: "src/missing/**",
      },
    ]);
    assert.deepEqual(output.enforcementCoverage, {
      mode: "declared-paths-only",
      paths: ["src/missing/**"],
      unchecked: ["files-outside-declared-paths"],
    });
    assert.deepEqual((output.configuration as Record<string, unknown>).extras, {
      domainVocabulary: "righting.json",
      goldenExamples: { policy: "righting.json" },
    });

    const humanOutput = run(projectDirectory, "inspect");
    assert.equal(humanOutput.status, 0, humanOutput.stderr);
    assert.match(humanOutput.stdout, /Source coverage is limited to declared mapping and scope paths; all other files are unchecked\./);
    assert.match(humanOutput.stdout, /Mapping "ui" matches no current project file: src\/missing\/\*\*/);
    assert.match(humanOutput.stdout, /Domain vocabulary: righting\.json/);
    assert.match(humanOutput.stdout, /- policy: righting\.json/);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting inspect --all separates capabilities that are not configured", () => {
  const projectDirectory = createProject();
  const policy = `${JSON.stringify(
    {
      preset: "volatility@1",
      aliases: { page: "Client", useCase: "Manager" },
      mappings: [
        { alias: "page", path: "src/page/**" },
        { alias: "useCase", path: "src/use-case/**" },
      ],
    },
    null,
    2,
  )}\n`;

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);

    const defaultOutput = assertSuccessEnvelope(run(projectDirectory, "inspect", "--json"));
    assert.deepEqual(
      (defaultOutput.capabilities as Array<Record<string, unknown>>).map((capability) => capability.id),
      ["role-dependency", "manager-interaction", "design-judgment"],
    );

    const allOutput = assertSuccessEnvelope(run(projectDirectory, "inspect", "--all", "--json"));
    assert.deepEqual(
      (allOutput.capabilities as Array<Record<string, unknown>>).map(({ id, applies }) => ({ id, applies })),
      [
        { id: "role-dependency", applies: true },
        { id: "manager-interaction", applies: true },
        { id: "design-judgment", applies: true },
      ],
    );
    assert.deepEqual(
      (allOutput.availableCapabilities as Array<Record<string, unknown>>).map(({ id, applies }) => ({ id, applies })),
      [
        { id: "protected-dependency", applies: false },
        { id: "context-firewall", applies: false },
      ],
    );

    const humanOutput = run(projectDirectory, "inspect", "--all");
    assert.equal(humanOutput.status, 0, humanOutput.stderr);
    assert.match(humanOutput.stdout, /Available but unconfigured capabilities/);
    assert.match(humanOutput.stdout, /Adapter activation: unknown/);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting inspect does not claim direct Manager imports are forbidden after an allow override", () => {
  const projectDirectory = createProject();
  const policy = `${JSON.stringify(
    {
      preset: "volatility@1",
      aliases: { useCase: "Manager" },
      mappings: [{ alias: "useCase", path: "src/use-case/**" }],
      overrides: [
        {
          name: "allow-direct-manager-import",
          from: "Manager",
          to: "Manager",
          effect: "allow",
          reason: "The maintainer explicitly permits direct orchestration.",
        },
      ],
    },
    null,
    2,
  )}\n`;

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);

    const defaultOutput = assertSuccessEnvelope(run(projectDirectory, "inspect", "--json"));
    assert.deepEqual(
      (defaultOutput.capabilities as Array<Record<string, unknown>>).map((capability) => capability.id),
      ["role-dependency", "design-judgment"],
    );

    const allOutput = assertSuccessEnvelope(run(projectDirectory, "inspect", "--all", "--json"));
    assert.deepEqual(
      (allOutput.availableCapabilities as Array<Record<string, unknown>>).find(
        (capability) => capability.id === "manager-interaction",
      ),
      {
        id: "manager-interaction",
        applies: false,
        coverage: "partially-checked",
        establishes: ["direct-manager-import-is-forbidden"],
        doesNotEstablish: ["queued-interaction-semantics"],
        adapterRules: ["righting/role-dependency"],
      },
    );
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting exposes only the inspect policy surface, not the retired docs command", () => {
  const projectDirectory = createProject();

  try {
    const result = run(projectDirectory, "docs");
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /Usage: righting init .* righting inspect .* righting baseline/s);
    assert.doesNotMatch(result.stderr, /righting docs/);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});

test("righting inspect returns the structured failure envelope for malformed policies and options", () => {
  const projectDirectory = createProject();
  const policy = '{"preset":"volatility@1","status":"incomplete","aliases":{"page":"Client"}}\n';

  try {
    writeFileSync(resolve(projectDirectory, "righting.json"), policy);

    const malformed = run(projectDirectory, "inspect", "--json");
    assertFailureEnvelope(malformed, "invalid-policy", "righting.json", "repair-policy");
    assert.match((json(malformed).error as { message: string }).message, /may contain only.*preset.*status/i);
    assert.match((json(malformed).error as { message: string }).message, /node_modules\/righting\/docs\/policy-language\.md/);
    assert.equal(readFileSync(resolve(projectDirectory, "righting.json"), "utf8"), policy);

    const humanMalformed = run(projectDirectory, "inspect");
    assert.notEqual(humanMalformed.status, 0);
    assert.match(humanMalformed.stderr, /Repair righting\.json using node_modules\/righting\/docs\/policy-language\.md/);

    writeFileSync(
      resolve(projectDirectory, "righting.json"),
      '{"preset":"volatility@1","aliases":{"page":"client"},"mappings":[{"alias":"page","path":"src/page/**"}]}\n',
    );
    const invalidRole = run(projectDirectory, "inspect", "--json");
    assertFailureEnvelope(invalidRole, "invalid-policy", "righting.json", "repair-policy");
    assert.match(
      (json(invalidRole).error as { message: string }).message,
      /Client, Manager, Engine, ResourceAccess, Resource, Utility/,
    );

    const invalidOptions = run(projectDirectory, "inspect", "--json", "--all", "--all");
    assertFailureEnvelope(invalidOptions, "invalid-options", undefined, "review-command-options");
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
  }
});
