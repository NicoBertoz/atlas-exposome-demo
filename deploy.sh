#!/usr/bin/env bash
# ------------------------------------------------------------------------
#  Mise en ligne de la démo. Le site est 100 % statique.
#
#    ./deploy.sh pages    pousse `main` ; l'Action publie sur gh-pages
#    ./deploy.sh vercel   Vercel, déploiement direct du dossier
#    ./deploy.sh check    vérifie que rien ne manque avant d'envoyer
#
#  Depuis la mise en place des bacs à sable, GitHub Pages ne sert plus
#  `main` mais la branche `gh-pages`, écrite par le workflow
#  .github/workflows/deploiement.yml. Ce script ne fait donc plus que
#  vérifier, versionner les ressources, committer et pousser : c'est
#  l'Action qui publie, et elle publie aussi les bacs.
# ------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")"
REPO="atlas-exposome-demo"

check() {
  echo "→ empreinte des ressources"
  python3 scripts/version-assets.py
  echo "→ fichiers attendus"
  for f in index.html questionnaire.html js/data.js js/app.js css/app.css; do
    [ -f "$f" ] && echo "   ok  $f" || { echo "   MANQUE $f"; exit 1; }
  done
  echo "→ $(ls audio/*.m4a 2>/dev/null | wc -l | tr -d ' ') fichiers audio"
  echo "→ poids total : $(du -sh . | cut -f1)"
  echo "→ liens absolus vers le disque (doit être vide) :"
  grep -rn 'file://\|/Users/' --include=*.html --include=*.js --include=*.css . || echo "   aucun"
}

case "${1:-check}" in
  check) check ;;

  pages)
    check
    if [ ! -d .git ]; then
      git init -q && git branch -M main
      printf '.DS_Store\nscripts/audio-todo.txt\n' > .gitignore
    fi
    git add -A
    git commit -qm "Démo carto Atlas de l'exposome" || true
    gh repo view "$REPO" >/dev/null 2>&1 || \
      gh repo create "$REPO" --public --source=. --remote=origin --push
    git push -q origin main || git push -q --set-upstream origin main
    echo "→ https://$(gh api user -q .login | tr '[:upper:]' '[:lower:]').github.io/$REPO/"
    echo "  publication en cours : gh run watch  (ou l'onglet Actions)"
    ;;

  vercel)
    check
    vercel deploy --prod --yes
    ;;

  *) echo "usage: ./deploy.sh [check|pages|vercel]"; exit 1 ;;
esac
