# Sites

The products: every site built on Marccent, its output, what builds it and where it stands (the Sites stage,
PRODUCT-LINE.md). One row per site; a new site is one more row, built from the template (wp/new-site-template) or the
Next app. Stages: **building**, **test** (a site for testing the product line, never live), **live**, **frozen** (no
work until 1.0, then brought up to it once: PRODUCT-LINE.md 3.5).

| Site | Output | Built with | Address | Stage | Notes |
|---|---|---|---|---|---|
| marccent.com | html | marccent/next (the theme's React components) | marccent.com (not deployed yet) | building | 1.0 needs it live; the html test (3.6) |
| wp site | wp | Marccent Blocks, Marccent Content, marccent-wp | wp.localhost | test | the WordPress test: the kitchen sink (`wp/sites/wp/content/kitchen-sink.php`), the CRM (`crm.php`, `views.php`) |
| rc-imp | wp | Marccent Blocks, Marccent Content, marccent-wp | rc-imp.localhost | frozen | a client site, content in `wp/sites/rc-imp/content`; its own CSS left (T-019 to T-021) |
| rimrock | wp | Marccent Blocks, Marccent Content, marccent-wp | rimrock.localhost | frozen | no content folder yet |
| cr-landscape | wp | Marccent Blocks, Marccent Content, marccent-wp | cr-landscape.localhost | frozen | no content folder yet |
| marccent-web | wp | Marccent Blocks, Marccent Content, marccent-wp | marccent-web.localhost | frozen | no content folder yet |
| the 2024 site | wp | its own (before Marccent) | localhost | frozen | the 2024 redesign, the `wordpress` service |
| Fernway | wp, html | its own WordPress and `html/` | its own compose project | frozen | tickets T-009 to T-016 |
