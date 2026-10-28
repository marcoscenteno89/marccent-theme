import { Scene } from '@marccent/util/canvas';

/*
 * Canvas backgrounds from markup, no component needed: data-component "animation" (a word of it: "button animation"
 * for a Button with one behind it), data-name which one:
 *   <section data-component="animation" data-name="blob">…</section>
 *   <div data-component="animation" data-name="fire" data-fps="20">…</div>
 *   <div data-component="animation" data-name="snow" data-colors="#fff">…</div>   (colors that replace the theme's, comma-separated)
 * Names: blob, fire, wave, network-loop, particle-flowfield, orbit, snow, fireflies, leaves, rain, bubbles (the
 * core/canvas.js Animation classes). The canvas sits behind the element's content and fills it; the element becomes a
 * positioning box (position: relative, unless it already is one) and its own stacking context (isolation), so the
 * canvas stays inside it. Decorative: capped fps, pixel density 1, paused off screen and for reduced motion, and
 * redrawn in the new colors when the theme changes. p5 and the animations load only once a page has one.
 */

const NAMES = {
  blob: 'Blob', fire: 'Fire', wave: 'Wave', 'network-loop': 'NetworkLoop',
  'particle-flowfield': 'ParticleFlowfield', orbit: 'OrbitAnim', snow: 'Snow',
  fireflies: 'Fireflies', leaves: 'Leaves', rain: 'Rain', bubbles: 'Bubbles',
};

// Decorative animations (backgrounds, previews) run at this rate and one pixel per CSS pixel: soft shapes look
// the same, and a 3x phone screen draws 9x fewer pixels.
const DECORATIVE_FPS = 30;

// Like canvasObserver (@marccent/util), but a decorative animation stays still while the visitor asks for
// reduced motion (OS setting): it keeps the frame already drawn and only animates when on screen and allowed.
// Returns a function that stops watching.
const decorativeObserver = (p, node) => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const update = () => (visible && !motion.matches ? p.loop() : p.noLoop());
  const observer = new IntersectionObserver(([ entry ]) => { visible = entry.isIntersecting; update(); });
  observer.observe(node);
  motion.addEventListener('change', update);
  update();
  return () => { observer.disconnect(); motion.removeEventListener('change', update); };
};

// What a host's background is built from: a change to either rebuilds it.
const keyOf = (host) => `${host.dataset.name}|${host.dataset.colors ?? ''}`;

// p5 and the animations once, the first time a page has one.
let modules = null;
const load = () => (modules ??= Promise.all([ import('p5'), import('./canvas') ])
  .then(([ p5, canvas ]) => ({ p5: p5.default, canvas })));

/**
 * CanvasBackground: one element's canvas (p5 instance, Scene, Animation). theme(t) recolors it, destroy() removes it
 * and puts the element's styles back.
 */
class CanvasBackground {
  constructor(host, AnimationClass, p5, theme) {
    this.host = host;
    this.key = keyOf(host);
    this.restore = { position: host.style.position, isolation: host.style.isolation };
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.isolation = 'isolate';
    this.layer = document.createElement('div');
    this.layer.className = 'canvas overflow-hidden';
    this.layer.setAttribute('aria-hidden', 'true');
    Object.assign(this.layer.style, { position: 'absolute', inset: '0', zIndex: '-1', pointerEvents: 'none' });
    host.prepend(this.layer);

    this.sketch = new p5((p) => { this.p = p; });
    this.scene = new Scene(this.p, this.layer, { pauseOffscreen: false });
    this.p.pixelDensity(1);
    this.p.frameRate(Number(host.dataset.fps) || DECORATIVE_FPS);
    this.stopObserver = decorativeObserver(this.p, this.layer);
    this.anim = new AnimationClass(this.scene, this.layer, host.dataset.colors?.split(',').map((c) => c.trim()).filter(Boolean));
    this.sketch.draw = () => this.anim.draw();
    this.theme(theme);
  }

  theme(t) {
    this.anim.theme(t);
    this.anim.draw(); // a paused canvas (off screen, reduced motion) still shows the new colors
  }

  destroy() {
    this.stopObserver();
    this.anim.destroy();
    this.scene.destroy();
    this.sketch.remove();
    this.layer.remove();
    Object.assign(this.host.style, this.restore);
  }
}

/**
 * watchCanvases: a background on every animation element on the page now and later (navigation, sliders), rebuilt
 * when its name or colors change and removed when it leaves the page. React: CanvasScanner
 * (components/visuals/canvas-scanner.js).
 * @param {() => Object} getTheme - The theme to draw in (the Theme, lib/singleton.js), read as each one is built.
 * @returns {{ recolor: (theme: Object) => void, stop: () => void }} recolor: after a theme change. stop: removes them all.
 */
const watchCanvases = (getTheme) => {
  const live = new Map(); // host element → CanvasBackground
  let stopped = false;
  const scan = async () => {
    for (const [ host, bg ] of live) {
      if (!host.isConnected || keyOf(host) !== bg.key) { bg.destroy(); live.delete(host); }
    }
    const hosts = [ ...document.querySelectorAll('[data-component~="animation"]') ].filter((el) => !live.has(el) && NAMES[el.dataset.name]);
    if (!hosts.length) return;
    const { p5, canvas } = await load();
    if (stopped) return;
    for (const host of hosts) {
      if (live.has(host) || !host.isConnected) continue;
      live.set(host, new CanvasBackground(host, canvas[NAMES[host.dataset.name]], p5, getTheme()));
    }
  };
  scan();
  let queued = null;
  const mo = new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = null; scan(); }); });
  mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'data-component', 'data-name', 'data-colors' ] });
  return {
    recolor: (theme) => live.forEach((bg) => bg.theme(theme)),
    stop: () => {
      stopped = true;
      mo.disconnect();
      if (queued) cancelAnimationFrame(queued);
      live.forEach((bg) => bg.destroy());
      live.clear();
    },
  };
};

export { watchCanvases, CanvasBackground, decorativeObserver, DECORATIVE_FPS };
