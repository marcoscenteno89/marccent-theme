/*
 * npm run conformance: the Settings and Adapters gates (PRODUCT-LINE.md).
 *
 * Markup: each adapter of each output in markup/outputs.json renders every case of markup/reference.json (sent on
 * stdin, its last argument "-") its own way and prints them as JSON, { component: { case: html } }; this compares each
 * with the reference's HTML, the one comparison every adapter is held to (markup/README.md says what doesn't count),
 * and lists the components an adapter doesn't cover. Fails when a case differs; with --strict, also when one is missing.
 *
 * Kinds: every component in markup/settings.json has one (component, container, pattern, variant: PRODUCT-LINE.md
 * 4.5); the patterns and variants still listed are reported, waiting to leave.
 *
 * Admin: every kind of admin data a component needs (markup/settings.json) is one of outputs.json's kinds, and every
 * output with an admin says which of its tools provides each kind. Fails on a kind that isn't defined; reports (and
 * with --strict fails on) a kind an admin output has no tool for yet, and components whose settings aren't written.
 *
 *   node scripts/conformance.mjs [--strict] [--adapter <name>] [--reference <file>] [--render <command…>]
 *
 * An adapter's own test runs it against its pinned reference: --reference node_modules/marccent-theme/markup/
 * reference.json --render php tools/markup-render.php. An adapter whose folder isn't here is skipped (said so);
 * one that "uses" the theme's components writes their markup by construction and has nothing to render.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFragment } from 'parse5';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const strict = args.includes('--strict');
const reference = resolve(option('--reference') ?? join(ROOT, 'markup/reference.json'));
const cases = JSON.parse(readFileSync(reference, 'utf8'));

// HTML as a comparable tree: [tag, sorted attributes (classes sorted, a style's spaces dropped), children]; blank
// text dropped and runs of space as one. Entities are decoded by the parser, so &#039; and &#x27; are the same.
const value = (name, v) =>
  name === 'class' ? v.split(/\s+/).filter(Boolean).sort().join(' ')
    : name === 'style' ? v.split(';').map((d) => d.trim().replace(/\s*:\s*/, ':')).filter(Boolean).join(';')
      : v;
const tree = (node) => {
  if (node.nodeName === '#text') return node.value.trim() ? node.value.trim().replace(/\s+/g, ' ') : null;
  if (node.nodeName === '#comment') return null;
  const attrs = (node.attrs ?? []).map((a) => [a.name, value(a.name, a.value)]).sort(([a], [b]) => (a < b ? -1 : 1));
  const children = (node.content ?? node).childNodes?.map(tree).filter((c) => c !== null) ?? [];
  return [node.nodeName, attrs, children];
};
const same = (a, b) => JSON.stringify(tree(parseFragment(a))) === JSON.stringify(tree(parseFragment(b)));

// One adapter: run its renderer in its folder, compare what it printed. Returns [failed, missing].
function check(name, cwd, command) {
  const run = spawnSync(command[0], [...command.slice(1), '-'], { cwd, input: readFileSync(reference), encoding: 'utf8', maxBuffer: 64 << 20 });
  if (run.error || run.status !== 0) {
    console.log(`FAIL ${name}: its renderer didn't run (${command.join(' ')})\n${run.error?.message ?? run.stderr}`);
    return [1, 0];
  }
  let out;
  try {
    out = JSON.parse(run.stdout);
  } catch {
    console.log(`FAIL ${name}: its renderer didn't print JSON\n${run.stdout.slice(0, 500)}`);
    return [1, 0];
  }
  let failed = 0;
  let passed = 0;
  const missing = [];
  for (const [component, list] of Object.entries(cases)) {
    for (const c of list) {
      const html = out[component]?.[c.case];
      if (html === undefined) {
        missing.push(`${component}: ${c.case}`);
      } else if (same(html, c.html)) {
        passed++;
      } else {
        failed++;
        console.log(`FAIL ${name} ${component}: ${c.case}\n     theme:   ${c.html}\n     adapter: ${html}`);
      }
    }
  }
  const total = Object.values(cases).flat().length;
  console.log(`${failed ? 'FAIL' : 'ok  '} ${name}: ${passed} of ${total} cases match${failed ? `, ${failed} differ` : ''}${missing.length ? `, ${missing.length} not covered` : ''}`);
  const uncovered = Object.keys(cases).filter((component) => !out[component]);
  if (uncovered.length) console.log(`     not covered: ${uncovered.join(', ')}`);
  return [failed, missing.length];
}

let failed = 0;
let missing = 0;
const tally = ([f, m]) => { failed += f; missing += m; };
if (option('--render')) {
  tally(check(option('--adapter') ?? 'this adapter', process.cwd(), args.slice(args.indexOf('--render') + 1)));
} else {
  const { admin, outputs } = JSON.parse(readFileSync(join(ROOT, 'markup/outputs.json'), 'utf8'));
  for (const [output, o] of Object.entries(outputs)) {
    if (o.frozen) {
      console.log(`skip ${output}: frozen (${o.frozen})`);
      continue;
    }
    for (const [name, a] of Object.entries(o.adapters)) {
      if (option('--adapter') && option('--adapter') !== name) continue;
      const cwd = resolve(ROOT, a.path);
      if (a.uses) console.log(`ok   ${output} ${name}: uses ${a.uses}`);
      else if (!existsSync(cwd)) console.log(`skip ${output} ${name}: no folder at ${a.path}`);
      else tally(check(`${output} ${name}`, cwd, a.render));
    }
  }

  // The admin pattern: what each component needs, and which tool gives it on each output that has an admin.
  if (!option('--adapter')) {
    const settings = JSON.parse(readFileSync(join(ROOT, 'markup/settings.json'), 'utf8'));
    const needs = {};
    for (const [component, s] of Object.entries(settings)) {
      for (const kind of s.admin) {
        if (!admin[kind]) {
          console.log(`FAIL admin: ${component} needs "${kind}", which outputs.json doesn't define`);
          failed++;
        }
        (needs[kind] ??= []).push(component);
      }
    }
    for (const [output, o] of Object.entries(outputs)) {
      if (!o.admin) {
        console.log(`ok   admin ${output}: no admin (data comes with the page)`);
        continue;
      }
      if (o.frozen) continue;
      const lacking = Object.keys(needs).filter((kind) => !admin[kind]?.[output]);
      missing += lacking.length;
      console.log(`${lacking.length ? 'todo' : 'ok  '} admin ${output}: ${Object.keys(needs).length - lacking.length} of ${Object.keys(needs).length} kinds have a tool`);
      for (const kind of lacking) console.log(`     no tool for ${kind} (${needs[kind].join(', ')})`);
    }
    // Each one's kind (PRODUCT-LINE.md 4.5): a component or container stays; a pattern or a variant is waiting to leave.
    const KINDS = [ 'component', 'container', 'pattern', 'variant' ];
    for (const [component, s] of Object.entries(settings)) {
      if (!KINDS.includes(s.kind)) {
        console.log(`FAIL kind: ${component} is "${s.kind ?? ''}", not one of ${KINDS.join(', ')}`);
        failed++;
      }
    }
    for (const kind of [ 'pattern', 'variant' ]) {
      const waiting = Object.entries(settings).filter(([, s]) => s.kind === kind).map(([c]) => c);
      missing += waiting.length;
      if (waiting.length) console.log(`todo kind: ${waiting.length} still components, to become ${kind === 'pattern' ? 'patterns (PATTERNS.md)' : 'variants (T-030)'}: ${waiting.join(', ')}`);
    }
    const unwritten = Object.entries(settings).filter(([, s]) => s.settings === null).map(([c]) => c);
    missing += unwritten.length;
    if (unwritten.length) console.log(`todo settings: ${unwritten.length} of ${Object.keys(settings).length} components' settings not written yet (T-029)`);
  }
}
process.exit(failed || (strict && missing) ? 1 : 0);
