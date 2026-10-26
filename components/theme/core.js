'use client';
// Theme core: the saved theme put on the page. SiteTheme writes the site's on <html id="site">, ScopeThemes the
// elements' own (a theme editor scoped to an element's id): the same colors and attributes on both.
// The parts people interact with live beside it: toggles.js (light/dark, glass, rainbow, reset), palette-cards.js (the palette
// cards), editor.js and mini-editor.js (the editors); the canvas animations and their picker are in
// components/visuals/animations.js.
import { useContext, useEffect } from "react";
import { ThemeContext } from "../../lib/context";
import { applySiteTheme, watchScopes } from '../../core/apply';

const Body = (props) => (
  <body data-component="body" className={props.className} suppressHydrationWarning={true}>
    {props.children}
  </body>
);

// SiteTheme: applySiteTheme (core/apply.js) whenever the theme changes. Renders nothing.
const SiteTheme = () => {
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    if (theme) {
      applySiteTheme(theme);
    }
  }, [theme, theme?.version]);
  return null;
}

/**
 * ScopeThemes: watchScopes (core/apply.js) whenever the theme or the page changes. Renders nothing; mount once
 * (layout.tsx).
 */
const ScopeThemes = () => {
  const { theme, path } = useContext(ThemeContext) ?? {};
  useEffect(() => {
    if (theme) {
      return watchScopes(theme, path);
    }
  }, [ theme, theme?.version, path ]);
  return null;
};

export { Body, SiteTheme, ScopeThemes }
