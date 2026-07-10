---
title: Test-Driven Development
type: concept
domain: tech
lang: en
tags: [testing, tdd, workflow]
status: stable
created: 2026-06-24
updated: 2026-07-01
aliases: [TDD, red-green-refactor]
kb_source: tech/concepts/tdd.md
kb_sha: ac90b437951f90ab92f84c4463258d618d8f6734
---

# Test-Driven Development

## What & why

TDD is the **red → green loop**: write a failing test that specifies one behavior, write just enough code to make it pass, repeat. Refactor once the slice works — never mid-cycle, and never speculatively.

Why we practice it:

- **Design pressure** — code that is testable through its public interface is usually well-shaped code. If a test is hard to write, the design is talking.
- **Regression safety** — every behavior is pinned by an executable specification.
- **Documentation** — a good test suite reads like the spec of the module ("user can checkout with valid cart").

Our [[ddd]] architecture is built to make TDD cheap: every port has a stub, and services are assembled in tests exactly like in production ([[dependency-injection]]).

## The loop

1. **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features (see YAGNI in [[coding-principles]]).
2. **One slice at a time.** One seam, one test, one minimal implementation per cycle.
3. **Vertical slices, not horizontal.** Never write all the tests first and all the implementation after: bulk tests verify *imagined* behavior and freeze a structure you don't understand yet. Each cycle is a [[tracer-bullet|tracer bullet]] that responds to what the last cycle taught you.

## What a good test is

Tests verify **behavior through public interfaces**, never implementation details. The code can change entirely; the tests shouldn't.

```typescript
// GOOD: observable behavior, public API, survives refactors
test("user can checkout with valid cart", async () => {
  const cart = createCart()
  cart.add(product)
  const result = await checkout(cart, paymentMethod)
  expect(result.status).toBe("confirmed")
})

// BAD: implementation detail — breaks on refactor, behavior unchanged
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService)
  await checkout(cart, payment)
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total)
})
```

Characteristics: describes WHAT not HOW; uses the public API only; one logical assertion; the name states a capability.

## Where tests go: seams

A **seam** is the public boundary you test at (see [[deep-modules]]). You can't test everything — agree the seams up front so effort lands on critical paths, not on every internal function.

In our architecture the seams are fixed by convention:

| Seam | Test file |
|---|---|
| Domain transformation methods | `model.test` |
| Each port implementation | `implementation.test` |
| Service public methods (via inject + stubs) | `service.happy/.error/.stress.test` |
| Config parsing/validation | `config.test` |

## Stubbing rules

Stub at **system boundaries only**: external APIs, databases, time, randomness. Our ports sit exactly at those boundaries, so the mandatory stubs of [[ddd]] are the right mocks by construction.

- **Don't assert on call counts or call order** — assert on outcomes through the interface.
- **Don't verify through a side channel** (querying the DB to check a save) — verify through the interface (`getUser(user.id)` after `createUser`).
- A stub of another service's local interface is a stub of *something we own* — keep a few composed integration tests per feature so the wiring itself is exercised.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private functions, breaks on refactor while behavior is unchanged.
- **Tautological** — the expected value is recomputed the way the code computes it (`expect(calculateTotal(items)).toBe(items.reduce(...))`). Expected values come from an independent source of truth: a known-good literal, a worked example, the spec.
- **Horizontal slicing** — all tests first, then all implementation (see the loop above).
- **Coverage worship** — coverage is a byproduct of testing behaviors at seams, not a target to game.

## Related

- [[ddd]] — the architecture that makes TDD cheap (ports, stubs, inject)
- [[deep-modules]] — seams, and why the interface is the test surface
- [[tracer-bullet]] — vertical slices at project scale
- [[coding-principles]] — YAGNI governs the "just enough code" rule

*Source: [Matt Pocock — tdd skill](../../docs/sources/mattpocock-skills/tdd-SKILL.md) (MIT), adapted to our architecture.*
