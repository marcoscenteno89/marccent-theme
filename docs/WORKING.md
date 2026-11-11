# Working in a Marccent project

Every project's `CLAUDE.md` imports this file, and it is the only copy. To change how Claude works in any project,
change it here, in marccent-theme, and in one commit. The projects reach it through their `docs/` link. Never copy
these rules into a project's `CLAUDE.md`.

The rules themselves live in [PRODUCT-LINE.md](PRODUCT-LINE.md). Read it before any change, and don't copy its rules here
either. What follows is how to apply them, and it isn't optional. **Your work** is the open issues in marccent-theme
labeled with your project (`project: <repo>`, the label your `CLAUDE.md` names), on the Marccent board
(PRODUCT-LINE.md section 8).

1. **Feature freeze until 1.0 is live** (PRODUCT-LINE.md section 3). Only debugging, fixing and finishing what
   exists. When someone asks for anything new (a feature, block, setting, component, option), say it's frozen and
   open an issue for it labeled `after 1.0` and your project. Then
   stop there, unless the person confirms it's finishing existing work.
2. **Issues follow PRODUCT-LINE.md section 8 strictly:** a `project:` label and one kind label each, the 1.0
   milestone for bugs and requests. Work the theme fixes is one `ticket` issue; a project waiting on it gets its
   label and a line under "Waiting on this", never a copy. Move the card to In progress when you start (at most 3
   there) and close it with `Fixes #N`; the stopgaps go in the same round.
3. **Don't run on your own.** Do what was asked and nothing more. Anything else you find (a bug, a cleanup, a
   missing component) becomes an issue and is named in your reply; it isn't fixed in the same change.
4. **No custom assets; adapters only translate** (section 4). When marccent-theme can't do something, open a `ticket`
   issue in marccent-theme, labeled with the project that needs it. Never work around
   it with CSS, JS or a copied component.
5. **Every change starts in marccent-theme, then moves to the other projects** (section 4.4). Whatever is changed,
   the theme's part (its code, its docs, its issues) is done, checked and released or pinned first; only then
   is each project that uses it moved to it, in the order of `npm run affected`. Never change a project first and
   bring the theme in after.
6. **Every change keeps the issues in sync.** A change that ships a ticket closes it (`Fixes #N`) and removes its
   stopgaps in every project it names, in the same round. Before you finish, run marccent-theme's checks from the
   workspace: `npm test` (conformance included).
7. **Tell Marcos when he's wrong.** If a request breaks these rules, the current structure or a common
   convention, say so first and plainly ("That's wrong, because…"), with the fact behind it: the rule, the file,
   the standard. No sugar coating and no praise padding. Then do what he decides once he's heard it.
8. **When no rule covers it, stop and ask** (PRODUCT-LINE.md section 9).
   - Look first in PRODUCT-LINE.md, this file, the issues, section 9's Decisions and how the other projects do it.
   - If nothing settles it, or two rules conflict, stop that part and ask Marcos in section 9's shape: the
     situation, the options, your recommendation and why, and whether it's a rule or a one-off. Then write the
     answer down in the same round. Never settle it in one project alone.
   - Section 9 also holds: no claim without output (name the command you ran and what it printed), one goal per
     change, and nothing removed without a ticket or Marcos's OK.
9. **Only wp and marccent-theme are active** (`stage` in [projects.json](projects.json)). Frozen projects get no
   pin bumps, no rule copies and no work unless Marcos asks for it.
