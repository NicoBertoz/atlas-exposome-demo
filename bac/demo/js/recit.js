/* ------------------------------------------------------------------ *
 *  recit.js — le texte du déroulé, ses incises et sa bibliographie.
 *
 *  Source : « Déroulé narratif en introduction de la carte interactive »,
 *  V.1, fourni par Projet NK le 18/08. Remplace les sept concepts écrits
 *  en atelier, qui n'étaient qu'une proposition de structure.
 *
 *  Trois niveaux de lecture, et c'est tout l'enjeu du dispositif :
 *
 *    1. le TEXTE, qui se lit d'un trait, sans rien ouvrir ;
 *    2. les INCISES, appelées par un mot souligné dans le texte. Certaines
 *       font 150 mots : elles ne peuvent pas tenir dans une bulle au survol.
 *       Elles s'ouvrent donc dans la marge, à hauteur du mot, et se ferment
 *       à la lecture suivante ;
 *    3. la BIBLIOGRAPHIE, appelée par les numéros entre crochets, repliée
 *       en bas de page pour ne pas alourdir.
 *
 *  Balisage du texte :
 *    {{mot|cle}}   appelle l'incise `cle` et souligne `mot`
 *    [[3]]         appelle la source 3 de la bibliographie
 *
 *  Les incises encore à l'état de notes de travail portent `brouillon: true`
 *  et s'affichent avec une mention explicite plutôt que d'être masquées :
 *  l'équipe éditoriale doit voir ce qui lui reste à écrire.
 * ------------------------------------------------------------------ */
window.NK_RECIT = (function () {
  'use strict';

  /* Le mot d'accueil, posé en exergue avant le texte. */
  const EXERGUE = {
    titre: 'Lisez-moi',
    texte: `Nous avons tenu à agrémenter le texte principal d'incises afin de le
      contextualiser et de l'étendre avec une poignée des choses que nous avons pu lire,
      entendre, recueillir. Ces savoirs sont collectifs, tout comme ce projet, et nous vous
      invitons à l'approfondir via une liste de ressources non exhaustive.
      Merci de prendre le temps d'être ici.`,
  };

  const TEXTE = [
    `<b>350 000.</b> C'est le nombre de substances chimiques qui ont été produites depuis
     les années 1950 [[1]]. En Europe, la vente de produits chimiques atteint plus de
     800 milliards d'euros par an [[2]]. Nos terres {{pullulent|pullulent}} de produits
     chimiques. Les molécules s'accumulent et contaminent notre environnement, nos lieux de
     travail, notre eau, nos corps. Mais les effets toxiques d'un produit chimique peuvent
     parfois prendre {{des années|annees}} à se manifester. Transcender les générations [[3]].`,

    `C'est pendant la vie in utero, l'enfance et l'adolescence que les corps sont les plus
     vulnérables. Une exposition même à faible dose à des polluants multiplie le risque de
     développer des cancers [[4]].`,

    `Depuis plusieurs décennies, {{l'incidence des cancers pédiatriques augmente|incidence}}
     toujours [[5]] [[6]]. En France, chaque année, plus de 2 300 enfants et adolescents ont un
     cancer. Foudroyés par la rapidité de la maladie et la lourdeur des
     {{traitements|traitements}}, près de 17 % n'y survivront pas [[7]]. La plupart des
     rescapés en porteront des séquelles toute leur vie [[8]].`,

    `La génétique expliquerait seulement environ 10 % des cas [[9]]. Et les autres ? Tous ces
     cancers diagnostiqués chez ceux qu'on ne peut pas accuser de fumer, boire, manger trop
     gras ou trop sucré ?`,

    `Pesticides, polluants éternels, plastiques. De plus en plus de scientifiques pointent les
     {{facteurs de risques environnementaux, dont la pollution chimique|facteurs}} [[4]].`,

    `Relier un cancer à une molécule précise est presque impossible. Nous sommes exposés
     partout, tout le temps, sans même nous en rendre compte. Des faisceaux de
     {{molécules et autres expositions|molecules}} s'entrechoquent et se mêlent. Ensemble,
     leurs effets individuels sont décuplés, ainsi que les risques de maladie [[11]] [[12]].`,

    `Mais cette complexité profite. Aujourd'hui, les autorités comme l'industrie chimique
     exigent une cause unique et irréfutable pour investiguer l'émergence de maladies ou
     retirer un produit du marché. Pour apporter cette preuve, il faut des
     {{résultats statistiques|statistiques}}. Donc des malades.`,

    `Mais puisque les expérimentations cliniques sur les humains sont interdites, la science
     réglementaire a décidé d'attendre des décennies pour faire parler les morts.`,

    `Des décennies durant lesquelles les malades s'accumulent en même temps que les profits
     des firmes. Tant et si bien qu'au lieu de {{protéger notre santé|precaution}} et celle de
     nos enfants, les entreprises préfèrent dépenser des millions en lobbies, brevets et
     contre-études pour {{entraver|entraver}} les régulations et les études indépendantes
     [[13]] [[14]] [[15]].`,

    `PFAS, glyphosate et consorts seraient ainsi désormais indispensables pour la bonne marche
     de l'humanité. Une poêle qui ne colle pas. Un insecticide ménager dont l'effet mortel
     perdure dans l'air un mois entier. Pourtant, ces produits mettent en péril le vivant pour
     des usages non essentiels [[16]].`,

    `L'économie bloquée dans une croissance infinie de particules a fini par nous rendre
     malades. Dans les années 1970, des {{registres de cancers|registres}} ont émergé en France
     pour les recenser [[17]]. Mais aujourd'hui, ces données, {{lacunaires|lacunaires}} [[18]],
     sont à l'usage quasi exclusif des institutions qui les rassemblent. Elles sont
     verrouillées, inaccessibles aux malades, familles, juristes, scientifiques,
     militants [[19]].`,

    `Impossible de savoir précisément où se situent les cas sur le territoire lorsque les
     registres s'y refusent. Impossible, même avec un accès aux registres des cancers, de
     retracer ce qui aurait pu constituer des facteurs de risque au cours d'une vie.
     Impossible, sans données, d'essayer de comprendre et réguler ce qui pourrait bel et bien
     nous empoisonner.`,

    `À moins que des citoyens ne prennent l'initiative d'identifier eux-mêmes un
     {{cluster|cluster}}. <b>Et si les malades et leurs proches reprenaient le contrôle sur
     leurs données ?</b> Et si, pour la première fois, on pouvait voir où se trouvent les cas
     sur le territoire sans reposer sur des institutions impénétrables ?`,
  ];

  const lien = (t, u) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`;

  const INCISES = {
    pullulent: {
      titre: 'Pullulent',
      texte: `La pollution chimique est devenue si vaste et complexe qu'elle dépasse les
        capacités de nos sociétés à en gérer les impacts. Certains chercheurs concluent
        qu'elle menace un espace sûr pour l'humanité
        ${lien('(Persson et al., 2022)', 'https://pubs.acs.org/esthag/article/56/3/1510/489330/Outside-the-Safe-Operating-Space-of-the-Planetary')}.`,
    },

    annees: {
      titre: 'Des années',
      texte: `Certaines expositions chimiques peuvent avoir des effets immédiats. Une goutte
        et le métabolisme s'emballe. Pour beaucoup d'entre elles cependant, il peut s'écouler
        des années voire des décennies avant qu'une maladie ne se manifeste. Des effets latents
        ou chroniques, particulièrement dévastateurs chez les enfants
        ${lien('(Grandjean et al., 2018)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6497561/')}.
        <br><br>Ces temps longs dépasseraient même les générations. Certaines expositions
        pourraient s'inscrire dans l'épigénétique d'un individu : une couche d'information qui
        détermine, sans modifier la séquence de l'ADN, comment certains gènes seront utilisés ou
        non par les cellules. Des études sur les animaux ont démontré que certaines de ces
        marques épigénétiques — notamment celles induites par le chlordécone, le glyphosate ou
        plusieurs additifs de plastiques — peuvent se retrouver chez les générations suivantes,
        et augmenter leur risque de maladie alors qu'elles n'ont jamais été exposées
        ${lien('(Nilsson et al., 2022)', 'https://academic.oup.com/eep/article/8/1/dvac001/6529222')}.
        Les risques de transmission seraient particulièrement prononcés lors des expositions
        préconception ou pendant la grossesse
        ${lien('(Springer, 2024)', 'https://link.springer.com/article/10.1186/s13148-024-01762-3')}.`,
    },

    incidence: {
      titre: 'L\'incidence des cancers pédiatriques augmente',
      texte: `Malgré des décennies de prévention contre des cancérogènes avérés et une
        amélioration drastique des conditions de vie en Occident, les cas continuent d'augmenter
        et les cancers sont diagnostiqués de plus en plus jeunes. S'il était rare qu'une femme
        ait un cancer du sein avant 50 ans, les cas explosent
        ${lien('(Pujol et al., 2025)', 'https://www.thebreastonline.com/article/S0960-9776(25)00572-7/fulltext')}.
        <br><br>La tendance s'observe aussi chez les enfants. Aux États-Unis, la leucémie de
        l'enfant a bondi de 21 % depuis 1976
        ${lien('(Landrigan, 2022)', 'https://www.annals-research-oncology.com/wp-content/uploads/2022/05/ARO_2-2022-1.pdf')}.
        En Europe de l'Ouest, France comprise, l'incidence de tous les cancers pédiatriques
        augmente de 0,70 % par an
        ${lien('(Steliarova-Foucher et al., 2018)', 'https://www.thelancet.com/action/showPdf?pii=S1470-2045%2818%2930423-6')}.
        Une partie de cette hausse pourrait s'expliquer par les progrès du diagnostic et de
        l'enregistrement des cas.`,
    },

    traitements: {
      titre: 'Traitements',
      brouillon: true,
      texte: `En moyenne, plus de 80 % des enfants survivent cinq ans après le diagnostic en
        France métropolitaine. Mais les cancers pédiatriques restent une maladie rare, touchant
        une population encore trop invisible
        ${lien('(Singh et al., 2025)', 'https://www.nature.com/articles/s41390-025-03923-3')} :
        le marché des traitements n'est pas jugé rentable par l'industrie
        ${lien('(Adamson et al., 2014)', 'https://www.nature.com/articles/nrclinonc.2014.149')}.
        Les recherches sont sous-financées et les solutions thérapeutiques peu développées
        ${lien('(Loucaides et al., 2019)', 'https://pubmed.ncbi.nlm.nih.gov/31797794/')}.
        <br><br>Chaque jour, les équipes médicales sont contraintes de soigner les enfants avec
        des traitements sensiblement identiques à ceux des adultes, alors que leurs cancers sont
        différents et leurs corps plus vulnérables. Il manque cruellement d'alternatives aux
        traitements conçus pour les adultes, qui irradient ou endommagent l'ADN
        ${lien('(Kattner et al., 2019)', 'https://pubmed.ncbi.nlm.nih.gov/31832830/')}.
        Résultat : 95 % finissent par développer une autre maladie grave, y compris un autre
        cancer, avant leurs 45 ans
        ${lien('(Bhatia et al., 2023)', 'https://jamanetwork.com/journals/jama/article-abstract/2809804')}.`,
      manque: 'Part des cancers pédiatriques dans la mortalité des enfants et adolescents en France — chiffre à compléter (source Insee citée dans le document).',
    },

    facteurs: {
      titre: 'Facteurs de risques environnementaux',
      texte: `Dans beaucoup de cas, il n'est pas possible de dire exactement pourquoi une
        personne développe un cancer. Un cancer, c'est une accumulation de mutations qui
        aboutissent à une prolifération incontrôlée de certaines cellules, et bien des facteurs,
        seuls ou accumulés, à petite ou grande dose, peuvent y être associés.
        <br><br>Souvent, les cancers surviennent avec l'âge, les dégâts infligés à nos cellules
        s'accumulant. Parfois, dans moins de 10 % des cas, le risque est hérité d'un gène de nos
        parents. Une autre grande catégorie rassemble les facteurs environnementaux, définis par
        l'${lien('OMS', 'https://www.who.int/teams/noncommunicable-diseases/integrated-support/environmental-risk-factors-and-ncds')}
        comme « l'ensemble des facteurs externes physiques, chimiques, biologiques et
        professionnels affectant la santé d'une personne ».
        <br><br>Parmi eux, les scientifiques ont établi des liens entre une exposition à des
        produits chimiques en début de vie et le développement d'un cancer dans l'enfance, ou
        plus tard : pesticides, pollution de l'air, métaux lourds comme le plomb ou le cadmium,
        et bien d'autres substances.`,
    },

    molecules: {
      titre: 'Molécules et autres expositions',
      texte: `Avant d'être relâchées sur le marché européen, beaucoup de substances passent au
        crible de tests de toxicité soumis à l'Autorité européenne de sécurité des aliments et à
        l'Agence européenne des produits chimiques. Ces tests sont vivement critiqués
        ${lien('(Godderis et al., 2024)', 'https://academic.oup.com/toxsci/article-abstract/199/2/194/7616131')} :
        ils analysent mal la toxicité chronique, et étudient les substances une à une.
        <br><br>Pourtant, en dehors des conditions aseptisées d'un laboratoire, les molécules et
        leurs effets se mélangent. Ces synergies les rendent potentiellement plus toxiques que si
        elles agissaient seules. On parle d'effet cocktail, et il passe entre les mailles des
        régulations.
        <br><br>L'effet cocktail est une composante de l'
        ${lien('exposome', 'https://pubmed.ncbi.nlm.nih.gov/16103423/')} : la somme de toutes les
        expositions auxquelles on est soumis de la conception à la mort — environnement chimique,
        physique, mode de vie, infections. Et une fois de plus, elles s'articulent : le stress,
        la pauvreté et la précarité rendent plus vulnérable à l'exposome chimique
        ${lien('(Young et al., 2025)', 'https://academic.oup.com/jncics/article/9/1/pkae122/7928844')}.`,
    },

    statistiques: {
      titre: 'Résultats statistiques',
      brouillon: true,
      texte: `Tandis que l'épidémiologie excelle pour comprendre et prévenir les maladies
        infectieuses, cette discipline fait face à de nombreuses limites méthodologiques
        lorsqu'il s'agit d'investiguer les déterminants environnementaux d'une maladie.
        <br><br>Associer une exposition précise à un cancer nécessite la certitude que cette
        exposition ait bien eu lieu. Cette affirmation peut être faite pour des travailleurs
        d'usine ou des agriculteurs, qui connaissent la composition des produits qu'ils
        manipulent. Les riverains d'une pollution, eux, ignorent souvent entièrement ce à quoi
        ils sont exposés au quotidien.`,
      manque: 'À compléter : les expositions multiples, et l\'impossibilité de faire un diagnostic sur des cancers très rares.',
    },

    precaution: {
      titre: 'Protéger notre santé',
      texte: `Le principe de précaution a été adopté par la déclaration de Rio en 1992 : « en
        cas de risque de dommages graves ou irréversibles, l'absence de certitude scientifique
        absolue ne doit pas servir de prétexte pour remettre à plus tard l'adoption de mesures
        effectives ». Les signataires semblent l'avoir oublié.
        <br><br>En chimie, le doute s'accumule au même rythme que les molécules dans
        l'environnement, que berce l'axiome « la dose fait le poison ». Les mots de feu
        l'alchimiste Paracelse servent de paravent à tout reproche et alimentent la mise en place
        de seuils à ne pas dépasser. Pourtant, des études démontrent depuis longtemps que pour de
        nombreux polluants, il n'existe pas de dose sans danger
        ${lien('(Wigle &amp; Lanphear, 2005)', 'https://journals.plos.org/plosmedicine/article?id=10.1371/journal.pmed.0020350')}
        ${lien('(Grandjean, 2016)', 'https://pubmed.ncbi.nlm.nih.gov/27214290/')}.
        <br><br>D'autant que certaines substances persistent presque éternellement dans
        l'environnement — un critère suffisant, martèlent les scientifiques, pour conduire à leur
        interdiction
        ${lien('(Cousins et al., 2016)', 'https://pubmed.ncbi.nlm.nih.gov/27337597/')}
        ${lien('(Arp et al., 2023)', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10134483/')}.
        Petite dose après petite dose, si les molécules s'éternisent, leur présence — et leur
        danger — grossira inexorablement.`,
    },

    entraver: {
      titre: 'Entraver',
      texte: `Ghost writing, thèses et conférences financées par l'industrie, instituts
        « scientifiques » allant à l'encontre de faits établis, attaques directes contre les
        chercheurs, données cachées
        ${lien('(Steele et al., 2019)', 'https://link.springer.com/article/10.1186/s12992-019-0478-6')}
        ${lien('(Schäffer et al., 2023)', 'https://pubs.acs.org/esthag/article/57/48/19066/315744/Conflicts-of-Interest-in-the-Assessment-of')}
        ${lien('(Forever Lobbying Project)', 'https://foreverpollution.eu/lobbying/')}…
        Comment inculper un coupable quand celui-ci est noyé parmi des milliers d'autres données ?
        <br><br>Le CEFIC, qui représente l'industrie chimique auprès de l'Union européenne,
        déclare plus de 10 millions d'euros dépensés annuellement en lobbying, l'une des plus
        grosses sommes tous secteurs confondus
        ${lien('(Ledroit, 2026)', 'https://www.touteleurope.eu/fonctionnement-de-l-ue/entreprises-ong-federations-qui-depense-le-plus-en-lobbying-aupres-de-l-union-europeenne/')}.
        <br><br>Une stratégie qui fonctionne. Le système de régulation des substances est basé
        sur des tests de toxicité fournis par l'industrie plutôt que par des tiers indépendants.
        Ces tests, imparfaits, s'entassent pendant des années sur les bureaux d'équipes
        débordées. En attendant, les produits inondent nos vies. Une grande partie des substances
        ne sont tout bonnement pas soumises à régulation : produits vendus à petit tonnage,
        co-formulants, majorité des plastiques et de leurs additifs.`,
    },

    registres: {
      titre: 'Registres des cancers',
      brouillon: true,
      texte: `Des registres de cancers ont émergé en France à partir des années 1970 pour
        recenser les cas. Ils sont gérés par les institutions de santé publique, et leur accès
        reste très largement fermé.`,
      manque: 'Section à écrire : brève histoire, à quoi ils servent, qui les gère, combien il en existe, les actions en justice engagées sans succès pour y accéder, le nouveau registre national des adultes en préparation, et l\'épuisement militant que leur obtention représente (Jouzel et al., 2026).',
    },

    lacunaires: {
      titre: 'Lacunaires',
      texte: `Les registres de cancers n'ont pas de données sur le parcours d'exposition
        environnementale des parents ou des enfants. Ils ne permettent que d'obtenir un indice
        socio-économique, marqueur approximatif de vulnérabilité.
        <br><br>Pourtant, comprendre le parcours d'exposition des malades permet d'identifier les
        facteurs de risque suspects dans le développement d'un cancer. C'est un outil à la fois
        de prévention et d'identification des lieux, activités et populations les plus à risque.
        <br><br>C'est pourquoi, à travers ce projet, nous reconstruisons dans les grandes lignes
        le parcours des malades et de leurs parents. Pour plus d'informations sur ces méthodes,
        voir les travaux des
        ${lien('GISCOP 84', 'https://giscope84.hypotheses.org/intentions')} et
        ${lien('GISCOP 93', 'https://giscop93.univ-paris13.fr/')}.`,
    },

    cluster: {
      titre: 'Cluster',
      texte: `Selon Santé publique France, un cluster — ou agrégat spatio-temporel — est « un
        regroupement de personnes ayant une même maladie ou les mêmes symptômes dans une zone
        géographique et dans une période donnée, et dont le nombre rapporté à sa population est
        inhabituellement élevé ».
        <br><br>Les clusters qui nous intéressent ici sont des regroupements d'enfants de moins
        de 18 ans souffrant d'un cancer.`,
    },
  };

  /* Bibliographie du texte principal. Repliée : une quarantaine de références
     déroulées d'office alourdiraient la fin du déroulé pour rien. */
  const SOURCES = [
    `Wang, Z., Walker, G. W., Muir, D. C., &amp; Nagatani-Yoshida, K. (2020). Toward a global understanding of chemical pollution. <i>Environmental Science &amp; Technology</i>, 54(5), 2575-2584.`,
    `Nagesh, P., de Boer, H. J., van Wezel, A. P., Dekker, S. C., &amp; van Vuuren, D. P. (2022). Development of chemical emission scenarios using the Shared Socio-economic Pathways. <i>Science of the Total Environment</i>, 836, 155530. <em>Source à vérifier.</em>`,
    `Nilsson, E. E., Ben Maamar, M., &amp; Skinner, M. K. (2022). Role of epigenetic transgenerational inheritance in generational toxicology. <i>Environmental Epigenetics</i>, 8(1), dvac001.`,
    `Wood, N. M., Shakeel, O., Ortega-Garcia, J. A., &amp; Miller, M. D. (2025). Integrating environmental risk factors into pediatric cancer care. <i>Current Problems in Pediatric and Adolescent Health Care</i>, 55(9), 101821.`,
    `Landrigan, P. J. (2022). Pediatric cancer and the environment — a fifty-year perspective. <i>Annals of Research in Oncology</i>, 2(2), 89-93.`,
    `Steliarova-Foucher, E., et al. (2018). Changing geographical patterns and trends in cancer incidence in children and adolescents in Europe, 1991-2010. <i>The Lancet Oncology</i>, 19(9), 1159-1169.`,
    `Institut national du cancer. <i>Panorama des cancers en France</i>, 2026. ${lien('cancer.fr', 'https://www.cancer.fr/l-institut-national-du-cancer/panorama-des-cancers-en-france')}`,
    `Bhatia, S., Tonorezos, E. S., &amp; Landier, W. (2023). Clinical care for people who survive childhood cancer: a review. <i>JAMA</i>, 330(12), 1175-1186.`,
    `Gröbner, S. N., et al. (2018). The landscape of genomic alterations across childhood cancers. <i>Nature</i>, 555(7696), 321-327.`,
    `Young, A. S., et al. (2025). The need for a cancer exposome atlas: a scoping review. <i>JNCI Cancer Spectrum</i>, 9(1), pkae122.`,
    `Braun, G., et al. (2024). Neurotoxic mixture effects of chemicals extracted from blood of pregnant women. <i>Science</i>, 386(6719), 301-309.`,
    `Escher, B. I., et al. (2017). From the exposome to mechanistic understanding of chemical-induced adverse effects. <i>Environment International</i>, 99, 97-106.`,
    `Horel, S. (2018). <i>Lobbytomie</i>. Paris : La Découverte.`,
    `Demortain, D. (2018). Are scientists agents of corporate power on public policy? <i>Pervasive Powers Conference</i>, 15-16.`,
    `Thébaud-Mony, A. (2014). <i>La science asservie : santé publique, les collusions mortifères entre industriels et chercheurs</i>. La Découverte.`,
    `Figuière, R., Borchert, F., Cousins, I. T., &amp; Ågerstrand, M. (2023). The essential-use concept. <i>Environmental Sciences Europe</i>, 35(1), 5.`,
    `Ménégoz, F. (1992). Les registres des cancers en France. <i>Bulletin épidémiologique hebdomadaire</i>, 35.`,
    `Guilhot, F., et al. (2022). Les cancers en France : vers un registre national de fonctionnement centralisé. <i>Bulletin de l'Académie Nationale de Médecine</i>, 206(3), 275-283.`,
    `Kerbrat, A. (2026). <i>Cancer : face aux maladies politiques, sans données claires, pas d'action claire</i>. Question écrite n° 14113, Assemblée nationale. ${lien('assemblee-nationale.fr', 'https://www.assemblee-nationale.fr/dyn/17/questions/QANR5L17QE14113')}`,
  ];

  return { EXERGUE, TEXTE, INCISES, SOURCES };
})();
