'use client';
import { useSyncExternalStore } from 'react';
import { Store } from './store';

// The toasts: the newest MAX_TOASTS messages. Anyone can add one (toastSI.add); only the Toast list re-renders.
// The site's, not the theme's: the theme reports its changes through ThemeProvider's notify (lib/context.js).
const MAX_TOASTS = 5;

class Toast extends Store {
  list = [];

  add(msg, type = '') {
    this.list.push({ time: new Date(), type, msg });
    if (this.list.length > MAX_TOASTS) this.list.shift();
    this.emit();
    return this;
  }

  remove(index) {
    this.list.splice(index, 1);
    this.emit();
    return this;
  }
}

// SI => Single Instance: one list for the whole site.
const toastSI = new Toast();

// No provider needed: add one with toastSI.add(msg, tone) from anywhere; only a component that shows them
// (components/ui/toast.js) subscribes, through useToasts.
const useToasts = () => {
  const version = () => toastSI.version;
  useSyncExternalStore(toastSI.subscribe, version, version);
  return toastSI;
};

export { toastSI, useToasts };
