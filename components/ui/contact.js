import { cx } from '../../lib/cx';
import { Icon } from './icon';

/*
 * Contact: a phone number, an email address or a street address as a link that does what it says: a call (tel:), an
 * email (mailto:), or the address (<address>). The number's link is its digits (and a leading +), whatever way it's
 * written for reading. An icon before it by default, in an icon row (.layout-icon) that sits in a line of text.
 * Made of plain elements and the theme's classes only, so a server writes the same markup.
 */

const ICONS = { phone: 'phone', email: 'envelope', address: 'location-dot' };

/**
 * @param {Object} props
 * @param {"phone"|"email"|"address"} props.kind
 * @param {string} props.value - "(208) 555-0100", "hello@example.com", "123 Main St, Boise, ID 83702".
 * @param {string} [props.label] - What it reads instead of the value ("Call us").
 * @param {boolean} [props.icon=true] - The kind's icon before it.
 * @param {string} [props.className]
 *
 * @example <Contact kind="phone" value="(208) 555-0100" />
 */
const Contact = ({ kind, value, label, icon = true, className }) => {
  const text = label || value;
  const cls = cx(icon && 'layout-icon d-inline-grid', className) || undefined;
  const inner = <>{icon && <Icon name={ICONS[kind]} />}{icon ? <span>{text}</span> : text}</>;
  if (kind === 'address') {
    return <address data-component="contact" className={cls}>{inner}</address>;
  }
  const href = kind === 'phone' ? `tel:${value.replace(/(?!^\+)[^\d]/g, '')}` : `mailto:${value.trim()}`;
  return <a data-component="contact" href={href} className={cls}>{inner}</a>;
};

export { Contact };
