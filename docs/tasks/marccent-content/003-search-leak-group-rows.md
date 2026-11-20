# Task 003: a visitor's search over group rows reads private values

Status: open
Repo: marccent-content
Issue: marcoscenteno89/marccent-content#7
Branch base: claude/project-thread-1t553q (PR #5's branch, head `81d0bbe`)
Give to: Code in marccent-content

## Goal

A Loop's visitor search over a repeating group's rows does not match on a private row field's value. This fix lands on PR #5's branch, before PR #5 merges.

## Files

- `inc/blocks.php`: function `mcc_loop_rows`.
- `tests/private-where.php`: one new case.

## Exact steps

1. `git fetch origin && git checkout claude/project-thread-1t553q && git pull --ff-only`.
2. Read `mcc_loop_rows` in `inc/blocks.php`. Find where the visitor's search text is matched against row fields.
3. Make a private row field never match the search, as `mcc_where_row` already does for a private value (it reads empty). One change, in that function.
4. Add a test case to `tests/private-where.php`: a repeating group with a private row field, a row whose private value is `12345`, and a visitor search for `12345`. Expected: no rows. Also: a search for a public field's text on the same row still finds it.
5. Commit on top of `81d0bbe`. Push normally. Do not force-push and do not rewrite `81d0bbe`. PR #5 picks up the commit.

## Checks

- `php -l inc/blocks.php tests/private-where.php`. Paste the output.
- `docker exec wp-test php /var/www/html/wp-content/plugins/marccent-content/tests/private-where.php`. Paste the output. Expected: every case PASS, exit 0.

## Done when

- The test prints PASS for the new search case and the existing cases.
- The PR #5 body (or a comment on it, via Marcos) says the search fix is in. Do not close #7 from this task; Hub does that on merge.

## Notes

- Related: marccent-content #6 (the `where` leak, fixed in `81d0bbe`) and #7 (this). Do not close #6 from this task.
- Chrome checks the browser side after the branch is installed. Hub gives those steps; see issue #7.
