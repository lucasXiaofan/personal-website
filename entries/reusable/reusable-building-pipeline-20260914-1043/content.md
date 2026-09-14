## Description

A standard for building reusables, so that quality and speed stop competing. Quality means I can still understand a reusable a year later, and someone else can work out how to use it about 70% of the way on their own. Speed means the distance from "the note is written" to "the note is on the site" is one command and one yes.

The standard has two halves: the shape every note takes (Description, User Guide, Content, Relevant Reusables, Change Logs, from `template/reusable.md`) and the pipeline below that carries that shape to the website without me touching Hugo, JSON, or git.

## User Guide

### Publishing, in two steps

**Step 1 — stage.** From anywhere:

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs <note.md>
```

This fills in the note's `reusable-id` if empty, imports the note and its attachments into `entries/reusable/<reusable-id>/`, runs the same validation CI runs, and then **stops**. Nothing is committed, nothing is pushed. It prints what changed and where to read it.

**Step 2 — review, then approve.** Read the staged `content.md`. If an agent wrote or rewrote any of it, this is where I see the rewrite before anyone else does. Only when I say yes:

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs <note.md> --push
```

That commits just this entry's files and pushes; the deploy workflow takes it live. `--commit` stops at the commit. `--dry-run` prints the result and writes nothing at all.

The split is the point: **the default can never publish.** `--push` is the recorded form of my permission, so no agent can put writing on the site that I have not read.

### Other flags

`--force-id` regenerates the id (it orphans the old URL — rarely what you want). `--kind`, `--title`, `--summary`, `--id`, `--date`, `--draft` override what the note implies and are passed to the importer.

### Rules

- **`reusable-id` is identity.** Publishing a note that already has one overwrites that entry — same URL, same original date, new content — even after the file is renamed. Never hand-edit an id that has been published, or the entry forks into two pages.
- **Never hand-edit `entry.json`.** Re-publish the note instead; the import preserves the original date, aliases, and draft flag.
- **Section headings are the contract.** Description and User Guide are required; the build fails without them.
- **Write in Obsidian, always.** The vault is the source; the repository is a rendering of it.

## Content

> depends on types

![The reusable building pipeline, by reusable type](/media/reusable-building-pipeline-20260914-1043-file-20260914104227199.png)

### Identity: the reusable-id

Each reusable carries a `reusable-id` in its front matter, generated on first publish and written back into the note. Re-uploading a note with the same id is not a new page — the site finds the matching entry and treats the upload as an overwrite.

The id is `<filename-slug>-<YYYYMMDD>-<HHMM>`, for example `reusable-building-pipeline-20260914-1043`. The filename alone is not enough: I will write a second `notes.md` or `pipeline.md` eventually, and two entries can never share an id. The timestamp is the note's creation moment — taken from `created_at` in the front matter when present, otherwise from the file's own birth time — so the id also says *when this reusable started*, which is exactly the thing I want to know when two similar notes sit next to each other.

### Layout: order by what a reader needs

A reusable renders Description → User Guide → Content → Relevant Reusables → Change Logs. The first three are what a reader came for. Relevant Reusables and Change Logs are bookkeeping and belong at the bottom. The order lives in `sections` in `reusable.config.json`, and `sectionAliases` maps the older `Use Guide` heading onto `User Guide` so notes written before the rename still import cleanly.

### The permission gate

An agent may rewrite a reusable, but it may not publish one. The flow is: agent improves the wording of Description and Content → agent shows me the result → I approve → only then does `--push` run. Staging by default makes that gate structural rather than a matter of the agent remembering to ask.

### For a knowledge reusable

1. Find a high-quality YouTube video about the knowledge; failing that, a blog post or a paper.
	1. Summarize what I understood, then list what I did not.
2. Ask my questions. A question must be specific — a vague question gets a vague answer and teaches nothing.
3. Ask the AI to work through the questions I listed.
4. Ask the AI to generate practice questions on the same material, with the answers revealed only afterwards.
5. Ask the AI to improve the writing of the reusable, review the result myself, and approve before it is staged and pushed.

## Relevant Reusables

- [reusable-schema](/reusable/reusable-schema/) — the section shape this pipeline carries, and its live reference on the site.

## Change Logs

- 2026-09-14 — `reusable-id` now carries the note's creation date and time, not just the filename. Publishing stages by default and requires `--push` as explicit permission.
- 2026-09-14 — First version. Built `publish-reusable.mjs` and `ensure-reusable-id.mjs`, gave every reusable a `reusable-id` so re-publishing overwrites, renamed Use Guide to User Guide, and moved Content above Relevant Reusables and Change Logs.
