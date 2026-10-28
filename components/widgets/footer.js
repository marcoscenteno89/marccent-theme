// Shared: no 'use client' (no hooks), so it renders on the server or in the browser, wherever it's used.
import { cx } from '../../lib/cx';
import { Menu } from '../ui/menu';

/**
 * Footer: a site's footer from the same data as its menus (Menu items). Top: the brand and a line about the site,
 * then the link columns, one per item with children (its name the column's heading); below a line, the legal row
 * (copyright, policy links) at the start and the social icons at the end. Every part is optional. One column on
 * phones; brand beside the columns from 40rem, the columns side by side as they fit. id="footer", so PauseOffscreen
 * pauses its animations while it's scrolled away.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.brand] - The home link (a logo).
 * @param {React.ReactNode} [props.about] - A line or two under the brand.
 * @param {Array} [props.columns] - Menu items with children: each is a column.
 * @param {Array} [props.social] - Menu items with icons (icon-only links).
 * @param {React.ReactNode} [props.legal] - The bottom row's text, e.g. <small>© 2026 …</small>.
 * @param {Array} [props.legalLinks] - Menu items beside it (privacy, terms).
 * @param {string} [props.className] - Extra classes on the footer (its colors: "bg" by default).
 *
 * @example <Footer brand={<Logo />} about="Made in Idaho." columns={main} social={social} legal={<small>© 2026 Marccent</small>} />
 */
const Footer = ({ brand, about, columns = [], social, legal, legalLinks, id = 'footer', className = 'bg' }) => (
  <footer id={id} data-component="footer" className={cx('wrap wrap-fluid pad-y-lg grid cols-1 gap-lg', className)}>
    {(brand || about || columns.length > 0) && (
      <div className="wrap pad-0 grid layout-1-2 gap-lg">
        <div className="grid cols-1 gap-sm content-start">
          {brand}
          {about && <p className="opacity-75">{about}</p>}
        </div>
        <div className="grid gap-lg" style={{ '--min': '10rem', '--cols': Math.max(columns.length, 1) }}>
          {columns.map(column => (
            <div key={column.name} className="grid cols-1 gap-sm content-start">
              <h6>{column.name}</h6>
              <Menu items={column.children} label={column.name} layout="cols-1" gap="gap-0" style={{ '--cols': 1 }} />
            </div>
          ))}
        </div>
      </div>
    )}
    {(legal || legalLinks || social) && (
      <div className="wrap pad-0 border-top pad-y grid layout-ends items-center gap-sm" style={{ '--start': legalLinks ? 2 : 1 }}>
        <div className="fs-sm opacity-75">{legal}</div>
        {legalLinks && <Menu items={legalLinks} label="Legal" layout="auto-cols" className="fs-sm" />}
        {social && <Menu items={social} label="Social" iconOnly layout="auto-cols" className="col-last" />}
      </div>
    )}
  </footer>
);

export { Footer };
