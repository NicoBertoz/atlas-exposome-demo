/* ------------------------------------------------------------------ *
 *  gen-masque.js — fabrique js/masque-france.js.
 *
 *  Le fond de carte déborde forcément sur les pays voisins, et aucun filtre
 *  de style ne sait distinguer la terre française du reste. On génère donc
 *  un aplat percé à la forme de la France, qu'on pose par-dessus.
 *
 *      cd demo-cartes && node scripts/gen-masque.js
 *
 *  Il lui faut le contour métropolitain, à télécharger une fois :
 *
 *      curl -sLo scripts/fr.geojson \
 *        https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/metropole.geojson
 *
 *  Source : france-geojson (Grégoire David), d'après l'IGN et OpenStreetMap.
 * ------------------------------------------------------------------ */
const fs=require('fs');
const path=require('path');

const ICI=__dirname;
const RACINE=path.join(ICI,'..');
const SOURCE=path.join(ICI,'fr.geojson');

if(!fs.existsSync(SOURCE)){
  console.error(`Contour absent : ${SOURCE}\nVoir l'en-tête de ce fichier pour la commande de téléchargement.`);
  process.exit(1);
}
const g=JSON.parse(fs.readFileSync(SOURCE,'utf8'));

/* Douglas-Peucker itératif : la version récursive déborde la pile sur des
   anneaux de 25 000 points. */
function rdp(pts, eps){
  if(pts.length<3) return pts.slice();
  const garder=new Uint8Array(pts.length);
  garder[0]=garder[pts.length-1]=1;
  const pile=[[0,pts.length-1]];
  while(pile.length){
    const [i0,i1]=pile.pop();
    if(i1-i0<2) continue;
    const [x1,y1]=pts[i0],[x2,y2]=pts[i1];
    const dx=x2-x1, dy=y2-y1, den=Math.hypot(dx,dy);
    let dmax=0, idx=-1;
    for(let i=i0+1;i<i1;i++){
      const [x0,y0]=pts[i];
      const d = den<1e-12 ? Math.hypot(x0-x1,y0-y1)
                          : Math.abs(dy*x0-dx*y0+x2*y1-y2*x1)/den;
      if(d>dmax){dmax=d;idx=i;}
    }
    if(dmax>eps && idx>0){ garder[idx]=1; pile.push([i0,idx],[idx,i1]); }
  }
  return pts.filter((_,i)=>garder[i]);
}

/* Un anneau est fermé : ses extrémités sont confondues, et la première
   corde de Douglas-Peucker serait dégénérée. On le coupe donc au sommet le
   plus éloigné du premier, on simplifie les deux moitiés, puis on recolle. */
function simplifierAnneau(ring, eps){
  const r = ring.slice(0,-1);                  // on retire le point de clôture
  const [ax,ay]=r[0];
  let k=0, dmax=-1;
  for(let i=1;i<r.length;i++){
    const d=Math.hypot(r[i][0]-ax, r[i][1]-ay);
    if(d>dmax){dmax=d;k=i;}
  }
  const a=rdp(r.slice(0,k+1),eps), b=rdp(r.slice(k),eps);
  const out=a.concat(b.slice(1));
  out.push(out[0]);
  return out;
}

const EPS=0.004;                               // ~400 m
const AIRE_MIN=0.0015;                         // ~ 15 km², écarte les confettis
const rings=[];
const polys = g.geometry.type==='MultiPolygon'? g.geometry.coordinates : [g.geometry.coordinates];
for(const poly of polys){
  const outer=poly[0];
  let a=0; for(let i=0;i<outer.length-1;i++){a+=outer[i][0]*outer[i+1][1]-outer[i+1][0]*outer[i][1];}
  if(Math.abs(a/2)<AIRE_MIN) continue;
  const s=simplifierAnneau(outer,EPS).map(p=>[+p[0].toFixed(4),+p[1].toFixed(4)]);
  if(s.length>4) rings.push(s);
}
rings.sort((x,y)=>y.length-x.length);

const out=`/* ------------------------------------------------------------------ *
 *  masque-france.js — le contour de la France métropolitaine, simplifié.
 *
 *  Relecture du 18/08 : « ne pas montrer les autres pays, uniquement la
 *  France ». Les tuiles du fond débordent forcément sur les voisins, et
 *  aucun filtre de style ne sait distinguer la terre française du reste.
 *  La seule façon propre de n'afficher que la France est donc de poser
 *  par-dessus un aplat blanc percé à sa forme.
 *
 *  Le fichier ne porte que les anneaux, une seule fois. Le masque (le monde
 *  troué de la France) et le contour plein en sont dérivés au chargement :
 *  les stocker tous les deux doublait le poids pour rien.
 *
 *    NK_MASQUE   le monde, troué de la France : posé sur le fond, il efface
 *                tout ce qui n'est pas le pays.
 *    NK_CONTOUR  la même forme, pleine : sert à tracer le trait de côte.
 *
 *  Source : france-geojson (Grégoire David, d'après l'IGN et OpenStreetMap),
 *  contour métropolitain simplifié à ~400 m (Douglas-Peucker), îles de moins
 *  de 15 km² écartées. Précision suffisante jusqu'au zoom 10,5, qui est le
 *  maximum autorisé par la caméra (voir shared.js).
 *
 *  Les DROM-COM ne sont PAS dans ce contour : ils demandent des cartouches
 *  séparés, avec leurs propres tuiles. Voir la note de livraison.
 *
 *  Régénéré par scripts/gen-masque.js — ne pas éditer à la main.
 * ------------------------------------------------------------------ */
(function () {
  var anneaux = ${JSON.stringify(rings)};

  /* Le trou doit tourner dans le sens inverse de l'anneau extérieur, sinon
     la règle de remplissage ne le perce pas. */
  var monde = [[-25, 30], [25, 30], [25, 58], [-25, 58], [-25, 30]];
  var trous = anneaux.map(function (r) { return r.slice().reverse(); });

  window.NK_MASQUE = { type: 'Feature', properties: {},
    geometry: { type: 'Polygon', coordinates: [monde].concat(trous) } };

  window.NK_CONTOUR = { type: 'Feature', properties: {},
    geometry: { type: 'MultiPolygon',
                coordinates: anneaux.map(function (r) { return [r]; }) } };
})();
`;
const CIBLE=path.join(RACINE,'js','masque-france.js');
fs.writeFileSync(CIBLE,out);
console.log('anneaux :',rings.length,
            '· points :',rings.reduce((a,r)=>a+r.length,0),
            '· Ko :',Math.round(out.length/1024),
            '→',path.relative(RACINE,CIBLE));
