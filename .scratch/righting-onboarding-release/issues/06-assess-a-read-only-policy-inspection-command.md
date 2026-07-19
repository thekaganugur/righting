# Assess a read-only policy inspection command

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 03, 04

## Question

Should Righting add a read-only command that presents the configured policy alongside the applicable package-owned capability classifications and limitations?

Decide whether it provides enough non-duplicative value beyond `righting.json` and discoverable skills, its audience and command name, its human and JSON output contract, and its explicit non-goals. It must not modify project files, infer architecture, claim approval or runtime proof, or become an interactive setup workflow.

## Answer

Add `righting inspect` as a read-only policy interpretation command. It has a distinct job from setup, skills, raw `righting.json`, and future health checks: compose this project’s configured policy with Righting-owned capability data so maintainers and compatible agents can see what the policy means and what evidence it can provide.

Default human output is a compact policy card with:

1. the policy condition;
2. configured aliases, mappings, variations, scopes, and overrides;
3. the effective role relationships and configured protections; and
4. the applicable capability claims, each showing its coverage, established static evidence, and unproven limits.

`righting inspect --all` adds a clearly separate list of available-but-unconfigured capabilities. The default lists only claims that apply to the current effective policy.

`righting inspect --json` uses the existing public envelope and a normalized inspection view:

```json
{
  "schemaVersion": 1,
  "command": "inspect",
  "ok": true,
  "policy": { "path": "righting.json", "status": "valid" },
  "configuration": { "preset": "volatility@1", "aliases": {}, "mappings": [] },
  "effectivePolicy": { "allowedDependencies": {} },
  "capabilities": [
    {
      "id": "manager-interaction",
      "applies": true,
      "coverage": "partially-checked",
      "establishes": ["direct-manager-import-is-forbidden"],
      "doesNotEstablish": ["queued-interaction-semantics"],
      "adapterRules": ["righting/role-dependency"]
    }
  ]
}
```

Capability entries use stable Righting semantic IDs, not native ESLint identifiers alone. Each record owns its coverage classification (`lint-enforced`, `partially-checked`, or `guidance-only`), established and unproven claims, and corresponding adapter diagnostics. This data is package-owned and is the sole source used by inspection, skills, and package documentation. Human prose is rendered from the structured records; agents branch on the codes.

Inspection makes three truth domains explicit:

- **policy semantics** are definitive: the command computes the configured policy’s effective meaning;
- **adapter capability** is definitive about Righting: adapter diagnostic mappings show evidence available when that adapter is integrated; and
- **project enforcement status** is deliberately unknown: inspection does not scan ESLint configuration, run lint, or say the adapter is active.

An exact incomplete starter is a successful inspection result with `policy.status: "incomplete"`, requirements, and `nextAction: "obtain-policy-approval"`; it renders no effective rules. A malformed non-starter returns the established structured error envelope and a non-zero exit.

`inspect` never writes project files, alters policy, installs skills, configures or migrates lint tooling, infers architecture, witnesses approval, establishes runtime behavior, or becomes an interactive workflow. A possible future health surface may assess actual adapter integration, but is outside this command.
