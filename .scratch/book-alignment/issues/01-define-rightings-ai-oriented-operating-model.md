# Define Righting's AI-oriented operating model

Type: grilling
Labels: wayfinder:grilling
Status: open

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
