// Closes every open dropdown (<details>) inside el.
const closeAll = (el) => {
  el?.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
};

// A dropdown of a hover menu (Menu hover: data-open="hover") whose panel floats (a header bar; not a phone's stacked
// menu, where opening on hover would shove the page around under the pointer).
const hoverDropdown = (target, root) => {
  const d = target instanceof Element ? target.closest('[data-open="hover"] details') : null;
  if (!d || !root?.contains(d)) {
    return null;
  }
  const panel = d.querySelector(':scope > .menu-panel');
  return panel && getComputedStyle(panel).position === 'absolute' ? d : null;
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
 * Hover menus (Menu hover): with a mouse, a dropdown also opens while the pointer is over it, and closes when it
 * leaves; a click on its summary then keeps it open instead of closing it. Keyboard and touch work as usual.
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
  const openOnHover = (event) => {
    const d = event.pointerType === 'mouse' && hoverDropdown(event.target, root());
    if (d && !d.open) {
      d.open = true;
      d.dataset.hovered = '';
    }
  };
  // Out of a submenu and its dropdown at once: each one the pointer left, innermost first.
  const closeOnLeave = (event) => {
    if (event.pointerType !== 'mouse') {
      return;
    }
    for (let d = hoverDropdown(event.target, root()); d; d = hoverDropdown(d.parentElement, root())) {
      if (d.contains(event.relatedTarget)) {
        return;
      }
      if ('hovered' in d.dataset) {
        d.open = false;
        delete d.dataset.hovered;
      }
    }
  };
  // A mouse click on the summary of one it opened: it stays open (and from now on stays after the pointer leaves).
  const keepOpen = (event) => {
    const d = event.detail && hoverDropdown(event.target, root());
    if (d && event.target.closest('summary')?.parentElement === d && 'hovered' in d.dataset) {
      event.preventDefault();
      delete d.dataset.hovered;
    }
  };
  const listeners = [
    [ 'click', keepOpen, true ],
    [ 'click', closeOutside ],
    [ 'keydown', closeOnEscape ],
    [ 'pointerover', openOnHover ],
    [ 'pointerout', closeOnLeave ],
  ];
  listeners.forEach(([ type, fn, capture ]) => document.addEventListener(type, fn, capture));
  return () => listeners.forEach(([ type, fn, capture ]) => document.removeEventListener(type, fn, capture));
};

export { closeMenus, closeAll };
