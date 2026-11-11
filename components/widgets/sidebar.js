'use client';
import { Children, cloneElement, isValidElement, useEffect, useState } from 'react';
import { cx } from '../../lib/cx';
import { useMedia } from '../../lib/media';
import { Button } from '../ui/button';
import { Drawer } from '../ui/modal';
import { Menu } from '../ui/menu';
import '../../styles/components/sidebar.css';

// Below this there's no room for a sidebar beside the page: it becomes a top bar, its content in a Drawer behind a menu
// button (the layout-ends step, as the App frame pattern's grid: PATTERNS.md).
const NARROW = '(width < 56rem)';
const SAVED = 'marccent-sidebar-collapsed';

/**
 * Sidebar: a column of links down the side of an app or docs page, as tall as the window and pinned while the page
 * scrolls. Its button collapses it to its icons (remembered in this browser), the links' names then their tooltips and
 * the dropdowns hidden (they have no icon-only form). Below 56rem it's a top bar with a menu button that opens the same
 * content in a Drawer. Its width is its state (PRODUCT-LINE.md section 4, rule 9): --sidebar-width open, the icons'
 * width collapsed. Put it beside the page with the App frame pattern (PATTERNS.md).
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.brand] - At the top (a logo link); hidden while collapsed.
 * @param {string} [props.label='Sidebar'] - Its aria-label, and the Drawer's title.
 * @param {string} [props.className] - Extra classes on the sidebar.
 * @param {React.ReactNode} props.children - Its content: a Menu (layout "cols-1", className "menu-vertical", and
 *   style --cols 1 until B-005), then anything for the bottom (an account link, a theme toggle).
 *
 * @example <Sidebar brand={<Logo />}><Menu items={links} label="Sidebar" layout="cols-1" className="menu-vertical" /></Sidebar>
 */
const Sidebar = ({ brand, label = 'Sidebar', className, children }) => {
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

  if (narrow) return (
    <div data-component="sidebar" className={cx('sidebar-top header bg border-bottom pad-sm sticky-top', className)}>
      {brand}
      <Button icon="bars" aria-label={`Open ${label.toLowerCase()}`} onClick={() => setOpen(true)} />
      <Drawer title={label} show={open} setShow={setOpen} side="start">{children}</Drawer>
    </div>
  );

  // Collapsed: its Menus show icons only, without their dropdowns.
  const content = collapsed ? Children.map(children, (child) => isValidElement(child) && child.type === Menu
    ? cloneElement(child, { iconOnly: true, items: child.props.items.filter((item) => !item.children) }) : child) : children;

  return (
    <aside data-component="sidebar" aria-label={label}
      className={cx('sidebar bg grid cols-1 gap-sm pad-sm sticky-top h-screen border-end', collapsed && 'collapsed', className)}>
      <div className="header">
        {collapsed ? <span /> : brand}
        <Button icon={collapsed ? 'angles-right' : 'angles-left'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed} data-collapse onClick={() => collapse(!collapsed)} />
      </div>
      {content}
    </aside>
  );
};

export { Sidebar };
