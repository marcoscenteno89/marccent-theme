/*
 * npm run cases: the cases page, to see every component's cases in a browser as the markup check runs them. Each
 * case's markup (markup/reference.json) live on the page, with the theme's CSS and plain-JS engine (dist/), beside each
 * adapter's markup for it (run fresh: npm run conformance --save), marked same or different the way the check compares
 * them. Then it serves the theme folder and prints the address; run it again after a change and reload.
 *
 *   npm run cases [-- --port 4321] [-- --no-adapters]
 */
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const port = Number(args.includes('--port') ? args[args.indexOf('--port') + 1] : 4321);
const SAVED = join(ROOT, 'node_modules/.cache/adapters');

// The adapters' markup, fresh (and whether each case matches, from the check's own comparison).
let report = '';
if (!args.includes('--no-adapters')) {
  const run = spawnSync('node', [ 'scripts/conformance.mjs', '--save', SAVED ], { cwd: ROOT, encoding: 'utf8' });
  report = run.stdout;
}
const adapters = existsSync(SAVED) ? readdirSync(SAVED).filter((f) => f.endsWith('.json')).map((f) => [ f.replace(/\.json$/, ''), JSON.parse(readFileSync(join(SAVED, f), 'utf8')) ]) : [];
const differs = new Set([ ...report.matchAll(/^FAIL (\S+ \S+) (\S+): (.+)$/gm) ].map(([ , a, c, n ]) => `${a.replace(/\W+/g, '-')}|${c}|${n}`));

const reference = JSON.parse(readFileSync(join(ROOT, 'markup/reference.json'), 'utf8'));
const settings = JSON.parse(readFileSync(join(ROOT, 'markup/settings.json'), 'utf8'));
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const title = (key) => Object.keys(settings).find((n) => n.toLowerCase() === key.toLowerCase()) ?? key;

const sections = Object.entries(reference).map(([ key, cases ]) => `
  <section id="${key}" class="grid cols-1 gap pad-y border-top">
    <h2>${esc(title(key))} <small class="opacity-75 fs-sm">${esc(settings[title(key)]?.kind ?? '')}</small></h2>
    ${cases.map((c) => `
    <article class="grid cols-1 gap-sm">
      <h3 class="h6">${esc(c.case)}</h3>
      <div class="grid gap" style="--cols:${1 + adapters.length};--min:18rem">
        <div class="grid cols-1 gap-sm content-start"><small class="text-muted">theme (reference)</small><div class="bg border round pad">${c.html}</div></div>
        ${adapters.map(([ name, out ]) => {
          const html = out[key]?.[c.case];
          const state = html === undefined ? 'not covered' : differs.has(`${name}|${key}|${c.case}`) ? 'different' : 'same';
          return `<div class="grid cols-1 gap-sm content-start"><small class="${state === 'same' ? 'text-success' : state === 'different' ? 'text-danger' : 'text-muted'}">${esc(name)}: ${state}</small>${html === undefined ? '' : `<div class="bg border round pad">${html}</div>`}</div>`;
        }).join('')}
      </div>
      <details><summary class="fs-sm">Fields and markup</summary><pre class="fs-xs font-mono pad-sm bg border round overflow-auto">${esc(JSON.stringify(c.fields, null, 2))}\n\n${esc(c.html)}</pre></details>
    </article>`).join('')}
  </section>`).join('');

writeFileSync(join(ROOT, 'node_modules/.cache/cases.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Marccent cases</title><link rel="stylesheet" href="/dist/marccent.css"></head>
<body class="bg"><main class="wrap pad-y-lg grid cols-1 gap">
  <h1>Marccent cases</h1>
  <p>Every component's markup cases (markup/reference.json), live${adapters.length ? `, beside ${adapters.map(([ n ]) => n).join(', ')}` : ''}. ${Object.values(reference).flat().length} cases.</p>
  <nav class="row-wrap gap-sm fs-sm">${Object.keys(reference).map((k) => `<a href="#${k}">${esc(title(k))}</a>`).join(' ')}</nav>
  ${sections}
</main><script type="module" src="/dist/marccent.js"></script></body></html>`);

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const file = path === '/' ? join(ROOT, 'node_modules/.cache/cases.html') : normalize(join(ROOT, path));
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
}).listen(port, () => console.log(`The cases page: http://localhost:${port}/ (Ctrl+C to stop)`));
