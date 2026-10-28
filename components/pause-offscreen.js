'use client';
import { useEffect, useContext } from 'react';
import { ThemeContext } from '../lib/context';
import { watchOffscreen } from '../core/offscreen';

/*
 * PauseOffscreen: watchOffscreen (core/offscreen.js) for a React page: pauses the CSS animations of whatever is
 * scrolled away. Renders nothing; inside ThemeProvider, whose path makes it scan again after a navigation.
 */
const PauseOffscreen = () => {
  const pathname = useContext(ThemeContext)?.path;
  useEffect(() => watchOffscreen(), [ pathname ]);
  return null;
};

export { PauseOffscreen };
