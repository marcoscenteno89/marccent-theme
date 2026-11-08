# Working in marccent-theme

This project is part of the Marccent product line. Its rules live in one place, [PRODUCT-LINE.md](PRODUCT-LINE.md). Read it before any change;
don't copy its rules here. What follows is how to apply them, and it isn't optional.

1. **Feature freeze until 1.0 is live** (PRODUCT-LINE.md section 3). Only debugging, fixing and finishing what
   exists. A request for anything new (a feature, block, setting, component, option): say it's frozen, add it to
   `TICKETS.md` as a ticket marked after 1.0, and stop there unless the person confirms it's finishing existing work.
2. **The work list is `TICKETS.md`**: this project's list, and the tickets every other project links to from its
   `TODO.md` (PRODUCT-LINE.md section 8). Every project a ticket names in Who has a Waiting on line for it; when a
   ticket moves to Done, those lines and the stopgaps go in the same round.
3. **Don't run on your own.** Do what was asked and nothing more. Anything else you find (a bug, a cleanup, a
   missing component) goes on the list and is named in your reply; it isn't fixed in the same change.
4. **No custom assets; adapters only translate** (section 4). When marccent-theme can't do something, add a ticket
   to marccent-theme's TICKETS.md and a Waiting on line in the project that needs it; never work around it with CSS, JS or a copied component.
5. **Every change keeps the lists in sync.** A change that ships a ticket removes its Waiting on lines and stopgaps in
   every project it names, in the same round. Before you finish, run marccent-theme's checks from the workspace:
   `npm run todos` and `npm run conformance` (both are in `npm test`).
