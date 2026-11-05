'use client';
import { useEffect } from 'react';
import { watchInverseMode } from '../core/inverse-mode';

/**
 * useInverseMode: ref's element in the mode opposite the page's (dark on a light page, light on a dark one),
 * switching when it does. A panel that should stand apart from what's around it (Marccent Blocks' Custom HTML).
 * @param {React.RefObject} ref
 */
const useInverseMode = (ref) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return watchInverseMode(el);
  }, [ ref ]);
};

export { watchInverseMode, useInverseMode };
