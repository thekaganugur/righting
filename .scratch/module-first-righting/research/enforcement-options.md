# Module-first enforcement options

## Question

How can Righting keep Architecture Module roots primary and Righting role suffixes secondary without encoding one framework's folder layout?

## Findings

- `eslint-plugin-boundaries` can classify a module root as an element, capture its identity, classify role suffixes as file categories, and apply dependency policies across both axes. Public-entry restrictions can use `fileInternalPath`. Its built-in unknown-file rule is insufficient by itself because a file known on only one axis is still known; Righting would need a companion classification rule requiring both declarations. Sources: [classification](https://www.jsboundaries.dev/docs/classification/), [elements](https://www.jsboundaries.dev/docs/classification/elements/), [dependencies](https://www.jsboundaries.dev/docs/rules/dependencies/), [no-unknown-files](https://www.jsboundaries.dev/docs/rules/no-unknown-files/).
- Oxlint 1.75 can express the full rule through a JavaScript plugin, but that facility is alpha and not semver-stable. Any support claim therefore needs an exact pinned tuple and black-box conformance. Native `no-restricted-imports` can protect stable specifiers but cannot compare resolved importer and target module identities. Sources: [JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins.html), [writing plugins](https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html), [no-restricted-imports](https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-imports.html).
- Node package `exports` protects public subpaths only when an Architecture Module is a real package; it does not protect ordinary same-package relative imports. TypeScript `paths` informs resolution but does not rewrite emitted imports or create an entrypoint boundary. Sources: [Node package entry points](https://nodejs.org/api/packages.html#package-entry-points), [TypeScript module resolution](https://www.typescriptlang.org/docs/handbook/modules/reference), [TSConfig paths](https://www.typescriptlang.org/tsconfig/paths.html).
- Static tooling can verify declared roots, suffixes, and dependency paths. It cannot establish that a root contains real volatility, a role suffix is truthful, an Interface is deep, or a host-owned exception is justified.

## Decision implication

Tighten the packaged design workflow now: module-first is the mandatory target, every affected file receives an owner and destination, outside-root exceptions are explicit and generic, and incremental migration is reported as partial.

Do not reinterpret contract version 2's role directory segments as Module declarations. A future enforceable contract needs separate maintainer-owned fields for Module identity/root, role, public Interface entrypoints, and host/module-neutral treatments, plus a contract-version change and new adapter conformance scenarios.
