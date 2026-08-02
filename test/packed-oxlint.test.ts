import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { assertCommandSucceeded, packRighting, runCommand } from "./packed-artifact.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");

test("a packed project loads righting/oxlint through its normal pinned Oxlint command", () => {
  const packed = packRighting(repositoryDirectory, "righting-packed-oxlint-");
  const projectDirectory = mkdtempSync(resolve(tmpdir(), "righting-oxlint-consumer-"));

  try {
    writeFileSync(
      resolve(projectDirectory, "package.json"),
      `${JSON.stringify(
        {
          private: true,
          type: "module",
          scripts: { lint: "oxlint --deny-warnings --report-unused-disable-directives src" },
        },
        null,
        2,
      )}\n`,
    );
    assertCommandSucceeded(
      runCommand(projectDirectory, "npm", [
        "install",
        "--save-dev",
        "--save-exact",
        "--ignore-scripts",
        packed.tarball,
        "oxlint@1.75.0",
      ]),
    );
    writeFileSync(resolve(projectDirectory, "righting.json"), '{"preset":"volatility@1","coverage":["src/**/*.js"]}\n');
    writeFileSync(
      resolve(projectDirectory, ".oxlintrc.json"),
      `${JSON.stringify(
        {
          jsPlugins: [{ name: "righting", specifier: "righting/oxlint" }],
          rules: {
            "righting/role-dependency": "error",
            "righting/unresolved-local-import": "error",
            "righting/unclassified-source": "error",
            "righting/ambiguous-source": "error",
            "righting/test-dependency": "error",
          },
        },
        null,
        2,
      )}\n`,
    );
    mkdirSync(resolve(projectDirectory, "src"));
    writeFileSync(resolve(projectDirectory, "src/work.manager.js"), "export const value = 1;\n");
    writeFileSync(
      resolve(projectDirectory, "src/allowed.client.js"),
      'import { value } from "./work.manager.js";\nexport { value };\n',
    );

    const installedResolver = JSON.parse(
      readFileSync(resolve(projectDirectory, "node_modules/oxc-resolver/package.json"), "utf8"),
    ) as { version: string };
    assert.equal(installedResolver.version, "11.24.2");
    assertCommandSucceeded(runCommand(projectDirectory, "npm", ["run", "lint"]));

    writeFileSync(resolve(projectDirectory, "src/view.client.js"), "export const value = 1;\n");
    writeFileSync(
      resolve(projectDirectory, "src/forbidden.manager.js"),
      'import { value } from "./view.client.js";\nexport { value };\n',
    );
    const forbidden = runCommand(projectDirectory, "npm", ["run", "lint"]);
    assert.equal(forbidden.status, 1, `${forbidden.stdout}\n${forbidden.stderr}`);
    assert.match(`${forbidden.stdout}\n${forbidden.stderr}`, /righting\/role-dependency/);

    const packagedAdapter = readFileSync(resolve(projectDirectory, "node_modules/righting/dist/src/oxlint.js"), "utf8");
    assert.doesNotMatch(packagedAdapter, /righting\/core|from ["']\.\/policy\.js["']/);
  } finally {
    rmSync(projectDirectory, { recursive: true, force: true });
    rmSync(packed.directory, { recursive: true, force: true });
  }
});
