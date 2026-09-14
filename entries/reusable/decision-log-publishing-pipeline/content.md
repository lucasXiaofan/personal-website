## Description

Turn one diary's Plan section into a public, bilingual Decision Log entry with a GitHub discussion. Keep the priority order, reasons, and task status while making the writing easier to review. The rest of the diary stays private.

把日记中的 Plan 部分整理为中英双语 Decision Log，保留优先级、原因和任务状态，并关联 GitHub 讨论。日记的其他部分不发布。

## User Guide

### 1. Extract one plan

From any directory:

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-decision.mjs ~/Documents/road/FLOW/diary/2026-09-14.md --extract
```

The helper prints only the text after `# ⏰ Plan:` and before `# 📕 Log:`. It refuses missing, duplicate, reversed, or empty boundaries. It never edits the diary.

### 2. Reword and translate

Ask an agent to rewrite only that extracted text into a Markdown file such as `/tmp/decision-reviewed.md`, with `## English` and `## 中文` sections. Preserve priority order, completed/pending status, dates, names, reasons, and uncertainty. Remove private Obsidian paths; never import the Log or infer extra decisions. Review both versions.

The script does not call a translation service or send the diary to an API. Translation is an explicit writing step, so you can check the result before publishing.

### 3. Stage locally

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-decision.mjs ~/Documents/road/FLOW/diary/2026-09-14.md --body /tmp/decision-reviewed.md
```

This creates or updates `content/decision-log/2026-09-14.md` and builds/checks the site. No commit, push, or discussion is created by default. The date in the diary filename is the stable identity: the same date updates the same page.

### 4. Publish the reviewed result

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-decision.mjs ~/Documents/road/FLOW/diary/2026-09-14.md --body /tmp/decision-reviewed.md --push
```

This creates a discussion if needed, links it from the page, commits only that day's page, and pushes to `main`. The GitHub Pages workflow deploys it. It needs `gh` signed in with repository write access and GitHub Discussions enabled. Comments are written on GitHub through the page's discussion link; readers need a GitHub account to participate.

## Content

### Publication boundary

The helper accepts exactly one dated diary, never scans a directory, and never publishes the raw plan by default. Only the reviewed bilingual body goes into the page. The extracted plan is used to verify the source boundary; the helper cannot judge whether a translation is faithful, so review remains essential.

### Re-publishing

Keep the date and re-run with the updated reviewed body. The page keeps its existing discussion. The discussion opener links to the page instead of duplicating its content, so later edits do not leave a stale translation in the thread. `--push` retries the push even if the page is already committed.

### Failure recovery

If GitHub access fails, the staged page remains local. Sign in with `gh auth login`, enable Discussions in the repository settings if needed, and retry. If the push fails, resolve the reported Git issue and retry; the helper never force-pushes. It refuses publishing from a branch other than `main` or with unrelated changes already staged.

## Relevant Reusables

- [Reusable Building Pipeline](https://lucasxiaofan.github.io/personal-website/reusable/reusable-building-pipeline-20260914-1043/) — the corresponding workflow for full reusable notes.

## Change Logs

- 2026-09-14 — Added extraction, reviewed bilingual publication, stable daily URLs, and GitHub discussion links. Imported only September 13 and 14 initially.
