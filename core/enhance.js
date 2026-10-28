/*
 * The markup engine: the HTML is the contract. A server (PHP, Django templates, plain HTML) renders the same markup
 * the React components render, and this wires it up by its data-component: each kind has a setup, run once per
 * element, now and for elements added later. data-component can hold several words ("button animation"); each word
 * with a setup runs. A setup returns a function that undoes it, called when the element leaves the page.
 *
 *   define('tooltip', (el) => { …; return () => { … }; });
 *   enhance();            // the page, and everything added to it later
 *
 * Not for what React renders: React wires its own components (both would wire them twice). A page that mixes them
 * (WordPress: Marccent Blocks' islands) marks React's parts data-island, and the engine leaves everything inside
 * one alone.
 */

const setups = new Map();    // kind → setup(el)
const done = new WeakMap();  // element → Map(kind → undo)
let watching = null;         // the document's MutationObserver, once enhance() runs on it

/**
 * define: the setup for one kind of component. Elements already on an enhanced page get it at once.
 * @param {string} kind - A data-component word: "nav-bar", "tooltip"…
 * @param {(el: HTMLElement) => (void | (() => void))} setup
 */
const define = (kind, setup) => {
  setups.set(kind, setup);
  if (watching) upgrade(document);
};

// Every element under root (root included) with a defined kind it hasn't had yet.
const upgrade = (root) => {
  const els = root.querySelectorAll ? [ ...root.querySelectorAll('[data-component]') ] : [];
  if (root.matches?.('[data-component]')) els.unshift(root);
  for (const el of els) {
    if (el.closest('[data-island]')) continue;
    const ran = done.get(el) ?? new Map();
    for (const kind of el.dataset.component.split(/\s+/)) {
      const setup = setups.get(kind);
      if (!setup || ran.has(kind)) continue;
      try {
        ran.set(kind, setup(el) || null);
      } catch (err) {
        console.error(`marccent: ${kind} failed to start`, err);
        ran.set(kind, null);
      }
    }
    if (ran.size) done.set(el, ran);
  }
};

// Undoes the setups of root and everything in it.
const downgrade = (root) => {
  const els = root.querySelectorAll ? [ root, ...root.querySelectorAll('[data-component]') ] : [];
  for (const el of els) {
    done.get(el)?.forEach((undo) => undo?.());
    done.delete(el);
  }
};

/**
 * enhance: runs every defined setup on root's components, then (for the document) keeps doing it for elements added
 * later and undoes it for ones removed. Safe to call again: an element is set up once per kind.
 * @param {ParentNode} [root=document]
 * @returns {() => void} Stops watching.
 */
const enhance = (root = document) => {
  upgrade(root);
  if (root !== document || watching) return () => {};
  watching = new MutationObserver((records) => {
    for (const r of records) {
      r.removedNodes.forEach((n) => n.nodeType === 1 && !n.isConnected && downgrade(n));
      r.addedNodes.forEach((n) => n.nodeType === 1 && upgrade(n));
    }
  });
  watching.observe(document.documentElement, { childList: true, subtree: true });
  return () => { watching?.disconnect(); watching = null; };
};

export { define, enhance };
