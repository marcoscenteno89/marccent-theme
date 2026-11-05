/**
 * watchInverseMode: el in the mode opposite its surroundings' (the data-theme of its nearest ancestor that has one,
 * else <html>): dark on a light page, light on a dark one, switching when they do. Sets el's data-theme, so the
 * theme's colors inside follow (tokens/defaults.css). Returns a function that stops watching. React: useInverseMode
 * (lib/inverse-mode.js); the markup engine: data-component="inverse-mode".
 * @param {HTMLElement} el
 * @returns {() => void}
 */
const watchInverseMode = (el) => {
  const around = el.parentElement?.closest('[data-theme]') ?? document.documentElement;
  const set = () => { el.dataset.theme = around.dataset.theme === 'dark' ? 'light' : 'dark'; };
  set();
  const watch = new MutationObserver(set);
  watch.observe(around, { attributes: true, attributeFilter: [ 'data-theme' ] });
  return () => watch.disconnect();
};

export { watchInverseMode };
