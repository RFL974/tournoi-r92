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
  testS5_comptesExposes(etat);

  // Application des valeurs FFR par catégorie (session 6).
  testS6_u12JuinDimensions(etat);
  testS6_u12OctobreDimensions(etat);
  testS6_u14PleinInchange(etat);
  testS6_terrainNormal(etat);
  testS6_fusionPreserveVoisines(etat);
  testS6_variantesDuree(etat);
  testS6_dureeDependNbEquipes(etat);
  testS6_sevensJamaisApplique(etat);
  testS6_m15fJamaisApplique(etat);
  testS6_nbEquipesSansGrilleMuet(etat);
  testS6_referentielVide(etat);
  testS6_m12u12MemeResultat(etat);
  testS6_u14AmbiguAucuneApplication(etat);
  testS6_idempotence(etat);
  testS6_fusionZoneBpreserve(etat);

  // Demande d'autorisation de tournoi — feuille de report (session 7).
  testS7_aucuneDonneeSansErreur(etat);
  testS7_champVideJamaisDevine(etat);
  testS7_formesM12Juin(etat);
  testS7_formesM12Octobre(etat);
  testS7_sevensJamaisCoche(etat);
  testS7_m15fAbsentPasDeBloc(etat);
  testS7_deuxPhases(etat);
  testS7_libreCompteTouteLaJournee(etat);
  testS7_moinsDe3Equipes(etat);
  testS7_nbManquantsDecroit(etat);
  testS7_orgNonPublic(etat);
  testS7_defautNomClub(etat);

  // Session 8 — distinguer le PRÉVU de l'EXÉCUTÉ + plafond de temps récupérable seul.
  testS8_croiseSansApremDeuxPhases(etat);
  testS8_croisePhase2Manquante(etat);
  testS8_formatAbsentManquant(etat);
  testS8_coupePlateauSignalement(etat);
  testS8_clubsDepuisEquipes(etat);
  testS8_clubsInvitesPrime(etat);
  testS8_participantsManquantJamaisEstime(etat);
  testS8_incoherenceEquipesSansClub(etat);
  testS8_plafond12EquipesPresent(etat);
  testS8_plafondElargiJamaisSevens(etat);
  testS8_plafondM10DeuxDemiJournees(etat);
  testS8_previsionnelSousPlafond(etat);
  testS8_previsionnelDepassement(etat);
  testS8_previsionnelMatchsInconnus(etat);
  testS8_nbDemiJourneesDefaut2(etat);

  // Session 9 — temps de jeu prévisionnel sur la JOURNÉE ENTIÈRE (prédiction de la phase 2).
  testS9_structureMatin(etat);
  testS9_phase2CroisePredit(etat);
  testS9_phase2DiagonalEgalUn(etat);
  testS9_phase2DiagonalInegalMinimum(etat);
  testS9_croiseMatinSeulJournee(etat);
  testS9_croiseApremConstate(etat);
  testS9_diagonalInegalReplie4B(etat);
  testS9_matinAbsentMuet(etat);
  testS9_depassementTotalPredit(etat);
  testS9_partielDepasseSignale(etat);
  testS9_margeFaible(etat);

  // Session 10 — défaut PRUDENT par construction (table de formules) + LIBRE prédit.
  testS10_librePredit(etat);
  testS10_libreMoinsDeDeuxEquipes(etat);
  testS10_formatInventeChemin4B(etat);
  testS10_formatVideChemin4B(etat);
  testS10_formatInconnuDepasseSignale(etat);
  testS10_generationInchangeeFormatVide(etat);
  testS10_feuilleFormatVide(etat);
  testS10_feuilleFormatVideSignalement(etat);

  // Session 11 — forme de jeu retenue (déclarative) + tir au but PRUDENT par construction.
  testS11_libelleForme(etat);
  testS11_tirAuButColonneAbsente(etat);
  testS11_tirAuButOui(etat);
  testS11_tirAuButValeurInattendue(etat);
  testS11_formeJeuVideInchange(etat);
  testS11_formeJeuMonoInchange(etat);
  testS11_formeJeuLeveAmbiguite15x15(etat);
  testS11_formeJeuLeveAmbiguite10x10(etat);
  testS11_formeJeuHorsMoisPasDApplication(etat);

  // Session 12 — saisie détaillée du score (tir au but) + alerte 5 essais + levée d'ambiguïté conformité.
  testS12_detailAbsentModeSimple(etat);
  testS12_detailScoreRecalcule(etat);
  testS12_detailInvalide(etat);
  testS12_tirAbsentPageSimple(etat);
  testS12_tirOuiFormeRetenue(etat);
  testS12_essaisHelper(etat);
  testS12_conformiteFormeReduitRegles(etat);

  // Session 13 — contexte U14 (Super Challenge de France) déclaratif : normaliseur PRUDENT.
  testS13_defautLambdaSansColonne(etat);
  testS13_lambdaExplicite(etat);
  testS13_scfSurU14(etat);
  testS13_scfIgnoreHorsU14(etat);
  testS13_scfApparieM14(etat);
  testS13_phaseDefautP2(etat);
  testS13_phaseP3(etat);
  testS13_phaseInconnueRetombeP2(etat);
  testS13_valeurContexteInconnueLambda(etat);
  testS13_casseEtEspaces(etat);

  // Session 14 (PR A) — génération Super Challenge Phase 2 (triangulaire/quadrangulaire, 2×15).
  testS14_dureeP2(etat);
  testS14_dureeP3(etat);
  testS14_dureePhaseDefaut(etat);
  testS14_quadrangulaireQuatreMatchs(etat);
  testS14_quadrangulaireChacunDeux(etat);
  testS14_quadrangulaireDeuxTournees(etat);
  testS14_quadrangulaireTailleInvalide(etat);
  testS14_groupeTriangulaire(etat);
  testS14_groupeTailleInattendueAvertit(etat);
  testS14_planningQuadrangulaireQuatreMatchs(etat);
  testS14_planningTempsForce(etat);
  testS14_planningLambdaInchange(etat);

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
      // M12 décembre / juin : Rugby Éducatif 10x10 (56×45).
      { categorie: 'M12', mois: '2026-12', forme_jeu: 'RE', effectif: '10x10', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' },
      { categorie: 'M12', mois: '2027-06', forme_jeu: 'RE', effectif: '10x10', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' },
      // M12 octobre : Toucher+2 en 5x5 (56×30).
      { categorie: 'M12', mois: '2026-10', forme_jeu: 'T+2', effectif: '5x5', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' },
      // M14 janvier : deux effectifs le même mois (jeu à 10 OU jeu à 15) → AMBIGU.
      { categorie: 'M14', mois: '2027-01', forme_jeu: 'RE', effectif: '10x10|15x15', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' },
      // M14 avril : jeu à 15 seul → « terrain normal » (dimensions non chiffrées).
      { categorie: 'M14', mois: '2027-04', forme_jeu: 'RE', effectif: '15x15', tournoi_autorise: 'OUI', note: '', millesime: '2026-2027' }
    ],
    regles: [
      // M14 / 7x7 : Toucher+2 et Jouer au contact, JOINTS (valeurs structurantes identiques).
      { categorie: 'M14', forme_jeu: 'T+2', effectif: '7x7', effectif_terrain: '7', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      { categorie: 'M14', forme_jeu: 'JCO', effectif: '7x7', effectif_terrain: '7', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      // M14 / SEVENS / 7x7 : compétition, NON joignable — ne doit JAMAIS être proposé.
      { categorie: 'M14', forme_jeu: 'SEVENS', effectif: '7x7', effectif_terrain: '7', effectif_max_feuille: '12', terrain_longueur_m: '100', terrain_largeur_m: '70', terrain_libelle: '', ballon: 'T5', carton_jaune_min: '5', contexte: 'COMPETITION', joint_refffr_formes: 'NON', millesime: '2026-2027' },
      // M14 / RE / 10x10 et 15x15 : jouables (jeu à 10 chiffré ; jeu à 15 « terrain normal »).
      { categorie: 'M14', forme_jeu: 'RE', effectif: '10x10', effectif_terrain: '10', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      { categorie: 'M14', forme_jeu: 'RE', effectif: '15x15', effectif_terrain: '15', effectif_max_feuille: '13', terrain_longueur_m: '', terrain_largeur_m: '', terrain_libelle: 'Terrain normal', ballon: 'T5', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      // M15F / RE / 10x10 : catégorie absente de RefFFR_Formes, NON joignable.
      { categorie: 'M15F', forme_jeu: 'RE', effectif: '10x10', effectif_terrain: '10', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'CHALLENGE', joint_refffr_formes: 'NON', millesime: '2026-2027' },
      // M12 / RE / 10x10 (56×45) et T+2 / 5x5 (56×30).
      { categorie: 'M12', forme_jeu: 'RE', effectif: '10x10', effectif_terrain: '10', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' },
      { categorie: 'M12', forme_jeu: 'T+2', effectif: '5x5', effectif_terrain: '5', effectif_max_feuille: '9', terrain_longueur_m: '56', terrain_largeur_m: '30', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI', millesime: '2026-2027' }
    ],
    temps: [
      // PIÈGE Sevens M14/7x7 : nb_demi_journees VIDE, plafond 42 → doit être ignoré.
      { categorie: 'M14', effectif: '7x7', nb_demi_journees: '', nb_equipes: '', nb_periodes: '', duree_periode_min: '', pause_periodes_min: '', arret_entre_matchs_min: '', plafond_joueur_min: '42', variante: '', millesime: '2026-2027' },
      // Grille légitime M14/7x7, 1 demi-journée, 6 équipes : plafond 65.
      { categorie: 'M14', effectif: '7x7', nb_demi_journees: '1', nb_equipes: '6', nb_periodes: '2', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: '', rencontres_par_equipe: '5', nb_rencontres_total: '15', organisation_poules: '', millesime: '2026-2027' },
      // M12/10x10, 1 demi-journée, 3 équipes : DEUX variantes — A = 2×15, B = 3×10 (réel FFR).
      { categorie: 'M12', effectif: '10x10', nb_demi_journees: '1', nb_equipes: '3', nb_periodes: '2', duree_periode_min: '15', pause_periodes_min: '2', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: 'A', rencontres_par_equipe: '2', nb_rencontres_total: '3', organisation_poules: '1 poule de 3', millesime: '2026-2027' },
      { categorie: 'M12', effectif: '10x10', nb_demi_journees: '1', nb_equipes: '3', nb_periodes: '3', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: 'B', rencontres_par_equipe: '2', nb_rencontres_total: '3', organisation_poules: '1 poule de 3', millesime: '2026-2027' },
      // M12/5x5, 1 demi-journée : le découpage dépend du NB D'ÉQUIPES (3 → 3×10, 6 → 2×8).
      { categorie: 'M12', effectif: '5x5', nb_demi_journees: '1', nb_equipes: '3', nb_periodes: '3', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: '', rencontres_par_equipe: '2', nb_rencontres_total: '3', organisation_poules: '1 poule de 3', millesime: '2026-2027' },
      { categorie: 'M12', effectif: '5x5', nb_demi_journees: '1', nb_equipes: '6', nb_periodes: '2', duree_periode_min: '8', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '65', variante: '', rencontres_par_equipe: '5', nb_rencontres_total: '15', organisation_poules: '2 poules de 3', millesime: '2026-2027' },
      // M10 / 5x5, 2 demi-journées, plafond 85 : grilles publiées SEULEMENT pour 3 à 6 équipes (session 8).
      // Un tournoi de club à 12 équipes n'a donc AUCUNE grille — mais le plafond 85 doit rester récupérable.
      { categorie: 'M10', effectif: '5x5', nb_demi_journees: '2', nb_equipes: '3', nb_periodes: '2', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '85', variante: '', rencontres_par_equipe: '2', nb_rencontres_total: '3', organisation_poules: '1 poule de 3', millesime: '2026-2027' },
      { categorie: 'M10', effectif: '5x5', nb_demi_journees: '2', nb_equipes: '6', nb_periodes: '2', duree_periode_min: '10', pause_periodes_min: '1', arret_entre_matchs_min: '2', plafond_joueur_min: '85', variante: '', rencontres_par_equipe: '5', nb_rencontres_total: '15', organisation_poules: '2 poules de 3', millesime: '2026-2027' }
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

/** analyserEffectifsCategories expose désormais `comptes` (ajout non cassant). */
function testS5_comptesExposes(etat) {
  var config = { categories: [{ categorie: 'U12', presente: 'oui' }] };
  var equipes = [{ categorie: 'U12' }, { categorie: 'U12' }, { categorie: 'U12' }];
  var r = analyserEffectifsCategories(config, equipes);
  _ffrAssert(etat, r.comptes && r.comptes.U12 === 3, 'comptes : U12 → 3 équipes');
  _ffrAssert(etat, Array.isArray(r.bloque) && Array.isArray(r.vides), 'comptes : bloque/vides toujours présents');
}

/* -------------------------------------------------------------------------- */
/*  Application des valeurs FFR par catégorie (session 6)                      */
/*  calculerApplicationFFR est PURE (référentiel + dimensions injectés).       */
/* -------------------------------------------------------------------------- */

/** U12 en juin ⇒ jeu à 10 ⇒ dimensions 56 × 45. */
function testS6_u12JuinDimensions(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, {});
  _ffrAssert(etat, r.dimensions && r.dimensions.U12 && r.dimensions.U12.l === 56 && r.dimensions.U12.w === 45,
    'u12Juin : dimensions U12 = 56 × 45');
}

/** U12 en octobre ⇒ T+2 5x5 ⇒ dimensions 56 × 30. */
function testS6_u12OctobreDimensions(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U12', '2026-10-10', '1', '3', null, {});
  _ffrAssert(etat, r.dimensions && r.dimensions.U12 && r.dimensions.U12.l === 56 && r.dimensions.U12.w === 30,
    'u12Octobre : dimensions U12 = 56 × 30');
}

/** U14 avec {plein:true} ⇒ dimensions INCHANGÉES, entrée dans ignores. */
function testS6_u14PleinInchange(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2026-09-19', '1', '6', null, { U14: { plein: true } });
  _ffrAssert(etat, r.dimensions === null, 'u14Plein : aucune dimension écrite (plein:true préservé)');
  var raison = r.ignores.some(function (i) { return i.champ === 'dimensions_categories' && /plein/.test(i.raison); });
  _ffrAssert(etat, raison, 'u14Plein : ignoré avec la raison plein:true');
}

/** Forme « terrain normal » ⇒ aucune dimension écrite, zone B (effectif_max) appliquée quand même. */
function testS6_terrainNormal(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-04-10', '1', '6', null, {});
  _ffrAssert(etat, r.dimensions === null, 'terrainNormal : aucune dimension écrite');
  _ffrAssert(etat, r.champsZoneB.effectif_max === '13', 'terrainNormal : effectif_max (zone B) appliqué malgré tout');
  var raison = r.ignores.some(function (i) { return i.champ === 'dimensions_categories' && /normal/i.test(i.raison); });
  _ffrAssert(etat, raison, 'terrainNormal : ignoré avec le libellé FFR comme raison');
}

/** Fusion : appliquer U12 laisse U8, U10 et U14 INTACTS dans dimensions_categories. */
function testS6_fusionPreserveVoisines(etat) {
  var dims = { U8: { l: 30, w: 20 }, U10: { l: 30, w: 25 }, U14: { plein: true } };
  var r = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, dims);
  _ffrAssert(etat, r.dimensions.U8 && r.dimensions.U8.l === 30 && r.dimensions.U8.w === 20, 'fusion : U8 intact');
  _ffrAssert(etat, r.dimensions.U10 && r.dimensions.U10.w === 25, 'fusion : U10 intact');
  _ffrAssert(etat, r.dimensions.U14 && r.dimensions.U14.plein === true, 'fusion : U14 (plein) intact');
  _ffrAssert(etat, r.dimensions.U12 && r.dimensions.U12.l === 56, 'fusion : U12 ajouté');
}

/** Variante A vs B (jeu à 10) ⇒ duree_mi_temps_min différent (15 vs 10). */
function testS6_variantesDuree(etat) {
  var a = calculerApplicationFFR(_ffrRefS5(), 'U12', '2026-12-05', '1', '3', 'A', {});
  var b = calculerApplicationFFR(_ffrRefS5(), 'U12', '2026-12-05', '1', '3', 'B', {});
  _ffrAssert(etat, a.champsZoneB.duree_mi_temps_min === '15', 'variantes : A → 15 min');
  _ffrAssert(etat, b.champsZoneB.duree_mi_temps_min === '10', 'variantes : B → 10 min');
  _ffrAssert(etat, a.champsZoneB.duree_mi_temps_min !== b.champsZoneB.duree_mi_temps_min, 'variantes : durées différentes');
}

/** Le découpage dépend du NB D'ÉQUIPES : M12/5x5/1dj, 3 équipes (10 min) vs 6 équipes (8 min). */
function testS6_dureeDependNbEquipes(etat) {
  var trois = calculerApplicationFFR(_ffrRefS5(), 'U12', '2026-10-10', '1', '3', null, {});
  var six   = calculerApplicationFFR(_ffrRefS5(), 'U12', '2026-10-10', '1', '6', null, {});
  _ffrAssert(etat, trois.champsZoneB.duree_mi_temps_min === '10', 'nbEq : 3 équipes → 10 min');
  _ffrAssert(etat, six.champsZoneB.duree_mi_temps_min === '8', 'nbEq : 6 équipes → 8 min');
}

/** M14/SEVENS n'est jamais appliqué : U14 septembre remonte le Toucher+2 (feuille 13, pas 12). */
function testS6_sevensJamaisApplique(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2026-09-19', '1', '6', null, {});
  _ffrAssert(etat, r.champsZoneB.effectif_max === '13', 'sevens : effectif_max 13 (T+2), jamais 12 (Sevens)');
  _ffrAssert(etat, !(r.dimensions && r.dimensions.U14 && r.dimensions.U14.l === 100), 'sevens : terrain jamais 100×70');
}

/** M15F n'est jamais appliqué (catégorie absente de RefFFR_Formes). */
function testS6_m15fJamaisApplique(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U15F', '2026-12-05', '1', '3', null, {});
  _ffrAssert(etat, Object.keys(r.champsZoneB).length === 0 && r.dimensions === null, 'm15f : aucune application');
}

/** Aucune grille pour ce nb d'équipes ⇒ pas de champ de temps, mais dimensions + effectif appliqués. */
function testS6_nbEquipesSansGrilleMuet(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '7', null, {});
  _ffrAssert(etat, !r.champsZoneB.duree_mi_temps_min && !r.champsZoneB.format_mi_temps, 'sansGrille : aucun champ de temps');
  _ffrAssert(etat, r.champsZoneB.effectif_max === '13', 'sansGrille : effectif_max appliqué (RefFFR_Regles)');
  _ffrAssert(etat, r.dimensions && r.dimensions.U12, 'sansGrille : dimensions appliquées');
  _ffrAssert(etat, r.ignores.some(function (i) { return i.champ === 'temps'; }), 'sansGrille : temps dans ignores');
}

/** Référentiel vide ⇒ résultat vide, aucune erreur. */
function testS6_referentielVide(etat) {
  var r = calculerApplicationFFR({ formes: [], dates: [] }, 'U12', '2027-06-13', '1', '3', null, {});
  _ffrAssert(etat, Object.keys(r.champsZoneB).length === 0 && r.dimensions === null && !r.ambigu,
    'refVide : résultat vide sans erreur');
}

/** M12 et U12 donnent le même résultat (réconciliation normaliserCategorie). */
function testS6_m12u12MemeResultat(etat) {
  var u = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, {});
  var m = calculerApplicationFFR(_ffrRefS5(), 'M12', '2027-06-13', '1', '3', null, {});
  _ffrAssert(etat, u.forme && m.forme && u.forme.effectif === m.forme.effectif, 'm12u12 : même forme jointe');
  _ffrAssert(etat, u.dimensions.U12.l === m.dimensions.M12.l && u.dimensions.U12.w === m.dimensions.M12.w,
    'm12u12 : mêmes dimensions (56×45)');
}

/** U14 en janvier (10x10|15x15) ⇒ AMBIGU : aucune application automatique, formes exposées. */
function testS6_u14AmbiguAucuneApplication(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-01-16', '1', '4', null, {});
  _ffrAssert(etat, r.ambigu === true, 'u14Ambigu : marqué ambigu');
  _ffrAssert(etat, Object.keys(r.champsZoneB).length === 0 && r.dimensions === null, 'u14Ambigu : rien appliqué');
  _ffrAssert(etat, r.formesDisponibles.length === 2, 'u14Ambigu : deux formes exposées (10x10 et 15x15)');
}

/** Idempotence : réappliquer avec le résultat précédent produit le même Config. */
function testS6_idempotence(etat) {
  var r1 = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, {});
  var r2 = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, r1.dimensions);
  _ffrAssert(etat, JSON.stringify(r1.dimensions) === JSON.stringify(r2.dimensions), 'idempotence : dimensions stables');
  _ffrAssert(etat, JSON.stringify(r1.champsZoneB) === JSON.stringify(r2.champsZoneB), 'idempotence : champs zone B stables');
}

/** Fusion zone B : les colonnes non FFR (terrains, format_apresmidi, reglement…) sont préservées. */
function testS6_fusionZoneBpreserve(etat) {
  var existante = { categorie: 'U12', presente: 'oui', terrains: '5,6', terrains_auto: 'oui',
    nb_poules: '2', format_mi_temps: '2', duree_mi_temps_min: '12', format_apresmidi: 'CROISE',
    param_format: '', reglement: 'https://exemple', effectif_min: '7', effectif_max: '10',
    arbitrage_organisation: 'éducateurs', max_equipes_par_club: '2' };
  var champsZoneB = { format_mi_temps: '3', duree_mi_temps_min: '10', effectif_max: '13' };
  var fusion = fusionnerCategorieFFR(existante, champsZoneB);
  _ffrAssert(etat, fusion.format_mi_temps === '3' && fusion.duree_mi_temps_min === '10' && fusion.effectif_max === '13',
    'fusionZoneB : champs FFR appliqués');
  _ffrAssert(etat, fusion.terrains === '5,6' && fusion.format_apresmidi === 'CROISE' &&
    fusion.param_format === '' && fusion.reglement === 'https://exemple' && fusion.effectif_min === '7' &&
    fusion.arbitrage_organisation === 'éducateurs' && fusion.max_equipes_par_club === '2',
    'fusionZoneB : colonnes voisines intactes');
}

/* -------------------------------------------------------------------------- */
/*  Demande d'autorisation de tournoi — feuille de report (session 7)          */
/*  assemblerDossierAutorisation est PURE (donneesApp + config + ref injectés).*/
/* -------------------------------------------------------------------------- */

/** Référentiel des formes pour les tests d'autorisation (M12 juin/octobre, M14 septembre). */
function _refAutorisation() {
  return { formes: [
    { categorie: 'M12', mois: '2027-06', forme_jeu: 'RE',      effectif: '10x10', tournoi_autorise: 'OUI' },
    { categorie: 'M12', mois: '2026-10', forme_jeu: 'T+2|JCO', effectif: '5x5',   tournoi_autorise: 'OUI' },
    { categorie: 'M14', mois: '2026-09', forme_jeu: 'T+2|JCO', effectif: '7x7',   tournoi_autorise: 'OUI' }
  ] };
}

/** Config minimale avec une liste de catégories présentes (+ global éventuel). */
function _cfgAutorisation(cats, global) {
  return { global: global || {}, categories: (cats || []).map(function (c) {
    return { categorie: c.categorie, presente: 'oui', format_apresmidi: c.format_apresmidi || '',
             format_mi_temps: c.format_mi_temps || '', duree_mi_temps_min: c.duree_mi_temps_min || '' };
  }) };
}

/** Retrouve le premier champ dont le libellé contient la sous-chaîne. */
function _autoChamp(dossier, sousChaine) {
  var f = null;
  dossier.sections.forEach(function (s) { s.champs.forEach(function (c) {
    if (!f && c.libelle.indexOf(sousChaine) !== -1) f = c;
  }); });
  return f;
}

/** Aucune donnée saisie ⇒ dossier assemblé, beaucoup de manquants, aucune exception. */
function testS7_aucuneDonneeSansErreur(etat) {
  var d = assemblerDossierAutorisation({}, { global: {}, categories: [] }, { formes: [] });
  _ffrAssert(etat, d && d.sections.length >= 8, 'auto : dossier assemblé (toutes les sections)');
  _ffrAssert(etat, d.nbManquants >= 10 && d.complet === false, 'auto : nbManquants élevé, non complet');
}

/** Un champ vide n'est jamais rempli par une valeur devinée. */
function testS7_champVideJamaisDevine(etat) {
  var d = assemblerDossierAutorisation({}, { global: {}, categories: [] }, { formes: [] });
  var code = _autoChamp(d, 'Code club');
  _ffrAssert(etat, code && code.valeur === '' && code.etat === 'manquant', 'auto : code club vide et manquant, jamais deviné');
}

/** M12 en juin ⇒ 10x10 (RE) cochée, 5x5 non. */
function testS7_formesM12Juin(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'] },
    _cfgAutorisation([{ categorie: 'U12' }]), _refAutorisation());
  var re = _autoChamp(d, 'U12 — 10x10 (RE)');
  var t2 = _autoChamp(d, 'U12 — 5x5 (T+2)');
  _ffrAssert(etat, re && re.valeur.indexOf('☑') !== -1, 'formesJuin : 10x10 (RE) cochée');
  _ffrAssert(etat, t2 && t2.valeur.indexOf('☑') === -1, 'formesJuin : 5x5 (T+2) non cochée');
}

/** M12 en octobre ⇒ 5x5 (J CO) cochée, 10x10 non. */
function testS7_formesM12Octobre(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2026-10-10' }, catsPresentes: ['U12'] },
    _cfgAutorisation([{ categorie: 'U12' }]), _refAutorisation());
  var jco = _autoChamp(d, 'U12 — 5x5 (J CO)');
  var re = _autoChamp(d, 'U12 — 10x10 (RE)');
  _ffrAssert(etat, jco && jco.valeur.indexOf('☑') !== -1, 'formesOct : 5x5 (J CO) cochée');
  _ffrAssert(etat, re && re.valeur.indexOf('☑') === -1, 'formesOct : 10x10 (RE) non cochée');
}

/** SEVENS n'est jamais coché automatiquement. */
function testS7_sevensJamaisCoche(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2026-09-19' }, catsPresentes: ['U14'] },
    _cfgAutorisation([{ categorie: 'U14' }]), _refAutorisation());
  var sevens = _autoChamp(d, 'U14 — 7x7 (SEVENS)');
  _ffrAssert(etat, sevens && sevens.valeur.indexOf('☑') === -1, 'sevens : jamais coché automatiquement');
}

/** M15F absente de l'app ⇒ aucun champ M15F. */
function testS7_m15fAbsentPasDeBloc(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2026-09-19' }, catsPresentes: ['U14'] },
    _cfgAutorisation([{ categorie: 'U14' }]), _refAutorisation());
  var m15 = _autoChamp(d, 'U15F');
  _ffrAssert(etat, !m15, 'm15f : aucun bloc M15F si absente de l\'app');
}

/** Planning à deux phases (CROISE + après-midi) ⇒ phase 1 et phase 2 séparées. */
function testS7_deuxPhases(etat) {
  var mpc = { U12: [
    { phase: 'poule', equipe_A: 'T1', equipe_B: 'T2' }, { phase: 'poule', equipe_A: 'T1', equipe_B: 'T3' },
    { phase: 'classement', equipe_A: 'T1', equipe_B: 'T4' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'CROISE', format_mi_temps: '2', duree_mi_temps_min: '10' }]),
    _refAutorisation());
  var p1 = _autoChamp(d, 'Phase 1 (poules de qualification) : matchs/équipe');
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p1 && p1.valeur === '2', 'deuxPhases : phase 1 = 2 matchs/équipe');
  _ffrAssert(etat, p2 && p2.valeur === '1', 'deuxPhases : phase 2 = 1 match/équipe');
}

/** LIBRE avec matin ET après-midi ⇒ 1 phase, matchs/équipe compte les deux. */
function testS7_libreCompteTouteLaJournee(etat) {
  var mpc = { U12: [
    { phase: 'poule', equipe_A: 'T1', equipe_B: 'T2' }, { phase: 'poule', equipe_A: 'T1', equipe_B: 'T3' },
    { phase: 'classement', equipe_A: 'T1', equipe_B: 'T4' } // amical d'après-midi
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'LIBRE', format_mi_temps: '2', duree_mi_temps_min: '10' }]),
    _refAutorisation());
  var une = _autoChamp(d, '1 phase : matchs/équipe');
  _ffrAssert(etat, une && une.valeur === '3', 'libre : 1 phase, 3 matchs/équipe (matin + après-midi)');
  _ffrAssert(etat, !_autoChamp(d, 'Phase 2'), 'libre : pas de phase 2 (amicaux ≠ poules de niveau)');
}

/** Moins de 3 équipes ⇒ signalement (le formulaire exige un minimum de 3). */
function testS7_moinsDe3Equipes(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'],
    participants: { nbEquipes: 2 } }, _cfgAutorisation([{ categorie: 'U12' }]), _refAutorisation());
  var eq = _autoChamp(d, 'Nombre d\'équipes');
  _ffrAssert(etat, eq && eq.etat === 'manquant' && /minimum de 3/.test(eq.origine), 'min3 : 2 équipes → signalement');
}

/** nbManquants décroît quand un champ est saisi. */
function testS7_nbManquantsDecroit(etat) {
  var n0 = assemblerDossierAutorisation({}, { global: {}, categories: [] }, { formes: [] }).nbManquants;
  var n1 = assemblerDossierAutorisation({}, { global: { org_code_club: 'C12345' }, categories: [] }, { formes: [] }).nbManquants;
  _ffrAssert(etat, n1 === n0 - 1, 'nbManquants : décroît de 1 quand un champ est saisi');
}

/** Aucun champ org_* ne sort par une lecture publique (filtre opt-in de la session 3). */
function testS7_orgNonPublic(etat) {
  var config = { global: { org_president_nom: 'X', org_president_tel: '0600000000', org_code_club: 'C1',
    org_representant_mail: 'a@b.c', tournoi_nom: 'T' }, categories: [] };
  var fuite = ['live', 'invitation', 'club'].some(function (vue) {
    var v = filtrerConfigPublique(config, vue).global;
    return Object.keys(v).some(function (k) { return k.indexOf('org_') === 0; });
  });
  _ffrAssert(etat, !fuite, 'orgNonPublic : aucun org_* dans live/invitation/club');
}

/** Le défaut du nom de club est « Racing Club de France Rugby ». */
function testS7_defautNomClub(etat) {
  var d = assemblerDossierAutorisation({}, { global: {}, categories: [] }, { formes: [] });
  var nom = _autoChamp(d, 'Nom du club');
  _ffrAssert(etat, nom && nom.valeur === 'Racing Club de France Rugby', 'defautClub : Racing Club de France Rugby');
}

/* -------------------------------------------------------------------------- */
/*  Session 8 — le PRÉVU vs l'EXÉCUTÉ + plafond de temps de jeu récupérable    */
/* -------------------------------------------------------------------------- */

/** Config d'une catégorie CROISE avec durée de match (zone B) pour les tests de format. */
function _cfgCroise() {
  return _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'CROISE', format_mi_temps: '2', duree_mi_temps_min: '10' }]);
}

/** §4.7 #1 — CROISE SANS aucun match de classement ⇒ 2 phases DÉCLARÉES (l'intention, pas l'exécution). */
function testS8_croiseSansApremDeuxPhases(etat) {
  var mpc = { U12: [
    { phase: 'poule', equipe_A: 'T1', equipe_B: 'T2' }, { phase: 'poule', equipe_A: 'T1', equipe_B: 'T3' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgCroise(), _refAutorisation());
  _ffrAssert(etat, !!_autoChamp(d, 'Phase 1 (poules de qualification)'), 'croise2ph : Phase 1 déclarée');
  _ffrAssert(etat, !!_autoChamp(d, 'Phase 2 (poules de niveau)'), 'croise2ph : Phase 2 déclarée malgré l\'absence de matchs d\'après-midi');
  _ffrAssert(etat, !_autoChamp(d, '1 phase : matchs/équipe'), 'croise2ph : jamais « 1 phase » pour un CROISE');
}

/** §4.7 #2 — même cas : Phase 2 matchs/équipe MANQUANT, Phase 1 renseignée (informations séparées). */
function testS8_croisePhase2Manquante(etat) {
  var mpc = { U12: [
    { phase: 'poule', equipe_A: 'T1', equipe_B: 'T2' }, { phase: 'poule', equipe_A: 'T1', equipe_B: 'T3' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgCroise(), _refAutorisation());
  var p1 = _autoChamp(d, 'Phase 1 (poules de qualification) : matchs/équipe');
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p1 && p1.valeur === '2' && p1.etat === 'calcule', 'phase2manq : Phase 1 = 2 matchs/équipe (renseignée)');
  _ffrAssert(etat, p2 && p2.etat === 'manquant', 'phase2manq : Phase 2 matchs/équipe manquant (planning après-midi non généré)');
}

/** §4.7 #4 — format d'après-midi ABSENT ⇒ manquant, AUCUNE phase déclarée. */
function testS8_formatAbsentManquant(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: {} },
    _cfgAutorisation([{ categorie: 'U12' }]), _refAutorisation());
  var fmt = _autoChamp(d, 'U12 — format sportif');
  _ffrAssert(etat, fmt && fmt.etat === 'manquant' && /non configuré/.test(fmt.origine),
    'formatAbsent : manquant, motif « format d\'après-midi non configuré »');
  _ffrAssert(etat, !_autoChamp(d, 'Phase 1') && !_autoChamp(d, 'Phase 2') && !_autoChamp(d, '1 phase'),
    'formatAbsent : aucune phase déclarée');
}

/** COUPE_PLATEAU (réponse utilisateur) ⇒ manquant + signalement des PHASES FINALES INTERDITES en EDR. */
function testS8_coupePlateauSignalement(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: {} },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'COUPE_PLATEAU' }]), _refAutorisation());
  var fmt = _autoChamp(d, 'U12 — format sportif');
  var avert = _autoChamp(d, 'phases finales interdites');
  _ffrAssert(etat, fmt && fmt.etat === 'manquant' && /COUPE_PLATEAU/.test(fmt.origine),
    'coupePlateau : manquant, motif hors périmètre EDR');
  _ffrAssert(etat, avert && avert.etat === 'avert' && /interdit/i.test(avert.valeur),
    'coupePlateau : signalement des phases finales interdites (informatif, ffr-orange)');
}

/** §4.7 #5 — ClubsInvites vide + équipes présentes ⇒ nombre de clubs depuis les équipes, origine indiquée. */
function testS8_clubsDepuisEquipes(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' },
    participants: { nbClubsInvites: 0, nbClubsEquipes: 5, nbEquipes: 12, nbParticipants: 0 } },
    { global: {}, categories: [] }, { formes: [] });
  var c = _autoChamp(d, 'Nombre de clubs');
  _ffrAssert(etat, c && c.valeur === '5' && c.etat === 'calcule', 'clubsEquipes : 5 clubs depuis les équipes');
  _ffrAssert(etat, c && /distincts/.test(c.origine), 'clubsEquipes : origine « clubs distincts (équipes) » indiquée');
}

/** §4.7 #6 — ClubsInvites renseigné ⇒ il PRIME sur le comptage depuis les équipes. */
function testS8_clubsInvitesPrime(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' },
    participants: { nbClubsInvites: 8, nbClubsEquipes: 5, nbEquipes: 12, nbParticipants: 0 } },
    { global: {}, categories: [] }, { formes: [] });
  var c = _autoChamp(d, 'Nombre de clubs');
  _ffrAssert(etat, c && c.valeur === '8', 'clubsPrime : 8 clubs acceptés priment sur les 5 déduits');
  _ffrAssert(etat, c && /invitation/.test(c.origine), 'clubsPrime : origine « clubs acceptés (invitations) »');
}

/** §4.7 #7 — participants : aucune source ⇒ manquant, JAMAIS une estimation. */
function testS8_participantsManquantJamaisEstime(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' },
    participants: { nbClubsInvites: 0, nbClubsEquipes: 5, nbEquipes: 12, nbParticipants: 0 } },
    { global: {}, categories: [] }, { formes: [] });
  var p = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, p && p.etat === 'manquant' && p.valeur === '',
    'participantsManq : aucune source → manquant, valeur vide (aucun ratio appliqué)');
}

/** §4.7 #8 — 29 équipes / 0 club ⇒ incohérence signalée, SANS incrémenter le compteur de manquants. */
function testS8_incoherenceEquipesSansClub(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' },
    participants: { nbClubsInvites: 0, nbClubsEquipes: 0, nbEquipes: 29, nbParticipants: 0 } },
    { global: {}, categories: [] }, { formes: [] });
  var av = _autoChamp(d, 'Cohérence clubs');
  _ffrAssert(etat, av && av.etat === 'avert' && /29/.test(av.valeur) && /aucun club/.test(av.valeur),
    'incoherence : « 29 équipes mais aucun club » signalé');
  _ffrAssert(etat, av && av.etat !== 'manquant', 'incoherence : état « avert » ⇒ hors compteur de manquants');
}

/** §4.7 #9 — 12 équipes en M10 : grille FFR muette (3–6 seulement) MAIS plafond présent (85). */
function testS8_plafond12EquipesPresent(etat) {
  var t = tempsPourCategorieFFR(_ffrRefS5().temps, '10', ['5x5'], '2', '12');
  _ffrAssert(etat, !!t && t.plafond_joueur_min === '85', 'plafond12 : plafond 85 présent malgré 12 équipes');
  _ffrAssert(etat, t && t.grilles.length === 0, 'plafond12 : grille muette au-delà de 6 équipes');
}

/** §4.7 #10 — recherche de plafond ÉLARGIE : la ligne Sevens (nb_demi_journees vide) n'est jamais retenue. */
function testS8_plafondElargiJamaisSevens(etat) {
  // M14/7x7 avec un nombre d'équipes SANS grille (99) : le plafond élargi ne doit jamais remonter le 42.
  var t = tempsPourCategorieFFR(_ffrRefS5().temps, '14', ['7x7'], '1', '99');
  _ffrAssert(etat, !t || t.plafond_joueur_min !== '42', 'sevensElargi : jamais 42 même en recherche élargie');
  _ffrAssert(etat, t && t.plafond_joueur_min === '65', 'sevensElargi : plafond légitime 65 remonté');
}

/** §4.7 #11 — M10, 2 demi-journées ⇒ plafond 85 min. */
function testS8_plafondM10DeuxDemiJournees(etat) {
  var t = tempsPourCategorieFFR(_ffrRefS5().temps, '10', ['5x5'], '2', '6');
  _ffrAssert(etat, !!t && t.plafond_joueur_min === '85', 'plafondM10 : M10 / 2 demi-journées → 85 min');
}

/** §4.7 #12 — prévisionnel : 3 matchs × 2 × 10 = 60 min, plafond 85 ⇒ sous le plafond, marge 25. */
function testS8_previsionnelSousPlafond(etat) {
  var p = tempsPrevisionnelJoueurFFR('3', '2', '10', '85');
  _ffrAssert(etat, p && p.minutes === 60 && p.depasse === false, 'prevSous : 60 min, sous le plafond');
  _ffrAssert(etat, p && p.marge === 25, 'prevSous : marge 25 min');
}

/** §4.7 #13 — prévisionnel : 5 matchs × 2 × 10 = 100 min, plafond 85 ⇒ dépassement de 15 min. */
function testS8_previsionnelDepassement(etat) {
  var p = tempsPrevisionnelJoueurFFR('5', '2', '10', '85');
  _ffrAssert(etat, p && p.minutes === 100 && p.depasse === true, 'prevDep : 100 min, dépasse le plafond');
  _ffrAssert(etat, p && p.depassement === 15, 'prevDep : dépassement de 15 min');
}

/** §4.7 #14 — matchs par équipe inconnus ⇒ aucun calcul, aucune alerte (null). */
function testS8_previsionnelMatchsInconnus(etat) {
  _ffrAssert(etat, tempsPrevisionnelJoueurFFR(null, '2', '10', '85') === null, 'prevInconnu : matchs null → aucun calcul');
  _ffrAssert(etat, tempsPrevisionnelJoueurFFR('', '2', '10', '85') === null, 'prevInconnu : matchs vide → aucun calcul');
}

/** §4.7 #15 — nb_demi_journees absent ⇒ traité comme 2 ; une valeur saisie est respectée. */
function testS8_nbDemiJourneesDefaut2(etat) {
  _ffrAssert(etat, nbDemiJourneesConfig({ global: {} }) === '2', 'ndjDefaut : absent → 2');
  _ffrAssert(etat, nbDemiJourneesConfig({ global: { nb_demi_journees: '1' } }) === '1', 'ndjDefaut : valeur saisie respectée');
}

/* -------------------------------------------------------------------------- */
/*  Session 9 — temps de jeu prévisionnel sur la JOURNÉE ENTIÈRE              */
/*  (prédiction de la phase 2 depuis la structure du matin, pur)             */
/* -------------------------------------------------------------------------- */

/** Fabrique un round-robin de matchs du matin : `poules` = tableau de tableaux d'ids d'équipe. */
function _matinPoules(poules) {
  var out = [];
  (poules || []).forEach(function (ids, i) {
    var label = String.fromCharCode(65 + i); // 'A', 'B', 'C'…
    for (var a = 0; a < ids.length; a++) {
      for (var b = a + 1; b < ids.length; b++) {
        out.push({ poule: label, equipe_A: ids[a], equipe_B: ids[b], phase: 'poule' });
      }
    }
  });
  return out;
}

/** structureMatinFFR : nombre de poules, égalité, total d'équipes, max de matchs/équipe. */
function testS9_structureMatin(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2', 'B3'], ['C1', 'C2', 'C3']]);
  var st = structureMatinFFR(matin);
  _ffrAssert(etat, st.nbPoules === 3 && st.poulesEgales === true, 'structMatin : 3 poules égales');
  _ffrAssert(etat, st.matinMax === 2, 'structMatin : 2 matchs/équipe (poule de 3)');
  _ffrAssert(etat, st.totalEquipes === 9, 'structMatin : 9 équipes au total (pour la formule LIBRE)');
  var ineg = structureMatinFFR(_matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2']]));
  _ffrAssert(etat, ineg.nbPoules === 2 && ineg.poulesEgales === false, 'structMatin : poules inégales détectées');
}

/** §4.D — CROISE : formule de table = nbPoules − 1 (exact). Adapté S10 : la table remplace l'énumération. */
function testS9_phase2CroisePredit(etat) {
  var p = FORMULES_PHASE2.CROISE({ nbPoules: 3, poulesEgales: true });
  _ffrAssert(etat, p && p.valeur === 2 && p.nature === 'predit', 'phase2Croise : 3 poules → 2 matchs, prédit');
  _ffrAssert(etat, FORMULES_PHASE2.CROISE({ nbPoules: 1 }).valeur === 0, 'phase2Croise : 1 poule → 0 (croisé impossible)');
}

/** §4.D — CROISE_DIAGONAL en poules ÉGALES : 1 match/équipe (exact, prédit). */
function testS9_phase2DiagonalEgalUn(etat) {
  var p = FORMULES_PHASE2.CROISE_DIAGONAL({ nbPoules: 3, poulesEgales: true });
  _ffrAssert(etat, p && p.valeur === 1 && p.nature === 'predit', 'phase2Diag : poules égales → 1, prédit');
}

/** §4.D #7 — CROISE_DIAGONAL en poules INÉGALES : borne basse (1, nature 'minimum'). */
function testS9_phase2DiagonalInegalMinimum(etat) {
  var p = FORMULES_PHASE2.CROISE_DIAGONAL({ nbPoules: 3, poulesEgales: false });
  _ffrAssert(etat, p && p.valeur === 1 && p.nature === 'minimum', 'phase2Diag : poules inégales → minimum 1 (repli 4.B)');
}

/** §4.D #1 — CROISE, matin seul : le prévisionnel couvre la JOURNÉE, constaté + prédit distingués. */
function testS9_croiseMatinSeulJournee(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2', 'B3'], ['C1', 'C2', 'C3']]); // 3 poules → aprem 2
  var p = previsionnelCategorieFFR(matin, [], 'CROISE', '2', '10', '130');
  _ffrAssert(etat, p && p.nature === 'predit' && p.complet === true, 'croiseJournee : total prédit complet');
  _ffrAssert(etat, p && p.matinMatchs === 2 && p.apremMatchs === 2, 'croiseJournee : 2 constatés matin + 2 prévus après-midi');
  _ffrAssert(etat, p && p.minutes === 80, 'croiseJournee : (2+2)×2×10 = 80 min sur la journée');
}

/** §4.D #2 — CROISE, après-midi déjà généré : tout constaté, aucune prédiction. */
function testS9_croiseApremConstate(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2', 'B3']]); // matin : 2 matchs/équipe
  var aprem = [ { poule: 'N1', equipe_A: 'A1', equipe_B: 'B1', phase: 'classement' },
                { poule: 'N2', equipe_A: 'A2', equipe_B: 'B2', phase: 'classement' } ];
  var p = previsionnelCategorieFFR(matin, aprem, 'CROISE', '2', '10', '130');
  _ffrAssert(etat, p && p.nature === 'constate' && p.matinMatchs === null, 'croiseConstate : constaté, aucun détail prédit');
  _ffrAssert(etat, p && p.minutes === 60, 'croiseConstate : 3 matchs/équipe constatés × 2 × 10 = 60 min');
}

/** §4.D #3 / #7 — CROISE_DIAGONAL inégal, sous le plafond : chemin 4.B, ne conclut PAS. */
function testS9_diagonalInegalReplie4B(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2']]); // inégal ; matinMax = 2
  var p = previsionnelCategorieFFR(matin, [], 'CROISE_DIAGONAL', '2', '10', '130');
  _ffrAssert(etat, p && p.nature === 'minimum' && p.complet === false, 'diag4B : borne basse, non complet');
  _ffrAssert(etat, p && p.depasse === false, 'diag4B : sous le plafond ⇒ aucune conclusion (marge non affichée côté front)');
}

/**
 * §4.D #7 (session 10) — LIBRE est désormais PRÉDIT par formule exacte (`totalEquipes − 1`), et non
 * plus laissé au seul matin. Ce test remplace l'ancien `testS9_libreInchange`, dont le nom affirmait
 * un « inchangé » devenu faux : LIBRE couvre maintenant la journée entière (matin + après-midi prédit).
 */
function testS10_librePredit(etat) {
  // 1 poule de 3 équipes : matin 2 matchs/équipe ; après-midi LIBRE = round-robin des 3 → 2 matchs.
  var matin = _matinPoules([['A1', 'A2', 'A3']]);
  var p = previsionnelCategorieFFR(matin, [], 'LIBRE', '2', '10', '130');
  _ffrAssert(etat, p && p.nature === 'predit' && p.complet === true, 'librePredit : prédit par formule, complet');
  _ffrAssert(etat, p && p.matinMatchs === 2 && p.apremMatchs === 2, 'librePredit : 2 matin + (3−1)=2 après-midi prévus');
  _ffrAssert(etat, p && p.minutes === 80, 'librePredit : (2+2)×2×10 = 80 min sur la journée (plus le matin seul)');
}

/** §4.D #7 (cas limite §3.2) — LIBRE à moins de 2 équipes : 0 match l'après-midi, pas de prédiction fantôme. */
function testS10_libreMoinsDeDeuxEquipes(etat) {
  _ffrAssert(etat, FORMULES_PHASE2.LIBRE({ totalEquipes: 1 }).valeur === 0, 'libreLimite : 1 équipe → 0 match après-midi');
  // Une seule équipe au matin (aucun match) : previsionnelCategorieFFR reste muet (pas de matin).
  var p = previsionnelCategorieFFR(_matinPoules([['A1', 'A2']]), [], 'LIBRE', '2', '10', '130');
  _ffrAssert(etat, p && p.apremMatchs === 1, 'libreLimite : 2 équipes → 1 match l\'après-midi (borne de la formule)');
}

/** §4.D #5 — matin absent : muet. */
function testS9_matinAbsentMuet(etat) {
  _ffrAssert(etat, previsionnelCategorieFFR([], [], 'CROISE', '2', '10', '130') === null, 'muet : aucun match du matin');
}

/** §4.D #6 — dépassement d'un total PRÉDIT : 6 matchs × 2 × 10 = 120 contre 85 ⇒ +35 signalé. */
function testS9_depassementTotalPredit(etat) {
  // 4 poules de 4 → matin 3 matchs/équipe, phase 2 prédite = 3 → total 6.
  var matin = _matinPoules([['A1','A2','A3','A4'], ['B1','B2','B3','B4'], ['C1','C2','C3','C4'], ['D1','D2','D3','D4']]);
  var p = previsionnelCategorieFFR(matin, [], 'CROISE', '2', '10', '85');
  _ffrAssert(etat, p && p.matinMatchs === 3 && p.apremMatchs === 3, 'depPredit : 3 matin + 3 après-midi prévus');
  _ffrAssert(etat, p && p.minutes === 120 && p.depasse === true && p.depassement === 35,
    'depPredit : 120 min, dépassement de 35 min signalé');
}

/** Asymétrie (Ajout 1) — total PARTIEL qui dépasse DÉJÀ : le dépassement EST signalé malgré l'incomplétude. */
function testS9_partielDepasseSignale(etat) {
  // DIAGONAL inégal (borne basse) : matinMax 2 + minimum 1 = 3 ; plafond 40 ⇒ 60 min > 40.
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2']]);
  var p = previsionnelCategorieFFR(matin, [], 'CROISE_DIAGONAL', '2', '10', '40');
  _ffrAssert(etat, p && p.complet === false && p.nature === 'minimum', 'partielDep : total non complet (borne basse)');
  _ffrAssert(etat, p && p.depasse === true && p.depassement === 20,
    'partielDep : dépassement (60 > 40) signalé malgré le total partiel');
}

/** Marge faible (Ajout 2) — marge ≤ 10 min sur un total à deux phases ⇒ signalée. */
function testS9_margeFaible(etat) {
  // total 6 matchs × 2 × 10 = 120 ; plafond 130 ⇒ marge 10 (≤ 10) → faible.
  var faible = assemblerPrevisionnelJourneeFFR(6, { nature: 'predit', complet: true, matinMatchs: 3, apremMatchs: 3 }, '2', '10', '130');
  _ffrAssert(etat, faible && faible.marge === 10 && faible.margeFaible === true, 'margeFaible : marge 10 → signalée');
  var large = assemblerPrevisionnelJourneeFFR(5, { nature: 'predit', complet: true, matinMatchs: 2, apremMatchs: 3 }, '2', '10', '130');
  _ffrAssert(etat, large && large.marge === 30 && large.margeFaible === false, 'margeFaible : marge 30 → non signalée');
}

/* -------------------------------------------------------------------------- */
/*  Session 10 — défaut PRUDENT par construction (table de formules)          */
/* -------------------------------------------------------------------------- */

/**
 * §4.2 — LE test qui protège la FORME de la règle. Un format qui n'a JAMAIS été déclaré doit tomber
 * sur le chemin prudent (4.B), sans erreur et sans conclusion rassurante. Il n'existe pas pour couvrir
 * un cas réel : il existe pour que quiconque ajoutera un format demain SANS écrire sa formule obtienne
 * le comportement prudent, et non un silence dangereux. Maintenant que CROISE/DIAGONAL/LIBRE sont tous
 * dans la table, c'est le seul test qui vérifie que le défaut reste prudent PAR CONSTRUCTION.
 */
function testS10_formatInventeChemin4B(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2', 'B3']]); // matinMax 2
  var p = previsionnelCategorieFFR(matin, [], 'FORMAT_IMAGINAIRE_2027', '2', '10', '130');
  _ffrAssert(etat, p !== null, 'formatInvente : pas d\'erreur, un objet est produit');
  _ffrAssert(etat, p.nature === 'partiel' && p.complet === false, 'formatInvente : chemin prudent (partiel, non complet)');
  _ffrAssert(etat, p.minutes === 40 && p.depasse === false && p.margeFaible === false,
    'formatInvente : 40 min < 130 mais complet=false ⇒ le front ne conclut JAMAIS « sous le plafond »');
}

/** §4.4 #2 — format d'après-midi VIDE : même chemin prudent qu'un format inconnu. */
function testS10_formatVideChemin4B(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3'], ['B1', 'B2', 'B3']]);
  var p = previsionnelCategorieFFR(matin, [], '', '2', '10', '130');
  _ffrAssert(etat, p && p.nature === 'partiel' && p.complet === false, 'formatVide : chemin prudent, jamais complet');
}

/** §4.4 #3 — format inconnu dont la borne basse (le matin) dépasse DÉJÀ ⇒ dépassement signalé (asymétrie). */
function testS10_formatInconnuDepasseSignale(etat) {
  var matin = _matinPoules([['A1', 'A2', 'A3', 'A4']]); // poule de 4 → matinMax 3 → 3×2×10 = 60
  var p = previsionnelCategorieFFR(matin, [], 'FORMAT_IMAGINAIRE_2027', '2', '10', '40');
  _ffrAssert(etat, p && p.complet === false, 'formatInconnuDep : total partiel');
  _ffrAssert(etat, p && p.depasse === true && p.depassement === 20,
    'formatInconnuDep : le matin seul (60) dépasse déjà 40 ⇒ signalé malgré l\'incomplétude');
}

/**
 * §4.4 #10 — NON-RÉGRESSION de la génération : `formatApresMidi()` traite toujours un format vide
 * comme CROISE (comportement historique INCHANGÉ). Cette session rend la décision VISIBLE ailleurs,
 * elle ne change AUCUN match généré.
 */
function testS10_generationInchangeeFormatVide(etat) {
  _ffrAssert(etat, formatApresMidi({ format_apresmidi: '' }) === 'CROISE', 'genInchangee : format vide → CROISE (génération)');
  _ffrAssert(etat, formatApresMidi({ format_apresmidi: 'LIBRE' }) === 'LIBRE', 'genInchangee : LIBRE reste LIBRE');
  _ffrAssert(etat, formatApresMidi({}) === 'CROISE', 'genInchangee : format absent → CROISE (défaut historique)');
}

/** §4.4 #8 — feuille d'autorisation : format vide ⇒ « non configuré — CROISE serait appliqué », champ manquant. */
function testS10_feuilleFormatVide(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: {} },
    _cfgAutorisation([{ categorie: 'U12' }]), _refAutorisation());
  var fmt = _autoChamp(d, 'U12 — format sportif');
  _ffrAssert(etat, fmt && fmt.etat === 'manquant', 'feuilleVide : champ toujours compté manquant (personne ne l\'a choisi)');
  _ffrAssert(etat, fmt && /CROISE serait appliqué/.test(fmt.origine),
    'feuilleVide : motif « non configuré — CROISE serait appliqué par défaut »');
}

/** §4.4 #9 — feuille d'autorisation : format vide ⇒ un signalement de cohérence (avert) apparaît, hors manquants. */
function testS10_feuilleFormatVideSignalement(etat) {
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: {} },
    _cfgAutorisation([{ categorie: 'U12' }]), _refAutorisation());
  var av = _autoChamp(d, 'Format d\'après-midi non configuré');
  _ffrAssert(etat, av && av.etat === 'avert' && /CROISE serait appliqué/.test(av.valeur),
    'feuilleVideSig : signalement de cohérence présent (avert, hors compteur de manquants)');
}

/* -------------------------------------------------------------------------- */
/*  Session 11 — forme de jeu retenue (déclarative) + tir au but PRUDENT.       */
/*  Deux fonctions PURES : libelleFormeFFR / reglesPourCombosFFR (tir_au_but)   */
/*  et la levée d'ambiguïté de calculerApplicationFFR par la forme retenue.     */
/* -------------------------------------------------------------------------- */

/** Une ligne RefFFR_Regles M14/RE/15x15 joignable, avec la valeur `tir_au_but` demandée. */
function _ffrRegleTir(tirAuBut) {
  return [{ categorie: 'M14', forme_jeu: 'RE', effectif: '15x15', effectif_terrain: '15',
    effectif_max_feuille: '13', terrain_longueur_m: '', terrain_largeur_m: '', terrain_libelle: 'Terrain normal',
    ballon: 'T5', carton_jaune_min: '2', contexte: 'TOURNOI', joint_refffr_formes: 'OUI',
    tir_au_but: tirAuBut, millesime: '2026-2027' }];
}
function _ffrCombo15() { return [{ categorie: 'M14', forme_jeu: 'RE', effectif: '15x15' }]; }

/** libelleFormeFFR : identité canonique « forme — effectif », tolère les valeurs vides. */
function testS11_libelleForme(etat) {
  _ffrAssert(etat, libelleFormeFFR('RE', '15x15') === 'RE — 15x15', 'libelle : RE + 15x15 → « RE — 15x15 »');
  _ffrAssert(etat, libelleFormeFFR('RE', '') === 'RE', 'libelle : effectif vide → forme seule');
  _ffrAssert(etat, libelleFormeFFR('', '') === '', 'libelle : tout vide → chaîne vide');
  _ffrAssert(etat, libelleFormeFFR(' RE ', ' 15x15 ') === 'RE — 15x15', 'libelle : espaces normalisés');
}

/** Colonne tir_au_but ABSENTE (regles S5) ⇒ PAS de tir au but (false), jamais d'erreur. */
function testS11_tirAuButColonneAbsente(etat) {
  var r = reglesPourCombosFFR(_ffrRefS5().regles, '12', [{ categorie: 'M12', forme_jeu: 'RE', effectif: '10x10' }]);
  _ffrAssert(etat, r.length === 1, 'tirAbsent : une règle M12/RE/10x10 remontée');
  _ffrAssert(etat, r[0].tir_au_but === false, 'tirAbsent : colonne absente ⇒ tir_au_but = false (prudent)');
}

/** tir_au_but = « OUI » (casse/espaces ignorés) ⇒ tir au but autorisé (true). */
function testS11_tirAuButOui(etat) {
  var r = reglesPourCombosFFR(_ffrRegleTir('OUI'), '14', _ffrCombo15());
  _ffrAssert(etat, r.length === 1 && r[0].tir_au_but === true, 'tirOui : « OUI » ⇒ true');
  var r2 = reglesPourCombosFFR(_ffrRegleTir('  oui '), '14', _ffrCombo15());
  _ffrAssert(etat, r2.length === 1 && r2[0].tir_au_but === true, 'tirOui : «  oui  » (casse/espaces) ⇒ true');
}

/** Toute valeur AUTRE que « OUI » ⇒ PAS de tir au but (false). Aucun défaut « comme une autre ». */
function testS11_tirAuButValeurInattendue(etat) {
  ['NON', '1', 'vrai', 'O', 'yes', 'X', ''].forEach(function (v) {
    var r = reglesPourCombosFFR(_ffrRegleTir(v), '14', _ffrCombo15());
    _ffrAssert(etat, r.length === 1 && r[0].tir_au_but === false,
      'tirInattendu : « ' + v + ' » ⇒ false (seul « OUI » autorise)');
  });
}

/** forme_jeu VIDE (ou non fournie) ⇒ comportement STRICTEMENT identique à aujourd'hui (U14 janvier = ambigu). */
function testS11_formeJeuVideInchange(etat) {
  var sans = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-01-16', '1', '4', null, {});
  var vide = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-01-16', '1', '4', null, {}, '');
  _ffrAssert(etat, sans.ambigu === true && vide.ambigu === true, 'formeVide : ambigu dans les deux cas');
  _ffrAssert(etat, JSON.stringify(sans) === JSON.stringify(vide), 'formeVide : résultat identique (aucun effet de bord)');
}

/** Mois à UNE seule forme (U12 juin) : préciser la forme ne change rien (déjà appliqué). */
function testS11_formeJeuMonoInchange(etat) {
  var sans = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, {});
  var avec = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, {}, 'RE — 10x10');
  _ffrAssert(etat, JSON.stringify(sans.dimensions) === JSON.stringify(avec.dimensions) &&
    JSON.stringify(sans.champsZoneB) === JSON.stringify(avec.champsZoneB),
    'formeMono : forme précisée sur mois mono-forme ⇒ résultat inchangé');
}

/** forme_jeu = « RE — 15x15 » (jeu à XV) ⇒ ambiguïté LEVÉE, on applique le jeu à 15 (terrain normal). */
function testS11_formeJeuLeveAmbiguite15x15(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-01-16', '1', '4', null, {}, 'RE — 15x15');
  _ffrAssert(etat, r.ambigu === false, 'leve15 : ambiguïté levée par la forme retenue');
  _ffrAssert(etat, r.forme && r.forme.effectif === '15x15', 'leve15 : forme appliquée = 15x15');
  _ffrAssert(etat, r.dimensions === null && r.champsZoneB.effectif_max === '13',
    'leve15 : « terrain normal » (aucune dimension) + effectif_max appliqué');
}

/** forme_jeu = « RE — 10x10 » ⇒ ambiguïté levée sur l'AUTRE forme (jeu à 10 chiffré 56×45). */
function testS11_formeJeuLeveAmbiguite10x10(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-01-16', '1', '4', null, {}, 'RE — 10x10');
  _ffrAssert(etat, r.ambigu === false && r.forme && r.forme.effectif === '10x10', 'leve10 : forme appliquée = 10x10');
  _ffrAssert(etat, r.dimensions && r.dimensions.U14 && r.dimensions.U14.l === 56 && r.dimensions.U14.w === 45,
    'leve10 : dimensions U14 = 56 × 45');
}

/** forme_jeu HORS du mois (« RE — 7x7 » absent en janvier) ⇒ PAS d'application (comportement inchangé, ambigu). */
function testS11_formeJeuHorsMoisPasDApplication(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U14', '2027-01-16', '1', '4', null, {}, 'RE — 7x7');
  _ffrAssert(etat, r.ambigu === true, 'horsMois : forme inconnue ⇒ ambiguïté NON levée (comportement inchangé)');
  _ffrAssert(etat, r.formesDisponibles.length === 2, 'horsMois : les deux formes du mois restent exposées');
}

/* -------------------------------------------------------------------------- */
/*  Session 12 — saisie détaillée du score (tir au but).                       */
/*  Fonctions PURES : litDetailEquipe, tirAuButCategorieFFR, essaisConnusEquipe */
/*  + levée d'ambiguïté des règles servies à l'admin (evaluerConformiteFFR).    */
/* -------------------------------------------------------------------------- */

/** Référentiel : M14 janvier 10x10|15x15 ; seul le 15x15 (jeu à XV) tire au but. */
function _ffrRefS12() {
  return {
    millesime: '2026-2027', dates: [],
    formes: [
      { categorie: 'M14', mois: '2027-01', forme_jeu: 'RE', effectif: '10x10|15x15', tournoi_autorise: 'OUI', millesime: '2026-2027' }
    ],
    regles: [
      { categorie: 'M14', forme_jeu: 'RE', effectif: '10x10', effectif_terrain: '10', effectif_max_feuille: '13', terrain_longueur_m: '56', terrain_largeur_m: '45', terrain_libelle: '', ballon: 'T4', carton_jaune_min: '2', joint_refffr_formes: 'OUI', tir_au_but: 'NON', millesime: '2026-2027' },
      { categorie: 'M14', forme_jeu: 'RE', effectif: '15x15', effectif_terrain: '15', effectif_max_feuille: '13', terrain_longueur_m: '', terrain_largeur_m: '', terrain_libelle: 'Terrain normal', ballon: 'T5', carton_jaune_min: '2', joint_refffr_formes: 'OUI', tir_au_but: 'OUI', millesime: '2026-2027' }
    ],
    temps: []
  };
}

/** litDetailEquipe : AUCUN champ détail ⇒ null ⇒ mode simple (score inchangé, comportement historique). */
function testS12_detailAbsentModeSimple(etat) {
  _ffrAssert(etat, litDetailEquipe({ score_A: '5' }, 'A') === null, 'detailAbsent : aucun champ détail ⇒ null (score inchangé)');
  _ffrAssert(etat, litDetailEquipe({}, 'B') === null, 'detailAbsent : data vide ⇒ null');
}

/** litDetailEquipe : détail saisi ⇒ score recalculé (essai 5, transfo 2, pénalité 3, drop 3). */
function testS12_detailScoreRecalcule(etat) {
  var d = litDetailEquipe({ essais_A: '3', transfo_A: '2', pen_A: '1', drop_A: '1' }, 'A');
  _ffrAssert(etat, d && d.error === undefined, 'detailScore : objet détail sans erreur');
  _ffrAssert(etat, d.points === (3 * 5 + 2 * 2 + 1 * 3 + 1 * 3), 'detailScore : 3E+2T+1P+1D = 25 pts');
  var e = litDetailEquipe({ essais_B: '4' }, 'B');
  _ffrAssert(etat, e && e.points === 20 && e.transfo === 0 && e.pen === 0 && e.drop === 0,
    'detailScore : 4 essais seuls = 20 pts (autres = 0)');
  var z = litDetailEquipe({ essais_A: '0', transfo_A: '0', pen_A: '0', drop_A: '0' }, 'A');
  _ffrAssert(etat, z && z.points === 0, 'detailScore : 0 partout ⇒ 0 pt (score détaillé valide)');
}

/** litDetailEquipe : champ non entier ⇒ erreur explicite (jamais un score fabriqué). */
function testS12_detailInvalide(etat) {
  var d = litDetailEquipe({ essais_A: '2', transfo_A: 'x' }, 'A');
  _ffrAssert(etat, d && typeof d.error === 'string', 'detailInvalide : transfo « x » ⇒ erreur');
  var n = litDetailEquipe({ essais_A: '-1' }, 'A');
  _ffrAssert(etat, n && typeof n.error === 'string', 'detailInvalide : essais négatif ⇒ erreur');
}

/** tirAuButCategorieFFR : colonne tir_au_but ABSENTE (regles S5) ⇒ false ⇒ page de saisie inchangée. */
function testS12_tirAbsentPageSimple(etat) {
  _ffrAssert(etat, tirAuButCategorieFFR(_ffrRefS5(), 'U12', '2027-06-13', '') === false,
    'tirAbsent : pas de colonne tir_au_but ⇒ false (page simple)');
  _ffrAssert(etat, tirAuButCategorieFFR({ formes: [], regles: [] }, 'U14', '2027-01-16', 'RE — 15x15') === false,
    'tirAbsent : référentiel vide ⇒ false (migration douce)');
}

/** tirAuButCategorieFFR : U14 à XV (15x15, tir_au_but OUI) selon la forme retenue — prudent sinon. */
function testS12_tirOuiFormeRetenue(etat) {
  var ref = _ffrRefS12();
  _ffrAssert(etat, tirAuButCategorieFFR(ref, 'U14', '2027-01-16', 'RE — 15x15') === true,
    'tirOui : U14 15x15 (tir_au_but OUI) + forme retenue ⇒ true');
  _ffrAssert(etat, tirAuButCategorieFFR(ref, 'U14', '2027-01-16', '') === false,
    'tirOui : ambiguïté 10x10|15x15 non levée ⇒ prudent false');
  _ffrAssert(etat, tirAuButCategorieFFR(ref, 'U14', '2027-01-16', 'RE — 10x10') === false,
    'tirOui : forme 10x10 (tir_au_but NON) ⇒ false');
}

/** essaisConnusEquipe : détail ⇒ essais ; non-tir CONNU ⇒ score ; tir/inconnu ⇒ null (jamais de faux positif). */
function testS12_essaisHelper(etat) {
  _ffrAssert(etat, essaisConnusEquipe('4', '20', true) === 4, 'essais : colonne remplie ⇒ 4 (même en tir au but)');
  _ffrAssert(etat, essaisConnusEquipe('', '3', false) === 3, 'essais : non-tir CONNU + score ⇒ 3 (1 essai = 1 pt)');
  _ffrAssert(etat, essaisConnusEquipe('', '22', true) === null, 'essais : tir au but sans détail ⇒ null (jamais déduit)');
  // Capacité INCONNUE (backend pas redéployé) : un score en points ne doit PAS être pris pour des essais.
  _ffrAssert(etat, essaisConnusEquipe('', '17', null) === null, 'essais : capacité inconnue ⇒ null (pas de faux positif)');
  _ffrAssert(etat, essaisConnusEquipe('', '17') === null, 'essais : tirAuBut absent ⇒ null (prudent)');
  _ffrAssert(etat, essaisConnusEquipe('', '', false) === null, 'essais : rien de connu ⇒ null (alerte muette)');
  _ffrAssert(etat, essaisConnusEquipe('0', '', true) === 0, 'essais : détail 0 ⇒ 0 (connu, pas null)');
}

/** evaluerConformiteFFR : la forme retenue réduit les règles servies à UNE (bouton « Appliquer » atteignable). */
function testS12_conformiteFormeReduitRegles(etat) {
  var ref = _ffrRefS5();
  // Sans forme retenue : U14 janvier ⇒ 2 règles (10x10 et 15x15) = ambigu.
  var sans = evaluerConformiteFFR(ref, '2027-01-16', ['U14'], 'C', { equipesParCategorie: { U14: '4' }, nbDemiJournees: '1' });
  _ffrAssert(etat, (sans.regles.U14 || []).length === 2, 'conformite : sans forme retenue ⇒ 2 règles (ambigu)');
  // Avec forme retenue « RE — 15x15 » : une seule règle.
  var avec = evaluerConformiteFFR(ref, '2027-01-16', ['U14'], 'C',
    { equipesParCategorie: { U14: '4' }, nbDemiJournees: '1', formesRetenues: { U14: 'RE — 15x15' } });
  _ffrAssert(etat, (avec.regles.U14 || []).length === 1, 'conformite : forme retenue ⇒ 1 règle (ambiguïté levée)');
  _ffrAssert(etat, avec.regles.U14[0].effectif === '15x15', 'conformite : la règle retenue est bien le 15x15');
}

/* -------------------------------------------------------------------------- */
/*  Session 13 — contexte U14 (Super Challenge de France), normaliseur PRUDENT */
/*  contexteScfCategorie(cat) → { contexte:'LAMBDA'|'SCF', phase:'P2'|'P3',    */
/*  estScf:boolean }. Ne s'applique QU'À l'U14 (M14) ; défaut = comportement   */
/*  historique (LAMBDA / P2). Pur, sans classeur.                              */
/* -------------------------------------------------------------------------- */

/** Colonne absente sur une U14 ⇒ LAMBDA (comportement historique inchangé). */
function testS13_defautLambdaSansColonne(etat) {
  var r = contexteScfCategorie({ categorie: 'U14' });
  _ffrAssert(etat, r.contexte === 'LAMBDA' && r.estScf === false, 'S13 : U14 sans colonne ⇒ LAMBDA (historique)');
  _ffrAssert(etat, r.phase === 'P2', 'S13 : phase par défaut ⇒ P2');
}

/** 'LAMBDA' explicite ⇒ LAMBDA. */
function testS13_lambdaExplicite(etat) {
  var r = contexteScfCategorie({ categorie: 'U14', contexte_tournoi: 'LAMBDA' });
  _ffrAssert(etat, r.contexte === 'LAMBDA' && r.estScf === false, 'S13 : LAMBDA explicite ⇒ LAMBDA');
}

/** 'SCF' sur une U14 ⇒ SCF. */
function testS13_scfSurU14(etat) {
  var r = contexteScfCategorie({ categorie: 'U14', contexte_tournoi: 'SCF' });
  _ffrAssert(etat, r.contexte === 'SCF' && r.estScf === true, 'S13 : SCF sur U14 ⇒ SCF');
}

/** 'SCF' déposé par erreur sur une autre catégorie (U12) ⇒ IGNORÉ (LAMBDA), jamais deviné. */
function testS13_scfIgnoreHorsU14(etat) {
  var r = contexteScfCategorie({ categorie: 'U12', contexte_tournoi: 'SCF' });
  _ffrAssert(etat, r.contexte === 'LAMBDA' && r.estScf === false, 'S13 : SCF hors U14 ⇒ ignoré (LAMBDA)');
}

/** La source FFR note « M14 » : l'appariement M↔U doit reconnaître la catégorie. */
function testS13_scfApparieM14(etat) {
  var r = contexteScfCategorie({ categorie: 'M14', contexte_tournoi: 'SCF' });
  _ffrAssert(etat, r.estScf === true, 'S13 : M14 (notation FFR) reconnu comme U14 ⇒ SCF');
}

/** Phase vide sous SCF ⇒ P2 (défaut prudent). */
function testS13_phaseDefautP2(etat) {
  var r = contexteScfCategorie({ categorie: 'U14', contexte_tournoi: 'SCF', scf_phase: '' });
  _ffrAssert(etat, r.phase === 'P2', 'S13 : phase vide ⇒ P2');
}

/** 'P3' ⇒ P3. */
function testS13_phaseP3(etat) {
  var r = contexteScfCategorie({ categorie: 'U14', contexte_tournoi: 'SCF', scf_phase: 'P3' });
  _ffrAssert(etat, r.phase === 'P3', 'S13 : scf_phase P3 ⇒ P3');
}

/** Phase inconnue ⇒ retombe sur P2 (jamais une valeur inventée). */
function testS13_phaseInconnueRetombeP2(etat) {
  var r = contexteScfCategorie({ categorie: 'U14', contexte_tournoi: 'SCF', scf_phase: 'P9' });
  _ffrAssert(etat, r.phase === 'P2', 'S13 : phase inconnue ⇒ P2 (prudent)');
}

/** Contexte inconnu ⇒ LAMBDA (on n'active jamais SCF sur une valeur douteuse). */
function testS13_valeurContexteInconnueLambda(etat) {
  var r = contexteScfCategorie({ categorie: 'U14', contexte_tournoi: 'BIDON' });
  _ffrAssert(etat, r.contexte === 'LAMBDA', 'S13 : contexte inconnu ⇒ LAMBDA');
}

/** Casse et espaces tolérés (le classeur peut renvoyer « scf » / «  p3  »). */
function testS13_casseEtEspaces(etat) {
  var r = contexteScfCategorie({ categorie: 'u14', contexte_tournoi: '  scf  ', scf_phase: ' p3 ' });
  _ffrAssert(etat, r.estScf === true, 'S13 : « scf » minuscule + espaces ⇒ SCF');
  _ffrAssert(etat, r.phase === 'P3', 'S13 : « p3 » minuscule + espaces ⇒ P3');
}

/* -------------------------------------------------------------------------- */
/*  Session 14 (PR A) — génération Super Challenge Phase 2                     */
/*  dureeMatchScf / fixtureQuadrangulaireScf / fixtureScfGroupe (purs) +       */
/*  intégration calculerPlanning (4 équipes SCF → quadrangulaire 4 matchs,     */
/*  temps forcé 2×15 ; lambda inchangé → round-robin 6 matchs).                */
/* -------------------------------------------------------------------------- */

/** Compte combien de fois chaque équipe apparaît dans une liste de {a,b}. */
function _scfCompteApparitions(matchs) {
  var c = {};
  matchs.forEach(function (m) { c[m.a] = (c[m.a] || 0) + 1; c[m.b] = (c[m.b] || 0) + 1; });
  return c;
}

/** P2 : 2×15 + pause de mi-temps de la catégorie. */
function testS14_dureeP2(etat) {
  _ffrAssert(etat, dureeMatchScf({ pause_mi_temps_min: '2' }, 'P2') === 32, 'S14 : durée P2 = 2×15 + 2 = 32');
  _ffrAssert(etat, dureeMatchScf({ pause_mi_temps_min: '' }, 'P2') === 30, 'S14 : durée P2 sans pause = 30');
}

/** P3 : 2×11 + pause. */
function testS14_dureeP3(etat) {
  _ffrAssert(etat, dureeMatchScf({ pause_mi_temps_min: '2' }, 'P3') === 24, 'S14 : durée P3 = 2×11 + 2 = 24');
}

/** Phase absente/inconnue ⇒ traitée comme P2 (2×15), défaut prudent. */
function testS14_dureePhaseDefaut(etat) {
  _ffrAssert(etat, dureeMatchScf({ pause_mi_temps_min: '0' }, '') === 30, 'S14 : phase vide ⇒ P2 (30)');
}

/** Quadrangulaire : exactement 4 rencontres. */
function testS14_quadrangulaireQuatreMatchs(etat) {
  var f = fixtureQuadrangulaireScf(['A', 'B', 'C', 'D']);
  _ffrAssert(etat, f && f.length === 4, 'S14 : quadrangulaire = 4 matchs');
}

/** Quadrangulaire : chaque équipe joue EXACTEMENT 2 matchs (≠ round-robin de 4 = 3 chacun). */
function testS14_quadrangulaireChacunDeux(etat) {
  var c = _scfCompteApparitions(fixtureQuadrangulaireScf(['A', 'B', 'C', 'D']));
  _ffrAssert(etat, c.A === 2 && c.B === 2 && c.C === 2 && c.D === 2, 'S14 : quadrangulaire = 2 matchs par équipe');
}

/** Quadrangulaire : 2 tournées, chaque équipe joue une fois par tournée (repos entre ses matchs). */
function testS14_quadrangulaireDeuxTournees(etat) {
  var f = fixtureQuadrangulaireScf(['A', 'B', 'C', 'D']);
  var r0 = f.filter(function (m) { return m.round === 0; });
  var r1 = f.filter(function (m) { return m.round === 1; });
  var vus0 = _scfCompteApparitions(r0), vus1 = _scfCompteApparitions(r1);
  var okR0 = ['A', 'B', 'C', 'D'].every(function (e) { return vus0[e] === 1; });
  var okR1 = ['A', 'B', 'C', 'D'].every(function (e) { return vus1[e] === 1; });
  _ffrAssert(etat, r0.length === 2 && r1.length === 2 && okR0 && okR1, 'S14 : 2 tournées équilibrées (1 match/équipe/tournée)');
}

/** Effectif ≠ 4 ⇒ null (le helper de groupe s'en occupe autrement). */
function testS14_quadrangulaireTailleInvalide(etat) {
  _ffrAssert(etat, fixtureQuadrangulaireScf(['A', 'B', 'C']) === null, 'S14 : quadrangulaire à 3 ⇒ null');
  _ffrAssert(etat, fixtureQuadrangulaireScf(['A', 'B', 'C', 'D', 'E']) === null, 'S14 : quadrangulaire à 5 ⇒ null');
}

/** Groupe de 3 ⇒ triangulaire = round-robin de 3 (3 matchs, 2 par équipe). */
function testS14_groupeTriangulaire(etat) {
  var f = fixtureScfGroupe(['A', 'B', 'C'], 'U14');
  var c = _scfCompteApparitions(f);
  _ffrAssert(etat, f.length === 3 && c.A === 2 && c.B === 2 && c.C === 2, 'S14 : triangulaire = 3 matchs, 2 par équipe');
}

/** Taille inattendue (2, 5…) ⇒ avertissement émis + repli round-robin (jamais de blocage). */
function testS14_groupeTailleInattendueAvertit(etat) {
  var avs = [];
  var f = fixtureScfGroupe(['A', 'B'], 'U14', function (m) { avs.push(m); });
  _ffrAssert(etat, avs.length === 1, 'S14 : groupe de 2 ⇒ un avertissement émis');
  _ffrAssert(etat, f.length === 1, 'S14 : repli round-robin (ne bloque pas la génération)');
}

/** Fabrique une config + équipes minimales pour tester calculerPlanning. */
function _scfConfigPlanning(scf) {
  var cat = {
    categorie: 'U14', presente: 'oui', terrains: '1,2', nb_poules: '1',
    format_mi_temps: '2', duree_mi_temps_min: '10', pause_mi_temps_min: '2',
    recup_entre_matchs_min: '5', contexte_tournoi: scf ? 'SCF' : '', scf_phase: scf ? 'P2' : ''
  };
  var equipes = [
    { id_equipe: 'E1', nom_equipe: 'Alpha', categorie: 'U14' },
    { id_equipe: 'E2', nom_equipe: 'Bravo', categorie: 'U14' },
    { id_equipe: 'E3', nom_equipe: 'Charlie', categorie: 'U14' },
    { id_equipe: 'E4', nom_equipe: 'Delta', categorie: 'U14' }
  ];
  return { config: { global: { heure_debut: '09:00', battement_terrain_min: '5' }, categories: [cat] }, equipes: equipes };
}

/** Intégration : 4 équipes U14 en SCF, 1 poule ⇒ quadrangulaire = 4 matchs (pas 6). */
function testS14_planningQuadrangulaireQuatreMatchs(etat) {
  var d = _scfConfigPlanning(true);
  var r = calculerPlanning(d.config, d.equipes, false);
  _ffrAssert(etat, r.matchsFinaux.length === 4, 'S14 : planning SCF 4 équipes ⇒ 4 matchs (quadrangulaire)');
}

/** Intégration : le temps de jeu est FORCÉ à 2×15 (+ pause 2) = 32 min, pas la durée des réglages (2×10). */
function testS14_planningTempsForce(etat) {
  var d = _scfConfigPlanning(true);
  var r = calculerPlanning(d.config, d.equipes, false);
  var m = r.matchsFinaux[0]; // ligne = [id, cat, poule, terrain, debut, fin, A, B, ...]
  var dureeReelle = hmVersMin(m[5]) - hmVersMin(m[4]);
  _ffrAssert(etat, dureeReelle === 32, 'S14 : durée d\'un match SCF = 32 min (2×15+2), pas 22 (2×10+2)');
}

/** Non-régression : les MÊMES 4 équipes hors SCF ⇒ round-robin classique = 6 matchs, durée 2×10+2. */
function testS14_planningLambdaInchange(etat) {
  var d = _scfConfigPlanning(false);
  var r = calculerPlanning(d.config, d.equipes, false);
  _ffrAssert(etat, r.matchsFinaux.length === 6, 'S14 : hors SCF, 4 équipes ⇒ 6 matchs (round-robin inchangé)');
  var m = r.matchsFinaux[0];
  _ffrAssert(etat, (hmVersMin(m[5]) - hmVersMin(m[4])) === 22, 'S14 : hors SCF, durée = 22 min (réglages catégorie)');
}
