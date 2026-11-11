'use client';
import { useState, Children } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/icon';

/*
 * Layout widgets: honeycombs (HexGrid with HexFlip children: a team wall), a timeline and StatCard. No CSS of
 * their own: the theme's classes (grid, stack, shape, color: bg-primary-tint, glass-dark), and inline styles for what
 * only the component knows (positions, sizes, turns).
 */

/**
 * HexGrid: its children as interlocking hexagons, on a grid. Every row track is a quarter of a hexagon; each hexagon
 * spans four, and each row starts three tracks below the last, so the rows interlock (no negative margins). Each child
 * is placed in a cell that's two columns wide; give it .shape-hexagon (or anything with the hexagon's proportions).
 * @param {number} [perRow=5] - Hexagons a row; every other row starts half a hexagon in.
 * @param {number[][]} [at] - Instead of rows: [row, column] for each child, column in half hexagons from the left
 *   (e.g. a flower: [[0,1],[0,3],[1,0],[1,2],[1,4],[2,1],[2,3]]).
 * @param {number} [gap=.94] - Each hexagon's scale in its cell: the gap between them.
 */
const HexGrid = ({ perRow = 5, at, gap = .94, className, style, children, 'data-name': name }) => {
  const items = Children.toArray(children);
  const place = (i) => at ? at[i] : [ Math.floor(i / perRow), (i % perRow) * 2 + Math.floor(i / perRow) % 2 ];
  const cols = at ? Math.max(...at.map(([ , c ]) => c)) + 2 : perRow * 2 + 1;
  return (
    <div data-component="hex-grid" data-name={name} className={cx('grid fixed gap-0', className)} style={{ '--cols': cols, gridAutoRows: '1fr', ...style }}>
      {items.map((child, i) => {
        const [ row, col ] = place(i);
        return (
          <div key={child.key ?? i} className="grid" style={{ gridRow: `${row * 3 + 1} / span 4`, gridColumn: `${col + 1} / span 2`, scale: gap }}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

/**
 * HexFlip: a hexagon that turns over on hover or focus, front to back (a card flip in 3D).
 * @param {React.ReactNode} front @param {React.ReactNode} back
 * @param {string} [frontClass='bg-gradient'] @param {string} [backClass='bg-primary-darker'] - Their colors.
 * @param {string} [label] - Its name for screen readers (a person's name and role): what both faces say, read once.
 */
const HexFlip = ({ front, back, frontClass = 'bg-gradient', backClass = 'bg-primary-darker', label }) => {
  const [ flipped, setFlipped ] = useState(false);
  const face = { backfaceVisibility: 'hidden', gridArea: '1 / 1' };
  return (
    <div data-component="hex-flip" className="grid" tabIndex={0} aria-label={label} onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}
      onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
      style={{ transformStyle: 'preserve-3d', transform: `perspective(40rem) rotateY(${flipped ? 180 : 0}deg)`,
        transition: 'transform var(--duration-slow) ease-in-out', cursor: 'pointer' }}>
      <div className={cx('shape-hexagon col-center text-center', frontClass)} style={face}>{front}</div>
      <div className={cx('shape-hexagon col-center text-center pad-x-sm', backClass)} style={{ ...face, transform: 'rotateY(180deg)' }}>{back}</div>
    </div>
  );
}

/**
 * Timeline: events down a gradient line, each marked by a hexagon with its icon and told in a card that points at it.
 * @param {{ date: string, title: string, text?: React.ReactNode, icon?: string }[]} events
 */
const Timeline = ({ events, className, style }) => (
  <ol data-component="timeline" className={cx('list-plain grid cols-1 gap-0', className)} style={style}>
    {events.map((e, i) => (
      <li key={i} className="grid gap-0" style={{ gridTemplateColumns: '2.5rem auto minmax(0, 1fr)' }}>
        {/* The line (the full height of the row, so the rows join up) with the marker over it. */}
        <div className="stack">
          <div className="bg-gradient h-100" style={{ width: '2px', justifySelf: 'center',
            ...(i === 0 && { marginTop: '1.25rem' }), ...(i === events.length - 1 && { height: '1.25rem' }) }} />
          <div className="shape-hexagon bg-gradient col-center self-start" style={{ width: '2.5rem' }}>
            <Icon name={e.icon ?? 'circle'} style={{ fontSize: '.8em' }} />
          </div>
        </div>
        <div className="shape-triangle-left self-start bg-primary-tint" style={{ width: '.75rem', marginTop: '.85rem', marginLeft: '.5rem' }} />
        <div className="round pad grid cols-1 gap-0 bg-primary-tint" style={{ marginBottom: 'var(--space)' }}>
          <small className="text-primary fw-bold">{e.date}</small>
          <strong>{e.title}</strong>
          {e.text && <p className="opacity-75">{e.text}</p>}
        </div>
      </li>
    ))}
  </ol>
);

/**
 * StatCard: a number that matters, with an icon in a ring (70% of its width) and a label, all centered. No box of its
 * own (T-033): it goes inside a Card, which gives it the background, corners, padding and hover; a group of Cards in a
 * .bg-gradient-run grid (colors.css) runs one gradient through them all. Its content is in the page's text color
 * (--body-color: light in dark mode, dark in light mode), so it reads on the mode's shades of the gradient.
 * @param {Object} props
 * @param {string} props.icon @param {React.ReactNode} [props.value] - The big line (a number, or a name).
 * @param {string} [props.label] - Small, under it.
 * @param {boolean} [props.accent] - The ring and icon in the theme gradient (for cards on a plain surface, where
 *   the gradient is the accent instead of the background).
 * @param {number} [props.fill] - 0..100: how far the light ring round the icon fills (a progress ring); without it
 *   the ring is a plain outline.
 * @param {React.ReactNode} [props.text] - A line or two under the label.
 * @param {React.ReactNode} [props.children] - Actions (buttons), in a row at the bottom.
 * @param {string} [props.className]
 * @param {string} [props.name] - Which card this is (data-name), when there are several: "humidity".
 */
const StatCard = ({ icon, value, label, accent, fill, text, children, className, name }) => (
  <div data-component="stat-card" data-name={name} className={cx('cq grid cols-1 gap-lg text-center', className)}
    style={{ minHeight: '7rem', color: 'var(--body-color)', gridTemplateRows: '1fr auto' }}>
    {/* Two rows: the content, then the actions pinned to the bottom, so buttons line up across a row of cards. */}
    <div className="grid cols-1 gap-lg justify-center content-start">
      {/* The icon inside a ring (.shape-ring), 70% of the card's width (at most 12rem on wide cards): a faint full
          circle, and over it the filled part, if any. The ring is a container (.cq), so the icon scales with it. */}
      <div className="stack cq" style={{ width: 'min(70%, 12rem)', aspectRatio: 1, placeItems: 'center' }}>
        <div className="shape-ring w-100" style={{ '--ring-hole': '85%', background: accent ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'color-mix(in srgb, currentColor 25%, transparent)' }} />
        {fill != null && <div className="shape-ring w-100" style={{ '--ring-hole': '85%', background: `conic-gradient(currentColor ${fill}%, transparent 0)` }} />}
        <Icon name={icon} className={accent ? 'text-gradient' : undefined} style={{ fontSize: '31cqi', '--icon-size': '1.2em' }} />
      </div>
      <div className="grid cols-1 gap-0 w-100">
        {value != null && <strong className="display-sm">{value}</strong>}
        {label && <small className="text-truncate opacity-75">{label}</small>}
      </div>
      {text && <div className="opacity-75">{text}</div>}
    </div>
    {children && <div className="row-wrap gap-sm w-100">{children}</div>}
  </div>
);

export { HexGrid, HexFlip, Timeline, StatCard };
