# layouts/shortcodes

## Purpose

Helpers for references to centralized media, and the countdown block.

## Current TODO

- None for this refactor.

## Index

- No subfolders. See the files in this directory.

## Important files

- [media.html](media.html)
- [countdown.html](countdown.html)
- [language.html](language.html) — Wrap translated Markdown in `{{< language en >}}…{{< /language >}}` or `zh`; one page-level control switches all blocks together. Keep Reusable's required section headings outside the blocks.

## Changelog

- 2026-09-14 — Added `language.html` for single-language reading of translated Reusables.
- 2026-09-11 — Added countdown.html: `{{< countdown target="<RFC 3339 instant>" deadline="<display text>" label="<heading>" >}}`. Markdown cannot carry raw HTML because goldmark runs with `unsafe = false`, so this shortcode is the only way to place the clock in an entry.

- 2026-09-11 — Established the minimal Hugo structure; important files: `media.html`.
