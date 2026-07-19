# Assess a narrow setup command

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 01, 02, 03

## Question

Does the agreed human-and-agent journey require a new non-interactive setup command, or can improved `init`, discoverable skills, package onboarding, and stable JSON satisfy it more simply?

Define decision criteria, the smallest acceptable command contract if one is justified, and explicit non-goals. Do not introduce an interactive wizard, architecture inference, automatic approval, or lint-config migration.

## Answer

Do not add a v1 setup command. The agreed journey has no remaining safe setup operation for it to own:

- `righting init` creates the exact incomplete starter and minimal `AGENTS.md` policy pointer.
- `righting init --skills` is the explicit, non-interactive opt-in for compatible-agent discovery. Normal human-readable output and package onboarding mention it once.
- Policy decisions and approval belong to the maintainer and `righting-integrate`, which renders the candidate but does not automate approval.
- Replacing the starter with the approved policy is the direct, reviewable policy edit.
- `righting-eslint` separately inspects an existing lint setup, reports prerequisites, proposes the smallest additive patch, and obtains approval. A setup command must not infer, migrate, or configure lint tooling.

A command that applies a supplied policy would duplicate the reviewed `righting.json` replacement and add overwrite/approval ambiguity. A command that configures ESLint would violate the adapter boundary. A TTY prompt for skills would violate non-interactive operation; the explicit `--skills` flag is sufficient.

Showing configured rules alongside their capability classifications is valuable but is not setup: it is read-only, applies after configuration, and has no project write. That question belongs solely to **Assess a read-only policy inspection command**. No new setup command is needed; the v1 command surface remains `init` and `baseline` while the inspection ticket decides any additional read-only surface.
