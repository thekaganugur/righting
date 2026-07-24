import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { inspectPolicy } from "../src/inspect.js";
import {
  classifyScope,
  classifySource,
  normalizePolicy,
  readPolicySource,
  roles,
  type NormalizedContract,
} from "../src/policy.js";

function policy(source: object, projectDirectory: string) {
  return readPolicySource(JSON.stringify(source), resolve(projectDirectory, "righting.json"));
}

function project(): string {
  return mkdtempSync(resolve(tmpdir(), "righting-contract-"));
}

const fixturePolicyPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/contract-consumers/righting.json",
);

test("coding-agent and minimal-adapter consumers receive the same fixture contract", () => {
  const expected = JSON.parse(
    readFileSync(resolve(dirname(fixturePolicyPath), "expected-contract.json"), "utf8"),
  ) as NormalizedContract;
  const inspection = inspectPolicy(fixturePolicyPath);
  assert.ok("contract" in inspection);
  assert.deepEqual(inspection.contract, expected);

  const minimalAdapter = (contract: NormalizedContract) => ({
    files: contract.configured.coverage,
    clientTargets: contract.effective.allowedDependencies.Client,
    protectedResource: contract.effective.protectedDependencyRules[0],
    clientSuffixes: contract.effective.conventions.roles.Client.filenameSuffixes,
  });
  assert.deepEqual(minimalAdapter(inspection.contract), {
    files: ["src/**/*.ts"],
    clientTargets: ["Manager", "Utility"],
    protectedResource: {
      package: "@example/database",
      role: "Resource",
      allowedFrom: ["ResourceAccess"],
      forbiddenFrom: ["Client", "Manager", "Engine", "Resource", "Utility"],
      policyRuleId: "righting/role-dependency",
    },
    clientSuffixes: [".client.", ".screen."],
  });
  assert.deepEqual(classifySource(expected, "src/home.screen.ts"), {
    kind: "role",
    role: "Client",
    test: false,
    generated: false,
    editable: true,
  });
});

test("the minimal complete policy normalizes to the standalone adapter-neutral contract", () => {
  const directory = project();
  try {
    const contract = normalizePolicy(policy({ preset: "volatility@1", coverage: ["src/**/*.ts"] }, directory));

    assert.equal(contract.contractVersion, 1);
    assert.equal(contract.preset, "volatility@1");
    assert.deepEqual(contract.roles, roles);
    assert.deepEqual(contract.configured, {
      coverage: ["src/**/*.ts"],
      aliases: [],
      generated: { filenameMarkers: [], directorySegments: [] },
      protectedDependencies: [],
      variations: [],
      overrides: [],
      scopes: [],
      compositionRoots: [],
      guidance: {},
    });
    assert.deepEqual(contract.effective.allowedDependencies.Client, ["Manager", "Utility"]);
    assert.deepEqual(contract.effective.conventions.roles.Client, {
      filenameSuffixes: [".client."],
      directorySegments: ["clients"],
    });
    assert.deepEqual(contract.effective.conventions.tests, {
      filenameMarkers: [".test.", ".spec."],
      directorySegments: ["test", "tests", "__tests__"],
    });
    assert.deepEqual(contract.effective.conventions.generated, {
      filenameMarkers: [".generated."],
      directorySegments: ["generated"],
    });
    assert.deepEqual(contract.effective.conventions.compositionRoots, ["composition-root"]);
    assert.ok(contract.effective.policyRuleIds.includes("righting/unclassified-source"));
    assert.ok(contract.effective.capabilities.every((capability) => !("adapterRules" in capability)));
    assert.ok(contract.effective.evidenceLimits.includes("files-outside-coverage"));
    assert.equal(JSON.parse(JSON.stringify(contract)).contractVersion, 1);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("normalization retains configured provenance and derives deterministic effective semantics", () => {
  const directory = project();
  try {
    writeFileSync(resolve(directory, "CONTEXT.md"), "# Vocabulary\n");
    const contract = normalizePolicy(
      policy(
        {
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
          variations: ["clientReadsAccess", "pureEngines", "contextFirewall"],
          overrides: [
            {
              name: "client-reads-resource",
              from: "Client",
              to: "Resource",
              effect: "allow",
              reason: "Approved read model.",
            },
          ],
          scopes: [
            { kind: "context", name: "orders", path: "src/orders/**" },
            { kind: "shared", path: "src/shared/**" },
            { kind: "unscoped", path: "src/application/**" },
          ],
          compositionRoots: ["main", "bootstrap"],
          guidance: { domainVocabulary: "CONTEXT.md", goldenExamples: {} },
        },
        directory,
      ),
    );

    assert.deepEqual(contract.configured.aliases, [
      {
        name: "screen",
        role: "Client",
        filenameSuffixes: [".screen."],
        directorySegments: ["screens"],
      },
    ]);
    assert.deepEqual(contract.configured.protectedDependencies, [{ package: "@example/db", role: "Resource" }]);
    assert.deepEqual(contract.effective.protectedDependencyRules, [
      {
        package: "@example/db",
        role: "Resource",
        allowedFrom: ["Client", "ResourceAccess"],
        forbiddenFrom: ["Manager", "Engine", "Resource", "Utility"],
        policyRuleId: "righting/role-dependency",
      },
    ]);
    assert.deepEqual(contract.effective.allowedDependencies.Client, ["Manager", "Utility", "ResourceAccess", "Resource"]);
    assert.deepEqual(contract.effective.allowedDependencies.Engine, ["Utility"]);
    assert.deepEqual(contract.effective.conventions.roles.Client, {
      filenameSuffixes: [".client.", ".screen."],
      directorySegments: ["clients", "screens"],
    });
    assert.deepEqual(contract.effective.conventions.compositionRoots, ["composition-root", "main", "bootstrap"]);
    assert.deepEqual(contract.effective.scopeClassification, {
      multipleMatches: { effect: "error", policyRuleId: "righting/ambiguous-scope" },
      noMatches: "outside-declared-scopes",
    });
    assert.deepEqual(contract.effective.scopeRules, [
      {
        policyRuleId: "righting/cross-context-dependency",
        effect: "disallow",
        from: { scope: "context" },
        to: { scope: "context", relation: "different" },
      },
      {
        policyRuleId: "righting/shared-to-context-dependency",
        effect: "disallow",
        from: { scope: "shared" },
        to: { scope: "context" },
      },
      {
        policyRuleId: "righting/role-dependency",
        effect: "allow",
        from: { scope: "unscoped" },
        to: { scope: "context" },
      },
      {
        policyRuleId: "righting/role-dependency",
        effect: "allow",
        from: { scope: "context", role: "Client" },
        to: { scope: "context", relation: "same", role: "Client" },
      },
      {
        policyRuleId: "righting/role-dependency",
        effect: "allow",
        from: { scope: "context", role: "Client" },
        to: { scope: "shared", role: "Client" },
      },
    ]);
    assert.deepEqual(classifyScope(contract, "src/orders/create.manager.ts"), { kind: "context", name: "orders" });
    assert.deepEqual(classifyScope(contract, "src/other/create.manager.ts"), { kind: "outside-declared-scopes" });
    const ambiguousScopeContract = normalizePolicy({
      ...policy(
        {
          preset: "volatility@1",
          coverage: ["src/**/*.ts"],
          variations: ["contextFirewall"],
          scopes: [
            { kind: "context", name: "orders", path: "src/orders/**" },
            { kind: "shared", path: "src/**" },
            { kind: "unscoped", path: "application/**" },
          ],
        },
        directory,
      ),
    });
    assert.deepEqual(classifyScope(ambiguousScopeContract, "src/orders/create.manager.ts"), {
      kind: "violation",
      ruleId: "righting/ambiguous-scope",
      scopes: ["orders", "shared"],
    });
    assert.equal(contract.effective.capabilities.find(({ id }) => id === "context-firewall")?.applies, true);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("classification applies coverage, aliases, ambiguity, and explicit source treatments", () => {
  const directory = project();
  try {
    const contract: NormalizedContract = normalizePolicy(
      policy(
        {
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
          compositionRoots: ["main"],
        },
        directory,
      ),
    );

    assert.deepEqual(classifySource(contract, "lib/page.client.ts"), { kind: "outside-coverage" });
    assert.deepEqual(classifySource(contract, "src/page.client.ts"), {
      kind: "role",
      role: "Client",
      test: false,
      generated: false,
      editable: true,
    });
    assert.deepEqual(classifySource(contract, "src/screens/page.ts"), {
      kind: "role",
      role: "Client",
      test: false,
      generated: false,
      editable: true,
    });
    assert.deepEqual(classifySource(contract, "src/page.screen.test.ts"), {
      kind: "role",
      role: "Client",
      test: true,
      generated: false,
      editable: true,
    });
    assert.deepEqual(classifySource(contract, "src/generated/page.client.ts"), {
      kind: "role",
      role: "Client",
      test: false,
      generated: true,
      editable: false,
    });
    assert.deepEqual(classifySource(contract, "src/main.ts"), {
      kind: "composition-root",
      test: false,
      generated: false,
      editable: true,
    });
    assert.deepEqual(classifySource(contract, "src/plain.ts"), {
      kind: "violation",
      ruleId: "righting/unclassified-source",
    });
    assert.deepEqual(classifySource(contract, "src/engines/page.client.ts"), {
      kind: "violation",
      ruleId: "righting/ambiguous-source",
      roles: ["Client", "Engine"],
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("project generated conventions preserve generated composition-root treatment", () => {
  const directory = project();
  try {
    const contract = normalizePolicy(
      policy(
        {
          preset: "volatility@1",
          coverage: ["source/**/*.ts"],
          generated: {
            filenameMarkers: [".auto."],
            directorySegments: ["autogen"],
          },
          compositionRoots: ["catalog-map"],
        },
        directory,
      ),
    );

    assert.deepEqual(contract.configured.generated, {
      filenameMarkers: [".auto."],
      directorySegments: ["autogen"],
    });
    assert.deepEqual(classifySource(contract, "source/catalog-map.auto.ts"), {
      kind: "composition-root",
      test: false,
      generated: true,
      editable: false,
    });
    assert.deepEqual(classifySource(contract, "source/autogen/catalog.client.ts"), {
      kind: "role",
      role: "Client",
      test: false,
      generated: true,
      editable: false,
    });
    assert.deepEqual(classifySource(contract, "source/catalog.auto.ts"), {
      kind: "violation",
      ruleId: "righting/unclassified-source",
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the removed mapping policy has no compatibility parser", () => {
  const directory = project();
  try {
    assert.throws(
      () =>
        policy(
          {
            preset: "volatility@1",
            aliases: { screen: "Client" },
            mappings: [{ alias: "screen", path: "src/**" }],
          },
          directory,
        ),
      /unsupported property "mappings"/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
