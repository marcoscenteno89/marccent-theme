# Task 007: Say "CMS Outputs" in code and code comments
Status: open
Repo: marccent-theme
Issue: none (wording only; Hub opens one if Marcos wants it tracked)
Branch base: master
Give to: Code in marccent-theme

## Goal

Marcos ruled (2026-11-28, PRODUCT-LINE.md section 9, Decisions): the outputs that have an admin (wp, django) are called
**CMS Outputs**, one term everywhere. The docs now say this. The code and the code's notes still say "output with an
admin", "admin output" or "output that has an admin". Change those words to "CMS Output" / "CMS Outputs". Change nothing
else. No behavior, no key names, no feature.

## Files

These are the places found by Hub's search (`grep -rniE "output.*admin|admin.*output" --exclude-dir=node_modules`).
Check them, and search again for the rest (step 2).

1. `markup/tunes.json`, line 18: the `"on"` text says "on an output with an admin". Change to "on a CMS Output".
2. `scripts/conformance.mjs`, line 13: "output with an admin says which of its tools". Change to "CMS Output says which of
   its tools".
3. `scripts/conformance.mjs`, line 14: "an admin output has no tool for yet". Change to "a CMS Output has no tool for yet".
4. `scripts/conformance.mjs`, line 130: the comment "which tool gives it on each output that has an admin". Change to
   "on each CMS Output".
5. `markup/README.md`, lines 15 to 20 (it is a `.md` file, but outside `docs/`, so Hub cannot change it):
   "every output with an admin" -> "every CMS Output"; "on each admin output" -> "on each CMS Output"; "on an output with
   an admin" -> "on a CMS Output"; "every output with an admin follows" -> "every CMS Output follows". Use the exact
   lines (`sed -n 12,21p markup/README.md` shows them).

Do NOT change:
- the `admin` key in `markup/outputs.json` or in `markup/settings.json` (a field name; it stays);
- the words "admin data", "admin pattern", "the admin" (they name the rule and the data, not the outputs);
- `CHANGELOG.md` (history: past entries keep their wording);
- anything in `docs/` (Hub's files; not yours to change).

## Exact steps

1. `git checkout -b claude/cms-outputs-wording` from `master` (pull master first).
2. Run `grep -rniE "output.*admin|admin.*output|has an admin|with an admin|no admin" --exclude-dir=node_modules --exclude-dir=dist --exclude=CHANGELOG.md .` and paste its output into the PR body. For each hit: if it is one of the files above, change it as above. If it is a different sentence about outputs and admins, change it only when it says "output(s) with/that has/that have an admin" or "admin output(s)"; otherwise leave it and list it in the PR body under "Left as is".
3. Make only these wording changes. No other edits.
4. Run `npm test`. Paste the last 20 lines of its output.
5. Run `npm run build`, then `git diff --exit-code -- dist`. If `dist/` differs only because a `tunes.json` `"on"` text now ships in it, commit the dist change too (dist must match the build). Paste the output.
6. Commit with message `Wording: CMS Outputs for outputs with an admin` and push: `git push -u origin claude/cms-outputs-wording`.
7. Open a PR into `master` that says `Docs and wording: CMS Outputs` and whose body has `Refs docs/tasks/marccent-theme/007-cms-outputs-wording.md`.

## Checks

- `npm test` passes (paste output).
- `npm run build` and `git diff --exit-code -- dist` (paste output).
- The grep in step 2 (paste output, and say which hits remain and why).

## Done when

- The files above read "CMS Output(s)" where they said an output with / that has an admin, or an admin output.
- Checks above pass and are pasted into the PR body.
- The PR is open. Code does not merge it.

## Notes

- This is wording only: it is inside the feature freeze (PRODUCT-LINE.md section 3), and it changes no behavior.
- If a step is unclear, stop and ask Marcos. Do not guess.
- Report in the PR body with `Give to: Hub`.
