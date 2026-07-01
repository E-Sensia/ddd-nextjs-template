# DDD Next.js Template

Production-ready Next.js template implementing the E-Sensia Domain-Driven
Architecture standard: strict layer separation, typed-Deps injection,
OpenTelemetry observability, conversation_id logging, and full test
infrastructure.

## What's included

- **Next.js 16** (App Router, standalone output, server actions)
- **Domain-Driven Architecture** — ports & adapters, typed `Deps` +
  constructor injection, pure domain logic, branded ids, layer rules
  enforced in CI by dependency-cruiser
- **OpenTelemetry** — metrics, traces, structured logging with trace
  correlation
- **conversation_id logging** — canonical log fields
  (timestamp/level/service/version/message), `X-Conversation-Id` +
  request_id stamped on every line via AsyncLocalStorage; JSON one-per-line
  in production, pretty console in dev
- **Testing** — Vitest 4 (unit/service with happy/error/stress separation)
  plus Playwright (E2E), 80% coverage thresholds
- **CI/CD** — GitHub Actions calling only `make` targets; AWS ECS +
  Scaleway/Kubernetes deploy workflows
- **Docker** — multi-stage production build + local dev with Traefik +
  Prometheus
- **Code quality** — ESLint, Prettier, TypeScript strict +
  erasableSyntaxOnly + verbatimModuleSyntax, SonarQube config, git hooks

## Quick start

```bash
# 1. Clone from template
gh repo create my-app --template YOUR_ORG/ddd-nextjs-template --clone
cd my-app

# 2. From zero to working: deps, git hooks, .env
make setup

# 3. Validate (format-check + lint + type check + layer check + tests)
make ci

# 4. Run
make run-dev
```

Open http://localhost:3000 — the greeting example demonstrates the full
architecture.

## Architecture

```
main.ts              # composition root — wires all dependencies, exposes
                     #   getGreetingService/getLogger/getMetrics/getTracer
config/              # Zod-validated environment config (+ config.test.ts)
                     #   only main.ts imports it — services get primitives
domain/              # pure business logic; no framework deps
  shared/            # branded ids (ConversationId, RequestId, TraceId…)
                     #   + smart constructors for untrusted input
  greeting/          # example domain (keep or replace)
  logging/           # Logger port, log context (AsyncLocalStorage),
                     #   console-writer (log-format doctrine) + stub
  telemetry/         # MetricsRegistry + Tracer ports + otel/stub
services/            # orchestration classes
  greeting/          # service.ts (typed Deps + constructor), inject.ts
                     #   (factory + with... tunables), happy/error/stress tests
src/                 # Next.js delivery layer (the server layer)
  app/               # pages, layouts, error boundaries, api routes
  actions/           # server actions ("use server")
  mappers/           # zod shape validation at the edge + the single
                     #   error -> ActionResult translation
  server/            # request-context (X-Conversation-Id + request_id via
                     #   AsyncLocalStorage) and request-metrics wrappers
  components/        # UI components
  proxy.ts           # security headers (auto-discovered by Next.js 16)
utils/               # injection (Configurator/applyOptions), async-context
otel/                # OpenTelemetry SDK bootstrap
instrumentation.ts   # Next.js hook for OTEL init + graceful shutdown
```

**Dependency flow** (CI-enforced by `.dependency-cruiser.cjs`):
`main -> config, domain/*, services/*` | `src/ -> services (via main),
domain objects, utils` | `services -> domain, utils` | `utils -> nothing` |
No upward arrows; only `main` imports config; `src/` never touches domain
adapters or stubs.

## The patterns, in one minute

**Injection.** A service declares a typed `Deps` object and assigns
`private readonly` fields in its constructor; a factory applies optional
tunables. A missing dependency is a compile error, never a runtime surprise:

```typescript
export type GreetingServiceDeps = {
  logger: Logger // domain ports
  repository: ClickRepository
}
const svc = createGreetingService({ logger, repository }) // tests: same path, stubs
```

**Branded ids.** Identifiers are distinct types; smart constructors validate
untrusted input and return `null`:

```typescript
type ConversationId = string & { readonly __brand: "ConversationId" }
createConversationId(header) // ConversationId | null
```

**Actions never throw across the wire.** They return
`ActionResult<T> = { ok: true; data } | { ok: false; error }` where `error`
is a stable code; `toActionError` in `src/mappers/errors.mapper.ts` is the
single error translation. Mappers validate input shape with zod
(`safeParse` -> typed input or `null` -> `INVALID_REQUEST`).

**conversation_id.** Server actions wrap their body in
`withConversationContext` (route handlers in `withRequestContext`): the
incoming `X-Conversation-Id` header and a fresh `request_id` are pushed
into an AsyncLocalStorage context, and the logger stamps them on every
line. A missing or malformed header is omitted — never re-invented
downstream of the telephony edge.

## Adding a new domain

```bash
domain/
  your-domain/
    model.ts              # types + pure functions + port interfaces
    model.test.ts         # pure function tests
    index.ts              # barrel exports
    your-adapter/
      implementation.ts   # concrete implementation
      implementation.test.ts
    stub/
      implementation.ts   # test double

services/
  your-service/
    service.ts            # class with exported Deps type + constructor
    inject.ts             # createYourService(deps, ...options) factory
    service.happy.test.ts
    service.error.test.ts
    service.stress.test.ts
    index.ts

src/mappers/
  your-domain.mapper.ts   # zod schemas + safeParse narrowing + DTO mapping
src/actions/
  your-domain.actions.ts  # "use server", withConversationContext, ActionResult
```

Then wire it in `main.ts` and expose via server actions.

## Commands

```bash
make setup        # install deps, git hooks, .env — from zero to working
make ci           # format-check + lint + unit tests (exactly what CI runs)
make format       # prettier --write
make lint         # eslint + tsc --noEmit + depcruise (never mutates)
make test         # unit + e2e
make test-unit    # vitest with coverage
make test-e2e     # playwright
make build        # production build
make run          # prod-like local run
make run-dev      # dev server with reload
make clean        # remove build artifacts and caches
```

GitHub workflows call only these targets — what CI runs and what you run
locally is the same command.

## Docker

```bash
# Local dev with Traefik + Prometheus
docker compose up

# Access
# app.localhost       — Next.js app
# prometheus.localhost — Prometheus dashboard
# traefik.localhost   — Traefik dashboard
```

## After cloning — customize

1. `package.json` — update `name`
2. `.env.example` + `docker-compose.yml` — set `OTEL_SERVICE_NAME`
3. `config/config.ts` — update default `otelServiceName`
4. `.github/workflows/main.yml` — set `app_name`
5. `sonar-project.properties` — set your `projectKey` and `projectName`
6. `src/app/layout.tsx` — update `metadata` (title, description)
