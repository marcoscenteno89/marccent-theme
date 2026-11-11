import { define } from './enhance';
import { closeMenus } from './close-menus';
import { keepPlaced } from './place';
import { tooltip } from './tooltip';
import { watchScrolled } from './scrolled';
import { watchInView } from './in-view';
import { watchInverseMode } from './inverse-mode';
import { typesetElement } from './typeset';
import { fileDrop } from './file-drop';
import { watchDivider } from './divider';
import { toastSI } from './toasts';
import { drawMap, restyleMap } from './maps';

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

// A toggle button's state: its attribute, its icon (data-icon / data-active-icon) and the marccent:toggle event.
const setToggle = (btn, attr, on) => {
  btn.setAttribute(attr, on);
  const icon = on ? btn.dataset.activeIcon : btn.dataset.icon;
  const i = btn.querySelector('.btn-icon');
  if (icon && i) i.className = iconClass(icon);
  btn.dispatchEvent(new CustomEvent('marccent:toggle', { detail: on, bubbles: true }));
};

/*
 * Toggle button (ToggleButton): a disclosure (aria-controls → aria-expanded) or a pressed toggle (aria-pressed)
 * flips on click, swaps between data-icon and data-active-icon, and says so with a marccent:toggle event (detail: on)
 * that the nav listens to. A disclosure closes on Esc. One with a panel (popovertarget) is the browser's to open.
 */
define('toggle-button', (btn) => {
  if (btn.hasAttribute('popovertarget')) return;
  const attr = btn.hasAttribute('aria-controls') ? 'aria-expanded' : btn.hasAttribute('aria-pressed') ? 'aria-pressed' : null;
  if (!attr) return;
  const set = (on) => setToggle(btn, attr, on);
  const isOn = () => btn.getAttribute(attr) === 'true';
  return all([
    listen(btn, 'click', () => set(!isOn())),
    attr === 'aria-expanded' && listen(document, 'keydown', (e) => e.key === 'Escape' && isOn() && set(false)),
  ]);
});

/*
 * Toggle button's panel (.toggle-panel, a popover): under its button, following it as the page scrolls; focus moves
 * into it once shown. Its button's state follows the popover, whatever opened or closed it (the button, Esc, a tap
 * outside): aria-expanded, the icon swapped as Toggle button's, and the marccent:toggle event. Folded (in a
 * .toggle-fold): under the band its button sits in (its .wrap-fluid: the header), as wide as it.
 */
define('toggle-panel', (panel) => {
  const button = document.querySelector(`[popovertarget="${panel.id}"]`);
  if (!button) return;
  const band = panel.parentElement?.classList.contains('toggle-fold') ? button.closest('.wrap-fluid') : null;
  const place = () => {
    // Folded, once its button hides (the band grew past 64rem), the panel is the content's place: an open popover
    // would stay a box in the top layer, so it closes.
    if (band && !button.checkVisibility()) return panel.matches(':popover-open') && panel.hidePopover();
    const r = (band ?? button).getBoundingClientRect();
    const top = band ? r.bottom : r.bottom + 8;
    panel.style.top = `${top}px`;
    panel.style.maxHeight = `min(60vh, calc(100dvh - ${top}px - 1rem))`;
    if (band) Object.assign(panel.style, { left: `${r.left}px`, width: `${r.width}px` });
  };
  const set = (on) => setToggle(button, 'aria-expanded', on);
  return all([
    listen(panel, 'beforetoggle', (e) => e.newState === 'open' && place()),
    listen(panel, 'toggle', (e) => {
      set(e.newState === 'open');
      if (e.newState === 'open') panel.querySelector('select, input, textarea, button, a[href], [tabindex]')?.focus();
    }),
    listen(window, 'scroll', place, { passive: true }),
    listen(window, 'resize', place),
  ]);
});

// Menu: its dropdowns close on an outside click and Esc, and a hover menu opens on hover.
define('menu', (menu) => closeMenus(menu));

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

// Section divider (Divider): one that follows the scroll; the rest is CSS.
define('divider', watchDivider);

/*
 * Sidebar: [data-collapse] narrows it to its icons and back, remembered in this browser: its links' names hidden (into
 * aria-label and title, like Menu iconOnly) and its dropdowns hidden (no icon-only form). (The phone layout, a top
 * bar with the content in a Drawer, is the server's to render.)
 */
const SAVED = 'marccent-sidebar-collapsed';
define('sidebar', (sidebar) => {
  const button = sidebar.querySelector('[data-collapse]');
  if (!button) return;
  const set = (on) => {
    sidebar.classList.toggle('collapsed', on);
    button.setAttribute('aria-expanded', !on);
    button.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar');
    const i = button.querySelector('.btn-icon');
    if (i) i.className = iconClass(on ? 'angles-right' : 'angles-left');
    sidebar.querySelectorAll('.menu-dropdown').forEach((d) => { d.hidden = on; });
    sidebar.querySelectorAll('.menu-link > .text-truncate').forEach((t) => {
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
    const on = !sidebar.classList.contains('collapsed');
    set(on);
    try { localStorage.setItem(SAVED, on ? '1' : '0'); } catch {}
  });
});

/*
 * Code: the plain <pre> until the block comes near the screen, then CodeMirror (loaded then, its own chunk) in its
 * [data-code-host]; [data-copy] copies the code. An editor (Code with onChange) when it holds a <textarea> instead:
 * the form field, which works without JavaScript; the editor takes its place and writes every edit back into it
 * (and fires input), so the form posts the code as usual. Its name: the textarea's label (or aria-label);
 * data-minimum-lines: its height while nearly empty; a [data-format] button lays the code out.
 */
define('code', (box) => {
  const field = box.querySelector('textarea');
  const pre = field ? null : box.querySelector('pre');
  // Until CodeMirror swaps in, the <pre> may scroll sideways: reachable by keyboard.
  if (pre && !pre.hasAttribute('tabindex')) pre.tabIndex = 0;
  const code = field ? field.value : pre?.textContent ?? '';
  const write = (c) => {
    field.value = c;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  };
  let view = null;
  let stopWatching = watchInView(box, async (near) => {
    if (!near || view) return;
    stopWatching();
    stopWatching = null;
    const { CodeView } = await import('./code-view');
    let host = box.querySelector('[data-code-host]');
    if (!host) {
      host = Object.assign(document.createElement('div'), { className: 'overflow-hidden' });
      (field ?? pre).after(host);
    }
    view = new CodeView(host, code, box.dataset.language, field ? {
      onChange: write,
      label: field.labels?.[0]?.textContent.trim() || field.getAttribute('aria-label') || undefined,
      minimumLines: Number(box.dataset.minimumLines) || undefined,
    } : {});
    await view.mount();
    if (view.destroyed) return;
    if (field) field.hidden = true;
    else pre?.remove();
  }, '200px');
  const copy = box.querySelector('[data-copy]');
  const format = box.querySelector('[data-format]');
  return all([
    format && listen(format, 'click', () => view?.format()),
    () => stopWatching?.(),
    () => view?.destroy(),
    () => field && (field.hidden = false),
    copy && listen(copy, 'click', async () => (await import('./code-view')).copyCode(code, toastSI)),
  ]);
});

/*
 * TabBar: its tabs pick a panel. The markup has every panel (React's renders the picked one), each after the tab list
 * in order, the others hidden. Arrow keys move between tabs; the gradient bar slides under the picked one.
 */
define('tab-bar', (box) => {
  const list = box.querySelector('[role="tablist"]');
  if (!list) return;
  const tabs = [ ...list.querySelectorAll(':scope > [role="tab"]') ];
  const panels = [ ...box.querySelectorAll(':scope > [role="tabpanel"]') ];
  const bar = list.nextElementSibling;
  let active = Math.max(0, tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true'));
  const pick = (i) => {
    active = i;
    tabs.forEach((t, n) => {
      const on = n === i;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('text-primary', on);
      t.classList.toggle('fw-bold', on);
      t.classList.toggle('opacity-75', !on);
    });
    panels.forEach((p, n) => { p.hidden = n !== i; });
    if (bar) bar.style.translate = `${i * 100}% 0`;
  };
  pick(active);
  return all([
    ...tabs.map((t, i) => listen(t, 'click', () => pick(i))),
    listen(list, 'keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      pick((active + step + tabs.length) % tabs.length);
      tabs[active].focus();
    }),
  ]);
});

// Inverse mode: the element in the mode opposite its surroundings' (core/inverse-mode.js).
define('inverse-mode', watchInverseMode);

// Typeset: the text inside set the way print sets it (core/typeset.js), once.
define('typeset', (el) => { typesetElement(el); });

/*
 * Map: the Google map (core/maps.js) when the box comes near the screen, so the page doesn't pay for it up front;
 * Google's embed without a key. data-key (or the page's window.marccentMapsKey), data-lat, data-lng, data-zoom;
 * data-marker for a pin on the center (data-title, data-link: a Google Maps address its click opens); data-markers,
 * pins as JSON ([{ "lat", "lng", "title", "link" }]), clustered unless data-cluster="false", the map fitting them
 * unless data-fit="false"; data-embed for the fallback. What's in the box until then (a no-script link) stays when
 * nothing draws. A theme change (the mode, the palette, the design style, on <html> or the box's section) recolors it.
 */
// data-markers: the pins, or none when it isn't a JSON list.
const places = (json) => {
  try {
    const list = JSON.parse(json ?? '[]');
    return Array.isArray(list) ? list.filter((p) => Number.isFinite(Number(p?.lat)) && Number.isFinite(Number(p?.lng))) : [];
  } catch {
    return [];
  }
};
define('map', (box) => {
  const d = box.dataset;
  let map = null;
  let stopWatching = watchInView(box, async (near) => {
    if (!near || map) return;
    stopWatching();
    stopWatching = null;
    map = await drawMap(box, {
      key: d.key || undefined, center: { lat: Number(d.lat), lng: Number(d.lng) }, zoom: Number(d.zoom) || 10,
      marker: 'marker' in d ? { title: d.title, link: d.link } : undefined, markers: places(d.markers),
      cluster: d.cluster !== 'false', fit: d.fit !== 'false', embed: d.embed, title: d.title,
    });
  }, '400px');
  const recolor = new MutationObserver(() => requestAnimationFrame(() => map && restyleMap(map)));
  const options = { attributes: true, attributeFilter: [ 'style', 'class', 'data-theme', 'data-design' ] };
  recolor.observe(document.documentElement, options);
  const scope = box.parentElement?.closest('[data-theme], [data-design]');
  if (scope && scope !== document.documentElement) recolor.observe(scope, options);
  return all([ () => stopWatching?.(), () => recolor.disconnect() ]);
});

// The page scrolled: <html data-scrolled> once it leaves its top, so .solid-on-scroll (utilities.css) turns solid with
// it (the Floating header pattern, PATTERNS.md). One passive listener, started with the engine.
if (typeof window !== 'undefined') watchScrolled((on) => document.documentElement.toggleAttribute('data-scrolled', on));
