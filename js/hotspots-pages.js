/* ------------------------------------------------------------------ *
 *  hotspots-pages.js — le contenu éditorial des pages hotspot.
 *
 *  Un gabarit unique sert les dix pages (voir hotspot-page.js). Ce
 *  fichier ne porte que le texte : la carte d'identité, le périmètre et
 *  les chiffres viennent de NK_DATA, jamais recopiés ici.
 *
 *  HUIT BLOCS, dans le même ordre sur les dix pages. C'est cette identité
 *  de structure qui rend les dossiers comparables.
 *    0  carte d'identité      généré depuis NK_DATA
 *    1  expo      ce qu'on respire ici
 *    2  signal    qui a compté le premier
 *    3  mesure    ce que l'État a mesuré
 *    4  phrase    la phrase qui a tout arrêté      ← le dispositif signature
 *    5  manque    ce qui n'a jamais été mesuré
 *    6  acteurs   qui porte le dossier
 *    7  frise     où ça en est
 *    8  participer                                  générique
 *
 *  SEPT VARIABLES, renseignées sur les dix pages. Elles deviennent les
 *  axes de comparaison entre dossiers, et à terme les filtres de la carte.
 *
 *  Règle de contact : on ne publie que les adresses génériques que les
 *  structures diffusent elles-mêmes. Jamais d'adresse personnelle, jamais
 *  d'adresse déduite d'un nom de domaine. Quand elle manque, on l'écrit.
 * ------------------------------------------------------------------ */
window.NK_PAGES = [

/* ================================================================== 1 */
{
  id: 'h1',
  chapo: `Le dossier matriciel. Un excès d’un facteur deux reconnu par l’État, trois arrêts
    d’investigation successifs, et le collectif le mieux outillé de France, qui a fini par
    fonder son propre institut de recherche.`,
  variables: {
    alerte:     'Des parents, en avril 2017',
    maille:     'Commune, puis regroupement de cantons',
    ecart:      '19 cas officiels, 25 selon le collectif',
    cloture:    'Fluctuation aléatoire, après application de la méthode de Kulldorff',
    manque:     'Aucune mesure d’exposition aux pesticides dans l’air',
    contentieux:'Aucun. Le combat est administratif et politique.',
    collectif:  'A recensé, a financé ses analyses, a fondé un institut'
  },
  expo: [
    `Le Pays de Retz est une matrice agricole diffuse : pas d’usine à pointer du doigt, pas de
     cheminée à photographier. Des céréales, du maraîchage, et des habitations dispersées entre
     les parcelles. C’est exactement le profil d’exposition le plus difficile à documenter, parce
     qu’il n’a pas de point source.`,
    `Le collectif a fait chercher <b>sept cents molécules de pesticides</b> dans l’eau. Cinq puits
     privés ont été déclarés impropres à la consommation. Radon, sols, hydrocarbures et eau de puits
     ont été examinés par les autorités, sans qu’aucun facteur commun ne se dégage.`
  ],
  signal: [
    `Le premier signalement remonte à avril 2017. Il ne vient ni d’un médecin ni d’un registre,
     mais de parents qui se sont parlé. Dans une commune de six mille habitants, plusieurs familles
     de la même école ont eu un enfant malade en peu d’années.`,
    `Le collectif a construit son propre recensement, à la main, faute de registre régional accessible.
     C’est ce décompte citoyen qui a forcé chaque réouverture du dossier. Il arrive aujourd’hui à
     <b>25 enfants et 7 décès</b>, là où Santé publique France en retient 19.`,
    `L’écart n’est pas une erreur de l’un ou de l’autre. Il tient au périmètre géographique retenu,
     à la période, et à la limite d’âge : des cas diagnostiqués chez de jeunes majeurs sortent de la
     comptabilisation pédiatrique.`
  ],
  mesure: [
    `Trois cycles d’investigation, trois arrêts. En juillet 2018, l’excès de leucémies aiguës
     lymphoblastiques est confirmé, mais aucun élément environnemental probant n’est retenu et les
     investigations s’arrêtent. En novembre 2019, l’excès est validé une seconde fois, sans exposition
     identifiée, et Santé publique France recommande de ne pas poursuivre.`,
    `En septembre 2020, de nouvelles analyses sont conduites sur 2011-2018, en appliquant
     <b>la méthode de Kulldorff</b>. Elles n’identifient aucune agrégation significative. Les
     investigations sont arrêtées définitivement.`,
    `Ce point mérite d’être posé sans détour, parce qu’il concerne directement le projet : la méthode
     de scan spatial que l’Atlas prévoit d’employer sur l’hypospadias est celle-là même qui a servi
     à refermer ce dossier.`
  ],
  phrase: {
    texte: `L’analyse statistique spatiotemporelle n’a pas montré d’anomalie épidémiologique locale,
            malgré la perception d’un excès de cas par la population.`,
    source: `Agnès Firmin Le Bodo, ministre déléguée, en séance publique au Sénat, 25 janvier 2023`
  },
  manque: [
    `Des centaines de prélèvements ont été réalisés sur l’eau, l’air, les sols, les champs
     électromagnétiques et les rayonnements ionisants. Ce qui n’a jamais été mesuré, c’est
     <b>l’exposition aux pesticides dans l’air</b>, aux périodes de traitement, à hauteur d’enfant.`,
    `Le collectif a demandé les données brutes du registre départemental. Elles lui ont été refusées.
     Une question écrite déposée à l’Assemblée nationale en avril 2026 fait état d’un avis défavorable
     de la Commission d’accès aux documents administratifs et d’une saisine du tribunal administratif.
     Cette procédure reste à confirmer sur pièce.`
  ],
  acteurs: [
    { nom: 'Stop aux Cancers de nos Enfants', role: 'Collectif de familles. A construit le recensement citoyen.',
      mail: 'contact@stopauxcancersdenosenfants.fr', site: 'https://stopauxcancersdenosenfants.fr/contact/' },
    { nom: 'ICRePSE', role: 'Institut citoyen de recherche et de prévention en santé environnementale, né du collectif. Seule structure française de science citoyenne dédiée aux cancers pédiatriques.',
      mail: 'contact@icrepse-institut.org', site: 'https://icrepse-institut.org/contact/' },
    { nom: 'Association Henri Pézerat', role: 'Appui méthodologique et contre-expertise. Soutient publiquement le collectif.',
      mail: 'assohp@gmail.com', tel: '06 82 43 50 34' },
    { nom: 'Institut Écocitoyen pour la connaissance des pollutions', role: 'A accompagné la création de l’institut citoyen. Référence française de la recherche participative en santé environnementale.',
      mail: 'contact@institut-ecocitoyen.fr', tel: '06 99 99 13 42' }
  ],
  frise: [
    { an: '2017', t: 'Premier signalement, porté par des parents.' },
    { an: '2018', t: 'Excès de leucémies confirmé. Investigations arrêtées une première fois.' },
    { an: '2019', t: 'Nouveau signalement : 14 enfants, 3 décès, sur 7 communes. Excès validé, aucune exposition identifiée.' },
    { an: '2020', t: 'Application de la méthode de Kulldorff. Aucune agrégation significative. Arrêt définitif.' },
    { an: '2022', t: 'Le bilan de surveillance retient 19 cas. Le collectif en compte 25.' },
    { an: '2023', t: 'Réponse ministérielle au Sénat : la statistique contre la perception.' }
  ],
  sources: [
    { l: 'Santé publique France — distribution géographique des cancers pédiatriques en Loire-Atlantique',
      u: 'https://www.santepubliquefrance.fr/regions-et-territoires/pays-de-la-loire/enquetesetudes/etude-de-la-distribution-geographique-des-cancers-pediatriques-en-loire-atlantique-entre-2005-et' },
    { l: 'Sénat — question orale n° 274S et réponse du 25 janvier 2023',
      u: 'https://www.senat.fr/questions/base/2022/qSEQ22110274S.html' },
    { l: 'Assemblée nationale — rapport n° 3701 de la commission d’enquête sur la santé environnementale',
      u: 'https://www.assemblee-nationale.fr/dyn/15/rapports/cesanteenv/l15b3701-ti_rapport-enquete.pdf' }
  ]
},

/* ================================================================== 2 */
{
  id: 'h2',
  chapo: `Le cas où les citoyens ont produit la donnée que l’État ne produisait pas — et ont fini
    par obtenir une étude d’État, dont ils codirigent le comité de pilotage.`,
  variables: {
    alerte:     'Le CHU de Poitiers, en avril 2018',
    maille:     'Commune, puis registre régional',
    ecart:      'Effectifs des trois nouveaux foyers non publiés',
    cloture:    'Excès constaté, lien avec l’usine non établi',
    manque:     'Aucune mesure des pesticides dans l’air en période d’épandage',
    contentieux:'Aucun. Le rapport de force est passé par l’expertise.',
    collectif:  'A financé ses analyses, a obtenu une étude d’État, siège à son comité de pilotage'
  },
  expo: [
    `La plaine d’Aunis est un openfield céréalier, l’un des plus intensifs de Nouvelle-Aquitaine.
     Les habitations y sont enclavées dans les parcelles. À Périgny, une usine d’enrobés bitumineux
     complète le tableau : des composés organiques volatils leucémogènes y ont été mesurés au-dessus
     des normes, au niveau de l’entreprise.`,
    `L’étude d’imprégnation menée par le collectif a retrouvé <b>quatorze molécules</b> chez les
     enfants testés. L’acétamipride, un néonicotinoïde, y apparaît à des concentrations fortes chez
     les plus jeunes, ce qui signe une exposition aiguë de type épandage plutôt qu’une imprégnation
     de fond.`
  ],
  signal: [
    `Ici, l’alerte ne vient pas des familles mais de l’hôpital : le CHU de Poitiers signale la
     situation en avril 2018. Le registre des cancers de Poitou-Charentes retrouve quatre cancers
     observés pour un attendu chez les 0-24 ans à Saint-Rogatien.`,
    `Le collectif fait ensuite analyser <b>urines et cheveux de soixante-douze enfants</b>, selon un
     protocole établi avec des toxicologues. La restitution publique a lieu en octobre 2024.`,
    `Un fait est passé inaperçu et vaut d’être souligné : trois foyers nouveaux, à Saint-Vivien,
     L’Houmeau et à l’ouest de Saintes, ont été révélés par une étude sur registre financée par la
     Ligue contre le cancer. Pas par une alerte de parents. Là où un registre travaille, il trouve.`
  ],
  mesure: [
    `La première évaluation, rendue en avril 2019 par la cellule régionale de Santé publique France,
     retient un excès chez les 0-24 ans à l’échelle de la commune, sans excès tous âges sur les deux
     communes réunies.`,
    `L’étude d’État <b>EXPOSCAN</b> a été lancée sur 2026-2028. Le collectif y siège avec voix
     décisionnelle. C’est, à ma connaissance, le seul dossier français où un collectif de familles a
     obtenu ce statut.`
  ],
  phrase: {
    texte: `L’acétamipride, détecté avec un fort niveau de concentration chez les plus jeunes sujets,
            signe d’une exposition aiguë, comme lors d’un épandage, pourrait provenir d’un usage illicite.`,
    source: `Question écrite n° 1569 à l’Assemblée nationale, 29 octobre 2024 — restée sans réponse`
  },
  manque: [
    `Le collectif a produit la donnée d’imprégnation. Ce qui manque toujours, c’est la donnée
     d’exposition : personne ne mesure ce qui est épandu, quand, et à quelle distance des maisons.
     Les registres phytosanitaires des exploitants existent, mais une commission d’enquête
     parlementaire a établi en 2023 qu’ils sont tenus sur support libre, parfois sur papier, et
     qu’<b>il n’est pas possible de capitaliser dessus en l’état</b>.`,
    `C’est ce vide qui oblige le projet à passer par des proxys : surfaces agricoles du registre
     parcellaire, ventes de produits phytosanitaires, pression pesticides modélisée.`
  ],
  acteurs: [
    { nom: 'Avenir Santé Environnement', role: 'Collectif à l’origine du protocole d’imprégnation. Siège au comité de pilotage d’EXPOSCAN.',
      mail: 'avenir.sante.environnement@gmail.com', tel: '07 65 70 32 51',
      site: 'https://www.avenir-sante-environnement.fr/page/2553011-contactez-nous' },
    { nom: 'Ligue contre le cancer', role: 'A financé l’étude sur registre qui a révélé les trois nouveaux foyers.',
      mail: 'communication@ligue-cancer.net', tel: '01 53 55 24 00' },
    { nom: 'Alerte des Médecins sur les Pesticides', role: 'Caution médicale sur le lien pesticides et cancers de l’enfant.',
      mail: 'pierre-michel@alerte-medecins-pesticides.fr', tel: '06 31 23 66 72' },
    { nom: 'Coordination nationale des victimes des pesticides', role: 'Réseau de sept collectifs locaux rodés au recensement de cas.',
      mail: 'victimes@generations-futures.fr', tel: '06 87 56 27 54' }
  ],
  frise: [
    { an: '2018', t: 'Signalement par le CHU de Poitiers.' },
    { an: '2019', t: 'Note d’évaluation de la cellule régionale : 4 cancers pour 1 attendu chez les 0-24 ans.' },
    { an: '2024', t: 'Restitution de l’étude d’imprégnation : 72 enfants, 14 molécules retrouvées.' },
    { an: '2025', t: 'L’étude de la Ligue sur registre révèle trois foyers nouveaux.' },
    { an: '2026', t: 'Lancement d’EXPOSCAN. Le collectif siège au comité de pilotage.' }
  ],
  sources: [
    { l: 'ici.fr — trois nouveaux foyers de cancers pédiatriques identifiés en Charente-Maritime',
      u: 'https://www.ici.fr/emissions/l-info-d-ici-ici-la-rochelle/trois-nouveaux-foyers-de-cancers-pediatriques-ont-ete-identifies-en-charente-maritime-4617726' },
    { l: 'Assemblée nationale — question écrite n° 1569 du 29 octobre 2024',
      u: 'https://questions.assemblee-nationale.fr/q17/17-1569QE.htm' },
    { l: 'Assemblée nationale — rapport n° 2000, commission d’enquête sur les plans Écophyto',
      u: 'https://www.assemblee-nationale.fr/dyn/16/rapports/cepestici/l16b2000-t1_rapport-enquete.pdf' }
  ]
},

/* ================================================================== 3 */
{
  id: 'h4',
  chapo: `Le dossier le plus récent et le seul judiciarisé au pénal. Trois enfants d’une même école
    construite à vingt-cinq mètres d’un ancien atelier de traitement de métaux, dont un cancer qui
    compte huit cas en France en quarante ans.`,
  variables: {
    alerte:     'Des familles, relayées par la presse nationale',
    maille:     'L’établissement scolaire',
    ecart:      'Pas d’écart : 3 cas confirmés de part et d’autre',
    cloture:    'Non clos. Enquête de l’ARS en cours.',
    manque:     'Aucun dépistage des autres élèves de l’établissement',
    contentieux:'Plainte avec constitution de partie civile, 1ᵉʳ juillet 2026',
    collectif:  'Familles appuyées par des juristes, pas d’association constituée'
  },
  expo: [
    `L’école de la Gare René-Watrelot est bâtie à environ vingt-cinq mètres d’un ancien atelier de
     traitement de métaux, en activité de 1966 à 1999. Un diagnostic de sols réalisé en 2013
     y relevait benzène, toluène, xylènes, trichloréthylène, tétrachloréthylène et hydrocarbures.`,
    `Ce diagnostic existait. Les familles en ont eu connaissance après les diagnostics de leurs
     enfants. Des analyses capillaires payées par une famille ont retrouvé des métaux lourds
     chez un enfant.`
  ],
  signal: [
    `Trois cancers entre 2021 et 2025 chez des élèves de la même école : un angiosarcome mammaire,
     une leucémie, un rhabdomyosarcome. Deux décès.`,
    `L’angiosarcome mammaire est ce qui rend ce dossier singulier. C’est une tumeur d’une rareté
     extrême : <b>huit cas recensés en France en quarante ans</b>. Sa survenue chez une enfant, dans
     un établissement où deux autres cancers sont apparus, place le hasard sous une tension
     statistique inhabituelle.`
  ],
  mesure: [
    `Une enquête de l’Agence régionale de santé d’Île-de-France est en cours, pilotée par le centre
     de pathologies professionnelles et environnementales. Aucune conclusion n’a été rendue.`,
    `C’est le seul des dix dossiers où la page peut être écrite avant le verdict. Il servira de test :
     l’Atlas doit pouvoir accueillir un dossier ouvert, et le mettre à jour, sans réécrire la page.`
  ],
  phrase: {
    texte: `L’enquête est toujours en cours. Aucune phrase de clôture n’a encore été prononcée
            pour ce dossier.`,
    source: `Bloc à compléter dès la publication du rapport de l’ARS Île-de-France`,
    ouverte: true
  },
  manque: [
    `Rien n’indique que les autres élèves de l’établissement, passés ou présents, aient fait l’objet
     d’une proposition de suivi. Le diagnostic de sols de 2013 n’a été porté à la connaissance des
     familles qu’après coup.`,
    `Le Val-d’Oise n’est couvert par <b>aucun registre de cancers</b>. Les cas ne sont donc pas
     comptés localement de façon exhaustive : ils remontent au registre national des cancers de
     l’enfant, avec un décalage de plusieurs années.`
  ],
  acteurs: [
    { nom: 'Notre affaire à tous', role: 'Appui juridique aux familles.',
      site: 'https://notreaffaireatous.org/' },
    { nom: 'Cabinet de Cambiaire et Kombila', role: 'Avocats des familles. Plainte avec constitution de partie civile pour homicide involontaire.',
      mail: 'non trouvé' },
    { nom: 'Association Santé Environnement France', role: 'Réseau d’environ 2 500 médecins. Relais vers les praticiens et les pédiatres.',
      mail: 'contact@asef-asso.fr' },
    { nom: 'Réseau Environnement Santé', role: 'A imposé les perturbateurs endocriniens dans le débat public français.',
      mail: 'contact@reseau-environnement-sante.fr', tel: '07 85 37 94 80' }
  ],
  frise: [
    { an: '1966', t: 'Installation d’un atelier de traitement de métaux à 25 m de l’emplacement de l’école.' },
    { an: '2013', t: 'Diagnostic de sols : benzène, toluène, xylènes, solvants chlorés, hydrocarbures.' },
    { an: '2021', t: 'Premier diagnostic de cancer chez une élève.' },
    { an: '2025', t: 'Troisième cas. Deux décès. Les familles se regroupent.' },
    { an: '2026', t: 'Plainte avec constitution de partie civile déposée le 1ᵉʳ juillet. Enquête de l’ARS en cours.' }
  ],
  sources: [
    { l: 'Environnement Santé Politique — l’ARS enquête sur des tumeurs signalées chez des élèves du Val-d’Oise',
      u: 'https://environnementsantepolitique.fr/2026/07/02/lagence-regionale-de-sante-enquete-sur-des-tumeurs-signalees-chez-des-eleves-dun-etablissement-du-val-doise-construit-pres-dun-ancien-site-industriel-pollue/' }
  ]
},

/* ================================================================== 4 */
{
  id: 'h19',
  chapo: `La maquette grandeur nature de ce que l’Atlas veut montrer : une source industrielle unique
    et nommée, un vecteur spatial superposable au parcellaire agricole, des mesures dans les sols,
    l’eau et le sang. Il ne manque qu’une chose, et c’est la donnée sanitaire.`,
  variables: {
    alerte:     'Une enquête de presse, puis les maires',
    maille:     'La parcelle épandue, puis le réseau d’eau',
    ecart:      'Aucun décompte sanitaire, ni citoyen ni officiel',
    cloture:    'Aucune investigation d’agrégat n’a jamais été ouverte',
    manque:     'Toute la donnée sanitaire. Elle n’existe pas.',
    contentieux:'Information judiciaire ouverte. 163 foyers plaignants.',
    collectif:  'Non constitué. Le relais est municipal et judiciaire.'
  },
  expo: [
    `Pendant près de trente ans, de 1994 à 2022, les boues d’épuration d’une papeterie ont été
     épandues comme fertilisant sur les terres agricoles de la vallée. <b>356 000 tonnes</b>, sur
     au moins 2 700 hectares, dans 44 communes.`,
    `Ces boues contenaient des composés perfluorés, utilisés pour rendre les emballages alimentaires
     imperméables aux graisses. Les analyses de sols publiées en février 2026 relèvent à Villy
     457 microgrammes par kilo, dont 254 de PFOS — soit <b>soixante-six fois le seuil de référence
     belge</b>, et davantage que le maximum relevé dans la vallée de la chimie lyonnaise.`,
    `Le vecteur est parfaitement cartographiable : les parcelles ayant reçu les boues sont
     identifiées, et se superposent au registre parcellaire graphique. C’est ce qui rend ce dossier
     exemplaire pour la démonstration.`
  ],
  signal: [
    `Il n’y a pas eu d’alerte sanitaire, parce qu’il n’y a pas eu de malades qui se soient comptés.
     Le signal est venu d’analyses d’eau, puis d’une enquête de presse.`,
    `Les prises de sang réalisées ensuite sur quelques habitants donnent la mesure de l’exposition :
     150 puis environ 280 microgrammes par litre chez deux d’entre eux, soit dix-huit et trente-trois
     fois la moyenne française. Un habitant de soixante-trois ans est mesuré à <b>cinquante-neuf fois
     la moyenne</b>.`,
    `Trois mille cinq cents habitants ont été privés d’eau du robinet. Seize à dix-sept communes
     dépassaient la norme, avec des facteurs de trois à vingt-sept.`
  ],
  mesure: [
    `Une note préfectorale du 7 août 2025, à diffusion restreinte, désigne la papeterie. Elle a été
     révélée par la presse d’investigation, pas publiée.`,
    `<b>Aucune investigation d’agrégat sanitaire n’a été ouverte.</b> Les préfectures des Ardennes et
     de la Meuse ont refusé de répondre aux journalistes, et des passages de la correspondance
     officielle transmise ont été noircis.`
  ],
  phrase: {
    texte: `L’ensemble des éléments convergent pour désigner la papeterie de Stenay comme l’un des
            contributeurs principaux à la contamination.`,
    source: `Note de la préfecture de la Meuse, 7 août 2025, à diffusion restreinte — révélée par Disclose`
  },
  manque: [
    `Tout le volet sanitaire. Il n’existe ni décompte de cancers, ni décompte d’insuffisances rénales,
     ni cohorte, ni suivi des personnes dont l’imprégnation a été mesurée. Les habitants qui ont appris
     qu’ils portaient soixante fois la moyenne française n’ont bénéficié d’aucun suivi médical organisé.`,
    `Ni les Ardennes ni la Meuse ne disposent d’un registre de cancers. Ni l’un ni l’autre ne dispose
     d’un registre de malformations. Le Grand Est n’en compte aucun sur ses dix départements.`
  ],
  acteurs: [
    { nom: 'Communes plaignantes', role: 'Six communes ardennaises et la communauté de communes Portes du Luxembourg ont porté plainte en avril 2026 pour mise en danger de la vie d’autrui.',
      mail: 'passer par les mairies de Malandry et de La Ferté-sur-Chiers' },
    { nom: 'Me Laure Abramowitch', role: 'Avocate coordinatrice des 163 foyers plaignants.',
      mail: 'non trouvé' },
    { nom: 'Générations Futures', role: 'Opère le portail de témoignages victimes-pfas.fr. Benchmark direct de notre dispositif.',
      mail: 'victimes@generations-futures.fr', tel: '01 45 79 07 59' },
    { nom: 'Lorraine Nature Environnement', role: 'A porté plainte sur le dossier PFAS vosgien, même mécanisme d’épandage de boues.',
      mail: 'contact@lorrainenatureenvironnement.fr' }
  ],
  frise: [
    { an: '1994', t: 'Début des épandages autorisés de boues de papeterie sur les terres agricoles.' },
    { an: '2016', t: 'Les composés perfluorés Foraperle et Cartafluor sont inventoriés sur le site.' },
    { an: '2022', t: 'Fin des épandages, après vingt-huit ans.' },
    { an: '2024', t: 'La papeterie ferme à l’automne.' },
    { an: '2025', t: 'Juillet : interdiction de consommer l’eau. Août : la note préfectorale désigne la papeterie.' },
    { an: '2026', t: 'Janvier : information judiciaire. Avril : plainte de six communes. Été : 163 foyers plaignants.' }
  ],
  sources: [
    { l: 'Disclose — contamination omniprésente aux PFAS dans les Ardennes et la Meuse',
      u: 'https://disclose.ngo/fr/article/pfas-des-analyses-exclusives-devoilent-une-contamination-omnipresente-dans-les-ardennes-et-la-meuse' },
    { l: 'Disclose — six communes des Ardennes portent plainte pour mise en danger de la vie d’autrui',
      u: 'https://disclose.ngo/fr/article/pfas-six-communes-des-ardennes-portent-plainte-pour-mise-en-danger-de-la-vie-dautrui' }
  ]
},

/* ================================================================== 5 */
{
  id: 'h20',
  chapo: `Le seul dossier du corpus où un juge a écrit qu’un industriel nommé était à l’origine de
    l’atteinte sanitaire d’enfants. Il aura fallu treize ans de procédure.`,
  variables: {
    alerte:     'Une association de riverains, dès 1996',
    maille:     'La commune, et le voisinage immédiat de l’usine',
    ecart:      'Pas d’écart : le dépistage officiel a confirmé l’alerte',
    cloture:    'Condamnation pénale définitive',
    manque:     'Aucun suivi de cohorte des enfants dépistés en 1998',
    contentieux:'Pénal clos et gagné. Indemnitaire perdu en cassation en 2014.',
    collectif:  'A alerté avant l’État, s’est constitué partie civile'
  },
  expo: [
    `Une usine de recyclage de batteries au plomb, au cœur d’un village ardennais de quelques
     centaines d’habitants. Les rejets, atmosphériques et aqueux, portaient plomb, cadmium, arsenic,
     mercure, zinc, manganèse et dioxines. Le ruisseau qui traverse la commune a été contaminé.`,
    `L’exposition est ici de manuel : une source ponctuelle, identifiée, avec un arrêté préfectoral
     de décembre 1996 fixant des obligations, et une méconnaissance de ces obligations établie par
     la justice.`
  ],
  signal: [
    `L’association de protection et de défense de l’environnement de Bourg-Fidèle se constitue en
     1996, avant tout dépistage. Ce sont des riverains qui alertent, pas une institution.`,
    `Le dépistage conduit en 1998 par la direction départementale des affaires sanitaires et sociales
     porte sur une centaine d’enfants riverains ou enfants de salariés. <b>Quarante et un pour cent
     dépassent le seuil d’alerte</b> de 70 microgrammes par litre. Vingt-deux pour cent dépassent
     100 microgrammes.`,
    `Un dépistage complémentaire de l’Inserm, sur une trentaine de volontaires, retrouve des
     plombémies préoccupantes chez trois enfants sur six et six adultes sur vingt-quatre, avec
     un maximum adulte à 283 microgrammes par litre.`
  ],
  mesure: [
    `La chaîne judiciaire aboutit le 15 septembre 2009 devant la cour d’appel de Paris. L’arrêt est
     devenu définitif. L’amende s’élève à cent mille euros, les dommages et intérêts à cent vingt mille.`,
    `Le volet indemnitaire, en revanche, s’est retourné contre les riverains : leur pourvoi a été
     rejeté par la Cour de cassation en mars 2014. Gagner au pénal n’a pas suffi à être indemnisé.`
  ],
  phrase: {
    texte: `La pollution environnementale aux métaux lourds, générée par les activités de la société
            Métal Blanc en méconnaissance des obligations prescrites par l’arrêté préfectoral de
            décembre 1996, a été au moins l’un des facteurs de l’intoxication au plomb d’habitants
            et particulièrement d’un certain nombre d’enfants de la commune de Bourg-Fidèle
            constatée en 1998.`,
    source: `Cour d’appel de Paris, 15 septembre 2009 — arrêt définitif`,
    gagnee: true
  },
  manque: [
    `Les enfants dépistés en 1998 ont aujourd’hui la trentaine. <b>Aucune cohorte n’a été constituée</b>
     pour suivre ce que devient une génération exposée au plomb dans l’enfance. Une campagne de
     dépistage a été rouverte en 2024, vingt-six ans après la première, sans lien de suivi avec elle.`,
    `C’est le paradoxe de ce dossier : la causalité est jugée, la source est nommée, la condamnation
     est définitive, et personne ne sait ce que sont devenus les enfants concernés.`
  ],
  acteurs: [
    { nom: 'Association des Familles Victimes du Saturnisme', role: 'Référence nationale sur le saturnisme. Suit le dossier depuis l’origine.',
      mail: 'afvs@afvs.net', tel: '09 53 27 25 45' },
    { nom: 'Association de protection et de défense de l’environnement de Bourg-Fidèle', role: 'À l’origine de l’alerte, dès 1996. Partie civile.',
      mail: 'non trouvé' },
    { nom: 'France Nature Environnement', role: 'Partie civile au procès.',
      mail: 'contact@fne.asso.fr', tel: '09 88 19 55 80' },
    { nom: 'ARS Grand Est', role: 'Pilote la campagne de dépistage rouverte en 2024.',
      tel: '03 83 39 30 30' }
  ],
  frise: [
    { an: '1996', t: 'Constitution de l’association de riverains. Arrêté préfectoral fixant les obligations de l’usine.' },
    { an: '1998', t: 'Dépistage : 41 % des enfants au-dessus du seuil d’alerte.' },
    { an: '2009', t: 'La cour d’appel de Paris établit le lien entre la pollution de l’usine et l’intoxication des enfants.' },
    { an: '2014', t: 'La Cour de cassation rejette le pourvoi indemnitaire des riverains.' },
    { an: '2024', t: 'Réouverture d’une campagne de dépistage du saturnisme.' }
  ],
  sources: [
    { l: 'Actu-Environnement — pollution aux métaux lourds, mise en danger d’autrui confirmée',
      u: 'https://www.actu-environnement.com/ae/news/cassation-metaux-lourds-pollution-plomb-cadmium-mise-en-danger-autrui-dommage-21098.php4' },
    { l: 'AFVS — Bourg-Fidèle, la mise en danger d’autrui confirmée',
      u: 'http://www.afvs.net/bourg-fidele-la-mise-en-danger-dautrui-confirmee/' }
  ]
},

/* ================================================================== 6 */
{
  id: 'h17',
  chapo: `Les parents ont payé eux-mêmes les premières analyses. L’État a été condamné en 2025.
    Et les chiffres de la contamination ont changé sans qu’aucun enfant ne change, parce que
    les seuils de référence ont bougé.`,
  variables: {
    alerte:     'Des parents, après les inondations d’octobre 2018',
    maille:     'La vallée, puis la commune',
    ecart:      '38 sur 103 en juin 2019, puis 8 sur 293 après révision des seuils',
    cloture:    'Non close. L’État a été condamné et a fait appel.',
    manque:     'Aucun suivi de cohorte des enfants surexposés',
    contentieux:'État condamné en juillet 2025. Appel formé en septembre.',
    collectif:  'A financé les premières analyses, a fait condamner l’État'
  },
  expo: [
    `L’ancienne mine d’or de Salsigne a été la plus grande d’Europe occidentale, et l’un des plus
     importants producteurs mondiaux d’arsenic. Elle a laissé des millions de tonnes de déchets
     arséniés dans la vallée.`,
    `En octobre 2018, des inondations exceptionnelles ont lessivé ces déchets et les ont répandus
     dans les jardins, les cours d’école et les habitations en aval. L’exposition ne date pas de
     l’événement, mais l’événement l’a rendue visible.`
  ],
  signal: [
    `Les premières analyses d’arsenic urinaire sur les enfants ont été <b>payées par les parents</b>.
     C’est ce geste qui a forcé la mise en place d’un dispositif public.`,
    `En juin 2019, trente-huit enfants sur cent trois testés dépassent le seuil. En août, quarante-six
     sur cent quarante-trois. Puis, sur deux cent quatre-vingt-treize enfants testés entre juin 2019
     et décembre 2020, huit sont déclarés surexposés — soit 2,7 %.`,
    `Cette chute n’est pas une amélioration. Elle vient d’une <b>révision des recommandations de la
     Haute Autorité de santé</b> sur le seuil retenu. Les mêmes enfants, les mêmes prélèvements, un
     autre chiffre. Ce dossier est le meilleur objet pédagogique du corpus sur ce qu’un seuil décide.`
  ],
  mesure: [
    `Un dispositif de suivi a été mis en place par l’Agence régionale de santé. Il a été jugé
     insuffisant : le tribunal administratif de Montpellier a condamné l’État en juillet 2025.`,
    `L’État a fait appel le 25 septembre 2025, tout en reconnaissant le préjudice écologique.`
  ],
  phrase: {
    texte: `Les chiffres de la surexposition ont été divisés par plus de dix sans qu’aucun enfant
            n’ait changé, parce que la recommandation nationale sur le seuil a été révisée
            entre-temps.`,
    source: `Constat établi en comparant les campagnes de 2019 et le bilan à décembre 2020`,
    constat: true
  },
  manque: [
    `Il n’existe aucun suivi de cohorte des enfants surexposés. L’arsenic inorganique est un
     cancérogène avéré du groupe 1, avec des latences longues : ce sont précisément les situations
     où un suivi prolongé aurait un sens.`,
    `Attention au cadrage : ce dossier n’est <b>pas</b> un agrégat de cancers. C’est une surexposition
     documentée. Le présenter autrement exposerait le projet à une critique immédiate et fondée.`
  ],
  acteurs: [
    { nom: 'Association Henri Pézerat', role: 'Santé, travail, environnement. Appui aux luttes sanitaires locales.',
      mail: 'assohp@gmail.com', tel: '06 82 43 50 34' },
    { nom: 'ECCLA', role: 'Écologie du Carcassonnais, des Corbières, du Lauragais et de l’Aude, présidée par Maryse Arditi.',
      mail: 'passer par FNE Occitanie' },
    { nom: 'Collectif Pour que vive la vallée de l’Orbiel', role: 'Collectif de riverains et de parents.',
      mail: 'non trouvé' },
    { nom: 'France Nature Environnement', role: 'Porte le dossier au niveau national.',
      mail: 'contact@fne.asso.fr', tel: '09 88 19 55 80' }
  ],
  frise: [
    { an: '2018', t: 'Inondations d’octobre. Les déchets arséniés descendent dans la vallée.' },
    { an: '2019', t: 'Juin : 38 enfants surexposés sur 103 testés. Les premières analyses ont été payées par les parents.' },
    { an: '2020', t: 'Bilan à décembre : 8 enfants surexposés sur 293, après révision des seuils par la Haute Autorité de santé.' },
    { an: '2025', t: 'Juillet : le tribunal administratif de Montpellier condamne l’État. Septembre : l’État fait appel.' }
  ],
  sources: [
    { l: 'France Nature Environnement — Salsigne, la vallée de l’arsenic, un scandale d’État',
      u: 'https://fne.asso.fr/actualites/salsigne-la-vallee-de-l-arsenic-un-scandale-d-etat' }
  ]
},

/* ================================================================== 7 */
{
  id: 'h21',
  chapo: `La leçon de participation, et elle est directement transposable au questionnaire :
    quatre-vingt-onze pour cent des enfants ont été invités au dépistage, vingt-quatre pour cent
    sont venus.`,
  variables: {
    alerte:     'Un siècle de contentieux, puis un dépistage institutionnel',
    maille:     'Cinq communes du bassin',
    ecart:      '7 752 enfants invités, 1 892 dépistés',
    cloture:    'Prévalence jugée comparable à la moyenne métropolitaine',
    manque:     'Les trois quarts des enfants n’ont pas été mesurés',
    contentieux:'Cour d’appel de Douai, mai 2024 : 1,2 M€ à 51 riverains',
    collectif:  'Réseau national structuré, ancrage local plus diffus'
  },
  expo: [
    `La fonderie Metaleurop a fonctionné de 1894 à 2003. Un siècle de retombées de plomb et de
     cadmium sur les sols de cinq communes. La fermeture n’a rien retiré du sol : le plomb ne se
     dégrade pas, il reste dans les jardins, les potagers et les cours.`,
    `C’est un cas d’exposition héritée. La source a disparu, l’exposition demeure, et le risque
     principal passe par l’autoproduction alimentaire et les mains des enfants.`
  ],
  signal: [
    `Le dépistage conduit du 15 juin au 6 novembre 2022 a visé large : <b>7 752 enfants invités</b>,
     soit quatre-vingt-onze pour cent des mineurs des cinq communes. C’est un taux de couverture
     que peu de dispositifs atteignent.`,
    `Mille huit cent quatre-vingt-douze plombémies ont été réalisées. <b>Vingt-quatre pour cent de
     participation.</b> Huit cas de saturnisme et quatre-vingt-trois enfants au-dessus du seuil de
     vigilance en sont sortis.`,
    `Ce chiffre est le plus important de toute la série pour le projet, et il ne parle pas de plomb.
     Il dit qu’une invitation institutionnelle, même massive, même gratuite, même portée par les
     autorités sanitaires, plafonne au quart de la population cible quand aucun relais militant
     ne l’accompagne.`
  ],
  mesure: [
    `Santé publique France conclut que la prévalence du saturnisme chez les 0-6 ans y est comparable
     à celle de la population générale métropolitaine.`,
    `Cette conclusion doit être lue avec le taux de participation à côté. Elle porte sur les enfants
     qui sont venus, et il est difficile de savoir si ceux qui ne sont pas venus leur ressemblent.`
  ],
  phrase: {
    texte: `La prévalence du saturnisme chez les enfants de 0 à 6 ans est comparable à celle
            observée dans la population générale métropolitaine.`,
    source: `Santé publique France, analyse épidémiologique du dépistage 2022`
  },
  manque: [
    `Trois enfants sur quatre n’ont pas été mesurés. Le dispositif ne dit rien d’eux, et rien n’indique
     que les familles les plus exposées soient celles qui se déplacent le plus.`,
    `C’est le biais de participation, et c’est exactement celui que notre questionnaire rencontrera.
     À la différence près que le nôtre sera volontaire de bout en bout, donc plus exposé encore.`
  ],
  acteurs: [
    { nom: 'Association des Familles Victimes du Saturnisme', role: 'Référence nationale. Accompagne les familles dans la reconnaissance et le relogement.',
      mail: 'afvs@afvs.net', tel: '09 53 27 25 45' },
    { nom: 'Collectifs Pige et APRÈS!', role: 'Collectifs locaux du bassin. Coordonnées à confirmer.',
      mail: 'non trouvé' },
    { nom: 'Enfants Cancers Santé', role: 'Antenne régionale Nord-Pas-de-Calais-Somme, non encore sollicitée.',
      mail: 'secretariat@enfants-cancers-sante.fr' },
    { nom: 'Registre général des cancers de Lille et sa région', role: 'Détenteur de la donnée cancer à maille fine sur la métropole.',
      mail: 'passer par le registre, contact générique non publié' }
  ],
  frise: [
    { an: '1894', t: 'Mise en service de la fonderie.' },
    { an: '2003', t: 'Fermeture. Les sols restent contaminés au plomb et au cadmium.' },
    { an: '2022', t: 'Dépistage : 7 752 enfants invités, 1 892 dépistés, 8 cas de saturnisme, 83 au-dessus du seuil de vigilance.' },
    { an: '2024', t: 'La cour d’appel de Douai accorde environ 1,2 million d’euros à 51 riverains pour perte de valeur vénale.' }
  ],
  sources: [
    { l: 'Santé publique France — analyse épidémiologique du dépistage des plombémies',
      u: 'https://www.actu-environnement.com/media/pdf/news-41945-synthese-sante-publique-france-analyse-epidemiologique-saturnisme-plombemie.pdf' }
  ]
},

/* ================================================================== 8 */
{
  id: 'h6',
  chapo: `La démonstration la plus nette, en France, de ce qu’une maille géographique décide.
    Le même jeu d’enfants donne un excès flagrant à l’échelle de la commune, et un signal banal
    à l’échelle du canton.`,
  variables: {
    alerte:     'Des parents d’enfants malades, en octobre 2019',
    maille:     'Commune, canton, puis registre national',
    ecart:      '11 cas signalés, 16 selon le collectif',
    cloture:    'Fluctuation aléatoire de la répartition spatio-temporelle',
    manque:     'Aucune campagne de mesures environnementales n’a été jugée justifiée',
    contentieux:'Aucun',
    collectif:  'A recensé, a fait doser les enfants, conteste la clôture'
  },
  expo: [
    `Le secteur est situé dans la vallée de la Seine, à la charnière entre l’agriculture du plateau
     et le tissu industriel de l’axe Rouen-Paris. Aucune source ponctuelle n’a été identifiée.`,
    `Le collectif a fait réaliser ses propres analyses sur l’eau, les sols et les cheveux des enfants.
     Du plomb et des terres rares y ont été retrouvés. Ces résultats n’ont pas modifié la conduite
     de l’investigation officielle.`
  ],
  signal: [
    `Onze enfants avec un diagnostic de cancer entre 2017 et 2019, sur un petit groupe de communes.
     Le signalement vient des parents, et l’Agence régionale de santé saisit Santé publique France
     en octobre 2019.`,
    `Le collectif revendique aujourd’hui seize enfants malades en cinq ans, et conteste la fermeture
     du dossier.`
  ],
  mesure: [
    `L’investigation ne retrouve <b>aucun excès tous cancers confondus</b>. Restreinte aux leucémies,
     elle fait apparaître un excès net à l’échelle communale : un ratio standardisé d’incidence de
     <b>6,4</b>, avec un intervalle de confiance de 2,3 à 14,0.`,
    `À l’échelle cantonale, sur les mêmes cas, le ratio tombe à <b>2,3</b>, intervalle de 0,8 à 5,0 —
     c’est-à-dire qu’il cesse d’être significatif.`,
    `En 2025, avec les données consolidées du registre national des cancers de l’enfant sur
     2017-2022, un troisième chiffre apparaît : <b>2,6</b>, intervalle de 0,84 à 6,14, soit cinq cas
     observés pour 1,9 attendus. Aucun nouveau cas entre 2020 et 2022.`,
    `Trois chiffres, un seul groupe d’enfants. C’est la meilleure illustration disponible de ce que
     le choix de la maille produit — et la raison pour laquelle le pilote descend à l’IRIS.`
  ],
  phrase: {
    texte: `Les résultats sont en faveur des conclusions du rapport d’investigation initial, à savoir
            celles d’une fluctuation aléatoire de la répartition spatio-temporelle du nombre de cas.`,
    source: `Santé publique France, bilan de surveillance post-investigation, 26 septembre 2025`
  },
  manque: [
    `Une étude par questionnaire auprès des parents et un état des lieux environnemental n’ont pas
     identifié de facteur commun. Santé publique France en a conclu qu’<b>en l’absence d’hypothèse
     étiologique, la réalisation d’une campagne de mesures environnementales spécifique ne se
     justifiait pas</b>.`,
    `La logique est circulaire, et elle mérite d’être exposée telle quelle : sans hypothèse, pas de
     mesure. Sans mesure, pas d’hypothèse.`
  ],
  acteurs: [
    { nom: 'Cancers, la vérité pour nos enfants', role: 'Collectif de familles. A construit son recensement et fait doser les enfants. Bureau nommé publiquement.',
      mail: 'cancersped27@laposte.net', site: 'https://www.cancers-la-verite-pour-nos-enfants.org/' },
    { nom: 'Santé publique France Normandie', role: 'Cellule régionale, autrice de l’investigation et du bilan de 2025.',
      mail: 'normandie@santepubliquefrance.fr', tel: '02 31 70 96 96' },
    { nom: 'Registre national des cancers de l’enfant', role: 'Source des données consolidées. Couvre la Normandie, faute de registre régional pédiatrique.',
      site: 'https://rnce.inserm.fr/' },
    { nom: 'ADEVA 27', role: 'Réseau de victimes déjà constitué dans l’Eure, sur un autre risque.',
      mail: 'adevaeure@gmail.com' }
  ],
  frise: [
    { an: '2019', t: 'Signalement par des parents. L’ARS saisit Santé publique France en octobre.' },
    { an: '2022', t: 'Rapport d’investigation : SIR de 6,4 à la commune, 2,3 au canton. Hypothèse d’un regroupement ponctuel.' },
    { an: '2023', t: 'Mise à jour du rapport. Surveillance renforcée maintenue.' },
    { an: '2025', t: 'Bilan du 26 septembre : SIR de 2,6 sur données consolidées, aucun nouveau cas depuis 2020. Surveillance levée.' }
  ],
  sources: [
    { l: 'Santé publique France — bilan de surveillance post-investigation du cluster de leucémies pédiatriques',
      u: 'https://www.santepubliquefrance.fr/regions-et-territoires/normandie/enquetesetudes/bilan-de-surveillance-post-investigation-du-cluster-de-leucemies-pediatriques-dans-le-secteur-de' }
  ]
},

/* ================================================================== 9 */
{
  id: 'h3',
  chapo: `L’un des deux seuls agrégats pédiatriques officiellement confirmés en France, et le seul
    confirmé à la fois pour l’ensemble des cancers et pour les leucémies. Les familles attendent
    depuis des analyses qui n’ont jamais été faites.`,
  variables: {
    alerte:     'Des familles, relayées localement',
    maille:     'Six communes de montagne',
    ecart:      'Pas d’écart notable. Le décompte officiel fait référence.',
    cloture:    'Excès confirmé, aucun facteur de risque commun identifié',
    manque:     'Les analyses d’eau et d’air au domicile des enfants',
    contentieux:'Aucun',
    collectif:  'Informel, sans structure juridique. Mobilisation affaiblie.'
  },
  expo: [
    `Le Haut-Jura n’a ni grande industrie chimique ni agriculture intensive. C’est un plateau de
     montagne, avec un passé de lunetterie et de tournerie, et un sous-sol calcaire.`,
    `Radon, qualité de l’air, lignes à très haute tension et transformateurs ont été examinés
     par les autorités, et écartés. C’est un dossier où l’on a cherché, et où l’on n’a rien trouvé.
     Ce qui le rend plus troublant, pas moins.`
  ],
  signal: [
    `Treize cas de cancer chez des moins de quinze ans, plus quatre chez des plus de quinze ans,
     sur la décennie 2010-2020. <b>Sept sont des leucémies.</b>`,
    `Sur six communes de montagne dont la population totale se compte en milliers d’habitants,
     l’ordre de grandeur suffit à ce que les familles se connaissent entre elles.`
  ],
  mesure: [
    `Santé publique France a confirmé l’excès, et l’a confirmé deux fois : pour l’ensemble des
     cancers, et spécifiquement pour les leucémies. C’est rare. Sur la quasi-totalité des dossiers
     du corpus, la confirmation ne tient qu’à une seule des deux analyses.`,
    `Aucun facteur de risque commun n’a été identifié. Les investigations se sont arrêtées là,
     conformément à la méthodologie en vigueur : sans piste d’exposition, l’étape suivante n’est
     pas déclenchée.`
  ],
  phrase: {
    texte: `L’excès est confirmé pour l’ensemble des cancers comme pour les leucémies. Aucun facteur
            de risque commun aux cas n’a pu être identifié.`,
    source: `Santé publique France, investigation d’un agrégat spatio-temporel de cancers pédiatriques dans le Haut-Jura`
  },
  manque: [
    `Les familles demandent depuis le début des <b>analyses d’eau et d’air au domicile des enfants
     malades</b>. Elles n’ont jamais été réalisées. C’est la demande la plus simple et la moins
     coûteuse de tout le corpus, et elle est restée sans suite.`,
    `Le dossier est réactivable. C’est probablement, sur les dix, celui où un appel à témoignages
     aurait l’effet le plus immédiat : l’excès est officiellement reconnu, les familles sont
     identifiées, et il n’y a plus de structure pour les fédérer.`
  ],
  acteurs: [
    { nom: 'Collectif de familles du Haut-Jura', role: 'Informel, sans structure juridique. Porte-parole : Chloé Fourchon. Contact générique non publié.',
      mail: 'non trouvé' },
    { nom: 'Stop aux Cancers de nos Enfants', role: 'Documente ce cluster. Meilleure porte d’entrée vers les familles du Haut-Jura.',
      mail: 'contact@stopauxcancersdenosenfants.fr' },
    { nom: 'Le Liseron', role: 'Association de parents rattachée au CHU de Besançon, hôpital de référence du secteur.',
      mail: 'asso.leliseron@wanadoo.fr', tel: '09 62 38 78 70' },
    { nom: 'Semons l’Espoir', role: 'A créé la Maison des Familles de Franche-Comté.',
      mail: 'semons.lespoir@wanadoo.fr', tel: '03 81 38 27 38' }
  ],
  frise: [
    { an: '2010', t: 'Début de la période sur laquelle l’excès sera constaté.' },
    { an: '2019', t: 'Saisine de Santé publique France par l’agence régionale de santé.' },
    { an: '2022', t: 'Rapport d’investigation : excès confirmé pour tous cancers et pour les leucémies. Aucun facteur commun.' },
    { an: '2026', t: 'Veille maintenue. Les analyses au domicile demandées par les familles n’ont toujours pas été réalisées.' }
  ],
  sources: [
    { l: 'Santé publique France — investigation d’un agrégat spatio-temporel de cancers pédiatriques dans le Haut-Jura',
      u: 'https://www.santepubliquefrance.fr/regions-et-territoires/bourgogne-franche-comte/enquetesetudes/investigation-dun-agregat-spatio-temporel-de-cancers-pediatriques-dans-le-haut-jura' }
  ]
},

/* ================================================================= 10 */
{
  id: 'h5',
  chapo: `Ce dossier figure ici précisément parce qu’il est vide. Un excès confirmé par deux sources
    indépendantes, sur le terrain exact du pilote Rhône-Alpes, et personne, côté familles,
    n’occupe le terrain.`,
  variables: {
    alerte:     'Le Centre Léon Bérard, en janvier 2020',
    maille:     'Deux arrondissements urbains',
    ecart:      'Aucun. Il n’y a pas de décompte citoyen.',
    cloture:    'Fluctuation aléatoire, en défaveur d’un agrégat caractérisé',
    manque:     'Aucune exposition environnementale distinctive recherchée sur place',
    contentieux:'Aucun',
    collectif:  'Inexistant'
  },
  expo: [
    `Un secteur urbain dense, sans site industriel identifié à proximité immédiate. La Croix-Rousse
     est un quartier d’habitation ancien, sur un plateau dominant la ville.`,
    `Aucune exposition environnementale distinctive n’a été retrouvée. À la différence de tous les
     autres dossiers de cette série, il n’y a pas de source à montrer sur la carte.`
  ],
  signal: [
    `L’alerte ne vient pas de parents. Elle vient du <b>Centre Léon Bérard</b>, qui signale la
     situation à l’agence régionale de santé et à Santé publique France en janvier 2020.`,
    `C’est la différence structurante avec les neuf autres pages : ici, l’institution a fait son
     travail de veille, et il ne s’est rien passé ensuite du côté des habitants. Aucun collectif
     ne s’est formé, aucun recensement citoyen n’existe, aucune contre-expertise n’a été demandée.`
  ],
  mesure: [
    `L’excès est confirmé par deux sources indépendantes. Le registre national des cancers de
     l’enfant donne un ratio standardisé d’incidence de <b>1,66</b>, intervalle de confiance de
     1,05 à 2,49. Les données du Centre Léon Bérard donnent <b>1,58</b>, intervalle de 1,10 à 2,10.`,
    `Dans les deux cas, l’intervalle exclut la valeur 1. L’excès est donc statistiquement
     significatif, et il l’est deux fois, avec deux jeux de données différents.`,
    `La conclusion du rapport du 29 avril 2024 retient néanmoins une fluctuation aléatoire, en
     défaveur d’un agrégat caractérisé.`
  ],
  phrase: {
    texte: `Un excès statistiquement significatif est retrouvé sur les deux sources de données,
            mais la conclusion retenue est celle d’une fluctuation aléatoire, en défaveur d’un
            agrégat caractérisé.`,
    source: `Santé publique France Auvergne-Rhône-Alpes, rapport du 29 avril 2024`
  },
  manque: [
    `Ce qui manque ici n’est pas une donnée, c’est une contrepartie. Aucun collectif ne s’est
     constitué, donc personne n’a demandé de mesures, personne n’a fait doser d’enfant, personne
     n’a contesté la conclusion, et personne ne relaiera un appel à témoignages.`,
    `Le contraste avec Sainte-Pazanne est frappant et instructif. Excès comparable, conclusion
     comparable, et deux trajectoires opposées — non pas à cause de la science, mais à cause de
     ce qui s’est passé, ou non, dans le voisinage.`,
    `Pour un dispositif participatif, c’est le cas qui compte le plus : il montre à quoi ressemble
     un territoire où l’on n’a personne à qui parler.`
  ],
  acteurs: [
    { nom: 'Cancer Environnement, Centre Léon Bérard', role: 'À l’origine du signalement. Caution scientifique institutionnelle, sur le terrain du pilote.',
      mail: 'cancer-environnement@lyon.unicancer.fr', tel: '04 78 78 26 45' },
    { nom: 'APPEL', role: 'Association de parents rattachée à l’IHOPe et au Centre Léon Bérard. Fondée en 1978. Le relais le plus direct vers les familles lyonnaises.',
      mail: 'contact@appel-rhone-alpes.com', tel: '04 72 56 07 89' },
    { nom: 'REMERA', role: 'Registre des malformations en Rhône-Alpes, registre source du pilote hypospadias.',
      mail: 'contact@remera.fr', tel: '04 78 58 34 84' },
    { nom: 'Aidons Marina', role: 'Association de familles basée dans le Rhône. Même présidente que la fédération Grandir Sans Cancer.',
      mail: 'contact@aidonsmarina.com', tel: '06 60 39 93 03' }
  ],
  frise: [
    { an: '2013', t: 'Début de la période sur laquelle l’excès sera constaté.' },
    { an: '2020', t: 'Signalement par le Centre Léon Bérard à l’ARS et à Santé publique France.' },
    { an: '2024', t: 'Rapport du 29 avril : excès significatif sur deux sources, conclusion de fluctuation aléatoire.' },
    { an: '2026', t: 'Toujours aucun collectif de familles constitué.' }
  ],
  sources: [
    { l: 'Santé publique France — suspicion d’agrégat spatio-temporel de cancers pédiatriques à Lyon entre 2013 et 2019',
      u: 'https://www.santepubliquefrance.fr/regions-et-territoires/auvergne-rhone-alpes/enquetesetudes/suspicion-dagregat-spatio-temporel-de-cancers-pediatriques-a-lyon-entre-2013-et-2019-rapport' }
  ]
}

];

/* Libellés des sept variables, définis une fois pour les dix pages. */
window.NK_VARIABLES = [
  ['alerte',      'Qui a donné l’alerte'],
  ['maille',      'La maille qui décide'],
  ['ecart',       'L’écart de décompte'],
  ['cloture',     'Le motif de clôture'],
  ['manque',      'La donnée manquante'],
  ['contentieux', 'État du contentieux'],
  ['collectif',   'Capacité du collectif'],
];
