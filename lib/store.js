'use client';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { Store } from '../core/store';

// Store is plain JS (core/store.js); useStore is how React renders one.

/**
 * useStore: makes one Store with create() for the component's lifetime, re-renders on its emit() and calls its
 * destroy() on unmount.
 * @template {Store} T @param {() => T} create @returns {T}
 */
const useStore = (create) => {
  const [ store ] = useState(create);
  const version = () => store.version;
  useSyncExternalStore(store.subscribe, version, version);
  useEffect(() => () => store.destroy(), [ store ]);
  return store;
};

export { Store, useStore };
