/*
 * npm run conformance: the Settings and Adapters gates (PRODUCT-LINE.md).
 *
 * Markup: each adapter of each output in markup/outputs.json renders every case of markup/reference.json (sent on
 * stdin, its last argument "-") its own way and prints them as JSON, { component: { case: html } }; this compares each
 * with the reference's HTML, the one comparison every adapter is held to (markup/README.md says what doesn't count),
 * and lists the components an adapter doesn't cover. Fails when a case differs; with --strict, also when one is missing.
 *
 * Admin: every kind of admin data a component needs (markup/settings.json) is one of outputs.json's kinds, and every
 * output with an admin says which of its tools provides each kind. Fails on a kind that isn't defined; reports (and
 * with --strict fails on) a kind an admin output has no tool for yet, and components whose settings aren't written.
 *
 * Sizing (PRODUCT-LINE.md section 4, rule 10): no component in styles/components sets its own width or outer margin.
 * Fails on a width, max-width, min-width or margin on a component's root (the selector is the root itself, with no
 * part after it) that its kind doesn't allow: a block fills its parent, an inline control fits its content, an
 * overlay is exempt. ROOTS below names each root's kind; SIZING_EXCEPTIONS each open ticket that excuses one.
 *
 *   node scripts/conformance.mjs [--strict] [--adapter <name>] [--reference <file>] [--render <command…>]
 *
 * An adapter's own test runs it against its pinned reference: --reference node_modules/@marccent/theme/markup/
 * reference.json --render php tools/markup-render.php. An adapter whose folder isn't here is skipped (said so);
 * one that "uses" the theme's components writes their markup by construction and has nothing to render.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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
      const lacking = Object.keys(needs).filter((kind) => !admin[kind]?.[output]);
      missing += lacking.length;
      console.log(`${lacking.length ? 'todo' : 'ok  '} admin ${output}: ${Object.keys(needs).length - lacking.length} of ${Object.keys(needs).length} kinds have a tool`);
      for (const kind of lacking) console.log(`     no tool for ${kind} (${needs[kind].join(', ')})`);
    }
    const unwritten = Object.entries(settings).filter(([, s]) => s.settings === null).map(([c]) => c);
    missing += unwritten.length;
    if (unwritten.length) console.log(`todo settings: ${unwritten.length} of ${Object.keys(settings).length} components' settings not written yet (T-029)`);
  }
}

// Sizing: each component root's kind. A file in styles/components with none of these fails, so a new component has
// to say what it is. Other classes (parts, modifiers, states) aren't roots: a rule on a part is sized inside its root.
const ROOTS = {
  block: ['app-shell', 'board', 'swiper', 'compare', 'divider', 'dock-items', 'field', 'inline-form', 'pairs', 'header',
    'map', 'menu', 'nav', 'spinner', 'loader-bar', 'loader-bars', 'loader-dots', 'loader-flip', 'loader-orbit',
    'loader-pulse', 'loader-ring'],
  replaced: ['input', 'table'], // a form control or a table: auto doesn't fill, so 100% is how they fill (it's the parent's width)
  inline: ['btn', 'chip', 'rating', 'fa', 'fa-solid', 'fa-regular', 'fa-brands'],
  overlay: ['modal', 'float', 'toast', 'toggle-panel', 'menu-panel'], // outside the flow: sized against the screen
};
// What each kind may set on its root. Anything else (a fixed width, a margin) is the parent's to decide.
const ALLOWED = {
  block: { width: ['auto'], 'max-width': ['100%', 'none'], 'min-width': ['0', 'auto'], margin: ['0'] },
  replaced: { width: ['auto', '100%'], 'max-width': ['100%', 'none'], 'min-width': ['0', 'auto'], margin: ['0'] },
  // An icon is a square glyph: --icon-size is its content's size, set by the text it sits in.
  inline: { width: ['auto', 'fit-content', 'max-content', 'min-content', 'var(--icon-size)'], 'max-width': ['100%', 'none'],
    'min-width': ['0', 'auto', 'fit-content', 'max-content', 'min-content'], margin: ['0'] },
};
// Open tickets that excuse a declaration until they ship: "root property" → ticket. Delete the line with the fix.
const SIZING_EXCEPTIONS = { 'loader-bar width': 'B-003' };

if (!option('--adapter') && !option('--render')) {
  const kindOf = Object.fromEntries(Object.entries(ROOTS).flatMap(([kind, roots]) => roots.map((r) => [r, kind])));
  const dir = join(ROOT, 'styles/components');
  const before = failed;
  let checked = 0;
  // Split on a character outside parentheses (a selector list's commas, a compound's combinators).
  const split = (text, at) => {
    const out = [''];
    let depth = 0;
    for (const ch of text) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (!depth && at.test(ch)) out.push('');
      else out[out.length - 1] += ch;
    }
    return out.map((p) => p.trim()).filter(Boolean);
  };
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.css')).sort()) {
    const css = readFileSync(join(dir, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    if (![...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].some((m) => kindOf[m[1]])) {
      console.log(`FAIL sizing ${file}: none of its classes is in ROOTS (scripts/conformance.mjs): say what kind it is`);
      failed++;
    }
    for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const selector of split(selectors.trim().replace(/\s+/g, ' '), /,/)) {
        if (selector.startsWith('@')) continue;
        const classes = [...selector.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]);
        if (split(selector, /[ >+~]/).length > 1 || selector.includes('::')) continue; // a part, sized inside the root
        const root = classes.find((c) => kindOf[c]);
        const kind = kindOf[root];
        if (!root || kind === 'overlay') continue;
        checked++;
        for (const declaration of body.split(';')) {
          const [name, ...rest] = declaration.split(':');
          const value = rest.join(':').replace(/!important/, '').trim();
          const property = name.trim().replace(/^inline-size$/, 'width').replace(/^(max|min)-inline-size$/, '$1-width')
            .replace(/^margin-.*$/, 'margin');
          const allowed = ALLOWED[kind][property];
          if (!allowed || allowed.includes(value) || (property === 'margin' && /^0( 0)*$/.test(value))) continue;
          const ticket = SIZING_EXCEPTIONS[`${root} ${property}`];
          if (ticket) {
            console.log(`todo sizing ${file}: ${selector} { ${name.trim()}: ${value} } until ${ticket}`);
            continue;
          }
          console.log(`FAIL sizing ${file}: ${selector} { ${name.trim()}: ${value} }: .${root} is ${kind}, so its ${property} is its parent's to decide (PRODUCT-LINE.md section 4, rule 10)`);
          failed++;
        }
      }
    }
  }
  if (failed === before) console.log(`ok   sizing: ${checked} root rules set no width or margin of their own`);
}
process.exit(failed || (strict && missing) ? 1 : 0);
