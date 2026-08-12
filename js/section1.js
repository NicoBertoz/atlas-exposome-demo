/* ------------------------------------------------------------------ *
 *  section1.js — le déroulé narratif, première section de la page.
 *
 *  Flow du 28/07 : « Section 1 / Déroulé narratif à scroller », résumés
 *  courts (max 8, ~200 mots) qui mènent chacun vers une page dédiée, et
 *  la carte teasée en arrière-plan avant d'apparaître en section 2.
 *
 *  Ce module ne fait que du rendu et du défilement. La carte reste pilotée
 *  par app.js : ici on se contente de la flouter et de la révéler.
 * ------------------------------------------------------------------ */
window.NK_SECTION1 = (function () {
  'use strict';

  const C = window.NK_CONCEPTS;

  function monter(root, onExplorer) {
    root.innerHTML = `
      <section class="s1-hero">
        <span class="s1-kicker">Atlas de l'exposome</span>
        <h1>Il y a des endroits où les enfants tombent malades ensemble.</h1>
        <p class="s1-chapo">Et il y a des raisons, à chaque fois différentes, pour lesquelles
          on n'en conclut rien.</p>
        <p class="s1-intro">Six clusters de cancers pédiatriques documentés, vingt-cinq autres
          signalements instruits par les autorités, et les cas que les familles recensent
          elles-mêmes quand personne ne le fait.</p>
        <div class="s1-scroll-hint">Faites défiler</div>
      </section>

      <div class="s1-concepts">
        ${C.map((c, i) => `
          <article class="concept" data-i="${i}">
            <div class="concept-num">${String(i + 1).padStart(2, '0')} / ${C.length}</div>
            <span class="concept-kicker">${c.kicker}</span>
            <h2>${c.titre}</h2>
            <div class="concept-resume">${c.resume}</div>
            <a class="concept-lien" href="concept.html?id=${c.id}">Creuser ce point →</a>
          </article>`).join('')}
      </div>

      <section class="s1-fin">
        <h2>La carte</h2>
        <p>Ce que ces concepts donnent une fois posés sur un territoire : les clusters
          documentés, les signalements instruits, et les témoignages reçus, regroupés par
          secteur pour qu'aucune famille ne soit localisable.</p>
        <div class="s1-cta">
          <button class="btn btn-accent" id="s1-explorer">Explorer la carte →</button>
          <a class="btn" href="participer.html">Signaler un cas</a>
        </div>
      </section>`;

    root.querySelector('#s1-explorer').addEventListener('click', onExplorer);

    /* Le flou de la carte se lève à mesure qu'on descend : elle est déjà là,
       en arrière-plan, avant d'occuper l'écran en section 2. */
    const cartes = document.getElementById('map-stage');
    const concepts = [...root.querySelectorAll('.concept')];

    function auDefilement() {
      const h = root.scrollHeight - root.clientHeight;
      const t = h > 0 ? Math.min(1, root.scrollTop / h) : 0;
      // 10 px de flou au départ, 2 px à la fin : la carte se devine de plus en plus
      cartes.style.setProperty('--tease', (10 - 8 * t).toFixed(1) + 'px');
      cartes.style.setProperty('--tease-op', (0.30 + 0.45 * t).toFixed(2));

      const ligne = root.clientHeight * 0.62;
      concepts.forEach(el => {
        const r = el.getBoundingClientRect();
        el.classList.toggle('vu', r.top < ligne && r.bottom > 0);
      });
    }

    root.addEventListener('scroll', auDefilement, { passive: true });
    auDefilement();
    return { auDefilement };
  }

  return { monter };
})();
