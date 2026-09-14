# XiaoFan's website

## Purpose

Publish reusable knowledge, projects, and a personal FAQ through a minimal Hugo website.

## Current TODO

- Review and maintain personal information in FAQ and the existing resume.
- Design the future comments pipeline separately; no comment integration is implemented.

## Index

- [.github](.github/README.md) — Build and GitHub Pages automation.
- [content](content/README.md) — Section introductions and FAQ.
- [entries](entries/README.md) — Canonical JSON metadata and Markdown bodies.
- [layouts](layouts/README.md) — Minimal page templates, shared markup, and media helpers.
- [schemas](schemas/README.md) — Shared content schema and reserved comment metadata.
- [scripts](scripts/README.md) — Validation, conversion, and output checks.
- [static](static/README.md) — Styles, search, and centralized media.
- [hugo.toml](hugo.toml) — Domain, build options, outputs, and directory mounts.
- [reusable.config.json](reusable.config.json) — Obsidian template path, asset roots, and the Reusable version 1 section contract.
- [package.json](package.json) — Repeatable local and CI commands.
- [LICENSE.md](LICENSE.md) — Existing repository license.

## For AI coders: directory documentation is part of the code

Every maintained source directory, including hidden automation directories, must contain README.md. Before editing a folder, read its README and the relevant parent README. In the same change, keep affected documentation current:

1. **Purpose:** one short sentence describing what the folder does.
2. **Current TODO:** only unfinished work; remove completed items.
3. **Index:** link to every immediate subfolder's README and briefly explain its role. Mention important files when useful.
4. **Changelog:** date (YYYY-MM-DD; time with timezone when useful), concise change summary, and important changed filenames. Move completed TODOs here.

Apply this recursively when adding or moving folders. Exempt .git, node_modules, public, .generated, caches, and temporary tool output: these are machine-managed, not authored source. Keep those outputs ignored. Never publish README files as pages or static downloads. Preserve original article wording unless the user requests editorial changes. Comment metadata is reserved; do not implement a comments pipeline until requested.

The project check verifies README coverage for maintained source directories.

## What GitHub Pages reads

GitHub Pages serves the final HTML/CSS/JS artifact; the homepage is public/index.html. It does not turn an arbitrary JSON file into a site on its own.

1. Write the Obsidian note and run `npm run import -- <note.md>`, which writes entries/reusable/<id>/entry.json and content.md.
2. scripts/build-content.mjs validates entry.json against schemas/entry.schema.json and produces ignored .generated/<type>/<id>/index.md.
3. Hugo mounts .generated as content and applies layouts using hugo.toml.
4. Hugo writes public/, including index.html, section pages, RSS, and the search index index.json.
5. .github/workflows/publish.yaml runs on a push to main or manual dispatch, builds and checks the output, then uploads public/ to GitHub Pages.

The repository's Pages source is already set to **GitHub Actions**, so GitHub serves the uploaded artifact rather than the contents of a branch. Merely editing a local file does not change the live site; commit and push to main to trigger deployment.

## Continuous deployment

Pushing to main publishes the site; there is no manual build or upload step. No `.nojekyll`, `CNAME`, `docs/` folder, or committed `public/` is required, and `public/` stays ignored.

`.github/workflows/publish.yaml` runs on a push to main or manual dispatch:

1. `actions/checkout@v4`, then `actions/setup-node@v4` (Node 24, npm cache) and `npm ci`, which needs package-lock.json to be committed and in sync.
2. `peaceiris/actions-hugo@v3` pinned to Hugo 0.166.0. The standard edition is sufficient because no template uses SCSS or Sass.
3. `actions/configure-pages@v5` resolves the published base URL.
4. `node scripts/build-content.mjs` validates entries and writes `.generated/`.
5. `hugo --gc --minify --cleanDestinationDir --baseURL <pages base URL>/`, which removes stale output and overrides the baseURL in hugo.toml so the project subpath stays correct.
6. `npm run check` gates the release; a broken route, a missing directory README, or a README leaking into `public/` fails the deploy before anything is published.
7. `actions/upload-pages-artifact@v3` uploads `public/`, then `actions/deploy-pages@v4` publishes it.

A failed build leaves the previously deployed site untouched. Deployments are serialized by the `pages` concurrency group. Follow a run with `gh run watch` or the repository's Actions tab.

History is not fetched with `fetch-depth: 0` because entry dates come from entry.json front matter, not from `.GitInfo` or `.Lastmod`.

## Local workflow

Requires Node.js 24 and Hugo 0.166.0 (standard edition; no external theme or Go modules).

```sh
npm ci
npm run import -- <note.md>
npm run validate
npm run build
npm run check
npm run dev
```

The development server is at http://127.0.0.1:1313/personal-website/. When editing entry JSON or Markdown while the server runs, execute `node scripts/build-content.mjs` again; Hugo watches the generated content. A full build regenerates content automatically.

## Reusable version 1

Every entry is one folder holding one thing worth picking back up, written for me and for an agent at the same time. Its Markdown carries five sections, in this order — **Description**, **User Guide**, **Content**, **Relevant Reusables**, **Change Logs** — of which the first two are required and enforced by the build. Description is why it exists and what it solved (for a paper, the abstract); User Guide is the command, habit, or question that puts it to work; Content is optional. Relevant Reusables and Change Logs come last because a reader needs them least. Kinds are blog, system, tutorial, project, paper, skill, knowledge, and character. The format documents itself at [/reusable/reusable-schema/](entries/reusable/reusable-schema/content.md).

## Authoring from Obsidian

`entry.json` is generated, not written by hand.

One command takes a note from the vault to the live site — it is runnable from any directory, so an agent working in `~/Documents/road` can publish without knowing this repository's layout:

```sh
node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs <note.md>
```

It fills in the note's `reusable-id` when empty, imports the note and its attachments, validates, commits, and pushes. `--dry-run`, `--no-push`, and `--no-commit` stop it early.

The `reusable-id` in the note's front matter is the entry's identity: publishing a note that already carries one overwrites that entry rather than creating a second page, whatever the file has been renamed to.

The steps underneath, when you want them one at a time:

```sh
npm run id -- ~/Documents/road/problem-solving-library/reusable/min-hash.md
npm run import -- ~/Documents/road/problem-solving-library/reusable/min-hash.md
npm run build
```

`reusable.config.json` names the Obsidian template and the asset roots to search. The importer resolves `![](assets/…)` and `![[embeds]]` against those roots, copies the files it finds into `static/media` with an id-prefixed name, declares them as attachments, converts `[[wikilinks]]` into links between entries, and shifts the note's headings beneath the section headings. Re-run it on the same note to update an entry; the original date, draft flag, and aliases survive. Use `--dry-run` to preview and `--kind`, `--title`, `--id`, or `--summary` to override.

Only the importer reads those vault paths, so CI never needs the Obsidian folder. Set draft true until an entry is ready. Dates are ISO dates; future dates remain unpublished under Hugo's default policy.

## Content and media

Each Reusable bundle contains entry.json, content.md, and README.md. The content property points to Markdown; JSON contains metadata, tags, attachment references, and reserved comment fields. The immutable id matches the folder name.

All media live in static/media. Reference an image in Markdown as `![descriptive alt text](/media/filename.png)` and declare it in attachments. The image render hook adds the GitHub project subpath correctly. For a document link use the media shortcode (see FAQ). Long-form Markdown stays readable in Obsidian.

Homepage and /reusable/ show Reusable; /faq/ contains the personal introduction. Search is a keyboard-accessible dialog on every page (Search button or /; Escape closes). It indexes published Reusable text, including Chinese, and excludes FAQ, drafts, and README files. Search is a literal case-insensitive substring search, not fuzzy/semantic search.

Old /post/typical-sampling/ redirects to its new Reusable URL; /about_me/ redirects to FAQ. ZotNavigator and The Last Crucible are separate Reusable entries. The former /game/ and /reusable/projects/ addresses redirect to the Reusable listing.

## Changelog

- 2026-09-12 — Defined Reusable version 1 and rewrote all five existing entries to it, each tagged `reusable_version_1`; added `/reusable/reusable-schema/` as the format's own page. Added `scripts/import-reusable.mjs` and `reusable.config.json` so entries are imported from Obsidian instead of hand-authored, with Obsidian image and wikilink resolution. Released schema version 3. Important files: `reusable.config.json`, `scripts/import-reusable.mjs`, `schemas/entry.schema.json`, `entries/reusable/`, `layouts/single.html`.

- 2026-09-12 — Removed the unused Journal section and its navigation/search support. Removed the duplicate homepage content stub; the homepage now reuses the Reusable section introduction. Migrated Reusable metadata to schema version 2 and made builds clean stale output so removed routes cannot remain in `public/`. Important files: `content/`, `entries/`, `layouts/`, `scripts/`, `schemas/entry.schema.json`, `package.json`, `.github/workflows/publish.yaml`.

- 2026-09-11 — Added the ReferralChallenge entry and a reusable countdown shortcode. Important files: `entries/reusable/referral-challenge/`, `layouts/shortcodes/countdown.html`, `static/js/countdown.js`.

- 2026-09-11 — Published the refactored site and documented the push-to-deploy pipeline; verified the full CI sequence locally against the published base URL. Important files: `.github/workflows/publish.yaml`, `README.md`.

- 2026-09-11 — Added thumbnails to Reusable, a first-paper overview with Figure 1, and YouTube/Google Scholar links in FAQ. The first image attachment supplies each listing thumbnail.

- 2026-09-11 — Split Projects into entries/reusable/zotnavigator/ and entries/reusable/the-last-crucible/ with separate pages and search results; retained media and links, and redirected the combined page to Reusable.

- 2026-09-11 — Replaced the old Hugo Blox starter with minimal owned templates; pinned Hugo 0.166.0 in publish.yaml; retained Typical Sampling and Projects; moved About Me into FAQ; removed starter posts, obsolete notebook/configuration, and unused starter media (recoverable from Git history).
- 2026-09-11 — Added shared entry.schema.json, JSON/Markdown bundles, centralized static/media, build-content.mjs, site search dialog, and recursive directory READMEs. Reserved comment fields only; no integration.
