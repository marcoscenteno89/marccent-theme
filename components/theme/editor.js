'use client';
// Full theme editor: every theme control for one scope (props.scope: "site", the id on <html>, or an element's id),
// marked in the HTML with data-scope. A collage, like the Images page's: tiles of different sizes on one dense
// 6-column grid. An intro on the theme's gradient, the palette cards (add, use, delete), the design-style cards, and a
// tile each for mode, glass and reset. The logic is the Theme class (lib/singleton.js: scoped); this only lays the parts out.
import { ModeToggle, GlassToggle, ThemeReset } from './toggles';
import { PaletteCards } from './palette-cards';
import { DesignCards } from './designs';

// A small tile: a label over its one control.
const Tile = ({ label, className = '', style, children }) => (
  <div className={`bg border round shadow pad grid cols-1 gap-sm justify-center text-center ${className}`} style={{ alignContent: 'center', ...style }}>
    <h3 className="h6 text-uppercase opacity-75">{label}</h3>
    {children}
  </div>
);

/**
 * ThemeEditor: the site's sits in the footer (<ThemeEditor scope="site" />); scoped to an element's id it changes
 * only that element. For one row of controls under a section, MiniThemeEditor (mini-editor.js).
 * The sizes fill the 6 columns with no holes (4 rows): intro 2x2 + palettes 4x2, designs 4x2 + mode, glass, reset 2x1.
 * Below a 60rem wrap (where span-4 starts, layout.css) --min is the whole width, so every tile is one column, stacked:
 * the carousels need the room. (60rem - 100%) * 999 is huge below 60rem and negative above, where 9rem wins.
 * @param {Object} props
 * @param {string} props.scope - "site" or the id of the element it themes.
 */
const ThemeEditor = ({ scope }) => {
  const site = scope === 'site';
  return (
    <div data-component="theme-editor" data-scope={scope} role="group" aria-label={site ? 'Site theme' : 'Section theme'}
      className="grid" style={{ '--cols': 6, '--min': 'max(9rem, (60rem - 100%) * 999)', gridAutoRows: 'minmax(5rem, auto)', gridAutoFlow: 'dense' }}>
      <div className="bg-gradient round shadow pad grid cols-1 gap-sm span-2" style={{ gridRow: 'span 2', alignContent: 'center' }}>
        <h2 className="h4">{site ? 'Theme editor' : 'Section theme'}</h2>
        <p className="fs-sm">
          {site ? 'Pick a palette and a design style; every page changes with you. Saved in this browser.'
            : 'Changes only this section.'}
        </p>
      </div>
      <div className="span-4" style={{ gridRow: 'span 2' }}><PaletteCards scope={scope} /></div>
      <div className="span-4" style={{ gridRow: 'span 2' }}><DesignCards scope={scope} /></div>
      <Tile label="Mode"><ModeToggle scope={scope} className="hover-expand" /></Tile>
      <Tile label="Glass"><GlassToggle scope={scope} className="hover-expand" /></Tile>
      <Tile label="Start over" className="span-2"><ThemeReset scope={scope} className="hover-expand" /></Tile>
    </div>
  );
};

export { ThemeEditor };
