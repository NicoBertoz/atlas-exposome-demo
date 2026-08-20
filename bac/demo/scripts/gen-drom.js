const fs = require('fs'), path = require('path');
const RACINE = '/Users/berthoz/Documents/Projet-NK/demo-cartes';
const g = JSON.parse(fs.readFileSync(path.join(__dirname, 'ne0.geojson'), 'utf8'));

/* Les cinq départements et régions d'outre-mer. Les COM (Saint-Martin,
   Polynésie, Nouvelle-Calédonie…) ne sont pas des départements et sortent
   du périmètre du registre : on ne les dessine pas. */
const VOULUS = [
  ['French Guiana', 'Guyane', '973'],
  ['Guadeloupe',    'Guadeloupe', '971'],
  ['Martinique',    'Martinique', '972'],
  ['Réunion',       'La Réunion', '974'],
  ['Mayotte',       'Mayotte', '976'],
];

/* Douglas-Peucker itératif, en degrés. */
function rdp(pts, eps) {
  if (pts.length < 3) return pts.slice();
  const garder = new Uint8Array(pts.length);
  garder[0] = garder[pts.length - 1] = 1;
  const pile = [[0, pts.length - 1]];
  while (pile.length) {
    const [i0, i1] = pile.pop();
    if (i1 - i0 < 2) continue;
    const [x1, y1] = pts[i0], [x2, y2] = pts[i1];
    const dx = x2 - x1, dy = y2 - y1, den = Math.hypot(dx, dy);
    let dmax = 0, idx = -1;
    for (let i = i0 + 1; i < i1; i++) {
      const [x0, y0] = pts[i];
      const d = den < 1e-12 ? Math.hypot(x0 - x1, y0 - y1)
                            : Math.abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / den;
      if (d > dmax) { dmax = d; idx = i; }
    }
    if (dmax > eps && idx > 0) { garder[idx] = 1; pile.push([i0, idx], [idx, i1]); }
  }
  return pts.filter((_, i) => garder[i]);
}

const out = [];
for (const [nomNE, nom, code] of VOULUS) {
  const f = g.features.find(x => (x.properties.NAME === nomNE) && x.properties.SOVEREIGNT === 'France');
  if (!f) { console.warn('introuvable :', nomNE); continue; }
  const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];

  // centre du territoire, pour convertir les degrés en kilomètres sur place
  let minx = 180, maxx = -180, miny = 90, maxy = -90;
  polys.forEach(p => p[0].forEach(([x, y]) => {
    minx = Math.min(minx, x); maxx = Math.max(maxx, x);
    miny = Math.min(miny, y); maxy = Math.max(maxy, y);
  }));
  const latC = (miny + maxy) / 2;
  const kx = 111.320 * Math.cos(latC * Math.PI / 180);   // km par degré de longitude
  const ky = 110.574;                                    // km par degré de latitude

  /* On garde les îles d'au moins 3 km², sinon les récifs font du bruit. */
  const anneaux = [];
  for (const poly of polys) {
    const r = poly[0];
    let a = 0;
    for (let i = 0; i < r.length - 1; i++) a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
    const aireKm = Math.abs(a / 2) * kx * ky;
    if (aireKm < 3) continue;
    const s = rdp(r, 0.004).map(([x, y]) => [
      +((x - minx) * kx).toFixed(2),          // km depuis le coin ouest
      +((maxy - y) * ky).toFixed(2),          // km depuis le coin nord (y vers le bas)
    ]);
    if (s.length > 3) anneaux.push(s);
  }
  anneaux.sort((a, b) => b.length - a.length);

  out.push({
    code, nom,
    largeurKm: +((maxx - minx) * kx).toFixed(1),
    hauteurKm: +((maxy - miny) * ky).toFixed(1),
    anneaux,
  });
}

const js = `/* ------------------------------------------------------------------ *
 *  drom.js — le contour des cinq départements et régions d'outre-mer.
 *
 *  Demandé trois fois en relecture (Philippine deux fois, Lila une) :
 *  « faire apparaître les DROM-COM, à juste échelle », et l'idée de Lila
 *  « où on voit à quel point la Guyane est immense ».
 *
 *  Le fond de carte ne couvre que la métropole, et il n'a pas vocation à
 *  s'étendre : ajouter cinq jeux de tuiles pour cinq territoires sans
 *  aucun cas déclaré serait disproportionné. On dessine donc les contours
 *  seuls, en SVG, dans un cartouche à droite de la carte.
 *
 *  ÉCHELLE. C'est le point de la demande, et il commande le format des
 *  données : chaque territoire est stocké en KILOMÈTRES depuis son coin
 *  nord-ouest, pas en degrés. Un degré de longitude ne vaut pas la même
 *  distance à Mayotte (-12°) et en Guyane (4°) ; en degrés, les tailles
 *  relatives seraient fausses. En kilomètres, un seul facteur d'échelle
 *  suffit pour les cinq, et la Guyane apparaît pour ce qu'elle est :
 *  plus vaste que tous les autres réunis, et que bien des régions
 *  métropolitaines.
 *
 *  Source : Natural Earth 10m (domaine public), contours simplifiés à
 *  ~400 m, îles de moins de 3 km² écartées.
 *  Régénéré par scripts/gen-drom.js — ne pas éditer à la main.
 * ------------------------------------------------------------------ */
window.NK_DROM = ${JSON.stringify(out)};
`;
fs.writeFileSync(path.join(RACINE, 'js/drom.js'), js);
fs.copyFileSync(__filename, path.join(RACINE, 'scripts/gen-drom.js'));
out.forEach(d => console.log(d.code, d.nom.padEnd(12), d.largeurKm + '×' + d.hauteurKm + ' km', d.anneaux.length + ' anneaux',
  d.anneaux.reduce((a, r) => a + r.length, 0) + ' pts'));
console.log('→ js/drom.js', Math.round(js.length / 1024), 'Ko');
