# scripts

## Purpose

Import Obsidian notes, validate source entries, generate Hugo content, and check the built site.

## Current TODO

- None for this refactor.

## Index

- No subfolders. See the files in this directory.

## Important files

- [publish-reusable.mjs](publish-reusable.mjs)
- [ensure-reusable-id.mjs](ensure-reusable-id.mjs)
- [import-reusable.mjs](import-reusable.mjs)
- [build-content.mjs](build-content.mjs)
- [check-site.mjs](check-site.mjs)

## publish-reusable.mjs

`node scripts/publish-reusable.mjs <note.md>` is the whole pipeline in one call: ensure the note's `reusable-id`, import the note and its attachments, run the same validation CI runs, commit just that entry's files, and push. It chdirs to the repository root first, so an agent working in `~/Documents/road` can run it by absolute path from anywhere. Nothing is committed when validation fails, and nothing is committed when the import changed no files. Flags: `--dry-run`, `--no-push`, `--no-commit`, `--message`, plus `--id`/`--kind`/`--title`/`--summary`/`--date`/`--draft` passed through to the importer.

## ensure-reusable-id.mjs

`npm run id -- <note.md>` writes a `reusable-id` into the note's front matter when that field is empty or missing, and prints the id on stdout. The id is slugged from the filename and suffixed (`-2`, `-3`) if an entry already owns it. An id that is already set is never regenerated — it is the entry's identity, and changing it would fork the entry into a second page. `--dry-run` prints without writing; `--quiet` keeps stdout to the id alone.

## import-reusable.mjs

`npm run import -- <note.md>` turns an Obsidian note into `entries/reusable/<id>/`. It reads `reusable.config.json` for the template path and the asset roots, resolves `![](assets/…)` and `![[embeds]]` against those roots (by relative path first, then by filename anywhere beneath them), copies each hit into `static/media` under an id-prefixed name, rewrites `[[wikilinks]]` into links to matching entries, shifts note headings below the section headings it emits, and writes `entry.json`, `content.md`, and a folder README. Code fences are never treated as headings.

It reads the id from `reusable-id` in the front matter first (then `id`, then the filename), so a note keeps its entry across renames. Section headings are matched through `sectionAliases` in `reusable.config.json`, which is how a note still headed `# Use Guide:` lands in `## User Guide`. Sections are emitted in the order `sections` lists them: Description, User Guide, Content, Relevant Reusables, Change Logs.

Re-running on the same note is the update path: it preserves the existing `date`, `draft`, `aliases`, and `comments`, and refreshes everything else. Flags: `--dry-run`, `--id`, `--kind`, `--title`, `--summary`, `--date`, `--draft`. It warns about media it could not resolve and about images with no alt text. Only the importer reads `reusable.config.json` paths, so CI never touches the vault.

## Changelog

- 2026-09-14 — Added `publish-reusable.mjs` (one command from vault note to pushed site) and `ensure-reusable-id.mjs` (stable `reusable-id` for overwrite-on-republish). The importer now keys identity on `reusable-id`, accepts section aliases, and emits Content before Relevant Reusables and Change Logs; "Use Guide" became "User Guide".

- 2026-09-12 — Added `import-reusable.mjs` so entry.json is generated from an Obsidian note instead of hand-authored; `build-content.mjs` now enforces the Reusable version 1 section contract.

- 2026-09-12 — Restricted entry generation and output checks to Reusable, and made the check reject a stale published Journal route.

- 2026-09-11 — check-site.mjs checks README coverage from the repository root, exempting machine-generated directories, and verifies route/search output.

- 2026-09-11 — Established the minimal Hugo structure; important files: `build-content.mjs`, `check-site.mjs`.
