# Markup reference

The HTML the React components render, for hosts that write the same markup themselves (the WordPress blocks'
`render.php`, django-marccent's template tags), so their copies can't drift from the components unnoticed.

- `cases.json`: the inputs, in fields every host has (a button's label, href, icon, newTab, trace and extra classes; an
  icon's name, family and classes; a section's, grid's or card's settings, as `components/widgets/section.js` names
  them, and its `content`, HTML the host puts inside as it is; a nav bar's brand (name, href, logo) and menu items).
- `reference.json`: each case with the HTML the component renders for it. Written by `npm run markup`
  (`scripts/markup.mjs`, which maps the fields to the component's props); `npm test` fails when it's out of date.

- `outputs.json`: the **outputs** (a list that can grow: today `wp`, `html`, `django`), each with whether it has an
  **admin** (`true`: people edit the site's data in an admin, as wp-admin or Django's admin; `false`: the data comes
  with the page, as plain HTML or Next) and its adapters (where each one's folder is and the command that renders the
  cases, or that it uses the components themselves). And the **admin pattern**, the same for every output with an
  admin: each kind of admin data (`menu`, `rows`, `site`, `theme`, `keys`, `entries`), what it is, and which tool
  provides it on each admin output (`null`: none yet).
- `settings.json`: every component, with its kind (and each setting: type, about, default, choices, sanitize,
  validate; a version per component: PRODUCT-LINE.md 5), its kind (`component`, `container`, `pattern`, `variant` or `remove`:
  PRODUCT-LINE.md 4.5; a pattern, variant or remove here is waiting to leave), its parent when it only exists inside another (`parent`), `planned` when it's decided but not built yet, the kinds of admin data it needs on an output with an admin (`[]`: none) and
  its settings (T-029: names, types, choices, defaults; `null` until written).

- `tunes.json`: the settings every component takes (extra classes, an anchor, Show if), listed once.

`npm run conformance` (also in `npm test`, `scripts/conformance.mjs`) is the Settings and Adapters gates in
PRODUCT-LINE.md: it runs each adapter and compares what it prints with `html`, one comparison for every adapter, and
lists what each doesn't cover; it checks that every kind a component needs is defined, and lists the kinds an admin
output has no tool for and the settings not written. `--strict` fails on what's missing too.

A host renders each case its own way (reading the reference on stdin, printing `{ component: { case: html } }`) and is
compared with `html`: the same elements, attributes and text (the
order of attributes and of classes, whitespace between tags, and in a `style` the spaces around `:` and `;` and a
last `;`, don't count). Ids the components generate (React's `useId`) are written `id-1`, `id-2`…: a host writes its
own, the same one wherever the reference repeats it.

The reference is also the markup that 1.x keeps: a release whose `reference.json` changes for an existing case changes
the public markup (README, Versions).

`npm run cases` builds and serves the **cases page** (`scripts/cases.mjs`, http://localhost:4321/): every case live with
the theme's CSS and plain-JS engine (dist/), beside each adapter's markup for it (run fresh, `conformance --save`),
marked same, different or not covered. Run it again after a change (`npm run build` first for a style change) and
reload. A test tool: nothing ships from it.
