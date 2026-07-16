<!-- GENERATED — do not grow. This file is the thin entry point; depth lives
     in the wiki (progressive disclosure). Architecture: wiki/standard/
     (authoritative). Repo context: wiki/local/. Deviations: docs/adr/. -->

@AGENTS.md

# ddd-nextjs-template

Next.js template implementing the E-Sensia Domain-Driven Architecture
standard — `wiki/standard/ddd.md`, applied to this stack by
`wiki/standard/ddd-in-typescript.md`.

## Repo map

- `main.ts` — composition root; the only place that wires concrete implementations
- `config/` — Zod-validated env config; only `main.ts` imports it
- `domain/` — pure business logic: objects, ports, implementations, stubs
- `services/` — orchestration classes: typed `Deps` + constructor, `inject.ts` factory
- `src/` — Next.js delivery layer (the server layer): app, actions, mappers, request context; classic UI = shadcn/ui in `src/components/ui/` (`make ui-add`), custom components alongside
- `utils/` — generic helpers (injection, async-context); depends on nothing
- `otel/` + `instrumentation.ts` — OpenTelemetry bootstrap
- `wiki/` — `standard/` (mirrored KB notes, read-only) + `local/` (repo-specific knowledge)
- `docs/adr/` — architecture decision records (deviations from the standard)

## Commands

- `make setup` — from zero to working (deps, git hooks, .env)
- `make ci` — format-check + lint + unit tests + wiki-check; run it before declaring any change done
- `make test-e2e` — Playwright (requires `make build` once)
- `make wiki-sync` — re-mirror the KB notes into `wiki/standard/` (requires `uv`; set `KB_PATH` to a local KB clone)
- `make wiki-check` — fail if `wiki/standard/` drifted from the locked KB SHA
- GitHub workflows call only `make` targets.

## The rules at a glance (from wiki/standard/ddd.md)

1. Business logic lives in `domain`, orchestration in `services`, `server` stays thin.
2. Dependencies point downward only — no upward import, ever.
3. Every port has at least one implementation and one stub; ports expose capabilities, not tables.
4. Services receive a typed `Deps` object at construction; a missing dependency is a compile/lint error, never a runtime surprise.
5. Only `main` imports the config; everything else receives primitives.
6. Mappers validate shape, the domain enforces invariants, illegal states are unrepresentable.
7. Expected errors are typed and part of the interface; the server maps them once; nothing internal leaks.
8. Logs, metrics and traces are injected ports; correlation ids travel explicitly.
9. One port call is the atomicity unit; writes are idempotent.
10. Three test files per service (`happy`/`error`/`stress`); assert outcomes, never calls.
11. Everything machine-checkable is CI-enforced; deviations are ADRs.
12. Every repo ships `CONTEXT.md`, health endpoints, graceful shutdown and versioned migrations.

## Where knowledge lives

- `wiki/standard/` — the architecture standard, mirrored verbatim from
  E-Sensia/knowledge-base at the SHA pinned in `wiki/SOURCES.lock`.
  **Authoritative**: consult it before any architecture-shaped decision.
  Never edit these files — change the KB, then `make wiki-sync`.
- `wiki/local/` — repo-specific knowledge, maintained as work happens
  (one topic per note; cite `wiki/standard/` and the code).
- `docs/adr/` — deviations from the standard are recorded as ADRs.
