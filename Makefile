# Canonical Makefile — the single interface for humans, CI and agents.
# GitHub workflows only ever call make targets, so CI and local runs
# cannot drift. Full local pipeline: make ci
.PHONY: setup format format-check lint tsc depcruise sonar check test test-unit test-e2e ci build run run-dev dev clean wiki-sync wiki-check _wiki-run ui-add

# ---------- Setup ----------

## First-time setup: install deps, git hooks, env — from zero to working
## Also requires `uv` (https://docs.astral.sh/uv/) for the wiki-sync/wiki-check
## targets — install via 'brew install uv' or the official installer.
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

## Add shadcn/ui components into src/components/ui (usage: make ui-add c="button dialog")
ui-add:
	@test -n "$(c)" || { echo 'usage: make ui-add c="button dialog"'; exit 1; }
	pnpm dlx shadcn@latest add $(c)

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

# ---------- LLM wiki (KB mirror — see wiki/manifest.yml) ----------

# The sync script is versioned once in the knowledge base and invoked from
# there (never copied). Requires `uv`. Set KB_PATH to a local KB clone to
# skip network access; otherwise the script self-clones the KB over SSH.
KB_REPO = E-Sensia/knowledge-base
WIKI_SYNC_SCRIPT = docs/wiki-sync/wiki_sync.py

# internal: fetch the script if no local KB, then run it (WIKI_ARGS: '' | --check)
_wiki-run:
	@set -e; \
	if [ -n "$$KB_PATH" ]; then \
		uv run "$$KB_PATH/$(WIKI_SYNC_SCRIPT)" $(WIKI_ARGS); \
	else \
		tmp="$$(mktemp -d)"; \
		trap 'rm -rf "$$tmp"' EXIT; \
		git clone --quiet --depth 1 "git@github.com:$(KB_REPO).git" "$$tmp/kb"; \
		uv run "$$tmp/kb/$(WIKI_SYNC_SCRIPT)" $(WIKI_ARGS); \
	fi

## Mirror the manifest-selected KB notes into wiki/standard, pin SHA in SOURCES.lock
wiki-sync:
	@$(MAKE) --no-print-directory _wiki-run WIKI_ARGS=

## Re-derive wiki/standard at the locked KB SHA and fail on drift (part of ci)
wiki-check:
	@if [ -n "$$SKIP_WIKI_CHECK" ]; then \
		echo "[wiki-check] SKIPPED — SKIP_WIKI_CHECK is set (KB not reachable in this environment)."; \
		echo "[wiki-check] TODO: provision a fine-grained PAT with contents:read on $(KB_REPO), then remove the skip."; \
	else \
		$(MAKE) --no-print-directory _wiki-run WIKI_ARGS=--check; \
	fi

# ---------- Testing ----------

test-unit:
	pnpm test

test-e2e:
	pnpm test:e2e

test: test-unit test-e2e

# ---------- CI ----------

## Exactly what CI runs — never mutates files
ci: format-check lint test-unit wiki-check

## Remove build artifacts and caches
clean:
	rm -rf .next node_modules/.cache coverage playwright-report test-results
