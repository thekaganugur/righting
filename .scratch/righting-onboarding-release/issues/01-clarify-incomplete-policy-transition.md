# Clarify the incomplete-policy transition

Type: grilling
Labels: wayfinder:grilling
Status: resolved

## Question

What is the exact, safe transition from the `righting init` starter policy to an approved complete policy?

Resolve the policy representation and user-facing wording so a maintainer or agent cannot reasonably retain the starter `status: "incomplete"` while adding aliases and mappings. Decide whether the existing marker is removed during replacement, represented differently, or requires a new narrow command/state; preserve explicit maintainer approval and no architecture inference.

## Answer

Separate policy validity from human approval.

`righting init` creates exactly the two-field starter `{ "preset": "volatility@1", "status": "incomplete" }`. That marker is legal only in that untouched starter and blocks enforcement. The maintainer or compatible agent must render the exact candidate policy and obtain explicit maintainer approval in the integration record (for example, a Wayfinder resolution, issue, or PR) before writing it.

The approved candidate then replaces—not extends—the starter. A complete policy omits `status`; there is no `status: "complete"`, approval metadata, or activation command. Righting validates that the resulting policy is structurally complete and valid, but never claims it can establish who approved it. ESLint adapter configuration remains a separately approved action.

If `status: "incomplete"` appears with aliases, mappings, or any other configuration, validation must fail with a precise remediation: an incomplete starter may contain only `preset` and `status`; after approval, replace it with the complete policy and remove the marker. Initial guidance must likewise say that enforcement is blocked, the maintainer must approve the exact aliases/mappings and applicable variations/scopes, and the starter must be replaced rather than appended to before running `righting docs`.

This keeps a Wayfinder-style human decision record while allowing BMad-style workflows to manage the checkpoint without making Righting depend on BMad or a second lifecycle artifact. Stable machine-readable setup-output details remain within the scope of **Define stable agent setup contract**.
