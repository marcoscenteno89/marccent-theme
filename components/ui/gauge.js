import { cx } from '../../lib/cx';
import '../../styles/components/gauge.css';

/*
 * Gauge: one value between 0 and a maximum, on a dial. Markup and CSS only (gauge.css): the value is --gauge-value (0
 * to 1) on the root, and the dial fills (ring) or the needle swings (speedometer) to it from 0 as the page shows it,
 * so a server writes the same markup and nothing needs a script. The number is the value as given.
 */

const clamp = (n) => Math.min(Math.max(n, 0), 1);

/**
 * @param {Object} props
 * @param {number} props.value - The value, 0 to maximum.
 * @param {number} [props.maximum=100]
 * @param {'ring'|'speedometer'} [props.face='ring'] - ring: a ring that fills clockwise round the number, in the theme
 *   gradient; speedometer: a half dial from the success color to the danger color, with ticks and a needle, the number
 *   under it.
 * @param {string} [props.unit] - After the number: "%", "ms", "FICO®".
 * @param {string} [props.label] - Under the number, and what screen readers hear it measures.
 * @param {string} [props.className]
 *
 * @example <Gauge value={73} unit="%" label="Activated" />
 * @example <Gauge face="speedometer" value={742} maximum={850} label="Very good" />
 */
const Gauge = ({ value, maximum = 100, face = 'ring', unit, label, className }) => (
  <div data-component="gauge" data-face={face} className={cx('gauge', `gauge-${face}`, className)} role="meter"
    aria-valuenow={value} aria-valuemin={0} aria-valuemax={maximum} aria-label={label || undefined}
    style={{ '--gauge-value': Number(clamp(value / maximum).toFixed(4)) }}>
    <div className="gauge-dial" aria-hidden="true">
      {face === 'speedometer' && <><i className="gauge-ticks" /><i className="gauge-needle" /><i className="gauge-hub" /></>}
    </div>
    <div className="gauge-readout">
      <span><strong className={face === 'speedometer' ? 'display-sm' : 'fs-lg'}>{value}</strong>{unit && <span className="gauge-unit">{unit}</span>}</span>
      {label && <small className="gauge-label">{label}</small>}
    </div>
  </div>
);

export { Gauge };
