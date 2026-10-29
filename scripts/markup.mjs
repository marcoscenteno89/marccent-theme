/*
 * npm run markup: markup/reference.json, each case of markup/cases.json with the HTML its component renders (README
 * there). npm test (--check): fails when reference.json isn't what the components render now.
 */
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REFERENCE = join(ROOT, 'markup/reference.json');

// The components in one module (React from node_modules), their stylesheets left out.
const entry = `
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from './components/ui/button';
import { Icon } from './components/ui/icon';
export { createElement, renderToStaticMarkup, Button, Icon };
`;
const { outputFiles } = await build({
  absWorkingDir: ROOT,
  stdin: { contents: entry, resolveDir: ROOT, loader: 'js' },
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  external: [ 'react', 'react/*', 'react-dom', 'react-dom/*' ],
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'warning',
});
mkdirSync(join(ROOT, 'node_modules/.cache'), { recursive: true });
const out = join(ROOT, 'node_modules/.cache/marccent-markup.mjs');
writeFileSync(out, outputFiles[0].text);
const { createElement: h, renderToStaticMarkup, Button, Icon } = await import(pathToFileURL(out).href);

// Each component's fields (cases.json) as its props.
const RENDER = {
  button: (f) => h(Button, {
    href: f.href,
    icon: f.icon || false,
    trace: f.trace,
    className: f.classes || undefined,
    ...(f.newTab && { target: '_blank', rel: 'noopener noreferrer' }),
  }, f.label),
  icon: (f) => h(Icon, { name: f.name, family: f.family, className: f.classes || undefined }),
};

const cases = JSON.parse(readFileSync(join(ROOT, 'markup/cases.json'), 'utf8'));
const reference = Object.fromEntries(Object.entries(cases).map(([ name, list ]) => [
  name,
  list.map((c) => ({ ...c, html: renderToStaticMarkup(RENDER[name](c.fields)) })),
]));
const json = `${JSON.stringify(reference, null, 2)}\n`;

if (process.argv.includes('--check')) {
  if (readFileSync(REFERENCE, 'utf8') !== json) {
    console.error('markup/reference.json is out of date with the components: run npm run markup and commit it.');
    process.exit(1);
  }
  console.log('markup/reference.json matches the components.');
} else {
  writeFileSync(REFERENCE, json);
  console.log('Wrote markup/reference.json.');
}
