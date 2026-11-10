# To do: marccent-local

**Belongs to: marccent-local.** Every item here is fixed in the marccent-local repo.

The rules for this list are in [PRODUCT-LINE.md §8](../PRODUCT-LINE.md#8-work-lists-ticketsmd-and-each-projects-todomd):
work fixed here only; anything the theme fixes is a ticket in marccent-theme's
[TICKETS.md](../TICKETS.md), linked under Waiting on.

**Retired (2026-11-06)**: no new work here. What's left goes when the tickets below ship, then the plugin is removed from
the repo once no site has it active (crm-sample has it on, unused).

## Bugs


## Requests

- [ ] **The hours as shortcodes** (`[business_hours]`, `[open_now]`, `[business_locations]`) — markup made in PHP that the block editor can't change (RULES.md A9). Marccent Content's Opening hours field and the Field block replace them; before removing them, check the sites' pages for the shortcodes. (found 2026-11-05)
- [x] **The business's schema** (`inc/schema.php`) — not moved, decided 2026-11-10 (Marcos): no plugin builds a business schema from a Business group; every field group makes its own schema (Marccent Content's `"schema"` mapping), so this goes with the plugin. (found 2026-11-08)
- [ ] **The one-time moves** (`inc/settings.php`: Settings → Business into the Site content groups; `inc/areas.php`: `mcl_*` meta keys to full words) — move them to Marccent Content, or confirm every site has run them, before removing the plugin. (found 2026-11-08)
- [ ] **The Map's default place** (the `marccent_blocks_map` filter, still `lat`/`lng`) — an empty Map block gets the business's pin from here; the sites' Map blocks use `{{ business.latitude }}` tokens instead before removing the plugin. (found 2026-11-08)
- [ ] **Speed pass, not committed** (peer review first) — the schema's site-wide part built once (`mcl_schema_site()`, the `mcl_schema` transient, cleared by `mcl_schema_forget()`); service pages in one query; the flush flag and options read without a query. Also a fix: draft, private or trashed service pages no longer reach the schema or `llms.txt`; check it against a client site, since it changes their output. (found 2026-11-05)
- [x] **Full words in Settings → Business's keys** (RULES.md A5) — done in 0.4.0, where the business became Site content's field groups (`latitude`, `monday`, `postal_code`, `questions_heading`, `call_to_action_heading`…), every list a group's rows. (found 2026-11-05)

## Waiting on

- [ ] **[T-003](../TICKETS.md)** — the phone call bar (`inc/callbar.php`, printed in `wp_footer`) becomes marccent-wp's Call bar pattern, then the Call bar group goes. Doesn't block removing the plugin (Marcos, 2026-11-10): it's queued in marccent-wp's TODO.md, and sites have no call bar until it ships (found 2026-11-05)

## After 1.0

## Notes

- **The schema cache's limits**: it doesn't see posts changed by direct SQL, or a logo replaced in place under the
  same ID; it rebuilds on every request if `home_url` changes per request (`WP_HOME` from the request's host).
