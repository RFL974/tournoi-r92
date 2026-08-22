/**
 * ============================================================================
 *  ADMIN — INFOS DU TOURNOI, CONTACTS & PUBLICATION (extrait de admin.js)
 * ============================================================================
 *  Cartes de contenu du tournoi et publication, sorties du monolithe admin.js
 *  SANS changement de comportement :
 *   - Infos du tournoi (nom/date/lieu/description) + affiche + aperçu LIVE de la
 *     carte d'actualité et de la page d'article du site vitrine ;
 *   - Contacts & sécurité, « Sur place », « Réponse à l'invitation » ;
 *   - État des sections du dossier club ; publication / masquage du tournoi.
 *
 *  Porte aussi quelques HELPERS partagés utilisés par d'autres modules (restent
 *  globaux, résolus au moment de l'appel) : urlAffiche, redimensionnerImage,
 *  brancherZoneImage (zones d'image affiche/parking), normaliserTelephone, estPublie.
 *
 *  Dépend de globaux d'admin.js (configCourante, ecrireAdmin, apiGet, majDossier,
 *  majApercuInvitation, rechargerEtRendre, dialog*…) accédés au moment de l'appel.
 *  Chargé après admin.js dans admin.html.
 * ============================================================================
 */

/* --------------------------------------------------------------------------
   INFOS DU TOURNOI (nom / date / lieu / description) — pour la carte + l'article
   -------------------------------------------------------------------------- */

/** Pré-remplit le formulaire des infos du tournoi avec ce qui est déjà enregistré. */
function majInfosTournoi() {
  const form = document.getElementById('form-infos-tournoi');
  if (!form) return;
  const g = configCourante.global || {};
  form.tournoi_nom.value = g.tournoi_nom || '';
  form.tournoi_lieu.value = g.tournoi_lieu || '';
  form.tournoi_adresse.value = g.tournoi_adresse || '';
  form.tournoi_description.value = g.tournoi_description || '';

  // Date + zone de vacances : elles vivent dans la carte « Date & conformité FFR »
  // (#form-cadre-tournoi), pas ici. On les (re)remplit là-bas et on marque ce formulaire propre.
  const cadre = document.getElementById('form-cadre-tournoi');
  if (cadre) {
    if (cadre.tournoi_date)  cadre.tournoi_date.value = g.tournoi_date || '';
    if (cadre.zone_vacances) cadre.zone_vacances.value = g.zone_vacances || 'C'; // défaut 'C' (migration douce)
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(cadre);
  }

  // Aperçu de l'affiche déjà enregistrée (image Drive publique).
  afficheDataURI = '';
  const bloc = document.getElementById('apercu-affiche');
  const img = document.getElementById('apercu-affiche-img');
  if (g.tournoi_affiche_id) {
    img.src = urlAffiche(g.tournoi_affiche_id, 600);
    bloc.hidden = false;
  } else {
    img.removeAttribute('src');
    bloc.hidden = true;
  }

  // Formulaire (re)rempli avec l'état ENREGISTRÉ → nouvelle référence pour le
  // détecteur de « modifications non enregistrées » de l'assistant.
  if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);

  majApercuTournoi(); // l'aperçu « carte du site » suit les infos affichées
  // Conformité FFR : (re)vérifie dès que les infos (dont la date) sont (re)chargées.
  if (typeof majConformiteFFR === 'function') majConformiteFFR();
}

/* urlAffiche(), brancherZoneImage() et redimensionnerImage() — helpers partagés — sont
   désormais dans admin.js (noyau), utilisés aussi par admin-invitations.js (parking). */

/* --------------------------------------------------------------------------
   APERÇU DE PUBLICATION — réplique EXACTE de la carte d'actualité du site
   vitrine (BoutiqueR92, main.js → actuTournoi/rendreActus) : mêmes textes de
   repli, même extrait à 160 caractères, même format de date. Mise à jour en
   direct pendant la saisie (écouteur input posé dans initAdmin).
   -------------------------------------------------------------------------- */

/** Date « 22 juillet 2026 » — même formatage que le site vitrine (formaterDate). */
function formaterDateFr(dateISO) {
  const d = new Date(dateISO);
  if (isNaN(d)) return dateISO;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Coupe un texte au dernier mot entier avant `max` caractères — même règle
 *  que le site vitrine (extraitCourt), pour un aperçu au caractère près.
 *  Comme sur le site, les sauts de ligne saisis deviennent de simples espaces :
 *  l'extrait d'une carte est une accroche, pas une mise en page (celle-ci est
 *  respectée sur la page d'article, cf. .vp-texte / #art-description). */
function extraitCourt(texte, max) {
  const t = String(texte || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const coupe = t.slice(0, max);
  return coupe.slice(0, coupe.lastIndexOf(' ') > 0 ? coupe.lastIndexOf(' ') : max).trim() + '…';
}

/** (Re)dessine les DEUX aperçus — la carte d'actualité (#apercu-site) et la
 *  page de l'événement (#apercu-page, celle qui s'ouvre au clic sur la carte) —
 *  à partir des valeurs ACTUELLES du formulaire (même pas encore enregistrées)
 *  et de l'affiche (choisie à l'instant, ou déjà enregistrée sur Drive). */
function majApercuTournoi() {
  const zone = document.getElementById('apercu-site');
  const form = document.getElementById('form-infos-tournoi');
  if (!zone || !form) return;
  const g = configCourante.global || {};
  // La date vit dans la carte « Date & conformité FFR » (#form-cadre-tournoi) : on la lit par NOM.
  const champDate = document.querySelector('[name="tournoi_date"]');
  const dateSaisie = champDate ? champDate.value : '';

  // Mêmes valeurs de repli que le site vitrine (actuTournoi, main.js).
  const nom = form.tournoi_nom.value.trim() || 'Le tournoi';
  const dateISO = dateSaisie || new Date().toISOString().slice(0, 10);
  const extrait = extraitCourt(form.tournoi_description.value, 160) ||
    'Le tournoi est ouvert ! Poules, planning et scores en direct.';
  const imgSrc = afficheDataURI || (g.tournoi_affiche_id ? urlAffiche(g.tournoi_affiche_id, 800) : '');

  zone.innerHTML =
    '<article class="vitrine-carte">' +
      (imgSrc
        ? '<img src="' + echapper(imgSrc) + '" alt="' + echapper(nom) + '">'
        : '<div class="vitrine-img-vide">Sans affiche : image par défaut du site</div>') +
      '<div class="vitrine-carte-corps">' +
        '<span class="vitrine-carte-date">' + echapper(formaterDateFr(dateISO)) + '</span>' +
        '<h3>' + echapper(nom) + '</h3>' +
        '<p>' + echapper(extrait) + '</p>' +
        '<span class="vitrine-btn">Découvrir le tournoi</span>' +
      '</div>' +
    '</article>';

  // — La page de l'événement (réplique de tournoi.html du site vitrine :
  //   bandeau navy, Présentation + affiche, section sombre « Infos pratiques »).
  //   Mêmes textes de repli que chargerArticleTournoi (main.js du site).
  const pageZone = document.getElementById('apercu-page');
  if (pageZone) {
    const description = form.tournoi_description.value.trim() ||
      'Suivez notre tournoi et encouragez nos équipes !';
    const quand = dateSaisie ? formaterDateFr(dateSaisie) : 'À venir';
    const ou = form.tournoi_lieu.value.trim() || 'À préciser';
    pageZone.innerHTML =
      '<div class="vitrine-page">' +
        '<div class="vp-bandeau">' +
          '<p class="vp-sous-titre">Actualité · Tournoi</p>' +
          '<h3 class="vp-titre">' + echapper(nom) + '</h3>' +
        '</div>' +
        '<div class="vp-section">' +
          '<p class="vp-sous-titre">Le tournoi</p>' +
          '<h4 class="vp-titre-section">Présentation</h4>' +
          '<p class="vp-texte">' + echapper(description) + '</p>' +
          (imgSrc ? '<img class="vp-affiche" src="' + echapper(imgSrc) + '" alt="Affiche — ' + echapper(nom) + '">' : '') +
        '</div>' +
        '<div class="vp-sombre">' +
          '<p class="vp-sous-titre">Pratique</p>' +
          '<h4 class="vp-titre-section est-blanc">Infos pratiques</h4>' +
          '<ul class="vp-points">' +
            '<li><strong>Quand :</strong> ' + echapper(quand) + '.</li>' +
            '<li><strong>Où :</strong> ' + echapper(ou) + '.</li>' +
          '</ul>' +
          '<div class="vp-boutons">' +
            '<span class="vitrine-btn">Voir le tournoi en direct</span>' +
            '<span class="vitrine-btn">Ajouter à mon agenda</span>' +
            '<span class="vitrine-btn">On y va !</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  const legende = document.getElementById('apercu-site-legende');
  if (legende) {
    legende.textContent = estPublie()
      ? '🟢 Tournoi publié : cette carte et cette page sont visibles sur le site.'
      : '⚪️ Tournoi non publié : la carte et la page apparaîtront après la publication.';
  }
}

/** Traite un fichier d'affiche (choisi OU déposé) : redimensionne, aperçu immédiat. */
async function traiterFichierAffiche(fichier) {
  const message = document.getElementById('message-infos-tournoi');
  if (!fichier) { afficheDataURI = ''; return; }
  try {
    afficheDataURI = await redimensionnerImage(fichier, 1000, 0.82);
    const bloc = document.getElementById('apercu-affiche');
    document.getElementById('apercu-affiche-img').src = afficheDataURI;
    bloc.hidden = false;
    majApercuTournoi(); // la carte + la page du site montrent la nouvelle affiche
  } catch (e) {
    afficheDataURI = '';
    afficherMessage(message, "⚠️ Image illisible. Choisis un fichier image (JPG, PNG…).", 'ko');
  }
}

/**
 * Retire l'affiche. Deux cas :
 *   1) une image vient d'être choisie mais pas encore enregistrée → on annule le choix (local) ;
 *   2) une affiche est déjà enregistrée → suppression backend (fichier Drive + Config).
 */
async function onRetirerAffiche() {
  const message = document.getElementById('message-infos-tournoi');
  const form = document.getElementById('form-infos-tournoi');

  // Cas 1 : choix non enregistré → on annule simplement la sélection.
  if (afficheDataURI) {
    afficheDataURI = '';
    form.tournoi_affiche.value = '';
    majInfosTournoi(); // ré-affiche l'affiche enregistrée, ou masque l'aperçu si aucune
    afficherMessage(message, "Choix d'affiche annulé.", 'ok');
    return;
  }

  // Cas 2 : affiche enregistrée → confirmation puis suppression backend.
  if (!(configCourante.global && configCourante.global.tournoi_affiche_id)) return;
  if (!await dialogConfirmer("Retirer l'affiche du tournoi ?", { ok: 'Retirer', danger: true })) return;

  const bouton = document.getElementById('bouton-retirer-affiche');
  bouton.disabled = true;
  try {
    await ecrireAdmin('supprimerAffiche', {});
    configCourante = await lireConfigAdmin();
    majInfosTournoi();
    afficherMessage(message, '🗑️ Affiche retirée.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
  }
}

/** Lit les infos SITE saisies (nom / lieu / adresse / description).
 *  La date et la zone (contrôle FFR) ont leur propre carte et leur propre enregistrement
 *  (lireCadreTournoi / onEnregistrerCadre) — enregistrement partiel, elles ne sont PAS ici. */
function lireInfosTournoi() {
  const form = document.getElementById('form-infos-tournoi');
  return {
    tournoi_nom: form.tournoi_nom.value.trim(),
    tournoi_lieu: form.tournoi_lieu.value.trim(),
    tournoi_adresse: form.tournoi_adresse.value.trim(),
    tournoi_description: form.tournoi_description.value.trim()
  };
}

/** Lit la date + la zone de vacances de la carte « Date & conformité FFR ». */
function lireCadreTournoi() {
  const form = document.getElementById('form-cadre-tournoi');
  return {
    tournoi_date: (form && form.tournoi_date) ? form.tournoi_date.value : '',
    zone_vacances: (form && form.zone_vacances && form.zone_vacances.value) ? form.zone_vacances.value : 'C'
  };
}

/**
 * Enregistre UNIQUEMENT la date prévue + la zone de vacances (carte « Date & conformité FFR »).
 * Sauvegarde PARTIELLE : le backend n'écrit que les champs envoyés (ecrireChampsConfig), donc les
 * infos du site (nom/lieu/…) ne sont pas touchées.
 */
async function onEnregistrerCadre() {
  const message = document.getElementById('message-cadre-tournoi');
  const bouton = document.getElementById('bouton-enregistrer-cadre');
  await avecBoutonOccupe(bouton, message, async function () {
    afficherMessage(message, 'Enregistrement de la date…', 'ok');
    await ecrireAdmin('enregistrerInfosTournoi', lireCadreTournoi());
    // On recharge la config pour refléter l'état réel, puis on rafraîchit ce qui dépend de la date.
    configCourante = await lireConfigAdmin();
    majInfosTournoi(); // remet date/zone à l'état enregistré (+ marque les formulaires propres)
    majDossier();      // le dossier club montre la date
    afficherMessage(message, '✅ Date & zone enregistrées.', 'ok');
  });
}

/**
 * Enregistre les infos du tournoi (nom/date/lieu/description + affiche éventuelle),
 * indépendamment de la publication. Utilisable à tout moment, même après publication
 * (pour corriger une faute de frappe sans avoir à dépublier).
 */
async function onEnregistrerInfos() {
  const message = document.getElementById('message-infos-tournoi');
  const bouton = document.getElementById('bouton-enregistrer-infos');
  await avecBoutonOccupe(bouton, message, async function () {
    afficherMessage(message, 'Enregistrement des infos…', 'ok');
    await ecrireAdmin('enregistrerInfosTournoi', lireInfosTournoi());
    if (afficheDataURI) {
      afficherMessage(message, "Envoi de l'affiche…", 'ok');
      await ecrireAdmin('enregistrerAffiche', { affiche: afficheDataURI });
    }
    // On recharge la config pour refléter ce qui est réellement enregistré (dont l'affiche).
    configCourante = await lireConfigAdmin();
    majInfosTournoi();
    majDossier(); // le dossier club reflète les nouvelles infos
    document.getElementById('form-infos-tournoi').tournoi_affiche.value = ''; // vide le champ fichier
    afficherMessage(message, '✅ Infos enregistrées.', 'ok');
  });
}

/* --------------------------------------------------------------------------
   CONTACTS & SÉCURITÉ (référent tournoi, poste de secours, référent sécurité)
   — paramètres globaux de Config destinés au futur dossier club.
   -------------------------------------------------------------------------- */

/**
 * Normalise un numéro de téléphone : espaces, points et tirets retirés.
 * Renvoie les 10 chiffres, ou '' si le résultat n'est pas un numéro à 10 chiffres.
 * (Même règle que le backend, pour refuser AVANT l'envoi et guider la correction.)
 */
function normaliserTelephone(valeur) {
  const chiffres = String(valeur || '').replace(/[\s.\-]/g, '');
  return /^\d{10}$/.test(chiffres) ? chiffres : '';
}

/** Pré-remplit le formulaire Contacts & sécurité avec ce qui est déjà enregistré. */
function majContactsSecurite() {
  const form = document.getElementById('form-contacts-securite');
  if (!form) return;
  const g = configCourante.global || {};
  form.referent_nom.value = g.referent_nom || '';
  form.referent_tel.value = g.referent_tel || '';
  form.securite_secours_oui.checked = String(g.securite_secours_oui).toLowerCase() === 'oui';
  form.securite_secours_precisions.value = g.securite_secours_precisions || '';
  // Référent sécurité identique au référent tournoi PAR DÉFAUT : seul 'non' décoche.
  form.securite_referent_identique.checked =
    String(g.securite_referent_identique || 'oui').toLowerCase() !== 'non';
  form.securite_referent_nom.value = g.securite_referent_nom || '';
  form.securite_referent_tel.value = g.securite_referent_tel || '';
  majAffichageContacts(form);
  // Formulaire (re)rempli avec l'état ENREGISTRÉ → référence pour le détecteur
  // de « modifications non enregistrées » de l'assistant.
  if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
}

/** Révèle / masque les champs conditionnels selon les cases à cocher. */
function majAffichageContacts(form) {
  document.getElementById('ligne-secours-precisions').hidden = !form.securite_secours_oui.checked;
  document.getElementById('lignes-referent-securite').hidden = form.securite_referent_identique.checked;
}

/** Cases à cocher du formulaire Contacts & sécurité : met à jour l'affichage conditionnel. */
function onContactsChange(evenement) {
  const nom = evenement.target.name;
  if (nom === 'securite_secours_oui' || nom === 'securite_referent_identique') {
    majAffichageContacts(document.getElementById('form-contacts-securite'));
  }
}

/** Lit les valeurs du formulaire Contacts & sécurité (booléens rangés en 'oui'/'non'). */
function lireContactsSecurite() {
  const form = document.getElementById('form-contacts-securite');
  return {
    referent_nom:                form.referent_nom.value.trim(),
    referent_tel:                form.referent_tel.value.trim(),
    securite_secours_oui:        form.securite_secours_oui.checked ? 'oui' : 'non',
    securite_secours_precisions: form.securite_secours_precisions.value.trim(),
    securite_referent_identique: form.securite_referent_identique.checked ? 'oui' : 'non',
    securite_referent_nom:       form.securite_referent_nom.value.trim(),
    securite_referent_tel:       form.securite_referent_tel.value.trim()
  };
}

/** Enregistre les contacts & sécurité (avec validation des téléphones : 10 chiffres). */
async function onEnregistrerContacts() {
  const message = document.getElementById('message-contacts-securite');
  const bouton = document.getElementById('bouton-enregistrer-contacts');
  const data = lireContactsSecurite();

  // Téléphones : espaces, points et tirets acceptés à la saisie, retirés à l'enregistrement.
  const tels = [['referent_tel', 'Référent tournoi'], ['securite_referent_tel', 'Référent sécurité']];
  for (let i = 0; i < tels.length; i++) {
    const cle = tels[i][0];
    if (!data[cle]) continue; // champ vide = optionnel, accepté
    const norme = normaliserTelephone(data[cle]);
    if (!norme) {
      afficherMessage(message, '⚠️ Téléphone « ' + tels[i][1] + ' » invalide : 10 chiffres attendus.', 'ko');
      return;
    }
    data[cle] = norme;
  }

  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerContactsSecurite', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    majContactsSecurite(); // ré-affiche les numéros normalisés + reprend la photo « propre »
    majDossier();          // les sections Sécurité / Contact du dossier suivent
    afficherMessage(message, '✅ Contacts & sécurité enregistrés.', 'ok');
  });
}

/* --------------------------------------------------------------------------
   PHASE 1 — carte « Sur place » (buvette / sandwich / boutique)
   et carte « Réponse à l'invitation » (date limite + contact référent).
   -------------------------------------------------------------------------- */

/** Pré-remplit la carte « Sur place » avec l'état enregistré. */
function majSurPlace() {
  const form = document.getElementById('form-surplace');
  if (!form) return;
  const g = configCourante.global || {};
  form.buvette_disponible.checked = estOui(g.buvette_disponible);
  form.espace_sandwich_disponible.checked = estOui(g.espace_sandwich_disponible);
  form.boutique_disponible.checked = estOui(g.boutique_disponible);
  if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
}

/** Enregistre la carte « Sur place » (3 booléens rangés en 'oui'/'non'). */
async function onEnregistrerSurPlace() {
  const message = document.getElementById('message-surplace');
  const bouton = document.getElementById('bouton-enregistrer-surplace');
  const form = document.getElementById('form-surplace');
  const data = {
    buvette_disponible:         form.buvette_disponible.checked ? 'oui' : 'non',
    espace_sandwich_disponible: form.espace_sandwich_disponible.checked ? 'oui' : 'non',
    boutique_disponible:        form.boutique_disponible.checked ? 'oui' : 'non'
  };
  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerSurPlace', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    majApercuInvitation(); // l'aperçu de l'email suit (ligne « Sur place »)
    afficherMessage(message, '✅ « Sur place » enregistré.', 'ok');
  });
}

/** Pré-remplit la carte « Réponse à l'invitation » avec l'état enregistré. */
function majReponse() {
  const form = document.getElementById('form-reponse');
  if (!form) return;
  const g = configCourante.global || {};
  form.date_limite_reponse.value = g.date_limite_reponse || '';
  form.contact_reponse_nom.value = g.contact_reponse_nom || '';
  form.contact_reponse_tel.value = g.contact_reponse_tel || '';
  form.contact_reponse_email.value = g.contact_reponse_email || '';
  form.email_expediteur.value = g.email_expediteur || '';
  if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
}

/** Rappel visuel « au moins un des deux » (tél / email) au blur des champs de contact. */
function onReponseBlur(evenement) {
  const nom = evenement.target && evenement.target.name;
  if (nom !== 'contact_reponse_tel' && nom !== 'contact_reponse_email') return;
  const form = document.getElementById('form-reponse');
  const message = document.getElementById('message-reponse');
  const tel = form.contact_reponse_tel.value.trim();
  const email = form.contact_reponse_email.value.trim();
  if (!tel && !email) {
    afficherMessage(message, 'ℹ️ Renseigne au moins un contact : téléphone ou email.', 'ko');
  } else if (message.textContent.indexOf('au moins un contact') !== -1) {
    afficherMessage(message, '', 'ok'); // efface le rappel une fois un contact saisi
  }
}

/**
 * Enregistre la carte « Réponse à l'invitation ». Validation côté client (miroir du backend) :
 * date AAAA-MM-JJ, téléphone 10 chiffres, emails valides, et AU MOINS un contact (tél OU email).
 */
async function onEnregistrerReponse() {
  const message = document.getElementById('message-reponse');
  const bouton = document.getElementById('bouton-enregistrer-reponse');
  const form = document.getElementById('form-reponse');
  const data = {
    date_limite_reponse:   form.date_limite_reponse.value,
    contact_reponse_nom:   form.contact_reponse_nom.value.trim(),
    contact_reponse_tel:   form.contact_reponse_tel.value.trim(),
    contact_reponse_email: form.contact_reponse_email.value.trim(),
    email_expediteur:      form.email_expediteur.value.trim()
  };

  // Validation « au moins un des deux » AVANT l'envoi (message immédiat, pas d'aller-retour).
  if (!data.contact_reponse_tel && !data.contact_reponse_email) {
    afficherMessage(message, '⚠️ Renseigne au moins un contact de réponse : téléphone OU email.', 'ko');
    return;
  }
  if (data.contact_reponse_tel) {
    const norme = normaliserTelephone(data.contact_reponse_tel);
    if (!norme) {
      afficherMessage(message, '⚠️ Téléphone du contact invalide : 10 chiffres attendus.', 'ko');
      return;
    }
    data.contact_reponse_tel = norme;
  }
  const emailInvalide = function (v) { return v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
  if (emailInvalide(data.contact_reponse_email)) {
    afficherMessage(message, '⚠️ Email du contact invalide.', 'ko');
    return;
  }
  if (emailInvalide(data.email_expediteur)) {
    afficherMessage(message, '⚠️ Email expéditeur invalide.', 'ko');
    return;
  }

  await avecBoutonOccupe(bouton, message, async function () {
    await ecrireAdmin('enregistrerReponseInvitation', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    majReponse(); // ré-affiche le numéro normalisé
    majApercuInvitation(); // l'aperçu de l'email suit (date limite de réponse)
    afficherMessage(message, '✅ « Réponse à l\'invitation » enregistrée.', 'ok');
  });
}

/* Le sous-système « Invitation & clubs invités » (aperçu email + envoi, dossier d'invitation,
   liste/édition des clubs invités) est désormais dans admin-invitations.js — chargé après
   admin.js dans admin.html. Extrait tel quel, sans changement de comportement. */

/* --------------------------------------------------------------------------
   DOSSIER CLUB — état des sections du dossier (page dossier-club.html)
   -------------------------------------------------------------------------- */

/**
 * Affiche, dans la carte « Dossier club », quelles sections du dossier apparaîtront
 * avec les données actuelles (les sections vides sont masquées à la génération).
 * Pur affichage informatif : rien n'est bloquant, le dossier se génère toujours.
 */
function majDossier() {
  const zone = document.getElementById('etat-dossier');
  if (!zone) return;
  const g = configCourante.global || {};
  const cats = (configCourante.categories || []).filter(estPresente);
  const oui = function (v) { return String(v || '').toLowerCase() === 'oui'; };

  const sections = [
    ['Présentation', !!(g.tournoi_nom || g.tournoi_description)],
    ['Infos pratiques (lieu, adresse)', !!(g.tournoi_lieu || g.tournoi_adresse)],
    ['Programme (RDV, coup d\'envoi, pause, fin)', !!(g.heure_rdv || g.heure_debut || g.pause_dejeuner_debut || g.heure_fin_communiquee)],
    ['Format sportif (' + cats.length + ' catégorie' + (cats.length > 1 ? 's' : '') + ')', cats.length > 0],
    ['Modalités d\'inscription (date limite, tarif)', !!(g.date_limite_confirmation || oui(g.tarif_engagement_oui))],
    ['Parking & accès (texte, photo)', !!(g.parking_texte || g.parking_photo_id)],
    ['Encadrement & assurance', !!(g.encadrement_ratio || g.encadrement_diplomes || oui(g.assurance_attestation_requise))],
    ['Sécurité (poste de secours, référent)', oui(g.securite_secours_oui) || !!(g.referent_nom || g.securite_referent_nom)],
    ['Contact (référent tournoi)', !!(g.referent_nom || g.referent_tel)],
    ['Agenda .ics / itinéraire', !!(g.tournoi_date && (g.tournoi_adresse || g.tournoi_lieu))]
  ];

  zone.innerHTML = '<ul class="dossier-etat">' + sections.map(function (s) {
    return '<li class="' + (s[1] ? 'est-ok' : 'est-vide') + '">' +
      (s[1] ? '✅ ' : '⚪️ ') + echapper(s[0]) +
      (s[1] ? '' : ' <span class="dossier-etat-note">(sera masqué)</span>') + '</li>';
  }).join('') + '</ul>';

  majApercuDossier();
}

/**
 * Aperçu du dossier : le CHOIX D'UN CLUB, puis « Ouvrir l'aperçu ».
 *
 * Il y avait avant un lien fixe vers `dossier-club.html?admin=1`, sans club ni jeton. Il a cessé
 * de fonctionner le jour où le dossier est passé SOUS JETON (les contacts jour J, le parking et
 * les secours ne sortent plus sans lien personnel) : la page répondait « Ce lien de dossier n'est
 * plus valide ou incomplet », ce qui ressemble à une panne alors que c'est la sécurité qui parle.
 * Un aperçu « générique » ne peut donc PAS exister — et tant mieux : ce que tu veux relire avant
 * d'envoyer, c'est le dossier tel que le club le recevra, avec son nom et ses catégories.
 *
 * Sans aucun club invité, on ne propose pas un bouton mort : on dit quoi faire.
 */
function majApercuDossier() {
  const zone = document.getElementById('ligne-apercu-dossier');
  if (!zone) return;

  // Un club n'est prévisualisable que s'il a un JETON (colonne club_token) : c'est lui qui ouvre
  // les sections protégées. Les clubs acceptés d'abord — ce sont eux qui reçoivent un dossier.
  const clubs = (typeof clubsInvitesCourants !== 'undefined' ? (clubsInvitesCourants || []) : [])
    .filter(function (c) { return String(c.club_nom || '').trim() && String(c.club_token || '').trim(); })
    .slice()
    .sort(function (a, b) {
      const aa = estAccepte(a.statut) ? 0 : 1, bb = estAccepte(b.statut) ? 0 : 1;
      return (aa - bb) || String(a.club_nom).localeCompare(String(b.club_nom), 'fr');
    });

  if (!clubs.length) {
    zone.innerHTML = '<p class="note-generation">👉 L\'aperçu ouvre le dossier <strong>d\'un club</strong> ' +
      '(son nom, ses catégories, ses contacts jour J) : ajoute d\'abord un club dans ' +
      '<strong>« Clubs invités »</strong>. Il n\'existe pas d\'aperçu sans club — le dossier est ' +
      'protégé par le <strong>lien personnel</strong> de chacun.</p>';
    return;
  }

  zone.innerHTML =
    '<label class="dossier-apercu-lib" for="dossier-apercu-club">Aperçu du dossier de</label>' +
    '<select class="r-input" id="dossier-apercu-club">' +
      clubs.map(function (c) {
        const nom = String(c.club_nom).trim();
        return '<option value="' + echapper(nom) + '">' + echapper(nom) +
          (estAccepte(c.statut) ? '' : ' (' + echapper(String(c.statut || 'invité')) + ')') + '</option>';
      }).join('') +
    '</select>' +
    '<button type="button" class="bouton" id="bouton-ouvrir-dossier" data-ic="dossier">Ouvrir l\'aperçu</button>';
}

/** Clic dans la carte « Dossier » : ouvre le dossier du club choisi, en mode admin (?admin=1
 *  révèle le bandeau « aperçu avant envoi » et le retour à l'administration). */
function onClicApercuDossier(evenement) {
  if (!evenement.target || evenement.target.id !== 'bouton-ouvrir-dossier') return;
  const select = document.getElementById('dossier-apercu-club');
  const nom = select ? select.value : '';
  const club = (clubsInvitesCourants || []).find(function (c) { return memeTexteSouple(c.club_nom, nom); });
  if (!club) return;
  const url = new URL(lienDossierClub(String(club.club_nom || ''), String(club.club_token || '')));
  url.searchParams.set('admin', '1');
  window.open(url.toString(), '_blank', 'noopener');
}

/* --------------------------------------------------------------------------
   PUBLICATION (rendre le tournoi visible ou non sur la page publique)
   -------------------------------------------------------------------------- */

/** Vrai si le tournoi est actuellement publié (visible du public). */
function estPublie() {
  return String(configCourante.global && configCourante.global.tournoi_publie).toLowerCase() === 'oui';
}

/** Met à jour l'état affiché et le libellé du bouton selon la publication en cours. */
function majPublication() {
  const etat = document.getElementById('etat-publication');
  const bouton = document.getElementById('bouton-publier');
  if (!etat || !bouton) return;
  if (estPublie()) {
    etat.textContent = '🟢 Publié (visible du public)';
    bouton.innerHTML = svgIcone('monde') + 'Masquer le tournoi';
  } else {
    etat.textContent = '⚪️ Non publié (les visiteurs voient « à venir »)';
    bouton.innerHTML = svgIcone('monde') + 'Publier le tournoi';
  }
  majApercuTournoi(); // la légende de l'aperçu (publié / non publié) suit
}

/**
 * « Publier le tournoi » OU « Masquer ». À la publication, on enregistre d'abord
 * les infos saisies (nom/date/lieu/description) + l'affiche éventuelle, PUIS on publie.
 * Le masquage, lui, ne fait que dépublier.
 */
async function onPublier() {
  const message = document.getElementById('message-publication');
  const bouton = document.getElementById('bouton-publier');
  const publier = !estPublie(); // on bascule vers l'état inverse
  const question = publier
    ? 'Publier le tournoi ?\n\nLe tournoi deviendra visible du public. Les infos saisies (nom, date, lieu, description, affiche) seront aussi enregistrées.'
    : 'Masquer le tournoi ? Les visiteurs reverront l\'écran « à venir ».';
  if (!await dialogConfirmer(question, { ok: publier ? 'Publier' : 'Masquer' })) return;

  bouton.disabled = true;
  try {
    if (publier) {
      afficherMessage(message, 'Enregistrement des infos…', 'ok');
      // Filet « par sécurité » à la publication : on enregistre les infos SITE + la date/zone de la
      // carte cadre (payload fusionné ; le backend n'écrit que les champs présents).
      await ecrireAdmin('enregistrerInfosTournoi', Object.assign({}, lireInfosTournoi(), lireCadreTournoi()));
      if (afficheDataURI) {
        afficherMessage(message, 'Envoi de l\'affiche…', 'ok');
        await ecrireAdmin('enregistrerAffiche', { affiche: afficheDataURI });
      }
      afficherMessage(message, 'Publication…', 'ok');
      await ecrireAdmin('publierTournoi', { publie: 'oui' });
    } else {
      afficherMessage(message, 'Masquage…', 'ok');
      await ecrireAdmin('publierTournoi', { publie: 'non' });
    }
    // On recharge la config pour refléter le nouvel état.
    configCourante = await lireConfigAdmin();
    majInfosTournoi();
    document.getElementById('form-infos-tournoi').tournoi_affiche.value = ''; // vide le champ fichier
    majPublication();
    majTableauBord();
    afficherMessage(message, publier ? '✅ Tournoi publié.' : '✅ Tournoi masqué.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
  }
}
