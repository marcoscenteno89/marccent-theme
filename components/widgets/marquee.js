import { cx } from '../../lib/cx';
import '../../styles/components/marquee.css';

/**
 * Marquee: a row that scrolls sideways without end (client logos, names, short quotes). Its content is written twice
 * in a row; the row slides by one copy and starts over, so it never shows an end. The second copy is hidden from
 * screen readers and out of the keyboard's reach (aria-hidden, inert). It pauses on hover and keyboard focus, and
 * while off screen (animations.css); with reduced motion it stands still and scrolls by hand instead. No script:
 * a server writes the same markup.
 *
 * @param {Object} props
 * @param {number} [props.duration=30] - Seconds for one copy to pass: more is slower.
 * @param {boolean} [props.reverse] - Moves left to right.
 * @param {string} [props.label] - Its aria-label (what the row is: "Our clients").
 * @param {string} [props.className] - Extra classes (the gap between items: gap-sm…gap-xl, on the row).
 * @param {React.ReactNode} props.children - The items, side by side.
 *
 * @example <Marquee label="Our clients">{logos.map((l) => <img key={l.src} src={l.src} alt={l.name} height="40" />)}</Marquee>
 */
const Marquee = ({ duration = 30, reverse, label, className, children }) => (
  <div data-component="marquee" role={label ? 'group' : undefined} aria-label={label}
    className={cx('marquee', className)} data-reverse={reverse ? '' : undefined}
    style={duration !== 30 ? { '--marquee-duration': `${duration}s` } : undefined}>
    <div className="marquee-track">
      <div className="marquee-group">{children}</div>
      <div className="marquee-group" aria-hidden="true" inert>{children}</div>
    </div>
  </div>
);

export { Marquee };
