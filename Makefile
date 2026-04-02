.PHONY: format check test test-unit test-e2e lint tsc sonar dev build

# ---------- Development ----------

dev:
	pnpm dev

build:
	pnpm build

# ---------- Formatting ----------

format:
	pnpm format

# ---------- Quality checks ----------

lint:
	pnpm lint

tsc:
	pnpm tsc

sonar:
	@if command -v sonar-scanner >/dev/null 2>&1; then \
		sonar-scanner; \
	else \
		echo "[sonar] sonar-scanner not found — install via 'brew install sonar-scanner' or skip"; \
	fi

check: format lint tsc sonar

# ---------- Testing ----------

test-unit:
	pnpm test

test-e2e:
	pnpm test:e2e

test: test-unit test-e2e
