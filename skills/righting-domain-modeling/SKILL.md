---
name: righting-domain-modeling
description: Build and sharpen a project's domain model. Use when the user wants to pin down domain terminology or a ubiquitous language, record an architectural decision, or when another skill needs to maintain the domain model.
---

# Domain Modeling

Actively build and sharpen the project's domain model as you design. This is the *active* discipline — challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `CONTEXT.md` for vocabulary is not this skill — that's a one-line habit any skill can do. This skill is for when you're changing the model, not just consuming it.)

## Before exploring

Read the root `CONTEXT-MAP.md` when present and then each applicable `CONTEXT.md`; otherwise read the root `CONTEXT.md`. When a map does not clearly place the current topic, ask before modeling it. Read relevant system-wide and applicable context-specific ADRs for the area. If these files do not exist, proceed silently.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with the existing language in `CONTEXT.md`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y — which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account' — do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code

When the user states how something works, check whether the code agrees. If you find a contradiction, surface it: "Your code cancels entire Orders, but you just said partial cancellation is possible — which is right?"

### Update domain documents inline

When a term is resolved, update its applicable `CONTEXT.md` immediately. When context ownership or a cross-context relationship is resolved, update the root `CONTEXT-MAP.md` immediately. Use [CONTEXT-FORMAT.md](./CONTEXT-FORMAT.md) for both formats and file placement.

`CONTEXT.md` is a glossary: keep implementation details, specifications, scratch notes, and implementation decisions in their authoritative homes.

### Offer ADRs sparingly

When a decision may need durable rationale, read [ADR-FORMAT.md](./ADR-FORMAT.md) completely and apply both its eligibility test and format. Offer the ADR only when that test qualifies the decision.
