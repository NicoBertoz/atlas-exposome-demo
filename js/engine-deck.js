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

  /* Deux couleurs sur la carte, pas une de plus (retours V2) :
       violet      une zone enquêtée
       vert d'eau  un cas raconté par une famille
     Elles doivent rester lisibles l'une à côté de l'autre à toutes les
     échelles, d'où deux teintes franchement éloignées. */
  const VIOLET = [109, 47, 196];
  const EAU = [46, 155, 143];

  /* --------------------------------------------------------- LES NUÉES
     Retours V2 : « à la place de cercles concentriques dégradés, mettre des
     nuées de points d'une seule et même couleur solide ».

     Un point par cas, donc — mais AUCUN de ces points n'est à la position
     d'une famille. Le secteur de publication reste la seule information
     réelle : à l'intérieur, les points sont dispersés par une fonction
     déterministe, semée par l'identifiant du secteur. Deux conséquences
     qu'il faut avoir en tête :

       - la nuée ne se déplace pas d'un affichage à l'autre, ce qui évite de
         laisser croire à un mouvement des cas ;
       - elle ne dit rien de plus que le nombre, déjà affiché en chiffres.
         C'est une façon de le montrer, pas une position retrouvée.

     Sans cette précaution, une nuée aléatoire à chaque rendu suggérerait une
     précision que la donnée n'a pas. */
  function hacher(cle, graine) {
    let h = graine >>> 0;
    for (let k = 0; k < cle.length; k++) {
      h ^= cle.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    /* Finalisation façon murmur3 : sans elle, deux clés voisines — « c:0 »
       et « c:1 » — donnent des hachés voisins, et la nuée se range en
       petits paquets au lieu de couvrir le disque. */
    h ^= h >>> 16; h = Math.imul(h, 2246822507);
    h ^= h >>> 13; h = Math.imul(h, 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  /* Deux graines distinctes : les deux coordonnées doivent être
     indépendantes, sinon les points s'alignent sur une diagonale. */
  function semer(id, i) {
    const cle = id + ':' + i;
    return [hacher(cle, 2166136261), hacher(cle, 40503)];
  }

  /* Disque de rayon r, tirage uniforme en surface (d'où la racine). */
  function nuee(cellules) {
    const pts = [];
    cellules.forEach(c => {
      const rayon = c.rayon_km * 1000 * 0.72;
      const lat = c.centre[1];
      const parDegre = 111320;
      for (let i = 0; i < c.n; i++) {
        const [u, v] = semer(c.id, i);
        const d = rayon * Math.sqrt(u);
        const a = v * Math.PI * 2;
        const dy = (d * Math.sin(a)) / parDegre;
        const dx = (d * Math.cos(a)) / (parDegre * Math.cos(lat * Math.PI / 180));
        pts.push({ cell: c, position: [c.centre[0] + dx, lat + dy] });
      }
    });
    return pts;
  }

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
        /* « une seule zone colorée comme un bloc avec 50 % d'opacité »,
           sans dégradé. */
        getFillColor: [...VIOLET, 128],
        getLineColor: [...VIOLET, 255],
        lineWidthMinPixels: 2, lineWidthMaxPixels: 3.5,
        pickable: true, autoHighlight: true, highlightColor: [20, 18, 13, 90],
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
      /* UN CAS DÉCLARÉ EST UN POINT, ET RIEN QU'UN POINT.
         Plus de halo dégradé : la relecture le lisait comme une tache de
         densité, et une tache suggère une mesure qu'on n'a pas faite. Une
         nuée de points pleins, tous de la même taille et de la même couleur,
         dit exactement ce qu'on sait — combien, et dans quel secteur.

         Et surtout : PAS de carte de chaleur. Une heatmap se lit comme une
         densité de maladie, or nous n'avons pas de dénominateur — on ne
         rapporte rien à la population. Voir la note d'arbitrage du 12/08. */
      const points = nuee(state.cellules);

      L.push(new deck.ScatterplotLayer({
        id: 'nuee', data: points,
        getPosition: d => d.position,
        getFillColor: [...EAU, 225],
        getRadius: 1600, radiusMinPixels: 2.6, radiusMaxPixels: 5.5,
        stroked: false, pickable: false,
      }));

      /* La cible de clic reste le SECTEUR, jamais un point de la nuée :
         cliquer un point isolé laisserait croire qu'il désigne quelqu'un. */
      L.push(new deck.ScatterplotLayer({
        id: 'cells', data: state.cellules,
        getPosition: c => c.centre,
        getFillColor: [0, 0, 0, 0], stroked: false,
        getRadius: c => c.rayon_km * 1000 * 0.8, radiusMinPixels: 16,
        pickable: true, autoHighlight: true, highlightColor: [46, 155, 143, 40],
        onHover: i => i.object ? showTip(S().celluleHTML(i.object), i.x, i.y) : hideTip(),
        onClick: i => {
          if (!i.object) return;
          ctx.onCell(i.object);
          map.flyTo({ center: i.object.centre, zoom: Math.max(map.getZoom(), 8), speed: 0.9 });
        },
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
