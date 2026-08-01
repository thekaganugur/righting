---
status: accepted
---

# Use the normalized contract seam with a reference interpreter

Supported guardrail adapters consume the versioned normalized contract from `righting inspect --json`; that contract remains authoritative. JavaScript and TypeScript adapters may additionally use the narrow public `righting/contract` reference interpreter for source classification, while native resolution, capability checks, diagnostics, suppression, and black-box conformance remain adapter-owned. Packaged adapters share inspection acquisition and validation only through private plumbing. This reduces avoidable same-ecosystem semantic drift without coupling the cross-language adapter seam to Righting's TypeScript core.

## Considered options

Direct core imports were rejected because they create a second, language-specific adapter seam. Independently reimplementing classification in every adapter was rejected for JavaScript and TypeScript because it adds drift without native-tool benefit. A public Node contract loader was deferred until an external consumer demonstrates that the CLI seam is insufficient.
