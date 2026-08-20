/* ------------------------------------------------------------------ *
 *  section1.js — le déroulé narratif, première section de la page.
 *
 *  Révision du 18/08, retours V2 de Philippine.
 *
 *  Trois changements de fond par rapport à la version précédente :
 *
 *  1. UNE PAGE DE TITRE COLORÉE, pleine hauteur, référence fluxlaboratory.
 *     Elle se retire au défilement et laisse la carte apparaître derrière
 *     le texte — c'est ce qui remplace « l'image abstraite qui devient
 *     carte », sans illustration à produire.
 *
 *  2. LE VRAI TEXTE, celui de Projet NK (voir recit.js), à la place des
 *     sept concepts écrits en atelier. Il se lit d'un trait.
 *
 *  3. LES INCISES. C'était la question posée : « trouver un truc pour lire
 *     les pop-ups, certains font 150 mots ». Une bulle au survol ne tient
 *     pas 150 mots, et elle est inutilisable au clavier comme au doigt.
 *     Chaque mot souligné est donc un BOUTON : au clic, l'incise s'ouvre
 *     dans la marge sur grand écran, juste sous le paragraphe sur petit
 *     écran. Une seule à la fois. Le mot reste marqué tant qu'elle est
 *     ouverte, et Échap referme.
 *
 *  La bibliographie suit le texte, repliée : dix-neuf références deroulées
 *  d'office alourdiraient la fin du déroulé pour rien.
 * ------------------------------------------------------------------ */
window.NK_SECTION1 = (function () {
  'use strict';

  const R = window.NK_RECIT;

  /* La carte se compose pendant la lecture du texte, pas pendant le titre. */
  const DEBUT_LEVEE = 0.22;
  const FIN_LEVEE = 0.90;
  const BASCULE = 0.985;

  /* {{mot|cle}} devient un bouton d'incise, [[3]] un appel de source. */
  function baliser(p) {
    return p
      .replace(/\{\{([^|]+)\|([^}]+)\}\}/g,
        (m, mot, cle) => `<button class="incise" data-incise="${cle}">${mot}</button>`)
      .replace(/\[\[(\d+)\]\]/g,
        (m, n) => `<button class="appel" data-source="${n}" aria-label="Source ${n}">${n}</button>`);
  }

  function monter(root, onCarte) {
    root.innerHTML = `
      <!-- Page de titre, pleine hauteur, en aplat de couleur -->
      <section class="s1-titre">
        <div class="s1-titre-in">
          <h1>Veille sanitaire participative des cancers pédiatriques</h1>
          <p class="s1-annonce">Ceci est une veille sanitaire participative en constante
            évolution. Les cas de cancers pédiatriques et les principaux clusters y sont
            répertoriés. Chaque personne touchée peut y prendre part en répondant à un
            questionnaire sur cette plateforme.</p>
          <div class="s1-titre-cta">
            <button class="lien-action" data-carte data-mot="Explorer la carte">Explorer la carte</button>
          </div>
        </div>
        <span class="s1-descendre">Ou lisez d'abord ↓</span>
      </section>

      <div class="s1-lecture">
        <div class="s1-colonne">
          <aside class="s1-exergue">
            <b>${R.EXERGUE.titre}</b>
            <p>${R.EXERGUE.texte}</p>
          </aside>

          ${R.TEXTE.map((p, i) => `<p class="s1-para" data-p="${i}">${baliser(p)}</p>`).join('')}

          <div class="s1-fin">
            <button class="btn btn-accent" data-carte>Explorer la carte →</button>
          </div>

          <!-- Bibliographie repliée, juste après le texte -->
          <section class="s1-biblio" id="s1-biblio">
            <button class="s1-biblio-tete" id="biblio-tete" aria-expanded="false" aria-controls="biblio-corps">
              <span>Bibliographie</span>
              <em>${R.SOURCES.length} références</em>
              <span class="chev" aria-hidden="true">▾</span>
            </button>
            <ol class="s1-biblio-corps" id="biblio-corps">
              ${R.SOURCES.map((s, i) => `<li id="src-${i + 1}">${s}</li>`).join('')}
            </ol>
          </section>
        </div>

        <!-- La marge où s'ouvrent les incises. Vide tant qu'on n'a rien ouvert. -->
        <aside class="s1-marge" id="s1-marge" aria-live="polite"></aside>
      </div>

      <div class="s1-reveal" aria-hidden="true"></div>`;

    root.querySelectorAll('[data-carte]').forEach(b => b.addEventListener('click', onCarte));

    /* ------------------------------------------------------ INCISES */
    const marge = root.querySelector('#s1-marge');
    let ouverte = null;

    function fermer() {
      if (ouverte) ouverte.classList.remove('on');
      ouverte = null;
      marge.innerHTML = '';
      root.querySelectorAll('.incise-inline').forEach(el => el.remove());
    }

    function ouvrir(bouton) {
      const cle = bouton.dataset.incise;
      const n = R.INCISES[cle];
      if (!n) return;
      const rouvre = ouverte === bouton;
      fermer();
      if (rouvre) return;                       // deuxième clic : on referme

      ouverte = bouton;
      bouton.classList.add('on');

      const html = `
        <div class="note">
          <button class="note-fermer" aria-label="Fermer l'incise">×</button>
          <b>${n.titre}</b>
          <div class="note-txt">${n.texte}</div>
          ${n.manque ? `<p class="note-manque">À écrire : ${n.manque}</p>` : ''}
          ${n.brouillon ? '<p class="note-etat">Incise encore à l\'état de brouillon.</p>' : ''}
        </div>`;

      if (window.matchMedia('(min-width: 1100px)').matches) {
        /* Grand écran : dans la marge, alignée sur le mot. */
        marge.innerHTML = html;
        const note = marge.firstElementChild;
        const haut = bouton.getBoundingClientRect().top - marge.getBoundingClientRect().top;
        note.style.transform = `translateY(${Math.max(0, haut)}px)`;
      } else {
        /* Petit écran : juste sous le paragraphe, dans le flux. */
        const para = bouton.closest('.s1-para');
        const bloc = document.createElement('div');
        bloc.className = 'incise-inline';
        bloc.innerHTML = html;
        para.after(bloc);
      }
      const fermeture = root.querySelector('.note-fermer');
      if (fermeture) fermeture.addEventListener('click', fermer);
    }

    root.addEventListener('click', ev => {
      const b = ev.target.closest('.incise');
      if (b) return ouvrir(b);
      /* Un appel de source déplie la bibliographie et va à la bonne ligne. */
      const s = ev.target.closest('.appel');
      if (s) {
        root.querySelector('#s1-biblio').classList.add('open');
        root.querySelector('#biblio-tete').setAttribute('aria-expanded', 'true');
        const li = root.querySelector('#src-' + s.dataset.source);
        if (li) {
          li.scrollIntoView({ block: 'center', behavior: 'smooth' });
          li.classList.add('vise');
          setTimeout(() => li.classList.remove('vise'), 2200);
        }
      }
    });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') fermer(); });

    /* -------------------------------------------------- BIBLIOGRAPHIE */
    const tete = root.querySelector('#biblio-tete');
    tete.addEventListener('click', () => {
      const on = root.querySelector('#s1-biblio').classList.toggle('open');
      tete.setAttribute('aria-expanded', on);
    });

    /* ---------------------------------------------------- DÉFILEMENT */
    const stage = document.getElementById('map-stage');
    const paras = [...root.querySelectorAll('.s1-para')];
    let bascule = false;

    const entre = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

    function auDefilement() {
      const h = root.scrollHeight - root.clientHeight;
      const t = h > 0 ? Math.min(1, root.scrollTop / h) : 0;
      const l = entre(t, DEBUT_LEVEE, FIN_LEVEE);

      stage.style.setProperty('--tease', (3 - 3 * l).toFixed(2) + 'px');
      stage.style.setProperty('--sat', (0.1 + 0.9 * l).toFixed(3));
      stage.style.setProperty('--carte-op', (0.12 + 0.88 * l).toFixed(3));
      root.style.setProperty('--voile', (1 - 0.3 * l).toFixed(3));

      /* Le paragraphe qu'on lit est à pleine encre, les autres s'estompent
         légèrement. Assez pour guider l'œil, pas assez pour gêner. */
      const milieu = root.clientHeight * 0.45;
      paras.forEach(el => {
        const r = el.getBoundingClientRect();
        el.classList.toggle('lu', r.top < milieu && r.bottom > 0);
      });

      /* Une incise ouverte dans la marge suit son mot. */
      const note = marge.firstElementChild;
      if (note && ouverte) {
        const haut = ouverte.getBoundingClientRect().top - marge.getBoundingClientRect().top;
        note.style.transform = `translateY(${Math.max(0, haut)}px)`;
      }

      if (t >= BASCULE && !bascule) { bascule = true; onCarte(); }
      if (t < BASCULE - 0.05) bascule = false;
    }

    root.addEventListener('scroll', auDefilement, { passive: true });
    window.addEventListener('resize', auDefilement);
    auDefilement();
    return { auDefilement, reset: () => { bascule = false; fermer(); root.scrollTop = 0; auDefilement(); } };
  }

  return { monter };
})();
