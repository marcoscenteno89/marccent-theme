'use client';
// Palette swatches: the palette cards (palette-cards.js) in miniature for small spaces (the mini editor): one square
// per saved palette, its gradient (primary at the top, secondary at the bottom), as big as an icon button. A click uses
// that palette in the scope (props.scope). No add or delete: the palette cards do that.
import { withTheme } from './hoc';

// bare: the squares alone, no wrapper, to sit in a row of other controls (the mini editor) and wrap one by one.
const Swatches = ({ theme, update, className, style, bare }) => {
  const current = theme.value('palette');
  const squares = theme.palettes.map((t, i) => (
    <button key={i} type="button" className="border round shadow-sm hover-holographic" onClick={() => update({ palette: i })}
      aria-pressed={i === current} aria-label={`Use theme ${i + 1}: ${t.primary.hex} and ${t.secondary.hex}`} title={`${t.primary.hex} · ${t.secondary.hex}`}
      style={{ width: 'var(--icon-size)', aspectRatio: 1, padding: 0, backgroundImage: `linear-gradient(to bottom, ${t.primary.hex}, ${t.secondary.hex})`,
        // The theme in use: a ring in the page's text color round it.
        ...(i === current && { outline: '2px solid var(--body-color)', outlineOffset: '2px' }) }} />
  ));
  if (bare) return squares;
  return (
    <div className={['row-wrap gap-sm', className].filter(Boolean).join(' ')} role="group" aria-label="Theme colors" style={style}>
      {squares}
    </div>
  );
};

const PaletteSwatches = withTheme(Swatches);

export { PaletteSwatches };
