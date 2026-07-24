/**
 * ============================================================================
 *  RÉPONSE — page publique où un club RÉPOND à l'invitation (Sprint 6)
 * ============================================================================
 *
 *  Accessible uniquement via le lien personnalisé reçu par email :
 *    reponse-invitation.html?tournoi=REF&club=ID&token=TOKEN
 *
 *  Le club peut :
 *    - décliner (« Nous ne pourrons pas venir ») ;
 *    - accepter (« Nous serons présents ») en précisant, par catégorie, le nombre
 *      d'équipes engagées (borné par le maximum éventuel), plus le nombre total de
 *      joueurs attendus.
 *
 *  ⚠️ Cette page N'ENTRAÎNE AUCUNE création d'équipe : elle enregistre seulement la
 *     réponse (backend : action repondreInvitation, autorisée par le token). Les équipes
 *     ne sont créées qu'au clic de l'organisateur sur « Générer le dossier final ».
 *
 *  Ordre de chargement (voir reponse-invitation.html) :
 *    config.js → commun.js (echapper) → api.js (apiGet/apiPost) → reponse.js
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Paramètres du lien (les 3 doivent être présents ET valides côté serveur) ---
  var params = new URLSearchParams(window.location.search);
  var TOURNOI = params.get('tournoi') || '';
  var CLUB = params.get('club') || '';
  var TOKEN = params.get('token') || '';

  var infos = null; // réponse de infosReponseInvitation { tournoi, categories, club }

  function el(id) { return document.getElementById(id); }
  function contenu() { return el('contenu'); }

  /** Message d'erreur GÉNÉRIQUE (ne révèle jamais ce qui cloche : club, token ou tournoi). */
  function afficherErreurLien() {
    contenu().innerHTML =
      '<div class="bloc-msg bloc-erreur">' +
        '<h1>Lien invalide ou expiré</h1>' +
        '<p>Ce lien de réponse n\'est pas (ou plus) valide. Vérifie qu\'il est complet ' +
        '(recopié en entier depuis l\'email), ou contacte l\'organisateur du tournoi.</p>' +
      '</div>';
  }

  /** Date AAAA-MM-JJ → « samedi 12 septembre 2026 » (vide si non renseignée). */
  function dateLongueFr(iso) {
    var s = String(iso || '').trim();
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return '';
    var d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    try {
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return s; }
  }

  /** URL d'affichage de l'affiche Drive (même CDN lh3 que les autres pages). */
  function urlAffiche(id, largeur) {
    return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 700);
  }

  /* ------------------------------------------------------------------ RENDU */

  /** En-tête : affiche + nom + date + lieu du tournoi (rappel synthétique). */
  function htmlEntete() {
    var t = infos.tournoi || {};
    var nom = String(t.nom || 'Tournoi Génération R92');
    var dateTxt = dateLongueFr(t.date);
    var h = '<header class="r-entete">';
    if (t.affiche_id) {
      h += '<img class="r-affiche" src="' + echapper(urlAffiche(t.affiche_id, 700)) +
           '" alt="Affiche — ' + echapper(nom) + '">';
    }
    h += '<h1>' + echapper(nom) + '</h1>';
    if (dateTxt) h += '<p class="r-date">' + echapper(dateTxt) + '</p>';
    if (t.lieu) h += '<p class="r-lieu">' + echapper(String(t.lieu)) + '</p>';
    h += '</header>';
    return h;
  }

  /** Bandeau « déjà répondu » (si une réponse existe déjà — on autorise sa modification). */
  function htmlDejaRepondu() {
    var c = infos.club || {};
    if (!c.date_reponse) return '';
    var libelle = (c.statut === 'Accepté') ? 'participation confirmée'
      : (c.statut === 'Décliné') ? 'absence signalée' : 'réponse enregistrée';
    return '<p class="r-deja">Vous avez déjà répondu (' + echapper(libelle) + ') le ' +
      echapper(dateLongueFr(c.date_reponse) || c.date_reponse) +
      '. Vous pouvez modifier votre réponse ci-dessous si besoin.</p>';
  }

  /** Ligne d'une catégorie dans le formulaire « présents ». */
  function htmlLigneCategorie(cat) {
    var max = parseInt(cat.max_equipes_par_club, 10);
    var aMax = isFinite(max) && max > 0;
    var nom = String(cat.categorie);
    return '<div class="r-cat" data-cat="' + echapper(nom) + '"' + (aMax ? ' data-max="' + max + '"' : '') + '>' +
      '<label class="r-cat-tete">' +
        '<input type="checkbox" class="r-cat-check" value="' + echapper(nom) + '"> ' +
        '<span class="r-cat-nom">' + echapper(nom) + '</span>' +
      '</label>' +
      '<div class="r-cat-nb" hidden>' +
        '<label>Nombre d\'équipes ' +
          '<input type="number" class="r-cat-equipes" min="1" step="1"' +
            (aMax ? ' max="' + max + '"' : '') + ' value="1" inputmode="numeric">' +
        '</label>' +
        (aMax ? '<span class="r-cat-max">Maximum ' + max + ' par club</span>' : '') +
        '<span class="r-cat-alerte" role="alert"></span>' +
      '</div>' +
    '</div>';
  }

  /** Formulaire complet « Nous serons présents ». */
  function htmlFormPresents() {
    var cats = infos.categories || [];
    var lignes = cats.map(htmlLigneCategorie).join('');
    if (!lignes) {
      lignes = '<p class="r-vide">Aucune catégorie n\'est ouverte pour le moment. ' +
        'Contacte l\'organisateur.</p>';
    }
    return '<section class="r-form" id="form-presents" hidden>' +
      '<h2>Nous serons présents 🎉</h2>' +
      '<p class="r-aide">Coche les catégories que ton club engage, indique le nombre d\'équipes ' +
        'pour chacune, puis le nombre total de joueurs attendus.</p>' +
      '<div id="liste-categories">' + lignes + '</div>' +
      '<label class="r-joueurs">Nombre total de joueurs attendus ' +
        '<input type="number" id="nb-joueurs" min="1" step="1" inputmode="numeric" ' +
        'placeholder="Ex : 24"></label>' +
      '<div class="r-actions">' +
        '<button type="button" class="r-btn r-btn-principal" id="btn-confirmer-presents">' +
          'Confirmer notre participation</button>' +
        '<button type="button" class="r-btn r-btn-lien" id="btn-retour-1">‹ Changer de réponse</button>' +
      '</div>' +
      '<p class="r-erreur-form" id="erreur-presents" role="alert"></p>' +
    '</section>';
  }

  /** Confirmation « Nous ne pourrons pas venir ». */
  function htmlFormAbsent() {
    return '<section class="r-form" id="form-absent" hidden>' +
      '<h2>Nous ne pourrons pas venir</h2>' +
      '<p class="r-aide">Confirme que ton club décline l\'invitation pour cette édition. ' +
        'Merci de nous prévenir&nbsp;!</p>' +
      '<div class="r-actions">' +
        '<button type="button" class="r-btn r-btn-principal" id="btn-confirmer-absent">' +
          'Confirmer notre absence</button>' +
        '<button type="button" class="r-btn r-btn-lien" id="btn-retour-2">‹ Changer de réponse</button>' +
      '</div>' +
      '<p class="r-erreur-form" id="erreur-absent" role="alert"></p>' +
    '</section>';
  }

  /** Deux gros boutons de choix initial. */
  function htmlChoix() {
    var c = infos.club || {};
    var bonjour = c.club_nom ? ('Bonjour ' + echapper(String(c.club_nom)) + ',') : 'Bonjour,';
    var limite = infos.tournoi && infos.tournoi.date_limite_confirmation
      ? '<p class="r-limite">Merci de répondre avant le <strong>' +
        echapper(dateLongueFr(infos.tournoi.date_limite_confirmation) ||
                 infos.tournoi.date_limite_confirmation) + '</strong>.</p>'
      : '';
    return '<section class="r-choix" id="bloc-choix">' +
      '<p class="r-bonjour">' + bonjour + '</p>' +
      '<p>Votre club participera-t-il au tournoi&nbsp;?</p>' +
      limite +
      htmlDejaRepondu() +
      '<div class="r-choix-boutons">' +
        '<button type="button" class="r-btn r-btn-oui" id="btn-present">Nous serons présents</button>' +
        '<button type="button" class="r-btn r-btn-non" id="btn-absent">Nous ne pourrons pas venir</button>' +
      '</div>' +
    '</section>';
  }

  /** Écran final de remerciement (après enregistrement). */
  function afficherMerci(statut) {
    var msg = (statut === 'Accepté')
      ? 'Merci&nbsp;! Votre participation est bien enregistrée. Votre dossier complet vous ' +
        'sera envoyé prochainement par l\'organisateur.'
      : 'Merci de nous avoir prévenus. Votre réponse a bien été enregistrée. ' +
        'Au plaisir de vous revoir sur une prochaine édition&nbsp;!';
    contenu().innerHTML = htmlEntete() +
      '<div class="bloc-msg bloc-ok">' +
        '<h2>' + (statut === 'Accepté' ? 'C\'est noté&nbsp;! 🎉' : 'Réponse enregistrée') + '</h2>' +
        '<p>' + msg + '</p>' +
      '</div>';
  }

  /* ------------------------------------------------------ INTERACTIONS */

  /** Affiche l'un des blocs (choix / présents / absent) et masque les autres. */
  function montrer(idAffiche) {
    ['bloc-choix', 'form-presents', 'form-absent'].forEach(function (id) {
      var noeud = el(id);
      if (noeud) noeud.hidden = (id !== idAffiche);
    });
  }

  /** Pré-remplit le formulaire « présents » depuis une réponse déjà donnée. */
  function preremplirPresents() {
    var c = infos.club || {};
    if (c.statut !== 'Accepté') return;
    var nbMap = {};
    try { nbMap = JSON.parse(c.nb_equipes_par_categorie || '{}') || {}; } catch (e) { nbMap = {}; }
    Object.keys(nbMap).forEach(function (cat) {
      var bloc = document.querySelector('.r-cat[data-cat="' + cssEchappe(cat) + '"]');
      if (!bloc) return;
      var check = bloc.querySelector('.r-cat-check');
      var nb = bloc.querySelector('.r-cat-equipes');
      if (check) { check.checked = true; }
      if (nb) { nb.value = parseInt(nbMap[cat], 10) || 1; }
      basculerLigne(bloc);
    });
    if (c.nb_joueurs_total && el('nb-joueurs')) el('nb-joueurs').value = c.nb_joueurs_total;
  }

  /** Échappe une valeur pour un sélecteur CSS d'attribut (les catégories sont simples : U8…). */
  function cssEchappe(v) { return String(v).replace(/["\\]/g, '\\$&'); }

  /** Affiche/masque le champ « nombre d'équipes » selon la case cochée. */
  function basculerLigne(bloc) {
    var check = bloc.querySelector('.r-cat-check');
    var zone = bloc.querySelector('.r-cat-nb');
    if (!check || !zone) return;
    zone.hidden = !check.checked;
    bloc.classList.toggle('r-cat-active', check.checked);
  }

  /** Validation live d'un champ « nombre d'équipes » (borné par le max). */
  function validerNombre(bloc) {
    var max = parseInt(bloc.getAttribute('data-max'), 10);
    var input = bloc.querySelector('.r-cat-equipes');
    var alerte = bloc.querySelector('.r-cat-alerte');
    if (!input) return true;
    var n = parseInt(input.value, 10);
    if (!isFinite(n) || n < 1) {
      if (alerte) alerte.textContent = '';
      return false; // vide/invalide : bloqué à l'envoi, mais pas d'alerte rouge tant que non soumis
    }
    if (isFinite(max) && max > 0 && n > max) {
      input.value = max; // on borne la saisie en direct
      if (alerte) alerte.textContent = 'Maximum ' + max + ' équipe(s) par club pour cette catégorie.';
      return true;
    }
    if (alerte) alerte.textContent = '';
    return true;
  }

  function brancherFormulaire() {
    // Choix initial
    el('btn-present').addEventListener('click', function () {
      montrer('form-presents');
    });
    el('btn-absent').addEventListener('click', function () {
      montrer('form-absent');
    });
    var r1 = el('btn-retour-1'); if (r1) r1.addEventListener('click', function () { montrer('bloc-choix'); });
    var r2 = el('btn-retour-2'); if (r2) r2.addEventListener('click', function () { montrer('bloc-choix'); });

    // Cases à cocher + champs nombre (délégation sur la liste)
    var liste = el('liste-categories');
    if (liste) {
      liste.addEventListener('change', function (ev) {
        var bloc = ev.target.closest('.r-cat');
        if (!bloc) return;
        if (ev.target.classList.contains('r-cat-check')) basculerLigne(bloc);
        if (ev.target.classList.contains('r-cat-equipes')) validerNombre(bloc);
      });
      liste.addEventListener('input', function (ev) {
        if (ev.target.classList.contains('r-cat-equipes')) validerNombre(ev.target.closest('.r-cat'));
      });
    }

    el('btn-confirmer-presents').addEventListener('click', envoyerPresents);
    el('btn-confirmer-absent').addEventListener('click', envoyerAbsent);
  }

  /** Envoie la réponse « présents » après validation. */
  async function envoyerPresents() {
    var erreur = el('erreur-presents');
    erreur.textContent = '';
    var blocs = Array.prototype.slice.call(document.querySelectorAll('.r-cat'));
    var nbMap = {};
    var invalide = '';
    blocs.forEach(function (bloc) {
      var check = bloc.querySelector('.r-cat-check');
      if (!check || !check.checked) return;
      var cat = bloc.getAttribute('data-cat');
      var input = bloc.querySelector('.r-cat-equipes');
      var n = parseInt(input && input.value, 10);
      var max = parseInt(bloc.getAttribute('data-max'), 10);
      if (!isFinite(n) || n < 1) { invalide = invalide || ('Indique un nombre d\'équipes pour ' + cat + '.'); return; }
      if (isFinite(max) && max > 0 && n > max) { invalide = invalide || ('Maximum ' + max + ' équipe(s) par club pour ' + cat + '.'); return; }
      nbMap[cat] = n;
    });

    if (!Object.keys(nbMap).length) { erreur.textContent = 'Coche au moins une catégorie et indique le nombre d\'équipes.'; return; }
    if (invalide) { erreur.textContent = invalide; return; }
    var nbJoueurs = parseInt(el('nb-joueurs').value, 10);
    if (!isFinite(nbJoueurs) || nbJoueurs < 1) { erreur.textContent = 'Indique le nombre total de joueurs attendus.'; return; }

    var btn = el('btn-confirmer-presents');
    btn.disabled = true; btn.textContent = 'Envoi…';
    try {
      var res = await apiPost('repondreInvitation', {
        tournoi: TOURNOI, club: CLUB, token: TOKEN,
        presence: 'present',
        nb_equipes_par_categorie: JSON.stringify(nbMap),
        nb_joueurs_total: nbJoueurs
      });
      afficherMerci((res && res.statut) || 'Accepté');
    } catch (e) {
      erreur.textContent = e.message || 'Une erreur est survenue. Réessaie.';
      btn.disabled = false; btn.textContent = 'Confirmer notre participation';
    }
  }

  /** Envoie la réponse « déclinée ». */
  async function envoyerAbsent() {
    var erreur = el('erreur-absent');
    erreur.textContent = '';
    var btn = el('btn-confirmer-absent');
    btn.disabled = true; btn.textContent = 'Envoi…';
    try {
      var res = await apiPost('repondreInvitation', {
        tournoi: TOURNOI, club: CLUB, token: TOKEN, presence: 'absent'
      });
      afficherMerci((res && res.statut) || 'Décliné');
    } catch (e) {
      erreur.textContent = e.message || 'Une erreur est survenue. Réessaie.';
      btn.disabled = false; btn.textContent = 'Confirmer notre absence';
    }
  }

  /* ------------------------------------------------------------ AMORÇAGE */

  function rendre() {
    contenu().innerHTML = htmlEntete() + htmlChoix() + htmlFormPresents() + htmlFormAbsent();
    brancherFormulaire();
    preremplirPresents();
    montrer('bloc-choix');
  }

  async function charger() {
    if (!TOURNOI || !CLUB || !TOKEN) { afficherErreurLien(); return; }
    try {
      infos = await apiGet('infosReponseInvitation', { tournoi: TOURNOI, club: CLUB, token: TOKEN });
    } catch (e) {
      afficherErreurLien(); return;
    }
    if (!infos || !infos.ok) { afficherErreurLien(); return; }
    rendre();
  }

  document.addEventListener('DOMContentLoaded', charger);
})();
