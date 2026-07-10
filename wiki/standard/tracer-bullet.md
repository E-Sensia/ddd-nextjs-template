---
title: Tracer Bullet
type: concept
domain: tech
lang: en
tags: [workflow, architecture]
status: stable
created: 2026-07-01
updated: 2026-07-01
aliases: [tracer bullets, walking skeleton]
kb_source: tech/concepts/tracer-bullet.md
kb_sha: ac90b437951f90ab92f84c4463258d618d8f6734
---

# Tracer Bullet

## What & why

From *The Pragmatic Programmer*: to hit a target in the dark, fire tracer rounds and adjust — don't compute the perfect trajectory upfront. In code: build a **thin, end-to-end slice that works for real** — entry point → service → domain → real infrastructure — then flesh it out layer by layer.

Tracer code is **not throwaway**: it is the skeleton of the final system, written at production quality but minimal in scope. What it buys:

- The architecture is validated on day one (all layers exist, all boundaries are crossed for real).
- Integration risks (auth, DB, deployment) surface first, not last.
- There is always a demoable, testable system.

## Tracer bullet vs prototype

| | Tracer bullet | Prototype |
|---|---|---|
| Intent | skeleton of the real system | answer one design question |
| Code fate | kept and grown | **deleted** (or the *answer* absorbed) |
| Quality | production conventions, tested | no tests, no error handling, marked as throwaway |
| Persistence | real infrastructure | in-memory by default |

If you're unsure whether a state model or a UI "feels right", build a prototype: throwaway from day one, clearly named as such, one command to run, delete when the question is answered. The only durable artifact of a prototype is the **answer** (capture it in a commit message, ADR or issue). Never let a prototype quietly become production code.

## In our architecture

The first slice of any repo following [[ddd]] is a tracer bullet:

```
main (wiring) → config → 1 route/action → 1 mapper → 1 service (inject + with...)
→ 1 domain category (model + 1 port) → 1 real implementation + 1 stub
→ the 3 service test files + model.test
```

One feature, wired for real, deployed if possible. Every later feature widens the bullet instead of inventing new structure. The E-Sensia template repos (`ddd-nextjs-template`, `go-backend-template`) exist precisely to make the tracer bullet the starting point.

## In the TDD loop

[[tdd]] applies the same idea at micro scale: each red → green cycle is a tracer bullet — one vertical slice of behavior, adjusted from what the previous cycle taught you. Never slice horizontally (all domain first, then all services, then all server).

## Pitfalls

- Gold-plating the first slice instead of keeping it thin (see YAGNI in [[coding-principles]]).
- A prototype masquerading as a tracer bullet — throwaway code silently promoted to production.
- A tracer bullet on stubs only: the point is to cross **real** boundaries (real DB, real deploy target) at least once.

## Related

- [[ddd]] — the layer structure the bullet traverses
- [[tdd]] — vertical slices at test scale
- [[coding-principles]] — YAGNI keeps the slice thin

*Sources: The Pragmatic Programmer (Hunt & Thomas) ; [Matt Pocock — prototype skill](../../docs/sources/mattpocock-skills/prototype-SKILL.md) (MIT) for the prototype contrast.*
