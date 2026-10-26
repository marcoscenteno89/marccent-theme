// Shared: no 'use client' (no state or effects), so a collage page can render on the server.
import { cx } from '../../lib/cx';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Loading } from '../ui/loading';
import { ImageCard } from './layout';

/*
 * Collage: tiles of ImageCards of different sizes, shapes, borders and overlays on one dense grid (the Images and
 * Animations pages). A tile is a photo (src) or a live canvas animation (canvas), plus ImageCard's own props.
 */

// Tile sizes on the collage grid. The spans (layout.css) wait for a wide enough grid, so on a phone every tile is one
// column wide; the row spans are inline (they don't widen the grid). Rows are at least --row (Collage's row) and grow
// to fit a tile's content (a narrow phone column), so no text is cut off.
const SIZE = {
  square: {},
  circle: { shape: 'circle', ratio: '1 / 1', style: { width: 'min(100%, var(--row))', justifySelf: 'center', alignSelf: 'center' } },
  portrait: { style: { gridRow: 'span 2' } },
  landscape: { className: 'span-2' },
  wide: { className: 'span-3' },
  feature: { className: 'span-2', style: { gridRow: 'span 2' }, big: true },
  panorama: { className: 'span-4', big: true },
};

// Borders for some tiles: the theme's .border line, a thick light frame (a print), or a ring in the primary.
const BORDER = {
  line: { className: 'border' },
  frame: { style: { border: '.4rem solid color-mix(in srgb, var(--light) 92%, transparent)' } },
  accent: { style: { border: '2px solid var(--primary)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--primary) 25%, transparent), var(--shadow)' } },
};

// Small pieces for the cards' content. Spinner: Loading waits for a value that never comes, so it keeps spinning.
const Spinner = ({ kind, width = '3rem' }) => <div data-component="spinner" style={{ width, justifySelf: 'center' }}><Loading require={[ null ]} kind={kind} /></div>;
const Light = (props) => <Button data-name="light" className="light" {...props} />;
const Ghost = ({ icon, label }) => <Button data-name="ghost" icon={icon} aria-label={label} style={{ color: 'inherit', borderColor: 'rgb(255 255 255 / .5)' }} />;
const Stars = ({ n }) => (
  <span data-component="stars" className="grid auto-cols gap-0" aria-label={`${n} out of 5 stars`} style={{ color: '#ffd166', justifyContent: 'inherit' }}>
    {[1, 2, 3, 4, 5].map(i => <Icon key={i} name="star" family={i <= n ? 'fa-solid' : 'fa-regular'} style={{ '--icon-size': '1.1em' }} />)}
  </span>
);
const Progress = ({ value, label }) => (
  <div data-component="progress" className="grid cols-1 gap-xs w-100">
    <small className="grid auto-cols" style={{ justifyContent: 'space-between' }}><span>{label}</span><strong>{value}%</strong></small>
    <div className="round" style={{ height: '.35rem', background: 'rgb(255 255 255 / .25)' }}>
      <div className="bg-gradient h-100" style={{ width: `${value}%` }} />
    </div>
  </div>
);

/**
 * Collage: the tiles on a grid (6 columns by default) that packs them densely (pick sizes that fill it with no holes).
 * @param {{ src?: string, canvas?: string, size: keyof SIZE, border?: keyof BORDER, children?: React.ReactNode,
 *   [prop: string]: any }[]} tiles - src: a photo name in public/img ("blue1"); canvas: an animation name ("snow").
 *   Every other prop goes to the ImageCard.
 * @param {number} [cols=6] @param {string} [min='9rem'] - Columns, and the narrowest a column gets before they wrap.
 * @param {string} [row='11rem'] - The shortest a row gets. Bigger cells: <Collage cols={3} min="18rem" row="22rem">,
 *   each tile four times the area (the Animations page: fewer canvases, each one larger).
 * @param {React.ReactNode} [children] - Instead of tiles, any tiles of your own on the same grid (span-* and row
 *   spans size them). @param {string} [className] - e.g. a gap class.
 */
const Collage = ({ tiles, cols = 6, min = '9rem', row = '11rem', className, children }) => (
  <div data-component="collage" className={cx('grid', className)} style={{ '--cols': cols, '--min': min, '--row': row, gridAutoRows: 'minmax(var(--row), auto)', gridAutoFlow: 'dense' }}>
    {tiles ? tiles.map(({ src, canvas, size, border, children, ...card }, i) => {
      const { style, className, ...shape } = SIZE[size];
      const edge = BORDER[border] ?? {};
      return (
        <ImageCard key={src ?? `${canvas}-${i}`} src={src && `/img/${src}.webp`} canvas={canvas} ratio={null} {...shape} {...card}
          className={[className, edge.className].filter(Boolean).join(' ') || undefined} style={{ ...style, ...edge.style }}>
          {children}
        </ImageCard>
      );
    }) : children}
  </div>
);

export { Collage, Spinner, Light, Ghost, Stars, Progress };
