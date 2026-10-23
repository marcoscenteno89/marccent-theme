'use client';
// Mini theme editor: the theme controls in one line for one scope (props.scope: "site", the id on <html>, or an
// element's id), marked in the HTML with data-scope. Design style, mode, glass, the palette squares and a reset. The
// logic is the Theme class (lib/singleton.js: scoped); this only lays the parts out.
import { ModeToggle, GlassToggle, ThemeReset } from './toggles';
import { PaletteSwatches } from './palette-swatches';
import { DesignSelect } from './designs';

/**
 * MiniThemeEditor: just the row of controls, so it fits anywhere: under a section, in a header, beside a page's own
 * heading (the page places any title or text itself). One .row-wrap that wraps item by item rather than squeeze; the
 * design style is a button that widens into a select. It packs at the start; wrap it in a .grid.justify-end (or any
 * justify-*) to place it. Scoped to an element, a ring marks that element while the pointer is on the editor.
 * @param {Object} props
 * @param {string} props.scope - "site" or the id of the element it themes.
 */
const MiniThemeEditor = ({ scope }) => {
  const site = scope === 'site';
  // A ring round the element being edited while the pointer is on the editor.
  const mark = (on) => !site && document.getElementById(scope)?.style[on ? 'setProperty' : 'removeProperty']('box-shadow', 'inset 0 0 0 3px var(--primary)');

  return (
    // One row-wrap for every control, the palette squares included: one line until it runs out of room, then each
    // wraps on its own. A tighter gap than usual, so the row fits beside text.
    <div data-component="mini-theme-editor" data-scope={scope} className="row-wrap" role="group"
      aria-label={site ? 'Site theme' : 'Section theme'} style={{ '--gap': 'var(--space-xs)' }}
      onPointerEnter={() => mark(true)} onPointerLeave={() => mark(false)}>
      <DesignSelect scope={scope} />
      <ModeToggle scope={scope} className="hover-expand" />
      <GlassToggle scope={scope} className="hover-expand" />
      <PaletteSwatches scope={scope} bare />
      <ThemeReset scope={scope} className="hover-expand" />
    </div>
  );
};

export { MiniThemeEditor };
