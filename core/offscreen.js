// What gets watched: page sections, slider slides and the footer.
const WATCH = 'main section, .swiper-slide, #footer';

/**
 * watchOffscreen: CSS animations (loaders, spinning shapes, countdown bars…) keep running when scrolled away, and a
 * page full of them can bring a computer to its knees. This marks every page section, slider slide and the footer
 * data-offscreen while it's off screen, and animations.css pauses every animation inside one. Watches for sections
 * that appear later (navigation, a slider adding slides). Motion run from JavaScript waits on watchInView instead.
 * React: PauseOffscreen (components/pause-offscreen.js). Returns a function that stops.
 * @returns {() => void}
 */
const watchOffscreen = () => {
  const seen = new WeakSet();
  const io = new IntersectionObserver(entries => entries.forEach(e => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
    { rootMargin: '100px' });
  const scan = () => document.querySelectorAll(WATCH).forEach(el => { if (!seen.has(el)) { seen.add(el); io.observe(el); } });
  scan();
  let queued = null;
  const mo = new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = null; scan(); }); });
  mo.observe(document.body, { childList: true, subtree: true });
  return () => { io.disconnect(); mo.disconnect(); if (queued) cancelAnimationFrame(queued); };
};

export { watchOffscreen };
