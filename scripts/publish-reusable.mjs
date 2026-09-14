// Takes an Obsidian note from the vault to the live site, in two deliberate phases.
// Callable from anywhere (it chdirs to this repository), so an agent working in
// ~/Documents/road can publish without knowing anything about Hugo:
//
//   node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs <note.md>
//       stage:   id -> import -> validate, and stop. Changes sit in the working tree for review.
//   node ~/Documents/github_repos/personal-website/scripts/publish-reusable.mjs <note.md> --push
//       publish: the same, then commit and push.
//
// Staging is the default on purpose. Nothing reaches the site until a human has read the
// rewritten entry and said yes, so `--push` is the recorded form of that permission.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(repo);
const config = JSON.parse(fs.readFileSync('reusable.config.json', 'utf8'));
const home = p => p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
const die = message => { console.error('publish-reusable: ' + message); process.exit(1); };

const argv = process.argv.slice(2);
const positional = argv.filter(a => !a.startsWith('--'));
const has = name => argv.includes('--' + name);
if (!positional.length || has('help')) {
  console.log(`usage: node scripts/publish-reusable.mjs <note.md> [options]

  (default)        stage only: fill the reusable-id, import, validate, stop for review
  --push           after staging, commit and push — use once the author has approved the diff
  --commit         commit but do not push
  --dry-run        print what would be imported; write nothing
  --force-id       regenerate the note's reusable-id even if it already has one
  --message "..."  commit message (default: "Publish reusable: <id>")
  --id/--kind/--title/--summary/--date/--draft   passed through to the importer`);
  process.exit(positional.length ? 0 : 1);
}
const notePath = path.resolve(home(positional[0]));
if (!fs.existsSync(notePath)) die('note not found: ' + notePath);

const run = (label, command, args) => {
  console.log('\n▸ ' + label);
  const result = spawnSync(command, args, { stdio: ['inherit', 'pipe', 'inherit'], encoding: 'utf8' });
  if (result.status !== 0) die(label + ' failed');
  if (result.stdout) process.stdout.write(result.stdout);
  return (result.stdout || '').trim();
};

// 1. identity — an empty reusable-id becomes a real one, written back into the note,
//    so the next publish of the same note updates this entry instead of forking it.
const idOut = run('ensure ' + (config.idKey || 'reusable-id'), process.execPath, ['scripts/ensure-reusable-id.mjs', notePath,
  ...(has('dry-run') ? ['--dry-run'] : []), ...(has('force-id') ? ['--force'] : [])]);
const id = idOut.split('\n').filter(Boolean).pop();

// 2. import the note, its images, and its sections into entries/reusable/<id>/
const passthrough = [];
for (let i = 0; i < argv.length; i++) {
  const name = argv[i].startsWith('--') ? argv[i].slice(2) : null;
  if (['id', 'kind', 'title', 'summary', 'date'].includes(name)) passthrough.push(argv[i], argv[++i]);
  else if (name === 'draft' || name === 'dry-run') passthrough.push(argv[i]);
}
run('import ' + path.basename(notePath), process.execPath, ['scripts/import-reusable.mjs', notePath, ...passthrough]);
if (has('dry-run')) { console.log('\nDry run: nothing written, nothing pushed.'); process.exit(0); }

// 3. the same validation CI runs — a broken entry must never reach a commit
run('validate entries', process.execPath, ['scripts/build-content.mjs', '--check']);

// 4. the review gate. Without --push or --commit this is where the script stops, and the
//    author reads the staged entry before anything becomes public.
const paths = [path.join(config.entriesDir, id), config.mediaDir, path.join(config.entriesDir, 'README.md')].filter(fs.existsSync);
if (!has('push') && !has('commit')) {
  console.log('\n▸ staged for review');
  console.log(spawnSync('git', ['status', '--short', '--', ...paths], { encoding: 'utf8' }).stdout.trimEnd() || '  (no change — the entry is already up to date)');
  console.log(`\nRead ${path.join(config.entriesDir, id, 'content.md')}, then publish with:\n  node scripts/publish-reusable.mjs ${notePath} --push`);
  process.exit(0);
}

// 5. commit only this entry's files, so unrelated work in the tree stays out of the commit
run('git add', 'git', ['add', '--', ...paths]);
const staged = spawnSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' }).stdout.trim();
if (!staged) { console.log('\nNothing changed — /reusable/' + id + '/ is already up to date.'); process.exit(0); }
const message = argv.includes('--message') ? argv[argv.indexOf('--message') + 1] : 'Publish reusable: ' + id;
run('git commit', 'git', ['commit', '-m', message]);
if (!has('push')) { console.log('\nCommitted. Push skipped (--commit).'); process.exit(0); }
run('git push', 'git', ['push']);
console.log('\nPublished /reusable/' + id + '/. The deploy workflow will take it live.');
