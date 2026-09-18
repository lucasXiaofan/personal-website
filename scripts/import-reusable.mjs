// Imports an Obsidian note into entries/reusable/<id>/.
// You write Markdown in Obsidian; this writes entry.json so you never hand-edit JSON.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const config = JSON.parse(fs.readFileSync('reusable.config.json', 'utf8'));
const home = p => p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
const die = message => { console.error('import-reusable: ' + message); process.exit(1); };

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) { positional.push(argv[i]); continue; }
  const name = argv[i].slice(2);
  if (['dry-run', 'draft', 'force'].includes(name)) flags[name] = true;
  else flags[name] = argv[++i];
}
if (!positional.length) die('usage: npm run import -- <note.md> [--id slug] [--kind k] [--title T] [--dry-run]');
const notePath = path.resolve(home(positional[0]));
if (!fs.existsSync(notePath)) die('note not found: ' + notePath);

// --- front matter (only the keys this importer uses; not a general YAML parser) ---
const raw = fs.readFileSync(notePath, 'utf8').replace(/\r\n/g, '\n');
const matched = raw.match(/^---\n([\s\S]*?)\n---\n?/);
const front = {};
if (matched) {
  let key = null;
  for (const line of matched[1].split('\n')) {
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && key) { (front[key] = Array.isArray(front[key]) ? front[key] : []).push(strip(item[1])); continue; }
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    key = pair[1];
    const value = pair[2].trim();
    if (!value) front[key] = [];
    else if (value.startsWith('[')) front[key] = value.slice(1, -1).split(',').map(strip).filter(Boolean);
    else front[key] = strip(value);
  }
}
function strip(value) { return value.trim().replace(/^["']|["']$/g, ''); }
const body = matched ? raw.slice(matched[0].length) : raw;

// --- identity ---
const slug = value => String(value).toLowerCase().normalize('NFKD')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
// The note's `reusable-id` is the identity: re-importing a note that carries one overwrites
// that entry, whatever the file was renamed to. `ensure-reusable-id.mjs` fills it in when empty.
const text = key => (typeof front[key] === 'string' && front[key].trim()) ? front[key].trim() : '';
const id = slug(flags.id || text(config.idKey) || text('id') || path.basename(notePath).replace(/\.md$/i, ''));
if (!id) die('cannot derive an id; pass --id');
const folder = path.join(config.entriesDir, id);
const existing = fs.existsSync(path.join(folder, 'entry.json'))
  ? JSON.parse(fs.readFileSync(path.join(folder, 'entry.json'), 'utf8')) : null;
const today = new Date().toISOString().slice(0, 10);
const asDate = value => (String(value || '').match(/^\d{4}-\d{2}-\d{2}/) || [])[0];

// --- split the note into Reusable v1 sections ---
const names = config.sections;
// Every spelling a section may appear under in a note, mapped back to its canonical name, so
// renaming a section on the site (Use Guide -> User Guide) never orphans a note written earlier.
const aliases = new Map();
for (const name of names) {
  aliases.set(name.toLowerCase(), name);
  for (const alias of (config.sectionAliases || {})[name] || []) aliases.set(alias.toLowerCase(), name);
}
const heading = new RegExp('^(#{1,6})\\s*(' + [...aliases.keys()].join('|') + ')\\s*:?\\s*$', 'i');
const sections = Object.fromEntries(names.map(n => [n, []]));
const preamble = [];
let current = null, fenced = false;
for (const line of body.split('\n')) {
  if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
  const match = fenced ? null : line.match(heading);
  if (match) { current = aliases.get(match[2].toLowerCase()); continue; }
  (current ? sections[current] : preamble).push(line);
}
if (!current && preamble.length) { sections.Content = preamble.splice(0); }
else if (preamble.join('').trim()) sections.Description.unshift(...preamble.splice(0), '');

// --- media: resolve Obsidian links against the configured asset roots ---
const roots = config.assetRoots.map(home).filter(fs.existsSync);
let index = null;
function findAsset(reference) {
  const clean = decodeURIComponent(reference.split('#')[0].trim());
  const candidates = [path.resolve(path.dirname(notePath), clean), ...roots.map(r => path.join(r, clean))];
  for (const candidate of candidates) if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  if (!index) {
    index = new Map();
    const walk = dir => {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.name.startsWith('.') || item.name === 'node_modules') continue;
        const full = path.join(dir, item.name);
        if (item.isDirectory()) walk(full);
        else if (!index.has(item.name)) index.set(item.name, full);
      }
    };
    for (const root of roots) walk(root);
  }
  return index.get(path.basename(clean)) || null;
}
const KINDS = { image: 'png jpg jpeg gif webp svg avif', audio: 'mp3 wav m4a ogg', video: 'mp4 mov webm' };
const mediaKind = file => Object.keys(KINDS)
  .find(k => KINDS[k].split(' ').includes(path.extname(file).slice(1).toLowerCase())) || 'document';

const attachments = [], copies = [], missing = [], unlabelled = [];
function adopt(reference, alt) {
  if (/^(https?:)?\/\//.test(reference) || reference.startsWith('/media/')) return null;
  const source = findAsset(reference);
  if (!source) { missing.push(reference); return null; }
  const base = path.basename(source).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^[^a-zA-Z0-9]+/, '');
  let name = base.startsWith(id) ? base : id + '-' + base;
  const target = () => path.join(config.mediaDir, name);
  while (fs.existsSync(target()) && !fs.readFileSync(target()).equals(fs.readFileSync(source))) {
    name = name.replace(/(-(\d+))?(\.[^.]+)$/, (_, __, n, ext) => '-' + (Number(n || 1) + 1) + ext);
  }
  let adopted = attachments.find(a => a.path === name);
  if (!adopted) {
    adopted = { path: name, alt: alt || path.basename(source, path.extname(source)).replace(/[-_]+/g, ' '), kind: mediaKind(source) };
    attachments.push(adopted);
    copies.push([source, target()]);
  }
  if (alt && !adopted.alt) adopted.alt = alt;
  if (!alt) unlabelled.push(name);
  // Carry the attachment alt into the body so no published image ships without one.
  return { url: '/media/' + name, alt: alt || adopted.alt };
}

// --- rewrite Obsidian syntax into site Markdown ---
const entryIds = fs.existsSync(config.entriesDir)
  ? new Set(fs.readdirSync(config.entriesDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)) : new Set();
// An id carries a timestamp (`pipeline-20260914-1043`), but a note links by name
// (`[[pipeline]]`). Accept the bare slug when exactly one entry starts with it; refuse when
// two do, because guessing between them would point the reader at the wrong page.
const deadLinks = [], ambiguousLinks = [];
// A vault note keeps its `reusable-id` across renames, but a wikilink points at the current
// filename. Read the sibling note's id so renaming a note in Obsidian does not silently turn
// every link to it into plain text.
function idOfSiblingNote(key) {
  const sibling = path.join(path.dirname(notePath), key + '.md');
  if (!fs.existsSync(sibling)) return null;
  const head = fs.readFileSync(sibling, 'utf8').replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---/);
  const found = head && head[1].match(new RegExp('^' + config.idKey + ':\\s*(.+)$', 'm'));
  return found ? slug(strip(found[1])) : null;
}
function resolveEntry(key) {
  if (entryIds.has(key)) return key;
  const matches = [...entryIds].filter(e => new RegExp('^' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-\\d{8}-\\d{4}$').test(e));
  if (matches.length === 1) return matches[0];
  if (!matches.length) {
    const renamed = idOfSiblingNote(key);
    if (renamed && entryIds.has(renamed)) return renamed;
  }
  (matches.length ? ambiguousLinks : deadLinks).push(key);
  return null;
}

function rewrite(text) {
  return text
    .replace(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g, (_, target, alt) => {
      const media = adopt(target, alt);
      return media ? `![${media.alt}](${media.url})` : `![${alt || target}](${target})`;
    })
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (whole, alt, url, title) => {
      const media = adopt(url, alt);
      return media ? `![${media.alt}](${media.url}${title || ''})` : whole;
    })
    .replace(/(^|[^!])\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g, (_, before, target, label) => {
      const text = (label || target).trim();
      const key = resolveEntry(slug(target));
      return before + (key && key !== id ? `[${text}](/reusable/${key}/)` : text);
    });
}
// Shift a section's own headings below the `## Section` heading this importer emits.
function normalize(lines) {
  let fence = false, min = 9;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const h = fence ? null : line.match(/^(#{1,6})\s+\S/);
    if (h) min = Math.min(min, h[1].length);
  }
  const shift = min < 9 && min < 3 ? 3 - min : 0;
  fence = false;
  const out = lines.map(line => {
    if (/^\s*(```|~~~)/.test(line)) { fence = !fence; return line; }
    return fence ? line : line.replace(/^(#{1,6})(\s+)/, (_, hashes, space) => '#'.repeat(Math.min(6, hashes.length + shift)) + space);
  });
  return rewrite(out.join('\n')).trim();
}
const rendered = Object.fromEntries(names.map(n => [n, normalize(sections[n])]));
for (const required of config.requiredSections) {
  if (!rendered[required]) die(`section "${required}" is empty in ${notePath}. Start from ${config.template}`);
}

// --- metadata ---
const firstSentence = text => {
  // Skip headings, lists, quotes, tables, images — and Hugo shortcodes ({{< heatmap >}},
  // {{< language en >}}), which open most Descriptions and are not prose.
  const isProse = l => l.trim() && !/^[#>\-*|!]/.test(l.trim()) && !/^\{\{[<%]/.test(l.trim()) && !/^</.test(l.trim());
  const line = text.split('\n').find(isProse) || text.split('\n').find(l => l.trim()) || '';
  const plain = line.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '').trim();
  return plain.length > 300 ? plain.slice(0, 297).trimEnd() + '…' : plain;
};
// Titled from the note's filename, not from the id — the id carries a timestamp
// that belongs in the URL and nowhere on the page.
const title = flags.title || front.title || (existing && existing.title)
  || path.basename(notePath).replace(/\.md$/i, '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const tags = [...new Set([config.formatTag, ...(Array.isArray(front.tags) ? front.tags : []).filter(t => t !== 'reusable'),
  ...((existing && existing.tags) || []).filter(t => !/^reusable_version_/.test(t))])];
const entry = {
  schema_version: 3,
  id,
  type: 'reusable',
  kind: flags.kind || front.kind || (existing && existing.kind) || config.defaultKind,
  title,
  date: flags.date || asDate(front.date || front.created_at) || (existing && existing.date) || today,
  updated: asDate(front.updated_at || front.updated) || today,
  // The note is the source of truth: re-deriving beats an existing summary, or the
  // site keeps the first publish's summary forever. Pin one with `summary:` in the
  // note's front matter (or --summary) when the derived line is not what you want.
  summary: flags.summary || front.summary || firstSentence(rendered.Description) || (existing && existing.summary),
  content: 'content.md',
  tags,
  attachments,
  ...(flags.draft || (existing && existing.draft) ? { draft: true } : {}),
  ...(existing && existing.comments ? { comments: existing.comments } : {}),
  ...(existing && existing.aliases && existing.aliases.length ? { aliases: existing.aliases } : {})
};
const markdown = names.filter(n => rendered[n]).map(n => `## ${n}\n\n${rendered[n]}`).join('\n\n') + '\n';

if (missing.length) console.warn('  ! unresolved media (left as written): ' + missing.join(', '));
if (unlabelled.length) console.warn('  ! no alt text, named from the filename — write ![description](…) in Obsidian: ' + [...new Set(unlabelled)].join(', '));
// A wikilink to a note that is not published renders as plain text. That is the right
// fallback, but silently — so say it, or a dead cross-reference ships unnoticed.
if (deadLinks.length) console.warn('  ! wikilink has no published entry, rendered as plain text: ' + [...new Set(deadLinks)].join(', '));
if (ambiguousLinks.length) console.warn('  ! wikilink matches more than one entry, rendered as plain text — link the full id: ' + [...new Set(ambiguousLinks)].join(', '));
if (flags['dry-run']) {
  console.log(JSON.stringify(entry, null, 2) + '\n---\n' + markdown);
  process.exit(0);
}

fs.mkdirSync(folder, { recursive: true });
fs.mkdirSync(config.mediaDir, { recursive: true });
for (const [source, target] of copies) { fs.copyFileSync(source, target); console.log('  ✓ media ' + target); }
fs.writeFileSync(path.join(folder, 'entry.json'), JSON.stringify(entry, null, 2) + '\n');
fs.writeFileSync(path.join(folder, 'content.md'), markdown);
if (!fs.existsSync(path.join(folder, 'README.md'))) {
  fs.writeFileSync(path.join(folder, 'README.md'), `# ${folder}\n\n## Purpose\n\n${entry.summary}\n\n## Current TODO\n\n- None.\n\n## Index\n\n- No subfolders. See the files in this directory.\n\n## Important files\n\n- [entry.json](entry.json)\n- [content.md](content.md)\n\n## Changelog\n\n- ${today} — Imported from Obsidian as Reusable version 1.\n`);
}
const parent = path.join(config.entriesDir, 'README.md');
const parentText = fs.readFileSync(parent, 'utf8');
if (!parentText.includes(`[${id}](${id}/README.md)`)) {
  fs.writeFileSync(parent, parentText.replace(/^## Index\n\n/m, `## Index\n\n- [${id}](${id}/README.md) — ${entry.summary}\n`));
}
console.log(`  ✓ ${folder}/entry.json\n  ✓ ${folder}/content.md\nImported "${title}" as /reusable/${id}/. Run npm run build.`);
