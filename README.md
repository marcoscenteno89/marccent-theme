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
- **UI kit**: Button (with loading / done / error states), Icon (Font Awesome), Modal, Drawer, Tooltip, Popover, LinkPreview, Form, Field, FileDrop, Code (CodeMirror), Toast, Accordion, Pagination, Loading and more; Section, Grid and Card (the layout classes as components); a Menu that folds behind a menu button on narrow screens (the Header pattern), a Sidebar that collapses to its icons (the App frame pattern), a Dock, and a Map (Google, in the theme's colors).
- **Patterns** ([docs/PATTERNS.md](docs/PATTERNS.md)): what a site arranges its own way from the components (a footer, a header), with their markup, instead of components.
- **Typography**: text set the way print sets it, by itself: real dashes and ellipses, raised ordinals and ™ ®, m², primes, numbers that never split from their units, no one-word last lines; prices with the currency sign and cents raised (`$19⁹⁹/mo`). See [Typography](#typography).
- **Animations**: canvas backgrounds on any element with `data-component="animation" data-name="snow"` (blob, snow…), effects and scenery. They only run while on screen and respect reduced motion.

## Versions

Releases are git tags (`v1.0.0-rc.4`); install or link a tag, never the main branch:

```sh
npm install github:marcoscenteno89/marccent-theme#v1.0.0-rc.4
```

A tag's `dist/` is on jsDelivr, pinned to it: `https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v1.0.0-rc.4/dist/marccent.css`.
To release: set the version in `package.json`, add it to `CHANGELOG.md`, `npm run build`, commit (dist/ included), tag
`v<version>` and push the tag. Then move the adapters to it: Marccent Blocks' `package.json` and django-marccent's
`THEME_VERSION`.

### What a version promises

From 1.0 the versions are [semantic](https://semver.org/). The public part, what a release keeps working:

- **The markup**: each component's HTML, its `data-component` names and the `data-*` attributes the engine reads.
  `markup/reference.json` is it written down, so a change there shows in the diff of a release.
- **The CSS**: the class names (layout, utilities, hovers, components) and the custom properties (tokens) documented
  here and in `styles/tokens/`, and the design style ids.
- **The React props** of the components, and the JS of `core` (`marccent-theme`) and `react` (`marccent-theme/react`).
- **The paths** in `package.json`'s `exports`: `components/*`, `styles/*`, `dist/*`, `markup/*`, `core/enhance`,
  `core/components` and the `lib/` modules listed there. Anything else (`scripts/`, the rest of `lib/`) is internal and
  can change in any release.

A **patch** (1.0.x) fixes a bug, without changing the public part except to make it do what it says. A **minor**
(1.x.0) adds to it: a component, a prop, a class, a token, a design style. Anything that renames or removes part of it,
or changes its markup so a host's own copy no longer matches, waits for the next **major** (2.0.0). How it looks (a
color, a spacing, an animation) can be adjusted in a minor; what you write to use it can't.

### Accessibility

The components aim at WCAG 2.2 AA in light and dark mode and every design style: text colors that keep 4.5:1 on the
page for any palette (the `--*-ink` tokens, the text on fills chosen by contrast), names for every control, real
headings, rows and roles, and keyboard access to anything that scrolls. A site keeps it by using the ink tokens or
the `.text-*` classes for colored text (not `var(--primary)`), giving each nav landmark its own label, and not
dimming text with `opacity-50` (`opacity-75` reads on the page, not on a color fill). The demo sites check every page
with axe-core (marccent-html: `npm run test:a11y`).

## Any page: dist/

```html
<html lang="en" data-design="modern" data-theme="light">
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v1.0.0-rc.4/dist/marccent.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v1.0.0-rc.4/dist/designs/modern.css">
  <script>window.marccentDefaults = { palette: 'brand', palettes: [ { id: 'brand', primary: '#046bd2', secondary: '#1e293b' } ] };</script>
  <script type="module" src="https://cdn.jsdelivr.net/gh/marcoscenteno89/marccent-theme@v1.0.0-rc.4/dist/marccent.js"></script>
</head>
```

**The HTML is the contract.** A server renders the same markup the React components render, and `dist/marccent.js`
wires it up by `data-component`: the nav bar and its menus, toggle buttons, tooltips, popovers, modals and drawers
(`data-opens="<id>"` opens one, `data-close` closes it), file drops, the app shell's sidebar, code blocks, canvas
backgrounds and the pointer hovers. `window.marccentDefaults` (optional) is the site's starting theme over the
package's. React wires what it renders; a page that mixes both marks React's parts `data-island` and the engine leaves them alone. `Marccent.define(kind, setup)`
adds your own. `markup/` is that contract written down for Button, Icon, Section, Grid, Card, Menu and more: cases and the
HTML the components render for each, which a host's own tests compare its markup with (`markup/README.md`).

`npm run build` writes `dist/` from the source (`scripts/build.mjs`).

## Next.js

Needs `react` and `react-dom` 18 or 19; nothing in the package imports Next, so the components also run in other React hosts (the WordPress blocks). On Next (14+) the package ships source (JSX and CSS imports), so let Next compile it:

```js
// next.config.js
module.exports = { transpilePackages: ['marccent-theme'] };
```

## Set up

Import the styles once and wrap the app in `ThemeProvider` with the page path. Its starter colors come from `lib/theme.defaults.json` (with `window.marccentDefaults` on top when a page sets it: `lib/defaults.js`).

```jsx
// app/theme-provider.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'marccent-theme/lib/context';

export const SiteThemeProvider = ({ children }) => <ThemeProvider path={usePathname()} link={Link}>{children}</ThemeProvider>;
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

`ThemeProvider` takes an optional `notify(msg, tone)` for the theme's messages; by default they go to its toasts. `link` is the router's link component: the links Button, Menu and the Dock render use it (`lib/link.js`); without it they are plain `<a>`s, and every link is a page load.

To put your own styles between the theme's (overrides after the defaults, custom styles after the layout), import the files listed in `styles/core.css` one by one instead, in the same order, then `styles/designs.css`.

## WordPress and Django

- **WordPress**: the [Marccent Blocks](https://github.com/marcoscenteno89/marccent-blocks) plugin builds the theme from this source (pinned to a tag) and registers its CSS and JS once; the Marccent WP theme and the Local and Content plugins depend on it rather than bundling a copy, so a site loads the theme once, at one version.
- **Django**: [django-marccent](https://github.com/marcoscenteno89/django-marccent), a thin app that serves `dist/` at a pinned release (a copy in its static files, or jsDelivr) with template tags, plus optional django CMS plugins.

### A host's checklist

What a site (or a CMS adapter) around the theme should and shouldn't do, so the theme's layout holds:

- **Let the grids space things.** Zero the CMS's own flow margins and block gaps around the theme's markup (WordPress:
  `.wp-site-blocks` and `.is-layout-flow` children); the theme spaces with `gap`, never margins.
- **Don't set `--pad` on a band** to pad it: it inherits into every `.pad` box inside. Give the band `.pad-y` and set
  `--pad-y` (or `--pad-x`) on it; those don't inherit.
- **Mark React islands** `data-island`, so the plain-JS engine leaves them to React.
- **Use the classes that exist.** There's no `.card` or `.gap` class (a card is `bg border round pad grid cols-1`, the
  Card component's markup), and `.row-wrap` is flex, so `grid row-wrap` gets nothing from `.grid`. A list of label and
  value rows (key facts, specs) is a `<dl class="grid pairs">` with a `.sub-x` per row.

## In the HTML

Every component marks itself with two attributes, so it's easy to find in the browser's inspector (and to style or
query):

- `data-component`: what kind of thing it is: `button`, `toggle-button`, `stat-card`, `animation`…
- `data-name`: which one, when there are several: `mode`, `glass`, `humidity`, `snow`…

```html
<button data-component="toggle-button" data-name="mode">…</button>
<div data-component="animation" data-name="fire" data-frame-rate="20" data-colors="#ff3d00, #ffb300"></div>
```

A component with its own markup has its own `data-component`; a configured use of another (the mode toggle is a
`ToggleButton`) keeps that kind and gets a `data-name`. `data-component` can hold several words: `"button animation"`
is a Button with an animation behind it (select a word with `[data-component~="animation"]`).

## Typography

Print has rules for symbols that keyboards ignore: a price's dollar sign sits small and high, "21st" raises its
letters, a range takes an en dash, "10 kg" never breaks between the number and the unit. Most sites get them wrong
because authors would have to type special characters. Here, authors type what's on their keyboard and the theme
sets it.

**Automatically, with `typeset`** (`<Typeset as="p">…</Typeset>` in React, `data-component="typeset"` on any
server-written element, or `typesetParts(text)` / `typesetElement(el)` from `core`):

| Typed | Set | |
| --- | --- | --- |
| `...` | … | one character, not three periods |
| `9--5`, `Mon--Fri` | 9–5, Mon–Fri | an en dash for ranges |
| `fast -- and right` | fast—and right | an em dash for a break |
| `21st`, `2nd` | 21ˢᵗ, 2ⁿᵈ | the letters raised |
| `Marccent(tm)`, `(r)`, `(sm)`, `(c)` | Marccent™, ®, ℠, © | marks raised small (© stays on the line) |
| `1,200 ft2`, `200 m2` | 1,200 ft², 200 m² | after a number |
| `6'2"` | 6′2″ | primes, not quotes (after a number) |
| `10 kg`, `72 °F`, `40 psi` | the same, never split across lines | a no-break space |
| a paragraph's last word | kept with the one before | no one-word last line |

Hyphens are left alone (phone numbers and dates use them), and so is code (`code`, `pre`, `kbd`, `.no-typeset`).

**Prices, with `Price`**: `<Price amount={19.99} per="mo" was={29} />` shows ~~$29~~ $19⁹⁹/mo: the sign and cents
raised and small, the period small, the old price struck through, in any currency and locale (`currency="EUR"
locale="de-DE"`: 49⁵⁰ €). Screen readers hear "$19.99, per mo, was $29". It's made of the classes below and
nothing of its own, so a server writes the same markup:

```html
<s class="fs-50 text-muted"><span class="raised fs-50">$</span>29</s>
<span class="raised fs-50">$</span>19<span class="raised fs-50">99</span><span class="fs-50 text-muted">/mo</span>
```

**Classes that combine**: `.raised` (its top level with the text's top: a price's sign and cents, ™ after a name)
and `.fs-50` / `.fs-75` (half or three quarters of the text around it, whatever its size). `sup` and `sub`
(footnotes, marks) no longer push their line away from the next. And the font's own features, where it has them:
`.nums-tabular` (digits of one width: tables and prices line up), `.nums-fractions` (1/2 drawn as a fraction),
`.nums-ordinal` and `.small-caps` (acronyms, AM / PM).

## Spacing

One scale, all multiples of `--space` (so changing it resizes the site): `xs` 0.25×, `sm` 0.5×, base 1×, `md` 1.5×,
`lg` 2×, `xl` 3×, `2xl` 4×. The grids space their children with `gap-*` (`gap-x-*` and `gap-y-*` for one axis), boxes
pad themselves with `pad-*` (`pad-x-*`, `pad-y-*`); there are no margin classes. A section's own rhythm is
`--section-space`, fluid from 3× to 6× `--space` with the screen: `.pad-y-section` (Section's default), `-sm` and
`-lg`. A value between the steps goes on the element: `style="--pad-y: 5rem"` with `.pad-y`.

A few small classes for what sites kept writing inline: `.text-muted` (quieter text that still reads, unlike
`opacity-50`), `.eyebrow` (the small label over a heading), `.measure` / `-sm` / `-lg` (a readable line length),
`.min-xs` … `.min-xl` (a grid's narrowest column), `.justify-self-*` and `.place-self-center`, `.ratio-square`,
`-4x3`, `-3x2`, `-16x9`, `.fw-semibold`, `.fw-black`, `.tracking-tight`, `.tracking-wide`, `.icon-sm`, `.icon-lg`,
and `.bg-page` (the page's colors on any element; a band with its own `data-theme` gets them by itself).

## Breakpoints

One scale, Tailwind's: `sm` 40rem (640px), `md` 48rem (768px), `lg` 64rem (1024px). A name means the same width
everywhere: `.span-md-*`, `.icon-only-md`, `.d-md-none` and `.sticky-md-top` all change at 48rem. Most are container
queries, measured on the nearest `.wrap` or `.cq`, not the screen; the `-md-` display and sticky utilities are the
screen's. A header folds at `lg`: Menu `fold` and `.layout-ends` go to one row from 64rem. The `.span-2` … `.span-10`
steps follow the grid's columns instead (N × 14rem plus the gaps).

## Classes that combine

A component is mostly a combination of general classes, not classes of its own: a Pagination button is
`btn-plain col-center pad-y-control text-primary hover-muted tint-current`, a tag is `chip pill bg-primary-tint`, a
price `d-inline-grid auto-cols items-start` with `fs-50` parts. A component keeps its own class only for what classes
can't say: its own part (`.btn`, `.input`, `.menu-link`), a state, or a drawing (masks, clip-paths, the dock's
swell). The same rule for a site: build from these first.

**A class on an element wins.** Padding (`pad-*`) and placement (`self-*`, `justify-self-*`) beat what a component
gives its own element, so `.justify-self-end` moves a button and `.pad-xs` pads an `.input`. The plain starts
(`.btn-plain`, `.input-plain`, `.list-plain`, `.caret`) are in the lowest layer, so anything adds to them.

- **Plain starts**: `.btn-plain` / `.input-plain` (a button or input without the browser's look), `.list-plain` (no
  bullets, indent or margins), `.caret` (a `summary` with ▾ after it, turned while open). One focus ring for
  everything a keyboard reaches; `.focus-inset` draws it inside a box that clips.
- **Display and size**: `.d-grid` (a plain grid, as wide as its content can be), `.d-inline-grid`, `.d-contents`,
  `.w-max`, `.h-screen`, `.grow` (the rest of a row), `.object-cover`, `.text-nowrap`, `.text-break`, `.font-mono`,
  `.fs-xs`, `.fs-50` / `.fs-75` (half or three quarters of the text around it), `.pad-control` / `.pad-y-control`.
- **Layout**: `.layout-icon` (icon | text | anything after), `.rows-body` (a header, a body that fills, a footer),
  `.cols-end`, `.cols-between`, `.content-center`, `.joined` (children in one box: a label and its input, a button
  group), `.notch-top` / `.notch-bottom` (a ticket's tear), `.z-1`, `.z-dropdown`, `.z-sticky`, `.z-popup`, `.z-toast`,
  `.pe-none` / `.pe-auto`.
- **Look**: `.chip` (a small label: a tag, a badge), `.bg-muted`, `.bg-primary-tint`, `.bg-inverse` (the page's
  colors swapped: a tooltip), `.bg-scrim` and `.glass-dark` (text over a photo), `.tint-current` (the `aria-current`
  one tinted), `.border-start` / `-end`, `.border-dashed` (dashes only the sides a border class draws), `.hover-muted`,
  `.hover-opaque`. A Menu takes `.menu-quiet` for Bootstrap's nav-link look (the Header pattern's main menu).

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
