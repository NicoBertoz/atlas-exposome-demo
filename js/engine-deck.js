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

  function layers(state) {
    const L = [];
    // dessinées en dernier : les pastilles de cluster et les signalements
    // doivent rester devant les taches floues, plus larges
    const dessus = [];

    if (state.zones) {
      /* UN AGRÉGAT EST UNE SURFACE.
         Son périmètre est publié, il couvre un territoire, et la carte doit le
         montrer comme tel : un aplat plein, cerné d'un trait continu, à
         l'échelle réelle. Le plancher en pixels n'existe que pour qu'un
         cluster de 2 km reste visible à l'échelle de la France — il agrandit
         la surface, il ne la déplace pas.
         C'est l'exact opposé du cas déclaré, qui est un point sans contour. */
      const rayonZone = f => f.properties.rayon_km * 1000;

      L.push(new deck.ScatterplotLayer({
        id: 'zone-surface', data: window.NK_DATA.hotspots.features,
        getPosition: f => f.properties.centre,
        getRadius: rayonZone, radiusMinPixels: 19,
        filled: true, stroked: true,
        getFillColor: f => [...S().rgb(S().zoneColor(f.properties)),
                            f.properties.anonyme ? 30 : 62],
        getLineColor: f => [...S().rgb(S().zoneColor(f.properties)), 255],
        lineWidthMinPixels: 2.5, lineWidthMaxPixels: 4,
        pickable: true, autoHighlight: true, highlightColor: [245, 212, 0, 150],
        onHover: i => i.object ? showTip(S().zoneHTML(i.object.properties, true), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onZone(i.object.properties),
      }));

      // Second cerne, plus fin et détaché : ça dit « périmètre », pas « point »
      L.push(new deck.ScatterplotLayer({
        id: 'zone-cerne', data: window.NK_DATA.hotspots.features,
        getPosition: f => f.properties.centre,
        getRadius: f => rayonZone(f) * 1.22, radiusMinPixels: 24,
        filled: false, stroked: true, lineWidthMinPixels: 1,
        getLineColor: f => [...S().rgb(S().zoneColor(f.properties)), 110],
        pickable: false,
      }));

      L.push(new deck.TextLayer({
        id: 'zone-num', data: S().marqueurs.features,
        getPosition: f => f.geometry.coordinates,
        getText: f => f.properties.num,
        getSize: 12, getColor: [20, 18, 13], fontWeight: 700,
        outlineWidth: 3, outlineColor: [244, 241, 232, 230], fontSettings: { sdf: true },
        pickable: false,
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
      /* UN CAS DÉCLARÉ EST UN POINT, PAS UNE SURFACE.
         Il ne couvre aucun territoire : on ne sait pas où il est, à 25 km
         près. On le dessine donc petit, avec un cœur net et un halo qui se
         dissout — le halo dit l'incertitude de position, il ne prétend pas
         délimiter quoi que ce soit. Aucun contour, jamais. */
      const HALO = [[1, 10], [0.74, 18], [0.5, 30], [0.3, 48]];
      HALO.forEach(([k, alpha], idx) =>
        L.push(new deck.ScatterplotLayer({
          id: 'cell-' + idx, data: state.cellules,
          getPosition: c => c.centre,
          getFillColor: c => [...S().rgb(c.color), alpha],
          getRadius: c => c.rayon_km * 1000 * 0.55 * k,
          radiusMinPixels: 15 * k, radiusMaxPixels: 34 * k, pickable: false,
        })));
      // le cœur : un point franc, petit, qui reste un point à tous les zooms
      L.push(new deck.ScatterplotLayer({
        id: 'cell-coeur', data: state.cellules,
        getPosition: c => c.centre,
        getFillColor: c => [...S().rgb(c.color), 235],
        getRadius: c => c.rayon_km * 1000 * 0.07,
        radiusMinPixels: 3.5, radiusMaxPixels: 6, pickable: false,
      }));
      // cible de clic invisible, un peu plus large que le cœur de la tache
      L.push(new deck.ScatterplotLayer({
        id: 'cells', data: state.cellules,
        getPosition: c => c.centre,
        getFillColor: [0, 0, 0, 0], stroked: false,
        getRadius: c => c.rayon_km * 1000 * 0.45, radiusMinPixels: 13,
        pickable: true, autoHighlight: true, highlightColor: [20, 18, 13, 40],
        onHover: i => i.object ? showTip(S().celluleHTML(i.object), i.x, i.y) : hideTip(),
        onClick: i => {
          if (!i.object) return;
          ctx.onCell(i.object);
          map.flyTo({ center: i.object.centre, zoom: Math.max(map.getZoom(), 8), speed: 0.9 });
        },
      }));
      /* Le compte se lit à côté du point, pas dedans : dedans, il ferait du
         point une pastille, donc un objet du même genre qu'un agrégat. */
      L.push(new deck.TextLayer({
        id: 'cell-n', data: state.cellules,
        getPosition: c => c.centre, getText: c => String(c.n),
        getSize: 10.5, getColor: [20, 18, 13, 210], fontWeight: 700,
        getPixelOffset: [0, -14],
        outlineWidth: 3, outlineColor: [244, 241, 232, 220], fontSettings: { sdf: true },
        pickable: false,
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

    /* Le panneau se pose PAR-DESSUS la carte : sans marge de caméra, la France
       se retrouve à moitié cachée. On la recentre par une animation de padding
       plutôt qu'en redimensionnant le conteneur, qui produirait un à-coup. */
    setPadding(marges, duree) {
      if (!map) return;
      map.easeTo({ padding: Object.assign({ top: 0, right: 0, bottom: 0, left: 0 }, marges),
                   duration: duree === undefined ? 650 : duree });
    },

    resize() { map && map.resize(); },

    get map() { return map; },   // exposé pour le débogage en console
  };
})();
