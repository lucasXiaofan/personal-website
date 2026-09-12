# scripts

## Purpose

Import Obsidian notes, validate source entries, generate Hugo content, and check the built site.

## Current TODO

- None for this refactor.

## Index

- No subfolders. See the files in this directory.

## Important files

- [import-reusable.mjs](import-reusable.mjs)
- [build-content.mjs](build-content.mjs)
- [check-site.mjs](check-site.mjs)

## import-reusable.mjs

`npm run import -- <note.md>` turns an Obsidian note into `entries/reusable/<id>/`. It reads `reusable.config.json` for the template path and the asset roots, resolves `![](assets/…)` and `![[embeds]]` against those roots (by relative path first, then by filename anywhere beneath them), copies each hit into `static/media` under an id-prefixed name, rewrites `[[wikilinks]]` into links to matching entries, shifts note headings below the section headings it emits, and writes `entry.json`, `content.md`, and a folder README. Code fences are never treated as headings.

Re-running on the same note is the update path: it preserves the existing `date`, `draft`, `aliases`, and `comments`, and refreshes everything else. Flags: `--dry-run`, `--id`, `--kind`, `--title`, `--summary`, `--date`, `--draft`. It warns about media it could not resolve and about images with no alt text. Only the importer reads `reusable.config.json` paths, so CI never touches the vault.

## Changelog

- 2026-09-12 — Added `import-reusable.mjs` so entry.json is generated from an Obsidian note instead of hand-authored; `build-content.mjs` now enforces the Reusable version 1 section contract.

- 2026-09-12 — Restricted entry generation and output checks to Reusable, and made the check reject a stale published Journal route.

- 2026-09-11 — check-site.mjs checks README coverage from the repository root, exempting machine-generated directories, and verifies route/search output.

- 2026-09-11 — Established the minimal Hugo structure; important files: `build-content.mjs`, `check-site.mjs`.
