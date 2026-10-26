// Shared: no 'use client' (no hooks), so it renders on the server or in the browser, wherever it's used.
import Link from 'next/link';
import { cx } from '../../lib/cx';
import '../../styles/components/menu.css';

/*
 * Menu: a site's navigation from plain data (styles: .menu-* in styles/components/menu.css). An item is a link, or a
 * dropdown when it has children; a child with children of its own is a submenu, and so on, to any depth. Built on
 * <details>, so it opens without JavaScript and works with the keyboard; a site closes open ones after navigating and
 * on an outside click or Escape (querySelectorAll('details[open]') on its header).
 *
 * Item: { name, href?, icon?, label?, external?, className?, children? }. name: visible text. href: where it goes (a
 * dropdown's is its "browse all" page, for the sitemap and footer). icon: full Font Awesome classes. label: aria-label
 * for icon-only links. external: opens in a new tab.
 */

// Usage: <a href={s.href} {...externalProps(s)}>
const externalProps = (link) => link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};

// Every item with an href, at any depth (dropdowns and their submenus), e.g. for a sitemap.
const menuLinks = (items) => items.flatMap(item => [ ...(item.href ? [ item ] : []), ...menuLinks(item.children ?? []) ]);

/**
 * Classes: the nav only gets "menu grid fixed gap-sm" (.menu is the hook for menu.css); everything else (dividers,
 * border, alignment) is passed in. layout replaces "fixed", e.g. "auto-cols cols-center" for icon-only menus (adding
 * it through className would conflict with fixed). Every part takes extra classes; an item can also carry its own.
 *
 * Submenus fly out beside their row in a wide container (56rem and up: a header bar) and open in place, indented,
 * in a narrow one (a phone's stacked menu, a sidebar).
 *
 * @param {Object} props
 * @param {Array} props.items - The menu (see Item above).
 * @param {string} props.label - aria-label for the <nav>, e.g. "Main".
 * @param {boolean} [props.iconOnly] - Show icons only; the item's label becomes the aria-label.
 * @param {string} [props.className] - Extra classes for the <nav>.
 * @param {Object} [props.style] - Inline styles for the <nav> (may override --cols).
 * @param {string} [props.layout="fixed"] - Replaces "fixed": e.g. "auto-cols cols-center" (icons sized to fit,
 *   centered) or "cols-1" (stacked).
 * @param {string} [props.gap="gap-sm"] - The gap class between items. "gap-0" for a menu with .divide, so the line
 *   sits evenly between items.
 * @param {string} [props.linkClassName] - Extra classes for every link (dropdown links included).
 * @param {string} [props.dropdownClassName] - Extra classes for each dropdown <details> (submenus included).
 * @param {string} [props.panelClassName] - Extra classes for each dropdown panel (submenus included).
 *
 * @example <Menu items={main} label="Main" />
 * @example <Menu items={social} label="Social" iconOnly layout="auto-cols cols-center" />
 * @example <Menu items={[ { name: 'Shop', href: '/shop', children: [ { name: 'Men', children: [ { name: 'Shirts', href: '/shop/men/shirts' } ] } ] } ]} label="Main" />
 */
// fixed (default) splits the width into equal columns, one per item (--cols).
const Menu = ({ items, label, iconOnly = false, className, style, layout = 'fixed', gap = 'gap-sm', linkClassName, dropdownClassName, panelClassName }) => (
  <nav data-component="menu" className={cx('menu grid', gap, layout, className)} style={{ '--cols': items.length, ...style }} aria-label={label}>
    {items.map(item => item.children
      ? <MenuDropdown key={item.name} item={item} className={dropdownClassName} panelClassName={panelClassName} linkClassName={linkClassName} />
      : <MenuLink key={item.href} item={item} iconOnly={iconOnly} className={linkClassName} />
    )}
  </nav>
);

const MenuLink = ({ item, iconOnly, className }) => (
  <Link
    data-component="menu-link"
    href={item.href}
    className={cx('menu-link', className, item.className)}
    aria-label={iconOnly ? item.label ?? item.name : undefined}
    title={iconOnly ? item.name : undefined}
    {...externalProps(item)}
  >
    {item.icon && <i className={item.icon} aria-hidden="true"></i>}
    {!iconOnly && <span className="text-truncate">{item.name}</span>}
  </Link>
);

// A dropdown; sub: it sits in another dropdown's panel (.menu-sub: the caret points sideways, menu.css places it).
// Its children render the same way, so a child with children is a submenu of this one.
const MenuDropdown = ({ item, sub, className, panelClassName, linkClassName }) => (
  <details data-component="menu-dropdown" className={cx('menu-dropdown', sub && 'menu-sub', className, item.className)}>
    <summary className={cx('menu-link', linkClassName)}>
      {item.icon && <i className={item.icon} aria-hidden="true"></i>}
      <span className="text-truncate">{item.name}</span>
    </summary>
    <div className={cx('menu-panel bg border round shadow pad grid cols-1 gap-sm', panelClassName)}>
      {item.children.map(child => child.children
        ? <MenuDropdown key={child.name} item={child} sub className={className} panelClassName={panelClassName} linkClassName={linkClassName} />
        : <MenuLink key={child.href + child.name} item={child} className={linkClassName} />
      )}
    </div>
  </details>
);

export { Menu, externalProps, menuLinks };
