/* ------------------------------------------------------------------ *
 *  drom-panel.js — le cartouche des outre-mer, à droite de la carte.
 *
 *  Trois relectures ont demandé que les DROM apparaissent, et Lila a posé
 *  la contrainte utile : « à juste échelle », « où on voit à quel point la
 *  Guyane est immense ». C'est donc un cartouche à ÉCHELLE COMMUNE, pas
 *  cinq vignettes recadrées chacune sur son territoire — le recadrage,
 *  justement, est ce qui fait croire depuis toujours que la Guyane et la
 *  Martinique ont la même taille.
 *
 *  Un seul facteur pixels/kilomètre pour les cinq. Conséquence assumée :
 *  Mayotte est minuscule à côté de la Guyane. C'est le propos.
 *
 *  Le cartouche est en SVG, pas en carte : il n'y a pas de fond de tuiles
 *  outre-mer, et il n'en faut pas pour montrer une forme et un décompte.
 * ------------------------------------------------------------------ */
window.NK_DROM_PANEL = (function () {
  'use strict';

  const D = () => window.NK_DROM || [];

  /* Les codes de département tels qu'ils apparaîtront dans les cas
     déclarés. Le jeu de démonstration est métropolitain : les cinq
     compteurs sont donc à zéro, et c'est écrit plutôt que masqué. */
  function compter(cellules) {
    const n = {};
    (cellules || []).forEach(c => c.temoins.forEach(t => {
      const code = String(t.dep_code || '');
      if (/^97/.test(code)) n[code] = (n[code] || 0) + 1;
    }));
    return n;
  }

  /* Dispose les cinq territoires dans une boîte de `largeur` pixels, tous
     au même facteur d'échelle. La Guyane à gauche, les quatre autres
     rangés à sa droite en colonnes, du plus grand au plus petit. */
  function disposer(largeur, marge) {
    const t = D();
    if (!t.length) return null;
    const guyane = t.find(x => x.code === '973');
    const autres = t.filter(x => x.code !== '973');

    /* Largeur totale en km : la Guyane, plus la colonne la plus large des
       autres. On en déduit le seul facteur d'échelle du cartouche. */
    const colonne = Math.max(...autres.map(a => a.largeurKm));
    const kmLarge = guyane.largeurKm + colonne;
    const echelle = (largeur - marge * 3) / kmLarge;

    const boites = [];
    boites.push({ t: guyane, x: marge, y: marge, s: echelle });

    let y = marge;
    const xCol = marge * 2 + guyane.largeurKm * echelle;
    autres.forEach(a => {
      boites.push({ t: a, x: xCol, y, s: echelle });
      y += a.hauteurKm * echelle + 16;        // 16 px entre deux territoires
    });

    const hauteur = Math.max(
      marge + guyane.hauteurKm * echelle,
      y - 16
    ) + marge;
    return { boites, hauteur, echelle };
  }

  function svg(largeur, marge, compteurs, avecLabels) {
    const d = disposer(largeur, marge);
    if (!d) return '';
    const formes = d.boites.map(b => {
      const chemins = b.t.anneaux.map(r =>
        'M' + r.map(([x, y]) => `${(b.x + x * b.s).toFixed(1)},${(b.y + y * b.s).toFixed(1)}`).join('L') + 'Z'
      ).join(' ');
      const n = compteurs[b.t.code] || 0;
      const cx = b.x + (b.t.largeurKm * b.s) / 2;
      const cy = b.y + b.t.hauteurKm * b.s;
      return `
        <path d="${chemins}" class="drom-terre ${n ? 'avec' : ''}"/>
        ${avecLabels ? `
          <text class="drom-nom" x="${cx.toFixed(1)}" y="${(cy + 13).toFixed(1)}">${b.t.nom}</text>
          <text class="drom-n" x="${cx.toFixed(1)}" y="${(cy + 25).toFixed(1)}">${
            n ? n + (n > 1 ? ' cas' : ' cas') : 'aucun cas'}</text>` : ''}`;
    }).join('');

    /* Une échelle graphique : sans elle, « juste échelle » ne se vérifie pas. */
    const cent = 100 * d.echelle;
    const yEch = d.hauteur - marge + (avecLabels ? 22 : 6);
    return `<svg viewBox="0 0 ${largeur} ${d.hauteur + (avecLabels ? 34 : 12)}" class="drom-svg"
                 role="img" aria-label="Les cinq départements et régions d'outre-mer, à la même échelle">
      ${formes}
      <g class="drom-echelle">
        <line x1="${marge}" y1="${yEch}" x2="${marge + cent}" y2="${yEch}"/>
        <line x1="${marge}" y1="${yEch - 3}" x2="${marge}" y2="${yEch + 3}"/>
        <line x1="${marge + cent}" y1="${yEch - 3}" x2="${marge + cent}" y2="${yEch + 3}"/>
        <text x="${marge + cent + 6}" y="${yEch + 3.5}">100 km</text>
      </g>
    </svg>`;
  }

  function monter(hote, state, onAgrandir) {
    const compteurs = compter(state.cellules);
    const total = Object.values(compteurs).reduce((a, b) => a + b, 0);
    hote.innerHTML = `
      <button class="drom-tete" id="drom-tete" aria-expanded="true" aria-controls="drom-corps">
        <span>Outre-mer</span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
      <div class="drom-corps" id="drom-corps">
        ${svg(196, 10, compteurs, true)}
        <p class="drom-note">${total
          ? `${total} cas déclarés outre-mer.`
          : 'Aucun cas déclaré outre-mer à ce jour.'}</p>
        <button class="drom-plus" id="drom-plus">Agrandir</button>
      </div>`;

    hote.querySelector('#drom-tete').addEventListener('click', () => {
      const on = hote.classList.toggle('ferme');
      hote.querySelector('#drom-tete').setAttribute('aria-expanded', !on);
    });
    hote.querySelector('#drom-plus').addEventListener('click', () => onAgrandir(compteurs, total));
  }

  /* La version agrandie, pour la modale : même échelle commune, en grand. */
  function grandHTML(compteurs, total) {
    return `
      <h3>Les outre-mer, à la même échelle</h3>
      <div class="sub">Les cinq départements et régions d'outre-mer, dessinés au même
        facteur d'échelle que les uns les autres.</div>
      <div class="drom-grand">${svg(560, 18, compteurs, true)}</div>
      <p>La Guyane fait <b>330 km sur 400</b>. C'est plus que la distance Paris-Lyon,
        et davantage que la surface de plusieurs régions métropolitaines réunies. Mayotte,
        à côté, fait 27 km sur 38. Les cartes qui recadrent chaque territoire dans une
        vignette de même taille effacent complètement cet écart.</p>
      <p>${total
        ? `<b>${total} cas</b> ont été déclarés outre-mer.`
        : `<b>Aucun cas n'a encore été déclaré outre-mer.</b> Ce n'est pas une absence de
           malades : c'est une absence de déclarations. Le jeu de démonstration en cours ne
           couvre que la métropole.`}</p>
      <p class="caution">Les zones enquêtées par les autorités ne sont pas non plus
        représentées ici : le corpus rassemblé à ce jour est métropolitain.</p>
      <div style="margin-top:22px"><button class="btn" data-mclose>Fermer</button></div>`;
  }

  return { monter, grandHTML };
})();
