import { cx } from '../../lib/cx';
import '../../styles/components/radar.css';

/*
 * Radar: values on three or more axes round a web, as an SVG (radar.css colors it). The web is four nested outlines and
 * the axes; the values are one shape in the primary color, grown from the middle as the page shows it; each axis's
 * label and value sit past its end. Markup only, so a server writes the same SVG.
 */

const R = 40; // the web's radius in the 100-unit box, leaving room round it for the labels
const round = (n) => Number(n.toFixed(2));
// [x, y] for radius r at axis i of n (axis 0 at 12 o'clock, clockwise).
const point = (r, i, n) => {
  const a = (i * 360 / n - 90) * Math.PI / 180;
  return [ round(50 + r * Math.cos(a)), round(50 + r * Math.sin(a)) ];
};
const points = (rs, n) => rs.map((r, i) => point(r, i, n).join(',')).join(' ');

/**
 * @param {Object} props
 * @param {{ label: string, value: number }[]} props.axes - Three or more; each value 0 to maximum.
 * @param {number} [props.maximum=100]
 * @param {string} [props.label] - What it shows, for screen readers (they also hear each axis and value).
 * @param {string} [props.className]
 *
 * @example <Radar axes={[ { label: 'Usage', value: 86 }, { label: 'Seats', value: 70 }, { label: 'Support', value: 62 } ]} />
 */
const Radar = ({ axes = [], maximum = 100, label, className }) => {
  const n = axes.length;
  const said = axes.map((a) => `${a.label} ${a.value}`).join(', ');
  return (
    <svg data-component="radar" className={cx('radar', className)} viewBox="-12 -6 124 112" role="img"
      aria-label={label ? `${label}: ${said}` : said}>
      {[ 1, .75, .5, .25 ].map((f) => <polygon key={f} className="radar-web" points={points(Array(n).fill(R * f), n)} />)}
      {axes.map((a, i) => { const [ x, y ] = point(R, i, n); return <line key={i} className="radar-web" x1="50" y1="50" x2={x} y2={y} />; })}
      <polygon className="radar-area" points={points(axes.map((a) => R * Math.min(Math.max(a.value / maximum, 0), 1)), n)} />
      {axes.map((a, i) => {
        const [ x, y ] = point(R + 8, i, n);
        return (
          <text key={i} className="radar-label" x={x} y={y} textAnchor={Math.abs(x - 50) < 1 ? 'middle' : x < 50 ? 'end' : 'start'}
            dominantBaseline="middle" aria-hidden="true">
            {a.label}<tspan className="radar-value" dx="1.5">{a.value}</tspan>
          </text>
        );
      })}
    </svg>
  );
};

export { Radar };
