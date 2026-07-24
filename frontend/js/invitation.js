/**
 * ============================================================================
 *  INVITATION CLUB (Phase 1) — invitation légère envoyée AVANT la réponse du club
 * ============================================================================
 *  Construit une page A4 (1 page) à partir des données du tournoi (Config Zone A +
 *  Zone B), via le MÊME backend que les autres pages (apiGet). Page GÉNÉRIQUE : même
 *  contenu pour tous les clubs invités — aucune personnalisation à ce stade (la
 *  personnalisation par club et le dossier complet sont réservés à la Phase 2).
 *
 *  Règle d'or (identique au dossier Phase 2) : toute section dont TOUS les champs sont
 *  vides est masquée entièrement (titre compris). Jamais de « non communiqué ».
 *
 *  Pas de bandeau d'actions (ICS / Maps / QR / autorisation) : réservé à la Phase 2.
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', initInvitation);
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'bouton-imprimer') window.print();
});

/** Révèle les éléments réservés à l'admin (lien « Retour à l'administration », titre)
 *  UNIQUEMENT si la page est ouverte depuis l'administration (?admin=1). Sans ce
 *  paramètre — cas des liens reçus par email par les clubs — ils restent masqués. */
function revelerOutilsAdmin() {
  try {
    if (new URLSearchParams(window.location.search).get('admin') === '1') {
      document.querySelectorAll('.admin-seul').forEach(function (el) { el.hidden = false; });
    }
  } catch (e) { /* environnement sans URLSearchParams : on laisse masqué */ }
}

async function initInvitation() {
  const zone = document.getElementById('invitation');
  revelerOutilsAdmin();
  try {
    const config = await apiGet('getConfig'); // { global, categories }
    zone.innerHTML = construireInvitation((config && config.global) || {}, (config && config.categories) || []);
  } catch (erreur) {
    zone.innerHTML = '<div class="message-chargement erreur">Impossible de charger les données du tournoi.<br>'
      + 'Détail : ' + echapper(erreur.message) + '</div>';
  }
}

/* --------------------------------------------------------------------------
   PETITS HELPERS (copies autonomes : cette page ne charge pas dossier.js)
   -------------------------------------------------------------------------- */

/** Valeur texte propre ('' si vide/null). */
function txtI(v) { return (v == null) ? '' : String(v).trim(); }

/** Vrai si un paramètre 'oui'/'non' de Config vaut 'oui'. */
function ouiI(v) { return String(v || '').toLowerCase() === 'oui'; }

/** Vraie si la catégorie est présente sur cette édition. */
function catPresenteI(cat) { return String(cat && cat.presente).toLowerCase() === 'oui'; }

/** Date « mercredi 11 novembre 2026 ». */
function dateLongueFrI(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return txtI(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Tronque au dernier mot entier avant `max` caractères. */
function tronquerI(texte, max) {
  const t = txtI(texte);
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : max).trim() + '…';
}

/** Ajoute `minutes` à une heure « HH:MM » (bornée à 23:59). '' si l'heure est illisible. */
function heurePlusMinutesI(hhmm, minutes) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(txtI(hhmm));
  if (!m) return '';
  const total = Math.min(23 * 60 + 59, parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + minutes);
  return ('0' + Math.floor(total / 60)).slice(-2) + ':' + ('0' + (total % 60)).slice(-2);
}

/** Heure de fin ANNONCÉE aux clubs (manuelle si saisie, sinon fin du dernier match + marge). */
const MARGE_FIN_DEFAUT_MIN_I = 75;
function heureFinCommuniqueeI(g) {
  const manuelle = txtI(g.heure_fin_communiquee);
  if (manuelle) return manuelle;
  const marge = parseInt(txtI(g.marge_fin_communiquee_min), 10);
  return heurePlusMinutesI(g.heure_fin, (isFinite(marge) && marge >= 0) ? marge : MARGE_FIN_DEFAUT_MIN_I);
}

/** « 0612345678 » → « 06 12 34 56 78 » (affichage). */
function telephoneLisibleI(v) {
  const c = txtI(v).replace(/\D/g, '');
  return /^\d{10}$/.test(c) ? c.replace(/(\d{2})(?=\d)/g, '$1 ').trim() : txtI(v);
}

/** URL d'affichage de l'affiche Drive (même CDN lh3 que les autres pages). */
function urlAfficheI(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 800);
}

/** Une ligne « libellé : valeur » — '' si la valeur est vide (ligne masquée). */
function ligneI(libelle, valeurHtml) {
  if (!valeurHtml) return '';
  return '<li><span class="d-libelle">' + libelle + '</span><span class="d-valeur">' + valeurHtml + '</span></li>';
}

/** Assemble des lignes en liste — '' si TOUTES sont vides (la section sera masquée). */
function listeOuVideI(lignes) {
  const contenu = lignes.join('');
  return contenu ? '<ul class="d-liste">' + contenu + '</ul>' : '';
}

/** Une section complète — '' si elle n'a aucun contenu (titre masqué avec). */
function sectionI(titre, contenuHtml, classe) {
  if (!contenuHtml) return '';
  return '<section class="d-section' + (classe ? ' ' + classe : '') + '">' +
           '<h2>' + titre + '</h2>' + contenuHtml +
         '</section>';
}

/* --------------------------------------------------------------------------
   CONSTRUCTION DE L'INVITATION (Phase 1)
   -------------------------------------------------------------------------- */

function construireInvitation(g, categories) {
  const cats = (categories || []).filter(catPresenteI)
    .slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });
  let html = '';

  // a) EN-TÊTE : affiche, nom, date, phrase d'accroche courte (PAS la description complète).
  const nom = txtI(g.tournoi_nom) || 'Tournoi Génération R92';
  const accroche = txtI(g.tournoi_description)
    ? tronquerI(g.tournoi_description, 150)
    : 'Nous serions ravis de vous compter parmi les clubs invités de cette journée.';
  html += '<header class="d-entete">' +
    (txtI(g.tournoi_affiche_id)
      ? '<img class="d-affiche" src="' + echapper(urlAfficheI(g.tournoi_affiche_id, 800)) + '" alt="Affiche — ' + echapper(nom) + '">'
      : '') +
    '<div class="d-entete-textes">' +
      '<p class="d-surtitre">Invitation — Génération R92</p>' +
      '<h1>' + echapper(nom) + '</h1>' +
      (txtI(g.tournoi_date) ? '<p class="d-date">' + echapper(dateLongueFrI(g.tournoi_date)) + '</p>' : '') +
      '<p class="d-presentation">' + echapper(accroche) + '</p>' +
    '</div>' +
  '</header>';

  // b) VOUS ÊTES INVITÉS : liste complète des catégories du tournoi (identique pour tous les
  //    clubs), avec pour chacune le nombre max d'équipes par club et l'effectif minimum par équipe.
  html += sectionI('Vous êtes invités', catsInvitees(cats), 'inv-categories');

  // c) LE JOUR J, EN BREF : RDV, fin envisagée, format des matchs (phrase simple), arbitrage.
  html += sectionI('Le jour J, en bref', listeOuVideI([
    ligneI('Accueil des équipes (RDV)', echapper(txtI(g.heure_rdv))),
    ligneI('Fin envisagée', echapper(heureFinCommuniqueeI(g))),
    ligneI('Format des matchs', echapper(phraseFormat(cats))),
    ligneI('Arbitrage', echapper(phraseArbitrage(cats)))
  ]));

  // d) SUR PLACE : pastilles seulement si cochées + tarif d'engagement si demandé.
  html += sectionI('Sur place', blocSurPlace(g));

  // e) RÉPONSE ATTENDUE : date limite de réponse + contact référent (nom + tél et/ou email).
  html += sectionI('Réponse attendue', blocReponse(g));

  // f) PIED DE PAGE : logo + liens de l'association (Instagram, site).
  html += piedInvitation(g);

  return html;
}

/**
 * b) « Vous êtes invités » : une ligne par catégorie présente.
 *  - max_equipes_par_club renseigné → « Jusqu'à X équipes par club » ;
 *    vide → « Plusieurs équipes possibles par catégorie » (jamais « illimité » ni « 0 »).
 *  - effectif_min renseigné → « X joueurs minimum par équipe ».
 */
function catsInvitees(cats) {
  if (!cats.length) return '';
  const lignes = cats.map(function (c) {
    const max = parseInt(txtI(c.max_equipes_par_club), 10);
    const phraseMax = (isFinite(max) && max >= 1)
      ? 'Jusqu\'à ' + max + ' équipe' + (max > 1 ? 's' : '') + ' par club'
      : 'Plusieurs équipes possibles par catégorie';
    const effMin = parseInt(txtI(c.effectif_min), 10);
    const details = [phraseMax];
    if (isFinite(effMin) && effMin >= 1) {
      details.push(effMin + ' joueur' + (effMin > 1 ? 's' : '') + ' minimum par équipe');
    }
    return '<li><span class="inv-cat-nom">' + echapper(txtI(c.categorie)) + '</span>' +
      '<span class="inv-cat-detail">' + echapper(details.join(' · ')) + '</span></li>';
  });
  return '<ul class="inv-liste-cats">' + lignes.join('') + '</ul>';
}

/** c) Format des matchs en UNE phrase factuelle simple (pas de détail technique). */
function phraseFormat(cats) {
  if (!cats.length) return '';
  return 'Des matchs courts en poules le matin, puis une phase l\'après-midi '
    + '(temps de jeu adapté à chaque catégorie).';
}

/** c) Modalités d'arbitrage en UNE ligne : valeurs distinctes renseignées par catégorie. */
function phraseArbitrage(cats) {
  const vus = [];
  cats.forEach(function (c) {
    const v = txtI(c.arbitrage_organisation);
    if (v && vus.indexOf(v) === -1) vus.push(v);
  });
  return vus.join(' · ');
}

/**
 * d) « Sur place » : pastilles affichées UNIQUEMENT si cochées (aucune ligne « non
 *    disponible » si décoché) + tarif d'engagement si un tarif est demandé.
 */
function blocSurPlace(g) {
  const pastilles = [];
  if (ouiI(g.buvette_disponible)) pastilles.push('🥤 Buvette');
  if (ouiI(g.espace_sandwich_disponible)) pastilles.push('🥪 Espace sandwich');
  if (ouiI(g.boutique_r92_disponible)) pastilles.push('🛍️ Boutique R92');

  let html = '';
  if (pastilles.length) {
    html += '<div class="inv-pastilles">' + pastilles.map(function (p) {
      return '<span class="inv-pastille">' + echapper(p) + '</span>';
    }).join('') + '</div>';
  }

  // Tarif d'engagement : seulement si un tarif est demandé (sinon rien).
  if (ouiI(g.tarif_engagement_oui) && txtI(g.tarif_engagement_montant)) {
    html += '<ul class="d-liste"><li><span class="d-libelle">Tarif d\'engagement</span>' +
      '<span class="d-valeur">' + echapper(txtI(g.tarif_engagement_montant)) + '</span></li></ul>';
  }
  return html;
}

/** e) « Réponse attendue » : date limite de réponse + contact référent (tél et/ou email). */
function blocReponse(g) {
  const contact = [];
  if (txtI(g.contact_reponse_nom)) contact.push('<strong>' + echapper(txtI(g.contact_reponse_nom)) + '</strong>');
  if (txtI(g.contact_reponse_tel)) {
    contact.push('<a href="tel:' + echapper(txtI(g.contact_reponse_tel)) + '">'
      + echapper(telephoneLisibleI(g.contact_reponse_tel)) + '</a>');
  }
  if (txtI(g.contact_reponse_email)) {
    contact.push('<a href="mailto:' + echapper(txtI(g.contact_reponse_email)) + '">'
      + echapper(txtI(g.contact_reponse_email)) + '</a>');
  }
  return listeOuVideI([
    ligneI('Réponse souhaitée avant le',
      txtI(g.date_limite_reponse) ? echapper(dateLongueFrI(g.date_limite_reponse)) : ''),
    ligneI('Votre contact', contact.length ? contact.join(' · ') : '')
  ]);
}

/** f) Pied de page : logo + lien Instagram + lien site de l'association. */
function piedInvitation(g) {
  const liens = [];
  if (txtI(g.url_instagram)) {
    liens.push('<a class="inv-lien" href="' + echapper(txtI(g.url_instagram)) + '" target="_blank" rel="noopener">📣 Instagram</a>');
  }
  if (txtI(g.url_site_association)) {
    liens.push('<a class="inv-lien" href="' + echapper(txtI(g.url_site_association)) + '" target="_blank" rel="noopener">🌐 Site de l\'association</a>');
  }
  return '<footer class="d-pied inv-pied">' +
    '<img class="d-pied-logo" src="img/logo-r92.png" alt="" onerror="this.style.display=\'none\'">' +
    '<span class="inv-pied-nom">Génération R92 <span class="d-pied-mention">· École de rugby du Racing 92</span></span>' +
    (liens.length ? '<span class="inv-pied-liens">' + liens.join('') + '</span>' : '') +
  '</footer>';
}
