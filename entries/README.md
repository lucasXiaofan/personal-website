# entries

## Purpose

Canonical content sources shared by Reusable and Journal.

## Current TODO

- None for this refactor.

## Index

- [reusable](reusable/README.md) — Blog posts, systems, tutorials, and projects.
- [journal](journal/README.md) — Future thoughts, daily notes, and experiments.
## Authoring

Create `reusable/<id>/` or `journal/<id>/`, with entry.json, content.md, and README.md. Copy the metadata shape of an existing entry, change id/type/kind/title/date/summary, then write Markdown. Add media to static/media and declare attachments. Run npm run validate, then npm run build. Update this index and the affected parent README when adding a folder. Do not edit .generated or public.


## Changelog

- 2026-09-11 — Split the combined Reusable Projects bundle into two independent project entries.

- 2026-09-11 — Established this directory in the minimal Hugo refactor; documented its purpose and contents.
