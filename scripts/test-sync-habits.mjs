import { test } from 'node:test';
import assert from 'node:assert/strict';
import { head, parseDates, parseHabitLines, updateHeatmap, missingEntries } from './sync-habits.mjs';

const heatmap = (passed, failed, start = '2026-09-14', end = '2026-10-14') =>
  `# Description:\n{{< heatmap start="${start}" end="${end}" failed="${failed}" passed="${passed}" label="x" >}}\n`;
const params = note => Object.fromEntries([...note.matchAll(/(\w+)="([^"]*)"/g)].map(m => [m[1], m[2]]));

test('reads the verdict and date only from the opening clause', () => {
  assert.equal(head('9/14 - 9/15 failed, watched youtube'), '9/14 - 9/15 failed');
  // "L1, L2" and a URL must not be mistaken for a verdict or a date.
  const found = parseHabitLines('Dopamine-Control-Challenge: success, I did not fail at L1, L2 on 9/30', '2026-09-16');
  assert.deepEqual(found['dopamine-control-challenge'][0], { dates: ['2026-09-16'], verdict: 'passed', body: 'success, I did not fail at L1, L2 on 9/30' });
});
test('expands ranges and both date spellings, defaulting to the diary date', () => {
  assert.deepEqual(parseDates('9/14 - 9/15 failed', '2026-09-15'), ['2026-09-14', '2026-09-15']);
  assert.deepEqual(parseDates('2026-09-14 to 2026-09-16', '2026-09-16'), ['2026-09-14', '2026-09-15', '2026-09-16']);
  assert.deepEqual(parseDates('success', '2026-09-16'), ['2026-09-16']);
  assert.throws(() => parseDates('9/16 - 9/14', '2026-09-16'));
});
test('rejects a line with no verdict, both verdicts, or no content', () => {
  for (const bad of ['Dopamine-Control-Challenge: watched some video', 'Dopamine-Control-Challenge: success and failed']) {
    assert.throws(() => parseHabitLines(bad, '2026-09-16'));
  }
});
test('trending lines need no verdict and survive a checkbox prefix', () => {
  const found = parseHabitLines('- [x] trending-analysis: fugleramme is top on HN (https://github.com/a/b)', '2026-09-16');
  assert.deepEqual(found['trending-analysis'][0].dates, ['2026-09-16']);
  assert.equal(found['trending-analysis'][0].verdict, 'passed');
});
test('a habit line written as an Obsidian tag still syncs', () => {
  const found = parseHabitLines('#trending-analysis: keysake is today\u2019s product hunt pick (https://keysake.ai)', '2026-09-18');
  assert.deepEqual(found['trending-analysis'][0].dates, ['2026-09-18']);
  assert.equal(found['trending-analysis'][0].verdict, 'passed');
  const checked = parseHabitLines('- [ ] #Dopamine-Control-Challenge: success, no video', '2026-09-18');
  assert.equal(checked['dopamine-control-challenge'][0].verdict, 'passed');
});
test('an empty habit line is pending, not an error, and colours nothing', () => {
  const found = parseHabitLines('#Dopamine-Control-Challenge :   ', '2026-09-19');
  assert.equal(found['dopamine-control-challenge'][0].pending, true);
  assert.equal(found['dopamine-control-challenge'][0].verdict, null);
});
test('a space before the colon still matches the habit marker', () => {
  const found = parseHabitLines('#Dopamine-Control-Challenge : failed, watched video at 6pm', '2026-09-18');
  assert.equal(found['dopamine-control-challenge'][0].verdict, 'failed');
  const t = parseHabitLines('#trending-analysis : ruanyf weekly issue-412 (https://github.com/ruanyf/weekly)', '2026-09-19');
  assert.deepEqual(t['trending-analysis'][0].dates, ['2026-09-19']);
});
test('a trending day recorded as None is skipped, not written', () => {
  const found = parseHabitLines('#trending-analysis None, find nothing interesting', '2026-09-20');
  assert.equal(found['trending-analysis'][0].verdict, 'failed');
  assert.deepEqual(found['trending-analysis'][0].dates, ['2026-09-20']);
});
test('a written analysis whose prose says nothing still counts as done', () => {
  const found = parseHabitLines('#trending-analysis: ruanyf weekly, nothing novel about it at all', '2026-09-19');
  assert.equal(found['trending-analysis'][0].verdict, 'passed');
});
test('the body starts after the marker, so a URL keeps its colons', () => {
  const found = parseHabitLines('#trending-analysis: https://github.com/ruanyf/weekly is the pick', '2026-09-19');
  assert.match(found['trending-analysis'][0].body, /^https:\/\/github\.com/);
});
test('merges dates, keeps them sorted, and reports no change when current', () => {
  const first = updateHeatmap(heatmap('', '2026-09-14'), { passed: [], failed: ['2026-09-15'] });
  assert.equal(params(first.note).failed, '2026-09-14, 2026-09-15');
  assert.deepEqual(updateHeatmap(first.note, { passed: [], failed: ['2026-09-15'] }).changed, []);
});
test('a corrected verdict moves the day instead of colouring it twice', () => {
  const { note, changed } = updateHeatmap(heatmap('', '2026-09-15'), { passed: ['2026-09-15'], failed: [] });
  assert.equal(params(note).failed, '');
  assert.equal(params(note).passed, '2026-09-15');
  assert.ok(changed.some(c => c.includes('moved to passed')));
});
test('widens the window only for dates outside it, keeping the span', () => {
  assert.equal(params(updateHeatmap(heatmap('', ''), { passed: ['2026-09-20'], failed: [] }).note).end, '2026-10-14');
  const late = updateHeatmap(heatmap('', '', '2026-09-16', '2026-10-16'), { passed: ['2026-10-20'], failed: [] });
  assert.equal(params(late.note).end, '2026-11-04');
  const early = updateHeatmap(heatmap('', ''), { passed: ['2026-09-01'], failed: [] });
  assert.equal(params(early.note).start, '2026-09-01');
});
test('refuses a note without a heatmap or without a parameter it must set', () => {
  assert.throws(() => updateHeatmap('# Description:\nno shortcode', { passed: ['2026-09-16'], failed: [] }));
  assert.throws(() => updateHeatmap('{{< heatmap start="2026-09-14" end="2026-10-14" >}}', { passed: ['2026-09-16'], failed: [] }));
});
test('flags a synced date that has no written section', () => {
  const note = '# Content:\n## 2026-09-16 · fugleramme\ntext';
  assert.deepEqual(missingEntries(note, ['2026-09-16', '2026-09-17']), ['2026-09-17']);
});
