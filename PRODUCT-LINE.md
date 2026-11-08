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
| 1 | **Wanted** | `TICKETS.md` (theme), each project's `TODO.md` | what, who needs it, found date (section 8's item shape) | `npm run todos`: every list in the template's shape, every ticket linked from the projects it names; then a decision to build it (none before 1.0 but product-line work) | exists, checked |
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
   finishing what exists. 1.0 is live when marccent-theme 1.0.0 is released, marccent.com is live and rc-imp,
   rimrock, cr-landscape and marccent-web are live (all of it).
2. **The first item is completing the product line** (this document): its stages, shapes and checks. That isn't a
   new feature; it's what makes new features fit.
3. **Anything new asked for goes to Wanted** (TICKETS.md, TODO.md), marked after 1.0, and Claude says so before
   doing anything else.
4. **Test tools are allowed** when they find bugs and are thrown away after (the kitchen-sink page,
   `wp/sites/wp/content/kitchen-sink.php`).

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
5. **The theme is classes that combine.** A component is made of general classes (`.raised`, `.fs-50`,
   `.text-muted`, padding, placement); no component when classes already do it (a price needs no theme component).
6. **Adapters only translate.** An adapter's block, tag or component writes the theme's markup
   (`markup/reference.json`) and nothing else: no CSS or JS of its own, no copied components.
7. **Block or pattern** (in WordPress; the same split elsewhere):
   - a stack of whole blocks (a section heading, a call bar, a hero, a call to action) → a **pattern**;
   - one line or small unit with mixed styling inside it, or a little logic (formatting, links built from a field,
     dates, a time zone) → a **block**: Price, Date, Contact line, Opening hours, Breadcrumbs (T-004, T-005,
     T-025 to T-027);
   - styling on part of a line of text (raised, muted, a badge) → a **text format** (T-028).
8. **One block per kind; looks are patterns.** One Card block: an image card or an icon card is a pattern of Card,
   not a block of its own. The same for any "X card".
9. **No block for what a list of links already does.** No Social links block: social links are a menu.

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
   - menus: Navbar, Nav, Menu, Footer (WordPress: Appearance → Menus; Django: a menu model). A nav picks any menu
     made in the admin and can go anywhere;
   - forms (entries, who's emailed, the spam check), Map (key, places), the theme editors (the site's theme and what
     visitors may change), Typeset, Opening hours, Contact line (the business details), cookie consent, the
     announcement row, ratings and reviews (Sources), and every component with items (above).
4. **Data goes into field groups first**, before anything is done with it (emailing it, a CRM, a webhook).

## 7. The ecosystem rules (their home is the workspace's CLAUDE.md and `wp/RULES.md`)

Not repeated here, only named (no custom assets and gaps going to the theme are in section 4): Marccent's blocks first; what repeats is data; full words in every name; only the tools people have; data
into field groups first; two plugins plus kits; everything visitors see built in the block editor until handover;
every image search-ready; a TODO.md in every project (its rules are section 8).

## 8. Work lists: TICKETS.md and each project's TODO.md

Every project keeps a `TODO.md` (the theme's is `TICKETS.md`). They are the Wanted stage's lists, and they follow
these rules strictly; `npm run todos` checks them (below), and a list that fails it is fixed before anything else.

1. **A ticket lives in the project that fixes it.** What the theme has to fix (a missing or broken component, class
   or token) is a ticket in `TICKETS.md`, never in a project's TODO.md. What only one project fixes (its own bug, its
   own cleanup) is in that project's TODO.md and nowhere else.
2. **Others link, never copy.** A project waiting on another project's ticket has one line under **Waiting on**
   that links to it by ID and says what it unblocks here, nothing more. The ticket's details stay in its one home.
3. **Every ticket is linked from every project it names.** An open ticket in `TICKETS.md` whose Who names a
   project has a Waiting on line in that project's TODO.md; a Waiting on line links only to a ticket that's still
   open. When a ticket ships (moves to Done), the projects delete its line and the stopgap in the same round.
4. **The feature freeze sorts the list** (section 3): new features, blocks, settings or functionality go under
   **After 1.0**, never Requests. Requests are only debugging, fixing and finishing what exists.
5. **One shape for every item**, so nothing is "a special case":
   `- [ ] **What** — details (found YYYY-MM-DD)`. Ticked when done (`- [x]`, with its done date), then deleted when
   the release that has it is out (the CHANGELOG or README keeps the record). Details can continue on indented lines
   or sub-bullets.
6. **Only these sections, in this order**: Bugs, Requests, Waiting on, After 1.0, Notes. An empty one stays, with
   its heading. Notes are ideas not decided yet and measurements, without checkboxes; once one is decided it becomes
   an item in Bugs, Requests or After 1.0.
7. **Claude doesn't add work on its own.** Something found while working on another item is added to the list
   (rules 1 to 6) and said in the reply; it isn't done in the same change unless it was asked for.

### The template

```markdown
# To do: <project>

The rules for this list are in [PRODUCT-LINE.md §8](https://github.com/marcoscenteno89/marccent-theme/blob/master/PRODUCT-LINE.md#8-work-lists-ticketsmd-and-each-projects-todomd):
work fixed here only; anything the theme fixes is a ticket in marccent-theme's TICKETS.md, linked under Waiting on.

## Bugs

- [ ] **What's broken** — where, how it shows (found YYYY-MM-DD)

## Requests

- [ ] **What to fix or finish** — details (found YYYY-MM-DD)

## Waiting on

- [ ] **[T-000](https://github.com/marcoscenteno89/marccent-theme/blob/master/TICKETS.md)** — what it unblocks here: the stopgap that goes (found YYYY-MM-DD)

## After 1.0

- [ ] **A new feature** — details (found YYYY-MM-DD)

## Notes

- An idea not decided yet, or a measurement.
```

### The check

`npm run todos` (in the theme; `node scripts/todos.mjs [--root <folder>]`) reads `TICKETS.md` and the TODO.md of
every project it finds next to the theme (a project not there is skipped and said so) and fails when:

- a section is missing, out of order or not one of the five, or the rules line is missing;
- an item in Bugs, Requests, Waiting on or After 1.0 isn't in the item shape, or has no found date;
- a Waiting on line doesn't link a ticket ID, or links one that isn't open in `TICKETS.md`;
- an open ticket names a project whose TODO.md has no Waiting on line for it.

## To finish the product line

- [ ] Component: cases for every component, not only the 15 in `reference.json`.
- [ ] Settings: `markup/settings.json` (T-029), and Marccent Blocks reading it.
- [x] Adapters: each adapter's markup against the reference, as a check (`npm run conformance`); Settings once they exist.
- [ ] Kits: where kits are kept and listed, and their check.
- [ ] Sites: one list of every site (rc-imp, rimrock, cr-landscape, marccent-web, marccent.com) with its stage.
- [ ] Live: the four WordPress sites, marccent.com and marccent-theme 1.0.0.
