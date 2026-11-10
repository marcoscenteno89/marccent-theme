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
  pattern (TICKETS.md T-032).

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

## Image card

A photo filling a card, its text and buttons in front, always readable: a fade up from the bottom, a tint, frosted
glass, or a blur on part of the photo; or a live animation instead of (or over) the photo. It was the ImageCard
component; it becomes this pattern once the theme has its overlays as classes (TICKETS.md T-033).

- **Parts:** Card (`pad-0`, `.stack`: the layers on one cell), the image (`.media-cover`), an overlay (`.overlay`,
  `.overlay-blur` for the lower part blurred, `.overlay-focus` for all but the middle; a tint still to add), the content (`self-end`, a badge as `.chip`).
- **Admin data:** none (the image from the Media Library, like any image).
- **Built in:** html (marccent.com's cards, today with the component); wp: a block pattern of Card, Image and text
  blocks.

```html
<article class="bg round shadow overflow-hidden stack" style="aspect-ratio:4/5">
  <img class="media-cover" src="…" alt="…">
  <div class="overlay"></div>
  <div class="grid cols-1 gap-sm pad self-end">
    <small class="text-uppercase">Seychelles</small>
    <strong class="fs-lg">Turquoise bays</strong>
  </div>
</article>
```

## Collage

Tiles of different sizes packed on one grid: photos, animations, cards. It was the Collage component.

- **Parts:** Grid (dense packing, a minimum row height: to add, T-033), Cards or Image cards with size classes
  (`span-2`, `span-3`, a row span to add), border variants (a frame, an accent ring) when needed.
- **Admin data:** rows (the tiles, when they're data).
- **Built in:** html (marccent.com's Images and Animations pages, today with the component); wp: a Grid of Cards.

## Header

A site's header: the brand at the start; at the end the main menu, folding behind a menu button where the header is
under 56rem (Menu `fold`), a call to action and the theme controls. Sticky at the top. It was the NavBar component
(removed 2026-11-10); its floating pill variant went with it (TICKETS.md T-032).

- **Parts:** Section (`as` header, `wrap wrap-fluid` outside, `.wrap` inside: the fold's container), Grid
  (`auto-cols cols-between`: the brand at the start, the rest at the end), Menu (`fold`, `auto-cols`, `.menu-quiet`),
  Button, the theme controls (MiniThemeEditor, or a Popover holding it).
- **Admin data:** menu (the main menu), site (the brand), theme (what visitors may change).
- **Built in:** wp (marccent-wp's Header block pattern, the header template part); html: marccent.com (frozen; it
  still uses NavBar, T-032).

```html
<header class="wrap wrap-fluid pad-y-sm bg border-bottom sticky-top">
  <div class="wrap pad-0 grid auto-cols cols-between items-center gap-sm">
    <a href="/" class="menu-link grid auto-cols items-center gap-sm" aria-label="Site, home"><img src="…" alt="Site" style="height:2.5rem;width:auto"><span class="fw-bold">Site</span></a>
    <div class="grid auto-cols items-center gap-sm">
      <div data-component="menu-fold" class="menu-fold">
        <button data-component="toggle-button" class="btn menu-fold-toggle" aria-label="Main menu" aria-expanded="false">…</button>
        <div class="toggle-panel …"><nav data-component="menu" class="menu grid gap-0 auto-cols menu-quiet" aria-label="Main">…links…</nav></div>
      </div>
      <a href="tel:…" class="btn primary">…Call…</a>
      <div data-component="mini-theme-editor" …>…</div>
    </div>
  </div>
</header>
```

## To check: components that may be patterns (TICKETS.md T-033)

The audit of 2026-11-09 (every component in `markup/settings.json`): these only arrange other components and classes.

| Component | Made of | Note |
|---|---|---|
| CodeTabs | TabBar, Code | decided: a component (its editors are one value: 4.5.1) |
| AppShell | Sidebar, a Menu, the page, Grid classes | done 2026-11-10: removed; its collapse is the Sidebar component's, the frame the App frame pattern (above) |
| Collage | Grid (dense packing, a minimum row height), Cards with an image, size classes on them (`span-2`, a row span), border variants (a frame, an accent ring) | decided 2026-11-09: a pattern; Grid needs dense packing and a row height, the theme a row-span class, before the component retires |
| HexWall | HexGrid (a component: it places each child by its place), its HexFlip children | removed (1.0.0-rc.21): not a pattern; a HexGrid with HexFlip children (marked with their parent) is the wall; in WordPress a Loop of HexFlip inside HexGrid |
| ImageCard | Card, an image, overlay classes | decided 2026-11-09: a pattern (the Image card, above); the component retires once the theme has its overlays as classes |
| StatCard | a ring (progress), Icon, the number, a label | decided 2026-11-09: a component, without a box of its own: it goes inside a Card (the Card is the box) |
| TicketCard | Card, `.shape-ticket`, a list | done: Card + the ticket variant (1.0.0-rc.18) |
| Timeline | a list, Icon, Button, classes | decided: a component (its line depends on each row's place: 4.5.2), and its events become children: a Timeline item component, marked with Timeline as its parent; in WordPress a Loop of them (to build) |

Borderline, kept as components for now: Dock (a Menu of icons with a magnify effect; maybe a Menu look),
ThemeEditor and MiniThemeEditor (arrangements of the theme controls, but used whole).
