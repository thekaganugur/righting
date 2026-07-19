import assert from "node:assert/strict";

export type CommandResult = { status: number | null; stdout: string; stderr: string };
export type Json = Record<string, unknown>;

export function json(result: CommandResult): Json {
  assert.notEqual(result.stdout, "", result.stderr);
  return JSON.parse(result.stdout) as Json;
}

export function assertSuccessEnvelope(result: CommandResult, command: string, status: string): Json {
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, command);
  assert.equal(output.ok, true);
  assert.equal((output.policy as Json).status, status);
  return output;
}

export function assertFailureEnvelope(result: CommandResult, command: string, code: string, nextAction: string): Json {
  assert.notEqual(result.status, 0);
  assert.equal(result.stderr, "");
  const output = json(result);
  assert.equal(output.schemaVersion, 1);
  assert.equal(output.command, command);
  assert.equal(output.ok, false);
  assert.equal((output.error as Json).code, code);
  assert.equal((output.error as Json).nextAction, nextAction);
  return output;
}
