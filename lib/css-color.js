// Reading theme colors in the browser. Many theme colors are mixed in CSS (color-mix()), so they have no hex
// written anywhere; these read the color the browser actually computes. Browser only (they need the page).

// A computed CSS color ("rgb(…)" or "color(srgb …)", which color-mix gives) as #rrggbb.
export const toHex = (css) => {
  const n = css.match(/[\d.]+/g)?.map(Number) ?? [];
  const rgb = css.startsWith('color(') ? n.slice(0, 3).map(v => v * 255) : n.slice(0, 3);
  return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
};

// The background of a class (e.g. 'bg' for the panel color, 'bg-primary-lighter'), read from a probe element on
// <body>, so it follows the current mode. Returns { hex, image, stops }: image is a gradient as drawn and stops its
// colors as hex.
export const cssBackground = (cls) => {
  const probe = document.createElement('div');
  probe.className = cls;
  document.body.append(probe);
  const { backgroundColor, backgroundImage } = getComputedStyle(probe);
  probe.remove();
  const stops = backgroundImage.match(/(rgba?|color)\([^)]*\)/g)?.map(toHex) ?? [];
  return { hex: toHex(backgroundColor), image: backgroundImage, stops };
};
