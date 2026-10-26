'use client';
import { useState, useEffect } from 'react';
import { watchInView } from '../core/in-view';

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
