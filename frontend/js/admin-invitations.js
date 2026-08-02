/**
 * ============================================================================
 *  ADMIN — INVITATION & CLUBS INVITÉS (extrait de admin.js)
 * ============================================================================
 *  Sous-système « invitation » de la page admin, sorti du monolithe admin.js
 *  SANS changement de comportement :
 *   - Invitation Phase 1 : aperçu live de l'email + envoi individuel / groupé ;
 *   - Dossier d'invitation : modalités d'inscription, parking & accès, encadrement ;
 *   - Clubs invités : liste, édition inline des coordonnées, panneau « Accepté ».
 *
 *  Dépend de globaux définis ailleurs, accédés uniquement au moment de l'appel
 *  (handlers post-chargement) — l'ordre des <script> importe peu ; chargé après
 *  admin.js dans admin.html :
 *   - commun.js : echapper, svgIcone, comparerCategorie, afficherMessage, avecBoutonOccupe…
 *   - api.js    : apiGet, apiPost, ecrireAdmin (défini dans admin.js)
 *   - admin.js  : configCourante, clubsInvitesCourants, majDossier, majApercuTournoi,
 *                 rechargerEtRendre, dialog*, redimensionnerImage, brancherZoneImage…
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   INVITATION PHASE 1 — aperçu de l'email (live) + envoi individuel / groupé.
   L'aperçu suit le MÊME principe que celui de la carte « Infos du tournoi » :
   mise à jour EN DIRECT à partir des données du tournoi et des valeurs LIVE des
   cartes « Sur place » / « Réponse à l'invitation ». Le contenu ENVOYÉ (objet +
   corps après salutation) est construit par les mêmes fonctions → l'email reçu
   correspond exactement à l'aperçu, seule la salutation variant par club.
   -------------------------------------------------------------------------- */

/** URL absolue de la page d'invitation publique (Phase 1), pour le lien de l'email.
 *  C'est la BASE : le backend y ajoute club + jeton par destinataire ({{LIEN_INVITATION}}),
 *  la page reconnaît alors le club et affiche son bouton « Répondre à l'invitation ». */
function lienInvitationPublique() {
  return new URL('invitation-club.html', window.location.href).toString();
}

/** URL absolue du blason en PNG (les clients mail n'affichent pas le SVG). */
function urlBlasonEmail() {
  return new URL('img/blason-racing92.png', window.location.href).toString();
}

/** Lien d'invitation d'EXEMPLE pour l'aperçu (le vrai lien, avec jeton, est construit par club). */
function lienInvitationApercu() {
  return lienInvitationPublique() + '?club=EXEMPLE&token=EXEMPLE';
}

/** État « global » pour l'invitation : config enregistrée + valeurs LIVE des cartes
 *  Sur place / Réponse (pour un aperçu qui suit la frappe, comme l'aperçu des Infos). */
function globalInvitation() {
  const g = Object.assign({}, configCourante.global || {});
  const fs = document.getElementById('form-surplace');
  if (fs) {
    g.buvette_disponible = fs.buvette_disponible.checked ? 'oui' : 'non';
    g.espace_sandwich_disponible = fs.espace_sandwich_disponible.checked ? 'oui' : 'non';
    g.boutique_r92_disponible = fs.boutique_r92_disponible.checked ? 'oui' : 'non';
  }
  const fr = document.getElementById('form-reponse');
  if (fr) g.date_limite_reponse = fr.date_limite_reponse.value;
  return g;
}

/** Objet de l'email d'invitation. */
function sujetInvitation(g) {
  return 'Invitation — ' + (String(g.tournoi_nom || '').trim() || 'Tournoi Génération R92');
}

/** Phrase d'INTRODUCTION courte (après la salutation), éditable. Réactive au nom du tournoi. */
function introInvitationDefaut(g) {
  const nom = String(g.tournoi_nom || '').trim() || 'notre tournoi';
  return 'Nous avons le plaisir de vous inviter au ' + nom + '. Voici l\'essentiel de la journée.';
}

/** Prénom d'exemple pour l'aperçu : premier club avec un prénom, sinon « Prénom ». */
function exemplePrenomInvitation() {
  const c = (clubsInvitesCourants || []).find(function (x) { return String(x.club_contact_prenom || '').trim(); });
  return c ? String(c.club_contact_prenom).trim() : 'Prénom';
}

/** Catégories présentes du tournoi, triées (ordre naturel U8 < U10 < …). */
function catsInvitationTriees() {
  return (configCourante.categories || []).filter(estPresente)
    .slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });
}

/* Charte R92 pour l'email (styles EN LIGNE uniquement — pas de CSS externe/flex/grid,
   pour la compatibilité des clients mail). */
const EMAIL_NAVY = '#0C1C2E', EMAIL_BLEU = '#2E8FE0', EMAIL_TXT = '#1a1f26', EMAIL_GRIS = '#5b6570', EMAIL_FILET = '#dbe3ec';

/** Échappe un texte libre PUIS convertit ses sauts de ligne en <br> (pour l'insérer dans le
 *  HTML de l'email en préservant les retours à la ligne saisis par l'admin). */
function nl2brEmail(s) {
  return echapper(String(s == null ? '' : s)).replace(/\r?\n/g, '<br>');
}

/** Titre de section de l'email (barre bleue de la charte). */
function emailTitreSection(t) {
  return '<h2 style="margin:20px 0 8px;font-family:Arial,Helvetica,sans-serif;text-transform:uppercase;'
    + 'letter-spacing:.5px;font-size:15px;color:' + EMAIL_BLEU + ';border-bottom:1px solid ' + EMAIL_FILET + ';padding-bottom:4px;">'
    + echapper(t) + '</h2>';
}

/* --- Résumés sportifs de l'email (miroirs légers de la vitrine ; suffixe Email comme
       heureFinCommuniqueeAdmin — admin.html ne charge pas commun-dossier.js) --- */

/** Ajoute `minutes` à une heure « HH:MM » (bornée à 23:59). '' si l'heure est illisible. */
function heurePlusMinutesEmail(hhmm, minutes) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
  if (!m) return '';
  const total = Math.min(23 * 60 + 59, parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + minutes);
  return ('0' + Math.floor(total / 60)).slice(-2) + ':' + ('0' + (total % 60)).slice(-2);
}

/** Forme de jeu d'une catégorie : Super Challenge prioritaire, sinon Config.forme_jeu, sinon ''. */
function formeJeuEmailTxt(c) {
  if (ctxScf(c).estScf) return 'Jeu à XV · Super Challenge de France';
  return String(c.forme_jeu || '').trim();
}

/** « 2 × 10 min (pause 2 min) » — temps SCF imposés par la phase (P2 = 2×15 ; P3 = 2×11,
 *  miroir de dureeMatchScf côté backend). '' si la durée est inconnue. */
function tempsJeuEmailTxt(c) {
  const scf = ctxScf(c);
  const nb = scf.estScf ? 2 : (parseInt(String(c.format_mi_temps || '').trim(), 10) || 2);
  const duree = scf.estScf ? (scf.phase === 'P3' ? 11 : 15) : parseInt(String(c.duree_mi_temps_min || '').trim(), 10);
  if (!isFinite(duree) || duree <= 0) return '';
  let s = nb + ' × ' + duree + ' min';
  const pause = parseInt(String(c.pause_mi_temps_min || '').trim(), 10);
  if (nb === 2 && isFinite(pause) && pause > 0) s += ' (pause ' + pause + ' min)';
  return s;
}

/** « 8 à 12 joueurs » / « 8 joueurs min » / « 12 joueurs max » / ''. */
function effectifEmailTxt(c) {
  const min = String(c.effectif_min || '').trim(), max = String(c.effectif_max || '').trim();
  if (min && max) return (min === max) ? min + ' joueurs' : min + ' à ' + max + ' joueurs';
  if (min) return min + ' joueurs min';
  if (max) return max + ' joueurs max';
  return '';
}

/** Phrase d'introduction des cartes (miroir de cartesCategories sur la vitrine) : matin en
 *  poules pour les catégories ordinaires ; le Super Challenge suit sa formule propre. */
function introCartesEmail(cats) {
  const nonScf = cats.filter(function (c) { return !ctxScf(c).estScf; });
  const aScf = nonScf.length < cats.length;
  if (!nonScf.length) return 'Le Super Challenge de France suit la formule de son règlement, détaillée ci-dessous.';
  let intro = 'Le matin, les catégories jouent en poules : chaque équipe rencontre toutes celles '
    + 'de sa poule. L\'après-midi suit le format propre à chaque catégorie, détaillé ci-dessous.';
  if (aScf) intro += ' Le Super Challenge de France (U14) suit la formule de son règlement, détaillée sur sa carte.';
  return intro;
}

/**
 * UNE carte de catégorie (miroir email-safe des cartes de la vitrine) : bandeau navy
 * (catégorie + forme de jeu), lignes libellé/valeur, format d'après-midi expliqué.
 */
function carteCategorieEmail(c, A) {
  const scf = ctxScf(c);
  const badge = scf.estScf ? 'Super Challenge de France' : String(c.forme_jeu || '').trim();

  const tdLib = 'style="' + A + 'font-size:12px;color:' + EMAIL_GRIS + ';padding:4px 10px 4px 12px;width:110px;vertical-align:top;"';
  const tdVal = 'style="' + A + 'font-size:13px;color:' + EMAIL_TXT + ';font-weight:bold;padding:4px 12px 4px 0;"';
  const lignes = [];
  const L = function (lib, valHtml) {
    if (!valHtml) return;
    lignes.push('<tr><td ' + tdLib + '>' + echapper(lib) + '</td><td ' + tdVal + '>' + valHtml + '</td></tr>');
  };

  if (scf.estScf) {
    // Temps imposés par le règlement SCF (P2 = 2×15 ; P3 = 2×11) ; la formule dit tout.
    L('Forme de jeu', echapper('Jeu à XV (15 contre 15)'));
    L('Temps de jeu', echapper(tempsJeuEmailTxt(c)));
    L('Formule', echapper(scf.phase === 'P3'
      ? 'Samedi : triangulaires · Dimanche : brassage par niveau'
      : 'Plateau en triangulaires / quadrangulaires'));
  } else {
    if (String(c.forme_jeu || '').trim()) L('Forme de jeu', echapper(String(c.forme_jeu).trim()));
    const temps = tempsJeuEmailTxt(c);
    if (temps) {
      const nb = parseInt(String(c.format_mi_temps || '').trim(), 10) || 2;
      const duree = parseInt(String(c.duree_mi_temps_min || '').trim(), 10);
      const total = (isFinite(duree) && duree > 0) ? ' — ' + (nb * duree) + ' min par match' : '';
      L('Temps de jeu', echapper(temps + total));
    }
  }
  const recup = String(c.recup_entre_matchs_min || '').trim();
  if (recup) L('Récupération', echapper(recup + ' min minimum entre deux matchs'));
  const effectif = effectifEmailTxt(c);
  if (effectif) L('Effectif', echapper(effectif + ' par équipe'));
  const max = parseInt(String(c.max_equipes_par_club || '').trim(), 10);
  L('Équipes par club', echapper((isFinite(max) && max >= 1)
    ? 'Jusqu\'à ' + max + ' équipe' + (max > 1 ? 's' : '') : 'Plusieurs équipes possibles'));
  if (String(c.arbitrage_organisation || '').trim()) L('Arbitrage', echapper(String(c.arbitrage_organisation).trim()));
  const regl = String(c.reglement || '').trim().match(/https?:\/\/\S+/i);
  if (regl) L('Règlement', '<a href="' + echapper(regl[0]) + '" style="color:' + EMAIL_BLEU + ';">Consulter le règlement</a>');

  // Format d'après-midi expliqué — pas pour le SCF (pas de phase d'après-midi, cf. Formule).
  let apresMidi = '';
  if (!scf.estScf) {
    const cle = cleFormatApresMidi(c);
    apresMidi = '<tr><td colspan="2" style="' + A + 'font-size:12px;color:#274a68;background:#f5f8fc;'
      + 'padding:8px 12px;border-top:1px solid ' + EMAIL_FILET + ';line-height:1.5;">'
      + '<strong>Après-midi — ' + echapper(DOSSIER_FORMATS[cle]) + '</strong> : '
      + echapper(DOSSIER_FORMATS_DESC[cle]) + '</td></tr>';
  }

  return '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" '
    + 'style="border-collapse:separate;width:100%;border:1px solid ' + EMAIL_FILET + ';border-radius:8px;margin:0 0 10px;">'
    + '<tr><td style="background:' + EMAIL_NAVY + ';padding:7px 12px;border-radius:7px 0 0 0;' + A
    + 'font-size:16px;font-weight:bold;color:#ffffff;">' + echapper(String(c.categorie || '')) + '</td>'
    + '<td style="background:' + EMAIL_NAVY + ';padding:7px 12px;border-radius:0 7px 0 0;text-align:right;">'
    + (badge ? '<span style="display:inline-block;background:' + EMAIL_BLEU + ';color:#ffffff;border-radius:12px;'
      + 'padding:3px 10px;' + A + 'font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">'
      + echapper(badge) + '</span>' : '&nbsp;') + '</td></tr>'
    + '<tr><td colspan="2" style="padding:4px 0;">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;width:100%;">'
    + lignes.join('') + '</table></td></tr>'
    + apresMidi
    + '</table>';
}

/** Repères FFR sous les cartes (mêmes textes et mêmes conditions que la vitrine :
 *  FFR_RAPPEL_EFFECTIF / FFR_POURQUOI_FORMAT, commun.js). */
function reperesFFREmail(cats, A) {
  let html = '';
  const aEffectifMin = cats.some(function (c) {
    const n = parseInt(String(c.effectif_min || '').trim(), 10);
    return isFinite(n) && n >= 1;
  });
  if (aEffectifMin) {
    html += '<p style="margin:10px 0 0;padding:8px 12px;background:#fdf4e3;border-left:3px solid #e5a33c;'
      + A + 'font-size:12px;color:#8a5a0c;line-height:1.5;">⚠️ <strong>Rappel sécurité FFR</strong> — '
      + echapper(FFR_RAPPEL_EFFECTIF) + '</p>';
  }
  const aPoules = cats.some(function (c) {
    return String(c.format_apresmidi || '').trim().toUpperCase() === 'POULES_NIVEAU';
  });
  if (aPoules) {
    html += '<p style="margin:10px 0 0;padding:8px 12px;background:#eef5fc;border-left:3px solid ' + EMAIL_BLEU + ';'
      + A + 'font-size:12px;color:#274a68;line-height:1.5;">💡 <strong>Pourquoi ce format ?</strong> '
      + echapper(FFR_POURQUOI_FORMAT) + '</p>';
  }
  return html;
}

/**
 * Corps HTML de l'email d'invitation (compatible clients mail : tableaux + styles en ligne).
 * L'email EST l'invitation COMPLÈTE (décision Romain) : même contenu que la page vitrine —
 * blason centré, surtitre « a le plaisir de vous inviter », grand titre, date · lieu, affiche
 * centrée, descriptif complet, journée en un coup d'œil, UNE CARTE DÉTAILLÉE PAR CATÉGORIE
 * (forme de jeu, temps de jeu, récupération, effectifs, arbitrage, règlement, après-midi
 * expliqué) et les repères FFR. `salutationHtml` est inséré TEL QUEL (jeton « {{SALUTATION}} »
 * pour l'envoi, ou « Bonjour {exemple}, » pour l'aperçu) ; `imgSrc` = l'affiche (URL Drive en
 * aperçu, « cid:affiche » pour l'envoi ; vide = pas d'image) ; `lienInvitation` = lien vers la
 * page vitrine (jeton « {{LIEN_INVITATION}} » à l'envoi → personnalisé par club).
 */
function emailHtmlInvitation(g, cats, imgSrc, salutationHtml, intro, lienReponse, lienInvitation) {
  const A = 'font-family:Arial,Helvetica,sans-serif;';
  const nom = echapper(String(g.tournoi_nom || '').trim() || 'Tournoi Génération R92');
  const date = String(g.tournoi_date || '').trim() ? echapper(formaterDateFr(g.tournoi_date)) : '';
  const lieu = echapper(String(g.tournoi_lieu || '').trim());
  const lienInv = lienInvitation ? echapper(lienInvitation) : echapper(lienInvitationPublique());

  // En-tête VITRINE : blason centré, surtitre, grand titre, date · lieu, filet d'accent.
  let entete = '<div style="text-align:center;">'
    + '<img src="' + echapper(urlBlasonEmail()) + '" alt="Racing 92" width="110" '
    + 'style="display:block;width:110px;height:auto;margin:0 auto 10px;">'
    + '<p style="margin:0;' + A + 'text-transform:uppercase;letter-spacing:2px;font-size:12px;line-height:1.5;color:' + EMAIL_BLEU + ';">'
    + 'L\'École de Rugby du Racing Club de France<br>a le plaisir de vous inviter</p>'
    + '<h1 style="margin:8px 0 2px;' + A + 'font-size:27px;line-height:1.1;color:' + EMAIL_NAVY + ';">' + nom + '</h1>'
    + ((date || lieu) ? '<p style="margin:4px 0 0;' + A + 'font-weight:bold;font-size:15px;color:' + EMAIL_NAVY + ';">'
      + [date, lieu].filter(Boolean).join('<span style="color:' + EMAIL_BLEU + ';"> · </span>') + '</p>' : '')
    + '<div style="width:90px;height:4px;background:' + EMAIL_BLEU + ';margin:14px auto 0;border-radius:2px;font-size:0;line-height:0;">&nbsp;</div>'
    + '</div>';

  // L'affiche du tournoi, centrée et plus grande (l'email reste léger : 340 px maxi).
  const blocAffiche = imgSrc
    ? '<img src="' + echapper(imgSrc) + '" alt="Affiche — ' + nom + '" '
      + 'style="display:block;width:100%;max-width:340px;height:auto;border-radius:8px;margin:16px auto 0;">'
    : '';

  // Le descriptif COMPLET du tournoi (même contenu que la page vitrine — l'email EST
  // l'invitation complète, pas un teaser). Un paragraphe par ligne saisie.
  const blocDescription = String(g.tournoi_description || '').trim()
    ? '<p style="margin:16px 0 0;' + A + 'font-size:14px;color:' + EMAIL_TXT + ';text-align:justify;line-height:1.55;">'
      + nl2brEmail(String(g.tournoi_description).trim()) + '</p>'
    : '';

  // Salutation + intro.
  // La phrase d'intro est du texte LIBRE (multi-lignes) : sauts de ligne → <br> + texte justifié.
  const bloc_salut = '<p style="margin:18px 0 4px;' + A + 'font-size:15px;color:' + EMAIL_TXT + ';">' + salutationHtml + '</p>'
    + (String(intro || '').trim() ? '<p style="margin:0;' + A + 'font-size:14px;color:' + EMAIL_TXT + ';text-align:justify;">' + nl2brEmail(intro) + '</p>' : '');

  // Bouton d'ACTION principal : « Répondre à l'invitation » (lien personnel avec jeton),
  // suivi du lien vers l'invitation complète (page vitrine, personnalisée par club à l'envoi).
  const boutonReponse = lienReponse
    ? '<p style="margin:18px 0 4px;text-align:center;"><a href="' + echapper(lienReponse) + '" '
      + 'style="display:inline-block;background:' + EMAIL_BLEU + ';color:#ffffff;text-decoration:none;'
      + 'border-radius:999px;padding:13px 28px;' + A + 'font-size:15px;font-weight:bold;">Répondre à l\'invitation</a></p>'
      + '<p style="margin:0 0 4px;text-align:center;' + A + 'font-size:12px;color:' + EMAIL_GRIS + ';">'
      + '(présence, équipes engagées, joueurs et éducateurs par équipe)</p>'
      + '<p style="margin:6px 0 4px;text-align:center;' + A + 'font-size:13px;">'
      + '<a href="' + lienInv + '" style="color:' + EMAIL_BLEU + ';">📄 Voir l\'invitation complète</a></p>'
    : '';

  // « La journée en un coup d'œil » : mêmes étapes que la frise de la page vitrine.
  const ligneJ = function (lib, val) {
    if (!val) return '';
    return '<tr><td style="' + A + 'font-size:13px;color:' + EMAIL_GRIS + ';padding:3px 10px 3px 0;">' + echapper(lib) + '</td>'
      + '<td style="' + A + 'font-size:13px;color:' + EMAIL_TXT + ';font-weight:bold;padding:3px 0;">' + echapper(val) + '</td></tr>';
  };
  const arbitrages = [];
  cats.forEach(function (c) { const v = String(c.arbitrage_organisation || '').trim(); if (v && arbitrages.indexOf(v) === -1) arbitrages.push(v); });
  const pauseDuree = parseInt(String(g.pause_dejeuner_duree_min || '').trim(), 10);
  const pauseTxt = String(g.pause_dejeuner_debut || '').trim()
    ? String(g.pause_dejeuner_debut).trim() + ((isFinite(pauseDuree) && pauseDuree > 0) ? ' (' + pauseDuree + ' min)' : '')
    : '';
  const reprise = (String(g.pause_dejeuner_debut || '').trim() && isFinite(pauseDuree) && pauseDuree > 0)
    ? heurePlusMinutesEmail(g.pause_dejeuner_debut, pauseDuree) : '';
  const jourJ = ligneJ('Accueil des équipes', String(g.heure_rdv || '').trim())
    + ligneJ('Coup d\'envoi', String(g.heure_debut || '').trim())
    + ligneJ('Pause méridienne', pauseTxt)
    + ligneJ('Reprise', reprise)
    + ligneJ('Fin envisagée', heureFinCommuniqueeAdmin(g))
    + ligneJ('Arbitrage', arbitrages.join(' · '));
  const blocJourJ = jourJ ? (emailTitreSection('La journée en un coup d\'œil')
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' + jourJ + '</table>') : '';

  // « Vous êtes invités » : l'invitation COMPLÈTE — une carte détaillée par catégorie
  // (miroir des cartes de la page vitrine, en HTML email-safe : tableaux empilés),
  // précédée de la même phrase d'introduction, suivie des mêmes repères FFR.
  let tblInvites = '';
  if (cats.length) {
    tblInvites = emailTitreSection('Vous êtes invités')
      + '<p style="margin:0 0 10px;' + A + 'font-size:13px;color:' + EMAIL_TXT + ';">' + echapper(introCartesEmail(cats)) + '</p>'
      + cats.map(function (c) { return carteCategorieEmail(c, A); }).join('')
      + reperesFFREmail(cats, A);
  }

  // « Sur place » : pastilles (seulement si cochées) + tarif si demandé.
  const pastilles = [];
  if (estOui(g.buvette_disponible)) pastilles.push('🥤 Buvette');
  if (estOui(g.espace_sandwich_disponible)) pastilles.push('🥪 Espace sandwich');
  if (estOui(g.boutique_r92_disponible)) pastilles.push('🛍️ Boutique R92');
  let surPlace = '';
  if (pastilles.length || (estOui(g.tarif_engagement_oui) && String(g.tarif_engagement_montant || '').trim())) {
    surPlace = emailTitreSection('Sur place');
    if (pastilles.length) {
      surPlace += '<p style="margin:0 0 6px;">' + pastilles.map(function (p) {
        return '<span style="display:inline-block;background:' + EMAIL_NAVY + ';color:#fff;border-radius:14px;'
          + 'padding:5px 12px;' + A + 'font-size:13px;margin:0 6px 6px 0;">' + echapper(p) + '</span>';
      }).join('') + '</p>';
    }
    if (estOui(g.tarif_engagement_oui) && String(g.tarif_engagement_montant || '').trim()) {
      surPlace += '<p style="margin:0;' + A + 'font-size:13px;color:' + EMAIL_TXT + ';"><strong>Tarif d\'engagement :</strong> '
        + nl2brEmail(String(g.tarif_engagement_montant).trim()) + '</p>';
    }
  }

  // « Réponse attendue » : date limite + contact.
  const contact = [];
  if (String(g.contact_reponse_nom || '').trim()) contact.push(echapper(String(g.contact_reponse_nom).trim()));
  if (String(g.contact_reponse_tel || '').trim()) contact.push(echapper(telephoneLisibleAdmin(g.contact_reponse_tel)));
  if (String(g.contact_reponse_email || '').trim()) contact.push(echapper(String(g.contact_reponse_email).trim()));
  // Date limite de CONFIRMATION (carte Modalités) : ajoutée seulement si renseignée ET
  // différente de la date de réponse (pas de doublon de date dans l'email).
  const dateConfirm = String(g.date_limite_confirmation || '').trim();
  const dateRep = String(g.date_limite_reponse || '').trim();
  const confirmDiff = dateConfirm && dateConfirm !== dateRep;
  const reponse = ligneJ('Réponse souhaitée avant le', dateRep ? formaterDateFr(dateRep) : '')
    + ligneJ('Confirmation des effectifs avant le', confirmDiff ? formaterDateFr(dateConfirm) : '')
    + ligneJ('Votre contact', contact.join(' · '));
  const blocReponse = reponse ? (emailTitreSection('Réponse attendue')
    + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' + reponse + '</table>') : '';

  // Bouton RÉPÉTÉ en bas : après avoir tout lu, le club n'a pas à remonter pour répondre.
  const boutonBas = lienReponse
    ? '<p style="margin:16px 0 0;text-align:center;"><a href="' + echapper(lienReponse) + '" '
      + 'style="display:inline-block;background:' + EMAIL_BLEU + ';color:#ffffff;text-decoration:none;'
      + 'border-radius:999px;padding:13px 28px;' + A + 'font-size:15px;font-weight:bold;">Répondre à l\'invitation</a></p>'
    : '';

  // Pied : mention (même entité que la vitrine) + lien de secours vers la page complète.
  const pied = '<p style="margin:20px 0 0;padding-top:12px;border-top:1px solid ' + EMAIL_FILET + ';' + A + 'font-size:12px;color:' + EMAIL_GRIS + ';">'
    + 'Génération R92 · École de Rugby du Racing Club de France<br>'
    + '<a href="' + lienInv + '" style="color:' + EMAIL_BLEU + ';">Voir la version en ligne</a></p>';

  // Ordre VITRINE : en-tête, affiche, salutation, bouton, descriptif complet, journée,
  // cartes par catégorie + repères FFR, sur place, réponse (+ bouton répété).
  return '<div style="background:#eef2f7;padding:16px;' + A + '">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-collapse:collapse;">'
    + '<tr><td style="padding:22px 24px;">'
    + '<div style="border-bottom:3px solid ' + EMAIL_NAVY + ';padding-bottom:14px;">' + entete + '</div>'
    + blocAffiche + bloc_salut + boutonReponse + blocDescription + blocJourJ + tblInvites + surPlace
    + blocReponse + boutonBas + pied
    + '</td></tr></table></div>';
}

/** Version TEXTE brut (fallback anti-spam / clients sans HTML). `salutationTexte` et les liens
 *  sont des jetons à l'envoi ({{SALUTATION}}, {{LIEN_REPONSE}}, {{LIEN_INVITATION}}) ou des
 *  exemples pour l'aperçu. */
function emailTexteInvitation(g, cats, salutationTexte, intro, lienReponse, lienInvitation) {
  const nom = String(g.tournoi_nom || '').trim() || 'Tournoi Génération R92';
  const L = [];
  L.push(salutationTexte);
  L.push('');
  if (String(intro || '').trim()) { L.push(String(intro).trim()); L.push(''); }
  if (lienReponse) { L.push('▶ Répondre à l\'invitation : ' + lienReponse); L.push(''); }
  if (lienInvitation) { L.push('📄 Voir l\'invitation en ligne : ' + lienInvitation); L.push(''); }
  // L'email est l'invitation COMPLÈTE : le descriptif du tournoi y figure en entier.
  if (String(g.tournoi_description || '').trim()) { L.push(String(g.tournoi_description).trim()); L.push(''); }
  if (cats.length) {
    L.push('VOUS ÊTES INVITÉS');
    L.push(introCartesEmail(cats));
    cats.forEach(function (c) {
      const scf = ctxScf(c);
      const max = parseInt(String(c.max_equipes_par_club || '').trim(), 10);
      const eq = (isFinite(max) && max >= 1) ? ('jusqu\'à ' + max + ' équipe(s)/club') : 'plusieurs équipes possibles';
      const seg = [eq];
      const forme = formeJeuEmailTxt(c);
      if (forme) seg.unshift(forme);
      const temps = tempsJeuEmailTxt(c);
      if (temps) seg.push(temps);
      const recup = String(c.recup_entre_matchs_min || '').trim();
      if (recup) seg.push('récup ' + recup + ' min');
      const eff = effectifEmailTxt(c);
      if (eff) seg.push(eff);
      if (String(c.arbitrage_organisation || '').trim()) seg.push('arbitrage : ' + String(c.arbitrage_organisation).trim());
      if (scf.estScf) {
        seg.push(scf.phase === 'P3' ? 'samedi triangulaires · dimanche brassage par niveau'
          : 'plateau en triangulaires / quadrangulaires');
      } else {
        seg.push('après-midi : ' + DOSSIER_FORMATS[cleFormatApresMidi(c)]);
      }
      L.push('- ' + String(c.categorie || '') + ' : ' + seg.join(' · '));
    });
    L.push('');
    // Repères FFR (mêmes conditions que la vitrine et que l'email HTML).
    if (cats.some(function (c) { const n = parseInt(String(c.effectif_min || '').trim(), 10); return isFinite(n) && n >= 1; })) {
      L.push('RAPPEL SÉCURITÉ FFR — ' + FFR_RAPPEL_EFFECTIF);
      L.push('');
    }
    if (cats.some(function (c) { return String(c.format_apresmidi || '').trim().toUpperCase() === 'POULES_NIVEAU'; })) {
      L.push('POURQUOI CE FORMAT ? ' + FFR_POURQUOI_FORMAT);
      L.push('');
    }
  }
  const jour = [];
  if (String(g.heure_rdv || '').trim()) jour.push('Accueil : ' + String(g.heure_rdv).trim());
  if (String(g.heure_debut || '').trim()) jour.push('Coup d\'envoi : ' + String(g.heure_debut).trim());
  if (String(g.pause_dejeuner_debut || '').trim()) jour.push('Pause méridienne : ' + String(g.pause_dejeuner_debut).trim());
  if (heureFinCommuniqueeAdmin(g)) jour.push('Fin envisagée : ' + heureFinCommuniqueeAdmin(g));
  const arb = [];
  cats.forEach(function (c) { const v = String(c.arbitrage_organisation || '').trim(); if (v && arb.indexOf(v) === -1) arb.push(v); });
  if (arb.length) jour.push('Arbitrage : ' + arb.join(' · '));
  if (jour.length) { L.push('LA JOURNÉE : ' + jour.join(' · ')); L.push(''); }
  const services = [];
  if (estOui(g.buvette_disponible)) services.push('buvette');
  if (estOui(g.espace_sandwich_disponible)) services.push('espace sandwich');
  if (estOui(g.boutique_r92_disponible)) services.push('boutique R92');
  if (services.length) L.push('Sur place : ' + services.join(', ') + '.');
  if (estOui(g.tarif_engagement_oui) && String(g.tarif_engagement_montant || '').trim()) {
    L.push('Tarif d\'engagement : ' + String(g.tarif_engagement_montant).trim());
  }
  if (services.length || (estOui(g.tarif_engagement_oui) && String(g.tarif_engagement_montant || '').trim())) L.push('');
  if (String(g.date_limite_reponse || '').trim()) L.push('Réponse souhaitée avant le ' + formaterDateFr(g.date_limite_reponse) + '.');
  const dConf = String(g.date_limite_confirmation || '').trim();
  if (dConf && dConf !== String(g.date_limite_reponse || '').trim()) L.push('Confirmation des effectifs avant le ' + formaterDateFr(dConf) + '.');
  const c2 = [];
  if (String(g.contact_reponse_nom || '').trim()) c2.push(String(g.contact_reponse_nom).trim());
  if (String(g.contact_reponse_tel || '').trim()) c2.push(telephoneLisibleAdmin(g.contact_reponse_tel));
  if (String(g.contact_reponse_email || '').trim()) c2.push(String(g.contact_reponse_email).trim());
  if (c2.length) L.push('Contact : ' + c2.join(' · '));
  L.push('');
  L.push('Voir la version complète en ligne : ' + (lienInvitation || lienInvitationPublique()));
  L.push('');
  L.push('Au plaisir de vous accueillir,');
  L.push('Génération R92 · École de Rugby du Racing Club de France');
  return L.join('\n');
}

/** Heure de fin communiquée aux clubs (manuelle si saisie, sinon fin du dernier match + marge). */
function heureFinCommuniqueeAdmin(g) {
  const manuelle = String(g.heure_fin_communiquee || '').trim();
  if (manuelle) return manuelle;
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(g.heure_fin || '').trim());
  if (!m) return '';
  const marge = parseInt(String(g.marge_fin_communiquee_min || '').trim(), 10);
  const total = Math.min(23 * 60 + 59, parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + (isFinite(marge) && marge >= 0 ? marge : 75));
  return ('0' + Math.floor(total / 60)).slice(-2) + ':' + ('0' + (total % 60)).slice(-2);
}

/** « 0612345678 » → « 06 12 34 56 78 » (affichage). */
function telephoneLisibleAdmin(v) {
  const c = String(v || '').replace(/\D/g, '');
  return /^\d{10}$/.test(c) ? c.replace(/(\d{2})(?=\d)/g, '$1 ').trim() : String(v || '');
}

/* Dernières valeurs AUTO-générées (objet + intro) : savoir si Romain a édité à la main. */
let invApercuGenere = { sujet: null, intro: null };

/**
 * (Re)dessine l'aperçu HTML de l'email d'invitation dans l'iframe. L'objet et la phrase d'intro
 * sont ÉDITABLES : mis à jour automatiquement (au fil des cartes Sur place / Réponse) tant que
 * Romain ne les a pas modifiés à la main. Le rendu utilise l'affiche via son URL Drive et une
 * salutation d'exemple (le premier prénom de la liste).
 */
function majApercuInvitation() {
  const objet = document.getElementById('apercu-invitation-objet');
  const intro = document.getElementById('apercu-invitation-intro');
  const rendu = document.getElementById('apercu-invitation-rendu');
  if (!objet || !intro || !rendu) return;
  const g = globalInvitation();
  const gen = { sujet: sujetInvitation(g), intro: introInvitationDefaut(g) };
  if (objet.value === '' || objet.value === invApercuGenere.sujet) objet.value = gen.sujet;
  if (intro.value === '' || intro.value === invApercuGenere.intro) intro.value = gen.intro;
  invApercuGenere = gen;
  const cats = catsInvitationTriees();
  const imgSrc = String(g.tournoi_affiche_id || '').trim() ? urlAffiche(g.tournoi_affiche_id, 800) : '';
  const salut = 'Bonjour ' + echapper(exemplePrenomInvitation()) + ',';
  // Aperçu : liens d'EXEMPLE (les vrais liens, avec jeton, sont construits par club à l'envoi).
  rendu.srcdoc = emailHtmlInvitation(g, cats, imgSrc, salut, intro.value, lienReponseApercu(), lienInvitationApercu());
}

/** URL absolue de la page de réponse (base, sans club/token — le backend les ajoute par club). */
function baseReponseInvitation() {
  const url = new URL('reponse-invitation.html', window.location.href);
  const tn = (configCourante.global && configCourante.global.tournoi_nom) || '';
  if (tn) url.searchParams.set('tournoi', tn);
  return url.toString();
}

/** Lien de réponse d'EXEMPLE pour l'aperçu (jeton fictif, juste pour montrer le bouton). */
function lienReponseApercu() {
  return baseReponseInvitation() + '&club=EXEMPLE&token=EXEMPLE';
}

/** « Régénérer » : réécrit objet + intro depuis les infos du tournoi (écrase les retouches). */
function onRegenererInvitation() {
  const objet = document.getElementById('apercu-invitation-objet');
  const intro = document.getElementById('apercu-invitation-intro');
  if (!objet || !intro) return;
  const g = globalInvitation();
  objet.value = sujetInvitation(g);
  intro.value = introInvitationDefaut(g);
  invApercuGenere = { sujet: objet.value, intro: intro.value };
  majApercuInvitation();
}

/** Objet COURANT de l'aperçu (éventuellement édité), ou le défaut. */
function sujetInvitationCourant() {
  const el = document.getElementById('apercu-invitation-objet');
  const v = el ? el.value.trim() : '';
  return v || sujetInvitation(globalInvitation());
}

/** Phrase d'intro COURANTE (éventuellement éditée), ou le défaut. */
function introInvitationCourant() {
  const el = document.getElementById('apercu-invitation-intro');
  return el ? el.value : introInvitationDefaut(globalInvitation());
}

/** Modèle HTML envoyé au backend : jetons {{SALUTATION}} / {{LIEN_REPONSE}} / {{LIEN_INVITATION}}
 *  + affiche en cid:affiche (si présente). */
function htmlModeleInvitation() {
  const g = globalInvitation();
  const imgSrc = String(g.tournoi_affiche_id || '').trim() ? 'cid:affiche' : '';
  return emailHtmlInvitation(g, catsInvitationTriees(), imgSrc, '{{SALUTATION}}', introInvitationCourant(), '{{LIEN_REPONSE}}', '{{LIEN_INVITATION}}');
}

/** Modèle TEXTE envoyé au backend (fallback), avec les trois mêmes jetons. */
function texteModeleInvitation() {
  return emailTexteInvitation(globalInvitation(), catsInvitationTriees(), '{{SALUTATION}}', introInvitationCourant(), '{{LIEN_REPONSE}}', '{{LIEN_INVITATION}}');
}

/** Vrai si un club est ENCORE invitable (ni Accepté, ni Décliné). */
function estInvitable(statut) {
  return !estAccepte(statut) && !memeTexteSouple(statut, 'Décliné');
}

/** Envoi INDIVIDUEL de l'invitation à un club (même contenu que l'aperçu). */
async function envoyerInvitationClubUI(nom) {
  const club = clubsInvitesCourants.find(function (c) { return memeTexteSouple(c.club_nom, nom); });
  if (!club) return;
  const message = document.getElementById('message-club-invite');
  const email = String(club.club_contact_email || '').trim();
  if (!email) { await dialogAlerter('« ' + nom + ' » n\'a pas d\'email de contact : à inviter manuellement.'); return; }
  const sujet = sujetInvitationCourant();
  if (!sujet) { afficherMessage(message, '⚠️ L\'objet de l\'aperçu ne peut pas être vide.', 'ko'); return; }
  if (!await dialogConfirmer('Envoyer l\'invitation à « ' + nom + ' » (' + email + ') ?', { ok: 'Envoyer' })) return;
  try {
    const res = await ecrireAdmin('envoyerInvitationClub', {
      club_nom: nom, sujet: sujet, html_modele: htmlModeleInvitation(), texte_modele: texteModeleInvitation(),
      base_reponse: baseReponseInvitation(), base_invitation: lienInvitationPublique()
    });
    if (res && res.invitation_envoyee) club.invitation_envoyee = res.invitation_envoyee;
    afficherClubsInvites();
    afficherMessage(message, '✅ Invitation envoyée à ' + email + '.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  }
}

/**
 * Envoi GROUPÉ des invitations : résumé AVANT confirmation (éligibles / sans email / déjà
 * invités), case « Renvoyer aussi » optionnelle, puis envoi tolérant aux pannes côté backend
 * et résumé final (« N envoyées, M échecs : … »).
 */
async function onEnvoyerInvitationsGroupe() {
  const message = document.getElementById('message-invitations');
  const bouton = document.getElementById('bouton-envoyer-invitations');
  const renvoyer = document.getElementById('inv-renvoyer').checked;
  const sujet = sujetInvitationCourant();
  if (!sujet) { afficherMessage(message, '⚠️ L\'objet de l\'aperçu ne peut pas être vide.', 'ko'); return; }

  // Résumé calculé depuis la liste en mémoire (mêmes règles que le backend).
  const invitables = clubsInvitesCourants.filter(function (c) { return estInvitable(c.statut); });
  const avecEmail = invitables.filter(function (c) { return String(c.club_contact_email || '').trim(); });
  const sansEmail = invitables.filter(function (c) { return !String(c.club_contact_email || '').trim(); });
  const deja = avecEmail.filter(function (c) { return String(c.invitation_envoyee || '').trim(); });
  const eligibles = avecEmail.filter(function (c) { return renvoyer || !String(c.invitation_envoyee || '').trim(); });

  if (!eligibles.length) {
    await dialogAlerter('Aucun club à inviter pour le moment.\n\n'
      + sansEmail.length + ' club(s) sans email (à inviter manuellement).\n'
      + deja.length + ' club(s) déjà invité(s)'
      + (renvoyer ? '.' : ' — coche « Renvoyer aussi » pour les relancer.'));
    return;
  }
  const resume = 'Envoyer l\'invitation à ' + eligibles.length + ' club(s) ?\n\n'
    + '• ' + eligibles.length + ' recevront l\'invitation\n'
    + '• ' + sansEmail.length + ' sans email (à inviter manuellement)\n'
    + '• ' + deja.length + ' déjà invité(s) ' + (renvoyer ? '(seront renvoyés)' : '(exclus)');
  if (!await dialogConfirmer(resume, { ok: 'Confirmer l\'envoi' })) return;

  bouton.disabled = true;
  const texte = bouton.textContent;
  bouton.textContent = 'Envoi…';
  afficherMessage(message, 'Envoi en cours…', 'ok');
  try {
    const res = await ecrireAdmin('envoyerInvitationsGroupe', {
      sujet: sujet, html_modele: htmlModeleInvitation(), texte_modele: texteModeleInvitation(),
      base_reponse: baseReponseInvitation(), base_invitation: lienInvitationPublique(),
      renvoyer: renvoyer ? 'oui' : 'non'
    });
    await chargerClubsInvites(); // rafraîchit invitation_envoyee + l'aperçu (exemple prénom)
    const nbOk = (res.envoyes || []).length;
    const ech = res.echecs || [];
    let msg = '✅ ' + nbOk + ' invitation(s) envoyée(s).';
    if (ech.length) msg += ' ⚠️ ' + ech.length + ' échec(s) : ' + ech.map(function (e) { return e.club; }).join(', ') + '.';
    afficherMessage(message, msg, ech.length ? 'ko' : 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texte;
  }
}

/* --------------------------------------------------------------------------
   DOSSIER D'INVITATION — modalités d'inscription, parking & accès,
   encadrement & assurance (paramètres globaux de Config, tous optionnels).
   Chaque carte s'enregistre indépendamment via l'action enregistrerInvitation
   (le backend n'écrit que les champs présents dans la requête).
   -------------------------------------------------------------------------- */

/** Vrai si un paramètre 'oui'/'non' de Config vaut 'oui'. */
function estOui(valeur) {
  return String(valeur || '').toLowerCase() === 'oui';
}

/** Pré-remplit les TROIS cartes du dossier d'invitation avec l'état enregistré. */
function majInvitation() {
  const g = configCourante.global || {};

  // 1) Modalités d'inscription.
  const fm = document.getElementById('form-modalites');
  if (fm) {
    fm.date_limite_confirmation.value = g.date_limite_confirmation || '';
    fm.tarif_engagement_oui.checked = estOui(g.tarif_engagement_oui);
    fm.tarif_engagement_montant.value = g.tarif_engagement_montant || '';
    fm.tarif_engagement_modalites.value = g.tarif_engagement_modalites || '';
    majAffichageTarif(fm);
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(fm);
  }

  // 2) Parking & accès (texte + aperçu de la photo déjà enregistrée sur Drive).
  const fp = document.getElementById('form-parking');
  if (fp) {
    fp.parking_texte.value = g.parking_texte || '';
    parkingDataURI = '';
    const bloc = document.getElementById('apercu-parking');
    const img = document.getElementById('apercu-parking-img');
    if (g.parking_photo_id) {
      img.src = urlAffiche(g.parking_photo_id, 600);
      bloc.hidden = false;
    } else {
      img.removeAttribute('src');
      bloc.hidden = true;
    }
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(fp);
  }

  // 3) Encadrement & assurance.
  const fe = document.getElementById('form-encadrement');
  if (fe) {
    fe.encadrement_ratio.value = g.encadrement_ratio || '';
    fe.encadrement_diplomes.value = g.encadrement_diplomes || '';
    fe.assurance_attestation_requise.checked = estOui(g.assurance_attestation_requise);
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(fe);
  }
}

/** Révèle / masque les champs du tarif selon la case « Tarif d'engagement ». */
function majAffichageTarif(form) {
  document.getElementById('lignes-tarif-engagement').hidden = !form.tarif_engagement_oui.checked;
}

/** Case à cocher de la carte Modalités : met à jour l'affichage conditionnel. */
function onModalitesChange(evenement) {
  if (evenement.target.name === 'tarif_engagement_oui') {
    majAffichageTarif(document.getElementById('form-modalites'));
  }
}

/**
 * Enregistrement générique d'une carte du dossier d'invitation : envoie `data`
 * à enregistrerInvitation, met à jour la config en mémoire, reprend la photo
 * « propre » du formulaire et rafraîchit l'état du dossier.
 */
async function enregistrerCarteInvitation(data, form, bouton, message, texteOk) {
  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerInvitation', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    majDossier(); // les sections du dossier suivent
    afficherMessage(message, texteOk, 'ok');
  });
}

/** Enregistre la carte « Modalités d'inscription ». */
function onEnregistrerModalites() {
  const form = document.getElementById('form-modalites');
  const data = {
    date_limite_confirmation:   form.date_limite_confirmation.value,
    tarif_engagement_oui:       form.tarif_engagement_oui.checked ? 'oui' : 'non',
    tarif_engagement_montant:   form.tarif_engagement_montant.value.trim(),
    tarif_engagement_modalites: form.tarif_engagement_modalites.value.trim()
  };
  return enregistrerCarteInvitation(data, form,
    document.getElementById('bouton-enregistrer-modalites'),
    document.getElementById('message-modalites'),
    '✅ Modalités enregistrées.');
}

/** Enregistre la carte « Encadrement & assurance ». */
function onEnregistrerEncadrement() {
  const form = document.getElementById('form-encadrement');
  const data = {
    encadrement_ratio:             form.encadrement_ratio.value.trim(),
    encadrement_diplomes:          form.encadrement_diplomes.value.trim(),
    assurance_attestation_requise: form.assurance_attestation_requise.checked ? 'oui' : 'non'
  };
  return enregistrerCarteInvitation(data, form,
    document.getElementById('bouton-enregistrer-encadrement'),
    document.getElementById('message-encadrement'),
    '✅ Encadrement & assurance enregistrés.');
}

/** Enregistre la carte « Parking & accès » : le texte, puis la photo si une nouvelle
 *  a été choisie (même enchaînement que les infos du tournoi + l'affiche). */
async function onEnregistrerParking() {
  const form = document.getElementById('form-parking');
  const bouton = document.getElementById('bouton-enregistrer-parking');
  const message = document.getElementById('message-parking');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerInvitation', { parking_texte: form.parking_texte.value.trim() });
    if (parkingDataURI) {
      afficherMessage(message, 'Envoi de la photo…', 'ok');
      await ecrireAdmin('enregistrerPhotoParking', { photo: parkingDataURI });
    }
    // On recharge la config pour refléter ce qui est réellement enregistré (dont la photo).
    configCourante = await lireConfigAdmin();
    majInvitation();
    majDossier();
    form.parking_photo.value = ''; // vide le champ fichier
    afficherMessage(message, '✅ Parking & accès enregistrés.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/** Traite une photo de parking (choisie OU déposée) : redimensionne, aperçu immédiat. */
async function traiterFichierParking(fichier) {
  const message = document.getElementById('message-parking');
  if (!fichier) { parkingDataURI = ''; return; }
  try {
    parkingDataURI = await redimensionnerImage(fichier, 1000, 0.82);
    document.getElementById('apercu-parking-img').src = parkingDataURI;
    document.getElementById('apercu-parking').hidden = false;
  } catch (e) {
    parkingDataURI = '';
    afficherMessage(message, "⚠️ Image illisible. Choisis un fichier image (JPG, PNG…).", 'ko');
  }
}

/**
 * Retire la photo du parking. Deux cas (mêmes règles que l'affiche) :
 *   1) une image vient d'être choisie mais pas encore enregistrée → on annule le choix ;
 *   2) une photo est déjà enregistrée → suppression backend (fichier Drive + Config).
 */
async function onRetirerPhotoParking() {
  const message = document.getElementById('message-parking');
  const form = document.getElementById('form-parking');

  // Cas 1 : choix non enregistré → on annule simplement la sélection.
  if (parkingDataURI) {
    parkingDataURI = '';
    form.parking_photo.value = '';
    majInvitation(); // ré-affiche la photo enregistrée, ou masque l'aperçu si aucune
    afficherMessage(message, 'Choix de photo annulé.', 'ok');
    return;
  }

  // Cas 2 : photo enregistrée → confirmation puis suppression backend.
  if (!(configCourante.global && configCourante.global.parking_photo_id)) return;
  if (!await dialogConfirmer('Retirer la photo du parking ?', { ok: 'Retirer', danger: true })) return;

  const bouton = document.getElementById('bouton-retirer-parking');
  bouton.disabled = true;
  try {
    await ecrireAdmin('supprimerPhotoParking', {});
    configCourante = await lireConfigAdmin();
    majInvitation();
    majDossier();
    afficherMessage(message, '🗑️ Photo du parking retirée.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
  }
}

/* --------------------------------------------------------------------------
   CLUBS INVITÉS — liste des clubs à qui on envoie le dossier d'invitation.
   ⚠️ L'onglet contient des EMAILS : il se lit via l'action listerClubsInvites,
   protégée par la clé admin (jamais dans le snapshot public getAll / CDN).
   -------------------------------------------------------------------------- */

/* Statuts admis (mêmes formes canoniques que le backend). « Confirmé » = ancien libellé
   d'« Accepté » (reconnu par memeTexteSouple pour les données déjà en Sheet). */
const STATUTS_CLUB_INVITE = ['Invité', 'Accepté', 'Décliné'];

/* Nom du club actuellement en ÉDITION inline des coordonnées (Sprint 6, point 6e), ou null. */
let clubEnEdition = null;

/** Vrai si le statut d'un club vaut « Accepté » (ou l'ancien « Confirmé »). */
function estAccepte(statut) {
  return memeTexteSouple(statut, 'Accepté') || memeTexteSouple(statut, 'Confirmé');
}

/** Compare deux textes sans accents ni casse (piège NFC/NFD du Sheet : « Invité »
 *  peut revenir avec un é décomposé — même précaution que estTermine). */
function memeTexteSouple(a, b) {
  function plat(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }
  return plat(a) === plat(b);
}

/** Charge la liste des clubs invités depuis le backend (clé admin) et l'affiche. */
async function chargerClubsInvites() {
  const zone = document.getElementById('liste-clubs-invites');
  if (!zone) return;
  try {
    const res = await ecrireAdmin('listerClubsInvites', {});
    clubsInvitesCourants = (res && res.clubs) || [];
    afficherClubsInvites();
  } catch (erreur) {
    zone.innerHTML = '<p class="vide">⚠️ Impossible de charger les clubs invités : '
      + echapper(erreur.message) + '</p>';
  }
}

/** Pastille d'état d'un statut (couleur portée par une classe CSS). */
function classeStatutClub(statut) {
  if (estAccepte(statut))                  return 'est-accepte';
  if (memeTexteSouple(statut, 'Décliné'))  return 'est-decline';
  return 'est-invite';
}

/** Catégories engagées (texte « U8,U10 » ou JSON) → tableau de noms normalisés (MAJ). */
function parseCatsEngagees(brut) {
  const t = String(brut || '').trim();
  if (!t) return [];
  let liste = null;
  try { const o = JSON.parse(t); if (Array.isArray(o)) liste = o; } catch (e) { /* pas du JSON */ }
  if (!liste) liste = t.split(',');
  return liste.map(function (s) { return String(s).trim().toUpperCase(); }).filter(Boolean);
}

/**
 * Panneau « Accepté » d'un club : cases à cocher des catégories du tournoi (pré-cochées sur
 * toutes par défaut, ou sur categories_engagees si déjà renseigné), champ prénom du contact,
 * bouton d'enregistrement de la sélection, puis — une fois categories_engagees renseigné —
 * bouton « Générer le dossier final ».
 */
function panneauAccepteClub(club, nom) {
  const cats = (configCourante.categories || []).filter(estPresente)
    .slice().sort(function (a, b) { return comparerCategorie(a.categorie, b.categorie); });
  const engBrut = String(club.categories_engagees || '').trim();
  const eng = parseCatsEngagees(engBrut);
  const toutParDefaut = eng.length === 0; // rien encore enregistré → tout coché
  const cases = cats.map(function (c) {
    const val = String(c.categorie || '');
    const coche = toutParDefaut || eng.indexOf(val.toUpperCase()) !== -1;
    return '<label><input type="checkbox" class="club-cat-case" value="' + echapper(val) + '"' +
      (coche ? ' checked' : '') + '> ' + echapper(val) + '</label>';
  }).join('');

  const boutonGenerer = engBrut
    ? '<button class="bouton bouton-generer-dossier" data-club="' + echapper(nom) + '">' + svgIcone('dossier') + 'Générer le dossier final</button>'
    : '';

  return '<div class="club-panneau" data-club="' + echapper(nom) + '">' +
    resumeReponseClub(club) +
    '<p class="club-panneau-titre">Catégories engagées par le club</p>' +
    (cats.length
      ? '<div class="club-cats">' + cases + '</div>'
      : '<p class="vide">Ajoute d\'abord des catégories au tournoi.</p>') +
    '<label class="club-prenom-champ">Prénom du contact (pour la politesse du dossier)' +
      '<input type="text" class="club-prenom-input" value="' + echapper(String(club.club_contact_prenom || '')) + '" ' +
             'placeholder="Ex : Camille" autocomplete="off"></label>' +
    '<div class="club-panneau-actions">' +
      '<button class="bouton bouton-cats-club" data-club="' + echapper(nom) + '">' + svgIcone('enregistrer') + 'Enregistrer la sélection</button>' +
      boutonGenerer +
    '</div>' +
  '</div>';
}

/**
 * Résumé (lecture seule) de la RÉPONSE remontée par le club en libre-service : catégories +
 * nombre d'équipes par catégorie, nombre de joueurs total, date de réponse. '' si rien.
 */
function resumeReponseClub(club) {
  const nbCat = parseCatsEnginesNb(club.nb_equipes_par_categorie);
  const cles = Object.keys(nbCat);
  const joueurs = String(club.nb_joueurs_total || '').trim();
  const dateRep = String(club.date_reponse || '').trim();
  if (!cles.length && !joueurs && !dateRep) return '';

  let lignes = '';
  if (cles.length) {
    const detail = cles.map(function (c) {
      const n = parseInt(nbCat[c], 10);
      return echapper(c) + ' : ' + (isFinite(n) ? n : nbCat[c]) + ' équipe' + (n > 1 ? 's' : '');
    }).join(' · ');
    lignes += '<div class="club-rep-ligne">🏉 ' + detail + '</div>';
  }
  // Éducateurs déclarés (détail par équipe, session 23) — affiché seulement si le club a répondu
  // avec le nouveau formulaire (colonne vide pour les anciennes réponses).
  const educateurs = String(club.nb_educateurs_total || '').trim();
  if (joueurs) {
    lignes += '<div class="club-rep-ligne">👥 ' + echapper(joueurs) + ' joueurs attendus au total' +
      (educateurs ? ' · 🎓 ' + echapper(educateurs) + ' éducateur' + (parseInt(educateurs, 10) > 1 ? 's' : '') : '') +
      '</div>';
  }
  return '<div class="club-reponse">' +
    '<p class="club-reponse-titre">Réponse du club' + (dateRep ? ' (le ' + echapper(dateRep) + ')' : '') + '</p>' +
    lignes + '</div>';
}

/** JSON {"U8":2,…} → objet ; {} si illisible. */
function parseCatsEnginesNb(brut) {
  try { const o = JSON.parse(String(brut || '').trim() || '{}'); return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {}; }
  catch (e) { return {}; }
}

/**
 * Ordre de tri de la liste (Point 5a) :
 *   0 = Accepté ET dossier non envoyé (action requise, en haut)
 *   1 = Invité / sans réponse
 *   2 = Décliné
 *   3 = Accepté ET dossier envoyé (déjà traité, en bas)
 */
function bucketClub(club) {
  const envoye = !!String(club.dossier_envoye || '').trim();
  if (estAccepte(club.statut)) return envoye ? 3 : 0;
  if (memeTexteSouple(club.statut, 'Décliné')) return 2;
  return 1;
}

/** Affiche la liste des clubs invités (triée), avec statut, réponse remontée, panneau, envoi. */
function afficherClubsInvites() {
  const zone = document.getElementById('liste-clubs-invites');
  if (!zone) return;

  if (!clubsInvitesCourants.length) {
    zone.innerHTML = '<p class="vide">Aucun club invité pour le moment. Ajoute le premier ci-dessus.</p>';
    return;
  }

  // Tri : action requise en haut, déjà traités en bas ; à bucket égal, ordre alphabétique.
  const tries = clubsInvitesCourants.slice().sort(function (a, b) {
    const ba = bucketClub(a), bb = bucketClub(b);
    if (ba !== bb) return ba - bb;
    return String(a.club_nom || '').localeCompare(String(b.club_nom || ''), 'fr');
  });

  let html = '';
  tries.forEach(function (club) {
    const nom = String(club.club_nom || '');
    // Ligne en mode ÉDITION inline des coordonnées (Sprint 6, point 6e).
    if (clubEnEdition && memeTexteSouple(nom, clubEnEdition)) { html += htmlClubEdition(club, nom); return; }
    // Contact : « Prénom Nom · email » (les bouts vides sont omis).
    const identite = [club.club_contact_prenom, club.club_contact_nom].filter(Boolean).join(' ');
    const contact = [identite, club.club_contact_email].filter(Boolean).join(' · ');
    const options = STATUTS_CLUB_INVITE.map(function (s) {
      return '<option value="' + echapper(s) + '"' +
        (memeTexteSouple(club.statut, s) || (estAccepte(club.statut) && s === 'Accepté') ? ' selected' : '') +
        '>' + echapper(s) + '</option>';
    }).join('');
    const aEmail = !!String(club.club_contact_email || '').trim();
    const invite = String(club.invitation_envoyee || '').trim();
    const envoye = String(club.dossier_envoye || '').trim();
    const alerte = String(club.alerte_ecart || '').trim();
    // Badges : invitation (Phase 1), dossier (Phase 2), et alerte d'écart d'engagement.
    const badges =
      (invite ? '<span class="club-envoye club-badge-invite" title="Invitation envoyée">✉️ Invité le ' + echapper(invite) + '</span>' : '') +
      (envoye ? '<span class="club-envoye" title="Dossier envoyé">📧 Dossier le ' + echapper(envoye) + '</span>' : '') +
      (alerte ? '<span class="club-alerte-ecart" tabindex="0" role="button" title="' + echapper(alerte) + '" data-club="' + echapper(nom) + '">⚠️ Écart</span>' : '');
    // Bouton d'envoi INDIVIDUEL de l'invitation (désactivé si le club n'a pas d'email).
    const boutonInviter = aEmail
      ? '<button class="bouton-icone bouton-inviter-club" title="Envoyer l\'invitation" aria-label="Envoyer l\'invitation à ' + echapper(nom) + '" data-club="' + echapper(nom) + '">' + svgIcone('email') + '</button>'
      : '<button class="bouton-icone bouton-inviter-club" title="Pas d\'email : à inviter manuellement" aria-label="Pas d\'email" disabled>' + svgIcone('email') + '</button>';

    html +=
      '<div class="equipe-item club-invite-item ' + classeStatutClub(club.statut) + '" data-club="' + echapper(nom) + '">' +
        '<span class="nom">' + echapper(nom) +
          (contact ? '<span class="club-contact">' + echapper(contact) + '</span>' : '') +
        '</span>' +
        '<div class="equipe-actions">' +
          badges +
          boutonInviter +
          '<button class="bouton-icone bouton-editer-club" title="Modifier les coordonnées" aria-label="Modifier les coordonnées de ' + echapper(nom) + '" data-club="' + echapper(nom) + '">' + svgIcone('crayon') + '</button>' +
          '<select class="statut-club" data-club="' + echapper(nom) + '" ' +
                  'aria-label="Statut de ' + echapper(nom) + '">' + options + '</select>' +
          '<button class="bouton-suppr bouton-icone bouton-suppr-club" title="Retirer" aria-label="Retirer" ' +
                  'data-club="' + echapper(nom) + '">' + svgIcone('corbeille') + '</button>' +
        '</div>' +
        // Panneau de sélection des catégories + génération, visible seulement si Accepté.
        (estAccepte(club.statut) ? panneauAccepteClub(club, nom) : '') +
      '</div>';
  });
  zone.innerHTML = html;
  majApercuInvitation(); // l'exemple de prénom de l'aperçu suit la liste
}

/** Ligne d'un club en mode ÉDITION inline des coordonnées (nom + contact). */
function htmlClubEdition(club, nom) {
  const dejaRepondu = String(club.date_reponse || '').trim() !== '';
  const avert = dejaRepondu
    ? '<p class="club-edit-avert">Ce club a déjà répondu à cette adresse : la modifier n\'affecte pas sa réponse déjà enregistrée.</p>'
    : '';
  return '<div class="equipe-item club-invite-item club-en-edition" data-club="' + echapper(nom) + '">' +
      '<div class="club-edit-champs">' +
        '<input class="club-edit-nom" type="text" value="' + echapper(club.club_nom || '') + '" placeholder="Nom du club" aria-label="Nom du club">' +
        '<input class="club-edit-prenom" type="text" value="' + echapper(club.club_contact_prenom || '') + '" placeholder="Prénom du contact" aria-label="Prénom du contact">' +
        '<input class="club-edit-contact" type="text" value="' + echapper(club.club_contact_nom || '') + '" placeholder="Nom du contact" aria-label="Nom du contact">' +
        '<input class="club-edit-email" type="email" value="' + echapper(club.club_contact_email || '') + '" placeholder="Email du contact" aria-label="Email du contact">' +
        avert +
      '</div>' +
      '<div class="equipe-actions">' +
        '<button class="bouton btn-enregistrer-edition" data-club="' + echapper(nom) + '">Enregistrer</button>' +
        '<button class="bouton bouton-discret btn-annuler-edition" data-club="' + echapper(nom) + '">Annuler</button>' +
      '</div>' +
    '</div>';
}

/** Ajoute un club invité (statut initial « Invité », date d'ajout posée par le backend). */
async function onAjouterClubInvite(evenement) {
  evenement.preventDefault();
  const champNom = document.getElementById('champ-club-nom');
  const champContact = document.getElementById('champ-club-contact');
  const champPrenom = document.getElementById('champ-club-prenom');
  const champEmail = document.getElementById('champ-club-email');
  const bouton = document.getElementById('bouton-ajouter-club');
  const message = document.getElementById('message-club-invite');

  // Casse normalisée : MAJUSCULES pour le club + le contact, minuscules pour l'email.
  // (Le nom du club sert à nommer les équipes auto : elles reprennent cette casse exacte.)
  const nom = champNom.value.trim().toUpperCase();
  if (!nom) { afficherMessage(message, 'Indique le nom du club.', 'ko'); return; }

  const doublon = clubsInvitesCourants.some(function (c) { return memeTexteSouple(c.club_nom, nom); });
  if (doublon) {
    afficherMessage(message, '⚠️ « ' + nom + ' » est déjà dans la liste.', 'ko');
    return;
  }

  bouton.disabled = true;
  bouton.textContent = 'Ajout…';
  try {
    await ecrireAdmin('ajouterClubInvite', {
      club_nom: nom,
      club_contact_nom: champContact.value.trim().toUpperCase(),
      club_contact_prenom: champPrenom.value.trim().toUpperCase(),
      club_contact_email: champEmail.value.trim().toLowerCase()
    });
    champNom.value = ''; champContact.value = ''; champPrenom.value = ''; champEmail.value = '';
    champNom.focus();
    afficherMessage(message, '✅ « ' + nom + ' » ajouté (statut : Invité).', 'ok');
    await chargerClubsInvites();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = 'Ajouter';
  }
}

/** Changement de statut via le menu déroulant d'un club (enregistrement immédiat).
 *  Passer à « Accepté » fait apparaître le panneau de sélection des catégories (pré-cochées
 *  sur toutes par défaut). Revenir à « Invité »/« Décliné » CONSERVE categories_engagees. */
async function onChangerStatutClub(evenement) {
  const select = evenement.target.closest('.statut-club');
  if (!select) return;
  const nom = select.getAttribute('data-club');
  const message = document.getElementById('message-club-invite');
  select.disabled = true;
  try {
    await ecrireAdmin('modifierStatutClubInvite', { club_nom: nom, statut: select.value });
    const club = clubsInvitesCourants.find(function (c) { return memeTexteSouple(c.club_nom, nom); });
    if (club) club.statut = select.value;
    afficherClubsInvites(); // pastille + panneau « Accepté » suivent le nouveau statut
    afficherMessage(message, '✅ « ' + nom + ' » → ' + select.value + '.', 'ok');
  } catch (erreur) {
    afficherClubsInvites(); // revient à l'état connu si l'enregistrement a échoué
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  }
}

/** Clic dans la liste des clubs : suppression, envoi d'invitation, catégories, ou génération. */
async function onClicClubsInvites(evenement) {
  const btnSuppr = evenement.target.closest('.bouton-suppr-club');
  if (btnSuppr) return supprimerClubInviteUI(btnSuppr);
  const btnInviter = evenement.target.closest('.bouton-inviter-club');
  if (btnInviter && !btnInviter.disabled) return envoyerInvitationClubUI(btnInviter.getAttribute('data-club'));
  const btnCats = evenement.target.closest('.bouton-cats-club');
  if (btnCats) return enregistrerCatsClub(btnCats);
  const btnGen = evenement.target.closest('.bouton-generer-dossier');
  if (btnGen) return genererDossierFinal(btnGen.getAttribute('data-club'));
  // Édition inline des coordonnées (Sprint 6, point 6e).
  const btnEdit = evenement.target.closest('.bouton-editer-club');
  if (btnEdit) { clubEnEdition = btnEdit.getAttribute('data-club'); afficherClubsInvites(); return; }
  const btnAnnul = evenement.target.closest('.btn-annuler-edition');
  if (btnAnnul) { clubEnEdition = null; afficherClubsInvites(); return; }
  const btnSave = evenement.target.closest('.btn-enregistrer-edition');
  if (btnSave) return enregistrerEditionClub(btnSave.getAttribute('data-club'));
  // Badge d'alerte : afficher le détail complet.
  const badgeAlerte = evenement.target.closest('.club-alerte-ecart');
  if (badgeAlerte) {
    const club = clubsInvitesCourants.find(function (c) { return memeTexteSouple(c.club_nom, badgeAlerte.getAttribute('data-club')); });
    if (club) await dialogAlerter(String(club.alerte_ecart || ''));
    return;
  }
}

/** Enregistre les coordonnées éditées d'un club (nom non vide + email valide). Clé = ancien nom. */
async function enregistrerEditionClub(nomActuel) {
  const message = document.getElementById('message-club-invite');
  const ligne = document.querySelector('.club-en-edition[data-club="' + (window.CSS && CSS.escape ? CSS.escape(nomActuel) : nomActuel) + '"]');
  if (!ligne) return;
  // Même casse qu'à l'ajout : MAJUSCULES pour le club + le contact, minuscules pour l'email.
  const nom = ligne.querySelector('.club-edit-nom').value.trim().toUpperCase();
  const prenom = ligne.querySelector('.club-edit-prenom').value.trim().toUpperCase();
  const contact = ligne.querySelector('.club-edit-contact').value.trim().toUpperCase();
  const email = ligne.querySelector('.club-edit-email').value.trim().toLowerCase();
  if (!nom) { afficherMessage(message, 'Le nom du club ne peut pas être vide.', 'ko'); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    afficherMessage(message, 'Email du contact invalide.', 'ko'); return;
  }
  const btn = ligne.querySelector('.btn-enregistrer-edition');
  btn.disabled = true; btn.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('modifierClubInvite', {
      club_nom_actuel: nomActuel, club_nom: nom,
      club_contact_prenom: prenom, club_contact_nom: contact, club_contact_email: email
    });
    clubEnEdition = null;
    afficherMessage(message, '✅ Coordonnées mises à jour.', 'ok');
    await chargerClubsInvites();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    btn.disabled = false; btn.textContent = 'Enregistrer';
  }
}

/** Retire un club de la liste (confirmation). */
async function supprimerClubInviteUI(bouton) {
  const nom = bouton.getAttribute('data-club');
  const message = document.getElementById('message-club-invite');
  if (!await dialogConfirmer('Retirer le club « ' + nom + ' » de la liste des invités ?',
               { ok: 'Retirer', danger: true })) return;
  bouton.disabled = true;
  try {
    await ecrireAdmin('supprimerClubInvite', { club_nom: nom });
    afficherMessage(message, '🗑️ « ' + nom + ' » retiré.', 'ok');
    await chargerClubsInvites();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
  }
}

/** Enregistre les catégories engagées cochées (+ le prénom du contact) d'un club Accepté. */
async function enregistrerCatsClub(bouton) {
  const nom = bouton.getAttribute('data-club');
  const message = document.getElementById('message-club-invite');
  const panneau = bouton.closest('.club-panneau');
  if (!panneau) return;
  const cochees = Array.prototype.slice.call(panneau.querySelectorAll('.club-cat-case:checked'))
    .map(function (c) { return c.value; });
  const prenomInput = panneau.querySelector('.club-prenom-input');
  const prenom = prenomInput ? prenomInput.value.trim() : '';
  const cats = cochees.join(',');

  bouton.disabled = true;
  const texte = bouton.textContent;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerCategoriesEngagees', {
      club_nom: nom, categories_engagees: cats, club_contact_prenom: prenom
    });
    const club = clubsInvitesCourants.find(function (c) { return memeTexteSouple(c.club_nom, nom); });
    if (club) { club.categories_engagees = cats; club.club_contact_prenom = prenom; }

    // CRÉATION DES ÉQUIPES engagées (idempotente) — déclenchée ICI, à l'enregistrement de la
    // sélection. Les équipes « {club} » / « {club}-N » sont créées dans l'onglet Équipes
    // (source=auto) ; un 2e enregistrement ne crée pas de doublon ; un engagement réduit
    // remonte une alerte (sans rien supprimer).
    let txtEquipes = '';
    try {
      const res = await ecrireAdmin('creerEquipesClub', { club_nom: nom });
      const creees = (res && res.equipes_creees) || [];
      if (creees.length) txtEquipes = ' ' + creees.length + ' équipe(s) créée(s) : '
        + creees.map(function (e) { return e.nom; }).join(', ') + '.';
      if (res && res.alerte) txtEquipes += ' ⚠️ ' + res.alerte;
      if (club) club.alerte_ecart = (res && res.alerte) || '';
      // Recharge la liste des équipes + le tableau de bord (l'étape « Équipes » de la barre
      // latérale se met à jour tout de suite, sans rafraîchir la page).
      if (creees.length && typeof rechargerEquipes === 'function') {
        try { await rechargerEquipes(); } catch (e) { /* best-effort */ }
      }
    } catch (e2) {
      txtEquipes = ' ⚠️ (équipes non créées : ' + e2.message + ')';
    }

    afficherClubsInvites(); // fait apparaître « Générer le dossier final » + badge d'alerte éventuel
    afficherMessage(message, (cochees.length
      ? '✅ « ' + nom + ' » — catégories engagées : ' + cats + '.'
      : '✅ « ' + nom + ' » — sélection enregistrée (aucune catégorie cochée).') + txtEquipes, 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
    bouton.textContent = texte;
  }
}

/** Lien ABSOLU du dossier Phase 2 personnalisé d'un club (dossier-club.html?tournoi=…&club=…&token=…).
 *  Le JETON (club_token) est désormais OBLIGATOIRE : sans lui, le dossier n'affiche plus les
 *  contacts/logistique (protégés côté backend). On le transmet comme le lien de réponse Phase 1. */
function lienDossierClub(nom, token) {
  const url = new URL('dossier-club.html', window.location.href);
  const tn = (configCourante.global && configCourante.global.tournoi_nom) || '';
  if (tn) url.searchParams.set('tournoi', tn);
  url.searchParams.set('club', nom);
  if (token) url.searchParams.set('token', token);
  return url.toString();
}

/**
 * « Générer le dossier final » : construit le lien personnalisé, puis
 *  - si le club a un email → ouvre l'aperçu email avant tout envoi ;
 *  - sinon → bascule en mode « Copier le lien » (pas d'aperçu, pas d'envoi auto).
 * ⚠️ La création des ÉQUIPES ne se fait PAS ici : elle a lieu au clic sur « Enregistrer la
 *    sélection » (voir enregistrerCatsClub).
 */
async function genererDossierFinal(nom) {
  const club = clubsInvitesCourants.find(function (c) { return memeTexteSouple(c.club_nom, nom); });
  if (!club) return;

  // APERÇU / ENVOI du dossier. Le lien porte le jeton personnel du club (accès aux sections
  // contacts/logistique du dossier, protégées par jeton côté backend).
  const email = String(club.club_contact_email || '').trim();
  const lien = lienDossierClub(String(club.club_nom || ''), String(club.club_token || ''));
  if (email) { ouvrirApercuEmail(club, lien); return; }

  // Pas d'email : mode manuel. On copie le lien (best-effort) et on l'affiche pour copie.
  try { if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(lien); } catch (e) { /* copie indispo */ }
  await dialogDemander(
    'Ce club n\'a pas d\'email de contact.\nCopie le lien du dossier ci-dessous et envoie-le manuellement :',
    lien, { ok: 'Fermer' });
}

/* --------------------------------------------------------------------------
   DOSSIER FINAL (Phase 2) — email HTML (MÊME charte que l'invitation).
   Envoyé à UN club « Accepté » au clic sur « Générer le dossier final ». Recense,
   en condensé, l'essentiel du dossier (catégories engagées, modalités, jour J,
   parking, encadrement, contact) et met en avant le LIEN vers le dossier complet
   personnalisé du club. Comme l'invitation : aperçu HTML live (objet + phrase
   d'introduction éditables) puis envoi HTML + version texte de repli.
   -------------------------------------------------------------------------- */

/** Objet par défaut de l'email de dossier final. */
function sujetDossier(g) {
  return 'Votre dossier complet — ' + (String(g.tournoi_nom || '').trim() || 'Tournoi Génération R92');
}

/** Phrase d'introduction par défaut (après la salutation), éditable. */
function introDossierDefaut(g, club) {
  const nom = String(g.tournoi_nom || '').trim() || 'notre tournoi';
  const nomClub = String((club && club.club_nom) || '').trim();
  return 'Nous avons bien reçu votre engagement pour le ' + nom + '. '
    + 'Voici le dossier complet de la journée' + (nomClub ? ' pour ' + nomClub : '')
    + ' : infos pratiques, programme, format sportif, sécurité et contact.';
}

/**
 * Corps HTML de l'email de dossier final (compatible clients mail : tableaux + styles en ligne).
 * Reprend en condensé les sections du dossier club et met en avant le LIEN vers le dossier
 * complet. `salutationHtml` est inséré TEL QUEL ; `imgSrc` = l'affiche (URL Drive en aperçu,
 * « cid:affiche » à l'envoi ; vide = pas d'image). Le dossier étant envoyé à UN club connu, la
 * salutation est déjà personnalisée (pas de jeton, contrairement à l'invitation groupée).
 */
function emailHtmlDossier(g, club, imgSrc, salutationHtml, intro, lienDossier) {
  const A = 'font-family:Arial,Helvetica,sans-serif;';
  const nom = echapper(String(g.tournoi_nom || '').trim() || 'Tournoi Génération R92');
  const date = String(g.tournoi_date || '').trim() ? echapper(formaterDateFr(g.tournoi_date)) : '';

  // En-tête : affiche (optionnelle) + surtitre + nom + date.
  let entete = '';
  if (imgSrc) {
    entete += '<img src="' + echapper(imgSrc) + '" alt="Affiche — ' + nom + '" '
      + 'style="display:block;max-width:180px;width:100%;height:auto;border-radius:6px;margin:0 0 10px;">';
  }
  entete += '<p style="margin:0;' + A + 'text-transform:uppercase;letter-spacing:1px;font-size:12px;color:' + EMAIL_BLEU + ';">Dossier club — Génération R92</p>'
    + '<h1 style="margin:4px 0 2px;' + A + 'font-size:24px;color:' + EMAIL_NAVY + ';">' + nom + '</h1>'
    + (date ? '<p style="margin:0;' + A + 'font-weight:bold;color:' + EMAIL_TXT + ';">' + date + '</p>' : '');

  // Salutation + intro (texte libre multi-lignes : sauts de ligne → <br>).
  const bloc_salut = '<p style="margin:18px 0 4px;' + A + 'font-size:15px;color:' + EMAIL_TXT + ';">' + salutationHtml + '</p>'
    + (String(intro || '').trim() ? '<p style="margin:0;' + A + 'font-size:14px;color:' + EMAIL_TXT + ';text-align:justify;">' + nl2brEmail(intro) + '</p>' : '');

  // Bouton d'ACTION principal : « Voir le dossier complet » (lien personnalisé du club).
  const bouton = lienDossier
    ? '<p style="margin:18px 0 4px;text-align:center;"><a href="' + echapper(lienDossier) + '" '
      + 'style="display:inline-block;background:' + EMAIL_BLEU + ';color:#ffffff;text-decoration:none;'
      + 'border-radius:999px;padding:13px 28px;' + A + 'font-size:15px;font-weight:bold;">Voir le dossier complet</a></p>'
      + '<p style="margin:0 0 4px;text-align:center;' + A + 'font-size:12px;color:' + EMAIL_GRIS + ';">'
      + '(infos pratiques, programme, format sportif, sécurité et contact)</p>'
    : '';

  // Ligne « libellé / valeur » (omise si la valeur est vide) + section-tableau.
  const ligne = function (lib, val) {
    if (!val) return '';
    return '<tr><td style="' + A + 'font-size:13px;color:' + EMAIL_GRIS + ';padding:3px 10px 3px 0;vertical-align:top;">' + echapper(lib) + '</td>'
      + '<td style="' + A + 'font-size:13px;color:' + EMAIL_TXT + ';font-weight:bold;padding:3px 0;">' + echapper(val) + '</td></tr>';
  };
  const bloc = function (titre, lignesHtml) {
    return lignesHtml ? (emailTitreSection(titre)
      + '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' + lignesHtml + '</table>') : '';
  };

  // Modalités d'inscription : catégories engagées + confirmation + tarif (si demandé).
  const engagees = parseCatsEngagees(club && club.categories_engagees).join(' · ');
  const tarifOui = estOui(g.tarif_engagement_oui);
  const modalites = ligne('Catégories engagées', engagees)
    + ligne('Confirmation attendue avant le', String(g.date_limite_confirmation || '').trim() ? formaterDateFr(g.date_limite_confirmation) : '')
    + ligne('Tarif d\'engagement', tarifOui ? String(g.tarif_engagement_montant || '').trim() : '')
    + ligne('Modalités de paiement', tarifOui ? String(g.tarif_engagement_modalites || '').trim() : '');

  // Le jour J, en bref : accueil + fin envisagée.
  const jourJ = ligne('Accueil des équipes', String(g.heure_rdv || '').trim())
    + ligne('Fin envisagée', heureFinCommuniqueeAdmin(g));

  // Parking & accès : texte libre (la photo reste sur le dossier complet).
  const parkingTxt = String(g.parking_texte || '').trim();
  const parking = parkingTxt
    ? emailTitreSection('Parking & accès')
      + '<p style="margin:0;' + A + 'font-size:13px;color:' + EMAIL_TXT + ';text-align:justify;">' + nl2brEmail(parkingTxt) + '</p>'
    : '';

  // Encadrement & assurance.
  const encadrement = ligne('Encadrement', String(g.encadrement_ratio || '').trim())
    + ligne('Diplômes exigés', String(g.encadrement_diplomes || '').trim())
    + ligne('Assurance', estOui(g.assurance_attestation_requise) ? 'Attestation d\'assurance du club à fournir' : '');

  // Votre contact : référent du tournoi.
  const contactParts = [];
  if (String(g.referent_nom || '').trim()) contactParts.push(String(g.referent_nom).trim());
  if (String(g.referent_tel || '').trim()) contactParts.push(telephoneLisibleAdmin(g.referent_tel));
  const contact = ligne('Votre contact', contactParts.join(' · '));

  // Pied : mention + lien de secours vers le dossier complet.
  const pied = '<p style="margin:20px 0 0;padding-top:12px;border-top:1px solid ' + EMAIL_FILET + ';' + A + 'font-size:12px;color:' + EMAIL_GRIS + ';">'
    + 'Génération R92 · École de rugby du Racing 92'
    + (lienDossier ? '<br><a href="' + echapper(lienDossier) + '" style="color:' + EMAIL_BLEU + ';">Voir le dossier complet en ligne</a>' : '')
    + '</p>';

  return '<div style="background:#eef2f7;padding:16px;' + A + '">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-collapse:collapse;">'
    + '<tr><td style="padding:22px 24px;">'
    + '<div style="border-bottom:3px solid ' + EMAIL_NAVY + ';padding-bottom:12px;">' + entete + '</div>'
    + bloc_salut + bouton
    + bloc('Modalités d\'inscription', modalites)
    + bloc('Le jour J, en bref', jourJ)
    + parking
    + bloc('Encadrement & assurance', encadrement)
    + bloc('Votre contact', contact)
    + pied
    + '</td></tr></table></div>';
}

/** Version TEXTE brut de l'email de dossier final (repli anti-spam / clients sans HTML). */
function emailTexteDossier(g, club, salutationTexte, intro, lienDossier) {
  const L = [];
  L.push(salutationTexte);
  L.push('');
  if (String(intro || '').trim()) { L.push(String(intro).trim()); L.push(''); }
  if (lienDossier) { L.push('▶ Voir le dossier complet : ' + lienDossier); L.push(''); }

  const engagees = parseCatsEngagees(club && club.categories_engagees).join(', ');
  const mod = [];
  if (engagees) mod.push('Catégories engagées : ' + engagees);
  if (String(g.date_limite_confirmation || '').trim()) mod.push('Confirmation attendue avant le ' + formaterDateFr(g.date_limite_confirmation));
  if (estOui(g.tarif_engagement_oui) && String(g.tarif_engagement_montant || '').trim()) mod.push('Tarif d\'engagement : ' + String(g.tarif_engagement_montant).trim());
  if (estOui(g.tarif_engagement_oui) && String(g.tarif_engagement_modalites || '').trim()) mod.push('Modalités de paiement : ' + String(g.tarif_engagement_modalites).trim());
  if (mod.length) { L.push('MODALITÉS D\'INSCRIPTION'); mod.forEach(function (m) { L.push('- ' + m); }); L.push(''); }

  const jour = [];
  if (String(g.heure_rdv || '').trim()) jour.push('Accueil : ' + String(g.heure_rdv).trim());
  if (heureFinCommuniqueeAdmin(g)) jour.push('Fin envisagée : ' + heureFinCommuniqueeAdmin(g));
  if (jour.length) { L.push('LE JOUR J : ' + jour.join(' · ')); L.push(''); }

  if (String(g.parking_texte || '').trim()) { L.push('Parking & accès : ' + String(g.parking_texte).trim()); L.push(''); }

  const enc = [];
  if (String(g.encadrement_ratio || '').trim()) enc.push('Encadrement : ' + String(g.encadrement_ratio).trim());
  if (String(g.encadrement_diplomes || '').trim()) enc.push('Diplômes exigés : ' + String(g.encadrement_diplomes).trim());
  if (estOui(g.assurance_attestation_requise)) enc.push('Attestation d\'assurance du club à fournir');
  if (enc.length) { enc.forEach(function (e) { L.push(e); }); L.push(''); }

  const c2 = [];
  if (String(g.referent_nom || '').trim()) c2.push(String(g.referent_nom).trim());
  if (String(g.referent_tel || '').trim()) c2.push(telephoneLisibleAdmin(g.referent_tel));
  if (c2.length) L.push('Contact : ' + c2.join(' · '));
  L.push('');
  L.push('À très bientôt,');
  L.push('Génération R92');
  return L.join('\n');
}

/**
 * Fenêtre d'APERÇU de l'email de dossier final (Phase 2), AVANT tout envoi — MÊME principe que
 * l'aperçu de l'invitation (rendu HTML réel dans une iframe) :
 *  - Destinataire (lecture seule) = email de contact du club ;
 *  - Objet pré-rempli, modifiable ;
 *  - Phrase d'introduction pré-remplie, modifiable (le reste des sections est généré des infos) ;
 *  - Aperçu HTML LIVE qui suit la frappe.
 * « Envoyer » déclenche l'envoi réel HTML (envoyerDossierEmail avec html_modele + texte_modele) ;
 * dossier_envoye n'est posé qu'en cas de succès. « Annuler » ferme sans rien envoyer.
 */
function ouvrirApercuEmail(club, lien) {
  const nom = String(club.club_nom || '');
  const email = String(club.club_contact_email || '');
  const prenom = String(club.club_contact_prenom || '').trim();
  const g = configCourante.global || {};
  const salutHtml = prenom ? 'Bonjour ' + echapper(prenom) + ',' : 'Bonjour,';
  const salutTexte = prenom ? 'Bonjour ' + prenom + ',' : 'Bonjour,';
  const sujetDefaut = sujetDossier(g);
  const introDefaut = introDossierDefaut(g, club);
  // Affiche : URL Drive pour l'aperçu, « cid:affiche » (image inline) pour l'envoi.
  const imgApercu = String(g.tournoi_affiche_id || '').trim() ? urlAffiche(g.tournoi_affiche_id, 800) : '';
  const imgModele = String(g.tournoi_affiche_id || '').trim() ? 'cid:affiche' : '';

  const overlay = document.createElement('div');
  overlay.className = 'eml-overlay';
  overlay.innerHTML =
    '<div class="eml-carte eml-carte-large" role="dialog" aria-modal="true">' +
      '<h2 class="eml-titre">Aperçu de l\'email — ' + echapper(nom) + '</h2>' +
      '<p class="eml-msg" id="eml-msg"></p>' +
      '<label class="eml-champ">Destinataire' +
        '<input type="email" id="eml-dest" value="' + echapper(email) + '" readonly></label>' +
      '<label class="eml-champ">Objet' +
        '<input type="text" id="eml-sujet" value="' + echapper(sujetDefaut) + '"></label>' +
      '<label class="eml-champ">Phrase d\'introduction' +
        '<textarea id="eml-intro" rows="3">' + echapper(introDefaut) + '</textarea></label>' +
      '<p class="eml-apercu-label">Les sections ci-dessous (modalités, jour J, encadrement, contact) ' +
        'sont générées à partir des infos du tournoi. Aperçu du <strong>rendu réel</strong> :</p>' +
      '<iframe id="eml-apercu" class="eml-iframe" title="Aperçu du rendu de l\'email"></iframe>' +
      '<div class="eml-actions">' +
        '<button type="button" class="bouton bouton-doux" id="eml-annuler">Annuler</button>' +
        '<button type="button" class="bouton" id="eml-envoyer">' + svgIcone('email') + 'Envoyer</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  const iframe = overlay.querySelector('#eml-apercu');
  const champSujet = overlay.querySelector('#eml-sujet');
  const champIntro = overlay.querySelector('#eml-intro');
  const rafraichir = function () {
    iframe.srcdoc = emailHtmlDossier(g, club, imgApercu, salutHtml, champIntro.value, lien);
  };
  rafraichir();
  champIntro.addEventListener('input', rafraichir);

  const fermer = function () { overlay.remove(); };
  overlay.addEventListener('click', function (e) { if (e.target === overlay) fermer(); });
  overlay.querySelector('#eml-annuler').addEventListener('click', fermer);

  overlay.querySelector('#eml-envoyer').addEventListener('click', async function () {
    const boutonEnvoi = overlay.querySelector('#eml-envoyer');
    const msg = overlay.querySelector('#eml-msg');
    const sujet = champSujet.value.trim();
    const intro = champIntro.value;
    msg.className = 'eml-msg';
    if (!sujet) { msg.className = 'eml-msg ko'; msg.textContent = '⚠️ L\'objet est vide.'; return; }

    boutonEnvoi.disabled = true;
    const texte = boutonEnvoi.textContent;
    boutonEnvoi.textContent = 'Envoi…';
    msg.className = 'eml-msg';
    msg.textContent = 'Envoi en cours…';
    try {
      const res = await ecrireAdmin('envoyerDossierEmail', {
        club_nom: nom, sujet: sujet,
        html_modele: emailHtmlDossier(g, club, imgModele, salutHtml, intro, lien),
        texte_modele: emailTexteDossier(g, club, salutTexte, intro, lien)
      });
      // Succès : dossier_envoye posé côté serveur (uniquement en cas de succès).
      const c = clubsInvitesCourants.find(function (x) { return memeTexteSouple(x.club_nom, nom); });
      if (c && res && res.dossier_envoye) c.dossier_envoye = res.dossier_envoye;
      afficherClubsInvites();
      afficherMessage(document.getElementById('message-club-invite'),
        '✅ Dossier envoyé à ' + email + '.', 'ok');
      fermer();
    } catch (erreur) {
      // Échec : dossier_envoye NON posé → on garde la fenêtre pour relancer.
      msg.className = 'eml-msg ko';
      msg.textContent = '⚠️ ' + erreur.message;
      boutonEnvoi.disabled = false;
      boutonEnvoi.textContent = texte;
    }
  });
}
