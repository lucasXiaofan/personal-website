## Description

Turn one diary's Plan section into a public, bilingual Decision Log entry with a GitHub discussion. Keep the priority order, reasons, and task status while making the writing easier to review. The rest of the diary stays private.

The same pass also carries the day's **daily habits** — the `Dopamine-Control-Challenge:` and `trending-analysis:` lines that live in that same Plan section — into their tracker pages, so one publish updates the decision log and both heatmaps. Publishing the day is one command, not three.

把日记中的 Plan 部分整理为中英双语 Decision Log，保留优先级、原因和任务状态，并关联 GitHub 讨论。日记的其他部分不发布。同一趟还会把当天的每日习惯（Plan 里的 `Dopamine-Control-Challenge:` 和 `trending-analysis:` 两行）同步到各自的追踪页面：发布一次，决策日志和两张热力图一起更新。

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

It also runs `sync-habits.mjs --write`, which rewrites the heatmap dates in the habit notes in the vault. Those edits are local until step 4 — staging the decision log stages the habits too.

### 4. Publish the reviewed result

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-decision.mjs ~/Documents/road/FLOW/diary/2026-09-14.md --body /tmp/decision-reviewed.md --push
```

This creates a discussion if needed, links it from the page, commits only that day's page, and pushes to `main`. It then publishes each habit page the diary mentioned, through the usual `publish-reusable.mjs --push`. The GitHub Pages workflow deploys everything. It needs `gh` signed in with repository write access and GitHub Discussions enabled. Comments are written on GitHub through the page's discussion link; readers need a GitHub account to participate.

### Habits, on their own

The sync runs standalone too, which is what to use when a habit line is corrected after the decision log has already gone out:

```sh
node ~/Documents/github_repos/personal-website/scripts/sync-habits.mjs ~/Documents/road/FLOW/diary/2026-09-16.md
```

Default is a dry report. `--write` applies it to the vault notes; `--publish` also pushes the habit pages.

## Content

### What the sync will and will not do

The habit line is parsed only up to its first comma. Everything after it is prose, and prose must not vote: a line reading `success, I did not fail at L1, L2` is a success, because `fail` appears in the story rather than in the verdict. The same rule keeps a URL from being read as a date.

What it moves is dates, nothing else. `Dopamine-Control-Challenge:` needs exactly one verdict word before that comma — ambiguous or absent, and the publish stops rather than guessing an outcome onto a tracker. A leading date or range (`9/14 - 9/15 failed`) backfills; with no date the line means the diary's own day. Re-running is safe, and a corrected verdict *moves* the day between lists rather than colouring it twice.

For `trending-analysis:` there is no verdict to read — writing the line is the habit. But the script will not write the analysis. If a synced date has no `## <date>` section under `# Content:`, it says so and leaves the writing to me. **The tracker can be automated because it is bookkeeping; the thinking cannot be, so it is not.**

### Publication boundary

The helper accepts exactly one dated diary, never scans a directory, and never publishes the raw plan by default. Only the reviewed bilingual body goes into the page. The extracted plan is used to verify the source boundary; the helper cannot judge whether a translation is faithful, so review remains essential.

### Re-publishing

Keep the date and re-run with the updated reviewed body. The page keeps its existing discussion. The discussion opener links to the page instead of duplicating its content, so later edits do not leave a stale translation in the thread. `--push` retries the push even if the page is already committed.

### Failure recovery

If GitHub access fails, the staged page remains local. Sign in with `gh auth login`, enable Discussions in the repository settings if needed, and retry. If the push fails, resolve the reported Git issue and retry; the helper never force-pushes. It refuses publishing from a branch other than `main` or with unrelated changes already staged.

## Relevant Reusables

- [Reusable Building Pipeline](https://lucasxiaofan.github.io/personal-website/reusable/reusable-building-pipeline-20260914-1043/) — the corresponding workflow for full reusable notes.
- [dopamine-control-challenge](/reusable/dopamine-control-challenge/) — the habit tracker this pipeline fills in from the `Dopamine-Control-Challenge:` line.
- [trending-analysis](/reusable/trending-analysis-20260916-0942/) — the habit tracker this pipeline fills in from the `trending-analysis:` line.

## Change Logs

- 2026-09-16 — Publishing a decision log now also syncs the day's habits. Added `sync-habits.mjs`, which reads the `Dopamine-Control-Challenge:` and `trending-analysis:` lines out of the same Plan section and moves their dates into the heatmaps, then publishes those pages under `--push`. It refuses an unreadable verdict instead of guessing, and reports a trending date with no written section rather than inventing one.
- 2026-09-14 — Added extraction, reviewed bilingual publication, stable daily URLs, and GitHub discussion links. Imported only September 13 and 14 initially.
