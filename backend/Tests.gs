/**
 * ============================================================================
 *  TESTS BACKEND — Conformité FFR (référentiel RefFFR)
 * ============================================================================
 *  Harnais de test AUTONOME (aucune dépendance, aucun Sheet requis) : on injecte
 *  un référentiel factice dans le cœur PUR `evaluerConformiteFFR` et on vérifie
 *  ses sorties, plus les helpers de date `normaliserDateISO` / `normaliserMois`.
 *
 *  ▶ Pour lancer : ouvrir l'éditeur Apps Script, sélectionner la fonction
 *    `lancerTestsFFR` puis « Exécuter ». Le détail (OK / FAIL) et le compteur
 *    final s'affichent dans le journal (Affichage ▸ Journaux / Exécutions).
 *
 *  Ces tests ne touchent NI au classeur, NI aux données réelles : ils sont sans
 *  effet de bord et peuvent être relancés à volonté.
 * ============================================================================
 */

/** Point d'entrée : lance tous les tests de conformité FFR et journalise le bilan. */
function lancerTestsFFR() {
  var etat = { total: 0, ok: 0, fail: 0, echecs: [] };

  testFFR_dateLibre(etat);
  testFFR_blocageDirect(etat);
  testFFR_blocage72h_8mai2027(etat);
  testFFR_filtrageZone(etat);
  testFFR_filtrageCategorie(etat);
  testFFR_referentielAbsent(etat);
  testFFR_formesNonEtLimite(etat);
  testFFR_appariementCategorie(etat);
  testFFR_minEquipes(etat);
  testFFR_couvertureDateAvant(etat);
  testFFR_couvertureDateApres(etat);
  testFFR_couvertureDateDansPlage(etat);
  testFFR_couvertureBornes(etat);
  testFFR_couvertureRefAbsent(etat);
  testFFR_normaliserDateISO(etat);
  testFFR_normaliserMois(etat);

  // Config publique (listes blanches opt-in) + jetons du dossier club.
  testCfg_vueLiveMinimale(etat);
  testCfg_champInconnuNeSortPas(etat);
  testCfg_vueInconnueEstRestrictive(etat);
  testCfg_vueClubContientLesContacts(etat);
  testCfg_categoriesFiltrees(etat);
  testCfg_jetonDossier(etat);

  // Référentiel FFR — règles de jeu et grilles de temps (session 5).
  testS5_eclaterForme(etat);
  testS5_eclaterEffectif(etat);
  testS5_eclaterProduit(etat);
  testS5_antiCollisionSevens(etat);
  testS5_plafondJamais42(etat);
  testS5_jointNonJamaisPropose(etat);
  testS5_m15fJamaisPropose(etat);
  testS5_m12u12MemeLigne(etat);
  testS5_referentielReglesAbsent(etat);
  testS5_grilleDeuxVariantes(etat);
  testS5_nbEquipesSansLigneMuet(etat);
  testS5_comptesExposes(etat);

  var bilan = 'R92 — ' + etat.ok + '/' + etat.total + ' OK, ' + etat.fail + ' FAIL';
  Logger.log('==============================================');
  Logger.log(bilan);
  if (etat.fail) { Logger.log('Échecs : ' + etat.echecs.join(' | ')); }
  Logger.log('==============================================');
  return bilan;
}

/* -------------------------------------------------------------------------- */
/*  Petites briques d'assertion                                               */
/* -------------------------------------------------------------------------- */

function _ffrAssert(etat, condition, libelle) {
  etat.total++;
  if (condition) {
    etat.ok++;
    Logger.log('  OK   ' + libelle);
  } else {
    etat.fail++;
    etat.echecs.push(libelle);
    Logger.log('  FAIL ' + libelle);
  }
}

/** Vrai si un bloquant porte exactement cette date ISO. */
function _ffrABloquantDate(res, dateISO) {
  return res.bloquants.some(function (b) { return b.date === dateISO; });
}

/** Vrai si un avertissement porte exactement cette date ISO. */
function _ffrAAvertDate(res, dateISO) {
  return res.avertissements.some(function (a) { return a.date === dateISO; });
}

/* -------------------------------------------------------------------------- */
/*  Référentiel factice partagé par les tests                                 */
/* -------------------------------------------------------------------------- */

/**
 * Construit un référentiel injectable { formes, dates, millesime }. Le référentiel reste
 * FIDÈLE À LA SOURCE FFR (notation M8/M10/M12/M14) : les tests vérifient donc aussi que
 * l'appariement M↔U fonctionne face aux catégories de l'app (U8/U10…).
 */
function _ffrRefFactice() {
  return {
    millesime: '2026-2027',
    formes: [
      { categorie: 'M10', mois: '2027-01', forme_jeu: 'RE',  effectif: '7x7',   tournoi_autorise: 'OUI',    note: '',                     millesime: '2026-2027' },
      { categorie: 'M8',  mois: '2027-01', forme_jeu: 'BABY', effectif: '',      tournoi_autorise: 'NON',    note: '',                     millesime: '2026-2027' },
      { categorie: 'M12', mois: '2027-05', forme_jeu: 'T+2',  effectif: '10x10', tournoi_autorise: 'LIMITE', note: 'Format limité en mai', millesime: '2026-2027' }
    ],
    dates: [
      // Date fédérale directe (toutes zones, toutes catégories).
      { date: '2027-01-16', type: 'PLATEAU_DPT', libelle: 'Plateau départemental', zone: '', categories: '', bloque_tournoi_club: 'OUI', millesime: '2026-2027' },
      // 8 mai 2027 : Rugby pour Elles le jeudi 6 mai (2 jours avant) => fenêtre 72 h.
      { date: '2027-05-06', type: 'CHALL_RPE', libelle: 'Rugby pour Elles', zone: '', categories: '', bloque_tournoi_club: 'OUI', millesime: '2026-2027' },
      // 1er mai 2027 : à 7 jours du 8 mai => NE DOIT PAS percuter.
      { date: '2027-05-01', type: 'DIVERS', libelle: 'Journée lointaine', zone: '', categories: '', bloque_tournoi_club: 'OUI', millesime: '2026-2027' },
      // Date filtrée par ZONE (uniquement A et B).
      { date: '2027-02-20', type: 'CF_P2', libelle: 'Zone A/B seulement', zone: 'A,B', categories: '', bloque_tournoi_club: 'OUI', millesime: '2026-2027' },
      // Date filtrée par CATÉGORIE (M14 dans la source FFR → doit s'apparier à U14 de l'app).
      { date: '2027-03-14', type: 'SCF_P3', libelle: 'M14 seulement', zone: '', categories: 'M14', bloque_tournoi_club: 'OUI', millesime: '2026-2027' }
    ]
  };
}

/* -------------------------------------------------------------------------- */
/*  Cas de test                                                               */
/* -------------------------------------------------------------------------- */

/** Date sans conflit : aucun bloquant, aucun avertissement, référentiel présent. */
function testFFR_dateLibre(etat) {
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2027-06-13', ['U10'], 'C');
  _ffrAssert(etat, res.refDisponible === true, 'dateLibre : refDisponible=true');
  _ffrAssert(etat, res.bloquants.length === 0, 'dateLibre : aucun bloquant');
  _ffrAssert(etat, res.avertissements.length === 0, 'dateLibre : aucun avertissement');
}

/** Date fédérale exactement le jour du tournoi => bloquant. */
function testFFR_blocageDirect(etat) {
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2027-01-16', ['U10'], 'C');
  _ffrAssert(etat, _ffrABloquantDate(res, '2027-01-16'), 'blocageDirect : bloquant le 2027-01-16');
}

/** Règle des 72 h : tournoi 8 mai 2027 bloqué par le 6 mai (2 j) ; le 1er mai (7 j) ignoré. */
function testFFR_blocage72h_8mai2027(etat) {
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2027-05-08', ['U10'], 'C');
  _ffrAssert(etat, _ffrABloquantDate(res, '2027-05-06'), '72h : bloquant le 2027-05-06 (jeudi, 2 j avant)');
  _ffrAssert(etat, !_ffrABloquantDate(res, '2027-05-01'), '72h : le 2027-05-01 (7 j) ne percute pas');
}

/** Filtrage par zone : une date zone A/B ne bloque pas un tournoi en zone C ; en zone A, si. */
function testFFR_filtrageZone(etat) {
  var enC = evaluerConformiteFFR(_ffrRefFactice(), '2027-02-20', ['U10'], 'C');
  _ffrAssert(etat, !_ffrABloquantDate(enC, '2027-02-20'), 'filtrageZone : zone C non concernée par une date A/B');
  var enA = evaluerConformiteFFR(_ffrRefFactice(), '2027-02-20', ['U10'], 'A');
  _ffrAssert(etat, _ffrABloquantDate(enA, '2027-02-20'), 'filtrageZone : zone A concernée par une date A/B');
}

/** Filtrage par catégorie : une date U14 ne bloque pas un tournoi U10 seul ; avec U14, si. */
function testFFR_filtrageCategorie(etat) {
  var sansU14 = evaluerConformiteFFR(_ffrRefFactice(), '2027-03-14', ['U10'], 'C');
  _ffrAssert(etat, !_ffrABloquantDate(sansU14, '2027-03-14'), 'filtrageCategorie : U10 seul non concerné par une date U14');
  var avecU14 = evaluerConformiteFFR(_ffrRefFactice(), '2027-03-14', ['U10', 'U14'], 'C');
  _ffrAssert(etat, _ffrABloquantDate(avecU14, '2027-03-14'), 'filtrageCategorie : U14 présent => concerné');
}

/** Référentiel absent (migration douce) : refDisponible=false, listes vides. */
function testFFR_referentielAbsent(etat) {
  var res = evaluerConformiteFFR({ formes: [], dates: [] }, '2027-01-16', ['U10'], 'C');
  _ffrAssert(etat, res.refDisponible === false, 'refAbsent : refDisponible=false');
  _ffrAssert(etat, res.bloquants.length === 0 && res.avertissements.length === 0, 'refAbsent : aucun contrôle appliqué');
}

/** Formes de jeu : tournoi_autorise NON => bloquant ; LIMITE => avertissement (texte de note). */
function testFFR_formesNonEtLimite(etat) {
  // U8 en janvier 2027 : forme BABY, tournoi_autorise NON => bloquant.
  var jan = evaluerConformiteFFR(_ffrRefFactice(), '2027-01-23', ['U8'], 'C');
  _ffrAssert(etat, jan.bloquants.length >= 1, 'formes : U8 janvier (NON) => bloquant');
  _ffrAssert(etat, jan.formes.U8 && jan.formes.U8.tournoi_autorise === 'NON', 'formes : formes.U8.tournoi_autorise=NON');
  // U12 en mai 2027 : LIMITE => avertissement reprenant la note.
  var mai = evaluerConformiteFFR(_ffrRefFactice(), '2027-05-15', ['U12'], 'C');
  var aNoteLimite = mai.avertissements.some(function (a) { return a.motif === 'Format limité en mai'; });
  _ffrAssert(etat, aNoteLimite, 'formes : U12 mai (LIMITE) => avertissement avec la note');
  _ffrAssert(etat, mai.formes.U12 && mai.formes.U12.forme_jeu === 'T+2', 'formes : formes.U12.forme_jeu=T+2');
}

/** Appariement M↔U : une forme M10 (source FFR) doit s'apparier à U10 (catégorie de l'app). */
function testFFR_appariementCategorie(etat) {
  // 23 janvier 2027 : aucune date fédérale ce jour-là → on isole la règle des formes.
  const res = evaluerConformiteFFR(_ffrRefFactice(), '2027-01-23', ['U10'], 'C');
  _ffrAssert(etat, !!res.formes.U10, 'appariement : M10 (référentiel) s\'apparie à U10 (app)');
  _ffrAssert(etat, res.formes.U10 && res.formes.U10.forme_jeu === 'RE', 'appariement : forme M10 → RE remontée pour U10');
  // Catégorie inconnue du référentiel : aucune forme trouvée, aucune exception levée.
  const inconnu = evaluerConformiteFFR(_ffrRefFactice(), '2027-01-23', ['U18'], 'C');
  _ffrAssert(etat, !inconnu.formes.U18, 'appariement : catégorie inconnue → pas de forme');
  _ffrAssert(etat, inconnu.bloquants.length === 0, 'appariement : catégorie inconnue → aucun bloquant');
}

/** Minimum 3 équipes : 0 équipe → avertissement (ignorée) ; 1 ou 2 équipes → blocage. */
function testFFR_minEquipes(etat) {
  const config = { categories: [
    { categorie: 'U8',  presente: 'oui' }, // 0 équipe  → vides
    { categorie: 'U10', presente: 'oui' }, // 2 équipes → bloque
    { categorie: 'U12', presente: 'oui' }, // 3 équipes → OK
    { categorie: 'U14', presente: 'non' }  // absente   → ignorée
  ] };
  const equipes = [
    { categorie: 'U10' }, { categorie: 'U10' },
    { categorie: 'U12' }, { categorie: 'U12' }, { categorie: 'U12' },
    { categorie: 'U14' } // présente à l'onglet mais catégorie non présente → ignorée
  ];
  const r = analyserEffectifsCategories(config, equipes);
  const estVide = r.vides.indexOf('U8') !== -1;
  const bloqueU10 = r.bloque.some(function (m) { return m.categorie === 'U10' && m.nb === 2; });
  const u12OK = !r.bloque.some(function (m) { return m.categorie === 'U12'; }) && r.vides.indexOf('U12') === -1;
  _ffrAssert(etat, estVide, 'minEquipes : U8 (0 équipe) → avertissement (vides), pas de blocage');
  _ffrAssert(etat, r.bloque.length === 1 && bloqueU10, 'minEquipes : U10 (2 équipes) → blocage dur');
  _ffrAssert(etat, u12OK, 'minEquipes : U12 (3 équipes) → ni bloquée ni vide');
}

/* -------------------------------------------------------------------------- */
/*  Couverture de saison du référentiel                                       */
/*  Le référentiel factice porte le millésime '2026-2027' → saison couverte   */
/*  du 2026-07-01 au 2027-06-30 inclus, indépendamment des lignes datées.     */
/* -------------------------------------------------------------------------- */

/** Vrai si un avertissement de COUVERTURE (hors saison) a été poussé. */
function _ffrAAvertCouverture(res) {
  return (res.avertissements || []).some(function (a) { return a && a.couverture === true; });
}

/** Date AVANT la saison (30/06/2026, veille du 01/07) ⇒ hors couverture + avertissement. */
function testFFR_couvertureDateAvant(etat) {
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2026-06-30', ['U10'], 'C');
  _ffrAssert(etat, res.couverture && res.couverture.couverte === false, 'couvAvant : couverte=false');
  _ffrAssert(etat, _ffrAAvertCouverture(res), 'couvAvant : avertissement de couverture poussé');
}

/** Date APRÈS la saison (01/07/2027, lendemain du 30/06) ⇒ hors couverture + avertissement. */
function testFFR_couvertureDateApres(etat) {
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2027-07-01', ['U10'], 'C');
  _ffrAssert(etat, res.couverture && res.couverture.couverte === false, 'couvApres : couverte=false');
  _ffrAssert(etat, _ffrAAvertCouverture(res), 'couvApres : avertissement de couverture poussé');
}

/** Date DANS la saison (01/03/2027) ⇒ couverte=true et aucun avertissement de couverture. */
function testFFR_couvertureDateDansPlage(etat) {
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2027-03-01', ['U10'], 'C');
  _ffrAssert(etat, res.couverture && res.couverture.couverte === true, 'couvDans : couverte=true');
  _ffrAssert(etat, !_ffrAAvertCouverture(res), 'couvDans : aucun avertissement de couverture');
}

/** Bornes INCLUSES : 01/07/2026 (début) puis 30/06/2027 (fin) ⇒ couverte=true dans les deux cas. */
function testFFR_couvertureBornes(etat) {
  var debut = evaluerConformiteFFR(_ffrRefFactice(), '2026-07-01', ['U10'], 'C');
  _ffrAssert(etat, debut.couverture && debut.couverture.couverte === true, 'couvBornes : début (01/07/2026) inclus');
  var fin = evaluerConformiteFFR(_ffrRefFactice(), '2027-06-30', ['U10'], 'C');
  _ffrAssert(etat, fin.couverture && fin.couverture.couverte === true, 'couvBornes : fin (30/06/2027) incluse');
}

/** Référentiel absent : refDisponible=false, couverture.couverte=false, aucune exception. */
function testFFR_couvertureRefAbsent(etat) {
  var res = evaluerConformiteFFR({ formes: [], dates: [] }, '2027-03-01', ['U10'], 'C');
  _ffrAssert(etat, res.refDisponible === false, 'couvRefAbsent : refDisponible=false');
  _ffrAssert(etat, res.couverture && res.couverture.couverte === false, 'couvRefAbsent : couverte=false');
}

/** normaliserDateISO : chaîne ISO, chaîne datetime, objet Date, entrées invalides. */
function testFFR_normaliserDateISO(etat) {
  _ffrAssert(etat, normaliserDateISO('2027-01-16') === '2027-01-16', 'normaliserDateISO : chaîne ISO');
  _ffrAssert(etat, normaliserDateISO('2027-01-16T09:30:00.000Z') === '2027-01-16', 'normaliserDateISO : chaîne datetime');
  _ffrAssert(etat, normaliserDateISO('16/01/2027') === '2027-01-16', 'normaliserDateISO : chaîne JJ/MM/AAAA');
  // Objet Date (composantes LOCALES) — le 8 mai 2027.
  _ffrAssert(etat, normaliserDateISO(new Date(2027, 4, 8)) === '2027-05-08', 'normaliserDateISO : objet Date');
  _ffrAssert(etat, normaliserDateISO('') === '', 'normaliserDateISO : vide => vide');
  _ffrAssert(etat, normaliserDateISO('pas une date') === '', 'normaliserDateISO : invalide => vide');
}

/** normaliserMois : chaîne puis objet Date. */
function testFFR_normaliserMois(etat) {
  _ffrAssert(etat, normaliserMois('2027-05-08') === '2027-05', 'normaliserMois : chaîne');
  _ffrAssert(etat, normaliserMois(new Date(2027, 4, 8)) === '2027-05', 'normaliserMois : objet Date');
  _ffrAssert(etat, normaliserMois('') === '', 'normaliserMois : vide => vide');
}

/* -------------------------------------------------------------------------- */
/*  Config publique (listes blanches opt-in) + jetons du dossier club         */
/*  filtrerConfigPublique est PURE (config injecté) ; les jetons passent par   */
/*  un FAUX classeur (aucun Sheet réel, aucun effet de bord).                  */
/* -------------------------------------------------------------------------- */

/** Les huit champs personnels de la zone A — aucun ne doit sortir en vue live/invitation. */
var _CFG_CHAMPS_PERSO = ['referent_nom', 'referent_tel', 'securite_referent_nom',
  'securite_referent_tel', 'contact_reponse_nom', 'contact_reponse_tel',
  'contact_reponse_email', 'email_expediteur'];

/** Config factice complète (tous les champs personnels + un champ inventé + des non sensibles). */
function _cfgFactice() {
  return {
    global: {
      referent_nom: 'Jean Dupont', referent_tel: '0612345678',
      securite_referent_nom: 'Paul Martin', securite_referent_tel: '0623456789',
      contact_reponse_nom: 'Anne', contact_reponse_tel: '0634567890',
      contact_reponse_email: 'contact@club.fr', email_expediteur: 'envoi@club.fr',
      tournoi_nom: 'Tournoi Test', tournoi_date: '2027-06-13',
      url_instagram: 'https://insta', repartition_grands_terrains: '{}',
      champ_invente_futur: 'DONNEE A VENIR'
    },
    categories: [
      { categorie: 'U10', presente: 'oui', format_apresmidi: 'CROISE',
        effectif_min: '5', max_equipes_par_club: '2', colonne_secrete: 'X' }
    ]
  };
}

/** Vue live : AUCUN des huit champs personnels ; les champs non sensibles attendus présents. */
function testCfg_vueLiveMinimale(etat) {
  var live = filtrerConfigPublique(_cfgFactice(), 'live');
  var fuite = _CFG_CHAMPS_PERSO.some(function (k) { return live.global.hasOwnProperty(k); });
  _ffrAssert(etat, !fuite, 'vueLive : aucun des 8 champs personnels');
  _ffrAssert(etat, live.global.tournoi_nom === 'Tournoi Test', 'vueLive : tournoi_nom présent');
  _ffrAssert(etat, live.global.repartition_grands_terrains === '{}', 'vueLive : repartition_grands_terrains présent');
}

/** LE test clé : un champ INVENTÉ, absent de toutes les listes, ne sort dans AUCUNE vue. */
function testCfg_champInconnuNeSortPas(etat) {
  ['live', 'invitation', 'club'].forEach(function (vue) {
    var r = filtrerConfigPublique(_cfgFactice(), vue);
    _ffrAssert(etat, !r.global.hasOwnProperty('champ_invente_futur'),
      'champInconnu : absent en vue ' + vue + ' (protège les données à venir)');
  });
}

/** Vue inconnue ⇒ vue la plus fermée (live) : un champ propre à invitation n'apparaît pas. */
function testCfg_vueInconnueEstRestrictive(etat) {
  var inconnue = filtrerConfigPublique(_cfgFactice(), 'vue_qui_nexiste_pas');
  _ffrAssert(etat, !inconnue.global.hasOwnProperty('url_instagram'),
    'vueInconnue : url_instagram (invitation) absent → repli live');
  _ffrAssert(etat, inconnue.global.tournoi_nom === 'Tournoi Test',
    'vueInconnue : sert bien la vue live (tournoi_nom présent)');
  var fuite = _CFG_CHAMPS_PERSO.some(function (k) { return inconnue.global.hasOwnProperty(k); });
  _ffrAssert(etat, !fuite, 'vueInconnue : aucun champ personnel');
}

/** Vue club : contient bien les contacts jour J dont le dossier a besoin ; pas le champ inventé. */
function testCfg_vueClubContientLesContacts(etat) {
  var club = filtrerConfigPublique(_cfgFactice(), 'club');
  _ffrAssert(etat, club.global.referent_nom === 'Jean Dupont', 'vueClub : referent_nom présent');
  _ffrAssert(etat, club.global.referent_tel === '0612345678', 'vueClub : referent_tel présent (lien tel:)');
  _ffrAssert(etat, club.global.securite_referent_tel === '0623456789', 'vueClub : securite_referent_tel présent');
  // contact_reponse_email n'est PAS dans la vue club (il vit dans la vue invitation).
  _ffrAssert(etat, !club.global.hasOwnProperty('email_expediteur'), 'vueClub : email_expediteur jamais exposé');
}

/** Catégories : une colonne non listée ne sort pas ; les colonnes attendues sortent. */
function testCfg_categoriesFiltrees(etat) {
  var inv = filtrerConfigPublique(_cfgFactice(), 'invitation');
  var c = inv.categories[0] || {};
  _ffrAssert(etat, !c.hasOwnProperty('colonne_secrete'), 'categoriesFiltrees : colonne non listée absente');
  _ffrAssert(etat, c.categorie === 'U10', 'categoriesFiltrees : categorie présente');
  _ffrAssert(etat, c.max_equipes_par_club === '2', 'categoriesFiltrees : max_equipes_par_club présent (invitation)');
  // La vue live ne garde que categorie/presente : format_apresmidi ne sort pas.
  var live = filtrerConfigPublique(_cfgFactice(), 'live');
  _ffrAssert(etat, !(live.categories[0] || {}).hasOwnProperty('format_apresmidi'),
    'categoriesFiltrees : format_apresmidi absent en vue live');
}

/* --- Jetons : faux classeur (getSheetByName → getDataRange → getValues), sans Sheet réel --- */

function _cfgFakeSheet(rows) {
  return { getDataRange: function () { return { getValues: function () { return rows; } }; } };
}
function _cfgFakeClasseur() {
  // Onglet Config : ligne 0 ignorée par lireConfig (boucle r=1) ; puis paramètres ; puis en-tête
  // « categorie » de la zone B ; puis une catégorie.
  var config = [
    ['— Réglages —', ''],
    ['referent_nom', 'Jean Dupont'],
    ['referent_tel', '0612345678'],
    ['contact_reponse_email', 'contact@club.fr'],
    ['tournoi_nom', 'Tournoi Test'],
    ['categorie', 'presente', 'format_apresmidi'],
    ['U10', 'oui', 'CROISE']
  ];
  var clubs = [
    ['club_nom', 'club_contact_prenom', 'categories_engagees', 'club_token'],
    ['Suresnes', 'Marie', 'U10,U12', 'TOKEN-VALIDE-123']
  ];
  return { getSheetByName: function (nom) {
    if (nom === 'Config') return _cfgFakeSheet(config);
    if (nom === 'ClubsInvites') return _cfgFakeSheet(clubs);
    return null;
  } };
}

/** getClubDossier / getConfigClub : jeton absent, invalide, valide. */
function testCfg_jetonDossier(etat) {
  var cl = _cfgFakeClasseur();
  // Jeton ABSENT → erreur générique, aucune donnée.
  var d0 = getClubDossier(cl, { club: 'Suresnes', token: '' });
  _ffrAssert(etat, !!d0.error && !d0.club, 'jeton : getClubDossier sans jeton → erreur');
  var c0 = getConfigClub(cl, { club: 'Suresnes', token: '' });
  _ffrAssert(etat, !!c0.error && !c0.config, 'jeton : getConfigClub sans jeton → erreur');
  // Jeton INVALIDE → erreur.
  var d1 = getClubDossier(cl, { club: 'Suresnes', token: 'MAUVAIS' });
  _ffrAssert(etat, !!d1.error, 'jeton : getClubDossier jeton invalide → erreur');
  var c1 = getConfigClub(cl, { club: 'Suresnes', token: 'MAUVAIS' });
  _ffrAssert(etat, !!c1.error, 'jeton : getConfigClub jeton invalide → erreur');
  // Jeton VALIDE → données servies, vue club filtrée.
  var d2 = getClubDossier(cl, { club: 'Suresnes', token: 'TOKEN-VALIDE-123' });
  _ffrAssert(etat, d2.ok && d2.club && d2.club.club_nom === 'Suresnes', 'jeton : getClubDossier jeton valide → club');
  var c2 = getConfigClub(cl, { club: 'Suresnes', token: 'TOKEN-VALIDE-123' });
  _ffrAssert(etat, c2.ok && c2.config && c2.config.global.referent_nom === 'Jean Dupont',
    'jeton : getConfigClub jeton valide → config club (referent_nom)');
  _ffrAssert(etat, c2.config && !c2.config.global.hasOwnProperty('email_expediteur'),
    'jeton : getConfigClub ne fuit jamais email_expediteur');
}

/* -------------------------------------------------------------------------- */
/*  Référentiel FFR — règles de jeu (RefFFR_Regles) et temps (RefFFR_Temps)   */
/*  Fixture dédiée, valeurs TEXTE (comme le classeur réel). Le piège Sevens    */
/*  (M14/7x7, nb_demi_journees vide, plafond 42) est inclus exprès.            */
/* -------------------------------------------------------------------------- */

function _ffrRefS5() {
  return {
    millesime: '2026-2027',
    dates: [],
    formes: [
      // M14 septembre : T+2 et JCO en 7x7 (deux formes, un effectif).
      { categorie: 'M14', mois: '2026-09', forme_jeu: 'T+2|JCO', effectif: '7x7', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' },
      // M12 décembre : Rugby Éducatif 10x10.
      { categorie: 'M12', mois: '2026-12', forme_jeu: 'RE', effectif: '10x10', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' }
    ],
    regles: [
      // M14 / 7x7 : Toucher+2 et Jouer au contact, JOINTS (valeurs structurantes identiques).
      { categorie: 'M14', forme_jeu: 'T+2', effectif: '7x7', effectif_terrain: '7', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      { categorie: 'M14', forme_jeu: 'JCO', effectif: '7x7', effectif_terrain: '7', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      // M14 / SEVENS / 7x7 : compétition, NON joignable — ne doit JAMAIS être proposé.
      { categorie: 'M14', forme_jeu: 'SEVENS', effectif: '7x7', effectif_terrain: '7', effectif_max_feuille: '12', terrain_longueur_m: '100', terrain_largeur_m: '70', terrain_libelle: '', ballon: 'T5', carton_jaune_min: '5', contexte: 'COMPETITION', joint_refffr_formes: 'NON', millesime: '2026-2027' },
      // M15F / RE / 10x10 : catégorie absente de RefFFR_Formes, NON joignable.
      { categorie: 'M15F', forme_jeu: 'RE', effectif: '10x10', effectif_terrain: '10', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'CHALLENGE', joint_refffr_formes: 'NON', millesime: '2026-2027' },
      // M12 / RE / 10x10 : joignable (sert aussi au test M12/U12).
      { categorie: 'M12', forme_jeu: 'RE', effectif: '10x10', effectif_terrain: '10', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' }
    ],
    temps: [
      // PIÈGE Sevens M14/7x7 : nb_demi_journees VIDE, plafond 42 → doit être ignoré.
      { categorie: 'M14', effectif: '7x7', nb_demi_journees: '', nb_equipes: '', nb_periodes: '', duree_periode_min: '', pause_periodes_min: '', arret_entre_matchs_min: '', plafond_joueur_min: '42', variante: '', millesime: '2026-2027' },
      // Grille légitime M14/7x7, 1 demi-journée, 6 équipes : plafond 65.
      { categorie: 'M14', effectif: '7x7', nb_demi_journees: '1', nb_equipes: '6', nb_periodes: '2', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: '', rencontres_par_equipe: '5', nb_rencontres_total: '15', organisation_poules: '', millesime: '2026-2027' },
      // M12/10x10, 1 demi-journée, 3 équipes : DEUX variantes (A et B), même plafond 65.
      { categorie: 'M12', effectif: '10x10', nb_demi_journees: '1', nb_equipes: '3', nb_periodes: '3', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: 'A', rencontres_par_equipe: '2', nb_rencontres_total: '3', organisation_poules: '1 poule de 3', millesime: '2026-2027' },
      { categorie: 'M12', effectif: '10x10', nb_demi_journees: '1', nb_equipes: '3', nb_periodes: '2', duree_periode_min: '15', pause_periodes_min: '2', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: 'B', rencontres_par_equipe: '2', nb_rencontres_total: '3', organisation_poules: '1 poule de 3', millesime: '2026-2027' }
    ]
  };
}

/** eclaterFormesFFR : forme_jeu 'T+2|JCO' + effectif simple → 2 entrées. */
function testS5_eclaterForme(etat) {
  var r = eclaterFormesFFR({ categorie: 'M10', forme_jeu: 'T+2|JCO', effectif: '5x5' });
  _ffrAssert(etat, r.length === 2, 'eclater : T+2|JCO / 5x5 → 2 entrées');
  _ffrAssert(etat, r[0].forme_jeu === 'T+2' && r[1].forme_jeu === 'JCO' && r[0].effectif === '5x5',
    'eclater : formes séparées, effectif porté');
}

/** eclaterFormesFFR : effectif '10x10|15x15' + forme simple → 2 entrées. */
function testS5_eclaterEffectif(etat) {
  var r = eclaterFormesFFR({ categorie: 'M14', forme_jeu: 'RE', effectif: '10x10|15x15' });
  _ffrAssert(etat, r.length === 2, 'eclater : RE / 10x10|15x15 → 2 entrées');
  _ffrAssert(etat, r[0].effectif === '10x10' && r[1].effectif === '15x15',
    'eclater : effectifs séparés');
}

/** eclaterFormesFFR : les deux multiples → produit cartésien (4 entrées). */
function testS5_eclaterProduit(etat) {
  var r = eclaterFormesFFR({ categorie: 'M14', forme_jeu: 'T+2|JCO', effectif: '10x10|15x15' });
  _ffrAssert(etat, r.length === 4, 'eclater : produit cartésien 2×2 → 4 entrées');
}

/** Anti-collision : M14 + 7x7 en septembre ne remonte JAMAIS la règle Sevens (joint=NON). */
function testS5_antiCollisionSevens(etat) {
  var res = evaluerConformiteFFR(_ffrRefS5(), '2026-09-19', ['U14'], 'C',
    { equipesParCategorie: { U14: '6' }, nbDemiJournees: '1' });
  var regles = res.regles.U14 || [];
  _ffrAssert(etat, regles.length >= 1, 'antiCollision : une règle M14/7x7 remontée');
  var sevens = regles.some(function (r) { return r.carton_jaune_min === '5' || r.effectif_max_feuille === '12'; });
  _ffrAssert(etat, !sevens, 'antiCollision : la règle Sevens (carton 5, feuille 12) n\'est jamais proposée');
  // T+2 et JCO ont des valeurs identiques → dédoublonnées en UNE entrée.
  _ffrAssert(etat, regles.length === 1, 'antiCollision : T+2 et JCO dédoublonnés (valeurs identiques)');
}

/** Le plafond de temps M14/7x7 ne doit JAMAIS être 42 (ligne Sevres à nb_demi_journees vide). */
function testS5_plafondJamais42(etat) {
  var t = tempsPourCategorieFFR(_ffrRefS5().temps, '14', ['7x7'], '1', '6');
  _ffrAssert(etat, t && t.plafond_joueur_min === '65', 'plafond : M14/7x7/1dj/6eq → 65 (pas la grille Sevens)');
  _ffrAssert(etat, t && t.plafond_joueur_min !== '42', 'plafond : jamais 42 (ligne Sevens ignorée)');
  _ffrAssert(etat, t && t.grilles.length === 1, 'plafond : une grille légitime (Sevens exclu)');
}

/** Une ligne joint_refffr_formes=NON n'est jamais rendue par la jointure. */
function testS5_jointNonJamaisPropose(etat) {
  var combos = [{ categorie: 'M14', forme_jeu: 'SEVENS', effectif: '7x7' }];
  var r = reglesPourCombosFFR(_ffrRefS5().regles, '14', combos);
  _ffrAssert(etat, r.length === 0, 'jointNON : la ligne Sevens (joint=NON) n\'est jamais proposée');
}

/** M15F (joint=NON, absente de RefFFR_Formes) n'est jamais proposée. */
function testS5_m15fJamaisPropose(etat) {
  var combos = [{ categorie: 'M15F', forme_jeu: 'RE', effectif: '10x10' }];
  var r = reglesPourCombosFFR(_ffrRefS5().regles, '15F', combos);
  _ffrAssert(etat, r.length === 0, 'm15f : ligne M15F (joint=NON) jamais proposée');
}

/** M12 et U12 joignent la MÊME ligne (via normaliserCategorie). */
function testS5_m12u12MemeLigne(etat) {
  var combos = [{ categorie: 'U12', forme_jeu: 'RE', effectif: '10x10' }];
  var r = reglesPourCombosFFR(_ffrRefS5().regles, normaliserCategorie('U12'), combos);
  _ffrAssert(etat, normaliserCategorie('M12') === normaliserCategorie('U12'), 'm12u12 : clés canoniques égales');
  _ffrAssert(etat, r.length === 1 && r[0].terrain_longueur_m === '56', 'm12u12 : U12 joint la ligne M12');
}

/** Référentiel règles/temps absent ([]) ⇒ aucune erreur, sections muettes. */
function testS5_referentielReglesAbsent(etat) {
  // Fixture SANS regles ni temps (formes/dates présents) : les sections doivent rester vides.
  var res = evaluerConformiteFFR(_ffrRefFactice(), '2027-01-23', ['U10'], 'C',
    { equipesParCategorie: { U10: '3' }, nbDemiJournees: '1' });
  _ffrAssert(etat, res.regles && Object.keys(res.regles).length === 0, 'refAbsent : regles muet ({})');
  _ffrAssert(etat, res.temps && Object.keys(res.temps).length === 0, 'refAbsent : temps muet ({})');
  // Référentiel TOTALEMENT vide : migration douce, refDisponible=false, aucune exception.
  var vide = evaluerConformiteFFR({ formes: [], dates: [] }, '2027-01-23', ['U10'], 'C', null);
  _ffrAssert(etat, vide.refDisponible === false && Object.keys(vide.regles).length === 0,
    'refAbsent : référentiel vide → refDisponible=false, regles {}');
}

/** Grille de temps : M12/10x10/1 demi-journée/3 équipes rend DEUX variantes. */
function testS5_grilleDeuxVariantes(etat) {
  var res = evaluerConformiteFFR(_ffrRefS5(), '2026-12-05', ['U12'], 'C',
    { equipesParCategorie: { U12: '3' }, nbDemiJournees: '1' });
  var t = res.temps.U12;
  _ffrAssert(etat, t && t.grilles.length === 2, 'variantes : M12/10x10/1dj/3eq → 2 variantes');
  var vs = (t ? t.grilles : []).map(function (g) { return g.variante; });
  _ffrAssert(etat, vs.indexOf('A') !== -1 && vs.indexOf('B') !== -1, 'variantes : A et B présentes');
  _ffrAssert(etat, t && t.plafond_joueur_min === '65', 'variantes : plafond 65 remonté');
}

/** Nombre d'équipes sans ligne correspondante ⇒ muet, aucune valeur fabriquée. */
function testS5_nbEquipesSansLigneMuet(etat) {
  var res = evaluerConformiteFFR(_ffrRefS5(), '2026-12-05', ['U12'], 'C',
    { equipesParCategorie: { U12: '99' }, nbDemiJournees: '1' });
  _ffrAssert(etat, !res.temps.U12, 'muet : 99 équipes (aucune ligne) → pas de grille fabriquée');
}

/** analyserEffectifsCategories expose désormais `comptes` (ajout non cassant). */
function testS5_comptesExposes(etat) {
  var config = { categories: [{ categorie: 'U12', presente: 'oui' }] };
  var equipes = [{ categorie: 'U12' }, { categorie: 'U12' }, { categorie: 'U12' }];
  var r = analyserEffectifsCategories(config, equipes);
  _ffrAssert(etat, r.comptes && r.comptes.U12 === 3, 'comptes : U12 → 3 équipes');
  _ffrAssert(etat, Array.isArray(r.bloque) && Array.isArray(r.vides), 'comptes : bloque/vides toujours présents');
}
