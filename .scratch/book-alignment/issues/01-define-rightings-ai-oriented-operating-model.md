# Define Righting's AI-oriented operating model

Type: grilling
Labels: wayfinder:grilling
Status: resolved

## Question

Righting exists to prevent AI slop and help coding agents produce higher-quality systems. Define the product contract that makes it **AI-oriented, not AI-authoritative**: deterministic tooling proves and enforces what it can; evidence-led coding agents investigate and recommend where proof stops; maintainers retain authority; the repository preserves approved decisions.

Resolve:

1. **Ownership by evidence band:** for each band in the map's reference table, what raw evidence tooling must produce deterministically, what interpretation or process a coding agent owns, what decision remains human, and what artifact preserves it.
2. **Epistemic protocol:** how facts, inferences, recommendations, approvals, and remaining uncertainty are kept distinct; which statements must cite evidence or capability limits.
3. **Everyday agent loop:** how an agent orients, predicts affected roles, implements under hard guardrails, reviews non-enforceable concerns, escalates material decisions, and records only approved conclusions. Define lightweight escalation triggers so ordinary edits do not invoke a full design interrogation.
4. **Durable documentation homes, with one owner per meaning:**
   - `README.md` for the concise product promise and route into the system;
   - an existing design artifact or a focused package reference for the full operating model;
   - `righting inspect --json` and the capability catalog for stable machine facts and proof limits;
   - onboarding references for human/agent handoffs;
   - skill bodies for agent process;
   - policy, ADRs, vocabulary, and golden examples for approved project memory;
   - the managed `AGENTS.md` block stays a minimal policy pointer rather than duplicating package guidance.
5. **Capability vocabulary:** decide whether the capability catalog remains tooling-only or becomes the machine-readable epistemic contract for the whole Righting system. Preserve `establishes` for hard proof; define how it represents agent-assisted investigation, maintainer authority, external runtime evidence, and explicit non-proof. Decide whether broad `design-judgment` remains one capability or later splits into code-shape, volatility-classification, contract-design, use-case-validation, and interaction-semantics capabilities.
6. **Non-goals:** automatic architecture inference or approval, replacing maintainer judgment, generic code-quality scoring, and runtime-proof claims.

End with an implementation-ready documentation and product-surface handoff. Reassess the map's remaining tickets and fog against the decided ownership model rather than letting each rediscover that boundary independently.

## Answer

Righting is **AI-oriented, not AI-authoritative**. Its operating contract has four parties:

1. **`righting.json` declares approved architectural intent.** It is the project-owned source of truth for every Righting-relevant decision, whether an adapter can enforce it or only an agent can use it. Relevant advisory areas explicitly distinguish `declared`, `unresolved`, and `not applicable`. It is not an ADR, evidence archive, approval ledger, architecture score, or proof that code realizes the intent. Candidate recommendations stay outside it until approved.
2. **Deterministic tooling establishes reproducible facts and enforces only approved enforceable declarations.** Stable JSON surfaces own facts agents would otherwise count inconsistently. They do not infer roles, decomposition, runtime semantics, or architectural quality.
3. **Focused agent skills investigate and recommend where proof stops.** They compose around a small documented routing protocol rather than a monolithic daily-review skill. They remain advisory until a maintainer directly affirms a choice.
4. **Maintainers retain architectural authority.** Agents may implement and repair ordinary changes inside approved intent. A direct affirmative response is sufficient approval to change that intent; Righting does not claim to verify approver identity.

### Ownership by evidence band

| Band | Deterministic evidence | Agent responsibility | Maintainer authority | Durable project state |
|---|---|---|---|---|
| 1. Import graph | Policy validation, declared-path coverage, glob expansion, import occurrences, resolution outcomes, and allowed/forbidden edges | Propose mappings and repair violations without inferring that the declared architecture is correct | Approve mappings, classifications, variations, overrides, and other policy changes | Approved declarations in `righting.json`; reproducible diagnostics stay out of permanent documentation |
| 2. Code shape | Raw counts, names, sizes, and contract-shape observations; no scores or guideline failures | Interpret measurements against context and explain which guidelines they may implicate | Approve design changes or deliberate deviations | Approved advisory declarations/status in `righting.json`; vocabulary or golden examples may supply detail |
| 3. Interaction mechanism | Static relationships and code-visible mechanism clues, with explicit non-proof | Gather tests, runtime configuration, or infrastructure evidence; connect it to the static facts and preserve uncertainty | Approve the architectural interpretation | Approved declaration or acknowledged uncertainty in `righting.json`; tests/config remain the natural runtime evidence |
| 4. Decomposition truth | Reproducible Git churn/co-change facts and structural facts | Apply the axes of volatility, distinguish Observed/Projected/Speculative evidence, and recommend classifications | Approve volatility boundaries and role classifications | Approved classifications/status in `righting.json`; vocabulary and ADRs retain their separate semantic/rationale roles |
| 5. Design process | No mechanical proof of process quality | Focused skills facilitate core-use-case, contract, and composition investigations one question at a time | Supply business intent and approve conclusions | Approved declarations/status in `righting.json`; linked semantic inputs such as use cases or golden examples may live in focused artifacts |
| 6. Business alignment | None | Agents may facilitate but never substitute for the human source | Humans own business purpose and prime-directive judgments | Outside this map and never mechanically approved |

### Epistemic protocol

Material reviews and escalations separate:

- **Facts** — cite files, commands, diagnostics, JSON fields, or capability records and their coverage limits.
- **Inferences** — identify supporting facts and reasoning.
- **Recommendations** — state the choice and trade-offs; they are not project truth.
- **Approvals** — require a direct affirmative maintainer response.
- **Uncertainty** — state what remains unknown and what external evidence could resolve it.

Only mechanical claims receive pass/fail results. Advisory capabilities never produce an overall architecture verdict or score. Approval establishes current project intent, not objective proof; contradictory evidence may trigger a fresh maintainer decision.

### Compositional change routing

There is no dedicated everyday orchestration skill. Documentation teaches a small routing protocol: orient from `righting.json` and `righting inspect --json`, predict affected roles and edges, implement under normal guardrails, then compose a focused skill only when a material trigger appears.

Material triggers are:

- policy cannot be satisfied without changing or weakening approved intent;
- a component's established role or responsibility changes;
- a new cross-role or cross-context relationship appears;
- a public contract or core-use-case interaction changes materially;
- evidence conflicts with an approved declaration, ADR, vocabulary term, or golden example; or
- the decision depends on runtime semantics static tooling cannot establish.

A code-shape smell alone triggers a focused investigation, not automatic maintainer escalation. Review skills write durable state only after approval, directly or by composing a recording skill such as domain modeling.

The broad `righting-design-review` is transitional: replace it as capabilities settle with focused `code-shape-review`, `volatility-classification`, `contract-design`, `use-case-validation`, and `interaction-semantics` skills. `improve-codebase-volatility` remains an optional end-to-end composition skill and a reference for evidence tiers, volatility axes, containment framing, vocabulary discipline, and composition validation; adapt those parts into focused packaged skills rather than coupling Righting to the external skill.

### Product and documentation ownership

- **`righting.json`** — current approved Righting-relevant architectural declarations and explicit advisory status. It records what is approved now, not raw evidence or decision history. Concise reasons remain only where needed to understand an exceptional declaration. References belong only when they are semantic inputs to applying a declaration, not provenance links.
- **Package capability catalog** — the machine-readable epistemic contract. It maps declaration kinds to adapter/skill consumers and separately represents deterministic evidence, `establishes`, explicit non-proof, external evidence needs, agent process, and maintainer authority. `establishes` remains reserved for hard proof.
- **`righting inspect --json`** — fast orientation and routing. It joins the project manifest with package capabilities, reports coverage and proof limits, and does not become an all-in-one analyzer.
- **Focused JSON commands/APIs** — reproducible project facts such as candidate-policy validation, glob expansion, import occurrences, resolution, code shape, or history evidence. Exact surfaces are later decisions.
- **`docs/operating-model.md`** — full current human-readable operating contract.
- **`README.md`** — concise promise and route into the system.
- **Onboarding references** — route-specific human/agent handoffs.
- **Skill bodies** — focused investigative processes and completion criteria.
- **ADRs, vocabulary, use-case records, and golden examples** — rationale or semantic detail in their natural forms; every resulting Righting-relevant declaration/status is reflected in `righting.json`.
- **Managed `AGENTS.md` block** — remains the existing minimal pointer to `righting.json`; it does not duplicate package guidance.

### Implementation handoff

1. Broaden the `righting.json` schema from enforceable policy to an approved architecture manifest with typed enforceable/advisory declarations and explicit advisory status.
2. Refactor capability records so declaration consumers, proof, non-proof, external evidence, agent process, and maintainer authority are orthogonal machine-readable meanings; retire broad `design-judgment` as focused capabilities land.
3. Keep `inspect --json` as the joined orientation/routing view and design separate stable evidence surfaces.
4. Add `docs/operating-model.md`, shorten other documents to their single owned meaning, and preserve the minimal managed guidance block.
5. Replace the broad review skill incrementally with focused composable skills, adapting the proven volatility-review patterns where appropriate.
6. Never add automatic architecture inference or approval, generic quality scoring, inferred approval, or Righting-owned runtime-proof claims.
