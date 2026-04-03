# DDD Next.js Template

Production-ready Next.js template with Domain-Driven Architecture, OpenTelemetry observability, and full test infrastructure.

## What's included

- **Next.js 16** (App Router, standalone output, server actions)
- **Domain-Driven Architecture** — ports & adapters, constructor injection, pure domain logic
- **OpenTelemetry** — metrics, traces, structured JSON logging with trace correlation
- **Testing** — Jest (unit/service with happy/error/stress separation) + Playwright (E2E)
- **CI/CD** — GitHub Actions (lint, type-check, test, build, E2E)
- **Docker** — multi-stage production build + local dev with Traefik + Prometheus
- **Code quality** — ESLint, Prettier, TypeScript strict mode, SonarQube config, coverage thresholds

## Quick start

```bash
# 1. Clone from template
gh repo create my-app --template YOUR_ORG/ddd-nextjs-template --clone
cd my-app

# 2. Install dependencies
pnpm install

# 3. Copy environment file
cp .env.example .env

# 4. Run
pnpm dev
```

Open http://localhost:3000 — the greeting example demonstrates the full architecture.

## Architecture

```
main.ts              # composition root — wires all dependencies
config/              # Zod-validated environment config
domain/              # ports (interfaces), pure functions, stubs
  greeting/          # example domain (keep or replace)
  logging/           # Logger port + console/stub implementations
  telemetry/         # MetricsRegistry + Tracer ports + otel/stub
services/            # orchestration classes with constructor-injected deps
  greeting/          # example service + happy/error/stress tests
src/                 # Next.js delivery layer
  app/               # pages, layouts, error boundaries
  actions/           # server actions + Zod DTOs
  components/        # UI components
  proxy.ts           # security headers (auto-discovered by Next.js 16)
utils/               # ActionResult<T> and shared types
otel/                # OpenTelemetry SDK bootstrap
instrumentation.ts   # Next.js hook for OTEL init + graceful shutdown
```

**Dependency flow:** `main -> config, domain/*, services/*` | `src/ -> services (via main)` | `services -> domain` | No upward arrows.

## Adding a new domain

```bash
domain/
  your-domain/
    model.ts              # types + pure functions + port interfaces
    model.test.ts         # pure function tests
    index.ts              # barrel exports
    your-adapter/
      implementation.ts   # concrete implementation
    stub/
      implementation.ts   # test double

services/
  your-service/
    service.ts            # class with Deps type + constructor injection
    service.happy.test.ts
    service.error.test.ts
    service.stress.test.ts
    index.ts

src/actions/
  your-action.actions.ts  # "use server" + Zod validation
  your-action.dto.ts      # request/response schemas
```

Then wire it in `main.ts` and expose via server actions.

## Commands

```bash
make dev          # start dev server
make build        # production build
make check        # format + lint + tsc + sonar
make test         # unit + e2e tests
make test-unit    # jest only
make test-e2e     # playwright only
```

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
4. `sonar-project.properties` — set your `projectKey` and `projectName`
5. `src/app/layout.tsx` — update `metadata` (title, description)
