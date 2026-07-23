/**
 * ============================================================================
 *  TOURNOI R92 — Backend Google Apps Script
 * ============================================================================
 *  - setupSheet()  : crée les 6 onglets (à lancer UNE SEULE FOIS au tout début).
 *  - doGet(e)      : LECTURE (renvoie du JSON).
 *  - doPost(e)     : ÉCRITURE (équipes, réglages, génération des poules/planning).
 * ============================================================================
 */

var SHEET_ID = '17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U';

var ENTETES = {
  Equipes: ['id_equipe', 'nom_equipe', 'categorie', 'poule'],
  Poules: ['id_poule', 'categorie', 'nom_poule'],
  // Clubs INVITÉS au tournoi (dossier d'invitation envoyé AVANT confirmation).
  // ⚠️ Contient des emails de contact : cet onglet n'est JAMAIS inclus dans le
  // snapshot public (getAll) — il se lit via l'action listerClubsInvites (clé admin).
  ClubsInvites: ['club_nom', 'club_contact_nom', 'club_contact_email', 'statut', 'date_ajout'],
  // Colonnes 1-12 : historiques (matin + après-midi CROISE/LIBRE).
  // Colonnes 13-18 : format d'après-midi + tableau à élimination (COUPE_PLATEAU).
  //   format        : CROISE / LIBRE / COUPE_PLATEAU (recopié depuis la catégorie ; vide pour le matin)
  //   sous_tableau  : COUPE / PLATEAU (uniquement en COUPE_PLATEAU)
  //   tour          : libellé lisible du tour de bracket (FINALE, DEMI_FINALE, PETITE_FINALE…)
  //   match_suivant : id_match qui reçoit le VAINQUEUR de ce match (vide si terminal)
  //   place_suivant : A ou B — sur quel emplacement du match suivant placer le vainqueur
  //   vainqueur     : id_equipe DÉSIGNÉE vainqueur en cas d'égalité (départage manuel, COUPE)
  Matchs: ['id_match', 'categorie', 'poule', 'terrain', 'heure_debut', 'heure_fin',
           'equipe_A', 'equipe_B', 'score_A', 'score_B', 'statut', 'phase',
           'format', 'sous_tableau', 'tour', 'match_suivant', 'place_suivant', 'vainqueur'],
  // Journal de saison : un match terminé = une ligne, JAMAIS effacée par une génération.
  // On stocke les NOMS d'équipe (stables d'un tournoi à l'autre, contrairement aux id).
  Historique: ['date', 'tournoi_id', 'id_match', 'categorie', 'phase',
               'equipe_A', 'equipe_B', 'score_A', 'score_B']
};
var COULEUR_FOND_ENTETE = '#0B2138';
var COULEUR_TEXTE_ENTETE = '#F2F6FB';

/* ⚠️ À ne lancer qu'une fois. Relancer réécrirait l'onglet Config avec les exemples. */
function setupSheet() {
  var classeur = SpreadsheetApp.openById(SHEET_ID);
  creerOngletAvecEntetes(classeur, 'Equipes', ENTETES.Equipes);
  creerOngletAvecEntetes(classeur, 'Poules', ENTETES.Poules);
  creerOngletAvecEntetes(classeur, 'Matchs', ENTETES.Matchs);
  creerOngletAvecEntetes(classeur, 'Historique', ENTETES.Historique);
  creerOngletAvecEntetes(classeur, 'ClubsInvites', ENTETES.ClubsInvites);
  creerOngletConfig(classeur);
  try {
    SpreadsheetApp.getUi().alert('✅ Base prête !', 'Les 6 onglets ont été créés.',
      SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) { Logger.log('Base prête !'); }
}

function creerOngletAvecEntetes(classeur, nomOnglet, entetes) {
  var onglet = classeur.getSheetByName(nomOnglet);
  if (!onglet) { onglet = classeur.insertSheet(nomOnglet); }
  var zoneEntete = onglet.getRange(1, 1, 1, entetes.length);
  zoneEntete.setValues([entetes]);
  stylerEntete(zoneEntete);
  onglet.setFrozenRows(1);
}

function creerOngletConfig(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) { onglet = classeur.insertSheet('Config'); }
  var zoneA = [
    ['parametre', 'valeur'],
    ['heure_debut', '09:00'],
    ['heure_fin', '17:00'],
    ['heure_fin_auto', 'oui'],
    ['battement_terrain_min', '5'],
    ['pause_dejeuner_debut', '12:30'],
    ['pause_dejeuner_duree_min', '60'],
    ['heure_rdv', '07:45'],
    ['heure_fin_communiquee', ''],
    ['marge_fin_communiquee_min', '75']
  ];
  var titreZoneB = zoneA.length + 2;
  var ligneDebutZoneB = zoneA.length + 3;
  // nb_poules : vide = Auto (calculé selon le nombre d'équipes) ; un nombre = forcé.
  // format_apresmidi : CROISE / CROISE_DIAGONAL / LIBRE / COUPE_PLATEAU (vide = CROISE, historique).
  // param_format : JSON court des réglages du format (ex COUPE_PLATEAU : {"nbQualifiesCoupe":2}).
  // terrains_auto : oui = terrains attribués via l'onglet Terrains (défaut) ; non = saisie manuelle.
  // reglement : texte libre OU URL (une valeur commençant par « http » sera affichée en lien).
  // effectif_min / effectif_max : nombre de joueurs par équipe (dossier club) — optionnels.
  // arbitrage_organisation : qui arbitre (« arbitrage » seul est déjà pris par l'assistant horaires).
  var entetesCategorie = ['categorie', 'presente', 'terrains', 'terrains_auto', 'nb_poules',
    'format_mi_temps', 'duree_mi_temps_min', 'pause_mi_temps_min', 'recup_entre_matchs_min',
    'format_apresmidi', 'param_format',
    'reglement', 'effectif_min', 'effectif_max', 'arbitrage_organisation'];
  var exemplesCategorie = [
    ['U8',  'oui', '1,2', 'oui', '', '2', '8',  '2', '15', 'LIBRE',         '', '', '', '', ''],
    ['U10', 'oui', '3,4', 'oui', '', '2', '10', '2', '15', 'CROISE',        '', '', '', '', ''],
    ['U12', 'oui', '5,6', 'oui', '', '2', '12', '3', '15', 'COUPE_PLATEAU', '{"nbQualifiesCoupe":2}', '', '', '', ''],
    ['U14', 'oui', '7,8', 'oui', '', '2', '15', '3', '20', 'CROISE',        '', '', '', '', '']
  ];
  onglet.getRange(1, 1, 60, entetesCategorie.length + 1).setNumberFormat('@');
  onglet.getRange(1, 1, zoneA.length, 2).setValues(zoneA);
  stylerEntete(onglet.getRange(1, 1, 1, 2));
  onglet.getRange(titreZoneB, 1).setValue('— Réglages par catégorie —').setFontWeight('bold');
  onglet.getRange(ligneDebutZoneB, 1, 1, entetesCategorie.length).setValues([entetesCategorie]);
  stylerEntete(onglet.getRange(ligneDebutZoneB, 1, 1, entetesCategorie.length));
  onglet.getRange(ligneDebutZoneB + 1, 1, exemplesCategorie.length, entetesCategorie.length)
        .setValues(exemplesCategorie);
  onglet.autoResizeColumns(1, entetesCategorie.length);
}

function stylerEntete(zone) {
  zone.setBackground(COULEUR_FOND_ENTETE).setFontColor(COULEUR_TEXTE_ENTETE).setFontWeight('bold');
}

/* ===================== LECTURE (doGet) ===================== */
function doGet(e) {
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || 'ping';
  try {
    // ⚡ PERFORMANCE : `ping` et `getAll` (servi par le cache) répondent SANS ouvrir le
    // classeur — SpreadsheetApp.openById() coûte à lui seul ~0,5 s. Or getAll est l'appel
    // MASSIF (page publique, milliers de spectateurs) : servi du cache, il doit répondre en
    // quelques millisecondes. Plus chaque requête est courte, plus le plafond Apps Script
    // (~30 exécutions simultanées) se libère vite → la même Web App encaisse bien plus de monde.
    if (action === 'ping') return repondreJson({ ok: true, message: 'API Tournoi R92 en ligne' });
    // getAll : copie mise en cache ~10 s. Un seul lecteur relit le Sheet par tranche, les
    // autres reçoivent la copie instantanément. Le cache est rafraîchi à chaque écriture.
    if (action === 'getAll') {
      return ContentService.createTextOutput(snapshotJsonCache())
        .setMimeType(ContentService.MimeType.JSON);
    }

    var classeur = SpreadsheetApp.openById(SHEET_ID);
    var resultat;
    switch (action) {
      case 'getConfig':  resultat = lireConfig(classeur); break;
      case 'getEquipes': resultat = lireOngletSimple(classeur, 'Equipes'); break;
      case 'getPoules':  resultat = lireOngletSimple(classeur, 'Poules'); break;
      case 'getMatchs':  resultat = lireOngletSimple(classeur, 'Matchs'); break;
      case 'getClassement': resultat = calculerClassement(classeur); break;
      case 'getHistorique': resultat = lireHistorique(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    return repondreJson(resultat);
  } catch (erreur) {
    // On journalise le détail côté serveur (Logger) mais on ne renvoie qu'un message
    // générique : les messages d'exception bruts peuvent trahir la structure interne.
    Logger.log('doGet erreur : ' + erreur);
    return repondreJson({ error: 'Erreur serveur pendant la lecture.' });
  }
}

function repondreJson(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Instantané complet des données publiques (même forme que l'action getAll). */
function construireSnapshot(classeur) {
  return {
    config:  lireConfig(classeur),
    equipes: lireOngletSimple(classeur, 'Equipes'),
    poules:  lireOngletSimple(classeur, 'Poules'),
    matchs:  lireOngletSimple(classeur, 'Matchs')
  };
}

/**
 * getAll mis en CACHE (~10 s) : gros gain de capacité pour la page publique. Un seul
 * appel par tranche de 10 s relit le Sheet ; les autres reçoivent la copie en mémoire.
 * Renvoie directement la CHAÎNE JSON (pas de re-sérialisation).
 *
 * Le classeur n'est ouvert (openById ≈ 0,5 s) QUE si le cache est vide : le cas courant
 * (cache chaud) répond en quelques millisecondes sans toucher au Sheet.
 *
 * ANTI-POINTE (« cache stampede ») : à l'expiration du cache, des DIZAINES de spectateurs
 * pourraient relire le Sheet en même temps et saturer d'un coup le plafond d'exécutions
 * simultanées. On élit donc UN « reconstructeur » via un jeton court (`snapshot_regen`) ;
 * pendant qu'il relit le Sheet, les autres reçoivent la copie de SECOURS (les mêmes
 * données, gardées plus longtemps — au pire ~10 s de retard, invisible pour du live).
 */
function snapshotJsonCache() {
  var cache = CacheService.getScriptCache();
  var s = cache.get('snapshot_json');
  if (s) return s;

  // Cache expiré. Quelqu'un reconstruit déjà ? → on sert la copie de secours sans attendre.
  var secours = cache.get('snapshot_json_secours');
  if (secours && cache.get('snapshot_regen')) return secours;

  // On devient LE reconstructeur : jeton posé ~15 s (filet si la reconstruction échoue).
  try { cache.put('snapshot_regen', '1', 15); } catch (e) {}
  s = JSON.stringify(construireSnapshot(SpreadsheetApp.openById(SHEET_ID)));
  mettreEnCacheSnapshot(cache, s);
  try { cache.remove('snapshot_regen'); } catch (e) {}
  return s;
}

/**
 * Met le JSON en cache serveur (copie fraîche ~10 s + copie de secours longue durée,
 * servie pendant les reconstructions), SAUF s'il dépasse la limite de CacheService
 * (100 Ko) : au-delà, put() échouerait et le cache resterait vide (chaque appel relirait
 * le Sheet). Dans ce cas rare (très gros tournoi), mieux vaut compter sur le relais CDN.
 */
function mettreEnCacheSnapshot(cache, json) {
  try {
    // Marge sous 100 Ko (100 000 octets) ; longueur JS ≈ octets pour de l'ASCII/JSON.
    if (json.length < 95000) {
      cache.put('snapshot_json', json, 10);             // copie fraîche (10 s)
      cache.put('snapshot_json_secours', json, 21600);  // copie de secours (6 h, le max)
    }
  } catch (e) { /* cache indisponible : on ignore, getAll relira le Sheet */ }
}

/**
 * Après une écriture réussie : on rafraîchit le cache serveur (les spectateurs voient le
 * changement dès leur prochain appel) ET on pousse vers le relais CDN s'il est configuré.
 * On ne construit le snapshot QU'UNE fois (partagé entre le cache et le relais).
 */
function apresEcriture(classeur) {
  try {
    var json = JSON.stringify(construireSnapshot(classeur));
    mettreEnCacheSnapshot(CacheService.getScriptCache(), json);
    pousserSnapshot(classeur, json); // sans effet si le relais n'est pas configuré
  } catch (err) { /* jamais bloquer l'écriture */ }
}

/* ===================== RELAIS CDN (montée en charge spectateurs) =====================
 * Pour supporter des milliers de spectateurs sans saturer Apps Script, on POUSSE un
 * instantané des données vers un cache "edge" (Cloudflare Worker) à CHAQUE écriture.
 * Les spectateurs lisent ce cache (illimité) au lieu d'interroger Apps Script.
 *
 * Réglage (UNE fois, depuis l'éditeur Apps Script) :
 *   configurerRelais('https://xxxx.workers.dev', 'MA_CLE_SECRETE')
 * Tant que l'URL n'est pas réglée, pousserSnapshot ne fait rien (repli : tout marche
 * comme avant, les spectateurs lisent Apps Script directement).
 * ================================================================================== */

/** À lancer UNE fois dans l'éditeur Apps Script pour mémoriser l'URL et la clé du relais. */
function configurerRelais(url, cle) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('RELAIS_URL', url || '');
  props.setProperty('RELAIS_CLE', cle || '');
  return 'Relais configuré : ' + (url || '(vide)');
}

/**
 * Pousse l'instantané vers le relais CDN. Silencieux et sans jamais bloquer l'écriture.
 * @param {string} [json] instantané déjà sérialisé (évite de reconstruire/relire le Sheet).
 */
function pousserSnapshot(classeur, json) {
  try {
    var props = PropertiesService.getScriptProperties();
    var url = props.getProperty('RELAIS_URL');
    var cle = props.getProperty('RELAIS_CLE') || '';
    if (!url) return; // relais non configuré → repli sur Apps Script, on ne fait rien
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + cle },
      payload: json || JSON.stringify(construireSnapshot(classeur)),
      muteHttpExceptions: true
    });
  } catch (err) {
    // On n'échoue JAMAIS une écriture à cause du relais : on ignore l'erreur.
  }
}

function lireOngletSimple(classeur, nomOnglet) {
  var onglet = classeur.getSheetByName(nomOnglet);
  if (!onglet) return [];
  var donnees = onglet.getDataRange().getValues();
  if (donnees.length < 2) return [];
  var entetes = donnees[0];
  var lignes = [];
  for (var i = 1; i < donnees.length; i++) {
    var ligne = donnees[i];
    if (ligne.every(function (c) { return c === '' || c === null; })) continue;
    var objet = {};
    for (var c = 0; c < entetes.length; c++) {
      if (entetes[c] === '') continue;
      objet[entetes[c]] = ligne[c];
    }
    lignes.push(objet);
  }
  return lignes;
}

/**
 * Position (0-based) de la ligne d'en-tête de la zone catégories dans un tableau de valeurs de
 * l'onglet Config (la ligne dont la 1re cellule vaut « categorie »), ou -1 si absente.
 * Point de passage UNIQUE : cette recherche était recopiée à l'identique dans plusieurs fonctions
 * (lireConfig, enregistrerCategorie, supprimerCategorie, assurerColonneCategorie…).
 */
function indexEnteteCategories(donnees) {
  for (var i = 0; i < donnees.length; i++) {
    if (donnees[i][0] === 'categorie') return i;
  }
  return -1;
}

function lireConfig(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return { global: {}, categories: [] };
  var donnees = onglet.getDataRange().getValues();
  var hdr = indexEnteteCategories(donnees);
  var global = {};
  var finZoneA = (hdr === -1) ? donnees.length : hdr;
  for (var r = 1; r < finZoneA; r++) {
    var param = donnees[r][0];
    if (param === '' || param === null) continue;
    if (String(param).charAt(0) === '—') continue;
    global[param] = donnees[r][1];
  }
  var categories = [];
  if (hdr !== -1) {
    var entetesCat = donnees[hdr];
    for (var l = hdr + 1; l < donnees.length; l++) {
      var ligne = donnees[l];
      if (ligne[0] === '' || ligne[0] === null) continue;
      var cat = {};
      for (var k = 0; k < entetesCat.length; k++) {
        if (entetesCat[k] === '') continue;
        cat[entetesCat[k]] = ligne[k];
      }
      categories.push(cat);
    }
  }
  return { global: global, categories: categories };
}

/* ===================== ÉCRITURE (doPost) ===================== */

/* Actions protégées par la clé SCORES (les autres écritures exigent la clé ADMIN). */
var ACTIONS_SCORES = { enregistrerScore: true };

function doPost(e) {
  var lock;
  try {
    var requete = JSON.parse(e.postData.contents);
    var action = requete.action;

    // Contrôle d'accès : chaque écriture exige la bonne clé (scores selon l'action, sinon admin).
    // Les lectures (doGet) restent ouvertes à tous.
    var nomCle = ACTIONS_SCORES[action] ? 'CLE_SCORES' : 'CLE_ADMIN';
    var acces = verifierCle(requete, nomCle);
    if (!acces.ok) return repondreJson({ error: acces.msg, acces_refuse: true });

    // Verrou d'écriture : sérialise les écritures concurrentes (deux marqueurs qui valident
    // au même instant) pour éviter les collisions d'identifiant et l'écrasement de lignes
    // dans l'onglet Historique. Attente max 20 s ; au-delà, on demande de réessayer plutôt
    // que de risquer une écriture corrompue. Le verrou est relâché dans le finally.
    lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) {
      return repondreJson({ error: 'Serveur momentanément occupé, réessaie dans un instant.' });
    }

    var classeur = SpreadsheetApp.openById(SHEET_ID);
    var resultat;
    switch (action) {
      case 'ajouterEquipe':        resultat = ajouterEquipe(classeur, requete.nom_equipe, requete.categorie); break;
      case 'modifierEquipe':       resultat = modifierEquipe(classeur, requete.id_equipe, requete.nom_equipe); break;
      case 'supprimerEquipe':      resultat = supprimerEquipe(classeur, requete.id_equipe); break;
      case 'supprimerEquipesCategorie': resultat = supprimerEquipesCategorie(classeur, requete.categorie); break;
      case 'enregistrerHoraires':  resultat = enregistrerHoraires(classeur, requete); break;
      case 'enregistrerCategorie': resultat = enregistrerCategorie(classeur, requete); break;
      case 'supprimerCategorie':   resultat = supprimerCategorie(classeur, requete.categorie); break;
      case 'enregistrerScore':     resultat = enregistrerScore(classeur, requete); break;
      case 'genererPoulesEtPlanning': resultat = genererPoulesEtPlanning(classeur); break;
      case 'reorganiserPoulesMatin':  resultat = reorganiserPoulesMatin(classeur, requete); break;
      case 'recalculerHoraires':      resultat = recalculerHoraires(classeur); break;
      case 'genererApresMidi':     resultat = genererApresMidi(classeur); break;
      case 'publierTournoi':       resultat = publierTournoi(classeur, requete.publie); break;
      case 'enregistrerInfosTournoi': resultat = enregistrerInfosTournoi(classeur, requete); break;
      case 'enregistrerContactsSecurite': resultat = enregistrerContactsSecurite(classeur, requete); break;
      case 'enregistrerPlanTerrains': resultat = enregistrerPlanTerrains(classeur, requete); break;
      case 'enregistrerAffiche':   resultat = enregistrerAffiche(classeur, requete); break;
      case 'supprimerAffiche':     resultat = supprimerAffiche(classeur); break;
      case 'enregistrerInvitation': resultat = enregistrerInvitation(classeur, requete); break;
      case 'enregistrerPhotoParking': resultat = enregistrerPhotoParking(classeur, requete); break;
      case 'supprimerPhotoParking':   resultat = supprimerPhotoParking(classeur); break;
      case 'listerClubsInvites':   resultat = listerClubsInvites(classeur); break;
      case 'ajouterClubInvite':    resultat = ajouterClubInvite(classeur, requete); break;
      case 'modifierStatutClubInvite': resultat = modifierStatutClubInvite(classeur, requete); break;
      case 'supprimerClubInvite':  resultat = supprimerClubInvite(classeur, requete); break;
      case 'reinitialiserTournoi': resultat = reinitialiserTournoi(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    // Écriture réussie → cache serveur rafraîchi (+ relais CDN si configuré). Sans effet
    // secondaire bloquant : n'échoue jamais l'action même si le rafraîchissement rate.
    // listerClubsInvites est une LECTURE (protégée par la clé admin, car l'onglet contient
    // des emails) : rien n'a changé, inutile de reconstruire le cache public.
    if (resultat && !resultat.error && action !== 'listerClubsInvites') apresEcriture(classeur);
    return repondreJson(resultat);
  } catch (erreur) {
    // Détail journalisé côté serveur, message générique côté client (anti-fuite d'infos).
    // Les erreurs « métier » (validation) sont renvoyées normalement via resultat.error ;
    // ce catch ne concerne que les exceptions inattendues.
    Logger.log('doPost erreur : ' + erreur);
    return repondreJson({ error: 'Erreur serveur pendant l\'écriture.' });
  } finally {
    if (lock) lock.releaseLock(); // toujours relâcher le verrou (sans erreur s'il n'était pas pris)
  }
}

/* ===================== SÉCURITÉ (clés d'écriture) ===================== */

/**
 * Ajoute un menu « Tournoi R92 » dans le Sheet à l'ouverture, pour lancer configurerCles
 * depuis le bon contexte (les popups ne marchent PAS depuis le bouton ▶ de l'éditeur).
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Tournoi R92')
    .addItem('Configurer les clés (admin / scores)', 'configurerCles')
    .addToUi();
}

/**
 * Définit les 2 clés (popups). À lancer depuis le menu « Tournoi R92 » du Sheet
 * (PAS depuis le bouton ▶ de l'éditeur, où les popups ne s'affichent pas).
 * Alternative sans code : Paramètres du projet → Propriétés du script → CLE_ADMIN / CLE_SCORES.
 * Les clés sont rangées dans les Propriétés du script (jamais dans le code / GitHub).
 */
/** Longueur MINIMALE exigée pour une clé (garde-fou anti-clé-faible / anti-force-brute). */
var LONGUEUR_CLE_MIN = 12;

function configurerCles() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var r1 = ui.prompt('Clé ADMIN',
    'Clé pour la page admin (génération, équipes, réglages) — au moins ' + LONGUEUR_CLE_MIN + ' caractères :',
    ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  var cleAdmin = String(r1.getResponseText()).trim();
  if (cleAdmin.length < LONGUEUR_CLE_MIN) {
    ui.alert('Clé trop courte', 'La clé ADMIN doit faire au moins ' + LONGUEUR_CLE_MIN +
      ' caractères (idéalement générée par un gestionnaire de mots de passe). Recommence.', ui.ButtonSet.OK);
    return;
  }
  var r2 = ui.prompt('Clé SCORES',
    'Clé pour la page de saisie des scores — au moins ' + LONGUEUR_CLE_MIN + ' caractères :',
    ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  var cleScores = String(r2.getResponseText()).trim();
  if (cleScores.length < LONGUEUR_CLE_MIN) {
    ui.alert('Clé trop courte', 'La clé SCORES doit faire au moins ' + LONGUEUR_CLE_MIN + ' caractères. Recommence.',
      ui.ButtonSet.OK);
    return;
  }
  props.setProperty('CLE_ADMIN', cleAdmin);
  props.setProperty('CLE_SCORES', cleScores);
  ui.alert('✅ Clés enregistrées',
    'Les clés ADMIN et SCORES sont définies dans les propriétés du script.', ui.ButtonSet.OK);
}

/** Lit une clé configurée côté serveur. */
function lireCle(nom) {
  return PropertiesService.getScriptProperties().getProperty(nom) || '';
}

/* ---------- Anti-force-brute (throttling des tentatives de clé) ----------
 * Les écritures ne sont protégées QUE par une clé partagée, et l'API est joignable par
 * n'importe qui (CORS ouvert, nécessaire pour la lecture publique). Sans garde-fou, un
 * attaquant pourrait tester des millions de clés. On compte donc les ÉCHECS récents dans
 * un cache serveur : au-delà d'un seuil, on refuse les nouvelles tentatives à MAUVAISE clé
 * pendant la fenêtre. Une BONNE clé passe TOUJOURS (et remet le compteur à zéro) : les
 * marqueurs et l'organisation ne sont donc jamais bloqués — seules les tentatives ratées
 * le sont. Compteur best-effort (CacheService non transactionnel), suffisant pour plafonner
 * fortement le débit de devinette ; la vraie protection reste une clé longue et aléatoire. */
var MAX_ECHECS_CLE = 30;         // tentatives ratées tolérées avant blocage temporaire
var FENETRE_ECHECS_CLE_S = 300;  // fenêtre (s) — repoussée à chaque nouvel échec (≈ 5 min de calme requis)

/** Nombre d'échecs de clé récents (0 si cache indisponible). */
function nbEchecsCleRecents() {
  try {
    var v = CacheService.getScriptCache().get('auth_echecs');
    return v ? (parseInt(v, 10) || 0) : 0;
  } catch (e) { return 0; }
}

/** Incrémente le compteur d'échecs de clé (prolonge la fenêtre). */
function incrementerEchecsCle() {
  try {
    CacheService.getScriptCache().put('auth_echecs', String(nbEchecsCleRecents() + 1), FENETRE_ECHECS_CLE_S);
  } catch (e) { /* cache indisponible : on n'échoue pas la requête pour autant */ }
}

/** Remet le compteur d'échecs à zéro (appelé après une clé valide). */
function reinitEchecsCle() {
  try { CacheService.getScriptCache().remove('auth_echecs'); } catch (e) {}
}

/** Vérifie que la requête porte la bonne clé, avec anti-force-brute. Renvoie { ok, msg }. */
function verifierCle(requete, nomCle) {
  var attendue = lireCle(nomCle);
  if (!attendue) return { ok: false, msg: 'Clé non configurée sur le serveur — lance configurerCles() dans l\'éditeur.' };

  // Bonne clé : accès accordé, compteur d'échecs remis à zéro (jamais de blocage des légitimes).
  if (String(requete.cle || '') === attendue) { reinitEchecsCle(); return { ok: true }; }

  // Mauvaise clé : au-delà du seuil d'échecs récents, on refuse tout net (throttle) sans révéler
  // le type de clé. Le mot « incorrecte » est conservé pour que le frontend redemande la clé.
  if (nbEchecsCleRecents() >= MAX_ECHECS_CLE) {
    return { ok: false, msg: 'Trop de tentatives incorrectes. Réessaie dans quelques minutes.', throttled: true };
  }
  incrementerEchecsCle();
  return { ok: false, msg: 'Clé incorrecte.' };
}

/** Statut « terminé » robuste au « é » décomposé (NFD) renvoyé par le Sheet. */
function estTermineServeur(statut) {
  return /^\s*termin/i.test(String(statut));
}

function ajouterEquipe(classeur, nom, categorie) {
  nom = (nom || '').toString().trim();
  categorie = (categorie || '').toString().trim();
  if (!nom)       return { error: "Le nom de l'équipe est vide." };
  if (!categorie) return { error: 'La catégorie est vide.' };
  var onglet = classeur.getSheetByName('Equipes');
  var id = genererIdEquipe(onglet);
  // On écrit en forçant le format TEXTE (@) de la ligne : un nom commençant par
  // « = + - @ » n'est PAS interprété comme une formule Google Sheets (anti-injection de
  // formule). getLastRow()+1 vise la même ligne que appendRow, mais permet de fixer le
  // format AVANT d'écrire la valeur.
  var ligne = onglet.getLastRow() + 1;
  var plage = onglet.getRange(ligne, 1, 1, 4);
  plage.setNumberFormat('@');
  plage.setValues([[id, nom, categorie, '']]);
  return { ok: true, equipe: { id_equipe: id, nom_equipe: nom, categorie: categorie, poule: '' } };
}

function supprimerEquipe(classeur, id) {
  var onglet = classeur.getSheetByName('Equipes');
  var dernier = onglet.getLastRow();
  if (dernier < 2) return { error: 'Aucune équipe à supprimer.' };
  var ids = onglet.getRange(2, 1, dernier - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) { onglet.deleteRow(i + 2); return { ok: true }; }
  }
  return { error: 'Équipe introuvable : ' + id };
}

/** Renomme une équipe existante (colonne nom_equipe = 2e colonne). */
function modifierEquipe(classeur, id, nouveauNom) {
  nouveauNom = (nouveauNom || '').toString().trim();
  if (!id)         return { error: "Identifiant d'équipe manquant." };
  if (!nouveauNom) return { error: "Le nom de l'équipe est vide." };
  var onglet = classeur.getSheetByName('Equipes');
  var dernier = onglet.getLastRow();
  if (dernier < 2) return { error: 'Aucune équipe à modifier.' };
  var ids = onglet.getRange(2, 1, dernier - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      // Format TEXTE (@) forcé AVANT d'écrire : un nom commençant par « = + - @ » n'est pas
      // interprété comme une formule Google Sheets (anti-injection de formule, comme ajouterEquipe).
      var cellule = onglet.getRange(i + 2, 2); // colonne 2 = nom_equipe
      cellule.setNumberFormat('@');
      cellule.setValue(nouveauNom);
      return { ok: true, equipe: { id_equipe: id, nom_equipe: nouveauNom } };
    }
  }
  return { error: 'Équipe introuvable : ' + id };
}

/** Supprime toutes les équipes d'une catégorie en une seule opération. */
function supprimerEquipesCategorie(classeur, categorie) {
  categorie = (categorie || '').toString().trim();
  if (!categorie) return { error: 'La catégorie est vide.' };
  var onglet = classeur.getSheetByName('Equipes');
  var dernier = onglet.getLastRow();
  if (dernier < 2) return { error: 'Aucune équipe à supprimer.' };
  // Colonne 3 = catégorie. On supprime du bas vers le haut pour ne pas décaler les indices.
  var cats = onglet.getRange(2, 3, dernier - 1, 1).getValues();
  var nbSupprimees = 0;
  for (var i = cats.length - 1; i >= 0; i--) {
    if (String(cats[i][0]).trim() === categorie) {
      onglet.deleteRow(i + 2);
      nbSupprimees++;
    }
  }
  if (nbSupprimees === 0) return { error: 'Aucune équipe dans la catégorie « ' + categorie + ' ».' };
  return { ok: true, nb_supprimees: nbSupprimees };
}

function genererIdEquipe(onglet) {
  var dernier = onglet.getLastRow();
  if (dernier < 2) return 'E01';
  var valeurs = onglet.getRange(2, 1, dernier - 1, 1).getValues();
  var max = 0;
  valeurs.forEach(function (ligne) {
    var m = String(ligne[0]).match(/^E(\d+)$/);
    if (m) { var n = parseInt(m[1], 10); if (n > max) max = n; }
  });
  var suivant = max + 1;
  return 'E' + (suivant < 10 ? '0' + suivant : suivant);
}

/* ===================== ÉCRITURE DES RÉGLAGES (Config) ===================== */

/** Vide accepté (champ optionnel), sinon HH:MM strict. Renvoie un message d'erreur, ou null si OK. */
function validerHeureOptionnelle(valeur, libelle) {
  if (valeur == null || String(valeur).trim() === '') return null;
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(String(valeur).trim())) return null;
  return libelle + ' invalide : format HH:MM attendu (ex : 08:15).';
}

/**
 * Normalise un numéro de téléphone : espaces, points et tirets retirés.
 * Renvoie les 10 chiffres, ou '' si le résultat n'est pas un numéro à 10 chiffres.
 */
function normaliserTelephone(valeur) {
  var chiffres = String(valeur || '').replace(/[\s.\-]/g, '');
  return /^\d{10}$/.test(chiffres) ? chiffres : '';
}

function enregistrerHoraires(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  // Heures « dossier club » optionnelles : vides acceptées, sinon HH:MM strict.
  var err = validerHeureOptionnelle(data.heure_rdv, 'Heure de RDV')
         || validerHeureOptionnelle(data.heure_fin_communiquee, 'Heure de fin communiquée');
  if (err) return { error: err };
  var champs = ['heure_debut', 'heure_fin', 'heure_fin_auto',
                'battement_terrain_min', 'pause_dejeuner_debut', 'pause_dejeuner_duree_min',
                'heure_rdv', 'heure_fin_communiquee', 'marge_fin_communiquee_min'];
  champs.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/**
 * Enregistre les INFOS du tournoi affichées côté public (carte d'actualité + page d'article) :
 * nom, date, lieu, adresse, description. Stockées comme paramètres globaux de l'onglet Config.
 */
function enregistrerInfosTournoi(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var champs = ['tournoi_nom', 'tournoi_date', 'tournoi_lieu', 'tournoi_adresse', 'tournoi_description'];
  champs.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/* Paramètres globaux « Contacts & sécurité » (dossier club). Tous optionnels. */
var CHAMPS_CONTACTS_SECURITE = ['referent_nom', 'referent_tel',
  'securite_secours_oui', 'securite_secours_precisions',
  'securite_referent_identique', 'securite_referent_nom', 'securite_referent_tel'];

/**
 * Enregistre les CONTACTS & SÉCURITÉ du tournoi (référent, poste de secours, référent
 * sécurité), paramètres globaux de l'onglet Config destinés au futur dossier club.
 *  - referent_tel / securite_referent_tel : 10 chiffres, normalisés (espaces/points/tirets retirés) ;
 *  - securite_secours_oui : 'oui'/'non' — les précisions ne valent que si 'oui' ;
 *  - securite_referent_identique : 'oui' (défaut) = même personne que le référent tournoi ;
 *    'non' = securite_referent_nom / securite_referent_tel désignent une personne distincte.
 */
function enregistrerContactsSecurite(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var tels = [['referent_tel', 'référent tournoi'], ['securite_referent_tel', 'référent sécurité']];
  for (var i = 0; i < tels.length; i++) {
    var cle = tels[i][0];
    if (data[cle] != null && String(data[cle]).trim() !== '') {
      var norme = normaliserTelephone(data[cle]);
      if (!norme) {
        return { error: 'Téléphone du ' + tels[i][1] + ' invalide : 10 chiffres attendus '
                 + '(espaces, points ou tirets acceptés).' };
      }
      data[cle] = norme;
    }
  }
  // Booléens rangés comme partout dans Config : 'oui' / 'non'.
  if (data.securite_secours_oui != null) {
    data.securite_secours_oui = String(data.securite_secours_oui).toLowerCase() === 'oui' ? 'oui' : 'non';
  }
  if (data.securite_referent_identique != null) {
    data.securite_referent_identique =
      String(data.securite_referent_identique).toLowerCase() === 'non' ? 'non' : 'oui';
  }
  CHAMPS_CONTACTS_SECURITE.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/**
 * Enregistre le PLAN DES TERRAINS physiques utilisé par la répartition automatique.
 * Trois paramètres GLOBAUX (stockés dans l'onglet Config, relus par getConfig/getAll) :
 *   - terrains_physiques    : JSON [{nom,type,L,W}, …] — les grands terrains réels (rugby/foot).
 *   - couloir_terrain_m     : largeur du couloir de circulation entre mini-terrains (m).
 *   - dimensions_categories : JSON {"U8":{"l":30,"w":20}, "U14":{"plein":true}, …} — taille
 *                             de terrain par catégorie (plein:true = un match occupe un grand terrain entier).
 *   - tm_longueur_m / tm_largeur_m : taille de la table des marques (m), petite zone placée dans le couloir.
 *   - repartition_grands_terrains : JSON {"Rugby 1":["1","2","3"], …} — composition de chaque
 *                             GRAND terrain (numéros de mini-terrains), écrite quand la répartition
 *                             est appliquée ; la page Saisie s'en sert pour filtrer par grand terrain.
 */
function enregistrerPlanTerrains(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var champs = ['terrains_physiques', 'couloir_terrain_m', 'dimensions_categories',
                'tm_longueur_m', 'tm_largeur_m', 'repartition_grands_terrains'];
  champs.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/**
 * IMAGES DE CONFIG (affiche du tournoi, photo du parking…). Mécanisme COMMUN :
 * l'image arrive en Data URI (base64), est stockée dans Google Drive (fichier public
 * en lecture), et son identifiant est mémorisé comme paramètre global de Config.
 * L'image précédente du même paramètre est mise à la corbeille.
 * ⚠️ Nécessite l'autorisation d'accès à Google Drive (à accorder une fois au redéploiement).
 */
/** Types d'image acceptés (liste blanche stricte). */
var TYPES_AFFICHE_OK = { 'image/png': true, 'image/jpeg': true, 'image/webp': true, 'image/gif': true };
/** Taille maximale d'une image décodée (5 Mo) — garde-fou anti-saturation du Drive. */
var AFFICHE_MAX_OCTETS = 5 * 1024 * 1024;

/**
 * Enregistre une image dans Drive et son id dans Config.
 * @param {string} uri        chaîne "data:image/...;base64,...."
 * @param {string} champCle   paramètre global qui reçoit l'id (ex 'tournoi_affiche_id')
 * @param {string} nomFichier nom du fichier créé dans Drive
 */
function enregistrerImageConfig(classeur, uri, champCle, nomFichier) {
  var m = String(uri || '').match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return { error: 'Image invalide (Data URI base64 attendu).' };

  // Sécurité : n'accepter que de VRAIES images (le fichier Drive sera public en lecture),
  // et borner la taille pour éviter qu'un envoi massif ne sature le Drive / le quota.
  var type = String(m[1]).toLowerCase();
  if (!TYPES_AFFICHE_OK[type]) {
    return { error: 'Format d\'image non autorisé (PNG, JPEG, WebP ou GIF uniquement).' };
  }
  var base64 = m[2] || '';
  // La taille décodée vaut ≈ 3/4 de la longueur base64 : filtre rapide avant de décoder.
  if (base64.length * 0.75 > AFFICHE_MAX_OCTETS) {
    return { error: 'Image trop lourde (5 Mo maximum). Réduis l\'image avant de l\'envoyer.' };
  }

  var octets = Utilities.base64Decode(base64);
  if (octets.length > AFFICHE_MAX_OCTETS) {
    return { error: 'Image trop lourde (5 Mo maximum). Réduis l\'image avant de l\'envoyer.' };
  }
  var blob = Utilities.newBlob(octets, type, nomFichier);

  var onglet = classeur.getSheetByName('Config');
  var ancienId = (lireConfig(classeur).global || {})[champCle];
  if (ancienId) { try { DriveApp.getFileById(ancienId).setTrashed(true); } catch (e) {} }

  var fichier = DriveApp.createFile(blob);
  try { fichier.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  ecrireParamGlobal(onglet, champCle, fichier.getId());
  return { ok: true, id: fichier.getId() };
}

/**
 * Retire une image de Config : met le fichier Drive à la corbeille et efface le
 * paramètre. Sans effet (mais sans erreur) s'il n'y a pas d'image.
 */
function supprimerImageConfig(classeur, champCle) {
  var onglet = classeur.getSheetByName('Config');
  var id = (lireConfig(classeur).global || {})[champCle];
  if (id) { try { DriveApp.getFileById(id).setTrashed(true); } catch (e) {} }
  effacerParamGlobal(onglet, champCle);
  return { ok: true };
}

/** Affiche du tournoi (carte + page d'article + dossier). @param data.affiche Data URI */
function enregistrerAffiche(classeur, data) {
  return enregistrerImageConfig(classeur, data.affiche, 'tournoi_affiche_id', 'affiche-tournoi');
}
function supprimerAffiche(classeur) {
  return supprimerImageConfig(classeur, 'tournoi_affiche_id');
}

/** Photo du parking (section « Parking & accès » du dossier). @param data.photo Data URI */
function enregistrerPhotoParking(classeur, data) {
  return enregistrerImageConfig(classeur, data.photo, 'parking_photo_id', 'parking-tournoi');
}
function supprimerPhotoParking(classeur) {
  return supprimerImageConfig(classeur, 'parking_photo_id');
}

/* ===================== DOSSIER D'INVITATION (modalités, parking, encadrement) ===================== */

/* Paramètres globaux du dossier d'INVITATION (Sprint 3). Tous optionnels — chaque carte
   admin (Modalités d'inscription / Parking & accès / Encadrement & assurance) n'envoie
   que SES champs : seuls les champs présents dans la requête sont écrits. */
var CHAMPS_INVITATION = ['date_limite_confirmation',
  'tarif_engagement_oui', 'tarif_engagement_montant', 'tarif_engagement_modalites',
  'parking_texte', 'encadrement_ratio', 'encadrement_diplomes', 'assurance_attestation_requise'];

/**
 * Enregistre les champs du dossier d'invitation (paramètres globaux de Config).
 *  - tarif_engagement_oui / assurance_attestation_requise : booléens rangés en 'oui'/'non'
 *    (défaut 'non' : seul 'oui' active) ;
 *  - date_limite_confirmation : date AAAA-MM-JJ (champ <input type="date">) ou vide ;
 *  - le reste : texte libre.
 */
function enregistrerInvitation(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var d = String(data.date_limite_confirmation == null ? '' : data.date_limite_confirmation).trim();
  if (d !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return { error: 'Date limite de confirmation invalide : format AAAA-MM-JJ attendu.' };
  }
  ['tarif_engagement_oui', 'assurance_attestation_requise'].forEach(function (champ) {
    if (data[champ] != null) {
      data[champ] = String(data[champ]).toLowerCase() === 'oui' ? 'oui' : 'non';
    }
  });
  CHAMPS_INVITATION.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/* ===================== CLUBS INVITÉS ===================== */

/* Statuts admis d'un club invité (formes canoniques, avec accents). */
var STATUTS_CLUB_INVITE = ['Invité', 'Confirmé', 'Décliné'];

/** Comparaison de textes SANS accents ni casse (piège NFC/NFD du Sheet : « Invité »
 *  peut revenir avec un é décomposé — même précaution que estTermine). */
function memeTexteSouple(a, b) {
  function plat(s) {
    return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  }
  return plat(a) === plat(b);
}

/** Statut canonique ('Invité'/'Confirmé'/'Décliné') depuis une saisie, ou '' si inconnu. */
function statutClubCanonique(valeur) {
  for (var i = 0; i < STATUTS_CLUB_INVITE.length; i++) {
    if (memeTexteSouple(valeur, STATUTS_CLUB_INVITE[i])) return STATUTS_CLUB_INVITE[i];
  }
  return '';
}

/** Crée l'onglet ClubsInvites s'il manque (migration douce d'un Sheet déjà en service). */
function assurerOngletClubsInvites(classeur) {
  var onglet = classeur.getSheetByName('ClubsInvites');
  if (!onglet) creerOngletAvecEntetes(classeur, 'ClubsInvites', ENTETES.ClubsInvites);
  return classeur.getSheetByName('ClubsInvites');
}

/**
 * LISTE des clubs invités. Passe par doPost + clé ADMIN (et non doGet, ouvert à tous) :
 * l'onglet contient des emails de contact, qui ne doivent JAMAIS apparaître dans le
 * snapshot public (getAll) ni sur le relais CDN.
 */
function listerClubsInvites(classeur) {
  assurerOngletClubsInvites(classeur);
  return { ok: true, clubs: lireOngletSimple(classeur, 'ClubsInvites') };
}

/**
 * Ajoute un club invité. Nom requis (clé d'identification : doublons refusés, comparaison
 * souple sans accents ni casse), email vérifié s'il est fourni, statut par défaut « Invité »,
 * date d'ajout posée automatiquement (AAAA-MM-JJ).
 */
function ajouterClubInvite(classeur, data) {
  var nom = String(data.club_nom || '').trim();
  if (!nom) return { error: 'Nom du club vide.' };
  var contactNom = String(data.club_contact_nom || '').trim();
  var email = String(data.club_contact_email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email du contact invalide : « ' + email + ' ».' };
  }
  var statut = statutClubCanonique(data.statut) || 'Invité';

  var onglet = assurerOngletClubsInvites(classeur);
  var existants = lireOngletSimple(classeur, 'ClubsInvites');
  for (var i = 0; i < existants.length; i++) {
    if (memeTexteSouple(existants[i].club_nom, nom)) {
      return { error: 'Le club « ' + existants[i].club_nom + ' » est déjà dans la liste.' };
    }
  }

  var dateAjout = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var ligne = onglet.getLastRow() + 1;
  var plage = onglet.getRange(ligne, 1, 1, ENTETES.ClubsInvites.length);
  plage.setNumberFormat('@');
  plage.setValues([[nom, contactNom, email, statut, dateAjout]]);
  return { ok: true };
}

/** Ligne (1-based) d'un club dans l'onglet, ou -1. Clé = club_nom (comparaison souple). */
function ligneClubInvite(onglet, nom) {
  var donnees = onglet.getDataRange().getValues();
  for (var i = 1; i < donnees.length; i++) {
    if (memeTexteSouple(donnees[i][0], nom)) return i + 1;
  }
  return -1;
}

/** Change le STATUT d'un club invité (menu déroulant de la liste admin). */
function modifierStatutClubInvite(classeur, data) {
  var statut = statutClubCanonique(data.statut);
  if (!statut) return { error: 'Statut inconnu (attendu : Invité, Confirmé ou Décliné).' };
  var onglet = assurerOngletClubsInvites(classeur);
  var ligne = ligneClubInvite(onglet, data.club_nom);
  if (ligne === -1) return { error: 'Club introuvable : ' + String(data.club_nom || '') };
  var cellule = onglet.getRange(ligne, 4); // colonne `statut`
  cellule.setNumberFormat('@');
  cellule.setValue(statut);
  return { ok: true };
}

/** Retire un club de la liste des invités. */
function supprimerClubInvite(classeur, data) {
  var onglet = assurerOngletClubsInvites(classeur);
  var ligne = ligneClubInvite(onglet, data.club_nom);
  if (ligne === -1) return { error: 'Club introuvable : ' + String(data.club_nom || '') };
  onglet.deleteRow(ligne);
  return { ok: true };
}

/**
 * À LANCER UNE FOIS depuis l'éditeur Apps Script (menu « Exécuter ») après avoir collé
 * cette version : déclenche la demande d'AUTORISATION d'accès à Google Drive, nécessaire
 * pour enregistrer l'affiche du tournoi. Ne modifie rien.
 */
function autoriserDrive() {
  var nom = DriveApp.getRootFolder().getName();
  Logger.log('Accès Google Drive OK — dossier racine : ' + nom);
}

/**
 * Écrit un paramètre GLOBAL (clé/valeur) dans la zone A de l'onglet Config. L'onglet Config
 * contient deux zones : en haut les paramètres globaux (une ligne = nom/valeur), puis un
 * séparateur (ligne « — … ») et le tableau des catégories (dont l'entête « categorie »).
 * On veut garder les paramètres globaux GROUPÉS AU-DESSUS de ce séparateur :
 *   1) si le paramètre existe déjà → on met à jour sa valeur ;
 *   2) sinon → on l'insère juste avant la 1re ligne vide / le séparateur / l'entête catégories
 *      (pour ne pas l'écrire au milieu du tableau des catégories) ;
 *   3) à défaut → à la fin. Le format est forcé en texte (@) pour éviter toute interprétation.
 */
function ecrireParamGlobal(onglet, nom, valeur) {
  var dernier = onglet.getLastRow();
  var donnees = onglet.getRange(1, 1, dernier, 2).getValues();
  for (var i = 0; i < donnees.length; i++) {
    if (donnees[i][0] === nom) { // 1) paramètre déjà présent → mise à jour
      var cellule = onglet.getRange(i + 1, 2);
      cellule.setNumberFormat('@');
      cellule.setValue(String(valeur));
      return;
    }
  }
  var insertion = -1; // 2) point d'insertion = début de zone catégories / 1re ligne vide
  for (var r = 1; r < donnees.length; r++) {
    var a = donnees[r][0];
    if (a === '' || a === null || String(a).charAt(0) === '—' || a === 'categorie') {
      insertion = r + 1;
      break;
    }
  }
  if (insertion === -1) insertion = dernier + 1; // 3) sinon à la fin
  onglet.insertRowsBefore(insertion, 1);
  var plage = onglet.getRange(insertion, 1, 1, 2);
  plage.setNumberFormat('@');
  plage.setValues([[nom, String(valeur)]]);
}

/**
 * Écrit PLUSIEURS paramètres globaux en une passe (moins d'allers-retours avec le Sheet que N
 * appels séparés à ecrireParamGlobal, appelé en rafale à la génération / au recalcul).
 * @param {Sheet} onglet  l'onglet Config
 * @param {Array<Array>} paires  liste ORDONNÉE de [nom, valeur]
 *
 * Résultat STRICTEMENT identique à des ecrireParamGlobal successifs :
 *   1) les paramètres DÉJÀ présents sont mis à jour SUR PLACE (aucun décalage de lignes) — on ne
 *      relit l'onglet qu'UNE fois pour tous ;
 *   2) les paramètres encore ABSENTS (ex. 1re génération) sont insérés via ecrireParamGlobal, la
 *      fonction éprouvée qui les place au bon endroit (au-dessus de la zone catégories), dans
 *      l'ordre fourni. Faire les mises à jour sur place AVANT les insertions garantit que les
 *      lignes mémorisées restent valides (une insertion peut décaler les lignes en-dessous).
 */
function ecrireParamsGlobaux(onglet, paires) {
  var dernier = onglet.getLastRow();
  var donnees = onglet.getRange(1, 1, dernier, 1).getValues();
  var ligneDe = {};
  for (var i = 0; i < donnees.length; i++) {
    var nom = donnees[i][0];
    // PREMIÈRE occurrence gagnante, comme ecrireParamGlobal : sur un Sheet abîmé où un nom
    // apparaîtrait deux fois en colonne A, on met à jour la même ligne que l'ancien code.
    if (nom !== '' && nom != null && ligneDe[nom] === undefined) ligneDe[nom] = i + 1;
  }
  var absents = [];
  paires.forEach(function (p) {
    var ligne = ligneDe[p[0]];
    if (ligne) {
      var cellule = onglet.getRange(ligne, 2);
      cellule.setNumberFormat('@');
      cellule.setValue(String(p[1]));
    } else {
      absents.push(p);
    }
  });
  absents.forEach(function (p) { ecrireParamGlobal(onglet, p[0], p[1]); });
}

function enregistrerCategorie(classeur, data) {
  var nom = (data.categorie || '').toString().trim();
  if (!nom) return { error: 'Nom de catégorie vide.' };
  // Effectifs par équipe (dossier club) : optionnels, mais si les deux sont saisis, min ≤ max.
  var effMin = parseInt(data.effectif_min, 10);
  var effMax = parseInt(data.effectif_max, 10);
  if (isFinite(effMin) && isFinite(effMax) && effMin > effMax) {
    return { error: 'Effectif min (' + effMin + ') supérieur à l\'effectif max (' + effMax + ').' };
  }
  var onglet = classeur.getSheetByName('Config');
  // Migration douce : garantit la colonne nb_poules (Sheet créé avant cette évolution)
  // + les colonnes de format d'après-midi, pour qu'elles existent DÈS le paramétrage
  // (choix du format possible avant même de générer l'après-midi).
  assurerColonneCategorie(classeur, 'nb_poules');
  assurerColonnesConfig(classeur);
  var donnees = onglet.getDataRange().getValues();
  var hdr = indexEnteteCategories(donnees);
  if (hdr === -1) return { error: 'Zone catégories introuvable.' };
  var colonnes = donnees[hdr];
  var ligneValeurs = colonnes.map(function (c) { return (c && data[c] != null) ? String(data[c]) : ''; });
  var cible = -1, derniereLigneData = hdr;
  for (var l = hdr + 1; l < donnees.length; l++) {
    if (donnees[l][0] === '' || donnees[l][0] === null) break;
    derniereLigneData = l;
    if (String(donnees[l][0]) === nom) cible = l;
  }
  var ligneEcriture = (cible !== -1) ? (cible + 1) : (derniereLigneData + 2);
  var plage = onglet.getRange(ligneEcriture, 1, 1, colonnes.length);
  plage.setNumberFormat('@');
  plage.setValues([ligneValeurs]);
  return { ok: true, nouvelle: (cible === -1) };
}

function supprimerCategorie(classeur, nom) {
  nom = (nom || '').toString().trim();
  var onglet = classeur.getSheetByName('Config');
  var donnees = onglet.getDataRange().getValues();
  var hdr = indexEnteteCategories(donnees);
  if (hdr === -1) return { error: 'Zone catégories introuvable.' };
  for (var l = hdr + 1; l < donnees.length; l++) {
    if (donnees[l][0] === '' || donnees[l][0] === null) break;
    if (String(donnees[l][0]) === nom) { onglet.deleteRow(l + 1); return { ok: true }; }
  }
  return { error: 'Catégorie introuvable : ' + nom };
}

/* ===================== SAISIE DES SCORES ===================== */
/**
 * Enregistre le score d'un match et le passe en "terminé".
 * Attend { id_match, score_A, score_B } et, pour les matchs de Coupe : éventuellement
 * { vainqueur } (départage en cas d'égalité) et { forcerCascade } (correction en cascade).
 * Les scores doivent être des entiers >= 0.
 *
 * En COUPE_PLATEAU (sous_tableau = COUPE) :
 *  - un match dont une équipe n'est pas encore connue est REFUSÉ (« en attente ») ;
 *  - une ÉGALITÉ exige un vainqueur désigné (élimination directe : pas de match nul) ;
 *  - après enregistrement, le vainqueur est PROPAGÉ immédiatement dans le match suivant ;
 *  - corriger un score déjà propagé vers un match lui-même joué est bloqué sauf forcerCascade.
 */
function enregistrerScore(classeur, data) {
  var id = (data.id_match || '').toString().trim();
  if (!id) return { error: 'Identifiant de match manquant.' };

  var sa = validerScore(data.score_A);
  var sb = validerScore(data.score_B);
  if (sa === null) return { error: 'Score A invalide (entier ≥ 0 attendu).' };
  if (sb === null) return { error: 'Score B invalide (entier ≥ 0 attendu).' };

  var onglet = classeur.getSheetByName('Matchs');
  assurerColonnesMatchs(onglet); // sécurité : colonnes bracket présentes même sans régénération
  var info = lireMatchParId(onglet, id);
  if (!info) return { error: 'Match introuvable : ' + id };
  var ligne = info.ligne, m = info.obj;
  var estCoupe = String(m.sous_tableau).toUpperCase() === 'COUPE';
  var dejaTermine = estTermineServeur(m.statut);

  // 1) Match de Coupe « en attente » (les deux équipes ne sont pas encore connues) → non saisissable.
  if (estCoupe && (!estEquipeConnue(m.equipe_A) || !estEquipeConnue(m.equipe_B))) {
    return { error: 'Ce match de Coupe est en attente : les deux équipes ne sont pas encore connues '
             + '(résultats précédents manquants).', en_attente: true };
  }

  // 2) Score déjà validé (définitif) → refus sauf correction explicite.
  if (dejaTermine && data.modification !== true) {
    return { error: 'Ce score est déjà validé (définitif). Utilise « Corriger » pour le modifier.',
             deja_valide: true };
  }

  // 3) Départage obligatoire en Coupe : un vainqueur est requis (pas de match nul en élimination).
  var vainqueur = (data.vainqueur || '').toString().trim();
  if (estCoupe) {
    if (sa === sb) {
      if (!vainqueur) {
        return { error: 'Égalité au score en élimination directe : désigne le vainqueur du match.',
                 departage_requis: true, equipe_A: m.equipe_A, equipe_B: m.equipe_B };
      }
      if (vainqueur !== String(m.equipe_A) && vainqueur !== String(m.equipe_B)) {
        return { error: 'Le vainqueur désigné ne correspond à aucune des deux équipes.' };
      }
    } else {
      vainqueur = (sa > sb) ? String(m.equipe_A) : String(m.equipe_B); // vainqueur imposé par le score
    }
  }

  // 4) Correction en cascade : modifier un match de Coupe déjà propagé, dont le match suivant a
  //    lui-même un score, est bloqué sauf confirmation (forcerCascade).
  if (estCoupe && dejaTermine && data.modification === true && m.match_suivant) {
    var suivInfo = lireMatchParId(onglet, m.match_suivant);
    if (suivInfo && estTermineServeur(suivInfo.obj.statut) && data.forcerCascade !== true) {
      return { error: 'Ce résultat a déjà été propagé vers ' + libelleMatchCourt(suivInfo.obj)
               + ', qui a lui-même un score enregistré. Modifier ce score va réinitialiser la suite du tableau.',
               cascade_requise: true, match_suivant: m.match_suivant };
    }
  }

  // 5) Écriture du score (colonnes 9=score_A, 10=score_B, 11=statut) + vainqueur (Coupe).
  onglet.getRange(ligne, colMatchs('score_A'), 1, 3).setValues([[sa, sb, 'terminé']]);
  if (estCoupe) onglet.getRange(ligne, colMatchs('vainqueur')).setValue(vainqueur);

  // 6) Journal de saison : archive (ou actualise) ce résultat. Ne doit JAMAIS bloquer la saisie.
  try {
    archiverResultat(classeur, {
      id_match: m.id_match, categorie: m.categorie, phase: m.phase,
      equipe_A: m.equipe_A, equipe_B: m.equipe_B, score_A: sa, score_B: sb
    });
  } catch (errArchive) { Logger.log('Archivage historique ignoré : ' + errArchive); }

  // 7) Propagation du vainqueur dans le tableau (immédiate, dans la même action).
  //    ⚡ On met à jour l'objet DÉJÀ EN MÉMOIRE (mêmes valeurs que celles écrites à
  //    l'étape 5) au lieu de relire la ligne dans le Sheet : un aller-retour de moins
  //    pendant que le verrou d'écriture est tenu.
  var propagation = null;
  if (estCoupe) {
    m.score_A = sa; m.score_B = sb; m.statut = 'terminé'; m.vainqueur = vainqueur;
    try { propagation = propagerVainqueurBracket(onglet, m); }
    catch (errProp) { Logger.log('Propagation bracket ignorée : ' + errProp); }
  }

  return { ok: true, propagation: propagation,
           match: { id_match: id, score_A: sa, score_B: sb, statut: 'terminé', vainqueur: vainqueur } };
}

/* ===================== PROPAGATION EN BRACKET (COUPE) ===================== */
/** Vrai si un identifiant d'équipe est renseigné (un slot de bracket à pourvoir est vide). */
function estEquipeConnue(id) { return id !== '' && id != null; }

/** Reconstruit un objet match { colonne: valeur } à partir d'une ligne lue (ordre ENTETES.Matchs). */
function objetDepuisLigneMatch(v) {
  var o = {};
  for (var i = 0; i < ENTETES.Matchs.length; i++) { o[ENTETES.Matchs[i]] = (v[i] == null ? '' : v[i]); }
  return o;
}

/** Retrouve un match par son id : { ligne, obj } ou null. */
function lireMatchParId(onglet, id) {
  var dernier = onglet.getLastRow();
  if (dernier < 2) return null;
  var nc = onglet.getLastColumn();
  var vals = onglet.getRange(2, 1, dernier - 1, nc).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(id)) return { ligne: i + 2, obj: objetDepuisLigneMatch(vals[i]) };
  }
  return null;
}

/** Tous les matchs { ligne, obj } vérifiant un prédicat sur l'objet. */
function trouverMatchs(onglet, predicat) {
  var dernier = onglet.getLastRow(), out = [];
  if (dernier < 2) return out;
  var nc = onglet.getLastColumn();
  var vals = onglet.getRange(2, 1, dernier - 1, nc).getValues();
  for (var i = 0; i < vals.length; i++) {
    var o = objetDepuisLigneMatch(vals[i]);
    if (predicat(o)) out.push({ ligne: i + 2, obj: o });
  }
  return out;
}

/** Libellé français d'un tour de bracket (pour les messages / l'affichage). */
function libelleTourFr(tour) {
  switch (String(tour)) {
    case 'FINALE': return 'Finale';
    case 'DEMI_FINALE': return 'Demi-finale';
    case 'PETITE_FINALE': return 'Petite finale';
    case 'QUART_DE_FINALE': return 'Quart de finale';
    case 'HUITIEME_DE_FINALE': return 'Huitième de finale';
    case 'SEIZIEME_DE_FINALE': return 'Seizième de finale';
    default: return String(tour || '');
  }
}

/** Libellé court et lisible d'un match (ex : « Finale — Coupe U12 », « Plateau U10 »). */
function libelleMatchCourt(o) {
  var st = String(o.sous_tableau).toUpperCase();
  if (st === 'COUPE') return (libelleTourFr(o.tour) || 'Coupe') + ' — Coupe ' + o.categorie;
  if (st === 'PLATEAU') return 'Plateau ' + o.categorie;
  return 'match ' + o.id_match;
}

/**
 * Détermine le vainqueur et le perdant d'un match de Coupe terminé.
 * Score départageant, sinon vainqueur DÉSIGNÉ (colonne vainqueur). Renvoie null si indéterminable.
 */
function vainqueurPerdantCoupe(o) {
  var sa = Number(o.score_A), sb = Number(o.score_B);
  if (!isFinite(sa) || !isFinite(sb)) return null;
  if (sa > sb) return { vainqueur: String(o.equipe_A), perdant: String(o.equipe_B) };
  if (sb > sa) return { vainqueur: String(o.equipe_B), perdant: String(o.equipe_A) };
  var d = String(o.vainqueur || '');
  if (!d) return null; // égalité sans départage : indéterminable
  return { vainqueur: d, perdant: (d === String(o.equipe_A)) ? String(o.equipe_B) : String(o.equipe_A) };
}

/**
 * Propage le résultat d'un match de Coupe :
 *  - place le VAINQUEUR dans le match suivant (emplacement place_suivant) ;
 *  - si le match suivant était déjà joué et change d'équipe, RÉINITIALISE la chaîne aval ;
 *  - pour une DEMI_FINALE, recalcule la petite finale (perdants des deux demi-finales).
 * @param m  l'objet match À JOUR (déjà en mémoire chez l'appelant : évite de relire la
 *           ligne dans le Sheet — un aller-retour de moins sous le verrou d'écriture).
 * @return { actions:[…] } liste lisible de ce qui a été fait (ou null si rien).
 */
function propagerVainqueurBracket(onglet, m) {
  if (String(m.sous_tableau).toUpperCase() !== 'COUPE') return null;
  var vp = vainqueurPerdantCoupe(m);
  if (!vp) return null;
  var actions = [];

  // 1) Vainqueur -> match suivant.
  if (m.match_suivant) {
    var suiv = lireMatchParId(onglet, m.match_suivant);
    if (suiv) {
      var placeB = String(m.place_suivant).toUpperCase() === 'B';
      var col = placeB ? colMatchs('equipe_B') : colMatchs('equipe_A');
      var ancien = placeB ? suiv.obj.equipe_B : suiv.obj.equipe_A;
      if (String(ancien) !== String(vp.vainqueur)) {
        onglet.getRange(suiv.ligne, col).setValue(vp.vainqueur);
        actions.push('vainqueur placé en ' + libelleMatchCourt(suiv.obj));
        // Le match suivant était déjà joué avec une autre équipe → sa suite n'est plus valable.
        if (estTermineServeur(suiv.obj.statut)) {
          invaliderMatchAval(onglet, m.match_suivant);
          actions.push('résultats en aval réinitialisés');
        }
      }
    }
  }

  // 2) Petite finale : perdants des deux demi-finales (recalcul déterministe, robuste aux corrections).
  if (String(m.tour) === 'DEMI_FINALE') {
    if (majPetiteFinale(onglet, m.categorie)) actions.push('petite finale mise à jour');
  }

  return { actions: actions };
}

/**
 * Recalcule les deux équipes de la petite finale d'une catégorie = perdants des demi-finales
 * TERMINÉES (dans l'ordre des demi-finales). Si les participants changent alors que la petite
 * finale avait déjà un score, on la réinitialise. Renvoie true si quelque chose a changé.
 */
function majPetiteFinale(onglet, categorie) {
  // ⚡ UN SEUL balayage de l'onglet pour trouver petite finale ET demi-finales
  // (avant : deux lectures complètes → deux fois plus de temps sous le verrou).
  var coupeCat = trouverMatchs(onglet, function (o) {
    return String(o.sous_tableau).toUpperCase() === 'COUPE' && String(o.categorie) === String(categorie);
  });
  var pf = coupeCat.filter(function (x) { return String(x.obj.tour) === 'PETITE_FINALE'; })[0];
  if (!pf) return false;

  var demis = coupeCat.filter(function (x) { return String(x.obj.tour) === 'DEMI_FINALE'; })
    .sort(function (a, b) { return String(a.obj.id_match).localeCompare(String(b.obj.id_match)); });

  var perdants = [];
  demis.forEach(function (d) {
    if (!estTermineServeur(d.obj.statut)) return;
    var vp = vainqueurPerdantCoupe(d.obj);
    if (vp) perdants.push(vp.perdant);
  });
  var nA = perdants[0] || '', nB = perdants[1] || '';

  if (String(pf.obj.equipe_A) === String(nA) && String(pf.obj.equipe_B) === String(nB)) return false;
  onglet.getRange(pf.ligne, colMatchs('equipe_A'), 1, 2).setValues([[nA, nB]]);
  if (estTermineServeur(pf.obj.statut)) {
    onglet.getRange(pf.ligne, colMatchs('score_A'), 1, 3).setValues([['', '', 'à venir']]);
    onglet.getRange(pf.ligne, colMatchs('vainqueur')).setValue('');
  }
  return true;
}

/**
 * Réinitialise un match de bracket devenu incohérent (une équipe amont a changé) : efface son
 * score/statut/vainqueur, retire le vainqueur qu'il avait propagé plus loin, et RÉCURSE sur la
 * chaîne aval. Recalcule aussi la petite finale si c'était une demi-finale.
 */
function invaliderMatchAval(onglet, id) {
  var info = lireMatchParId(onglet, id);
  if (!info) return;
  var o = info.obj;
  onglet.getRange(info.ligne, colMatchs('score_A'), 1, 3).setValues([['', '', 'à venir']]);
  onglet.getRange(info.ligne, colMatchs('vainqueur')).setValue('');
  if (o.match_suivant) {
    var suiv = lireMatchParId(onglet, o.match_suivant);
    if (suiv) {
      var col = (String(o.place_suivant).toUpperCase() === 'B') ? colMatchs('equipe_B') : colMatchs('equipe_A');
      onglet.getRange(suiv.ligne, col).setValue('');
      invaliderMatchAval(onglet, o.match_suivant);
    }
  }
  if (String(o.tour) === 'DEMI_FINALE') majPetiteFinale(onglet, o.categorie);
}

/* ===================== JOURNAL DE SAISON (Historique) ===================== */
/*
 * L'onglet Historique accumule TOUS les matchs terminés de la saison. Il n'est jamais
 * effacé par « Générer poules et planning » (qui, lui, vide l'onglet Matchs). Ainsi la
 * page « Perfs » peut afficher le cumul des rencontres, même contre une équipe croisée
 * plusieurs fois dans la saison. On repère chaque ligne par (tournoi_id + id_match) pour
 * qu'une correction de score METTE À JOUR la même ligne au lieu d'en créer une nouvelle.
 */

/** S'assure que l'onglet Historique existe (migration auto sur un Sheet déjà créé). */
function assurerOngletHistorique(classeur) {
  if (!classeur.getSheetByName('Historique')) {
    creerOngletAvecEntetes(classeur, 'Historique', ENTETES.Historique);
  }
  return classeur.getSheetByName('Historique');
}

/**
 * Identifiant du tournoi courant, lu dans Config (paramètre `tournoi_id`). S'il est absent
 * (tournoi généré avant cette évolution), on en crée un maintenant et on le mémorise.
 * Un nouvel identifiant est posé à chaque « Générer poules et planning ».
 */
function assurerTournoiId(classeur) {
  var config = lireConfig(classeur);
  var id = (config.global && config.global.tournoi_id) ? String(config.global.tournoi_id).trim() : '';
  if (!id) {
    id = Utilities.formatDate(new Date(), classeur.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    ecrireParamGlobal(classeur.getSheetByName('Config'), 'tournoi_id', id);
  }
  return id;
}

/**
 * Recopie (ou actualise) un match terminé dans l'onglet Historique.
 * @param m { id_match, categorie, phase, equipe_A, equipe_B, score_A, score_B } — equipe_* = identifiants.
 */
function archiverResultat(classeur, m) {
  var tournoiId = assurerTournoiId(classeur);
  var onglet = assurerOngletHistorique(classeur);

  // Résolution des NOMS d'équipe (stables d'un tournoi à l'autre).
  var nomsParId = {};
  lireOngletSimple(classeur, 'Equipes').forEach(function (e) { nomsParId[e.id_equipe] = e.nom_equipe; });
  var nomA = nomsParId[m.equipe_A] || m.equipe_A;
  var nomB = nomsParId[m.equipe_B] || m.equipe_B;

  var date = Utilities.formatDate(new Date(), classeur.getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  var ligne = [date, tournoiId, m.id_match, m.categorie, m.phase, nomA, nomB, m.score_A, m.score_B];

  // Ligne existante pour ce match dans ce tournoi ? (colonnes 2 = tournoi_id, 3 = id_match)
  var dernier = onglet.getLastRow();
  var cible = -1;
  if (dernier >= 2) {
    var cles = onglet.getRange(2, 2, dernier - 1, 2).getValues();
    for (var i = 0; i < cles.length; i++) {
      if (String(cles[i][0]) === String(tournoiId) && String(cles[i][1]) === String(m.id_match)) {
        cible = i + 2; break;
      }
    }
  }
  var ligneEcriture = (cible !== -1) ? cible : (onglet.getLastRow() + 1);
  var plage = onglet.getRange(ligneEcriture, 1, 1, ligne.length);
  plage.setNumberFormat('@'); // tout en texte (comme les autres onglets)
  plage.setValues([ligne]);
}

/** Lit le journal de saison (crée l'onglet au besoin). */
function lireHistorique(classeur) {
  assurerOngletHistorique(classeur);
  return lireOngletSimple(classeur, 'Historique');
}

/** Renvoie l'entier >= 0 correspondant à v, ou null si v n'est pas un score valide. */
function validerScore(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') v = v.trim();
  if (v === '') return null;
  var n = Number(v);
  if (!isFinite(n) || n < 0 || Math.floor(n) !== n) return null;
  return n;
}

/* ===================== CLASSEMENT DES POULES ===================== */
/**
 * Calcule le classement de chaque poule à partir des matchs "terminé".
 * Barème : victoire = 3, nul = 2, défaite = 1.
 * Départage : différence (BP − BC), puis points marqués (BP).
 * Renvoie [{ categorie, poules: [{ nom_poule, classement: [ {stats...}, ... ] }] }].
 */
function calculerClassement(classeur) {
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var matchs = lireOngletSimple(classeur, 'Matchs');

  // Stats par identifiant d'équipe (uniquement celles affectées à une poule).
  var stats = {};
  var infos = {};
  equipes.forEach(function (e) {
    if (!e.poule) return;
    stats[e.id_equipe] = { id_equipe: e.id_equipe, nom_equipe: e.nom_equipe,
                           j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 };
    infos[e.id_equipe] = { categorie: e.categorie, poule: e.poule };
  });

  // On ne compte que les matchs terminés avec deux scores valides.
  // estTermineServeur() : robuste au « é » décomposé (NFD) renvoyé par le Sheet —
  // une comparaison stricte === 'terminé' échouerait et viderait le classement.
  matchs.forEach(function (m) {
    // Classement DES POULES : on ne compte que le matin (phase ≠ classement).
    // Sinon, une fois des scores d'après-midi saisis, une régénération du croisé
    // partirait d'un classement de poule faussé par les matchs de l'après-midi.
    if (String(m.phase) === 'classement') return;
    if (!estTermineServeur(m.statut)) return;
    var a = stats[m.equipe_A], b = stats[m.equipe_B];
    if (!a || !b) return;
    var sa = Number(m.score_A), sb = Number(m.score_B);
    if (!isFinite(sa) || !isFinite(sb)) return;
    enregistrerResultat(a, sa, sb);
    enregistrerResultat(b, sb, sa);
  });

  // Regroupe par catégorie puis poule.
  var parCat = {};
  Object.keys(stats).forEach(function (id) {
    var info = infos[id];
    var cat = (parCat[info.categorie] = parCat[info.categorie] || {});
    (cat[info.poule] = cat[info.poule] || []).push(stats[id]);
  });

  // Trie chaque poule et met en forme le résultat.
  var resultat = [];
  Object.keys(parCat).sort().forEach(function (cat) {
    var poules = [];
    Object.keys(parCat[cat]).sort().forEach(function (nomPoule) {
      var liste = parCat[cat][nomPoule].sort(comparerClassement);
      poules.push({ nom_poule: nomPoule, classement: liste });
    });
    resultat.push({ categorie: cat, poules: poules });
  });
  return resultat;
}

/** Applique un résultat (points marqués "pour" / encaissés "contre") aux stats d'une équipe. */
function enregistrerResultat(s, pour, contre) {
  s.j++; s.bp += pour; s.bc += contre; s.diff = s.bp - s.bc;
  if (pour > contre) { s.v++; s.pts += 3; }
  else if (pour === contre) { s.n++; s.pts += 2; }
  else { s.d++; s.pts += 1; }
}

/** Ordre du classement : points, puis différence, puis points marqués (tous décroissants). */
function comparerClassement(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.diff !== a.diff) return b.diff - a.diff;
  return b.bp - a.bp;
}

/* ===================== PHASE APRÈS-MIDI (répartiteur multi-formats) ===================== */
/**
 * Format d'après-midi RETENU pour une catégorie (défaut historique = CROISE).
 * Valeurs : CROISE / CROISE_DIAGONAL / LIBRE / COUPE_PLATEAU.
 */
function formatApresMidi(cat) {
  var f = (cat && cat.format_apresmidi != null) ? String(cat.format_apresmidi).trim().toUpperCase() : '';
  return (f === 'LIBRE' || f === 'COUPE_PLATEAU' || f === 'CROISE_DIAGONAL') ? f : 'CROISE';
}

/** Lit et parse le JSON `param_format` d'une catégorie (renvoie {} si vide ou illisible). */
function lireParamFormat(cat) {
  var brut = (cat && cat.param_format != null) ? String(cat.param_format).trim() : '';
  if (!brut) return {};
  try { var o = JSON.parse(brut); return (o && typeof o === 'object') ? o : {}; }
  catch (e) { return {}; }
}

/**
 * RÉPARTITEUR de la phase après-midi : lit le format de CHAQUE catégorie et appelle la bonne
 * sous-fonction de fabrication de fixtures (CROISE / LIBRE / COUPE_PLATEAU), puis planifie le tout
 * (terrains + horaires) après la pause déjeuner. AJOUTE ces matchs SANS effacer ceux du matin
 * (qui portent les scores). Re-générer remplace uniquement les matchs de la phase "classement".
 * Chaque format différent peut coexister dans le même tournoi (M8 en LIBRE, M12 en COUPE…).
 */
function genererApresMidi(classeur) {
  assurerColonnesConfig(classeur); // migration douce : colonnes format_apresmidi / param_format
  var config = lireConfig(classeur);
  var matchs = lireOngletSimple(classeur, 'Matchs');
  var avert = [], erreurs = [];

  // Matchs du matin = tout ce qui n'est pas déjà de la phase "classement".
  var matin = matchs.filter(function (m) { return String(m.phase) !== 'classement'; });
  if (matin.length === 0) {
    return { ok: false, error: "Aucun match du matin. Génère d'abord les poules et le planning." };
  }
  // Garde-fou commun à tous les formats : l'après-midi n'a de sens que si le matin est terminé.
  // Test robuste au NFD (voir estTermineServeur) : sinon des matchs bel et bien joués
  // passeraient pour « non terminés » et bloqueraient à tort la génération.
  var nonTermines = matin.filter(function (m) { return !estTermineServeur(m.statut); });
  if (nonTermines.length > 0) {
    return { ok: false, error: nonTermines.length + " match(s) du matin ne sont pas encore terminés. "
             + "Saisis tous les scores du matin avant de générer l'après-midi." };
  }

  var classement = calculerClassement(classeur);
  var classParCat = {};
  classement.forEach(function (c) { classParCat[c.categorie] = c; });

  // 1) Fixtures par catégorie, selon le format choisi pour chacune.
  var categories = config.categories.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; });
  var fixturesParCat = {};
  categories.forEach(function (cat) {
    var fmt = formatApresMidi(cat);
    var cl = classParCat[cat.categorie];
    var res;
    if (fmt === 'LIBRE')              res = fixturesApresMidiLibre(cat, cl);
    else if (fmt === 'COUPE_PLATEAU') res = fixturesApresMidiCoupePlateau(cat, cl, lireParamFormat(cat));
    else if (fmt === 'CROISE_DIAGONAL') res = fixturesApresMidiCroiseDiagonal(cat, cl);
    else                              res = fixturesApresMidiCroise(cat, cl);

    if (res.error) { erreurs.push('Catégorie ' + cat.categorie + ' (' + fmt + ') : ' + res.error); }
    if (res.avert) { res.avert.forEach(function (a) { avert.push('Catégorie ' + cat.categorie + ' : ' + a); }); }
    if (res.fixtures && res.fixtures.length) fixturesParCat[cat.categorie] = res.fixtures;
  });

  // Si AUCUNE catégorie n'a produit de fixtures et qu'il y a des erreurs, on remonte l'erreur.
  if (Object.keys(fixturesParCat).length === 0) {
    return { ok: false, error: erreurs.length ? erreurs.join('\n') : "Aucun match d'après-midi à générer." };
  }

  // 2) Planifier (terrains + horaires) après la pause déjeuner.
  var plan = planifierApresMidi(config, fixturesParCat, matin);
  avert = avert.concat(plan.avert);

  // 3) Attribuer les identifiants d'après-midi (après le dernier id du MATIN) puis résoudre
  //    les liens de bracket (clés locales -> id de match réel).
  var maxNum = 0;
  matin.forEach(function (m) {
    var mm = String(m.id_match).match(/^M(\d+)$/);
    if (mm) { var n = parseInt(mm[1], 10); if (n > maxNum) maxNum = n; }
  });
  var idParCle = {};
  plan.matchs.forEach(function (m, i) {
    m.id_match = idMatch(maxNum + 1 + i);
    if (m.cle) idParCle[m.cle] = m.id_match;
  });

  // 4) Réécrire Matchs = matin (inchangé) + nouveaux matchs d'après-midi.
  var lignesAprem = plan.matchs.map(function (m) {
    var suivant = m.suivant_cle ? (idParCle[m.suivant_cle] || '') : '';
    return matchObjToRow({
      id_match: m.id_match, categorie: m.categorie, poule: m.poule, terrain: m.terrain,
      heure_debut: m.heure_debut, heure_fin: m.heure_fin, equipe_A: m.equipe_A, equipe_B: m.equipe_B,
      score_A: '', score_B: '', statut: 'à venir', phase: 'classement',
      format: m.format || '', sous_tableau: m.sous_tableau || '', tour: m.tour || '',
      match_suivant: suivant, place_suivant: (suivant ? (m.suivant_place || '') : ''), vainqueur: ''
    });
  });
  var lignesMatin = matin.map(matchObjToRow);
  ecrireMatchs(classeur, lignesMatin.concat(lignesAprem));

  // Heure de fin AUTO = vraie fin du dernier match de la JOURNÉE (matin + après-midi).
  var finMatin = 0;
  matin.forEach(function (m) { finMatin = Math.max(finMatin, hmVersMin(m.heure_fin)); });
  var finJournee = Math.max(finMatin, plan.maxFin);
  var autoFin = String((config.global.heure_fin_auto || 'oui')).toLowerCase() !== 'non';
  if (autoFin && finJournee > 0) {
    ecrireParamGlobal(classeur.getSheetByName('Config'), 'heure_fin', minVersHm(finJournee));
  }

  // Les erreurs par catégorie (ex : Coupe impossible) sont remontées comme avertissements
  // quand d'autres catégories ont malgré tout été générées.
  avert = avert.concat(erreurs);

  return {
    ok: true,
    nb_matchs_aprem: plan.matchs.length,
    heure_fin_aprem: plan.maxFin > 0 ? minVersHm(plan.maxFin) : '',
    heure_fin_journee: (autoFin && finJournee > 0) ? minVersHm(finJournee) : '',
    avertissements: avert
  };
}

/* ---------- Sous-générateur : CROISE (existant, inchangé dans son principe) ---------- */
/**
 * Classement croisé : les équipes de même rang de poule (les 1ers ensemble, les 2es ensemble…)
 * s'affrontent en round-robin. Renvoie { fixtures } ou { fixtures:[], avert:[…] } si impossible.
 */
function fixturesApresMidiCroise(cat, cl) {
  if (!cl || !cl.poules || cl.poules.length < 2) {
    return { fixtures: [], avert: ['une seule poule (ou pas de données) : classement croisé impossible.'] };
  }
  var rangMax = 0;
  cl.poules.forEach(function (p) { if (p.classement.length > rangMax) rangMax = p.classement.length; });
  var fixtures = [];
  for (var r = 0; r < rangMax; r++) {
    var groupe = [];
    cl.poules.forEach(function (p) { if (p.classement[r]) groupe.push(p.classement[r].id_equipe); });
    if (groupe.length < 2) continue; // rang incomplet -> pas de match
    var label = 'N' + (r + 1);
    tourneeToutesRondes(groupe).forEach(function (pr) {
      fixtures.push({ poule: label, equipe_A: pr.a, equipe_B: pr.b, round: pr.round, format: 'CROISE' });
    });
  }
  return { fixtures: fixtures };
}

/* ---------- Sous-générateur : CROISE_DIAGONAL ---------- */
/**
 * Classement croisé DIAGONAL. À NE PAS CONFONDRE avec le croisé classique ci-dessus :
 *   - CROISE           : les équipes de MÊME rang s'affrontent (1er vs 1er, 2e vs 2e…).
 *   - CROISE_DIAGONAL  : les rangs sont décalés (le 1er d'une poule affronte le 2e d'une AUTRE poule).
 *
 * Comme le croisé classique, l'après-midi reste organisé par NIVEAUX, mais ici chaque niveau
 * regroupe DEUX rangs consécutifs (1ers+2es = Niveau 1, 3es+4es = Niveau 2…) croisés en diagonale.
 * Ce sont de simples matchs isolés (aucune élimination ni propagation) dont les résultats alimentent
 * le classement général cumulé, EXACTEMENT comme CROISE : on réutilise l'étiquetage de niveau
 * (champ `poule` = N1, N2…), si bien que classementGeneral / podium fonctionnent sans adaptation.
 *
 * Règles de pairage (validées avec l'organisateur) :
 *   - 2 poules : 1erA vs 2eB, 1erB vs 2eA, 3eA vs 4eB, 3eB vs 4eA…
 *   - > 2 poules : ROTATION CYCLIQUE — haut de la poule i × bas de la poule (i+1) (1erA×2eB,
 *     1erB×2eC, 1erC×2eA…), chaque équipe joue une fois.
 *   - rang orphelin (effectif impair : un rang-haut sans rang-bas partenaire) : REPLI en croisé
 *     classique — round-robin des équipes de MÊME rang. Une équipe seule est mise au repos (avert).
 */
function fixturesApresMidiCroiseDiagonal(cat, cl) {
  if (!cl || !cl.poules || cl.poules.length < 2) {
    return { fixtures: [], avert: ['une seule poule (ou pas de données) : classement croisé diagonal impossible.'] };
  }
  var poules = cl.poules;
  var P = poules.length;
  var rangMax = 0;
  poules.forEach(function (p) { if (p.classement.length > rangMax) rangMax = p.classement.length; });

  var idAt = function (i, r) { // id de l'équipe de rang r (0-indexé) dans la poule i, ou null
    var eq = poules[i].classement[r];
    return eq ? eq.id_equipe : null;
  };

  var fixtures = [];
  var avert = [];
  var niveau = 0; // 0-indexé ; libellé = 'N' + (niveau + 1)

  // Un niveau = une paire de rangs consécutifs (rHaut, rBas).
  for (var r = 0; r < rangMax; r += 2) {
    niveau++;
    var label = 'N' + niveau;
    var rHaut = r, rBas = r + 1;

    // Rang orphelin (aucun rang-bas dans ce niveau) -> repli croisé classique sur le rang-haut.
    var basExiste = false;
    for (var i = 0; i < P; i++) { if (idAt(i, rBas) != null) { basExiste = true; break; } }
    if (!basExiste) {
      var seuls = [];
      for (var i = 0; i < P; i++) { var idS = idAt(i, rHaut); if (idS != null) seuls.push(idS); }
      if (seuls.length >= 2) {
        tourneeToutesRondes(seuls).forEach(function (pr) {
          fixtures.push({ poule: label, equipe_A: pr.a, equipe_B: pr.b, round: pr.round, format: 'CROISE_DIAGONAL' });
        });
      } else if (seuls.length === 1) {
        avert.push('niveau ' + label + ' : une seule équipe (rang ' + (rHaut + 1) + '), mise au repos.');
      }
      continue;
    }

    // Diagonale par rotation cyclique : haut de la poule i × bas de la poule (i+1) % P.
    var joue = {}; // id -> true : équipes déjà appariées dans ce niveau
    for (var i = 0; i < P; i++) {
      var a = idAt(i, rHaut);
      var b = idAt((i + 1) % P, rBas);
      if (a != null && b != null) {
        fixtures.push({ poule: label, equipe_A: a, equipe_B: b, round: 0, format: 'CROISE_DIAGONAL' });
        joue[a] = true; joue[b] = true;
      }
    }

    // Repli pour les équipes du niveau restées sans adversaire (poules de tailles inégales).
    var restes = [];
    for (var i = 0; i < P; i++) {
      [rHaut, rBas].forEach(function (rr) {
        var idR = idAt(i, rr);
        if (idR != null && !joue[idR]) restes.push(idR);
      });
    }
    if (restes.length >= 2) {
      tourneeToutesRondes(restes).forEach(function (pr) {
        fixtures.push({ poule: label, equipe_A: pr.a, equipe_B: pr.b, round: 1, format: 'CROISE_DIAGONAL' });
      });
    } else if (restes.length === 1) {
      avert.push('niveau ' + label + ' : une équipe sans adversaire en diagonale, mise au repos.');
    }
  }

  var out = { fixtures: fixtures };
  if (avert.length) out.avert = avert;
  return out;
}

/* ---------- Sous-générateur : LIBRE ---------- */
/**
 * Matchs amicaux tournants, SANS classement ni qualification : un simple round-robin
 * (chacun rencontre chacun une fois) sur toutes les équipes de la catégorie. Aucun enjeu.
 */
function fixturesApresMidiLibre(cat, cl) {
  if (!cl || !cl.poules) return { error: "pas de données du matin (poules non terminées ?)." };
  var ids = [];
  cl.poules.forEach(function (p) { p.classement.forEach(function (e) { ids.push(e.id_equipe); }); });
  if (ids.length < 2) return { fixtures: [], avert: ['moins de 2 équipes : rien à générer en LIBRE.'] };
  var fixtures = [];
  tourneeToutesRondes(ids).forEach(function (pr) {
    fixtures.push({ poule: 'Libre', equipe_A: pr.a, equipe_B: pr.b, round: pr.round, format: 'LIBRE' });
  });
  return { fixtures: fixtures };
}

/* ---------- Sous-générateur : COUPE_PLATEAU ---------- */
/**
 * Les `nbQualifiesCoupe` premiers de CHAQUE poule partent en Coupe (bracket à élimination
 * directe + petite finale) ; les autres jouent un Plateau (round-robin, sans élimination).
 * Renvoie une erreur explicite si les données du matin sont insuffisantes.
 * @param param  { nbQualifiesCoupe:number }
 */
function fixturesApresMidiCoupePlateau(cat, cl, param) {
  if (!cl || !cl.poules || cl.poules.length < 1) {
    return { error: "pas de données du matin (poules non terminées ?)." };
  }
  var nbQ = parseInt(param && param.nbQualifiesCoupe, 10);
  if (!isFinite(nbQ) || nbQ < 1) nbQ = 2;

  // Qualifiés (rang < nbQ) rang par rang, poule par poule : 1ers de chaque poule (les têtes de
  // série), puis 2es, etc. Les autres (rang >= nbQ) forment le Plateau.
  var seeds = [], reste = [], avert = [];
  var rangMax = 0;
  cl.poules.forEach(function (p) { if (p.classement.length > rangMax) rangMax = p.classement.length; });
  for (var r = 0; r < rangMax; r++) {
    cl.poules.forEach(function (p) {
      var e = p.classement[r];
      if (!e) return;
      if (r < nbQ) seeds.push(e.id_equipe); else reste.push(e.id_equipe);
    });
  }

  if (seeds.length < 2) {
    return { error: "pas assez de qualifiés pour une Coupe (il en faut au moins 2, ici " + seeds.length +
             "). Baisse le nombre de poules ou augmente nbQualifiesCoupe." };
  }

  // Bracket de la Coupe (avec liens de propagation vers le match suivant).
  var fixtures = construireBracketCoupe(seeds);

  // Plateau : round-robin des non-qualifiés.
  if (reste.length >= 2) {
    tourneeToutesRondes(reste).forEach(function (pr) {
      fixtures.push({ poule: 'Plateau', sous_tableau: 'PLATEAU', tour: '', format: 'COUPE_PLATEAU',
                      equipe_A: pr.a, equipe_B: pr.b, round: pr.round });
    });
  } else if (reste.length === 1) {
    avert.push("1 seule équipe hors Coupe : pas de Plateau possible (elle ne joue pas l'après-midi).");
  }

  return { fixtures: fixtures, avert: avert };
}

/**
 * Ordre de placement des têtes de série dans un bracket de `taille` (puissance de 2), par
 * doublement : [1] -> [1,2] -> [1,4,2,3] -> [1,8,4,5,2,7,3,6]… La lecture donne, slot par slot,
 * le rang de la tête de série qui l'occupe (1 = meilleure). Assure que les meilleurs ne se
 * croisent que le plus tard possible.
 */
function ordreSeeds(taille) {
  var ordre = [1];
  while (ordre.length < taille) {
    var m = ordre.length, somme = 2 * m + 1, suivant = [];
    for (var i = 0; i < m; i++) { suivant.push(ordre[i]); suivant.push(somme - ordre[i]); }
    ordre = suivant;
  }
  return ordre;
}

/** Libellé lisible d'un tour à partir du nombre de tours RESTANTS (1 = finale). */
function libelleTour(restants) {
  if (restants === 1) return 'FINALE';
  if (restants === 2) return 'DEMI_FINALE';
  if (restants === 3) return 'QUART_DE_FINALE';
  if (restants === 4) return 'HUITIEME_DE_FINALE';
  if (restants === 5) return 'SEIZIEME_DE_FINALE';
  return 'TOUR_' + restants;
}

/**
 * Construit les matchs du bracket de la Coupe à partir des têtes de série (ordre : plus forte
 * d'abord). Gère les byes (effectif non puissance de 2 : les meilleures têtes passent le 1er
 * tour). Chaque match reçoit une clé locale (`cle`) ; le producteur d'un vainqueur pointe vers
 * le match suivant via (`suivant_cle`, `suivant_place`). Une petite finale est ajoutée entre les
 * perdants des deux demi-finales (remplie par propagation, sans colonne dédiée).
 * @return {Array} fixtures de la Coupe (à planifier ensuite).
 */
function construireBracketCoupe(seeds) {
  var n = seeds.length;
  var taille = 1; while (taille < n) taille *= 2;
  var ordre = ordreSeeds(taille);

  // Occupants du 1er tour : équipe (rang <= n) ou bye (rang > n).
  var occ = [];
  for (var s = 0; s < taille; s++) {
    var rang = ordre[s];
    occ.push(rang <= n ? { type: 'team', id: seeds[rang - 1] } : { type: 'bye' });
  }

  var nbTours = 0; for (var t = taille; t > 1; t /= 2) nbTours++;
  var fixtures = [], compteur = 0, round = 0, clesDemi = [];

  function lierProducteur(cle, cleSuivant, place) {
    for (var i = 0; i < fixtures.length; i++) {
      if (fixtures[i].cle === cle) { fixtures[i].suivant_cle = cleSuivant; fixtures[i].suivant_place = place; return; }
    }
  }

  while (occ.length > 1) {
    var restants = nbTours - round;   // 1 = finale
    var tour = libelleTour(restants);
    var suivant = [];
    for (var k = 0; k < occ.length; k += 2) {
      var A = occ[k], B = occ[k + 1];
      // Byes (uniquement au 1er tour) : l'équipe présente avance sans jouer.
      if (A.type === 'bye' && B.type === 'bye') { suivant.push({ type: 'bye' }); continue; }
      if (A.type === 'bye') { suivant.push(B); continue; }
      if (B.type === 'bye') { suivant.push(A); continue; }
      // Match réel.
      var cle = 'C' + (++compteur);
      fixtures.push({ poule: 'Coupe', sous_tableau: 'COUPE', tour: tour, format: 'COUPE_PLATEAU',
                      equipe_A: (A.type === 'team' ? A.id : ''), equipe_B: (B.type === 'team' ? B.id : ''),
                      round: round, cle: cle });
      if (A.type === 'winner') lierProducteur(A.cle, cle, 'A');
      if (B.type === 'winner') lierProducteur(B.cle, cle, 'B');
      if (tour === 'DEMI_FINALE') clesDemi.push(cle);
      suivant.push({ type: 'winner', cle: cle });
    }
    occ = suivant; round++;
  }

  // Petite finale (3e place) : perdants des DEUX demi-finales. La propagation y place les
  // perdants (1er emplacement libre) — pas de colonne de lien « perdant » nécessaire.
  if (clesDemi.length === 2) {
    fixtures.push({ poule: 'Coupe', sous_tableau: 'COUPE', tour: 'PETITE_FINALE', format: 'COUPE_PLATEAU',
                    equipe_A: '', equipe_B: '', round: nbTours - 1, cle: 'CPF' });
  }

  return fixtures;
}

/* ---------- Petites briques COMMUNES aux deux planificateurs (matin / après-midi) ----------
 * Les deux boucles de planning restent volontairement SÉPARÉES : leurs contraintes diffèrent
 * (amorçage des disponibilités, saut de la pause déjeuner vs barrière de tour de Coupe,
 * équipes encore inconnues dans les brackets, forme du résultat). Les fusionner exigerait
 * une fonction à options/callbacks bien plus dure à lire que deux boucles commentées.
 * On mutualise en revanche les briques réellement identiques ci-dessous. */

/** Terrains d'une catégorie : "1, 2,3" → ['1','2','3'] (espaces nettoyés, vides ignorés). */
function listeTerrainsCategorie(cat) {
  return String(cat.terrains || '').split(',')
    .map(function (s) { return s.trim(); })
    .filter(function (s) { return s !== ''; });
}

/** Terrain qui se libère LE PLUS TÔT selon la table des disponibilités (null si aucun). */
function terrainPlusTot(terrains, terrainLibre) {
  var choisi = null, plusTot = Infinity;
  terrains.forEach(function (t) { if (terrainLibre[t] < plusTot) { plusTot = terrainLibre[t]; choisi = t; } });
  return choisi;
}

/**
 * Planifie les matchs de l'après-midi (terrains + horaires) à partir de la reprise
 * (fin de la pause déjeuner), en tenant compte des fins de matchs du matin pour ne pas
 * empiéter (terrain encore occupé, équipe pas encore récupérée).
 *
 * Gère aussi les matchs de bracket dont les équipes ne sont pas encore connues (tours > 1) :
 *  - on ignore la disponibilité des équipes inconnues (equipe_A/equipe_B vides) ;
 *  - une BARRIÈRE DE TOUR garantit qu'un match de Coupe d'un tour donné démarre après la fin
 *    de tous les matchs de Coupe du tour précédent (même catégorie), pour que les équipes
 *    qualifiées soient bien déterminées avant de jouer.
 * Les champs de format (format, sous_tableau, tour) et les clés de lien (cle, suivant_cle,
 * suivant_place) sont recopiés tels quels dans le résultat pour être écrits ensuite.
 */
function planifierApresMidi(config, fixturesParCat, matin) {
  var global = config.global;
  var dejDeb = hmVersMin(global.pause_dejeuner_debut || '12:30');
  var dejDur = parseInt(global.pause_dejeuner_duree_min || '0', 10) || 0;
  var tReprise = dejDeb + dejDur;
  var battement = parseInt(global.battement_terrain_min || '0', 10) || 0;
  var avert = [], maxFin = 0;

  // Fins des matchs du matin (pour amorcer terrains et équipes).
  var finTerrain = {}, finEquipe = {};
  matin.forEach(function (m) {
    var fin = hmVersMin(m.heure_fin);
    if (m.terrain !== '' && m.terrain != null) finTerrain[m.terrain] = Math.max(finTerrain[m.terrain] || 0, fin);
    finEquipe[m.equipe_A] = Math.max(finEquipe[m.equipe_A] || 0, fin);
    finEquipe[m.equipe_B] = Math.max(finEquipe[m.equipe_B] || 0, fin);
  });

  var categories = config.categories.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; });
  var terrainLibre = {}, equipeLibre = {}, resultat = [];

  // Équipe « connue » = identifiant non vide (les slots de bracket à pourvoir sont vides).
  function connue(id) { return id !== '' && id != null; }

  categories.forEach(function (cat) {
    var liste = (fixturesParCat[cat.categorie] || []).slice();
    if (!liste.length) return;
    liste.sort(function (x, y) { return x.round - y.round; });
    var terrains = listeTerrainsCategorie(cat);
    if (terrains.length === 0) { avert.push('Catégorie ' + cat.categorie + ' : aucun terrain défini (après-midi non planifié).'); return; }
    var duree = dureeMatch(cat);
    var recup = parseInt(cat.recup_entre_matchs_min || '0', 10) || 0;

    // Terrain libre après sa dernière fin du matin + battement (au plus tôt à la reprise).
    terrains.forEach(function (t) {
      if (terrainLibre[t] == null) terrainLibre[t] = Math.max(tReprise, (finTerrain[t] || 0) + battement);
    });

    liste.forEach(function (m) {
      // Barrière de tour pour la Coupe : ce match ne peut pas démarrer avant la fin de tous
      // les matchs de Coupe (même catégorie) d'un tour STRICTEMENT antérieur.
      var barriere = tReprise;
      if (m.sous_tableau === 'COUPE') {
        resultat.forEach(function (x) {
          if (x.categorie === cat.categorie && x.sous_tableau === 'COUPE' && x._round < m.round) {
            barriere = Math.max(barriere, hmVersMin(x.heure_fin));
          }
        });
      }

      // Disponibilité des équipes CONNUES seulement (les inconnues n'imposent pas de contrainte).
      var dispoEquipes = barriere;
      if (connue(m.equipe_A)) {
        if (equipeLibre[m.equipe_A] == null) equipeLibre[m.equipe_A] = Math.max(tReprise, (finEquipe[m.equipe_A] || 0) + recup);
        dispoEquipes = Math.max(dispoEquipes, equipeLibre[m.equipe_A]);
      }
      if (connue(m.equipe_B)) {
        if (equipeLibre[m.equipe_B] == null) equipeLibre[m.equipe_B] = Math.max(tReprise, (finEquipe[m.equipe_B] || 0) + recup);
        dispoEquipes = Math.max(dispoEquipes, equipeLibre[m.equipe_B]);
      }

      var terrainChoisi = terrainPlusTot(terrains, terrainLibre);
      var debut = Math.max(dispoEquipes, terrainLibre[terrainChoisi]);
      var fin = debut + duree;
      if (fin > maxFin) maxFin = fin;
      terrainLibre[terrainChoisi] = fin + battement;
      if (connue(m.equipe_A)) equipeLibre[m.equipe_A] = fin + recup;
      if (connue(m.equipe_B)) equipeLibre[m.equipe_B] = fin + recup;

      resultat.push({ categorie: cat.categorie, poule: m.poule, terrain: terrainChoisi,
                      heure_debut: minVersHm(debut), heure_fin: minVersHm(fin),
                      equipe_A: m.equipe_A, equipe_B: m.equipe_B,
                      format: m.format || '', sous_tableau: m.sous_tableau || '', tour: m.tour || '',
                      cle: m.cle || '', suivant_cle: m.suivant_cle || '', suivant_place: m.suivant_place || '',
                      _round: m.round });
    });
  });

  return { matchs: resultat, maxFin: maxFin, avert: avert };
}

/** Nombre de colonnes de l'onglet Matchs (source unique : ENTETES.Matchs). */
var LARGEUR_MATCHS = ENTETES.Matchs.length;

/** Position 1-based d'une colonne de Matchs par son nom (ex : colMatchs('vainqueur') = 18). */
function colMatchs(nom) { return ENTETES.Matchs.indexOf(nom) + 1; }

/**
 * Ajuste une ligne de match à EXACTEMENT LARGEUR_MATCHS colonnes : complète avec des cellules
 * vides si elle est plus courte (matin / CROISE / LIBRE ne remplissent pas les colonnes bracket),
 * tronque si elle est plus longue. Toutes les lignes écrites en une fois doivent avoir la même
 * largeur (contrainte de setValues) — ce helper est le point de passage unique qui le garantit.
 */
function ajusterLargeurMatch(ligne) {
  var l = ligne.slice();
  while (l.length < LARGEUR_MATCHS) l.push('');
  return l.slice(0, LARGEUR_MATCHS);
}

/** Transforme un match (objet lu depuis l'onglet) en ligne dans l'ordre des colonnes. */
function matchObjToRow(m) {
  return [ m.id_match, m.categorie, m.poule, m.terrain, m.heure_debut, m.heure_fin,
           m.equipe_A, m.equipe_B,
           (m.score_A == null ? '' : m.score_A),
           (m.score_B == null ? '' : m.score_B),
           m.statut, (m.phase ? m.phase : 'poule'),
           (m.format || ''), (m.sous_tableau || ''), (m.tour || ''),
           (m.match_suivant || ''), (m.place_suivant || ''), (m.vainqueur || '') ];
}

/** Réécrit entièrement les lignes de l'onglet Matchs (toutes en texte pour préserver "09:30"). */
function ecrireMatchs(classeur, lignes) {
  var oM = classeur.getSheetByName('Matchs');
  assurerColonnesMatchs(oM);
  viderDonnees(oM);
  if (lignes.length) {
    var ajustees = lignes.map(ajusterLargeurMatch);
    var plage = oM.getRange(2, 1, ajustees.length, LARGEUR_MATCHS);
    plage.setNumberFormat('@');
    plage.setValues(ajustees);
  }
}

/**
 * S'assure que l'onglet Matchs possède TOUTES les colonnes attendues (migration auto).
 * Ajoute à droite, dans l'ordre de ENTETES.Matchs, les en-têtes manquants (`phase` sur un
 * Sheet créé avant la session 13 ; `format`, `sous_tableau`, `tour`, `match_suivant`,
 * `place_suivant`, `vainqueur` sur un Sheet créé avant les formats d'après-midi).
 * Sans intervention manuelle. Remplace l'ancienne assurerColonnePhase().
 */
function assurerColonnesMatchs(oM) {
  var lastCol = Math.max(oM.getLastColumn(), 1);
  var entetes = oM.getRange(1, 1, 1, lastCol).getValues()[0];
  ENTETES.Matchs.forEach(function (nom) {
    if (entetes.indexOf(nom) === -1) {
      oM.getRange(1, entetes.length + 1).setValue(nom);
      entetes.push(nom);
    }
  });
}

/**
 * S'assure que la Zone B de Config possède les colonnes ajoutées après coup
 * (`format_apresmidi`, `param_format`, `terrains_auto`, puis les colonnes « dossier club » :
 * `reglement`, `effectif_min`, `effectif_max`, `arbitrage_organisation`). Migration douce d'un
 * Sheet déjà en service : la colonne manquante est ajoutée (vide = valeur par défaut à la lecture).
 */
function assurerColonnesConfig(classeur) {
  assurerColonneCategorie(classeur, 'format_apresmidi');
  assurerColonneCategorie(classeur, 'param_format');
  assurerColonneCategorie(classeur, 'terrains_auto');
  assurerColonneCategorie(classeur, 'reglement');
  assurerColonneCategorie(classeur, 'effectif_min');
  assurerColonneCategorie(classeur, 'effectif_max');
  assurerColonneCategorie(classeur, 'arbitrage_organisation');
}

/* ===================== GÉNÉRATION POULES + PLANNING ===================== */
/**
 * Calcule (SANS écrire) les poules, les matchs et leurs horaires.
 * @param {Object} config   { global, categories }
 * @param {Object[]} equipes
 * @param {boolean} melange  true = tirage aléatoire des poules ; false = déterministe
 * @return {Object} { poules, affectationPoule, matchsFinaux, maxFin, avert }
 */
/**
 * Nom du club à partir du nom d'équipe, en retirant UNIQUEMENT un suffixe d'équipe final
 * du type « -1 », « - 2 », « /2 » (séparateur + numéro). Ne touche pas aux chiffres collés
 * au nom (ex : « RACING 92 » reste « RACING 92 »). Sert à ne pas mettre deux équipes d'un
 * même club dans la même poule de départ.
 */
function clubDe(nom) {
  return String(nom).replace(/\s*[-–—\/]\s*\d{1,3}\s*$/, '').trim().toUpperCase();
}

/** Taille de poule visée quand le nombre de poules est en mode « Auto ». */
var TAILLE_IDEALE_POULE = 4;

/**
 * Nombre de poules d'une catégorie.
 *   • nb_poules vide / non numérique / < 1  → AUTO : calculé pour viser ~4 équipes/poule.
 *   • nb_poules = un entier ≥ 1             → FORCÉ (borné au nombre d'équipes).
 */
function nombrePoules(cat, nbEquipes) {
  if (nbEquipes <= 0) return 0;
  var force = parseInt(cat && cat.nb_poules, 10);
  if (isFinite(force) && force >= 1) return Math.min(force, nbEquipes);
  return Math.max(1, Math.ceil(nbEquipes / TAILLE_IDEALE_POULE));
}

/** Vrai si la catégorie a un nombre de poules FORCÉ (override manuel actif). */
function poulesForcees(cat) {
  var force = parseInt(cat && cat.nb_poules, 10);
  return isFinite(force) && force >= 1;
}

/**
 * S'assure que la Zone B de Config possède la colonne `nom` (migration douce d'un Sheet
 * existant). Si elle manque, on l'ajoute à droite des en-têtes de catégorie. Sans effet
 * si elle est déjà là. Renvoie true si une colonne a été ajoutée.
 */
function assurerColonneCategorie(classeur, nom) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return false;
  var donnees = onglet.getDataRange().getValues();
  var hdr = indexEnteteCategories(donnees);
  if (hdr === -1) return false;
  var entetes = donnees[hdr];
  var largeur = 0;
  for (var k = 0; k < entetes.length; k++) { if (entetes[k] !== '' && entetes[k] !== null) largeur = k + 1; }
  for (var c = 0; c < largeur; c++) { if (entetes[c] === nom) return false; } // déjà présente
  var cellule = onglet.getRange(hdr + 1, largeur + 1);
  cellule.setNumberFormat('@');
  cellule.setValue(nom);
  stylerEntete(cellule);
  return true;
}

/**
 * Réorganise MANUELLEMENT les poules du matin selon une répartition fournie
 * (map { id_equipe: nom_poule }), puis RECALCULE les matchs + horaires du matin.
 * Garde-fou : refuse si un score du matin est déjà saisi (les matchs ne peuvent plus changer).
 * Ne touche pas aux réglages. Renvoie le nombre de poules / matchs recalculés.
 */
function reorganiserPoulesMatin(classeur, data) {
  var assignation = data && data.assignation;
  if (typeof assignation === 'string') {
    try { assignation = JSON.parse(assignation); } catch (e) { return { error: 'Répartition illisible.' }; }
  }
  if (!assignation || typeof assignation !== 'object') return { error: 'Répartition manquante.' };

  var config = lireConfig(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var matchs = lireOngletSimple(classeur, 'Matchs');

  // Garde-fou : aucun score du matin ne doit être saisi (sinon on casserait des matchs joués).
  var scoresMatin = matchs.filter(function (m) {
    return String(m.phase) !== 'classement' && estTermineServeur(m.statut);
  });
  if (scoresMatin.length > 0) {
    return { error: scoresMatin.length + ' match(s) du matin ont déjà un score. '
      + "Impossible de réorganiser les poules une fois les matchs commencés." };
  }

  // Affectation finale : la poule fournie, sinon la poule actuelle de l'équipe (repli).
  var affectation = {};
  equipes.forEach(function (e) {
    var nom = assignation[e.id_equipe];
    affectation[e.id_equipe] = (nom != null && nom !== '') ? String(nom) : e.poule;
  });

  var r = calculerPlanning(config, equipes, false, affectation);
  ecrireGeneration(classeur, r.poules, r.affectationPoule, r.matchsFinaux);

  // Heure de fin AUTO = fin projetée de la journée (matin recalculé + après-midi projeté),
  // comme à la génération des poules — sinon le champ resterait figé sur l'ancien planning.
  var autoFin = String((config.global.heure_fin_auto || 'oui')).toLowerCase() !== 'non';
  var finJournee = Math.max(r.maxFin, projeterFinApresMidi(config, r.poules, r.matchsFinaux));
  if (autoFin && finJournee > 0) {
    ecrireParamGlobal(classeur.getSheetByName('Config'), 'heure_fin', minVersHm(finJournee));
  }

  return {
    ok: true,
    nb_poules: r.poules.length,
    nb_matchs: r.matchsFinaux.length,
    heure_fin_journee: (autoFin && finJournee > 0) ? minVersHm(finJournee) : '',
    avertissements: r.avert
  };
}

/**
 * RECALCULER LES HORAIRES (étape 3) — régénération NON destructive.
 * Recalcule les heures/terrains des matchs du matin avec les réglages actuels, en gardant
 * la MÊME composition de poules (pas de tirage) et en RÉINJECTANT les scores déjà saisis
 * sur les affrontements identiques. Ne change pas tournoi_id (même tournoi).
 * Garde-fous : refuse s'il n'y a pas de planning, si l'après-midi est déjà généré, ou si la
 * composition a changé (équipe ajoutée/retirée, nombre de poules modifié) → il faut alors
 * un vrai tirage via genererPoulesEtPlanning.
 */
function recalculerHoraires(classeur) {
  var config = lireConfig(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var matchs = lireOngletSimple(classeur, 'Matchs');

  var matin = matchs.filter(function (m) { return String(m.phase) !== 'classement'; });
  var aprem = matchs.filter(function (m) { return String(m.phase) === 'classement'; });

  if (matin.length === 0) {
    return { error: "Aucun planning à recalculer. Utilise « Générer poules et planning »." };
  }
  if (aprem.length > 0) {
    return { error: "L'après-midi est déjà généré : recalculer le matin le décalerait. Régénère l'ensemble via « Générer » (⚠️ efface les scores)." };
  }

  // La composition ne doit pas avoir changé (sinon un vrai tirage est nécessaire).
  var sigStructStockee = config.global.signature_structure || '';
  if (sigStructStockee && signatureStructure(config.categories, equipes) !== sigStructStockee) {
    return { error: "La composition a changé (équipe ajoutée/retirée ou nombre de poules modifié) : un nouveau tirage est nécessaire. Utilise « Générer » (⚠️ efface les scores)." };
  }
  // Sécurité : toute équipe d'une catégorie présente doit déjà être placée dans une poule.
  var catsPresentes = {};
  config.categories.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; })
    .forEach(function (c) { catsPresentes[c.categorie] = true; });
  var nonPlacee = equipes.some(function (e) {
    return catsPresentes[e.categorie] && (e.poule == null || String(e.poule) === '');
  });
  if (nonPlacee) {
    return { error: "Certaines équipes ne sont pas encore réparties en poules. Utilise « Générer »." };
  }

  // Composition inchangée = poule actuelle de chaque équipe (aucun tirage).
  var affectation = {};
  equipes.forEach(function (e) { affectation[e.id_equipe] = e.poule; });

  var r = calculerPlanning(config, equipes, false, affectation);

  // Réinjecte les scores existants sur les affrontements identiques (paire non ordonnée :
  // si A/B sont inversés dans le nouveau round-robin, on échange aussi les scores).
  var scoreParPaire = {};
  matin.forEach(function (m) {
    scoreParPaire[m.categorie + '|' + m.poule + '|' + m.equipe_A + '|' + m.equipe_B] =
      { sA: m.score_A, sB: m.score_B, statut: m.statut, inv: false };
    scoreParPaire[m.categorie + '|' + m.poule + '|' + m.equipe_B + '|' + m.equipe_A] =
      { sA: m.score_A, sB: m.score_B, statut: m.statut, inv: true };
  });
  var scoresConserves = 0;
  r.matchsFinaux.forEach(function (row) {
    // row = [id, cat, poule, terrain, hd, hf, A, B, score_A, score_B, statut, phase]
    var info = scoreParPaire[row[1] + '|' + row[2] + '|' + row[6] + '|' + row[7]];
    if (!info) return;
    row[8] = info.inv ? info.sB : info.sA;
    row[9] = info.inv ? info.sA : info.sB;
    if (info.statut) row[10] = info.statut;
    if (estTermineServeur(info.statut)) scoresConserves++;
  });

  ecrireGeneration(classeur, r.poules, r.affectationPoule, r.matchsFinaux);

  // Heure de fin auto (comme à la génération) — mais SANS toucher tournoi_id.
  var autoFin = String((config.global.heure_fin_auto || 'oui')).toLowerCase() !== 'non';
  var finJournee = Math.max(r.maxFin, projeterFinApresMidi(config, r.poules, r.matchsFinaux));
  // Réglages désormais « à jour » → heure de fin (si auto) + les deux empreintes, en une passe.
  var params = [];
  if (autoFin && finJournee > 0) params.push(['heure_fin', minVersHm(finJournee)]);
  params.push(['signature_generation', signatureGeneration(config.global, config.categories, equipes)]);
  params.push(['signature_structure', signatureStructure(config.categories, equipes)]);
  ecrireParamsGlobaux(classeur.getSheetByName('Config'), params);

  return {
    ok: true,
    nb_matchs: r.matchsFinaux.length,
    scores_conserves: scoresConserves,
    heure_fin_matin: (r.maxFin > 0) ? minVersHm(r.maxFin) : '',
    heure_fin_journee: (autoFin && finJournee > 0) ? minVersHm(finJournee) : '',
    avertissements: r.avert
  };
}

/**
 * @param affectationImposee (optionnel) map { id_equipe: nom_poule } : si fournie, on N'effectue
 *   PAS le tirage auto — on regroupe les équipes selon cette répartition manuelle (matin).
 */
function calculerPlanning(config, equipes, melange, affectationImposee) {
  var global = config.global;
  var avert = [];
  var tDebut = hmVersMin(global.heure_debut || '09:00');
  var dejDeb = hmVersMin(global.pause_dejeuner_debut || '12:30');
  var dejDur = parseInt(global.pause_dejeuner_duree_min || '0', 10) || 0;
  var dejFin = dejDeb + dejDur;
  var battement = parseInt(global.battement_terrain_min || '0', 10) || 0;
  var maxFin = 0;

  var categories = config.categories.filter(function (c) {
    return String(c.presente).toLowerCase() === 'oui';
  });

  // 1) Poules + affectation
  var poules = [], affectationPoule = {}, compteurPoule = 0;
  categories.forEach(function (cat) {
    var eqCat = equipes.filter(function (e) { return e.categorie === cat.categorie; });
    if (eqCat.length === 0) { avert.push('Catégorie ' + cat.categorie + ' : aucune équipe.'); return; }
    eqCat = eqCat.slice();

    // Répartition IMPOSÉE (modification manuelle des poules) : on regroupe simplement les
    // équipes selon la poule fournie, sans tirage ni séparation par club.
    if (affectationImposee) {
      var groupes = {};
      eqCat.forEach(function (e) {
        var nom = affectationImposee[e.id_equipe];
        if (nom == null || nom === '') return; // équipe sans poule → ignorée
        (groupes[String(nom)] = groupes[String(nom)] || []).push(e);
      });
      Object.keys(groupes).sort().forEach(function (nom) {
        compteurPoule++;
        var poule = { id_poule: 'P' + (compteurPoule < 10 ? '0' + compteurPoule : compteurPoule),
                      categorie: cat.categorie, nom_poule: nom, equipes: groupes[nom] };
        poules.push(poule);
        groupes[nom].forEach(function (e) { affectationPoule[e.id_equipe] = nom; });
      });
      return; // catégorie suivante
    }

    if (melange) eqCat = melanger(eqCat);
    var nbPoules = nombrePoules(cat, eqCat.length);
    var poulesCat = [];
    for (var p = 0; p < nbPoules; p++) {
      compteurPoule++;
      var poule = { id_poule: 'P' + (compteurPoule < 10 ? '0' + compteurPoule : compteurPoule),
                    categorie: cat.categorie, nom_poule: String.fromCharCode(65 + p), equipes: [] };
      poulesCat.push(poule); poules.push(poule);
    }
    // Attribution : deux équipes d'un MÊME CLUB ne vont pas dans la même poule de départ.
    // On place les clubs les plus NOMBREUX d'abord (les plus contraints), en répartissant
    // leurs équipes dans des poules différentes ; les clubs à une seule équipe équilibrent
    // ensuite. Chaque équipe va dans la poule la moins remplie sans équipe du même club
    // (si aucune — club plus nombreux que le nb de poules — on répartit au mieux).
    var parClub = {};
    eqCat.forEach(function (e) { var c = clubDe(e.nom_equipe); (parClub[c] = parClub[c] || []).push(e); });
    // Avertit si un club a plus d'équipes que de poules (séparation impossible à 100 %).
    Object.keys(parClub).forEach(function (c) {
      if (parClub[c].length > nbPoules) {
        avert.push('Catégorie ' + cat.categorie + ' : le club « ' + c + ' » a ' + parClub[c].length +
                   ' équipes pour ' + nbPoules + ' poule(s) — certaines seront dans la même poule.');
      }
    });
    var clubs = Object.keys(parClub);
    if (melange) clubs = melanger(clubs);
    clubs.sort(function (a, b) { return parClub[b].length - parClub[a].length; });
    clubs.forEach(function (c) {
      parClub[c].forEach(function (e) {
        var eligibles = poulesCat.filter(function (po) {
          return !po.equipes.some(function (x) { return clubDe(x.nom_equipe) === c; });
        });
        if (!eligibles.length) eligibles = poulesCat.slice();
        eligibles.sort(function (a, b) { return a.equipes.length - b.equipes.length; });
        var po = eligibles[0];
        po.equipes.push(e);
        affectationPoule[e.id_equipe] = po.nom_poule;
      });
    });
  });

  // 2) Matchs de poule (round-robin)
  var matchsParCat = {};
  poules.forEach(function (poule) {
    var ids = poule.equipes.map(function (e) { return e.id_equipe; });
    if (!matchsParCat[poule.categorie]) matchsParCat[poule.categorie] = [];
    tourneeToutesRondes(ids).forEach(function (pr) {
      matchsParCat[poule.categorie].push({ poule: poule.nom_poule, equipe_A: pr.a, equipe_B: pr.b, round: pr.round });
    });
  });

  // 3) Planning (horaires + terrains)
  var terrainLibre = {}, equipeLibre = {}, matchsFinaux = [], compteurMatch = 0;
  categories.forEach(function (cat) {
    var liste = (matchsParCat[cat.categorie] || []).slice();
    liste.sort(function (x, y) { return x.round - y.round; });
    var terrains = listeTerrainsCategorie(cat);
    if (terrains.length === 0 && liste.length > 0) avert.push('Catégorie ' + cat.categorie + ' : aucun terrain défini.');
    var duree = dureeMatch(cat);
    var recup = parseInt(cat.recup_entre_matchs_min || '0', 10) || 0;
    liste.forEach(function (m) {
      terrains.forEach(function (t) { if (terrainLibre[t] == null) terrainLibre[t] = tDebut; });
      if (equipeLibre[m.equipe_A] == null) equipeLibre[m.equipe_A] = tDebut;
      if (equipeLibre[m.equipe_B] == null) equipeLibre[m.equipe_B] = tDebut;
      var dispoEquipes = Math.max(equipeLibre[m.equipe_A], equipeLibre[m.equipe_B]);
      var terrainChoisi = terrainPlusTot(terrains, terrainLibre);
      var debut = (terrainChoisi == null) ? dispoEquipes : Math.max(dispoEquipes, terrainLibre[terrainChoisi]);
      if (dejDur > 0 && debut < dejFin && (debut + duree) > dejDeb) debut = dejFin;
      var fin = debut + duree;
      if (fin > maxFin) maxFin = fin;
      if (terrainChoisi != null) terrainLibre[terrainChoisi] = fin + battement;
      equipeLibre[m.equipe_A] = fin + recup;
      equipeLibre[m.equipe_B] = fin + recup;
      compteurMatch++;
      matchsFinaux.push([ idMatch(compteurMatch), cat.categorie, m.poule, (terrainChoisi || ''),
                          minVersHm(debut), minVersHm(fin), m.equipe_A, m.equipe_B, '', '', 'à venir', 'poule' ]);
    });
  });

  return { poules: poules, affectationPoule: affectationPoule, matchsFinaux: matchsFinaux, maxFin: maxFin, avert: avert };
}

/**
 * Génère et ÉCRIT les poules et le planning. Gère l'heure de fin auto/manuelle
 * et, en manuel avec dépassement, propose des arbitrages.
 */
/**
 * Projette l'heure de fin de l'APRÈS-MIDI dès la génération du matin, SANS connaître
 * les équipes : le planning de l'après-midi ne dépend que de la STRUCTURE (nombre de
 * matchs du classement croisé = déterminé par les poules) + des réglages + de la reprise
 * après déjeuner. On simule donc avec des équipes fictives. Renvoie l'heure de fin en minutes.
 */
function projeterFinApresMidi(config, poules, matchsMatin) {
  var fixturesParCat = {};
  config.categories.filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; })
    .forEach(function (cat) {
      var poulesCat = poules.filter(function (p) { return p.categorie === cat.categorie; });
      if (poulesCat.length < 2) return; // une seule poule -> pas de croisé
      var rangMax = 0;
      poulesCat.forEach(function (p) { if (p.equipes.length > rangMax) rangMax = p.equipes.length; });
      var fixtures = [];
      for (var r = 0; r < rangMax; r++) {
        var groupe = [];
        poulesCat.forEach(function (p) { if (p.equipes[r]) groupe.push('PROJ_' + cat.categorie + '_' + p.nom_poule + '_' + r); });
        if (groupe.length < 2) continue;
        var label = 'N' + (r + 1);
        tourneeToutesRondes(groupe).forEach(function (pr) {
          fixtures.push({ poule: label, equipe_A: pr.a, equipe_B: pr.b, round: pr.round });
        });
      }
      if (fixtures.length) fixturesParCat[cat.categorie] = fixtures;
    });
  return planifierApresMidi(config, fixturesParCat, matchsMatin).maxFin;
}

/** Heure de fin projetée de la JOURNÉE complète (matin + après-midi), en minutes. */
function finJourneeProjetee(config, equipes, melange) {
  var r = calculerPlanning(config, equipes, melange);
  return Math.max(r.maxFin, projeterFinApresMidi(config, r.poules, r.matchsFinaux));
}

/**
 * Publie ou masque le tournoi pour le public. Tant que `tournoi_publie` ≠ 'oui', la page
 * publique tournoi.html affiche un écran « à venir » (aucune info visible). Distinct de la
 * génération des poules (qui, elle, prépare la structure sans rien publier).
 * @param publie  true/'oui' pour publier, false/'non' pour masquer.
 */
function publierTournoi(classeur, publie) {
  var valeur = (publie === true || String(publie).toLowerCase() === 'oui'
                || String(publie).toLowerCase() === 'true') ? 'oui' : 'non';
  ecrireParamGlobal(classeur.getSheetByName('Config'), 'tournoi_publie', valeur);
  return { ok: true, tournoi_publie: valeur };
}

/* ===================== RÉINITIALISATION DU TOURNOI ===================== */
/**
 * Réinitialise le tournoi pour repartir d'une base vierge (bouton « zone de danger »
 * de l'admin). Action IRRÉVERSIBLE. Concrètement :
 *   • vide les onglets Equipes, Poules et Matchs (planning + scores du tournoi en cours) ;
 *   • supprime TOUTES les catégories de l'onglet Config ;
 *   • efface les infos publiques du tournoi (nom, date, lieu, adresse, description), les
 *     contacts & sécurité (référent, poste de secours) et met l'affiche Drive à la corbeille ;
 *   • repasse le tournoi en « masqué » (tournoi_publie = 'non').
 * On CONSERVE les réglages « Horaires de la journée » (heure début/fin, pauses…) et le
 * journal de saison (onglet Historique), qui accumule les résultats de toute la saison.
 */
function reinitialiserTournoi(classeur) {
  // 1) On compte avant de vider (pour le message de retour) puis on vide les 3 onglets.
  var nbEquipes = lireOngletSimple(classeur, 'Equipes').length;
  var nbPoules  = lireOngletSimple(classeur, 'Poules').length;
  var nbMatchs  = lireOngletSimple(classeur, 'Matchs').length;

  var oEquipes = classeur.getSheetByName('Equipes');
  var oPoules  = classeur.getSheetByName('Poules');
  var oMatchs  = classeur.getSheetByName('Matchs');
  if (oEquipes) viderDonnees(oEquipes);
  if (oPoules)  viderDonnees(oPoules);
  if (oMatchs)  viderDonnees(oMatchs);

  // 2) Suppression de toutes les catégories (zone B de l'onglet Config).
  var nbCategories = supprimerToutesCategories(classeur);

  // 3) Effacement des infos publiques + mise à la corbeille de l'affiche Drive.
  var ongletConfig = classeur.getSheetByName('Config');
  var ancienId = (lireConfig(classeur).global || {}).tournoi_affiche_id;
  if (ancienId) { try { DriveApp.getFileById(ancienId).setTrashed(true); } catch (e) {} }
  ['tournoi_nom', 'tournoi_date', 'tournoi_lieu', 'tournoi_adresse', 'tournoi_description',
   'tournoi_affiche_id']
    .forEach(function (champ) { effacerParamGlobal(ongletConfig, champ); });

  // 3 bis) Remise à ZÉRO des horaires de la journée : on repart vraiment de zéro
  //         (le fil « Où en suis-je ? » repasse l'étape Horaires « à faire »).
  //         signature_generation est effacée aussi (elle n'a plus de sens sans planning).
  ['heure_debut', 'heure_fin', 'heure_fin_auto', 'battement_terrain_min',
   'pause_dejeuner_debut', 'pause_dejeuner_duree_min', 'heure_rdv', 'heure_fin_communiquee',
   'marge_fin_communiquee_min', 'signature_generation']
    .forEach(function (champ) { effacerParamGlobal(ongletConfig, champ); });

  // 3 ter) Contacts & sécurité : effacés aussi (référent et poste de secours peuvent
  //         changer d'une édition à l'autre).
  CHAMPS_CONTACTS_SECURITE.forEach(function (champ) { effacerParamGlobal(ongletConfig, champ); });

  // 3 quater) Dossier d'invitation : champs effacés + photo du parking mise à la corbeille.
  //           ✅ La LISTE des clubs invités (onglet ClubsInvites) est CONSERVÉE, comme
  //           l'historique : c'est un carnet d'adresses réutilisable d'une édition à l'autre.
  var idParking = (lireConfig(classeur).global || {}).parking_photo_id;
  if (idParking) { try { DriveApp.getFileById(idParking).setTrashed(true); } catch (e) {} }
  CHAMPS_INVITATION.concat(['parking_photo_id'])
    .forEach(function (champ) { effacerParamGlobal(ongletConfig, champ); });

  // 4) Le tournoi redevient masqué pour le public.
  ecrireParamGlobal(ongletConfig, 'tournoi_publie', 'non');

  return {
    ok: true,
    nb_equipes: nbEquipes,
    nb_poules: nbPoules,
    nb_matchs: nbMatchs,
    nb_categories: nbCategories
  };
}

/**
 * Supprime toutes les lignes de catégories de la zone B de Config (sous l'en-tête
 * « categorie », jusqu'à la première ligne vide). Suppression du bas vers le haut pour
 * ne pas décaler les indices. Renvoie le nombre de catégories supprimées.
 */
function supprimerToutesCategories(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return 0;
  var donnees = onglet.getDataRange().getValues();
  var hdr = indexEnteteCategories(donnees);
  if (hdr === -1) return 0;
  var lignes = [];
  for (var l = hdr + 1; l < donnees.length; l++) {
    if (donnees[l][0] === '' || donnees[l][0] === null) break;
    lignes.push(l + 1); // numéro de ligne 1-based
  }
  for (var k = lignes.length - 1; k >= 0; k--) { onglet.deleteRow(lignes[k]); }
  return lignes.length;
}

/**
 * Efface la VALEUR d'un paramètre global de Config s'il existe (met la cellule à vide).
 * Contrairement à ecrireParamGlobal, n'insère PAS de ligne si le paramètre est absent.
 */
function effacerParamGlobal(onglet, nom) {
  var dernier = onglet.getLastRow();
  if (dernier < 1) return;
  var donnees = onglet.getRange(1, 1, dernier, 1).getValues();
  for (var i = 0; i < donnees.length; i++) {
    if (donnees[i][0] === nom) {
      var cellule = onglet.getRange(i + 1, 2);
      cellule.setNumberFormat('@');
      cellule.setValue('');
      return;
    }
  }
}

/**
 * SIGNATURE DE GÉNÉRATION (« cerveau des dépendances », étape 2).
 * Résume, en une courte empreinte, tous les réglages qui influent RÉELLEMENT sur les
 * horaires des matchs. Enregistrée dans Config à chaque génération ; la page admin
 * recalcule la même empreinte à partir des réglages courants et, si elle diffère,
 * affiche « à recalculer » (les poules ne sont plus à jour).
 *
 * IMPORTANT : cette fonction DOIT rester identique à celle de frontend/js/admin.js
 * (même liste de champs, même tri, même hachage) — sinon la comparaison est faussée.
 * On EXCLUT volontairement heure_fin / heure_fin_auto : ce ne sont qu'une cible d'arrivée,
 * ils ne décalent aucun match (et heure_fin est réécrite par la génération en mode auto).
 */
function hachageChaine(s) {
  var h = 5381;
  s = String(s);
  for (var i = 0; i < s.length; i++) {
    h = (h * 33 + s.charCodeAt(i)) % 2147483647;
  }
  return h.toString(36);
}

function signatureGeneration(global, categories, equipes) {
  global = global || {};
  var parts = [];
  parts.push('hd=' + (global.heure_debut || ''));
  parts.push('bt=' + (global.battement_terrain_min || ''));
  parts.push('pd=' + (global.pause_dejeuner_debut || ''));
  parts.push('pdd=' + (global.pause_dejeuner_duree_min || ''));

  // Nombre d'équipes par catégorie.
  var nbCat = {};
  (equipes || []).forEach(function (e) {
    var c = String(e.categorie || '');
    if (c) nbCat[c] = (nbCat[c] || 0) + 1;
  });

  // Catégories présentes, triées par nom (comparaison brute → même ordre partout).
  var cats = (categories || []).filter(function (c) {
    return String(c.presente).toLowerCase() === 'oui';
  }).slice().sort(function (a, b) {
    var x = String(a.categorie), y = String(b.categorie);
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
 * SIGNATURE DE STRUCTURE (étape 3). Résume UNIQUEMENT ce qui définit la COMPOSITION des
 * poules : nombre de poules et liste des équipes (ids) par catégorie. Sert à savoir si un
 * simple recalcul des horaires (sans nouveau tirage, scores gardés) est légitime, ou s'il
 * faut au contraire un vrai tirage. DOIT rester identique côté frontend (admin.js).
 */
function signatureStructure(categories, equipes) {
  var parCat = {};
  (equipes || []).forEach(function (e) {
    var c = String(e.categorie || '');
    if (c) (parCat[c] = parCat[c] || []).push(String(e.id_equipe));
  });
  var cats = (categories || []).filter(function (c) {
    return String(c.presente).toLowerCase() === 'oui';
  }).slice().sort(function (a, b) {
    var x = String(a.categorie), y = String(b.categorie);
    return x < y ? -1 : (x > y ? 1 : 0);
  });
  var parts = [];
  cats.forEach(function (c) {
    var ids = (parCat[String(c.categorie)] || []).slice().sort();
    parts.push('cat=' + c.categorie + '|np=' + (c.nb_poules || '') + '|ids=' + ids.join(','));
  });
  return hachageChaine(parts.join(';'));
}

function genererPoulesEtPlanning(classeur) {
  var config = lireConfig(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var global = config.global;
  // Migration douce : garantit la colonne nb_poules (Sheet créé avant cette évolution).
  assurerColonneCategorie(classeur, 'nb_poules');

  var r = calculerPlanning(config, equipes, true);
  // Fin réelle du tournoi = fin du dernier match d'après-midi (projeté, structure connue).
  var finApremProj = projeterFinApresMidi(config, r.poules, r.matchsFinaux);
  var finJournee = Math.max(r.maxFin, finApremProj);
  var avert = r.avert.slice();
  var autoFin = String(global.heure_fin_auto || 'oui').toLowerCase() !== 'non';
  var cible = hmVersMin(global.heure_fin || '18:00');
  var heureFin;
  var suggestions = [];

  // Quelles catégories ont un nombre de poules FORCÉ (override manuel) ?
  var catsForcees = config.categories.filter(function (c) {
    return String(c.presente).toLowerCase() === 'oui' && poulesForcees(c);
  }).map(function (c) { return c.categorie; });

  // Fin projetée en TOUT-AUTO (nb_poules effacés) : sert à mesurer le coût d'un forçage.
  var finAuto = null;
  if (catsForcees.length) {
    var cfgAuto = clonerConfig(config);
    cfgAuto.categories.forEach(function (c) { c.nb_poules = ''; });
    finAuto = finJourneeProjetee(cfgAuto, equipes, false);
  }

  if (autoFin) {
    // Heure de fin = fin du dernier match du TOURNOI (après-midi projeté inclus).
    heureFin = (finJournee > 0) ? minVersHm(finJournee) : (global.heure_fin || '');
    if (finJournee > 0) ecrireParamGlobal(classeur.getSheetByName('Config'), 'heure_fin', heureFin);
  } else {
    // Heure de fin fixée manuellement : on prévient si dépassement.
    heureFin = global.heure_fin || '';
    if (finJournee > cible) {
      avert.push('Le tournoi finit à ' + minVersHm(finJournee) + ' (après-midi inclus), après l\'heure de fin (' + heureFin + ').');
    }
  }

  // Contrainte PAUSE DÉJEUNER : le matin (matchs de poule) doit se terminer AVANT le
  // début de la pause (créneau contraint pour l'organisateur). Sinon on prévient.
  var dejDeb = hmVersMin(global.pause_dejeuner_debut || '12:30');
  var dejDur = parseInt(global.pause_dejeuner_duree_min || '0', 10) || 0;
  var matinDepasse = (dejDur > 0) && (r.maxFin > dejDeb);
  if (matinDepasse) {
    avert.push('Le matin (poules) finit à ' + minVersHm(r.maxFin) +
      ', après le début de la pause déjeuner (' + minVersHm(dejDeb) + ').');
  }

  // Assistant d'arbitrage. Une seule cause à la fois, par ordre de priorité :
  //   1) PAUSE : le matin déborde sur la pause déjeuner (contrainte dure) ;
  //   2) l'heure de fin est MANUELLE et le tournoi la dépasse ; OU
  //   3) un forçage du nombre de poules RALLONGE la journée par rapport au mode Auto.
  var depasseManuelle = !autoFin && finJournee > cible;
  var forcageCouteux = (finAuto !== null) && (finJournee > finAuto + 1); // marge 1 min
  var causeArb = '';
  if (matinDepasse) {
    // Cible : faire finir le matin avant le début de la pause.
    suggestions = analyserArbitragesMatin(config, equipes, dejDeb);
    causeArb = 'matin';
  } else if (depasseManuelle || forcageCouteux) {
    if (forcageCouteux) {
      avert.push('Le forçage du nombre de poules rallonge la journée : fin projetée à ' +
        minVersHm(finJournee) + ' au lieu de ' + minVersHm(finAuto) + ' en Auto (catégories : ' +
        catsForcees.join(', ') + ').');
    }
    // Cible de l'arbitrage : l'heure de fin manuelle si elle prime, sinon le retour à l'Auto.
    var cibleArb = depasseManuelle ? cible : finAuto;
    suggestions = analyserArbitrages(config, equipes, cibleArb);
    causeArb = autoFin ? 'forcage' : 'fin';
  }

  ecrireGeneration(classeur, r.poules, r.affectationPoule, r.matchsFinaux);

  // En une passe : nouvel identifiant de saison + les deux empreintes de réglages.
  //  - tournoi_id : nouveau tournoi (les résultats déjà archivés dans Historique gardent l'ancien).
  //  - signature_generation : permet à l'admin de détecter qu'un réglage a changé (« à recalculer »).
  //  - signature_structure  : sert au « Recalculer les horaires » (étape 3).
  ecrireParamsGlobaux(classeur.getSheetByName('Config'), [
    ['tournoi_id', Utilities.formatDate(new Date(), classeur.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss')],
    ['signature_generation', signatureGeneration(global, config.categories, equipes)],
    ['signature_structure', signatureStructure(config.categories, equipes)]
  ]);

  return {
    ok: true,
    nb_poules: r.poules.length,
    nb_matchs: r.matchsFinaux.length,
    heure_fin: heureFin,
    heure_fin_auto: autoFin,
    heure_fin_matin: (r.maxFin > 0) ? minVersHm(r.maxFin) : '',
    heure_fin_apresmidi: (finApremProj > 0) ? minVersHm(finApremProj) : '',
    heure_fin_projetee: (finJournee > 0) ? minVersHm(finJournee) : '',
    pause_debut: minVersHm(dejDeb),
    arbitrage_cause: causeArb,
    avertissements: avert,
    suggestions: suggestions
  };
}

/**
 * NOYAU COMMUN des deux analyses d'arbitrages (journée / matin) : simule chaque ajustement
 * candidat avec la fonction de PROJECTION fournie et garde les pistes qui font gagner du temps,
 * triées de la plus efficace à la moins efficace (6 max).
 * Simulation en DÉTERMINISTE (melange=false) pour comparer les pistes à isopérimètre :
 * la vraie génération mélange les poules, donc les heures réelles peuvent légèrement
 * différer, mais l'ordre de grandeur des gains reste représentatif.
 * @param projeter  function(config, equipes) → heure de fin projetée (en minutes)
 */
function analyserArbitragesSelon(config, equipes, cibleMin, projeter) {
  var base = projeter(config, equipes);
  var candidats = construireCandidats(config, equipes);
  var res = [];
  candidats.forEach(function (cand) {
    var cfg = clonerConfig(config);
    appliquerModif(cfg, cand.modif);
    var fin = projeter(cfg, equipes);
    var gain = base - fin;
    if (gain > 0) {
      res.push({ piste: cand.label, heure_fin: minVersHm(fin), gain_min: gain,
                 tient: (fin <= cibleMin), modif: cand.modif });
    }
  });
  res.sort(function (a, b) { return hmVersMin(a.heure_fin) - hmVersMin(b.heure_fin); });
  return res.slice(0, 6);
}

/**
 * Teste une série d'ajustements possibles et renvoie ceux qui font gagner du temps sur la
 * fin de JOURNÉE (après-midi projeté inclus), avec l'heure de fin simulée et s'ils
 * permettent de tenir le créneau.
 */
function analyserArbitrages(config, equipes, cibleMin) {
  return analyserArbitragesSelon(config, equipes, cibleMin, function (cfg, eq) {
    return finJourneeProjetee(cfg, eq, false);
  });
}

/** Fin projetée du MATIN (dernier match de poule) en DÉTERMINISTE, pour simuler les arbitrages. */
function finMatinProjetee(config, equipes) {
  return calculerPlanning(config, equipes, false).maxFin;
}

/**
 * Comme analyserArbitrages, mais vise à faire finir le MATIN (poules) avant `cibleMin`
 * (le début de la pause déjeuner). Les pistes qui ne raccourcissent pas le matin
 * (ex. « réduire la pause ») ont un gain nul et sont automatiquement écartées.
 */
function analyserArbitragesMatin(config, equipes, cibleMin) {
  return analyserArbitragesSelon(config, equipes, cibleMin, finMatinProjetee);
}

/** Applique un ajustement (modif) sur une config (utilisé pour la simulation ET l'application réelle). */
function appliquerModif(config, modif) {
  if (modif.type === 'global') {
    config.global[modif.champ] = modif.valeur;
  } else if (modif.type === 'categorie') {
    var t = trouverCat(config, modif.categorie);
    if (t) t[modif.champ] = modif.valeur;
  }
}

/**
 * Liste des ajustements candidats. Chaque candidat porte :
 *   - label : texte affiché
 *   - modif : { type:'global', champ, valeur } ou { type:'categorie', categorie, champ, valeur }
 */
function construireCandidats(config, equipes) {
  var g = config.global, cands = [];
  equipes = equipes || [];

  var debut = hmVersMin(g.heure_debut || '09:00');
  if (debut - 30 >= 0) {
    cands.push({ label: 'Commencer 30 min plus tôt (' + minVersHm(debut - 30) + ')',
      modif: { type: 'global', champ: 'heure_debut', valeur: minVersHm(debut - 30) } });
  }
  var dej = parseInt(g.pause_dejeuner_duree_min || '0', 10) || 0;
  if (dej >= 30) {
    cands.push({ label: 'Réduire la pause déjeuner à ' + (dej - 15) + ' min',
      modif: { type: 'global', champ: 'pause_dejeuner_duree_min', valeur: String(dej - 15) } });
  }
  var bat = parseInt(g.battement_terrain_min || '0', 10) || 0;
  if (bat > 2) {
    cands.push({ label: 'Réduire le battement terrain à 2 min',
      modif: { type: 'global', champ: 'battement_terrain_min', valeur: '2' } });
  }

  config.categories.filter(function (cat) { return String(cat.presente).toLowerCase() === 'oui'; })
    .forEach(function (cat) {
      var nom = cat.categorie;
      var terrains = listeTerrainsCategorie(cat);
      var nums = terrains.map(Number).filter(function (n) { return !isNaN(n); });
      var nouveau = (nums.length ? Math.max.apply(null, nums) : 0) + 1;
      cands.push({ label: nom + ' : ajouter un terrain (' + (terrains.length + 1) + ' au total)',
        modif: { type: 'categorie', categorie: nom, champ: 'terrains', valeur: terrains.concat([String(nouveau)]).join(',') } });

      var d = parseInt(cat.duree_mi_temps_min || '0', 10) || 0;
      if (d > 5) {
        cands.push({ label: nom + ' : mi-temps ' + (d - 1) + ' min (au lieu de ' + d + ')',
          modif: { type: 'categorie', categorie: nom, champ: 'duree_mi_temps_min', valeur: String(d - 1) } });
      }
      var rc = parseInt(cat.recup_entre_matchs_min || '0', 10) || 0;
      if (rc > 5) {
        cands.push({ label: nom + ' : récup ' + (rc - 5) + ' min (au lieu de ' + rc + ')',
          modif: { type: 'categorie', categorie: nom, champ: 'recup_entre_matchs_min', valeur: String(rc - 5) } });
      }
      // Nombre de poules. Plus de poules = poules plus petites = moins de matchs (donc
      // journée plus courte si les terrains suivent). On propose « une poule de plus ».
      var nbEq = equipes.filter(function (e) { return e.categorie === nom; }).length;
      var nbActuel = nombrePoules(cat, nbEq);
      if (nbEq > 0 && nbActuel + 1 <= nbEq) {
        cands.push({ label: nom + ' : ' + (nbActuel + 1) + ' poules (au lieu de ' + nbActuel + ', moins de matchs)',
          modif: { type: 'categorie', categorie: nom, champ: 'nb_poules', valeur: String(nbActuel + 1) } });
      }
      // Si le nombre de poules est FORCÉ, proposer le retour au calcul automatique.
      if (poulesForcees(cat)) {
        cands.push({ label: nom + ' : revenir au nombre de poules Auto',
          modif: { type: 'categorie', categorie: nom, champ: 'nb_poules', valeur: '' } });
      }
    });

  return cands;
}

function trouverCat(config, nom) {
  for (var i = 0; i < config.categories.length; i++) {
    if (config.categories[i].categorie === nom) return config.categories[i];
  }
  return null;
}

function clonerConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Round-robin « chacun contre chacun » par l'ALGORITHME DU CERCLE.
 * Principe : on aligne les équipes sur deux rangées ; à chaque ronde on appaire l'équipe i
 * de la rangée du haut avec l'équipe (n-1-i) de la rangée du bas. Puis on FIXE la 1re équipe
 * et on fait TOURNER toutes les autres d'un cran (rotation) : après n-1 rondes, chaque équipe
 * a rencontré toutes les autres exactement une fois. Si le nombre d'équipes est impair, on
 * ajoute un « bye » (null) : l'équipe appariée au bye est au repos cette ronde-là.
 * @return {Array<{a, b, round}>} la liste des matchs, avec le n° de ronde (pour l'ordonnancement).
 */
function tourneeToutesRondes(ids) {
  var matches = [];
  var arr = ids.slice();
  if (arr.length < 2) return matches;
  if (arr.length % 2 === 1) arr.push(null); // bye pour un effectif impair
  var n = arr.length;
  var liste = arr.slice();
  for (var r = 0; r < n - 1; r++) {
    for (var i = 0; i < n / 2; i++) {
      var a = liste[i], b = liste[n - 1 - i];
      if (a !== null && b !== null) matches.push({ a: a, b: b, round: r }); // on saute les matchs contre le bye
    }
    // Rotation : 1re équipe fixe, les autres tournent d'un cran (la dernière repasse en 2e).
    var fixe = liste[0];
    var reste = liste.slice(1);
    reste.unshift(reste.pop());
    liste = [fixe].concat(reste);
  }
  return matches;
}

function dureeMatch(cat) {
  var format = parseInt(cat.format_mi_temps || '1', 10) || 1;
  var duree  = parseInt(cat.duree_mi_temps_min || '0', 10) || 0;
  var pause  = parseInt(cat.pause_mi_temps_min || '0', 10) || 0;
  var total = format * duree + (format >= 2 ? pause : 0);
  return total > 0 ? total : 10;
}

function hmVersMin(hm) {
  var p = String(hm).split(':');
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
}

function minVersHm(min) {
  min = Math.round(min);
  var h = Math.floor(min / 60), m = min % 60;
  return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
}

function idMatch(n) {
  if (n < 10)  return 'M00' + n;
  if (n < 100) return 'M0' + n;
  return 'M' + n;
}

function melanger(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function ecrireGeneration(classeur, poules, affectationPoule, matchsFinaux) {
  var oP = classeur.getSheetByName('Poules');
  viderDonnees(oP);
  if (poules.length) {
    oP.getRange(2, 1, poules.length, 3).setValues(poules.map(function (p) {
      return [p.id_poule, p.categorie, p.nom_poule];
    }));
  }
  var oE = classeur.getSheetByName('Equipes');
  var dernierE = oE.getLastRow();
  if (dernierE >= 2) {
    var ids = oE.getRange(2, 1, dernierE - 1, 1).getValues();
    var col = ids.map(function (r) {
      return [affectationPoule[r[0]] != null ? affectationPoule[r[0]] : ''];
    });
    oE.getRange(2, 4, col.length, 1).setValues(col);
  }
  var oM = classeur.getSheetByName('Matchs');
  assurerColonnesMatchs(oM);
  viderDonnees(oM);
  if (matchsFinaux.length) {
    var ajustees = matchsFinaux.map(ajusterLargeurMatch);
    var plageM = oM.getRange(2, 1, ajustees.length, LARGEUR_MATCHS);
    plageM.setNumberFormat('@');
    plageM.setValues(ajustees);
  }
}

function viderDonnees(onglet) {
  var dernier = onglet.getLastRow();
  if (dernier >= 2) {
    onglet.getRange(2, 1, dernier - 1, onglet.getLastColumn()).clearContent();
  }
}
