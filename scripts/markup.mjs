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
import { Menu } from './components/ui/menu';
import { ToggleButton } from './components/ui/toggle-button';
import { Modal, Drawer } from './components/ui/modal';
import { Accordion, AccordionItem } from './components/ui/accordion';
import { Tooltip, Popover } from './components/ui/popover';
import { Alert } from './components/ui/alert';
import { MapView } from './components/widgets/map';
import { Blur } from './components/ui/blur';
import { Board } from './components/ui/board';
import { Grid as BoardGrid } from './lib/grid_helper';
import { Carousel } from './components/widgets/carousel';
import { Clock } from './components/ui/clock';
import { Code } from './components/ui/code';
import { CodeTabs } from './components/ui/code-tabs';
import { Compare } from './components/ui/compare';
import { Counter } from './components/ui/counter';
import { DataTable } from './components/ui/data-table';
import { Divider } from './components/widgets/divider';
import { Dock, DockItem, RadialMenu, RadialMenuItem, StepBar, StepBarStep, TabBar, Tab } from './components/widgets/nav';
import { ExpandButton } from './components/ui/expand-button';
import { Field } from './components/ui/field';
import { FileDrop } from './components/ui/file-drop';
import { Form, StepForm, Step } from './components/ui/form';
import { Goo } from './components/ui/goo';
import { HexFlip, HexGrid, StatCard, Timeline, TimelineItem } from './components/widgets/layout';
import { LinkPreview } from './components/ui/popover';
import { Loading } from './components/ui/loading';
import { MiniThemeEditor } from './components/theme/mini-editor';
import { ThemeEditor } from './components/theme/editor';
import { ThemeProvider } from './lib/context';
import { Orbit, OrbitItem, Countdown, Parallax } from './components/visuals/effects';
import { Pagination } from './components/ui/pagination';
import { Price } from './components/ui/price';
import { Rating, Stars } from './components/ui/rating';
import { Scenery } from './components/visuals/scenery';
import { TagInput } from './components/ui/tag-input';
import { Trace } from './components/ui/trace';
import { Typeset } from './components/ui/typeset';
export { createElement, renderToStaticMarkup, Button, Icon, Section, Grid, Card, Menu, ToggleButton, Modal, Drawer, Accordion,
  AccordionItem, Tooltip, Popover, Alert, MapView,
  Blur, Board, BoardGrid, Carousel, Clock, Code, CodeTabs, Compare, Counter, DataTable, Divider, Dock, DockItem, RadialMenu, RadialMenuItem, StepBar, StepBarStep, TabBar, Tab, ExpandButton, Field, FileDrop, Form, StepForm, Step, Goo, HexFlip, HexGrid, StatCard, Timeline, TimelineItem, LinkPreview, Loading, MiniThemeEditor, ThemeEditor, ThemeProvider, Orbit, OrbitItem, Countdown, Parallax, Pagination, Price, Rating, Stars, Scenery, TagInput, Trace, Typeset };
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
  createElement: h, renderToStaticMarkup, Button, Icon, Section, Grid, Card, Menu, ToggleButton, Modal, Drawer, Accordion,
  AccordionItem, Tooltip, Popover, Alert, MapView,
  Blur, Board, BoardGrid, Carousel, Clock, Code, CodeTabs, Compare, Counter, DataTable, Divider, Dock, DockItem, RadialMenu, RadialMenuItem, StepBar, StepBarStep, TabBar, Tab, ExpandButton, Field, FileDrop, Form, StepForm, Step, Goo, HexFlip, HexGrid, StatCard, Timeline, TimelineItem, LinkPreview, Loading, MiniThemeEditor, ThemeEditor, ThemeProvider, Orbit, OrbitItem, Countdown, Parallax, Pagination, Price, Rating, Stars, Scenery, TagInput, Trace, Typeset,
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
    as: f.tag, width: f.width, verticalPadding: f.verticalPadding, gap: f.gap, surface: f.surface, mode: f.mode, center: f.center,
    minimumHeight: f.minimumHeight, image: f.image, imageAlt: f.imageAlt, shade: f.shade, className: f.classes || undefined,
  }, html(f.content)),
  grid: (f) => h(Grid, {
    layout: f.layout, columns: f.columns, minimumColumnWidth: f.minimumColumnWidth, gap: f.gap, alignItems: f.alignItems, center: f.center, dense: f.dense, minimumRowHeight: f.minimumRowHeight || undefined,
    className: f.classes || undefined,
  }, html(f.content)),
  card: (f) => h(Card, {
    surface: f.surface, round: f.round, padding: f.padding, gap: f.gap, hover: f.hover, center: f.center, variant: f.variant || undefined,
    className: f.classes || undefined,
  }, html(f.content)),
  menu: (f) => h(Menu, { items: f.items, label: f.label, layout: f.layout || undefined, iconOnly: f.iconOnly, fold: f.fold }),
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
  map: (f) => h(MapView, { apiKey: f.key || undefined, center: { lat: f.latitude, lng: f.longitude }, zoom: f.zoom,
    marker: f.marker ? { title: f.title, link: f.link || undefined } : undefined, title: f.title, embed: f.embed || undefined,
    markers: f.markers, cluster: f.cluster }),
  // The canvas animation element: no React component, the attributes are the contract (visuals/canvas-scanner.js).
  animation: (f) => h('div', { 'data-component': 'animation', 'data-name': f.name, 'data-frame-rate': f.frameRate, 'data-colors': f.colors || undefined,
    className: f.classes || undefined }),
  blur: (f) => h(Blur, { id: f.id }),
  board: (f) => h(Board, { grid: new BoardGrid(f.rows, f.cols, () => ({})), gap: f.gap },
    (cell, i) => h('button', { key: i, type: 'button', className: 'btn-plain square bg border', 'aria-label': `Cell ${i + 1}` })),
  carousel: (f) => h(Carousel, { slideWidth: f.slideWidth, label: f.label }, f.slides.map((t, i) => h('div', { key: i, className: 'bg border round pad' }, t))),
  clock: (f) => h(Clock, { format: f.format }),
  code: (f) => h(Code, { language: f.language, label: f.label }, f.code),
  codeTabs: (f) => h(CodeTabs, { value: f.value, onChange: () => {}, languages: f.languages }),
  compare: (f) => h(Compare, { before: h('img', { src: f.before, alt: f.beforeAlt }), after: h('img', { src: f.after, alt: f.afterAlt }),
    beforeLabel: f.beforeLabel, afterLabel: f.afterLabel, start: f.start, label: f.label }),
  countdown: (f) => h(Countdown, { from: f.from }),
  counter: (f) => h(Counter, { active: false, controls: f.controls }),
  dataTable: (f) => h(DataTable, { columns: f.columns, rows: f.rows, label: f.label, pageSize: f.pageSize, search: f.search }),
  divider: (f) => h(Divider, { shape: f.shape, edge: f.edge, size: f.size, motion: f.motion || undefined, scroll: f.scroll || undefined, flip: f.flip }),
  dock: (f) => h(Dock, { label: f.label }, f.items.map((item) => h(DockItem, { key: item.label, ...item }))),
  expandButton: (f) => h(ExpandButton, { icon: f.icon, label: f.label }, html(f.content)),
  field: (f) => h(Field, { name: f.name, label: f.label, type: f.type, required: f.required, as: f.as || undefined }),
  fileDrop: (f) => h(FileDrop, { name: f.name, label: f.label, hint: f.hint, accept: f.accept, multiple: f.multiple }),
  form: (f) => h(Form, { onSubmit: () => {}, submitLabel: f.submitLabel }, f.fields.map((x) => h(Field, { key: x.name, ...x }))),
  goo: () => h(Goo),
  hexFlip: (f) => h(HexFlip, { front: f.front, back: f.back, label: f.label }),
  hexGrid: (f) => h(HexGrid, { perRow: f.perRow }, f.cells.map((t, i) => h('div', { key: i, className: 'shape-hexagon bg-gradient col-center' }, t))),
  linkPreview: (f) => h(LinkPreview, { title: f.title, text: f.text, side: f.side }, h('a', { href: f.href }, f.link)),
  loading: (f) => h(Loading, { require: [ null ], kind: f.kind }),
  // The editors under the provider, as on a page: their markup before the theme has loaded (theme: null on the server).
  miniThemeEditor: (f) => h(ThemeProvider, { path: '/' }, h(MiniThemeEditor, { scope: f.scope })),
  themeEditor: (f) => h(ThemeProvider, { path: '/' }, h(ThemeEditor, { scope: f.scope })),
  orbit: (f) => h(Orbit, {}, f.items.map((item) => h(OrbitItem, { key: item.title, ...item }))),
  pagination: (f) => h(Pagination, { total: f.total, pageSize: f.pageSize, current: f.current, update: () => {}, label: f.label }),
  parallax: (f) => h(Parallax, { speed: f.speed }, html(f.content)),
  price: (f) => h(Price, { amount: f.amount, currency: f.currency, per: f.per || undefined, was: f.was || undefined }),
  radialMenu: (f) => h(RadialMenu, { label: f.label }, f.items.map((item) => h(RadialMenuItem, { key: item.label, ...item }))),
  rating: (f) => h(Rating, { name: f.name, label: f.label, maximum: f.maximum, icon: f.icon }),
  stars: (f) => h(Stars, { value: f.value, maximum: f.maximum, icon: f.icon }),
  scenery: (f) => h(Scenery, { layers: f.layers, height: f.height }),
  statCard: (f) => h(StatCard, { icon: f.icon, value: f.value, label: f.label, fill: f.fill, text: f.text }),
  stepBar: (f) => h(StepBar, { start: f.start }, f.steps.map((label) => h(StepBarStep, { key: label, label }))),
  stepForm: (f) => h(StepForm, { onSubmit: () => {} }, f.steps.map((st) => h(Step, { key: st.name, name: st.name }, st.fields.map((x) => h(Field, { key: x.name, ...x }))))),
  tabBar: (f) => h(TabBar, {}, f.tabs.map((t) => h(Tab, { key: t.label, label: t.label, icon: t.icon }, html(t.content)))),
  tagInput: (f) => h(TagInput, { name: f.name, label: f.label, suggestions: f.suggestions, maximum: f.maximum }),
  timeline: (f) => h(Timeline, {}, f.events.map((event) => h(TimelineItem, { key: event.title, ...event }))),
  trace: () => h(Trace),
  typeset: (f) => h(Typeset, { as: f.as }, f.text),
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
