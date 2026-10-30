# Changelog

Each release, newest first. From 1.0 the versions are semantic: what a patch, a minor and a major may change is in the
README (Versions → What a version promises).

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
