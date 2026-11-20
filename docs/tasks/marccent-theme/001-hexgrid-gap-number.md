# Task 001: HexGrid's gap is a number, not gap classes (#152)
Status: done (PR #160, merge aa93db3)
Repo: marccent-theme
Issue: marccent-theme#152
Branch base: master
Give to: Code in marccent-theme

## Goal

Fix bug #152: the HexGrid's `gap` setting lists Grid's gap classes, but HexGrid takes a number on its scale. The fix is already written on the local branch `claude/1.0-integration` as commit `83cd3c1`. Bring that one commit onto master as its own PR.

## Files

Only the files that commit touches (check with `git show --stat 83cd3c1`):
- `markup/settings.json` (the HexGrid `gap` setting: a number, not a choice list).
- `CHANGELOG.md` (one entry under Unreleased).

Do not touch any other file.

## Exact steps

1. `git fetch origin` and `git checkout -b claude/hexgrid-gap-number origin/master`.
2. `git cherry-pick 83cd3c1`.
3. Open the commit message with `git log -1 --format=%B`. Remove the line that starts with `Co-Authored-By:` (it names a model, and the repo rules forbid model names in commits). Then run `git commit --amend` with the message edited, leaving the subject line as it is.
4. Run the checks in the Checks section. If `markup/settings.json` fails conformance, stop and report the output. Do not guess a fix.
5. Push: `git push -u origin claude/hexgrid-gap-number`.
6. Open a PR into `master`. Its body starts with the two attribution lines the session gives, then `Fixes #152`, then the check output (see Checks).

## Checks

- `npm test`. Paste the output. Expected: exit 0.
- `npm run build`, then `git diff --exit-code -- dist`. Expected: no output (this commit does not touch dist). If dist changes, stop and report.

## Done when

- The PR into master contains only the two files above, its body says `Fixes #152`, and it has the check output.
- The commit message has no model name.
- Give Hub: the branch name, the PR link, and the output of both checks. Hub verifies CI and merges.

## Notes

- This is the only change in this task. If anything else in `83cd3c1` fails, report it. Do not fix it here.
