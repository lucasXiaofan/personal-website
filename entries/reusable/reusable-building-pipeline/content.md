## Description

give reusable building a standard, to ensure quality (I can understand after one year, other people can understand how to use it 70%), and creation speed

## User Guide

One command takes this note — and any reusable note — from the vault to the live site. It works from any directory:

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs \
  ~/Documents/road/problem-solving-library/reusable/reusable-building-pipeline.md
```

What it does, in order:
1. `ensure-reusable-id.mjs` — if the note's `reusable-id` front matter is empty, it generates one from the filename (uniquified against published entries) and writes it back into the note.
2. `import-reusable.mjs` — splits the note into its sections, copies every attachment (markdown image links into `assets/`, and Obsidian embeds) into `static/media`, rewrites Obsidian wikilinks into links between entries, and writes `entries/reusable/<reusable-id>/`.
3. `build-content.mjs --check` — the same validation CI runs. A broken entry never reaches a commit.
4. `git add` / `commit` / `push` — only this entry's files, so unrelated work in the tree stays out of the commit. The deploy workflow takes it live.

Flags: `--dry-run` (show the result, write nothing), `--no-push` (stop at the commit), `--no-commit` (stop at the working tree), `--message "..."`, and `--kind` / `--title` / `--summary` / `--id` / `--date` / `--draft` passed through to the importer.

Rules to remember:
- **`reusable-id` is identity.** Publishing a note that already carries one overwrites that entry — same URL, same original date, new content — even after the file is renamed. Never hand-edit an id that has been published, or the entry forks into two pages.
- **Never hand-edit `entry.json`.** Re-publish the note instead.
- **Section headings are the contract.** Description and User Guide are required; the build fails without them.

## Content

> depends on types

![The reusable building pipeline, by reusable type](/media/reusable-building-pipeline-file-20260914104227199.png)

each reusable should have and reusable-id, so if I upload a md with same reusable-id it should find the matching resuable in the website, and consider the new upload as a overwrite, to update the content. 

also a fix of resuable layout, it should first show the description, use guide and content, relevant resuables and change logs should show after the content, as they are less important 
### for knowledge reusable
1. step1: find a high quality youtube video about this knowledge, if cannot find a blog, or paper
	1. summarize the important things that I understand then list questions 
2. step2: I need ask question, the question should be specific, and not vague
3. step3: ask ai to help me understand the question I listed, 
4. step4: ask ai to generate relevant question for me to practice, and reveal correct answer later
5. step5: ask ai to improve the writing of current reusable markdown, then I should see the result, and confirm to add change to /Users/xiaofanlu/Documents/github_repos/personal-website/entries/reusable, and push the changes in that project /Users/xiaofanlu/Documents/github_repos/personal-website

### The section order

A reusable renders as Description → User Guide → Content → Relevant Reusables → Change Logs. The first three are what a reader came for; the last two are bookkeeping and belong at the bottom of the page. `sections` in `reusable.config.json` owns that order, and `sectionAliases` maps the older `Use Guide` heading onto `User Guide` so notes written before the rename still import.

## Relevant Reusables

- [reusable-schema](/reusable/reusable-schema/) — the section shape this pipeline writes into.

## Change Logs

- 2026-09-14 — First version. Built `publish-reusable.mjs` and `ensure-reusable-id.mjs`, gave every reusable a `reusable-id` so re-publishing overwrites, renamed Use Guide to User Guide, and moved Content above Relevant Reusables and Change Logs.
