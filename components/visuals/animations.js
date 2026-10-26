'use client';
// The canvas animations (canvas.js) as a player: one large animation and, under it, a slider of all of them to pick
// which one it plays. Every canvas is a data-canvas element (visuals/canvas-scanner.js mounts and swaps them), so the
// player only keeps which one is picked.
import { useState } from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import 'swiper/css';
import { ToggleButton } from '../ui/toggle-button';
import { ImageCard } from '../widgets/layout';
import { usePager, SliderPager } from '../widgets/slider-pager';
import { cx } from '../../lib/cx';

// Every animation: its data-canvas name, title and a line on what it does.
const ANIMATIONS = [
  { key: 'blob', name: 'Blob', about: 'Gradient shapes that merge and split' },
  { key: 'network-loop', name: 'Network Loop', about: 'Points that link up as they drift' },
  { key: 'wave', name: 'Wave', about: 'Layered waves rolling across' },
  { key: 'particle-flowfield', name: 'Particle Flowfield', about: 'Dust carried on an unseen current' },
  { key: 'orbit', name: 'Orbit', about: 'Dots circling the center' },
  { key: 'fire', name: 'Fire', about: 'Embers rising in the theme colors' },
  { key: 'snow', name: 'Snow', about: 'Flakes falling at three depths' },
  { key: 'fireflies', name: 'Fireflies', about: 'Glowing dots that wander and blink' },
  { key: 'leaves', name: 'Leaves', about: 'Leaves spinning down on a gust' },
  { key: 'rain', name: 'Rain', about: 'Streaks and ripples on the water' },
  { key: 'bubbles', name: 'Bubbles', about: 'Bubbles wobbling up to the surface' },
];

const AnimPlayer = () => {
  const [ active, setActive ] = useState(0);
  const pager = usePager();
  const current = ANIMATIONS[active];
  return (
    <div data-component="anim-player" className="grid cols-1 gap-sm">
      {/* The stage: the picked animation large, its name over it. */}
      <ImageCard canvas={current.key} alt={`${current.name} animation`} ratio="16 / 9" big className="border"
        label={`Now playing · ${active + 1} / ${ANIMATIONS.length}`} title={current.name} text={current.about} />
      <Swiper
        {...pager.swiperProps}
        modules={[...pager.swiperProps.modules, A11y]}
        className="w-100"
        style={{ padding: '3.5rem' }} /* room for a hovered card: its glow reaches 2.5rem out (hovers.css) and it grows 5% */
        slidesPerView={1}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        spaceBetween={32} /* px between slides (--space-lg: 2rem) */
      >
        {ANIMATIONS.map((anim, i) => {
          const picked = active === i;
          return (
            <SwiperSlide key={anim.key}>
              {/* A card like the theme cards (theme/palette-cards.js): the animation edge to edge, a line, then a .header bar
                  with its name, what it does and the button. The picked card is outlined in the primary color, with a
                  gradient button. */}
              <div className={cx('bg border round grid cols-1 gap-0 overflow-hidden hover-holographic', picked ? 'shadow-lg' : 'shadow')}
                style={picked ? { borderColor: 'var(--primary)' } : undefined}>
                <div data-canvas={anim.key} data-canvas-fps="20" className="border-bottom" style={{ height: '160px' }} />
                <div className="header pad">
                  <div className="grid cols-1 gap-0">
                    <span className="fw-bold">{anim.name}</span>
                    <span className="fs-sm opacity-75 text-truncate">{anim.about}</span>
                  </div>
                  <ToggleButton icon="play" activeIcon="check" activeLabel="Playing" className={picked ? 'gradient' : 'outline-primary'}
                    open={picked} aria-pressed={picked} onToggle={(on) => on && setActive(i)}>
                    Play
                  </ToggleButton>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <SliderPager pager={pager} />
    </div>
  );
}

export { AnimPlayer, ANIMATIONS };
