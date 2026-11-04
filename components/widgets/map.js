'use client';
import { useEffect, useRef, useState } from 'react';
import { withThemeRead } from '../theme/hoc';
import { cx } from '../../lib/cx';
import { drawMap, loadMapsLibrary, mapStyles } from '../../core/maps';
import '../../styles/components/map.css';

/*
 * Map: a Google map in the theme colors of the box it sits in (a section themed on its own, a landing page's palette,
 * the mode), read from the CSS where the map is (core/maps.js). Made once; theme, center and zoom changes update it in
 * place (a new search re-centers it, a theme switch recolors it). Without a key, or with one Google refuses, it's
 * Google's plain embed (embed). The markup engine draws the same map from <div data-component="map" …> (core/components.js).
 */

const DEFAULT_CENTER = { lat: 43.49, lng: -112.034 }; // Idaho Falls

/**
 * @param {Object} props
 * @param {string} [props.apiKey] - The Google Maps API key (one a page: the first map's wins); the page's
 *   window.marccentMapsKey when left out.
 * @param {{ lat: number, lng: number }} [props.center] - Idaho Falls when left out.
 * @param {number} [props.zoom=10]
 * @param {{ title?: string, link?: string }} [props.marker] - A pin on the center; link: a Google Maps address it opens.
 * @param {string} [props.embed] - A Google Maps embed URL, shown when there's no key or Google refuses it.
 * @param {string} [props.title] - The embed's title.
 * @param {number} [props.recenter] - Change it to put the map back on center and zoom (a Reset button), after the
 *   visitor has panned or zoomed.
 * @param {string} [props.overlay] - A tile layer over the map: a URL with {z}, {x} and {y} (a weather layer).
 *   Changing it swaps the layer; none: just the map.
 * @param {(map: google.maps.Map) => void} [props.onLoad] - Called once with the map when it's made, to draw on it.
 *
 * @example <Map apiKey={key} center={{ lat: 40.7, lng: -74 }} zoom={12} marker={{ title: 'Our shop' }} />
 */
const Map = ({ apiKey, center = DEFAULT_CENTER, zoom = 10, marker, embed, title, recenter, overlay, onLoad, theme, className, style }) => {
  const ref = useRef(null);
  const map = useRef(null);
  const [ ready, setReady ] = useState(false);
  const position = { lat: center.lat, lng: center.lng };

  useEffect(() => {
    let cancelled = false;
    drawMap(ref.current, { key: apiKey || undefined, center: position, zoom, marker, embed, title }).then((m) => {
      if (cancelled || !m) return;
      map.current = m;
      onLoad?.(m);
      setReady(true);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    const layers = map.current?.overlayMapTypes;
    if (!layers) return;
    layers.clear();
    if (overlay) layers.push(new window.google.maps.ImageMapType({
      getTileUrl: ({ x, y }, z) => overlay.replace('{z}', z).replace('{x}', x).replace('{y}', y),
      tileSize: new window.google.maps.Size(256, 256),
      opacity: 0.8,
    }));
  }, [ ready, overlay ]);
  // After a theme change, on the next frame: the section's new colors are in the CSS by then.
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.current?.setOptions({ styles: mapStyles(ref.current) }));
    return () => cancelAnimationFrame(frame);
  }, [ theme, theme?.version ]);
  useEffect(() => {
    map.current?.setCenter(position);
    map.current?.setZoom(zoom);
  }, [ center.lat, center.lng, zoom, recenter ]);

  // The settings as data-*, the markup the engine draws from (a host writes the same), though React draws this one.
  return (
    <div data-component="map" ref={ref} className={cx('map', className)} style={style} data-key={apiKey || undefined}
      data-lat={center.lat} data-lng={center.lng} data-zoom={zoom} data-marker={marker ? '' : undefined}
      data-title={marker?.title ?? title} data-link={marker?.link} data-embed={embed} />
  );
};

const ThemedMap = withThemeRead(Map);

// MapView: the map without the theme context (it then recolors only when it's made), e.g. for the markup reference.
export { ThemedMap as Map, Map as MapView, loadMapsLibrary };
