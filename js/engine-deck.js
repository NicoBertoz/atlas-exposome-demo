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

  let map, overlay, ctx, last, current = 'light';
  const tip = () => document.getElementById('deck-tip');

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

  /* Le bleu unique des cas déclarés. La relecture a demandé « une seule
     couleur de point, aucune différenciation par pathologie » : le tri se
     fait au filtre, pas à l'œil. Une couleur de moins à décoder. */
  const BLEU = [31, 58, 204];

  function layers(state) {
    const L = [];
    // dessinés en dernier : les signalements restent devant les surfaces
    const dessus = [];

    if (state.zones) {
      /* UNE ZONE ENQUÊTÉE EST UNE SURFACE.
         Son périmètre est publié, elle couvre un territoire, et la carte doit
         le montrer : un aplat plein, cerné d'un trait continu, à l'échelle
         réelle. Le plancher en pixels n'existe que pour qu'une zone de 2 km
         reste visible à l'échelle de la France — il agrandit la surface, il
         ne la déplace pas.
         C'est l'exact opposé du cas déclaré, qui est un point sans contour.

         Plus de pastille numérotée par-dessus : la numérotation n'apportait
         rien une fois la liste des agrégats retirée du panneau. */
      const rayonZone = f => f.properties.rayon_km * 1000;

      L.push(new deck.ScatterplotLayer({
        id: 'zone-surface', data: window.NK_DATA.hotspots.features,
        getPosition: f => f.properties.centre,
        getRadius: rayonZone, radiusMinPixels: 19,
        filled: true, stroked: true,
        getFillColor: f => [...S().rgb(S().zoneColor(f.properties)), 58],
        getLineColor: f => [...S().rgb(S().zoneColor(f.properties)), 255],
        lineWidthMinPixels: 2, lineWidthMaxPixels: 3.5,
        pickable: true, autoHighlight: true, highlightColor: [245, 212, 0, 150],
        onHover: i => i.object ? showTip(S().zoneHTML(i.object.properties, true), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onZone(i.object.properties),
      }));
    }

    if (state.sig) {
      dessus.push(new deck.ScatterplotLayer({
        id: 'sig', data: window.NK_DATA.signalements,
        getPosition: f => f.geometry.coordinates,
        filled: true, getFillColor: [255, 255, 255, 235],
        stroked: true, getLineColor: [124, 119, 110, 255], lineWidthMinPixels: 1.6,
        getRadius: 2200, radiusMinPixels: 5, radiusMaxPixels: 9,
        pickable: true, autoHighlight: true, highlightColor: [20, 18, 13, 255],
        onHover: i => i.object ? showTip(S().sigHTML(i.object.properties), i.x, i.y) : hideTip(),
        onClick: i => i.object && ctx.onSignal(i.object.properties),
      }));
    }

    if (state.temoins) {
      /* UN CAS DÉCLARÉ EST UN POINT, PAS UNE SURFACE.
         Il ne couvre aucun territoire : on ne sait pas où il est, à 25 km
         près. On le dessine donc petit, avec un cœur net et un halo qui se
         dissout — le halo dit l'incertitude de position, il ne prétend pas
         délimiter quoi que ce soit. Aucun contour, jamais.

         Et surtout : PAS de carte de chaleur. Une heatmap se lit comme une
         densité de maladie, or nous n'avons pas de dénominateur — on ne
         rapporte rien à la population. Ce serait donner à lire une incidence
         qu'on n'a pas mesurée. Voir la note d'arbitrage du 12/08. */
      const HALO = [[1, 10], [0.74, 18], [0.5, 30], [0.3, 48]];
      HALO.forEach(([k, alpha], idx) =>
        L.push(new deck.ScatterplotLayer({
          id: 'cell-' + idx, data: state.cellules,
          getPosition: c => c.centre,
          getFillColor: [...BLEU, alpha],
          getRadius: c => c.rayon_km * 1000 * 0.55 * k,
          radiusMinPixels: 15 * k, radiusMaxPixels: 34 * k, pickable: false,
        })));
      // le cœur : un point franc, petit, qui reste un point à tous les zooms
      L.push(new deck.ScatterplotLayer({
        id: 'cell-coeur', data: state.cellules,
        getPosition: c => c.centre,
        getFillColor: [...BLEU, 235],
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
      L.push(new deck.TextLayer({
        id: 'cell-n', data: state.cellules,
        getPosition: c => c.centre, getText: c => String(c.n),
        getSize: 10.5, getColor: [20, 18, 13, 210], fontWeight: 700,
        getPixelOffset: [0, -14],
        outlineWidth: 3, outlineColor: [255, 255, 255, 235], fontSettings: { sdf: true },
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
          /* Caméra enfermée sur la France — voir FRANCE.maxBounds dans shared.js */
          maxBounds: S().FRANCE.maxBounds(container),
          maxZoom: S().FRANCE.maxZoom,
          /* Sans ça MapLibre répète le planisphère à l'infini vers l'est et
             l'ouest : on verrait des copies fantômes de la France au bord. */
          renderWorldCopies: false,
          /* La rotation à la souris n'apporte rien ici et fait perdre le nord,
             au sens propre : un agrégat se lit par rapport à sa région. Le
             pitch programmatique de la vue hexagones, lui, reste possible. */
          dragRotate: false, pitchWithRotate: false,
        });
        map.touchZoomRotate.disableRotation();
        // plus de boussole à afficher puisqu'on ne peut plus tourner
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
        overlay = new deck.MapboxOverlay({ interleaved: false, layers: [] });
        whenReady(() => {
          if (!auto) { S().libellesEnFrancais(map); window.NK_STYLE.poserMasque(map); }
          map.addControl(overlay);
          if (last) this.render(last);
          map.fitBounds(S().FRANCE.bounds, { padding: S().FRANCE.padding(map.getContainer()), duration: 0 });
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
    },

    /* Les déplacements de caméra de MapLibre sont animés par
       requestAnimationFrame. Dans un onglet non peint — arrière-plan, aperçu,
       capture automatisée — la boucle ne tourne pas : l'animation ne démarre
       jamais et la carte reste où elle était, sans la moindre erreur. On
       coupe donc l'animation quand la page est masquée, plutôt que de la
       laisser silencieusement ne rien faire. */
    flyTo(lng, lat, zoom) {
      if (!map) return;
      if (document.hidden) return map.jumpTo({ center: [lng, lat], zoom });
      map.flyTo({ center: [lng, lat], zoom, speed: 0.85, curve: 1.4 });
    },

    fitZone(p) {
      if (!map) return;
      map.fitBounds(S().bounds(p), {
        padding: S().FRANCE.zonePadding(map.getContainer()),
        duration: document.hidden ? 0 : 1200,
      });
    },

    fitFrance() {
      if (!map) return;
      map.fitBounds(S().FRANCE.bounds, {
        padding: S().FRANCE.padding(map.getContainer()),
        duration: document.hidden ? 0 : 1400,
      });
    },

    /* Le panneau se pose PAR-DESSUS la carte : sans marge de caméra, la France
       se retrouve à moitié cachée. On la recentre par une animation de padding
       plutôt qu'en redimensionnant le conteneur, qui produirait un à-coup. */
    setPadding(marges, duree) {
      if (!map) return;
      map.easeTo({ padding: Object.assign({ top: 0, right: 0, bottom: 0, left: 0 }, marges),
                   duration: document.hidden ? 0 : (duree === undefined ? 650 : duree) });
    },

    /* Le cadre de la caméra dépend du rapport du viewport : une rotation de
       téléphone le change complètement. On le refait avant le resize, sinon
       MapLibre contraint la nouvelle taille avec l'ancienne emprise et rogne
       la France le temps d'un cadrage. */
    resize() {
      if (!map) return;
      map.setMaxBounds(S().FRANCE.maxBounds(map.getContainer()));
      map.resize();
    },

    get map() { return map; },   // exposé pour le débogage en console
  };
})();
