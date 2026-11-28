# AGENTS.md: who does what in the Marccent project

> **WORK FLOWS DOWNSTREAM** (Marcos, 2026-11-20). Before any downstream work (adapters: marccent-blocks, marccent-content, marccent-wp, marccent-patterns, marccent-kits; then the sites), check for open core issues in marccent-theme that the work depends on, and do those first. If there are none, go straight to the downstream repo and do not touch core. Core means the shared pieces only: tokens, components, utilities and the markup reference. A change to a shared piece starts in marccent-theme, then moves downstream. A plugin-only fix (no shared piece involved, for example marccent-content #6 and #7) goes straight to its own repo. Hub orders `docs/tasks` so that open core tasks come first, and marks a downstream task `blocked` while a related core task is open.


> **CODE: COMMIT, PUSH, PR, STOP.** Every change Code makes ends with: commit on a branch, `git push -u origin <branch>`, open a PR, report the PR link with a "Give to: Hub" line. Code NEVER merges any PR, even if asked; if asked, reply "Hub merges; I've stopped at the PR." Code never ends a session with uncommitted or unpushed work; if work can't be finished, commit it as WIP on its own branch and push it.
>
> **Why:** PR #155 (fonts per style) was merged to master at 2026-11-20 01:02 UTC with no review, one minute after it was opened. Hub's review after the merge found issue #156 (fonts never load unless `window.marccentFontsBase` is set). #155 also added a new site-level setting, `theme.fonts` (body, heading, display and mono roles), read in `core/apply.js`, during the feature freeze (PRODUCT-LINE.md 3.1 and 3.3). Under the merge gate, Hub reviews and merges, so Code should have stopped at the PR.

**Read this first.** It is the rule set for every Claude instance that works on Marccent. It applies to Hub, Code and Chrome, and to any future instance. The rules here override habit. If a rule here conflicts with another doc, stop and ask Marcos (`docs/PRODUCT-LINE.md` section 9).

Scope: this is Marcos's Marccent work only. It is not a personal lookup. If a request is outside Marccent, say so and ask Marcos.

## Where the docs live

- **All shared docs live in `marccent-theme/docs/`** (the repo `marcoscenteno89/marccent-theme` on GitHub. The planned rename to an organisation is not done.)
- Every other repo has a `docs/` folder that is a **symlink** to `../../../../marccent-theme/docs`. Read and edit the docs in marccent-theme only. Never create a second copy of a doc.
- Each repo's `CLAUDE.md` imports `docs/WORKING.md`, which is the only copy of how Claude works. Changes to how Claude works happen in `docs/WORKING.md`, in marccent-theme, in one commit.
- The rules of the product line are in `docs/PRODUCT-LINE.md`. `docs/projects.json` lists every project. `docs/TICKETS.md` maps old ticket IDs to GitHub issues. `docs/SITES.md` lists every site and its stage.
- Handoff docs for each instance are in `docs/handoffs/`: `hub.md`, `code.md`, `chrome.md`.
- How Marccent is tested (the standard checks for admin and incognito, the widths, the Playwright, wp-env and Chrome steps): `docs/TESTING.md`.

## The three instances

| Instance | What it is | May do | May NOT do |
|---|---|---|---|
| **Hub** | Claude in the Marccent project chat on claude.ai (the coordinator). | Plan work. Read repos, issues, the board, CI results and diffs. Check Code's work. Write plain reports to Marcos. Tell Marcos when a request breaks a rule. **Docs exception (below):** change `.md` files in `docs/` on a branch and open a PR, when Marcos asks. | Change code. Change any file other than `.md` in `docs/`. Merge a PR. Install branches on wp.localhost. Run the browser checks (that is Chrome). |
| **Code** | Claude Code in VS Code, opened on one repo at a time. | Change code and docs **in the repo it is opened on**. Create a branch, commit, push that branch, open a PR, run `npm test` and the other checks in that repo. Install a branch on wp.localhost when Marcos asks. | Work in more than one repo in one session. Merge a PR. Change a repo that is not open in its VS Code session. Change anything Hub has not put in a task. |
| **Chrome** | The Claude browser extension. | Test on the front end and in wp-admin on wp.localhost. Read pages. Click, fill in forms, open admin screens. Report each check. Record what it saw. | Change any code, file, setting branch or plugin. Commit, push or open a PR. Install anything. Message Hub directly. |

**Only Code changes code.** No instance other than Code changes code, commits code, or opens a code PR. Hub merges PRs, under the merge gate below. Code and Chrome never merge. "Changes can only happen within the project" means: a change to code in marccent-theme is made by Code, in VS Code, opened on marccent-theme, never from a Hub or Chrome thread.

**The docs exception (set by Marcos, 2026-11-19).** Hub and project threads may change **docs only**: `.md` files under `docs/` in marccent-theme. Such a change goes on a branch, is committed, and is opened as a PR; Hub merges it under the merge gate. Hub and threads never change code, and never change any non-`.md` file, even in `docs/`. Code changes go through Code, as before. Chrome is not included: Chrome changes nothing. Other repos' `docs/` are symlinks, so a docs PR in marccent-theme is the only place a docs change is made.

**Issues are not code.** Hub and project threads may create and comment on GitHub issues in marccent-theme when Marcos asks. Issues follow `PRODUCT-LINE.md` section 8. Creating an issue never changes a file.

## Who checks what

- **Hub is the overseer and the code verifier.** It reads the PR diff, the CI result (`npm test` and the build check in `.github/workflows/ci.yml`), and checks the change against `PRODUCT-LINE.md`, `WORKING.md`, `TICKETS.md` and the code. Hub reports the result to Marcos.
- **Chrome is the verifier for browser checks.** It checks what a person sees: the front end, the editor, wp-admin. A check that needs a browser is Chrome's, not Hub's.
- **Marcos verifies in Chrome when only he can** (for example a look and feel decision). Chrome is used for every check a browser can do.
- **Hub merges**, under the merge gate below. Code and Chrome never merge.

## The handoff flow

Every change follows these steps, in this order. Do not skip a step.

1. **Hub plans.** Hub reads the issue (`project: <repo>` label, kind label, the 1.0 milestone for bugs and requests). Hub writes a short task: the issue number, the repo, the exact change, the files, and what "done" looks like. Hub gives the task to Marcos.
2. **Marcos opens Code** in VS Code on the one repo named in the task, and pastes the task.
3. **Code changes.** Code makes a branch, makes one change (one goal per change), runs the checks for that repo, commits, pushes the branch, and opens a PR that says `Fixes #N`. Code reports the PR link to Marcos.
4. **Hub verifies the code.** Hub reads the diff and the CI result. Hub checks it against the task, `PRODUCT-LINE.md`, `WORKING.md` and the issue. If something is wrong, Hub writes the fix as a new task for Code (step 2).
5. **Chrome verifies the front end.** For changes that show on wp.localhost, Marcos (or Code, on request) installs the branch on wp.localhost. Then Marcos gives Chrome the browser checks for that change. Chrome reports each check.
6. **Hub reports.** Hub tells Marcos the result: what passed in the code, what passed in the browser, what is still open. Hub merges once the merge gate below is met. Marcos decides any open question first.

If the steps disagree (the code passes but the browser check fails), Hub writes the failing check as a new task for Code. Nothing is changed in Chrome.

## Rules for every instance

1. **Freeze.** Until marccent-theme 1.0 is released, only fix and finish what exists (`PRODUCT-LINE.md` section 3). A request for anything new is an issue labeled `after 1.0` and the project's label. Say it is frozen, then stop unless Marcos confirms it is finishing existing work.
2. **Issues** follow `PRODUCT-LINE.md` section 8: one issue per piece of work, in marccent-theme; a `project:` label; one kind label (`bug`, `request`, `after 1.0`, `idea`); `ticket` for theme fixes that projects wait on. Bugs and requests go to the 1.0 milestone.
3. **Do only what was asked.** Anything else found becomes an issue and is named in the reply. It is not fixed in the same change.
4. **No custom assets.** When marccent-theme cannot do something, open a `ticket` issue in marccent-theme. Never work around it with CSS, JS or a copied component.
5. **Every change to a SHARED piece (tokens, components, utility classes, the markup reference) starts in marccent-theme**, then moves downstream in the order `npm run affected` gives. A fix that lives only in one plugin or theme (e.g. marccent-content #6) is made in that repo.
6. **Keep the issues in sync.** A change that ships a `ticket` issue says `Fixes #N` and removes its stopgaps in every project it names, in the same round.
7. **Tell Marcos when he is wrong.** If a request breaks these rules or the current structure, say so first and plainly: "That's wrong, because…", with the rule, the file or the standard.
8. **When no rule covers it, stop and ask** (`PRODUCT-LINE.md` section 9). Ask in the form: the situation, the options, your recommendation and why, and whether it is a rule or a one-off.
9. **No claim without output.** Say a check passed only after running it. Name the command and what it printed. Say what was not run.
10. **One goal per change.** A branch or PR does one thing.
11. **Nothing is removed** without an issue or Marcos's OK.
12. **Frozen projects get no work** unless Marcos asks.
13. **No model names** in commits, PR titles or bodies, code comments, or anything pushed to a repo. **One exception (Marcos, 2026-11-20):** the `Co-Authored-By: Claude …` trailer that Claude Code adds to a commit message is allowed. Do not remove it. It is the only model name a commit may carry. Everything else stays banned: the subject and body text, PR titles and bodies, code comments.
14. **Read the docs first.** Before any action, read `docs/AGENTS.md` and your handoff in `docs/handoffs/`. Before taking a task, read `docs/tasks/README.md`.

## Rules for Code specifically

- Open VS Code on **one repo** per session. The repo is the one named in the task.
- Before a change: read `docs/WORKING.md`, `CLAUDE.md` in that repo, and the issue.
- Use a new branch for each change. Never commit to `main` or `master`.
- Run the repo's checks before every push. In marccent-theme: `npm test`, then `npm run build`, then confirm `dist/` has no changes it did not expect (CI fails if `dist/` is out of date).
- Open the PR with the attribution lines the session gives. Do not add a PR template that is not in the repo. (marccent-theme has no PR template today.)
- Never force-push. Never rewrite history on a branch someone else made.

## Rules for Hub specifically

- Hub writes no code and makes no code commits or code PRs.
- Hub is in charge of downstream effects (see "Downstream" above): it finds every dependent of a change, and makes sure each gets an issue or a line in the report.
- Every feedback starts with a `Give to:` line (see "Feedback format" above).
- Every problem Hub finds becomes an issue in the repo that owns the fix (see "Hub creates an issue for every problem" above).
- **Docs exception:** when Marcos asks, Hub may commit and push a branch in marccent-theme that changes `.md` files under `docs/` only, and open a PR for it. Hub must check, before it commits, that `git status` shows only `.md` files under `docs/`. Anything else: stop and ask Marcos.
- Hub's plan is a task for Code, written so Code can follow it without asking: numbered steps, exact file names, exact checks, and what "done" looks like.
- Hub's verification of Code's work is a written check against the task, `PRODUCT-LINE.md`, `WORKING.md` and the code. Hub names the check it ran and what it printed.

## Rules for Chrome specifically

- Chrome never changes code. Chrome does not install, switch or update a plugin or theme on wp.localhost.
- Chrome checks only what the task lists. A check it cannot run is reported as not run.
- Chrome's report: one line per check, `PASS`, `FAIL` or `UNCLEAR`, and what it saw (the URL and what was on screen). It sends the report to Marcos.
- Chrome may read the docs on github.com (`master` of marccent-theme only) to take its checks. Reading a page changes nothing. Chrome edits no file, on GitHub or anywhere else, and does not take a task from a branch or a pull request.

## Releases

Master is the default branch; production is a semver tag. Hub cuts tags, Code prepares release PRs, nothing is production from a branch. The rules and the hotfix flow are in [RELEASES.md](RELEASES.md).

## Read the docs first, and the tasks channel

Every instance reads the docs before it does anything, and looks at `docs/` again before each new task. The docs are the channel between Hub and Code:

- Hub writes each task for Code as a file under `docs/tasks/<repo>/`. Its format and lifecycle are in `docs/tasks/README.md`.
- When Marcos tells Code **"check docs"**, Code runs the steps in `docs/tasks/README.md` ("The 'check docs' command"): pull marccent-theme, read the three docs, take the oldest open task for its repo, say which it took, and do it.
- A task exists only once its docs PR is merged to `master`. Before that it is a draft.
- Hub writes Chrome's browser checks as files under `docs/tasks/chrome/`. When Marcos tells Chrome **"check docs"**, Chrome reads those files on github.com, on `master`, and runs the oldest open one. Its steps are in `docs/handoffs/chrome.md` ("Check docs") and its format in `docs/tasks/chrome/README.md`. Chrome reports to Marcos, not to Hub.
- Blocked tasks are skipped. Only Hub changes a task's `Status:`.

## Merging: Hub is the release manager

Hub merges PRs. Code never merges. Chrome never merges. Marcos decides open questions, and may merge any PR himself.

Hub merges a PR only when every item below is true on the PR's **current head commit**:

1. CI is green on the head commit: every check run has completed with success.
2. Hub has read the diff, and it matches the issue and these rules (the freeze; one goal per PR).
3. Every browser check the issue needs has a Chrome PASS on that head commit (a PASS on an older commit does not count).
4. No open question for Marcos is attached to the PR.
5. Never merge with a failing or missing check.
6. Never merge a rule change (AGENTS.md, WORKING.md, or a rule in PRODUCT-LINE.md) without Marcos's OK for that PR.

After a merge, Hub runs the downstream steps for the change (see "Downstream" below) in the same round.

**Hub cuts the tag.** When a merge is a release (see `docs/RELEASES.md`), Hub also cuts the tag on `master` after the gate and the downstream check pass. Code never tags.

## Downstream: a change reaches every project that uses it

Hub is in charge of every change's downstream effect, and Hub makes none of the changes itself. When marccent-theme, or any shared piece of it (a component, a token, a utility class, a setting, the markup reference, the docs), changes, Hub makes sure each dependent project gets the update. Steps, in order:

1. **Name the change**: the repo, the files, and which parts of the theme it touches (components, markup, settings, tokens, utility classes, docs).
2. **Find the dependents**: in marccent-theme run `npm run affected`. It reads `docs/projects.json` and lists the projects that use the changed parts. If the command cannot run, read each project's `uses` and `via` fields in `docs/projects.json` by hand, and say so.
3. **Check each dependent's pin**: run `npm run status` in marccent-theme. It shows which projects are behind the theme and by how much.
4. **Sort the dependents**:
   - An **active** dependent that is behind, or that the change breaks: one issue in that project's repo, labeled `project: <repo>`, that says what to bump and what to fix. Give it to Code in that repo.
   - A **frozen** dependent (see `docs/projects.json` `stage`): no issue, one line in the report saying it was checked and is frozen. Marcos decides when it moves.
   - A dependent the change does not affect: one line in the report, saying why.
5. **Stopgaps and tickets**: if the change ships a `ticket` issue, every project waiting on it gets its own issue to remove its stopgap, and a "Waiting on this" line on the ticket, per `PRODUCT-LINE.md` section 8.
6. **Report the full list** to Marcos: every dependent, its stage, its pin, and the issue for it (or why there is none). Marcos gives each issue to the person or instance named in its `Give to:` line.

Hub never fixes a dependent itself. The issue is the handoff.

## Feedback format: who to give it to

Every piece of feedback Hub writes names the owner, in a fixed line, before anything else in that piece:

- `Give to: Code in <repo>`: a code or docs fix in that repo. Code does it.
- `Give to: Chrome`: a browser check. Chrome does it and reports to Marcos.
- `Give to: Marcos`: a decision, a merge, or anything only Marcos can do.

Each feedback also carries the issue link for the problem. If there is no issue yet, Hub creates one first (below) and then gives the link.

## Hub creates an issue for every problem it finds

Every problem Hub finds, in any repo, becomes a GitHub issue in the repo that owns the fix. Hub writes it with the template in [ISSUE-TEMPLATE.md](ISSUE-TEMPLATE.md). Use the labels `code` or `chrome` when the repo has them. If it does not, put the owner in the body's `Give to:` line. Creating an issue changes no file (see "Issues are not code" above).

## Open questions for Marcos (not settled by these rules)

1. **Which projects are active?** Working answer (Hub's, from project memory of Marcos's 2026-11-10 decision; Marcos may override): **only marccent-theme and the WordPress side are active**: marccent-wp, marccent-blocks and marccent-content, with marccent-patterns and marccent-kits as they feed the WordPress site. django-marccent, marccent.com and the HTML site wait. 1.0 is the template (theme plus adapters); site instances are out of 1.0.
   The lines that disagree with this are: `docs/WORKING.md` rule 9 (says only wp and marccent-theme), `docs/PRODUCT-LINE.md` section 3.5 (says only marccent.com and the wp site), and `docs/projects.json` (marks patterns and kits active, and lists marccent.com and django by stage). Marcos decides whether to align them; until he does, this paragraph is the working rule.
2. **Can Hub and threads create issues?** Working answer: yes, when Marcos asks. Issues are not code (see "The docs exception" above).
3. **The WSL workspace.** Working answer: only the Ubuntu distro was removed on 2026-11-19. The repos live in Debian WSL under `~/app`, and `~/app/wp` holds the WordPress submodules. Marcos to confirm if this is wrong.
