# Marccent ecosystem tickets

marccent-theme is the core of every Marccent site and adapter. This is the one list of what the theme doesn't do yet
for them, and of every place a project still carries its own code instead of the theme's.

## The rules

The rules this list serves (no custom assets, gaps fixed in the theme, adapters only translate, every theme change
cascades) are in [PRODUCT-LINE.md](PRODUCT-LINE.md#4-components-what-belongs-in-the-theme-and-what-in-an-adapter),
their one home. This file is only the list: the Wanted stage for the theme.

## How a ticket works

One line in **Open** per gap: `ID | who | what's wrong | the stopgap (file) | what the theme needs`. When it ships,
move it to **Done** with the release, and remove the stopgap from the project in the same round.

## Open

### Theme gaps (components the sites need)

| ID | Who | Need | Stopgap today | Theme needs |
|---|---|---|---|---|
| T-002 | the WordPress sites (Marccent Local, removed 2026-11-09, had one) | Cookie consent banner | `inc/consent.php`: inline CSS and two inline scripts | A consent/banner component (fixed corner panel, accept/reject, remembers) |
| T-003 | Marccent WP (a Call bar pattern), rc-imp | Call bar fixed to the bottom on phones: a pattern of the theme's own blocks (a group with Call and Get a quote buttons), not a component of its own | Marccent Local's `inc/callbar.php` (inline CSS, printed in PHP) | Utilities only (`.position-fixed`, `.bottom-0` exist): phone-only display (`.d-md-none`, hidden from 768px), full width (`.start-0` / `.inset-x-0`), a z-index above the page, bottom padding for the safe area (`env(safe-area-inset-bottom)`), and room under the page while it shows |
| T-009 | Fernway, marccent-html | Badges, avatars | Fernway `site.css` `.badge`, `.avatar` | Badge and Avatar classes |
| T-010 | Fernway | Section heading block (eyebrow, title, text, centered) | `site.css` `.section-head` | A SectionHead component |
| T-011 | Fernway | Announcement row in the header | `site.css` `.announce` | NavBar `top` slot styles for an announcement |
| T-012 | Fernway | Mega menu (two columns of icon, name, line) | `site.css` `.menu-panel.mega`, `.mega-link` | Menu: a mega panel option |
| T-013 | Fernway | Endless logo marquee | `site.css` `.marquee` | A Marquee component (pauses on hover and reduced motion) |
| T-014 | Fernway | Back-to-top button | `site.css` `.to-top` | A back-to-top button |
| T-015 | Fernway | Hero, bento, pricing, mini bar chart, CTA layouts | `site.css` `.hero*`, `.bars`, `.bento-canvas`, `.pricing .featured`, `.cta` | Section/landing patterns (hero with canvas, pricing table, bar sparkline) |
| T-016 | Fernway | Pricing monthly/yearly switch, contact form thank-you | `site.js` | A price toggle; Form's success state without custom JS |
| T-017 | marccent-html, marccent/next | Stock chart layout around the theme's Graph | `styles/site.css` `.graph-container`, `.chart-date`, `.chart-readout` | Graph (components/visuals/canvas.js) ships its own layout CSS |
| T-018 | marccent-html, marccent/next | Calendar, count-up numbers, gauge / radar / speedometer, atom, clocks, flip clock, card fan | `components/widgets/calendar.js`, `count-up.js`, `data.js`, `fun.js` | Move them into the theme as components |
| T-019 | rc-imp | Its own hovers: buttons lift onto a ledge, icon nudge, card top bar and photo zoom | `content/site.css` | Matching `hover-*` classes, or rc-imp switches to existing ones |
| T-020 | rc-imp | Buttons aligned to the start of their cell | `content/site.css` `.btn:has(> .btn-text)` | A button alignment option (class and block setting) |
| T-021 | rc-imp | Links on colored bands take the band's text color | `content/site.css` | Check whether rc.4's fill colors already cover it; then remove |
| T-022 | Marccent Blocks, marccent-wp, Marccent Content | Admin and editor screens (theme options page, editor panels, content admin) are hand-built | marccent-wp `inc/theme-options.php` inline CSS + `assets/theme-options.js`; Marccent Content `assets/admin.js`, `editor.js` | An admin/editor template: each component's front-end version plus its editing version (settings panel) |
| T-024 | Marccent Blocks, django-marccent | Typography set on the server, not after the page loads (no shift as it changes) | none: `data-component="typeset"` sets it in the browser | `typeset` in PHP and Python with the same rules, checked against cases from `core/typeset.js` (as the markup reference does); WordPress: on rendered blocks' text; Django: a `typeset` template filter |
| T-025 | Marccent Blocks, django-marccent | Prices | none | Price in `markup/reference.json` (cases: currency, locale, per, was); a Price block and a `marccent_price` tag |
| T-026 | Marccent Blocks, django-marccent | Dates and times (an event's date, a range like Nov 6–8, posted 3 days ago) | none | Date in `markup/reference.json` (`<time datetime>`, locale, ranges, relative); a Date block and a tag |
| T-027 | Marccent Blocks, django-marccent | Contact line: a phone, email or address as a link | none | Contact in `markup/reference.json` (`tel:` and `mailto:` from one field, `<address>`); a Contact block and a tag |
| T-028 | Marccent Blocks | Mixed styles inside one line of text (a raised currency, a muted unit, a badge or chip) | none | Text formats in the block editor (Raised, Muted, Badge) putting the theme's classes on part of a line |
| T-029 | every adapter (Marccent Blocks, django-marccent, marccent/next, marccent-html) | One standard set of settings per component, the same names, choices and defaults wherever it's used | each adapter defines its own (WP's `block.json` and `src/shared/options.js`, Django's plugin forms) and they drift (`lat`/`lng`, options copied by hand) | A settings file in the theme beside `markup/reference.json`: per component, each setting's full-word name, type, choices (value + label), default, and rules (needs admin data, items from rows, one per page); adapters read it instead of copying it, and a check fails when one differs |
| T-030 | every output (the ticket done in 1.0.0-rc.18; more after 1.0) | Variants: one class that gives an item a distinct shape or frame of its own (a ticket first; more later: a receipt, a polaroid…), on Card and other items alike, on top of the theme without touching it. Decided 2026-11-09: the ticket is a variant, not a component; TicketCard (and the Ticket card block) retire into Card + the ticket variant | Modal's `variant="ticket"` and `.shape-ticket` (utilities.css), tied to Modal; Ticket card a component and a block | The variants' list in the theme: each one class, drawn only with the theme's tokens (the palette, mode and design style still apply), scoped to the item it's on, usable on any box (Card, Section, Modal, Alert…), one at a time; a `variant` setting on each component that takes them (as Modal's); in WordPress block styles (`register_block_style`), in html the class |
| T-031 | every output (after 1.0) | Looks to consider after the ticket (ideas, not decided) | none | Receipt (zigzag bottom, monospace), polaroid (white frame, caption under), sticky note (tilted, folded corner), stamp or seal (round, dashed ring), browser window and terminal (title bar with dots), phone frame, folder tab, ribbon corner, notebook paper (ruled lines), blueprint (grid lines), envelope; each checked against the design styles so they don't fight |
| T-032 | Marccent Blocks, every output | The header and the footer as patterns (PATTERNS.md). Nav on its own: a menu that folds behind a menu button on narrow screens (Bootstrap's `.navbar-toggler` + `.collapse.navbar-collapse` + `.navbar-nav`), so a header is a pattern of blocks (logo, nav, call button, theme controls) instead of one Navbar block | the Navbar block (the whole header in one block); the fold only works inside NavBar (`nav.css`: `.nav.open .nav-collapse`, a container query on `.nav > .wrap`) | A Nav markup case (`data-component="nav"`: the toggle, `.nav-collapse`, a Menu) that folds by the header's width, not its own cell's, and opens as a full-width panel under the header; NavBar built from it. Then in WordPress: the Menu block's "fold behind a menu button" option, a Header pattern, the Navbar block retired; the Footer component taken apart (1.0.0-rc.17: PATTERNS.md has its markup), a Footer block pattern with the Header |
| T-033 | every output | Components that only arrange other components and classes, so maybe patterns (the audit of 2026-11-09, PATTERNS.md): AppShell, StatCard to decide; HexWall decided removed (HexGrid with its HexFlip children is the wall); Collage decided a pattern (Grid with dense packing and a row height, Cards with size classes); decided 2026-11-09: TicketCard → Card + the ticket variant (done, rc.18), CodeTabs and Timeline stay components (4.5.1, 4.5.2), Timeline's events to become children (a Timeline item component; its events list goes), ImageCard removed (a Card with an image) | they're components (and WordPress blocks: Image card, Stat card, Ticket card, Timeline, Collage, Hex wall) | Decide each: a pattern in PATTERNS.md (its markup, its parts), the component and its block retired; or kept, with what it has of its own written down |
| T-034 | every output (wp, html) | Lists of content typed into a component's settings (PRODUCT-LINE.md 6.1) | Timeline's events, Dock's and Radial menu's items, Step bar's steps, Orbit's items, Tab bar's tabs are props (and block settings); their blocks store them as arrays | Each item a child component marked with its parent (`planned` in markup/settings.json): Timeline item, Dock item, Radial menu item, Step bar step, Orbit item, Tab; each parent takes them (and a Loop of them in WordPress); their markup cases; marccent.com and the kitchen sink use them |

### Theme bugs (found because a site patched around them)

| ID | Who | Bug | Stopgap today | Fix |
|---|---|---|---|---|

### Whole projects off the theme

| ID | Who | State | Plan |
|---|---|---|---|
| P-001 | parallax-html | A copy of the Anthem site on its own Bootstrap CSS and JS (`src/static/css/*`, `src/static/js/app.js`, ~4,000 lines); the theme only adds a theme button | Rebuild its pages on theme components, page by page, ticketing what's missing |
| P-002 | marccent-html, marccent/next | Two copies of the same site that drift (each edit made twice) | One source for both |

## Done

| ID | Who | What | Release |
|---|---|---|---|
| T-004 | Marccent Content | Opening hours table, open / closed label: Marccent Content's Opening hours field type shows the week in the theme's `.table` (today in bold) and "Open now · until 5 PM" as text; Marccent Local's `.mcl-hours` / `.mcl-open` CSS retired | no theme change (2026-11-09) |
| T-005 | rc-imp | Breadcrumbs: no component needed; the markup uses existing classes (`row-wrap gap-xs list-plain fs-sm`, a `/` hidden from screen readers, the current page `fw-bold`); Marccent Local's `.breadcrumbs` CSS retired with it | no theme change (2026-11-09) |
| T-006 | Marccent Local | Link chips (`.link-list`): unused on every site; dropped with Marccent Local | no theme change (2026-11-09) |
| T-007 | rc-imp | Key facts: `.pairs` (layout.css) already does it, a `<dl class="grid gap-sm pairs">` with each row a `.sub-x` (`<dt class="fw-bold">`, `<dd class="pad-x-sm">`); `.facts` CSS retired | no theme change (2026-11-09) |
| T-008 | Marccent Blocks | Tables in WordPress content: Marccent Blocks puts the theme's `.table` on a core Table block's `<table>` and `.overflow-auto` on its figure (`inc/markup.php`); `.wp-block-table` CSS retired | no theme change (2026-11-09) |
| T-001 | marccent-html, marccent/next, Marccent Local, rc-imp | Map: three own maps (two copies of the sites' `components/apps/map.js`, Marccent Local's `assets/map.js`) replaced by the theme's Map (`components/widgets/map.js`, and `data-component="map"` for the engine) | 1.0.0-rc.6 |
| T-023 | Fernway | Its own `.eyebrow` redefined the theme's | removed, uses the theme's (1.0.0-rc.6) |
| B-002 | (reported) | `hover-morph` on a plain box (a button) morphs its corners to `--hover-radius` (default a leaf), keeps the button's color fades, and cuts nothing unless `--hover-shape` is set | 1.0.0-rc.9 |
| B-001 | Fernway | Code block: the `<pre>` has no margin (base styles), its padding and font from classes, the copy button in a padded corner box; Fernway's `site.css` stopgap removed | 1.0.0-rc.15 |
| A-001 | every project | Audit of situation-specific classes: components made of classes that combine (about 30 general classes added, 6 component stylesheets removed, nav.css's menu look a `.menu-quiet` variant), padding and placement classes that win over a component's own | 1.0.0-rc.15 |
