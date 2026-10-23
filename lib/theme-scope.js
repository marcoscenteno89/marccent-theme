import { Color } from '@marccent/util/class';
/*
 * Section theming: a theme editor with an element's id as its scope (data-scope, components/theme/editor.js and
 * mini-editor.js) changes that element only; <html id="site"> is the whole site's. Plain JS; ScopeThemes
 * (components/theme/core.js) is the thin React part.
 *
 * An element's overrides are saved under the page's path and its id ("/about#now", Theme.scopes) and put on it the
 * way the site's are put on <html>: the theme colors and their shades, the text on them, data-theme and data-design,
 * so the page colors in defaults.css (text, surfaces, borders, links) are worked out again inside it. Only existing
 * variables; no CSS of its own. Whatever it changes on an element it remembers, and puts back on reset.
 */

// The brand colors' -lighter / -darker shades (fills, gradients, links, hovers): 2 of up to 5 steps lighter / darker.
// Very light or dark colors have fewer steps (util 2.0 skips repeats; #fff has no lighter ones), so fall back to the
// last step, then the color itself. SHADES off: every shade is the original color (trying it out; settings.css pins
// the same for the first paint). The theme writes them on :root (components/theme/core.js), and a themed section
// again, to follow its own colors.
const SHADES = false;
const shade = (color, side) => (SHADES ? color[side]?.[1] ?? color[side]?.at(-1) ?? color : color).hex;

// Text on a fill of the brand colors (.bg-primary, .bg-secondary, .bg-gradient, .btn.gradient): dark on a light fill,
// light on a dark one, by perceived brightness (Color's HSP, 0-255; the gradient: the mean of its two ends). Plain
// objects too (a theme read back from storage has no methods), so getHSP is called off the class. Written beside the
// colors wherever they are: the theme on :root, a themed section, a landing page.
const LIGHT_FROM = 127.5;
const onColor = (...colors) =>
  colors.reduce((sum, c) => sum + Color.prototype.getHSP(c.rgb), 0) / colors.length > LIGHT_FROM ? 'var(--dark)' : 'var(--light)';
const textVars = (primary, secondary) => ({
  '--primary-text': onColor(primary),
  '--secondary-text': onColor(secondary),
  '--gradient-text': onColor(primary, secondary),
});
const paletteVars = (p) => ({
  '--primary': p.primary.hex,
  '--primary-lighter': shade(p.primary, 'lighter'),
  '--primary-darker': shade(p.primary, 'darker'),
  '--secondary': p.secondary.hex,
  '--secondary-lighter': shade(p.secondary, 'lighter'),
  '--secondary-darker': shade(p.secondary, 'darker'),
  '--gradient': 'linear-gradient(to right, var(--primary), var(--secondary))',
  '--gradient-lighter': 'linear-gradient(to right, var(--primary-lighter), var(--secondary-lighter))',
  '--gradient-darker': 'linear-gradient(to right, var(--primary-darker), var(--secondary-darker))',
  ...textVars(p.primary, p.secondary),
});

// What we changed on each element, to put it back: { style: { prop: oldValue }, attrs: { name: oldValue|null }, glass }.
const saved = new WeakMap();
const remember = (el) => saved.get(el) ?? (saved.set(el, { style: {}, attrs: {}, glass: false }), saved.get(el));
const setStyle = (el, prop, value) => {
  const s = remember(el);
  if (!(prop in s.style)) s.style[prop] = el.style.getPropertyValue(prop);
  el.style.setProperty(prop, value);
};
const setAttr = (el, name, value) => {
  const s = remember(el);
  if (!(name in s.attrs)) s.attrs[name] = el.getAttribute(name);
  el.setAttribute(name, value);
};
const restore = (el) => {
  const s = saved.get(el);
  if (!s) return;
  for (const [ prop, v ] of Object.entries(s.style)) v ? el.style.setProperty(prop, v) : el.style.removeProperty(prop);
  for (const [ name, v ] of Object.entries(s.attrs)) v == null ? el.removeAttribute(name) : el.setAttribute(name, v);
  if (s.glass) el.classList.remove('glass');
  saved.delete(el);
};

// The section's background shows the page color when it has none of its own (a Box, a plain wrap), so a mode switch
// changes the whole band, not just the text on it.
const transparent = (el) => {
  const cs = getComputedStyle(el);
  return cs.backgroundImage === 'none' && /rgba?\(.*,\s*0\)$|transparent/.test(cs.backgroundColor);
};

// What a themed element looks like now, so a pass that would change nothing changes nothing (re-applying would restart
// its canvases, whose new elements would set off the page watcher again); and every element themed, to put back the
// ones that were reset or left the page.
const applied = new WeakMap();
const themed = new Set();
const unTheme = (el) => {
  el.querySelectorAll('[data-canvas]').forEach(restore);
  restore(el);
  applied.delete(el);
  themed.delete(el);
};

/**
 * applyScopes: puts the overrides of this page's elements on them (by id), and takes away those that were reset.
 * @param {Object} theme - The Theme (lib/singleton.js). @param {string} path - The page's path (ThemeContext's path).
 */
const applyScopes = (theme, path) => {
  if (!theme) return;
  const targets = new Map();
  for (const [ key, o ] of Object.entries(theme.scopes ?? {})) {
    if (!key.startsWith(`${path}#`) || !o || !Object.keys(o).length) continue;
    const el = document.getElementById(key.slice(path.length + 1));
    if (el && el !== document.documentElement) targets.set(el, o);
  }
  for (const el of themed) if (!targets.has(el)) unTheme(el);
  targets.forEach((o, el) => {
    const palette = theme.palettes[o.palette ?? theme.palette] ?? theme.palettes[theme.palette];
    const sig = JSON.stringify([ o, palette?.primary.hex, palette?.secondary.hex, theme.isDark, theme.glass ]);
    if (applied.get(el) === sig) {
      // Unchanged; only canvases added since (a client render) still need the section's colors.
      if (o?.palette != null) el.querySelectorAll('[data-canvas]:not([data-canvas-colors])').forEach(c =>
        setAttr(c, 'data-canvas-colors', `${palette.primary.hex}, ${palette.secondary.hex}`));
      return;
    }
    unTheme(el);
    applied.set(el, sig);
    themed.add(el);

    const bare = transparent(el);
    for (const [ prop, v ] of Object.entries(paletteVars(palette))) setStyle(el, prop, v);
    setAttr(el, 'data-theme', (o.isDark ?? theme.isDark) ? 'dark' : 'light');
    // Its own design style (styles/designs.css: each style stops where another one starts).
    if (o.design) setAttr(el, 'data-design', o.design);
    setStyle(el, 'color', 'var(--body-color)');
    if (bare) setStyle(el, 'background-color', 'var(--body-bg)');
    // Glass: on adds .glass (colors.css: its .bg panels turn frosted); off while the site has it makes them solid.
    const glass = o.glass ?? theme.glass;
    if (glass && !el.classList.contains('glass')) { el.classList.add('glass'); remember(el).glass = true; }
    if (!glass && theme.glass) { setStyle(el, '--glass-opacity', '1'); setStyle(el, '--glass-blur', '0px'); }
    // Canvas animations draw in the theme colors unless told otherwise: tell them the section's (canvas-scanner.js).
    if (o.palette != null) el.querySelectorAll('[data-canvas]:not([data-canvas-colors])').forEach(c =>
      setAttr(c, 'data-canvas-colors', `${palette.primary.hex}, ${palette.secondary.hex}`));
  });
};

export { applyScopes, paletteVars, shade, textVars };
