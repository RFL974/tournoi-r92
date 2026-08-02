/**
 * ============================================================================
 *  INVITATION CLUB (Phase 1) — invitation légère envoyée AVANT la réponse du club
 * ============================================================================
 *  Construit une page « document » à partir des données du tournoi (Config Zone A +
 *  Zone B), via le MÊME backend que les autres pages (apiGet). Page GÉNÉRIQUE : même
 *  contenu pour tous les clubs invités — aucune personnalisation à ce stade (la
 *  personnalisation par club et le dossier complet sont réservés à la Phase 2).
 *
 *  REFONTE VITRINE : l'invitation est le premier contact des clubs avec le tournoi.
 *  Elle se lit de haut en bas comme un carton d'invitation :
 *    1. blason du club en grand, centré — c'est l'École de Rugby qui invite ;
 *    2. l'affiche du tournoi en héros ;
 *    3. le descriptif complet ;
 *    4. la journée en un coup d'œil (frise horaire) ;
 *    5. UNE CARTE PAR CATÉGORIE : forme de jeu FFR, temps de jeu, pauses,
 *       récupération, effectifs, équipes par club, arbitrage, règlement,
 *       format d'après-midi expliqué — plus les repères FFR (sécurité, doctrine) ;
 *    6. sur place, réponse attendue, pied de page.
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

/* Les petits helpers (txt, oui, catPresente, dateLongueFr, heurePlusMinutes,
   heureFinCommuniquee, urlAffiche, ligne, listeOuVide, section) et les résumés
   sportifs (resumeMiTemps, resumeEffectif, resumeReglement, resumeApresMidi,
   tempsDeJeuDe, cleFormatApresMidi, DOSSIER_FORMATS…) sont dans commun-dossier.js
   (partagés avec dossier.js) ; ctxScf est dans commun.js. */

/* --------------------------------------------------------------------------
   CONSTRUCTION DE L'INVITATION (Phase 1)
   -------------------------------------------------------------------------- */

function construireInvitation(g, categories) {
  const cats = (categories || []).filter(catPresente)
    .slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });
  let html = '';

  // 1-3) EN-TÊTE VITRINE : blason centré en grand, titre, date · lieu, affiche en héros,
  //      puis le descriptif COMPLET du tournoi (plus de troncature : c'est la vitrine).
  html += enteteInvitation(g);

  // 4) LA JOURNÉE EN UN COUP D'ŒIL : frise horaire (accueil → coup d'envoi → pause
  //    méridienne → reprise → fin envisagée). Chaque étape sans heure est omise.
  html += section('La journée en un coup d\'œil', friseJournee(g, cats), 'inv-journee');

  // 5) VOUS ÊTES INVITÉS : une carte détaillée par catégorie (cadre sportif complet)
  //    + les repères FFR (rappel sécurité effectif minimum, doctrine du format).
  html += section('Vous êtes invités', cartesCategories(cats), 'inv-categories');

  // 6) SUR PLACE : pastilles seulement si cochées + tarif d'engagement si demandé.
  html += section('Sur place', blocSurPlace(g));

  // 7) VOTRE RÉPONSE : encart mis en avant — date limite + contact référent.
  html += section('Votre réponse', blocReponse(g), 'inv-reponse');

  // 8) PIED DE PAGE : logo + liens de l'association (Instagram, site).
  html += piedInvitation(g);

  return html;
}

/* --------------------------------------------------------------------------
   1-3) EN-TÊTE VITRINE (blason · titre · affiche · descriptif)
   -------------------------------------------------------------------------- */

function enteteInvitation(g) {
  const nom = txt(g.tournoi_nom) || 'Tournoi Génération R92';

  // Date · lieu sur une même ligne (chaque morceau est omis s'il manque).
  const quand = [];
  if (txt(g.tournoi_date)) quand.push('<span class="inv-quand-date">' + echapper(dateLongueFr(g.tournoi_date)) + '</span>');
  if (txt(g.tournoi_lieu)) quand.push('<span>' + echapper(txt(g.tournoi_lieu)) + '</span>');

  let html = '<header class="inv-hero">' +
    // Blason du club centré, en GRAND : c'est l'École de Rugby qui invite (session 24).
    '<img class="inv-blason" src="img/blason-racing92.svg" alt="Racing 92" onerror="this.style.display=\'none\'">' +
    '<p class="inv-surtitre">L\'École de Rugby du Racing Club de France<br>a le plaisir de vous inviter</p>' +
    '<h1 class="inv-titre">' + echapper(nom) + '</h1>' +
    (quand.length ? '<p class="inv-quand">' + quand.join('<span class="inv-quand-sep"> · </span>') + '</p>' : '') +
  '</header>';

  // L'affiche du tournoi en héros, centrée et en grand.
  if (txt(g.tournoi_affiche_id)) {
    html += '<figure class="inv-affiche">' +
      '<img src="' + echapper(urlAffiche(g.tournoi_affiche_id, 1200)) + '" alt="Affiche — ' + echapper(nom) + '">' +
    '</figure>';
  }

  // Le descriptif COMPLET (un paragraphe par ligne saisie). S'il est vide : phrase d'accueil.
  const description = txt(g.tournoi_description);
  const paragraphes = description
    ? description.split(/\n+/).map(function (p) { return p.trim(); }).filter(Boolean)
    : ['Nous serions ravis de vous compter parmi les clubs invités de cette journée.'];
  html += '<div class="inv-presentation">' + paragraphes.map(function (p) {
    return '<p>' + echapper(p) + '</p>';
  }).join('') + '</div>';

  return html;
}

/* --------------------------------------------------------------------------
   4) FRISE HORAIRE DE LA JOURNÉE
   -------------------------------------------------------------------------- */

/**
 * Les 5 étapes de la journée, chacune UNIQUEMENT si son heure est connue :
 * accueil (heure_rdv), coup d'envoi (heure_debut), pause méridienne
 * (pause_dejeuner_debut + durée), reprise (début + durée de la pause, simple
 * arithmétique sur des données réelles), fin envisagée (heureFinCommuniquee :
 * manuelle, sinon fin du dernier match + marge trophées).
 *
 * Les NOTES « matin : poules » / « après-midi : selon la catégorie » ne valent
 * que pour les tournois ordinaires : un tournoi 100 % Super Challenge suit la
 * formule de son règlement (triangulaires, pas de phase d'après-midi) — ses
 * notes sont donc omises, seules restent les heures (des données réelles).
 */
function friseJournee(g, cats) {
  const tousScf = !!(cats && cats.length) && cats.every(function (c) { return ctxScf(c).estScf; });
  const etapes = [];
  if (txt(g.heure_rdv)) {
    etapes.push({ h: txt(g.heure_rdv), t: 'Accueil des équipes', n: '' });
  }
  if (txt(g.heure_debut)) {
    etapes.push({ h: txt(g.heure_debut), t: 'Coup d\'envoi', n: tousScf ? '' : 'Matin : matchs de poules' });
  }
  const pauseDebut = txt(g.pause_dejeuner_debut);
  const pauseDuree = parseInt(txt(g.pause_dejeuner_duree_min), 10);
  if (pauseDebut) {
    etapes.push({ h: pauseDebut, t: 'Pause méridienne',
      n: (isFinite(pauseDuree) && pauseDuree > 0) ? pauseDuree + ' min' : '' });
    const reprise = (isFinite(pauseDuree) && pauseDuree > 0) ? heurePlusMinutes(pauseDebut, pauseDuree) : '';
    if (reprise) {
      etapes.push({ h: reprise, t: 'Reprise', n: tousScf ? '' : 'Après-midi : selon la catégorie' });
    }
  }
  const fin = heureFinCommuniquee(g);
  if (fin) {
    etapes.push({ h: fin, t: 'Fin envisagée', n: '' });
  }
  if (!etapes.length) return '';

  return '<ol class="inv-frise">' + etapes.map(function (e) {
    return '<li>' +
      '<span class="inv-frise-heure">' + echapper(e.h) + '</span>' +
      '<span class="inv-frise-titre">' + echapper(e.t) + '</span>' +
      (e.n ? '<span class="inv-frise-note">' + echapper(e.n) + '</span>' : '') +
    '</li>';
  }).join('') + '</ol>';
}

/* --------------------------------------------------------------------------
   5) LES CATÉGORIES INVITÉES — une carte détaillée par catégorie
   -------------------------------------------------------------------------- */

function cartesCategories(cats) {
  if (!cats.length) return '';

  // Phrase d'introduction : le déroulé commun (matin en poules round-robin — même règle que
  // le dossier Phase 2). Le Super Challenge de France fait EXCEPTION (triangulaires /
  // quadrangulaires où chaque équipe ne joue que 2 matchs) : on ne lui applique pas la
  // phrase générale, sa carte porte sa formule.
  const nonScf = cats.filter(function (c) { return !ctxScf(c).estScf; });
  const aScf = nonScf.length < cats.length;
  let intro = '';
  if (nonScf.length) {
    intro = 'Le matin, les catégories jouent en poules : chaque équipe rencontre toutes celles ' +
      'de sa poule. L\'après-midi suit le format propre à chaque catégorie, détaillé ci-dessous.';
    if (aScf) intro += ' Le Super Challenge de France (U14) suit la formule de son règlement, ' +
      'détaillée sur sa carte.';
  } else {
    intro = 'Le Super Challenge de France suit la formule de son règlement, détaillée ci-dessous.';
  }
  let html = '<p class="inv-cats-intro">' + intro + '</p>';

  html += '<div class="inv-cartes">' + cats.map(carteCategorie).join('') + '</div>';

  // Repères FFR sous les cartes : rappel sécurité (effectif minimum) + doctrine du format
  // (poules de niveau) — mêmes conditions d'affichage qu'avant la refonte (décisions S20).
  html += rappelEffectifFFR(cats);
  html += noteFormat(cats);
  return html;
}

/** UNE carte : bandeau navy (catégorie + forme de jeu), faits sportifs, format d'après-midi. */
function carteCategorie(c) {
  const scf = ctxScf(c); // Super Challenge de France (U14) : vocabulaire et temps dédiés

  // Badge du bandeau : contexte SCF prioritaire, sinon la forme de jeu FFR retenue.
  const badge = scf.estScf ? 'Super Challenge de France' : txt(c.forme_jeu);

  // Faits sportifs (chaque ligne sans valeur est omise).
  const lignes = [];
  if (scf.estScf) {
    // SCF : temps de match imposés par le règlement (P2 = 2×15 ; P3 = 2×11, miroir de
    // dureeMatchScf côté backend) ; la formule remplace le format d'après-midi.
    const periode = (scf.phase === 'P3') ? 11 : 15;
    lignes.push(ligneCarte('Forme de jeu', 'Jeu à XV (15 contre 15)'));
    lignes.push(ligneCarte('Temps de jeu', resumeMiTemps({ format_mi_temps: '2',
      duree_mi_temps_min: String(periode), pause_mi_temps_min: c.pause_mi_temps_min })));
    lignes.push(ligneCarte('Formule', (scf.phase === 'P3')
      ? 'Samedi : triangulaires · Dimanche : brassage par niveau'
      : 'Plateau en triangulaires / quadrangulaires'));
  } else {
    if (txt(c.forme_jeu)) lignes.push(ligneCarte('Forme de jeu', txt(c.forme_jeu)));
    const miTemps = resumeMiTemps(c);
    if (miTemps) {
      const jeu = tempsDeJeuDe(c);
      lignes.push(ligneCarte('Temps de jeu', miTemps + (jeu ? ' — ' + jeu + ' min par match' : '')));
    }
  }
  const recup = txt(c.recup_entre_matchs_min);
  if (recup) lignes.push(ligneCarte('Récupération', recup + ' min minimum entre deux matchs'));
  const effectif = resumeEffectif(c);
  if (effectif) lignes.push(ligneCarte('Effectif', effectif + ' par équipe'));
  lignes.push(ligneCarte('Équipes par club', phraseMaxEquipes(c)));
  if (txt(c.arbitrage_organisation)) lignes.push(ligneCarte('Arbitrage', txt(c.arbitrage_organisation)));
  const reglement = resumeReglement(c); // déjà échappé / lien sûr (commun-dossier.js)
  if (reglement) lignes.push(ligneCarteHtml('Règlement', reglement));

  // Format d'après-midi expliqué (libellé + description concise) — pas pour le SCF,
  // dont les catégories n'ont pas de phase d'après-midi (la formule dit tout).
  let apresMidi = '';
  if (!scf.estScf) {
    const cle = cleFormatApresMidi(c);
    apresMidi = '<p class="inv-carte-apm"><strong>Après-midi — ' + echapper(DOSSIER_FORMATS[cle]) +
      '</strong> : ' + echapper(DOSSIER_FORMATS_DESC[cle]) + '</p>';
  }

  return '<article class="inv-carte">' +
    '<div class="inv-carte-tete">' +
      '<span class="inv-carte-cat">' + echapper(txt(c.categorie)) + '</span>' +
      (badge ? '<span class="inv-carte-forme">' + echapper(badge) + '</span>' : '') +
    '</div>' +
    '<ul class="inv-carte-infos">' + lignes.join('') + '</ul>' +
    apresMidi +
  '</article>';
}

/** Une ligne « libellé / valeur » de carte ('' si valeur vide) — la valeur est échappée ici. */
function ligneCarte(libelle, valeur) {
  return valeur ? ligneCarteHtml(libelle, echapper(valeur)) : '';
}

/** Variante pour une valeur DÉJÀ en HTML sûr (lien règlement). */
function ligneCarteHtml(libelle, valeurHtml) {
  if (!valeurHtml) return '';
  return '<li><span class="inv-carte-libelle">' + libelle + '</span>' +
    '<span class="inv-carte-valeur">' + valeurHtml + '</span></li>';
}

/**
 * Équipes par club : max_equipes_par_club renseigné → « Jusqu'à X équipe(s) » ;
 * vide → « Plusieurs équipes possibles » (jamais « illimité » ni « 0 »).
 */
function phraseMaxEquipes(c) {
  const max = parseInt(txt(c.max_equipes_par_club), 10);
  return (isFinite(max) && max >= 1)
    ? 'Jusqu\'à ' + max + ' équipe' + (max > 1 ? 's' : '')
    : 'Plusieurs équipes possibles';
}

/**
 * Rappel sécurité FFR (session 20) : un club qui vient à l'effectif MINIMUM fait jouer chaque
 * enfant la quasi-totalité du temps de jeu de l'équipe — or la FFR plafonne le temps de jeu par
 * joueur et par jour (règle de sécurité). Affiché dès qu'au moins une catégorie a un effectif
 * minimum ; invite à venir avec une feuille de match complète pour faire tourner.
 */
function rappelEffectifFFR(cats) {
  const aEffectifMin = cats.some(function (c) {
    const n = parseInt(txt(c.effectif_min), 10);
    return isFinite(n) && n >= 1;
  });
  if (!aEffectifMin) return '';
  return '<p class="inv-rappel-effectif">⚠️ <strong>Rappel sécurité FFR</strong> — venir à l\'effectif ' +
    'minimum signifie que chaque enfant joue la quasi-totalité du temps de jeu de l\'équipe, or la ' +
    'FFR plafonne le temps de jeu par joueur et par jour. Prévoyez une feuille de match complète ' +
    'pour faire tourner les enfants.</p>';
}

/** Vrai si au moins une catégorie joue l'après-midi en « poules de niveau ». */
function aPoulesNiveau(cats) {
  return cats.some(function (c) {
    return String(txt(c.format_apresmidi)).toUpperCase() === 'POULES_NIVEAU';
  });
}

/** Note « pourquoi ce format » : la doctrine FFR École de Rugby, expliquée aux clubs invités.
 *  Affichée seulement quand une catégorie joue en poules de niveau — décisions Romain
 *  (session 20) : dire le POURQUOI du format et rappeler la doctrine, y compris le choix
 *  « en cas d'effectif impair, l'équipe supplémentaire va en poule basse ». */
function noteFormat(cats) {
  if (!aPoulesNiveau(cats)) return '';
  return '<p class="inv-note-format">💡 <strong>Pourquoi ce format ?</strong> Il suit la doctrine ' +
    'FFR de l\'École de Rugby : un maximum de temps de jeu pour chaque enfant, des matchs ' +
    'équilibrés entre équipes de même niveau, et aucune phase finale à élimination (interdites en ' +
    'tournoi EDR) — c\'est le classement final qui départage. En cas d\'effectif impair, l\'équipe ' +
    'supplémentaire rejoint la poule basse : les enfants qui ont le plus besoin de jouer jouent plus.</p>';
}

/* --------------------------------------------------------------------------
   6-8) SUR PLACE · RÉPONSE · PIED DE PAGE
   -------------------------------------------------------------------------- */

/**
 * « Sur place » : pastilles affichées UNIQUEMENT si cochées (aucune ligne « non
 * disponible » si décoché) + tarif d'engagement si un tarif est demandé.
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

/**
 * Lien de réponse PERSONNEL du club, si la page a été ouverte depuis l'email d'invitation
 * (lien {{LIEN_INVITATION}} : invitation-club.html?club=…&token=…). On ne fait que RELAYER
 * ces paramètres vers reponse-invitation.html — la validation du jeton reste côté backend.
 * '' pour un visiteur anonyme (la page reste générique).
 */
function lienReponsePersonnel(g) {
  try {
    const params = new URLSearchParams(window.location.search);
    const club = txt(params.get('club'));
    const token = txt(params.get('token'));
    if (!club || !token) return '';
    const url = new URL('reponse-invitation.html', window.location.href);
    if (txt(g.tournoi_nom)) url.searchParams.set('tournoi', txt(g.tournoi_nom));
    url.searchParams.set('club', club);
    url.searchParams.set('token', token);
    return url.toString();
  } catch (e) { return ''; }
}

/** « Votre réponse » : encart mis en avant — date limite en grand + contact référent.
 *  Ouvert depuis l'email (club reconnu) → VRAI bouton « Répondre à l'invitation » ;
 *  visiteur anonyme → mention du lien personnel reçu par email (le bouton de réponse
 *  vit dans l'email de chaque club, avec son jeton).
 *  Le TÉLÉPHONE n'est volontairement PAS affiché : cette page vitrine est publique et mise en
 *  avant ; le portable d'un bénévole n'y figure pas (décision S3). La vue `invitation` du backend
 *  ne renvoie d'ailleurs plus `contact_reponse_tel`. Le numéro du jour J reste dans le dossier
 *  club, derrière le jeton. */
function blocReponse(g) {
  const dateLimite = txt(g.date_limite_reponse) ? dateLongueFr(g.date_limite_reponse) : '';
  const lienReponse = lienReponsePersonnel(g);
  const contact = [];
  if (txt(g.contact_reponse_nom)) contact.push('<strong>' + echapper(txt(g.contact_reponse_nom)) + '</strong>');
  if (txt(g.contact_reponse_email)) {
    contact.push('<a href="mailto:' + echapper(txt(g.contact_reponse_email)) + '">'
      + echapper(txt(g.contact_reponse_email)) + '</a>');
  }
  if (!dateLimite && !contact.length && !lienReponse) return '';

  const action = lienReponse
    ? '<p class="inv-cta-action"><a class="inv-cta-bouton" href="' + echapper(lienReponse) + '">✅ Répondre à l\'invitation</a></p>' +
      '<p class="inv-cta-note">Quelques clics suffisent : présence, équipes engagées, ' +
      'joueurs et éducateurs par équipe.</p>'
    : '<p class="inv-cta-note">Répondez en quelques clics depuis votre lien personnel, reçu par email ' +
      'avec cette invitation : équipes engagées, joueurs et éducateurs par équipe.</p>';

  return '<div class="inv-cta">' +
    '<p class="inv-cta-titre">Merci de confirmer votre participation</p>' +
    (dateLimite ? '<p class="inv-cta-date">avant le <strong>' + echapper(dateLimite) + '</strong></p>' : '') +
    action +
    (contact.length ? '<p class="inv-cta-contact">' + contact.join('<span class="inv-cta-sep"> · </span>') + '</p>' : '') +
  '</div>';
}

/** Un lien externe du pied de page — '' si l'URL n'est pas en http(s) : un schéma exotique
 *  (javascript:, data:…) glissé dans Config ne devient JAMAIS un lien cliquable (même règle
 *  que resumeReglement). */
function lienExterneSur(url, libelle) {
  const u = txt(url);
  if (!/^https?:\/\//i.test(u)) return '';
  return '<a class="inv-lien" href="' + echapper(u) + '" target="_blank" rel="noopener">' + libelle + '</a>';
}

/** Pied de page : logo + lien Instagram + lien site de l'association. */
function piedInvitation(g) {
  const liens = [];
  const instagram = lienExterneSur(g.url_instagram, '📣 Instagram');
  if (instagram) liens.push(instagram);
  const site = lienExterneSur(g.url_site_association, '🌐 Site de l\'association');
  if (site) liens.push(site);
  return '<footer class="d-pied inv-pied">' +
    '<img class="d-pied-logo" src="img/blason-racing92.svg" alt="" onerror="this.style.display=\'none\'">' +
    '<span class="inv-pied-nom">École de Rugby du Racing Club de France</span>' +
    (liens.length ? '<span class="inv-pied-liens">' + liens.join('') + '</span>' : '') +
  '</footer>';
}
