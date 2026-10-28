import { DEFAULT_DESIGN } from '../lib/design';
import defaults from '../lib/defaults';
import { applyScopes, paletteVars } from '../lib/theme-scope';

/**
 * applySiteTheme: puts the saved theme on <html>: the COLORS in styles/defaults.css (the only ones meant to be
 * changed at runtime) from the same Color shades the canvas animations use, the mode (data-theme), glass (.glass),
 * the design style (data-design; a server can render the default), the default hover (data-hover) and, with the
 * default design only, the defaults' vars (lib/theme.defaults.json). Call it whenever the theme changes.
 * @param {Object} theme - The Theme (lib/singleton.js).
 */
const applySiteTheme = (theme) => {
  const html = document.documentElement;
  const colors = paletteVars({ primary: theme.primary(), secondary: theme.secondary() });
  for (const [ prop, v ] of Object.entries(colors)) {
    html.style.setProperty(prop, v);
  }
  if (theme.dark) {
    html.style.setProperty('--dark', theme.dark.hex);
  }
  if (theme.light) {
    html.style.setProperty('--light', theme.light.hex);
  }
  html.dataset.theme = theme.isDark ? 'dark' : 'light';
  html.classList.toggle('glass', !!theme.glass);
  html.dataset.design = theme.design ?? DEFAULT_DESIGN;
  if (theme.hover) {
    html.dataset.hover = theme.hover;
  } else {
    delete html.dataset.hover;
  }
  // The defaults' vars only go with the default design: pick another and they drop away.
  const own = html.dataset.design === DEFAULT_DESIGN;
  for (const [ prop, v ] of Object.entries(defaults.vars ?? {})) {
    if (own) {
      html.style.setProperty(prop, v);
    } else {
      html.style.removeProperty(prop);
    }
  }
};

/**
 * watchScopes: applies the elements' overrides on this page (path), now and whenever the page's content changes (a
 * client render that streams in). Call it again when the theme changes. Returns a function that stops watching.
 * @param {Object} theme - The Theme. @param {string} path - The page's path.
 * @returns {() => void}
 */
const watchScopes = (theme, path) => {
  applyScopes(theme, path);
  const main = document.querySelector('main');
  if (!main) {
    return () => {};
  }
  let frame;
  const mo = new MutationObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => applyScopes(theme, path));
  });
  mo.observe(main, { childList: true, subtree: true });
  return () => {
    mo.disconnect();
    cancelAnimationFrame(frame);
  };
};

export { applySiteTheme, watchScopes };
