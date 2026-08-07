---
name: righting-module-design
description: Vocabulary layer for shaping an already selected Module's Interface, Implementation, and Seam. Use when another skill needs deep-Module vocabulary, or when the user asks about Module shape rather than candidate discovery, acceptance, or migration.
---

# Module Design

This skill is the vocabulary layer beneath Module-design workflows. It does not own candidate discovery, design acceptance, or migration planning.

Design **deep Modules**: a lot of behavior behind a small Interface, placed at a clean Seam, testable through that Interface. The aim is Leverage for callers, Locality for maintainers, and testability for everyone.

## Before exploring

Read the root `CONTEXT-MAP.md` when present and then each applicable `CONTEXT.md`; otherwise read the root `CONTEXT.md`. Read relevant ADRs for the area. If these files do not exist, proceed silently.

## Glossary

Use these terms exactly. The discovery vocabulary from *Righting Software* has two scoped translations:

**Component** _(method term)_ — a volatility-bearing unit during discovery. When the workflow accepts that unit as durable architecture ownership, model it as an Architecture Module.

**Contract** _(method term)_ — one public face of a Component. During Module design, translate each Contract to a cohesive facet of the Module's one conceptual Interface.

**Module** — anything with an Interface and an Implementation. Deliberately scale-agnostic: a function, class, package, or tier-spanning slice. _Avoid_: unit, service. Use Component only for the discovery term above.

**Architecture Module** — a Module whose boundary encapsulates evidenced volatility and change ownership. Selection makes module-first organization the target. An accepted Architecture Module is realized under one project-conventional module root: the folder or package containing its Implementation. Volatility justifies the boundary; the module root makes it navigable. Routes, features, domain entities, and directories are evidence, not boundary rules.

**Interface** — everything a caller must know to use the Module correctly: the type signature, but also invariants, ordering constraints, error modes, required configuration, and performance characteristics. One conceptual Interface may expose several cohesive facets or entry points. _Avoid_: API, signature (too narrow — they refer only to the type-level surface).

**Implementation** — what's inside a module, its body of code. Distinct from **Adapter**: a thing can be a small adapter with a large implementation (a Postgres repo) or a large adapter with a small implementation (an in-memory fake). Reach for "adapter" when the seam is the topic; "implementation" otherwise.

**Depth** — leverage at the interface: the amount of behaviour a caller (or test) can exercise per unit of interface they have to learn. A module is **deep** when a large amount of behaviour sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation.

**Seam** _(Michael Feathers)_ — a place where you can alter behaviour without editing in that place; the *location* at which a module's interface lives. Where to put the seam is its own design decision, distinct from what goes behind it. _Avoid_: boundary (overloaded with DDD's bounded context).

**Adapter** — a concrete thing that satisfies an interface at a seam. Describes *role* (what slot it fills), not substance (what's inside).

**Leverage** — what callers get from depth: more capability per unit of interface they learn. One implementation pays back across N call sites and M tests.

**Locality** — what maintainers get from depth: change, bugs, knowledge, and verification concentrate in one place rather than spreading across callers. Fix once, fixed everywhere.

## Physical realization

Volatility determines the Architecture Module; the folder never determines the volatility. From selection onward, the target is **module-first**:

```text
<project-conventional module root>/
├── capture.manager.ts
├── pricing.engine.ts
├── orders.access.ts
└── capture.manager.test.ts
```

Group by module root first and retain Righting roles with canonical filename suffixes inside it. Do not require a literal `src/modules/` parent: a project may use a top-level folder, package, or another consistent root convention.

A current or planned file belongs under the root when its responsibility or knowledge changes with the Module's volatility. This includes internal Adapters and Interface-level tests. The only outside-root categories are module-neutral source, composition roots, and host-required entrypoints. A shared location is reserved for responsibility independent of the volatility. A host-required entrypoint stays thin and reaches the Module through its Interface. Being used by multiple Modules is not enough to make code module-neutral; it may instead belong to one Module and serve the others through that Interface.

Global role folders such as `managers/`, `engines/`, or `access/` may describe a legacy layout, but they are not the target organization for an accepted Architecture Module. Incremental migration is allowed, but the Module is only partially realized while known volatility-coupled Implementation remains outside its root without one of the explicit reasons above.

## Deep vs shallow

**Deep module** = small interface + lots of implementation:

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

**Shallow module** = large interface + little implementation (avoid):

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

When designing an interface, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Principles

- **Depth is a property of the Interface, not the Implementation.** A deep Module can be internally composed of small, mockable, swappable parts that stay outside the Interface. It may have private internal Seams as well as the external Seam at its Interface.
- **The deletion test.** Imagine deleting the Module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **The Interface is the acceptance surface.** Callers and behavior-level tests cross the external Seam. Focused Implementation tests may use private internal Seams when they add unique diagnostic coverage; they do not widen the Interface.
- **Effects and dependencies stay hidden.** Expose effectful business behavior through the Interface with observable outcomes. Configure dependencies at a composition root or internal Seam rather than making callers supply them for testability.

## Relationships

- A **Module** has one complete conceptual **Interface**; coherent facets are views within it, not automatically separate Modules.
- **Depth** is a property of a **Module**, measured against its **Interface**.
- A **Seam** is where a **Module**'s **Interface** lives.
- An **Adapter** sits at a **Seam** and satisfies the **Interface**.
- **Depth** produces **Leverage** for callers and **Locality** for maintainers.

## Rejected framings

- **Depth as ratio of implementation-lines to interface-lines** (Ousterhout): rewards padding the implementation. We use depth-as-leverage instead.
- **"Interface" as the TypeScript `interface` keyword or a class's public methods**: too narrow — interface here includes every fact a caller must know.
- **"Boundary"**: overloaded with DDD's bounded context. Say **seam** or **interface**.

## Going deeper

- **Deepening a cluster given its dependencies** — see [DEEPENING.md](DEEPENING.md): dependency categories, seam discipline, and replace-don't-layer testing.
- **Exploring alternative Interfaces** — see [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md): use fresh-context independent designs when delegation is available, or a constrained sequential comparison otherwise, then compare on Depth, Locality, and Seam placement.
