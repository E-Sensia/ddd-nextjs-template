---
title: Deep Modules
type: concept
domain: tech
lang: en
tags: [architecture, design]
status: stable
created: 2026-07-01
updated: 2026-07-01
aliases: [seam, depth, deep module]
kb_source: tech/concepts/deep-modules.md
kb_sha: 40cd8fcc1429bcdfcf4100af4330391e872a2c9c
---

# Deep Modules

## What & why

From Ousterhout (*A Philosophy of Software Design*): a module is **deep** when a lot of behavior sits behind a small interface, **shallow** when the interface is nearly as complex as the implementation. Depth is what makes code cheap to use (callers learn little, get much) and cheap to maintain (change concentrates in one place).

```
Deep (aim for this)            Shallow (avoid)
┌───────────────┐              ┌────────────────────────────┐
│ small interface│             │      large interface       │
├───────────────┤              ├────────────────────────────┤
│               │              │    thin pass-through       │
│  lots of      │              └────────────────────────────┘
│  behavior     │
└───────────────┘
```

## Vocabulary

Use these terms exactly — consistent language is the point:

| Term | Meaning |
|---|---|
| **Module** | anything with an interface and an implementation — a function, class, package, or tier-spanning slice |
| **Interface** | *everything* a caller must know: signature, invariants, error modes, ordering, configuration — not just the type |
| **Seam** | the place where behavior can be swapped without editing code there (Feathers); where the interface lives |
| **Adapter** | a concrete thing satisfying an interface at a seam (a Postgres repo, an in-memory stub) |
| **Leverage** | what callers get from depth: capability per unit of interface learned |
| **Locality** | what maintainers get: fixes and knowledge concentrate in one place |

## Principles

- **The deletion test.** Imagine deleting the module: if complexity just vanishes, it was a pass-through; if it reappears across N callers, the module was earning its keep.
- **The interface is the test surface.** Callers and tests cross the same seam. Wanting to test *past* the interface means the module is the wrong shape.
- **One adapter means a hypothetical seam; two adapters means a real one.** Don't introduce an interface unless something actually varies across it (typically: production + test).
- **Depth is a property of the interface, not the implementation.** A deep module may be built of small internal parts with internal seams — they just aren't exposed.

## Designing for testability

1. **Accept dependencies, don't create them** — `processOrder(order, paymentGateway)` beats `new StripeGateway()` inside.
2. **Return results, don't produce side effects** — `calculateDiscount(cart): Discount` beats mutating `cart.total`.
3. **Small surface area** — fewer methods and parameters mean fewer tests and simpler setups.

## In our architecture

[[ddd]] hard-codes these principles:

- **Ports are seams**; the mandatory stub rule means every port has its two adapters (production + stub) — the "one adapter" trap is avoided by construction.
- **Design ports as business capabilities, not table CRUD.** `chargePayment(order)` is deep; `findById/save/delete` mirrored on every table is shallow. A port earns its place by hiding a decision, not by wrapping a driver.
- **Services should be deep**: `placeOrder(userId, amount)` hides validation, payment, persistence and logging behind one call. A service that only forwards to a repo fails the deletion test.
- Domain transformation methods follow "return results, don't produce side effects" — pure and unit-testable.

## Pitfalls

- Pass-through services or mappers kept "for consistency" — apply the deletion test.
- One port per table: shallow, high-interface, low-leverage.
- Exposing internal seams in the interface just because tests use them.

## Related

- [[ddd]] — ports and layers as institutionalized seams
- [[tdd]] — tests live at seams; the interface is the test surface
- [[coding-principles]] — design it twice, YAGNI

*Sources: A Philosophy of Software Design (Ousterhout) ; [Matt Pocock — codebase-design skill](../../docs/sources/mattpocock-skills/codebase-design-SKILL.md) (MIT).*
