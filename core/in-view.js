/**
 * watchInView: calls onChange(true) while el is on screen (or within margin of it) and onChange(false) once it
 * scrolls away. Plain-JS motion (timers, the browser's animation API) starts and stops on it. Returns a function
 * that stops watching. React: useInView (lib/in-view.js).
 * @param {Element} el @param {(inView: boolean) => void} onChange @param {string} [margin='100px']
 * @returns {() => void}
 */
const watchInView = (el, onChange, margin = '100px') => {
  const observer = new IntersectionObserver(([ entry ]) => onChange(entry.isIntersecting), { rootMargin: margin });
  observer.observe(el);
  return () => observer.disconnect();
};

export { watchInView };
