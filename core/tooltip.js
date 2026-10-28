import { place, keepPlaced } from './place';

/**
 * tooltip: shows tip (a popover="manual" element) beside trigger while the mouse is on the trigger or it has
 * keyboard focus, placed by place() in the same frame it opens; Esc hides it. interactive: it stays while the
 * pointer moves from the trigger into it (a hover card). Touch has no hover: a tap that focuses the trigger shows it.
 * React: Tooltip (components/ui/popover.js); the plain-JS engine: [data-component="tooltip"] (core/components.js).
 * @param {HTMLElement} tip @param {HTMLElement} trigger
 * @param {{ side?: string, delay?: number, interactive?: boolean }} [opts] - side: 'top' (default), 'bottom', 'left',
 *   'right'. delay: ms on the trigger before it shows (150).
 * @returns {() => void} Stops.
 */
const tooltip = (tip, trigger, { side = 'top', delay = 150, interactive = false } = {}) => {
  let timer;
  const isOpen = () => tip.matches(':popover-open');
  const open = () => {
    if (!trigger.isConnected || isOpen()) return;
    tip.showPopover();
    place(tip, trigger, side);
  };
  const show = (wait) => { clearTimeout(timer); timer = setTimeout(open, wait); };
  const hide = (wait) => { clearTimeout(timer); timer = setTimeout(() => isOpen() && tip.hidePopover(), wait); };
  const linger = interactive ? 200 : 0; // time to move the pointer from the trigger into the card

  const on = [
    [ trigger, 'pointerenter', (e) => e.pointerType === 'mouse' && show(delay) ],
    [ trigger, 'pointerleave', (e) => e.pointerType === 'mouse' && hide(linger) ],
    [ trigger, 'focusin', () => show(0) ],
    [ trigger, 'focusout', () => hide(0) ],
    [ document, 'keydown', (e) => e.key === 'Escape' && isOpen() && tip.hidePopover() ],
    ...(interactive ? [ [ tip, 'pointerenter', () => clearTimeout(timer) ], [ tip, 'pointerleave', () => hide(linger) ] ] : []),
  ];
  on.forEach(([ target, type, fn ]) => target.addEventListener(type, fn));
  const stopPlacing = keepPlaced(tip, () => trigger, side);
  return () => {
    clearTimeout(timer);
    on.forEach(([ target, type, fn ]) => target.removeEventListener(type, fn));
    stopPlacing();
  };
};

export { tooltip };
