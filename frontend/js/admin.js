/**
 * ============================================================================
 *  ADMIN — logique de la page d'administration
 * ============================================================================
 *  - Affiche et modifie les réglages (horaires globaux + catégories).
 *  - Saisie des équipes (ajout / suppression).
 *  - Génération des poules et du planning, avec affichage du résultat.
 *  - Assistant d'arbitrage : si l'heure de fin manuelle est dépassée, propose
 *    des ajustements cliquables pour tenir le créneau.
 *  Tout passe par le backend (voir api.js) qui lit/écrit dans le Google Sheet.
 * ============================================================================
 */

/* Champs modifiables d'une catégorie : clé (dans le Sheet), libellé, type de champ.
   NB : `terrains` n'est plus ici — il a son propre bloc (Auto / Manuel), voir blocTerrains(). */
const CHAMPS_CATEGORIE = [
  { cle: 'nb_poules',              label: 'Nombre de poules',          type: 'text', placeholder: 'Auto' },
  { cle: 'format_mi_temps',        label: 'Nb mi-temps',               type: 'select', options: ['1', '2'] },
  { cle: 'duree_mi_temps_min',     label: 'Durée mi-temps (min)',      type: 'number' },
  { cle: 'pause_mi_temps_min',     label: 'Pause mi-temps (min)',      type: 'number' },
  { cle: 'recup_entre_matchs_min', label: 'Récup. entre matchs (min)', type: 'number' },
  // Champs « dossier club » (facultatifs). `reglement` : texte libre OU URL (affichée en lien
  // par les pages qui la consomment). `arbitrage_organisation` : qui arbitre — nom volontairement
  // distinct de l'« arbitrage » de l'assistant horaires (deux concepts différents).
  { cle: 'reglement',              label: 'Règlement (texte ou lien)', type: 'text', placeholder: 'Ex : règles FFR M10 ou https://…' },
  { cle: 'effectif_min',           label: 'Effectif min (joueurs)',    type: 'number' },
  { cle: 'effectif_max',           label: 'Effectif max (joueurs)',    type: 'number' },
  { cle: 'arbitrage_organisation', label: 'Arbitrage (qui arbitre ?)', type: 'text', placeholder: 'Ex : éducateurs des clubs' },
  // Phase 1 (invitation) : nombre max d'équipes par club dans cette catégorie. Vide = illimité
  // (affiché « Plusieurs équipes possibles par catégorie » sur l'invitation, jamais « 0 »).
  { cle: 'max_equipes_par_club',   label: 'Max équipes par club',      type: 'number', placeholder: 'Vide = illimité' }
];

/* Formats d'après-midi proposés (choisis AU PARAMÉTRAGE, avant le jour J), avec une
   explication concrète visible au moment du choix — jamais un simple menu déroulant. */
const FORMATS_APRESMIDI = [
  {
    cle: 'CROISE', titre: 'Classement croisé',
    desc: "Les équipes sont reclassées par niveau après les poules du matin (les 1ᵉʳˢ de chaque "
        + "poule ensemble = Niveau 1, etc.), puis s'affrontent en round-robin dans leur niveau. "
        + "Un classement général et un podium sont désignés : le vainqueur du Niveau 1 remporte le tournoi."
  },
  {
    cle: 'CROISE_DIAGONAL', titre: 'Classement croisé diagonal',
    desc: "Les équipes s'affrontent entre poules par rangs CROISÉS : le 1ᵉʳ d'une poule affronte le "
        + "2ᵉ d'une AUTRE poule (au lieu du 1ᵉʳ contre le 1ᵉʳ du croisé classique). Des matchs plus "
        + "imprévisibles. Pas de vainqueur désigné par élimination : résultats cumulés au classement général."
  },
  {
    cle: 'LIBRE', titre: 'Matchs libres',
    desc: "Pas de classement l'après-midi : les équipes jouent simplement plusieurs matchs amicaux "
        + "supplémentaires, sans enjeu ni hiérarchie (pas de podium). Recommandé pour les plus jeunes (M6–M8)."
  },
  {
    cle: 'COUPE_PLATEAU', titre: 'Coupe + Plateau',
    desc: "Les premiers de chaque poule s'affrontent en élimination directe jusqu'à une finale "
        + "(un vainqueur du tournoi est désigné). Les autres équipes jouent un plateau, sans élimination. "
        + "⚠️ Ce format demande une saisie de score plus rigoureuse côté bénévoles."
  }
];

/** Format d'après-midi retenu pour une catégorie (défaut = CROISE, comportement historique). */
function formatApresMidiDe(cat) {
  const f = (cat && cat.format_apresmidi != null) ? String(cat.format_apresmidi).trim().toUpperCase() : '';
  return (f === 'LIBRE' || f === 'COUPE_PLATEAU' || f === 'CROISE_DIAGONAL') ? f : 'CROISE';
}

/** Mode d'attribution des terrains d'une catégorie : true = Auto (onglet Terrains), false = Manuel.
 *  Défaut = Auto (colonne vide ou absente → auto). Seul 'non' bascule en manuel. */
function terrainsAutoDe(cat) {
  const v = (cat && cat.terrains_auto != null) ? String(cat.terrains_auto).trim().toLowerCase() : '';
  return v !== 'non';
}

/** Nombre de qualifiés en Coupe lu dans param_format (JSON), défaut 2. */
function nbQualifiesCoupeDe(cat) {
  try {
    const o = JSON.parse((cat && cat.param_format) ? String(cat.param_format) : '{}');
    const n = parseInt(o && o.nbQualifiesCoupe, 10);
    return (isFinite(n) && n >= 1) ? n : 2;
  } catch (e) { return 2; }
}

/* On garde en mémoire la config, les équipes et les matchs chargés (pour l'affichage). */
let configCourante = { global: {}, categories: [] };
let equipesCourantes = [];
let matchsCourants = [];
/* Modèle de travail pendant la modification manuelle des poules (null = pas en édition). */
let editionPoules = null;
/* Affiche du tournoi choisie mais pas encore enregistrée (Data URI redimensionné). */
let afficheDataURI = '';
/* Photo du parking choisie mais pas encore enregistrée (même mécanisme que l'affiche). */
let parkingDataURI = '';
/* Liste des clubs invités (chargée avec la clé admin — jamais dans les données publiques). */
let clubsInvitesCourants = [];

/* Toute écriture depuis l'admin passe par ici : exige la clé ADMIN (voir api.js). */
function ecrireAdmin(action, data) {
  return apiPostProtege(action, data, 'admin', 'admin');
}

/**
 * Vrai si une catégorie est marquée présente ("oui", quelle que soit la casse).
 */
function estPresente(cat) {
  return String(cat.presente).toLowerCase() === 'oui';
}

/**
 * Au chargement de la page : on récupère tout (config + équipes) en un appel,
 * puis on remplit la page.
 */
async function initAdmin() {
  const zoneReglages = document.getElementById('reglages');

  try {
    const data = await apiGet('getAll'); // { config, equipes, poules, matchs }
    configCourante = data.config;
    equipesCourantes = data.equipes;
    matchsCourants = data.matchs || [];

    // 1) Réglages (horaires + catégories)
    injecterReglages(data.config.global, data.config.categories);

    // 1 bis) Terrains physiques & répartition (dépend des catégories présentes)
    injecterTerrains();

    // 2) Équipes : on remplit la liste déroulante des catégories et la liste des équipes
    remplirSelectCategories(data.config.categories);
    afficherEquipes(data.equipes);

    // 3) Poules & planning déjà générés (s'il y en a)
    afficherPlanning(data.poules, data.matchs);
    majApresMidi(); // état de préparation de la phase après-midi

    // 4) Infos du tournoi (nom / date / lieu / adresse / description) + contacts & sécurité
    //    + dossier d'invitation (modalités / parking / encadrement) + état de publication
    majInfosTournoi();
    majContactsSecurite();
    majInvitation();
    majSurPlace();   // Phase 1 — carte « Sur place »
    majReponse();    // Phase 1 — carte « Réponse à l'invitation »
    majApercuInvitation(); // Phase 1 — aperçu de l'email d'invitation
    majPublication();
    majDossier(); // état des sections du dossier club (suit toutes les infos ci-dessus)

    // 5) Tableau de bord (récap en haut de page) + horodatage
    majTableauBord();
    majHeureAdmin();

  } catch (erreur) {
    zoneReglages.innerHTML =
      '<div class="message erreur">Impossible de charger les réglages.<br>' +
      'Détail : ' + erreur.message + '</div>';
  }

  // Barre de connexion : boutons « Se connecter » / « Changer de clé » (délégué).
  document.getElementById('barre-connexion').addEventListener('click', onClicConnexion);

  // Bouton « Rafraîchir » : recharge scores/planning depuis le backend (utile le jour J).
  document.getElementById('bouton-rafraichir-admin').addEventListener('click', rafraichirAdmin);

  // Fil d'avancement « Où en suis-je ? » : clic/clavier sur une étape → défile jusqu'à sa section
  // (délégué sur le conteneur, valable même après re-rendu du fil).
  const zoneEtat = document.getElementById('etat-avancement');
  zoneEtat.addEventListener('click', onClicEtatAvancement);
  zoneEtat.addEventListener('keydown', onClicEtatAvancement);

  // On branche le formulaire d'ajout et les boutons de suppression (équipes).
  document.getElementById('form-equipe').addEventListener('submit', onAjouterEquipe);
  document.getElementById('liste-equipes').addEventListener('click', onClicListe);

  // Réglages (horaires + catégories) : écouteurs "délégués" posés sur le DOCUMENT
  // (et non sur #reglages) : le mode écrans DÉPLACE zone-horaires/zone-categories
  // hors de #reglages, et les événements doivent continuer à être captés. Chaque
  // gestionnaire filtre par id/classe/nom → aucun risque pour les autres formulaires.
  document.addEventListener('submit', onReglagesSubmit);
  document.addEventListener('click', onReglagesClick);
  document.addEventListener('change', onReglagesChange);
  document.addEventListener('input', onReglagesInput); // vérif. terrains manuels en direct

  // Zone terrains : écouteurs délégués (recalcul de capacité en direct + boutons).
  const zoneTerrains = document.getElementById('zone-terrains');
  zoneTerrains.addEventListener('input', onZoneTerrainsInput);
  zoneTerrains.addEventListener('change', onZoneTerrainsChange);
  zoneTerrains.addEventListener('click', onZoneTerrainsClick);

  // Bouton de génération des poules et du planning.
  document.getElementById('bouton-generer').addEventListener('click', onGenerer);

  // Bouton « Recalculer les horaires » (régénération non destructive, garde les scores).
  document.getElementById('bouton-recalculer-horaires').addEventListener('click', onRecalculerHoraires);

  // Modification manuelle des poules du matin : bouton d'entrée + clics dans l'éditeur (délégués).
  document.getElementById('bouton-modifier-poules').addEventListener('click', onModifierPoules);
  document.getElementById('edition-poules').addEventListener('click', onClicEditionPoules);

  // Clic sur une piste d'arbitrage (délégué, car le contenu est régénéré).
  document.getElementById('arbitrages').addEventListener('click', onClicArbitrage);

  // Bouton de génération de la phase après-midi (classement croisé).
  document.getElementById('bouton-apresmidi').addEventListener('click', onGenererApresMidi);

  // Bouton publier / masquer le tournoi.
  document.getElementById('bouton-publier').addEventListener('click', onPublier);

  // Bouton de réinitialisation complète du tournoi (zone de danger).
  document.getElementById('bouton-reinitialiser').addEventListener('click', onReinitialiser);

  // Les infos du tournoi se sauvegardent via leur bouton « Enregistrer les infos »
  // (onEnregistrerInfos) — et aussi lors de la publication (onPublier), par sécurité.
  // On empêche juste la soumission du formulaire (touche Entrée) qui rechargerait la page.
  document.getElementById('form-infos-tournoi').addEventListener('submit', function (e) { e.preventDefault(); });
  // Aperçu « carte du site » : se redessine À CHAQUE frappe dans les infos.
  document.getElementById('form-infos-tournoi').addEventListener('input', majApercuTournoi);
  // Bouton dédié : enregistre les infos (nom/date/lieu/description + affiche) à tout moment,
  // indépendamment de la publication.
  document.getElementById('bouton-enregistrer-infos').addEventListener('click', onEnregistrerInfos);
  // Choix d'un fichier d'affiche → aperçu immédiat.
  document.querySelector('#form-infos-tournoi [name="tournoi_affiche"]')
    .addEventListener('change', onChoisirAffiche);
  // Zone de glisser-déposer de l'affiche : survol (style) + dépôt du fichier.
  // Le CLIC, lui, est natif : la zone vit dans un <label> qui ouvre le sélecteur.
  const zoneDepot = document.getElementById('zone-depot-affiche');
  zoneDepot.addEventListener('dragover', function (e) {
    e.preventDefault(); // sinon le navigateur OUVRE le fichier au lieu de le déposer
    zoneDepot.classList.add('est-survolee');
  });
  zoneDepot.addEventListener('dragleave', function () { zoneDepot.classList.remove('est-survolee'); });
  zoneDepot.addEventListener('drop', onDeposerAffiche);
  // Bouton « Retirer l'affiche » (annule un choix non enregistré, ou supprime l'affiche enregistrée).
  document.getElementById('bouton-retirer-affiche').addEventListener('click', onRetirerAffiche);

  // Contacts & sécurité : enregistrement via son bouton dédié + champs conditionnels
  // (précisions du poste de secours, référent sécurité distinct) pilotés par les cases.
  document.getElementById('form-contacts-securite').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('form-contacts-securite').addEventListener('change', onContactsChange);
  document.getElementById('bouton-enregistrer-contacts').addEventListener('click', onEnregistrerContacts);

  // Dossier d'invitation — carte « Modalités d'inscription » : bouton dédié + champs
  // du tarif révélés par la case à cocher.
  document.getElementById('form-modalites').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('form-modalites').addEventListener('change', onModalitesChange);
  document.getElementById('bouton-enregistrer-modalites').addEventListener('click', onEnregistrerModalites);

  // Carte « Parking & accès » : texte + photo (même mécanisme que l'affiche du tournoi :
  // clic OU glisser-déposer, aperçu immédiat, upload Drive à l'enregistrement).
  document.getElementById('form-parking').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('bouton-enregistrer-parking').addEventListener('click', onEnregistrerParking);
  document.querySelector('#form-parking [name="parking_photo"]')
    .addEventListener('change', onChoisirPhotoParking);
  const zoneDepotParking = document.getElementById('zone-depot-parking');
  zoneDepotParking.addEventListener('dragover', function (e) {
    e.preventDefault(); // sinon le navigateur OUVRE le fichier au lieu de le déposer
    zoneDepotParking.classList.add('est-survolee');
  });
  zoneDepotParking.addEventListener('dragleave', function () { zoneDepotParking.classList.remove('est-survolee'); });
  zoneDepotParking.addEventListener('drop', onDeposerPhotoParking);
  document.getElementById('bouton-retirer-parking').addEventListener('click', onRetirerPhotoParking);

  // Carte « Encadrement & assurance » : bouton dédié.
  document.getElementById('form-encadrement').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('bouton-enregistrer-encadrement').addEventListener('click', onEnregistrerEncadrement);

  // Phase 1 — carte « Sur place » (3 cases à cocher) : bouton dédié.
  document.getElementById('form-surplace').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('bouton-enregistrer-surplace').addEventListener('click', onEnregistrerSurPlace);

  // Phase 1 — carte « Réponse à l'invitation » : bouton dédié + validation « au moins un
  // des deux » (tél / email) au blur des champs de contact.
  document.getElementById('form-reponse').addEventListener('submit', function (e) { e.preventDefault(); });
  document.getElementById('bouton-enregistrer-reponse').addEventListener('click', onEnregistrerReponse);
  document.getElementById('form-reponse').addEventListener('blur', onReponseBlur, true);

  // Phase 1 — aperçu de l'email d'invitation : mise à jour EN DIRECT quand on modifie les
  // cartes « Sur place » / « Réponse » (comme l'aperçu des Infos), + bouton d'envoi groupé.
  document.getElementById('form-surplace').addEventListener('change', majApercuInvitation);
  document.getElementById('form-reponse').addEventListener('input', majApercuInvitation);
  document.getElementById('form-reponse').addEventListener('change', majApercuInvitation);
  document.getElementById('bouton-envoyer-invitations').addEventListener('click', onEnvoyerInvitationsGroupe);

  // Clubs invités : ajout via le formulaire, statut/suppression/actions délégués sur la liste.
  document.getElementById('form-club-invite').addEventListener('submit', onAjouterClubInvite);
  document.getElementById('liste-clubs-invites').addEventListener('change', onChangerStatutClub);
  document.getElementById('liste-clubs-invites').addEventListener('click', onClicClubsInvites);

  // Champ date : ouvre le calendrier dès qu'on clique n'importe où sur la barre
  // (par défaut, seul le clic sur la petite icône l'ouvre). showPicker() peut ne pas
  // exister sur de vieux navigateurs → on ignore l'erreur, l'icône reste utilisable.
  document.querySelector('#form-infos-tournoi [name="tournoi_date"]')
    .addEventListener('click', function () {
      try { this.showPicker(); } catch (e) { /* navigateur non compatible : comportement normal */ }
    });

  // Assistant à cartes (surcouche de présentation) : une fois tout rendu et branché, on
  // laisse assistant.js réorganiser la page en cartes (ou non, selon la préférence mémorisée).
  if (typeof initAssistant === 'function') initAssistant();

  // « Connexion » : on demande la clé admin en DERNIER (une fois la page prête), puis mémorisée.
  // Ainsi l'assistant s'affiche tout de suite, sans attendre la saisie de la clé.
  const connecte = await connexion('admin', "à l'administration");
  majBarreConnexion(connecte);

  // Clubs invités : la liste contient des emails → elle ne se charge qu'avec la clé
  // admin (action protégée), donc APRÈS la connexion. Sans clé : message d'invite.
  if (connecte) chargerClubsInvites();
}

/* --------------------------------------------------------------------------
   INFOS DU TOURNOI (nom / date / lieu / description) — pour la carte + l'article
   -------------------------------------------------------------------------- */

/** Pré-remplit le formulaire des infos du tournoi avec ce qui est déjà enregistré. */
function majInfosTournoi() {
  const form = document.getElementById('form-infos-tournoi');
  if (!form) return;
  const g = configCourante.global || {};
  form.tournoi_nom.value = g.tournoi_nom || '';
  form.tournoi_date.value = g.tournoi_date || '';
  form.tournoi_lieu.value = g.tournoi_lieu || '';
  form.tournoi_adresse.value = g.tournoi_adresse || '';
  form.tournoi_description.value = g.tournoi_description || '';

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
}

/** URL d'affichage d'une affiche stockée dans Drive (CDN lh3, largeur maxi w).
 *  lh3.googleusercontent.com (et non drive.google.com/thumbnail, qui bloque le hotlinking). */
function urlAffiche(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 1000);
}

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
 *  que le site vitrine (extraitCourt), pour un aperçu au caractère près. */
function extraitCourt(texte, max) {
  const t = String(texte || '').trim();
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

  // Mêmes valeurs de repli que le site vitrine (actuTournoi, main.js).
  const nom = form.tournoi_nom.value.trim() || 'Tournoi Génération R92';
  const dateISO = form.tournoi_date.value || new Date().toISOString().slice(0, 10);
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
    const quand = form.tournoi_date.value ? formaterDateFr(form.tournoi_date.value) : 'À venir';
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

/** Quand on choisit un fichier via le sélecteur (clic sur la zone de dépôt). */
function onChoisirAffiche(evenement) {
  traiterFichierAffiche(evenement.target.files && evenement.target.files[0]);
}

/** Quand on DÉPOSE un fichier sur la zone (glisser-déposer depuis l'ordinateur). */
function onDeposerAffiche(evenement) {
  evenement.preventDefault(); // sinon le navigateur ouvre l'image dans l'onglet
  const zone = document.getElementById('zone-depot-affiche');
  if (zone) zone.classList.remove('est-survolee');
  const fichier = evenement.dataTransfer && evenement.dataTransfer.files && evenement.dataTransfer.files[0];
  traiterFichierAffiche(fichier);
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
    configCourante = await apiGet('getConfig');
    majInfosTournoi();
    afficherMessage(message, '🗑️ Affiche retirée.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
  }
}

/**
 * Redimensionne une image (fichier) à `maxDim` px max sur le plus grand côté et renvoie
 * un Data URI JPEG (qualité 0..1). Allège fortement le poids avant l'envoi au backend.
 */
function redimensionnerImage(fichier, maxDim, qualite) {
  return new Promise(function (resoudre, rejeter) {
    const img = new Image();
    img.onload = function () {
      let w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w >= h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resoudre(canvas.toDataURL('image/jpeg', qualite));
    };
    img.onerror = rejeter;
    const lecteur = new FileReader();
    lecteur.onload = function (e) { img.src = e.target.result; };
    lecteur.onerror = rejeter;
    lecteur.readAsDataURL(fichier);
  });
}

/** Lit les infos saisies dans le formulaire (nom / date / lieu / description). */
function lireInfosTournoi() {
  const form = document.getElementById('form-infos-tournoi');
  return {
    tournoi_nom: form.tournoi_nom.value.trim(),
    tournoi_date: form.tournoi_date.value,
    tournoi_lieu: form.tournoi_lieu.value.trim(),
    tournoi_adresse: form.tournoi_adresse.value.trim(),
    tournoi_description: form.tournoi_description.value.trim()
  };
}

/**
 * Enregistre les infos du tournoi (nom/date/lieu/description + affiche éventuelle),
 * indépendamment de la publication. Utilisable à tout moment, même après publication
 * (pour corriger une faute de frappe sans avoir à dépublier).
 */
async function onEnregistrerInfos() {
  const message = document.getElementById('message-infos-tournoi');
  const bouton = document.getElementById('bouton-enregistrer-infos');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    afficherMessage(message, 'Enregistrement des infos…', 'ok');
    await ecrireAdmin('enregistrerInfosTournoi', lireInfosTournoi());
    if (afficheDataURI) {
      afficherMessage(message, "Envoi de l'affiche…", 'ok');
      await ecrireAdmin('enregistrerAffiche', { affiche: afficheDataURI });
    }
    // On recharge la config pour refléter ce qui est réellement enregistré (dont l'affiche).
    configCourante = await apiGet('getConfig');
    majInfosTournoi();
    majDossier(); // le dossier club reflète les nouvelles infos
    document.getElementById('form-infos-tournoi').tournoi_affiche.value = ''; // vide le champ fichier
    afficherMessage(message, '✅ Infos enregistrées.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
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

  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerContactsSecurite', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    majContactsSecurite(); // ré-affiche les numéros normalisés + reprend la photo « propre »
    majDossier();          // les sections Sécurité / Contact du dossier suivent
    afficherMessage(message, '✅ Contacts & sécurité enregistrés.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/* --------------------------------------------------------------------------
   PHASE 1 — carte « Sur place » (buvette / sandwich / boutique R92)
   et carte « Réponse à l'invitation » (date limite + contact référent).
   -------------------------------------------------------------------------- */

/** Pré-remplit la carte « Sur place » avec l'état enregistré. */
function majSurPlace() {
  const form = document.getElementById('form-surplace');
  if (!form) return;
  const g = configCourante.global || {};
  form.buvette_disponible.checked = estOui(g.buvette_disponible);
  form.espace_sandwich_disponible.checked = estOui(g.espace_sandwich_disponible);
  form.boutique_r92_disponible.checked = estOui(g.boutique_r92_disponible);
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
    boutique_r92_disponible:    form.boutique_r92_disponible.checked ? 'oui' : 'non'
  };
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerSurPlace', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    majApercuInvitation(); // l'aperçu de l'email suit (ligne « Sur place »)
    afficherMessage(message, '✅ « Sur place » enregistré.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
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

  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerReponseInvitation', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    majReponse(); // ré-affiche le numéro normalisé
    majApercuInvitation(); // l'aperçu de l'email suit (date limite de réponse)
    afficherMessage(message, '✅ « Réponse à l\'invitation » enregistrée.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/* --------------------------------------------------------------------------
   INVITATION PHASE 1 — aperçu de l'email (live) + envoi individuel / groupé.
   L'aperçu suit le MÊME principe que celui de la carte « Infos du tournoi » :
   mise à jour EN DIRECT à partir des données du tournoi et des valeurs LIVE des
   cartes « Sur place » / « Réponse à l'invitation ». Le contenu ENVOYÉ (objet +
   corps après salutation) est construit par les mêmes fonctions → l'email reçu
   correspond exactement à l'aperçu, seule la salutation variant par club.
   -------------------------------------------------------------------------- */

/** URL absolue de la page d'invitation publique (Phase 1), pour le lien de l'email. */
function lienInvitationPublique() {
  return new URL('invitation-club.html', window.location.href).toString();
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

/** Corps APRÈS la salutation (identique pour tous ; le backend préfixe « Bonjour {prénom}, »).
 *  Réactif aux cartes Sur place (ligne « Sur place ») et Réponse (date limite). */
function corpsApresInvitation(g) {
  const nom = String(g.tournoi_nom || '').trim() || 'notre tournoi';
  let s = 'Nous avons le plaisir de vous inviter au ' + nom + '.\n'
    + 'Vous trouverez toutes les informations (catégories concernées, déroulé de la journée, '
    + 'réponse attendue) sur la page d\'invitation ci-dessous :\n\n'
    + lienInvitationPublique() + '\n';
  const services = [];
  if (estOui(g.buvette_disponible)) services.push('buvette');
  if (estOui(g.espace_sandwich_disponible)) services.push('espace sandwich');
  if (estOui(g.boutique_r92_disponible)) services.push('boutique R92');
  if (services.length) s += '\nSur place le jour J : ' + services.join(', ') + '.\n';
  if (String(g.date_limite_reponse || '').trim()) {
    s += '\nMerci de nous faire part de votre réponse avant le ' + formaterDateFr(g.date_limite_reponse) + '.\n';
  }
  s += '\nAu plaisir de vous accueillir,\nGénération R92';
  return s;
}

/** Prénom d'exemple pour l'aperçu : premier club avec un prénom, sinon « Prénom ». */
function exemplePrenomInvitation() {
  const c = (clubsInvitesCourants || []).find(function (x) { return String(x.club_contact_prenom || '').trim(); });
  return c ? String(c.club_contact_prenom).trim() : 'Prénom';
}

/** Corps COMPLET affiché dans l'aperçu (salutation d'exemple + corps commun). */
function corpsApercuInvitation(g) {
  return 'Bonjour ' + exemplePrenomInvitation() + ',\n\n' + corpsApresInvitation(g);
}

/** (Re)dessine l'aperçu de l'email d'invitation à partir de l'état courant. */
function majApercuInvitation() {
  const objet = document.getElementById('apercu-invitation-objet');
  const corps = document.getElementById('apercu-invitation-corps');
  if (!objet || !corps) return;
  const g = globalInvitation();
  objet.textContent = sujetInvitation(g);
  corps.textContent = corpsApercuInvitation(g); // retours ligne conservés via CSS (pre-wrap)
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
  if (!await dialogConfirmer('Envoyer l\'invitation à « ' + nom + ' » (' + email + ') ?', { ok: 'Envoyer' })) return;
  const g = globalInvitation();
  try {
    const res = await ecrireAdmin('envoyerInvitationClub', {
      club_nom: nom, sujet: sujetInvitation(g), corps_apres: corpsApresInvitation(g)
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
  const g = globalInvitation();

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
      sujet: sujetInvitation(g), corps_apres: corpsApresInvitation(g), renvoyer: renvoyer ? 'oui' : 'non'
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
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerInvitation', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    majDossier(); // les sections du dossier suivent
    afficherMessage(message, texteOk, 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
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
    configCourante = await apiGet('getConfig');
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

/** Quand on choisit un fichier via le sélecteur (clic sur la zone de dépôt). */
function onChoisirPhotoParking(evenement) {
  traiterFichierParking(evenement.target.files && evenement.target.files[0]);
}

/** Quand on DÉPOSE un fichier sur la zone (glisser-déposer depuis l'ordinateur). */
function onDeposerPhotoParking(evenement) {
  evenement.preventDefault(); // sinon le navigateur ouvre l'image dans l'onglet
  const zone = document.getElementById('zone-depot-parking');
  if (zone) zone.classList.remove('est-survolee');
  const fichier = evenement.dataTransfer && evenement.dataTransfer.files && evenement.dataTransfer.files[0];
  traiterFichierParking(fichier);
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
    configCourante = await apiGet('getConfig');
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
    ? '<button class="bouton bouton-generer-dossier" data-club="' + echapper(nom) + '">📄 Générer le dossier final</button>'
    : '';

  return '<div class="club-panneau" data-club="' + echapper(nom) + '">' +
    '<p class="club-panneau-titre">Catégories engagées par le club</p>' +
    (cats.length
      ? '<div class="club-cats">' + cases + '</div>'
      : '<p class="vide">Ajoute d\'abord des catégories au tournoi.</p>') +
    '<label class="club-prenom-champ">Prénom du contact (pour la politesse du dossier)' +
      '<input type="text" class="club-prenom-input" value="' + echapper(String(club.club_contact_prenom || '')) + '" ' +
             'placeholder="Ex : Camille" autocomplete="off"></label>' +
    '<div class="club-panneau-actions">' +
      '<button class="bouton bouton-cats-club" data-club="' + echapper(nom) + '">💾 Enregistrer la sélection</button>' +
      boutonGenerer +
    '</div>' +
  '</div>';
}

/** Affiche la liste des clubs invités (nom, contact, statut, panneau Accepté, envoi). */
function afficherClubsInvites() {
  const zone = document.getElementById('liste-clubs-invites');
  if (!zone) return;

  if (!clubsInvitesCourants.length) {
    zone.innerHTML = '<p class="vide">Aucun club invité pour le moment. Ajoute le premier ci-dessus.</p>';
    return;
  }

  let html = '';
  clubsInvitesCourants.forEach(function (club) {
    const nom = String(club.club_nom || '');
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
    // Deux badges distincts : invitation (Phase 1) et dossier (Phase 2).
    const badges =
      (invite ? '<span class="club-envoye club-badge-invite" title="Invitation envoyée">✉️ Invité le ' + echapper(invite) + '</span>' : '') +
      (envoye ? '<span class="club-envoye" title="Dossier envoyé">📧 Dossier le ' + echapper(envoye) + '</span>' : '');
    // Bouton d'envoi INDIVIDUEL de l'invitation (désactivé si le club n'a pas d'email).
    const boutonInviter = aEmail
      ? '<button class="bouton-icone bouton-inviter-club" title="Envoyer l\'invitation" aria-label="Envoyer l\'invitation à ' + echapper(nom) + '" data-club="' + echapper(nom) + '">✉️</button>'
      : '<button class="bouton-icone bouton-inviter-club" title="Pas d\'email : à inviter manuellement" aria-label="Pas d\'email" disabled>✉️</button>';

    html +=
      '<div class="equipe-item club-invite-item ' + classeStatutClub(club.statut) + '" data-club="' + echapper(nom) + '">' +
        '<span class="nom">' + echapper(nom) +
          (contact ? '<span class="club-contact">' + echapper(contact) + '</span>' : '') +
        '</span>' +
        '<div class="equipe-actions">' +
          badges +
          boutonInviter +
          '<select class="statut-club" data-club="' + echapper(nom) + '" ' +
                  'aria-label="Statut de ' + echapper(nom) + '">' + options + '</select>' +
          '<button class="bouton-suppr bouton-icone bouton-suppr-club" title="Retirer" aria-label="Retirer" ' +
                  'data-club="' + echapper(nom) + '">🗑️</button>' +
        '</div>' +
        // Panneau de sélection des catégories + génération, visible seulement si Accepté.
        (estAccepte(club.statut) ? panneauAccepteClub(club, nom) : '') +
      '</div>';
  });
  zone.innerHTML = html;
  majApercuInvitation(); // l'exemple de prénom de l'aperçu suit la liste
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

  const nom = champNom.value.trim().toUpperCase(); // comme les équipes : noms en MAJUSCULES
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
      club_contact_nom: champContact.value.trim(),
      club_contact_prenom: champPrenom.value.trim(),
      club_contact_email: champEmail.value.trim()
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
    afficherClubsInvites(); // fait apparaître « Générer le dossier final »
    afficherMessage(message, cochees.length
      ? '✅ « ' + nom +' » — catégories engagées : ' + cats + '.'
      : '✅ « ' + nom + ' » — sélection enregistrée (aucune catégorie cochée).', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
    bouton.textContent = texte;
  }
}

/** Lien ABSOLU du dossier Phase 2 personnalisé d'un club (dossier-club.html?tournoi=…&club=…). */
function lienDossierClub(nom) {
  const url = new URL('dossier-club.html', window.location.href);
  const tn = (configCourante.global && configCourante.global.tournoi_nom) || '';
  if (tn) url.searchParams.set('tournoi', tn);
  url.searchParams.set('club', nom);
  return url.toString();
}

/**
 * « Générer le dossier final » : construit le lien personnalisé, puis
 *  - si le club a un email → ouvre l'aperçu email avant tout envoi ;
 *  - sinon → bascule en mode « Copier le lien » (pas d'aperçu, pas d'envoi auto).
 */
async function genererDossierFinal(nom) {
  const club = clubsInvitesCourants.find(function (c) { return memeTexteSouple(c.club_nom, nom); });
  if (!club) return;
  const email = String(club.club_contact_email || '').trim();
  const lien = lienDossierClub(String(club.club_nom || ''));

  if (email) { ouvrirApercuEmail(club, lien); return; }

  // Pas d'email : mode manuel. On copie le lien (best-effort) et on l'affiche pour copie.
  try { if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(lien); } catch (e) { /* copie indispo */ }
  await dialogDemander(
    'Ce club n\'a pas d\'email de contact.\nCopie le lien du dossier ci-dessous et envoie-le manuellement :',
    lien, { ok: 'Fermer' });
}

/**
 * Fenêtre d'APERÇU de l'email (Phase 2), AVANT tout envoi :
 *  - Destinataire (lecture seule) = email de contact du club ;
 *  - Objet pré-rempli, modifiable ;
 *  - Corps pré-rempli (politesse personnalisée + lien), modifiable en texte libre.
 * « Envoyer » déclenche l'envoi réel (envoyerDossierEmail) ; dossier_envoye n'est posé
 * qu'en cas de succès. « Annuler » ferme sans rien envoyer.
 */
function ouvrirApercuEmail(club, lien) {
  const nom = String(club.club_nom || '');
  const email = String(club.club_contact_email || '');
  const prenom = String(club.club_contact_prenom || '').trim();
  const nomTournoi = (configCourante.global && configCourante.global.tournoi_nom) || 'Tournoi Génération R92';
  const bonjour = prenom ? 'Bonjour ' + prenom + ',' : 'Bonjour,';
  const sujetDefaut = 'Votre dossier complet — ' + nomTournoi;
  const corpsDefaut = bonjour + '\n\n'
    + 'Nous avons bien reçu votre retour concernant votre souhait de participer au ' + nomTournoi + '.\n'
    + 'Vous trouverez le dossier complet de la journée (infos pratiques, programme, format sportif, '
    + 'sécurité et contact) en suivant ce lien :\n' + lien + '\n\n'
    + 'À très bientôt,\nGénération R92';

  const overlay = document.createElement('div');
  overlay.className = 'eml-overlay';
  overlay.innerHTML =
    '<div class="eml-carte" role="dialog" aria-modal="true">' +
      '<h2 class="eml-titre">Aperçu de l\'email — ' + echapper(nom) + '</h2>' +
      '<p class="eml-msg" id="eml-msg"></p>' +
      '<label class="eml-champ">Destinataire' +
        '<input type="email" id="eml-dest" value="' + echapper(email) + '" readonly></label>' +
      '<label class="eml-champ">Objet' +
        '<input type="text" id="eml-sujet" value="' + echapper(sujetDefaut) + '"></label>' +
      '<label class="eml-champ">Message' +
        '<textarea id="eml-corps">' + echapper(corpsDefaut) + '</textarea></label>' +
      '<div class="eml-actions">' +
        '<button type="button" class="bouton bouton-doux" id="eml-annuler">Annuler</button>' +
        '<button type="button" class="bouton" id="eml-envoyer">📧 Envoyer</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  const fermer = function () { overlay.remove(); };
  overlay.addEventListener('click', function (e) { if (e.target === overlay) fermer(); });
  overlay.querySelector('#eml-annuler').addEventListener('click', fermer);

  overlay.querySelector('#eml-envoyer').addEventListener('click', async function () {
    const boutonEnvoi = overlay.querySelector('#eml-envoyer');
    const msg = overlay.querySelector('#eml-msg');
    const sujet = overlay.querySelector('#eml-sujet').value.trim();
    const corps = overlay.querySelector('#eml-corps').value;
    msg.className = 'eml-msg';
    if (!sujet) { msg.className = 'eml-msg ko'; msg.textContent = '⚠️ L\'objet est vide.'; return; }
    if (!corps.trim()) { msg.className = 'eml-msg ko'; msg.textContent = '⚠️ Le message est vide.'; return; }

    boutonEnvoi.disabled = true;
    const texte = boutonEnvoi.textContent;
    boutonEnvoi.textContent = 'Envoi…';
    msg.className = 'eml-msg';
    msg.textContent = 'Envoi en cours…';
    try {
      const res = await ecrireAdmin('envoyerDossierEmail', { club_nom: nom, sujet: sujet, corps: corps });
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
    bouton.textContent = '🙈 Masquer le tournoi';
  } else {
    etat.textContent = '⚪️ Non publié (les visiteurs voient « à venir »)';
    bouton.textContent = '🚀 Publier le tournoi';
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
      await ecrireAdmin('enregistrerInfosTournoi', lireInfosTournoi());
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
    configCourante = await apiGet('getConfig');
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

/* --------------------------------------------------------------------------
   TABLEAU DE BORD (récap de l'état du tournoi, en haut de page)
   -------------------------------------------------------------------------- */

/** Icône SVG filaire pour la tuile « Planning matin » du tableau de bord :
 *  ✓ (vert) quand le planning est généré, horloge (grise) en attente. */
function svgEtatTuile(etat) {
  const dessin = etat === 'valide'
    ? '<circle cx="12" cy="12" r="9"></circle><path d="M8.3 12.6l2.5 2.5 4.9-5.6"></path>'
    : '<circle cx="12" cy="12" r="9"></circle><path d="M12 7.5V12l3 2"></path>';
  return '<svg class="tb-ic ' + (etat === 'valide' ? 'est-valide' : 'est-attente') + '" viewBox="0 0 24 24" ' +
         'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
         'aria-hidden="true">' + dessin + '</svg>';
}

/**
 * Met à jour le tableau de bord : catégories, équipes, planning, publication.
 * Lit l'état gardé en mémoire (configCourante / equipesCourantes / matchsCourants).
 */
function majTableauBord() {
  const elCat = document.getElementById('tb-categories');
  const elEq  = document.getElementById('tb-equipes');
  const elPl  = document.getElementById('tb-planning');
  const elPub = document.getElementById('tb-publication');
  if (!elCat || !elEq || !elPl || !elPub) return;

  // Catégories (toute catégorie existante est active).
  const cats = configCourante.categories || [];
  elCat.textContent = String(cats.length);

  // Équipes.
  elEq.textContent = (equipesCourantes || []).length;

  // Planning matin : « Validé » dès qu'il est généré, sinon « En attente »
  // (icône SVG filaire : ✓ vert ou horloge — l'après-midi a sa propre étape
  // dans la barre latérale, la tuile reste donc simple et lisible).
  const matin = (matchsCourants || []).filter(function (m) { return String(m.phase) !== 'classement'; });
  if (matin.length === 0) elPl.innerHTML = svgEtatTuile('attente') + '<span class="tb-val-texte">En attente</span>';
  else                    elPl.innerHTML = svgEtatTuile('valide') + '<span class="tb-val-texte">Validé</span>';

  // Publication : même système que « Planning matin » (icône SVG + texte).
  if (estPublie()) elPub.innerHTML = svgEtatTuile('valide') + '<span class="tb-val-texte">Publié</span>';
  else             elPub.innerHTML = svgEtatTuile('attente') + '<span class="tb-val-texte">En attente</span>';

  // Fil d'avancement « Où en suis-je ? » (recalculé à chaque mise à jour du tableau de bord).
  majEtatAvancement();
  // Bouton « Recalculer les horaires » : visible seulement quand c'est utile ET légitime.
  majBoutonRecalculer();
}

/* --------------------------------------------------------------------------
   « OÙ EN SUIS-JE ? » — fil d'avancement + thermomètre de la journée
   --------------------------------------------------------------------------
   ÉTAPE 1 du « cerveau des dépendances » : purement AFFICHAGE. On ne modifie
   AUCUNE logique existante — on lit l'état déjà présent dans les données
   (configCourante / equipesCourantes / matchsCourants) et on le montre d'un
   coup d'œil, avec une pastille par étape :
     ✅ fait · ⚪️ à faire · 🟠 à refaire (incohérence détectée) · ⏳ en attente.
   La détection fine « à recalculer » quand on change un horaire/réglage
   viendra à l'ÉTAPE 2 (signatures de génération).
   -------------------------------------------------------------------------- */

/** Nombre d'équipes par catégorie (clé = nom de catégorie). */
function nbEquipesParCategorie() {
  const compte = {};
  (equipesCourantes || []).forEach(function (e) {
    const c = String(e.categorie || '');
    if (c) compte[c] = (compte[c] || 0) + 1;
  });
  return compte;
}

/**
 * SIGNATURE DE GÉNÉRATION (« cerveau des dépendances », étape 2).
 * ⚠️ DOIT rester STRICTEMENT identique à signatureGeneration() du backend (Code.gs) :
 * même champs, même tri, même hachage — sinon la comparaison est faussée. On résume les
 * réglages qui décalent réellement les horaires des matchs ; on EXCLUT heure_fin /
 * heure_fin_auto (simple cible d'arrivée, réécrite par la génération en mode auto).
 */
function hachageChaine(s) {
  let h = 5381;
  s = String(s);
  for (let i = 0; i < s.length; i++) {
    h = (h * 33 + s.charCodeAt(i)) % 2147483647;
  }
  return h.toString(36);
}

function signatureGeneration(global, categories, equipes) {
  global = global || {};
  const parts = [];
  parts.push('hd=' + (global.heure_debut || ''));
  parts.push('bt=' + (global.battement_terrain_min || ''));
  parts.push('pd=' + (global.pause_dejeuner_debut || ''));
  parts.push('pdd=' + (global.pause_dejeuner_duree_min || ''));

  const nbCat = {};
  (equipes || []).forEach(function (e) {
    const c = String(e.categorie || '');
    if (c) nbCat[c] = (nbCat[c] || 0) + 1;
  });

  const cats = (categories || []).filter(function (c) {
    return String(c.presente).toLowerCase() === 'oui';
  }).slice().sort(function (a, b) {
    const x = String(a.categorie), y = String(b.categorie);
    return x < y ? -1 : (x > y ? 1 : 0);
  });

  cats.forEach(function (c) {
    parts.push('cat=' + c.categorie
      + '|t=' + (c.terrains || '')
      + '|np=' + (c.nb_poules || '')
      + '|fmt=' + (c.format_mi_temps || '')
      + '|dm=' + (c.duree_mi_temps_min || '')
      + '|pm=' + (c.pause_mi_temps_min || '')
      + '|rc=' + (c.recup_entre_matchs_min || '')
      + '|n=' + (nbCat[String(c.categorie)] || 0));
  });

  return hachageChaine(parts.join(';'));
}

/**
 * SIGNATURE DE STRUCTURE (étape 3). ⚠️ Identique à signatureStructure() du backend.
 * Résume la COMPOSITION des poules (nb de poules + ids d'équipes par catégorie) : si elle
 * est INCHANGÉE, un simple recalcul des horaires (scores gardés) suffit ; sinon il faut un
 * vrai tirage.
 */
function signatureStructure(categories, equipes) {
  const parCat = {};
  (equipes || []).forEach(function (e) {
    const c = String(e.categorie || '');
    if (c) (parCat[c] = parCat[c] || []).push(String(e.id_equipe));
  });
  const cats = (categories || []).filter(function (c) {
    return String(c.presente).toLowerCase() === 'oui';
  }).slice().sort(function (a, b) {
    const x = String(a.categorie), y = String(b.categorie);
    return x < y ? -1 : (x > y ? 1 : 0);
  });
  const parts = [];
  cats.forEach(function (c) {
    const ids = (parCat[String(c.categorie)] || []).slice().sort();
    parts.push('cat=' + c.categorie + '|np=' + (c.nb_poules || '') + '|ids=' + ids.join(','));
  });
  return hachageChaine(parts.join(';'));
}

/**
 * Calcule l'état de chaque étape de préparation, dans l'ordre logique de la journée.
 * Renvoie un tableau d'objets { cle, titre, ancre, statut, detail }.
 * statut ∈ 'fait' | 'afaire' | 'arefaire' | 'attente'.
 */
function calculerEtatsEtapes() {
  const g = configCourante.global || {};
  const catsPresentes = (configCourante.categories || []).filter(estPresente);
  const equipes = equipesCourantes || [];
  const nbParCat = nbEquipesParCategorie();
  const matchs = matchsCourants || [];
  const matin = matchs.filter(function (m) { return String(m.phase) !== 'classement'; });
  const aprem = matchs.filter(function (m) { return String(m.phase) === 'classement'; });

  const etapes = [];

  // 1) Horaires de la journée
  if (!g.heure_debut) {
    etapes.push({ cle: 'horaires', titre: 'Horaires', ancre: 'zone-horaires', statut: 'afaire', detail: 'À renseigner' });
  } else {
    etapes.push({ cle: 'horaires', titre: 'Horaires', ancre: 'zone-horaires', statut: 'fait', detail: 'Début ' + g.heure_debut });
  }

  // 2) Catégories
  if (catsPresentes.length === 0) {
    etapes.push({ cle: 'categories', titre: 'Catégories', ancre: 'zone-categories', statut: 'afaire', detail: 'Aucune' });
  } else {
    etapes.push({ cle: 'categories', titre: 'Catégories', ancre: 'zone-categories', statut: 'fait', detail: catsPresentes.length + ' catégorie(s)' });
  }

  // 3) Équipes (à refaire si une catégorie présente n'a aucune équipe)
  if (equipes.length === 0) {
    etapes.push({ cle: 'equipes', titre: 'Équipes', ancre: 'bloc-equipes', statut: 'afaire', detail: 'Aucune' });
  } else {
    const vides = catsPresentes
      .filter(function (c) { return !nbParCat[String(c.categorie)]; })
      .map(function (c) { return String(c.categorie); });
    if (vides.length) {
      etapes.push({ cle: 'equipes', titre: 'Équipes', ancre: 'bloc-equipes', statut: 'arefaire', detail: 'Sans équipe : ' + vides.join(', ') });
    } else {
      etapes.push({ cle: 'equipes', titre: 'Équipes', ancre: 'bloc-equipes', statut: 'fait', detail: equipes.length + ' équipe(s)' });
    }
  }

  // 4) Répartition des terrains (à refaire si une catégorie avec équipes n'a pas de terrain)
  if (catsPresentes.length === 0 || equipes.length === 0) {
    etapes.push({ cle: 'terrains', titre: 'Terrains', ancre: 'bloc-terrains', statut: 'afaire', detail: 'En attente des catégories / équipes' });
  } else {
    const sansTerrain = catsPresentes
      .filter(function (c) { return nbParCat[String(c.categorie)] && !String(c.terrains || '').trim(); })
      .map(function (c) { return String(c.categorie); });
    if (sansTerrain.length) {
      etapes.push({ cle: 'terrains', titre: 'Terrains', ancre: 'bloc-terrains', statut: 'arefaire', detail: 'Sans terrain : ' + sansTerrain.join(', ') });
    } else {
      etapes.push({ cle: 'terrains', titre: 'Terrains', ancre: 'bloc-terrains', statut: 'fait', detail: 'Répartis' });
    }
  }

  // 5) Poules & planning
  //    À refaire si : une catégorie « jouable » est absente du planning (cas structurel),
  //    OU si un réglage a changé depuis la dernière génération (signature ≠ celle stockée).
  if (matin.length === 0) {
    etapes.push({ cle: 'poules', titre: 'Poules & planning', ancre: 'bloc-generation', statut: 'afaire', detail: 'À générer' });
  } else {
    const catsDansPlanning = {};
    matin.forEach(function (m) { catsDansPlanning[String(m.categorie)] = true; });
    const manquantes = catsPresentes
      .filter(function (c) { return nbParCat[String(c.categorie)] >= 2 && !catsDansPlanning[String(c.categorie)]; })
      .map(function (c) { return String(c.categorie); });

    // Signature enregistrée à la dernière génération vs signature des réglages actuels.
    const sigStockee = g.signature_generation || '';
    const sigActuelle = signatureGeneration(g, configCourante.categories, equipesCourantes);
    const reglagesModifies = sigStockee && sigActuelle !== sigStockee;

    if (manquantes.length) {
      etapes.push({ cle: 'poules', titre: 'Poules & planning', ancre: 'bloc-generation', statut: 'arefaire', detail: 'Absentes du planning : ' + manquantes.join(', ') });
    } else if (reglagesModifies) {
      etapes.push({ cle: 'poules', titre: 'Poules & planning', ancre: 'bloc-generation', statut: 'arefaire', detail: 'Réglages modifiés depuis la génération' });
    } else {
      etapes.push({ cle: 'poules', titre: 'Poules & planning', ancre: 'bloc-generation', statut: 'fait', detail: matin.length + ' match(s) le matin' });
    }
  }

  // 6) Phase après-midi
  if (matin.length === 0) {
    etapes.push({ cle: 'apresmidi', titre: 'Après-midi', ancre: 'bloc-apresmidi', statut: 'afaire', detail: 'En attente du matin' });
  } else if (aprem.length > 0) {
    etapes.push({ cle: 'apresmidi', titre: 'Après-midi', ancre: 'bloc-apresmidi', statut: 'fait', detail: 'Générée' });
  } else {
    const saisis = matin.filter(function (m) { return estTermine(m.statut); }).length;
    if (saisis === matin.length) {
      etapes.push({ cle: 'apresmidi', titre: 'Après-midi', ancre: 'bloc-apresmidi', statut: 'afaire', detail: 'Prêt à générer' });
    } else {
      etapes.push({ cle: 'apresmidi', titre: 'Après-midi', ancre: 'bloc-apresmidi', statut: 'attente', detail: saisis + '/' + matin.length + ' scores du matin' });
    }
  }

  return etapes;
}

/** Affiche le fil d'avancement + le thermomètre de la journée dans #etat-avancement. */
function majEtatAvancement() {
  const zone = document.getElementById('etat-avancement');
  if (!zone) return;

  const etapes = calculerEtatsEtapes();
  const ICONES = { fait: '✅', afaire: '⚪️', arefaire: '🟠', attente: '⏳' };

  let h = '<div class="ea-entete"><span class="ea-titre">Où en suis-je&nbsp;?</span>' +
          '<span class="ea-legende">Clique une étape pour t\'y rendre</span></div>';

  // Verdict « prêt à publier ? » : synthèse de ce qui bloque encore (hors après-midi, qui
  // peut se générer plus tard). Chaque item restant est cliquable → mène à son étape.
  const bloquants = etapes.filter(function (e) { return e.cle !== 'apresmidi' && e.statut !== 'fait'; });
  if (bloquants.length === 0) {
    h += '<div class="ea-verdict ea-verdict-ok"><span class="ea-coche" aria-hidden="true">' +
         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
         'stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12.6l3.4 3.4 7.6-8.4"></path></svg>' +
         '</span><span><strong>Tout est prêt</strong> — tu peux publier le tournoi.</span></div>';
  } else {
    h += '<div class="ea-verdict ea-verdict-ko">⚠️ <strong>Avant de publier, il reste&nbsp;:</strong> ' +
      bloquants.map(function (e) {
        return '<button type="button" class="ea-lien-etape" data-ancre="' + echapper(e.ancre) + '">' +
               echapper(e.titre) + '</button>';
      }).join(' ') + '</div>';
  }

  h += '<ol class="ea-fil">';
  etapes.forEach(function (e) {
    h += '<li class="ea-etape ea-' + e.statut + '" role="button" tabindex="0" ' +
           'data-ancre="' + echapper(e.ancre) + '" title="' + echapper(e.detail) + '">' +
           '<span class="ea-pastille">' + ICONES[e.statut] + '</span>' +
           '<span class="ea-nom">' + echapper(e.titre) + '</span>' +
           '<span class="ea-detail">' + echapper(e.detail) + '</span>' +
         '</li>';
  });
  h += '</ol>';

  // Thermomètre de la journée : début → pause → heure de fin prévue.
  const g = configCourante.global || {};
  const poules = etapes.find(function (e) { return e.cle === 'poules'; });
  const debut = g.heure_debut ? echapper(g.heure_debut) : '—';
  const pauseTxt = g.pause_dejeuner_debut
    ? echapper(g.pause_dejeuner_debut) +
      (g.pause_dejeuner_duree_min ? ' (' + echapper(String(g.pause_dejeuner_duree_min)) + ' min)' : '')
    : '—';
  const finVal = g.heure_fin_projetee || g.heure_fin_matin || g.heure_fin || '';
  let finTxt;
  if (!poules || poules.statut === 'afaire') {
    finTxt = '<span class="ea-therm-warn">à générer</span>';
  } else if (poules.statut !== 'fait') {
    finTxt = (finVal ? echapper(finVal) + ' ' : '') + '<span class="ea-therm-warn">⚠️ à recalculer</span>';
  } else {
    finTxt = echapper(finVal || '—');
  }

  h += '<div class="ea-thermo">' +
         '<span class="ea-t"><b>🕘 Début</b> ' + debut + '</span>' +
         '<span class="ea-t"><b>🍽️ Pause déj.</b> ' + pauseTxt + '</span>' +
         '<span class="ea-t"><b>🏁 Fin prévue</b> ' + finTxt + '</span>' +
       '</div>';

  zone.innerHTML = h;

  // Assistant à cartes : l'état des étapes vient (peut-être) de changer → le verrou
  // du bouton « Suivant » doit suivre (grisé tant que l'étape n'est pas complète).
  if (typeof assistantMajVerrou === 'function') assistantMajVerrou();
}

/**
 * Clic (ou touche Entrée/Espace) sur une étape du fil OU un lien du verdict.
 * En mode assistant, on va à l'ÉTAPE correspondante (sinon la cible serait masquée) ;
 * en vue classique, on défile jusqu'à la section.
 */
function onClicEtatAvancement(evenement) {
  if (evenement.type === 'keydown' && evenement.key !== 'Enter' && evenement.key !== ' ') return;
  const li = evenement.target.closest('[data-ancre]');
  if (!li) return;
  evenement.preventDefault();
  const ancre = li.getAttribute('data-ancre');
  if (typeof assistantEstActif === 'function' && assistantEstActif()) {
    assistantAllerVersBloc(ancre);
  } else {
    const cible = document.getElementById(ancre);
    if (cible && cible.scrollIntoView) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Recharge tout l'état du tournoi depuis le backend (getAll) et ré-affiche les vues « live »
 * TOUJOURS communes : planning, préparation de l'après-midi, tableau de bord. Selon les options,
 * ré-affiche AUSSI les zones qui ont pu changer selon l'action déclencheuse.
 *
 * Point de passage UNIQUE : avant, ce bloc « recharger getAll + réassigner l'état + re-rendre »
 * était recopié à l'identique dans chaque handler (rafraîchir / générer / recalculer / après-midi
 * / réinitialiser / éditer les poules). Un seul endroit à faire évoluer désormais.
 *
 * @param {Object} [opt]
 * @param {boolean} [opt.reglages]    ré-injecter les formulaires de réglages (horaires + catégories)
 * @param {boolean} [opt.selectCats]  re-remplir la liste déroulante des catégories (ajout d'équipe)
 * @param {boolean} [opt.terrains]    ré-injecter la zone terrains physiques / répartition
 * @param {boolean} [opt.equipes]     ré-afficher la liste des équipes
 * @param {boolean} [opt.infos]       ré-afficher les infos du tournoi (nom/date/affiche)
 * @param {boolean} [opt.publication] ré-afficher l'état de publication
 * @param {boolean} [opt.heure]       mettre à jour l'horodatage « Mis à jour à … »
 */
async function rechargerEtRendre(opt) {
  opt = opt || {};
  const data = await apiGet('getAll'); // { config, equipes, poules, matchs }
  configCourante = data.config;
  equipesCourantes = data.equipes;
  matchsCourants = data.matchs || [];

  if (opt.reglages)   injecterReglages(data.config.global, data.config.categories);
  if (opt.terrains)   injecterTerrains();
  if (opt.selectCats) remplirSelectCategories(data.config.categories);
  if (opt.equipes)    afficherEquipes(data.equipes);

  afficherPlanning(data.poules, data.matchs);
  majApresMidi();

  if (opt.infos)       { majInfosTournoi(); majContactsSecurite(); majInvitation(); }
  if (opt.publication) majPublication();
  majDossier(); // la config vient d'être rechargée : l'état du dossier suit
  majTableauBord();
  if (opt.heure)       majHeureAdmin();
}

/**
 * Rafraîchit les données du tournoi (scores saisis sur les téléphones, etc.) et met à jour
 * les vues « live » : tableau de bord, planning, équipes, état de préparation de l'après-midi.
 * On NE re-rend PAS les formulaires de réglages ni le formulaire d'infos, pour ne pas écraser
 * une saisie en cours (ces réglages ne changent pas depuis un autre appareil pendant la journée).
 */
async function rafraichirAdmin() {
  const bouton = document.getElementById('bouton-rafraichir-admin');
  const texte = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = '⏳ …';
  try {
    await rechargerEtRendre({ equipes: true, publication: true, heure: true });
  } catch (err) {
    // On garde l'affichage actuel en cas d'erreur réseau.
  } finally {
    bouton.disabled = false;
    bouton.textContent = texte;
  }
}

/** Affiche l'heure de la dernière mise à jour des données. */
function majHeureAdmin() {
  const el = document.getElementById('maj-admin');
  if (el) el.textContent = 'Mis à jour à ' + new Date().toLocaleTimeString('fr-FR');
}

/* --------------------------------------------------------------------------
   BARRE DE CONNEXION (repère visuel de la clé admin)
   -------------------------------------------------------------------------- */

/** Affiche l'état de connexion (clé admin active ou non) + le bon bouton. */
function majBarreConnexion(connecte) {
  const barre = document.getElementById('barre-connexion');
  if (!barre) return;
  barre.hidden = false;
  if (connecte) {
    barre.className = 'barre-connexion connecte';
    barre.innerHTML =
      '<span>🔓 Connecté à l\'administration</span>' +
      '<span class="barre-actions">' +
        '<button type="button" class="bouton-lien" id="bouton-changer-cle">Changer de clé</button>' +
        '<button type="button" class="bouton-lien" id="bouton-verrouiller">🔒 Verrouiller</button>' +
      '</span>';
  } else {
    barre.className = 'barre-connexion deconnecte';
    barre.innerHTML =
      '<span>🔒 Non connecté — les enregistrements seront refusés</span>' +
      '<button type="button" class="bouton" id="bouton-se-connecter">Se connecter</button>';
  }
}

/** Clic dans la barre : « Se connecter » (si déconnecté) ou « Changer de clé ». */
async function onClicConnexion(evenement) {
  // Changer de clé : par sécurité (page laissée ouverte), on exige d'abord la clé
  // ACTUELLE, PUIS on demande la nouvelle (validée côté serveur).
  if (evenement.target.closest('#bouton-changer-cle')) {
    const actuelle = await dialogDemander(
      'Sécurité : entre d\'abord la clé ACTUELLE pour pouvoir la changer :', '', { ok: 'Continuer' });
    if (actuelle == null) return; // annulé
    if (actuelle.trim() !== lireCleLocale('admin')) {
      await dialogAlerter('Clé actuelle incorrecte. Changement refusé.');
      return;
    }
    await demanderCleValide('admin', 'Clé actuelle confirmée.\n\nEntre la NOUVELLE clé :');
    majBarreConnexion(true); // on n'arrive ici que si on était déjà connecté
    return;
  }
  // Verrouiller : efface la clé mémorisée → la page repasse en « Non connecté »
  // et toute écriture redemandera la clé (utile si l'ordinateur est laissé ouvert).
  if (evenement.target.closest('#bouton-verrouiller')) {
    definirCleLocale('admin', '');
    majBarreConnexion(false);
    return;
  }
  // Se connecter : demande la clé en boucle jusqu'à la bonne (ou annulation).
  if (evenement.target.closest('#bouton-se-connecter')) {
    const ok = await connexion('admin', "à l'administration");
    majBarreConnexion(ok);
  }
}

/* --------------------------------------------------------------------------
   RÉINITIALISATION (remise à zéro complète du tournoi)
   -------------------------------------------------------------------------- */

/**
 * Réinitialise entièrement le tournoi (catégories, équipes, poules, matchs, infos)
 * après une double confirmation. Remet aussi les horaires de la journée à zéro ; conserve
 * l'historique de saison. Recharge toute la page ensuite.
 */
async function onReinitialiser() {
  const message = document.getElementById('message-reinitialisation');
  const bouton = document.getElementById('bouton-reinitialiser');

  // Double confirmation : l'action est irréversible.
  if (!await dialogConfirmer('Réinitialiser le tournoi ?\n\n' +
               'Cela supprime définitivement les catégories, les équipes, les poules, ' +
               'les matchs (planning + scores), les infos du tournoi (affiche comprise) ' +
               'et remet les horaires de la journée à zéro.\n' +
               'Seul l\'historique de saison (page Perfs) est conservé.',
               { ok: 'Continuer', danger: true })) return;
  if (!await dialogConfirmer('Confirmer la remise à zéro ? Cette action est IRRÉVERSIBLE.',
               { ok: 'Oui, tout effacer', danger: true })) return;

  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Réinitialisation…';
  afficherMessage(message, 'Réinitialisation en cours…', 'ok');

  try {
    const res = await ecrireAdmin('reinitialiserTournoi', {});

    // On recharge tout l'état depuis le backend et on ré-affiche la page.
    await rechargerEtRendre({ reglages: true, terrains: true, selectCats: true,
                              equipes: true, infos: true, publication: true });
    // Après le rechargement (comme avant le refactor) : en cas d'erreur réseau,
    // l'affichage — pistes d'arbitrage comprises — reste intact.
    document.getElementById('arbitrages').innerHTML = '';

    const nbC = (res && res.nb_categories != null) ? res.nb_categories : '?';
    const nbE = (res && res.nb_equipes != null) ? res.nb_equipes : '?';
    const nbP = (res && res.nb_poules != null) ? res.nb_poules : '?';
    const nbM = (res && res.nb_matchs != null) ? res.nb_matchs : '?';
    afficherMessage(message,
      '✅ Tournoi réinitialisé. Supprimés : ' + nbC + ' catégorie(s), ' + nbE +
      ' équipe(s), ' + nbP + ' poule(s), ' + nbM + ' match(s). Tournoi masqué.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Réagit aux changements dans la zone réglages (case « heure de fin auto »).
 */
function onReglagesChange(evenement) {
  if (evenement.target.id === 'h-heure_fin_auto') {
    const champFin = document.getElementById('h-heure_fin');
    if (champFin) champFin.disabled = evenement.target.checked; // grisé quand auto
  }
  // Heure de début saisie/modifiée → pré-remplit l'heure de RDV à début − 1h15. On n'écrase
  // JAMAIS une valeur personnalisée : seul un champ vide, ou déjà rempli par ce pré-remplissage
  // (marqueur data-auto-rdv), suit l'heure de début. Une saisie manuelle retire le marqueur.
  if (evenement.target.id === 'h-heure_debut') {
    const champRdv = document.getElementById('h-heure_rdv');
    if (champRdv && (champRdv.value === '' || champRdv.dataset.autoRdv === '1')) {
      const rdv = heureMoinsMinutes(evenement.target.value, 75);
      if (rdv) { champRdv.value = rdv; champRdv.dataset.autoRdv = '1'; }
    }
  }
  if (evenement.target.id === 'h-heure_rdv') {
    delete evenement.target.dataset.autoRdv; // valeur choisie à la main → on ne l'écrase plus
  }
  // Choix d'un format d'après-midi : on pilote l'affichage conditionnel via data-format
  // (carte sélectionnée mise en avant, champ « qualifiés » et bon récap révélés en CSS).
  if (evenement.target.name === 'format_apresmidi') {
    const bloc = evenement.target.closest('.bloc-format');
    if (bloc) {
      bloc.setAttribute('data-format', evenement.target.value); // révèle champ Coupe + bon récap (CSS)
      bloc.querySelectorAll('.format-carte').forEach(function (c) { c.classList.remove('est-choisi'); });
      const carteChoisie = evenement.target.closest('.format-carte');
      if (carteChoisie) carteChoisie.classList.add('est-choisi'); // met en avant la carte sélectionnée
    }
  }
  // Bascule Auto / Manuel des terrains : on révèle le champ de saisie (Manuel) ou l'info (Auto),
  // et on (re)lance la vérification des conseils en mode Manuel.
  if (evenement.target.name === 'terrains_auto') {
    const bloc = evenement.target.closest('.bloc-terrains');
    if (bloc) {
      bloc.setAttribute('data-terrains', evenement.target.value === 'non' ? 'manuel' : 'auto');
      verifierTerrainsBloc(bloc);
    }
  }
}

/**
 * Vérifie les terrains saisis à la volée (mode Manuel), au fil de la frappe.
 */
function onReglagesInput(evenement) {
  if (evenement.target.name === 'terrains') {
    verifierTerrainsBloc(evenement.target.closest('.bloc-terrains'));
  }
}

/**
 * Aiguille les envois de formulaire de la zone réglages vers la bonne fonction.
 */
function onReglagesSubmit(evenement) {
  const form = evenement.target;
  if (form.id === 'form-horaires')          return onEnregistrerHoraires(evenement);
  if (form.id === 'form-ajout-categorie')   return onAjouterCategorie(evenement);
  if (form.classList.contains('form-categorie')) return onEnregistrerCategorie(evenement);
}

/**
 * Aiguille les clics de la zone réglages (boutons "Supprimer" de catégorie).
 */
function onReglagesClick(evenement) {
  const bouton = evenement.target.closest('.bouton-suppr-cat');
  if (bouton) onSupprimerCategorie(bouton);
}

/**
 * Recharge la config depuis le backend et re-affiche toute la zone réglages
 * (utilisé après ajout/suppression de catégorie).
 */
async function rechargerReglages() {
  const cfg = await apiGet('getConfig');
  configCourante = cfg;
  injecterReglages(cfg.global, cfg.categories);
  injecterTerrains();                        // les catégories présentes ont pu changer
  remplirSelectCategories(cfg.categories); // le menu des équipes suit les catégories présentes
  majTableauBord(); // le nombre de catégories a pu changer
}

/* --------------------------------------------------------------------------
   AFFICHAGE DES RÉGLAGES
   -------------------------------------------------------------------------- */

/**
 * Injecte les réglages dans leurs deux zones distinctes (horaires / catégories),
 * pour permettre une mise en page côte à côte sur grand écran. Les écouteurs délégués
 * sont posés sur le DOCUMENT (voir initAdmin) : ils continuent de fonctionner même
 * quand le mode écrans déplace les deux zones hors de #reglages.
 */
function injecterReglages(global, categories) {
  document.getElementById('zone-horaires').innerHTML = afficherHoraires(global);
  document.getElementById('zone-categories').innerHTML = afficherCategories(categories);
  // Affiche d'emblée les conseils des catégories déjà en mode Manuel (sans attendre une frappe).
  document.querySelectorAll('.bloc-terrains[data-terrains="manuel"]').forEach(verifierTerrainsBloc);
}

/**
 * Carte "Horaires de la journée" sous forme de FORMULAIRE modifiable.
 * Les heures utilisent le champ natif <input type="time"> (rouleau sur mobile).
 */
function afficherHoraires(global) {
  function val(cle, def) {
    return (global && global[cle] != null && global[cle] !== '')
      ? echapper(String(global[cle])) : (def || '');
  }
  // Heure de fin automatique par défaut (sauf si explicitement 'non').
  var auto = String((global && global.heure_fin_auto) || 'oui').toLowerCase() !== 'non';

  // Carte simple (non repliable : chaque étape a désormais son propre écran,
  // plier n'avait plus de raison d'être).
  return (
    '<section class="carte">' +
      '<h2>Horaires de la journée</h2>' +
      '<form id="form-horaires" class="form-reglages">' +
        champHeure('heure_debut', 'Heure de début des matchs', val('heure_debut')) +
        // Heure de RDV (accueil des équipes) : pré-remplie à début − 1h15 quand on saisit
        // l'heure de début (voir onReglagesChange), mais toujours modifiable à la main.
        champHeure('heure_rdv', 'Heure de RDV des équipes', val('heure_rdv')) +
        // Heure de fin + case "auto"
        '<div class="champ-reglage">' +
          '<label for="h-heure_fin">Heure de fin des matchs</label>' +
          '<span class="fin-groupe">' +
            '<label class="mini-toggle"><input type="checkbox" id="h-heure_fin_auto" name="heure_fin_auto"' +
              (auto ? ' checked' : '') + '> auto</label>' +
            '<input type="time" id="h-heure_fin" name="heure_fin" value="' + val('heure_fin') + '"' +
              (auto ? ' disabled' : '') + '>' +
          '</span>' +
        '</div>' +
        // Heure de fin COMMUNIQUÉE (dossier club). VIDE = automatique : le dossier
        // affiche « fin du dernier match + marge » et suit chaque régénération du
        // planning. Une valeur saisie ici prime et ne bouge plus.
        champHeure('heure_fin_communiquee', 'Heure de fin communiquée aux clubs', val('heure_fin_communiquee'),
                   'Vide = auto : fin du dernier match + la marge ci-dessous (suit le planning).') +
        // Marge réglable du mode automatique (défaut 75 min = 1h15) : couvre le retour
        // aux vestiaires puis la cérémonie de remise des trophées — l'événement se
        // termine à l'issue de la remise. La main reste totale à l'organisateur.
        champNombre('marge_fin_communiquee_min', 'Marge après le dernier match (min)', val('marge_fin_communiquee_min', '75'),
                    'Retour aux vestiaires + remise des trophées : l\'événement se termine à la fin de la remise. '
                    + 'Fin annoncée = dernier match + cette marge (si l\'heure ci-dessus est vide).') +
        champNombre('battement_terrain_min', 'Battement terrain entre les matchs (min)', val('battement_terrain_min', '5')) +
        champHeure('pause_dejeuner_debut', 'Pause déjeuner — début', val('pause_dejeuner_debut')) +
        champNombre('pause_dejeuner_duree_min', 'Pause déjeuner — durée (min)', val('pause_dejeuner_duree_min')) +
        '<div class="ligne-action">' +
          '<button type="submit" class="bouton">Enregistrer les horaires</button>' +
          '<span id="message-horaires" class="message-form"></span>' +
        '</div>' +
      '</form>' +
    '</section>'
  );
}

/** Retire `minutes` à une heure « HH:MM ». Renvoie « HH:MM », ou '' si l'heure est illisible. */
function heureMoinsMinutes(hhmm, minutes) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!m) return '';
  let total = parseInt(m[1], 10) * 60 + parseInt(m[2], 10) - minutes;
  while (total < 0) total += 24 * 60; // reste sur la même journée (pas d'heure négative)
  return ('0' + Math.floor(total / 60)).slice(-2) + ':' + ('0' + (total % 60)).slice(-2);
}

/* Un champ "heure" (rouleau natif sur mobile), avec une ligne d'aide optionnelle. */
function champHeure(nom, label, valeur, aide) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="time" id="h-' + nom + '" name="' + nom + '" value="' + valeur + '">' +
           (aide ? '<span class="f-aide">' + aide + '</span>' : '') +
         '</div>';
}

/* Un champ "nombre" (ex : durée en minutes), avec une ligne d'aide optionnelle. */
function champNombre(nom, label, valeur, aide) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="number" id="h-' + nom + '" name="' + nom + '" min="0" step="5" value="' + valeur + '">' +
           (aide ? '<span class="f-aide">' + aide + '</span>' : '') +
         '</div>';
}

/**
 * Enregistre les horaires quand on soumet le formulaire.
 */
async function onEnregistrerHoraires(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = document.getElementById('message-horaires');

  const auto = form.heure_fin_auto.checked;
  const data = {
    heure_debut:              form.heure_debut.value,
    heure_rdv:                form.heure_rdv.value,
    heure_fin:                form.heure_fin.value,
    heure_fin_auto:           auto ? 'oui' : 'non',
    heure_fin_communiquee:    form.heure_fin_communiquee.value,
    marge_fin_communiquee_min: form.marge_fin_communiquee_min.value,
    battement_terrain_min:    form.battement_terrain_min.value,
    pause_dejeuner_debut:     form.pause_dejeuner_debut.value,
    pause_dejeuner_duree_min: form.pause_dejeuner_duree_min.value
  };

  if (!data.heure_debut) {
    afficherMessage(message, "Renseigne l'heure de début.", 'ko');
    return;
  }
  if (!auto && !data.heure_fin) {
    afficherMessage(message, "Renseigne l'heure de fin (ou coche « auto »).", 'ko');
    return;
  }

  const bouton = form.querySelector('button');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';

  try {
    await ecrireAdmin('enregistrerHoraires', data);
    // On met à jour la config gardée en mémoire.
    configCourante.global = Object.assign({}, configCourante.global, data);
    // Valeurs désormais ENREGISTRÉES → l'assistant reprend sa photo de référence.
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    majEtatAvancement(); // le fil « Où en suis-je ? » suit les horaires
    majDossier();        // la section Programme du dossier club suit
    afficherMessage(message, '✅ Horaires enregistrés.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Affiche les catégories sous forme de FORMULAIRES modifiables (une carte par catégorie),
 * suivies d'un formulaire pour ajouter une nouvelle catégorie.
 */
function afficherCategories(categories) {
  // Formulaire d'ajout EN PREMIER (au-dessus de la liste) : c'est par lui qu'on
  // commence, et il reste visible sans avoir à défiler sous toutes les cartes.
  let html =
    '<form id="form-ajout-categorie" class="carte">' +
      '<h3 style="margin-bottom:10px;">Ajouter une catégorie</h3>' +
      '<div class="form-equipe">' +
        '<input type="text" name="categorie" placeholder="Nom (ex : U16)" autocomplete="off" required>' +
        '<button type="submit" class="bouton">Ajouter</button>' +
      '</div>' +
      '<div class="message-form" data-role="msg-ajout-cat"></div>' +
    '</form>';

  html += '<h2 style="margin:24px 0 12px;">Catégories</h2>';
  if (categories && categories.length > 0) {
    categories.forEach(function (cat) {
      html += formulaireCategorie(cat);
    });
  } else {
    html += '<p class="vide">Aucune catégorie. Ajoute-en une ci-dessus.</p>';
  }

  return html;
}

/**
 * Construit le formulaire modifiable d'une catégorie.
 */
function formulaireCategorie(cat) {
  const nom = cat.categorie || '?';

  let champs = '';
  CHAMPS_CATEGORIE.forEach(function (champ) {
    const valeur = (cat[champ.cle] != null) ? String(cat[champ.cle]) : '';
    champs += champCategorie(champ, valeur);
  });

  return (
    '<form class="carte categorie form-categorie" data-cat="' + echapper(nom) + '">' +
      '<div class="ligne-info">' +
        '<span class="badge">' + echapper(nom) + '</span>' +
      '</div>' +
      blocTerrains(cat) +
      '<div class="grille-reglages">' + champs + '</div>' +
      blocFormatApresMidi(cat) +
      '<div class="ligne-action">' +
        '<button type="submit" class="bouton">Enregistrer</button>' +
        '<button type="button" class="bouton-suppr bouton-suppr-cat" data-cat="' + echapper(nom) + '">Supprimer</button>' +
        '<span class="message-form message-cat"></span>' +
      '</div>' +
    '</form>'
  );
}

/**
 * Bloc « Terrains » d'une catégorie : choix Auto / Manuel.
 *  - Auto (défaut) : les terrains sont attribués par l'onglet « Terrains & répartition ».
 *    Le champ de saisie est masqué ; on affiche juste les terrains actuels à titre indicatif.
 *  - Manuel : l'organisateur saisit lui-même les numéros, et une vérification en direct
 *    (doublons entre catégories, terrain inexistant, catégorie sans terrain) le conseille.
 * L'affichage conditionnel est piloté par l'attribut data-terrains (voir onReglagesChange),
 * comme pour le format d'après-midi : pas de :has(), compatible tous téléphones.
 */
function blocTerrains(cat) {
  const auto = terrainsAutoDe(cat);
  const val = (cat && cat.terrains != null) ? String(cat.terrains) : '';
  const infoActuel = val.trim()
    ? '. Actuellement : <strong>' + echapper(val) + '</strong>'
    : ' (pas encore répartis).';
  return (
    '<div class="bloc-terrains" data-terrains="' + (auto ? 'auto' : 'manuel') + '">' +
      '<span class="format-libelle">Terrains</span>' +
      '<div class="terr-mode">' +
        '<label class="terr-choix"><input type="radio" name="terrains_auto" value="oui"' + (auto ? ' checked' : '') + '> Auto</label>' +
        '<label class="terr-choix"><input type="radio" name="terrains_auto" value="non"' + (!auto ? ' checked' : '') + '> Manuel</label>' +
      '</div>' +
      // Champ manuel (toujours présent dans le DOM pour conserver la valeur ; masqué en mode Auto).
      '<label class="terr-manuel reglage">' +
        '<input class="r-input" type="text" name="terrains" value="' + echapper(val) + '" placeholder="ex : 1, 2">' +
        '<span class="f-aide">Numéros des terrains dédiés à cette catégorie, séparés par des virgules.</span>' +
      '</label>' +
      // Info mode Auto.
      '<p class="terr-auto-info">✅ Attribués automatiquement via l\'onglet « Terrains &amp; répartition »' + infoActuel + '</p>' +
      // Zone de conseils (mode Manuel), remplie par verifierTerrainsBloc().
      '<div class="terr-conseils" data-role="terr-conseils"></div>' +
    '</div>'
  );
}

/** Ensemble des numéros de mini-terrains QUI EXISTENT (pour la vérification d'existence).
 *  Source : la répartition calculée dans cette session si dispo, sinon les terrains déjà
 *  attribués aux catégories (dernière répartition appliquée). Vide = on ne peut pas vérifier. */
function ensembleTerrainsExistants() {
  const set = new Set();
  if (repartitionCalculee && repartitionCalculee.parCategorie) {
    Object.keys(repartitionCalculee.parCategorie).forEach(function (k) {
      (repartitionCalculee.parCategorie[k] || []).forEach(function (id) {
        const n = Number(id); if (!isNaN(n)) set.add(n);
      });
    });
  }
  (configCourante.categories || []).forEach(function (c) {
    String(c.terrains || '').split(',').map(function (s) { return s.trim(); })
      .forEach(function (t) { if (/^\d+$/.test(t)) set.add(Number(t)); });
  });
  return set;
}

/** Numéros de terrains utilisés par les AUTRES catégories → { numéro: [noms de catégories] }. */
function terrainsParAutreCategorie(nom) {
  const map = {};
  (configCourante.categories || []).forEach(function (c) {
    if (String(c.categorie) === String(nom) || !estPresente(c)) return;
    String(c.terrains || '').split(',').map(function (s) { return s.trim(); })
      .forEach(function (t) {
        if (!/^\d+$/.test(t)) return;
        const n = Number(t);
        (map[n] = map[n] || []).push(String(c.categorie));
      });
  });
  return map;
}

/**
 * Analyse une saisie manuelle de terrains et renvoie la liste des conseils.
 * @return {Array<{niveau:'ko'|'warn', texte:string}>}
 */
function analyserTerrainsManuels(nom, brut) {
  const conseils = [];
  const tokens = String(brut || '').split(',').map(function (s) { return s.trim(); })
    .filter(function (s) { return s !== ''; });

  // 1) Jetons non numériques.
  tokens.filter(function (t) { return !/^\d+$/.test(t); }).forEach(function (t) {
    conseils.push({ niveau: 'ko', texte: '« ' + t + ' » n\'est pas un numéro de terrain.' });
  });

  const nums = tokens.filter(function (t) { return /^\d+$/.test(t); }).map(Number);

  // 2) Aucun terrain alors qu'il y a des équipes.
  if (nums.length === 0) {
    const nbEq = (equipesParCategorie()[nom] || 0);
    if (nbEq > 0) conseils.push({ niveau: 'ko', texte: 'Cette catégorie a ' + nbEq + ' équipe(s) mais aucun terrain.' });
    return conseils;
  }

  // 3) Doublons dans la saisie elle-même.
  const vus = {};
  nums.forEach(function (n) {
    if (vus[n]) conseils.push({ niveau: 'warn', texte: 'Le terrain ' + n + ' est indiqué deux fois.' });
    vus[n] = true;
  });
  const uniques = Object.keys(vus).map(Number);

  // 4) Terrain aussi utilisé par une autre catégorie.
  const parAutre = terrainsParAutreCategorie(nom);
  uniques.forEach(function (n) {
    if (parAutre[n] && parAutre[n].length) {
      conseils.push({ niveau: 'warn', texte: 'Le terrain ' + n + ' est aussi utilisé par ' + parAutre[n].join(', ') + '.' });
    }
  });

  // 5) Terrain inexistant dans la répartition (si on connaît la liste des terrains existants).
  const existants = ensembleTerrainsExistants();
  if (existants.size) {
    const max = Math.max.apply(null, Array.from(existants));
    uniques.forEach(function (n) {
      if (!existants.has(n)) {
        conseils.push({ niveau: 'ko', texte: 'Le terrain ' + n + ' n\'existe pas dans ta répartition (les terrains vont de 1 à ' + max + ').' });
      }
    });
  }

  return conseils;
}

/** (Re)calcule et affiche les conseils d'un bloc Terrains (uniquement en mode Manuel). */
function verifierTerrainsBloc(bloc) {
  if (!bloc) return;
  const zone = bloc.querySelector('[data-role="terr-conseils"]');
  if (!zone) return;
  if (bloc.getAttribute('data-terrains') !== 'manuel') { zone.innerHTML = ''; return; }

  const form = bloc.closest('form.form-categorie');
  const nom = form ? form.getAttribute('data-cat') : '';
  const input = bloc.querySelector('input[name="terrains"]');
  const brut = input ? input.value : '';

  const conseils = analyserTerrainsManuels(nom, brut);
  if (!conseils.length) {
    zone.innerHTML = brut.trim()
      ? '<p class="terr-conseil ok">✅ Terrains valides.</p>'
      : '';
    return;
  }
  zone.innerHTML = conseils.map(function (c) {
    return '<p class="terr-conseil ' + c.niveau + '">⚠️ ' + echapper(c.texte) + '</p>';
  }).join('');
}

/**
 * Bloc « Format de l'après-midi » d'une catégorie : cartes cliquables (radio) avec explication
 * visible, champ « qualifiés en Coupe » (affiché seulement pour COUPE_PLATEAU) et récapitulatif.
 * L'affichage conditionnel est piloté par l'attribut data-format du bloc (voir onReglagesChange) :
 * pas besoin de :has(), ça marche sur tous les téléphones.
 */
function blocFormatApresMidi(cat) {
  const fmt = formatApresMidiDe(cat);
  const nbQ = nbQualifiesCoupeDe(cat);

  const cartes = FORMATS_APRESMIDI.map(function (f) {
    const choisi = (f.cle === fmt);
    return (
      '<label class="format-carte f-' + f.cle + (choisi ? ' est-choisi' : '') + '">' +
        '<input type="radio" name="format_apresmidi" value="' + f.cle + '"' + (choisi ? ' checked' : '') + '>' +
        '<span class="f-corps">' +
          '<span class="f-titre">' + echapper(f.titre) + '</span>' +
          '<span class="f-desc">' + echapper(f.desc) + '</span>' +
        '</span>' +
      '</label>'
    );
  }).join('');

  // Récaps : un par format, révélé selon data-format (texte concret pour confirmer le choix).
  const recaps =
    '<span class="format-recap r-CROISE">Après-midi : <b>classement croisé</b> — matchs équilibrés par niveau ; le vainqueur du Niveau 1 remporte le tournoi (classement général + podium).</span>' +
    '<span class="format-recap r-CROISE_DIAGONAL">Après-midi : <b>classement croisé DIAGONAL</b> — le 1ᵉʳ d\'une poule affronte le 2ᵉ d\'une AUTRE poule (croisement en diagonale, à ne pas confondre avec le croisé simple 1ᵉʳ-contre-1ᵉʳ). Résultats cumulés au classement général + podium.</span>' +
    '<span class="format-recap r-LIBRE">Après-midi : <b>matchs libres</b> — amicaux, sans classement ni podium (idéal pour les plus jeunes).</span>' +
    '<span class="format-recap r-COUPE_PLATEAU">Après-midi : <b>Coupe + Plateau</b> — les premiers de chaque poule en élimination directe (finale + petite finale), les autres en plateau.</span>';

  return (
    '<div class="bloc-format" data-format="' + fmt + '">' +
      '<span class="format-libelle">Format de l\'après-midi</span>' +
      '<div class="format-cartes">' + cartes + '</div>' +
      '<label class="format-coupe-param reglage">' +
        '<span class="r-libelle">Qualifiés en Coupe (par poule)</span>' +
        '<input class="r-input" type="number" min="1" name="nbQualifiesCoupe" value="' + echapper(String(nbQ)) + '">' +
        '<span class="f-aide">Les premiers de chaque poule partent en Coupe ; les autres vont automatiquement en Plateau.</span>' +
      '</label>' +
      '<div class="format-recap-zone">' + recaps + '</div>' +
    '</div>'
  );
}

/**
 * Un champ modifiable d'une catégorie (input texte/nombre ou menu déroulant).
 * On enveloppe le champ dans un <label> (pas d'id, pour éviter les doublons).
 */
function champCategorie(champ, valeur) {
  let controle;
  if (champ.type === 'select') {
    let options = '';
    champ.options.forEach(function (opt) {
      options += '<option value="' + opt + '"' + (String(valeur) === opt ? ' selected' : '') + '>' + opt + '</option>';
    });
    controle = '<select class="r-input" name="' + champ.cle + '">' + options + '</select>';
  } else {
    const attrs = (champ.type === 'number') ? ' min="0"' : '';
    const ph = champ.placeholder ? ' placeholder="' + echapper(champ.placeholder) + '"' : '';
    controle = '<input class="r-input" type="' + champ.type + '"' + attrs + ph +
               ' name="' + champ.cle + '" value="' + echapper(valeur) + '">';
  }
  return '<label class="reglage"><span class="r-libelle">' + champ.label + '</span>' + controle + '</label>';
}

/**
 * Enregistre les modifications d'une catégorie.
 */
async function onEnregistrerCategorie(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = form.querySelector('.message-cat');
  const nom = form.getAttribute('data-cat');

  // On rassemble les valeurs du formulaire. Toute catégorie existante est active
  // (le réglage « Présente » a été retiré) → on envoie toujours 'oui'.
  const data = { categorie: nom, presente: 'oui' };
  CHAMPS_CATEGORIE.forEach(function (champ) {
    data[champ.cle] = form[champ.cle].value;
  });

  // Effectifs par équipe (dossier club) : optionnels, mais si les deux sont saisis, min ≤ max.
  const effMin = parseInt(data.effectif_min, 10);
  const effMax = parseInt(data.effectif_max, 10);
  if (isFinite(effMin) && isFinite(effMax) && effMin > effMax) {
    afficherMessage(message, "⚠️ Effectif min (" + effMin + ") supérieur à l'effectif max (" + effMax + ").", 'ko');
    return;
  }
  // Terrains : bloc dédié (Auto / Manuel). Le champ texte garde sa valeur même masqué en Auto.
  data.terrains = form.terrains ? String(form.terrains.value).trim() : '';
  data.terrains_auto = (form.terrains_auto && form.terrains_auto.value === 'non') ? 'non' : 'oui';

  // Format d'après-midi + son paramètre JSON (nbQualifiesCoupe seulement pour COUPE_PLATEAU).
  const fmt = (form.format_apresmidi && form.format_apresmidi.value) ? form.format_apresmidi.value : 'CROISE';
  data.format_apresmidi = fmt;
  if (fmt === 'COUPE_PLATEAU') {
    let nbQ = parseInt(form.nbQualifiesCoupe && form.nbQualifiesCoupe.value, 10);
    if (!isFinite(nbQ) || nbQ < 1) nbQ = 2;
    data.param_format = JSON.stringify({ nbQualifiesCoupe: nbQ });
  } else {
    data.param_format = '';
  }

  const bouton = form.querySelector('button[type="submit"]');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';

  try {
    await ecrireAdmin('enregistrerCategorie', data);
    // On met à jour la config en mémoire + le menu des équipes, sans tout re-rendre
    // (pour garder le message et l'endroit où on est).
    const idx = configCourante.categories.findIndex(function (c) { return c.categorie === nom; });
    if (idx >= 0) configCourante.categories[idx] = Object.assign({}, configCourante.categories[idx], data);
    // Catégorie ENREGISTRÉE → l'assistant reprend sa photo de référence.
    if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(form);
    remplirSelectCategories(configCourante.categories);
    majTableauBord(); // le nombre de catégories « présentes » a pu changer
    majDossier();     // le cadre sportif du dossier club suit
    afficherMessage(message, '✅ Enregistré.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Ajoute une nouvelle catégorie (avec des valeurs de départ modifiables ensuite).
 */
/** Nom de catégorie « normalisé » pour comparer sans piège : minuscules, sans
 *  accents (é → e), espaces réduits. Détecte les doublons du type «  u10 » / « U10 ». */
function normaliserNomCategorie(nom) {
  return String(nom || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents (é → e + accent séparé)
    .replace(/\s+/g, ' ')                             // espaces multiples → un seul
    .trim()
    .toLowerCase();
}

async function onAjouterCategorie(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = form.querySelector('[data-role="msg-ajout-cat"]');
  const nom = form.categorie.value.trim();

  if (!nom) { afficherMessage(message, 'Indique un nom.', 'ko'); return; }

  // On refuse un doublon (sinon on écraserait la catégorie existante).
  // Comparaison SOUPLE : casse, accents et espaces ignorés («  u10 » = « U10 »).
  const doublon = (configCourante.categories || []).find(function (c) {
    return normaliserNomCategorie(c.categorie) === normaliserNomCategorie(nom);
  });
  if (doublon) {
    afficherMessage(message, '⚠️ La catégorie « ' + doublon.categorie + ' » existe déjà.', 'ko');
    return;
  }

  const data = {
    categorie: nom, presente: 'oui', terrains: '', terrains_auto: 'oui', nb_poules: '',
    format_mi_temps: '2', duree_mi_temps_min: '10', pause_mi_temps_min: '2',
    recup_entre_matchs_min: '15', format_apresmidi: 'CROISE', param_format: '',
    reglement: '', effectif_min: '', effectif_max: '', arbitrage_organisation: ''
  };

  const bouton = form.querySelector('button');
  bouton.disabled = true;
  try {
    await ecrireAdmin('enregistrerCategorie', data);
    await rechargerReglages(); // la nouvelle carte apparaît
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
  }
}

/**
 * Supprime une catégorie (après confirmation).
 */
async function onSupprimerCategorie(bouton) {
  const nom = bouton.getAttribute('data-cat');
  if (!await dialogConfirmer('Supprimer la catégorie « ' + nom + ' » ?\n' +
               '(Les équipes de cette catégorie ne sont pas supprimées.)',
               { ok: 'Supprimer', danger: true })) return;

  bouton.disabled = true;
  try {
    await ecrireAdmin('supprimerCategorie', { categorie: nom });
    await rechargerReglages();
  } catch (erreur) {
    await dialogAlerter('Erreur : ' + erreur.message);
    bouton.disabled = false;
  }
}

/* --------------------------------------------------------------------------
   ÉQUIPES
   -------------------------------------------------------------------------- */

/**
 * Remplit la liste déroulante avec les catégories PRÉSENTES.
 * Guidage : s'il n'y a AUCUNE catégorie, on ne peut pas saisir d'équipe → on affiche une aide
 * et on désactive le formulaire d'ajout (sinon l'utilisateur reste bloqué sans explication).
 */
function remplirSelectCategories(categories) {
  const select = document.getElementById('champ-categorie');
  // On garde la 1re option "Catégorie…" et on ajoute les catégories présentes.
  select.innerHTML = '<option value="">Catégorie…</option>';
  const presentes = (categories || []).filter(estPresente);
  presentes.forEach(function (cat) {
    const opt = document.createElement('option');
    opt.value = cat.categorie;
    opt.textContent = cat.categorie;
    select.appendChild(opt);
  });

  // Aide + activation/désactivation du formulaire selon qu'il existe au moins une catégorie.
  const aucune = presentes.length === 0;
  const aide = document.getElementById('aide-categories');
  const champNom = document.getElementById('champ-nom');
  const boutonAj = document.getElementById('bouton-ajouter');
  if (aide) aide.hidden = !aucune;
  if (select) select.disabled = aucune;
  if (champNom) champNom.disabled = aucune;
  if (boutonAj) boutonAj.disabled = aucune;
}

/**
 * Affiche la liste des équipes, regroupées par catégorie.
 * @param {Object[]} equipes
 */
function afficherEquipes(equipes) {
  const zone = document.getElementById('liste-equipes');

  if (!equipes || equipes.length === 0) {
    zone.innerHTML = '<p class="vide">Aucune équipe saisie pour le moment.</p>';
    return;
  }

  // On regroupe les équipes par catégorie.
  const parCategorie = {};
  equipes.forEach(function (eq) {
    const cat = eq.categorie || '(sans catégorie)';
    if (!parCategorie[cat]) parCategorie[cat] = [];
    parCategorie[cat].push(eq);
  });

  // On affiche dans l'ordre des catégories de la config, puis les éventuelles autres.
  const ordre = configCourante.categories.map(function (c) { return c.categorie; });
  Object.keys(parCategorie).forEach(function (c) {
    if (ordre.indexOf(c) === -1) ordre.push(c);
  });

  let html = '';
  ordre.forEach(function (cat) {
    const liste = parCategorie[cat];
    if (!liste) return;

    let items = '';
    liste.forEach(function (eq) {
      items +=
        '<div class="equipe-item" data-id="' + eq.id_equipe + '">' +
          '<span class="nom">' + echapper(eq.nom_equipe) + '</span>' +
          '<div class="equipe-actions">' +
            '<button class="bouton-modif bouton-icone" title="Modifier" aria-label="Modifier" ' +
                    'data-id="' + eq.id_equipe + '" data-nom="' + echapper(eq.nom_equipe) + '">✏️</button>' +
            '<button class="bouton-suppr bouton-icone" title="Supprimer" aria-label="Supprimer" ' +
                    'data-id="' + eq.id_equipe + '" data-nom="' + echapper(eq.nom_equipe) + '">🗑️</button>' +
          '</div>' +
        '</div>';
    });

    html +=
      '<div class="groupe-categorie">' +
        '<h3>' + echapper(cat) + ' <span class="cat-mini">(' + liste.length + ')</span>' +
          '<button class="bouton-suppr bouton-suppr-tout" data-cat="' + echapper(cat) + '">' +
            'Tout supprimer</button>' +
        '</h3>' +
        items +
      '</div>';
  });

  zone.innerHTML = html;
}

/**
 * Quand on soumet le formulaire d'ajout d'équipe.
 */
async function onAjouterEquipe(evenement) {
  evenement.preventDefault(); // empêche le rechargement de la page

  const champNom = document.getElementById('champ-nom');
  const champCat = document.getElementById('champ-categorie');
  const bouton   = document.getElementById('bouton-ajouter');
  const message  = document.getElementById('message-equipe');

  // Nom du club toujours en MAJUSCULES (uniformité d'affichage sur toutes les pages).
  const nom = champNom.value.trim().toUpperCase();
  const categorie = champCat.value;

  if (!nom || !categorie) {
    afficherMessage(message, 'Indique un nom ET une catégorie.', 'ko');
    return;
  }

  // Refuse un doublon : même nom dans la même catégorie (les noms sont en MAJUSCULES).
  const doublon = equipesCourantes.some(function (e) {
    return (e.categorie || '') === categorie &&
           String(e.nom_equipe).trim().toUpperCase() === nom;
  });
  if (doublon) {
    afficherMessage(message, '⚠️ « ' + nom + ' » existe déjà dans ' + categorie + '.', 'ko');
    return;
  }

  // On désactive le bouton le temps de l'envoi (évite les doubles clics).
  bouton.disabled = true;
  bouton.textContent = 'Ajout…';

  try {
    await ecrireAdmin('ajouterEquipe', { nom_equipe: nom, categorie: categorie });

    // Succès : on vide le champ nom, on recharge la liste.
    champNom.value = '';
    champNom.focus();
    afficherMessage(message, '✅ « ' + nom +' » ajoutée.', 'ok');
    await rechargerEquipes();

  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = 'Ajouter';
  }
}

/**
 * Clic dans la liste : on aiguille vers Modifier, Supprimer, Tout supprimer,
 * ou les boutons du mini-formulaire d'édition (Enregistrer / Annuler).
 */
async function onClicListe(evenement) {
  const cible = evenement.target;

  // ⚠️ Les boutons d'édition (Enregistrer/Annuler) réutilisent les classes
  // .bouton-modif/.bouton-suppr pour le style : on les teste EN PREMIER.
  if (cible.closest('.bouton-edit-ok'))     return onEnregistrerNom(cible.closest('.bouton-edit-ok'));
  if (cible.closest('.bouton-edit-annuler')) return afficherEquipes(equipesCourantes);
  if (cible.closest('.bouton-modif'))       return onModifierEquipe(cible.closest('.bouton-modif'));
  if (cible.closest('.bouton-suppr-tout'))  return onSupprimerCategorieEquipes(cible.closest('.bouton-suppr-tout'));
  if (cible.closest('.bouton-suppr'))       return onSupprimerEquipe(cible.closest('.bouton-suppr'));
}

/**
 * Supprime une seule équipe.
 */
async function onSupprimerEquipe(bouton) {
  const id = bouton.getAttribute('data-id');
  const nom = bouton.getAttribute('data-nom');
  const message = document.getElementById('message-equipe');

  if (!await dialogConfirmer('Supprimer l\'équipe « ' + nom + ' » ?', { ok: 'Supprimer', danger: true })) return;

  bouton.disabled = true;
  try {
    await ecrireAdmin('supprimerEquipe', { id_equipe: id });
    afficherMessage(message, '🗑️ « ' + nom + ' » supprimée.', 'ok');
    await rechargerEquipes();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
  }
}

/**
 * Supprime TOUTES les équipes d'une catégorie d'un seul coup.
 */
async function onSupprimerCategorieEquipes(bouton) {
  const cat = bouton.getAttribute('data-cat');
  const message = document.getElementById('message-equipe');
  const combien = equipesCourantes.filter(function (eq) {
    return (eq.categorie || '(sans catégorie)') === cat;
  }).length;

  if (!await dialogConfirmer('Supprimer TOUTES les ' + combien + ' équipe(s) de la catégorie « ' + cat + ' » ?\n\n' +
               'Cette action est irréversible.', { ok: 'Tout supprimer', danger: true })) return;

  bouton.disabled = true;
  bouton.textContent = 'Suppression…';
  try {
    const res = await ecrireAdmin('supprimerEquipesCategorie', { categorie: cat });
    const n = (res && res.nb_supprimees != null) ? res.nb_supprimees : combien;
    afficherMessage(message, '🗑️ ' + n + ' équipe(s) de « ' + cat + ' » supprimée(s).', 'ok');
    await rechargerEquipes();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
    bouton.textContent = 'Tout supprimer';
  }
}

/**
 * Passe une équipe en mode édition : le nom devient un champ modifiable
 * avec les boutons Enregistrer / Annuler.
 */
function onModifierEquipe(bouton) {
  const id = bouton.getAttribute('data-id');
  const nom = bouton.getAttribute('data-nom');
  const item = document.querySelector('.equipe-item[data-id="' + id + '"]');
  if (!item) return;

  item.innerHTML =
    '<input class="champ-edit-nom" type="text" value="' + echapper(nom) + '" autocomplete="off">' +
    '<div class="equipe-actions">' +
      '<button class="bouton-modif bouton-edit-ok" data-id="' + id + '">Enregistrer</button>' +
      '<button class="bouton-suppr bouton-edit-annuler">Annuler</button>' +
    '</div>';

  const champ = item.querySelector('.champ-edit-nom');
  champ.focus();
  champ.select();
  // Entrée = enregistrer, Échap = annuler.
  champ.addEventListener('keydown', function (e) {
    if (e.key === 'Enter')  { e.preventDefault(); item.querySelector('.bouton-edit-ok').click(); }
    if (e.key === 'Escape') { e.preventDefault(); afficherEquipes(equipesCourantes); }
  });
}

/**
 * Enregistre le nouveau nom d'une équipe éditée.
 */
async function onEnregistrerNom(bouton) {
  const id = bouton.getAttribute('data-id');
  const item = document.querySelector('.equipe-item[data-id="' + id + '"]');
  const message = document.getElementById('message-equipe');
  const champ = item ? item.querySelector('.champ-edit-nom') : null;
  if (!champ) return;

  // Nom du club toujours en MAJUSCULES (cohérence avec l'ajout d'équipe).
  const nouveauNom = champ.value.trim().toUpperCase();
  if (!nouveauNom) {
    afficherMessage(message, "Le nom de l'équipe ne peut pas être vide.", 'ko');
    return;
  }

  // Refuse un doublon dans la même catégorie (hors l'équipe qu'on renomme elle-même).
  const equipe = equipesCourantes.find(function (e) { return e.id_equipe === id; });
  const cat = equipe ? (equipe.categorie || '') : '';
  const doublon = equipesCourantes.some(function (e) {
    return e.id_equipe !== id && (e.categorie || '') === cat &&
           String(e.nom_equipe).trim().toUpperCase() === nouveauNom;
  });
  if (doublon) {
    afficherMessage(message, '⚠️ « ' + nouveauNom + ' » existe déjà dans ' + cat + '.', 'ko');
    return;
  }

  bouton.disabled = true;
  bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('modifierEquipe', { id_equipe: id, nom_equipe: nouveauNom });
    afficherMessage(message, '✏️ Renommée en « ' + nouveauNom + ' ».', 'ok');
    await rechargerEquipes();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
    bouton.textContent = 'Enregistrer';
  }
}

/**
 * Recharge uniquement la liste des équipes depuis le backend.
 */
async function rechargerEquipes() {
  const equipes = await apiGet('getEquipes');
  equipesCourantes = equipes;
  afficherEquipes(equipes);
  majTableauBord(); // le nombre d'équipes a changé
}

/* --------------------------------------------------------------------------
   GÉNÉRATION (poules + planning)
   -------------------------------------------------------------------------- */

/**
 * Lance la génération des poules et du planning, puis affiche le résultat.
 * GARDE-FOU : si des scores sont DÉJÀ saisis (matin ou après-midi), régénérer les effacerait
 * TOUS. On vérifie sur des données FRAÎCHES (les scores viennent des téléphones), on prévient
 * du nombre exact, et on exige une confirmation forte par la clé admin. Sans score saisi, on
 * garde la confirmation simple (phase de préparation).
 */
async function onGenerer() {
  // Compte les scores déjà saisis, sur des données à jour (pas la copie en mémoire).
  let matchsFrais = matchsCourants || [];
  try { matchsFrais = (await apiGet('getMatchs')) || matchsFrais; } catch (e) { /* repli mémoire */ }
  const nbScores = matchsFrais.filter(function (m) { return estTermine(m.statut); }).length;

  if (nbScores > 0) {
    // Des scores existent → avertissement renforcé + double verrou (clé admin).
    if (!await dialogConfirmer(
        '⚠️ ATTENTION : ' + nbScores + ' match(s) ont déjà un score saisi.\n\n' +
        'Régénérer va EFFACER DÉFINITIVEMENT toutes les poules, tous les matchs et TOUS ces scores.\n\n' +
        'Veux-tu vraiment tout regénérer ?',
        { ok: 'Continuer', danger: true })) return;
    const cle = await demanderCleValide('admin',
        'Confirmation forte : ' + nbScores + ' score(s) seront effacés.\n\nEntre la clé admin pour confirmer :');
    if (cle == null) return; // annulé → rien n'est effacé
  } else {
    // Aucun score saisi (préparation) : confirmation simple.
    if (!await dialogConfirmer('Générer les poules et le planning ?\n\n' +
               'Cela efface les poules et le planning précédents.', { ok: 'Générer' })) return;
  }
  await genererMaintenant();
}

/** Fait réellement la génération (sans reconfirmation) puis rafraîchit tout. */
async function genererMaintenant() {
  const bouton  = document.getElementById('bouton-generer');
  const message = document.getElementById('message-generation');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Génération…';
  afficherMessage(message, 'Génération en cours…', 'ok');

  try {
    const res = await ecrireAdmin('genererPoulesEtPlanning', {});
    const nbP = (res && res.nb_poules != null) ? res.nb_poules : '?';
    const nbM = (res && res.nb_matchs != null) ? res.nb_matchs : '?';
    const enRetard = res && res.avertissements && res.avertissements.length;
    let texte = '✅ ' + nbP + ' poule(s) et ' + nbM + ' match(s) du matin générés.';
    if (res.heure_fin_matin) texte += '\n🌅 Fin du matin : ' + res.heure_fin_matin + '.';
    if (res.heure_fin_projetee) texte += '\n🏁 Fin estimée du tournoi (après-midi inclus) : ' + res.heure_fin_projetee + '.';
    if (enRetard) texte += '\n⚠️ ' + res.avertissements.join('\n⚠️ ');
    afficherMessage(message, texte, enRetard ? 'ko' : 'ok');

    afficherArbitrages(res); // pistes d'ajustement si dépassement (heure de fin manuelle)

    // On recharge tout : planning + réglages (l'heure de fin auto a pu changer).
    await rechargerEtRendre({ reglages: true, selectCats: true });
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * ÉTAPE 3 — bouton « Recalculer les horaires » (régénération NON destructive).
 * Recalcule seulement les heures en gardant poules ET scores. On ne l'affiche QUE quand
 * c'est à la fois utile (des réglages ont changé depuis la génération) et légitime :
 * un planning existe, l'après-midi n'est pas encore généré, et la COMPOSITION n'a pas
 * bougé (sinon un vrai tirage est nécessaire → on l'affiche désactivé avec l'explication).
 */
function majBoutonRecalculer() {
  const btn = document.getElementById('bouton-recalculer-horaires');
  const aide = document.getElementById('aide-recalculer');
  if (!btn || !aide) return;

  const g = configCourante.global || {};
  const matin = (matchsCourants || []).filter(function (m) { return String(m.phase) !== 'classement'; });
  const aprem = (matchsCourants || []).filter(function (m) { return String(m.phase) === 'classement'; });

  function cacher() { btn.hidden = true; aide.hidden = true; }

  // Pas de planning, ou après-midi déjà générée → option non applicable.
  if (matin.length === 0 || aprem.length > 0) { cacher(); return; }

  // Y a-t-il quelque chose à recalculer ? (réglages modifiés depuis la génération)
  const sigStockee = g.signature_generation || '';
  const reglagesModifies = sigStockee &&
    signatureGeneration(g, configCourante.categories, equipesCourantes) !== sigStockee;
  if (!reglagesModifies) { cacher(); return; }

  // La composition a-t-elle changé ? (nouveau tirage nécessaire dans ce cas)
  const catsPresentes = (configCourante.categories || []).filter(estPresente)
    .map(function (c) { return String(c.categorie); });
  const nonPlacee = (equipesCourantes || []).some(function (e) {
    return catsPresentes.indexOf(String(e.categorie)) >= 0 && !String(e.poule || '').trim();
  });
  const sigStructStockee = g.signature_structure || '';
  const structureChangee = nonPlacee ||
    (sigStructStockee && signatureStructure(configCourante.categories, equipesCourantes) !== sigStructStockee);

  btn.hidden = false;
  aide.hidden = false;
  if (structureChangee) {
    btn.disabled = true;
    aide.innerHTML = '⚠️ La <strong>composition a changé</strong> (équipe ajoutée/retirée ou nombre de poules) : ' +
      'un nouveau tirage est nécessaire → utilise <strong>🎲 Générer</strong> (⚠️ efface les scores).';
  } else {
    btn.disabled = false;
    aide.innerHTML = '💡 Recalcule seulement les <strong>heures</strong> avec tes réglages actuels, ' +
      'en gardant les poules <strong>et les scores</strong> déjà saisis.';
  }
}

/** Recalcule les horaires sans nouveau tirage (garde poules + scores). */
async function onRecalculerHoraires() {
  if (!await dialogConfirmer(
      "Recalculer les horaires du matin ?\n\nMêmes poules, mêmes affrontements : seules les heures " +
      "(et terrains) changent. Les scores déjà saisis sont conservés.", { ok: 'Recalculer' })) return;

  const bouton = document.getElementById('bouton-recalculer-horaires');
  const message = document.getElementById('message-generation');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Recalcul…';
  afficherMessage(message, 'Recalcul des horaires…', 'ok');

  try {
    const res = await ecrireAdmin('recalculerHoraires', {});
    const avert = res && res.avertissements && res.avertissements.length;
    let texte = '✅ Horaires recalculés (' + (res.nb_matchs != null ? res.nb_matchs : '?') + ' match(s)).';
    if (res.scores_conserves) texte += '\n💾 ' + res.scores_conserves + ' score(s) conservé(s).';
    if (res.heure_fin_matin) texte += '\n🌅 Fin du matin : ' + res.heure_fin_matin + '.';
    if (res.heure_fin_journee) texte += '\n🏁 Fin de la journée : ' + res.heure_fin_journee + '.';
    if (avert) texte += '\n⚠️ ' + res.avertissements.join('\n⚠️ ');
    afficherMessage(message, texte, avert ? 'ko' : 'ok');

    // On recharge tout (comme après une génération), sans toucher aux formulaires en cours.
    await rechargerEtRendre({ reglages: true, selectCats: true });
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
    majBoutonRecalculer();
  }
}

/**
 * Met à jour l'état de préparation de la phase après-midi et l'activation du bouton.
 * Le bouton n'est actif que si TOUS les scores du matin sont saisis (sinon la
 * génération échouerait côté serveur : on l'indique à l'avance plutôt qu'en erreur).
 */
function majApresMidi() {
  const etat = document.getElementById('etat-scores-matin');
  const bouton = document.getElementById('bouton-apresmidi');
  if (!etat || !bouton) return;

  // Matchs du matin = tout ce qui n'est pas la phase de classement (après-midi).
  const matin = (matchsCourants || []).filter(function (m) { return String(m.phase) !== 'classement'; });
  const total = matin.length;
  const saisis = matin.filter(function (m) { return estTermine(m.statut); }).length;

  if (total === 0) {
    etat.textContent = '⚪️ Génère d\'abord les poules et le planning du matin.';
    bouton.disabled = true;
  } else if (saisis === total) {
    etat.textContent = '✅ ' + saisis + '/' + total + ' saisis — prêt à générer.';
    bouton.disabled = false;
  } else {
    etat.textContent = '⏳ ' + saisis + '/' + total +
      ' saisis — complète tous les scores du matin (page Saisie) avant de générer.';
    bouton.disabled = true;
  }
}

/** Génère la phase après-midi (classement croisé) à partir du classement du matin. */
async function onGenererApresMidi() {
  if (!await dialogConfirmer("Générer les matchs de l'après-midi (classement croisé) ?\n\n" +
               "Basé sur le classement du matin. N'efface PAS les matchs du matin.", { ok: 'Générer' })) return;

  const bouton  = document.getElementById('bouton-apresmidi');
  const message = document.getElementById('message-apresmidi');
  const texteBouton = bouton.textContent;
  bouton.disabled = true;
  bouton.textContent = 'Génération…';
  afficherMessage(message, "Génération de l'après-midi…", 'ok');

  try {
    const res = await ecrireAdmin('genererApresMidi', {});
    const nbM = (res && res.nb_matchs_aprem != null) ? res.nb_matchs_aprem : '?';
    const avert = res && res.avertissements && res.avertissements.length;
    let texte = '✅ ' + nbM + " match(s) d'après-midi générés." +
                (res.heure_fin_aprem ? ' Fin : ' + res.heure_fin_aprem + '.' : '');
    if (res.heure_fin_journee) texte += '\n🏁 Fin de la journée : ' + res.heure_fin_journee + '.';
    if (avert) texte += '\n⚠️ ' + res.avertissements.join('\n⚠️ ');
    afficherMessage(message, texte, avert ? 'ko' : 'ok');

    // On recharge le planning (matin + après-midi) ET les réglages (l'heure de fin auto a changé).
    await rechargerEtRendre({ reglages: true });
  } catch (erreur) {
    // Les garde-fous backend (scores du matin incomplets…) arrivent ici.
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
  }
}

/**
 * Affiche les pistes d'ajustement (arbitrages) quand le planning dépasse l'heure de fin manuelle.
 * Chaque piste est un bouton : un clic applique le réglage et régénère.
 */
function afficherArbitrages(res) {
  const zone = document.getElementById('arbitrages');
  if (!res || !res.suggestions || !res.suggestions.length) { zone.innerHTML = ''; return; }

  // L'intro diffère selon la cause :
  //   'matin'   → le matin déborde sur la pause déjeuner (contrainte dure) ;
  //   'forcage' → un forçage du nombre de poules rallonge la journée (heure de fin auto) ;
  //   'fin'     → l'heure de fin manuelle est dépassée.
  let intro;
  if (res.arbitrage_cause === 'matin') {
    intro = 'Le matin (poules) finit à <strong>' + echapper(res.heure_fin_matin) +
      '</strong>, après le début de la pause déjeuner (' + echapper(res.pause_debut) + ').<br>' +
      'Pistes pour finir le matin avant la pause <span class="arb-note">— clique pour appliquer</span> :';
  } else if (res.heure_fin_auto) {
    intro = 'Le planning finit à <strong>' + echapper(res.heure_fin_projetee) +
      '</strong> — un forçage du nombre de poules rallonge la journée.<br>' +
      'Pistes pour raccourcir <span class="arb-note">— clique pour appliquer</span> :';
  } else {
    intro = 'Le planning finit à <strong>' + echapper(res.heure_fin_projetee) +
      '</strong>, après ton heure de fin (' + echapper(res.heure_fin) + ').<br>' +
      'Pistes pour tenir le créneau <span class="arb-note">— clique pour appliquer</span> :';
  }

  let html = '<div class="arbitrages">' +
    '<p class="arb-titre">' + intro + '</p>' +
    '<ul class="arb-liste">';

  res.suggestions.forEach(function (s) {
    const m = s.modif || {};
    html += '<li>' +
      '<button type="button" class="arb-item' + (s.tient ? ' tient' : '') + '"' +
        ' data-type="' + echapper(m.type || '') + '"' +
        ' data-categorie="' + echapper(m.categorie || '') + '"' +
        ' data-champ="' + echapper(m.champ || '') + '"' +
        ' data-valeur="' + echapper(m.valeur || '') + '">' +
        echapper(s.piste) +
        ' <span class="arb-fin">→ ' + echapper(s.heure_fin) + ' (−' + s.gain_min + ' min)' +
        (s.tient ? ' ✅' : '') + '</span>' +
      '</button></li>';
  });
  html += '</ul></div>';
  zone.innerHTML = html;
}

/** Clic sur une piste d'arbitrage : applique le réglage puis régénère. */
async function onClicArbitrage(evenement) {
  const bouton = evenement.target.closest('.arb-item');
  if (!bouton) return;

  const type = bouton.getAttribute('data-type');
  const champ = bouton.getAttribute('data-champ');
  const valeur = bouton.getAttribute('data-valeur');
  const categorie = bouton.getAttribute('data-categorie');
  const message = document.getElementById('message-generation');

  if (!await dialogConfirmer('Appliquer cet ajustement puis régénérer le planning ?', { ok: 'Appliquer' })) return;

  bouton.disabled = true;
  try {
    if (type === 'global') {
      const data = {};
      data[champ] = valeur;
      await ecrireAdmin('enregistrerHoraires', data);
    } else if (type === 'categorie') {
      const cat = configCourante.categories.find(function (c) { return c.categorie === categorie; });
      const maj = Object.assign({}, cat);
      maj[champ] = valeur;
      await ecrireAdmin('enregistrerCategorie', maj);
    }
    await genererMaintenant(); // régénère avec le nouveau réglage
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    bouton.disabled = false;
  }
}

/**
 * Affiche les poules (composition) et le planning des matchs, par catégorie.
 */
function afficherPlanning(poules, matchs) {
  const zone = document.getElementById('affichage-planning');
  poules = poules || [];
  matchs = matchs || [];

  // Bouton « Modifier les poules » : visible dès qu'il y a des poules du matin (sauf en édition).
  const btnMod = document.getElementById('bouton-modifier-poules');
  if (btnMod && !editionPoules) btnMod.hidden = poules.length === 0;

  if (poules.length === 0 && matchs.length === 0) {
    zone.innerHTML = '<p class="vide">Pas encore de planning. Clique sur « Générer ».</p>';
    return;
  }

  // Nom d'une équipe à partir de son identifiant.
  function nom(id) {
    const e = equipesCourantes.find(function (x) { return x.id_equipe === id; });
    return e ? e.nom_equipe : id;
  }

  // Rend un tableau de matchs (triés par heure). enteteCol = intitulé de la 3e colonne.
  // Renvoie '' si la liste est vide.
  function tableMatchs(liste, enteteCol) {
    if (!liste.length) return '';
    liste = liste.slice().sort(function (a, b) {
      return String(a.heure_debut).localeCompare(String(b.heure_debut));
    });
    let h = '<div class="table-scroll"><table class="table-planning">' +
            '<thead><tr><th>Heure</th><th>Ter.</th><th>' + enteteCol + '</th><th>Match</th></tr></thead><tbody>';
    liste.forEach(function (m) {
      h += '<tr>' +
             '<td>' + echapper(m.heure_debut) + '</td>' +
             '<td>' + echapper(String(m.terrain)) + '</td>' +
             '<td>' + echapper(String(m.poule)) + '</td>' +
             '<td>' + echapper(nom(m.equipe_A)) + ' <span class="vs">vs</span> ' + echapper(nom(m.equipe_B)) + '</td>' +
           '</tr>';
    });
    return h + '</tbody></table></div>';
  }

  // Liste ordonnée des catégories concernées.
  const cats = [];
  poules.forEach(function (p) { if (cats.indexOf(p.categorie) < 0) cats.push(p.categorie); });
  matchs.forEach(function (m) { if (cats.indexOf(m.categorie) < 0) cats.push(m.categorie); });

  let html = '';
  cats.forEach(function (cat) {
    // Matchs de la catégorie, séparés matin (poules) / après-midi (classement croisé).
    const ms = matchs.filter(function (m) { return m.categorie === cat; });
    const matin = ms.filter(function (m) { return String(m.phase) !== 'classement'; });
    const aprem = ms.filter(function (m) { return String(m.phase) === 'classement'; });

    // Avancement : nombre de matchs dont le score est saisi (statut « terminé »).
    const saisisTotal = ms.filter(function (m) { return estTermine(m.statut); }).length;
    const saisisMatin = matin.filter(function (m) { return estTermine(m.statut); }).length;
    const saisisAprem = aprem.filter(function (m) { return estTermine(m.statut); }).length;

    html += '<h3 style="color:var(--bleu-ciel);margin:20px 0 8px;">' + echapper(cat) +
            badgeAvancement(saisisTotal, ms.length) + '</h3>';

    // Composition des poules de la catégorie.
    poules.filter(function (p) { return p.categorie === cat; }).forEach(function (p) {
      const membres = equipesCourantes
        .filter(function (e) { return e.categorie === cat && e.poule === p.nom_poule; })
        .map(function (e) { return echapper(e.nom_equipe); });
      html += '<div class="poule-compo"><strong>Poule ' + echapper(p.nom_poule) + '</strong> : ' +
              (membres.join(', ') || '—') + '</div>';
    });

    if (matin.length) {
      html += '<div class="planning-phase">🌅 Matin — poules' + badgeAvancement(saisisMatin, matin.length) + '</div>';
      html += tableMatchs(matin, 'Poule');
    }
    if (aprem.length) {
      html += '<div class="planning-phase">🏉 Après-midi — classement croisé' + badgeAvancement(saisisAprem, aprem.length) + '</div>';
      html += tableMatchs(aprem, 'Niveau');
    }
  });

  zone.innerHTML = html;
}

/** Petit badge « X/Y saisis » (vert si complet) pour le suivi de l'avancement des scores. */
function badgeAvancement(saisis, total) {
  if (!total) return '';
  const complet = saisis === total;
  return ' <span class="avancement ' + (complet ? 'avc-complet' : 'avc-partiel') + '">' +
         saisis + '/' + total + ' saisis' + (complet ? ' ✅' : '') + '</span>';
}

/* --------------------------------------------------------------------------
   MODIFICATION MANUELLE DES POULES DU MATIN
   (rééquilibrer les niveaux avant de jouer ; recalcule les matchs côté backend)
   -------------------------------------------------------------------------- */

/** Tri des catégories par nombre (U8 < U10 < U12), sinon alphabétique. */
/* comparerCat() est désormais comparerCategorie() dans commun.js. */

/** Nom lisible d'une équipe (pour l'éditeur de poules). */
function nomEquipeAdmin(id) {
  const e = equipesCourantes.find(function (x) { return x.id_equipe === id; });
  return e ? e.nom_equipe : id;
}

/** Construit le modèle d'édition à partir des poules actuelles (équipes groupées par cat./poule). */
function construireModelePoules() {
  const parCat = {};
  equipesCourantes.forEach(function (e) {
    if (!e.poule) return; // équipe non affectée (pas de planning) → ignorée
    const cat = e.categorie || '?';
    if (!parCat[cat]) parCat[cat] = { pools: {}, bench: [] };
    if (!parCat[cat].pools[e.poule]) parCat[cat].pools[e.poule] = [];
    parCat[cat].pools[e.poule].push(e.id_equipe);
  });
  return parCat;
}

/** Reconstruit la liste des poules (pour l'affichage) à partir des équipes en mémoire. */
function poulesDepuisEquipes() {
  const vues = {}, liste = [];
  equipesCourantes.forEach(function (e) {
    if (!e.poule) return;
    const cle = (e.categorie || '?') + '|' + e.poule;
    if (!vues[cle]) { vues[cle] = true; liste.push({ categorie: e.categorie, nom_poule: e.poule }); }
  });
  return liste;
}

/** Entre en mode « modifier les poules » (refusé si des scores du matin sont saisis). */
function onModifierPoules() {
  const message = document.getElementById('message-generation');
  const scoresMatin = (matchsCourants || []).filter(function (m) {
    return String(m.phase) !== 'classement' && estTermine(m.statut);
  }).length;
  if (scoresMatin > 0) {
    afficherMessage(message, '⚠️ Impossible : ' + scoresMatin + ' score(s) du matin déjà saisis. ' +
      'On ne peut plus réorganiser les poules une fois les matchs commencés.', 'ko');
    return;
  }
  editionPoules = construireModelePoules();
  document.getElementById('bouton-modifier-poules').hidden = true;
  document.getElementById('affichage-planning').innerHTML = ''; // remplacé par l'éditeur
  afficherEditionPoules();
}

/** Affiche l'éditeur de poules (cartes de poules + zone « à replacer » + équilibre). */
function afficherEditionPoules() {
  const zone = document.getElementById('edition-poules');
  let html = '<div class="edit-poules"><h3 class="edit-titre">✏️ Modifier les poules du matin</h3>' +
    '<p class="note-generation">Clique sur ✕ pour sortir une équipe, puis réaffecte-la à une poule. ' +
    'L\'équilibre du nombre d\'équipes par poule est indiqué. En validant, les matchs du matin sont recalculés.</p>';

  Object.keys(editionPoules).sort(comparerCategorie).forEach(function (cat) {
    const modele = editionPoules[cat];
    const noms = Object.keys(modele.pools).sort();
    const tailles = noms.map(function (n) { return modele.pools[n].length; });
    const min = tailles.length ? Math.min.apply(null, tailles) : 0;
    const max = tailles.length ? Math.max.apply(null, tailles) : 0;
    const desequilibre = (max - min) > 1;

    html += '<div class="edit-cat"><h4 class="edit-cat-titre">' + echapper(cat) +
      ' <span class="edit-equilibre ' + (desequilibre ? 'ko' : 'ok') + '">tailles : ' +
      tailles.join(' · ') + (desequilibre ? ' ⚠️ déséquilibré' : ' ✅') + '</span></h4>';

    html += '<div class="edit-poules-grille">';
    noms.forEach(function (nom) {
      html += '<div class="edit-poule"><div class="edit-poule-titre">Poule ' + echapper(nom) +
        ' (' + modele.pools[nom].length + ')</div>';
      modele.pools[nom].forEach(function (id) {
        html += '<div class="edit-equipe"><span>' + echapper(nomEquipeAdmin(id)) + '</span>' +
          '<button type="button" class="edit-x" data-action="retirer" data-cat="' + echapper(cat) +
          '" data-pool="' + echapper(nom) + '" data-id="' + echapper(id) + '" title="Sortir">✕</button></div>';
      });
      html += '</div>';
    });
    html += '</div>';

    if (modele.bench.length) {
      html += '<div class="edit-bench"><div class="edit-bench-titre">À replacer</div>';
      modele.bench.forEach(function (id) {
        html += '<div class="edit-equipe edit-equipe-bench"><span>' + echapper(nomEquipeAdmin(id)) +
          '</span><span class="edit-cibles">';
        noms.forEach(function (nom) {
          html += '<button type="button" class="edit-vers" data-action="affecter" data-cat="' + echapper(cat) +
            '" data-pool="' + echapper(nom) + '" data-id="' + echapper(id) + '">→ ' + echapper(nom) + '</button>';
        });
        html += '</span></div>';
      });
      html += '</div>';
    }
    html += '</div>'; // .edit-cat
  });

  html += '<div class="ligne-action">' +
    '<button type="button" class="bouton" data-action="enregistrer">💾 Enregistrer et recalculer</button>' +
    '<button type="button" class="bouton-suppr" data-action="annuler">Annuler</button>' +
    '<span class="message-form" id="message-edition-poules"></span>' +
    '</div></div>';

  zone.innerHTML = html;
}

/** Clics dans l'éditeur (délégués) : retirer / affecter / enregistrer / annuler. */
function onClicEditionPoules(evenement) {
  const bouton = evenement.target.closest('[data-action]');
  if (!bouton || !editionPoules) return;
  const action = bouton.getAttribute('data-action');
  if (action === 'annuler')     return onAnnulerEditionPoules();
  if (action === 'enregistrer') return onEnregistrerPoules();

  const cat = bouton.getAttribute('data-cat');
  const id  = bouton.getAttribute('data-id');
  const pool = bouton.getAttribute('data-pool');
  const modele = editionPoules[cat];
  if (!modele) return;

  if (action === 'retirer') {
    modele.pools[pool] = modele.pools[pool].filter(function (x) { return x !== id; });
    if (modele.bench.indexOf(id) < 0) modele.bench.push(id);
  } else if (action === 'affecter') {
    modele.bench = modele.bench.filter(function (x) { return x !== id; });
    if (modele.pools[pool].indexOf(id) < 0) modele.pools[pool].push(id);
  }
  afficherEditionPoules();
}

/** Annule l'édition et réaffiche le planning normal (matchs inchangés). */
function onAnnulerEditionPoules() {
  editionPoules = null;
  document.getElementById('edition-poules').innerHTML = '';
  afficherPlanning(poulesDepuisEquipes(), matchsCourants);
}

/** Valide la nouvelle répartition et demande au backend de recalculer les matchs du matin. */
async function onEnregistrerPoules() {
  const message = document.getElementById('message-edition-poules');

  // Toutes les équipes doivent être réaffectées (aucune « à replacer »).
  const restantes = Object.keys(editionPoules).reduce(function (n, cat) {
    return n + editionPoules[cat].bench.length;
  }, 0);
  if (restantes > 0) {
    afficherMessage(message, 'Réaffecte d\'abord les ' + restantes + ' équipe(s) « à replacer ».', 'ko');
    return;
  }

  // Construit l'assignation { id_equipe: nom_poule }.
  const assignation = {};
  Object.keys(editionPoules).forEach(function (cat) {
    const pools = editionPoules[cat].pools;
    Object.keys(pools).forEach(function (nom) {
      pools[nom].forEach(function (id) { assignation[id] = nom; });
    });
  });

  if (!await dialogConfirmer('Enregistrer cette répartition et recalculer les matchs du matin ?',
      { ok: 'Enregistrer' })) return;

  const bouton = document.querySelector('#edition-poules [data-action="enregistrer"]');
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Recalcul…'; }
  afficherMessage(message, 'Recalcul des matchs…', 'ok');
  try {
    const res = await ecrireAdmin('reorganiserPoulesMatin', { assignation: JSON.stringify(assignation) });
    editionPoules = null;
    document.getElementById('edition-poules').innerHTML = '';
    await rechargerEtRendre({ reglages: true }); // l'heure de fin auto a changé
    const nbP = (res && res.nb_poules != null) ? res.nb_poules : '?';
    const nbM = (res && res.nb_matchs != null) ? res.nb_matchs : '?';
    const finTxt = (res && res.heure_fin_journee) ? ' Fin de la journée : ' + res.heure_fin_journee + '.' : '';
    afficherMessage(document.getElementById('message-generation'),
      '✅ Poules mises à jour : ' + nbP + ' poule(s), ' + nbM + ' match(s) recalculés.' + finTxt, 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    if (bouton) { bouton.disabled = false; bouton.textContent = '💾 Enregistrer et recalculer'; }
  }
}

/* ==========================================================================
   TERRAINS PHYSIQUES & RÉPARTITION — étape 1 : déclaration + capacité
   --------------------------------------------------------------------------
   On déclare les GRANDS terrains réels (2 rugby + 2 foot) et la TAILLE de terrain
   de chaque catégorie, puis on calcule combien de mini-terrains y tiennent (avec
   un couloir de circulation entre eux). Tout est mémorisé dans Config (globaux).
   L'étape 2 (bouton « Répartir ») utilisera ces mêmes données.
   ========================================================================== */

/* Grands terrains réels par défaut (mesurés sur la vue satellite — modifiables).
   pos = emplacement sur le plan du site (grille 3×3), pour dessiner la carte « comme sur le site ». */
const TERRAINS_PHYSIQUES_DEFAUT = [
  { nom: 'Rugby 1', type: 'rugby', L: 115, W: 70, pos: 'CG' },
  { nom: 'Rugby 2', type: 'rugby', L: 110, W: 68, pos: 'BG' },
  { nom: 'Foot 1',  type: 'foot',  L: 105, W: 68, pos: 'HC' },
  { nom: 'Foot 2',  type: 'foot',  L: 100, W: 65, pos: 'CD' }
];

/* Emplacements possibles sur le plan du site (grille 3×3). */
const EMPLACEMENTS = [
  { v: '',   l: 'Auto' },
  { v: 'HG', l: '↖ Haut-gauche' },   { v: 'HC', l: '↑ Haut-centre' },  { v: 'HD', l: '↗ Haut-droite' },
  { v: 'CG', l: '← Centre-gauche' },  { v: 'CC', l: '• Centre' },       { v: 'CD', l: '→ Centre-droite' },
  { v: 'BG', l: '↙ Bas-gauche' },     { v: 'BC', l: '↓ Bas-centre' },   { v: 'BD', l: '↘ Bas-droite' }
];

/* Taille de terrain par défaut selon la catégorie (m).
   plein:true = un match occupe un GRAND terrain entier (cas U14). */
const DIMENSIONS_CATEGORIE_DEFAUT = {
  U8:  { l: 30, w: 20 },
  U10: { l: 40, w: 30 },
  U12: { l: 56, w: 45 },
  U14: { plein: true }
};

const COULOIR_DEFAUT = 5;   // couloir de circulation entre mini-terrains (m)
const TM_L_DEFAUT = 4;      // table des marques : longueur par défaut (m)
const TM_W_DEFAUT = 4;      // table des marques : largeur par défaut (m)

/**
 * Packing GUILLOTINE à orientations MIXTES : place le maximum de mini-terrains (l×w)
 * dans un rectangle, en autorisant des terrains dans un sens ET dans l'autre pour
 * remplir les bandes restantes. Renvoie la liste des mini-terrains {x,y,w,h}.
 * Heuristique : on remplit un bloc régulier (dans la meilleure orientation), puis on
 * remplit récursivement la bande de DROITE (pleine hauteur) et la bande du BAS (sous le
 * bloc) ; on teste les 2 orientations du bloc et on garde le total le plus élevé.
 */
function packerRect(x0, y0, L, W, tl, tw, m) {
  if (L <= 0 || W <= 0 || tl <= 0 || tw <= 0) return [];
  let best = [];
  [[tl, tw], [tw, tl]].forEach(function (o) {
    const a = o[0], b = o[1];
    const cols = Math.floor((L + m) / (a + m));
    const rows = Math.floor((W + m) / (b + m));
    if (cols < 1 || rows < 1) return;
    let tuiles = [];
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++)
        tuiles.push({ x: x0 + i * (a + m), y: y0 + j * (b + m), w: a, h: b });
    const usedW = cols * (a + m) - m, usedH = rows * (b + m) - m;
    const bandeDroite = L - usedW - m;                    // bande à droite du bloc (pleine hauteur)
    const bandeBas    = W - usedH - m;                    // bande sous le bloc (largeur du bloc)
    if (bandeDroite > 0) tuiles = tuiles.concat(packerRect(x0 + usedW + m, y0, bandeDroite, W, tl, tw, m));
    if (bandeBas > 0)    tuiles = tuiles.concat(packerRect(x0, y0 + usedH + m, usedW, bandeBas, tl, tw, m));
    if (tuiles.length > best.length) best = tuiles;
  });
  return best;
}

/** Liste des mini-terrains d'une catégorie sur une zone (origine ox,oy). plein = zone entière. */
function packerZone(ox, oy, L, W, tile, m) {
  if (!tile) return [];
  if (tile.plein) return [{ x: ox, y: oy, w: L, h: W }];
  return packerRect(ox, oy, L, W, tile.l, tile.w, m);
}

/** Capacité d'un grand terrain pour une catégorie (packing à orientations mixtes). */
function capaciteTerrain(field, tile, m) {
  if (!tile) return 0;
  if (tile.plein) return 1;                              // un match = tout le grand terrain
  return packerZone(0, 0, field.L, field.W, tile, m).length;
}

/**
 * Pose jusqu'à `maxN` mini-terrains d'une taille donnée dans l'ESPACE LIBRE d'un grand
 * terrain (fL×fW), en évitant les zones déjà occupées `occupees` avec un couloir de m.
 * Heuristique bas-gauche : à chaque tuile, on prend le 1er emplacement libre (y puis x le
 * plus petit), en testant les 2 orientations. Sert au « mixage » de catégories en secours.
 */
function placerDansLibre(fL, fW, occupees, tl, tw, m, maxN) {
  if (tl <= 0 || tw <= 0) return [];
  const obst = occupees.slice();
  const place = [];
  function libre(x, y, w, h) {
    if (x < -0.001 || y < -0.001 || x + w > fL + 0.001 || y + h > fW + 0.001) return false;
    for (let k = 0; k < obst.length; k++) {
      const o = obst[k];
      if (x < o.x + o.w + m - 0.001 && x + w + m - 0.001 > o.x &&
          y < o.y + o.h + m - 0.001 && y + h + m - 0.001 > o.y) return false; // trop près (< couloir)
    }
    return true;
  }
  let garde = 0;
  while (place.length < maxN && garde++ < 300) {
    const xs = [0], ys = [0];
    obst.forEach(function (o) { xs.push(o.x + o.w + m); ys.push(o.y + o.h + m); });
    xs.sort(function (a, b) { return a - b; }); ys.sort(function (a, b) { return a - b; });
    let trouve = null;
    for (let yi = 0; yi < ys.length && !trouve; yi++) {
      for (let xi = 0; xi < xs.length && !trouve; xi++) {
        if (libre(xs[xi], ys[yi], tl, tw)) trouve = { x: xs[xi], y: ys[yi], w: tl, h: tw };
        else if (libre(xs[xi], ys[yi], tw, tl)) trouve = { x: xs[xi], y: ys[yi], w: tw, h: tl };
      }
    }
    if (!trouve) break;
    place.push(trouve); obst.push(trouve);
  }
  return place;
}

/** Plan des terrains actuellement enregistré (repli sur les valeurs par défaut). */
function planTerrainsActuel() {
  const g = configCourante.global || {};
  let terrains = TERRAINS_PHYSIQUES_DEFAUT;
  try { if (g.terrains_physiques) terrains = JSON.parse(g.terrains_physiques); } catch (e) {}
  // Complète l'emplacement (pos) manquant depuis les valeurs par défaut connues (par nom) :
  // les terrains enregistrés avant l'ajout des emplacements retrouvent ainsi leur position.
  terrains = terrains.map(function (t) {
    if (t.pos) return t;
    const d = TERRAINS_PHYSIQUES_DEFAUT.find(function (x) { return x.nom.toLowerCase() === String(t.nom || '').toLowerCase(); });
    return d ? Object.assign({}, t, { pos: d.pos }) : t;
  });
  let dims = {};
  try { if (g.dimensions_categories) dims = JSON.parse(g.dimensions_categories); } catch (e) {}
  const couloir = (g.couloir_terrain_m != null && g.couloir_terrain_m !== '')
    ? (parseFloat(g.couloir_terrain_m) || 0) : COULOIR_DEFAUT;
  const tmL = (g.tm_longueur_m != null && g.tm_longueur_m !== '') ? (parseFloat(g.tm_longueur_m) || 0) : TM_L_DEFAUT;
  const tmW = (g.tm_largeur_m  != null && g.tm_largeur_m  !== '') ? (parseFloat(g.tm_largeur_m)  || 0) : TM_W_DEFAUT;
  return { terrains: terrains, dims: dims, couloir: couloir, tmL: tmL, tmW: tmW };
}

/** Noms des catégories présentes (celles qu'on dimensionne). */
function categoriesPresentes() {
  return (configCourante.categories || []).filter(estPresente)
    .map(function (c) { return String(c.categorie); });
}

/** Taille retenue pour une catégorie : enregistrée, sinon défaut connu, sinon vide. */
function dimensionCategorie(dims, nom) {
  if (dims && dims[nom]) return dims[nom];
  if (DIMENSIONS_CATEGORIE_DEFAUT[nom]) return DIMENSIONS_CATEGORIE_DEFAUT[nom];
  return { l: '', w: '' };
}

/** Injecte la carte « Terrains & répartition » dans #zone-terrains. */
function injecterTerrains() {
  const zone = document.getElementById('zone-terrains');
  if (!zone) return;
  const plan = planTerrainsActuel();
  const cats = categoriesPresentes();

  let h = '<h2>🗺️ Terrains &amp; répartition</h2>';
  h += '<p class="note-generation">Déclare tes <strong>grands terrains</strong> réels et la ' +
       '<strong>taille de chaque catégorie</strong>. L\'appli calcule combien de mini-terrains ' +
       'y tiennent (couloirs de circulation compris).</p>';

  h += '<h3 class="terr-titre">Grands terrains disponibles</h3>';
  h += '<div id="liste-terrains-physiques">';
  plan.terrains.forEach(function (t, i) { h += ligneTerrainPhysique(t, i); });
  h += '</div>';
  h += '<button type="button" class="bouton-lien" id="bouton-ajouter-terrain">+ Ajouter un grand terrain</button>';

  h += '<div class="champ-reglage" style="margin-top:14px">' +
         '<label for="couloir-terrain">Couloir de circulation entre les terrains (m)</label>' +
         '<input type="number" id="couloir-terrain" min="0" step="1" value="' + echapper(String(plan.couloir)) + '">' +
       '</div>';

  h += '<div class="champ-reglage">' +
         '<label for="tm-l">Table des marques (m)</label>' +
         '<span class="tm-taille">' +
           '<input type="number" id="tm-l" min="0" step="1" value="' + echapper(String(plan.tmL)) + '" aria-label="Longueur table des marques (m)">' +
           '<span class="terr-x">×</span>' +
           '<input type="number" id="tm-w" min="0" step="1" value="' + echapper(String(plan.tmW)) + '" aria-label="Largeur table des marques (m)">' +
           '<span class="terr-unite">m</span>' +
         '</span>' +
       '</div>';

  h += '<h3 class="terr-titre">Taille de terrain par catégorie</h3>';
  if (cats.length === 0) {
    h += '<p class="vide">Aucune catégorie présente : ajoute des catégories plus haut.</p>';
  } else {
    h += '<div id="liste-dimensions-categories">';
    cats.forEach(function (nom) { h += ligneDimensionCategorie(nom, dimensionCategorie(plan.dims, nom)); });
    h += '</div>';
  }

  h += '<h3 class="terr-titre">Capacité : mini-terrains par grand terrain</h3>';
  h += '<div id="tableau-capacite">' + tableauCapaciteHTML(plan.terrains, plan.dims, plan.couloir, cats) + '</div>';

  h += '<div class="ligne-action" style="margin-top:14px">' +
         '<button type="button" class="bouton" id="bouton-enregistrer-terrains">Enregistrer les terrains</button>' +
         '<span id="message-terrains" class="message-form"></span>' +
       '</div>';

  // Répartition automatique (étape 2)
  h += '<h3 class="terr-titre">Répartition automatique</h3>';
  h += '<p class="note-generation">Répartit les mini-terrains entre catégories <strong>selon le nombre ' +
       'd\'équipes</strong>, en gardant chaque catégorie groupée et en réservant la table des marques. ' +
       'Prévisualise la carte, puis applique.</p>';
  h += '<button type="button" class="bouton" id="bouton-repartir">🧩 Répartir les terrains</button>';
  h += '<div id="repartition-resultat"></div>';

  zone.innerHTML = h;

  // Zone (re)construite depuis l'état ENREGISTRÉ → nouvelle référence pour le
  // détecteur de « modifications non enregistrées » de l'assistant.
  if (typeof assistantMarquerPropre === 'function') assistantMarquerPropre(zone);
}

/** Une ligne « grand terrain » (nom, type, longueur × largeur, supprimer). */
function ligneTerrainPhysique(t, i) {
  const type = (t.type === 'foot') ? 'foot' : 'rugby';
  const opt = function (v, lib, sel) { return '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' + lib + '</option>'; };
  return '<div class="terrain-ligne" data-i="' + i + '">' +
    '<input class="tp-nom" type="text" value="' + echapper(String(t.nom || '')) + '" placeholder="Nom" aria-label="Nom du terrain">' +
    '<select class="tp-type" aria-label="Type de terrain">' +
      opt('rugby', '🏉 Rugby', type === 'rugby') + opt('foot', '⚽ Foot', type === 'foot') +
    '</select>' +
    '<input class="tp-l" type="number" min="0" step="1" value="' + echapper(String(t.L || '')) + '" aria-label="Longueur (m)">' +
    '<span class="terr-x">×</span>' +
    '<input class="tp-w" type="number" min="0" step="1" value="' + echapper(String(t.W || '')) + '" aria-label="Largeur (m)">' +
    '<span class="terr-unite">m</span>' +
    '<select class="tp-pos" aria-label="Emplacement sur le plan">' +
      EMPLACEMENTS.map(function (e) {
        return '<option value="' + e.v + '"' + ((t.pos || '') === e.v ? ' selected' : '') + '>' + e.l + '</option>';
      }).join('') +
    '</select>' +
    '<button type="button" class="terr-suppr" aria-label="Supprimer ce terrain">✕</button>' +
    '</div>';
}

/** Une ligne « taille de catégorie » (nom, terrain entier ?, longueur × largeur). */
function ligneDimensionCategorie(nom, d) {
  const plein = !!d.plein;
  return '<div class="dim-ligne" data-cat="' + echapper(nom) + '">' +
    '<span class="dim-nom">' + echapper(nom) + '</span>' +
    '<label class="mini-toggle"><input type="checkbox" class="dim-plein"' + (plein ? ' checked' : '') + '> terrain entier</label>' +
    '<span class="dim-taille"' + (plein ? ' hidden' : '') + '>' +
      '<input class="dim-l" type="number" min="0" step="1" value="' + echapper(String(plein ? '' : (d.l || ''))) + '" aria-label="Longueur (m)">' +
      '<span class="terr-x">×</span>' +
      '<input class="dim-w" type="number" min="0" step="1" value="' + echapper(String(plein ? '' : (d.w || ''))) + '" aria-label="Largeur (m)">' +
      '<span class="terr-unite">m</span>' +
    '</span>' +
    '</div>';
}

/** Tableau de capacité : une ligne par grand terrain, une colonne par catégorie. */
function tableauCapaciteHTML(terrains, dims, couloir, cats) {
  if (!cats || cats.length === 0) return '<p class="vide">Ajoute des catégories pour voir la capacité.</p>';
  let head = '<tr><th>Grand terrain</th>';
  cats.forEach(function (c) { head += '<th>' + echapper(c) + '</th>'; });
  head += '</tr>';
  let body = '';
  terrains.forEach(function (t) {
    body += '<tr><td class="cap-nom">' + echapper(String(t.nom || '?')) +
            ' <span class="cap-dim">' + (t.L || '?') + '×' + (t.W || '?') + '</span></td>';
    cats.forEach(function (c) {
      const d = dimensionCategorie(dims, c);
      const dimOk = d && (d.plein || (d.l > 0 && d.w > 0));
      const cap = dimOk ? capaciteTerrain({ L: +t.L, W: +t.W }, d, couloir) : '—';
      body += '<td>' + cap + (d && d.plein ? ' <span class="cap-plein">(entier)</span>' : '') + '</td>';
    });
    body += '</tr>';
  });
  return '<div class="tab-capacite-wrap"><table class="tab-capacite">' +
         '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
}

/* --- Lecture des saisies en cours (depuis le formulaire affiché) --- */
function lireTerrainsDuFormulaire() {
  const out = [];
  document.querySelectorAll('#liste-terrains-physiques .terrain-ligne').forEach(function (row) {
    out.push({
      nom:  row.querySelector('.tp-nom').value.trim(),
      type: row.querySelector('.tp-type').value,
      L:    parseFloat(row.querySelector('.tp-l').value) || 0,
      W:    parseFloat(row.querySelector('.tp-w').value) || 0,
      pos:  (row.querySelector('.tp-pos') || {}).value || ''
    });
  });
  return out;
}
function lireDimensionsDuFormulaire() {
  const out = {};
  document.querySelectorAll('#liste-dimensions-categories .dim-ligne').forEach(function (row) {
    const cat = row.getAttribute('data-cat');
    if (row.querySelector('.dim-plein').checked) { out[cat] = { plein: true }; }
    else {
      out[cat] = {
        l: parseFloat(row.querySelector('.dim-l').value) || 0,
        w: parseFloat(row.querySelector('.dim-w').value) || 0
      };
    }
  });
  return out;
}
function lireCouloir() {
  const el = document.getElementById('couloir-terrain');
  return el ? (parseFloat(el.value) || 0) : COULOIR_DEFAUT;
}
function lireTailleTM() {
  const l = parseFloat((document.getElementById('tm-l') || {}).value);
  const w = parseFloat((document.getElementById('tm-w') || {}).value);
  return { l: (l > 0 ? l : TM_L_DEFAUT), w: (w > 0 ? w : TM_W_DEFAUT) };
}

/** Recalcule et réaffiche le tableau de capacité à partir des saisies en cours. */
function recalculerCapacite() {
  const cible = document.getElementById('tableau-capacite');
  if (!cible) return;
  cible.innerHTML = tableauCapaciteHTML(
    lireTerrainsDuFormulaire(), lireDimensionsDuFormulaire(), lireCouloir(), categoriesPresentes());
}

/* --- Écouteurs délégués posés sur #zone-terrains (voir initAdmin) --- */
function onZoneTerrainsInput() { recalculerCapacite(); }

function onZoneTerrainsChange(evenement) {
  if (evenement.target.classList.contains('dim-plein')) {
    const taille = evenement.target.closest('.dim-ligne').querySelector('.dim-taille');
    if (taille) taille.hidden = evenement.target.checked; // masque L×W si « terrain entier »
  }
  recalculerCapacite();
}

function onZoneTerrainsClick(evenement) {
  if (evenement.target.id === 'bouton-ajouter-terrain') { ajouterTerrainPhysique(); return; }
  const suppr = evenement.target.closest('.terr-suppr');
  if (suppr) { suppr.closest('.terrain-ligne').remove(); recalculerCapacite(); return; }
  if (evenement.target.id === 'bouton-enregistrer-terrains') { onEnregistrerPlanTerrains(); return; }
  if (evenement.target.id === 'bouton-repartir') { onRepartir(); return; }
  if (evenement.target.id === 'bouton-appliquer-repartition') { onAppliquerRepartition(); return; }
}

function ajouterTerrainPhysique() {
  const liste = document.getElementById('liste-terrains-physiques');
  if (!liste) return;
  const i = liste.querySelectorAll('.terrain-ligne').length;
  liste.insertAdjacentHTML('beforeend',
    ligneTerrainPhysique({ nom: 'Terrain ' + (i + 1), type: 'rugby', L: 100, W: 68, pos: '' }, i));
  recalculerCapacite();
}

/** Enregistre le plan des terrains (grands terrains + couloir + tailles de catégorie). */
async function onEnregistrerPlanTerrains() {
  const message = document.getElementById('message-terrains');
  const bouton = document.getElementById('bouton-enregistrer-terrains');
  const terrains = lireTerrainsDuFormulaire();
  const dims = lireDimensionsDuFormulaire();
  const couloir = lireCouloir();
  const tm = lireTailleTM();

  if (terrains.length === 0) { afficherMessage(message, 'Ajoute au moins un grand terrain.', 'ko'); return; }
  const invalide = terrains.some(function (t) { return !(t.L > 0 && t.W > 0); });
  if (invalide) { afficherMessage(message, 'Chaque grand terrain doit avoir une longueur et une largeur.', 'ko'); return; }

  const data = {
    terrains_physiques:     JSON.stringify(terrains),
    couloir_terrain_m:      String(couloir),
    dimensions_categories:  JSON.stringify(dims),
    tm_longueur_m:          String(tm.l),
    tm_largeur_m:           String(tm.w)
  };
  const texte = bouton.textContent;
  bouton.disabled = true; bouton.textContent = 'Enregistrement…';
  try {
    await ecrireAdmin('enregistrerPlanTerrains', data);
    configCourante.global = Object.assign({}, configCourante.global, data);
    // Plan ENREGISTRÉ → l'assistant reprend sa photo de référence de la zone terrains.
    if (typeof assistantMarquerPropre === 'function') {
      assistantMarquerPropre(document.getElementById('zone-terrains'));
    }
    majEtatAvancement(); // le fil « Où en suis-je ? » suit le plan des terrains
    afficherMessage(message, '✅ Terrains enregistrés.', 'ok');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false; bouton.textContent = texte;
  }
}

/* ==========================================================================
   TERRAINS — étape 2 : répartition automatique + carte visuelle
   --------------------------------------------------------------------------
   Répartit les mini-terrains entre catégories selon le NOMBRE D'ÉQUIPES, en
   gardant chaque catégorie groupée. Deux catégories peuvent partager un grand
   terrain (scindé en deux). Sur chaque grand terrain (ou demi-terrain), 1
   mini-terrain central est réservé à la TABLE DES MARQUES (« TM »). U14 (plein)
   occupe un grand terrain entier. Prévisualisation (carte) avant application.
   ========================================================================== */

/* Palette de couleurs par catégorie (pour la carte + les puces du résumé). */
const PALETTE_CAT = ['#2E8FE0', '#27ae60', '#e67e22', '#8e44ad', '#16a085', '#c0392b', '#2c3e50'];

/* Répartition calculée en attente d'application (null = rien de calculé). */
let repartitionCalculee = null;

/** Nombre d'équipes par catégorie (d'après les équipes saisies). */
function equipesParCategorie() {
  const map = {};
  (equipesCourantes || []).forEach(function (e) {
    const c = String(e.categorie);
    map[c] = (map[c] || 0) + 1;
  });
  return map;
}

/** Préfixe court et unique pour nommer les mini-terrains (« Rugby 1 » → « R1 »). */
function prefixeTerrain(nom, i) {
  const s = String(nom || '').trim();
  const lettre = (s.toUpperCase().match(/[A-Z]/) || ['T'])[0];
  const num = (s.match(/(\d+)\s*$/) || [])[1] || String(i + 1);
  return lettre + num;
}
function construirePrefixes(fields) {
  const vus = {};
  return fields.map(function (f, i) {
    let p = prefixeTerrain(f.nom, i);
    if (vus[p]) { let k = 2; while (vus[p + k]) k++; p = p + k; }
    vus[p] = true; return p;
  });
}

/** Meilleure grille de tuiles (l×w) dans un rectangle L×W (2 orientations testées). */
function grille(L, W, tile, m) {
  let best = { cols: 0, rows: 0, a: tile.l, b: tile.w, n: 0 };
  [[tile.l, tile.w], [tile.w, tile.l]].forEach(function (o) {
    const a = o[0], b = o[1];
    const cols = Math.max(0, Math.floor((L + m) / (a + m)));
    const rows = Math.max(0, Math.floor((W + m) / (b + m)));
    const n = cols * rows;
    if (n > best.n) best = { cols: cols, rows: rows, a: a, b: b, n: n };
  });
  return best;
}
/** Répartition entière proportionnelle aux poids (méthode du plus fort reste). */
function repartitionProportionnelle(total, poids) {
  const somme = poids.reduce(function (a, b) { return a + b; }, 0) || 1;
  const brut = poids.map(function (w) { return total * w / somme; });
  const base = brut.map(Math.floor);
  let reste = total - base.reduce(function (a, b) { return a + b; }, 0);
  const ordre = brut.map(function (r, i) { return { i: i, frac: r - Math.floor(r) }; })
                    .sort(function (a, b) { return b.frac - a.frac; });
  for (let k = 0; k < ordre.length && reste > 0; k++) { base[ordre[k].i]++; reste--; }
  return base;
}

/**
 * Position de la table des marques : petite zone (tmL×tmW) placée dans le COULOIR le plus
 * proche du point cible (tX,tY) — donc entre les mini-terrains, sans en supprimer aucun.
 * (ox,oy) = origine de la zone ; renvoie des coordonnées absolues. split = deux tables (partage).
 */
function positionTableMarques(g, m, zoneL, zoneW, tmL, tmW, ox, oy, tX, tY, split) {
  const cxs = []; for (let i = 0; i < g.cols - 1; i++) cxs.push(i * (g.a + m) + g.a + m / 2); // couloirs verticaux
  const cys = []; for (let j = 0; j < g.rows - 1; j++) cys.push(j * (g.b + m) + g.b + m / 2); // couloirs horizontaux
  const proche = function (arr, cible, defaut) {
    return arr.length ? arr.reduce(function (p, c) { return Math.abs(c - cible) < Math.abs(p - cible) ? c : p; }) : defaut;
  };
  const cx = proche(cxs, tX, zoneL / 2);
  const cy = proche(cys, tY, zoneW / 2);
  const x = Math.max(0, Math.min(cx - tmL / 2, zoneL - tmL)); // reste dans la zone
  const y = Math.max(0, Math.min(cy - tmW / 2, zoneW - tmW));
  return { x: ox + x, y: oy + y, w: tmL, h: tmW, split: !!split };
}

/* --------------------------------------------------------------------------
   Sous-étapes du calcul de répartition (voir l'orchestrateur allouerTerrains).
   Chaque étape est une fonction NOMMÉE ; celles qui posent des mini-terrains
   partagent un CONTEXTE explicite `ctx` = { m, tmL, tmW, numero, avert,
   parCategorie, couleur } — avant, tout vivait en variables de closure au fond
   d'une seule fonction de ~220 lignes, dur à suivre et à tester.
   -------------------------------------------------------------------------- */

/**
 * Étape 1 — Grands terrains ENTIERS pour les catégories « plein » (U14),
 * proportionnellement aux équipes (en laissant au moins 1 grand terrain aux autres,
 * et en rognant la catégorie la plus servie en cas de dépassement).
 * Pose `c._fields` sur chaque catégorie « plein » ; renvoie le nombre de terrains pris.
 */
function attribuerTerrainsEntiers(plein, normaux, F, totalTeams) {
  let pleinFields = 0;
  if (plein.length) {
    const capP = F - (normaux.length ? 1 : 0);            // laisser au moins 1 grand terrain aux autres
    const teamsPlein = plein.reduce(function (s, c) { return s + Math.max(1, c.teams); }, 0);
    let cible = Math.round(F * teamsPlein / totalTeams);
    cible = Math.max(plein.length, Math.min(cible, Math.max(0, capP)));
    const per = repartitionProportionnelle(cible, plein.map(function (c) { return Math.max(1, c.teams); }));
    plein.forEach(function (c, i) { c._fields = Math.max(1, per[i]); });
    let somme = plein.reduce(function (s, c) { return s + c._fields; }, 0);
    while (somme > Math.max(0, capP)) {                   // rogner si dépassement
      const gros = plein.reduce(function (a, b) { return b._fields > a._fields ? b : a; });
      if (gros._fields <= 1) break;
      gros._fields--; somme--;
    }
    plein.forEach(function (c) { pleinFields += c._fields; });
  }
  return pleinFields;
}

/**
 * Étape 2 — Distribue les grands terrains restants aux catégories « normales »,
 * en raisonnant en DEMI-terrains (une catégorie peut prendre une moitié) et en
 * ÉQUILIBRANT LA CHARGE : à chaque demi-terrain libre, on sert la catégorie qui a
 * le plus d'équipes PAR terrain déjà reçu. Comme un terrain U10 (grand) contient
 * moins de mini-terrains qu'un U8 (petit), une catégorie à grands terrains reçoit
 * naturellement plus de moitiés → le nombre de terrains suit vraiment les équipes.
 * Pose `c._halves` sur chaque catégorie « normale ».
 */
function attribuerDemisTerrains(normaux, fieldsNormaux, fieldsRestants, m, avert) {
  if (normaux.length && fieldsRestants > 0) {
    const creneaux = 2 * fieldsRestants;                  // nb de demi-terrains à distribuer
    // Estimation du nb de mini-terrains qu'une catégorie tient sur une MOITIÉ de grand terrain
    // (moyenne sur les grands terrains restants, table des marques déduite).
    function estimDemi(cat) {
      let s = 0;
      fieldsNormaux.forEach(function (f) {
        const horiz = f.L >= f.W;
        s += packerZone(0, 0, horiz ? (f.L - m) / 2 : f.L, horiz ? f.W : (f.W - m) / 2, cat.tile, m).length;
      });
      return Math.max(0.1, s / fieldsNormaux.length);
    }
    const est = {}, tiles = {};
    normaux.forEach(function (c) { c._halves = 0; tiles[c.name] = 0; est[c.name] = estimDemi(c); });
    let used = 0;
    normaux.forEach(function (c) {                          // 1 demi garanti à chaque catégorie
      if (used < creneaux) { c._halves = 1; tiles[c.name] = est[c.name]; used++; }
      else avert.push('Espace insuffisant : ' + c.name + ' n’a pas reçu de terrain (ajoute un grand terrain).');
    });
    while (used < creneaux) {                               // le reste va à la plus « sous pression »
      let best = null, bestP = -1;
      normaux.forEach(function (c) {
        const p = Math.max(1, c.teams) / (tiles[c.name] + 1);
        if (p > bestP) { bestP = p; best = c; }
      });
      best._halves++; tiles[best.name] += est[best.name]; used++;
    }
  } else if (normaux.length) {
    normaux.forEach(function (c) { avert.push(c.name + ' : aucun grand terrain disponible.'); });
  }
}

/**
 * Étape 3 — Files d'attribution à partir de `_fields` / `_halves` : terrains SOLO
 * (entiers) et paires de catégories à SCINDER (une moitié chacune). Une moitié
 * orpheline (nombre impair de demi-catégories) devient un terrain entier.
 * @return { soloQueue:[{cat,plein}], paires:[[catA,catB]] }
 */
function construireFilesAttribution(plein, normaux) {
  const soloQueue = [];
  plein.forEach(function (c) { for (let k = 0; k < (c._fields || 0); k++) soloQueue.push({ cat: c, plein: true }); });
  normaux.forEach(function (c) { const wf = Math.floor((c._halves || 0) / 2); for (let k = 0; k < wf; k++) soloQueue.push({ cat: c, plein: false }); });
  const demiFile = [];
  normaux.forEach(function (c) { if ((c._halves || 0) % 2 === 1) demiFile.push(c); });
  const paires = [];
  for (let k = 0; k + 1 < demiFile.length; k += 2) paires.push([demiFile[k], demiFile[k + 1]]);
  if (demiFile.length % 2 === 1) soloQueue.push({ cat: demiFile[demiFile.length - 1], plein: false }); // moitié orpheline → terrain entier
  return { soloQueue: soloQueue, paires: paires };
}

/** Pose une catégorie SEULE sur un grand terrain : packing des mini-terrains
 *  (numérotés via ctx.numero) + table des marques dans le couloir central. */
function poserTerrainSolo(ctx, f, prefix, cat, estPlein) {
  if (estPlein) {                                       // U14 : le match occupe tout le terrain
    ctx.numero++; const id = String(ctx.numero);
    ctx.parCategorie[cat.name].push(id);
    return { field: f, prefix: prefix, mode: 'plein', zones: [{ cat: cat.name, color: ctx.couleur[cat.name],
      tiles: [{ id: id, x: 0, y: 0, w: f.L, h: f.W, label: cat.name + ' · ' + id }],
      table: { x: Math.max(0, f.L / 2 - ctx.tmL / 2), y: Math.max(0, f.W - ctx.tmW), w: ctx.tmL, h: ctx.tmW, split: false } }] };
  }
  const rects = packerZone(0, 0, f.L, f.W, cat.tile, ctx.m); // packing à orientations mixtes
  if (rects.length === 0) ctx.avert.push(f.nom + ' : trop petit pour un terrain ' + cat.name + '.');
  const tiles = [];                                        // tous les mini-terrains sont jouables
  rects.forEach(function (r) {
    ctx.numero++; const id = String(ctx.numero);
    tiles.push({ id: id, x: r.x, y: r.y, w: r.w, h: r.h, label: id });
    ctx.parCategorie[cat.name].push(id);
  });
  // Table des marques : petite zone posée dans le couloir central (grille de référence).
  const gRef = grille(f.L, f.W, cat.tile, ctx.m);
  const table = rects.length ? positionTableMarques(gRef, ctx.m, f.L, f.W, ctx.tmL, ctx.tmW, 0, 0, f.L / 2, f.W / 2, false) : null;
  return { field: f, prefix: prefix, mode: 'solo', zones: [{ cat: cat.name, color: ctx.couleur[cat.name],
    tiles: tiles, table: table }] };
}

/** Pose DEUX catégories sur un grand terrain SCINDÉ en deux moitiés (coupe
 *  gauche/droite si le terrain est large, haut/bas sinon) : packing par moitié
 *  + une table des marques par moitié, côté séparation centrale. */
function poserTerrainScinde(ctx, f, prefix, cA, cB) {
  const horizontal = f.L >= f.W;                        // terrain large → coupe gauche/droite
  const zones = [];
  function demi(cat, ox, oy, zL, zW, suff, cote) {
    const rects = packerZone(ox, oy, zL, zW, cat.tile, ctx.m); // packing à orientations mixtes
    if (rects.length === 0) ctx.avert.push(f.nom + ' (demi) : trop petit pour ' + cat.name + '.');
    const tiles = [];                                    // tous les mini-terrains sont jouables
    rects.forEach(function (r) {
      ctx.numero++; const id = String(ctx.numero);
      tiles.push({ id: id, x: r.x, y: r.y, w: r.w, h: r.h, label: id });
      ctx.parCategorie[cat.name].push(id);
    });
    // Table des marques : petite zone posée côté séparation centrale (→ deux tables face à face).
    const gRef = grille(zL, zW, cat.tile, ctx.m);
    const tX = horizontal ? (cote === 'gauche' ? zL : 0) : zL / 2;
    const tY = horizontal ? zW / 2 : (cote === 'haut' ? zW : 0);
    const table = rects.length ? positionTableMarques(gRef, ctx.m, zL, zW, ctx.tmL, ctx.tmW, ox, oy, tX, tY, true) : null;
    zones.push({ cat: cat.name, color: ctx.couleur[cat.name], tiles: tiles, table: table });
  }
  if (horizontal) {
    const hL = (f.L - ctx.m) / 2;
    demi(cA, 0, 0, hL, f.W, 'G', 'gauche');
    demi(cB, hL + ctx.m, 0, hL, f.W, 'D', 'droite');
  } else {
    const hW = (f.W - ctx.m) / 2;
    demi(cA, 0, 0, f.L, hW, 'H', 'haut');
    demi(cB, 0, hW + ctx.m, f.L, hW, 'B', 'bas');
  }
  return { field: f, prefix: prefix, mode: 'split', zones: zones };
}

/**
 * Étape 4 — Attribution des files aux grands terrains PHYSIQUES (solo d'abord,
 * puis scindés). Les terrains solo sont attribués de façon à MAXIMISER le nombre
 * de mini-terrains : chaque catégorie reçoit les grands terrains où elle « rentre »
 * le mieux (une catégorie à petits terrains profite d'un grand terrain).
 * @return fieldsPlan  la liste des grands terrains posés (pour la carte)
 */
function attribuerGrandsTerrains(ctx, fields, prefixes, soloQueue, paires, F) {
  const fieldsPlan = [];
  const dispo = fields.map(function (f, i) { return i; }); // indices de grands terrains libres

  // Catégories « plein » (U14) : un terrain entier = 1 match quel que soit sa taille → n'importe quel terrain.
  soloQueue.filter(function (s) { return s.plein; }).forEach(function (s) {
    if (!dispo.length) return;
    const i = dispo.shift();
    fieldsPlan.push(poserTerrainSolo(ctx, fields[i], prefixes[i], s.cat, true));
  });

  // Catégories normales : combien de terrains solo chacune (besoin), puis attribution GLOUTONNE
  // du meilleur couple (catégorie, grand terrain) au sens du nombre de mini-terrains.
  const besoin = {}, catParNom = {};
  soloQueue.filter(function (s) { return !s.plein; }).forEach(function (s) {
    besoin[s.cat.name] = (besoin[s.cat.name] || 0) + 1; catParNom[s.cat.name] = s.cat;
  });
  const couples = [];
  Object.keys(besoin).forEach(function (nom) {
    dispo.forEach(function (i) { couples.push({ nom: nom, i: i, n: capaciteTerrain(fields[i], catParNom[nom].tile, ctx.m) }); });
  });
  couples.sort(function (a, b) { return b.n - a.n; });        // meilleurs remplissages d'abord
  const prise = {};
  couples.forEach(function (c) {
    if (besoin[c.nom] > 0 && !prise[c.i]) {
      prise[c.i] = true; besoin[c.nom]--;
      fieldsPlan.push(poserTerrainSolo(ctx, fields[c.i], prefixes[c.i], catParNom[c.nom], false));
    }
  });
  const restants = dispo.filter(function (i) { return !prise[i]; });

  // Terrains à SCINDER (deux catégories) : sur les grands terrains restants.
  let r = 0;
  paires.forEach(function (p) {
    if (r >= restants.length) return;
    const i = restants[r++];
    fieldsPlan.push(poserTerrainScinde(ctx, fields[i], prefixes[i], p[0], p[1]));
  });
  if (soloQueue.length + paires.length > F) {
    ctx.avert.push('Pas assez de grands terrains : certaines catégories n’ont pas pu être placées.');
  }
  return fieldsPlan;
}

/**
 * Étape 5 — MIXAGE EN SECOURS (seulement si l'espace manque) : tant qu'une catégorie
 * « normale » est nettement plus chargée que les autres (ou n'a aucun terrain), on lui
 * ajoute un mini-terrain dans l'ESPACE LIBRE d'un autre grand terrain. Reste inactif
 * si équilibré. Modifie `fieldsPlan` en place et signale le mixage dans ctx.avert.
 */
function mixerEnSecours(ctx, fieldsPlan, normaux) {
  function ratioCat(c) { const n = ctx.parCategorie[c.name].length; return n > 0 ? c.teams / n : Infinity; }
  let mixage = 0, aMixe = false;
  while (mixage++ < 60 && normaux.length > 1) {
    let pire = null, prMax = -1, prMin = Infinity;
    normaux.forEach(function (c) { const rr = ratioCat(c); if (rr > prMax) { prMax = rr; pire = c; } if (rr < prMin) prMin = rr; });
    const declenche = pire && (prMax === Infinity || prMax > 1.5 * prMin); // net déséquilibre / catégorie à 0
    if (!declenche) break;
    let posee = false;
    for (let fpi = 0; fpi < fieldsPlan.length && !posee; fpi++) {
      const fp = fieldsPlan[fpi];
      if (fp.mode === 'plein') continue;
      if (fp.zones.length === 1 && fp.zones[0].cat === pire.name) continue; // déjà rempli pour elle
      const occ = [];
      fp.zones.forEach(function (z) { z.tiles.forEach(function (t) { occ.push(t); }); if (z.table) occ.push(z.table); });
      const nouv = placerDansLibre(fp.field.L, fp.field.W, occ, pire.tile.l, pire.tile.w, ctx.m, 1);
      if (!nouv.length) continue;
      const r = nouv[0]; ctx.numero++; const id = String(ctx.numero);
      const tuile = { id: id, x: r.x, y: r.y, w: r.w, h: r.h, label: id };
      ctx.parCategorie[pire.name].push(id);
      let zone = fp.zones.find(function (z) { return z.cat === pire.name; });
      if (zone) { zone.tiles.push(tuile); }
      else {                                              // 2ᵉ catégorie sur ce terrain → sa propre table
        const tm = placerDansLibre(fp.field.L, fp.field.W, occ.concat([r]), ctx.tmL, ctx.tmW, ctx.m, 1);
        fp.zones.forEach(function (z) { if (z.table) z.table.split = true; });
        fp.zones.push({ cat: pire.name, color: ctx.couleur[pire.name], tiles: [tuile],
          table: tm.length ? { x: tm[0].x, y: tm[0].y, w: ctx.tmL, h: ctx.tmW, split: true } : null });
        fp.mode = 'split';
      }
      posee = true; aMixe = true;
    }
    if (!posee) break;                                     // plus aucune place → on arrête
  }
  if (aMixe) ctx.avert.push('Espace serré : quelques terrains ont été ajoutés en partageant un grand terrain (mixage de catégories).');
}

/**
 * Calcule la répartition complète : quelle catégorie sur quel grand terrain, avec
 * la position de chaque mini-terrain (pour la carte) et la table des marques.
 * ORCHESTRATEUR : enchaîne les 5 étapes ci-dessus autour d'un contexte partagé `ctx`.
 * @return { fieldsPlan, parCategorie:{cat:[ids]}, couleur:{cat:hex}, avert:[] }
 */
function allouerTerrains(fields, cats, m, tmL, tmW) {
  // Contexte partagé par les sous-étapes. `numero` = compteur GLOBAL : les mini-terrains
  // sont numérotés 1, 2, 3… en continu sur tout le tournoi (numéro unique = pas de
  // confusion à la table des marques).
  const ctx = {
    m: m,
    tmL: tmL > 0 ? tmL : TM_L_DEFAUT,
    tmW: tmW > 0 ? tmW : TM_W_DEFAUT,
    numero: 0,
    avert: [],
    parCategorie: {},
    couleur: {}
  };
  cats.forEach(function (c, i) { ctx.parCategorie[c.name] = []; ctx.couleur[c.name] = PALETTE_CAT[i % PALETTE_CAT.length]; });

  const prefixes = construirePrefixes(fields);
  const F = fields.length;
  const totalTeams = cats.reduce(function (s, c) { return s + Math.max(1, c.teams); }, 0);
  const plein = cats.filter(function (c) { return c.tile.plein; });
  const normaux = cats.filter(function (c) { return !c.tile.plein; });

  // 1) Grands terrains ENTIERS pour les catégories « plein » (U14), proportionnel aux équipes.
  const pleinFields = attribuerTerrainsEntiers(plein, normaux, F, totalTeams);

  // 2) Le reste des grands terrains pour les catégories « normales » (en demi-terrains).
  attribuerDemisTerrains(normaux, fields.slice(pleinFields), F - pleinFields, ctx.m, ctx.avert);

  // 3) Files : terrains SOLO (entiers) et paires à SCINDER (une moitié chacune).
  const files = construireFilesAttribution(plein, normaux);

  // 4) Attribution aux grands terrains physiques (SOLO d'abord, puis SCINDÉS).
  const fieldsPlan = attribuerGrandsTerrains(ctx, fields, prefixes, files.soloQueue, files.paires, F);

  // 5) Mixage en secours si une catégorie reste nettement plus chargée que les autres.
  mixerEnSecours(ctx, fieldsPlan, normaux);

  return { fieldsPlan: fieldsPlan, parCategorie: ctx.parCategorie, couleur: ctx.couleur, avert: ctx.avert };
}

/** Bouton « Répartir » : calcule la répartition à partir des saisies en cours, l'affiche. */
function onRepartir() {
  const cont = document.getElementById('repartition-resultat');
  const fields = lireTerrainsDuFormulaire().filter(function (t) { return t.L > 0 && t.W > 0; });
  const dims = lireDimensionsDuFormulaire();
  const m = lireCouloir();
  const teams = equipesParCategorie();
  const cats = categoriesPresentes().map(function (n) { return { name: n, teams: teams[n] || 0, tile: dims[n] }; })
    .filter(function (c) { return c.tile && (c.tile.plein || (c.tile.l > 0 && c.tile.w > 0)); });

  if (fields.length === 0) { cont.innerHTML = '<div class="repart-avert">⚠️ Déclare au moins un grand terrain valide.</div>'; return; }
  if (cats.length === 0) { cont.innerHTML = '<div class="repart-avert">⚠️ Aucune catégorie avec une taille de terrain valide.</div>'; return; }

  const tm = lireTailleTM();
  repartitionCalculee = allouerTerrains(fields, cats, m, tm.l, tm.w);
  afficherRepartition(repartitionCalculee, cats);
}

/** Affiche le résumé + la carte + le bouton « Appliquer ». */
function afficherRepartition(res, cats) {
  const teams = equipesParCategorie();
  let h = '<h3 class="terr-titre">Résultat de la répartition</h3>';

  h += '<ul class="repart-resume">';
  cats.forEach(function (c) {
    const ids = res.parCategorie[c.name] || [];
    const noms = [];
    res.fieldsPlan.forEach(function (fp) {
      if (fp.zones.some(function (z) { return z.cat === c.name && z.tiles.length; }))
        noms.push(fp.field.nom + (fp.mode === 'split' ? ' (½)' : ''));
    });
    h += '<li><span class="repart-puce" style="background:' + res.couleur[c.name] + '"></span>' +
         '<strong>' + echapper(c.name) + '</strong> — ' + ids.length + ' terrain' + (ids.length > 1 ? 's' : '') +
         ' <span class="repart-detail">(' + (teams[c.name] || 0) + ' équipes · ' + (echapper(noms.join(', ')) || '—') + ')</span></li>';
  });
  h += '</ul>';

  if (res.avert.length) {
    h += '<div class="repart-avert">' + res.avert.map(function (a) { return '⚠️ ' + echapper(a); }).join('<br>') + '</div>';
  }

  h += '<div class="repart-carte-wrap">' + dessinerCarte(res) + '</div>';
  h += '<p class="note-generation">La zone grise <strong>« TM »</strong> = table des marques, réservée au centre de chaque terrain (scindée en deux quand deux catégories partagent un grand terrain).</p>';
  h += '<div class="ligne-action"><button type="button" class="bouton" id="bouton-appliquer-repartition">✅ Appliquer aux catégories</button>' +
       '<span id="message-repartition" class="message-form"></span></div>';

  document.getElementById('repartition-resultat').innerHTML = h;
}

/* Cellule (colonne, ligne) de chaque emplacement sur la grille 3×3 du plan. */
const POS_GRILLE = { HG: [0, 0], HC: [1, 0], HD: [2, 0], CG: [0, 1], CC: [1, 1], CD: [2, 1], BG: [0, 2], BC: [1, 2], BD: [2, 2] };

/** Dessine UN grand terrain (cadre + mini-terrains numérotés + table des marques) à (ox,oy). */
function groupeTerrain(fp, ox, oy, ppm) {
  const fw = fp.field.L * ppm, fh = fp.field.W * ppm;
  const catsF = fp.zones.map(function (z) { return z.cat; }).join(' / ');
  let g = '<g transform="translate(' + ox.toFixed(1) + ',' + oy.toFixed(1) + ')">';
  g += '<text x="0" y="-7" class="carte-titre"><tspan class="carte-nomterrain">' + echapper(fp.field.nom) +
       '</tspan> · ' + echapper(catsF) + '</text>';
  g += '<rect x="0" y="0" width="' + fw.toFixed(1) + '" height="' + fh.toFixed(1) + '" class="carte-terrain"/>';
  fp.zones.forEach(function (z) {
    z.tiles.forEach(function (t) {
      const x = t.x * ppm, yy = t.y * ppm, w = t.w * ppm, hh = t.h * ppm;
      g += '<rect x="' + x.toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + hh.toFixed(1) +
           '" rx="2" fill="' + z.color + '" fill-opacity="0.22" stroke="' + z.color + '" stroke-width="1"/>';
      if (w > 18 && hh > 12)
        g += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (yy + hh / 2 + 3).toFixed(1) + '" class="carte-tuile" fill="' + z.color + '">' + echapper(t.label) + '</text>';
    });
    if (z.table) {
      // taille minimale d'affichage (une TM de 4 m ≈ 6 px, sinon invisible) — centrée sur sa vraie position
      const cxT = (z.table.x + z.table.w / 2) * ppm, cyT = (z.table.y + z.table.h / 2) * ppm;
      const tw = Math.max(z.table.w * ppm, 9), th = Math.max(z.table.h * ppm, 9);
      const tx = cxT - tw / 2, ty = cyT - th / 2;
      g += '<rect x="' + tx.toFixed(1) + '" y="' + ty.toFixed(1) + '" width="' + tw.toFixed(1) + '" height="' + th.toFixed(1) + '" class="carte-table"><title>Table des marques</title></rect>';
      if (tw > 18 && th > 11) g += '<text x="' + cxT.toFixed(1) + '" y="' + (cyT + 3).toFixed(1) + '" class="carte-tm">TM</text>';
    }
  });
  g += '</g>';
  return { g: g, w: fw, h: fh };
}

/** Dessine la carte SVG. Si des emplacements sont définis → plan « comme sur le site »
 *  (grille 3×3) ; sinon → pile verticale simple. */
function dessinerCarte(res) {
  const fps = res.fieldsPlan;
  const pad = 10, titreH = 20;
  const aPos = fps.some(function (fp) { return fp.field.pos && POS_GRILLE[fp.field.pos]; });

  if (aPos) {
    const maxDim = Math.max.apply(null, fps.map(function (fp) { return Math.max(fp.field.L, fp.field.W); }).concat([1]));
    const cell = 165, gap = 14, ppm = (cell - 4) / maxDim;
    const occ = {}; let maxCol = 0, maxRow = 0; const parts = [];
    fps.forEach(function (fp) {
      const p = POS_GRILLE[fp.field.pos] || [1, 1];
      let col = p[0]; const row = p[1];
      let key = col + ',' + row;
      while (occ[key]) { col++; key = col + ',' + row; }    // décale à droite si la cellule est prise
      occ[key] = true;
      maxCol = Math.max(maxCol, col); maxRow = Math.max(maxRow, row);
      const ox = pad + col * (cell + gap);
      const oy = pad + titreH + row * (cell + titreH + gap);
      parts.push(groupeTerrain(fp, ox, oy, ppm).g);
    });
    const width = pad * 2 + (maxCol + 1) * (cell + gap);
    const height = pad * 2 + (maxRow + 1) * (cell + titreH + gap);
    return '<svg viewBox="0 0 ' + width.toFixed(0) + ' ' + height.toFixed(0) + '" width="100%" class="carte-svg" ' +
           'role="img" aria-label="Plan de répartition des terrains">' + parts.join('') + '</svg>';
  }

  // Repli : pile verticale (aucun emplacement défini).
  const maxL = Math.max.apply(null, fps.map(function (fp) { return fp.field.L; }).concat([1]));
  const ppm = 460 / maxL;
  let y0 = 0; const parts = [];
  fps.forEach(function (fp) {
    const t = groupeTerrain(fp, pad, y0 + titreH, ppm);
    parts.push(t.g);
    y0 += titreH + t.h + 16;
  });
  return '<svg viewBox="0 0 ' + (460 + 2 * pad) + ' ' + (y0 + 6).toFixed(0) + '" width="100%" class="carte-svg" ' +
         'role="img" aria-label="Carte de répartition des terrains">' + parts.join('') + '</svg>';
}

/** Applique la répartition : écrit le champ « Terrains » de chaque catégorie. */
async function onAppliquerRepartition() {
  if (!repartitionCalculee) return;
  const message = document.getElementById('message-repartition');
  const par = repartitionCalculee.parCategorie;
  const avecTerrains = Object.keys(par).filter(function (n) { return par[n] && par[n].length; });

  // On ne touche QUE les catégories en mode Auto : celles en Manuel gardent les terrains saisis.
  const catAuto = function (n) {
    const c = (configCourante.categories || []).find(function (x) { return String(x.categorie) === n; });
    return c && terrainsAutoDe(c);
  };
  const noms = avecTerrains.filter(catAuto);
  const ignorees = avecTerrains.filter(function (n) { return !catAuto(n); });

  if (noms.length === 0) {
    afficherMessage(message, ignorees.length
      ? 'Aucune catégorie en mode Auto : ' + ignorees.join(', ') + ' sont en Manuel (laissées telles quelles).'
      : 'Rien à appliquer.', 'ko');
    return;
  }

  const ok = await dialogConfirmer(
    'Écrire ces terrains dans les catégories en mode Auto ?\n\n' +
    noms.map(function (n) { return n + ' → ' + par[n].join(', '); }).join('\n') +
    (ignorees.length ? '\n\nLaissées telles quelles (mode Manuel) : ' + ignorees.join(', ') + '.' : '') +
    '\n\nCela remplace le champ « Terrains » de ces catégories (pris en compte à la prochaine génération du planning).',
    { ok: 'Appliquer' });
  if (!ok) return;

  // Composition des GRANDS terrains (nom → numéros de mini-terrains), mémorisée en Config :
  // la page Saisie des scores s'en sert pour filtrer les matchs par grand terrain (table de marque).
  const composition = {};
  repartitionCalculee.fieldsPlan.forEach(function (fp) {
    const ids = [];
    (fp.zones || []).forEach(function (z) { (z.tiles || []).forEach(function (t) { ids.push(t.id); }); });
    if (ids.length) composition[String(fp.field.nom)] = ids;
  });

  const bouton = document.getElementById('bouton-appliquer-repartition');
  if (bouton) { bouton.disabled = true; bouton.textContent = 'Application…'; }
  try {
    for (let k = 0; k < noms.length; k++) {
      const nom = noms[k];
      const catObj = (configCourante.categories || []).find(function (c) { return String(c.categorie) === nom; });
      if (!catObj) continue;
      const data = Object.assign({}, catObj, { terrains: par[nom].join(',') });
      await ecrireAdmin('enregistrerCategorie', data);
      const idx = configCourante.categories.findIndex(function (c) { return String(c.categorie) === nom; });
      if (idx >= 0) configCourante.categories[idx] = data;
    }
    // Mémorise la composition des grands terrains (pour le filtre de la page Saisie).
    const compositionJson = JSON.stringify(composition);
    await ecrireAdmin('enregistrerPlanTerrains', { repartition_grands_terrains: compositionJson });
    configCourante.global = Object.assign({}, configCourante.global,
      { repartition_grands_terrains: compositionJson });
    injecterReglages(configCourante.global, configCourante.categories); // les cartes catégories montrent les nouveaux terrains
    // IMPORTANT : on efface l'état « répartition en attente » AVANT de rafraîchir
    // le fil — sinon le verrou de la barre latérale voit encore « répartition
    // calculée → Appliquer » et l'étape suivante reste fermée jusqu'au clic suivant.
    repartitionCalculee = null;
    document.getElementById('repartition-resultat').innerHTML = '';
    majEtatAvancement(); // le fil ET le verrou suivent immédiatement
    await dialogAlerter('✅ Terrains appliqués aux catégories en mode Auto (' + noms.join(', ') + ').' +
      (ignorees.length ? '\nLaissées en Manuel : ' + ignorees.join(', ') + '.' : '') +
      '\nIls seront utilisés à la prochaine génération du planning.');
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
    if (bouton) { bouton.disabled = false; bouton.textContent = '✅ Appliquer aux catégories'; }
  }
}

/* afficherMessage(), estTermine() et echapper() sont désormais dans commun.js. */

/* On lance tout une fois la page prête. */
document.addEventListener('DOMContentLoaded', initAdmin);
