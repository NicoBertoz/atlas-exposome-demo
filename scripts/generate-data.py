#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère le jeu de données de la démo carto — Projet NK / Atlas de l'exposome.

DEUX NATURES DE DONNÉES, à ne jamais confondre :
  • hotspots + signalements  = données RÉELLES, reprises du classeur
    « Projet NK - Document central.xlsx » (onglet CLUSTERS SANITAIRES EN FRANCE),
    lui-même sourcé sur des rapports publics de Santé publique France, de
    registres et de la presse. Chaque entrée porte son URL source.
  • temoignages              = 100 cas individuels ENTIÈREMENT FICTIFS,
    générés par tirage aléatoire pour tester le rendu et les interactions.
    Aucun ne correspond à une personne réelle.

Exclus volontairement de la carte : la catégorie E du classeur
(« PIÈGE, ne pas convertir en cluster ») — Salindres, vallée de la chimie,
Fos-sur-Mer, Lacq, Gilly-sur-Isère, chlordécone, Haut-Maroni, école Victor Hugo.
Ce sont des expositions ou des contentieux, pas des agrégats documentés.

Sortie : ../js/data.js  ->  window.NK_DATA
"""

import json
import math
import random
from pathlib import Path

random.seed(20260811)

HERE = Path(__file__).resolve().parent
GEO = json.loads((HERE / "geo-cache.json").read_text(encoding="utf-8"))

# --------------------------------------------------------------------------
# 1. Pathologies (3 cancers pédiatriques les plus fréquents)
# --------------------------------------------------------------------------
PATHOS = [
    {"id": "leucemie", "label": "Leucémie aiguë", "color": "#C01B5C", "part": 0.42,
     "sous_types": ["Leucémie aiguë lymphoblastique", "Leucémie aiguë myéloblastique"]},
    {"id": "snc", "label": "Tumeur du système nerveux central", "color": "#1F3ACC", "part": 0.31,
     "sous_types": ["Médulloblastome", "Gliome de bas grade", "Épendymome", "Astrocytome"]},
    {"id": "lymphome", "label": "Lymphome", "color": "#0B8A4E", "part": 0.27,
     "sous_types": ["Lymphome de Hodgkin", "Lymphome non hodgkinien", "Lymphome de Burkitt"]},
]
TRANCHES = ["0-1 an", "2-5 ans", "6-11 ans", "12-17 ans"]
SEXES = ["Masculin", "Féminin"]

# --------------------------------------------------------------------------
# 2. Les 6 hotspots — DONNÉES RÉELLES (classeur, onglet clusters)
# --------------------------------------------------------------------------
HOTSPOTS = [
    {
        "id": "h1", "geo": "sainte-pazanne", "rayon_km": 13,
        "nom": "Sainte-Pazanne et le Pays de Retz",
        "lieu": "Loire-Atlantique (44)", "categorie": "A",
        "pathologie": "Leucémies aiguës, lymphomes, sarcome d'Ewing, médulloblastome",
        "periode": "2015 – sept. 2022",
        "cas": "19 cas de moins de 18 ans retenus par SpF en 2022 (11 en 2020). "
               "Le collectif en recense 25, dont 7 décès.",
        "mesure": "SIR", "valeur": 2.27, "mesure_txt": "SIR 2,27",
        "conclusion": "Excès d'un facteur 2 environ, compatible avec un agrégat, "
                      "sans cause commune identifiée.",
        "statut": "Surveillance renforcée. Collectif très actif.",
        "collectif": "Stop aux Cancers de nos Enfants, et l'ICRePSE qu'il a fondé",
        "cause": "Pesticides, eau de puits, radon, sols, hydrocarbures. 5 puits déclarés "
                 "impropres. Le collectif a fait chercher 700 pesticides dans l'eau.",
        "interet": "Le collectif le plus outillé de France. A déjà résolu en pratique les "
                   "questions de recensement, d'authentification et de traitement.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/pays-de-la-loire/enquetesetudes/etude-de-la-distribution-geographique-des-cancers-pediatriques-en-loire-atlantique-entre-2005-et",
        "communes": ["Sainte-Pazanne", "Machecoul-Saint-Même", "Port-Saint-Père",
                     "Saint-Hilaire-de-Chaléons", "Chaumes-en-Retz", "Rouans", "Vue",
                     "Saint-Mars-de-Coutais"],
        "n_temoins": 9,
    },
    {
        "id": "h2", "geo": "saint-rogatien", "rayon_km": 11,
        "nom": "Plaine d'Aunis — Saint-Rogatien",
        "lieu": "Charente-Maritime (17)", "categorie": "A",
        "pathologie": "Hémopathies : LAL, leucémie biclonale, lymphome de Burkitt",
        "periode": "2008 – 2018, puis étude Ligue 2008 – 2022",
        "cas": "4 hémopathies pour moins de 1 attendu à Saint-Rogatien. Effectifs des "
               "3 nouveaux foyers non publics.",
        "mesure": "O/A", "valeur": 4.0, "mesure_txt": "4 observés / <1 attendu",
        "conclusion": "Excès constaté. Lien avec l'usine d'enrobés non établi.",
        "statut": "Vivant. Étude d'État EXPOSCAN lancée sur 2026 – 2028.",
        "collectif": "Avenir Santé Environnement",
        "cause": "Pesticides du modèle céréalier de la plaine d'Aunis.",
        "interet": "Saint-Vivien, L'Houmeau et l'ouest de Saintes sont trois foyers nouveaux, "
                   "révélés par une étude sur registre, pas par une alerte de parents. "
                   "Argument central pour le volet donnée.",
        "source": "https://www.ici.fr/emissions/l-info-d-ici-ici-la-rochelle/trois-nouveaux-foyers-de-cancers-pediatriques-ont-ete-identifies-en-charente-maritime-4617726",
        "communes": ["Saint-Rogatien", "Périgny", "Saint-Vivien", "L'Houmeau", "La Jarne",
                     "Angoulins", "Dompierre-sur-Mer", "Croix-Chapeau"],
        "n_temoins": 7,
    },
    {
        "id": "h3", "geo": "les-rousses", "rayon_km": 10,
        "nom": "Haut-Jura — Les Rousses, Morez, Prémanon",
        "lieu": "Jura (39)", "categorie": "A",
        "pathologie": "Tous cancers + leucémies",
        "periode": "2010 – 2020",
        "cas": "13 cas chez les moins de 15 ans + 4 chez les plus de 15 ans, dont 7 leucémies.",
        "mesure": "Excès", "valeur": None, "mesure_txt": "Excès confirmé par SpF",
        "conclusion": "Excès confirmé pour tous cancers ET leucémies. Aucun facteur de risque "
                      "commun identifié. Radon, qualité de l'air, lignes THT et transformateurs "
                      "examinés et écartés.",
        "statut": "Veille maintenue. Mobilisation affaiblie mais non éteinte.",
        "collectif": "Collectif de familles du Haut-Jura, informel, sans structure juridique",
        "cause": "Aucune. Le collectif demande des analyses d'eau et d'air au domicile des "
                 "enfants, jamais réalisées.",
        "interet": "Un des deux seuls clusters pédiatriques officiellement reconnus par SpF. "
                   "Familles en attente, dossier réactivable.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/bourgogne-franche-comte/enquetesetudes/investigation-dun-agregat-spatio-temporel-de-cancers-pediatriques-dans-le-haut-jura",
        "communes": ["Les Rousses", "Morez", "Prémanon", "Longchaumois", "Morbier",
                     "Bois-d'Amont", "Saint-Pierre"],
        "n_temoins": 6,
    },
    {
        "id": "h4", "geo": "franconville", "rayon_km": 3.4,
        "nom": "Franconville — école de la Gare René-Watrelot",
        "lieu": "Val-d'Oise (95)", "categorie": "C",
        "pathologie": "Angiosarcome mammaire, leucémie, rhabdomyosarcome",
        "periode": "2021 – 2025",
        "cas": "3 cas confirmés, 2 décès.",
        "mesure": "Enquête", "valeur": None, "mesure_txt": "Enquête ARS en cours",
        "conclusion": "Enquête de l'ARS Île-de-France en cours, pilotée par le centre de "
                      "pathologies professionnelles et environnementales. Pas de conclusion.",
        "statut": "Très vivant. Plainte avec constitution de partie civile pour homicide "
                  "involontaire déposée le 1er juillet 2026.",
        "collectif": "Familles, avec l'appui de Notre affaire à tous",
        "cause": "Ancien atelier de traitement de métaux 1966 – 1999 à 25 m. Diagnostic de sols "
                 "de 2013 : benzène, toluène, xylènes, trichloréthylène, tétrachloréthylène, "
                 "hydrocarbures.",
        "interet": "Le dossier le plus récent et le plus judiciarisé. L'angiosarcome mammaire "
                   "compte 8 cas en France en 40 ans.",
        "source": "https://environnementsantepolitique.fr/2026/07/02/lagence-regionale-de-sante-enquete-sur-des-tumeurs-signalees-chez-des-eleves-dun-etablissement-du-val-doise-construit-pres-dun-ancien-site-industriel-pollue/",
        "communes": ["Franconville", "Ermont", "Le Plessis-Bouchard", "Sannois",
                     "Saint-Leu-la-Forêt"],
        "n_temoins": 4,
    },
    {
        "id": "h5", "geo": "croix-rousse", "rayon_km": 2.6,
        "nom": "Lyon 1er et 4e — secteur Croix-Rousse",
        "lieu": "Rhône (69)", "categorie": "A",
        "pathologie": "Tous cancers, aucun type prédominant",
        "periode": "2013 – 2019, analyse élargie 2010 – 2019",
        "cas": "Nombre non publié. Deux sources indépendantes concordantes.",
        "mesure": "SIR", "valeur": 1.66, "mesure_txt": "SIR 1,66 [1,05 – 2,49]",
        "conclusion": "Excès statistiquement significatif confirmé par le RNCE et par le Centre "
                      "Léon Bérard, mais conclusion de fluctuation aléatoire, en défaveur d'un "
                      "agrégat caractérisé.",
        "statut": "Clos, rapport du 29 avril 2024.",
        "collectif": "Aucun collectif de familles. Le signalement vient du Centre Léon Bérard.",
        "cause": "Aucune exposition environnementale distinctive retrouvée.",
        "interet": "Sur le terrain du pilote Rhône-Alpes : excès reconnu mais cluster nié, et "
                   "personne n'occupe le terrain côté familles.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/auvergne-rhone-alpes/enquetesetudes/suspicion-dagregat-spatio-temporel-de-cancers-pediatriques-a-lyon-entre-2013-et-2019-rapport",
        "communes": ["Lyon 1er", "Lyon 4e", "Caluire-et-Cuire"],
        "n_temoins": 8,
    },
    {
        "id": "h6", "geo": "pont-de-larche", "rayon_km": 6,
        "nom": "Pont-de-l'Arche et Igoville",
        "lieu": "Eure (27)", "categorie": "B",
        "pathologie": "Leucémies chez les moins de 15 ans",
        "periode": "2017 – 2019",
        "cas": "11 cas.",
        "mesure": "SIR", "valeur": 6.4, "mesure_txt": "SIR 6,4 [2,3 – 14,0] à la commune",
        "conclusion": "Excès significatif à la maille communale (SIR 6,4), non retrouvé au niveau "
                      "cantonal (SIR 2,3) sur les mêmes cas. Hypothèse de distribution aléatoire "
                      "retenue.",
        "statut": "Éteint. Suivi arrêté, bilan du 26 septembre 2025.",
        "collectif": "Cancers, la vérité pour nos enfants",
        "cause": "Plomb et terres rares retrouvés dans les analyses des enfants faites par le "
                 "collectif.",
        "interet": "Cas d'école de la sensibilité à la maille géographique : le même excès "
                   "existe ou disparaît selon qu'on regarde la commune ou le canton. "
                   "Justifie directement le choix de l'IRIS.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/normandie/enquetesetudes/bilan-de-surveillance-post-investigation-du-cluster-de-leucemies-pediatriques-dans-le-secteur-de",
        "communes": ["Pont-de-l'Arche", "Igoville", "Alizay", "Val-de-Reuil", "Léry",
                     "Les Damps", "Criquebeuf-sur-Seine"],
        "n_temoins": 5,
    },
    {
        "id": "h7", "geo": "amneville", "rayon_km": 3.2,
        "nom": "Amnéville — un même établissement scolaire",
        "lieu": "Moselle (57)", "categorie": "A",
        "pathologie": "Leucémies aiguës lymphoblastiques",
        "periode": "2008 – 2010",
        "cas": "3 cas chez des enfants de moins de 15 ans scolarisés dans le même établissement.",
        "mesure": "Excès", "valeur": None, "mesure_txt": "Excès confirmé par SpF",
        "conclusion": "Excès confirmé. Le benzène atmosphérique n'a pas pu être caractérisé, "
                      "faute de données antérieures à 2008.",
        "statut": "Surveillance prospective sur 3 ans recommandée.",
        "collectif": "Aucun collectif identifié",
        "cause": "Benzène atmosphérique, commune à forte pression industrielle.",
        "interet": "Jamais médiatisé, absent de toutes les listes militantes. Une des meilleures "
                   "prises institutionnelles du corpus, et un cas où c'est l'absence de mesure "
                   "antérieure qui a bloqué.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/grand-est/rapportsynthese/analyse-dun-agregat-de-leucemies-a-amneville-moselle-de-2008-a-2010-rapport-dinvestigation-decembre",
        "communes": ["Amnéville", "Rombas", "Marange-Silvange", "Hagondange"],
        "n_temoins": 4,
    },
    {
        "id": "h8", "geo": "aniche", "rayon_km": 4.2,
        "nom": "Aniche — sols de l'ancien bassin verrier",
        "lieu": "Nord (59)", "categorie": "A",
        "pathologie": "Leucémies aiguës de l'enfant",
        "periode": "1984 – 2006, analyse 1996 – 2006",
        "cas": "SIR 5,61 [1,81 – 13,11] chez l'enfant.",
        "mesure": "SIR", "valeur": 5.61, "mesure_txt": "SIR 5,61 [1,81 – 13,11]",
        "conclusion": "Excès confirmé chez l'enfant. Sols pollués par le passé verrier. "
                      "Évaluation d'impact sanitaire lancée dans la foulée.",
        "statut": "Clos, avec suite en évaluation d'impact sanitaire.",
        "collectif": "Aucun collectif identifié",
        "cause": "Pollution des sols liée aux anciennes verreries.",
        "interet": "Le SIR le plus élevé de tout le corpus français, et pourtant jamais médiatisé.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/hauts-de-france/rapportsynthese/investigation-dune-suspicion-dagregat-dhemopathies-malignes-et-de-lymphomes-a-aniche-nord-1984-2006",
        "communes": ["Aniche", "Auberchicourt", "Somain", "Masny"],
        "n_temoins": 4,
    },
    {
        "id": "h9", "geo": "vincennes", "rayon_km": 2.2,
        "nom": "Vincennes — école Franklin-Roosevelt",
        "lieu": "Val-de-Marne (94)", "categorie": "B",
        "pathologie": "2 leucémies, 1 rhabdomyosarcome",
        "periode": "1995 – 1999, suivi jusqu'en 2015",
        "cas": "4 cas signalés, 3 validés.",
        "mesure": "Hasard", "valeur": None, "mesure_txt": "Regroupement attribué au hasard",
        "conclusion": "Regroupement probablement lié au hasard, selon un comité de 16 experts. "
                      "L'école a pourtant été fermée en 2001, dépolluée, rouverte en 2004.",
        "statut": "Clos. Surveillance maintenue jusqu'en 2015.",
        "collectif": "Collectif Vigilance Franklin",
        "cause": "Nappe polluée au trichloréthylène et au perchloréthylène par l'ancienne "
                 "usine Kodak-Pathé.",
        "interet": "La matrice historique de tous les clusters français. A obtenu fermeture, "
                   "dépollution et quatorze ans de surveillance malgré une conclusion négative : "
                   "la preuve qu'un dossier peut aboutir sans être « confirmé ».",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/ile-de-france/rapportsynthese/comite-scientifique-concernant-les-cancers-pediatriques-survenus-dans-le-quartier-sud-de-vincennes",
        "communes": ["Vincennes", "Saint-Mandé", "Fontenay-sous-Bois"],
        "n_temoins": 4,
    },
    {
        "id": "h10", "geo": "preignac", "rayon_km": 5.5,
        "nom": "Preignac — commune viticole du Sauternais",
        "lieu": "Gironde (33)", "categorie": "B",
        "pathologie": "Tumeurs cérébrales et hémopathies",
        "periode": "cas depuis 2000, investigation en 2013",
        "cas": "9 cas d'enfants, dont 8 depuis 2000, pour 5,7 attendus.",
        "mesure": "O/A", "valeur": 1.58, "mesure_txt": "9 observés / 5,7 attendus",
        "conclusion": "L'absence de mesures de pesticides dans l'air a empêché de conclure à "
                      "une exposition. L'enquête n'a pas échoué sur le signal sanitaire.",
        "statut": "Clos.",
        "collectif": "Pas de collectif formel. Mobilisation portée par une institutrice et "
                     "des parents.",
        "cause": "Pesticides viticoles, école entourée de vignes.",
        "interet": "L'argument le plus direct en faveur d'un atlas de l'exposome : ce qui a "
                   "manqué n'était pas la donnée de santé, c'était la donnée d'exposition.",
        "source": "https://www.santepubliquefrance.fr/determinants-de-sante/exposition-a-des-substances-chimiques/pesticides/documents/rapport-synthese/investigation-d-une-suspicion-d-agregat-de-cancers-pediatriques-dans-une-commune-viticole-de-gironde.-juin-2013",
        "communes": ["Preignac", "Barsac", "Sauternes", "Bommes", "Fargues"],
        "n_temoins": 4,
    },
    {
        "id": "h11", "geo": "saint-cyr-lecole", "rayon_km": 2.6,
        "nom": "Saint-Cyr-l'École — quartier de l'Épi d'Or",
        "lieu": "Yvelines (78)", "categorie": "B",
        "pathologie": "5 tumeurs du SNC, 3 leucémies, 3 autres localisations",
        "periode": "1990 – 2002",
        "cas": "11 cas. 5 tumeurs du SNC observées pour 1,2 attendues.",
        "mesure": "O/A", "valeur": 4.17, "mesure_txt": "5 tumeurs du SNC / 1,2 attendues",
        "conclusion": "Incidence doublée, mais ni regroupement spatio-temporel ni exposition "
                      "commune retrouvés.",
        "statut": "Clos.",
        "collectif": "Associations de quartier, avec PRIARTEM et Robin des Toits",
        "cause": "Antennes relais installées sur le toit de l'école en 1992, démontées en 2003. "
                 "Le lien n'a pas été étudié.",
        "interet": "L'InVS a refusé d'étudier l'hypothèse des antennes mais a bien mené "
                   "l'investigation d'agrégat : il existe donc un rapport officiel, contrairement "
                   "à ce que laissent entendre les sources associatives.",
        "source": "https://www.santepubliquefrance.fr/regions-et-territoires/ile-de-france/article/investigation-dun-signalement-dagregat-de-cancers-de-lenfant-a-saint-cyr-lecole-octobre-2004",
        "communes": ["Saint-Cyr-l'École", "Bois-d'Arcy", "Fontenay-le-Fleury"],
        "n_temoins": 4,
    },
    {
        "id": "h12", "geo": "romainville", "rayon_km": 2.4,
        "nom": "Romainville — riverains de l'usine Wipelec",
        "lieu": "Seine-Saint-Denis (93)", "categorie": "B",
        "pathologie": "Cancers, malformations et pathologies chroniques, tous âges",
        "periode": "signalé en 2015, investigation 2016 – 2018",
        "cas": "36 pathologies déclarées chez 32 riverains.",
        "mesure": "Enquête", "valeur": None, "mesure_txt": "Investigation Cire Île-de-France",
        "conclusion": "Investigation menée, sans conclusion d'agrégat caractérisé.",
        "statut": "Clos.",
        "collectif": "Association Romainville Sud",
        "cause": "Trichloréthylène rejeté par l'usine Wipelec.",
        "interet": "Un des rares cas où un collectif de riverains a produit son propre "
                   "recensement de pathologies, tous âges confondus. Méthode transposable au "
                   "questionnaire du projet.",
        "source": "https://www.santepubliquefrance.fr/docs/rapportsynthese/investigation-dune-suspicion-de-cluster-de-pathologies-a-romainville-93-0",
        "communes": ["Romainville", "Noisy-le-Sec", "Bagnolet", "Montreuil"],
        "n_temoins": 4,
    },
    {
        "id": "h13", "geo": "ruitz", "rayon_km": 2.6,
        "nom": "Ruitz — école maternelle Jacques-Prévert",
        "lieu": "Pas-de-Calais (62)", "categorie": "C",
        "pathologie": "1 leucémie, 1 astrocytome, 1 oligoastrocytome anaplasique",
        "periode": "2003 – 2005",
        "cas": "3 cas, 2 décès. Deux des trois enfants étaient dans la même classe.",
        "mesure": "Agrégat", "valeur": None, "mesure_txt": "Agrégat non expliqué",
        "conclusion": "Rapport d'agrégat spatio-temporel de l'InVS. Agrégat constaté, non expliqué.",
        "statut": "Clos.",
        "collectif": "Pas de collectif structuré. Relais PRIARTEM.",
        "cause": "Antenne relais à une vingtaine de mètres, désactivée puis démontée.",
        "interet": "Attention au décompte : PRIARTEM avance 4 cas, le décompte officiel est de 3. "
                   "Ne retenir que l'officiel.",
        "source": "https://www.priartem.fr/Antennes-relais-et-clusters-de.html",
        "communes": ["Ruitz", "Barlin", "Houdain", "Maisnil-lès-Ruitz"],
        "n_temoins": 4,
    },
    {
        "id": "h14", "geo": "rexpoede", "rayon_km": 3.0,
        "nom": "Rexpoëde — école primaire Victor-Hugo",
        "lieu": "Nord (59)", "categorie": "C",
        "pathologie": "Cancers du cerveau",
        "periode": "2009",
        "cas": "2 cas, 1 décès.",
        "mesure": "Refus", "valeur": None, "mesure_txt": "Enquête refusée",
        "conclusion": "Demande d'enquête sanitaire refusée en décembre 2011 par l'InVS et "
                      "l'ANSES, au motif de l'absence d'outils d'investigation efficaces.",
        "statut": "Clos. Quatre agences se sont finalement déplacées le 21 mai 2013.",
        "collectif": "Rexpoëde Environnement, appuyé par PRIARTEM",
        "cause": "Antennes de quatre opérateurs sur une ancienne cheminée d'usine, proximité "
                 "d'un ancien site industriel.",
        "interet": "Le cas du refus d'investiguer. L'hypothèse des antennes n'est pas étayée, "
                   "mais le refus documenté est un matériau central sur l'accès à l'enquête.",
        "source": "https://www.priartem.fr/Antennes-relais-et-clusters-de.html",
        "communes": ["Rexpoëde", "Hondschoote", "Bergues", "Wormhout"],
        "n_temoins": 4,
    },
    {
        "id": "h15", "geo": "lunel-viel", "rayon_km": 12,
        "nom": "Lunel-Viel et les communes sous les vents",
        "lieu": "Hérault (34)", "categorie": "C",
        "pathologie": "Sur-incidence de certains cancers signalée par le registre",
        "periode": "depuis 1999",
        "cas": "Effectifs non chiffrés publiquement.",
        "mesure": "Registre", "valeur": None, "mesure_txt": "Sur-incidence documentée",
        "conclusion": "Sur-incidence documentée par le registre des cancers, lien causal non "
                      "démontré. Demandes d'études approfondies en cours.",
        "statut": "Vivant.",
        "collectif": "Lunel-Viel veut vivre, AMIES, appuyés par Stop aux Cancers de nos Enfants",
        "cause": "Rejets de l'incinérateur, 120 000 tonnes par an.",
        "interet": "Mobilisation vivante depuis 1999, déjà en lien avec le collectif de "
                   "Sainte-Pazanne : l'introduction est facile.",
        "source": "https://www.ici.fr/infos/sante-sciences/les-riverains-de-l-incinerateur-de-lunel-viel-demandent-des-etudes-approfondies-sur-les-risques-sanitaires-1493139609",
        "communes": ["Lunel-Viel", "Lansargues", "Candillargues", "Saint-Just",
                     "Saint-Nazaire-de-Pézan", "Mauguio", "Mudaison", "La Grande-Motte"],
        "n_temoins": 5,
    },
    {
        "id": "h16", "geo": "lens", "rayon_km": 25,
        "nom": "Lens et 101 communes — cryptorchidie",
        "lieu": "Pas-de-Calais (62)", "categorie": "D",
        "pathologie": "Cryptorchidie opérée avant 7 ans",
        "periode": "2002 – 2014",
        "cas": "1 244 cas à Lens, pour un excès de 453. 91 400 cas au niveau national, "
               "9 024 dans les 24 clusters identifiés.",
        "mesure": "RR", "valeur": 1.58, "mesure_txt": "RR 1,58",
        "conclusion": "Étude officielle de Santé publique France, méthodes SaTScan et FlexScan "
                      "à l'échelle du code postal. Principal des 24 clusters de métropole.",
        "statut": "Publié en 2021.",
        "collectif": "Aucun collectif",
        "cause": "Activités minières, métallurgiques et mécaniques. Perturbateurs endocriniens : "
                 "métaux, dioxines, PCB.",
        "interet": "Le jeu de données le plus riche du corpus, directement cartographiable, et "
                   "il complète l'angle dysgénésie testiculaire de l'hypospadias.",
        "source": "http://www.santepubliquefrance.fr/exposition-a-des-substances-chimiques/perturbateurs-endocriniens/enquetesetudes/variations-spatiotemporelles-du-risque-de-cryptorchidies-operees-en-france-et-hypotheses",
        "communes": ["Lens", "Liévin", "Hénin-Beaumont", "Carvin", "Bully-les-Mines",
                     "Avion", "Loos-en-Gohelle"],
        "n_temoins": 6,
    },
    {
        "id": "h17", "geo": "orbiel", "rayon_km": 9,
        "nom": "Vallée de l'Orbiel — arsenic",
        "lieu": "Aude (11)", "categorie": "D",
        "pathologie": "Surexposition à l'arsenic chez l'enfant",
        "periode": "2019 – 2020",
        "cas": "Jusqu'à 46 enfants surexposés sur 143 testés en août 2019. Sur 293 enfants "
               "testés jusqu'en décembre 2020, 8 surexposés selon les seuils révisés.",
        "mesure": "Justice", "valeur": None, "mesure_txt": "État condamné en 2025",
        "conclusion": "Dispositif de dépistage ARS. Tribunal administratif de Montpellier : "
                      "État condamné en juillet 2025, appel en septembre 2025 tout en "
                      "reconnaissant le préjudice écologique.",
        "statut": "Très vivant.",
        "collectif": "ECCLA, Terres d'Orbiel, Pour que vive la vallée de l'Orbiel, "
                     "Association Henri Pezerat, LDH, UFC-Que Choisir",
        "cause": "Déchets arséniés de l'ancienne mine d'or de Salsigne, lessivés par les "
                 "inondations d'octobre 2018.",
        "interet": "Les parents ont payé eux-mêmes les premières analyses, l'État a été "
                   "condamné, et les chiffres ont bougé avec la révision des seuils. "
                   "Attention : ce n'est PAS un cluster de cancers.",
        "source": "https://fne.asso.fr/actualites/salsigne-la-vallee-de-l-arsenic-un-scandale-d-etat",
        "communes": ["Conques-sur-Orbiel", "Lastours", "Salsigne", "Villalier", "Villardonnel"],
        "n_temoins": 4,
    },
    {
        "id": "h18", "geo": "druillat", "rayon_km": 17.7,
        "nom": "Druillat et 67 communes — agénésies de membre",
        "lieu": "Ain (01)", "categorie": "D",
        "pathologie": "Agénésie transverse du membre supérieur",
        "periode": "2009 – 2014",
        "cas": "7 cas observés pour 0,12 attendus selon REMERA (p = 0,000022). "
               "18 enfants recensés sur 2000 – 2014, toutes formes confondues.",
        "mesure": "O/A", "valeur": 56.9, "mesure_txt": "7 observés / 0,12 attendus",
        "conclusion": "Cluster invalidé par le comité d'experts du 11 juillet 2019 pour "
                      "hétérogénéité diagnostique. Contesté par REMERA.",
        "statut": "Clos côté État. REMERA en grande difficulté de financement.",
        "collectif": "REMERA, registre des malformations en Rhône-Alpes",
        "cause": "Tératogène agricole ou vétérinaire suspecté. Deux mères entourées de champs "
                 "de maïs et de tournesol, veaux nés avec agénésies dans le même périmètre.",
        "interet": "C'est le registre source du pilote hypospadias. Dossier contentieux, à "
                   "présenter avec les deux versions.",
        "source": "https://www.remera.fr/wp-content/uploads/2017/07/agr%C3%A9gat-ag%C3%A9n%C3%A9sie-membres.pdf",
        "communes": ["Druillat", "Pont-d'Ain", "Ambérieu-en-Bugey", "Bourg-en-Bresse",
                     "Villars-les-Dombes"],
        "n_temoins": 4,
    },
    {
        "id": "h19", "geo": "chiers", "rayon_km": 16,
        "nom": "Vallée de la Chiers — papeterie de Stenay",
        "lieu": "Ardennes et Meuse (08 / 55)", "categorie": "A",
        "pathologie": "Imprégnation aux PFAS. Cancers et insuffisances rénales allégués, "
                      "jamais investigués.",
        "periode": "1994 – 2022 (épandages)",
        "cas": "Aucun décompte sanitaire. 3 500 habitants privés d'eau du robinet, "
               "16 à 17 communes au-dessus de la norme, 44 communes ayant reçu les boues.",
        "mesure": "Sang", "valeur": 59.0, "mesure_txt": "jusqu'à 59 × la moyenne française",
        "conclusion": "Aucune investigation d'agrégat sanitaire n'a été ouverte. Une note "
                      "préfectorale du 7 août 2025 désigne la papeterie comme l'un des "
                      "contributeurs principaux à la contamination.",
        "statut": "Très vivant. Information judiciaire ouverte. 163 foyers plaignants.",
        "collectif": "Mouvement citoyen non constitué en association. Maires référents et "
                     "avocate coordinatrice.",
        "cause": "Épandage agricole, pendant environ trente ans, des boues d'épuration de la "
                 "papeterie, sur au moins 2 700 hectares.",
        "interet": "La maquette grandeur nature de l'Atlas : source industrielle nommée, "
                   "vecteur spatial superposable au parcellaire agricole, mesures dans les "
                   "sols, l'eau et le sang. Il ne manque que la donnée sanitaire.",
        "source": "https://disclose.ngo/fr/article/pfas-des-analyses-exclusives-devoilent-une-contamination-omnipresente-dans-les-ardennes-et-la-meuse",
        "communes": ["Haraucourt", "Villy", "Malandry", "Blagny", "Linay",
                     "La Ferté-sur-Chiers", "Carignan", "Mouzon"],
        "n_temoins": 5,
    },
    {
        "id": "h20", "geo": "bourg-fidele", "rayon_km": 6,
        "nom": "Bourg-Fidèle — usine Métal Blanc",
        "lieu": "Ardennes (08)", "categorie": "A",
        "pathologie": "Saturnisme infantile. Imprégnation cadmium, arsenic, mercure.",
        "periode": "1996 – 2024",
        "cas": "Sur une centaine d'enfants dépistés en 1998, 41 % au-dessus du seuil "
               "d'alerte de 70 µg/L et 22 % au-dessus de 100 µg/L.",
        "mesure": "Dépistage", "valeur": 41.0, "mesure_txt": "41 % au-dessus du seuil",
        "conclusion": "La cour d'appel de Paris a jugé le 15 septembre 2009 que la pollution "
                      "de l'usine avait été au moins l'un des facteurs de l'intoxication au "
                      "plomb des enfants de la commune.",
        "statut": "Pénal clos, condamnation définitive. Dépistage rouvert en 2024.",
        "collectif": "Association de protection et de défense de l'environnement de "
                     "Bourg-Fidèle, AFVS, France Nature Environnement",
        "cause": "Rejets atmosphériques et aqueux de l'usine de recyclage de batteries au "
                 "plomb : plomb, cadmium, arsenic, mercure, zinc, dioxines.",
        "interet": "Le seul cas du corpus où un juge a écrit qu'un industriel nommé était à "
                   "l'origine de l'atteinte sanitaire d'enfants.",
        "source": "https://www.actu-environnement.com/ae/news/cassation-metaux-lourds-pollution-plomb-cadmium-mise-en-danger-autrui-dommage-21098.php4",
        "communes": ["Bourg-Fidèle", "Rocroi", "Sévigny-la-Forêt", "Laval-Morency"],
        "n_temoins": 3,
    },
    {
        "id": "h21", "geo": "noyelles-godault", "rayon_km": 9,
        "nom": "Metaleurop — les cinq communes du bassin",
        "lieu": "Pas-de-Calais (62)", "categorie": "B",
        "pathologie": "Saturnisme infantile",
        "periode": "1894 – 2003 (usine), dépistage 2022",
        "cas": "7 752 enfants invités, soit 91 % des mineurs des cinq communes. "
               "1 892 plombémies réalisées, soit 24 % de participation. "
               "8 cas de saturnisme et 83 enfants au-dessus du seuil de vigilance.",
        "mesure": "Participation", "valeur": 24.0, "mesure_txt": "24 % de participation",
        "conclusion": "Santé publique France conclut que la prévalence chez les 0-6 ans est "
                      "comparable à celle de la population générale métropolitaine.",
        "statut": "Vivant. Cour d'appel de Douai, mai 2024 : environ 1,2 million d'euros "
                  "à 51 riverains.",
        "collectif": "AFVS au national, collectifs locaux Pige et APRÈS!",
        "cause": "Retombées historiques de la fonderie Metaleurop, sols pollués au plomb "
                 "et au cadmium.",
        "interet": "La leçon de participation, directement transposable au questionnaire : "
                   "91 % des enfants invités, 24 % venus. L'invitation institutionnelle "
                   "ne suffit pas.",
        "source": "https://www.actu-environnement.com/media/pdf/news-41945-synthese-sante-publique-france-analyse-epidemiologique-saturnisme-plombemie.pdf",
        "communes": ["Noyelles-Godault", "Courcelles-lès-Lens", "Evin-Malmaison",
                     "Dourges", "Leforest"],
        "n_temoins": 4,
    },
]

# Zone au périmètre volontairement non publié — traitée à part dans l'interface
ZONE_ANONYME = {
    "id": "anon", "geo": "sable", "rayon_km": 22,
    "nom": "Est des Pays de la Loire — secteur anonymisé",
    "lieu": "49 / 53 / 72, département non précisé", "categorie": "A",
    "pathologie": "Hémopathies malignes",
    "periode": "2016 – 2020",
    "cas": "5 enfants de moins de 18 ans.",
    "mesure_txt": "Sur-incidence confirmée",
    "conclusion": "Sur-incidence explicitement confirmée, mais regroupement aléatoire jugé le "
                  "plus probable. Pas d'étude étiologique menée.",
    "statut": "Clos. Rapport publié en mars 2026, le plus récent du corpus.",
    "collectif": "Aucun identifié",
    "cause": "Non investiguée.",
    "interet": "Le seul cas récent où la sur-incidence est confirmée. Santé publique France "
               "a anonymisé le secteur au titre du RGPD : les 6 communes concernées ne sont "
               "pas publiques. Le périmètre affiché ici est indicatif.",
    "source": "https://www.santepubliquefrance.fr/sites/default/files/cadic_files/documents/spf00006517.pdf",
    "communes": [],
}

# --------------------------------------------------------------------------
# 3. Autres signalements documentés (couche secondaire, points)
# --------------------------------------------------------------------------
SIGNALEMENTS = [
    ("pouilley", "Pouilley-les-Vignes", "Doubs (25)", "B", "Tumeurs cérébrales cancéreuses",
     "2012", "3 cas", "Regroupement probablement dû au hasard. Cas d'école du signalement "
     "citoyen : une habitante appelle l'ARS, la Cire est saisie le jour même.",
     "Non identifiée",
     "https://www.santepubliquefrance.fr/regions-et-territoires/bourgogne-franche-comte/rapportsynthese/investigation-dune-suspicion-dagregat-de-tumeurs-cerebrales-cancereuses-chez-des-enfants-a-pouilley"),
    ("draveil", "Draveil, écoles du Belvédère", "Essonne (91)", "B", "Non précisé",
     "2000-2008", "9 cas chez les moins de 15 ans",
     "Conclusion explicite : il n'y a pas d'agrégat spatio-temporel. Utile pour montrer le "
     "volume réel de signalements que l'État traite sans que le public le sache.", "Non précisée",
     "https://www.santepubliquefrance.fr/regions-et-territoires/ile-de-france/rapportsynthese/investigation-dune-suspicion-dagregat-de-cancers-a-draveil-essonne"),
    ("mortagne", "Mortagne-au-Perche, école Bignon", "Orne (61)", "B", "Non précisé",
     "avant 2005", "4 cas perçus", "Agrégat perçu, investigation de la Cire Ouest.",
     "Non précisée",
     "https://www.santepubliquefrance.fr/regions-et-territoires/normandie/rapportsynthese/investigation-dune-suspicion-dagregat-de-cancers-ecole-bignon-mortagne-au-perche-61"),
    ("saint-philbert-mauges", "Saint-Philbert-en-Mauges", "Maine-et-Loire (49)", "B",
     "Leucémies, tous âges", "1997-2001", "5 cas perçus",
     "Investigation de la Cire Ouest. Typologie du lanceur d'alerte : ici c'est un maire, "
     "pas un parent.", "Non précisée",
     "https://www.santepubliquefrance.fr/regions-et-territoires/pays-de-la-loire/rapportsynthese/investigation-dune-suspicion-dagregat-de-leucemies-autour-de-saint-philbert-en-mauges-maine-et-loire"),
    ("gaillon", "Gaillon et rayon de 5 km", "Eure (27)", "B", "Leucémies tous types",
     "1994-1997", "Non précisé",
     "Alerte d'une habitante en 1997, relayée par les médecins puis le préfet. Même "
     "département que Pont-de-l'Arche, vingt ans plus tôt.", "Non précisée",
     "https://www.santepubliquefrance.fr/regions-et-territoires/normandie/rapportsynthese/investigation-dune-suspicion-dagregat-de-leucemies-dans-la-region-de-gaillon-eure-rapport-detude"),
    ("pierrefeu", "Pierrefeu-du-Var et Collobrières", "Var (83)", "B", "Tous cancers",
     "2013", "Non précisé",
     "Signal non confirmé. Les registres pédiatriques donnent un résultat compatible avec le "
     "risque national.", "Non précisée",
     "https://www.santepubliquefrance.fr/regions-et-territoires/provence-alpes-cote-dazur-et-corse/rapportsynthese/investigation-dune-suspicion-dagregat-de-cancers-sur-les-communes-de-pierrefeu-du-var-et"),
    # Catégorie D — autres pathologies sentinelles
    ("guidel", "Guidel", "Morbihan (56)", "D", "Agénésie transverse du membre supérieur",
     "2011-2013", "4 cas, 3 retenus",
     "Excès confirmé par SpF, aucun facteur de risque commun identifié. Le contre-recensement "
     "des familles a forcé l'élargissement du périmètre officiel.",
     "Cultures céréalières à moins de 200 m",
     "https://www.lejdd.fr/Societe/bebes-nes-sans-bras-dans-le-morbihan-les-familles-interpellent-letat-3795725"),
    ("mouzeil", "Mouzeil", "Loire-Atlantique (44)", "D",
     "Agénésie transverse du membre supérieur", "2007-2008", "3 cas, 2 confirmés",
     "Excès confirmé, cause non trouvée. Le repérage est venu du regroupement dans une école "
     "maternelle, pas d'un système de surveillance.", "Site Seveso 2 à proximité, non démontré",
     "https://www.santepubliquefrance.fr/presse/agenesies-transverses-des-membres-superieurs-atms-le-comite-dexperts-scientifiques-rend-ses"),
    ("berre", "Étang de Berre", "Bouches-du-Rhône (13)", "D",
     "Agénésie transverse du membre supérieur", "2014-2018", "15 cas isolés recensés",
     "Pas d'excès : prévalence comparable aux registres français. Le rapport reconnaît que le "
     "PMSI manque d'exhaustivité face aux registres et appelle à un dispositif multisource.",
     "Émissions industrielles, hypothèse écartée",
     "https://www.santepubliquefrance.fr/sites/default/files/rdd/document/410462_spf00002594.pdf"),
    ("noyelles-godault", "Noyelles-Godault et 4 communes", "Pas-de-Calais (62)", "D",
     "Saturnisme infantile", "2022", "8 cas, 83 enfants au-dessus du seuil de vigilance",
     "Prévalence jugée comparable à la population générale. Leçon pour le questionnaire : "
     "91 % des enfants invités, seulement 24 % de participation.",
     "Retombées historiques de la fonderie Metaleurop",
     "https://www.actu-environnement.com/media/pdf/news-41945-synthese-sante-publique-france-analyse-epidemiologique-saturnisme-plombemie.pdf"),
    ("pallieres", "Saint-Félix-de-Pallières et 4 communes", "Gard (30)", "D",
     "Imprégnation plomb, arsenic, cadmium", "2015-2017", "651 volontaires dont 87 enfants",
     "45 plaintes pénales toutes classées en 2020, au motif qu'on ne pouvait distinguer "
     "l'origine anthropique de l'origine naturelle. Le fond géochimique naturel sera opposé "
     "au projet.", "Anciennes mines de plomb-zinc",
     "https://www.santepubliquefrance.fr/presse/anciens-sites-miniers-de-carnoules-et-la-croix-de-pallieres"),
    ("paris5", "Paris centre, après l'incendie de Notre-Dame", "Paris (75)", "D",
     "Plombémies", "2019", "1 222 enfants dépistés, 113 au-dessus du seuil",
     "Environ un enfant sur dix au-dessus du seuil de vigilance. La contamination a été "
     "révélée par une mobilisation extérieure.", "Fonte de 460 tonnes de plomb de la toiture",
     "https://www.iledefrance.ars.sante.fr/incendie-de-notre-dame-de-paris-bilan-sanitaire-un"),
    ("marseille3", "Marseille 1er au 3e", "Bouches-du-Rhône (13)", "D", "Saturnisme infantile",
     "2011-2013", "65 enfants contaminés",
     "Croisement exposition et précarité, directement utile pour la section inégalités.",
     "Habitat indigne et récupération informelle de métaux",
     "https://www.paca.ars.sante.fr/prevention-et-depistage-des-cas-de-saturnisme-chez-les-enfants-en-situation-de-vulnerabilite"),
]

CAT_LABEL = {
    "A": "Excès confirmé officiellement",
    "B": "Investigué, excès non retenu",
    "C": "Suspicion médiatisée, enquête en cours ou absente",
    "D": "Autre pathologie sentinelle",
}

# --------------------------------------------------------------------------
# 4. Communes hors cluster, pour disperser les témoignages sur la France
# --------------------------------------------------------------------------
COMMUNES_DIFFUSES = [
    ("Nord", 3.063, 50.633), ("Somme", 2.296, 49.894), ("Seine-Maritime", 1.099, 49.443),
    ("Calvados", -0.370, 49.183), ("Ille-et-Vilaine", -1.680, 48.112), ("Finistère", -4.486, 48.390),
    ("Sarthe", 0.199, 48.006), ("Indre-et-Loire", 0.690, 47.394), ("Loiret", 1.909, 47.902),
    ("Marne", 4.032, 49.258), ("Moselle", 6.176, 49.120), ("Bas-Rhin", 7.752, 48.573),
    ("Haut-Rhin", 7.339, 47.750), ("Côte-d'Or", 5.041, 47.322), ("Doubs", 6.024, 47.238),
    ("Meurthe-et-Moselle", 6.184, 48.692), ("Aube", 4.075, 48.297), ("Cher", 2.396, 47.081),
    ("Vienne", 0.340, 46.581), ("Haute-Vienne", 1.262, 45.833), ("Charente", 0.156, 45.649),
    ("Gironde", -0.578, 44.838), ("Pyrénées-Atlantiques", -1.475, 43.493), ("Béarn", -0.370, 43.296),
    ("Haute-Garonne", 1.444, 43.605), ("Tarn-et-Garonne", 1.355, 44.018), ("Tarn", 2.148, 43.928),
    ("Pyrénées-Orientales", 2.895, 42.699), ("Hérault", 3.877, 43.611), ("Gard", 4.360, 43.837),
    ("Vaucluse", 4.805, 43.950), ("Bouches-du-Rhône", 5.370, 43.297), ("Var", 5.928, 43.125),
    ("Alpes-Maritimes", 7.262, 43.710), ("Isère", 5.724, 45.188), ("Drôme", 4.892, 44.933),
    ("Loire", 4.387, 45.439), ("Puy-de-Dôme", 3.087, 45.777),
    ("Haute-Savoie", 6.129, 45.899), ("Savoie", 5.917, 45.564), ("Loire-Atlantique", -1.553, 47.218),
    ("Maine-et-Loire", -0.554, 47.478), ("Vendée", -1.427, 46.670),
    ("Deux-Sèvres", -0.459, 46.324), ("Morbihan", -2.760, 47.658), ("Côtes-d'Armor", -4.098, 47.996),
    ("Seine-Maritime", 0.107, 49.494), ("Oise", 2.081, 49.430), ("Seine-et-Marne", 2.658, 48.541),
    ("Aisne", 2.826, 49.417), ("Indre", 1.694, 46.811), ("Yonne", 3.573, 47.798),
    ("Saône-et-Loire", 4.854, 46.781), ("Rhône", 4.068, 46.037), ("Allier", 3.426, 46.128),
]

# --------------------------------------------------------------------------
# 5. Rédaction des témoignages (fictifs)
# --------------------------------------------------------------------------
OUVERTURES = [
    "Le diagnostic est tombé en {annee}, {qui} avait {age}.",
    "Tout a commencé à l'automne {annee} : {qui} se plaignait d'une fatigue que rien n'expliquait.",
    "En {annee}, après trois mois d'allers-retours chez le médecin, on a fini par avoir un nom sur ce qu'avait {qui}.",
    "On a appris la maladie de {qui} en {annee}, presque par hasard, lors d'une prise de sang de routine.",
    "C'est en {annee} qu'on nous a annoncé le diagnostic. {qui_maj} venait d'avoir {age}.",
    "En {annee}, {qui} a fait une chute bête à l'école. La radio a montré autre chose.",
]
PARCOURS = [
    "Il a fallu partir au CHU pour le protocole, deux ans de traitement, des semaines entières à l'hôpital.",
    "Le protocole a duré dix-huit mois, avec des hospitalisations tous les quinze jours.",
    "On a enchaîné chimio, greffe, puis une rechute que personne n'avait vue venir.",
    "Le service nous a très bien accompagnés, mais on était les seuls à poser des questions sur l'environnement.",
    "Entre les traitements et le trajet de cent kilomètres, on a vécu deux ans en apnée.",
    "J'ai arrêté de travailler pendant quatorze mois. Mon conjoint a fait les trajets seul.",
]
DEMANDES = [
    "Si nos cas peuvent servir à quelque chose, je veux bien les donner.",
    "Ce que je demande, c'est qu'on compte. Juste qu'on compte.",
    "On a monté un collectif de parents, on recense nous-mêmes depuis deux ans.",
    "Je témoigne pour que d'autres familles se signalent, parce que seuls on ne pèse rien.",
    "Je ne veux pas d'un coupable, je veux une carte et des chiffres publics.",
    "On nous a dit « c'est le hasard ». J'aimerais qu'on me le prouve avec des données.",
]
ISSUES_VIVANT = [
    "Aujourd'hui, la rémission tient depuis quatre ans. On surveille tous les six mois.",
    "Elle est en rémission, mais il reste des séquelles auditives et beaucoup de fatigue.",
    "Il a repris l'école avec un an de retard. On vit avec la peur de la rechute.",
]
ISSUES_DECES = [
    "Elle est partie deux ans après le diagnostic. On continue pour les autres.",
    "Il n'a pas survécu à la rechute. C'est en son nom que je remplis ce formulaire.",
]
# Soupçons contextualisés par hotspot (fiction, mais cohérente avec le dossier réel)
SOUPCONS = {
    "h1": ["On tire l'eau d'un puits. Il a fallu que le collectif la fasse analyser pour "
           "qu'on apprenne qu'elle était impropre.",
           "Les traitements passaient au petit matin, à cinquante mètres du jardin.",
           "Trois familles de l'école ont eu un cancer en cinq ans. Sur une commune de "
           "six mille habitants."],
    "h2": ["On est au milieu des céréales. Personne n'a jamais mesuré ce qu'on respire "
           "au printemps.",
           "L'usine d'enrobés tourne à trois kilomètres. On nous a répondu que le lien "
           "n'était pas établi.",
           "Quatre cas d'hémopathie dans le village. On nous a dit que c'était moins "
           "d'un cas attendu."],
    "h3": ["On a demandé des analyses d'eau et d'air au domicile. Six ans après, elles "
           "n'ont toujours pas été faites.",
           "Le radon, les lignes haute tension, tout a été examiné et écarté. Il ne reste "
           "rien, et pourtant les cas sont là.",
           "Ici tout le monde connaît les familles concernées. Personne ne sait quoi en faire."],
    "h4": ["L'école est construite sur un ancien atelier de traitement de métaux. Le "
           "diagnostic de sols de 2013 existait, on ne l'a jamais vu.",
           "Les analyses capillaires de mon fils ont montré des métaux lourds. Le "
           "laboratoire, on l'a payé nous-mêmes.",
           "Deux enfants sont morts. On a fini par déposer plainte."],
    "h5": ["Le signalement n'est pas venu de nous, il est venu de l'hôpital. On l'a appris "
           "par un rapport.",
           "On nous dit que l'excès est réel mais que ce n'est pas un cluster. J'ai relu la "
           "phrase dix fois.",
           "En ville, personne ne se connaît. Il n'y a jamais eu de collectif ici."],
    "h6": ["Selon qu'on regarde la commune ou le canton, on nous dit six fois trop de cas, "
           "ou rien du tout. Ce sont les mêmes enfants.",
           "Le collectif a fait doser les enfants. Plomb et terres rares. Le suivi a été "
           "arrêté quand même.",
           "Le bilan de 2025 a clos le dossier. Nous, on habite toujours là."],
    "h7": ["L'école est à deux pas de la zone industrielle. On respire ça tous les jours.",
           "On nous a dit qu'il n'y avait pas de mesure de benzène avant 2008. Donc rien à comparer.",
           "Trois enfants du même établissement. On a appris pour les deux autres par le bouche-à-oreille."],
    "h8": ["Le quartier est bâti sur d'anciennes verreries. Les sols, personne n'en parlait avant.",
           "Cinq fois plus de cas qu'attendu, et pas une ligne dans la presse.",
           "On a un rapport officiel. Il dort quelque part."],
    "h9": ["L'ancienne usine avait laissé du trichloréthylène dans la nappe. Sous l'école.",
           "L'école a fermé, on l'a dépolluée, on l'a rouverte. Et la conclusion reste « le hasard ».",
           "Quatorze ans de surveillance pour un agrégat qu'on nous dit inexistant."],
    "h10": ["L'école est entourée de vignes. Les traitements passaient pendant la récréation.",
            "Neuf enfants. On nous a répondu qu'il n'existait aucune mesure dans l'air.",
            "Ce n'est pas la maladie qu'on n'a pas su voir, c'est ce qu'on respirait."],
    "h11": ["Il y avait des antennes sur le toit de l'école. Elles ont été démontées, sans explication.",
            "Cinq tumeurs du cerveau pour une attendue. On nous a dit que ce n'était pas un agrégat.",
            "Le quartier s'est mobilisé, puis s'est épuisé."],
    "h12": ["L'usine rejetait du trichloréthylène à cent mètres des immeubles.",
            "C'est l'association qui a fait le recensement, immeuble par immeuble.",
            "Trente-deux riverains malades. L'enquête a eu lieu, et puis plus rien."],
    "h13": ["Deux des trois enfants étaient dans la même classe de maternelle.",
            "Une antenne à vingt mètres de la cour. Elle a été démontée après.",
            "On nous parle de trois cas, l'association en compte quatre. Personne ne tranche."],
    "h14": ["On a demandé une enquête sanitaire. On nous l'a refusée par courrier.",
            "Les antennes de quatre opérateurs sur une cheminée d'usine, en face de l'école.",
            "Il a fallu quatre ans pour que des agences se déplacent."],
    "h15": ["L'incinérateur brûle cent vingt mille tonnes par an. On est sous les vents.",
            "Le registre des cancers a documenté la sur-incidence. Depuis 1999.",
            "On demande des études approfondies depuis vingt-cinq ans."],
    "h16": ["Le bassin minier, la métallurgie, tout ça a laissé quelque chose dans les sols.",
            "On nous a opérés sans jamais nous dire que c'était plus fréquent ici qu'ailleurs.",
            "Mille deux cents cas sur la seule agglomération. Le chiffre existe, il est publié."],
    "h17": ["Après les inondations de 2018, les déchets de la mine sont descendus dans la vallée.",
            "Les premières analyses, ce sont les parents qui les ont payées.",
            "L'État a été condamné en 2025. Il a fait appel."],
    "h18": ["Deux mères entourées de champs de maïs. Des veaux nés avec les mêmes malformations.",
            "Sept cas pour zéro virgule douze attendus. Le comité a invalidé le cluster.",
            "Le registre qui a tiré la sonnette n'a plus de financement."],
    "h19": ["On a bu cette eau pendant trente ans. On l'a appris par un journal.",
            "Ma prise de sang montre cinquante-neuf fois la moyenne française. Personne "
            "n'est venu me revoir depuis.",
            "Les boues ont été épandues sur les champs autour du village. C'était autorisé."],
    "h20": ["Quarante et un pour cent des enfants dépistés étaient au-dessus du seuil. "
            "En 1998.",
            "Il a fallu treize ans de procédure pour qu'un juge écrive que l'usine y était "
            "pour quelque chose.",
            "On a rouvert un dépistage en 2024. Vingt-six ans après le premier."],
    "h21": ["On a reçu l'invitation au dépistage. Beaucoup ne sont pas allés, ils n'y "
            "croyaient plus.",
            "La fonderie a fermé en 2003. Le plomb, lui, est resté dans les jardins.",
            "On nous répond que la prévalence est comparable à la moyenne nationale."],
}

SOUPCONS_DIFFUS = [
    "On habite à quatre cents mètres des champs. Les traitements passaient au petit matin.",
    "Il y a une usine à trois kilomètres. Personne n'a jamais voulu faire le lien.",
    "J'ai appris après coup que l'eau du quartier avait été contrôlée. On ne nous a jamais "
    "communiqué les résultats.",
    "Mon conjoint a travaillé quinze ans sur un site classé. On s'est posé la question, "
    "sans jamais avoir de réponse.",
    "L'ARS nous a répondu qu'il n'y avait pas de sur-incidence. On n'a jamais vu les chiffres.",
    "Je ne dis pas que c'est la cause. Je dis juste que personne n'a cherché.",
]
EXPOSITIONS = ["Usine ou site industriel à proximité", "Épandages agricoles réguliers",
               "Eau du robinet ou puits suspectés", "Activité professionnelle d'un parent",
               "Incinérateur ou décharge", "Ancien site pollué",
               "Aucune exposition identifiée"]
PROFESSIONS = ["Agriculteur / agricultrice", "Ouvrier·ère de l'industrie", "Employé·e de commerce",
               "Personnel soignant", "Artisan", "Enseignant·e", "Cadre du tertiaire",
               "Chauffeur routier", "Sans emploi au moment du diagnostic"]


# --------------------------------------------------------------------------
# Géométrie
# --------------------------------------------------------------------------
def deg_par_km(lat):
    return 1.0 / (111.320 * math.cos(math.radians(lat))), 1.0 / 110.574


def cercle_polygon(centre, rayon_km, n=72, irregularite=0.13):
    lon0, lat0 = centre
    dlon, dlat = deg_par_km(lat0)
    phase = random.random() * 6.28
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        r = rayon_km * (1 + irregularite * math.sin(3 * t + phase) + 0.05 * math.sin(7 * t))
        pts.append([round(lon0 + r * math.cos(t) * dlon, 5),
                    round(lat0 + r * math.sin(t) * dlat, 5)])
    pts.append(pts[0])
    return [pts]


def point_dans_cercle(centre, rayon_km):
    lon0, lat0 = centre
    dlon, dlat = deg_par_km(lat0)
    r = rayon_km * (random.random() ** 0.6)
    t = random.random() * 2 * math.pi
    return [round(lon0 + r * math.cos(t) * dlon, 5), round(lat0 + r * math.sin(t) * dlat, 5)]


def tirage_patho():
    x, cum = random.random(), 0.0
    for p in PATHOS:
        cum += p["part"]
        if x <= cum:
            return p
    return PATHOS[-1]


def redige(annee, tranche, sexe, deces, soupcon):
    qui = "ma fille" if sexe == "Féminin" else "mon fils"
    age = {"0-1 an": "quelques mois", "2-5 ans": "quatre ans",
           "6-11 ans": "huit ans", "12-17 ans": "quatorze ans"}[tranche]
    return " ".join([
        random.choice(OUVERTURES).format(annee=annee, qui=qui, qui_maj=qui.capitalize(), age=age),
        random.choice(PARCOURS),
        random.choice(ISSUES_DECES if deces else ISSUES_VIVANT),
        soupcon,
        random.choice(DEMANDES),
    ])


# --------------------------------------------------------------------------
# Construction
# --------------------------------------------------------------------------
hotspot_features = []
for h in HOTSPOTS:
    centre = GEO[h["geo"]]
    hotspot_features.append({
        "type": "Feature", "id": h["id"],
        "geometry": {"type": "Polygon", "coordinates": cercle_polygon(centre, h["rayon_km"])},
        "properties": {k: v for k, v in h.items() if k not in ("geo", "n_temoins")}
        | {"centre": centre, "cat_label": CAT_LABEL[h["categorie"]], "anonyme": False,
           "n_temoins": h["n_temoins"]},
    })

centre_anon = GEO[ZONE_ANONYME["geo"]]
zone_anonyme = {
    "type": "Feature", "id": "anon",
    "geometry": {"type": "Polygon", "coordinates": cercle_polygon(centre_anon, ZONE_ANONYME["rayon_km"], irregularite=0.05)},
    "properties": {k: v for k, v in ZONE_ANONYME.items() if k != "geo"}
    | {"centre": centre_anon, "cat_label": CAT_LABEL["A"], "anonyme": True, "n_temoins": 0},
}
hotspot_features.append(zone_anonyme)

signalement_features = []
for i, (geo, nom, lieu, cat, patho, periode, cas, conclusion, cause, src) in enumerate(SIGNALEMENTS):
    signalement_features.append({
        "type": "Feature", "id": f"s{i+1}",
        "geometry": {"type": "Point", "coordinates": GEO[geo]},
        "properties": {"id": f"s{i+1}", "nom": nom, "lieu": lieu, "categorie": cat,
                       "cat_label": CAT_LABEL[cat], "pathologie": patho, "periode": periode,
                       "cas": cas, "conclusion": conclusion, "cause": cause, "source": src},
    })

# --- 100 témoignages fictifs -----------------------------------------------
TOTAL = 420        # cas déclarés simulés
brut = []
for h in HOTSPOTS:
    centre = GEO[h["geo"]]
    for _ in range(h["n_temoins"] * 3):
        brut.append({
            "coord": point_dans_cercle(centre, h["rayon_km"] * 0.88),
            "dep": h["lieu"],
            "hotspot": h["id"], "hotspot_nom": h["nom"],
            "soupcon": random.choice(SOUPCONS[h["id"]]),
        })
for _ in range(TOTAL - len(brut)):
    nom, lon, lat = random.choice(COMMUNES_DIFFUSES)
    brut.append({
        "coord": [round(lon + random.uniform(-0.34, 0.34), 5),
                  round(lat + random.uniform(-0.24, 0.24), 5)],
        "dep": nom, "hotspot": None, "hotspot_nom": None,
        "soupcon": random.choice(SOUPCONS_DIFFUS),
    })
random.shuffle(brut)

temoin_features, audio_n = [], 0
for i, t in enumerate(brut):
    p = tirage_patho()
    annee = random.randint(2012, 2025)
    tranche = random.choices(TRANCHES, weights=[8, 34, 33, 25])[0]
    sexe = random.choice(SEXES)
    deces = random.random() < 0.17
    tid = f"T{i+1:04d}"
    # 8 témoignages « à la une » reçoivent un vrai fichier audio
    audio = audio_n < 12 and random.random() < 0.05
    if audio:
        audio_n += 1
    temoin_features.append({
        "type": "Feature", "id": tid,
        "geometry": {"type": "Point", "coordinates": t["coord"]},
        "properties": {
            "id": tid, "patho_id": p["id"], "patho_label": p["label"],
            "sous_type": random.choice(p["sous_types"]), "color": p["color"],
            "annee": annee, "tranche_age": tranche, "sexe": sexe,
            "dep": t["dep"],
            "hotspot": t["hotspot"], "hotspot_nom": t["hotspot_nom"],
            "exposition": random.choice(EXPOSITIONS),
            "profession_parent": random.choice(PROFESSIONS),
            "issue": "Décès" if deces else "En rémission / suivi",
            "temoignage": redige(annee, tranche, sexe, deces, t["soupcon"]),
            "audio": f"audio/{tid}.m4a" if audio else None,
            "duree_audio": None,
            "verifie": random.random() < 0.6,
            "recu_le": f"{random.randint(1, 28):02d}/{random.randint(1, 8):02d}/2026",
        },
    })

data = {
    "meta": {
        "titre": "Atlas de l'exposome — démo carto",
        "clusters_reels": "Clusters et signalements : données publiques réelles, reprises du "
                          "classeur « Projet NK - Document central », sourcées sur Santé publique "
                          "France, les registres et la presse. Chaque fiche porte son lien source.",
        "temoignages_fictifs": "Les 100 témoignages individuels sont ENTIÈREMENT FICTIFS, "
                               "générés pour tester le rendu. Aucun ne correspond à une personne "
                               "réelle.",
        "genere_le": "2026-08-11",
        "n_temoignages": len(temoin_features),
        "n_hotspots": len(HOTSPOTS),
        "n_signalements": len(signalement_features),
        "pathologies": [{"id": p["id"], "label": p["label"], "color": p["color"]} for p in PATHOS],
        "annees": [2012, 2025],
        "cat_label": CAT_LABEL,
    },
    "hotspots": {"type": "FeatureCollection", "features": hotspot_features},
    "signalements": {"type": "FeatureCollection", "features": signalement_features},
    "temoignages": {"type": "FeatureCollection", "features": temoin_features},
}

out = HERE.parent / "js" / "data.js"
out.write_text(
    "/* Généré par scripts/generate-data.py — NE PAS ÉDITER À LA MAIN.\n"
    "   Clusters et signalements : données publiques réelles (sources dans chaque fiche).\n"
    "   Témoignages individuels : 100 % fictifs, générés pour la démo. */\n"
    "window.NK_DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8")

(HERE / "audio-todo.txt").write_text(
    "\n".join(f"{f['properties']['id']}\t{f['properties']['sexe']}\t{f['properties']['temoignage']}"
              for f in temoin_features if f["properties"]["audio"]), encoding="utf-8")

print(f"✓ {out}")
print(f"  {len(HOTSPOTS)} hotspots + 1 zone anonymisée, {len(signalement_features)} signalements, "
      f"{len(temoin_features)} témoignages fictifs ({audio_n} avec audio)")
print("  audio à générer :", ", ".join(f["properties"]["id"] for f in temoin_features
                                       if f["properties"]["audio"]))
