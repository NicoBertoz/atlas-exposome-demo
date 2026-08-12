/* ------------------------------------------------------------------ *
 *  recit.js — la section narrative, pilotée au défilement.
 *
 *  Chaque chapitre est un bloc de texte dans le panneau. Quand il entre dans
 *  la zone de lecture, sa fonction `scene` reconfigure la carte : couches
 *  visibles, cadrage, parfois une fiche ouverte. Le lecteur ne clique rien,
 *  il descend.
 *
 *  Le module ne connaît aucun moteur : il passe par l'API que app.js lui
 *  donne (`api.setLayers`, `api.fit`, `api.flyTo`, `api.showHotspot`…).
 * ------------------------------------------------------------------ */
window.NK_RECIT = (function () {
  'use strict';

  const D = window.NK_DATA;
  const hs = id => D.hotspots.features.find(f => f.properties.id === id).properties;
  const sig = nom => D.signalements.features.find(f => f.properties.nom.startsWith(nom));

  const CHAPITRES = [
    {
      num: '', titre: 'Il y a des endroits où les enfants tombent malades ensemble.',
      chapo: 'Et il y a des raisons, à chaque fois différentes, pour lesquelles on n\'en conclut rien.',
      texte: `<p>En France, environ 2 500 enfants apprennent chaque année qu'ils ont un cancer.
        Le plus souvent, personne ne saura pourquoi.</p>
        <p>Cette carte rassemble ce qui existe : les agrégats que l'État a instruits, ceux qu'il a
        écartés, et les cas que les familles recensent elles-mêmes quand personne ne le fait.</p>
        <p class="hint">Faites défiler.</p>`,
      scene: api => { api.setLayers({ zones: false, sig: false, temoins: false }); api.fitFrance(); },
    },
    {
      num: '01', titre: 'Ce que l\'État a instruit',
      texte: `<p>Vingt-cinq signalements d'agrégats de cancers pédiatriques ont fait l'objet d'une
        investigation officielle. La plupart n'ont jamais été médiatisés.</p>
        <p>Une habitante appelle l'ARS de <b>Pouilley-les-Vignes</b> un matin d'octobre 2012 :
        la cellule régionale est saisie le jour même. À <b>Saint-Philbert-en-Mauges</b>, c'est le
        maire. À <b>Preignac</b>, une institutrice.</p>
        <p>Chaque cercle creux est une enquête. Leur nombre dit quelque chose que le débat public
        ne dit pas : l'État en traite beaucoup, et le public ne le sait pas.</p>`,
      scene: api => { api.setLayers({ zones: false, sig: true, temoins: false }); api.fitFrance(); },
    },
    {
      num: '02', titre: 'Six d\'entre eux tiennent encore',
      texte: `<p>Six dossiers concentrent l'essentiel de ce qu'on peut dire aujourd'hui. Deux
        seulement sont des excès <b>officiellement confirmés et toujours suivis</b>.</p>
        <p>Les autres sont dans des états intermédiaires : reconnus puis refermés, contestés,
        judiciarisés, ou en cours d'enquête.</p>
        <p>Le rouge marque un excès confirmé. L'orange, un dossier où l'excès n'a pas été retenu,
        ou dont l'enquête n'est pas terminée.</p>`,
      scene: api => { api.setLayers({ zones: true, sig: true, temoins: false }); api.fitFrance(); },
    },
    {
      num: '03', titre: 'Sainte-Pazanne : quand ce sont les parents qui comptent',
      texte: `<p>Dix-neuf enfants de moins de 18 ans, entre 2015 et 2022, dans une poignée de
        communes du Pays de Retz. Santé publique France retient un <b>SIR de 2,27</b> : deux fois
        plus de cas qu'attendu.</p>
        <p>Le collectif <i>Stop aux Cancers de nos Enfants</i> en recense 25, dont 7 décès. Il a
        fait chercher 700 pesticides dans l'eau, à ses frais. Cinq puits ont été déclarés impropres.</p>
        <p>Conclusion officielle : agrégat compatible, <b>sans cause commune identifiée</b>.</p>`,
      scene: api => { api.setLayers({ zones: true, sig: false, temoins: false }); api.fit(hs('h1')); },
    },
    {
      num: '04', titre: 'Pont-de-l\'Arche : la maille décide',
      texte: `<p>Onze leucémies chez des moins de 15 ans, entre 2017 et 2019.</p>
        <p>À l'échelle de la <b>commune</b>, le rapport observé sur attendu vaut <b>6,4</b>. À
        l'échelle du <b>canton</b>, sur exactement les mêmes enfants, il tombe à <b>2,3</b>, et
        l'intervalle de confiance croise 1.</p>
        <p>L'hypothèse du hasard a été retenue. Le suivi s'est arrêté en septembre 2025.</p>
        <p>Rien n'a changé sauf le contour du calcul. C'est pour cela que le projet fixe sa maille
        d'avance, et l'écrit.</p>`,
      scene: api => { api.setLayers({ zones: true, sig: false, temoins: false }); api.fit(hs('h6')); },
    },
    {
      num: '05', titre: 'Preignac : l\'enquête qui échoue faute de mesure',
      texte: `<p>Neuf enfants malades pour 5,7 attendus, dans une commune viticole du Sauternais.
        Une école entourée de vignes.</p>
        <p>L'investigation n'a pas conclu. Non pas parce que le signal sanitaire était faible,
        mais parce qu'il <b>n'existait aucune mesure de pesticides dans l'air</b> à confronter.</p>
        <p>C'est la raison d'être d'un atlas de l'exposome : la moitié manquante de l'équation
        n'est pas la santé, c'est l'exposition.</p>`,
      scene: api => {
        api.setLayers({ zones: false, sig: true, temoins: false });
        const f = sig('Preignac');
        api.flyTo(f.geometry.coordinates[0], f.geometry.coordinates[1], 9);
      },
    },
    {
      num: '06', titre: 'Le secteur qu\'on ne peut pas vous montrer',
      texte: `<p>Mars 2026, rapport le plus récent du corpus : cinq enfants, une sur-incidence
        <b>explicitement confirmée</b>, dans six communes contiguës de l'est des Pays de la Loire.</p>
        <p>Lesquelles ? Le rapport ne le dit pas. Le secteur a été anonymisé au titre du RGPD.</p>
        <p>Le périmètre tireté ci-contre est indicatif : nous ne savons pas où c'est. Protéger
        cinq familles et permettre à un territoire de se savoir concerné sont deux exigences
        réelles, et elles s'opposent.</p>`,
      scene: api => { api.setLayers({ zones: true, sig: false, temoins: false }); api.fit(hs('anon')); },
    },
    {
      num: '07', titre: 'Alors nous, comment affichons-nous les familles ?',
      texte: `<p>Voici les témoignages reçus. Pas un par point : <b>par secteur</b>.</p>
        <p>Chaque tache couvre environ 25 km et n'apparaît qu'à partir de <b>trois cas</b>.
        En dessous du seuil, le secteur est fondu dans une maille plus large, ou pas affiché.
        Le centre de la tache est le centre de la maille, jamais celui des familles.</p>
        <p>Nous collectons à l'IRIS, environ 2 000 habitants, parce que sans cette finesse aucune
        analyse ne sera possible plus tard. Nous publions à 25 km, parce qu'un enfant malade dans
        un village ne doit pas être retrouvable depuis un navigateur.</p>`,
      scene: api => { api.setLayers({ zones: true, sig: false, temoins: true }); api.fitFrance(); },
    },
    {
      num: '08', titre: 'Ce qui manque, c\'est vous',
      texte: `<p>À Noyelles-Godault, l'invitation institutionnelle a touché 91 % des enfants
        concernés. <b>24 % ont participé.</b> La confiance ne se décrète pas.</p>
        <p>Un recensement citoyen ne prouve rien à lui seul. Il indique où regarder, et il oblige
        à regarder. Les collectifs de Sainte-Pazanne, de la plaine d'Aunis et du Haut-Jura l'ont
        démontré : ce sont eux qui ont fait bouger les périmètres officiels.</p>
        <p class="cta-block">
          <a class="btn btn-accent" href="questionnaire.html">Signaler un cas →</a>
          <button class="btn" data-goto-explore>Explorer la carte librement</button>
        </p>`,
      scene: api => { api.setLayers({ zones: true, sig: true, temoins: true }); api.fitFrance(); },
    },
  ];

  function monter(root, api) {
    root.innerHTML = CHAPITRES.map((c, i) => `
      <section class="chap" data-chap="${i}">
        ${c.num ? `<span class="chap-num">${c.num}</span>` : '<span class="chap-kicker">Atlas de l\'exposome</span>'}
        <h2 class="chap-titre">${c.titre}</h2>
        ${c.chapo ? `<p class="chap-chapo">${c.chapo}</p>` : ''}
        <div class="chap-texte">${c.texte}</div>
      </section>`).join('') +
      '<div class="chap-fin">Fin du récit. Le mode « Explorer » ouvre les filtres et la carte complète.</div>';

    /* Un chapitre devient actif quand son texte franchit la ligne de lecture,
       au tiers haut du panneau. On calcule au défilement plutôt qu'avec un
       IntersectionObserver : celui-ci ne se déclenche qu'au rendu, et reste
       muet dans un onglet non peint (aperçus, tests, arrière-plan).
       Une scène déjà en place n'est pas rejouée, sinon les allers-retours de
       scroll relanceraient les animations de caméra en boucle. */
    const scroller = document.getElementById('panel-scroll');
    const chaps = [...root.querySelectorAll('.chap')];
    let actif = -1;

    function majuscule() {
      const ligne = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.34;
      let i = 0;
      chaps.forEach((el, k) => { if (el.getBoundingClientRect().top <= ligne) i = k; });
      if (i === actif) return;
      actif = i;
      chaps.forEach((el, k) => el.classList.toggle('on', k === i));
      CHAPITRES[i].scene(api);
    }

    scroller.addEventListener('scroll', majuscule, { passive: true });
    window.addEventListener('resize', majuscule);
    majuscule();
    return { rejouer: () => { actif = -1; majuscule(); } };
  }

  return { CHAPITRES, monter };
})();
