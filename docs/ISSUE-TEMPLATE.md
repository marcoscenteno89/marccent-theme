# Issue template (for Hub, and for anyone who opens a Marccent issue)

Use this for every problem Hub finds, in the repo that owns the fix. Copy the block below into the new issue. Fill every section. If a section does not apply, write "Not applicable, because …" rather than deleting it.

## Title

`<repo>: <what is wrong, in plain words>`

Example: `marccent-content: a private field's value leaks through a Loop's where`

## Labels

- `project: <repo>`: the repo that owns the fix (e.g. `project: marccent-content`).
- One kind label: `bug` (broken), `feature` (an improvement to what exists), `after 1.0` (new: frozen), or `idea` (not decided).
- `ticket`: only when marccent-theme must ship the fix and projects wait on it.
- `code` or `chrome`: when the repo has the label. Check first. If the repo does not have it, leave it off and put the owner in the body's "Give to" line.
- Milestone `1.0`: for every `bug` and `feature`. None for `after 1.0` and `idea`.

## Body

```
## What is wrong
One or two sentences. What happens now.

## Where
- Files: the exact paths and function names (e.g. `inc/blocks.php`, `mcc_where_meta`).
- Lines: if known.
- Related: links to the PR or issue that introduced or touches it (e.g. PR #5).

## Expected
What should happen instead, in one or two sentences. Name the rule it comes from (PRODUCT-LINE.md section, or the issue).

## How to verify
- Code check: the exact command, and what a pass looks like. Example: `npm test` prints no failure lines and exits 0.
- Browser check (Chrome): the exact steps. The URL, logged in or out, which page, what to look for, and what a pass looks like.
- If it is a check Hub runs: the command and the output it expects.

## Give to
Give to: Code in <repo>
   (or: Give to: Chrome)
   (or: Give to: Marcos)

## Notes
Anything else the owner needs. Mark what is inferred rather than read from the code.
```

## Rules for filling it in

1. The title says what is wrong, not what to do.
2. "Where" names real files and functions. Check that they exist before you write them.
3. "How to verify" is written so the owner can run it without asking. Numbered steps. No "etc.".
4. The "Give to" line is always present, and is the first thing the owner reads on the handoff.
5. One problem per issue. Two problems, two issues.
6. A problem that is only a question for Marcos gets `Give to: Marcos`, and says what decision is needed.
