'use client';
import { useState, useEffect } from 'react';
import { watchScrolled } from '../core/scrolled';

/**
 * useScrolled: true once the page has scrolled past offset pixels, false back at the top (watchScrolled,
 * core/scrolled.js). Starts false, as the server renders it.
 * @param {number} [offset=8]
 * @returns {boolean}
 */
const useScrolled = (offset = 8) => {
  const [ scrolled, setScrolled ] = useState(false);
  useEffect(() => watchScrolled(setScrolled, offset), [ offset ]);
  return scrolled;
};

export { watchScrolled, useScrolled };
