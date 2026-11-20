# Task 004: style fonts load without a host global (#156, from #155)
Status: open
Repo: marccent-theme
Issue: marccent-theme#156
Branch base: master
Give to: Code in marccent-theme

## Goal

Fix issue #156. PR #155 (merged at `cb63dce`) split the fonts per style: `scripts/build.mjs` writes `dist/fonts/<id>.css`, and `lib/fonts.js` links them. But `loadFonts()` returns early unless `globalThis.marccentFontsBase` is set, and nothing in this repo sets it. The old `@import` lines in `styles/designs.css` are gone. So a host that loads `dist/marccent.js` without setting the global gets no style fonts, and no error.

Keep #155's split. Fix three things, and keep role fonts out of the way.

## Files

- `lib/fonts.js` (the base URL and the early return).
- `core/apply.js` (only if it passes the base in).
- `scripts/conformance.mjs` or `scripts/markup.mjs` (the font check; use whichever already checks markup/settings, and say which in the PR).
- `styles/designs/*.css` and `styles/designs.css` only if regenerating them is needed (it should not be; say so if it is).
- `dist/` (rebuilt with `npm run build`).
- `CHANGELOG.md` (one entry under Unreleased).

Do not change `markup/fonts.json` or the registry.

## Exact steps

1. `git fetch origin` and `git checkout -b claude/fonts-base-156 origin/master`.
2. **Default base.** `loadFonts` must find `dist/fonts/` without a host global. Use the URL of the script that is loading (`import.meta.url` or `document.currentScript`, whichever the build allows) to resolve `fonts/` beside `marccent.js`. Keep `globalThis.marccentFontsBase` as an override: if the host sets it, use it. Write the chosen approach and why in the PR body. If neither works in the build, stop and report; do not guess.
3. **Role fonts stay inert.** `core/apply.js` sets `--font-*` variables from `theme.fonts` (body, heading, display, mono). Keep that code path as it is, but do not add any new setting for it. The site-setting question belongs to #21 (task 003). Say in the PR body which lines are the role-font path.
4. **The check.** Add one check to `npm test` that fails when a design style in `styles/themes/*.css` names a font id (`DESIGN_FONTS` in `lib/fonts.gen.js`) that has no `dist/fonts/<id>.css` after the build, or when a registry font has no file. The check runs against `dist/`, so it must run after `npm run build`. If `npm test` does not build first, put the check in `npm run build`'s own output step and say so in the PR body.
5. **Changelog.** One entry under Unreleased: what loads without the host global, and the check.
6. Run the checks below.
7. Push `claude/fonts-base-156`. Open a PR into `master`. Body starts with the two attribution lines, then `Fixes #156`, then the check output, then a short note: "Latin-only subsets: Cyrillic and Vietnamese text falls back to the system font. Not changed here; Marcos decides (see Notes)."

## Checks

- `npm test`. Paste the output. Expected: exit 0.
- `npm run build`, then `git diff --exit-code -- dist` after a second build. Paste both outputs. The second diff must be empty.
- A node check that the new default base resolves: load `dist/marccent.js` in a headless browser or JSDOM, with no `marccentFontsBase` set, and print the `<link data-font>` elements added for one style (for example `minimal`). Paste the output.

## Done when

- A host that never sets `marccentFontsBase` gets `<link data-font>` elements for a style's fonts.
- The override still works when the host sets the global.
- The new `npm test` check fails on a deliberately broken style (paste that output too, then revert the break).
- Give Hub: the branch, the PR link, the outputs above. Hub verifies CI and merges. Chrome then checks the render on wp.localhost (see Notes).

## Notes

- **Chrome render check (after merge, not in this task).** On wp.localhost, three design styles (for example `minimal`, `brutalism`, `art-deco`): the heading font renders, not the fallback. Chrome reports to Marcos.
- **Marcos decision (not in this task):** keep the latin-only subsets (smaller files, Cyrillic and Vietnamese fall back), or add the other subsets back. Write the question into the PR body; do not decide it here.
- Freeze applies (PRODUCT-LINE.md section 3). Do not add a font, a setting or a style.
