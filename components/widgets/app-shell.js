'use client';
import { useEffect, useState } from 'react';
import { cx } from '../../lib/cx';
import { useMedia } from '../../lib/media';
import { Button } from '../ui/button';
import { Drawer } from '../ui/modal';
import { Menu } from '../ui/menu';
import '../../styles/components/app-shell.css';

// Below this there's no room for a sidebar beside the page: it moves into a Drawer behind a menu button (the
// layout-ends step, like the NavBar's fold).
const NARROW = '(width < 56rem)';
const SAVED = 'marccent-sidebar-collapsed';

/**
 * AppShell: a dashboard or docs layout: a sidebar of links down the left, the page beside it. The sidebar is as tall
 * as the window and stays put while the page scrolls; its button collapses it to icons only (remembered in this
 * browser), the links' names then showing as their tooltips. Below 56rem the sidebar becomes a top bar with a menu
 * button that opens the same links in a Drawer from the left. Dropdowns in the menu open in place, indented.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.brand] - At the top of the sidebar (a logo link); hidden while collapsed.
 * @param {Array} props.items - The links (Menu items; give each an icon, for the collapsed sidebar).
 * @param {React.ReactNode} [props.footer] - At the bottom of the sidebar (an account link, a theme toggle).
 * @param {string} [props.label='Sidebar'] - The menu's aria-label, and the Drawer's title.
 * @param {string} [props.className] - Extra classes on the shell.
 * @param {React.ReactNode} props.children - The page.
 *
 * @example <AppShell brand={<Logo />} items={[ { name: 'Overview', href: '/', icon: 'fa-solid fa-gauge' } ]}><Dashboard /></AppShell>
 */
const AppShell = ({ brand, items, footer, label = 'Sidebar', className, children }) => {
  const narrow = useMedia(NARROW);
  const [ collapsed, setCollapsed ] = useState(false);
  const [ open, setOpen ] = useState(false);

  useEffect(() => {
    try { setCollapsed(localStorage.getItem(SAVED) === '1'); } catch {}
  }, []);
  const collapse = (on) => {
    setCollapsed(on);
    try { localStorage.setItem(SAVED, on ? '1' : '0'); } catch {}
  };

  const menu = (icons) => <Menu items={items} label={label} layout="cols-1" gap="gap-0" style={{ '--cols': 1 }} iconOnly={icons} />;
  const folded = collapsed && !narrow;

  return (
    <div data-component="app-shell" className={cx('app-shell grid gap-0', folded && 'collapsed', className)}>
      {narrow ? (
        <>
          <header className="app-shell-bar header bg border-bottom pad-sm sticky-top">
            {brand}
            <Button icon="bars" aria-label={`Open ${label.toLowerCase()}`} onClick={() => setOpen(true)} />
          </header>
          <Drawer title={label} show={open} setShow={setOpen} side="start" footer={footer}>{menu(false)}</Drawer>
        </>
      ) : (
        <aside className="app-sidebar bg grid cols-1 gap-sm pad-sm" aria-label={label}>
          <div className="header">
            {folded ? <span /> : brand}
            <Button icon={folded ? 'angles-right' : 'angles-left'} aria-label={folded ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!folded} data-collapse onClick={() => collapse(!folded)} />
          </div>
          {menu(folded)}
          {footer && <div className="app-sidebar-footer grid cols-1 gap-sm">{footer}</div>}
        </aside>
      )}
      <div className="app-main">{children}</div>
    </div>
  );
};

export { AppShell };
