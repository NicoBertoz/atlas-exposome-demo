/* ------------------------------------------------------------------ *
 *  hotspot-page.js — le gabarit unique des dix pages hotspot.
 *
 *  Même principe que concept-page.js : un seul fichier HTML, le contenu
 *  vit dans hotspots-pages.js, la carte d'identité et le périmètre
 *  viennent de NK_DATA. Ajouter une page, c'est ajouter une entrée dans
 *  hotspots-pages.js, rien d'autre.
 *
 *  Les huit blocs sont rendus dans le même ordre pour les dix dossiers.
 *  Un bloc sans contenu disparaît, il ne laisse pas de titre orphelin.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  const PAGES = window.NK_PAGES;
  const VARS = window.NK_VARIABLES;
  const FEATURES = window.NK_DATA.hotspots.features;

  const id = new URLSearchParams(location.search).get('id');
  const i = PAGES.findIndex(p => p.id === id);
  const page = PAGES[i];
  const el = document.getElementById('article');

  const feat = page && FEATURES.find(f => f.properties.id === page.id);

  /* ------------------------------------------------------ SOMMAIRE */
  if (!page || !feat) {
    el.innerHTML = `
      <h1>Choisir un dossier</h1>
      <p class="chapo">Dix hotspots documentés, un dossier par page. Les dix suivent la même
        structure en huit blocs, ce qui permet de les comparer point par point.</p>
      <div class="hs-index">
        ${PAGES.map((p, n) => {
          const f = FEATURES.find(x => x.properties.id === p.id);
          if (!f) return '';
          const q = f.properties;
          return `<a href="hotspot.html?id=${p.id}">
            <span class="hsi-n">${String(n + 1).padStart(2, '0')}</span>
            <span class="hsi-txt">
              <b>${q.nom}</b>
              <em>${q.lieu} · ${q.mesure_txt}</em>
            </span></a>`;
        }).join('')}
      </div>
      <p class="fine-note" style="margin-top:26px">
        Les onze autres agrégats de la carte n'ont pas encore de page dédiée : leur fiche reste
        consultable depuis la carte.
      </p>`;
    return;
  }

  const p = feat.properties;
  const CAT_COL = { A: 'var(--rouge)', B: 'var(--orange)', C: 'var(--orange)', D: 'var(--bleu)' };
  const col = CAT_COL[p.categorie] || 'var(--encre-2)';

  /* La barre du haut ne porte plus de fil d'Ariane depuis qu'elle accueille
     les cinq onglets communs à toutes les pages. */
  document.title = p.nom + ' — Veille sanitaire participative';

  const prec = PAGES[i - 1];
  const suiv = PAGES[i + 1];

  const paras = a => (a || []).map(t => `<p>${t}</p>`).join('');

  /* Un bloc de texte ne s'affiche que s'il a du contenu. */
  function bloc(num, titre, corps) {
    if (!corps) return '';
    return `<section class="art-sec hs-bloc">
      <h2><span class="hs-num">${num}</span>${titre}</h2>${corps}</section>`;
  }

  /* ------------------------------------------------------- RENDU */
  el.innerHTML = `
  <article>

    <!-- BLOC 0 ------------------------------------------ identité -->
    <span class="art-kicker">Dossier ${i + 1} sur ${PAGES.length}</span>
    <h1>${p.nom}</h1>
    <p class="chapo">${page.chapo}</p>

    <div class="hs-id" style="--cat:${col}">
      <div class="hs-id-tete">
        <span class="hs-cat">${p.cat_label}</span>
        <span class="hs-lieu">${p.lieu}</span>
      </div>
      <dl class="hs-strip">
        <div><dt>Pathologie</dt><dd>${p.pathologie}</dd></div>
        <div><dt>Période</dt><dd>${p.periode}</dd></div>
        <div><dt>Mesure officielle</dt><dd class="hs-mes">${p.mesure_txt}</dd></div>
        <div><dt>Cas déclarés reçus</dt><dd>${p.n_temoins || '—'}<span class="hs-fic">démo</span></dd></div>
      </dl>
      <p class="hs-cas">${p.cas}</p>
    </div>

    <!-- les sept variables --------------------------------------- -->
    <section class="art-sec hs-vars">
      <h2>Les sept repères</h2>
      <p class="hs-vars-intro">Ces sept variables sont renseignées sur les dix dossiers. C'est
        ce qui permet de les lire côte à côte plutôt qu'un par un.</p>
      <dl>
        ${VARS.map(([k, lab]) => page.variables[k]
          ? `<div><dt>${lab}</dt><dd>${page.variables[k]}</dd></div>` : '').join('')}
      </dl>
    </section>

    ${bloc(1, 'Ce qu\'on respire ici', paras(page.expo))}
    ${bloc(2, 'Qui a compté le premier', paras(page.signal))}
    ${bloc(3, 'Ce que l\'État a mesuré', paras(page.mesure))}

    <!-- BLOC 4 -------------------------------- la phrase de clôture -->
    ${page.phrase ? `
      <section class="hs-phrase ${page.phrase.ouverte ? 'ouverte' : ''} ${page.phrase.gagnee ? 'gagnee' : ''}">
        <span class="hs-phrase-lab">${
          page.phrase.ouverte ? 'Pas encore de phrase de clôture'
          : page.phrase.gagnee ? 'La phrase qui a tout changé'
          : page.phrase.constat ? 'Le constat qui déplace le dossier'
          : 'La phrase qui a tout arrêté'}</span>
        <blockquote>${page.phrase.texte}</blockquote>
        <cite>${page.phrase.source}</cite>
      </section>` : ''}

    ${bloc(5, 'Ce qui n\'a jamais été mesuré', paras(page.manque))}

    <!-- BLOC 6 ------------------------------------------- acteurs -->
    ${page.acteurs && page.acteurs.length ? `
      <section class="art-sec hs-bloc">
        <h2><span class="hs-num">6</span>Qui porte le dossier</h2>
        <div class="hs-acteurs">
          ${page.acteurs.map(a => `
            <div class="hs-act">
              <b>${a.nom}</b>
              <p>${a.role}</p>
              <div class="hs-act-c">
                ${a.mail && a.mail !== 'non trouvé'
                  ? `<a href="mailto:${a.mail}">${a.mail}</a>`
                  : `<span class="hs-nf">${a.mail || 'contact non publié'}</span>`}
                ${a.tel ? `<span>${a.tel}</span>` : ''}
                ${a.site ? `<a href="${a.site}" target="_blank" rel="noopener">site ↗</a>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <p class="fine-note">Seules figurent ici les adresses génériques que ces structures
          publient elles-mêmes. Aucune n'a été déduite d'un nom de domaine ; quand le contact
          manque, c'est écrit.</p>
      </section>` : ''}

    <!-- BLOC 7 --------------------------------------------- frise -->
    ${page.frise && page.frise.length ? `
      <section class="art-sec hs-bloc">
        <h2><span class="hs-num">7</span>Où ça en est</h2>
        <ol class="hs-frise">
          ${page.frise.map(f => `<li><b>${f.an}</b><span>${f.t}</span></li>`).join('')}
        </ol>
      </section>` : ''}

    <!-- sources --------------------------------------------------- -->
    ${page.sources && page.sources.length ? `
      <section class="art-sec art-sources">
        <h2>Sources</h2>
        <ul>${page.sources.map(s =>
          `<li><a href="${s.u}" target="_blank" rel="noopener">${s.l} ↗</a></li>`).join('')}
        </ul>
      </section>` : ''}

    <!-- BLOC 8 ----------------------------------------- participer -->
    <section class="art-cta">
      <h2>Ce que vous pouvez faire</h2>
      <p>${page.variables.collectif && page.variables.collectif !== 'Inexistant'
        ? `Un collectif existe sur ce territoire. Le rejoindre a plus d'effet que de témoigner seul.
           Si votre situation ressemble à celles décrites ici, votre cas peut aussi rejoindre
           le recensement de l'Atlas.`
        : `Aucun collectif n'existe encore sur ce territoire. C'est précisément là que le
           recensement participatif a le plus de valeur : sans lui, ces situations ne sont
           comptées nulle part.`}</p>
      <div class="art-cta-btns">
        <a class="btn btn-accent" href="participer.html">Signaler un cas →</a>
        <a class="btn" href="index.html#carte" data-zoom="${p.id}">Voir ce secteur sur la carte</a>
      </div>
      <p class="caution" style="margin-top:20px">
        Association spatiale ou constat d'excès, <b>pas</b> une relation de cause à effet.
        Un agrégat signale une zone où compter davantage, pas une responsabilité établie.
      </p>
    </section>

    <nav class="art-nav">
      ${prec ? `<a href="hotspot.html?id=${prec.id}"><span>Dossier précédent</span>${
        FEATURES.find(f => f.properties.id === prec.id).properties.nom}</a>` : '<span></span>'}
      ${suiv ? `<a class="suiv" href="hotspot.html?id=${suiv.id}"><span>Dossier suivant</span>${
        FEATURES.find(f => f.properties.id === suiv.id).properties.nom}</a>` : '<span></span>'}
    </nav>

    <p class="hs-tous"><a href="hotspot.html">← Les ${PAGES.length} dossiers</a></p>
  </article>`;

  /* Le bouton « voir sur la carte » ouvre la carte centrée sur la zone. */
  const zoom = el.querySelector('[data-zoom]');
  if (zoom) zoom.href = `index.html?zone=${zoom.dataset.zoom}#carte`;
})();
