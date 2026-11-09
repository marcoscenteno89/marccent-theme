# Changelog

Each release, newest first. From 1.0 the versions are semantic: what a patch, a minor and a major may change is in the
README (Versions → What a version promises).

## 1.0.0-rc.16

The package is `marccent` (was `marccent-theme`), like `bootstrap`: the product's own name, before anything live
depends on the old one. Nothing else changes: the same files, classes and markup.

### Changed
- `package.json`'s name: `marccent`. Imports become `marccent/…` (`import { Button } from
  'marccent/components/ui/button'`); a host installs it the same way (`npm install
  github:marcoscenteno89/marccent-theme#v1.0.0-rc.16`) and its dependency key is `marccent`. The repo keeps its
  name until it moves to the `marccent` organization.
- `dist/`'s banner names the package.

### Added
- Work lists: PRODUCT-LINE.md section 8 (the rules and the TODO.md template) and `npm run todos` (in `npm test`).
- How Claude works: PRODUCT-LINE.md section 9 (grey areas asked in one shape and written down in its Decisions;
  no claim without output; one goal per change; nothing removed without a ticket), section 2 rules 7 and 8 (which
  rule wins; every rule has a check or says why not), and rule 7 in CLAUDE.md.
- Sizing: PRODUCT-LINE.md section 4, rule 10 (a component sets no width and no outer margin; its container decides
  both), checked by `npm run conformance` on the roots in `styles/components`. Loading breaks it today (B-003).

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
