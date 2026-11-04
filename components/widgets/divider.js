'use client';
import { useEffect, useRef } from 'react';
import { watchDivider } from '../../core/divider';
import { cx } from '../../lib/cx';
import DIVIDERS from '../../markup/dividers.json';
import '../../styles/components/divider.css';

/**
 * Divider: a shape on a section's top or bottom edge, in the section's own color, reaching into its neighbor (a wave,
 * peaks, a skyline…). Section renders it from its dividerTop / dividerBottom props; the shapes and what each one
 * takes are in markup/dividers.json (lib/divider-shapes.js). Server hosts write this same markup.
 *
 * @param {Object} props
 * @param {string} props.shape - A shape id: wave, waves, slant, curve, arc, notch, peaks, zigzag, torn, clouds,
 *   hills, mountains, forest, skyline.
 * @param {"top"|"bottom"} [props.edge='top'] - Which edge of its section.
 * @param {"sm"|"md"|"lg"} [props.size='md'] - Its height: 2.5, 4 or 6rem.
 * @param {string} [props.motion] - A motion the shape takes, by itself: roll, tide, swell, breathe.
 * @param {string} [props.scroll] - A scroll effect the shape takes: parallax, unfold, seesaw, rise.
 * @param {boolean} [props.flip] - Mirrored left to right.
 * @param {boolean} [props.page] - In the page's background (its section has none).
 */
const Divider = ({ shape, edge = 'top', size = 'md', motion, scroll, flip, page }) => {
  const ref = useRef(null);
  const def = DIVIDERS[shape];
  const move = def?.motions.includes(motion) ? motion : undefined;
  const follow = def?.scrolls.includes(scroll) ? scroll : undefined;
  useEffect(() => (follow && ref.current ? watchDivider(ref.current) : undefined), [ follow, shape ]);
  if (!def) return null;
  return (
    <div ref={ref} aria-hidden="true" className={cx('divider', `divider-${edge}`, size !== 'md' && `divider-${size}`, page && 'divider-page')}
      data-component="divider" data-shape={shape} data-motion={move} data-scroll={follow} data-flip={flip ? '' : undefined}>
      {def.layers.map((l, i) => (
        <i key={i} style={{ '--mask': l.mask, ...(l.opacity < 1 && { opacity: l.opacity }) }}
          data-x={follow === 'parallax' ? l.x : undefined} data-y={follow === 'parallax' ? l.y : undefined} />
      ))}
    </div>
  );
};

// The classes a section with these dividers takes: it goes over its neighbors, which make room (divider.css).
const dividerClasses = (top, bottom) => cx(
  top?.shape && DIVIDERS[top.shape] && `has-divider-top-${top.size || 'md'}`,
  bottom?.shape && DIVIDERS[bottom.shape] && `has-divider-bottom-${bottom.size || 'md'}`,
);

export { Divider, dividerClasses, DIVIDERS };
