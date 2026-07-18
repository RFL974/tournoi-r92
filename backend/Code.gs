/**
 * ============================================================================
 *  TOURNOI R92 — Backend Google Apps Script
 * ============================================================================
 *  - setupSheet()  : crée les 5 onglets (à lancer UNE SEULE FOIS au tout début).
 *  - doGet(e)      : LECTURE (renvoie du JSON).
 *  - doPost(e)     : ÉCRITURE (équipes, réglages, génération des poules/planning).
 * ============================================================================
 */

var SHEET_ID = '17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U';

var ENTETES = {
  Equipes: ['id_equipe', 'nom_equipe', 'categorie', 'poule'],
  Poules: ['id_poule', 'categorie', 'nom_poule'],
  Matchs: ['id_match', 'categorie', 'poule', 'terrain', 'heure_debut', 'heure_fin',
           'equipe_A', 'equipe_B', 'score_A', 'score_B', 'statut', 'phase'],
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
  creerOngletConfig(classeur);
  try {
    SpreadsheetApp.getUi().alert('✅ Base prête !', 'Les 5 onglets ont été créés.',
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
    ['pause_dejeuner_duree_min', '60']
  ];
  var titreZoneB = zoneA.length + 2;
  var ligneDebutZoneB = zoneA.length + 3;
  // nb_poules : vide = Auto (calculé selon le nombre d'équipes) ; un nombre = forcé.
  var entetesCategorie = ['categorie', 'presente', 'terrains', 'nb_poules',
    'format_mi_temps', 'duree_mi_temps_min', 'pause_mi_temps_min', 'recup_entre_matchs_min'];
  var exemplesCategorie = [
    ['U8',  'oui', '1,2', '', '2', '8',  '2', '15'],
    ['U10', 'oui', '3,4', '', '2', '10', '2', '15'],
    ['U12', 'oui', '5,6', '', '2', '12', '3', '15'],
    ['U14', 'oui', '7,8', '', '2', '15', '3', '20']
  ];
  onglet.getRange(1, 1, 50, 10).setNumberFormat('@');
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
    var classeur = SpreadsheetApp.openById(SHEET_ID);
    var resultat;
    switch (action) {
      case 'ping':       resultat = { ok: true, message: 'API Tournoi R92 en ligne' }; break;
      case 'getConfig':  resultat = lireConfig(classeur); break;
      case 'getEquipes': resultat = lireOngletSimple(classeur, 'Equipes'); break;
      case 'getPoules':  resultat = lireOngletSimple(classeur, 'Poules'); break;
      case 'getMatchs':  resultat = lireOngletSimple(classeur, 'Matchs'); break;
      // getAll est l'appel MASSIF (page publique, milliers de spectateurs). On sert une
      // copie mise en cache ~10 s : un seul lecteur relit le Sheet par tranche, les autres
      // reçoivent la copie instantanément. Le cache est rafraîchi à chaque écriture.
      case 'getAll':
        return ContentService.createTextOutput(snapshotJsonCache(classeur))
          .setMimeType(ContentService.MimeType.JSON);
      case 'getClassement': resultat = calculerClassement(classeur); break;
      case 'getHistorique': resultat = lireHistorique(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    return repondreJson(resultat);
  } catch (erreur) { return repondreJson({ error: String(erreur) }); }
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
 */
function snapshotJsonCache(classeur) {
  var cache = CacheService.getScriptCache();
  var s = cache.get('snapshot_json');
  if (s) return s;
  s = JSON.stringify(construireSnapshot(classeur));
  mettreEnCacheSnapshot(cache, s);
  return s;
}

/**
 * Met le JSON en cache serveur, SAUF s'il dépasse la limite de CacheService (100 Ko) :
 * au-delà, put() échouerait et le cache resterait vide (chaque appel relirait le Sheet).
 * Dans ce cas rare (très gros tournoi), mieux vaut ne pas cacher et compter sur le relais CDN.
 */
function mettreEnCacheSnapshot(cache, json) {
  try {
    // Marge sous 100 Ko (100 000 octets) ; longueur JS ≈ octets pour de l'ASCII/JSON.
    if (json.length < 95000) cache.put('snapshot_json', json, 10);
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

function lireConfig(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return { global: {}, categories: [] };
  var donnees = onglet.getDataRange().getValues();
  var hdr = -1;
  for (var i = 0; i < donnees.length; i++) { if (donnees[i][0] === 'categorie') { hdr = i; break; } }
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
      case 'genererApresMidi':     resultat = genererApresMidi(classeur); break;
      case 'publierTournoi':       resultat = publierTournoi(classeur, requete.publie); break;
      case 'enregistrerInfosTournoi': resultat = enregistrerInfosTournoi(classeur, requete); break;
      case 'enregistrerAffiche':   resultat = enregistrerAffiche(classeur, requete); break;
      case 'reinitialiserTournoi': resultat = reinitialiserTournoi(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    // Écriture réussie → cache serveur rafraîchi (+ relais CDN si configuré). Sans effet
    // secondaire bloquant : n'échoue jamais l'action même si le rafraîchissement rate.
    if (resultat && !resultat.error) apresEcriture(classeur);
    return repondreJson(resultat);
  } catch (erreur) {
    return repondreJson({ error: String(erreur) });
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
function configurerCles() {
  var ui = SpreadsheetApp.getUi();
  var props = PropertiesService.getScriptProperties();
  var r1 = ui.prompt('Clé ADMIN',
    'Clé pour la page admin (génération, équipes, réglages) :', ui.ButtonSet.OK_CANCEL);
  if (r1.getSelectedButton() !== ui.Button.OK) return;
  props.setProperty('CLE_ADMIN', String(r1.getResponseText()).trim());
  var r2 = ui.prompt('Clé SCORES',
    'Clé pour la page de saisie des scores :', ui.ButtonSet.OK_CANCEL);
  if (r2.getSelectedButton() !== ui.Button.OK) return;
  props.setProperty('CLE_SCORES', String(r2.getResponseText()).trim());
  ui.alert('✅ Clés enregistrées',
    'Les clés ADMIN et SCORES sont définies dans les propriétés du script.', ui.ButtonSet.OK);
}

/** Lit une clé configurée côté serveur. */
function lireCle(nom) {
  return PropertiesService.getScriptProperties().getProperty(nom) || '';
}

/** Vérifie que la requête porte la bonne clé. Renvoie { ok, msg }. */
function verifierCle(requete, nomCle) {
  var attendue = lireCle(nomCle);
  if (!attendue) return { ok: false, msg: 'Clé non configurée sur le serveur — lance configurerCles() dans l\'éditeur.' };
  if (String(requete.cle || '') !== attendue) return { ok: false, msg: 'Clé incorrecte.' };
  return { ok: true };
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
      onglet.getRange(i + 2, 2).setValue(nouveauNom); // colonne 2 = nom_equipe
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
function enregistrerHoraires(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var champs = ['heure_debut', 'heure_fin', 'heure_fin_auto',
                'battement_terrain_min', 'pause_dejeuner_debut', 'pause_dejeuner_duree_min'];
  champs.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/**
 * Enregistre les INFOS du tournoi affichées côté public (carte d'actualité + page d'article) :
 * nom, date, lieu, description. Stockées comme paramètres globaux de l'onglet Config.
 */
function enregistrerInfosTournoi(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var champs = ['tournoi_nom', 'tournoi_date', 'tournoi_lieu', 'tournoi_description'];
  champs.forEach(function (champ) {
    if (data[champ] != null) ecrireParamGlobal(onglet, champ, data[champ]);
  });
  return { ok: true };
}

/**
 * Enregistre l'AFFICHE du tournoi. Reçoit une image encodée en Data URI (base64),
 * la stocke dans Google Drive (fichier public en lecture) et mémorise son identifiant
 * dans Config (`tournoi_affiche_id`). L'affiche précédente est mise à la corbeille.
 * ⚠️ Nécessite l'autorisation d'accès à Google Drive (à accorder une fois au redéploiement).
 * @param data.affiche  chaîne "data:image/...;base64,...."
 */
function enregistrerAffiche(classeur, data) {
  var uri = String(data.affiche || '');
  var m = uri.match(/^data:([^;]+);base64,(.*)$/);
  if (!m) return { error: 'Image invalide (Data URI base64 attendu).' };

  var octets = Utilities.base64Decode(m[2]);
  var blob = Utilities.newBlob(octets, m[1], 'affiche-tournoi');

  var onglet = classeur.getSheetByName('Config');
  var ancienId = (lireConfig(classeur).global || {}).tournoi_affiche_id;
  if (ancienId) { try { DriveApp.getFileById(ancienId).setTrashed(true); } catch (e) {} }

  var fichier = DriveApp.createFile(blob);
  try { fichier.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  ecrireParamGlobal(onglet, 'tournoi_affiche_id', fichier.getId());
  return { ok: true, id: fichier.getId() };
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

function enregistrerCategorie(classeur, data) {
  var nom = (data.categorie || '').toString().trim();
  if (!nom) return { error: 'Nom de catégorie vide.' };
  var onglet = classeur.getSheetByName('Config');
  // Migration douce : garantit la colonne nb_poules (Sheet créé avant cette évolution).
  assurerColonneCategorie(classeur, 'nb_poules');
  var donnees = onglet.getDataRange().getValues();
  var hdr = -1;
  for (var i = 0; i < donnees.length; i++) { if (donnees[i][0] === 'categorie') { hdr = i; break; } }
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
  var hdr = -1;
  for (var i = 0; i < donnees.length; i++) { if (donnees[i][0] === 'categorie') { hdr = i; break; } }
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
 * Attend { id_match, score_A, score_B }. Les scores doivent être des entiers >= 0.
 */
function enregistrerScore(classeur, data) {
  var id = (data.id_match || '').toString().trim();
  if (!id) return { error: 'Identifiant de match manquant.' };

  var sa = validerScore(data.score_A);
  var sb = validerScore(data.score_B);
  if (sa === null) return { error: 'Score A invalide (entier ≥ 0 attendu).' };
  if (sb === null) return { error: 'Score B invalide (entier ≥ 0 attendu).' };

  var onglet = classeur.getSheetByName('Matchs');
  var dernier = onglet.getLastRow();
  if (dernier < 2) return { error: 'Aucun match enregistré.' };

  // On cherche la ligne du match par son identifiant (colonne 1).
  var ids = onglet.getRange(2, 1, dernier - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === id) {
      var ligne = i + 2;
      // Un score déjà validé est DÉFINITIF : on refuse de l'écraser sauf correction explicite.
      var statutActuel = onglet.getRange(ligne, 11).getValue();
      if (estTermineServeur(statutActuel) && data.modification !== true) {
        return { error: 'Ce score est déjà validé (définitif). Utilise « Corriger » pour le modifier.',
                 deja_valide: true };
      }
      // Colonnes de l'onglet Matchs : 9 = score_A, 10 = score_B, 11 = statut.
      onglet.getRange(ligne, 9, 1, 3).setValues([[sa, sb, 'terminé']]);

      // Journal de saison : on archive (ou actualise) ce résultat dans l'onglet Historique.
      // Enveloppé dans un try/catch : l'archivage ne doit JAMAIS empêcher l'enregistrement du score.
      try {
        var v = onglet.getRange(ligne, 1, 1, 12).getValues()[0]; // toute la ligne du match
        archiverResultat(classeur, {
          id_match: v[0], categorie: v[1], phase: v[11],
          equipe_A: v[6], equipe_B: v[7], score_A: sa, score_B: sb
        });
      } catch (errArchive) { Logger.log('Archivage historique ignoré : ' + errArchive); }

      return { ok: true, match: { id_match: id, score_A: sa, score_B: sb, statut: 'terminé' } };
    }
  }
  return { error: 'Match introuvable : ' + id };
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

/* ===================== PHASE APRÈS-MIDI (classement croisé) ===================== */
/**
 * Génère la phase après-midi : matchs de "classement croisé" (les équipes de même rang
 * de poule jouent ensemble, en round-robin), puis les planifie (terrains + horaires)
 * après la pause déjeuner. AJOUTE ces matchs SANS effacer ceux du matin (qui portent les
 * scores). Re-générer remplace uniquement les matchs de la phase "classement".
 */
function genererApresMidi(classeur) {
  var config = lireConfig(classeur);
  var matchs = lireOngletSimple(classeur, 'Matchs');
  var avert = [];

  // Matchs du matin = tout ce qui n'est pas déjà de la phase "classement".
  var matin = matchs.filter(function (m) { return String(m.phase) !== 'classement'; });
  if (matin.length === 0) {
    return { ok: false, error: "Aucun match du matin. Génère d'abord les poules et le planning." };
  }
  // Garde-fou : le classement croisé n'a de sens que si le matin est terminé.
  // Test robuste au NFD (voir estTermineServeur) : sinon des matchs bel et bien
  // joués passeraient pour « non terminés » et bloqueraient à tort la génération.
  var nonTermines = matin.filter(function (m) {
    return !estTermineServeur(m.statut);
  });
  if (nonTermines.length > 0) {
    return { ok: false, error: nonTermines.length + " match(s) du matin ne sont pas encore terminés. "
             + "Saisis tous les scores du matin avant de générer l'après-midi." };
  }

  var classement = calculerClassement(classeur);

  // 1) Fixtures de l'après-midi par catégorie (classement croisé, round-robin par rang).
  var fixturesParCat = {};
  classement.forEach(function (cat) {
    if (cat.poules.length < 2) {
      avert.push('Catégorie ' + cat.categorie + ' : une seule poule, pas de classement croisé possible.');
      return;
    }
    var rangMax = 0;
    cat.poules.forEach(function (p) { if (p.classement.length > rangMax) rangMax = p.classement.length; });
    var fixtures = [];
    for (var r = 0; r < rangMax; r++) {
      var groupe = [];
      cat.poules.forEach(function (p) { if (p.classement[r]) groupe.push(p.classement[r].id_equipe); });
      if (groupe.length < 2) continue; // rang incomplet -> pas de match
      var label = 'N' + (r + 1);
      tourneeToutesRondes(groupe).forEach(function (pr) {
        fixtures.push({ poule: label, equipe_A: pr.a, equipe_B: pr.b, round: pr.round });
      });
    }
    if (fixtures.length) fixturesParCat[cat.categorie] = fixtures;
  });

  // 2) Planifier (terrains + horaires) après la pause déjeuner.
  var plan = planifierApresMidi(config, fixturesParCat, matin);
  avert = avert.concat(plan.avert);

  // 3) Réécrire Matchs = matin (inchangé) + nouveaux matchs d'après-midi.
  // Les identifiants d'après-midi repartent après le dernier id du MATIN (les anciens
  // matchs d'après-midi sont remplacés), pour rester stables d'une régénération à l'autre.
  var maxNum = 0;
  matin.forEach(function (m) {
    var mm = String(m.id_match).match(/^M(\d+)$/);
    if (mm) { var n = parseInt(mm[1], 10); if (n > maxNum) maxNum = n; }
  });
  var lignesAprem = plan.matchs.map(function (m, i) {
    return [ idMatch(maxNum + 1 + i), m.categorie, m.poule, m.terrain, m.heure_debut, m.heure_fin,
             m.equipe_A, m.equipe_B, '', '', 'à venir', 'classement' ];
  });
  var lignesMatin = matin.map(matchObjToRow);
  ecrireMatchs(classeur, lignesMatin.concat(lignesAprem));

  return {
    ok: true,
    nb_matchs_aprem: plan.matchs.length,
    heure_fin_aprem: plan.maxFin > 0 ? minVersHm(plan.maxFin) : '',
    avertissements: avert
  };
}

/**
 * Planifie les matchs de l'après-midi (terrains + horaires) à partir de la reprise
 * (fin de la pause déjeuner), en tenant compte des fins de matchs du matin pour ne pas
 * empiéter (terrain encore occupé, équipe pas encore récupérée).
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

  categories.forEach(function (cat) {
    var liste = (fixturesParCat[cat.categorie] || []).slice();
    if (!liste.length) return;
    liste.sort(function (x, y) { return x.round - y.round; });
    var terrains = String(cat.terrains || '').split(',')
                     .map(function (s) { return s.trim(); }).filter(function (s) { return s !== ''; });
    if (terrains.length === 0) { avert.push('Catégorie ' + cat.categorie + ' : aucun terrain défini (après-midi non planifié).'); return; }
    var duree = dureeMatch(cat);
    var recup = parseInt(cat.recup_entre_matchs_min || '0', 10) || 0;

    // Terrain libre après sa dernière fin du matin + battement (au plus tôt à la reprise).
    terrains.forEach(function (t) {
      if (terrainLibre[t] == null) terrainLibre[t] = Math.max(tReprise, (finTerrain[t] || 0) + battement);
    });

    liste.forEach(function (m) {
      // Équipe disponible après sa récup post-dernier match du matin (au plus tôt à la reprise).
      if (equipeLibre[m.equipe_A] == null) equipeLibre[m.equipe_A] = Math.max(tReprise, (finEquipe[m.equipe_A] || 0) + recup);
      if (equipeLibre[m.equipe_B] == null) equipeLibre[m.equipe_B] = Math.max(tReprise, (finEquipe[m.equipe_B] || 0) + recup);
      var dispoEquipes = Math.max(equipeLibre[m.equipe_A], equipeLibre[m.equipe_B]);
      var terrainChoisi = null, plusTot = Infinity;
      terrains.forEach(function (t) { if (terrainLibre[t] < plusTot) { plusTot = terrainLibre[t]; terrainChoisi = t; } });
      var debut = Math.max(dispoEquipes, terrainLibre[terrainChoisi]);
      var fin = debut + duree;
      if (fin > maxFin) maxFin = fin;
      terrainLibre[terrainChoisi] = fin + battement;
      equipeLibre[m.equipe_A] = fin + recup;
      equipeLibre[m.equipe_B] = fin + recup;
      resultat.push({ categorie: cat.categorie, poule: m.poule, terrain: terrainChoisi,
                      heure_debut: minVersHm(debut), heure_fin: minVersHm(fin),
                      equipe_A: m.equipe_A, equipe_B: m.equipe_B });
    });
  });

  return { matchs: resultat, maxFin: maxFin, avert: avert };
}

/** Transforme un match (objet lu depuis l'onglet) en ligne dans l'ordre des colonnes. */
function matchObjToRow(m) {
  return [ m.id_match, m.categorie, m.poule, m.terrain, m.heure_debut, m.heure_fin,
           m.equipe_A, m.equipe_B,
           (m.score_A == null ? '' : m.score_A),
           (m.score_B == null ? '' : m.score_B),
           m.statut, (m.phase ? m.phase : 'poule') ];
}

/** Réécrit entièrement les lignes de l'onglet Matchs (toutes en texte pour préserver "09:30"). */
function ecrireMatchs(classeur, lignes) {
  var oM = classeur.getSheetByName('Matchs');
  assurerColonnePhase(oM);
  viderDonnees(oM);
  if (lignes.length) {
    var plage = oM.getRange(2, 1, lignes.length, lignes[0].length);
    plage.setNumberFormat('@');
    plage.setValues(lignes);
  }
}

/**
 * S'assure que l'onglet Matchs possède l'en-tête `phase` (migration auto).
 * Sur un Sheet créé avant la session 13, ajoute l'en-tête sans intervention manuelle.
 */
function assurerColonnePhase(oM) {
  var lastCol = Math.max(oM.getLastColumn(), 1);
  var entetes = oM.getRange(1, 1, 1, lastCol).getValues()[0];
  if (entetes.indexOf('phase') === -1) {
    oM.getRange(1, entetes.length + 1).setValue('phase');
  }
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
  var hdr = -1;
  for (var i = 0; i < donnees.length; i++) { if (donnees[i][0] === 'categorie') { hdr = i; break; } }
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

function calculerPlanning(config, equipes, melange) {
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
    var terrains = String(cat.terrains || '').split(',')
                     .map(function (s) { return s.trim(); })
                     .filter(function (s) { return s !== ''; });
    if (terrains.length === 0 && liste.length > 0) avert.push('Catégorie ' + cat.categorie + ' : aucun terrain défini.');
    var duree = dureeMatch(cat);
    var recup = parseInt(cat.recup_entre_matchs_min || '0', 10) || 0;
    liste.forEach(function (m) {
      terrains.forEach(function (t) { if (terrainLibre[t] == null) terrainLibre[t] = tDebut; });
      if (equipeLibre[m.equipe_A] == null) equipeLibre[m.equipe_A] = tDebut;
      if (equipeLibre[m.equipe_B] == null) equipeLibre[m.equipe_B] = tDebut;
      var dispoEquipes = Math.max(equipeLibre[m.equipe_A], equipeLibre[m.equipe_B]);
      var terrainChoisi = null, plusTot = Infinity;
      terrains.forEach(function (t) { if (terrainLibre[t] < plusTot) { plusTot = terrainLibre[t]; terrainChoisi = t; } });
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
 *   • efface les infos publiques du tournoi (nom, date, lieu, description) et met l'affiche
 *     Drive à la corbeille ;
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
  ['tournoi_nom', 'tournoi_date', 'tournoi_lieu', 'tournoi_description', 'tournoi_affiche_id']
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
  var hdr = -1;
  for (var i = 0; i < donnees.length; i++) { if (donnees[i][0] === 'categorie') { hdr = i; break; } }
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

  // Nouveau tournoi = nouvel identifiant de saison. Les résultats déjà archivés du
  // tournoi précédent restent dans l'onglet Historique, tagués avec l'ancien identifiant.
  ecrireParamGlobal(classeur.getSheetByName('Config'), 'tournoi_id',
    Utilities.formatDate(new Date(), classeur.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss'));

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
 * Teste une série d'ajustements possibles et renvoie ceux qui font gagner du temps,
 * avec l'heure de fin simulée et s'ils permettent de tenir le créneau.
 */
function analyserArbitrages(config, equipes, cibleMin) {
  // Simulation en DÉTERMINISTE (melange=false) pour comparer les pistes à isopérimètre :
  // la vraie génération mélange les poules, donc les heures réelles peuvent légèrement
  // différer, mais l'ordre de grandeur des gains reste représentatif.
  var base = finJourneeProjetee(config, equipes, false);
  var candidats = construireCandidats(config, equipes);
  var res = [];
  candidats.forEach(function (cand) {
    var cfg = clonerConfig(config);
    appliquerModif(cfg, cand.modif);
    var fin = finJourneeProjetee(cfg, equipes, false);
    var gain = base - fin;
    if (gain > 0) {
      res.push({ piste: cand.label, heure_fin: minVersHm(fin), gain_min: gain,
                 tient: (fin <= cibleMin), modif: cand.modif });
    }
  });
  res.sort(function (a, b) { return hmVersMin(a.heure_fin) - hmVersMin(b.heure_fin); });
  return res.slice(0, 6);
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
  var base = finMatinProjetee(config, equipes);
  var candidats = construireCandidats(config, equipes);
  var res = [];
  candidats.forEach(function (cand) {
    var cfg = clonerConfig(config);
    appliquerModif(cfg, cand.modif);
    var fin = finMatinProjetee(cfg, equipes);
    var gain = base - fin;
    if (gain > 0) {
      res.push({ piste: cand.label, heure_fin: minVersHm(fin), gain_min: gain,
                 tient: (fin <= cibleMin), modif: cand.modif });
    }
  });
  res.sort(function (a, b) { return hmVersMin(a.heure_fin) - hmVersMin(b.heure_fin); });
  return res.slice(0, 6);
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
      var terrains = String(cat.terrains || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
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
  assurerColonnePhase(oM);
  viderDonnees(oM);
  if (matchsFinaux.length) {
    var plageM = oM.getRange(2, 1, matchsFinaux.length, matchsFinaux[0].length);
    plageM.setNumberFormat('@');
    plageM.setValues(matchsFinaux);
  }
}

function viderDonnees(onglet) {
  var dernier = onglet.getLastRow();
  if (dernier >= 2) {
    onglet.getRange(2, 1, dernier - 1, onglet.getLastColumn()).clearContent();
  }
}
