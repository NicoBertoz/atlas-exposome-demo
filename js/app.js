/* ------------------------------------------------------------------ *
 *  app.js — état partagé, interface, orchestration du moteur de carte.
 *
 *  Refonte du 18/08/2026, après relecture Philippine / Fau / Lila / Nico.
 *
 *  Ce qui a disparu, et pourquoi :
 *    - le curseur d'année            « pas essentiel » (Lila), « épurer » (Nico)
 *    - l'agrégation en hexagones     démonstration technique, pas éditoriale
 *    - le comparateur de positions exactes  outil d'atelier, pas de site public
 *    - la liste des agrégats documentés     encombrait le panneau (Lila)
 *    - le bloc « Deux couches, deux natures »  jargon (Fau), à supprimer (Nico)
 *    - la barre de lecture flottante  personne ne la voyait (Fau) ; l'audio est
 *                                     remonté DANS la fiche du cas (Nico)
 *    - le bouton « fond sombre »      pas de mode sombre (Philippine)
 *    - la double légende en bas à droite (Nico)
 *
 *  Ce qui est arrivé :
 *    - un filtre maladie en liste déroulante, modèle dansmoneau.fr
 *    - une visite guidée lieu après lieu, modèle Forensic Architecture
 *    - un équivalent tableau de la carte, atteignable au clavier, + export CSV
 *    - une croix pour fermer le panneau
 *    - des fiches rédigées plutôt que des grilles de rubriques (Lila)
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  const D = window.NK_DATA;
  const S = window.NK_SHARED;
  const PATHOS = D.meta.pathologies;
  const BY_ID = Object.fromEntries(PATHOS.map(p => [p.id, p]));
  const $ = s => document.querySelector(s);
  const HOTSPOTS = D.hotspots.features;
  const isMobile = () => window.matchMedia('(max-width: 859px)').matches;

  /* Un cas déclaré n'a plus de couleur propre : un seul bleu, pour tous.
     La pathologie se lit au filtre et dans la fiche, plus à la couleur du
     point — c'était une clé de lecture de plus pour rien. */
  const BLEU_CAS = '#1F3ACC';

  /* ----------------------------------------------------------- ÉTAT */
  const state = {
    engine: 'deck',
    mode: 'intro',
    pathos: new Set(PATHOS.map(p => p.id)),
    zones: true, sig: true, temoins: true,
    basemap: 'light',
    features: D.temoignages.features,
    cellules: [], horsMaille: 0, parCellule: {},
    hotspots: D.hotspots.features,
    signalements: D.signalements.features,
  };

  function applyFilters() {
    state.features = D.temoignages.features.filter(f => state.pathos.has(f.properties.patho_id));
    /* Les moteurs ne reçoivent que le résultat flouté : aucune position
       individuelle ne quitte cette fonction. */
    const f = S.flouter(state.features);
    state.cellules = f.cellules;
    state.horsMaille = f.horsMaille;
    state.parCellule = Object.fromEntries(f.cellules.map(c => [c.id, c]));
  }

  /* -------------------------------------------------------- MOTEURS */
  const engines = window.NK_ENGINES;
  const ready = {};

  const ctx = {
    onCell: c => showCellule(c),
    onSignal: p => showSignalement(p),
    onZone: p => { showHotspot(p); engines[state.engine].fitZone(p); },
    onReady: id => {
      ready[id] = true;
      if (id !== state.engine) return;
      $('#loading').classList.add('off');
      /* La visite guidée attend que la carte soit prête : lancée sur une
         minuterie, elle affichait la fiche du premier lieu sans jamais
         bouger la caméra, faute de moteur pour l'exécuter. */
      demarrerTour();
    },
  };

  async function switchEngine(id) {
    if (ready[id]) return;
    state.engine = id;
    $('#loading').classList.remove('off');
    await engines[id].init(document.getElementById('map-' + id), ctx);
    engines[id].setBasemap(state.basemap);
    engines[id].render(state);
    engines[id].resize();
    $('#loading').classList.add('off');
  }

  function refresh() {
    applyFilters();
    if (ready[state.engine]) engines[state.engine].render(state);
    $('#lede-chiffres').innerHTML =
      `<b>${HOTSPOTS.length} endroits</b> où les autorités ont enquêté sur une concentration de
       cancers de l'enfant, <b>${state.signalements.length} autres signalements</b> instruits,
       et <b>${D.temoignages.features.length} cas</b> racontés par des familles.`;
    renderFiltre();
    if ($('#tableau-wrap').classList.contains('on')) renderTableau();
  }

  /* -------------------------------------------- FILTRE PAR MALADIE
     Modèle « polluants » de dansmoneau.fr : un bouton qui dit l'état
     courant, une liste multi-sélection qui s'ouvre au clic, et « toutes »
     en tête. Les pathologies peu représentées sont regroupées sous un
     intitulé « cancers plus rares » — le repli demandé par Lila. Il ne se
     déclenche qu'au-delà de six entrées : avec trois pathologies de démo,
     il n'a aucune raison de s'afficher. */
  const SEUIL_RARE = 6;

  function comptes() {
    const n = {};
    D.temoignages.features.forEach(f => {
      n[f.properties.patho_id] = (n[f.properties.patho_id] || 0) + 1;
    });
    return n;
  }

  function renderFiltre() {
    const n = comptes();
    const tri = [...PATHOS].sort((a, b) => (n[b.id] || 0) - (n[a.id] || 0));
    const courants = tri.length > SEUIL_RARE ? tri.slice(0, SEUIL_RARE) : tri;
    const rares = tri.length > SEUIL_RARE ? tri.slice(SEUIL_RARE) : [];
    const tout = state.pathos.size === PATHOS.length;

    const ligne = p => `
      <button class="dd-item ${state.pathos.has(p.id) ? 'on' : ''}" role="option"
              aria-selected="${state.pathos.has(p.id)}" data-patho="${p.id}">
        <span class="case" aria-hidden="true">${state.pathos.has(p.id) ? '✓' : ''}</span>
        <span class="lbl">${p.label}</span>
        <span class="n">${n[p.id] || 0}</span>
      </button>`;

    $('#dd-liste').innerHTML = `
      <button class="dd-item tout ${tout ? 'on' : ''}" role="option" aria-selected="${tout}" data-patho="__all">
        <span class="case" aria-hidden="true">${tout ? '✓' : ''}</span>
        <span class="lbl">Toutes les maladies</span>
        <span class="n">${D.temoignages.features.length}</span>
      </button>
      ${courants.map(ligne).join('')}
      ${rares.length ? `<div class="dd-groupe">Cancers plus rares</div>${rares.map(ligne).join('')}` : ''}`;

    $('#dd-label').innerHTML = tout
      ? 'Toutes les maladies'
      : state.pathos.size === 1
        ? PATHOS.find(p => state.pathos.has(p.id)).label
        : `${state.pathos.size} maladies <em>sur ${PATHOS.length}</em>`;
  }

  const dd = $('#dd-maladie');
  $('#dd-bouton').addEventListener('click', () => {
    const open = dd.classList.toggle('open');
    $('#dd-bouton').setAttribute('aria-expanded', open);
  });
  $('#dd-liste').addEventListener('click', ev => {
    const el = ev.target.closest('[data-patho]'); if (!el) return;
    const id = el.dataset.patho;
    if (id === '__all') {
      state.pathos = new Set(PATHOS.map(p => p.id));
    } else {
      state.pathos.has(id) ? state.pathos.delete(id) : state.pathos.add(id);
      if (!state.pathos.size) state.pathos = new Set(PATHOS.map(p => p.id));
    }
    refresh();
  });
  document.addEventListener('click', ev => {
    if (!dd.contains(ev.target)) { dd.classList.remove('open'); $('#dd-bouton').setAttribute('aria-expanded', false); }
  });

  /* ------------------------------------------------- ENCART « INFO » */
  $('#info-tete').addEventListener('click', () => {
    const open = $('#info-bloc').classList.toggle('open');
    $('#info-tete').setAttribute('aria-expanded', open);
  });

  /* ------------------------------------------------------ LÉGENDE */
  $('#legend-toggle').addEventListener('click', () => {
    const open = $('#legend').classList.toggle('open');
    $('#legend-toggle').setAttribute('aria-expanded', open);
  });
  /* Le repli ne concerne que le mobile : sur grand écran la légende est
     simplement affichée (voir app.css). Pas d'état initial en JavaScript —
     le premier rendu ne connaît pas toujours la largeur définitive. */

  /* -------------------------------------------- FEUILLE MOBILE (sheet) */
  function openSheet(open) {
    if (!isMobile()) return;
    document.body.classList.remove('panneau-ferme');
    $('#panel').classList.toggle('open', open);
    setTimeout(() => ready[state.engine] && engines[state.engine].resize(), 320);
  }
  $('#sheet-grip').addEventListener('click', () => openSheet(!$('#panel').classList.contains('open')));

  /* Croix de fermeture : on dégage la carte, et un onglet la ramène. */
  $('#panel-close').addEventListener('click', () => {
    document.body.classList.add('panneau-ferme');
    $('#panel').classList.remove('open');
    setTimeout(() => api.marge(), 60);
  });
  $('#panel-rouvrir').addEventListener('click', () => {
    document.body.classList.remove('panneau-ferme');
    setTimeout(() => api.marge(), 60);
  });

  /* ------------------------------------------------------- LES FICHES */
  /* `deplier` vaut faux pendant la visite guidée : au téléphone, déplier la
     feuille à chaque étape recouvre la carte, et on ne voit jamais le lieu
     dont on est en train de lire la fiche. Elle reste en aperçu, le pouce
     la remonte s'il veut lire. */
  function openDetail(deplier) {
    document.body.classList.remove('panneau-ferme');
    document.body.classList.add('fiche-ouverte');
    $('#detail').classList.add('on');
    $('#info-bloc').style.display = 'none';
    $('#panel-scroll').scrollTop = 0;
    if (deplier !== false) openSheet(true);
  }
  function closeDetail() {
    document.body.classList.remove('fiche-ouverte');
    $('#detail').classList.remove('on');
    $('#info-bloc').style.display = '';
    stopAudio();
  }

  const PAGES_IDS = new Set((window.NK_PAGES || []).map(p => p.id));
  const aPage = id => PAGES_IDS.has(id);

  function blocParticiper(contexte) {
    return `<div class="fiche-cta">
      <p>${contexte}</p>
      <a class="btn btn-accent" href="participer.html">Signaler un cas →</a>
    </div>`;
  }

  function temoinsDuCluster(id) {
    const out = [];
    state.cellules.forEach(c => c.temoins.forEach(t => { if (t.hotspot === id) out.push(t); }));
    return out.sort((a, b) => a.annee - b.annee);
  }

  function listeTemoins(liste) {
    if (!liste.length) return '<p class="fine">Aucun cas déclaré ici pour l\'instant.</p>';
    return `<div class="tem-list">${liste.map(t => `
      <button data-tem="${t.id}">
        <span class="pin"></span>
        <span class="nm">${t.patho_label}</span>
        <span class="yr">${t.annee}${t.audio ? ' ♪' : ''}</span>
      </button>`).join('')}</div>`;
  }

  /* Fiche d'un secteur de cas déclarés. */
  function showCellule(c) {
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">SECTEUR · ${c.deps.join(', ')}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <h3>${c.n} cas racontés ici</h3>
      <p class="fiche-texte">Ces cas sont regroupés dans un secteur d'environ ${c.rayon_km * 2} km.
        Le point dessiné est le centre du secteur, jamais l'endroit où vivent les familles.</p>
      ${listeTemoins(c.temoins)}
      ${blocParticiper('Un cas de plus dans ce secteur ?')}`;
    openDetail();
  }

  /* Fiche d'un cas. Réduite à ce que la relecture a retenu : la maladie
     précise, le récit, l'année du diagnostic, le parcours d'exposition.
     Le récit vocal est ici, et nulle part ailleurs. */
  function showTestimony(p) {
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">CAS DÉCLARÉ · ${p.dep}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <h3>${p.patho_label}</h3>
      <div class="sub">${p.sous_type} · diagnostic en ${p.annee}</div>
      <span class="badge fic">exemple, donnée fictive</span>
      ${audioBlock(p)}
      <blockquote class="quote">${p.temoignage}</blockquote>
      <div class="block">
        <h4>Parcours d'exposition</h4>
        <p>${p.exposition}${p.profession_parent ? ` · métier d'un parent à l'époque : ${p.profession_parent.toLowerCase()}` : ''}.</p>
      </div>
      ${blocParticiper('Vous vivez une situation comparable ?')}
      <p class="caution">
        Cas généré pour la démonstration. Ni commune ni adresse ne sont affichées.
      </p>`;
    openDetail();
    bindAudio(p);
  }

  /* Fiche d'un endroit enquêté. Rédigée, pas découpée en rubriques : c'est
     la demande de Lila, et ça se lit effectivement mieux. Le lien vers le
     collectif est le seul élément mis en avant. */
  function showHotspot(p, deplier) {
    const col = S.zoneColor(p);
    const enfants = p.n_temoins;
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">${p.periode}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <span class="tag" style="background:${S.hex2rgba(col, .13)};color:${col}">
        <span class="swatch" style="background:${col}"></span>${
          p.categorie === 'A' ? 'Excès de cas confirmé' : 'Excès non confirmé, ou enquête en cours'}</span>
      <h3>${p.nom}</h3>
      <div class="sub">${p.lieu}</div>

      <p class="fiche-texte">${p.cas} ${p.conclusion}</p>
      <p class="fiche-texte"><b>Ce qui est soupçonné :</b> ${p.cause}</p>
      ${p.anonyme ? `<p class="fiche-texte">Le périmètre exact n'a pas été rendu public par
        les autorités. Celui dessiné ici est indicatif.</p>` : ''}

      ${p.collectif && p.collectif !== 'Aucun identifié' ? `
        <a class="fiche-collectif" href="${aPage(p.id) ? 'hotspot.html?id=' + p.id : p.source}"
           ${aPage(p.id) ? '' : 'target="_blank" rel="noopener"'}>
          <b>${p.collectif}</b>
          <span>${aPage(p.id) ? 'Le dossier complet et les contacts' : 'Le rapport d\'origine'}</span>
        </a>` : `
        <a class="fiche-collectif" href="${p.source}" target="_blank" rel="noopener">
          <b>Lire le rapport d'origine</b>
          <span>Aucun collectif identifié sur ce secteur</span>
        </a>`}

      <div class="block"><h4>Enfants malades recensés ici par des familles</h4>
        <p>${enfants || 'aucun pour l\'instant'}</p></div>
      ${listeTemoins(temoinsDuCluster(p.id))}

      ${blocParticiper('Votre enfant a été diagnostiqué dans ce secteur ?')}

      <p class="caution">
        Une concentration de cas signale un endroit où il faut compter davantage.
        Ce n'est pas la preuve d'une cause, ni d'une responsabilité.
      </p>`;
    openDetail(deplier);
  }

  function showSignalement(p) {
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">SIGNALEMENT · ${p.periode}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <h3>${p.nom}</h3>
      <div class="sub">${p.lieu}</div>
      <p class="fiche-texte">${p.cas} ${p.conclusion}</p>
      <p class="fiche-texte"><b>Ce qui est soupçonné :</b> ${p.cause}</p>
      <a class="fiche-collectif" href="${p.source}" target="_blank" rel="noopener">
        <b>Lire le rapport d'origine</b><span>Source publique</span></a>
      ${blocParticiper('Vous connaissez un cas dans ce secteur ?')}`;
    openDetail();
  }

  $('#detail').addEventListener('click', ev => {
    if (ev.target.closest('[data-close]')) return closeDetail();
    const t = ev.target.closest('[data-tem]');
    if (t) {
      const cell = state.cellules.find(c => c.temoins.some(x => x.id === t.dataset.tem));
      if (cell) return void showTestimony(cell.temoins.find(x => x.id === t.dataset.tem));
    }
  });

  /* ------------------------------------------------------------ AUDIO */
  let audioEl = null, utter = null;

  function audioBlock(p) {
    const f = !!p.audio;
    const dur = f ? fmt(p.duree_audio) : '~1:10';
    return `<div class="audio">
      <div class="audio-head">
        <button class="play" id="a-play" aria-label="Écouter ce témoignage">▶</button>
        <div class="audio-meta">
          <div class="t1">Écouter ce témoignage</div>
          <div class="t2"><span id="a-cur">0:00</span> / ${dur}</div>
        </div>
      </div>
      <div class="wave" id="a-wave">${Array.from({ length: 44 }, (_, i) =>
        `<i style="height:${18 + 78 * Math.abs(Math.sin(i * 1.7 + p.annee))}%"></i>`).join('')}</div>
      <div class="tts-note">${f
        ? 'Voix de synthèse — emplacement de l\'enregistrement réel du parent.'
        : 'Pas d\'enregistrement fourni : lecture par la synthèse vocale du navigateur.'}</div>
    </div>`;
  }

  function bindAudio(p) {
    const b = $('#a-play'); if (!b) return;
    b.onclick = () => (playing() ? stopAudio() : playTestimony(p));
  }
  const playing = () => (audioEl && !audioEl.paused) || speechSynthesis.speaking;

  function playTestimony(p, onEnd) {
    stopAudio();
    const bars = document.querySelectorAll('#a-wave i');
    const btn = $('#a-play'); if (btn) btn.textContent = '❚❚';
    const prog = r => {
      const k = Math.round(r * bars.length);
      bars.forEach((b, i) => b.classList.toggle('played', i < k));
    };
    const done = () => { if (btn) btn.textContent = '▶'; prog(1); if (onEnd) onEnd(); };

    if (p.audio) {
      const el = new Audio(p.audio);
      audioEl = el;
      el.ontimeupdate = () => {
        if (audioEl !== el || !el.duration) return;
        prog(el.currentTime / el.duration);
        const c = $('#a-cur'); if (c) c.textContent = fmt(el.currentTime);
      };
      el.onended = () => { if (audioEl === el) done(); };
      el.play().catch(() => tts(p, prog, done));
    } else {
      tts(p, prog, done);
    }
  }

  function tts(p, prog, done) {
    audioEl = null;
    const u = new SpeechSynthesisUtterance(p.temoignage);
    u.lang = 'fr-FR'; u.rate = 1.02;
    const v = speechSynthesis.getVoices().filter(x => x.lang.startsWith('fr'));
    if (v.length) u.voice = v[p.sexe === 'Féminin' ? 0 : v.length - 1];
    const total = p.temoignage.length;
    u.onboundary = e => prog(Math.min(1, e.charIndex / total));
    u.onend = done;
    utter = u;
    speechSynthesis.speak(u);
  }

  function stopAudio() {
    if (audioEl) {
      const el = audioEl;
      audioEl = null;
      el.pause(); el.ontimeupdate = null; el.onended = null;
    }
    if (speechSynthesis.speaking) { if (utter) utter.onend = null; speechSynthesis.cancel(); }
    const b = $('#a-play'); if (b) b.textContent = '▶';
  }

  /* -------------------------------------------------- VISITE GUIDÉE
     On entre dans la carte par une série de lieux — une flèche fait passer
     au suivant, et « explorer librement » rend la main. C'est le modèle
     frames.forensic-architecture.org, demandé par Philippine et Lila.

     Elle ne se déclenche PAS toute seule : la carte qui dérive de cluster
     en cluster au repos avait été relevée comme désagréable. */
  const TOUR = HOTSPOTS
    .filter(f => aPage(f.properties.id) && !f.properties.anonyme)
    .slice(0, 6)
    .map(f => f.properties);
  let tourIdx = -1, tourActif = true;

  function tourVers(i) {
    if (!TOUR.length) return;
    tourIdx = Math.max(0, Math.min(TOUR.length - 1, i));
    const p = TOUR[tourIdx];
    $('#tour-pos').textContent = `Lieu ${tourIdx + 1} sur ${TOUR.length}`;
    $('#tour-nom').textContent = p.nom;
    $('#tour-prev').disabled = tourIdx === 0;
    $('#tour-next').disabled = tourIdx === TOUR.length - 1;
    showHotspot(p, false);
    if (ready[state.engine]) engines[state.engine].fitZone(p);
  }
  /* Démarre la visite si, et seulement si, tout est réuni : on est sur la
     carte, la visite n'a pas déjà eu lieu, et le moteur répond. Appelée aux
     deux endroits où l'une de ces conditions peut devenir vraie. */
  function demarrerTour() {
    if (state.mode !== 'carte' || !tourActif || tourIdx !== -1) return;
    if (!ready[state.engine]) return;
    tourVers(0);
  }
  function finTour() {
    tourActif = false;
    $('#tour').classList.add('off');
    closeDetail();
    if (ready[state.engine]) engines[state.engine].fitFrance();
  }
  $('#tour-prev').addEventListener('click', () => tourVers(tourIdx - 1));
  $('#tour-next').addEventListener('click', () => tourVers(tourIdx + 1));
  $('#tour-fin').addEventListener('click', finTour);

  /* --------------------------------------- ÉQUIVALENT ACCESSIBLE + CSV
     Une carte deck.gl est un canvas : ni le clavier ni un lecteur d'écran
     n'y accèdent. Tout ce qu'elle affiche est donc aussi disponible en
     tableau — et ce même tableau alimente l'export CSV demandé par Lila. */
  function lignes() {
    const l = HOTSPOTS.map(f => {
      const p = f.properties;
      return {
        type: 'Enquête publique',
        nom: p.nom, lieu: p.lieu, periode: p.periode,
        statut: p.categorie === 'A' ? 'Excès confirmé' : 'Excès non confirmé ou enquête en cours',
        maladies: p.pathologie, cas: p.cas, source: p.source, _id: p.id, _k: 'hs',
      };
    });
    state.signalements.forEach(f => {
      const p = f.properties;
      l.push({ type: 'Signalement instruit', nom: p.nom, lieu: p.lieu, periode: p.periode,
               statut: 'Instruit', maladies: p.pathologie, cas: p.cas, source: p.source,
               _id: p.nom, _k: 'sig' });
    });
    state.cellules.forEach(c => {
      l.push({ type: 'Cas déclarés par des familles', nom: `Secteur ${c.deps.join(' / ')}`,
               lieu: c.deps.join(', '), periode: '—',
               statut: `${c.n} cas déclarés`,
               maladies: Object.keys(c.repartition).map(id => BY_ID[id].label).join(' ; '),
               cas: `${c.n} cas`, source: '', _id: c.id, _k: 'cell' });
    });
    return l;
  }

  function renderTableau() {
    const L = lignes();
    $('#tableau-wrap').innerHTML = `
      <table class="tbl">
        <caption>${L.length} lieux — même contenu que la carte.</caption>
        <thead><tr><th scope="col">Lieu</th><th scope="col">Nature</th><th scope="col">Situation</th></tr></thead>
        <tbody>${L.map(r => `
          <tr>
            <td><button data-go="${r._k}:${r._id}">${r.nom}</button><br>
                <span style="color:var(--txt-faint);font-size:11px">${r.lieu}</span></td>
            <td>${r.type}</td>
            <td>${r.statut}</td>
          </tr>`).join('')}</tbody>
      </table>
      <div class="tbl-actions">
        <button class="btn" id="btn-csv">Télécharger les données (CSV)</button>
      </div>`;

    $('#btn-csv').addEventListener('click', () => exportCSV(L));
    $('#tableau-wrap').querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      const [k, id] = b.dataset.go.split(':');
      if (k === 'hs') {
        const h = state.hotspots.find(f => f.properties.id === id);
        if (h) { showHotspot(h.properties); api.fit(h.properties); }
      } else if (k === 'sig') {
        const s = state.signalements.find(f => f.properties.nom === id);
        if (s) showSignalement(s.properties);
      } else {
        const c = state.parCellule[id];
        if (c) { showCellule(c); api.flyTo(c.centre[0], c.centre[1], 8); }
      }
    }));
  }

  function exportCSV(L) {
    const cols = ['type', 'nom', 'lieu', 'periode', 'statut', 'maladies', 'cas', 'source'];
    const ech = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    /* Point-virgule et BOM : Excel en français ouvre le fichier tel quel,
       sinon tout atterrit dans une seule colonne et les accents sautent. */
    const csv = '﻿' + [cols.join(';')].concat(L.map(r => cols.map(c => ech(r[c])).join(';'))).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'veille-sanitaire-participative.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  $('#btn-tableau').addEventListener('click', () => {
    const on = $('#tableau-wrap').classList.toggle('on');
    $('#btn-tableau').setAttribute('aria-expanded', on);
    $('#btn-tableau').textContent = on ? 'Masquer la liste des lieux' : 'Afficher la liste des lieux';
    if (on) renderTableau();
  });

  /* ----------------------------------------------------- MODALE */
  $('#modal').addEventListener('click', ev => {
    if (ev.target.id === 'modal' || ev.target.closest('[data-mclose]')) $('#modal').classList.remove('on');
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { $('#modal').classList.remove('on'); closeDetail(); }
  });

  /* --------------------------------------------- DÉROULÉ / CARTE */
  const api = {
    setLayers(l) { Object.assign(state, l); refresh(); },
    marge() {
      if (!ready[state.engine]) return;
      const e = engines[state.engine];
      if (!e.setPadding) return;
      if (state.mode !== 'carte') return e.setPadding({}, 400);
      const ferme = document.body.classList.contains('panneau-ferme');
      e.setPadding(isMobile() ? { bottom: window.innerHeight * 0.18 }
                              : { left: ferme ? 0 : $('#panel').offsetWidth }, 650);
    },
    fit: p => ready[state.engine] && engines[state.engine].fitZone(p),
    fitFrance: () => ready[state.engine] && engines[state.engine].fitFrance(),
    flyTo: (lng, lat, z) => ready[state.engine] && engines[state.engine].flyTo(lng, lat, z),
  };

  let s1 = null;
  function setMode(m) {
    state.mode = m;
    document.body.classList.toggle('vue-intro', m === 'intro');
    document.body.classList.toggle('vue-carte', m === 'carte');
    document.querySelectorAll('#nav-onglets [data-mode]')
      .forEach(b => b.classList.toggle('on', b.dataset.mode === m));

    if (m === 'intro') {
      closeDetail();
      document.body.classList.remove('panneau-ferme');
      if (!s1) s1 = NK_SECTION1.monter($('#section1'), () => setMode('carte'));
      else s1.reset();
      api.marge();
    } else {
      api.marge();
      /* La visite guidée démarre au premier passage sur la carte, et une
         seule fois : y revenir ensuite ne réimpose pas le parcours. */
      demarrerTour();
    }
    history.replaceState(null, '', m === 'carte' ? '#carte' : location.pathname);
    setTimeout(() => ready[state.engine] && engines[state.engine].resize(), 340);
  }
  document.querySelectorAll('#nav-onglets [data-mode]')
    .forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  /* Retour au déroulé par défilement vers le haut, plutôt qu'un bouton de
     plus dans le panneau.

     Le geste n'est écouté QUE dans le panneau, jamais au-dessus de la carte :
     sur la carte, la molette vers le haut zoome, et on renverrait l'utilisateur
     au déroulé chaque fois qu'il cherche à s'approcher d'un lieu.

     Il faut de plus être en haut du panneau, et pousser franchement. */
  let remonte = 0;
  $('#panel').addEventListener('wheel', ev => {
    if (state.mode !== 'carte' || (tourIdx >= 0 && tourActif)) return;
    if ($('#panel-scroll').scrollTop > 0) return remonte = 0;
    if (ev.deltaY < -8) { remonte -= ev.deltaY; if (remonte > 260) { remonte = 0; setMode('intro'); } }
    else remonte = 0;
  }, { passive: true });

  /* ----------------------------------------------------------- UTILS */
  function fmt(s) {
    s = Math.round(s || 0);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /* ------------------------------------------------------------ BOOT */
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => ready[state.engine] && engines[state.engine].resize(), 120);
  });
  refresh();
  const zoneVoulue = new URLSearchParams(location.search).get('zone');
  setMode(location.hash === '#carte' || zoneVoulue ? 'carte' : 'intro');
  switchEngine('deck');
  if (zoneVoulue) {
    /* Retour depuis une page dossier : on ouvre directement le secteur,
       la visite guidée n'a pas lieu d'être. */
    tourActif = false; $('#tour').classList.add('off');
    const z = state.hotspots.find(f => f.properties.id === zoneVoulue);
    if (z) setTimeout(() => {
      showHotspot(z.properties);
      engines[state.engine].fitZone(z.properties);
    }, 600);
  }

  /* Exposé pour la couche de rendu : le bleu unique des cas déclarés. */
  window.NK_BLEU_CAS = BLEU_CAS;
})();
