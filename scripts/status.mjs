/*
 * npm run status: is every project up to date with the theme? (docs/projects.json)
 *
 * For each project that pins the theme, reads its pin from its checkout (its workspace path, or a folder named after
 * its repo next to the theme), finds that commit in the theme, and lists the theme commits since then that touch what
 * the project uses ("uses"). A project that gets the theme through another ("via") is as current as that one. Fails
 * (exit 1) when an active project is behind, so nothing in the pipeline is left out; frozen ones are reported only
 * (PRODUCT-LINE.md 3.5), retired ones skipped. A project not checked out here is said so, never guessed.
 *
 *   node scripts/status.mjs [--root <folder>] [--against <git ref>]   (default: the workspace; origin/master)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const root = resolve(option('--root', join(ROOT, '..')));
const git = (...a) => {
  try {
    return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};
const against = option('--against', git('rev-parse', '--verify', 'origin/master') ? 'origin/master' : 'HEAD');
const { projects } = JSON.parse(readFileSync(join(ROOT, 'docs', 'projects.json'), 'utf8'));

const state = new Map(); // repo -> { behind: number | null, note }
for (const p of projects.filter((p) => p.pin)) {
  const folder = [join(root, p.path), join(root, p.repo)].find((f) => existsSync(join(f, p.pin.file)));
  if (!folder) {
    state.set(p.repo, { behind: null, note: `not checked out here (${p.path}): not checked` });
    continue;
  }
  const value = readFileSync(join(folder, p.pin.file), 'utf8').match(new RegExp(p.pin.match))?.[1];
  if (!value) {
    state.set(p.repo, { behind: null, note: `no pin found in ${p.pin.file}` });
    continue;
  }
  const ref = p.pin.is === 'version' ? `v${value}` : value;
  const commit = git('rev-parse', '--verify', `${ref}^{commit}`);
  if (!commit) {
    state.set(p.repo, { behind: null, note: `pins ${ref}, which isn't in this checkout (git fetch --tags?)` });
    continue;
  }
  const paths = p.uses.map((u) => u.replace(/\/$/, ''));
  const log = git('log', '--format=%h %s', `${commit}..${against}`, '--', ...paths) || '';
  const commits = log ? log.split('\n') : [];
  state.set(p.repo, { behind: commits.length, pin: ref, commits });
}

let failing = 0;
for (const p of projects) {
  if (p.stage === 'retired') continue;
  let s = state.get(p.repo);
  if (!s && p.via?.length) {
    const from = state.get(p.via[0]);
    s = from ? { ...from, via: p.via[0] } : { behind: null, note: 'gets the theme through a project not listed' };
  }
  if (!s) s = { behind: null, note: 'no pin in projects.json yet' };
  const tag = p.stage === 'frozen' ? ' (frozen)' : '';
  const through = s.via ? ` through ${s.via}` : '';
  if (s.behind === null) {
    console.log(`?    ${p.repo}${tag}${through}: ${s.note}`);
  } else if (s.behind === 0) {
    console.log(`ok   ${p.repo}${tag}${through}: current with ${against} (pins ${s.pin})`);
  } else {
    if (p.stage === 'active' && !s.via) failing++;
    console.log(`${p.stage === 'active' ? 'BEHIND' : 'behind'} ${p.repo}${tag}${through}: pins ${s.pin}, ${s.behind} theme commit(s) since touch what it uses`);
    if (!s.via) for (const c of s.commits.slice(0, 5)) console.log(`       ${c}`);
    if (!s.via && s.commits.length > 5) console.log(`       … ${s.commits.length - 5} more`);
  }
}
if (failing) {
  console.log(`\n${failing} active project(s) behind the theme: update the pin and check the change there (npm run affected).`);
  process.exit(1);
}
