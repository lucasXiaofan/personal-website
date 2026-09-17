import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repository = 'lucasXiaofan/personal-website';

export function extractPlan(raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const starts = [], ends = [];
  let fence = null;
  for (let i = 0; i < lines.length; i++) {
    const marker = lines[i].match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;
    if (/^# ⏰ Plan:\s*$/.test(lines[i])) starts.push(i);
    if (/^# 📕 Log:\s*$/.test(lines[i])) ends.push(i);
  }
  if (starts.length !== 1 || ends.length !== 1 || ends[0] <= starts[0]) {
    throw new Error('Expected exactly one Plan heading followed by exactly one Log heading.');
  }
  const plan = lines.slice(starts[0] + 1, ends[0]).join('\n').trim();
  if (!plan) throw new Error('The Plan section is empty.');
  return plan;
}

export function validateBody(body) {
  for (const heading of ['English', '中文']) {
    const section = body.match(new RegExp('^## ' + heading + '[ \\t]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))', 'm'));
    if (!section || !section[1].trim()) {
      throw new Error('Reviewed body needs nonempty ## English and ## 中文 sections.');
    }
  }
  if (/^# (?:⏰ Plan|📕 Log):/m.test(body) || /\[\[|file:\/\/|\/Users\//.test(body)) {
    throw new Error('Remove diary boundaries, private paths, and Obsidian wikilinks from the reviewed body.');
  }
  if (/^(?:---|\{)\s*\n/.test(body)) throw new Error('Pass a Markdown body without front matter.');
}

export function decisionSummary(body, k = 20) {
  if (!Number.isInteger(k) || k < 1) throw new Error('Summary word limit must be a positive integer.');
  const english = body.replace(/\r\n/g, '\n').match(/^## English[ \t]*\n([\s\S]*?)(?=^## |$(?![\s\S]))/m)?.[1] || '';
  const first = english.match(/^\s{0,3}(?:\d+[.)]|[-+*])\s+(?:\[[ xX]\]\s*)?([^\n]*(?:\n(?!\s*(?:\d+[.)]|[-+*])\s|\s*\n)[^\n]+)*)/m)?.[1];
  if (!first) throw new Error('The English section needs a list of decisions to generate its summary.');
  const plain = first.replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, '').replace(/[*_`~]/g, '').trim();
  const words = plain.split(/\s+/);
  // A standalone dash separates clauses; it is not itself a word.
  let count = 0, end = words.length;
  for (let i = 0; i < words.length; i++) {
    if (/[\p{L}\p{N}]/u.test(words[i]) && ++count > k) { end = i; break; }
  }
  return words.slice(0, end).join(' ') + (end < words.length ? '…' : '');
}

function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: repo, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
  if (result.status !== 0) throw new Error(`${command} failed. ${capture ? result.stderr || result.stdout : ''}`);
  return capture ? result.stdout.trim() : '';
}

function graphql(query, variables = {}) {
  const args = ['api', 'graphql', '-f', `query=${query}`];
  for (const [key, value] of Object.entries(variables)) args.push('-f', `${key}=${value}`);
  const result = JSON.parse(run('gh', args, true));
  if (result.errors) throw new Error(JSON.stringify(result.errors));
  return result.data;
}

function discussion(date) {
  const title = `Decision Log · ${date}`;
  const data = graphql('{repository(owner:"lucasXiaofan",name:"personal-website"){id hasDiscussionsEnabled discussionCategories(first:25){nodes{id name}}}}').repository;
  if (!data.hasDiscussionsEnabled) throw new Error('Enable GitHub Discussions in repository settings, then retry.');
  const category = data.discussionCategories.nodes.find(c => c.name === 'General');
  if (!category) throw new Error('Create a General discussion category, then retry.');
  // Look up existing threads before creating, including retries after a local write failure.
  let cursor;
  do {
    const result = graphql('query($cursor:String){repository(owner:"lucasXiaofan",name:"personal-website"){discussions(first:100,after:$cursor){nodes{title url} pageInfo{hasNextPage endCursor}}}}', cursor ? { cursor } : {}).repository.discussions;
    const existing = result.nodes.find(d => d.title === title);
    if (existing) return existing.url;
    cursor = result.pageInfo.hasNextPage ? result.pageInfo.endCursor : null;
  } while (cursor);
  const body = `Discuss the priorities, reasoning, and tradeoffs in [the ${date} Decision Log](https://lucasxiaofan.github.io/personal-website/decision-log/${date}/). The page contains English and Chinese versions.\n\n欢迎讨论这一天的优先级、决策理由和取舍。页面提供中英双语内容；更新以页面为准。`;
  return graphql('mutation($repositoryId:ID!,$categoryId:ID!,$title:String!,$body:String!){createDiscussion(input:{repositoryId:$repositoryId,categoryId:$categoryId,title:$title,body:$body}){discussion{url}}}', {repositoryId:data.id, categoryId:category.id, title, body}).createDiscussion.discussion.url;
}

function syncHabits(diary, publish) {
  const args = ['scripts/sync-habits.mjs', diary, '--write', ...(publish ? ['--publish'] : [])];
  const result = spawnSync(process.execPath, args, { cwd: repo, stdio: 'inherit' });
  // A habit line that cannot be read must not silently skip the tracker.
  if (result.status !== 0) throw new Error('sync-habits failed. Fix the habit line in the diary, then retry.');
}

function main() {
  const argv = process.argv.slice(2), flags = {}, positional = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--body') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error('--body needs a file path.');
      flags.body = path.resolve(argv[++i]);
    } else if (['--extract', '--push', '--discussion', '--help'].includes(argv[i])) flags[argv[i].slice(2)] = true;
    else if (argv[i].startsWith('--')) throw new Error('Unknown flag: ' + argv[i]);
    else positional.push(argv[i]);
  }
  if (flags.help) {
    console.log('Usage: node scripts/publish-decision.mjs <YYYY-MM-DD.md> --extract\n       node scripts/publish-decision.mjs <YYYY-MM-DD.md> --body <reviewed.md> [--discussion] [--push]\nDefault: stage and verify locally, and sync the habit trackers into the vault notes.\n--discussion creates a public thread. --push also commits and pushes, and publishes the habit pages.');
    return;
  }
  if (positional.length !== 1) throw new Error('Provide exactly one diary file. Use --help for usage.');
  const diary = path.resolve(positional[0]), date = path.basename(diary, '.md');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw new Error('Diary filename must be a valid YYYY-MM-DD.md date.');
  const plan = extractPlan(fs.readFileSync(diary, 'utf8'));
  if (flags.extract) {
    if (flags.body || flags.push || flags.discussion) throw new Error('--extract cannot be combined with publication flags.');
    console.log(plan);
    return;
  }
  if (!flags.body) throw new Error('Extract the plan, reword/translate it, then provide --body <reviewed.md>.');
  const body = fs.readFileSync(flags.body, 'utf8').trim();
  validateBody(body);
  const relative = `content/decision-log/${date}.md`, target = path.join(repo, relative);
  if (flags.push) {
    if (run('git', ['branch', '--show-current'], true) !== 'main') throw new Error('--push requires main.');
    const remote = run('git', ['remote', 'get-url', 'origin'], true);
    if (!new RegExp('github\\.com[:/]' + repository.replace('/', '\\/') + '(?:\\.git)?$','i').test(remote)) throw new Error('origin must point to ' + repository);
    const staged = run('git', ['diff', '--cached', '--name-only'], true).split('\n').filter(Boolean);
    if (staged.some(p => p !== relative)) throw new Error('Unrelated files are staged. Commit or unstage them before --push.');
  }
  let previous = {};
  if (fs.existsSync(target)) {
    const match = fs.readFileSync(target, 'utf8').match(/^(\{[\s\S]*?\n\})\s*\n/);
    if (!match) throw new Error('Existing page has unrecognized front matter; refusing to overwrite.');
    previous = JSON.parse(match[1]);
  }
  const meta = { ...previous, title: `Decision Log · ${date}`, date, summary: decisionSummary(body), kind: 'decision', draft: false };
  const write = () => {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(meta, null, 2) + '\n\n' + body + '\n');
  };
  write();
  run('npm', ['run', 'build']);
  run('npm', ['run', 'check']);
  if ((flags.push || flags.discussion) && !meta.discussion) {
    meta.discussion = discussion(date);
    write();
    run('npm', ['run', 'build']);
    run('npm', ['run', 'check']);
  }
  console.log('Prepared: ' + target);

  // The daily habits are recorded in the same Plan section this page comes from, so the
  // habit pages move on the same pass. Without --push this only rewrites the vault notes.
  syncHabits(diary, flags.push);

  if (!flags.push) return;
  run('git', ['add', '--', relative]);
  if (run('git', ['diff', '--cached', '--name-only', '--', relative], true)) {
    run('git', ['commit', '-m', `Publish decision log: ${date}`, '--', relative]);
  }
  run('git', ['push', 'origin', 'main']);
  console.log('Pushed. GitHub Actions will deploy the page; check the workflow for completion.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error('publish-decision: ' + error.message); process.exitCode = 1; }
}
