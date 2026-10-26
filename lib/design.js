import { DESIGNS } from './designs.gen';
import defaults from './theme.defaults.json';

/*
 * Design styles: the looks in styles/themes (type, shape, depth, effects over the site's own colors), all loaded
 * through styles/designs.css and picked by id (data-design on <html>). Visitors switch them with the theme controls
 * (components/theme/designs.js); this is the one the site starts with. 'none' is the plain look.
 */
const DEFAULT_DESIGN = defaults.design; // lib/theme.defaults.json

const designTitle = (id) => id === 'none' ? 'Plain' : DESIGNS.find(d => d.id === id)?.title ?? id;

export { DESIGNS, DEFAULT_DESIGN, designTitle };
