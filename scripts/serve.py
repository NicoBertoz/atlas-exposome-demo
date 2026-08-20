#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serveur de développement.

`python3 -m http.server` ne répond pas aux requêtes HTTP Range. Or PMTiles
lit le fichier de tuiles par tranches d'octets : sans Range, le fond de carte
auto-hébergé ne se charge pas du tout en local, alors qu'il fonctionnera très
bien sur GitHub Pages, qui les gère.

    python3 scripts/serve.py [port]
"""

import functools
import http.server
import os
import re
import socketserver
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PLAGE = re.compile(r'bytes=(\d*)-(\d*)')


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # les tuiles sont immuables, le reste change à chaque édition
        if self.path.endswith('.pmtiles'):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        else:
            self.send_header('Cache-Control', 'no-cache')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def send_head(self):
        entete = self.headers.get('Range')
        if not entete:
            return super().send_head()

        chemin = self.translate_path(self.path)
        if not os.path.isfile(chemin):
            return super().send_head()

        m = PLAGE.match(entete)
        if not m:
            return super().send_head()

        taille = os.path.getsize(chemin)
        debut, fin = m.group(1), m.group(2)
        if debut == '':                       # bytes=-N : les N derniers octets
            debut = max(0, taille - int(fin))
            fin = taille - 1
        else:
            debut = int(debut)
            fin = int(fin) if fin else taille - 1
        fin = min(fin, taille - 1)

        if debut > fin:
            self.send_error(416, 'Requested Range Not Satisfiable')
            return None

        f = open(chemin, 'rb')
        f.seek(debut)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(chemin))
        self.send_header('Content-Range', f'bytes {debut}-{fin}/{taille}')
        self.send_header('Content-Length', str(fin - debut + 1))
        self.end_headers()
        # SimpleHTTPRequestHandler recopie tout le reste du fichier : on borne
        return _Borne(f, fin - debut + 1)


class _Borne:
    """Enveloppe un fichier pour n'en laisser lire que `reste` octets."""

    def __init__(self, f, reste):
        self.f, self.reste = f, reste

    def read(self, n=-1):
        if self.reste <= 0:
            return b''
        if n < 0 or n > self.reste:
            n = self.reste
        data = self.f.read(n)
        self.reste -= len(data)
        return data

    def close(self):
        self.f.close()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8777
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(
            ('', port), functools.partial(Handler, directory=str(RACINE))) as httpd:
        print(f'→ http://localhost:{port}  (Range activé, racine {RACINE})')
        httpd.serve_forever()
