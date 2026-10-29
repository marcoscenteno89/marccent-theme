// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import { Link } from '../../lib/link';
import { cx } from '../../lib/cx';
import { Icon } from './icon';
import { Trace } from './trace';
import '../../styles/components/button.css';

// Each state's icon, color class and what the live region says.
const STATES = {
  loading: { icon: 'fa-solid fa-circle-notch fa-spin', say: 'Working…' },
  done: { icon: 'check', color: 'success', say: 'Done' },
  error: { icon: 'triangle-exclamation', color: 'danger', say: 'Failed' },
};

/**
 * Button: icon on the left, label on the right (styles: .btn / .btn-text / .btn-link in styles/components/button.css).
 * With an icon it looks like a button; the label hides below 8rem, leaving the icon, so the label is also
 * its aria-label/title. Without an icon it looks like a plain text link.
 * Renders a <Link> (lib/link.js: an <a>, or the router's link) when href is given, otherwise a <button type="button">.
 * Icon-only buttons need an aria-label.
 *
 * State (a button that does something that takes a while: send, save): state="loading" swaps the icon for a spinner
 * and disables it, "done" shows a check in the success color, "error" a warning in the danger color, "idle" is the
 * plain button. A hidden live region says so to screen readers; pass "idle" rather than nothing at rest, so the region
 * is already there when the state changes (a region that appears with its text isn't always read). Form drives it for
 * its submit button. Give it an icon, so nothing moves.
 *
 * @param {{ icon?: string|false, href?: string, disabled?: boolean, state?: 'idle'|'loading'|'done'|'error', className?: string, children?: React.ReactNode, trace?: boolean, [attr: string]: any }} props
 *   icon: an icon name, rendered with <Icon> (above): "star" → fa-solid fa-star. Starting with "fa-" it is taken
 *   as full classes instead, for other families or extra classes: "fa-brands fa-github", "fa-solid fa-plus display".
 *   href: makes it a link. disabled: can't be used (faded; a link loses its href and leaves the tab order, since
 *   <a> has no disabled attribute). className: extra classes. children: the label. trace: adds an SVG outline (Trace) for
 *   the stroke hover effects (hover-trace, hover-dash). Any other prop (type, onClick, aria-*…) goes on the element.
 * @returns {JSX.Element}
 *
 * @example <Button icon="message" href="/contact">Message Me</Button>
 * @example <Button icon="fa-brands fa-github" href={github}>Github</Button>
 * @example <Button onClick={reset}>Start Over</Button>  // text link
 */
const Button = ({ icon = false, href, disabled = false, state, className, children, trace = false, 'data-component': component = 'button', ...rest }) => {
  const now = STATES[state];
  if (now) {
    icon = now.icon;
    className = cx(className, now.color);
    disabled ||= state === 'loading';
    rest = { 'aria-busy': state === 'loading' || undefined, 'data-state': state, ...rest };
  }
  // A disabled link: no href (nothing to follow), out of the tab order, announced as disabled.
  const off = disabled && href ? { 'aria-disabled': true, tabIndex: -1 } : {};
  // What it is, in the HTML (README: In the HTML): "button", or what's built on it ("toggle-button"…) passing its
  // own; data-name, which one, goes through with the rest.
  rest = { 'data-component': component, ...rest };
  if (!icon) {
    const cls = cx('btn-link', disabled && 'disabled', className);
    if (href) return disabled ? <a className={cls} {...off} {...rest}>{children}</a> : <Link href={href} className={cls} {...rest}>{children}</Link>;
    return <button type="button" className={cls} disabled={disabled} {...rest}>{children}</button>;
  }
  const label = typeof children === 'string' ? children : undefined;
  const props = {
    className: cx('btn', disabled && href && 'disabled', className),
    ...(children && { 'aria-label': label, title: label }), // the label may hide, so it is also the accessible name
    ...rest,
  };
  const content = (
    <>
      <ButtonIcon icon={icon} />
      {children && <span className="btn-text">{children}</span>}
      {trace && <Trace />}
      {state !== undefined && <span role="status" className="visually-hidden">{now?.say}</span>}
    </>
  );
  if (href) return disabled ? <a {...props} {...off}>{content}</a> : <Link href={href} {...props}>{content}</Link>;
  return <button type="button" disabled={disabled} {...props}>{content}</button>;
}

// A Button's icon: a name ("star") or full classes ("fa-brands fa-github").
const ButtonIcon = ({ icon }) => icon.startsWith('fa-')
  ? <Icon family={false} className={cx(icon, 'btn-icon')} />
  : <Icon name={icon} className="btn-icon" />;

export { Button, ButtonIcon };
