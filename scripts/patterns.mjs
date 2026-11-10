/*
 * Patterns (docs/PATTERNS.md, their markup in patterns/*.html): a pattern has nothing of its own, so every class its
 * markup uses must be one the theme's stylesheets define (styles/), and every data-component one the engine or a
 * component writes. Fails on one that isn't, so a pattern can't lean on CSS nobody ships. Font Awesome's classes (fa-*)
 * are the icon font's; a class only for a site's own script is listed in OWN with why.
 *
 *   node scripts/patterns.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (dir, ext) => readdirSync(join(ROOT, dir), { recursive: true }).filter((f) => f.endsWith(ext)).map((f) => readFileSync(join(ROOT, dir, f), 'utf8'));
const css = read('styles', '.css').join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
const code = [ ...read('core', '.js'), ...read('components', '.js') ].join('\n');
const OWN = {};

let failed = 0;
const files = readdirSync(join(ROOT, 'patterns')).filter((f) => f.endsWith('.html')).sort();
for (const file of files) {
  const html = readFileSync(join(ROOT, 'patterns', file), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const classes = new Set([ ...html.matchAll(/class="([^"]*)"/g) ].flatMap((m) => m[1].split(/\s+/)).filter((c) => c && c !== '…'));
  const missing = [ ...classes ].filter((c) => !c.startsWith('fa-') && !OWN[c] && !new RegExp(`\\.${c.replace(/[^\w-]/g, '\\$&')}(?![\\w-])`).test(css));
  const kinds = [ ...html.matchAll(/data-component="([^"]*)"/g) ].map((m) => m[1]);
  const unknown = kinds.filter((k) => !code.includes(`'${k}'`) && !code.includes(`"${k}"`));
  for (const c of missing) console.log(`FAIL patterns/${file}: .${c} isn't defined in styles/`);
  for (const k of unknown) console.log(`FAIL patterns/${file}: data-component="${k}" isn't one the engine or a component writes`);
  failed += missing.length + unknown.length;
  if (!missing.length && !unknown.length) console.log(`ok   patterns/${file}: ${classes.size} classes, ${kinds.length} components`);
}
process.exit(failed ? 1 : 0);
