# Patterns

A pattern is an arrangement of the theme's components and classes with nothing of its own: no behavior, no CSS, no
markup a component doesn't already write. A component is a single unit that has one of those (PRODUCT-LINE.md 4.7).
A site arranges a pattern its own way, so the theme doesn't ship it as a component: this list says what each pattern is
made of, the admin data it needs, and its markup as the reference, and each output builds it from its own parts
(WordPress: a block pattern of Marccent blocks; html: the markup, or the components in JSX).

One entry per pattern: what it's for, its parts, the admin data it needs (`markup/outputs.json`'s kinds), its markup
(a file in the marccent-patterns repository, whose `npm test` fails on a class the theme doesn't define; the theme's
`npm test` runs the same check against the theme as it's being changed) and where it's built (wp, html). The converter
to each output's blocks and tags: after 1.0 (TICKETS.md T-037).

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

Markup: [footer.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/footer.html) (marccent-patterns).

## Image card

A photo filling a card, its text and buttons in front, always readable: a fade up from the bottom, a tint, frosted
glass, or a blur on part of the photo; or a live animation instead of (or over) the photo. It was the ImageCard
component (removed 2026-11-10, TICKETS.md T-033).

- **Parts:** Card (`pad-0`, `.stack`: the layers on one cell), the image (`.media-cover`), an overlay (`.overlay`,
  `.overlay-blur` for the lower part blurred, `.overlay-focus` for all but the middle, `.overlay-tint` for the theme's
  gradient), the content (`self-end`, a badge as `.chip`). For a live animation, an animation element
  (`data-component="animation"`) in the image's place.
- **Admin data:** none (the image from the Media Library, like any image).
- **Built in:** html (the theme's animation player, `components/visuals/animations.js`; marccent.com's cards, still
  on the component until it takes this release); wp: a block pattern of Card, Image and text blocks.

Markup: [image-card.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/image-card.html) (marccent-patterns).

## Collage

Tiles of different sizes packed on one grid: photos, animations, cards. It was the Collage component (removed
2026-11-10, TICKETS.md T-033).

- **Parts:** Grid (`dense`, `minimumRowHeight`: `.dense .rows-min`), Cards or Image cards with size classes
  (`span-2`, `span-3`, `.row-span-2` to `-4`), border variants (a frame, an accent ring) when needed.
- **Admin data:** rows (the tiles, when they're data).
- **Built in:** html (marccent.com's Images and Animations pages, still on the component until it takes this
  release); wp: a Grid of Cards.

## Header

A site's header: the brand at the start; at the end the main menu, folding behind a menu button where the header is
under 64rem (Menu `fold`), a call to action and the theme controls. Sticky at the top. It was the NavBar component
(removed 2026-11-10); its floating pill variant is the Floating header (below).

- **Parts:** Section (`as` header, `wrap wrap-fluid` outside, `.wrap` inside: the fold's container), Grid
  (`auto-cols cols-between`: the brand at the start, the rest at the end), Menu (`fold`, `auto-cols`, `.menu-quiet`),
  Button, the theme controls (MiniThemeEditor, or a Popover holding it).
- **Admin data:** menu (the main menu), site (the brand), theme (what visitors may change).
- **Built in:** wp (marccent-wp's Header block pattern, the header template part); html: marccent.com (frozen; it
  still uses NavBar, T-032).

Markup: [header.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/header.html) (marccent-patterns).

## Floating header

The Header over the top of the page, a pill that lets the hero show through: see-through while the page is at its
top, solid (its background, border and shadow) once it scrolls. It takes no room, so the page's first section (a hero)
starts under it, and takes `.pad-top-header` so its content starts below the bar. It was NavBar's floating variant
(removed 2026-11-10).

- **Parts:** the Header's (above); `.fixed-top` and `.pe-none` on the frame (clicks beside the pill reach the page),
  `.pill`, `.bg border shadow`, `.solid-on-scroll` and `.pe-auto` on the bar; `.pad-top-header` on the page's first
  section (the bar's height, `--header-height`, which the engine measures, plus the section's rhythm).
- **Admin data:** the Header's.
- **Built in:** wp (marccent-wp's Floating header block pattern).

Markup: [header-floating.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/header-floating.html) (marccent-patterns).

## App frame

An app or docs page: a Sidebar down the side, the page beside it; below 64rem the Sidebar is a top bar and the page
under it. Was the AppShell component (removed 2026-11-10).

- **Parts:** Grid (`layout-ends` with `--start: 1`, in a `.cq`), Sidebar (its content a Menu with `cols-1` and
  `.menu-vertical`, then anything for the bottom), the page.
- **Admin data:** menu (the sidebar's links), site (the brand).

Markup: [app-frame.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/app-frame.html) (marccent-patterns).

## Section heading

The heading over a section: a small label (the eyebrow), the title and a line of text, centered by default. Its text
keeps a readable width (`.measure`) and is centered under the title. Put it as the first child of a Section.

- **Parts:** Grid (`cols-1 gap-sm`, `justify-center text-center` to center; without them it starts at the
  start), `.eyebrow`, a heading (`h2`, sized by `.display-*` or `h1`…), a paragraph (`.fs-lg .opacity-75`,
  `.measure`).
- **Admin data:** none (its text is the page's).
- **Built in:** wp: a block pattern (Marccent Blocks' Grid and core Heading and Paragraph blocks); html: the markup.

Markup: [section-heading.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/section-heading.html) (marccent-patterns).

## Announcement row

One line above the Header: a short notice and a link (a sale, an opening, a new service), on a color fill. On phones
it wraps under itself, still centered.

- **Parts:** a band (`bg-primary` or another fill; its links take the fill's text color, colors.css), `.wrap`,
  `.fs-sm`, `.text-center`, `pad-y-xs`; a link.
- **Admin data:** none (or site: a notice set for the whole site).
- **Built in:** wp: a block pattern placed before the Header in the header template part.

Markup: [announcement.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/announcement.html) (marccent-patterns).

## Back to top

A round button in the bottom corner that takes the visitor back to the top of the page. Hidden while the page is at
its top, it fades in once the page scrolls (`.scrolled-only`).

- **Parts:** Button (icon only, `arrow-up`, `href="#"`, an `aria-label`), `.position-fixed .bottom-0 .end-0
  .z-sticky` and a padding class on a frame (`.pe-none`, so clicks beside it reach the page; the button `.pe-auto`),
  `.scrolled-only`.
- **Admin data:** none.
- **Built in:** wp: a block pattern in the footer template part.

Markup: [back-to-top.html](https://github.com/marcoscenteno89/marccent-patterns/blob/main/patterns/back-to-top.html) (marccent-patterns).

## To check: components that may be patterns (TICKETS.md T-033)

The audit of 2026-11-09 (every component in `markup/settings.json`): these only arrange other components and classes.

| Component | Made of | Note |
|---|---|---|
| CodeTabs | TabBar, Code | decided: a component (its editors are one value: 4.5.1) |
| AppShell | Sidebar, a Menu, the page, Grid classes | done 2026-11-10: removed; its collapse is the Sidebar component's, the frame the App frame pattern (above) |
| Collage | Grid (dense packing, a minimum row height), Cards with an image, size classes on them (`span-2`, a row span), border variants (a frame, an accent ring) | done 2026-11-10: removed; the Collage pattern (above) |
| HexWall | HexGrid (a component: it places each child by its place), its HexFlip children | removed (1.0.0-rc.21): not a pattern; a HexGrid with HexFlip children (marked with their parent) is the wall; in WordPress a Loop of HexFlip inside HexGrid |
| ImageCard | Card, an image, overlay classes | done 2026-11-10: removed; the Image card pattern (above) |
| StatCard | a ring (progress), Icon, the number, a label | done 2026-11-10: a component without a box of its own: it goes inside a Card (the Card is the box) |
| TicketCard | Card, `.shape-ticket`, a list | done: Card + the ticket variant (1.0.0-rc.18) |
| Timeline | a list, Icon, Button, classes | decided: a component (its line depends on each row's place: 4.5.2), and its events become children: a Timeline item component, marked with Timeline as its parent; in WordPress a Loop of them (to build) |

Borderline, kept as components for now: Dock (a Menu of icons with a magnify effect; maybe a Menu look),
ThemeEditor and MiniThemeEditor (arrangements of the theme controls, but used whole).
