import {
  Ellipse, Rect, createColor, linearGradient, randomPosition, metaballPath, glowSprite, randomWanderPath, wander
} from "@marccent/util/canvas";
import { Grid } from "../lib/grid_helper";

/*
 * Canvas animations on @marccent/util 2.x, each a class (extends Animation): setup() builds its objects once,
 * theme(t) takes the theme's colors, draw() draws a frame, destroy() cleans up. Plain JavaScript: the canvas
 * backgrounds run them from markup (watchCanvases, core/canvas-background.js) and React wraps them as components
 * (animate() in components/visuals/canvas.js). Animations with few objects use util Shapes (c.add(), c.run()); ones
 * with hundreds (Fire, ParticleFlowfield, OrbitAnim) keep them in a ParticlePool and draw straight to the 2D
 * context, since a Shape per item costs too much per frame. The stock chart is one too (Chart).
 */

/* ---------- helpers ---------- */

// Average of the canvas sides: sizes and counts scale with it.
const avgSide = (p) => (p.width + p.height) / 2;

// The color of the see-through animations (Snow, Rain, Bubbles) as { r, g, b }: the fixed one, or white on dark;
// on light, white wouldn't show, so the theme's primary.
const overlayRgb = (anim, t) => (anim.fixed ? rgbOf(anim.p, anim.fixed[0]) : (t.isDark ? t.rev() : t.primary()).rgb);

// Any CSS color p5 reads ("#fff", "white", "rgb(…)") as { r, g, b }, like a theme color's .rgb.
const rgbOf = (p, color) => { const [ r, g, b ] = p.color(color).levels; return { r, g, b }; };

/**
 * The theme's primary-to-secondary gradient across the canvas, from the bottom-right corner to the center, or the
 * animation's own colors when it has them (fixed: one color, or the first two). Returns a function giving the
 * gradient, rebuilt only when the canvas resizes. Call once per theme.
 */
const themeGradient = (c, theme, fixed) => {
  const ends = fixed ? [ fixed[0], fixed[1] ?? fixed[0] ] : [ theme.primary().hex, theme.secondary().hex ];
  const colors = createColor(c.p, ends).fill;
  let gradient = null;
  let size = '';
  return () => {
    if (size !== `${c.width}x${c.height}`) {
      gradient = linearGradient(c.ctx, { x: c.width, y: c.height }, c.center, colors);
      size = `${c.width}x${c.height}`;
    }
    return gradient;
  };
}

/**
 * Many small moving things as numbers, not objects: each field is a Float32Array, particle i is x[i], y[i]…
 * Adding never allocates. When full, add() overwrites the oldest (as long as nothing was removed, which
 * reorders). remove(i) moves the last particle into slot i, so loop backwards when removing.
 * @param {number} max @param {string[]} fields - e.g. ['x', 'y', 'vx', 'vy']
 */
class ParticlePool {
  constructor(max, fields) {
    this.max = max;
    this.fields = fields;
    this.count = 0;
    this.next = 0; // slot add() overwrites once full
    for (const field of fields) this[field] = new Float32Array(max);
  }

  // Adds a particle from { field: value }; fields left out are 0. Returns its index.
  add(values) {
    let i = this.count;
    if (this.count < this.max) this.count++;
    else { i = this.next; this.next = (this.next + 1) % this.max; }
    for (const field of this.fields) this[field][i] = values[field] ?? 0;
    return i;
  }

  remove(i) {
    const last = --this.count;
    for (const field of this.fields) this[field][i] = this[field][last];
  }
}

/* ---------- animations ---------- */

/**
 * Animation: the base class of every background. A subclass builds its objects once in setup(), takes per-theme
 * values (colors, gradients) in theme(t), draws one frame in draw() and undoes what setup started (timers, Scene
 * objects) in destroy(). animate() (components/visuals/canvas.js) runs it on a withThemeCanvas canvas, watchCanvases
 * (core/canvas-background.js) behind any element. this.c is the util Scene, this.p its p5
 * instance and this.el the div the canvas sits in. colors: CSS colors that replace the theme's in theme(t), so the
 * animation keeps them whatever the theme (white snow, red fire over a photo); this.fixed, or null for the theme's.
 */
class Animation {
  constructor(scene, el, colors) {
    this.c = scene;
    this.p = scene.p;
    this.el = el;
    this.fixed = colors?.length ? colors : null;
    this.setup();
  }
  setup() {}
  theme(t) {}
  draw() {}
  destroy() {}
}

// Blobs move as a few groups: each group's center wanders along its own smooth path, and its blobs circle
// that center at their own pace, so a group reads as one big blob slowly changing shape. Each blob also swings
// out from its group and back now and then, far enough to break off as a circle for a moment. Groups wander
// across each other, merging and splitting: one to BLOB_GROUPS big blobs on screen. Drawn as metaballs (util).
const BLOB_GROUPS = 3;
const BLOBS_PER_GROUP = 5;
// How fast group centers wander: path time per frame on a canvas whose sides equal their average. Each axis
// runs its path at avg / side times this, so a center moves about the same share of the average side per
// second on any canvas: a short preview isn't frantic vertically, a wide screen isn't sluggish across.
const BLOB_DRIFT = 0.002;

class Blob extends Animation {
  setup() {
    const p = this.p;
    // Radii and distances are fractions of the canvas' average side, so everything follows resizes.
    this.groups = Array.from({ length: BLOB_GROUPS }, () => ({
      path: randomWanderPath(() => p.random()),
      members: Array.from({ length: BLOBS_PER_GROUP }, () => ({
        size: p.random(0.07, 0.12), // radius
        dist: p.random(0.02, 0.07), // from the group center, when tucked in
        reach: p.random(0.14, 0.24), // how much farther it swings out at most
        swing: p.random(p.TWO_PI), // where it is in its out-and-back cycle
        swingRate: p.random(0.004, 0.01), // radians per frame: one swing every 10-25s
        angle: p.random(p.TWO_PI),
        spin: p.random(0.004, 0.012) * p.random([ -1, 1 ]), // radians per frame
        pos: { x: 0, y: 0 }, // what metaballPath reads, with radius
        radius: 0
      }))
    }));
    this.blobs = this.groups.flatMap((group) => group.members);
    this.clock = { x: 0, y: 0 }; // path time per axis
  }

  theme(t) {
    this.gradient = themeGradient(this.c, t, this.fixed);
  }

  draw() {
    const { c, p, clock } = this;
    p.clear();
    const avg = avgSide(p);
    const dt = c.dt;
    clock.x += BLOB_DRIFT * dt * avg / p.width;
    clock.y += BLOB_DRIFT * dt * avg / p.height;
    for (const group of this.groups) {
      const cx = wander(group.path.x, clock.x) * p.width;
      const cy = wander(group.path.y, clock.y) * p.height;
      for (const blob of group.members) {
        blob.angle += blob.spin * dt;
        blob.swing += blob.swingRate * dt;
        const out = Math.max(0, Math.sin(blob.swing)) ** 2; // 0 for half the cycle, then a smooth swing out
        const dist = (blob.dist + blob.reach * out) * avg;
        blob.pos.x = cx + Math.cos(blob.angle) * dist;
        blob.pos.y = cy + Math.sin(blob.angle) * dist;
        blob.radius = blob.size * avg;
      }
    }
    const ctx = c.ctx;
    ctx.beginPath();
    metaballPath(ctx, this.blobs, c.width, c.height);
    ctx.fillStyle = this.gradient(); // one gradient across all the blobs
    ctx.fill();
  }
}

// Flames are pool particles drawn as pre-drawn glow sprites (util glowSprite, one per theme shade, scaled
// with drawImage) under additive blending. As util Shapes, each shrinking flame rebuilt its radial gradient
// every frame (~300 gradients a frame), which was the lag.
class Fire extends Animation {
  setup() {
    const p = this.p;
    // A flame lives at most avg * 0.3 frames and one is added per frame, so this many is always enough.
    this.flames = new ParticlePool(Math.ceil(avgSide(p) * 0.3) + 2, [ 'x', 'y', 'vx', 'vy', 'size', 'life', 'total', 'sprite' ]);
    // Soft glows lose nothing at half resolution, and the browser scales the canvas back up: 4x fewer pixels
    // to blend, which is most of Fire's cost.
    p.pixelDensity(0.5);
    // Wind: the upward pull drifts every 3s.
    const avg = avgSide(p);
    const x = avg * 0.0015;
    const y = avg * 0.001;
    this.wind = { x: 0, y: -0.2 };
    this.timer = setInterval(() => Object.assign(this.wind, { x: p.random(-x, x), y: p.random(0, -y) }), 3000);
  }

  // Every theme shade (or each fixed color) as a glow sprite, fading into the page color.
  theme(t) {
    const pp = t.primary();
    const s = t.secondary();
    const { r, g, b } = t.mode().rgb;
    const clear = `rgba(${r}, ${g}, ${b}, 0)`;
    const hexes = this.fixed ?? [pp, s, ...pp.lighter, ...pp.darker, ...s.lighter, ...s.darker].map((color) => color.hex);
    this.sprites = hexes.map((hex) => glowSprite(hex, clear));
  }

  draw() {
    const { c, p, flames, wind, sprites } = this;
    p.clear();
    const avg = avgSide(p);
    const dt = c.dt;
    // One new flame a frame, near the bottom middle, drifting off in a random direction.
    const life = p.random(avg * 0.1, avg * 0.3);
    const heading = p.random(p.TWO_PI);
    flames.add({
      x: p.random(p.width * 0.45, p.width * 0.55), y: p.random(p.height * 0.7, p.height * 0.85),
      vx: Math.cos(heading), vy: Math.sin(heading), size: p.random(avg * 0.05, avg * 0.20), life, total: life,
      sprite: Math.floor(p.random(sprites.length))
    });
    const { x, y, vx, vy, size } = flames;
    const ctx = c.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter'; // overlapping flames add up to a brighter core
    for (let i = flames.count - 1; i >= 0; i--) {
      flames.life[i] -= dt;
      if (flames.life[i] <= 0) { flames.remove(i); continue; } // order doesn't matter under additive blending
      // The wind is a force: heavier (bigger) flames bend less. They shrink to nothing over their life.
      vx[i] += wind.x / size[i] * dt;
      vy[i] += wind.y / size[i] * dt;
      x[i] += vx[i] * dt;
      y[i] += vy[i] * dt;
      const s = size[i] * flames.life[i] / flames.total[i];
      ctx.drawImage(sprites[flames.sprite[i]], x[i] - s / 2, y[i] - s / 2, s, s);
    }
    ctx.restore();
  }

  destroy() {
    clearInterval(this.timer);
  }
}

// Dots drifting and bouncing off the edges, a line between every pair close enough (thinner the farther); a
// dot grows with its line count.
class NetworkLoop extends Animation {
  setup() {
    const { c, p } = this;
    this.limit = avgSide(p) / 5;
    this.dots = Array.from({ length: 30 }, () => new Ellipse(c, {
      pos: randomPosition(c, 10), size: 1, vel: { x: p.random(-1, 1), y: p.random(-1, 1) }
    }));
    c.add(...this.dots);
    this.lines = new Array(this.dots.length);
  }

  theme(t) {
    const primary = this.fixed?.[0] ?? t.primary().hex;
    this.line = this.p.color(primary);
    const dot = createColor(this.p, primary);
    for (const item of this.dots) item.color = dot;
  }

  draw() {
    const { c, p, dots, lines, limit } = this;
    p.clear();
    c.bounceEdges();
    lines.fill(0);
    p.stroke(this.line);
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dist = dots[i].pos.dist(dots[j].pos);
        if (dist < limit && dist > 1) {
          lines[i]++;
          lines[j]++;
          p.strokeWeight(p.map(dist, limit, 0, 0, 1));
          p.line(dots[i].pos.x, dots[i].pos.y, dots[j].pos.x, dots[j].pos.y);
        }
      }
    }
    for (let i = 0; i < dots.length; i++) {
      const size = p.map(lines[i], 0, dots.length, 0, 7);
      dots[i].size.set(size, size);
    }
    c.run();
  }

  destroy() {
    for (const dot of this.dots) this.c.remove(dot);
  }
}

// Two huge rounded squares above the middle, turning on the theme gradient: their bottom edges roll like a wave.
// With its own colors (over a photo) it's see-through: no gradient behind, and the squares are faint layers of them.
class Wave extends Animation {
  setup() {
    const { c, p } = this;
    if (!this.fixed) this.el.classList.add('bg-gradient');
    const size = p.width * 2;
    const pos = { x: p.width / 2, y: (p.height / 2) - (size / 2) };
    this.squares = [
      new Rect(c, { pos, size, spin: 0.01, corner: size * 0.45 }),
      new Rect(c, { pos, size, spin: 0.01, corner: size * 0.4 }),
    ];
    c.add(...this.squares);
  }

  theme(t) {
    const { p, fixed } = this;
    const rgba = (color, a) => { const { r, g, b } = rgbOf(p, color); return `rgba(${r}, ${g}, ${b}, ${a})`; };
    this.squares[0].color = createColor(p, fixed ? rgba(fixed[0], 0.3) : t.rgb('mode', 1));
    this.squares[1].color = createColor(p, fixed ? rgba(fixed[1] ?? fixed[0], 0.2) : t.rgb('mode', 0.5));
  }

  draw() {
    this.p.clear();
    this.c.run();
  }

  destroy() {
    for (const square of this.squares) this.c.remove(square);
    this.el.classList.remove('bg-gradient');
  }
}

// Particles live in a ParticlePool (new ones overwrite the oldest once full) and are drawn with one fillRect
// each under a shared gradient fill. ~1000 Shape objects, each doing push / style / ellipse / pop, plus a
// full-canvas repaint for the gradient, every frame, was the lag. Each particle is its own fill (not one
// path) so piled-up particles blend: they add up to light in the dark theme ('lighter') and cancel to dark in
// the light theme ('difference').
const PARTICLES_PER_FRAME = 2;
const PARTICLE_MAX_SPEED = 3;

class ParticleFlowfield extends Animation {
  setup() {
    const { c, p } = this;
    // As many particles as the canvas' average side.
    this.dots = new ParticlePool(Math.ceil(avgSide(p)), [ 'x', 'y', 'vx', 'vy' ]);
    this.size = Math.ceil(avgSide(p) * 0.002);
    c.setFlowfield({ cellSize: Math.max(10, Math.floor(p.width * 0.1)), step: 2, offset: 0.1, speed: 0.001 });
    p.noiseDetail(1);
  }

  theme(t) {
    this.gradient = themeGradient(this.c, t, this.fixed);
    this.blend = t.isDark ? 'lighter' : 'difference';
  }

  draw() {
    const { c, p, dots, size } = this;
    const field = c.flowfield;
    if (!field.cols) return; // canvas still 0 wide: the field rebuilds on the first resize
    const w = p.width;
    const h = p.height;
    const dt = c.dt;
    for (let n = 0; n < PARTICLES_PER_FRAME; n++) {
      dots.add({ x: p.random(size, w - size), y: p.random(size, h - size) });
    }
    field.update(dt);

    // Same motion as a Shape: the cell's direction is a force (÷ mass = size), speed capped, then wrap.
    const { x, y, vx, vy } = dots;
    const { cellSize, cols, rows } = field;
    const half = size / 2;
    p.clear();
    const ctx = c.ctx;
    ctx.save();
    ctx.globalCompositeOperation = this.blend;
    ctx.fillStyle = this.gradient();
    for (let i = 0; i < dots.count; i++) {
      const col = Math.min(cols - 1, Math.max(0, Math.floor(x[i] / cellSize)));
      const row = Math.min(rows - 1, Math.max(0, Math.floor(y[i] / cellSize)));
      const force = field.field[col][row].vel;
      vx[i] += force.x / size * dt;
      vy[i] += force.y / size * dt;
      const speed = Math.hypot(vx[i], vy[i]);
      if (speed > PARTICLE_MAX_SPEED) {
        vx[i] *= PARTICLE_MAX_SPEED / speed;
        vy[i] *= PARTICLE_MAX_SPEED / speed;
      }
      x[i] = (x[i] + vx[i] * dt + w) % w;
      y[i] = (y[i] + vy[i] * dt + h) % h;
      ctx.fillRect(x[i] - half, y[i] - half, size, size); // squares: at 1-2px they look the same as circles
    }
    ctx.restore();
  }
}

// Orbits are just radii around the canvas center, and their ~600 dots are pool particles (which orbit, where
// on it, how fast) drawn as one path with one fill. As util Orbits of Ellipses, every dot did push / style /
// ellipse / pop each frame.
class OrbitAnim extends Animation {
  setup() {
    const p = this.p;
    const avg = avgSide(p);
    this.min = avg * 0.1; // orbit widths (diameters) breathe between these
    this.max = avg * 1.3;
    this.radii = Array.from({ length: Math.floor(avg * 0.05) }, () => Math.floor(p.random(this.min, this.max)) / 2);
    const perOrbit = (radius) => Math.ceil(radius * 2 * 0.01); // wider orbits carry more dots
    this.dots = new ParticlePool(this.radii.reduce((n, radius) => n + perOrbit(radius), 0), [ 'orbit', 'angle', 'speed' ]);
    this.radii.forEach((radius, orbit) => {
      for (let j = 0; j < perOrbit(radius); j++) this.dots.add({ orbit, angle: p.random(p.TWO_PI), speed: p.random(0.002, 0.005) });
    });
    this.size = avg * 0.001 + 2; // + 2: the 1px outline the dots used to have
  }

  theme(t) {
    this.color = this.fixed?.[0] ?? t.rev().hex;
    this.trail = t.mode().rgb;
  }

  draw() {
    const { c, p, min, max, radii, dots, size } = this;
    const { r, g, b } = this.trail;
    const dt = c.dt;
    p.background(r, g, b, 60); // translucent: the dots leave trails
    // Orbits breathe: each frame they all grow or shrink together, reversing at min / max width.
    let vel = p.random(-0.4, 0.4);
    for (let i = 0; i < radii.length; i++) {
      if (radii[i] * 2 < min || radii[i] * 2 > max) vel = -vel;
      radii[i] += vel / 2;
    }
    const cx = p.width / 2;
    const cy = p.height / 2;
    const half = size / 2;
    const ctx = c.ctx;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    for (let i = 0; i < dots.count; i++) {
      dots.angle[i] += dots.speed[i] * dt;
      const radius = radii[dots.orbit[i]];
      ctx.rect(cx + Math.cos(dots.angle[i]) * radius - half, cy + Math.sin(dots.angle[i]) * radius - half, size, size);
    }
    ctx.fill();
  }
}

// Snow: flakes are pool particles in three depths. Near flakes are bigger, brighter and fall faster than far ones,
// so the snow has depth. Each flake sways side to side at its own pace, a slow gust (noise) pushes them all
// together, and a flake that falls out the bottom comes back in at the top. Positions are fractions of the canvas
// and sizes of its average side, so the snow follows resizes. One path per depth: a fill per layer, not per flake.
const SNOW_DEPTHS = [ { size: 0.0025, fall: 0.0008, alpha: 0.35 }, { size: 0.004, fall: 0.0014, alpha: 0.6 }, { size: 0.006, fall: 0.0022, alpha: 0.9 } ];
const SNOW_PER_SIDE = 0.2; // flakes per pixel of the canvas' average side

class Snow extends Animation {
  setup() {
    const p = this.p;
    this.flakes = new ParticlePool(Math.ceil(avgSide(p) * SNOW_PER_SIDE), [ 'x', 'y', 'depth', 'size', 'sway', 'swayRate' ]);
    for (let i = 0; i < this.flakes.max; i++) {
      this.flakes.add({
        x: p.random(), y: p.random(), // spread over the whole canvas from the start: no wait for the first flakes
        depth: Math.floor(p.random(SNOW_DEPTHS.length)),
        size: p.random(0.7, 1.3), // x the depth's size
        sway: p.random(p.TWO_PI),
        swayRate: p.random(0.01, 0.03), // radians per frame
      });
    }
    this.time = 0;
  }

  // White snow on dark; on light, white wouldn't show, so the flakes take the theme's primary color (or a fixed one).
  theme(t) {
    const { r, g, b } = overlayRgb(this, t);
    this.colors = SNOW_DEPTHS.map(({ alpha }) => `rgba(${r}, ${g}, ${b}, ${alpha})`);
  }

  draw() {
    const { c, p, flakes } = this;
    const dt = c.dt;
    const avg = avgSide(p);
    const w = p.width, h = p.height;
    this.time += 0.002 * dt;
    const gust = (p.noise(this.time) - 0.5) * 0.002; // shared drift, as a fraction of the width per frame
    const { x, y, depth, size, sway, swayRate } = flakes;
    p.clear();
    const ctx = c.ctx;
    SNOW_DEPTHS.forEach((d, layer) => {
      ctx.beginPath();
      for (let i = 0; i < flakes.count; i++) {
        if (depth[i] !== layer) continue;
        sway[i] += swayRate[i] * dt;
        // Falls at its depth's pace, adjusted to the canvas' shape so a wide canvas isn't slower.
        y[i] += d.fall * dt * avg / h;
        x[i] += (gust * (layer + 1) / SNOW_DEPTHS.length + Math.sin(sway[i]) * 0.0004) * dt * avg / w;
        if (y[i] > 1.02) { y[i] = -0.02; x[i] = p.random(); }
        x[i] = (x[i] + 1) % 1;
        const radius = d.size * size[i] * avg;
        const px = x[i] * w, py = y[i] * h;
        ctx.moveTo(px + radius, py);
        ctx.arc(px, py, radius, 0, Math.PI * 2);
      }
      ctx.fillStyle = this.colors[layer];
      ctx.fill();
    });
  }
}


// Fireflies: a few dozen glowing dots that wander (each turns a little every frame, steered by noise) and blink at
// their own pace. Their own warm yellow-green (or the first fixed color), whatever the theme, so they read on forest
// photos. The glow is one sprite, drawn once and stamped per fly (a gradient or shadowBlur per fly costs far more).
const FIREFLIES_PER_SIDE = 0.08;
const FIREFLY_COLOR = '#d6ff70';

class Fireflies extends Animation {
  setup() {
    const p = this.p;
    this.flies = new ParticlePool(Math.ceil(avgSide(p) * FIREFLIES_PER_SIDE) + 4, [ 'x', 'y', 'angle', 'speed', 'size', 'phase', 'rate', 'seed' ]);
    for (let i = 0; i < this.flies.max; i++) {
      this.flies.add({
        x: p.random(), y: p.random(0.15, 1), angle: p.random(p.TWO_PI),
        speed: p.random(0.0004, 0.0012), // of the average side, per frame
        size: p.random(0.6, 1.4), phase: p.random(p.TWO_PI), rate: p.random(0.02, 0.05), seed: p.random(1000),
      });
    }
    this.sprite = document.createElement('canvas');
    this.time = 0;
  }

  // The glow: a white-hot core fading out through the color, on a small offscreen canvas.
  theme() {
    const { r: cr, g: cg, b: cb } = rgbOf(this.p, this.fixed?.[0] ?? FIREFLY_COLOR);
    const rgb = `${cr}, ${cg}, ${cb}`;
    const r = 32;
    this.sprite.width = this.sprite.height = r * 2;
    const g = this.sprite.getContext('2d');
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(255, 255, 235, 1)');
    grad.addColorStop(0.2, `rgba(${rgb}, 1)`);
    grad.addColorStop(0.5, `rgba(${rgb}, .35)`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, r * 2, r * 2);
  }

  draw() {
    const { c, p, flies, sprite } = this;
    const dt = c.dt;
    const avg = avgSide(p);
    const w = p.width, h = p.height;
    this.time += 0.01 * dt;
    const { x, y, angle, speed, size, phase, rate, seed } = flies;
    p.clear();
    const ctx = c.ctx;
    for (let i = 0; i < flies.count; i++) {
      angle[i] += (p.noise(seed[i], this.time) - 0.5) * 0.15 * dt;
      x[i] += Math.cos(angle[i]) * speed[i] * dt * avg / w;
      y[i] += Math.sin(angle[i]) * speed[i] * dt * avg / h;
      x[i] = (x[i] + 1.05) % 1.1 - 0.05; // wrap, a little past each edge so they don't pop in
      y[i] = (y[i] + 1.05) % 1.1 - 0.05;
      phase[i] += rate[i] * dt;
      const blink = Math.max(0, Math.sin(phase[i])); // dark half the time, like real ones
      ctx.globalAlpha = 0.15 + 0.85 * blink * blink;
      const d = 0.06 * avg * size[i];
      ctx.drawImage(sprite, x[i] * w - d / 2, y[i] * h - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }
}

// Leaves: like Snow, but leaf shapes in greens and autumn yellows (or the fixed colors), spinning as they fall and
// turning over (a flattened width), with a slow gust. Their own colors, whatever the theme. A leaf is two curves,
// drawn with a transform per leaf; there are few enough for a fill each.
const LEAVES_PER_SIDE = 0.06;
const LEAF_COLORS = [ '#7cb342', '#9ccc65', '#c0ca33', '#fbc02d', '#f9a825', '#8d6e63' ];

class Leaves extends Animation {
  setup() {
    const p = this.p;
    this.leaves = new ParticlePool(Math.ceil(avgSide(p) * LEAVES_PER_SIDE) + 3,
      [ 'x', 'y', 'size', 'fall', 'spin', 'spinRate', 'flip', 'flipRate', 'sway', 'color' ]);
    for (let i = 0; i < this.leaves.max; i++) this.leaves.add(this.leaf(p.random(-0.1, 1)));
    this.time = 0;
  }

  leaf(y) {
    const p = this.p;
    return {
      x: p.random(), y, size: p.random(0.7, 1.3), fall: p.random(0.0008, 0.0018),
      spin: p.random(p.TWO_PI), spinRate: p.random(-0.03, 0.03), flip: p.random(p.TWO_PI), flipRate: p.random(0.02, 0.06),
      sway: p.random(p.TWO_PI), color: p.random(), // which of the colors: a fraction, so any number of them works
    };
  }

  draw() {
    const { c, p, leaves } = this;
    const dt = c.dt;
    const avg = avgSide(p);
    const w = p.width, h = p.height;
    this.time += 0.002 * dt;
    const gust = (p.noise(this.time) - 0.5) * 0.003;
    const { x, y, size, fall, spin, spinRate, flip, flipRate, sway, color } = leaves;
    p.clear();
    const ctx = c.ctx;
    for (let i = 0; i < leaves.count; i++) {
      sway[i] += 0.02 * dt;
      spin[i] += spinRate[i] * dt;
      flip[i] += flipRate[i] * dt;
      y[i] += fall[i] * dt * avg / h;
      x[i] += (gust + Math.sin(sway[i]) * 0.0008) * dt * avg / w;
      if (y[i] > 1.05) this.reset(i);
      x[i] = (x[i] + 1.1) % 1.2 - 0.1;
      const len = 0.045 * avg * size[i];
      const turn = Math.cos(flip[i]); // -1..1: the leaf seen edge-on at 0
      ctx.setTransform(1, 0, 0, 1, x[i] * w, y[i] * h);
      ctx.rotate(spin[i]);
      ctx.scale(1, Math.abs(turn) * 0.9 + 0.1);
      ctx.beginPath();
      ctx.moveTo(-len / 2, 0);
      ctx.quadraticCurveTo(0, -len * 0.45, len / 2, 0);
      ctx.quadraticCurveTo(0, len * 0.45, -len / 2, 0);
      const colors = this.fixed ?? LEAF_COLORS;
      ctx.fillStyle = colors[Math.floor(color[i] * colors.length)];
      ctx.globalAlpha = turn < 0 ? 0.75 : 0.95; // the underside a little paler
      ctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }

  // A leaf that fell out the bottom comes back above the top, as a new leaf.
  reset(i) {
    const values = this.leaf(-0.05);
    for (const field of this.leaves.fields) this.leaves[field][i] = values[field];
  }
}

// Rain: thin streaks falling at a slant, and ripples where drops land: rings that open and fade, flattened (a water
// surface seen from the side). Ripples land in the lower part of the canvas, where water is in most photos.
const RAIN_PER_SIDE = 0.12;
const RIPPLES_PER_FRAME = 0.025; // per pixel of the average side / 100
const RIPPLE_LIFE = 90; // frames

class Rain extends Animation {
  setup() {
    const p = this.p;
    this.drops = new ParticlePool(Math.ceil(avgSide(p) * RAIN_PER_SIDE), [ 'x', 'y', 'len', 'speed' ]);
    for (let i = 0; i < this.drops.max; i++) {
      this.drops.add({ x: p.random(), y: p.random(), len: p.random(0.6, 1.2), speed: p.random(0.012, 0.02) });
    }
    this.ripples = new ParticlePool(80, [ 'x', 'y', 'age', 'size' ]);
    this.spawn = 0;
  }

  theme(t) {
    const { r, g, b } = overlayRgb(this, t);
    this.rgb = `${r}, ${g}, ${b}`;
  }

  draw() {
    const { c, p, drops, ripples } = this;
    const dt = c.dt;
    const avg = avgSide(p);
    const w = p.width, h = p.height;
    p.clear();
    const ctx = c.ctx;
    // Streaks: one path, one stroke.
    const slant = 0.15;
    ctx.beginPath();
    for (let i = 0; i < drops.count; i++) {
      drops.y[i] += drops.speed[i] * dt * avg / h;
      drops.x[i] += drops.speed[i] * slant * dt * avg / w;
      if (drops.y[i] > 1.05) { drops.y[i] = -0.05; drops.x[i] = p.random(-0.1, 1); }
      const px = drops.x[i] * w, py = drops.y[i] * h, len = 0.03 * avg * drops.len[i];
      ctx.moveTo(px, py);
      ctx.lineTo(px - len * slant, py - len);
    }
    ctx.strokeStyle = `rgba(${this.rgb}, .35)`;
    ctx.lineWidth = Math.max(1, avg * 0.0015);
    ctx.stroke();
    // Ripples: a few new ones a frame, each a ring that grows and fades (a second, smaller ring inside it).
    this.spawn += RIPPLES_PER_FRAME * avg / 100 * dt;
    for (; this.spawn >= 1; this.spawn--) ripples.add({ x: p.random(), y: p.random(0.45, 1), age: 0, size: p.random(0.7, 1.3) });
    ctx.lineWidth = Math.max(1.5, avg * 0.003);
    for (let i = ripples.count - 1; i >= 0; i--) {
      ripples.age[i] += dt;
      const t = ripples.age[i] / RIPPLE_LIFE;
      if (t >= 1) { ripples.remove(i); continue; }
      const rx = (0.008 + 0.07 * t) * avg * ripples.size[i] * (0.6 + ripples.y[i] * 0.6); // nearer (lower): bigger
      ctx.strokeStyle = `rgba(${this.rgb}, ${(1 - t) * 0.9})`;
      ctx.beginPath();
      ctx.ellipse(ripples.x[i] * w, ripples.y[i] * h, rx, rx * 0.3, 0, 0, Math.PI * 2);
      if (t > 0.2) ctx.ellipse(ripples.x[i] * w, ripples.y[i] * h, rx * 0.55, rx * 0.55 * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// Bubbles: rings rising from the bottom at their size's pace (big ones faster), wobbling side to side, each with a
// small highlight. A bubble that leaves the top comes back in at the bottom.
const BUBBLES_PER_SIDE = 0.06;

class Bubbles extends Animation {
  setup() {
    const p = this.p;
    this.bubbles = new ParticlePool(Math.ceil(avgSide(p) * BUBBLES_PER_SIDE) + 4, [ 'x', 'y', 'size', 'wobble', 'rate' ]);
    for (let i = 0; i < this.bubbles.max; i++) {
      this.bubbles.add({ x: p.random(), y: p.random(0, 1.1), size: p.random(0.3, 1.5), wobble: p.random(p.TWO_PI), rate: p.random(0.03, 0.07) });
    }
  }

  theme(t) {
    const { r, g, b } = overlayRgb(this, t);
    this.rgb = `${r}, ${g}, ${b}`;
  }

  draw() {
    const { c, p, bubbles } = this;
    const dt = c.dt;
    const avg = avgSide(p);
    const w = p.width, h = p.height;
    const { x, y, size, wobble, rate } = bubbles;
    p.clear();
    const ctx = c.ctx;
    const rings = new Path2D(), shine = new Path2D();
    for (let i = 0; i < bubbles.count; i++) {
      wobble[i] += rate[i] * dt;
      y[i] -= (0.0008 + 0.0012 * size[i]) * dt * avg / h;
      if (y[i] < -0.05) { y[i] = 1.05; x[i] = p.random(); }
      const r = 0.012 * avg * size[i];
      const px = (x[i] + Math.sin(wobble[i]) * 0.006 * size[i]) * w, py = y[i] * h;
      rings.moveTo(px + r, py);
      rings.arc(px, py, r, 0, Math.PI * 2);
      shine.moveTo(px - r * 0.55 + r * 0.25, py - r * 0.35);
      shine.arc(px - r * 0.35, py - r * 0.35, r * 0.25, 0, Math.PI * 2);
    }
    ctx.fillStyle = `rgba(${this.rgb}, .08)`;
    ctx.fill(rings);
    ctx.strokeStyle = `rgba(${this.rgb}, .6)`;
    ctx.lineWidth = Math.max(1, avg * 0.0018);
    ctx.stroke(rings);
    ctx.fillStyle = `rgba(${this.rgb}, .7)`;
    ctx.fill(shine);
  }
}

/* ---------- chart ---------- */

/**
 * Chart: the stock chart, an Animation like the backgrounds: the closing prices as a line, and a crosshair under the
 * pointer whose day and price it writes into the readout element (no React state, so hovering re-renders nothing).
 * data({ obj, base, pts }) takes a ticker: obj { data, min, max }, base price steps a column, pts a step's size.
 */
class Chart extends Animation {
  setup() {
    const p = this.p;
    p.frameRate(30);
    p.textSize(10);
    p.fill(255);
    p.strokeWeight(1);
    p.stroke(255);
  }

  theme(t) {
    this.rgb = t.rev().rgb;
  }

  // Hover grid (grid_helper Grid): a column per day, a row per price step from max down.
  data({ obj, base, pts }) {
    const { data, max } = obj;
    this.obj = obj;
    this.grid = new Grid(base, data.length, (row, col) => ({ date: data[col].Date, price: max - row * pts }));
    this.hovered = undefined;
    this.select(this.grid.get(0, 0));
  }

  // draw runs every frame: only touch the readout when the hovered cell changes.
  select(cell) {
    if (cell === this.hovered) return;
    this.hovered = cell;
    this.readout.textContent = cell ? `${cell.date.format('dddd, DD MMMM YYYY')} ${cell.price.toFixed(4)}` : '';
  }

  draw() {
    const { p, rgb, grid } = this;
    const { data, min, max } = this.obj;
    p.clear();
    p.noFill();
    p.beginShape();
    p.stroke(rgb.r, rgb.g, rgb.b);
    for (let i = 0; i < data.length; i++) {
      const x = p.map(i, 0, data.length, 0, p.width);
      const y = p.map(data[i].Close, min, max, p.height, 0);
      p.vertex(x, y);
    }
    p.endShape();
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      p.line(0, p.mouseY, p.width, p.mouseY); // crosshair, in the stroke set above
      p.line(p.mouseX, 0, p.mouseX, p.height);
      const { row, col } = grid.cellAt(p.mouseX, p.mouseY, p.width, p.height);
      this.select(grid.get(row, col));
    } else {
      this.select(null);
    }
  }
}

export { Animation, Blob, Fire, Wave, NetworkLoop, ParticleFlowfield, OrbitAnim, Snow, Fireflies, Leaves, Rain, Bubbles, Chart };
