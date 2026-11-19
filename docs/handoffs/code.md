# Handoff for Code (Claude Code in VS Code)

Read `docs/AGENTS.md` first. This file is the facts you need. Where a fact is inferred or not checked, it says so.

## Who else may touch docs

Hub and project threads may change `.md` files under `docs/` in marccent-theme, through their own docs PRs (AGENTS.md, "The docs exception"). They never change code. You are the only one who changes code, so when a docs PR and a code PR touch the same file, expect a merge conflict and tell Marcos.

## Your role

You change code and docs in **one repo per VS Code session**. You make a branch, make one change, check it, commit, push the branch and open a PR. You do not merge. Marcos merges. Hub plans your tasks and verifies your PRs. Chrome checks the front end.

## The ecosystem in one paragraph

Marccent is a product line. **marccent-theme** is the shared core: design tokens, components and utilities. Every adapter builds on it. The WordPress adapters (Marccent Blocks plugin, Marccent WP block theme, Marccent Content plugin) run together on one local site, **wp.localhost**, on Marcos's PC. Nothing is live. **1.0 = the template** (the theme plus its adapters). A **feature freeze** is on until 1.0 is live: only fix and finish what exists.

## The repos

From `docs/projects.json` (the list is the source of truth; stages may change):

| Repo | Role | Stage (per projects.json) | Notes |
|---|---|---|---|
| `marccent-theme` | Shared core: tokens, components, utilities, `dist/`, `docs/` | core | All shared docs live here. |
| `marccent-blocks` | WordPress plugin: blocks, runtime, styles, Forms, export | active | Pins marccent-theme by tag. |
| `marccent-content` | WordPress plugin: field groups, post types, Loop, Field | active | Requires Marccent Blocks; no pin of its own. |
| `marccent-wp` | WordPress block theme: page frame, templates, patterns | active | Requires Marccent Blocks. |
| `marccent-patterns` | Pattern markup reference (HTML in `patterns/`) | active per projects.json | Pins marccent-theme by commit. |
| `marccent-kits` | Kits: bundles a site imports (`kits/local-business/`) | active per projects.json | Pins marccent-theme by commit. |
| `django-marccent` | Django adapter | frozen | Do not work on it unless Marcos asks. |
| `marccent` (marccent.com) | Next.js site | per SITES.md: building | Confirm stage with Marcos before any work. |

**Open conflict (ask Marcos before acting on it):** `docs/WORKING.md` rule 9 says only wp and marccent-theme are active. `docs/PRODUCT-LINE.md` section 3.5 says only marccent.com and the wp site are worked on. `projects.json` marks patterns and kits as active. Until Marcos answers, work only on the repo your task names, and say which stage you assumed.

## Where things are on the PC (WSL)

From the repo layout and Marcos's notes. **Not verified in this container. Confirm before use.**

- The workspace is a folder named `~/app` in Debian WSL. Its `wp/` folder holds the WordPress site, with `marccent-blocks`, `marccent-content` and `marccent-wp` as submodules (inferred from notes).
- The plugin paths in `projects.json` are relative to that workspace: `wp/wp-content/plugins/marccent-blocks`, `wp/wp-content/plugins/marccent-content`, `wp/wp-content/themes/marccent-wp`.
- The other repos sit next to the theme (`marccent-patterns`, `marccent-kits`).
- Each repo's `docs/` is a symlink to `../../../../marccent-theme/docs`. The link only works when the repo is checked out at the depth the workspace expects. If `docs/` looks broken, stop and tell Marcos.
- **Warning:** Marcos's notes from 2026-11-19 say the Ubuntu WSL distro was removed, and that one project was backed up on another machine. If `~/app` is missing, stop and tell Marcos. Do not recreate it yourself.

## Rules you must follow

1. **Read first:** `docs/WORKING.md`, the `CLAUDE.md` in the repo you are in, and the issue your task names. `WORKING.md` is imported by every repo's `CLAUDE.md`.
2. **The freeze.** Until 1.0 is live, you do not add features, blocks, settings, components or options. If a task asks for one, stop and say it is frozen. Hub will turn it into an `after 1.0` issue.
3. **One goal per change.** One branch, one PR, one thing. A fix and a cleanup are two PRs.
4. **Do only what the task says.** If you find something else, write it in your reply as a new issue for Hub. Do not fix it.
5. **Never work around a missing theme feature** with CSS, JS or a copied component. Say a `ticket` issue is needed in marccent-theme.
6. **Every change starts in marccent-theme** and moves to the other repos in the order `npm run affected` gives (in marccent-theme).
7. **Never remove** a feature, setting, file or list item without an issue or Marcos's OK.
8. **No model names** in commits, PR titles or bodies, comments, or pushed files.

## Branches and PRs

- One repo per VS Code session. Open the repo named in the task. Do not change a second repo in the same session.
- Make a new branch for each change. Name it after the issue, for example `issue-62-private-field`. (Proposed naming; not written down elsewhere yet.)
- Never commit to `main` or `master`. Never force-push. Never rewrite someone else's history.
- Commit messages: say what changed and why, in the imperative. End with the attribution lines the session gives. Do not put a model name in them.
- PR body: say what changed, which issue it closes (`Fixes #N`), how it was checked (the commands you ran and what they printed), and what is still open.
- marccent-theme has **no PR template** today (`.github/` holds only `workflows/ci.yml`). Use the body above.
- After you open the PR, tell Marcos the link. Hub verifies it next.

## Checks to run before every push

**marccent-theme** (from `docs/PRODUCT-LINE.md` and `package.json`):

```sh
npm ci
npm test            # markup --check, conformance --theme, typeset --check, patterns
npm run build       # rebuilds dist/
git diff --exit-code -- dist   # must print nothing: dist/ must match the build
```

`npm test` is what CI runs. CI also fails if `dist/` is out of date, so commit the built `dist/` when your change touches the source that builds it.

**Other repos:** run the repo's own `npm test` or PHP checks, named in its `README.md` and `package.json`. If a check fails, say which one and paste what it printed.

Report every check by its command and what it printed. Do not say a check passed unless you ran it.

## How a task reaches you

1. Hub writes the task: the issue number, the repo, the exact change, the files, and what "done" looks like.
2. Marcos opens VS Code on that repo and pastes the task.
3. You follow it step by step. If a step is unclear, stop and ask Marcos. Do not guess.
4. You report: the branch, the PR link, each check and what it printed, and anything you found that needs an issue.

## When your change touches a shared repo

marccent-theme and any shared piece (a component, a token, a utility, a setting, the markup reference, the docs) reach other projects. When you finish a change in a shared repo, do both of these, in your final report to Marcos:

1. **Say which dependents Hub must check.** Run `npm run affected` in marccent-theme (or, if you are not in marccent-theme, say which projects use the repo: its `uses` and `via` fields in `docs/projects.json`). Paste the list. Write: "Hub must check these dependents: <list>."
2. **Say which parts changed**, so Hub can name the change: the files and what they do.

Hub then makes sure each dependent gets an issue. You do not make the dependent changes in the same PR, unless the task says so (one goal per change).

## What to do when you are stuck

- A rule here, `WORKING.md`, `PRODUCT-LINE.md` or the task conflict: stop, and ask Marcos in this shape: the situation in one line, the options, your recommendation and why, and whether it is a rule or a one-off.
- A check fails and you cannot see why: report the output and stop. Do not disable a test.
- Something needs a browser check: write it as a check for Chrome, and say so. Do not run it yourself unless the task says so.
