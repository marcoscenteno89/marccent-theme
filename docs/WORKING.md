# Working in a Marccent project

Every project's `CLAUDE.md` imports this file, and it is the only copy. To change how Claude works in any project,
change it here, in marccent-theme, and in one commit. The projects reach it through their `docs/` link. Never copy
these rules into a project's `CLAUDE.md`.

The rules themselves live in [PRODUCT-LINE.md](PRODUCT-LINE.md). Read it before any change, and don't copy its rules here
either. What follows is how to apply them, and it isn't optional. **Your work list** is the one your project's
`CLAUDE.md` names: [TICKETS.md](TICKETS.md) for marccent-theme, and `docs/todo/<repo>.md` for every other project.

1. **Feature freeze until 1.0 is live** (PRODUCT-LINE.md section 3). Only debugging, fixing and finishing what
   exists. When someone asks for anything new (a feature, block, setting, component, option), say it's frozen and
   add it to your work list (in TICKETS.md, a ticket marked after 1.0; in a project's list, under After 1.0). Then
   stop there, unless the person confirms it's finishing existing work.
2. **Work lists follow PRODUCT-LINE.md section 8 strictly:** the template's five sections and one item shape, with
   its found date. Work the theme fixes is linked by ticket ID under Waiting on, never copied. Every project a
   ticket names in Who has a Waiting on line for it. When a ticket moves to Done, those lines and the stopgaps go
   in the same round.
3. **Don't run on your own.** Do what was asked and nothing more. Anything else you find (a bug, a cleanup, a
   missing component) goes on the list and is named in your reply; it isn't fixed in the same change.
4. **No custom assets; adapters only translate** (section 4). When marccent-theme can't do something, add a ticket
   to marccent-theme's TICKETS.md and a Waiting on line in the list of the project that needs it. Never work around
   it with CSS, JS or a copied component.
5. **Every change keeps the lists in sync.** A change that ships a ticket removes its Waiting on lines and stopgaps in
   every project it names, in the same round. Before you finish, run marccent-theme's checks from the workspace:
   `npm run todos` and `npm run conformance` (both are in `npm test`).
6. **Tell Marcos when he's wrong.** If a request breaks these rules, the current structure or a common
   convention, say so first and plainly ("That's wrong, because…"), with the fact behind it: the rule, the file,
   the standard. No sugar coating and no praise padding. Then do what he decides once he's heard it.
7. **When no rule covers it, stop and ask** (PRODUCT-LINE.md section 9).
   - Look first in PRODUCT-LINE.md, this file, the work lists, section 9's Decisions and how the other projects do it.
   - If nothing settles it, or two rules conflict, stop that part and ask Marcos in section 9's shape: the
     situation, the options, your recommendation and why, and whether it's a rule or a one-off. Then write the
     answer down in the same round. Never settle it in one project alone.
   - Section 9 also holds: no claim without output (name the command you ran and what it printed), one goal per
     change, and nothing removed without a ticket or Marcos's OK.
8. **Only wp and marccent-theme are active** (`stage` in [projects.json](projects.json)). Frozen projects get no
   pin bumps, no rule copies and no work unless Marcos asks for it.
