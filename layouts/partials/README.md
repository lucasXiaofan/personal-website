# layouts/partials

## Purpose

Shared article-list markup and embedded discussions.

## Current TODO

- None for this refactor.

## Index

- No subfolders. See the files in this directory.

## Important files

- [entry.html](entry.html)
- [comments.html](comments.html) — giscus on every Reusable and Decision Log detail page. Reusables use strict specific-term mapping `reusable/<immutable-id>`; the first comment or reaction creates the thread automatically. Decisions retain their explicit discussion numbers. No secrets or API calls are needed during the build.

## Changelog

- 2026-09-14 — Extracted shared comments markup and enabled independent, automatically created discussions for all current and future Reusables.
- 2026-09-14 — Handle missing attachments for text-only Decision Log entries in the shared listing.
- 2026-09-11 — entry.html displays the first image attachment beside Reusable entries; entries without images remain text-only.

- 2026-09-11 — Established the minimal Hugo structure; important files: `entry.html`.
