/* ------------------------------------------------------------------ *
 *  style-nk.js — le fond de carte du projet, écrit à la main.
 *
 *  Il lit un fichier PMTiles auto-hébergé (schéma Protomaps Basemap v4,
 *  dérivé d'OpenStreetMap) : plus de dépendance à un serveur de tuiles
 *  tiers, et un style qui nous appartient au lieu d'être emprunté.
 *
 *  Deux conséquences directes pour le projet :
 *   - les libellés viennent du champ `name:fr` des tuiles, donc en français
 *     sans retouche côté client ;
 *   - toutes les couleurs sont ici. Quand la charte NK arrivera, c'est ce
 *     fichier et le bloc :root de app.css qu'il faudra reprendre, rien d'autre.
 *
 *  Le fichier couvre la France métropolitaine jusqu'au zoom 9. Au-delà,
 *  MapLibre réutilise les tuiles du zoom 9 : la géométrie s'épaissit, mais
 *  la carte reste lisible. Pour un rendu net jusqu'au zoom 14, il faut un
 *  extrait plus lourd, hébergé sur du stockage objet (voir README).
 * ------------------------------------------------------------------ */
window.NK_STYLE = (function () {
  'use strict';

  /* Le protocole pmtiles:// attend une URL absolue : un chemin relatif
     échoue sans lever d'erreur, la carte reste simplement vide. */
  const FICHIER = new URL('tiles/france.pmtiles', document.baseURI).href;
  const SOURCE = 'pmtiles://' + FICHIER;

  const PALETTES = {
    dark: {
      fond:      '#0B0D10',
      terre:     '#171C23',
      eau:       '#080F16',
      vert:      '#161C1B',
      urbain:    '#1E242C',
      frontiere: '#39424F',
      pays:      '#4B5666',
      route:     '#242A33',
      routeMaj:  '#2E3540',
      texte:     '#8C97A6',
      texteFort: '#C6CDD6',
      halo:      'rgba(11,13,16,.92)',
    },
    /* Papier : le fond de carte doit s'effacer derrière les encres des
       clusters. Aucun aplat ne dépasse le contraste d'un tramé léger. */
    light: {
      /* La mer est franchement plus foncée que la terre : sans ce contraste,
         le contour de la France ne se lit pas, et un fond de carte qu'on ne
         reconnaît pas comme une carte ne sert à rien en arrière-plan. */
      fond:      '#CFDCDA',
      eau:       '#CFDCDA',
      terre:     '#F7F4EA',
      vert:      '#ECEBDB',
      urbain:    '#E6E0CE',
      frontiere: '#BDB6A1',
      pays:      '#9C947F',
      route:     '#E0DAC6',
      routeMaj:  '#CFC8B0',
      texte:     '#7A7468',
      texteFort: '#332F28',
      halo:      'rgba(247,244,234,.92)',
    },
  };

  /* Les tuiles portent name:fr ; on se rabat sur le nom local si absent. */
  const NOM = ['coalesce', ['get', 'name:fr'], ['get', 'name']];

  function style(theme) {
    const c = PALETTES[theme] || PALETTES.light;

    return {
      version: 8,
      name: 'Atlas NK ' + theme,
      glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
      sources: {
        nk: { type: 'vector', url: SOURCE, attribution: '&copy; OpenStreetMap, Protomaps' },
      },
      layers: [
        { id: 'fond', type: 'background', paint: { 'background-color': c.fond } },

        { id: 'terre', type: 'fill', source: 'nk', 'source-layer': 'earth',
          paint: { 'fill-color': c.terre } },

        { id: 'couvert', type: 'fill', source: 'nk', 'source-layer': 'landcover',
          filter: ['in', ['get', 'kind'], ['literal', ['forest', 'grassland', 'scrub', 'farmland']]],
          paint: { 'fill-color': c.vert, 'fill-opacity': 0.55 } },

        { id: 'urbain', type: 'fill', source: 'nk', 'source-layer': 'landuse',
          filter: ['in', ['get', 'kind'], ['literal', ['urban_area', 'residential', 'industrial']]],
          paint: { 'fill-color': c.urbain, 'fill-opacity': 0.75 } },

        { id: 'eau', type: 'fill', source: 'nk', 'source-layer': 'water',
          paint: { 'fill-color': c.eau } },

        // Cours d'eau : une ligne, sinon ils disparaissent en dessous du zoom 8
        { id: 'riviere', type: 'line', source: 'nk', 'source-layer': 'water',
          filter: ['==', ['geometry-type'], 'LineString'],
          paint: {
            'line-color': c.eau,
            'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 1.6],
          } },

        { id: 'route-secondaire', type: 'line', source: 'nk', 'source-layer': 'roads',
          minzoom: 7,
          filter: ['in', ['get', 'kind'], ['literal', ['medium_road', 'minor_road']]],
          paint: {
            'line-color': c.route,
            'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.3, 12, 1.6],
          } },

        { id: 'route', type: 'line', source: 'nk', 'source-layer': 'roads',
          filter: ['in', ['get', 'kind'], ['literal', ['highway', 'major_road']]],
          paint: {
            'line-color': c.routeMaj,
            'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 9, 1.2, 13, 3],
          } },

        { id: 'limite-region', type: 'line', source: 'nk', 'source-layer': 'boundaries',
          filter: ['!=', ['get', 'kind'], 'country'],
          paint: {
            'line-color': c.frontiere, 'line-dasharray': [2, 2],
            'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.4, 10, 1],
          } },

        { id: 'limite-pays', type: 'line', source: 'nk', 'source-layer': 'boundaries',
          filter: ['==', ['get', 'kind'], 'country'],
          paint: {
            'line-color': c.pays,
            'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 10, 1.8],
          } },

        /* Étiquettes. `min_zoom` est porté par la donnée : on s'en sert pour
           ne pas afficher un hameau à l'échelle de la France. */
        { id: 'lieu-ville', type: 'symbol', source: 'nk', 'source-layer': 'places',
          filter: ['==', ['get', 'kind'], 'locality'],
          layout: {
            'text-field': NOM,
            'text-font': ['Noto Sans Regular'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 13],
            'text-max-width': 8,
          },
          paint: { 'text-color': c.texteFort, 'text-halo-color': c.halo, 'text-halo-width': 1.5 } },

        { id: 'lieu-region', type: 'symbol', source: 'nk', 'source-layer': 'places',
          filter: ['in', ['get', 'kind'], ['literal', ['region', 'macroregion']]],
          maxzoom: 9,
          layout: {
            'text-field': NOM,
            'text-font': ['Noto Sans Medium'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 4, 10, 8, 12],
            'text-transform': 'uppercase', 'text-letter-spacing': 0.12,
            'text-max-width': 7,
          },
          paint: { 'text-color': c.texte, 'text-halo-color': c.halo, 'text-halo-width': 1.4 } },

        { id: 'lieu-pays', type: 'symbol', source: 'nk', 'source-layer': 'places',
          filter: ['==', ['get', 'kind'], 'country'],
          maxzoom: 7,
          layout: {
            'text-field': NOM,
            'text-font': ['Noto Sans Medium'],
            'text-size': 12, 'text-transform': 'uppercase', 'text-letter-spacing': 0.16,
          },
          paint: { 'text-color': c.texte, 'text-halo-color': c.halo, 'text-halo-width': 1.4 } },
      ],
    };
  }

  /* Le protocole pmtiles:// doit être enregistré une seule fois, avant la
     création de la première carte. */
  let enregistre = false;
  function enregistrerProtocole() {
    if (enregistre || typeof pmtiles === 'undefined') return enregistre;
    const p = new pmtiles.Protocol();
    maplibregl.addProtocol('pmtiles', p.tile);
    enregistre = true;
    return true;
  }

  /* Le fichier de tuiles est volumineux : s'il n'a pas été déployé, on ne
     casse pas la démo, on retombe sur CARTO en le disant dans la console. */
  let dispo = null;
  async function disponible() {
    if (dispo !== null) return dispo;
    try {
      const r = await fetch(FICHIER, { headers: { Range: 'bytes=0-15' } });
      // 206 attendu : sans HTTP Range, PMTiles ne peut rien lire
      if (r.status !== 206) console.warn('[NK] le serveur ne gère pas les requêtes Range');
      dispo = r.ok && typeof pmtiles !== 'undefined';
    } catch (e) {
      dispo = false;
    }
    if (!dispo) console.info('[NK] tuiles auto-hébergées absentes, repli sur CARTO');
    return dispo;
  }

  return { style, enregistrerProtocole, disponible, PALETTES };
})();
