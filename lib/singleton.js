import { Color } from "@marccent/util/class";
import { Storage } from "@marccent/util/class";
import { Store } from "./store";
import defaults from "./theme.defaults.json";
const storage = new Storage();

// The settings an element's scope can override (Theme.scoped).
const SCOPE_KEYS = [ 'palette', 'isDark', 'glass', 'design' ];
// The id on <html> (app/layout.tsx): the whole site's scope. Any other scope is the id of an element on the page.
const SITE = 'site';

// A theme saved before the renames (2026-10-23) read with the new names: themeList → palettes, active → palette,
// is_dark → isDark, sections → scopes (and inside them too). Section keys by position ("/#section-3") are
// dropped: scopes are by id now.
const migrate = (t) => ({
  palettes: [ ...(t.palettes ?? t.themeList ?? []) ],
  palette: t.palette ?? t.active ?? 0,
  isDark: t.isDark ?? t.is_dark ?? true,
  scopes: Object.fromEntries(Object.entries(t.scopes ?? t.sections ?? {})
    .filter(([ key ]) => !/#section-\d+$/.test(key))
    .map(([ key, { active, is_dark, ...o } ]) => [ key, { ...o, ...(active != null && { palette: active }), ...(is_dark != null && { isDark: is_dark }) } ])),
});

// The theme: one object for the whole site, changed in place. Every change saves it and emits (lib/store.js), and
// ThemeProvider (lib/context.js) re-renders on the new version: nothing is copied for React.
class Theme extends Store {
  palette = 0;      // the palette in use: an index in palettes
  animation = 0;
  isDark = true;
  rainbow = false;
  glass = false;
  scopes = {};      // elements' own settings: { ["<path>#<id>"]: { palette?, isDark?, glass?, design? } }
  design = null;    // the design style (lib/design.js); null: the site's default
  dark = null;
  light = null;
  palettes = [];    // the saved color pairs: { primary, secondary } Colors

  async init() {
    const theme = storage.get('marccent_theme');
    if (!theme) this.loadDefaults();
    else {
      const { animation, rainbow, glass, design = null, dark, light } = theme;
      Object.assign(this, { animation, rainbow, glass, design, dark, light, ...migrate(theme) });
    }
    return this.save();
  }

  // First visit: the starter colors from lib/theme.defaults.json (the page colors and the palettes), bundled with the
  // theme, so it needs no backend. Swap the file to ship other defaults.
  loadDefaults() {
    this.dark = new Color(defaults.dark);
    this.light = new Color(defaults.light);
    this.palettes = defaults.palettes.map(({ primary, secondary }) => ({ primary: new Color(primary), secondary: new Color(secondary) }));
  }

  add(theme) {
    this.palettes.push({
      primary: new Color(theme.primary),
      secondary: new Color(theme.secondary)
    });
    this.palette = this.palettes.length - 1;
    return this.save();
  }

  remove(index) {
    this.palettes.splice(index, 1);
    if (index < this.palette) this.palette = this.palette - 1;
    // Scopes that used the removed palette go back to the site's; later ones shift down with the list.
    for (const o of Object.values(this.scopes)) {
      if (o.palette === index) delete o.palette;
      else if (o.palette > index) o.palette--;
    }
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

  // Everything back to how the site starts: the first palette, dark mode, no glass or rainbow, the default design
  // style, no element scopes. Saved palettes stay.
  reset() {
    Object.assign(this, { palette: 0, isDark: true, glass: false, rainbow: false, design: null, scopes: {} });
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
    return this.palettes[this.palette].primary;
  }

  secondary() {
    return this.palettes[this.palette].secondary;
  }

  // A theme color as rgba(): 'primary', 'secondary', 'rev' (the opposite of the mode) or the mode's own.
  rgb(color, opacity) {
    const { r, g, b } = ({ primary: this.primary(), secondary: this.secondary(), rev: this.rev() }[color] ?? this.mode()).rgb;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  save() {
    storage.set('marccent_theme', this);
    this.emit();
    return this;
  }

}


// SI => Single Instance, There is only one instance of this class. The theme loads once (storage, else lib/theme.defaults.json).
let loading = null;
const themeSI = () => loading ??= new Theme().init();

export { themeSI, SCOPE_KEYS, SITE }
