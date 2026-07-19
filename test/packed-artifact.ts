import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, lstatSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import type { CommandResult } from "./json-contract.js";

export function runCommand(projectDirectory: string, command: string, arguments_: string[]): CommandResult {
  return spawnSync(command, arguments_, { cwd: projectDirectory, encoding: "utf8", input: "" }) as unknown as CommandResult;
}

export function assertCommandSucceeded(result: CommandResult): void {
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}

export function packRighting(repositoryDirectory: string, prefix: string): { directory: string; tarball: string } {
  const directory = mkdtempSync(resolve(tmpdir(), prefix));
  const packed = runCommand(repositoryDirectory, "npm", ["pack", "--json", "--pack-destination", directory]);
  assertCommandSucceeded(packed);
  const filename = (JSON.parse(packed.stdout) as Array<{ filename: string }>)[0]?.filename;
  if (filename === undefined) {
    throw new Error("npm pack did not report a tarball.");
  }
  return { directory, tarball: resolve(directory, filename) };
}

export function createPackedProject(tarball: string, fixtureDirectory: string, prefix: string): string {
  const projectDirectory = mkdtempSync(resolve(tmpdir(), prefix));
  cpSync(fixtureDirectory, projectDirectory, { recursive: true });
  assertCommandSucceeded(
    runCommand(projectDirectory, "npm", ["install", "--save-dev", "--no-package-lock", "--include=dev", "--ignore-scripts", tarball]),
  );
  assert.equal(lstatSync(resolve(projectDirectory, "node_modules/righting")).isSymbolicLink(), false);
  return projectDirectory;
}

export function righting(projectDirectory: string, ...arguments_: string[]): CommandResult {
  return runCommand(projectDirectory, "npx", ["righting", ...arguments_]);
}
