---
title: Makefile Standard
type: convention
domain: tech
lang: en
tags: [makefile, ci, tooling]
status: stable
created: 2026-07-02
updated: 2026-07-02
aliases: [make targets, CI interface]
kb_source: tech/conventions/shared/makefile.md
kb_sha: 40cd8fcc1429bcdfcf4100af4330391e872a2c9c
---

# Makefile Standard

## Rule

Every repo ships a Makefile exposing **the same canonical targets**, whatever the stack. GitHub workflows only ever call `make` targets — never inline tool commands. The Makefile is the single interface: what CI runs and what a developer (or an AI agent) runs locally is **the same command**, so they cannot drift ([[ddd#Enforcement]]).

## Canonical targets

| Target | Semantics | Mutates files? |
|---|---|---|
| `make setup` | install toolchain, deps, git hooks — from zero to working | yes |
| `make format` | auto-format the codebase | yes |
| `make lint` | linters + type check + layer check | no |
| `make test` | all tests, with coverage and race/concurrency checks | no |
| `make ci` | format-check + lint + test — exactly what CI runs | **never** |
| `make build` | produce the deployable artifact | no |
| `make run` | run locally (prod-like) | no |
| `make run-dev` | run locally with reload | no |
| `make clean` | remove build artifacts and caches | yes |

Extra targets are allowed (e.g. `make gen`, `make loadtest`, `make wiki-sync`/`wiki-check` — see [[llm-wiki]]; `wiki-check` joins the `ci` chain), but the canon above must exist with these exact names and semantics. `lint` and `ci` never modify files — a formatting difference fails `ci` (`format-check`), it doesn't get silently fixed.

## What each target runs, per stack

| Target | Go ([[ddd-in-go]]) | Python ([[ddd-in-python]]) | TypeScript ([[ddd-in-typescript]]) |
|---|---|---|---|
| `format` | `go fmt` + `goimports` | `ruff format` | `prettier --write` |
| `lint` | `golangci-lint run` + `go vet` | `ruff check` + `pyright` + `lint-imports` | `eslint` + `tsc --noEmit` + `depcruise` |
| `test` | `go test -race -coverprofile` | `uv run pytest --cov` | `vitest run --coverage` |
| `build` | `go build -o app` | `uv build` / docker image | `next build` |

## GitHub workflows are thin callers

A workflow job = toolchain setup action + one `make` target. Nothing else:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5          # or astral-sh/setup-uv / pnpm/action-setup
        with: { go-version-file: go.mod, cache: true }
      - run: make test
```

Jobs may stay split (`lint.yml` calls `make lint`, `test.yml` calls `make test`) for per-check visibility in the PR UI — but each step is a `make` call. The full local equivalent of the pipeline is always `make ci`.

## Rationale

- **No drift**: the day someone adds a lint flag, CI and every laptop get it in the same commit.
- **Agent-friendly** ([[ddd#Enforcement]]): an AI agent in any repo knows `make ci` validates its work — no per-repo archaeology.
- **Onboarding**: `make setup && make ci` is the entire "getting started" doc.

## Related

- [[ddd]] — Enforcement section
- [[ddd-in-go]], [[ddd-in-python]], [[ddd-in-typescript]] — per-stack tooling behind the targets
- [[git-workflow]] — hooks installed by `make setup`

*Defined 2026-07-02 — one interface for humans, CI and agents.*
