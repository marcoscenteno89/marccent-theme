# Changelog

Each release, newest first. From 1.0 the versions are semantic: what a patch, a minor and a major may change is in the
README (Versions → What a version promises).

## 1.0.0-rc.5

The nav bar looks like Bootstrap's navbar, on phones and wide screens, and the glass toggle has its own icon.

### Changed
- NavBar (`styles/components/nav.css`): Bootstrap's look. Links in a dimmed text color that goes full on hover, on
  the current page (`aria-current`) and on an open dropdown, with no hover fill; a triangle caret that doesn't turn;
  a larger brand, flush with the bar's edge; dropdowns a bordered list without a shadow, their items full width with
  a fill on hover and the current page in primary. Below 56rem the links sit flush with the brand and the folded menu
  slides open and shut (its height; where the browser has `interpolate-size`, instantly elsewhere and with reduced
  motion).
- Markup: the toggle is a plain hamburger that stays one while open (`data-icon="bars" data-active-icon="bars"`, was
  `bars-staggered` and `xmark`; its label still says Open or Close menu), and the main menu has no `.divide` (no lines
  between the links). Hosts with their own copy of the NavBar markup: change those two (`markup/reference.json`).

### Fixed
- The glass toggle has a glass icon (a glass of water; a drop on it while glass is on), in place of the hornbill
  brand logo, which said nothing about glass and never showed on hosts that ship only the icons their scripts name
  (WordPress: Marccent Blocks).

## 1.0.0-rc.4

From the sites' feedback: the fixes every host was patching on its own, a longer spacing scale and the classes sites
kept writing as inline styles.

### Fixed
- `.cover-img` exists: Section's background image covers its band outside WordPress too (it was unstyled).
- The Carousel's layout fixes ship with it (`styles/components/carousel.css`: no resize loop in a grid, slides
  clipped, pad classes kept, a row before the script runs); sites no longer copy them.
- Headings on a color fill take its text color, like links already did, so a design style's colored headings don't
  vanish on `.bg-primary`.
- A band with its own mode (`data-theme`, Section `mode`) paints that mode's page color behind it.
- `dd`, `figure` and `blockquote` have no browser margins; the grids' margin reset also covers `.row-wrap`,
  `.stack`, `.center` and `.col-center`.

### Added
- Spacing: `--space-md` (1.5×), `--space-xl` (3×), `--space-2xl` (4×), with `gap-xs`, `gap-md`, `gap-xl`,
  `gap-x-*`, more `gap-y-*`, and `pad-xs` / `-md` / `-xl` / `-2xl` with their `-x-` and `-y-` forms.
- A section rhythm: `--section-space` (fluid, 3× to 6× `--space`), `.pad-y-section`, `-sm`, `-lg`.
- `--pad-x` / `--pad-y`: one element's padding through `.pad-x` / `.pad-y`, not inherited (unlike `--pad`).
- Classes: `.text-muted`, `.eyebrow`, `.bg-page`, `.measure` / `-sm` / `-lg`, `.min-xs` … `.min-xl`,
  `.justify-self-*`, `.place-self-center`, `.ratio-square` / `-4x3` / `-3x2` / `-16x9`, `.fw-semibold`, `.fw-black`,
  `.tracking-tight`, `.tracking-wide`, `.icon-sm`, `.icon-lg`.
- README: the spacing scale, the new classes and a host's checklist.

### Changed
- Section's default padding is `pad-y-section` (was `pad-y-lg`, 2rem): more room for a band on wide screens.

## 1.0.0-rc.3

### Added
- Section dividers: a shape on a Section's top or bottom edge (`dividerTop`, `dividerBottom`; Divider in
  `components/widgets/divider.js`, `core/divider.js`), in the band's own color, with scroll and motion effects; the
  shapes in `markup/dividers.json`.
- The harbor palette.

## 1.0.0-rc.2

Accessibility (WCAG 2.2 AA) and SEO basics: every page of the theme's demo sites passes axe-core in light and dark
mode, at desktop and phone width, and in all 27 design styles.

### Added
- Ink tokens (`--primary-ink`, `--secondary-ink`, `--danger-ink`, `--success-ink`, `--info-ink`): a theme color as
  text, its lightness held where it reads on the page (at most 0.5 OKLCH in light mode, at least 0.75 in dark) for
  any palette. Links, `.text-primary` and the other `.text-*` color classes, outline buttons, code highlighting and
  the professional and elegant headings use them.
- `--primary-lighter-text`, `--primary-darker-text` (and secondary): the text on the shade fills, which set it now.
- Pagination: a `label` prop (default "Pages"); DataTable names its own ("Team pages").

### Changed
- The text on a color fill (`--primary-text`…) is chosen by WCAG contrast, not perceived brightness (Marccent
  Blocks' first paint too).
- Dark mode's status fills (`.bg-danger`, `.bg-success`, `.bg-info`, Alert) are a tint of the page, deep enough for
  its text. The current page or step is a primary tint with the primary's ink.
- A `.bg` panel sets the page's text color (base layer), so it reads inside a colored band. A link on a color fill
  takes the fill's text color, underlined.
- Filled buttons' text mixes 25% of the color into the text color (was 40%).
- Modal, Drawer: the title is an `h2` (sized as before). Footer: its column titles are `h2` (sized as h6); its menus
  are "Footer legal" and "Footer social".
- `.icon-only-sm` / `-md` hide the label from view only: it stays the button's name.
- Button: a disabled link has `role="link"`.
- Board: cells never narrower than 1.5rem; a wider board scrolls.
- Code: the box is in the tab order (it scrolls sideways), and its content is labelled.
- Carousels (usePager: Carousel, the swatch slider, the animation picker): slides out of view are `inert`.
- HexWall, the theme editor's labels: no dimmed text on fills.
- TicketCard, Timeline: their tinted cards set the page's text color.

### Fixed
- Design styles: their light / dark blocks and `[data-theme]` rules now apply when the mode and the style are on the
  same element (`<html>`), so a design style's dark mode works for the whole site.

## 1.0.0-rc.1

The release candidate for 1.0: the public part as 1.0 will keep it, fixes only until 1.0.0.

### Changed
- `package.json` has an `exports` map: the public paths are `marccent-theme` (core), `react`, `components/*`,
  `styles/*`, `dist/*`, `markup/*`, `core/enhance`, `core/components` and twelve `lib/` modules (`cx`, `context`,
  `link`, `store`, `toasts`, `in-view`, `scrolled`, `close-menus`, `design`, `css-color`, `theme-scope`,
  `grid_helper`). Importing any other file of the package fails.
- `@marccent/util` is pinned to its `v2.1.1` tag (it was a branch).

### Added
- The markup reference covers Menu, ToggleButton, Modal (both looks), Drawer, Accordion, Tooltip, Popover and Alert.
  React's generated ids are written `id-1`, `id-2`…: a host picks its own.

## 0.3.2
- Rating's stars at a normal size; Stars clips its own width.

## 0.3.1
- Section, Grid and Card (`components/widgets/section.js`): the layout classes as components, the markup Marccent
  Blocks and django-marccent write on the server.
- The markup reference covers them and NavBar.

## 0.3.0
- No component imports a router: links are plain `<a>`s unless a host hands one in (`LinkContext`).
- `markup/`: the markup reference for Button and Icon. CI, LICENSE.

## 0.2.4
- Dialog openers (`data-opens`) are part of the dialog's setup.

## 0.2.3
- A section with its own mode (`data-theme`) takes its text color; buttons as menu items.

## 0.2.2
- The engine leaves React islands (`data-island`) alone.

## 0.2.1
- React 18 or 19, as peers.

## 0.2.0
- `dist/`: a prebuilt build for any page. The plain-JS markup engine (`core/`). Versioned releases (git tags).
