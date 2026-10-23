'use client';
import { Children } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import { usePager, SliderPager } from './slider-pager';

/**
 * Carousel: its children side by side, swiped or stepped with the pager below (previous | 2 / 8 | next) or the keyboard. Built on
 * Swiper, like the footer sliders (their layout fixes are in site.css). Each slide is slideWidth wide and they all
 * stretch to the tallest, so cards in it line up; give a card h-100 to fill its slide.
 * @param {string} [slideWidth='17rem'] @param {string} [label='Carousel']
 */
const Carousel = ({ slideWidth = '17rem', label = 'Carousel', className, children }) => {
  const pager = usePager();
  return (
    <div className="grid cols-1 gap-sm">
      <Swiper
        {...pager.swiperProps}
        modules={[ ...pager.swiperProps.modules, Keyboard, A11y ]}
        className={['w-100', className].filter(Boolean).join(' ')}
        style={{ paddingBlock: 'var(--space) 2.25rem' }} /* room for the cards' shadows and hover growth (the slider clips); at the
        bottom also for the pager, which sits 2rem up into it */
        slidesPerView="auto"
        spaceBetween={24}
        keyboard={{ enabled: true }}
        a11y={{ containerMessage: label }}
      >
        {Children.toArray(children).map((child, i) => (
          <SwiperSlide key={child.key ?? i} style={{ width: slideWidth, height: 'auto' }}>{child}</SwiperSlide>
        ))}
      </Swiper>
      <SliderPager pager={pager} />
    </div>
  );
};

export { Carousel };
