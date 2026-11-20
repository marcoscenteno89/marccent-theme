# Task 003: SettingsPanel generated from settings.json (#21, Option A)
Status: blocked
Repo: marccent-theme
Issue: marccent-theme#21
Branch base: master
Give to: Code in marccent-theme

## Goal

Finish issue #21 (T-022: Admin and editor screens are hand-built) with Option A: the theme's `SettingsPanel` is generated from `markup/settings.json`, and each adapter passes only its own controls. Marcos ruled 2026-11-12 that #21 is in 1.0.

The work is on the local branch `claude/1.0-integration`: `948b6a4` (settingsFields and SettingsPanel, the first half) and `d676305` (the site-wide settings in `markup/site-settings.json`, `lib/palette.js`, `server/palette.php`, `scripts/palette.mjs`, plus a `package.json` change).

## Why it is blocked

`d676305` adds site-wide settings, and the role fonts (body, heading, display, mono) that PR #155 added on master also belong there. Marcos chose on 2026-11-20 to keep #155 and fix it (issue #156, task 004). The open question left is whether role fonts (`theme.fonts`) are a site setting in `d676305`'s settings, or stay out until #21 decides them.

- Decision needed from Marcos: where the role-font settings live. Hub asks him once this task is opened.
- Once that is decided, Hub changes this Status to `open` in a docs PR.

## Files (for when the task is open)

From `948b6a4`: `CHANGELOG.md`, `components/theme/settings-panel.js`.
From `d676305`: `CHANGELOG.md`, `components/theme/settings-panel.js`, `lib/palette.js`, `markup/site-settings.json`, `package.json`, `scripts/palette.mjs`, `server/palette.php`.

Do not change `docs/PRODUCT-LINE.md`, even though `d676305` touches it. That file is a rule file and changes only with Marcos's OK. Leave that hunk out of the PR and say so in the PR body.

## Exact steps (when open)

1. `git fetch origin` and `git checkout -b claude/settings-panel-t022 origin/master`.
2. `git cherry-pick 948b6a4`. Then `git cherry-pick d676305`, leaving out the `docs/PRODUCT-LINE.md` hunk (use `git checkout --patch` style: take the commit, then `git checkout origin/master -- docs/PRODUCT-LINE.md`, and amend). If a conflict appears in `lib/palette.js` or `server/palette.php`, stop and report it.
3. Remove any `Co-Authored-By:` line naming a model from the commit messages (the repo rules forbid model names).
4. Read issue #21. Check the panel against Option A: every setting in `markup/settings.json` shows in the panel with the right control type; adapters get a slot for their own controls and nothing else. Write any gap in the PR body. Do not fill the gap in this task.
5. Run the checks below.
6. Push `claude/settings-panel-t022`. Open a PR into `master`. Body starts with the two attribution lines, then the gap list, then `Part of #21` (only say `Fixes #21` if the gap list is empty).

## Checks

- `npm test`. Paste the output. Expected: exit 0.
- `npm run build`, then `git diff --exit-code -- dist`. Paste the output.
- `npm run conformance`. Paste the output.

## Done when

- The PR into master has no change to `docs/PRODUCT-LINE.md`, the check output is pasted, and the gap list is in the body.
- Give Hub: the branch, the PR link, the gap list, the check output.

## Notes

- Blocked until: Marcos decides where the role-font settings live (see Why it is blocked), and Hub moves this task to `open` in a docs PR. Task 004 (#156) lands first, since it changes how fonts load.
- Freeze applies (PRODUCT-LINE.md section 3). Anything beyond #21 is an issue, not part of this change.
