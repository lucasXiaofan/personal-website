# schemas

## Purpose

The JSON contract for Reusable entries.

## Current TODO

- Extend reserved comment metadata when the future integration is designed.

## Index

- No subfolders. See the files in this directory.
## Contract

Each entry folder contains `entry.json`, `content.md`, and `README.md`. The JSON content property must be `content.md`; type is `reusable`, and id matches its folder. IDs are immutable, globally unique, lowercase slugs. Dates use YYYY-MM-DD. Optional draft=true prevents publishing. Use attachments[].path as a filename inside static/media, and Markdown images as /media/filename. Declare all body media in attachments with alt text and kind. Comments are reserved metadata only; no fetching, posting, scheduling, or rendering exists. Never put credentials in content.

Kinds: blog, system, tutorial, project, paper, skill, knowledge, character. Optional aliases preserve earlier URLs. The first image in attachments is the Reusable listing thumbnail; put the preferred cover first. Entries without an image remain text-only. Changing the schema requires updating its version and migration guidance when incompatible.

`entry.json` is generated, not authored. Write the note in Obsidian and run `npm run import`; see [scripts](../scripts/README.md) and `reusable.config.json`.

## Reusable version 1

The Markdown body carries the shape; the JSON carries only what Hugo needs. An entry tagged `reusable_version_1` must contain `## Description` and `## Use Guide`, and may contain `## Relevant Reusables`, `## Change Logs`, and `## Content`, in that order. `build-content.mjs` enforces the required sections and fails the build when one is missing. A cover image or shortcode may precede `## Description`. The live reference is [/reusable/reusable-schema/](../entries/reusable/reusable-schema/content.md).

## Migration

Version 3 makes `attachments` and `comments` optional, and adds the skill, knowledge, and character kinds. Existing version 2 entries only need `schema_version` changed from 2 to 3; empty `attachments` and disabled `comments` may be deleted. Entries adopting Reusable version 1 additionally need the `reusable_version_1` tag and the two required Markdown sections.

Version 2 removed Journal support. Journal bundles are no longer valid sources; remove them or deliberately rewrite them as Reusable entries with an appropriate supported kind.


## Important files

- [entry.schema.json](entry.schema.json)

## Changelog

- 2026-09-12 — Released schema version 3: optional `attachments`/`comments`, and the skill, knowledge, and character kinds. Documented the Reusable version 1 Markdown section contract that `build-content.mjs` enforces.

- 2026-09-12 — Released schema version 2, removing Journal types and Journal-only kinds from `entry.schema.json`.

- 2026-09-11 — entry.schema.json adds the backward-compatible paper kind; documented the first-image thumbnail convention.

- 2026-09-11 — Established the minimal Hugo structure; important files: `entry.schema.json`.
