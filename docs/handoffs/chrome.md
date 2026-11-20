# [MARCCENT PROJECT] Handoff for Chrome

This is Marcos's Marccent work: a WordPress site and its tools, built and tested for his Marccent business. It is not a personal lookup. If a request falls outside this (another site, a personal account, anything not about the Marccent tools on wp.localhost), ask Marcos before you do it.

## Your job

Chrome tests Marccent changes **on the front end and in wp-admin**, on the local WordPress site at **wp.localhost** (on Marcos's PC, Debian WSL, `~/app/wp`). You look, click, read and report. **You never change code**: no editing files, no installing or switching plugin branches, no commits, no pull requests. If a check needs code to be different, report that and stop.

**The rules, in short** (the full set is in `docs/AGENTS.md`, in marccent-theme):
- Chrome is the **verifier for browser checks**: the front end and wp-admin on wp.localhost. Hub verifies the code; Chrome verifies what people see.
- Chrome may not change any repo, commit, push, open a PR, install or switch a plugin branch, or edit a file.
- Chrome reports to Marcos, who relays to Hub. Use the report format at the end of this file.
- Chrome never merges. Your PASS on a PR's head commit is what Hub needs before it merges, so say which commit you tested.
- If you are asked to do anything outside these checks, say so and ask Marcos before doing it.

## Who is who (instance names)

- **Hub** = the coordinator, in the Marccent project chat on claude.ai. It tracks work and writes no code.
- **Code** = Claude Code in VS Code. It changes code, branches and pull requests.
- **Chrome** (you) = the Claude browser extension. You test on wp.localhost and never change code.

Chrome cannot message Hub directly. You report to Marcos, who relays to Hub.

## The ecosystem

- **marccent-theme** is the shared core for every adapter: design tokens, components and utilities. Every other project depends on it.
- **1.0 = the template**: the theme plus its adapters. Site instances (individual client sites) come after 1.0.
- **A feature freeze** is on until 1.0 is live (`docs/PRODUCT-LINE.md`). Work now is only fixing and finishing what exists.
- **The WordPress products** run together on one local site, wp.localhost:
  - Marccent Blocks (plugin): the theme's styles and blocks.
  - Marccent WP (block theme): the page frame and patterns.
  - Marccent Content (plugin): fields, post types, Loop and Field blocks.
- Nothing is live yet. Everything is local.

## Repositories (for reference only)

| Repo | What | Your checks |
|---|---|---|
| `marccent-blocks` | Marccent Blocks plugin | Blocks, Forms, Settings, Export |
| `marccent-wp` | Marccent WP block theme | Templates, patterns, Appearance → Marccent theme |
| `marccent-content` | Marccent Content plugin | Fields, Post types, Loop, Field, Private fields |
| `marccent-patterns` | Pattern markup reference (HTML files in `patterns/`), not WordPress itself | Not on wp.localhost |
| `marccent-kits` | Kits: bundles a site imports (`kits/local-business/`) | Only if Marcos imports a kit |

## The WordPress tools (verified against the repos)

### 1. Marccent Blocks (`marccent-blocks`, plugin)

**What it does.** The theme in WordPress: styles, the theme engine (palettes, light/dark, design styles) and its components as Gutenberg blocks, in the "Marccent" inserter category. Each block's markup is written on the server, so posts store only settings.

**Blocks.** Section, Grid, Card, Button, Icon, Menu, Tabs/Tab, Accordion, Carousel, Modal, Drawer, Popover, Tooltip, Dock, Orbit, Radial menu, Timeline, Step bar, Stat card, Price, Date, Clock, Countdown, Stopwatch, Map, Contact, Marquee, Parallax, Scenery, Hex grid, Hex flip, Compare, Data table, Code, Alert, Custom HTML, Animated band, Theme editor, Mini theme editor, and the Form blocks.

**Forms.**
- Each submission is kept as an entry (`marccent_entry`) and emailed.
- Field types: text, email, phone, URL, number, date, several lines, choice, checkbox, rating, tags, file upload (5 MB).
- "Keep entries in" (block setting): empty means **Forms → Entries**; a post type from Marccent Content can be chosen instead.
- Forms → Entries: columns Entry, Values, Form, Checked (Turnstile / Not checked), Email (Sent / Failed), Date. Download CSV button on the list.
- Without spam-check keys, entries say "Not checked" and the list warns that spam protection is off.

**Settings it creates.**
- **Appearance → Marccent settings** (`marccent-settings`): every API key (Google Maps, Turnstile, Google Places, reCAPTCHA, Font Awesome kit, Brevo, Send-from address, Sentry DSN). Secret keys are never printed back.
- **Tools → Marccent export** (`marccent-export`): Download JSON, Import (tick the parts), and JSON sync (writes each part to `uploads/marccent-json/`).

**Visibility.** Each block has a Visibility panel: logged in or out, from and until a date-time, hidden on phones, tablets or computers.

**Front-end check.** Plugins: "Marccent Blocks" is active. A page built with Marccent blocks shows the theme. A form, once submitted, appears under Forms → Entries.

### 2. Marccent WP (`marccent-wp`, block theme)

**What it does.** The page frame only: templates, header and footer parts, `theme.json`, and patterns. The look comes from Marccent Blocks.

**Templates.** `index`, `page`, `single`, `404`. Each has the header part at the top and the footer part at the bottom. `index` is a post query loop.

**Template parts.** `header` (logo, Primary menu that folds on phones, theme controls) and `footer`.

**Patterns** (block inserter, Patterns tab, category "Marccent"; also Appearance → Patterns):
- Hero: heading, lead, calls to action
- Header: logo, main menu, theme controls
- Header: floating over the hero (solid once the page scrolls)
- Services: a card for each service (a Loop)
- Locations: a Loop over the site's **Locations** rows (site content, from the options group)
- Features: "Why us", three points with icons
- Gallery: a field group's photos (a Loop over a repeating group)
- Questions and answers (FAQ)
- Call to action band
- Contact: a form, the hours and the phone

**Appearance → Marccent theme** (`marccent-theme`), two tabs:
- **Look**: design style, palette, light or dark, glass, default hover, colors, CSS variables, how long a visitor's theme choice lasts. A live preview changes as you pick. **Nothing changes on the site until Save.** Colors failing WCAG AA show a warning. Saved as the `marccent_defaults` option.
- **Tracking and cookies**:
  - Tracking codes (`marccent_tracking`): pasted HTML, placed in `<head>`, right after `<body>` opens, and before `</body>`.
  - Cookie consent (`marccent_consent`): Google Consent Mode v2 banner. The answer is cookie `marccent_consent`, six months. "Hold the tracking codes" keeps codes inert until the visitor accepts. A link to `#cookie-settings` reopens the banner.

**Admin changes.** Appearance → Editor (Site Editor) redirects to Themes; Appearance → Patterns replaces it. The toolbar's "Edit Site" is removed.

**Performance.** Removes emoji scripts, the generator tag, feed and oEmbed links, and the classic-theme styles.

### 3. Marccent Content (`marccent-content`, plugin)

**What it does.** Field groups (like ACF), custom post types, relations, a Loop block and a Field block, defined in the admin. The spec is kept in the database.

**Admin screens.**
- **Fields** (top menu): Field groups (list table, editor with a **Rules** box), Post types (administrators), JSON (the same spec as JSON), Sources (another site's API pulled in on **Pull now**).
- **Site content** (top menu): the groups that are "on the site" (for example Locations or Office), editable by anyone who can edit pages (capability `edit_pages`).

**Field types.** Text, several lines, rich text, number, URL, email, date, yes/no, color, image, gallery, file, location (OpenStreetMap lookup), choice, relation, data (JSON), opening hours.

**Rules on a field.** Required, Unique, Show only when, and **Private**.

**Loop block (`marccent/loop`).** Repeats its item for each post of a type, the posts related to the current one, the pages under a parent, or each row of a repeating group. Supports `where` filters, paging, and filters and search in the address bar.

**Field block (`marccent/field`).** One value of the current post, with a format. Also `{{ tokens }}` in any block text and block bindings.

**Post types "Only in wp-admin"** have no URL, archive, search or menu entry.

### 3a. Private fields (issue #62, Content PR #5): status and tests

**Status, verified:**
- PR #5 is **open** on GitHub: `marcoscenteno89/marccent-content` pull request 5, "A private field: edited beside the post, never shown on the page".
- Its head branch is **`claude/project-thread-1t553q`**, at commit **`4e63b8e`**. Main does not have it.
- Main is `a864dce`. Chrome must test with the branch installed, not main.

**What the code does (verified):**
- A **Private** toggle in Fields → Field groups → field → **Rules**. In JSON it is `"private": true`.
- A private value is **never** returned by a `{{ token }}`, the Field block, or a Loop's item (`mcc_value` returns an empty string for any user, logged in or not).
- Not in the page's JSON-LD.
- A private relation leads nowhere: no related titles or Loops through it.
- REST API: the field is in the response only for users who can edit the post. Logged-out REST calls don't get it.
- The field stays editable in the post's editor.

**Known gap, found on re-check (report it, don't fix it):** a Loop's **`where` filter still reads private fields**. `mcc_where_meta` (inc/blocks.php) builds a meta query on every field, private or not. So a Loop filtered by a private value (for example `revenue>1000000`) shows which posts match, even though the value itself is never shown. Likewise `mcc_where_row` reads the row data directly; a private field inside a repeating group is probably filtered the same way (not confirmed by running it). Show-if is not affected: it reads the value as empty.

**Install (Marcos or Code, not Chrome):** on wp.localhost, the Marccent Content plugin must be the `claude/project-thread-1t553q` checkout. Marcos or Code does this in the WSL copy of the repo, then reactivates the plugin. The exact path on Marcos's machine is not confirmed in the repos; Code should confirm it. Chrome only tests what is installed.

**Test steps (Chrome):**
1. Check the installed branch: Plugins → "Marccent Content" version 0.2.0; it should show the Private toggle in Fields → Field groups → a field's Rules. If the toggle is missing, stop and report: the branch isn't installed.
2. In Fields → Field groups, add a field with **Private** on, on a group for a post type. Save. Set a value on one post (as an editor).
3. **Logged out**, front end: the value appears nowhere on that post: not in the post text, not in a Field block, not in a `{{ field }}` token.
4. **Logged in as an administrator**, front end: the value still does not appear (same as step 3).
5. A Loop over that post type, with the field in the item: the field shows nothing for any user.
6. Logged-out `/wp-json/wp/v2/posts/<id>`: the field is absent.
7. Logged in as an editor, in the post's editor: the field is present and editable, and saving keeps it.
8. **Known-gap check:** a Loop on that post type with `where` on the private field (for example `<field>=<value>`). Record whether the matching posts show. Expected under the commit's stated rules: they should not; actual per the code: they will. Report what you see; do not judge it a pass or fail beyond stating what you observed.

### 4. Patterns and kits: now cloned and described

Both repos can be read (they are in the repo list). They are not WordPress plugins; they are inputs to the WordPress site.

- **`marccent-patterns`**: `patterns/` holds 14 HTML files (announcement, app-frame, back-to-top, bar-sparkline, bento, call-bar, call-to-action, footer, header-floating, header, hero, image-card, pricing, section-heading). Each is a pattern's reference markup, built from the theme's components. They are not installed on wp.localhost by themselves; the WordPress patterns live in `marccent-wp/patterns/`.
- **`marccent-kits`**: one kit, `kits/local-business/`, with `kit.cjs` (patterns, pages, sample rows) and `content.json` (field groups and post types). A kit is imported with **Tools → Marccent export** (Import). Chrome checks a kit only if Marcos has imported it on wp.localhost.

## Report format for Chrome

One line per check:

`<number>. <check> | PASS | FAIL | UNCLEAR | what you saw (URL, page, what was on screen)`

Examples:
- `3. Logged-out front end shows no private value | PASS | post 42 page shows no revenue text`
- `8. Loop where on private field | UNCLEAR | Loop shows 2 posts for revenue>1000000; not sure of the intended behaviour`

Keep it to what you saw. Do not guess at the cause. Send the report to Marcos.
