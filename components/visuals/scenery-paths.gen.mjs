// Generates components/visuals/scenery-paths.js: detailed silhouette layers in a 1440 x 320 box.
// Each layer: { ground, clip, parts: [[tone, d], ...] }; tone: base (the layer color), light (toward the sky),
// dark (shadow), line (stroked in the layer color). clip: light/dark parts are clipped to the base parts' union.
// Usage (from next/): node components/visuals/scenery-paths.gen.mjs components/visuals/scenery-paths.js
import { writeFileSync } from 'fs';

const W = 1440, H = 320;
let seed = 7;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const R = (a, b) => a + rnd() * (b - a);
const RI = (a, b) => Math.floor(R(a, b + 1));
const n = (v) => Math.abs(v) >= 10 ? Math.round(v) : Math.round(v * 10) / 10; // whole numbers past 10: small enough at this size
// Every k-th point (and the last): the bands that follow a ridge don't need all its points.
const thin = (pts, k = 4) => pts.filter((_, i) => i % k === 0 || i === pts.length - 1);
const pt = ([ x, y ]) => `${n(x)} ${n(y)}`;
const poly = (pts) => `M${pts.map(pt).join(' L')}Z`;
// Clockwise, like the polygons, so shapes that overlap add up instead of cutting holes (nonzero fill).
const circle = (cx, cy, r) => `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 1 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 1 ${n(-2 * r)} 0`;
const rect = (x, y, w, h) => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`;
const ground = (pts) => poly([ [ 0, H ], ...pts, [ W, H ] ]);

// Midpoint displacement between control points: jagged ridges.
const jag = (ctrl, levels, rough) => {
  let pts = ctrl;
  for (let l = 0; l < levels; l++) {
    const next = [ pts[0] ];
    for (let i = 1; i < pts.length; i++) {
      const [ x0, y0 ] = pts[i - 1], [ x1, y1 ] = pts[i];
      const d = Math.hypot(x1 - x0, y1 - y0);
      next.push([ (x0 + x1) / 2 + R(-.1, .1) * d * rough, (y0 + y1) / 2 + R(-1, 1) * d * rough * .5 ], [ x1, y1 ]);
    }
    pts = next;
  }
  return pts;
};
// Catmull-Rom through control points, sampled every step px: smooth ridges.
const smooth = (ctrl, step = 12) => {
  const out = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(i - 1, 0)], p1 = ctrl[i], p2 = ctrl[i + 1], p3 = ctrl[Math.min(i + 2, ctrl.length - 1)];
    const k = Math.max(2, Math.ceil((p2[0] - p1[0]) / step));
    for (let s = 0; s < k; s++) {
      const t = s / k, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([ f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]) ]);
    }
  }
  out.push(ctrl.at(-1));
  return out;
};
const yAt = (pts, x) => { for (let i = 1; i < pts.length; i++) if (pts[i][0] >= x) { const [ x0, y0 ] = pts[i - 1], [ x1, y1 ] = pts[i]; return y0 + (y1 - y0) * ((x - x0) / (x1 - x0 || 1)); } return pts.at(-1)[1]; };
const wobble = (x0, x1, y, amp, step = 10) => { const p = []; for (let x = x0; x <= x1; x += step) p.push([ x, y + R(-amp, amp) ]); return p; };

const L = {};
// Shapes kept from the original layers for the detail added to them further down (no random draws, so the originals keep their shapes).
const CITY = [], FARM = {};

/* SKY ------------------------------------------------------------------------------------------------------------ */

// Stars: dots of three sizes and a few four-point sparkles.
{
  const dots = [], sparks = [];
  for (let i = 0; i < 170; i++) dots.push(circle(R(0, W), R(4, 230) ** 1 , [ .7, 1, 1.3, 1.8 ][RI(0, 3)]));
  for (let i = 0; i < 9; i++) { const x = R(40, W - 40), y = R(15, 170), s = R(5, 9); sparks.push(poly([ [ x, y - s ], [ x + s * .18, y - s * .18 ], [ x + s, y ], [ x + s * .18, y + s * .18 ], [ x, y + s ], [ x - s * .18, y + s * .18 ], [ x - s, y ], [ x - s * .18, y - s * .18 ] ])); }
  L.stars = { parts: [ [ 'base', dots.join('') + sparks.join('') ] ] };
}
// Moon: a full disc with craters and a bright limb.
{
  const cx = 1180, cy = 95, r = 48, craters = [];
  for (const [ dx, dy, cr ] of [ [ -16, -14, 13 ], [ 14, 8, 10 ], [ -4, 20, 7 ], [ 22, -18, 6 ], [ -26, 10, 5 ], [ 6, -30, 4 ], [ 30, 22, 4 ] ]) craters.push(circle(cx + dx, cy + dy, cr));
  L.moon = { clip: true, parts: [ [ 'base', circle(cx, cy, r) ], [ 'dark', craters.join('') ], [ 'light', circle(cx - 18, cy - 20, 18) ] ] };
}
// Sun: a disc and a ring of rays.
{
  const cx = 1160, cy = 110, r = 52, rays = [];
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, a1 = a - .045, a2 = a + .045, r1 = r + 12, r2 = r + (i % 2 ? 26 : 38); rays.push(poly([ [ cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1 ], [ cx + Math.cos(a) * r2, cy + Math.sin(a) * r2 ], [ cx + Math.cos(a2) * r1, cy + Math.sin(a2) * r1 ] ])); }
  L.sun = { parts: [ [ 'base', circle(cx, cy, r) + rays.join('') ] ] };
}
// Clouds: cumulus heaps with flat bottoms and a shaded underside.
{
  const base = [], dark = [], light = [];
  for (const [ x0, y0, w ] of [ [ 60, 95, 210 ], [ 470, 60, 150 ], [ 780, 120, 260 ], [ 1230, 70, 170 ] ]) {
    const puffs = Math.round(w / 28);
    for (let i = 0; i < puffs; i++) {
      const t = i / (puffs - 1), cx = x0 + t * w, rr = (1 - Math.abs(t - .45) * 1.4) * w * .2 + R(6, 12);
      base.push(circle(cx, y0 - rr * .6, rr));
      if (t > .15 && t < .8) light.push(circle(cx - rr * .25, y0 - rr * .9, rr * .55));
    }
    base.push(poly([ [ x0 - 4, y0 - 14 ], [ x0 + w + 4, y0 - 14 ], [ x0 + w + 10, y0 - 2 ], [ x0 + w, y0 + 4 ], [ x0, y0 + 4 ], [ x0 - 10, y0 - 2 ] ]));
    dark.push(rect(x0 - 40, y0 - 12, w + 80, 30));
  }
  L.clouds = { clip: true, parts: [ [ 'base', base.join('') ], [ 'light', light.join('') ], [ 'dark', dark.join('') ] ] };
}
// Birds: a V of gulls and a few strays, wings at different beats.
{
  const b = [];
  const gull = (x, y, s, beat) => `M${n(x - 10 * s)} ${n(y + beat * s)} q${n(5 * s)} ${n(-7 * s)} ${n(10 * s)} ${n(-beat * s)} q${n(5 * s)} ${n(-7 * s)} ${n(10 * s)} ${n(beat * s)}`;
  // The V: a leader, then pairs trailing behind it (to the left), one up and one down.
  for (let i = 0; i < 9; i++) { const k = Math.ceil(i / 2), side = i % 2 ? 1 : -1; b.push(gull(1010 - k * 30, 80 + side * k * 15, 1 - k * .06, [ 2, 0, -2 ][i % 3])); }
  for (const [ x, y, s ] of [ [ 760, 110, .8 ], [ 820, 90, .6 ], [ 1240, 140, .9 ], [ 640, 70, .5 ] ]) b.push(gull(x, y, s, RI(-2, 2)));
  L.birds = { stroke: true, parts: [ [ 'line', b.join(' ') ] ] };
}

/* GROUND --------------------------------------------------------------------------------------------------------- */

// Mountains: jagged peaks with snow caps, shadowed right faces and gullies.
{
  const ctrl = [ [ 0, 200 ] ];
  const peaks = [];
  let x = 0;
  while (x < W) { const px = x + R(90, 160), py = R(35, 120); peaks.push([ px, py ]); ctrl.push([ px, py ]); x = px + R(80, 150); ctrl.push([ Math.min(x, W), R(170, 225) ]); }
  const ridge = jag(ctrl, 6, .32).filter(p => p[0] <= W);
  const snow = [], dark = [], gullies = [];
  peaks.forEach(([ px, py ], i) => {
    const valleyR = ctrl[ctrl.indexOf(ctrl.find(c => c[0] === px)) + 1]?.[0] ?? W;
    // Shadow: right of a jagged spine from the peak down.
    const spine = jag([ [ px, py ], [ px + R(10, 50), H ] ], 4, .5);
    dark.push(poly([ ...spine, [ valleyR + 5, H ], [ valleyR + 5, 0 ], [ px, 0 ] ]));
    // Snow: everything above a dripping line under the peak.
    if (py < 100) {
      const sy = py + R(28, 46), drips = [];
      for (let sx = px + 90; sx >= px - 90; sx -= 9) drips.push([ sx, sy + (Math.abs(sx - px) / 6) + (RI(0, 3) === 0 ? R(8, 22) : R(-3, 4)) ]);
      snow.push(poly([ [ px - 90, 0 ], [ px + 90, 0 ], ...drips ]));
    }
    for (let g = 0; g < 3; g++) { const gx = px + R(-70, 60), gy = yAt(ridge, gx) + R(6, 20); gullies.push(poly(jag([ [ gx, gy ], [ gx + R(-12, 12), gy + R(50, 110) ] ], 3, .4).concat([ [ gx + 4, gy + 4 ] ]))); }
  });
  L.mountains = { ground: true, clip: true, parts: [ [ 'base', ground(ridge) ], [ 'dark', dark.join('') ], [ 'dark', gullies.join('') ], [ 'light', snow.join('') ] ] };
}
// Hills: rolling curves topped with round trees, field bands and hedgerows across them.
{
  const ctrl = []; for (let x = -60; x <= W + 60; x += R(150, 220)) ctrl.push([ x, R(165, 235) ]);
  const top = smooth(ctrl).filter(p => p[0] >= -10 && p[0] <= W + 10);
  const trees = [];
  for (let i = 0; i < 26; i++) { const tx = R(10, W - 10), ty = yAt(top, tx), r = R(5, 11); trees.push(circle(tx, ty - r * .6, r), circle(tx + r * .7, ty - r * .3, r * .7), rect(tx - 1, ty - 2, 2, 6)); }
  const bands = [], hedges = [];
  for (let k = 1; k <= 5; k++) {
    const off = k * 22 + R(-4, 4);
    const a = thin(top, 3).map(([ x, y ]) => [ x, y + off + Math.sin(x / 90 + k) * 6 ]), b = thin(top, 3).map(([ x, y ]) => [ x, y + off + 11 + Math.sin(x / 90 + k) * 6 ]).reverse();
    (k % 2 ? bands : hedges).push(poly(k % 2 ? [ ...a, ...b ] : [ ...a, ...a.map(([ x, y ]) => [ x, y + 2.5 ]).reverse() ]));
  }
  L.hills = { ground: true, clip: true, parts: [ [ 'base', ground(top) + trees.join('') ], [ 'light', bands.join('') ], [ 'dark', hedges.join('') ] ] };
}
// Dunes: gentle windward slopes up to sharp crests, shaded slip faces and wind ripples.
{
  const ridge = [ [ 0, 250 ] ], crests = [];
  let x = 0, y = 250;
  while (x < W) {
    const cx = x + R(160, 260), cy = R(150, 215), vx = cx + R(60, 110), vy = R(235, 270);
    for (let t = 1; t <= 12; t++) { const u = t / 12; ridge.push([ x + (cx - x) * u, y + (cy - y) * Math.sin(u * Math.PI / 2) ]); }
    for (let t = 1; t <= 6; t++) { const u = t / 6; ridge.push([ cx + (vx - cx) * u, cy + (vy - cy) * (1 - (1 - u) ** 2) ]); }
    crests.push([ cx, cy, vx ]); x = vx; y = vy;
  }
  const r = ridge.filter(p => p[0] <= W + 40);
  const dark = crests.map(([ cx, cy, vx ]) => poly([ [ cx, cy ], [ cx + 18, cy + 40 ], [ cx + 30, H ], [ vx + 40, H ], [ vx + 40, cy - 10 ] ]));
  const ripples = [];
  for (let k = 0; k < 14; k++) { const off = 14 + k * 9; const a = thin(r, 2).map(([ x, yy ]) => [ x, yy + off + Math.sin(x / 40 + k) * 3 ]); ripples.push(poly([ ...a, ...a.map(([ x, yy ]) => [ x + 6, yy + 1.6 ]).reverse() ])); }
  L.dunes = { ground: true, clip: true, parts: [ [ 'base', ground(r) ], [ 'light', ripples.join('') ], [ 'dark', dark.join('') ] ] };
}
// Canyon: a Grand Canyon: flat rims, stepped walls of cliffs and ledges down to the river, temples standing inside,
// banded rock strata, the sunlit wall on one side and the shaded one on the other.
{
  const p = [ ...wobble(0, 380, 96, 2) ];
  let x = 380, y = 96;
  const stepDown = (to) => { while (y < to) { const cliff = R(14, 34), ledge = R(10, 36); p.push([ x + R(2, 6), y + cliff * .3 ], [ x + R(4, 9), y + cliff ]); x += R(6, 12); y += cliff; p.push([ x + ledge * .6, y + R(2, 6) ], [ x + ledge, y + R(6, 12) ]); x += ledge; y += 8; } };
  stepDown(295);
  const riverL = x; p.push([ x + 20, 312 ], [ x + 60, 312 ]); x += 70; y = 300;
  const stepUp = (to) => { while (y > to) { const cliff = R(14, 34), ledge = R(10, 36); p.push([ x + ledge * .4, y - R(4, 10) ], [ x + ledge, y - R(6, 12) ]); x += ledge; y -= 8; p.push([ x + R(2, 6), y - cliff * .7 ], [ x + R(4, 9), y - cliff ]); x += R(6, 12); y -= cliff; } };
  stepUp(112);
  const riverR = x;
  p.push(...wobble(x, W, 112, 2));
  // Temples: stepped buttes rising from the floor inside the canyon.
  const temple = (cx, top, w) => { const pts = [ [ cx - w, H ] ]; let yy = H, hw = w; while (yy > top + 10) { yy -= R(18, 30); pts.push([ cx - hw, yy + 6 ], [ cx - hw * .85, yy ]); hw *= R(.68, .8); pts.push([ cx - hw, yy ]); } pts.push([ cx - hw * .9, top ], [ cx + hw * .9, top ]); const right = pts.slice(1).map(([ px, py ]) => [ 2 * cx - px, py ]).reverse(); return poly([ ...pts, ...right, [ cx + w, H ] ]); };
  const temples = temple(470, 150, 70) + temple(1020, 140, 80) + temple(760, 200, 40);
  const strata = [], strataDark = [];
  for (let yy = 92, k = 0; yy < H; k++) { const h = R(2, 7); const a = []; for (let xx = 0; xx <= W; xx += 40) a.push([ xx, yy + Math.sin(xx / 170 + k) * 2 ]); const band = poly([ ...a, ...a.map(([ xx, y2 ]) => [ xx, y2 + h ]).reverse() ]); (k % 3 === 0 ? strataDark : k % 3 === 1 ? strata : []).push(band); yy += h + R(2, 8); }
  // The walls: the left one lit (it faces the sun), the right one shaded, each a band hugging its face.
  const leftWall = p.filter(([ px ]) => px >= 375 && px <= riverL + 20), rightWall = p.filter(([ px ]) => px >= riverL + 50 && px <= riverR + 5);
  const lit = poly([ ...leftWall, ...leftWall.map(([ px, py ]) => [ px - 46, py + 10 ]).reverse() ]);
  const shade = poly([ ...rightWall, [ riverR + 60, 112 ], ...rightWall.map(([ px, py ]) => [ px + 60, py + 14 ]).reverse() ]);
  L.canyon = { ground: true, clip: true, parts: [ [ 'base', ground(p) + temples ], [ 'light', strata.join('') + lit ], [ 'dark', strataDark.join('') ], [ 'dark', shade ] ] };
}
// Buttes: Monument Valley: sheer flat-topped buttes and a mitten with its thumb, on talus skirts over a flat floor.
{
  const floor = wobble(0, W, 282, 2, 30);
  const butte = (cx, top, w, thumb) => {
    const tw = w * R(.85, 1), talusW = w * 1.6, ty = R(225, 245);
    const left = [ [ cx - talusW, H ], [ cx - talusW * .9, 284 ], [ cx - w * 1.05, ty + 12 ], [ cx - w, ty ], ...jag([ [ cx - w, ty ], [ cx - tw, top + 6 ] ], 3, .15), [ cx - tw + 3, top ] ];
    const topEdge = wobble(cx - tw + 3, cx + tw - 3, top, 1.2, 12);
    const right = [ [ cx + tw - 3, top ], ...jag([ [ cx + tw, top + 6 ], [ cx + w, ty ] ], 3, .15), [ cx + w * 1.05, ty + 12 ], [ cx + talusW * .9, 284 ], [ cx + talusW, H ] ];
    let d = poly([ ...left, ...topEdge, ...right ]);
    if (thumb) d += poly([ [ cx + w + 8, ty + 8 ], [ cx + w + 10, top + 40 ], [ cx + w + 14, top + 22 ], [ cx + w + 22, top + 24 ], [ cx + w + 26, top + 50 ], [ cx + w + 28, ty + 10 ] ]);
    return { d, shade: poly([ [ cx + w * .15, top - 2 ], [ cx + w + 40, top - 2 ], [ cx + w + 40, ty + 30 ], [ cx + w * .3, ty + 30 ] ]) };
  };
  const bs = [ butte(220, 120, 70, true), butte(640, 90, 95, false), butte(1010, 135, 45, false), butte(1250, 110, 80, true) ];
  const spires = [ [ 840, 170 ], [ 860, 195 ], [ 455, 200 ] ].map(([ sx, st ]) => poly([ [ sx - 9, 284 ], [ sx - 5, st + 10 ], [ sx - 2, st ], [ sx + 3, st + 4 ], [ sx + 6, 284 ] ])).join('');
  const strata = []; for (let yy = 100; yy < 280; yy += R(10, 20)) strata.push(rect(0, yy, W, R(2, 4)));
  L.buttes = { ground: true, clip: true, parts: [ [ 'base', ground(floor) + bs.map(b => b.d).join('') + spires ], [ 'light', strata.join('') ], [ 'dark', bs.map(b => b.shade).join('') ] ] };
}
// Forest: tiered pines of many heights, each with a shaded right half, drawn back to front.
{
  const parts = [ [ 'base', ground(wobble(0, W, 292, 3, 40)) ] ];
  const trees = [];
  for (let i = 0; i < 64; i++) trees.push([ R(-10, W + 10), R(90, 210) ]);
  trees.sort((a, b) => a[1] - b[1]); // short (far) first, tall (near) last
  for (const [ x, h ] of trees) {
    const base = 296, top = base - h, w = h * R(.17, .22), tiers = Math.max(4, Math.round(h / 28));
    const right = [ [ x, top ] ];
    for (let t = 1; t <= tiers; t++) {
      const yy = top + (h - 14) * (t / tiers), ww = w * (.25 + .75 * t / tiers);
      right.push([ x + ww * R(.95, 1.08), yy + R(0, 3) ], [ x + ww * .42, yy - 3 ]);
    }
    right.push([ x + 3, base - 14 ], [ x + 3, base ]);
    const left = right.slice(1).map(([ px, py ]) => [ 2 * x - px + R(-1.5, 1.5), py ]).reverse();
    parts.push([ 'base', poly([ ...right, ...left ]) ]);
    parts.push([ 'dark', poly([ ...right.slice(0, -2), [ x + 1, base - 14 ] ]) ]);
  }
  L.forest = { ground: true, parts };
}
// Trees: broadleaf woods, round canopies of clustered puffs on branching trunks, lit top left and shaded low right.
{
  const parts = [ [ 'base', ground(wobble(0, W, 290, 3, 40)) ] ];
  const trees = []; for (let i = 0; i < 34; i++) trees.push([ R(0, W), R(70, 170) ]);
  trees.sort((a, b) => a[1] - b[1]);
  for (const [ x, h ] of trees) {
    const base = 294, r = h * R(.36, .44), cy = base - h + r;
    const trunk = poly([ [ x - 4, base ], [ x - 2.5, cy + r * .5 ], [ x - 14, cy + r * .1 ], [ x - 12, cy + r * .02 ], [ x - 1, cy + r * .35 ], [ x + 1, cy ], [ x + 3, cy ], [ x + 3, cy + r * .3 ], [ x + 13, cy + r * .05 ], [ x + 14, cy + r * .12 ], [ x + 3.5, cy + r * .5 ], [ x + 5, base ] ]);
    const puffs = [], dark = [], light = [];
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, d = r * R(.35, .6), pr = r * R(.38, .55), px = x + Math.cos(a) * d, py = cy + Math.sin(a) * d * .75; puffs.push(circle(px, py, pr)); if (Math.sin(a) > .1) dark.push(circle(px + pr * .25, py + pr * .25, pr * .7)); if (Math.sin(a) < -.2 && Math.cos(a) < .3) light.push(circle(px - pr * .3, py - pr * .3, pr * .45)); }
    puffs.push(circle(x, cy, r * .6));
    parts.push([ 'base', trunk + puffs.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ]);
  }
  L.trees = { ground: true, parts };
}
// City: a skyline of towers with setbacks, spires, antennas, domes and water tanks, windows lit here and there.
{
  const parts = [];
  let x = -10;
  while (x < W) {
    const w = R(34, 92), h = R(60, 225), top = H - h, kind = RI(0, 6), pts = [];
    let d = rect(x, top, w, h + 2);
    if (kind === 1) d += rect(x + w * .15, top - h * .18, w * .7, h * .18 + 1) + rect(x + w * .3, top - h * .3, w * .4, h * .12 + 1);
    if (kind === 2) d += poly([ [ x + w * .2, top ], [ x + w / 2, top - R(30, 60) ], [ x + w * .8, top ] ]) + rect(x + w / 2 - 1, top - 90, 2, 40);
    if (kind === 3) d += `M${n(x + w * .15)} ${n(top)}a${n(w * .35)} ${n(w * .35)} 0 0 1 ${n(w * .7)} 0Z` + rect(x + w / 2 - 1, top - w * .35 - 14, 2, 14);
    if (kind === 4) d += rect(x + w * .6, top - 26, 2, 14) + rect(x + w * .6 + 12, top - 26, 2, 14) + rect(x + w * .55, top - 40, 20, 16) + poly([ [ x + w * .55, top - 40 ], [ x + w * .55 + 10, top - 48 ], [ x + w * .55 + 20, top - 40 ] ]);
    if (kind === 5) d += poly([ [ x, top ], [ x + w, top - R(14, 30) ], [ x + w, top ] ]);
    if (kind === 6) d += rect(x + w * .4, top - 50, 2, 50) + rect(x + w * .4 + 6, top - 30, 1.5, 30);
    parts.push([ 'base', d ]);
    CITY.push({ x, w, h, top, kind });
    const win = [];
    const cols = Math.max(2, Math.floor((w - 8) / 9)), rows = Math.floor((h - 12) / 12);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (rnd() < .3) win.push(rect(x + 5 + c * ((w - 10) / cols), top + 8 + r * 12, 3.5, 5));
    parts.push([ 'light', win.join('') ]);
    parts.push([ 'dark', rect(x + w * .78, top, w * .22, h) ]);
    x += w + R(-2, 6);
  }
  L.city = { ground: true, parts };
}
// Waves: open sea: a flat horizon with a fine chop, rows of wavelets that grow larger and farther apart toward the
// front (perspective), dark troughs under each row, short glints along the rows and a glitter path under the sun / moon
// (which sit at x ~1160 in the sky layers).
{
  const HZ = 232; // the horizon
  const top = []; for (let x = 0; x <= W; x += 8) top.push([ x, HZ + Math.sin(x / 9) * .8 + Math.sin(x / 41 + 1) * 1.4 + Math.sin(x / 113) * 1.8 ]);
  const rows = []; for (let k = 0, y = HZ + 6; y < H; k++) { rows.push([ y, 1.2 + k * .9, 14 + k * 9 ]); y += 4 + k * 3.2; } // [y, amplitude, wavelength]
  const troughs = [], glints = [], glitter = [];
  rows.forEach(([ y, a, wl ], k) => {
    // A row of wavelets: thin crescents (the shaded back of each little wave).
    for (let x = R(-wl, 0); x < W; x += wl * R(.55, 1.4)) {
      // a curved wavelet: its own height and width, a crescent from two arcs
      const w = wl * R(.35, 1.2), h = a * R(.45, 1.9), yy = y + R(-a, a) * .6;
      troughs.push(`M${n(x)} ${n(yy)}Q${n(x + w * .5)} ${n(yy - h * 1.6)} ${n(x + w)} ${n(yy)}Q${n(x + w * .5)} ${n(yy - h * .55)} ${n(x)} ${n(yy)}Z`);
      if (rnd() < .22) { const gl = w * R(.4, .9); glints.push(rect(x + R(0, w), y + a * .4, gl, Math.max(.8, a * .45))); }
    }
    // The glitter path: denser, brighter dashes in a cone under the sun.
    const spread = 30 + k * 16;
    for (let j = 0; j < 4 + k; j++) { const gx = 1160 + R(-spread, spread), gl = R(4, 10 + k * 4); glitter.push(rect(gx - gl / 2, y + R(-1, 1), gl, Math.max(.8, a * .5))); }
  });
  L.waves = { ground: true, clip: true, parts: [ [ 'base', ground(top) ], [ 'dark', troughs.join('') ], [ 'light', glints.join('') + glitter.join('') ] ] };
}
// Surf: the foreground near the shore: two rows of rolling breakers, each crest capped with a ragged foam line over a
// darker face and a little spray, and at the front the lacy edge of a spent wave running up the beach, with bubbles.
{
  // A row of breakers: peaked crests whose height and spacing drift along the shore (two slow waves modulate them).
  const swell = (x, y0, amp, wl, ph) => {
    const a = amp * (.6 + .4 * Math.sin(x / 230 + ph) + .25 * Math.sin(x / 97 + ph * 2));
    return y0 - a * Math.max(0, Math.sin(x / wl + ph + .9 * Math.sin(x / 310 + ph))) ** 2.2;
  };
  const ROWS = [ [ 262, 32, 78, 0 ], [ 286, 20, 56, 1.7 ] ];
  const top = []; for (let x = 0; x <= W; x += 6) top.push([ x, swell(x, ...ROWS[0]) ]);
  const faces = [], foam = [], spray = [];
  for (const row of ROWS) {
    const [ y0 ] = row, f = (x) => swell(x, ...row);
    const line = []; for (let x = -80; x <= W + 80; x += 3) line.push([ x, f(x) ]);
    // each crest: a local peak of the line, sized by how tall it is and how far its neighbours are
    const peaks = line.filter(([ , y ], i) => i > 0 && i < line.length - 1 && y < line[i - 1][1] && y <= line[i + 1][1] && y < y0 - 2);
    peaks.forEach(([ cx, cy ], i) => {
      const gap = Math.min(cx - (peaks[i - 1]?.[0] ?? cx - 140), (peaks[i + 1]?.[0] ?? cx + 140) - cx), half = gap * .5, height = y0 - cy;
      const crest = line.filter(([ x ]) => x >= cx - half && x <= cx + half);
      faces.push(poly([ ...crest, ...crest.map(([ x, y ]) => [ x, y + 4 + height * .55 * Math.cos((x - cx) / half * Math.PI / 2) ]).reverse() ]));
      for (let x = cx - half * .75; x < cx + half * .75; x += R(8, 18)) {
        const len = R(6, 10 + height), t = 1 - Math.abs(x - cx) / half, th = 1 + height * .18 * t;
        foam.push(poly([ [ x, f(x) - .5 ], [ x + len, f(x + len) - .5 ], [ x + len - 3, f(x + len) + th ], [ x + 2, f(x) + th ] ]));
      }
      for (let j = 0; j < Math.round(height / 3); j++) spray.push(circle(cx + R(-half * .3, half * .3), cy + R(1, 4), R(.8, 2)));
    });
  }
  // ripples on the water between the breakers: wide, flat wavelets, like the open sea's but nearer (bigger)
  const ripples = [];
  for (let y = 270, k = 0; y < 300; y += 7 + k * 2, k++) for (let x = R(-40, 0); x < W; x += R(40, 80)) { const w = R(24, 46), a = 1.6 + k * .5; ripples.push(poly([ [ x, y ], [ x + w * .3, y - a ], [ x + w * .7, y - a ], [ x + w, y ], [ x + w * .6, y - a * .35 ], [ x + w * .4, y - a * .35 ] ])); }
  // the spent wave's lacy edge running up the beach: a chain of round scallops over a band, loose bubbles above it
  const lace = [ rect(0, 306, W, 14) ];
  for (let x = 0; x <= W + 10; x += R(9, 16)) lace.push(circle(x, 306 + R(-1.5, 1.5), R(4.5, 8)));
  const bubbles = []; for (let i = 0; i < 110; i++) bubbles.push(circle(R(0, W), R(290, 300), R(.8, 2.4)));
  L.surf = { ground: true, clip: true, parts: [ [ 'base', ground(top) ], [ 'dark', faces.join('') + ripples.join('') ], [ 'light', foam.join('') + spray.join('') + lace.join('') + bubbles.join('') ] ] };
}
// Palms: a beach with leaning palms (ringed trunks, drooping fronds, coconuts) and low bushes.
{
  const sand = smooth([ [ -40, 290 ], [ 300, 282 ], [ 700, 292 ], [ 1100, 280 ], [ 1480, 288 ] ]);
  const parts = [ [ 'base', ground(sand) ] ];
  const palm = (bx, h, lean) => {
    const by = yAt(sand, bx) + 2, seg = 12, trunkPts = [];
    for (let i = 0; i <= seg; i++) { const t = i / seg; trunkPts.push([ bx + lean * h * t * t, by - h * t ]); }
    const left = trunkPts.map(([ px, py ], i) => [ px - (6 - i * .3), py ]), right = trunkPts.map(([ px, py ], i) => [ px + (6 - i * .3), py ]).reverse();
    const [ tx, ty ] = trunkPts.at(-1);
    let d = poly([ ...left, ...right ]);
    const rings = trunkPts.slice(1, -1).map(([ px, py ], i) => rect(px - (6 - i * .3), py, 2 * (6 - i * .3), 1.6)).join('');
    for (let f = 0; f < 10; f++) {
      const a = -Math.PI / 2 + (f - 4.5) * .36, len = R(48, 70), droop = R(.55, .9);
      const leaf = []; const back = [];
      for (let s = 0; s <= 10; s++) { const t = s / 10, lx = tx + Math.cos(a) * len * t, ly = ty + Math.sin(a) * len * t + droop * len * t * t * .9, wdt = 9 * Math.sin(t * Math.PI) * (s % 2 ? 1 : .55); leaf.push([ lx - Math.sin(a) * wdt, ly + Math.cos(a) * wdt ]); back.push([ lx + Math.sin(a) * wdt * .5, ly - Math.cos(a) * wdt * .5 ]); }
      d += poly([ ...leaf, ...back.reverse() ]);
    }
    d += circle(tx - 4, ty + 5, 4) + circle(tx + 4, ty + 6, 4) + circle(tx, ty + 9, 3.5);
    return [ [ 'base', d ], [ 'dark', rings ] ];
  };
  for (const [ bx, h, lean ] of [ [ 140, 170, .35 ], [ 230, 120, -.25 ], [ 610, 200, .2 ], [ 700, 140, .4 ], [ 1080, 160, -.3 ], [ 1180, 210, .15 ], [ 1360, 120, -.35 ] ]) parts.push(...palm(bx, h, lean));
  const bushes = []; for (let i = 0; i < 18; i++) { const bx = R(0, W), by = yAt(sand, bx); bushes.push(circle(bx, by, R(6, 12)), circle(bx + 9, by + 2, R(5, 9))); }
  parts.push([ 'base', bushes.join('') ]);
  L.palms = { ground: true, parts };
}
// Farm: rolling fields striped with crop rows, a barn, a silo, a windmill, a fence and a few trees.
{
  const top = smooth([ [ -40, 250 ], [ 260, 222 ], [ 620, 246 ], [ 980, 214 ], [ 1300, 240 ], [ 1480, 230 ] ]);
  const rows = [];
  for (let k = 0; k < 16; k++) { const a = thin(top, 3).map(([ x, y ]) => [ x, y + 6 + k * 5.2 + Math.sin(x / 120) * (2 + k * .3) ]); rows.push(poly([ ...a, ...a.map(([ x, y ]) => [ x, y + 1.8 ]).reverse() ])); }
  const gy = (x) => yAt(top, x);
  FARM.gy = gy;
  const bx = 300, by = gy(bx) + 4;
  let build = poly([ [ bx, by ], [ bx, by - 46 ], [ bx + 16, by - 70 ], [ bx + 54, by - 70 ], [ bx + 70, by - 46 ], [ bx + 70, by ] ]); // barn
  build += rect(bx + 82, by - 92, 22, 92) + `M${bx + 82} ${by - 92}a11 11 0 0 1 22 0Z`; // silo
  const barnDoor = poly([ [ bx + 22, by ], [ bx + 22, by - 30 ], [ bx + 48, by - 30 ], [ bx + 48, by ] ]);
  const barnX = poly([ [ bx + 23, by - 29 ], [ bx + 26, by - 29 ], [ bx + 47, by - 4 ], [ bx + 47, by - 1 ], [ bx + 44, by - 1 ], [ bx + 23, by - 26 ] ]) + poly([ [ bx + 47, by - 29 ], [ bx + 44, by - 29 ], [ bx + 23, by - 4 ], [ bx + 23, by - 1 ], [ bx + 26, by - 1 ], [ bx + 47, by - 26 ] ]) + rect(bx + 30, by - 56, 10, 10);
  const wx = 1010, wy = gy(wx) + 2;
  build += poly([ [ wx - 12, wy ], [ wx - 4, wy - 110 ], [ wx + 4, wy - 110 ], [ wx + 12, wy ] ]);
  for (let b = 0; b < 4; b++) { const a = b * Math.PI / 2 + .4, hx = wx, hy = wy - 112, ex = hx + Math.cos(a) * 48, ey = hy + Math.sin(a) * 48, px = -Math.sin(a) * 5, py = Math.cos(a) * 5; build += poly([ [ hx + px * .3, hy + py * .3 ], [ ex + px, ey + py ], [ ex - px * .2, ey - py * .2 ], [ hx - px * .3, hy - py * .3 ] ]); }
  build += circle(wx, wy - 112, 4);
  let fence = ''; for (let fx = 520; fx < 860; fx += 16) fence += rect(fx, gy(fx) - 12, 2, 14); { const rail = wobble(520, 862, 0, 0, 20).map(([ x ]) => [ x, gy(x) - 9 ]); fence += poly([ ...rail, ...rail.map(([ x, y ]) => [ x, y + 2 ]).reverse() ]); }
  const trees = []; for (const tx of [ 120, 470, 1180, 1250, 1390 ]) { const ty = gy(tx); trees.push(circle(tx, ty - 26, 18), circle(tx - 10, ty - 18, 12), circle(tx + 11, ty - 17, 12), rect(tx - 2, ty - 12, 4, 14)); }
  L.farm = { ground: true, clip: true, parts: [ [ 'base', ground(top) + build + fence + trees.join('') ], [ 'light', rows.join('') ], [ 'light', barnDoor ], [ 'dark', barnX ] ] };
}
// Cliffs: sea cliffs: a headland with a sheer face, a sea stack and an arch, layered ledges.
{
  const p = smooth([ [ 0, 92 ], [ 140, 80 ], [ 300, 86 ], [ 440, 74 ] ], 20);
  const face = jag([ [ 448, 76 ], [ 462, 150 ], [ 470, 210 ], [ 520, 252 ], [ 600, 268 ] ], 3, .18);
  p.push(...face, [ 1440, 268 ]);
  // a stack and an arch out at sea, left of the headland's foot
  const stack = poly([ [ 690, H ], [ 700, 180 ], [ 708, 150 ], [ 726, 146 ], [ 734, 175 ], [ 742, H ] ]);
  const arch = `M860 ${H}L866 160L900 150L960 156L972 ${H}L950 ${H}L946 230Q920 200 892 232L888 ${H}Z`;
  const ledges = []; for (let yy = 90; yy < 268; yy += R(12, 22)) ledges.push(rect(0, yy, 1000, R(2, 4)));
  const faceShade = poly([ ...face, ...face.map(([ px, py ]) => [ px - 55, py + 6 ]).reverse() ]);
  const stackShade = poly([ [ 720, 146 ], [ 734, 175 ], [ 742, H ], [ 722, H ] ]) + poly([ [ 930, 150 ], [ 960, 156 ], [ 972, H ], [ 935, H ] ]);
  L.cliffs = { ground: true, clip: true, parts: [ [ 'base', ground(p.filter(q => q[0] <= W)) + stack + arch ], [ 'light', ledges.join('') ], [ 'dark', faceShade + stackShade ] ] };
}

/* MORE LAYERS ----------------------------------------------------------------------------------------------------- */
// Added after the originals (so their seeded shapes stay put). Meant to stack in five bands, back to front: sky (wisps,
// balloons), far (ranges, treeline, farcity, mesas), then the mid layers above, and the nearest, most detailed ones
// (street, meadow, cactus, beach, rim), which carry people, animals and props.

// Shoelace area > 0: the winding rect / circle / ground use, so mirrored shapes still add up (nonzero fill).
const cw = (pts) => { let a = 0; for (let i = 0; i < pts.length; i++) { const [ x0, y0 ] = pts[i], [ x1, y1 ] = pts[(i + 1) % pts.length]; a += x0 * y1 - x1 * y0; } return a < 0 ? [ ...pts ].reverse() : pts; };
const pcw = (pts) => poly(cw(pts));
const ell = (cx, cy, rx, ry, rot = 0, k = 12) => { const c = Math.cos(rot), s = Math.sin(rot), p = []; for (let i = 0; i < k; i++) { const t = i / k * Math.PI * 2, x = Math.cos(t) * rx, y = Math.sin(t) * ry; p.push([ cx + x * c - y * s, cy + x * s + y * c ]); } return poly(p); };
// A ring: a circle with a hole (the inner one wound the other way).
const ring = (cx, cy, r, w) => circle(cx, cy, r) + `M${n(cx + r - w)} ${n(cy)}a${n(r - w)} ${n(r - w)} 0 1 0 ${n(-2 * (r - w))} 0a${n(r - w)} ${n(r - w)} 0 1 0 ${n(2 * (r - w))} 0`;
// A stroke as a filled quad from a to b, w wide; a polyline as joined strokes (round joints).
const seg = ([ x0, y0 ], [ x1, y1 ], w) => { const d = Math.hypot(x1 - x0, y1 - y0) || 1, px = -(y1 - y0) / d * w / 2, py = (x1 - x0) / d * w / 2; return pcw([ [ x0 + px, y0 + py ], [ x1 + px, y1 + py ], [ x1 - px, y1 - py ], [ x0 - px, y0 - py ] ]); };
const strokeLine = (pts, w) => pts.slice(1).map((p, i) => seg(pts[i], p, w) + (i ? circle(pts[i][0], pts[i][1], w / 2) : '')).join('');
// A figure's own coordinates: dx forward (mirrored for dir -1), dy up from its feet at (x, y), in units of s.
const frame = (x, y, s, dir) => (dx, dy) => [ x + dx * s * dir, y - dy * s ];

// People, all 40 units tall (s = h / 40). Walking (stride 0 stands), with extras.
const person = (x, y, h, { dir = 1, stride = 1, pack, stick, bag, umbrella, dress, hat } = {}) => {
  const s = h / 40, P = frame(x, y, s, dir), F = 1.4 + 3.4 * stride, B = -1.2 - 3 * stride;
  let d = circle(...P(.6, 35.6), 3.7 * s);
  d += pcw([ P(-3.2, 32), P(3.2, 32), P(3.9, 29), P(3.4, 18), P(-3.4, 18), P(-3.9, 29) ]);
  if (dress) d += pcw([ P(-3.4, 21), P(3.4, 21), P(5.4, 9), P(-5.4, 9) ]);
  const leg = (fx) => seg(P(fx * .25, 18.5), P(fx, 1.2), 2.7 * s) + pcw([ P(fx - 1.2, 1.8), P(fx + 2.8, 1.4), P(fx + 3, 0), P(fx - 1.3, 0) ]);
  d += leg(F) + leg(B);
  d += seg(P(1.8, 30.5), P(-2 - 2.6 * stride, 18.5), 2.3 * s) + seg(P(-1.8, 30.5), P(2.4 + 2.6 * stride, 18.5), 2.3 * s);
  if (pack) d += pcw([ P(-3, 31.5), P(-8, 30.5), P(-8.6, 20), P(-3, 19.5) ]) + circle(...P(-5.6, 31.5), 2.6 * s);
  if (stick) d += seg(P(3.6, 20), P(8, 0), 1.1 * s);
  if (bag) d += pcw([ P(2, 19), P(7, 19), P(7.4, 11), P(1.6, 11) ]) + seg(P(-2, 31), P(3, 19), .8 * s);
  if (hat) d += pcw([ P(-5, 38), P(6, 38), P(6, 39), P(3.6, 39.6), P(3, 43), P(-2.4, 43), P(-3, 39.6), P(-5, 39) ]);
  if (umbrella) {
    d += seg(P(2.6, 19), P(2.6, 47), 1 * s);
    const dome = []; for (let i = 0; i <= 12; i++) { const t = Math.PI + i / 12 * Math.PI; dome.push(P(2.6 + Math.cos(t) * 13, 47 - Math.sin(t) * 7)); }
    for (let i = 4; i >= 0; i--) dome.push(P(2.6 - 13 + i * 6.5, 46 + (i % 2) * 1.6));
    d += pcw(dome);
  }
  return d;
};
// Sitting on the ground (legs out) or on an edge (legs hanging over it): seat at (x, y).
const sitter = (x, y, h, { dir = 1, hang, pack } = {}) => {
  const s = h / 40, P = frame(x, y, s, dir);
  let d = circle(...P(1.2, 31.6), 3.7 * s) + pcw([ P(-3, 28), P(3.2, 28), P(4, 25), P(3.6, 2), P(-3.4, 2), P(-4, 25) ]);
  d += hang ? seg(P(1, 2), P(9, 2), 5 * s) + seg(P(9, 2), P(10, -14), 3 * s) : seg(P(1, 2.2), P(16, 2.2), 5 * s) + pcw([ P(15, 4.4), P(17, 8), P(18.5, 7.6), P(18, 0), P(15, 0) ]);
  d += seg(P(2, 26), P(8, 12), 2.3 * s) + seg(P(8, 12), P(hang ? 9 : 13, 6), 2.3 * s);
  if (pack) d += pcw([ P(-3, 27), P(-8, 26), P(-8.6, 2), P(-3, 2) ]);
  return d;
};
// Lying on the ground on its back, head at x.
const lier = (x, y, h, dir = 1) => { const s = h / 40, P = frame(x, y, s, dir); return circle(...P(3.6, 3.8), 3.6 * s) + pcw([ P(7, 0), P(7, 6.4), P(20, 6.6), P(24, 5.4), P(40, 4), P(42, 0) ]) + seg(P(28, 4), P(33, 9), 2.4 * s) + seg(P(33, 9), P(38, 4), 2.4 * s); };
const cyclist = (x, y, h, dir = 1) => {
  const s = h / 46, P = frame(x, y, s, dir);
  let d = ring(...P(-11, 9), 9 * s, 1.8 * s) + ring(...P(13, 9), 9 * s, 1.8 * s);
  d += strokeLine([ P(-11, 9), P(0, 9), P(10, 22), P(-3, 22), P(0, 9) ], 1.6 * s) + seg(P(10, 22), P(13, 9), 1.6 * s) + seg(P(-3, 22), P(-11, 9), 1.4 * s) + seg(P(9, 22), P(10, 27), 1.6 * s);
  d += circle(...P(7, 42), 3.6 * s) + seg(P(-2, 26), P(4, 37), 5 * s) + seg(P(4, 36), P(10, 27), 2.2 * s) + strokeLine([ P(-2, 26), P(5, 18), P(1, 9) ], 2.8 * s);
  return d;
};
// Animals, feet at (x, y).
const dog = (x, y, h, dir = 1) => { const s = h / 16, P = frame(x, y, s, dir); return ell(...P(0, 9.5), 8 * s, 3.6 * s) + circle(...P(9.6, 14), 3.4 * s) + seg(P(10, 13), P(14.4, 12.2), 2.4 * s) + seg(P(8.4, 15.6), P(7, 12.6), 2 * s) + seg(P(6, 10), P(9, 14), 4.4 * s) + [ 5.4, 3.6, -4.4, -6 ].map(lx => seg(P(lx, 8), P(lx + .4, 0), 1.6 * s)).join('') + seg(P(-7.4, 10.4), P(-10.6, 15), 1.4 * s); };
const deer = (x, y, h, dir = -1) => {
  const s = h / 60, P = frame(x, y, s, dir);
  let d = ell(...P(0, 34), 17 * s, 8.6 * s) + seg(P(12, 38), P(18, 50), 7 * s) + ell(...P(21, 51), 6 * s, 3.5 * s, dir * .3) + ell(...P(16.6, 55.4), 3.4 * s, 1.3 * s, -dir * .7) + ell(...P(-17, 38), 3 * s, 1.6 * s, dir * .8);
  for (const [ lx, kx ] of [ [ 12, 13 ], [ 8, 9 ], [ -10, -13 ], [ -14, -16 ] ]) d += strokeLine([ P(lx, 30), P(kx, 15), P(lx + .5, 0) ], 2.4 * s);
  for (const side of [ 0, 2.4 ]) { const a = [ P(18 + side, 54), P(16 + side, 62), P(12 + side, 68), P(9 + side, 70) ]; d += strokeLine(a, 1.4 * s) + seg(P(16.6 + side, 61), P(21 + side, 66), 1.2 * s) + seg(P(13.4 + side, 66.6), P(14 + side, 72), 1.2 * s); }
  return d;
};
const cow = (x, y, h, dir = 1) => {
  const s = h / 30, P = frame(x, y, s, dir);
  let d = pcw([ P(-17, 24), P(14, 26), P(17, 20), P(15, 12), P(-16, 12), P(-18, 18) ]) + pcw([ P(13, 25), P(19, 24), P(23, 17), P(25.4, 16), P(26, 19), P(23, 26), P(17, 27.6) ]);
  d += seg(P(20.4, 25.4), P(22.4, 29), 1.2 * s) + ell(...P(18.4, 24.6), 2.4 * s, 1 * s);
  for (const lx of [ 11, 8, -11, -14 ]) d += seg(P(lx, 14), P(lx + .2, 0), 2.8 * s);
  d += strokeLine([ P(-17.6, 22), P(-19.6, 14), P(-19.4, 8) ], 1 * s) + ell(...P(-6, 11.6), 3 * s, 1.6 * s);
  return d;
};
const cowSpots = (x, y, h, dir = 1) => { const s = h / 30, P = frame(x, y, s, dir); return ell(...P(-8, 19), 5 * s, 3.4 * s, .3) + ell(...P(4, 21), 4 * s, 2.6 * s, -.4) + ell(...P(11, 16), 2.4 * s, 2 * s); };
const coyote = (x, y, h, dir = 1) => {
  const s = h / 40, P = frame(x, y, s, dir);
  return circle(...P(-5, 8), 8 * s) + ell(...P(0, 17), 6.6 * s, 11 * s, -dir * .4) + seg(P(3, 25), P(7, 33), 6 * s) + ell(...P(8.6, 35.6), 3.4 * s, 5 * s, -dir * .5) + seg(P(9, 38), P(12.6, 44), 2.6 * s)
    + pcw([ P(5.6, 37), P(5, 42), P(7.6, 39) ]) + seg(P(4, 14), P(4.6, 0), 2.4 * s) + seg(P(6.4, 14), P(7.4, 0), 2.4 * s) + ell(...P(-14, 2.6), 9 * s, 2.8 * s, dir * .12);
};
const rabbit = (x, y, h, dir = 1) => { const s = h / 16, P = frame(x, y, s, dir); return ell(...P(0, 5), 6 * s, 5 * s) + circle(...P(5, 9), 3.4 * s) + ell(...P(4, 15), 1.2 * s, 4 * s, dir * -.2) + ell(...P(6, 14.6), 1.2 * s, 4 * s, dir * .3) + circle(...P(-6, 5), 1.8 * s) + seg(P(3, 3), P(6, 0), 1.6 * s); };
const gull = (x, y, h, dir = 1) => { const s = h / 12, P = frame(x, y, s, dir); return ell(...P(0, 6.6), 5 * s, 2.6 * s, -dir * .15) + circle(...P(4.6, 9), 2 * s) + pcw([ P(6, 9.4), P(8.6, 8.8), P(6, 8.2) ]) + pcw([ P(-4, 7.6), P(-8, 8.6), P(-4, 5.4) ]) + seg(P(0, 4.4), P(-.4, 0), .7 * s) + seg(P(1.4, 4.4), P(1.6, 0), .7 * s); };

// A rounded round-topped block (a saguaro's trunk or arm), from (x, y0) up to y1, w wide.
const column = (x, y0, y1, w) => rect(x - w / 2, y1, w, y0 - y1) + circle(x, y1, w / 2);
// A rock: a lumpy mound with a lit top left, a shaded base and a crack.
const rock = (x, y, w, hgt) => {
  const pts = []; for (let i = 0; i <= 10; i++) { const t = Math.PI + i / 10 * Math.PI; pts.push([ x + Math.cos(t) * w * R(.92, 1.05), y + Math.sin(t) * hgt * R(.85, 1.05) ]); }
  return { base: pcw([ ...pts, [ x + w, y + 3 ], [ x - w, y + 3 ] ]), light: ell(x - w * .3, y - hgt * .62, w * .42, hgt * .22, -.15), dark: pcw([ [ x - w, y + 3 ], [ x - w * .7, y - hgt * .25 ], [ x + w * .7, y - hgt * .35 ], [ x + w, y + 3 ] ]) + strokeLine(jag([ [ x + w * R(-.2, .3), y - hgt * .9 ], [ x + w * R(-.1, .4), y - hgt * .3 ] ], 2, .4), 1.2) };
};
// A broadleaf tree with a lit and a shaded side, feet at (x, y).
const leafy = (x, y, h) => {
  const r = h * .38, cy = y - h + r, base = [ pcw([ [ x - 4, y ], [ x - 2.4, cy + r * .4 ], [ x - 12, cy ], [ x - 10, cy - 2 ], [ x, cy + r * .2 ], [ x + 10, cy - 2 ], [ x + 12, cy ], [ x + 2.4, cy + r * .4 ], [ x + 4, y ] ]) ], light = [], dark = [];
  for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, dd = r * R(.35, .6), pr = r * R(.38, .55), px = x + Math.cos(a) * dd, py = cy + Math.sin(a) * dd * .75; base.push(circle(px, py, pr)); if (Math.sin(a) > .1) dark.push(circle(px + pr * .25, py + pr * .25, pr * .7)); if (Math.sin(a) < -.2 && Math.cos(a) < .3) light.push(circle(px - pr * .3, py - pr * .3, pr * .45)); }
  base.push(circle(x, cy, r * .6));
  return { base: base.join(''), light: light.join(''), dark: dark.join('') };
};

/* MORE SKY */

// Wisps: high cirrus, long thin streaks in loose drifts.
{
  const d = [];
  for (const [ cx, cy, k ] of [ [ 200, 60, 6 ], [ 640, 130, 5 ], [ 980, 45, 7 ], [ 1300, 110, 5 ], [ 420, 190, 3 ] ]) {
    for (let i = 0; i < k; i++) {
      const x0 = cx + R(-110, 60), y0 = cy + i * R(5, 9), len = R(90, 260), th = R(1.2, 3.6), bend = R(-6, 6), top = [], bot = [];
      for (let j = 0; j <= 12; j++) { const t = j / 12, x = x0 + len * t, y = y0 + bend * Math.sin(t * Math.PI) - t * len * .04, w = th * Math.sin(t * Math.PI) ** .7; top.push([ x, y - w ]); bot.push([ x, y + w ]); }
      d.push(poly([ ...top, ...bot.reverse() ]));
    }
  }
  L.wisps = { parts: [ [ 'base', d.join('') ] ] };
}
// Balloons: hot-air balloons at a few distances, striped envelopes, ropes and baskets.
{
  const base = [], light = [], dark = [];
  for (const [ cx, cy, r ] of [ [ 300, 95, 44 ], [ 760, 150, 24 ], [ 960, 68, 32 ], [ 1330, 175, 16 ] ]) {
    // half-width of the envelope at height u (-1 top .. 1.25 throat)
    const hw = (u) => u <= 0 ? Math.sqrt(Math.max(0, 1 - u * u)) : Math.sqrt(Math.max(0, 1 - (u / 1.25) ** 2)) * (1 - .55 * u / 1.25) + .12 * (u / 1.25) ** 4;
    const env = []; for (let i = 0; i <= 40; i++) { const u = -1 + i / 40 * 2.25; env.push([ cx + hw(u) * r, cy + u * r ]); }
    base.push(pcw([ ...env, ...env.map(([ x, y ]) => [ 2 * cx - x, y ]).reverse() ]));
    // gores: every other band between two meridians
    for (const [ m1, m2 ] of [ [ -.85, -.55 ], [ -.2, .2 ], [ .55, .85 ] ]) { const a = [], b = []; for (let i = 0; i <= 24; i++) { const u = -1 + i / 24 * 2.2; a.push([ cx + hw(u) * r * m1, cy + u * r ]); b.push([ cx + hw(u) * r * m2, cy + u * r ]); } light.push(pcw([ ...a, ...b.reverse() ])); }
    dark.push(pcw(env.filter((_, i) => i > 22).map(([ x, y ]) => [ x, y ]).concat(env.filter((_, i) => i > 22).map(([ x, y ]) => [ 2 * cx - x, y ]).reverse())));
    const ty = cy + 1.25 * r, bw = r * .22, by = ty + r * .42;
    base.push(rect(cx - r * .14, ty - 2, r * .28, r * .08 + 2), seg([ cx - r * .13, ty ], [ cx - bw * .8, by ], Math.max(.8, r * .025)), seg([ cx + r * .13, ty ], [ cx + bw * .8, by ], Math.max(.8, r * .025)), rect(cx - bw, by, bw * 2, r * .24));
    dark.push(rect(cx - bw, by + r * .04, bw * 2, r * .05));
  }
  L.balloons = { clip: true, parts: [ [ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ] ] };
}

/* FAR: low on detail, they stand far back (depth 4) behind the main layers */

// Ranges: distant mountain ranges, a lighter high range behind darker foothills, a little snow and valley mist.
{
  const back = jag([ [ 0, 170 ], [ 170, 118 ], [ 330, 150 ], [ 520, 96 ], [ 700, 142 ], [ 880, 108 ], [ 1060, 152 ], [ 1250, 102 ], [ 1440, 146 ] ], 5, .2).filter(p => p[0] <= W);
  const front = jag(smooth([ [ -40, 216 ], [ 160, 188 ], [ 380, 214 ], [ 600, 184 ], [ 820, 210 ], [ 1040, 186 ], [ 1260, 214 ], [ 1480, 194 ] ], 40), 2, .1).filter(p => p[0] >= 0 && p[0] <= W);
  const snow = [];
  for (const [ px, py ] of [ [ 520, 96 ], [ 880, 108 ], [ 1250, 102 ], [ 170, 118 ] ]) { const drips = []; for (let sx = px + 60; sx >= px - 60; sx -= 8) drips.push([ sx, py + 14 + Math.abs(sx - px) / 4 + R(-3, 6) ]); snow.push(poly([ [ px - 60, 0 ], [ px + 60, 0 ], ...drips ])); }
  const mist = [ rect(0, 250, W, 70), rect(0, 272, W, 48), rect(0, 292, W, 28) ];
  L.ranges = { ground: true, clip: true, parts: [ [ 'base', ground(back) ], [ 'light', snow.join('') ], [ 'dark', ground(front) ], [ 'light', mist.join('') ] ] };
}
// Treeline: a far forest edge, round crowns with pointed firs among them, a steeple and a water tower.
{
  const base = [ rect(0, 262, W, 58) ], light = [];
  for (let x = -10; x < W + 10; x += R(6, 12)) {
    if (rnd() < .22) { const h = R(30, 58), w = h * .2; base.push(poly([ [ x - w, 266 ], [ x, 266 - h ], [ x + w, 266 ] ])); }
    else { const r = R(7, 15), y = 262 - R(6, 22); base.push(circle(x, y, r)); if (rnd() < .4) light.push(circle(x - r * .3, y - r * .4, r * .4)); }
  }
  base.push(rect(918, 186, 16, 80), poly([ [ 916, 188 ], [ 926, 140 ], [ 936, 188 ] ]), rect(925, 128, 2, 14)); // steeple
  base.push(rect(300, 206, 3, 60), rect(326, 206, 3, 60), seg([ 301, 260 ], [ 327, 220 ], 1.4), seg([ 327, 260 ], [ 301, 220 ], 1.4), rect(290, 186, 50, 22), poly([ [ 290, 186 ], [ 315, 174 ], [ 340, 186 ] ])); // water tower
  L.treeline = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'light', light.join('') ], [ 'dark', rect(0, 258, W, 62) + rect(924, 186, 10, 80) ] ] };
}
// Farcity: a distant skyline, dense low blocks, a few landmarks (a needle, a stepped tower), a suspension bridge,
// pinpoint windows, and a lower darker row in front.
{
  const base = [], light = [], dark = [];
  for (let x = -6; x < 1110; ) { const w = R(12, 36), h = rnd() < .1 ? R(90, 130) : R(18, 80); base.push(rect(x, 262 - h, w, h + 2)); if (rnd() < .3) base.push(rect(x + w * .3, 262 - h - R(6, 18), w * .4, 20)); for (let yy = 262 - h + 4; yy < 255; yy += 6) for (let xx = x + 3; xx < x + w - 3; xx += 5) if (rnd() < .14) light.push(rect(xx, yy, 1.8, 2.4)); x += w + R(-1, 3); }
  base.push(seg([ 560, 262 ], [ 560, 110 ], 4), circle(560, 132, 9), pcw([ [ 548, 140 ], [ 572, 140 ], [ 566, 146 ], [ 554, 146 ] ]), rect(559, 80, 2, 32)); // needle
  base.push(rect(840, 150, 34, 112), rect(846, 120, 22, 32), rect(851, 98, 12, 24), rect(856, 66, 2, 34)); // stepped tower
  // the bridge: two towers, the deck, the main cable sagging between them and the suspenders
  const cable = []; for (let x = 1100; x <= 1440; x += 10) { const t = (x - 1190) / 180; cable.push([ x, x < 1190 ? 236 - (x - 1100) * 86 / 90 : x > 1370 ? 150 + (x - 1370) * 86 / 70 : 150 + 76 * (1 - (2 * t - 1) ** 2) ]); }
  base.push(rect(1100, 236, W - 1100, 5), rect(1184, 140, 4, 122), rect(1196, 140, 4, 122), rect(1184, 140, 16, 4), rect(1184, 190, 16, 3), rect(1364, 140, 4, 122), rect(1376, 140, 4, 122), rect(1364, 140, 16, 4), rect(1364, 190, 16, 3), strokeLine(cable, 2));
  for (let x = 1206; x < 1362; x += 10) base.push(rect(x, yAt(cable, x), 1, 236 - yAt(cable, x)));
  for (let x = -6; x < 1100; ) { const w = R(10, 28), h = R(8, 34); dark.push(rect(x, 262 - h, w, h + 60)); x += w + R(0, 8); }
  L.farcity = { ground: true, clip: true, parts: [ [ 'base', rect(0, 260, W, 60) + base.join('') ], [ 'light', light.join('') ], [ 'dark', dark.join('') + rect(0, 262, W, 58) ] ] };
}
// Mesas: far flat-topped plateaus and a spire over a level floor, shaded right faces, faint strata.
{
  const base = [ rect(0, 272, W, 48) ], dark = [], light = [];
  for (const [ x0, x1, top ] of [ [ -20, 260, 196 ], [ 330, 420, 222 ], [ 520, 900, 176 ], [ 1010, 1110, 210 ], [ 1180, 1460, 190 ] ]) {
    const edge = wobble(x0 + 18, x1 - 18, top, 1.4, 14);
    base.push(pcw([ [ x0 - 30, 274 ], [ x0 - 6, 250 ], ...jag([ [ x0, 246 ], [ x0 + 18, top ] ], 2, .2), ...edge, ...jag([ [ x1 - 18, top ], [ x1, 246 ] ], 2, .2), [ x1 + 6, 250 ], [ x1 + 30, 274 ] ]));
    dark.push(pcw([ [ x1 - 40, top - 2 ], [ x1 + 34, top - 2 ], [ x1 + 34, 276 ], [ x1 - 20, 276 ] ]));
  }
  base.push(pcw([ [ 950, 274 ], [ 954, 214 ], [ 958, 206 ], [ 962, 212 ], [ 966, 274 ] ]));
  for (let yy = 180; yy < 270; yy += R(8, 14)) light.push(rect(0, yy, W, R(1.5, 3)));
  L.mesas = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'light', light.join('') ], [ 'dark', dark.join('') ] ] };
}

/* NEAR: the front layers (depth 1), the most detail */

// Street: the city at street level: a sidewalk with people (walking, with bags, a dog, an umbrella), lamps, trees, a
// bench, a hydrant, a bus stop and a traffic light; a two-lane road with cars, a bus, a taxi, a van and a cyclist, lane
// dashes and a crosswalk with people crossing.
{
  const SW = 250, ROAD = 268, base = [], light = [], dark = [], front = [], frontLight = [], frontDark = [];
  base.push(rect(0, SW, W, H - SW), rect(0, SW - 2, W, 3));
  dark.push(rect(0, ROAD, W, H - ROAD), rect(0, ROAD - 3, W, 1.6)); // road and the curb's shadow
  for (let x = 30; x < W; x += 62) dark.push(rect(x, SW + 2, 1.2, ROAD - SW - 4)); // sidewalk joints
  for (let x = 10; x < W; x += 52) light.push(rect(x, 293, 26, 2.2)); // lane dashes
  const CX = 760; // the crosswalk
  for (let k = 0; k < 7; k++) light.push(pcw([ [ CX + k * 16, ROAD + 1 ], [ CX + k * 16 + 9, ROAD + 1 ], [ CX + k * 16 + 1, H ], [ CX + k * 16 - 8, H ] ]));
  // lamps: a pole with a base, an arm and a lit head
  for (const [ x, dir ] of [ [ 90, 1 ], [ 470, -1 ], [ 1120, 1 ], [ 1390, -1 ] ]) {
    const top = SW - 150, hx = x + dir * 24;
    base.push(pcw([ [ x - 4.5, SW ], [ x - 3.4, SW - 9 ], [ x - 1.8, SW - 16 ], [ x - 1.5, top + 6 ], [ x + 1.5, top + 6 ], [ x + 1.8, SW - 16 ], [ x + 3.4, SW - 9 ], [ x + 4.5, SW ] ]));
    const arm = []; for (let i = 0; i <= 8; i++) { const t = i / 8; arm.push([ x + dir * 24 * t, top + 6 - 9 * Math.sin(t * Math.PI * .85) ]); }
    base.push(strokeLine(arm, 2.4), pcw([ [ hx - 8, top + 2 ], [ hx + 8, top + 2 ], [ hx + 5, top + 8 ], [ hx - 5, top + 8 ] ]), circle(hx, top + 1, 2.6), rect(hx - 4.4, top + 8, 8.8, 2.6));
    light.push(rect(hx - 4, top + 8.4, 8, 2));
  }
  // street trees in grates
  for (const [ x, h ] of [ [ 240, 120 ], [ 620, 110 ], [ 990, 124 ], [ 1270, 106 ] ]) { const t = leafy(x, SW, h); base.push(t.base); light.push(t.light); dark.push(t.dark, rect(x - 12, SW + 1, 24, 2)); }
  // bench, hydrant, mailbox, bus stop, traffic light
  base.push(rect(330, SW - 13, 46, 3), rect(330, SW - 26, 46, 3), rect(333, SW - 26, 2.4, 26), rect(371, SW - 26, 2.4, 26), rect(326, SW - 14, 54, 2));
  base.push(rect(526, SW - 13, 9, 13), circle(530.5, SW - 13, 4.6), rect(523, SW - 10, 15, 3.4), rect(528, SW - 20, 5, 3));
  base.push(rect(1188, SW - 30, 18, 22), `M1188 ${SW - 30}a9 9 0 0 1 18 0Z`, rect(1190, SW - 8, 2.4, 8), rect(1202, SW - 8, 2.4, 8));
  dark.push(rect(1190, SW - 25, 14, 2));
  base.push(rect(1320, SW - 64, 2.4, 64), rect(1410, SW - 64, 2.4, 64), rect(1316, SW - 66, 100, 4), rect(1305, SW - 92, 2.4, 92), rect(1297, SW - 100, 18, 14));
  light.push(rect(1324, SW - 60, 84, 44), rect(1299, SW - 98, 14, 4));
  base.push(rect(744, SW - 120, 3, 120), rect(738, SW - 150, 15, 34), rect(747, SW - 118, 20, 2.4), rect(760, SW - 124, 8, 14));
  dark.push(circle(745.5, SW - 143, 3.4), circle(745.5, SW - 133, 3.4)); light.push(circle(745.5, SW - 123, 3.4), rect(761.5, SW - 122, 5, 4));
  // people on the sidewalk
  const walkers = [ [ 40, 1, {} ], [ 150, -1, { bag: true } ], [ 176, -1, { dress: true } ], [ 300, 1, { stride: 0 } ], [ 420, -1, { umbrella: true, dress: true } ],
    [ 560, 1, { hat: true } ], [ 690, 1, { stride: 0, bag: true } ], [ 712, 1, { stride: .2, dress: true } ], [ 860, -1, { pack: true } ], [ 930, 1, {} ], [ 1050, -1, { bag: true, dress: true } ],
    [ 1240, 1, { stride: 0, hat: true } ], [ 1345, -1, { stride: 0 } ], [ 1370, 1, { stride: 0, dress: true, bag: true } ], [ 1430, -1, {} ] ];
  for (const [ x, dir, o ] of walkers) base.push(person(x, SW + R(1, 9), R(40, 46), { dir, stride: R(.6, 1), ...o }));
  base.push(dog(205, SW + 8, 15, -1), seg([ 171, SW - 15 ], [ 196, SW - 7 ], 1));
  base.push(sitter(352, SW - 11, 30, { dir: 1 }), sitter(342, SW - 11, 30, { dir: -1 }));
  // traffic: the far lane drives left, the near lane right; they stop short of the crosswalk
  const car = (x, yb, L, type, dir) => {
    const Pv = (u, v) => [ dir > 0 ? x + u * L : x + (1 - u) * L, yb - v * L ];
    const prof = {
      sedan: [ [ 0, .1 ], [ 0, .19 ], [ .03, .23 ], [ .22, .25 ], [ .33, .35 ], [ .63, .35 ], [ .76, .25 ], [ .96, .22 ], [ 1, .16 ], [ 1, .1 ] ],
      taxi: [ [ 0, .1 ], [ 0, .19 ], [ .03, .23 ], [ .22, .25 ], [ .33, .35 ], [ .44, .35 ], [ .44, .39 ], [ .54, .39 ], [ .54, .35 ], [ .63, .35 ], [ .76, .25 ], [ .96, .22 ], [ 1, .16 ], [ 1, .1 ] ],
      van: [ [ 0, .08 ], [ 0, .4 ], [ .03, .43 ], [ .72, .43 ], [ .84, .28 ], [ .98, .24 ], [ 1, .15 ], [ 1, .08 ] ],
      bus: [ [ 0, .05 ], [ 0, .3 ], [ .02, .32 ], [ .97, .32 ], [ 1, .29 ], [ 1, .05 ] ],
    }[type];
    const wheels = type === 'bus' ? [ .14, .82 ] : [ .2, .8 ], wr = type === 'bus' ? .045 : .075;
    const win = {
      sedan: [ [ [ .35, .26 ], [ .37, .33 ], [ .48, .33 ], [ .48, .26 ] ], [ [ .51, .26 ], [ .51, .33 ], [ .61, .33 ], [ .71, .26 ] ] ],
      taxi: [ [ [ .35, .26 ], [ .37, .33 ], [ .48, .33 ], [ .48, .26 ] ], [ [ .51, .26 ], [ .51, .33 ], [ .61, .33 ], [ .71, .26 ] ] ],
      van: [ [ [ .05, .28 ], [ .05, .39 ], [ .3, .39 ], [ .3, .28 ] ], [ [ .34, .28 ], [ .34, .39 ], [ .6, .39 ], [ .6, .28 ] ], [ [ .64, .28 ], [ .64, .39 ], [ .72, .39 ], [ .8, .28 ] ] ],
      bus: [ ...Array.from({ length: 8 }, (_, i) => [ [ .04 + i * .105, .19 ], [ .04 + i * .105, .28 ], [ .12 + i * .105, .28 ], [ .12 + i * .105, .19 ] ]), [ [ .9, .1 ], [ .9, .28 ], [ .97, .28 ], [ .97, .1 ] ] ],
    }[type];
    let b = pcw(prof.map(([ u, v ]) => Pv(u, v)));
    for (const u of wheels) b += circle(...Pv(u, wr), wr * L);
    front.push(b);
    frontLight.push(...win.map(q => pcw(q.map(([ u, v ]) => Pv(u, v)))), pcw([ Pv(.97, .19), Pv(1, .19), Pv(1, .16), Pv(.97, .16) ]));
    if (type === 'taxi') frontDark.push(pcw([ Pv(.02, .15), Pv(.98, .15), Pv(.98, .13), Pv(.02, .13) ]));
    if (type === 'bus') frontDark.push(pcw([ Pv(0, .13), Pv(1, .13), Pv(1, .1), Pv(0, .1) ]));
    frontDark.push(pcw([ Pv(0, .18), Pv(.02, .18), Pv(.02, .15), Pv(0, .15) ]), pcw([ Pv(.5, .25), Pv(.505, .25), Pv(.505, .12), Pv(.5, .12) ]));
    for (const u of wheels) { const [ wx, wy ] = Pv(u, wr); frontDark.push(circle(wx, wy, wr * L * .72)); frontLight.push(circle(wx, wy, wr * L * .3)); }
  };
  for (const [ x, L, type ] of [ [ 20, 104, 'sedan' ], [ 210, 118, 'van' ], [ 400, 230, 'bus' ], [ 880, 100, 'taxi' ], [ 1050, 106, 'sedan' ], [ 1240, 110, 'van' ] ]) car(x, 291, L, type, -1);
  for (const [ x, L, type ] of [ [ 120, 124, 'sedan' ], [ 300, 120, 'taxi' ], [ 480, 136, 'van' ], [ 620, 124, 'sedan' ], [ 980, 128, 'sedan' ], [ 1300, 120, 'taxi' ] ]) car(x, 318, L, type, 1);
  front.push(cyclist(1180, 316, 50, 1));
  // crossing the street
  front.push(person(800, 306, 46, { dir: 1, stride: 1 }), person(826, 312, 30, { dir: 1, stride: .9 }), person(848, 300, 44, { dir: -1, stride: 1, bag: true }));
  L.street = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ], [ 'base', front.join('') ], [ 'light', frontLight.join('') ], [ 'dark', frontDark.join('') ] ] };
}
// Meadow: a field's edge up close: grass blades and tall tufts, wildflowers (daisies, tulips, seed heads), rocks, an
// old fence, a rabbit and butterflies.
{
  const top = smooth([ [ -40, 274 ], [ 200, 266 ], [ 480, 278 ], [ 760, 262 ], [ 1040, 274 ], [ 1300, 266 ], [ 1480, 270 ] ]);
  const g = (x) => yAt(top, x), base = [ ground(top) ], light = [], dark = [];
  for (let x = -4; x < W + 4; x += R(2.4, 4.4)) { const h = rnd() < .12 ? R(24, 46) : R(7, 18), lean = R(-7, 7), y = g(x) + 3; base.push(pcw([ [ x - 1.6, y ], [ x + lean * .5, y - h * .6 ], [ x + lean, y - h ], [ x + 1.6, y ] ])); }
  for (let i = 0; i < 150; i++) { const x = R(0, W), y = g(x) + R(8, 46), h = R(4, 10), l = R(-3, 3); (rnd() < .5 ? light : dark).push(pcw([ [ x - 1, y ], [ x + l, y - h ], [ x + 1, y ] ])); }
  // flowers: a stem and a head
  for (let i = 0; i < 46; i++) {
    const x = R(10, W - 10), y = g(x) + 2, h = R(18, 44), lean = R(-6, 6), hx = x + lean, hy = y - h, kind = RI(0, 2);
    base.push(strokeLine([ [ x, y ], [ x + lean * .4, y - h * .5 ], [ hx, hy ] ], 1.4));
    if (rnd() < .5) base.push(pcw([ [ x + lean * .3, y - h * .35 ], [ x + lean * .3 + 8, y - h * .5 ], [ x + lean * .3 + 2, y - h * .3 ] ]));
    if (kind === 0) { base.push(circle(hx, hy, 6.4)); for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; light.push(ell(hx + Math.cos(a) * 3.6, hy + Math.sin(a) * 3.6, 2.4, 1.3, a)); } dark.push(circle(hx, hy, 1.8)); }
    if (kind === 1) { base.push(pcw([ [ hx - 4.6, hy - 9 ], [ hx - 2, hy - 5 ], [ hx, hy - 10 ], [ hx + 2, hy - 5 ], [ hx + 4.6, hy - 9 ], [ hx + 4, hy - 2 ], [ hx, hy + 1 ], [ hx - 4, hy - 2 ] ])); light.push(pcw([ [ hx - 3.4, hy - 6.6 ], [ hx - 1.6, hy - 4 ], [ hx - 2.6, hy - 1.6 ] ])); }
    if (kind === 2) { base.push(circle(hx, hy, 5.4)); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; light.push(circle(hx + Math.cos(a) * 3.4, hy + Math.sin(a) * 3.4, 1)); } }
  }
  for (const [ x, w, h ] of [ [ 140, 34, 20 ], [ 178, 16, 10 ], [ 640, 26, 15 ], [ 1180, 40, 24 ] ]) { const r = rock(x, g(x) + 4, w, h); base.push(r.base); light.push(r.light); dark.push(r.dark); }
  // the fence: weathered posts with two rails, one sagging
  for (let x = 860; x < W + 20; x += 54) { const y = g(x); base.push(pcw([ [ x - 3, y + 4 ], [ x - 3, y - 40 ], [ x, y - 43 ], [ x + 3, y - 40 ], [ x + 3, y + 4 ] ])); dark.push(rect(x + 1, y - 40, 2, 44)); if (x + 54 < W + 60) { const y2 = g(x + 54); base.push(seg([ x, y - 33 ], [ x + 54, y2 - 33 ], 2.6)); const sag = x % 108 ? 6 : 0; base.push(strokeLine([ [ x, y - 18 ], [ x + 27, (y + y2) / 2 - 18 + sag ], [ x + 54, y2 - 18 ] ], 2.4)); } }
  base.push(rabbit(420, g(420) + 2, 18, -1), rabbit(1290, g(1290) + 1, 14, 1));
  for (const [ bx, by, s ] of [ [ 330, 214, 1 ], [ 720, 196, .8 ], [ 1010, 226, 1.1 ], [ 1100, 186, .7 ] ]) base.push(ell(bx - 3.4 * s, by - 2 * s, 4 * s, 2.6 * s, -.6), ell(bx + 3.4 * s, by - 2 * s, 4 * s, 2.6 * s, .6), ell(bx - 2.4 * s, by + 2.4 * s, 2.6 * s, 1.8 * s, .5), ell(bx + 2.4 * s, by + 2.4 * s, 2.6 * s, 1.8 * s, -.5), rect(bx - .6, by - 3 * s, 1.2, 7 * s));
  L.meadow = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ] ] };
}
// Cactus: the desert up close: ribbed saguaros with arms and blossoms, prickly pears with fruit, barrel cacti, agaves,
// sagebrush, rocks, a lizard and a coyote howling on a boulder.
{
  const top = smooth([ [ -40, 284 ], [ 260, 276 ], [ 600, 288 ], [ 940, 278 ], [ 1240, 286 ], [ 1480, 280 ] ]);
  const g = (x) => yAt(top, x), base = [ ground(top) ], light = [], dark = [];
  for (let i = 0; i < 140; i++) { const x = R(0, W), y = g(x) + R(6, 40); (rnd() < .6 ? light : dark).push(ell(x, y, R(1, 3), R(.6, 1.6))); }
  const saguaro = (x, h, arms) => {
    const y = g(x) + 4, w = 20, top = y - h;
    base.push(column(x, y, top, w)); light.push(rect(x - w * .36, top, w * .18, h - 4)); for (const dx of [ -3, 3, 7.4 ]) dark.push(rect(x + dx - .6, top + 2, 1.2, h - 6));
    for (const k of [ -.5, 0, .5 ]) light.push(circle(x + k * 7, top - 3, 2.4));
    for (const [ side, ah, al, au ] of arms) {
      const ax = x + side * (w / 2 + al), ay = y - ah, aw = 14;
      base.push(seg([ x, ay ], [ ax, ay ], aw), circle(ax, ay, aw / 2), column(ax, ay, ay - au, aw));
      dark.push(rect(ax - .6, ay - au + 2, 1.2, au - 2), rect(ax + side * 3.4 - .6, ay - au + 2, 1.2, au - 2));
      light.push(rect(ax - aw * .34, ay - au, aw * .16, au - 4));
    }
  };
  saguaro(240, 210, [ [ -1, 90, 22, 64 ], [ 1, 120, 20, 50 ] ]);
  saguaro(1110, 236, [ [ 1, 80, 26, 90 ], [ -1, 130, 18, 46 ], [ 1, 160, 16, 34 ] ]);
  saguaro(760, 120, [ [ -1, 56, 14, 30 ] ]);
  for (const [ x, n0 ] of [ [ 420, 7 ], [ 900, 5 ], [ 1360, 6 ] ]) {
    const y = g(x) + 2; let pads = [ [ x, y - 14, 0 ] ];
    for (let i = 1; i < n0; i++) { const [ px, py ] = pads[RI(0, pads.length - 1)]; pads.push([ px + R(-14, 14), py - R(12, 20), R(-.6, .6) ]); }
    for (const [ px, py, a ] of pads) { base.push(ell(px, py, 9, 14, a)); for (let k = 0; k < 5; k++) dark.push(circle(px + R(-5, 5), py + R(-9, 9), .9)); if (rnd() < .5) { const fx = px + Math.sin(a) * 14, fy = py - Math.cos(a) * 14; base.push(ell(fx, fy - 3, 2.6, 4)); light.push(circle(fx - .6, fy - 4.6, 1)); } }
    light.push(ell(pads[0][0] - 3, pads[0][1] - 4, 3, 6));
  }
  for (const x of [ 90, 560, 1270 ]) { const y = g(x) + 2; base.push(ell(x, y - 13, 13, 15)); for (const k of [ -.66, -.33, 0, .33, .66 ]) dark.push(ell(x + k * 12, y - 13, 1, 14 * Math.sqrt(1 - k * k))); for (const k of [ -4, 0, 4 ]) light.push(circle(x + k, y - 27, 2.4)); }
  for (const x of [ 640, 1000 ]) { const y = g(x) + 2; for (let k = 0; k < 11; k++) { const a = -Math.PI * (.1 + .8 * k / 10), len = R(24, 38), wd = 4.4; base.push(pcw([ [ x - wd, y ], [ x + Math.cos(a) * len, y + Math.sin(a) * len ], [ x + wd, y ] ])); } }
  for (let i = 0; i < 9; i++) { const x = R(20, W - 20), y = g(x) + 2, r = R(8, 15); base.push(circle(x - r * .6, y - r * .5, r * .7), circle(x + r * .6, y - r * .5, r * .7), circle(x, y - r * .9, r * .8)); dark.push(rect(x - r * 1.3, y - r * .3, r * 2.6, r)); }
  for (const [ x, w, h ] of [ [ 340, 30, 16 ], [ 820, 22, 12 ], [ 1250, 68, 44 ] ]) { const r = rock(x, g(x) + 4, w, h); base.push(r.base); light.push(r.light); dark.push(r.dark); }
  base.push(coyote(1250, g(1250) - 38, 44, -1));
  base.push(pcw([ [ 322, g(340) - 14 ], [ 334, g(340) - 17 ], [ 346, g(340) - 16 ], [ 360, g(340) - 12 ], [ 346, g(340) - 13.6 ], [ 334, g(340) - 13.6 ] ]), seg([ 330, g(340) - 15 ], [ 327, g(340) - 11 ], 1), seg([ 342, g(340) - 15 ], [ 345, g(340) - 11 ], 1));
  L.cactus = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ] ] };
}
// Beach: the sand up close: a lifeguard tower, striped umbrellas, towels, people lying, sitting and walking, a kid
// with a sandcastle, a beach ball, a surfboard, gulls, shells, footprints and dune grass with a sand fence.
{
  const top = smooth([ [ -40, 284 ], [ 300, 280 ], [ 700, 286 ], [ 1100, 278 ], [ 1480, 284 ] ]);
  const g = (x) => yAt(top, x), base = [ ground(top) ], light = [], dark = [];
  for (let i = 0; i < 180; i++) { const x = R(0, W), y = g(x) + R(4, 36); (rnd() < .5 ? light : dark).push(circle(x, y, R(.5, 1.4))); }
  // the lifeguard tower
  { const x = 160, y = g(160) + 2;
    base.push(seg([ x - 26, y ], [ x - 18, y - 70 ], 3), seg([ x + 26, y ], [ x + 18, y - 70 ], 3), seg([ x - 22, y - 30 ], [ x + 22, y - 30 ], 2), seg([ x - 22, y - 30 ], [ x + 19, y - 66 ], 1.6), rect(x - 30, y - 74, 60, 5), rect(x - 22, y - 112, 44, 38), pcw([ [ x - 28, y - 112 ], [ x, y - 128 ], [ x + 28, y - 112 ] ]), strokeLine([ [ x + 30, y - 72 ], [ x + 62, y ] ], 4), rect(x - 1, y - 150, 2, 24), pcw([ [ x + 1, y - 150 ], [ x + 20, y - 144 ], [ x + 1, y - 138 ] ]));
    light.push(rect(x - 16, y - 106, 32, 14)); dark.push(rect(x - 22, y - 86, 44, 2)); for (let k = 1; k < 6; k++) base.push(seg([ x + 30 + k * 5.3, y - 72 + k * 12 ], [ x + 36 + k * 5.3, y - 72 + k * 12 ], 2)); }
  // umbrellas: a pole and a striped dome
  const umbrella = (x, h, r, tilt) => {
    const y = g(x) + 2, tx = x + tilt * h, ty = y - h;
    base.push(seg([ x, y ], [ tx, ty - 4 ], 2.2));
    const rim = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; rim.push([ tx + Math.cos(a) * r, ty + 10 + Math.sin(a) * r * .5 ]); }
    const sc = []; for (let i = 8; i >= 0; i--) sc.push([ tx - r + i * r / 4, ty + 10 + (i % 2 ? 2.6 : 0) ]);
    base.push(pcw([ ...rim, ...sc ]), circle(tx, ty - 3, 2));
    for (let k = 0; k < 4; k++) light.push(pcw([ [ tx, ty - 4 ], [ tx - r + k * r / 2, ty + 10 ], [ tx - r + (k + .5) * r / 2, ty + 10 ] ]));
  };
  umbrella(420, 66, 40, .12); umbrella(860, 62, 36, -.1); umbrella(1240, 70, 42, .08);
  // towels and people
  for (const [ x, w ] of [ [ 400, 80 ], [ 880, 70 ], [ 1210, 76 ] ]) { light.push(pcw([ [ x - w / 2, g(x) + 6 ], [ x + w / 2, g(x) + 6 ], [ x + w / 2 + 6, g(x) + 13 ], [ x - w / 2 + 6, g(x) + 13 ] ])); for (let k = 1; k < 4; k++) dark.push(pcw([ [ x - w / 2 + k * w / 4, g(x) + 6 ], [ x - w / 2 + k * w / 4 + 3, g(x) + 6 ], [ x - w / 2 + k * w / 4 + 9, g(x) + 13 ], [ x - w / 2 + k * w / 4 + 6, g(x) + 13 ] ])); }
  base.push(lier(372, g(372) + 6, 54, 1), sitter(436, g(436) + 3, 38, { dir: -1 }), sitter(900, g(900) + 3, 36, { dir: 1 }), sitter(1270, g(1270) + 3, 34, { dir: -1 }), lier(1180, g(1180) + 6, 50, 1));
  base.push(person(600, g(600) + 6, 48, { dir: 1, stride: 1 }), person(628, g(628) + 6, 46, { dir: 1, stride: .8, dress: true }), person(1040, g(1040) + 4, 47, { dir: -1, stride: 0 }));
  // a surfboard stuck upright next to its surfer, a kid, a sandcastle, a ball
  base.push(ell(1068, g(1068) - 28, 7, 34, .08), pcw([ [ 1060, g(1060) - 10 ], [ 1056, g(1056) - 2 ], [ 1063, g(1063) - 4 ] ])); light.push(ell(1068, g(1068) - 28, 1.2, 30, .08));
  { const x = 720, y = g(720) + 4; base.push(rect(x, y - 16, 40, 16), rect(x + 4, y - 30, 10, 14), rect(x + 26, y - 30, 10, 14), rect(x + 14, y - 22, 12, 8), rect(x + 16, y - 42, 8, 14)); for (const tx of [ x + 4, x + 26 ]) for (let k = 0; k < 3; k++) base.push(rect(tx + k * 3.6, y - 33, 2.4, 3)); base.push(rect(x + 19.4, y - 54, 1.2, 12), pcw([ [ x + 20.6, y - 54 ], [ x + 28, y - 51 ], [ x + 20.6, y - 48 ] ])); dark.push(`M${x + 16} ${y}v-7a4 4 0 0 1 8 0v7Z`); light.push(rect(x, y - 16, 40, 1.4), rect(x, y - 9, 40, 1.4));
    base.push(sitter(x - 22, y - 1, 26, { dir: 1 }), pcw([ [ x - 6, y ], [ x - 8, y - 9 ], [ x + 2, y - 9 ], [ x, y ] ]), seg([ x - 8, y - 9 ], [ x - 2, y - 13 ], .8)); }
  { const bx = 560, by = g(560) - 9; base.push(circle(bx, by, 10)); for (const a of [ 0, 2.1, 4.2 ]) light.push(pcw([ [ bx, by ], [ bx + Math.cos(a) * 10, by + Math.sin(a) * 10 ], [ bx + Math.cos(a + .7) * 10, by + Math.sin(a + .7) * 10 ] ])); }
  base.push(gull(980, g(980) + 3, 13, -1), gull(1010, g(1010) + 5, 11, 1));
  // footprints walking off, shells and starfish
  for (let k = 0; k < 14; k++) { const x = 650 + k * 22, y = g(x) + 12 + Math.sin(k) * 2 + (k % 2 ? 6 : 0); dark.push(ell(x, y, 4, 1.6, .1)); }
  for (const [ x, dy ] of [ [ 280, 14 ], [ 520, 24 ], [ 990, 20 ], [ 1380, 16 ] ]) { const y = g(x) + dy, star = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.4 : 6; star.push([ x + Math.cos(a) * r, y + Math.sin(a) * r * .55 ]); } light.push(pcw(star)); }
  for (const [ x, dy ] of [ [ 330, 24 ], [ 780, 18 ], [ 1120, 26 ] ]) light.push(`M${x - 5} ${g(x) + dy}a5 4 0 0 1 10 0Z`);
  // dune grass and a leaning sand fence at the right
  base.push(ground(smooth([ [ 1270, 290 ], [ 1360, 266 ], [ 1440, 258 ], [ 1500, 258 ] ])).replace(/^M0 320 L/, `M1270 320 L`));
  for (let x = 1300; x < W + 4; x += R(3, 5)) { const y = yAt(smooth([ [ 1270, 290 ], [ 1360, 266 ], [ 1440, 258 ], [ 1500, 258 ] ]), x) + 3, h = R(16, 44), l = R(-2, 14); base.push(pcw([ [ x - 1.4, y ], [ x + l * .6, y - h * .7 ], [ x + l, y - h ], [ x + 1.4, y ] ])); }
  for (let x = 1320; x < W; x += 9) base.push(seg([ x, 290 - (x - 1320) * .25 ], [ x + 4, 254 - (x - 1320) * .25 ], 3.4));
  L.beach = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ] ] };
}
// Rim: standing at a canyon's edge: a rock ledge with an overhang on the left where a hiker looks out, low ground in the
// middle (the canyon shows past it), rocks rising on the right with someone sitting over the drop, twisted junipers,
// a cairn, cracks, strata and shrubs.
{
  const p = [ ...wobble(0, 360, 210, 3, 20), ...jag([ [ 380, 214 ], [ 430, 240 ], [ 480, 256 ], [ 540, 290 ], [ 620, 302 ] ], 3, .2), ...wobble(640, 1140, 304, 2, 30),
    ...jag([ [ 1160, 300 ], [ 1210, 268 ], [ 1260, 250 ], [ 1330, 236 ], [ 1440, 232 ] ], 3, .2) ].filter(q => q[0] <= W);
  const base = [ ground(p) ], light = [], dark = [];
  // the overhang: a slab sticking out past the ledge
  base.push(pcw([ [ 300, 206 ], [ 360, 202 ], [ 420, 205 ], [ 470, 208 ], [ 476, 213 ], [ 440, 220 ], [ 380, 224 ], [ 320, 220 ] ]));
  dark.push(pcw([ [ 380, 222 ], [ 440, 218 ], [ 476, 213 ], [ 470, 222 ], [ 420, 236 ], [ 380, 236 ] ]), pcw([ [ 300, 216 ], [ 476, 211 ], [ 476, 215 ], [ 300, 222 ] ]));
  for (let yy = 218, k = 0; yy < H; k++) { const h = R(1.5, 3.5); if (k % 3 === 1) light.push(rect(0, yy, W, h)); yy += h + R(6, 14); }
  dark.push(pcw([ [ 400, 230 ], [ 620, 302 ], [ 620, H ], [ 380, H ] ]), pcw([ [ 1160, 300 ], [ 1260, 250 ], [ 1240, H ], [ 1150, H ] ]));
  for (const [ x, y ] of [ [ 120, 214 ], [ 260, 214 ], [ 1300, 242 ], [ 1400, 236 ] ]) dark.push(strokeLine(jag([ [ x, y ], [ x + R(-14, 14), y + R(40, 90) ] ], 3, .35), 1.6));
  light.push(...wobble(0, 470, 0, 0, 30).map(([ x ]) => rect(x, (x < 360 ? 210 : 205) - 1, 30, 2.4)));
  // junipers: a twisted trunk and flat clumps
  const juniper = (x, y, h, dir) => {
    const tr = [ [ x, y ], [ x + dir * h * .1, y - h * .3 ], [ x - dir * h * .05, y - h * .55 ], [ x + dir * h * .2, y - h * .8 ] ];
    base.push(strokeLine(tr, 4.4), strokeLine([ tr[1], [ x - dir * h * .25, y - h * .5 ] ], 2.6), strokeLine([ tr[2], [ x + dir * h * .35, y - h * .6 ] ], 2.4));
    for (const [ cx, cy, r ] of [ [ tr[3][0], tr[3][1] - 6, h * .3 ], [ x - dir * h * .28, y - h * .55, h * .22 ], [ x + dir * h * .38, y - h * .64, h * .2 ], [ tr[3][0] - dir * h * .18, tr[3][1] + 2, h * .22 ] ]) { base.push(ell(cx, cy, r, r * .5), ell(cx + r * .4, cy - r * .2, r * .6, r * .4)); dark.push(ell(cx + r * .1, cy + r * .25, r * .9, r * .25)); light.push(ell(cx - r * .3, cy - r * .25, r * .35, r * .15)); }
  };
  juniper(80, 212, 96, 1); juniper(240, 212, 70, -1); juniper(1380, 236, 88, -1);
  base.push(person(440, 206, 50, { dir: 1, stride: 0, pack: true, stick: true, hat: true }));
  base.push(sitter(1236, 258, 36, { dir: -1, hang: true, pack: true }));
  { let cy = 212; for (const [ rx, ry ] of [ [ 12, 5 ], [ 10, 4.4 ], [ 8, 4 ], [ 6.4, 3.4 ], [ 4.6, 2.8 ] ]) { base.push(ell(300 + R(-1.5, 1.5), cy - ry, rx, ry)); cy -= ry * 1.8; } }
  for (const [ x, y ] of [ [ 30, 212 ], [ 170, 212 ], [ 330, 208 ], [ 1300, 244 ], [ 1430, 233 ] ]) base.push(circle(x - 6, y - 4, 6), circle(x + 5, y - 4, 7), circle(x, y - 8, 7));
  for (const [ x, w, h ] of [ [ 200, 22, 12 ], [ 1340, 30, 18 ] ]) { const r = rock(x, (x < 400 ? 212 : 238), w, h); base.push(r.base); light.push(r.light); dark.push(r.dark); }
  // Lowered as a whole, so it reads as a foreground strip with the canyon open above it.
  const down = (d) => d.replace(/([ML])(-?[\d.]+) (-?[\d.]+)/g, (_, c, x, y) => `${c}${x} ${n(+y + 34)}`);
  L.rim = { ground: true, clip: true, parts: [ [ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ] ].map(([ t, d ]) => [ t, down(d) ]) };
}

/* MORE DETAIL ON THE ORIGINALS */

// City: cornices and floor ledges, rooftop units, fire escapes, billboards and a few lit signs.
{
  const base = [], light = [], dark = [];
  CITY.forEach(({ x, w, h, top, kind }, i) => {
    dark.push(rect(x, top + 2, w, 2.4));
    for (let yy = top + R(30, 50); yy < H - 10; yy += R(36, 60)) dark.push(rect(x, yy, w, 1.4));
    if (kind === 0) { for (let k = 0; k < RI(1, 3); k++) base.push(rect(x + R(4, w - 16), top - R(5, 9), R(8, 14), 10)); }
    if (w > 50 && h > 100 && rnd() < .5) { for (let yy = top + 20; yy < H - 20; yy += 24) { dark.push(rect(x + 4, yy, w * .34, 2), strokeLine([ [ x + 6, yy + 22 ], [ x + w * .34, yy + 2 ] ], 1)); } }
    if (kind === 0 && w > 45 && rnd() < .4) { const bx = x + w * .15, bw = w * .7; base.push(rect(bx + 4, top - 14, 2, 14), rect(bx + bw - 6, top - 14, 2, 14), rect(bx, top - 40, bw, 26)); light.push(rect(bx + 3, top - 37, bw - 6, 20)); dark.push(rect(bx + 6, top - 33, bw * .5, 3), rect(bx + 6, top - 27, bw * .3, 3)); }
    if (i % 5 === 2 && h > 80) light.push(rect(x + w - 8, top + 20, 4, Math.min(60, h - 40)));
  });
  L.city.parts.push([ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ]);
}
// Forest: an undergrowth of ferns, rocks and mushrooms, and a stag.
{
  const base = [], light = [], dark = [];
  for (let i = 0; i < 22; i++) {
    const x = R(0, W), y = 298, len = R(18, 36);
    for (let f = 0; f < 5; f++) { const a = -Math.PI * (.12 + .76 * f / 4), pts = []; for (let k = 0; k <= 6; k++) { const t = k / 6; pts.push([ x + Math.cos(a) * len * t, y + Math.sin(a) * len * t + len * .35 * t * t ]); } base.push(pcw([ ...pts.map(([ px, py ], k) => [ px, py - 1 + k / 6 ]), ...pts.map(([ px, py ], k) => [ px, py + 1 - k / 6 ]).reverse() ])); for (let k = 1; k < 6; k += 1) { const [ px, py ] = pts[k], s = (1 - k / 7) * 5; base.push(pcw([ [ px, py ], [ px + Math.cos(a + 1.3) * s, py + Math.sin(a + 1.3) * s ], [ px + Math.cos(a) * 2, py + Math.sin(a) * 2 ], [ px + Math.cos(a - 1.3) * s, py + Math.sin(a - 1.3) * s ] ])); } }
  }
  for (const [ x, w, h ] of [ [ 260, 26, 14 ], [ 880, 20, 10 ], [ 1320, 30, 16 ] ]) { const r = rock(x, 300, w, h); base.push(r.base); light.push(r.light); dark.push(r.dark); }
  for (const x of [ 300, 312, 905, 1350 ]) { base.push(rect(x - 1.2, 292, 2.4, 8), `M${x - 6} 293a6 5 0 0 1 12 0Z`); light.push(circle(x - 2, 290, 1), circle(x + 2.4, 291, .8)); }
  base.push(deer(1110, 302, 66, -1));
  L.forest.parts.push([ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ]);
}
// Farm: cows grazing, round hay bales and a tractor.
{
  const { gy } = FARM, base = [], light = [], dark = [];
  for (const [ x, dir ] of [ [ 600, 1 ], [ 680, -1 ], [ 760, 1 ], [ 1160, -1 ] ]) { base.push(cow(x, gy(x) + 3, 26, dir)); light.push(cowSpots(x, gy(x) + 3, 26, dir)); }
  for (const x of [ 880, 912, 1300, 1340 ]) { const y = gy(x) - 10; base.push(circle(x, y, 11)); dark.push(ring(x, y, 7, 1.2), ring(x, y, 3.6, 1)); light.push(ell(x - 4, y - 6, 4, 2)); }
  { const x = 180, y = gy(180) + 2; base.push(circle(x, y - 14, 14), circle(x + 40, y - 8, 8), rect(x - 8, y - 32, 52, 18), rect(x - 4, y - 52, 22, 22), rect(x + 30, y - 40, 3, 10)); light.push(rect(x, y - 48, 14, 12)); dark.push(circle(x, y - 14, 9), circle(x + 40, y - 8, 4.6)); light.push(circle(x, y - 14, 3.4), circle(x + 40, y - 8, 1.8)); }
  L.farm.parts.push([ 'base', base.join('') ], [ 'dark', dark.join('') ], [ 'light', light.join('') ]);
}

/* OUTPUT --------------------------------------------------------------------------------------------------------- */
const kb = (s) => (s.length / 1024).toFixed(1);
let out = `// Generated: detailed scenery silhouettes in a 1440 x 320 box (scenery.js draws them). Each layer: ground (sits on the
// bottom), clip (light / dark parts are clipped to the base's outline), stroke (drawn as lines), and parts: [tone, path]
// in drawing order; tone: base (the layer color), light (toward the sky), dark (shadow), line (a stroke).
// Regenerate with scenery-paths.gen.mjs (seeded, so the same every run) rather than editing by hand.\n\nconst SCENERY = {\n`;
for (const [ k, v ] of Object.entries(L)) {
  out += `  ${k}: ${JSON.stringify(v)},\n`;
  console.error(k.padEnd(10), kb(JSON.stringify(v)), 'kB');
}
out += '};\n\nexport { SCENERY };\n';
writeFileSync(process.argv[2], out);
console.error('total', kb(out), 'kB');
