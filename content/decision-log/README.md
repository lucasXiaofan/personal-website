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

The preview summary is the first 20 words of the first English decision, with an ellipsis only when truncated. The publishing helper refreshes it on every upload; introductory prose, task markers, later decisions, and the Chinese translation are excluded.

Put all English prose under `## English` and all Chinese prose under `## 中文`, in that order. These headings are the rendering boundary for the remembered language switch; text before them is shared. Existing discussion URLs supply the giscus discussion number, so rewording or switching languages never creates a new thread. Install the giscus GitHub app on `lucasXiaofan/personal-website` to enable inline comments; the direct GitHub link works independently.

Use `scripts/publish-decision.mjs <diary.md> --extract`, reword and translate only the extracted Plan into a reviewed file, then pass it with `--body <file>`. Default execution stages locally. `--push` creates/reuses the discussion and publishes. Diaries and their Log sections are never copied here. The date is the stable identity.

## Changelog

- 2026-09-14 — Replaced generic bilingual previews with excerpts from the first English decision.
- 2026-09-14 — Moved introductory prose into the corresponding language sections for September 13–14; templates now offer language switching and inline giscus comments.
- 2026-09-14 — Added Decision Log and the September 13 and 14 bilingual plans.
