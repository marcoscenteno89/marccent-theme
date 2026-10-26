'use client';
import { useContext, useEffect, useRef } from 'react';
import { Scene } from '@marccent/util/canvas';
import { ThemeContext } from '../../lib/context';
import { decorativeObserver, DECORATIVE_FPS } from '../theme/hoc';

/*
 * CanvasScanner: gives any element a canvas background from its markup, no component needed: data-component
 * "animation" (a word of it: "button animation" for a Button with one behind it), data-name which one:
 *   <section data-component="animation" data-name="blob">…</section>
 *   <div data-component="animation" data-name="fire" data-fps="20">…</div>
 *   <div data-component="animation" data-name="snow" data-colors="#fff">…</div>   (colors that replace the theme's, comma-separated)
 * Names: blob, fire, wave, network-loop, particle-flowfield, orbit, snow, fireflies, leaves, rain, bubbles (the
 * canvas.js Animation classes). The canvas sits behind the element's content and fills it; the element becomes a
 * positioning box (position: relative, unless it already is one) and its own stacking context (isolation), so the
 * canvas stays inside it.
 * Like withCanvas (theme/hoc.js): decorative (capped fps, pixel density 1), paused off screen and for reduced motion,
 * and redrawn in the new colors when the theme changes. p5 and canvas.js load only once a page has one. Watches for
 * elements that appear or go away later (navigation, sliders). Renders nothing.
 */

const NAMES = {
  blob: 'Blob', fire: 'Fire', wave: 'Wave', 'network-loop': 'NetworkLoop',
  'particle-flowfield': 'ParticleFlowfield', orbit: 'OrbitAnim', snow: 'Snow',
  fireflies: 'Fireflies', leaves: 'Leaves', rain: 'Rain', bubbles: 'Bubbles',
};

// What a host's background is built from: a change to either rebuilds it.
const keyOf = (host) => `${host.dataset.name}|${host.dataset.colors ?? ''}`;

// Both modules once, the first time a page has an animation.
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

const CanvasScanner = () => {
  const { theme, path: pathname } = useContext(ThemeContext) ?? {};
  const running = useRef(new Map()); // host element → CanvasBackground
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const ready = Boolean(theme); // scanning starts once the theme has loaded, and doesn't restart on every theme change

  // Mount a background on every new animation (or one whose name or colors changed), remove the ones that left the page.
  useEffect(() => {
    if (!ready) return;
    const live = running.current;
    let cancelled = false;
    const scan = async () => {
      for (const [ host, bg ] of live) {
        if (!host.isConnected || keyOf(host) !== bg.key) { bg.destroy(); live.delete(host); }
      }
      const hosts = [ ...document.querySelectorAll('[data-component~="animation"]') ].filter((el) => !live.has(el) && NAMES[el.dataset.name]);
      if (!hosts.length) return;
      const { p5, canvas } = await load();
      if (cancelled) return;
      for (const host of hosts) {
        if (live.has(host) || !host.isConnected) continue;
        const bg = new CanvasBackground(host, canvas[NAMES[host.dataset.name]], p5, themeRef.current);
        bg.key = keyOf(host);
        live.set(host, bg);
      }
    };
    scan();
    let queued = null;
    const mo = new MutationObserver(() => { if (!queued) queued = requestAnimationFrame(() => { queued = null; scan(); }); });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: [ 'data-component', 'data-name', 'data-colors' ] });
    return () => { cancelled = true; mo.disconnect(); if (queued) cancelAnimationFrame(queued); };
  }, [ pathname, ready ]);

  // A new theme recolors every background.
  useEffect(() => {
    if (theme) running.current.forEach((bg) => bg.theme(theme));
  }, [ theme, theme?.version ]);

  // All of them go on unmount.
  useEffect(() => () => {
    running.current.forEach((bg) => bg.destroy());
    running.current.clear();
  }, []);

  return null;
};

export { CanvasScanner };
