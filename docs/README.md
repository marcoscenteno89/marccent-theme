# Marccent docs

The one home for the product line's rules and every project's work list. The other projects keep none of their
own: their `docs/README.md` and `CLAUDE.md` link here.

- [WORKING.md](WORKING.md): how Claude works in every project; each project's `CLAUDE.md` imports it and holds
  only its work list, so a change to how Claude works is one edit here.
- [PRODUCT-LINE.md](PRODUCT-LINE.md): the rules (stages, the freeze, components, settings, work lists, how Claude works).
- [TICKETS.md](TICKETS.md): belongs to marccent-theme: what the theme fixes, and the tickets the projects wait on.
- [PATTERNS.md](PATTERNS.md): the patterns, with their parts and markup.
- [SITES.md](SITES.md): every site and its stage.
- [projects.json](projects.json): every project built on the theme (Blocks, Content, WP, Django, marccent.com,
  marccent-html, Local), what each reads from the theme, how it pins it and whether it's active, frozen or retired.
  `npm run affected` reads it to say which projects to check after a theme change.
- `todo/`: each project's list, one file per repo, its first lines saying which repo it belongs to (PRODUCT-LINE.md section 8):
  [marccent-blocks](todo/marccent-blocks.md), [marccent-content](todo/marccent-content.md),
  [marccent-wp](todo/marccent-wp.md), [django-marccent](todo/django-marccent.md),
  [marccent-local](todo/marccent-local.md) (retired).

`npm run status` says which projects are behind the theme (from each one's pin) and on what; `npm run affected`
lists the projects a change reaches; `npm run todos` checks the lists; `npm run conformance` the markup and settings. Both are in `npm test`.
