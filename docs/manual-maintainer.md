# Manual maintainer route

This route needs no agent skills. Righting records only the policy you approve; it does not choose roles, mappings, or adapter work for you.

1. Install Righting and initialize the project:

   ```sh
   npm install --save-dev righting
   npx righting init
   npx righting inspect
   ```

   `init` writes the exact incomplete starter and a short managed pointer in `AGENTS.md`. The starter is intentionally not enforceable.

2. Use the [policy language reference](policy-language.md) to decide local aliases, mappings, and only the variations, scopes, overrides, and protected dependencies that apply. Righting does not recommend a folder layout or role assignment.

3. Render the exact replacement `righting.json`, review it, and record explicit maintainer approval in your issue, PR, or other integration record. Replace the starter only after approval; remove `"status": "incomplete"` rather than extending it.

4. Inspect the replacement:

   ```sh
   npx righting inspect
   ```

   Inspection reports normalized policy semantics and applicable [capability limits](capabilities.md). It does not check adapter activation, lint results, approval provenance, or runtime behavior.

5. If ESLint enforcement is separately wanted and the project already has a supported flat config, follow the [additive ESLint route](eslint.md). Approve adapter changes and any [legacy-debt](legacy-debt.md) adoption separately from policy approval.
