/*
 * The site's colors, one set of rules (PRODUCT-LINE.md 5.7): lib/palette.js's themeVars against its PHP twin
 * (server/palette.php) for every default palette, light and dark, with a site's own palette and variables on top.
 * Skipped without php (as the typeset check is). Part of npm test.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { effectiveTheme, themeVars } from '../lib/palette.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const defaults = JSON.parse(readFileSync(join(ROOT, 'lib/theme.defaults.json'), 'utf8'));

const cases = [
  ...defaults.palettes.flatMap((p) => [ true, false ].map((isDark) => ({ site: { palette: p.id, isDark }, defaults }))),
  { site: { palettes: [ { id: 'own', primary: '#ffeb3b', secondary: '#111' } ], palette: 'own', dark: '#0b0b0b', vars: { '--radius': '0.25rem' } }, defaults },
];
const js = cases.map((c) => themeVars(effectiveTheme(c.site, c.defaults)));

if (spawnSync('php', [ '-v' ]).status !== 0) {
  console.log(`ok   palette js: ${cases.length} themes (themeVars)`);
  console.log('skip palette php: no php here');
} else {
  const file = join(mkdtempSync(join(tmpdir(), 'palette-')), 'cases.json');
  writeFileSync(file, JSON.stringify(cases));
  const php = JSON.parse(execFileSync('php', [ join(ROOT, 'server/palette.php'), '--cases', file ], { encoding: 'utf8' }));
  const differ = cases.map((c, i) => i).filter((i) => !isDeepStrictEqual(js[i], php[i]));
  for (const i of differ) console.log(`FAIL palette php: case ${i} (${JSON.stringify(cases[i].site)}) differs from lib/palette.js`);
  console.log(`${differ.length ? 'FAIL' : 'ok  '} palette php: ${cases.length - differ.length} of ${cases.length} themes as lib/palette.js paints them`);
  if (differ.length) process.exit(1);
}
