'use client';
import { useRef, useEffect } from 'react';
import { Navigation, Pagination } from 'swiper/modules';
import { cx } from '../../lib/cx';
import { Icon } from '../ui/icon';

/**
 * usePager: connects a Swiper to a SliderPager (previous | "2 / 8" | next) placed after it. Spread swiperProps on the
 * Swiper and pass the hook's result to SliderPager. The pager renders after the Swiper, so its buttons only exist
 * once the Swiper has started: they are connected after mount. At either end the button fades (opacity-25) and is
 * disabled.
 * @returns {{ swiperProps: Object, refs: Object }}
 * @example
 * const pager = usePager();
 * <Swiper {...pager.swiperProps} slidesPerView="auto">…</Swiper>
 * <SliderPager pager={pager} />
 */
const usePager = () => {
  const prev = useRef(null), next = useRef(null), count = useRef(null), swiper = useRef(null);
  useEffect(() => {
    const s = swiper.current;
    if (!s || s.destroyed) return;
    Object.assign(s.params.navigation, { prevEl: prev.current, nextEl: next.current });
    s.navigation.init();
    s.navigation.update();
    s.params.pagination.el = count.current;
    s.pagination.init();
    s.pagination.render();
    s.pagination.update();
  }, []);
  return {
    refs: { prev, next, count },
    swiperProps: {
      modules: [Navigation, Pagination],
      // null (not left out): Swiper then doesn't draw its own arrows and dots.
      navigation: { prevEl: null, nextEl: null, disabledClass: 'opacity-25' },
      pagination: { el: null, type: 'fraction' },
      onSwiper: (s) => { swiper.current = s; },
    },
  };
};

/**
 * SliderPager: one rounded bar under a slider: previous, the position ("2 / 8"), next. Holographic on hover, as a
 * whole; its own buttons are plain, so the effect doesn't repeat inside it. margin-top -2rem pulls it up into the
 * slider's bottom padding, nearer its slides than anything else. z-index 2: above the slider (Swiper gives
 * .swiper z-index 1), whose padding it may sit in, so the pointer reaches the pill, not the slider.
 * @param {Object} props
 * @param {ReturnType<typeof usePager>} props.pager - From usePager().
 * @param {string} [props.className]
 * @param {Object} [props.style] - Inline styles; marginTop overrides the default -2rem.
 * @param {boolean} [props.compact] - Smaller and tighter, for a row of controls (the mini editor's palette squares).
 */
const SliderPager = ({ pager, className, style, compact }) => {
  const { prev, next, count } = pager.refs;
  const arrow = { border: 0, background: 'none', color: 'inherit', cursor: 'pointer', ...(compact && { padding: '.3em .5em' }) };
  // Compact: the arrows a small square (1.75em) instead of the usual --icon-size.
  const icon = compact ? { width: '1.75em' } : undefined;
  return (
    <div data-component="slider-pager" className={cx('center gap-0 bg border shadow-sm hover-holographic', className)} style={{ justifySelf: 'center', marginTop: '-2rem', borderRadius: '99px', position: 'relative', zIndex: 2, ...(compact && { fontSize: 'var(--text-sm)' }), ...style }}>
      <button ref={prev} type="button" className="col-center" style={arrow} aria-label="Previous slide"><Icon name="arrow-left" style={icon} /></button>
      <span ref={count} className={compact ? 'fw-bold' : 'fs-sm fw-bold pad-x-sm'} style={compact ? { whiteSpace: 'nowrap' } : undefined} />
      <button ref={next} type="button" className="col-center" style={arrow} aria-label="Next slide"><Icon name="arrow-right" style={icon} /></button>
    </div>
  );
};

export { usePager, SliderPager };
