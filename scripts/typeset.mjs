/*
 * TYPESET CASES (#22): core/typeset.js is the rules; server/typeset.php and server/typeset.py set the same text on the
 * server, so a WordPress or Django page arrives set and nothing shifts after it loads. This keeps the three the same:
 *
 *   node scripts/typeset.mjs           writes markup/typeset.json: each text case as core/typeset.js sets it, and each
 *                                      markup case as typesetElement() leaves it in a browser (Playwright's Chromium)
 *   node scripts/typeset.mjs --check   fails when the text cases no longer match core/typeset.js (run it again), or
 *                                      when PHP or Python set any case differently; a missing php or python3 is
 *                                      skipped and said so, as conformance does for an adapter
 *
 * A case's html: text escaped (& < >), raised parts as <sup>, the no-break space as itself (U+00A0).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { typesetParts } from '../core/typeset.js';

const ROOT = new URL('..', import.meta.url).pathname;
const FILE = join(ROOT, 'markup/typeset.json');
const check = process.argv.includes('--check');

// Each rule, both ways: where it applies and where it must not.
const TEXTS = [
  'Wait for it...',
  'Open 10--20 hours, Mon--Fri',
  '9 -- 5 daily',
  'Fast -- and cheap',
  'word--word',
  'Marccent(tm), Brand(R), Service(sm) and (c) 2026',
  'Already ™ and ® here',
  'He is 6\'2" tall',
  'A 12" pizza and a 3\' board',
  'Don\'t say "hi" to the 80\'s',
  '40 m2 of floor, 3 ft3 of soil, 12cm2',
  'm2 alone and 2 mm22',
  '10 kg, 72 °F, 50 %, 5 lbs, 2 hrs, 300 sq ft',
  '10 kgs and 5 minutes',
  'The 1st, 2nd, 3rd and 4th floors, 21st and 112th',
  'first and 1stly, st alone, 2 nd',
  'Call 555-123-4567 on 2026-11-12',
  '',
  'plain text that needs nothing',
  'Fish & chips < 5 > 3',
];
// With widow: the last two words of a paragraph together.
const WIDOWS = [
  'Keep the last two words together',
  'Ends with a space ',
  'Short',
  'Two words',
  'A very long last word supercalifragilistic',
  'Ends at 10 kg',
  'Ends on the 2nd',
];
// Markup, as a server writes it: typesetElement() on a div holding it. Kept in the form a browser writes back.
const MARKUP = [
  '<p>Open Mon--Fri, the 2nd floor...</p>',
  '<p>Hello <strong>world</strong> -- and the rest of it</p>',
  '<p>Run <code>a -- b...</code> then (tm)</p>',
  '<pre>x -- y...</pre><p>but here...</p>',
  '<p class="no-typeset">left -- alone...</p><p>set -- here</p>',
  '<div contenteditable="true">edit -- me</div>',
  '<p>Already <sup>st</sup> raised and H<sub>2</sub>O</p>',
  '<p>A <a href="/x?a=1&amp;b=2">link -- here</a> &amp; more...</p>',
  '<ul><li>1st</li><li>2nd item here</li></ul>',
  '<p>Line one<br>line two -- end</p>',
  '<!-- a -- comment... --><p>after -- it</p>',
  '<p>A <img src="a.png" alt="x -- y"> picture...</p>',
  '<script>var a = "--";</script><style>a::after{content:"..."}</style><p>ok...</p>',
  '<p><span class="lead no-typeset">no -- set</span> yes -- set</p>',
  '<p>Fish &amp; chips &lt; 5 -- the last words</p>',
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = (parts) => parts.map((p) => (typeof p === 'string' ? esc(p)
  : `<sup${ p.className ? ` class="${ p.className }"` : '' }>${ esc(p.sup) }</sup>`)).join('');
const textCases = () => [
  ...TEXTS.map((text) => ({ text, html: html(typesetParts(text)) })),
  ...WIDOWS.map((text) => ({ text, widow: true, html: html(typesetParts(text, { widow: true })) })),
];

async function markupCases() {
  const { build } = await import('esbuild');
  // Playwright isn't a dependency: the one on this machine (NODE_PATH, or a global install), only to write the cases.
  const { chromium } = createRequire(import.meta.url)('playwright');
  const bundle = await build({ entryPoints: [ join(ROOT, 'core/typeset.js') ], bundle: true, write: false, format: 'iife', globalName: 'T' });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  const out = await page.evaluate((list) => list.map((markup) => {
    const el = document.createElement('div');
    el.innerHTML = markup;
    if (el.innerHTML !== markup) throw new Error(`write it as a browser does: ${ el.innerHTML }`);
    T.typesetElement(el);
    return { markup, html: el.innerHTML.replace(/&nbsp;/g, ' ') };
  }), MARKUP);
  await browser.close();
  return out;
}

if (!check) {
  const cases = { text: textCases(), markup: await markupCases() };
  writeFileSync(FILE, `${ JSON.stringify(cases, null, 2) }\n`);
  console.log(`wrote markup/typeset.json: ${ cases.text.length } text cases, ${ cases.markup.length } markup cases`);
  process.exit(0);
}

const saved = JSON.parse(readFileSync(FILE, 'utf8'));
let failed = 0;
if (JSON.stringify(saved.text) !== JSON.stringify(textCases()) || saved.markup.map((c) => c.markup).join() !== MARKUP.join()) {
  console.log('FAIL typeset: markup/typeset.json is out of date with core/typeset.js or the cases (npm run typeset)');
  failed++;
} else console.log(`ok   typeset js: ${ saved.text.length } text cases match core/typeset.js`);

const PORTS = [ [ 'php', 'php', [ join(ROOT, 'server/typeset.php'), '--cases', FILE ] ], [ 'python', 'python3', [ '-I', join(ROOT, 'server/typeset.py'), '--cases', FILE ] ] ];
for (const [ name, bin, args ] of PORTS) {
  const run = spawnSync(bin, args, { encoding: 'utf8' });
  if (run.error?.code === 'ENOENT') { console.log(`skip typeset ${ name }: no ${ bin } here`); continue; }
  if (run.status) { console.log(run.stdout + run.stderr); failed++; continue; }
  console.log(run.stdout.trim());
}
process.exit(failed ? 1 : 0);
