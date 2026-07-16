---
title: DDD in TypeScript
type: convention
domain: tech
lang: en
tags: [typescript, nextjs, ddd]
status: stable
created: 2026-07-01
updated: 2026-07-16
aliases: [TS DDD]
kb_source: tech/conventions/typescript/ddd-in-typescript.md
kb_sha: 40cd8fcc1429bcdfcf4100af4330391e872a2c9c
---

# DDD in TypeScript

## Rule

Every TypeScript repo implements the constitution [[ddd]] with the structure and idioms below. Three non-negotiables on top of the generic architecture:

- **Composition over inheritance** — no `class extends` (single exception: `extends Error` for typed errors); interfaces are plain object types, implemented as object literals returned by factory functions.
- **Domain and services are pure TypeScript** — zero dependency on React, Next.js or any framework. Only `server/` knows the framework.
- **`strict: true`, and no `any`** — external data enters as `unknown` and is validated at the edge with zod schemas in mappers ([[ddd#Validation & invariants]]).

## Stack

| Concern | Choice |
|---|---|
| Package manager | PNPM |
| Linting / formatting | ESLint + Prettier |
| Testing | Vitest 4 (new repos; Jest tolerated on existing) |
| Shape validation (edge only) | Zod v4 (Standard Schema — swappable for Valibot if bundle-critical) |
| Frontend only | React + Tailwind CSS + shadcn/ui + custom components |
| Frontend + backend | Next.js (App Router) + Tailwind CSS + shadcn/ui + custom components |
| Front/back communication | Next.js Server Actions (`"use server"`) |
| Dependency injection | Typed `Deps` object + constructor ([[dependency-injection|options]] for tunables only) |

**Baseline (July 2026):** TypeScript ≥ 6 (run `typescript@rc` in CI — the TS 7 Go-native compiler, ~10x typecheck, is at RC with GA imminent), Next.js ≥ 16, React 19, pnpm 10, Vitest 4.

## The TypeScript toolbox

How each concept of [[ddd]] maps onto what the language gives us:

| Architecture concept | TypeScript tool |
|---|---|
| Domain objects ([[ddd#The 3 layers]]) | `type` aliases — plain data, no classes |
| Distinct identifiers ([[ddd#The rules at a glance]] #6) | branded types (`UserId`, not `string`) |
| Mutually exclusive states | discriminated unions, not boolean flags |
| Ports / seams ([[deep-modules]]) | object types of functions |
| Implementations & adapters | factory functions returning object literals |
| Stubs ([[tdd]]) | factories with `Partial<Port>` overrides |
| Services ([[ddd#Services]]) | classes (no `extends`), `readonly` fields assigned from a typed `Deps` object |
| Expected errors ([[ddd#Error handling]]) | named `extends Error` classes + stable codes |
| Wiring ([[ddd#Dependency injection]]) | `Deps` object + constructor — compiler-enforced completeness; `with...` options for tunables |
| Shape validation at the edge ([[ddd#Validation & invariants]]) | zod v4 schemas in mappers — schema + inferred type in one place |

## Project structure (Next.js)

`server/` **is** the Next.js app; domain, services, config and utils live outside it — the tree instantiates [[ddd#Canonical project structure]], and the first slice of a new repo is a [[tracer-bullet]]:

```
project/
├── CONTEXT.md                        # domain glossary
├── docs/adr/                         # decision records
├── migrations/                       # versioned schema migrations
├── main.ts                           # composition root, wiring
├── config/
│   ├── config.ts                     # Config class + parsing + validation
│   └── config.test.ts
├── utils/
│   ├── injection/inject.ts           # Configurator type + applyOptions (tunables)
│   └── testutils/index.ts
├── domain/
│   ├── shared/types.ts               # branded ids, foundational objects
│   └── user/                         # one folder per business capability
│       ├── model.ts                  # objects + methods + ports
│       ├── model.test.ts
│       ├── postgres-repo/
│       │   ├── implementation.ts
│       │   └── implementation.test.ts
│       └── stub/implementation.ts
├── services/
│   └── order/
│       ├── interfaces/
│       │   └── payment-service/
│       │       ├── interface.ts      # local contract
│       │       └── stub.ts
│       ├── service.ts
│       ├── inject.ts
│       ├── service.happy.test.ts
│       ├── service.error.test.ts
│       └── service.stress.test.ts
└── server/                           # THIS IS the Next.js app
    ├── app/                          # App Router (layout.tsx, page.tsx, ...)
    ├── components/                   # ui/ (shadcn/ui) + custom components
    ├── actions/                      # server actions ("use server")
    ├── mappers/                      # DTO <-> domain + error mapping
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

## Layer idioms

### Utils — injection: `Deps` + options

Implements [[ddd#Dependency injection]] via [[dependency-injection]]: required dependencies travel in a typed `Deps` object — **an incomplete literal does not compile**, no runtime validation needed. Functional options exist only for tunables:

```typescript
// utils/injection/inject.ts
export type Configurator<T> = (instance: T) => void

export function applyOptions<T>(instance: T, options: Configurator<T>[]): T {
  for (const configure of options) {
    configure(instance)
  }
  return instance
}
```

### Domain — branded ids and shared types

Implements "make illegal states unrepresentable" ([[ddd#Domain]]). No library — a brand is one line:

```typescript
// domain/shared/types.ts
export type UserId = string & { readonly __brand: "UserId" }
export const asUserId = (raw: string): UserId => raw as UserId

export type TransactionId = string & { readonly __brand: "TransactionId" }
export const asTransactionId = (raw: string): TransactionId => raw as TransactionId
```

`placeOrder(userId, transactionId)` with swapped arguments now fails to compile.

### Domain — `model.ts`: objects, pure methods, ports

Objects are `type`s, methods are pure exported functions (tested in `model.test.ts` — [[ddd#Test strategy]]), ports are object types of functions shaped by their consumers, not by tables ([[deep-modules]]):

```typescript
// domain/user/model.ts
import { UserId } from "../shared/types"

export type User = {
  id: UserId
  email: string
  name: string
  createdAt: Date
}

// --- Methods (pure, testable) ---
export function isUserActive(user: User, now: Date, maxInactiveDays: number): boolean {
  const diffDays = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= maxInactiveDays
}

// --- Ports (interfaces) ---
export type UserRepo = {
  findById: (id: UserId) => Promise<User | null>
  save: (input: CreateUserInput) => Promise<User>
}
```

Invariants live in smart constructors next to the type — a domain object that exists is valid, services never re-check ([[ddd#Validation & invariants]]):

```typescript
// domain/shared/types.ts — a value object with its smart constructor
export type Email = string & { readonly __brand: "Email" }
export function createEmail(raw: string): Email | null {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw) ? (raw as Email) : null
}
```

Pure methods are tested flat, with independent expected values (no recomputation — [[tdd]] "tautological" anti-pattern):

```typescript
// domain/user/model.test.ts
describe("isUserActive", () => {
  it("returns false past the inactivity window", () => {
    const user: User = { ...baseUser, createdAt: new Date("2025-01-01") }
    expect(isUserActive(user, new Date("2025-03-01"), 30)).toBe(false)
  })
})
```

### Domain — concrete implementation: factory function

One subfolder per implementation; a factory returns an object literal satisfying the port. Rows come back as `unknown` and are narrowed — never `any`:

```typescript
// domain/user/postgres-repo/implementation.ts
export function createPostgresUserRepo(pool: Pool): UserRepo {
  return {
    findById: async (id) => {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [id])
      return result.rows.length === 0 ? null : mapRowToUser(result.rows[0])
    },
    // ...
  }
}

function mapRowToUser(row: unknown): User {
  const r = row as Record<string, unknown>   // narrowed once, at the boundary
  return {
    id: asUserId(String(r.id)),
    email: String(r.email),
    name: String(r.name),
    createdAt: new Date(String(r.created_at)),
  }
}
```

Timeouts and retries belong here, tuned by injected primitives — never inside a service ([[ddd#Operational contract]]).

### Domain — stub: defaults + `Partial` overrides

Every port ships a stub ([[ddd#Domain]]): sensible defaults, overridable per test — this is what makes [[tdd]] cheap:

```typescript
// domain/user/stub/implementation.ts
export function createUserRepoStub(overrides?: Partial<UserRepo>): UserRepo {
  return {
    findById: overrides?.findById ?? (async () => ({ ...defaultUser })),
    save: overrides?.save ?? (async (input) => ({ ...defaultUser, ...input })),
  }
}
```

### Domain — an observability port: logging

Logging (like metrics and tracing) is a port injected into services, never a global ([[ddd#Observability]]). The stub records entries so tests can assert on outcomes:

```typescript
// domain/logging/model.ts
export type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
}
```

```typescript
// domain/logging/stub/implementation.ts
export function createLoggerStub(): Logger & { entries: LogEntry[] } {
  const entries: LogEntry[] = []
  const log = (level: LogLevel) =>
    (message: string, context?: Record<string, unknown>) => {
      entries.push({ level, message, timestamp: new Date(), context })
    }
  return { entries, debug: log("debug"), info: log("info"), warn: log("warn"), error: log("error") }
}
```

### Service — class, typed errors, local interfaces

A service is a class (no `extends`) with public dependency fields and named error classes — the expected errors are part of its interface ([[ddd#Error handling]]). A dependency on another service goes through a **local** interface + stub in `interfaces/` ([[ddd#Services]]): the *contract* belongs to the consumer, the *objects* it carries come from the domain.

```typescript
// services/order/interfaces/payment-service/interface.ts — owned by order, not by payment
import { PaymentResult } from "../../../../domain/payment/model"
import { UserId } from "../../../../domain/shared/types"

export type PaymentServicePort = {
  charge: (userId: UserId, amount: number) => Promise<PaymentResult>
}
```

```typescript
// services/order/interfaces/payment-service/stub.ts
export function createPaymentServiceStub(overrides?: Partial<PaymentServicePort>): PaymentServicePort {
  return {
    charge: overrides?.charge ??
      (async () => ({ success: true, transactionId: asTransactionId("stub-tx-001") })),
  }
}
```

```typescript
// services/order/service.ts
export class OrderNotFoundError extends Error {
  readonly code = "order_not_found"          // stable snake_case code — see [[error-handling]]
  constructor(id: string) {
    super(`Order ${id} not found`)
    this.name = "OrderNotFoundError"
  }
}

export type OrderServiceDeps = {
  userRepo: UserRepo                       // domain port
  paymentService: PaymentServicePort       // local interface
  logger: Logger                           // domain port ([[ddd#Observability]])
}

export class OrderService {
  private readonly userRepo: UserRepo
  private readonly paymentService: PaymentServicePort
  private readonly logger: Logger
  maxOrderAmount: number = 10000           // tunable — default here, overridden via option

  constructor(deps: OrderServiceDeps) {
    this.userRepo = deps.userRepo
    this.paymentService = deps.paymentService
    this.logger = deps.logger
  }

  async placeOrder(userId: UserId, amount: number): Promise<{ transactionId: TransactionId }> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new OrderNotFoundError(userId)
    const result = await this.paymentService.charge(userId, amount)
    if (!result.success) throw new PaymentFailedError(userId)
    return { transactionId: result.transactionId }
  }
}
```

```typescript
// services/order/inject.ts — factory + optional tunables only
export function createOrderService(
  deps: OrderServiceDeps,
  ...options: Configurator<OrderService>[]
): OrderService {
  return applyOptions(new OrderService(deps), options)
}

export const withMaxOrderAmount = (max: number): Configurator<OrderService> =>
  (svc) => { svc.maxOrderAmount = max }
```

A forgotten dependency in the `Deps` literal is a **compile error** — the compiler owns the fail-fast rule of [[ddd#Dependency injection]].

### Service — tests: `.happy` / `.error` / `.stress`

Tests build the `Deps` object inline with stubs — the exact production path ([[ddd#Test strategy]]). Assert on outcomes, never on stub calls ([[tdd]]):

```typescript
// service.happy.test.ts — nominal behaviors (a setup() helper with overrides keeps this terse)
const svc = createOrderService({
  userRepo: createUserRepoStub(),
  paymentService: createPaymentServiceStub(),
  logger: createLoggerStub(),
})
await expect(svc.placeOrder(asUserId("user-1"), 100)).resolves.toMatchObject({ transactionId: "stub-tx-001" })

// service.error.test.ts — expected errors via stub overrides
const svc = createOrderService({
  userRepo: createUserRepoStub({ findById: async () => null }),
  paymentService: createPaymentServiceStub(),
  logger: createLoggerStub(),
})
await expect(svc.placeOrder(asUserId("unknown"), 100)).rejects.toThrow(OrderNotFoundError)

// service.stress.test.ts — technical failures
const svc = createOrderService({
  userRepo: createUserRepoStub({ findById: async () => { throw new Error("Connection reset") } }),
  paymentService: createPaymentServiceStub(),
  logger: createLoggerStub(),
})
// a missing dependency in the Deps literal does not compile — no runtime fail-fast test needed
```

### Server — mappers validate shape, actions never throw across the wire

Next.js hides server error messages in production, so a thrown error reaches the client as an opaque failure. Actions therefore return a **discriminated result union**, and typed errors become stable codes in one place — the TypeScript form of "the server maps errors once, nothing internal leaks" ([[ddd#Error handling]], [[ddd#Validation & invariants]]):

```typescript
// server/mappers/order.mapper.ts — shape validation at the edge (zod v4)
import { z } from "zod"

const placeOrderSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
})

export function toPlaceOrderInput(raw: unknown): PlaceOrderInput | null {
  const parsed = placeOrderSchema.safeParse(raw)
  if (!parsed.success) return null
  return { userId: asUserId(parsed.data.userId), amount: parsed.data.amount }
}
```

Zod stays confined to `server/mappers/` — the domain never imports a validation library. The Standard Schema spec keeps the library swappable.

```typescript
// server/mappers/errors.mapper.ts — the single error → transport translation
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }          // stable code, never an internal message

export function toActionError(err: unknown, logger: Logger): ActionResult<never> {
  if (err instanceof OrderNotFoundError) return { ok: false, error: err.code }
  if (err instanceof PaymentFailedError) return { ok: false, error: err.code }
  logger.error("unexpected error", { err: String(err) })
  return { ok: false, error: "internal" }
}
```

```typescript
// server/actions/order.actions.ts
"use server"
export async function placeOrderAction(raw: unknown): Promise<ActionResult<PlaceOrderResponse>> {
  const input = toPlaceOrderInput(raw)
  if (!input) return { ok: false, error: "invalid_request" }
  try {
    const result = await getOrderService().placeOrder(input.userId, input.amount)
    return { ok: true, data: toPlaceOrderResponse(result) }
  } catch (err) {
    return toActionError(err, getLogger())
  }
}
```

Classic UI components (button, input, dialog, …) come from [shadcn/ui](https://ui.shadcn.com), added per project via `make ui-add` and generated into `server/components/ui/`. Domain-specific components remain hand-written in `server/components/<name>/` (Tailwind, one folder per component with its test) — see [[component-structure]].

### Config and main

`Config` is a class reading `process.env` with defaults plus a `validate()` that throws on missing/invalid values, tested in `config.test.ts`. **Only `main.ts` imports it** ([[ddd#Config]]) — services receive primitives via `with...`:

```typescript
// config/config.ts
export class Config {
  readonly port = parseInt(process.env.PORT ?? "3000", 10)
  readonly databaseUrl = process.env.DATABASE_URL ?? ""
  readonly logLevel = process.env.LOG_LEVEL ?? "info"
  readonly maxOrderAmount = parseInt(process.env.MAX_ORDER_AMOUNT ?? "10000", 10)

  validate(): void {
    if (!this.databaseUrl) throw new Error("DATABASE_URL is required")
    if (this.port < 1 || this.port > 65535) throw new Error(`Invalid port: ${this.port}`)
  }
}
```

`main.ts` is the composition root and owns the lifecycle ([[ddd#Operational contract]]):

```typescript
// main.ts
let orderService: OrderService
export function getOrderService(): OrderService { return orderService }

export function bootstrap() {
  const cfg = new Config()
  cfg.validate()
  const userRepo = createPostgresUserRepo(createPool(cfg.databaseUrl))
  const logger = createConsoleLogger(cfg.logLevel)
  orderService = createOrderService(
    {
      userRepo,
      paymentService: createPaymentService(cfg.paymentApiUrl),
      logger,
    },
    withMaxOrderAmount(cfg.maxOrderAmount),
  )
}
bootstrap()
```

## Rationale

Applies [[ddd]] to TypeScript with the language's cheapest tools: `type` + factory + object literal instead of class hierarchies, brands instead of naked strings, unions instead of thrown surprises across the wire. Keeping `server/` as the only framework-aware layer means domain and services survive any frontend migration.

## Tooling

- `pnpm` 10 for everything (no npm/yarn) — lifecycle scripts blocked by default is a supply-chain win.
- `tsconfig`: `strict: true`, `erasableSyntaxOnly: true` (bans enums/namespaces/parameter properties — our idioms already comply; keeps code Node-type-stripping compatible), `verbatimModuleSyntax: true`.
- TypeScript 6 pinned; `typescript@rc` (TS 7 Go-native) in a CI job until GA, then upgrade — same semantics, ~10x typecheck.
- ESLint + Prettier in CI, with `@typescript-eslint/no-explicit-any` as an error (Biome re-evaluated yearly; rejected for now — no framework plugins).
- Vitest 4 (ESM/TS native, Jest-compatible API); test files next to the code, suffixed `.test.ts` (plus `.happy`/`.error`/`.stress` for services).
- React Compiler (`reactCompiler: true` in `next.config.ts`) — automatic memoization of the component library, zero code change.
- `using` declarations (`Symbol.dispose`) for disposable resources — pools in `main` teardown and `testutils` ([[ddd#Operational contract]]).
- `dependency-cruiser` in CI encodes [[ddd#Dependency rules (summary)]] — an upward import fails the build ([[ddd#Enforcement]]).
- Makefile with the canonical targets ([[makefile]]) — `make ci` = format-check + lint + test; workflows only call `make`.
- Scaffolding generator (`pnpm gen service <name>`) ships with the template — to be added alongside `ddd-nextjs-template`.

## Related

- [[ddd]] — the constitution this page implements
- [[dependency-injection]] — the injection mechanism
- [[tdd]] — the loop these stubs and seams serve
- [[deep-modules]] — how to shape ports
- [[component-structure]] — React component library conventions

*Source (original annotated listings): [TS DDD](../../../docs/sources/ddd/ts-ddd.md) ; refreshed 2026-07-01 — ecosystem review (Vitest 4, Zod v4, TS 6/7 Go-native, React Compiler, tsconfig hardening) ; injection unified on `Deps` + options 2026-07-02 ; shadcn/ui adopted for classic UI components 2026-07-16.*
