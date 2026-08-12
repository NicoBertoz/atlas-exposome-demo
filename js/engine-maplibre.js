/* ------------------------------------------------------------------ *
 *  Moteur 1 — MapLibre GL JS (BSD-3) + fonds vectoriels CARTO
 *  Rendu WebGL, style entièrement pilotable en JSON, zoom continu.
 *  Candidat par défaut pour un récit type Forensic Architecture.
 * ------------------------------------------------------------------ */
window.NK_ENGINES = window.NK_ENGINES || {};

window.NK_ENGINES.maplibre = (function () {
  'use strict';

  const S = () => window.NK_SHARED;
  const STYLES = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  };
  const EMPTY = { type: 'FeatureCollection', features: [] };

  let map, ctx, last, popup, hover = null, current = 'dark';

  /* On n'attend PAS l'événement 'load' : il dépend d'une première frame de
     rendu, qui n'arrive jamais dans un onglet non peint (aperçus, tests
     headless, arrière-plan). 'styledata' suffit pour poser des couches. */
  function whenReady(cb) {
    if (map.isStyleLoaded()) return cb();
    map.once('styledata', () => setTimeout(cb, 0));
  }

  function addLayers() {
    S().libellesEnFrancais(map);

    const col = ['case',
      ['get', 'anonyme'], S().C.anonyme,
      ['==', ['get', 'categorie'], 'A'], S().C.confirme,
      S().C.enquete];

    map.addSource('zones', { type: 'geojson', data: window.NK_DATA.hotspots });
    map.addSource('sig', { type: 'geojson', data: window.NK_DATA.signalements });
    map.addSource('pts', { type: 'geojson', data: EMPTY });

    map.addLayer({
      id: 'zone-fill', type: 'fill', source: 'zones',
      paint: {
        'fill-color': col,
        'fill-opacity': ['case',
          ['boolean', ['feature-state', 'hover'], false], 0.34,
          ['get', 'anonyme'], 0.07, 0.17],
      },
    });
    map.addLayer({
      id: 'zone-line', type: 'line', source: 'zones',
      paint: {
        'line-color': col,
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.6, 1.3],
        'line-dasharray': ['case', ['get', 'anonyme'], ['literal', [1, 2]], ['literal', [2.5, 1.5]]],
      },
    });
    // Pastilles numérotées : la seule lecture possible à l'échelle nationale
    map.addSource('marq', { type: 'geojson', data: S().marqueurs });

    /* Le libellé est posé sur le centre (source ponctuelle) et non sur le
       polygone : sur une surface, MapLibre répète le texte à chaque tuile. */
    map.addLayer({
      id: 'zone-label', type: 'symbol', source: 'marq',
      minzoom: 8.5,
      layout: {
        'text-field': ['get', 'nom'], 'text-size': 12,
        'text-font': ['Open Sans Semibold'], 'text-max-width': 9,
      },
      paint: { 'text-color': '#E8EAED', 'text-halo-color': 'rgba(11,13,16,.92)', 'text-halo-width': 1.8 },
    });
    map.addLayer({
      id: 'marq-halo', type: 'circle', source: 'marq', maxzoom: 9,
      paint: {
        'circle-color': ['get', 'marker_color'], 'circle-opacity': 0.2,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 16, 9, 30],
      },
    });
    map.addLayer({
      id: 'marq', type: 'circle', source: 'marq', maxzoom: 9,
      paint: {
        'circle-color': ['get', 'marker_color'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 10, 9, 14],
        'circle-stroke-width': 2, 'circle-stroke-color': 'rgba(11,13,16,.9)',
      },
    });
    map.addLayer({
      id: 'marq-num', type: 'symbol', source: 'marq', maxzoom: 9,
      layout: {
        'text-field': ['get', 'num'], 'text-size': 12,
        'text-font': ['Open Sans Bold'], 'text-allow-overlap': true,
      },
      paint: { 'text-color': '#0B0D10' },
    });

    // Signalements : carrés creux, volontairement discrets face aux clusters
    map.addLayer({
      id: 'sig', type: 'circle', source: 'sig',
      paint: {
        'circle-color': 'rgba(0,0,0,0)',
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 10, 7],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': ['case', ['boolean', ['feature-state', 'hover'], false], '#E8FF3B', '#9AA3AF'],
      },
    });

    /* Témoignages : jamais un point, toujours une tache dont le rayon vaut la
       demi-maille. circle-blur adoucit le bord pour qu'aucun contour net ne
       laisse croire à une limite réelle. Un plancher en pixels garde la tache
       lisible de loin : elle ne devient jamais plus PETITE que la maille, ce
       qui n'enlèverait rien au flou. */
    map.addLayer({
      id: 'pt-halo', type: 'circle', source: 'pts',
      paint: {
        'circle-color': ['get', 'color'], 'circle-opacity': 0.20,
        'circle-blur': 0.85,
        'circle-radius': S().rayonParNiveau(15, 1),
      },
    });
    map.addLayer({
      id: 'pt', type: 'circle', source: 'pts',
      paint: {
        'circle-color': ['get', 'color'], 'circle-opacity': 0.38,
        'circle-blur': 0.5,
        'circle-radius': S().rayonParNiveau(9, 0.6),
        'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(11,13,16,.45)',
      },
    });
    map.addLayer({
      id: 'pt-n', type: 'symbol', source: 'pts',
      layout: {
        'text-field': ['to-string', ['get', 'n']], 'text-size': 12,
        'text-font': ['Open Sans Bold'], 'text-allow-overlap': true,
      },
      paint: { 'text-color': '#E8EAED', 'text-halo-color': 'rgba(11,13,16,.85)', 'text-halo-width': 1.4 },
    });

    /* Les taches floues sont larges : sans ce réordonnancement elles passent
       devant les pastilles de cluster, qui portent le propos principal. */
    ['sig', 'marq-halo', 'marq', 'marq-num', 'zone-label'].forEach(l => map.moveLayer(l));
  }

  /* Un seul gestionnaire de survol par source, pour éviter que trois
     couches se disputent le popup. */
  function bindHover(layer, source, html) {
    map.on('mousemove', layer, e => {
      const f = e.features[0];
      map.getCanvas().style.cursor = 'pointer';
      if (hover && (hover.id !== f.id || hover.source !== source))
        map.setFeatureState(hover, { hover: false });
      hover = { source, id: f.id };
      map.setFeatureState(hover, { hover: true });
      popup.setLngLat(e.lngLat).setHTML(html(f.properties)).addTo(map);
    });
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = '';
      if (hover) map.setFeatureState(hover, { hover: false });
      hover = null; popup.remove();
    });
  }

  function bindEvents() {
    bindHover('pt', 'pts', c => S().celluleHTML(JSON.parse(c.data)));
    bindHover('sig', 'sig', p => S().sigHTML(p));
    bindHover('marq', 'marq', p => S().zoneHTML(p, true));
    bindHover('zone-fill', 'zones', p => S().zoneHTML(p, true));

    map.on('click', 'marq', e => ctx.onZone(e.features[0].properties));

    map.on('click', 'pt', e => {
      ctx.onCell(JSON.parse(e.features[0].properties.data));
      map.flyTo({ center: e.features[0].geometry.coordinates, zoom: Math.max(map.getZoom(), 8), speed: 0.9 });
    });
    map.on('click', 'sig', e => {
      if (map.queryRenderedFeatures(e.point, { layers: ['pt'] }).length) return;
      ctx.onSignal(e.features[0].properties);
      map.flyTo({ center: e.features[0].geometry.coordinates, zoom: Math.max(map.getZoom(), 9), speed: 0.9 });
    });
    map.on('click', 'zone-fill', e => {
      // les points passent avant la zone qui les contient
      if (map.queryRenderedFeatures(e.point, { layers: ['pt', 'sig'] }).length) return;
      ctx.onZone(e.features[0].properties);
    });
  }

  return {
    id: 'maplibre',
    label: 'MapLibre GL JS',
    note: 'Tuiles vectorielles, rendu WebGL. Le style est un JSON : couleurs, épaisseurs et libellés du fond se pilotent couche par couche, et s\'animent au scroll.',
    caps: [['style sur-mesure', true], ['zoom continu', true], ['libellés en français', true],
           ['~10k points', true], ['agrégation GPU', false], ['auto-hébergeable', true]],

    init(container, c) {
      ctx = c;
      return new Promise(resolve => {
        map = new maplibregl.Map({
          container, style: STYLES.dark,
          center: S().FRANCE.center, zoom: S().FRANCE.zoom,
          attributionControl: { compact: true },
        });
        popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, maxWidth: '290px', offset: 12 });
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
        whenReady(() => {
          addLayers(); bindEvents();
          if (last) this.render(last);
          map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(), duration: 0 });
          c.onReady('maplibre'); resolve();
        });
      });
    },

    setBasemap(key) {
      if (!map || key === current) return;
      current = key;
      map.setStyle(STYLES[key]);
      // setStyle repart d'une feuille vierge : il faut reposer sources et couches
      map.once('styledata', () => setTimeout(() => {
        addLayers(); bindEvents(); if (last) this.render(last);
      }, 0));
    },

    render(state) {
      last = state;
      if (!map || !map.getSource('pts')) return;
      map.getSource('pts').setData(S().cellulesGeoJSON(state.cellules));
      const vis = (l, on) => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', on ? 'visible' : 'none');
      ['zone-fill', 'zone-line', 'zone-label', 'marq-halo', 'marq', 'marq-num']
        .forEach(l => vis(l, state.zones));
      vis('sig', state.sig);
      ['pt-halo', 'pt', 'pt-n'].forEach(l => vis(l, state.temoins));
    },

    flyTo(lng, lat, zoom) { map && map.flyTo({ center: [lng, lat], zoom, speed: 0.85, curve: 1.4 }); },

    fitZone(p) { map && map.fitBounds(S().bounds(p), { padding: S().FRANCE.zonePadding(), duration: 1200 }); },

    fitFrance() { map && map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(), duration: 1400 }); },

    resize() { map && map.resize(); },

    get map() { return map; },   // exposé pour le débogage en console
  };
})();
