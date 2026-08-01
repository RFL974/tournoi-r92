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

// Le déclencheur d'impression [#bouton-imprimer] et revelerOutilsAdmin() sont désormais
// dans commun-dossier.js (partagés avec dossier-club.html).
document.addEventListener('DOMContentLoaded', initInvitation);

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

/* Les petits helpers (txt, oui, catPresente, dateLongueFr, tronquer, heurePlusMinutes,
   heureFinCommuniquee, telephoneLisible, urlAffiche, ligne, listeOuVide, section) sont
   désormais dans commun-dossier.js (partagés avec dossier/reponse). */

/* --------------------------------------------------------------------------
   CONSTRUCTION DE L'INVITATION (Phase 1)
   -------------------------------------------------------------------------- */

function construireInvitation(g, categories) {
  const cats = (categories || []).filter(catPresente)
    .slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });
  let html = '';

  // a) EN-TÊTE : affiche, nom, date, phrase d'accroche courte (PAS la description complète).
  const nom = txt(g.tournoi_nom) || 'Tournoi Génération R92';
  const accroche = txt(g.tournoi_description)
    ? tronquer(g.tournoi_description, 150)
    : 'Nous serions ravis de vous compter parmi les clubs invités de cette journée.';
  html += '<header class="d-entete">' +
    (txt(g.tournoi_affiche_id)
      ? '<img class="d-affiche" src="' + echapper(urlAffiche(g.tournoi_affiche_id, 800)) + '" alt="Affiche — ' + echapper(nom) + '">'
      : '') +
    '<div class="d-entete-textes">' +
      '<p class="d-surtitre">Invitation — École de Rugby du Racing Club de France</p>' +
      '<h1>' + echapper(nom) + '</h1>' +
      (txt(g.tournoi_date) ? '<p class="d-date">' + echapper(dateLongueFr(g.tournoi_date)) + '</p>' : '') +
      '<p class="d-presentation">' + echapper(accroche) + '</p>' +
    '</div>' +
    // Blason du club à DROITE du nom, près de la marge — « c'est l'École de Rugby qui invite »
    // (l'association fournit l'outil, l'EDR signe l'invitation). Session 24.
    '<img class="d-entete-blason" src="img/blason-racing92.svg" alt="Racing 92" onerror="this.style.display=\'none\'">' +
  '</header>';

  // b) VOUS ÊTES INVITÉS : liste complète des catégories du tournoi (identique pour tous les
  //    clubs), avec pour chacune le nombre max d'équipes par club et l'effectif minimum par équipe.
  html += section('Vous êtes invités', catsInvitees(cats), 'inv-categories');

  // c) LE JOUR J, EN BREF : RDV, fin envisagée, format des matchs (phrase simple), arbitrage.
  //    + note « pourquoi ce format » (doctrine FFR EDR) quand l'après-midi est en poules de niveau.
  html += section('Le jour J, en bref', listeOuVide([
    ligne('Accueil des équipes (RDV)', echapper(txt(g.heure_rdv))),
    ligne('Fin envisagée', echapper(heureFinCommuniquee(g))),
    ligne('Format des matchs', echapper(phraseFormat(cats))),
    ligne('Arbitrage', echapper(phraseArbitrage(cats)))
  ]) + noteFormat(cats));

  // d) SUR PLACE : pastilles seulement si cochées + tarif d'engagement si demandé.
  html += section('Sur place', blocSurPlace(g));

  // e) RÉPONSE ATTENDUE : date limite de réponse + contact référent (nom + tél et/ou email).
  html += section('Réponse attendue', blocReponse(g));

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
    const max = parseInt(txt(c.max_equipes_par_club), 10);
    const phraseMax = (isFinite(max) && max >= 1)
      ? 'Jusqu\'à ' + max + ' équipe' + (max > 1 ? 's' : '') + ' par club'
      : 'Plusieurs équipes possibles par catégorie';
    const effMin = parseInt(txt(c.effectif_min), 10);
    const details = [phraseMax];
    if (isFinite(effMin) && effMin >= 1) {
      details.push(effMin + ' joueur' + (effMin > 1 ? 's' : '') + ' minimum par équipe');
    }
    return '<li><span class="inv-cat-nom">' + echapper(txt(c.categorie)) + '</span>' +
      '<span class="inv-cat-detail">' + echapper(details.join(' · ')) + '</span></li>';
  });
  // Rappel sécurité FFR (session 20) : un club qui vient à l'effectif MINIMUM fait jouer chaque
  // enfant la quasi-totalité du temps de jeu de l'équipe — or la FFR plafonne le temps de jeu par
  // joueur et par jour (règle de sécurité). Affiché dès qu'au moins une catégorie a un effectif
  // minimum ; invite à venir avec une feuille de match complète pour faire tourner.
  const aEffectifMin = cats.some(function (c) {
    const n = parseInt(txt(c.effectif_min), 10);
    return isFinite(n) && n >= 1;
  });
  const rappel = aEffectifMin
    ? '<p class="inv-rappel-effectif">⚠️ <strong>Rappel sécurité FFR</strong> — venir à l\'effectif ' +
      'minimum signifie que chaque enfant joue la quasi-totalité du temps de jeu de l\'équipe, or la ' +
      'FFR plafonne le temps de jeu par joueur et par jour. Prévoyez une feuille de match complète ' +
      'pour faire tourner les enfants.</p>'
    : '';
  return '<ul class="inv-liste-cats">' + lignes.join('') + '</ul>' + rappel;
}

/** Vrai si au moins une catégorie joue l'après-midi en « poules de niveau ». */
function aPoulesNiveau(cats) {
  return cats.some(function (c) {
    return String(txt(c.format_apresmidi)).toUpperCase() === 'POULES_NIVEAU';
  });
}

/** c) Format des matchs en UNE phrase factuelle simple (pas de détail technique). */
function phraseFormat(cats) {
  if (!cats.length) return '';
  if (aPoulesNiveau(cats)) {
    return 'Poules de brassage le matin, puis poules de niveau l\'après-midi : chaque équipe '
      + 'rejoue contre des équipes de sa force, en mini-championnat complet.';
  }
  return 'Des matchs courts en poules le matin, puis une phase l\'après-midi '
    + '(temps de jeu adapté à chaque catégorie).';
}

/** c) Note « pourquoi ce format » (sous la liste) : la doctrine FFR École de Rugby, expliquée aux
 *  clubs invités. Affichée seulement quand une catégorie joue en poules de niveau — décisions
 *  Romain (session 20) : dire le POURQUOI du format et rappeler la doctrine, y compris le choix
 *  « en cas d'effectif impair, l'équipe supplémentaire va en poule basse ». */
function noteFormat(cats) {
  if (!aPoulesNiveau(cats)) return '';
  return '<p class="inv-note-format">💡 <strong>Pourquoi ce format ?</strong> Il suit la doctrine ' +
    'FFR de l\'École de Rugby : un maximum de temps de jeu pour chaque enfant, des matchs ' +
    'équilibrés entre équipes de même niveau, et aucune phase finale à élimination (interdites en ' +
    'tournoi EDR) — c\'est le classement final qui départage. En cas d\'effectif impair, l\'équipe ' +
    'supplémentaire rejoint la poule basse : les enfants qui ont le plus besoin de jouer jouent plus.</p>';
}

/** c) Modalités d'arbitrage en UNE ligne : valeurs distinctes renseignées par catégorie. */
function phraseArbitrage(cats) {
  const vus = [];
  cats.forEach(function (c) {
    const v = txt(c.arbitrage_organisation);
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
  if (oui(g.buvette_disponible)) pastilles.push('🥤 Buvette');
  if (oui(g.espace_sandwich_disponible)) pastilles.push('🥪 Espace sandwich');
  if (oui(g.boutique_r92_disponible)) pastilles.push('🛍️ Boutique R92');

  let html = '';
  if (pastilles.length) {
    html += '<div class="inv-pastilles">' + pastilles.map(function (p) {
      return '<span class="inv-pastille">' + echapper(p) + '</span>';
    }).join('') + '</div>';
  }

  // Tarif d'engagement : seulement si un tarif est demandé (sinon rien).
  if (oui(g.tarif_engagement_oui) && txt(g.tarif_engagement_montant)) {
    html += '<ul class="d-liste"><li><span class="d-libelle">Tarif d\'engagement</span>' +
      '<span class="d-valeur">' + echapper(txt(g.tarif_engagement_montant)) + '</span></li></ul>';
  }
  return html;
}

/** e) « Réponse attendue » : date limite de réponse + contact référent (nom + email).
 *  Le TÉLÉPHONE n'est volontairement PAS affiché : cette page vitrine est publique et mise en
 *  avant ; le portable d'un bénévole n'y figure pas (décision S3). La vue `invitation` du backend
 *  ne renvoie d'ailleurs plus `contact_reponse_tel`. Le numéro du jour J reste dans le dossier
 *  club, derrière le jeton. */
function blocReponse(g) {
  const contact = [];
  if (txt(g.contact_reponse_nom)) contact.push('<strong>' + echapper(txt(g.contact_reponse_nom)) + '</strong>');
  if (txt(g.contact_reponse_email)) {
    contact.push('<a href="mailto:' + echapper(txt(g.contact_reponse_email)) + '">'
      + echapper(txt(g.contact_reponse_email)) + '</a>');
  }
  return listeOuVide([
    ligne('Réponse souhaitée avant le',
      txt(g.date_limite_reponse) ? echapper(dateLongueFr(g.date_limite_reponse)) : ''),
    ligne('Votre contact', contact.length ? contact.join(' · ') : '')
  ]);
}

/** f) Pied de page : logo + lien Instagram + lien site de l'association. */
function piedInvitation(g) {
  const liens = [];
  if (txt(g.url_instagram)) {
    liens.push('<a class="inv-lien" href="' + echapper(txt(g.url_instagram)) + '" target="_blank" rel="noopener">📣 Instagram</a>');
  }
  if (txt(g.url_site_association)) {
    liens.push('<a class="inv-lien" href="' + echapper(txt(g.url_site_association)) + '" target="_blank" rel="noopener">🌐 Site de l\'association</a>');
  }
  return '<footer class="d-pied inv-pied">' +
    '<img class="d-pied-logo" src="img/blason-racing92.svg" alt="" onerror="this.style.display=\'none\'">' +
    '<span class="inv-pied-nom">École de Rugby du Racing Club de France</span>' +
    (liens.length ? '<span class="inv-pied-liens">' + liens.join('') + '</span>' : '') +
  '</footer>';
}
