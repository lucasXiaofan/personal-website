# layouts

## Purpose

Minimal Hugo page templates and rendering rules.

## Current TODO

- None for this refactor.

## Index

- [_markup](_markup/README.md) — Render centralized media correctly on GitHub project Pages.
- [partials](partials/README.md) — Reusable article-list markup.
- [shortcodes](shortcodes/README.md) — Helpers for references to centralized media.

## Important files

- [baseof.html](baseof.html)
- [home.html](home.html)
- [list.html](list.html)
- [single.html](single.html)
- [home.json](home.json)

## Changelog

- 2026-09-12 — `single.html` shows the entry kind and tags, and now opens the table of contents for any entry with five or more headings (`.Fragments.HeadingsMap`) instead of excluding projects by kind.

- 2026-09-12 — Removed Journal navigation, page handling, and search indexing; `home.html` now reuses the Reusable section introduction.

- 2026-09-11 — Established the minimal Hugo structure; important files: `baseof.html`, `home.html`, `list.html`, `single.html`, `home.json`.
