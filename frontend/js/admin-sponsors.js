/**
 * ============================================================================
 *  ADMIN — écran « Partenaires »
 * ============================================================================
 *
 *  Trois cartes, dans l'ordre où on s'en sert :
 *   1. Réglages d'affichage  — interrupteur général, durées, fréquence de l'interstitiel ;
 *   2. Fiches partenaires    — création / modification / suppression, logo sur Drive ;
 *   3. Fiche de visibilité   — ce qu'on renvoie au partenaire après l'événement.
 *
 *  ⚠️ PROTOTYPE — LA MESURE NE SORT PAS DE L'APPAREIL. La carte « fiche de visibilité »
 *  lit les compteurs du NAVIGATEUR COURANT (voir sponsors.js). Elle affiche donc les
 *  chiffres de la tablette restée sur la page pendant le tournoi, et l'écrit noir sur
 *  blanc sur la fiche imprimée. Consolider entre spectateurs demanderait un collecteur
 *  séparé — hors périmètre, documenté dans docs/sponsors.md.
 *
 *  Nécessite (chargés AVANT) : commun.js, api.js, admin.js (redimensionnerImage,
 *  brancherZoneImage, urlAffiche), sponsors.js.
 * ============================================================================
 */

let sponsorsAdmin = [];          // fiches telles que renvoyées par le backend
let sponsorLogoDataURI = null;   // logo choisi mais pas encore enregistré
let sponsorLogoRetirer = false;  // l'utilisateur a demandé à retirer le logo existant

/* ==========================================================================
   DÉMARRAGE
   ========================================================================== */

function initAdminSponsors() {
  if (!document.getElementById('bloc-sponsors-liste')) return;

  document.getElementById('form-sponsors-reglages')
    .addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('form-sponsor')
    .addEventListener('submit', function (e) { e.preventDefault(); });

  document.getElementById('bouton-enregistrer-sponsors-reglages')
    .addEventListener('click', onEnregistrerReglagesSponsors);
  document.getElementById('bouton-tester-interstitiel')
    .addEventListener('click', onTesterInterstitiel);
  document.querySelector('[name="sponsor_interstitiel_actif"]')
    .addEventListener('change', majLignesInterstitiel);

  document.getElementById('bouton-enregistrer-sponsor').addEventListener('click', onEnregistrerSponsor);
  document.getElementById('bouton-annuler-sponsor').addEventListener('click', reinitialiserFormSponsor);
  document.getElementById('liste-sponsors').addEventListener('click', onClicListeSponsors);

  brancherZoneImage({
    champFichier: '#form-sponsor [name="sponsor_logo"]',
    zoneDepot: 'zone-depot-sponsor-logo',
    traiter: traiterFichierLogoSponsor
  });
  document.getElementById('bouton-retirer-sponsor-logo').addEventListener('click', onRetirerLogoSponsor);

  document.getElementById('bouton-rafraichir-bilan').addEventListener('click', afficherBilanSponsors);
  document.getElementById('bouton-imprimer-bilan').addEventListener('click', function () { window.print(); });
  document.getElementById('bouton-exporter-bilan').addEventListener('click', onExporterBilanCsv);
  document.getElementById('bouton-vider-bilan').addEventListener('click', onViderBilan);
  document.getElementById('projection-appareils').addEventListener('input', afficherBilanSponsors);
}

/** Appelé par admin.js une fois la config chargée : remplit les réglages puis la liste. */
async function majSponsors() {
  if (!document.getElementById('bloc-sponsors-liste')) return;
  injecterReglagesSponsors(configCourante.global || {});
  await chargerSponsors();
  afficherBilanSponsors();
}

/* ==========================================================================
   1. RÉGLAGES D'AFFICHAGE
   ========================================================================== */

/** Les cases à cocher de la carte réglages, avec leur défaut (miroir du backend). */
const SPONSORS_CASES = {
  sponsors_actifs: false,
  sponsors_mur_actif: true,
  sponsor_barre_mobile: true,
  sponsor_interstitiel_actif: false,
  sponsor_interstitiel_premiere_visite: false
};
/** Les champs numériques, avec leur défaut. */
const SPONSORS_NOMBRES = {
  sponsor_rotation_s: 8,
  sponsor_interstitiel_duree_s: 5,
  sponsor_interstitiel_skip_s: 2,
  sponsor_interstitiel_repos_min: 30
};

function injecterReglagesSponsors(global) {
  const form = document.getElementById('form-sponsors-reglages');
  Object.keys(SPONSORS_CASES).forEach(function (cle) {
    const v = String(global[cle] || '').toLowerCase();
    form[cle].checked = v ? (v === 'oui') : SPONSORS_CASES[cle];
  });
  Object.keys(SPONSORS_NOMBRES).forEach(function (cle) {
    const n = parseInt(global[cle], 10);
    form[cle].value = isFinite(n) ? n : SPONSORS_NOMBRES[cle];
  });
  majLignesInterstitiel();
}

/** Les réglages de durée n'ont de sens que si le plein écran est activé. */
function majLignesInterstitiel() {
  const actif = document.querySelector('[name="sponsor_interstitiel_actif"]').checked;
  document.getElementById('lignes-interstitiel').hidden = !actif;
}

async function onEnregistrerReglagesSponsors() {
  const form = document.getElementById('form-sponsors-reglages');
  const message = document.getElementById('message-sponsors-reglages');
  const data = {};
  Object.keys(SPONSORS_CASES).forEach(function (cle) { data[cle] = form[cle].checked ? 'oui' : 'non'; });
  Object.keys(SPONSORS_NOMBRES).forEach(function (cle) { data[cle] = form[cle].value; });

  // Garde-fou côté écran (le backend le refait) : « Passer » ne peut pas arriver après la
  // fermeture automatique, sinon le message serait impossible à écourter.
  if (Number(data.sponsor_interstitiel_skip_s) > Number(data.sponsor_interstitiel_duree_s)) {
    data.sponsor_interstitiel_skip_s = data.sponsor_interstitiel_duree_s;
    form.sponsor_interstitiel_skip_s.value = data.sponsor_interstitiel_duree_s;
  }

  await avecBoutonOccupe(document.getElementById('bouton-enregistrer-sponsors-reglages'), message, async function () {
    const r = await apiPostProtege('enregistrerReglagesSponsors', data, 'admin', 'admin');
    if (r.error) { afficherMessage(message, '⚠️ ' + r.error, 'ko'); return; }
    Object.keys(data).forEach(function (cle) { configCourante.global[cle] = data[cle]; });
    afficherMessage(message, data.sponsors_actifs === 'oui'
      ? '✅ Réglages enregistrés — les partenaires sont visibles sur la page publique.'
      : '✅ Réglages enregistrés — les partenaires restent masqués (interrupteur général sur « non »).', 'ok');
  });
}

/**
 * Aperçu du message plein écran, avec les réglages COURANTS du formulaire (même ceux qui ne
 * sont pas encore enregistrés) : on voit ce qu'on s'apprête à publier avant de le publier.
 */
function onTesterInterstitiel() {
  const form = document.getElementById('form-sponsors-reglages');
  const message = document.getElementById('message-sponsors-reglages');
  const candidats = sponsorsPourEmplacement(sponsorsActifsAdmin(), 'plein');
  if (!candidats.length) {
    afficherMessage(message,
      '⚠️ Aucun partenaire n\'est coché sur l\'emplacement « Message plein écran ».', 'ko');
    return;
  }
  const reglages = {
    pleinDureeS: Math.max(3, Math.min(10, Number(form.sponsor_interstitiel_duree_s.value) || 5)),
    pleinSkipS: Math.max(0, Math.min(10, Number(form.sponsor_interstitiel_skip_s.value) || 0))
  };
  if (reglages.pleinSkipS > reglages.pleinDureeS) reglages.pleinSkipS = reglages.pleinDureeS;
  sponsorsAfficherPlein(sponsorsTirer('plein', candidats, true), reglages);
}

/* ==========================================================================
   2. FICHES PARTENAIRES
   ========================================================================== */

/** Fiches actives, au format attendu par le moteur d'affichage (sponsors.js). */
function sponsorsActifsAdmin() {
  return sponsorsAdmin
    .filter(function (s) { return String(s.actif || '').toLowerCase() === 'oui'; })
    .map(function (s) {
      const c = {};
      Object.keys(s).forEach(function (k) { c[k] = (s[k] === null || s[k] === undefined) ? '' : String(s[k]); });
      return c;
    });
}

async function chargerSponsors() {
  const zone = document.getElementById('liste-sponsors');
  try {
    const r = await apiPostProtege('listerSponsors', {}, 'admin', 'admin');
    sponsorsAdmin = (r && r.sponsors) || [];
  } catch (err) {
    zone.innerHTML = '<p class="vide">Erreur de chargement des partenaires : ' + echapper(err.message) + '</p>';
    return;
  }
  afficherListeSponsors();
}

function afficherListeSponsors() {
  const zone = document.getElementById('liste-sponsors');
  if (!sponsorsAdmin.length) {
    zone.innerHTML = '<p class="vide">Aucun partenaire pour l\'instant. Ajoute le premier ci-dessous.</p>';
    return;
  }
  let html = '<div class="sponsor-cartes">';
  sponsorsAdmin.forEach(function (s) {
    const actif = String(s.actif || '').toLowerCase() === 'oui';
    const emplacements = String(s.emplacements || '').split(',')
      .map(function (x) { return x.trim(); })
      .filter(Boolean)
      .map(function (x) { return '<span class="sp-tag">' + echapper(etiquetteEmplacement(x)) + '</span>'; })
      .join('');
    html +=
      '<div class="sponsor-carte' + (actif ? '' : ' est-inactif') + '">' +
        '<div class="sponsor-carte-logo">' +
          (s.logo_id
            ? '<img src="' + echapper(urlAffiche(s.logo_id, 240)) + '" alt="' + echapper(s.nom) + '">'
            : '<span class="sponsor-pastille" style="background:' + echapper(couleurSponsor(s)) + '">' +
              echapper(s.nom) + '</span>') +
        '</div>' +
        '<div class="sponsor-carte-corps">' +
          '<strong>' + echapper(s.nom) + '</strong>' +
          (s.accroche ? '<span class="sponsor-accroche">' + echapper(s.accroche) + '</span>' : '') +
          '<div class="sponsor-tags">' + emplacements +
            '<span class="sp-tag sp-tag-poids">poids ' + echapper(String(s.poids || 1)) + '</span>' +
            (actif ? '' : '<span class="sp-tag sp-tag-off">masqué</span>') +
          '</div>' +
        '</div>' +
        '<div class="sponsor-carte-actions">' +
          '<button type="button" class="bouton-lien" data-action="modifier" data-id="' + echapper(s.id_sponsor) + '">Modifier</button>' +
          '<button type="button" class="bouton-lien danger" data-action="supprimer" data-id="' + echapper(s.id_sponsor) + '">Supprimer</button>' +
        '</div>' +
      '</div>';
  });
  zone.innerHTML = html + '</div>';
}

function etiquetteEmplacement(cle) {
  return (SPONSORS_LIBELLES[cle] || cle).replace(' · ', ' ');
}

function couleurSponsor(s) {
  const c = String(s.couleur || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c : '#0C1C2E';
}

function onClicListeSponsors(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  if (btn.getAttribute('data-action') === 'modifier') remplirFormSponsor(id);
  else onSupprimerSponsor(id);
}

function remplirFormSponsor(id) {
  const s = sponsorsAdmin.filter(function (x) { return String(x.id_sponsor) === String(id); })[0];
  if (!s) return;
  const form = document.getElementById('form-sponsor');

  form.id_sponsor.value = s.id_sponsor;
  form.nom.value = s.nom || '';
  form.accroche.value = s.accroche || '';
  form.url.value = s.url || '';
  form.couleur.value = couleurSponsor(s).toLowerCase();
  form.poids.value = s.poids || 1;
  form.ordre.value = s.ordre || 100;
  form.actif.checked = String(s.actif || '').toLowerCase() === 'oui';

  const emplacements = String(s.emplacements || '').split(',').map(function (x) { return x.trim(); });
  SPONSORS_EMPLACEMENTS.forEach(function (e) {
    form['emp_' + e].checked = emplacements.indexOf(e) >= 0;
  });

  sponsorLogoDataURI = null;
  sponsorLogoRetirer = false;
  majApercuLogoSponsor(s.logo_id ? urlAffiche(s.logo_id, 320) : '');

  document.getElementById('titre-form-sponsor').textContent = 'Modifier « ' + s.nom + ' »';
  document.getElementById('bouton-annuler-sponsor').hidden = false;
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function reinitialiserFormSponsor() {
  const form = document.getElementById('form-sponsor');
  form.reset();
  form.id_sponsor.value = '';
  form.couleur.value = '#0c1c2e';
  form.poids.value = 1;
  form.ordre.value = 100;
  form.actif.checked = true;
  SPONSORS_EMPLACEMENTS.forEach(function (e) { form['emp_' + e].checked = (e === 'mur'); });

  sponsorLogoDataURI = null;
  sponsorLogoRetirer = false;
  majApercuLogoSponsor('');

  document.getElementById('titre-form-sponsor').textContent = 'Ajouter un partenaire';
  document.getElementById('bouton-annuler-sponsor').hidden = true;
  afficherMessage(document.getElementById('message-sponsor'), '', 'ok');
}

/** Aperçu du logo (choisi ou déjà enregistré). Vide = zone masquée. */
function majApercuLogoSponsor(src) {
  const bloc = document.getElementById('apercu-sponsor-logo');
  const img = document.getElementById('apercu-sponsor-logo-img');
  if (!src) { bloc.hidden = true; img.removeAttribute('src'); return; }
  img.src = src;
  bloc.hidden = false;
}

/**
 * Un logo est une petite image : 600 px de côté suffisent largement, et allègent l'envoi.
 *
 * ⚠️ FOND BLANC PEINT, ET SORTIE EN PNG. Un logo de partenaire est presque toujours un PNG
 * détouré. Tout maillon qui aplatit la transparence — encodage JPEG, mais aussi le proxy
 * d'images qui sert les fichiers Drive — le fait ressortir sur un carré NOIR, parce qu'un
 * canevas vierge est transparent-noir. Plutôt que de parier sur le bon comportement de
 * chaque maillon, on peint un fond blanc : il n'y a plus de transparence à rater, et le
 * résultat est le même partout. Les tuiles qui accueillent les logos sont blanches, le fond
 * peint est donc invisible.
 */
async function traiterFichierLogoSponsor(fichier) {
  const message = document.getElementById('message-sponsor');
  if (!fichier) return;
  if (!/^image\//.test(fichier.type)) {
    afficherMessage(message, '⚠️ Choisis une image (PNG, JPEG ou WebP).', 'ko');
    return;
  }
  try {
    sponsorLogoDataURI = await redimensionnerImage(fichier, 600, 0.92, 'image/png', '#FFFFFF');
    sponsorLogoRetirer = false;
    majApercuLogoSponsor(sponsorLogoDataURI);
    afficherMessage(message, 'Logo prêt — clique « Enregistrer le partenaire » pour le sauvegarder.', 'ok');
  } catch (e) {
    afficherMessage(message, '⚠️ Image illisible.', 'ko');
  }
}

function onRetirerLogoSponsor() {
  sponsorLogoDataURI = null;
  sponsorLogoRetirer = true;   // sera transmis au backend à l'enregistrement
  majApercuLogoSponsor('');
  afficherMessage(document.getElementById('message-sponsor'),
    'Logo retiré — clique « Enregistrer le partenaire » pour confirmer.', 'ok');
}

async function onEnregistrerSponsor() {
  const form = document.getElementById('form-sponsor');
  const message = document.getElementById('message-sponsor');

  const nom = form.nom.value.trim();
  if (!nom) { afficherMessage(message, '⚠️ Le nom du partenaire est obligatoire.', 'ko'); return; }

  const emplacements = SPONSORS_EMPLACEMENTS.filter(function (e) { return form['emp_' + e].checked; });
  if (!emplacements.length) {
    afficherMessage(message, '⚠️ Coche au moins un emplacement.', 'ko');
    return;
  }

  const data = {
    id_sponsor: form.id_sponsor.value,
    nom: nom,
    accroche: form.accroche.value.trim(),
    url: form.url.value.trim(),
    couleur: form.couleur.value,
    emplacements: emplacements.join(','),
    poids: form.poids.value,
    ordre: form.ordre.value,
    actif: form.actif.checked ? 'oui' : 'non'
  };
  if (sponsorLogoDataURI) data.logo = sponsorLogoDataURI;
  if (sponsorLogoRetirer) data.logo_retirer = 'oui';

  await avecBoutonOccupe(document.getElementById('bouton-enregistrer-sponsor'), message, async function () {
    const r = await apiPostProtege('enregistrerSponsor', data, 'admin', 'admin');
    if (r.error) { afficherMessage(message, '⚠️ ' + r.error, 'ko'); return; }
    await chargerSponsors();
    reinitialiserFormSponsor();
    afficherMessage(message, '✅ Partenaire enregistré.', 'ok');
  });
}

async function onSupprimerSponsor(id) {
  const s = sponsorsAdmin.filter(function (x) { return String(x.id_sponsor) === String(id); })[0];
  if (!s) return;
  const message = document.getElementById('message-sponsor');
  const ok = await dialogConfirmer('Supprimer « ' + s.nom + ' » ?\n\n' +
    'Sa fiche et son logo seront supprimés. Pour le retirer de la page SANS perdre sa fiche, ' +
    'décoche plutôt « Partenaire actif ».', { ok: 'Supprimer', danger: true });
  if (!ok) return;
  try {
    const r = await apiPostProtege('supprimerSponsor', { id_sponsor: id }, 'admin', 'admin');
    if (r.error) { afficherMessage(message, '⚠️ ' + r.error, 'ko'); return; }
    await chargerSponsors();
    afficherMessage(message, '✅ Partenaire supprimé.', 'ok');
  } catch (err) {
    afficherMessage(message, '⚠️ ' + err.message, 'ko');
  }
}

/* ==========================================================================
   3. FICHE DE VISIBILITÉ
   ========================================================================== */

/**
 * Facteur de projection : « et si N personnes avaient consulté la page ? ». Les compteurs
 * mesurés portent sur UN appareil ; multiplier par N donne un ordre de grandeur.
 * Retourne 1 (aucune projection) si le champ est vide ou absurde.
 */
function facteurProjection() {
  const n = parseInt(document.getElementById('projection-appareils').value, 10);
  return (isFinite(n) && n > 1) ? n : 1;
}

function afficherBilanSponsors() {
  const zone = document.getElementById('bilan-sponsors');
  if (!zone) return;

  const bilan = sponsorsBilan(sponsorsActifsAdmin());
  const facteur = facteurProjection();
  const projection = facteur > 1;

  if (!bilan.sponsors.length) {
    zone.innerHTML =
      '<p class="vide">Aucune mesure sur cet appareil pour l\'instant. Ouvre la page publique ' +
      'des scores (avec les partenaires activés, ou en ajoutant <code>?demo=sponsors</code> à ' +
      'son adresse), laisse-la tourner quelques minutes, puis reviens ici.</p>';
    return;
  }

  let html = '';
  if (projection) {
    html += '<p class="bilan-avertissement bilan-projection">⚠️ <strong>Projection — données simulées.</strong> ' +
      'Chiffres mesurés sur 1 appareil, multipliés par ' + facteur + '. À utiliser pour ' +
      'expliquer le dispositif, <strong>jamais</strong> comme un bilan réel envoyé à un partenaire.</p>';
  } else {
    html += '<p class="bilan-avertissement">📏 <strong>Mesuré sur 1 appareil</strong> — prototype, ' +
      'sans consolidation entre spectateurs. Ces chiffres sont réels mais ne représentent que ce navigateur.</p>';
  }

  bilan.sponsors.forEach(function (s) {
    html += ficheSponsor(s, facteur, projection, bilan.totalExpo);
  });
  zone.innerHTML = html;
}

/** Une fiche partenaire : 4 chiffres clés, la courbe horaire, la répartition par emplacement. */
function ficheSponsor(s, facteur, projection, totalExpo) {
  const expo = s.expo * facteur;
  const nomTournoi = (configCourante.global && configCourante.global.tournoi_nom) || 'Tournoi';

  let h = '<article class="fiche-sponsor">' +
    '<header class="fs-tete">' +
      '<span class="fs-marque">' + echapper(s.nom) + '</span>' +
      '<span class="fs-qui"><b>' + echapper(nomTournoi) + '</b>' +
        '<span>Fiche de visibilité' + (projection ? ' — projection' : ' — mesure sur 1 appareil') + '</span></span>' +
    '</header>' +
    '<div class="fs-tuiles">' +
      tuileBilan(sponsorsDuree(expo), 'Exposition cumulée') +
      tuileBilan(String(Math.round(s.affichages * facteur)), 'Affichages') +
      tuileBilan(String(Math.round(s.clics * facteur)), 'Clics vers le site') +
      tuileBilan(s.partDeVoix + ' %', 'Part de voix') +
    '</div>';

  h += courbeVisibilite(s, facteur);

  // Répartition par emplacement (barres classées, une seule teinte : la longueur porte
  // la grandeur, la couleur ne code rien).
  const lignes = Object.keys(s.parEmplacement)
    .map(function (k) { return { cle: k, v: s.parEmplacement[k] }; })
    .filter(function (l) { return l.v > 0; })
    .sort(function (a, b) { return b.v - a.v; });
  if (lignes.length) {
    const maxi = lignes[0].v;
    h += '<div class="fs-fig"><span class="fs-fig-titre">D\'où vient cette exposition</span><div class="fs-rang">';
    lignes.forEach(function (l) {
      h += '<div class="fs-rang-l">' +
        '<span class="n">' + echapper(SPONSORS_LIBELLES[l.cle] || l.cle) + '</span>' +
        '<span class="p"><i style="width:' + Math.round(l.v / maxi * 100) + '%"></i></span>' +
        '<span class="v">' + echapper(sponsorsDuree(l.v * facteur)) + '</span>' +
      '</div>';
    });
    h += '</div></div>';
  }

  // Interstitiel : la durée réellement regardée et le taux de passage anticipé. Chiffre
  // inconfortable, mais c'est lui qui rend les autres crédibles.
  if (s.plein && s.plein.ouverts) {
    const moyenne = Math.round(s.plein.secondes / s.plein.ouverts * 10) / 10;
    const tauxPasse = Math.round(s.plein.passes / s.plein.ouverts * 100);
    h += '<p class="fs-note">Message plein écran : ' + s.plein.ouverts + ' affichage(s), ' +
      moyenne + ' s regardées en moyenne, ' + tauxPasse + ' % passés avant la fin.</p>';
  }

  h += '<p class="fs-methode"><strong>Méthode.</strong> Exposition mesurée côté navigateur : ' +
    'logo présent à plus de 50 % dans l\'écran, onglet actif. Les compteurs restent sur ' +
    'l\'appareil — aucun envoi, aucun cookie, aucun traceur tiers, aucune donnée personnelle. ' +
    (projection
      ? '<strong>Ces chiffres sont une PROJECTION</strong> (mesure d\'un appareil multipliée par ' +
        facteur + '), pas un relevé d\'audience.'
      : '<strong>Version prototype : les chiffres portent sur le seul appareil qui a affiché la ' +
        'page</strong>, ils ne sont pas cumulés entre spectateurs.') +
    '</p></article>';
  return h;
}

function tuileBilan(valeur, libelle) {
  return '<div class="fs-tuile"><span class="v">' + echapper(valeur) + '</span>' +
    '<span class="k">' + echapper(libelle) + '</span></div>';
}

/**
 * Courbe de visibilité : minutes d'exposition par tranche de 30 minutes.
 * Série UNIQUE → teinte unique, la hauteur porte la grandeur. Étiquette directe sur le seul
 * sommet (jamais un nombre sur chaque barre), et un tableau dépliable pour l'accessibilité.
 */
function courbeVisibilite(s, facteur) {
  const cles = Object.keys(s.tranches).sort();
  if (!cles.length) return '';

  const valeurs = cles.map(function (k) { return Math.round(s.tranches[k] * facteur / 60 * 10) / 10; });
  const maxi = Math.max.apply(null, valeurs);
  if (!maxi) return '';

  let barres = '', axe = '', table = '';
  cles.forEach(function (k, i) {
    const v = valeurs[i];
    const pic = (v === maxi);
    barres += '<div class="fs-barre' + (pic ? ' pic' : '') + '" style="height:' +
      Math.max(2, Math.round(v / maxi * 100)) + '%" title="' + echapper(k + ' — ' + v + ' min') + '">' +
      (pic ? '<span class="fs-etiq">' + v + '</span>' : '') + '</div>';
    axe += '<span' + (i % 2 ? ' class="creux"' : '') + '>' + echapper(k) + '</span>';
    table += '<tr><td>' + echapper(k) + '</td><td>' + v + '</td></tr>';
  });

  return '<div class="fs-fig">' +
    '<span class="fs-fig-titre">Visibilité au fil de la journée</span>' +
    '<span class="fs-fig-sous">Minutes d\'exposition, par tranche de 30 minutes</span>' +
    '<div class="fs-histo" role="img" aria-label="Exposition par tranche de 30 minutes, de ' +
      echapper(cles[0]) + ' à ' + echapper(cles[cles.length - 1]) + ', maximum ' + maxi + ' minutes.">' +
      barres + '</div>' +
    '<div class="fs-axe">' + axe + '</div>' +
    '<details class="fs-table"><summary>Voir les données en tableau</summary>' +
      '<table class="table-planning"><thead><tr><th>Tranche</th><th>Minutes</th></tr></thead>' +
      '<tbody>' + table + '</tbody></table></details>' +
  '</div>';
}

/** Export CSV : le tableur du partenaire, ou le tien pour comparer les éditions. */
function onExporterBilanCsv() {
  const bilan = sponsorsBilan(sponsorsActifsAdmin());
  const facteur = facteurProjection();
  const lignes = [['partenaire', 'exposition_secondes', 'affichages', 'clics', 'part_de_voix_pct',
                   'plein_ouverts', 'plein_secondes', 'plein_passes', 'mesure']];
  bilan.sponsors.forEach(function (s) {
    lignes.push([
      s.nom,
      Math.round(s.expo * facteur),
      Math.round(s.affichages * facteur),
      Math.round(s.clics * facteur),
      s.partDeVoix,
      s.plein.ouverts, s.plein.secondes, s.plein.passes,
      facteur > 1 ? ('projection x' + facteur) : '1 appareil'
    ]);
  });
  const csv = lignes.map(function (l) {
    return l.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(';');
  }).join('\n');

  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  lien.download = 'visibilite-partenaires-' + bilan.jour + '.csv';
  lien.click();
  URL.revokeObjectURL(lien.href);
}

async function onViderBilan() {
  const ok = await dialogConfirmer('Effacer les mesures de cet appareil ?\n\n' +
    'Les compteurs de visibilité repartent de zéro. Les fiches partenaires, elles, ne bougent pas.',
    { ok: 'Effacer', danger: true });
  if (!ok) return;
  sponsorsRemettreAZero();
  afficherBilanSponsors();
}

document.addEventListener('DOMContentLoaded', initAdminSponsors);
