// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import Link from 'next/link';
import { cx } from '../../lib/cx';
import { Icon } from './icon';
import { Trace } from './trace';
import '../../styles/components/button.css';

/**
 * Button: icon on the left, label on the right (styles: .btn / .btn-text / .btn-link in styles/components/button.css).
 * With an icon it looks like a button; the label hides below 8rem, leaving the icon, so the label is also
 * its aria-label/title. Without an icon it looks like a plain text link.
 * Renders a next/link <Link> when href is given, otherwise a <button type="button">.
 * Icon-only buttons need an aria-label.
 *
 * @param {{ icon?: string|false, href?: string, disabled?: boolean, className?: string, children?: React.ReactNode, trace?: boolean, [attr: string]: any }} props
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
const Button = ({ icon = false, href, disabled = false, className, children, trace = false, ...rest }) => {
  // A disabled link: no href (nothing to follow), out of the tab order, announced as disabled.
  const off = disabled && href ? { 'aria-disabled': true, tabIndex: -1 } : {};
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
      {icon.startsWith('fa-')
        ? <Icon family={false} className={cx(icon, 'btn-icon')} />
        : <Icon name={icon} className="btn-icon" />}
      {children && <span className="btn-text">{children}</span>}
      {trace && <Trace />}
    </>
  );
  if (href) return disabled ? <a {...props} {...off}>{content}</a> : <Link href={href} {...props}>{content}</Link>;
  return <button type="button" disabled={disabled} {...props}>{content}</button>;
}

export { Button };
