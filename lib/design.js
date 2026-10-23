import { DESIGNS } from './designs.gen';

/*
 * Design styles: the looks in styles/themes (type, shape, depth, effects over the site's own colors), all loaded
 * through styles/designs.css and picked by data-design on <html>. Visitors switch them with the theme controls
 * (components/theme/designs.js); this is the one the site starts with. 'none' is the plain look.
 */
const DEFAULT_DESIGN = 'modern';

const designTitle = (name) => name === 'none' ? 'Plain' : DESIGNS.find(d => d.name === name)?.title ?? name;

export { DESIGNS, DEFAULT_DESIGN, designTitle };
