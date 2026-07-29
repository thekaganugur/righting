import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { conformanceScenarioFamilyIds } from "./conformance-cases.js";

const testDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(testDirectory, "../..");

test("documented and executable adapter-conformance scenario families have two-way parity", () => {
  const documentation = readFileSync(resolve(repositoryDirectory, "docs/adapter-conformance.md"), "utf8");
  const documented = [...documentation.matchAll(/^### `([^`]+)`$/gm)].map((match) => match[1]!);
  const registered = Object.values(conformanceScenarioFamilyIds);

  assert.equal(registered.length, 8);
  assert.equal(new Set(registered).size, registered.length, "registered scenario-family IDs must be unique");
  assert.equal(new Set(documented).size, documented.length, "documented scenario-family IDs must be unique");
  assert.deepEqual([...documented].sort(), [...registered].sort());
});
