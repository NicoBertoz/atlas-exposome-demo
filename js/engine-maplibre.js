/* ------------------------------------------------------------------ *
 *  Moteur 1 — MapLibre GL JS (BSD-3) + fonds vectoriels CARTO
 *  Rendu WebGL, style entièrement pilotable en JSON, zoom continu.
 *  Candidat par défaut pour un récit type Forensic Architecture.
 * ------------------------------------------------------------------ */
window.NK_ENGINES = window.NK_ENGINES || {};

window.NK_ENGINES.maplibre = (function () {
  'use strict';

  const S = () => window.NK_SHARED;
  /* Repli si le fichier de tuiles n'a pas été déployé (cf. style-nk.js) */
  const CARTO = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  };
  let auto = false;   // vrai si on sert nos propres tuiles
  const styleDe = key => (auto ? window.NK_STYLE.style(key) : CARTO[key]);
  const EMPTY = { type: 'FeatureCollection', features: [] };

  let map, ctx, last, popup, hover = null, current = 'dark';

  /* On n'attend PAS l'événement 'load' : il dépend d'une première frame de
     rendu, qui n'arrive jamais dans un onglet non peint (aperçus, tests
     headless, arrière-plan). 'styledata' a le même défaut. On écoute donc
     l'événement ET on surveille l'état, le premier arrivé l'emporte. */
  function whenReady(cb) {
    if (map.isStyleLoaded()) return cb();
    let fait = false;
    const go = () => { if (!fait) { fait = true; clearInterval(t); cb(); } };
    map.once('styledata', () => setTimeout(go, 0));
    const t = setInterval(() => map.isStyleLoaded() && go(), 120);
    setTimeout(() => clearInterval(t), 30000);
  }


  const NOS_SOURCES = ['zones', 'sig', 'pts', 'exact'];
  const NOS_COUCHES = ['zone-fill', 'zone-line', 'zone-line-anon', 'zone-label',
                       'sig', 'pt-halo', 'pt', 'pt-n', 'exact'];

  /* Idempotente : addLayers peut être rejouée après un setStyle, et une
     seconde pose sur une source déjà déclarée laisserait la pile à moitié
     construite, sans lever d'erreur visible. */
  function addLayers() {
    NOS_COUCHES.forEach(l => map.getLayer(l) && map.removeLayer(l));
    NOS_SOURCES.forEach(s => map.getSource(s) && map.removeSource(s));

    // notre style lit déjà name:fr ; la réécriture ne sert qu'au repli CARTO
    if (!auto) S().libellesEnFrancais(map);

    const col = ['case',
      ['get', 'anonyme'], S().C.anonyme,
      ['==', ['get', 'categorie'], 'A'], S().C.confirme,
      S().C.enquete];

    /* Toutes les sources d'abord, les couches ensuite. Déclarer une source au
       milieu de la pile de couches marche en théorie, mais laisse des tuiles
       non générées si une couche antérieure a été rejetée. */
    map.addSource('zones', { type: 'geojson', data: window.NK_DATA.hotspots });
    map.addSource('sig', { type: 'geojson', data: window.NK_DATA.signalements });
    map.addSource('pts', { type: 'geojson', data: EMPTY });
    map.addSource('exact', { type: 'geojson', data: EMPTY });

    map.addLayer({
      id: 'zone-fill', type: 'fill', source: 'zones',
      paint: {
        'fill-color': col,
        'fill-opacity': ['case',
          ['boolean', ['feature-state', 'hover'], false], 0.34,
          ['get', 'anonyme'], 0.07, 0.17],
      },
    });
    /* line-dasharray n'accepte pas d'expression dépendant de la donnée : une
       couche qui en contient une est rejetée en silence, sans erreur visible.
       D'où deux couches filtrées, chacune avec un tireté constant. */
    const largeur = ['case', ['boolean', ['feature-state', 'hover'], false], 2.6, 1.3];
    map.addLayer({
      id: 'zone-line', type: 'line', source: 'zones',
      filter: ['!', ['get', 'anonyme']],
      paint: { 'line-color': col, 'line-width': largeur, 'line-dasharray': [2.5, 1.5] },
    });
    map.addLayer({
      id: 'zone-line-anon', type: 'line', source: 'zones',
      filter: ['get', 'anonyme'],
      paint: { 'line-color': col, 'line-width': largeur, 'line-dasharray': [1, 2] },
    });
    // Pastilles numérotées : la seule lecture possible à l'échelle nationale
    map.addLayer({
      id: 'zone-label', type: 'symbol', source: 'zones',
      minzoom: 8.5,
      layout: {
        'text-field': ['get', 'nom'], 'text-size': 12,
        'text-font': ['Open Sans Semibold'], 'text-max-width': 9,
      },
      paint: { 'text-color': '#E8EAED', 'text-halo-color': 'rgba(11,13,16,.92)', 'text-halo-width': 1.8 },
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

    /* Comparateur d'atelier : les positions exactes, par-dessus les secteurs.
       Vide en temps normal (cf. app.js). */
    map.addLayer({
      id: 'exact', type: 'circle', source: 'exact',
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 2.4, 10, 4, 14, 6],
        'circle-stroke-width': 1, 'circle-stroke-color': '#0B0D10',
      },
    });

    /* Les taches floues sont larges : sans ce réordonnancement elles passent
       devant les pastilles de cluster, qui portent le propos principal. */
    ['exact', 'sig', 'zone-label'].forEach(l => map.moveLayer(l));
  }

  /* Pastilles numérotées en marqueurs DOM plutôt qu'en couche GL.
     Dix-neuf éléments ne coûtent rien, et cela évite le pipeline de tuiles
     d'une source ponctuelle secondaire — le même choix que côté Leaflet,
     ce qui rend les deux moteurs directement comparables. */
  let pastilles = [];
  function creerPastilles() {
    pastilles.forEach(m => m.remove());
    pastilles = S().marqueurs.features.map(f => {
      const el = document.createElement('button');
      el.className = 'nk-marq gl';
      el.innerHTML = `<span style="background:${f.properties.marker_color}">${f.properties.num}</span>`;
      const h = S().hotspotParId(f.properties.id);
      el.addEventListener('click', ev => { ev.stopPropagation(); ctx.onZone(h); });
      el.addEventListener('mouseenter', () =>
        popup.setLngLat(f.geometry.coordinates).setHTML(S().zoneHTML(h, true)).addTo(map));
      el.addEventListener('mouseleave', () => popup.remove());
      return new maplibregl.Marker({ element: el })
        .setLngLat(f.geometry.coordinates).addTo(map);
    });
    map.on('zoomend', () => syncPastilles(last && last.zones));
  }

  function syncPastilles(on) {
    const visible = on !== false && map.getZoom() < 9;
    pastilles.forEach(m => { m.getElement().style.display = visible ? '' : 'none'; });
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
    bindHover('zone-fill', 'zones', p => S().zoneHTML(p, true));

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
      return new Promise(async resolve => {
        auto = window.NK_STYLE.enregistrerProtocole() && await window.NK_STYLE.disponible();
        map = new maplibregl.Map({
          container, style: styleDe('dark'),
          center: S().FRANCE.center, zoom: S().FRANCE.zoom,
          attributionControl: { compact: true },
        });
        popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, maxWidth: '290px', offset: 12 });
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
        whenReady(() => {
          addLayers(); bindEvents(); creerPastilles();
          if (last) this.render(last);
          map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(), duration: 0 });
          c.onReady('maplibre'); resolve();
        });
      });
    },

    setBasemap(key) {
      if (!map || key === current) return;
      current = key;
      map.setStyle(styleDe(key));
      // setStyle repart d'une feuille vierge : il faut reposer sources et couches
      whenReady(() => { addLayers(); bindEvents(); if (last) this.render(last); });
    },

    render(state) {
      last = state;
      if (!map || !map.getSource('pts')) return;
      map.getSource('pts').setData(S().cellulesGeoJSON(state.cellules));
      map.getSource('exact').setData(
        { type: 'FeatureCollection', features: state.pointsExacts || [] });
      const vis = (l, on) => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', on ? 'visible' : 'none');
      ['zone-fill', 'zone-line', 'zone-line-anon', 'zone-label'].forEach(l => vis(l, state.zones));
      syncPastilles(state.zones);
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
