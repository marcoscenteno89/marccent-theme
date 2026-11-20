# Task 001: the T-018 widgets in marccent-blocks, on the next theme tag
Status: blocked
Repo: marccent-blocks
Issue: marccent-theme#17 (the theme side is done in PR #163, merge dd6aa19; the issue closes as "Done, not released")
Branch base: the repo's default branch
Give to: Code in marccent-blocks

## Goal

Bring the blocks that wrap the T-018 widgets onto the theme release that ships them. The widgets are now in marccent-theme master (PR #163). Blocks pins the theme by release tag, so it can use them only after a tag that contains them. The blocks are on a branch `claude/t018-blocks` (from issue #17's "Waiting on this" line). Finish them against the tag, not against master.

The widgets: Count up, Gauge (ring and speedometer), Radar, Card fan, Atom, Calendar, Clock (analog and flip faces).

## Why it is blocked

The next theme tag is `v1.0.0-rc.26`. Hub will cut it only after task 004 (#156, fonts base) merges to master, because master's fonts do not load without a host global and a tag now would push that bug into Blocks. Nothing here may pin a commit or a tag before rc.26 exists. Do not start until the Notes say rc.26 is tagged.

## Files (when open)

- `package.json` (the `marccent-theme` pin: a tag, via `npm run theme:update`, not a commit).
- The blocks' files for the widgets on `claude/t018-blocks`. Only the widget blocks. Do not touch other blocks.

## Exact steps (when open)

1. Read the tag in Notes (`v1.0.0-rc.26`). Confirm it exists: `git ls-remote --tags https://github.com/marcoscenteno89/marccent-theme | grep <tag>`.
2. Check out `claude/t018-blocks`, then `git merge --no-edit origin/<default branch>` only if the branch is behind. Never rebase or force-push a branch someone else made.
3. Pin the theme to that tag: `npm run theme:update` (or edit `package.json` by hand to `github:marcoscenteno89/marccent-theme#<tag>`, then `npm install`).
4. For each of the nine widgets, check the block's settings match `markup/settings.json` in the theme at that tag (the names and defaults). Write any mismatch in the PR body. Do not fix anything beyond the widgets.
5. Remove any `Co-Authored-By:` line naming a model from commit messages.
6. Run the checks below.
7. Push the branch. Open a PR into the default branch. Body starts with the two attribution lines, then `Part of marccent-theme#17`, then the settings check list, then the check output.

## Checks

- The repo's test command (`npm test`, if it has one). Paste the output.
- `npm run conformance` in marccent-theme at that tag is Hub's check, not this task's. Do not run it here.

## Chrome check (after the PR is merged, not in this task)

On wp.localhost, Chrome checks each of the nine widgets in the block editor and on the page: the block appears, its settings show, the front end renders it, and nothing overflows at phone width. Chrome reports to Marcos. Hub then sets this task's Status to `done`.

## Done when

- The PR pins the theme to the tag, the test output is in the body, and the settings list is in the body.
- Give Hub: the branch, the PR link, the output. Hub verifies CI and merges. Chrome checks after the merge.

## Notes

- Blocked until: `v1.0.0-rc.26` is tagged. rc.26 waits on task 004 (#156, fonts base), then Hub tags it (`docs/RELEASES.md`). Hub changes this Status to `open` in a docs PR and writes the tag here.
- Not in this task: marccent-html and marccent/next (marccent.com). Both are frozen until after 1.0 (PRODUCT-LINE.md 3.5). They keep their `components/widgets` copies until they unfreeze.
- Freeze applies (PRODUCT-LINE.md section 3). No new widget, setting or block.
