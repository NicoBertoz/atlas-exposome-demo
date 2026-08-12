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

  let map, overlay, ctx, last, current = 'dark', marqOn = true;
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

  function layers(state) {
    const L = [];
    // dessinées en dernier : les pastilles de cluster et les signalements
    // doivent rester devant les taches floues, plus larges
    const dessus = [];

    if (state.zones) {
      L.push(new deck.GeoJsonLayer({
        id: 'zones', data: window.NK_DATA.hotspots,
        filled: true, stroked: true, pickable: true, autoHighlight: true,
        highlightColor: [232, 255, 59, 55],
        getFillColor: f => [...S().rgb(S().zoneColor(f.properties)),
                            f.properties.anonyme ? 18 : 44],
        getLineColor: f => [...S().rgb(S().zoneColor(f.properties)), 210],
        lineWidthMinPixels: 1.4,
        onHover: i => i.object ? showTip(S().zoneHTML(i.object.properties, true), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onZone(i.object.properties),
      }));
    }

    // Pastilles numérotées, seulement tant qu'on est loin (cf. les 2 autres moteurs)
    if (state.zones && zoom() < 9) {
      dessus.push(new deck.ScatterplotLayer({
        id: 'marq', data: S().marqueurs.features,
        getPosition: f => f.geometry.coordinates,
        getFillColor: f => S().rgb(f.properties.marker_color),
        getRadius: 24, radiusUnits: 'pixels',
        stroked: true, lineWidthMinPixels: 2, getLineColor: [11, 13, 16, 230],
        pickable: true, autoHighlight: true, highlightColor: [232, 255, 59, 255],
        onHover: i => i.object ? showTip(S().zoneHTML(i.object.properties, true), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onZone(i.object.properties),
      }));
      dessus.push(new deck.TextLayer({
        id: 'marq-num', data: S().marqueurs.features,
        getPosition: f => f.geometry.coordinates,
        getText: f => f.properties.num,
        getSize: 13, getColor: [11, 13, 16], fontWeight: 700, pickable: false,
      }));
    }

    if ((state.pointsExacts || []).length) {
      // comparateur d'atelier : positions exactes par-dessus les secteurs
      dessus.push(new deck.ScatterplotLayer({
        id: 'exact', data: state.pointsExacts,
        getPosition: f => f.geometry.coordinates,
        getFillColor: f => S().rgb(f.properties.color),
        getRadius: 1200, radiusMinPixels: 2.4, radiusMaxPixels: 6,
        stroked: true, lineWidthMinPixels: 1, getLineColor: [11, 13, 16, 255],
        pickable: false,
      }));
    }

    if (state.sig) {
      dessus.push(new deck.ScatterplotLayer({
        id: 'sig', data: window.NK_DATA.signalements,
        getPosition: f => f.geometry.coordinates,
        filled: false, stroked: true, getLineColor: [154, 163, 175, 230],
        lineWidthMinPixels: 1.5,
        getRadius: 2200, radiusMinPixels: 4, radiusMaxPixels: 9,
        pickable: true, autoHighlight: true, highlightColor: [232, 255, 59, 255],
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
      // Rayon en mètres : la tache vaut exactement la demi-maille. Trois
      // passes concentriques pour un dégradé, deck n'ayant pas de flou.
      [[1, 26], [0.72, 34], [0.44, 52]].forEach(([k, alpha], idx) =>
        L.push(new deck.ScatterplotLayer({
          id: 'cell-' + idx, data: state.cellules,
          getPosition: c => c.centre,
          getFillColor: c => [...S().rgb(c.color), alpha],
          getRadius: c => c.rayon_km * 1000 * k,
          radiusMinPixels: 15 * k, pickable: false,
        })));
      L.push(new deck.ScatterplotLayer({
        id: 'cells', data: state.cellules,
        getPosition: c => c.centre,
        filled: false, stroked: true, lineWidthMinPixels: 1,
        getLineColor: c => [...S().rgb(c.color), 100],
        getRadius: c => c.rayon_km * 1000 * 0.72, radiusMinPixels: 11,
        pickable: true, autoHighlight: true, highlightColor: [232, 255, 59, 60],
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
        getSize: 13, getColor: [232, 234, 237], fontWeight: 700, pickable: false,
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
          container, style: styleDe('dark'),
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
      if (map) map.easeTo({ pitch: state.agg ? 46 : 0, duration: 700 });
    },

    flyTo(lng, lat, zoom) { map && map.flyTo({ center: [lng, lat], zoom, speed: 0.85, curve: 1.4 }); },

    fitZone(p) { map && map.fitBounds(S().bounds(p), { padding: S().FRANCE.zonePadding(), duration: 1200 }); },

    fitFrance() { map && map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(), duration: 1400 }); },

    resize() { map && map.resize(); },

    get map() { return map; },   // exposé pour le débogage en console
  };
})();
