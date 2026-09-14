// Gives an Obsidian note a stable `reusable-id` when that field is empty or missing.
// The id is the entry's identity on the site: re-publishing a note that already carries one
// overwrites the matching entry instead of creating a second page under a new filename.
//
// Shape: <slug-of-filename>-<YYYYMMDD>-<HHMM>, e.g. reusable-building-pipeline-20260914-1043.
// The filename alone is not enough — two notes written months apart can share a name — so the
// note's creation moment is folded in. It comes from `created_at`/`created`/`date` in the front
// matter when present, otherwise from the file's own birth time.
// Prints the id on stdout so a shell caller can use it directly.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const config = JSON.parse(fs.readFileSync('reusable.config.json', 'utf8'));
const KEY = config.idKey || 'reusable-id';
const home = p => p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
const die = message => { console.error('ensure-reusable-id: ' + message); process.exit(1); };

const argv = process.argv.slice(2);
const flags = { quiet: argv.includes('--quiet'), dryRun: argv.includes('--dry-run'), force: argv.includes('--force') };
const positional = argv.filter(a => !a.startsWith('--'));
if (!positional.length) die('usage: node scripts/ensure-reusable-id.mjs <note.md> [--force] [--dry-run] [--quiet]');
const notePath = path.resolve(home(positional[0]));
if (!fs.existsSync(notePath)) die('note not found: ' + notePath);

const slug = value => String(value).toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const raw = fs.readFileSync(notePath, 'utf8').replace(/\r\n/g, '\n');
const matched = raw.match(/^---\n([\s\S]*?)\n---\n?/);
const frontLines = matched ? matched[1].split('\n') : [];
const read = name => {
  const line = frontLines.find(l => new RegExp('^' + name + '\\s*:', 'i').test(l));
  return line ? line.slice(line.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '') : '';
};

// Already set? Never regenerate without --force: the id is the entry's identity, and changing
// it forks the published entry into a second page at a second URL.
const existingValue = read(KEY);
if (existingValue && !flags.force) {
  if (!flags.quiet) console.error('  = ' + KEY + ' already set');
  console.log(existingValue);
  process.exit(0);
}

// When the note was created, in local time, to two-minute-proof precision.
const created = () => {
  for (const key of ['created_at', 'created', 'date']) {
    const parsed = new Date(read(key));
    if (read(key) && !Number.isNaN(parsed.getTime())) return parsed;
  }
  const stat = fs.statSync(notePath);
  return stat.birthtime.getTime() ? stat.birthtime : stat.mtime;
};
const pad = n => String(n).padStart(2, '0');
const when = created();
const stamp = `${when.getFullYear()}${pad(when.getMonth() + 1)}${pad(when.getDate())}-${pad(when.getHours())}${pad(when.getMinutes())}`;

const taken = fs.existsSync(config.entriesDir)
  ? new Set(fs.readdirSync(config.entriesDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name))
  : new Set();
const base = (slug(path.basename(notePath).replace(/\.md$/i, '')) || 'reusable') + '-' + stamp;
let id = base;
// Same name, same minute — vanishingly rare, but an id collision would silently overwrite
// somebody else's entry, so it is still checked.
for (let n = 2; taken.has(id) && id !== existingValue; n++) id = base + '-' + n;

const line = KEY + ': ' + id;
const present = frontLines.find(l => new RegExp('^' + KEY + '\\s*:', 'i').test(l));
let updated;
if (!matched) updated = '---\n' + line + '\n---\n' + raw;
else if (present) updated = raw.replace(present, line);
else updated = raw.replace(/^---\n([\s\S]*?)\n---/, (_, body) => '---\n' + body + '\n' + line + '\n---');

if (!flags.dryRun) fs.writeFileSync(notePath, updated);
if (!flags.quiet) {
  const note = flags.dryRun ? ' (dry run, not written)' : ' written to ' + notePath;
  console.error('  ✓ ' + KEY + ' = ' + id + note);
  if (flags.force && existingValue && existingValue !== id) {
    console.error('  ! replaced ' + existingValue + ' — the old entry folder and its URL are now orphaned; delete entries/reusable/' + existingValue + '/ if it was published');
  }
}
console.log(id);
