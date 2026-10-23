// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import { useId } from 'react';
import { cx } from '../../lib/cx';
import '../../styles/components/form.css';

// Readable text from a field name: "first_name" → "first name". A label's first letter is capitalized in CSS
// (.field-label::first-letter); a placeholder can't be (::placeholder has no ::first-letter), so Input does it here.
const nameToLabel = (name) => name.replace(/_/g, ' ');
const sentence = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Input: just the input, its label text shown as the placeholder (and used as aria-label, since a placeholder
 * is not a label and disappears while typing). Default text comes from the name: "first_name" → "First name".
 * @param {{ name: string, label?: string, as?: string, className?: string, children?: React.ReactNode, [attr: string]: any }} props
 *   label: text for the placeholder and aria-label. as: "input" (default), "textarea" or "select" (a select shows no
 *   placeholder; it keeps the aria-label). Any other prop (type, required, placeholder to override, rows…) goes on
 *   the element.
 *
 * @example <Input name="email" type="email" required />  // placeholder "Email"
 */
const Input = ({ name, label, as: Tag = 'input', className, children, ...rest }) => {
  const text = label ?? sentence(nameToLabel(name));
  return (
    <Tag name={name} className={cx('input', className)} aria-label={text}
      placeholder={Tag === 'select' ? undefined : text} {...rest}>{children}</Tag>
  );
}

/**
 * Field: a label joined to its input in one box (.field, styles/components/form.css). The label defaults to the name: "first_name" → "First name".
 * @param {{ name: string, label?: string, as?: string, className?: string, children?: React.ReactNode, [attr: string]: any }} props
 *   as: "input" (default), "textarea" or "select". Any other prop (type, required, placeholder, rows…) goes on the
 *   input.
 */
const Field = ({ name, label, as: Tag = 'input', className, children, ...rest }) => {
  const id = useId();
  return (
    <div className={cx('field sub-x', className)}>
      <label className="field-label" htmlFor={id}>{label ?? nameToLabel(name)}</label>
      <Tag id={id} name={name} className="input" {...rest}>{children}</Tag>
    </div>
  );
}

export { Input, Field };
