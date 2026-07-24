/**
 * ============================================================================
 *  RÉPONSE À L'INVITATION (Phase 1) — libre-service du club (Sprint 6)
 * ============================================================================
 *  Page PUBLIQUE sécurisée par un JETON (reponse-invitation.html?tournoi=…&club=…&token=…).
 *  Le contact du club répond lui-même : présent (catégories + nombre d'équipes + joueurs)
 *  ou absent. La réponse remplit automatiquement la fiche du club dans l'admin. L'envoi du
 *  dossier complet reste toujours déclenché MANUELLEMENT par l'organisateur (jamais ici).
 *
 *  Sécurité : toutes les données (lecture et écriture) sont validées côté backend par le
 *  jeton. Un jeton invalide → message générique « Lien invalide ou expiré » (rien n'est révélé).
 * ============================================================================
 */

let repDonnees = null;   // { club, tournoi, categories } renvoyé par le backend
let repParams = null;    // { tournoi, club, token } de l'URL

document.addEventListener('DOMContentLoaded', initReponse);

/** Valeur texte propre. */
function txtR(v) { return (v == null) ? '' : String(v).trim(); }

/** Date longue « mercredi 11 novembre 2026 ». */
function dateLongueR(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return txtR(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** URL d'affichage de l'affiche Drive. */
function urlAfficheR(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 600);
}

async function initReponse() {
  const params = new URLSearchParams(window.location.search);
  repParams = { tournoi: txtR(params.get('tournoi')), club: txtR(params.get('club')), token: txtR(params.get('token')) };
  const zone = document.getElementById('reponse');

  if (!repParams.token) { zone.innerHTML = messageErreur('Lien invalide ou expiré.'); return; }

  try {
    const res = await apiGet('getReponseInvitation', {
      tournoi: repParams.tournoi, club: repParams.club, token: repParams.token
    });
    if (!res || res.error || !res.club) { zone.innerHTML = messageErreur('Lien invalide ou expiré.'); return; }
    repDonnees = res;
    zone.innerHTML = construirePage(res);
    brancherEvenements();
  } catch (e) {
    // apiGet lève si le backend renvoie { error } (jeton invalide → « Lien invalide ou expiré. »)
    // OU en cas d'erreur réseau. Le message backend étant déjà générique, on l'affiche tel quel.
    zone.innerHTML = messageErreur((e && e.message) ? e.message : 'Lien invalide ou expiré.');
  }
}

/** Bloc d'erreur générique (ne révèle aucune information). */
function messageErreur(texte) {
  return '<div class="message-chargement erreur">' + echapper(texte) + '</div>';
}

/* --------------------------------------------------------------------------
   CONSTRUCTION DE LA PAGE
   -------------------------------------------------------------------------- */

function construirePage(data) {
  const t = data.tournoi || {};
  const club = data.club || {};
  const nom = txtR(t.nom) || 'Tournoi Génération R92';
  const prenom = txtR(club.club_contact_prenom);
  const dejaRepondu = !!txtR(club.date_reponse);

  let html = '';

  // a) Rappel synthétique du tournoi.
  html += '<header class="d-entete">' +
    (txtR(t.affiche_id)
      ? '<img class="d-affiche" src="' + echapper(urlAfficheR(t.affiche_id, 600)) + '" alt="Affiche — ' + echapper(nom) + '">'
      : '') +
    '<div class="d-entete-textes">' +
      '<p class="d-surtitre">Invitation — Génération R92</p>' +
      '<h1>' + echapper(nom) + '</h1>' +
      (txtR(t.date) ? '<p class="d-date">' + echapper(dateLongueR(t.date)) + '</p>' : '') +
      (txtR(t.lieu) ? '<p class="d-genere">' + echapper(txtR(t.lieu)) + '</p>' : '') +
    '</div>' +
  '</header>';

  html += '<p class="d-presentation">' + (prenom ? 'Bonjour ' + echapper(prenom) + ', ' : '')
    + 'merci de nous indiquer si votre club pourra participer à cette journée.</p>';

  // Rappel si le club a déjà répondu (il peut modifier sa réponse).
  if (dejaRepondu) {
    const statut = txtR(club.statut);
    html += '<p class="rep-deja">✅ Vous avez déjà répondu le ' + echapper(dateLongueR(club.date_reponse))
      + (statut ? ' (' + echapper(statut) + ')' : '') + '. Vous pouvez modifier votre réponse ci-dessous.</p>';
  }

  // b) Deux boutons initiaux.
  html += '<div class="rep-choix">' +
    '<button type="button" class="rep-btn rep-btn-oui" id="btn-present">✅ Nous serons présents</button>' +
    '<button type="button" class="rep-btn rep-btn-non" id="btn-absent">❌ Nous ne pourrons pas venir</button>' +
  '</div>';

  // Zone « présents » (formulaire) + zone « absents » (confirmation) + zone message final.
  html += '<div id="rep-zone-present" hidden>' + formulairePresence(data) + '</div>';
  html += '<div id="rep-zone-absent" hidden>' +
    '<p class="rep-question">Confirmez-vous que votre club ne pourra pas participer ?</p>' +
    '<div class="rep-choix">' +
      '<button type="button" class="rep-btn rep-btn-non" id="btn-decline-confirm">Oui, nous déclinons</button>' +
      '<button type="button" class="rep-btn rep-btn-neutre" id="btn-annuler">Annuler</button>' +
    '</div>' +
  '</div>';
  html += '<div id="rep-message-final"></div>';

  // Pied.
  html += '<footer class="d-pied"><span>Génération R92 <span class="d-pied-mention">· École de rugby du Racing 92</span></span></footer>';
  return html;
}

/** Formulaire « Nous serons présents » : catégories + nb d'équipes + nb joueurs total. */
function formulairePresence(data) {
  const cats = (data.categories || []);
  const engagees = parseCatsEngageesR(data.club.categories_engagees);
  const nbParCat = jsonSurR(data.club.nb_equipes_par_categorie, {});

  let lignes = '';
  cats.forEach(function (c) {
    const nomCat = txtR(c.categorie);
    const max = parseInt(txtR(c.max_equipes_par_club), 10);
    const aMax = isFinite(max) && max >= 1;
    const coche = engagees.indexOf(nomCat.toUpperCase()) !== -1;
    const nbVal = (nbParCat && nbParCat[nomCat] != null) ? String(nbParCat[nomCat]) : '';
    const effMin = parseInt(txtR(c.effectif_min), 10);
    const infoEff = (isFinite(effMin) && effMin >= 1) ? (' · ' + effMin + ' joueurs mini/équipe') : '';
    lignes +=
      '<div class="rep-cat" data-cat="' + echapper(nomCat) + '"' + (aMax ? ' data-max="' + max + '"' : '') + '>' +
        '<label class="rep-cat-titre"><input type="checkbox" class="rep-cat-case"' + (coche ? ' checked' : '') + '> ' +
          '<span class="rep-cat-nom">' + echapper(nomCat) + '</span>' +
          '<span class="rep-cat-info">' + (aMax ? 'jusqu\'à ' + max + ' équipe' + (max > 1 ? 's' : '') : 'plusieurs équipes possibles') + echapper(infoEff) + '</span>' +
        '</label>' +
        // Pas d'attribut HTML `max` : on gère la limite en JS (message custom clair) — l'attribut
        // natif bloquerait le submit sans laisser passer notre message. min="1" reste natif.
        '<span class="rep-cat-nb"' + (coche ? '' : ' hidden') + '>' +
          '<input type="number" class="rep-cat-equipes" min="1"' +
            ' value="' + echapper(nbVal || (coche ? '1' : '')) + '" inputmode="numeric"> équipe(s)' +
        '</span>' +
        '<span class="rep-cat-err" role="alert"></span>' +
      '</div>';
  });

  return '<form id="form-presence" class="rep-form">' +
    '<h2 class="rep-titre">Vos équipes engagées</h2>' +
    '<p class="rep-aide">Cochez les catégories concernées et indiquez le nombre d\'équipes pour chacune.</p>' +
    '<div class="rep-cats">' + (lignes || '<p class="rep-aide">Aucune catégorie ouverte pour le moment.</p>') + '</div>' +
    '<label class="rep-champ-joueurs">Nombre total de joueurs attendus (toutes équipes)' +
      '<input type="number" id="rep-joueurs" min="1" inputmode="numeric" value="' + echapper(txtR(data.club.nb_joueurs_total)) + '"></label>' +
    '<div class="rep-actions">' +
      '<button type="submit" class="rep-btn rep-btn-oui" id="btn-confirmer">Confirmer notre participation</button>' +
      '<span class="rep-form-msg" id="rep-form-msg"></span>' +
    '</div>' +
  '</form>';
}

/* --------------------------------------------------------------------------
   ÉVÉNEMENTS
   -------------------------------------------------------------------------- */

function brancherEvenements() {
  const zone = document.getElementById('reponse');
  zone.addEventListener('click', onClicReponse);
  zone.addEventListener('change', onChangeReponse);
  zone.addEventListener('input', onInputReponse);
  const form = document.getElementById('form-presence');
  if (form) form.addEventListener('submit', onConfirmerPresence);
}

function onClicReponse(e) {
  const cible = e.target;
  if (cible.closest('#btn-present')) {
    document.getElementById('rep-zone-present').hidden = false;
    document.getElementById('rep-zone-absent').hidden = true;
    document.getElementById('rep-zone-present').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (cible.closest('#btn-absent')) {
    document.getElementById('rep-zone-absent').hidden = false;
    document.getElementById('rep-zone-present').hidden = true;
  } else if (cible.closest('#btn-annuler')) {
    document.getElementById('rep-zone-absent').hidden = true;
  } else if (cible.closest('#btn-decline-confirm')) {
    envoyerDecline(cible.closest('#btn-decline-confirm'));
  }
}

/** Coche/décoche une catégorie : montre/masque son champ « nombre d'équipes ». */
function onChangeReponse(e) {
  const boite = e.target.closest('.rep-cat-case');
  if (!boite) return;
  const ligne = boite.closest('.rep-cat');
  const nb = ligne.querySelector('.rep-cat-nb');
  const champ = ligne.querySelector('.rep-cat-equipes');
  if (boite.checked) {
    nb.hidden = false;
    if (champ && !txtR(champ.value)) champ.value = '1';
    validerLigneCat(ligne);
  } else {
    nb.hidden = true;
    ligne.querySelector('.rep-cat-err').textContent = '';
  }
}

/** Validation EN DIRECT du nombre d'équipes vs le maximum de la catégorie. */
function onInputReponse(e) {
  const champ = e.target.closest('.rep-cat-equipes');
  if (champ) validerLigneCat(champ.closest('.rep-cat'));
}

/** Vérifie une ligne catégorie : nombre ≥ 1 et ≤ max si défini. Renvoie true si valide. */
function validerLigneCat(ligne) {
  const err = ligne.querySelector('.rep-cat-err');
  const champ = ligne.querySelector('.rep-cat-equipes');
  const max = parseInt(ligne.getAttribute('data-max'), 10);
  const nb = parseInt(champ.value, 10);
  err.textContent = '';
  if (!isFinite(nb) || nb < 1) { err.textContent = 'Indiquez au moins 1 équipe.'; return false; }
  if (isFinite(max) && nb > max) {
    err.textContent = 'Maximum ' + max + ' équipe' + (max > 1 ? 's' : '') + ' par club pour cette catégorie.';
    return false;
  }
  return true;
}

/** Soumission « Confirmer notre participation ». */
async function onConfirmerPresence(e) {
  e.preventDefault();
  const msg = document.getElementById('rep-form-msg');
  msg.textContent = '';
  msg.className = 'rep-form-msg';

  const cochees = Array.prototype.slice.call(document.querySelectorAll('.rep-cat')).filter(function (l) {
    return l.querySelector('.rep-cat-case').checked;
  });
  if (!cochees.length) { msg.textContent = '⚠️ Sélectionnez au moins une catégorie.'; msg.classList.add('ko'); return; }

  const parCat = {};
  let valide = true;
  cochees.forEach(function (l) {
    if (!validerLigneCat(l)) { valide = false; return; }
    parCat[l.getAttribute('data-cat')] = parseInt(l.querySelector('.rep-cat-equipes').value, 10);
  });
  if (!valide) { msg.textContent = '⚠️ Corrigez les nombres d\'équipes indiqués.'; msg.classList.add('ko'); return; }

  const joueurs = parseInt(document.getElementById('rep-joueurs').value, 10);
  if (!isFinite(joueurs) || joueurs < 1) { msg.textContent = '⚠️ Indiquez le nombre total de joueurs attendus.'; msg.classList.add('ko'); return; }

  const bouton = document.getElementById('btn-confirmer');
  bouton.disabled = true;
  const texte = bouton.textContent;
  bouton.textContent = 'Envoi…';
  try {
    await apiPost('repondreInvitation', {
      tournoi: repParams.tournoi, club: repParams.club, token: repParams.token,
      reponse: 'accepte',
      nb_equipes_par_categorie: JSON.stringify(parCat),
      nb_joueurs_total: joueurs
    });
    afficherConfirmation('🎉 Merci, votre participation est enregistrée !',
      'Votre dossier complet vous sera envoyé prochainement par l\'organisation.');
  } catch (erreur) {
    msg.textContent = '⚠️ ' + erreur.message;
    msg.classList.add('ko');
    bouton.disabled = false;
    bouton.textContent = texte;
  }
}

/** Envoi de la réponse « Décliné ». */
async function envoyerDecline(bouton) {
  bouton.disabled = true;
  const texte = bouton.textContent;
  bouton.textContent = 'Envoi…';
  try {
    await apiPost('repondreInvitation', {
      tournoi: repParams.tournoi, club: repParams.club, token: repParams.token, reponse: 'decline'
    });
    afficherConfirmation('Merci pour votre retour', 'Nous avons bien noté que votre club ne pourra pas participer cette fois. Au plaisir de vous compter parmi nous à une prochaine édition !');
  } catch (erreur) {
    bouton.disabled = false;
    bouton.textContent = texte;
    const zone = document.getElementById('rep-zone-absent');
    zone.insertAdjacentHTML('beforeend', '<p class="rep-form-msg ko">⚠️ ' + echapper(erreur.message) + '</p>');
  }
}

/** Remplace les choix par un message de confirmation final (fin du parcours). */
function afficherConfirmation(titre, texte) {
  [document.querySelector('.rep-choix'),
   document.getElementById('rep-zone-present'),
   document.getElementById('rep-zone-absent'),
   document.querySelector('.rep-deja')].forEach(function (el) { if (el) el.hidden = true; });
  const zone = document.getElementById('rep-message-final');
  zone.innerHTML = '<div class="rep-merci"><h2>' + echapper(titre) + '</h2><p>' + echapper(texte) + '</p></div>';
  zone.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* --------------------------------------------------------------------------
   PETITS HELPERS
   -------------------------------------------------------------------------- */

/** Catégories engagées (« U8,U10 » ou JSON) → tableau de noms MAJ. */
function parseCatsEngageesR(brut) {
  const t = txtR(brut);
  if (!t) return [];
  let liste = null;
  try { const o = JSON.parse(t); if (Array.isArray(o)) liste = o; } catch (e) { /* pas JSON */ }
  if (!liste) liste = t.split(',');
  return liste.map(function (s) { return String(s).trim().toUpperCase(); }).filter(Boolean);
}

/** JSON parsé sans casser (valeur de repli sinon). */
function jsonSurR(v, repli) {
  try { const o = JSON.parse(txtR(v) || 'null'); return (o == null) ? repli : o; }
  catch (e) { return repli; }
}
