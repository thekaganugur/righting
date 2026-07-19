# Define the stable agent setup contract

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 01

## Question

What stable `--json` contract should `init` and `docs` expose for agent providers after the incomplete-policy transition is settled?

Decide the lifecycle states, provenance, explicit prerequisites/next action, schema versioning or compatibility policy, and any migration guidance for consumers of the former `policy.status: "existing"` result. The result must let agents act without parsing prose while never implying approval or inferred architecture.

## Answer

`--json` has a stable, schema-versioned agent contract. It describes only facts Righting can inspect or actions this invocation performed; it never asserts maintainer approval, inferred architecture, adapter configuration, baseline intent, or overall onboarding completion.

Every successful `init` and `docs` response has this common envelope:

```json
{
  "schemaVersion": 1,
  "command": "init",
  "ok": true,
  "policy": {
    "path": "righting.json",
    "status": "incomplete",
    "created": true,
    "required": ["aliases", "mappings", "maintainer-approval"]
  },
  "guidance": { "path": "AGENTS.md", "updated": true },
  "nextAction": "obtain-policy-approval"
}
```

`policy.status` reports policy condition only. Successful results use `incomplete` for the exact starter and `valid` for a structurally valid complete policy. `init` alone includes `policy.created`, which reports whether that invocation created `righting.json`; `docs` omits it because it does not create policies. An existing policy is therefore represented by its actual condition plus `created: false`, not by an `existing` lifecycle state. There is no migration requirement because `existing` has no released consumers.

`required` and `nextAction` appear only while the policy is incomplete. `nextAction: "obtain-policy-approval"` is a structured instruction to work with the maintainer on the candidate policy; it does not claim approval has happened or prescribe a command. A valid policy omits `nextAction`: Righting cannot infer whether an adapter is desired or configured. `init --skills` retains its command-specific `skills` result; other command-specific effects may be added without weakening the common envelope.

Expected failures under `--json` emit JSON and exit non-zero:

```json
{
  "schemaVersion": 1,
  "command": "docs",
  "ok": false,
  "error": {
    "code": "invalid-policy",
    "path": "righting.json",
    "message": "…human-readable remediation…",
    "nextAction": "repair-policy"
  }
}
```

Failure results do not include `policy.status`; `ok: false` and the stable `error.code` are authoritative. Agents branch on structured codes and actions, never prose messages. The deliberate incomplete starter remains a successful result.

`schemaVersion: 1` is a public compatibility promise. Within version 1, fields may be added, but existing fields, enum values and meanings, and required-field semantics do not change. Any breaking shape or semantic change increments the schema version.
