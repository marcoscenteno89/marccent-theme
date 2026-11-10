# To do: marccent-wp

**Belongs to: marccent-wp.** Every item here is fixed in the marccent-wp repo.

The rules for this list are in [PRODUCT-LINE.md §8](../PRODUCT-LINE.md#8-work-lists-ticketsmd-and-each-projects-todomd):
work fixed here only; anything the theme fixes is a ticket in marccent-theme's
[TICKETS.md](../TICKETS.md), linked under Waiting on.

## Bugs

- [ ] **Two hero images with `fetchpriority="high"`** — `inc/performance.php`'s (moved here from Marccent Local) first-image rule can mark one image while WordPress marks another. Drop ours for core's, or skip it when core has marked one. (found 2026-11-05)

## Requests

- [ ] **A Footer block pattern** (PATTERNS.md's Footer: the brand and a line, link columns, the legal row and social icons) for `parts/footer.html`, today only the site's name. (found 2026-11-10)
- [ ] **A header edited in the Site Editor keeps the retired Navbar block** (saved in the database, not `parts/header.html`): it shows as an unsupported block until the template part is reset to the theme's. (found 2026-11-10)

## Waiting on

- [ ] **[T-032](../TICKETS.md)** — the Header pattern's folded menu opens in a popover panel on phones, not full width under the bar (found 2026-11-10)
- [ ] **[T-002](../TICKETS.md)** — the cookie banner is printed from PHP (`inc/tracking.php`, `wp_footer`; RULES.md A6) with inline CSS and scripts: once the theme's consent component ships, a block in the footer template part replaces it (found 2026-11-05)
- [ ] **[T-003](../TICKETS.md)** — the Call bar pattern (Call and Get a quote buttons fixed to the bottom on phones), replacing Marccent Local's `inc/callbar.php`. Marccent Local is being removed without waiting for it (2026-11-10), so sites have no call bar until this ships (found 2026-11-05)
- [ ] **[T-022](../TICKETS.md)** — the theme options page is hand-built (`inc/theme-options.php` inline CSS, `assets/theme-options.js`) (found 2026-11-08)

## After 1.0

## Notes
