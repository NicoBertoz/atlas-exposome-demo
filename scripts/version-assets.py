#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ajoute une empreinte de contenu aux ressources locales des pages HTML.

Sans ça, un navigateur qui a déjà visité le site continue de servir l'ancien
JavaScript après une mise à jour : la page se recharge, le code non. À lancer
avant chaque déploiement (deploy.sh s'en charge).
"""
import hashlib
import pathlib
import re

RACINE = pathlib.Path(__file__).resolve().parent.parent

fichiers = sorted(RACINE.glob('js/*.js')) + sorted(RACINE.glob('css/*.css'))
h = hashlib.sha256()
for f in fichiers:
    h.update(f.read_bytes())
ver = h.hexdigest()[:8]

# Toutes les pages, pas seulement les deux premières : le site en compte
# désormais sept, et une page oubliée ici sert indéfiniment l'ancien CSS aux
# visiteurs déjà venus.
pages = sorted(RACINE.glob('*.html'))

for p in pages:
    s = p.read_text(encoding='utf-8')
    s = re.sub(r'(href="css/[\w.-]+\.css)(\?v=[\w.-]+)?"', r'\1?v=' + ver + '"', s)
    s = re.sub(r'(src="js/[\w.-]+\.js)(\?v=[\w.-]+)?"', r'\1?v=' + ver + '"', s)
    p.write_text(s, encoding='utf-8')

print(f'ressources versionnées : {ver} ({len(pages)} pages)')
