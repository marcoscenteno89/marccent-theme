// Closes every open dropdown (<details>) inside el.
const closeAll = (el) => {
  el?.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
};

/**
 * closeMenus: the Menu's dropdowns are <details>, which the browser opens and closes on their own; this closes the
 * ones inside el the way a site menu should. A click outside an open one: that one (so opening another dropdown, or
 * a sibling submenu, closes the first; its own submenus count as inside). Escape: all of them, then onEscape (e.g.
 * to close a panel the site opened as well). Returns a function that stops. React: useCloseMenus (lib/close-menus.js),
 * which also closes them all after navigating.
 *
 * click, not pointerdown: on a phone an open dropdown pushes the menu down, and closing it on press would move the
 * next summary out from under the finger before the click lands.
 *
 * @param {Element | (() => Element)} el - The element holding the menus (a header), or a function returning it.
 * @param {Object} [opts]
 * @param {() => void} [opts.onEscape] - Called after Escape closes them.
 * @returns {() => void}
 */
const closeMenus = (el, { onEscape } = {}) => {
  const root = typeof el === 'function' ? el : () => el;
  const closeOutside = (event) => {
    root()?.querySelectorAll('details[open]').forEach(d => {
      if (!d.contains(event.target)) {
        d.removeAttribute('open');
      }
    });
  };
  const closeOnEscape = (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    closeAll(root());
    onEscape?.();
  };
  document.addEventListener('click', closeOutside);
  document.addEventListener('keydown', closeOnEscape);
  return () => {
    document.removeEventListener('click', closeOutside);
    document.removeEventListener('keydown', closeOnEscape);
  };
};

export { closeMenus, closeAll };
