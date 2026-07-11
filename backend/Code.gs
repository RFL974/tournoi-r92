/**
 * ============================================================================
 *  TOURNOI R92 — Backend Google Apps Script
 * ============================================================================
 *
 *  Ce fichier contient le code qui vit À L'INTÉRIEUR du Google Sheet du tournoi.
 *  Il sert de "backend" : il lit et écrit dans les onglets du Sheet.
 *
 *  POUR L'INSTANT il ne contient qu'une seule fonction : setupSheet().
 *  Son rôle : créer les 4 onglets (Equipes, Poules, Matchs, Config) et y écrire
 *  les en-têtes de colonnes au bon endroit. On la lance UNE SEULE FOIS pour
 *  préparer la base de données.
 *
 *  (Les fonctions de lecture/écriture et la génération du planning viendront
 *   dans les prochaines sessions.)
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
    ['M8',  'oui', '1,2', '4', '2', '10', '2', '15'],
    ['M10', 'oui', '3,4', '4', '2', '12', '3', '15'],
    ['M12', 'non', '5',   '4', '1', '15', '0', '20']
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
