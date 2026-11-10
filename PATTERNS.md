# Patterns

A pattern is an arrangement of the theme's components and classes with nothing of its own: no behavior, no CSS, no
markup a component doesn't already write. A component is a single unit that has one of those (PRODUCT-LINE.md 4.7).
A site arranges a pattern its own way, so the theme doesn't ship it as a component: this list says what each pattern is
made of, the admin data it needs, and its markup as the reference, and each output builds it from its own parts
(WordPress: a block pattern of Marccent blocks; html: the markup, or the components in JSX).

One entry per pattern: what it's for, its parts, the admin data it needs (`markup/outputs.json`'s kinds), its markup,
and where it's built (wp, html).

## Footer

A site's footer: the brand and a line about the site, link columns, then a legal row (copyright, policy links) and the
social icons. Every part is optional. One column on phones; the brand beside the columns from 40rem, the columns side
by side as they fit. `id="footer"`, so the theme pauses its animations while it's scrolled away (core/offscreen.js).
It was a component (Footer) until 1.0.0-rc.17.

- **Parts:** Grid classes (`layout-1-2`, `layout-ends`, `cols-1`), Menu (a column's links: `cols-1`, `gap-0`; the
  legal links: `auto-cols`; the social links: icon only, `auto-cols`), text.
- **Admin data:** menu (each column, the legal links, the social links: a menu each), site (the brand: the site's
  name and logo; the line about it).
- **Built in:** html (marccent.com's own footer, `marccent/next/components/layout/footer.tsx`); wp: a Footer block
  pattern, with the Header (TICKETS.md T-032).

```html
<footer id="footer" data-component="footer" class="wrap wrap-fluid pad-y-lg grid cols-1 gap-lg bg">
  <div class="wrap pad-0 grid layout-1-2 gap-lg">
    <div class="grid cols-1 gap-sm content-start">
      <a href="/">Brand</a>
      <p class="opacity-75">A line about the site.</p>
    </div>
    <div class="grid gap-lg" style="--min:10rem;--cols:2">
      <div class="grid cols-1 gap-sm content-start">
        <h2 class="h6">Design</h2>
        <nav data-component="menu" class="menu grid gap-0 cols-1" style="--cols:1" aria-label="Design">…links…</nav>
      </div>
      <!-- …a column per menu… -->
    </div>
  </div>
  <div class="wrap pad-0 border-top pad-y grid layout-ends items-center gap-sm" style="--start:2">
    <div class="fs-sm opacity-75"><small>© 2026 Site</small></div>
    <nav data-component="menu" class="menu grid gap-sm auto-cols fs-sm" aria-label="Footer legal">…links…</nav>
    <nav data-component="menu" class="menu grid gap-sm auto-cols col-last" aria-label="Footer social">…icon links…</nav>
  </div>
</footer>
```

## Header (to do: TICKETS.md T-032)

A site's header: the brand, the main menu folding behind a menu button on narrow screens (Menu `fold`), a call to
action, the theme controls. Today the NavBar component; it becomes this pattern (decided: the navbar is the header, a pattern; the nav is the
Menu component with fold), and the WordPress Navbar block a Header block pattern.

- **Parts:** Grid (`layout-ends`), Menu (`fold`), Button, ToggleButton or MiniThemeEditor.
- **Admin data:** menu (the main menu), site (the brand), theme (what visitors may change).

## To check: components that may be patterns (TICKETS.md T-033)

The audit of 2026-11-09 (every component in `markup/settings.json`): these only arrange other components and classes.

| Component | Made of | Note |
|---|---|---|
| CodeTabs | TabBar, Code | decided: a component (its editors are one value: 4.5.1) |
| AppShell | Drawer, Menu, Button, Grid classes | a page frame, like NavBar; its sidebar's collapse needs a piece of its own first |
| Collage | Grid (dense packing, a minimum row height), Cards with an image, size classes on them (`span-2`, a row span), border variants (a frame, an accent ring) | decided 2026-11-09: a pattern; Grid needs dense packing and a row height, the theme a row-span class, before the component retires |
| HexWall | HexGrid (a component: it places each child by its place), its HexFlip children | decided 2026-11-09: removed, not a pattern; a HexGrid with HexFlip children (marked with their parent) is the wall; in WordPress a Loop of HexFlip inside HexGrid |
| ImageCard | Card, an image, overlay classes | decided: removed, not a pattern; a Card with an image in it does it |
| StatCard | Card, Icon, text | |
| TicketCard | Card, `.shape-ticket`, a list | done: Card + the ticket variant (1.0.0-rc.18) |
| Timeline | a list, Icon, Button, classes | decided: a component (its line depends on each row's place: 4.5.2) |

Borderline, kept as components for now: Dock (a Menu of icons with a magnify effect; maybe a Menu look),
ThemeEditor and MiniThemeEditor (arrangements of the theme controls, but used whole).
