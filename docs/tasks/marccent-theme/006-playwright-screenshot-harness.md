# Task 006: Playwright and screenshot harness for the cases page (CI gate)
Status: open
Repo: marccent-theme
Issue: none
Branch base: master
Give to: Code in marccent-theme

## Goal

Every public component in marccent-theme (`docs/TESTING.md`, section 0, tier 1) is tested on its own, on the cases page, before any adapter uses it. Marcos's rule (2026-11-20): a component passes these tests in the theme's harness before it touches WP or an adapter, and that is the gate for it being publicly available. This task builds the harness and the coverage check that enforces the rule in CI.

Every design-visible change in marccent-theme is checked in a real browser on every pull request, at three widths, in light and dark mode. The check is a CI gate: it fails the build on a console error, horizontal scroll at phone width, or a serious or critical accessibility violation. It also saves screenshots as a CI artifact. This is the core half of `docs/TESTING.md`, sections 1 to 3. It is core work, so it goes first.

Task 005 (the rc.26 release) is older and comes first. Do not start this task until task 005 is merged.

## Files

- `package.json`: add `@playwright/test` and `@axe-core/playwright` as devDependencies, pinned to exact versions. Add the scripts `"e2e": "playwright test --trace off"`, `"test:headed": "playwright test --headed --trace off"` and `"test:ui": "playwright test --ui"`. Do not change the existing scripts.
- `playwright.config.mjs` (new): three projects named `phone` (375 px wide), `tablet` (768 px) and `desktop` (1280 px). A `webServer` entry serves the output of `npm run cases` on port 4173.
- `tests/e2e/cases.spec.mjs` (new): the checks in the Exact steps.
- `scripts/public-coverage.mjs` (new): the coverage check. It reads `package.json` `exports` and `markup/cases.json` and fails when a public component has no case, or has no test file under `tests/`. Add it to `npm test` (not to `npm run e2e`), so the existing `check` job enforces it. Print each public component with its case count and test file.
- `.github/workflows/ci.yml`: a new job `e2e`. Keep the existing `check` job unchanged.
- `markup/coverage-gaps.json` (new): the allowlist described in step 6b.
- `docs/TESTING.md`: in section 1, change the Playwright and screenshots rows from "(to build)" to "(built, task 006)". Change nothing else in that file.

Do not change any component, style or script. If the cases page does not render without a change to the code, stop and report why.

## Exact steps

1. `git fetch origin` then `git checkout -b claude/e2e-cases-harness origin/master`.
2. Read `scripts/cases.mjs` and find where `npm run cases` writes its output (the folder and file names). Write that path in the PR body.
3. Read `markup/cases.json` and list how many cases there are. Write the number in the PR body.
4. Run `npm install` and `npx playwright install --with-deps chromium`. Pin the versions you installed in `package.json`.
5. Write `playwright.config.mjs` with the three projects. Set `use.colorScheme` to run each test in `light` and in `dark` (two runs per width; name them in the test title).
6. Write `tests/e2e/cases.spec.mjs`. For every case in `markup/cases.json`, at every width and in both colour schemes:
   a. Load the case's page at `http://localhost:4173/<case path>`.
   b. Fail if `console` has any `error` message or an uncaught page error. Collect them with `page.on('console')` and `page.on('pageerror')`.
   c. Fail if `document.documentElement.scrollWidth > document.documentElement.clientWidth` (no horizontal scroll).
   d. Run `new AxeBuilder({ page }).analyze()` and fail on any violation with impact `serious` or `critical`. Print the rule ids of the failures.
   e. Save a screenshot to `test-results/shots/<case>-<width>-<scheme>.png`. Use `deviceScaleFactor: 2` for the screenshots a person reads.
6b. Write `scripts/public-coverage.mjs` as described under Files. Add `node scripts/public-coverage.mjs` to the `test` script in `package.json`, after `patterns.mjs`. Run it once with the current tree. Components that have no case yet are listed as failures. Do not add cases for them in this PR. Instead, list them in the PR body as the gap, and mark each one with the issue number that tracks it (issue #165 covers atom, calendar and clock). If the check fails on the current tree, make it report, not fail, for the listed components only, using an explicit allowlist file `markup/coverage-gaps.json` that names each gap and its issue. The allowlist may only shrink. A new public component that is not in the allowlist fails CI.
7. Add the `e2e` job to `.github/workflows/ci.yml`. It runs on `push` and `pull_request`, Node 22. Steps: checkout, `npm ci`, `npx playwright install --with-deps chromium`, `npm run build`, `npm run cases`, `npm run e2e -- --trace off`. Upload `test-results/shots/` as an artifact named `screenshots` on every run (also on failure).
7b. Failure evidence: in `playwright.config.mjs`, set `trace: 'retain-on-failure'`, `video: 'retain-on-failure'` and `screenshot: 'only-on-failure'`. In the `e2e` job, upload `test-results/` as an artifact named `failure-evidence` with `if: failure()`. Do not record traces or videos on passing runs.
8. Update the one line in `docs/TESTING.md` (Files list above). Check that section 9 of `docs/TESTING.md` (Watching the tests) matches the scripts and the trace step. If a command in it does not work, say which one in the PR body, and do not change section 9 in this PR.
9. Run the checks below. Commit with a message that says what changed and why. Push `claude/e2e-cases-harness` with `git push -u origin claude/e2e-cases-harness`. Open a PR into master. The PR body starts with the two attribution lines, then the task path, then the check output.

## Checks

- Browser rule: open `npm run test:ui` for Marcos to watch, and say so in the PR body. The result you report comes from the headless `npm test` and `npm run e2e`.
- `npm test` passes, including `scripts/public-coverage.mjs`. Paste the output of the coverage check: the count of public components, cases and tests, and the allowlisted gaps.
- A new public component with no test file, on a throwaway branch (do not merge), makes `npm test` FAIL. Paste the failing line. Delete the branch.
- `npm test` passes. Paste the last 5 lines.
- `npm run e2e` passes locally. Paste the summary line (the count of passed tests).
- `npm run test:headed` opens a visible window and runs (run it under WSLg, or say why you could not). Paste the summary line.
- A deliberate failure on the throwaway branch produces `test-results/` with a trace `.zip`, and `npx playwright show-trace` on that zip opens without error. Paste the command and the first line of its output.
- On the branch, the `e2e` CI job passes. Paste its last 30 lines.
- Throwaway branch `claude/e2e-leak-check` (do not merge it): add one case, or one style, that makes the page overflow horizontally at 375 px. Push. The `e2e` job must FAIL with a scroll message. Paste the failing lines. Then delete the branch.
- Attach the screenshot count: `ls test-results/shots | wc -l`, pasted.

## Done when

- The `e2e` job passes on the PR, and the throwaway branch showed it failing on horizontal scroll.
- The PR body lists the pinned versions, the case count, the screenshot count and the check output.
- Give Hub: the branch, the PR link, the job result (pass), and the leak run (fail). Hub verifies CI and merges.

## Notes

- Chrome is never a CI gate. Do not add a Chrome step to this job.
- Where the test cases come from is in `docs/TESTING.md`, section 3a: the generated case test, axe-core, the W3C APG pattern for each interactive component type (with a test per pattern, named in its title), and PRODUCT-LINE's rules. The APG keyboard tests are part of this task for the component types in `markup/cases.json` that have a pattern. List in the PR body each type that has a pattern and each that does not.
- The allowlist (`markup/coverage-gaps.json`) lists known gaps, not a way to skip a component. The gate in `docs/TESTING.md`, section 0, applies to every public component.
- This harness checks the cases page only. The WordPress admin and incognito checks are in `docs/TESTING.md`, section 3, and come with the wp-env tasks in marccent-content and marccent-blocks, which wait for this one.
- The `e2e` job must not be marked as optional or allowed to fail.
