/*
 * npm test: every public component has a case (markup/cases.json) and a test file under tests/.
 *
 * A public component is a component a site uses: every key in markup/cases.json, and every file in components/ui/ and
 * components/widgets/ (the folders a site imports from; theme/, visuals/ and pause-offscreen.js are the theme's own
 * tools and effects and are not counted). A component is matched by its name in kebab-case: markup/cases.json's
 * `codeTabs` is components/ui/code-tabs.js and its test file is tests/e2e/code-tabs.spec.mjs.
 *
 * A gap (no case, or no test file) fails the check unless markup/coverage-gaps.json names it with its issue. The
 * allowlist may only shrink: a listed gap that now has its case and test fails until it is removed from the list.
 *
 *   node scripts/public-coverage.mjs
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const read = (file) => JSON.parse(readFileSync(join(ROOT, file), 'utf8'));
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Every file in a folder tree, as paths relative to ROOT.
function walk(dir, keep) {
  const out = [];
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path, keep));
    else if (keep(path)) out.push(path);
  }
  return out;
}

const cases = read('markup/cases.json');
const allowlist = existsSync(join(ROOT, 'markup/coverage-gaps.json')) ? read('markup/coverage-gaps.json') : { gaps: [] };
const testFiles = existsSync(join(ROOT, 'tests')) ? walk('tests', (f) => f.endsWith('.spec.mjs')) : [];
const componentFiles = [ ...walk('components/ui', (f) => f.endsWith('.js')), ...walk('components/widgets', (f) => f.endsWith('.js')) ];

// One entry per public component name (kebab-case).
const components = new Map();
const entry = (name) => {
  if (!components.has(name)) components.set(name, { name, cases: 0, caseKeys: [], file: null, tests: null });
  return components.get(name);
};
for (const key of Object.keys(cases)) {
  const item = entry(kebab(key));
  item.cases = cases[key].length;
  item.caseKeys.push(key);
}
for (const file of componentFiles) {
  const name = file.split('/').pop().replace(/\.js$/, '');
  entry(name).file = relative(ROOT, join(ROOT, file));
}
for (const item of components.values()) {
  const match = testFiles.find((f) => f.endsWith(`/${item.name}.spec.mjs`) || f === `tests/${item.name}.spec.mjs`);
  item.tests = match ? relative(ROOT, join(ROOT, match)) : null;
}

const allowed = new Map(allowlist.gaps.map((gap) => [ gap.component, gap ]));
const problems = [];
const listed = [];
for (const item of components.values()) {
  const missing = [];
  if (item.cases === 0) missing.push('no case in markup/cases.json');
  if (item.tests === null) missing.push('no test file under tests/');
  const gap = allowed.get(item.name);
  if (missing.length && gap) listed.push(`${item.name}: ${missing.join(', ')} (${gap.issue})`);
  else if (missing.length) problems.push(`${item.name}: ${missing.join(', ')}`);
  else if (gap) problems.push(`${item.name}: now covered, remove it from markup/coverage-gaps.json`);
}
for (const gap of allowlist.gaps) {
  if (!components.has(gap.component)) problems.push(`${gap.component}: in markup/coverage-gaps.json but not a public component; remove it`);
}

console.log(`Public components: ${components.size}, cases: ${[ ...components.values() ].reduce((n, c) => n + c.cases, 0)}, test files: ${[ ...components.values() ].filter((c) => c.tests).length}`);
for (const item of [ ...components.values() ].sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`  ${item.name.padEnd(20)} cases ${String(item.cases).padStart(2)}  ${item.tests ?? '(no test file)'}`);
}
if (listed.length) {
  console.log(`Allowlisted gaps (markup/coverage-gaps.json): ${listed.length}`);
  for (const line of listed) console.log(`  ${line}`);
}
if (problems.length) {
  console.log('FAIL public components: a gap that is not allowlisted, or an allowlist entry that is out of date');
  for (const line of problems) console.log(`  ${line}`);
  process.exit(1);
}
console.log('ok   public components: every one has a case and a test file, or an allowlisted gap');
