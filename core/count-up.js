import { watchInView } from './in-view';

/**
 * The number as CountUp writes it: prefix, the value with its decimals and the locale's grouping, suffix.
 * @param {number} value @param {{ decimals?: number, prefix?: string, suffix?: string, locale?: string }} [options]
 */
const formatCount = (value, { decimals = 0, prefix = '', suffix = '', locale = 'en-US' } = {}) =>
  `${prefix}${value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;

/**
 * countUp: counts el's number from 0 to its data-to (eased, over data-duration ms, default 1600) the first time el
 * scrolls into view, written as formatCount does with el's data-decimals, data-prefix, data-suffix and data-locale.
 * Leaves the number the markup holds alone for reduced motion. Returns a function that stops it. CountUp
 * (components/ui/count-up.js) and the markup engine (data-component="count-up") both run it.
 * @param {HTMLElement} el
 */
const countUp = (el) => {
  const d = el.dataset;
  const to = Number(d.to);
  const ms = Number(d.duration ?? 1600);
  const options = { decimals: Number(d.decimals ?? 0), prefix: d.prefix ?? '', suffix: d.suffix ?? '', locale: d.locale ?? 'en-US' };
  if (!Number.isFinite(to) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  let frame;
  const stopWatching = watchInView(el, (inView) => {
    if (!inView) return;
    stopWatching();
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / ms, 1);
      el.textContent = formatCount(t < 1 ? to * (1 - (1 - t) ** 3) : to, options);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }, '0px');
  return () => { stopWatching(); cancelAnimationFrame(frame); };
};

export { countUp, formatCount };
