// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.

import '../../styles/components/loading.css';

/**
 * Loading: its children once every `require` value is truthy; until then, a loader that fills its parent's width.
 * @param {any[]} require
 * @param {'spinner'|'ring'|'dots'|'bars'|'pulse'|'orbit'|'bar'|'flip'} [kind='spinner'] - spinner: the pulsing dot
 *   (.spinner); the rest: the .loader-* classes (styles/components/loading.css).
 * @param {string} [className] - e.g. text-primary, for the loaders drawn in the text color.
 */
const Loading = ({ require = [], kind = 'spinner', className, children }) => {
  const ready = Object.values(require ?? []).every(Boolean); // an array, or an object of values (withLoader)
  if (ready) return children;
  const look = kind === 'spinner' ? 'square circle spinner' : `loader-${kind}`;
  // Full width; each loader's aspect-ratio (or the bar's own height) sizes it.
  return <div className={[look, className].filter(Boolean).join(' ')} style={{ width: '100%' }} role="status" aria-label="Loading" />;
}

export { Loading };
