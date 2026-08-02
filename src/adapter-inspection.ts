import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import type { NormalizedContract } from "./policy.js";

type InspectionResponse = {
  schemaVersion?: number;
  command?: string;
  ok?: boolean;
  policy?: { status?: string };
  contract?: NormalizedContract;
  error?: { message?: string };
};

function fail(message: string): never {
  throw new Error(`Righting adapter: ${message}`);
}

export function loadNormalizedContract(projectDirectory: string): NormalizedContract {
  const cli = fileURLToPath(new URL("./cli.js", import.meta.url));
  const inspection = spawnSync(process.execPath, [cli, "inspect", "--json"], {
    cwd: projectDirectory,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 10_000,
  });
  if (inspection.error !== undefined) {
    fail(`could not run righting inspect --json: ${inspection.error.message}`);
  }

  let response: InspectionResponse;
  try {
    response = JSON.parse(inspection.stdout) as InspectionResponse;
  } catch {
    fail("righting inspect --json did not return JSON.");
  }
  if (inspection.status !== 0 || response.ok !== true) {
    fail(response.error?.message ?? "righting inspect --json failed.");
  }
  if (response.schemaVersion !== 1) {
    fail(`unsupported inspection schemaVersion ${String(response.schemaVersion)}; expected 1.`);
  }
  if (response.command !== "inspect" || response.policy?.status !== "valid" || response.contract === undefined) {
    fail("righting inspect --json must return a valid normalized contract.");
  }
  if (response.contract.contractVersion !== 2) {
    fail(`unsupported contractVersion ${String(response.contract.contractVersion)}; expected 2.`);
  }
  return response.contract;
}
