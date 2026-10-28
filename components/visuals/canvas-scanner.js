'use client';
import { useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../../lib/context';
import { watchCanvases } from '../../core/canvas-background';

/*
 * CanvasScanner: watchCanvases (core/canvas-background.js) for a React page: a canvas background behind every
 * data-component="animation" element, from the markup alone. Starts once the theme has loaded, rescans after a
 * navigation (path) and recolors them all when the theme changes. Renders nothing.
 */
const CanvasScanner = () => {
  const { theme, path: pathname } = useContext(ThemeContext) ?? {};
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const watch = useRef(null);
  const ready = Boolean(theme);

  useEffect(() => {
    if (!ready) return;
    watch.current = watchCanvases(() => themeRef.current);
    return () => { watch.current.stop(); watch.current = null; };
  }, [ pathname, ready ]);

  // A new theme recolors every background.
  useEffect(() => {
    if (theme) watch.current?.recolor(theme);
  }, [ theme, theme?.version ]);

  return null;
};

export { CanvasScanner };
