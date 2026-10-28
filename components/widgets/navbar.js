'use client';
import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/cx';
import { useCloseMenus } from '../../lib/close-menus';
import { useScrolled } from '../../lib/scrolled';
import { ToggleButton } from '../ui/toggle-button';
import { Menu } from '../ui/menu';
import '../../styles/components/nav.css';

/**
 * NavBar: a site's header bar (Bootstrap's navbar; the look and the narrow layout are in styles/components/nav.css).
 * The bar spans the screen; a .wrap inside caps its content. One row: brand | main menu | end (pushed to the end of
 * the empty column) | last. Below 56rem the menu and end fold behind a toggle at the right, next to last, and open
 * stacked as row 2. Dropdowns (and their submenus, to any depth) close after navigating, on an outside click and on
 * Escape (useCloseMenus); the folded menu closes after navigating too.
 * Floating (variant="floating"): fixed over the top of the page (a hero shows through), the bar a centered pill,
 * see-through until the page scrolls (data-scrolled, useScrolled) or the folded menu opens, then a .bg panel. It
 * takes no room, so the page's first section starts under it.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.brand - The home link (a logo).
 * @param {Array} props.items - The main menu (Menu items).
 * @param {string} [props.path] - The page's path, so menus close after navigating (usePathname() in Next).
 * @param {React.ReactNode} [props.end] - Folds with the menu: give its root .nav-end (e.g. a <nav className="nav-end
 *   grid auto-cols items-center gap-sm"> of social links).
 * @param {React.ReactNode} [props.last] - Always in the row, at its end: give its root .col-last (e.g. a theme button).
 * @param {React.ReactNode} [props.top] - A row above the bar (e.g. a panel that slides down), inside the sticky header.
 * @param {() => void} [props.onEscape] - Called after Escape closes the dropdowns (e.g. to close top's panel too).
 * @param {string} [props.label='Main'] - The main menu's aria-label.
 * @param {string} [props.id='site-nav'] - The id of the folding part (the toggle's aria-controls).
 * @param {"floating"} [props.variant] - Floating over the page (above); a bar across the top when left out.
 * @param {boolean} [props.hover] - The main menu's dropdowns also open on mouse hover (Menu hover).
 * @param {string} [props.className] - Extra classes on the header.
 */
const NavBar = ({ brand, items, path, end, last, top, onEscape, label = 'Main', id = 'site-nav', variant, hover, className }) => {
  const header = useRef(null);
  const [ open, setOpen ] = useState(false);
  const scrolled = useScrolled();
  const floating = variant === 'floating';
  const solid = scrolled || open;
  useCloseMenus(header, { path, onEscape });
  useEffect(() => setOpen(false), [ path ]);

  return (
    // A 1-column grid: top, when given, is the row above the bar. pad-y-sm: the sides keep the wrap padding.
    // Floating: the header is only the frame; the pill inside is the bar (pad-x: the inner .wrap would have none).
    <header ref={header} data-component="nav-bar" data-variant={variant} data-scrolled={scrolled || undefined}
      className={cx('nav wrap wrap-fluid pad-y-sm grid cols-1 gap-sm', !floating && 'bg border-bottom sticky-top', open && 'open', className)}>
      {top}
      <div className={cx('wrap grid layout-ends items-center gap-sm', floating ? cx('pad-x pad-y-sm', open ? 'round' : 'pill', solid && 'bg border shadow') : 'pad-0')}>
        {brand}
        <ToggleButton icon="bars-staggered" activeIcon="xmark" className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'}
          open={open} onToggle={setOpen} controls={id} />
        <div id={id} className="nav-collapse">
          {/* auto-cols: each item is its text plus the link padding (not equal columns as wide as the longest). */}
          <Menu items={items} label={label} layout="auto-cols" gap="gap-0" className="divide" hover={hover} />
          {end}
        </div>
        {last}
      </div>
    </header>
  );
};

export { NavBar };
