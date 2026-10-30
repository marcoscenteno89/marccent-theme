# Changelog

Each release, newest first. From 1.0 the versions are semantic: what a patch, a minor and a major may change is in the
README (Versions → What a version promises).

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
