// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.

/**
 * Icon: a Font Awesome icon. Decorative (aria-hidden); give its button or link the accessible name.
 *
 * @param {Object} props
 * @param {string} [props.name] - Icon name without the prefix: "file" → fa-file.
 * @param {string|false} [props.family="fa-solid"] - Style class. Override with "fa-brands" / "fa-regular",
 *   or false to drop it (e.g. when className already carries full classes).
 * @param {string} [props.className] - Extra classes.
 * @param {Object} [props.style] - Inline styles. Any other prop goes on the <i> too.
 * @returns {JSX.Element}
 *
 * @example <Icon name="file" />                              // <i class="fa-solid fa-file">
 * @example <Icon name="github" family="fa-brands" />
 * @example <Icon name="star" className="fs-lg" style={{ color: 'gold' }} />
 * @example <Icon family={false} className="fa-brands fa-linkedin" />  // full classes from data
 */
const Icon = ({ name, family = 'fa-solid', className, ...rest }) => (
  <i className={[family, name && `fa-${name}`, className].filter(Boolean).join(' ')} aria-hidden="true" {...rest} />
);

export { Icon };
