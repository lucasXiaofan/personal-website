# .github/workflows

## Purpose

Build validated content and deploy it to GitHub Pages.

## Current TODO

- None for this refactor.

## Index

- No subfolders. See the files in this directory.

## Important files

- [publish.yaml](publish.yaml)

## Changelog

- 2026-09-12 — `publish.yaml` now builds with `--cleanDestinationDir` so deleted pages cannot survive in the uploaded artifact.

- 2026-09-11 — Verified the push-to-deploy pipeline end to end (Node 24, pinned Hugo 0.166.0, build-content, check-site, Pages artifact upload) and documented its steps in the root README. Important files: `publish.yaml`.
- 2026-09-11 — Established the minimal Hugo structure; important files: `publish.yaml`.
