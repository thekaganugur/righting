# Research an evidence-led bounded-context design method

Type: research
Labels: wayfinder:research
Status: resolved
Working context: researcher run `62535405-f120-4407-944d-230034fec1f7`
Blocked by:

## Question

What is the smallest defensible, primary-source-backed method a Righting specialist can use to form educated bounded-context proposals from an existing repository, challenge poor or missing boundaries with a maintainer, model context relationships, and decide when those approved boundaries can or cannot map safely to `contextFirewall` scopes?

## Answer

Use a maintainer-approved, evidence-led strategic design loop: separate semantic and organizational evidence from repository realization evidence; map current terrain; propose a few coarse boundary cards with counterevidence, confidence, and a conservative alternative; resolve one explicit maintainer choice at a time; then record the approved contexts, relationships, and migration delta.

Treat strategic approval and firewall readiness as separate gates. Produce a candidate fragment only when current source paths map the approved contexts exactly and honestly to non-overlapping context, shared, and unscoped rules and the installed CLI validates the candidate. Otherwise return `contextFirewall: omit for now` with the failed conditions. Single-context and coarse or muddy outcomes remain valid.

Research artifact: [Evidence-led bounded-context design method](../research/bounded-context-design-method.md). The researcher process failed after producing no protocol-level final response, but its complete cited artifact was recovered from run `62535405-f120-4407-944d-230034fec1f7`.
