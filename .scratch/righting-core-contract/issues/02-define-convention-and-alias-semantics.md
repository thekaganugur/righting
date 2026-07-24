# Define convention and alias semantics

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Working context: unclaimed

## Question

Which canonical filename conventions, coverage rules, test/generated/composition-root treatment, and unmatched-file behavior should `volatility@1` own; and exactly how do project aliases extend vocabulary and alternate filename conventions without becoming exhaustive path mappings?

## Answer

`volatility@1` owns additive, token-based conventions inside project-declared coverage:

- Coverage is a small set of broad, project-relative source patterns such as `src/**/*.ts`, not an inventory of role paths. Files outside coverage are explicitly unchecked.
- Canonical role suffixes and directory segments are both active and may be mixed in one project:
  - Client: `.client.` and `clients/`
  - Manager: `.manager.` and `managers/`
  - Engine: `.engine.` and `engines/`
  - ResourceAccess: `.access.` and `access/`
  - Resource: `.resource.` and `resources/`
  - Utility: `.utility.` and `utilities/`
- Multiple matches for the same canonical role are valid. Matches for different roles are an ambiguity error; no convention takes precedence.
- Project aliases add local vocabulary plus exact filename-suffix and directory-segment tokens mapped to one canonical role. Alias tokens apply throughout declared coverage; they are not globs or path-specific mappings.
- Canonical conventions remain active when aliases exist. Aliases never create a role, alter role behavior, or override dependency semantics. Multiple aliases for one role are peers rather than primary and secondary names.
- Tests use canonical `.test.` / `.spec.` markers or `test/`, `tests/`, and `__tests__/` directory segments. They remain visible in coverage, but their outgoing dependencies are not role-enforced; governed production files cannot depend on them.
- Generated source uses the `.generated.` marker or `generated/` directory segment. Projects may add exact generated filename markers and directory segments for evidenced generator vocabulary; these tokens are additive, not globs or path mappings, and do not supply a role or composition-root treatment. Generated status tells coding agents not to edit the file, but does not exempt it: the file must also resolve to a canonical role or an explicit composition root. Generated role source follows that role's dependency rules; a generated composition root keeps composition-root wiring semantics.
- A canonical `composition-root` filename identifies a visible non-role wiring file. It may depend on role entry points, governed role files cannot depend on it, and project convention tokens may add names such as `main` or `bootstrap` without creating a role. A composition root may also be generated.
- Any other source file inside coverage that resolves to neither a role nor an explicit treatment produces the stable `righting/unclassified-source` policy violation. It does not invalidate or remove the normalized contract.
- Classification results are inspection and adapter evidence, never contract snapshots.

This target convention model is independent of the migration behavior for existing mapping-based policies, which remains owned by [Choose compatibility for existing policies](03-choose-existing-policy-compatibility.md).

Context: [`CONTEXT.md`](../../../CONTEXT.md).
