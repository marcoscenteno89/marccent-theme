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
 * Sizing (PRODUCT-LINE.md section 4, rule 9): no component in styles/components sets its own width or outer margin.
 * Fails on a width, max-width, min-width or margin on a component's root (the selector is the root itself, with no
 * part after it) that its kind doesn't allow: a block fills its parent, an inline control fits its content, an
 * overlay is exempt. ROOTS below names each root's kind; SIZING_EXCEPTIONS each open ticket that excuses one.
 *
 *   node scripts/conformance.mjs [--strict] [--adapter <name>] [--reference <file>] [--save <dir>] [--render <command…>]
 *
 * Itself only (section 4, rule 10): no stylesheet in styles/components reaches another component's root from outside
 * (STYLES_EXCEPTIONS excuses one by ticket). Page frames: a component whose settings take two or more named pieces of
 * content is reported as a probable pattern (REVIEWED_FRAMES lists the ones decided to stay).
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

// Sizing: each component root's kind. A file in styles/components with none of these fails, so a new component has
// to say what it is. Other classes (parts, modifiers, states) aren't roots: a rule on a part is sized inside its root.
const ROOTS = {
  block: ['board', 'swiper', 'compare', 'divider', 'dock-items', 'field', 'inline-form', 'pairs', 'header',
    'map', 'menu', 'nav', 'spinner', 'loader-bar', 'loader-bars', 'loader-dots', 'loader-flip', 'loader-orbit',
    'loader-pulse', 'loader-ring'],
  replaced: ['input', 'table'], // a form control or a table: auto doesn't fill, so 100% is how they fill (it's the parent's width)
  inline: ['btn', 'chip', 'rating', 'fa', 'fa-solid', 'fa-regular', 'fa-brands'],
  overlay: ['modal', 'float', 'toast', 'toggle-panel', 'menu-panel'], // outside the flow: sized against the screen
  state: ['sidebar'], // its width is its state (open, collapsed): one width per state, from tokens
};
// What each kind may set on its root. Anything else (a fixed width, a margin) is the parent's to decide.
const ALLOWED = {
  block: { width: ['auto'], 'max-width': ['100%', 'none'], 'min-width': ['0', 'auto'], margin: ['0'] },
  replaced: { width: ['auto', '100%'], 'max-width': ['100%', 'none'], 'min-width': ['0', 'auto'], margin: ['0'] },
  // An icon is a square glyph: --icon-size is its content's size, set by the text it sits in.
  state: { width: ['var(--sidebar-width)', 'calc(var(--icon-size) + 2 * var(--space-sm))'], 'max-width': ['100%', 'none'], 'min-width': ['0', 'auto'], margin: ['0'] },
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
          console.log(`FAIL sizing ${file}: ${selector} { ${name.trim()}: ${value} }: .${root} is ${kind}, so its ${property} is its parent's to decide (PRODUCT-LINE.md section 4, rule 9)`);
          failed++;
        }
      }
    }
  }
  if (failed === before) console.log(`ok   sizing: ${checked} root rules set no width or margin of their own`);
}
// Itself only (PRODUCT-LINE.md section 4, rule 10): no component's stylesheet reaches another component's root from
// outside. A root belongs to the files that style it as their own (it leads a selector there); a selector in another
// file that names it after a combinator fails. STYLES_EXCEPTIONS: open tickets that excuse one, "file root" → ticket.
const STYLES_EXCEPTIONS = {
  'nav.css menu': 'T-032', 'nav.css menu-panel': 'T-032', // NavBar becomes the Header pattern
  'menu.css toggle-panel': 'B-004',
};
if (!option('--adapter') && !option('--render')) {
  const dir = join(ROOT, 'styles/components');
  // Shared parts: classes in ROOTS that are a part of any box, not a component; each box styles its own.
  const SHARED_PARTS = { header: 'the title row of any box (header.css): a modal\'s, a toast\'s, a card\'s' };
  const all = Object.values(ROOTS).flat().filter((r) => !SHARED_PARTS[r]);
  const files = readdirSync(dir).filter((f) => f.endsWith('.css')).sort()
    .map((f) => [ f, readFileSync(join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '') ]);
  const commas = (text) => { const out = [ '' ]; let depth = 0; for (const ch of text) { if (ch === '(') depth++; if (ch === ')') depth--; if (!depth && ch === ',') out.push(''); else out[out.length - 1] += ch; } return out; };
  // :is() and :where() lists are expanded one level, so each of their selectors is checked on its own.
  const expand = (sel) => { const m = sel.match(/:(?:is|where)\(([^()]*)\)/); return m ? commas(m[1]).flatMap((alt) => expand(sel.replace(m[0], alt.trim()))) : [ sel ]; };
  const selectorsOf = (css) => [...css.matchAll(/([^{}@]+)\{/g)].flatMap((m) => commas(m[1])).flatMap(expand).map((x) => x.trim().replace(/\s+/g, ' '))
    .filter((x) => x && !/^(from|to|\d+%)$/.test(x));
  const classesIn = (compound) => [...compound.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]);
  const owners = {};
  for (const [ f, css ] of files) for (const sel of selectorsOf(css)) {
    const first = sel.split(/ ?[ >+~] ?/)[0].replace(/:(is|where|not|has)\(.*$/, '');
    for (const c of classesIn(first)) if (all.includes(c)) (owners[c] ??= new Set()).add(f);
  }
  const before = failed;
  let excused = 0;
  for (const [ f, css ] of files) {
    const seen = new Set();
    for (const sel of selectorsOf(css)) {
      for (const part of sel.split(/ ?[ >+~] ?/).slice(1)) {
        for (const c of classesIn(part)) {
          if (!all.includes(c) || owners[c]?.has(f) || seen.has(c)) continue;
          seen.add(c);
          const ticket = STYLES_EXCEPTIONS[`${f} ${c}`];
          if (ticket) { console.log(`todo styles ${f}: reaches .${c} until ${ticket}`); excused++; continue; }
          console.log(`FAIL styles ${f}: ${sel} reaches .${c}, another component's root (PRODUCT-LINE.md section 4, rule 10)`);
          failed++;
        }
      }
    }
  }
  if (failed === before) console.log(`ok   styles: no component styles another's root (${files.length} stylesheets${excused ? `, ${excused} excused by a ticket` : ''})`);

  // Page frames: two or more named content settings (not `content`, the children) is a probable pattern (4.5).
  const REVIEWED_FRAMES = {};
  const settings = JSON.parse(readFileSync(join(ROOT, 'markup/settings.json'), 'utf8'));
  const frames = Object.entries(settings).filter(([ c, s ]) => [ 'component', 'container' ].includes(s.kind) && !REVIEWED_FRAMES[c])
    .map(([ c, s ]) => [ c, Object.entries(s.settings ?? {}).filter(([ k, v ]) => v.type === 'content' && k !== 'content').map(([ k ]) => k) ])
    .filter(([ , slots ]) => slots.length >= 2);
  for (const [ c, slots ] of frames) console.log(`todo frame: ${c} takes ${slots.join(', ')}: a probable pattern (4.5); decide, or list it in REVIEWED_FRAMES with why`);
  if (!frames.length) console.log('ok   frames: no component takes two named pieces of content');
}

process.exit(failed || (strict && missing) ? 1 : 0);
