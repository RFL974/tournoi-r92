/**
 * ============================================================================
 *  TOURNOI R92 — Backend Google Apps Script
 * ============================================================================
 *
 *  Ce fichier contient le code qui vit À L'INTÉRIEUR du Google Sheet du tournoi.
 *  Il sert de "backend" : il lit et écrit dans les onglets du Sheet.
 *
 *  Il contient pour l'instant :
 *   - setupSheet()  : crée les 4 onglets (Equipes, Poules, Matchs, Config) et
 *                     leurs en-têtes. À lancer UNE SEULE FOIS pour préparer la base.
 *   - doGet(e)      : requêtes de LECTURE (renvoie du JSON).
 *   - doPost(e)     : requêtes d'ÉCRITURE (ajouter/supprimer une équipe).
 *
 *  (La génération des poules/planning et la saisie des scores viendront ensuite.)
 * ============================================================================
 */


/**
 * Identifiant du Google Sheet du tournoi (la longue suite de caractères dans l'URL du Sheet,
 * entre "/d/" et "/edit"). On l'indique en clair pour que le script trouve toujours le bon
 * classeur, même si l'éditeur Apps Script a été ouvert en mode "projet indépendant".
 */
var SHEET_ID = '17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U';


/**
 * Définition des en-têtes de chaque onglet, au même endroit pour tout centraliser.
 * Si un jour on veut ajouter/renommer une colonne, on ne touche qu'ici.
 * L'ordre des noms = l'ordre des colonnes (de gauche à droite).
 */
var ENTETES = {
  Equipes: ['id_equipe', 'nom_equipe', 'categorie', 'poule'],

  Poules: ['id_poule', 'categorie', 'nom_poule'],

  Matchs: [
    'id_match', 'categorie', 'poule', 'terrain',
    'heure_debut', 'heure_fin',
    'equipe_A', 'equipe_B',
    'score_A', 'score_B', 'statut'
  ]
  // NB : l'onglet Config est particulier (2 zones), on le construit à part plus bas.
};

/**
 * Couleurs de la charte graphique R92, réutilisées pour styliser les en-têtes.
 */
var COULEUR_FOND_ENTETE = '#0B2138';   // marine
var COULEUR_TEXTE_ENTETE = '#F2F6FB';  // blanc cassé


/**
 * FONCTION PRINCIPALE À LANCER.
 * Crée (ou remet à jour) les 4 onglets et leurs en-têtes.
 * Ne supprime AUCUNE donnée existante dans Equipes / Poules / Matchs :
 * elle ne fait qu'ajouter les onglets et écrire la ligne d'en-tête si besoin.
 */
function setupSheet() {
  // "SpreadsheetApp.openById(SHEET_ID)" = on ouvre le Google Sheet par son identifiant.
  // C'est notre point d'entrée vers toutes les données.
  var classeur = SpreadsheetApp.openById(SHEET_ID);

  // 1) On crée les onglets simples (Equipes, Poules, Matchs) avec leurs en-têtes.
  creerOngletAvecEntetes(classeur, 'Equipes', ENTETES.Equipes);
  creerOngletAvecEntetes(classeur, 'Poules', ENTETES.Poules);
  creerOngletAvecEntetes(classeur, 'Matchs', ENTETES.Matchs);

  // 2) On crée l'onglet Config, qui a une structure spéciale (2 zones).
  creerOngletConfig(classeur);

  // 3) Petit message de confirmation visible dans le Sheet.
  //    (getUi() ouvre une boîte de dialogue ; ne marche que lancé depuis le Sheet.)
  try {
    SpreadsheetApp.getUi().alert(
      '✅ Base prête !',
      'Les 4 onglets (Equipes, Poules, Matchs, Config) ont été créés avec leurs en-têtes.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (e) {
    // Si la fonction est lancée sans interface (rare), on ignore simplement l'alerte.
    Logger.log('Base prête ! Onglets créés avec leurs en-têtes.');
  }
}


/**
 * Crée un onglet s'il n'existe pas déjà, puis écrit/rafraîchit sa ligne d'en-tête.
 * @param {Spreadsheet} classeur  le classeur Google Sheet
 * @param {string} nomOnglet      nom de l'onglet (ex: "Equipes")
 * @param {string[]} entetes      liste des noms de colonnes
 */
function creerOngletAvecEntetes(classeur, nomOnglet, entetes) {
  // getSheetByName renvoie l'onglet s'il existe, sinon "null".
  var onglet = classeur.getSheetByName(nomOnglet);
  if (!onglet) {
    onglet = classeur.insertSheet(nomOnglet); // on le crée
  }

  // On écrit les en-têtes sur la 1re ligne.
  // getRange(ligne, colonne, nbLignes, nbColonnes) sélectionne une zone de cellules.
  // Ici : ligne 1, colonne 1, 1 ligne de haut, autant de colonnes que d'en-têtes.
  var zoneEntete = onglet.getRange(1, 1, 1, entetes.length);
  zoneEntete.setValues([entetes]); // setValues attend un tableau de lignes (d'où [ ... ])

  // Un peu de style pour que la ligne d'en-tête soit lisible (charte R92).
  stylerEntete(zoneEntete);

  // "Fige" la 1re ligne : elle reste visible même en scrollant vers le bas.
  onglet.setFrozenRows(1);
}


/**
 * Construit l'onglet Config, qui contient DEUX zones :
 *   - Zone A (en haut) : réglages globaux de la journée, en 2 colonnes (parametre / valeur)
 *   - Zone B (plus bas) : un tableau, une ligne par catégorie
 * On force le format "texte" pour éviter que Google transforme "09:00" en heure
 * ou "1,2" en nombre décimal.
 */
function creerOngletConfig(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) {
    onglet = classeur.insertSheet('Config');
  }

  // --- ZONE A : réglages globaux (lignes 1 à 5) ---
  var zoneA = [
    ['parametre', 'valeur'],            // ligne 1 : en-têtes
    ['heure_debut', '09:00'],           // ligne 2
    ['heure_fin', '17:00'],             // ligne 3
    ['pause_dejeuner_debut', '12:30'],  // ligne 4
    ['pause_dejeuner_duree_min', '60']  // ligne 5
  ];

  // --- ZONE B : réglages par catégorie (à partir de la ligne 8) ---
  // On saute une ligne vide (ligne 6) pour aérer, puis un titre en ligne 7.
  var ligneDebutZoneB = 8;
  var entetesCategorie = [
    'categorie', 'presente', 'terrains', 'taille_poule_cible',
    'format_mi_temps', 'duree_mi_temps_min', 'pause_mi_temps_min', 'recup_entre_matchs_min'
  ];
  // Quelques lignes d'exemple (tu pourras les modifier/supprimer ensuite).
  var exemplesCategorie = [
    ['U8',  'oui', '1,2', '4', '2', '8',  '2', '15'],
    ['U10', 'oui', '3,4', '4', '2', '10', '2', '15'],
    ['U12', 'oui', '5,6', '4', '2', '12', '3', '15'],
    ['U14', 'oui', '7,8', '4', '2', '15', '3', '20']
  ];

  // IMPORTANT : on met TOUT l'onglet Config au format "texte" AVANT d'écrire,
  // sinon Google convertirait "09:00" en heure et "1,2" en 1.2 (séparateur décimal).
  onglet.getRange(1, 1, 50, 10).setNumberFormat('@'); // '@' = format texte

  // Écriture Zone A
  onglet.getRange(1, 1, zoneA.length, 2).setValues(zoneA);
  stylerEntete(onglet.getRange(1, 1, 1, 2)); // styliser la ligne d'en-tête de la zone A

  // Petit titre pour la zone B (ligne 7)
  onglet.getRange(7, 1).setValue('— Réglages par catégorie —').setFontWeight('bold');

  // Écriture Zone B : en-têtes + exemples
  onglet.getRange(ligneDebutZoneB, 1, 1, entetesCategorie.length).setValues([entetesCategorie]);
  stylerEntete(onglet.getRange(ligneDebutZoneB, 1, 1, entetesCategorie.length));
  onglet.getRange(ligneDebutZoneB + 1, 1, exemplesCategorie.length, entetesCategorie.length)
        .setValues(exemplesCategorie);

  // On élargit un peu les colonnes pour que ce soit lisible.
  onglet.autoResizeColumns(1, entetesCategorie.length);
}


/**
 * Applique le style "en-tête" (fond marine, texte blanc cassé, gras) à une zone.
 * @param {Range} zone  la plage de cellules à styliser
 */
function stylerEntete(zone) {
  zone.setBackground(COULEUR_FOND_ENTETE)
      .setFontColor(COULEUR_TEXTE_ENTETE)
      .setFontWeight('bold');
}


/**
 * ============================================================================
 *  LECTURE DES DONNÉES — l'API qui répond en JSON
 * ============================================================================
 *  Une fois le script déployé en "Web App", Google appelle automatiquement
 *  doGet() chaque fois qu'on ouvre son URL. On lit le paramètre "action" dans
 *  l'URL (ex : ...?action=getEquipes) pour savoir quelle donnée renvoyer.
 * ============================================================================
 */


/**
 * Point d'entrée des requêtes de LECTURE (méthode GET).
 * @param {Object} e  objet fourni par Google ; e.parameter contient les paramètres de l'URL.
 * @return {TextOutput}  une réponse au format JSON.
 */
function doGet(e) {
  // e.parameter = les paramètres de l'URL. Si l'URL n'en a aucun, on met un objet vide.
  var params = (e && e.parameter) ? e.parameter : {};
  var action = params.action || 'ping'; // par défaut : "ping"

  try {
    var classeur = SpreadsheetApp.openById(SHEET_ID);
    var resultat;

    // Selon l'action demandée, on prépare la donnée à renvoyer.
    switch (action) {
      case 'ping':
        // Sert juste à vérifier que la Web App répond bien.
        resultat = { ok: true, message: 'API Tournoi R92 en ligne' };
        break;

      case 'getConfig':
        resultat = lireConfig(classeur);
        break;

      case 'getEquipes':
        resultat = lireOngletSimple(classeur, 'Equipes');
        break;

      case 'getPoules':
        resultat = lireOngletSimple(classeur, 'Poules');
        break;

      case 'getMatchs':
        resultat = lireOngletSimple(classeur, 'Matchs');
        break;

      case 'getAll':
        // Tout d'un coup : pratique pour charger une page entière en un seul appel.
        resultat = {
          config:  lireConfig(classeur),
          equipes: lireOngletSimple(classeur, 'Equipes'),
          poules:  lireOngletSimple(classeur, 'Poules'),
          matchs:  lireOngletSimple(classeur, 'Matchs')
        };
        break;

      default:
        resultat = { error: 'Action inconnue : ' + action };
    }

    return repondreJson(resultat);

  } catch (erreur) {
    // En cas de pépin, on renvoie le message d'erreur en JSON (plus facile à diagnostiquer).
    return repondreJson({ error: String(erreur) });
  }
}


/**
 * Transforme un objet JavaScript en réponse JSON propre.
 * @param {Object} objet  la donnée à renvoyer
 * @return {TextOutput}
 */
function repondreJson(objet) {
  return ContentService
    .createTextOutput(JSON.stringify(objet))
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Lit un onglet "simple" (Equipes, Poules, Matchs) et le transforme en liste d'objets.
 * La 1re ligne fournit les clés (les en-têtes) ; chaque ligne suivante devient un objet.
 * Ex : { id_equipe: 'E01', nom_equipe: 'Suresnes 1', categorie: 'M8', poule: 'A' }
 * @param {Spreadsheet} classeur
 * @param {string} nomOnglet
 * @return {Object[]}
 */
function lireOngletSimple(classeur, nomOnglet) {
  var onglet = classeur.getSheetByName(nomOnglet);
  if (!onglet) return [];

  var donnees = onglet.getDataRange().getValues(); // tableau 2D de toutes les cellules remplies
  if (donnees.length < 2) return []; // seulement l'en-tête (ou vide) => aucune donnée

  var entetes = donnees[0]; // 1re ligne = noms de colonnes
  var lignes = [];

  for (var i = 1; i < donnees.length; i++) {
    var ligne = donnees[i];

    // On saute les lignes entièrement vides.
    var estVide = ligne.every(function (cell) { return cell === '' || cell === null; });
    if (estVide) continue;

    var objet = {};
    for (var c = 0; c < entetes.length; c++) {
      var cle = entetes[c];
      if (cle === '') continue; // colonne sans nom => ignorée
      objet[cle] = ligne[c];
    }
    lignes.push(objet);
  }
  return lignes;
}


/**
 * Lit l'onglet Config (2 zones) et renvoie un objet structuré :
 *   {
 *     global:     { heure_debut: '09:00', heure_fin: '17:00', ... },
 *     categories: [ { categorie: 'M8', presente: 'oui', terrains: '1,2', ... }, ... ]
 *   }
 * @param {Spreadsheet} classeur
 * @return {Object}
 */
function lireConfig(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return { global: {}, categories: [] };

  var donnees = onglet.getDataRange().getValues();

  // 1) Repérer la ligne d'en-têtes de la zone B : celle dont la 1re cellule vaut "categorie".
  var ligneEntetesCat = -1;
  for (var i = 0; i < donnees.length; i++) {
    if (donnees[i][0] === 'categorie') {
      ligneEntetesCat = i;
      break;
    }
  }

  // 2) Zone A (réglages globaux) : paires parametre/valeur au-dessus de la zone B.
  //    On saute la ligne d'en-tête "parametre/valeur", les lignes vides et le titre "— … —".
  var global = {};
  var finZoneA = (ligneEntetesCat === -1) ? donnees.length : ligneEntetesCat;
  for (var r = 1; r < finZoneA; r++) {
    var param = donnees[r][0];
    if (param === '' || param === null) continue;         // ligne vide
    if (String(param).charAt(0) === '—') continue;        // ligne titre "— Réglages… —"
    global[param] = donnees[r][1];
  }

  // 3) Zone B (catégories) : chaque ligne sous les en-têtes devient un objet.
  var categories = [];
  if (ligneEntetesCat !== -1) {
    var entetesCat = donnees[ligneEntetesCat];
    for (var l = ligneEntetesCat + 1; l < donnees.length; l++) {
      var ligne = donnees[l];
      if (ligne[0] === '' || ligne[0] === null) continue; // ligne vide => fin du tableau
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


/**
 * ============================================================================
 *  ÉCRITURE DES DONNÉES — modifie le Sheet (ajout/suppression)
 * ============================================================================
 *  Google appelle doPost() quand une page envoie une requête d'ÉCRITURE.
 *  La page envoie un petit paquet JSON du type { action: 'ajouterEquipe', ... }.
 *  On lit "action" pour savoir quoi faire.
 * ============================================================================
 */

/**
 * Point d'entrée des requêtes d'ÉCRITURE (méthode POST).
 * @param {Object} e  e.postData.contents contient le JSON envoyé par la page.
 * @return {TextOutput}  réponse JSON.
 */
function doPost(e) {
  try {
    // On transforme le texte reçu en objet JavaScript.
    var requete = JSON.parse(e.postData.contents);
    var action = requete.action;

    var classeur = SpreadsheetApp.openById(SHEET_ID);
    var resultat;

    switch (action) {
      case 'ajouterEquipe':
        resultat = ajouterEquipe(classeur, requete.nom_equipe, requete.categorie);
        break;

      case 'supprimerEquipe':
        resultat = supprimerEquipe(classeur, requete.id_equipe);
        break;

      default:
        resultat = { error: 'Action inconnue : ' + action };
    }

    return repondreJson(resultat);

  } catch (erreur) {
    return repondreJson({ error: String(erreur) });
  }
}

/**
 * Ajoute une équipe dans l'onglet Equipes.
 * @param {Spreadsheet} classeur
 * @param {string} nom        nom de l'équipe
 * @param {string} categorie  ex : 'U8'
 * @return {Object}  { ok: true, equipe: {...} } ou { error: '...' }
 */
function ajouterEquipe(classeur, nom, categorie) {
  nom = (nom || '').toString().trim();
  categorie = (categorie || '').toString().trim();

  // Petites vérifications avant d'écrire.
  if (!nom)       return { error: "Le nom de l'équipe est vide." };
  if (!categorie) return { error: 'La catégorie est vide.' };

  var onglet = classeur.getSheetByName('Equipes');
  var id = genererIdEquipe(onglet);

  // appendRow ajoute une ligne à la fin. Colonnes : id, nom, categorie, poule (vide).
  onglet.appendRow([id, nom, categorie, '']);

  return { ok: true, equipe: { id_equipe: id, nom_equipe: nom, categorie: categorie, poule: '' } };
}

/**
 * Supprime une équipe à partir de son identifiant.
 * @param {Spreadsheet} classeur
 * @param {string} id  ex : 'E03'
 * @return {Object}  { ok: true } ou { error: '...' }
 */
function supprimerEquipe(classeur, id) {
  var onglet = classeur.getSheetByName('Equipes');
  var dernier = onglet.getLastRow();
  if (dernier < 2) return { error: 'Aucune équipe à supprimer.' };

  // On lit la colonne des identifiants (colonne 1), à partir de la ligne 2.
  var ids = onglet.getRange(2, 1, dernier - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      onglet.deleteRow(i + 2); // +2 car on a commencé à la ligne 2
      return { ok: true };
    }
  }
  return { error: 'Équipe introuvable : ' + id };
}

/**
 * Fabrique l'identifiant d'équipe suivant (E01, E02, …) en regardant les
 * identifiants déjà présents pour prendre le plus grand + 1.
 * @param {Sheet} onglet  l'onglet Equipes
 * @return {string}
 */
function genererIdEquipe(onglet) {
  var dernier = onglet.getLastRow();
  if (dernier < 2) return 'E01'; // aucune équipe encore

  var valeurs = onglet.getRange(2, 1, dernier - 1, 1).getValues();
  var max = 0;
  valeurs.forEach(function (ligne) {
    var m = String(ligne[0]).match(/^E(\d+)$/); // reconnaît "E" suivi de chiffres
    if (m) {
      var n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  });

  var suivant = max + 1;
  return 'E' + (suivant < 10 ? '0' + suivant : suivant); // E01, E02, …, E10, E11
}
