'use client';
import { useState, Children } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/icon';

/*
 * Layout widgets: honeycombs (HexGrid, HexWall), a timeline and cards (TicketCard, StatCard, ImageCard). No CSS of their own: grid, stack,
 * shape and color classes, and inline styles for what only the component knows (positions, sizes, turns).
 */

// A light wash of the primary over the surface: cards that sit on a .bg panel still stand out from it.
const TINT = 'color-mix(in srgb, var(--primary) 14%, var(--surface))';
// Text on TINT: the page's, also when the card sits in a colored band.
const ON_TINT = 'var(--body-color)';

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
 * HexWall: a team or skills wall: a honeycomb of HexFlips, each showing an icon (or initials) and turning over to
 * the name and role.
 * @param {{ name: string, role?: string, icon?: string, initials?: string }[]} people
 * @param {number} [perRow=4]
 */
const HexWall = ({ people, perRow = 4, className, style }) => (
  <HexGrid data-name="hex-wall" perRow={perRow} className={className} style={style}>
    {people.map((p, i) => (
      <HexFlip key={p.name} label={`${p.name}${p.role ? `, ${p.role}` : ''}`}
        frontClass={[ 'bg-gradient', 'bg-primary', 'bg-secondary', 'bg-gradient-darker' ][i % 4]}
        front={p.icon ? <Icon name={p.icon} className="fs-lg" /> : <strong className="fs-lg">{p.initials}</strong>}
        back={<><strong>{p.name}</strong>{p.role && <small>{p.role}</small>}</>} />
    ))}
  </HexGrid>
);

/**
 * Timeline: events down a gradient line, each marked by a hexagon with its icon and told in a card that points at it.
 * @param {{ date: string, title: string, text?: React.ReactNode, icon?: string }[]} events
 */
const Timeline = ({ events, className, style }) => (
  <ol data-component="timeline" className={cx('grid cols-1 gap-0', className)} style={{ margin: 0, padding: 0, listStyle: 'none', ...style }}>
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
        <div className="shape-triangle-left self-start" style={{ width: '.75rem', marginTop: '.85rem', marginLeft: '.5rem', background: TINT }} />
        <div className="round pad grid cols-1 gap-0" style={{ marginBottom: 'var(--space)', background: TINT, color: ON_TINT }}>
          <small className="text-primary fw-bold">{e.date}</small>
          <strong>{e.title}</strong>
          {e.text && <p className="opacity-75">{e.text}</p>}
        </div>
      </li>
    ))}
  </ol>
);

/**
 * TicketCard: a card shaped as a ticket (.shape-ticket, notches at mid-height), split by a dashed tear line: the top
 * half has a small label, a big title, a note and the action; the bottom half a list. A pricing plan, an event pass,
 * a feature, a coupon… ribbon adds a corner ribbon with any text.
 * @param {Object} props
 * @param {string} [props.label] - Small, uppercase, above the title (a plan name, a date, a category).
 * @param {React.ReactNode} props.title - The big line (a price, an event name, a number).
 * @param {React.ReactNode} [props.note] - Small, after the title ("a month", a place).
 * @param {(string|{ icon: string, text: string })[]} [props.items] - The list under the tear line; a string gets a
 *   check icon.
 * @param {React.ReactNode} [props.action] - e.g. a <Button>.
 * @param {string} [props.ribbon] - Corner ribbon text ("Popular", "Sold out", "New").
 */
const TicketCard = ({ label, title, note, items = [], action, ribbon, className }) => (
  <div data-component="ticket-card" className={cx('stack hover-holographic', className)}>
    <div className="shape-ticket grid cols-1 gap-0" style={{ aspectRatio: 'auto', '--notch': '1rem', gridTemplateRows: '1fr 1fr', background: TINT, color: ON_TINT }}>
      {/* Two equal rows, so the tear line between them runs between the notches. */}
      <div className="grid cols-1 gap-sm pad text-center" style={{ alignContent: 'center', borderBottom: '2px dashed var(--border-color)' }}>
        {label && <strong className="text-uppercase opacity-75">{label}</strong>}
        <div><span className="display text-primary fw-bold">{title}</span>{note && <small className="opacity-75"> {note}</small>}</div>
        {action}
      </div>
      <ul className="grid cols-1 gap-sm pad" style={{ alignContent: 'center' }}>
        {items.map(item => {
          const { icon, text } = typeof item === 'string' ? { icon: 'check', text: item } : item;
          return <li key={text} className="grid auto-cols gap-sm items-center"><Icon name={icon} className="text-secondary" />{text}</li>;
        })}
      </ul>
    </div>
    {ribbon && (
      <span className="shape-ribbon bg-gradient col-center fw-bold fs-sm self-start"
        style={{ justifySelf: 'end', aspectRatio: 'auto', padding: '.3rem 1.5rem', marginTop: '1rem' }}>{ribbon}</span>
    )}
  </div>
);

/**
 * StatCard: a number that matters, with an icon in a ring (70% of the card's width) and a label, all centered. Its
 * content is in the page's text color (--body-color: light in dark mode, dark in light mode), so it reads on the
 * mode's shades of the gradient. No background of its own: put a group of them in a
 * .bg-gradient-run grid (colors.css) and one gradient runs through them all, or give each a bg-* class.
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
  <div data-component="stat-card" data-name={name} className={cx('cq round shadow pad grid cols-1 gap-lg text-center hover-holographic', className)}
    style={{ minHeight: '7rem', color: 'var(--body-color)', gridTemplateRows: '1fr auto' }}>
    {/* Two rows: the content, then the actions pinned to the bottom, so buttons line up across a row of cards. */}
    <div className="grid cols-1 gap-lg justify-center" style={{ alignContent: 'start' }}>
      {/* The icon inside a ring (.shape-ring), 70% of the card's width (at most 12rem on wide cards): a faint full
          circle, and over it the filled part, if any. The ring is a container (.cq), so the icon scales with it. */}
      <div className="stack cq" style={{ width: 'min(70%, 12rem)', aspectRatio: 1, placeItems: 'center' }}>
        <div className="shape-ring w-100" style={{ '--ring-hole': '85%', background: accent ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'color-mix(in srgb, currentColor 25%, transparent)' }} />
        {fill != null && <div className="shape-ring w-100" style={{ '--ring-hole': '85%', background: `conic-gradient(currentColor ${fill}%, transparent 0)` }} />}
        <Icon name={icon} className={accent ? 'text-gradient' : undefined} style={{ fontSize: '31cqi', '--icon-size': '1.2em' }} />
      </div>
      <div className="grid cols-1 gap-0 w-100">
        {value != null && <strong className="display-sm">{value}</strong>}
        {label && <small className="text-truncate" style={{ opacity: .85 }}>{label}</small>}
      </div>
      {text && <div style={{ opacity: .85 }}>{text}</div>}
    </div>
    {children && <div className="row-wrap gap-sm w-100">{children}</div>}
  </div>
);

// ImageCard overlays: what sits between the photo and the content. Values only the card knows, so inline.
const FADE = 'linear-gradient(to top, rgb(0 0 0 / .8), rgb(0 0 0 / .35) 45%, transparent 75%)';
const SOFT = 'linear-gradient(to top, rgb(0 0 0 / .55), transparent 60%)';
const BLUR_MASK = { blur: 'linear-gradient(to top, #000 40%, transparent 72%)', focus: 'radial-gradient(circle at 50% 45%, transparent 28%, #000 60%)' };
// Dark frosted glass: the light text reads on it even over a white photo (snow, sky).
const GLASS = { background: 'rgb(10 14 22 / .32)', border: '1px solid rgb(255 255 255 / .22)', borderRadius: 'var(--radius)',
  WebkitBackdropFilter: 'blur(14px) saturate(160%)', backdropFilter: 'blur(14px) saturate(160%)', boxShadow: 'inset 0 1px 0 rgb(255 255 255 / .35)' };

/**
 * ImageCard: a photo that fills the card, with its text and buttons in front of it. The light text always sits on
 * something dark or frosted, so it reads on any photo in light and dark mode. The photo is a layer of a .stack, so the
 * card's size comes from ratio (or its grid cell), not from the photo.
 * @param {Object} props
 * @param {string} props.src - The photo, e.g. "/img/blue1.webp". @param {string} [props.alt=""] - Empty: decorative.
 * @param {string} [props.canvas] - Instead of a photo, a live canvas animation by name ("blob", "snow"…: an animation
 *   element, visuals/canvas-scanner.js), on the page surface. With src as well, it plays over the photo instead (snow falling
 *   on a winter photo); a soft shadow keeps light particles visible on a light photo. @param {number} [props.fps] - Its frame rate (default 30).
 * @param {string} [props.colors] - The animation's own colors instead of the theme's, comma-separated CSS colors
 *   (data-colors): "#fff" keeps snow white, "#ff3d00, #ffb300" makes fire red and amber, in any theme.
 * @param {string} [props.label] - Small, uppercase, above the title (a category, a place, a date).
 * @param {React.ReactNode} [props.title]
 * @param {React.ReactNode} [props.text] - A line or two under the title.
 * @param {React.ReactNode} [props.children] - Actions (buttons) in a row under the text, or anything else.
 * @param {'fade'|'glass'|'blur'|'focus'|'tint'|'none'} [props.overlay='fade'] - fade: dark up from the bottom.
 *   glass: the content on a frosted panel. blur: the lower part of the photo blurred (progressive), under a fade.
 *   focus: everything blurred but a circle in the middle. tint: the theme gradient over the photo.
 * @param {'start'|'center'|'end'} [props.align='end'] - Where the content sits: top, middle or bottom.
 * @param {React.ReactNode} [props.badge] - A frosted chip in the top corner ("New", "-20%", a distance).
 * @param {boolean} [props.big] - A display-size title, for the large tiles.
 * @param {string} [props.ratio='4 / 5'] - The card's aspect ratio; null to fill its cell instead (give it h-100).
 * @param {string} [props.position='center'] - Which part of the photo stays in view when it's cropped (object-position).
 * @param {'rounded'|'circle'} [props.shape='rounded'] - circle: a round card (give it ratio "1 / 1"); its content is
 *   centered in the square that fits inside the circle (70.7% of its width), so nothing runs into the curve.
 * @param {string} [props.className] @param {Object} [props.style] - e.g. gridRow: 'span 2' in a collage.
 * @example
 * <ImageCard src="/img/teal2.webp" label="Seychelles" title="Turquoise bays" text="Seven nights, three islands." overlay="glass">
 *   <Button icon="plane" className="light">Book</Button>
 * </ImageCard>
 */
const ImageCard = ({ src, canvas, fps, colors, alt = '', label, title, text, children, overlay = 'fade', align = 'end', badge, big, ratio = '4 / 5',
  position = 'center', shape = 'rounded', className, style }) => {
  const circle = shape === 'circle';
  const centered = circle || align === 'center';
  const photo = { objectFit: 'cover', objectPosition: position };
  // blur / focus over a live canvas: a frosted layer (backdrop-filter blurs whatever moves behind it), masked the same way.
  const frost = BLUR_MASK[overlay] && { backdropFilter: 'blur(14px) saturate(120%)', WebkitBackdropFilter: 'blur(14px) saturate(120%)',
    WebkitMaskImage: BLUR_MASK[overlay], maskImage: BLUR_MASK[overlay] };
  return (
    <article data-component="image-card" className={cx('stack round shadow overflow-hidden hover-holographic', circle && 'circle', centered && 'text-center', className)}
      style={{ aspectRatio: ratio ?? undefined, ...style }}>
      {canvas && !src
        ? <div data-component="animation" data-name={canvas} data-fps={fps} data-colors={colors} className="bg w-100 h-100" role={alt ? 'img' : undefined} aria-label={alt || undefined} />
        : <img src={src} alt={alt} loading="lazy" decoding="async" className="w-100 h-100" style={photo} />}
      {canvas && !src && frost && <div style={frost} />}
      {/* blur / focus: the same photo again, blurred and masked, so only part of it is soft. */}
      {src && BLUR_MASK[overlay] && <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-100 h-100"
        style={{ ...photo, filter: 'blur(14px) saturate(120%)', scale: '1.12', WebkitMaskImage: BLUR_MASK[overlay], maskImage: BLUR_MASK[overlay] }} />}
      {overlay === 'tint' && <div className="bg-gradient" style={{ opacity: .55, mixBlendMode: 'multiply' }} />}
      {/* src and canvas: the animation over the photo (and its blur / tint), under the fade and text. */}
      {canvas && src && <div data-component="animation" data-name={canvas} data-fps={fps} data-colors={colors} aria-hidden="true" className="w-100 h-100"
        style={{ filter: 'drop-shadow(0 0 2px rgb(0 0 0 / .45))' }} />}
      {overlay !== 'none' && overlay !== 'glass' && <div style={{ position: 'relative', background: centered ? 'rgb(0 0 0 / .35)' : overlay === 'tint' ? SOFT : FADE }} />}
      {/* The fade, badge and content are positioned (relative), so they paint above the blurred, scaled and blended
          layers, which the browser would otherwise draw on top of anything unpositioned. */}
      {badge && <span className="fs-sm fw-bold self-start" style={{ ...GLASS, position: 'relative', justifySelf: 'end', margin: 'var(--space-sm)', padding: '.2rem .7rem', borderRadius: '99px', color: 'var(--light)' }}>{badge}</span>}
      {(label || title || text || children) && (
        <div className={cx('grid cols-1 gap-sm pad', { start: 'self-start', center: 'self-center', end: 'self-end' }[circle ? 'center' : align])}
          style={{ position: 'relative', color: 'var(--light)', ...(overlay === 'glass' && { ...GLASS, margin: 'var(--space-sm)' }), ...(circle && { width: '70.7%', justifySelf: 'center', padding: 0 }) }}>
          {label && <small className="text-uppercase fw-bold" style={{ letterSpacing: '.15em', opacity: .85 }}>{label}</small>}
          {title && <h3 className={big ? 'display-sm' : 'h4'} style={{ margin: 0, textWrap: 'balance' }}>{title}</h3>}
          {text && <p style={{ margin: 0, opacity: .9 }}>{text}</p>}
          {children && <div className="row-wrap gap-sm" style={centered ? { justifyContent: 'center' } : undefined}>{children}</div>}
        </div>
      )}
    </article>
  );
};

export { HexGrid, HexFlip, HexWall, Timeline, TicketCard, StatCard, ImageCard };
