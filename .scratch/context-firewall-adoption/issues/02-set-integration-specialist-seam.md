# Set the integration and specialist seam

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Working context: unclaimed
Blocked by:

## Question

What is the smallest useful responsibility for `righting-integrate` when evaluating `contextFirewall`, and what must it leave to an optional bounded-context specialist?

## Comments

- The maintainer supports a separate optional specialist seam but is concerned that `righting-integrate` itself not become complicated or bloated.
- A repository being declared single-context establishes only that `contextFirewall` is not currently adoption-ready; it does not establish that the existing domain boundary is good or that specialist assessment would be unhelpful.

## Answer

Keep two independent results:

1. **Policy readiness:** propose `contextFirewall` only from maintainer-approved context identities and relationships that map unambiguously to context, shared, and unscoped paths; otherwise omit it from the candidate without making Righting adoption incomplete.
2. **Design suggestion:** regardless of current single- or multi-context declarations, recommend an optional bounded-context specialist when observed model, language, ownership, or collaboration pressure makes the existing boundaries worth reassessing.

`righting-integrate` reports the evidence and these results but never discovers, names, or redesigns contexts. Any necessary maintainer question is asked one at a time with a recommendation and concise pros and cons.
