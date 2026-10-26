'use client';
import { useEffect, useRef } from 'react';
import { closeMenus, closeAll } from '../core/close-menus';

/**
 * useCloseMenus: closeMenus (core/close-menus.js) for a React element, plus closing them all after navigating (path
 * changes).
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
    closeAll(ref.current);
  }, [ ref, path ]);

  useEffect(() => {
    const onEscape = () => escape.current?.();
    return closeMenus(() => ref.current, { onEscape });
  }, [ ref ]);
};

export { useCloseMenus };
