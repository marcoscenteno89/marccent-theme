# Task 002: run the private-field tests in CI (option A)
Status: open
Repo: marccent-content
Issue: marcoscenteno89/marccent-content#8
Branch base: the repo's default branch (`main`)
Give to: Code in marccent-content

## Goal

The private-field test (`tests/private-where.php`, from commit `81d0bbe`) runs in CI on every push and pull request, so a leak cannot come back unnoticed. Marcos chose option A on 2026-11-20: a CI job, not a manual run.

This task touches only marccent-content. It does not change marccent-theme or marccent-blocks, so it does not wait for a theme tag.

## Files

- `.github/workflows/ci.yml`: add a new job. Keep the existing `lint` job (PHP 8.0 and 8.3, `php -l`) as it is.
- `README.md`: one line saying the private-field test runs in CI, and the job's name.
- `CLAUDE.md`: only if it lists the test. Say in the PR body whether it does.

Do not change `tests/private-where.php` unless the job cannot run it. If it must change, stop and report why.

## Exact steps

1. In marccent-content: `git fetch origin` and `git checkout -b claude/ci-private-field-tests origin/main`. Do not touch PR #5 or its branch.
2. Read `tests/private-where.php` from its top: what it loads and what it needs (WordPress, the Marccent Blocks plugin, the Marccent Content plugin). Write those needs in the PR body.
3. Add a job `private-field` to `.github/workflows/ci.yml`. It runs on `push` and `pull_request`, like `lint`. Its steps, in order:
   a. `actions/checkout@v4`.
   b. Set up Node 22 and PHP 8.3 (`shivammathur/setup-php@v2` or what `lint` already uses).
   c. Start a WordPress test site with `@wordpress/env` (`npm install -g @wordpress/env`, `wp-env start`). If `wp-env` cannot run in this job, stop and report the error. Do not switch to another setup without saying so.
   d. Put Marccent Blocks in the site at the tag in an env var `BLOCKS_REF` in the workflow, from `https://github.com/marcoscenteno89/marccent-blocks` (for example `git clone --depth 1 --branch "$BLOCKS_REF"`). Set `BLOCKS_REF` to the tag Marccent Blocks pins in its `package.json` today. Write that tag name in the PR body.
   e. Activate Marccent Content on the site.
   f. Run the test with the site's WP-CLI: `wp-env run tests-cli wp eval-file tests/private-where.php`. Its exit code must be non-zero on a leak (check the file's own failure exit; if it only prints, make the job fail on a `FAIL` line and say so in the PR body).
4. Add the one README line (Files).
5. Run the checks below.
6. Push `claude/ci-private-field-tests`. Open a PR into the default branch. Body starts with the two attribution lines, then `Fixes #8` (option A), then the BLOCKS_REF tag and why, then the check output.

## Checks

- Locally, if Docker is available: run the same `wp-env` steps and paste the output (exit 0 on a clean tree).
- In CI, on the branch: the `private-field` job passes. Paste the job's last 30 lines.
- Deliberate leak on a throwaway branch (`claude/ci-leak-check`, not the PR branch): change the test's input so it leaks (follow the test file's own comments). Push. The `private-field` job must FAIL. Paste the failing job's output. Then delete the throwaway branch. Do not merge it.
- Confirm `lint` still passes on the PR.

## Done when

- The `private-field` job passes on the PR, and the throwaway leak branch showed the job failing.
- The PR body says option A, the BLOCKS_REF tag, and the check outputs.
- Give Hub: the branch, the PR link, the job output (pass), the leak run (fail). Hub verifies CI and merges.

## Notes

- Option A chosen by Marcos on 2026-11-20 (recommended over B: a leak test that CI never runs can drift unnoticed). Option B is not part of this task.
- `BLOCKS_REF` must be updated when Marccent Blocks moves to a new theme tag. Note that in the README line.
- Downstream-only: this task touches only marccent-content, so it may go ahead now (WORK FLOWS DOWNSTREAM, AGENTS.md).
