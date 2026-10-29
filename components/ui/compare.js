'use client';
import { useEffect, useRef } from 'react';
import { cx } from '../../lib/cx';
import { Icon } from './icon';
import { compare } from '../../core/compare';
import '../../styles/components/compare.css';

/**
 * Compare: two pictures of the same thing, one over the other, split by a handle you drag (or move with the arrow
 * keys) to show more of either: before and after, a photo and its edit, light and dark. The handle is a range
 * input over the whole picture, so it works with touch, mouse and keyboard; the behavior is core/compare.js, shared
 * with the plain-JS engine. Both pictures fill the box (media-cover), so give them the same shape.
 *
 * @param {Object} props
 * @param {React.ReactElement} props.before - The left picture (an <img>, a <picture>, a canvas…).
 * @param {React.ReactElement} props.after - The right picture.
 * @param {string} [props.beforeLabel='Before'] @param {string} [props.afterLabel='After'] - Their tags in the corners.
 * @param {number} [props.start=50] - Where the handle starts, in percent from the left.
 * @param {string} [props.label='Before and after'] - The handle's name for screen readers.
 * @param {string} [props.className] - Extra classes. @param {Object} [props.style] - Give it a size or an aspect-ratio.
 *
 * @example <Compare className="round" before={<img src="/old.webp" alt="The kitchen before" />} after={<img src="/new.webp" alt="The kitchen after" />} />
 */
const Compare = ({ before, after, beforeLabel = 'Before', afterLabel = 'After', start = 50, label = 'Before and after', className, style }) => {
  const root = useRef(null);
  useEffect(() => compare(root.current), []);

  return (
    <div ref={root} data-component="compare" className={cx('compare stack overflow-hidden', className)} style={{ '--pos': `${start}%`, ...style }}>
      <div className="compare-after stack">{after}</div>
      <div className="compare-before stack">{before}</div>
      {beforeLabel && <span className="compare-tag pill fs-sm self-start" data-side="before" aria-hidden="true">{beforeLabel}</span>}
      {afterLabel && <span className="compare-tag pill fs-sm self-start" data-side="after" aria-hidden="true">{afterLabel}</span>}
      <div className="compare-handle" aria-hidden="true">
        <span className="compare-knob col-center circle shadow"><Icon name="arrows-left-right" /></span>
      </div>
      <input type="range" className="compare-range" min="0" max="100" defaultValue={start} aria-label={label} />
    </div>
  );
};

export { Compare };
