// Carry a diary's daily habit verdicts into the habit reusables' heatmaps.
//
// The diary is the source of truth. A day is recorded by one line inside the Plan section:
//
//   Dopamine-Control-Challenge: success, I did not watch online video ...
//   Dopamine-Control-Challenge: 9/14 - 9/15 failed, watched more than 2 hours ...
//   trending-analysis: fugleramme is today's top hacker news project ...
//
// This script only moves dates into the heatmap shortcode — the mechanical half.
// Writing the analysis itself stays a human step, so a trending line with no matching
// section in the note is reported, never invented.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vault = path.join(process.env.HOME || '', 'Documents/road');

export const HABITS = {
  'dopamine-control-challenge': {
    marker: /^Dopamine-Control-Challenge:/i,
    note: 'problem-solving-library/reusable/challenge-dopamine-control.md',
    // A verdict word is required; this habit records both outcomes.
    verdicts: { passed: /\b(success|succeeded|held|hold|pass(?:ed)?|done|ok)\b/i, failed: /\b(fail(?:ed)?|missed|broke|broken|lost)\b/i },
    entries: false,
  },
  'trending-analysis': {
    marker: /^trending-analysis:/i,
    note: 'problem-solving-library/reusable/habit-trending-analysis.md',
    // Writing the line is the habit; there is no failing verdict to parse.
    verdicts: null,
    entries: true,
  },
};

const iso = d => d.toISOString().slice(0, 10);

// The verdict and any date live in the opening clause; the rest is prose that must not
// be pattern-matched, or a URL or a phrase like "L1, L2" starts voting on the outcome.
export function head(body) {
  const stop = body.search(/[,\u3001\uff0c\u3002]/);
  return (stop === -1 ? body : body.slice(0, stop)).slice(0, 60);
}

// Accepts 2026-09-14 and 9/14, and ranges written with - – — or "to".
export function parseDates(text, fallback) {
  const year = fallback.slice(0, 4);
  const token = String.raw`(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2})`;
  const normalize = t => {
    if (t.includes('-')) return t;
    const [m, d] = t.split('/');
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };
  const range = text.match(new RegExp(token + String.raw`\s*(?:-|–|—|to)\s*` + token));
  if (range) {
    const from = new Date(normalize(range[1]) + 'T00:00:00Z'), to = new Date(normalize(range[2]) + 'T00:00:00Z');
    if (Number.isNaN(+from) || Number.isNaN(+to) || to < from) throw new Error(`Unreadable date range: ${range[0]}`);
    const days = [];
    for (let d = from; d <= to; d = new Date(+d + 86400000)) {
      days.push(iso(d));
      if (days.length > 366) throw new Error(`Date range covers more than a year: ${range[0]}`);
    }
    return days;
  }
  const single = text.match(new RegExp(token));
  return [single ? normalize(single[1]) : fallback];
}

export function parseHabitLines(raw, date) {
  const found = {};
  for (const line of raw.replace(/\r\n/g, '\n').split('\n')) {
    // Strip a list/checkbox prefix, then a leading '#': the diary writes these as tags
    // (#trending-analysis:) so Obsidian can index them, and the tag form must still sync.
    const text = line.trim().replace(/^[-*+]\s+(?:\[[ xX]\]\s*)?/, '').replace(/^#(?=[A-Za-z])/, '');
    for (const [name, habit] of Object.entries(HABITS)) {
      if (!habit.marker.test(text)) continue;
      const body = text.slice(text.indexOf(':') + 1).trim();
      if (!body) throw new Error(`${name}: the line for ${date} has no content.`);
      const opening = head(body);
      let verdict = 'passed';
      if (habit.verdicts) {
        const failed = habit.verdicts.failed.test(opening), passed = habit.verdicts.passed.test(opening);
        if (failed === passed) throw new Error(`${name}: the ${date} line needs exactly one verdict word (e.g. success or failed) before the first comma, got "${opening}".`);
        verdict = failed ? 'failed' : 'passed';
      }
      (found[name] ||= []).push({ dates: parseDates(opening, date), verdict, body });
    }
  }
  return found;
}

const uniqueSorted = list => [...new Set(list.filter(Boolean))].sort();

// Merge dates into the heatmap shortcode, widening the window if a date falls outside it.
export function updateHeatmap(note, add) {
  const match = note.match(/\{\{<\s*heatmap\s[^>]*?>\}\}/);
  if (!match) throw new Error('The note has no {{< heatmap ... >}} shortcode.');
  let shortcode = match[0];
  const get = key => shortcode.match(new RegExp(key + '="([^"]*)"'))?.[1];
  const set = (key, value) => {
    if (get(key) === undefined) throw new Error(`The heatmap shortcode has no ${key}= parameter.`);
    shortcode = shortcode.replace(new RegExp(key + '="[^"]*"'), `${key}="${value}"`);
  };

  const changed = [];
  const lists = { passed: uniqueSorted((get('passed') || '').split(',').map(s => s.trim())),
                  failed: uniqueSorted((get('failed') || '').split(',').map(s => s.trim())) };
  for (const [verdict, dates] of Object.entries(add)) {
    for (const date of dates) {
      const other = verdict === 'passed' ? 'failed' : 'passed';
      // A corrected verdict must not leave the day coloured twice.
      if (lists[other].includes(date)) { lists[other] = lists[other].filter(d => d !== date); changed.push(`${date} moved to ${verdict}`); }
      if (!lists[verdict].includes(date)) { lists[verdict].push(date); changed.push(`${date} ${verdict}`); }
    }
  }
  if (!changed.length) return { note, changed };

  set('passed', uniqueSorted(lists.passed).join(', '));
  set('failed', uniqueSorted(lists.failed).join(', '));
  const all = [...lists.passed, ...lists.failed];
  const start = get('start'), end = get('end');
  if (all.some(d => d < start)) set('start', uniqueSorted(all)[0]);
  if (all.some(d => d > end)) {
    // Keep a rolling window the same length rather than stretching it open.
    const last = new Date(uniqueSorted(all).at(-1) + 'T00:00:00Z');
    const span = Math.round((new Date(end + 'T00:00:00Z') - new Date(start + 'T00:00:00Z')) / 86400000);
    set('end', iso(new Date(+last + Math.ceil(span / 2) * 86400000)));
  }
  return { note: note.replace(match[0], shortcode), changed };
}

export function missingEntries(note, dates) {
  const body = note.split(/^# Content:/m)[1] || '';
  return uniqueSorted(dates).filter(d => !new RegExp('^##\\s+' + d + '\\b', 'm').test(body));
}

function run(label, command, args) {
  process.stdout.write(`\n▸ ${label}\n`);
  const result = spawnSync(command, args, { cwd: repo, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${label} failed.`);
}

function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter(a => a.startsWith('--')));
  const positional = argv.filter(a => !a.startsWith('--'));
  for (const flag of flags) if (!['--write', '--publish', '--help'].includes(flag)) throw new Error('Unknown flag: ' + flag);
  if (flags.has('--help')) {
    console.log('Usage: node scripts/sync-habits.mjs <YYYY-MM-DD.md> [--write] [--publish]\nDefault: report what would change. --write edits the habit notes. --publish also stages and pushes them.');
    return;
  }
  if (positional.length !== 1) throw new Error('Provide exactly one diary file. Use --help for usage.');
  const diary = path.resolve(positional[0]), date = path.basename(diary, '.md');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Diary filename must be YYYY-MM-DD.md.');

  const found = parseHabitLines(fs.readFileSync(diary, 'utf8'), date);
  if (!Object.keys(found).length) { console.log(`No habit lines in ${date}. Nothing to sync.`); return; }

  const touched = [], involved = [];
  for (const [name, records] of Object.entries(found)) {
    const habit = HABITS[name], notePath = path.join(vault, habit.note);
    if (!fs.existsSync(notePath)) throw new Error(`${name}: missing note ${habit.note}`);
    const before = fs.readFileSync(notePath, 'utf8');
    const add = { passed: [], failed: [] };
    for (const record of records) add[record.verdict].push(...record.dates);
    const { note, changed } = updateHeatmap(before, add);

    console.log(`\n${name}`);
    if (!changed.length) console.log('  = heatmap already current');
    else changed.forEach(c => console.log('  ✓ ' + c));
    if (habit.entries) {
      for (const day of missingEntries(note, [...add.passed, ...add.failed])) {
        console.log(`  ! ${day} has no "## ${day}" section under # Content: — write the analysis before publishing.`);
      }
    }
    if (note !== before && flags.has('--write')) { fs.writeFileSync(notePath, note); touched.push(notePath); }
    else if (note !== before) console.log('  (dry run — pass --write to apply)');
    involved.push(notePath);
  }

  if (!flags.has('--publish')) {
    if (touched.length) console.log('\nHabit notes updated. Publish them with:\n' + touched.map(p => `  node scripts/publish-reusable.mjs ${p} --push`).join('\n'));
    return;
  }
  // Publish every habit the diary mentions, not just the ones whose dates moved: the note's
  // prose may have been edited by hand since the last push. publish-reusable is a no-op when
  // the entry already matches.
  for (const notePath of involved) run('publish ' + path.basename(notePath), process.execPath, ['scripts/publish-reusable.mjs', notePath, '--push']);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error('sync-habits: ' + error.message); process.exitCode = 1; }
}
