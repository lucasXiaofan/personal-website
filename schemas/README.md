# schemas

## Purpose

The shared JSON contract for both content sections.

## Current TODO

- Extend reserved comment metadata when the future integration is designed.

## Index

- No subfolders. See the files in this directory.
## Contract

Each entry folder contains `entry.json`, `content.md`, and `README.md`. The JSON content property must be `content.md`; type and id match its folder. Both types use entry.schema.json. IDs are immutable, globally unique, lowercase slugs. Dates use YYYY-MM-DD. Optional draft=true prevents publishing. Use attachments[].path as a filename inside static/media, and Markdown images as /media/filename. Declare all body media in attachments with alt text and kind. Comments are reserved metadata only; no fetching, posting, scheduling, or rendering exists. Never put credentials in content.

Kinds: blog, system, tutorial, project, paper, thought, daily, experiment. Optional aliases preserve earlier URLs. The first image in attachments is the Reusable listing thumbnail; put the preferred cover first. Entries without an image remain text-only. Changing the schema requires updating its version and migration guidance when incompatible.


## Important files

- [entry.schema.json](entry.schema.json)

## Changelog

- 2026-09-11 — entry.schema.json adds the backward-compatible paper kind; documented the first-image thumbnail convention.

- 2026-09-11 — Established the minimal Hugo structure; important files: `entry.schema.json`.
