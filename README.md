# marccent-theme

A theme for Next.js sites: a full CSS system, a live theme engine visitors can edit, a React UI kit and canvas animations.

- **CSS**: tokens, a grid layout system, utilities, hover effects (some follow the mouse: tilt, spotlight, magnet) and 27 design styles (glassmorphism, brutalism, editorial, terminal, claymorphism…) that restyle the whole site without changing its markup.
- **Theme engine**: palettes, light / dark mode, glass and design style, saved in the browser, for the whole site or one section. A full editor (`ThemeEditor`) and a one-row mini editor (`MiniThemeEditor`).
- **UI kit**: Button (with loading / done / error states), Icon (Font Awesome), Modal, Drawer, Tooltip, Popover, LinkPreview, Form, Field, FileDrop, Code (CodeMirror), Toast, Accordion, Pagination, Loading and more; a NavBar (a bar, or a pill floating over the hero; dropdowns on click or hover), a Footer built from the same menu data, an AppShell with a collapsible sidebar, and a Dock.
- **Animations**: canvas backgrounds on any element with `data-component="animation" data-name="snow"` (blob, snow…), effects and scenery. They only run while on screen and respect reduced motion.

## Install

```sh
npm install github:marcoscenteno89/marccent-theme
```

Needs `next` 14+, `react` and `react-dom` 18. The package ships source (JSX and CSS imports), so let Next compile it:

```js
// next.config.js
module.exports = { transpilePackages: ['marccent-theme'] };
```

## Set up

Import the styles once and wrap the app in `ThemeProvider` with the page path. Its starter colors come from `lib/theme.defaults.json`.

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

To put your own styles between the theme's (overrides after the defaults, custom styles after the layout), import the files listed in `styles/index.css` one by one instead, in the same order.

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
