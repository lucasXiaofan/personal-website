# entries

## Purpose

Canonical source bundles for Reusable entries.

## Current TODO

- None for this refactor.

## Index

- [reusable](reusable/README.md) — Blog posts, systems, tutorials, and projects.
## Authoring

Write the note in Obsidian from the template named in `reusable.config.json`, using the Reusable version 1 sections, then run `npm run import -- <note.md>` followed by `npm run build`. The importer creates `reusable/<id>/` with entry.json, content.md, and README.md, copies referenced images into static/media, and declares them as attachments. Re-run it to update; `entry.json` is generated and should not be hand-edited.

Hand-authoring stays possible for entries with no Obsidian source: copy the shape of an existing entry, keep the required `## Description` and `## User Guide` sections (in the order Description, User Guide, Content, Relevant Reusables, Change Logs), and run `npm run validate`. Update this index and the affected parent README when adding a folder. Do not edit .generated or public.


## Changelog

- 2026-09-12 — Entries are now imported from Obsidian rather than hand-authored; documented the `npm run import` path.

- 2026-09-12 — Removed the unused `journal/` source section; entries now contain Reusable bundles only.

- 2026-09-11 — Split the combined Reusable Projects bundle into two independent project entries.

- 2026-09-11 — Established this directory in the minimal Hugo refactor; documented its purpose and contents.
