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
 *   node scripts/conformance.mjs [--strict] [--adapter <name>] [--reference <file>] [--save <dir>] [--render <command…>]
 *
 * --save: each adapter's markup as it printed it, one JSON file per adapter (the cases page shows them, npm run cases).
 *
 * An adapter's own test runs it against its pinned reference: --reference node_modules/marccent-theme/markup/
 * reference.json --render php tools/markup-render.php. An adapter whose folder isn't here is skipped (said so);
 * one that "uses" the theme's components writes their markup by construction and has nothing to render.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
    if (option('--save')) { mkdirSync(resolve(option('--save')), { recursive: true }); writeFileSync(join(resolve(option('--save')), `${name.replace(/\W+/g, '-')}.json`), run.stdout); }
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
    const KINDS = [ 'component', 'container', 'pattern', 'variant', 'remove' ];
    for (const [component, s] of Object.entries(settings)) {
      if (!KINDS.includes(s.kind)) {
        console.log(`FAIL kind: ${component} is "${s.kind ?? ''}", not one of ${KINDS.join(', ')}`);
        failed++;
      }
    }
    // The variants (markup/variants.json): each on components that exist and can take one, and each component's
    // variants in the list.
    const variants = JSON.parse(readFileSync(join(ROOT, 'markup/variants.json'), 'utf8'));
    for (const [name, v] of Object.entries(variants)) {
      for (const on of v.on) {
        if (![ 'component', 'container' ].includes(settings[on]?.kind) || !settings[on].variants?.includes(name)) {
          console.log(`FAIL variant ${name}: on ${on}, which isn't a component or container listing it in its variants`);
          failed++;
        }
      }
    }
    for (const [component, s] of Object.entries(settings)) {
      for (const name of s.variants ?? []) {
        if (!variants[name]) {
          console.log(`FAIL variant: ${component} lists "${name}", which markup/variants.json doesn't have`);
          failed++;
        }
      }
    }
    console.log(`ok   variants: ${Object.keys(variants).join(', ')}`);
    // Children (PRODUCT-LINE.md 4.5): each marked with a parent that exists and is a component or container.
    const children = Object.entries(settings).filter(([, s]) => s.parent);
    for (const [component, s] of children) {
      if (![ 'component', 'container' ].includes(settings[s.parent]?.kind)) {
        console.log(`FAIL parent: ${component}'s parent ${s.parent} isn't a component or container in settings.json`);
        failed++;
      }
    }
    console.log(`ok   children: ${children.filter(([, s]) => !s.planned).map(([c, s]) => `${c} in ${s.parent}`).join(', ')}`);
    const planned = Object.entries(settings).filter(([, s]) => s.planned);
    missing += planned.length;
    if (planned.length) console.log(`todo planned: ${planned.length} to build: ${planned.map(([c, s]) => s.parent ? `${c} in ${s.parent}` : `${c} (${s.planned.replace(/^T-\d+: /, '')})`).join(', ')}`);
    for (const kind of [ 'pattern', 'variant', 'remove' ]) {
      const waiting = Object.entries(settings).filter(([, s]) => s.kind === kind).map(([c]) => c);
      missing += waiting.length;
      if (waiting.length) console.log(`todo kind: ${waiting.length} still components, to become ${{ pattern: 'patterns (PATTERNS.md)', variant: 'variants (T-030)', remove: 'nothing (a container, or a component with its children, already does it)' }[kind]}: ${waiting.join(', ')}`);
    }
    // Each component's settings (PRODUCT-LINE.md 5): a type, a sanitize rule, choices only from a fixed list, a version.
    const TYPES = [ 'text', 'number', 'boolean', 'list', 'object', 'content' ];
    const SANITIZE = [ 'text', 'html', 'url', 'class', 'number', 'boolean', 'each item', 'each field' ];
    for (const [component, s] of Object.entries(settings)) {
      if (!s.settings) continue;
      if (!Number.isInteger(s.version)) { console.log(`FAIL settings: ${component} has no version`); failed++; }
      for (const [key, v] of Object.entries(s.settings)) {
        const wrong = !TYPES.includes(v.type) ? `type "${v.type}"` : !SANITIZE.includes(v.sanitize) ? `sanitize "${v.sanitize}"`
          : v.validate && v.validate !== 'required' ? `validate "${v.validate}"` : v.choices && !Array.isArray(v.choices) ? 'choices' : '';
        if (wrong) { console.log(`FAIL settings: ${component}.${key}: ${wrong}`); failed++; }
      }
    }
    // Each setting is a prop of its component (by its prop name, when the setting's full-word name differs; content is
    // its children), read from the component's source: the settings can't drift from the code.
    const sources = readdirSync(join(ROOT, 'components'), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(ROOT, 'components', f), 'utf8'));
    for (const [component, s] of Object.entries(settings)) {
      if (!s.settings || !Object.keys(s.settings).length) continue;
      const source = sources.find((t) => new RegExp(`^(?:export )?(?:const|function) ${component} = \\(\\{`, 'm').test(t));
      if (!source) continue; // no props to read (an element, a filter): written by hand
      const head = source.match(new RegExp(`^(?:export )?(?:const|function) ${component} = \\(\\{([\\s\\S]*?)\\}\\) =>`, 'm'))?.[1] ?? '';
      const names = (h) => h.split(/,(?![^{[]*[}\]])/).map((p) => p.split('=')[0].split(':')[0].trim().replace(/'/g, ''));
      const props = new Set(names(head));
      // A rest prop handed whole to another component in the same file (Menu's ...props to MenuNav): its props count too.
      for (const rest of [ ...props ].filter((p) => p.startsWith('...')).map((p) => p.slice(3))) {
        for (const [ , inner ] of source.matchAll(new RegExp(`<(\\w+) \\{\\.\\.\\.${rest}\\}`, 'g'))) {
          const innerHead = source.match(new RegExp(`^(?:export )?(?:const|function) ${inner} = \\(\\{([\\s\\S]*?)\\}\\) =>`, 'm'))?.[1];
          if (innerHead) names(innerHead).forEach((p) => props.add(p));
        }
      }
      for (const [key, v] of Object.entries(s.settings)) {
        const prop = key === 'content' ? 'children' : v.prop ?? key;
        if (!props.has(prop)) { console.log(`FAIL settings: ${component}.${key} isn't one of its props (${prop})`); failed++; }
      }
    }
    const unwritten = Object.entries(settings).filter(([, s]) => s.settings === null && [ 'component', 'container' ].includes(s.kind) && !s.planned).map(([c]) => c);
    missing += unwritten.length;
    console.log(unwritten.length ? `todo settings: ${unwritten.join(', ')} not written yet (T-029)` : `ok   settings: every component that stays (${Object.values(settings).filter((s) => s.settings).length}), ${Object.values(settings).reduce((n, s) => n + Object.keys(s.settings ?? {}).length, 0)} settings`);
  }
}
process.exit(failed || (strict && missing) ? 1 : 0);
