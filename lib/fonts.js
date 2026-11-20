/*
 * Fonts (PRODUCT-LINE.md 5.8): the registry (markup/fonts.json, as lib/fonts.gen.js), the four roles and loading only
 * what a page uses. A design style pairs fonts (DESIGN_FONTS); a site may give any role a registry font of its own
 * (the site settings' fonts: body, heading, display, mono). Each font is one small stylesheet, dist/fonts/<id>.css
 * (latin, woff2), linked once; a server links the page's own in <head> so nothing shifts, and the engine links more
 * when the design style or a role changes. Plain JS, no state but the links it adds.
 */
import { FONTS, DESIGN_FONTS } from './fonts.gen.js';

const ROLES = [ 'body', 'heading', 'display', 'mono' ];

/** A registry font as a CSS stack: its family, then its category's fallbacks. */
const fontStack = (id) => {
  const f = FONTS[id];
  return f ? `"${f.family}", ${f.fallback}` : undefined;
};

/** The CSS variables a site's roles set (--font-body, --font-heading…): only those it chose, from the registry. */
const fontVars = (roles = {}) => Object.fromEntries(ROLES.filter((r) => FONTS[roles[r]]).map((r) => [ `--font-${r}`, fontStack(roles[r]) ]));

/** The fonts a page needs: its design style's and its roles'. */
const fontsFor = (design, roles = {}) => [ ...new Set([ ...(DESIGN_FONTS[design] ?? []), ...ROLES.map((r) => roles[r]).filter((id) => FONTS[id]) ]) ];

/**
 * loadFonts: links dist/fonts/<id>.css for each font not linked yet (by the server or before).
 * @param {string[]} ids @param {string} [base] - Where dist/fonts is: window.marccentFontsBase, which dist/marccent.js
 *   and the WordPress plugin set.
 */
const loadFonts = (ids, base = globalThis.marccentFontsBase) => {
  if (typeof document === 'undefined' || !base) return;
  for (const id of ids) {
    if (!FONTS[id] || document.querySelector(`link[data-font="${id}"]`)) continue;
    const link = Object.assign(document.createElement('link'), { rel: 'stylesheet', href: new URL(`${id}.css`, base).href });
    link.dataset.font = id;
    document.head.append(link);
  }
};

export { FONTS, DESIGN_FONTS, ROLES, fontStack, fontVars, fontsFor, loadFonts };
