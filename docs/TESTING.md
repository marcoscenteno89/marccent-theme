# TESTING.md: how Marccent is tested

Status: plan. Parts marked **(to build)** do not exist yet. Each is a task in `docs/tasks/`, and this file is updated when a task is done. Until then, the checks that exist today are `npm test` in marccent-theme and the CI jobs in each repo.

Read this before you write a test, a task that adds a test, or a Chrome check.

## 0. The gate for a public component (rule, Marcos 2026-11-20)

A component is **public** when it is exported from marccent-theme (any entry in `package.json` `exports` that a site or adapter can import, and every component in `markup/cases.json`). A public component is available to the public (exported, released, or pinned by an adapter) only when it passes its own tests **in marccent-theme**, before it touches WordPress or any adapter.

Two tiers:

- **Tier 1, the theme (required for every public component).** Component-level tests in marccent-theme, run on the cases page: each case at 375, 768 and 1280, light and dark, with screenshots, no console errors, no horizontal scroll, and no serious or critical axe violations. Plus unit tests for any logic the component has (for example `lib/*.js`). Tier 1 is a CI gate, so `npm test` and the `e2e` job fail when a public component has no case or no test.
- **Tier 2, the adapters (required before a component is used in WordPress).** A wp-env site (section 1) runs the standard admin and incognito checks (section 3) for the adapter's use of the component. Tier 2 never replaces tier 1. A component that fails tier 1 is not shipped to any adapter, even if its WordPress checks pass.

Rules that follow from this:

- A new public component ships with its cases and tests in the same pull request. A pull request that adds a public component with no tests fails CI.
- A component with no tests is not public. It stays internal, or it is listed as not covered and kept out of the exports.
- The coverage check is in marccent-theme's CI (task 006). Until it exists, Hub checks coverage by hand and says so in the review.
- Chrome checks are judgment checks on top of tier 1 and tier 2. They do not count as the tier 1 gate.

## 1. The stack and where each part runs

| Part | What it does | Where it runs | When it runs |
|---|---|---|---|
| `npm test` (existing) | Markup, conformance, typeset and pattern checks | marccent-theme | Every push and pull request (`.github/workflows/ci.yml`) |
| **Playwright** (to build) | Drives a real browser against a real page, for CI gates and screenshots | marccent-theme for the markup and design checks. The WordPress repos for anything that needs WordPress | CI gate on every pull request. Screenshots on every pull request that changes markup, CSS or a block |
| **wp-env** (to build) | A throwaway WordPress site in Docker with Marccent Blocks, Marccent Content and Marccent WP installed | marccent-content, marccent-blocks, marccent-wp (CI jobs in each) | Every pull request in those repos that touches PHP, blocks or settings |
| **Cases page** (existing) | `npm run cases` renders every component's markup, the golden test for markup | marccent-theme | Every push and pull request, and at release |
| **Screenshots** (to build) | Playwright captures at three widths (below) | Same as Playwright | On every pull request that changes a visual, and at release |
| **Chrome** | A person-like check of what a page looks like and how it behaves, reported to Marcos | A browser, on wp.localhost | Judgment checks, and checks Playwright cannot make. Chrome is **never a CI gate** |

Rules:

- A CI gate is a Playwright or PHP test that fails the build. Chrome never fails a build. A Chrome PASS is evidence for Hub, not a gate.
- Every gate runs on the exact head SHA of the PR.
- Test data is seeded by a script and torn down after the run. Tests never touch real content, real users or real settings on any live site.

## 2. Widths and themes every visual test covers

- Widths: phone **375**, tablet **768**, desktop **1280**. Screenshots at deviceScaleFactor 2 when a person will see them. Use 1 for checks only a machine reads.
- Light and dark mode, and at least the design styles the change touches (the 27 styles are in `styles/themes/`).
- The width rule: no horizontal scroll at 375. Components set no width and no outer margin (PRODUCT-LINE.md section 4, rule 9).

## 3. The standard checks every feature gets from the start

Each feature gets a test in **both** contexts below. A feature that touches only one context says so in its task and in the PR body.

### 3.1 Admin, logged in

Run as an administrator. Run as an editor too wherever a capability check matters.

- [ ] The admin screen loads with no PHP notices, warnings or deprecations in the log.
- [ ] No JavaScript console errors on the screen.
- [ ] Settings save, and reload with the saved values.
- [ ] Every form and AJAX call checks its nonce and its capability (a request without them is refused).
- [ ] An editor cannot reach an admin-only screen or action (the response is refused, not just hidden).
- [ ] A block can be inserted, edited, saved and reloaded with the same values.
- [ ] Private fields (marccent-content) stay visible to the admin and only the admin.

### 3.2 Incognito, logged out

Run in a fresh browser context with no cookies.

- [ ] The page renders, and the main content is there.
- [ ] No admin-only or private data appears in the HTML, the REST API (`/wp-json/`), JSON-LD, feeds or sitemaps. Check with a known test value seeded for the run.
- [ ] No JavaScript console errors.
- [ ] No broken assets: fonts, CSS and JS all return 200.
- [ ] Forms submit, and the spam checks apply (a form without them is a failure).
- [ ] Login-only links and menus do not show.

### 3.3 Both contexts

- [ ] Light and dark mode, and the design styles the change touches.
- [ ] The three widths in section 2, with no horizontal scroll at 375.
- [ ] Basic accessibility with axe: labels, colour contrast, focus order, and keyboard use of every control.
- [ ] Performance basics: no new render-blocking script or stylesheet without a reason in the PR body.

## 4. How Code writes a test for a task

1. Read this file and the task's **Checks** section. Every check in the task maps to a test or to a named Chrome step.
2. Put each standard check from section 3 that the change touches in the test, and name it in the test title, for example `admin: settings save and reload`.
3. Use the seed helpers in the repo (to build). Seed a value you can search for, such as `PRIVQA<random>`, and assert it is or is not in the output. Remove it in teardown.
4. Name the output in the PR body: the command you ran and the last lines it printed.
5. A test that needs a browser runs in Playwright. A test that needs a person's judgment is written as a Chrome step.

## 5. How a Chrome step is written

A Chrome step in a task has this shape:

```
Chrome: <page or admin screen>, on wp.localhost, commit <full SHA on the branch>
Steps: 1. ... 2. ...
Expect: ...
Report: PASS or FAIL, the commit, what was seen, and a screenshot file name if taken.
```

Chrome reports through Marcos. Chrome names the commit it tested. A PASS on any other commit does not count.

## 6. Test data rules

- Seed by script, at the start of the run. Tear down at the end, even when a test fails.
- Use marked values (`PRIVQA<random>`) and a test-only post or page title that starts with `[test]`.
- Never edit a real post, page, user, option or setting on a live site. Tests run only on a local wp-env site or on wp.localhost.
- Never commit a credential. Test users get a generated password each run.

## 7. What runs first (the build order)

Core first, then downstream (AGENTS.md, WORK FLOWS DOWNSTREAM):

1. **(to build) marccent-theme:** the Playwright and screenshot harness, and the cases page run in CI.
2. **(to build) marccent-content:** wp-env and the Playwright baseline. The private-field test (`tests/private-where.php`, task 002, option A) is folded into it, so it can replace or extend that job.
3. **(to build) marccent-blocks and marccent-wp:** the same wp-env setup and baseline, then the standard checks in section 3 per block and per admin screen.

Each step is a task in `docs/tasks/`, ordered so that the core task comes first.

## 8. Playwright, and how it fits

Playwright is a test tool that drives a real browser (Chromium here) from code. It opens a page, clicks, types, resizes the window, reads the page's HTML and console, and takes screenshots. A Playwright test is a script that does this and then checks the result. It is the browser part of the stack in section 1. It does not replace the PHP or markup checks (`npm test`, the cases page), and it does not replace Chrome for judgment checks.

Where each part sits:

- **Unit checks** (`npm test`, the markup and conformance scripts): read files and check the output. No browser.
- **Playwright** (tier 1 for every public component, section 0): opens each case from the cases page in a browser, at three widths, in both colour schemes. It fails on console errors, horizontal scroll and axe violations, and it saves screenshots.
- **wp-env + Playwright** (tier 2): the same tool, pointed at a throwaway WordPress site, for the admin and incognito checks.
- **Chrome** (judgment): a person-like check that reads and reports. Never a gate.

## 9. Watching the tests

Marcos wants to watch the tests run in a real browser. Three commands do this (added as package scripts by task 006):

- `npm run test:ui`: opens Playwright's test UI. Pick a test, run it, and watch each step, with the page, the console and the network beside it. Use this to learn the tests and to debug one.
- `npm run test:headed`: runs the whole suite in a visible browser window, one test after another.
- `npm run e2e`: the same suite, headless (no window). This is what CI runs.

Where it runs: the tests run in WSL Debian on Marcos's PC. The browser window shows through WSLg (Windows' built-in display for Linux apps), so `test:headed` and `test:ui` open on the Windows desktop. If WSLg does not show the window, run `npm run test:ui -- --ui-host=0.0.0.0` and open the printed address in Windows Chrome.

When CI fails, it keeps the evidence. The `e2e` job saves, for each failing test, a **trace** (a step-by-step recording with screenshots, console and network), a **video**, and the **screenshots**, as artifacts on the run. To open a trace on your PC, download the artifact and run `npx playwright show-trace <file>.zip`. That opens the same step-by-step viewer that `test:ui` uses.

Tests are headless in CI and headed only on request. A headed run is never a gate.

**Rule for Code (Marcos, 2026-11-20): run browser tests with `--ui`.** When Code runs Playwright locally, it opens `npm run test:ui` so Marcos can watch. It also runs the headless `npm test` (and `npm run e2e`) for the result it reports, because the UI does not exit or give a pass or fail code. CI stays headless. The same rule is in `docs/handoffs/code.md` (Checks) and the paste-ready copy in project files.

## 10. Who owns what

- **Code** writes and runs the tests in its repo, and reports the output in the PR.
- **Hub** checks the tests exist for the standard checks, reads the output, and merges under the gate.
- **Chrome** runs the Chrome steps and reports PASS or FAIL with the commit.
- **Marcos** decides what counts as a rule change. A new standard check goes in this file through a docs PR, with his OK.
