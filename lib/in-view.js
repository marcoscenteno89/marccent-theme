'use client';
import { useState, useEffect } from 'react';

/**
 * watchInView: calls onChange(true) while el is on screen (or within margin of it) and onChange(false) once it
 * scrolls away. Plain-JS motion (timers, the browser's animation API) starts and stops on it. Returns a function
 * that stops watching.
 * @param {Element} el @param {(inView: boolean) => void} onChange @param {string} [margin='100px']
 * @returns {() => void}
 */
const watchInView = (el, onChange, margin = '100px') => {
  const observer = new IntersectionObserver(([ entry ]) => onChange(entry.isIntersecting), { rootMargin: margin });
  observer.observe(el);
  return () => observer.disconnect();
};

/**
 * useInView: true while ref's element is on screen (or within margin of it), false once it scrolls away. Every motion
 * that runs by itself (timers, the browser's animation API) waits on it, so only what the visitor can see moves.
 * Starts false and turns true as soon as the browser reports the element visible.
 * @param {React.RefObject} ref @param {string} [margin='100px'] - Start a little before it scrolls in.
 * @returns {boolean}
 */
const useInView = (ref, margin = '100px') => {
  const [ inView, setInView ] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return watchInView(el, setInView, margin);
  }, [ ref, margin ]);
  return inView;
};

export { watchInView, useInView };
