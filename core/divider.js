import { MORPHS, mask } from '../lib/divider-shapes';
import { watchInView } from './in-view';

/**
 * watchDivider: a section divider that follows the scroll (data-scroll): "parallax" slides and lowers its layers by
 * their data-x / data-y, the far ones most; a morph ("unfold", "seesaw", "rise") redraws its shape. Only while it's
 * on screen, and not at all under reduced motion: it keeps the shape the server drew. The engine runs it for
 * data-component="divider" (core/components.js); the Divider component from an effect. Returns a function that stops.
 * @param {HTMLElement} el
 * @returns {(() => void) | undefined}
 */
const watchDivider = (el) => {
  const kind = el.dataset.scroll;
  if (!kind || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const morph = MORPHS[kind];
  const layers = [ ...el.children ];
  let frame = 0;
  const update = () => {
    frame = 0;
    const r = el.getBoundingClientRect(), vh = window.innerHeight;
    const f = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))); // 0 coming in at the bottom, 1 leaving at the top
    if (morph) {
      layers[0]?.style.setProperty('--mask', mask(morph.d(f)));
      return;
    }
    // Sideways either way of center; down while low on the screen, settling as it rises (never up: no gap opens).
    for (const l of layers) l.style.translate = `${((f - .5) * (l.dataset.x || 0) / 2).toFixed(2)}% ${((1 - f) * (l.dataset.y || 0)).toFixed(1)}px`;
  };
  const onScroll = () => { frame ||= requestAnimationFrame(update); };
  let listening = false;
  const stopWatching = watchInView(el, (inView) => {
    if (inView === listening) return;
    listening = inView;
    if (inView) {
      update();
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
    } else {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    }
  });
  return () => {
    stopWatching();
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onScroll);
    cancelAnimationFrame(frame);
  };
};

export { watchDivider };
