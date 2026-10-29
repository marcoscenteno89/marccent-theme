'use client';
import { createContext, useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { themeSI } from './singleton';
import { toastSI } from './toasts';
import { LinkContext } from './link';

// The theme (lib/singleton.js) is one object changed in place: its methods save and emit, and ThemeProvider
// re-renders everything below it on the new version. { theme: null } until it has loaded. An effect that follows
// the theme lists theme?.version (the object itself never changes).
const ThemeContext = createContext(null);

const noop = () => () => {};
// By default the theme's messages go to its own toasts (components/ui/toast.js shows them).
const toast = (msg, tone) => toastSI.add(msg, tone);

/**
 * ThemeProvider: loads the theme and hands it down with what the theme needs from the app: the page's path from the
 * router, and where its messages go.
 * @param {string} [path] - The page's path: elements' own themes are saved per page. Defaults to location.pathname
 *   (pass it from the router so it follows client navigation).
 * @param {(msg: string, tone?: string) => void} [notify] - Called with a message when the theme changes. Defaults to
 *   the theme's toasts; pass another to use your own.
 * @param {React.ElementType} [link] - The router's link component (next/link's default export), for the links the
 *   components render (lib/link.js). Defaults to a plain <a>: every link is a page load.
 */
const ThemeProvider = ({ children, path, notify = toast, link = 'a' }) => {
  const [theme, setTheme] = useState(null);
  useEffect(() => { themeSI().then(setTheme); }, []);
  const version = useSyncExternalStore(theme?.subscribe ?? noop, () => theme?.version ?? -1, () => -1);
  const page = path ?? (typeof location === 'undefined' ? '/' : location.pathname);
  const value = useMemo(() => ({ theme, version, path: page, notify }), [theme, version, page, notify]);
  return (
    <ThemeContext.Provider value={value}>
      <LinkContext.Provider value={link}>
        {children}
      </LinkContext.Provider>
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, ThemeContext }
