'use client';
import React, { useState, useRef, useEffect, useId, forwardRef } from 'react';
import { cx } from '../../lib/cx';
import { Clock } from '../ui/clock';
import { watchInView } from '../../lib/in-view';
import { Store, useStore } from '../../lib/store';

/*
 * Motion effects ported from the anthem site: Orbit (the ag page's click-to-rotate circle), Countdown (the gooey
 * 5..0 counter) and Parallax / useParallax (scroll parallax). Countdown's look is in animations.css.
 * All three respect prefers-reduced-motion. The motion itself is plain-JS classes (OrbitPlayer, Spins,
 * CountdownTimer, ParallaxMotion); the components only mount them and render.
 */

/* ---------- orbit ---------- */

const localMs = () => Date.now() - new Date().getTimezoneOffset() * 60000; // ms since 1970 in local time
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * OrbitPlayer: which Orbit item is picked and how far the pointer has turned, plus autoPlay's timers, in plain JS.
 * attach(el) starts autoPlay on the orbit's box (it plays only while on screen and, unless synced, waits while the
 * pointer is over it or focus is inside it); destroy() stops it.
 */
class OrbitPlayer extends Store {
  constructor({ count, start, startAngle, offset, autoPlay, interval, sync }) {
    super();
    Object.assign(this, { count, start, startAngle, offset, autoPlay, interval, sync });
    this.step = 360 / count;
    this.active = start;
    this.turn = this.angleOf(start) + offset;
    this.inView = false;
    this.paused = false;
    this.cleanup = [];
  }

  angleOf(i) { return i * this.step + this.startAngle; }

  select(i) {
    const delta = ((this.angleOf(i) + this.offset - this.turn) % 360 + 540) % 360 - 180; // -180..180: never spins the long way
    this.turn += delta;
    this.active = i;
    this.emit();
    this.schedule(); // any change of item (by click or by the timer) starts the wait over
  }

  attach(el) {
    if (!this.autoPlay) return;
    this.cleanup.push(watchInView(el, (inView) => { this.inView = inView; this.schedule(); }));
    if (this.sync) return;
    const pause = (paused) => { this.paused = paused; this.schedule(); };
    const on = (type, fn) => { el.addEventListener(type, fn); this.cleanup.push(() => el.removeEventListener(type, fn)); };
    on('mouseenter', () => pause(true));
    on('mouseleave', () => pause(false));
    on('focusin', () => pause(true));
    on('focusout', (e) => !el.contains(e.relatedTarget) && pause(false));
  }

  // One timer per pick.
  schedule() {
    clearTimeout(this.timer);
    if (!this.autoPlay || !this.inView) return;
    const { interval, count, start } = this;
    if (this.sync) {
      this.firstTick ??= Math.floor(localMs() / interval);
      const wait = interval - (localMs() % interval) + 5; // just past the next boundary
      this.timer = setTimeout(() => this.select((start + Math.floor(localMs() / interval) - this.firstTick) % count), wait);
      return;
    }
    if (this.paused || reducedMotion()) return;
    this.timer = setTimeout(() => this.select((this.active + 1) % count), interval);
  }

  destroy() {
    clearTimeout(this.timer);
    this.cleanup.forEach((fn) => fn());
    this.cleanup = [];
  }
}

/**
 * Orbit: items ring a circle (a thin ring in the theme gradient); clicking one shows its title and text in
 * the middle and turns a pointer to face it (the shortest way round). Items are spaced evenly, clockwise. The wheel
 * and center images are optional extras on top. Items size themselves by how many there are. It stays a circle at
 * any width and scales with its box (sizes in cqi, % of the box). No CSS of its own: shared classes (stack, circle,
 * shape-ring, bg-gradient, hover-grow…) and inline styles.
 * @param {{ icon: string|React.ReactNode, title: string, text?: React.ReactNode }[] | number} items - icon: image src
 *   or a node. A number instead: that many evenly spaced positions with nothing drawn (only the ring and pointer).
 * @param {number} [start=0] - The item picked first.
 * @param {number} [startAngle=0] - Where item 0 sits, in degrees clockwise from 3 o'clock (-90: at 12 o'clock).
 * @param {string} [wheel] - Image that turns to face the picked item (drawn pointing right at 0deg).
 * @param {string} [center] - Image fixed in the middle. @param {boolean} [hub=true] - false: no title / text there.
 * @param {number} [offset=0] - Degrees added to the wheel's turn, when the wheel image doesn't point right.
 * @param {boolean} [autoPlay=false] - Moves on to the next item by itself, round and round, as if clicked.
 *   It waits while the pointer is over it or focus is inside it, starts the wait over after a click, and stays
 *   still for visitors who ask for reduced motion.
 * @param {number} [interval=4000] - With autoPlay: how long each item stays picked, in milliseconds.
 * @param {boolean} [sync=false] - With autoPlay: ticks land on the clock's own boundaries (every whole second,
 *   minute, hour… of local time) and the item is worked out from the time at each tick, so it never drifts, even when
 *   the browser slows timers in a background tab. A synced orbit is a display: its items can't be clicked and it
 *   never pauses.
 * @param {Object} [style] - On the orbit's box; it can set --orbit-radius (the ring's radius, default 40cqi: 40% of
 *   the box), --wedge (the pointer's width, default up to 40deg), --pointer (its color) and --pointer-fade /
 *   --pointer-solid (where it fades in, default 55% / 100% of the radius; 0% / 0% is solid from the center, a hand).
 */
const Orbit = ({ items, start = 0, startAngle = 0, wheel, center, hub = true, offset = 0, autoPlay = false, interval = 4000,
  sync = false, className, style }) => {
  const list = typeof items === 'number' ? null : items;
  const count = list ? list.length : items;
  const angleOf = (i) => i * (360 / count) + startAngle;
  const wedge = Math.min(40, 320 / count); // the pointer's default width (deg): narrower as items crowd
  // Each item's share of the ring (2 pi x radius x 1.1 / count), up to 20% of the box.
  const itemSize = `min(20cqi, calc(var(--orbit-radius) * ${(6.9 / count).toFixed(4)}))`;
  const player = useStore(() => new OrbitPlayer({ count, start, startAngle, offset, autoPlay, interval, sync }));
  const { active, turn } = player;
  const box = useRef(null);
  useEffect(() => player.attach(box.current), []);
  // Turning motion: off for visitors who ask for reduced motion (read once mounted: the server can't know).
  const [ still, setStill ] = useState(false);
  useEffect(() => setStill(reducedMotion()), []);
  const turning = still ? 'none' : 'rotate calc(var(--duration-slow) * 3) ease-in-out';
  // The ring, the pointer and the items all sit on one circle, --orbit-radius from the center.
  const circle = { width: 'calc(var(--orbit-radius) * 2)', aspectRatio: 1, placeSelf: 'center' };
  return (
    <div ref={box} data-component="orbit" className={cx('cq', className)} style={{ '--orbit-radius': '40cqi', ...style }}>
      <div className="stack square circle" style={{ placeItems: 'center' }}>
        {/* The pointer: a wedge aimed at the picked item, fading in from the middle so the hub's text stays clear. */}
        <div className="circle" style={{ ...circle,
          background: `conic-gradient(from calc(90deg - var(--wedge, ${wedge}deg) / 2), var(--pointer, color-mix(in srgb, var(--primary) 35%, transparent)) 0 var(--wedge, ${wedge}deg), transparent 0)`,
          mask: 'radial-gradient(closest-side, transparent var(--pointer-fade, 55%), #000 var(--pointer-solid, 100%))',
          rotate: `${turn}deg`, transition: turning }} />
        {/* The track: a thin ring in the theme gradient. */}
        <div className="shape-ring" style={{ ...circle, '--ring-hole': 'calc(100% - .25rem)',
          background: 'conic-gradient(var(--primary), var(--secondary), var(--primary))' }} />
        {wheel && <img src={wheel} alt="" className="w-100 h-100" style={{ objectFit: 'contain', rotate: `${turn}deg`, transition: turning }} />}
        {center && <img src={center} alt="" style={{ width: '35%' }} />}
        {!center && hub && list && (
          <div className="grid cols-1 gap-sm text-center" style={{ width: '50%' }} aria-live="polite">
            <strong className="fs-lg">{list[active].title}</strong>
            <p>{list[active].text}</p>
          </div>
        )}
        {list && (
          <ul className="stack w-100 h-100" style={{ placeItems: 'center', margin: 0, padding: 0, listStyle: 'none' }}>
            {list.map((item, i) => {
              const icon = typeof item.icon === 'string' ? <img src={item.icon} alt="" className="w-100" /> : item.icon;
              // A circle on the track, the picked one filled with the gradient. --icon-size: a Font Awesome icon fills
              // it instead of keeping its own minimum size, so a small button on a crowded ring stays round.
              const button = {
                className: cx('circle border bg', i === active && 'bg-gradient'),
                style: { display: 'grid', placeItems: 'center', width: '70%', aspectRatio: 1, padding: 0, color: 'inherit',
                  fontSize: 'min(var(--text-lg), calc(var(--item) * .3))', '--icon-size': '100%', cursor: sync ? 'default' : 'pointer',
                  borderColor: i === active ? 'var(--primary)' : undefined },
              };
              return (
                <li key={i} className="stack" style={{ '--item': itemSize, width: 'var(--item)', aspectRatio: 1, placeItems: 'center',
                  transform: `rotate(${angleOf(i)}deg) translate(var(--orbit-radius)) rotate(${-angleOf(i)}deg)` }}>
                  {sync
                    ? <span {...button} aria-hidden="true">{icon}</span>
                    : <button data-component="button" data-name={item.title} type="button" {...button} aria-label={item.title} aria-pressed={i === active} onClick={() => player.select(i)}>{icon}</button>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// The clock's hour numbers, 12 first so it sits at the top (startAngle -90).
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => ({ icon: <span>{n}</span>, title: `${n} o'clock` }));

/**
 * OrbitClock: three synced Orbits, one inside the other, each pointer a hand: hours on the outside (12 numbered
 * items, a tick an hour), then minutes and seconds (60 bare positions each, a tick a minute / a second). The time and
 * date sit on a panel in the middle (ui/clock.js). It scales with its box. Rendered once mounted: the server's time would differ from the visitor's.
 */
const OrbitClock = ({ className }) => {
  const [ now, setNow ] = useState(null);
  useEffect(() => setNow(new Date()), []);
  const ring = { placeSelf: 'center', '--pointer-fade': '0%', '--pointer-solid': '0%' }; // solid hands
  return (
    <div data-component="orbit-clock" className={cx('stack cq', className)} style={{ aspectRatio: 1 }}>
      {now && <>
        <Orbit items={HOURS} hub={false} start={now.getHours() % 12} startAngle={-90}
          autoPlay sync interval={3600000} style={{ ...ring, width: '100%', '--wedge': '30deg' }} />
        <Orbit items={60} start={now.getMinutes()} startAngle={-90} autoPlay sync interval={60000}
          style={{ ...ring, width: '72%', '--wedge': '10deg', '--pointer': 'color-mix(in srgb, var(--primary) 70%, transparent)' }} />
        <Orbit items={60} start={now.getSeconds()} startAngle={-90} autoPlay sync interval={1000}
          style={{ ...ring, width: '50%', '--wedge': '6deg', '--pointer': 'var(--secondary)' }} />
        <div className="bg border round shadow-sm pad-sm text-center" style={{ ...ring, zIndex: 1, fontSize: '3.5cqi' }}>
          <Clock className="fw-bold" format="h:mm:ss A" />
          <div className="opacity-75">{now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</div>
        </div>
      </>}
    </div>
  );
}

/* ---------- spins ---------- */

/**
 * Spins: turns every [data-lap] element inside el round and round, with the browser's animation API (no CSS
 * needed): a full turn every data-lap seconds, starting at data-from degrees, clockwise (data-dir="1") or back
 * (data-dir="-1": a child that turns back as its parent turns stays upright). They all wait while the pointer is over
 * the box or focus is inside it (pause: false to keep going), only move while on screen (watchInView), and hold still
 * for visitors who ask for reduced motion.
 * Give each element its start angle inline too (rotate: data-from), so it's in place before the script runs.
 * destroy() stops them.
 * @param {Element} el
 * @param {{ pause?: boolean }} [options]
 */
class Spins {
  constructor(el, { pause = true } = {}) {
    this.el = el;
    this.inView = false;
    this.hovered = false;
    this.cleanup = [];
    if (reducedMotion()) { this.animations = []; return; }
    this.animations = [ ...el.querySelectorAll('[data-lap]') ].map(e => {
      const lap = Number(e.dataset.lap) * 1000, from = Number(e.dataset.from ?? 0), dir = Number(e.dataset.dir ?? 1);
      const a = e.animate([ { rotate: `${from}deg` }, { rotate: `${from + dir * 360}deg` } ], { duration: lap, iterations: Infinity });
      a.pause(); // starts once on screen
      return a;
    });
    this.cleanup.push(watchInView(el, (inView) => { this.inView = inView; this.sync(); }));
    if (!pause) return;
    const hover = (hovered) => { this.hovered = hovered; this.sync(); };
    const on = (type, fn) => { el.addEventListener(type, fn); this.cleanup.push(() => el.removeEventListener(type, fn)); };
    on('mouseenter', () => hover(true));
    on('mouseleave', () => hover(false));
    on('focusin', () => hover(true));
    on('focusout', (e) => !el.contains(e.relatedTarget) && hover(false));
  }

  // Plays only while on screen and (with pause) not hovered or focused.
  sync() { this.animations.forEach(a => (this.inView && !this.hovered ? a.play() : a.pause())); }

  destroy() {
    this.animations.forEach(a => a.cancel());
    this.cleanup.forEach((fn) => fn());
  }
}

/** useSpins: a Spins on ref's box for the component's lifetime. */
const useSpins = (ref, options) => useEffect(() => {
  const spins = new Spins(ref.current, options);
  return () => spins.destroy();
}, []);

/* ---------- solar system ---------- */

// The planets: orbit radius and size (cqi: % of the box), lap time (s: Mercury 5s, the rest slower by the square root
// of their real orbital period, so Neptune takes about two minutes instead of about an hour), color and a fact.
// Not to scale.
const PLANETS = [
  { name: 'Mercury', radius: 13, size: 2.2, lap: 5, color: '#9e9e9e', fact: 'The smallest planet, and the closest to the Sun.' },
  { name: 'Venus', radius: 17.5, size: 3.4, lap: 8, color: '#e3bb76', fact: 'The hottest planet: its thick clouds trap the heat.' },
  { name: 'Earth', radius: 22, size: 3.6, lap: 10, color: 'radial-gradient(circle at 35% 35%, #6fb7ff, #1f5fa8 60%, #2e8b57)', fact: 'Home: the only planet known to have life.' },
  { name: 'Mars', radius: 26.5, size: 2.8, lap: 14, color: '#c1440e', fact: 'The red planet, home of the tallest volcano known.' },
  { name: 'Jupiter', radius: 32, size: 6.5, lap: 35, color: 'linear-gradient(#d8ca9d, #b07f35 30%, #e9d8a6 50%, #a0522d 70%, #d8ca9d)', fact: 'The biggest planet: over a thousand Earths would fit inside.' },
  { name: 'Saturn', radius: 39, size: 5, lap: 55, color: '#e3c88f', ring: true, fact: 'Its rings are ice and rock, most of them smaller than a house.' },
  { name: 'Uranus', radius: 44, size: 4, lap: 93, color: '#a6e1e8', fact: 'It spins on its side, rolling round the Sun.' },
  { name: 'Neptune', radius: 48, size: 3.8, lap: 131, color: '#3f62d8', fact: 'The windiest planet: storms faster than the speed of sound.' },
];

/**
 * SolarSystem: the Sun in the middle and the eight planets going round it on their tracks, each at its own speed.
 * Built like Orbit, with no CSS of its own: a stack of layers (stack, circle, shape-ring) and inline styles. Each
 * planet sits on an arm (a layer the size of its track) that useSpins turns; the planet turns
 * back the same amount, so Saturn's ring keeps its tilt. Only the planets take the pointer (a mask doesn't stop
 * clicks the way a clip does, so the full-size rings and arms are pointer-events: none). Clicking a planet names it below, with a fact; the motion
 * waits while the pointer is over it or focus is inside it, and stays still for visitors who ask for reduced motion.
 */
const SolarSystem = ({ className, style }) => {
  const [ active, setActive ] = useState(null);
  const box = useRef(null);
  useSpins(box);
  const planet = active === null ? null : PLANETS[active];
  return (
    <div data-component="solar-system" className={cx('grid cols-1 gap-sm', className)} style={style}>
      <div ref={box} className="cq">
        <div className="stack square" style={{ placeItems: 'center' }}>
          <div className="circle" style={{ width: '16cqi', aspectRatio: 1,
            background: 'radial-gradient(circle at 40% 40%, #fff6a8, #ffcc33 40%, #ff8c00 80%)',
            boxShadow: '0 0 4cqi 1cqi rgb(255 170 0 / .6)', pointerEvents: 'none' }} aria-hidden="true" />
          {PLANETS.map((p, i) => {
            const from = i * 137; // spread round the Sun, so they don't start in a line
            return (
              <React.Fragment key={p.name}>
                <div className="shape-ring" aria-hidden="true" style={{ width: `${p.radius * 2}cqi`,
                  '--ring-hole': 'calc(100% - 1px)', background: 'var(--border-color)', pointerEvents: 'none' }} />
                <div className="stack" data-lap={p.lap} data-from={from} data-dir={1}
                  style={{ width: `${p.radius * 2}cqi`, aspectRatio: 1, rotate: `${from}deg`, pointerEvents: 'none' }}>
                  <button data-component="button" data-name={p.name} type="button" className="stack" aria-label={p.name} aria-pressed={active === i}
                    onClick={() => setActive(active === i ? null : i)} data-lap={p.lap} data-from={-from} data-dir={-1}
                    style={{ placeSelf: 'center end', translate: '50% 0', rotate: `${-from}deg`, placeItems: 'center',
                      padding: 0, border: 0, background: 'none', cursor: 'pointer', pointerEvents: 'auto' }}>
                    <span className="circle" style={{ width: `${p.size}cqi`, aspectRatio: 1, background: p.color,
                      boxShadow: active === i ? '0 0 0 .5cqi var(--primary)' : undefined }} />
                    {p.ring && <span className="shape-ring" style={{ width: `${p.size * 2.2}cqi`, aspectRatio: 2.6,
                      '--ring-hole': '55%', background: '#cdb47c', rotate: '-20deg' }} />}
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <p className="text-center" aria-live="polite">
        {planet ? <><strong>{planet.name}</strong>: {planet.fact}</> : 'Click a planet; hover to pause.'}
      </p>
    </div>
  );
}

/* ---------- countdown ---------- */

// How long the bars sit collapsed in the middle between digits, then how long each digit holds (ms).
const COUNTDOWN_GAP = 600;
const COUNTDOWN_HOLD = 1000;

/**
 * GooDigit: one digit drawn by five bars that fold from one number into the next, blurred together by an SVG "goo"
 * filter (the bars' shapes per digit: .countdown in animations.css). null: the bars sit collapsed as a dot.
 * Size with --countdown-size (style), color with `color`.
 * @param {number|null} digit - 0..9.
 */
const GooDigit = forwardRef(({ digit, className, style, ...rest }, ref) => {
  const filter = 'goo' + useId().replace(/:/g, ''); // useId's colons break url(#...)
  return (
    <>
      <div ref={ref} data-component="goo-digit" className={cx('countdown', className)} data-digit={digit ?? undefined} style={{ ...style, filter: `url(#${filter})` }} {...rest}>
        <i /><i /><i /><i /><i />
      </div>
      <svg className="countdown-filter" aria-hidden="true">
        <filter id={filter}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="goo" />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </svg>
    </>
  );
});
GooDigit.displayName = 'GooDigit';

/**
 * CountdownTimer: counts el (a GooDigit's box) down from `from` to 0 by setting its data-digit, with a collapsed
 * dot between digits. Calls onDone once 0 has shown, and stays on 0. destroy() stops it.
 */
class CountdownTimer {
  constructor(el, from, onDone) {
    this.el = el;
    this.onDone = onDone;
    this.n = Math.min(Math.max(from, 0), 9);
    this.show();
  }
  set(digit) {
    if (digit === null) delete this.el.dataset.digit;
    else this.el.dataset.digit = digit;
    this.el.setAttribute('aria-label', digit ?? '');
  }
  show() {
    this.set(null);
    this.timer = setTimeout(() => {
      this.set(this.n);
      this.timer = setTimeout(() => (this.n-- > 0 ? this.show() : this.onDone?.()), COUNTDOWN_HOLD);
    }, COUNTDOWN_GAP);
  }
  destroy() { clearTimeout(this.timer); }
}

/**
 * Countdown: a GooDigit run by a CountdownTimer.
 * @param {number} [from=5] - Starting digit, 0..9.
 * @param {Function} [onDone]
 */
const Countdown = ({ from = 5, onDone, className, style }) => {
  const ref = useRef(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const timer = new CountdownTimer(ref.current, from, () => done.current?.());
    return () => timer.destroy();
  }, [from]);
  return <GooDigit ref={ref} data-name="countdown" digit={null} className={className} style={style} role="timer" />;
}

/* ---------- parallax ---------- */

/**
 * ParallaxMotion: moves node along y as the page scrolls: 0 when its parent is centered in the window, then
 * (how far the window's center is past the parent's) x speed. Positive speed lags the scroll (a background feel: it
 * slides down in its parent as you scroll down), negative leads it.
 * Measures the parent, not the element, so its own movement doesn't feed back. Runs only while the parent is
 * near the screen, once per frame, and stays still for reduced motion. Give the parent overflow: clip to hide
 * the edges the element uncovers. destroy() stops it.
 * @param {HTMLElement} node @param {number} [speed=0.2]
 */
class ParallaxMotion {
  constructor(node, speed = 0.2) {
    this.node = node;
    this.parent = node.parentElement;
    this.speed = speed;
    this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.frame = 0;
    this.visible = false;
    this.observer = new IntersectionObserver(([ entry ]) => { this.visible = entry.isIntersecting; this.queue(); },
      { rootMargin: '25% 0px' });
    this.observer.observe(this.parent);
    window.addEventListener('scroll', this.queue, { passive: true });
    window.addEventListener('resize', this.queue);
    this.motion.addEventListener('change', this.draw);
  }
  draw = () => {
    this.frame = 0;
    const box = this.parent.getBoundingClientRect();
    // Distance of the window's center past the parent's: as the page scrolls down it grows, so the element slides
    // down inside its parent (it lags; far layers sink behind near ones).
    const offset = (window.innerHeight / 2 - (box.top + box.height / 2)) * this.speed;
    this.node.style.translate = this.motion.matches ? '' : `0 ${offset.toFixed(1)}px`;
  };
  queue = () => { if (this.visible && !this.frame) this.frame = requestAnimationFrame(this.draw); };
  destroy() {
    this.observer.disconnect();
    window.removeEventListener('scroll', this.queue);
    window.removeEventListener('resize', this.queue);
    this.motion.removeEventListener('change', this.draw);
    cancelAnimationFrame(this.frame);
  }
}

/**
 * useParallax: a ParallaxMotion on the ref'd element for the component's lifetime.
 * @param {number} [speed=0.2]
 * @returns {React.RefObject}
 */
const useParallax = (speed = 0.2) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current?.parentElement) return;
    const parallax = new ParallaxMotion(ref.current, speed);
    return () => parallax.destroy();
  }, [speed]);
  return ref;
}

/**
 * Parallax: a box moved by useParallax.
 * @param {number} [speed=0.2] @param {string} [as='div'] - Element to render.
 */
const Parallax = ({ speed = 0.2, as: Tag = 'div', className, children }) => {
  const ref = useParallax(speed);
  return <Tag ref={ref} data-component="parallax" className={cx('parallax', className)}>{children}</Tag>;
}

export {
  Orbit, OrbitPlayer, OrbitClock, SolarSystem, Spins, useSpins, GooDigit, Countdown, CountdownTimer, Parallax, useParallax,
  ParallaxMotion, reducedMotion
};
