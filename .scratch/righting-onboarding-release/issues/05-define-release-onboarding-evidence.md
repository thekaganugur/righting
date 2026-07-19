# Define release onboarding evidence

Type: grilling
Labels: wayfinder:grilling
Status: resolved
Blocked by: 01, 02, 03, 04, 06

## Question

What exact acceptance evidence proves the final onboarding journey is release-ready?

Specify two clean automated paths—manual-maintainer and agent-assisted—from installation through approved-policy guidance, how the stable JSON contract is asserted, what the existing dogfood test continues to prove, and the required recorded manual maintainer/agent walkthrough. Produce a test and validation handoff, not the tests themselves.

## Answer

Release readiness requires four complementary evidence layers. They all install a packed npm tarball into an isolated fixture and invoke the packaged CLI through `npx righting`; workspace dependencies and `npm link` are not release evidence.

1. **Shared JSON-contract suite.** Exercise the packaged CLI’s incomplete, valid, and malformed lifecycle states, `inspect`, and `inspect --all`. A reusable assertion validates required `schemaVersion: 1` fields and semantic values while accepting unknown additive fields. It covers structured prerequisites and next actions, command effects, inspection configuration/effective-policy/capability layers, and structured error codes. It does not use whole-response snapshots or prose parsing.
2. **Clean manual-maintainer journey fixture.** Start with no skills. Run `righting init` without input; assert the exact incomplete starter and minimal managed policy pointer, then apply a checked-in pre-approved policy fixture. Re-run `init` to establish the valid state, inspect the policy, and use the documented additive ESLint integration path. The fixture proves that no agent skill is required; it does not pretend to automate the maintainer’s policy decision.
3. **Clean agent-assisted journey fixture.** Start from the same clean installation but use `righting init --skills --json`. Assert the stable JSON contract and relative discoverable skill links. The path consumes JSON only—never human prose—to reach the pre-approved policy fixture and inspection result. It proves the agent-entry contract, not that automation approved policy; the real approval interaction belongs in the walkthrough record.
4. **Shared dogfood enforcement-and-repair fixture.** Retain the real Orders/Returns fixture after policy approval. It proves additive ESLint wiring against an existing modern flat config and unchanged lint script; approved native legacy-debt capture and baseline migration; an actionable ordinary boundary failure; a policy-guided repair; a normal baseline result; and green unchanged CI. First-run route assertions move out of this fixture.

Human-readable `inspect` output has semantic automated assertions rather than full snapshots: valid output must name policy condition, effective rules, capability coverage, limits, and the explicit adapter-status boundary; `--all` must separate available-but-unconfigured capabilities.

Release additionally requires two versioned Markdown walkthrough records using the packed artifact:

- **Maintainer-alone:** commands and outcomes from install through starter, manual policy reference, explicit policy approval, completed policy, optional supported adapter integration, boundary feedback/repair, and CI; and
- **Maintainer-with-agent:** the same route plus `--skills` discovery, the maintainer’s explicit approval of the rendered candidate policy, and separately approved adapter patch.

Each record captures package artifact/version, starting fixture, commands and exit outcomes, changed files, approval evidence where applicable, lint/baseline/CI results, static-analysis limits, and friction observed. Video, transcript, or signoff may supplement these records but cannot replace them.

A release passes only when the contract suite, both clean journey fixtures, the shared dogfood repair fixture, and both walkthrough records succeed. This evidence establishes a non-interactive, reviewable onboarding route and static source-level feedback; it does not prove inferred architecture, automatic approval, runtime behavior, or queued interaction semantics.
