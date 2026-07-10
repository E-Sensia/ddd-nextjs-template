---
title: Error Handling
type: concept
domain: tech
lang: en
tags: [errors, resilience]
status: stable
created: 2026-06-24
updated: 2026-07-02
aliases: [error doctrine, error codes]
kb_source: tech/concepts/error-handling.md
kb_sha: ac90b437951f90ab92f84c4463258d618d8f6734
---

# Error Handling

## What & why

Errors are **part of a module's interface**, not an afterthought ([[ddd#Error handling]]). One doctrine for all services: a caller — human, service or agent — must be able to tell *what failed*, *whether retrying makes sense*, and *where to look*, without ever seeing our internals.

## The taxonomy that drives everything

| | **Expected** | **Unexpected** |
|---|---|---|
| Nature | a business outcome: user not found, payment declined, amount too high | a technical failure: timeout, connection reset, panic, bug |
| Defined | as **typed errors with stable codes**, next to the objects/services they concern | not defined — anything else |
| Service behavior | raised/returned as part of the interface, enumerated | propagates untouched, possibly wrapped with context |
| Tested in | `service.error.test` | `service.stress.test` |
| Transport | mapped to a 4xx/domain-specific status + its code | generic 5xx + `internal` |
| Retryable | **no** — retrying "user not found" is a bug | often — transient technical failures, in adapters only |

## Error codes

- **Stable, machine-readable, `snake_case`**: `not_found`, `payment_declined`, `amount_too_high`, `invalid_request`, `internal`. The code is an API contract — renaming one is a breaking change.
- The code is defined **with** the error type (a field/constant on the typed error), never invented at the mapping site.
- Codes are the **only** error information that crosses the server boundary, plus the `request_id` so a client report can be joined with our logs ([[log-format]]): `{"error": "payment_declined", "request_id": "9f3a-..."}`. Never a message, never a stack trace, never internals ([[ddd#Security]]).

## Layer responsibilities

- **Domain** defines error types for business-rule violations, next to the objects they concern. Invariant violations shouldn't normally reach runtime — types prevent them ([[ddd#Validation & invariants]]).
- **Services** enumerate their expected errors as typed errors — part of their interface. They may **wrap** a lower error to add context (Go `%w`, Python `raise ... from`, TS `cause`), they never swallow one.
- **Server** owns the **single translation point** (error mapper / exception handler / `toStatus`): typed error → status + code. Unknown error → 500 `internal`, logged with full context.
- **Adapters** own retries: only technical, transient failures are retried, with bounded backoff (`utils/retry`), tuned by primitives from `main` ([[ddd#Operational contract]]). A service never sleeps or retries.

## Handle once

An error is **recovered, translated, or propagated — exactly one of the three, exactly once**.

- Log at the handling site only: the server's mapper logs unexpected errors (with `conversation_id`/`request_id`); intermediate layers wrap and re-raise *without logging*. Log-and-rethrow at every level is the #1 source of noise ([[log-format]]).
- A `warn` is appropriate where degradation is *handled* (fallback used, retry succeeded, provider failed over) — that's recovery, so it's logged there, once.

## Crashes and panics

- A panic/unhandled exception in a request is caught by the **recovery middleware**: clean 500 `internal`, logged with correlation, connection preserved. It is a bug to fix, never a flow-control mechanism.
- At process level: fail fast at startup (config validation, wiring), let the supervisor restart; graceful shutdown drains in-flight requests ([[ddd#Operational contract]]).

## Per-stack mechanics

- **Go** ([[ddd-in-go]]): sentinel errors + typed error structs in `domain/shared/errors.go`; `errors.Is`/`As` in the single `toStatus`; wrap with `fmt.Errorf("...: %w", err)`.
- **Python** ([[ddd-in-python]]): `DomainError` exception hierarchy with `.code`; FastAPI `exception_handler` as the mapper; `raise ... from err`.
- **TypeScript** ([[ddd-in-typescript]]): named `extends Error` classes with `readonly code`; actions return `ActionResult` unions — errors never thrown across the wire; `toActionError` is the mapper.

## Pitfalls

- A code invented at the mapping site instead of on the error type.
- Catch-all that answers success or hides the failure — unexpected errors must surface.
- Logging the same error at three layers.
- Retrying business errors, or retrying anywhere but an adapter.
- Error messages carrying user data or internals across the boundary.
- Uppercase/local variants of codes — `snake_case` everywhere, it's a contract.

## Related

- [[ddd]] — Error handling, Security, Operational contract sections
- [[log-format]] — what gets logged, with which correlation
- [[tdd]] — the `error`/`stress` test split

*Defined 2026-07-02 — error-code casing standardized on `snake_case` across all stacks.*
