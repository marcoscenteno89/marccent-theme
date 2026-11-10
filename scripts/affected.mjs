/*
 * npm run affected: which projects to check after a theme change (docs/projects.json).
 *
 * Takes the files changed since a base (default: origin/master, or the last commit when on master, plus anything not
 * committed yet) and matches them against each project's "uses" (a path, or a folder ending in /). A project whose
 * "via" names an affected project is listed too: it gets the change through that one. Active projects first; frozen
 * ones are only named (PRODUCT-LINE.md 3.5: brought up to date once, at 1.0); retired ones are left out.
 *
 *   node scripts/affected.mjs [--since <git ref>] [files…]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { projects } = JSON.parse(readFileSync(join(ROOT, 'docs', 'projects.json'), 'utf8'));
const args = process.argv.slice(2);
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);

let files = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--since');
if (!files.length) {
  let since = args.includes('--since') ? args[args.indexOf('--since') + 1] : null;
  if (!since) {
    const branch = git('rev-parse', '--abbrev-ref', 'HEAD')[0];
    since = branch === 'master' ? 'HEAD~1' : 'origin/master';
  }
  files = [...new Set([...git('diff', '--name-only', `${since}...HEAD`), ...git('diff', '--name-only', 'HEAD')])];
  console.log(`Changed since ${since}: ${files.length} file(s)\n`);
}

const hits = new Map();
for (const p of projects) {
  const matched = files.filter((f) => p.uses.some((u) => (u.endsWith('/') ? f.startsWith(u) : f === u || f.startsWith(u + '/'))));
  if (matched.length) hits.set(p.repo, matched);
}
// Through another project: Marccent Content gets a Blocks change through Blocks.
for (const p of projects) {
  const through = (p.via || []).filter((v) => hits.has(v) && !hits.get(v).via);
  if (through.length && !hits.has(p.repo)) hits.set(p.repo, Object.assign([], { via: through }));
}

const show = (stage) => projects.filter((p) => p.stage === stage && hits.has(p.repo));
const active = show('active');
const frozen = show('frozen');
if (!active.length && !frozen.length) {
  console.log('No project reads what changed.');
  process.exit(0);
}
for (const p of active) {
  const m = hits.get(p.repo);
  console.log(`check ${p.repo} (pins: ${p.pins})`);
  if (m.via) console.log(`      through ${m.via.join(', ')}`);
  else for (const f of m.slice(0, 8)) console.log(`      ${f}`);
  if (!m.via && m.length > 8) console.log(`      … ${m.length - 8} more`);
}
if (frozen.length) console.log(`\nfrozen, brought up to date at 1.0: ${frozen.map((p) => p.repo).join(', ')}`);
