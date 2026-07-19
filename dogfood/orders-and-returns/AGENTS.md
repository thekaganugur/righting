# Orders and returns guidance

Keep project-owned delivery instructions here.

<!-- righting:managed:start -->
## Righting policy guidance

`righting.json` selects `volatility@1`.

### Local aliases

- `Screen` (Client) — `src/orders/screen/**`, `src/returns/screen/**`.
- `Workflow` (Manager) — `src/orders/workflow/**`, `src/returns/workflow/**`.
- `Rules` (Engine) — `src/orders/rules/**`, `src/returns/rules/**`.
- `Gateway` (ResourceAccess) — `src/orders/gateway/**`, `src/returns/gateway/**`.
- `Api` (Resource) — `src/orders/api/**`, `src/returns/api/**`.
- `Shared` (Utility) — `src/shared/**`.

## Enforced boundaries

The ESLint adapter lint-enforces the configured role edges for mapped code. Other mapped role dependencies are forbidden unless a configured variation or override changes them.

- `Client` → `Manager`, `Utility`
- `Manager` → `Engine`, `ResourceAccess`, `Utility`
- `Engine` → `ResourceAccess`, `Utility`
- `ResourceAccess` → `Resource`, `Utility`
- `Resource` → `Utility`
- `Utility` → `Utility`

### Configured variations

- `contextFirewall`.

### Context firewall

- `context: orders`: `src/orders/**`
- `context: returns`: `src/returns/**`
- `shared`: `src/shared/**`
- `unscoped`: `src/application/**`

Contextual code may use shared code when its role edge is allowed. Contextual Clients may compose same-context and shared Clients; unscoped code may wire context entry points. Cross-context and shared-to-context dependencies are lint-enforced as forbidden.

## Rule coverage

- **lint-enforced** — role dependencies, protected Resource and Utility packages, and unresolved local imports across imports, exports/re-exports, `require`, dynamic imports, and type-only imports.
- **lint-enforced** — cross-context and shared-to-context dependencies when `contextFirewall` is configured.
- **partially checked** — direct Manager-to-Manager source imports are prohibited, but static analysis cannot prove that a permitted Manager interaction is queued.
- **guidance only** — role responsibilities, real volatility, contract quality, runtime behavior, and use-case validity require design judgment.

## ESLint adapter limitations

- It requires an existing modern ESLint flat config and does not install or migrate lint tooling, rewrite lint scripts, or add typed-lint analysis.
- Static dependency evidence cannot prove runtime behavior or queue semantics.
- Righting has no per-file or per-line waiver mechanism; policy-wide variations, overrides, and native legacy-debt suppressions are deliberate exceptions.

## Agent skills

Run `righting init --skills` to create relative symlinks to packaged Righting skills in `.agents/skills` for compatible agents. It never replaces a project-owned skill with the same name.

## Design review

Use `righting-design-review` for an opt-in advisory review. It examines the policy and relevant code, asks focused questions, and reports evidence, risks, open questions, and static-analysis limits. It does not score work or change policy, CI, or project files automatically.
<!-- righting:managed:end -->
