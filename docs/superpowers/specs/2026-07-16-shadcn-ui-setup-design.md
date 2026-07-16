# shadcn/ui adoption — minimal setup (template + KB standard)

**Date:** 2026-07-16
**Status:** approved (design), pending implementation

## Goal

Classic UI components (button, input, dialog, …) in projects derived from this
template come from [shadcn/ui](https://ui.shadcn.com). The template ships with
shadcn **pre-initialized but with zero components installed** — each derived
project adds the components it needs. The KB architecture standard is updated
so the standard and the template stay aligned (no ADR needed).

## Non-goals

- No shadcn components pre-installed in the template (`make ui-add` is the
  per-project entry point).
- No change to the existing `src/components/button/` example — it remains the
  example of a hand-written, domain-specific component.
- No new `component-structure` KB note; the existing dangling wikilink stays.

## Changes

### 1. KB — `E-Sensia/knowledge-base`, branch `docs/tech-ddd`

Edit `tech/conventions/typescript/ddd-in-typescript.md`:

- **Stack table** (frontend rows): `React + Tailwind CSS + custom component
library` → `React + Tailwind CSS + shadcn/ui + custom components`.
- **Layout tree** (`components/` line): note that shadcn primitives live in
  `components/ui/`, custom components in `components/<name>/`.
- **UI paragraph** (§ server layer): classic UI components come from shadcn/ui,
  added via the Makefile target (`make ui-add`), generated into
  `server/components/ui/`; domain-specific components remain hand-written, one
  folder per component with its test.

Commit and **push** to `docs/tech-ddd` — `make wiki-check` in CI clones the KB
and fails if the locked SHA is not reachable on the remote.

### 2. Template — this repo

1. **shadcn init** (non-interactive): produces `components.json`,
   `src/lib/utils.ts` (`cn()` helper), adds `clsx` + `tailwind-merge`
   dependencies, and injects the shadcn theme CSS variables into
   `src/app/globals.css`. Uses the existing `@/*` alias.
2. **Makefile** — new documented target so the Makefile stays the single
   entry point for common commands:

   ```makefile
   ## Add shadcn/ui components into src/components/ui (usage: make ui-add c="button dialog")
   ui-add:
   	pnpm dlx shadcn@latest add $(c)
   ```

3. **CLAUDE.md** — mention shadcn on the `src/` repo-map line (classic UI =
   shadcn in `src/components/ui/`, custom components alongside).
4. **`wiki/local/shadcn.md`** — repo-local note: the convention, where
   components live, how to add one, citing `wiki/standard/ddd-in-typescript.md`.
5. **wiki re-sync** — `KB_PATH=~/Documents/esensia_knowledge_base make wiki-sync`
   re-mirrors `wiki/standard/` and repins the SHA in `wiki/SOURCES.lock`.
   Note: the repin also picks up KB commit `2e33764` (llm-wiki note change),
   which is expected.
6. **`make ci`** must pass (format-check, lint, unit tests, wiki-check).

## Risks

- **shadcn CLI vs Next 16.2.2 / Tailwind 4**: this template's Next version may
  diverge from what the CLI expects. If `shadcn init` fails or generates
  legacy output, fall back to the manual equivalent (write `components.json`,
  `src/lib/utils.ts`, theme CSS vars, add the two deps by hand).

## Verification

- `make ci` green.
- `components.json` and `src/lib/utils.ts` exist; `globals.css` contains the
  shadcn theme variables.
- `make ui-add c=button` generates `src/components/ui/button.tsx` (smoke test,
  then revert — the template ships with no components).
- `make wiki-check` passes at the new locked SHA.
