import { Fragment } from 'react';
import { cx } from '../../lib/cx';

/*
 * Price: an amount as price tags set it, its currency sign and cents raised and small ($19⁹⁹), a period after it
 * (/mo) and an old price struck through before it. In any currency and locale (Intl): a sign the locale puts after
 * the amount stays on the line (49⁵⁰ €). Whole amounts show no cents. Screen readers hear it whole ("$19.99, per mo,
 * was $29"). Only the theme's classes (.raised, .fs-50, .text-muted, .nums-tabular), so a server writes the same
 * markup and needs no stylesheet of its own.
 */

// The amount's parts as shown: the sign before it and the cents raised and small, a sign after it small on the line.
const Amount = ({ parts }) => parts.map((p, i) => {
  if (p.type === 'decimal') return null;
  if (p.type === 'fraction') return <span key={i} className="raised fs-50">{p.value}</span>;
  if (p.type === 'currency') return <span key={i} className={cx('fs-50', i === 0 && 'raised')}>{p.value}</span>;
  return <Fragment key={i}>{p.value}</Fragment>;
});

/**
 * @param {Object} props
 * @param {number} props.amount
 * @param {string} [props.currency='USD'] - An ISO code: USD, EUR, GBP…
 * @param {string} [props.locale='en-US']
 * @param {string} [props.per] - The period, after a slash: "mo", "yr", "user".
 * @param {number} [props.was] - The old price, struck through.
 * @param {string} [props.className] - Its size is the amount's: fs-*, display-*, h1…
 *
 * @example <Price amount={19.99} per="mo" was={29} className="display" />
 */
const Price = ({ amount, currency = 'USD', locale = 'en-US', per, was, className }) => {
  const format = (n) => new Intl.NumberFormat(locale, { style: 'currency', currency, ...(Number.isInteger(n) && { minimumFractionDigits: 0 }) });
  const said = [ format(amount).format(amount), per && `per ${ per }`, was != null && `was ${ format(was).format(was) }` ].filter(Boolean).join(', ');
  return (
    <span data-component="price" className={cx('nums-tabular', className)}>
      <span className="visually-hidden">{said}</span>
      {was != null && <><s className="fs-50 text-muted" aria-hidden="true"><Amount parts={format(was).formatToParts(was)} /></s>{' '}</>}
      <span aria-hidden="true">
        <Amount parts={format(amount).formatToParts(amount)} />
        {per && <span className="fs-50 text-muted">/{per}</span>}
      </span>
    </span>
  );
};

export { Price };
