# Task 002: finish the widgets (#17, T-018)
Status: done (PR #163, merge dd6aa19; Fixes #17, done not released)
Repo: marccent-theme
Issue: marccent-theme#17
Branch base: master
Give to: Code in marccent-theme

## Goal

Finish issue #17 (T-018: Calendar, count-up numbers, gauge / radar / speedometer, atom, clocks, flip clock, card fan). Marcos ruled 2026-11-12 that #17 is in 1.0. The work exists on the local branch `claude/1.0-integration` as two commits, `b5856ab` (the widgets) and `f6e5fd2` (the flip clock digit size). Bring them onto master and finish what #17 lists that they don't yet cover.

## Files

From `b5856ab`: `CHANGELOG.md`, `components/ui/calendar.js`, `components/ui/clock.js`, `components/ui/count-up.js`, `components/ui/gauge.js`, `components/ui/radar.js`, `components/visuals/effects.js`, `components/widgets/card-fan.js`, `core/components.js`, `core/count-up.js`, `dist/marccent.css`, `dist/marccent.js`, `markup/cases.json`, `markup/reference.json`, `markup/settings.json`, `scripts/conformance.mjs`, `scripts/markup.mjs`, `styles/components.css`, `styles/components/calendar.css`, `styles/components/card-fan.css`, `styles/components/clock.css`, `styles/components/gauge.css`, `styles/components/radar.css`.

From `f6e5fd2`: `components/ui/clock.js`, `dist/marccent.css`, `styles/components/clock.css`.

## Exact steps

1. `git fetch origin` and `git checkout -b claude/widgets-t018 origin/master`.
2. `git cherry-pick b5856ab`. Then `git cherry-pick f6e5fd2`.
   - **Conflict in `dist/`** (for example `dist/marccent.js`): do not hand-merge it. Run `git checkout --ours dist/` (master's version), then continue. `dist/` is rebuilt in step 8. Say in the PR body that `dist/` was rebuilt after a conflict.
   - **Conflict in any source file** (anything outside `dist/`): stop and report the file names. Do not guess a resolution.
3. Remove any `Co-Authored-By:` line naming a model from each commit message (`git commit --amend` on the last commit, and reword the earlier one with `git rebase -i` only if it's needed; if not, report it). The repo rules forbid model names in commits.
4. Read issue #17 on GitHub. Make a list of every widget it names. For each one, check the branch: a component file, its CSS, its entries in `markup/reference.json`, `markup/settings.json` and `markup/cases.json`. Write the list in the PR body as a table: widget, done (yes/no), where.
5. For each widget marked "no": write it in the PR body as "left". Do not build it in this task. Issues are for the rest.
6. Resolve any source-file conflicts from step 2 only if the resolution is obvious from the commit's own intent. Otherwise stop and report.
7. Run the checks below. Fix only failures caused by these two commits. Report any other failure.
8. Rebuild `dist/` with `npm run build`, run `npm run build` again, then `git diff --exit-code -- dist`. It must print nothing. Commit the rebuilt `dist/`.
9. Push `claude/widgets-t018` and open a PR into `master`. Body starts with the two attribution lines, then `Fixes #17` only if the table shows every widget in #17 done. If not, say `Part of #17` and list what is left.

## Checks

- `npm test`. Paste the output. Expected: exit 0.
- `npm run build`. Paste the output. Then `git diff --exit-code -- dist` after the build, and say whether the commit set `dist/` correctly. CI fails if `dist/` is out of date.
- `npm run conformance`. Paste the output. Expected: exit 0.

## Done when

- The PR into master has the widget table in its body, and `npm test`, `npm run build` and `npm run conformance` output is pasted.
- The width rule holds (PRODUCT-LINE.md section 4, rule 9): conformance passes, and no widget sets its own width or outer margin except where the rule allows it.
- Give Hub: the branch, the PR link, the table, and the check output. Hub verifies CI and merges.

## Notes

- The freeze (PRODUCT-LINE.md section 3) applies. Do not add any widget that is not in #17. If you see something else that is missing, write it in the PR body as a note. Do not build it.
- The flip clock sizing is `f6e5fd2`. Keep it in this PR; do not split it out.
- Browser checks for these widgets are not part of this task. Chrome checks them after the PR is merged, on wp.localhost.
