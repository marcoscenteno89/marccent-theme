/**
 * watchScrolled: calls onChange(true) once the page scrolls past offset pixels and onChange(false) back at the top,
 * now and on each change (not every scroll event). A header that floats over the hero turns solid with it:
 * watchScrolled((on) => header.toggleAttribute('data-scrolled', on)). Returns a function that stops watching.
 * React: useScrolled (lib/scrolled.js).
 * @param {(scrolled: boolean) => void} onChange @param {number} [offset=8]
 * @returns {() => void}
 */
const watchScrolled = (onChange, offset = 8) => {
  let last = null;
  const check = () => {
    const now = window.scrollY > offset;
    if (now !== last) {
      last = now;
      onChange(now);
    }
  };
  check();
  window.addEventListener('scroll', check, { passive: true });
  return () => window.removeEventListener('scroll', check);
};

export { watchScrolled };
