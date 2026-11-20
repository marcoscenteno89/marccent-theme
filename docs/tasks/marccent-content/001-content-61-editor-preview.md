# Task 001: Content #61, the editor's preview

Status: blocked
Repo: marccent-content
Issue: marcoscenteno89/marccent-theme#61 (label `project: marccent-content`, milestone 1.0, kind `bug`)
Branch base: origin/main, after PR #5 is merged
Give to: Code in marccent-content

## Goal

The editor previews a related Loop's first post, and shows counts and sums from the server, not empty labels.

## Files

- `inc/blocks.php`: a new REST route `GET marccent-content/v1/preview`, and `wp-url` added to the editor script's dependencies.
- `assets/editor.js`: a `marccent-content/preview` data store; the Loop note; count, sum and binding values read from the server.
- The patch: `/mnt/project-files/handoff/tasks/content-61.patch` (commit `c2c92c9`, made on top of PR #5's head `81d0bbe`). It is outside the repo; Marcos copies it in. Docs are `.md` only, so the patch is not committed under `docs/`.

## Exact steps

1. Do not start until PR #5 (`claude/project-thread-1t553q`, head `81d0bbe`) is merged into `main`.
2. `git fetch origin && git checkout -b claude/content-61-editor-preview origin/main`.
3. Apply the patch: `git am /mnt/project-files/handoff/tasks/content-61.patch`. If it fails on context lines after the merge, use `git apply --3way` and resolve by hand. Do not rewrite PR #5.
4. Do not rebase or force-push anything already on origin.
5. The change, in short:
   - `GET marccent-content/v1/preview` takes `?post=ID&loop={json}` and returns `{ "id": N }`, the Loop's first post, from the page's own query (`mcc_loop_query`) run with the current post. Permission: `edit_post` for that post, or `edit_posts` when no post is given.
   - `?post=ID&key=count:…` or `sum:…` returns `{ "value": "…" }` from `mcc_value(…, 'raw')`. A private field stays empty here.
   - The editor caches each answer by path in the store, so blocks redraw when it arrives.
   - A related Loop's note shows the related first post. In a template with no current post, it says it previews any one post of its type.
6. Open the PR (one goal; see Done when).

## Checks

- `php -l inc/blocks.php` and `node --check assets/editor.js`. Paste the output.
- If the repo has a test or lint script, run it and paste the output.
- Do not say it works in the editor. Those checks need wp.localhost, so they are Chrome's, given through Marcos. Write them in the PR body under "Still to check on wp.localhost":
  - a Loop related to the post being edited previews the related post, not the type's first;
  - a Loop in a template previews a post of its type and says so;
  - a count such as `count:work_order.account?status=New` shows its number in the editor;
  - a private field's count or sum shows nothing, in the editor and in the REST preview when logged out.

## Done when

- The PR title is "The editor previews a related Loop and counts and sums from the server".
- The PR body starts with `Fixes marcoscenteno89/marccent-theme#61`, then the summary, the checks run with output, and the wp.localhost list above.
- No model name in the commit or the PR. Attribution lines as the repo's PR convention asks.

## Notes

- Blocked until PR #5 is merged to `main`. Hub changes this to `open` when that happens.
- The old patch `patches/content-61-editor-preview.patch` in /mnt/project-files is commit `0a8cecd`, from before PR #5. Do not use it.
