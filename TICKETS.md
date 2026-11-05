# Marccent ecosystem tickets

marccent-theme is the core of every Marccent site and adapter. This is the one list of what the theme doesn't do yet
for them, and of every place a project still carries its own code instead of the theme's.

## The rule

**No project ships custom assets.** Sites (marccent-html, marccent/next, Fernway, the WordPress sites, parallax-html)
and adapters (Marccent Blocks, Marccent Local, Marccent Content, marccent-wp, django-marccent) use marccent-theme's
components, classes and tokens. Period.

- **No own CSS or JS for the look or the behavior of a page**: no `site.css` rules, no inline `<style>` or
  `wp_add_inline_style`, no plugin `assets/*.js`, no copied or forked components, no overrides of a theme class.
- **When the theme can't do it** (a component is missing, broken, or doesn't fit), **don't work around it**: add a ticket
  below (who needs it, what for, which file holds the stopgap) and fix it in the theme. The stopgap is removed when the
  ticket ships.
- **Adapters only translate.** Marccent Blocks, django-marccent and the like render the theme's markup
  (`markup/reference.json`) and glue it to their host (WordPress, Django): they don't add looks or components of their
  own.
- **Every theme change cascades.** A change here isn't done until every project that uses the theme has it: release it
  (version, CHANGELOG, tag), then move each project to that release, rebuild it, and check it still works:
  - Marccent Blocks: its `package.json` pin. marccent-wp, Marccent Local and Marccent Content get the theme through
    it.
  - marccent-html, marccent/next, Fernway (`html/`): their `package.json` pins.
  - django-marccent: `marccent.THEME_VERSION` and its committed copy of the theme's `dist/`.

  When the markup (`markup/reference.json`) or a component's props change, update the adapters that translate them in
  the same pass. When a change ships a ticket, remove that ticket's stopgap. A project that can't take the change yet
  gets a line in its `TODO.md` saying why.
- **Allowed in a project**: content (text, images, settings, menus), the theme's tokens set in its own settings
  (palette, fonts, spacing), and app logic that drives theme components with data (an API call, a form post).

## How a ticket works

One line in **Open** per gap: `ID | who | what's wrong | the stopgap (file) | what the theme needs`. When it ships,
move it to **Done** with the release, and remove the stopgap from the project in the same round.

## Open

### Theme gaps (components the sites need)

| ID | Who | Need | Stopgap today | Theme needs |
|---|---|---|---|---|
| T-002 | Marccent Local | Cookie consent banner | `inc/consent.php`: inline CSS and two inline scripts | A consent/banner component (fixed corner panel, accept/reject, remembers) |
| T-003 | Marccent Local, rc-imp | Call bar fixed to the bottom on phones | `inc/callbar.php` inline CSS; rc-imp `site.css` `.mcl-callbar .btn` | A bottom action bar (fixed, safe-area aware, phone only) |
| T-004 | Marccent Local | Opening hours table, open/closed label, closures | `inc/hours.php` inline CSS (`.mcl-hours`, `.mcl-open`) | `.table` compact variant; a status badge |
| T-005 | Marccent Local | Breadcrumbs | `assets/site.css` `.breadcrumbs` | A Breadcrumbs component (markup + css) |
| T-006 | Marccent Local | Link chips (cities, services) | `assets/site.css` `.link-list` | Chip links (`.tag` exists only inside TagInput) |
| T-007 | Marccent Local | Key facts (label / value rows) | `assets/site.css` `.facts` | A description-list class |
| T-008 | Marccent Local, Marccent Blocks | Tables in WordPress content | `assets/site.css` `.wp-block-table` | Nothing new: Marccent Blocks should put the theme's `.table` on core table blocks, then the CSS goes |
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

### Theme bugs (found because a site patched around them)

| ID | Who | Bug | Stopgap today | Fix |
|---|---|---|---|---|
| B-001 | Fernway | Code block: the `<pre>` margin and the copy button's place | `site.css` `[data-component="code"] > pre`, `> [data-copy]` | Code's own CSS places them |

### Whole projects off the theme

| ID | Who | State | Plan |
|---|---|---|---|
| P-001 | parallax-html | A copy of the Anthem site on its own Bootstrap CSS and JS (`src/static/css/*`, `src/static/js/app.js`, ~4,000 lines); the theme only adds a theme button | Rebuild its pages on theme components, page by page, ticketing what's missing |
| P-002 | marccent-html, marccent/next | Two copies of the same site that drift (each edit made twice) | One source for both |

## Done

| ID | Who | What | Release |
|---|---|---|---|
| T-001 | marccent-html, marccent/next, Marccent Local, rc-imp | Map: three own maps (two copies of the sites' `components/apps/map.js`, Marccent Local's `assets/map.js`) replaced by the theme's Map (`components/widgets/map.js`, and `data-component="map"` for the engine) | 1.0.0-rc.6 |
| T-023 | Fernway | Its own `.eyebrow` redefined the theme's | removed, uses the theme's (1.0.0-rc.6) |
| B-002 | (reported) | `hover-morph` on a plain box (a button) morphs its corners to `--hover-radius` (default a leaf), keeps the button's color fades, and cuts nothing unless `--hover-shape` is set | 1.0.0-rc.9 |
