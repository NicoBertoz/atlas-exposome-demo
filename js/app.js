/* ------------------------------------------------------------------ *
 *  app.js — état partagé, interface, orchestration des 3 moteurs.
 *
 *  Contrat d'un moteur (voir engine-*.js) :
 *    { id, label, note, caps,
 *      init(container, ctx) -> Promise,
 *      render(state), setBasemap(key),
 *      flyTo(lng, lat, zoom), fitZone(props), resize() }
 *
 *  ctx = { onPoint(props), onSignal(props), onZone(props), onReady(id) }
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  const D = window.NK_DATA;
  const S = window.NK_SHARED;
  const PATHOS = D.meta.pathologies;
  const BY_ID = Object.fromEntries(PATHOS.map(p => [p.id, p]));
  const $ = s => document.querySelector(s);
  const HOTSPOTS = D.hotspots.features.filter(f => !f.properties.anonyme);
  const isMobile = () => window.matchMedia('(max-width: 859px)').matches;

  /* ----------------------------------------------------------- ÉTAT */
  const state = {
    engine: 'deck',
    mode: 'intro',
    pathos: new Set(PATHOS.map(p => p.id)),
    yearMax: null,
    zones: true, sig: true, temoins: true, agg: false, exact: false,
    basemap: 'light',
    features: D.temoignages.features,   // interne, jamais envoyé tel quel aux moteurs
    cellules: [], horsMaille: 0, parCellule: {},
    hotspots: D.hotspots.features,
    signalements: D.signalements.features,
  };

  function applyFilters() {
    state.features = !state.temoins ? [] : D.temoignages.features.filter(f => {
      const p = f.properties;
      if (!state.pathos.has(p.patho_id)) return false;
      if (state.yearMax && p.annee > state.yearMax) return false;
      return true;
    });
    /* Les moteurs ne reçoivent que le résultat flouté : aucune position
       individuelle ne quitte cette fonction. */
    const f = S.flouter(state.features);
    /* SEULE exception à la règle « aucune position individuelle ne sort d'ici » :
       le comparateur de l'atelier, explicitement activé, signalé par un bandeau
       rouge, et éteint à chaque rechargement. Retirer la case à cocher retire
       le canal : rien d'autre ne lit `pointsExacts`. */
    state.pointsExacts = state.exact ? state.features : [];
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
    onReady: id => { ready[id] = true; if (id === state.engine) $('#loading').classList.add('off'); },
  };

  /* Un seul moteur depuis l'arbitrage : deck.gl posé sur MapLibre.
     MapLibre porte le fond vectoriel et la caméra, deck.gl les couches de
     données. La fonction reste pour garder le contrat inchangé si un second
     moteur revenait un jour. */
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
    const places = state.features.length - state.horsMaille;
    $('#year-count').textContent = `${places} cas sur ${state.features.length} placés`;
    $('#c-zones').textContent = HOTSPOTS.length + ' + 1 anonymisée';
    $('#hs-count').textContent = HOTSPOTS.length;
    $('#lede-chiffres').innerHTML = `<b>${HOTSPOTS.length} agrégats</b> de maladies rares de l'enfant documentés en France, <b>${state.signalements.length} autres investigations</b> instruites par les autorités, et <b>${D.temoignages.features.length} cas</b> déclarés par des familles.`;
    $('#c-sig').textContent = state.signalements.length;
    $('#c-tem').textContent = `${state.cellules.length} secteurs`;
    $('#k-note').textContent = state.horsMaille
      ? `${state.horsMaille} cas non placés : leur secteur compte moins de ${S.K_ANONYMAT} déclarations.`
      : 'Tous les secteurs atteignent le seuil.';
    $('#exact-warn').hidden = !state.exact;
    renderFilters();
  }

  /* --------------------------------------------------------- FILTRES */
  function renderFilters() {
    const n = {};
    D.temoignages.features.forEach(f => {
      const p = f.properties;
      if (state.yearMax && p.annee > state.yearMax) return;
      n[p.patho_id] = (n[p.patho_id] || 0) + 1;
    });
    $('#filters').innerHTML = PATHOS.map(p => `
      <div class="filter ${state.pathos.has(p.id) ? '' : 'off'}" data-patho="${p.id}">
        <span class="swatch" style="background:${p.color}"></span>
        <span class="lbl">${p.label}</span>
        <span class="n">${n[p.id] || 0}</span>
      </div>`).join('');
    $('#legend-patho').innerHTML = PATHOS.map(p =>
      `<div class="li"><span class="sw" style="background:${p.color}"></span>${p.label}</div>`).join('');
  }

  $('#filters').addEventListener('click', ev => {
    const el = ev.target.closest('[data-patho]'); if (!el) return;
    const id = el.dataset.patho;
    state.pathos.has(id) ? state.pathos.delete(id) : state.pathos.add(id);
    if (!state.pathos.size) state.pathos = new Set(PATHOS.map(p => p.id));
    refresh();
  });

  $('#year').addEventListener('input', ev => {
    const v = +ev.target.value;
    state.yearMax = v <= 2011 ? null : v;
    $('#year-val').textContent = state.yearMax ? `2012 – ${v}` : '2012 – 2025';
    refresh();
  });

  [['tg-zones', 'zones'], ['tg-sig', 'sig'], ['tg-temoins', 'temoins'], ['tg-agg', 'agg'],
   ['tg-exact', 'exact']]
    .forEach(([id, key]) => $('#' + id).addEventListener('change', ev => {
      state[key] = ev.target.checked;
      if (key === 'exact') $('#exact-warn').hidden = !state.exact;
      refresh();
    }));

  $('#exact-off').addEventListener('click', () => {
    $('#tg-exact').checked = false;
    state.exact = false; $('#exact-warn').hidden = true; refresh();
  });

  $('#btn-basemap').addEventListener('click', () => {
    state.basemap = state.basemap === 'light' ? 'dark' : 'light';
    $('#btn-basemap').textContent = state.basemap === 'light' ? 'Fond sombre' : 'Fond clair';
    Object.keys(ready).forEach(k => ready[k] && engines[k].setBasemap(state.basemap));
    setTimeout(() => engines[state.engine].render(state), 400);
  });

  /* -------------------------------------------- FEUILLE MOBILE (sheet) */
  function openSheet(open) {
    if (!isMobile()) return;
    $('#panel').classList.toggle('open', open);
    // le conteneur de carte ne bouge pas, mais on laisse le moteur se recaler
    setTimeout(() => ready[state.engine] && engines[state.engine].resize(), 320);
  }
  $('#sheet-grip').addEventListener('click', () => openSheet(!$('#panel').classList.contains('open')));
  $('#legend-toggle').addEventListener('click', () => $('#legend').classList.toggle('open'));

  /* ------------------------------------------------------- LES FICHES */
  function openDetail() {
    $('#detail').classList.add('on');
    $('#intro').style.display = 'none';
    $('#panel-scroll').scrollTop = 0;
    openSheet(true);
  }
  function closeDetail() {
    $('#detail').classList.remove('on');
    $('#intro').style.display = '';
    stopAudio();
  }

  /* Flow du 28/07 : « [[Permettre donner témoignage]] » figure sur la page
     hotspot ET sur la page cas particulier. Le formulaire doit être atteignable
     depuis l'endroit qui donne envie de le remplir, pas seulement depuis la
     barre du haut. */
  /* Dix des vingt et un agrégats ont une page dédiée (hotspots-pages.js).
     La fiche de la carte y renvoie, la liste les signale d'une pastille. */
  const PAGES_IDS = new Set((window.NK_PAGES || []).map(p => p.id));
  const aPage = id => PAGES_IDS.has(id);

  function blocParticiper(contexte) {
    return `<div class="fiche-cta">
      <p>${contexte}</p>
      <a class="btn btn-accent" href="participer.html">Ajouter mon cas →</a>
    </div>`;
  }

  /* Connexion hotspot ↔ cas particuliers, demandée dans le flow :
     « Etablir connexion entre hotspot et cas particulier pour les afficher
     côté hotspot ». On respecte les filtres en cours. */
  function temoinsDuCluster(id) {
    const out = [];
    state.cellules.forEach(c => c.temoins.forEach(t => {
      if (t.hotspot === id) out.push(t);
    }));
    return out.sort((a, b) => a.annee - b.annee);
  }

  function listeTemoins(liste) {
    if (!liste.length) return '<p class="fine">Aucun témoignage reçu pour cette zone, ou aucun qui atteigne le seuil d\'affichage.</p>';
    return `<div class="tem-list">${liste.map(t => `
      <button data-tem="${t.id}">
        <span class="pin" style="background:${t.color}"></span>
        <span class="nm">${t.patho_label}</span>
        <span class="yr">${t.annee}${t.audio ? ' ♪' : ''}</span>
      </button>`).join('')}</div>`;
  }

  /* Fiche d'une maille : la seule porte d'entrée vers les témoignages.
     On n'atteint jamais un témoignage par sa position, toujours par son groupe. */
  function showCellule(c) {
    const det = Object.entries(c.repartition).map(([id, n]) => {
      const p = BY_ID[id];
      return `<span class="tag" style="background:${S.hex2rgba(p.color, .14)};color:${p.color}">
        <span class="swatch" style="background:${p.color}"></span>${n} × ${p.label}</span>`;
    }).join('');
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">SECTEUR AGRÉGÉ · ${c.maille}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <h3>${c.n} cas déclarés</h3>
      <div class="sub">${c.deps.join(', ')}</div>
      <div style="margin-top:8px">${det}</div>
      <p class="caution" style="border-top:0;padding-top:10px;margin-top:10px">
        Position approximative, volontairement. Le point affiché est le centre de la maille,
        pas la position des familles.
      </p>
      
      ${listeTemoins(c.temoins)}
      ${blocParticiper('Un cas de plus dans ce secteur ?')}`;
    openDetail();
  }

  function showTestimony(p) {
    const c = BY_ID[p.patho_id].color;
    const cell = state.cellules.find(x => x.temoins.some(t => t.id === p.id));
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">TÉMOIGNAGE ${p.id} · reçu le ${p.recu_le}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <span class="tag" style="background:${S.hex2rgba(c, .14)};color:${c}">
        <span class="swatch" style="background:${c}"></span>${p.patho_label}</span>
      <span class="badge fic">donnée fictive</span>
      <h3>${p.dep}</h3>
      <div class="sub">${p.sous_type} · diagnostic en ${p.annee}</div>
      ${audioBlock(p)}
      <blockquote class="quote">${p.temoignage}</blockquote>
      <dl class="kv">
        <dt>Âge au dg.</dt><dd>${p.tranche_age}</dd>
        <dt>Sexe</dt><dd>${p.sexe}</dd>
        <dt>Exposition</dt><dd>${p.exposition}</dd>
        <dt>Profession</dt><dd>${p.profession_parent}</dd>
        <dt>Issue</dt><dd>${p.issue}</dd>
        <dt>Localisation</dt><dd>${cell ? cell.maille : 'secteur agrégé'}
          <span class="badge">IRIS collecté, non publié</span></dd>
        <dt>Cluster</dt><dd>${p.hotspot
          ? `<a href="#" data-zone="${p.hotspot}">${p.hotspot_nom}</a>` : 'hors zone identifiée'}</dd>
        <dt>Statut</dt><dd><span class="badge ${p.verifie ? 'ok' : ''}">${
          p.verifie ? 'vérifié' : 'en attente de revue'}</span></dd>
      </dl>
      ${cell ? `<div class="src"><a href="#" data-cell="${cell.id}">← les ${cell.n} témoignages du secteur</a></div>` : ''}
      ${blocParticiper('Vous vivez une situation comparable ?')}
      <p class="caution">
        Témoignage généré pour la démonstration. Ni commune ni adresse ne sont affichées :
        la collecte descend à l'IRIS, la publication remonte à la maille.
      </p>`;
    openDetail();
    bindAudio(p);
  }

  function showHotspot(p) {
    const col = S.zoneColor(p);
    const num = HOTSPOTS.findIndex(f => f.properties.id === p.id) + 1;
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">${p.anonyme ? 'ZONE ANONYMISÉE' : 'AGRÉGAT ' + num + '/' + HOTSPOTS.length} · ${p.periode}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <span class="tag" style="background:${S.hex2rgba(col, .14)};color:${col}">
        <span class="swatch" style="background:${col}"></span>${p.cat_label}</span>
      <span class="badge ok">donnée publique</span>
      <h3>${p.nom}</h3>
      <div class="sub">${p.lieu}</div>
      <div class="stat">
        <div><span class="n" style="color:${col}">${p.mesure_txt.split(' [')[0]}</span>
             <span class="l">${p.anonyme ? 'Constat' : 'Mesure officielle'}</span></div>
        <div><span class="n">${p.n_temoins || '—'}</span><span class="l">Témoignages reçus</span></div>
      </div>
      <div class="block"><h4>Pathologies concernées</h4><p>${p.pathologie}</p></div>
      <div class="block"><h4>Cas recensés</h4><p>${p.cas}</p></div>
      <div class="block"><h4>Conclusion officielle</h4><p>${p.conclusion}</p></div>
      <div class="block"><h4>Cause suspectée</h4><p>${p.cause}</p></div>
      <div class="block"><h4>Où en est le dossier</h4><p>${p.statut}</p></div>
      <div class="block"><h4>Collectif</h4><p>${p.collectif}</p></div>
      <div class="block"><h4>Pourquoi ce cluster compte</h4><p>${p.interet}</p></div>
      ${aPage(p.id) ? `<a class="fiche-dossier" href="hotspot.html?id=${p.id}">
        <b>Lire le dossier complet</b>
        <span>Exposition, décompte citoyen, phrase de clôture, acteurs à contacter, frise</span>
      </a>` : ''}
      <div class="src"><a href="${p.source}" target="_blank" rel="noopener">Rapport source ↗</a></div>

      <div class="block"><h4>Cas déclarés dans cette zone</h4></div>
      ${listeTemoins(temoinsDuCluster(p.id))}

      ${blocParticiper('Votre enfant a été diagnostiqué dans ce secteur ?')}

      <p class="caution">
        Association spatiale ou constat d'excès, <b>pas</b> une relation de cause à effet.
        Un cluster signale une zone où compter davantage, pas une responsabilité établie.
      </p>`;
    openDetail();
  }

  function showSignalement(p) {
    $('#detail').innerHTML = `
      <div class="detail-top">
        <span class="id">SIGNALEMENT INSTRUIT · ${p.periode}</span>
        <button class="detail-close" data-close aria-label="Fermer">×</button>
      </div>
      <span class="tag" style="background:rgba(154,163,175,.14);color:#9AA3AF">
        <span class="swatch" style="background:#9AA3AF"></span>${p.cat_label}</span>
      <span class="badge ok">donnée publique</span>
      <h3>${p.nom}</h3>
      <div class="sub">${p.lieu}</div>
      <div class="block"><h4>Pathologies</h4><p>${p.pathologie}</p></div>
      <div class="block"><h4>Cas</h4><p>${p.cas}</p></div>
      <div class="block"><h4>Ce qu'en dit l'instruction</h4><p>${p.conclusion}</p></div>
      <div class="block"><h4>Cause suspectée</h4><p>${p.cause}</p></div>
      <div class="src"><a href="${p.source}" target="_blank" rel="noopener">Source ↗</a></div>
      ${blocParticiper('Vous connaissez un cas dans ce secteur ?')}`;
    openDetail();
  }

  $('#detail').addEventListener('click', ev => {
    if (ev.target.closest('[data-close]')) return closeDetail();
    const z = ev.target.closest('[data-zone]');
    if (z) {
      ev.preventDefault();
      const h = state.hotspots.find(f => f.properties.id === z.dataset.zone);
      return void (showHotspot(h.properties), engines[state.engine].fitZone(h.properties));
    }
    const t = ev.target.closest('[data-tem]');
    if (t) {
      const cell = state.cellules.find(c => c.temoins.some(x => x.id === t.dataset.tem));
      return void showTestimony(cell.temoins.find(x => x.id === t.dataset.tem));
    }
    const c = ev.target.closest('[data-cell]');
    if (c) { ev.preventDefault(); const cell = state.parCellule[c.dataset.cell]; if (cell) showCellule(cell); }
  });

  /* ------------------------------------------------------------ AUDIO */
  let audioEl = null, utter = null;

  function audioBlock(p) {
    const f = !!p.audio;
    const dur = f ? fmt(p.duree_audio) : '~1:10';
    return `<div class="audio">
      <div class="audio-head">
        <button class="play" id="a-play" aria-label="Lire le témoignage">▶</button>
        <div class="audio-meta">
          <div class="t1">${f ? 'Témoignage audio' : 'Lecture du témoignage'}</div>
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
      /* On garde une référence locale : un dernier timeupdate peut arriver
         après que stopAudio() a remis audioEl à null. */
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
      audioEl = null;                       // avant pause() : coupe les handlers en vol
      el.pause(); el.ontimeupdate = null; el.onended = null;
    }
    if (speechSynthesis.speaking) { if (utter) utter.onend = null; speechSynthesis.cancel(); }
    const b = $('#a-play'); if (b) b.textContent = '▶';
  }

  /* -------------------------------------------------- RÉCIT / LECTURE
     Deux parcours guidés qui pilotent la carte :
       « Récit »       enchaîne les 6 clusters, façon frames.
       « Témoignages » enchaîne les témoignages audio et les lit.        */
  let pbOn = false, pbMode = 'recit', pbIdx = -1, pbTimer = null;

  /* En mode témoignages on parcourt les mailles, pas les cas : on ne connaît
     jamais que le centre du secteur. */
  const queue = () => {
    if (pbMode === 'recit') return HOTSPOTS;
    const avecAudio = [];
    state.cellules.forEach(c => c.temoins.forEach(t => {
      if (t.audio) avecAudio.push({ cell: c, tem: t });
    }));
    if (avecAudio.length) return avecAudio;
    return state.cellules.flatMap(c => c.temoins.slice(0, 2).map(t => ({ cell: c, tem: t }))).slice(0, 12);
  };

  function step() {
    const q = queue();
    if (!q.length) return stopPlayback();
    pbIdx = (pbIdx + 1) % q.length;

    if (pbMode === 'recit') {
      const p = q[pbIdx].properties;
      $('#pb-now').textContent = `${pbIdx + 1}/${q.length} · ${p.nom}`;
      engines[state.engine].fitZone(p);
      showHotspot(p);
      pbTimer = setTimeout(() => { if (pbOn) step(); }, 8000);
    } else {
      const { cell, tem } = q[pbIdx];
      $('#pb-now').textContent = `${pbIdx + 1}/${q.length} · ${tem.dep}`;
      engines[state.engine].flyTo(cell.centre[0], cell.centre[1], 8.5);
      showTestimony(tem);
      pbTimer = setTimeout(() => {
        playTestimony(tem, () => { if (pbOn) pbTimer = setTimeout(step, 900); });
      }, 800);
    }
  }

  function stopPlayback() {
    pbOn = false; clearTimeout(pbTimer); stopAudio();
    $('#pb-toggle').textContent = '▶';
    $('#pb-now').textContent = 'en pause';
  }

  $('#pb-toggle').addEventListener('click', () => {
    if (pbOn) return stopPlayback();
    pbOn = true; $('#pb-toggle').textContent = '❚❚'; step();
  });
  $('#pb-next').addEventListener('click', () => {
    clearTimeout(pbTimer); stopAudio();
    if (pbOn) step(); else { pbOn = true; $('#pb-toggle').textContent = '❚❚'; step(); }
  });
  document.querySelectorAll('.pb-mode').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.pb-mode').forEach(x => x.classList.toggle('on', x === b));
    pbMode = b.dataset.mode; pbIdx = -1;
    if (pbOn) { clearTimeout(pbTimer); stopAudio(); step(); }
  }));

  /* --------------------------------------------------- LISTE CLUSTERS */
  $('#hs-list').innerHTML = HOTSPOTS.map((f, i) => {
    const p = f.properties, col = S.zoneColor(p);
    return `<button data-hs="${p.id}"${aPage(p.id) ? ' class="a-dossier"' : ''}>
      <span class="num" style="background:${col}">${i + 1}</span>
      <span class="nm">${p.nom}${aPage(p.id) ? '<em>dossier complet</em>' : ''}</span>
      <span class="rr">${p.mesure_txt.split(' [')[0]}</span>
    </button>`;
  }).join('') + `
    <button data-hs="anon">
      <span class="num" style="background:#9AA3AF">?</span>
      <span class="nm">Secteur anonymisé (49/53/72)</span>
      <span class="rr">RGPD</span>
    </button>`;
  $('#hs-list').addEventListener('click', ev => {
    const b = ev.target.closest('[data-hs]'); if (!b) return;
    const h = state.hotspots.find(f => f.properties.id === b.dataset.hs);
    showHotspot(h.properties);
    engines[state.engine].fitZone(h.properties);
  });

  /* ----------------------------------------------------- MODALES CTA */
  const MODALS = {
    questionnaire: `
      <h3>Signaler un cas</h3>
      <div class="sub">Maquette du point d'entrée du questionnaire participatif (phase 1 : collecte).</div>
      <h4>Ce que le bouton déclenche</h4>
      <ol>
        <li>Écran d'aiguillage : « un cas de maladie » ou « une pollution près de chez moi ».</li>
        <li>Formulaire A — cas de santé : pathologie, année de diagnostic, tranche d'âge, sexe,
            adresse géocodée en code IRIS côté client, exposition suspectée, témoignage libre.</li>
        <li>Blocs de consentement granulaires, dont la future visualisation géolocalisée agrégée.</li>
        <li>Anti-abus : honeypot, limite de débit, confirmation par e-mail, revue manuelle des
            cas atypiques plutôt que rejet automatique.</li>
      </ol>
      <h4>La règle d'affichage à ne pas perdre</h4>
      <p>Collecte fine (IRIS), publication grossière (maille agrégée avec seuil de k-anonymat).
         Les points individuels de cette démo sont un artefact de démonstration : en production,
         un cas isolé ne doit jamais être localisable à l'adresse.</p>
      <h4>Ce que les collectifs ont déjà résolu</h4>
      <p>Stop aux Cancers de nos Enfants (Sainte-Pazanne) a monté son propre recensement, son
         authentification et son traitement, et fait analyser 700 pesticides dans l'eau. À
         Noyelles-Godault, l'invitation institutionnelle a touché 91 % des enfants pour
         seulement 24 % de participation : la confiance ne se décrète pas.</p>`,
    deroule: `
      <h3>Le déroulé, en texte</h3>
      <div class="sub">Alternative statique au récit cartographique, pour relire sans la carte.</div>
      <h4>Pourquoi cette porte de sortie</h4>
      <p>Le récit guidé impose son rythme. Une version texte continue sert trois publics : les
         lecteurs pressés, les journalistes qui veulent citer, et l'accessibilité (lecteurs
         d'écran, connexions lentes, navigation au clavier).</p>
      <h4>Structure</h4>
      <ol>
        <li>Le signal : ce que disent les familles.</li>
        <li>Six clusters, six façons de ne pas conclure.</li>
        <li>La maille change tout : Pont-de-l'Arche, SIR 6,4 à la commune, 2,3 au canton.</li>
        <li>Ce qu'on ne mesure pas : Preignac, une enquête bloquée faute de données d'exposition.</li>
        <li>La donnée verrouillée : un secteur entier anonymisé au titre du RGPD.</li>
        <li>Participer : donner son cas.</li>
      </ol>
      <h4>Sur les données affichées</h4>
      <p>Clusters et signalements proviennent de rapports publics (Santé publique France,
         registres, presse) ; chaque fiche porte son lien. Les 100 témoignages individuels sont
         fictifs et servent uniquement à tester le rendu.</p>`,
  };
  document.querySelectorAll('[data-modal]').forEach(b => b.addEventListener('click', () => {
    $('#modal-box').innerHTML = MODALS[b.dataset.modal] +
      `<div style="margin-top:22px"><button class="btn" data-mclose>Fermer</button></div>`;
    $('#modal').classList.add('on');
  }));
  $('#modal').addEventListener('click', ev => {
    if (ev.target.id === 'modal' || ev.target.closest('[data-mclose]')) $('#modal').classList.remove('on');
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { $('#modal').classList.remove('on'); closeDetail(); stopPlayback(); }
  });

  /* ------------------------------------------------- MODE RÉCIT / EXPLORER
     Le récit et l'exploration partagent la même carte et le même panneau.
     Passer de l'un à l'autre ne recharge rien : on masque les réglages,
     on affiche les chapitres, et le défilement prend la main sur la caméra. */
  const api = {
    setLayers(l) {
      Object.assign(state, l);
      ['tg-zones', 'tg-sig', 'tg-temoins'].forEach((id, k) => {
        const key = ['zones', 'sig', 'temoins'][k];
        $('#' + id).checked = state[key];
      });
      refresh();
    },
    /* Marge de caméra correspondant au panneau, pour que la France reste
       centrée dans la partie visible de la carte. */
    marge() {
      if (!ready[state.engine]) return;
      const e = engines[state.engine];
      if (!e.setPadding) return;
      if (state.mode !== 'carte') return e.setPadding({}, 400);
      e.setPadding(isMobile() ? { bottom: window.innerHeight * 0.18 }
                              : { left: $('#panel').offsetWidth }, 650);
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
    document.querySelectorAll('#mode-switch button')
      .forEach(b => b.classList.toggle('on', b.dataset.mode === m));

    if (m === 'intro') {
      closeDetail(); stopPlayback();
      $('#tg-exact').checked = false; state.exact = false; $('#exact-warn').hidden = true;
      if (!s1) s1 = NK_SECTION1.monter($('#section1'), () => setMode('carte'));
      else s1.reset();
      api.marge();
      /* La carte tourne derrière le déroulé, floutée : elle doit être prête
         au moment où on la révèle, pas se charger à ce moment-là. */
      api.setLayers({ zones: true, sig: true, temoins: true });
    } else {
      /* Sortir du déroulé n'impose PAS un recadrage : la carte est déjà là,
         à la bonne échelle. On lui laisse seulement la marge du panneau, en
         animant le padding de caméra — recadrer d'un coup, c'est ce qui
         donnait l'impression d'un saut. */
      api.setLayers({ zones: true, sig: true, temoins: true });
      api.marge();
    }
    history.replaceState(null, '', m === 'carte' ? '#carte' : location.pathname);
    setTimeout(() => ready[state.engine] && engines[state.engine].resize(), 340);
  }
  document.querySelectorAll('#mode-switch button')
    .forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  document.addEventListener('click', ev => {
    const g = ev.target.closest('[data-mode-go]');
    if (g) setMode(g.dataset.modeGo);
  });

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
  /* Le déroulé s'affiche tout de suite : c'est du texte, il n'a aucune raison
     d'attendre le fond de carte. La carte se charge derrière, floutée.
     #carte permet de pointer directement sur la section 2 depuis une page concept. */
  /* ?zone=h1 : retour depuis une page dossier, la carte s'ouvre sur le secteur. */
  const zoneVoulue = new URLSearchParams(location.search).get('zone');
  setMode(location.hash === '#carte' || zoneVoulue ? 'carte' : 'intro');
  switchEngine('deck');
  if (zoneVoulue) {
    const z = state.hotspots.find(f => f.properties.id === zoneVoulue);
    if (z) setTimeout(() => {
      showHotspot(z.properties);
      engines[state.engine].fitZone(z.properties);
    }, 600);
  }
})();
