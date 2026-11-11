# Marccent docs

The one home for the product line's rules. The other projects keep none of their own: their `docs/README.md` and
`CLAUDE.md` link here. The work itself is GitHub Issues in marccent-theme, on the
[Marccent board](https://github.com/users/marcoscenteno89/projects/1) (PRODUCT-LINE.md section 8).

- [WORKING.md](WORKING.md): how Claude works in every project; each project's `CLAUDE.md` imports it and names
  only its issue label, so a change to how Claude works is one edit here.
- [PRODUCT-LINE.md](PRODUCT-LINE.md): the rules (stages, the freeze, components, settings, issues, how Claude works).
- [TICKETS.md](TICKETS.md): the old ticket IDs (T-, B-, P-) and the issues they became, and the tickets done before.
- [PATTERNS.md](PATTERNS.md): the patterns, with their parts; their markup is in marccent-patterns.
- [KITS.md](KITS.md): the kits, their file and their check; the kits themselves are in marccent-kits.
- [SITES.md](SITES.md): every site and its stage.
- [projects.json](projects.json): every project built on the theme (Blocks, Content, WP, the patterns, the kits, Django,
  marccent.com, marccent-html), what each reads from the theme, how it pins it and whether it's active, frozen or retired.
  `npm run affected` reads it to say which projects to check after a theme change.

`npm run status` says which projects are behind the theme (from each one's pin) and on what; `npm run affected`
lists the projects a change reaches; `npm run conformance` checks the markup and settings (in `npm test`).
