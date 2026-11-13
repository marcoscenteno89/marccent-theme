import { Children } from 'react';
import { cx } from '../../lib/cx';
import '../../styles/components/card-fan.css';

/**
 * CardFan: cards stacked in one spot, each turned a little round a point below them; hovering it or moving focus into it
 * fans them out. Markup and CSS only (card-fan.css): each card sits in a .card-fan-item that knows its place (--i) and
 * the fan its count (--cards), so a server writes the same markup. Its children are the theme's Cards (or a Loop of
 * them); each is 8rem wide (--card-fan-width).
 * @param {number} [spread=14] - Degrees between two cards when fanned out.
 * @param {string} [label='Cards'] - What screen readers hear it is.
 * @param {string} [className]
 * @param {React.ReactNode} children - The cards.
 */
const CardFan = ({ spread = 14, label = 'Cards', className, children }) => {
  const cards = Children.toArray(children);
  return (
    <div data-component="card-fan" className={cx('card-fan', className)} role="group" aria-label={label} tabIndex={0}
      style={{ '--cards': cards.length, '--card-fan-spread': `${spread}deg` }}>
      {cards.map((card, i) => <div key={i} className="card-fan-item" style={{ '--i': i }}>{card}</div>)}
    </div>
  );
};

export { CardFan };
