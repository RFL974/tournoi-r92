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

/* Champs modifiables d'une catégorie : clé (dans le Sheet), libellé, type de champ. */
const CHAMPS_CATEGORIE = [
  { cle: 'terrains',               label: 'Terrains',                  type: 'text' },
  { cle: 'nb_poules',              label: 'Nombre de poules',          type: 'text', placeholder: 'Auto' },
  { cle: 'format_mi_temps',        label: 'Nb mi-temps',               type: 'select', options: ['1', '2'] },
  { cle: 'duree_mi_temps_min',     label: 'Durée mi-temps (min)',      type: 'number' },
  { cle: 'pause_mi_temps_min',     label: 'Pause mi-temps (min)',      type: 'number' },
  { cle: 'recup_entre_matchs_min', label: 'Récup. entre matchs (min)', type: 'number' }
];

/* On garde en mémoire la config, les équipes et les matchs chargés (pour l'affichage). */
let configCourante = { global: {}, categories: [] };
let equipesCourantes = [];
let matchsCourants = [];
/* Affiche du tournoi choisie mais pas encore enregistrée (Data URI redimensionné). */
let afficheDataURI = '';

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
    zoneReglages.innerHTML =
      afficherHoraires(data.config.global) + afficherCategories(data.config.categories);

    // 2) Équipes : on remplit la liste déroulante des catégories et la liste des équipes
    remplirSelectCategories(data.config.categories);
    afficherEquipes(data.equipes);

    // 3) Poules & planning déjà générés (s'il y en a)
    afficherPlanning(data.poules, data.matchs);
    majApresMidi(); // état de préparation de la phase après-midi

    // 4) Infos du tournoi (nom / date / lieu / description) + état de publication
    majInfosTournoi();
    majPublication();

    // 5) Tableau de bord (récap en haut de page) + horodatage
    majTableauBord();
    majHeureAdmin();

  } catch (erreur) {
    zoneReglages.innerHTML =
      '<div class="message erreur">Impossible de charger les réglages.<br>' +
      'Détail : ' + erreur.message + '</div>';
  }

  // « Connexion » : on demande la clé admin une fois à l'ouverture (puis mémorisée).
  const connecte = await connexion('admin', "à l'administration");
  majBarreConnexion(connecte);

  // Barre de connexion : boutons « Se connecter » / « Changer de clé » (délégué).
  document.getElementById('barre-connexion').addEventListener('click', onClicConnexion);

  // Bouton « Rafraîchir » : recharge scores/planning depuis le backend (utile le jour J).
  document.getElementById('bouton-rafraichir-admin').addEventListener('click', rafraichirAdmin);

  // On branche le formulaire d'ajout et les boutons de suppression (équipes).
  document.getElementById('form-equipe').addEventListener('submit', onAjouterEquipe);
  document.getElementById('liste-equipes').addEventListener('click', onClicListe);

  // Zone réglages : écouteurs "délégués" (valables même après re-rendu de la zone).
  // (zoneReglages est déjà déclaré en haut de initAdmin.)
  zoneReglages.addEventListener('submit', onReglagesSubmit);
  zoneReglages.addEventListener('click', onReglagesClick);
  zoneReglages.addEventListener('change', onReglagesChange);

  // Bouton de génération des poules et du planning.
  document.getElementById('bouton-generer').addEventListener('click', onGenerer);

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
  // Bouton dédié : enregistre les infos (nom/date/lieu/description + affiche) à tout moment,
  // indépendamment de la publication.
  document.getElementById('bouton-enregistrer-infos').addEventListener('click', onEnregistrerInfos);
  // Choix d'un fichier d'affiche → aperçu immédiat.
  document.querySelector('#form-infos-tournoi [name="tournoi_affiche"]')
    .addEventListener('change', onChoisirAffiche);
  // Bouton « Retirer l'affiche » (annule un choix non enregistré, ou supprime l'affiche enregistrée).
  document.getElementById('bouton-retirer-affiche').addEventListener('click', onRetirerAffiche);
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
}

/** URL d'affichage d'une affiche stockée dans Drive (CDN lh3, largeur maxi w).
 *  lh3.googleusercontent.com (et non drive.google.com/thumbnail, qui bloque le hotlinking). */
function urlAffiche(id, largeur) {
  return 'https://lh3.googleusercontent.com/d/' + encodeURIComponent(id) + '=w' + (largeur || 1000);
}

/** Quand on choisit un fichier : on le redimensionne et on affiche un aperçu immédiat. */
async function onChoisirAffiche(evenement) {
  const fichier = evenement.target.files && evenement.target.files[0];
  const message = document.getElementById('message-infos-tournoi');
  if (!fichier) { afficheDataURI = ''; return; }
  try {
    afficheDataURI = await redimensionnerImage(fichier, 1000, 0.82);
    const bloc = document.getElementById('apercu-affiche');
    document.getElementById('apercu-affiche-img').src = afficheDataURI;
    bloc.hidden = false;
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

  // Planning : matin généré ? après-midi généré ?
  const matin = (matchsCourants || []).filter(function (m) { return String(m.phase) !== 'classement'; });
  const aprem = (matchsCourants || []).filter(function (m) { return String(m.phase) === 'classement'; });
  if (matin.length === 0)      elPl.textContent = '⚪️ à générer';
  else if (aprem.length > 0)   elPl.textContent = '🌅🏉 complet';
  else                         elPl.textContent = '🌅 matin';

  // Publication.
  elPub.textContent = estPublie() ? '🟢 publié' : '⚪️ non';
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
    const data = await apiGet('getAll');
    configCourante = data.config;
    equipesCourantes = data.equipes;
    matchsCourants = data.matchs || [];
    afficherEquipes(data.equipes);
    afficherPlanning(data.poules, data.matchs);
    majApresMidi();
    majPublication();
    majTableauBord();
    majHeureAdmin();
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
 * après une double confirmation. Conserve les réglages « Horaires de la journée » et
 * l'historique de saison. Recharge toute la page ensuite.
 */
async function onReinitialiser() {
  const message = document.getElementById('message-reinitialisation');
  const bouton = document.getElementById('bouton-reinitialiser');

  // Double confirmation : l'action est irréversible.
  if (!await dialogConfirmer('Réinitialiser le tournoi ?\n\n' +
               'Cela supprime définitivement les catégories, les équipes, les poules, ' +
               'les matchs (planning + scores) et les infos du tournoi.\n' +
               'Les réglages horaires et l\'historique de saison sont conservés.',
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
    const data = await apiGet('getAll');
    configCourante = data.config;
    equipesCourantes = data.equipes;
    matchsCourants = data.matchs || [];
    document.getElementById('reglages').innerHTML =
      afficherHoraires(data.config.global) + afficherCategories(data.config.categories);
    remplirSelectCategories(data.config.categories);
    afficherEquipes(data.equipes);
    afficherPlanning(data.poules, data.matchs);
    document.getElementById('arbitrages').innerHTML = '';
    majApresMidi();
    majInfosTournoi();
    majPublication();
    majTableauBord();

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
  document.getElementById('reglages').innerHTML =
    afficherHoraires(cfg.global) + afficherCategories(cfg.categories);
  remplirSelectCategories(cfg.categories); // le menu des équipes suit les catégories présentes
  majTableauBord(); // le nombre de catégories a pu changer
}

/* --------------------------------------------------------------------------
   AFFICHAGE DES RÉGLAGES
   -------------------------------------------------------------------------- */

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

  // Carte repliable, OUVERTE par défaut : réglée une fois en début de journée,
  // on peut ensuite la plier pour raccourcir la page.
  return (
    '<details class="carte" open>' +
      '<summary>Horaires de la journée</summary>' +
      '<form id="form-horaires" class="form-reglages">' +
        champHeure('heure_debut', 'Heure de début des matchs', val('heure_debut')) +
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
        champNombre('battement_terrain_min', 'Battement terrain entre les matchs (min)', val('battement_terrain_min', '5')) +
        champHeure('pause_dejeuner_debut', 'Pause déjeuner — début', val('pause_dejeuner_debut')) +
        champNombre('pause_dejeuner_duree_min', 'Pause déjeuner — durée (min)', val('pause_dejeuner_duree_min')) +
        '<div class="ligne-action">' +
          '<button type="submit" class="bouton">Enregistrer les horaires</button>' +
          '<span id="message-horaires" class="message-form"></span>' +
        '</div>' +
      '</form>' +
    '</details>'
  );
}

/* Un champ "heure" (rouleau natif sur mobile). */
function champHeure(nom, label, valeur) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="time" id="h-' + nom + '" name="' + nom + '" value="' + valeur + '">' +
         '</div>';
}

/* Un champ "nombre" (ex : durée en minutes). */
function champNombre(nom, label, valeur) {
  return '<div class="champ-reglage">' +
           '<label for="h-' + nom + '">' + label + '</label>' +
           '<input type="number" id="h-' + nom + '" name="' + nom + '" min="0" step="5" value="' + valeur + '">' +
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
    heure_fin:                form.heure_fin.value,
    heure_fin_auto:           auto ? 'oui' : 'non',
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
  let html = '<h2 style="margin:24px 0 12px;">Catégories</h2>';

  if (categories && categories.length > 0) {
    categories.forEach(function (cat) {
      html += formulaireCategorie(cat);
    });
  } else {
    html += '<p class="vide">Aucune catégorie. Ajoute-en une ci-dessous.</p>';
  }

  // Formulaire d'ajout d'une catégorie.
  html +=
    '<form id="form-ajout-categorie" class="carte">' +
      '<h3 style="color:var(--bleu-ciel);margin-bottom:10px;">Ajouter une catégorie</h3>' +
      '<div class="form-equipe">' +
        '<input type="text" name="categorie" placeholder="Nom (ex : U16)" autocomplete="off" required>' +
        '<button type="submit" class="bouton">Ajouter</button>' +
      '</div>' +
      '<div class="message-form" data-role="msg-ajout-cat"></div>' +
    '</form>';

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
      '<div class="grille-reglages">' + champs + '</div>' +
      '<div class="ligne-action">' +
        '<button type="submit" class="bouton">Enregistrer</button>' +
        '<button type="button" class="bouton-suppr bouton-suppr-cat" data-cat="' + echapper(nom) + '">Supprimer</button>' +
        '<span class="message-form message-cat"></span>' +
      '</div>' +
    '</form>'
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
  if (typeof data.terrains === 'string') data.terrains = data.terrains.trim();

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
    remplirSelectCategories(configCourante.categories);
    majTableauBord(); // le nombre de catégories « présentes » a pu changer
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
async function onAjouterCategorie(evenement) {
  evenement.preventDefault();
  const form = evenement.target;
  const message = form.querySelector('[data-role="msg-ajout-cat"]');
  const nom = form.categorie.value.trim();

  if (!nom) { afficherMessage(message, 'Indique un nom.', 'ko'); return; }

  // On refuse un doublon (sinon on écraserait la catégorie existante).
  const existe = configCourante.categories.some(function (c) {
    return String(c.categorie).toLowerCase() === nom.toLowerCase();
  });
  if (existe) { afficherMessage(message, 'Cette catégorie existe déjà.', 'ko'); return; }

  const data = {
    categorie: nom, presente: 'oui', terrains: '', nb_poules: '',
    format_mi_temps: '2', duree_mi_temps_min: '10', pause_mi_temps_min: '2',
    recup_entre_matchs_min: '15'
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
    const data = await apiGet('getAll');
    configCourante = data.config;
    equipesCourantes = data.equipes;
    matchsCourants = data.matchs || [];
    document.getElementById('reglages').innerHTML =
      afficherHoraires(data.config.global) + afficherCategories(data.config.categories);
    remplirSelectCategories(data.config.categories);
    afficherPlanning(data.poules, data.matchs);
    majApresMidi(); // le matin vient de changer → recalcul de l'état
    majTableauBord();
  } catch (erreur) {
    afficherMessage(message, '⚠️ ' + erreur.message, 'ko');
  } finally {
    bouton.disabled = false;
    bouton.textContent = texteBouton;
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
    if (avert) texte += '\n⚠️ ' + res.avertissements.join('\n⚠️ ');
    afficherMessage(message, texte, avert ? 'ko' : 'ok');

    // On recharge le planning (matin + après-midi).
    const data = await apiGet('getAll');
    equipesCourantes = data.equipes;
    matchsCourants = data.matchs || [];
    afficherPlanning(data.poules, data.matchs);
    majApresMidi();
    majTableauBord();
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
   PETITES AIDES
   -------------------------------------------------------------------------- */

/** Affiche un message de retour (succès/erreur) sous le formulaire. */
function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.className = 'message-form ' + (type === 'ok' ? 'ok' : 'ko');
}

/** Vrai si le statut d'un match vaut « terminé » (score saisi), quelle que soit la forme
 *  du « é » (NFC/NFD) : le Sheet renvoie parfois un « é » décomposé, on teste « termin ». */
function estTermine(statut) {
  return /^\s*termin/i.test(String(statut));
}

/** Neutralise les caractères spéciaux HTML (sécurité d'affichage). */
function echapper(texte) {
  return String(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* On lance tout une fois la page prête. */
document.addEventListener('DOMContentLoaded', initAdmin);
