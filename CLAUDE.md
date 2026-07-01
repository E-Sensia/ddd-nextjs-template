@AGENTS.md

## Architecture

This project implements the E-Sensia Domain-Driven Architecture standard.
See the full reference:
@~/.claude/skills/ddd-refactor/references/architecture-typescript.md

Key layers:

- `domain/` — ports (interfaces), pure functions, branded ids
  (`domain/shared`), one stub per port. No framework deps.
- `services/` — orchestration classes: exported `XxxServiceDeps` type +
  constructor assigning `private readonly` fields; `inject.ts` factory
  (`createXxxService(deps, ...options)`); `with...` options only for
  genuine tunables. Three test files per service (happy/error/stress).
- `src/` — Next.js delivery layer. `src/mappers/` validate shape with zod
  (`safeParse` -> typed input or `null`) and own the single
  error -> `ActionResult` translation (`toActionError`); `src/server/`
  holds the request-context (X-Conversation-Id + request_id via
  AsyncLocalStorage) and request-metrics wrappers.
- `main.ts` — composition root; wires all dependencies and exposes
  `getGreetingService`/`getLogger`/`getMetrics`/`getTracer`.
- `config/` — Zod-validated environment config; only `main.ts` imports it.
- `otel/` + `instrumentation.ts` — OpenTelemetry SDK bootstrap.

Dependency flow (CI-enforced by dependency-cruiser): `main → config,
domain/*, services/*` | `src/ → services (via main), domain objects,
utils` | `services → domain, utils` | `utils → nothing` | No upward
arrows; `src/` never imports domain adapters or stubs.

## Rules

- Server actions return `ActionResult<T> = { ok: true; data } |
{ ok: false; error }` with stable error codes — they never throw across
  the wire.
- Action bodies run inside `withConversationContext` (route handlers inside
  `withRequestContext`) so every log line carries conversation_id +
  request_id.
- Log messages are stable lowercase constants ("button clicked"); data goes
  in flat extra fields, never interpolated. No PII/medical data/secrets in
  logs.
- Identifiers are branded types (`ConversationId`, not `string`); untrusted
  input goes through smart constructors returning `null`.
- Tests assemble services through the factory with stubs — the exact
  production path. Assert on outcomes, never on stub call counts.

## Workflow

- `make setup` — from zero to working (deps, git hooks, .env)
- `make ci` — format-check + lint (eslint + tsc + depcruise) + unit tests;
  run it before declaring any change done
- `make test-e2e` — Playwright (requires `make build` once)
- GitHub workflows call only `make` targets.
