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
