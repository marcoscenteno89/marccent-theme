# Task 005: release PR for v1.0.0-rc.26
Status: open
Repo: marccent-theme
Issue: none
Branch base: master
Give to: Code in marccent-theme

## Goal

Prepare the release PR for `v1.0.0-rc.26`. The release PR is the version bump, the CHANGELOG entry and the rebuilt `dist/`. It does not tag. Hub merges the PR under the merge gate, then cuts the tag on the merge commit (`docs/RELEASES.md`). rc.26 ships task 004 (#156, merged as `93cce40`) and the widgets from #163 (`dd6aa19`), and marccent-blocks waits for it.

## Files

- `package.json`: `version` from `1.0.0-rc.25` to `1.0.0-rc.26`.
- `package-lock.json`: the two `version` fields at lines 3 and 9, from `1.0.0-rc.25` to `1.0.0-rc.26`.
- `CHANGELOG.md`: the `## Unreleased` heading becomes `## 1.0.0-rc.26`, and a new empty `## Unreleased` heading goes above it (keep the same `### Added` / `### Fixed` subheadings that already exist).
- `dist/`: rebuilt (`npm run build`). The banner in `dist/marccent.js` shows the new version.

Do not change anything else. No code, no docs, no rule file.

## Exact steps

1. `git fetch origin` and `git checkout -b release/rc26-version origin/master`. Hub's release branch name is not needed here; this is a PR into master.
2. Read `README.md` "Versions" for the release steps. This task follows them, and stops before the tag.
3. Edit `package.json` and `package-lock.json` as in Files.
4. Edit `CHANGELOG.md` as in Files. Read the existing `## 1.0.0-rc.25` section first and match its layout.
5. Run `npm run build`, then `npm run build` again, then `git diff --exit-code -- dist` (it must print nothing after the second build).
6. Run the checks below.
7. Commit (the `Co-Authored-By: Claude …` trailer is allowed and stays; no other model name in the message), push `release/rc26-version`, and open a PR into `master`. Body starts with the two attribution lines, then `Release v1.0.0-rc.26. Hub cuts the tag after merge.`, then the check output.

## Checks

- `npm test`. Paste the output. Expected: exit 0.
- `npm run build`, twice, then `git diff --exit-code -- dist`. Paste the output of the last command (it must be empty).
- `grep -n '"version"' package.json package-lock.json`. Paste the output. Expected: `1.0.0-rc.26` in all three places.

## Done when

- The PR into master changes only the four files in Files, `dist/` is rebuilt and clean on a second build, and the check output is in the body.
- Give Hub: the branch, the PR link, the check output. Hub verifies CI, merges, and cuts `v1.0.0-rc.26` on the merge commit. Hub then unblocks marccent-blocks task 001.

## Notes

- Do not tag. Do not create a `release/` branch on the remote; the name above is a local branch only. Hub decides on any release branch.
- Freeze applies: no change beyond the version and the CHANGELOG heading.
