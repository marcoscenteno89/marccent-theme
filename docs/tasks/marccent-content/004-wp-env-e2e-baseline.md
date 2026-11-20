# Task 004: wp-env and Playwright baseline, admin and incognito checks
Status: blocked
Repo: marccent-content
Issue: none
Branch base: the repo's default branch (`main`)
Give to: Code in marccent-content

## Goal

A throwaway WordPress site in CI (wp-env) with Marccent Blocks, Marccent Content and Marccent WP installed, and the standard admin and incognito checks from `docs/TESTING.md`, section 3, running as a CI gate on every pull request. The private-field test (task 002) is part of this job, so there is one WordPress job, not two.

## Why blocked

Blocked by marccent-theme task 006 (the Playwright harness). Its config and naming are the ones this task uses, so this task starts after task 006 is merged. Hub changes this to `open` in a docs PR when task 006 is merged, and writes the tag in Notes.

## Files

- `.wp-env.json` (new): the site, with the three plugins. Plugin paths come from the checkouts in the workflow, not from the repo tree.
- `tests/e2e/seed.php` (new): creates the test content for a run. Every test value starts with `PRIVQA` plus a random string, and each post title starts with `[test]`. Teardown removes them.
- `tests/e2e/admin.spec.mjs` and `tests/e2e/incognito.spec.mjs` (new): the checks listed in Exact steps.
- `.github/workflows/ci.yml`: replace the `private-field` job from task 002 with one job, `e2e`. Keep `lint`.
- `README.md`: one line on the `e2e` job and the `BLOCKS_REF` value it uses.
- `docs/TESTING.md`: no change. Hub changes the "(to build)" markers.

Do not change the plugin code in this repo unless a test shows a bug. If one does, stop and report it. Do not fix it in this PR.

## Exact steps

1. `git fetch origin` then `git checkout -b claude/wp-env-e2e-baseline origin/main`.
2. Read `tests/private-where.php` and task 002 (`docs/tasks/marccent-content/002-ci-private-field-tests.md`). If task 002 is already merged, keep its checks inside the new `e2e` job. If it is not merged, stop and say so: task 002 comes first.
3. Set `BLOCKS_REF` in the workflow to the Marccent Blocks tag it pins today, and write it in the PR body.
4. Write `.wp-env.json` with the site and the three plugins.
5. In the `e2e` job, after `wp-env start`: run `tests/e2e/seed.php` with WP-CLI. Then run the private-field test. Then run Playwright:
   a. `tests/e2e/incognito.spec.mjs` (logged out). For each of the public pages the seed creates, check every item in `docs/TESTING.md` 3.2: the page renders; the seeded `PRIVQA` value does not appear in the HTML, in `/wp-json/`, in JSON-LD or in the feed; no console errors; no 4xx or 5xx on fonts, CSS or JS; a form submits and the spam check applies.
   b. `tests/e2e/admin.spec.mjs` (logged in as administrator, then as editor). For each admin screen the plugins add, check every item in 3.1: no PHP notices in `wp-env`'s debug log; no console errors; settings save and reload; an editor gets refused on an admin-only action; a block round-trips (insert, save, reload).
6. Run `tests/e2e/seed.php` teardown in an `if: always()` step.
7. Upload the Playwright report as an artifact on failure.
8. Commit, push `claude/wp-env-e2e-baseline`, open a PR into `main`. The body starts with the two attribution lines, then the task path, the `BLOCKS_REF` value, and the check output.

## Checks

- `npm test` passes if the repo has one. Paste its output.
- On the branch, the `e2e` job passes. Paste its last 30 lines.
- Leak check on a throwaway branch `claude/wp-env-leak-check` (do not merge): make one public page print a `PRIVQA` value. The job must FAIL on the incognito check. Paste the failing lines. Delete the branch.
- A PHP notice on a throwaway branch makes the admin check FAIL. Paste the lines. Delete the branch.

## Done when

- The `e2e` job passes on the PR, and both throwaway branches showed it failing.
- The PR body lists `BLOCKS_REF`, the checks run, and the outputs.
- Give Hub: the branch, the PR link, the job result (pass) and the two fail runs. Hub verifies CI and merges.

## Notes

- Chrome is not a gate here. A Chrome step for a visual check is written under `docs/TESTING.md`, section 5, in a separate task.
- Marccent Blocks and Marccent WP are checked by their own tasks, after this one. This task covers Marccent Content only.
