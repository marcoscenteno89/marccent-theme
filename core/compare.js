/**
 * compare: Compare's behavior (components/ui/compare.js), for React and the plain-JS engine alike: the range input
 * inside a [data-component="compare"] moves the divide (--pos on the root, a percentage). Returns a function that
 * stops.
 * @param {HTMLElement} root
 * @returns {() => void}
 */
const compare = (root) => {
  const range = root.querySelector('.compare-range');
  if (!range) {
    return () => {};
  }
  const move = () => {
    root.style.setProperty('--pos', `${range.value}%`);
  };
  range.addEventListener('input', move);
  move();
  return () => {
    range.removeEventListener('input', move);
  };
};

export { compare };
