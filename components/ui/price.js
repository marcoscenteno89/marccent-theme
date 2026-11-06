import { cx } from '../../lib/cx';
import '../../styles/components/price.css';

/*
 * Price: an amount as price tags set it, its currency sign and cents raised and small ($19⁹⁹), a period after it
 * (/mo) and an old price struck through before it. In any currency and locale (Intl): a sign the locale puts after
 * the amount sits on the line (19⁵⁰ €). Whole amounts show no cents. Screen readers hear it whole ("$19.99, per mo,
 * was $29"). Plain markup, no script: a server writes the same (styles/components/price.css).
 */

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
  const parts = format(amount).formatToParts(amount);
  const said = [ format(amount).format(amount), per && `per ${ per }`, was != null && `was ${ format(was).format(was) }` ].filter(Boolean).join(', ');
  return (
    <span data-component="price" className={cx('price', className)}>
      <span className="visually-hidden">{said}</span>
      {was != null && <s className="price-was" aria-hidden="true">{format(was).format(was)}</s>}
      <span className="price-now" aria-hidden="true">
        {parts.map((p, i) => (p.type === 'currency' ? <span key={i} className={cx('price-currency', i > 0 && 'price-currency-end')}>{p.value}</span>
          : p.type === 'fraction' ? <span key={i} className="price-cents">{p.value}</span>
          : p.type === 'decimal' || p.type === 'literal' ? null
          : <span key={i} className="price-amount">{p.value}</span>))}
        {per && <span className="price-per">/{per}</span>}
      </span>
    </span>
  );
};

export { Price };
