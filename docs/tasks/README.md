# Tasks: how Hub and Code talk

> **WORK FLOWS DOWNSTREAM** (Marcos, 2026-11-20). Before any downstream work (adapters: marccent-blocks, marccent-content, marccent-wp, marccent-patterns, marccent-kits; then the sites), check for open core issues in marccent-theme that the work depends on, and do those first. If there are none, go straight to the downstream repo and do not touch core. Core means the shared pieces only: tokens, components, utilities and the markup reference. A change to a shared piece starts in marccent-theme, then moves downstream. A plugin-only fix (no shared piece involved, for example marccent-content #6 and #7) goes straight to its own repo. Hub orders `docs/tasks` so that open core tasks come first, and marks a downstream task `blocked` while a related core task is open.


> **CODE: COMMIT, PUSH, PR, STOP.** Every change Code makes ends with: commit on a branch, `git push -u origin <branch>`, open a PR, report the PR link with a "Give to: Hub" line. Code NEVER merges any PR, even if asked; if asked, reply "Hub merges; I've stopped at the PR." Code never ends a session with uncommitted or unpushed work; if work can't be finished, commit it as WIP on its own branch and push it.
>
> **Why:** PR #155 (fonts per style) was merged to master at 2026-11-20 01:02 UTC with no review, one minute after it was opened. Hub's review after the merge found issue #156 (fonts never load unless `window.marccentFontsBase` is set). #155 also added a new site-level setting, `theme.fonts` (body, heading, display and mono roles), read in `core/apply.js`, during the feature freeze (PRODUCT-LINE.md 3.1 and 3.3). Under the merge gate, Hub reviews and merges, so Code should have stopped at the PR.

The channel between Hub and Code is the docs. Hub writes each task for Code as a file in this folder. Code reads it and does it.

Chrome has its own folder on the same channel, `docs/tasks/chrome/`, for browser checks only. Chrome reads it on github.com, not from a clone. Its format and its "check docs" steps are in `docs/tasks/chrome/README.md` and `docs/handoffs/chrome.md`. Everything in this README about the lifecycle applies to Chrome's tasks too, with two differences: the header says `Give to: Chrome`, and the header has an `Install:` line in place of `Branch base:`.

## Where tasks live

`docs/tasks/<repo>/<NNN>-<slug>.md`, one folder per repo, and `docs/tasks/chrome/<NNN>-<slug>.md` for Chrome. `NNN` is a three-digit number, counted per folder from `001`. Never reuse a number.

Example: `docs/tasks/marccent-content/001-content-61-editor-preview.md`.

## The header (the first five lines, exactly)

```
# Task NNN: <title>
Status: open | in progress | done | blocked
Repo: <repo>
Issue: <repo>#<N>   (or: none)
Branch base: <the branch to start from>
Give to: Code in <repo>
```

Then these sections, in this order: **Goal**, **Files**, **Exact steps**, **Checks**, **Done when**, and **Notes** (the reason for `blocked`, and anything else the owner needs).

## Lifecycle

1. **Hub writes the task** in a docs PR, with `Status: open` (or `blocked`, with the reason in Notes). A task exists only once that PR is merged to `master` of marccent-theme. Until then it is a draft, and Code does not take it.
2. **Code takes the oldest open task** in its repo, using the command below. Code says which task it took, by path.
3. **Code does the task** as written. One task is one goal, so one PR. If a step is unclear or wrong, Code stops and asks Marcos. It does not guess.
4. **Code reports in its PR body**: the task path, a `Give to:` line, each check it ran with what it printed, and the dependents Hub must check (see `docs/handoffs/code.md`).
5. **Hub verifies the PR** against the task and AGENTS.md, merges it under the merge gate, and then sets the task's `Status:` to `done` in a docs PR.
6. **Blocked tasks are skipped.** Only Hub changes a `Status:` line. Code never edits a task file's status.

## The "check docs" command

When Marcos tells Code **"check docs"**, Code does these steps in order, and nothing else:

1. `cd ~/app/marccent-theme && git pull`. Run the pull even if the repo you are in is marccent-theme. If `~/app/marccent-theme` does not exist, stop and tell Marcos.
2. Read `docs/AGENTS.md`, `docs/handoffs/code.md` and `docs/tasks/README.md`.
3. List the task files in `docs/tasks/<this repo>/`, where `<this repo>` is the folder name of the repo you opened in VS Code. Keep only the files whose header says `Status: open`.
4. Take the open task with the lowest number. Say its path in your reply, for example: "Taking docs/tasks/marccent-content/003-search-leak-group-rows.md".
5. Do the task (above). If there is no open task, say so and stop.
