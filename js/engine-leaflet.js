/* ------------------------------------------------------------------ *
 *  Moteur 2 — Leaflet (BSD-2) + tuiles raster CARTO
 *  ~42 ko, rendu canvas/SVG, aucune dépendance WebGL. Le plus simple à
 *  reprendre par un bénévole, le plus tolérant aux vieux appareils.
 * ------------------------------------------------------------------ */
window.NK_ENGINES = window.NK_ENGINES || {};

window.NK_ENGINES.leaflet = (function () {
  'use strict';

  const S = () => window.NK_SHARED;
  /* Les libellés d'une tuile raster sont dessinés dans l'image : impossible de
     les traduire côté client, contrairement aux deux moteurs vectoriels.
     Deux façons de ne pas afficher d'anglais :
       fond sombre → CARTO sans aucun libellé, nos pastilles portent le sens ;
       fond clair  → tuiles OSM France, dont les libellés sont déjà en français. */
  const TILES = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
      opts: { subdomains: 'abcd', maxZoom: 19, attribution: '&copy; OpenStreetMap, &copy; CARTO' },
    },
    light: {
      url: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
      opts: { subdomains: 'abc', maxZoom: 19, attribution: '&copy; OpenStreetMap France' },
    },
  };

  let map, ctx, tiles, ptLayer, sigLayer, zoneLayer, marqLayer, exactLayer, last;

  function zoneStyle(f, hover) {
    const p = f.properties, c = S().zoneColor(p);
    return {
      color: c, weight: hover ? 2.6 : 1.3,
      dashArray: p.anonyme ? '2 4' : '5 3',
      fillColor: c, fillOpacity: hover ? 0.34 : (p.anonyme ? 0.07 : 0.17),
    };
  }

  function syncMarq(z) {
    if (!marqLayer || !last) return;
    const show = last.zones && z < 10;   // 9 chez MapLibre, +1 ici (cf. init)
    if (show && !map.hasLayer(marqLayer)) marqLayer.addTo(map);
    if (!show && map.hasLayer(marqLayer)) map.removeLayer(marqLayer);
  }

  return {
    id: 'leaflet',
    label: 'Leaflet',
    note: 'Tuiles raster, marqueurs vectoriels. 42 ko et un très gros écosystème de plugins. Le fond est une image : ni ses couleurs ni la langue de ses libellés ne se modifient — on ne peut qu\'en changer.',
    caps: [['style sur-mesure', false], ['zoom continu', false], ['libellés en français', false],
           ['~10k points', false], ['agrégation GPU', false], ['auto-hébergeable', true]],

    init(container, c) {
      ctx = c;
      /* Leaflet compte en tuiles de 256 px, MapLibre en tuiles de 512 :
         un même cadrage vaut zoom + 1 ici. On aligne pour que les trois
         moteurs montrent exactement la même chose au démarrage. */
      map = L.map(container, {
        center: [S().FRANCE.center[1], S().FRANCE.center[0]],
        zoom: S().FRANCE.zoom + 1, zoomControl: false, preferCanvas: true, tap: true,
        zoomSnap: 0.25, zoomDelta: 0.5,
      });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      tiles = L.tileLayer(TILES.light.url, TILES.light.opts).addTo(map);

      zoneLayer = L.geoJSON(window.NK_DATA.hotspots, {
        style: f => zoneStyle(f),
        onEachFeature: (f, layer) => {
          layer.bindPopup(S().zoneHTML(f.properties, true), { maxWidth: 290, autoPan: false });
          layer.on('mouseover', () => { layer.setStyle(zoneStyle(f, true)); layer.openPopup(); });
          layer.on('mouseout', () => { layer.setStyle(zoneStyle(f)); layer.closePopup(); });
          layer.on('click', () => { layer.closePopup(); ctx.onZone(f.properties); });
        },
      }).addTo(map);

      sigLayer = L.geoJSON(window.NK_DATA.signalements, {
        pointToLayer: (f, ll) => L.circleMarker(ll, {
          radius: 5, color: '#8B857A', weight: 1.5, fill: true,
          fillColor: '#F4F1E8', fillOpacity: 0.55,
        }),
        onEachFeature: (f, layer) => {
          layer.bindPopup(S().sigHTML(f.properties), { maxWidth: 290, autoPan: false });
          layer.on('mouseover', () => { layer.setStyle({ color: '#14120D' }); layer.openPopup(); });
          layer.on('mouseout', () => { layer.setStyle({ color: '#8B857A' }); layer.closePopup(); });
          layer.on('click', () => { layer.closePopup(); ctx.onSignal(f.properties); });
        },
      }).addTo(map);

      // Pastilles numérotées, en divIcon : lisibles à l'échelle nationale,
      // masquées au-delà du zoom 9 où les polygones prennent le relais.
      marqLayer = L.geoJSON(S().marqueurs, {
        pointToLayer: (f, ll) => L.marker(ll, {
          icon: L.divIcon({
            className: 'nk-marq', iconSize: [26, 26], iconAnchor: [13, 13],
            html: `<span style="background:${f.properties.marker_color}">${f.properties.num}</span>`,
          }),
        }),
        onEachFeature: (f, layer) => {
          const h = S().hotspotParId(f.properties.id);
          layer.bindPopup(S().zoneHTML(h, true), { maxWidth: 290, autoPan: false });
          layer.on('mouseover', () => layer.openPopup());
          layer.on('mouseout', () => layer.closePopup());
          layer.on('click', () => { layer.closePopup(); ctx.onZone(h); });
        },
      }).addTo(map);
      map.on('zoomend', () => syncMarq(map.getZoom()));

      ptLayer = L.layerGroup().addTo(map);
      exactLayer = L.layerGroup().addTo(map);
      const fb = S().FRANCE.bounds, pd = S().FRANCE.padding();
      map.fitBounds([[fb[0][1], fb[0][0]], [fb[1][1], fb[1][0]]], { padding: [pd, pd] });
      c.onReady('leaflet');
      return Promise.resolve();
    },

    setBasemap(key) {
      if (!map || !tiles) return;
      // changer d'attribution et de sous-domaines impose de recréer la couche
      map.removeLayer(tiles);
      tiles = L.tileLayer(TILES[key].url, TILES[key].opts).addTo(map);
      tiles.setZIndex(0);
    },

    render(state) {
      last = state;
      if (!map) return;
      ptLayer.clearLayers();
      /* L.circle prend un rayon en mètres : la tache correspond exactement à
         la demi-maille. Trois cercles concentriques imitent le flou, que
         Leaflet ne sait pas produire nativement. */
      if (state.temoins) state.cellules.forEach(c => {
        const g = L.layerGroup();
        [[1, 0.14, 15], [0.72, 0.18, 11], [0.44, 0.26, 7]].forEach(([k, op, minPx]) => {
          L.circle([c.centre[1], c.centre[0]], {
            radius: c.rayon_km * 1000 * k, stroke: false,
            fillColor: c.color, fillOpacity: op, interactive: false,
          }).addTo(g);
          // plancher de lisibilité : de loin, la maille ferait 5 px de large
          L.circleMarker([c.centre[1], c.centre[0]], {
            radius: minPx, stroke: false,
            fillColor: c.color, fillOpacity: op, interactive: false,
          }).addTo(g);
        });
        const hit = L.circle([c.centre[1], c.centre[0]], {
          radius: c.rayon_km * 1000 * 0.72, color: c.color, weight: 1,
          opacity: 0.4, fillOpacity: 0,
        }).addTo(g);
        L.marker([c.centre[1], c.centre[0]], {
          icon: L.divIcon({ className: 'nk-cell', iconSize: [30, 20], iconAnchor: [15, 10],
                            html: `<span>${c.n}</span>` }),
          interactive: false,
        }).addTo(g);
        hit.bindPopup(S().celluleHTML(c), { maxWidth: 290, autoPan: false });
        hit.on('mouseover', () => hit.openPopup());
        hit.on('mouseout', () => hit.closePopup());
        hit.on('click', () => {
          hit.closePopup(); ctx.onCell(c);
          map.flyTo([c.centre[1], c.centre[0]], Math.max(map.getZoom(), 9), { duration: 0.9 });
        });
        g.addTo(ptLayer);
      });

      // comparateur d'atelier : positions exactes par-dessus les secteurs
      exactLayer.clearLayers();
      (state.pointsExacts || []).forEach(f => {
        const [lng, lat] = f.geometry.coordinates;
        L.circleMarker([lat, lng], {
          radius: 3.5, color: '#0B0D10', weight: 1,
          fillColor: f.properties.color, fillOpacity: 1,
        }).addTo(exactLayer);
      });

      const toggle = (layer, on) => on
        ? (!map.hasLayer(layer) && layer.addTo(map))
        : map.removeLayer(layer);
      toggle(zoneLayer, state.zones);
      toggle(sigLayer, state.sig);
      syncMarq(map.getZoom());
      // les zones passent dessous, sinon elles avalent les clics sur les points
      if (state.zones) zoneLayer.eachLayer(l => l.bringToBack());
    },

    flyTo(lng, lat, zoom) { map && map.flyTo([lat, lng], zoom + 1, { duration: 1.1 }); },

    fitZone(p) {
      if (!map) return;
      const b = S().bounds(p);
      const pd = S().FRANCE.zonePadding();
      map.flyToBounds([[b[0][1], b[0][0]], [b[1][1], b[1][0]]], { padding: [pd, pd], duration: 1.2 });
    },

    fitFrance() {
      if (!map) return;
      const b = S().FRANCE.bounds, pd = S().FRANCE.padding();
      map.flyToBounds([[b[0][1], b[0][0]], [b[1][1], b[1][0]]], { padding: [pd, pd], duration: 1.4 });
    },

    resize() { map && map.invalidateSize(); },

    get map() { return map; },   // exposé pour le débogage en console
  };
})();
