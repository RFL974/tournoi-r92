/**
 * ============================================================================
 *  TOURNOI R92 — Backend Google Apps Script
 * ============================================================================
 *  - setupSheet()  : crée les 4 onglets (à lancer UNE SEULE FOIS au tout début).
 *  - doGet(e)      : LECTURE (renvoie du JSON).
 *  - doPost(e)     : ÉCRITURE (équipes, réglages, génération des poules/planning).
 * ============================================================================
 */

var SHEET_ID = '17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U';

var ENTETES = {
  Equipes: ['id_equipe', 'nom_equipe', 'categorie', 'poule'],
  Poules: ['id_poule', 'categorie', 'nom_poule'],
  Matchs: ['id_match', 'categorie', 'poule', 'terrain', 'heure_debut', 'heure_fin',
           'equipe_A', 'equipe_B', 'score_A', 'score_B', 'statut', 'phase']
};
var COULEUR_FOND_ENTETE = '#0B2138';
var COULEUR_TEXTE_ENTETE = '#F2F6FB';

/* ⚠️ À ne lancer qu'une fois. Relancer réécrirait l'onglet Config avec les exemples. */
function setupSheet() {
  var classeur = SpreadsheetApp.openById(SHEET_ID);
  creerOngletAvecEntetes(classeur, 'Equipes', ENTETES.Equipes);
  creerOngletAvecEntetes(classeur, 'Poules', ENTETES.Poules);
  creerOngletAvecEntetes(classeur, 'Matchs', ENTETES.Matchs);
  creerOngletConfig(classeur);
  try {
    SpreadsheetApp.getUi().alert('✅ Base prête !', 'Les 4 onglets ont été créés.',
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
  var entetesCategorie = ['categorie', 'presente', 'terrains', 'taille_poule_cible',
    'format_mi_temps', 'duree_mi_temps_min', 'pause_mi_temps_min', 'recup_entre_matchs_min'];
  var exemplesCategorie = [
    ['U8',  'oui', '1,2', '4', '2', '8',  '2', '15'],
    ['U10', 'oui', '3,4', '4', '2', '10', '2', '15'],
    ['U12', 'oui', '5,6', '4', '2', '12', '3', '15'],
    ['U14', 'oui', '7,8', '4', '2', '15', '3', '20']
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
      case 'getAll':
        resultat = {
          config:  lireConfig(classeur),
          equipes: lireOngletSimple(classeur, 'Equipes'),
          poules:  lireOngletSimple(classeur, 'Poules'),
          matchs:  lireOngletSimple(classeur, 'Matchs')
        };
        break;
      case 'getClassement': resultat = calculerClassement(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    return repondreJson(resultat);
  } catch (erreur) { return repondreJson({ error: String(erreur) }); }
}

function repondreJson(objet) {
  return ContentService.createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
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
  try {
    var requete = JSON.parse(e.postData.contents);
    var action = requete.action;

    // Contrôle d'accès : chaque écriture exige la bonne clé (scores selon l'action, sinon admin).
    // Les lectures (doGet) restent ouvertes à tous.
    var nomCle = ACTIONS_SCORES[action] ? 'CLE_SCORES' : 'CLE_ADMIN';
    var acces = verifierCle(requete, nomCle);
    if (!acces.ok) return repondreJson({ error: acces.msg, acces_refuse: true });

    var classeur = SpreadsheetApp.openById(SHEET_ID);
    var resultat;
    switch (action) {
      case 'ajouterEquipe':        resultat = ajouterEquipe(classeur, requete.nom_equipe, requete.categorie); break;
      case 'supprimerEquipe':      resultat = supprimerEquipe(classeur, requete.id_equipe); break;
      case 'enregistrerHoraires':  resultat = enregistrerHoraires(classeur, requete); break;
      case 'enregistrerCategorie': resultat = enregistrerCategorie(classeur, requete); break;
      case 'supprimerCategorie':   resultat = supprimerCategorie(classeur, requete.categorie); break;
      case 'enregistrerScore':     resultat = enregistrerScore(classeur, requete); break;
      case 'genererPoulesEtPlanning': resultat = genererPoulesEtPlanning(classeur); break;
      case 'genererApresMidi':     resultat = genererApresMidi(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    return repondreJson(resultat);
  } catch (erreur) { return repondreJson({ error: String(erreur) }); }
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
  onglet.appendRow([id, nom, categorie, '']);
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

function ecrireParamGlobal(onglet, nom, valeur) {
  var dernier = onglet.getLastRow();
  var donnees = onglet.getRange(1, 1, dernier, 2).getValues();
  for (var i = 0; i < donnees.length; i++) {
    if (donnees[i][0] === nom) {
      var cellule = onglet.getRange(i + 1, 2);
      cellule.setNumberFormat('@');
      cellule.setValue(String(valeur));
      return;
    }
  }
  var insertion = -1;
  for (var r = 1; r < donnees.length; r++) {
    var a = donnees[r][0];
    if (a === '' || a === null || String(a).charAt(0) === '—' || a === 'categorie') {
      insertion = r + 1;
      break;
    }
  }
  if (insertion === -1) insertion = dernier + 1;
  onglet.insertRowsBefore(insertion, 1);
  var plage = onglet.getRange(insertion, 1, 1, 2);
  plage.setNumberFormat('@');
  plage.setValues([[nom, String(valeur)]]);
}

function enregistrerCategorie(classeur, data) {
  var nom = (data.categorie || '').toString().trim();
  if (!nom) return { error: 'Nom de catégorie vide.' };
  var onglet = classeur.getSheetByName('Config');
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

/* ===================== GÉNÉRATION POULES + PLANNING ===================== */

/**
 * Calcule (SANS écrire) les poules, les matchs et leurs horaires.
 * @param {Object} config   { global, categories }
 * @param {Object[]} equipes
 * @param {boolean} melange  true = tirage aléatoire des poules ; false = déterministe
 * @return {Object} { poules, affectationPoule, matchsFinaux, maxFin, avert }
 */
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
      return { ok: true, match: { id_match: id, score_A: sa, score_B: sb, statut: 'terminé' } };
    }
  }
  return { error: 'Match introuvable : ' + id };
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
    var taille = parseInt(cat.taille_poule_cible || '4', 10) || 4;
    var nbPoules = Math.max(1, Math.ceil(eqCat.length / taille));
    var poulesCat = [];
    for (var p = 0; p < nbPoules; p++) {
      compteurPoule++;
      var poule = { id_poule: 'P' + (compteurPoule < 10 ? '0' + compteurPoule : compteurPoule),
                    categorie: cat.categorie, nom_poule: String.fromCharCode(65 + p), equipes: [] };
      poulesCat.push(poule); poules.push(poule);
    }
    eqCat.forEach(function (e, i) {
      var po = poulesCat[i % nbPoules];
      po.equipes.push(e);
      affectationPoule[e.id_equipe] = po.nom_poule;
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
function genererPoulesEtPlanning(classeur) {
  var config = lireConfig(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var global = config.global;

  var r = calculerPlanning(config, equipes, true);
  var avert = r.avert.slice();
  var autoFin = String(global.heure_fin_auto || 'oui').toLowerCase() !== 'non';
  var cible = hmVersMin(global.heure_fin || '18:00');
  var heureFin;
  var suggestions = [];

  if (autoFin) {
    // Heure de fin = fin du dernier match.
    heureFin = (r.maxFin > 0) ? minVersHm(r.maxFin) : (global.heure_fin || '');
    if (r.maxFin > 0) ecrireParamGlobal(classeur.getSheetByName('Config'), 'heure_fin', heureFin);
  } else {
    // Heure de fin fixée manuellement : on prévient si dépassement + on propose des arbitrages.
    heureFin = global.heure_fin || '';
    if (r.maxFin > cible) {
      avert.push('Le planning finit à ' + minVersHm(r.maxFin) + ', après l\'heure de fin (' + heureFin + ').');
      suggestions = analyserArbitrages(config, equipes, cible);
    }
  }

  ecrireGeneration(classeur, r.poules, r.affectationPoule, r.matchsFinaux);

  return {
    ok: true,
    nb_poules: r.poules.length,
    nb_matchs: r.matchsFinaux.length,
    heure_fin: heureFin,
    heure_fin_auto: autoFin,
    heure_fin_projetee: (r.maxFin > 0) ? minVersHm(r.maxFin) : '',
    avertissements: avert,
    suggestions: suggestions
  };
}

/**
 * Teste une série d'ajustements possibles et renvoie ceux qui font gagner du temps,
 * avec l'heure de fin simulée et s'ils permettent de tenir le créneau.
 */
function analyserArbitrages(config, equipes, cibleMin) {
  var base = calculerPlanning(config, equipes, false).maxFin;
  var candidats = construireCandidats(config);
  var res = [];
  candidats.forEach(function (cand) {
    var cfg = clonerConfig(config);
    appliquerModif(cfg, cand.modif);
    var fin = calculerPlanning(cfg, equipes, false).maxFin;
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
function construireCandidats(config) {
  var g = config.global, cands = [];

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
      var tp = parseInt(cat.taille_poule_cible || '4', 10) || 4;
      if (tp > 2) {
        cands.push({ label: nom + ' : poules de ' + (tp - 1) + ' (moins de matchs)',
          modif: { type: 'categorie', categorie: nom, champ: 'taille_poule_cible', valeur: String(tp - 1) } });
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

function tourneeToutesRondes(ids) {
  var matches = [];
  var arr = ids.slice();
  if (arr.length < 2) return matches;
  if (arr.length % 2 === 1) arr.push(null);
  var n = arr.length;
  var liste = arr.slice();
  for (var r = 0; r < n - 1; r++) {
    for (var i = 0; i < n / 2; i++) {
      var a = liste[i], b = liste[n - 1 - i];
      if (a !== null && b !== null) matches.push({ a: a, b: b, round: r });
    }
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
