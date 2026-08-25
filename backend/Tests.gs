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
  testCfg_invitationVitrineCadreSportif(etat);
  testCfg_vitrineVoitTournoiPublie(etat);
  testCfg_aliasLegacyBoutique(etat);
  testCfg_motCleClubEnVueLive(etat);
  testCfg_liensPersonnalisesEmail(etat);
  testClubs_planSyncEquipes(etat);
  testClubs_colonneSelectionEnregistree(etat);
  testClubs_gelReponsesJ16(etat);
  testClubs_planSuppressionCascade(etat);
  testClubs_collisionNomsClubs(etat);
  testClubs_categoriesDupliquees(etat);
  testClubs_numerotationHomogene(etat);
  testCfg_jetonDossier(etat);
  testDossier_equipesDuClub(etat);
  testDossier_verrouPlanning(etat);
  testDossier_declareEtGel(etat);

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

  // Session 14 (PR B) — Super Challenge Phase 3 : brassage du dimanche + planif 2ᵉ journée.
  testS14b_brassageTroisNiveaux(etat);
  testS14b_brassageRoundRobinParNiveau(etat);
  testS14b_dimancheDepartJour2(etat);
  testS14b_dimancheTemps2x11(etat);
  testS14b_apresMidiLambdaInchange(etat);

  // Session 14 (PR grouping) — Super Challenge : regroupement en TRIANGULAIRES.
  testS14c_nbGroupesMultipleDe3(etat);
  testS14c_nbGroupesReste1Quad(etat);
  testS14c_nbGroupesReste2(etat);
  testS14c_planning12EquipesTriangulaires(etat);
  testS14c_planning6EquipesDeuxTriangulaires(etat);
  testS14c_phase3QuadAvertit(etat);

  // Session 14 (PR D) — arbitrage désigné (l'équipe qui ne joue pas).
  testS14d_triangulaireArbitre3eEquipe(etat);
  testS14d_quadrangulaireArbitreReglement(etat);
  testS14d_arbitreNeJouePas(etat);
  testS14d_matchObjToRowPreserveArbitre(etat);
  testS14d_planningEcritArbitre(etat);

  // Session 15 — pause méridienne échelonnée (2 vagues, repos ≥ 60, équité).
  testS15_vaguesPartition(etat);
  testS15_roundRobinComplet(etat);
  testS15_repos60SixEquipes(etat);
  testS15_repos60HuitEquipes(etat);
  testS15_equiteReposeVsFatigue(etat);
  testS15_impairRoundRobinComplet(etat);
  testS15_impairRepos60(etat);
  testS15_impairEquite(etat);
  testS15_planningUnePoule(etat);
  testS15_planningReposGaranti(etat);
  testS15_planningImpairEchelonne(etat);
  testS15_effectifTropPetitRepli(etat);
  testS15_reglageGlobalPasParCategorie(etat);
  testS15_finPauseDerniereEquipe(etat);

  // Session 16 — norme FFR dans la carte : effectif min appliqué + garde-fou durée à la génération.
  testS16_effectifMinTerrain(etat);
  testS16_effectifMinTerrainAutreForme(etat);
  testS16_gardeGenerationDureeVide(etat);
  testS16_gardeGenerationDureeRenseignee(etat);
  testS16_gardeGenerationIgnoreVidesEtAbsentes(etat);

  // Session 17 — « Trouver une date compatible » : jours compatibles FFR d'un mois.
  testS17_helpersDate(etat);
  testS17_moisInvalide(etat);
  testS17_uniquementDimMerSam(etat);
  testS17_conflitEtCompatible(etat);
  testS17_vigilanceApplicable(etat);
  testS17_refAbsentInconnu(etat);

  // Session 18 — feuille de report : champ ouvert « sans objet » quand sa question fermée = non.
  testS18_medecinNonSansObjet(etat);
  testS18_medecinOuiResteManquant(etat);
  testS18_questionVideResteManquant(etat);
  testS18_labelNonDateSansObjet(etat);
  testS18_labelDefautOuiDateManquante(etat);
  testS18_logistiqueNonSansObjet(etat);
  testS18_valeurSaisieConservee(etat);
  testS18_sansObjetJamaisCompte(etat);

  // Session 19 — feuille de report : phase 2 PRÉDITE (exacte) quand l'après-midi n'est pas généré.
  testS19_phase2PrediteCroiseDeuxPoules(etat);
  testS19_phase2PrediteCroiseTroisPoules(etat);
  testS19_diagonalEgalPredit(etat);
  testS19_diagonalInegalJamaisPredit(etat);
  testS19_librePreditJourneeEntiere(etat);
  testS19_sansPoulesEtiqueteesResteManquant(etat);
  testS19_scfJamaisPredit(etat);
  testS19_apremGenereResteConstate(etat);

  // Session 20 — nouveau format d'après-midi POULES_NIVEAU (round-robin complet par tranche).
  testS20_taillesPoulesNiveau(etat);
  testS20_ordonnancementMidi(etat);
  testS20_fixturesRoundRobinComplet(etat);
  testS20_fixturesMeilleur2eMonte(etat);
  testS20_formulePhase2(etat);
  testS20_reportPhase2Predite(etat);
  testS20_formatReconnu(etat);
  testS20_moinsDe2Equipes(etat);
  testS20_invitationExposeFormat(etat);

  // Session 21 — responsable sécurité : cascade depuis « Contacts & sécurité » (dossier complet).
  testS21_securiteIdentiqueRefTournoi(etat);
  testS21_securiteDistincte(etat);
  testS21_securiteDistincteVideResteManquant(etat);
  testS21_securiteToutVideManquant(etat);

  // Session 22 — droits d'inscription : cascade depuis les modalités (tarif d'engagement).
  testS22_droitsRepresDesModalites(etat);
  testS22_droitsSaisiPrioritaire(etat);
  testS22_tarifNonMontantSansObjet(etat);
  testS22_rienNullePartManquant(etat);

  // Session 23 — détail par équipe (joueurs + éducateurs) déclaré à la réponse d'invitation.
  testS23_detailValide(etat);
  testS23_detailLongueurFausse(etat);
  testS23_detailSousLeMinimum(etat);
  testS23_detailJoueursManquants(etat);
  testS23_educateursZeroAccepte(etat);
  testS23_educateursCascadeB3(etat);
  testS23_educateursTotalManuelEstUnRepli(etat);
  testS23_educateursRienManquant(etat);

  // Session 25 — type de terrain : cascade depuis la nature des grands terrains déclarés.
  testS25_natureCalculeeDepuisTerrains(etat);
  testS25_naturePrimeSurSaisi(etat);
  testS25_sansNatureRepliSaisi(etat);
  testS25_rienResteManquant(etat);
  testS25_jsonInvalidePrudent(etat);
  testS25_naturePartielleSignalee(etat);

  // Session 26 — éducateurs B.3 : cascade ADDITIVE (clubs déclarants + club organisateur).
  testS26_totalAdditionneLesDeuxSources(etat);
  testS26_declarePrimeSurTotalManuel(etat);
  testS26_totalManuelIgnoreSignale(etat);
  testS26_pasDeSignalementSansAncienTotal(etat);
  testS26_clubSeulSansDeclaration(etat);
  testS26_zeroClubEstUneReponse(etat);
  testS26_repliTotalManuel(etat);
  testS26_rienNullePartManquant(etat);
  testS26_valeurIllisiblePrudente(etat);

  // Session 27 — effectifs déclarés équipe par équipe (ajout / crayon) + anti-double-compte.
  testS27_sommeEquipesManuelles(etat);
  testS27_equipeAutoJamaisRecomptee(etat);
  testS27_sourceAbsenteEstManuelle(etat);
  testS27_rienDeclareDonneNull(etat);
  testS27_zeroEstUneReponse(etat);
  testS27_valeursIllisiblesIgnorees(etat);
  testS27_listeVideSansErreur(etat);
  testS27_participantsDepuisEquipes(etat);
  testS27_origineDetailleLesDeuxSources(etat);
  testS27_educateursDepuisEquipes(etat);
  testS27_declarationPartielleSignalee(etat);
  testS27_declarationCompletePasDeSignalement(etat);
  testS27_sansEffectifsComportementHistorique(etat);

  // Session 28 — une équipe retirée emporte ses effectifs (déduction, ou signalement).
  testS28_indexDepuisLeNom(etat);
  testS28_equipeRetireeDeduite(etat);
  testS28_nomDesigneLentree(etat);
  testS28_sansRetraitTotalIdentique(etat);
  testS28_selectionNonEnregistreeJamaisDeduite(etat);
  testS28_sansDetailSignaleJamaisDeduit(etat);
  testS28_detailIllisiblePrudent(etat);
  testS28_plusDequipesJamaisAjoute(etat);
  testS28_toutesRetireesTombeAZero(etat);
  testS28_collisionNomsClubs(etat);
  testS28_retraitParCategorie(etat);
  testS28_dossierParticipantsDeduits(etat);
  testS28_dossierRetraitNonDeduitSignale(etat);
  testS28_dossierSansRetraitInchange(etat);

  // Industrialisation session 6 — plafonds de l'écriture publique (R-014, audit sécurité).
  testS6sec_sousLesPlafondsOnEcrit(etat);
  testS6sec_bornesExactes(etat);
  testS6sec_leVolumePrimeSurLeDebit(etat);
  testS6sec_compteurInconnuNeRefuseJamais(etat);
  testS6sec_compteurSAdditionneDansLaFenetre(etat);
  testS6sec_fenetreSuivanteRepartDeZero(etat);
  testS6sec_appareilsIndependants(etat);
  testS6sec_cacheEnPanneNeCassePas(etat);
  testS6sec_identifiantInvalideRefuse(etat);

  // Industrialisation — chantier C-011 : le barème et le départage (R-041, décision D-025).
  testClassement_baremeVictoireNulDefaite(etat);
  testClassement_cumulSurPlusieursMatchs(etat);
  testClassement_departageParLesPoints(etat);
  testClassement_departageParLaDifference(etat);
  testClassement_departageParLesPointsMarquesEtOrdreStable(etat);

  // Industrialisation — chantier C-012, étape 1 : le cœur pur litSaisieScore (R-042). T-1 à T-5.
  testSaisieScore_identifiantManquant(etat);
  testSaisieScore_scoreSimpleInvalide(etat);
  testSaisieScore_modeSimpleReprisTelQuel(etat);
  testSaisieScore_modeDetailCalculeEtIgnoreLeScoreEnvoye(etat);
  testSaisieScore_detailUnSeulCoteLautreVautZero(etat);
  testSaisieScore_cascadeAVerifierQuatreConditions(etat);
  testDecisionScore_matchIntrouvable(etat);
  testDecisionScore_coupeEnAttente(etat);
  testDecisionScore_scoreDejaValide(etat);
  testDecisionScore_statutNfdRefuseQuandMeme(etat);
  testDecisionScore_egaliteExigeUnVainqueur(etat);
  testDecisionScore_vainqueurEtranger(etat);
  testDecisionScore_leScoreImposeLeVainqueur(etat);
  testDecisionScore_sondeVerifCle(etat);
  testDecisionScore_cascadeLecturesParesseuses(etat);
  testDecisionScore_vainqueurHorsCoupe(etat);
  testDecisionScore_modeSimpleNeTouchePasAuDetail(etat);

  // M1-B (D-043) — ce qui survit à une réinitialisation, et ce qui doit être vidé.
  testM1B_allowlistExactementLes26(etat);
  testM1B_les10PermanentsJamaisEffaces(etat);
  testM1B_partition36(etat);
  testM1B_recompensesDetectees(etat);
  testM1B_prefixeVoisinsNonAttrapes(etat);
  testM1B_aucuneCleHorsAutorisation(etat);
  testM1B_effacementVideSansSupprimerNiCreer(etat);
  testM1B_branchementDepuisReinitialisation(etat);
  testM1B_effacementsHistoriquesNonRegresses(etat);
  testM1B_dossierNestPlusEntierementSaisi(etat);
  testM1B_permanentsRestentSaisis(etat);
  testM1B_equipesEtrangeresDefautRestitue(etat);
  testM1B_typeTerrainCascadeLegitime(etat);

  // M1-B2 / B2-0 (D-050) — « conserver le contact, réinitialiser l'engagement » : ce qu'une
  // réinitialisation doit vider côté clubs (R-099, R-100), et ce qu'elle doit conserver.
  // ⭐ Spécification écrite pour SURVIVRE à la migration B2-2 — voir l'en-tête du bloc.
  // ⭐ Les HUIT résultats métier de `PLAN.md` §16.5 (formalisés le 2026-08-25).
  testB20_T1_aucunStatutHerite(etat);
  testB20_T2_aucunEffectifHerite(etat);
  testB20_T3_aucuneAlerteHeritee(etat);
  testB20_T4_cascadeFFRZeroZeroZero(etat);
  testB20_T5_carnetDurableConserve(etat);
  testB20_T6_ancienTokenInutilisable(etat);
  testB20_T7_tournoiIdNonHerite(etat);
  testB20_T8_aucuneColonneNonClassee(etat);
  // Contrôles structurels — ils COMPLÈTENT les huit, ils ne les remplacent pas.
  testB20_S1_decisionPure(etat);
  testB20_S2_nonRegressionHuitColonnes(etat);
  testB20_S3_casLimites(etat);
  testB20_temoinR101TerrainsResteB23(etat);

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

/** Refonte vitrine de l'invitation : la vue « invitation » expose le CADRE SPORTIF par catégorie
 *  (temps de jeu, pauses, récup, effectifs, forme FFR, SCF, règlement) et le déroulé horaire de la
 *  journée (lieu, coup d'envoi, pause méridienne, fin) — QUE des faits de format/horaire. Les
 *  frontières tiennent : ni téléphone, ni adresse précise, ni réglages internes, et la vue live
 *  reste minimale (aucun de ces champs n'y fuit). */
function testCfg_invitationVitrineCadreSportif(etat) {
  var cfg = {
    global: {
      tournoi_lieu: 'Stade Yves-du-Manoir, Colombes', tournoi_adresse: '12 rue du Stade',
      heure_debut: '10:00', pause_dejeuner_debut: '12:00', pause_dejeuner_duree_min: '60',
      heure_fin: '16:30', heure_fin_communiquee: '', marge_fin_communiquee_min: '75',
      contact_reponse_tel: '0612345678'
    },
    categories: [{ categorie: 'U14', presente: 'oui', format_mi_temps: '2', duree_mi_temps_min: '15',
      pause_mi_temps_min: '2', recup_entre_matchs_min: '15', effectif_max: '19',
      forme_jeu: 'Jeu à XV — 15x15', contexte_tournoi: 'SCF', scf_phase: 'P2',
      reglement: 'https://ffr.fr/reglement.pdf', terrains: '1,2', pause_echelonnee: 'oui' }]
  };
  var f = filtrerConfigPublique(cfg, 'invitation');
  var g = f.global, c = f.categories[0];
  // Le déroulé horaire et le lieu sortent (programme public par nature).
  _ffrAssert(etat, g.tournoi_lieu === 'Stade Yves-du-Manoir, Colombes', 'invVitrine : tournoi_lieu exposé');
  _ffrAssert(etat, g.heure_debut === '10:00' && g.pause_dejeuner_debut === '12:00',
    'invVitrine : coup d\'envoi + pause méridienne exposés');
  _ffrAssert(etat, g.heure_fin === '16:30' && g.marge_fin_communiquee_min === '75',
    'invVitrine : heure_fin + marge exposées (la « fin envisagée » peut enfin s\'afficher)');
  // Le cadre sportif de la catégorie sort en entier.
  _ffrAssert(etat, c.duree_mi_temps_min === '15' && c.pause_mi_temps_min === '2'
    && c.recup_entre_matchs_min === '15', 'invVitrine : temps de jeu, pause et récup exposés');
  _ffrAssert(etat, c.effectif_max === '19' && c.forme_jeu === 'Jeu à XV — 15x15',
    'invVitrine : effectif_max + forme_jeu exposés');
  _ffrAssert(etat, c.contexte_tournoi === 'SCF' && c.scf_phase === 'P2'
    && c.reglement === 'https://ffr.fr/reglement.pdf', 'invVitrine : contexte SCF + règlement exposés');
  // Les frontières TIENNENT : adresse précise et téléphone jamais en vitrine ; réglages internes
  // (terrains, pause_echelonnee) jamais publics.
  _ffrAssert(etat, !('tournoi_adresse' in g) && !('contact_reponse_tel' in g),
    'invVitrine : adresse précise + téléphone toujours exclus');
  _ffrAssert(etat, !('terrains' in c) && !('pause_echelonnee' in c),
    'invVitrine : terrains + pause_echelonnee restent internes');
  // Et la vue LIVE reste minimale : rien du cadre sportif n'y fuit.
  var live = filtrerConfigPublique(cfg, 'live');
  _ffrAssert(etat, !('duree_mi_temps_min' in (live.categories[0] || {}))
    && !('heure_debut' in live.global), 'invVitrine : la vue live reste minimale (aucune fuite)');
}

/** CONTRAT DE LA VITRINE : le site boutique-r92 interroge getConfig (vue « invitation ») et
 *  n'affiche la carte « Tournoi » des actualités — ni sa page d'article — que si le témoin
 *  `tournoi_publie` vaut 'oui'. Retirer ce champ de la liste blanche rend le bouton « Publier le
 *  tournoi » de l'admin SILENCIEUSEMENT sans effet côté vitrine (elle conclut « non publié »).
 *  Ce test tient les DEUX vues publiques consommées par un site : invitation ET live. */
function testCfg_vitrineVoitTournoiPublie(etat) {
  var cfg = { global: { tournoi_publie: 'oui', tournoi_nom: 'Challenge', contact_reponse_tel: '0612345678' },
              categories: [] };
  var inv = filtrerConfigPublique(cfg, 'invitation');
  _ffrAssert(etat, inv.global.tournoi_publie === 'oui',
    'vitrine : getConfig (invitation) expose tournoi_publie — sinon la carte actus n\'apparaît jamais');
  var live = filtrerConfigPublique(cfg, 'live');
  _ffrAssert(etat, live.global.tournoi_publie === 'oui',
    'vitrine : la vue live expose aussi tournoi_publie (page publique du tournoi)');
  // Le témoin passe bien à 'non' sans emporter les frontières de la vue.
  var masque = filtrerConfigPublique({ global: { tournoi_publie: 'non' }, categories: [] }, 'invitation');
  _ffrAssert(etat, masque.global.tournoi_publie === 'non', 'vitrine : le masquage remonte aussi (non)');
  _ffrAssert(etat, !('contact_reponse_tel' in inv.global),
    'vitrine : ouvrir tournoi_publie n\'ouvre rien d\'autre (téléphone toujours exclu)');
}

/** MIGRATION DOUCE d'un paramètre RENOMMÉ (appliquerAliasConfig) — le mécanisme le plus risqué
 *  du lot L8, parce que son échec est SILENCIEUX : sur un classeur en service, la ligne porte
 *  encore l'ancien nom, et sans reprise le réglage de l'organisateur disparaîtrait sans message.
 *  Quatre garanties : la clé canonique prime · l'ancienne sert de repli · une canonique VIDE
 *  n'écrase pas l'ancienne · et l'ancienne clé ne sort d'AUCUNE vue publique. */
function testCfg_aliasLegacyBoutique(etat) {
  // 1) Classeur ANCIEN : seule l'ancienne ligne existe ⇒ la valeur est reprise.
  var ancien = appliquerAliasConfig({ boutique_r92_disponible: 'oui' });
  _ffrAssert(etat, ancien.boutique_disponible === 'oui',
    'alias : ancienne clé seule ⇒ valeur reprise sur la clé canonique');

  // 2) Classeur NEUF : la canonique prime, même si l'ancienne dit le contraire.
  var neuf = appliquerAliasConfig({ boutique_disponible: 'non', boutique_r92_disponible: 'oui' });
  _ffrAssert(etat, neuf.boutique_disponible === 'non',
    'alias : la clé canonique prime toujours sur l\'ancienne');

  // 3) 🔴 Canonique PRÉSENTE mais VIDE ⇒ elle fait foi, AUCUN repli. C'est l'état que laisse la
  //    réinitialisation d'un tournoi : si le repli jouait ici, le réglage effacé ressusciterait
  //    à l'édition suivante. « Présente et vide » est une valeur, « absente » est un manque.
  var vide = appliquerAliasConfig({ boutique_disponible: '', boutique_r92_disponible: 'oui' });
  _ffrAssert(etat, vide.boutique_disponible === '',
    'alias : canonique présente mais vide ⇒ elle fait foi (une valeur effacée reste effacée)');

  // 4) Aucune des deux ⇒ rien n'est inventé.
  var rien = appliquerAliasConfig({});
  _ffrAssert(etat, !('boutique_disponible' in rien),
    'alias : aucune des deux clés ⇒ aucune valeur inventée');

  // 4 bis) 🔴 RÉINITIALISATION d'un tournoi, les DEUX classeurs possibles. La remise à zéro écrit
  //   '' (elle ne supprime pas la ligne) et doit vider l'ancien nom AUSSI — sans quoi le réglage
  //   « boutique » réapparaîtrait tout seul à l'édition suivante.
  var reinitMigre = appliquerAliasConfig({ boutique_disponible: '', boutique_r92_disponible: '' });
  _ffrAssert(etat, reinitMigre.boutique_disponible === '',
    'alias : après réinitialisation (classeur migré) le réglage reste effacé');
  var reinitLegacy = appliquerAliasConfig({ boutique_r92_disponible: '' });
  _ffrAssert(etat, reinitLegacy.boutique_disponible === '',
    'alias : après réinitialisation (classeur jamais réenregistré) le réglage reste effacé');
  // Et la réinitialisation vise bien les DEUX noms : l'ancien est déclaré dans la table d'alias.
  _ffrAssert(etat, ALIAS_CONFIG_LEGACY.boutique_disponible === 'boutique_r92_disponible',
    'alias : l\'ancien nom est déclaré, donc atteint par la réinitialisation');

  // 5) ⛔ L'ancienne clé ne sort d'AUCUNE vue publique — c'est l'objet même du renommage.
  var cfg = { global: { boutique_disponible: 'oui', boutique_r92_disponible: 'oui' }, categories: [] };
  var fuite = ['live', 'invitation', 'club'].some(function (vue) {
    return 'boutique_r92_disponible' in filtrerConfigPublique(cfg, vue).global;
  });
  _ffrAssert(etat, !fuite, 'alias : l\'ancienne clé ne sort d\'aucune vue publique');
  _ffrAssert(etat, filtrerConfigPublique(cfg, 'invitation').global.boutique_disponible === 'oui',
    'alias : la clé canonique sort bien en vue invitation');
}

/** Le mot-clé de la page Perfs sort en vue LIVE, et NULLE PART ailleurs. Sans cette sortie,
 *  la page (qui n'a pas de clé et ne lit que getAll) se dirait « non configurée » en silence. */
function testCfg_motCleClubEnVueLive(etat) {
  var cfg = { global: { perfs_mot_cle_club: 'massy' }, categories: [] };
  _ffrAssert(etat, filtrerConfigPublique(cfg, 'live').global.perfs_mot_cle_club === 'massy',
    'perfsMotCle : exposé en vue live (sinon la page Perfs ne peut rien calculer)');
  _ffrAssert(etat, !('perfs_mot_cle_club' in filtrerConfigPublique(cfg, 'invitation').global),
    'perfsMotCle : absent de la vue invitation (rien n\'y a besoin de lui)');
}

/** Personnalisation des emails d'invitation : les TROIS jetons ({{SALUTATION}}, {{LIEN_REPONSE}},
 *  {{LIEN_INVITATION}}) sont remplacés par club — liens échappés en HTML, bruts en texte ; un
 *  modèle sans jeton reste inchangé ; le lien d'invitation retombe sur la page GÉNÉRIQUE quand le
 *  jeton du club manque (la page affiche alors sa mention « lien reçu par email »). */
function testCfg_liensPersonnalisesEmail(etat) {
  var modele = 'A {{SALUTATION}} B {{LIEN_REPONSE}} C {{LIEN_INVITATION}} D';
  var rep = 'https://x/reponse-invitation.html?tournoi=T&club=RC&token=t1';
  var inv = 'https://x/invitation-club.html?club=RC&token=t1';
  var html = personnaliserInvitation(modele, 'Anne', rep, inv, true);
  _ffrAssert(etat, html.indexOf('Bonjour Anne,') !== -1, 'liensEmail : salutation avec prénom');
  _ffrAssert(etat, html.indexOf('tournoi=T&amp;club=RC') !== -1,
    'liensEmail : lien de réponse échappé en HTML (&amp;)');
  _ffrAssert(etat, html.indexOf('invitation-club.html?club=RC&amp;token=t1') !== -1,
    'liensEmail : lien d\'invitation substitué et échappé');
  var texte = personnaliserInvitation(modele, '', rep, inv, false);
  _ffrAssert(etat, texte.indexOf('Bonjour,') !== -1, 'liensEmail : salutation sans prénom');
  _ffrAssert(etat, texte.indexOf(inv) !== -1, 'liensEmail : lien brut (non échappé) en mode texte');
  _ffrAssert(etat, personnaliserInvitation('sans jeton', 'X', rep, inv, true) === 'sans jeton',
    'liensEmail : modèle sans jeton inchangé (rétrocompatible)');
  // Construction des liens personnels : base avec « ? » → « & » ; jeton manquant → repli générique.
  _ffrAssert(etat, lienReponseClub('https://x/r?tournoi=T', 'RC Ex', 'tk') ===
    'https://x/r?tournoi=T&club=RC%20Ex&token=tk', 'liensEmail : lien personnel (base avec ?)');
  _ffrAssert(etat, lienReponseClub('https://x/r', 'RC', 'tk') === 'https://x/r?club=RC&token=tk',
    'liensEmail : lien personnel (base sans ?)');
  _ffrAssert(etat, lienInvitationClub('https://x/invitation-club.html', 'RC', '') ===
    'https://x/invitation-club.html', 'liensEmail : sans jeton → page générique (jamais de lien cassé)');
}

/** Fabrique une équipe factice pour les tests du plan de synchronisation. */
function _eqFactice(nom, cat, poule, source) {
  return { id_equipe: 'id-' + nom, nom_equipe: nom, categorie: cat,
           poule: poule || '', source: (source === undefined) ? 'auto' : source };
}

/** Synchronisation des équipes d'un club (liserés d'état) : le plan PUR applique les règles —
 *  ajouts automatiques, réductions prudentes (jamais une équipe manuelle, en poule ou dans des
 *  matchs), catégories désengagées balayées, autres clubs jamais touchés. */
function testClubs_planSyncEquipes(etat) {
  // 1) Création simple : rien d'existant, U8 = 2 équipes → « PUC-1 » et « PUC-2 ».
  var p = planifierSyncEquipesClub([], 'PUC', ['U8'], { U8: 2 }, {});
  _ffrAssert(etat, p.aCreer.length === 2 && p.aCreer[0].nom === 'PUC-1' && p.aCreer[1].nom === 'PUC-2',
    'planSync : création U8=2 → PUC-1 + PUC-2');
  // 2) Une seule équipe → « PUC-1 ». (Avant : « PUC » tout court. Changé le 2026-08-03 : le nom
  //    nu devenait bancal dès que le club engageait une 2ᵉ équipe — cf. testClubs_numerotationHomogene.)
  p = planifierSyncEquipesClub([], 'PUC', ['U8'], { U8: 1 }, {});
  _ffrAssert(etat, p.aCreer.length === 1 && p.aCreer[0].nom === 'PUC-1', 'planSync : U8=1 → « PUC-1 »');
  // 3) nbMap sans la catégorie → défaut 1 équipe (jamais 0 deviné).
  p = planifierSyncEquipesClub([], 'PUC', ['U10'], {}, {});
  _ffrAssert(etat, p.aCreer.length === 1 && p.aCreer[0].categorie === 'U10', 'planSync : nb inconnu → défaut 1');
  // 4) Idempotence : déjà à jour → aucun mouvement.
  var deuxEquipes = [_eqFactice('PUC-1', 'U8'), _eqFactice('PUC-2', 'U8')];
  p = planifierSyncEquipesClub(deuxEquipes, 'PUC', ['U8'], { U8: 2 }, {});
  _ffrAssert(etat, !p.aCreer.length && !p.aSupprimer.length && !p.alertes.length,
    'planSync : déjà à jour → aucun mouvement');
  // 5) Réduction SUPPRIMABLE : 3 → 2, la 3ᵉ (auto, hors poule, hors matchs) est retirée.
  var troisEquipes = [_eqFactice('PUC-1', 'U8'), _eqFactice('PUC-2', 'U8'), _eqFactice('PUC-3', 'U8')];
  p = planifierSyncEquipesClub(troisEquipes, 'PUC', ['U8'], { U8: 2 }, {});
  _ffrAssert(etat, p.aSupprimer.length === 1 && p.aSupprimer[0].nom === 'PUC-3' && !p.alertes.length,
    'planSync : réduction 3→2 → PUC-3 retirée (les premières conservées)');
  // 6) Réduction BLOQUÉE : l'équipe excédentaire est en poule → conservée + alerte, rien supprimé.
  var enPoule = [_eqFactice('PUC-1', 'U8'), _eqFactice('PUC-2', 'U8', 'A')];
  p = planifierSyncEquipesClub(enPoule, 'PUC', ['U8'], { U8: 1 }, {});
  _ffrAssert(etat, !p.aSupprimer.length && p.alertes.length === 1 && /poule A/.test(p.alertes[0]),
    'planSync : équipe en poule → conservée + alerte (motif poule)');
  // 7) Réduction BLOQUÉE : l'équipe figure dans des matchs générés.
  p = planifierSyncEquipesClub(troisEquipes, 'PUC', ['U8'], { U8: 2 }, { 'PUC-3': true });
  _ffrAssert(etat, !p.aSupprimer.length && p.alertes.length === 1 && /matchs/.test(p.alertes[0]),
    'planSync : équipe dans des matchs → conservée + alerte');
  // 8) Une équipe créée À LA MAIN n'est jamais supprimée par la synchro.
  var manuelle = [_eqFactice('PUC-1', 'U8'), _eqFactice('PUC-2', 'U8', '', '')];
  p = planifierSyncEquipesClub(manuelle, 'PUC', ['U8'], { U8: 1 }, {});
  _ffrAssert(etat, !p.aSupprimer.length && p.alertes.length === 1 && /à la main/.test(p.alertes[0]),
    'planSync : équipe manuelle → conservée + alerte');
  // 9) Catégorie DÉSENGAGÉE : le club n'engage plus l'U10 → son équipe U10 (supprimable) part.
  var deuxCats = [_eqFactice('PUC', 'U8'), _eqFactice('PUC', 'U10')];
  // (mêmes noms dans 2 catégories : cas réel « PUC » engagé 1 équipe dans chaque)
  deuxCats[1] = _eqFactice('PUC', 'U10'); deuxCats[1].id_equipe = 'id-PUC-U10';
  p = planifierSyncEquipesClub(deuxCats, 'PUC', ['U8'], { U8: 1 }, {});
  _ffrAssert(etat, p.aSupprimer.length === 1 && p.aSupprimer[0].categorie === 'U10' && !p.aCreer.length,
    'planSync : catégorie désengagée → équipe U10 retirée, U8 intacte');
  // 10) Les équipes des AUTRES clubs ne sont jamais touchées.
  var autres = [_eqFactice('MASSY', 'U8'), _eqFactice('MASSY-1', 'U8')];
  p = planifierSyncEquipesClub(autres, 'PUC', ['U8'], { U8: 1 }, {});
  _ffrAssert(etat, p.aCreer.length === 1 && !p.aSupprimer.length,
    'planSync : équipes des autres clubs jamais touchées');
}

/** La colonne du drapeau « sélection enregistrée » fait partie de la migration douce. */
function testClubs_colonneSelectionEnregistree(etat) {
  _ffrAssert(etat, ENTETES.ClubsInvites.indexOf('selection_enregistree') !== -1,
    'colSelection : selection_enregistree déclarée dans ENTETES.ClubsInvites');
}

/** Gel des réponses à J-16 : libre à J-17, gelé de J-16 jusqu'après le tournoi ; jamais de gel
 *  sur une date manquante ou illisible (prudent : on ne bloque pas sur une donnée absente). */
function testClubs_gelReponsesJ16(etat) {
  _ffrAssert(etat, GEL_REPONSES_JOURS === 16, 'gelJ16 : seuil = 16 jours (autorisation à J-15)');
  _ffrAssert(etat, reponsesGelees('2027-06-13', '2027-05-27') === false, 'gelJ16 : J-17 → réponses libres');
  _ffrAssert(etat, reponsesGelees('2027-06-13', '2027-05-28') === true, 'gelJ16 : J-16 → gelé (l\'organisateur consolide)');
  _ffrAssert(etat, reponsesGelees('2027-06-13', '2027-05-29') === true, 'gelJ16 : J-15 → gelé');
  _ffrAssert(etat, reponsesGelees('2027-06-13', '2027-06-13') === true, 'gelJ16 : jour J → gelé');
  _ffrAssert(etat, reponsesGelees('2027-06-13', '2027-06-20') === true, 'gelJ16 : après le tournoi → gelé');
  _ffrAssert(etat, reponsesGelees('', '2027-05-28') === false, 'gelJ16 : date de tournoi absente → jamais de gel');
  _ffrAssert(etat, reponsesGelees('pas-une-date', '2027-05-28') === false, 'gelJ16 : date illisible → jamais de gel');
}

/** Suppression de club en cascade : toutes les équipes du club sont classées supprimables /
 *  bloquantes (à la main, en poule, dans des matchs) ; les clubs voisins ne sont jamais touchés. */
function testClubs_planSuppressionCascade(etat) {
  var equipes = [
    _eqFactice('PUC', 'U8'),                    // supprimable
    _eqFactice('PUC-1', 'U10'),                 // supprimable
    _eqFactice('PUC-2', 'U10', 'A'),            // bloquante : en poule
    _eqFactice('PUC-3', 'U10', '', ''),         // bloquante : créée à la main
    _eqFactice('MASSY', 'U8')                   // autre club : jamais touché
  ];
  var plan = planifierSuppressionClub(equipes, 'PUC', { 'PUC-1': false });
  _ffrAssert(etat, plan.supprimables.length === 2 &&
    plan.supprimables.map(function (e) { return e.nom; }).join(',') === 'PUC,PUC-1',
    'cascade : PUC + PUC-1 supprimables');
  _ffrAssert(etat, plan.bloquees.length === 2, 'cascade : 2 équipes bloquantes');
  _ffrAssert(etat, /poule A/.test(plan.bloquees[0].motif) && /à la main/.test(plan.bloquees[1].motif),
    'cascade : motifs « poule » et « à la main » posés');
  _ffrAssert(etat, !plan.supprimables.concat(plan.bloquees).some(function (e) { return e.nom === 'MASSY'; }),
    'cascade : MASSY (autre club) jamais touché');
  // Équipe dans des matchs générés → bloquante.
  var plan2 = planifierSuppressionClub([_eqFactice('PUC', 'U8')], 'PUC', { 'PUC': true });
  _ffrAssert(etat, plan2.bloquees.length === 1 && /matchs/.test(plan2.bloquees[0].motif),
    'cascade : équipe dans des matchs → bloquante');
}

/** VERROU DE PUBLICATION DU PLANNING — le dossier doit pouvoir lire le témoin, et lui SEUL
 *  (la page publique des scores, à forte charge, n'en a que faire). Un témoin absent du Sheet
 *  (tournoi d'avant la fonction) ne doit surtout pas valoir « publié » : le dossier ne montre le
 *  planning que sur un « oui » explicite — la valeur manquante retombe donc côté fermé. */
function testDossier_verrouPlanning(etat) {
  var cfg = _cfgFactice();
  cfg.global.planning_visible_clubs = 'oui';
  _ffrAssert(etat, filtrerConfigPublique(cfg, 'club').global.planning_visible_clubs === 'oui',
    'verrou : le dossier (vue club) lit planning_visible_clubs');
  _ffrAssert(etat, filtrerConfigPublique(cfg, 'live').global.planning_visible_clubs === undefined,
    'verrou : la vue live (page des scores) ne le reçoit pas');
  _ffrAssert(etat, filtrerConfigPublique(cfg, 'invitation').global.planning_visible_clubs === undefined,
    'verrou : la vue invitation ne le reçoit pas non plus');

  // Tournoi d'avant la fonction : le témoin n'existe pas → il ne SORT pas, donc le dossier lira
  // « rien », et sa règle (n'afficher que sur 'oui') le traitera comme non publié.
  var vieux = _cfgFactice();
  _ffrAssert(etat, filtrerConfigPublique(vieux, 'club').global.planning_visible_clubs === undefined,
    'verrou : témoin absent → rien ne sort (le dossier reste fermé par défaut)');
}

/** DOSSIER CLUB — le cœur pur ne rend au club QUE ses équipes, triées, et jamais celles d'un
 *  homonyme. Même garde-fou que la synchro : « PUC-2 » appartient au club PUC-2, pas à PUC. */
function testDossier_equipesDuClub(etat) {
  var club = { club_nom: 'PUC', club_contact_prenom: 'Noélise', categories_engagees: 'U8,U10' };
  var equipes = [
    _eqFactice('PUC-3', 'U10', 'B'),
    _eqFactice('MASSY', 'U8', 'A'),
    _eqFactice('PUC-1', 'U10', 'A'),
    _eqFactice('PUC', 'U8', 'C'),
    _eqFactice('PUC-2', 'U8', 'A')            // = un AUTRE club invité
  ];
  var r = dossierClubPur(club, equipes, ['PUC-2'], false, 'contact@example.org');

  var noms = r.equipes.map(function (e) { return e.nom_equipe; }).join(',');
  _ffrAssert(etat, noms === 'PUC,PUC-1,PUC-3',
    'dossier : seules les équipes du club, triées par catégorie puis par nom (obtenu : ' + noms + ')');
  _ffrAssert(etat, r.equipes.every(function (e) { return e.nom_equipe !== 'MASSY'; }),
    'dossier : aucune équipe d\'un autre club');
  _ffrAssert(etat, r.equipes[0].categorie === 'U8' && r.equipes[0].poule === 'C',
    'dossier : catégorie et poule remontées telles quelles');
  _ffrAssert(etat, r.equipes[0].id_equipe === 'id-PUC',
    'dossier : l\'identifiant d\'équipe est fourni (croisement avec les matchs publics)');

  // Aucune équipe encore créée : la liste est vide, jamais une erreur (le dossier masquera).
  var vide = dossierClubPur(club, [], [], false, '');
  _ffrAssert(etat, vide.ok === true && vide.equipes.length === 0,
    'dossier : sans équipe, réponse valide et liste vide');
}

/** DOSSIER CLUB — ce que le club a DÉCLARÉ est rendu tel quel (jamais recalculé : c'est sa
 *  parole), et l'état du gel J-16 accompagne la réponse pour piloter le bouton « Modifier ».
 *  Aucun email de club ne sort JAMAIS — seul celui, public, du contact du tournoi. */
function testDossier_declareEtGel(etat) {
  var club = {
    club_nom: 'MASSY', club_contact_prenom: 'Camille', club_contact_email: 'secret@massy.fr',
    categories_engagees: 'U8,U10', nb_equipes_par_categorie: '{"U8":2,"U10":1}',
    nb_joueurs_total: '31', nb_educateurs_total: '6', detail_effectifs: '{"MASSY-1":12}'
  };
  var r = dossierClubPur(club, [], [], true, 'contact@example.org');

  _ffrAssert(etat, r.club.nb_equipes_par_categorie === '{"U8":2,"U10":1}' &&
                   r.club.nb_joueurs_total === '31' && r.club.nb_educateurs_total === '6',
    'dossier : les chiffres déclarés sont rendus tels quels');
  _ffrAssert(etat, r.reponses_gelees === true && r.contact_email === 'contact@example.org',
    'dossier : gel J-16 et contact du tournoi accompagnent la réponse');
  _ffrAssert(etat, JSON.stringify(r).indexOf('secret@massy.fr') === -1,
    'dossier : l\'email du club ne sort JAMAIS');

  // Club qui n'a pas encore répondu : des chaînes vides, jamais « undefined ».
  var muet = dossierClubPur({ club_nom: 'PUC' }, [], [], false, '');
  _ffrAssert(etat, muet.club.nb_joueurs_total === '' && muet.club.categories_engagees === '' &&
                   muet.reponses_gelees === false,
    'dossier : club sans réponse → chaînes vides, pas de gel');
}

/** NUMÉROTATION DES ÉQUIPES D'UN CLUB — retour terrain : engager UNE équipe la nommait « MASSY »
 *  tout court ; passer à DEUX gardait ce nom nu et ajoutait « MASSY-1 », d'où la paire bancale
 *  « MASSY » + « MASSY-1 » au lieu de « MASSY-1 » + « MASSY-2 ». Désormais : toujours suffixé, et
 *  l'équipe au nom nu REJOINT la numérotation — sauf si elle est déjà en poule ou dans des matchs
 *  (on ne renomme pas sous les pieds d'un planning diffusé : on le signale). */
function testClubs_numerotationHomogene(etat) {
  // 1) Première équipe : « MASSY-1 », plus jamais « MASSY ».
  var p1 = planifierSyncEquipesClub([], 'MASSY', ['U8'], { U8: 1 }, {}, []);
  _ffrAssert(etat, p1.aCreer.length === 1 && p1.aCreer[0].nom === 'MASSY-1',
    'numérotation : une seule équipe s\'appelle déjà MASSY-1');

  // 2) Le cas constaté : « MASSY » (hérité) + passage à 2 → renommage + une seule création.
  var heritee = _eqFactice('MASSY', 'U8');
  var p2 = planifierSyncEquipesClub([heritee], 'MASSY', ['U8'], { U8: 2 }, {}, []);
  _ffrAssert(etat, p2.aRenommer.length === 1 && p2.aRenommer[0].vers === 'MASSY-1',
    'numérotation : l\'équipe au nom nu est renommée MASSY-1');
  _ffrAssert(etat, p2.aCreer.length === 1 && p2.aCreer[0].nom === 'MASSY-2',
    'numérotation : la seconde équipe est MASSY-2 (obtenu : ' +
    p2.aCreer.map(function (t) { return t.nom; }).join(',') + ')');
  _ffrAssert(etat, p2.aSupprimer.length === 0, 'numérotation : aucune suppression au passage');

  // 3) « Déjà à jour » ne doit PAS empêcher la réparation : MASSY + MASSY-1 avec 2 engagées.
  var p3 = planifierSyncEquipesClub([_eqFactice('MASSY', 'U8'), _eqFactice('MASSY-1', 'U8')],
    'MASSY', ['U8'], { U8: 2 }, {}, []);
  _ffrAssert(etat, p3.aRenommer.length === 0 && p3.aCreer.length === 0,
    'numérotation : MASSY-1 déjà pris → on ne renomme pas par-dessus, et on ne crée rien');

  // 4) Équipe nue DÉJÀ EN POULE : intouchable, mais l'organisateur est prévenu.
  var enPoule = _eqFactice('MASSY', 'U8', 'A');
  var p4 = planifierSyncEquipesClub([enPoule], 'MASSY', ['U8'], { U8: 2 }, {}, []);
  _ffrAssert(etat, p4.aRenommer.length === 0 && p4.alertes.length === 1 &&
    /poule A/.test(p4.alertes[0]),
    'numérotation : équipe en poule non renommée, alerte explicite');

  // 5) Équipe créée À LA MAIN : jamais renommée non plus (source = manuel).
  var manuelle = _eqFactice('MASSY', 'U8', '', 'manuel');
  var p5 = planifierSyncEquipesClub([manuelle], 'MASSY', ['U8'], { U8: 2 }, {}, []);
  _ffrAssert(etat, p5.aRenommer.length === 0 && /à la main/.test(p5.alertes[0] || ''),
    'numérotation : équipe manuelle non renommée, alerte explicite');

  // 6) Collision : le club « MASSY-1 » existe → on ne lui vole pas son nom.
  var p6 = planifierSyncEquipesClub([_eqFactice('MASSY', 'U8')], 'MASSY', ['U8'], { U8: 2 }, {}, ['MASSY-1']);
  _ffrAssert(etat, p6.aRenommer.length === 0,
    'numérotation : « MASSY-1 » est un autre club invité → aucun renommage');
}

/** COLLISION DE NOMS (revue) : deux clubs invités « PUC » et « PUC-2 ». L'équipe « PUC-2 »
 *  appartient au club PUC-2 — le club PUC ne doit ni la compter, ni la supprimer, ni réutiliser
 *  son nom à la création. Sans ce garde-fou, réduire l'engagement de PUC détruisait l'unique
 *  équipe d'un AUTRE club. */
function testClubs_collisionNomsClubs(etat) {
  var autres = ['PUC-2'];                       // vus depuis le club « PUC »
  // Rattachement : « PUC-1 » est à PUC, « PUC-2 » est au club homonyme.
  _ffrAssert(etat, equipeRattacheeAuClub('PUC-1', 'PUC', autres) === true,
    'collision : PUC-1 rattachée à PUC');
  _ffrAssert(etat, equipeRattacheeAuClub('PUC-2', 'PUC', autres) === false,
    'collision : PUC-2 (nom d\'un autre club) NON rattachée à PUC');
  _ffrAssert(etat, equipeRattacheeAuClub('PUC', 'PUC', autres) === true,
    'collision : l\'équipe « PUC » reste à PUC');

  // Réduction de PUC à 1 équipe : PUC-3 part, PUC-2 (autre club) est INTOUCHÉE.
  var equipes = [_eqFactice('PUC-1', 'U10'), _eqFactice('PUC-2', 'U10'), _eqFactice('PUC-3', 'U10')];
  var p = planifierSyncEquipesClub(equipes, 'PUC', ['U10'], { U10: 1 }, {}, autres);
  _ffrAssert(etat, p.aSupprimer.length === 1 && p.aSupprimer[0].nom === 'PUC-3',
    'collision : réduction de PUC ne supprime QUE PUC-3 (jamais l\'équipe du club PUC-2)');

  // Création : le nom « PUC-2 » est réservé à l'autre club → PUC utilise PUC-1 puis PUC-3.
  var p2 = planifierSyncEquipesClub([], 'PUC', ['U10'], { U10: 2 }, {}, autres);
  _ffrAssert(etat, p2.aCreer.map(function (t) { return t.nom; }).join(',') === 'PUC-1,PUC-3',
    'collision : création saute « PUC-2 » (nom d\'un autre club)');

  // Suppression en cascade du club PUC : l'équipe PUC-2 n'est jamais embarquée.
  var pc = planifierSuppressionClub(equipes, 'PUC', {}, autres);
  var noms = pc.supprimables.map(function (e) { return e.nom; }).join(',');
  _ffrAssert(etat, noms === 'PUC-1,PUC-3', 'collision : cascade PUC n\'emporte pas PUC-2');
}

/** Catégories engagées EN DOUBLE (« U8,U8 », ou « U8,u8 ») : une catégorie n'est traitée qu'une
 *  fois — sinon les mêmes équipes étaient créées deux fois (noms identiques dans l'onglet, or
 *  les matchs référencent les équipes par NOM). */
function testClubs_categoriesDupliquees(etat) {
  var p = planifierSyncEquipesClub([], 'PUC', ['U8', 'U8'], { U8: 2 }, {}, []);
  _ffrAssert(etat, p.aCreer.length === 2 &&
    p.aCreer.map(function (t) { return t.nom; }).join(',') === 'PUC-1,PUC-2',
    'catsDupliquees : « U8,U8 » → 2 équipes (pas 4)');
  var p2 = planifierSyncEquipesClub([], 'PUC', ['U8', 'u8'], { U8: 1 }, {}, []);
  _ffrAssert(etat, p2.aCreer.length === 1, 'catsDupliquees : « U8,u8 » (casse) → 1 seule équipe');
  var p3 = planifierSyncEquipesClub([], 'PUC', ['U8', '', '  '], { U8: 1 }, {}, []);
  _ffrAssert(etat, p3.aCreer.length === 1, 'catsDupliquees : entrées vides ignorées');
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

/** Le nom du club n'a AUCUN défaut : non saisi ⇒ « manquant », jamais un nom inventé.
 *  Et une valeur saisie dans Config est bien reprise telle quelle (état « saisi »). */
function testS7_defautNomClub(etat) {
  var d = assemblerDossierAutorisation({}, { global: {}, categories: [] }, { formes: [] });
  var nom = _autoChamp(d, 'Nom du club');
  _ffrAssert(etat, nom && nom.valeur === '' && nom.etat === 'manquant',
    'defautClub : aucun nom de club inventé — non saisi ⇒ manquant');
  var saisi = assemblerDossierAutorisation({},
    { global: { org_club_nom: 'US Exemple' }, categories: [] }, { formes: [] });
  var nomSaisi = _autoChamp(saisi, 'Nom du club');
  _ffrAssert(etat, nomSaisi && nomSaisi.valeur === 'US Exemple' && nomSaisi.etat === 'saisi',
    'defautClub : une valeur saisie dans Config est conservée');
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

/* -------------------------------------------------------------------------- */
/*  Session 14 (PR B) — Super Challenge Phase 3 : brassage du dimanche         */
/*  Le brassage réutilise fixturesApresMidiCroise (1ers ensemble, 2es…) et la  */
/*  planif de 2e journée (planifierApresMidi avec départ forcé + temps 2×11).  */
/* -------------------------------------------------------------------------- */

/** Classement factice : nbPoules poules de taillePoule équipes, rangs déjà triés. */
function _scfClassement(cat, nbPoules, taillePoule) {
  var poules = [];
  for (var p = 0; p < nbPoules; p++) {
    var lettre = String.fromCharCode(65 + p);
    var classement = [];
    for (var r = 0; r < taillePoule; r++) classement.push({ id_equipe: lettre + (r + 1), nom_equipe: lettre + (r + 1) });
    poules.push({ nom_poule: lettre, classement: classement });
  }
  return { categorie: cat, poules: poules };
}

/** 4 poules de 3 (samedi) ⇒ brassage sur 3 niveaux (N1/N2/N3 = poules E/F/G du règlement). */
function testS14b_brassageTroisNiveaux(etat) {
  var res = fixturesApresMidiCroise({ categorie: 'U14' }, _scfClassement('U14', 4, 3));
  var niveaux = {};
  res.fixtures.forEach(function (f) { niveaux[f.poule] = true; });
  _ffrAssert(etat, Object.keys(niveaux).length === 3, 'S14b : 4 poules de 3 ⇒ 3 niveaux de brassage');
}

/** Chaque niveau regroupe les 4 équipes de même rang ⇒ round-robin de 4 = 6 matchs (3 niveaux = 18). */
function testS14b_brassageRoundRobinParNiveau(etat) {
  var res = fixturesApresMidiCroise({ categorie: 'U14' }, _scfClassement('U14', 4, 3));
  var n1 = res.fixtures.filter(function (f) { return f.poule === 'N1'; });
  _ffrAssert(etat, n1.length === 6, 'S14b : niveau N1 = round-robin de 4 = 6 matchs');
  _ffrAssert(etat, res.fixtures.length === 18, 'S14b : 3 niveaux × 6 = 18 matchs de dimanche');
  // Le niveau N1 réunit bien les 1ers de chaque poule (A1,B1,C1,D1).
  var equipesN1 = {};
  n1.forEach(function (f) { equipesN1[f.equipe_A] = true; equipesN1[f.equipe_B] = true; });
  _ffrAssert(etat, equipesN1.A1 && equipesN1.B1 && equipesN1.C1 && equipesN1.D1 && !equipesN1.A2,
    'S14b : N1 = les 1ers de chaque poule (A1,B1,C1,D1)');
}

/** Config + fixtures minimales pour tester planifierApresMidi en 2e journée. */
function _scfConfigDimanche(scf) {
  var cat = {
    categorie: 'U14', presente: 'oui', terrains: '1,2,3,4',
    format_mi_temps: '2', duree_mi_temps_min: '10', pause_mi_temps_min: '2',
    recup_entre_matchs_min: '5', contexte_tournoi: scf ? 'SCF' : '', scf_phase: scf ? 'P3' : ''
  };
  var fixtures = { U14: [{ poule: 'N1', equipe_A: 'A1', equipe_B: 'B1', round: 0, format: 'CROISE' }] };
  return { config: { global: { heure_debut: '09:00', battement_terrain_min: '5',
                     pause_dejeuner_debut: '12:30', pause_dejeuner_duree_min: '0' }, categories: [cat] },
           fixtures: fixtures };
}

/** Le dimanche démarre au DÉBUT de journée (départ forcé), pas « après le déjeuner ». */
function testS14b_dimancheDepartJour2(etat) {
  var d = _scfConfigDimanche(true);
  var plan = planifierApresMidi(d.config, d.fixtures, [], hmVersMin('09:00'));
  _ffrAssert(etat, plan.matchs.length === 1 && plan.matchs[0].heure_debut === '09:00',
    'S14b : brassage dimanche démarre à 09:00 (départ 2ᵉ journée forcé)');
}

/** Le dimanche applique le temps SCF Phase 3 = 2×11 (+ pause 2) = 24 min. */
function testS14b_dimancheTemps2x11(etat) {
  var d = _scfConfigDimanche(true);
  var plan = planifierApresMidi(d.config, d.fixtures, [], hmVersMin('09:00'));
  var m = plan.matchs[0];
  _ffrAssert(etat, (hmVersMin(m.heure_fin) - hmVersMin(m.heure_debut)) === 24,
    'S14b : match du dimanche = 24 min (2×11+2), pas 22 (réglages)');
}

/** Non-régression : un après-midi ORDINAIRE (hors SCF) garde sa durée de réglages (2×10+2=22). */
function testS14b_apresMidiLambdaInchange(etat) {
  var d = _scfConfigDimanche(false);
  // Après-midi classique : pas de départ forcé (reprise après déjeuner), durée = réglages.
  var plan = planifierApresMidi(d.config, d.fixtures, []);
  var m = plan.matchs[0];
  _ffrAssert(etat, (hmVersMin(m.heure_fin) - hmVersMin(m.heure_debut)) === 22,
    'S14b : après-midi hors SCF = 22 min (réglages catégorie inchangés)');
}

/* -------------------------------------------------------------------------- */
/*  Session 15 — pause méridienne échelonnée (2 vagues, repos ≥ 60, équité)    */
/* -------------------------------------------------------------------------- */

/** N identifiants d'équipe factices. */
function _echIds(n){ var a=[]; for(var i=1;i<=n;i++) a.push('E'+i); return a; }

/** Répartition en deux vagues : première moitié / seconde moitié. */
function testS15_vaguesPartition(etat){
  var p = vaguesRepos(_echIds(6));
  _ffrAssert(etat, p.v1.length===3 && p.v2.length===3, 'S15 : 6 équipes → vagues 3+3');
  _ffrAssert(etat, p.v1[0]==='E1' && p.v2[0]==='E4', 'S15 : Vague 1 = premières équipes (E1…), Vague 2 = E4…');
}

/** Le planning échelonné produit le round-robin COMPLET (chaque paire une fois). */
function testS15_roundRobinComplet(etat){
  var r = planifierCategorieEchelonnee(_echIds(6), [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  _ffrAssert(etat, r.matchs.length===15, 'S15 : 6 équipes → 15 matchs (round-robin complet)');
  var vus={}, dup=false;
  r.matchs.forEach(function(m){ var k=[m.equipe_A,m.equipe_B].sort().join('¤'); if(vus[k]) dup=true; vus[k]=true; });
  _ffrAssert(etat, !dup && Object.keys(vus).length===15, 'S15 : chaque paire exactement une fois (aucun doublon)');
}

/** 6 équipes : repos minimum ≥ 60 min pour TOUTES. */
function testS15_repos60SixEquipes(etat){
  var r = planifierCategorieEchelonnee(_echIds(6), [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  var mini = Math.min.apply(null, _echIds(6).map(function(id){ return r.repos[id]; }));
  _ffrAssert(etat, mini>=60, 'S15 : 6 équipes → repos minimum ≥ 60 (obtenu ' + mini + ')');
  _ffrAssert(etat, r.avert.length===0, 'S15 : 6 équipes → aucun avertissement de repos');
}

/** 8 équipes : repos minimum ≥ 60 min pour TOUTES. */
function testS15_repos60HuitEquipes(etat){
  var r = planifierCategorieEchelonnee(_echIds(8), [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  var mini = Math.min.apply(null, _echIds(8).map(function(id){ return r.repos[id]; }));
  _ffrAssert(etat, mini>=60, 'S15 : 8 équipes → repos minimum ≥ 60 (obtenu ' + mini + ')');
}

/** ÉQUITÉ : jamais une équipe reposée contre une équipe pas encore reposée. */
function testS15_equiteReposeVsFatigue(etat){
  var ids=_echIds(8);
  var r = planifierCategorieEchelonnee(ids, [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  // Heure de « reprise » de chaque équipe = début du match qui suit son trou de repos.
  var reprise={};
  ids.forEach(function(id){
    var mine=r.matchs.filter(function(x){return x.equipe_A===id||x.equipe_B===id;})
                     .sort(function(a,b){return a.heure_debut_min-b.heure_debut_min;});
    reprise[id]=Infinity;
    for(var i=1;i<mine.length;i++){ if(mine[i].heure_debut_min-mine[i-1].heure_fin_min>=60){ reprise[id]=mine[i].heure_debut_min; break; } }
  });
  // Une équipe est « reposée » pour un match qui démarre à/au-delà de sa reprise.
  var violations=0;
  r.matchs.forEach(function(m){
    var aRep = m.heure_debut_min >= reprise[m.equipe_A];
    var bRep = m.heure_debut_min >= reprise[m.equipe_B];
    if(aRep!==bRep) violations++;
  });
  _ffrAssert(etat, violations===0, 'S15 : équité — 0 match reposé-vs-fatigué (obtenu ' + violations + ')');
}

/** Fabrique config + équipes pour tester calculerPlanning en pause échelonnée. */
function _echConfig(n){
  var cat = { categorie:'U14', presente:'oui', terrains:'1,2',
    format_mi_temps:'2', duree_mi_temps_min:'10', pause_mi_temps_min:'2', recup_entre_matchs_min:'5' };
  var equipes=[]; for(var i=1;i<=n;i++) equipes.push({ id_equipe:'E'+i, nom_equipe:'Eq'+i, categorie:'U14' });
  // Réglage GLOBAL désormais (carte Horaires). pause_dejeuner_debut proche du matin pour rester réaliste.
  return { config:{ global:{ heure_debut:'09:00', battement_terrain_min:'5', pause_echelonnee:'oui',
           pause_dejeuner_debut:'11:00', pause_dejeuner_duree_min:'60' }, categories:[cat] }, equipes:equipes };
}

/** Intégration : une catégorie échelonnée à 6 équipes → une seule poule, round-robin complet (15). */
function testS15_planningUnePoule(etat){
  var d=_echConfig(6);
  var r=calculerPlanning(d.config, d.equipes, false);
  var poulesU14=r.poules.filter(function(p){return p.categorie==='U14';});
  _ffrAssert(etat, poulesU14.length===1 && poulesU14[0].equipes.length===6, 'S15 : échelonné → 1 poule de 6');
  _ffrAssert(etat, r.matchsFinaux.length===15, 'S15 : échelonné 6 équipes → 15 matchs planifiés');
}

/** Intégration : repos ≥ 60 vérifiable directement sur les horaires écrits (matchsFinaux). */
function testS15_planningReposGaranti(etat){
  var d=_echConfig(6);
  var r=calculerPlanning(d.config, d.equipes, false);
  // matchsFinaux : [id, cat, poule, terrain, debut(hm), fin(hm), A, B, ...]
  var ids=_echIds(6), mini=Infinity;
  ids.forEach(function(id){
    var mine=r.matchsFinaux.filter(function(x){return x[6]===id||x[7]===id;})
                           .map(function(x){return {d:hmVersMin(x[4]), f:hmVersMin(x[5])};})
                           .sort(function(a,b){return a.d-b.d;});
    var g=0; for(var i=1;i<mine.length;i++) g=Math.max(g, mine[i].d-mine[i-1].f);
    mini=Math.min(mini,g);
  });
  _ffrAssert(etat, mini>=60, 'S15 : intégration → repos minimum ≥ 60 sur les horaires réels (obtenu ' + mini + ')');
}

/** Nombre de violations d'équité (match reposé-vs-fatigué) dans un planning échelonné. */
function _echViolationsEquite(r, ids){
  var reprise={};
  ids.forEach(function(id){
    var mine=r.matchs.filter(function(x){return x.equipe_A===id||x.equipe_B===id;})
                     .sort(function(a,b){return a.heure_debut_min-b.heure_debut_min;});
    reprise[id]=Infinity;
    for(var i=1;i<mine.length;i++){ if(mine[i].heure_debut_min-mine[i-1].heure_fin_min>=60){ reprise[id]=mine[i].heure_debut_min; break; } }
  });
  var v=0;
  r.matchs.forEach(function(m){
    if((m.heure_debut_min>=reprise[m.equipe_A]) !== (m.heure_debut_min>=reprise[m.equipe_B])) v++;
  });
  return v;
}

/** Effectif IMPAIR (7) : round-robin complet grâce aux tournées avec bye. */
function testS15_impairRoundRobinComplet(etat){
  var r = planifierCategorieEchelonnee(_echIds(7), [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  var vus={}, dup=false;
  r.matchs.forEach(function(m){ var k=[m.equipe_A,m.equipe_B].sort().join('¤'); if(vus[k]) dup=true; vus[k]=true; });
  _ffrAssert(etat, r.matchs.length===21 && !dup && Object.keys(vus).length===21,
    'S15 : 7 équipes (impair) → 21 matchs, round-robin complet sans doublon');
}

/** Effectif IMPAIR (7) : repos minimum ≥ 60 pour toutes. */
function testS15_impairRepos60(etat){
  var r = planifierCategorieEchelonnee(_echIds(7), [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  var mini = Math.min.apply(null, _echIds(7).map(function(id){ return r.repos[id]; }));
  _ffrAssert(etat, mini>=60, 'S15 : 7 équipes (impair) → repos minimum ≥ 60 (obtenu ' + mini + ')');
}

/** Effectif IMPAIR (7) : équité préservée (0 match reposé-vs-fatigué). */
function testS15_impairEquite(etat){
  var ids=_echIds(7);
  var r = planifierCategorieEchelonnee(ids, [1,2], {duree:24, battement:3, recup:5, repos:60, debut:540});
  _ffrAssert(etat, _echViolationsEquite(r, ids)===0, 'S15 : 7 équipes (impair) → équité 0 violation');
}

/** Intégration : catégorie échelonnée à 5 équipes (impair) → une poule de 5, round-robin (10), repos ≥ 60. */
function testS15_planningImpairEchelonne(etat){
  var d=_echConfig(5);
  var r=calculerPlanning(d.config, d.equipes, false);
  var poulesU14=r.poules.filter(function(p){return p.categorie==='U14';});
  _ffrAssert(etat, poulesU14.length===1 && poulesU14[0].equipes.length===5, 'S15 : impair (5) échelonné → 1 poule de 5');
  _ffrAssert(etat, r.matchsFinaux.length===10, 'S15 : impair (5) → 10 matchs (round-robin complet)');
  var ids=_echIds(5), mini=Infinity;
  ids.forEach(function(id){
    var mine=r.matchsFinaux.filter(function(x){return x[6]===id||x[7]===id;})
                           .map(function(x){return {d:hmVersMin(x[4]), f:hmVersMin(x[5])};})
                           .sort(function(a,b){return a.d-b.d;});
    var g=0; for(var i=1;i<mine.length;i++) g=Math.max(g, mine[i].d-mine[i-1].f);
    mini=Math.min(mini,g);
  });
  _ffrAssert(etat, mini>=60, 'S15 : impair (5) → repos minimum ≥ 60 sur horaires réels (obtenu ' + mini + ')');
}

/** Effectif TROP PETIT (< 4) : pas d'échelonnement (repli classique) + avertissement. */
function testS15_effectifTropPetitRepli(etat){
  var d=_echConfig(3);
  var r=calculerPlanning(d.config, d.equipes, false);
  var poulesU14=r.poules.filter(function(p){return p.categorie==='U14';});
  // 3 équipes : nombrePoules auto = 1 poule, mais PAS marquée échelonnée → matchsFinaux = round-robin
  // classique (3 matchs) et un avertissement de repli est présent.
  var aWarn=r.avert.some(function(a){ return a.indexOf('au moins 4')>=0; });
  _ffrAssert(etat, aWarn, 'S15 : effectif < 4 → avertissement « pause classique conservée »');
  _ffrAssert(etat, r.matchsFinaux.length===3, 'S15 : effectif 3 → repli round-robin classique (3 matchs)');
}

/* -------------------------------------------------------------------------- */
/*  Session 14 (grouping) — Super Challenge : regroupement en triangulaires    */
/* -------------------------------------------------------------------------- */

/** Multiples de 3 → que des triangulaires (autant de groupes que n/3). */
function testS14c_nbGroupesMultipleDe3(etat){
  _ffrAssert(etat, nbGroupesScf(6)===2 && nbGroupesScf(9)===3 && nbGroupesScf(12)===4,
    'S14c : effectif ×3 → n/3 groupes (6→2, 9→3, 12→4 triangulaires)');
}

/** Reste 1 → une quadrangulaire d'appoint. */
function testS14c_nbGroupesReste1Quad(etat){
  _ffrAssert(etat, nbGroupesScf(4)===1 && nbGroupesScf(7)===2 && nbGroupesScf(10)===3,
    'S14c : n≡1 → une quadrangulaire (4→1, 7→2=4+3, 10→3=4+3+3)');
}

/** Reste 2 (≥8) → deux quadrangulaires ; n=5 dégénéré → au mieux. */
function testS14c_nbGroupesReste2(etat){
  _ffrAssert(etat, nbGroupesScf(8)===2 && nbGroupesScf(11)===3, 'S14c : n≡2 (≥8) → deux quadrangulaires (8→2=4+4)');
  _ffrAssert(etat, nbGroupesScf(5)===2, 'S14c : n=5 (dégénéré) → 2 groupes (3+2, signalé ailleurs)');
}

/** Config SCF (contexte + phase) pour tester le regroupement. */
function _scfGrpConfig(n, phase){
  var cat = { categorie:'U14', presente:'oui', terrains:'1,2', format_mi_temps:'2',
    duree_mi_temps_min:'11', pause_mi_temps_min:'2', recup_entre_matchs_min:'5',
    contexte_tournoi:'SCF', scf_phase:phase };
  var equipes=[]; for(var i=1;i<=n;i++) equipes.push({ id_equipe:'E'+i, nom_equipe:'Club'+i+' Ville', categorie:'U14' });
  return { config:{ global:{ heure_debut:'09:00', battement_terrain_min:'5' }, categories:[cat] }, equipes:equipes };
}

/** Intégration : 12 équipes SCF Phase 3 → 4 poules de 3 (que des triangulaires). */
function testS14c_planning12EquipesTriangulaires(etat){
  var d=_scfGrpConfig(12, 'P3');
  var r=calculerPlanning(d.config, d.equipes, false);
  var poulesU14=r.poules.filter(function(p){return p.categorie==='U14';});
  _ffrAssert(etat, poulesU14.length===4, 'S14c : 12 équipes SCF → 4 poules (pas 3 quadrangulaires)');
  var toutes3=poulesU14.every(function(p){ return p.equipes.length===3; });
  _ffrAssert(etat, toutes3, 'S14c : 12 équipes SCF → chaque poule = 3 équipes (triangulaire)');
}

/** Intégration : 6 équipes SCF → 2 triangulaires. */
function testS14c_planning6EquipesDeuxTriangulaires(etat){
  var d=_scfGrpConfig(6, 'P2');
  var r=calculerPlanning(d.config, d.equipes, false);
  var poulesU14=r.poules.filter(function(p){return p.categorie==='U14';});
  _ffrAssert(etat, poulesU14.length===2 && poulesU14.every(function(p){return p.equipes.length===3;}),
    'S14c : 6 équipes SCF → 2 triangulaires de 3');
  // Triangulaire = 3 matchs par groupe → 6 matchs au total.
  _ffrAssert(etat, r.matchsFinaux.length===6, 'S14c : 2 triangulaires → 6 matchs');
}

/** Phase 3 avec un effectif non multiple de 3 (4 équipes → quadrangulaire) : avertissement. */
function testS14c_phase3QuadAvertit(etat){
  var d=_scfGrpConfig(4, 'P3');
  var r=calculerPlanning(d.config, d.equipes, false);
  var aWarn=r.avert.some(function(a){ return a.indexOf('TRIANGULAIRES')>=0; });
  _ffrAssert(etat, aWarn, 'S14c : Phase 3 à 4 équipes (quad) → avertissement « triangulaires »');
}

/* -------------------------------------------------------------------------- */
/*  Session 14 (PR D) — arbitrage désigné (l'équipe qui ne joue pas)           */
/* -------------------------------------------------------------------------- */

/** Triangulaire : à chaque match, la 3ᵉ équipe (celle qui ne joue pas) arbitre. */
function testS14d_triangulaireArbitre3eEquipe(etat) {
  var f = fixtureScfGroupe(['A', 'B', 'C'], 'U14');
  var ok = f.every(function (m) {
    var attendu = ['A', 'B', 'C'].filter(function (x) { return x !== m.a && x !== m.b; })[0];
    return m.arbitre === attendu;
  });
  _ffrAssert(etat, f.length === 3 && ok, 'S14d : triangulaire → 3ᵉ équipe arbitre chaque match');
}

/** Quadrangulaire : arbitre selon la table du règlement (M1→E1, M2→E2, M3→E3, M4→E4). */
function testS14d_quadrangulaireArbitreReglement(etat) {
  var f = fixtureQuadrangulaireScf(['E1', 'E2', 'E3', 'E4']);
  _ffrAssert(etat, f[0].arbitre === 'E1' && f[1].arbitre === 'E2' && f[2].arbitre === 'E3' && f[3].arbitre === 'E4',
    'S14d : quadrangulaire → arbitres E1,E2,E3,E4 (table du règlement)');
  // Chaque équipe arbitre exactement une fois.
  var c = {}; f.forEach(function (m) { c[m.arbitre] = (c[m.arbitre] || 0) + 1; });
  _ffrAssert(etat, c.E1 === 1 && c.E2 === 1 && c.E3 === 1 && c.E4 === 1, 'S14d : chaque équipe arbitre 1 fois');
}

/** L'arbitre ne fait jamais partie des deux équipes qui jouent le match. */
function testS14d_arbitreNeJouePas(etat) {
  var tri = fixtureScfGroupe(['A', 'B', 'C'], 'U14');
  var quad = fixtureQuadrangulaireScf(['E1', 'E2', 'E3', 'E4']);
  var ok = tri.concat(quad).every(function (m) { return m.arbitre !== m.a && m.arbitre !== m.b; });
  _ffrAssert(etat, ok, 'S14d : l\'arbitre ne joue jamais le match qu\'il arbitre');
}

/** matchObjToRow préserve la colonne arbitre (réécriture sans perte). */
function testS14d_matchObjToRowPreserveArbitre(etat) {
  var col = ENTETES.Matchs.indexOf('arbitre');
  _ffrAssert(etat, col >= 0, 'S14d : colonne arbitre présente dans ENTETES.Matchs');
  var row = matchObjToRow({ id_match: 'M001', categorie: 'U14', poule: 'A', equipe_A: 'E1', equipe_B: 'E3',
    statut: 'à venir', phase: 'poule', arbitre: 'E2' });
  _ffrAssert(etat, row[col] === 'E2', 'S14d : matchObjToRow écrit l\'arbitre dans sa colonne');
}

/** Intégration : le planning SCF écrit un arbitre (non-joueur) sur chaque match du samedi. */
function testS14d_planningEcritArbitre(etat) {
  var d = _scfGrpConfig(6, 'P3'); // 6 équipes → 2 triangulaires
  var r = calculerPlanning(d.config, d.equipes, false);
  var col = ENTETES.Matchs.indexOf('arbitre');
  var tous = r.matchsFinaux.every(function (row) {
    var arb = row[col];
    return arb && arb !== row[6] && arb !== row[7]; // renseigné et ne joue pas (col 6/7 = A/B)
  });
  _ffrAssert(etat, r.matchsFinaux.length === 6 && tous, 'S14d : chaque match SCF a un arbitre désigné qui ne joue pas');
}

/** Le réglage est GLOBAL (carte Horaires), pas par catégorie : une valeur par catégorie n'active rien. */
function testS15_reglageGlobalPasParCategorie(etat){
  var d=_echConfig(6);
  // On force la pause échelonnée UNIQUEMENT sur la catégorie (et pas en global) → ne doit PAS s'activer.
  var cfg = { global: { heure_debut:'09:00', battement_terrain_min:'5' },
              categories:[ Object.assign({}, d.config.categories[0], { pause_echelonnee:'oui' }) ] };
  var r=calculerPlanning(cfg, d.equipes, false);
  var poules=r.poules.filter(function(p){return p.categorie==='U14';});
  // 6 équipes sans réglage global : poules classiques (nombrePoules auto = 2), pas 1 poule échelonnée.
  _ffrAssert(etat, poules.length===2, 'S15 : réglage par catégorie seul → PAS d\'échelonnement (global requis)');
}

/** Fin de la pause de la dernière équipe : renseignée, ≥ « à partir de », cohérente avec la fin de journée. */
function testS15_finPauseDerniereEquipe(etat){
  var d=_echConfig(6); // pause_echelonnee global oui, pause_dejeuner_debut 11:00
  var r=calculerPlanning(d.config, d.equipes, false);
  _ffrAssert(etat, r.finReposEchelonne > 0, 'S15 : fin de pause de la dernière équipe renseignée');
  _ffrAssert(etat, r.finReposEchelonne >= hmVersMin('11:00'), 'S15 : fin de pause ≥ heure « à partir de » (11:00)');
  _ffrAssert(etat, r.finReposEchelonne <= r.maxFin, 'S15 : fin de pause ≤ fin de journée');
}

/* ══════════════════════════════════════════════════════════════════════════
   SESSION 16 — Norme FFR dans la carte catégorie
   · effectif_min appliqué = joueurs sur le terrain (RefFFR_Regles.effectif_terrain).
   · garde-fou à la génération : durée de mi-temps manquante ⇒ blocage AVANT écriture.
   ══════════════════════════════════════════════════════════════════════════ */

/** U12 octobre (T+2 5x5) ⇒ effectif_min 5 (terrain) et effectif_max 9 (feuille). */
function testS16_effectifMinTerrain(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U12', '2026-10-10', '1', '3', null, {});
  _ffrAssert(etat, r.champsZoneB.effectif_min === '5', 'S16 : U12 octobre (5x5) → effectif_min 5 (terrain)');
  _ffrAssert(etat, r.champsZoneB.effectif_max === '9', 'S16 : U12 octobre (5x5) → effectif_max 9 (feuille)');
}

/** U12 juin (10x10) ⇒ effectif_min 10 (terrain) et effectif_max 13 (feuille) — dépend de la forme. */
function testS16_effectifMinTerrainAutreForme(etat) {
  var r = calculerApplicationFFR(_ffrRefS5(), 'U12', '2027-06-13', '1', '3', null, {});
  _ffrAssert(etat, r.champsZoneB.effectif_min === '10', 'S16 : U12 juin (10x10) → effectif_min 10 (terrain)');
  _ffrAssert(etat, r.champsZoneB.effectif_max === '13', 'S16 : U12 juin (10x10) → effectif_max 13 (feuille)');
}

/** Garde-fou : catégorie générée (≥ 3 équipes) sans durée de mi-temps ⇒ signalée. */
function testS16_gardeGenerationDureeVide(etat) {
  var config = { categories: [
    { categorie: 'U10', presente: 'oui', duree_mi_temps_min: '' },   // 3 équipes, vide → signalée
    { categorie: 'U14', presente: 'oui', duree_mi_temps_min: '0' }    // 6 équipes, 0 → signalée
  ] };
  var out = categoriesSansDureeMiTemps(config, { U10: 3, U14: 6 });
  _ffrAssert(etat, out.indexOf('U10') !== -1, 'S16 : U10 (durée vide) signalée');
  _ffrAssert(etat, out.indexOf('U14') !== -1, 'S16 : U14 (durée 0) signalée');
  _ffrAssert(etat, out.length === 2, 'S16 : exactement 2 catégories signalées');
}

/** Garde-fou : durée renseignée ⇒ non signalée. */
function testS16_gardeGenerationDureeRenseignee(etat) {
  var config = { categories: [ { categorie: 'U12', presente: 'oui', duree_mi_temps_min: '10' } ] };
  var out = categoriesSansDureeMiTemps(config, { U12: 4 });
  _ffrAssert(etat, out.length === 0, 'S16 : U12 (durée 10) non signalée');
}

/** Garde-fou : catégorie à 0 équipe (ignorée) et catégorie absente ne sont jamais signalées. */
function testS16_gardeGenerationIgnoreVidesEtAbsentes(etat) {
  var config = { categories: [
    { categorie: 'U8',  presente: 'oui', duree_mi_temps_min: '' },  // 0 équipe → ignorée
    { categorie: 'U16', presente: 'non', duree_mi_temps_min: '' }   // absente → ignorée
  ] };
  var out = categoriesSansDureeMiTemps(config, { U8: 0 });
  _ffrAssert(etat, out.length === 0, 'S16 : 0 équipe et catégorie absente jamais signalées');
}

/* ══════════════════════════════════════════════════════════════════════════
   SESSION 17 — « Trouver une date compatible »
   Pour un mois, calculerDatesCompatiblesFFR liste les jours jouables (dim/mer/sam)
   avec leur statut FFR (compatible / vigilance / conflit / hors-couverture).
   ══════════════════════════════════════════════════════════════════════════ */

/** Helpers de date PURS : jour de semaine (Sakamoto) et nb de jours du mois (bissextile). */
function testS17_helpersDate(etat) {
  _ffrAssert(etat, jourSemaineFFR(2027, 1, 16) === 6, 'S17 : 16/01/2027 = samedi (6)');
  _ffrAssert(etat, jourSemaineFFR(2027, 5, 1) === 6,  'S17 : 01/05/2027 = samedi (6)');
  _ffrAssert(etat, jourSemaineFFR(2027, 1, 1) === 5,  'S17 : 01/01/2027 = vendredi (5)');
  _ffrAssert(etat, nbJoursDansMoisFFR(2027, 2) === 28, 'S17 : février 2027 = 28 jours');
  _ffrAssert(etat, nbJoursDansMoisFFR(2028, 2) === 29, 'S17 : février 2028 = 29 jours (bissextile)');
  _ffrAssert(etat, nbJoursDansMoisFFR(2027, 4) === 30, 'S17 : avril = 30 jours');
}

/** Mois illisible → erreur explicite (aucune date fabriquée). */
function testS17_moisInvalide(etat) {
  var r = calculerDatesCompatiblesFFR(_ffrRefFactice(), 'pas-un-mois', ['U10'], 'C');
  _ffrAssert(etat, !!r.error, 'S17 : mois illisible → erreur');
}

/** On ne propose QUE les dimanches (0), mercredis (3) et samedis (6). */
function testS17_uniquementDimMerSam(etat) {
  var r = calculerDatesCompatiblesFFR(_ffrRefFactice(), '2027-01', ['U10'], 'C');
  var mauvais = (r.jours || []).filter(function (j) { return j.dow !== 0 && j.dow !== 3 && j.dow !== 6; });
  _ffrAssert(etat, r.ok === true && mauvais.length === 0, 'S17 : uniquement dim/mer/sam');
}

/** 16/01/2027 (samedi) = Plateau départemental ⇒ conflit non applicable ; 09/01 (samedi) = compatible. */
function testS17_conflitEtCompatible(etat) {
  var r = calculerDatesCompatiblesFFR(_ffrRefFactice(), '2027-01', ['U10'], 'C');
  var seize = (r.jours || []).filter(function (j) { return j.date === '2027-01-16'; })[0];
  _ffrAssert(etat, seize && seize.statut === 'conflit' && seize.applicable === false,
    'S17 : 16/01 conflit, non applicable');
  var neuf = (r.jours || []).filter(function (j) { return j.date === '2027-01-09'; })[0];
  _ffrAssert(etat, neuf && neuf.statut === 'compatible' && neuf.applicable === true,
    'S17 : 09/01 compatible, applicable');
}

/** U12 en mai : 15/05 (samedi, forme LIMITE) = vigilance APPLICABLE ; 08/05 (72 h) = conflit. */
function testS17_vigilanceApplicable(etat) {
  var r = calculerDatesCompatiblesFFR(_ffrRefFactice(), '2027-05', ['U12'], 'C');
  var quinze = (r.jours || []).filter(function (j) { return j.date === '2027-05-15'; })[0];
  _ffrAssert(etat, quinze && quinze.statut === 'vigilance' && quinze.applicable === true,
    'S17 : 15/05 vigilance, applicable (orange)');
  var huit = (r.jours || []).filter(function (j) { return j.date === '2027-05-08'; })[0];
  _ffrAssert(etat, huit && huit.statut === 'conflit' && huit.applicable === false,
    'S17 : 08/05 conflit 72 h, non applicable');
}

/** Référentiel absent ⇒ statut « inconnu », refDisponible false, aucun jour applicable. */
function testS17_refAbsentInconnu(etat) {
  var r = calculerDatesCompatiblesFFR({ formes: [], dates: [] }, '2027-01', ['U10'], 'C');
  _ffrAssert(etat, r.ok === true && r.refDisponible === false, 'S17 : référentiel absent → refDisponible false');
  var applicables = (r.jours || []).filter(function (j) { return j.applicable; });
  _ffrAssert(etat, applicables.length === 0 && (r.jours || []).every(function (j) { return j.statut === 'inconnu'; }),
    'S17 : référentiel absent → tous « inconnu », aucun applicable');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 18 — feuille de report : « sans objet » quand la question = non    */
/*  Un champ ouvert piloté par une question fermée Oui/Non répondue « non »    */
/*  n'est PAS un trou : le formulaire ne le demande pas. État « sans objet »,  */
/*  hors compteur de manquants. Miroir du grisage front (dep, PR #109).        */
/* -------------------------------------------------------------------------- */

/** Médecin = non ⇒ nom et téléphone « sans objet », jamais manquants. */
function testS18_medecinNonSansObjet(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { org_medecin_oui: 'non' }), { formes: [] });
  var nom = _autoChamp(d, 'Médecin — nom');
  var tel = _autoChamp(d, 'Médecin — téléphone');
  _ffrAssert(etat, nom && nom.etat === 'sans objet' && nom.valeur === '—', 'S18 : médecin non → nom sans objet');
  _ffrAssert(etat, tel && tel.etat === 'sans objet', 'S18 : médecin non → téléphone sans objet');
}

/** Médecin = oui ⇒ nom et téléphone restent exigés (manquants tant que vides). */
function testS18_medecinOuiResteManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { org_medecin_oui: 'oui' }), { formes: [] });
  var nom = _autoChamp(d, 'Médecin — nom');
  _ffrAssert(etat, nom && nom.etat === 'manquant', 'S18 : médecin oui → nom toujours manquant');
}

/** Question SANS réponse (ni défaut) ⇒ le champ lié reste manquant (on ne devine pas « non »). */
function testS18_questionVideResteManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var nom = _autoChamp(d, 'Médecin — nom');
  var montant = _autoChamp(d, 'Droits — montant');
  _ffrAssert(etat, nom && nom.etat === 'manquant', 'S18 : question vide → médecin nom manquant');
  _ffrAssert(etat, montant && montant.etat === 'manquant', 'S18 : question vide → montant manquant');
}

/** Label EDR = non (saisi) ⇒ date du dernier label « sans objet ». */
function testS18_labelNonDateSansObjet(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { org_label_edr: 'non' }), { formes: [] });
  var date = _autoChamp(d, 'Date du dernier label');
  _ffrAssert(etat, date && date.etat === 'sans objet', 'S18 : label non → date sans objet');
}

/** Label EDR vide ⇒ défaut documenté « oui » ⇒ la date reste exigée (manquante). */
function testS18_labelDefautOuiDateManquante(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var date = _autoChamp(d, 'Date du dernier label');
  _ffrAssert(etat, date && date.etat === 'manquant', 'S18 : label défaut oui → date manquante');
}

/** B.5 : chaque question logistique à « non » rend ses champs ouverts « sans objet ». */
function testS18_logistiqueNonSansObjet(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    org_droits_oui: 'non', org_hebergement_oui: 'non', org_repas_oui: 'non', org_gouters_oui: 'non'
  }), { formes: [] });
  ['Droits — montant', 'Hébergement — structure', 'Repas — fournisseur', 'Repas — prix',
   'Goûters — fournisseur', 'Goûters — prix'].forEach(function (lib) {
    var c = _autoChamp(d, lib);
    _ffrAssert(etat, c && c.etat === 'sans objet', 'S18 : « ' + lib + ' » sans objet quand question = non');
  });
}

/** Une valeur DÉJÀ saisie reste affichée « saisi », même question à non (miroir du grisage front). */
function testS18_valeurSaisieConservee(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    org_repas_oui: 'non', org_repas_fournisseur: 'Traiteur du Plessis'
  }), { formes: [] });
  var c = _autoChamp(d, 'Repas — fournisseur');
  _ffrAssert(etat, c && c.etat === 'saisi' && c.valeur === 'Traiteur du Plessis',
    'S18 : valeur saisie conservée malgré question = non');
}

/** Les « sans objet » sortent du compteur : répondre « non » aux 5 questions doit le faire baisser
 *  d'exactement 14 (5 questions saisies + 9 champs liés sans objet) par rapport au dossier vide. */
function testS18_sansObjetJamaisCompte(etat) {
  var vide = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var tousNon = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    org_label_edr: 'non', org_medecin_oui: 'non', org_droits_oui: 'non',
    org_hebergement_oui: 'non', org_repas_oui: 'non', org_gouters_oui: 'non'
  }), { formes: [] });
  // org_label_edr passe de « calcule » (défaut oui) à « saisi » : n'était pas compté ; sa date le
  // reste (manquant→sans objet = −1). Les 5 autres questions : manquant→saisi (−5) ; leurs 8 champs
  // liés : manquant→sans objet (−8). Total attendu : −14.
  _ffrAssert(etat, vide.nbManquants - tousNon.nbManquants === 14,
    'S18 : compteur − 14 quand toutes les questions fermées passent à non (obtenu ' +
    (vide.nbManquants - tousNon.nbManquants) + ')');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 19 — feuille de report : phase 2 PRÉDITE avant génération          */
/*  La demande se dépose des semaines avant le jour J : la phase 2 est une     */
/*  conséquence ARITHMÉTIQUE de la structure des poules (FORMULES_PHASE2,      */
/*  sessions 9-10). Seule une prédiction EXACTE ('predit') est rendue.         */
/* -------------------------------------------------------------------------- */

/** Matin CROISE à 2 poules étiquetées, après-midi non généré ⇒ phase 2 = 1 (prédit, exact). */
function testS19_phase2PrediteCroiseDeuxPoules(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T3' },
    { phase: 'poule', poule: 'B', equipe_A: 'T4', equipe_B: 'T5' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgCroise(), _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.valeur === '1' && p2.etat === 'calcule', 'S19 : CROISE 2 poules → phase 2 = 1 (prédit)');
  _ffrAssert(etat, p2 && p2.origine.indexOf('prédit') !== -1, 'S19 : origine dit « prédit »');
}

/** Matin CROISE à 3 poules ⇒ phase 2 = 2 (round-robin par rang). */
function testS19_phase2PrediteCroiseTroisPoules(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'B', equipe_A: 'T3', equipe_B: 'T4' },
    { phase: 'poule', poule: 'C', equipe_A: 'T5', equipe_B: 'T6' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgCroise(), _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.valeur === '2' && p2.etat === 'calcule', 'S19 : CROISE 3 poules → phase 2 = 2 (prédit)');
}

/** CROISE_DIAGONAL en poules ÉGALES ⇒ phase 2 = 1 (exact). */
function testS19_diagonalEgalPredit(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'B', equipe_A: 'T3', equipe_B: 'T4' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'CROISE_DIAGONAL', format_mi_temps: '2', duree_mi_temps_min: '10' }]),
    _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.valeur === '1' && p2.etat === 'calcule', 'S19 : DIAGONAL égal → phase 2 = 1 (prédit)');
}

/** CROISE_DIAGONAL en poules INÉGALES ⇒ borne basse, JAMAIS rendue : reste manquant. */
function testS19_diagonalInegalJamaisPredit(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T3' },
    { phase: 'poule', poule: 'A', equipe_A: 'T2', equipe_B: 'T3' },
    { phase: 'poule', poule: 'B', equipe_A: 'T4', equipe_B: 'T5' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'CROISE_DIAGONAL', format_mi_temps: '2', duree_mi_temps_min: '10' }]),
    _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.etat === 'manquant', 'S19 : DIAGONAL inégal → borne basse jamais rendue (manquant)');
}

/** LIBRE sans après-midi ⇒ 1 phase = matin constaté + round-robin prédit (3 équipes : 2 + 2 = 4). */
function testS19_librePreditJourneeEntiere(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T3' },
    { phase: 'poule', poule: 'A', equipe_A: 'T2', equipe_B: 'T3' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'LIBRE', format_mi_temps: '2', duree_mi_temps_min: '10' }]),
    _refAutorisation());
  var une = _autoChamp(d, '1 phase : matchs/équipe');
  _ffrAssert(etat, une && une.valeur === '4' && une.etat === 'calcule', 'S19 : LIBRE → 2 constatés + 2 prédits = 4');
  _ffrAssert(etat, une && une.origine.indexOf('prédit') !== -1, 'S19 : LIBRE → origine dit « prédit »');
}

/** Matin SANS poule étiquetée ⇒ structure inconnue : rien de prédit (comportement S8 préservé). */
function testS19_sansPoulesEtiqueteesResteManquant(etat) {
  var mpc = { U12: [
    { phase: 'poule', equipe_A: 'T1', equipe_B: 'T2' }, { phase: 'poule', equipe_A: 'T1', equipe_B: 'T3' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgCroise(), _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.etat === 'manquant', 'S19 : sans poules étiquetées → jamais prédit');
}

/** Catégorie U14 SCF ⇒ structure propre (triangulaires) : jamais prédite par les formules standard. */
function testS19_scfJamaisPredit(etat) {
  var cfg = { global: {}, categories: [{ categorie: 'U14', presente: 'oui', format_apresmidi: 'CROISE',
    format_mi_temps: '2', duree_mi_temps_min: '15', contexte_tournoi: 'SCF', scf_phase: 'P2' }] };
  var mpc = { U14: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'B', equipe_A: 'T3', equipe_B: 'T4' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2026-09-19' }, catsPresentes: ['U14'], matchsParCategorie: mpc },
    cfg, _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.etat === 'manquant', 'S19 : SCF → jamais prédit par les formules standard');
}

/** Après-midi DÉJÀ généré ⇒ constaté (prioritaire), l'origine ne dit PAS « prédit ». */
function testS19_apremGenereResteConstate(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'B', equipe_A: 'T3', equipe_B: 'T4' },
    { phase: 'classement', poule: 'N1', equipe_A: 'T1', equipe_B: 'T3' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgCroise(), _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.valeur === '1' && p2.origine.indexOf('prédit') === -1,
    'S19 : après-midi généré → constaté, pas prédit');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 20 — format POULES_NIVEAU : tranches du classement de midi en      */
/*  round-robin COMPLET. Le 1er de la poule haute = vainqueur, sans finale.    */
/* -------------------------------------------------------------------------- */

/** Un classement de test : chaque poule = liste [id, pts] déjà triée. */
function _clNiveau(poulesSpec) {
  return { poules: poulesSpec.map(function (p, i) {
    return { nom_poule: String.fromCharCode(65 + i), classement: p.map(function (e) {
      return { id_equipe: e[0], nom_equipe: e[0], pts: e[1], diff: 0, bp: 0 };
    }) };
  }) };
}

/** Découpage en tranches de 4-5, le BAS joue plus (esprit EDR, décision Romain). */
function testS20_taillesPoulesNiveau(etat) {
  var cas = [ [4, [4]], [6, [3, 3]], [7, [3, 4]], [8, [4, 4]], [9, [4, 5]],
              [12, [4, 4, 4]], [16, [4, 4, 4, 4]], [20, [5, 5, 5, 5]], [1, []] ];
  cas.forEach(function (c) {
    var res = taillesPoulesNiveau(c[0]);
    _ffrAssert(etat, JSON.stringify(res) === JSON.stringify(c[1]),
      'S20 : tailles(' + c[0] + ') = [' + c[1] + '] (obtenu [' + res + '])');
  });
}

/** Classement de midi : rang par rang, départagé aux points (le meilleur 2e devant l'autre). */
function testS20_ordonnancementMidi(etat) {
  var cl = _clNiveau([ [['A1', 9], ['A2', 5]], [['B1', 8], ['B2', 6]] ]);
  var ids = ordonnerClassementMidi(cl).map(function (e) { return e.id_equipe; });
  _ffrAssert(etat, JSON.stringify(ids) === JSON.stringify(['A1', 'B1', 'B2', 'A2']),
    'S20 : ordre midi = 1ers (aux points) puis 2es (aux points), obtenu ' + ids.join(','));
}

/** 2 poules de 4 ⇒ N1 = les deux 1ers + les deux 2es, round-robin COMPLET : 3 matchs chacune. */
function testS20_fixturesRoundRobinComplet(etat) {
  var cl = _clNiveau([
    [['A1', 9], ['A2', 6], ['A3', 3], ['A4', 1]],
    [['B1', 8], ['B2', 7], ['B3', 4], ['B4', 2]]
  ]);
  var res = fixturesApresMidiPoulesNiveau({ categorie: 'U8' }, cl);
  var n1 = res.fixtures.filter(function (f) { return f.poule === 'N1'; });
  var n2 = res.fixtures.filter(function (f) { return f.poule === 'N2'; });
  _ffrAssert(etat, n1.length === 6 && n2.length === 6, 'S20 : 6 matchs par poule de niveau (round-robin de 4)');
  var comptes = {};
  res.fixtures.forEach(function (f) {
    comptes[f.equipe_A] = (comptes[f.equipe_A] || 0) + 1;
    comptes[f.equipe_B] = (comptes[f.equipe_B] || 0) + 1;
  });
  var tous3 = Object.keys(comptes).every(function (id) { return comptes[id] === 3; });
  _ffrAssert(etat, tous3, 'S20 : chaque équipe joue exactement 3 matchs l\'après-midi');
  var idsN1 = {};
  n1.forEach(function (f) { idsN1[f.equipe_A] = true; idsN1[f.equipe_B] = true; });
  _ffrAssert(etat, idsN1.A1 && idsN1.B1 && idsN1.A2 && idsN1.B2 && !idsN1.A3 && !idsN1.B3,
    'S20 : N1 = les deux 1ers + les deux 2es, rien d\'autre');
}

/** 3 poules de 4 (12 équipes) ⇒ le MEILLEUR 2e monte en poule haute, les autres en niveau 2. */
function testS20_fixturesMeilleur2eMonte(etat) {
  var cl = _clNiveau([
    [['A1', 9], ['A2', 5], ['A3', 3], ['A4', 1]],
    [['B1', 8], ['B2', 6], ['B3', 4], ['B4', 2]],
    [['C1', 7], ['C2', 4], ['C3', 3], ['C4', 0]]
  ]);
  var res = fixturesApresMidiPoulesNiveau({ categorie: 'U10' }, cl);
  var idsN1 = {};
  res.fixtures.filter(function (f) { return f.poule === 'N1'; })
    .forEach(function (f) { idsN1[f.equipe_A] = true; idsN1[f.equipe_B] = true; });
  _ffrAssert(etat, idsN1.A1 && idsN1.B1 && idsN1.C1 && idsN1.B2,
    'S20 : N1 = les trois 1ers + le meilleur 2e (B2, 6 pts)');
  _ffrAssert(etat, !idsN1.A2 && !idsN1.C2, 'S20 : les autres 2es ne montent pas en N1');
}

/** Formule de phase 2 : plus grande tranche − 1, nature « predit » (exact). */
function testS20_formulePhase2(etat) {
  var f = FORMULES_PHASE2.POULES_NIVEAU;
  var cas = [ [8, 3], [9, 4], [12, 3], [20, 4], [6, 2], [1, 0] ];
  cas.forEach(function (c) {
    var r = f({ totalEquipes: c[0], nbPoules: 2, poulesEgales: true, matinMax: 3 });
    _ffrAssert(etat, r.valeur === c[1] && r.nature === 'predit',
      'S20 : formule(' + c[0] + ' équipes) = ' + c[1] + ' predit (obtenu ' + r.valeur + ' ' + r.nature + ')');
  });
}

/** Feuille de report : U12 en POULES_NIVEAU, 8 équipes le matin, après-midi non généré ⇒ Phase 2 = 3. */
function testS20_reportPhase2Predite(etat) {
  var mpc = { U12: [
    { phase: 'poule', poule: 'A', equipe_A: 'T1', equipe_B: 'T2' },
    { phase: 'poule', poule: 'A', equipe_A: 'T3', equipe_B: 'T4' },
    { phase: 'poule', poule: 'B', equipe_A: 'T5', equipe_B: 'T6' },
    { phase: 'poule', poule: 'B', equipe_A: 'T7', equipe_B: 'T8' }
  ] };
  var d = assemblerDossierAutorisation({ tournoi: { date: '2027-06-13' }, catsPresentes: ['U12'], matchsParCategorie: mpc },
    _cfgAutorisation([{ categorie: 'U12', format_apresmidi: 'POULES_NIVEAU', format_mi_temps: '2', duree_mi_temps_min: '10' }]),
    _refAutorisation());
  var p2 = _autoChamp(d, 'Phase 2 (poules de niveau) : matchs/équipe');
  _ffrAssert(etat, p2 && p2.valeur === '3' && p2.etat === 'calcule', 'S20 : report → phase 2 = 3 (prédit)');
  _ffrAssert(etat, p2 && p2.origine.indexOf('prédit') !== -1, 'S20 : report → origine dit « prédit »');
}

/** formatApresMidi reconnaît POULES_NIVEAU ; une typo retombe sur CROISE (défaut prudent). */
function testS20_formatReconnu(etat) {
  _ffrAssert(etat, formatApresMidi({ format_apresmidi: 'POULES_NIVEAU' }) === 'POULES_NIVEAU',
    'S20 : POULES_NIVEAU reconnu');
  _ffrAssert(etat, formatApresMidi({ format_apresmidi: 'POULE_NIVEAU' }) === 'CROISE',
    'S20 : typo → défaut CROISE (comportement historique)');
}

/** Moins de 2 équipes classées ⇒ avertissement, aucune fixture, jamais d'exception. */
function testS20_moinsDe2Equipes(etat) {
  var res = fixturesApresMidiPoulesNiveau({ categorie: 'U8' }, _clNiveau([ [['A1', 9]] ]));
  _ffrAssert(etat, res.fixtures.length === 0 && res.avert && res.avert.length === 1,
    'S20 : 1 équipe → avertissement, 0 fixture');
}

/** La vue publique « invitation » expose format_apresmidi (note doctrine FFR) — et toujours
 *  RIEN hors liste : depuis la refonte vitrine, duree_mi_temps_min est autorisée (cadre sportif),
 *  le témoin « hors liste » est donc `terrains` (réglage interne, jamais public). */
function testS20_invitationExposeFormat(etat) {
  var cfg = { global: {}, categories: [{ categorie: 'U8', presente: 'oui',
    format_apresmidi: 'POULES_NIVEAU', duree_mi_temps_min: '10', terrains: '1,2' }] };
  var f = filtrerConfigPublique(cfg, 'invitation');
  var c = f.categories[0];
  _ffrAssert(etat, c.format_apresmidi === 'POULES_NIVEAU', 'S20 : invitation expose format_apresmidi');
  _ffrAssert(etat, !('terrains' in c), 'S20 : invitation n\'expose pas les champs hors liste (terrains)');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 21 — B.4 : responsable sécurité repris de « Contacts & sécurité »  */
/*  Même cascade que le PDF : identique (défaut) → référent tournoi ;          */
/*  'non' → personne distincte ; jamais de repli croisé.                       */
/* -------------------------------------------------------------------------- */

/** Défaut (identique, champ vide ou « oui ») ⇒ le référent du tournoi remonte. */
function testS21_securiteIdentiqueRefTournoi(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    referent_nom: 'Alex Dupont', referent_tel: '0611223344'
  }), { formes: [] });
  var nom = _autoChamp(d, 'Responsable sécurité — nom');
  var tel = _autoChamp(d, 'Responsable sécurité — téléphone');
  _ffrAssert(etat, nom && nom.valeur === 'Alex Dupont' && nom.etat === 'calcule',
    'S21 : identique → nom = référent tournoi (calcule)');
  _ffrAssert(etat, tel && tel.valeur === '0611223344', 'S21 : identique → tél = référent tournoi');
  _ffrAssert(etat, nom.origine.indexOf('même personne') !== -1, 'S21 : origine dit « même personne »');
}

/** securite_referent_identique = non ⇒ la personne DISTINCTE remonte (jamais le référent tournoi). */
function testS21_securiteDistincte(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    referent_nom: 'Alex Dupont', referent_tel: '0611223344',
    securite_referent_identique: 'non',
    securite_referent_nom: 'Sam Sécu', securite_referent_tel: '0699887766'
  }), { formes: [] });
  var nom = _autoChamp(d, 'Responsable sécurité — nom');
  _ffrAssert(etat, nom && nom.valeur === 'Sam Sécu', 'S21 : distinct → nom = référent sécurité');
  _ffrAssert(etat, nom.origine.indexOf('distincte') !== -1, 'S21 : origine dit « personne distincte »');
}

/** Distinct déclaré mais non renseigné ⇒ manquant (pas de repli croisé sur le référent tournoi). */
function testS21_securiteDistincteVideResteManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    referent_nom: 'Alex Dupont', securite_referent_identique: 'non'
  }), { formes: [] });
  var nom = _autoChamp(d, 'Responsable sécurité — nom');
  _ffrAssert(etat, nom && nom.etat === 'manquant', 'S21 : distinct non renseigné → manquant, jamais de repli');
}

/** Rien de saisi nulle part ⇒ manquant (comportement historique conservé). */
function testS21_securiteToutVideManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var nom = _autoChamp(d, 'Responsable sécurité — nom');
  _ffrAssert(etat, nom && nom.etat === 'manquant', 'S21 : tout vide → manquant');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 22 — B.5 : droits d'inscription repris des modalités d'inscription */
/*  (tarif d'engagement). org_* saisi prioritaire ; montant = 1er nombre du    */
/*  texte libre ; « non » effectif ⇒ montant sans objet ; rien ⇒ manquant.     */
/* -------------------------------------------------------------------------- */

/** Modalités renseignées, org_* vides ⇒ oui + montant repris (calcule, origine modalités). */
function testS22_droitsRepresDesModalites(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    tarif_engagement_oui: 'oui', tarif_engagement_montant: '150 € par équipe'
  }), { formes: [] });
  var oui = _autoChamp(d, 'Droits d\'inscription');
  var montant = _autoChamp(d, 'Droits — montant');
  _ffrAssert(etat, oui && oui.valeur === 'oui' && oui.etat === 'calcule', 'S22 : droits = oui repris des modalités');
  _ffrAssert(etat, oui.origine.indexOf('modalités') !== -1, 'S22 : origine dit « modalités »');
  _ffrAssert(etat, montant && montant.valeur === '150' && montant.etat === 'calcule',
    'S22 : montant = 150 (1er nombre du texte libre)');
}

/** Un champ org_* SAISI reste prioritaire sur les modalités (jamais écrasé). */
function testS22_droitsSaisiPrioritaire(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    org_droits_oui: 'non', tarif_engagement_oui: 'oui', tarif_engagement_montant: '150'
  }), { formes: [] });
  var oui = _autoChamp(d, 'Droits d\'inscription');
  var montant = _autoChamp(d, 'Droits — montant');
  _ffrAssert(etat, oui && oui.valeur === 'non' && oui.etat === 'saisi', 'S22 : org saisi prioritaire sur modalités');
  _ffrAssert(etat, montant && montant.etat === 'sans objet', 'S22 : non saisi → montant sans objet');
}

/** Modalités à « non » ⇒ droits non (repris) et montant sans objet. */
function testS22_tarifNonMontantSansObjet(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { tarif_engagement_oui: 'non' }), { formes: [] });
  var oui = _autoChamp(d, 'Droits d\'inscription');
  var montant = _autoChamp(d, 'Droits — montant');
  _ffrAssert(etat, oui && oui.valeur === 'non' && oui.etat === 'calcule', 'S22 : tarif non → droits non (repris)');
  _ffrAssert(etat, montant && montant.etat === 'sans objet', 'S22 : tarif non → montant sans objet');
}

/** Rien nulle part ⇒ les deux champs restent manquants (comportement historique). */
function testS22_rienNullePartManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var oui = _autoChamp(d, 'Droits d\'inscription');
  var montant = _autoChamp(d, 'Droits — montant');
  _ffrAssert(etat, oui && oui.etat === 'manquant' && montant && montant.etat === 'manquant',
    'S22 : rien nulle part → manquants');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 23 — détail par équipe (réponse d'invitation) + cascade B.3        */
/*  validerDetailEffectifs est PUR ; totaux TOUJOURS calculés serveur.         */
/* -------------------------------------------------------------------------- */

/** Détail complet et valide ⇒ totaux serveur corrects. */
function testS23_detailValide(etat) {
  var r = validerDetailEffectifs({ U8: 2, U10: 1 },
    JSON.stringify({ U8: [{ j: 8, e: 2 }, { j: 7, e: 1 }], U10: [{ j: 10, e: 2 }] }),
    { U8: 5, U10: 7 });
  _ffrAssert(etat, !r.error && r.totalJoueurs === 25 && r.totalEducateurs === 5,
    'S23 : détail valide → totaux 25 joueurs / 5 éducateurs (calculés serveur)');
  _ffrAssert(etat, r.detail.U8.length === 2 && r.detail.U8[0].j === 8, 'S23 : détail normalisé conservé');
}

/** Moins d'entrées que d'équipes ⇒ erreur claire. */
function testS23_detailLongueurFausse(etat) {
  var r = validerDetailEffectifs({ U8: 2 }, JSON.stringify({ U8: [{ j: 8, e: 1 }] }), { U8: 5 });
  _ffrAssert(etat, r.error && r.error.indexOf('U8') !== -1, 'S23 : détail incomplet → erreur');
}

/** Joueurs sous l'effectif minimum FFR ⇒ refusé (règle du formulaire, cohérente avec l'UI). */
function testS23_detailSousLeMinimum(etat) {
  var r = validerDetailEffectifs({ U8: 1 }, JSON.stringify({ U8: [{ j: 4, e: 1 }] }), { U8: 5 });
  _ffrAssert(etat, r.error && r.error.indexOf('5 joueurs minimum') !== -1, 'S23 : sous le minimum → refusé');
}

/** Joueurs absents/invalides ⇒ erreur (jamais deviné). */
function testS23_detailJoueursManquants(etat) {
  var r = validerDetailEffectifs({ U8: 1 }, JSON.stringify({ U8: [{ e: 2 }] }), { U8: null });
  _ffrAssert(etat, !!r.error, 'S23 : joueurs manquants → erreur');
}

/** Éducateurs absents ou 0 ⇒ acceptés comme 0 (réponse honnête, jamais bloquée). */
function testS23_educateursZeroAccepte(etat) {
  var r = validerDetailEffectifs({ U8: 1 }, JSON.stringify({ U8: [{ j: 6 }] }), { U8: 5 });
  _ffrAssert(etat, !r.error && r.totalEducateurs === 0 && r.detail.U8[0].e === 0,
    'S23 : éducateurs absents → 0, jamais bloquant');
}

/** B.3 : la somme des éducateurs déclarés répond à « Nombre d'éducateurs » (calcule + origine). */
function testS23_educateursCascadeB3(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 9 } },
    _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '9' && c.etat === 'calcule', 'S23 : B.3 éducateurs = 9 (cascade)');
  _ffrAssert(etat, c.origine.indexOf('déclarés par les clubs') !== -1, 'S23 : origine dit « déclarés »');
}

/** RÈGLE CHANGÉE EN SESSION 26 : org_nb_educateurs n'est plus prioritaire, c'est un REPLI — le
 *  total manuel masquait la déclaration des clubs (24 saisi cachait 7 déclarés). Il n'est donc
 *  utilisé que si AUCUNE source structurelle n'existe. Contrat de priorité : voir testS26_*. */
function testS23_educateursTotalManuelEstUnRepli(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { org_nb_educateurs: '24' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '24' && c.etat === 'saisi', 'S23 : total manuel seul → utilisé en repli');
}

/** Rien déclaré, rien saisi ⇒ manquant (comportement historique). */
function testS23_educateursRienManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.etat === 'manquant', 'S23 : rien nulle part → manquant');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 25 — B.1 : « Type de terrain » repris de la NATURE des grands      */
/*  terrains déclarés (carte Terrains, Config.terrains_physiques[].nature).    */
/*  Le structurel prime ; repli sur org_type_terrain ; jamais deviné.          */
/* -------------------------------------------------------------------------- */

/** JSON de terrains physiques pour les tests (natures paramétrables). */
function _terrainsAvecNatures(natures) {
  return JSON.stringify((natures || []).map(function (n, i) {
    return { nom: 'Terrain ' + (i + 1), nature: n, type: 'rugby', L: 100, W: 68, pos: '' };
  }));
}

/** Natures déclarées ⇒ CALCULÉ, natures distinctes dans l'ordre, dédupliquées. */
function testS25_natureCalculeeDepuisTerrains(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    terrains_physiques: _terrainsAvecNatures(['Gazon', 'Gazon', 'Synthétique'])
  }), { formes: [] });
  var t = _autoChamp(d, 'Type de terrain');
  _ffrAssert(etat, t && t.etat === 'calcule' && t.valeur === 'Gazon, Synthétique',
    'S25 : natures déclarées → calculé, distinctes et dédupliquées');
  _ffrAssert(etat, /grands terrains déclarés/.test(t.origine), 'S25 : origine dit « grands terrains déclarés »');
}

/** La cascade structurelle PRIME sur une saisie org_type_terrain (modèle participants). */
function testS25_naturePrimeSurSaisi(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    org_type_terrain: 'Neige', terrains_physiques: _terrainsAvecNatures(['Gazon'])
  }), { formes: [] });
  var t = _autoChamp(d, 'Type de terrain');
  _ffrAssert(etat, t && t.etat === 'calcule' && t.valeur === 'Gazon', 'S25 : le déclaré par terrain prime sur la saisie');
}

/** Terrains déclarés SANS nature ⇒ repli sur la saisie org_type_terrain (état saisi). */
function testS25_sansNatureRepliSaisi(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    org_type_terrain: 'Synthétique', terrains_physiques: _terrainsAvecNatures(['', ''])
  }), { formes: [] });
  var t = _autoChamp(d, 'Type de terrain');
  _ffrAssert(etat, t && t.etat === 'saisi' && t.valeur === 'Synthétique', 'S25 : aucune nature → repli saisi');
}

/** Rien nulle part ⇒ manquant (jamais deviné) — comportement historique conservé. */
function testS25_rienResteManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var t = _autoChamp(d, 'Type de terrain');
  _ffrAssert(etat, t && t.etat === 'manquant', 'S25 : rien nulle part → manquant');
}

/** JSON invalide ⇒ chemin PRUDENT : aucune exception, repli sur la saisie. */
function testS25_jsonInvalidePrudent(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    terrains_physiques: '{pas du json', org_type_terrain: 'Gazon'
  }), { formes: [] });
  var t = _autoChamp(d, 'Type de terrain');
  _ffrAssert(etat, t && t.etat === 'saisi' && t.valeur === 'Gazon', 'S25 : JSON invalide → repli saisi, sans erreur');
}

/** Natures partielles ⇒ calculé quand même, mais les terrains sans nature sont SIGNALÉS. */
function testS25_naturePartielleSignalee(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {
    terrains_physiques: _terrainsAvecNatures(['Gazon', '', ''])
  }), { formes: [] });
  var t = _autoChamp(d, 'Type de terrain');
  _ffrAssert(etat, t && t.etat === 'calcule' && t.valeur === 'Gazon', 'S25 : nature partielle → calculé avec le connu');
  _ffrAssert(etat, /2 terrain\(s\) sans nature/.test(t.origine), 'S25 : origine signale 2 terrains sans nature');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 26 — B.3 : total des ÉDUCATEURS = cascade ADDITIVE                 */
/*  déclarés par les clubs acceptés + encadrants du club ORGANISATEUR (absents */
/*  de toute réponse d'invitation). Le structurel prime ; jamais deviné ; un   */
/*  ancien total manuel ignoré est SIGNALÉ, jamais soustrait ni redistribué.   */
/* -------------------------------------------------------------------------- */

/** Le total ADDITIONNE les deux sources (7 déclarés + 17 du club organisateur = 24). */
function testS26_totalAdditionneLesDeuxSources(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], { org_nb_educateurs_club: '17' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '24' && c.etat === 'calcule', 'S26 : 7 déclarés + 17 club = 24 (calculé)');
  _ffrAssert(etat, /7 déclaré/.test(c.origine) && /17 du club/.test(c.origine),
    'S26 : origine détaille les deux parts');
}

/** RÉGRESSION session 23 : la déclaration des clubs n'est plus masquée par un total manuel. */
function testS26_declarePrimeSurTotalManuel(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], { org_nb_educateurs: '24' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '7' && c.etat === 'calcule', 'S26 : déclaré (7) prime sur l\'ancien total manuel (24)');
}

/** L'ancien total manuel ignoré est SIGNALÉ (avert), jamais écrasé en silence. */
function testS26_totalManuelIgnoreSignale(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], { org_nb_educateurs: '24' }), { formes: [] });
  var a = _autoChamp(d, 'Cohérence éducateurs');
  _ffrAssert(etat, a && a.etat === 'avert' && a.valeur.indexOf('24') !== -1, 'S26 : ancien total signalé');
  _ffrAssert(etat, d.nbManquants === assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], {}), { formes: [] }).nbManquants, 'S26 : le signalement n\'est jamais compté en manquant');
}

/** Aucun signalement quand il n'y a pas d'ancien total manuel. */
function testS26_pasDeSignalementSansAncienTotal(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], { org_nb_educateurs_club: '17' }), { formes: [] });
  _ffrAssert(etat, !_autoChamp(d, 'Cohérence éducateurs'), 'S26 : rien à signaler → pas de ligne orange');
}

/** Club organisateur SEUL (aucun club n'a encore répondu) ⇒ calculé avec sa seule part. */
function testS26_clubSeulSansDeclaration(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { org_nb_educateurs_club: '17' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '17' && c.etat === 'calcule', 'S26 : club organisateur seul → 17 calculé');
}

/** Zéro éducateur au club organisateur est une RÉPONSE (0), pas une absence de réponse. */
function testS26_zeroClubEstUneReponse(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], { org_nb_educateurs_club: '0' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '7' && c.etat === 'calcule', 'S26 : 0 au club → total 7 (jamais bloquant)');
}

/** Aucune source structurelle ⇒ repli sur l'ancien total manuel (compatibilité). */
function testS26_repliTotalManuel(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], { org_nb_educateurs: '24' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '24' && c.etat === 'saisi', 'S26 : rien de structurel → repli sur le total saisi');
  _ffrAssert(etat, !_autoChamp(d, 'Cohérence éducateurs'), 'S26 : total manuel UTILISÉ → aucun signalement');
}

/** Rien nulle part ⇒ manquant (jamais deviné) — comportement historique conservé. */
function testS26_rienNullePartManquant(etat) {
  var d = assemblerDossierAutorisation({}, _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.etat === 'manquant', 'S26 : rien nulle part → manquant');
}

/** Valeur illisible (texte) au club organisateur ⇒ chemin PRUDENT, jamais d'exception ni de NaN. */
function testS26_valeurIllisiblePrudente(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 7 } },
    _cfgAutorisation([], { org_nb_educateurs_club: 'beaucoup' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '7' && c.etat === 'calcule', 'S26 : valeur illisible ignorée, total reste juste');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 27 — effectifs déclarés ÉQUIPE PAR ÉQUIPE (ajout / crayon)         */
/*  effectifsEquipesManuelles est PUR. Enjeu central : ANTI-DOUBLE-COMPTE —    */
/*  une équipe créée par une réponse d'invitation ('auto') est déjà couverte   */
/*  par les totaux de son club et ne doit JAMAIS être recomptée ici.           */
/* -------------------------------------------------------------------------- */

/** Fabrique une équipe pour les tests. */
function _eq(nom, cat, source, j, e) {
  return { id_equipe: nom, nom_equipe: nom, categorie: cat, poule: '',
           source: source, nb_joueurs: j, nb_educateurs: e };
}

/** Somme des effectifs des équipes manuelles (joueurs et éducateurs). */
function testS27_sommeEquipesManuelles(etat) {
  var r = effectifsEquipesManuelles([
    _eq('A', 'U8', 'manuel', '12', '2'), _eq('B', 'U8', 'manuel', '10', '1')
  ]);
  _ffrAssert(etat, r.joueurs === 22 && r.educateurs === 3, 'S27 : somme des équipes manuelles = 22 joueurs / 3 éducs');
  _ffrAssert(etat, r.nbEquipesDeclarees === 2 && r.nbEquipesManuelles === 2, 'S27 : comptes d\'équipes justes');
}

/** CŒUR DU SUJET : une équipe 'auto' n'est JAMAIS comptée (déjà dans les totaux de son club). */
function testS27_equipeAutoJamaisRecomptee(etat) {
  var r = effectifsEquipesManuelles([
    _eq('A', 'U8', 'manuel', '12', '2'), _eq('SURESNES', 'U8', 'auto', '15', '3')
  ]);
  _ffrAssert(etat, r.joueurs === 12 && r.educateurs === 2, 'S27 : équipe auto écartée → pas de double compte');
  _ffrAssert(etat, r.nbEquipesManuelles === 1, 'S27 : l\'équipe auto ne compte pas comme manuelle');
}

/** Équipe sans `source` (Sheet antérieur à la colonne) ⇒ traitée comme MANUELLE (cas prudent). */
function testS27_sourceAbsenteEstManuelle(etat) {
  var r = effectifsEquipesManuelles([_eq('A', 'U8', '', '12', '2')]);
  _ffrAssert(etat, r.joueurs === 12, 'S27 : source absente → comptée (aucun club derrière elle)');
}

/** Rien de déclaré ⇒ null (distinct de 0, qui est une réponse) : la feuille retombe sur le saisi. */
function testS27_rienDeclareDonneNull(etat) {
  var r = effectifsEquipesManuelles([_eq('A', 'U8', 'manuel', '', ''), _eq('B', 'U8', 'manuel', '', '')]);
  _ffrAssert(etat, r.joueurs === null && r.educateurs === null, 'S27 : rien déclaré → null, jamais 0');
  _ffrAssert(etat, r.nbEquipesDeclarees === 0 && r.nbEquipesManuelles === 2, 'S27 : 0 déclarée sur 2 manuelles');
}

/** Zéro éducateur est une RÉPONSE (0), pas une absence de réponse. */
function testS27_zeroEstUneReponse(etat) {
  var r = effectifsEquipesManuelles([_eq('A', 'U8', 'manuel', '12', '0')]);
  _ffrAssert(etat, r.educateurs === 0, 'S27 : 0 éducateur déclaré → 0 (pas null)');
}

/** Valeurs illisibles ignorées, sans exception ni NaN (chemin prudent). */
function testS27_valeursIllisiblesIgnorees(etat) {
  var r = effectifsEquipesManuelles([_eq('A', 'U8', 'manuel', 'douze', '-3'), _eq('B', 'U8', 'manuel', '10', '1')]);
  _ffrAssert(etat, r.joueurs === 10 && r.educateurs === 1, 'S27 : valeurs illisibles/négatives ignorées');
}

/** Liste vide / absente ⇒ null, aucune exception. */
function testS27_listeVideSansErreur(etat) {
  var r = effectifsEquipesManuelles([]);
  var r2 = effectifsEquipesManuelles(null);
  _ffrAssert(etat, r.joueurs === null && r2.joueurs === null, 'S27 : liste vide ou absente → null, sans erreur');
}

/** A.4 : les joueurs déclarés par équipe alimentent « Nombre de participants » (calculé). */
function testS27_participantsDepuisEquipes(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 22, nbEquipes: 2,
    nbJoueursEquipes: 22, nbEquipesDeclarees: 2, nbEquipesManuelles: 2 } },
    _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, c && c.valeur === '22' && c.etat === 'calcule', 'S27 : participants = 22 (équipes saisies)');
  _ffrAssert(etat, /équipes saisies à la main/.test(c.origine), 'S27 : origine cite les équipes saisies');
}

/** Origine DÉTAILLÉE quand les deux sources coexistent (clubs invités + équipes à la main). */
function testS27_origineDetailleLesDeuxSources(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 50, nbEquipes: 4,
    nbJoueursEquipes: 20, nbEquipesDeclarees: 2, nbEquipesManuelles: 2 } },
    _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, c && c.valeur === '50', 'S27 : total des deux sources');
  _ffrAssert(etat, /30 déclarés par les clubs invités/.test(c.origine) &&
                   /20 déclarés sur les équipes saisies/.test(c.origine),
    'S27 : origine détaille 30 (clubs) + 20 (équipes)');
}

/** B.3 : les éducateurs déclarés par équipe alimentent le total, origine détaillée. */
function testS27_educateursDepuisEquipes(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEducateurs: 5, nbEducateursEquipes: 5 } },
    _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre d\'éducateurs');
  _ffrAssert(etat, c && c.valeur === '5' && c.etat === 'calcule', 'S27 : B.3 = 5 éducateurs (équipes saisies)');
  _ffrAssert(etat, /équipes saisies à la main/.test(c.origine), 'S27 : origine B.3 cite les équipes saisies');
}

/** Déclaration PARTIELLE ⇒ signalée (total sous-estimé), jamais complétée au jugé. */
function testS27_declarationPartielleSignalee(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 12, nbEquipes: 3,
    nbJoueursEquipes: 12, nbEquipesDeclarees: 1, nbEquipesManuelles: 3 } },
    _cfgAutorisation([], {}), { formes: [] });
  var a = _autoChamp(d, 'Cohérence effectifs par équipe');
  _ffrAssert(etat, a && a.etat === 'avert' && /2 équipe\(s\)/.test(a.valeur),
    'S27 : déclaration partielle signalée (2 équipes sans effectif)');
}

/** Déclaration COMPLÈTE ⇒ aucun signalement. */
function testS27_declarationCompletePasDeSignalement(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 22, nbEquipes: 2,
    nbJoueursEquipes: 22, nbEquipesDeclarees: 2, nbEquipesManuelles: 2 } },
    _cfgAutorisation([], {}), { formes: [] });
  _ffrAssert(etat, !_autoChamp(d, 'Cohérence effectifs par équipe'), 'S27 : tout déclaré → pas de signalement');
}

/** Aucun effectif d'équipe ⇒ comportement historique intact (repli sur org_nb_participants). */
function testS27_sansEffectifsComportementHistorique(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbEquipes: 3 } },
    _cfgAutorisation([], { org_nb_participants: '240' }), { formes: [] });
  var c = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, c && c.valeur === '240' && c.etat === 'saisi', 'S27 : sans effectifs → repli saisi inchangé');
  _ffrAssert(etat, !_autoChamp(d, 'Cohérence effectifs par équipe'), 'S27 : aucune équipe déclarée → pas de signalement');
}

/* -------------------------------------------------------------------------- */
/*  SESSION 28 — une équipe retirée emporte ses effectifs                      */
/*  Un club déclare ses joueurs SUR SA FICHE, pas sur ses équipes : retirer    */
/*  une de ses équipes laissait « Nombre de participants » au chiffre déclaré, */
/*  donc SURESTIMÉ. effectifsClubAjustes est PUR. Enjeu : déduire exactement   */
/*  l'écart, sans jamais estimer — et le DIRE quand on ne peut pas déduire.    */
/* -------------------------------------------------------------------------- */

/** Fabrique une fiche de club invité pour les tests (réponse avec détail par équipe). */
function _clubS28(nom, detail, totJ, totE, nbMap, marque) {
  return { club_nom: nom, statut: 'Accepté',
           detail_effectifs: detail == null ? '' : JSON.stringify(detail),
           nb_joueurs_total: totJ == null ? '' : String(totJ),
           nb_educateurs_total: totE == null ? '' : String(totE),
           nb_equipes_par_categorie: nbMap == null ? '' : JSON.stringify(nbMap),
           selection_enregistree: marque === undefined ? '2026-08-03' : marque };
}

/** Équipe 'auto' d'un club (celles que crée la synchronisation). */
function _eqClub(nom, cat) {
  return { id_equipe: nom, nom_equipe: nom, categorie: cat, poule: '', source: 'auto' };
}

/** Le rang de l'entrée déclarée se lit dans le nom : « -2 » → 2ᵉ, nom nu → 1re. */
function testS28_indexDepuisLeNom(etat) {
  _ffrAssert(etat, indexEquipeDuClub('MASSY-2', 'MASSY') === 1, 'S28 : « MASSY-2 » → entrée n° 2');
  _ffrAssert(etat, indexEquipeDuClub('MASSY-1', 'MASSY') === 0, 'S28 : « MASSY-1 » → entrée n° 1');
  _ffrAssert(etat, indexEquipeDuClub('MASSY', 'MASSY') === 0, 'S28 : nom nu (héritage) → entrée n° 1');
  _ffrAssert(etat, indexEquipeDuClub('SURESNES', 'MASSY') === null, 'S28 : autre club → aucun rang');
  _ffrAssert(etat, indexEquipeDuClub('MASSY-0', 'MASSY') === null, 'S28 : « -0 » n\'est pas un rang');
}

/** CŒUR DU SUJET : une équipe retirée emporte ses joueurs ET ses éducateurs. */
function testS28_equipeRetireeDeduite(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 2 }, { j: 9, e: 2 }, { j: 10, e: 3 }] }, 27, 7, { U8: 3 });
  var r = effectifsClubAjustes(club, [_eqClub('MASSY-1', 'U8'), _eqClub('MASSY-2', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 17 && r.educateurs === 4, 'S28 : 3ᵉ équipe retirée → 27−10 joueurs, 7−3 éducateurs');
  _ffrAssert(etat, r.retraits.length === 1 && r.retraits[0].nb === 1 && r.retraits[0].categorie === 'U8',
    'S28 : le retrait est tracé (1 équipe U8)');
}

/** Le NOM désigne l'entrée : « -2 » manquante retire la 2ᵉ entrée, pas la dernière. */
function testS28_nomDesigneLentree(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 1 }, { j: 20, e: 5 }, { j: 10, e: 2 }] }, 38, 8, { U8: 3 });
  var r = effectifsClubAjustes(club, [_eqClub('MASSY-1', 'U8'), _eqClub('MASSY-3', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 18 && r.educateurs === 3, 'S28 : c\'est bien l\'entrée n° 2 (20 joueurs) qui part');
}

/** Aucune équipe retirée ⇒ le total déclaré est rigoureusement conservé (pas de re-somme). */
function testS28_sansRetraitTotalIdentique(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 2 }, { j: 9, e: 2 }] }, 17, 4, { U8: 2 });
  var r = effectifsClubAjustes(club, [_eqClub('MASSY-1', 'U8'), _eqClub('MASSY-2', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 17 && r.educateurs === 4 && !r.retraits.length,
    'S28 : rien retiré → totaux déclarés intacts');
}

/** PRUDENCE 1 : sélection jamais enregistrée ⇒ les équipes n'existent pas encore, on ne déduit rien. */
function testS28_selectionNonEnregistreeJamaisDeduite(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 2 }, { j: 9, e: 2 }] }, 17, 4, { U8: 2 }, '');
  var r = effectifsClubAjustes(club, [], []);
  _ffrAssert(etat, r.joueurs === 17 && r.educateurs === 4 && !r.retraits.length,
    'S28 : synchro pas faite → aucune déduction (leur absence ne prouve rien)');
  _ffrAssert(etat, !r.nonDeductible, 'S28 : synchro pas faite → pas de signalement non plus');
}

/** PRUDENCE 2 : réponse sans détail par équipe ⇒ rien de déduit (jamais de prorata), mais SIGNALÉ. */
function testS28_sansDetailSignaleJamaisDeduit(etat) {
  var club = _clubS28('MASSY', null, 45, 6, { U8: 3 });
  var r = effectifsClubAjustes(club, [_eqClub('MASSY-1', 'U8'), _eqClub('MASSY-2', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 45 && !r.retraits.length, 'S28 : sans détail → total déclaré conservé');
  _ffrAssert(etat, r.nonDeductible && r.nonDeductible.attendues === 3 && r.nonDeductible.restantes === 2,
    'S28 : sans détail → l\'écart est signalé (3 déclarées, 2 restantes)');
}

/** Détail illisible (JSON cassé) ⇒ chemin prudent, aucune exception. */
function testS28_detailIllisiblePrudent(etat) {
  var club = _clubS28('MASSY', null, 45, 6, { U8: 3 });
  club.detail_effectifs = '{ceci n\'est pas du JSON';
  var r = effectifsClubAjustes(club, [_eqClub('MASSY-1', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 45 && r.nonDeductible, 'S28 : JSON illisible → conservé + signalé, sans erreur');
}

/** Plus d'équipes que d'entrées déclarées (ajouts de l'admin) ⇒ jamais d'AJOUT d'effectifs. */
function testS28_plusDequipesJamaisAjoute(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 2 }, { j: 9, e: 2 }] }, 17, 4, { U8: 2 });
  var r = effectifsClubAjustes(club,
    [_eqClub('MASSY-1', 'U8'), _eqClub('MASSY-2', 'U8'), _eqClub('MASSY-3', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 17 && !r.retraits.length, 'S28 : équipe en plus → total inchangé, jamais gonflé');
}

/** Toutes les équipes retirées (catégorie désengagée) ⇒ le club ne pèse plus rien. */
function testS28_toutesRetireesTombeAZero(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 2 }, { j: 9, e: 2 }] }, 17, 4, { U8: 2 });
  var r = effectifsClubAjustes(club, [], []);
  _ffrAssert(etat, r.joueurs === 0 && r.educateurs === 0, 'S28 : plus aucune équipe → 0 joueur, 0 éducateur');
}

/** ANTI-COLLISION : l'équipe « PUC-2 » appartient au club « PUC-2 », jamais à « PUC ». */
function testS28_collisionNomsClubs(etat) {
  var club = _clubS28('PUC', { U8: [{ j: 10, e: 2 }, { j: 12, e: 2 }] }, 22, 4, { U8: 2 });
  var r = effectifsClubAjustes(club, [_eqClub('PUC-1', 'U8'), _eqClub('PUC-2', 'U8')], ['PUC-2']);
  _ffrAssert(etat, r.joueurs === 10 && r.educateurs === 2,
    'S28 : « PUC-2 » rendue au club homonyme → PUC perd bien sa 2ᵉ entrée');
}

/** Une catégorie entièrement conservée n'est pas touchée par le retrait d'une autre. */
function testS28_retraitParCategorie(etat) {
  var club = _clubS28('MASSY', { U8: [{ j: 8, e: 2 }, { j: 9, e: 2 }], U10: [{ j: 12, e: 3 }] },
    29, 7, { U8: 2, U10: 1 });
  var r = effectifsClubAjustes(club, [_eqClub('MASSY-1', 'U8'), _eqClub('MASSY-2', 'U8')], []);
  _ffrAssert(etat, r.joueurs === 17 && r.educateurs === 4, 'S28 : seule la catégorie U10 est déduite');
  _ffrAssert(etat, r.retraits.length === 1 && r.retraits[0].categorie === 'U10', 'S28 : le retrait cite la bonne catégorie');
}

/** A.4 : le total participants baisse ET l'origine dit de combien (chiffre vérifiable). */
function testS28_dossierParticipantsDeduits(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 17, nbEquipes: 2, nbClubsInvites: 1,
    retraitsClubs: [{ club: 'MASSY', categorie: 'U8', nb: 1, joueurs: 10, educateurs: 3 }] } },
    _cfgAutorisation([], {}), { formes: [] });
  var c = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, c && c.valeur === '17' && /− 10 joueur\(s\) de 1 équipe\(s\) retirée\(s\)/.test(c.origine),
    'S28 : l\'origine du total dit ce qui a été retiré');
  var det = _autoChamp(d, 'Effectifs des équipes retirées');
  _ffrAssert(etat, det && det.etat === 'calcule' && /MASSY/.test(det.valeur) && /−10 joueur/.test(det.valeur),
    'S28 : le détail du retrait est affiché (MASSY, −10 joueurs)');
  _ffrAssert(etat, /−3 éducateur/.test(det.valeur), 'S28 : le détail cite aussi les éducateurs');
}

/** Retrait CONSTATÉ mais non déductible ⇒ avertissement orange, total laissé tel quel. */
function testS28_dossierRetraitNonDeduitSignale(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 45, nbEquipes: 2, nbClubsInvites: 1,
    clubsNonDeductibles: [{ club: 'MASSY', attendues: 3, restantes: 2 }] } },
    _cfgAutorisation([], {}), { formes: [] });
  var a = _autoChamp(d, 'Retrait non déduit');
  _ffrAssert(etat, a && a.etat === 'avert' && /MASSY/.test(a.valeur) && /SURESTIMÉ/.test(a.valeur),
    'S28 : retrait non déductible → signalé comme surestimation');
  var c = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, c && c.valeur === '45', 'S28 : le total n\'est pas corrigé au jugé');
}

/** Aucun retrait ⇒ la feuille est exactement celle d'avant (aucun champ en plus). */
function testS28_dossierSansRetraitInchange(etat) {
  var d = assemblerDossierAutorisation({ participants: { nbParticipants: 45, nbEquipes: 3, nbClubsInvites: 2 } },
    _cfgAutorisation([], {}), { formes: [] });
  _ffrAssert(etat, !_autoChamp(d, 'Effectifs des équipes retirées'), 'S28 : sans retrait → pas de champ de détail');
  _ffrAssert(etat, !_autoChamp(d, 'Retrait non déduit'), 'S28 : sans retrait → pas d\'avertissement');
  var c = _autoChamp(d, 'Nombre de participants');
  _ffrAssert(etat, c && !/retirée/.test(c.origine), 'S28 : sans retrait → origine inchangée');
}

/* ==========================================================================================
 *  SESSION 6 (industrialisation) — PLAFONDS DE L'ÉCRITURE PUBLIQUE (R-014, audit sécurité)
 * ==========================================================================================
 *  `mesureSponsors` est la seule écriture sans clé de l'application. Ces tests vérifient le
 *  CŒUR PUR du plafonnement (`mesureMotifRefus`) et le compteur de fenêtre
 *  (`mesureCompteurFenetre`, testé avec un cache factice injecté).
 *
 *  Ce qu'ils NE prouvent PAS : que le service tienne face à un envoi massif réel. Cela ne se
 *  vérifie qu'en conditions réelles, et reste NON VÉRIFIÉ.
 * ========================================================================================== */

/** Cache factice injectable : même interface que CacheService (get / put), en mémoire. */
function _mesureCacheFactice() {
  return {
    magasin: {},
    get: function (cle) { return this.magasin.hasOwnProperty(cle) ? this.magasin[cle] : null; },
    put: function (cle, valeur) { this.magasin[cle] = valeur; }
  };
}

/** Cache en panne : lève à chaque appel. Le code ne doit jamais échouer pour autant. */
function _mesureCacheCasse() {
  return {
    get: function () { throw new Error('cache indisponible'); },
    put: function () { throw new Error('cache indisponible'); }
  };
}

/** Sous tous les plafonds ⇒ on écrit. */
function testS6sec_sousLesPlafondsOnEcrit(etat) {
  _ffrAssert(etat, mesureMotifRefus(10, 10, 1) === '',
    'S6-séc : relevé ordinaire → accepté');
}

/** Le DERNIER relevé autorisé passe encore ; le suivant est refusé (bornes exactes). */
function testS6sec_bornesExactes(etat) {
  _ffrAssert(etat, mesureMotifRefus(MESURE_MAX_LIGNES, 1, 1) === '',
    'S6-séc : pile au plafond de lignes → encore accepté');
  _ffrAssert(etat, mesureMotifRefus(MESURE_MAX_LIGNES + 1, 1, 1) === 'plafond_lignes',
    'S6-séc : une ligne au-dessus du plafond → refusé');
  _ffrAssert(etat, mesureMotifRefus(1, MESURE_MAX_FENETRE, 1) === '',
    'S6-séc : pile au plafond de débit global → encore accepté');
  _ffrAssert(etat, mesureMotifRefus(1, MESURE_MAX_FENETRE + 1, 1) === 'debit_global',
    'S6-séc : un relevé au-dessus du débit global → refusé');
  _ffrAssert(etat, mesureMotifRefus(1, 1, MESURE_MAX_APPAREIL) === '',
    'S6-séc : pile au plafond par appareil → encore accepté');
  _ffrAssert(etat, mesureMotifRefus(1, 1, MESURE_MAX_APPAREIL + 1) === 'debit_appareil',
    'S6-séc : un relevé au-dessus du plafond par appareil → refusé');
}

/** Le plafond DUR (volume) prime sur les plafonds de débit : c'est le seul incontournable. */
function testS6sec_leVolumePrimeSurLeDebit(etat) {
  _ffrAssert(etat,
    mesureMotifRefus(MESURE_MAX_LIGNES + 1, MESURE_MAX_FENETRE + 1, MESURE_MAX_APPAREIL + 1) === 'plafond_lignes',
    'S6-séc : tout dépassé → c\'est le plafond de lignes qui est annoncé');
}

/** Compteurs inconnus (0 = cache indisponible) ⇒ JAMAIS de refus : une panne de cache ne doit
 *  pas éteindre la mesure des partenaires. */
function testS6sec_compteurInconnuNeRefuseJamais(etat) {
  _ffrAssert(etat, mesureMotifRefus(0, 0, 0) === '',
    'S6-séc : compteurs inconnus → le relevé passe (pas de refus par ignorance)');
}

/** Deux relevés dans la MÊME fenêtre s'additionnent. */
function testS6sec_compteurSAdditionneDansLaFenetre(etat) {
  var cache = _mesureCacheFactice();
  var t = 1000000000000; // instant arbitraire, injecté (aucune dépendance à l'horloge)
  var a = mesureCompteurFenetre(cache, 'test_', 3600, t);
  var b = mesureCompteurFenetre(cache, 'test_', 3600, t + 60000); // +1 min, même fenêtre
  _ffrAssert(etat, a === 1 && b === 2, 'S6-séc : deux relevés dans la même heure → 1 puis 2');
}

/** La fenêtre SUIVANTE repart de zéro : un plafond atteint se relâche tout seul.
 *  C'est le point qui évite de bloquer indéfiniment des spectateurs légitimes. */
function testS6sec_fenetreSuivanteRepartDeZero(etat) {
  var cache = _mesureCacheFactice();
  var t = 1000000000000;
  mesureCompteurFenetre(cache, 'test_', 3600, t);
  mesureCompteurFenetre(cache, 'test_', 3600, t);
  var apres = mesureCompteurFenetre(cache, 'test_', 3600, t + 3600 * 1000); // +1 h
  _ffrAssert(etat, apres === 1, 'S6-séc : nouvelle fenêtre → le compteur repart à 1');
}

/** Deux appareils différents ont des compteurs indépendants. */
function testS6sec_appareilsIndependants(etat) {
  var cache = _mesureCacheFactice();
  var t = 1000000000000;
  mesureCompteurFenetre(cache, 'app_AAAA_', 3600, t);
  var autre = mesureCompteurFenetre(cache, 'app_BBBB_', 3600, t);
  _ffrAssert(etat, autre === 1, 'S6-séc : un autre appareil ne consomme pas le quota du premier');
}

/** Cache en panne ⇒ 0 (inconnu), et surtout AUCUNE exception qui remonterait au visiteur. */
function testS6sec_cacheEnPanneNeCassePas(etat) {
  var n = mesureCompteurFenetre(_mesureCacheCasse(), 'test_', 3600, 1000000000000);
  _ffrAssert(etat, n === 0, 'S6-séc : cache en panne → compteur inconnu, aucune erreur levée');
}

/** Un identifiant d'appareil invalide est refusé avant tout le reste (règle inchangée). */
function testS6sec_identifiantInvalideRefuse(etat) {
  _ffrAssert(etat, mesureIdentifiant('ab') === '', 'S6-séc : identifiant trop court → refusé');
  _ffrAssert(etat, mesureIdentifiant('<script>') === '', 'S6-séc : identifiant non alphanumérique → refusé');
  _ffrAssert(etat, mesureIdentifiant('a1b2-c3_d4') === 'a1b2-c3_d4', 'S6-séc : identifiant normal → accepté');
}

/* ============================================================================
 * INDUSTRIALISATION — CHANTIER C-011 : LE BARÈME ET LE DÉPARTAGE (R-041)
 * ----------------------------------------------------------------------------
 * POURQUOI CES TESTS EXISTENT
 *   `enregistrerResultat` et `comparerClassement` décident du vainqueur d'un
 *   tournoi, et n'étaient vérifiés par AUCUN test — alors que D-014 va modifier
 *   le départage (ajout de la confrontation directe puis de l'ordre
 *   alphabétique). Écrits APRÈS cette modification, ces tests auraient gravé le
 *   nouveau comportement sans avoir jamais vu l'ancien : ils ne prouveraient
 *   plus qu'on n'a rien cassé. D'où leur écriture AVANT (décision D-025).
 *
 * CE QU'ILS COUVRENT — et ce qu'ils NE couvrent pas
 *   Ils portent sur les DEUX RÈGLES pures : le barème (3/2/1) et l'ordre de
 *   départage (points → différence → points marqués). Ils ne couvrent PAS la
 *   chaîne complète du classement : `calculerClassement` lit le classeur, il est
 *   hors de portée du harnais (R-046).
 *
 * NOMMAGE : par SUJET (`testClassement_…`) et non par numéro de session. R-076
 *   a montré que 27 préfixes sur 31 sont des numéros de session, ce qui ne dit
 *   pas de quoi le test parle. On n'aggrave pas le compte.
 * ========================================================================== */

/** Statistiques neuves d'une équipe — même forme que celles de `calculerClassement`. */
function _statsC011(nom) {
  return { id_equipe: nom, nom_equipe: nom,
           j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0, pts: 0 };
}

/** Équipe dont on impose directement points / différence / points marqués. */
function _equipeC011(nom, pts, diff, bp) {
  var s = _statsC011(nom); s.pts = pts; s.diff = diff; s.bp = bp; return s;
}

/** LE BARÈME : victoire 3, nul 2, défaite 1 — et les compteurs qui vont avec. */
function testClassement_baremeVictoireNulDefaite(etat) {
  var gagnant = _statsC011('A'); enregistrerResultat(gagnant, 17, 5);
  _ffrAssert(etat, gagnant.pts === 3, 'C-011 : une victoire vaut 3 points');
  _ffrAssert(etat, gagnant.v === 1 && gagnant.n === 0 && gagnant.d === 0,
    'C-011 : une victoire incrémente V, et elle seule');

  var perdant = _statsC011('B'); enregistrerResultat(perdant, 5, 17);
  _ffrAssert(etat, perdant.pts === 1, 'C-011 : une défaite vaut 1 point');
  _ffrAssert(etat, perdant.d === 1 && perdant.v === 0 && perdant.n === 0,
    'C-011 : une défaite incrémente D, et elle seule');

  var nul = _statsC011('C'); enregistrerResultat(nul, 12, 12);
  _ffrAssert(etat, nul.pts === 2, 'C-011 : un match nul vaut 2 points');
  _ffrAssert(etat, nul.n === 1 && nul.v === 0 && nul.d === 0,
    'C-011 : un nul incrémente N, et lui seul');

  _ffrAssert(etat, gagnant.j === 1 && perdant.j === 1 && nul.j === 1,
    'C-011 : chaque résultat compte exactement un match joué');

  // Un score 0-0 est un nul, pas une double défaite : le piège classique du `>` mal posé.
  var vierge = _statsC011('D'); enregistrerResultat(vierge, 0, 0);
  _ffrAssert(etat, vierge.pts === 2 && vierge.n === 1,
    'C-011 : 0-0 est un match nul (2 points), pas une défaite');
}

/** LE CUMUL : marqués, encaissés et différence s'additionnent sur plusieurs matchs. */
function testClassement_cumulSurPlusieursMatchs(etat) {
  var s = _statsC011('A');
  enregistrerResultat(s, 20, 5);   // +15
  enregistrerResultat(s, 7, 7);    //   0
  enregistrerResultat(s, 3, 15);   // −12

  _ffrAssert(etat, s.j === 3, 'C-011 : trois matchs joués sont comptés');
  _ffrAssert(etat, s.bp === 30, 'C-011 : points marqués cumulés = 20+7+3 = 30');
  _ffrAssert(etat, s.bc === 27, 'C-011 : points encaissés cumulés = 5+7+15 = 27');
  _ffrAssert(etat, s.diff === 3, 'C-011 : la différence est marqués − encaissés = 3');
  _ffrAssert(etat, s.pts === 6, 'C-011 : 1 victoire + 1 nul + 1 défaite = 3+2+1 = 6 points');
  _ffrAssert(etat, s.v === 1 && s.n === 1 && s.d === 1,
    'C-011 : le détail V/N/D suit le cumul');

  // La différence n'est jamais recalculée à part : elle doit rester cohérente à chaque étape.
  var t = _statsC011('B');
  enregistrerResultat(t, 5, 12);
  _ffrAssert(etat, t.diff === -7, 'C-011 : une différence négative est conservée telle quelle');
}

/** DÉPARTAGE, 1er critère : les points d'abord, quoi qu'il arrive. */
function testClassement_departageParLesPoints(etat) {
  var fort   = _equipeC011('Fort', 9, -50, 3);   // peu de points marqués, différence catastrophique
  var faible = _equipeC011('Faible', 6, 200, 400); // différence énorme, mais moins de points

  _ffrAssert(etat, comparerClassement(fort, faible) < 0,
    'C-011 : plus de points passe devant, même avec une différence bien pire');
  _ffrAssert(etat, comparerClassement(faible, fort) > 0,
    'C-011 : la comparaison est symétrique sur les points');
}

/** DÉPARTAGE, 2e critère : à égalité de points, la DIFFÉRENCE tranche.
 *  ⚠️ Ce critère n'était mis à l'épreuve par AUCUNE des 589 vérifications existantes. */
function testClassement_departageParLaDifference(etat) {
  var meilleure = _equipeC011('Meilleure', 7, 12, 20);
  var moindre   = _equipeC011('Moindre',   7, 3,  80); // beaucoup plus de points marqués

  _ffrAssert(etat, comparerClassement(meilleure, moindre) < 0,
    'C-011 : à égalité de points, la meilleure différence passe devant');
  _ffrAssert(etat, comparerClassement(moindre, meilleure) > 0,
    'C-011 : la comparaison est symétrique sur la différence');
  _ffrAssert(etat, comparerClassement(meilleure, moindre) < 0 &&
                   moindre.bp > meilleure.bp,
    'C-011 : la différence prime sur les points marqués (elle passe en 2e, eux en 3e)');

  // Différences négatives : −2 doit passer devant −9.
  var moinsPire = _equipeC011('MoinsPire', 4, -2, 10);
  var plusPire  = _equipeC011('PlusPire',  4, -9, 10);
  _ffrAssert(etat, comparerClassement(moinsPire, plusPire) < 0,
    'C-011 : entre deux différences négatives, la moins mauvaise passe devant');
}

/** DÉPARTAGE, 3e critère et ordre stable : à égalité de points ET de différence,
 *  ce sont les POINTS MARQUÉS. Et si tout est égal, l'ordre ne bouge pas.
 *  ⚠️ Ce critère non plus n'était mis à l'épreuve par aucune vérification existante. */
function testClassement_departageParLesPointsMarquesEtOrdreStable(etat) {
  var offensive = _equipeC011('Offensive', 7, 5, 60);
  var prudente  = _equipeC011('Prudente',  7, 5, 22);

  _ffrAssert(etat, comparerClassement(offensive, prudente) < 0,
    'C-011 : à égalité de points ET de différence, le plus de points marqués passe devant');
  _ffrAssert(etat, comparerClassement(prudente, offensive) > 0,
    'C-011 : la comparaison est symétrique sur les points marqués');

  // Strictement égales : la comparaison doit renvoyer 0 (ordre inchangé, pas de départage inventé).
  var jumelleA = _equipeC011('JumelleA', 7, 5, 22);
  var jumelleB = _equipeC011('JumelleB', 7, 5, 22);
  _ffrAssert(etat, comparerClassement(jumelleA, jumelleB) === 0,
    'C-011 : deux équipes strictement égales ne sont pas départagées (0)');

  // Le tri complet, dans l'ordre attendu : c'est ce que voit l'organisateur.
  var poule = [prudente, jumelleA, offensive, _equipeC011('Tete', 9, 0, 0)];
  var ordre = poule.slice().sort(comparerClassement).map(function (e) { return e.nom_equipe; });
  _ffrAssert(etat, ordre[0] === 'Tete',
    'C-011 : tri complet — les points passent en premier');
  _ffrAssert(etat, ordre[1] === 'Offensive',
    'C-011 : tri complet — puis les points marqués départagent');
  _ffrAssert(etat, ordre.length === 4,
    'C-011 : le tri ne perd aucune équipe');
}

/* ==========================================================================
   CHANTIER C-012 — étape 1 : le cœur pur `litSaisieScore` (problème R-042)
   ==========================================================================
   Ce que ces 5 tests couvrent : la LECTURE de ce que le bénévole a envoyé —
   l'identifiant, les scores simples, et le score détaillé (tir au but).

   Ce qu'ils NE couvrent PAS, et il faut le dire : les six garde-fous de la
   saisie (Coupe en attente, score déjà validé, départage, cascade) sont
   encore DANS `enregistrerScore`, qui lit le classeur. Ils viendront aux
   étapes 2 et 3 de C-012. Voir docs/industrialisation/C-012-SPECIFICATION.md.

   NOMMAGE : par SUJET (`testSaisieScore_…`), comme C-011 — R-076 a montré
   que 27 préfixes sur 31 sont des numéros de session, ce qui ne dit pas de
   quoi le test parle. On n'aggrave pas le compte.

   ⚠️ Ces tests FIGENT le comportement existant, ils ne le jugent pas. Le
   détail partiel (T-5) est conservé tel quel par décision D-C012-3.
   -------------------------------------------------------------------------- */

/** T-1 — identifiant vide : refus explicite, et AVANT tout le reste (l'ordre porte du sens). */
function testSaisieScore_identifiantManquant(etat) {
  var vide = litSaisieScore({ score_A: '5', score_B: '3' });
  _ffrAssert(etat, vide.error === 'Identifiant de match manquant.',
    'T-1 : id_match absent ⇒ « Identifiant de match manquant. »');
  _ffrAssert(etat, litSaisieScore({ id_match: '   ', score_A: '5' }).error === 'Identifiant de match manquant.',
    'T-1 : id_match fait d\'espaces ⇒ même refus (il est nettoyé avant d\'être jugé)');
  // L'identifiant est jugé AVANT les scores : un id vide + un score invalide donne le refus de l'id.
  _ffrAssert(etat, litSaisieScore({ id_match: '', score_A: 'abc' }).error === 'Identifiant de match manquant.',
    'T-1 : id vide + score invalide ⇒ c\'est l\'identifiant qui est signalé (ordre préservé)');
  _ffrAssert(etat, litSaisieScore({ id_match: '  M-12  ', score_A: '0', score_B: '0' }).id === 'M-12',
    'T-1 : un identifiant valide est nettoyé de ses espaces');
}

/** T-2 — score simple invalide : refus, JAMAIS un score fabriqué. */
function testSaisieScore_scoreSimpleInvalide(etat) {
  var base = { id_match: 'M-1' };
  var texte = litSaisieScore({ id_match: 'M-1', score_A: 'abc', score_B: '3' });
  _ffrAssert(etat, texte.error === 'Score A invalide (entier ≥ 0 attendu).',
    'T-2 : score_A = « abc » ⇒ refus, message exact');
  _ffrAssert(etat, texte.score_A === undefined && texte.id === undefined,
    'T-2 : un refus ne transporte QUE le message — aucun score, aucun identifiant');

  _ffrAssert(etat, litSaisieScore({ id_match: 'M-1', score_A: '-1', score_B: '3' }).error
      === 'Score A invalide (entier ≥ 0 attendu).', 'T-2 : score négatif ⇒ refus');
  _ffrAssert(etat, litSaisieScore({ id_match: 'M-1', score_A: '2.5', score_B: '3' }).error
      === 'Score A invalide (entier ≥ 0 attendu).', 'T-2 : score décimal ⇒ refus');
  _ffrAssert(etat, litSaisieScore({ id_match: 'M-1', score_A: '', score_B: '3' }).error
      === 'Score A invalide (entier ≥ 0 attendu).', 'T-2 : score vide ⇒ refus');
  _ffrAssert(etat, litSaisieScore(base).error === 'Score A invalide (entier ≥ 0 attendu).',
    'T-2 : aucun score envoyé ⇒ refus (jamais un 0 supposé)');

  // L'équipe B est jugée APRÈS l'équipe A : A valide + B invalide ⇒ c'est B qui est signalée.
  _ffrAssert(etat, litSaisieScore({ id_match: 'M-1', score_A: '12', score_B: 'x' }).error
      === 'Score B invalide (entier ≥ 0 attendu).', 'T-2 : score_B seul invalide ⇒ message B');

  // Détail invalide : refusé AVANT les scores simples, avec le message de litDetailEquipe.
  var det = litSaisieScore({ id_match: 'M-1', essais_A: 'x', score_A: '12', score_B: '7' });
  _ffrAssert(etat, typeof det.error === 'string' && det.error.indexOf('Détail du score invalide') === 0,
    'T-2 : détail invalide ⇒ refus du détail, et non des scores simples');
}

/** T-3 — mode simple : les scores saisis sont repris TELS QUELS, aucun détail. */
function testSaisieScore_modeSimpleReprisTelQuel(etat) {
  var r = litSaisieScore({ id_match: 'M-7', score_A: '12', score_B: '7' });
  _ffrAssert(etat, r.error === undefined, 'T-3 : 12 / 7 est accepté');
  _ffrAssert(etat, r.score_A === 12 && r.score_B === 7,
    'T-3 : les scores sont repris tels quels, et convertis en nombres');
  _ffrAssert(etat, r.modeDetail === false, 'T-3 : aucun champ de détail ⇒ mode simple');
  _ffrAssert(etat, r.detA === null && r.detB === null,
    'T-3 : en mode simple, detA et detB valent null (rien à écrire dans les 8 colonnes)');
  _ffrAssert(etat, r.id === 'M-7', 'T-3 : l\'identifiant est renvoyé');

  var zero = litSaisieScore({ id_match: 'M-8', score_A: '0', score_B: '0' });
  _ffrAssert(etat, zero.error === undefined && zero.score_A === 0 && zero.score_B === 0,
    'T-3 : 0 / 0 est un score valide (et non « vide »)');
  var nombres = litSaisieScore({ id_match: 'M-9', score_A: 5, score_B: 3 });
  _ffrAssert(etat, nombres.score_A === 5 && nombres.score_B === 3,
    'T-3 : des nombres (et non du texte) sont acceptés à l\'identique');
}

/** T-4 — mode détail : le score est CALCULÉ, et score_A/score_B envoyés sont IGNORÉS. */
function testSaisieScore_modeDetailCalculeEtIgnoreLeScoreEnvoye(etat) {
  var r = litSaisieScore({ id_match: 'M-3', essais_A: '3', transfo_A: '2', pen_A: '1',
                           essais_B: '1', score_A: '999', score_B: '999' });
  _ffrAssert(etat, r.error === undefined, 'T-4 : un détail complet est accepté');
  _ffrAssert(etat, r.modeDetail === true, 'T-4 : la présence d\'un champ de détail bascule en mode détaillé');
  _ffrAssert(etat, r.score_A === (3 * 5 + 2 * 2 + 1 * 3),
    'T-4 : 3 essais + 2 transfo + 1 pénalité = 22 pts, CALCULÉ');
  _ffrAssert(etat, r.score_A !== 999 && r.score_B !== 999,
    'T-4 : ⭐ le score_A/score_B envoyé est IGNORÉ — le détail fait foi');
  _ffrAssert(etat, r.score_B === 5, 'T-4 : 1 essai côté B = 5 pts');
  _ffrAssert(etat, r.detA.essais === 3 && r.detA.transfo === 2 && r.detA.pen === 1 && r.detA.drop === 0,
    'T-4 : les 4 compteurs de A sont renvoyés (les absents valent 0)');
  _ffrAssert(etat, r.detB.essais === 1, 'T-4 : les compteurs de B sont renvoyés');

  var drop = litSaisieScore({ id_match: 'M-4', drop_A: '2', essais_B: '0' });
  _ffrAssert(etat, drop.modeDetail === true && drop.score_A === 6,
    'T-4 : 2 drops = 6 pts (un seul champ suffit à basculer en mode détaillé)');
}

/** T-5 — détail d'un seul côté : l'autre équipe vaut ZÉRO. Comportement CONSERVÉ (D-C012-3). */
function testSaisieScore_detailUnSeulCoteLautreVautZero(etat) {
  var r = litSaisieScore({ id_match: 'M-5', essais_A: '4' });
  _ffrAssert(etat, r.error === undefined, 'T-5 : un détail d\'un seul côté est accepté (pas de refus)');
  _ffrAssert(etat, r.modeDetail === true, 'T-5 : mode détaillé malgré l\'absence de l\'autre côté');
  _ffrAssert(etat, r.score_A === 20, 'T-5 : 4 essais côté A = 20 pts');
  _ffrAssert(etat, r.score_B === 0, 'T-5 : ⚠️ l\'équipe B, muette, vaut 0 — comportement conservé (D-C012-3)');
  _ffrAssert(etat, r.detB !== null && r.detB.essais === 0 && r.detB.transfo === 0
      && r.detB.pen === 0 && r.detB.drop === 0 && r.detB.points === 0,
    'T-5 : detB est un objet à zéros (et non null) — les 8 colonnes seront donc écrites');
  var inverse = litSaisieScore({ id_match: 'M-6', pen_B: '1' });
  _ffrAssert(etat, inverse.score_A === 0 && inverse.score_B === 3 && inverse.detA.points === 0,
    'T-5 : symétrique — détail côté B seul, A vaut 0');
}

/* --------------------------------------------------------------------------
   C-012 — étape 2 : le prédicat pur `cascadeAVerifier` (T-14)

   Ce que ce test protège : la LECTURE PARESSEUSE du match suivant. Cette
   lecture balaye tout l'onglet Matchs, PENDANT que le verrou d'écriture est
   tenu — donc pendant que les autres marqueurs attendent. Si l'une des quatre
   conditions cessait d'être exigée, la lecture deviendrait systématique et
   chaque score saisi de la journée ralentirait (risque N-3 de la conception).

   Portée assumée : ce test vérifie la DÉCISION (faut-il lire ?), pas le fait
   que `lireMatchParId` soit réellement épargnée — cela demande un classeur, et
   c'est établi par la preuve différentielle du chantier, hors harnais.
   -------------------------------------------------------------------------- */

/** T-14 — les 4 conditions de la cascade, une à une : il en manque une ⇒ aucune lecture. */
function testSaisieScore_cascadeAVerifierQuatreConditions(etat) {
  // Le cas où la lecture EST justifiée : les quatre conditions réunies.
  var coupe = { sous_tableau: 'COUPE', statut: 'terminé', match_suivant: 'M-9' };
  _ffrAssert(etat, cascadeAVerifier(coupe, { modification: true }) === true,
    'T-14 : Coupe + terminé + correction + match suivant ⇒ il faut lire le match suivant');

  // 1) pas un match de Coupe → jamais de cascade (une poule ne propage rien).
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: '', statut: 'terminé', match_suivant: 'M-9' },
    { modification: true }) === false, 'T-14 : hors Coupe ⇒ aucune lecture');
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: 'PLATEAU', statut: 'terminé', match_suivant: 'M-9' },
    { modification: true }) === false, 'T-14 : Plateau ⇒ aucune lecture');

  // 2) match pas encore terminé → rien n'a pu être propagé.
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: 'COUPE', statut: 'à venir', match_suivant: 'M-9' },
    { modification: true }) === false, 'T-14 : match pas terminé ⇒ aucune lecture');

  // 3) ce n'est pas une correction explicite → le garde-fou ② a déjà refusé plus haut.
  _ffrAssert(etat, cascadeAVerifier(coupe, {}) === false,
    'T-14 : `modification` absent ⇒ aucune lecture');
  _ffrAssert(etat, cascadeAVerifier(coupe, { modification: false }) === false,
    'T-14 : modification = false ⇒ aucune lecture');
  _ffrAssert(etat, cascadeAVerifier(coupe, { modification: 'true' }) === false,
    'T-14 : modification = « true » (texte) ⇒ aucune lecture — l\'égalité est STRICTE');

  // 4) aucun match suivant → il n'y a rien à aller lire.
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: 'COUPE', statut: 'terminé', match_suivant: '' },
    { modification: true }) === false, 'T-14 : pas de match suivant ⇒ aucune lecture');
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: 'COUPE', statut: 'terminé' },
    { modification: true }) === false, 'T-14 : champ match_suivant absent ⇒ aucune lecture');

  // Pièges déjà payés par ce projet : le « é » décomposé (NFD) et la casse du sous-tableau.
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: 'COUPE', statut: 'terminé', match_suivant: 'M-9' },
    { modification: true }) === true, 'T-14 : statut « terminé » en é DÉCOMPOSÉ ⇒ reconnu terminé');
  _ffrAssert(etat, cascadeAVerifier({ sous_tableau: 'coupe', statut: 'terminé', match_suivant: 'M-9' },
    { modification: true }) === true, 'T-14 : sous_tableau en minuscules ⇒ reconnu Coupe');

  // La réponse est un VRAI booléen, jamais l'identifiant du match suivant.
  _ffrAssert(etat, cascadeAVerifier(coupe, { modification: true }) !== 'M-9',
    'T-14 : la réponse est un booléen, pas l\'identifiant du match suivant');
}

/* ==========================================================================
   CHANTIER C-012 — étape 3 : le cœur pur `deciderEnregistrementScore`
   ==========================================================================
   ⭐ C'est CE bloc qui referme R-042 : les six garde-fous du geste le plus
   répété de la journée sont enfin exécutés par le harnais.

   Ce que ces tests exercent : la DÉCISION (accepter / refuser, et pourquoi),
   et le PLAN d'écriture qu'elle produit. Ils n'écrivent rien : aucun classeur
   n'est nécessaire, tout est fabriqué à la main.

   Ce qu'ils NE couvrent PAS, et il faut le dire : l'écriture réelle dans le
   Sheet, l'archivage, et l'EXÉCUTION de la propagation — laissée hors du cœur
   par la décision D-C012-1 (option A). Seule la vérification manuelle V-10 la
   couvre. Voir docs/industrialisation/C-012-SPECIFICATION.md §3.5.
   -------------------------------------------------------------------------- */

/** Un match de poule ordinaire, prêt à recevoir un score. */
function _dsMatch(sur) {
  var m = { id_match: 'M-1', categorie: 'U12', poule: 'A', phase: 'POULE',
            equipe_A: 'E1', equipe_B: 'E2', score_A: '', score_B: '', statut: 'à venir',
            sous_tableau: '', tour: '', match_suivant: '', place_suivant: '', vainqueur: '' };
  for (var k in (sur || {})) { if (Object.prototype.hasOwnProperty.call(sur, k)) m[k] = sur[k]; }
  return m;
}
/** La saisie ACCEPTÉE que litSaisieScore aurait produite (mode simple par défaut). */
function _dsSaisie(sa, sb, sur) {
  var s = { id: 'M-1', score_A: sa, score_B: sb, modeDetail: false, detA: null, detB: null };
  for (var k in (sur || {})) { if (Object.prototype.hasOwnProperty.call(sur, k)) s[k] = sur[k]; }
  return s;
}

/** T-6 — match introuvable : refus, et AUCUN plan d'écriture. */
function testDecisionScore_matchIntrouvable(etat) {
  var r = deciderEnregistrementScore(null, _dsSaisie(3, 1), {});
  _ffrAssert(etat, r.error === 'Match introuvable : M-1', 'T-6 : m = null ⇒ « Match introuvable : M-1 »');
  _ffrAssert(etat, r.ok === undefined && r.ecriture === undefined,
    'T-6 : aucun plan d\'écriture — rien ne sera écrit');
  _ffrAssert(etat, r.besoin_suivant === undefined, 'T-6 : et aucune lecture réclamée');
}

/** T-7 — Coupe dont une équipe n'est pas connue : refus + drapeau `en_attente`. */
function testDecisionScore_coupeEnAttente(etat) {
  var m = _dsMatch({ sous_tableau: 'COUPE', tour: 'FINALE', equipe_B: '' });
  var r = deciderEnregistrementScore(m, _dsSaisie(3, 1), {});
  _ffrAssert(etat, r.en_attente === true, 'T-7 : équipe B inconnue ⇒ drapeau en_attente');
  _ffrAssert(etat, typeof r.error === 'string' && r.error.indexOf('en attente') > 0,
    'T-7 : le message explique que les équipes ne sont pas connues');
  _ffrAssert(etat, r.ok === undefined, 'T-7 : aucun plan d\'écriture');
  // Une poule à qui il manque une équipe n'est PAS concernée : le garde-fou ne vaut qu'en Coupe.
  var poule = deciderEnregistrementScore(_dsMatch({ equipe_B: '' }), _dsSaisie(3, 1), {});
  _ffrAssert(etat, poule.ok === true, 'T-7 : hors Coupe, une équipe vide ne bloque pas (inchangé)');
}

/** T-8 — score déjà validé : refus + drapeau `deja_valide`, sauf correction explicite. */
function testDecisionScore_scoreDejaValide(etat) {
  var m = _dsMatch({ statut: 'terminé', score_A: 10, score_B: 3 });
  var r = deciderEnregistrementScore(m, _dsSaisie(5, 5), {});
  _ffrAssert(etat, r.deja_valide === true, 'T-8 : `modification` absent ⇒ drapeau deja_valide');
  _ffrAssert(etat, r.error.indexOf('Corriger') > 0, 'T-8 : le message renvoie vers « Corriger »');
  _ffrAssert(etat, deciderEnregistrementScore(m, _dsSaisie(5, 5), { modification: false }).deja_valide === true,
    'T-8 : modification = false ⇒ refus aussi');
  _ffrAssert(etat, deciderEnregistrementScore(m, _dsSaisie(5, 5), { modification: 'true' }).deja_valide === true,
    'T-8 : modification = « true » (texte) ⇒ refus — l\'égalité est STRICTE');
  var corr = deciderEnregistrementScore(m, _dsSaisie(7, 2), { modification: true });
  _ffrAssert(etat, corr.ok === true && corr.ecriture.score_A === 7,
    'T-8 : modification = true ⇒ la correction est acceptée');
}

/** T-9 — ⚠️ statut « terminé » en é DÉCOMPOSÉ (NFD), tel que le Sheet le renvoie parfois. */
function testDecisionScore_statutNfdRefuseQuandMeme(etat) {
  var m = _dsMatch({ statut: 'terminé', score_A: 4, score_B: 2 }); // é décomposé
  var r = deciderEnregistrementScore(m, _dsSaisie(9, 1), {});
  _ffrAssert(etat, r.deja_valide === true,
    'T-9 : statut en é DÉCOMPOSÉ ⇒ reconnu terminé, le refus fonctionne quand même');
}

/** T-10 — Coupe, égalité au score : un vainqueur est OBLIGATOIRE. */
function testDecisionScore_egaliteExigeUnVainqueur(etat) {
  var m = _dsMatch({ sous_tableau: 'COUPE', tour: 'DEMI_FINALE' });
  var r = deciderEnregistrementScore(m, _dsSaisie(10, 10), {});
  _ffrAssert(etat, r.departage_requis === true, 'T-10 : 10-10 en Coupe sans vainqueur ⇒ departage_requis');
  _ffrAssert(etat, r.equipe_A === 'E1' && r.equipe_B === 'E2',
    'T-10 : les deux équipes sont renvoyées, pour que l\'écran propose le choix');
  _ffrAssert(etat, r.ok === undefined, 'T-10 : rien n\'est écrit tant que le vainqueur manque');
  var avec = deciderEnregistrementScore(m, _dsSaisie(10, 10), { vainqueur: 'E2' });
  _ffrAssert(etat, avec.ok === true && avec.vainqueur === 'E2',
    'T-10 : vainqueur désigné ⇒ accepté, et c\'est lui qui sera écrit');
  // En POULE, une égalité est un match nul parfaitement normal.
  _ffrAssert(etat, deciderEnregistrementScore(_dsMatch({}), _dsSaisie(10, 10), {}).ok === true,
    'T-10 : hors Coupe, 10-10 est un nul accepté sans vainqueur');
}

/** T-11 — le vainqueur désigné doit être l'une des deux équipes du match. */
function testDecisionScore_vainqueurEtranger(etat) {
  var m = _dsMatch({ sous_tableau: 'COUPE', tour: 'FINALE' });
  var r = deciderEnregistrementScore(m, _dsSaisie(5, 5), { vainqueur: 'E9' });
  _ffrAssert(etat, r.error === 'Le vainqueur désigné ne correspond à aucune des deux équipes.',
    'T-11 : vainqueur étranger ⇒ refus, message exact');
  _ffrAssert(etat, r.departage_requis === undefined,
    'T-11 : ce refus n\'a PAS de drapeau — l\'écran ne doit pas reproposer le même choix');
}

/** T-12 — ⭐ quand le score départage, c'est LUI qui impose le vainqueur. */
function testDecisionScore_leScoreImposeLeVainqueur(etat) {
  var m = _dsMatch({ sous_tableau: 'COUPE', tour: 'FINALE' });
  var r = deciderEnregistrementScore(m, _dsSaisie(14, 7), { vainqueur: 'E2' });
  _ffrAssert(etat, r.ok === true, 'T-12 : 14-7 est accepté');
  _ffrAssert(etat, r.vainqueur === 'E1',
    'T-12 : ⭐ le score l\'emporte sur le vainqueur envoyé — E1 gagne 14-7, pas E2');
  var inverse = deciderEnregistrementScore(m, _dsSaisie(7, 14), { vainqueur: 'E1' });
  _ffrAssert(etat, inverse.vainqueur === 'E2', 'T-12 : symétrique — 7-14 ⇒ E2');
}

/** T-13 — ⚠️ la sonde qui vérifie la clé « scores » (frontend/js/api.js) doit rester possible. */
function testDecisionScore_sondeVerifCle(etat) {
  var r = deciderEnregistrementScore(null, { id: '__verif_cle__', score_A: 0, score_B: 0,
                                             modeDetail: false, detA: null, detB: null }, {});
  _ffrAssert(etat, r.error === 'Match introuvable : __verif_cle__',
    'T-13 : la sonde reçoit « Match introuvable », une erreur qui n\'est PAS un refus de clé');
  _ffrAssert(etat, !/incorrecte|non\s*configur/i.test(r.error),
    'T-13 : ⚠️ le message ne ressemble pas à un refus de clé — sinon la connexion à la saisie casse');
  _ffrAssert(etat, r.ok === undefined && r.ecriture === undefined,
    'T-13 : et la sonde n\'écrit RIEN');
}

/** T-15 — cascade : le cœur réclame le match suivant, puis tranche. */
function testDecisionScore_cascadeLecturesParesseuses(etat) {
  var m = _dsMatch({ sous_tableau: 'COUPE', tour: 'DEMI_FINALE', statut: 'terminé',
                     score_A: 5, score_B: 2, match_suivant: 'M-9', place_suivant: 'A' });
  var d = { modification: true };

  // 1er appel, sans `suivant` : le cœur dit qu'il en a besoin — il ne devine pas.
  var appel1 = deciderEnregistrementScore(m, _dsSaisie(9, 1), d);
  _ffrAssert(etat, appel1.besoin_suivant === 'M-9',
    'T-15 : les 4 conditions réunies ⇒ le cœur RÉCLAME le match suivant (M-9)');
  _ffrAssert(etat, appel1.ok === undefined && appel1.error === undefined,
    'T-15 : réclamer n\'est ni accepter ni refuser');

  // Le match suivant est joué → refus, sauf confirmation.
  var suivantJoue = _dsMatch({ id_match: 'M-9', sous_tableau: 'COUPE', tour: 'FINALE',
                               statut: 'terminé', score_A: 8, score_B: 1 });
  var refus = deciderEnregistrementScore(m, _dsSaisie(9, 1), d, suivantJoue);
  _ffrAssert(etat, refus.cascade_requise === true && refus.match_suivant === 'M-9',
    'T-15 : match suivant déjà joué ⇒ cascade_requise, avec son identifiant');
  _ffrAssert(etat, refus.error.indexOf('réinitialiser la suite du tableau') > 0,
    'T-15 : le message prévient que la suite du tableau sera réinitialisée');

  var force = deciderEnregistrementScore(m, _dsSaisie(9, 1), { modification: true, forcerCascade: true }, suivantJoue);
  _ffrAssert(etat, force.ok === true, 'T-15 : forcerCascade ⇒ accepté');

  // `null` = lu mais introuvable ⇒ on ne bloque pas (comportement d'avant l'extraction).
  _ffrAssert(etat, deciderEnregistrementScore(m, _dsSaisie(9, 1), d, null).ok === true,
    'T-15 : match suivant introuvable (null) ⇒ accepté, jamais un blocage');
  // Match suivant pas encore joué ⇒ rien à réinitialiser.
  var suivantAVenir = _dsMatch({ id_match: 'M-9', sous_tableau: 'COUPE', statut: 'à venir' });
  _ffrAssert(etat, deciderEnregistrementScore(m, _dsSaisie(9, 1), d, suivantAVenir).ok === true,
    'T-15 : match suivant pas terminé ⇒ accepté');

  // ⚡ Et le cœur ne réclame RIEN quand un garde-fou antérieur refuse : la lecture reste paresseuse.
  var egalite = deciderEnregistrementScore(m, _dsSaisie(7, 7), d);
  _ffrAssert(etat, egalite.departage_requis === true && egalite.besoin_suivant === undefined,
    'T-15 : ⚡ ③ refuse AVANT ④ ⇒ aucune lecture réclamée (lecture paresseuse préservée)');
}

/** T-16 — hors Coupe, un `vainqueur` envoyé est renvoyé mais JAMAIS écrit. */
function testDecisionScore_vainqueurHorsCoupe(etat) {
  var r = deciderEnregistrementScore(_dsMatch({}), _dsSaisie(4, 2), { vainqueur: 'E1' });
  _ffrAssert(etat, r.ok === true && r.estCoupe === false, 'T-16 : match de poule accepté');
  _ffrAssert(etat, r.reponse.match.vainqueur === 'E1',
    'T-16 : le vainqueur envoyé est RENVOYÉ tel quel dans la réponse (comportement conservé)');
  _ffrAssert(etat, r.estCoupe === false,
    'T-16 : mais estCoupe = false ⇒ l\'appelant ne l\'écrira pas dans le classeur');
}

/** T-17 — mode simple : le plan ne touche JAMAIS aux 8 colonnes de détail (migration douce). */
function testDecisionScore_modeSimpleNeTouchePasAuDetail(etat) {
  var simple = deciderEnregistrementScore(_dsMatch({}), _dsSaisie(12, 7), {});
  _ffrAssert(etat, simple.detail === false && simple.compteurs === null,
    'T-17 : mode simple ⇒ aucun compteur dans le plan — les 8 colonnes ne seront pas écrites');
  _ffrAssert(etat, simple.reponse.match.essais_A === undefined,
    'T-17 : et la réponse ne fabrique aucun compteur');

  var det = { essais: 3, transfo: 2, pen: 1, drop: 0, points: 22 };
  var detB = { essais: 1, transfo: 0, pen: 0, drop: 0, points: 5 };
  var detaille = deciderEnregistrementScore(_dsMatch({}),
    _dsSaisie(22, 5, { modeDetail: true, detA: det, detB: detB }), {});
  _ffrAssert(etat, detaille.detail === true && detaille.compteurs.length === 8,
    'T-17 : mode détail ⇒ 8 compteurs, prêts pour une écriture contiguë');
  _ffrAssert(etat, detaille.compteurs[0] === 3 && detaille.compteurs[1] === 1
      && detaille.compteurs[2] === 2 && detaille.compteurs[3] === 0,
    'T-17 : ⚠️ l\'ordre est celui de ENTETES.Matchs — essais_A, essais_B, transfo_A, transfo_B…');
  _ffrAssert(etat, detaille.reponse.match.essais_A === 3 && detaille.reponse.match.essais_B === 1,
    'T-17 : la réponse renvoie le détail recalculé');
}

/* -------------------------------------------------------------------------- */
/*  M1-B — Réinitialisation : cycle de vie des `org_*` (décision D-043)        */
/*                                                                            */
/*  Deux choses sont prouvées SÉPARÉMENT, et c'est volontaire :               */
/*   ① LA DÉCISION — quelles clés doivent être effacées : `clesAutorisationAEffacer`, */
/*     fonction PURE, testée sans classeur (y compris ses cas NÉGATIFS) ;      */
/*   ② LE BRANCHEMENT — le chemin réellement emprunté par une réinitialisation */
/*     appelle bien cette décision et produit l'effacement : testé sur un FAUX */
/*     onglet écrivable, sans aucun Sheet réel ni effet de bord.               */
/*  ⚠️ Tester ① seul ne prouverait RIEN sur ② : une liste juste que personne   */
/*  n'appelle n'efface rien.                                                   */
/* -------------------------------------------------------------------------- */

/** Les 10 permanents de D-043 — écrits ICI, indépendamment du code, pour que le test constate
 *  un écart au lieu de le recopier. */
var _M1B_PERMANENTS = ['org_club_nom', 'org_code_club', 'org_label_edr', 'org_label_date',
  'org_president_nom', 'org_president_tel', 'org_president_mail',
  'org_representant_nom', 'org_representant_tel', 'org_representant_mail'];

/** Les 26 à vider de D-043 — même principe : la liste attendue vient de la DÉCISION, pas du code. */
var _M1B_A_VIDER = ['org_niveau_tournoi', 'org_equipes_etrangeres', 'org_equipes_etrangeres_liste',
  'org_nb_participants', 'org_type_terrain', 'org_nb_vestiaires', 'org_nb_arbitres',
  'org_nb_educateurs', 'org_nb_educateurs_club', 'org_nb_doublettes', 'org_medecin_oui',
  'org_medecin_nom', 'org_medecin_tel', 'org_secours_nom', 'org_secours_tel', 'org_ambulance',
  'org_droits_oui', 'org_droits_montant', 'org_hebergement_oui', 'org_hebergement_structure',
  'org_repas_oui', 'org_repas_fournisseur', 'org_repas_prix', 'org_gouters_oui',
  'org_gouters_fournisseur', 'org_gouters_prix'];

/** Deux listes portent-elles EXACTEMENT les mêmes éléments ? (ordre indifférent, doublons signalés) */
function _m1bMemesElements(a, b) {
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; i++) { if (b.indexOf(a[i]) === -1) return false; }
  for (var j = 0; j < b.length; j++) { if (a.indexOf(b[j]) === -1) return false; }
  return true;
}

/** ① La liste d'effacement contient EXACTEMENT les 26 de D-043 — comparaison ensembliste. */
function testM1B_allowlistExactementLes26(etat) {
  var l = CHAMPS_AUTORISATION_A_REINITIALISER;
  _ffrAssert(etat, l.length === 26, 'M1-B : l\'allowlist compte 26 clés (constaté ' + l.length + ')');
  _ffrAssert(etat, _m1bMemesElements(l, _M1B_A_VIDER),
    'M1-B : l\'allowlist est EXACTEMENT les 26 champs d\'édition de D-043');
  var doublons = l.filter(function (k, i) { return l.indexOf(k) !== i; });
  _ffrAssert(etat, doublons.length === 0, 'M1-B : aucun doublon dans l\'allowlist');
}

/** ① ⭐ LE TEST QUI PROTÈGE LE CLUB : aucun des 10 permanents n'est effaçable, par aucun chemin. */
function testM1B_les10PermanentsJamaisEffaces(etat) {
  var effaces = clesAutorisationAEffacer(_M1B_PERMANENTS.concat(['org_recompenses_U10']));
  _M1B_PERMANENTS.forEach(function (k) {
    _ffrAssert(etat, CHAMPS_AUTORISATION_A_REINITIALISER.indexOf(k) === -1,
      'M1-B : ' + k + ' absent de l\'allowlist');
    _ffrAssert(etat, effaces.indexOf(k) === -1,
      'M1-B : ' + k + ' n\'est JAMAIS retenu pour effacement, même présent dans Config');
  });
}

/** ① 36 = 10 conservés + 26 vidés, sans recouvrement et sans 27e clé `org_*` fixe. */
function testM1B_partition36(etat) {
  var tous = CHAMPS_AUTORISATION;
  _ffrAssert(etat, tous.length === 36, 'M1-B : CHAMPS_AUTORISATION compte 36 clés (constaté ' + tous.length + ')');
  var chevauchement = CHAMPS_AUTORISATION_A_REINITIALISER.filter(function (k) {
    return _M1B_PERMANENTS.indexOf(k) !== -1;
  });
  _ffrAssert(etat, chevauchement.length === 0, 'M1-B : aucun champ à la fois conservé et vidé');
  _ffrAssert(etat, _M1B_PERMANENTS.length + CHAMPS_AUTORISATION_A_REINITIALISER.length === tous.length,
    'M1-B : 10 + 26 = 36, la partition est complète');
  // Aucune clé de l'allowlist n'est étrangère au dossier d'autorisation.
  var etrangeres = CHAMPS_AUTORISATION_A_REINITIALISER.filter(function (k) { return tous.indexOf(k) === -1; });
  _ffrAssert(etat, etrangeres.length === 0, 'M1-B : aucune clé effaçable hors de CHAMPS_AUTORISATION');
  // Et réciproquement : pas de 27e `org_*` fixe qui serait effacé sans avoir été décidé.
  var nonClassees = tous.filter(function (k) {
    return _M1B_PERMANENTS.indexOf(k) === -1 && CHAMPS_AUTORISATION_A_REINITIALISER.indexOf(k) === -1;
  });
  _ffrAssert(etat, nonClassees.length === 0, 'M1-B : aucun des 36 n\'est laissé sans décision');
}

/** ① Les récompenses dynamiques sont détectées — y compris ORPHELINES (catégorie disparue). */
function testM1B_recompensesDetectees(etat) {
  var cles = clesAutorisationAEffacer(['org_recompenses_U8', 'org_recompenses_U10',
    'org_recompenses_M14F', 'tournoi_nom']);
  ['org_recompenses_U8', 'org_recompenses_U10', 'org_recompenses_M14F'].forEach(function (k) {
    _ffrAssert(etat, cles.indexOf(k) !== -1, 'M1-B : ' + k + ' est retenu pour effacement');
  });
  // ⭐ Le cas qui motive la détection par préfixe : la catégorie n'existe plus, la clé reste.
  var orpheline = clesAutorisationAEffacer(['org_recompenses_U6_disparue']);
  _ffrAssert(etat, orpheline.indexOf('org_recompenses_U6_disparue') !== -1,
    'M1-B : une récompense ORPHELINE (catégorie supprimée) est quand même effacée');
  // Aucune récompense inventée quand il n'y en a pas.
  var sans = clesAutorisationAEffacer(['tournoi_nom']);
  _ffrAssert(etat, sans.length === 26, 'M1-B : sans récompense présente, exactement les 26');
}

/** ① ⭐ TEST NÉGATIF R-B2 : les voisins du préfixe ne sont JAMAIS attrapés. */
function testM1B_prefixeVoisinsNonAttrapes(etat) {
  var voisins = ['org_representant_nom', 'org_representant_tel', 'org_representant_mail',
    'org_president_nom', 'org_president_tel', 'org_president_mail',
    'org_recompense_U8',      // sans le « s » : ce n'est pas le préfixe
    'org_recompenses',        // sans le « _ » final ni catégorie
    'org_recompenses_',       // le préfixe nu : aucune catégorie derrière
    'recompenses_U8',         // ne commence pas par org_
    'xorg_recompenses_U8'];   // le préfixe n'est pas AU DÉBUT
  var cles = clesAutorisationAEffacer(voisins);
  voisins.forEach(function (k) {
    _ffrAssert(etat, cles.indexOf(k) === -1, 'M1-B (R-B2) : ' + k + ' n\'est PAS emporté par le préfixe');
  });
  _ffrAssert(etat, cles.length === 26, 'M1-B (R-B2) : aucun voisin n\'a grossi la liste');
}

/** ① Aucune clé étrangère au dossier d'autorisation n'entre dans la liste. */
function testM1B_aucuneCleHorsAutorisation(etat) {
  var conserves = ['tournoi_nom', 'perfs_mot_cle_club', 'email_expediteur', 'terrains_physiques',
    'cle_admin', 'boutique_disponible'];
  var cles = clesAutorisationAEffacer(conserves);
  conserves.forEach(function (k) {
    _ffrAssert(etat, cles.indexOf(k) === -1, 'M1-B : ' + k + ' n\'est jamais retenu par ce lot');
  });
}

/* --- ② Le BRANCHEMENT : faux onglet Config écrivable, en mémoire, sans Sheet réel --- */

/** Faux onglet minimal : lecture, écriture cellule, suppression et insertion de lignes. */
function _m1bFauxOnglet(lignes) {
  var d = lignes.map(function (l) { return l.slice(); });
  function largeur() {
    var m = 0;
    d.forEach(function (l) { if (l.length > m) m = l.length; });
    return m;
  }
  var api = {
    getLastRow: function () { return d.length; },
    getLastColumn: function () { return largeur(); },
    getDataRange: function () { return api.getRange(1, 1, d.length, largeur()); },
    getRange: function (r, c, nr, nc) {
      nr = nr || 1; nc = nc || 1;
      return {
        getValues: function () {
          var out = [];
          for (var i = 0; i < nr; i++) {
            var ligne = [];
            for (var j = 0; j < nc; j++) {
              var v = (d[r - 1 + i] || [])[c - 1 + j];
              ligne.push(v === undefined ? '' : v);
            }
            out.push(ligne);
          }
          return out;
        },
        setValue: function (v) { if (!d[r - 1]) d[r - 1] = []; d[r - 1][c - 1] = v; },
        setValues: function (vals) {
          for (var i = 0; i < vals.length; i++) {
            if (!d[r - 1 + i]) d[r - 1 + i] = [];
            for (var j = 0; j < vals[i].length; j++) { d[r - 1 + i][c - 1 + j] = vals[i][j]; }
          }
        },
        clearContent: function () {
          for (var i = 0; i < nr; i++) {
            for (var j = 0; j < nc; j++) { if (d[r - 1 + i]) d[r - 1 + i][c - 1 + j] = ''; }
          }
        },
        setNumberFormat: function () { return this; },
        // Mise en forme : sans effet ici, mais présente — `assurerColonnesClubsInvites` style
        // l'en-tête quand il AJOUTE une colonne (cas du vieux classeur, couvert par B2-0 / T8).
        setBackground: function () { return this; },
        setFontColor: function () { return this; },
        setFontWeight: function () { return this; }
      };
    },
    deleteRow: function (r) { d.splice(r - 1, 1); },
    insertRowsBefore: function (r, n) { for (var i = 0; i < n; i++) { d.splice(r - 1, 0, []); } },
    setFrozenRows: function () { return api; },
    _lignes: function () { return d; }
  };
  return api;
}

/** Config factice : les 36 `org_*` RENSEIGNÉS, des récompenses (dont une orpheline), les champs
 *  historiquement effacés, et deux conservations délibérées. ⛔ Ni affiche ni photo de parking :
 *  leurs identifiants déclencheraient un appel Drive réel, et un test ne doit avoir AUCUN effet. */
function _m1bClasseurFactice() {
  var lignes = [['— Réglages —', '']];
  CHAMPS_AUTORISATION.forEach(function (k) { lignes.push([k, 'VALEUR-' + k]); });
  lignes.push(['org_recompenses_U8', 'oui']);
  lignes.push(['org_recompenses_U10', 'non']);
  lignes.push(['org_recompenses_U6_disparue', 'oui']);   // catégorie supprimée : clé orpheline
  ['tournoi_nom', 'tournoi_date', 'heure_debut', 'referent_nom', 'date_limite_confirmation',
   'buvette_disponible', 'date_limite_reponse'].forEach(function (k) { lignes.push([k, 'X']); });
  lignes.push(['perfs_mot_cle_club', 'MOTCLE']);         // conservé délibérément
  lignes.push(['email_expediteur', 'envoi@club.fr']);    // conservé délibérément
  lignes.push(['tournoi_publie', 'oui']);
  lignes.push(['categorie', 'presente']);                // en-tête zone B
  lignes.push(['U10', 'oui']);
  var config = _m1bFauxOnglet(lignes);
  return { _config: config, getSheetByName: function (nom) { return nom === 'Config' ? config : null; } };
}

/** Valeur d'un paramètre dans le faux onglet ('' si absent, null si la LIGNE a disparu). */
function _m1bValeur(onglet, nom) {
  var d = onglet._lignes();
  for (var i = 0; i < d.length; i++) { if (d[i][0] === nom) { var v = d[i][1]; return v === undefined ? '' : v; } }
  return null;
}

/** ② L'effacement VIDE la valeur, ne supprime pas la ligne, et ne crée rien pour une clé absente. */
function testM1B_effacementVideSansSupprimerNiCreer(etat) {
  var cl = _m1bClasseurFactice();
  var avant = cl._config._lignes().length;
  var n = reinitialiserDonneesAutorisationTournoi(cl);
  _ffrAssert(etat, n === 29, 'M1-B : 26 champs + 3 récompenses soumis à effacement (constaté ' + n + ')');
  _ffrAssert(etat, cl._config._lignes().length === avant,
    'M1-B : AUCUNE ligne supprimée — on vide la valeur, on ne retire pas le paramètre');
  _ffrAssert(etat, _m1bValeur(cl._config, 'org_medecin_nom') === '',
    'M1-B : org_medecin_nom vidé, mais sa ligne existe toujours');
  // Une clé de l'allowlist ABSENTE du classeur ne doit pas être créée.
  var lignes = [['— Réglages —', ''], ['org_club_nom', 'AS Exemple'], ['tournoi_publie', 'oui']];
  var petit = _m1bFauxOnglet(lignes);
  var cl2 = { getSheetByName: function (nom) { return nom === 'Config' ? petit : null; } };
  reinitialiserDonneesAutorisationTournoi(cl2);
  _ffrAssert(etat, petit._lignes().length === 3, 'M1-B : aucune ligne CRÉÉE pour une clé absente');
  _ffrAssert(etat, _m1bValeur(petit, 'org_medecin_nom') === null, 'M1-B : org_medecin_nom reste inexistant');
}

/** ② ⭐ LE TEST DE BRANCHEMENT : `reinitialiserTournoi` — le chemin RÉELLEMENT appelé par
 *  l'application — déclenche bien l'effacement, et respecte D-043 champ par champ. */
function testM1B_branchementDepuisReinitialisation(etat) {
  var cl = _m1bClasseurFactice();
  reinitialiserTournoi(cl);

  var permanentsIntacts = _M1B_PERMANENTS.every(function (k) {
    return _m1bValeur(cl._config, k) === 'VALEUR-' + k;
  });
  _ffrAssert(etat, permanentsIntacts,
    'M1-B ⭐ branchement : les 10 permanents du club SURVIVENT à une réinitialisation complète');

  var vides = CHAMPS_AUTORISATION_A_REINITIALISER.filter(function (k) {
    return _m1bValeur(cl._config, k) === '';
  });
  _ffrAssert(etat, vides.length === 26,
    'M1-B ⭐ branchement : les 26 champs d\'édition sont vidés (constaté ' + vides.length + '/26)');

  ['org_recompenses_U8', 'org_recompenses_U10', 'org_recompenses_U6_disparue'].forEach(function (k) {
    _ffrAssert(etat, _m1bValeur(cl._config, k) === '',
      'M1-B ⭐ branchement : ' + k + ' vidé (récompense, orpheline comprise)');
  });
}

/** ② NON-RÉGRESSION : ce que la réinitialisation effaçait déjà l'est toujours, et ce qu'elle
 *  conservait délibérément est toujours conservé. */
function testM1B_effacementsHistoriquesNonRegresses(etat) {
  var cl = _m1bClasseurFactice();
  reinitialiserTournoi(cl);
  ['tournoi_nom', 'tournoi_date', 'heure_debut', 'referent_nom', 'date_limite_confirmation',
   'buvette_disponible', 'date_limite_reponse'].forEach(function (k) {
    _ffrAssert(etat, _m1bValeur(cl._config, k) === '', 'M1-B : ' + k + ' toujours effacé (non-régression)');
  });
  _ffrAssert(etat, _m1bValeur(cl._config, 'perfs_mot_cle_club') === 'MOTCLE',
    'M1-B : perfs_mot_cle_club toujours CONSERVÉ (conservation délibérée)');
  _ffrAssert(etat, _m1bValeur(cl._config, 'email_expediteur') === 'envoi@club.fr',
    'M1-B : email_expediteur toujours CONSERVÉ (config d\'infrastructure)');
  _ffrAssert(etat, _m1bValeur(cl._config, 'tournoi_publie') === 'non',
    'M1-B : le tournoi redevient masqué');
  _ffrAssert(etat, _m1bValeur(cl._config, 'U10') === null,
    'M1-B : les catégories de la zone B sont supprimées');
}

/* --- ③ L'EFFET MÉTIER : ce que le dossier d'autorisation affiche après un vidage --- */

/** ⭐ LE BUT DE D-043 : après vidage, la demande n'est plus artificiellement « toute saisie ». */
function testM1B_dossierNestPlusEntierementSaisi(etat) {
  var pleine = {};
  CHAMPS_AUTORISATION.forEach(function (k) { pleine[k] = 'V-' + k; });
  var avant = assemblerDossierAutorisation({}, { global: pleine, categories: [] }, { formes: [] });

  var apres = {};
  _M1B_PERMANENTS.forEach(function (k) { apres[k] = 'V-' + k; });   // les 10 survivent
  CHAMPS_AUTORISATION_A_REINITIALISER.forEach(function (k) { apres[k] = ''; }); // les 26 vidés
  var d = assemblerDossierAutorisation({}, { global: apres, categories: [] }, { formes: [] });

  _ffrAssert(etat, d.nbManquants > avant.nbManquants,
    'M1-B ⭐ après réinitialisation, le compteur de manquants AUGMENTE (' + avant.nbManquants +
    ' → ' + d.nbManquants + ')');
  _ffrAssert(etat, d.nbManquants > 0, 'M1-B ⭐ le compteur n\'annonce plus 0 champ manquant');
  var medecin = _autoChamp(d, 'édecin');
  _ffrAssert(etat, !medecin || medecin.etat !== 'saisi',
    'M1-B : le médecin de l\'édition passée n\'est plus présenté comme « saisi »');
}

/** Les 10 permanents restent utilisables : ils comptent toujours comme « saisi ». */
function testM1B_permanentsRestentSaisis(etat) {
  var g = {};
  _M1B_PERMANENTS.forEach(function (k) { g[k] = 'V-' + k; });
  CHAMPS_AUTORISATION_A_REINITIALISER.forEach(function (k) { g[k] = ''; });
  _ffrAssert(etat, champSaisiAutorisation({ global: g }, 'org_president_nom').etat === 'saisi',
    'M1-B : le président reste « saisi » après réinitialisation');
  _ffrAssert(etat, champSaisiAutorisation({ global: g }, 'org_code_club').etat === 'saisi',
    'M1-B : le code club reste « saisi » après réinitialisation');
  _ffrAssert(etat, champSaisiAutorisation({ global: g }, 'org_medecin_nom').etat !== 'saisi',
    'M1-B : le médecin, lui, n\'est plus « saisi »');
}

/** `org_equipes_etrangeres` vidé ⇒ le défaut DOCUMENTÉ « non » est restitué (jamais « manquant »). */
function testM1B_equipesEtrangeresDefautRestitue(etat) {
  var r = champSaisiAutorisation({ global: { org_equipes_etrangeres: '' } }, 'org_equipes_etrangeres');
  _ffrAssert(etat, r.valeur === 'non' && r.etat === 'calcule',
    'M1-B : org_equipes_etrangeres vidé ⇒ « non » (défaut documenté), pas « manquant »');
}

/** ⚠️ STOCKAGE ≠ AFFICHAGE. `org_type_terrain` est vidé du classeur, mais si des terrains réels
 *  déclarent leur nature, le champ reste CALCULÉ — ce n'est pas une survivance de l'ancienne
 *  saisie, c'est une valeur reconstruite depuis une donnée actuelle. Le test le fige pour qu'on
 *  ne « corrige » pas un jour ce comportement légitime en croyant réparer un oubli. */
function testM1B_typeTerrainCascadeLegitime(etat) {
  var avecTerrains = { global: { org_type_terrain: '',
    terrains_physiques: '[{"nom":"T1","nature":"Synthétique"}]' }, categories: [] };
  var n = naturesTerrainsAutorisation(avecTerrains);
  _ffrAssert(etat, n.natures.length === 1 && n.natures[0] === 'Synthétique',
    'M1-B : type de terrain vidé ⇒ la nature vient des terrains déclarés (cascade légitime)');
  var sansTerrains = { global: { org_type_terrain: '' }, categories: [] };
  _ffrAssert(etat, naturesTerrainsAutorisation(sansTerrains).natures.length === 0,
    'M1-B : sans terrain déclaré, rien n\'est inventé — le champ retombe sur la saisie, vide');
}

/* -------------------------------------------------------------------------- */
/*  M1-B2 / B2-0 — « Conserver le contact, réinitialiser l'engagement. »       */
/*                                                                            */
/*  ⭐ CE BLOC EST UNE SPÉCIFICATION, PAS UNE VÉRIFICATION D'IMPLÉMENTATION.   */
/*  Les huit RÉSULTATS MÉTIER T1 → T8 sont ceux formalisés dans `PLAN.md`      */
/*  §16.5 lors de l'implémentation du 2026-08-25 — ⛔ ils n'existaient PAS     */
/*  auparavant dans le dépôt : ils viennent du cadrage de travail, et c'est    */
/*  cette session qui les a écrits. Les tests `S…` qui suivent sont des        */
/*  contrôles STRUCTURELS supplémentaires : ils complètent les huit, ⛔ ils ne  */
/*  les remplacent jamais.                                                     */
/*                                                                            */
/*  Écrit pour SURVIVRE à B2-2, qui remplacera `ClubsInvites` par              */
/*  `Clubs` + `Participations` (décision D-050). Trois précautions :           */
/*   ① les deux familles (_B20_CONTACT / _B20_ENGAGEMENT) sont écrites ICI,    */
/*     indépendamment du code : le test CONSTATE un écart, il ne le recopie    */
/*     pas. En B2-2, ces mêmes noms décriront les colonnes de `Participations` ;*/
/*   ② les assertions métier passent par un joint de lecture unique —          */
/*     `_b20ClubsApresReset` — qui rend la liste PLATE des clubs, exactement   */
/*     l'objet que la couche d'adaptation de B2-2 s'engage à préserver.        */
/*     ⭐ En B2-2, DEUX helpers changent — celui qui MONTE le classeur          */
/*     (`_b20ClasseurFactice`) et celui qui le LIT — et les huit tests, eux,   */
/*     sont réutilisés MOT POUR MOT.                                           */
/*     ⛔ Ne jamais lire une colonne directement dans un onglet depuis un test  */
/*     de ce bloc : ce serait le rendre jetable en B2-2 ;                      */
/*   ③ les assertions parlent de RÉSULTAT (« aucun club n'est encore           */
/*     Accepté ») jamais de MÉCANIQUE (« la colonne 4 a été vidée »).          */
/*                                                                            */
/*  ⚠️ Ce que ce lot ne fait PAS : il ne sépare pas les deux familles dans la   */
/*  STRUCTURE (R-102 → B2-2), et il ne touche pas au découpage des terrains    */
/*  (R-101 → B2-3, voir le TÉMOIN en fin de bloc).                             */
/* -------------------------------------------------------------------------- */

/** Le CONTACT — ce qu'une réinitialisation doit CONSERVER. Écrit indépendamment du code. */
var _B20_CONTACT = ['club_nom', 'club_contact_nom', 'club_contact_prenom', 'club_contact_email',
  'date_ajout'];

/** L'ENGAGEMENT — ce qu'une réinitialisation doit VIDER. Écrit indépendamment du code.
 *  ⚠️ Quatre de ces colonnes manquaient avant B2-0 : `statut` (R-100), `alerte_ecart`,
 *  `detail_effectifs` et `nb_educateurs_total` (R-099). */
var _B20_ENGAGEMENT = ['statut', 'categories_engagees', 'dossier_envoye', 'invitation_envoyee',
  'club_token', 'date_reponse', 'nb_equipes_par_categorie', 'nb_joueurs_total',
  'alerte_ecart', 'detail_effectifs', 'nb_educateurs_total', 'selection_enregistree'];

/** Les trois effectifs de participation visés par T2. */
var _B20_EFFECTIFS = ['nb_joueurs_total', 'nb_educateurs_total', 'detail_effectifs'];

/** Le jeton de l'édition précédente, dans le classeur factice — la « preuve » de T6. */
var _B20_ANCIEN_TOKEN = 'JETON-EDITION-PRECEDENTE';

/**
 * ⭐ LE JOINT DE LECTURE — le seul endroit de ce bloc qui connaît la STRUCTURE.
 * Renvoie la liste PLATE des clubs telle que l'application la manipule aujourd'hui.
 * En B2-2, cette fonction lira `Clubs` + `Participations` via la couche d'adaptation ;
 * ⛔ aucune assertion de ce bloc n'aura à changer.
 */
function _b20ClubsApresReset(classeur) {
  return lireOngletSimple(classeur, 'ClubsInvites');
}

/** Vrai si la valeur est « rien » au sens du classeur (cellule vidée, jamais supprimée). */
function _b20EstVide(v) { return v === '' || v === null || v === undefined; }

/**
 * Classeur factice B2-0 : Config (comme M1-B) + `ClubsInvites` peuplé + `Equipes`.
 * ⭐ Il reproduit le tournoi témoin réel du 2026-08-25 : le premier club est ACCEPTÉ avec ses
 * effectifs déclarés et son équipe synchronisée ; le second n'a jamais répondu. Une
 * réinitialisation doit produire le même résultat sur les deux.
 * ⚠️ `Equipes` n'est pas décoratif : sans lui, la cascade FFR déduirait les effectifs du club
 * (« une équipe retirée emporte ses joueurs ») et le point de départ de T4 serait déjà 0 — le
 * test ne prouverait alors plus rien.
 */
function _b20ClasseurFactice(entetesClubs) {
  var base = _m1bClasseurFactice();
  // ⚠️ EN ZONE A, jamais après l'en-tête « categorie » : tout ce qui suit celui-ci est de la
  // zone B, et `supprimerToutesCategories` l'emporterait comme une catégorie.
  var lignesConfig = base._config._lignes();
  var zoneB = 0;
  while (zoneB < lignesConfig.length && lignesConfig[zoneB][0] !== 'categorie') zoneB++;
  lignesConfig.splice(zoneB, 0, ['tournoi_id', '2026-08-04 14:17:43'],
    ['repartition_grands_terrains', '{"Rugby 1":["1","2"]}']);
  var entetes = (entetesClubs || ENTETES.ClubsInvites).slice();
  var valeurs = {
    club_nom: 'LE TEST RUGBY CLUB', club_contact_nom: 'DUPONT', club_contact_prenom: 'Marie',
    club_contact_email: 'contact@test-rugby.fr', date_ajout: '2026-05-12',
    statut: 'Accepté', categories_engagees: 'U8', dossier_envoye: '2026-08-25',
    invitation_envoyee: '2026-08-25', club_token: _B20_ANCIEN_TOKEN,
    date_reponse: '2026-08-25', nb_equipes_par_categorie: '{"U8":1}', nb_joueurs_total: '7',
    alerte_ecart: 'Une équipe excédentaire n\'a pas pu être retirée',
    detail_effectifs: '{"U8":[{"j":7,"e":3}]}', nb_educateurs_total: '3',
    selection_enregistree: '2026-08-25'
  };
  var accepte = entetes.map(function (h) { return valeurs[h] === undefined ? 'INCONNU-' + h : valeurs[h]; });
  var jamaisRepondu = entetes.map(function (h) {
    return _B20_CONTACT.indexOf(h) !== -1 ? String(valeurs[h]).replace('LE TEST', 'SILENCIEUX') : '';
  });
  var clubs = _m1bFauxOnglet([entetes, accepte, jamaisRepondu]);
  // L'équipe réellement créée par la réponse du club (source 'auto' : jamais recomptée par
  // effectifsEquipesManuelles — ce qui isole la contribution des CLUBS INVITÉS dans T4).
  var equipes = _m1bFauxOnglet([ENTETES.Equipes,
    ['E12', 'LE TEST RUGBY CLUB-1', 'U8', 'C', 'auto', 7, 3]]);
  var config = base._config;
  return {
    _config: config, _clubs: clubs, _equipes: equipes,
    // `assurerTournoiId` et `assurerTokensClubs` horodatent / tirent un UUID : doublures fournies.
    getSpreadsheetTimeZone: function () { return 'Europe/Paris'; },
    getSheetByName: function (nom) {
      if (nom === 'Config') return config;
      if (nom === 'ClubsInvites') return clubs;
      if (nom === 'Equipes') return equipes;
      return null;
    }
  };
}

/**
 * Les trois lignes que la demande d'autorisation FFR tire des CLUBS INVITÉS, telles que
 * l'organisateur les VOIT et telles que le PDF destiné à la Ligue les PORTE.
 *
 * ⭐ Passe par `getDossierAutorisation`, la fonction réellement appelée par l'écran FFR et par
 * l'export PDF — ⛔ jamais par une reproduction de sa logique dans le test.
 *
 * ⚠️ Pourquoi on lit les CHAMPS et pas des compteurs bruts : `getDossierAutorisation` ne
 * réexpose pas `nbClubsInvites` / `nbParticipants` / `nbEducateurs`. Les lire autrement
 * obligerait à recopier la cascade dans le test — exactement ce qu'il ne faut pas faire.
 * ⭐ Et les champs prouvent DAVANTAGE : `champClubs` ne vaut « manquant » QUE si le compte des
 * clubs acceptés est nul ; `Nombre de participants` et `Nombre d'éducateurs` ne valent
 * « manquant » QUE si la somme déclarée est nulle ET qu'aucune saisie ne prend le relais.
 * Lire « manquant / vide » sur ces trois lignes, c'est donc lire 0 / 0 / 0 — DÉMONTRÉ, pas déduit.
 * ⭐ `origine` dit en plus D'OÙ vient un chiffre : c'est ce qui distingue « 0 venant des clubs
 * invités » de « 0 tout court ».
 */
function _b20CascadeFFR(classeur) {
  var d = (getDossierAutorisation(classeur) || {}).dossier;
  return {
    clubs: _autoChamp(d, 'Nombre de clubs'),
    participants: _autoChamp(d, 'Nombre de participants'),
    educateurs: _autoChamp(d, 'Nombre d\'éducateurs')
  };
}

/** Vrai si un champ du dossier attribue sa valeur aux CLUBS INVITÉS (lecture de son origine). */
function _b20VientDesClubsInvites(champ) {
  var o = String((champ && champ.origine) || '');
  return o.indexOf('invitations') !== -1 || o.indexOf('clubs invités') !== -1 ||
    o.indexOf('clubs acceptés') !== -1;
}

/* ========================================================================== */
/*  LES HUIT RÉSULTATS MÉTIER — `PLAN.md` §16.5                               */
/* ========================================================================== */

/** T1 — Aucun statut de participation hérité après reset.
 *  ⭐ Prouvé par `statutClubCanonique`, la fonction que le serveur utilise LUI-MÊME pour décider
 *  si un club compte comme engagé. */
function testB20_T1_aucunStatutHerite(etat) {
  var cl = _b20ClasseurFactice();
  _ffrAssert(etat, statutClubCanonique(_b20ClubsApresReset(cl)[0].statut) === 'Accepté',
    'B2-0 T1 : au départ, le club est bien « Accepté » (l\'édition précédente a eu lieu)');
  reinitialiserTournoi(cl);
  _b20ClubsApresReset(cl).forEach(function (c, i) {
    _ffrAssert(etat, statutClubCanonique(c.statut) !== 'Accepté',
      'B2-0 T1 ⭐ club ' + (i + 1) + ' : aucun statut « Accepté » hérité');
    _ffrAssert(etat, statutClubCanonique(c.statut) === '',
      'B2-0 T1 ⭐ club ' + (i + 1) + ' : statut vide = « connu au carnet, sans participation » ' +
      '(D-050) ⇒ le club redevient INVITABLE (estInvitable exclut Accepté ET Décliné)');
  });
}

/** T2 — Aucun effectif de participation hérité : `nb_joueurs_total`, `nb_educateurs_total`,
 *  `detail_effectifs`. ⭐ Les deux derniers sont le cœur de R-099. */
function testB20_T2_aucunEffectifHerite(etat) {
  var cl = _b20ClasseurFactice();
  var avant = _b20ClubsApresReset(cl)[0];
  _ffrAssert(etat, String(avant.nb_joueurs_total) === '7' && String(avant.nb_educateurs_total) === '3' &&
    String(avant.detail_effectifs).indexOf('"j":7') !== -1,
    'B2-0 T2 : au départ, les TROIS effectifs sont déclarés (le cas réel du 2026-08-24)');
  reinitialiserTournoi(cl);
  var apres = _b20ClubsApresReset(cl)[0];
  _B20_EFFECTIFS.forEach(function (h) {
    _ffrAssert(etat, _b20EstVide(apres[h]), 'B2-0 T2 ⭐ ' + h + ' : aucun effectif hérité');
  });
  // ⭐ LE DÉFAUT LUI-MÊME : les déclarations d'une même réponse ne peuvent plus se séparer.
  _ffrAssert(etat, _b20EstVide(apres.nb_joueurs_total) === _b20EstVide(apres.nb_educateurs_total),
    'B2-0 T2 ⭐ joueurs et éducateurs suivent le MÊME sort — plus de « (vide) / 3 » à l\'écran');
  _ffrAssert(etat, _b20EstVide(apres.nb_equipes_par_categorie),
    'B2-0 T2 : le nombre d\'équipes engagées part avec les effectifs');
}

/** T3 — Aucune `alerte_ecart` héritée : le badge ⚠️ d'une édition close ne survit pas. */
function testB20_T3_aucuneAlerteHeritee(etat) {
  var cl = _b20ClasseurFactice();
  _ffrAssert(etat, String(_b20ClubsApresReset(cl)[0].alerte_ecart).length > 0,
    'B2-0 T3 : au départ, le club porte une alerte d\'écart');
  reinitialiserTournoi(cl);
  _b20ClubsApresReset(cl).forEach(function (c, i) {
    _ffrAssert(etat, _b20EstVide(c.alerte_ecart),
      'B2-0 T3 ⭐ club ' + (i + 1) + ' : aucune alerte d\'écart héritée');
  });
}

/** T4 — ⭐ LA CONSÉQUENCE MÉTIER LA PLUS GRAVE, EXÉCUTÉE : après reset, la demande
 *  d'autorisation FFR compte 0 club accepté, 0 joueur et 0 éducateur venant des clubs invités.
 *  ⛔ On ne DÉDUIT pas « statut vide donc probablement zéro » : on APPELLE
 *  `getDossierAutorisation`, la fonction que l'écran FFR et l'export PDF utilisent réellement. */
function testB20_T4_cascadeFFRZeroZeroZero(etat) {
  // ── (a) LE POINT DE DÉPART — sans lui, le test ne prouverait rien : la cascade compte
  //     VRAIMENT le club de l'édition passée et ses effectifs, et elle le DIT.
  var cl = _b20ClasseurFactice();
  var avant = _b20CascadeFFR(cl);
  _ffrAssert(etat, avant.clubs.valeur === '1' && _b20VientDesClubsInvites(avant.clubs),
    'B2-0 T4 : au départ, « Nombre de clubs » = 1, origine « ' + avant.clubs.origine + ' »');
  _ffrAssert(etat, avant.participants.valeur === '7' && _b20VientDesClubsInvites(avant.participants),
    'B2-0 T4 : au départ, « Nombre de participants » = 7, origine « ' + avant.participants.origine + ' »');
  _ffrAssert(etat, avant.educateurs.valeur === '3' && _b20VientDesClubsInvites(avant.educateurs),
    'B2-0 T4 : au départ, « Nombre d\'éducateurs » = 3, origine « ' + avant.educateurs.origine + ' »');

  // ── (b) ISOLATION LA PLUS STRICTE — équipes INTACTES, et les replis « saisis » neutralisés.
  //     On applique les deux volets backend du reset qui touchent ces chiffres
  //     (`reinitialiserPhase2Clubs` pour les clubs, `reinitialiserDonneesAutorisationTournoi`
  //     pour les `org_*` de D-043) SANS vider l'onglet Équipes. L'équipe E12 est 'auto' ⇒
  //     `effectifsEquipesManuelles` l'ignore ⇒ ⭐ tout chiffre restant ne pourrait venir QUE
  //     d'une survivance de `ClubsInvites`.
  reinitialiserPhase2Clubs(cl);
  reinitialiserDonneesAutorisationTournoi(cl);
  var isole = _b20CascadeFFR(cl);
  _ffrAssert(etat, !_b20VientDesClubsInvites(isole.clubs),
    'B2-0 T4 ⭐ 0 CLUB ACCEPTÉ compté — plus aucun club ne vient des invitations (origine : « ' +
    isole.clubs.origine + ' »)');
  _ffrAssert(etat, isole.participants.etat === 'manquant' && isole.participants.valeur === '',
    'B2-0 T4 ⭐ 0 JOUEUR provenant des clubs invités — « Nombre de participants » redevient ' +
    'MANQUANT alors que les équipes sont encore là (constaté : ' + isole.participants.etat + ')');
  _ffrAssert(etat, isole.educateurs.etat === 'manquant' && isole.educateurs.valeur === '',
    'B2-0 T4 ⭐ 0 ÉDUCATEUR provenant des clubs invités (constaté : ' + isole.educateurs.etat + ')');
  // ⭐ Et la bascule est VISIBLE : le nombre de clubs retombe sur la source « équipes », pas sur
  //   les invitations — c'est exactement ce que la cascade documentée prévoit.
  _ffrAssert(etat, isole.clubs.origine.indexOf('équipes') !== -1,
    'B2-0 T4 : « Nombre de clubs » retombe sur les clubs déduits des ÉQUIPES (repli documenté)');

  // ── (c) LE CHEMIN RÉEL, COMPLET : un tournoi neuf part de 0 / 0 / 0, affiché comme tel.
  var complet = _b20ClasseurFactice();
  reinitialiserTournoi(complet);
  var apres = _b20CascadeFFR(complet);
  [['clubs', 'Nombre de clubs'], ['participants', 'Nombre de participants'],
   ['educateurs', 'Nombre d\'éducateurs']].forEach(function (p) {
    var ch = apres[p[0]];
    _ffrAssert(etat, ch.etat === 'manquant' && ch.valeur === '',
      'B2-0 T4 ⭐⭐ après réinitialisation complète, « ' + p[1] + ' » = MANQUANT et vide ' +
      '(constaté : ' + ch.etat + ' / « ' + ch.valeur + ' »)');
    _ffrAssert(etat, !_b20VientDesClubsInvites(ch),
      'B2-0 T4 ⭐⭐ « ' + p[1] + ' » ne doit plus RIEN aux clubs invités');
  });
  // ⛔ Rien n'est INVENTÉ à la place : le dossier signale des manquants, il ne devine pas.
  _ffrAssert(etat, getDossierAutorisation(complet).dossier.nbManquants > 0,
    'B2-0 T4 : le dossier d\'un tournoi neuf annonce des champs MANQUANTS — jamais « complet »');
}

/** T5 — Le carnet durable est conservé : les cinq coordonnées survivent, intactes. */
function testB20_T5_carnetDurableConserve(etat) {
  var cl = _b20ClasseurFactice();
  var lignesAvant = cl._clubs._lignes().length;
  var largeurAvant = cl._clubs.getLastColumn();
  var attendu = {
    club_nom: 'LE TEST RUGBY CLUB', club_contact_nom: 'DUPONT', club_contact_prenom: 'Marie',
    club_contact_email: 'contact@test-rugby.fr', date_ajout: '2026-05-12'
  };
  reinitialiserTournoi(cl);
  var c = _b20ClubsApresReset(cl)[0];
  _B20_CONTACT.forEach(function (h) {
    _ffrAssert(etat, c[h] === attendu[h],
      'B2-0 T5 ⭐ ' + h + ' conservé à l\'identique (constaté « ' + c[h] + ' »)');
  });
  _ffrAssert(etat, _b20ClubsApresReset(cl).length === 2,
    'B2-0 T5 : les 2 clubs sont TOUJOURS LÀ — aucune fiche supprimée');
  _ffrAssert(etat, cl._clubs._lignes().length === lignesAvant &&
    cl._clubs.getLastColumn() === largeurAvant,
    'B2-0 T5 : aucune ligne ni colonne ajoutée ou retirée');
}

/** T6 — ⭐ AUCUN ANCIEN JETON D'ÉDITION NE RESTE UTILISABLE APRÈS RESET.
 *
 *  ⚠️ Ce test ne dit PAS « la cellule est vide pour toujours » — ce serait FAUX de
 *  l'architecture actuelle, et ce serait surtout tester la mauvaise chose. `listerClubsInvites`
 *  appelle `assurerTokensClubs`, qui redonne un jeton neuf à tout club qui n'en a pas : au
 *  premier chargement de l'admin qui suit, les cellules sont donc REMPLIES à nouveau.
 *
 *  ⭐ Le résultat métier qui compte est ailleurs : l'ANCIEN lien doit être MORT, et le nouveau
 *  jeton ne doit être ni l'ancien, ni transmis au CLUB, ni exposé PUBLIQUEMENT avant un nouvel
 *  envoi d'invitation. C'est ce qui est éprouvé ici, par les fonctions réellement chargées de
 *  valider un jeton — `trouverClubParToken`, `getReponseInvitation` et `repondreInvitation` —
 *  ⛔ jamais par une lecture de cellule.
 *
 *  ⚠️ Ce commentaire disait « ni connu de quiconque » : trop fort, corrigé après revue.
 *  🔬 `listerClubsInvites` renvoie la LIGNE COMPLÈTE, `club_token` compris — le nouveau jeton est
 *  donc bien transmis au frontend ADMIN AUTHENTIFIÉ. ⭐ C'est une lecture protégée par la clé
 *  admin, au même titre que les emails du même onglet, et c'est ce qui permet de construire les
 *  liens d'invitation. La propriété démontrée reste entière : rien ne part vers le club. */
function testB20_T6_ancienTokenInutilisable(etat) {
  var cl = _b20ClasseurFactice();
  var nom = 'LE TEST RUGBY CLUB';

  // ── A. Avant reset : l'ancien lien OUVRE bien la porte (sinon le test ne prouverait rien).
  _ffrAssert(etat, trouverClubParToken(cl, nom, _B20_ANCIEN_TOKEN) !== null,
    'B2-0 T6 : AVANT reset, l\'ancien jeton ouvre bien le dossier du club');
  _ffrAssert(etat, !getReponseInvitation(cl, { club: nom, token: _B20_ANCIEN_TOKEN }).error,
    'B2-0 T6 : AVANT reset, la page de réponse s\'ouvre avec l\'ancien jeton');

  // ── B. Immédiatement après l'effet backend du reset : le lien est MORT.
  reinitialiserTournoi(cl);
  _ffrAssert(etat, trouverClubParToken(cl, nom, _B20_ANCIEN_TOKEN) === null,
    'B2-0 T6 ⭐ APRÈS reset, l\'ancien jeton n\'ouvre plus AUCUN dossier');
  _ffrAssert(etat, getReponseInvitation(cl, { club: nom, token: _B20_ANCIEN_TOKEN }).error ===
    'Lien invalide ou expiré.',
    'B2-0 T6 ⭐ la page de réponse refuse l\'ancien jeton, avec un message GÉNÉRIQUE');
  var refus = repondreInvitation(cl, { club: nom, token: _B20_ANCIEN_TOKEN, reponse: 'accepte' });
  _ffrAssert(etat, refus.error === 'Lien invalide ou expiré.',
    'B2-0 T6 ⭐ RÉPONDRE avec l\'ancien jeton est REFUSÉ — c\'est le seul geste qui écrirait');
  _ffrAssert(etat, statutClubCanonique(_b20ClubsApresReset(cl)[0].statut) === '',
    'B2-0 T6 ⭐ ce refus n\'a RIEN écrit : le club est toujours sans participation');

  // ── C/D/E. Au premier chargement de « Clubs invités », un jeton NEUF est réattribué.
  //     ⭐ C'est le comportement ACTUEL, assumé et documenté — pas un oubli.
  var liste = listerClubsInvites(cl);
  var nouveau = String((liste.clubs[0] || {}).club_token || '').trim();
  _ffrAssert(etat, nouveau.length > 0,
    'B2-0 T6 : au chargement de l\'admin, un jeton NEUF est réattribué (assurerTokensClubs)');
  _ffrAssert(etat, nouveau !== _B20_ANCIEN_TOKEN,
    'B2-0 T6 ⭐ le nouveau jeton est DIFFÉRENT de l\'ancien');
  var nouveau2 = String((listerClubsInvites(cl).clubs[1] || {}).club_token || '').trim();
  _ffrAssert(etat, nouveau2.length > 0 && nouveau2 !== nouveau,
    'B2-0 T6 : chaque club reçoit son PROPRE jeton (aucun jeton partagé)');

  // ── F. Et l'ancien lien reste mort APRÈS cette réattribution — c'est le point qui compte.
  _ffrAssert(etat, trouverClubParToken(cl, nom, _B20_ANCIEN_TOKEN) === null,
    'B2-0 T6 ⭐⭐ même APRÈS réattribution, l\'ancien jeton reste définitivement invalide');
  _ffrAssert(etat, repondreInvitation(cl, { club: nom, token: _B20_ANCIEN_TOKEN, reponse: 'decline' }).error ===
    'Lien invalide ou expiré.',
    'B2-0 T6 ⭐⭐ aucun ancien lien ne retrouve un droit d\'accès');
  // ⛔ Le contrôle NÉGATIF qui interdit la régression la plus dangereuse : réutiliser un jeton.
  _ffrAssert(etat, listerClubsInvites(cl).clubs.every(function (c) {
    return String(c.club_token || '').trim() !== _B20_ANCIEN_TOKEN;
  }), 'B2-0 T6 ⭐⭐ aucun club ne s\'est vu RÉATTRIBUER l\'ancien jeton');
}

/** T7 — Le `tournoi_id` de l'édition précédente n'est pas hérité.
 *  ⛔ Le renouvellement à chaque génération de planning, lui, reste entier — c'est B2-1. */
function testB20_T7_tournoiIdNonHerite(etat) {
  var cl = _b20ClasseurFactice();
  _ffrAssert(etat, _m1bValeur(cl._config, 'tournoi_id') === '2026-08-04 14:17:43',
    'B2-0 T7 : au départ, le classeur porte le tournoi_id de l\'édition précédente');
  reinitialiserTournoi(cl);
  _ffrAssert(etat, _m1bValeur(cl._config, 'tournoi_id') === '',
    'B2-0 T7 ⭐ après réinitialisation, aucun identifiant de tournoi n\'est hérité');
  _ffrAssert(etat, _m1bValeur(cl._config, 'tournoi_id') !== null,
    'B2-0 T7 : la LIGNE du paramètre existe toujours — on vide, on ne supprime pas (D-043)');
  var recree = assurerTournoiId(cl);
  _ffrAssert(etat, String(recree).length > 0 && recree !== '2026-08-04 14:17:43',
    'B2-0 T7 : un NOUVEL identifiant est recréé à la demande, différent de l\'ancien');
}

/** T8 — ⭐ AUCUNE COLONNE N'ÉCHAPPE À LA CLASSIFICATION (R-105). C'est le test qui empêche
 *  R-099 de se reproduire : il échoue le jour où quelqu'un ajoute une colonne à `ClubsInvites`
 *  sans dire si elle décrit le CLUB ou sa PARTICIPATION. */
function testB20_T8_aucuneColonneNonClassee(etat) {
  var toutes = ENTETES.ClubsInvites;
  _ffrAssert(etat, colonnesClubsNonClassees(toutes).length === 0,
    'B2-0 T8 ⭐ chaque colonne de ClubsInvites appartient à une famille (non classées : ' +
    (colonnesClubsNonClassees(toutes).join(', ') || 'aucune') + ')');
  var chevauchement = _B20_CONTACT.filter(function (h) { return _B20_ENGAGEMENT.indexOf(h) !== -1; });
  _ffrAssert(etat, chevauchement.length === 0,
    'B2-0 T8 : aucune colonne n\'est à la fois contact ET engagement');
  _ffrAssert(etat, _B20_CONTACT.length + _B20_ENGAGEMENT.length === toutes.length,
    'B2-0 T8 : 5 + 12 = ' + toutes.length + ', la partition est COMPLÈTE');
  _ffrAssert(etat, _m1bMemesElements(CLUBS_COLONNES_CONTACT, _B20_CONTACT),
    'B2-0 T8 : le code et la décision s\'accordent sur le CONTACT');
  _ffrAssert(etat, _m1bMemesElements(CLUBS_COLONNES_ENGAGEMENT, _B20_ENGAGEMENT),
    'B2-0 T8 : le code et la décision s\'accordent sur l\'ENGAGEMENT');
  // ⭐ LE CAS QUI COMPTE : une colonne FUTURE, non classée, est DÉTECTÉE…
  var future = toutes.concat(['buvette_reservee_2027']);
  _ffrAssert(etat, colonnesClubsNonClassees(future).join(',') === 'buvette_reservee_2027',
    'B2-0 T8 ⭐ une colonne future non classée est SIGNALÉE, au lieu de devenir un résidu permanent');
  // …et, en attendant qu'on la classe, elle n'est ni vidée par hasard ni oubliée en silence.
  var cl = _b20ClasseurFactice(future);
  reinitialiserPhase2Clubs(cl);
  var c = _b20ClubsApresReset(cl)[0];
  _ffrAssert(etat, c.buvette_reservee_2027 === 'INCONNU-buvette_reservee_2027',
    'B2-0 T8 ⛔ une colonne non classée est CONSERVÉE — l\'oubli garde la donnée, il ne la détruit pas');
  _ffrAssert(etat, _b20EstVide(c.statut) && c.club_nom === 'LE TEST RUGBY CLUB',
    'B2-0 T8 : sa présence ne perturbe ni l\'effacement de l\'engagement ni la conservation du contact');
  // Vieux classeur : une colonne MANQUANTE est ajoutée par la migration douce, puis traitée.
  var ancien = _b20ClasseurFactice(toutes.filter(function (h) { return h !== 'detail_effectifs'; }));
  reinitialiserPhase2Clubs(ancien);
  var vieux = _b20ClubsApresReset(ancien)[0];
  _ffrAssert(etat, _b20EstVide(vieux.detail_effectifs) && vieux.club_nom === 'LE TEST RUGBY CLUB',
    'B2-0 T8 : un classeur ANCIEN (colonne absente) traverse la réinitialisation sans dommage');
}

/* ========================================================================== */
/*  CONTRÔLES STRUCTURELS — ils COMPLÈTENT les huit, ils ne les remplacent pas */
/* ========================================================================== */

/** S1 — La DÉCISION, fonction pure sans classeur (patron D-043), et ses cas NÉGATIFS. */
function testB20_S1_decisionPure(etat) {
  var retenues = colonnesClubsAEffacer(ENTETES.ClubsInvites);
  _ffrAssert(etat, retenues.length === 12,
    'B2-0 S1 : 12 colonnes d\'engagement retenues (constaté ' + retenues.length + ')');
  _ffrAssert(etat, _m1bMemesElements(retenues, _B20_ENGAGEMENT),
    'B2-0 S1 : la décision est EXACTEMENT l\'engagement décrit par D-050');
  _B20_CONTACT.forEach(function (h) {
    _ffrAssert(etat, retenues.indexOf(h) === -1,
      'B2-0 S1 : ' + h + ' n\'est JAMAIS retenu pour effacement (c\'est un contact)');
  });
  var doublons = retenues.filter(function (h, i) { return retenues.indexOf(h) !== i; });
  _ffrAssert(etat, doublons.length === 0, 'B2-0 S1 : aucun doublon dans la décision');
  _ffrAssert(etat, colonnesClubsAEffacer(['club_nom', 'statut']).join(',') === 'statut',
    'B2-0 S1 : un onglet partiel ⇒ seules ses colonnes d\'engagement sont retenues');
  _ffrAssert(etat, colonnesClubsAEffacer([]).length === 0, 'B2-0 S1 : aucun en-tête ⇒ rien à vider');
  _ffrAssert(etat, colonnesClubsAEffacer(null).length === 0, 'B2-0 S1 : entrée absente ⇒ rien à vider');
  _ffrAssert(etat, colonnesClubsAEffacer(['budget_bar_2027']).length === 0,
    'B2-0 S1 ⛔ une colonne INCONNUE n\'est jamais vidée par surprise');
}

/** S2 — NON-RÉGRESSION : les 8 colonnes que le reset vidait DÉJÀ le sont toujours. */
function testB20_S2_nonRegressionHuitColonnes(etat) {
  var dejaVidees = ['club_token', 'categories_engagees', 'dossier_envoye', 'invitation_envoyee',
    'date_reponse', 'nb_equipes_par_categorie', 'nb_joueurs_total', 'selection_enregistree'];
  var cl = _b20ClasseurFactice();
  reinitialiserTournoi(cl);
  var c = _b20ClubsApresReset(cl)[0];
  dejaVidees.forEach(function (h) {
    _ffrAssert(etat, _b20EstVide(c[h]), 'B2-0 S2 : ' + h + ' toujours vidé (non-régression)');
  });
  var restants = _B20_ENGAGEMENT.filter(function (h) { return !_b20EstVide(c[h]); });
  _ffrAssert(etat, restants.length === 0,
    'B2-0 S2 ⭐ aucun engagement hérité, colonne par colonne (constaté : ' +
    (restants.join(', ') || 'aucun') + ')');
}

/** S3 — CAS LIMITES : un classeur sans club, et un classeur sans l'onglet du tout. */
function testB20_S3_casLimites(etat) {
  var vide = _b20ClasseurFactice();
  vide._clubs._lignes().splice(1);
  reinitialiserPhase2Clubs(vide);
  _ffrAssert(etat, vide._clubs._lignes().length === 1,
    'B2-0 S3 : un onglet sans aucun club traverse la réinitialisation sans dommage');
  // ⚠️ Contrôle de NON-PLANTAGE : sans onglet, la fonction doit sortir sans lever d'exception
  // (une exception ferait échouer TOUT le harnais, pas seulement cette ligne).
  reinitialiserPhase2Clubs({ getSheetByName: function () { return null; } });
  _ffrAssert(etat, true, 'B2-0 S3 : un classeur sans onglet ClubsInvites ne provoque aucune erreur');
}

/** ⚠️ TÉMOIN — ⛔ CE N'EST PAS UN TEST DE B2-0, ET IL NE DÉCRIT PAS UN COMPORTEMENT SOUHAITÉ.
 *  Il fige le défaut R-101 tel qu'il EST aujourd'hui : le découpage des grands terrains survit à
 *  la réinitialisation, si bien que le dossier d'un tournoi vide annonce encore « 18 terrains de
 *  jeu, sur 4 grands terrains ». ⭐ Sa correction appartient à B2-3, parce que la donnée est MIXTE
 *  (l'existence des grands terrains est permanente, leur découpage est propre à une édition).
 *  ➡️ Ce témoin DOIT être inversé par B2-3 : son échec, ce jour-là, sera le signe que le lot a
 *  bien agi — pas une régression. */
function testB20_temoinR101TerrainsResteB23(etat) {
  var cl = _b20ClasseurFactice();
  reinitialiserTournoi(cl);
  _ffrAssert(etat, _m1bValeur(cl._config, 'repartition_grands_terrains') === '{"Rugby 1":["1","2"]}',
    'B2-0 TÉMOIN (R-101) : le découpage des terrains survit ENCORE — correction attendue en B2-3');
}
