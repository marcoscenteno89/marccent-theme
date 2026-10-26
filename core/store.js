/**
 * Store: base class for plain-JS state (the theme, toasts, games) that any UI renders. A subclass changes its own
 * fields and calls this.emit(); every subscriber is called. React subscribes through useStore (lib/store.js);
 * plain JS calls subscribe itself. destroy() undoes what it started.
 */
class Store {
  #listeners = new Set();
  version = 0;

  subscribe = (fn) => {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  };

  emit() {
    this.version++;
    this.#listeners.forEach((fn) => fn());
  }

  destroy() {}
}

export { Store };
