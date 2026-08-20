/* ------------------------------------------------------------------ *
 *  form.js — questionnaire participatif (maquette)
 *
 *  Rien n'est envoyé nulle part. Le but est de rendre discutables, en
 *  atelier, trois décisions produit :
 *    1. le géocodage se fait DANS LE NAVIGATEUR et ne renvoie qu'un IRIS ;
 *    2. l'e-mail est haché avant de quitter la page ;
 *    3. l'objet transmis est montré à l'utilisateur, en clair.
 * ------------------------------------------------------------------ */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const form = $('#form');
  const steps = [...document.querySelectorAll('.step')];
  let i = 0;

  /* ------------------------------------------------------- NAVIGATION
     Le fil d'étapes en pastilles a été remplacé par une barre et une ligne
     de texte : à six étapes, les pastilles débordaient et n'étaient plus
     lisibles au téléphone. */
  function show(n) {
    i = Math.max(0, Math.min(steps.length - 1, n));
    steps.forEach(s => s.classList.toggle('on', +s.dataset.step === i));
    $('#p-n').textContent = i + 1;
    $('#p-titre').textContent = steps[i].dataset.titre || '';
    $('#progress-barre').style.width = ((i + 1) / steps.length * 100).toFixed(1) + '%';
    $('#prev').hidden = i === 0;
    $('#next').hidden = i === steps.length - 1;
    $('#send').hidden = i !== steps.length - 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Validation étape par étape : on ne bloque que sur les champs requis
     de l'étape courante, pas sur tout le formulaire. */
  function etapeValide() {
    const champs = [...steps[i].querySelectorAll('[required]')];
    for (const c of champs) {
      if (!c.value || (c.type === 'checkbox' && !c.checked)) {
        c.focus();
        c.style.borderColor = 'var(--danger)';
        setTimeout(() => { c.style.borderColor = ''; }, 1600);
        return false;
      }
    }
    return true;
  }

  $('#next').addEventListener('click', () => { if (etapeValide()) show(i + 1); });
  $('#prev').addEventListener('click', () => show(i - 1));

  /* -------------------------------------------------- CHAMPS DYNAMIQUES */
  form.patho.addEventListener('change', e => {
    $('#autre-wrap').hidden = e.target.value !== 'autre';
  });

  const zone = form.temoignage;
  zone.addEventListener('input', () => {
    $('#wc').textContent = zone.value.trim() ? zone.value.trim().split(/\s+/).length : 0;
  });

  /* --------------------------------------------------------- GÉOCODAGE
     L'API Adresse est interrogée depuis le navigateur. L'adresse saisie ne
     transite donc jamais par nos serveurs : seul le code IRIS retenu partira.
     En production, il faudra un débounce plus long et un repli hors ligne. */
  const IRIS = {};   // commune -> { code, nom, contexte }

  function brancherAutocomplete(inputId, sortieId) {
    const input = document.getElementById(inputId);
    const box = inputId === 'commune' ? $('#suggest') : null;
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      IRIS[inputId] = null;
      const q = input.value.trim();
      if (q.length < 3) { if (box) box.innerHTML = ''; return; }
      t = setTimeout(async () => {
        try {
          const r = await fetch('https://api-adresse.data.gouv.fr/search/?type=municipality&limit=5&q='
            + encodeURIComponent(q));
          const j = await r.json();
          const items = j.features || [];
          if (box) {
            box.innerHTML = items.map((f, k) =>
              `<button type="button" class="s" data-k="${k}">${f.properties.label}
               <span>${f.properties.context}</span></button>`).join('');
            box._items = items;
          } else if (items[0]) {
            retenir(inputId, items[0], sortieId);
          }
        } catch (e) {
          const out = document.getElementById(sortieId);
          if (out) out.textContent = 'Annuaire des communes injoignable — vous pouvez saisir librement.';
        }
      }, 320);
    });
  }

  function retenir(inputId, f, sortieId) {
    const p = f.properties;
    /* Le vrai code de quartier (IRIS) demande l'adresse complète. À l'échelle
       de la maquette on garde le code INSEE de la commune, et on le dit. */
    IRIS[inputId] = { insee: p.citycode, commune: p.city, contexte: p.context };
    document.getElementById(inputId).value = p.city;
    const out = document.getElementById(sortieId);
    if (out) {
      out.textContent = `Commune reconnue : ${p.city}, ${p.context}.`;
      out.classList.add('iris-ok');
    }
    if (inputId === 'commune') $('#suggest').innerHTML = '';
  }

  brancherAutocomplete('commune', 'commune-out');
  brancherAutocomplete('commune2', null);

  $('#suggest').addEventListener('click', e => {
    const b = e.target.closest('.s'); if (!b) return;
    retenir('commune', $('#suggest')._items[+b.dataset.k], 'commune-out');
  });

  /* ------------------------------------------------------------- ENVOI */
  async function hacher(txt) {
    if (!txt) return null;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt.toLowerCase()));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
  }

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!etapeValide()) return;

    // Le piège anti-robot : rempli = on fait semblant d'accepter, on jette
    if (form.site.value) { $('#form').hidden = true; $('#done').hidden = false; return; }

    const d = new FormData(form);
    const payload = {
      /* Plus de champ `objet` : la déclaration de pollution est sortie du
         périmètre, le formulaire ne porte plus que des cas de maladie. */
      declarant: d.get('qui') || null,
      pathologie: d.get('patho') === 'autre' ? d.get('patho_autre') : d.get('patho'),
      annee_diagnostic: Number(d.get('annee')) || null,
      tranche_age: d.get('age'),
      /* Rien n'est pré-coché : l'absence de réponse doit rester une absence
         de réponse, pas une valeur choisie par le formulaire. */
      sexe: d.get('sexe') || null,
      localisation: {
        residence_insee: IRIS.commune ? IRIS.commune.insee : null,
        grossesse_insee: IRIS.commune2 ? IRIS.commune2.insee : null,
        adresse_conservee: false,
        maille_publication: 'secteur ~25 km, seuil 3 cas',
      },
      exposition_suspectee: d.get('exposition') || null,
      profession_parents: d.get('profession') || null,
      temoignage: d.get('temoignage') || null,
      audio_volontaire: !!d.get('audio_ok'),
      consentements: {
        enregistrement: !!d.get('c_base'),
        carte_publique: !!d.get('c_carte'),
        temoignage_publie: !!d.get('c_temoignage'),
        recontact_scientifique: !!d.get('c_recontact'),
      },
      contact_hache: await hacher(d.get('email')),
      recu_le: new Date().toISOString().slice(0, 10),
      statut: 'en attente de revue manuelle',
    };

    $('#payload').textContent = JSON.stringify(payload, null, 2);
    form.hidden = true;
    $('#progress').hidden = true;
    $('#progress-txt').hidden = true;
    document.querySelector('.note-bas').hidden = true;
    $('#done').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  show(0);
})();
