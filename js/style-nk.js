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
    /* Révision du 18/08/2026 : « pas de texture au dessin, seulement une
       couleur simple, type blanc cassé pour la France », « ne pas mettre les
       démarcations si pas absolument nécessaire ».

       Le fond est donc réduit à trois aplats : la mer en blanc, la terre en
       blanc cassé, une frontière de pays à peine posée. Plus de forêts, plus
       de zones urbaines, plus de routes, plus de limites régionales — tout
       ce qui produisait du bruit sous les données. */
    light: {
      fond:      '#FFFFFF',
      eau:       '#FFFFFF',
      terre:     '#F1EDE3',
      /* Le blanc cassé sur du blanc, c'est 3 % d'écart : le pays existe mais
         ne se lit pas. Un trait de côte suffit à le faire apparaître, et
         c'est la seule démarcation qu'on garde — plus de limites régionales,
         plus de frontières, puisqu'il n'y a plus de voisins à délimiter. */
      cote:      '#C7C1B2',
      texte:     '#9A958C',
      texteFort: '#4A4740',
      halo:      'rgba(255,255,255,.94)',
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
        /* Le masque : le monde, percé à la forme de la France. Voir
           masque-france.js — c'est lui qui fait qu'on ne voit que le pays. */
        masque: { type: 'geojson', data: window.NK_MASQUE },
        contour: { type: 'geojson', data: window.NK_CONTOUR },
      },
      layers: [
        { id: 'fond', type: 'background', paint: { 'background-color': c.fond } },

        /* La terre : UN aplat, uniforme. Plus de forêts, plus de zones
           urbaines, plus de routes : sous les données, tout ça faisait du
           bruit et rien d'autre. */
        { id: 'terre', type: 'fill', source: 'nk', 'source-layer': 'earth',
          paint: { 'fill-color': c.terre } },

        /* La mer est du même blanc que la page : c'est la frontière du pays
           qui dessine la France, pas un contraste terre/mer. */
        { id: 'eau', type: 'fill', source: 'nk', 'source-layer': 'water',
          paint: { 'fill-color': c.eau } },

        /* LE MASQUE. Tout ce qui n'est pas la France est recouvert de blanc :
           plus de pays limitrophes, plus de frontières, plus rien à lire
           autour du pays. Il est posé AVANT les étiquettes, sinon il les
           effacerait elles aussi. */
        { id: 'masque', type: 'fill', source: 'masque',
          paint: { 'fill-color': c.fond } },

        /* Trait de côte : le contour de la France, dessiné depuis le même
           fichier que le masque. Sans lui, le pays est un aplat blanc cassé
           sur du blanc, et il disparaît. C'est la seule démarcation qu'on
           garde — les limites régionales sont retirées. */
        { id: 'cote', type: 'line', source: 'contour',
          paint: {
            'line-color': c.cote,
            'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.2, 10, 2],
          } },

        /* Étiquettes : les villes seulement à partir du zoom 7, quand on est
           entré dans un secteur et qu'on a besoin de se repérer. À l'échelle
           de la France, la carte ne porte aucun texte. */
        { id: 'lieu-ville', type: 'symbol', source: 'nk', 'source-layer': 'places',
          filter: ['==', ['get', 'kind'], 'locality'], minzoom: 7,
          layout: {
            'text-field': NOM,
            'text-font': ['Noto Sans Regular'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 7, 10, 10, 13],
            'text-max-width': 8,
          },
          paint: { 'text-color': c.texteFort, 'text-halo-color': c.halo, 'text-halo-width': 1.6 } },
      ],
    };
  }

  /* Repli CARTO : le style vient de chez eux, il ne contient donc pas le
     masque. On le pose après coup, sinon la démo sans tuiles auto-hébergées
     afficherait toute l'Europe. */
  function poserMasque(map) {
    if (map.getLayer('masque')) return;
    const c = PALETTES.light;
    if (!map.getSource('masque')) map.addSource('masque', { type: 'geojson', data: window.NK_MASQUE });
    if (!map.getSource('contour')) map.addSource('contour', { type: 'geojson', data: window.NK_CONTOUR });
    map.addLayer({ id: 'masque', type: 'fill', source: 'masque',
                   paint: { 'fill-color': c.fond } });
    map.addLayer({ id: 'cote', type: 'line', source: 'contour',
                   paint: { 'line-color': c.cote, 'line-width': 1.2 } });
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

  return { style, enregistrerProtocole, disponible, poserMasque, PALETTES };
})();
