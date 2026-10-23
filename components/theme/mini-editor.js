'use client';
// Mini theme editor: the theme controls in one line for one scope (props.scope: "site", the id on <html>, or an
// element's id), marked in the HTML with data-scope. Design style, mode, glass, the palette squares and a reset. The
// logic is the Theme class (lib/singleton.js: scoped); this only lays the parts out.
import { ModeToggle, GlassToggle, ThemeReset } from './toggles';
import { PaletteSwatches } from './palette-swatches';
import { DesignSelect } from './designs';

/**
 * MiniThemeEditor: with a title, a short section of its own (a Box), usually right under the element it edits: a
 * third for the text, two thirds for the controls (layout-1-2, side by side from 40rem, stacked below), the controls
 * one .row-wrap that wraps item by item rather than squeeze; the design style is a button that widens into a select.
 * With no title, just the row of controls, to sit inside a section (the home page's "Try it now").
 * @param {string} props.scope - "site" or the id of the element it themes.
 * @param {React.ReactNode} [props.title] @param {React.ReactNode} [props.text]
 */
const MiniThemeEditor = ({ scope, title, text }) => {
  const site = scope === 'site';
  // A ring round the element being edited while the pointer is on the editor.
  const mark = (on) => !site && document.getElementById(scope)?.style[on ? 'setProperty' : 'removeProperty']('box-shadow', 'inset 0 0 0 3px var(--primary)');

  return (
    <div data-component="mini-theme-editor" data-scope={scope} className={title ? 'grid gap-lg items-center layout-1-2' : 'grid cols-1'}
      onPointerEnter={() => mark(true)} onPointerLeave={() => mark(false)}>
      {title && (
        <div className="grid cols-1 gap-0">
          <strong>{!site && <i className="fa-solid fa-arrow-up text-primary" aria-hidden="true"></i>} {title}</strong>
          {text && <small className="opacity-75">{text}</small>}
        </div>
      )}
      {/* One row-wrap for every control, the palette squares included: one line until it runs out of room, then each
          wraps on its own. A tighter gap than usual, so the row fits two thirds of a section. */}
      <div className="grid cols-1 justify-end">
        <div className="row-wrap" role="group" aria-label={site ? 'Site theme' : 'Section theme'} style={{ '--gap': 'var(--space-xs)' }}>
          <DesignSelect scope={scope} />
          <ModeToggle scope={scope} className="hover-expand" />
          <GlassToggle scope={scope} className="hover-expand" />
          <PaletteSwatches scope={scope} bare />
          <ThemeReset scope={scope} className="hover-expand" />
        </div>
      </div>
    </div>
  );
};

export { MiniThemeEditor };
