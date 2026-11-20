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
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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

/*
 * dist/fonts/<id>.css: each registry font (markup/fonts.json) on its own, latin only and woff2 only (the package's
 * @font-face rules for the latin subset, its files beside it), so a page loads just the fonts it uses
 * (PRODUCT-LINE.md 5.8). Before: every style's fonts in every subset and both formats, 259 files.
 */
const FONTS = JSON.parse(readFileSync(join(ROOT, 'markup/fonts.json'), 'utf8')).fonts;
const fontFiles = new Set();
mkdirSync(join(DIST, 'fonts'), { recursive: true });
for (const [ id, font ] of Object.entries(FONTS)) {
  const pkg = join(ROOT, 'node_modules', font.package);
  const sheets = font.variable
    ? [ 'wght.css', ...(font.italic ? [ 'wght-italic.css' ] : []) ]
    : font.weights.flatMap((w) => [ `${w}.css`, ...(font.italic ? [ `${w}-italic.css` ] : []) ]);
  const faces = [];
  for (const sheet of sheets) {
    let css;
    try { css = readFileSync(join(pkg, sheet), 'utf8'); } catch { continue; }
    for (const face of css.match(/@font-face\s*{[^}]*}/g) ?? []) {
      const file = face.match(/url\(\.\/files\/([^)]+?\.woff2)\)/)?.[1];
      if (!file || !/-latin-(?!ext)/.test(file)) continue;
      fontFiles.add(file);
      writeFileSync(join(DIST, 'fonts', file), readFileSync(join(pkg, 'files', file)));
      faces.push(face.replace(/src:[^;]*;/, `src: url(${file}) format('${font.variable ? 'woff2-variations' : 'woff2'}');`));
    }
  }
  writeFileSync(join(DIST, 'fonts', `${id}.css`), `/* ${font.name} (${font.package}): latin, woff2. marccent-theme ${version} */\n${faces.join('\n')}\n`);
}

writeFileSync(join(DIST, 'manifest.json'), `${JSON.stringify({
  version,
  css: 'marccent.css',
  js: 'marccent.js',
  designs: Object.fromEntries(designs.map((id) => [ id, `designs/${id}.css` ])),
  allDesigns: 'designs.css',
  fonts: Object.fromEntries(Object.keys(FONTS).map((id) => [ id, `fonts/${id}.css` ])),
}, null, 2)}\n`);

console.log(`dist/ built: marccent-theme ${version}, ${designs.length} design styles, ${Object.keys(FONTS).length} fonts (${fontFiles.size} files)`);
