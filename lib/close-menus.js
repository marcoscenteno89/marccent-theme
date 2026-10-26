'use client';
import { useEffect, useRef } from 'react';

/**
 * useCloseMenus: the Menu's dropdowns are <details>, which the browser opens and closes on their own; this closes
 * the ones inside ref's element the way a site menu should. After navigating (path changes): all of them. A click
 * outside an open one: that one (so opening another dropdown, or a sibling submenu, closes the first; its own
 * submenus count as inside). Escape: all of them, then onEscape (e.g. to close a panel the site opened as well).
 *
 * click, not pointerdown: on a phone an open dropdown pushes the menu down, and closing it on press would move the
 * next summary out from under the finger before the click lands.
 *
 * @param {React.RefObject} ref - The element holding the menus (a header).
 * @param {Object} [opts]
 * @param {string} [opts.path] - The page's path; a change closes every dropdown.
 * @param {() => void} [opts.onEscape] - Called after Escape closes them.
 */
const useCloseMenus = (ref, { path, onEscape } = {}) => {
  // The latest onEscape, so an inline function doesn't re-add the listeners on every render.
  const escape = useRef(onEscape);
  escape.current = onEscape;

  useEffect(() => {
    ref.current?.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
  }, [ ref, path ]);

  useEffect(() => {
    const closeOutside = (event) => ref.current?.querySelectorAll('details[open]').forEach(d => {
      if (!d.contains(event.target)) d.removeAttribute('open');
    });
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      ref.current?.querySelectorAll('details[open]').forEach(d => d.removeAttribute('open'));
      escape.current?.();
    };
    document.addEventListener('click', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [ ref ]);
};

export { useCloseMenus };
