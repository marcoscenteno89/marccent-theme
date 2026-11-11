# Marccent ecosystem tickets: moved to GitHub Issues

The tickets moved to GitHub Issues on 2026-11-11 (PRODUCT-LINE.md section 8): the work is the
[issues](https://github.com/marcoscenteno89/marccent-theme/issues) on the
[Marccent board](https://github.com/users/marcoscenteno89/projects/1). A theme ticket is an issue labeled `ticket`, its
old ID kept in its title. This file only keeps the old IDs, which the CHANGELOG and the docs still name, and nothing
new is added to it.

## Open tickets and their issues

| ID | Issue | What |
|---|---|---|
| T-002 | [#6](https://github.com/marcoscenteno89/marccent-theme/issues/6) | Cookie consent banner |
| T-003 | [#7](https://github.com/marcoscenteno89/marccent-theme/issues/7) | Call bar fixed to the bottom on phones: a pattern of the theme's own blocks (a group with … |
| T-009 | [#8](https://github.com/marcoscenteno89/marccent-theme/issues/8) | Badges, avatars |
| T-010 | [#9](https://github.com/marcoscenteno89/marccent-theme/issues/9) | Section heading block (eyebrow, title, text, centered) |
| T-011 | [#10](https://github.com/marcoscenteno89/marccent-theme/issues/10) | Announcement row in the header |
| T-012 | [#11](https://github.com/marcoscenteno89/marccent-theme/issues/11) | Mega menu (two columns of icon, name, line) |
| T-013 | [#12](https://github.com/marcoscenteno89/marccent-theme/issues/12) | Endless logo marquee |
| T-014 | [#13](https://github.com/marcoscenteno89/marccent-theme/issues/13) | Back-to-top button |
| T-015 | [#14](https://github.com/marcoscenteno89/marccent-theme/issues/14) | Hero, bento, pricing, mini bar chart, CTA layouts |
| T-016 | [#15](https://github.com/marcoscenteno89/marccent-theme/issues/15) | Pricing monthly/yearly switch, contact form thank-you |
| T-017 | [#16](https://github.com/marcoscenteno89/marccent-theme/issues/16) | Stock chart layout around the theme's Graph |
| T-018 | [#17](https://github.com/marcoscenteno89/marccent-theme/issues/17) | Calendar, count-up numbers, gauge / radar / speedometer, atom, clocks, flip clock, card fa… |
| T-019 | [#18](https://github.com/marcoscenteno89/marccent-theme/issues/18) | Its own hovers: buttons lift onto a ledge, icon nudge, card top bar and photo zoom |
| T-020 | [#19](https://github.com/marcoscenteno89/marccent-theme/issues/19) | Buttons aligned to the start of their cell |
| T-021 | [#20](https://github.com/marcoscenteno89/marccent-theme/issues/20) | Links on colored bands take the band's text color |
| T-022 | [#21](https://github.com/marcoscenteno89/marccent-theme/issues/21) | Admin and editor screens (theme options page, editor panels, content admin) are hand-built |
| T-024 | [#22](https://github.com/marcoscenteno89/marccent-theme/issues/22) | Typography set on the server, not after the page loads (no shift as it changes) |
| T-025 | [#23](https://github.com/marcoscenteno89/marccent-theme/issues/23) | Prices |
| T-026 | [#24](https://github.com/marcoscenteno89/marccent-theme/issues/24) | Dates and times (an event's date, a range like Nov 6–8, posted 3 days ago) |
| T-027 | [#25](https://github.com/marcoscenteno89/marccent-theme/issues/25) | Contact line: a phone, email or address as a link |
| T-028 | [#26](https://github.com/marcoscenteno89/marccent-theme/issues/26) | Mixed styles inside one line of text (a raised currency, a muted unit, a badge or chip) |
| T-029 | [#27](https://github.com/marcoscenteno89/marccent-theme/issues/27) | One standard set of settings per component, the same names, choices and defaults wherever … |
| T-030 | [#28](https://github.com/marcoscenteno89/marccent-theme/issues/28) | Variants: one class that gives an item a distinct shape or frame of its own (a ticket firs… |
| T-031 | [#29](https://github.com/marcoscenteno89/marccent-theme/issues/29) | Looks to consider after the ticket (ideas, not decided) |
| T-035 | [#30](https://github.com/marcoscenteno89/marccent-theme/issues/30) | An admin for the html output (marccent.com): today its content is in code |
| T-036 | [#31](https://github.com/marcoscenteno89/marccent-theme/issues/31) | Animated canvas backgrounds for parallax pages and other sections (Marcos, 2026-11-10): a … |
| T-037 | [#32](https://github.com/marcoscenteno89/marccent-theme/issues/32) | Patterns in a repository of their own, written once as HTML (the theme's markup, no CSS or… |
| T-038 | [#33](https://github.com/marcoscenteno89/marccent-theme/issues/33) | Show or hide by the page's state, for a logo per mode or a light logo over the hero and a … |
| T-039 | [#34](https://github.com/marcoscenteno89/marccent-theme/issues/34) | A "How did we do?" rating whose stars lead somewhere (Marcos, 2026-11-10): a link per star… |
| B-007 | [#35](https://github.com/marcoscenteno89/marccent-theme/issues/35) | The Floating header's pill sits over the first section's content: a Hero under it has only… |
| P-001 | [#36](https://github.com/marcoscenteno89/marccent-theme/issues/36) | A copy of the Anthem site on its own Bootstrap CSS and JS (`src/static/css/*`, `src/static… |
| P-002 | [#37](https://github.com/marcoscenteno89/marccent-theme/issues/37) | Two copies of the same site that drift (each edit made twice) |

## Done

| ID | Who | What | Release |
|---|---|---|---|
| B-008 ([#105](https://github.com/marcoscenteno89/marccent-theme/issues/105)) | marccent-theme | One breakpoint scale, Tailwind's: sm 40rem, md 48rem, lg 64rem (`styles/tokens/defaults.css`, README Breakpoints). `.icon-only-md` below 48rem (was 56rem); a header folds at lg: Menu `fold`, Toggle button's fold, `.layout-ends` and Sidebar's top bar from 64rem (was 56rem); `.sticky-md-top`, `.d-md-*` from 48rem (768px, the same width); `npm run conformance` fails on a width off the scale (the `.span-N` grid steps aside) | unreleased (2026-11-10) |
| T-032 ([#106](https://github.com/marcoscenteno89/marccent-theme/issues/106)) | marccent-wp, marccent/next | The header is the Header pattern (NavBar removed, its pill the Floating header pattern); Menu `fold`'s panel opens full width under its header on phones (under the band its button sits in, by its width), the popover elsewhere; an open one closes when the header grows past 56rem. marccent/next (frozen) moves from NavBar when it takes the release | unreleased (2026-11-10) |
| B-004 ([#107](https://github.com/marcoscenteno89/marccent-theme/issues/107)) | marccent-theme | Menu no longer styles ToggleButton's panel: the fold is ToggleButton's own `fold` setting (`.toggle-fold`, button.css), Menu `fold` uses it and stacks itself (`.menu-fold` on its nav); conformance's styles exception gone | unreleased (2026-11-10) |
| T-034 ([#108](https://github.com/marcoscenteno89/marccent-theme/issues/108)) | every output (wp, html) | Lists of content typed into a component's settings are children (PRODUCT-LINE.md 6.1): Timeline item, Dock item, Radial menu item, Step bar step, Orbit item and Tab, each marked with its parent in `markup/settings.json`; Timeline, Dock, RadialMenu, StepBar, Orbit and TabBar take them instead of `events`, `items`, `steps` and `tabs` (Orbit's bare positions: `positions`); CodeTabs and OrbitClock use them. Their blocks and a Loop of them in WordPress, and marccent.com, on that release (the 1.0 checklist) | unreleased (2026-11-10) |
| T-033 ([#109](https://github.com/marcoscenteno89/marccent-theme/issues/109)) | every output | Components that only arranged others, each decided (PATTERNS.md's audit): AppShell → the Sidebar component and the App frame pattern; HexWall removed (HexGrid with HexFlip children); TicketCard → Card + the ticket variant; ImageCard and Collage removed (the Image card and Collage patterns, on `.overlay-*`, `.dense`, `.rows-min`, `.row-span-N`); StatCard a component without its own box, inside a Card; CodeTabs and Timeline stay (Timeline's events become children: T-034). marccent.com and Marccent Blocks move on that release (the 1.0 checklist) | unreleased (2026-11-10) |
| T-004 ([#110](https://github.com/marcoscenteno89/marccent-theme/issues/110)) | Marccent Content | Opening hours table, open / closed label: Marccent Content's Opening hours field type shows the week in the theme's `.table` (today in bold) and "Open now · until 5 PM" as text; Marccent Local's `.mcl-hours` / `.mcl-open` CSS retired | no theme change (2026-11-09) |
| T-005 ([#111](https://github.com/marcoscenteno89/marccent-theme/issues/111)) | rc-imp | Breadcrumbs: no component needed; the markup uses existing classes (`row-wrap gap-xs list-plain fs-sm`, a `/` hidden from screen readers, the current page `fw-bold`); Marccent Local's `.breadcrumbs` CSS retired with it | no theme change (2026-11-09) |
| T-006 ([#112](https://github.com/marcoscenteno89/marccent-theme/issues/112)) | Marccent Local | Link chips (`.link-list`): unused on every site; dropped with Marccent Local | no theme change (2026-11-09) |
| T-007 ([#113](https://github.com/marcoscenteno89/marccent-theme/issues/113)) | rc-imp | Key facts: `.pairs` (layout.css) already does it, a `<dl class="grid gap-sm pairs">` with each row a `.sub-x` (`<dt class="fw-bold">`, `<dd class="pad-x-sm">`); `.facts` CSS retired | no theme change (2026-11-09) |
| T-008 ([#114](https://github.com/marcoscenteno89/marccent-theme/issues/114)) | Marccent Blocks | Tables in WordPress content: Marccent Blocks puts the theme's `.table` on a core Table block's `<table>` and `.overflow-auto` on its figure (`inc/markup.php`); `.wp-block-table` CSS retired | no theme change (2026-11-09) |
| T-001 ([#115](https://github.com/marcoscenteno89/marccent-theme/issues/115)) | marccent-html, marccent/next, Marccent Local, rc-imp | Map: three own maps (two copies of the sites' `components/apps/map.js`, Marccent Local's `assets/map.js`) replaced by the theme's Map (`components/widgets/map.js`, and `data-component="map"` for the engine) | 1.0.0-rc.6 |
| T-023 ([#116](https://github.com/marcoscenteno89/marccent-theme/issues/116)) | Fernway | Its own `.eyebrow` redefined the theme's | removed, uses the theme's (1.0.0-rc.6) |
| B-005 ([#117](https://github.com/marcoscenteno89/marccent-theme/issues/117)) | marccent-theme | Menu writes `--cols` only for its fixed layout, so `layout="cols-1"` stacks in one column; the `--cols: 1` stopgaps gone (Sidebar's example, the Footer and App frame patterns); Marccent Blocks' Menu markup the same | unreleased (2026-11-10) |
| B-006 ([#118](https://github.com/marcoscenteno89/marccent-theme/issues/118)) | marccent-wp | ToggleButton with a panel, in the engine: its button follows the popover (`toggle-panel` in `core/components.js`), so `aria-expanded` and the icon (bars → xmark) say whether the panel is open, whatever closed it; Toggle button's state in one helper (`setToggle`) | unreleased (2026-11-10) |
| B-003 ([#119](https://github.com/marcoscenteno89/marccent-theme/issues/119)) | marccent-theme | Loading set its own width (PRODUCT-LINE.md section 4, rule 9): `.loader-bar`'s `width: 100%` and the inline `width: 100%` on every loader dropped; a loader is a block that fills its parent (`.self-stretch`, `.w-100` where a parent shrinks it) | unreleased (2026-11-10) |
| B-002 ([#120](https://github.com/marcoscenteno89/marccent-theme/issues/120)) | (reported) | `hover-morph` on a plain box (a button) morphs its corners to `--hover-radius` (default a leaf), keeps the button's color fades, and cuts nothing unless `--hover-shape` is set | 1.0.0-rc.9 |
| B-001 ([#121](https://github.com/marcoscenteno89/marccent-theme/issues/121)) | Fernway | Code block: the `<pre>` has no margin (base styles), its padding and font from classes, the copy button in a padded corner box; Fernway's `site.css` stopgap removed | 1.0.0-rc.15 |
| A-001 ([#122](https://github.com/marcoscenteno89/marccent-theme/issues/122)) | every project | Audit of situation-specific classes: components made of classes that combine (about 30 general classes added, 6 component stylesheets removed, nav.css's menu look a `.menu-quiet` variant), padding and placement classes that win over a component's own | 1.0.0-rc.15 |
