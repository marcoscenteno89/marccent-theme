'use client';
// Palette swatches: the palette cards (palette-cards.js) in miniature for small spaces (the mini editor): one square
// per saved palette, its gradient (primary at the top, secondary at the bottom), as big as an icon button. A click uses
// that palette in the scope (props.scope). No add or delete: the palette cards do that.
import { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { withTheme } from './hoc';
import { ToggleButton } from '../ui/toggle-button';
import { useMedia } from '../../lib/media';
import { usePager, SliderPager } from '../widgets/slider-pager';

// bare: the squares alone, no wrapper, to sit in a row of other controls and wrap one by one. slider: the squares in
// one swiped row instead (SwatchSlider below), for a row that shouldn't wrap (the mini editor); under 400px, where
// even one square and the pill crowd the row, a palette button that opens them in a panel instead (ToggleButton).
const Swatches = ({ theme, update, className, style, bare, slider }) => {
  const narrow = useMedia('(width < 400px)');
  const current = theme.getPalette(theme.value('palette'))?.id;
  const squares = theme.palettes.map((t) => (
    <button data-component="button" data-name={t.id} key={t.id} type="button" className="border round shadow-sm hover-holographic" onClick={() => update({ palette: t.id })}
      aria-pressed={t.id === current} aria-label={`Use palette ${t.id}: ${t.primary.hex} and ${t.secondary.hex}`} title={`${t.primary.hex} · ${t.secondary.hex}`}
      style={{ width: 'var(--icon-size)', aspectRatio: 1, padding: 0, backgroundImage: `linear-gradient(to bottom, ${t.primary.hex}, ${t.secondary.hex})`,
        // The theme in use: a ring in the page's text color round it.
        ...(t.id === current && { outline: '2px solid var(--body-color)', outlineOffset: '2px' }) }} />
  ));
  if (slider && narrow) return (
    <ToggleButton data-name="palette" icon="palette" activeIcon="xmark" aria-label="Theme colors" title="Theme colors"
      panel={<div className="row-wrap gap-sm" style={{ padding: '4px' }}>{squares}</div>} />
  );
  if (slider) return <SwatchSlider squares={squares} current={Math.max(theme.palettes.findIndex(t => t.id === current), 0)} />;
  if (bare) return squares;
  return (
    <div data-component="palette-swatches" className={['row-wrap gap-sm', className].filter(Boolean).join(' ')} role="group" aria-label="Theme colors" style={style}>
      {squares}
    </div>
  );
};

/*
 * SwatchSlider: the squares in a Swiper as wide as its grid column lets it be (give it minmax(0, max-content): all the
 * squares when there's room, less when there isn't). The pill (SliderPager: previous | 2 / 11 | next) shows beside
 * it only while some squares are out of view: Swiper locks when they all fit (watchOverflow) and unlocks when they
 * don't. That can't flip back and forth: the pill only takes room once the squares already don't fit.
 * The palette in use is always in view: it starts there, and when it changes (here, or from another editor, or once
 * the saved theme loads after the first render) the slider moves to it if it's out of view.
 * A little padding inside, so the ring round the palette in use isn't clipped. The slider never gets narrower than
 * one square (plus that padding), so the pill always has its own room and never covers the squares or the controls
 * next to them. The pill's column is max-content, not auto: the pill clips (overflow hidden, for the holographic
 * hover), which makes its automatic minimum 0, and an auto column would let it spill over the squares.
 */
// current: the index of the palette in use among the squares.
const SwatchSlider = ({ squares, current }) => {
  const pager = usePager();
  const swiper = useRef(null);
  const [ more, setMore ] = useState(false); // some squares are out of view: show the pill
  const show = (speed) => {
    const s = swiper.current, slide = s?.slides?.[current];
    if (!slide || s.destroyed) return;
    const box = s.el.getBoundingClientRect(), r = slide.getBoundingClientRect();
    if (r.left < box.left || r.right > box.right) s.slideTo(current, speed);
  };
  const latest = useRef(show);
  latest.current = show;
  useEffect(() => show(), [ current ]);
  // The squares are sized in em (--icon-size), so they change after Swiper measured them (the fonts load, a design
  // style or the type changes) and Swiper only watches its own box: measure again, then bring the one in use back.
  useEffect(() => {
    const s = swiper.current;
    if (!s?.slides?.[0]) return;
    const observer = new ResizeObserver(() => { if (s.destroyed) return; s.update(); latest.current(0); });
    observer.observe(s.slides[0]);
    return () => observer.disconnect();
  }, []);
  return (
    <div data-component="palette-swatches" className="grid items-center" role="group" aria-label="Theme colors"
      style={{ '--gap': 'var(--space-xs)', gridTemplateColumns: `minmax(calc(var(--icon-size) + 8px), max-content)${more ? ' max-content' : ''}` }}>
      <Swiper {...pager.swiperProps} onSwiper={(s) => { pager.swiperProps.onSwiper(s); swiper.current = s; }}
        initialSlide={current ?? 0} slidesPerView="auto" spaceBetween={8} className="w-100" style={{ padding: '4px' }}
        onLock={() => setMore(false)} onUnlock={() => setMore(true)}>
        {squares.map((square, i) => <SwiperSlide key={i} style={{ width: 'auto' }}>{square}</SwiperSlide>)}
      </Swiper>
      <SliderPager pager={pager} compact className={more ? undefined : 'd-none'} style={{ marginTop: 0 }} />
    </div>
  );
};

const PaletteSwatches = withTheme(Swatches);

export { PaletteSwatches };
