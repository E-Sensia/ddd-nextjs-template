@AGENTS.md

## Architecture

This project follows a strict Domain-Driven Architecture. See the full reference:
@~/.claude/skills/ddd-refactor/references/architecture-typescript.md

Key layers:
- `domain/` — ports (interfaces), pure functions, stubs. No framework deps.
- `services/` — orchestration classes with constructor-injected deps.
- `src/` — Next.js delivery layer (pages, server actions, components).
- `main.ts` — composition root, wires all dependencies.
- `config/` — Zod-validated environment config.
- `otel/` + `instrumentation.ts` — OpenTelemetry SDK bootstrap.

Dependency flow: `main → config, domain/*, services/*` | `src/ → services (via main)` | `services → domain` | No upward arrows.
