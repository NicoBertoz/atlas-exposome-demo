/* ------------------------------------------------------------------ *
 *  section1.js — le déroulé narratif, première section de la page.
 *
 *  Refonte du 18/08/2026. Les quatre relectures convergeaient sur le même
 *  point, avec des mots différents : la grille de blocs numérotés était du
 *  bruit visuel, et on perdait le lecteur. Elle est remplacée par UNE
 *  COLONNE VERTICALE, aérée, sur fond blanc.
 *
 *  Quatre partis pris, chacun issu d'une remarque :
 *
 *  1. La landing est une page de titre. Un titre, un paragraphe qui annonce
 *     la couleur, et un lien discret vers la carte — pas un bouton de plus.
 *     (Nico : « réduire à tagline + 1-liner » ; Philippine : « page de titre ».)
 *
 *  2. Le fil en sept maillons et les sept blocs sous lui étaient la même
 *     chose dite deux fois. Ils sont fusionnés : un temps = un numéro, un
 *     titre, deux lignes, un lien. (Nico.)
 *
 *  3. Chaque temps est gris tant qu'on ne l'a pas atteint, et prend l'encre
 *     au passage. C'est ce qui remplace l'animation d'apparition, qui faisait
 *     sauter la page. (Fau : « grisé puis qui se colore au fil du scroll ».)
 *
 *  4. Le septième temps prend toute la largeur et remplace l'ancien encadré
 *     « Notre cartographie », qui était transparent et illisible. (Nico, Lila.)
 *
 *  La carte, elle, se compose derrière la lecture : presque invisible et
 *  désaturée au début, nette et colorée à l'arrivée. C'est le « l'image
 *  abstraite se transforme progressivement en carte » de Philippine, obtenu
 *  avec le fond de carte lui-même plutôt qu'avec une illustration à produire.
 * ------------------------------------------------------------------ */
window.NK_SECTION1 = (function () {
  'use strict';

  const C = window.NK_CONCEPTS;

  /* Le voile tient pendant la lecture du titre, puis la carte se compose sur
     toute la longueur du déroulé. On lit et on voit la carte se construire. */
  const DEBUT_LEVEE = 0.18;
  const FIN_LEVEE = 0.88;
  const BASCULE = 0.97;   // plein écran, tout à la fin de la course

  function monter(root, onCarte) {
    root.innerHTML = `
      <section class="s1-hero">
        <h1>Veille sanitaire participative des cancers pédiatriques</h1>
        <p class="s1-annonce">Ceci est une veille sanitaire participative, en constante
          évolution. Les cas de cancers pédiatriques et les principales concentrations de cas
          y sont répertoriés. Les données sont obtenues par un questionnaire construit avec des
          scientifiques, auquel chaque personne touchée peut répondre.</p>
        <div class="s1-hero-cta">
          <button class="lien-action" data-carte data-mot="Accéder à la carte">Accéder à la carte</button>
        </div>
        <span class="s1-descendre">Ou lisez d'abord — sept points, deux minutes ↓</span>
      </section>

      <div class="s1-deroule">
        ${C.map((c, i) => `
          <a class="s1-temps" href="concept.html?id=${c.id}" data-i="${i}">
            <span class="s1-temps-num">${String(i + 1).padStart(2, '0')} · ${c.kicker.split('· ')[1] || c.kicker}</span>
            <h2>${c.titre}</h2>
            <p>${c.teaser}</p>
            <span class="s1-temps-lien" data-mot="Lire ce point">Lire ce point →</span>
          </a>`).join('')}
      </div>

      <!-- Le dernier temps, pleine largeur : il annonce la carte et remplace
           l'ancien encadré « Notre cartographie ». -->
      <section class="s1-final">
        <h2>Voilà pourquoi nous faisons cette carte</h2>
        <p>Ce que l'État a enquêté, et ce que les familles racontent, sur le même fond.
          Les adresses ne sont jamais publiées : elles sont regroupées par secteurs,
          et un secteur n'apparaît qu'à partir de plusieurs cas.</p>
        <button class="btn btn-accent" data-carte>Ouvrir la carte →</button>
      </section>

      <div class="s1-reveal" aria-hidden="true"></div>`;

    /* Raccourci permanent, pour qui ne veut pas défiler du tout. */
    const pilule = document.createElement('button');
    pilule.id = 's1-pilule';
    pilule.textContent = 'Accéder à la carte →';
    pilule.addEventListener('click', onCarte);
    root.appendChild(pilule);

    root.querySelectorAll('[data-carte]').forEach(b => b.addEventListener('click', onCarte));

    const stage = document.getElementById('map-stage');
    const temps = [...root.querySelectorAll('.s1-temps')];
    let bascule = false;

    const entre = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

    function auDefilement() {
      const h = root.scrollHeight - root.clientHeight;
      const t = h > 0 ? Math.min(1, root.scrollTop / h) : 0;
      const l = entre(t, DEBUT_LEVEE, FIN_LEVEE);

      /* La carte se compose : elle sort du blanc, se désatures moins, et se
         dénette. Trois réglages sur le même curseur — pas un fondu d'opacité
         seul, qui donne un gris sale plutôt qu'une carte qui apparaît. */
      stage.style.setProperty('--tease', (3 - 3 * l).toFixed(2) + 'px');
      stage.style.setProperty('--sat', (0.1 + 0.9 * l).toFixed(3));
      stage.style.setProperty('--carte-op', (0.16 + 0.84 * l).toFixed(3));
      root.style.setProperty('--voile', (1 - 0.34 * l).toFixed(3));

      pilule.classList.toggle('on', root.scrollTop > 200 && l < 0.8);

      const ligne = root.clientHeight * 0.82;
      temps.forEach(el => el.classList.toggle('vu', el.getBoundingClientRect().top < ligne));

      if (t >= BASCULE && !bascule) { bascule = true; onCarte(); }
      if (t < BASCULE - 0.05) bascule = false;
    }

    root.addEventListener('scroll', auDefilement, { passive: true });
    window.addEventListener('resize', auDefilement);
    auDefilement();
    return { auDefilement, reset: () => { bascule = false; root.scrollTop = 0; auDefilement(); } };
  }

  return { monter };
})();
