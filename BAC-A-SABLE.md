# Bac à sable

Chacun peut avoir **sa propre copie du site**, en ligne, pour essayer des choses sans
toucher au site de l'équipe. On l'appelle un « bac à sable ».

|  | Adresse | Qui peut modifier |
|---|---|---|
| Le site | <https://nicobertoz.github.io/atlas-exposome-demo/> | Nicolas seulement |
| Votre bac | `…/atlas-exposome-demo/bac/votre-prénom/` | vous |
| Tous les bacs | <https://nicobertoz.github.io/atlas-exposome-demo/bac/> | — |

Votre bac est une copie complète : la carte, le déroulé, le questionnaire, les couleurs.
Vous pouvez tout y casser, **le site de l'équipe n'en saura rien**.

---

## Ouvrir votre bac, une fois pour toutes

Il n'y a rien à installer. Tout se passe dans le navigateur.

1. Demandez à Nicolas de vous ajouter au dépôt (il vous enverra une invitation par
   e-mail, à accepter).
2. Allez sur <https://github.com/NicoBertoz/atlas-exposome-demo>.
3. Cliquez sur le menu déroulant qui affiche **`main`**, en haut à gauche de la liste
   des fichiers.
4. Tapez `bac/` suivi de votre prénom en minuscules, sans accent :
   par exemple **`bac/philippine`**.
5. Cliquez sur **« Create branch: bac/philippine from main »**.

C'est fait. Une minute plus tard, votre bac est en ligne à l'adresse
`https://nicobertoz.github.io/atlas-exposome-demo/bac/philippine/`.

> Le prénom ne doit contenir que des minuscules, des chiffres et des tirets. `bac/philippine`
> ou `bac/marie-jo` fonctionnent ; `bac/Philippine` ou `bac/philippine 2` seront refusés,
> parce que ce nom devient un morceau d'adresse web.

---

## Modifier votre bac

### La méthode simple : l'éditeur GitHub

1. Sur la page du dépôt, vérifiez que le menu affiche bien **votre branche**
   (`bac/philippine`) et pas `main`. **C'est la seule chose à ne pas rater.**
2. Ouvrez le fichier à modifier, cliquez sur le crayon ✏️ en haut à droite.
3. Modifiez, puis cliquez sur **Commit changes**.
4. Vérifiez encore une fois que « Commit directly to the `bac/philippine` branch »
   est sélectionné. Validez.

Une minute plus tard, votre bac est à jour. Rechargez la page avec **Ctrl+Maj+R**
(ou **Cmd+Maj+R** sur Mac) pour éviter que le navigateur vous ressorte l'ancienne version.

### La méthode confortable : l'éditeur en plein écran

Sur la page du dépôt, appuyez sur la touche **`.`** (point). Un éditeur de code complet
s'ouvre dans le navigateur, avec l'arborescence à gauche. C'est le même que celui des
développeurs, sans rien installer.

Pour enregistrer : icône « Source Control » dans la barre de gauche → message → coche.

---

## Où toucher quoi

| Ce que vous voulez changer | Le fichier |
|---|---|
| Les couleurs, les tailles, les espacements | `css/app.css`, tout en haut |
| Le texte du déroulé et ses incises | `js/recit.js` |
| Les pages À propos, Ressources, Participer | `apropos.html`, `ressources.html`, `participer.html` |
| Les questions du formulaire | `questionnaire.html` |
| Ce que montre la carte | `js/app.js`, `js/engine-deck.js` |
| Le fond de carte (couleurs du pays) | `js/style-nk.js`, bloc `PALETTES` |

Pour un simple essai de couleurs, **tout est en haut de `css/app.css`**, dans le bloc
`:root` : changez une valeur, enregistrez, regardez.

---

## Voir votre bac

- Votre bac : `https://nicobertoz.github.io/atlas-exposome-demo/bac/votre-prénom/`
- La liste de tous les bacs : <https://nicobertoz.github.io/atlas-exposome-demo/bac/>
- L'état du déploiement : onglet **Actions** du dépôt. Un rond orange = en cours,
  une coche verte = en ligne, une croix rouge = quelque chose a cassé (le message
  d'erreur est dedans).

---

## Reprendre les nouveautés du site

Le site principal continue d'avancer. Pour récupérer ses changements dans votre bac :

1. Onglet **Pull requests** → **New pull request**
2. base : **votre branche** — compare : **main**
   *(dans ce sens-là : on ramène `main` VERS votre bac)*
3. **Create pull request**, puis **Merge**.

Si GitHub annonce un conflit, c'est que vous avez modifié la même ligne que le site.
Appelez Nicolas plutôt que de trancher au jugé.

---

## Proposer votre idée pour le vrai site

C'est le but du bac : essayer, montrer, puis proposer.

1. Onglet **Pull requests** → **New pull request**
2. base : **main** — compare : **votre branche**
3. Décrivez ce que vous avez changé et pourquoi, avec le lien vers votre bac.
4. **Create pull request**.

Nicolas relit et fusionne. **Personne d'autre ne peut publier sur le site principal**,
y compris par erreur : la branche `main` n'accepte que des propositions relues.

---

## Questions fréquentes

**Je peux casser le site principal ?**
Non. Votre branche est isolée, et `main` est protégée : elle refuse toute modification
directe, y compris de votre part.

**Mon bac ne se met pas à jour.**
Trois causes, dans l'ordre de fréquence : le navigateur a gardé l'ancienne version
(**Ctrl+Maj+R**) ; le déploiement est encore en cours (onglet Actions) ; vous avez
enregistré sur `main` au lieu de votre branche — dans ce cas prévenez Nicolas.

**Le fond de carte ne s'affiche pas dans mon bac.**
Il est partagé avec le site principal pour ne pas dupliquer 82 Mo par bac. Il fonctionne
donc, mais vous ne pouvez pas le remplacer depuis votre bac. Les couleurs du pays, elles,
se changent normalement dans `js/style-nk.js`.

**Je veux repartir de zéro.**
Supprimez votre branche (onglet Branches → poubelle) et recréez-la depuis `main`.
Le dossier de votre bac restera en ligne jusqu'à ce que Nicolas le retire.

**Je veux être vraiment indépendant·e.**
Utilisez le bouton **Fork** : vous obtenez une copie entière du dépôt sous votre nom,
que vous administrez seul·e. Plus lourd à mettre en place, mais totalement séparé.
