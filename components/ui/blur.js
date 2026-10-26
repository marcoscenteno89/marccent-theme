'use client';
import { useState, useRef, useEffect } from 'react';
import { cx } from '../../lib/cx';

// SVG goo filter: blurs and re-sharpens what uses it (filter: url(#id)), merging shapes that touch.
const Blur = (props) => {
  const ref = useRef(null);
  const { style={}, id } = props;
  const [ deviation, setDeviation ] = useState(null);
  useEffect(() => setDeviation(parseInt(5 + ref.current.parentNode.offsetWidth / 75)), []);
  
  return (
    <svg ref={ref} data-component="blur" className={cx('d-none', props.className)} style={style}>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={deviation} result="blur" />
          <feColorMatrix in="blur" mode="matrix" result="filter" 
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" />
          <feComposite in="SourceGraphic"  in2="filter" operator="atop" />
        </filter>
      </defs>
    </svg>
  )
}

export { Blur };
