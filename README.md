# marccent-theme

A theme for any site: a full CSS system, a live theme engine visitors can edit, a plain-JS engine that wires up its
markup, a React UI kit and canvas animations. One repo, one version, three ways in:

| | What you load | For |
| --- | --- | --- |
| **Source** | `styles/`, `core/`, `components/` (JSX and CSS imports) | bundlers: Next, the WordPress block editor (Marccent Blocks) |
| **dist/** | `dist/marccent.css`, `dist/designs/<id>.css`, `dist/marccent.js` | any page: plain HTML, PHP, Django templates |
| **Adapters** | [Marccent Blocks](https://github.com/marcoscenteno89/marccent-blocks) (WordPress), [django-marccent](https://github.com/marcoscenteno89/django-marccent) | CMSs that serve `dist/` or the source for you |

Three layers, each working without the one above: **CSS and tokens** (everywhere), the **plain-JS engine** (`core/`,
everywhere: it finds components by `data-component` and wires them up) and the **React kit** (`components/`, Next and
the block editor).

- **CSS**: tokens, a grid layout system, utilities, hover effects (some follow the mouse: tilt, spotlight, magnet) and 27 design styles (glassmorphism, brutalism, editorial, terminal, claymorphism…) that restyle the whole site without changing its markup.
- **Theme engine**: palettes, light / dark mode, glass and design style, saved in the browser, for the whole site or one section. A full editor (`ThemeEditor`) and a one-row mini editor (`MiniThemeEditor`).
- **UI kit**: Button (with loading / done / error states), Icon (Font Awesome), Modal, Drawer, Tooltip, Popover, LinkPreview, Form, Field, FileDrop, Code (CodeMirror), Toast, Accordion, Pagination, Loading and more; a NavBar (a bar, or a pill floating over the hero; dropdowns on click or hover), a Footer built from the same menu data, an AppShell with a collapsible sidebar, and a Dock.
- **Animations**: canvas backgrounds on any element with `data-component="animation" data-name="snow"` (blob, snow…), effects and scenery. They only run while on screen and respect reduced motion.

## Versions

Releases are git tags (`v0.2.4`); install or link a tag, never the main branch:

```sh
npm install github:marcoscenteno89/marccent-theme#v0.2.4
```

A tag's `dist/` is on jsDelivr, pinned to it: `https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v0.2.4/dist/marccent.css`.
To release: set the version in `package.json`, `npm run build`, commit (dist/ included), tag `v<version>` and push the
tag. Then move the adapters to it: Marccent Blocks' `package.json` and django-marccent's `THEME_VERSION`.

## Any page: dist/

```html
<html lang="en" data-design="modern" data-theme="light">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v0.2.4/dist/marccent.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v0.2.4/dist/designs/modern.css">
  <script>window.marccentDefaults = { palette: 'brand', palettes: [ { id: 'brand', primary: '#046bd2', secondary: '#1e293b' } ] };</script>
  <script type="module" src="https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v0.2.4/dist/marccent.js"></script>
</head>
```

**The HTML is the contract.** A server renders the same markup the React components render, and `dist/marccent.js`
wires it up by `data-component`: the nav bar and its menus, toggle buttons, tooltips, popovers, modals and drawers
(`data-opens="<id>"` opens one, `data-close` closes it), file drops, the app shell's sidebar, code blocks, canvas
backgrounds and the pointer hovers. `window.marccentDefaults` (optional) is the site's starting theme over the
package's. React wires what it renders; a page that mixes both marks React's parts `data-island` and the engine leaves them alone. `Marccent.define(kind, setup)`
adds your own.

`npm run build` writes `dist/` from the source (`scripts/build.mjs`).

## Next.js

Needs `next` 14+, `react` and `react-dom` 18 or 19. The package ships source (JSX and CSS imports), so let Next compile it:

```js
// next.config.js
module.exports = { transpilePackages: ['marccent-theme'] };
```

## Set up

Import the styles once and wrap the app in `ThemeProvider` with the page path. Its starter colors come from `lib/theme.defaults.json` (with `window.marccentDefaults` on top when a page sets it: `lib/defaults.js`).

```jsx
// app/theme-provider.js
'use client';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'marccent-theme/lib/context';

export const SiteThemeProvider = ({ children }) => <ThemeProvider path={usePathname()}>{children}</ThemeProvider>;
```

```jsx
// app/layout.js
import 'marccent-theme/styles/index.css';
import { Body, SiteTheme, ScopeThemes } from 'marccent-theme/components/theme/core';
import { Toast } from 'marccent-theme/components/ui/toast';
import { SiteThemeProvider } from './theme-provider';

export default function RootLayout({ children }) {
  return (
    <html id="site" lang="en" data-design="modern" suppressHydrationWarning>
      <SiteThemeProvider>
        <Body className="grid cols-1">
          {children}
          <Toast />
          <SiteTheme />
          <ScopeThemes />
        </Body>
      </SiteThemeProvider>
    </html>
  );
}
```

`ThemeProvider` takes an optional `notify(msg, tone)` for the theme's messages; by default they go to its toasts.

To put your own styles between the theme's (overrides after the defaults, custom styles after the layout), import the files listed in `styles/core.css` one by one instead, in the same order, then `styles/designs.css`.

## WordPress and Django

- **WordPress**: the [Marccent Blocks](https://github.com/marcoscenteno89/marccent-blocks) plugin builds the theme from this source (pinned to a tag) and registers its CSS and JS once; the Marccent WP theme and the Local and Content plugins depend on it rather than bundling a copy, so a site loads the theme once, at one version.
- **Django**: [django-marccent](https://github.com/marcoscenteno89/django-marccent), a thin app that serves `dist/` at a pinned release (a copy in its static files, or jsDelivr) with template tags, plus optional django CMS plugins.

## In the HTML

Every component marks itself with two attributes, so it's easy to find in the browser's inspector (and to style or
query):

- `data-component`: what kind of thing it is: `button`, `toggle-button`, `stat-card`, `animation`…
- `data-name`: which one, when there are several: `mode`, `glass`, `humidity`, `snow`…

```html
<button data-component="toggle-button" data-name="mode">…</button>
<div data-component="animation" data-name="fire" data-fps="20" data-colors="#ff3d00, #ffb300"></div>
```

A component with its own markup has its own `data-component`; a configured use of another (the mode toggle is a
`ToggleButton`) keeps that kind and gets a `data-name`. `data-component` can hold several words: `"button animation"`
is a Button with an animation behind it (select a word with `[data-component~="animation"]`).

## Tokens worth knowing

Every variable and its default is in `styles/tokens/defaults.css`. A few that reshape a whole site:

- `--heading-scale` multiplies every heading and display size (`1.5` for a bolder site); `.display-xl` is the 60px hero title.
- `--radius` rounds everything, unless you set `--radius-control` (buttons, fields), `--radius-card` (boxes, modals) or `--radius-media` (`.round-media`) on their own. `.pill` gives anything fully round ends.
- `--overlay-color` and `--overlay-opacity` tint `.overlay` layers over a `.media-cover` image or video.

## Design styles

Each style is one CSS file in `styles/themes/`. After adding or editing one, regenerate `styles/designs.css` and `lib/designs.gen.js`:

```sh
npm run designs
```
