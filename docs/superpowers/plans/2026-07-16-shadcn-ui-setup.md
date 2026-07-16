# shadcn/ui Minimal Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the template with shadcn/ui pre-initialized (zero components) and align the KB architecture standard, so derived projects add classic UI components via `make ui-add`.

**Architecture:** Two repos touched. First the KB standard (`~/Documents/esensia_knowledge_base`, branch `docs/tech-ddd`) is edited, committed and pushed; then the template gets shadcn init artifacts (`components.json`, `src/lib/utils.ts`, theme vars in `globals.css`), a `ui-add` Makefile target, docs, and finally re-mirrors `wiki/standard/` at the new KB SHA.

**Tech Stack:** shadcn/ui CLI (`pnpm dlx shadcn@latest`), Tailwind 4 (CSS-first config), Next 16.2.2, pnpm, uv (wiki-sync).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-16-shadcn-ui-setup-design.md`.
- Template ships **zero** shadcn components — smoke-test artifacts must be reverted.
- Never edit `wiki/standard/` by hand — only via KB + `make wiki-sync`.
- Existing `src/components/button/` stays untouched.
- KB SHA locked in `wiki/SOURCES.lock` must be pushed to `origin/docs/tech-ddd` (CI clones the KB).
- Work happens on branch `feat/shadcn-ui-setup` (template) — already checked out.
- This repo's Next.js may diverge from training data (`AGENTS.md`); if the shadcn CLI misbehaves, use the manual fallback given in Task 2 — do not improvise.

---

### Task 1: KB standard update (shadcn/ui adoption)

**Files:**
- Modify: `~/Documents/esensia_knowledge_base/tech/conventions/typescript/ddd-in-typescript.md` (frontmatter, stack table l. 31-32, layout tree l. 93, UI paragraph l. 411, source trailer l. 481)

**Interfaces:**
- Consumes: nothing.
- Produces: a pushed commit on `docs/tech-ddd` whose SHA Task 5 pins into `wiki/SOURCES.lock` via `make wiki-sync`.

- [ ] **Step 1: Verify clean state on the right branch**

Run: `cd ~/Documents/esensia_knowledge_base && git status -sb`
Expected: `## docs/tech-ddd...origin/docs/tech-ddd` and no modified files.

- [ ] **Step 2: Apply the five edits**

In `tech/conventions/typescript/ddd-in-typescript.md`, exact replacements:

1. Frontmatter — `updated: 2026-07-02` → `updated: 2026-07-16`

2. Stack table:
```
| Frontend only | React + Tailwind CSS + custom component library |
| Frontend + backend | Next.js (App Router) + Tailwind CSS + custom component library |
```
→
```
| Frontend only | React + Tailwind CSS + shadcn/ui + custom components |
| Frontend + backend | Next.js (App Router) + Tailwind CSS + shadcn/ui + custom components |
```

3. Layout tree:
```
    ├── components/                   # custom React component library
```
→
```
    ├── components/                   # ui/ (shadcn/ui) + custom components
```

4. UI paragraph:
```
UI comes from the custom component library in `server/components/` (Tailwind, one folder per component with its test) — see [[component-structure]].
```
→
```
Classic UI components (button, input, dialog, …) come from [shadcn/ui](https://ui.shadcn.com), added per project via `make ui-add` and generated into `server/components/ui/`. Domain-specific components remain hand-written in `server/components/<name>/` (Tailwind, one folder per component with its test) — see [[component-structure]].
```

5. Source trailer (last line, before the final period of the italic block): append ` ; shadcn/ui adopted for classic UI components 2026-07-16` so the line ends:
```
… injection unified on `Deps` + options 2026-07-02 ; shadcn/ui adopted for classic UI components 2026-07-16.*
```

- [ ] **Step 3: Verify the diff is exactly these lines**

Run: `cd ~/Documents/esensia_knowledge_base && git diff --stat && git diff`
Expected: 1 file changed; hunks only at the five locations above.

- [ ] **Step 4: Commit and push**

```bash
cd ~/Documents/esensia_knowledge_base
git add tech/conventions/typescript/ddd-in-typescript.md
git commit -m "docs(ts-ddd): adopt shadcn/ui for classic UI components"
git push origin docs/tech-ddd
```
Expected: push accepted. Record the new SHA (`git rev-parse HEAD`) — Task 5 must pin it.

---

### Task 2: shadcn init in the template (minimal, zero components)

**Files:**
- Create: `components.json`, `src/lib/utils.ts`
- Modify: `src/app/globals.css`, `package.json`, `pnpm-lock.yaml`

**Interfaces:**
- Consumes: existing `@/*` → `./src/*` alias in `tsconfig.json`.
- Produces: `cn(...inputs: ClassValue[]): string` exported from `src/lib/utils.ts` (alias `@/lib/utils`); `components.json` consumed by `make ui-add` (Task 3).

- [ ] **Step 1: Run shadcn init non-interactively**

Run from the template root:
```bash
pnpm dlx shadcn@latest init -y -d
```
Expected: creates `components.json` + `src/lib/utils.ts`, adds deps (at least `clsx`, `tailwind-merge`), rewrites `src/app/globals.css` with the shadcn theme block (`:root`/`.dark` oklch variables, `@theme inline`).

**Fallback if the CLI fails or generates Tailwind-3-style output** (`tailwind.config.*`, `@tailwind base` directives): revert (`git checkout -- . && git clean -fd src/lib components.json && pnpm install`), then create by hand:

`components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

`src/lib/utils.ts`:
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Deps: `pnpm add clsx tailwind-merge`

`src/app/globals.css` — replace the whole file with the canonical shadcn Tailwind-4 neutral block, then re-apply the repo's font/body rules as shown in Step 2 (the canonical block is what `init` writes: `@import "tailwindcss";`, `@custom-variant dark (&:is(.dark *));`, `:root { --radius: 0.625rem; --background: oklch(1 0 0); --foreground: oklch(0.145 0 0); … }`, `.dark { … }`, `@theme inline { --color-background: var(--background); … }`, `@layer base { * { @apply border-border outline-ring/50; } body { @apply bg-background text-foreground; } }` — copy it from https://ui.shadcn.com/docs/installation/manual if needed).

- [ ] **Step 2: Reconcile globals.css with the pre-existing repo rules**

The old file defined its own `--background`/`--foreground` in `:root` + `@media (prefers-color-scheme: dark)` and a `body { font-family: Arial … }` rule. After init, keep **shadcn's** variables and:
- delete the old duplicate `:root` / `@media (prefers-color-scheme: dark)` blocks if init left them behind;
- ensure the font mappings survive inside shadcn's `@theme inline`:
```css
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
```
- ensure a body font rule remains (shadcn's `@layer base` `body` rule replaces the old Arial one — acceptable; do not re-add Arial).

- [ ] **Step 3: Verify types and formatting**

Run: `pnpm tsc && pnpm format && pnpm lint`
Expected: all pass (format mutates `globals.css`/`components.json` into repo style — that is fine).

- [ ] **Step 4: Visual sanity check**

Run: `pnpm dev` (background), open http://localhost:3000.
Expected: home page renders, existing Button still styled. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add components.json src/lib/utils.ts src/app/globals.css package.json pnpm-lock.yaml
git commit -m "feat: initialize shadcn/ui (no components) — cn(), theme vars, components.json"
```

---

### Task 3: `make ui-add` target

**Files:**
- Modify: `Makefile` (`.PHONY` line 4; new target after `build:` in the Development section)

**Interfaces:**
- Consumes: `components.json` (Task 2).
- Produces: `make ui-add c="<names>"` — the documented entry point referenced by the KB (Task 1), `CLAUDE.md` and `wiki/local/shadcn.md` (Task 4).

- [ ] **Step 1: Add the target**

In `.PHONY` (line 4), append `ui-add`:
```makefile
.PHONY: setup format format-check lint tsc depcruise sonar check test test-unit test-e2e ci build run run-dev dev clean wiki-sync wiki-check _wiki-run ui-add
```

After the `build:` block in `# ---------- Development ----------`:
```makefile
## Add shadcn/ui components into src/components/ui (usage: make ui-add c="button dialog")
ui-add:
	@test -n "$(c)" || { echo 'usage: make ui-add c="button dialog"'; exit 1; }
	pnpm dlx shadcn@latest add $(c)
```
(Recipe lines are TAB-indented.)

- [ ] **Step 2: Verify the usage guard**

Run: `make ui-add`
Expected: prints `usage: make ui-add c="button dialog"`, exits 1.

- [ ] **Step 3: Smoke test, then revert (template ships zero components)**

```bash
make ui-add c=button
test -f src/components/ui/button.tsx && echo OK
git checkout -- package.json pnpm-lock.yaml 2>/dev/null || true
rm -rf src/components/ui
pnpm install
git status -s   # must show only the Makefile change
```
Expected: `OK`, then a clean tree except `Makefile`.

- [ ] **Step 4: Commit**

```bash
git add Makefile
git commit -m "feat: add ui-add make target for shadcn components"
```

---

### Task 4: Documentation (CLAUDE.md + wiki/local)

**Files:**
- Modify: `CLAUDE.md` (repo-map `src/` line), `wiki/local/index.md` (Articles list)
- Create: `wiki/local/shadcn.md`

**Interfaces:**
- Consumes: `make ui-add` (Task 3), KB wording (Task 1).
- Produces: repo-local documentation; nothing downstream.

- [ ] **Step 1: Update the CLAUDE.md repo map**

```
- `src/` — Next.js delivery layer (the server layer): app, actions, mappers, request context
```
→
```
- `src/` — Next.js delivery layer (the server layer): app, actions, mappers, request context; classic UI = shadcn/ui in `src/components/ui/` (`make ui-add`), custom components alongside
```

- [ ] **Step 2: Create `wiki/local/shadcn.md`**

```markdown
# shadcn/ui — classic UI components

The standard mandates shadcn/ui for classic UI components (button, input,
dialog, …) — see `wiki/standard/ddd-in-typescript.md`, "UI" paragraph.

In this repo:

- `components.json` — shadcn CLI config (style, aliases, Tailwind 4 CSS-first).
- `src/lib/utils.ts` — the `cn()` class-merge helper shadcn components import.
- `src/app/globals.css` — shadcn theme variables (`:root` / `.dark`).
- `src/components/ui/` — where generated components land. **Empty in the
  template by design**: each derived project runs `make ui-add c="button dialog"`
  to pull exactly what it needs.
- `src/components/<name>/` — hand-written, domain-specific components
  (one folder per component with its test), e.g. `src/components/button/`.

Gotchas:

- Never hand-edit `src/components/ui/*` beyond styling tweaks — re-adding the
  component with `make ui-add` overwrites the file.
- `make ui-add` may add runtime deps (`@radix-ui/*`, `class-variance-authority`,
  `lucide-react`) — commit `package.json` + `pnpm-lock.yaml` with the component.
```

- [ ] **Step 3: Register the note in `wiki/local/index.md`**

Replace `_None yet._` with:
```markdown
- [shadcn/ui — classic UI components](shadcn.md)
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md wiki/local/shadcn.md wiki/local/index.md
git commit -m "docs: document shadcn/ui convention (CLAUDE.md + wiki/local)"
```

---

### Task 5: Re-mirror wiki/standard at the new KB SHA

**Files:**
- Modify (generated): `wiki/standard/*.md`, `wiki/SOURCES.lock`

**Interfaces:**
- Consumes: the KB SHA pushed in Task 1.
- Produces: `wiki/standard/ddd-in-typescript.md` containing the shadcn wording; `SOURCES.lock` pinned to the Task 1 SHA.

- [ ] **Step 1: Run wiki-sync against the local clone**

Run: `KB_PATH=$HOME/Documents/esensia_knowledge_base make wiki-sync`
Expected: exits 0; `wiki/SOURCES.lock` `sha:` equals the Task 1 SHA, `synced_at: '2026-07-16'`.

- [ ] **Step 2: Verify the mirrored content and check for drift**

```bash
grep -n "shadcn" wiki/standard/ddd-in-typescript.md
make wiki-check
```
Expected: grep hits (stack table + UI paragraph); wiki-check exits 0. Note: the diff may also include the KB's `llm-wiki.md` change from `2e33764` — expected, commit it too.

- [ ] **Step 3: Commit**

```bash
git add wiki/standard wiki/SOURCES.lock
git commit -m "docs: re-sync wiki/standard at KB shadcn adoption SHA"
```

---

### Task 6: Full CI gate

**Files:** none (verification only).

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a green branch ready for PR/merge.

- [ ] **Step 1: Run the full pipeline**

Run: `make ci`
Expected: format-check, lint, test-unit, wiki-check all pass.

- [ ] **Step 2: Confirm the template still ships zero shadcn components**

Run: `ls src/components/`
Expected: only `button` (no `ui/` directory).

- [ ] **Step 3: Mark plan checkboxes done and commit any plan-tracking update**

```bash
git add docs/superpowers/plans/2026-07-16-shadcn-ui-setup.md
git commit -m "docs: check off shadcn setup plan" 
```
(Skip if the plan file was not modified.)
