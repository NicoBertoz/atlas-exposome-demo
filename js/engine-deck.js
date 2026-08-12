/* ------------------------------------------------------------------ *
 *  Moteur 3 — deck.gl (MIT, OpenJS) en surcouche de MapLibre
 *  Rendu GPU par lots : dizaines de milliers de points, agrégation
 *  hexagonale, extrusion 2,5D. L'option "gros volume + effet".
 * ------------------------------------------------------------------ */
window.NK_ENGINES = window.NK_ENGINES || {};

window.NK_ENGINES.deck = (function () {
  'use strict';

  const S = () => window.NK_SHARED;
  /* Repli si le fichier de tuiles n'a pas été déployé (cf. style-nk.js) */
  const CARTO = {
    dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  };
  let auto = false;   // vrai si on sert nos propres tuiles
  const styleDe = key => (auto ? window.NK_STYLE.style(key) : CARTO[key]);

  let map, overlay, ctx, last, current = 'light', marqOn = true;
  const tip = () => document.getElementById('deck-tip');
  const zoom = () => (map ? map.getZoom() : 0);

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


  function showTip(html, x, y) {
    const t = tip(), stage = document.getElementById('map-stage');
    t.innerHTML = html; t.style.display = 'block';
    const w = t.offsetWidth, sw = stage.clientWidth, sh = stage.clientHeight;
    t.style.left = Math.max(6, Math.min(x + 14, sw - w - 8)) + 'px';
    t.style.top = Math.max(6, Math.min(y + 14, sh - t.offsetHeight - 8)) + 'px';
  }
  const hideTip = () => { tip().style.display = 'none'; };

  /* Les clusters sont posés en marqueurs DOM plutôt qu'en couche GL : on veut
     un CARRÉ à bord d'encre, numéroté — une forme qui dit « périmètre publié,
     dossier instruit ». deck.gl ne dessine que des ronds, et c'est justement
     la forme réservée aux cas déclarés. */
  let badges = [];
  function creerBadges() {
    badges.forEach(m => m.remove());
    badges = S().marqueurs.features.map(f => {
      const el = document.createElement('button');
      el.className = 'nk-hotspot';
      el.innerHTML = `<span style="background:${f.properties.marker_color}">${f.properties.num}</span>`;
      el.title = f.properties.nom;
      const h = S().hotspotParId(f.properties.id);
      el.addEventListener('click', ev => { ev.stopPropagation(); ctx.onZone(h); });
      el.addEventListener('mouseenter', ev => {
        const r = document.getElementById('map-stage').getBoundingClientRect();
        showTip(S().zoneHTML(h, true), ev.clientX - r.left, ev.clientY - r.top);
      });
      el.addEventListener('mouseleave', hideTip);
      return new maplibregl.Marker({ element: el })
        .setLngLat(f.geometry.coordinates).addTo(map);
    });
    map.on('zoomend', () => syncBadges(last && last.zones));
  }

  function syncBadges(on) {
    const visible = on !== false && zoom() < 9;
    badges.forEach(m => { m.getElement().style.display = visible ? '' : 'none'; });
  }

  function layers(state) {
    const L = [];
    // dessinées en dernier : les pastilles de cluster et les signalements
    // doivent rester devant les taches floues, plus larges
    const dessus = [];

    if (state.zones) {
      L.push(new deck.GeoJsonLayer({
        id: 'zones', data: window.NK_DATA.hotspots,
        filled: true, stroked: true, pickable: true, autoHighlight: true,
        highlightColor: [245, 212, 0, 120],
        /* Contour net et continu : un cluster a un périmètre publié, et la
           carte doit le dire. C'est l'inverse exact des taches déclaratives. */
        getFillColor: f => [...S().rgb(S().zoneColor(f.properties)),
                            f.properties.anonyme ? 14 : 34],
        getLineColor: f => [...S().rgb(S().zoneColor(f.properties)), 255],
        lineWidthMinPixels: 2, lineWidthMaxPixels: 3,
        onHover: i => i.object ? showTip(S().zoneHTML(i.object.properties, true), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onZone(i.object.properties),
      }));
    }

    if ((state.pointsExacts || []).length) {
      // comparateur d'atelier : positions exactes par-dessus les secteurs
      dessus.push(new deck.ScatterplotLayer({
        id: 'exact', data: state.pointsExacts,
        getPosition: f => f.geometry.coordinates,
        getFillColor: f => S().rgb(f.properties.color),
        getRadius: 1200, radiusMinPixels: 2.4, radiusMaxPixels: 6,
        stroked: true, lineWidthMinPixels: 1, getLineColor: [20, 18, 13, 255],
        pickable: false,
      }));
    }

    if (state.sig) {
      dessus.push(new deck.ScatterplotLayer({
        id: 'sig', data: window.NK_DATA.signalements,
        getPosition: f => f.geometry.coordinates,
        filled: true, getFillColor: [244, 241, 232, 235],
        stroked: true, getLineColor: [87, 83, 74, 255], lineWidthMinPixels: 1.8,
        getRadius: 2200, radiusMinPixels: 5, radiusMaxPixels: 9,
        pickable: true, autoHighlight: true, highlightColor: [20, 18, 13, 255],
        onHover: i => i.object ? showTip(S().sigHTML(i.object.properties), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onSignal(i.object.properties),
      }));
    }

    if (state.agg) {
      // Ce que les deux autres moteurs ne font pas nativement : agrégation
      // spatiale calculée sur GPU, hauteur proportionnelle à la densité.
      L.push(new deck.HexagonLayer({
        id: 'hex', data: state.cellules,
        getPosition: c => c.centre,
        getElevationWeight: c => c.n, getColorWeight: c => c.n,
        // elevationRange vaut [0, 1000] par défaut : la hauteur maximale est
        // donc 1000 × elevationScale mètres, pas le nombre de cas × l'échelle.
        radius: 16000, elevationScale: 14, extruded: true, opacity: 0.75,
        coverage: 0.86, pickable: true,
        colorRange: [[59, 232, 255], [110, 220, 240], [255, 210, 59], [255, 150, 60], [255, 90, 80], [255, 59, 92]],
        onHover: i => i.object ? showTip(
          `<div class="pop"><h4>${i.object.points.reduce((a, c) => a + c.n, 0)} témoignages</h4>
           <div class="m">maille hexagonale de 16 km</div>
           <div class="cta">Agrégation calculée à la volée sur GPU</div></div>`, i.x, i.y) : hideTip(),
      }));
    } else if (state.temoins) {
      /* Grammaire visuelle des cas déclarés : une TACHE, ronde, dégradée,
         SANS CONTOUR. Rien qui ressemble à un périmètre : le flou est le
         message. Six passes concentriques donnent le dégradé que deck.gl ne
         sait pas produire, et l'absence de bord net dit qu'aucune limite
         n'est revendiquée — à l'exact opposé du carré des clusters. */
      [[1, 14], [0.82, 20], [0.64, 28], [0.48, 36], [0.34, 46], [0.2, 60]]
        .forEach(([k, alpha], idx) =>
          L.push(new deck.ScatterplotLayer({
            id: 'cell-' + idx, data: state.cellules,
            getPosition: c => c.centre,
            getFillColor: c => [...S().rgb(c.color), alpha],
            getRadius: c => c.rayon_km * 1000 * k,
            radiusMinPixels: 17 * k, pickable: false,
          })));
      // cible de clic invisible, un peu plus large que le cœur de la tache
      L.push(new deck.ScatterplotLayer({
        id: 'cells', data: state.cellules,
        getPosition: c => c.centre,
        getFillColor: [0, 0, 0, 0], stroked: false,
        getRadius: c => c.rayon_km * 1000 * 0.7, radiusMinPixels: 12,
        pickable: true, autoHighlight: true, highlightColor: [20, 18, 13, 40],
        onHover: i => i.object ? showTip(S().celluleHTML(i.object), i.x, i.y) : hideTip(),
        onClick: i => {
          if (!i.object) return;
          ctx.onCell(i.object);
          map.flyTo({ center: i.object.centre, zoom: Math.max(map.getZoom(), 8), speed: 0.9 });
        },
      }));
      L.push(new deck.TextLayer({
        id: 'cell-n', data: state.cellules,
        getPosition: c => c.centre, getText: c => String(c.n),
        getSize: 11, getColor: [20, 18, 13, 190], fontWeight: 700, pickable: false,
      }));
    }
    return L.concat(dessus);
  }

  return {
    id: 'deck',
    label: 'deck.gl + MapLibre',
    note: 'Surcouche GPU par-dessus le même fond vectoriel. Agrégation hexagonale, extrusion 2,5D, arcs, animations temporelles. Prévu pour des volumes que les deux autres ne tiennent pas.',
    caps: [['style sur-mesure', true], ['zoom continu', true], ['libellés en français', true],
           ['~10k points', true], ['agrégation GPU', true], ['auto-hébergeable', true]],

    init(container, c) {
      ctx = c;
      return new Promise(async resolve => {
        auto = window.NK_STYLE.enregistrerProtocole() && await window.NK_STYLE.disponible();
        map = new maplibregl.Map({
          container, style: styleDe('light'),
          center: S().FRANCE.center, zoom: S().FRANCE.zoom, pitch: 0,
          attributionControl: { compact: true },
        });
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
        overlay = new deck.MapboxOverlay({ interleaved: false, layers: [] });
        // les pastilles n'existent qu'en dessous du zoom 9 : on ne recalcule
        // les couches qu'au franchissement du seuil, pas à chaque frame
        map.on('zoomend', () => {
          const on = zoom() < 9;
          if (on !== marqOn) { marqOn = on; if (last) overlay.setProps({ layers: layers(last) }); }
        });
        whenReady(() => {
          if (!auto) S().libellesEnFrancais(map);
          map.addControl(overlay);
          creerBadges();
          if (last) this.render(last);
          map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(), duration: 0 });
          c.onReady('deck'); resolve();
        });
      });
    },

    setBasemap(key) {
      if (!map || key === current) return;
      current = key;
      map.setStyle(styleDe(key));   // la surcouche deck.gl survit au changement de fond
      if (!auto) whenReady(() => S().libellesEnFrancais(map));
    },

    render(state) {
      last = state;
      if (!overlay) return;
      hideTip();
      overlay.setProps({ layers: layers(state) });
      syncBadges(state.zones);
      if (map) map.easeTo({ pitch: state.agg ? 46 : 0, duration: 700 });
    },

    flyTo(lng, lat, zoom) { map && map.flyTo({ center: [lng, lat], zoom, speed: 0.85, curve: 1.4 }); },

    fitZone(p) { map && map.fitBounds(S().bounds(p), { padding: S().FRANCE.zonePadding(), duration: 1200 }); },

    fitFrance() { map && map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(), duration: 1400 }); },

    resize() { map && map.resize(); },

    get map() { return map; },   // exposé pour le débogage en console
  };
})();
