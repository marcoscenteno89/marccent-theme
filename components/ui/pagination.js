'use client';
import { cx } from '../../lib/cx';
import '../../styles/components/pagination.css';

// One pagination button. Outside Pagination, so it keeps its identity (and keyboard focus) across renders.
const PageCell = ({ page, label, disabled, current, update, children }) => (
  <button type="button" className="page-link col-center w-100 h-100"
    disabled={disabled} aria-label={label} aria-current={page === current && !label ? 'page' : undefined} onClick={() => update(page)}>
    {children}
  </button>
);

/**
 * Pagination: first, previous, one button per page, next, last, as one row of
 * equal cells (grid fixed, --cols = pages + 4). Layout in styles/components/pagination.css, colors in colors.css.
 * @param {number} total - Number of items. @param {number} pageSize - Items per page.
 * @param {number} current - Current page (1-based). @param {Function} update - Called with the page to show.
 * @param {string} [className] - Extra classes on the nav (default only "grid fixed gap-0"; add e.g.
 *   "divide border round" for the bar look). @param {Object} [style] - Inline styles on the nav
 *   (may override --cols).
 */
const Pagination = ({ total, pageSize, current, update, className, style }) => {
  const pages = Math.ceil(total / pageSize);
  const first = current === 1;
  const last = current === pages;
  const cell = { current, update };
  return (
    <nav data-component="pagination" className={cx('grid fixed gap-0', className)} style={{ '--cols': pages + 4, ...style }}
      aria-label="Pages">
      <PageCell {...cell} page={1} label="First page" disabled={first}>&laquo;</PageCell>
      <PageCell {...cell} page={current - 1} label="Previous page" disabled={first}>&lsaquo;</PageCell>
      {Array.from({ length: pages }, (_, i) => <PageCell {...cell} key={i} page={i + 1}>{i + 1}</PageCell>)}
      <PageCell {...cell} page={current + 1} label="Next page" disabled={last}>&rsaquo;</PageCell>
      <PageCell {...cell} page={pages} label="Last page" disabled={last}>&raquo;</PageCell>
    </nav>
  );
}

export { Pagination };
