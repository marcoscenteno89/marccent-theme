// Shared: no 'use client' (no hooks), so it renders on the server or in the browser, wherever it's used.
import { cx } from '../../lib/cx';

/*
 * Section, Grid and Card: a page's building blocks as the theme's layout classes (styles/layout.css). The hosts that
 * write them on the server (Marccent Blocks' render.php, django-marccent's CMS plugins) write this same markup; the
 * markup reference (markup/) checks they do. Any other prop (id, data-*) goes on the root element.
 */

/**
 * Section: a full-width band (its surface) and its content capped to the page width. With an image: a .stack of the
 * image, a shade and the content, centered in the band, in light text.
 *
 * @param {Object} props
 * @param {string} [props.as='section'] - The element: section, div, header, footer or aside.
 * @param {string} [props.width='wrap'] - The content's width: wrap, "wrap wrap-sm", "wrap wrap-lg", "wrap wrap-fluid".
 * @param {string} [props.padY='pad-y-lg'] - Padding above and below the content.
 * @param {string} [props.gap] - The gap between the content's blocks.
 * @param {string} [props.surface] - The band's background (bg, "bg border", bg-primary…); over an image, the content's.
 * @param {"light"|"dark"} [props.mode] - The band in this mode, whatever the page's (data-theme).
 * @param {boolean} [props.center] - Centers the content.
 * @param {string} [props.minHeight] - The band's least height (e.g. 60vh); the content centers in it.
 * @param {string} [props.image] - A background image's URL.
 * @param {string} [props.imageAlt=''] - Its alt text (empty: decorative).
 * @param {number} [props.shade=50] - How dark the shade over the image is, 0 to 100.
 * @param {string} [props.className] - Extra classes on the band.
 */
const Section = ({ as: Tag = 'section', width = 'wrap', padY = 'pad-y-lg', gap, surface, mode, center, minHeight, image, imageAlt = '', shade = 50, className, children, ...rest }) => (
  // A least height makes the band a one-cell grid, so its content box can center in it (not .grid: that brings columns).
  <Tag {...rest} data-theme={mode || undefined} className={cx('wrap wrap-fluid', image ? 'stack' : surface, className)}
    style={minHeight ? { minHeight, ...(!image && { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)' }) } : undefined}>
    {image && <img className="cover-img" src={image} alt={imageAlt} loading="lazy" decoding="async" />}
    {image && <div aria-hidden="true" style={{ background: `rgb(0 0 0 / ${shade}%)` }}></div>}
    <div className={cx(width, padY, 'grid cols-1', gap, center && 'text-center justify-center', image && surface)}
      style={image ? { position: 'relative', alignContent: 'center', color: '#fff' } : minHeight ? { alignContent: 'center' } : undefined}>
      {children}
    </div>
  </Tag>
);

/**
 * Grid: the theme's .grid, each child one cell.
 *
 * @param {Object} props
 * @param {string} [props.layout='cols'] - cols (equal columns that wrap), fixed (equal columns, always), row-wrap (a
 *   wrapping row of content-wide items), auto-cols, or an uneven layout (layout-2-1, layout-1-2-1, layout-ends…).
 * @param {number} [props.cols=3] - For equal columns: the most per row (1 to 10).
 * @param {string} [props.min] - For equal columns: the narrowest a column gets before the row wraps (e.g. 14rem).
 * @param {string} [props.gap] - The gap class (gap-0, gap-sm, gap-lg; none: the default gap).
 * @param {string} [props.alignItems] - items-start, items-center or items-end (none: stretch).
 * @param {boolean} [props.center] - Centers the columns and their content.
 * @param {string} [props.className] - Extra classes.
 */
const Grid = ({ layout = 'cols', cols = 3, min, gap, alignItems, center, className, children, ...rest }) => {
  const equal = layout === 'cols' || layout === 'fixed';
  const shape = equal ? cx('grid', layout === 'fixed' && 'fixed', `cols-${cols}`) : layout === 'row-wrap' ? 'row-wrap' : cx('grid', layout);
  return (
    <div {...rest} className={cx(shape, gap, alignItems, center && 'cols-center justify-center text-center', className)}
      style={equal && min ? { '--min': min } : undefined}>
      {children}
    </div>
  );
};

/**
 * Card: a raised box, its children stacked inside; or, with rows, laid on that many rows of the parent grid (a .sub),
 * so cards side by side line up their parts.
 *
 * @param {Object} props
 * @param {string} [props.surface='bg border'] - The background.
 * @param {boolean} [props.round=true] - Rounded corners.
 * @param {string} [props.pad='pad'] - The padding class.
 * @param {string} [props.gap='gap-sm'] - The gap between its children (not with rows).
 * @param {string} [props.hover] - A hover effect class (hover-holographic…).
 * @param {boolean} [props.center] - Centers the content.
 * @param {number} [props.rows] - Spans this many of the parent's rows (a subgrid).
 * @param {string} [props.className] - Extra classes.
 */
const Card = ({ surface = 'bg border', round = true, pad = 'pad', gap = 'gap-sm', hover, center, rows, className, children, ...rest }) => (
  <article {...rest} className={cx(surface, round && 'round', pad, rows ? `sub rows-${rows}` : cx('grid cols-1 content-start', gap), hover,
    center && 'text-center justify-center', className)}>
    {children}
  </article>
);

export { Section, Grid, Card };
