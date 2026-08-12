/* ------------------------------------------------------------------ *
 *  shared.js — ce que les trois moteurs ont en commun.
 *  Couleurs, gabarits de popup, petits utilitaires. Chargé avant les
 *  moteurs pour qu'aucun d'eux n'ait sa propre version d'un libellé.
 * ------------------------------------------------------------------ */
window.NK_SHARED = (function () {
  'use strict';

  const C = { confirme: '#E22D22', enquete: '#EF8410', anonyme: '#8B857A' };

  /* Un cluster est rouge si l'excès est confirmé (catégorie A du corpus),
     orange s'il est contesté ou en cours d'instruction (B et C),
     gris tireté si le périmètre lui-même n'est pas public. */
  function zoneColor(p) {
    if (p.anonyme) return C.anonyme;
    return p.categorie === 'A' ? C.confirme : C.enquete;
  }

  const nb = v => String(v).replace('.', ',');

  /* Les fonds vectoriels CARTO sont servis avec le champ `name` (nom local ou
     anglais selon les objets : « New Aquitania », « Island of France »…).
     Les tuiles OpenMapTiles transportent aussi `name:fr`. On réécrit donc le
     text-field de chaque couche de libellés pour préférer le français, avec
     repli sur le nom local. À rejouer après chaque setStyle().
     Leaflet ne peut pas en bénéficier : ses tuiles sont des images, les
     libellés y sont déjà dessinés. */
  function libellesEnFrancais(map) {
    const style = map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach(l => {
      if (l.type !== 'symbol' || !l.layout || !l.layout['text-field']) return;
      map.setLayoutProperty(l.id, 'text-field',
        ['coalesce', ['get', 'name:fr'], ['get', 'name_fr'], ['get', 'name'], ['get', 'name:latin']]);
    });
  }

  function zoneHTML(p, avecCta) {
    const col = zoneColor(p);
    return `<div class="pop">
      <h4>${p.nom}</h4>
      <div class="m">${p.lieu} · ${p.periode}</div>
      <div class="row">
        <div><b style="color:${col}">${p.mesure_txt.split(' [')[0]}</b><span>${p.anonyme ? 'Constat' : 'Mesure'}</span></div>
        <div><b style="color:${col}">${p.categorie}</b><span>${p.cat_label}</span></div>
      </div>
      <div class="m">${p.pathologie}</div>
      ${avecCta ? '<div class="cta">Cliquer pour la fiche complète</div>' : ''}
    </div>`;
  }

  function sigHTML(p) {
    return `<div class="pop">
      <h4>${p.nom}</h4>
      <div class="m">${p.lieu} · ${p.periode}</div>
      <div class="m" style="margin-top:6px"><b style="color:#E8EAED">${p.cas}</b></div>
      <div class="m">${p.pathologie}</div>
      <div class="cta">Signalement instruit · cliquer pour la fiche</div>
    </div>`;
  }

  function temHTML(p) {
    return `<div class="pop">
      <h4>${p.dep}</h4>
      <div class="m" style="color:${p.color}">${p.patho_label}</div>
      <div class="m">Diagnostic en ${p.annee} · ${p.tranche_age}</div>
      <div class="cta">Témoignage fictif · cliquer pour le lire</div>
    </div>`;
  }

  function hex2rgba(h, a) {
    const n = parseInt(h.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  }
  function rgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }

  /* Emprise d'un cluster, en degrés, pour les trois moteurs */
  function bounds(p) {
    const k = p.rayon_km / 108;
    const kx = k / Math.cos(p.centre[1] * Math.PI / 180);
    return [[p.centre[0] - kx, p.centre[1] - k], [p.centre[0] + kx, p.centre[1] + k]];
  }

  /* Emprise de la France métropolitaine. On cadre dessus plutôt que sur un
     zoom fixe : le panneau latéral en bureau et le format portrait en mobile
     ne laissent pas la même place à la carte. */
  const FRANCE = {
    center: [2.7, 46.6], zoom: 5.55,
    bounds: [[-5.4, 41.2], [9.8, 51.3]],
    padding: () => (window.innerWidth < 860 ? 16 : 40),
    // un cluster cadré au plus juste perd son contexte : on laisse respirer
    zonePadding: () => (window.innerWidth < 860 ? 60 : 170),
  };

  /* À l'échelle de la France, un cluster de 3 km ne se voit pas. On double
     donc chaque zone d'une pastille numérotée posée sur son centre, que les
     trois moteurs affichent de la même façon. */
  const marqueurs = {
    type: 'FeatureCollection',
    features: window.NK_DATA.hotspots.features.map((f, i) => ({
      type: 'Feature', id: i,
      geometry: { type: 'Point', coordinates: f.properties.centre },
      /* Propriétés réduites au strict nécessaire à l'affichage. Recopier tout
         le hotspot ici gonfle les tuiles pour rien : le clic et le survol
         retrouvent la fiche complète avec hotspotParId(). */
      properties: {
        id: f.properties.id,
        nom: f.properties.nom,          // le libellé de zone se pose sur ce point
        num: f.properties.anonyme ? '?' : String(i + 1),
        marker_color: zoneColor(f.properties),
      },
    })),
  };

  /* Retrouve le hotspot complet à partir de l'identifiant porté par un marqueur. */
  function hotspotParId(id) {
    const f = window.NK_DATA.hotspots.features.find(x => x.properties.id === id);
    return f && f.properties;
  }

  /* ---------------------------------------------------------------- FLOU
     Un cas individuel n'est jamais publié à sa position. On le range dans une
     maille, et la maille n'apparaît que si elle contient au moins K cas.

     Deux niveaux :
       fin      ~25 km, affiché dès K cas
       large    ~75 km, récupère les mailles fines trop peu peuplées
     Ce qui ne tient dans aucune des deux est compté à part, sans être placé.

     Le centre affiché est celui de la maille, jamais le barycentre des cas :
     un barycentre se déplace quand un cas s'ajoute, et cette dérive suffit à
     retrouver une position. */
  const MAILLE = {
    fin:   { lon: 0.36, lat: 0.24, km: 25, label: 'maille de 25 km' },
    large: { lon: 1.08, lat: 0.72, km: 75, label: 'maille de 75 km' },
  };
  const K_ANONYMAT = 3;

  function clefMaille(coord, m) {
    return Math.floor(coord[0] / m.lon) + ':' + Math.floor(coord[1] / m.lat);
  }
  function centreMaille(cle, m) {
    const [i, j] = cle.split(':').map(Number);
    return [(i + 0.5) * m.lon, (j + 0.5) * m.lat];
  }

  function grouper(features, m) {
    const cells = new Map();
    features.forEach(f => {
      const c = clefMaille(f.geometry.coordinates, m);
      if (!cells.has(c)) cells.set(c, []);
      cells.get(c).push(f);
    });
    return cells;
  }

  function faireCellule(cle, m, liste, niveau) {
    const parPatho = {};
    liste.forEach(f => {
      const p = f.properties.patho_id;
      parPatho[p] = (parPatho[p] || 0) + 1;
    });
    const dominant = Object.keys(parPatho).sort((a, b) => parPatho[b] - parPatho[a])[0];
    const patho = window.NK_DATA.meta.pathologies.find(p => p.id === dominant);
    return {
      id: niveau + '-' + cle, niveau, rayon_km: m.km / 2, maille: m.label,
      centre: centreMaille(cle, m), n: liste.length,
      color: patho.color, dominant: patho.label, repartition: parPatho,
      temoins: liste.map(f => f.properties),
      deps: [...new Set(liste.map(f => f.properties.dep))],
    };
  }

  /* Renvoie { cellules, horsMaille } à partir des témoignages déjà filtrés. */
  function flouter(features) {
    const cellules = [];
    const restes = [];
    grouper(features, MAILLE.fin).forEach((liste, cle) => {
      if (liste.length >= K_ANONYMAT) cellules.push(faireCellule(cle, MAILLE.fin, liste, 'fin'));
      else restes.push(...liste);
    });
    let horsMaille = 0;
    grouper(restes, MAILLE.large).forEach((liste, cle) => {
      if (liste.length >= K_ANONYMAT) cellules.push(faireCellule(cle, MAILLE.large, liste, 'large'));
      else horsMaille += liste.length;
    });
    return { cellules, horsMaille };
  }

  /* MapLibre n'accepte que des valeurs simples en propriétés de feature :
     la cellule complète voyage sérialisée dans `data`. */
  function cellulesGeoJSON(cellules) {
    return {
      type: 'FeatureCollection',
      features: cellules.map(c => ({
        type: 'Feature', id: c.id,
        geometry: { type: 'Point', coordinates: c.centre },
        properties: { id: c.id, n: c.n, color: c.color, niveau: c.niveau,
                      rayon_km: c.rayon_km, data: JSON.stringify(c) },
      })),
    };
  }

  function celluleHTML(c) {
    const det = Object.entries(c.repartition)
      .map(([id, n]) => {
        const p = window.NK_DATA.meta.pathologies.find(x => x.id === id);
        return `<div class="m" style="color:${p.color}">${n} × ${p.label}</div>`;
      }).join('');
    return `<div class="pop">
      <h4>${c.n} témoignages</h4>
      <div class="m">${c.maille} · ${c.deps.slice(0, 2).join(', ')}${c.deps.length > 2 ? '…' : ''}</div>
      <div style="margin:7px 0 0">${det}</div>
      <div class="cta">Position volontairement approximative · cliquer pour lire</div>
    </div>`;
  }

  /* Rayon en pixels correspondant à un rayon en kilomètres, pour les moteurs
     dont le rayon de cercle s'exprime en pixels (MapLibre). */
  function pxParKm(zoom, lat) {
    return 1000 / (156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom));
  }
  /* Interpolation zoom → rayon en pixels pour un rayon donné en kilomètres.
     Les valeurs sont calculées en JS plutôt que par une expression MapLibre :
     l'arithmétique sur ['get', …] n'y est pas typée et fait échouer la couche
     silencieusement. `minPx` est un plancher de lisibilité — il agrandit la
     tache, ne la rétrécit jamais, donc il ne réduit pas le flou. */
  function rayonExpression(km, minPx, facteur) {
    const stops = [];
    for (let z = 4; z <= 13; z += 1) {
      const px = km * (facteur || 1) * pxParKm(z, 46.6);
      stops.push(z, Math.max(minPx || 0, Math.min(220, px)));
    }
    return ['interpolate', ['linear'], ['zoom'], ...stops];
  }

  /* Rayon dépendant à la fois du zoom et du niveau de maille de la feature.
     MapLibre n'accepte qu'UNE seule interpolation par zoom dans une
     expression : le `case` doit donc être à l'intérieur de l'interpolate,
     pas autour. */
  function rayonParNiveau(minPx, facteur) {
    const px = (km, z) => Math.max(minPx || 0,
      Math.min(220, km * (facteur || 1) * pxParKm(z, 46.6)));
    const stops = [];
    for (let z = 4; z <= 13; z += 1) {
      stops.push(z, ['case',
        ['==', ['get', 'niveau'], 'fin'], px(MAILLE.fin.km / 2, z),
        px(MAILLE.large.km / 2, z)]);
    }
    return ['interpolate', ['linear'], ['zoom'], ...stops];
  }

  return { C, zoneColor, zoneHTML, sigHTML, temHTML, hex2rgba, rgb, bounds, nb,
           FRANCE, marqueurs, hotspotParId, libellesEnFrancais,
           flouter, celluleHTML, cellulesGeoJSON, rayonExpression, rayonParNiveau,
           K_ANONYMAT, MAILLE };
})();
