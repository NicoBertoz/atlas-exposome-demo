/* ------------------------------------------------------------------ *
 *  concepts.js — la matière de la section 1.
 *
 *  Le flow du 28/07 demande « max 8 pop-ups de 200 mots » qui mènent chacun
 *  vers une page dédiée. Chaque entrée porte donc deux longueurs :
 *    resume   ce qu'on lit dans le déroulé, court, ~200 mots maximum
 *    page     la page dédiée, aussi longue qu'il faut, avec ses sources
 *
 *  Un seul fichier pour les deux : le résumé et la page ne peuvent pas
 *  diverger, et l'équipe éditoriale NK n'a qu'un endroit à reprendre.
 *
 *  Les chiffres viennent du classeur « Projet NK - Document central »
 *  (rapports Santé publique France, registres, presse). Chaque page liste
 *  ses liens.
 * ------------------------------------------------------------------ */
window.NK_CONCEPTS = [
  {
    id: 'enfants-sentinelles',
    teaser: `Un enfant n'a pas fumé, pas travaillé en usine, pas accumulé quarante ans d'habitudes. Quand il tombe malade, la liste des causes est courte.`,
    kicker: 'Le point de départ',
    titre: 'Les enfants sont des sentinelles',
    resume: `<p>Environ 2 500 enfants apprennent chaque année en France qu'ils ont un cancer.
      Le plus souvent, personne ne saura pourquoi.</p>
      <p>Un enfant n'a pas fumé, pas travaillé en usine, pas accumulé quarante ans d'habitudes.
      Quand une maladie apparaît chez lui, la liste des causes possibles est courte, et
      l'environnement y pèse plus lourd que chez un adulte. C'est ce qui fait des cancers
      pédiatriques et de certaines malformations des <b>signaux avancés</b> : ils apparaissent
      avant les pathologies lentes, et là où quelque chose ne va pas.</p>
      <p>Encore faut-il les compter. C'est tout le problème.</p>`,
    page: [
      { h: 'Pourquoi l\'enfance change la lecture',
        p: `Chez un adulte, un cancer se lit à travers des décennies d'expositions cumulées :
            tabac, métier, alimentation, air. La part attribuable à un facteur précis devient
            très difficile à isoler. Chez un enfant de six ans, cette accumulation n'existe pas.
            Les fenêtres d'exposition qui comptent sont courtes et identifiables : la grossesse,
            les premières années, parfois même la génération précédente.` },
      { h: 'Les pathologies qui servent de sentinelles',
        p: `Toutes ne se valent pas. Trois cancers pédiatriques dominent les effectifs :
            leucémies aiguës, tumeurs du système nerveux central, lymphomes. À côté, des
            malformations moins graves mais plus fréquentes servent d'indicateurs :
            l'hypospadias, la cryptorchidie, les agénésies de membre. Elles ne tuent pas.
            Elles indiquent.` },
      { h: 'Ce que ça implique pour la surveillance',
        p: `Un signal sentinelle n'a de valeur que s'il est enregistré vite et à une échelle
            fine. La France dispose de registres nationaux des cancers de l'enfant, et de
            registres régionaux de malformations. Leur maillage est inégal, leur financement
            fragile, et l'accès à leurs données passe par des procédures longues.` },
    ],
    sources: [
      { l: 'Variations spatiotemporelles du risque de cryptorchidies opérées en France (SpF, 2021)',
        u: 'http://www.santepubliquefrance.fr/exposition-a-des-substances-chimiques/perturbateurs-endocriniens/enquetesetudes/variations-spatiotemporelles-du-risque-de-cryptorchidies-operees-en-france-et-hypotheses' },
    ],
  },

  {
    id: 'effet-cocktail',
    teaser: `Chaque substance est évaluée seule. Personne ne vit exposé à une seule substance. Un territoire peut être conforme et rester un mauvais endroit où grandir.`,
    kicker: 'Ce que la toxicologie ne sait pas faire',
    titre: 'L\'effet cocktail',
    resume: `<p>Une substance est évaluée seule. On lui cherche une dose sans effet, on en tire
      un seuil, et le seuil devient la norme.</p>
      <p>Sauf que personne ne vit exposé à une seule substance. Un enfant respire l'air d'une
      vallée industrielle, boit l'eau d'un forage, mange les produits d'une plaine traitée.
      Les molécules se rencontrent dans son corps, et rien ne garantit que leurs effets
      s'additionnent sagement : ils peuvent se multiplier, ou déclencher ce qu'aucune des deux
      ne provoquait seule.</p>
      <p>Aucun protocole réglementaire ne teste les mélanges réels. Le nombre de combinaisons
      possibles est trop grand. Conséquence pratique : un territoire peut être conforme,
      substance par substance, et rester un mauvais endroit où grandir.</p>`,
    page: [
      { h: 'Le seuil, et ce qu\'il suppose',
        p: `L'évaluation classique repose sur une idée simple : en dessous d'une certaine dose,
            une substance n'a pas d'effet mesurable. On établit ce seuil en laboratoire, sur une
            substance isolée, puis on applique des facteurs de sécurité. Le raisonnement tient
            tant que l'exposition réelle ressemble à l'expérience.` },
      { h: 'Pourquoi les mélanges échappent au calcul',
        p: `Tester dix substances deux à deux, c'est quarante-cinq expériences. Tester cent
            substances par groupes de trois, c'est plus de cent soixante mille. Aucun programme
            de recherche ne peut couvrir l'espace des mélanges auxquels une population est
            réellement exposée. Les agences le savent et le disent ; elles n'ont pas de méthode
            de remplacement.` },
      { h: 'Les perturbateurs endocriniens aggravent le problème',
        p: `Ces molécules imitent ou bloquent des hormones. Leur effet ne suit pas toujours la
            dose : il peut être plus marqué à faible concentration qu'à forte, et dépend surtout
            du moment de l'exposition. Un seuil calculé sur un adulte ne dit rien de ce qui se
            joue à la douzième semaine de grossesse.` },
      { h: 'Ce que l\'Atlas peut faire, et ne peut pas faire',
        p: `Il ne démontrera pas un effet cocktail : cela demande de la toxicologie, pas de la
            cartographie. Il peut en revanche rendre visible la superposition des expositions
            sur un même territoire, ce qu'aucune évaluation substance par substance ne montre.` },
    ],
    sources: [],
  },

  {
    id: 'pollution-chimique',
    teaser: `Les PFAS ne se dégradent pas, les pesticides reviennent chaque saison. Mais une exposition n'est pas un agrégat, et les confondre coûterait cher.`,
    kicker: 'Le décor',
    titre: 'PFAS et pesticides, une contamination de fond',
    resume: `<p>Les composés perfluorés ne se dégradent pas. Conçus pour résister à l'eau, à la
      graisse et à la chaleur, ils tiennent aussi contre le temps : on les retrouve dans les
      sols, les nappes, le sang. Les pesticides, eux, se renouvellent chaque saison, et la
      commune de résidence suffit souvent à approcher l'exposition.</p>
      <p>Une distinction à garder pour toute la suite : <b>une exposition n'est pas un
      agrégat</b>. Salindres est un site majeur de production de PFAS, et aucun cas groupé n'y
      est documenté. La vallée de la chimie lyonnaise fait l'objet d'un procès civil de
      192 riverains, sans agrégat pédiatrique établi. Confondre les deux ferait perdre à la
      carte exactement ce qui lui donne sa force.</p>
      <p>D'où deux couches distinctes : où les gens tombent malades, et à quoi ils sont exposés.</p>`,
    page: [
      { h: 'Ce que sont les PFAS',
        p: `Une famille de plusieurs milliers de molécules construites autour d'une liaison
            carbone-fluor, l'une des plus stables de la chimie organique. D'où leur utilité
            industrielle, et d'où leur persistance : ce qui est rejeté reste. Les usages vont
            des mousses anti-incendie aux emballages alimentaires en passant par les textiles
            techniques.` },
      { h: 'Ce que sont les pesticides, du point de vue d\'une carte',
        p: `Contrairement aux PFAS, l'exposition est saisonnière et fortement liée à la
            proximité. Le registre parcellaire graphique, qui décrit l'occupation agricole
            parcelle par parcelle, permet d'approcher la pression sans mesurer directement les
            molécules — un proxy, pas une mesure.` },
      { h: 'Le trou dans les données',
        p: `Les cas sont enregistrés par des registres. Les expositions, elles, sont dispersées
            entre des bases qui ne se parlent pas : ventes de produits phytosanitaires,
            déclarations d'émissions industrielles, campagnes de mesure ponctuelles. C'est cette
            asymétrie que l'Atlas essaie de réduire.` },
    ],
    sources: [
      { l: 'Rapport PFAS Salindres (Générations Futures, 2024)',
        u: 'https://www.generations-futures.fr/wp-content/uploads/2024/02/rapport-salindres-pfas.pdf' },
    ],
  },

  {
    id: 'difficulte-preuve',
    teaser: `À Preignac, l'enquête n'a pas échoué sur le signal sanitaire : il n'existait aucune mesure de pesticides dans l'air à lui opposer.`,
    kicker: 'Le nœud',
    titre: 'Prouver est presque impossible, et ce n\'est pas un hasard',
    resume: `<p>À Preignac, en Gironde, neuf enfants malades pour 5,7 attendus, une école entourée
      de vignes. L'investigation n'a pas conclu. Pas parce que le signal sanitaire était faible,
      mais parce qu'il <b>n'existait aucune mesure de pesticides dans l'air</b> à lui opposer.</p>
      <p>Autour des anciennes mines de Saint-Félix-de-Pallières, dans le Gard, 45 plaintes pénales
      ont été déposées. Toutes classées en 2020, au motif qu'on ne pouvait pas distinguer
      l'origine industrielle de l'origine naturelle des métaux.</p>
      <p>Ces deux dossiers ne parlent pas de santé. Ils parlent de mesure. Une enquête
      épidémiologique a besoin de deux moitiés : les cas, et l'exposition. Quand la seconde
      manque, l'absence de preuve devient une preuve d'absence, et le dossier se referme.</p>`,
    page: [
      { h: 'Ce qu\'une investigation d\'agrégat peut établir',
        p: `Elle compare un nombre de cas observés à un nombre attendu, sur un périmètre et une
            période donnés. Elle produit un rapport, avec un intervalle de confiance. Elle ne
            cherche pas de cause : c'est une étape ultérieure, qui demande une étude étiologique,
            plus longue et plus chère, rarement financée.` },
      { h: 'Le rôle des données d\'exposition',
        p: `Sans elles, l'investigation s'arrête au constat. Preignac est le cas d'école :
            le signal était là, la suspicion était nommée, et l'absence de mesure dans l'air a
            suffi à empêcher toute conclusion. Ce n'est pas un échec scientifique, c'est un
            manque d'instrument.` },
      { h: 'Le fond géochimique naturel',
        p: `Un argument recevable et redoutable : certains métaux sont naturellement présents
            dans les sols. Distinguer la part naturelle de la part industrielle demande des
            analyses isotopiques coûteuses. En leur absence, le doute profite à qui conteste.
            Cet argument sera opposé à ce projet, sur les métaux d'abord.` },
      { h: 'Corrélation et causalité',
        p: `Ce projet affiche des associations spatiales, pas des liens de cause à effet. La
            distinction est réelle et doit être tenue. Elle n'implique pas l'inaction : comme le
            rappelaient Smith et Pell à propos des parachutes, l'absence d'essai contrôlé ne
            démontre pas l'absence d'effet.` },
    ],
    sources: [
      { l: 'Investigation d\'un agrégat dans une commune viticole de Gironde (SpF, 2013)',
        u: 'https://www.santepubliquefrance.fr/determinants-de-sante/exposition-a-des-substances-chimiques/pesticides/documents/rapport-synthese/investigation-d-une-suspicion-d-agregat-de-cancers-pediatriques-dans-une-commune-viticole-de-gironde.-juin-2013' },
      { l: 'Anciens sites miniers de Carnoulès et la Croix de Pallières (SpF)',
        u: 'https://www.santepubliquefrance.fr/presse/anciens-sites-miniers-de-carnoules-et-la-croix-de-pallieres' },
    ],
  },

  {
    id: 'maille',
    teaser: `Onze leucémies. SIR 6,4 à la commune, 2,3 au canton, sur les mêmes enfants. Rien n'a changé sauf le contour du calcul.`,
    kicker: 'Le détail qui change tout',
    titre: 'La maille décide du résultat',
    resume: `<p>Pont-de-l'Arche et Igoville, dans l'Eure. Onze leucémies chez des moins de 15 ans
      entre 2017 et 2019.</p>
      <p>À l'échelle de la <b>commune</b>, le rapport entre cas observés et cas attendus vaut
      <b>6,4</b>. À l'échelle du <b>canton</b>, sur exactement les mêmes enfants, il tombe à
      <b>2,3</b>, et l'intervalle de confiance croise 1. L'hypothèse du hasard a été retenue,
      le suivi arrêté en septembre 2025.</p>
      <p>Rien n'a changé sauf le contour du calcul. Élargissez le périmètre, vous diluez ;
      resserrez-le, vous fabriquez un excès. C'est pourquoi une carte honnête annonce sa maille
      avant de montrer ses résultats, et ne la change pas en cours de route.</p>`,
    page: [
      { h: 'Le problème de l\'unité spatiale modifiable',
        p: `Il porte un nom en géographie : le MAUP, modifiable areal unit problem. Un même
            semis de points produit des statistiques différentes selon le découpage employé.
            Ce n'est pas une erreur de mesure, c'est une propriété du découpage lui-même.` },
      { h: 'Le choix de l\'IRIS',
        p: `L'IRIS est la maille statistique française d'environ 2 000 habitants. Assez fine
            pour qu'un excès local ne se dilue pas, assez large pour porter des indicateurs
            socio-économiques. C'est la maille de collecte retenue par le projet.` },
      { h: 'Collecter fin, publier grossier',
        p: `La maille d'analyse et la maille d'affichage ne sont pas la même chose. On collecte
            à l'IRIS parce que sans cette finesse aucune analyse ultérieure n'est possible. On
            publie par secteurs d'environ 25 km, avec un seuil minimal de cas, parce qu'un enfant
            malade dans un village ne doit pas être retrouvable depuis un navigateur.` },
    ],
    sources: [
      { l: 'Bilan de surveillance du cluster de leucémies de Pont-de-l\'Arche (SpF, 2025)',
        u: 'https://www.santepubliquefrance.fr/regions-et-territoires/normandie/enquetesetudes/bilan-de-surveillance-post-investigation-du-cluster-de-leucemies-pediatriques-dans-le-secteur-de' },
    ],
  },

  {
    id: 'donnee-verrouillee',
    teaser: `Sur-incidence confirmée en mars 2026 dans six communes. Lesquelles ? Le rapport ne le dit pas, le secteur a été anonymisé.`,
    kicker: 'Ce qu\'on ne vous montre pas',
    titre: 'La donnée existe, et elle est fermée',
    resume: `<p>Mars 2026, rapport le plus récent du corpus : cinq enfants, une sur-incidence
      <b>explicitement confirmée</b>, dans six communes contiguës de l'est des Pays de la Loire.
      Lesquelles ? Le rapport ne le dit pas. Le secteur a été anonymisé au titre du RGPD.</p>
      <p>Vingt-cinq autres investigations d'agrégats ont été menées en France, la plupart jamais
      médiatisées. Elles existent, elles sont publiques, et presque personne ne les a lues.</p>
      <p>Protéger cinq familles et permettre à un territoire de se savoir concerné sont deux
      exigences réelles, et elles s'opposent. Ce projet ne prétend pas les réconcilier. Il
      choisit de rendre lisible ce qui est déjà public, et d'annoncer précisément ce qu'il
      masque et pourquoi.</p>`,
    page: [
      { h: 'Ce que le RGPD protège, et ce qu\'il empêche',
        p: `Une donnée de santé est une donnée sensible. À l'échelle de six communes rurales et
            de cinq enfants, publier le périmètre reviendrait souvent à désigner des familles.
            L'anonymisation est justifiée. Elle a un coût : le territoire concerné ne peut pas
            se saisir de son propre dossier.` },
      { h: 'Le volume invisible',
        p: `Le corpus rassemblé pour ce projet compte 31 entrées documentées. La grande majorité
            n'a jamais fait l'objet d'un article. Le débat public retient trois ou quatre noms —
            Sainte-Pazanne, Vincennes, Saint-Rogatien — et ignore le reste.` },
      { h: 'Ce que les collectifs ont obtenu',
        p: `À Sainte-Pazanne, le collectif a fait analyser 700 pesticides dans l'eau, à ses
            frais : cinq puits ont été déclarés impropres. À Guidel, le contre-recensement des
            familles a forcé l'élargissement du périmètre officiel. Ce ne sont pas des
            anecdotes, ce sont les seuls leviers qui ont fonctionné.` },
    ],
    sources: [
      { l: 'Agrégat d\'hémopathies malignes, est des Pays de la Loire (SpF, mars 2026)',
        u: 'https://www.santepubliquefrance.fr/sites/default/files/cadic_files/documents/spf00006517.pdf' },
    ],
  },

  {
    id: 'collecte-citoyenne',
    teaser: `À Noyelles-Godault, 91 % des enfants invités, 24 % de participation. La confiance ne se décrète pas, et les collectifs l'ont prouvé.`,
    kicker: 'Pourquoi vous',
    titre: 'Ce qu\'une collecte citoyenne peut faire',
    resume: `<p>Un recensement déclaratif ne prouve rien. Il ne remplace ni un registre, ni une
      investigation. Ce qu'il fait, c'est indiquer où regarder, et obliger à regarder.</p>
      <p>À Noyelles-Godault, un dépistage institutionnel a touché 91 % des enfants concernés.
      <b>24 % ont participé.</b> La confiance ne se décrète pas, et une invitation officielle ne
      suffit pas à la produire.</p>
      <p>Les mobilisations qui ont fait bouger des périmètres officiels sont parties de parents
      qui comptaient eux-mêmes : Sainte-Pazanne, la plaine d'Aunis, le Haut-Jura, Guidel. À
      chaque fois, un décompte citoyen a précédé ou corrigé le décompte de l'État.</p>
      <p>C'est le rôle de ce formulaire. Pas produire une preuve : produire une question à
      laquelle il devienne coûteux de ne pas répondre.</p>`,
    page: [
      { h: 'Ce qu\'un signalement citoyen n\'est pas',
        p: `Ce n'est pas un diagnostic, ni un signalement à l'ARS, ni une pièce de dossier
            médical. Il ne remplace aucune démarche. Un cas déclaré n'est pas un cas validé, et
            la carte le dit.` },
      { h: 'Ce qu\'il permet malgré tout',
        p: `Repérer une concentration que personne n'a encore signalée. Donner à un collectif
            existant un ordre de grandeur. Documenter une exposition suspectée qu'aucune base
            publique n'enregistre. Et rendre visible un volume que les registres ne publient
            qu'agrégé et avec des années de retard.` },
      { h: 'Les garde-fous',
        p: `Vérification anti-robot, confirmation par e-mail, revue manuelle des cas atypiques
            plutôt que rejet automatique, seuil minimal de cas avant tout affichage, et
            consentements séparés pour l'enregistrement, la carte et la publication du
            témoignage.` },
      { h: 'Précédent méthodologique',
        p: `L'étude Fos-EPSEAL, menée avec 2 000 habitants dont 455 enfants autour de l'étang de
            Berre, reste la référence française d'une enquête de santé co-construite avec les
            habitants. Elle montre qu'un recueil déclaratif rigoureux produit des résultats
            discutables scientifiquement, au bon sens du terme.` },
    ],
    sources: [
      { l: 'Analyse épidémiologique des plombémies, Noyelles-Godault (SpF, 2022)',
        u: 'https://www.actu-environnement.com/media/pdf/news-41945-synthese-sante-publique-france-analyse-epidemiologique-saturnisme-plombemie.pdf' },
    ],
  },

  {
    id: 'temoignages',
    teaser: `Un SIR de 2,27 ne dit rien du trajet de cent kilomètres, ni de la phrase « c'est le hasard » entendue en réunion publique.`,
    kicker: 'Ce que les chiffres ne portent pas',
    titre: 'Les témoignages de parents',
    resume: `<p>Un SIR de 2,27 ne dit rien du trajet de cent kilomètres jusqu'au CHU, des dix-huit
      mois de protocole, ni de la phrase « c'est le hasard » entendue en réunion publique.</p>
      <p>Les témoignages ne servent pas à compenser l'émotion qui manquerait aux statistiques.
      Ils servent à documenter ce que les bases n'enregistrent pas : quelle exposition la famille
      soupçonnait, quelles analyses elle a demandées, ce qu'on lui a répondu, et à quel moment
      le dossier s'est refermé.</p>
      <p>Sur la carte, ils ne sont jamais posés à une adresse. Ils apparaissent par secteur, à
      partir de trois cas, et se lisent en ouvrant le secteur. Quand la famille l'accepte, la
      voix est jointe au texte.</p>`,
    page: [
      { h: 'Ce qu\'on demande, et ce qu\'on ne demande pas',
        p: `Pathologie, année de diagnostic, tranche d'âge, commune géocodée en IRIS, exposition
            suspectée, récit libre. Ni nom, ni date de naissance, ni date exacte de diagnostic,
            ni pièce médicale. La minimisation n'est pas une précaution juridique, c'est ce qui
            rend le dispositif acceptable.` },
      { h: 'Le format audio',
        p: `Une voix porte ce qu'un formulaire perd. Quand la famille le souhaite, le témoignage
            enregistré est diffusé sur la page du cas, jamais rattaché à un point précis de la
            carte. La lecture peut s'enchaîner d'un témoignage à l'autre.` },
      { h: 'La modération',
        p: `Les récits sont relus avant publication. Les mentions nominatives d'entreprises ou de
            personnes sont retirées : le projet documente des territoires et des expositions,
            pas des responsabilités individuelles, et une mise en cause nominative fragiliserait
            l'ensemble.` },
    ],
    sources: [],
  },
];
