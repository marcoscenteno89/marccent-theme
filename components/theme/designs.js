'use client';
// Design styles in the browser: a button that widens into a select for small spaces, and the footer's showcase of
// every style as a card that previews it (its own data-design: the style's type, corners and depth) with a button to
// use it. The styles are all loaded (styles/designs.css); the one in use is data-design on <html> (core.js), or on an
// element with a style of its own (a theme editor scoped to it).
import { withTheme } from './hoc';
import { Icon } from '../ui/icon';
import { cx } from '../../lib/cx';
import { Button } from '../ui/button';
import { Carousel } from '../widgets/carousel';
import { DESIGNS, DEFAULT_DESIGN, designTitle } from '../../lib/design';

const OPTIONS = [ ...DESIGNS, { name: 'none', title: 'Plain', description: 'No design style: the theme on its own.' } ];

/**
 * DesignSelect: the design style as an icon button that widens into a select on hover (hover-expand, the select as
 * its label; :focus-within keeps it open while the select is in use). For tight rows (the mini editor). A div, not a
 * <button>: a select can't sit inside a button. The select's own box is cleared so it reads as the button's label.
 * @param {string} [className]
 */
const Select = ({ theme, update, className }) => {
  const current = theme.value('design') ?? DEFAULT_DESIGN;
  return (
    <div className={cx('btn hover-expand', className)} title="Design Style">
      <Icon name="swatchbook" className="btn-icon" />
      <select className="btn-text" aria-label="Design Style" value={current} onChange={(e) => update({ design: e.target.value })}
        style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', cursor: 'pointer' }}>
        {/* The list in the page's colors: the select's inherited light text would otherwise sit on a white list. */}
        {OPTIONS.map(d => <option key={d.name} value={d.name} style={{ color: 'var(--body-color)', background: 'var(--body-bg)' }}>{d.title}</option>)}
      </select>
    </div>
  );
};

// One style as a card, in that style: its name as a heading, what it is (two lines; the full text is its title), a
// sample button that uses it. self-start keeps the clamped text its own height, so the clipped lines don't show. Two layers:
// the outer one sets the style (its variables), the card inside the mode, so a style's light / dark page colors
// (written for a [data-theme] inside it) apply and the text takes them (color: --body-color).
const DesignCard = ({ design, active, dark, use }) => (
  <div data-design={design.name} className="grid h-100">
    <article data-theme={dark ? 'dark' : 'light'} className="bg border round shadow pad-sm grid cols-1 gap-sm h-100 hover-holographic"
      style={{ gridTemplateRows: 'auto 1fr auto', color: 'var(--body-color)' }}>
      <h4 className="h6">{design.title}</h4>
      <p className="fs-sm opacity-75 self-start" title={design.description}
        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {design.description}
      </p>
      <Button icon={active ? 'check' : 'swatchbook'} className={active ? 'success w-100' : 'primary w-100'} aria-pressed={active} onClick={use}>
        {active ? 'In use' : 'Use'}
      </Button>
    </article>
  </div>
);

/** DesignCards: every style as a card in a carousel, the one in use first marked. */
const DesignCardList = ({ theme, update }) => {
  const current = theme.value('design') ?? DEFAULT_DESIGN;
  return (
    <div className="bg border round shadow pad grid cols-1 gap-sm content-start h-100">
      <h3 className="h6 text-uppercase opacity-75">Design style: {designTitle(current)}</h3>
      <Carousel slideWidth="12rem" label="Design styles">
        {OPTIONS.map(d => <DesignCard key={d.name} design={d} active={d.name === current} dark={theme.value('isDark')} use={() => update({ design: d.name })} />)}
      </Carousel>
    </div>
  );
};

const DesignSelect = withTheme(Select);
const DesignCards = withTheme(DesignCardList);

export { DesignSelect, DesignCards };
