'use client';
import { useEffect, useRef } from 'react';
import { cx } from '../../lib/cx';
import { countUp, formatCount } from '../../core/count-up';

/**
 * CountUp: a number that counts up from 0 the first time it scrolls into view (core/count-up.js). The markup holds
 * the final number, so crawlers, visitors without JavaScript and those who ask for reduced motion read the real one.
 * @param {Object} props
 * @param {number} props.to - The number it ends on.
 * @param {number} [props.decimals=0] - Digits after the point.
 * @param {string} [props.prefix] - Before it: "$".
 * @param {string} [props.suffix] - After it: "+", "M", "%".
 * @param {number} [props.duration=1600] - How long it counts, in milliseconds.
 * @param {string} [props.locale='en-US'] - Its grouping and decimal point.
 * @param {string} [props.className]
 *
 * @example <CountUp to={12480.52} decimals={2} prefix="$" />
 */
const CountUp = ({ to, decimals = 0, prefix = '', suffix = '', duration = 1600, locale = 'en-US', className }) => {
  const ref = useRef(null);
  useEffect(() => countUp(ref.current), [ to, decimals, prefix, suffix, duration, locale ]);
  return (
    <span ref={ref} data-component="count-up" className={cx('nums-tabular', className)} data-to={to}
      data-decimals={decimals || undefined} data-prefix={prefix || undefined} data-suffix={suffix || undefined}
      data-duration={duration === 1600 ? undefined : duration} data-locale={locale === 'en-US' ? undefined : locale}>
      {formatCount(to, { decimals, prefix, suffix, locale })}
    </span>
  );
};

export { CountUp };
