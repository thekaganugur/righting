# Research: Guardrail-plugin composition for generic Righting adapter authoring

## Summary

Generic authoring guidance should **compose the host linter’s rule lifecycle, dependency-node traversal, module-resolution ecosystem, policy matching, and native suppression**, and should use `eslint-plugin-boundaries` for those mechanics on ESLint-compatible hosts only after version-pinned conformance. It should **own a thin Righting mapping layer** for normalized-contract loading/version checks, exact Righting source/scope classification, contract-to-plugin descriptors and policies, stable `righting/*` identities/messages, unresolved-local semantics, capability claims, and the adapter conformance record. File-case plugins are not a substitute for Righting classification and should not be part of the generic path unless a future Righting policy explicitly declares a general case convention.

## Scope and evidence basis

Local implementation evidence reviewed:

- claimed Wayfinder ticket: `.scratch/righting-adapter-authoring/issues/07-evaluate-guardrail-plugin-composition.md`
- delivered project adapter: `/Users/kgnugur/Codes/Personal/uets-to-task/tools/righting-oxlint-plugin.mjs`
- project activation/configuration: `/Users/kgnugur/Codes/Personal/uets-to-task/.oxlintrc.json`, `package.json`, and `righting.json`
- normalized contract and shared classifiers: `src/policy.ts`
- existing composed ESLint adapter: `src/eslint.ts`
- adapter-neutral cases and ESLint black-box tests: `test/conformance-cases.ts` and `test/eslint.test.ts`
- generated capability record: `docs/capabilities.md`

Primary external evidence is cited inline below. “Observed” means direct static inspection of the local files above; no shell execution facility was available in this research run.

## Tested/observed facts

1. **The delivered Oxlint adapter is a small, project-local implementation rather than a composition of an established boundary plugin.** It synchronously runs `righting inspect --json` once at module load, rejects any contract other than `contractVersion: 1`, consumes `contract.configured.coverage`, `contract.effective.conventions`, and `contract.effective.allowedDependencies`, then exports five stable rules: `righting/role-dependency`, `righting/unresolved-local-import`, `righting/unclassified-source`, `righting/ambiguous-source`, and `righting/test-dependency`. (`/Users/kgnugur/Codes/Personal/uets-to-task/tools/righting-oxlint-plugin.mjs`.)

2. **Its dependency-node coverage matches the adapter-neutral forms currently enumerated by Righting.** The implementation visits static imports, named/star re-exports, dynamic imports, and literal `require(...)`; `test/conformance-cases.ts` enumerates the same five forms, including a type-only import fixture. The existing ESLint adapter delegates these forms to `eslint-plugin-boundaries` through `boundaries/dependency-nodes: ["import", "export", "require", "dynamic-import"]`. Those are also the plugin’s documented built-in defaults. [Boundaries settings reference](https://www.jsboundaries.dev/docs/setup/settings/)

3. **The project adapter’s resolver is intentionally narrow.** It resolves relative paths, absolute paths, and Node `package.json#imports` `#` aliases, probing a fixed JS/TS extension list and `index.*`; bare package imports are declared non-local. It does not consume TypeScript `paths`, bundler aliases, workspace resolution, custom resolvers, or Node’s complete conditional exports algorithm. By contrast, Boundaries exposes the `eslint-plugin-import` resolver ecosystem through `import/resolver`; its official Oxlint example says Oxlint activates no resolver by default and warns that unresolved aliases can be silently classified external and skip boundary checks. [Boundaries Oxlint integration commit](https://github.com/javierbrea/eslint-plugin-boundaries/commit/62a6487d77332fd1683ab4d9257554bb3b4a1dce) [Boundaries settings reference](https://www.jsboundaries.dev/docs/setup/settings/)

4. **The local implementation and its delivered test record cover all 36 role pairs from the normalized matrix, but it implements only the capabilities needed by this project-local policy.** It reads `effective.allowedDependencies`, honors canonical/alias role markers, tests, generated markers, composition roots, coverage, and unresolved/unclassified local targets. The project policy has `pureEngines`, a `Client -> Client` override, aliases, generated markers, and composition roots, but no protected packages or context scopes. The delivered adapter contains no translation of `effective.protectedDependencyRules`, `effective.scopeRules`, or `effective.scopeClassification`. Therefore it must not be generalized unchanged into an adapter claiming those applicable capabilities. (`righting.json`; `tools/righting-oxlint-plugin.mjs`; `tools/righting-oxlint-plugin.test.ts`; `src/policy.ts`.)

5. **Righting’s existing ESLint adapter demonstrates the correct composition seam.** `src/eslint.ts` re-exports the established `boundaries.rules.dependencies` implementation under the stable `righting/role-dependency` rule identity, translates normalized role/test/generated/composition-root/scope descriptors and ordered policies into Boundaries configuration, and keeps a small custom `Program` rule for exact Righting source/scope classification. The black-box tests cover every default role edge, every configured dependency form, aliases, variations/overrides/protected dependencies, coverage, ambiguous/unclassified source, test directionality, generated source, composition roots, scopes, and ambiguous scopes. (`src/eslint.ts`; `test/eslint.test.ts`.)

6. **Boundaries already owns the generic hard parts.** Its canonical `dependencies` rule evaluates resolved dependency descriptions, supports ordered policies (last match wins), all origins, unknown locals, internal dependencies, external/core modules, TypeScript import kind, multi-type elements, accumulating file categories, and custom dependency nodes. [Dependencies rule](https://www.jsboundaries.dev/docs/rules/dependencies/) Its resolver setting delegates to `eslint-module-utils`, and the 7.1.0 package carries `@boundaries/elements`, `eslint-import-resolver-node`, `eslint-module-utils`, Handlebars, Chalk, and Micromatch—materially more dependency surface than the delivered adapter’s direct Micromatch dependency. [Boundaries 7.1.0 package manifest](https://github.com/javierbrea/eslint-plugin-boundaries/blob/master/packages/eslint-plugin/package.json)

7. **Unknown-local behavior is not safe by default and requires deliberate Righting mapping.** Boundaries’ dependency rule normally skips unknown targets; `checkUnknownLocals: true` broadens evaluation. Boundaries also provides `no-unknown-dependencies`. Its origin defaults classify unresolvable aliases as external, which can bypass local-boundary policies. [Dependencies rule](https://www.jsboundaries.dev/docs/rules/dependencies/) [Settings reference](https://www.jsboundaries.dev/docs/setup/settings/) The existing Righting ESLint adapter correctly uses `checkUnknownLocals: true`, `default: "disallow"`, and a local unknown-element policy with the stable `righting/unresolved-local-import` message, but resolver configuration remains a project/adapter obligation. (`src/eslint.ts`.)

8. **Oxlint 1.75 can load ESLint-compatible JS plugins, but this surface remains alpha.** Oxlint documents ESLint v9+ compatibility, JS-plugin loading from local or npm specifiers, AST traversal, options, selectors, scope/control-flow APIs, fixes, IDE support, and inline disables. It explicitly labels JS plugins alpha and excludes custom parsers/file formats and type-aware JS-plugin rules. [Oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) The Boundaries project now has an Oxlint integration example using both TypeScript and Oxc import resolvers, but this is integration evidence—not a Righting conformance result for Oxlint 1.75. [Boundaries Oxlint integration commit](https://github.com/javierbrea/eslint-plugin-boundaries/commit/62a6487d77332fd1683ab4d9257554bb3b4a1dce)

9. **The delivered adapter is activated through native Oxlint configuration and therefore receives native suppression mechanics.** `.oxlintrc.json` loads `./tools/righting-oxlint-plugin.mjs`, enables its five rules, and sets `options.respectEslintDisableDirectives: false`. Oxlint’s own `oxlint-disable`, `-enable`, `-line`, and `-next-line` directives remain the recommended native forms; ESLint spellings are separately configurable, and unused directives can be reported. [Oxlint inline ignore comments](https://oxc.rs/docs/guide/usage/linter/ignore-comments.html) The project’s `npm run lint` passes `--report-unused-disable-directives`, so suppression debt is checked at CLI level. (`package.json`; `.oxlintrc.json`.)

10. **Native suppression still needs scenario-level attestation.** Dependency diagnostics are reported on import/export/call nodes and should align naturally with line/next-line directives. Classification diagnostics are reported on `Program`, so a line-scoped directive may not target them as users expect; file-scoped `/* oxlint-disable righting/unclassified-source */` is the likely escape hatch. This run did not execute suppression fixtures, and no suppression scenario appears in `test/eslint.test.ts`; this remains an evidence gap rather than a failure claim.

11. **Filename-case plugins solve a different problem.** `eslint-plugin-check-file` applies glob-selected case or custom Micromatch patterns to filenames and has a small runtime dependency set (`is-glob`, Micromatch); its package includes an Oxlint example. [check-file rule](https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-naming-convention.md) [check-file manifest](https://github.com/dukeluo/eslint-plugin-check-file/blob/main/package.json) The much more established built-in Oxlint/ESLint option, `unicorn/filename-case`, enforces casing of filenames/directories but intentionally does not infer semantic roles. [Unicorn filename-case](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md) Neither expresses Righting’s semantic OR (“role filename token **or** exact directory segment”), multiple-role ambiguity, tests/generated treatment, composition roots, coverage, or stable classification rule IDs.

## Recommendations: exact compose/own boundary

### Compose

1. **Always compose the host’s native plugin lifecycle and suppression.** Author rules through the host’s supported visitor/report API; do not parse source text or suppression comments in Righting. Configure native unused-disable reporting where available. Preserve a documented suppression example for a dependency diagnostic and a file-level classification diagnostic.

2. **On ESLint and explicitly tested ESLint-compatible hosts, compose `eslint-plugin-boundaries` for:**
   - import/export/`require`/dynamic-import discovery and optional custom dependency nodes;
   - module resolution and resolver extension points;
   - local/external/core origin classification;
   - element/file-category matching and multi-match accumulation;
   - ordered allow/disallow policy evaluation, internal-import handling, and import-kind metadata.

3. **Prefer the same thin wrapper pattern already used by `src/eslint.ts`.** Re-export `boundaries.rules.dependencies` beneath `righting/role-dependency` rather than exposing `boundaries/*` as the policy identity. Pin compatible Boundaries and host versions and run Righting’s black-box suite against that exact tuple. For Oxlint, treat direct Boundaries composition as conditional/experimental until the full Righting suite passes on Oxlint 1.75; the alpha API and resolver behavior justify retaining the validated local implementation as the fallback evidence.

4. **Compose an established filename-case rule only for a separately declared, generic case-style requirement.** Prefer native Oxlint `unicorn/filename-case` when all that is required is casing; use `eslint-plugin-check-file` only when per-glob/custom patterns are genuinely needed. Do not add either as a dependency merely to enforce current Righting role markers.

### Own in the thin Righting mapping layer

1. **Contract consumption and trust boundary:** obtain the normalized contract through a supported Righting API/CLI, validate `contractVersion`, fail closed on malformed/unsupported contracts, and consume effective—not re-derived—semantics.

2. **Exact semantic classification:** use/share `classifySource` and `classifyScope` semantics for coverage, canonical and alias tokens, test/generated treatments, composition roots, ambiguous roles/scopes, and outside-coverage behavior. Plugin descriptors may accelerate dependency classification, but they must not become the source of policy truth.

3. **Contract translation:** generate Boundaries descriptors/categories and ordered policies from `effective.allowedDependencies`, protected-dependency rules, scope rules/classification, and composition-root/test semantics. Keep generated-source role governance intact.

4. **Stable Righting identities and diagnostics:** emit the contract’s `effective.policyRuleIds` (`righting/role-dependency`, `righting/unresolved-local-import`, `righting/test-dependency`, scope IDs, etc.) in diagnostics. A platform/plugin rule name is implementation detail. Where one composed rule implements several policy outcomes, retain explicit Righting IDs in messages/data and test them.

5. **Unresolved-local semantics:** configure a resolver appropriate to the project and test relative imports, extension/index resolution, `package.json#imports`, TS paths, and any bundler/workspace aliases actually claimed. Fail or diagnose when a would-be local alias cannot be resolved; never silently accept it because a dependency library labeled it external.

6. **Capability/support accounting:** only claim capabilities whose applicable scenarios pass. The generic authoring path should own the reusable conformance harness and support record; the composed plugin’s own test suite is necessary integration evidence but cannot attest the Righting contract.

### Do not own

- a second JavaScript/TypeScript parser or ad-hoc source-text import scanner;
- a general resolver framework when the host/plugin ecosystem provides one;
- suppression-comment parsing or legacy-debt bookkeeping outside native mechanisms;
- generic filename casing when it is not part of the normalized contract;
- architecture inference from the repository tree.

## Review findings

1. **High — generic-extraction blocker:** `/Users/kgnugur/Codes/Personal/uets-to-task/tools/righting-oxlint-plugin.mjs` has no protected-dependency or context-firewall translation. It is suitable as the delivered project-local adapter because those features do not apply to this policy, but extracting it unchanged would under-enforce other valid normalized contracts.
2. **High — unresolved-alias bypass risk:** the local resolver recognizes only relative/absolute/`#imports`; a future local-looking TS/bundler/workspace alias would be treated as external and skipped. A composed Boundaries implementation has the same class of risk unless an import resolver is configured, as its official Oxlint example warns.
3. **Medium — extraction gap:** the project-local Oxlint 1.75 tests attest this dogfood adapter, while Righting’s reusable black-box record is still ESLint-specific. Before declaring a centrally supported Oxlint adapter, move the role-edge/form/treatment/unresolved/suppression scenarios into a Righting-owned harness and execute them against the pinned versions.
4. **Medium — alpha compatibility risk:** Oxlint’s JS-plugin API is alpha. Directly composing the heavier Boundaries graph may reduce owned code but increases compatibility and supply-chain surface; support one pinned, conformance-tested host/plugin tuple rather than assuming “ESLint-compatible” means conformance-complete.
5. **Low — classification suppression ergonomics:** `Program`-anchored classification reports may require file-level rather than next-line suppression. Document and test the native form.

## Residual risks and gaps

- No commands were executed in the research subagent environment, so the delivery session’s passing Oxlint 1.75 test/support record was reviewed but not independently rerun there.
- The project-local Oxlint tests establish this dogfood waypoint; extraction still needs to move adapter-neutral scenarios into a Righting-owned reusable conformance surface.
- The official Boundaries Oxlint integration proves load/configuration and resolver usage, not every Righting role-dependency scenario or stable Righting diagnostic identity.
- Exact behavior for non-literal `require`/dynamic imports, import attributes, symlinks, conditional exports, and case-insensitive filesystems remains adapter/resolver-specific and should be either tested or explicitly excluded from claims.

## Sources

### Kept

- [Oxlint JS Plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) — primary compatibility/status/API limits.
- [Oxlint inline ignore comments](https://oxc.rs/docs/guide/usage/linter/ignore-comments.html) — primary suppression and unused-disable behavior.
- [Boundaries dependencies rule](https://www.jsboundaries.dev/docs/rules/dependencies/) — canonical policy/unknown/origin behavior.
- [Boundaries settings reference](https://www.jsboundaries.dev/docs/setup/settings/) — dependency nodes, multi-match classification, resolution, and origin defaults.
- [Boundaries official Oxlint integration commit](https://github.com/javierbrea/eslint-plugin-boundaries/commit/62a6487d77332fd1683ab4d9257554bb3b4a1dce) — direct source evidence for Oxlint loading and resolver caveats.
- [Boundaries 7.1.0 manifest](https://github.com/javierbrea/eslint-plugin-boundaries/blob/master/packages/eslint-plugin/package.json) — direct dependency/version evidence.
- [eslint-plugin-check-file rule](https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-naming-convention.md) and [manifest](https://github.com/dukeluo/eslint-plugin-check-file/blob/main/package.json) — direct naming expressiveness/dependency evidence.
- [Unicorn filename-case](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/filename-case.md) — established/native naming alternative and scope.

### Dropped

- npm summaries and SEO comparison pages — redundant with repository manifests and official docs.
- community `oxlint-plugin-boundaries` and compatibility wrappers — not needed once the maintained Boundaries project supplied an official Oxlint integration example.
- broad Oxlint plugin-compatibility discussion entries — useful leads, but not versioned Righting conformance evidence.
