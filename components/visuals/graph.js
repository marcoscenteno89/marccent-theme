'use client';
import { GraphCanvas } from './canvas';
import '../../styles/components/graph.css';

/**
 * Graph: a price chart with its frame. The chart (core/canvas.js Chart: the closing prices as a line, a crosshair
 * whose day and price show in the readout above it) beside a column of prices, a row of dates under both. The layout
 * and the date row's thinning are the theme's (styles/components/graph.css), so a site writes none.
 *
 * @param {Object} props
 * @param {{ data: Array<{ Date: { format: Function }, Close: number }>, min: number, max: number }} props.data -
 *   The ticker: a day per item (its Date a dayjs date), and the price range to draw (with room above and below).
 * @param {number} [props.base=100] - Price steps from min to max (the hover grid's rows); the column labels every 10th.
 * @param {string} [props.className] - Extra classes on the frame (a surface: bg border round pad).
 *
 * @example <Graph data={{ data: days, min, max }} className="bg border round pad" />
 */
const Graph = ({ data, base = 100, className }) => {
  const step = (data.max - data.min) / base;
  const labels = Math.floor(base / 10);
  return (
    <div data-component="graph" className={['graph', className].filter(Boolean).join(' ')}>
      <div className="grid cols-1 gap-0">
        <GraphCanvas obj={data} pts={step} base={base} />
      </div>
      <div className="graph-prices" aria-hidden="true">
        {Array.from({ length: labels }, (_, i) => data.min + (labels - 1 - i) * step * 10).map((price, i) => (
          <div key={i}>{Math.trunc(price)}</div>
        ))}
      </div>
      <div className="graph-dates" aria-hidden="true">
        {data.data.map((day, i) => <div key={i}><div>{day.Date.format('DD')}</div><div>{day.Date.format('MM')}</div></div>)}
      </div>
    </div>
  );
};

export { Graph };
