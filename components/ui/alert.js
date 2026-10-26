// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import { cx } from '../../lib/cx';

/**
 * Alert: a message in the page about something that just happened. No CSS of its own: utility classes give the
 * box (pad border round) and the tone's fill (bg-<tone>, the mode shade: lighter in light mode, darker in dark mode).
 * Its real job is the role, which makes screen readers announce it when it appears: "alert" (interrupts) for
 * danger, "status" (waits for a pause) for every other tone.
 * @param {Object} props
 * @param {"primary"|"secondary"|"success"|"danger"|"info"} [props.tone="primary"]
 * @param {string} [props.className] - Extra classes; a bg-* class here replaces the tone's fill.
 * @param {boolean} [props.active=true] - false renders nothing.
 * @param {React.ReactNode} [props.children]
 */
const Alert = ({ active = true, tone = 'primary', className, children }) => {
  if (!active) return null;
  const fill = /\bbg-/.test(className ?? '') ? null : `bg-${tone}`;
  return <div data-component="alert" role={tone === 'danger' ? 'alert' : 'status'} className={cx('pad border round', fill, className)}>{children}</div>;
}

export { Alert };
