# Task 008: the code-side names from the 2026-11-28 term decision
Status: open
Repo: marccent-theme
Issue: none (wording and key renames only; Hub opens one if Marcos wants it tracked)
Branch base: master
Give to: Code in marccent-theme

## Goal

The terms decision (PRODUCT-LINE.md section 9, 2026-11-28, the glossary) names four things in the code and the data that
still use the old names. Rename them so the code matches the docs. Nothing else changes: no behavior, no new feature.

1. The `stage` key in `docs/projects.json` becomes `status`. Its values stay (`active`, `frozen`, `retired`).
2. The file `markup/tunes.json` becomes `markup/common-settings.json`. Its content stays the same.
3. The `frozen` text in `markup/outputs.json` (the django output) says "until 1.0 is live". It becomes "until 1.0 is released".
4. The `host` field in `markup/outputs.json` is NOT changed by this task (see Notes).

Task 007 (CMS Outputs wording) already covers `markup/tunes.json` line 18, `scripts/conformance.mjs` lines 13, 14 and 130,
and `markup/README.md` lines 15 to 20. Do not repeat those edits here. If one of them is still not done when you start,
do it under 007, not here.

## Files

1. `docs/projects.json`
   - Line 2, the `about` text: "and its stage." becomes "and its status."
   - Every `"stage":` key (lines 12, 42, 58, 77, 99, 122, 145, 169) becomes `"status":`. Values unchanged.
   - Line 30, `"markup/tunes.json",` becomes `"markup/common-settings.json",`.
2. `scripts/affected.mjs`: line 43 `p.stage === stage` becomes `p.status === stage`. Read the other uses of `.stage` in that
   file first and change each one the same way.
3. `scripts/status.mjs`: lines 57, 64, 71 and 72 use `p.stage`. Each becomes `p.status`. Check the file for any other `stage`
   use with the same meaning.
4. `markup/tunes.json` renamed to `markup/common-settings.json` with `git mv`. No content change.
5. `markup/README.md`, line 23: "`tunes.json`:" becomes "`common-settings.json`:".
6. `markup/outputs.json`, the `frozen` value under `django` (line 56): "until 1.0 is live: no work on it, its gaps aren't counted"
   becomes "until 1.0 is released: no work on it, its gaps aren't counted".
7. `docs/WORKING.md` (the rule text, the item about `stage` in projects.json): "`stage` in projects.json" becomes
   "`status` in projects.json". Search the rest of `docs/` for `stage` used for a project's state (not for the seven product
   steps) and change those the same way.
8. `docs/PRODUCT-LINE.md`: the glossary line that says "The `stage` key in projects.json is a Code task to rename it `status`"
   and the line that says "the `tunes.json` filename" are done by this task: remove those two items from the "Decided here, not
   yet done" line of section 9. Also in section 2, the mention of `markup/tunes.json` in the table row 3 becomes
   `markup/common-settings.json`. The dated 2026-11-09 checklist line (`the common settings in markup/tunes.json`) changes to
   `markup/common-settings.json`.
9. Do NOT edit `CHANGELOG.md`. Its old entries keep their wording (history).
10. Do NOT edit the decision-log line dated 2026-11-11 that names `docs/todo/`. It is history.

## Exact steps

1. `git fetch origin` and `git checkout -b claude/code-side-terms origin/master`.
2. Run `grep -rn -E "\.stage\b|\bstage:|\"stage\"" scripts docs markup --include=*.mjs --include=*.js --include=*.json --include=*.md`
   and paste the output into the PR body. Each hit that is about a project's state is changed under step "Files". A hit about
   the seven product steps is left alone.
3. Make the edits in Files, steps 1 to 8.
4. Run `git mv markup/tunes.json markup/common-settings.json`. Then search for `tunes.json` and fix every hit outside `CHANGELOG.md`
   and the 2026-11-11 history line.
5. Run `npm run build`, then `git diff --exit-code -- dist`. Paste the output. If `dist/` changes only because the `frozen` text
   or a file name is in the build output, commit the rebuilt `dist/` too.
6. Run `npm test` and paste its last 20 lines.
7. Run `npm run affected` and `npm run status`, and paste the output. The projects must list the same as before the change.
8. Commit with message `Rename code-side terms: status, common-settings, until 1.0 is released`. Push
   `claude/code-side-terms`. Open a PR into `master` whose body starts with the two attribution lines and then
   `Refs docs/tasks/marccent-theme/008-code-side-terms.md`.

## Checks

- `npm test` passes (paste output).
- `npm run affected` and `npm run status` give the same answer as before the change (paste output).
- `git diff --exit-code -- dist` after the build (paste output).
- The grep in step 2, with which hits remain and why.

## Done when

- `docs/projects.json` has `status` keys and no `stage` keys for projects.
- `markup/common-settings.json` exists and `markup/tunes.json` does not.
- The django `frozen` text says "until 1.0 is released".
- The checks above pass and are pasted into the PR body.
- The PR is open. Code does not merge it; Hub does.

## Notes

- `host` (step 4 of Goal): no script reads it. `grep -rn '\.host' scripts` finds nothing. Removing it deletes a field, and
  PRODUCT-LINE.md section 9 says nothing is removed without a ticket or Marcos's OK. Marcos has not given that OK. So this
  task leaves it, and a separate decision (remove or keep) goes to Marcos through Hub.
- django-marccent is frozen (PRODUCT-LINE.md section 3, `markup/outputs.json`). Its CLAUDE.md still names `docs/todo/`. That
  change waits until django is unfrozen. Do not change django-marccent in this task.
- The `request` label on GitHub stays as it is. Renaming it is a GitHub change for Marcos.
- The `ticket` label and the old T-IDs stay.
- This is naming only and sits inside the feature freeze (PRODUCT-LINE.md section 3). If a step is unclear, stop and ask Hub.
  Do not guess.
- Report in the PR body with `Give to: Hub`.
