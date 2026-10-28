// The hover effects that follow the cursor (hovers.css: POINTER).
const POINTER = '.hover-tilt, .hover-spotlight, .hover-magnet';
let stop = null;

/**
 * watchPointer: while a mouse moves over an element with a pointer hover effect, writes where it is as --px / --py
 * on that element (0 to 1 from its left / top edge; .5 is the middle), at most once a frame; they go when it leaves.
 * One listener for the whole page; touch and pen are left alone (no hover). Started by SiteTheme and startTheme;
 * once per page, later calls return the same stop function.
 * @returns {() => void} Stops it.
 */
const watchPointer = () => {
  if (stop) return stop;
  let frame = 0;
  let last = null;
  const write = () => {
    frame = 0;
    const { el, x, y } = last;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', ((x - r.left) / r.width).toFixed(3));
    el.style.setProperty('--py', ((y - r.top) / r.height).toFixed(3));
  };
  const move = (e) => {
    const el = e.pointerType === 'mouse' && e.target instanceof Element && e.target.closest(POINTER);
    if (!el) return;
    last = { el, x: e.clientX, y: e.clientY };
    frame ||= requestAnimationFrame(write);
  };
  const leave = (e) => {
    const el = e.target instanceof Element && e.target.closest(POINTER);
    if (el && !el.contains(e.relatedTarget)) {
      el.style.removeProperty('--px');
      el.style.removeProperty('--py');
    }
  };
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerout', leave);
  stop = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerout', leave);
    cancelAnimationFrame(frame);
    stop = null;
  };
  return stop;
};

export { watchPointer };
