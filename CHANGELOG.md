# Changelog

Each release, newest first. From 1.0 the versions are semantic: what a patch, a minor and a major may change is in the
README (Versions → What a version promises).

## Unreleased

### Added
- Children for the components that took a list (T-034, PRODUCT-LINE.md 6.1): `TimelineItem`, `DockItem`,
  `RadialMenuItem`, `StepBarStep`, `OrbitItem` and `Tab`, each marked with its parent in `markup/settings.json`. Breaking:
  Timeline (`events`), Dock and RadialMenu (`items`), StepBar (`steps`), TabBar (`tabs`) and Orbit (`items`) take them
  as children instead; Orbit's bare positions (a number for `items`) are `positions`. The markup is the same, each
  child with its own `data-component`.

- `docs/projects.json`: every project on the theme, what it reads from it, how it pins it and its stage; `npm run
  affected` lists the projects a change reaches (directly or through Marccent Blocks). `npm run todos` takes its
  project list from it. `npm run status`: every project's pin against the theme, and what each is behind on (fails
  when an active project is behind).

- Work lists: PRODUCT-LINE.md section 8 (the rules and the TODO.md template) and `npm run todos` (in `npm test`).
- How Claude works: PRODUCT-LINE.md section 9 (grey areas asked in one shape and written down in its Decisions;
  no claim without output; one goal per change; nothing removed without a ticket), section 2 rules 7 and 8, and
  CLAUDE.md.
- Sizing: PRODUCT-LINE.md section 4, rule 9 (a component sets no width and no outer margin; its container decides
  both), checked by `npm run conformance` on the roots in `styles/components`.

- Clean components (PRODUCT-LINE.md 2026-11-10): 4.5 asks "whose state is it?" first; section 4, rule 10 (a component
  styles only itself, and one taking two or more named pieces of content is a probable pattern), checked by `npm run
  conformance` (it found Menu reaching ToggleButton's panel: B-004); rule 9's components sized by their state (Sidebar).

- `Sidebar` (components/widgets/sidebar.js, `data-component="sidebar"`): AppShell's collapsing sidebar as a component
  of its own; its width is its state (rule 9). Menu's `.menu-vertical` (a column of links whose dropdowns open in
  place), which AppShell's stylesheet used to force on the Menu from outside. PATTERNS.md: the App frame pattern.

- `patterns/*.html`: each pattern's markup as a file (Footer, Image card, Header, Floating header, App frame), and `npm
  run patterns` (in `npm test`): fails on a class the theme doesn't define or a `data-component` nothing writes.

- `.d-md-none` (hidden from 768px: phones only) and `.d-md-block` (with `.d-none`: shown from 768px only), the
  screen-width breakpoint `.sticky-md-top` uses (T-003).

- `docs/KITS.md`: the Kits stage's list, a kit's file (a Marccent export with a `kit` header) and its check (`npm run kits`
  in marccent-kits); the Local business kit first, eight more after 1.0. projects.json: marccent-kits and marccent-patterns.

- Countdown, Parallax and Stars in `markup/settings.json` (their settings: `from`; `speed`; `value`, `maximum`, `icon`)
  and their markup cases, so every adapter writes them as the components do.

### Changed
- Work moved to GitHub Issues on a GitHub Projects board (the Marccent board), run as Kanban (PRODUCT-LINE.md
  section 8, rewritten; Decisions 2026-11-11): the 103 open items in TICKETS.md and `docs/todo/` are issues #6–#104,
  labeled by project and kind, bugs and requests in the 1.0 milestone. TICKETS.md keeps only the old IDs and their issues.
- StatCard has no box of its own (T-033): no `round shadow pad hover-holographic` on its root; it goes inside a Card.
  Its settings are in `markup/settings.json`.
- The components' props are the settings' full words (PRODUCT-LINE.md 5.4; breaking for React callers): Section
  `padY` → `verticalPadding`; Grid `cols` → `columns`, `min` → `minimumColumnWidth`, `row` → `minimumRowHeight`; Card
  `pad` → `padding`; Code `lang` → `language`; Rating, Stars, TagInput and Toast `max` → `maximum` (and
  `toastSI.mount({ maximum })`); Scenery `min` → `minimumHeight`. The markup is the same; `markup/cases.json`'s fields
  use the new names, `markup/settings.json` has no `prop` left, and `npm run conformance` fails on one.
- The engine's markup and the rest of the props in full words too (breaking for hand-written markup and React
  callers): `data-lang` → `data-language` (Code), `data-max` → `data-maximum` (Tag input), `data-min-lines` →
  `data-minimum-lines`, `data-max-size` → `data-maximum-size` (File drop), `data-dir` → `data-direction` (Orbit's
  turning layers); Code and CodeTabs `minLines` → `minimumLines`, CodeTabs `langs` → `languages`, FileDrop `maxSize` →
  `maximumSize`, CodeView's `lang` → `language`.
- The last short names in full words (breaking for hand-written markup, React callers and saved content): Animation
  `fps` → `frameRate` (`data-fps` → `data-frame-rate`, p5's and the browser's own word); Map's `data-lat` / `data-lng`
  → `data-latitude` / `data-longitude` (its `center` and pins stay `{ lat, lng }`, Google's shape); Section
  `minHeight` → `minimumHeight`. `markup/cases.json`'s fields with them (the map's `latitude`, `longitude`).
- Marccent Local deleted (2026-11-10): out of `docs/projects.json`, its list `docs/todo/marccent-local.md` gone.
  What was left of it (one-time migrations, the Map's default pin, the hours shortcodes) is on wp's TODO.md, site by site.
- `docs/WORKING.md`: how Claude works, one copy for every project. Each `CLAUDE.md` imports it (`@docs/WORKING.md`)
  and names only its work list, so a rule change is one commit here instead of one per repo. marccent.com is
  frozen in `docs/projects.json`: only wp and the theme are active.
- `docs/`: PRODUCT-LINE.md, TICKETS.md, PATTERNS.md and SITES.md moved there, and every project's work list with them
  (`docs/todo/<repo>.md`); the projects keep no TODO.md of their own, only links. `npm run todos` reads them there
  (no `--root`); the lists were brought into section 8's shape on the way (found dates, shipped tickets' lines gone).

### Fixed
- One breakpoint scale (B-008), Tailwind's: `sm` 40rem, `md` 48rem, `lg` 64rem, so a name is one width everywhere.
  `.icon-only-md` hides the label below 48rem (was 56rem). A header folds at `lg`: Menu `fold`, Toggle button's fold,
  `.layout-ends` and Sidebar's top bar change at 64rem (was 56rem). `.sticky-md-top` and `.d-md-*` are written 48rem
  (768px, unchanged). `npm run conformance` fails on a breakpoint off the scale.
- Menu fold's panel on phones is full width under its header (T-032): under the band its button sits in (the nearest
  `.wrap-fluid`), as wide as it, square with a line under it; one left open closes when the header grows past 56rem.
- Menu no longer styles Toggle button's panel (B-004): the fold is Toggle button's own `fold` setting
  (`.toggle-fold`, button.css) and Menu `fold` uses it; markup: the wrapper is `<div class="toggle-fold">` (was
  `<div data-component="menu-fold" class="menu-fold">`), the nav takes `.menu-fold`.
- Loading sets no width of its own (B-003): a block that fills its parent, so a flex parent that shrinks it stretches
  it (`.self-stretch`, `.w-100`).
- A Toggle button with a panel follows it in the engine (B-006): `aria-expanded` and the icon (Menu fold's bars →
  xmark) say whether the panel is open, whatever closed it; before, they stayed closed.
- Menu fold's button is the icon's square: its own padding (a frame around the icon) gone.
- Menu's `layout="cols-1"` is one column (B-005): `--cols` is written only for the fixed layout, which outranked
  `.cols-1` and every other layout's own columns.

### Removed
- `docs/todo/` (every project's work list) and `npm run todos` (`scripts/todos.mjs`, out of `npm test`): replaced by
  GitHub Issues.
- `ImageCard` and `Collage` (and `components/widgets/collage.js`, with its tile helpers `Spinner`, `Light`, `Ghost`,
  `Stars` and `Progress`): the Image card and Collage patterns (PATTERNS.md, T-033), on the theme's `.overlay-*`,
  `.dense`, `.rows-min` and `.row-span-N`. The animation player's stage is an Image card.
- `AppShell`: a Sidebar beside the page (the App frame pattern, PATTERNS.md).
- `NavBar` (and `nav.css`, its `nav-bar` engine and markup cases): the header is the Header pattern (PATTERNS.md), a
  Section and a Grid around Menu `fold`, a Button and the theme controls; the floating pill variant is the Floating header pattern: `.fixed-top`, `.pe-none` / `.pe-auto` and
  `.solid-on-scroll` (see-through until the page scrolls: the engine sets `<html data-scrolled>`).
  A Menu's dropdowns always close on an outside click and Esc (the engine's `menu`).

- `patterns/*.html` and their check moved to the marccent-patterns repository (the list stays in `docs/PATTERNS.md`);
  `npm run patterns` runs that check against this theme as it's being changed. The package no longer ships `patterns/`.
## 1.0.0-rc.22

### Added
- Menu's settings: `label`, `iconOnly`, `layout`, `gap` and `hover` beside `fold` (Menu's version 2).

### Changed
- The conformance check reads the props a component hands on whole (Menu's `...props` to its nav) as its own.

## 1.0.0-rc.21

Toward 1.0: what the restructuring needed from the theme, the settings written, the Sites list.

### Added
- `.overlay-tint` (the theme's gradient multiplied over a photo, an Image card's tint).
- Grid: `dense` (packs items of different spans, `.dense`) and `row` (a minimum row height, `.rows-min` with --row);
  `.row-span-2` to `-4`. A new markup case: Grid, "dense, rows at least 10rem".
- Counter: `controls`, its own Start / Stop button and the last time (a stopwatch). A new markup case.
- `markup/settings.json`: every component's settings (54, with sanitize, validate and a version); `markup/tunes.json`;
  the conformance check reads each component's props so a setting can't drift from the code. `SITES.md`.
- The cases page (`npm run cases`): every case live in a browser beside each adapter's.

### Changed
- `parse5` is a dependency (not a dev one), so an adapter can run `scripts/conformance.mjs` from its copy.

### Removed
- `HexWall`: a HexGrid with HexFlip children is the wall.

## 1.0.0-rc.20

### Added
- `.overlay-blur` (the lower part of what's behind a layer blurred, fading out going up) and `.overlay-focus`
  (everything but a circle in the middle), backdrop filters, so they blur a photo, a video or a live animation with no
  second copy of the image; `--overlay-blur` (14px). For the Image card pattern (PATTERNS.md).

### Changed
- `.stack`'s layers are positioned (`position: relative`), so they paint in source order even when one has a filter, a
  mask or a backdrop filter: text after an `.overlay-blur` stays sharp. A component's or a utility's position wins.

## 1.0.0-rc.19

The rules that tell a component from a container, variant, class or pattern, and the lists that track them. No
change to styles, components or markup.

### Changed
- PRODUCT-LINE.md 4.5: six questions (rule 3, parts that make one thing, folded into 1 and 2); children: a component
  that only exists inside another is marked with its parent. 6.1: a component's list of content is children, admin
  data or settings.
- `markup/settings.json`: each component's `kind` and `parent`, HexGrid, HexFlip, AccordionItem, StepForm, Step
  listed; six children `planned` (T-034). `npm run conformance` checks kinds, parents and variants, and reports
  what's waiting.
- PATTERNS.md: Collage a pattern; HexWall and ImageCard to remove; CodeTabs and Timeline components.

## 1.0.0-rc.18

Variants: one class that gives an item a shape of its own. The first is the ticket, which replaces TicketCard.
Markup changes for servers that write the theme's HTML (the markup reference has them).

### Added
- `.variant-ticket` (styles/variants.css): a stub torn off at the bottom, a notch on each side and a perforated tear
  line, --stub above the bottom edge (the item's last block keeps it clear); all mask, so any background, mode or
  hover works. Card's `variant` prop ("ticket"). The list of variants: `markup/variants.json`; a new markup case:
  Card, "the ticket variant".
- PRODUCT-LINE.md 4.5: one rule for component, container, variant, class or pattern (provisional); each component's
  kind in `markup/settings.json`, checked by `npm run conformance`.

### Removed
- `TicketCard`: a Card with the ticket variant and its own content does it.

## 1.0.0-rc.17

Patterns: what a site arranges its own way from the components is a pattern, listed with its parts and markup in
PATTERNS.md, not a component.

### Removed
- `Footer` (components/widgets/footer.js): it only arranged Menus in the grid classes. It's the Footer pattern now
  (PATTERNS.md has its markup); a site builds it from Menu and the classes, as marccent.com's own footer does.

### Added
- `PATTERNS.md`: the pattern list (the Footer; the Header to come, T-032) and the audit of which components only
  arrange others (T-033).

## 1.0.0-rc.16

The nav on its own, so a header is a pattern (a brand, a folding Menu, a call button, theme controls) instead of one
component; and the checks that keep every adapter's markup the same as the theme's.

### Added
- `Menu fold`: the menu behind a menu button where its container (the nearest `.wrap`, a header's width) is under
  56rem, a phone menu stacked in the button's panel (ToggleButton's panel); from 56rem it shows in place and the
  button hides (`.menu-fold`, `.menu-fold-toggle`, menu.css). A new markup case: Menu, "folded behind a menu button".
- `npm run conformance` (also in `npm test`): every adapter's markup against the reference, and what each doesn't
  cover (`markup/outputs.json`); the admin pattern every output with an admin follows, and each component's admin
  needs (`markup/settings.json`).
- `PRODUCT-LINE.md`: Marccent as a product line, its stages, gates and rules (TICKETS.md links to them).

## 1.0.0-rc.15

The audit of situation-specific classes: components made of classes that combine, and the classes they needed.
Markup changes for servers that write the theme's HTML (the markup reference has them).

### Added
- Plain starts, in the lowest layer: `.btn-plain`, `.input-plain`, `.list-plain`, `.caret`; one focus ring for
  everything a keyboard reaches (base styles), `.focus-inset`.
- Display and size: `.d-grid`, `.d-inline-grid`, `.d-contents`, `.w-max`, `.h-screen`, `.grow`, `.object-cover`,
  `.text-nowrap`, `.text-break`, `.font-mono`, `.fs-xs`, `.pad-control`, `.pad-y-control`.
- Layout: `.layout-icon`, `.rows-body`, `.cols-end`, `.cols-between`, `.content-center`, `.joined`, `.notch-top`,
  `.notch-bottom`, `.z-1`, `.z-dropdown`, `.z-sticky`, `.z-popup`, `.z-toast`, `.pe-none`, `.pe-auto`.
- Look: `.chip`, `.bg-muted`, `.bg-primary-tint`, `.bg-inverse`, `.bg-scrim`, `.glass-dark`, `.tint-current`,
  `.border-start`, `.border-end`, `.border-dashed`, `.hover-muted`, `.hover-opaque`; `.menu-quiet` (a Menu variant).

### Changed
- Padding (`pad-*`) and placement (`self-*`, `justify-self-*`, `place-self-center`) are unlayered: a class put on an
  element beats its component's own padding or place.
- `.input` sets no display, and shows its focus ring while something inside it has focus.
- Base styles: `pre` has no margin; `canvas` is a block.
- Markup, by component (old → new):
  - Menu: a dropdown's summary `menu-link` → `menu-link caret`. NavBar: the main menu adds `menu-quiet` (the look
    nav.css gave it from outside).
  - Accordion: the summary adds `caret hover-muted focus-inset`, the body `border-top`.
  - Modal: the dialog adds `bg-page border round shadow` (the ticket look adds none); the ticket's `modal-neck` /
    `modal-flare` → `notch-bottom` / `notch-top`; the footer's `style="justify-content:end"` → `cols-end`.
  - Drawer: adds `bg-page shadow` and `border-start` (`border-end` from the start); its panel's inline rows →
    `rows-body`.
  - Tooltip: `float tooltip` → `float bg-inverse round fs-sm pad-xs pad-x-sm pe-none shadow-sm`. Popover: `float
    popover …` → `float …`. LinkPreview's card: `tooltip-card` dropped.
  - Map: `map` → `map col-center round overflow-hidden`.
  - Field: adds `joined`. TagInput: `input row-wrap gap-xs pad-xs`, its list `[data-tags]`, its text field
    `[data-tag-entry]`, tags `chip pill bg-primary-tint`. FileDrop: the zone `[data-drop-zone]` with `border
    border-dashed round bg-muted`, items `layout-icon`.
  - Pagination and StepForm's steps: `page-link …` → `btn-plain … hover-muted tint-current` (`[data-page]`).
    DataTable's sort buttons: `sort-button` → `btn-plain …` (`[data-sort]`).
  - Toasts, Rating, Stars, Dock, Compare's tags, Code (its `<pre>` and copy button), TabBar's tabs, Clock, Counter,
    Price, the layout widgets: their looks as classes (see the components).
- Board's cells: give a button cell `.btn-plain` (Board no longer strips buttons).

### Removed
- `styles/components/clock.css`, `close.css`, `canvas.css`, `pagination.css`, `accordion.css`, `tag-input.css`, and
  their classes (`.timer`, `.btn-close`, `.page-link`, `.sort-button`, `.tag*`); `.toasts`, `.tooltip`,
  `.tooltip-card`, `.popover`, `.link-preview-image`, `.modal-neck`, `.modal-flare`, `.compare-tag`, `.stars`,
  `.dock`, `.file-drop-zone`, `.file-drop-item`, `.raised`.

### Fixed
- B-001: the code block's `<pre>` margin and the copy button's place (Fernway's stopgap removed).

## 1.0.0-rc.14

Price made of classes that combine, like the rest of the theme.

### Added
- `.raised` (its top level with the top of the text around it) and `.fs-50`, `.fs-75` (a share of the text around
  it, whatever its size).

### Changed
- Price is made of `.raised`, `.fs-50`, `.text-muted`, `.nums-tabular` and `<s>`: no classes or stylesheet of its own.
- typeset's ™ ® ℠ are `<sup class="raised fs-50">`.

### Removed
- `styles/components/price.css` and its `.price-*` classes; `sup.mark-sup`.

## 1.0.0-rc.13

Typography: text set the way print sets it, and prices.

### Added
- `typeset` (`core/typeset.js`: `typesetParts`, `typesetElement`; `Typeset` in React; `data-component="typeset"` for
  the markup engine): … for `...`, en dashes for ranges (`9--5`, `Mon--Fri`), em dashes for breaks (` -- `), raised
  ordinals (21st) and marks (™ ® ℠, from `(tm)` `(r)` `(sm)`; © from `(c)`), m² ft³ after a number, primes (6′2″),
  a no-break space between a number and its unit, and no one-word last line. Hyphens and code are left alone.
- Price (`components/ui/price.js`, `styles/components/price.css`): the currency sign and cents raised and small, a
  period (`per`), an old price struck through (`was`), any currency and locale; read whole by screen readers.
- `.nums-tabular`, `.nums-fractions`, `.nums-ordinal`, `.small-caps`: the font's OpenType features.

### Changed
- `sup` and `sub` no longer push their line away from the next (base styles).

## 1.0.0-rc.12

### Fixed
- Swiss: a `.bg` panel in its own mode (`data-theme` on it: an inverse-mode one, a dark panel on a light page) keeps
  its surface instead of Swiss's transparent panels, so the page no longer shows through it (light text on the light
  page).

## 1.0.0-rc.11

Inverse mode.

### Added
- Inverse mode: an element in the mode opposite its surroundings' (dark on a light page, light on a dark one),
  switching when they do. `watchInverseMode(el)` (core), `useInverseMode(ref)` (`lib/inverse-mode`, React), and
  `data-component="inverse-mode"` for the markup engine. Nested, it turns back: a preview inside an inverse panel
  shows in the site's mode. Marccent Blocks' and django-marccent's Custom HTML put their editors on one.

## 1.0.0-rc.10

Code editors lay code out, so what was saved on one line opens readable.

### Added
- Code as an editor lays its code out (js-beautify, loaded only by an editor): two-space indents, HTML's blocks one
  per line, its inline elements (a, span…) and text left flowing, so the page shows the same. On opening, when the
  code is crammed on long lines (over 120 characters: generated, or pasted minified), as an edit (saved with the
  rest, and Ctrl+Z takes it back); any time with the Format button under the editor (`[data-format]`, the markup
  engine's too) or Shift+Alt+F. `CodeView.format()`. New dependency: `js-beautify`.

## 1.0.0-rc.9

Code editors that edit like a code field, in the markup engine too; `hover-morph` on buttons.

### Added
- Code as an editor edits like a code field (Elementor's Custom HTML): Enter keeps the indentation and indents inside
  a tag or a brace, a closing one dedents, Tab / Shift+Tab indent the lines (Esc, then Tab, leaves the editor), tags,
  brackets and quotes close as they open, undo and redo, the current line and the matching bracket shown. Two
  spaces. New dependencies: `@codemirror/commands`, `@codemirror/autocomplete` (loaded only by an editor).
- The markup engine's Code is an editor too: a `[data-component="code"]` holding a `<textarea>` (the form field)
  becomes the same editor and writes every edit back into it, so the form posts it; `data-min-lines`. And TabBar
  (`data-component="tab-bar"`), with every panel in the markup: so a server can write CodeTabs (django-marccent's
  Custom HTML).

### Fixed
- `hover-morph` on a plain box (a button, a card: no `.shape-*`) morphs its corners, to `--hover-radius` (default a
  leaf), keeps the button's color fades, and cuts nothing (its focus ring, its shadow) unless `--hover-shape` is set
  (B-002).

## 1.0.0-rc.8

### Added
- CodeTabs (`components/ui/code-tabs.js`): an editor per language (HTML, CSS, JS) under a TabBar, each the theme's
  Code as an editor, and an optional Preview tab. The admin side of a block of hand-written code (Marccent Blocks'
  Custom HTML).

## 1.0.0-rc.7

Clustered map pins, and the Code block as an editor.

### Added
- Code: an editor too (`onChange`, with `label` and `minLines`): CodeMirror editable, line numbers, wrapping, the
  text kept in step with its value; read-only as before without it. `CodeView` takes the same as options and has
  `setCode`. Its colors fall back to fixed ones on a page without the theme's tokens (an admin screen). For admin
  code fields (Marccent Blocks: every block's Additional CSS, the Code block's code).
- Map: many pins (`markers`, or `data-markers` as JSON), clustered (`cluster`, default on): pins close together at
  the zoom shown merge into a numbered disc in the theme's primary, which zooms in on them when clicked. With pins the
  map starts fitting them all (`fit`, default on). Google's MarkerClusterer (`@googlemaps/markerclusterer`), loaded only
  on a map with more than one pin. Pins and clusters recolor with the theme too (`restyleMap`).

## 1.0.0-rc.6

A Map component, so no site keeps its own; and dropdowns that stay solid in glass.

### Added
- Map (`components/widgets/map.js`): a Google map in the theme colors of the box it sits in (land the surface, roads
  the secondary, transit the primary, labels in the body color), recolored when the theme changes; a pin in the
  secondary (`marker`, its click opens a Google Maps link), tile overlays, `onLoad`, `recenter`. Without a key, or
  with one Google refuses, Google's plain embed (`embed`). `loadMapsLibrary(name, key)` for other Maps libraries
  (geocoding). The key: `apiKey`, or the page's `window.marccentMapsKey`.
- The engine draws the same map from `<div data-component="map" class="map" data-lat data-lng data-zoom …>`
  (`data-key`, `data-marker`, `data-title`, `data-link`, `data-embed`) when it comes near the screen. In the markup
  reference (`map`). `styles/components/map.css`: `.map`, its height `--map-height`.
- `TICKETS.md`: the ecosystem's one list of what the theme doesn't do yet for its sites, and the rule that sites
  use the theme's components only.

### Fixed
- NavBar dropdowns are solid in glass (the Glass toggle, glassmorphism, liquid-glass): the bar is a glass panel, so it
  was the only backdrop they could blur and the page showed through them clear; a submenu inside any Menu's dropdown
  the same. Swiss's dropdowns have the surface again (its panels are see-through rules, which a floating panel can't
  be). A NavBar dropdown is as wide as its widest item again (rc.5 capped it at 10rem, cutting long names off).

## 1.0.0-rc.5

The nav bar looks like Bootstrap's navbar, on phones and wide screens, and the glass toggle has its own icon.

### Changed
- NavBar (`styles/components/nav.css`): Bootstrap's look. Links in a dimmed text color that goes full on hover, on
  the current page (`aria-current`) and on an open dropdown, with no hover fill; a triangle caret that doesn't turn;
  a larger brand, flush with the bar's edge; dropdowns a bordered list without a shadow, their items full width with
  a fill on hover and the current page in primary. Below 56rem the links sit flush with the brand and the folded menu
  slides open and shut (its height; where the browser has `interpolate-size`, instantly elsewhere and with reduced
  motion).
- Markup: the toggle is a plain hamburger that stays one while open (`data-icon="bars" data-active-icon="bars"`, was
  `bars-staggered` and `xmark`; its label still says Open or Close menu), and the main menu has no `.divide` (no lines
  between the links). Hosts with their own copy of the NavBar markup: change those two (`markup/reference.json`).

### Fixed
- The glass toggle has a glass icon (a glass of water; a drop on it while glass is on), in place of the hornbill
  brand logo, which said nothing about glass and never showed on hosts that ship only the icons their scripts name
  (WordPress: Marccent Blocks).

## 1.0.0-rc.4

From the sites' feedback: the fixes every host was patching on its own, a longer spacing scale and the classes sites
kept writing as inline styles.

### Fixed
- `.cover-img` exists: Section's background image covers its band outside WordPress too (it was unstyled).
- The Carousel's layout fixes ship with it (`styles/components/carousel.css`: no resize loop in a grid, slides
  clipped, pad classes kept, a row before the script runs); sites no longer copy them.
- Headings on a color fill take its text color, like links already did, so a design style's colored headings don't
  vanish on `.bg-primary`.
- A band with its own mode (`data-theme`, Section `mode`) paints that mode's page color behind it.
- `dd`, `figure` and `blockquote` have no browser margins; the grids' margin reset also covers `.row-wrap`,
  `.stack`, `.center` and `.col-center`.

### Added
- Spacing: `--space-md` (1.5×), `--space-xl` (3×), `--space-2xl` (4×), with `gap-xs`, `gap-md`, `gap-xl`,
  `gap-x-*`, more `gap-y-*`, and `pad-xs` / `-md` / `-xl` / `-2xl` with their `-x-` and `-y-` forms.
- A section rhythm: `--section-space` (fluid, 3× to 6× `--space`), `.pad-y-section`, `-sm`, `-lg`.
- `--pad-x` / `--pad-y`: one element's padding through `.pad-x` / `.pad-y`, not inherited (unlike `--pad`).
- Classes: `.text-muted`, `.eyebrow`, `.bg-page`, `.measure` / `-sm` / `-lg`, `.min-xs` … `.min-xl`,
  `.justify-self-*`, `.place-self-center`, `.ratio-square` / `-4x3` / `-3x2` / `-16x9`, `.fw-semibold`, `.fw-black`,
  `.tracking-tight`, `.tracking-wide`, `.icon-sm`, `.icon-lg`.
- README: the spacing scale, the new classes and a host's checklist.

### Changed
- Section's default padding is `pad-y-section` (was `pad-y-lg`, 2rem): more room for a band on wide screens.

## 1.0.0-rc.3

### Added
- Section dividers: a shape on a Section's top or bottom edge (`dividerTop`, `dividerBottom`; Divider in
  `components/widgets/divider.js`, `core/divider.js`), in the band's own color, with scroll and motion effects; the
  shapes in `markup/dividers.json`.
- The harbor palette.

## 1.0.0-rc.2

Accessibility (WCAG 2.2 AA) and SEO basics: every page of the theme's demo sites passes axe-core in light and dark
mode, at desktop and phone width, and in all 27 design styles.

### Added
- Ink tokens (`--primary-ink`, `--secondary-ink`, `--danger-ink`, `--success-ink`, `--info-ink`): a theme color as
  text, its lightness held where it reads on the page (at most 0.5 OKLCH in light mode, at least 0.75 in dark) for
  any palette. Links, `.text-primary` and the other `.text-*` color classes, outline buttons, code highlighting and
  the professional and elegant headings use them.
- `--primary-lighter-text`, `--primary-darker-text` (and secondary): the text on the shade fills, which set it now.
- Pagination: a `label` prop (default "Pages"); DataTable names its own ("Team pages").

### Changed
- The text on a color fill (`--primary-text`…) is chosen by WCAG contrast, not perceived brightness (Marccent
  Blocks' first paint too).
- Dark mode's status fills (`.bg-danger`, `.bg-success`, `.bg-info`, Alert) are a tint of the page, deep enough for
  its text. The current page or step is a primary tint with the primary's ink.
- A `.bg` panel sets the page's text color (base layer), so it reads inside a colored band. A link on a color fill
  takes the fill's text color, underlined.
- Filled buttons' text mixes 25% of the color into the text color (was 40%).
- Modal, Drawer: the title is an `h2` (sized as before). Footer: its column titles are `h2` (sized as h6); its menus
  are "Footer legal" and "Footer social".
- `.icon-only-sm` / `-md` hide the label from view only: it stays the button's name.
- Button: a disabled link has `role="link"`.
- Board: cells never narrower than 1.5rem; a wider board scrolls.
- Code: the box is in the tab order (it scrolls sideways), and its content is labelled.
- Carousels (usePager: Carousel, the swatch slider, the animation picker): slides out of view are `inert`.
- HexWall, the theme editor's labels: no dimmed text on fills.
- TicketCard, Timeline: their tinted cards set the page's text color.

### Fixed
- Design styles: their light / dark blocks and `[data-theme]` rules now apply when the mode and the style are on the
  same element (`<html>`), so a design style's dark mode works for the whole site.

## 1.0.0-rc.1

The release candidate for 1.0: the public part as 1.0 will keep it, fixes only until 1.0.0.

### Changed
- `package.json` has an `exports` map: the public paths are `marccent-theme` (core), `react`, `components/*`,
  `styles/*`, `dist/*`, `markup/*`, `core/enhance`, `core/components` and twelve `lib/` modules (`cx`, `context`,
  `link`, `store`, `toasts`, `in-view`, `scrolled`, `close-menus`, `design`, `css-color`, `theme-scope`,
  `grid_helper`). Importing any other file of the package fails.
- `@marccent/util` is pinned to its `v2.1.1` tag (it was a branch).

### Added
- The markup reference covers Menu, ToggleButton, Modal (both looks), Drawer, Accordion, Tooltip, Popover and Alert.
  React's generated ids are written `id-1`, `id-2`…: a host picks its own.

## 0.3.2
- Rating's stars at a normal size; Stars clips its own width.

## 0.3.1
- Section, Grid and Card (`components/widgets/section.js`): the layout classes as components, the markup Marccent
  Blocks and django-marccent write on the server.
- The markup reference covers them and NavBar.

## 0.3.0
- No component imports a router: links are plain `<a>`s unless a host hands one in (`LinkContext`).
- `markup/`: the markup reference for Button and Icon. CI, LICENSE.

## 0.2.4
- Dialog openers (`data-opens`) are part of the dialog's setup.

## 0.2.3
- A section with its own mode (`data-theme`) takes its text color; buttons as menu items.

## 0.2.2
- The engine leaves React islands (`data-island`) alone.

## 0.2.1
- React 18 or 19, as peers.

## 0.2.0
- `dist/`: a prebuilt build for any page. The plain-JS markup engine (`core/`). Versioned releases (git tags).
