/*
 * The site's colors from its settings (markup/site-settings.json), worked out once, here: the CSS variables a theme
 * paints on <html> (its palette, the text on each fill, dark and light, its own variables) and the contrast checks an
 * admin warns with. Plain JS on hex strings, no state. Its PHP twin is server/palette.php, checked against it by
 * npm test (scripts/palette.mjs); an admin (marccent-wp's theme options) and a server (Marccent Blocks) use these,
 * never a copy of the math (PRODUCT-LINE.md 5.7). The live theme engine works the same out from its color objects
 * (lib/theme-scope.js, onColor).
 */

const rgb = (hex) => {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = [ ...h ].map((c) => c + c).join('');
  return [ 0, 2, 4 ].map((i) => parseInt(h.slice(i, i + 2), 16));
};

/** WCAG relative luminance of a #rgb or #rrggbb color. */
const luminance = (hex) => {
  const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [ r, g, b ] = rgb(hex).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** The WCAG contrast ratio of two colors, 1 to 21. */
const contrast = (a, b) => {
  const [ hi, lo ] = [ luminance(a), luminance(b) ].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** The text on a fill of these colors: var(--dark) when dark text contrasts more than light with every one of them. */
const textOn = (...colors) => {
  const worst = (fn) => Math.min(...colors.map((c) => fn(luminance(c))));
  return worst((l) => (l + 0.05) / 0.05) >= worst((l) => 1.05 / (l + 0.05)) ? 'var(--dark)' : 'var(--light)';
};

/** The theme in effect: the package's defaults (lib/theme.defaults.json) with the site's on top; its palettes first. */
const effectiveTheme = (site = {}, defaults = {}) => {
  const own = site.palettes || [];
  return {
    ...defaults,
    ...site,
    vars: { ...defaults.vars, ...site.vars },
    palettes: [ ...own, ...(defaults.palettes || []).filter((p) => !own.some((o) => o.id === p.id)) ],
  };
};

/** The palette a theme picks, else its first. */
const paletteOf = (theme) => (theme.palettes || []).find((p) => p.id === theme.palette) || (theme.palettes || [])[0];

/**
 * The CSS variables a theme paints on <html>: its palette's colors (their shades the colors themselves, as
 * lib/theme-scope.js's SHADES off), the gradients, the text on each fill, dark and light, then its own variables.
 * @param {Object} theme - An effective theme (effectiveTheme).
 * @returns {Object<string, string>}
 */
const themeVars = (theme) => {
  const p = paletteOf(theme);
  const vars = {};
  if (p) {
    Object.assign(vars, {
      '--primary': p.primary, '--primary-lighter': p.primary, '--primary-darker': p.primary,
      '--secondary': p.secondary, '--secondary-lighter': p.secondary, '--secondary-darker': p.secondary,
      '--gradient': 'linear-gradient(to right, var(--primary), var(--secondary))',
      '--gradient-lighter': 'linear-gradient(to right, var(--primary-lighter), var(--secondary-lighter))',
      '--gradient-darker': 'linear-gradient(to right, var(--primary-darker), var(--secondary-darker))',
      '--primary-text': textOn(p.primary), '--secondary-text': textOn(p.secondary), '--gradient-text': textOn(p.primary, p.secondary),
    });
    for (const name of [ 'primary', 'secondary' ]) {
      for (const side of [ 'lighter', 'darker' ]) vars[`--${name}-${side}-text`] = vars[`--${name}-text`];
    }
  }
  for (const mode of [ 'dark', 'light' ]) if (theme[mode]) vars[`--${mode}`] = theme[mode];
  return { ...vars, ...theme.vars };
};

/**
 * The pairs that read under WCAG AA (4.5:1): the text on each brand color, and the primary color on the page.
 * @returns {{ what: string, ratio: number }[]} Only the failing ones.
 */
const contrastChecks = (theme) => {
  const p = paletteOf(theme);
  if (!p) return [];
  const text = (c) => (textOn(c) === 'var(--dark)' ? theme.dark : theme.light);
  const page = theme.isDark ? theme.dark : theme.light;
  return [
    [ 'Text on the primary color', p.primary, text(p.primary) ],
    [ 'Text on the secondary color', p.secondary, text(p.secondary) ],
    [ 'The primary color on the page (links, outlines)', p.primary, page ],
  ].map(([ what, a, b ]) => ({ what, ratio: contrast(a, b) })).filter(({ ratio }) => ratio < 4.5);
};

export { luminance, contrast, textOn, effectiveTheme, paletteOf, themeVars, contrastChecks };
