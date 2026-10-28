/*
 * The theme in a plain page: dist/marccent.js (npm run build), loaded as a module by any page, CMS or not:
 *
 *   <link rel="stylesheet" href="…/dist/marccent.css">
 *   <script>window.marccentDefaults = { … }</script>   (optional: the site's starting theme, lib/defaults.js)
 *   <script type="module" src="…/dist/marccent.js"></script>
 *
 * It starts by itself: loads the theme and puts it on <html>, then wires up every component in the markup
 * (core/components.js) now and as more is added, the canvas backgrounds, the pointer hovers, paused off-screen
 * animations, the toasts and the goo filter. window.marccentManual = true before it loads to start it yourself:
 * Marccent.start(). The rest of the core is on window.Marccent too (define your own components, the theme, toasts).
 */
import { startTheme, themeSI } from './index';
import { define, enhance } from './enhance';
import './components';
import { watchCanvases } from './canvas-background';
import { watchOffscreen } from './offscreen';
import { toastSI } from './toasts';
import { place, keepPlaced } from './place';
import { tooltip } from './tooltip';
import { closeMenus } from './close-menus';
import { watchInView } from './in-view';
import { watchScrolled } from './scrolled';

// hover-goo's SVG filter (components/ui/goo.js), added once where something on the page may use it.
const GOO = '<svg data-component="goo" aria-hidden="true" width="0" height="0" style="position:absolute"><filter id="goo">'
  + '<feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>'
  + '<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"/>'
  + '<feComposite in="SourceGraphic" in2="goo" operator="atop"/></filter></svg>';

let started = null;

/**
 * start: everything above, once per page; later calls return the same theme.
 * @param {{ path?: string }} [opts] - path: the page's path, for elements' own saved themes (location.pathname).
 * @returns {Promise<Object>} The Theme.
 */
const start = (opts) => {
  started ??= startTheme(opts).then((theme) => {
    enhance();
    watchOffscreen();
    toastSI.mount();
    const canvases = watchCanvases(() => theme);
    theme.subscribe(() => canvases.recolor(theme));
    if (!document.getElementById('goo') && document.querySelector('.hover-goo, [data-hover="goo"]')) {
      document.body.insertAdjacentHTML('beforeend', GOO);
    }
    // data-opens="<a dialog's id>": opens that Modal or Drawer.
    document.addEventListener('click', (e) => {
      const opener = e.target.closest?.('[data-opens]');
      const dialog = opener && document.getElementById(opener.dataset.opens);
      if (dialog?.showModal && !dialog.open) dialog.showModal();
    });
    return theme;
  });
  return started;
};

const Marccent = { start, define, enhance, themeSI, toasts: toastSI, place, keepPlaced, tooltip, closeMenus, watchInView, watchScrolled };
window.Marccent = Marccent;

if (!window.marccentManual) {
  start();
}

export { start, define, enhance, Marccent };
