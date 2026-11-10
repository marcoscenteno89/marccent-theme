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
| 2 | **Component** | `markup/cases.json` → `markup/reference.json` | its markup cases (the HTML for each set of inputs) | `npm test` (reference up to date) | every component that stays (52); the pending ones once built |
| 3 | **Settings** | `markup/settings.json`, `markup/tunes.json` | its kind, parent, admin data, version, and each setting: type, about, default, choices, sanitize, validate (5.2) | `npm run conformance`: kinds, parents, variants, admin tools, every setting's shape | written: 54 components, 204 settings; Marccent Blocks doesn't read them yet |
| 4 | **Adapters** | `markup/outputs.json` (each output's adapters) | its output, its folder, the command that renders the cases (or that it uses the components) | `npm run conformance` (in `npm test`): every adapter's markup against the reference, and what it doesn't cover (`--strict` fails on it); the kitchen-sink page's "Not shown yet" for the rest of Marccent Blocks | automatic: Marccent Blocks 29 of 33 cases (no menu, toggleButton), django-marccent 19 of 33; marccent/next and marccent-html use the components |
| 5 | **Kits** | to decide (Marccent Content's export format) | name, field groups, post types, patterns, starter pages, which components it uses | imports cleanly on a new site | missing |
| 6 | **Sites** | [SITES.md](SITES.md) | site, output, built with, address, stage (building, test, live, frozen), notes | built from `wp/new-site-template` or the Next app; `bin/contrast`, images, schema pass | 8 sites listed: one building (marccent.com), one test (the wp site), six frozen |
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
7. **Which rule wins:** this document, then a project's `CLAUDE.md`, then its `TODO.md`. What Marcos says in a
   conversation beats all three, and is written down in the same round (a rule here, or a line in Decisions, section
   9), or the next session won't know it.
8. **Every rule has a check, or says why it can't.** A rule nothing checks is the one that drifts: it gets a check in
   `npm test` (as the work lists and component sizing have), or a line saying what checks it instead (the feature
   freeze: Claude, and Marcos's review).

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
   works in all three. Its markup cases, each adapter's beside the theme's, are on the cases page (`npm run cases`).

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
9. **A component sets no width and no outer margin; its container decides both.** The layout it sits in (a grid
   cell, `.wrap`, a column, `.measure`, a gap or a spacing class on the parent) sizes and spaces it, so the same
   component fits a sidebar, a card and a full-width section unchanged. On a component's root, by kind:
   - **block components** (Card, Nav, Menu, Map, Carousel, Form fields, loaders) fill their parent by being a block
     or grid item that stretches: no `width` but `auto`, no `max-width` but `100%`, no `min-width` but `0`, no margin
     but `0`. Form controls and tables are the one case of `width: 100%`, because `auto` doesn't stretch them;
   - **inline controls** (Button, Icon, Chip, Rating) are as wide as their content (`fit-content`, an icon's
     `--icon-size`) and never wider than the parent (`max-width: 100%`), with no margin; the parent stretches one with
     a class (`.w-100`, `.self-stretch`);
   - **overlays** (Modal, Drawer, Popover, Tooltip, Toast, a Menu's panel) sit outside the flow, so they're sized
     against the screen or what they're attached to, with a cap that keeps them on screen.

   Parts inside a component (a knob, a handle, an icon slot) are sized within it. `npm run conformance` checks the
   roots in `styles/components`; one that breaks the rule is a ticket, excused by ID in the check until it ships.

## 5. Settings: one standard everywhere

1. **The same settings wherever a component goes** (WordPress, Next, later Django): the same names, choices and
   defaults, from `markup/settings.json` (T-029), never copied by hand into an adapter.
2. **What a setting says** (the shape borrows Editor.js's block contract, 2026-11-09): `type` (text, number, boolean,
   list, object, content), `about`, `default`, `choices` (a fixed list, the theme's own: its surfaces, hovers,
   paddings, sides, variants), `sanitize` (what it may hold, the same in every output: text, html, url, class,
   number, boolean, each item, each field) and `validate` (`required`). Each component has a `version`; after 1.0 its
   settings change only by adding (2.5), and a version up says so, so saved content can be upgraded.
3. **Tunes:** settings every component and container takes, listed once in `markup/tunes.json`, not per component:
   extra classes (a variant, a utility), an anchor, Show if (on an output with an admin).
4. **Full words.** `latitude`, `longitude`, not `lat`, `lng`; `{{ question }}`, not `{{ q }}`. The settings use
   full words (`padding`, `verticalPadding`, `columns`, `minimumColumnWidth`, `minimumHeight`, `maximum`,
   `language`); where a component's prop is still short, the setting names it (`prop`) until the prop is renamed
   (T-029). `href` stays, the web's own word for a link; Map's `center` is `{ lat, lng }`, Google's own shape.
5. **A setting is a look or a choice, never content.** Text, items and lists that repeat aren't settings (6.1).
6. **Checked:** `npm run conformance` fails on a setting that isn't one of its component's props (read from the
   component's source, by `prop` when the name differs), a setting without a known type or sanitize rule, or a
   component without a version, and lists the components that stay without their settings.

## 6. Data: content comes from the admin, not from a block

1. **What repeats is data, never typed into a component's settings.** A component's list of content is one of three
   things (decided 2026-11-09):
   - **children**: each item a child component marked with its parent (4.5), so in WordPress a Loop of a field
     group's rows can be them: Timeline → Timeline item, Dock → Dock item, Radial menu → Radial menu item, Step bar →
     Step bar step, Orbit → Orbit item, Tab bar → Tab; already so: Accordion → Accordion item, Step form → Step, Hex
     grid → Hex flip (in WordPress Form → Field, Tabs → Tab);
   - **admin data** read whole: a menu (Menu, the Header and Footer patterns) from Appearance → Menus; a Data table's
     rows and a Map's places from a field group's rows or posts;
   - **settings** when it's a choice made once, not content: Scenery's layers, a Tag input's suggestions, Code tabs'
     languages, Hex grid's positions, a Data table's columns, a form field's choices.
2. **Parents take a Loop.** Accordion, Tabs, Carousel and every parent above accept a Loop of their children, so a FAQ
   stored as rows can be an Accordion.
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

## 9. How Claude works: grey areas, proof and decisions

Every project's `CLAUDE.md` points here. These keep projects from drifting apart when something comes up that no
rule settles.

### When no rule covers it

1. **Look first**, in this order: this document, the project's `CLAUDE.md`, the work lists (`TICKETS.md`, the
   project's `TODO.md`), Decisions (below), and how the other projects already do the same thing.
2. **A rule covers it:** follow it, and name the rule in the reply.
3. **No rule covers it, two rules conflict, or one reads two ways:** stop that part (keep doing the rest) and ask
   Marcos, in this shape:

   ```
   No rule for: <the situation, in one line>.
   Options: A) <…>  B) <…>
   I recommend A, because <the fact: a rule, a file, a standard>.
   A rule for every project, or a one-off?
   ```
4. **Write the answer down in the same round.** A rule goes into this document (and its check, rule 2.8); a one-off
   goes into Decisions as one dated line. The next session, in any project, finds it there instead of guessing.
5. **Never settle it in one project alone:** no convention of one repo's own, no copying another project's
   workaround, and "it's small" is no reason to skip asking.

### Proof and scope

1. **No claim without output.** Claude says a check passed only when it ran it and saw it pass, and names the
   command; what wasn't run is said as not run.
2. **One goal per change.** A branch or PR does one thing; a fix and a cleanup are two changes.
3. **Nothing is removed without a ticket or Marcos's OK:** no feature, setting, file or list item deleted on
   Claude's own. A cleanup found while working goes on the list (section 8, rule 7).

### Decisions

Rulings on grey areas, newest first: `YYYY-MM-DD: <the situation>: <the ruling>`. A ruling that turns out to apply
everywhere becomes a rule above and its line goes.

- 2026-11-10: a business schema from a Business field group (Marccent Local's `inc/schema.php`): no plugin builds
  one; every field group makes its own schema (Marccent Content's `schema`), so a group without one adds none.
- 2026-11-08: a `site.css` for custom styles: section 4, rule 1 holds for every Marccent project (the sites and the
  adapters); someone using the theme on a site of their own writes whatever CSS they need.

## The 1.0 checklist

The one list of what's left before 1.0 (3.1: marccent-theme 1.0.0, marccent.com live, the wp site working with every
component). Ticked here as it's done; what's for after 1.0 is in TICKETS.md and the projects' TODO.md.

**1. The product line**
- [x] **Component stage:** a markup case (`markup/cases.json` → `reference.json`) for every component and container
  that stays: 52 components, 76 cases (2026-11-09). A child is covered by its parent's case (AccordionItem,
  Step, SliderPager in Carousel); Toast has none (browser only: nothing until a message, `markup` in settings.json).
  Pending, a case once built (T-034, T-033): Timeline item, Dock item, Radial menu item, Step bar step, Orbit item,
  Tab; StatCard without its box. None for what's leaving (AppShell, Collage, ImageCard, HexWall).
- [x] **Settings stage, written (T-029):** every component that stays (54) has its settings in `markup/settings.json`,
  204 in all, with sanitize, validate and a version (2026-11-09); the tunes in `markup/tunes.json`.
- [x] **Settings stage, used by Marccent Blocks** (2026-11-10): its block.json attributes are written from
  settings.json (`npm run test:settings` fails on any difference without a reason in `tools/settings-map.json`), the
  short names are the settings' full words there (padding, columns, verticalPadding, language; content saved before is
  upgraded by its version), its editor choices are settings.json's, and Marccent Content's Loop is a Grid. Left, each
  listed in that map: 31 settings not offered yet, 12 kept in the block's own shape (the sample items until T-034).
- [ ] **The short props renamed** (5.4): the components' own `pad`, `padY`, `cols`, `min`, `row`, `max`, `lang`.
- [ ] **Countdown, Parallax and Stars** have blocks but no entry in settings.json: they stay (an entry, a case) or go.
- [x] **Sites:** one list of every site and its stage ([SITES.md](SITES.md), 2026-11-09).
- [ ] **Kits:** where they live and their check, or moved to after 1.0.
- [x] **Adapters:** every adapter's markup against the reference (`npm run conformance`).

**2. The restructuring decided**
- [ ] T-032: the Header and Footer patterns; NavBar retires; the Navbar block becomes a Header block pattern.
- [ ] T-033: done in 1.0.0-rc.21: `.overlay-tint`, `.overlay-blur`, `.overlay-focus`; Grid's dense packing and row
  height, `.row-span-N`; HexWall gone; the Stopwatch block is Counter's controls. Left: ImageCard and Collage retire
  (their pages on marccent.com rebuilt as the patterns), StatCard drops its box (about 15 uses on marccent.com wrap
  in a Card), AppShell decided.
- [ ] T-034: the six children (Timeline item, Dock item, Radial menu item, Step bar step, Orbit item, Tab); their
  parents take them and a Loop of them.
- [ ] The WordPress blocks these replace retire: Image card, Collage, Hex wall.

**3. The wp site: every component in the admin and on the page**
- [x] ToggleButton covered by Marccent Blocks (2026-11-09); its markup test runs the theme's conformance check.
- [ ] The islands' stand-in markup is the component's (today plain text).
- [x] A Carousel of a Loop's items (a Loop in any island's slot gives its items, 2026-11-09); a Loop as a row of
  content-width items (the Loop's Layout).
- [ ] Forms: the rate limit behind the proxy (done 2026-11-09: mod_remoteip in the WordPress image); left: Turnstile's
  server check, file upload checks, Forms → Entries retired.
- [x] Marccent Blocks' markup test runs the theme's conformance check (2026-11-09).
- [x] Marccent Content: deleting a post leaves no broken relation (set null, 2026-11-09; cascade and protect after 1.0).
- [ ] The kitchen sink current with all of it.

**4. marccent.com live**
- [x] A demo of every component that stays (3.6): the last seven (Grid, Divider, Dock, Drawer, CodeTabs, Blur, Map)
  on the Theme page, 2026-11-09; SliderPager in Carousel, Trace in Button's trace. The pending ones when built.
- [ ] Its dependencies updated: `npm audit fix` took it to 14 (2026-11-09); left: Next 15 → 16 (a major upgrade: the critical
  one and four high), and js-beautify's (the theme's, no fix yet).
- [ ] Hosting, the domain, the deploy.
- [ ] T-002 cookie consent (if it tracks); T-024 typography set on the server.

**5. Safe to go live**
- [ ] The database off its public IP, passwords rotated, a non-root admin; the Maps key restricted by referrer.

**6. Release**
- [ ] marccent-theme 1.0.0, and marccent.com and the wp plugins on it. The freeze ends.
