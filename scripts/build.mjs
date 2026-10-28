/*
 * npm run build: dist/, the theme prebuilt for any page (no bundler needed), from the same source a bundler uses:
 *   dist/marccent.css        core.css + every component's stylesheet (styles/bundle.css), Font Awesome included
 *   dist/designs/<id>.css    one design style each, its font with it; dist/designs.css: every one
 *   dist/marccent.js         the plain-JS engine (core/browser.js), an ES module that starts by itself; what only
 *                            some pages need (p5 and the canvas animations, CodeMirror) is split into dist/chunks/
 *   dist/fonts/              the font files the stylesheets point to
 *   dist/manifest.json       the version and the file names, for the host adapters (WordPress, Django)
 */
import { build } from 'esbuild';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const banner = `/* marccent-theme ${version} | https://github.com/marcoscenteno89/marccent-theme */`;

const designs = readdirSync(join(ROOT, 'styles/designs')).filter((f) => f.endsWith('.css')).map((f) => basename(f, '.css')).sort();

rmSync(DIST, { recursive: true, force: true });

await build({
  absWorkingDir: ROOT,
  entryPoints: {
    marccent: 'styles/bundle.css',
    designs: 'styles/designs.css',
    ...Object.fromEntries(designs.map((id) => [ `designs/${id}`, `styles/designs/${id}.css` ])),
  },
  outdir: DIST,
  bundle: true,
  minify: true,
  assetNames: 'fonts/[name]-[hash]',
  loader: { '.woff2': 'file', '.woff': 'file', '.ttf': 'file', '.eot': 'file', '.svg': 'file' },
  banner: { css: banner },
  logLevel: 'warning',
});

await build({
  absWorkingDir: ROOT,
  entryPoints: { marccent: 'core/browser.js' },
  outdir: DIST,
  bundle: true,
  minify: true,
  splitting: true,
  format: 'esm',
  platform: 'browser',
  target: [ 'es2022' ],
  chunkNames: 'chunks/[name]-[hash]',
  define: { 'process.env.NODE_ENV': '"production"' },
  banner: { js: banner },
  logLevel: 'warning',
});

writeFileSync(join(DIST, 'manifest.json'), `${JSON.stringify({
  version,
  css: 'marccent.css',
  js: 'marccent.js',
  designs: Object.fromEntries(designs.map((id) => [ id, `designs/${id}.css` ])),
  allDesigns: 'designs.css',
}, null, 2)}\n`);

console.log(`dist/ built: marccent-theme ${version}, ${designs.length} design styles`);
