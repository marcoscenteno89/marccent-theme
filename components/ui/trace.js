// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.

/**
 * Trace: an outline drawn as SVG over its parent, for the stroke-based hover effects (hover-trace, hover-dash in
 * styles/hovers.css); without one of those classes on the parent it isn't drawn. pathLength 100 makes dash lengths
 * percentages of the outline, so the same effect fits any size. Decorative (aria-hidden). Button adds one with
 * its trace prop; anywhere else, put it inside the element.
 */
const Trace = () => (
  <svg className="trace" aria-hidden="true"><rect pathLength="100" /></svg>
);

export { Trace };
