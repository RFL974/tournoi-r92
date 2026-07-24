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
  if (typeof injecterIcones === 'function') injecterIcones(); // icônes SVG des boutons statiques

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
  // Zone d'affiche : sélecteur de fichier + glisser-déposer, aperçu immédiat (helper commun).
  brancherZoneImage({
    champFichier: '#form-infos-tournoi [name="tournoi_affiche"]',
    zoneDepot: 'zone-depot-affiche',
    traiter: traiterFichierAffiche
  });
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
  // Zone photo parking : même mécanique que l'affiche (helper commun).
  brancherZoneImage({
    champFichier: '#form-parking [name="parking_photo"]',
    zoneDepot: 'zone-depot-parking',
    traiter: traiterFichierParking
  });
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
  document.getElementById('apercu-invitation-intro').addEventListener('input', majApercuInvitation);
  document.getElementById('bouton-regenerer-invitation').addEventListener('click', onRegenererInvitation);
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

/**
 * Câble une zone d'image (affiche du tournoi / photo de parking) : sélecteur de fichier
 * (change) + glisser-déposer (dragover/dragleave/drop), avec aperçu immédiat via `traiter`.
 * Avant, ce câblage + les handlers onChoisir/onDeposer existaient en DOUBLE (affiche/parking) ;
 * seuls diffèrent les ids et la fonction `traiter` (qui, elle, garde sa logique propre :
 * variable d'aperçu, message, callbacks). Le CLIC d'ouverture reste natif (zone dans un <label>).
 * @param {Object} cfg { champFichier: sélecteur CSS de l'<input file>, zoneDepot: id de la zone,
 *                        traiter: fonction(fichier) }
 */
function brancherZoneImage(cfg) {
  const input = document.querySelector(cfg.champFichier);
  if (input) input.addEventListener('change', function (e) {
    cfg.traiter(e.target.files && e.target.files[0]);
  });
  const zone = document.getElementById(cfg.zoneDepot);
  if (!zone) return;
  zone.addEventListener('dragover', function (e) {
    e.preventDefault(); // sinon le navigateur OUVRE le fichier au lieu de le déposer
    zone.classList.add('est-survolee');
  });
  zone.addEventListener('dragleave', function () { zone.classList.remove('est-survolee'); });
  zone.addEventListener('drop', function (e) {
    e.preventDefault();
    zone.classList.remove('est-survolee');
    cfg.traiter(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
  });
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
  await avecBoutonOccupe(bouton, message, async function () {
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

/* Le TABLEAU DE BORD, le fil « Où en suis-je ? » et les SIGNATURES (miroir backend) sont
   désormais dans admin-tableau-bord.js — chargé après admin.js dans admin.html. */

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
      '<span>' + svgIcone('verrou_ouvert') + 'Connecté à l\'administration</span>' +
      '<span class="barre-actions">' +
        '<button type="button" class="bouton-lien" id="bouton-changer-cle">Changer de clé</button>' +
        '<button type="button" class="bouton-lien" id="bouton-verrouiller">' + svgIcone('verrou') + 'Verrouiller</button>' +
      '</span>';
  } else {
    barre.className = 'barre-connexion deconnecte';
    barre.innerHTML =
      '<span>' + svgIcone('verrou') + 'Non connecté — les enregistrements seront refusés</span>' +
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

/* ────────────────────────────────────────────────────────────────────────────
   MODULES EXTRAITS de ce fichier (chargés APRÈS admin.js dans admin.html, dans
   cet ordre). Tous sortis tels quels du monolithe, sans changement de comportement :
     · admin-invitations.js — invitation email + dossier d'invitation + clubs invités
     · admin-reglages.js    — réglages (horaires + catégories)
     · admin-equipes.js     — CRUD des équipes
     · admin-generation.js  — génération poules/planning, arbitrages, après-midi, poules
     · admin-terrains.js    — terrains physiques & répartition (packing, carte SVG)
     · admin-tableau-bord.js— tableau de bord + « Où en suis-je ? » + signatures (miroir backend)
   admin.js conserve le NOYAU : initAdmin, rechargerEtRendre, l'état global partagé,
   les routeurs d'événements délégués, infos-tournoi, contacts, dossier/publication.
   ──────────────────────────────────────────────────────────────────────────── */

/* afficherMessage(), estTermine() et echapper() sont désormais dans commun.js. */

/* On lance tout une fois la page prête. */
document.addEventListener('DOMContentLoaded', initAdmin);
