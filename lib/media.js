'use client';
import { useState, useEffect } from 'react';

/**
 * useMedia: whether a media query matches, following it as the screen changes. False on the server and the first
 * render (the wide layout), then the browser's answer.
 * @param {string} query - e.g. '(width < 40rem)'.
 * @returns {boolean}
 */
const useMedia = (query) => {
  const [ matches, setMatches ] = useState(false);
  useEffect(() => {
    const list = matchMedia(query);
    const change = () => setMatches(list.matches);
    change();
    list.addEventListener('change', change);
    return () => list.removeEventListener('change', change);
  }, [ query ]);
  return matches;
};

export { useMedia };
