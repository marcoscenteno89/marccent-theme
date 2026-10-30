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
import { Section, Grid, Card } from './components/widgets/section';
import { NavBar } from './components/widgets/navbar';
import { Menu } from './components/ui/menu';
import { ToggleButton } from './components/ui/toggle-button';
import { Modal, Drawer } from './components/ui/modal';
import { Accordion, AccordionItem } from './components/ui/accordion';
import { Tooltip, Popover } from './components/ui/popover';
import { Alert } from './components/ui/alert';
export { createElement, renderToStaticMarkup, Button, Icon, Section, Grid, Card, NavBar, Menu, ToggleButton, Modal, Drawer, Accordion,
  AccordionItem, Tooltip, Popover, Alert };
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
const {
  createElement: h, renderToStaticMarkup, Button, Icon, Section, Grid, Card, NavBar, Menu, ToggleButton, Modal, Drawer, Accordion,
  AccordionItem, Tooltip, Popover, Alert,
} = await import(pathToFileURL(out).href);

// A case's HTML (its content fields) goes in as a token, then in the token's place as it is.
let pieces = [];
const html = (piece) => `marccent-html-${pieces.push(piece) - 1}`;
const TOKENS = /marccent-html-(\d+)/g;
// React's ids (useId), as id-1, id-2… in the order they appear: a host picks its own.
const IDS = /«[^»]+»|_R_[A-Za-z0-9]*_|:R[A-Za-z0-9]*:/g;
const ids = (markup) => {
  const seen = new Map();
  return markup.replace(IDS, (id) => seen.get(id) ?? seen.set(id, `id-${seen.size + 1}`).get(id));
};
// React 19 hoists a preload link for each eager image ahead of the markup: React's, not the component's.
const PRELOADS = /<link rel="preload" as="image"[^>]*>/g;

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
  section: (f) => h(Section, {
    as: f.tag, width: f.width, padY: f.padY, gap: f.gap, surface: f.surface, mode: f.mode, center: f.center,
    minHeight: f.minHeight, image: f.image, imageAlt: f.imageAlt, shade: f.shade, className: f.classes || undefined,
  }, html(f.content)),
  grid: (f) => h(Grid, {
    layout: f.layout, cols: f.cols, min: f.min, gap: f.gap, alignItems: f.alignItems, center: f.center,
    className: f.classes || undefined,
  }, html(f.content)),
  card: (f) => h(Card, {
    surface: f.surface, round: f.round, pad: f.pad, gap: f.gap, hover: f.hover, center: f.center,
    className: f.classes || undefined,
  }, html(f.content)),
  // The brand is the hosts' home link: the logo (when there is one) and the site's name.
  nav: (f) => h(NavBar, {
    brand: h('a', { href: f.brand.href, className: 'menu-link grid auto-cols items-center gap-sm', 'aria-label': `${f.brand.name}, home` },
      f.brand.logo && h('img', { src: f.brand.logo, alt: f.brand.name, style: { height: '2.5rem', width: 'auto' } }),
      h('span', { className: 'fw-bold' }, f.brand.name)),
    items: f.items,
  }),
  menu: (f) => h(Menu, { items: f.items, label: f.label, layout: f.layout || undefined, iconOnly: f.iconOnly }),
  toggleButton: (f) => h(ToggleButton, {
    icon: f.icon, activeIcon: f.activeIcon || undefined, controls: f.controls, defaultOpen: f.open, className: f.classes || undefined,
  }, f.label),
  modal: (f) => h(Modal, { title: f.title, show: false, setShow: () => {}, variant: f.variant || undefined }, html(f.content)),
  drawer: (f) => h(Drawer, { title: f.title, show: false, setShow: () => {}, side: f.side }, html(f.content)),
  accordion: (f) => h(Accordion, { defaultOpen: f.open, multiple: f.multiple },
    f.items.map((item, i) => h(AccordionItem, { key: i, header: item.header }, html(item.content)))),
  // The trigger is a button with this label.
  tooltip: (f) => h(Tooltip, { content: f.content, side: f.side }, h('button', { type: 'button', className: 'btn-link' }, f.trigger)),
  popover: (f) => h(Popover, { label: f.label, side: f.side, content: html(f.content) }, h('button', { type: 'button', className: 'btn' }, f.trigger)),
  alert: (f) => h(Alert, { tone: f.tone }, html(f.content)),
};

const render = (name, fields) => {
  pieces = [];
  const markup = renderToStaticMarkup(RENDER[name](fields)).replace(PRELOADS, '');
  return ids(markup).replace(TOKENS, (_, i) => pieces[i]);
};

const cases = JSON.parse(readFileSync(join(ROOT, 'markup/cases.json'), 'utf8'));
const reference = Object.fromEntries(Object.entries(cases).map(([ name, list ]) => [
  name,
  list.map((c) => ({ ...c, html: render(name, c.fields) })),
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
