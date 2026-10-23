'use client';
import { createContext, useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { themeSI } from './singleton';
import { toastSI } from './toasts';

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
 */
const ThemeProvider = ({ children, path, notify = toast }) => {
  const [theme, setTheme] = useState(null);
  useEffect(() => { themeSI().then(setTheme); }, []);
  const version = useSyncExternalStore(theme?.subscribe ?? noop, () => theme?.version ?? -1, () => -1);
  const page = path ?? (typeof location === 'undefined' ? '/' : location.pathname);
  const value = useMemo(() => ({ theme, version, path: page, notify }), [theme, version, page, notify]);
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, ThemeContext }
