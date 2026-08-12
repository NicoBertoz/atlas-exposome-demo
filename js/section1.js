/* ------------------------------------------------------------------ *
 *  section1.js — le déroulé narratif, première section de la page.
 *
 *  Flow du 28/07 : section 1 à scroller, résumés courts qui mènent chacun
 *  vers une page dédiée, et la carte teasée en arrière-plan avant
 *  d'apparaître en section 2.
 *
 *  Parti pris : le déroulé tient en deux écrans. Chaque concept se lit en
 *  deux lignes ; les 200 mots sont sur sa page. Personne ne doit avoir à
 *  lire huit paragraphes avant d'atteindre la carte.
 *
 *  Trois chemins vers la carte, du plus rapide au plus lent :
 *    1. « Carte » dans la barre du haut, disponible dès la première seconde
 *    2. une pastille flottante qui apparaît dès qu'on commence à défiler
 *    3. la fenêtre de carte en fin de déroulé, qui se dévoile au défilement
 * ------------------------------------------------------------------ */
window.NK_SECTION1 = (function () {
  'use strict';

  const C = window.NK_CONCEPTS;

  function monter(root, onCarte) {
    const D = window.NK_DATA;
    const nHot = D.hotspots.features.filter(f => !f.properties.anonyme).length;

    root.innerHTML = `
      <section class="s1-hero">
        <span class="s1-kicker">Atlas de l'exposome</span>
        <h1>Il y a des endroits où les enfants tombent malades ensemble.</h1>
        <p class="s1-chapo">Et il y a des raisons, à chaque fois différentes, pour lesquelles
          on n'en conclut rien.</p>
        <div class="s1-chiffres">
          <div><b>${nHot}</b><span>clusters documentés</span></div>
          <div><b>${D.signalements.features.length}</b><span>autres signalements instruits</span></div>
          <div><b>${D.temoignages.features.length}</b><span>témoignages reçus</span></div>
        </div>
        <div class="s1-hero-cta">
          <button class="btn btn-accent" data-carte>Ouvrir la carte →</button>
          <span class="s1-ou">ou lisez d'abord, huit points, deux minutes</span>
        </div>
      </section>

      <div class="s1-grille">
        ${C.map((c, i) => `
          <a class="concept" href="concept.html?id=${c.id}" data-i="${i}">
            <span class="concept-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="concept-kicker">${c.kicker}</span>
            <h2>${c.titre}</h2>
            <p>${c.teaser}</p>
            <span class="concept-lien">Creuser ce point →</span>
          </a>`).join('')}
      </div>

      <section class="s1-carte">
        <div class="s1-carte-cadre">
          <div class="s1-carte-txt">
            <h2>La carte</h2>
            <p>Les clusters documentés, les signalements instruits, et les témoignages reçus,
              regroupés par secteur pour qu'aucune famille ne soit localisable.</p>
            <div class="s1-cta">
              <button class="btn btn-accent" data-carte>Ouvrir la carte en grand →</button>
              <a class="btn" href="participer.html">Signaler un cas</a>
            </div>
          </div>
        </div>
      </section>`;

    /* Pastille flottante : le raccourci permanent vers la carte. Elle
       n'apparaît qu'une fois le défilement engagé, pour ne pas encombrer
       le premier écran qui porte déjà son propre bouton. */
    const pilule = document.createElement('button');
    pilule.id = 's1-pilule';
    pilule.innerHTML = '<span class="pt"></span>Voir la carte';
    pilule.addEventListener('click', onCarte);
    root.appendChild(pilule);

    root.querySelectorAll('[data-carte]').forEach(b => b.addEventListener('click', onCarte));

    const stage = document.getElementById('map-stage');
    const cartes = [...root.querySelectorAll('.concept')];
    const fin = root.querySelector('.s1-carte');

    function auDefilement() {
      const h = root.scrollHeight - root.clientHeight;
      const t = h > 0 ? Math.min(1, root.scrollTop / h) : 0;

      /* La carte se dévoile progressivement : 12 px de flou au départ, net à
         l'arrivée, et le voile sombre s'efface en même temps. Arrivé en bas,
         on regarde déjà la carte, il ne reste qu'à l'ouvrir. */
      stage.style.setProperty('--tease', (12 - 12 * t).toFixed(1) + 'px');
      stage.style.setProperty('--tease-op', (0.22 + 0.78 * t).toFixed(2));
      root.style.setProperty('--voile', (0.94 - 0.55 * t).toFixed(2));

      pilule.classList.toggle('on', root.scrollTop > 120 && t < 0.94);

      const ligne = root.clientHeight * 0.97;
      cartes.forEach(el => el.classList.toggle('vu', el.getBoundingClientRect().top < ligne));
      fin.classList.toggle('vu', fin.getBoundingClientRect().top < root.clientHeight * 0.9);
    }

    root.addEventListener('scroll', auDefilement, { passive: true });
    window.addEventListener('resize', auDefilement);
    auDefilement();
    return { auDefilement };
  }

  return { monter };
})();
