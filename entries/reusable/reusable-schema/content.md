## Description

A Reusable is one folder holding one thing worth picking back up — a script, a piece of knowledge, a character, a project, a paper. It is written for two readers at once: me, six months from now, and an agent that has never seen it. Both need the same two things first — *what is this* and *how do I use it* — so those are the only required sections.

This is version 1 of that shape. Every entry tagged `reusable_version_1` follows it, and the build fails if one does not.

## User Guide

Write the note in Obsidian from `template/reusable.md`, then publish it with one command — from any directory, so an agent working in the vault never needs to know about Hugo:

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs \
  ~/Documents/road/problem-solving-library/reusable/min-hash.md
```

That fills in the note's `reusable-id`, imports the note and its images, validates every entry, then commits and pushes so the site rebuilds itself. Use `--dry-run` to see the result first, `--no-push` to stop at the commit, `--no-commit` to stop at the working tree.

### Identity

Every note carries a `reusable-id` in its front matter. Leave it empty and the first publish fills it in from the filename, writing it back into the note. From then on that id is the entry: publishing the same note again **overwrites** `entries/reusable/<id>/` — new content, same URL, same date — even if the file has been renamed since. Two notes must never share an id, and an id is never edited by hand once published, or the entry forks into two pages.

To import without publishing:

```sh
npm run import -- ~/Documents/road/problem-solving-library/reusable/min-hash.md
npm run build
```

The importer resolves `![](assets/…)` and `![[embeds]]` against the asset roots in `reusable.config.json`, copies what it finds into `static/media`, turns `[[wikilinks]]` into links between entries, and writes `entry.json` for you. Never hand-edit `entry.json` — re-run the import instead; it preserves the original date, aliases, and draft flag.

Add `--dry-run` to see the result without writing, and `--kind`, `--title`, `--id`, or `--summary` to override what the note implies.

## Content

### The five sections

| Section | Required | What goes in it |
| --- | --- | --- |
| Description | yes | Why this exists and what it solved, like a paper's abstract. For a `paper`, it *is* the abstract. Link the project if there is one. |
| User Guide | yes | The command to run, the daily habit, the question to ask. Concrete enough to act on without reading further. |
| Content | no | Everything else: the full write-up, the notes, the practice problems. Optional by design — many entries are just a description and a command. |
| Relevant Reusables | no | Links to other entries. In Obsidian, write `[[their-id]]`; the importer resolves it. |
| Change Logs | no | Newest first, dated. What changed and why. |

They render in that order. Description, User Guide and Content are what a reader came for; Relevant Reusables and Change Logs are bookkeeping, so they sit at the bottom of the page.

An image or a shortcode may appear above `## Description` as a cover; the first image attachment becomes the listing thumbnail.

### Kinds

`skill` for helper scripts, `knowledge` for something learned, `character` for story writing, plus `blog`, `system`, `tutorial`, `project`, and `paper`.

The shape bends per kind rather than growing new fields. A `knowledge` entry's User Guide is the set of questions to answer, and its Content holds practice examples with the answers folded away:

```markdown
<details><summary>Answer</summary>

…

</details>
```

A `character` entry leads with the image, describes who they are, and keeps the stories so far under Content.

### Language

Sections headings stay English so the format is one thing everywhere. Bodies are written in whichever language the thinking happened in — search indexes Chinese and English alike.

## Relevant Reusables

- [ReferralChallenge](/reusable/referral-challenge/) — the entry this format was first shaped around.
- [Improving Multi-candidate Speculative Decoding](/reusable/improving-multi-candidate-speculative-decoding/) — a `paper`, where Description is the abstract.

## Change Logs

- 2026-09-14 — Renamed Use Guide to User Guide, moved Content above Relevant Reusables and Change Logs, and added the `reusable-id` identity rule and the one-command publish.

- 2026-09-12 — Version 1. Five sections, two of them required. Added the `skill`, `knowledge`, and `character` kinds; added the Obsidian importer; made `attachments` and `comments` optional in schema version 3.
