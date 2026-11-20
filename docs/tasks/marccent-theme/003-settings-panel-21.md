# Task 003: SettingsPanel generated from settings (#21, Option A), with the role fonts in site settings
Status: blocked
Repo: marccent-theme
Issue: marccent-theme#21
Branch base: master
Give to: Code in marccent-theme

## Goal

Finish issue #21 (T-022: Admin and editor screens are hand-built) with Option A: the theme's `SettingsPanel` is generated from the settings files, and each adapter passes only its own controls. Marcos ruled 2026-11-12 that #21 is in 1.0.

Marcos decided on 2026-11-20 that the four role fonts (body, heading, display, mono) live in the site settings, so the panel generates their controls like every other setting. This replaces the ad-hoc `theme.fonts` path that PR #155 added to `core/apply.js`.

The work is on the local branch `claude/1.0-integration`: `948b6a4` (settingsFields and SettingsPanel) and `d676305` (site-wide settings in `markup/site-settings.json`, `lib/palette.js`, `server/palette.php`, `scripts/palette.mjs`, plus a `package.json` change). `d676305` is the file the role fonts go into.

## Why it is blocked

Blocked until `v1.0.0-rc.26` is tagged. rc.26 ships PR #166 (task 004, #156). Task 005 (`docs/tasks/marccent-theme/005-release-rc26.md`) is the release PR, and Code does it first. Do not start this task until the Notes say rc.26 is tagged.

## Role-font entries in the site settings

Add four entries to `markup/site-settings.json` under `settings`, one per role. Each is a registry font id from `markup/fonts.json`, or empty for the style's own font:

- `fontBody`: `{"type": "text", "about": "The body font: a registry font, or empty for the design style's", "choicesFrom": "fonts", "sanitize": "class"}`
- `fontHeading`: the same, `about`: "The heading font: a registry font, or empty for the design style's"
- `fontDisplay`: the same, `about`: "The display font: a registry font, or empty for the design style's"
- `fontMono`: the same, `about`: "The monospace font: a registry font, or empty for the design style's"

Use the field names above exactly. The apply step below reads them by these names.

`choicesFrom: "fonts"` is a new source. The settings panel reads the choice list from the registry (`markup/fonts.json`, its keys). Add it to the same place `"designs"` and `"hovers"` are read from. Look for `choicesFrom` in `components/theme/settings-panel.js` and `scripts/conformance.mjs`.

## Apply step

1. In `core/apply.js`, the line `const roles = theme.fonts ?? defaults.fonts ?? {};` (from #155) is replaced. The roles come from the same object as `theme.design`, the site settings. Find where `theme.design` is built (`grep -rn "design" core/ lib/ | head`) and read the four `font*` keys from it. Map them to the roles: `fontBody` to `body`, `fontHeading` to `heading`, `fontDisplay` to `display`, `fontMono` to `mono`.
2. Keep `fontVars`, `fontsFor` and `loadFonts` in `lib/fonts.js` as they are. Only the source of `roles` changes.
3. Remove the `defaults.fonts` fallback. If the defaults file has no `fonts` key, nothing is needed.
4. If the theme object has no `font*` keys yet, add them there. Report the exact path you find. Do not guess a path.

## Files

From `948b6a4`: `CHANGELOG.md`, `components/theme/settings-panel.js`.
From `d676305`: `CHANGELOG.md`, `components/theme/settings-panel.js`, `lib/palette.js`, `markup/site-settings.json`, `package.json`, `scripts/palette.mjs`, `server/palette.php`.
New: `markup/site-settings.json` (the four `font*` entries above), `core/apply.js` (the apply step), `lib/fonts.js` only if the `roles` source needs it, `scripts/conformance.mjs` (the `choicesFrom: "fonts"` source).

Do not change `docs/PRODUCT-LINE.md`, even though `d676305` touches it. That file is a rule file. Leave that hunk out of the PR and say so in the PR body.

## Exact steps

1. `git fetch origin` and `git checkout -b claude/settings-panel-t022 origin/master`.
2. `git cherry-pick 948b6a4`. Then `git cherry-pick d676305`, leaving out the `docs/PRODUCT-LINE.md` hunk: `git checkout origin/master -- docs/PRODUCT-LINE.md` after the pick, then amend.
3. If a conflict appears in `lib/palette.js` or `server/palette.php`, stop and report the file names. Do not guess.
4. Remove any `Co-Authored-By:` line naming a model from the commit messages (the repo rules forbid model names).
5. Add the four `font*` entries and the `choicesFrom: "fonts"` source (see Role-font entries).
6. Do the apply step (see Apply step).
7. Read issue #21. Check the panel against Option A: every setting in `markup/site-settings.json` and `markup/settings.json` shows in the panel with the right control type. Adapters get a slot for their own controls and nothing else. Write any gap in the PR body. Do not fill the gap in this task.
8. Run the checks below.
9. Push `claude/settings-panel-t022`. Open a PR into `master`. Body starts with the two attribution lines, then the gap list, then `Part of #21`. Say `Fixes #21` only if the gap list is empty.

## Checks

- `npm test`. Paste the output. Expected: exit 0.
- `npm run conformance`. Paste the output. Expected: exit 0, and the four `font*` settings pass the settings check (type, sanitize, choices).
- `npm run build`, then `npm run build` again, then `git diff --exit-code -- dist`. Paste the output. The second diff must be empty.
- Show that `theme.fonts` no longer appears: `git grep -n "theme.fonts" -- core lib`. Paste the output. Expected: no lines.

## Done when

- The PR into master has no change to `docs/PRODUCT-LINE.md`, the four `font*` entries are in `markup/site-settings.json`, `core/apply.js` reads them, `theme.fonts` is gone, and the check output is pasted.
- The gap list is in the PR body.
- Give Hub: the branch, the PR link, the gap list, the check output. Hub verifies CI and merges.

## Chrome check (after the PR is merged, not in this task)

On wp.localhost, with the site settings in wp-admin:
1. Set the body font to a registry font that differs from the design style's (for example `fraunces`). The body text renders in it, not the style's font.
2. Set the heading font to another (for example `bangers`). The headings render in it.
3. Clear both. The style's own fonts come back.
4. The page's `<head>` has a `<link data-font>` for each font chosen, and none for an unchosen one.

Chrome reports to Marcos. Hub then sets this task to `done`.

## Notes

- Blocked until `v1.0.0-rc.26` is tagged (see Why it is blocked). Hub changes this Status to `open` in a docs PR after the tag, and writes the tag here.
- Freeze applies (PRODUCT-LINE.md section 3). The four role fonts are the only new settings. Anything beyond #21 is an issue, not part of this change.
- The Decisions line for this choice is in PRODUCT-LINE.md section 9 (added in the same docs PR as this task).
