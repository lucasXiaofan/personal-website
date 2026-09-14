import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractPlan, validateBody, decisionSummary } from './publish-decision.mjs';

test('extracts only the plan, preserving tasks and excluding private surrounding text', () => {
  assert.equal(extractPlan('private before\r\n# ⏰ Plan:\r\n- [x] Study\r\n\r\n# 📕 Log:\r\nprivate after'), '- [x] Study');
});
test('summarizes only the first English decision, without checkbox or Markdown', () => {
  const body = '## English\nIntro must not appear.\n\n1. [x] **Build — a [useful](https://example.com) guide** for learning.\n2. [ ] Not this decision.\n\n## 中文\n不要显示。';
  assert.equal(decisionSummary(body, 4), 'Build — a useful guide…');
  assert.equal(decisionSummary(body), 'Build — a useful guide for learning.');
  assert.equal(decisionSummary('## English\n- [ ] Study\n  linear algebra.\n\n## 中文\n学习。'), 'Study linear algebra.');
  assert.throws(() => decisionSummary('## 中文\n1. 学习。'));
  assert.throws(() => decisionSummary(body, 0));
});
test('rejects missing, reversed, duplicate and empty boundaries', () => {
  for (const raw of ['# ⏰ Plan:\nsecret', '# 📕 Log:\n# ⏰ Plan:\na', '# ⏰ Plan:\na\n# ⏰ Plan:\nb\n# 📕 Log:', '# ⏰ Plan:\n\n# 📕 Log:', '# ⏰ Plan:\na\n# 📕 Log:\n# 📕 Log:']) assert.throws(() => extractPlan(raw));
});
test('ignores boundary-like headings inside fenced examples', () => {
  assert.equal(extractPlan('```md\n# ⏰ Plan:\n# 📕 Log:\n```\n# ⏰ Plan:\nreal\n# 📕 Log:\nsecret'), 'real');
});
test('requires both nonempty translations and rejects private paths or diary markers', () => {
  const good = '## English\nStudy.\n\n## 中文\n学习。';
  assert.doesNotThrow(() => validateBody(good));
  for (const bad of ['## English\n\n## 中文\n学习。', '## English\nStudy.\n## 中文\n', good + '\n[[private-note]]', good + '\n/Users/me/diary', good + '\n# 📕 Log:\nprivate']) assert.throws(() => validateBody(bad));
});
