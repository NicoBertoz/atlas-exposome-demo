/* ------------------------------------------------------------------ *
 *  concept-page.js — la page dédiée à un concept du déroulé.
 *
 *  Un seul gabarit pour les huit pages : le contenu vit dans concepts.js.
 *  Ajouter un concept, c'est ajouter une entrée dans ce fichier, rien
 *  d'autre — pas de nouveau fichier HTML à maintenir.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  const C = window.NK_CONCEPTS;
  const id = new URLSearchParams(location.search).get('id');
  const i = C.findIndex(c => c.id === id);
  const c = C[i];
  const el = document.getElementById('article');

  if (!c) {
    el.innerHTML = `
      <h1>Ce point n'existe pas</h1>
      <p class="chapo">Le déroulé compte ${C.length} points. Voici la liste.</p>
      <ul class="liste-concepts">
        ${C.map(x => `<li><a href="concept.html?id=${x.id}">${x.titre}</a></li>`).join('')}
      </ul>`;
    return;
  }

  document.title = c.titre + ' — Atlas de l\'exposome';
  document.getElementById('fil').textContent = `Déroulé · point ${i + 1}/${C.length}`;

  const precedent = C[i - 1];
  const suivant = C[i + 1];

  el.innerHTML = `
    <article>
      <span class="art-kicker">${c.kicker}</span>
      <h1>${c.titre}</h1>

      <div class="art-resume">
        <span class="art-resume-lab">En bref</span>
        ${c.resume}
      </div>

      ${c.page.map(s => `<section class="art-sec"><h2>${s.h}</h2><p>${s.p}</p></section>`).join('')}

      ${c.sources.length ? `
        <section class="art-sec art-sources">
          <h2>Sources</h2>
          <ul>${c.sources.map(s =>
            `<li><a href="${s.u}" target="_blank" rel="noopener">${s.l} ↗</a></li>`).join('')}</ul>
        </section>` : ''}

      <section class="art-cta">
        <h2>Et concrètement, sur la carte</h2>
        <p>Ce point se lit sur les clusters documentés, les signalements instruits et les
          témoignages reçus. Si vous êtes concerné·e, votre cas peut y figurer.</p>
        <div class="art-cta-btns">
          <a class="btn btn-accent" href="participer.html">Signaler un cas →</a>
          <a class="btn" href="index.html#carte">Ouvrir la carte</a>
        </div>
      </section>

      <nav class="art-nav">
        ${precedent ? `<a href="concept.html?id=${precedent.id}">
          <span>Point précédent</span>${precedent.titre}</a>` : '<span></span>'}
        ${suivant ? `<a class="suiv" href="concept.html?id=${suivant.id}">
          <span>Point suivant</span>${suivant.titre}</a>` : '<span></span>'}
      </nav>
    </article>`;
})();
