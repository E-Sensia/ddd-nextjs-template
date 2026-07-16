---
title: Coding Principles
type: concept
domain: tech
lang: en
tags: [principles, design]
status: stable
created: 2026-07-01
updated: 2026-07-01
aliases: [YAGNI, DRY, KISS, boy scout rule]
kb_source: tech/concepts/coding-principles.md
kb_sha: 40cd8fcc1429bcdfcf4100af4330391e872a2c9c
---

# Coding Principles

Heuristics, not laws. They pull against each other (DRY vs YAGNI, KISS vs deep design) — the skill is knowing which one wins in context. Target: **engineered enough** — no hacks, no premature abstractions.

## YAGNI — You Aren't Gonna Need It

Don't build for imagined futures: no speculative flexibility, config flags nobody asked for, or generic frameworks for a single case. In our terms: no `with...` option without a caller, no port without a real second adapter (see the one-adapter rule in [[deep-modules]]), no "we might need it later" branch in a service.

*Tension*: YAGNI applies to speculative **features and abstractions**, not to the non-negotiables — tests, error handling and the [[ddd]] structure are never "YAGNI'd away".

## DRY — Don't Repeat Yourself

DRY is about duplicated **knowledge** (a business rule, a format, a constant), not visually similar code. Two pieces of code that look alike but change for different reasons are *not* duplication.

- **Rule of three**: tolerate the second occurrence; abstract at the third, when the shape is proven.
- The mirror failure is **premature abstraction** — "duplication is far cheaper than the wrong abstraction" (Sandi Metz). Un-abstracting is much harder than de-duplicating.
- Business rules live once, in the domain ([[ddd]]) — that's DRY at architecture scale.

## KISS — Keep It Simple

Prefer the boring, explicit solution. **Explicit over clever**: code is read far more often than written. If a junior (or an AI agent) can't follow the control flow, it's too clever. Complexity must buy something measurable; otherwise simplify.

## Design it twice

Your first design is unlikely to be the best one (Ousterhout). Before committing to a non-trivial interface, sketch 2–3 radically different shapes (minimal surface / maximal flexibility / optimized for the common caller) and compare on depth, locality and seam placement ([[deep-modules]]). Minutes at design time, months saved at maintenance time.

## Boy scout rule

Leave the code cleaner than you found it — rename the confusing variable, add the missing test, delete the dead branch. **Scope discipline**: cleanups stay small and inside the code you're already touching; don't smuggle a refactor into a feature PR. Surgical diffs keep reviews honest.

## Principle of least astonishment

Code should do what its name and shape promise — no hidden side effects, no `getUser` that also writes, no flag that reverses a function's meaning. Conventions ([[ddd]] structure, naming, file layout) exist so that *nothing about where code lives is ever surprising*.

## Related

- [[deep-modules]] — the design vocabulary behind "design it twice" and YAGNI-for-seams
- [[tdd]] — "just enough code to pass" is YAGNI in the loop
- [[ddd]] — the architecture that fixes where things live

*Sources: The Pragmatic Programmer ; A Philosophy of Software Design ; Sandi Metz, "The Wrong Abstraction".*
