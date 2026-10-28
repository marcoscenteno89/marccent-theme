import base from './theme.defaults.json';

/*
 * The theme's starting values: lib/theme.defaults.json, with the site's own on top when the page sets
 * window.marccentDefaults before the theme's script runs (a CMS prints it from its settings: WordPress, Django). A
 * site's palettes go before the package's.
 *   <script>window.marccentDefaults = {"palette":"brand","isDark":false,"design":"swiss","palettes":[{"id":"brand","primary":"#046bd2","secondary":"#1e293b"}]}</script>
 *
 * A visitor's saved theme (marccent_theme_v2) holds a copy of the palettes and settings it started from, so once the
 * site changes its defaults (a new brand color) returning visitors would keep the old ones. The defaults it was saved
 * under are stamped beside it; when they differ, the saved theme is dropped and the visitor starts from the new ones.
 * This runs on import, before the theme reads what's saved. With window.marccentDev set, nothing saved is restored:
 * every load starts from the defaults (for development).
 */
const site = (typeof window !== 'undefined' && window.marccentDefaults) || {};
const own = site.palettes ?? [];

if (typeof window !== 'undefined' && window.marccentDefaults) {
  try {
    const stamp = JSON.stringify(site);
    if (window.marccentDev || localStorage.getItem('marccent_defaults_stamp') !== stamp) {
      localStorage.removeItem('marccent_theme_v2');
      localStorage.setItem('marccent_defaults_stamp', stamp);
    }
  } catch {}
}

const defaults = {
  ...base,
  ...site,
  vars: { ...base.vars, ...site.vars },
  palettes: [ ...own, ...base.palettes.filter((p) => !own.some((o) => o.id === p.id)) ],
};

export default defaults;
