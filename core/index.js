/*
 * The theme without React: for plain JS pages (a WordPress theme, server-rendered templates). React uses the same
 * pieces through marccent-theme/react (ThemeProvider and the hooks). The styles load on their own
 * (styles/index.css).
 *
 *   import { startTheme } from 'marccent-theme/core';
 *   const theme = await startTheme();
 *   theme.update({ palette: 'mint' }); // the page follows
 */
import { themeSI, SCOPE_KEYS, SITE } from '../lib/singleton';
import { applySiteTheme, watchScopes } from './apply';

let started = null;

/**
 * startTheme: loads the saved theme (else the defaults), puts it on the page and keeps the page following every
 * change. Once per page; later calls return the same theme.
 * @param {Object} [opts]
 * @param {string} [opts.path] - The page's path: elements' own themes are saved per page. Defaults to location.pathname.
 * @returns {Promise<Object>} The Theme (lib/singleton.js).
 */
const startTheme = ({ path = location.pathname } = {}) => {
  started ??= themeSI().then((theme) => {
    let stopScopes = () => {};
    const apply = () => {
      applySiteTheme(theme);
      stopScopes();
      stopScopes = watchScopes(theme, path);
    };
    apply();
    theme.subscribe(apply);
    return theme;
  });
  return started;
};

export { startTheme, themeSI, SCOPE_KEYS, SITE, applySiteTheme, watchScopes };
export { applyScopes, paletteVars } from '../lib/theme-scope';
export { DESIGNS, DEFAULT_DESIGN, designTitle } from '../lib/design';
export { Store } from './store';
export { toastSI, Toasts } from './toasts';
export { watchInView } from './in-view';
export { closeMenus, closeAll } from './close-menus';
