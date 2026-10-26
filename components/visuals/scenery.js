// Shared: no 'use client' (no state or effects), so it renders on the server too and its layers can be read anywhere;
// the parallax inside is a client component of its own.
import { Children } from 'react';
import { cx } from '../../lib/cx';
import { Parallax } from './effects';
import { SCENERY } from './scenery-paths';

/*
 * Scenery: detailed silhouette layers to stack into landscapes for parallax landing pages, from these bands back to front:
 * the sky (stars, moon, sun, clouds, wisps, birds, balloons); far away, low on detail (ranges, treeline, farcity,
 * mesas); the middle (mountains, hills, dunes, canyon, buttes, forest, trees, city, waves, surf, palms, farm, cliffs);
 * and nearest, the most detailed, with people, cars and animals (street, meadow, cactus, beach, rim). Neutral on purpose: each layer is the page's text color mixed into its
 * background (one depth level per layer: the front one nearly the text color, the back one nearly the page color), so it reads in light and dark mode and with any theme; its details
 * (snow, lit windows, strata, shaded faces) are washes of the page background (light) and text color (dark) over it,
 * fainter the farther the layer. The ground layers carry a solid strip below them, so a layer moved by parallax never
 * opens a gap at the bottom. Drawn as SVG in a 1440 x 320 box, anchored to the bottom and stretched to the width.
 * The paths are generated once (scenery-paths.gen.mjs, seeded) into scenery-paths.js.
 */

// Every layer gets its own depth level, by its place in the stack: far (1) is the back layer, 0 the front one. The level
// sets how much of the text color it gets: the front one nearly all of it (darkest in light mode, lightest in dark
// mode), the back one almost none (nearly the page color, so the least visible), the ones between spread evenly. It also
// sets how far the layer lags the scroll, how strong its details are (far layers are hazier) and, for ground layers,
// how high it sits (a % of its own height), so far ones show above the nearer ones.
const lerp = (near, far) => (f) => near + (far - near) * f;
const TONE = lerp(90, 10);
const SPEED = lerp(.04, .3);
const DETAIL = lerp(1, .35);
const LIFT = lerp(0, 22);

const tone = (far) => `color-mix(in srgb, var(--body-color) ${TONE(far).toFixed(1)}%, var(--body-bg))`;

// How each part is painted: the layer color, a wash toward the page background or the text, or a line.
const PAINT = {
  base: { fill: 'currentColor' },
  light: { fill: 'var(--body-bg)', style: { opacity: 'calc(var(--detail) * .38)' } },
  dark: { fill: 'var(--body-color)', style: { opacity: 'calc(var(--detail) * .22)' } },
  line: { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round' },
};

/**
 * SceneryLayer: one layer, full width, in its depth's neutral tone (or color, any CSS color).
 * @param {Object} props
 * @param {string} props.kind - A key of SCENERY. @param {string} [props.color]
 * @param {number} [props.far=0] - Its depth level, 0 (front) to 1 (back).
 * @param {boolean} [props.flip] - Mirrored, so the same kind twice in a scene doesn't line up.
 * @param {string} [props.className] @param {Object} [props.style]
 */
const SceneryLayer = ({ kind, far = 0, color, flip, className, style }) => {
  const { ground, clip, parts } = SCENERY[kind];
  // Same id for the same kind everywhere: its outline is the same, so repeats on a page don't conflict.
  const clipId = `scenery-${kind}`;
  return (
    <div data-component="scenery-layer" className={cx('grid cols-1 gap-0 w-100', className)} style={{ color: color ?? tone(far), '--detail': DETAIL(far).toFixed(2),
      alignSelf: ground ? 'end' : 'start', translate: ground ? `0 -${LIFT(far).toFixed(1)}%` : undefined, ...style }}>
      {/* As tall as the width makes it (1440 x 320); a ground layer grows to --scenery-min if that's taller, cropping its
          sides (slice) instead of squashing, so a full-screen or phone-width scene keeps real proportions. The sky stays
          at its own size. cqi: the Scenery's width. */}
      <svg viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" className="w-100" aria-hidden="true"
        style={{ display: 'block', height: ground ? 'max(22.2222cqi, var(--scenery-min, 0px))' : '22.2222cqi', scale: flip ? '-1 1' : undefined }}>
        {clip && <defs><clipPath id={clipId}>{parts.filter(([ t ]) => t === 'base').map(([ , d ], i) => <path key={i} d={d} />)}</clipPath></defs>}
        {parts.map(([ t, d ], i) => <path key={i} d={d} {...PAINT[t]} clipPath={clip && t !== 'base' ? `url(#${clipId})` : undefined} />)}
      </svg>
      {/* Solid ground below, out of sight until parallax lifts the layer. */}
      {ground && <div style={{ height: '8rem', marginTop: '-1px', marginBottom: '-8rem', background: 'currentColor' }} />}
    </div>
  );
}

/**
 * Scenery: layers stacked back to front into one landscape, each lagging the scroll by its depth (parallax: the far
 * ones drift, the near ones hold), clipped to its box. Its own background shows through as the sky; children sit on
 * top, centered (a headline, a button).
 * @param {Object} props
 * @param {string[]} props.layers - Kinds, back to front (sky kinds first); each gets its own depth level, evenly spread
 *   from the back (faintest, drifts most) to the front (strongest, holds).
 * @param {string} [props.height='22rem'] @param {boolean} [props.parallax=true]
 * @param {string} [props.min] - The least height for each ground layer (e.g. '40vh' for a full-screen scene): taller
 *   than the width alone makes it, a layer grows and crops its sides.
 * @param {string} [props.className] @param {Object} [props.style] @param {React.ReactNode} [props.children]
 */
const Scenery = ({ layers, height = '22rem', parallax = true, min, className, style, children }) => (
  <div data-component="scenery" className={cx('cq stack overflow-hidden', className)} style={{ height, '--scenery-min': min, ...style }}>
    {layers.map((kind, i) => {
      const far = layers.length > 1 ? 1 - i / (layers.length - 1) : 0;
      // A kind already used further back is mirrored, so repeats don't line up.
      const flip = layers.slice(0, i).filter(x => x === kind).length % 2 === 1;
      const layer = <SceneryLayer kind={kind} far={far} flip={flip} />;
      return parallax
        ? <Parallax key={i} speed={SPEED(far)} className="stack">{layer}</Parallax>
        : <div key={i} className="stack">{layer}</div>;
    })}
    {Children.count(children) > 0 && <div className="col-center pad text-center" style={{ position: 'relative' }}>{children}</div>}
  </div>
);

export { Scenery, SceneryLayer, SCENERY as SCENERY_PATHS };
