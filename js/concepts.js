/* ------------------------------------------------------------------ *
 *  concepts.js — la matière du déroulé.
 *
 *  Ce n'est pas une liste de sujets : c'est UN ARGUMENT, en sept temps,
 *  et l'ordre porte la démonstration.
 *
 *    01  des agrégats existent, et on sait les nommer
 *    02  les enfants sont les premiers à les révéler
 *    03  la donnée qui permettrait de les voir n'est pas publique
 *    04  cette opacité arrange des intérêts, et ça se documente
 *    05  prouver un lien reste réellement difficile, sans mauvaise foi
 *    06  ce qui a fait bouger les lignes, ce sont les familles
 *    07  d'où cette cartographie écocitoyenne
 *
 *  Chaque entrée porte trois longueurs :
 *    teaser   deux lignes, ce qui s'affiche dans le déroulé
 *    resume   ~200 mots, rappelé en tête de la page dédiée
 *    page     le développement, avec ses sources
 *
 *  Vocabulaire : on emploie les termes du dossier et ceux de la santé
 *  publique — agrégat spatio-temporel, surincidence, SIR, registre, IRIS,
 *  pathologie sentinelle, exposome — plutôt que des approximations. Un
 *  « pic local » s'appelle un agrégat, et le mot a une définition.
 *
 *  Les chiffres viennent du classeur « Projet NK - Document central »
 *  (rapports Santé publique France, registres, presse).
 * ------------------------------------------------------------------ */
window.NK_CONCEPTS = [
  {
    id: 'agregats',
    teaser: `Quand des cas se concentrent dans un même lieu et un même temps, ça porte un nom : un agrégat spatio-temporel. La France en a instruit des dizaines.`,
    kicker: '01 · Le constat',
    titre: 'Les agrégats existent, et ils ont un nom',
    resume: `<p>Quand plusieurs cas d'une même maladie rare se concentrent dans un même lieu et
      une même période, on parle d'un <b>agrégat spatio-temporel</b>. Ce n'est pas une intuition
      de riverain : c'est une notion d'épidémiologie, avec une méthode et un seuil.</p>
      <p>On la mesure par un <b>SIR</b>, le rapport entre les cas observés et les cas attendus
      pour une population comparable. À Aniche, dans le Nord, il vaut 5,61 : près de six fois
      plus de leucémies de l'enfant qu'attendu. À Sainte-Pazanne, 2,27.</p>
      <p>Trente et une investigations de ce type ont été menées en France sur des maladies rares
      de l'enfant. La plupart n'ont jamais fait l'objet d'un article de presse.</p>`,
    page: [
      { h: 'Ce qu\'est un agrégat, précisément',
        p: `Une concentration de cas dans l'espace et dans le temps, supérieure à ce qu'on
            attendrait du hasard pour une population de même taille et de même structure d'âge.
            La comparaison se fait contre une référence nationale ou régionale, et le résultat
            s'exprime en ratio standardisé d'incidence, le SIR, assorti d'un intervalle de
            confiance. Si cet intervalle croise 1, on ne peut pas exclure le hasard.` },
      { h: 'Qui les instruit',
        p: `En France, Santé publique France et ses cellules régionales. Le signalement peut
            venir d'un parent, d'un médecin, d'un maire, ou d'un registre. Une investigation
            produit un rapport public. Elle ne cherche pas de cause : établir une causalité
            demande une étude étiologique, plus longue et plus chère, rarement financée.` },
      { h: 'Combien, et lesquels',
        p: `Le corpus rassemblé pour ce projet compte 31 entrées documentées, dont 18 mises en
            avant sur la carte. Deux seulement sont des excès officiellement confirmés et
            toujours suivis. Les autres ont été refermés, contestés, judiciarisés, ou attendent
            encore une conclusion.` },
    ],
    sources: [
      { l: 'Investigation d\'un agrégat d\'hémopathies à Aniche (SpF)',
        u: 'https://www.santepubliquefrance.fr/regions-et-territoires/hauts-de-france/rapportsynthese/investigation-dune-suspicion-dagregat-dhemopathies-malignes-et-de-lymphomes-a-aniche-nord-1984-2006' },
      { l: 'Distribution géographique des cancers pédiatriques en Loire-Atlantique (SpF)',
        u: 'https://www.santepubliquefrance.fr/regions-et-territoires/pays-de-la-loire/enquetesetudes/etude-de-la-distribution-geographique-des-cancers-pediatriques-en-loire-atlantique-entre-2005-et' },
    ],
  },

  {
    id: 'enfants-sentinelles',
    teaser: `Un enfant n'a pas fumé, pas travaillé en usine, pas accumulé quarante ans d'habitudes. Chez lui, la liste des causes possibles est courte.`,
    kicker: '02 · Pourquoi les enfants',
    titre: 'Les enfants sont des pathologies sentinelles',
    resume: `<p>Environ 2 500 enfants apprennent chaque année en France qu'ils ont un cancer.
      Le plus souvent, personne ne saura pourquoi.</p>
      <p>Chez un adulte, une maladie se lit à travers des décennies d'expositions cumulées, et la
      part attribuable à un facteur précis devient presque impossible à isoler. Chez un enfant de
      six ans, cette accumulation n'existe pas : les <b>fenêtres d'exposition</b> qui comptent sont
      courtes et identifiables, la grossesse et les premières années.</p>
      <p>C'est ce qui fait des cancers pédiatriques et de certaines malformations congénitales des
      <b>pathologies sentinelles</b> : elles apparaissent avant les maladies lentes, et là où
      l'environnement a quelque chose à dire. L'hypospadias, la cryptorchidie, les agénésies de
      membre ne tuent pas. Elles indiquent.</p>`,
    page: [
      { h: 'Les trois cancers qui dominent les effectifs',
        p: `Leucémies aiguës, tumeurs du système nerveux central, lymphomes. Ce sont les trois
            que la carte distingue par la couleur, parce que ce sont ceux qu'un recensement
            participatif a une chance de faire remonter en nombre suffisant.` },
      { h: 'Les malformations qui servent d\'indicateur',
        p: `Moins graves mais plus fréquentes, elles réagissent à des expositions hormonales
            pendant la grossesse. En 2021, Santé publique France a identifié 24 agrégats de
            cryptorchidie opérée en métropole, sur 91 400 cas. Le principal, autour de Lens,
            compte 1 244 cas pour un excès de 453, dans un bassin marqué par l'activité minière
            et métallurgique.` },
      { h: 'La notion d\'exposome',
        p: `L'ensemble des expositions environnementales subies au cours d'une vie, depuis la
            conception : chimiques, physiques, sociales. C'est le pendant de la génétique, et
            c'est ce que ce projet cherche à cartographier — d'où son nom.` },
    ],
    sources: [
      { l: 'Variations spatiotemporelles du risque de cryptorchidies opérées en France (SpF, 2021)',
        u: 'http://www.santepubliquefrance.fr/exposition-a-des-substances-chimiques/perturbateurs-endocriniens/enquetesetudes/variations-spatiotemporelles-du-risque-de-cryptorchidies-operees-en-france-et-hypotheses' },
    ],
  },

  {
    id: 'donnee-fermee',
    teaser: `Mars 2026 : une surincidence confirmée dans six communes. Lesquelles ? Le rapport ne le dit pas. Le secteur a été anonymisé.`,
    kicker: '03 · L\'obstacle',
    titre: 'La donnée existe, elle n\'est pas publique',
    resume: `<p>Le rapport le plus récent du corpus, publié en mars 2026, confirme une
      <b>surincidence</b> d'hémopathies malignes chez cinq enfants, dans six communes contiguës de
      l'est des Pays de la Loire. Lesquelles ? Le document ne le dit pas : le secteur a été
      anonymisé au titre du RGPD.</p>
      <p>Le reste n'est pas caché, il est simplement illisible. Les registres de cancers de
      l'enfant et de malformations existent, leurs données sont de qualité, mais leur accès passe
      par des procédures longues et leur financement est fragile — REMERA, le registre qui a
      signalé les agénésies de l'Ain, est en grande difficulté.</p>
      <p>Protéger cinq familles et permettre à un territoire de se savoir concerné sont deux
      exigences réelles, et elles s'opposent. Ce projet ne prétend pas les réconcilier. Il rend
      lisible ce qui est déjà public, et dit précisément ce qu'il masque.</p>`,
    page: [
      { h: 'Ce que le RGPD protège, et ce qu\'il empêche',
        p: `Une donnée de santé est sensible. À l'échelle de six communes rurales et de cinq
            enfants, publier le périmètre reviendrait souvent à désigner des familles.
            L'anonymisation est justifiée. Elle a un coût : le territoire concerné ne peut pas
            se saisir de son propre dossier.` },
      { h: 'Les registres, et leur fragilité',
        p: `Le Registre national des cancers de l'enfant couvre tout le territoire. Les registres
            de malformations, eux, sont régionaux et inégalement répartis : REMERA en
            Rhône-Alpes, ReMaBreizh en Bretagne, et de larges zones sans couverture. Un signal
            n'existe que là où quelqu'un enregistre.` },
      { h: 'Le volume invisible',
        p: `Trente et une investigations documentées, et trois ou quatre noms retenus par le
            débat public. Amnéville et Aniche, deux excès officiellement confirmés, n'ont jamais
            été médiatisés. Ce n'est pas un secret : c'est un défaut de mise en visibilité, et
            c'est exactement ce qu'une carte peut corriger.` },
    ],
    sources: [
      { l: 'Agrégat d\'hémopathies malignes, est des Pays de la Loire (SpF, mars 2026)',
        u: 'https://www.santepubliquefrance.fr/sites/default/files/cadic_files/documents/spf00006517.pdf' },
      { l: 'Agrégat d\'agénésies transverses, REMERA',
        u: 'https://www.remera.fr/wp-content/uploads/2017/07/agr%C3%A9gat-ag%C3%A9n%C3%A9sie-membres.pdf' },
    ],
  },

  {
    id: 'interets',
    teaser: `Quarante-cinq plaintes classées faute de pouvoir distinguer l'origine industrielle de l'origine naturelle des métaux. L'argument est recevable, et il est utilisé.`,
    kicker: '04 · À qui profite l\'opacité',
    titre: 'Le doute est un produit, et il a des fabricants',
    resume: `<p>Autour des anciennes mines de Saint-Félix-de-Pallières, dans le Gard, 651
      volontaires ont été testés : 22 % au-dessus de la référence pour l'arsenic. Quarante-cinq
      plaintes pénales ont été déposées en 2016. <b>Toutes classées en 2020</b>, au motif qu'on ne
      pouvait pas distinguer l'origine industrielle de l'origine naturelle des métaux.</p>
      <p>Le <b>fond géochimique naturel</b> est un argument scientifiquement recevable. Le
      distinguer d'un apport industriel demande des analyses isotopiques coûteuses. En leur
      absence, le doute profite à qui conteste, et l'absence de mesure devient une position
      confortable.</p>
      <p>Ce projet ne désigne aucune entreprise. Il documente un mécanisme : là où la donnée
      d'exposition manque, l'enquête s'arrête — et cette donnée manque rarement par hasard.</p>`,
    page: [
      { h: 'Le mécanisme, sans procès d\'intention',
        p: `Il ne s'agit pas d'affirmer que des acteurs suppriment des données. Il s'agit de
            constater que l'évaluation du risque repose sur des mesures, que produire ces mesures
            coûte cher, et que personne n'a d'obligation de les produire rétrospectivement. Le
            résultat est le même qu'un choix délibéré : l'enquête bute sur un vide.` },
      { h: 'Ce que le classement de Saint-Félix a établi',
        p: `Pas l'absence de contamination : l'impossibilité, faute d'analyses, d'en attribuer
            l'origine. La nuance est décisive, et elle sera opposée à ce projet — sur les métaux
            d'abord, sur les pesticides ensuite.` },
      { h: 'Les procédures en cours',
        p: `Elles existent et sont publiques. Le tribunal administratif de Montpellier a condamné
            l'État en juillet 2025 dans la vallée de l'Orbiel, avant appel. À Franconville, une
            plainte avec constitution de partie civile pour homicide involontaire a été déposée
            le 1er juillet 2026. La carte les signale comme des faits de procédure, sans en tirer
            de conclusion sanitaire.` },
      { h: 'La règle que le projet s\'impose',
        p: `Aucune entreprise n'est nommée sur la carte, et les témoignages sont relus pour en
            retirer les mises en cause nominatives. Ce n'est pas de la prudence excessive : une
            carte attaquable sur ce terrain perd sa valeur d'alerte.` },
    ],
    sources: [
      { l: 'Anciens sites miniers de Carnoulès et la Croix de Pallières (SpF)',
        u: 'https://www.santepubliquefrance.fr/presse/anciens-sites-miniers-de-carnoules-et-la-croix-de-pallieres' },
      { l: 'Vallée de l\'Orbiel, condamnation de l\'État (FNE)',
        u: 'https://fne.asso.fr/actualites/salsigne-la-vallee-de-l-arsenic-un-scandale-d-etat' },
    ],
  },

  {
    id: 'difficulte',
    teaser: `À Preignac, l'enquête n'a pas échoué sur le signal sanitaire : il n'existait aucune mesure de pesticides dans l'air à lui opposer.`,
    kicker: '05 · L\'honnêteté du doute',
    titre: 'Établir un lien reste réellement difficile',
    resume: `<p>Tout n'est pas une affaire d'intérêts. Prouver qu'une exposition a causé une
      maladie est intrinsèquement difficile, et il faut le dire.</p>
      <p>À <b>Preignac</b>, commune viticole de Gironde, neuf enfants malades pour 5,7 attendus,
      une école entourée de vignes. L'investigation n'a pas conclu — non pas parce que le signal
      était faible, mais parce qu'il <b>n'existait aucune mesure de pesticides dans l'air</b> à
      lui confronter.</p>
      <p>S'ajoute l'<b>effet cocktail</b> : chaque substance est évaluée seule, personne ne vit
      exposé à une seule substance, et aucun protocole ne teste les mélanges réels. Un territoire
      peut être conforme, substance par substance, et rester un mauvais endroit où grandir.</p>
      <p>Enfin la <b>maille</b> décide : à Pont-de-l'Arche, le rapport observé sur attendu vaut
      6,4 à la commune et 2,3 au canton, sur exactement les mêmes enfants.</p>`,
    page: [
      { h: 'La moitié manquante de l\'équation',
        p: `Une investigation d'agrégat a besoin de deux moitiés : les cas, et l'exposition. Les
            cas sont enregistrés par des registres. Les expositions sont dispersées entre des
            bases qui ne se parlent pas, et souvent inexistantes rétrospectivement. Quand la
            seconde moitié manque, l'absence de preuve se lit comme une preuve d'absence.` },
      { h: 'L\'effet cocktail, et pourquoi il échappe au calcul',
        p: `Tester dix substances deux à deux, c'est quarante-cinq expériences. Cent substances
            par groupes de trois, plus de cent soixante mille. Aucun programme ne peut couvrir
            l'espace des mélanges réels. Les perturbateurs endocriniens aggravent le problème :
            leur effet ne suit pas toujours la dose et dépend surtout du moment de l'exposition.` },
      { h: 'Le problème de la maille',
        p: `Il porte un nom en géographie, le MAUP — modifiable areal unit problem. Un même semis
            de points produit des statistiques différentes selon le découpage employé. Ce n'est
            pas une erreur de mesure, c'est une propriété du découpage. D'où la règle du projet :
            annoncer sa maille avant de montrer ses résultats, et ne pas en changer.` },
      { h: 'Association, pas causalité',
        p: `Ce que la carte affiche, ce sont des associations spatiales. Rien de plus, et elle le
            répète sur chaque fiche. Cela n'implique pas l'inaction : comme le rappelaient Smith
            et Pell à propos des parachutes, l'absence d'essai contrôlé ne démontre pas l'absence
            d'effet.` },
    ],
    sources: [
      { l: 'Agrégat de cancers pédiatriques dans une commune viticole de Gironde (SpF, 2013)',
        u: 'https://www.santepubliquefrance.fr/determinants-de-sante/exposition-a-des-substances-chimiques/pesticides/documents/rapport-synthese/investigation-d-une-suspicion-d-agregat-de-cancers-pediatriques-dans-une-commune-viticole-de-gironde.-juin-2013' },
      { l: 'Bilan de surveillance du cluster de Pont-de-l\'Arche (SpF, 2025)',
        u: 'https://www.santepubliquefrance.fr/regions-et-territoires/normandie/enquetesetudes/bilan-de-surveillance-post-investigation-du-cluster-de-leucemies-pediatriques-dans-le-secteur-de' },
    ],
  },

  {
    id: 'pression',
    teaser: `Sept cents pesticides cherchés dans l'eau, payés par un collectif de parents. Cinq puits déclarés impropres. Ce sont les familles qui ont fait bouger les périmètres.`,
    kicker: '06 · Le rapport de force',
    titre: 'Ce qui a fait bouger les lignes, ce sont les familles',
    resume: `<p>À Sainte-Pazanne, le collectif <i>Stop aux Cancers de nos Enfants</i> a fait
      chercher <b>700 pesticides dans l'eau</b>, à ses frais. Cinq puits ont été déclarés impropres.
      À Guidel, le contre-recensement des familles a <b>forcé l'élargissement du périmètre
      officiel</b>. Dans la vallée de l'Orbiel, ce sont les parents qui ont payé les premières
      analyses, et l'État a fini par être condamné.</p>
      <p>À l'inverse, à Noyelles-Godault, un dépistage institutionnel a touché 91 % des enfants
      concernés. <b>24 % ont participé.</b> La confiance ne se décrète pas, et une invitation
      officielle ne suffit pas à la produire.</p>
      <p>Le levier qui fonctionne n'est donc pas la preuve : c'est le fait de compter,
      publiquement, jusqu'à ce qu'il devienne coûteux de ne pas regarder.</p>`,
    page: [
      { h: 'Ce que les collectifs ont obtenu, concrètement',
        p: `À Vincennes, la fermeture de l'école, sa dépollution et quatorze ans de surveillance
            — malgré une conclusion officielle de hasard. À Guidel, l'élargissement du périmètre
            d'investigation. En Charente-Maritime, une étude d'État, EXPOSCAN, lancée sur
            2026-2028. Aucun de ces dossiers n'a « prouvé » quoi que ce soit au sens strict.` },
      { h: 'Pourquoi l\'institution seule n\'y arrive pas',
        p: `Elle instruit à la demande, cas par cas, sans moyens d'étude étiologique, et publie
            des rapports que personne ne lit. Elle n'a ni mandat ni budget pour construire la
            couche d'exposition qui manque. Ce n'est pas de la mauvaise volonté, c'est un
            dispositif calibré pour répondre, pas pour chercher.` },
      { h: 'Ce qu\'une pression citoyenne peut viser',
        p: `Trois demandes précises et atteignables : que les registres soient financés et
            étendus, que les mesures d'exposition soient produites et ouvertes, et que les
            investigations d'agrégat débouchent sur des études étiologiques quand le signal est
            confirmé.` },
    ],
    sources: [
      { l: 'Analyse épidémiologique des plombémies, Noyelles-Godault (SpF, 2022)',
        u: 'https://www.actu-environnement.com/media/pdf/news-41945-synthese-sante-publique-france-analyse-epidemiologique-saturnisme-plombemie.pdf' },
      { l: 'Trois nouveaux foyers identifiés en Charente-Maritime (ici)',
        u: 'https://www.ici.fr/emissions/l-info-d-ici-ici-la-rochelle/trois-nouveaux-foyers-de-cancers-pediatriques-ont-ete-identifies-en-charente-maritime-4617726' },
    ],
  },

  {
    id: 'cartographie-ecocitoyenne',
    teaser: `D'où cette carte : ce que l'État a instruit, et ce que les familles déclarent. Collectée à l'IRIS, publiée par secteurs de 25 km, jamais à l'adresse.`,
    kicker: '07 · Ce qu\'on construit',
    titre: 'Une cartographie écocitoyenne, et ses règles',
    resume: `<p>Deux couches, deux natures. D'un côté ce que l'État a instruit : agrégats
      documentés, périmètres publiés, rapports sources. De l'autre ce que les familles déclarent,
      par le questionnaire de ce site.</p>
      <p>Les deux ne se confondent jamais, ni dans les données ni à l'écran : un <b>carré</b>
      numéroté pour l'instruit, une <b>tache floue</b> pour le déclaré. Un carré affirme un
      périmètre. Une tache situe sans délimiter.</p>
      <p>La règle de publication est fixée d'avance : <b>collecte fine, publication grossière</b>.
      On collecte à l'<b>IRIS</b>, la maille statistique d'environ 2 000 habitants, parce que sans
      cette finesse aucune analyse ne sera possible. On publie par secteurs d'environ 25 km, à
      partir de <b>trois cas</b>, centre de maille et jamais barycentre. Un enfant malade dans un
      village ne doit pas être retrouvable depuis un navigateur.</p>`,
    page: [
      { h: 'Ce qu\'un recensement participatif peut faire',
        p: `Repérer une concentration que personne n'a encore signalée. Donner à un collectif
            existant un ordre de grandeur. Documenter une exposition suspectée qu'aucune base
            publique n'enregistre. Et rendre visible un volume que les registres ne publient
            qu'agrégé et avec des années de retard.` },
      { h: 'Ce qu\'il ne peut pas faire',
        p: `Prouver. Un cas déclaré n'est pas un cas validé, et la carte le dit sur chaque fiche.
            Ce dispositif ne remplace ni une démarche médicale ni un signalement à l'ARS.` },
      { h: 'La règle d\'affichage, en trois points',
        p: `Maille de 25 km, seuil de trois cas, centre de maille. En dessous du seuil, les cas
            basculent dans une maille de 75 km ; s'ils n'y atteignent toujours pas trois, ils
            restent comptés mais ne sont pas placés. Le panneau affiche combien. Le centre
            affiché est celui de la maille et jamais le barycentre des cas : un barycentre se
            déplace quand un cas s'ajoute, et cette dérive suffit à remonter à une position.` },
      { h: 'Les garde-fous du questionnaire',
        p: `Ni nom, ni date de naissance, ni pièce médicale. Année et non date, tranche d'âge et
            non âge exact. L'adresse est géocodée dans le navigateur et n'est jamais écrite en
            base. Consentements séparés pour l'enregistrement, la carte et la publication du
            témoignage. Vérification anti-robot, confirmation par e-mail, revue manuelle des cas
            atypiques plutôt que rejet automatique.` },
    ],
    sources: [],
  },
];
