// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.
import { useId } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from './icon';
import '../../styles/components/rating.css';

/**
 * Rating: stars to pick a score, a row of radio buttons (one per star) so a plain form post sends it, arrow keys
 * move along it and it needs no JavaScript: the stars up to the picked one fill, and the ones up to the pointer
 * while it's over them (rating.css). The fieldset's legend names it; each star reads "3 stars".
 *
 * @param {Object} props
 * @param {string} props.name - The field's name in the form.
 * @param {string} [props.label='Rating'] - What's rated, for screen readers (the legend).
 * @param {number} [props.max=5] - How many stars.
 * @param {number} [props.defaultValue] - The star picked at first.
 * @param {string} [props.icon='star'] - Any Font Awesome solid icon: "heart", "fire"…
 * @param {(value: number) => void} [props.onChange]
 * @param {string} [props.className] - Extra classes on the fieldset.
 *
 * @example <Rating name="score" label="Rate the talk" defaultValue={4} />
 */
const Rating = ({ name, label = 'Rating', max = 5, defaultValue, icon = 'star', onChange, required, disabled, className }) => {
  const id = useId();
  return (
    <fieldset data-component="rating" className={cx('rating', className)} disabled={disabled}>
      <legend className="visually-hidden">{label}</legend>
      {Array.from({ length: max }, (_, i) => (
        <label key={i} htmlFor={`${id}-${i + 1}`} className="rating-star">
          <input id={`${id}-${i + 1}`} type="radio" name={name} value={i + 1} className="visually-hidden"
            defaultChecked={defaultValue === i + 1} required={required} onChange={onChange && (() => onChange(i + 1))} />
          <Icon name={icon} />
          <span className="visually-hidden">{i + 1 === 1 ? '1 star' : `${i + 1} stars`}</span>
        </label>
      ))}
    </fieldset>
  );
};

/**
 * Stars: a score to read, not pick: max icons, filled to value (fractions too: 3.5 fills three and a half). One
 * image to screen readers: "3.5 out of 5".
 * @param {{ value: number, max?: number, icon?: string, className?: string }} props
 *
 * @example <Stars value={4.3} />
 */
const Stars = ({ value, max = 5, icon = 'star', className }) => {
  const row = Array.from({ length: max }, (_, i) => <Icon key={i} name={icon} />);
  return (
    <span data-component="stars" role="img" aria-label={`${value} out of ${max}`} className={cx('stars stack', className)}
      style={{ '--value': `${(value / max) * 100}%` }}>
      <span className="stars-empty">{row}</span>
      <span className="stars-fill">{row}</span>
    </span>
  );
};

export { Rating, Stars };
