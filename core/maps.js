import { toHex } from '../lib/css-color';

/*
 * Google Maps in the theme's colors, shared by Map (components/widgets/map.js) and the markup engine's map
 * (core/components.js): the Maps script loads once a page, the map's colors are read from the CSS where it sits (its
 * section's palette and mode, not the site-wide theme), a pin in the theme's secondary, and Google's plain embed
 * where there's no key or Google refuses it.
 */

// The Maps script, once a page, however many maps there are. Google takes one key a page: the first one wins.
let script = null;
const loadMaps = (key) => {
  script ??= new Promise((resolve, reject) => {
    window.__marccentMapsReady = () => resolve(window.google.maps);
    const s = Object.assign(document.createElement('script'), {
      src: `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__marccentMapsReady`,
      async: true,
      onerror: reject,
    });
    document.head.append(s);
  });
  return script;
};

/**
 * loadMapsLibrary: one Maps library ('maps', 'marker', 'geocoding'…), through the page's one script.
 * @param {string} name @param {string} [key=window.marccentMapsKey] - The Google Maps API key.
 * @returns {Promise<Object>}
 */
const loadMapsLibrary = async (name, key = window.marccentMapsKey) => (await loadMaps(key)).importLibrary(name);

// A CSS color (a var(), color-mix()…) as the browser computes it where the map is, as hex: a probe beside the map
// (Google fills the map's own box), so it gets the same scope, palette and mode.
const readColor = (el, css) => {
  const probe = document.createElement('span');
  probe.style.color = css;
  el.parentElement.append(probe);
  const hex = toHex(getComputedStyle(probe).color);
  probe.remove();
  return hex;
};

/**
 * mapStyles: the map's colors, from the theme where el sits. The land is the panel color (--surface), parks and
 * water shades of it toward the text color, roads the secondary, transit the primary; labels in the body color on a
 * halo of the page color, so they read whatever they cross.
 * @param {HTMLElement} el - The map's box.
 */
const mapStyles = (el) => {
  const color = (css) => readColor(el, css);
  const subtle = (pct) => color(`color-mix(in srgb, var(--body-color) ${pct}%, var(--surface))`);
  return [
    { elementType: 'geometry', stylers: [ { color: color('var(--surface)') } ] },
    { featureType: 'poi', elementType: 'geometry', stylers: [ { color: subtle(6) } ] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [ { color: subtle(10) } ] },
    { featureType: 'road', elementType: 'geometry', stylers: [ { color: color('var(--secondary)') } ] },
    { featureType: 'transit', elementType: 'geometry', stylers: [ { color: color('var(--primary)') } ] },
    { featureType: 'water', elementType: 'geometry', stylers: [ { color: subtle(18) } ] },
    { elementType: 'labels.text.fill', stylers: [ { color: color('var(--body-color)') } ] },
    { elementType: 'labels.text.stroke', stylers: [ { color: color('var(--body-bg)') }, { weight: 3 } ] },
  ];
};

// The pin: a drop in the theme's secondary with an edge of the page color.
const pinIcon = (el, g) => ({
  path: 'M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0z',
  fillColor: readColor(el, 'var(--secondary)'), fillOpacity: 1,
  strokeColor: readColor(el, 'var(--body-bg)'), strokeWeight: 2, scale: 1.2, anchor: new g.Point(12, 32),
});

// A link out of the map, only when it's an https Google Maps address (a javascript: or other URL would run on the page).
const MAPS_HOSTS = [ 'maps.google.com', 'www.google.com', 'google.com', 'maps.app.goo.gl' ];
const mapsUrl = (url) => {
  try {
    const u = new URL(url, location.href);
    return u.protocol === 'https:' && MAPS_HOSTS.includes(u.hostname) ? u.href : null;
  } catch {
    return null;
  }
};

/**
 * embedMap: Google's plain embed in el, in place of the map (no key, or Google refused it). Nothing without a
 * Google Maps embed URL.
 * @param {HTMLElement} el @param {string} [url] @param {string} [title]
 */
const embedMap = (el, url, title = '') => {
  const src = mapsUrl(url);
  if (!src) return;
  const frame = Object.assign(document.createElement('iframe'), { src, title, loading: 'lazy' });
  frame.style.cssText = 'border:0;width:100%;height:100%;min-height:inherit';
  el.replaceChildren(frame);
};

// A cluster: a disc in the theme's primary, the number of pins in it in the primary's text color, larger as it holds
// more (Google's MarkerClusterer calls render; colors read at each render, so a theme change shows on the next).
const clusterRenderer = (el, g) => ({
  render: ({ count, position }) => new g.Marker({
    position,
    icon: {
      path: g.SymbolPath.CIRCLE, scale: 14 + Math.min(Math.log10(count) * 8, 16),
      fillColor: readColor(el, 'var(--primary)'), fillOpacity: .9, strokeColor: readColor(el, 'var(--body-bg)'), strokeWeight: 3,
    },
    label: { text: String(count), color: readColor(el, 'var(--primary-text)'), fontSize: '13px', fontWeight: '700' },
    title: `${count} places`,
    zIndex: 1000 + count,
  }),
});

const extras = new WeakMap(); // map → { el, g, pins, clusterer }: what restyleMap recolors

/**
 * drawMap: a map in el, in the theme's colors, with pins (a click on one opens its link, a Google Maps address). Many
 * pins are clustered: those close together at the zoom shown merge into one numbered disc, which zooms in on them when
 * clicked. With pins, the map fits them all unless fit is false (center and zoom are then where it starts). A key
 * Google refuses (another site's, the API off) shows the embed instead. Without key, the page's
 * window.marccentMapsKey (a host sets it once, so the key stays out of the content); without either, the embed.
 * @param {HTMLElement} el
 * @param {{ key?: string, center: { lat: number, lng: number }, zoom?: number,
 *   marker?: { title?: string, link?: string }, markers?: { lat: number, lng: number, title?: string, link?: string }[],
 *   cluster?: boolean, fit?: boolean, embed?: string, title?: string }} options - marker: one pin on the center.
 *   markers: pins anywhere; cluster (default true) groups them.
 * @returns {Promise<google.maps.Map | undefined>}
 */
const drawMap = async (el, { key = window.marccentMapsKey, center, zoom = 10, marker, markers = [], cluster = true, fit = true, embed, title }) => {
  if (!key) return embedMap(el, embed, title);
  window.gm_authFailure = () => embedMap(el, embed, title);
  let g;
  try {
    g = await loadMaps(key);
    await g.importLibrary('maps');
  } catch {
    return embedMap(el, embed, title);
  }
  el.replaceChildren();
  const map = new g.Map(el, {
    center, zoom, styles: mapStyles(el),
    mapTypeControl: false, streetViewControl: false, fullscreenControl: false, clickableIcons: false,
  });
  const places = [ ...(marker ? [ { ...center, ...marker } ] : []), ...markers ];
  const pins = places.map((p) => {
    const pin = new g.Marker({ position: { lat: Number(p.lat), lng: Number(p.lng) }, title: p.title, icon: pinIcon(el, g) });
    const link = mapsUrl(p.link);
    if (link) pin.addListener('click', () => window.open(link, '_blank', 'noopener'));
    return pin;
  });
  let clusterer = null;
  if (cluster && pins.length > 1) {
    const { MarkerClusterer } = await import('@googlemaps/markerclusterer');
    clusterer = new MarkerClusterer({ map, markers: pins, renderer: clusterRenderer(el, g) });
  } else {
    pins.forEach((pin) => pin.setMap(map));
  }
  if (fit && markers.length) {
    const bounds = new g.LatLngBounds();
    pins.forEach((pin) => bounds.extend(pin.getPosition()));
    map.fitBounds(bounds, 48);
    if (pins.length === 1) g.event.addListenerOnce(map, 'idle', () => map.setZoom(zoom));
  }
  extras.set(map, { el, g, pins, clusterer });
  return map;
};

/**
 * restyleMap: the map's colors again from the theme where it sits (after a theme change), its pins and clusters too.
 * @param {google.maps.Map} map
 */
const restyleMap = (map) => {
  const x = extras.get(map);
  if (!x) return;
  map.setOptions({ styles: mapStyles(x.el) });
  x.pins.forEach((pin) => pin.setIcon(pinIcon(x.el, x.g)));
  x.clusterer?.render();
};

export { loadMapsLibrary, mapStyles, mapsUrl, embedMap, drawMap, restyleMap };
