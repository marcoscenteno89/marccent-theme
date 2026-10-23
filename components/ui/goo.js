// Shared: no 'use client' (no state or effects), so it renders on the server or in the browser, wherever it's used.

/**
 * Goo: the SVG filter that melts shapes that touch into one (blur, then sharpen the edge again). Rendered once in
 * the layout; hover-goo (styles/hovers.css) uses it as filter: url(#goo). A 0-size svg, not display: none, which
 * would switch the filter off in some browsers.
 */
const Goo = () => (
  <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
    <filter id="goo">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
    </filter>
  </svg>
);

export { Goo };
