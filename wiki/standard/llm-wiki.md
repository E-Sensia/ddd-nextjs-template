---
title: LLM Wiki per Service
type: convention
domain: tech
lang: en
tags: [llm-wiki, knowledge, agents]
status: stable
created: 2026-07-02
updated: 2026-07-02
aliases: [repo wiki, wiki-sync]
kb_source: tech/conventions/shared/llm-wiki.md
kb_sha: 40cd8fcc1429bcdfcf4100af4330391e872a2c9c
---

# LLM Wiki per Service

## Rule

**Every service repo carries a two-tier wiki** consuming this knowledge base as its raw source, per the ingestion contract (`_meta/ingestion.md`): the KB is ingested, never modified. The wiki is how a repo "carries the standard" ([[ddd#Enforcement]]) and how repo-local knowledge compounds instead of evaporating.

```
repo/
├── CLAUDE.md                  # generated — thin entry point, always loaded by agents
└── wiki/
    ├── SOURCES.lock           # KB repo + pinned SHA + sync date = the standard version this repo runs
    ├── manifest.yml           # which KB notes this repo consumes (frontmatter query)
    ├── standard/              # MIRROR — verbatim copies of KB notes, read-only, CI-checked
    └── local/                 # LLM-maintained — knowledge specific to this repo
```

## The two tiers

**`wiki/standard/` — deterministic mirror.** Selected KB notes copied **verbatim** (the mirror is flat, so `[[wikilinks]]` between mirrored notes resolve as-is; source path + KB SHA are stamped in the frontmatter). Formatters must exempt the mirror (e.g. `.prettierignore`) — byte fidelity is the contract. No LLM rewriting: for a standard, a copy beats a paraphrase — fidelity is the point. Nobody edits these files by hand; `make wiki-check` fails CI if they drift from what the pinned SHA derives.

**`wiki/local/` — the living layer.** Maintained by agents (and humans) as work happens: module maps, digested ADRs, gotchas, archived answers to recurring questions. It **cites** `standard/` and the code, never restates them. This layer compounds — it is the repo's memory.

**`CLAUDE.md` — the entry point.** Generated, short: repo map, the 12 rules at a glance, and the pointer — "architecture decisions: consult `wiki/standard/`; repo context: `wiki/local/`". Depth lives in the wiki (progressive disclosure), not in a bloated CLAUDE.md.

## Selection: `manifest.yml`

Selection is a **frontmatter query**, honoring the ingestion contract (filter on frontmatter, never on folders; prefer `status: stable`; respect `lang`):

```yaml
kb: E-Sensia/knowledge-base
select:                                  # a note matches ANY select entry…
  - where: { domain: tech, status: stable }
exclude:                                 # …and NO exclude entry
  - where: { tags_any: [typescript, nextjs, python, fastapi] }   # other stacks (Go repo shown)
```

`where` matches frontmatter fields (`domain`, `type`, `status`, `lang` by equality; `tags_any` by intersection). A backend repo does not mirror `business/` or another stack's pages. `entity` notes bridging to business concepts may be included where the repo touches them. The sync derives from `git archive` of the pinned SHA — only **committed** KB content is ever mirrored.

## Mechanics

- **`make wiki-sync`** — shallow-clone the KB, apply the manifest, rewrite `standard/`, update `SOURCES.lock` with the KB SHA. The result is a reviewable diff: a standard change is *visible* in the repo's PR.
- **`make wiki-check`** — part of `make ci` ([[makefile]]): re-derives `standard/` from the locked SHA and compares. Manual edits or drift fail the build. The SHA pin **is** the standard version the repo carries.
- **Propagation** — V1: run `wiki-sync` when the KB changes. V2: a KB workflow dispatches "standard bump" PRs to all service repos (Dependabot-style). Cross-repo private access needs a fine-grained PAT or GitHub App with `contents:read` on the KB.
- The sync script is deterministic (~no LLM) and lives with the KB, versioned once, used by all repos.

## What agents do with it

- Before an architecture-shaped decision: read the relevant `wiki/standard/` note — it is authoritative; deviations require an ADR ([[ddd#Enforcement]]).
- After learning something repo-specific worth keeping: write/update a `wiki/local/` article (one topic per note, cite sources).
- Never edit `wiki/standard/` — change the KB instead, then `wiki-sync`.
- Query answers worth keeping are archived in `local/`, marked as such.

## Why not the alternatives

- **Git submodule of the KB**: version pin for free, but ships the *entire* KB (business, projet, equipe) into every service, plus submodule friction. Manifest + lock gives the same pin without the burden.
- **Links only, no local copy**: nothing available offline or in CI, no version check possible.
- **LLM-compiled standard per repo**: non-deterministic, unreviewable, semantic drift. The LLM only maintains `local/`.

## Prerequisite

The ingestion contract prefers `status: stable` — a note is "published" to the derived wikis by flipping its status. Validated notes must move `review` → `stable` before the first sync, or the manifest must temporarily accept `review` during bootstrap.

## Related

- [[ddd]] — Enforcement section ("each repo carries the standard")
- [[makefile]] — `wiki-sync` / `wiki-check` targets
- `_meta/ingestion.md` — the KB-side contract this convention consumes

*Defined 2026-07-02 — to be implemented in the three templates, then every service.*
