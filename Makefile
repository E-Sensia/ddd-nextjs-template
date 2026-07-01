# Canonical Makefile — the single interface for humans, CI and agents.
# GitHub workflows only ever call make targets, so CI and local runs
# cannot drift. Full local pipeline: make ci
.PHONY: setup format format-check lint tsc depcruise sonar check test test-unit test-e2e ci build run run-dev dev clean

# ---------- Setup ----------

## First-time setup: install deps, git hooks, env — from zero to working
setup:
	pnpm install
	git init -q 2>/dev/null || true
	git config core.hooksPath .githooks
	chmod +x .githooks/*
	cp -n .env.example .env 2>/dev/null || true
	@echo "Setup complete."

# ---------- Development ----------

## Run locally with reload
run-dev:
	pnpm dev

dev: run-dev

## Run locally, prod-like (requires make build first)
run:
	pnpm start

## Produce the deployable artifact
build:
	pnpm build

# ---------- Formatting ----------

## Auto-format the codebase (mutates files)
format:
	pnpm format

format-check:
	pnpm format:check

# ---------- Quality checks (never mutate) ----------

## Linters + type check + layer check
lint:
	pnpm lint
	pnpm tsc
	pnpm depcruise

tsc:
	pnpm tsc

depcruise:
	pnpm depcruise

sonar:
	@if command -v sonar-scanner >/dev/null 2>&1; then \
		sonar-scanner; \
	else \
		echo "[sonar] sonar-scanner not found — install via 'brew install sonar-scanner' or skip"; \
	fi

check: format lint sonar

# ---------- Testing ----------

test-unit:
	pnpm test

test-e2e:
	pnpm test:e2e

test: test-unit test-e2e

# ---------- CI ----------

## Exactly what CI runs — never mutates files
ci: format-check lint test-unit

## Remove build artifacts and caches
clean:
	rm -rf .next node_modules/.cache coverage playwright-report test-results
