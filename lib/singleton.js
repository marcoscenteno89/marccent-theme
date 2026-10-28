import { Color } from "@marccent/util/class";
import { Storage } from "@marccent/util/class";
import { Store } from "../core/store";
import defaults from "./defaults";
const storage = new Storage();

// The settings an element's scope can override (Theme.scoped).
const SCOPE_KEYS = [ 'palette', 'isDark', 'glass', 'design' ];
// The id on <html> (app/layout.tsx): the whole site's scope. Any other scope is the id of an element on the page.
const SITE = 'site';
// Where the theme is saved. v2: palettes, the design and the rest by id (2026-10-25); the index-based theme saved
// under the old key is dropped, so those visitors start from the defaults.
const KEY = 'marccent_theme_v2';
const OLD_KEYS = [ 'marccent_theme' ];
const DAY = 24 * 60 * 60 * 1000;

const toPalette = ({ id, primary, secondary }) => ({ id, primary: new Color(primary), secondary: new Color(secondary) });

// The theme: one object for the whole site, changed in place. Every change saves it and emits (lib/store.js), and
// ThemeProvider (lib/context.js) re-renders on the new version: nothing is copied for React. Its starting values are
// lib/theme.defaults.json; a saved theme lasts expiresDays from its first change, then the site starts from the
// defaults again.
class Theme extends Store {
  palette = null;   // the palette in use: a palette's id
  canvasAnimation = 0; // the picked canvas animation; nothing reads it yet, kept for later
  isDark = true;
  rainbow = false;
  glass = false;
  hover = null;     // the default hover effect's id (hovers.css: hover-<id>); data-hover on <html>
  scopes = {};      // elements' own settings: { ["<path>#<id>"]: { palette?, isDark?, glass?, design? } }
  design = null;    // the design style's id (lib/design.js); null: the site's default
  dark = null;
  light = null;
  palettes = [];    // the saved color pairs: { id, primary, secondary } (Colors)
  since = 0;        // when this saved theme started (ms): it expires expiresDays later

  async init() {
    OLD_KEYS.forEach(k => localStorage.removeItem(k));
    const theme = storage.get(KEY); // null once expired (Storage drops it)
    if (!theme) this.loadDefaults();
    else {
      const { palette, canvasAnimation = 0, isDark, rainbow, glass, hover, scopes, design = null, dark, light, palettes, since } = theme;
      Object.assign(this, { palette, canvasAnimation, isDark, rainbow, glass, hover, scopes, design, dark, light, palettes, since });
    }
    return this.save();
  }

  // Every setting from lib/theme.defaults.json, bundled with the theme, so it needs no backend: first visit, and
  // once a saved theme expires. Swap the file to ship other defaults.
  loadDefaults() {
    const { palette, canvasAnimation, isDark, rainbow, glass, hover } = defaults;
    Object.assign(this, { palette, canvasAnimation, isDark, rainbow, glass, hover, design: null, scopes: {}, since: Date.now() });
    this.dark = new Color(defaults.dark);
    this.light = new Color(defaults.light);
    this.palettes = defaults.palettes.map(toPalette);
  }

  // A palette by id: the one in use when id is missing or no longer saved, else the first.
  getPalette(id = this.palette) {
    return this.palettes.find(p => p.id === id) ?? this.palettes.find(p => p.id === this.palette) ?? this.palettes[0];
  }

  // A new palette ({ primary, secondary }) with an id of its own, and puts it in use.
  add(theme) {
    const id = `custom-${Date.now().toString(36)}`;
    this.palettes.push(toPalette({ id, ...theme }));
    this.palette = id;
    return this.save();
  }

  remove(id) {
    this.palettes = this.palettes.filter(p => p.id !== id);
    // Scopes that used the removed palette go back to the site's.
    for (const o of Object.values(this.scopes)) if (o.palette === id) delete o.palette;
    return this.save();
  }

  // The whole site's settings.
  update(obj) {
    Object.assign(this, obj);
    return this.save();
  }

  // Scope settings (SCOPE_KEYS) into one element's scope (key: "<path>#<id>").
  updateScope(key, obj) {
    for (const [ k, v ] of Object.entries(obj)) if (SCOPE_KEYS.includes(k)) this.scopes[key] = { ...this.scopes[key], [k]: v };
    return this.save();
  }

  // A setting as the site's controls show it.
  value(key) {
    return this[key];
  }

  /**
   * The theme as the controls of one scope see it (the theme editors: components/theme/editor.js, mini-editor.js):
   * the theme itself, with value / update / reset aimed at that scope. SITE: the whole site; any other id: that
   * element on the page (path: the page's), its own setting or else the site's. The rest (palettes, add, remove…)
   * is the theme's, so a palette added here is added for everyone.
   * @param {string} id - SITE or an element's id. @param {string} path - The page's path (ThemeContext's path).
   */
  scoped(id, path) {
    const view = Object.create(this);
    for (const m of [ 'add', 'remove', 'save', 'updateScope', 'resetScope' ]) view[m] = this[m].bind(this);
    const key = `${path}#${id}`;
    const site = id === SITE;
    return Object.assign(view, {
      scopeId: id,
      value: site ? (k) => this[k] : (k) => this.scopes[key]?.[k] ?? this[k],
      update: site ? (obj) => this.update(obj) : (obj) => this.updateScope(key, obj),
      reset: site ? () => this.reset() : () => this.resetScope(key),
    });
  }

  // Everything back to how the site starts (lib/theme.defaults.json): its palette, mode, glass, rainbow, hover and
  // design style, no element scopes. Saved palettes stay.
  reset() {
    const { palette, isDark, glass, rainbow, hover } = defaults;
    Object.assign(this, { palette, isDark, glass, rainbow, hover, design: null, scopes: {} });
    return this.save();
  }

  // Drops one element's scope (key: "<path>#<id>"): it goes back to the site's theme.
  resetScope(key) {
    delete this.scopes[key];
    return this.save();
  }

  mode() {
    return this.isDark ? this.dark : this.light;
  }

  rev() {
    return this.isDark ? this.light : this.dark;
  }

  primary() {
    return this.getPalette().primary;
  }

  secondary() {
    return this.getPalette().secondary;
  }

  // A theme color as rgba(): 'primary', 'secondary', 'rev' (the opposite of the mode) or the mode's own.
  rgb(color, opacity) {
    const { r, g, b } = ({ primary: this.primary(), secondary: this.secondary(), rev: this.rev() }[color] ?? this.mode()).rgb;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Saved until its expiry (since + expiresDays), however often it changes before then.
  save() {
    storage.set(KEY, this, Math.max(this.since + defaults.expiresDays * DAY - Date.now(), 0));
    this.emit();
    return this;
  }

}


// SI => Single Instance, There is only one instance of this class. The theme loads once (storage, else lib/theme.defaults.json).
let loading = null;
const themeSI = () => loading ??= new Theme().init();

export { themeSI, SCOPE_KEYS, SITE }
