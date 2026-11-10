# To do: django-marccent

The rules for this list are in [PRODUCT-LINE.md §8](../PRODUCT-LINE.md#8-work-lists-ticketsmd-and-each-projects-todomd):
work fixed here only; anything the theme fixes is a ticket in marccent-theme's
[TICKETS.md](../TICKETS.md), linked under Waiting on.

## Bugs

## Requests

- [ ] **Markup test: use the theme's conformance check** — `tests/render_markup.py` prints the cases for marccent-theme's `npm run conformance`; once a release ships `scripts/conformance.mjs`, the comparison in `tests/test_markup.py` can go. Not covered yet: menu, toggleButton, modal, drawer, accordion, tooltip, popover, alert, map. (found 2026-11-07)

## Waiting on

- [ ] **[T-024](../TICKETS.md)** — typography set on the server: a `typeset` template filter (found 2026-11-08)
- [ ] **[T-025](../TICKETS.md)** — Prices: a `marccent_price` tag (found 2026-11-08)
- [ ] **[T-026](../TICKETS.md)** — Dates and times: a tag (found 2026-11-08)
- [ ] **[T-027](../TICKETS.md)** — Contact line: a tag (found 2026-11-08)
- [ ] **[T-029](../TICKETS.md)** — the plugin forms read the theme's settings file instead of defining their own (found 2026-11-08)

## After 1.0

- [ ] **Admin tools for the admin pattern** — django is an output with an admin (marccent-theme `markup/outputs.json`), so each kind of admin data needs a tool here; only menus have one (django CMS). Missing: rows (Accordion, Carousel, Map's places…), site (the site's details for NavBar, Footer), theme (the site's theme, today `settings.MARCCENT` in code), keys (Maps, the spam check), entries (Form). `npm run conformance` in the theme lists them. Moves to Requests if a launch site needs Django. (found 2026-11-07)

## Notes
