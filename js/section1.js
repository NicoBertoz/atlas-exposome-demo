/* ------------------------------------------------------------------ *
 *  section1.js — le déroulé narratif, première section de la page.
 *
 *  Flow du 28/07 : section 1 à scroller, résumés courts qui mènent chacun
 *  vers une page dédiée, et la carte teasée en arrière-plan avant
 *  d'apparaître en section 2.
 *
 *  Deux partis pris.
 *
 *  1. Le déroulé tient en deux écrans. Chaque point se lit en deux lignes ;
 *     les 200 mots sont sur sa page.
 *
 *  2. La carte n'est jamais masquée par de la transparence. Un fond de carte
 *     sombre à 20 % d'opacité sur un fond noir, ça ne donne rien de visible.
 *     Elle reste donc à pleine opacité, et c'est un VOILE posé par-dessus qui
 *     l'assombrit. Le voile se lève au défilement, la carte apparaît en entier,
 *     et le passage en plein écran se fait tout seul en fin de course — sans
 *     clic, sans changement de page.
 * ------------------------------------------------------------------ */
window.NK_SECTION1 = (function () {
  'use strict';

  const C = window.NK_CONCEPTS;

  /* L'argument en sept mots-clés. Même ordre que les concepts : le fil se lit
     d'un coup d'œil avant qu'on le déroule, et chaque maillon mène à sa page. */
  const FIL = [
    'Les agrégats existent',
    'Les enfants les révèlent',
    'La donnée est fermée',
    'Le doute est fabriqué',
    'Prouver reste difficile',
    'Les familles font bouger',
    'D\'où cette carte',
  ];

  /* Le voile et le flou tiennent pendant la lecture, puis tombent d'un coup
     sur le dernier tiers : on lit d'abord, on découvre la carte ensuite. */
  const DEBUT_LEVEE = 0.42;   // avant : rien ne bouge
  const FIN_LEVEE = 0.90;     // après : carte nette et sans voile
  const BASCULE = 0.985;      // plein écran

  function monter(root, onCarte) {
    const D = window.NK_DATA;
    const nHot = D.hotspots.features.filter(f => !f.properties.anonyme).length;

    root.innerHTML = `
      <section class="s1-hero">
        <span class="s1-kicker">Atlas de l'exposome</span>
        <h1>La cartographie écocitoyenne des maladies rares de l'enfant.</h1>
        <p class="s1-chapo">Des cancers et des malformations se concentrent à certains endroits.
          La donnée qui permettrait de le démontrer n'est pas publique. Alors nous la
          construisons.</p>
        <div class="s1-chiffres">
          <div><b>${nHot}</b><span>agrégats documentés</span></div>
          <div><b>${D.signalements.features.length}</b><span>autres investigations instruites</span></div>
          <div><b>${D.temoignages.features.length}</b><span>cas déclarés par des familles</span></div>
        </div>
        <div class="s1-hero-cta">
          <button class="btn btn-accent" data-carte>Ouvrir la carte →</button>
          <span class="s1-ou">ou suivez le raisonnement, sept points, deux minutes</span>
        </div>
      </section>

      <!-- Le fil : l'argument en une ligne, avant de le dérouler -->
      <nav class="s1-fil" aria-label="Le fil du raisonnement">
        ${FIL.map((etape, i) => `
          <a href="concept.html?id=${C[i].id}" class="fil-etape">
            <span class="fil-num">${String(i + 1).padStart(2, '0')}</span>${etape}
          </a>`).join('')}
      </nav>

      <div class="s1-grille">
        ${C.map((c, i) => `
          <a class="concept" href="concept.html?id=${c.id}" data-i="${i}">
            <span class="concept-kicker">${c.kicker}</span>
            <h2>${c.titre}</h2>
            <p>${c.teaser}</p>
            <span class="concept-lien">Creuser ce point →</span>
          </a>`).join('')}
      </div>

      <!-- Zone de révélation : rien à lire, la carte prend la place -->
      <section class="s1-reveal">
        <div class="s1-reveal-txt">
          <h2>Notre cartographie</h2>
          <p>Ce que l'État a instruit, et ce que les familles déclarent. Collecté à l'IRIS,
            publié par secteurs d'environ 25 km, à partir de trois cas. Jamais à l'adresse.</p>
        </div>
        <div class="s1-reveal-fin">
          <span class="s1-fleche">↓</span>
          <span class="s1-fin-txt">Continuez à défiler pour ouvrir la carte</span>
          <button class="btn btn-accent" data-carte>Ouvrir maintenant</button>
        </div>
      </section>`;

    /* Raccourci permanent, pour qui ne veut pas défiler du tout. */
    const pilule = document.createElement('button');
    pilule.id = 's1-pilule';
    pilule.innerHTML = '<span class="pt"></span>Voir la carte';
    pilule.addEventListener('click', onCarte);
    root.appendChild(pilule);

    root.querySelectorAll('[data-carte]').forEach(b => b.addEventListener('click', onCarte));

    const stage = document.getElementById('map-stage');
    const cartes = [...root.querySelectorAll('.concept')];
    const reveal = root.querySelector('.s1-reveal');
    let bascule = false;

    const entre = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

    function auDefilement() {
      const h = root.scrollHeight - root.clientHeight;
      const t = h > 0 ? Math.min(1, root.scrollTop / h) : 0;
      const l = entre(t, DEBUT_LEVEE, FIN_LEVEE);   // 0 pendant la lecture, 1 à la fin

      /* La carte garde son opacité : c'est le voile qui s'efface. Elle doit
         être reconnaissable comme carte dès le premier écran — donc un flou
         léger et un voile modéré, pas un aplat qui la fait disparaître. */
      stage.style.setProperty('--tease', (2.5 - 2.5 * l).toFixed(1) + 'px');
      root.style.setProperty('--voile', (0.42 - 0.42 * l).toFixed(3));
      reveal.style.setProperty('--net', l.toFixed(3));

      pilule.classList.toggle('on', root.scrollTop > 140 && l < 0.75);

      const ligne = root.clientHeight * 0.97;
      cartes.forEach(el => el.classList.toggle('vu', el.getBoundingClientRect().top < ligne));

      /* Fin de course : la carte est déjà nette et sans voile, il ne reste
         qu'à retirer le déroulé. La bascule ne se voit donc presque pas. */
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
