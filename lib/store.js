'use client';
import { useState, useEffect, useSyncExternalStore } from 'react';

/**
 * Store: base class for plain-JS state (games, players) that React only renders. A subclass changes its own fields
 * and calls this.emit(); every component using it through useStore re-renders. destroy() undoes what it started.
 */
class Store {
  #listeners = new Set();
  version = 0;
  subscribe = (fn) => { this.#listeners.add(fn); return () => this.#listeners.delete(fn); };
  emit() { this.version++; this.#listeners.forEach((fn) => fn()); }
  destroy() {}
}

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
