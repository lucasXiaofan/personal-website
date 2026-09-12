## Description

A Reusable is one folder holding one thing worth picking back up — a script, a piece of knowledge, a character, a project, a paper. It is written for two readers at once: me, six months from now, and an agent that has never seen it. Both need the same two things first — *what is this* and *how do I use it* — so those are the only required sections.

This is version 1 of that shape. Every entry tagged `reusable_version_1` follows it, and the build fails if one does not.

## Use Guide

Write the note in Obsidian from `template/reusable.md`, then import it:

```sh
npm run import -- ~/Documents/road/problem-solving-library/reusable/min-hash.md
npm run build
```

The importer resolves `![](assets/…)` and `![[embeds]]` against the asset roots in `reusable.config.json`, copies what it finds into `static/media`, turns `[[wikilinks]]` into links between entries, and writes `entry.json` for you. Never hand-edit `entry.json` — re-run the import instead; it preserves the original date, aliases, and draft flag.

Add `--dry-run` to see the result without writing, and `--kind`, `--title`, `--id`, or `--summary` to override what the note implies.

## Relevant Reusables

- [ReferralChallenge](/reusable/referral-challenge/) — the entry this format was first shaped around.
- [Improving Multi-candidate Speculative Decoding](/reusable/improving-multi-candidate-speculative-decoding/) — a `paper`, where Description is the abstract.

## Change Logs

- 2026-09-12 — Version 1. Five sections, two of them required. Added the `skill`, `knowledge`, and `character` kinds; added the Obsidian importer; made `attachments` and `comments` optional in schema version 3.

## Content

### The five sections

| Section | Required | What goes in it |
| --- | --- | --- |
| Description | yes | Why this exists and what it solved, like a paper's abstract. For a `paper`, it *is* the abstract. Link the project if there is one. |
| Use Guide | yes | The command to run, the daily habit, the question to ask. Concrete enough to act on without reading further. |
| Relevant Reusables | no | Links to other entries. In Obsidian, write `[[their-id]]`; the importer resolves it. |
| Change Logs | no | Newest first, dated. What changed and why. |
| Content | no | Everything else: the full write-up, the notes, the practice problems. Optional by design — many entries are just a description and a command. |

An image or a shortcode may appear above `## Description` as a cover; the first image attachment becomes the listing thumbnail.

### Kinds

`skill` for helper scripts, `knowledge` for something learned, `character` for story writing, plus `blog`, `system`, `tutorial`, `project`, and `paper`.

The shape bends per kind rather than growing new fields. A `knowledge` entry's Use Guide is the set of questions to answer, and its Content holds practice examples with the answers folded away:

```markdown
<details><summary>Answer</summary>

…

</details>
```

A `character` entry leads with the image, describes who they are, and keeps the stories so far under Content.

### Language

Sections headings stay English so the format is one thing everywhere. Bodies are written in whichever language the thinking happened in — search indexes Chinese and English alike.
