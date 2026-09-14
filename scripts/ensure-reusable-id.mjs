// Gives an Obsidian note a stable `reusable-id` when that field is empty or missing.
// The id is the entry's identity on the site: re-importing a note that already carries one
// overwrites the matching entry instead of creating a second copy under a new filename.
// Prints the id on stdout so a shell caller can use it directly.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const config = JSON.parse(fs.readFileSync('reusable.config.json', 'utf8'));
const KEY = config.idKey || 'reusable-id';
const home = p => p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
const die = message => { console.error('ensure-reusable-id: ' + message); process.exit(1); };

const argv = process.argv.slice(2);
const flags = { quiet: argv.includes('--quiet'), dryRun: argv.includes('--dry-run') };
const positional = argv.filter(a => !a.startsWith('--'));
if (!positional.length) die('usage: node scripts/ensure-reusable-id.mjs <note.md> [--dry-run] [--quiet]');
const notePath = path.resolve(home(positional[0]));
if (!fs.existsSync(notePath)) die('note not found: ' + notePath);

const slug = value => String(value).toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const raw = fs.readFileSync(notePath, 'utf8').replace(/\r\n/g, '\n');
const matched = raw.match(/^---\n([\s\S]*?)\n---\n?/);
const front = matched ? matched[1] : '';

// Already set? Nothing to do — an id is never regenerated, or the entry would fork on the site.
const present = front.split('\n').find(line => new RegExp('^' + KEY + '\\s*:', 'i').test(line));
const existingValue = present ? present.slice(present.indexOf(':') + 1).trim().replace(/^["']|["']$/g, '') : '';
if (existingValue) {
  if (!flags.quiet) console.error('  = ' + KEY + ' already set');
  console.log(existingValue);
  process.exit(0);
}

// Derive from the filename, which is how the note is already known to its author,
// then make it unique against the entries already published.
const taken = fs.existsSync(config.entriesDir)
  ? new Set(fs.readdirSync(config.entriesDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name))
  : new Set();
const base = slug(path.basename(notePath).replace(/\.md$/i, '')) || 'reusable';
let id = base;
for (let n = 2; taken.has(id); n++) id = base + '-' + n;

const line = KEY + ': ' + id;
let updated;
if (!matched) updated = '---\n' + line + '\n---\n' + raw;
else if (present) updated = raw.replace(present, line);
else updated = raw.replace(/^---\n([\s\S]*?)\n---/, (_, body) => '---\n' + body + '\n' + line + '\n---');

if (!flags.dryRun) fs.writeFileSync(notePath, updated);
if (!flags.quiet) console.error('  ✓ ' + KEY + ' = ' + id + (flags.dryRun ? ' (dry run, not written)' : ' written to ' + notePath));
console.log(id);
