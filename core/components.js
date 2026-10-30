import { define } from './enhance';
import { closeMenus } from './close-menus';
import { keepPlaced } from './place';
import { tooltip } from './tooltip';
import { watchScrolled } from './scrolled';
import { watchInView } from './in-view';
import { fileDrop } from './file-drop';
import { toastSI } from './toasts';

/*
 * The components the markup engine (core/enhance.js) wires up: the same markup the React components render, so a
 * page from PHP, a Django template or plain HTML behaves the same. Each setup is the plain-JS twin of its component's
 * behavior; what the browser does on its own (a <details> dropdown, a popovertarget button, CSS hovers, the dock) needs
 * none. Canvas backgrounds, pointer hovers and paused off-screen animations are page-wide (core/browser.js).
 */

// A Button icon by name ("bars") or full classes ("fa-brands fa-github"), as ButtonIcon renders it.
const iconClass = (icon) => `${icon.startsWith('fa-') ? icon : `fa-solid fa-${icon}`} btn-icon`;
const listen = (target, type, fn, opts) => {
  target.addEventListener(type, fn, opts);
  return () => target.removeEventListener(type, fn, opts);
};
const all = (stops) => () => stops.forEach((stop) => stop?.());

/*
 * Toggle button (ToggleButton): a disclosure (aria-controls → aria-expanded) or a pressed toggle (aria-pressed)
 * flips on click, swaps between data-icon and data-active-icon, and says so with a marccent:toggle event (detail: on)
 * that the nav listens to. A disclosure closes on Esc. One with a panel (popovertarget) is the browser's to open.
 */
define('toggle-button', (btn) => {
  if (btn.hasAttribute('popovertarget')) return;
  const attr = btn.hasAttribute('aria-controls') ? 'aria-expanded' : btn.hasAttribute('aria-pressed') ? 'aria-pressed' : null;
  if (!attr) return;
  const set = (on) => {
    btn.setAttribute(attr, on);
    const icon = on ? btn.dataset.activeIcon : btn.dataset.icon;
    const i = btn.querySelector('.btn-icon');
    if (icon && i) i.className = iconClass(icon);
    btn.dispatchEvent(new CustomEvent('marccent:toggle', { detail: on, bubbles: true }));
  };
  const isOn = () => btn.getAttribute(attr) === 'true';
  return all([
    listen(btn, 'click', () => set(!isOn())),
    attr === 'aria-expanded' && listen(document, 'keydown', (e) => e.key === 'Escape' && isOn() && set(false)),
  ]);
});

/*
 * Toggle button's panel (.toggle-panel, a popover): under its button, following it as the page scrolls; focus moves
 * into it once shown.
 */
define('toggle-panel', (panel) => {
  const button = document.querySelector(`[popovertarget="${panel.id}"]`);
  if (!button) return;
  const place = () => {
    const r = button.getBoundingClientRect();
    panel.style.top = `${r.bottom + 8}px`;
    panel.style.maxHeight = `min(60vh, calc(100dvh - ${r.bottom + 8}px - 1rem))`;
  };
  return all([
    listen(panel, 'beforetoggle', (e) => e.newState === 'open' && place()),
    listen(panel, 'toggle', (e) => e.newState === 'open' && panel.querySelector('select, input, textarea, button, a[href], [tabindex]')?.focus()),
    listen(window, 'scroll', place, { passive: true }),
    listen(window, 'resize', place),
  ]);
});

/*
 * NavBar: its toggle opens the folded menu (.open); dropdowns close on an outside click and Esc (closeMenus); the
 * page's scroll sets data-scrolled. Floating (data-variant="floating"): the pill bar turns solid (bg border shadow)
 * once scrolled or open, and round instead of a pill while open.
 */
define('nav-bar', (nav) => {
  const bar = nav.querySelector(':scope > .layout-ends');
  const floating = nav.dataset.variant === 'floating';
  let open = false;
  let scrolled = false;
  const paint = () => {
    nav.classList.toggle('open', open);
    nav.toggleAttribute('data-scrolled', scrolled);
    if (floating && bar) {
      bar.classList.toggle('pill', !open);
      bar.classList.toggle('round', open);
      [ 'bg', 'border', 'shadow' ].forEach((c) => bar.classList.toggle(c, open || scrolled));
    }
  };
  const toggle = nav.querySelector('.nav-toggle');
  return all([
    closeMenus(nav),
    toggle && listen(toggle, 'marccent:toggle', (e) => { open = e.detail; paint(); }),
    watchScrolled((on) => { scrolled = on; paint(); }),
  ]);
});

// A Menu outside a NavBar: its dropdowns close on an outside click and Esc, and a hover menu opens on hover.
define('menu', (menu) => (menu.closest('[data-component~="nav-bar"]') ? undefined : closeMenus(menu)));

// Tooltip and LinkPreview: the box (role="tooltip") and its trigger (aria-describedby naming it).
define('tooltip', (tip) => {
  const trigger = document.querySelector(`[aria-describedby~="${CSS.escape(tip.id)}"]`);
  if (!trigger) return;
  trigger.removeAttribute('title');
  return tooltip(tip, trigger, { side: tip.dataset.placement, interactive: tip.classList.contains('tooltip-card') });
});

// Popover: the panel beside its button (popovertarget naming it); the browser opens and closes it.
define('popover', (panel) => {
  const button = document.querySelector(`[popovertarget="${CSS.escape(panel.id)}"]`);
  return button ? keepPlaced(panel, () => button, panel.dataset.placement || 'bottom') : undefined;
});

/*
 * Modal and Drawer (a <dialog>): anything on the page with data-opens="<the dialog's id>" opens it (one listener per
 * dialog, so openers added later work too); [data-close] inside closes it, and so does a click on the backdrop.
 */
const dialog = (el) => all([
  listen(document, 'click', (e) => {
    if (el.id && e.target.closest?.(`[data-opens="${CSS.escape(el.id)}"]`) && !el.open) el.showModal();
  }),
  listen(el, 'click', (e) => {
    if (e.target === el || e.target.closest('[data-close]')) el.close();
  }),
]);
define('modal', dialog);
define('drawer', dialog);

// FileDrop: drop zone, checks and the list of chosen files (core/file-drop.js).
define('file-drop', fileDrop);

/*
 * AppShell: [data-collapse] narrows the sidebar to its icons and back, remembered in this browser. (The phone layout,
 * a top bar with the sidebar in a Drawer, is the server's to render.)
 */
const SAVED = 'marccent-sidebar-collapsed';
define('app-shell', (shell) => {
  const button = shell.querySelector('[data-collapse]');
  if (!button) return;
  const set = (on) => {
    shell.classList.toggle('collapsed', on);
    button.setAttribute('aria-expanded', !on);
    button.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar');
    const i = button.querySelector('.btn-icon');
    if (i) i.className = iconClass(on ? 'angles-right' : 'angles-left');
    // Icons only, like Menu iconOnly: the name moves into aria-label and title.
    shell.querySelectorAll('.app-sidebar .menu-link > .text-truncate').forEach((t) => {
      const link = t.parentElement;
      t.hidden = on;
      if (on) {
        link.setAttribute('aria-label', t.textContent);
        link.title = t.textContent;
      } else {
        link.removeAttribute('aria-label');
        link.removeAttribute('title');
      }
    });
  };
  try { if (localStorage.getItem(SAVED) === '1') set(true); } catch {}
  return listen(button, 'click', () => {
    const on = !shell.classList.contains('collapsed');
    set(on);
    try { localStorage.setItem(SAVED, on ? '1' : '0'); } catch {}
  });
});

/*
 * Code: the plain <pre> until the block comes near the screen, then CodeMirror (loaded then, its own chunk) in its
 * [data-code-host]; [data-copy] copies the code.
 */
define('code', (box) => {
  const pre = box.querySelector('pre');
  // Until CodeMirror swaps in, the <pre> may scroll sideways: reachable by keyboard.
  if (pre && !pre.hasAttribute('tabindex')) pre.tabIndex = 0;
  const code = pre?.textContent ?? '';
  let view = null;
  let stopWatching = watchInView(box, async (near) => {
    if (!near || view) return;
    stopWatching();
    stopWatching = null;
    const { CodeView } = await import('./code-view');
    let host = box.querySelector('[data-code-host]');
    if (!host) {
      host = Object.assign(document.createElement('div'), { className: 'overflow-hidden' });
      pre.after(host);
    }
    view = new CodeView(host, code, box.dataset.lang);
    await view.mount();
    if (!view.destroyed) pre?.remove();
  }, '200px');
  const copy = box.querySelector('[data-copy]');
  return all([
    () => stopWatching?.(),
    () => view?.destroy(),
    copy && listen(copy, 'click', async () => (await import('./code-view')).copyCode(code, toastSI)),
  ]);
});
