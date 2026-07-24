# Research contextFirewall adoption signals

Type: research
Labels: wayfinder:research
Status: resolved
Working context: .scratch/context-firewall-adoption/research/bounded-context-evaluation.md
Blocked by:

## Question

What minimal, evidence-backed signals, benefits, costs, and uncertainty should `righting-integrate` surface when recommending that a maintainer omit, consider, or adopt `contextFirewall`, without inferring bounded contexts or conducting boundary design?

## Answer

Use a three-way disposition: **omit** when no approved semantic/ownership boundary exists, **consider with a specialist** when boundary evidence is conflicting or design-heavy, and **propose for approval** only when maintainer-owned context identities and relationships already exist and map unambiguously to source scopes. Directories are corroborating evidence, never policy. The firewall's benefit is continuous static import protection; its costs include false constraints, duplication, and expensive correction when premature boundaries are encoded. See [the research brief](../research/bounded-context-evaluation.md).
