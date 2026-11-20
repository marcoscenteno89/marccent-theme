# Task 002: run the private-field tests in CI

Status: blocked
Repo: marccent-content
Issue: marcoscenteno89/marccent-content#8
Branch base: origin/main
Give to: Code in marccent-content

## Goal

The private-field test (`tests/private-where.php`, from commit `81d0bbe`) runs on every push and PR, so a leak cannot come back unnoticed.

## Files

- `.github/workflows/ci.yml` (today: a `lint` job, PHP 8.0 and 8.3, `php -l` only).
- `tests/private-where.php`.
- `README.md` and `CLAUDE.md`: where the test is listed.

## Exact steps

Blocked until Marcos chooses A or B (Notes). When the choice is written here, do only that option.

- **Option A:** a CI job that starts a WordPress test site (e.g. `wp-env` or the same image the test uses), installs Marccent Blocks at its pinned tag, activates Marccent Content, and runs `tests/private-where.php`. Separate PR from any leak fix.
- **Option B:** a documented manual run in `README.md`: the exact command, the expected output, and when to run it (before merging any change under `inc/`). Say in `README.md` that CI does not cover it.

## Checks

- Option A: push a deliberate leak on a throwaway branch. The job must fail. Remove it. The job must pass. Paste both CI outputs.
- Option B: run the documented command. Paste its output.

## Done when

- The chosen option is in, and the PR body says which option and why.

## Notes

- **Blocked on Marcos's choice.** Recommendation: A, because a leak test that CI never runs can drift without anyone noticing. A adds a CI job and a Docker dependency, so Marcos decides.
- Do not hold PR #5 for this task.
