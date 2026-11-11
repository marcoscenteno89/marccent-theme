# Marccent ecosystem tickets

**Belongs to: marccent-theme.** Every ticket here is fixed in the marccent-theme repo; **Who** names the projects
waiting on it.

marccent-theme is the core of every Marccent site and adapter. This is the one list of what the theme doesn't do yet
for them, and of every place a project still carries its own code instead of the theme's.

## The rules

The rules this list serves (no custom assets, gaps fixed in the theme, adapters only translate, every theme change
cascades) are in [PRODUCT-LINE.md](PRODUCT-LINE.md#4-components-what-belongs-in-the-theme-and-what-in-an-adapter),
their one home. This file is only the list: the Wanted stage for the theme.

## How a ticket works

One line in **Open** per gap: `ID | who | what's wrong | the stopgap (file) | what the theme needs`. When it ships,
move it to **Done** with the release, and remove the stopgap from the project in the same round.

Every project named in **Who** links the ticket from its own `TODO.md`, under Waiting on, one line, never a copy; when
the ticket moves to Done, those lines go. The rules and the TODO.md template: [PRODUCT-LINE.md section
8](PRODUCT-LINE.md#8-work-lists-ticketsmd-and-each-projects-todomd); `npm run todos` checks them.

## Open

### Theme gaps (components the sites need)

| ID | Who | Need | Stopgap today | Theme needs |
|---|---|---|---|---|
| T-002 | marccent-wp | Cookie consent banner | marccent-wp's `inc/tracking.php` (moved from Marccent Local): inline CSS and two inline scripts | A consent/banner component (fixed corner panel, accept/reject, remembers) |
| T-003 | Marccent WP (a Call bar pattern), rc-imp | Call bar fixed to the bottom on phones: a pattern of the theme's own blocks (a group with Call and Get a quote buttons), not a component of its own | Marccent Local's `inc/callbar.php` (inline CSS, printed in PHP) | Utilities only: `.d-md-none` added (Unreleased, 2026-11-10); the rest exists (`.position-fixed .bottom-0 .end-0 .w-100 .z-sticky`, a padding class; no site sets `viewport-fit=cover`, so no safe-area padding). Left: the Call bar pattern itself, and room under the page on phones |
| T-009 | Fernway, marccent-html | Badges, avatars | Fernway `site.css` `.badge`, `.avatar` | Badge and Avatar classes |
| T-010 | Fernway | Section heading block (eyebrow, title, text, centered) | `site.css` `.section-head` | A SectionHead component |
| T-011 | Fernway | Announcement row in the header | `site.css` `.announce` | A row above the Header pattern for an announcement |
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
| T-029 | every adapter (Marccent Blocks, django-marccent, marccent/next, marccent-html) | One standard set of settings per component, the same names, choices and defaults wherever it's used | each adapter defines its own (WP's `block.json` and `src/shared/options.js`, Django's plugin forms) and they drift (`lat`/`lng`, options copied by hand) | A settings file in the theme beside `markup/reference.json`: per component, each setting's full-word name, type, choices (value + label), default, and rules (needs admin data, items from rows, one per page); adapters read it instead of copying it, and a check fails when one differs; written 2026-11-09 (54 components, 204 settings, with Editor.js's sanitize, validate and version), the tunes in markup/tunes.json; Marccent Blocks reads it since 1.0.0-rc.22 (its block.json from it, checked); the components' props renamed to the settings' full words (unreleased, 2026-11-10); left: Map's lat and lng in the block |
| T-030 | every output (the ticket done in 1.0.0-rc.18; more after 1.0) | Variants: one class that gives an item a distinct shape or frame of its own (a ticket first; more later: a receipt, a polaroid…), on Card and other items alike, on top of the theme without touching it. Decided 2026-11-09: the ticket is a variant, not a component; TicketCard (and the Ticket card block) retire into Card + the ticket variant | Modal's `variant="ticket"` and `.shape-ticket` (utilities.css), tied to Modal; Ticket card a component and a block | The variants' list in the theme: each one class, drawn only with the theme's tokens (the palette, mode and design style still apply), scoped to the item it's on, usable on any box (Card, Section, Modal, Alert…), one at a time; a `variant` setting on each component that takes them (as Modal's); in WordPress block styles (`register_block_style`), in html the class |
| T-031 | every output (after 1.0) | Looks to consider after the ticket (ideas, not decided) | none | Receipt (zigzag bottom, monospace), polaroid (white frame, caption under), sticky note (tilted, folded corner), stamp or seal (round, dashed ring), browser window and terminal (title bar with dots), phone frame, folder tab, ribbon corner, notebook paper (ruled lines), blueprint (grid lines), envelope; each checked against the design styles so they don't fight |
| T-032 | marccent-wp, marccent/next | The header as a pattern (PATTERNS.md). Done 2026-11-10: NavBar removed, the Header pattern (a Section, a Grid, Menu `fold`, a Button, the theme controls), the Navbar block retired and marccent-wp's header a Header block pattern; NavBar's floating pill variant is the Floating header pattern. Left: on phones the folded menu opens in the toggle's popover panel, where NavBar's slid open full width under the bar; marccent/next (frozen) still uses NavBar, so it moves to the pattern when it takes this release | the folded menu in a popover panel (`menu.css`, `.menu-fold`) | Menu `fold` opening as a full-width panel under its header (by the header's width), the toggle's panel still the popover elsewhere |
| T-035 | html (after 1.0) | An admin for the html output (marccent.com): today its content is in code | none | Editor.js (editorjs.io) as html's editor: its blocks saved as JSON, each block one of the theme's components with its settings (markup/settings.json), rendered by the theme's components; html then an output with an admin (markup/outputs.json), its tools for each kind of admin data. Its ideas already in: sanitize, validate and version per setting, tunes (PRODUCT-LINE.md 5) |
| T-036 | every output (after 1.0) | Animated canvas backgrounds for parallax pages and other sections (Marcos, 2026-11-10): a night sky (stars, falling stars, the moon, clouds drifting) and a day sky (the sun, clouds, birds flying), more scenes later | none | A component (canvas, behind its section's content), each scene a setting, drawn with the theme's tokens so it reads in light and dark mode, still under reduced motion and paused off screen; decide first how it relates to Scenery's static sky layers (stars, moon, sun, clouds, birds) |
| T-037 | marccent-patterns (after 1.0) | Patterns in a repository of their own, written once as HTML (the theme's markup, no CSS or JS of their own) and converted into each output: WordPress block patterns, Django templates (Marcos, 2026-11-10) | the markup in marccent-patterns (moved there 2026-11-10), each output's patterns written by hand (marccent-wp's `tools/patterns.js`) | A converter from a pattern's HTML to each output's blocks and tags (each `data-component` and container to its block, by `markup/reference.json` and `markup/settings.json`); the patterns repo pinned to a theme release like an adapter |
| T-038 | every output (after 1.0) | Show or hide by the page's state, for a logo per mode or a light logo over the hero and a dark one once the header is solid (Marcos, 2026-11-10) | none (`.solid-on-scroll` is the only state class) | State classes on the engine's page states (`<html data-theme>`, `<html data-scrolled>`): `.dark-only` / `.light-only`, `.top-only` / `.scrolled-only`, one family with `.solid-on-scroll` |
| T-039 | every output (after 1.0) | A "How did we do?" rating whose stars lead somewhere (Marcos, 2026-11-10): a link per star, the admin choosing where each goes | none | Rating (the field people pick with) taking a link per star, not Stars (a score to read). Not review gating: Google's Business Profile policy forbids soliciting positive reviews selectively, and the FTC's 2024 consumer reviews rule targets suppressing negative ones, so every star leads to the same review places and a "had a problem? tell us" link sits beside them for everyone |

### Theme bugs (found because a site patched around them)

| ID | Who | Bug | Stopgap today | Fix |
|---|---|---|---|---|
| B-008 | marccent-theme | `sm` / `md` / `lg` mean different widths: `.span-md-*` from 48rem and `.span-lg-*` from 64rem (layout.css); `.icon-only-sm` below 40rem and `.icon-only-md` below 56rem (button.css, which says it matches layout.css's sm 40rem / md 56rem, the `.layout-*` steps); `.sticky-md-top`, `.d-md-none`, `.d-md-block` from 768px of the screen (utilities.css). Revisit every breakpoint in the CSS (layout, button, menu, form, colors, utilities) so each name is one width (found 2026-11-10, adding `.d-md-none`) | none | One scale (sm, md, lg as fixed widths, written in `styles/tokens/defaults.css`'s note on breakpoints and the README), every `-sm-` / `-md-` / `-lg-` class and the unnamed steps checked against it, and a `npm run conformance` check that flags a breakpoint off the scale |
| B-007 | marccent-wp, marccent-patterns | The Floating header's pill sits over the first section's content: a Hero under it has only its own top padding, so the heading runs under the brand and the links (found 2026-11-10, checking marccent-wp's Floating header on wp.localhost, wide and on a phone) | none | The pattern says how the first section clears the pill (a top padding token or class sized to the bar, in marccent-patterns' `header-floating.html` and PATTERNS.md), so a hero starts below it |
| B-004 | marccent-theme | Menu styles ToggleButton's panel from outside (PRODUCT-LINE.md section 4, rule 10): `.menu-fold > .toggle-panel` in `styles/components/menu.css` (`display: contents` from 56rem, its `min-width` below), found by the new check 2026-11-10 | excused in `scripts/conformance.mjs` (`STYLES_EXCEPTIONS`) | The fold's panel as ToggleButton's own setting (a panel that becomes its contents where there's room), or Menu's own fold markup instead of a ToggleButton; then the exception goes |

### Whole projects off the theme

| ID | Who | State | Plan |
|---|---|---|---|
| P-001 | parallax-html | A copy of the Anthem site on its own Bootstrap CSS and JS (`src/static/css/*`, `src/static/js/app.js`, ~4,000 lines); the theme only adds a theme button | Rebuild its pages on theme components, page by page, ticketing what's missing |
| P-002 | marccent-html, marccent/next | Two copies of the same site that drift (each edit made twice) | One source for both |

## Done

| ID | Who | What | Release |
|---|---|---|---|
| T-034 | every output (wp, html) | Lists of content typed into a component's settings are children (PRODUCT-LINE.md 6.1): Timeline item, Dock item, Radial menu item, Step bar step, Orbit item and Tab, each marked with its parent in `markup/settings.json`; Timeline, Dock, RadialMenu, StepBar, Orbit and TabBar take them instead of `events`, `items`, `steps` and `tabs` (Orbit's bare positions: `positions`); CodeTabs and OrbitClock use them. Their blocks and a Loop of them in WordPress, and marccent.com, on that release (the 1.0 checklist) | unreleased (2026-11-10) |
| T-033 | every output | Components that only arranged others, each decided (PATTERNS.md's audit): AppShell → the Sidebar component and the App frame pattern; HexWall removed (HexGrid with HexFlip children); TicketCard → Card + the ticket variant; ImageCard and Collage removed (the Image card and Collage patterns, on `.overlay-*`, `.dense`, `.rows-min`, `.row-span-N`); StatCard a component without its own box, inside a Card; CodeTabs and Timeline stay (Timeline's events become children: T-034). marccent.com and Marccent Blocks move on that release (the 1.0 checklist) | unreleased (2026-11-10) |
| T-004 | Marccent Content | Opening hours table, open / closed label: Marccent Content's Opening hours field type shows the week in the theme's `.table` (today in bold) and "Open now · until 5 PM" as text; Marccent Local's `.mcl-hours` / `.mcl-open` CSS retired | no theme change (2026-11-09) |
| T-005 | rc-imp | Breadcrumbs: no component needed; the markup uses existing classes (`row-wrap gap-xs list-plain fs-sm`, a `/` hidden from screen readers, the current page `fw-bold`); Marccent Local's `.breadcrumbs` CSS retired with it | no theme change (2026-11-09) |
| T-006 | Marccent Local | Link chips (`.link-list`): unused on every site; dropped with Marccent Local | no theme change (2026-11-09) |
| T-007 | rc-imp | Key facts: `.pairs` (layout.css) already does it, a `<dl class="grid gap-sm pairs">` with each row a `.sub-x` (`<dt class="fw-bold">`, `<dd class="pad-x-sm">`); `.facts` CSS retired | no theme change (2026-11-09) |
| T-008 | Marccent Blocks | Tables in WordPress content: Marccent Blocks puts the theme's `.table` on a core Table block's `<table>` and `.overflow-auto` on its figure (`inc/markup.php`); `.wp-block-table` CSS retired | no theme change (2026-11-09) |
| T-001 | marccent-html, marccent/next, Marccent Local, rc-imp | Map: three own maps (two copies of the sites' `components/apps/map.js`, Marccent Local's `assets/map.js`) replaced by the theme's Map (`components/widgets/map.js`, and `data-component="map"` for the engine) | 1.0.0-rc.6 |
| T-023 | Fernway | Its own `.eyebrow` redefined the theme's | removed, uses the theme's (1.0.0-rc.6) |
| B-005 | marccent-theme | Menu writes `--cols` only for its fixed layout, so `layout="cols-1"` stacks in one column; the `--cols: 1` stopgaps gone (Sidebar's example, the Footer and App frame patterns); Marccent Blocks' Menu markup the same | unreleased (2026-11-10) |
| B-006 | marccent-wp | ToggleButton with a panel, in the engine: its button follows the popover (`toggle-panel` in `core/components.js`), so `aria-expanded` and the icon (bars → xmark) say whether the panel is open, whatever closed it; Toggle button's state in one helper (`setToggle`) | unreleased (2026-11-10) |
| B-003 | marccent-theme | Loading set its own width (PRODUCT-LINE.md section 4, rule 9): `.loader-bar`'s `width: 100%` and the inline `width: 100%` on every loader dropped; a loader is a block that fills its parent (`.self-stretch`, `.w-100` where a parent shrinks it) | unreleased (2026-11-10) |
| B-002 | (reported) | `hover-morph` on a plain box (a button) morphs its corners to `--hover-radius` (default a leaf), keeps the button's color fades, and cuts nothing unless `--hover-shape` is set | 1.0.0-rc.9 |
| B-001 | Fernway | Code block: the `<pre>` has no margin (base styles), its padding and font from classes, the copy button in a padded corner box; Fernway's `site.css` stopgap removed | 1.0.0-rc.15 |
| A-001 | every project | Audit of situation-specific classes: components made of classes that combine (about 30 general classes added, 6 component stylesheets removed, nav.css's menu look a `.menu-quiet` variant), padding and placement classes that win over a component's own | 1.0.0-rc.15 |
