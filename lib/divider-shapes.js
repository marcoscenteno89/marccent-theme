/*
 * Section dividers' shapes (Divider in components/widgets/divider.js): each one layers of paths in a W x H box, back
 * to front, filled along the bottom: the part in the section's own color, reaching into its neighbor. A layer behind
 * the front one is the same color, fainter (opacity), and with x and y it moves with the scroll (parallax): x, the
 * most it slides sideways (% of its width, either way); y, how far down it sits (px) while low on the screen.
 * Shapes a motion can roll are periodic: their left and right ends meet, so a copy beside them tiles.
 * dividers.gen.mjs writes them, as the CSS masks the markup uses, to markup/dividers.json; the morphs run in the
 * browser (core/divider.js), so they're here too.
 */
const W = 1200, H = 120;
const n = (v) => Math.round(v * 10) / 10;
const seeded = (s) => () => (s = (s * 9301 + 49297) % 233280) / 233280;
const close = (d) => `${d} L${W},${H} L0,${H} Z`;
const clamp = (f, from = 0, to = 1) => Math.max(0, Math.min(1, (f - from) / (to - from)));

// A wave of whole periods, so it tiles.
const wave = (periods, mid, amp) => {
  const p = W / periods;
  let d = `M0,${mid} Q${n(p / 4)},${mid - amp} ${n(p / 2)},${mid}`;
  for (let x = p; x <= W + .1; x += p / 2) d += ` T${n(x)},${mid}`;
  return close(d);
};
const zigzag = (step, top, bottom) => {
  let d = `M0,${bottom}`;
  for (let x = step, up = true; x <= W; x += step, up = !up) d += ` L${x},${up ? top : bottom}`;
  return close(d);
};
const torn = (s) => {
  const rnd = seeded(s);
  let d = 'M0,70';
  for (let x = 0; x <= W; x += 14 + rnd() * 18) d += ` L${n(x)},${n(52 + rnd() * 34)}`;
  return close(`${d} L${W},66`);
};
const puffs = (s, base) => {
  const rnd = seeded(s);
  let d = `M0,${H} L0,${base}`, x = 0;
  while (x < W) {
    const r = 30 + rnd() * 40, nx = Math.min(W, x + r * 2);
    d += ` A${n(r)},${n(r)} 0 0 1 ${n(nx)},${base}`;
    x = nx;
  }
  return close(d);
};
const hills = (s, base, amp) => {
  let d = `M0,${H}`;
  for (let x = 0; x <= W; x += 30) d += ` L${x},${n(base + amp * (Math.sin(x / (170 + s * 23) + s) * .7 + Math.sin(x / 71 + s * 2) * .3))}`;
  return close(d);
};
const range = (s, base, amp, step = 70) => {
  const rnd = seeded(s);
  let d = `M0,${H} L0,${base}`;
  for (let x = step / 2; x < W; x += step * (.6 + rnd() * .8)) {
    d += ` L${n(x)},${n(base - amp * (.3 + rnd() * .7))} L${n(x + step * .4)},${n(base - amp * rnd() * .25)}`;
  }
  return close(`${d} L${W},${base}`);
};
const treeline = (s, base, tall = 1) => {
  const rnd = seeded(s);
  let d = `M0,${H} L0,${base}`, x = 0;
  while (x < W) {
    const w = 26 + rnd() * 30;
    d += ` L${n(x + w / 2)},${n(base - (26 + rnd() * 40) * tall)} L${n(x + w)},${base}`;
    x += w * .7;
  }
  return close(d);
};
const skyline = (s) => {
  const rnd = seeded(s);
  let d = 'M0,120 L0,80', x = 0;
  while (x < W) {
    const w = 40 + rnd() * 70, top = n(18 + rnd() * 60);
    d += ` L${n(x)},${top} L${n(x + w)},${top}`;
    x += w;
  }
  return close(`${d} L${W},80`);
};

// The shapes that change with the scroll. f is where the divider is in the window: 0 as it comes in at the bottom,
// 1 as it leaves at the top. rest: the f the shape is drawn at without the script (and under reduced motion).
const MORPHS = {
  unfold: { rest: .5, d: (f) => `M0,0 Q600,${n(230 * (1 - f) + 10)} ${W},0 L${W},${H} L0,${H} Z` },
  seesaw: { rest: 0, d: (f) => `M0,${H} L0,${n(H * (1 - f))} L${W},${n(H * f)} L${W},${H} Z` },
  rise: { rest: 1, d: (f) => `M0,${H} Q600,${n(H - 210 * clamp(f, .15, .6))} ${W},${H} Z` },
};

// A path as the CSS mask the markup carries (in style="--mask: …", so single quotes).
const mask = (d) => `url('data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}"/></svg>`)}')`;

// Every shape: its title, its layers ({ d, opacity, x, y }) and the motions (CSS) and scroll effects it takes.
const layer = (d, opacity = 1, x = 0, y = 0) => ({ d, opacity, x, y });
const SHAPES = {
  wave: { title: 'Wave', layers: [ layer(wave(2, 60, 34)) ], motions: [ 'roll', 'swell' ] },
  waves: { title: 'Layered waves', layers: [ layer(wave(3, 44, 24), .3, 24, 20), layer(wave(2, 62, 22), .55, -16, 12), layer(wave(4, 82, 16), 1, 6, 4) ],
    motions: [ 'tide' ], scrolls: [ 'parallax' ] },
  slant: { title: 'Slant', layers: [ layer(MORPHS.seesaw.d(MORPHS.seesaw.rest)) ], scrolls: [ 'seesaw' ] },
  curve: { title: 'Curve', layers: [ layer(MORPHS.unfold.d(MORPHS.unfold.rest)) ], scrolls: [ 'unfold' ] },
  arc: { title: 'Arc', layers: [ layer(MORPHS.rise.d(MORPHS.rise.rest)) ], motions: [ 'breathe' ], scrolls: [ 'rise' ] },
  notch: { title: 'Notch', layers: [ layer(`M0,26 L540,26 L600,${H} L660,26 L${W},26 L${W},${H} L0,${H} Z`) ] },
  peaks: { title: 'Peaks', layers: [ layer('M0,120 L0,78 L150,34 L290,86 L470,16 L640,82 L800,40 L960,92 L1090,30 L1200,62 L1200,120 Z', .45, -20, 30),
    layer('M0,120 L0,96 L210,58 L380,100 L600,52 L790,104 L990,62 L1200,96 L1200,120 Z', 1, -4, 6) ], scrolls: [ 'parallax' ] },
  zigzag: { title: 'Zigzag', layers: [ layer(zigzag(30, 30, 90)) ], motions: [ 'roll' ] },
  torn: { title: 'Torn paper', layers: [ layer(torn(7)) ] },
  clouds: { title: 'Clouds', layers: [ layer(puffs(8, 70), .4, -26, 30), layer(puffs(21, 92), 1, 14, 6) ], scrolls: [ 'parallax' ] },
  hills: { title: 'Rolling hills', layers: [ layer(hills(1, 40, 26), .3, -20, 50), layer(hills(4, 62, 22), .6, 12, 28), layer(hills(7, 86, 16), 1, -4, 8) ],
    scrolls: [ 'parallax' ] },
  mountains: { title: 'Mountain range', layers: [ layer(range(5, 70, 66, 90), .3, -26, 44), layer(range(9, 88, 50), .6, -14, 24), layer(range(13, 104, 30, 50), 1, -4, 6) ],
    scrolls: [ 'parallax' ] },
  forest: { title: 'Forest', layers: [ layer(treeline(3, 70, .6), .3, -22, 40), layer(treeline(17, 86, .8), .6, 10, 20), layer(treeline(29, 104), 1, -4, 6) ],
    scrolls: [ 'parallax' ] },
  skyline: { title: 'City skyline', layers: [ layer(skyline(3), .45, -24, 30), layer(treeline(11, 96), 1, -6, 8) ], scrolls: [ 'parallax' ] },
};

export { W, H, SHAPES, MORPHS, mask };
