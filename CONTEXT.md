# Righting

Righting provides a shared architecture-policy language for coding agents and guardrail adapters without coupling architectural intent to an enforcement tool.

## Language

**Righting policy**:
A project's maintainer-owned architectural intent, including its local vocabulary and approved departures from the canonical conventions.
_Avoid_: Lint configuration, inferred architecture

**Incomplete starter**:
The exact non-enforceable placeholder showing that a project has not yet supplied and approved the decisions needed for a normalized contract.
_Avoid_: Partial policy, draft contract

**Normalized contract**:
The versioned, adapter-neutral representation of an approved Righting policy, containing both configured decisions and their effective semantics. It defines durable rules rather than observed project files or adapter mechanics.
_Avoid_: Inspection result, adapter configuration, repository snapshot

**Guardrail adapter**:
A consumer that translates the normalized contract into a platform's native enforcement while owning that platform's diagnostics, suppression, and legacy-debt mechanics.
_Avoid_: Core policy, source of truth

**Coverage area**:
The project-declared source area that Righting must classify as a canonical role or explicit treatment. Source outside it is intentionally unchecked.
_Avoid_: Source inventory, exhaustive role mapping

**Canonical convention**:
A package-owned naming rule that identifies a canonical role or explicit source treatment without prescribing the project's folder architecture.
_Avoid_: Required project vocabulary, exhaustive path mapping

**Alias**:
A project-owned local term and its exact filename tokens, mapped to an existing canonical role without changing that role's behavior.
_Avoid_: Custom role, path mapping, policy override

**Composition root**:
A non-role startup file that assembles role entry points and concrete implementations without containing business behavior.
_Avoid_: Client, seventh role, general dependency exemption
