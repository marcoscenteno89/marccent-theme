# Marccent docs

The one home for the product line's rules and every project's work list. The other projects keep none of their
own: their `docs/README.md` and `CLAUDE.md` link here.

- [PRODUCT-LINE.md](PRODUCT-LINE.md): the rules (stages, the freeze, components, settings, work lists, how Claude works).
- [TICKETS.md](TICKETS.md): what the theme fixes, and the tickets the projects wait on.
- [PATTERNS.md](PATTERNS.md): the patterns, with their parts and markup.
- [SITES.md](SITES.md): every site and its stage.
- `todo/`: each project's list (PRODUCT-LINE.md section 8):
  [marccent-blocks](todo/marccent-blocks.md), [marccent-content](todo/marccent-content.md),
  [marccent-wp](todo/marccent-wp.md), [django-marccent](todo/django-marccent.md),
  [marccent-local](todo/marccent-local.md) (retired).

`npm run todos` checks the lists; `npm run conformance` the markup and settings. Both are in `npm test`.
