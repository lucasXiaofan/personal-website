# content/decision-log

## Purpose

Public bilingual daily plans extracted from explicitly selected diary Plan sections.

## Current TODO

- None.

## Index

- No subfolders.
- [_index.md](_index.md) — Section introduction.
- Dated `YYYY-MM-DD.md` pages — Reviewed English and Chinese decisions, with a GitHub discussion link.

## Authoring

Use `scripts/publish-decision.mjs <diary.md> --extract`, reword and translate only the extracted Plan into a reviewed file, then pass it with `--body <file>`. Default execution stages locally. `--push` creates/reuses the discussion and publishes. Diaries and their Log sections are never copied here. The date is the stable identity.

## Changelog

- 2026-09-14 — Added Decision Log and the September 13 and 14 bilingual plans.
