'use client';
// Theme core: the saved theme put on the page. SiteTheme writes the site's on <html id="site">, ScopeThemes the
// elements' own (a theme editor scoped to an element's id): the same colors and attributes on both.
// The parts people interact with live beside it: toggles.js (light/dark, glass, rainbow, reset), palette-cards.js (the palette
// cards), editor.js and mini-editor.js (the editors); the canvas animations and their picker are in
// components/visuals/animations.js.
import { useContext, useEffect } from "react";
import { ThemeContext } from "../../lib/context";
import { DEFAULT_DESIGN } from '../../lib/design';
import defaults from '../../lib/theme.defaults.json';
import { applyScopes, paletteVars } from '../../lib/theme-scope';

const Body = (props) => (
  <body className={props.className} suppressHydrationWarning={true}>
    {props.children}
  </body>
);

// Applies the saved theme to <html>: the COLORS in styles/defaults.css (the only ones meant to be changed at runtime)
// from the same Color shades the canvas animations use, the mode (data-theme), glass (.glass), the design style
// (data-design; the server renders the default, layout.tsx), the default hover (data-hover) and, with the default
// design only, the defaults' vars (lib/theme.defaults.json), whenever the theme changes. Renders nothing.
const SiteTheme = () => {
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    if (!theme) return;
    const html = document.documentElement;
    for (const [ prop, v ] of Object.entries(paletteVars({ primary: theme.primary(), secondary: theme.secondary() }))) html.style.setProperty(prop, v);
    if (theme.dark) html.style.setProperty('--dark', theme.dark.hex);
    if (theme.light) html.style.setProperty('--light', theme.light.hex);
    html.dataset.theme = theme.isDark ? 'dark' : 'light';
    html.classList.toggle('glass', !!theme.glass);
    html.dataset.design = theme.design ?? DEFAULT_DESIGN;
    if (theme.hover) html.dataset.hover = theme.hover; else delete html.dataset.hover;
    // The defaults' vars only go with the default design: pick another and they drop away.
    const own = html.dataset.design === DEFAULT_DESIGN;
    for (const [ prop, v ] of Object.entries(defaults.vars ?? {})) own ? html.style.setProperty(prop, v) : html.style.removeProperty(prop);
  }, [theme, theme?.version]);
  return null;
}

/**
 * ScopeThemes: applies the elements' overrides to the page whenever the theme or the page changes, or the page's
 * content does (a client navigation that streams in). Renders nothing; mount once (layout.tsx).
 */
const ScopeThemes = () => {
  const { theme, path } = useContext(ThemeContext) ?? {};
  useEffect(() => {
    if (!theme) return;
    applyScopes(theme, path);
    const main = document.querySelector('main');
    if (!main) return;
    let frame;
    const mo = new MutationObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => applyScopes(theme, path)); });
    mo.observe(main, { childList: true, subtree: true });
    return () => { mo.disconnect(); cancelAnimationFrame(frame); };
  }, [ theme, theme?.version, path ]);
  return null;
};

export { Body, SiteTheme, ScopeThemes }
