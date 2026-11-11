# Kits

The Kits stage's list (PRODUCT-LINE.md section 1): every kit, what it's for and where it stands. A kit is a bundle
a site imports to become a kind of site (a local business, a portfolio): its field groups and post types, the
patterns that show their data, its starter pages and sample rows. It adds no code: everything in it is made with the
tools people have (Fields, the block editor), so anyone can make one with Tools → Marccent export and share it.

Each kit is a folder in the **marccent-kits** repository, built into one file people import. One row per kit here; a
new kit is one more row, entering at Wanted (its issue, labeled `project: marccent-kits`: PRODUCT-LINE.md section 8).

## The file

A kit is a Marccent export file (Tools → Marccent export, Marccent Blocks' `inc/export.php`) with a `kit` header:

```json
{
  "marccent": 1,
  "kit": {
    "name": "local-business",
    "title": "Local business",
    "output": "wp",
    "about": "A business that serves an area: its details, services, places, hours, reviews and questions.",
    "version": 1,
    "components": [ "Section", "Grid", "Card", "Button", "Map", "Accordion" ],
    "needs": []
  },
  "parts": {
    "content": { "groups": {}, "types": {} },
    "patterns": { "<slug>": { "title": "", "categories": [], "description": "", "keywords": [], "content": "<!-- wp:… -->" } },
    "pages": { "<slug>": { "title": "", "parent": "", "content": "<!-- wp:… -->" } },
    "site_content": { "<group>": {} }
  }
}
```

- **`kit`**: `name` (its folder, full words, hyphens), `title`, `output` (`markup/outputs.json`: wp today),
  `about` (one line), `version` (up by one when it changes; after 1.0 a kit's parts change only by adding, as
  settings do: section 5.2), `components` (every theme component its patterns and pages use, `markup/settings.json`'s
  names), `needs` (other kits it builds on: Contractor projects needs Local business).
- **`parts`**, in the order they import:
  - `content`: field groups and post types in Marccent Content's spec (Fields → JSON), **added to the site's**: a
    group or type the site already has keeps the site's;
  - `patterns`: block patterns that show the kit's data (a look-only pattern isn't a kit's: it's in
    marccent-patterns, [PATTERNS.md](PATTERNS.md));
  - `pages`: starter pages, as block content, each with its slug and parent;
  - `site_content`: sample rows for the site's groups, so the patterns show something until the site's own replace
    them.
- **Names people see are full words** (`question`, not `q`), as everywhere (section 5.4).

## The check

`npm run kits` in marccent-kits builds each kit's file and fails when:

- the header is missing a field, `output` isn't one of `markup/outputs.json`'s, or a kit in `needs` doesn't exist;
- a block in a pattern or page isn't one Marccent Blocks, Marccent Content or WordPress has, or a class isn't one the
  theme defines (as marccent-patterns' check);
- a component in `components` isn't in `markup/settings.json`, or one its blocks use is missing from it;
- a group, field or post type name isn't full words.

Once Marccent Content's import adds a kit's groups to a site's instead of replacing them, the check also imports each
kit into a fresh WordPress and fails when a group, type, pattern or page doesn't appear.

## The kits

| Kit | Output | For | Needs | Stage | Notes |
|---|---|---|---|---|---|
| Local business | wp | a business serving an area: details, services, service areas and cities, locations, hours and closed days, reviews, questions, the call bar | | building | finishes Marccent Local (wp's TODO.md); its groups are rc-imp's; marccent-wp's hero, services, locations, faq and contact patterns move here |
| Portfolio | wp | an agency or freelancer: projects (client, year, role, tools, images), case study pages, testimonials | | Wanted (after 1.0) | with Local business's services it's a web design site |
| CRM | wp | contacts, companies, deals and activities, each a Data table; form entries become contacts | | Wanted (after 1.0) | the wp site's CRM (`wp/sites/wp/content/crm.php`) as a kit |
| Contractor projects | wp | projects per service and area, before and after photos (Compare), an estimate form with photos | Local business | Wanted (after 1.0) | |
| Restaurant | wp | a menu (categories, then items: price, dietary tags), hours, reservations | | Wanted (after 1.0) | needs Price (T-025) |
| Events | wp | events (date, venue, tickets), the next one's countdown | | Wanted (after 1.0) | needs Date (T-026) |
| Team | wp | people, values and the company's history | | Wanted (after 1.0) | the history needs Timeline item (T-034) |
| Product landing | wp | a product or service sold by plan: features, plans and their specs compared, logos, questions | | Wanted (after 1.0) | web hosting's plans; needs T-013 (logos) and T-016 (monthly / yearly) |
| Help center | wp | articles in categories, search, questions | | Wanted (after 1.0) | web hosting's and a product's support pages |
