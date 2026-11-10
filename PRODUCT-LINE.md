# The Marccent product line

Marccent is a **software product line**: core assets built once and kept stable (the theme, its components and
their settings, the adapters, the kits), and products assembled from them (each website). Sold as a **productized
service**: a defined, repeatable result, each new client a new entry, not a new project.

- **Core assets**: marccent-theme (components, classes, tokens), its settings, the adapters (Marccent Blocks and
  Marccent Content, django-marccent, marccent/next) and the kits.
- **Products**: the sites (rc-imp, rimrock, cr-landscape, marccent-web, marccent.com, and every one after).
- **Variation points**: the only places one product differs from another: a component's settings, the kits a site
  uses and its content. Anything else that differs is a missing core asset.
- **Domain engineering** builds and fixes the core assets; **application engineering** builds sites from them. Until
  1.0 the work is domain engineering.
- **The reference architecture** is the flow below: the part that lasts.
- **Outputs**: the kinds of site a product can be, a list that can grow (`markup/outputs.json`): today **wp**
  (WordPress), **html** (plain HTML and Next) and **django**. Each says whether it has an **admin** (wp and django:
  people edit the data in an admin; html: the data comes with the page). Every output with an admin follows the same
  **admin pattern**: the same kinds of admin data (menu, rows, site, theme, keys, entries), each provided by one of
  its tools, and each component says which kinds it needs (`markup/settings.json`). A new output is one more entry
  there, with its adapters and, if it has an admin, its tool for every kind.

## 1. The flow (the reference architecture)

```
Wanted ──► Component ──► Settings ──► Adapters ──► Kits ──► Sites ──► Live
 idea       the theme's    one set of    WordPress,    field groups,  built from     checks pass,
            markup cases   rules for     Django, Next  post types,    the template   address up
                           its settings  translate it  patterns       and kits
```

- **A new widget** goes Wanted → Component → Settings → Adapters, then any kit or site can use it.
- **A new website** goes Wanted → Sites (using existing components and kits) → Live.
- **A new kit** goes Wanted → Kits (using existing components) → used by sites.
- A stage only takes what the stage before it finished: a site never uses a widget that isn't through Adapters, an
  adapter never ships a component the theme doesn't have.

**Its structure is what lasts.** After 1.0 entries come and go freely, but the stages, their order and the shape of
their entries change only as 1.x changes the public markup: by adding (a new optional field, a new check), never by
removing, renaming or reordering. A change that breaks a stage's shape is a 2.0. So it's settled now, before 1.0, and
changed deliberately, here first.

| # | Stage | Home (its list) | An entry has | Check (the gate to the next stage) | State |
|---|---|---|---|---|---|
| 1 | **Wanted** | `TICKETS.md` (theme), each project's `TODO.md` | what, who needs it, found date | a decision to build it (none before 1.0 but product-line work) | exists |
| 2 | **Component** | `markup/cases.json` → `markup/reference.json` | its markup cases (the HTML for each set of inputs) | `npm test` (reference up to date) | 15 of ~45 components |
| 3 | **Settings** | `markup/settings.json` | the kinds of admin data it needs (`admin`, from `outputs.json`'s pattern); each setting: full-word name, type, choices, default; rules (items from rows, one per page) (T-029) | `npm run conformance`: every kind defined, every admin output has a tool for it, settings written | 56 components' admin needs listed; their settings not written yet |
| 4 | **Adapters** | `markup/outputs.json` (each output's adapters) | its output, its folder, the command that renders the cases (or that it uses the components) | `npm run conformance` (in `npm test`): every adapter's markup against the reference, and what it doesn't cover (`--strict` fails on it); the kitchen-sink page's "Not shown yet" for the rest of Marccent Blocks | automatic: Marccent Blocks 29 of 33 cases (no menu, toggleButton), django-marccent 19 of 33; marccent/next and marccent-html use the components |
| 5 | **Kits** | to decide (Marccent Content's export format) | name, field groups, post types, patterns, starter pages, which components it uses | imports cleanly on a new site | missing |
| 6 | **Sites** | to decide (one list of every site) | name, host, adapter, address, kits, stage (building, live) | built from `wp/new-site-template` or the Next app; `bin/contrast`, images, schema pass | missing: folders in `wp/sites/` and `marccent/`, no list |
| 7 | **Live** | the Sites list's stage | address, launch date | the site's checks keep passing | none live yet |

## 2. Rules of the product line

1. **Everything new enters at Wanted.** No stage is skipped: no widget built straight into a site, no site without
   the template.
2. **One home per list.** Each stage's list lives in one file in one project; everything else reads it, never copies it.
3. **Every entry has its stage's shape.** An entry with a field missing is incomplete, not "a special case".
4. **Every stage has a gate.** A check that fails or reports when an entry isn't ready to move on.
5. **The structure changes only by adding** after 1.0. Before 1.0, change it here first, then in the projects.
6. **Product line before entries.** Until it's complete, work goes into its stages, shapes and checks and into fixing
   what already exists; new entries wait in Wanted.

## 3. The feature freeze (until 1.0 is live)

1. **No new features, widgets, blocks, settings or functionality until 1.0 is live:** only debugging, fixing and
   finishing what exists. 1.0 is live when marccent-theme 1.0.0 is released, marccent.com is live and the wp site
   (wp.localhost) works with every component (all of it). Then the changes are frozen and the other sites (rc-imp,
   rimrock, cr-landscape, marccent-web) and outputs (django) are brought up to 1.0 once, instead of after every
   change.
2. **The first item is completing the product line** (this document): its stages, shapes and checks. That isn't a
   new feature; it's what makes new features fit.
3. **Anything new asked for goes to Wanted** (TICKETS.md, TODO.md), marked after 1.0, and Claude says so before
   doing anything else.
4. **Test tools are allowed** when they find bugs and are thrown away after (the kitchen-sink page,
   `wp/sites/wp/content/kitchen-sink.php`).
5. **Only marccent.com and the wp site are worked on** (2026-11-09), with the theme and the adapters they use
   (marccent/next; Marccent Blocks and Marccent Content). Everything else is frozen until then: the django output
   and django-marccent (`"frozen"` in `markup/outputs.json`, which the conformance check skips), rc-imp, rimrock,
   cr-landscape, marccent-web, marccent-html, Fernway, parallax-html.
6. **Every component is tested where people use it:** on the wp site's kitchen-sink page (wp.localhost, the WordPress
   test: `wp/sites/wp/content/kitchen-sink.php`), both in the admin (the block in the editor, its settings, the admin
   data it needs) and on the page; and on marccent.com (the html test: the page). A component isn't done until it
   works in all three.

## 4. Components: what belongs in the theme and what in an adapter

1. **No project ships custom assets.** Sites (marccent-html, marccent/next, Fernway, the WordPress sites,
   parallax-html) and adapters (Marccent Blocks, Marccent Content, marccent-wp, django-marccent) use marccent-theme's
   components, classes and tokens. Period. No own CSS or JS for the look or the behavior of a page: no `site.css`
   rules, no inline `<style>` or `wp_add_inline_style`, no plugin `assets/*.js`, no copied or forked components, no
   overrides of a theme class.
2. **When the theme can't do it, don't work around it.** A component missing, broken or not fitting: add a ticket to
   [TICKETS.md](TICKETS.md) (who needs it, what for, which file holds the stopgap) and fix it in the theme. The
   stopgap is removed when the ticket ships.
3. **Allowed in a project**: content (text, images, settings, menus), the theme's tokens set in its own settings
   (palette, fonts, spacing), and app logic that drives theme components with data (an API call, a form post).
4. **Every theme change cascades.** A change isn't done until every project that uses the theme has it: release it
   (version, CHANGELOG, tag), then move each project to that release, rebuild it and check it still works:
   - Marccent Blocks: its `package.json` pin (marccent-wp and Marccent Content get the theme through it);
   - marccent-html, marccent/next, Fernway (`html/`): their `package.json` pins;
   - django-marccent: `marccent.THEME_VERSION` and its committed copy of the theme's `dist/`.

   When the markup (`markup/reference.json`) or a component's props change, update the adapters that translate them
   in the same pass. When a change ships a ticket, remove that ticket's stopgap. A project that can't take the change
   yet gets a line in its `TODO.md` saying why.
5. **Component, container, variant, class or pattern** (provisional, 2026-11-09: kept under watch, changed here
   first if it doesn't hold). Ask in order; the first yes decides:
   1. It needs behavior or logic (state, events, timers, observers, formatting, data turned into markup; parts
      combined into one value or one state count) → a **component** (Modal, Menu's fold, Map, Price, Counter,
      CodeTabs: its editors are one value).
   2. It needs markup a layout of other things can't write (a dialog's, tabs' or disclosure's structure for screen
      readers, SVG, canvas; markup that depends on an item's place among the others) → a **component** (Accordion,
      Divider, Animation, Timeline: its line runs through every row, trimmed at the first and the last).
   3. It's one box that holds whatever content is put in it, its settings only classes (layout, spacing, background,
      alignment) → a **container** (Section, Grid, Card). One block or tag in every output; Section's dividers and
      background image are settings of that one box.
   4. It only changes how one item looks (its shape, its frame), and could do it to other items → a **variant**: one
      class, the theme's tokens only, scoped to the item, one at a time (the ticket; TICKETS.md T-030). A component or
      container that takes variants has a `variant` setting (as Modal's).
   5. It only changes one property (spacing, color, size, placement) → a **class** (`.pad-lg`, `.text-muted`,
      `.raised`); the theme is classes that combine, so no component when classes already do it.
   6. It arranges several specific parts, each of which works on its own → a **pattern** (a header, which the
      NavBar is today; a footer, a stat card, a hero, a call to action): listed in [PATTERNS.md](PATTERNS.md) with its parts and markup, never a component; in WordPress a
      block pattern of Marccent blocks, never a block.

   **Children:** a component that only exists inside another (an item in an Accordion, a Step in a StepForm; in
   WordPress a Field in a Form, a Tab in Tabs) is a component of its own, marked with its parent (`parent` in
   `markup/settings.json`; the block's `parent` in WordPress), and allowed only there. A Loop may stand in for a
   parent's children (6.2). Its kind is decided like any other.

   So two components that differ only in looks are one component and its variants (Card + the ticket variant, not
   TicketCard); a component whose only job is to lay out others is a pattern; and what a container already does with
   its ordinary content is neither (an image card is a Card with an image in it: no ImageCard). Each component's kind is its
   `kind` in `markup/settings.json`; the conformance check lists the ones still waiting to become a pattern or a
   variant.
6. **Adapters only translate.** An adapter's block, tag or component writes the theme's markup
   (`markup/reference.json`) and nothing else: no CSS or JS of its own, no copied components.
7. **Inside one line of text:** a small unit with mixed styling or a little logic (formatting, links built from a
   field, dates, a time zone) is a component (a block in WordPress: Price, Date, Contact line, Opening hours,
   Breadcrumbs; T-004, T-005, T-025 to T-027); styling on part of a line (raised, muted, a badge) is a **text
   format** (T-028).
8. **No block for what a list of links already does.** No Social links block: social links are a menu, shown with
   the Menu block (rc-imp's Social menu, built from its Profiles rows).

## 5. Settings: one standard everywhere

1. **The same settings wherever a component goes** (WordPress, Django, Next): the same names, choices and defaults,
   from the theme's settings file (T-029), never copied by hand into an adapter.
2. **Full words.** `latitude`, `longitude`, not `lat`, `lng`; `{{ question }}`, not `{{ q }}`.
3. **A setting is a look or a choice, never content.** Text, items and lists that repeat aren't settings.

## 6. Data: content comes from the admin, not from a block

1. **What repeats is data.** A component's items (Orbit's, Dock's, Step bar's, Hex wall's, Timeline's, Collage's,
   Ticket card's list, Radial menu's, Data table's rows, Map's places) are a field group's rows or posts, edited in the
   admin (wp-admin, Django's admin), never typed into a block's settings.
2. **Containers take a Loop.** Accordion, Tabs and Carousel accept a Loop of their items, so a FAQ stored as rows can
   be an Accordion.
3. **Components that need the admin say so** (`admin` in `markup/settings.json`), and every output with an admin
   provides each kind with one of its tools (`markup/outputs.json`, the admin pattern; an output without an admin,
   html, gets the data with the page). The kinds and who needs them:
   - menus: Navbar, Menu, and the Header and Footer patterns (WordPress: Appearance → Menus; Django: a menu model). A nav picks any menu
     made in the admin and can go anywhere;
   - forms (entries, who's emailed, the spam check), Map (key, places), the theme editors (the site's theme and what
     visitors may change), Typeset, Opening hours, Contact line (the business details), cookie consent, the
     announcement row, ratings and reviews (Sources), and every component with items (above).
4. **Data goes into field groups first**, before anything is done with it (emailing it, a CRM, a webhook).

## 7. The ecosystem rules (their home is the workspace's CLAUDE.md and `wp/RULES.md`)

Not repeated here, only named (no custom assets and gaps going to the theme are in section 4): Marccent's blocks first; what repeats is data; full words in every name; only the tools people have; data
into field groups first; two plugins plus kits; everything visitors see built in the block editor until handover;
every image search-ready; a TODO.md in every project.

## To finish the product line

- [ ] Component: cases for every component, not only the 15 in `reference.json`.
- [ ] Settings: `markup/settings.json` (T-029), and Marccent Blocks reading it.
- [x] Adapters: each adapter's markup against the reference, as a check (`npm run conformance`); Settings once they exist.
- [ ] Kits: where kits are kept and listed, and their check.
- [ ] Sites: one list of every site (rc-imp, rimrock, cr-landscape, marccent-web, marccent.com) with its stage.
- [ ] Live: marccent-theme 1.0.0, marccent.com and the wp site; then the other sites, brought up to 1.0 once.
