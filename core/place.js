const FLIP = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
const EDGE = 8; // never closer than this to the window's edge

/**
 * place: puts a floating element (a popover in the top layer, position: fixed) next to its anchor, on the side asked
 * for, or the opposite one when that has more room and the asked side is too small. Centered on the anchor along
 * the other axis and kept inside the window. Call it while el is shown (it measures el), and again on scroll and
 * resize. The side it took is data-side on el, for the CSS (the way it slides in).
 * @param {HTMLElement} el @param {Element} anchor
 * @param {'top'|'bottom'|'left'|'right'} [side='top'] @param {number} [gap=8] - Space between the two, in px.
 */
const place = (el, anchor, side = 'top', gap = 8) => {
  const a = anchor.getBoundingClientRect();
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const room = { top: a.top, bottom: vh - a.bottom, left: a.left, right: vw - a.right };
  const need = (side === 'top' || side === 'bottom' ? h : w) + gap + EDGE;
  if (room[side] < need && room[FLIP[side]] > room[side]) {
    side = FLIP[side];
  }
  const across = side === 'top' || side === 'bottom';
  let x = across ? a.left + a.width / 2 - w / 2 : side === 'left' ? a.left - gap - w : a.right + gap;
  let y = across ? (side === 'top' ? a.top - gap - h : a.bottom + gap) : a.top + a.height / 2 - h / 2;
  x = Math.max(EDGE, Math.min(x, vw - w - EDGE));
  y = Math.max(EDGE, Math.min(y, vh - h - EDGE));
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.dataset.side = side;
};

/**
 * keepPlaced: place() each time el (a popover) opens, and on scroll and resize while it's open. Until it's placed
 * the CSS keeps it hidden (.float:not([data-side])), so it never flashes in the browser's default spot. Returns a
 * function that stops.
 * @param {HTMLElement} el @param {() => Element} anchor @param {string} [side='top']
 * @returns {() => void}
 */
const keepPlaced = (el, anchor, side = 'top') => {
  const update = () => {
    const at = anchor();
    if (at && el.matches(':popover-open')) {
      place(el, at, side);
    }
  };
  const toggled = (e) => {
    if (e.newState === 'open') {
      update();
    } else {
      delete el.dataset.side;
    }
  };
  el.addEventListener('toggle', toggled);
  window.addEventListener('scroll', update, { capture: true, passive: true });
  window.addEventListener('resize', update);
  return () => {
    el.removeEventListener('toggle', toggled);
    window.removeEventListener('scroll', update, { capture: true });
    window.removeEventListener('resize', update);
  };
};

export { place, keepPlaced };
