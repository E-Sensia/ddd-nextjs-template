---
title: Dependency Injection
type: pattern
domain: tech
lang: en
tags: [pattern, dependency-injection, testing]
status: stable
created: 2026-07-01
updated: 2026-07-02
aliases: [Deps struct, FOP, Functional Options Pattern, functional-options-injection]
kb_source: tech/patterns/dependency-injection.md
kb_sha: ac90b437951f90ab92f84c4463258d618d8f6734
---

# Dependency Injection — Deps & Options

## Context

In [[ddd]], services receive everything from outside: domain ports, other services' local interfaces, primitive config values. Three invariants ([[ddd#Dependency injection]]): `main` is the single composition root; a service declares its dependencies in one visible place; a missing dependency fails fast.

What gets injected splits into two kinds with different needs:

- **Required dependencies** — ports and interfaces the service cannot work without.
- **Optional tunables** — timeouts, limits, flags that have sane defaults.

## Solution

**Required dependencies travel in a typed `Deps` object + constructor.** One type documents the whole dependency surface; the compiler (TypeScript object literals) or a lint (`exhaustruct` on Go structs) turns incomplete wiring into a build error — stronger than any runtime validation.

```typescript
// TypeScript
export type OrderServiceDeps = {
  userRepo: UserRepo
  paymentService: PaymentServicePort
  logger: Logger
}

export function createOrderService(
  deps: OrderServiceDeps,
  ...options: Configurator<OrderService>[]
): OrderService {
  return applyOptions(new OrderService(deps), options)
}
```

```go
// Go
type Deps struct {
	Logger     logging.Logger
	Repository session.Repository
}

func New(deps Deps, opts ...Option) *Service { /* assign fields, then apply opts */ }
```

**Optional tunables are functional options** — one `with...`/`With...` function per tunable, applied by the factory after construction. Introduce an option only when a real tunable exists (YAGNI, [[coding-principles]]): most services need none.

```typescript
export const withMaxOrderAmount = (max: number): Configurator<OrderService> =>
  (svc) => { svc.maxOrderAmount = max }
```

**`main` as composition root** — the only place that knows concrete implementations:

```typescript
const orderService = createOrderService(
  { userRepo, paymentService, logger },
  withMaxOrderAmount(cfg.maxOrderAmount),
)
```

Tests make the same call with stubs — an incomplete `Deps` literal does not compile:

```typescript
const svc = createOrderService({
  userRepo: createUserRepoStub({ findById: async () => null }),
  paymentService: createPaymentServiceStub(),
  logger: createLoggerStub(),
})
```

## Consequences

**Pros**

- Completeness enforced by the compiler (TS) or lint (`exhaustruct`, Go) — a missing dependency cannot reach runtime.
- One type documents the service's entire dependency surface — readable in one glance by humans and agents ([[deep-modules]]).
- Production and tests share the same assembly path; wiring stays greppable, no container magic.
- Primitives flow as constructor deps or tunables, so the config never leaks below `main` ([[ddd#Config]]).

**Cons / accepted costs**

- One `with...` function per tunable (rare — most services have none).
- In Go, struct literals don't enforce completeness natively: `exhaustruct` scoped to `Deps` structs is mandatory in the lint config.

## Related

- [[ddd]] — the architecture this pattern serves
- [[ddd-in-typescript]] / [[ddd-in-go]] — per-stack mechanics
- [[deep-modules]] — `Deps` as the documented interface of a service's needs
- [[coding-principles]] — YAGNI governs when a tunable earns its option

*History: this note originally mandated functional options for all dependencies. Unified on `Deps` + options on 2026-07-01, following the go-backend-template review — options are for options.*
