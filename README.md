# Démo carto — Atlas de l'exposome

Carte des clusters de cancers pédiatriques documentés en France, et de la couche participative
qui l'accompagne. **deck.gl posé sur MapLibre GL JS**, fond de carte auto-hébergé.

## Lancer

```bash
python3 demo-cartes/scripts/serve.py
```

Puis ouvrir <http://localhost:8777>. Aucune installation, aucune clé d'API.

Ne pas utiliser `python3 -m http.server` : il ne répond pas aux requêtes HTTP Range,
et le fond de carte auto-hébergé se lit par tranches d'octets. Il resterait vide en local
alors qu'il fonctionne en ligne.

Régénérer le jeu de données :

```bash
cd demo-cartes && python3 scripts/generate-data.py
```

---

## 1. Le moteur : deck.gl + MapLibre GL JS

**Arbitrage rendu.** Trois moteurs ont été comparés sur la même donnée et la même interface :
MapLibre GL JS seul, Leaflet, et deck.gl posé sur MapLibre. Le troisième est retenu, les deux
autres sont retirés du dépôt.

| | **deck.gl + MapLibre** *(retenu)* | MapLibre seul | Leaflet |
|---|---|---|---|
| Licence | MIT + BSD-3 | BSD-3 | BSD-2 |
| Rendu | WebGL par lots | WebGL | Canvas/SVG |
| Points confortables | **~1 000 000** | ~10 000 | ~1 000 |
| Style du fond | JSON écrit à la main | JSON | image, non modifiable |
| Libellés en français | oui, `name:fr` | oui | non, dessinés dans la tuile |
| Agrégation, 2,5D | **natives** | à coder | plugin |
| Tuiles auto-hébergées | oui, PMTiles | oui | non sans plugin |

**Ce qui a tranché.** La couche participative est faite pour grossir : 420 cas simulés
aujourd'hui, plusieurs milliers si le questionnaire prend. Leaflet décroche autour du millier de
marqueurs, MapLibre seul tient mais impose de coder l'agrégation à la main. deck.gl la fait
nativement, et il n'ajoute rien à installer puisqu'il **s'appuie sur le même MapLibre** pour le
fond et la caméra. Le fond, le zoom continu et la francisation des libellés viennent donc de
MapLibre ; les couches de données, le dégradé des taches et l'agrégation hexagonale de deck.gl.

Les deux différences qui se voyaient à l'écran pendant la comparaison restent utiles à connaître :
Leaflet compte en tuiles de 256 px là où MapLibre compte en 512 (un même cadrage y vaut
`zoom + 1`), et ses libellés étant dessinés dans l'image, aucune traduction n'est possible côté
client. Ce sont deux raisons de ne pas y revenir.

### Deux objets, deux formes

C'est la décision de lisibilité la plus importante de la carte, et elle est volontairement
grossière.

| | **Carré** numéroté, bord d'encre | **Tache** ronde, dégradée, sans bord |
|---|---|---|
| Ce que c'est | un cluster ou un signalement instruit | des cas déclarés par des familles |
| Origine | Santé publique France, registres, presse | le questionnaire du site |
| Localisation | périmètre publié, tracé | secteur d'environ 25 km, jamais une adresse |
| Ce qu'on peut en dire | une mesure officielle, un rapport source | un signal, rien de plus |

Un carré a des angles : il affirme un périmètre. Une tache n'en a pas : elle situe sans
délimiter. Aucun contour n'est jamais dessiné autour des cas déclarés — le flou **est** le
message, pas un effet graphique.

### Le fond de carte est le nôtre

Plus de dépendance à un serveur de tuiles tiers.

`tiles/france.pmtiles` (82 Mo) contient la France métropolitaine jusqu'au zoom 9, extraite du
build public **Protomaps** (données OpenStreetMap). Le navigateur ne télécharge pas les 82 Mo :
PMTiles lit le fichier **par tranches d'octets**, seules les tuiles affichées transitent.

Le style est écrit à la main dans `js/style-nk.js` : une trentaine de lignes de couleurs et une
douzaine de couches. Deux gains concrets :

- **les libellés sont en français nativement**, lus dans le champ `name:fr` des tuiles, sans la
  réécriture côté client qu'imposait CARTO ;
- **la charte NK de septembre se posera à deux endroits** : le bloc `PALETTES` de ce fichier et
  le bloc `:root` de `css/app.css`. Rien d'autre.

Régénérer ou étendre le fichier :

```bash
pmtiles extract https://build.protomaps.com/AAAAMMJJ.pmtiles demo-cartes/tiles/france.pmtiles \
  --bbox=-5.4,41.2,9.8,51.3 --maxzoom=9
```

**La limite à connaître.** Au-delà du zoom 9, MapLibre réutilise les tuiles du zoom 9 : au plus
près des petits clusters (Franconville, Croix-Rousse) la géométrie s'épaissit. Monter à
`--maxzoom=12` donnerait un rendu net, mais dépasserait la limite de 100 Mo par fichier de GitHub.
La réponse de production est de poser le fichier sur du stockage objet (Cloudflare R2, S3), où
cette limite n'existe pas, et de ne changer qu'une URL dans `style-nk.js`.

**Repli.** Si le fichier est absent, les deux moteurs retombent automatiquement sur CARTO et
le signalent dans la console. La démo ne casse pas.

La mer est volontairement plus foncée que la terre : sans ce contraste, le contour de la France
ne se lit pas, et un fond qu'on ne reconnaît pas comme une carte ne sert à rien en arrière-plan
du déroulé.

---

## 2. Les fonctionnalités demandées, et où elles en sont

| Demande | État | Où ça se passe |
|---|---|---|
| Playback automatique de témoignages audio | **fait** | barre en bas à gauche, mode « Témoignages » : la carte vole de secteur en secteur, ouvre la fiche et lit l'enregistrement, en boucle |
| Cas issus du questionnaire, cliquables | **fait** | 100 témoignages, regroupés en secteurs flous cliquables (voir §3) |
| Fiche claire au clic | **fait** | panneau de gauche en bureau, feuille glissante en mobile |
| Couleur par type de cancer | **fait** | leucémie aiguë (rouge), tumeur du SNC (cyan), lymphome (jaune) — filtrables ; un secteur prend la couleur dominante et détaille sa répartition |
| Zones de cluster mises en évidence | **fait** | 6 polygones + pastilles numérotées, couleur selon le statut du dossier |
| Pop-up au survol d'une zone, avec liens | **fait** | mesure officielle, catégorie, pathologies, lien vers le rapport source |
| Bouton questionnaire / « en savoir plus » | **fait** | « Je participe » ouvre le questionnaire, « Récit » rejoue le déroulé |
| **Zone floue au lieu du point individuel** | **fait** | voir §3, c'est le changement structurant |
| **Questionnaire de démonstration** | **fait** | `questionnaire.html`, 5 étapes, géocodage réel, e-mail haché |
| **Section 1 = déroulé narratif** | **fait** | 8 points en grille, deux écrans, carte teasée derrière |
| **Chaque concept mène à sa page** | **fait** | `concept.html?id=…`, un gabarit, contenu dans `js/concepts.js` |
| **Page de transition avant le formulaire** | **fait** | `participer.html` : ce qu'on demande, ce qu'on en fait, espace d'échange |
| **Formulaire atteignable depuis les fiches** | **fait** | bloc « Ajouter mon cas » sur cluster, secteur, cas particulier, signalement |
| **Lien hotspot ↔ cas particuliers** | **fait** | la fiche cluster liste les témoignages de sa zone, et chaque cas renvoie à son cluster |
| Lisible sur mobile | **fait** | voir plus bas |

### La structure, alignée sur le flow du 28/07

Une page principale, deux sections, dans cet ordre.

**Section 1, le déroulé.** Huit points présentés en **grille**, pas en colonne : deux lignes de
teaser chacun, l'ensemble tient en deux écrans. Les 200 mots et les sources sont sur la **page
dédiée** qu'ouvre « Creuser ce point » — le « click sur un des concepts à creuser » du flow.

**Trois chemins vers la carte**, du plus rapide au plus lent :

1. **« Carte » dans la barre du haut**, et un bouton dans le premier écran ;
2. **une pastille flottante** « Voir la carte », qui apparaît dès qu'on commence à défiler ;
3. **la carte elle-même**, qui se dévoile au défilement et **passe en plein écran toute seule**
   en fin de course. Pas de clic, pas de changement de page.

Le point à ne pas refaire : la carte **garde son opacité**, c'est un voile posé par-dessus qui
l'assombrit et se lève au défilement. Une carte affichée à 20 % d'opacité ne se voit pas, quel
que soit le fond — c'était le premier essai, et il ne marchait pas. Le voile tient pendant la
lecture (les huit points), puis tombe sur le dernier tiers : on lit d'abord, on découvre la
carte ensuite, et la bascule en plein écran ne se remarque presque pas puisque la carte est
déjà nette à ce moment-là.

Ce n'est pas une image d'illustration : c'est la vraie carte, déjà chargée. Le déroulé s'affiche
immédiatement sans attendre le fond de carte, puisque c'est du texte.

**Section 2, la carte.** Deux niveaux comme demandé : la couche participative (témoignages
regroupés en secteurs) et les gros hotspots (clusters documentés + signalements instruits),
avec filtre par pathologie et curseur d'années.

**Les deux types de page qu'ouvre la carte :**

- **Hotspot** — pathologies concernées, cas recensés, conclusion officielle, cause suspectée,
  où en est le dossier, collectif local, lien vers le rapport source, et **la liste des
  témoignages reçus dans la zone**.
- **Cas particulier** — pathologie, année, tranche d'âge, exposition suspectée, témoignage écrit
  et audio quand la famille l'a fourni, et un retour vers son secteur et vers son cluster.

Le contenu vit dans `js/concepts.js` : le résumé du déroulé et la page longue sont dans la même
entrée, ils ne peuvent pas diverger, et l'équipe éditoriale NK n'a qu'un fichier à reprendre.

### Le formulaire, atteignable là où on en a envie

Le flow porte deux fois la mention « [[Permettre donner témoignage]] », sur la page hotspot et
sur la page cas particulier. Chaque fiche se termine donc par un bloc d'appel contextualisé
(« Votre enfant a été diagnostiqué dans ce secteur ? »), qui mène à `participer.html`.

Cette page de transition est celle du flow : ce qu'on demande champ par champ, ce qui arrive à
l'adresse saisie, le fait que les consentements sont séparés, et un espace d'échange pour les
familles qui veulent d'abord parler à d'autres familles avant de remplir quoi que ce soit.
Le lien vers cet espace est présent aussi en fin de questionnaire.

**Ce qui manque encore côté NK** : l'URL de l'espace d'échange (Discord). Les deux boutons sont
en place et le disent explicitement au clic plutôt que d'ouvrir une page morte.

### Le questionnaire

`questionnaire.html` est une maquette complète en 5 étapes, pas une capture d'écran. Ce qui y est
réellement branché :

- **Géocodage en direct** via l'API Adresse de l'État, appelée **depuis le navigateur** :
  l'adresse ne transite jamais par un serveur du projet, seul le code en ressort.
- **E-mail haché** en SHA-256 avant de quitter la page.
- **Piège anti-robot** (champ hors écran) et validation étape par étape.
- **Consentements séparés** : enregistrer, publier sur la carte, publier le témoignage,
  être recontacté. Un seul est obligatoire.
- **Récapitulatif final** : l'objet JSON qui serait transmis est montré en clair, pour que la
  discussion en atelier porte sur des champs réels et pas sur des intentions.

Rien n'est envoyé nulle part. Le bandeau le dit en haut de page.

### Le playback audio

Huit témoignages portent un vrai fichier `.m4a`, synthétisé en français (`say` + `afconvert`) :
ce sont des **emplacements**, à remplacer par les enregistrements réels des parents. Les 92 autres
sont lus par la **synthèse vocale du navigateur** — utile pour montrer que le dispositif tient
même quand la famille n'a pas envoyé d'audio.

### Mobile

Sous 860 px, la carte passe en plein écran et le panneau devient une **feuille glissante** :
repliée, elle laisse voir le début du contenu et le bouton d'action ; on la déploie d'un geste sur
la poignée, et elle s'ouvre seule quand on tape un secteur. En mode récit elle occupe 62 % de la
hauteur en permanence, le texte en bas, la scène cartographique en haut.

Sous 560 px, le sélecteur de moteur **descend dans le pied du panneau** : la barre du haut ne peut
pas porter à la fois la marque, le choix du moteur, le mode et l'appel à l'action, et c'est le
choix du moteur qui est un réglage de démonstration, pas une commande de lecture.

Le cadrage initial n'est pas un zoom fixe mais un **ajustement à l'emprise de la France**, sinon
le format portrait coupe le pays. Les cibles tactiles passent à 44 px sous `pointer: coarse`.

Les trois moteurs partagent ce même habillage : la mise en page mobile est dans le CSS commun,
donc changer de moteur ne change rien au comportement mobile.

---

## 3. La donnée, et comment elle est floutée

**Deux natures à ne jamais confondre**, et la démo le dit à l'écran sur chaque fiche.

### Le flou géographique

**Aucun cas individuel n'est affiché à sa position.** La règle tient en trois points :

1. **Maille.** Chaque cas est rangé dans une maille d'environ **25 km**. Ce qui est dessiné est le
   **centre de la maille**, jamais le barycentre des cas : un barycentre se déplace quand un cas
   s'ajoute, et cette dérive suffit à remonter à une position.
2. **Seuil.** Une maille n'apparaît qu'à partir de **3 cas** (`K_ANONYMAT` dans `js/shared.js`).
   En dessous, ses cas basculent dans une maille de **75 km**. S'ils n'y atteignent toujours pas le
   seuil, ils ne sont **pas placés du tout** — ils restent comptés, et le panneau affiche combien.
3. **Rendu.** La tache est floue par construction (`circle-blur` en MapLibre, cercles concentriques
   ailleurs) et son rayon vaut la demi-maille. Un plancher en pixels la garde lisible de loin :
   il l'agrandit, ne la rétrécit jamais, donc il n'entame pas le flou.

La conséquence produit : **on n'atteint plus un témoignage par sa position, mais par son groupe.**
Cliquer un secteur ouvre la liste des témoignages qu'il contient ; de là on lit un récit, on écoute
l'audio. La fiche n'affiche ni commune ni adresse, seulement le département, et mentionne
explicitement « IRIS collecté, non publié ».

Sur les 100 témoignages fictifs, cette règle en place 76 et en retient 24. Ce n'est pas un défaut
de la démo, c'est le prix du seuil, et il est affiché.

Ce qu'il reste à trancher avec la juriste RGPD : la valeur de K (3 est un plancher, 5 est plus
prudent), la taille de la maille, et le croisement avec les autres champs — pathologie, année et
tranche d'âge dans une maille peu peuplée peuvent redevenir identifiants même sans localisation
fine. Le code isole ces trois constantes en tête de `js/shared.js` pour que ce réglage soit une
décision, pas une fouille dans le code.

### Réel — clusters et signalements

31 entrées reprises de l'onglet *CLUSTERS SANITAIRES EN FRANCE* du classeur
« Projet NK - Document central », lui-même sourcé sur des rapports publics de Santé publique
France, des registres et la presse. **Chaque fiche porte son lien source.**

Les 6 clusters mis en avant ont été choisis pour couvrir six façons différentes de ne pas conclure :

| | Cluster | Ce qu'il apporte au récit |
|---|---|---|
| 1 | **Sainte-Pazanne**, Pays de Retz (44) | SIR 2,27. Le collectif le plus outillé de France, qui a déjà résolu recensement, authentification et traitement |
| 2 | **Plaine d'Aunis**, Saint-Rogatien (17) | Trois nouveaux foyers révélés **par une étude sur registre**, pas par une alerte de parents. L'argument central du volet donnée |
| 3 | **Haut-Jura**, Les Rousses (39) | Excès confirmé, aucune cause trouvée, et des analyses d'eau et d'air demandées depuis des années, jamais réalisées |
| 4 | **Franconville** (95) | Le dossier le plus récent et le plus judiciarisé, sur une école bâtie sur un ancien site pollué |
| 5 | **Croix-Rousse**, Lyon 1er et 4e (69) | Excès reconnu par deux sources indépendantes, **mais cluster nié**. Sur le terrain du pilote, et sans collectif |
| 6 | **Pont-de-l'Arche** et Igoville (27) | SIR 6,4 à la commune, 2,3 au canton, **sur les mêmes enfants**. Justifie à lui seul le choix de l'IRIS |

S'y ajoute une **zone au périmètre non publié** (est des Pays de la Loire, 49/53/72) : sur-incidence
confirmée en mars 2026, mais secteur anonymisé par SpF au titre du RGPD. Elle est dessinée en tireté
gris, et le fait qu'on ne puisse pas la localiser est en soi une pièce du récit.

**Exclusions volontaires.** Toute la catégorie E du classeur (« PIÈGE, ne pas convertir en cluster »)
est hors de la carte : Salindres, vallée de la chimie, Fos-sur-Mer, Lacq, Gilly-sur-Isère,
chlordécone, Haut-Maroni, école Victor Hugo. Ce sont des expositions ou des contentieux, pas des
agrégats documentés — les afficher comme des clusters serait faux, et juridiquement exposé.

Sont également exclus les signaux **multi-sites nationaux** (rayon de 5 km autour des centrales,
lignes très haute tension) : ils n'ont pas de traduction communale et deviendraient trompeurs
sous forme de point.

### Fictif — les 100 témoignages

Générés par tirage aléatoire déterministe (`scripts/generate-data.py`, graine fixe). Aucun ne
correspond à une personne réelle. Ils portent le badge « donnée fictive » dans leur fiche.
Les champs suivent le schéma du formulaire A décrit dans `produit/questionnaire-participatif.md`
(tranche d'âge et non date de naissance, année et non date, code IRIS) pour que la maquette
teste la bonne structure.

Les coordonnées des communes viennent de l'**API Adresse** (`api-adresse.data.gouv.fr`), mises en
cache dans `scripts/geo-cache.json`.

### Ce que la démo fait exprès de mal faire

Elle affiche des **cas individuels à l'adresse**. En production c'est exclu : on collecte fin
(IRIS) et on publie grossier (maille agrégée, seuil de k-anonymat). Le point individuel n'existe
ici que parce qu'il faut bien tester le clic, le survol et la fiche. À trancher avec la juriste
RGPD avant toute mise en ligne.

---

## 4. Structure du code

```
demo-cartes/
├─ index.html               section 1 (déroulé) + section 2 (carte)
├─ concept.html             page dédiée d'un concept, alimentée par js/concepts.js
├─ participer.html          page de transition avant le formulaire
├─ questionnaire.html       le formulaire participatif (maquette)
├─ deploy.sh                mise en ligne (check | pages | vercel)
├─ tiles/
│  └─ france.pmtiles        fond de carte auto-hébergé (82 Mo, z0-9)
├─ css/
│  ├─ app.css               habillage commun + mise en page mobile
│  ├─ page.css              les pages de lecture (concepts, transition)
│  └─ form.css              le formulaire seulement
├─ js/
│  ├─ data.js               généré — ne pas éditer à la main
│  ├─ concepts.js           les 8 concepts : résumé + page longue + sources
│  ├─ section1.js           rendu du déroulé et flou progressif de la carte
│  ├─ concept-page.js       gabarit unique des pages concept
│  ├─ style-nk.js           le style du fond de carte, couleurs comprises
│  ├─ shared.js             couleurs, popups, emprises, FLOU
│  ├─ app.js                état, filtres, fiches, audio, modes, feuille mobile
│  ├─ form.js               questionnaire : étapes, géocodage, hachage
│  ├─ engine-maplibre.js    ┐
│  ├─ engine-leaflet.js     ├─ même contrat, trois implémentations
│  └─ engine-deck.js        ┘
├─ audio/                   8 témoignages synthétisés (emplacements)
└─ scripts/
   ├─ serve.py              serveur local avec HTTP Range (obligatoire)
   ├─ version-assets.py     empreinte des ressources, anti-cache
   ├─ generate-data.py      construit data.js
   ├─ geo-cache.json        coordonnées des communes (API Adresse)
   └─ audio-todo.txt        textes à synthétiser
```

**Le contrat d'un moteur** tient en huit méthodes :

```js
{ id, label, note, caps,
  init(container, ctx) -> Promise,
  render(state),          // couches et secteurs déjà floutés
  setBasemap(key),        // 'dark' | 'light'
  flyTo(lng, lat, zoom),
  fitZone(props),         // cadrer un cluster
  fitFrance(),            // revenir à l'emprise nationale
  resize() }
```

`ctx` remonte quatre événements : `onCell`, `onSignal`, `onZone`, `onReady`.

Deux points de conception à ne pas défaire :

- **`state.features` ne quitte jamais `app.js`.** Les moteurs reçoivent `state.cellules`, le
  résultat de `S.flouter()`. Aucune position individuelle n'existe dans la couche d'affichage :
  ce n'est pas une politique appliquée au rendu, c'est une frontière dans le code.
- **`recit.js` ne connaît aucun moteur.** Il pilote la carte par l'objet `api` que `app.js` lui
  passe. Écrire un chapitre, c'est écrire un texte et trois appels.

Résultat : changer de moteur, ou en essayer un quatrième, c'est écrire un fichier de 150 lignes.

### Deux détails qui ont coûté du temps

**Ne pas s'initialiser sur `load`.** L'événement `load` de MapLibre attend une première frame de
rendu, qui n'arrive jamais dans un onglet non peint : aperçus, tests headless, arrière-plan.
La carte restait bloquée sur « chargement » alors que le style était chargé. `styledata` suffit
pour poser sources et couches. Même raison pour le récit, calculé au défilement et non par
`IntersectionObserver`.

**Une seule interpolation par zoom.** MapLibre refuse deux `interpolate` sur le zoom dans une même
expression, et la couche échoue en silence. Pour un rayon qui dépend à la fois du zoom et du niveau
de maille, le `case` doit être **à l'intérieur** de l'interpolation, pas autour.

---

## 5. Mise en ligne

Le site est entièrement statique : aucun serveur applicatif, aucune base. 84 Mo, dont 82 Mo pour
le fichier de tuiles et 1,1 Mo d'audio. N'importe quel hébergeur de fichiers convient, **à une
condition : qu'il réponde aux requêtes HTTP Range**. GitHub Pages, Vercel, Netlify, R2 et S3 le
font. `python3 -m http.server` non, d'où `scripts/serve.py`.

```bash
cd demo-cartes && ./deploy.sh check     # vérifie avant d'envoyer
./deploy.sh pages                        # GitHub Pages
./deploy.sh vercel                       # Vercel
```

**Trois points à régler avant d'ouvrir l'URL au public :**

1. **Les tuiles.** Les deux moteurs vectoriels servent désormais nos propres tuiles. Seul Leaflet
   tape encore sur CARTO et OSM France, dont la politique d'usage décourage les usages tiers en
   production : si Leaflet est retenu, il faudra régler ce point.
2. **Le `noindex`.** Les deux pages portent `<meta name="robots" content="noindex, nofollow">`.
   Tant que les témoignages sont fictifs et que l'équipe éditoriale n'a pas relu, une page
   « cancers pédiatriques » qui remonte dans les moteurs de recherche ferait plus de mal que de
   bien. La balise est commentée dans le HTML, à retirer sciemment.
3. **Le statut des témoignages.** Ils sont badgés « donnée fictive » sur chaque fiche et annoncés
   dans le récit. À vérifier une dernière fois avant partage large, parce que sortis de leur
   contexte ils sont crédibles.

---

## 6. Ce qui reste à faire

- **Trancher le moteur** avec Jérémy, puis supprimer les deux autres du dépôt.
- **Fixer K et la maille** avec la juriste RGPD (§3), en incluant le risque de ré-identification
  par croisement pathologie × année × tranche d'âge.
- **Appliquer la charte NK** de septembre : le bloc `PALETTES` de `js/style-nk.js` et le bloc
  `:root` de `css/app.css`. La direction actuelle est **papier et encres franches**, esprit
  fanzine militant : fond papier chaud, noir d'encre, cinq couleurs saturées (rouge pour les
  excès confirmés, orange pour les dossiers contestés, magenta/bleu/vert pour les trois
  pathologies) et un jaune réservé à l'action. Pas de dégradé, pas d'ombre douce : des traits
  d'encre et des ombres portées franches.
- **Monter le fichier de tuiles au zoom 12** et le poser sur du stockage objet, pour un rendu net
  au plus près des clusters.
- **Brancher le questionnaire** sur une vraie base, et décider du géocodage IRIS réel (l'API
  Adresse donne la commune ; l'IRIS demande le référentiel IRIS).
- **Enregistrer les vrais témoignages audio**, en remplacement des huit voix de synthèse.
- **Faire relire les fiches cluster** par Ayisha : elles reprennent le classeur, dont l'en-tête
  signale que certaines lignes restent à vérifier.
- **Écrire le texte définitif du déroulé** avec l'équipe éditoriale NK. Les huit concepts et
  leurs pages sont une proposition de structure et d'angle, pas une copie validée.
- **Fournir l'URL de l'espace d'échange** (Discord), attendue à trois endroits.
- **Monter à 15-20 hotspots** comme prévu au lancement : le corpus en contient 31, dont 6 mis en
  avant et 25 en couche secondaire. Le passage se fait dans `scripts/generate-data.py`.
