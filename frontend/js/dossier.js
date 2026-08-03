/**
 * ============================================================================
 *  DOSSIER CLUB (Phase 2) — le dossier envoyé au club APRÈS son acceptation
 * ============================================================================
 *  Construit la page personnelle d'un club (?club=…&token=…) à partir des données
 *  du tournoi (Config Zone A + Zone B), via le MÊME backend que les autres pages.
 *
 *  MÊME DOCUMENT QUE L'INVITATION, À UN AUTRE MOMENT. Le dossier reprend, dans le
 *  même ordre, les blocs de la page d'invitation (`commun-dossier.js`) :
 *    1. blason centré, affiche en héros, descriptif complet ;
 *    2. l'accueil personnalisé du club ;
 *    3. la journée en un coup d'œil (frise horaire) ;
 *    4. UNE CARTE PAR CATÉGORIE — limitée aux catégories ENGAGÉES par le club ;
 *  puis ce qui n'existe qu'ici, une fois le club engagé : infos pratiques,
 *  modalités, parking, encadrement, suivi & QR, sécurité, contact, actions.
 *
 *  Règle d'or : toute section dont TOUS les champs sont vides est masquée
 *  entièrement (titre compris). Jamais de « non communiqué ».
 *
 *  PAGE VIVANTE : le club garde son lien ; à chaque ouverture la page se
 *  reconstruit avec les données du moment. Ce qui n'existe pas encore au moment
 *  de l'envoi (planning, poules…) apparaîtra tout seul, sans rien renvoyer.
 *
 *  L'export PDF passe par l'impression du navigateur (CSS print dans
 *  css/dossier.css) — aucune librairie PDF. Le QR code est généré en local
 *  par js/vendor/qrcode.js (MIT) — aucun appel externe.
 * ============================================================================
 */

/* Les blocs de page communs aux deux documents (heroDocument, friseJournee,
   cartesCategories, piedDocument), les résumés sportifs (resumeMiTemps,
   resumeEffectif, resumeReglement, tempsDeJeuDe…) et les libellés de formats
   (DOSSIER_FORMATS…) vivent dans commun-dossier.js / commun.js. */

// Le déclencheur d'impression [#bouton-imprimer] et revelerOutilsAdmin() sont désormais
// dans commun-dossier.js (partagés avec invitation-club.html).
document.addEventListener('DOMContentLoaded', initDossier);

async function initDossier() {
  const zone = document.getElementById('dossier');
  revelerOutilsAdmin();

  // Le dossier (contacts jour J, logistique, secours, tarifs) est PROTÉGÉ PAR JETON : chaque club
  // reçoit un lien personnel (?club=…&token=…). Toute la config du dossier vient de getConfigClub
  // (vue `club`, filtrée + jeton) ; getClubDossier fournit le prénom pour l'accueil personnalisé.
  const params = new URLSearchParams(window.location.search);
  const clubParam = txt(params.get('club'));
  const token = txt(params.get('token'));

  // Lien incomplet (ancien lien sans jeton, ou accès direct) → message courtois, aucune donnée.
  if (!clubParam || !token) { await afficherLienDossierExpire(zone); return; }

  try {
    const [cfgClub, r] = await Promise.all([
      apiGet('getConfigClub', { club: clubParam, token: token }),
      apiGet('getClubDossier', { club: clubParam, token: token })
    ]);
    const config = (cfgClub && cfgClub.config) || { global: {}, categories: [] };
    const club = (r && r.club) || null;
    zone.innerHTML = construireDossier(config.global || {}, config.categories || [], club);
    dessinerQR(); // le QR se dessine après coup (il vise un conteneur du HTML rendu)
  } catch (erreur) {
    // Jeton invalide/expiré (le backend renvoie « Lien invalide ou expiré. ») → message courtois.
    await afficherLienDossierExpire(zone);
  }
}

/**
 * Message affiché quand le lien du dossier est absent, incomplet ou expiré. Donne une porte de
 * sortie par EMAIL (contact_reponse_email, lu dans la vue invitation PUBLIQUE) : un club bloqué
 * le samedi matin doit pouvoir joindre l'organisateur. JAMAIS de téléphone — cette page s'affiche
 * sans jeton, donc elle est publique.
 */
async function afficherLienDossierExpire(zone) {
  let email = '';
  try {
    const cfg = await apiGet('getConfig'); // vue invitation (publique) : contient contact_reponse_email
    email = txt(cfg && cfg.global && cfg.global.contact_reponse_email);
  } catch (e) { /* contact indisponible : on reste sur un message générique */ }
  const sortie = email
    ? 'Pour recevoir votre lien personnel, écrivez à <a href="mailto:' + echapper(email) + '">'
      + echapper(email) + '</a>.'
    : 'Contactez l\'organisateur du tournoi pour recevoir votre lien personnel.';
  zone.innerHTML =
    '<div class="message-chargement">Ce lien de dossier n\'est plus valide ou incomplet.<br>'
    + 'Chaque club reçoit un lien personnel unique.<br>' + sortie + '</div>';
}

/**
 * Catégories engagées d'un club → tableau de noms normalisés (MAJUSCULES sans espaces
 * superflus). Accepte le format texte « U8,U10 » ou un tableau JSON ["U8","U10"].
 * Renvoie [] si rien n'est renseigné (le dossier reste alors non filtré).
 */
function categoriesEngageesListe(club) {
  return parseCategoriesEngagees(club ? club.categories_engagees : ''); // parseur commun (commun-dossier.js)
}

/**
 * Paragraphe d'accueil personnalisé (inséré avant la Présentation) quand le club est connu.
 * « Bonjour {prénom}, … {nom du tournoi} … les joueuses et joueurs de {nom du club} … ».
 * Si le prénom manque, on garde « Bonjour, » (jamais de « Bonjour undefined »).
 */
function accueilPersonnalise(g, club) {
  if (!club) return '';
  const prenom = txt(club.club_contact_prenom);
  const nomClub = txt(club.club_nom);
  const nomTournoi = txt(g.tournoi_nom) || 'Tournoi Génération R92';
  const bonjour = prenom ? 'Bonjour ' + echapper(prenom) + ',' : 'Bonjour,';
  return '<p class="d-accueil">' + bonjour +
    ' nous avons bien reçu votre retour concernant votre souhait de participer au '
    + echapper(nomTournoi) + '. Nous sommes heureux de compter parmi nous les joueuses et joueurs'
    + (nomClub ? ' de ' + echapper(nomClub) : '')
    + '. Voici les informations détaillées de cette journée.</p>';
}

/* Les petits helpers de mise en forme (txt, dateLongueFr, heurePlusMinutes,
   heureFinCommuniquee, telephoneLisible, jsonSur, urlAffiche, ligne, section, listeOuVide,
   catPresente…) sont désormais dans commun-dossier.js (partagés avec invitation/reponse). */

/* --------------------------------------------------------------------------
   LOGIQUES DE RÉSUMÉ (terrains, sécurité)
   -------------------------------------------------------------------------- */

/**
 * Transforme les JSON de terrains en UNE phrase lisible — jamais de JSON brut.
 *  - Source principale : `repartition_grands_terrains` {"Rugby 1":["1","2"],…}
 *    → nb de terrains de jeu, nb de grands terrains, complets vs réduits
 *    (un grand terrain à 1 seul terrain de jeu = joué en terrain complet).
 *  - Repli : les numéros de la colonne `terrains` des catégories présentes.
 *  Renvoie '' si on ne sait rien (la ligne est alors masquée).
 */
function resumeTerrains(global, categories) {
  const repartition = jsonSur(global.repartition_grands_terrains, {});
  const grands = Object.keys(repartition).filter(function (k) {
    return Array.isArray(repartition[k]) && repartition[k].length > 0;
  });
  let nbJeu = 0, complets = 0;
  grands.forEach(function (k) {
    nbJeu += repartition[k].length;
    if (repartition[k].length === 1) complets++;
  });

  if (nbJeu > 0) {
    const reduits = nbJeu - complets;
    let phrase = nbJeu + ' terrain' + (nbJeu > 1 ? 's' : '') + ' de jeu';
    const details = [];
    if (complets > 0) details.push(complets + ' grand' + (complets > 1 ? 's' : '') + ' complet' + (complets > 1 ? 's' : ''));
    if (reduits > 0) details.push(reduits + ' réduit' + (reduits > 1 ? 's' : ''));
    if (details.length > 1) phrase += ' : ' + details.join(', ');
    phrase += ', sur ' + grands.length + ' grand' + (grands.length > 1 ? 's' : '') + ' terrain' + (grands.length > 1 ? 's' : '')
            + ' (' + grands.join(', ') + ')';
    return phrase;
  }

  // Repli : numéros de terrains déclarés par catégorie (avant toute répartition appliquée).
  const numeros = new Set();
  (categories || []).filter(catPresente).forEach(function (c) {
    txt(c.terrains).split(',').forEach(function (n) { if (n.trim()) numeros.add(n.trim()); });
  });
  if (numeros.size > 0) return numeros.size + ' terrain' + (numeros.size > 1 ? 's' : '') + ' de jeu';
  return '';
}

/* resumeMiTemps, resumeEffectif, resumeReglement, resumeApresMidi et tempsDeJeuDe
   sont désormais dans commun-dossier.js (partagés avec invitation.js). */

/**
 * Résout le référent SÉCURITÉ : identique au référent tournoi (défaut, y compris
 * champ vide) → on réutilise referent_nom / referent_tel ; sinon les champs dédiés.
 * Renvoie { nom, tel } (chaînes éventuellement vides).
 */
function referentSecurite(g) {
  const identique = String(txt(g.securite_referent_identique) || 'oui').toLowerCase() !== 'non';
  return identique
    ? { nom: txt(g.referent_nom), tel: txt(g.referent_tel) }
    : { nom: txt(g.securite_referent_nom), tel: txt(g.securite_referent_tel) };
}

/* --------------------------------------------------------------------------
   LIENS UTILES (.ics, itinéraires, page de suivi)
   -------------------------------------------------------------------------- */

/** URL de la page publique de suivi : paramètre `url_tournoi_public` si présent
 *  dans Config, sinon la page tournoi.html qui vit à côté de ce dossier. */
function urlSuiviPublic(g) {
  return txt(g.url_tournoi_public) || new URL('tournoi.html', window.location.href).toString();
}

/** Adresse à utiliser pour l'itinéraire et l'agenda (repli : lieu). */
function adresseItineraire(g) {
  return txt(g.tournoi_adresse) || txt(g.tournoi_lieu);
}

/** Échappe une valeur texte ICS (RFC 5545 : virgules, points-virgules, retours ligne). */
function icsEchapper(v) {
  return String(v || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** « 2026-11-11 » + « 07:45 » → « 20261111T074500 » (heure locale flottante). */
function icsDateHeure(dateISO, hhmm) {
  const d = txt(dateISO).replace(/-/g, '');
  const h = txt(hhmm).replace(':', '');
  return (/^\d{8}$/.test(d) && /^\d{4}$/.test(h)) ? d + 'T' + h + '00' : '';
}

/**
 * Construit le contenu du fichier .ics : UN SEUL événement, de l'heure de RDV à
 * l'heure de fin annoncée aux clubs (manuelle, sinon fin du dernier match + 1 h 15 ;
 * replis : heure_debut au départ, RDV + 8 h à l'arrivée). Renvoie null si la date
 * ou l'heure de départ manquent.
 */
function construireICS(g) {
  const date = txt(g.tournoi_date);
  const debut = txt(g.heure_rdv) || txt(g.heure_debut);
  if (!date || !debut) return null;

  let fin = heureFinCommuniquee(g);
  if (!fin) fin = heurePlusMinutes(debut, 8 * 60);
  const dtStart = icsDateHeure(date, debut);
  const dtEnd = icsDateHeure(date, fin);
  if (!dtStart || !dtEnd) return null;

  // DESCRIPTION = résumé du programme (uniquement les horaires renseignés).
  const prog = [];
  if (txt(g.heure_rdv)) prog.push('RDV des équipes : ' + txt(g.heure_rdv));
  if (txt(g.heure_debut)) prog.push('Coup d\'envoi : ' + txt(g.heure_debut));
  if (txt(g.pause_dejeuner_debut)) {
    prog.push('Pause déjeuner : ' + txt(g.pause_dejeuner_debut)
      + (txt(g.pause_dejeuner_duree_min) ? ' (' + txt(g.pause_dejeuner_duree_min) + ' min)' : ''));
  }
  if (heureFinCommuniquee(g)) {
    prog.push('Fin de l\'événement (après la remise des trophées) : ' + heureFinCommuniquee(g));
  }

  const horodatage = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Generation R92//Tournoi//FR',
          'BEGIN:VEVENT',
          'UID:tournoi-r92-' + date + '@generation-r92',
          'DTSTAMP:' + horodatage,
          'DTSTART:' + dtStart,
          'DTEND:' + dtEnd,
          'SUMMARY:' + icsEchapper(txt(g.tournoi_nom) || 'Tournoi Génération R92'),
          'LOCATION:' + icsEchapper(adresseItineraire(g)),
          'DESCRIPTION:' + icsEchapper(prog.join(' · ')),
          'END:VEVENT',
          'END:VCALENDAR'].join('\r\n');
}

/** Déclenche le téléchargement du .ics (généré côté client, aucune dépendance serveur). */
function telechargerICS(g) {
  const contenu = construireICS(g);
  if (!contenu) return;
  const blob = new Blob([contenu], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tournoi-r92-' + (txt(g.tournoi_date) || 'agenda') + '.ics';
  document.body.appendChild(a);
  a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

/* --------------------------------------------------------------------------
   CONSTRUCTION DU DOSSIER (le HTML complet, section par section)
   -------------------------------------------------------------------------- */

function construireDossier(g, categories, club) {
  const cats = (categories || []).filter(catPresente);

  // Filtrage Phase 2 : si le club a des catégories engagées, le FORMAT SPORTIF ne montre
  // que ces catégories (les autres sections restent inchangées). Repli sur toutes les
  // catégories si la sélection ne correspond à aucune (donnée incohérente) — jamais de
  // section vide. Sans club / sans sélection : `catsFormat` = toutes les catégories.
  const engagees = categoriesEngageesListe(club);
  let catsFormat = cats;
  let filtreApplique = false;
  if (engagees.length) {
    const filtre = cats.filter(function (c) {
      return engagees.indexOf(txt(c.categorie).toUpperCase()) !== -1;
    });
    if (filtre.length) { catsFormat = filtre; filtreApplique = true; }
  }

  let html = '';

  // 1) EN-TÊTE VITRINE : EXACTEMENT le même bloc que l'invitation (heroDocument) — blason
  //    centré, affiche en héros, descriptif complet. Le club retrouve le document qu'il a
  //    reçu à l'invitation, avec la suite de l'histoire ; c'est le même tournoi, la même
  //    voix. (Le descriptif n'est plus tronqué à 400 caractères : plus rien ne le justifie.)
  html += heroDocument(g, {
    surtitre: 'École de Rugby du Racing Club de France<br>votre dossier pour la journée'
  });

  // 1 bis) ACCUEIL PERSONNALISÉ (Phase 2) : seulement si le club est connu (paramètre
  //        ?club= présent et jeton valide). Sinon rien (mode générique).
  html += accueilPersonnalise(g, club);

  // 2) LA JOURNÉE EN UN COUP D'ŒIL : la frise horaire de l'invitation, suivie de la note
  //    « horaires indicatifs » propre au dossier (le planning détaillé fait foi le jour J).
  //    La note ne s'affiche JAMAIS seule : sans heures, pas de section.
  const frise = friseJournee(g, catsFormat);
  html += section('La journée en un coup d\'œil', frise && (frise +
    '<p class="d-note">Après le dernier match : retour aux vestiaires puis cérémonie de remise ' +
    'des trophées — l\'événement se termine à l\'issue de la remise. Horaires indicatifs — ' +
    'le planning détaillé fera foi le jour du tournoi.</p>'), 'inv-journee');

  // 3) VOS CATÉGORIES : une carte par catégorie (mêmes cartes que l'invitation), limitées
  //    aux catégories ENGAGÉES par le club quand on les connaît — le tableau d'avant
  //    demandait au club de relire des colonnes qui ne le concernaient pas.
  html += section(filtreApplique ? 'Vos catégories engagées' : 'Les catégories du tournoi',
    cartesCategories(catsFormat), 'inv-categories');

  // 4) INFOS PRATIQUES : lieu + adresse, puis logistique si renseignée dans Config
  //    (paramètres optionnels de la Zone A : logistique_parking / _buvette / _vestiaires).
  html += section('Infos pratiques', listeOuVide([
    ligne('Lieu', echapper(txt(g.tournoi_lieu))),
    ligne('Adresse', echapper(txt(g.tournoi_adresse))),
    ligne('Parking', echapper(txt(g.logistique_parking))),
    ligne('Buvette / restauration', echapper(txt(g.logistique_buvette))),
    ligne('Vestiaires', echapper(txt(g.logistique_vestiaires)))
  ]));

  // 5) MODALITÉS D'INSCRIPTION : date limite de confirmation,
  //    tarif d'engagement (montant + modalités) SEULEMENT si un tarif est demandé.
  const tarifOui = String(txt(g.tarif_engagement_oui)).toLowerCase() === 'oui';
  html += section('Modalités d\'inscription', listeOuVide([
    ligne('Confirmation attendue avant le',
      txt(g.date_limite_confirmation) ? echapper(dateLongueFr(g.date_limite_confirmation)) : ''),
    ligne('Tarif d\'engagement', tarifOui ? echapper(txt(g.tarif_engagement_montant)) : ''),
    ligne('Modalités de paiement', tarifOui ? echapper(txt(g.tarif_engagement_modalites)) : '')
  ]));

  // 6) PARKING & ACCÈS : texte + photo (plan du parking) en pleine largeur.
  html += section('Parking & accès',
    (txt(g.parking_texte) ? '<p class="d-parking-texte">' + echapper(txt(g.parking_texte)) + '</p>' : '') +
    (txt(g.parking_photo_id)
      ? '<img class="d-parking-photo" src="' + echapper(urlAffiche(g.parking_photo_id, 1000)) + '" ' +
        'alt="Plan du parking et des accès">'
      : ''));

  // 7) ENCADREMENT & ASSURANCE : ratio, diplômes, attestation si requise.
  const attestation = String(txt(g.assurance_attestation_requise)).toLowerCase() === 'oui';
  html += section('Encadrement & assurance', listeOuVide([
    ligne('Encadrement', echapper(txt(g.encadrement_ratio))),
    ligne('Diplômes exigés', echapper(txt(g.encadrement_diplomes))),
    ligne('Assurance', attestation ? 'Attestation d\'assurance du club à fournir' : ''),
    // Mentions réglementaires FFR (toujours affichées) : licence obligatoire + FDM EDR.
    ligne('Licences', 'Tous les joueurs participant au tournoi doivent être titulaires d\'une licence FFR validée.'),
    ligne('Feuille de match', 'La feuille de match dématérialisée des Écoles de Rugby (FDM EDR) est utilisée pour l\'ensemble des rencontres du tournoi. Elle remplace la composition d\'équipe, la feuille de régulation et la feuille de score papier.')
  ]));

  // 8) SUIVI & ORGANISATION : lien live + QR, table de marque, résumé des terrains.
  const urlLive = urlSuiviPublic(g);
  const terrains = resumeTerrains(g, cats);
  html += section('Suivi des scores & organisation',
    '<div class="d-suivi">' +
      '<div class="d-suivi-texte">' + listeOuVide([
        ligne('Scores en direct', '<a href="' + echapper(urlLive) + '" target="_blank" rel="noopener">' + echapper(urlLive) + '</a>'),
        ligne('Table de marque', echapper(txt(g.table_marque_organisation))),
        ligne('Terrains', echapper(terrains))
      ]) + '</div>' +
      '<div class="d-qr" id="d-qr" data-url="' + echapper(urlLive) + '"><span class="d-qr-legende">Scores en direct</span></div>' +
    '</div>');

  // 9) SÉCURITÉ : poste de secours (si coché) + référent sécurité résolu.
  const secours = String(txt(g.securite_secours_oui)).toLowerCase() === 'oui';
  const refSecu = referentSecurite(g);
  const contactSecu = [refSecu.nom ? echapper(refSecu.nom) : '', refSecu.tel ? echapper(telephoneLisible(refSecu.tel)) : '']
    .filter(Boolean).join(' — ');
  html += section('Sécurité', listeOuVide([
    ligne('Poste de secours', secours
      ? 'Sur place' + (txt(g.securite_secours_precisions) ? ' — ' + echapper(txt(g.securite_secours_precisions)) : '')
      : ''),
    ligne('Référent sécurité', contactSecu)
  ]));

  // 10) BLOC CONTACT : référent tournoi.
  if (txt(g.referent_nom) || txt(g.referent_tel)) {
    html += '<section class="d-section d-contact">' +
      '<h2>Votre contact</h2>' +
      '<p class="d-contact-ligne">' +
        (txt(g.referent_nom) ? '<strong>' + echapper(txt(g.referent_nom)) + '</strong>' : '') +
        (txt(g.referent_tel)
          ? (txt(g.referent_nom) ? ' · ' : '') + '<a href="tel:' + echapper(txt(g.referent_tel)) + '">'
            + echapper(telephoneLisible(g.referent_tel)) + '</a>'
          : '') +
      '</p></section>';
  }

  // 11) BANDEAU D'ACTIONS : agenda .ics, itinéraires, liens de l'association.
  html += bandeauActions(g);

  // 12) DATE DE GÉNÉRATION : utile sur le PAPIER (un dossier imprimé fige la version du jour),
  //     avec le rappel que le lien personnel, lui, montre toujours l'état à jour.
  const genereLe = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  html += '<p class="d-genere">Document généré le ' + echapper(genereLe) +
    ' — votre lien personnel affiche toujours la version à jour.</p>';

  // 13) PIED DE PAGE : le même que l'invitation, SANS ses liens (le bandeau d'actions
  //     ci-dessus porte déjà le site et l'Instagram — pas deux fois à 3 cm d'écart).
  html += piedDocument(g, false);

  return html;
}


/** Bandeau d'actions : chaque bouton n'apparaît que si son lien est constructible. */
function bandeauActions(g) {
  const adresse = adresseItineraire(g);
  const boutons = [];

  if (construireICS(g)) {
    boutons.push('<button type="button" class="d-action" id="bouton-ics">📅 Ajouter à mon agenda</button>');
  }
  if (adresse) {
    const q = encodeURIComponent(adresse);
    boutons.push('<a class="d-action" href="https://www.google.com/maps/search/?api=1&query=' + q + '" target="_blank" rel="noopener">🗺️ Itinéraire (Google Maps)</a>');
    boutons.push('<a class="d-action" href="https://waze.com/ul?q=' + q + '&navigate=yes" target="_blank" rel="noopener">🚗 Itinéraire (Waze)</a>');
  }
  // Autorisation de droit à l'image : docx généré EN LOCAL depuis le modèle du site
  // (les balises nom/date/lieu sont remplacées ; le nom du club reste manuscrit).
  boutons.push('<button type="button" class="d-action" id="bouton-droit-image">🖼️ Autorisation droit à l\'image</button>');
  if (txt(g.url_site_association)) {
    boutons.push('<a class="d-action" href="' + echapper(txt(g.url_site_association)) + '" target="_blank" rel="noopener">🌐 Site de l\'association</a>');
  }
  // « Relayer sur les réseaux » pointe directement vers le compte Instagram Génération R92.
  if (txt(g.url_instagram)) {
    boutons.push('<a class="d-action" href="' + echapper(txt(g.url_instagram)) + '" target="_blank" rel="noopener">📣 Relayer sur les réseaux</a>');
  }
  if (!boutons.length) return '';

  // Les boutons .ics et droit à l'image ont besoin des données : branchés après le rendu (délégué).
  document.addEventListener('click', function brancherActions(e) {
    if (e.target && e.target.id === 'bouton-ics') telechargerICS(g);
    if (e.target && e.target.id === 'bouton-droit-image') telechargerAutorisationImage(g);
  });

  return '<div class="d-actions">' + boutons.join('') + '</div>' +
         '<p class="d-action-erreur" id="d-action-erreur" hidden></p>';
}

/* --------------------------------------------------------------------------
   AUTORISATION DE DROIT À L'IMAGE — docx généré CÔTÉ CLIENT
   --------------------------------------------------------------------------
   Le modèle assets/autorisation-droit-image-template.docx contient les balises
   {nom_tournoi}, {date_tournoi} et {lieu_tournoi}, remplacées à la volée par
   PizZip + docxtemplater (js/vendor/, chargés par dossier-club.html — aucun
   appel externe, comme le QR code). Le document reste GÉNÉRIQUE : le nom du
   club est écrit à la main par chaque famille.
   -------------------------------------------------------------------------- */

/** « Challenge Marc Chevalier » → « challenge-marc-chevalier » (nom de fichier sûr). */
function slugifier(texte) {
  return String(texte || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // é → e (accents retirés)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Génère et télécharge l'autorisation de droit à l'image du tournoi affiché.
 * En cas de problème (modèle manquant/renommé, librairie absente), un message
 * clair s'affiche sous le bandeau — jamais d'échec silencieux.
 */
async function telechargerAutorisationImage(g) {
  const erreurZone = document.getElementById('d-action-erreur');
  const bouton = document.getElementById('bouton-droit-image');
  if (erreurZone) { erreurZone.hidden = true; erreurZone.textContent = ''; }
  if (bouton) bouton.disabled = true;

  try {
    if (typeof PizZip === 'undefined' || typeof docxtemplater === 'undefined') {
      throw new Error('librairies de génération non chargées');
    }
    // 1) Le modèle .docx, récupéré à côté de la page (binaire → ArrayBuffer).
    const reponse = await fetch('assets/autorisation-droit-image-template.docx');
    if (!reponse.ok) throw new Error('modèle introuvable (' + reponse.status + ')');
    const contenu = await reponse.arrayBuffer();

    // 2-3) Chargement PizZip + docxtemplater, puis remplacement des 3 balises.
    const doc = new docxtemplater(new PizZip(contenu), { paragraphLoop: true, linebreaks: true });
    doc.render({
      nom_tournoi:  txt(g.tournoi_nom) || 'Tournoi Génération R92',
      date_tournoi: txt(g.tournoi_date) ? dateLongueFr(g.tournoi_date) : '',
      lieu_tournoi: txt(g.tournoi_lieu) || txt(g.tournoi_adresse)
    });

    // 4-5) Docx de sortie (blob) → téléchargement avec un nom de fichier parlant.
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Autorisation-droit-image-'
      + (slugifier(txt(g.tournoi_nom)) || 'tournoi-generation-r92')
      + (txt(g.tournoi_date) ? '-' + txt(g.tournoi_date) : '') + '.docx';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  } catch (e) {
    const referent = txt(g.referent_nom) || 'l\'organisateur du tournoi';
    if (erreurZone) {
      erreurZone.textContent = '⚠️ Impossible de charger le modèle d\'autorisation, contactez '
        + referent + '.';
      erreurZone.hidden = false;
    }
  } finally {
    if (bouton) bouton.disabled = false;
  }
}

/* --------------------------------------------------------------------------
   QR CODE (page de suivi en direct) — généré en local, pointe vers l'URL live
   -------------------------------------------------------------------------- */

function dessinerQR() {
  const conteneur = document.getElementById('d-qr');
  if (!conteneur || typeof qrcode !== 'function') return;
  try {
    const qr = qrcode(0, 'M'); // version auto, correction M
    qr.addData(conteneur.getAttribute('data-url'));
    qr.make();
    // SVG : net à l'écran comme à l'impression (cellSize 4 ≈ 3 cm imprimé).
    conteneur.insertAdjacentHTML('afterbegin', qr.createSvgTag({ cellSize: 4, margin: 8 }));
  } catch (e) {
    conteneur.hidden = true; // URL trop longue ou lib absente : on masque, sans casser la page
  }
}
