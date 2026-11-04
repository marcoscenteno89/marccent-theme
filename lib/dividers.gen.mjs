// Generates markup/dividers.json: every section divider shape (lib/divider-shapes.js) as the markup's layers, with
// their CSS masks, for the Divider component and the hosts that write the markup on the server (Marccent Blocks).
// Usage: npm run dividers
import { writeFileSync } from 'node:fs';
import { SHAPES, mask } from './divider-shapes.js';

const out = Object.fromEntries(Object.entries(SHAPES).map(([ id, s ]) => [ id, {
  title: s.title,
  motions: s.motions ?? [],
  scrolls: s.scrolls ?? [],
  layers: s.layers.map(({ d, opacity, x, y }) => ({ mask: mask(d), opacity, x, y })),
} ]));

writeFileSync(new URL('../markup/dividers.json', import.meta.url), `${JSON.stringify(out, null, 1)}\n`);
