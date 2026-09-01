/**
 * ============================================================================
 *  TOURNOI R92 — Backend Google Apps Script
 * ============================================================================
 *  - setupSheet()  : crée les 6 onglets (à lancer UNE SEULE FOIS au tout début).
 *  - doGet(e)      : LECTURE (renvoie du JSON).
 *  - doPost(e)     : ÉCRITURE (équipes, réglages, génération des poules/planning).
 * ============================================================================
 */

/* Identifiant du Google Sheet source. La constante ci-dessous est le DÉFAUT ; si la propriété
   de script `SHEET_ID` est renseignée (Paramètres du projet → Propriétés du script), elle a la
   PRIORITÉ — pratique pour la PASSATION (migrer vers un autre Sheet sans toucher au code) et
   cohérent avec la config du relais CDN, déjà dans les propriétés. */
var SHEET_ID_DEFAUT = '17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U';

/** Renvoie l'ID du Sheet : propriété de script `SHEET_ID` si définie, sinon la constante. */
function sheetId() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    return (v && String(v).trim()) ? String(v).trim() : SHEET_ID_DEFAUT;
  } catch (e) { return SHEET_ID_DEFAUT; }
}

var ENTETES = {
  // source : 'manuel' (équipe ajoutée à la main) ou 'auto' (créée par la synchronisation d'un
  // club invité, au clic « Enregistrer la sélection »). Seules les équipes 'auto' peuvent être
  // retirées par cette synchro. Colonne ajoutée à droite (migration douce) ; vide = 'manuel'.
  // nb_joueurs / nb_educateurs : effectifs DÉCLARÉS pour cette équipe. Renseignés à la main
  // (ajout / crayon) sur les équipes saisies manuellement ; les équipes créées par une réponse
  // d'invitation (source 'auto') sont déjà couvertes par les totaux du club — voir
  // effectifsEquipesManuelles, qui n'additionne QUE les équipes non-'auto' (pas de double compte).
  Equipes: ['id_equipe', 'nom_equipe', 'categorie', 'poule', 'source', 'nb_joueurs', 'nb_educateurs'],
  Poules: ['id_poule', 'categorie', 'nom_poule'],
  // Clubs INVITÉS au tournoi (Phase 1 = invitation légère ; Phase 2 = dossier complet
  // envoyé aux clubs qui ont ACCEPTÉ). ⚠️ Contient des emails de contact : cet onglet
  // n'est JAMAIS inclus dans le snapshot public (getAll) — il se lit via l'action
  // listerClubsInvites (clé admin). Seuls des champs NON sensibles (nom, prénom,
  // catégories engagées — jamais l'email) sont exposés publiquement via getClubDossier.
  //   club_contact_prenom : utilisé dans la formule de politesse du dossier Phase 2.
  //   statut              : Invité / Accepté / Décliné (« Confirmé » = ancien libellé d'« Accepté »).
  //   categories_engagees : catégories réellement engagées par le club (« U8,U10 »), vides
  //                         tant qu'il n'a pas répondu — filtrent le dossier Phase 2.
  //   dossier_envoye      : date (AAAA-MM-JJ) posée automatiquement quand l'envoi du DOSSIER (Phase 2) réussit.
  //   invitation_envoyee  : date (AAAA-MM-JJ) posée automatiquement quand l'envoi de l'INVITATION (Phase 1) réussit.
  //   club_token          : jeton aléatoire unique (UUID) généré à l'ajout — sécurise l'accès à la
  //                         page publique de réponse (reponse-invitation.html?…&token=…).
  //   date_reponse        : date (AAAA-MM-JJ) de la réponse du club en libre-service (Accepté ou Décliné).
  //   nb_equipes_par_categorie : JSON du nb d'équipes engagées par catégorie ({"U8":2,"U10":1}).
  //   nb_joueurs_total    : total de joueurs attendus (entier, saisi par le club, informatif).
  // Les 5 premières colonnes gardent leur position (rétrocompatibilité des Sheets déjà en service) ;
  // les nouvelles sont ajoutées à droite (migration douce : assurerColonnesClubsInvites).
  //   alerte_ecart        : message posé quand la synchronisation n'a PAS pu retirer une équipe
  //                         excédentaire (créée à la main, en poule, ou dans des matchs générés) —
  //                         les équipes supprimables, elles, sont retirées automatiquement.
  //   detail_effectifs    : JSON par catégorie, une entrée PAR ÉQUIPE : {"U8":[{"j":8,"e":2},…]}
  //                         (j = joueurs, e = éducateurs) — déclaré par le club à la réponse (session 23).
  //   nb_educateurs_total : somme des éducateurs déclarés (calculée SERVEUR depuis detail_effectifs) ;
  //                         alimente la cascade B.3 de la demande d'autorisation.
  //   selection_enregistree : date (AAAA-MM-JJ) posée quand l'admin clique « Enregistrer la
  //                         sélection » ; EFFACÉE par toute nouvelle réponse du club (accepte ou
  //                         décline). C'est le drapeau ÉVÉNEMENTIEL des liserés d'état de l'admin :
  //                         réponse présente sans marque ⇒ carte orange « À enregistrer » (colonne
  //                         absente sur un vieux Sheet ⇒ pas de marque ⇒ orange : défaut prudent).
  ClubsInvites: ['club_nom', 'club_contact_nom', 'club_contact_email', 'statut', 'date_ajout',
                 'club_contact_prenom', 'categories_engagees', 'dossier_envoye', 'invitation_envoyee',
                 'club_token', 'date_reponse', 'nb_equipes_par_categorie', 'nb_joueurs_total',
                 'alerte_ecart', 'detail_effectifs', 'nb_educateurs_total', 'selection_enregistree'],
  // Colonnes 1-12 : historiques (matin + après-midi CROISE/LIBRE).
  // Colonnes 13-18 : format d'après-midi + tableau à élimination (COUPE_PLATEAU).
  //   format        : CROISE / LIBRE / COUPE_PLATEAU (recopié depuis la catégorie ; vide pour le matin)
  //   sous_tableau  : COUPE / PLATEAU (uniquement en COUPE_PLATEAU)
  //   tour          : libellé lisible du tour de bracket (FINALE, DEMI_FINALE, PETITE_FINALE…)
  //   match_suivant : id_match qui reçoit le VAINQUEUR de ce match (vide si terminal)
  //   place_suivant : A ou B — sur quel emplacement du match suivant placer le vainqueur
  //   vainqueur     : id_equipe DÉSIGNÉE vainqueur en cas d'égalité (départage manuel, COUPE)
  // Colonnes 19-26 : détail du score (session 12), UNIQUEMENT quand la catégorie tire au but
  //   (RefFFR_Regles.tir_au_but = OUI, ex. U14 à XV). Migration douce : ajoutées à droite, VIDES par
  //   défaut = comportement historique strictement inchangé (score_A/score_B saisis directement).
  //   Quand elles sont remplies, le backend CALCULE score_A/score_B (essai 5, transfo 2, pén. 3, drop 3) ;
  //   score_A/score_B restent la valeur unique qui sert au classement (barème V/N/D inchangé).
  // Colonne 27 : arbitre = id_equipe de l'équipe DÉSIGNÉE pour arbitrer ce match (Super Challenge :
  //   l'équipe qui ne joue pas la triangulaire/quadrangulaire). Migration douce, à droite. Vide sinon.
  Matchs: ['id_match', 'categorie', 'poule', 'terrain', 'heure_debut', 'heure_fin',
           'equipe_A', 'equipe_B', 'score_A', 'score_B', 'statut', 'phase',
           'format', 'sous_tableau', 'tour', 'match_suivant', 'place_suivant', 'vainqueur',
           'essais_A', 'essais_B', 'transfo_A', 'transfo_B', 'pen_A', 'pen_B', 'drop_A', 'drop_B',
           'arbitre'],
  // Journal de saison : un match terminé = une ligne, JAMAIS effacée par une génération.
  // On stocke les NOMS d'équipe (stables d'un tournoi à l'autre, contrairement aux id).
  Historique: ['date', 'tournoi_id', 'id_match', 'categorie', 'phase',
               'equipe_A', 'equipe_B', 'score_A', 'score_B'],
  // REGISTRE DES ÉDITIONS (M1-B2 / B2-1). Une ligne = une édition réelle du tournoi.
  // ⭐ C'est la SOURCE UNIQUE de l'identité durable d'une édition — `edition_id` ne vit
  //   nulle part ailleurs (surtout pas dans Config : il n'aurait alors ni cycle de vie,
  //   ni garantie d'unicité, et le reset l'effacerait comme n'importe quel réglage).
  //   edition_id     : UUID tiré une seule fois à l'OUVERTURE de l'édition. ⛔ Jamais réutilisé,
  //                    jamais renouvelé — ni par une régénération des poules, ni du planning,
  //                    ni par une modification d'équipes, ni par la publication, ni par un score.
  //                    ⚠️ À ne pas confondre avec `tournoi_id` (Config), qui reste ce qu'il est :
  //                    l'identifiant d'une GÉNÉRATION DE PLANNING, reposé à chaque génération.
  //   statut         : 'active' ou 'fermee'. ⭐ UNE SEULE ligne 'active' à la fois — plusieurs
  //                    actives est une ANOMALIE, jamais un choix à faire au hasard.
  //   date_creation  : horodatage de l'ouverture (yyyy-MM-dd HH:mm:ss, fuseau du classeur).
  //                    ⭐ C'est un INSTANT, pas une date civile (CLAUDE.md §8 sexies).
  //   date_fermeture : même format, posé à la fermeture ; vide tant que l'édition est active.
  // ⚠️ Toute colonne future (ex. le club organisateur) s'ajoutera À DROITE, migration douce,
  //   comme partout ailleurs dans ce fichier. ⛔ B2-1 ne crée AUCUN `club_id`.
  Editions: ['edition_id', 'statut', 'date_creation', 'date_fermeture'],
  // ─── M1-B2 / B2-2 — LE CARNET DURABLE (D-050 : « un club connu n'est pas un club invité »).
  //   Une ligne = l'IDENTITÉ d'un club, indépendante de toute édition. ⛔ Aucun statut, aucun
  //   jeton, aucun effectif : tout cela appartient à une PARTICIPATION, jamais au carnet.
  //   club_id   : UUID tiré une seule fois à la création. ⛔ Jamais réutilisé, jamais renouvelé —
  //               pas même si le club est renommé, ni s'il est désactivé puis réactivé. C'est ce
  //               qui permettra de dire « ce club est venu quatre fois » sans se tromper de club.
  //   actif     : 'oui' / 'non'. ⭐ SUPPRESSION LOGIQUE : retirer un club du tournoi courant ne
  //               détruit PAS son identité, sinon les éditions passées deviendraient orphelines.
  Clubs: ['club_id', 'club_nom', 'club_contact_nom', 'club_contact_prenom',
          'club_contact_email', 'date_ajout', 'actif'],
  // ─── M1-B2 / B2-2 — L'ENGAGEMENT D'UNE ÉDITION. Une ligne = (une édition, un club).
  //   ⭐ C'est la structure qui rend R-099 et R-100 IMPOSSIBLES : une donnée d'engagement ne
  //   peut plus « survivre à un reset », puisqu'elle appartient à une édition qui n'est plus
  //   l'active. ⛔ Il n'y a plus de liste de colonnes à vider — donc plus rien à oublier.
  //   Les 12 colonnes d'engagement gardent EXACTEMENT leurs noms d'avant : la couche
  //   d'adaptation reconstruit ainsi l'objet plat du frontend sans traduction (D-050).
  //   snap_*    : l'identité du club AU MOMENT DE L'INVITATION, figée au premier envoi principal
  //               réussi. ⭐ Renommer un club dans le carnet ne réécrit pas l'histoire.
  Participations: ['edition_id', 'club_id', 'statut', 'categories_engagees', 'dossier_envoye',
                   'invitation_envoyee', 'club_token', 'date_reponse', 'nb_equipes_par_categorie',
                   'nb_joueurs_total', 'alerte_ecart', 'detail_effectifs', 'nb_educateurs_total',
                   'selection_enregistree', 'snap_club_nom', 'snap_contact_nom',
                   'snap_contact_prenom', 'snap_contact_email'],
  // PARTENAIRES du tournoi, affichés sur la page publique des scores. Aucune donnée
  // personnelle : un partenaire est une entreprise, tout y est destiné à être public.
  //   logo_id      : id du fichier Drive du logo (public en lecture), comme tournoi_affiche_id.
  //   url          : site du partenaire (facultatif). Lien en rel="noopener sponsored".
  //   accroche     : une ligne affichée sous le logo (bandeau, encart, plein écran).
  //   emplacements : liste séparée par des virgules parmi bandeau,rail,fil,plein,mur,dossier
  //                  (= emplacements A à E de la page publique, F = bandeau du dossier club).
  //                  Vide ⇒ mur seul.
  //   poids        : 1 à 5 — part du partenaire dans la roue de rotation. Vide ⇒ 1.
  //   visuel_id    : id Drive d'un visuel plein écran fourni par le partenaire (facultatif) ;
  //                  sans lui, l'interstitiel se compose à partir du logo + accroche + couleur.
  //   couleur      : fond de l'interstitiel auto-composé (#RRGGBB). Vide ⇒ navy de la charte.
  //   actif        : 'oui' = affiché. Toute autre valeur ⇒ le partenaire disparaît de la page
  //                  sans que sa fiche soit perdue.
  //   ordre        : entier, position dans le mur des partenaires uniquement.
  //   reglages_emplacements : JSON des réglages PAR EMPLACEMENT, pour adapter le partenaire
  //                  à chaque encart : {"bandeau":{"texte":"…","zoom":130,"dispo":"gauche"}}.
  //                  Chaque clé est facultative et retombe sur le réglage général du
  //                  partenaire (accroche, logo_zoom) puis sur le défaut de l'emplacement.
  //                  Migration douce : colonne ajoutée à droite, vide = comportement d'origine.
  //   logo_zoom    : taille du logo en POURCENTAGE de la taille de référence (50 à 200 ;
  //                  vide ⇒ 100). Sert aux fichiers qui embarquent leurs propres marges
  //                  blanches : le logo y paraît petit alors que l'image, elle, est à la
  //                  bonne taille — seul un agrandissement au cas par cas le corrige.
  //                  Migration douce : ajoutée À DROITE, vide = comportement d'origine.
  Sponsors: ['id_sponsor', 'nom', 'logo_id', 'url', 'accroche', 'emplacements',
             'poids', 'visuel_id', 'couleur', 'actif', 'ordre', 'logo_zoom',
             'reglages_emplacements'],
  // RELEVÉS DE VISIBILITÉ des partenaires, déposés par les navigateurs des spectateurs.
  // Aucune donnée personnelle : deux identifiants ALÉATOIRES, tirés sur l'appareil, remis à
  // zéro chaque jour, qui ne permettent d'identifier personne ni de suivre qui que ce soit
  // d'un site à l'autre. Onglet ISOLÉ : aucune autre partie du logiciel ne le lit.
  //   appareil : identifiant aléatoire de l'appareil (compte la PORTÉE — combien de monde).
  //   session  : identifiant aléatoire de la visite (une par ouverture de page).
  //   donnees  : JSON des compteurs CUMULÉS de la session (exposition, affichages, clics).
  //
  // ⚠️ Les relevés sont CUMULATIFS et une session en dépose plusieurs au fil de la visite.
  // La consolidation prend donc le MAXIMUM par session, jamais la somme — c'est ce qui rend
  // le total juste même si un relevé se perd, ou s'il arrive deux fois.
  Mesures: ['horodatage', 'jour', 'appareil', 'session', 'donnees']
};
var COULEUR_FOND_ENTETE = '#0B2138';
var COULEUR_TEXTE_ENTETE = '#F2F6FB';

/* ⚠️ À ne lancer qu'une fois. Relancer réécrirait l'onglet Config avec les exemples. */
function setupSheet() {
  var classeur = SpreadsheetApp.openById(sheetId());
  creerOngletAvecEntetes(classeur, 'Equipes', ENTETES.Equipes);
  creerOngletAvecEntetes(classeur, 'Poules', ENTETES.Poules);
  creerOngletAvecEntetes(classeur, 'Matchs', ENTETES.Matchs);
  creerOngletAvecEntetes(classeur, 'Historique', ENTETES.Historique);
  creerOngletAvecEntetes(classeur, 'ClubsInvites', ENTETES.ClubsInvites);
  creerOngletAvecEntetes(classeur, 'Sponsors', ENTETES.Sponsors);
  creerOngletAvecEntetes(classeur, 'Editions', ENTETES.Editions);
  creerOngletConfig(classeur);
  // M1-B2 / B2-1 — un classeur neuf part avec UNE édition ouverte : sans elle, rien de ce qui
  // sera créé ensuite n'aurait d'édition à laquelle se rattacher. ⭐ Idempotent : si une édition
  // est déjà active (setupSheet rejoué par mégarde), ⛔ aucun doublon n'est créé.
  ouvrirEditionSiAucune(classeur);
  // R-110 — même défaut conceptuel que les deux migrations : une alerte PUREMENT INFORMATIVE
  // en fin de fonction de maintenance, qui attendait un clic. ⛔ Aucun `return` ici : la valeur
  // de retour de `setupSheet` reste `undefined`, exactement comme avant.
  retourMaintenance('✅ Base prête ! Les 8 onglets ont été créés.');
}

/**
 * Crée l'onglet Sponsors À LA DEMANDE s'il manque. `setupSheet` ne se relance jamais sur un
 * classeur en service (il réécrirait Config) : sans ce filet, un Sheet créé avant les
 * partenaires n'aurait jamais l'onglet et toute écriture échouerait. Sans effet s'il existe.
 */
function assurerOngletSponsors(classeur) {
  var onglet = classeur.getSheetByName('Sponsors');
  if (!onglet) {
    creerOngletAvecEntetes(classeur, 'Sponsors', ENTETES.Sponsors);
    return classeur.getSheetByName('Sponsors');
  }

  // MIGRATION DOUCE des colonnes ajoutées après coup (elles le sont toujours À DROITE).
  // Sans ça, une nouvelle colonne serait écrite dans une cellule SANS EN-TÊTE — et
  // `lireOngletSimple` ignore les colonnes sans en-tête : la valeur partirait dans le
  // Sheet pour n'être jamais relue, en silence. On complète donc la ligne d'en-tête.
  var largeur = ENTETES.Sponsors.length;
  if (onglet.getMaxColumns() < largeur) {
    onglet.insertColumnsAfter(onglet.getMaxColumns(), largeur - onglet.getMaxColumns());
  }
  var entetes = onglet.getRange(1, 1, 1, largeur).getValues()[0];
  var manque = false;
  for (var i = 0; i < largeur; i++) {
    if (String(entetes[i]) !== ENTETES.Sponsors[i]) { manque = true; break; }
  }
  if (manque) {
    var zone = onglet.getRange(1, 1, 1, largeur);
    zone.setValues([ENTETES.Sponsors]);
    stylerEntete(zone);
  }
  return onglet;
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
    ['marge_fin_communiquee_min', '75'],
    // Phase 1 (invitation légère) — « Sur place » : pastilles affichées seulement si 'oui'.
    ['buvette_disponible', 'non'],
    ['espace_sandwich_disponible', 'non'],
    ['boutique_disponible', 'non'],
    // Page interne « Perfs du club » : mot-clé qui identifie une équipe du club ORGANISATEUR
    // dans son nom (casse ignorée, espaces de début et de fin retirés). VIDE par défaut, et c'est délibéré : l'app ne
    // présume d'aucun club. Tant qu'il est vide, la page Perfs ne calcule RIEN et le dit.
    ['perfs_mot_cle_club', ''],
    // Phase 1 — « Réponse à l'invitation » : date limite de RÉPONSE (distincte de
    // date_limite_confirmation, propre aux effectifs de la Phase 2) + contact référent.
    ['date_limite_reponse', ''],
    ['contact_reponse_nom', ''],
    ['contact_reponse_tel', ''],
    ['contact_reponse_email', ''],
    // Adresse « Envoyer en tant que » (alias Gmail du compte exécutant). Vide = l'email
    // part de l'adresse du compte qui exécute le script (romain.rifleu@gmail.com en test).
    ['email_expediteur', ''],
    // Zone de vacances scolaires (contrôle de conformité FFR). Défaut 'C' (Île-de-France).
    // Migration douce : si le paramètre est absent d'un Sheet en service, il est traité comme 'C'.
    ['zone_vacances', 'C'],
    // Nombre de demi-journées du tournoi (grille de temps FFR). Défaut 2 : un tournoi matin +
    // après-midi occupe DEUX demi-journées (Q23 close par le directeur EDR du Racing, 27/07/2026 ;
    // corroboré par le pied des fiches FFR « Si 3 demi-journées, temps de jeu = 100 minutes »).
    // Migration douce : absent ⇒ traité comme 2 (§4.6). Ne modifie AUCUNE valeur déjà saisie.
    ['nb_demi_journees', '2'],
    // ── Demande d'autorisation de tournoi EDR (session 7) — feuille de report du formulaire FFR.
    // Données PERSONNELLES (noms/tels/mails du représentant et du président) : PRIVÉES par défaut
    // (jamais dans CONFIG_PUBLIQUE_VUES). N'inventer AUCUNE valeur : un champ vide reste « manquant ».
    // A.1 Organisateur — le club affilié détenteur du label EDR se SAISIT ; l'app n'en présume
    // aucun. Vide ⇒ le champ reste « manquant » sur la feuille de report, et le champ du PDF
    // fédéral reste éditable. Représentant, président et référent jour J sont TROIS rôles
    // distincts : ne pas réutiliser referent_nom ici.
    ['org_club_nom', ''], ['org_code_club', ''],
    ['org_representant_nom', ''], ['org_representant_tel', ''], ['org_representant_mail', ''],
    ['org_president_nom', ''], ['org_president_tel', ''], ['org_president_mail', ''],
    ['org_label_edr', 'oui'], ['org_label_date', ''],
    // A.2 Niveau du tournoi (liste fermée) · A.4 équipes étrangères + nombre de participants.
    // org_nb_participants : saisi, utilisé UNIQUEMENT en repli quand aucun club n'a déclaré ses
    // effectifs (équipes saisies à la main, hors circuit d'invitation). Jamais estimé (§4.2).
    ['org_niveau_tournoi', ''], ['org_equipes_etrangeres', 'non'], ['org_equipes_etrangeres_liste', ''],
    ['org_nb_participants', ''],
    // B.1 Installations
    ['org_type_terrain', ''], ['org_nb_vestiaires', ''],
    // B.3 Arbitrage (compteurs GLOBAUX ; distincts d'arbitrage_organisation, texte par catégorie)
    // org_nb_educateurs_club = encadrants du club ORGANISATEUR (le Racing ne s'invite pas lui-même,
    // ses éducateurs ne sont donc dans aucune réponse d'invitation) : s'AJOUTE à la somme déclarée.
    ['org_nb_arbitres', ''], ['org_nb_educateurs', ''], ['org_nb_educateurs_club', ''],
    ['org_nb_doublettes', ''],
    // B.4 Sécurité — médecin / antenne de secours (nom+tel STRUCTURÉS, jamais parsés) / ambulance.
    // securite_referent_* et securite_secours_oui sont RÉUTILISÉS ; org_secours_nom/_tel sont neufs.
    ['org_medecin_oui', ''], ['org_medecin_nom', ''], ['org_medecin_tel', ''],
    ['org_secours_nom', ''], ['org_secours_tel', ''], ['org_ambulance', ''],
    // B.5 Logistique
    ['org_droits_oui', ''], ['org_droits_montant', ''],
    ['org_hebergement_oui', ''], ['org_hebergement_structure', ''],
    ['org_repas_oui', ''], ['org_repas_fournisseur', ''], ['org_repas_prix', ''],
    ['org_gouters_oui', ''], ['org_gouters_fournisseur', ''], ['org_gouters_prix', '']
  ];
  var titreZoneB = zoneA.length + 2;
  var ligneDebutZoneB = zoneA.length + 3;
  // nb_poules : vide = Auto (calculé selon le nombre d'équipes) ; un nombre = forcé.
  // format_apresmidi : CROISE / CROISE_DIAGONAL / POULES_NIVEAU / LIBRE / COUPE_PLATEAU (vide = CROISE, historique).
  // param_format : JSON court des réglages du format (ex COUPE_PLATEAU : {"nbQualifiesCoupe":2}).
  // terrains_auto : oui = terrains attribués via l'onglet Terrains (défaut) ; non = saisie manuelle.
  // reglement : texte libre OU URL (une valeur commençant par « http » sera affichée en lien).
  // effectif_min / effectif_max : nombre de joueurs par équipe (dossier club) — optionnels.
  // arbitrage_organisation : qui arbitre (« arbitrage » seul est déjà pris par l'assistant horaires).
  // max_equipes_par_club : nombre max d'équipes qu'un club peut engager dans cette catégorie
  //   (Phase 1). Vide = illimité (« Plusieurs équipes possibles par catégorie »).
  // forme_jeu : forme de jeu FFR RETENUE par l'organisateur pour cette catégorie (ex. « RE — 15x15 »).
  //   Migration douce : ajoutée À DROITE, VIDE = comportement historique inchangé (« non précisée »).
  //   Sert à LEVER l'ambiguïté quand la catégorie a plusieurs formes le même mois (ex. U14 10x10|15x15).
  // contexte_tournoi : contexte de jeu retenu pour une catégorie U14 — VIDE ou 'LAMBDA' = tournoi
  //   ordinaire (comportement historique inchangé) ; 'SCF' = Super Challenge de France. Migration
  //   douce, à DROITE. Ne concerne QUE l'U14 (catégorie FFR M14) ; ignoré pour les autres.
  // scf_phase : phase du Super Challenge quand contexte_tournoi = 'SCF' — 'P2' (phase 2 : 1 journée,
  //   triangulaire/quadrangulaire, 2×15) ou 'P3' (phase 3 & clôture : 2 journées, triangulaire, 2×11).
  //   VIDE = 'P2' (défaut prudent). CES DEUX COLONNES SONT CONSOMMÉES par la génération (session 14) :
  //   `calculerPlanning` regroupe en triangulaires/quadrangulaires (via contexteScfCategorie), et la
  //   durée de match est IMPOSÉE par `dureeMatchScf` — 2×15 (P2) ou 2×11 (P3), plus pause_mi_temps_min.
  //   ⚠️ Là où `dureeMatchScf` s'applique, duree_mi_temps_min de la catégorie n'est PAS lue.
  // pause_echelonnee : 'oui' = la catégorie joue en un round-robin planifié en 2 vagues avec repos
  //   échelonné (≥ 60 min garanti, équité) au lieu d'une pause déjeuner globale. Vide/'non' = mode
  //   classique (historique). Migration douce, à droite. Seuil : dès 4 équipes, effectif pair OU
  //   impair (les vagues inégales sont gérées par un bye) ; en dessous, repli + avertissement.
  var entetesCategorie = ['categorie', 'presente', 'terrains', 'terrains_auto', 'nb_poules',
    'format_mi_temps', 'duree_mi_temps_min', 'pause_mi_temps_min', 'recup_entre_matchs_min',
    'format_apresmidi', 'param_format',
    'reglement', 'effectif_min', 'effectif_max', 'arbitrage_organisation', 'max_equipes_par_club',
    'forme_jeu', 'contexte_tournoi', 'scf_phase', 'pause_echelonnee'];
  var exemplesCategorie = [
    ['U8',  'oui', '1,2', 'oui', '', '2', '8',  '2', '15', 'LIBRE',         '', '', '', '', '', '', '', '', '', ''],
    ['U10', 'oui', '3,4', 'oui', '', '2', '10', '2', '15', 'CROISE',        '', '', '', '', '', '', '', '', '', ''],
    ['U12', 'oui', '5,6', 'oui', '', '2', '12', '3', '15', 'CROISE',        '', '', '', '', '', '', '', '', '', ''],
    ['U14', 'oui', '7,8', 'oui', '', '2', '15', '3', '20', 'CROISE',        '', '', '', '', '', '', '', '', '', '']
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
    // MASSIF (page publique, milliers de spectateurs) : servi du cache, il économise cette
    // ouverture. ⚠️ MESURÉ (journal « Exécutions », 2026-08-05, 128 appels réels) : l'appel occupe
    // malgré tout le serveur ~1,65 s, dont ~1,59 s de démarrage Apps Script INCOMPRESSIBLE — le
    // cache ne coûte donc que ~0,06 s, mais « quelques millisecondes » serait FAUX. Plus chaque
    // requête est courte, plus le plafond Apps Script (~30 exécutions simultanées) se libère
    // vite → la même Web App encaisse bien plus de monde.
    if (action === 'ping') return repondreJson({ ok: true, message: 'API tournoi en ligne' });
    // getAll : copie mise en cache ~10 s. Un seul lecteur relit le Sheet par tranche, les
    // autres reçoivent la copie instantanément. Le cache est rafraîchi à chaque écriture.
    if (action === 'getAll') {
      return ContentService.createTextOutput(snapshotJsonCache())
        .setMimeType(ContentService.MimeType.JSON);
    }
    // getRefFFR : référentiel FFR public (aucune donnée personnelle), servi par SON PROPRE
    // cache (clé `refffr_json`, ~10 s) — sans jamais toucher à getAll ni à son cache.
    if (action === 'getRefFFR') {
      return ContentService.createTextOutput(refFFRJsonCache())
        .setMimeType(ContentService.MimeType.JSON);
    }

    var classeur = SpreadsheetApp.openById(sheetId());
    var resultat;
    switch (action) {
      // getConfig est PUBLIC (page vitrine) → vue INVITATION filtrée, jamais lireConfig brut.
      case 'getConfig':  resultat = lireConfigPublique(classeur, 'invitation'); break;
      case 'getEquipes': resultat = lireOngletSimple(classeur, 'Equipes'); break;
      case 'getPoules':  resultat = lireOngletSimple(classeur, 'Poules'); break;
      case 'getMatchs':  resultat = lireOngletSimple(classeur, 'Matchs'); break;
      case 'getClassement': resultat = calculerClassement(classeur); break;
      case 'getHistorique': resultat = lireHistorique(classeur); break;
      // Lecture PUBLIQUE réservée au dossier Phase 2 (dossier-club.html?club=…) : ne renvoie
      // QUE des champs non sensibles (nom, prénom, catégories engagées) — JAMAIS l'email.
      // Dossier club : désormais PROTÉGÉ PAR JETON (comme getReponseInvitation) — exige club + token.
      case 'getClubDossier': resultat = getClubDossier(classeur, params); break;
      // Config du dossier club (contacts jour J, logistique, secours, tarifs) : PROTÉGÉE PAR JETON.
      case 'getConfigClub': resultat = getConfigClub(classeur, params); break;
      // Lecture PUBLIQUE de la page de réponse : validée par le JETON du club (pas de clé admin).
      case 'getReponseInvitation': resultat = getReponseInvitation(classeur, params); break;
      // Conformité FFR pour une date + catégories + zone (informatif, aucune donnée personnelle).
      case 'getConformiteFFR': resultat = getConformiteFFR(classeur, params); break;
      // Jours compatibles FFR d'un mois donné (week-ends + mercredis) : pour chaque jour, statut
      // compatible / vigilance / conflit / hors-couverture. Informatif, aucune donnée personnelle.
      case 'datesCompatiblesFFR': resultat = datesCompatiblesFFR(classeur, params); break;
      // Capacités de saisie par catégorie (tir au but oui/non) : lu du référentiel FFR pour la date
      // et la forme retenue du tournoi. PUBLIC (aucune donnée personnelle) — sert saisie.html.
      case 'getCapacitesCategories': resultat = getCapacitesCategories(classeur); break;
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

/** Instantané des données publiques (action getAll). Config filtrée par la vue LIVE (liste
 *  blanche opt-in) : la page des scores, à forte charge, ne reçoit que le strict nécessaire —
 *  jamais de contact ni de donnée personnelle. */
function construireSnapshot(classeur) {
  return {
    config:   lireConfigPublique(classeur, 'live'),
    equipes:  lireOngletSimple(classeur, 'Equipes'),
    poules:   lireOngletSimple(classeur, 'Poules'),
    matchs:   lireOngletSimple(classeur, 'Matchs'),
    // Partenaires ACTIFS uniquement (≈ 200 octets par fiche) : ils voyagent dans l'instantané
    // déjà servi par le relais CDN, donc la page publique n'émet AUCUNE requête réseau de plus.
    sponsors: lireSponsorsPublics(classeur)
  };
}

/* ===================== PARTENAIRES (sponsors de la page publique) =====================
 * Aucune donnée personnelle : un partenaire est une entreprise et tout, ici, est destiné à
 * être affiché. On applique quand même la doctrine opt-in du reste du fichier — seules les
 * colonnes nommées ci-dessous sortent, une colonne ajoutée plus tard reste privée par défaut.
 * ==================================================================================== */

/** Colonnes de l'onglet Sponsors réellement servies à la page publique. */
var SPONSOR_CHAMPS_PUBLICS = ['id_sponsor', 'nom', 'logo_id', 'url', 'accroche',
                              'emplacements', 'poids', 'visuel_id', 'couleur', 'ordre',
                              'logo_zoom', 'reglages_emplacements'];

/**
 * Partenaires actifs, prêts pour l'affichage public : filtrés sur `actif`, réduits aux
 * colonnes publiques, triés par `ordre` (le mur des partenaires suit cet ordre).
 * Renvoie [] si l'onglet n'existe pas encore — un Sheet d'avant les partenaires reste valide.
 */
function lireSponsorsPublics(classeur) {
  var lignes = lireOngletSimple(classeur, 'Sponsors');
  var actifs = [];
  for (var i = 0; i < lignes.length; i++) {
    var l = lignes[i];
    if (String(l.actif || '').toLowerCase() !== 'oui') continue;
    if (!String(l.id_sponsor || '').trim()) continue;
    var s = {};
    for (var c = 0; c < SPONSOR_CHAMPS_PUBLICS.length; c++) {
      var champ = SPONSOR_CHAMPS_PUBLICS[c];
      s[champ] = (l[champ] === null || l[champ] === undefined) ? '' : String(l[champ]);
    }
    actifs.push(s);
  }
  actifs.sort(function (a, b) {
    var oa = parseInt(a.ordre, 10), ob = parseInt(b.ordre, 10);
    if (!isFinite(oa)) oa = 9999;
    if (!isFinite(ob)) ob = 9999;
    if (oa !== ob) return oa - ob;
    return String(a.nom).localeCompare(String(b.nom));
  });
  return actifs;
}

/**
 * getAll mis en CACHE (~10 s) : gros gain de capacité pour la page publique. Un seul
 * appel par tranche de 10 s relit le Sheet ; les autres reçoivent la copie en mémoire.
 * Renvoie directement la CHAÎNE JSON (pas de re-sérialisation).
 *
 * Le classeur n'est ouvert (openById ≈ 0,5 s) QUE si le cache est vide : le cas courant
 * (cache chaud) sert la copie sans toucher au Sheet. ⚠️ Ce que ça NE veut PAS dire : mesuré
 * le 2026-08-05 (journal « Exécutions »), un appel cache chaud occupe quand même le serveur
 * ~1,65 s, contre ~1,59 s pour `ping` qui n'exécute RIEN. Le cache est excellent (~0,06 s pour
 * servir tout le tournoi), mais le démarrage Apps Script est INCOMPRESSIBLE : la capacité se
 * compte en dizaines/centaines de lecteurs simultanés, pas en milliers.
 *
 * ANTI-POINTE (« cache stampede ») : à l'expiration du cache, des DIZAINES de spectateurs
 * pourraient relire le Sheet en même temps et saturer d'un coup le plafond d'exécutions
 * simultanées. On élit donc UN « reconstructeur » via un jeton court (`snapshot_regen`) ;
 * pendant qu'il relit le Sheet, les autres reçoivent la copie de SECOURS (les mêmes
 * données, gardées plus longtemps — au pire ~10 s de retard, invisible pour du live).
 */
function snapshotJsonCache() {
  // Clés VERSIONNÉES (`_v3`) : le contenu de getAll change à chaque évolution de la vue LIVE.
  // Sans nouvelle clé, la copie de SECOURS gardée 6 h continuerait à servir l'ANCIEN snapshot
  // jusqu'à 6 h APRÈS le déploiement. Le versionnement rend l'ancien cache inaccessible : dès
  // le déploiement, seule la nouvelle vue est servie.
  //   `_v2` (2026) : la config est passée en vue LIVE filtrée (contacts retirés).
  //   `_v3` (2026-08-22) : ajout de `perfs_mot_cle_club` — sans ce saut, la page Perfs aurait
  //                        conclu « mot-clé non configuré » pendant 6 h après le redéploiement.
  var cache = CacheService.getScriptCache();
  var s = cache.get('snapshot_json_v3');
  if (s) return s;

  // Cache expiré. Quelqu'un reconstruit déjà ? → on sert la copie de secours sans attendre.
  var secours = cache.get('snapshot_json_secours_v3');
  if (secours && cache.get('snapshot_regen')) return secours;

  // On devient LE reconstructeur : jeton posé ~15 s (filet si la reconstruction échoue).
  try { cache.put('snapshot_regen', '1', 15); } catch (e) {}
  s = JSON.stringify(construireSnapshot(SpreadsheetApp.openById(sheetId())));
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
    // Marge sous 100 Ko. On mesure les OCTETS UTF-8 réels (Utilities.newBlob), pas json.length :
    // un « é » compte 1 en .length mais 2 octets. Avec des noms d'équipes/clubs accentués, le
    // snapshot pouvait dépasser 100 Ko réels alors que .length < 95000 → put() échouait en
    // silence → cache jamais rempli → chaque getAll relisait le Sheet (saturation).
    var octets = Utilities.newBlob(json).getBytes().length;
    if (octets < 95000) {
      cache.put('snapshot_json_v3', json, 10);             // copie fraîche (10 s)
      cache.put('snapshot_json_secours_v3', json, 21600);  // copie de secours (6 h, le max)
    }
  } catch (e) { /* cache indisponible : on ignore, getAll relira le Sheet */ }
}

/**
 * Après une écriture réussie : rafraîchit le cache serveur (les spectateurs voient le
 * changement dès leur prochain appel) et RENVOIE le snapshot JSON. Le push vers le relais CDN
 * est fait ENSUITE par doPost, APRÈS avoir relâché le verrou : la latence réseau du relais ne
 * doit pas prolonger la détention du verrou (sinon elle sérialise les écritures concurrentes).
 * On ne construit le snapshot QU'UNE fois (partagé entre le cache et le relais).
 * @return {string|null} le snapshot JSON (à passer à pousserSnapshot), ou null si échec.
 */
function apresEcriture(classeur) {
  try {
    var json = JSON.stringify(construireSnapshot(classeur));
    mettreEnCacheSnapshot(CacheService.getScriptCache(), json);
    return json; // le push CDN est fait ENSUITE par doPost, hors du verrou
  } catch (err) { return null; } // jamais bloquer l'écriture
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

/* Paramètres RENOMMÉS : ancienne clé du classeur → clé canonique d'aujourd'hui.
 * Une seule entrée à ce jour ; la table existe pour que le mécanisme soit lisible et testable. */
var ALIAS_CONFIG_LEGACY = { boutique_disponible: 'boutique_r92_disponible' };

/**
 * MIGRATION DOUCE d'un paramètre RENOMMÉ, appliquée à la LECTURE — pas à l'écriture.
 *
 * ⚠️ Pourquoi ce mécanisme existe, et pourquoi il est indispensable : renommer un paramètre
 * ne renomme PAS la ligne déjà présente dans l'onglet Config d'un classeur en service. Sans
 * cette reprise, la nouvelle clé serait absente, `estOui(undefined)` vaudrait faux, et le
 * réglage de l'organisateur disparaîtrait SANS AUCUN MESSAGE — une perte silencieuse.
 *
 * Règle : la clé canonique gagne TOUJOURS dès qu'elle porte une valeur. L'ancienne n'est lue
 * qu'en repli, et n'est JAMAIS réécrite : au premier enregistrement, `ecrireParamsGlobaux`
 * crée la ligne canonique et l'ancienne devient une simple donnée dormante.
 *
 * ⛔ Ne sert PAS à exposer l'ancienne clé : elle ne figure dans aucune liste blanche publique.
 * PUR (aucun accès au classeur) : testable. Modifie `global` sur place et le renvoie.
 */
function appliquerAliasConfig(global) {
  global = global || {};
  Object.keys(ALIAS_CONFIG_LEGACY).forEach(function (canonique) {
    var ancienne = ALIAS_CONFIG_LEGACY[canonique];
    // ⚠️ PRÉSENTE fait foi, MÊME VIDE — et cette nuance n'est pas un détail : une ligne canonique
    // vide est une valeur EFFACÉE (réinitialisation d'un tournoi), pas une valeur absente. Sans
    // cette distinction, la réinitialisation serait annulée par le repli et le réglage
    // ressusciterait à l'édition suivante. Seule l'ABSENCE de ligne déclenche la reprise.
    if (Object.prototype.hasOwnProperty.call(global, canonique)) return;
    if (!Object.prototype.hasOwnProperty.call(global, ancienne)) return;    // rien à reprendre
    global[canonique] = global[ancienne];
  });
  return global;
}

/**
 * ⚠️ USAGE INTERNE UNIQUEMENT (actions protégées par la clé admin). NE JAMAIS renvoyer ce
 * résultat à un appelant NON AUTHENTIFIÉ : la zone A de Config contient des données personnelles
 * (referent_nom/tel, securite_referent_*, contact_reponse_*, email_expediteur). Pour toute
 * lecture PUBLIQUE, passer OBLIGATOIREMENT par `lireConfigPublique` (liste blanche opt-in).
 */
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
  appliquerAliasConfig(global);
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

/**
 * Crée l'onglet Mesures À LA DEMANDE s'il manque (même logique qu'assurerOngletSponsors :
 * un classeur en service ne se re-`setupSheet` jamais). Sans effet s'il existe déjà.
 */
function assurerOngletMesures(classeur) {
  var onglet = classeur.getSheetByName('Mesures');
  if (!onglet) {
    creerOngletAvecEntetes(classeur, 'Mesures', ENTETES.Mesures);
    onglet = classeur.getSheetByName('Mesures');
    // Tout en TEXTE, comme l'onglet Config. Sans ça, Google Sheets reconnaît « 2026-08-03 »
    // et convertit la cellule en vraie date : la relecture reçoit alors un objet Date au lieu
    // de la chaîne écrite, et le filtrage par journée ne trouve plus rien (cf. mesureJourTexte,
    // qui reste le filet de sécurité pour les lignes déjà écrites).
    onglet.getRange(1, 1, onglet.getMaxRows(), ENTETES.Mesures.length).setNumberFormat('@');
  }
  return onglet;
}

/* ===================== CONFIG PUBLIQUE (listes blanches OPT-IN) =====================
 * PRINCIPE NON NÉGOCIABLE : « rien ne sort sauf ce qui est nommément autorisé » (opt-in), et
 * non « tout sort sauf ce qu'on pense à retirer » (opt-out). Un paramètre ajouté dans Config
 * plus tard est donc PRIVÉ PAR DÉFAUT — personne n'a à y penser. `lireConfig` (ci-dessus) reste
 * réservée à l'usage interne authentifié ; toute lecture publique passe par `lireConfigPublique`.
 *
 * Trois vues, déclarées CÔTE À CÔTE pour se lire d'un coup d'œil :
 *   - live       : servie par getAll (page des scores, forte charge) — la plus MINIMALE ;
 *   - invitation : servie par getConfig (page vitrine publique) — sans téléphone (décision S3) ;
 *   - club       : servie par getConfigClub (dossier, PROTÉGÉ PAR JETON) — contacts jour J inclus.
 * Une vue inconnue retombe sur `live` (la plus fermée) : le défaut est FERMÉ.
 * ================================================================================== */
var CONFIG_PUBLIQUE_VUES = {
  // Page des scores : le strict nécessaire. Aucune donnée personnelle, aucun réglage d'édition.
  live: {
    // Réglages PARTENAIRES : ce sont des consignes d'affichage (durées, interrupteurs), sans
    // aucune donnée personnelle — la page publique en a besoin pour rendre les emplacements.
    // Ils DOIVENT figurer ici : la config publique est en opt-in strict, un paramètre non
    // nommé ne sort pas et la page conclurait « sponsors désactivés » en silence.
    // perfs_mot_cle_club : simple mot-clé de nommage, AUCUNE donnée personnelle. Il DOIT être
    // ici — la page interne « Perfs du club » ne lit que getAll (vue live) et n'a pas de clé ;
    // absent de cette liste, il ne sortirait jamais et la page se dirait « non configurée ».
    global: ['tournoi_publie', 'tournoi_nom', 'repartition_grands_terrains', 'perfs_mot_cle_club',
             'sponsors_actifs', 'sponsors_mur_actif', 'sponsor_barre_mobile',
             'sponsor_rotation_s', 'sponsor_interstitiel_actif', 'sponsor_interstitiel_duree_s',
             'sponsor_interstitiel_skip_s', 'sponsor_interstitiel_repos_min',
             'sponsor_interstitiel_premiere_visite'],
    // contexte_tournoi / scf_phase : NON sensibles (format de jeu) — exposés pour que la saisie et la
    // page publique affichent le bon vocabulaire Super Challenge (Samedi/Dimanche, Triangulaire, E/F/G).
    categories: ['categorie', 'presente', 'contexte_tournoi', 'scf_phase']
  },
  // Page d'invitation (vitrine publique). contact_reponse_email/nom OUI ; contact_reponse_tel NON
  // (le portable d'un bénévole n'a rien à faire sur une page mise en avant — décision 1.3, S3).
  // Refonte vitrine : l'invitation présente désormais le CADRE SPORTIF complet par catégorie
  // (temps de jeu, pauses, forme FFR, effectifs) et le déroulé horaire de la journée. Tous ces
  // champs sont des FAITS DE FORMAT ou d'HORAIRE, sans aucune donnée personnelle — le programme
  // d'un tournoi est public par nature. Restent derrière le jeton (vue club) : adresse précise,
  // parking, secours, téléphones — tout ce qui relève de la logistique jour J.
  // ⛔ `tournoi_publie` N'EST PLUS dans cette liste, et c'est le sens même de la doctrine
  // « publier ne parle à personne » (D-048, coupure M1-PUB / PUB-4) : publier un tournoi écrit une
  // ligne dans Config et n'informe AUCUN site tiers. Le site de l'association (boutique-r92)
  // n'interroge plus ce serveur du tout — sa page « Tournoi » est statique et son annonce reste
  // éditoriale et manuelle. ⚠️ Le témoin reste exposé par la vue `live` (getAll), et c'est là,
  // et seulement là, qu'il doit rester : la page publique du tournoi (frontend/js/tournoi.js)
  // ne lit QUE cette vue. Le retirer de `live` casserait cette page en silence.
  invitation: {
    global: [
      'tournoi_nom', 'tournoi_description', 'tournoi_affiche_id', 'tournoi_date', 'tournoi_lieu',
      'heure_rdv', 'heure_debut', 'pause_dejeuner_debut', 'pause_dejeuner_duree_min',
      'heure_fin', 'heure_fin_communiquee', 'marge_fin_communiquee_min',
      'buvette_disponible', 'espace_sandwich_disponible', 'boutique_disponible',
      'tarif_engagement_oui', 'tarif_engagement_montant', 'date_limite_reponse',
      'url_instagram', 'url_site_association',
      'contact_reponse_nom', 'contact_reponse_email'],
    // format_apresmidi (session 20) : NON sensible (format de jeu, déjà exposé par la vue live) —
    // sert à la note « pourquoi ce format » de l'invitation (doctrine FFR, poules de niveau).
    // forme_jeu / contexte_tournoi / scf_phase : forme FFR retenue et contexte Super Challenge —
    // déjà publics (vue live pour SCF) ; les temps (mi-temps, pauses, récup) et effectifs viennent
    // de la vue club, sans donnée personnelle. `terrains` et `pause_echelonnee` restent internes.
    categories: ['categorie', 'presente', 'effectif_min', 'effectif_max', 'max_equipes_par_club',
                 'arbitrage_organisation', 'format_apresmidi', 'format_mi_temps', 'duree_mi_temps_min',
                 'pause_mi_temps_min', 'recup_entre_matchs_min', 'forme_jeu',
                 'contexte_tournoi', 'scf_phase', 'reglement']
  },
  // Dossier club (PROTÉGÉ PAR JETON) : le club invité voit les contacts jour J (referent_tel en
  // lien cliquable tel:), la logistique, les secours, les tarifs. Légitime car derrière le jeton.
  club: {
    global: ['tournoi_nom', 'tournoi_date', 'tournoi_lieu', 'tournoi_adresse', 'tournoi_description',
             'tournoi_affiche_id', 'url_tournoi_public', 'repartition_grands_terrains',
             // Témoin de publication du planning : le dossier n'affiche poules et matchs QUE si
             // l'organisateur les a explicitement rendus visibles (voir publierPlanningClubs).
             'planning_visible_clubs',
             'heure_debut', 'heure_rdv', 'pause_dejeuner_debut', 'pause_dejeuner_duree_min',
             'heure_fin', 'heure_fin_communiquee', 'marge_fin_communiquee_min',
             'logistique_parking', 'logistique_buvette', 'logistique_vestiaires',
             'parking_texte', 'parking_photo_id',
             'tarif_engagement_oui', 'tarif_engagement_montant', 'tarif_engagement_modalites',
             'date_limite_confirmation', 'assurance_attestation_requise',
             'encadrement_ratio', 'encadrement_diplomes', 'table_marque_organisation',
             'securite_secours_oui', 'securite_secours_precisions',
             'securite_referent_identique', 'securite_referent_nom', 'securite_referent_tel',
             'referent_nom', 'referent_tel'],
    categories: ['categorie', 'presente', 'format_apresmidi', 'format_mi_temps', 'duree_mi_temps_min',
                 'pause_mi_temps_min', 'recup_entre_matchs_min', 'effectif_min', 'effectif_max',
                 'reglement', 'arbitrage_organisation', 'terrains']
  }
};

/**
 * Cœur PUR et testable : filtre un objet config { global, categories } selon la vue demandée.
 * N'accède à AUCUN classeur (le config est injecté) — testé par backend/Tests.gs. Un champ
 * absent de la liste de la vue NE SORT PAS, quelle qu'en soit la raison. Vue inconnue ⇒ `live`.
 */
function filtrerConfigPublique(config, vue) {
  var v = CONFIG_PUBLIQUE_VUES[vue] || CONFIG_PUBLIQUE_VUES.live; // défaut FERMÉ (le plus restrictif)
  config = config || {};
  var gIn = config.global || {};
  var gOut = {};
  v.global.forEach(function (k) {
    if (Object.prototype.hasOwnProperty.call(gIn, k)) gOut[k] = gIn[k];
  });
  var catsOut = (config.categories || []).map(function (c) {
    var o = {};
    v.categories.forEach(function (k) {
      if (c && Object.prototype.hasOwnProperty.call(c, k)) o[k] = c[k];
    });
    return o;
  });
  return { global: gOut, categories: catsOut };
}

/** SEUL point de sortie de la config vers l'extérieur : lit le classeur puis applique la vue. */
function lireConfigPublique(classeur, vue) {
  return filtrerConfigPublique(lireConfig(classeur), vue);
}

/* ===================== RÉFÉRENTIEL FFR (RefFFR_Formes / RefFFR_Dates) =====================
 * Deux onglets de RÉFÉRENCE (calendrier FFR École de Rugby 2026-2027) lus en PUBLIC :
 * ils ne contiennent AUCUNE donnée personnelle. Lecture par NOM d'en-tête (lireOngletSimple),
 * jamais par index de colonne.
 *
 * MIGRATION DOUCE TOTALE (non négociable) : si un onglet est absent, vide ou illisible, la
 * lecture renvoie [] (jamais d'exception) et toute la chaîne de conformité se met en repli
 * (refDisponible:false, listes vides). L'app continue de fonctionner exactement comme avant.
 * ======================================================================================== */

/** Premier millésime non vide trouvé dans un tableau de lignes de référence (ou null). */
function millesimeRefFFR(lignes) {
  for (var i = 0; i < lignes.length; i++) {
    var m = lignes[i] && lignes[i].millesime;
    if (m != null && String(m).trim() !== '') return String(m).trim();
  }
  return null;
}

/** Lecture de l'onglet RefFFR_Formes → tableau d'objets ; [] si l'onglet est absent/illisible. */
function lireRefFFRFormes(classeur) {
  try { return lireOngletSimple(classeur, 'RefFFR_Formes'); } catch (e) { return []; }
}

/** Lecture de l'onglet RefFFR_Dates → tableau d'objets ; [] si l'onglet est absent/illisible. */
function lireRefFFRDates(classeur) {
  try { return lireOngletSimple(classeur, 'RefFFR_Dates'); } catch (e) { return []; }
}

/** Lecture de l'onglet RefFFR_Regles → tableau d'objets ; [] si l'onglet est absent/illisible.
 *  Une ligne = un couple catégorie × forme × effectif : terrain, effectifs, ballon, carton,
 *  tir_au_but ("OUI" = tir au but autorisé ; tout le reste = pas de tir au but, cf. reglesPourCombosFFR). */
function lireRefFFRRegles(classeur) {
  try { return lireOngletSimple(classeur, 'RefFFR_Regles'); } catch (e) { return []; }
}

/** Lecture de l'onglet RefFFR_Temps → tableau d'objets ; [] si l'onglet est absent/illisible.
 *  Grilles de temps clées par catégorie × effectif × nb_demi_journees × nb_equipes (SANS forme). */
function lireRefFFRTemps(classeur) {
  try { return lireOngletSimple(classeur, 'RefFFR_Temps'); } catch (e) { return []; }
}

/** Référentiel FFR public complet : { formes, dates, regles, temps, millesime }.
 *  Migration douce ⇒ un onglet absent renvoie [] et n'empêche rien. */
function getRefFFR(classeur) {
  var formes = lireRefFFRFormes(classeur);
  var dates  = lireRefFFRDates(classeur);
  var regles = lireRefFFRRegles(classeur);
  var temps  = lireRefFFRTemps(classeur);
  var millesime = millesimeRefFFR(dates) || millesimeRefFFR(formes) ||
                  millesimeRefFFR(regles) || millesimeRefFFR(temps);
  return { formes: formes, dates: dates, regles: regles, temps: temps, millesime: millesime };
}

/**
 * getRefFFR mis en CACHE serveur (~10 s), avec une clé DISTINCTE de getAll (`refffr_json`) :
 * on ne touche NI à getAll NI à son cache. Le classeur n'est ouvert que si le cache est froid.
 * Renvoie la CHAÎNE JSON (pas de re-sérialisation).
 */
function refFFRJsonCache() {
  // Clé VERSIONNÉE (`_v2`) : la charge utile a changé de forme (ajout de `regles` et `temps`).
  // Sans nouvelle clé, un cache tiède servirait un objet incomplet (sans ces deux tableaux).
  var cache = CacheService.getScriptCache();
  var s = cache.get('refffr_json_v2');
  if (s) return s;
  s = JSON.stringify(getRefFFR(SpreadsheetApp.openById(sheetId())));
  try { cache.put('refffr_json_v2', s, 10); } catch (e) { /* cache indisponible : tant pis */ }
  return s;
}

/* ---------------------- Helpers de date (chaîne OU objet Date) ---------------------- */

/**
 * Normalise une date en chaîne ISO 'AAAA-MM-JJ'.
 * Accepte une CHAÎNE ('2027-01-16', '2027-01-16T09:00:00…', ou 'JJ/MM/AAAA') OU un objet Date.
 * Renvoie '' si non interprétable. Pour un objet Date on lit les composantes LOCALES (pas UTC)
 * afin d'éviter un décalage de jour.
 */
function normaliserDateISO(valeur) {
  if (valeur == null || valeur === '') return '';
  if (valeur instanceof Date) {
    if (isNaN(valeur.getTime())) return '';
    var mm = ('0' + (valeur.getMonth() + 1)).slice(-2);
    var jj = ('0' + valeur.getDate()).slice(-2);
    return valeur.getFullYear() + '-' + mm + '-' + jj;
  }
  var s = String(valeur).trim();
  var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[1] + '-' + iso[2] + '-' + iso[3];
  var fr = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (fr) return fr[3] + '-' + fr[2] + '-' + fr[1];
  return '';
}

/**
 * Mois 'AAAA-MM'. Accepte un mois déjà au format 'AAAA-MM' (colonne `mois` de RefFFR_Formes),
 * une date complète (chaîne ISO ou 'JJ/MM/AAAA') OU un objet Date. '' si non interprétable.
 */
function normaliserMois(valeur) {
  if (valeur == null || valeur === '') return '';
  if (!(valeur instanceof Date)) {
    var mo = String(valeur).trim().match(/^(\d{4})-(\d{2})$/);
    if (mo) return mo[1] + '-' + mo[2];
  }
  var isoDate = normaliserDateISO(valeur);
  return isoDate ? isoDate.slice(0, 7) : '';
}

/** Écart en jours entiers isoA − isoB (deux dates ISO 'AAAA-MM-JJ'). Calcul en UTC (pas de DST). */
function ecartJoursISO(isoA, isoB) {
  var a = isoA.split('-'), b = isoB.split('-');
  var uA = Date.UTC(+a[0], +a[1] - 1, +a[2]);
  var uB = Date.UTC(+b[0], +b[1] - 1, +b[2]);
  return Math.round((uA - uB) / 86400000);
}

/**
 * Clé de catégorie CANONIQUE, indépendante du préfixe d'âge (M = « moins de », U = « under »).
 * Le référentiel FFR reste fidèle à la source (M8/M10/M12/M15F) tandis que l'app utilise la
 * notation U (U8/U10…) : on apparie donc TOUJOURS via cette clé, jamais par égalité exacte.
 *   M8/U8/m8/u8 → '8' · M10/U10 → '10' · M12 → '12' · M14 → '14' · M15F/U15F → '15F'.
 * Une valeur sans préfixe M/U (ou inconnue) est renvoyée telle quelle (en majuscules) : elle
 * ne s'appariera simplement à rien, sans erreur.
 */
function normaliserCategorie(valeur) {
  var s = String(valeur == null ? '' : valeur).trim().toUpperCase();
  if (s === '') return '';
  return s.replace(/^[MU](?=\d)/, ''); // retire M/U seulement s'il précède un chiffre
}

/* ---------------------- Couverture de saison du référentiel ---------------------- */

/**
 * Fenêtre de couverture d'un millésime de saison 'AAAA-AAAA' → { debut, fin } en ISO.
 * Une saison FFR va du 1ᵉʳ juillet de la 1ʳᵉ année au 30 juin de la 2ᵈᵉ (inclus). Renvoie null
 * si le millésime n'est pas au format attendu.
 * Ex. '2026-2027' → { debut: '2026-07-01', fin: '2027-06-30' }.
 */
function fenetreMillesimeFFR(millesime) {
  var m = String(millesime == null ? '' : millesime).trim().match(/^(\d{4})-(\d{4})$/);
  if (!m) return null;
  return { debut: m[1] + '-07-01', fin: m[2] + '-06-30' };
}

/**
 * Période couverte par le référentiel, indépendante des lignes datées présentes.
 * Une SAISON est couverte en entier (la FFR laisse mai à partir du 15 et tout juin LIBRES : une
 * saison finit donc sans dates bloquantes — le min/max des dates donnerait un faux « hors
 * couverture » en juin, le cas le plus courant).
 *
 * Méthode : on lit les millésimes distincts de `ref.dates` (repli sur `ref.formes`), on convertit
 * chacun en fenêtre de saison, puis on prend l'UNION (plus petit début, plus grande fin).
 * Repli DÉGRADÉ et conservateur si aucun millésime exploitable : min/max des dates normalisées.
 *
 * @return {{debut:?string, fin:?string}} bornes ISO, ou null si rien d'exploitable.
 */
function couvertureSaisonFFR(ref) {
  var dates = (ref && ref.dates)  || [];
  var formes = (ref && ref.formes) || [];

  function fenetresDepuisMillesimes(lignes) {
    var out = [];
    for (var i = 0; i < lignes.length; i++) {
      var f = fenetreMillesimeFFR(lignes[i] && lignes[i].millesime);
      if (f) out.push(f);
    }
    return out;
  }

  var fenetres = fenetresDepuisMillesimes(dates);
  if (!fenetres.length) fenetres = fenetresDepuisMillesimes(formes);

  var debut = null, fin = null;
  if (fenetres.length) {
    for (var j = 0; j < fenetres.length; j++) {
      if (debut === null || fenetres[j].debut < debut) debut = fenetres[j].debut;
      if (fin === null || fenetres[j].fin > fin) fin = fenetres[j].fin;
    }
  } else {
    // Repli dégradé : aucun millésime lisible → min/max des dates normalisées (ignore les illisibles).
    for (var k = 0; k < dates.length; k++) {
      var di = normaliserDateISO(dates[k].date);
      if (!di) continue;
      if (debut === null || di < debut) debut = di;
      if (fin === null || di > fin) fin = di;
    }
  }
  return { debut: debut, fin: fin };
}

/** 'AAAA-MM-JJ' → 'JJ/MM/AAAA' (backend, sans dépendre du fuseau). '?' si borne absente. */
function jourFrFFR(iso) {
  if (!iso) return '?';
  var m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? (m[3] + '/' + m[2] + '/' + m[1]) : String(iso);
}

/* ------------- Jointure RefFFR_Formes ↔ RefFFR_Regles / RefFFR_Temps (pur) ------------- */

/**
 * Éclate une ligne de RefFFR_Formes en produit cartésien de ses valeurs multiples. Les colonnes
 * `forme_jeu` et `effectif` peuvent porter plusieurs valeurs séparées par « | »
 * (ex. forme_jeu 'T+2|JCO' en septembre ; effectif '10x10|15x15' en M14). Renvoie un tableau de
 * combinaisons { categorie, forme_jeu, effectif }. Pur, testable.
 *   { categorie:'M14', forme_jeu:'RE', effectif:'10x10|15x15' } → [ {M14,RE,10x10}, {M14,RE,15x15} ]
 * Sans le 3ᵉ terme (effectif), M14+7x7 désignerait à la fois Toucher+2, Jouer au contact ET Sevens.
 */
function eclaterFormesFFR(ligne) {
  ligne = ligne || {};
  var cat = String(ligne.categorie == null ? '' : ligne.categorie).trim();
  function valeurs(v) {
    return String(v == null ? '' : v).split('|')
      .map(function (x) { return x.trim(); })
      .filter(function (x) { return x !== ''; });
  }
  var formes = valeurs(ligne.forme_jeu); if (!formes.length) formes = [''];
  var effs   = valeurs(ligne.effectif);  if (!effs.length)   effs = [''];
  var out = [];
  for (var i = 0; i < formes.length; i++) {
    for (var j = 0; j < effs.length; j++) {
      out.push({ categorie: cat, forme_jeu: formes[i], effectif: effs[j] });
    }
  }
  return out;
}

/**
 * Libellé canonique d'une forme du mois : « forme_jeu — effectif » (ex. « RE — 15x15 »). Source
 * UNIQUE de l'identité d'une forme, partagée par le select admin (options + valeur stockée dans
 * Config.forme_jeu) et par la levée d'ambiguïté de calculerApplicationFFR. Deux formes qui ne
 * diffèrent QUE par l'effectif (U14 10x10 vs 15x15) restent ainsi distinctes. Pur.
 */
function libelleFormeFFR(forme, effectif) {
  return [String(forme == null ? '' : forme).trim(), String(effectif == null ? '' : effectif).trim()]
    .filter(function (x) { return x !== ''; }).join(' — ');
}

/**
 * Règles FFR (terrain / effectif / ballon / carton) joignant une catégorie pour les combinaisons
 * forme × effectif du mois. Jointure sur categorie(canonique) + forme_jeu + effectif, filtrée par
 * `joint_refffr_formes === 'OUI'` AVANT toute jointure (écarte le Sevens M14 et la ligne M15F, qui
 * ne doivent jamais être proposés). Dédoublonne les lignes structurellement identiques (T+2 et JCO
 * partagent leurs valeurs). Pur.
 */
function reglesPourCombosFFR(reglesRef, cleCat, combos) {
  var out = [], vues = {};
  (combos || []).forEach(function (co) {
    for (var i = 0; i < (reglesRef || []).length; i++) {
      var r = reglesRef[i];
      if (String(r.joint_refffr_formes == null ? '' : r.joint_refffr_formes).trim().toUpperCase() !== 'OUI') continue;
      if (normaliserCategorie(r.categorie) !== cleCat) continue;
      if (String(r.forme_jeu == null ? '' : r.forme_jeu).trim() !== co.forme_jeu) continue;
      if (String(r.effectif == null ? '' : r.effectif).trim() !== co.effectif) continue;
      var regle = {
        forme_jeu:            String(r.forme_jeu || '').trim(),
        effectif:             String(r.effectif || '').trim(),
        effectif_terrain:     String(r.effectif_terrain || '').trim(),
        effectif_max_feuille: String(r.effectif_max_feuille || '').trim(),
        terrain_longueur_m:   String(r.terrain_longueur_m || '').trim(),
        terrain_largeur_m:    String(r.terrain_largeur_m || '').trim(),
        terrain_libelle:      String(r.terrain_libelle || '').trim(),
        ballon:               String(r.ballon || '').trim(),
        carton_jaune_min:     String(r.carton_jaune_min || '').trim(),
        // PRUDENT PAR CONSTRUCTION (doctrine session 10) : SEUL le mot « OUI » (casse ignorée)
        // autorise le tir au but. Colonne vide, absente ou toute autre valeur ⇒ false, SANS `else`
        // ni catégorie traitée par défaut comme une autre. Le booléen naît directement du test.
        tir_au_but:           (String(r.tir_au_but == null ? '' : r.tir_au_but).trim().toUpperCase() === 'OUI')
      };
      // Dédoublonnage sur les valeurs STRUCTURANTES (forme_jeu exclu : T+2/JCO diffèrent de nom,
      // pas de contenu). Une combinaison ne joint qu'une ligne (break).
      var cle = [regle.effectif_terrain, regle.effectif_max_feuille, regle.terrain_longueur_m,
                 regle.terrain_largeur_m, regle.terrain_libelle, regle.ballon, regle.carton_jaune_min,
                 regle.tir_au_but ? '1' : '0'].join('¤');
      if (!vues[cle]) { vues[cle] = true; out.push(regle); }
      break;
    }
  });
  return out;
}

/**
 * Grilles + plafond de temps FFR pour une catégorie. Clé : categorie(canonique) + effectif +
 * nb_demi_journees + nb_equipes — SANS forme_jeu (T+2 et JCO partagent l'effectif et la grille).
 * IGNORE toute ligne dont `nb_demi_journees` est VIDE : c'est le piège du Sevens
 * (M14/7x7/plafond 42), qui partagerait sinon categorie+effectif avec le Toucher+2 légitime. Les
 * lignes à `nb_equipes` vide sont des « plafonds seuls » (3 demi-journées), pas des grilles.
 * Muet (null) si rien ne correspond : ne fabrique aucune valeur. Pur.
 */
function tempsPourCategorieFFR(tempsRef, cleCat, effs, nbDJ, nbEq) {
  nbDJ = String(nbDJ == null ? '' : nbDJ).trim();
  nbEq = String(nbEq == null ? '' : nbEq).trim();
  if (!nbDJ) return null;
  var grilles = [], plafond = '';
  for (var i = 0; i < (tempsRef || []).length; i++) {
    var t = tempsRef[i];
    var tdj = String(t.nb_demi_journees == null ? '' : t.nb_demi_journees).trim();
    if (tdj === '') continue;               // piège Sevens : nb_demi_journees vide ⇒ ignorée
    if (tdj !== nbDJ) continue;
    if (normaliserCategorie(t.categorie) !== cleCat) continue;
    var teff = String(t.effectif == null ? '' : t.effectif).trim();
    if ((effs || []).indexOf(teff) === -1) continue;
    // PLAFOND (contrainte de SÉCURITÉ) : porté par CHAQUE ligne du triplet catégorie + effectif +
    // nb_demi_journees. On le capture AVANT le filtre nb_equipes (session 8, §4.4) : les grilles FFR
    // ne couvrent que 3–6 équipes, mais un tournoi de club en compte le double ; sans cela le plafond
    // — la seule règle qui ENGAGE — disparaissait avec la grille. Toutes les lignes d'un même triplet
    // portent la MÊME valeur (vérifié) ⇒ le premier non vide fait foi.
    var plaf = String(t.plafond_joueur_min == null ? '' : t.plafond_joueur_min).trim();
    if (plaf && !plafond) plafond = plaf;
    var teq = String(t.nb_equipes == null ? '' : t.nb_equipes).trim();
    if (teq !== '' && teq !== nbEq) continue; // grille d'un autre nombre d'équipes (plafond déjà pris)
    if (teq !== '') { // teq vide = plafond seul (pas de grille) ; teq === nbEq = grille de ce tournoi
      grilles.push({
        variante:               String(t.variante || '').trim(),
        nb_periodes:            String(t.nb_periodes || '').trim(),
        duree_periode_min:      String(t.duree_periode_min || '').trim(),
        pause_periodes_min:     String(t.pause_periodes_min || '').trim(),
        arret_entre_matchs_min: String(t.arret_entre_matchs_min || '').trim(),
        rencontres_par_equipe:  String(t.rencontres_par_equipe || '').trim(),
        nb_rencontres_total:    String(t.nb_rencontres_total || '').trim(),
        organisation_poules:    String(t.organisation_poules || '').trim(),
        plafond_joueur_min:     plaf
      });
    }
  }
  if (!grilles.length && !plafond) return null; // rien ne correspond ⇒ muet
  return { grilles: grilles, plafond_joueur_min: plafond, nb_equipes: nbEq, nb_demi_journees: nbDJ };
}

/**
 * Temps de jeu MAXIMUM par joueur, en minutes (session 8, §4.5). BORNE HAUTE : l'app connaît les
 * matchs par ÉQUIPE, pas par JOUEUR — elle ignore qui entre et qui sort. C'est donc le temps
 * qu'aurait un enfant qui jouerait CHAQUE minute de CHAQUE match. La bonne quantité pour un contrôle
 * de SÉCURITÉ, à condition de le nommer ainsi (« si un joueur joue l'intégralité des matchs »).
 *
 *   minutes = matchs_par_equipe (toutes phases) × format_mi_temps × duree_mi_temps_min
 *
 * Renvoie null si l'un des trois facteurs est inconnu (planning non généré) : aucun calcul, aucune
 * alerte. Compare au plafond FFR quand il est publié ; sinon expose seulement les minutes. Pur.
 */
function tempsPrevisionnelJoueurFFR(matchsParEquipe, formatMiTemps, dureeMiTempsMin, plafond) {
  var n  = parseInt(matchsParEquipe, 10);
  var mt = parseInt(formatMiTemps, 10);
  var dm = parseInt(dureeMiTempsMin, 10);
  if (!isFinite(n) || n <= 0 || !isFinite(mt) || mt <= 0 || !isFinite(dm) || dm <= 0) return null;
  var minutes = n * mt * dm;
  var plaf = parseInt(plafond, 10);
  var aPlafond = isFinite(plaf) && plaf > 0;
  return {
    minutes:     minutes,
    plafond:     aPlafond ? plaf : null,
    depasse:     aPlafond ? (minutes > plaf) : false,
    depassement: aPlafond ? Math.max(0, minutes - plaf) : null,
    marge:       aPlafond ? Math.max(0, plaf - minutes) : null
  };
}

/* ---- Prévisionnel sur la JOURNÉE ENTIÈRE (session 9) : prédire la phase 2, pas seulement le matin ----
 * Défaut corrigé : la session 8 ne comptait que les matchs EXISTANTS (le matin). Sur un tournoi en
 * deux phases dont l'après-midi n'est pas encore généré (le cas normal AVANT le jour J), le contrôle
 * concluait « sous le plafond » sur un total partiel — un contrôle de sécurité qui rassure à tort.
 * L'après-midi est PRÉVISIBLE par ARITHMÉTIQUE de la structure des poules (planifierApresMidi ne
 * tronque JAMAIS par le temps) : c'est une conséquence de la structure, pas une estimation. */

/**
 * Structure des poules du matin, dérivée des matchs (pur). Le nombre de matchs/équipe de l'après-midi
 * en dépend directement (nbPoules pour CROISE, totalEquipes pour LIBRE).
 * @return {{nbPoules:number, poulesEgales:boolean, totalEquipes:number, matinMax:number}}
 */
function structureMatinFFR(matin) {
  var equipesParPoule = {}, toutesEquipes = {};
  (matin || []).forEach(function (m) {
    var p = String(m.poule == null ? '' : m.poule).trim();
    if (!p) return;
    var set = equipesParPoule[p] || (equipesParPoule[p] = {});
    [m.equipe_A, m.equipe_B].forEach(function (e) {
      var id = String(e == null ? '' : e).trim();
      if (id) { set[id] = true; toutesEquipes[id] = true; }
    });
  });
  var labels = Object.keys(equipesParPoule);
  var tailles = labels.map(function (p) { return Object.keys(equipesParPoule[p]).length; });
  var egales = tailles.length > 0 && tailles.every(function (t) { return t === tailles[0]; });
  return { nbPoules: labels.length, poulesEgales: egales,
           totalEquipes: Object.keys(toutesEquipes).length, matinMax: maxMatchsParEquipe(matin) };
}

/**
 * TABLE DÉCLARÉE des formules de phase 2 (session 10). Le cœur de l'inversion du défaut : un format
 * n'accède à la prédiction que si sa formule est ICI, explicitement établie et testée. Tout format
 * ABSENT de la table tombe sur le chemin PRUDENT par CONSTRUCTION (aucun `else`, aucun format traité
 * par défaut comme un autre) — voir `previsionnelCategorieFFR`. Ainsi LIBRE se corrige, et le prochain
 * format ajouté sans formule obtient le comportement prudent, jamais un silence rassurant.
 *
 * Chaque formule : `structure → {valeur, nature:('predit'|'minimum')}`. Toutes STRUCTURELLES et exactes
 * (planifierApresMidi ne tronque jamais par le temps) :
 *  - CROISE : round-robin par rang → le rang 1 est dans TOUTES les poules ⇒ `nbPoules − 1` (exact, même
 *    poules inégales ; 0 si une seule poule car le croisé est alors impossible).
 *  - CROISE_DIAGONAL : chaque équipe = UN appariement diagonal ⇒ `1` en poules ÉGALES (exact). Poules
 *    INÉGALES : le repli des « restes » donne >1 à certaines équipes → non déductible ; on renvoie la
 *    BORNE BASSE (1, nature 'minimum'). Seul cas non exactement prédit (audit Q25).
 *  - LIBRE : round-robin de TOUTES les équipes de la catégorie ⇒ `totalEquipes − 1` (exact ; 0 si moins
 *    de 2 équipes, aucun match l'après-midi).
 */
var FORMULES_PHASE2 = {
  CROISE: function (s) {
    return { valeur: s.nbPoules >= 2 ? s.nbPoules - 1 : 0, nature: 'predit' };
  },
  CROISE_DIAGONAL: function (s) {
    if (s.nbPoules < 2) return { valeur: 0, nature: 'predit' };
    return s.poulesEgales ? { valeur: 1, nature: 'predit' } : { valeur: 1, nature: 'minimum' };
  },
  LIBRE: function (s) {
    return { valeur: s.totalEquipes >= 2 ? s.totalEquipes - 1 : 0, nature: 'predit' };
  },
  // POULES_NIVEAU (session 20) : classement de midi découpé en tranches de 4-5 jouées en
  // round-robin complet ⇒ matchs/équipe = taille de la PLUS GRANDE tranche − 1 (max exact, même
  // sémantique que maxMatchsParEquipe ; les tranches ne dépendent que du nombre total d'équipes).
  POULES_NIVEAU: function (s) {
    var tailles = taillesPoulesNiveau(s.totalEquipes);
    var max = 0;
    for (var i = 0; i < tailles.length; i++) { if (tailles[i] > max) max = tailles[i]; }
    return { valeur: max >= 2 ? max - 1 : 0, nature: 'predit' };
  }
};

/**
 * Assemble l'objet prévisionnel affiché, à partir d'un total de matchs/équipe et de sa NATURE (pur).
 * Règle d'ASYMÉTRIE (session 9) : un total COMPLET (constaté ou prédit par formule exacte) conclut
 * dans les deux sens ; un total PARTIEL / BORNE BASSE ('minimum') ne conclut JAMAIS « sous le plafond »
 * (ajouter les matchs manquants ne peut que l'augmenter) mais conclut TOUJOURS un dépassement déjà
 * atteint. `margeFaible` (marge ≤ 10 min) n'est signalé que sur un total à deux phases.
 * @param {{nature:string, complet:boolean, matinMatchs:?number, apremMatchs:?number}} meta
 * @return {?Object} null si les facteurs de temps sont inconnus (aucun calcul, aucune alerte).
 */
function assemblerPrevisionnelJourneeFFR(total, meta, formatMiTemps, dureeMiTempsMin, plafond) {
  var base = tempsPrevisionnelJoueurFFR(total, formatMiTemps, dureeMiTempsMin, plafond);
  if (!base) return null;
  // « Marge faible » : n'a de sens que sur un total COMPLET (le seul qui conclut « sous le plafond »).
  var margeFaible = !!meta.complet && base.plafond != null && !base.depasse &&
                    base.marge != null && base.marge <= 10;
  return {
    minutes: base.minutes, plafond: base.plafond, depasse: base.depasse,
    depassement: base.depassement, marge: base.marge,
    nature: meta.nature, complet: !!meta.complet,
    matinMatchs: (meta.matinMatchs == null ? null : meta.matinMatchs),
    apremMatchs: (meta.apremMatchs == null ? null : meta.apremMatchs),
    margeFaible: margeFaible
  };
}

/**
 * Prévisionnel d'UNE catégorie sur la JOURNÉE ENTIÈRE (pur). Point d'entrée unique câblé par
 * getConformiteFFR. Défaut PRUDENT par construction (session 10) : on ne conclut « sous le plafond »
 * QUE sur un total complet ; tout format sans formule déclarée tombe sur le chemin prudent.
 *  - matin absent ⇒ null (muet) ;
 *  - après-midi DÉJÀ généré ⇒ tout est CONSTATÉ (nature 'constate'), aucune prédiction ;
 *  - après-midi non généré, format DANS `FORMULES_PHASE2` ⇒ total = matin + phase 2 prédite ('predit'
 *    exact, ou 'minimum' pour la borne basse du DIAGONAL inégal) ;
 *  - après-midi non généré, format ABSENT de la table (inconnu, vide, COUPE_PLATEAU, futur) ⇒ chemin
 *    PRUDENT : borne basse = le matin seul (l'après-midi ajoutera ≥ 0 match), nature 'partiel',
 *    NON complet ⇒ jamais « sous le plafond », mais un dépassement déjà atteint reste signalé.
 */
function previsionnelCategorieFFR(matin, aprem, fmt, formatMiTemps, dureeMiTempsMin, plafond) {
  matin = matin || []; aprem = aprem || [];
  if (!matin.length) return null; // muet : pas de matin
  var f = String(fmt || '').trim().toUpperCase();

  // Après-midi DÉJÀ généré : tout est constaté (observation, pas prédiction) — vrai pour TOUS les formats.
  if (aprem.length) {
    return assemblerPrevisionnelJourneeFFR(maxMatchsParEquipe(matin.concat(aprem)),
      { nature: 'constate', complet: true, matinMatchs: null, apremMatchs: null },
      formatMiTemps, dureeMiTempsMin, plafond);
  }

  // Après-midi NON généré : la prédiction n'existe QUE si une formule est déclarée pour ce format.
  var st = structureMatinFFR(matin);
  var formule = Object.prototype.hasOwnProperty.call(FORMULES_PHASE2, f) ? FORMULES_PHASE2[f] : null;
  if (formule) {
    var p2 = formule(st);
    var total = st.matinMax + p2.valeur;
    var complet = (p2.nature === 'predit'); // 'minimum' = borne basse ⇒ total NON complet
    return assemblerPrevisionnelJourneeFFR(total,
      { nature: p2.nature, complet: complet, matinMatchs: st.matinMax, apremMatchs: p2.valeur },
      formatMiTemps, dureeMiTempsMin, plafond);
  }

  // CHEMIN PRUDENT par CONSTRUCTION : format absent de la table. On ne prédit RIEN de l'après-midi ;
  // la borne basse connue est le matin seul. Aucune conclusion « sous le plafond » (total partiel),
  // mais un dépassement déjà atteint au matin reste signalé (asymétrie session 9).
  return assemblerPrevisionnelJourneeFFR(st.matinMax,
    { nature: 'partiel', complet: false, matinMatchs: st.matinMax, apremMatchs: null },
    formatMiTemps, dureeMiTempsMin, plafond);
}

/* ------------- Application des valeurs FFR à une catégorie (pur, session 6) ------------- */

/**
 * Choisit LA grille de temps à appliquer. Réutilise `tempsPourCategorieFFR` (clé complète
 * catégorie + effectif + nb_demi_journees + nb_equipes), puis lève l'ambiguïté des variantes :
 *  - une seule grille ⇒ elle ;
 *  - plusieurs grilles (variantes A/B du jeu à 10) ⇒ celle dont `variante` correspond, sinon null
 *    (on n'écrit alors AUCUNE durée : le choix appartient à l'organisateur).
 * Renvoie null si aucune grille (nb d'équipes / demi-journées hors des lignes publiées).
 */
function choisirGrilleTempsFFR(tempsRef, cleCat, effectif, nbDJ, nbEq, variante) {
  var t = tempsPourCategorieFFR(tempsRef, cleCat, [effectif], nbDJ, nbEq);
  if (!t || !t.grilles || !t.grilles.length) return null;
  if (t.grilles.length === 1) return t.grilles[0];
  var v = String(variante == null ? '' : variante).trim().toUpperCase();
  if (!v) return null; // variantes présentes mais aucune choisie ⇒ pas d'écriture de temps
  for (var i = 0; i < t.grilles.length; i++) {
    if (String(t.grilles[i].variante || '').trim().toUpperCase() === v) return t.grilles[i];
  }
  return null;
}

/**
 * Fusionne les champs FFR (zone B) DANS la ligne de catégorie existante et renvoie l'objet COMPLET
 * à réécrire. Indispensable : `enregistrerCategorie` réécrit la LIGNE ENTIÈRE — un objet partiel
 * effacerait terrains / format_apresmidi / reglement / effectif_min… (leçon session 3). Pur.
 */
function fusionnerCategorieFFR(categorieExistante, champsZoneB) {
  var out = {};
  var src = categorieExistante || {};
  for (var k in src) { if (Object.prototype.hasOwnProperty.call(src, k)) out[k] = src[k]; }
  for (var c in (champsZoneB || {})) {
    if (Object.prototype.hasOwnProperty.call(champsZoneB, c)) out[c] = champsZoneB[c];
  }
  return out;
}

/**
 * Cœur PUR de l'application des valeurs FFR à UNE catégorie, pour la date du tournoi. Ne lit AUCUN
 * classeur : tout est injecté. Réutilise `eclaterFormesFFR` / `reglesPourCombosFFR` /
 * `tempsPourCategorieFFR` (session 5) — aucune seconde recherche, aucune valeur fabriquée.
 *
 * @param {{formes,dates,regles,temps,millesime}} ref  référentiel injecté
 * @param {string} categorieApp        ex 'U12' (réconcilié via normaliserCategorie)
 * @param {string} dateISO             'AAAA-MM-JJ'
 * @param {(string|number)} nbDemiJournees  clé de la grille de temps (défaut 2 côté appelant)
 * @param {(string|number)} nbEquipes       clé de la grille de temps (nb d'équipes de la catégorie)
 * @param {?string} variante           'A' | 'B' | null (jeu à 10 seulement)
 * @param {Object} dimensionsActuelles l'objet dimensions_categories courant (fusion, jamais remplacement)
 * @param {?string} formeJeu           forme RETENUE par l'organisateur (Config.forme_jeu, libellé
 *          « forme_jeu — effectif »). Si elle correspond à UNE des formes du mois, l'ambiguïté est
 *          levée et on applique cette forme. Sinon (vide, ou hors du mois) : comportement inchangé.
 * @return {{champsZoneB:Object, dimensions:Object|null, ignores:Array, forme:Object|null,
 *          ambigu:boolean, formesDisponibles:Array}}
 */
function calculerApplicationFFR(ref, categorieApp, dateISO, nbDemiJournees, nbEquipes, variante, dimensionsActuelles, formeJeu) {
  var vide = { champsZoneB: {}, dimensions: null, ignores: [], forme: null, ambigu: false, formesDisponibles: [] };
  ref = ref || {};
  var cleCat = normaliserCategorie(categorieApp);
  var iso = normaliserDateISO(dateISO);
  if (!cleCat || !iso) return vide;
  var formes = ref.formes || [];
  if (!formes.length) return vide; // MIGRATION DOUCE : référentiel absent ⇒ rien à appliquer
  var mois = iso.slice(0, 7);

  // Ligne de forme du mois pour la catégorie.
  var ligneForme = null;
  for (var f = 0; f < formes.length; f++) {
    if (normaliserCategorie(formes[f].categorie) === cleCat &&
        normaliserMois(formes[f].mois) === mois) { ligneForme = formes[f]; break; }
  }
  if (!ligneForme) return vide;

  var combos = eclaterFormesFFR(ligneForme);

  // LEVÉE D'AMBIGUÏTÉ PAR CHOIX EXPLICITE (session 11) : si l'organisateur a retenu une forme
  // (Config.forme_jeu) ET qu'elle correspond à l'UNE des formes de ce mois, on ne garde QUE
  // cette forme — l'application redevient possible. Si la forme retenue ne correspond à AUCUNE
  // forme du mois (hors du mois), on NE filtre PAS : le comportement reste STRICTEMENT celui
  // d'aujourd'hui (le signalement « hors du mois » est porté par le front, jamais bloquant).
  var choisie = String(formeJeu == null ? '' : formeJeu).trim();
  if (choisie) {
    var combosChoisis = combos.filter(function (c) {
      return libelleFormeFFR(c.forme_jeu, c.effectif) === choisie;
    });
    if (combosChoisis.length) combos = combosChoisis;
  }

  var regles = reglesPourCombosFFR(ref.regles || [], cleCat, combos); // Sevens/M15F déjà filtrés (piège 5)
  if (!regles.length) return vide; // aucune règle joignable ⇒ rien à appliquer
  if (regles.length > 1) {
    // AMBIGUÏTÉ réglementaire (ex. U14 10x10|15x15) : on N'APPLIQUE RIEN, on expose les formes.
    // Doctrine §1.12 : devant une ambiguïté, l'app attend, elle ne tranche jamais par défaut.
    return { champsZoneB: {}, dimensions: null, ignores: [], forme: null, ambigu: true,
             formesDisponibles: regles.map(function (r) { return { forme_jeu: r.forme_jeu, effectif: r.effectif }; }) };
  }

  var r = regles[0];
  var champsZoneB = {}, ignores = [], dimensions = null;

  // Effectif MINIMUM = nombre de joueurs SUR LE TERRAIN (RefFFR_Regles.effectif_terrain ; ex. 5 pour
  // du 5x5). C'est le plancher pour qu'une équipe puisse jouer la forme. Appliqué SEULEMENT s'il est
  // chiffré (jamais deviné). Effectif MAXIMUM = max sur la FEUILLE de match (remplaçants compris).
  var effTerrain = String(r.effectif_terrain == null ? '' : r.effectif_terrain).trim();
  if (effTerrain !== '') {
    // Défensif : si la colonne portait une forme (« 5x5 ») plutôt qu'un nombre, on ne garde que le
    // nombre de tête (« 5 ») — effectif_min est un champ numérique. Un « 5 » reste « 5 ».
    var mTerrain = effTerrain.match(/^\d+/);
    if (mTerrain) champsZoneB.effectif_min = mTerrain[0];
  }
  if (String(r.effectif_max_feuille == null ? '' : r.effectif_max_feuille).trim() !== '') {
    champsZoneB.effectif_max = String(r.effectif_max_feuille).trim();
  }

  // Terrain / dimensions.
  var entreeCourante = dimensionsActuelles && dimensionsActuelles[categorieApp];
  var dejaPlein = !!(entreeCourante && entreeCourante.plein === true);
  var lg = String(r.terrain_longueur_m == null ? '' : r.terrain_longueur_m).trim();
  var la = String(r.terrain_largeur_m == null ? '' : r.terrain_largeur_m).trim();
  if (dejaPlein) {
    // Piège 1 : plein terrain (réglage sourcé) — on ne l'écrase JAMAIS.
    ignores.push({ champ: 'dimensions_categories', raison: 'Catégorie en plein terrain (plein:true) — réglage conservé.' });
  } else if (lg !== '' && la !== '') {
    // Piège 4 : fusion — on clone l'existant et on ne touche QUE cette catégorie.
    dimensions = {};
    for (var k in (dimensionsActuelles || {})) {
      if (Object.prototype.hasOwnProperty.call(dimensionsActuelles, k)) dimensions[k] = dimensionsActuelles[k];
    }
    var nl = parseFloat(lg), nw = parseFloat(la);
    dimensions[categorieApp] = { l: isFinite(nl) ? nl : lg, w: isFinite(nw) ? nw : la };
  } else {
    // Piège 2 : « terrain normal » — pas de dimension chiffrée, c'EST la donnée FFR.
    ignores.push({ champ: 'dimensions_categories', raison: r.terrain_libelle
      ? ('Terrain non chiffré : « ' + String(r.terrain_libelle).trim() + ' ».')
      : 'Terrain non chiffré par la FFR.' });
  }

  // Temps (RefFFR_Temps, clé complète cat+effectif+nb_demi_journees+nb_equipes, variante levée).
  var grille = choisirGrilleTempsFFR(ref.temps || [], cleCat, r.effectif, nbDemiJournees, nbEquipes, variante);
  if (grille) {
    if (String(grille.nb_periodes || '').trim() !== '')            champsZoneB.format_mi_temps = String(grille.nb_periodes).trim();
    if (String(grille.duree_periode_min || '').trim() !== '')      champsZoneB.duree_mi_temps_min = String(grille.duree_periode_min).trim();
    if (String(grille.pause_periodes_min || '').trim() !== '')     champsZoneB.pause_mi_temps_min = String(grille.pause_periodes_min).trim();
    if (String(grille.arret_entre_matchs_min || '').trim() !== '') champsZoneB.recup_entre_matchs_min = String(grille.arret_entre_matchs_min).trim();
  } else {
    // Aucune grille pour ce nb d'équipes / demi-journées : on n'écrit AUCUNE durée (jamais
    // d'interpolation). effectif_min/max et dimensions, issus de RefFFR_Regles, restent appliqués.
    // Message ACTIONNABLE : la norme FFR ne fixe les durées que pour 3 à 6 équipes engagées.
    var nbEqTxt = (nbEquipes == null || String(nbEquipes).trim() === '' || parseInt(nbEquipes, 10) === 0)
      ? 'aucune équipe engagée'
      : String(nbEquipes) + ' équipe(s)';
    ignores.push({ champ: 'temps', raison: 'Durées de jeu non remplies (' + nbEqTxt + ') : la norme ' +
      'FFR fixe les durées pour 3 à 6 équipes engagées. Engage les équipes puis réapplique, ou ' +
      'saisis les durées à la main.' });
  }

  return { champsZoneB: champsZoneB, dimensions: dimensions, ignores: ignores,
           forme: { forme_jeu: r.forme_jeu, effectif: r.effectif }, ambigu: false, formesDisponibles: [] };
}

/**
 * La catégorie TIRE-T-ELLE AU BUT pour ce mois (et cette forme retenue) ? Cœur PUR (référentiel
 * injecté), réponse issue de `RefFFR_Regles.tir_au_but` via `reglesPourCombosFFR` — JAMAIS d'une
 * condition sur le nom de la catégorie. PRUDENT PAR CONSTRUCTION : renvoie `true` UNIQUEMENT si
 * TOUTES les règles jointes du mois (après filtrage éventuel par la forme retenue) portent
 * `tir_au_but === true`. Référentiel absent, pas de forme du mois, ambiguïté non levée, ou une seule
 * règle qui ne tire pas ⇒ `false` (la saisie reste en mode simple). Testable sans classeur.
 */
function tirAuButCategorieFFR(ref, categorieApp, dateISO, formeJeu) {
  ref = ref || {};
  var cleCat = normaliserCategorie(categorieApp);
  var iso = normaliserDateISO(dateISO);
  if (!cleCat || !iso) return false;
  var formes = ref.formes || [];
  if (!formes.length) return false;
  var mois = iso.slice(0, 7);
  var ligneForme = null;
  for (var f = 0; f < formes.length; f++) {
    if (normaliserCategorie(formes[f].categorie) === cleCat &&
        normaliserMois(formes[f].mois) === mois) { ligneForme = formes[f]; break; }
  }
  if (!ligneForme) return false;

  var combos = eclaterFormesFFR(ligneForme);
  var choisie = String(formeJeu == null ? '' : formeJeu).trim();
  if (choisie) {
    var combosChoisis = combos.filter(function (c) {
      return libelleFormeFFR(c.forme_jeu, c.effectif) === choisie;
    });
    if (combosChoisis.length) combos = combosChoisis; // hors du mois ⇒ non filtré (restera ambigu ⇒ false)
  }
  var regles = reglesPourCombosFFR(ref.regles || [], cleCat, combos);
  if (!regles.length) return false;
  return regles.every(function (r) { return r.tir_au_but === true; });
}

/**
 * Nombre d'ESSAIS d'une équipe pour l'alerte « 5 essais d'écart », ou `null` si inconnu (l'alerte se
 * tait — JAMAIS de faux positif). Helper unique (miroir front dans saisie.js) :
 *  - la colonne détail `essais_X` est remplie ⇒ ce nombre (source la plus fiable) ;
 *  - sinon, SEULEMENT si la catégorie est CONNUE pour NE PAS tirer au but (`tirAuBut === false`),
 *    `score_X` EST le nombre d'essais (1 essai = 1 point) ;
 *  - sinon — tir au but SANS détail, OU capacité INCONNUE (`tirAuBut` ni true ni false, p.ex. backend
 *    pas encore redéployé) ⇒ `null` : on ne DÉDUIT jamais des essais d'un total qui pourrait être en points.
 * Pur, testable sans classeur.
 */
function essaisConnusEquipe(essaisBrut, scoreBrut, tirAuBut) {
  var e = validerScore(essaisBrut);
  if (e !== null) return e;
  if (tirAuBut === false) {
    var s = validerScore(scoreBrut);
    if (s !== null) return s;
  }
  return null;
}

/* ---------------------- Moteur de vérification de conformité ---------------------- */

/**
 * Cœur PUR et testable de la vérification de conformité FFR : ne lit AUCUN classeur, tout
 * vient des arguments (le référentiel est INJECTÉ). Testé par backend/Tests.gs.
 *
 * @param {{formes:Object[], dates:Object[], regles:Object[], temps:Object[], millesime:?string}} ref
 * @param {(string|Date)} dateTournoi     date du tournoi (chaîne ISO ou objet Date)
 * @param {string[]} categoriesPresentes  ex. ['U8','U10']
 * @param {string} zoneVacances           ex. 'C' (vide ⇒ traité comme 'C' par l'appelant)
 * @param {{equipesParCategorie:Object, nbDemiJournees:(string|number)}} [options]  requis pour la
 *        section `temps` seulement ; ABSENT ⇒ section temps omise (migration douce, cœur inchangé).
 * @return {{bloquants:Object[], avertissements:Object[], formes:Object, regles:Object, temps:Object,
 *          refDisponible:boolean, couverture:Object}}
 */
function evaluerConformiteFFR(ref, dateTournoi, categoriesPresentes, zoneVacances, options) {
  ref = ref || {};
  var formes = ref.formes || [];
  var dates  = ref.dates  || [];

  var regles = ref.regles || [];
  var temps  = ref.temps  || [];
  var opts   = options || null;

  // MIGRATION DOUCE : référentiel absent ⇒ aucun contrôle, et aucune couverture connue.
  if (!formes.length && !dates.length) {
    return { bloquants: [], avertissements: [], formes: {}, regles: {}, temps: {}, refDisponible: false,
             couverture: { debut: null, fin: null, couverte: false } };
  }

  // Bornes de couverture (saison), indépendantes de la date du tournoi.
  var bornes = couvertureSaisonFFR(ref);

  var dateISO = normaliserDateISO(dateTournoi);
  if (!dateISO) {
    // Pas de date lisible : rien à comparer, couverture non vérifiable.
    return { bloquants: [], avertissements: [], formes: {}, regles: {}, temps: {}, refDisponible: true,
             couverture: { debut: bornes.debut, fin: bornes.fin, couverte: false } };
  }
  var moisTournoi = dateISO.slice(0, 7);
  var cats = (categoriesPresentes || [])
    .map(function (c) { return String(c).trim(); })
    .filter(function (c) { return c !== ''; });
  // Clés canoniques des catégories présentes (appariement M↔U), en gardant le lien vers le nom
  // d'origine (celui de l'app) pour la restitution.
  var clesPresentes = {}; // cléCanonique -> nom d'origine (app)
  cats.forEach(function (c) { clesPresentes[normaliserCategorie(c)] = c; });
  var zone = String(zoneVacances || '').trim().toUpperCase();

  var bloquants = [], avertissements = [];
  var vusBloc = {}, vusAvert = {};
  function pousser(niveau, date, libelle, motif) {
    var cle = date + '|' + libelle + '|' + motif;
    if (niveau === 'bloc') {
      if (vusBloc[cle]) return; vusBloc[cle] = true;
      bloquants.push({ date: date, libelle: libelle, motif: motif });
    } else {
      if (vusAvert[cle]) return; vusAvert[cle] = true;
      avertissements.push({ date: date, libelle: libelle, motif: motif });
    }
  }

  // Une ligne de RefFFR_Dates concerne-t-elle nos catégories ? (colonne vide = toutes catégories)
  // Appariement par clé canonique (M↔U), jamais par égalité exacte.
  function recoupeCategories(ligne) {
    var lc = String(ligne.categories == null ? '' : ligne.categories).trim();
    if (lc === '') return true;
    var liste = lc.split(',').map(function (x) { return normaliserCategorie(x); }).filter(Boolean);
    if (!liste.length) return true;
    for (var k in clesPresentes) { if (liste.indexOf(k) !== -1) return true; }
    return false;
  }
  // ... et notre zone de vacances ? (colonne vide = toutes zones ; sinon liste séparée par virgules)
  function concerneZone(ligne) {
    var z = String(ligne.zone == null ? '' : ligne.zone).trim().toUpperCase();
    if (z === '') return true;
    var liste = z.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (!liste.length) return true;
    return liste.indexOf(zone) !== -1;
  }

  // RÈGLES 1 & 2 — dates fédérales (directe le jour même, puis fenêtre des 72 h).
  for (var d = 0; d < dates.length; d++) {
    var L = dates[d];
    var dIso = normaliserDateISO(L.date);
    if (!dIso) continue;
    if (!concerneZone(L)) continue;
    if (!recoupeCategories(L)) continue;
    var flag = String(L.bloque_tournoi_club == null ? '' : L.bloque_tournoi_club).trim().toUpperCase();
    if (flag === '' || flag === 'NON') continue; // NON ⇒ ignoré
    var lib = String(L.libelle == null ? '' : L.libelle).trim() ||
              String(L.type == null ? '' : L.type).trim();
    var ecart = ecartJoursISO(dIso, dateISO);
    var absJours = Math.abs(ecart);
    if (ecart === 0) {
      // Règle 1 — date fédérale exactement le jour du tournoi.
      var motif1 = 'Date fédérale le jour même du tournoi.';
      if (flag === 'OUI') pousser('bloc', dIso, lib, motif1);
      else if (flag === 'AVERTISSEMENT') pousser('avert', dIso, lib, motif1);
    } else if (absJours <= 3) {
      // Règle 2 — règle des 72 h (art. 230-2 RG) : |écart| ≤ 3 jours, avant OU après.
      var quand = (ecart < 0 ? absJours + ' jour(s) avant' : absJours + ' jour(s) après');
      if (flag === 'OUI') {
        pousser('bloc', dIso, lib, 'Date fédérale ' + quand + ' le tournoi (règle des 72 h, art. 230-2 RG).');
      } else if (flag === 'AVERTISSEMENT') {
        pousser('avert', dIso, lib, 'Date fédérale ' + quand + ' le tournoi (fenêtre de 72 h).');
      }
    }
  }

  // RÈGLE 3 — formes de jeu pour chaque catégorie PRÉSENTE (ligne categorie + mois du tournoi).
  // RÈGLES 4 & 5 — règles de jeu (terrain/effectif/ballon/carton) et grille de temps, jointes à
  // la forme du mois. Purement INFORMATIVES : elles ne poussent aucun bloquant ni avertissement
  // (la doctrine « proposer, laisser la main, alerter » se joue côté front sur les divergences).
  var formesMap = {}, reglesMap = {}, tempsMap = {};
  for (var c = 0; c < cats.length; c++) {
    var cat = cats[c];
    var cleCat = normaliserCategorie(cat);
    var ligneForme = null;
    for (var f = 0; f < formes.length; f++) {
      if (normaliserCategorie(formes[f].categorie) === cleCat &&
          normaliserMois(formes[f].mois) === moisTournoi) { ligneForme = formes[f]; break; }
    }
    if (!ligneForme) continue;
    var autor = String(ligneForme.tournoi_autorise == null ? '' : ligneForme.tournoi_autorise).trim().toUpperCase();
    var note  = String(ligneForme.note == null ? '' : ligneForme.note).trim();
    formesMap[cat] = {
      forme_jeu:        String(ligneForme.forme_jeu == null ? '' : ligneForme.forme_jeu).trim(),
      effectif:         String(ligneForme.effectif == null ? '' : ligneForme.effectif).trim(),
      tournoi_autorise: autor,
      note:             note
    };
    if (autor === 'NON') {
      pousser('bloc', dateISO, cat, 'Catégorie ' + cat + ' non éligible à un tournoi ce mois-ci (' + moisTournoi + ').');
    } else if (autor === 'LIMITE') {
      pousser('avert', dateISO, cat, note || ('Catégorie ' + cat + ' : tournoi à format limité ce mois-ci.'));
    }

    // RÈGLE 4 — règles de jeu jointes (jointure à 3 termes, Sevens/M15F écartés par joint=OUI).
    var combos = eclaterFormesFFR(ligneForme);

    // LEVÉE D'AMBIGUÏTÉ PAR LA FORME RETENUE (session 12) : si l'organisateur a choisi une forme
    // (Config.forme_jeu, transmise via opts.formesRetenues) ET qu'elle correspond à l'UNE des formes
    // du mois, on ne garde QUE cette forme — règles ET grille de temps deviennent alors univoques
    // (le bouton « Appliquer les valeurs FFR » redevient atteignable côté admin). Si la forme retenue
    // ne correspond à aucune forme du mois : on NE filtre PAS (comportement inchangé, ambiguïté visible).
    var formeRetenue = opts && opts.formesRetenues && opts.formesRetenues[cat];
    if (formeRetenue) {
      var combosRetenus = combos.filter(function (co) {
        return libelleFormeFFR(co.forme_jeu, co.effectif) === String(formeRetenue).trim();
      });
      if (combosRetenus.length) combos = combosRetenus;
    }

    var reglesCat = reglesPourCombosFFR(regles, cleCat, combos);
    if (reglesCat.length) reglesMap[cat] = reglesCat;

    // RÈGLE 5 — grille de temps (seulement si nb d'équipes + nb de demi-journées fournis).
    if (opts) {
      var effsCat = combos.map(function (co) { return co.effectif; })
        .filter(function (e, i, a) { return e && a.indexOf(e) === i; });
      var nbEq = opts.equipesParCategorie && opts.equipesParCategorie[cat];
      var grille = tempsPourCategorieFFR(temps, cleCat, effsCat, opts.nbDemiJournees, nbEq);
      if (grille) tempsMap[cat] = grille;
    }
  }

  // COUVERTURE DE SAISON — la date du tournoi tombe-t-elle dans la période couverte par le
  // référentiel chargé ? Comparaison LEXICOGRAPHIQUE sur des chaînes ISO 'AAAA-MM-JJ' (largeur
  // fixe → sûre), bornes INCLUSES. Hors couverture ⇒ on pousse un avertissement EXPLICITE :
  // ainsi un appelant qui ignorerait le champ `couverture` ne peut jamais afficher « aucun conflit »
  // alors que rien n'a pu être comparé. L'avertissement est marqué `couverture:true` pour que le
  // front le distingue (bandeau dédié) sans le confondre avec un point de vigilance métier.
  var couverte = !!(bornes.debut && bornes.fin && dateISO >= bornes.debut && dateISO <= bornes.fin);
  if (!couverte) {
    avertissements.push({
      date: dateISO,
      libelle: 'La date du tournoi (' + jourFrFFR(dateISO) + ') est en dehors de la période ' +
        'couverte par le référentiel FFR chargé (du ' + jourFrFFR(bornes.debut) + ' au ' +
        jourFrFFR(bornes.fin) + '). Aucun contrôle de date n\'a pu être effectué.',
      motif: '',
      couverture: true
    });
  }

  return { bloquants: bloquants, avertissements: avertissements, formes: formesMap,
           regles: reglesMap, temps: tempsMap,
           refDisponible: true, couverture: { debut: bornes.debut, fin: bornes.fin, couverte: couverte } };
}

/**
 * Vérification de conformité FFR « prête à l'emploi » : lit le référentiel du classeur actif
 * (migration douce en cas d'absence) puis délègue au cœur pur evaluerConformiteFFR.
 */
function verifierConformiteFFR(dateTournoiISO, categoriesPresentes, zoneVacances) {
  var ref;
  try { ref = getRefFFR(SpreadsheetApp.openById(sheetId())); }
  catch (e) { ref = { formes: [], dates: [], millesime: null }; }
  return evaluerConformiteFFR(ref, dateTournoiISO, categoriesPresentes, zoneVacances);
}

/** Nombre de demi-journées lu dans Config, avec le défaut de la migration douce : absent ⇒ 2
 *  (tournoi matin + après-midi = 2 demi-journées, Q23 close — §4.6). Pur, testable sans classeur. */
function nbDemiJourneesConfig(config) {
  return String(((config && config.global) || {}).nb_demi_journees || '').trim() || '2';
}

/** Action doGet publique : conformité FFR pour une date + catégories + zone données.
 *  Calcule côté serveur (on a le classeur) le nombre d'équipes par catégorie et lit
 *  `nb_demi_journees` de Config (défaut 2) : ce sont les clés de la grille de temps FFR. */
function getConformiteFFR(classeur, params) {
  var cats = String(params.categories == null ? '' : params.categories)
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  var zone = String(params.zone == null ? '' : params.zone).trim() || 'C';

  // Options pour la grille de temps : nb d'équipes par catégorie (comptées dans Equipes) et
  // nombre de demi-journées (zone A de Config). Migration douce : lecture protégée, défaut 2 (§4.6).
  var options = null, config = null;
  try {
    config = lireConfig(classeur);
    var equipes = lireOngletSimple(classeur, 'Equipes');
    var comptes = analyserEffectifsCategories(config, equipes).comptes || {};
    // Formes RETENUES par l'organisateur (Config.forme_jeu) : lèvent l'ambiguïté « plusieurs formes
    // ce mois » pour les règles/temps servis à l'admin (le bouton « Appliquer » redevient atteignable).
    var formesRetenues = {};
    (config.categories || []).forEach(function (c) {
      var nom = String(c.categorie == null ? '' : c.categorie).trim();
      var fj = String(c.forme_jeu == null ? '' : c.forme_jeu).trim();
      if (nom && fj) formesRetenues[nom] = fj;
    });
    options = { equipesParCategorie: comptes, nbDemiJournees: nbDemiJourneesConfig(config),
                formesRetenues: formesRetenues };
  } catch (e) { options = null; } // toute erreur ⇒ section temps simplement omise

  var res = evaluerConformiteFFR(getRefFFR(classeur), params.date, cats, zone, options);

  // §4.5 (session 8) + JOURNÉE ENTIÈRE (session 9) — temps de jeu prévisionnel par catégorie, attaché
  // aux prescriptions temps. Sur un format à deux phases dont l'après-midi n'est pas encore généré, on
  // PRÉDIT la phase 2 depuis la structure du matin plutôt que de conclure sur le seul matin. Ne s'ajoute
  // que là où un plafond/grille existe déjà. Migration douce : toute erreur ⇒ pas de prévisionnel.
  try {
    if (config) {
      var matchsParCat = {};
      lireOngletSimple(classeur, 'Matchs').forEach(function (m) {
        var c = String(m.categorie || '').trim();
        if (c) (matchsParCat[c] = matchsParCat[c] || []).push(m);
      });
      (config.categories || []).forEach(function (cat) {
        var nom = String(cat.categorie || '').trim();
        if (!nom || !res.temps[nom]) return; // pas de prescriptions temps ⇒ rien à comparer
        var liste = matchsParCat[nom] || [];
        var matin = liste.filter(function (m) { return String(m.phase) !== 'classement'; });
        var aprem = liste.filter(function (m) { return String(m.phase) === 'classement'; });
        var prev = previsionnelCategorieFFR(matin, aprem, formatApresMidi(cat),
          cat.format_mi_temps, cat.duree_mi_temps_min, res.temps[nom].plafond_joueur_min);
        if (prev) res.temps[nom].previsionnel = prev;
      });
    }
  } catch (e) { /* migration douce : pas de prévisionnel */ }

  return res;
}

/* Jour de la semaine (0=dimanche … 6=samedi) d'une date grégorienne, SANS objet Date (pur,
   testable, insensible au fuseau). Algorithme de Sakamoto. */
function jourSemaineFFR(annee, mois, jour) {
  var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  var y = annee;
  if (mois < 3) y -= 1;
  return (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[mois - 1] + jour) % 7;
}

/* Nombre de jours d'un mois (gère les années bissextiles). Pur. */
function nbJoursDansMoisFFR(annee, mois) {
  var jours = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (mois === 2 && (annee % 4 === 0 && (annee % 100 !== 0 || annee % 400 === 0))) return 29;
  return jours[mois - 1];
}

/**
 * Cœur PUR : pour chaque jour « jouable » (dimanches, mercredis, samedis) d'un mois, évalue la
 * conformité FFR et attribue un statut. Référentiel injecté ⇒ testable sans classeur.
 *   - compatible      : couvert, 0 conflit, 0 vigilance ;
 *   - vigilance       : couvert, 0 conflit, ≥ 1 point de vigilance (applicable, signalé orange) ;
 *   - conflit         : ≥ 1 conflit dur (non applicable) ;
 *   - hors_couverture : date hors saison couverte par le référentiel (non applicable) ;
 *   - inconnu         : référentiel indisponible.
 * Seuls les statuts `compatible` et `vigilance` sont `applicable:true`.
 * @return {{ ok, mois, refDisponible, jours:Array }} ou { error } si le mois est illisible.
 */
function calculerDatesCompatiblesFFR(ref, mois, categories, zone) {
  var m = String(mois == null ? '' : mois).trim().match(/^(\d{4})-(\d{2})$/);
  if (!m) return { error: 'Mois invalide (attendu AAAA-MM).' };
  var annee = parseInt(m[1], 10), moisNum = parseInt(m[2], 10);
  if (moisNum < 1 || moisNum > 12) return { error: 'Mois invalide.' };
  var refDispo = !!(ref && ((ref.formes || []).length || (ref.dates || []).length));
  var jours = [], n = nbJoursDansMoisFFR(annee, moisNum);
  for (var d = 1; d <= n; d++) {
    var dow = jourSemaineFFR(annee, moisNum, d);        // 0=dim … 6=sam
    if (dow !== 0 && dow !== 3 && dow !== 6) continue;   // dimanches, mercredis, samedis
    var iso = m[1] + '-' + m[2] + '-' + (d < 10 ? '0' + d : '' + d);
    var res = evaluerConformiteFFR(ref, iso, categories, zone, null);
    var couverte = !(res.couverture && res.couverture.couverte === false);
    var nbBloq = (res.bloquants || []).length;
    // On EXCLUT l'avertissement de couverture (déjà traité par `couverte`) des points de vigilance.
    var averts = (res.avertissements || []).filter(function (a) { return !(a && a.couverture); });
    var statut;
    if (res.refDisponible === false) statut = 'inconnu';
    else if (!couverte) statut = 'hors_couverture';
    else if (nbBloq) statut = 'conflit';
    else if (averts.length) statut = 'vigilance';
    else statut = 'compatible';
    var raisons = [];
    (res.bloquants || []).forEach(function (b) { if (b && b.libelle) raisons.push(b.libelle); });
    averts.forEach(function (a) { if (a && a.libelle) raisons.push(a.libelle); });
    jours.push({ date: iso, jour: d, dow: dow, statut: statut,
                 nbBloquants: nbBloq, nbAvertissements: averts.length,
                 applicable: (statut === 'compatible' || statut === 'vigilance'),
                 raisons: raisons.slice(0, 3) });
  }
  return { ok: true, mois: m[1] + '-' + m[2], refDisponible: refDispo, jours: jours };
}

/**
 * Action doGet PUBLIQUE : jours compatibles FFR d'un mois donné. Aucune donnée personnelle.
 * `categories` par défaut = catégories présentes du tournoi ; `zone` défaut 'C'.
 */
function datesCompatiblesFFR(classeur, params) {
  var cats = String(params.categories == null ? '' : params.categories)
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!cats.length) {
    try {
      var config = lireConfig(classeur);
      cats = (config.categories || [])
        .filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; })
        .map(function (c) { return String(c.categorie || '').trim(); }).filter(Boolean);
    } catch (e) { cats = []; }
  }
  var zone = String(params.zone == null ? '' : params.zone).trim() || 'C';
  return calculerDatesCompatiblesFFR(getRefFFR(classeur), params.mois, cats, zone);
}

/**
 * Capacités de SAISIE par catégorie pour le tournoi courant : aujourd'hui, uniquement `tir_au_but`
 * (oui/non). Lu du référentiel FFR pour la DATE du tournoi (Config) et la FORME retenue de chaque
 * catégorie (`Config.forme_jeu`) — via `tirAuButCategorieFFR`, JAMAIS d'après le nom de la catégorie.
 * PUBLIC : ne renvoie aucune donnée personnelle. MIGRATION DOUCE : toute erreur / référentiel absent
 * ⇒ carte vide ⇒ la saisie reste en mode simple (un champ par équipe), comportement historique.
 * @return {{ date:string, categories:{ [nom]:{ tir_au_but:boolean } } }}
 */
function getCapacitesCategories(classeur) {
  var out = { date: '', categories: {} };
  try {
    var config = lireConfig(classeur);
    var dateISO = normaliserDateISO(((config.global || {}).tournoi_date)) || '';
    out.date = dateISO;
    var ref = getRefFFR(classeur);
    (config.categories || []).forEach(function (c) {
      var nom = String(c.categorie == null ? '' : c.categorie).trim();
      if (!nom) return;
      var forme = String(c.forme_jeu == null ? '' : c.forme_jeu).trim();
      out.categories[nom] = { tir_au_but: tirAuButCategorieFFR(ref, nom, dateISO, forme) };
    });
  } catch (e) { /* migration douce : map vide ⇒ mode simple partout */ }
  return out;
}

/**
 * ÉCRITURE (clé admin) : applique les valeurs FFR d'UNE catégorie à `Config`, pour la date du
 * tournoi. Le frontend n'envoie QUE `{ categorie, date, variante }` — le serveur relit le
 * référentiel et dérive lui-même les valeurs via `calculerApplicationFFR` (sinon la page pourrait
 * écrire n'importe quoi en se réclamant de la FFR). `nb_equipes` (comptes) et `nb_demi_journees`
 * (Config, défaut 2) sont calculés ici, comme dans getConformiteFFR.
 *
 * Écrit : zone B par RELECTURE + FUSION + ligne complète (jamais partielle) ; `dimensions_categories`
 * par fusion de l'objet global. Renvoie le détail de ce qui a été écrit ET ignoré (avec raisons).
 */
function appliquerValeursFFR(classeur, data) {
  var categorie = String(data.categorie == null ? '' : data.categorie).trim();
  if (!categorie) return { error: 'Catégorie manquante.' };
  var dateISO = normaliserDateISO(data.date);
  if (!dateISO) return { error: 'Date du tournoi manquante ou illisible.' };
  var variante = (data.variante == null || data.variante === '') ? null : String(data.variante).trim();

  var config = lireConfig(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var comptes = analyserEffectifsCategories(config, equipes).comptes || {};
  var nbEquipes = comptes[categorie];
  var nbDemiJournees = nbDemiJourneesConfig(config); // défaut 2 (§4.6)
  var dims = {};
  try { if ((config.global || {}).dimensions_categories) dims = JSON.parse(config.global.dimensions_categories) || {}; }
  catch (e) { dims = {}; }

  // Forme retenue par l'organisateur pour CETTE catégorie (Config.forme_jeu) — lève l'ambiguïté
  // « plusieurs formes ce mois » quand elle correspond à l'une d'elles. Vide = comportement inchangé.
  var formeJeu = '';
  (config.categories || []).forEach(function (c) {
    if (String(c.categorie == null ? '' : c.categorie).trim() === categorie) {
      formeJeu = String(c.forme_jeu == null ? '' : c.forme_jeu).trim();
    }
  });

  var res = calculerApplicationFFR(getRefFFR(classeur), categorie, dateISO,
    nbDemiJournees, nbEquipes, variante, dims, formeJeu);

  // Ambiguïté (plusieurs formes ce mois-ci) : on n'écrit RIEN, on renvoie les formes à choisir.
  if (res.ambigu) {
    return { ok: true, applique: false, ambigu: true, categorie: categorie,
             formesDisponibles: res.formesDisponibles };
  }

  var aEcrire = Object.keys(res.champsZoneB).length > 0 || res.dimensions;
  if (!aEcrire) {
    return { ok: true, applique: false, categorie: categorie, forme: res.forme, ignores: res.ignores };
  }

  // Zone B : relecture de la ligne EXISTANTE + fusion + écriture de la ligne COMPLÈTE.
  if (Object.keys(res.champsZoneB).length > 0) {
    var catExistante = null;
    (config.categories || []).forEach(function (c) {
      if (String(c.categorie == null ? '' : c.categorie).trim() === categorie) catExistante = c;
    });
    if (!catExistante) return { error: 'Catégorie « ' + categorie + ' » absente des réglages.' };
    var fusion = fusionnerCategorieFFR(catExistante, res.champsZoneB);
    fusion.categorie = categorie; // clé, jamais modifiée
    var rZoneB = enregistrerCategorie(classeur, fusion);
    if (rZoneB && rZoneB.error) return { error: rZoneB.error };
  }

  // dimensions_categories : objet global fusionné (déjà fusionné par calculerApplicationFFR).
  if (res.dimensions) {
    ecrireChampsConfig(classeur.getSheetByName('Config'),
      { dimensions_categories: JSON.stringify(res.dimensions) }, ['dimensions_categories']);
  }

  return { ok: true, applique: true, categorie: categorie, forme: res.forme,
           champsZoneB: res.champsZoneB,
           dimensions: res.dimensions ? res.dimensions[categorie] : null,
           ignores: res.ignores };
}

/* ===================== DEMANDE D'AUTORISATION DE TOURNOI EDR (session 7) =====================
 * Feuille de REPORT du formulaire officiel FFR : chaque champ, dans l'ordre du document, avec un
 * état (calcule / saisi / manquant). On ne réplique JAMAIS le PDF officiel et on n'invente AUCUNE
 * valeur — un champ inconnu reste vide et « manquant ». Le cœur est PUR (testé sans classeur).
 * ======================================================================================== */

/* Paramètres `org_*` de la zone A (écriture via ecrireChampsConfig, préservation champ par champ).
 * Les récompenses par catégorie (`org_recompenses_<CAT>`) sont ajoutées dynamiquement à l'écriture. */
var CHAMPS_AUTORISATION = ['org_club_nom', 'org_code_club', 'org_representant_nom', 'org_representant_tel',
  'org_representant_mail', 'org_president_nom', 'org_president_tel', 'org_president_mail', 'org_label_edr',
  'org_label_date', 'org_niveau_tournoi', 'org_equipes_etrangeres', 'org_equipes_etrangeres_liste',
  'org_nb_participants',
  'org_type_terrain', 'org_nb_vestiaires', 'org_nb_arbitres', 'org_nb_educateurs',
  'org_nb_educateurs_club', 'org_nb_doublettes',
  'org_medecin_oui', 'org_medecin_nom', 'org_medecin_tel', 'org_secours_nom', 'org_secours_tel',
  'org_ambulance', 'org_droits_oui', 'org_droits_montant', 'org_hebergement_oui', 'org_hebergement_structure',
  'org_repas_oui', 'org_repas_fournisseur', 'org_repas_prix', 'org_gouters_oui', 'org_gouters_fournisseur',
  'org_gouters_prix'];

/* ⭐ ALLOWLIST D'EFFACEMENT (décision D-043) — les 26 `org_*` qui décrivent UNE ÉDITION et qui sont
 * les SEULS que `reinitialiserTournoi` a le droit de vider. Les 10 autres champs de
 * CHAMPS_AUTORISATION (nom et code du club, label, président, représentant) n'y figurent pas et
 * SURVIVENT : ils décrivent le club, pas le tournoi.
 * ⛔ Cette liste est EXPLICITE, jamais déduite « tout sauf les 10 permanents ». Sur une opération
 * destructive, une clé `org_*` ajoutée plus tard ne doit JAMAIS devenir effaçable par le seul fait
 * qu'on aurait oublié de la classer : l'oubli doit conserver la donnée, pas la détruire.
 * ⚠️ Les récompenses `org_recompenses_<CAT>` n'y sont PAS : leurs noms sont DYNAMIQUES (une clé par
 * catégorie), elles se détectent par préfixe — voir clesAutorisationAEffacer. */
var CHAMPS_AUTORISATION_A_REINITIALISER = [
  'org_niveau_tournoi', 'org_equipes_etrangeres', 'org_equipes_etrangeres_liste', 'org_nb_participants',
  'org_type_terrain', 'org_nb_vestiaires',
  'org_nb_arbitres', 'org_nb_educateurs', 'org_nb_educateurs_club', 'org_nb_doublettes',
  'org_medecin_oui', 'org_medecin_nom', 'org_medecin_tel',
  'org_secours_nom', 'org_secours_tel', 'org_ambulance',
  'org_droits_oui', 'org_droits_montant', 'org_hebergement_oui', 'org_hebergement_structure',
  'org_repas_oui', 'org_repas_fournisseur', 'org_repas_prix',
  'org_gouters_oui', 'org_gouters_fournisseur', 'org_gouters_prix'];

/* Préfixe EXACT des récompenses par catégorie. ⚠️ Le `_` final n'est pas cosmétique : sans lui,
 * `org_re…` attraperait `org_representant_nom`, `_tel` et `_mail` — trois données personnelles
 * PERMANENTES que D-043 conserve. C'est le risque R-B2, couvert par un test négatif. */
var PREFIXE_RECOMPENSES_AUTORISATION = 'org_recompenses_';

/* ─────────────────────────────────────────────────────────────────────────────
 * M1-B2 / B2-0 — « Conserver le contact, réinitialiser l'engagement. »
 *
 * Les 17 colonnes de `ClubsInvites` répondent à DEUX questions distinctes :
 *   « qui est ce club ? »            → le CONTACT, durable, réutilisable d'une édition à l'autre ;
 *   « que fait ce club CETTE fois ? » → l'ENGAGEMENT, propre à une édition, sans valeur ensuite.
 * Rien dans la structure de l'onglet ne disait à quelle famille appartient une colonne (R-102) :
 * le reset s'en remettait à une liste écrite à la main, et TROIS colonnes y ont été oubliées
 * (`nb_educateurs_total`, `detail_effectifs`, `alerte_ecart` — R-099), tandis que `statut` était
 * délibérément rangé du côté du carnet d'adresses (R-100).
 *
 * ⭐ `statut` est ici un ENGAGEMENT, pas une coordonnée. Un nom et un email décrivent le club ;
 * « Accepté » est la RÉPONSE À UNE QUESTION POSÉE — « participez-vous au tournoi du 15 juin ? ».
 * Elle ne vaut pas pour l'édition suivante (décision D-050).
 *
 * ⚠️ Ces deux listes sont EXPLICITES, jamais déduites l'une de l'autre — même doctrine que D-043 :
 * sur une opération destructive, une colonne ajoutée plus tard ne doit JAMAIS devenir effaçable
 * par le seul fait qu'on aurait oublié de la classer. L'oubli conserve la donnée, il ne la détruit
 * pas. C'est le test de partition (R-105) qui rend l'oubli VISIBLE, pas le reset qui le devine.
 * ───────────────────────────────────────────────────────────────────────────── */

/* Le CONTACT : ce qu'on garde d'une édition à l'autre — le carnet d'adresses, et rien d'autre. */
var CLUBS_COLONNES_CONTACT = ['club_nom', 'club_contact_nom', 'club_contact_prenom',
  'club_contact_email', 'date_ajout'];

/* L'ENGAGEMENT : tout ce qui décrit la participation à UNE édition, et que le reset doit vider.
 * ⭐ `club_token` en fait partie : réinitialiser, c'est ouvrir une nouvelle édition — les liens de
 * la précédente (dossiers, pages de réponse, copies partagées aux éducateurs) pointeraient sur des
 * données qui n'existent plus. `assurerTokensClubs` en réattribue un au prochain chargement de
 * l'admin : l'effacer, c'est RENOUVELER, pas casser. */
var CLUBS_COLONNES_ENGAGEMENT = ['statut', 'categories_engagees', 'dossier_envoye',
  'invitation_envoyee', 'club_token', 'date_reponse', 'nb_equipes_par_categorie',
  'nb_joueurs_total', 'alerte_ecart', 'detail_effectifs', 'nb_educateurs_total',
  'selection_enregistree'];

/**
 * DÉCISION PURE (aucun classeur) : parmi les en-têtes RÉELLEMENT présents dans `ClubsInvites`,
 * lesquels une réinitialisation doit-elle vider ? Comme pour D-043, la DÉCISION est séparée de
 * l'EFFET afin d'être testable sans Google, cas négatifs compris.
 *
 * ⛔ Une colonne inconnue des deux familles n'est JAMAIS retenue : sur un classeur en service, une
 * colonne qu'on n'a pas classée est une colonne dont on ignore la nature — la vider serait un pari
 * sur une donnée qu'on ne comprend pas. Elle est signalée par `colonnesClubsNonClassees`.
 * @param {Array<string>} entetes  la ligne d'en-tête réelle de l'onglet
 * @return {Array<string>} les en-têtes à vider, dans l'ordre de la décision, sans doublon
 */
function colonnesClubsAEffacer(entetes) {
  var presents = {};
  (entetes || []).forEach(function (h) {
    var nom = String(h == null ? '' : h).trim();
    if (nom) presents[nom] = true;
  });
  return CLUBS_COLONNES_ENGAGEMENT.filter(function (h) { return presents[h] === true; });
}

/**
 * DÉCISION PURE (aucun classeur) — le garde-fou de R-105 : quels en-têtes n'appartiennent NI au
 * contact NI à l'engagement ? Une colonne non classée n'est pas une erreur du reset : c'est une
 * décision qui n'a pas été prise. Cette fonction la rend visible au lieu de la laisser devenir un
 * résidu permanent, ce qui est exactement arrivé trois fois (R-099).
 * @param {Array<string>} entetes  la ligne d'en-tête réelle de l'onglet
 * @return {Array<string>} les en-têtes sans famille (vide = tout est classé)
 */
function colonnesClubsNonClassees(entetes) {
  return (entetes || []).map(function (h) {
    return String(h == null ? '' : h).trim();
  }).filter(function (nom) {
    return nom !== '' && CLUBS_COLONNES_CONTACT.indexOf(nom) === -1 &&
      CLUBS_COLONNES_ENGAGEMENT.indexOf(nom) === -1;
  });
}

/**
 * DÉCISION PURE (aucun classeur) : parmi les paramètres réellement présents dans la zone A,
 * lesquels une réinitialisation doit-elle vider ? Sépare volontairement la DÉCISION de l'EFFET,
 * pour que la première soit testable sans Google — y compris ses cas négatifs.
 *
 * Renvoie : les 26 de l'allowlist (toujours — les effacer est sans effet si la ligne n'existe pas,
 * `effacerParamGlobal` n'en crée aucune) + les récompenses RÉELLEMENT présentes.
 * ⭐ Les récompenses d'une catégorie DISPARUE sont incluses : une réinitialisation supprime les
 * catégories (zone B) mais laisse leurs `org_recompenses_<CAT>` orphelins en zone A — c'est
 * précisément ce que D-043 veut effacer.
 * @param {Array<string>} clesExistantes  les noms de paramètres présents (Object.keys du global)
 * @return {Array<string>} les clés à vider, sans doublon
 */
function clesAutorisationAEffacer(clesExistantes) {
  var cles = CHAMPS_AUTORISATION_A_REINITIALISER.slice();
  var p = PREFIXE_RECOMPENSES_AUTORISATION;
  (clesExistantes || []).forEach(function (k) {
    var nom = String(k == null ? '' : k);
    // Préfixe COMPLET, et au moins un caractère derrière : `org_recompenses_` tout seul n'est pas
    // une récompense de catégorie, et `org_recompense_U8` (sans « s ») n'est pas ce préfixe.
    if (nom.indexOf(p) === 0 && nom.length > p.length && cles.indexOf(nom) === -1) cles.push(nom);
  });
  return cles;
}

/* Défauts DOCUMENTÉS (pas des devinettes) : hypothèse de label EDR, absence d'équipes étrangères.
 * Tout le reste est vide (⇒ « manquant ») tant que l'organisateur n'a rien saisi.
 * ⛔ `org_club_nom` n'a PLUS de défaut, et c'est délibéré : l'application ne nomme aucun club à la
 * place de l'organisateur. Un classeur qui porte déjà une valeur la conserve (elle est lue AVANT
 * cette table, état « saisi »). Vide ⇒ « manquant », et le champ du PDF fédéral reste éditable. */
var DEFAUTS_AUTORISATION = {
  org_label_edr: 'oui', org_equipes_etrangeres: 'non'
};

/* Champ ouvert → question fermée Oui/Non qui le pilote. Quand la question vaut « non » (valeur
 * EFFECTIVE : saisie, sinon défaut documenté), le champ lié est SANS OBJET : état « sans objet »,
 * JAMAIS compté dans les manquants — le formulaire ne le demande pas dans ce cas. Miroir des `dep`
 * du front (AUTORISATION_SAISIE, admin-autorisation.js), qui grise ces mêmes champs à la saisie.
 * (org_equipes_etrangeres_liste est absent : sa ligne n'apparaît sur la feuille que si « oui ».) */
var DEPENDANCES_AUTORISATION = {
  org_label_date: 'org_label_edr',
  org_medecin_nom: 'org_medecin_oui',
  org_medecin_tel: 'org_medecin_oui',
  org_droits_montant: 'org_droits_oui',
  org_hebergement_structure: 'org_hebergement_oui',
  org_repas_fournisseur: 'org_repas_oui',
  org_repas_prix: 'org_repas_oui',
  org_gouters_fournisseur: 'org_gouters_oui',
  org_gouters_prix: 'org_gouters_oui'
};

/* Cases « catégories et formes de jeu » du formulaire, par catégorie canonique. L'ordre et les
 * libellés suivent le document officiel. SEVENS y figure mais n'est JAMAIS coché automatiquement
 * (absent de RefFFR_Formes — voir Session 5). M15F reprend les cinq cases de M14. */
var CASES_FORMULAIRE_AUTORISATION = {
  '6':  [{ eff: '', forme: '', libelle: 'Plateau M6 premiers pas à l\'EDR', special: true }],
  '8':  [{ eff: '5x5', forme: 'T+2' }, { eff: '5x5', forme: 'JCO' }],
  '10': [{ eff: '5x5', forme: 'T+2' }, { eff: '5x5', forme: 'JCO' }, { eff: '7x7', forme: 'RE' }],
  '12': [{ eff: '5x5', forme: 'T+2' }, { eff: '5x5', forme: 'JCO' }, { eff: '10x10', forme: 'RE' }],
  '14': [{ eff: '7x7', forme: 'T+2' }, { eff: '7x7', forme: 'JCO' }, { eff: '10x10', forme: 'RE' },
         { eff: '15x15', forme: 'RE' }, { eff: '7x7', forme: 'SEVENS' }],
  '15F':[{ eff: '7x7', forme: 'T+2' }, { eff: '7x7', forme: 'JCO' }, { eff: '10x10', forme: 'RE' },
         { eff: '15x15', forme: 'RE' }, { eff: '7x7', forme: 'SEVENS' }]
};

/** Libellé d'affichage d'une forme de jeu (JCO → « J CO » comme le formulaire). */
function libelleFormeAutorisation(eff, forme) {
  var f = (forme === 'JCO') ? 'J CO' : forme;
  return eff + ' (' + f + ')';
}

/** Un champ « saisi » (zone A) : valeur de Config, sinon défaut documenté, sinon manquant.
 *  Exception : un champ ouvert dont la question fermée pilote vaut « non » est SANS OBJET (le
 *  formulaire ne le demande pas) — jamais « manquant ». Une valeur déjà saisie reste affichée
 *  telle quelle (« saisi »), même question à « non » : cohérent avec le grisage front qui
 *  conserve la valeur sans la modifier. */
function champSaisiAutorisation(config, param) {
  var g = (config && config.global) || {};
  var v = String(g[param] == null ? '' : g[param]).trim();
  if (v !== '') return { valeur: v, etat: 'saisi', origine: 'Config:' + param };
  var dep = DEPENDANCES_AUTORISATION[param];
  if (dep) {
    // Valeur EFFECTIVE de la question pilote : saisie, sinon défaut documenté (jamais devinée).
    var q = String(g[dep] == null ? '' : g[dep]).trim().toLowerCase();
    if (q === '') q = String(DEFAUTS_AUTORISATION[dep] == null ? '' : DEFAUTS_AUTORISATION[dep]).toLowerCase();
    if (q === 'non') return { valeur: '—', etat: 'sans objet', origine: '« ' + dep + ' » = non' };
  }
  var def = DEFAUTS_AUTORISATION[param];
  if (def != null && def !== '') return { valeur: def, etat: 'calcule', origine: 'défaut app' };
  return { valeur: '', etat: 'manquant', origine: 'Config:' + param };
}

/** Un champ « calculé » : présent ⇒ calcule, absent ⇒ manquant. Jamais deviné. */
function champCalculeAutorisation(valeur) {
  var v = String(valeur == null ? '' : valeur).trim();
  return v !== '' ? { valeur: v, etat: 'calcule', origine: 'calculé' }
                  : { valeur: '', etat: 'manquant', origine: 'calculé' };
}

/**
 * Effectifs déclarés sur les équipes SAISIES À LA MAIN (session 27) — joueurs et éducateurs.
 * ANTI-DOUBLE-COMPTE : on n'additionne QUE les équipes dont `source` n'est pas 'auto'. Une équipe
 * 'auto' a été créée par la réponse d'invitation d'un club, dont les totaux (nb_joueurs_total /
 * nb_educateurs_total) sont DÉJÀ comptés par la cascade des clubs — la compter ici la doublerait.
 * Une équipe sans `source` (Sheet antérieur à la colonne) est traitée comme manuelle : c'est le
 * cas prudent, ces équipes-là n'ont jamais de club invité derrière elles.
 * `null` = aucune équipe manuelle n'a rien déclaré (distinct de 0, qui est une réponse). PUR.
 * @return {{joueurs:?number, educateurs:?number, nbEquipesDeclarees:number, nbEquipesManuelles:number}}
 */
function effectifsEquipesManuelles(equipes) {
  var joueurs = null, educateurs = null, declarees = 0, manuelles = 0;
  (equipes || []).forEach(function (e) {
    if (String((e && e.source) || '').trim().toLowerCase() === 'auto') return;
    manuelles++;
    var j = effectifDeclare(e && e.nb_joueurs);
    var ed = effectifDeclare(e && e.nb_educateurs);
    if (j != null) { joueurs = (joueurs || 0) + j; declarees++; }
    if (ed != null) educateurs = (educateurs || 0) + ed;
  });
  return { joueurs: joueurs, educateurs: educateurs,
           nbEquipesDeclarees: declarees, nbEquipesManuelles: manuelles };
}

/**
 * Rang (0-indexé) de l'entrée d'effectifs que porte une équipe d'un club : « {club}-2 » → 1,
 * « {club}-1 » → 0, et « {club} » (nom nu, antérieur à la numérotation homogène) → 0 aussi.
 * `null` si le nom ne suit pas la convention. Sert à retirer LA BONNE entrée déclarée quand une
 * équipe disparaît (plutôt que « la dernière » par défaut). PUR.
 */
function indexEquipeDuClub(nomEquipe, nomClub) {
  var ne = String(nomEquipe == null ? '' : nomEquipe).trim();
  var nc = String(nomClub == null ? '' : nomClub).trim();
  if (!ne || !nc) return null;
  if (ne === nc) return 0;
  if (ne.indexOf(nc + '-') !== 0) return null;
  var n = parseInt(ne.substring(nc.length + 1), 10);
  return (isFinite(n) && n >= 1) ? n - 1 : null;
}

/**
 * Effectifs d'un club invité AJUSTÉS aux équipes réellement présentes dans l'onglet Équipes
 * (session 28). Un club déclare ses joueurs et ses éducateurs SUR SA FICHE, en répondant
 * (`nb_joueurs_total` / `detail_effectifs`) — jamais sur ses équipes. Retirer une de ses équipes
 * (poubelle de l'écran Équipes, ou engagement réduit sur sa carte) ne touchait donc à rien :
 * « Nombre d'équipes » baissait, « Nombre de participants » restait au chiffre déclaré, et la
 * demande d'autorisation partait SURESTIMÉE sans le dire.
 *
 * Règles — jamais estimé (§4.2), prudent par défaut :
 *  1. sélection JAMAIS enregistrée (`selection_enregistree` vide) ⇒ AUCUNE déduction : les
 *     équipes du club n'ont pas encore été créées, leur absence ne prouve rien ;
 *  2. réponse SANS détail par équipe (ancien chemin : un total global) ⇒ AUCUNE déduction non
 *     plus — partager un total au prorata serait une estimation — mais l'écart est SIGNALÉ
 *     (`nonDeductible`), pour que le chiffre trop haut ne parte pas en silence ;
 *  3. sinon, CATÉGORIE PAR CATÉGORIE : la réponse porte autant d'entrées que d'équipes engagées.
 *     S'il en reste moins dans l'onglet Équipes, on retire EXACTEMENT l'écart — jamais plus, et
 *     jamais d'ajout si l'admin en a créé davantage. Laquelle retirer ? celle que le nom désigne
 *     (« {club}-2 » porte l'entrée n° 2) et, à défaut, les DERNIÈRES : c'est la règle même de la
 *     synchronisation, qui « garde les N premières équipes ».
 * Le total déclaré fait foi : on lui SOUSTRAIT les entrées retirées (jamais de re-somme), donc
 * sans retrait le chiffre est rigoureusement celui d'avant. PUR (aucun classeur).
 *
 * @param {Object} club               ligne ClubsInvites
 * @param {Array}  equipes            toutes les équipes de l'onglet Équipes
 * @param {Array<string>} autresClubs noms des AUTRES clubs invités (anti-collision « {club}-N »)
 * @return {{joueurs:?number, educateurs:?number, retraits:Array, nonDeductible:?Object}}
 */
function effectifsClubAjustes(club, equipes, autresClubs) {
  var nomClub = String((club && club.club_nom) || '').trim();
  var res = { joueurs: effectifDeclare(club && club.nb_joueurs_total),
              educateurs: effectifDeclare(club && club.nb_educateurs_total),
              retraits: [], nonDeductible: null };
  if (!nomClub) return res;
  // 1. Sélection jamais enregistrée : la synchro n'a pas encore créé les équipes du club.
  if (String((club && club.selection_enregistree) || '').trim() === '') return res;

  // Équipes du club effectivement présentes, groupées par catégorie.
  var presentes = {};
  (equipes || []).forEach(function (e) {
    if (!equipeRattacheeAuClub(e && e.nom_equipe, nomClub, autresClubs)) return;
    var cat = String((e && e.categorie) || '').trim();
    (presentes[cat] = presentes[cat] || []).push(String(e.nom_equipe).trim());
  });

  var detail = null;
  try { detail = JSON.parse(String((club && club.detail_effectifs) || '')); } catch (err) { detail = null; }
  if (!detail || typeof detail !== 'object') {
    // 2. Pas de détail par équipe : on ne sait pas ce que pesait l'équipe partie. On le DIT.
    var nbMap = {};
    try { nbMap = JSON.parse(String((club && club.nb_equipes_par_categorie) || '{}')) || {}; }
    catch (err2) { nbMap = {}; }
    var attendues = 0, restantes = 0;
    for (var cat in nbMap) {
      var n = parseInt(nbMap[cat], 10);
      if (!isFinite(n) || n < 0) continue;
      attendues += n;
      restantes += (presentes[cat] || []).length;
    }
    if (attendues > 0 && restantes < attendues) {
      res.nonDeductible = { club: nomClub, attendues: attendues, restantes: restantes };
    }
    return res;
  }

  // 3. Détail par équipe : retrait de l'écart, catégorie par catégorie.
  var retireJ = 0, retireE = 0;
  Object.keys(detail).forEach(function (categorie) {
    var entrees = detail[categorie];
    if (!entrees || !entrees.length) return;
    var noms = presentes[categorie] || [];
    var manquantes = entrees.length - noms.length;
    if (manquantes <= 0) return;                    // rien de retiré (ou davantage : jamais d'ajout)
    var occupees = {};
    noms.forEach(function (nom) {
      var i = indexEquipeDuClub(nom, nomClub);
      if (i != null && i < entrees.length) occupees[i] = true;
    });
    var joueurs = 0, educateurs = 0, retirees = 0;
    for (var i = entrees.length - 1; i >= 0 && retirees < manquantes; i--) {
      if (occupees[i]) continue;                    // cette entrée a encore son équipe
      var entree = entrees[i] || {};
      var nj = effectifDeclare(entree.j);  if (nj != null) joueurs += nj;
      var ne = effectifDeclare(entree.e);  if (ne != null) educateurs += ne;
      retirees++;
    }
    if (!retirees) return;
    retireJ += joueurs;
    retireE += educateurs;
    res.retraits.push({ club: nomClub, categorie: categorie, nb: retirees,
                        joueurs: joueurs, educateurs: educateurs });
  });

  if (res.joueurs != null)    res.joueurs    = Math.max(0, res.joueurs - retireJ);
  if (res.educateurs != null) res.educateurs = Math.max(0, res.educateurs - retireE);
  return res;
}

/**
 * Nombre d'ÉDUCATEURS (B.3) — cascade ADDITIVE (session 26). Deux sources qui s'AJOUTENT, parce
 * qu'elles couvrent des personnes différentes et qu'aucune ne connaît l'autre :
 *   1. les éducateurs DÉCLARÉS par les clubs acceptés (réponse à l'invitation, session 23) ;
 *   2. `org_nb_educateurs_club` = les encadrants du club ORGANISATEUR — le Racing ne s'invite pas
 *      lui-même, ses éducateurs ne figurent donc dans AUCUNE réponse (d'où le total faux avant).
 * Doctrine du projet (participants §4.2, type de terrain) : le STRUCTUREL prime, jamais deviné.
 *   - au moins une source connue ⇒ 'calcule', total = somme des deux, origine détaillée ;
 *   - aucune des deux ⇒ repli sur l'ancien total manuel `org_nb_educateurs` ('saisi') ;
 *   - rien nulle part ⇒ 'manquant'.
 * L'ancien total manuel n'est JAMAIS soustrait ni redistribué (on n'invente pas la part du club) :
 * quand il est ignoré, l'appelant le SIGNALE (état 'avert'). PUR.
 * @param {{global:Object}} config
 * @param {?number} nbDeclare    somme déclarée (clubs acceptés + équipes saisies à la main)
 * @param {?number} partEquipes  part de `nbDeclare` venant des équipes saisies à la main (session 27),
 *                               pour détailler l'origine ; null/absent ⇒ tout vient des clubs.
 * @return {{valeur:string, etat:string, origine:string, declare:number, club:number, totalManuelIgnore:string}}
 */
function totalEducateursAutorisation(config, nbDeclare, partEquipes) {
  var g = (config && config.global) || {};
  function entier(v) { var n = parseInt(String(v == null ? '' : v).trim(), 10); return isFinite(n) && n >= 0 ? n : null; }
  var declare = entier(nbDeclare) || 0;
  var club = entier(g.org_nb_educateurs_club);
  var manuel = String(g.org_nb_educateurs == null ? '' : g.org_nb_educateurs).trim();
  var equipes = entier(partEquipes);

  if (declare > 0 || club != null) {
    var total = declare + (club || 0);
    var parts = [];
    var partClubs = declare - (equipes || 0);
    if (partClubs > 0) parts.push(partClubs + (partClubs > 1 ? ' déclarés' : ' déclaré') + ' par les clubs acceptés');
    if (equipes != null) parts.push(equipes + ' déclarés sur les équipes saisies à la main');
    if (club != null) parts.push(club + ' du club organisateur');
    return { valeur: String(total), etat: 'calcule', origine: 'calculé — ' + parts.join(' + '),
             declare: declare, club: club || 0, totalManuelIgnore: (manuel !== '') ? manuel : '' };
  }
  if (manuel !== '') {
    return { valeur: manuel, etat: 'saisi', origine: 'saisi (total)',
             declare: 0, club: 0, totalManuelIgnore: '' };
  }
  return { valeur: '', etat: 'manquant', origine: 'Config:org_nb_educateurs',
           declare: 0, club: 0, totalManuelIgnore: '' };
}

/**
 * Natures (surfaces de jeu) des grands terrains déclarés — cascade du champ « Type de terrain »
 * de la demande d'autorisation. Source : Config.terrains_physiques (JSON [{nom,nature,type,L,W},…]),
 * champ `nature` posé par la carte Terrains. PRUDENT : JSON absent/invalide ou aucune nature
 * déclarée ⇒ liste vide (l'appelant retombe sur la saisie org_type_terrain, jamais deviné).
 * @return {{natures:string[], nbSansNature:number}} natures distinctes (ordre de déclaration)
 *         + nombre de terrains déclarés SANS nature (signalé dans l'origine, informatif).
 */
function naturesTerrainsAutorisation(config) {
  var g = (config && config.global) || {};
  var brut = String(g.terrains_physiques == null ? '' : g.terrains_physiques).trim();
  var vide = { natures: [], nbSansNature: 0 };
  if (!brut) return vide;
  var terrains;
  try { terrains = JSON.parse(brut); } catch (e) { return vide; }
  if (!terrains || !terrains.length) return vide;
  var vus = {}, natures = [], nbSans = 0;
  terrains.forEach(function (t) {
    var n = String((t && t.nature) || '').trim();
    if (!n) { nbSans++; return; }
    if (!vus[n]) { vus[n] = true; natures.push(n); }
  });
  return { natures: natures, nbSansNature: nbSans };
}

/** Nombre MAX de matchs joués par une même équipe dans une liste de matchs (équipes vides ignorées). */
function maxMatchsParEquipe(matchs) {
  var comptes = {};
  (matchs || []).forEach(function (m) {
    [m.equipe_A, m.equipe_B].forEach(function (e) {
      var id = String(e == null ? '' : e).trim();
      if (id) comptes[id] = (comptes[id] || 0) + 1;
    });
  });
  var max = 0;
  for (var k in comptes) { if (comptes[k] > max) max = comptes[k]; }
  return max;
}

/** Libellé de durée de match d'une catégorie (mêmes deux phases : dureeMatch utilise la zone B). */
function dureeMatchLibelleAutorisation(cfgCat) {
  var fmt = String((cfgCat && cfgCat.format_mi_temps) || '').trim();
  var dm = String((cfgCat && cfgCat.duree_mi_temps_min) || '').trim();
  if (!fmt || !dm) return '';
  return fmt + ' × ' + dm + ' min';
}

/**
 * Phase 2 PRÉDITE pour la feuille de report, ou null si non prédictible EXACTEMENT. Réutilise la
 * table déclarée FORMULES_PHASE2 (session 10) — seule une prédiction de nature 'predit' est rendue,
 * jamais la borne basse ('minimum', CROISE_DIAGONAL en poules inégales) : on ne dépose pas un
 * « au moins N » sur un formulaire officiel. Trois gardes prudentes :
 *  - matin absent ⇒ null (pas de structure) ;
 *  - aucune poule ÉTIQUETÉE dans le matin ⇒ null (structure inconnue, on ne devine pas) ;
 *  - catégorie SCF (U14 Super Challenge) ⇒ null (structure propre : triangulaires/quadrangulaires,
 *    hors doctrine standard — l'organisateur complète à la main). Pur.
 */
function predictionPhase2FormatSportif(matin, fmt, cfgCat) {
  if (!matin || !matin.length) return null;
  if (contexteScfCategorie(cfgCat).estScf) return null;
  var st = structureMatinFFR(matin);
  if (!st.nbPoules) return null;
  var f = String(fmt || '').trim().toUpperCase();
  var formule = Object.prototype.hasOwnProperty.call(FORMULES_PHASE2, f) ? FORMULES_PHASE2[f] : null;
  if (!formule) return null;
  var p2 = formule(st);
  return p2.nature === 'predit' ? p2.valeur : null;
}

/**
 * Format sportif d'UNE catégorie. Le nombre de PHASES se déduit de l'INTENTION — le format
 * d'après-midi DÉCLARÉ (zone B) — JAMAIS de l'existence de matchs (session 8, §4.1). La demande
 * d'autorisation se dépose des semaines avant le tournoi : l'après-midi n'est généré que le jour J,
 * une fois les scores du matin saisis. Déduire les phases des matchs générés déclarait « 1 phase »
 * pour un CROISE tant que l'après-midi n'existait pas — le bug corrigé ici.
 *
 *   - CROISE / CROISE_DIAGONAL / POULES_NIVEAU → 2 phases (poules de qualification puis poules de niveau)
 *   - LIBRE                    → 1 phase, matchs/équipe comptant TOUTE la journée (amicaux compris)
 *   - COUPE_PLATEAU            → statut « manquant » : phases finales HORS PÉRIMÈTRE École de Rugby
 *   - vide / inconnu           → statut « manquant », motif « format d'après-midi non configuré »
 *
 * Le nombre de matchs/équipe se remplit ensuite INDÉPENDAMMENT, phase par phase : compté si les
 * matchs existent, sinon `null` (⇒ « manquant » côté feuille) SANS faire basculer le nb de phases. Pur.
 */
function formatSportifCategorie(matchsCat, cfgCat) {
  var liste = matchsCat || [];
  var matin = liste.filter(function (m) { return String(m.phase) !== 'classement'; });
  var aprem = liste.filter(function (m) { return String(m.phase) === 'classement'; });
  var fmt = String((cfgCat && cfgCat.format_apresmidi) || '').trim().toUpperCase();
  var duree = dureeMatchLibelleAutorisation(cfgCat);
  function compter(sousListe) { return sousListe.length ? maxMatchsParEquipe(sousListe) : null; }

  if (fmt === 'CROISE' || fmt === 'CROISE_DIAGONAL' || fmt === 'POULES_NIVEAU') {
    // Phase 2 : CONSTATÉE si l'après-midi est généré, sinon PRÉDITE exactement quand la structure
    // des poules du matin le permet (sessions 9-10 : c'est une conséquence de la structure, pas une
    // estimation) — la demande se dépose des semaines avant le jour J, l'info est déjà connue.
    var p2 = compter(aprem);
    var p2Predit = false;
    if (p2 == null) {
      var pred = predictionPhase2FormatSportif(matin, fmt, cfgCat);
      if (pred != null) { p2 = pred; p2Predit = true; }
    }
    return { statut: 'ok', deuxPhases: true, duree: duree,
             phase1: { matchsParEquipe: compter(matin), duree: duree },
             phase2: { matchsParEquipe: p2, duree: duree, predit: p2Predit } };
  }
  if (fmt === 'LIBRE') {
    // Une phase : matchs/équipe compte TOUS les matchs de la journée (matin + amicaux d'après-midi).
    // Après-midi non généré ⇒ total prédit = matin constaté + round-robin de toutes les équipes.
    var total = aprem.length ? compter(liste) : null;
    var totalPredit = false;
    if (total == null && matin.length) {
      var predL = predictionPhase2FormatSportif(matin, 'LIBRE', cfgCat);
      if (predL != null) { total = maxMatchsParEquipe(matin) + predL; totalPredit = true; }
    }
    return { statut: 'ok', deuxPhases: false, duree: duree,
             unePhase: { matchsParEquipe: total, duree: duree, predit: totalPredit } };
  }
  if (fmt === 'COUPE_PLATEAU') {
    // Format à élimination : les phases finales (quarts, demies, finale) sont INTERDITES en tournoi/
    // plateau École de Rugby. Le format reste PROPOSÉ dans l'admin — signalé, et confirmé avant
    // d'être retenu —, parce qu'un événement peut relever d'un autre règlement. Mais CE document-ci
    // est la demande d'autorisation École de Rugby : on n'y déclare donc jamais un format que son
    // cadre interdit. D'où « manquant » plutôt qu'un nombre de phases, et c'est délibéré.
    return { statut: 'manquant', deuxPhases: false, coupePlateau: true,
             motif: 'format COUPE_PLATEAU — hors périmètre École de Rugby' };
  }
  if (fmt === '') {
    // Vide : la GÉNÉRATION appliquerait CROISE (défaut historique). Session 10 — on le DIT au lieu de
    // le taire, tout en gardant le champ « manquant » (personne ne l'a choisi). Le comportement de
    // génération n'est PAS modifié (voir formatApresMidi) ; seule la décision devient visible.
    return { statut: 'manquant', deuxPhases: false, formatVide: true,
             motif: 'non configuré — CROISE serait appliqué par défaut' };
  }
  // Valeur inattendue (typo…) : la génération retomberait aussi sur CROISE. On n'invente RIEN (§1.12).
  return { statut: 'manquant', deuxPhases: false,
           motif: 'format « ' + fmt + ' » non reconnu — CROISE serait appliqué par défaut' };
}

/**
 * Cases « catégories et formes de jeu » cochées d'après RefFFR_Formes, pour le mois et les
 * catégories présentes. Réutilise eclaterFormesFFR (session 5, sépare les valeurs sur « | »).
 * SEVENS jamais coché (+ note). M15F affiché seulement si présent dans l'app.
 */
function formesCocheesAutorisation(ref, catsPresentes, moisTournoi) {
  var formes = (ref && ref.formes) || [];
  var out = [];
  (catsPresentes || []).forEach(function (catApp) {
    var cle = normaliserCategorie(catApp);
    var cases = CASES_FORMULAIRE_AUTORISATION[cle];
    if (!cases) return; // catégorie sans bloc au formulaire
    // Ensemble « forme|effectif » autorisé ce mois-ci (éclaté).
    var autorises = {};
    for (var i = 0; i < formes.length; i++) {
      if (normaliserCategorie(formes[i].categorie) !== cle) continue;
      if (normaliserMois(formes[i].mois) !== moisTournoi) continue;
      eclaterFormesFFR(formes[i]).forEach(function (c) {
        autorises[String(c.forme_jeu).toUpperCase() + '|' + String(c.effectif)] = true;
      });
    }
    var lignes = cases.map(function (c) {
      if (c.special) {
        // M6 : coché si une ligne M6 existe ce mois (une seule case au formulaire).
        var presenceM6 = Object.keys(autorises).length > 0;
        return { libelle: c.libelle, coche: presenceM6, note: '' };
      }
      var estSevens = (c.forme === 'SEVENS');
      var coche = !estSevens && !!autorises[c.forme.toUpperCase() + '|' + c.eff];
      return { libelle: libelleFormeAutorisation(c.eff, c.forme), coche: coche,
        note: estSevens ? 'Le Sevens n\'est autorisé sur aucun mois en tournoi de club (absent du calendrier FFR) — jamais coché automatiquement.' : '' };
    });
    out.push({ categorie: catApp, cle: cle, cases: lignes });
  });
  return out;
}

/**
 * Cœur PUR : assemble la feuille de report du formulaire d'autorisation. Aucun accès classeur —
 * tout vient de `donneesApp` (dérivé du classeur par l'appelant), `config` (lireConfig) et `ref`.
 * @return {{sections:Object[], nbManquants:number, complet:boolean}}
 */
function assemblerDossierAutorisation(donneesApp, config, ref) {
  donneesApp = donneesApp || {};
  config = config || { global: {}, categories: [] };
  var g = config.global || {};
  var sections = [];
  function champ(libelle, o) { return { libelle: libelle, valeur: o.valeur, etat: o.etat, origine: o.origine }; }
  function saisi(libelle, param) { return champ(libelle, champSaisiAutorisation(config, param)); }
  function calcule(libelle, valeur) { return champ(libelle, champCalculeAutorisation(valeur)); }

  var tournoi = donneesApp.tournoi || {};
  var participants = donneesApp.participants || {};

  // A.1 ORGANISATEUR
  sections.push({ titre: 'A.1 — Organisateur', champs: [
    saisi('Nom du club ou de la structure organisatrice', 'org_club_nom'),
    saisi('Code club', 'org_code_club'),
    saisi('Représenté par (M./Mme)', 'org_representant_nom'),
    saisi('Téléphone du représentant', 'org_representant_tel'),
    saisi('Mail du représentant', 'org_representant_mail'),
    saisi('Sous couvert de son Président (M.)', 'org_president_nom'),
    saisi('Téléphone du président', 'org_president_tel'),
    saisi('Mail du président', 'org_president_mail'),
    saisi('École de rugby labellisée', 'org_label_edr'),
    saisi('Date du dernier label', 'org_label_date')
  ] });

  // A.2 INFORMATIONS DU TOURNOI
  sections.push({ titre: 'A.2 — Informations du tournoi', champs: [
    calcule('Nom du tournoi', tournoi.nom),
    calcule('Lieu (stade)', tournoi.lieu),
    calcule('Adresse (ville, code postal)', tournoi.adresse),
    calcule('Date', tournoi.date),
    calcule('Heure de début', tournoi.heure_debut),
    calcule('Heure de fin', tournoi.heure_fin),
    saisi('Niveau du tournoi', 'org_niveau_tournoi')
  ] });

  // A.3 CATÉGORIES ET FORMES DE JEU (calculé)
  var mois = normaliserMois(tournoi.date);
  var formesBlocs = mois ? formesCocheesAutorisation(ref, donneesApp.catsPresentes || [], mois) : [];
  var champsFormes = [];
  formesBlocs.forEach(function (bloc) {
    bloc.cases.forEach(function (c) {
      champsFormes.push({ libelle: bloc.categorie + ' — ' + c.libelle,
        valeur: c.coche ? '☑ autorisé' : '☐', etat: 'calcule',
        origine: 'RefFFR_Formes' + (c.note ? ' — ' + c.note : '') });
    });
  });
  if (!champsFormes.length) {
    champsFormes.push({ libelle: 'Catégories et formes de jeu', valeur: '',
      etat: 'manquant', origine: mois ? 'Aucune catégorie au formulaire' : 'Date du tournoi manquante' });
  }
  sections.push({ titre: 'A.3 — Catégories et formes de jeu', champs: champsFormes });

  // A.4 PARTICIPANTS — chaque compteur suit une CASCADE de sources (modèle des terrains, session 7).
  // Un tournoi dont les équipes sont saisies à la main (sans circuit d'invitation) a ClubsInvites vide :
  // le zéro « clubs » y est exact mais faux en pratique. On retombe alors sur les données saisies.
  var nbEquipes = participants.nbEquipes;

  // Clubs : clubs acceptés (invitations) ; sinon clubs distincts déduits des équipes ; sinon manquant.
  var champClubs;
  if (participants.nbClubsInvites != null && participants.nbClubsInvites > 0) {
    champClubs = { libelle: 'Nombre de clubs', valeur: String(participants.nbClubsInvites),
      etat: 'calcule', origine: 'calculé — clubs acceptés (invitations)' };
  } else if (participants.nbClubsEquipes != null && participants.nbClubsEquipes > 0) {
    champClubs = { libelle: 'Nombre de clubs', valeur: String(participants.nbClubsEquipes),
      etat: 'calcule', origine: 'calculé — clubs distincts identifiés dans les équipes' };
  } else {
    champClubs = { libelle: 'Nombre de clubs', valeur: '', etat: 'manquant', origine: 'aucun club identifié' };
  }

  // Participants : somme des joueurs déclarés (invitations) ; sinon org_nb_participants (saisi) ; sinon
  // manquant. N'est déductible de RIEN (ni équipes ni noms) : jamais estimé par un ratio (§4.2).
  var champParticipants;
  if (participants.nbParticipants != null && participants.nbParticipants > 0) {
    // Origine détaillée : la somme peut venir des invitations, des équipes saisies à la main
    // (session 27), ou des deux — l'organisateur doit pouvoir retrouver d'où sort le chiffre.
    var srcJ = [];
    var partEquipesJ = participants.nbJoueursEquipes;
    var partInvitJ = participants.nbParticipants - (partEquipesJ || 0);
    if (partInvitJ > 0) srcJ.push(partInvitJ + ' déclarés par les clubs invités');
    if (partEquipesJ != null) srcJ.push(partEquipesJ + ' déclarés sur les équipes saisies à la main');
    champParticipants = { libelle: 'Nombre de participants', valeur: String(participants.nbParticipants),
      etat: 'calcule', origine: 'calculé — ' + (srcJ.length ? srcJ.join(' + ') : 'somme des joueurs déclarés') };
  } else {
    champParticipants = champ('Nombre de participants', champSaisiAutorisation(config, 'org_nb_participants'));
    if (champParticipants.etat === 'saisi') champParticipants.origine = 'saisi (nombre de participants)';
  }

  var champEquipes = calcule('Nombre d\'équipes (minimum 3)', nbEquipes != null ? String(nbEquipes) : '');
  if (nbEquipes != null && Number(nbEquipes) < 3) {
    champEquipes.etat = 'manquant';
    champEquipes.origine = 'calculé — ⚠️ le formulaire exige un minimum de 3 équipes';
  }

  var champsPart = [champClubs, champEquipes, champParticipants, saisi('Équipes étrangères', 'org_equipes_etrangeres')];

  // Contrôles de cohérence (§4.3) — INFORMATIFS (état 'avert', ffr-orange), JAMAIS comptés en manquants.
  var ne = (nbEquipes != null) ? Number(nbEquipes) : null;
  if (ne != null && ne > 0 && champClubs.etat === 'manquant') {
    champsPart.push({ libelle: '⚠️ Cohérence clubs', valeur: ne + ' équipe(s) déclarée(s) mais aucun club identifié.',
      etat: 'avert', origine: 'contrôle de cohérence' });
  }
  if (ne != null && ne > 0 && champParticipants.etat === 'manquant') {
    champsPart.push({ libelle: '⚠️ Cohérence participants', valeur: ne + ' équipe(s) déclarée(s) mais aucun participant.',
      etat: 'avert', origine: 'contrôle de cohérence' });
  }
  // Déclaration PARTIELLE des équipes saisies à la main (session 27) : certaines portent leur
  // effectif, d'autres non ⇒ le total est SOUS-ESTIMÉ. On le signale plutôt que de compléter au
  // jugé (une moyenne serait une estimation, interdite §4.2). Informatif, jamais bloquant.
  var nbDecl = participants.nbEquipesDeclarees, nbManu = participants.nbEquipesManuelles;
  if (nbDecl != null && nbManu != null && nbDecl > 0 && nbDecl < nbManu) {
    champsPart.push({ libelle: '⚠️ Cohérence effectifs par équipe',
      valeur: (nbManu - nbDecl) + ' équipe(s) saisie(s) à la main sur ' + nbManu + ' n\'ont pas de nombre ' +
        'de joueurs : le total ci-dessus est incomplet. Renseigne-les (crayon ✏️ dans « Équipes »).',
      etat: 'avert', origine: 'contrôle de cohérence' });
  }

  // Équipes de clubs RETIRÉES après leur réponse (session 28) : leurs effectifs sont déduits du
  // total ci-dessus. Un chiffre corrigé doit rester VÉRIFIABLE — on montre donc le détail du
  // retrait plutôt que de laisser le total baisser sans explication.
  var retraits = participants.retraitsClubs || [];
  if (retraits.length) {
    var nbRetirees = 0, joueursRetires = 0;
    retraits.forEach(function (r) { nbRetirees += r.nb; joueursRetires += r.joueurs; });
    if (champParticipants.etat === 'calcule' && joueursRetires > 0) {
      champParticipants.origine += ' − ' + joueursRetires + ' joueur(s) de ' +
        nbRetirees + ' équipe(s) retirée(s)';
    }
    champsPart.push({ libelle: 'Effectifs des équipes retirées',
      valeur: retraits.map(function (r) {
        return r.club + ' — ' + r.nb + ' équipe(s) ' + r.categorie + ' : −' + r.joueurs + ' joueur(s)' +
               (r.educateurs > 0 ? ', −' + r.educateurs + ' éducateur(s)' : '');
      }).join(' ; '),
      etat: 'calcule', origine: 'équipes retirées depuis la réponse du club' });
  }
  // Retrait CONSTATÉ mais non déductible : la réponse du club ne détaille pas ses effectifs équipe
  // par équipe (ancienne réponse). On ne partage pas son total au prorata — ce serait estimer.
  (participants.clubsNonDeductibles || []).forEach(function (nd) {
    champsPart.push({ libelle: '⚠️ Retrait non déduit',
      valeur: nd.club + ' a déclaré ' + nd.attendues + ' équipe(s), il n\'en reste que ' + nd.restantes +
        '. Sa réponse ne détaille pas les effectifs équipe par équipe : le total ci-dessus reste celui ' +
        'qu\'il a déclaré, donc SURESTIMÉ. Fais-lui renvoyer sa réponse pour le corriger.',
      etat: 'avert', origine: 'contrôle de cohérence' });
  });

  if (String(g.org_equipes_etrangeres || '').trim().toLowerCase() === 'oui') {
    champsPart.push(saisi('Liste des équipes étrangères (noms, prénoms, dates de naissance)', 'org_equipes_etrangeres_liste'));
    champsPart.push({ libelle: 'Rappel équipes étrangères', valeur: 'Joindre à la ligue : autorisation des fédérations étrangères, liste nominative, dates de naissance.',
      etat: 'calcule', origine: 'formulaire FFR' });
  }
  sections.push({ titre: 'A.4 — Participants', champs: champsPart });

  // B.1 INSTALLATIONS SPORTIVES
  var terrains = donneesApp.terrains || null;
  var champTerrains = terrains && terrains.nombre != null
    ? { libelle: 'Nombre de terrains utilisés', valeur: String(terrains.nombre), etat: terrains.origine === 'calcule' ? 'calcule' : 'saisi',
        origine: terrains.origine === 'calcule' ? 'calculé (planning)' : 'saisi (terrains déclarés)' }
    : { libelle: 'Nombre de terrains utilisés', valeur: '', etat: 'manquant', origine: 'planning ou terrains déclarés' };
  // Type de terrain (surface) : CASCADE depuis la nature des grands terrains déclarés (carte
  // Terrains) — même doctrine que les participants : le structurel prime, repli sur la saisie
  // org_type_terrain, sinon manquant. Plusieurs natures ⇒ toutes listées (le formulaire coche
  // plusieurs cases). Terrains sans nature ⇒ signalés dans l'origine (informatif).
  var naturesT = naturesTerrainsAutorisation(config);
  var champNature;
  if (naturesT.natures.length) {
    champNature = { libelle: 'Type de terrain', valeur: naturesT.natures.join(', '), etat: 'calcule',
      origine: 'calculé — nature des grands terrains déclarés' +
        (naturesT.nbSansNature ? ' (' + naturesT.nbSansNature + ' terrain(s) sans nature déclarée)' : '') };
  } else {
    champNature = saisi('Type de terrain', 'org_type_terrain');
  }
  sections.push({ titre: 'B.1 — Installations sportives', champs: [
    champTerrains,
    champNature,
    saisi('Nombre de vestiaires utilisés', 'org_nb_vestiaires')
  ] });

  // B.2 FORMAT SPORTIF — le nombre de PHASES vient du format DÉCLARÉ (intention) ; les matchs/équipe
  // se remplissent phase par phase, « manquant » tant que le planning n'est pas généré (session 8).
  var champsFormat = [];
  var incoherencesFormat = [];
  var categoriesFormatVide = [];
  var mpc = donneesApp.matchsParCategorie || {};
  // Matchs/équipe d'une phase : chiffre si connu (constaté ou PRÉDIT exactement par la structure
  // des poules), sinon « manquant » — SANS remettre en cause le nombre de phases (déjà connu par le
  // format déclaré). L'origine distingue le prédit du constaté (même état 'calcule' : c'est exact).
  function ligneMatchsPhase(libelle, mpe, predit) {
    if (mpe == null) return { libelle: libelle, valeur: '', etat: 'manquant', origine: 'générer le planning d\'abord' };
    var c = calcule(libelle, String(mpe));
    if (predit) c.origine = 'prédit — structure des poules du matin (exact, avant génération)';
    return c;
  }
  (donneesApp.catsPresentes || []).forEach(function (catApp) {
    var cfgCat = (config.categories || []).filter(function (c) { return String(c.categorie).trim() === catApp; })[0] || {};
    var fs = formatSportifCategorie(mpc[catApp] || [], cfgCat);
    if (fs.statut === 'manquant') {
      champsFormat.push({ libelle: catApp + ' — format sportif', valeur: '', etat: 'manquant', origine: fs.motif });
      if (fs.coupePlateau) {
        incoherencesFormat.push({ libelle: catApp + ' — ⚠️ phases finales interdites',
          valeur: 'Le format à élimination (quarts, demies, finale) est INTERDIT sur les tournois et ' +
            'plateaux École de Rugby. Retire ce format ou choisis CROISE / LIBRE.', etat: 'avert',
          origine: 'formulaire FFR — interdiction des phases finales EDR' });
      }
      if (fs.formatVide) categoriesFormatVide.push(catApp);
      return;
    }
    if (fs.deuxPhases) {
      champsFormat.push(ligneMatchsPhase(catApp + ' — Phase 1 (poules de qualification) : matchs/équipe', fs.phase1.matchsParEquipe));
      champsFormat.push(calcule(catApp + ' — Phase 1 : durée de match', fs.phase1.duree));
      champsFormat.push(ligneMatchsPhase(catApp + ' — Phase 2 (poules de niveau) : matchs/équipe', fs.phase2.matchsParEquipe, fs.phase2.predit));
      champsFormat.push(calcule(catApp + ' — Phase 2 : durée de match', fs.phase2.duree));
    } else {
      champsFormat.push(ligneMatchsPhase(catApp + ' — 1 phase : matchs/équipe (journée entière)', fs.unePhase.matchsParEquipe, fs.unePhase.predit));
      champsFormat.push(calcule(catApp + ' — 1 phase : durée de match', fs.unePhase.duree));
    }
    if (normaliserCategorie(catApp) === '6') {
      champsFormat.push({ libelle: catApp + ' — mention', valeur: 'Uniquement le Toucher + 2 secondes', etat: 'calcule', origine: 'formulaire FFR' });
    }
    champsFormat.push(saisi(catApp + ' — Récompenses', 'org_recompenses_' + catApp));
  });
  // Signalement de cohérence (§4.3) : au moins une catégorie sans format d'après-midi choisi. INFORMATIF
  // (état 'avert', hors compteur de manquants) — la génération appliquerait CROISE sans le dire.
  if (categoriesFormatVide.length) {
    incoherencesFormat.push({ libelle: '⚠️ Format d\'après-midi non configuré',
      valeur: categoriesFormatVide.length + ' catégorie(s) sans format choisi (' + categoriesFormatVide.join(', ') +
        ') — CROISE serait appliqué par défaut à la génération. Choisis explicitement le format dans les réglages.',
      etat: 'avert', origine: 'décision implicite rendue visible (session 10)' });
  }
  if (!champsFormat.length && !incoherencesFormat.length) {
    champsFormat.push({ libelle: 'Format sportif', valeur: '', etat: 'manquant', origine: 'aucune catégorie présente' });
  }
  sections.push({ titre: 'B.2 — Format sportif', champs: champsFormat.concat(incoherencesFormat),
    note: 'Nombre de phases = format d\'après-midi déclaré (zone B) ; matchs/équipe remplis à la génération du planning. Même durée aux deux phases.' });

  // B.3 ARBITRAGE (saisi ; arbitrage_organisation est affiché à part côté écran, hors feuille)
  // Éducateurs — cascade ADDITIVE (session 26) : éducateurs déclarés par les clubs acceptés
  // + encadrants du club organisateur (org_nb_educateurs_club), qui ne figurent dans aucune
  // réponse d'invitation. Voir totalEducateursAutorisation pour la doctrine complète.
  var educateurs = totalEducateursAutorisation(config, participants.nbEducateurs,
                                               participants.nbEducateursEquipes);
  var champsArbitrage = [
    saisi('Nombre d\'arbitres', 'org_nb_arbitres'),
    champ('Nombre d\'éducateurs', educateurs),
    saisi('Nombre de doublettes', 'org_nb_doublettes')
  ];
  // Signalement (§4.3) : un ancien total manuel devenu inutile n'est jamais silencieusement écrasé —
  // INFORMATIF (état 'avert', hors compteur de manquants), pour que l'écart saute aux yeux.
  if (educateurs.totalManuelIgnore) {
    champsArbitrage.push({ libelle: '⚠️ Cohérence éducateurs',
      valeur: 'Ancien total saisi à la main (' + educateurs.totalManuelIgnore + ') désormais IGNORÉ : ' +
        'le total vient des éducateurs déclarés par les clubs (' + educateurs.declare + ') + ceux du club ' +
        'organisateur (' + educateurs.club + '). Vide le champ « total » et renseigne « éducateurs du club ' +
        'organisateur » pour retomber sur ton compte.',
      etat: 'avert', origine: 'contrôle de cohérence' });
  }
  sections.push({ titre: 'B.3 — Arbitrage', champs: champsArbitrage });

  // B.4 SÉCURITÉ (réutilise securite_referent_* et securite_secours_oui ; nom/tel secours structurés)
  // Responsable sécurité — CASCADE (session 21, même règle que le PDF pré-rempli) : l'info vit dans
  // la carte « Contacts & sécurité » du dossier complet. securite_referent_identique = 'non' ⇒
  // personne DISTINCTE (securite_referent_nom/tel) ; 'oui' ou vide (défaut) ⇒ le référent du
  // tournoi (referent_nom/tel). Jamais de double saisie exigée, jamais de repli croisé (une
  // personne déclarée distincte mais non renseignée reste « manquant »).
  var secuDistinct = String(g.securite_referent_identique == null ? '' : g.securite_referent_identique)
    .trim().toLowerCase() === 'non';
  var secuOrigine = secuDistinct
    ? 'Contacts & sécurité — référent sécurité (personne distincte)'
    : 'Contacts & sécurité — référent du tournoi (même personne)';
  function champSecurite(libelle, valeur) {
    var c = champ(libelle, champCalculeAutorisation(valeur));
    if (c.etat === 'calcule') c.origine = secuOrigine;
    return c;
  }
  sections.push({ titre: 'B.4 — Sécurité', champs: [
    champSecurite('Responsable sécurité — nom', secuDistinct ? g.securite_referent_nom : g.referent_nom),
    champSecurite('Responsable sécurité — téléphone', secuDistinct ? g.securite_referent_tel : g.referent_tel),
    saisi('Médecin présent', 'org_medecin_oui'),
    saisi('Médecin — nom', 'org_medecin_nom'),
    saisi('Médecin — téléphone', 'org_medecin_tel'),
    { libelle: 'Antenne de secours présente', valeur: String(g.securite_secours_oui || '').trim() || '',
      etat: String(g.securite_secours_oui || '').trim() ? 'saisi' : 'manquant', origine: 'Config:securite_secours_oui' },
    saisi('Antenne de secours — nom', 'org_secours_nom'),
    saisi('Antenne de secours — téléphone', 'org_secours_tel'),
    saisi('Ambulance', 'org_ambulance')
  ] });

  // B.5 LOGISTIQUE (saisi)
  // Droits d'inscription — CASCADE (session 22) : le logiciel connaît déjà la réponse via les
  // MODALITÉS D'INSCRIPTION (tarif_engagement_oui / tarif_engagement_montant, texte libre dont on
  // extrait le 1er nombre). Un champ org_* SAISI reste prioritaire ; sinon on REPREND les
  // modalités (état 'calcule', origine explicite) ; réponse effective « non » ⇒ montant sans
  // objet ; rien nulle part ⇒ manquant. Même règle que le PDF pré-rempli. La carte de saisie ne
  // pose plus ces questions quand les modalités y répondent (rendreSaisieAutorisation).
  var tarifOuiBrut = String(g.tarif_engagement_oui == null ? '' : g.tarif_engagement_oui).trim().toLowerCase();
  var tarifOui = (tarifOuiBrut === 'oui' || tarifOuiBrut === 'non') ? tarifOuiBrut : '';
  var mTarif = String(g.tarif_engagement_montant == null ? '' : g.tarif_engagement_montant).match(/\d+(?:[.,]\d+)?/);
  var tarifMontant = mTarif ? mTarif[0].replace(',', '.') : '';
  var origineModalites = 'repris des modalités d\'inscription (tarif d\'engagement)';
  var droitsOui = champSaisiAutorisation(config, 'org_droits_oui');
  if (droitsOui.etat === 'manquant' && tarifOui) {
    droitsOui = { valeur: tarifOui, etat: 'calcule', origine: origineModalites };
  }
  var droitsMontant = champSaisiAutorisation(config, 'org_droits_montant');
  if (droitsMontant.etat === 'manquant' && droitsOui.valeur === 'non') {
    droitsMontant = { valeur: '—', etat: 'sans objet', origine: '« droits d\'inscription » = non' };
  }
  if (droitsMontant.etat === 'manquant' && droitsOui.valeur === 'oui' && tarifMontant) {
    droitsMontant = { valeur: tarifMontant, etat: 'calcule', origine: origineModalites };
  }
  sections.push({ titre: 'B.5 — Logistique', champs: [
    champ('Droits d\'inscription', droitsOui),
    champ('Droits — montant par équipe', droitsMontant),
    saisi('Hébergement proposé', 'org_hebergement_oui'),
    saisi('Hébergement — structure', 'org_hebergement_structure'),
    saisi('Repas proposés', 'org_repas_oui'),
    saisi('Repas — fournisseur', 'org_repas_fournisseur'),
    saisi('Repas — prix par personne', 'org_repas_prix'),
    saisi('Goûters proposés', 'org_gouters_oui'),
    saisi('Goûters — fournisseur', 'org_gouters_fournisseur'),
    saisi('Goûters — prix par personne', 'org_gouters_prix')
  ] });

  var nbManquants = 0;
  sections.forEach(function (s) { s.champs.forEach(function (c) { if (c.etat === 'manquant') nbManquants++; }); });
  return { sections: sections, nbManquants: nbManquants, complet: nbManquants === 0 };
}

/**
 * LECTURE authentifiée (clé admin — les champs sont personnels) : dérive `donneesApp` du classeur
 * puis délègue au cœur pur. Nombre de terrains : distinct `terrain` de Matchs (calculé) ; sinon
 * terrains déclarés dans repartition_grands_terrains (saisi) ; sinon manquant.
 */
function getDossierAutorisation(classeur) {
  var config  = lireConfig(classeur);
  var g = config.global || {};
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var clubs   = clubsEditionActive(classeur);      // M1-B2 / B2-2 : édition active seule
  var matchs  = lireOngletSimple(classeur, 'Matchs');
  var ref     = getRefFFR(classeur);

  var catsPresentes = (config.categories || [])
    .filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; })
    .map(function (c) { return String(c.categorie || '').trim(); }).filter(Boolean);

  // Participants — CASCADE (§4.2). Source 1 : circuit d'invitation (clubs acceptés + somme des joueurs
  // déclarés). Source 2 (session 27) : effectifs déclarés ÉQUIPE PAR ÉQUIPE sur les équipes saisies
  // à la main. Les deux s'ADDITIONNENT sans se doubler : effectifsEquipesManuelles écarte les
  // équipes 'auto', déjà couvertes par les totaux de leur club. Source 3 (clubs seulement) : clubs
  // distincts déduits des noms d'équipes via clubDe (convention « {club} » / « {club}-N »).
  // Rien nulle part ⇒ repli sur org_nb_participants (saisi) ; jamais estimé.
  // Session 28 : les totaux d'un club sont AJUSTÉS aux équipes qui restent dans l'onglet Équipes
  // (une équipe retirée emporte ses joueurs et ses éducateurs) — voir effectifsClubAjustes.
  var nbClubsInvites = 0, nbParticipants = 0, nbEducateurs = 0;
  var retraitsClubs = [], clubsNonDeductibles = [];
  var nomsClubs = clubs.map(function (c) { return String(c.club_nom || '').trim(); }).filter(Boolean);
  clubs.forEach(function (c) {
    if (statutClubCanonique(c.statut) !== 'Accepté') return;
    nbClubsInvites++;
    var nomExact = String(c.club_nom || '').trim();
    var autres = nomsClubs.filter(function (n) { return !memeTexteSouple(n, nomExact); });
    var aj = effectifsClubAjustes(c, equipes, autres);
    if (aj.joueurs != null) nbParticipants += aj.joueurs;
    if (aj.educateurs != null) nbEducateurs += aj.educateurs;
    aj.retraits.forEach(function (r) { retraitsClubs.push(r); });
    if (aj.nonDeductible) clubsNonDeductibles.push(aj.nonDeductible);
  });
  var effManuels = effectifsEquipesManuelles(equipes);
  if (effManuels.joueurs != null) nbParticipants += effManuels.joueurs;
  if (effManuels.educateurs != null) nbEducateurs += effManuels.educateurs;
  var setClubsEquipes = {};
  equipes.forEach(function (e) {
    var c = clubDe(e.nom_equipe);
    if (c) setClubsEquipes[c] = true;
  });
  var nbClubsEquipes = Object.keys(setClubsEquipes).length;

  // Matchs par catégorie (pour dériver le format sportif).
  var mpc = {};
  matchs.forEach(function (m) {
    var cat = String(m.categorie || '').trim();
    if (!cat) return;
    (mpc[cat] = mpc[cat] || []).push(m);
  });

  // Nombre de terrains : d'abord depuis les matchs (planning), sinon depuis les terrains déclarés.
  var terrains = null;
  var setTerrains = {};
  matchs.forEach(function (m) { var t = String(m.terrain == null ? '' : m.terrain).trim(); if (t) setTerrains[t] = true; });
  var nbT = Object.keys(setTerrains).length;
  if (nbT > 0) {
    terrains = { nombre: nbT, origine: 'calcule' };
  } else {
    try {
      var rep = g.repartition_grands_terrains ? JSON.parse(g.repartition_grands_terrains) : null;
      if (rep) {
        var total = 0;
        for (var k in rep) { if (Array.isArray(rep[k])) total += rep[k].length; }
        if (total > 0) terrains = { nombre: total, origine: 'saisi' };
      }
    } catch (e) { /* JSON illisible : terrains restent manquants */ }
  }

  var donneesApp = {
    tournoi: {
      nom: g.tournoi_nom, date: g.tournoi_date, lieu: g.tournoi_lieu, adresse: g.tournoi_adresse,
      heure_debut: g.heure_debut,
      heure_fin: g.heure_fin_projetee || g.heure_fin_matin || g.heure_fin || ''
    },
    participants: { nbClubsInvites: nbClubsInvites, nbClubsEquipes: nbClubsEquipes,
                    nbEquipes: equipes.length, nbParticipants: nbParticipants,
                    nbEducateurs: nbEducateurs,
                    // Part venant des équipes saisies à la main (pour détailler l'origine).
                    nbJoueursEquipes: effManuels.joueurs, nbEducateursEquipes: effManuels.educateurs,
                    nbEquipesDeclarees: effManuels.nbEquipesDeclarees,
                    nbEquipesManuelles: effManuels.nbEquipesManuelles,
                    // Équipes de clubs retirées après leur réponse (effectifs déduits / à signaler).
                    retraitsClubs: retraitsClubs, clubsNonDeductibles: clubsNonDeductibles },
    catsPresentes: catsPresentes,
    matchsParCategorie: mpc,
    terrains: terrains
  };

  return { ok: true, dossier: assemblerDossierAutorisation(donneesApp, config, ref) };
}

/**
 * ÉCRITURE (clé admin) des champs saisis du dossier d'autorisation. Zone A, champ par champ via
 * ecrireChampsConfig (PRÉSERVATION — jamais enregistrerCategorie, qui réécrit la ligne entière).
 * Accepte aussi les récompenses par catégorie `org_recompenses_<CAT>`.
 */
function enregistrerDossierAutorisation(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  var champs = CHAMPS_AUTORISATION.slice();
  Object.keys(data || {}).forEach(function (k) {
    if (k.indexOf('org_recompenses_') === 0 && champs.indexOf(k) === -1) champs.push(k);
  });
  ecrireChampsConfig(onglet, data, champs);
  return { ok: true };
}

/* ===================== ÉCRITURE (doPost) ===================== */

/* Actions protégées par la clé SCORES (les autres écritures exigent la clé ADMIN). */
var ACTIONS_SCORES = { enregistrerScore: true };

/* Actions PUBLIQUES sécurisées par un JETON (club_token) plutôt qu'une clé admin : la réponse
   en libre-service d'un club à son invitation. La sécurité est vérifiée DANS la fonction
   (le jeton doit correspondre au club) — jamais par la clé admin. */
var ACTIONS_TOKEN = { repondreInvitation: true };

/* Actions de LECTURE passant par doPost (pour exiger la clé admin, qu'une URL doGet ne doit pas
 * porter) mais qui NE MODIFIENT RIEN : elles NE prennent PAS le verrou d'écriture. L'admin
 * recharge la config à de nombreux endroits ; un jour de tournoi, prendre le verrou d'écriture
 * la mettrait en concurrence avec la saisie des scores. Ces actions le court-circuitent. */
var ACTIONS_LECTURE = { getConfigAdmin: true, getDossierAutorisation: true, listerSponsors: true,
                        lireMesuresSponsors: true };

function doPost(e) {
  var lock, classeur, snapshotJson = null;
  try {
    var requete = JSON.parse(e.postData.contents);
    var action = requete.action;

    // ⚡ RELEVÉ DE VISIBILITÉ DES PARTENAIRES — traité TOUT DE SUITE, avant le contrôle de clé
    // et surtout AVANT LE VERROU D'ÉCRITURE.
    //
    // C'est la seule écriture PUBLIQUE (sans clé) du fichier, et ce n'est pas un oubli : les
    // relevés viennent des téléphones des spectateurs, qui n'ont évidemment aucune clé. Trois
    // raisons rendent la chose acceptable ici :
    //  1. la charge utile est MINUSCULE et strictement validée (voir enregistrerMesureSponsors) ;
    //  2. elle n'écrit que dans l'onglet `Mesures`, isolé, effaçable d'un bouton, et qu'aucune
    //     autre partie du logiciel ne lit — un abus ne peut donc rien corrompre ;
    //  3. elle ne prend PAS le verrou et ne reconstruit PAS l'instantané public.
    //
    // Ce dernier point est le vrai enjeu : la saisie des scores prend un verrou à chaque
    // validation. Si les relevés passaient par le chemin d'écriture normal, quelques centaines
    // de spectateurs suffiraient à faire attendre le marqueur au bord du terrain. Ils sortent
    // donc ici, par la porte la plus courte possible.
    if (action === 'mesureSponsors') {
      // Plafonds de débit vérifiés AVANT d'ouvrir le classeur (openById ≈ 0,5 s) : une requête
      // refusée coûte alors une lecture de cache au lieu d'une demi-seconde de serveur. C'est
      // tout l'intérêt du garde-fou — voir le bloc « Plafonds de DÉBIT et de VOLUME » plus haut.
      var debit = mesureDebitAutorise(requete);
      if (!debit.ok) return repondreJson({ ok: true, ignore: debit.motif });
      return repondreJson(enregistrerMesureSponsors(SpreadsheetApp.openById(sheetId()), requete));
    }

    // Contrôle d'accès : chaque écriture exige la bonne clé (scores selon l'action, sinon admin).
    // Les actions à JETON (réponse publique d'un club) contournent la clé ici et valident le
    // jeton en interne. Les lectures (doGet) restent ouvertes à tous.
    if (!ACTIONS_TOKEN[action]) {
      var nomCle = ACTIONS_SCORES[action] ? 'CLE_SCORES' : 'CLE_ADMIN';
      var acces = verifierCle(requete, nomCle);
      if (!acces.ok) return repondreJson({ error: acces.msg, acces_refuse: true });
    }

    // LECTURES authentifiées (clé admin déjà vérifiée ci-dessus) : elles ne modifient rien →
    // on répond AVANT la prise du verrou d'écriture, pour ne jamais entrer en concurrence avec
    // la saisie des scores le jour du tournoi. Aucun rafraîchissement de cache (rien n'a changé).
    if (ACTIONS_LECTURE[action]) {
      classeur = SpreadsheetApp.openById(sheetId());
      var lecture;
      switch (action) {
        case 'getConfigAdmin': lecture = { ok: true, config: lireConfig(classeur) }; break;
        case 'getDossierAutorisation': lecture = getDossierAutorisation(classeur); break;
        case 'listerSponsors': lecture = listerSponsors(classeur); break;
        case 'lireMesuresSponsors': lecture = lireMesuresSponsors(classeur, requete); break;
        default: lecture = { error: 'Action inconnue : ' + action };
      }
      return repondreJson(lecture);
    }

    // Verrou d'écriture : sérialise les écritures concurrentes (deux marqueurs qui valident
    // au même instant) pour éviter les collisions d'identifiant et l'écrasement de lignes
    // dans l'onglet Historique. Attente max 20 s ; au-delà, on demande de réessayer plutôt
    // que de risquer une écriture corrompue. Le verrou est relâché dans le finally.
    lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) {
      return repondreJson({ error: 'Serveur momentanément occupé, réessaie dans un instant.' });
    }

    classeur = SpreadsheetApp.openById(sheetId());
    var resultat;
    switch (action) {
      case 'ajouterEquipe':        resultat = ajouterEquipe(classeur, requete.nom_equipe, requete.categorie,
                                                requete.nb_joueurs, requete.nb_educateurs); break;
      case 'modifierEquipe':       resultat = modifierEquipe(classeur, requete.id_equipe, requete.nom_equipe,
                                                requete.nb_joueurs, requete.nb_educateurs); break;
      case 'supprimerEquipe':      resultat = supprimerEquipe(classeur, requete.id_equipe); break;
      case 'supprimerEquipesCategorie': resultat = supprimerEquipesCategorie(classeur, requete.categorie); break;
      case 'enregistrerHoraires':  resultat = enregistrerHoraires(classeur, requete); break;
      case 'enregistrerCategorie': resultat = enregistrerCategorie(classeur, requete); break;
      case 'appliquerValeursFFR':  resultat = appliquerValeursFFR(classeur, requete); break;
      case 'enregistrerDossierAutorisation': resultat = enregistrerDossierAutorisation(classeur, requete); break;
      case 'supprimerCategorie':   resultat = supprimerCategorie(classeur, requete.categorie); break;
      case 'enregistrerScore':     resultat = enregistrerScore(classeur, requete); break;
      case 'genererPoulesEtPlanning': resultat = genererPoulesEtPlanning(classeur); break;
      case 'reorganiserPoulesMatin':  resultat = reorganiserPoulesMatin(classeur, requete); break;
      case 'recalculerHoraires':      resultat = recalculerHoraires(classeur); break;
      case 'genererApresMidi':     resultat = genererApresMidi(classeur); break;
      case 'genererDimancheScf':   resultat = genererDimancheScf(classeur); break;
      case 'publierTournoi':       resultat = publierTournoi(classeur, requete.publie); break;
      case 'enregistrerInfosTournoi': resultat = enregistrerInfosTournoi(classeur, requete); break;
      case 'enregistrerContactsSecurite': resultat = enregistrerContactsSecurite(classeur, requete); break;
      case 'enregistrerPlanTerrains': resultat = enregistrerPlanTerrains(classeur, requete); break;
      case 'enregistrerAffiche':   resultat = enregistrerAffiche(classeur, requete); break;
      case 'supprimerAffiche':     resultat = supprimerAffiche(classeur); break;
      case 'enregistrerInvitation': resultat = enregistrerInvitation(classeur, requete); break;
      case 'enregistrerSurPlace':  resultat = enregistrerSurPlace(classeur, requete); break;
      case 'enregistrerReponseInvitation': resultat = enregistrerReponseInvitation(classeur, requete); break;
      case 'enregistrerPhotoParking': resultat = enregistrerPhotoParking(classeur, requete); break;
      case 'supprimerPhotoParking':   resultat = supprimerPhotoParking(classeur); break;
      // Partenaires : les trois écritures de l'écran admin « Partenaires ». Chacune rafraîchit
      // l'instantané public (voir plus bas) → la page des scores voit le changement en ~10 s.
      case 'enregistrerReglagesSponsors': resultat = enregistrerReglagesSponsors(classeur, requete); break;
      case 'enregistrerSponsor':      resultat = enregistrerSponsor(classeur, requete); break;
      case 'supprimerSponsor':        resultat = supprimerSponsor(classeur, requete); break;
      case 'viderMesuresSponsors':    resultat = viderMesuresSponsors(classeur); break;
      case 'listerClubsInvites':   resultat = listerClubsInvites(classeur); break;
      case 'ajouterClubInvite':    resultat = ajouterClubInvite(classeur, requete); break;
      case 'modifierStatutClubInvite': resultat = modifierStatutClubInvite(classeur, requete); break;
      case 'enregistrerCategoriesEngagees': resultat = enregistrerCategoriesEngagees(classeur, requete); break;
      case 'envoyerDossierEmail':  resultat = envoyerDossierEmail(classeur, requete); break;
      case 'regenererJetonClub':   resultat = regenererJetonClub(classeur, requete); break;
      case 'creerEquipesClub':     resultat = creerEquipesClub(classeur, requete); break;
      case 'modifierClubInvite':   resultat = modifierClubInvite(classeur, requete); break;
      case 'envoyerInvitationClub': resultat = envoyerInvitationClub(classeur, requete); break;
      case 'envoyerInvitationsGroupe': resultat = envoyerInvitationsGroupe(classeur, requete); break;
      case 'envoyerFeuilleJour':   resultat = envoyerFeuilleJour(classeur, requete); break;
      case 'repondreInvitation':   resultat = repondreInvitation(classeur, requete); break;
      case 'supprimerClubInvite':  resultat = supprimerClubInvite(classeur, requete); break;
      case 'publierPlanningClubs': resultat = publierPlanningClubs(classeur, requete); break;
      case 'reinitialiserTournoi': resultat = reinitialiserTournoi(classeur); break;
      default: resultat = { error: 'Action inconnue : ' + action };
    }
    // Écriture réussie → cache serveur rafraîchi (+ relais CDN si configuré). Sans effet
    // secondaire bloquant : n'échoue jamais l'action même si le rafraîchissement rate.
    // listerClubsInvites est une LECTURE (protégée par la clé admin, car l'onglet contient
    // des emails) : rien n'a changé, inutile de reconstruire le cache public.
    // Écriture réussie → cache serveur rafraîchi SOUS verrou (retourne le snapshot pour le CDN).
    if (resultat && !resultat.error && action !== 'listerClubsInvites') {
      snapshotJson = apresEcriture(classeur);
    }
    return repondreJson(resultat);
  } catch (erreur) {
    // Détail journalisé côté serveur, message générique côté client (anti-fuite d'infos).
    // Les erreurs « métier » (validation) sont renvoyées normalement via resultat.error ;
    // ce catch ne concerne que les exceptions inattendues.
    Logger.log('doPost erreur : ' + erreur);
    return repondreJson({ error: 'Erreur serveur pendant l\'écriture.' });
  } finally {
    if (lock) lock.releaseLock(); // toujours relâcher le verrou (sans erreur s'il n'était pas pris)
    // Push CDN APRÈS le verrou : la latence réseau du relais (UrlFetchApp) ne prolonge plus la
    // détention du verrou → aucune contention pour les écritures concurrentes (marqueurs).
    if (snapshotJson) { try { pousserSnapshot(classeur, snapshotJson); } catch (e) {} }
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

/** Garantit les colonnes de l'onglet Equipes (migration douce d'un Sheet en service) : `source`,
 *  puis `nb_joueurs` / `nb_educateurs` (session 27). Les colonnes manquantes sont AJOUTÉES à la
 *  suite, dans l'ordre de ENTETES.Equipes — ecrireNouvelleEquipe écrit positionnellement. */
function assurerColonnesEquipes(classeur) {
  var onglet = classeur.getSheetByName('Equipes');
  if (!onglet) { creerOngletAvecEntetes(classeur, 'Equipes', ENTETES.Equipes); return classeur.getSheetByName('Equipes'); }
  ['source', 'nb_joueurs', 'nb_educateurs'].forEach(function (nom) {
    if (colClubInvite(onglet, nom) !== -1) return; // colClubInvite = simple recherche d'en-tête (réutilisée)
    var col = Math.max(onglet.getLastColumn(), 1) + 1;
    var cell = onglet.getRange(1, col);
    cell.setNumberFormat('@'); cell.setValue(nom);
    stylerEntete(cell); onglet.setFrozenRows(1);
  });
  return onglet;
}

/** Ancien nom conservé : d'autres appels historiques passent encore par là. */
function assurerColonneSourceEquipes(classeur) {
  return assurerColonnesEquipes(classeur);
}

/** Effectif déclaré lu d'une saisie : entier ≥ 0, ou null si vide/illisible (jamais deviné, jamais
 *  0 par défaut — « vide » et « zéro » sont deux réponses différentes). PUR. */
function effectifDeclare(valeur) {
  var s = String(valeur == null ? '' : valeur).trim();
  if (s === '') return null;
  var n = parseInt(s, 10);
  return (isFinite(n) && n >= 0) ? n : null;
}

/**
 * Écrit une NOUVELLE équipe (id auto + nom + catégorie + poule vide + source). Point de passage
 * unique : format TEXTE (@) forcé AVANT écriture (anti-injection de formule, comme avant).
 * @param {string} source 'manuel' (ajout à la main) ou 'auto' (synchronisation d'un club invité).
 */
function ecrireNouvelleEquipe(onglet, nom, categorie, source, nbJoueurs, nbEducateurs) {
  var id = genererIdEquipe(onglet);
  var ligne = onglet.getLastRow() + 1;
  var plage = onglet.getRange(ligne, 1, 1, ENTETES.Equipes.length);
  plage.setNumberFormat('@');
  var j = effectifDeclare(nbJoueurs), e = effectifDeclare(nbEducateurs);
  plage.setValues([[id, nom, categorie, '', source || 'manuel',
                    j == null ? '' : String(j), e == null ? '' : String(e)]]);
  return { id_equipe: id, nom_equipe: nom, categorie: categorie, poule: '', source: source || 'manuel',
           nb_joueurs: j == null ? '' : String(j), nb_educateurs: e == null ? '' : String(e) };
}

function ajouterEquipe(classeur, nom, categorie, nbJoueurs, nbEducateurs) {
  nom = (nom || '').toString().trim();
  categorie = (categorie || '').toString().trim();
  if (!nom)       return { error: "Le nom de l'équipe est vide." };
  if (!categorie) return { error: 'La catégorie est vide.' };
  var onglet = assurerColonnesEquipes(classeur); // garantit source + nb_joueurs + nb_educateurs
  var equipe = ecrireNouvelleEquipe(onglet, nom, categorie, 'manuel', nbJoueurs, nbEducateurs);
  return { ok: true, equipe: equipe };
}

/** Première ligne (1-indexée) où la colonne `colonne` vaut strictement `valeur`, ou -1 si absente.
 *  Recherche linéaire à partir de la ligne 2 (sous l'en-tête), comparaison String === String.
 *  Point de passage unique des scans « chercher une ligne par id » recopiés dans plusieurs fonctions. */
function trouverLigneParValeur(onglet, colonne, valeur) {
  var dernier = onglet.getLastRow();
  if (dernier < 2) return -1;
  var vals = onglet.getRange(2, colonne, dernier - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(valeur)) return i + 2;
  }
  return -1;
}

function supprimerEquipe(classeur, id) {
  var onglet = classeur.getSheetByName('Equipes');
  if (onglet.getLastRow() < 2) return { error: 'Aucune équipe à supprimer.' };
  var ligne = trouverLigneParValeur(onglet, colDe(ENTETES.Equipes, 'id_equipe'), id);
  if (ligne === -1) return { error: 'Équipe introuvable : ' + id };
  onglet.deleteRow(ligne);
  return { ok: true };
}

/**
 * Modifie une équipe existante : son nom, et — session 27 — ses effectifs déclarés
 * (nb_joueurs / nb_educateurs). Les effectifs ne sont écrits QUE s'ils sont fournis
 * (`undefined` ⇒ colonne laissée telle quelle) : un ancien client qui n'envoie que le nom ne
 * doit pas effacer des effectifs déjà saisis. Une chaîne VIDE, elle, efface volontairement.
 */
function modifierEquipe(classeur, id, nouveauNom, nbJoueurs, nbEducateurs) {
  nouveauNom = (nouveauNom || '').toString().trim();
  if (!id)         return { error: "Identifiant d'équipe manquant." };
  if (!nouveauNom) return { error: "Le nom de l'équipe est vide." };
  var onglet = assurerColonnesEquipes(classeur);
  if (onglet.getLastRow() < 2) return { error: 'Aucune équipe à modifier.' };
  var ligne = trouverLigneParValeur(onglet, colDe(ENTETES.Equipes, 'id_equipe'), id);
  if (ligne === -1) return { error: 'Équipe introuvable : ' + id };
  // Format TEXTE (@) forcé AVANT d'écrire : un nom commençant par « = + - @ » n'est pas
  // interprété comme une formule Google Sheets (anti-injection de formule, comme ajouterEquipe).
  var cellule = onglet.getRange(ligne, colDe(ENTETES.Equipes, 'nom_equipe'));
  cellule.setNumberFormat('@');
  cellule.setValue(nouveauNom);

  var maj = { id_equipe: id, nom_equipe: nouveauNom };
  [['nb_joueurs', nbJoueurs], ['nb_educateurs', nbEducateurs]].forEach(function (paire) {
    if (paire[1] === undefined || paire[1] === null) return;   // non fourni ⇒ on ne touche pas
    var col = colClubInvite(onglet, paire[0]);
    if (col === -1) return;
    var n = effectifDeclare(paire[1]);                          // '' ou illisible ⇒ efface
    var c = onglet.getRange(ligne, col);
    c.setNumberFormat('@');
    c.setValue(n == null ? '' : String(n));
    maj[paire[0]] = n == null ? '' : String(n);
  });
  return { ok: true, equipe: maj };
}

/** Supprime toutes les équipes d'une catégorie en une seule opération. */
function supprimerEquipesCategorie(classeur, categorie) {
  categorie = (categorie || '').toString().trim();
  if (!categorie) return { error: 'La catégorie est vide.' };
  var onglet = classeur.getSheetByName('Equipes');
  var dernier = onglet.getLastRow();
  if (dernier < 2) return { error: 'Aucune équipe à supprimer.' };
  // On supprime du bas vers le haut pour ne pas décaler les indices.
  var cats = onglet.getRange(2, colDe(ENTETES.Equipes, 'categorie'), dernier - 1, 1).getValues();
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
                'heure_rdv', 'heure_fin_communiquee', 'marge_fin_communiquee_min',
                'pause_echelonnee'];
  ecrireChampsConfig(onglet, data, champs);
  return { ok: true };
}

/**
 * Enregistre les INFOS du tournoi affichées côté public (carte d'actualité + page d'article) :
 * nom, date, lieu, adresse, description. Stockées comme paramètres globaux de l'onglet Config.
 */
function enregistrerInfosTournoi(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  // ⚠️ Écriture PARTIELLE : `ecrireChampsConfig` n'écrit que les champs REÇUS. Chaque carte de
  // l'admin envoie donc les siens sans écraser ceux des autres — c'est ce qui permet à cette
  // action de porter aussi `zone_vacances` (carte « Date & conformité FFR ») et
  // `perfs_mot_cle_club` (carte « Équipes »), sans action serveur dédiée.
  var champs = ['tournoi_nom', 'tournoi_date', 'tournoi_lieu', 'tournoi_adresse', 'tournoi_description',
    'zone_vacances', 'perfs_mot_cle_club'];
  ecrireChampsConfig(onglet, data, champs);
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
  ecrireChampsConfig(onglet, data, CHAMPS_CONTACTS_SECURITE);
  return { ok: true };
}

/**
 * Enregistre le PLAN DES TERRAINS physiques utilisé par la répartition automatique.
 * Trois paramètres GLOBAUX (stockés dans l'onglet Config, relus par getConfig/getAll) :
 *   - terrains_physiques    : JSON [{nom,nature,type,L,W}, …] — les grands terrains réels
 *                             (rugby/foot) ; `nature` = surface de jeu (Gazon, Synthétique…),
 *                             reprise par la demande d'autorisation (naturesTerrainsAutorisation).
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
  ecrireChampsConfig(onglet, data, champs);
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
/**
 * Cœur du dépôt d'image : valide un Data URI, crée le fichier Drive et le rend public en
 * lecture. Renvoie { ok, id } ou { error }. NE TOUCHE PAS au classeur — c'est l'appelant qui
 * décide où l'identifiant est rangé (paramètre de Config, colonne de l'onglet Sponsors…).
 */
function creerFichierImageDrive(uri, nomFichier) {
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
  var fichier = DriveApp.createFile(Utilities.newBlob(octets, type, nomFichier));
  try { fichier.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return { ok: true, id: fichier.getId() };
}

/** Met un fichier Drive à la corbeille sans jamais faire échouer l'appelant. */
function corbeilleFichierDrive(id) {
  if (!id) return;
  try { DriveApp.getFileById(String(id)).setTrashed(true); } catch (e) {}
}

function enregistrerImageConfig(classeur, uri, champCle, nomFichier) {
  var depot = creerFichierImageDrive(uri, nomFichier);
  if (depot.error) return depot;

  var onglet = classeur.getSheetByName('Config');
  corbeilleFichierDrive((lireConfig(classeur).global || {})[champCle]);
  ecrireParamGlobal(onglet, champCle, depot.id);
  return { ok: true, id: depot.id };
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

/* ===================== PARTENAIRES — écriture (écran admin « Partenaires ») =====================
 * Trois actions seulement : lister (lecture admin), enregistrer une fiche (création OU mise à
 * jour, logo et visuel compris), supprimer une fiche. Les RÉGLAGES d'affichage (durées,
 * interrupteurs) sont des paramètres globaux de Config et passent par enregistrerReglagesSponsors.
 * =============================================================================================== */

/**
 * Emplacements reconnus (A à F). Tout autre jeton est ignoré à l'écriture.
 *  A-E : page publique des scores.
 *  F `dossier` : bandeau permanent en tête du DOSSIER CLUB. Volontairement limité à cette
 *  forme — un club qui ouvre son dossier cherche une information (horaire, parking,
 *  contact) et ne doit JAMAIS attendre derrière un message plein écran.
 */
var SPONSOR_EMPLACEMENTS_OK = { bandeau: true, rail: true, fil: true, plein: true, mur: true,
                                dossier: true };

/**
 * Réglages d'affichage des partenaires : nom du paramètre → borne min, borne max, défaut.
 * Les bornes ne sont pas décoratives : elles empêchent qu'une faute de frappe dans l'admin
 * (« 500 » au lieu de « 5 ») ne transforme l'interstitiel en écran bloquant le jour du tournoi.
 */
var SPONSOR_REGLAGES_NUM = {
  sponsor_rotation_s:                 { min: 0, max: 60,  defaut: 8 },
  sponsor_interstitiel_duree_s:       { min: 3, max: 10,  defaut: 5 },
  sponsor_interstitiel_skip_s:        { min: 0, max: 10,  defaut: 2 },
  sponsor_interstitiel_repos_min:     { min: 1, max: 240, defaut: 30 }
};
/** Réglages oui/non. Défaut prudent : tout est éteint sauf le mur et la barre mobile. */
var SPONSOR_REGLAGES_BOOL = {
  sponsors_actifs:                      'non',
  sponsor_interstitiel_actif:           'non',
  sponsor_interstitiel_premiere_visite: 'non',
  sponsors_mur_actif:                   'oui',
  sponsor_barre_mobile:                 'oui'
};

/** Dispositions reconnues d'un logo dans son encart. Tout autre jeton retombe sur le défaut
 *  de l'emplacement (voir SPONSORS_DISPO_DEFAUT côté frontend). */
var SPONSOR_DISPOSITIONS_OK = { gauche: true, droite: true, haut: true, seul: true };

/**
 * Nettoie les réglages PAR EMPLACEMENT reçus de l'admin.
 *
 * Reconstruction champ par champ, comme partout ailleurs dans ce fichier : ce qui n'est pas
 * prévu ici n'est jamais stocké. Un emplacement inconnu, une disposition inventée ou un zoom
 * fantaisiste sont écartés en silence plutôt que d'aller polluer la page publique.
 *
 * @returns {string} JSON compact, ou '' si rien de valide n'a été fourni.
 */
function nettoyerReglagesEmplacements(brut) {
  var recu = brut;
  if (typeof recu === 'string') {
    try { recu = JSON.parse(recu); } catch (e) { return ''; }
  }
  if (!recu || typeof recu !== 'object') return '';

  var propre = {};
  Object.keys(recu).forEach(function (emplacement) {
    if (!SPONSOR_EMPLACEMENTS_OK[emplacement]) return;
    var r = recu[emplacement] || {};
    var bloc = {};

    var texte = String(r.texte == null ? '' : r.texte).trim().slice(0, 80);
    if (texte) bloc.texte = texte;

    var zoom = parseInt(r.zoom, 10);
    if (isFinite(zoom)) bloc.zoom = Math.max(50, Math.min(200, zoom));

    var dispo = String(r.dispo || '').toLowerCase();
    if (SPONSOR_DISPOSITIONS_OK[dispo]) bloc.dispo = dispo;

    if (Object.keys(bloc).length) propre[emplacement] = bloc;
  });

  return Object.keys(propre).length ? JSON.stringify(propre) : '';
}

/** Ramène une valeur numérique dans ses bornes ; valeur absente ou illisible ⇒ défaut. */
function bornerReglageSponsor(valeur, regle) {
  var n = parseInt(valeur, 10);
  if (!isFinite(n)) return regle.defaut;
  return Math.max(regle.min, Math.min(regle.max, n));
}

/**
 * Enregistre les réglages d'affichage des partenaires (onglet Config, zone des paramètres
 * globaux). Seuls les champs PRÉSENTS dans la requête sont écrits — chaque carte de l'admin
 * n'envoie que les siens, comme les autres formulaires du fichier.
 */
function enregistrerReglagesSponsors(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return { error: 'Onglet Config introuvable.' };

  Object.keys(SPONSOR_REGLAGES_BOOL).forEach(function (cle) {
    if (!Object.prototype.hasOwnProperty.call(data, cle)) return;
    ecrireParamGlobal(onglet, cle, (String(data[cle]).toLowerCase() === 'oui') ? 'oui' : 'non');
  });
  Object.keys(SPONSOR_REGLAGES_NUM).forEach(function (cle) {
    if (!Object.prototype.hasOwnProperty.call(data, cle)) return;
    ecrireParamGlobal(onglet, cle, bornerReglageSponsor(data[cle], SPONSOR_REGLAGES_NUM[cle]));
  });

  // Cohérence : on ne peut pas rendre le bouton « Passer » disponible APRÈS la fermeture
  // automatique — l'interstitiel serait impossible à écourter. On rabote silencieusement.
  var g = lireConfig(classeur).global || {};
  var duree = bornerReglageSponsor(g.sponsor_interstitiel_duree_s, SPONSOR_REGLAGES_NUM.sponsor_interstitiel_duree_s);
  var skip  = bornerReglageSponsor(g.sponsor_interstitiel_skip_s,  SPONSOR_REGLAGES_NUM.sponsor_interstitiel_skip_s);
  if (skip > duree) ecrireParamGlobal(onglet, 'sponsor_interstitiel_skip_s', duree);

  return { ok: true };
}

/** Toutes les fiches partenaires, actives ou non (écran admin). Lecture protégée par la clé admin. */
function listerSponsors(classeur) {
  assurerOngletSponsors(classeur);
  return { ok: true, sponsors: lireOngletSimple(classeur, 'Sponsors') };
}

/** Index (1-based, ligne du Sheet) d'un partenaire par son identifiant ; -1 si absent. */
function ligneSponsor(onglet, idSponsor) {
  var donnees = onglet.getDataRange().getValues();
  for (var i = 1; i < donnees.length; i++) {
    if (String(donnees[i][0]) === String(idSponsor)) return i + 1;
  }
  return -1;
}

/**
 * Crée ou met à jour une fiche partenaire.
 *  - sans `id_sponsor` → création (identifiant tiré au sort) ;
 *  - avec `id_sponsor` → mise à jour de la ligne existante.
 * `logo` et `visuel` sont des Data URI facultatifs : fournis, ils remplacent l'image et
 * l'ancienne part à la corbeille ; absents, l'image en place est conservée telle quelle.
 * `logo_retirer` / `visuel_retirer` permettent de repasser à « pas d'image ».
 */
function enregistrerSponsor(classeur, data) {
  var onglet = assurerOngletSponsors(classeur);

  var nom = String(data.nom || '').trim();
  if (!nom) return { error: 'Le nom du partenaire est obligatoire.' };

  var id = String(data.id_sponsor || '').trim();
  var ligne = id ? ligneSponsor(onglet, id) : -1;
  if (id && ligne === -1) return { error: 'Partenaire introuvable (a-t-il été supprimé ?).' };

  // Valeurs déjà en place (mise à jour) : servent de repli pour les images non renvoyées.
  var existant = {};
  if (ligne !== -1) {
    var entetes = onglet.getRange(1, 1, 1, ENTETES.Sponsors.length).getValues()[0];
    var valeurs = onglet.getRange(ligne, 1, 1, ENTETES.Sponsors.length).getValues()[0];
    for (var e = 0; e < entetes.length; e++) existant[entetes[e]] = valeurs[e];
  }

  // Images : dépôt sur Drive AVANT toute écriture dans le Sheet, pour ne jamais laisser une
  // ligne pointer vers un fichier qui n'existe pas.
  var logoId   = String(existant.logo_id || '');
  var visuelId = String(existant.visuel_id || '');
  if (data.logo) {
    var dlogo = creerFichierImageDrive(data.logo, 'sponsor-logo-' + nom);
    if (dlogo.error) return dlogo;
    corbeilleFichierDrive(logoId);
    logoId = dlogo.id;
  } else if (String(data.logo_retirer) === 'oui') {
    corbeilleFichierDrive(logoId);
    logoId = '';
  }
  if (data.visuel) {
    var dvisuel = creerFichierImageDrive(data.visuel, 'sponsor-visuel-' + nom);
    if (dvisuel.error) return dvisuel;
    corbeilleFichierDrive(visuelId);
    visuelId = dvisuel.id;
  } else if (String(data.visuel_retirer) === 'oui') {
    corbeilleFichierDrive(visuelId);
    visuelId = '';
  }

  // Emplacements : on ne garde que les jetons connus (une valeur inventée côté client ne doit
  // pas créer un emplacement fantôme que la page publique ignorerait en silence).
  var emplacements = String(data.emplacements || '').split(',')
    .map(function (x) { return x.trim().toLowerCase(); })
    .filter(function (x) { return SPONSOR_EMPLACEMENTS_OK[x]; });
  // Aucun emplacement coché ⇒ le mur, le plus discret : une fiche enregistrée s'affiche toujours
  // quelque part, sinon l'organisateur croit avoir perdu sa saisie.
  if (!emplacements.length) emplacements = ['mur'];

  var poids = parseInt(data.poids, 10);
  if (!isFinite(poids)) poids = 1;
  poids = Math.max(1, Math.min(5, poids));

  var ordre = parseInt(data.ordre, 10);
  if (!isFinite(ordre)) ordre = 100;

  // Taille du logo en % de la référence. Bornée : en dessous de 50 le logo devient
  // illisible, au-dessus de 200 il déborde de son emplacement et pousse l'accroche
  // hors de l'écran sur téléphone.
  var zoom = parseInt(data.logo_zoom, 10);
  if (!isFinite(zoom)) zoom = 100;
  zoom = Math.max(50, Math.min(200, zoom));

  var couleur = String(data.couleur || '').trim();
  if (couleur && !/^#[0-9a-fA-F]{6}$/.test(couleur)) couleur = '';

  var reglagesEmplacements = nettoyerReglagesEmplacements(data.reglages_emplacements);

  if (!id) id = 'SP' + Utilities.getUuid().slice(0, 8).toUpperCase();

  var valeursLigne = [[
    id, nom, logoId,
    String(data.url || '').trim(),
    String(data.accroche || '').trim(),
    emplacements.join(','),
    poids, visuelId, couleur,
    (String(data.actif).toLowerCase() === 'oui') ? 'oui' : 'non',
    ordre, zoom, reglagesEmplacements
  ]];

  var cible = (ligne !== -1) ? ligne : onglet.getLastRow() + 1;
  var plage = onglet.getRange(cible, 1, 1, ENTETES.Sponsors.length);
  plage.setNumberFormat('@'); // tout en texte : un id « SP0012 » ne doit pas devenir un nombre
  plage.setValues(valeursLigne);

  return { ok: true, id_sponsor: id };
}

/* ===================== RELEVÉS DE VISIBILITÉ (consolidation entre appareils) =====================
 * Chaque navigateur qui affiche des partenaires dépose ici, quelques fois par visite, le
 * CUMUL de ce qu'il a vu. L'écran admin additionne ensuite tous les appareils pour produire
 * la fiche envoyée au partenaire.
 *
 * Deux propriétés rendent le total juste sans coordination :
 *  • les relevés sont CUMULATIFS (pas des écarts) → un relevé perdu ne perd que le temps
 *    écoulé depuis le précédent, jamais tout l'historique de la session ;
 *  • la consolidation prend le MAXIMUM par session → un relevé arrivé deux fois ne compte
 *    pas double. C'est ce qui permet d'écrire sans verrou et sans jamais relire.
 * ============================================================================================ */

/** Garde-fous de la charge utile publique. Au-delà, le relevé est refusé sans discussion. */
var MESURE_MAX_SPONSORS  = 40;        // bien au-delà d'un vrai tournoi
var MESURE_MAX_SECONDES  = 24 * 3600; // une journée : au-delà, la valeur est absurde
var MESURE_MAX_COMPTEUR  = 100000;    // affichages / clics d'une seule session

/* ---------- Plafonds de DÉBIT et de VOLUME de l'écriture publique (audit C, R-014) ----------
 *
 * `mesureSponsors` est la SEULE écriture sans clé du fichier (voir doPost). Elle est publique
 * à raison : les spectateurs n'ont évidemment pas de mot de passe. Mais jusqu'ici elle n'avait
 * AUCUNE limite — ni par appareil, ni par minute, ni par jour. N'importe qui pouvait donc
 * envoyer des relevés en boucle jusqu'à remplir l'onglet Mesures, et par ricochet le classeur
 * (limite Google : 10 millions de cases). Un classeur plein, c'est PLUS AUCUNE ÉCRITURE
 * possible : ni les scores, ni les équipes. Le jour du tournoi, la saisie s'arrête.
 *
 * Trois garde-fous, énoncés du plus fiable au moins fiable :
 *
 *  1. MESURE_MAX_LIGNES — plafond DUR sur la taille de l'onglet, lu directement dans le
 *     classeur. Déterministe et incontournable : c'est LUI qui garantit que le classeur ne
 *     peut plus être rempli par cette porte. Les deux autres ne font que réduire le débit.
 *  2. MESURE_MAX_FENETRE — débit global, tous appareils confondus, par tranche de 6 h.
 *  3. MESURE_MAX_APPAREIL — débit d'un même appareil, par tranche d'une heure. L'identifiant
 *     d'appareil étant choisi par le client, ce plafond n'arrête PAS quelqu'un de déterminé
 *     (il lui suffit d'en changer) : il arrête une page partie en boucle, ce qui est le cas
 *     de loin le plus probable.
 *
 * Les plafonds 2 et 3 s'appuient sur CacheService, qui n'est pas transactionnel : ils sont
 * « best-effort », exactement comme le compteur anti-force-brute des clés plus haut. Ils
 * plafonnent fortement le débit sans prétendre à l'exactitude.
 *
 * ⚠️ HONNÊTETÉ SUR LA PORTÉE : ces plafonds suppriment le dégât DURABLE (le classeur rempli)
 * et rendent l'abus beaucoup plus coûteux — une requête refusée n'ouvre pas le classeur, elle
 * coûte une lecture de cache au lieu d'une demi-seconde. Ils ne rendent PAS l'adresse immunisée
 * contre un envoi massif : Apps Script ne fournit pas l'adresse du visiteur, on ne peut donc
 * pas distinguer un abuseur d'un spectateur. Ce qui est visé, et atteint, c'est qu'un abus
 * n'empêche plus jamais la SAISIE DES SCORES.
 *
 * Dépassement = la requête répond OK sans rien écrire. Une mesure d'audience est une donnée de
 * confort : jamais un score, jamais une équipe, jamais un club. Rien d'autre n'est affecté.
 *
 * Ce qui n'est PAS traité ici, volontairement : la PURGE automatique des vieux relevés
 * (point C-09 de la cartographie). Tant qu'elle n'existe pas, l'onglet finit par atteindre le
 * plafond dur et la mesure s'arrête — sans rien casser. L'organisateur dispose du bouton
 * « Vider les relevés » de l'écran Partenaires. */
var MESURE_MAX_LIGNES   = 100000; // lignes de l'onglet Mesures (~5 % de la limite du classeur)
var MESURE_FENETRE_S    = 21600;  // 6 h — durée de vie maximale d'une entrée de CacheService
var MESURE_MAX_FENETRE  = 30000;  // relevés acceptés par tranche de 6 h, tous appareils
var MESURE_APPAREIL_S   = 3600;   // 1 h
var MESURE_MAX_APPAREIL = 30;     // relevés acceptés par appareil et par heure (la page en
                                  // envoie un toutes les 10 min : 5× la cadence légitime)

/**
 * CŒUR PUR du plafonnement (testable sans classeur ni cache) : à partir des trois compteurs,
 * dit s'il faut refuser le relevé, et pourquoi. Chaîne vide = on écrit.
 * Les compteurs valent le rang du relevé COURANT (1 pour le premier), d'où les comparaisons
 * strictes : le 30 000ᵉ relevé d'une fenêtre passe encore, le 30 001ᵉ non.
 * Un compteur à 0 signifie « inconnu » (cache indisponible) et n'entraîne jamais de refus :
 * une panne de cache ne doit pas éteindre la mesure.
 */
function mesureMotifRefus(nbLignes, nbFenetre, nbAppareil) {
  if (nbLignes   > MESURE_MAX_LIGNES)   return 'plafond_lignes';
  if (nbFenetre  > MESURE_MAX_FENETRE)  return 'debit_global';
  if (nbAppareil > MESURE_MAX_APPAREIL) return 'debit_appareil';
  return '';
}

/**
 * Incrémente un compteur de fenêtre dans le cache serveur et renvoie sa nouvelle valeur.
 * La clé porte le NUMÉRO DE FENÊTRE (et non un simple compteur reconduit) : sans cela, chaque
 * écriture repousserait la durée de vie et le plafond, une fois atteint, ne se relâcherait
 * jamais tant que le trafic dure — on bloquerait les spectateurs légitimes indéfiniment.
 * Renvoie 0 si le cache est indisponible : on n'échoue jamais une requête pour un compteur.
 */
function mesureCompteurFenetre(cache, prefixe, dureeS, maintenantMs) {
  try {
    var fenetre = Math.floor(maintenantMs / (dureeS * 1000));
    var cle = prefixe + fenetre;
    var n = (parseInt(cache.get(cle), 10) || 0) + 1;
    cache.put(cle, String(n), dureeS);
    return n;
  } catch (e) { return 0; }
}

/**
 * Les plafonds de DÉBIT sont-ils respectés ? Appelée par doPost AVANT d'ouvrir le classeur
 * (`openById` coûte à lui seul ~0,5 s) : une requête refusée doit être bon marché, sinon le
 * garde-fou coûterait presque aussi cher que l'abus qu'il empêche.
 * Le plafond de VOLUME (nombre de lignes), lui, exige le classeur : il est vérifié plus bas,
 * dans enregistrerMesureSponsors.
 * @return {{ok:boolean, motif:string}}
 */
function mesureDebitAutorise(data) {
  var appareil = mesureIdentifiant(data && data.appareil);
  if (!appareil) return { ok: false, motif: 'identifiant' };

  var cache;
  try { cache = CacheService.getScriptCache(); } catch (e) { cache = null; }
  if (!cache) return { ok: true, motif: '' }; // pas de cache : on laisse passer (plafond dur en aval)

  var maintenant = new Date().getTime();
  var motif = mesureMotifRefus(
    0, // le nombre de lignes n'est pas connu ici : il exige le classeur
    mesureCompteurFenetre(cache, 'mesure_total_', MESURE_FENETRE_S, maintenant),
    mesureCompteurFenetre(cache, 'mesure_app_' + appareil + '_', MESURE_APPAREIL_S, maintenant));
  return { ok: !motif, motif: motif };
}

/** Entier borné, quelle que soit la fantaisie reçue. */
function mesureEntier(v, maxi) {
  var n = parseInt(v, 10);
  if (!isFinite(n) || n < 0) return 0;
  return Math.min(n, maxi);
}

/** Identifiant aléatoire acceptable : court, alphanumérique. Sinon chaîne vide. */
function mesureIdentifiant(v) {
  var s = String(v || '').trim();
  return /^[A-Za-z0-9_-]{4,40}$/.test(s) ? s : '';
}

/**
 * Enregistre UN relevé de visibilité. Appelée sans clé (les spectateurs n'en ont pas), donc
 * tout est revalidé ici : identifiants, nombre de partenaires, bornes de chaque compteur.
 * Rien de ce qui entre n'est cru sur parole, et rien n'est jamais réinjecté ailleurs.
 *
 * N'utilise PAS de verrou : `appendRow` ajoute en fin d'onglet, et deux relevés simultanés
 * qui se marcheraient dessus ne coûteraient qu'une mesure d'audience — jamais un score.
 */
function enregistrerMesureSponsors(classeur, data) {
  var appareil = mesureIdentifiant(data.appareil);
  var session  = mesureIdentifiant(data.session);
  if (!appareil || !session) return { error: 'Relevé invalide.' };

  var brut = data.sponsors;
  if (!brut || typeof brut !== 'object') return { error: 'Relevé invalide.' };

  var ids = Object.keys(brut);
  if (!ids.length || ids.length > MESURE_MAX_SPONSORS) return { error: 'Relevé invalide.' };

  // Reconstruction champ par champ : ce qui n'est pas prévu ici ne sera jamais stocké.
  var propre = {};
  for (var i = 0; i < ids.length; i++) {
    var id = mesureIdentifiant(ids[i]);
    if (!id) continue;
    var f = brut[ids[i]] || {};
    var expo = {}, aff = {}, tranches = {};

    Object.keys(f.expo || {}).slice(0, 10).forEach(function (k) {
      expo[String(k).slice(0, 20)] = mesureEntier(f.expo[k], MESURE_MAX_SECONDES);
    });
    Object.keys(f.aff || {}).slice(0, 20).forEach(function (k) {
      aff[String(k).slice(0, 20)] = mesureEntier(f.aff[k], MESURE_MAX_COMPTEUR);
    });
    // Une journée = 48 tranches de 30 min ; on borne large pour absorber un fuseau exotique.
    Object.keys(f.tranches || {}).slice(0, 60).forEach(function (k) {
      tranches[String(k).slice(0, 5)] = mesureEntier(f.tranches[k], MESURE_MAX_SECONDES);
    });

    propre[id] = {
      expo: expo,
      aff: aff,
      clics: mesureEntier(f.clics, MESURE_MAX_COMPTEUR),
      plein: {
        ouverts:  mesureEntier((f.plein || {}).ouverts, MESURE_MAX_COMPTEUR),
        secondes: mesureEntier((f.plein || {}).secondes, MESURE_MAX_SECONDES),
        passes:   mesureEntier((f.plein || {}).passes, MESURE_MAX_COMPTEUR)
      },
      tranches: tranches
    };
  }
  if (!Object.keys(propre).length) return { error: 'Relevé invalide.' };

  var onglet = assurerOngletMesures(classeur);

  // PLAFOND DUR de volume (R-014) : au-delà, on n'écrit plus une seule ligne. C'est ce qui
  // rend définitivement impossible de remplir le classeur par cette porte — et donc de bloquer
  // la saisie des scores. Lecture d'une seule valeur (getLastRow), donc sans coût notable.
  // On journalise : un plafond atteint en silence ressemblerait à une panne inexplicable.
  if (onglet.getLastRow() > MESURE_MAX_LIGNES) {
    Logger.log('mesureSponsors : plafond de ' + MESURE_MAX_LIGNES + ' lignes atteint dans l\'onglet ' +
               'Mesures — relevé ignoré. Vider les relevés depuis l\'écran Partenaires.');
    return { ok: true, ignore: 'plafond_lignes' };
  }

  var maintenant = new Date();
  onglet.appendRow([
    Utilities.formatDate(maintenant, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    Utilities.formatDate(maintenant, Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    appareil, session, JSON.stringify(propre)
  ]);
  return { ok: true };
}

/**
 * Relevés bruts d'une journée, pour l'écran admin (protégé par la clé admin). C'est l'admin
 * qui consolide : le backend ne fait que servir les lignes, sans calcul, pour rester court.
 * @param data.jour AAAA-MM-JJ ; vide ⇒ aujourd'hui.
 */
/**
 * Journée au format AAAA-MM-JJ, que la cellule contienne du TEXTE ou une vraie DATE.
 *
 * ⚠️ PIÈGE QUI A COÛTÉ CHER — à ne pas « simplifier ».
 * `appendRow` reçoit la chaîne « 2026-08-03 », mais Google Sheets RECONNAÎT une date et
 * convertit la cellule : à la relecture, `getValues()` renvoie un objet Date, pas la chaîne
 * écrite. Comparer `String(cellule)` à « 2026-08-03 » donnait alors
 * « Mon Aug 03 2026 00:00:00 GMT+0200 » ≠ « 2026-08-03 » — donc AUCUNE ligne ne
 * correspondait jamais. Les relevés arrivaient bien dans le Sheet, mais la fiche annonçait
 * « aucun relevé remonté » : une panne invisible, qui ressemblait à un problème de
 * déploiement. On normalise donc les deux formes, ici et une seule fois.
 */
function mesureJourTexte(valeur) {
  if (valeur instanceof Date) {
    return Utilities.formatDate(valeur, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(valeur == null ? '' : valeur).trim().slice(0, 10);
}

function lireMesuresSponsors(classeur, data) {
  var onglet = classeur.getSheetByName('Mesures');
  if (!onglet) return { ok: true, jour: '', releves: [], total: 0 };

  var jour = String((data && data.jour) || '').trim() ||
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  var lignes = lireOngletSimple(classeur, 'Mesures');
  var releves = [];
  var jours = {};
  for (var i = 0; i < lignes.length; i++) {
    var jourLigne = mesureJourTexte(lignes[i].jour);
    jours[jourLigne] = (jours[jourLigne] || 0) + 1;
    if (jourLigne !== jour) continue;
    var donnees = null;
    try { donnees = JSON.parse(lignes[i].donnees); } catch (e) { continue; }
    if (!donnees) continue;
    releves.push({
      appareil: String(lignes[i].appareil),
      session: String(lignes[i].session),
      sponsors: donnees
    });
  }
  // `total` et `jours` servent au diagnostic de l'admin : ils permettent de distinguer
  // « aucun relevé n'est jamais arrivé » de « des relevés existent, mais pas pour ce jour ».
  return { ok: true, jour: jour, releves: releves, total: lignes.length, jours: jours };
}

/** Efface tous les relevés (bouton « repartir de zéro » de l'admin). Les fiches ne bougent pas. */
function viderMesuresSponsors(classeur) {
  var onglet = classeur.getSheetByName('Mesures');
  if (!onglet) return { ok: true, effaces: 0 };
  var dernier = onglet.getLastRow();
  var effaces = Math.max(0, dernier - 1);
  if (effaces > 0) onglet.deleteRows(2, effaces);
  return { ok: true, effaces: effaces };
}

/** Supprime une fiche partenaire et met ses images à la corbeille. */
function supprimerSponsor(classeur, data) {
  var onglet = assurerOngletSponsors(classeur);
  var ligne = ligneSponsor(onglet, String(data.id_sponsor || ''));
  if (ligne === -1) return { error: 'Partenaire introuvable.' };

  var valeurs = onglet.getRange(ligne, 1, 1, ENTETES.Sponsors.length).getValues()[0];
  corbeilleFichierDrive(valeurs[2]); // logo_id
  corbeilleFichierDrive(valeurs[7]); // visuel_id
  onglet.deleteRow(ligne);
  return { ok: true };
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
  ecrireChampsConfig(onglet, data, CHAMPS_INVITATION);
  return { ok: true };
}

/* ===================== PHASE 1 — INVITATION LÉGÈRE ===================== */

/* « Sur place » (Phase 1) : pastilles affichées sur invitation-club.html seulement si 'oui'. */
var CHAMPS_SURPLACE = ['buvette_disponible', 'espace_sandwich_disponible', 'boutique_disponible'];

/* « Réponse à l'invitation » (Phase 1). email_expediteur = alias « Envoyer en tant que »
   (config d'infrastructure) : NON effacé par une réinitialisation, contrairement aux autres. */
var CHAMPS_REPONSE = ['date_limite_reponse', 'contact_reponse_nom', 'contact_reponse_tel',
  'contact_reponse_email', 'email_expediteur'];

/**
 * Enregistre la carte « Sur place » (Phase 1) : 3 booléens rangés en 'oui'/'non'
 * (défaut 'non' : seul 'oui' affiche la pastille).
 */
function enregistrerSurPlace(classeur, data) {
  var onglet = classeur.getSheetByName('Config');
  // Normalise les booléens en 'oui'/'non' sur data AVANT l'écriture groupée.
  CHAMPS_SURPLACE.forEach(function (champ) {
    if (data[champ] != null) data[champ] = String(data[champ]).toLowerCase() === 'oui' ? 'oui' : 'non';
  });
  ecrireChampsConfig(onglet, data, CHAMPS_SURPLACE);
  return { ok: true };
}

/**
 * Enregistre la carte « Réponse à l'invitation » (Phase 1).
 *  - date_limite_reponse : AAAA-MM-JJ ou vide ;
 *  - contact_reponse_tel : 10 chiffres, normalisé (espaces/points/tirets retirés) ;
 *  - contact_reponse_email / email_expediteur : format email si renseignés ;
 *  - VALIDATION CROISÉE : au moins un des deux contacts (tél OU email) doit être renseigné
 *    (sinon l'enregistrement est bloqué avec un message clair).
 */
function enregistrerReponseInvitation(classeur, data) {
  var onglet = classeur.getSheetByName('Config');

  var d = String(data.date_limite_reponse == null ? '' : data.date_limite_reponse).trim();
  if (d !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return { error: 'Date limite de réponse invalide : format AAAA-MM-JJ attendu.' };
  }

  var tel = String(data.contact_reponse_tel == null ? '' : data.contact_reponse_tel).trim();
  if (tel !== '') {
    var norme = normaliserTelephone(tel);
    if (!norme) {
      return { error: 'Téléphone du contact réponse invalide : 10 chiffres attendus '
               + '(espaces, points ou tirets acceptés).' };
    }
    data.contact_reponse_tel = norme;
    tel = norme;
  }

  var email = String(data.contact_reponse_email == null ? '' : data.contact_reponse_email).trim();
  if (email !== '' && !estEmailValide(email)) {
    return { error: 'Email du contact réponse invalide : « ' + email + ' ».' };
  }
  var exp = String(data.email_expediteur == null ? '' : data.email_expediteur).trim();
  if (exp !== '' && !estEmailValide(exp)) {
    return { error: 'Email expéditeur invalide : « ' + exp + ' ».' };
  }

  // Au moins un des deux contacts (tél OU email) doit être renseigné.
  if (tel === '' && email === '') {
    return { error: 'Renseigne au moins un contact de réponse : téléphone OU email.' };
  }

  ecrireChampsConfig(onglet, data, CHAMPS_REPONSE);
  return { ok: true };
}

/** Vrai si `v` a la forme d'une adresse email (contrôle volontairement simple/robuste). */
function estEmailValide(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

/* ===================== CLUBS INVITÉS ===================== */

/* Statuts admis d'un club invité (formes canoniques, avec accents).
   « Confirmé » (ancien libellé) est reconnu comme un alias d'« Accepté » à la lecture. */
var STATUTS_CLUB_INVITE = ['Invité', 'Accepté', 'Décliné'];

/** Comparaison de textes SANS accents ni casse (piège NFC/NFD du Sheet : « Invité »
 *  peut revenir avec un é décomposé — même précaution que estTermine). */
/** Forme \u00ab plate \u00bb d'un texte pour comparaison souple : sans accents (NFD), sans casse ni
 *  espaces de bord. Point de passage UNIQUE (pi\u00e8ge NFC/NFD du Sheet : \u00ab Invit\u00e9 \u00bb peut revenir
 *  avec un \u00e9 d\u00e9compos\u00e9). Utilis\u00e9 par memeTexteSouple() ET l'index nom\u2192ligne des envois group\u00e9s. */
function normaliserTexteSouple(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

function memeTexteSouple(a, b) {
  return normaliserTexteSouple(a) === normaliserTexteSouple(b);
}

/** Statut canonique ('Invité'/'Accepté'/'Décliné') depuis une saisie, ou '' si inconnu.
 *  « Confirmé » (ancien libellé, encore présent dans des Sheets en service) est mappé
 *  sur « Accepté » pour que les données existantes restent lisibles. */
function statutClubCanonique(valeur) {
  if (memeTexteSouple(valeur, 'Confirmé')) return 'Accepté';
  for (var i = 0; i < STATUTS_CLUB_INVITE.length; i++) {
    if (memeTexteSouple(valeur, STATUTS_CLUB_INVITE[i])) return STATUTS_CLUB_INVITE[i];
  }
  return '';
}

/** Crée l'onglet ClubsInvites s'il manque, puis garantit ses colonnes (migration douce). */
function assurerOngletClubsInvites(classeur) {
  var onglet = classeur.getSheetByName('ClubsInvites');
  if (!onglet) creerOngletAvecEntetes(classeur, 'ClubsInvites', ENTETES.ClubsInvites);
  return assurerColonnesClubsInvites(classeur);
}

/**
 * Migration douce : garantit que l'onglet ClubsInvites possède TOUTES les colonnes de
 * ENTETES.ClubsInvites. Les colonnes manquantes (Sheet créé avant l'évolution en deux
 * phases) sont ajoutées À DROITE des en-têtes existantes, sans toucher aux données déjà
 * présentes ni à l'ordre des colonnes d'origine.
 */
function assurerColonnesClubsInvites(classeur) {
  var onglet = classeur.getSheetByName('ClubsInvites');
  if (!onglet) { creerOngletAvecEntetes(classeur, 'ClubsInvites', ENTETES.ClubsInvites); return classeur.getSheetByName('ClubsInvites'); }
  var largeur = Math.max(onglet.getLastColumn(), 1);
  var entetes = onglet.getRange(1, 1, 1, largeur).getValues()[0];
  var presents = {};
  var derniere = 0;
  for (var i = 0; i < entetes.length; i++) {
    if (entetes[i] !== '' && entetes[i] !== null) { presents[entetes[i]] = true; derniere = i + 1; }
  }
  var manquants = ENTETES.ClubsInvites.filter(function (h) { return !presents[h]; });
  if (manquants.length) {
    var zone = onglet.getRange(1, derniere + 1, 1, manquants.length);
    zone.setNumberFormat('@');
    zone.setValues([manquants]);
    stylerEntete(zone);
    onglet.setFrozenRows(1);
  }
  return onglet;
}

/** Colonne (1-based) d'un en-tête dans l'onglet ClubsInvites, ou -1 si absent. */
function colClubInvite(onglet, nomEntete) {
  var entetes = onglet.getRange(1, 1, 1, Math.max(onglet.getLastColumn(), 1)).getValues()[0];
  for (var i = 0; i < entetes.length; i++) { if (entetes[i] === nomEntete) return i + 1; }
  return -1;
}

/**
 * Lecture PUBLIQUE d'un club pour le dossier Phase 2 (dossier-club.html?club=…).
 * Ne renvoie QUE des champs non sensibles — JAMAIS l'email de contact. Comparaison souple
 * sur le nom (clé). { ok:true, club:null } si le club est absent / non renseigné.
 */
/**
 * Infos NON sensibles d'un club pour son dossier (accueil personnalisé + filtrage du format
 * sportif) — PROTÉGÉ PAR JETON (mêmes garanties que getReponseInvitation). Sans jeton valide,
 * erreur générique : aucune donnée révélée, aucun email jamais renvoyé.
 */
function getClubDossier(classeur, params) {
  var club = trouverClubParToken(classeur, params.club, params.token);
  if (!club) return { error: 'Lien invalide ou expiré.' };

  var config = lireConfig(classeur);
  var g = config.global || {};
  var aujourdhui = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return dossierClubPur(
    club,
    lireOngletSimple(classeur, 'Equipes'),
    autresNomsClubsInvites(classeur, club.club_nom),
    reponsesGelees(g.tournoi_date, aujourdhui),
    String(g.contact_reponse_email || '').trim());
}

/**
 * CŒUR PUR du dossier club (testé sans classeur) : compose ce que la page dossier a le droit de
 * voir pour CE club. Trois familles d'informations, et rien d'autre :
 *  - qui il est (nom, prénom du contact) ;
 *  - ce qu'il a DÉCLARÉ (catégories, équipes par catégorie, joueurs, éducateurs) — pour qu'il
 *    puisse le relire et le corriger tant que les réponses ne sont pas gelées ;
 *  - SES équipes telles qu'elles existent dans le tournoi (nom, catégorie, poule), d'où la page
 *    déduira son planning en croisant les matchs publics.
 * Le rattachement passe par `equipeRattacheeAuClub` : le piège « PUC » / « PUC-2 » (deux clubs
 * invités dont l'un ressemble à la 2ᵉ équipe de l'autre) ne se repose pas ici.
 * `reponses_gelees` et `contact_email` disent à la page s'il faut proposer « Modifier ma
 * réponse » ou, passé le gel, renvoyer vers l'organisateur.
 * AUCUN email de club n'est jamais renvoyé (seul celui, public, du contact du tournoi).
 */
function dossierClubPur(club, equipes, autresClubs, gelees, contactEmail) {
  var nomClub = String((club && club.club_nom) || '').trim();
  var miennes = (equipes || []).filter(function (e) {
    return equipeRattacheeAuClub(e.nom_equipe, nomClub, autresClubs);
  }).map(function (e) {
    return {
      id_equipe:     String(e.id_equipe || ''),
      nom_equipe:    String(e.nom_equipe || '').trim(),
      categorie:     String(e.categorie || '').trim(),
      poule:         String(e.poule || '').trim(),
      nb_joueurs:    String(e.nb_joueurs == null ? '' : e.nb_joueurs).trim(),
      nb_educateurs: String(e.nb_educateurs == null ? '' : e.nb_educateurs).trim()
    };
  });
  // Tri : par catégorie (ordre du tournoi), puis par nom d'équipe — l'ordre d'un onglet Sheet
  // n'a aucune raison d'être celui qu'un club veut lire.
  miennes.sort(function (a, b) {
    return comparerCategorieServeur(a.categorie, b.categorie) ||
           a.nom_equipe.localeCompare(b.nom_equipe, 'fr');
  });

  return { ok: true,
    reponses_gelees: !!gelees,
    contact_email:   String(contactEmail || ''),
    club: {
      club_nom:            nomClub,
      club_contact_prenom: String((club && club.club_contact_prenom) || ''),
      categories_engagees: String((club && club.categories_engagees) || ''),
      // Ce que le club a DÉCLARÉ en répondant (jamais recalculé ici : c'est sa parole).
      nb_equipes_par_categorie: String((club && club.nb_equipes_par_categorie) || ''),
      nb_joueurs_total:         String((club && club.nb_joueurs_total) || ''),
      nb_educateurs_total:      String((club && club.nb_educateurs_total) || ''),
      detail_effectifs:         String((club && club.detail_effectifs) || '')
    },
    equipes: miennes };
}

/**
 * Config du DOSSIER club (vue `club` : contacts jour J, logistique, secours, tarifs) —
 * PROTÉGÉE PAR JETON. Alimente les sections personnalisées de dossier-club.html. Sans jeton
 * valide : erreur générique. Mutualise `trouverClubParToken` avec getClubDossier / getReponseInvitation.
 */
function getConfigClub(classeur, params) {
  var club = trouverClubParToken(classeur, params.club, params.token);
  if (!club) return { error: 'Lien invalide ou expiré.' };
  return { ok: true, config: lireConfigPublique(classeur, 'club') };
}

/* ===================== RÉPONSE EN LIBRE-SERVICE DU CLUB (Sprint 6) ===================== */

/**
 * Retrouve un club par son JETON (le secret). Le jeton doit être non vide et correspondre
 * EXACTEMENT à un club ; le nom fourni (le cas échéant) doit en plus correspondre (souple).
 * Renvoie l'objet club (issu de lireOngletSimple) ou null. C'est le SEUL point de vérification
 * d'accès des actions publiques de réponse : sans jeton valide, aucune donnée n'est renvoyée.
 */
function trouverClubParToken(classeur, nom, token) {
  token = String(token || '').trim();
  if (!token) return null;
  // 🚨 M1-B2 / B2-2 — LE FILTRE D'ÉDITION, ET IL N'EST PAS FACULTATIF. Les participations des
  //   éditions passées ne sont plus effacées : elles sont CONSERVÉES, avec leurs jetons. Sans
  //   ce filtre, un lien de l'édition précédente — dossier, page de réponse, copie partagée aux
  //   éducateurs — redeviendrait valide du seul fait qu'on garde désormais l'histoire. Ce serait
  //   la régression exacte de T6, introduite par la structure censée l'empêcher.
  //   ⭐ `clubsEditionActive` ne rend QUE l'édition active : le filtre est dans la lecture même.
  var clubs = clubsEditionActive(classeur);
  for (var i = 0; i < clubs.length; i++) {
    if (String(clubs[i].club_token || '').trim() === token) {
      // Jeton trouvé : si un nom est fourni, il doit correspondre (défense supplémentaire).
      if (nom && !memeTexteSouple(clubs[i].club_nom, nom)) return null;
      return clubs[i];
    }
  }
  return null;
}

/**
 * Lecture PUBLIQUE pour la page de réponse (reponse-invitation.html). Validée par le JETON :
 * si le jeton ne correspond pas au club, renvoie une erreur GÉNÉRIQUE (aucune info révélée).
 * Renvoie le rappel du tournoi (nom/date/affiche), la liste des catégories (avec leur
 * max_equipes_par_club) et l'état de réponse actuel du club (pour ré-afficher un choix déjà fait).
 */
function getReponseInvitation(classeur, params) {
  var club = trouverClubParToken(classeur, params.club, params.token);
  if (!club) return { error: 'Lien invalide ou expiré.' };

  var config = lireConfig(classeur);
  var g = config.global || {};
  var categories = (config.categories || [])
    .filter(function (c) { return String(c.presente).toLowerCase() === 'oui'; })
    .map(function (c) {
      return {
        categorie: String(c.categorie || ''),
        max_equipes_par_club: String(c.max_equipes_par_club || '').trim(),
        effectif_min: String(c.effectif_min || '').trim()
      };
    });

  // Gel J-16 : la page de réponse s'affiche en LECTURE SEULE (le verrou d'écriture, lui, est
  // dans repondreInvitation). contact_email = la porte de sortie affichée aux clubs (déjà
  // public via la vue invitation de getConfig — aucune donnée nouvelle exposée).
  var aujourdhui = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  return { ok: true,
    reponses_gelees: reponsesGelees(g.tournoi_date, aujourdhui),
    contact_email: String(g.contact_reponse_email || '').trim(),
    club: {
      club_nom:            String(club.club_nom || ''),
      club_contact_prenom: String(club.club_contact_prenom || ''),
      statut:              String(club.statut || ''),
      date_reponse:        String(club.date_reponse || ''),
      categories_engagees: String(club.categories_engagees || ''),
      nb_equipes_par_categorie: String(club.nb_equipes_par_categorie || ''),
      nb_joueurs_total:    String(club.nb_joueurs_total || ''),
      detail_effectifs:    String(club.detail_effectifs || ''),
      nb_educateurs_total: String(club.nb_educateurs_total || '')
    },
    tournoi: {
      nom:        String(g.tournoi_nom || ''),
      date:       String(g.tournoi_date || ''),
      affiche_id: String(g.tournoi_affiche_id || ''),
      lieu:       String(g.tournoi_lieu || '')
    },
    categories: categories
  };
}

/* Gel des réponses (décision Romain) : à J-16 du tournoi, les clubs ne modifient plus leur
   réponse — la demande d'autorisation doit partir au plus tard à J-15, l'organisateur garde
   donc la journée J-16 pour consolider les effectifs. L'ADMIN, lui, garde la main : ses
   actions passent par la clé admin, jamais par ce verrou. */
var GEL_REPONSES_JOURS = 16;

/**
 * Vrai si les réponses des clubs sont GELÉES : il reste GEL_REPONSES_JOURS jours ou moins
 * avant le tournoi (le jour J-16 lui-même est déjà gelé, et tout ce qui suit — jour J et
 * après compris). Cœur PUR (dates injectées, testé sans classeur ni horloge).
 * Date du tournoi absente ou illisible ⇒ JAMAIS de gel : on ne bloque pas les clubs sur une
 * donnée manquante (prudent par construction).
 */
function reponsesGelees(dateTournoiISO, aujourdhuiISO) {
  var t = normaliserDateISO(dateTournoiISO);
  var a = normaliserDateISO(aujourdhuiISO);
  if (!t || !a) return false;
  var msJour = 24 * 60 * 60 * 1000; // diff en UTC : insensible aux changements d'heure
  var joursRestants = Math.round((new Date(t + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / msJour);
  return joursRestants <= GEL_REPONSES_JOURS;
}

/**
 * ÉCRITURE PUBLIQUE : réponse du club à son invitation (libre-service). Sécurisée par le JETON.
 *  - reponse = 'decline' → statut Décliné + date_reponse.
 *  - reponse = 'accepte' → valide les catégories (existent en Zone B), le nb d'équipes par
 *    catégorie (≥ 1 et ≤ max_equipes_par_club si renseigné) et le nb de joueurs (> 0), puis écrit
 *    statut Accepté, categories_engagees, nb_equipes_par_categorie (JSON), nb_joueurs_total, date_reponse.
 * N'écrit JAMAIS un autre club que celui identifié par le jeton. NE déclenche AUCUN envoi de
 * dossier (l'envoi reste manuel côté admin).
 */
function repondreInvitation(classeur, data) {
  var club = trouverClubParToken(classeur, data.club, data.token);
  if (!club) return { error: 'Lien invalide ou expiré.' };

  var reponse = String(data.reponse || '').trim().toLowerCase();
  // ⭐ B2-2 : le club a été trouvé PAR SON JETON, et un jeton ne vit que dans une participation
  //   de l'édition active — celle-ci existe donc forcément. ⛔ Ce chemin n'en crée aucune.
  var ctxB22 = contexteEcritureClub(classeur, club.club_nom);
  if (!ctxB22.club || ctxB22.ligneEngagement === -1) return { error: 'Lien invalide ou expiré.' };
  var onglet = ctxB22.ongletEngagement;
  var ligne = ctxB22.ligneEngagement;
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // GEL J-16 (décision Romain) : premières réponses COMME modifications sont closes — vérifié
  // CÔTÉ SERVEUR (un verrou d'écran seul serait contournable). Porte de sortie par email.
  var config = lireConfig(classeur);
  var gGel = config.global || {};
  if (reponsesGelees(gGel.tournoi_date, today)) {
    var contactGel = String(gGel.contact_reponse_email || '').trim();
    return { error: 'Les inscriptions sont closes (' + GEL_REPONSES_JOURS + ' jours avant le tournoi, ' +
      'le temps de préparer les documents officiels). Pour toute modification, contactez ' +
      'l\'organisateur' + (contactGel ? ' : ' + contactGel : '.') };
  }

  if (reponse === 'decline') {
    // selection_enregistree EFFACÉE : toute réponse du club invalide la marque de l'admin
    // (sa carte repasse « à traiter » — ici elle deviendra rouge « Déclinée »).
    var champsDecline = { statut: 'Décliné', date_reponse: today, selection_enregistree: '' };
    // Un club qui décline APRÈS que ses équipes ont été créées les laisserait ORPHELINES, sur
    // une carte rouge sans action possible (le panneau de synchro n'existe que pour un club
    // accepté). On ne supprime RIEN ici — un club ne déclenche jamais de suppression — mais on
    // pose une alerte ⚠️ ACTIONNABLE sur sa fiche : l'admin voit les équipes à retirer (revue).
    var equipesRestantes = lireOngletSimple(classeur, 'Equipes').filter(function (e) {
      return equipeRattacheeAuClub(e.nom_equipe, String(club.club_nom || '').trim(),
        autresNomsClubsInvites(classeur, club.club_nom));
    });
    if (equipesRestantes.length) {
      champsDecline.alerte_ecart = 'Club désormais DÉCLINÉ : ' + equipesRestantes.length +
        ' équipe(s) subsistent dans l\'onglet Équipes (' +
        equipesRestantes.map(function (e) { return String(e.nom_equipe).trim(); }).join(', ') +
        ') — retire-les avec le club (icône corbeille) ou à la main.';
    }
    ecrireCellulesModele(onglet, ligne, champsDecline);
    return { ok: true, statut: 'Décliné' };
  }

  if (reponse !== 'accepte') return { error: 'Réponse invalide.' };

  // Catégories réellement proposées cette édition (Zone B, présentes) — config lue plus haut.
  var maxParCat = {}; // nom catégorie → max (ou null)
  (config.categories || []).forEach(function (c) {
    if (String(c.presente).toLowerCase() !== 'oui') return;
    var m = parseInt(String(c.max_equipes_par_club || '').trim(), 10);
    maxParCat[String(c.categorie || '')] = (isFinite(m) && m >= 1) ? m : null;
  });

  // nb_equipes_par_categorie attendu : objet { "U8": 2, … } (ou JSON string).
  var parCat = data.nb_equipes_par_categorie;
  if (typeof parCat === 'string') { try { parCat = JSON.parse(parCat || '{}'); } catch (e) { return { error: 'Données de réponse illisibles.' }; } }
  if (!parCat || typeof parCat !== 'object') return { error: 'Sélectionne au moins une catégorie.' };

  var noms = Object.keys(parCat);
  if (!noms.length) return { error: 'Sélectionne au moins une catégorie.' };

  var propres = {};
  for (var i = 0; i < noms.length; i++) {
    var cat = noms[i];
    if (!maxParCat.hasOwnProperty(cat)) return { error: 'Catégorie inconnue : « ' + cat +' ».' };
    var nb = parseInt(parCat[cat], 10);
    if (!isFinite(nb) || nb < 1) return { error: 'Indique un nombre d\'équipes valide pour « ' + cat + ' ».' };
    if (maxParCat[cat] != null && nb > maxParCat[cat]) {
      return { error: 'Maximum ' + maxParCat[cat] + ' équipe(s) par club pour « ' + cat + ' ».' };
    }
    propres[cat] = nb;
  }

  // Détail par équipe (session 23) : joueurs + éducateurs de CHAQUE équipe. Optionnel (anciens
  // clients : champ absent → chemin historique nb_joueurs_total). Totaux calculés SERVEUR.
  var effMinParCat = {};
  (config.categories || []).forEach(function (c) {
    if (String(c.presente).toLowerCase() !== 'oui') return;
    var em = parseInt(String(c.effectif_min || '').trim(), 10);
    effMinParCat[String(c.categorie || '')] = (isFinite(em) && em >= 1) ? em : null;
  });
  var champs = {
    statut: 'Accepté',
    nb_equipes_par_categorie: JSON.stringify(propres),
    date_reponse: today,
    // Toute réponse (même identique) EFFACE la marque « sélection enregistrée » de l'admin :
    // sa carte repasse orange « À enregistrer » — il revalide, les équipes se synchronisent.
    selection_enregistree: ''
  };
  if (data.detail_effectifs != null && String(data.detail_effectifs).trim() !== '') {
    var vd = validerDetailEffectifs(propres, data.detail_effectifs, effMinParCat);
    if (vd.error) return { error: vd.error };
    champs.detail_effectifs = JSON.stringify(vd.detail);
    champs.nb_joueurs_total = String(vd.totalJoueurs);
    champs.nb_educateurs_total = String(vd.totalEducateurs);
  } else {
    var nbJoueurs = parseInt(data.nb_joueurs_total, 10);
    if (!isFinite(nbJoueurs) || nbJoueurs < 1) return { error: 'Indique le nombre total de joueurs attendus.' };
    champs.nb_joueurs_total = String(nbJoueurs);
  }

  // categories_engagees dérivé des catégories saisies (ordre naturel U8 < U10 < …).
  var catsTriees = Object.keys(propres).sort(function (a, b) { return comparerCategorieServeur(a, b); });
  champs.categories_engagees = catsTriees.join(',');

  ecrireCellulesModele(onglet, ligne, champs);
  return { ok: true, statut: 'Accepté', categories_engagees: catsTriees.join(',') };
}

/**
 * Valide le DÉTAIL PAR ÉQUIPE d'une réponse d'invitation (pur, testé). `propres` = { cat: nbEquipes }
 * déjà validé ; `detailBrut` = JSON { cat: [{j,e}, …] } (une entrée par équipe) ; `effMinParCat` =
 * { cat: effectif minimum ou null }. Règles :
 *  - mêmes catégories que `propres`, autant d'entrées que d'équipes ;
 *  - j (joueurs) : entier ≥ 1, et ≥ effectif minimum FFR de la catégorie s'il est connu ;
 *  - e (éducateurs) : entier ≥ 0 (0 accepté : réponse honnête plutôt que chiffre forcé).
 * Totaux calculés ICI (jamais confiés au client). @return {{detail,totalJoueurs,totalEducateurs}|{error}}
 */
function validerDetailEffectifs(propres, detailBrut, effMinParCat) {
  var detail = detailBrut;
  if (typeof detail === 'string') { try { detail = JSON.parse(detail || '{}'); } catch (e) { return { error: 'Détail des effectifs illisible.' }; } }
  if (!detail || typeof detail !== 'object') return { error: 'Détail des effectifs illisible.' };
  var propre = {}, tj = 0, te = 0;
  var cats = Object.keys(propres || {});
  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];
    var liste = detail[cat];
    if (!Array.isArray(liste) || liste.length !== propres[cat]) {
      return { error: 'Détail incomplet pour « ' + cat + ' » : indique joueurs et éducateurs de chaque équipe.' };
    }
    var out = [];
    for (var k = 0; k < liste.length; k++) {
      var j = parseInt(liste[k] && liste[k].j, 10);
      var e = parseInt(liste[k] && liste[k].e, 10);
      if (!isFinite(j) || j < 1) return { error: '« ' + cat + ' » équipe ' + (k + 1) + ' : indique le nombre de joueurs.' };
      var em = effMinParCat ? effMinParCat[cat] : null;
      if (em != null && j < em) {
        return { error: '« ' + cat + ' » équipe ' + (k + 1) + ' : ' + em + ' joueurs minimum par équipe (règle FFR).' };
      }
      if (!isFinite(e) || e < 0) e = 0;
      out.push({ j: j, e: e });
      tj += j; te += e;
    }
    propre[cat] = out;
  }
  return { detail: propre, totalJoueurs: tj, totalEducateurs: te };
}

/** Écrit plusieurs cellules d'un club (par nom de colonne) en une passe. */
function ecrireCellulesClub(onglet, ligne, valeurs) {
  Object.keys(valeurs).forEach(function (h) {
    var col = colClubInvite(onglet, h);
    if (col === -1) return;
    var cell = onglet.getRange(ligne, col);
    cell.setNumberFormat('@');
    cell.setValue(valeurs[h]);
  });
}

/** Tri naturel de catégories côté serveur (U8 < U10 < U12…) — même règle que le front. */
function comparerCategorieServeur(a, b) {
  var ma = String(a).match(/\d+/), mb = String(b).match(/\d+/);
  if (ma && mb && parseInt(ma[0], 10) !== parseInt(mb[0], 10)) return parseInt(ma[0], 10) - parseInt(mb[0], 10);
  return String(a) < String(b) ? -1 : (String(a) > String(b) ? 1 : 0);
}

/**
 * LISTE des clubs invités. Passe par doPost + clé ADMIN (et non doGet, ouvert à tous) :
 * l'onglet contient des emails de contact, qui ne doivent JAMAIS apparaître dans le
 * snapshot public (getAll) ni sur le relais CDN.
 */
function listerClubsInvites(classeur) {
  assurerOngletClubsInvites(classeur);
  // ⛔ M1-B2 / B2-2 : cette LECTURE ne crée plus rien. `assurerTokensClubs` ne pose désormais
  //   un jeton qu'aux participations DÉJÀ existantes — ouvrir l'écran ne fabrique aucune
  //   participation (arbitrage du 2026-08-27). ⭐ Et elle ne migre pas : seule une écriture le fait.
  assurerTokensClubs(classeur);
  return { ok: true, clubs: clubsEditionActive(classeur) };
}

/** Génère un jeton unique (UUID) — sécurise l'accès à la page de réponse d'un club. */
function genererTokenClub() {
  return Utilities.getUuid();
}

/**
 * Rétrocompatibilité (Point 6) : attribue un club_token à TOUS les clubs qui n'en ont pas encore
 * (fiches créées avant le Sprint 6). Appelé à l'ouverture de l'admin (listerClubsInvites) et avant
 * chaque envoi d'invitation. Sans effet si tous les clubs ont déjà un jeton.
 */
function assurerTokensClubs(classeur) {
  // ⭐ M1-B2 / B2-2 — LE CHANGEMENT DE RÈGLE, ET IL EST AU CŒUR DU LOT. Cette fonction posait un
  //   jeton à TOUT club qui n'en avait pas, À CHAQUE OUVERTURE DE L'ADMINISTRATION. Sur le
  //   nouveau modèle, ce serait fabriquer une PARTICIPATION à partir d'un écran qu'on regarde —
  //   ⛔ interdit (arbitrage du 2026-08-27) : une participation naît d'une intention, jamais
  //   d'une lecture. ⭐ Elle ne complète donc plus QUE les participations DÉJÀ existantes, ce qui
  //   reste utile : une participation migrée d'un classeur ancien peut n'avoir aucun jeton.
  // ⚠️ CLASSEUR PAS ENCORE MIGRÉ : le comportement d'ORIGINE est conservé À L'IDENTIQUE.
  //   Entre le redéploiement et `migrerClubsMaintenant()`, `ClubsInvites` fait encore foi ;
  //   couper la réattribution là priverait les clubs de tout lien de réponse après un reset.
  //   ⭐ C'est la même règle que `reinitialiserPhase2Clubs` : l'ancien modèle garde l'ancien
  //   comportement, le nouveau modèle a le sien. ⛔ Jamais un mélange des deux.
  if (!modeleClubsEnPlace(classeur)) {
    var oLegacy = assurerColonnesClubsInvites(classeur);
    var dernierL = oLegacy.getLastRow();
    if (dernierL < 2) return;
    var colL = colClubInvite(oLegacy, 'club_token');
    if (colL === -1) return;
    var plageL = oLegacy.getRange(2, colL, dernierL - 1, 1);
    var valsL = plageL.getValues();
    var modifieL = false;
    for (var iL = 0; iL < valsL.length; iL++) {
      if (String(valsL[iL][0] || '').trim() === '') { valsL[iL][0] = genererTokenClub(); modifieL = true; }
    }
    if (modifieL) { plageL.setNumberFormat('@'); plageL.setValues(valsL); }
    return;
  }
  var registre = editionActive(classeur);
  if (registre.etat !== 'ok') return;
  var onglet = assurerOngletParticipations(classeur);
  var donnees = onglet.getDataRange().getValues();
  if (donnees.length < 2) return;
  var cToken = donnees[0].indexOf('club_token');
  var cEdition = donnees[0].indexOf('edition_id');
  if (cToken === -1 || cEdition === -1) return;
  for (var i = 1; i < donnees.length; i++) {
    if (String(donnees[i][cEdition] || '').trim() !== registre.edition.edition_id) continue;
    if (String(donnees[i][cToken] || '').trim() !== '') continue;
    var cellule = onglet.getRange(i + 1, cToken + 1);
    cellule.setNumberFormat('@');
    cellule.setValue(genererTokenClub());
  }
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
  var prenom = String(data.club_contact_prenom || '').trim();
  var email = String(data.club_contact_email || '').trim();
  if (email && !estEmailValide(email)) {
    return { error: 'Email du contact invalide : « ' + email + ' ».' };
  }
  var statut = statutClubCanonique(data.statut) || 'Invité';

  var onglet = assurerOngletClubsInvites(classeur);
  var existants = clubsEditionActive(classeur);
  for (var i = 0; i < existants.length; i++) {
    if (memeTexteSouple(existants[i].club_nom, nom)) {
      return { error: 'Le club « ' + existants[i].club_nom + ' » est déjà dans la liste.' };
    }
  }

  var dateAjout = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // ⚠️ CLASSEUR PAS ENCORE MIGRÉ : comportement d'ORIGINE, à l'identique. ⛔ Cette écriture ne
  //   crée AUCUN onglet neuf et ne fait basculer AUCUN modèle (arbitrage du 2026-08-27).
  if (!modeleClubsEnPlace(classeur)) {
    var valeurs = {
      club_nom: nom, club_contact_nom: contactNom, club_contact_prenom: prenom,
      club_contact_email: email, statut: statut, date_ajout: dateAjout,
      categories_engagees: '', dossier_envoye: '',
      club_token: genererTokenClub() // jeton unique dès l'ajout (sécurise la page de réponse)
    };
    var entetes = onglet.getRange(1, 1, 1, Math.max(onglet.getLastColumn(), 1)).getValues()[0];
    var ligne = onglet.getLastRow() + 1;
    var row = entetes.map(function (h) { return (valeurs[h] != null) ? valeurs[h] : ''; });
    var plage = onglet.getRange(ligne, 1, 1, entetes.length);
    plage.setNumberFormat('@');
    plage.setValues([row]);
    return { ok: true };
  }

  // ⭐ M1-B2 / B2-2 — AJOUTER UN CLUB, C'EST L'INSCRIRE AU CARNET, PAS L'INVITER (D-050).
  //   ⛔ Aucune participation n'est créée, ⛔ aucun jeton n'est tiré : les deux naîtront du
  //   premier geste d'invitation. Le club apparaît donc « sans participation cette fois » —
  //   exactement l'état d'un club connu après une réinitialisation, que l'écran sait déjà rendre.
  //   ⚠️ `statut` reçu du client est délibérément IGNORÉ ici : « Invité » ne se pose qu'après un
  //   envoi réussi. (Il était auparavant écrit d'office à la création — c'est ce défaut qui
  //   rendait `statut = 'Invité'` inutilisable comme preuve de participation.)
  ajouterLignesModele(assurerOngletClubs(classeur), [{
    club_id: Utilities.getUuid(), club_nom: nom, club_contact_nom: contactNom,
    club_contact_prenom: prenom, club_contact_email: email, date_ajout: dateAjout, actif: 'oui'
  }]);
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

/**
 * Index { nom normalisé → numéro de ligne } de l'onglet ClubsInvites, en UNE seule lecture.
 * Même normalisation et même règle « 1re occurrence » que ligneClubInvite(). Sert aux
 * traitements en LOT (envoi groupé) pour éviter de relire tout l'onglet à chaque club (O(n²)).
 */
function indexerLignesClubs(onglet) {
  var donnees = onglet.getDataRange().getValues();
  var index = {};
  for (var i = 1; i < donnees.length; i++) {
    var cle = normaliserTexteSouple(donnees[i][0]);
    if (cle && !(cle in index)) index[cle] = i + 1;
  }
  return index;
}

/** Change le STATUT d'un club invité (menu déroulant de la liste admin). */
function modifierStatutClubInvite(classeur, data) {
  var statut = statutClubCanonique(data.statut);
  if (!statut) return { error: 'Statut inconnu (attendu : Invité, Accepté ou Décliné).' };
  // ⭐ B2-2 : changer un statut à la main est un geste EXPLICITE de l'organisateur — il vaut
  //   engagement du club dans l'édition en cours, et crée donc la participation si elle manque.
  return ecrireEngagementClub(classeur, data.club_nom, { statut: statut }, true);
}

/**
 * Enregistre les CATÉGORIES ENGAGÉES d'un club (Phase 2) — sélection cochée au moment où le
 * club passe « Accepté ». Optionnellement met aussi à jour le prénom du contact (édité sur la
 * même fiche). categories_engagees est stocké en texte « U8,U10 » (vide = toutes les catégories).
 *
 * ATOMIQUE (correctif de revue) : cette action enchaîne, DANS LE MÊME appel serveur, l'écriture
 * de la sélection PUIS la synchronisation des équipes, et ne pose la marque
 * `selection_enregistree` (liseré VERT) qu'en cas de succès des deux. Auparavant le front
 * faisait deux appels réseau : si le second échouait, la carte restait verte « à jour » alors
 * que les équipes n'étaient pas synchronisées — un état vert DEVINÉ, contraire à la doctrine
 * « prudent par construction ». Désormais, un échec de synchro laisse la carte ORANGE : elle
 * réclame un nouveau clic, ce qui est la vérité.
 */
function enregistrerCategoriesEngagees(classeur, data) {
  // ⭐ B2-2 : enregistrer une sélection est un geste EXPLICITE — il vaut engagement.
  var ctxB22 = contexteEcritureClub(classeur, data.club_nom);
  if (!ctxB22.club) return { error: 'Club introuvable : ' + String(data.club_nom || '') };
  if (ctxB22.ligneEngagement === -1) {
    var creeB22 = assurerParticipation(classeur, ctxB22.club);
    if (creeB22.error) return { error: creeB22.error };
    ctxB22 = contexteEcritureClub(classeur, data.club_nom);
  }
  var onglet = ctxB22.ongletEngagement;
  var ligne = ctxB22.ligneEngagement;

  var colCat = colClubInvite(onglet, 'categories_engagees');
  if (colCat === -1) return { error: 'Colonne « categories_engagees » introuvable.' };
  var cats = String(data.categories_engagees == null ? '' : data.categories_engagees).trim();
  var cellCat = onglet.getRange(ligne, colCat);
  cellCat.setNumberFormat('@');
  cellCat.setValue(cats);

  if (data.club_contact_prenom != null) {
    // ⭐ B2-2 : le prénom appartient à l'IDENTITÉ — il s'écrit au carnet, jamais à la
    //   participation. ⛔ Et il ne touche pas au snapshot : l'histoire ne se réécrit pas.
    ecrireCellulesModele(ctxB22.ongletIdentite, ctxB22.ligneIdentite,
      { club_contact_prenom: String(data.club_contact_prenom).trim() });
  }

  // SYNCHRONISATION des équipes dans la foulée (même appel) : ajouts + retraits prudents.
  // Réservée aux clubs « Accepté » (le panneau de sélection n'existe que pour eux) : pour tout
  // autre statut on enregistre la sélection sans toucher aux équipes.
  var clubCourant = null, tousClubs = clubsEditionActive(classeur);
  for (var iC = 0; iC < tousClubs.length; iC++) {
    if (memeTexteSouple(tousClubs[iC].club_nom, data.club_nom)) { clubCourant = tousClubs[iC]; break; }
  }
  var sync = (clubCourant && statutClubCanonique(clubCourant.statut) === 'Accepté')
    ? creerEquipesClub(classeur, { club_nom: data.club_nom })
    : { ok: true, equipes_creees: [], equipes_supprimees: [], alerte: '' };
  if (sync && sync.error) {
    // Sélection enregistrée mais équipes NON synchronisées : pas de marque ⇒ la carte reste
    // orange. Le message d'erreur remonte tel quel à l'admin (jamais d'échec silencieux).
    return { error: 'Sélection enregistrée, mais les équipes n\'ont pas pu être synchronisées : '
      + sync.error + ' Clique de nouveau sur « Enregistrer la sélection ».' };
  }

  // Marque « sélection enregistrée » (liseré VERT) : posée SEULEMENT maintenant — après une
  // synchronisation réussie. Effacée par toute nouvelle réponse du club (repondreInvitation).
  var marque = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  ecrireCellulesModele(onglet, ligne, { selection_enregistree: marque });

  return { ok: true, categories_engagees: cats, selection_enregistree: marque,
           equipes_creees: (sync && sync.equipes_creees) || [],
           equipes_supprimees: (sync && sync.equipes_supprimees) || [],
           alerte: (sync && sync.alerte) || '' };
}

/**
 * RENOUVELLE LE JETON d'un club (clé admin). L'ancien lien cesse IMMÉDIATEMENT de fonctionner —
 * le dossier, la page de réponse, et toutes les copies que le club a pu partager à ses éducateurs.
 *
 * Sert au moment où l'on regénère un dossier déjà envoyé : le lien précédent a circulé, et
 * l'organisateur veut reprendre la main. Geste volontaire, jamais automatique : côté admin, il
 * est proposé — pas imposé — car un lien coupé la veille du tournoi, c'est un club qui appelle.
 */
function regenererJetonClub(classeur, data) {
  var nom = String((data && data.club_nom) || '').trim();
  if (!nom) return { error: 'Club manquant.' };
  // ⭐ B2-2 : renouveler un jeton suppose qu'il en existe un — donc une participation. ⛔ Ce
  //   geste n'en crée AUCUNE : un club seulement connu du carnet n'a pas de lien à renouveler.
  var jeton = genererTokenClub();
  var res = ecrireEngagementClub(classeur, nom, { club_token: jeton }, false);
  if (res.error) return res;
  return { ok: true, club_token: jeton };
}

/**
 * ENVOI AUTOMATIQUE du dossier Phase 2 par email (Point 7 du sprint).
 * Le destinataire (email de contact) est TOUJOURS relu dans le Sheet — jamais pris du client —
 * pour éviter tout détournement. L'objet et le contenu sont fournis par l'aperçu admin (modifiables).
 * L'email est envoyé en HTML (même charte que l'invitation : `html_modele` + `texte_modele` de
 * repli + affiche inline cid:affiche). Rétrocompatibilité : si seul `corps` (texte) est fourni,
 * l'ancien envoi texte est utilisé. Envoi via MailApp par défaut ; via GmailApp avec « from » si
 * email_expediteur (alias Gmail) est configuré. dossier_envoye n'est posé (date du jour) qu'en
 * cas de SUCCÈS de l'envoi.
 */
function envoyerDossierEmail(classeur, data) {
  var nom = String(data.club_nom || '').trim();
  if (!nom) return { error: 'Club manquant.' };
  var onglet = assurerOngletClubsInvites(classeur);
  var ligne = ligneClubInvite(onglet, nom);
  if (ligne === -1) return { error: 'Club introuvable : ' + nom };

  // ⭐ B2-2 : le destinataire est TOUJOURS relu au carnet (jamais pris du client), et le
  //   dossier suppose un club déjà engagé — ⛔ ce geste ne crée donc aucune participation.
  var ctxB22 = contexteEcritureClub(classeur, nom);
  var email = ctxB22.club ? String(ctxB22.club.club_contact_email || '').trim() : '';
  if (!email) return { error: 'Ce club n\'a pas d\'email de contact : utilise « Copier le lien ».' };
  if (!estEmailValide(email)) return { error: 'Email du club invalide : « ' + email + ' ».' };

  var sujet = String(data.sujet == null ? '' : data.sujet).trim();
  if (!sujet) return { error: 'L\'objet du message est vide.' };
  var htmlModele = String(data.html_modele == null ? '' : data.html_modele);
  var texteModele = String(data.texte_modele == null ? '' : data.texte_modele);
  var corps = String(data.corps == null ? '' : data.corps); // repli : ancien envoi texte brut
  if (!htmlModele.trim() && !corps.trim()) return { error: 'Le contenu du message est vide.' };

  var expediteur = String((lireConfig(classeur).global || {}).email_expediteur || '').trim();
  try {
    if (htmlModele.trim()) {
      // Version texte de repli : le modèle texte fourni, ou à défaut le HTML dépouillé de ses balises.
      var texte = texteModele.trim() ? texteModele : htmlModele.replace(/<[^>]+>/g, ' ');
      envoyerEmailHtml(email, sujet, htmlModele, texte, afficheBlobPourEmail(classeur), expediteur);
    } else {
      envoyerEmailAvec(email, sujet, corps, expediteur);
    }
  } catch (e) {
    return { error: 'Échec de l\'envoi de l\'email : ' + (e && e.message ? e.message : e) };
  }

  // Succès → on pose la date d'envoi (et seulement là).
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  ecrireEngagementClub(classeur, nom, { dossier_envoye: today }, false);
  return { ok: true, dossier_envoye: today, destinataire: email };
}

/**
 * FEUILLE DE FIN DE JOURNÉE — envoi aux clubs invités ACCEPTÉS, sur l'adresse qui a servi à les
 * inviter (`club_contact_email`). Le CONTENU est fourni par le front (`html_modele` /
 * `texte_modele`, construits depuis les matchs affichés) : le backend ne fait qu'expédier, comme
 * pour le dossier club — une seule mécanique d'email pour toute l'application.
 * Chaque club est traité INDIVIDUELLEMENT : l'échec de l'un n'annule pas les autres, et la liste
 * des échecs revient au front pour être affichée telle quelle (jamais d'échec silencieux).
 * @return {{ok:boolean, envoyes:number, echecs:string[], sansEmail:string[]}}
 */
function envoyerFeuilleJour(classeur, data) {
  var sujet = String((data && data.sujet) == null ? '' : data.sujet).trim();
  var html = String((data && data.html_modele) == null ? '' : data.html_modele);
  var texte = String((data && data.texte_modele) == null ? '' : data.texte_modele);
  if (!sujet) return { error: 'L\'objet du message est vide.' };
  if (!html.trim()) return { error: 'Le contenu du message est vide.' };

  var onglet = assurerOngletClubsInvites(classeur);
  var clubs = clubsEditionActive(classeur);
  var expediteur = String((lireConfig(classeur).global || {}).email_expediteur || '').trim();
  var texteRepli = texte.trim() ? texte : html.replace(/<[^>]+>/g, ' ');

  var envoyes = 0, echecs = [], sansEmail = [];
  clubs.forEach(function (c) {
    if (statutClubCanonique(c.statut) !== 'Accepté') return;
    var nom = String(c.club_nom || '').trim();
    var email = String(c.club_contact_email || '').trim();
    if (!email || !estEmailValide(email)) { sansEmail.push(nom); return; }
    try {
      envoyerEmailHtml(email, sujet, html, texteRepli, null, expediteur);
      envoyes++;
    } catch (e) {
      echecs.push(nom + ' (' + (e && e.message ? e.message : e) + ')');
    }
  });
  if (!envoyes && !echecs.length) return { error: 'Aucun club accepté avec une adresse email valide.' };
  return { ok: true, envoyes: envoyes, echecs: echecs, sansEmail: sansEmail };
}

/* -------- Synchronisation des équipes d'un club invité (clic « Enregistrer la sélection ») :
   création des équipes engagées ET retrait prudent des équipes en trop. -------- */

/** Une équipe appartient-elle à ce club ? Nom = « {club} » ou « {club}-N » (N entier). */
function estEquipeDuClub(nomEquipe, nomClub) {
  var ne = String(nomEquipe || '').trim(), nc = String(nomClub || '').trim();
  if (!nc) return false;
  if (ne === nc) return true;
  return ne.indexOf(nc + '-') === 0 && /^\d+$/.test(ne.substring(nc.length + 1));
}

/**
 * Rattachement d'une équipe à un club, PROTÉGÉ CONTRE LES COLLISIONS DE NOMS (revue) :
 * « PUC-2 » ressemble à la 2ᵉ équipe du club « PUC », mais si un club « PUC-2 » existe dans
 * ClubsInvites, l'équipe lui appartient — le club « PUC » ne doit ni la compter ni la supprimer.
 * Un nom d'équipe qui EST le nom d'un autre club invité est donc toujours rendu à ce club.
 * @param {Array<string>} autresClubs noms des AUTRES clubs invités (celui traité exclu)
 */
function equipeRattacheeAuClub(nomEquipe, nomClub, autresClubs) {
  if (!estEquipeDuClub(nomEquipe, nomClub)) return false;
  var ne = String(nomEquipe || '').trim();
  return !(autresClubs || []).some(function (autre) { return memeTexteSouple(autre, ne); });
}

/** Noms des clubs invités AUTRES que `nomClub` (comparaison souple). Sert à lever les
 *  collisions « {club}-N » ci-dessus. Renvoie [] si l'onglet est vide/absent. */
function autresNomsClubsInvites(classeur, nomClub) {
  return clubsEditionActive(classeur)
    .map(function (c) { return String(c.club_nom || '').trim(); })
    .filter(function (n) { return n && !memeTexteSouple(n, nomClub); });
}

/**
 * Cœur PUR de la synchronisation des équipes d'un club (testé sans classeur, backend/Tests.gs).
 * Compare l'engagement déclaré (catégories + nb d'équipes) aux équipes existantes du club et
 * renvoie un PLAN : { aCreer, aSupprimer, aRenommer, alertes } — l'écriture reste dans creerEquipesClub.
 *
 * Règles (décisions Romain, session liserés) :
 *  - AJOUTS automatiques (logique historique : « {club} » si 1 équipe, sinon « {club}-1 »…) ;
 *  - RÉDUCTION (ou catégorie DÉSENGAGÉE) : on garde les N premières équipes, on ne retire une
 *    équipe QUE si elle est SUPPRIMABLE — créée par le circuit (source auto), hors poule, et
 *    absente de tout match généré. Sinon : conservée + alerte actionnable (jamais de casse
 *    silencieuse d'un planning).
 *  - Une équipe créée À LA MAIN n'est jamais supprimée par la synchro (alerte).
 *
 * @param {Array} equipes        toutes les équipes [{id_equipe, nom_equipe, categorie, poule, source}]
 * @param {string} nomClub       casse exacte du Sheet
 * @param {Array} categories     catégories ENGAGÉES (noms ; doublons tolérés, dédupliqués ici)
 * @param {Object} nbMap         { categorie: nb d'équipes }
 * @param {Object} nomsReferences { nomEquipe: true } — équipes présentes dans des matchs générés
 * @param {Array<string>} autresClubs noms des AUTRES clubs invités (anti-collision « {club}-N »)
 */
/** '' si une équipe est SUPPRIMABLE par le circuit, sinon le MOTIF de conservation. Partagé
 *  par la synchro (planifierSyncEquipesClub) et la suppression de club en cascade : une équipe
 *  créée à la main, placée en poule ou présente dans des matchs générés n'est jamais retirée. */
function motifConservationEquipe(e, nomsReferences) {
  if (String(e.source || '').trim() !== 'auto') return 'créée à la main';
  if (String(e.poule || '').trim() !== '') return 'déjà placée en poule ' + String(e.poule).trim();
  if ((nomsReferences || {})[String(e.nom_equipe).trim()]) return 'présente dans des matchs générés';
  return '';
}

function planifierSyncEquipesClub(equipes, nomClub, categories, nbMap, nomsReferences, autresClubs) {
  nomsReferences = nomsReferences || {};
  var aCreer = [], aSupprimer = [], aRenommer = [], alertes = [];

  // DÉDUPLICATION des catégories engagées (revue) : « U8,U8 » — cellule éditée à la main ou
  // deux lignes U8 en zone B — créait deux fois les mêmes équipes (noms en double dans l'onglet,
  // or les matchs référencent les équipes par NOM). Une catégorie n'est traitée qu'une fois.
  var catsUniques = [];
  (categories || []).forEach(function (c) {
    var v = String(c || '').trim();
    if (!v) return;
    if (!catsUniques.some(function (x) { return memeTexteSouple(x, v); })) catsUniques.push(v);
  });

  /** Équipe rattachée à CE club, collisions de noms exclues (« PUC-2 » peut être un club). */
  function estAMoi(e) { return equipeRattacheeAuClub(e.nom_equipe, nomClub, autresClubs); }

  // Ordre stable des équipes d'un club : « CLUB » d'abord, puis CLUB-1 < CLUB-2 < …
  function rangEquipe(nom) {
    var n = String(nom).trim();
    if (n === nomClub) return 0;
    var suffixe = parseInt(n.substring(nomClub.length + 1), 10);
    return isFinite(suffixe) ? suffixe : 0;
  }

  // Catégories à examiner : les engagées + celles où le club a ENCORE des équipes (une
  // catégorie désengagée doit voir ses équipes retirées — mêmes garde-fous). Comparaison
  // souple (accents/casse) pour ne jamais traiter deux fois la même catégorie.
  var catsExamen = catsUniques.slice();
  equipes.forEach(function (e) {
    if (!estAMoi(e)) return;
    var cat = String(e.categorie || '').trim();
    if (!cat) return;
    var deja = catsExamen.some(function (c) { return memeTexteSouple(c, cat); });
    if (!deja) catsExamen.push(cat);
  });

  catsExamen.forEach(function (cat) {
    var engagee = catsUniques.some(function (c) { return memeTexteSouple(c, cat); });
    var desired = 0;
    if (engagee) {
      desired = parseInt(nbMap[cat], 10);
      if (!isFinite(desired) || desired < 1) desired = 1;
    }
    var existantes = equipes.filter(function (e) {
      return memeTexteSouple(e.categorie, cat) && estAMoi(e);
    }).sort(function (a, b) { return rangEquipe(a.nom_equipe) - rangEquipe(b.nom_equipe); });

    // HÉRITAGE — AVANT toute autre décision, y compris « déjà à jour » : une équipe au nom NU
    // (« MASSY », créée quand le club n'en avait qu'une) rejoint la numérotation sous « MASSY-1 ».
    // C'est le cas qui produisait la paire bancale « MASSY » + « MASSY-1 » quand le club passait
    // à deux équipes. Garde-fou identique à celui de la suppression : une équipe déjà placée en
    // poule ou présente dans des matchs générés n'est PAS touchée — renommer sous les pieds d'un
    // planning déjà diffusé ferait plus de dégâts qu'un nom hétérogène — on le SIGNALE.
    var nomsPris = {};
    equipes.forEach(function (e) {
      if (memeTexteSouple(e.categorie, cat)) nomsPris[String(e.nom_equipe).trim()] = true;
    });
    var estNomDunAutreClub = function (n) {
      return (autresClubs || []).some(function (autre) { return memeTexteSouple(autre, n); });
    };
    var nue = existantes.filter(function (e) { return String(e.nom_equipe).trim() === nomClub; })[0];
    var cible1 = nomClub + '-1';
    if (nue && desired > 0 && !nomsPris[cible1] && !estNomDunAutreClub(cible1)) {
      var motifNue = motifConservationEquipe(nue, nomsReferences);
      if (motifNue) {
        alertes.push('« ' + nomClub + ' » (' + cat + ') garde son nom sans numéro : ' + motifNue +
          ' — renomme-la en « ' + cible1 + ' » à la main si tu veux une numérotation homogène.');
      } else {
        aRenommer.push({ id_equipe: nue.id_equipe, de: nomClub, vers: cible1, categorie: cat });
        nue.nom_equipe = cible1;                  // le reste du plan raisonne sur le nom FINAL
      }
    }

    if (existantes.length > desired) {
      // RÉDUCTION / DÉSENGAGEMENT : on garde les `desired` premières, on examine les suivantes.
      existantes.slice(desired).forEach(function (e) {
        var motif = motifConservationEquipe(e, nomsReferences);
        if (motif) {
          alertes.push('« ' + String(e.nom_equipe).trim() + ' » (' + cat + ') conservée : ' + motif +
            ' — retire-la à la main (onglet Équipes) ou régénère le planning.');
        } else {
          aSupprimer.push({ id_equipe: e.id_equipe, nom: String(e.nom_equipe).trim(), categorie: cat });
        }
      });
      return;
    }
    if (existantes.length === desired) return; // déjà à jour (idempotent)

    // AJOUTS : cibles nommées, on saute celles déjà présentes (logique historique) ET celles
    // qui porteraient le nom d'un AUTRE club invité (on décale alors le numéro : « PUC-2 »
    // réservé au club PUC-2 ⇒ le club PUC utilisera « PUC-3 »). Borne de sécurité pour ne
    // jamais boucler indéfiniment si beaucoup de noms sont pris.
    var presents = {};
    existantes.forEach(function (e) { presents[String(e.nom_equipe).trim()] = true; });
    // NUMÉROTATION TOUJOURS SUFFIXÉE : « MASSY-1 », « MASSY-2 »… Avant, une équipe seule
    // s'appelait « MASSY » tout court ; le jour où le club en engageait une deuxième, on gardait
    // ce nom nu et on ajoutait « MASSY-1 » — d'où la paire bancale « MASSY » + « MASSY-1 ».
    var cibles = [];
    for (var k = 1; cibles.length < desired && k <= desired + 50; k++) {
      var candidat = nomClub + '-' + k;
      if (!estNomDunAutreClub(candidat)) cibles.push(candidat);
    }

    var aFaire = desired - existantes.length;
    for (var c = 0; c < cibles.length && aFaire > 0; c++) {
      if (presents[cibles[c]]) continue;
      aCreer.push({ nom: cibles[c], categorie: cat });
      presents[cibles[c]] = true;
      aFaire--;
    }
  });

  return { aCreer: aCreer, aSupprimer: aSupprimer, aRenommer: aRenommer, alertes: alertes };
}

/**
 * SYNCHRONISE les ÉQUIPES d'un club au clic sur « Enregistrer la sélection » (admin).
 *   - nb=1 pour une catégorie → « {club} » ; nb>1 → « {club}-1 », « {club}-2 »…
 *   - CASSE EXACTE du nom du club conservée ; source = 'auto'.
 *   - IDEMPOTENT : ne recrée jamais une équipe déjà présente (correspondance de nom).
 *   - Engagement RÉDUIT ou catégorie désengagée → retire les équipes SUPPRIMABLES (source auto,
 *     hors poule, absentes des matchs) ; les autres sont conservées + alerte_ecart actionnable.
 *     Le plan complet est calculé par planifierSyncEquipesClub (pur, testé).
 * Le nombre d'équipes par catégorie vient de nb_equipes_par_categorie (réponse du club) ; à défaut
 * d'une valeur pour une catégorie engagée, on crée 1 équipe.
 */
function creerEquipesClub(classeur, data) {
  var nomClub = String(data.club_nom || '').trim();
  if (!nomClub) return { error: 'Club manquant.' };
  // ⭐ B2-2 : réservé aux clubs « Accepté » (contrôlé juste en dessous) — la participation
  //   existe donc forcément. ⛔ Ce geste n'en crée aucune.

  var club = null, clubs = clubsEditionActive(classeur);
  for (var i = 0; i < clubs.length; i++) {
    if (memeTexteSouple(clubs[i].club_nom, nomClub)) { club = clubs[i]; break; }
  }
  if (!club) return { error: 'Club introuvable : ' + nomClub };
  if (statutClubCanonique(club.statut) !== 'Accepté') {
    return { error: 'La création des équipes ne concerne qu\'un club « Accepté ».' };
  }
  var nomExact = String(club.club_nom || '').trim(); // casse exacte du Sheet

  var categories = String(club.categories_engagees || '').split(',')
    .map(function (s) { return s.trim(); }).filter(Boolean);
  var nbMap = {};
  try { nbMap = JSON.parse(String(club.nb_equipes_par_categorie || '{}')) || {}; } catch (e) { nbMap = {}; }
  // Repli HISTORIQUE (jamais après un « Enregistrer la sélection ») : sélection jamais
  // enregistrée ET categories_engagees vide → on suit la réponse du club (clés de nbMap).
  // Si l'admin a EXPLICITEMENT enregistré une sélection vide (marque posée), le vide fait
  // foi : les équipes du club sont retirées (celles qui sont supprimables).
  var dejaEnregistree = String(club.selection_enregistree || '').trim() !== '';
  if (!categories.length && !dejaEnregistree) categories = Object.keys(nbMap);
  if (!categories.length && !dejaEnregistree) return { ok: true, equipes_creees: [], equipes_supprimees: [], alerte: '' };

  var oEquipes = assurerColonneSourceEquipes(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  // Les matchs référencent les équipes par NOM : toute équipe qui y figure est intouchable.
  var nomsReferences = {};
  lireOngletSimple(classeur, 'Matchs').forEach(function (m) {
    if (m.equipe_A) nomsReferences[String(m.equipe_A).trim()] = true;
    if (m.equipe_B) nomsReferences[String(m.equipe_B).trim()] = true;
  });

  // Anti-collision de noms : une équipe qui porte le nom d'un AUTRE club invité lui appartient
  // (« PUC-2 » n'est pas la 2ᵉ équipe de « PUC » si le club « PUC-2 » existe).
  var autresClubs = clubs.map(function (c) { return String(c.club_nom || '').trim(); })
    .filter(function (n) { return n && !memeTexteSouple(n, nomExact); });

  var plan = planifierSyncEquipesClub(equipes, nomExact, categories, nbMap, nomsReferences, autresClubs);

  var creees = [];
  // RENOMMAGES d'abord : « MASSY » → « MASSY-1 » libère la place avant toute création, et évite
  // qu'une création prenne le nom que le renommage vise.
  var renommees = [];
  plan.aRenommer.forEach(function (t) {
    if (renommerEquipeParId(oEquipes, t.id_equipe, t.vers)) {
      renommees.push({ de: t.de, vers: t.vers, categorie: t.categorie });
    }
  });
  plan.aCreer.forEach(function (t) {
    ecrireNouvelleEquipe(oEquipes, t.nom, t.categorie, 'auto');
    creees.push({ nom: t.nom, categorie: t.categorie });
  });
  var supprimees = [];
  plan.aSupprimer.forEach(function (t) {
    var r = supprimerEquipe(classeur, t.id_equipe);
    if (r && r.ok) supprimees.push({ nom: t.nom, categorie: t.categorie });
  });

  // ⭐ B2-2 : l'alerte d'écart décrit CETTE édition — elle vit dans la participation.
  ecrireEngagementClub(classeur, nomClub,
    { alerte_ecart: plan.alertes.length ? plan.alertes.join(' | ') : '' }, false);
  return { ok: true, equipes_creees: creees, equipes_supprimees: supprimees,
           equipes_renommees: renommees, alerte: plan.alertes.join(' | ') };
}

/** Renomme UNE équipe (par identifiant) dans l'onglet Équipes. Les matchs et les poules
 *  référencent l'équipe par son `id_equipe` : le nom n'est qu'un libellé d'affichage, et le
 *  plan de synchronisation n'autorise le renommage que pour une équipe hors poule et hors
 *  match. @return {boolean} vrai si la ligne a été trouvée et écrite. */
function renommerEquipeParId(oEquipes, idEquipe, nouveauNom) {
  var id = String(idEquipe || '').trim();
  if (!id || !String(nouveauNom || '').trim()) return false;
  var dernier = oEquipes.getLastRow();
  if (dernier < 2) return false;
  var entetes = oEquipes.getRange(1, 1, 1, oEquipes.getLastColumn()).getValues()[0];
  var colId = entetes.indexOf('id_equipe'), colNom = entetes.indexOf('nom_equipe');
  if (colId === -1 || colNom === -1) return false;
  var ids = oEquipes.getRange(2, colId + 1, dernier - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0] || '').trim() === id) {
      var cellule = oEquipes.getRange(i + 2, colNom + 1);
      cellule.setNumberFormat('@');
      cellule.setValue(String(nouveauNom).trim());
      return true;
    }
  }
  return false;
}

/**
 * Édite les COORDONNÉES d'un club (nom + contact) — édition inline admin (Sprint 6, point 6e).
 * Ne touche PAS au statut, à la réponse déjà donnée, ni au token. Clé = ancien nom (club_nom_actuel).
 */
function modifierClubInvite(classeur, data) {
  var ancien = String(data.club_nom_actuel || '').trim();
  var ctxB22 = contexteEcritureClub(classeur, ancien);
  if (!ctxB22.club || ctxB22.ligneIdentite === -1) return { error: 'Club introuvable : ' + ancien };
  var onglet = ctxB22.ongletIdentite;
  var ligne = ctxB22.ligneIdentite;
  var nouveauNom = String(data.club_nom || '').trim();
  if (!nouveauNom) return { error: 'Le nom du club ne peut pas être vide.' };
  var email = String(data.club_contact_email || '').trim();
  if (email && !estEmailValide(email)) return { error: 'Email du contact invalide : « ' + email + ' ».' };

  var clubs = clubsEditionActive(classeur);
  for (var i = 0; i < clubs.length; i++) {
    if (!memeTexteSouple(clubs[i].club_nom, ancien) && memeTexteSouple(clubs[i].club_nom, nouveauNom)) {
      return { error: 'Un autre club porte déjà le nom « ' + clubs[i].club_nom + ' ».' };
    }
  }
  // ⭐ B2-2 — L'IDENTITÉ CHANGE, ⛔ PAS L'HISTOIRE. Ces quatre champs vivent au carnet ; les
  //   snapshots des participations passées gardent le nom et le contact d'alors, et c'est
  //   exactement pour ce cas-là qu'ils existent. ⭐ Le `club_id`, lui, ne bouge jamais : après
  //   renommage, c'est toujours le même club — les éditions passées restent rattachées.
  ecrireCellulesModele(onglet, ligne, {
    club_nom: nouveauNom,
    club_contact_prenom: String(data.club_contact_prenom || '').trim(),
    club_contact_nom: String(data.club_contact_nom || '').trim(),
    club_contact_email: email
  });
  return { ok: true };
}

/* ===================== INVITATIONS PHASE 1 (envoi par email) ===================== */

/**
 * Envoi bas niveau d'un email, partagé par les envois Phase 1 et Phase 2. LÈVE une exception
 * en cas d'échec (l'appelant décide alors de ne pas marquer la date d'envoi).
 *  - `expediteur` renseigné → GmailApp avec « from » (suppose un alias « Envoyer en tant que ») ;
 *  - sinon → MailApp (part de l'adresse du compte exécutant le script).
 */
/* ═══════════════════════════════════════════════════════════════════════════════
 * ⭐ LE TRANSPORT D'EMAIL — le point de passage UNIQUE vers les services de Google.
 *
 * ⚠️ POURQUOI CET OBJET EXISTE, et c'est un défaut RÉEL qui l'a imposé. Le harnais de tests
 * appelle `envoyerInvitationClub` pour éprouver les snapshots d'invitation. Hors de Google, la
 * doublure Node remplaçait `MailApp` par une fonction vide : l'envoi « réussissait » toujours.
 * ⛔ CHEZ GOOGLE, IL N'Y AVAIT RIEN À REMPLACER — les tests appelaient le VRAI service d'envoi,
 * qui a refusé. Résultat : **1210/1210 en local, 1203/1210 chez Google**, sept échecs tous
 * situés sur le premier envoi. ⭐ Le code métier était juste ; c'est le TEST qui dépendait
 * d'un service extérieur qu'il ne maîtrisait pas.
 *
 * 🎯 Ce qu'un objet du SCRIPT change, et c'est tout l'intérêt : `MailApp` et `GmailApp` sont
 * des services natifs de Google, ⛔ non remplaçables depuis un test qui tourne chez Google.
 * `TRANSPORT_EMAIL`, lui, est une variable ordinaire : un test la remplace de la MÊME façon
 * dans les deux environnements. ⭐ Le stub devient donc aussi fiable chez Google qu'en local.
 *
 * ⚠️ ET C'EST LE SEUL ENDROIT DU SERVEUR QUI A LE DROIT D'APPELER `MailApp` / `GmailApp`.
 * Un test d'inventaire l'exige, et un compteur prouve qu'aucun chemin ne le contourne — sans
 * quoi ce point de passage serait une façade, et le défaut reviendrait par la porte de côté.
 * ═══════════════════════════════════════════════════════════════════════════════ */
var TRANSPORT_EMAIL = {
  /** Envoi TEXTE brut. `expediteur` renseigné ⇒ GmailApp (alias « Envoyer en tant que »). */
  envoyerTexte: function (destinataire, sujet, corps, expediteur) {
    if (expediteur) {
      GmailApp.sendEmail(destinataire, sujet, corps, { name: 'L\'organisation du tournoi', from: expediteur });
    } else {
      MailApp.sendEmail({ to: destinataire, subject: sujet, body: corps, name: 'L\'organisation du tournoi' });
    }
  },
  /** Envoi HTML (avec version texte de repli et affiche en image intégrée). */
  envoyerHtml: function (destinataire, sujet, html, texte, afficheBlob, expediteur) {
    if (expediteur) {
      var opt = { htmlBody: html, name: 'L\'organisation du tournoi', from: expediteur };
      if (afficheBlob) opt.inlineImages = { affiche: afficheBlob };
      GmailApp.sendEmail(destinataire, sujet, texte, opt);
    } else {
      var msg = { to: destinataire, subject: sujet, body: texte, htmlBody: html, name: 'L\'organisation du tournoi' };
      if (afficheBlob) msg.inlineImages = { affiche: afficheBlob };
      MailApp.sendEmail(msg);
    }
  }
};

function envoyerEmailAvec(destinataire, sujet, corps, expediteur) {
  TRANSPORT_EMAIL.envoyerTexte(destinataire, sujet, corps, expediteur);
}

/**
 * Envoi bas niveau d'un email HTML (htmlBody + version texte de repli + affiche inline
 * cid:affiche si fournie), partagé par les invitations (Phase 1) et les dossiers (Phase 2).
 *  - `expediteur` renseigné → GmailApp avec « from » (alias « Envoyer en tant que ») ;
 *  - sinon → MailApp (part de l'adresse du compte exécutant le script).
 * LÈVE une exception en cas d'échec (l'appelant décide alors de ne pas marquer la date d'envoi).
 */
function envoyerEmailHtml(destinataire, sujet, html, texte, afficheBlob, expediteur) {
  TRANSPORT_EMAIL.envoyerHtml(destinataire, sujet, html, texte, afficheBlob, expediteur);
}

/**
 * Compose le corps FINAL d'une invitation Phase 1 : salutation personnalisée par club
 * (« Bonjour {prénom}, » — ou « Bonjour, » si le prénom manque) + le corps commun `corpsApres`
 * (texte d'intro + lien) fourni par l'admin (identique à l'aperçu affiché). Le contenu envoyé
 * est ainsi EXACTEMENT celui de l'aperçu, seule la salutation variant d'un club à l'autre.
 */
/** Vrai si un club est ENCORE invitable (ni Accepté, ni Décliné : Invité, vide ou inconnu). */
function clubEstInvitable(statut) {
  var canon = statutClubCanonique(statut);
  return canon !== 'Accepté' && canon !== 'Décliné';
}

/** Échappe un texte pour l'insérer sans danger dans du HTML (salutation personnalisée). */
function echapperHtmlServeur(s) {
  // Mêmes caractères que echapper() de commun.js (accent grave inclus) : défense en
  // profondeur homogène côté serveur (emails / dossiers), sûre dans tous les contextes d'attribut.
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/`/g, '&#96;');
}

/**
 * Remplace les jetons d'un modèle (HTML ou texte) par les valeurs PERSONNALISÉES du club :
 *  - `{{SALUTATION}}` → « Bonjour {prénom}, » (ou « Bonjour, » sans prénom) ;
 *  - `{{LIEN_REPONSE}}` → le lien PERSONNEL de réponse du club (avec son jeton) ;
 *  - `{{LIEN_INVITATION}}` → le lien PERSONNEL vers la page d'invitation vitrine (club + jeton) :
 *    la page y reconnaît le club et affiche son bouton « Répondre à l'invitation ».
 * En mode HTML, salutation et liens sont échappés. Le reste du modèle est inséré tel quel.
 * Un modèle SANS un de ces jetons est inchangé (rétrocompatible avec les anciens gabarits).
 */
function personnaliserInvitation(modele, prenom, lienReponse, lienInvitation, estHtml) {
  var p = String(prenom || '').trim();
  var salut = p ? ('Bonjour ' + p + ',') : 'Bonjour,';
  var lien = String(lienReponse || '');
  var lienInv = String(lienInvitation || '');
  if (estHtml) { salut = echapperHtmlServeur(salut); lien = echapperHtmlServeur(lien); lienInv = echapperHtmlServeur(lienInv); }
  return String(modele == null ? '' : modele)
    .split('{{SALUTATION}}').join(salut)
    .split('{{LIEN_REPONSE}}').join(lien)
    .split('{{LIEN_INVITATION}}').join(lienInv);
}

/** Construit un lien PERSONNEL de club (base + club + jeton) : sert au lien de RÉPONSE comme au
 *  lien d'INVITATION vitrine (même forme d'URL). '' si base/jeton absent. */
function lienReponseClub(baseReponse, nom, token) {
  var base = String(baseReponse || '').trim();
  var tok = String(token || '').trim();
  if (!base || !tok) return '';
  var sep = base.indexOf('?') === -1 ? '?' : '&';
  return base + sep + 'club=' + encodeURIComponent(nom) + '&token=' + encodeURIComponent(tok);
}

/** Lien d'INVITATION d'un club : personnel (club + jeton) si possible, sinon la page GÉNÉRIQUE
 *  (base sans paramètres — la page affiche alors sa mention « lien reçu par email »). */
function lienInvitationClub(baseInvitation, nom, token) {
  return lienReponseClub(baseInvitation, nom, token) || String(baseInvitation || '').trim();
}

/**
 * Blob de l'affiche du tournoi (fichier Drive `tournoi_affiche_id`) pour l'attacher en image
 * INLINE (cid:affiche) dans l'email. null si aucune affiche ou si le fichier est inaccessible
 * (rétrocompatibilité : l'email part alors sans image d'en-tête). Nommé « affiche » = le cid.
 */
function afficheBlobPourEmail(classeur) {
  var id = String((lireConfig(classeur).global || {}).tournoi_affiche_id || '').trim();
  if (!id) return null;
  try { var b = DriveApp.getFileById(id).getBlob(); b.setName('affiche'); return b; }
  catch (e) { return null; }
}

/**
 * Envoi d'UNE invitation HTML : personnalise la salutation, joint l'affiche inline (cid:affiche)
 * si fournie, et envoie htmlBody + version texte (fallback anti-spam / clients sans HTML).
 * MailApp par défaut (scope léger script.send_mail) ; GmailApp avec « from » si alias configuré.
 * LÈVE une exception en cas d'échec (l'appelant ne marque alors pas la date d'envoi).
 */
function envoyerInvitationEmail(dest, sujet, htmlModele, texteModele, prenom, lienReponse, lienInvitation, afficheBlob, expediteur) {
  var html = personnaliserInvitation(htmlModele, prenom, lienReponse, lienInvitation, true);
  var texte = personnaliserInvitation(texteModele, prenom, lienReponse, lienInvitation, false);
  envoyerEmailHtml(dest, sujet, html, texte, afficheBlob, expediteur);
}

/** Valide les champs communs d'un envoi d'invitation. Renvoie un message d'erreur ou ''. */
function erreurModeleInvitation(sujet, htmlModele, texteModele) {
  if (!sujet) return 'L\'objet du message est vide.';
  if (!String(htmlModele || '').trim()) return 'Le contenu HTML de l\'email est vide.';
  if (!String(texteModele || '').trim()) return 'La version texte de l\'email est vide.';
  return '';
}

/**
 * Envoi INDIVIDUEL de l'invitation Phase 1 (HTML) à UN club. Destinataire relu du Sheet (jamais
 * du client). `invitation_envoyee` posée (date du jour) uniquement en cas de SUCCÈS.
 */
function envoyerInvitationClub(classeur, data) {
  var nom = String(data.club_nom || '').trim();
  if (!nom) return { error: 'Club manquant.' };
  var sujet = String(data.sujet == null ? '' : data.sujet).trim();
  var htmlModele = String(data.html_modele == null ? '' : data.html_modele);
  var texteModele = String(data.texte_modele == null ? '' : data.texte_modele);
  var errMod = erreurModeleInvitation(sujet, htmlModele, texteModele);
  if (errMod) return { error: errMod };

  // ⭐ M1-B2 / B2-2 — C'EST ICI, ET SEULEMENT ICI, QUE NAÎT UNE PARTICIPATION D'INVITATION.
  //   Inviter un club, c'est l'engager dans cette édition : geste explicite, intention claire.
  //   ⭐ La participation (et son jeton) est créée AVANT l'envoi — le lien personnel doit
  //   figurer dans l'email. ⛔ Mais `statut` reste VIDE jusqu'au succès : voir plus bas.
  var ctxB22 = contexteEcritureClub(classeur, nom);
  if (!ctxB22.club) return { error: 'Club introuvable : ' + nom };
  var email = String(ctxB22.club.club_contact_email || '').trim();
  if (!email) return { error: 'Ce club n\'a pas d\'email de contact : à inviter manuellement.' };
  if (!estEmailValide(email)) return { error: 'Email du club invalide : « ' + email + ' ».' };
  var creeB22 = assurerParticipation(classeur, ctxB22.club);
  if (creeB22.error) return { error: creeB22.error };

  var club = null, clubs = clubsEditionActive(classeur);
  for (var i = 0; i < clubs.length; i++) { if (memeTexteSouple(clubs[i].club_nom, nom)) { club = clubs[i]; break; } }
  var prenom = club ? club.club_contact_prenom : '';
  var lienReponse = lienReponseClub(data.base_reponse, nom, club ? club.club_token : '');
  var lienInvitation = lienInvitationClub(data.base_invitation, nom, club ? club.club_token : '');

  var expediteur = String((lireConfig(classeur).global || {}).email_expediteur || '').trim();
  var afficheBlob = afficheBlobPourEmail(classeur);
  try {
    envoyerInvitationEmail(email, sujet, htmlModele, texteModele, prenom, lienReponse, lienInvitation, afficheBlob, expediteur);
  } catch (e) {
    return { error: 'Échec de l\'envoi de l\'email : ' + (e && e.message ? e.message : e) };
  }

  // ⭐ SUCCÈS — et c'est seulement maintenant que « Invité » se pose (D-050). Avant B2-2, ce
  //   statut était écrit d'office à la CRÉATION de la fiche : il ne disait donc rien de ce qui
  //   s'était réellement passé. Désormais, le voir à l'écran signifie « l'email est parti ».
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  ecrireEngagementClub(classeur, nom, { invitation_envoyee: today, statut: 'Invité' }, false);
  // 📸 ET C'EST ICI, au premier envoi RÉUSSI, que l'identité devient historique — avec les
  //   valeurs qui ont RÉELLEMENT servi à cet envoi, ⛔ pas celles relues après coup.
  figerSnapshotsInvitation(classeur, nom, {
    club_nom: (ctxB22.club && ctxB22.club.club_nom) || nom,
    club_contact_nom: (ctxB22.club && ctxB22.club.club_contact_nom) || '',
    club_contact_prenom: prenom, club_contact_email: email
  });
  return { ok: true, invitation_envoyee: today, destinataire: email };
}

/**
 * Envoi GROUPÉ des invitations Phase 1 (HTML). Filtre côté serveur (source de vérité) :
 *  - clubs ENCORE invitables (ni Accepté ni Décliné) ET avec un email valide ;
 *  - `invitation_envoyee` vide, SAUF si `renvoyer` = oui (renvoi forcé).
 * Boucle d'envoi TOLÉRANTE AUX PANNES : un échec sur un club n'arrête pas les suivants ; on
 * pose `invitation_envoyee` (date du jour) pour chaque SUCCÈS et on renvoie un résumé complet.
 * L'affiche (blob Drive) n'est récupérée qu'UNE fois et réutilisée pour tous les envois.
 */
function envoyerInvitationsGroupe(classeur, data) {
  var sujet = String(data.sujet == null ? '' : data.sujet).trim();
  var htmlModele = String(data.html_modele == null ? '' : data.html_modele);
  var texteModele = String(data.texte_modele == null ? '' : data.texte_modele);
  var errMod = erreurModeleInvitation(sujet, htmlModele, texteModele);
  if (errMod) return { error: errMod };
  var renvoyer = (String(data.renvoyer).toLowerCase() === 'oui' || data.renvoyer === true);

  var expediteur = String((lireConfig(classeur).global || {}).email_expediteur || '').trim();
  var afficheBlob = afficheBlobPourEmail(classeur);
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // ⚠️ LA LISTE DES CANDIDATS EST FIGÉE AVANT LA BOUCLE, et ce n'est pas un détail : chaque
  //   envoi CRÉE une participation (donc une ligne), et relire les clubs en cours de route
  //   ferait bouger le sol sous les pieds de la boucle.
  var candidats = clubsEditionActive(classeur);
  var envoyes = [], echecs = [], sansEmail = [], dejaInvites = [];
  candidats.forEach(function (c) {
    if (!clubEstInvitable(c.statut)) return; // Accepté / Décliné : hors invitation
    var email = String(c.club_contact_email || '').trim();
    if (!email || !estEmailValide(email)) { sansEmail.push(String(c.club_nom || '')); return; }
    var dejaInvite = String(c.invitation_envoyee || '').trim() !== '';
    if (dejaInvite && !renvoyer) { dejaInvites.push(String(c.club_nom || '')); return; }
    // ⭐ La participation (et son jeton) naît ICI, club par club : inviter est le geste qui
    //   engage. ⛔ Un club écarté ci-dessus n'en reçoit AUCUNE.
    var ctxC = contexteEcritureClub(classeur, c.club_nom);
    if (!ctxC.club) { echecs.push({ club: String(c.club_nom || ''), erreur: 'Club introuvable au carnet.' }); return; }
    var creeC = assurerParticipation(classeur, ctxC.club);
    if (creeC.error) { echecs.push({ club: String(c.club_nom || ''), erreur: creeC.error }); return; }
    var jeton = creeC.participation.club_token || c.club_token;
    try {
      var lienReponse = lienReponseClub(data.base_reponse, c.club_nom, jeton);
      var lienInvitation = lienInvitationClub(data.base_invitation, c.club_nom, jeton);
      envoyerInvitationEmail(email, sujet, htmlModele, texteModele, c.club_contact_prenom, lienReponse, lienInvitation, afficheBlob, expediteur);
      // ⭐ SUCCÈS SEUL : la date ET « Invité » — un échec ne pose ni l'une ni l'autre, et
      //   ⭐ n'interrompt pas les suivants (comportement d'origine, strictement préservé).
      ecrireEngagementClub(classeur, c.club_nom, { invitation_envoyee: today, statut: 'Invité' }, false);
      figerSnapshotsInvitation(classeur, c.club_nom, {
        club_nom: c.club_nom, club_contact_nom: c.club_contact_nom,
        club_contact_prenom: c.club_contact_prenom, club_contact_email: email
      });
      envoyes.push(String(c.club_nom || ''));
    } catch (e) {
      echecs.push({ club: String(c.club_nom || ''), erreur: (e && e.message ? e.message : String(e)) });
    }
  });

  return { ok: true, date: today, envoyes: envoyes, echecs: echecs,
           sans_email: sansEmail, deja_invites: dejaInvites };
}

/**
 * Plan de SUPPRESSION EN CASCADE des équipes d'un club (poubelle admin) — cœur PUR, testé.
 * TOUTES les équipes du club (toutes catégories) sont classées : supprimables d'un côté,
 * BLOQUANTES de l'autre (créées à la main, en poule, ou dans des matchs générés — via
 * motifConservationEquipe). La suppression du club est REFUSÉE tant qu'il reste une
 * bloquante : jamais de matchs fantômes (décision Romain, cadrage « liserés » PR B).
 * `autresClubs` lève les collisions de noms : l'équipe « PUC-2 » appartient au club « PUC-2 »
 * s'il existe, jamais au club « PUC » (revue).
 */
function planifierSuppressionClub(equipes, nomClub, nomsReferences, autresClubs) {
  var supprimables = [], bloquees = [];
  (equipes || []).forEach(function (e) {
    if (!equipeRattacheeAuClub(e.nom_equipe, nomClub, autresClubs)) return;
    var motif = motifConservationEquipe(e, nomsReferences);
    if (motif) {
      bloquees.push({ nom: String(e.nom_equipe).trim(), categorie: String(e.categorie || ''), motif: motif });
    } else {
      supprimables.push({ id_equipe: e.id_equipe, nom: String(e.nom_equipe).trim(), categorie: String(e.categorie || '') });
    }
  });
  return { supprimables: supprimables, bloquees: bloquees };
}

/**
 * Retire un club de la liste — EN CASCADE avec ses équipes (décision Romain) :
 *  - `apercu` = 'oui' → ne supprime RIEN : renvoie le plan (équipes supprimables + bloquantes)
 *    pour la boîte de confirmation de l'admin — le serveur reste la source de vérité ;
 *  - sinon → REFUSE tant qu'une équipe du club est bloquante (créée à la main / en poule /
 *    dans des matchs : jamais de matchs fantômes), sinon supprime les équipes PUIS la fiche.
 * Le plan est recalculé à l'appel réel : un changement entre l'aperçu et la confirmation
 * (planning généré entre-temps…) re-bloque la suppression.
 */
function supprimerClubInvite(classeur, data) {
  var ctxB22 = contexteEcritureClub(classeur, data.club_nom);
  if (!ctxB22.club || ctxB22.ligneIdentite === -1) {
    return { error: 'Club introuvable : ' + String(data.club_nom || '') };
  }

  // Casse EXACTE du Sheet (la correspondance des noms d'équipes en dépend).
  var nomExact = String(data.club_nom || '').trim();
  var clubs = clubsEditionActive(classeur);
  for (var i = 0; i < clubs.length; i++) {
    if (memeTexteSouple(clubs[i].club_nom, nomExact)) { nomExact = String(clubs[i].club_nom || '').trim(); break; }
  }

  var equipes = lireOngletSimple(classeur, 'Equipes');
  var nomsReferences = {};
  lireOngletSimple(classeur, 'Matchs').forEach(function (m) {
    if (m.equipe_A) nomsReferences[String(m.equipe_A).trim()] = true;
    if (m.equipe_B) nomsReferences[String(m.equipe_B).trim()] = true;
  });
  // Anti-collision : l'équipe qui porte le nom d'un AUTRE club invité lui appartient.
  var autresClubs = clubs.map(function (c) { return String(c.club_nom || '').trim(); })
    .filter(function (n) { return n && !memeTexteSouple(n, nomExact); });
  var plan = planifierSuppressionClub(equipes, nomExact, nomsReferences, autresClubs);

  if (String(data.apercu || '') === 'oui') {
    return { ok: true, apercu: true, equipes_supprimables: plan.supprimables, equipes_bloquees: plan.bloquees };
  }

  if (plan.bloquees.length) {
    return { error: 'Impossible de retirer « ' + nomExact + ' » : ' +
      plan.bloquees.map(function (b) { return '« ' + b.nom + ' » (' + b.categorie + ') ' + b.motif; }).join(' ; ') +
      '. Retire d\'abord ces équipes (onglet Équipes) ou régénère le planning.' };
  }

  plan.supprimables.forEach(function (t) { supprimerEquipe(classeur, t.id_equipe); });

  // ⭐ M1-B2 / B2-2 — SUPPRESSION LOGIQUE. À l'écran, rien ne change : le club disparaît de la
  //   liste, ses équipes partent comme avant. ⛔ Mais son IDENTITÉ n'est pas détruite : elle
  //   porte un `club_id` auquel les éditions PASSÉES sont rattachées. L'effacer rendrait leurs
  //   participations orphelines — on perdrait « ce club est venu quatre fois », qui est
  //   précisément ce que B2-2 existe pour rendre possible.
  if (ctxB22.modele === 'legacy') {
    // ⚠️ Comportement d'ORIGINE : la fiche est retirée. ⛔ Il n'y a pas d'ailleurs où la garder.
    ctxB22.ongletIdentite.deleteRow(ctxB22.ligneIdentite);
    return { ok: true, equipes_supprimees: plan.supprimables };
  }
  ecrireCellulesModele(ctxB22.ongletIdentite, ctxB22.ligneIdentite, { actif: 'non' });

  // ⭐ La participation de l'ÉDITION EN COURS, elle, part réellement : retirer un club du
  //   tournoi courant, c'est bien annuler sa venue CETTE fois. ⛔ Les participations des
  //   éditions FERMÉES ne sont jamais touchées — l'histoire ne se corrige pas.
  if (ctxB22.ligneEngagement !== -1) {
    ctxB22.ongletEngagement.deleteRow(ctxB22.ligneEngagement);
  }
  return { ok: true, equipes_supprimees: plan.supprimables };
}

/**
 * Réinitialisation d'une édition, côté clubs — M1-B2 / B2-0 :
 * ⭐ « Conserver le contact, réinitialiser l'engagement. »
 *
 * Vide, pour TOUS les clubs, les colonnes d'ENGAGEMENT de `ClubsInvites`
 * (`CLUBS_COLONNES_ENGAGEMENT`) et ne touche à AUCUNE colonne de CONTACT
 * (`CLUBS_COLONNES_CONTACT`) : le carnet d'adresses reste réutilisable d'une édition à l'autre.
 * La DÉCISION appartient à `colonnesClubsAEffacer` (pure, testable sans Sheet) ; cette fonction-ci
 * n'en est que l'EFFET. Sans effet s'il n'y a aucun club.
 *
 * ⚠️ Avant B2-0, la liste était écrite à la main ici et il en manquait QUATRE : `statut` (R-100),
 * `nb_educateurs_total`, `detail_effectifs` et `alerte_ecart` (R-099). Un club accepté à l'édition
 * précédente restait donc « Accepté » sur un classeur réinitialisé — non réinvitable
 * (`estInvitable()` exclut les acceptés), compté dans la cascade B.3 de la demande d'autorisation
 * FFR, et son dossier affichait « Joueurs annoncés : (vide) / Éducateurs annoncés : 8 ».
 *
 * ⛔ Ce lot corrige le COMPORTEMENT, pas la STRUCTURE : `ClubsInvites` mêle toujours les deux
 * familles (R-102). La séparation en `Clubs` + `Participations` appartient à B2-2 (D-050).
 */
function reinitialiserPhase2Clubs(classeur) {
  // ⭐ M1-B2 / B2-2 — SUR LE NOUVEAU MODÈLE, IL N'Y A PLUS RIEN À VIDER, ET C'EST LE GAIN
  //   CENTRAL DU LOT. L'engagement de l'édition qui s'achève appartient à cette édition ; la
  //   bascule du registre (`basculerEditionApresReset`, étape 5 du reset) en ouvre une neuve,
  //   et la nouvelle édition n'a tout simplement AUCUNE participation. Le carnet, lui, ne
  //   bouge pas — il est fait pour durer.
  //
  //   🎯 CE QUE CELA REND IMPOSSIBLE : R-099 et R-100 étaient des colonnes OUBLIÉES par la
  //   liste ci-dessous. Il n'y a plus de liste. Une colonne d'engagement ajoutée demain ne
  //   peut plus survivre à un reset — elle est dans la participation, et la participation
  //   n'est plus l'active. ⛔ Plus rien à tenir à jour, donc plus rien à oublier.
  //
  //   ⚠️ Le chemin ci-dessous reste vivant pour un classeur PAS ENCORE MIGRÉ (entre le
  //   redéploiement et `migrerClubsMaintenant()`) : là, `ClubsInvites` fait encore foi, et
  //   `colonnesClubsAEffacer` reste la seule protection. ⛔ Ne pas le retirer avant que
  //   l'ancien onglet ne disparaisse — ce qui n'est PAS l'objet de B2-2.
  if (modeleClubsEnPlace(classeur)) return;
  var onglet = classeur.getSheetByName('ClubsInvites');
  if (!onglet) return;
  assurerColonnesClubsInvites(classeur);
  var dernier = onglet.getLastRow();
  if (dernier < 2) return; // en-tête seul : rien à vider
  var entetes = onglet.getRange(1, 1, 1, Math.max(onglet.getLastColumn(), 1)).getValues()[0];
  colonnesClubsAEffacer(entetes).forEach(function (h) {
    var c = entetes.indexOf(h);
    if (c !== -1) {
      var zone = onglet.getRange(2, c + 1, dernier - 1, 1);
      zone.setNumberFormat('@');
      zone.clearContent();
    }
  });
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
 * À LANCER UNE FOIS depuis l'éditeur Apps Script (menu « Exécuter ») après avoir collé cette
 * version : déclenche la demande d'AUTORISATION d'envoi d'emails, nécessaire aux envois
 * d'invitations (Phase 1) et de dossiers (Phase 2). Sans ça, MailApp.sendEmail échoue avec
 * « Vous n'êtes pas autorisé à appeler MailApp.sendEmail » (scope script.send_mail manquant).
 * Ne modifie rien et n'envoie aucun email : lit seulement le quota restant.
 *
 * ⚠️ Le projet référence AUSSI GmailApp (pour l'alias « Envoyer en tant que », option B de la
 * passation) : la fenêtre de consentement demandera donc l'accès Gmail et pourra afficher
 * « Cette application n'est pas validée » → Paramètres avancés → « Accéder au projet (non sécurisé) ».
 * En phase de TEST (email_expediteur vide), seul MailApp est utilisé (envoi depuis le compte exécutant).
 */
function autoriserEnvoiEmail() {
  var reste = MailApp.getRemainingDailyQuota();
  Logger.log('Autorisation d\'envoi d\'emails OK — quota restant aujourd\'hui : ' + reste);
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

/**
 * Écrit dans Config tous les `champs` de `data` qui sont RENSEIGNÉS (non null), en UNE passe
 * (via ecrireParamsGlobaux) au lieu d'un ecrireParamGlobal par champ (qui relisait la plage à
 * chaque fois). Ordre = ordre de `champs`. Résultat strictement identique. Les éventuelles
 * transformations de valeurs (oui/non, normalisation) doivent être faites AVANT sur `data`.
 */
function ecrireChampsConfig(onglet, data, champs) {
  var paires = [];
  champs.forEach(function (champ) {
    if (data[champ] != null) paires.push([champ, data[champ]]);
  });
  ecrireParamsGlobaux(onglet, paires);
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
 * CŒUR PUR n° 1 de la saisie du score (chantier C-012, étape 1) : lit CE QUE LE BÉNÉVOLE A ENVOYÉ
 * et dit s'il est recevable. Ne lit AUCUN classeur — testable sans Sheet (backend/Tests.gs,
 * T-1 à T-5). Extrait tel quel de enregistrerScore : aucun comportement ne change.
 *
 * PILOTÉ PAR LA DONNÉE (session 12, tir au but) : c'est la PRÉSENCE d'au moins un champ de détail
 * qui bascule en mode détaillé — jamais la catégorie ni un réglage. En mode détaillé, le score qui
 * sert au classement est CALCULÉ (essai 5, transfo 2, pénalité 3, drop 3) et score_A/score_B sont
 * IGNORÉS ; sinon, comportement historique inchangé (score_A/score_B saisi fait foi).
 *
 * ⚠️ L'ORDRE des contrôles porte du sens et ne doit pas bouger : l'identifiant, puis le détail,
 * puis les scores — le tout AVANT que le classeur soit ouvert par l'appelant. La vérification de
 * la clé « scores » du frontend (frontend/js/api.js, sonde `__verif_cle__`) en dépend.
 *
 * @param data la requête reçue { id_match, score_A, score_B, essais_A…drop_B }
 * @return { error } si la saisie est refusée, sinon
 *         { id, score_A, score_B, modeDetail, detA, detB } — detA/detB valent null hors mode détail
 */
function litSaisieScore(data) {
  var id = (data.id_match || '').toString().trim();
  if (!id) return { error: 'Identifiant de match manquant.' };

  var detA = litDetailEquipe(data, 'A');
  var detB = litDetailEquipe(data, 'B');
  if (detA && detA.error) return { error: detA.error };
  if (detB && detB.error) return { error: detB.error };
  var modeDetail = !!(detA || detB);

  var sa, sb;
  if (modeDetail) {
    detA = detA || { essais: 0, transfo: 0, pen: 0, drop: 0, points: 0 };
    detB = detB || { essais: 0, transfo: 0, pen: 0, drop: 0, points: 0 };
    sa = detA.points; sb = detB.points;
  } else {
    sa = validerScore(data.score_A);
    sb = validerScore(data.score_B);
    if (sa === null) return { error: 'Score A invalide (entier ≥ 0 attendu).' };
    if (sb === null) return { error: 'Score B invalide (entier ≥ 0 attendu).' };
  }
  return { id: id, score_A: sa, score_B: sb, modeDetail: modeDetail, detA: detA, detB: detB };
}

/**
 * FAUT-IL ALLER LIRE LE MATCH SUIVANT ? (chantier C-012, étape 2). Prédicat PUR : ne lit AUCUN
 * classeur, ne lit pas le match suivant, et ne décide PAS du refus — il dit seulement s'il faut
 * aller le chercher pour pouvoir en décider. Testable sans Sheet (backend/Tests.gs, T-14).
 *
 * ⚡ POURQUOI CETTE FONCTION EXISTE : la lecture du match suivant coûte un balayage complet de
 * l'onglet Matchs, et elle a lieu PENDANT que le verrou d'écriture est tenu — donc pendant que les
 * autres marqueurs attendent. Elle doit rester PARESSEUSE : on ne la dépense que dans le cas ④,
 * qui est rare. La rendre systématique ralentirait chaque score saisi de la journée.
 *
 * Vrai seulement si les QUATRE conditions sont réunies : match de Coupe, déjà terminé, correction
 * explicite (modification === true), et un match suivant renseigné. C'est la condition exacte du
 * garde-fou ④ avant l'extraction — elle est simplement rendue nommable et testable.
 *
 * @param m    le match tel qu'il est dans le classeur (objet simple)
 * @param data la requête reçue, pour le drapeau `modification`
 * @return {boolean}
 */
function cascadeAVerifier(m, data) {
  var estCoupe = String(m.sous_tableau).toUpperCase() === 'COUPE';
  var dejaTermine = estTermineServeur(m.statut);
  return !!(estCoupe && dejaTermine && data.modification === true && m.match_suivant);
}

/**
 * CŒUR PUR n° 2 de la saisie du score (chantier C-012, étape 3) : porte les SIX garde-fous et,
 * s'ils passent tous, rend un PLAN D'ÉCRITURE. Ne lit AUCUN classeur, n'écrit rien — testable sans
 * Sheet (backend/Tests.gs, T-6 à T-13 et T-15 à T-17). C'est ce cœur qui referme R-042.
 *
 * ⚠️ L'ORDRE des garde-fous est celui d'avant l'extraction, et il ne doit pas bouger :
 *   match introuvable → ① Coupe en attente → ② score déjà validé → ③ départage → ④ cascade.
 *
 * ⚡ LECTURE PARESSEUSE — pourquoi cette fonction se rappelle deux fois. Seul le garde-fou ④ a
 * besoin du match suivant, et l'aller le chercher coûte un balayage complet de l'onglet Matchs,
 * SOUS le verrou d'écriture. Avant l'extraction, cette lecture n'avait lieu qu'APRÈS ① ② ③ : un
 * refus antérieur ne la payait jamais. Pour garder exactement cela sans que l'appelant ait à
 * refaire le raisonnement des garde-fous, le cœur le DIT :
 *   1er appel, sans `suivant`  → { besoin_suivant: <id> } si et seulement si ① ② ③ sont passés
 *                                 et que la cascade doit être vérifiée ;
 *   2e appel, avec `suivant`   → le verdict final.
 * Le 2e appel réévalue ① ② ③ à l'identique (fonction pure, mêmes entrées) : aucun coût, aucun écart.
 *
 * @param m       le match tel qu'il est dans le classeur — `null` = introuvable
 * @param saisie  la sortie ACCEPTÉE de litSaisieScore
 * @param data    la requête reçue, pour `modification`, `forcerCascade` et `vainqueur`
 * @param suivant le match suivant. ⚠️ TROIS valeurs distinctes, à ne pas confondre :
 *                `undefined` = PAS ENCORE LU (le cœur le réclamera) · `null` = lu, INTROUVABLE ·
 *                un objet = lu et trouvé. `null` ne bloque jamais, comme avant l'extraction.
 * @return { error, …drapeaux } · { besoin_suivant } · ou le plan { ok:true, … }
 */
function deciderEnregistrementScore(m, saisie, data, suivant) {
  if (!m) return { error: 'Match introuvable : ' + saisie.id };

  var sa = saisie.score_A, sb = saisie.score_B;
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
  if (cascadeAVerifier(m, data)) {
    if (suivant === undefined) return { besoin_suivant: m.match_suivant }; // ⚡ on ne lit qu'ici
    if (suivant && estTermineServeur(suivant.statut) && data.forcerCascade !== true) {
      return { error: 'Ce résultat a déjà été propagé vers ' + libelleMatchCourt(suivant)
               + ', qui a lui-même un score enregistré. Modifier ce score va réinitialiser la suite du tableau.',
               cascade_requise: true, match_suivant: m.match_suivant };
    }
  }

  // Tous les garde-fous sont passés → le PLAN. Le cœur ne dit pas « j'ai écrit », il dit « voici
  // ce qu'il faut écrire ». `propagation` n'y figure pas : elle n'est connue qu'après exécution.
  var detA = saisie.detA, detB = saisie.detB, modeDetail = saisie.modeDetail;

  var matchApresEcriture = objetCopieSimple(m);
  matchApresEcriture.score_A = sa; matchApresEcriture.score_B = sb;
  matchApresEcriture.statut = 'terminé'; matchApresEcriture.vainqueur = vainqueur;

  var matchOut = { id_match: saisie.id, score_A: sa, score_B: sb, statut: 'terminé', vainqueur: vainqueur };
  if (modeDetail) {
    matchOut.essais_A = detA.essais; matchOut.essais_B = detB.essais;
    matchOut.transfo_A = detA.transfo; matchOut.transfo_B = detB.transfo;
    matchOut.pen_A = detA.pen; matchOut.pen_B = detB.pen;
    matchOut.drop_A = detA.drop; matchOut.drop_B = detB.drop;
  }

  return {
    ok: true,
    estCoupe: estCoupe,
    ecriture: { score_A: sa, score_B: sb, statut: 'terminé' },
    vainqueur: vainqueur,
    detail: modeDetail,
    compteurs: modeDetail ? [detA.essais, detB.essais, detA.transfo, detB.transfo,
                             detA.pen, detB.pen, detA.drop, detB.drop] : null,
    archive: { id_match: m.id_match, categorie: m.categorie, phase: m.phase,
               equipe_A: m.equipe_A, equipe_B: m.equipe_B, score_A: sa, score_B: sb },
    matchApresEcriture: matchApresEcriture,
    reponse: { ok: true, propagation: null, detail: modeDetail, match: matchOut }
  };
}

/** Copie de surface d'un objet match (le plan ne modifie jamais l'objet reçu). Pur. */
function objetCopieSimple(o) {
  var c = {};
  for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) c[k] = o[k]; }
  return c;
}

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
  // 0) Lecture de la saisie — déléguée au cœur pur litSaisieScore (C-012 étape 1). L'ordre est
  //    INCHANGÉ : tout ce qui vient du bénévole est validé AVANT d'ouvrir le classeur.
  var saisie = litSaisieScore(data);
  if (saisie.error) return { error: saisie.error };
  var id = saisie.id;

  var onglet = classeur.getSheetByName('Matchs');
  assurerColonnesMatchs(onglet); // sécurité : colonnes bracket présentes même sans régénération
  var info = lireMatchParId(onglet, id);
  var m = info ? info.obj : null;

  // 1) LES SIX GARDE-FOUS — déléguées au cœur pur deciderEnregistrementScore (C-012 étape 3).
  //    ⚡ La lecture du match suivant reste PARESSEUSE et à la MÊME place qu'avant : le cœur ne la
  //    réclame (`besoin_suivant`) qu'une fois ① ② ③ passés. Un refus antérieur ne la paie jamais.
  var plan = deciderEnregistrementScore(m, saisie, data);
  if (plan.besoin_suivant) {
    var suivInfo = lireMatchParId(onglet, plan.besoin_suivant);
    plan = deciderEnregistrementScore(m, saisie, data, suivInfo ? suivInfo.obj : null);
  }
  if (plan.error) return plan;
  var ligne = info.ligne;

  // 2) Écriture du score (colonnes 9=score_A, 10=score_B, 11=statut) + vainqueur (Coupe).
  onglet.getRange(ligne, colMatchs('score_A'), 1, 3)
    .setValues([[plan.ecriture.score_A, plan.ecriture.score_B, plan.ecriture.statut]]);
  if (plan.estCoupe) onglet.getRange(ligne, colMatchs('vainqueur')).setValue(plan.vainqueur);
  // 2 bis) Détail du score : écrit SEULEMENT en mode détail (8 colonnes contiguës essais_A…drop_B),
  //        dans l'ordre exact de ENTETES.Matchs. En mode simple, on n'y touche pas (migration douce).
  if (plan.detail) {
    onglet.getRange(ligne, colMatchs('essais_A'), 1, 8).setValues([plan.compteurs]);
  }

  // 3) Journal de saison : archive (ou actualise) ce résultat. Ne doit JAMAIS bloquer la saisie.
  try {
    archiverResultat(classeur, plan.archive);
  } catch (errArchive) { Logger.log('Archivage historique ignoré : ' + errArchive); }

  // 4) Propagation du vainqueur dans le tableau (immédiate, dans la même action).
  //    ⚡ On propage l'objet DÉJÀ EN MÉMOIRE, à jour des valeurs écrites à l'étape 2, au lieu de
  //    relire la ligne dans le Sheet : un aller-retour de moins pendant que le verrou est tenu.
  var propagation = null;
  if (plan.estCoupe) {
    try { propagation = propagerVainqueurBracket(onglet, plan.matchApresEcriture); }
    catch (errProp) { Logger.log('Propagation bracket ignorée : ' + errProp); }
  }

  plan.reponse.propagation = propagation;
  return plan.reponse;
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

/* ===================== SCORE DÉTAILLÉ (tir au but, session 12) ===================== */
/** Valeur EN POINTS de chaque action (jeu à XV) : essai 5, transformation 2, pénalité 3, drop 3. */
var POINTS_ESSAI = 5, POINTS_TRANSFORMATION = 2, POINTS_PENALITE = 3, POINTS_DROP = 3;

/** Un compteur du détail : absent / vide ⇒ 0 ; entier ≥ 0 ⇒ sa valeur ; sinon null (invalide). */
function validerCompteur(v) {
  if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) return 0;
  return validerScore(v);
}

/**
 * Lit le détail du score d'UNE équipe (suffixe 'A' ou 'B') dans `data`. PILOTÉ PAR LA DONNÉE :
 *  - renvoie `null` si AUCUN champ détail n'est fourni (mode simple, comportement historique) ;
 *  - renvoie `{ essais, transfo, pen, drop, points }` si au moins un champ est fourni (les autres = 0) ;
 *  - renvoie `{ error }` si un champ fourni n'est pas un entier ≥ 0.
 * `points` = essais·5 + transfo·2 + pen·3 + drop·3. Pur, testable.
 */
function litDetailEquipe(data, suf) {
  data = data || {};
  var noms = ['essais_' + suf, 'transfo_' + suf, 'pen_' + suf, 'drop_' + suf];
  var present = noms.some(function (c) {
    return data[c] !== undefined && data[c] !== null && String(data[c]).trim() !== '';
  });
  if (!present) return null;
  var essais  = validerCompteur(data['essais_' + suf]);
  var transfo = validerCompteur(data['transfo_' + suf]);
  var pen     = validerCompteur(data['pen_' + suf]);
  var drop    = validerCompteur(data['drop_' + suf]);
  if (essais === null || transfo === null || pen === null || drop === null) {
    return { error: 'Détail du score invalide (entiers ≥ 0 attendus) pour l\'équipe ' + suf + '.' };
  }
  return { essais: essais, transfo: transfo, pen: pen, drop: drop,
           points: essais * POINTS_ESSAI + transfo * POINTS_TRANSFORMATION +
                   pen * POINTS_PENALITE + drop * POINTS_DROP };
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

/* ⚠️ BARÈME DE CLASSEMENT — CONTRAT PARTAGÉ AVEC LE FRONTEND ⚠️
   Réimplémenté à l'identique côté navigateur (frontend/js/tournoi.js : appliquer + comparer),
   car Apps Script et le navigateur ne peuvent pas partager un même .js. TOUTE modification ici
   DOIT être répercutée là-bas (et inversement). Spécification unique : docs/regles-classement.md */
var POINTS_VICTOIRE = 3;
var POINTS_NUL = 2;
var POINTS_DEFAITE = 1;

/** Applique un résultat (points marqués "pour" / encaissés "contre") aux stats d'une équipe. */
function enregistrerResultat(s, pour, contre) {
  s.j++; s.bp += pour; s.bc += contre; s.diff = s.bp - s.bc;
  if (pour > contre) { s.v++; s.pts += POINTS_VICTOIRE; }
  else if (pour === contre) { s.n++; s.pts += POINTS_NUL; }
  else { s.d++; s.pts += POINTS_DEFAITE; }
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
 * Valeurs : CROISE / CROISE_DIAGONAL / POULES_NIVEAU / LIBRE / COUPE_PLATEAU.
 */
function formatApresMidi(cat) {
  var f = (cat && cat.format_apresmidi != null) ? String(cat.format_apresmidi).trim().toUpperCase() : '';
  return (f === 'LIBRE' || f === 'COUPE_PLATEAU' || f === 'CROISE_DIAGONAL' || f === 'POULES_NIVEAU') ? f : 'CROISE';
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
    // Super Challenge (session 14) : un plateau SCF est d'un seul tenant — PAS d'après-midi. La
    // catégorie est ignorée ici, ses matchs restent ceux générés par calculerPlanning (phase 2).
    if (contexteScfCategorie(cat).estScf) return;
    var fmt = formatApresMidi(cat);
    var cl = classParCat[cat.categorie];
    var res;
    if (fmt === 'LIBRE')              res = fixturesApresMidiLibre(cat, cl);
    else if (fmt === 'COUPE_PLATEAU') res = fixturesApresMidiCoupePlateau(cat, cl, lireParamFormat(cat));
    else if (fmt === 'CROISE_DIAGONAL') res = fixturesApresMidiCroiseDiagonal(cat, cl);
    else if (fmt === 'POULES_NIVEAU') res = fixturesApresMidiPoulesNiveau(cat, cl);
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

/* ---------- Sous-générateur : POULES_NIVEAU (session 20) ---------- */
/**
 * Tailles des poules de niveau pour n équipes : poules de 4 à 5, « le BAS joue plus » (les
 * équipes en trop vont aux poules du BAS, qui passent à 5) — décision Romain, esprit École de
 * Rugby : la doctrine FFR à ces âges est développementale, le temps de jeu supplémentaire va aux
 * enfants qui en ont le plus besoin, et la fatigue ne se concentre pas sur les équipes de tête.
 * Même philosophie de découpage que le matin (nombrePoules), appliquée au classement de midi.
 * Pur, partagé avec FORMULES_PHASE2.
 *   8→[4,4] · 6→[3,3] · 9→[4,5] · 12→[4,4,4] · 16→[4,4,4,4] · 20→[5,5,5,5] · 7→[3,4]
 * (nb = ceil(n/5) garde les poules ≤ 5 ; quand les poules du matin font 4-5, les tranches tombent
 * pile sur les rangs — la poule haute reste « le championnat des 1ᵉʳˢ ».)
 */
function taillesPoulesNiveau(n) {
  if (n < 2) return [];
  var nb = Math.ceil(n / 5);
  var base = Math.floor(n / nb), reste = n % nb;
  var tailles = [];
  for (var i = 0; i < nb; i++) tailles.push(base + (i >= nb - reste ? 1 : 0));
  return tailles;
}

/**
 * Classement de MIDI toutes poules confondues : d'abord tous les 1ᵉʳˢ, puis tous les 2ᵉˢ, etc. ;
 * à rang égal, départage aux POINTS du matin (comparerClassement : pts, diff, marqués). Renvoie la
 * liste ordonnée des entrées de classement. Pur.
 */
function ordonnerClassementMidi(cl) {
  var poules = (cl && cl.poules) || [];
  var rangMax = 0;
  poules.forEach(function (p) { if (p.classement.length > rangMax) rangMax = p.classement.length; });
  var liste = [];
  for (var r = 0; r < rangMax; r++) {
    var rang = [];
    poules.forEach(function (p) { if (p.classement[r]) rang.push(p.classement[r]); });
    rang.sort(comparerClassement);
    liste = liste.concat(rang);
  }
  return liste;
}

/**
 * POULES DE NIVEAU : le classement de midi est découpé en tranches de 4-5 (taillesPoulesNiveau) ;
 * chaque tranche devient une poule de niveau (N1 = haute, N2, …) jouée en ROUND-ROBIN COMPLET.
 * Le 1ᵉʳ du classement de la poule haute est le vainqueur du tournoi — AUCUNE finale, aucun match
 * sec : conforme au règlement EDR (phases finales interdites). Contrairement au croisé classique,
 * ce format donne un vrai volume de jeu même à 2 poules le matin (poule haute de 4 → 3 matchs
 * chacune, au lieu du niveau à 2 → 1 match). Fonctionne dès 1 poule le matin.
 */
function fixturesApresMidiPoulesNiveau(cat, cl) {
  var liste = ordonnerClassementMidi(cl);
  if (liste.length < 2) {
    return { fixtures: [], avert: ['moins de 2 équipes classées : poules de niveau impossibles.'] };
  }
  var tailles = taillesPoulesNiveau(liste.length);
  var fixtures = [];
  var debut = 0;
  for (var i = 0; i < tailles.length; i++) {
    var groupe = liste.slice(debut, debut + tailles[i]).map(function (e) { return e.id_equipe; });
    debut += tailles[i];
    if (groupe.length < 2) continue;
    var label = 'N' + (i + 1);
    tourneeToutesRondes(groupe).forEach(function (pr) {
      fixtures.push({ poule: label, equipe_A: pr.a, equipe_B: pr.b, round: pr.round, format: 'POULES_NIVEAU' });
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
function planifierApresMidi(config, fixturesParCat, matin, debutMin) {
  var global = config.global;
  var dejDeb = hmVersMin(global.pause_dejeuner_debut || '12:30');
  var dejDur = parseInt(global.pause_dejeuner_duree_min || '0', 10) || 0;
  // Départ de la planification : normalement la reprise après le déjeuner (après-midi du MÊME jour).
  // Un `debutMin` explicite prime et ignore le déjeuner — utilisé pour le brassage du DIMANCHE
  // (2ᵉ journée du Super Challenge Phase 3), qui démarre à l'heure de début, sans lien avec le samedi.
  var tReprise = (debutMin != null) ? debutMin : (dejDeb + dejDur);
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
    // Temps de jeu imposé par le règlement en contexte Super Challenge (dimanche = 2×11), sinon réglages.
    var sctx = contexteScfCategorie(cat);
    var duree = sctx.estScf ? dureeMatchScf(cat, sctx.phase) : dureeMatch(cat);
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
/** Numéro de colonne (1-indexé) d'un en-tête dans une liste ENTETES.X, ou 0 si absent.
 *  Évite les numéros de colonne « magiques » (2, 3…) dispersés dans le code. */
function colDe(entetes, nom) { return entetes.indexOf(nom) + 1; }

function colMatchs(nom) { return colDe(ENTETES.Matchs, nom); }

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

/** Transforme un match (objet lu depuis l'onglet) en ligne dans l'ordre des colonnes.
 *  Délègue à matchObjToRowComplet (mappe TOUTES les colonnes par nom) → préserve les colonnes
 *  récentes (score détaillé, arbitre) lors des réécritures. Conserve le défaut phase='poule'. */
function matchObjToRow(m) {
  var mm = (m && (m.phase == null || m.phase === '')) ? Object.assign({}, m, { phase: 'poule' }) : m;
  return matchObjToRowComplet(mm);
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
  assurerColonneCategorie(classeur, 'max_equipes_par_club');
  assurerColonneCategorie(classeur, 'forme_jeu');
  // Contexte U14 (session 13, déclaratif) : Super Challenge de France vs tournoi ordinaire.
  assurerColonneCategorie(classeur, 'contexte_tournoi');
  assurerColonneCategorie(classeur, 'scf_phase');
  // Pause méridienne échelonnée (option par catégorie).
  assurerColonneCategorie(classeur, 'pause_echelonnee');
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

/**
 * Nombre de groupes visé pour le SUPER CHALLENGE, en privilégiant les TRIANGULAIRES (3 équipes) :
 *   • effectif multiple de 3 → que des triangulaires (6→2, 9→3, 12→4) ;
 *   • +1 (n≡1) → une quadrangulaire d'appoint (4→1, 7→2 = 4+3, 10→3 = 4+3+3) ;
 *   • +2 (n≡2, n≥8) → deux quadrangulaires (8→2 = 4+4, 11→3 = 4+4+3) ;
 *   • cas dégénéré (n=5 : 3+2) → au mieux (≈ n/3), signalé ailleurs par fixtureScfGroupe.
 * La répartition club-par-club de calculerPlanning égalise ensuite les tailles (ceil/floor). Pur. */
function nbGroupesScf(n) {
  if (n < 3) return 1;
  var r = n % 3;
  if (r === 0) return n / 3;
  if (r === 1) return (n - 1) / 3;
  if (n >= 8)  return (n - 2) / 3;
  return Math.max(1, Math.round(n / 3));
}

/** Vrai si la catégorie a un nombre de poules FORCÉ (override manuel actif). */
function poulesForcees(cat) {
  var force = parseInt(cat && cat.nb_poules, 10);
  return isFinite(force) && force >= 1;
}

/**
 * Contexte de jeu retenu pour une catégorie U14 (session 13, PUREMENT DÉCLARATIF).
 * Source unique et PRUDENTE PAR CONSTRUCTION du couple (contexte, phase) que consommera la
 * génération Super Challenge de France (session 14). Ne s'applique QU'À la catégorie FFR M14
 * (= U14 dans l'app) : pour toute autre catégorie on renvoie TOUJOURS le contexte ordinaire, quel
 * que soit le contenu des colonnes — une valeur 'SCF' déposée par erreur sur une U12 est ignorée,
 * jamais « devinée ». Symétrie côté écran : contexteTournoiDe / scfPhaseDe (admin.js).
 *   - contexte : 'SCF' seulement si la catégorie est U14 ET contexte_tournoi vaut exactement 'SCF' ;
 *                tout le reste (vide, 'LAMBDA', inconnu, catégorie ≠ U14) → 'LAMBDA' (historique).
 *   - phase    : 'P3' seulement si scf_phase vaut exactement 'P3' ; tout le reste → 'P2' (défaut).
 *   - estScf   : raccourci booléen (contexte === 'SCF').
 * Pur, testable, sans accès classeur.
 */
function contexteScfCategorie(cat) {
  var estU14 = normaliserCategorie(cat && cat.categorie) === '14';
  var ctxBrut = String((cat && cat.contexte_tournoi) == null ? '' : cat.contexte_tournoi).trim().toUpperCase();
  var contexte = (estU14 && ctxBrut === 'SCF') ? 'SCF' : 'LAMBDA';
  var phaseBrut = String((cat && cat.scf_phase) == null ? '' : cat.scf_phase).trim().toUpperCase();
  var phase = (phaseBrut === 'P3') ? 'P3' : 'P2';
  return { contexte: contexte, phase: phase, estScf: (contexte === 'SCF') };
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
  // Réorganiser les poules, c'est CHANGER les adversaires : le planning que les clubs auraient
  // sous les yeux n'est plus celui qu'ils ont reçu. Il repasse donc invisible, comme après une
  // génération — l'organisateur republie quand l'équilibre lui convient.
  ecrireParamGlobal(classeur.getSheetByName('Config'), 'planning_visible_clubs', 'non');

  return {
    ok: true,
    nb_poules: r.poules.length,
    nb_matchs: r.matchsFinaux.length,
    heure_fin_journee: (autoFin && finJournee > 0) ? minVersHm(finJournee) : '',
    avertissements: r.avert
  };
}

/**
 * PUBLICATION DU PLANNING AUX CLUBS (clé admin). Un simple témoin oui/non dans Config, que le
 * dossier de chaque club interroge avant d'afficher ses poules et ses matchs.
 *
 * POURQUOI : générer les poules ne veut pas dire les valider. Une « équipe 1 » tombée dans une
 * poule d'équipes 2 fait un match sans intérêt pour personne ; l'organisateur veut regarder,
 * corriger, et seulement ENSUITE montrer. Toute génération ou réorganisation des poules remet ce
 * témoin à « non » : on ne peut pas publier par oubli, seulement par décision.
 *
 * ⚠️ Ce verrou couvre le DOSSIER des clubs. La page publique des scores, elle, reste commandée
 * par `tournoi_publie` : tant que le tournoi est publié, elle montre le planning à qui a le lien.
 */
function publierPlanningClubs(classeur, data) {
  var visible = String((data && data.visible) || '').toLowerCase() === 'oui' ? 'oui' : 'non';
  ecrireParamGlobal(classeur.getSheetByName('Config'), 'planning_visible_clubs', visible);
  return { ok: true, planning_visible_clubs: visible };
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

  // Pause méridienne échelonnée : réglage GLOBAL (carte Horaires). Quand il est actif, chaque
  // catégorie éligible (≥ 4 équipes) joue en UN round-robin planifié en deux vagues, sans pause
  // déjeuner globale. echelonneParCat est rempli à l'étape 1 ; finReposEchelonne = heure à laquelle
  // la DERNIÈRE équipe finit sa pause (max sur les catégories).
  var echGlobal = String(global.pause_echelonnee == null ? '' : global.pause_echelonnee).trim().toLowerCase() === 'oui';
  var echelonneParCat = {};
  var finReposEchelonne = 0;

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

    // Pause méridienne échelonnée (réglage GLOBAL) : la catégorie joue en UN round-robin (une seule
    // poule « A »), planifié en deux vagues à l'étape 3. Éligible dès 4 équipes (les vagues inégales
    // d'un effectif impair sont gérées par un bye). En dessous, repli propre + avertissement.
    if (echGlobal) {
      if (eqCat.length >= 4) {
        var eqE = melange ? melanger(eqCat.slice()) : eqCat.slice();
        compteurPoule++;
        var pouleE = { id_poule: 'P' + (compteurPoule < 10 ? '0' + compteurPoule : compteurPoule),
                       categorie: cat.categorie, nom_poule: 'A', equipes: eqE };
        poules.push(pouleE);
        eqE.forEach(function (e) { affectationPoule[e.id_equipe] = 'A'; });
        echelonneParCat[cat.categorie] = true;
        return; // catégorie suivante (matchs générés à l'étape 3 par le planificateur échelonné)
      }
      avert.push('Catégorie ' + cat.categorie + ' : pause échelonnée demandée mais seulement ' +
        eqCat.length + ' équipe(s) (il en faut au moins 4) — pause classique conservée pour cette catégorie.');
      // on n'active pas l'échelonnement : la catégorie retombe sur le mode classique ci-dessous.
    }

    if (melange) eqCat = melanger(eqCat);
    // Super Challenge : on regroupe en TRIANGULAIRES (3 équipes) plutôt qu'en ~4/poule, sauf si le
    // nombre de poules est explicitement forcé par l'organisateur.
    var sctxCat = contexteScfCategorie(cat);
    var nbPoules = (sctxCat.estScf && !poulesForcees(cat))
      ? nbGroupesScf(eqCat.length)
      : nombrePoules(cat, eqCat.length);
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

  // Contexte Super Challenge par catégorie (session 14) : { categorie -> phase 'P2'|'P3' } pour les
  // seules catégories U14 en mode SCF. Une catégorie absente de cette table = tournoi ordinaire.
  var scfParCat = {};
  categories.forEach(function (c) {
    var s = contexteScfCategorie(c);
    if (s.estScf) scfParCat[c.categorie] = s.phase;
  });
  // Phase 3 : le brassage du dimanche EST branché — `genererDimancheScf`, avec son action serveur et
  // son bouton « Générer le dimanche (brassage) ». Cette génération-ci ne produit QUE le SAMEDI
  // (triangulaires 2×11) : la 2ᵉ journée se déclenche à part, une fois les scores du samedi saisis —
  // et on le DIT ci-dessous.
  Object.keys(scfParCat).forEach(function (c) {
    if (scfParCat[c] === 'P3') {
      avert.push('Catégorie ' + c + ' (Super Challenge — Phase 3) : ceci génère les rencontres du ' +
        'SAMEDI (2×11). Une fois tous les scores du samedi saisis, utilise « Générer le dimanche ' +
        '(brassage) » pour la 2ᵉ journée (poules E/F/G par niveau).');
    }
  });

  // 2) Matchs de poule (round-robin) — ou fixture Super Challenge (triangulaire/quadrangulaire).
  var matchsParCat = {};
  poules.forEach(function (poule) {
    if (echelonneParCat[poule.categorie]) return; // planifié à l'étape 3 (round-robin échelonné)
    var ids = poule.equipes.map(function (e) { return e.id_equipe; });
    if (!matchsParCat[poule.categorie]) matchsParCat[poule.categorie] = [];
    // Phase 3 = TRIANGULAIRES uniquement (règlement). Un groupe d'une autre taille (ex. 4 → quad)
    // est signalé : l'effectif ne tombe pas juste (il faut un multiple de 3).
    if (scfParCat[poule.categorie] === 'P3' && ids.length !== 3) {
      avert.push('Catégorie ' + poule.categorie + ' (Super Challenge Phase 3) : un groupe de ' +
        ids.length + ' équipe(s) — la Phase 3 se joue en TRIANGULAIRES (3 équipes par groupe). ' +
        'Prévois un effectif multiple de 3.');
    }
    var fixtures = scfParCat[poule.categorie]
      ? fixtureScfGroupe(ids, poule.categorie, function (msg) { avert.push(msg); })
      : tourneeToutesRondes(ids);
    fixtures.forEach(function (pr) {
      matchsParCat[poule.categorie].push({ poule: poule.nom_poule, equipe_A: pr.a, equipe_B: pr.b,
                                           round: pr.round, arbitre: pr.arbitre });
    });
  });

  // 3) Planning (horaires + terrains)
  var terrainLibre = {}, equipeLibre = {}, matchsFinaux = [], compteurMatch = 0;
  categories.forEach(function (cat) {
    // Pause méridienne échelonnée : planificateur dédié (2 vagues, repos ≥ 60, une poule « A »).
    if (echelonneParCat[cat.categorie]) {
      var pouleEch = poules.filter(function (p) { return p.categorie === cat.categorie; })[0];
      var idsEch = pouleEch ? pouleEch.equipes.map(function (e) { return e.id_equipe; }) : [];
      var terrainsEch = listeTerrainsCategorie(cat);
      if (!terrainsEch.length) { avert.push('Catégorie ' + cat.categorie + ' : aucun terrain défini.'); return; }
      var planEch = planifierCategorieEchelonnee(idsEch, terrainsEch, {
        duree: dureeMatch(cat), battement: battement,
        recup: parseInt(cat.recup_entre_matchs_min || '0', 10) || 0, repos: 60,
        debut: tDebut, dejDebut: dejDeb
      });
      if (planEch.finRepos > finReposEchelonne) finReposEchelonne = planEch.finRepos;
      planEch.matchs.forEach(function (m) {
        compteurMatch++;
        if (m.heure_fin_min > maxFin) maxFin = m.heure_fin_min;
        matchsFinaux.push([ idMatch(compteurMatch), cat.categorie, 'A', (m.terrain || ''),
                            minVersHm(m.heure_debut_min), minVersHm(m.heure_fin_min),
                            m.equipe_A, m.equipe_B, '', '', 'à venir', 'poule' ]);
      });
      planEch.avert.forEach(function (a) { avert.push('Catégorie ' + cat.categorie + ' — ' + a); });
      return;
    }
    var liste = (matchsParCat[cat.categorie] || []).slice();
    liste.sort(function (x, y) { return x.round - y.round; });
    var terrains = listeTerrainsCategorie(cat);
    if (terrains.length === 0 && liste.length > 0) avert.push('Catégorie ' + cat.categorie + ' : aucun terrain défini.');
    // Temps de jeu : imposé par le règlement en contexte Super Challenge (2×15 P2 / 2×11 P3), sinon
    // calculé depuis les réglages de mi-temps de la catégorie.
    var duree = scfParCat[cat.categorie] ? dureeMatchScf(cat, scfParCat[cat.categorie]) : dureeMatch(cat);
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
      // Ligne pleine largeur : identique à avant pour un match ordinaire ; l'arbitre désigné (Super
      // Challenge, m.arbitre) est écrit dans sa colonne quand il existe.
      var ligne = [];
      for (var ci = 0; ci < LARGEUR_MATCHS; ci++) ligne.push('');
      ligne[0] = idMatch(compteurMatch); ligne[1] = cat.categorie; ligne[2] = m.poule;
      ligne[3] = (terrainChoisi || ''); ligne[4] = minVersHm(debut); ligne[5] = minVersHm(fin);
      ligne[6] = m.equipe_A; ligne[7] = m.equipe_B; ligne[10] = 'à venir'; ligne[11] = 'poule';
      if (m.arbitre) ligne[colMatchs('arbitre') - 1] = m.arbitre;
      matchsFinaux.push(ligne);
    });
  });

  return { poules: poules, affectationPoule: affectationPoule, matchsFinaux: matchsFinaux, maxFin: maxFin,
           finReposEchelonne: finReposEchelonne, avert: avert };
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
      // Super Challenge (session 14) : pas d'après-midi → ne contribue pas à la projection de fin.
      if (contexteScfCategorie(cat).estScf) return;
      var poulesCat = poules.filter(function (p) { return p.categorie === cat.categorie; });
      // POULES_NIVEAU : la projection suit la VRAIE structure (tranches de 4-5 en round-robin
      // complet), pas l'approximation croisée — sinon la fin de journée serait sous-estimée
      // (1 match projeté là où 3 seront joués). Placeholders : la composition exacte des tranches
      // n'a aucune importance pour le TEMPS, seul le nombre de matchs par poule compte.
      if (formatApresMidi(cat) === 'POULES_NIVEAU') {
        var total = 0;
        poulesCat.forEach(function (p) { total += p.equipes.length; });
        var tailles = taillesPoulesNiveau(total);
        var fx = [], num = 0;
        for (var ti = 0; ti < tailles.length; ti++) {
          var groupe = [];
          for (var gi = 0; gi < tailles[ti]; gi++) groupe.push('PROJ_' + cat.categorie + '_' + (num++));
          if (groupe.length < 2) continue;
          var lab = 'N' + (ti + 1);
          tourneeToutesRondes(groupe).forEach(function (pr) {
            fx.push({ poule: lab, equipe_A: pr.a, equipe_B: pr.b, round: pr.round });
          });
        }
        if (fx.length) fixturesParCat[cat.categorie] = fx;
        return;
      }
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

/* ===================== REGISTRE DES ÉDITIONS (M1-B2 / B2-1) =====================
 * POURQUOI CE REGISTRE EXISTE (risque R-106, doctrine D-050).
 *
 * Jusqu'ici, la seule chose qui ressemblait à un identifiant de tournoi était `tournoi_id`
 * (onglet Config). Mais il est REPOSÉ à chaque « Générer poules et planning » — or régénérer
 * est un geste normal et répété pendant la préparation. Un seul tournoi réel produisait donc
 * plusieurs identifiants : il identifie une GÉNÉRATION DE PLANNING, pas une ÉDITION.
 *
 * ⭐ `edition_id` répond à l'autre question : « de quelle édition parle-t-on ? ». Il est tiré
 * UNE SEULE FOIS, à l'ouverture, et ne bouge plus jamais — quoi qu'on régénère.
 *
 * ⛔ CE QUE CE REGISTRE N'EST PAS. Ce n'est pas un sélecteur : Maxilou reste MONO-TOURNOI.
 * Une seule ligne est `active`, et aucune fonction ne permet de « choisir » une édition.
 * C'est une ÉTIQUETTE DE RATTACHEMENT pour l'avenir (participations, archives), rien de plus.
 *
 * ⚠️ TROIS RÈGLES QUI NE SE DÉDUISENT PAS L'UNE DE L'AUTRE :
 *   ① une LECTURE ordinaire ne crée JAMAIS d'identifiant (sinon il en naîtrait un par hasard,
 *     au premier écran ouvert — c'est exactement le défaut de `assurerTournoiId`, qui lui est
 *     légitime parce qu'il n'a pas à durer) ;
 *   ② une ouverture rejouée ne crée PAS de doublon (elle est idempotente) ;
 *   ③ plusieurs éditions actives est une ANOMALIE : on la SIGNALE, on n'en choisit pas une.
 */

var EDITION_STATUT_ACTIVE = 'active';
var EDITION_STATUT_FERMEE = 'fermee';

/**
 * ⭐ LE CŒUR PUR du registre — aucune dépendance à Google, testable seul.
 * Lit le bloc de DONNÉES du registre (sans la ligne d'en-tête) et dit ce qu'il contient.
 * @param lignes  tableau de lignes [edition_id, statut, date_creation, date_fermeture]
 * @return {Object} { etat, actives, edition, total }
 *   etat = 'vide'             : aucune édition active (registre neuf, ou toutes fermées) ;
 *          'ok'               : exactement une active — `edition` la porte ;
 *          'plusieurs_actives': ANOMALIE — `actives` les liste TOUTES, `edition` reste null.
 * ⛔ Ne choisit jamais entre plusieurs actives, et ne crée rien.
 */
function analyserRegistreEditions(lignes) {
  var actives = [];
  var total = 0;
  (lignes || []).forEach(function (l) {
    var id = String((l && l[0]) === undefined || l[0] === null ? '' : l[0]).trim();
    if (!id) return;                      // ligne vide : ignorée, jamais comptée
    total++;
    var statut = String(l[1] === undefined || l[1] === null ? '' : l[1]).trim().toLowerCase();
    if (statut === EDITION_STATUT_ACTIVE) {
      actives.push({ edition_id: id, statut: statut,
                     date_creation: String(l[2] === undefined || l[2] === null ? '' : l[2]),
                     date_fermeture: String(l[3] === undefined || l[3] === null ? '' : l[3]) });
    }
  });
  if (actives.length === 0) return { etat: 'vide', actives: [], edition: null, total: total };
  if (actives.length > 1) return { etat: 'plusieurs_actives', actives: actives, edition: null, total: total };
  return { etat: 'ok', actives: actives, edition: actives[0], total: total };
}

/**
 * ⭐ PUR — Décide ce que devient le registre quand on OUVRE une édition sans en fermer aucune
 * (classeur neuf, ou migration d'un classeur déjà en service).
 * IDEMPOTENT : si une édition est déjà active, ⛔ on ne crée RIEN et on renvoie l'existante.
 * @return { ok, cree, lignes, edition } ou { error } si le registre est en anomalie.
 */
function planifierOuvertureEdition(lignes, nouvelId, horodatage) {
  var etatRegistre = analyserRegistreEditions(lignes);
  if (etatRegistre.etat === 'plusieurs_actives') {
    return { error: erreurPlusieursEditionsActives(etatRegistre) };
  }
  if (etatRegistre.etat === 'ok') {
    // Déjà une édition active : la rejouer ne doit RIEN produire (garde-fou ② ci-dessus).
    return { ok: true, cree: false, lignes: (lignes || []).slice(), edition: etatRegistre.edition };
  }
  var id = String(nouvelId || '').trim();
  if (!id) return { error: 'Identifiant d\'édition manquant.' };
  if (identifiantEditionDejaPresent(lignes, id)) {
    return { error: 'Identifiant d\'édition déjà présent dans le registre : ' + id + '.' };
  }
  var neuve = [id, EDITION_STATUT_ACTIVE, String(horodatage || ''), ''];
  var suite = (lignes || []).slice();
  suite.push(neuve);
  return { ok: true, cree: true, lignes: suite,
           edition: { edition_id: id, statut: EDITION_STATUT_ACTIVE,
                      date_creation: String(horodatage || ''), date_fermeture: '' } };
}

/**
 * ⭐ PUR — Décide ce que devient le registre à la BASCULE : l'édition qui s'achève est FERMÉE
 * et une édition vide est ouverte dans le même mouvement.
 *
 * ⚠️ Le résultat est le bloc COMPLET des lignes, destiné à UNE SEULE écriture : c'est ce qui
 * interdit la demi-bascule (une ancienne fermée sans nouvelle, ou deux actives). Fermer puis
 * ouvrir en deux écritures laisserait, entre les deux, un registre sans aucune édition active.
 *
 * ⛔ Registre en anomalie ⇒ refus. ⭐ Registre vide ⇒ on ouvre simplement (rien à fermer) :
 *   c'est le cas d'un classeur réinitialisé avant que la migration n'ait été jouée.
 * @return { ok, lignes, edition, fermee } ou { error }
 */
function planifierBasculeEdition(lignes, nouvelId, horodatage) {
  var etatRegistre = analyserRegistreEditions(lignes);
  if (etatRegistre.etat === 'plusieurs_actives') {
    return { error: erreurPlusieursEditionsActives(etatRegistre) };
  }
  var id = String(nouvelId || '').trim();
  if (!id) return { error: 'Identifiant d\'édition manquant.' };
  if (identifiantEditionDejaPresent(lignes, id)) {
    return { error: 'Identifiant d\'édition déjà présent dans le registre : ' + id + '.' };
  }
  var fermee = null;
  var suite = (lignes || []).map(function (l) {
    var ligne = (l || []).slice();
    var idLigne = String(ligne[0] === undefined || ligne[0] === null ? '' : ligne[0]).trim();
    var statut = String(ligne[1] === undefined || ligne[1] === null ? '' : ligne[1]).trim().toLowerCase();
    if (idLigne && statut === EDITION_STATUT_ACTIVE) {
      ligne[1] = EDITION_STATUT_FERMEE;
      ligne[3] = String(horodatage || '');
      fermee = { edition_id: idLigne, statut: EDITION_STATUT_FERMEE,
                 date_creation: String(ligne[2] === undefined || ligne[2] === null ? '' : ligne[2]),
                 date_fermeture: String(horodatage || '') };
    }
    return ligne;
  });
  suite.push([id, EDITION_STATUT_ACTIVE, String(horodatage || ''), '']);
  return { ok: true, lignes: suite, fermee: fermee,
           edition: { edition_id: id, statut: EDITION_STATUT_ACTIVE,
                      date_creation: String(horodatage || ''), date_fermeture: '' } };
}

/** Vrai si cet identifiant figure DÉJÀ dans le registre, quel que soit son statut.
 *  ⭐ Un `edition_id` n'est jamais réutilisé — pas même celui d'une édition fermée. */
function identifiantEditionDejaPresent(lignes, id) {
  var cible = String(id || '').trim();
  if (!cible) return false;
  return (lignes || []).some(function (l) {
    return String((l && l[0]) === undefined || l[0] === null ? '' : l[0]).trim() === cible;
  });
}

/** Message unique de l'anomalie « plusieurs éditions actives » (jamais recopié ailleurs). */
function erreurPlusieursEditionsActives(etatRegistre) {
  var ids = (etatRegistre.actives || []).map(function (e) { return e.edition_id; }).join(', ');
  return 'Registre des éditions incohérent : ' + (etatRegistre.actives || []).length +
    ' éditions sont marquées « active » (' + ids + '). ' +
    'Une seule doit l\'être. Aucune n\'a été choisie : corrige l\'onglet Editions à la main ' +
    '(laisse « active » sur la seule édition en cours, passe les autres à « fermee »).';
}

/* ---------------------- Les EFFETS : le classeur ---------------------- */

/**
 * Crée l'onglet Editions à la demande (même patron qu'assurerOngletSponsors : un classeur en
 * service ne se re-`setupSheet` jamais). ⛔ Ne crée AUCUNE ligne : l'onglet nu ne porte aucun
 * identifiant, et c'est le point — l'ouverture d'une édition est un geste à part.
 */
function assurerOngletEditions(classeur) {
  var onglet = classeur.getSheetByName('Editions');
  if (!onglet) {
    creerOngletAvecEntetes(classeur, 'Editions', ENTETES.Editions);
    onglet = classeur.getSheetByName('Editions');
  }
  return onglet;
}

/** Lit le bloc de DONNÉES du registre (sans l'en-tête). Onglet absent ⇒ [] — ⛔ rien n'est créé. */
function lireLignesEditions(classeur) {
  var onglet = classeur.getSheetByName('Editions');
  if (!onglet) return [];
  var dernier = onglet.getLastRow();
  if (dernier < 2) return [];
  return onglet.getRange(2, 1, dernier - 1, ENTETES.Editions.length).getValues();
}

/**
 * Écrit le bloc de données du registre EN UNE SEULE opération (voir planifierBasculeEdition).
 * Les lignes en trop d'un état précédent sont effacées ensuite — ⭐ jamais avant, sans quoi une
 * interruption laisserait un registre vide.
 */
function ecrireLignesEditions(classeur, lignes) {
  var onglet = assurerOngletEditions(classeur);
  var largeur = ENTETES.Editions.length;
  var bloc = (lignes || []).map(function (l) {
    var ligne = [];
    for (var i = 0; i < largeur; i++) {
      var v = (l || [])[i];
      ligne.push(v === undefined || v === null ? '' : String(v));
    }
    return ligne;
  });
  if (bloc.length) {
    var plage = onglet.getRange(2, 1, bloc.length, largeur);
    plage.setNumberFormat('@');   // tout en texte, comme Config et Historique
    plage.setValues(bloc);
  }
  var dernier = onglet.getLastRow();
  var surplus = dernier - 1 - bloc.length;
  if (surplus > 0) { onglet.getRange(2 + bloc.length, 1, surplus, largeur).clearContent(); }
}

/**
 * ⭐ LA LECTURE — l'édition active, ou l'absence d'édition active, ⛔ SANS RIEN CRÉER.
 * C'est la fonction que tout le reste du logiciel doit appeler.
 * @return { etat, edition, actives, total } — voir analyserRegistreEditions.
 *   L'onglet manquant se lit comme un registre vide : `etat` = 'vide'.
 */
function editionActive(classeur) {
  return analyserRegistreEditions(lireLignesEditions(classeur));
}

/** Horodatage d'un mouvement du registre. ⭐ C'est un INSTANT (CLAUDE.md §8 sexies). */
function horodatageEdition(classeur) {
  return Utilities.formatDate(new Date(), classeur.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * OUVRE une édition s'il n'y en a aucune d'active. ⭐ IDEMPOTENT : rejouée, elle ne crée pas de
 * doublon et renvoie l'édition existante avec `cree: false`.
 * C'est le seul chemin d'ouverture « hors reset » : classeur neuf (setupSheet) et migration d'un
 * classeur déjà en service (migrerEditionsMaintenant) l'appellent tous les deux.
 * @return { ok, cree, edition } ou { error } si le registre est en anomalie.
 */
function ouvrirEditionSiAucune(classeur) {
  var lignes = lireLignesEditions(classeur);
  var plan = planifierOuvertureEdition(lignes, Utilities.getUuid(), horodatageEdition(classeur));
  if (plan.error) return { error: plan.error };
  if (!plan.cree) {
    assurerOngletEditions(classeur);       // l'onglet existe forcément si une édition est active
    return { ok: true, cree: false, edition: plan.edition };
  }
  ecrireLignesEditions(classeur, plan.lignes);
  return { ok: true, cree: true, edition: plan.edition };
}

/**
 * BASCULE : ferme l'édition qui s'achève et en ouvre une vide, EN UNE SEULE écriture.
 * ⛔ Appelée UNIQUEMENT à la toute fin d'une réinitialisation RÉUSSIE — jamais avant : si
 * l'effacement échoue en route, la bascule n'a tout simplement pas lieu et l'ancienne édition
 * reste active, avec son identifiant. ⭐ Il n'existe aucun état intermédiaire.
 * @return { ok, edition, fermee } ou { error }
 */
function basculerEditionApresReset(classeur) {
  var lignes = lireLignesEditions(classeur);
  var plan = planifierBasculeEdition(lignes, Utilities.getUuid(), horodatageEdition(classeur));
  if (plan.error) return { error: plan.error };
  ecrireLignesEditions(classeur, plan.lignes);
  return { ok: true, edition: plan.edition, fermee: plan.fermee };
}

/* ===================== RETOUR D'UNE FONCTION DE MAINTENANCE ===================== */
/**
 * ▶ LE POINT DE PASSAGE UNIQUE par lequel une fonction de maintenance rend son résultat — R-110.
 *
 * ⭐ Elle JOURNALISE, puis elle REND LA MAIN. ⛔ Elle n'affiche aucune boîte de dialogue, et
 * c'est tout l'objet de ce helper.
 *
 * ⚠️ CE QU'IL REMPLACE, ET POURQUOI. `setupSheet()`, `migrerEditionsMaintenant()` et
 * `_b22Journaliser()` — donc les TROIS fonctions de maintenance du projet — affichaient une
 * boîte de dialogue PUREMENT INFORMATIVE en fin de course. Or une alerte ATTEND un
 * clic : le 2026-09-01, `migrerClubsMaintenant()` a écrit son message de succès en 8 secondes,
 * puis est restée suspendue jusqu'à `Exceeded maximum execution time` — ⛔ alors que la
 * migration, le contrôle de cohérence et la marque étaient TOUS terminés. L'exploitant lit un
 * échec là où tout a réussi, et le geste naturel — relancer, ou réparer à la main — est
 * précisément le geste dangereux.
 *
 * ⛔ ET LE `try/catch` NE PROTÉGEAIT PAS : depuis l'éditeur, `getUi()` RÉUSSIT, et `alert()`
 * ne lève pas d'erreur — il attend. ⭐ Un `catch` n'attrape pas une attente.
 *
 * ⛔ ET CE HELPER NE VISE QUE L'INFORMATIF. `configurerCles()` garde ses boîtes de dialogue,
 * et c'est délibéré : elles demandent une VRAIE décision (la saisie des clés), leur réponse est
 * LUE, et elles sont lancées depuis le menu du classeur — là où quelqu'un regarde.
 *
 * ⭐ POURQUOI LE JOURNAL SUFFIT, et pourquoi aucun affichage ne le remplace ici. Ces fonctions
 * ne sont proposées par AUCUN menu du classeur (`onOpen` n'offre que `configurerCles`) : elles
 * se lancent depuis l'éditeur Apps Script, où le journal d'exécution est justement ce que
 * l'opérateur a sous les yeux. ⛔ Un affichage dans le classeur (« toast ») ne serait visible
 * que si le classeur est ouvert — c'est-à-dire dans le seul cas où l'alerte fonctionnait déjà,
 * et jamais dans celui qui a produit le défaut.
 *
 * ⚠️ Le message reste la VALEUR DE RETOUR, inchangée : les appelants ne changent pas.
 */
function retourMaintenance(message) {
  Logger.log(message);
  return message;
}

/**
 * ▶ MIGRATION — à lancer UNE FOIS, à la main, depuis l'éditeur Apps Script (comme `setupSheet`
 * ou `configurerCles`). Elle attribue un `edition_id` au tournoi DÉJÀ EN PLACE dans le classeur.
 *
 * ⭐ Elle ne touche RIEN d'autre que l'onglet Editions : aucune réinitialisation, aucune donnée
 * effacée, aucune équipe, aucune poule, aucun match, aucun club. ⛔ Aucune perte possible.
 * ⭐ Elle est IDEMPOTENTE : relancée, elle constate l'édition existante et ne crée pas de doublon.
 * ⚠️ Registre en anomalie (plusieurs actives) ⇒ elle REFUSE et le dit, sans rien modifier.
 */
function migrerEditionsMaintenant() {
  var classeur = SpreadsheetApp.openById(sheetId());
  assurerOngletEditions(classeur);
  var res = ouvrirEditionSiAucune(classeur);
  var message;
  if (res.error) {
    message = '⛔ Migration refusée — ' + res.error;
  } else if (res.cree) {
    message = '✅ Édition ouverte : ' + res.edition.edition_id + ' (créée le ' + res.edition.date_creation + ').';
  } else {
    message = 'ℹ️ Rien à faire : une édition est déjà active — ' + res.edition.edition_id +
      ' (ouverte le ' + res.edition.date_creation + ').';
  }
  return retourMaintenance(message);
}


/* ═══════════════════════════════════════════════════════════════════════════════
 * M1-B2 / B2-2 — `Clubs` + `Participations` : « un club connu n'est pas un club invité »
 *
 * ⭐ CE QUE CE BLOC SÉPARE, ET POURQUOI. Jusqu'ici, les 17 colonnes de `ClubsInvites`
 * répondaient à DEUX questions dans une seule ligne : « qui est ce club ? » (durable) et
 * « que fait-il CETTE fois ? » (propre à une édition). B2-0 a classé ces colonnes en deux
 * familles ; ⛔ il ne les a pas séparées dans la STRUCTURE (R-102). C'est l'objet d'ici.
 *
 *   `Clubs`          : le CARNET. Une ligne = une identité durable, un `club_id` qui ne
 *                      change jamais et n'est jamais réutilisé.
 *   `Participations` : l'ENGAGEMENT. Une ligne = (une édition, un club). Un club peut donc
 *                      participer à plusieurs éditions — ce qu'une ligne unique interdisait
 *                      structurellement (D-050).
 *
 * ⭐ CE QUE LA SÉPARATION REND IMPOSSIBLE, et c'est le vrai gain : R-099 et R-100 étaient des
 * colonnes d'engagement OUBLIÉES par la liste que le reset vidait à la main. Ici, une donnée
 * d'engagement ne peut plus « survivre à un reset » : elle appartient à une édition, et cette
 * édition n'est plus l'active. ⛔ Il n'y a plus de liste à tenir — donc plus rien à oublier.
 *
 * ⚠️ CE QUE CE BLOC NE FAIT PAS : il ne supprime PAS `ClubsInvites` (arbitrage du 2026-08-27) —
 * l'ancien onglet reste intact tant que la nouvelle structure n'a pas fait ses preuves sur le
 * classeur réel. Il n'introduit AUCUN sélecteur d'édition : Maxilou reste mono-édition active.
 * ═══════════════════════════════════════════════════════════════════════════════ */

/* Les 4 SNAPSHOTS d'une participation — l'identité du club AU MOMENT DE L'INVITATION.
 * ⭐ Ils existent pour une seule raison : renommer un club dans le carnet ne doit pas réécrire
 * l'histoire. Le dossier d'une édition passée doit continuer de dire à qui l'invitation a été
 * envoyée, avec le nom et le contact d'alors. */
var PARTICIPATION_COLONNES_SNAPSHOT = ['snap_club_nom', 'snap_contact_nom',
  'snap_contact_prenom', 'snap_contact_email'];

/* La correspondance snapshot → colonne du carnet dont il fige la valeur. */
var PARTICIPATION_SNAPSHOT_SOURCE = {
  snap_club_nom: 'club_nom', snap_contact_nom: 'club_contact_nom',
  snap_contact_prenom: 'club_contact_prenom', snap_contact_email: 'club_contact_email'
};

/* ─────────────────────────────────────────────────────────────────────────────
 * ⭐ LE PRÉDICAT — « cette ligne legacy prouve-t-elle un ENGAGEMENT RÉEL ? »
 *
 * ⚠️ C'est la décision la plus délicate de la migration, et elle ne se devine pas : elle se
 * déduit de QUI ÉCRIT CHAQUE COLONNE. Deux colonnes d'engagement sont posées à la simple
 * CRÉATION DE LA FICHE, avant tout envoi, et ne prouvent donc RIEN :
 *
 *   • `club_token` — `ajouterClubInvite` en pose un dès l'ajout au carnet, et
 *     `assurerTokensClubs` en pose un à tout club qui n'en a pas, À CHAQUE OUVERTURE DE
 *     L'ADMINISTRATION. ⛔ Un jeton peut donc naître d'une simple LECTURE d'écran ;
 *   • `statut = 'Invité'` — c'est la valeur PAR DÉFAUT d'`ajouterClubInvite`. Un club
 *     seulement inscrit au carnet, jamais contacté, porte déjà « Invité ».
 *
 * 🎯 Retenir ces deux-là comme preuves fabriquerait une participation pour tout club du carnet
 * — exactement l'inverse de D-050. Le carnet redeviendrait un registre d'invitation.
 *
 * ⭐ Les DIX autres colonnes, elles, ne s'écrivent QUE par un geste réel de l'édition :
 *   `invitation_envoyee` / `dossier_envoye` — posées au SUCCÈS de l'envoi, jamais à l'échec ;
 *   `statut` ∈ {Accepté, Décliné}         — réponse du club, ou décision explicite de l'admin ;
 *   `date_reponse`, `nb_equipes_par_categorie`, `nb_joueurs_total`, `nb_educateurs_total`,
 *   `detail_effectifs`                    — écrites par `repondreInvitation` seule ;
 *   `categories_engagees`, `selection_enregistree` — sélection enregistrée par l'admin ;
 *   `alerte_ecart`                        — conséquence d'une synchronisation d'équipes.
 *
 * ⚠️ LE CAS AMBIGU, tranché et documenté : `statut = 'Invité'` SANS `invitation_envoyee`.
 * L'admin a pu le choisir à la main dans le menu déroulant — mais c'est aussi, et bien plus
 * souvent, le défaut de création. ⛔ On ne tranche donc PAS en faveur de la participation :
 * on ne fabrique jamais un engagement dont on n'a pas la preuve. Si un envoi a réellement eu
 * lieu, `invitation_envoyee` le dit. ⭐ Et rien n'est perdu : `ClubsInvites` reste intact.
 * ───────────────────────────────────────────────────────────────────────────── */

/* Vrai si la cellule ne porte aucune valeur exploitable (vide, nulle, espaces seuls).
 * ⚠️ `0` et `false` ne sont PAS « vides » — un `nb_joueurs_total` à 0 est une valeur saisie. */
function valeurLegacyAbsente(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return String(v).trim() === '';
}

/**
 * ⭐ CŒUR PUR (aucun classeur) — les PREUVES d'engagement portées par une ligne legacy.
 * Renvoie la liste des noms de colonnes qui établissent qu'une participation a réellement
 * existé. ⛔ Liste vide ⇒ le club n'est QUE connu au carnet.
 * @param {Object} ligne  une ligne de `ClubsInvites` telle que `lireOngletSimple` la rend
 * @return {Array<string>} les colonnes probantes, dans l'ordre de la décision
 */
function preuvesParticipationLegacy(ligne) {
  var l = ligne || {};
  var preuves = [];

  // ① Un envoi RÉUSSI — la preuve la plus forte : ces dates ne sont posées qu'au succès.
  if (!valeurLegacyAbsente(l.invitation_envoyee)) preuves.push('invitation_envoyee');
  if (!valeurLegacyAbsente(l.dossier_envoye)) preuves.push('dossier_envoye');

  // ② Une RÉPONSE du club — `Accepté` / `Décliné` ne peuvent pas être un défaut de création.
  //    ⛔ `Invité` est délibérément exclu : c'est la valeur par défaut d'`ajouterClubInvite`.
  var statut = statutClubCanonique(l.statut);
  if (statut === 'Accepté' || statut === 'Décliné') preuves.push('statut');
  if (!valeurLegacyAbsente(l.date_reponse)) preuves.push('date_reponse');

  // ③ Un ENGAGEMENT chiffré ou catégorisé — écrit par la réponse du club, ou par l'admin.
  if (!valeurLegacyAbsente(l.categories_engagees)) preuves.push('categories_engagees');
  if (!valeurLegacyAbsente(l.nb_equipes_par_categorie)) preuves.push('nb_equipes_par_categorie');
  if (!valeurLegacyAbsente(l.nb_joueurs_total)) preuves.push('nb_joueurs_total');
  if (!valeurLegacyAbsente(l.nb_educateurs_total)) preuves.push('nb_educateurs_total');
  if (!valeurLegacyAbsente(l.detail_effectifs)) preuves.push('detail_effectifs');
  if (!valeurLegacyAbsente(l.selection_enregistree)) preuves.push('selection_enregistree');

  // ④ Une ALERTE d'écart — elle n'existe qu'à la suite d'une synchronisation d'équipes,
  //    c'est-à-dire d'un engagement déjà enregistré.
  if (!valeurLegacyAbsente(l.alerte_ecart)) preuves.push('alerte_ecart');

  // ⛔ `club_token` n'apparaît NULLE PART ci-dessus, et c'est le cœur de la règle.
  return preuves;
}

/**
 * ⭐ LA DÉCISION, en un booléen : cette ligne legacy doit-elle produire une `Participation` ?
 * ⛔ Prudente par construction : en l'absence de preuve, elle répond NON — un club de plus au
 * carnet ne coûte rien ; une participation fabriquée réintroduirait R-100.
 */
function participationLegacyReelle(ligne) {
  return preuvesParticipationLegacy(ligne).length > 0;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * LES DEUX ONGLETS — création à la demande et migration douce des colonnes.
 * Même patron qu'`assurerOngletClubsInvites` : un classeur en service n'a pas ces onglets,
 * ils apparaissent au premier accès et les colonnes futures s'ajoutent À DROITE.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Crée l'onglet s'il manque, puis garantit ses colonnes. Rendu générique : les deux
 *  nouveaux onglets suivent exactement la même règle, et une seule fonction la porte. */
function assurerOngletModele(classeur, nom, entetes) {
  var onglet = classeur.getSheetByName(nom);
  if (!onglet) {
    creerOngletAvecEntetes(classeur, nom, entetes);
    return classeur.getSheetByName(nom);
  }
  var largeur = Math.max(onglet.getLastColumn(), 1);
  var presentes = onglet.getRange(1, 1, 1, largeur).getValues()[0];
  var vues = {}, derniere = 0;
  for (var i = 0; i < presentes.length; i++) {
    if (presentes[i] !== '' && presentes[i] !== null) { vues[presentes[i]] = true; derniere = i + 1; }
  }
  var manquants = entetes.filter(function (h) { return !vues[h]; });
  if (manquants.length) {
    var zone = onglet.getRange(1, derniere + 1, 1, manquants.length);
    zone.setNumberFormat('@');
    zone.setValues([manquants]);
    stylerEntete(zone);
    onglet.setFrozenRows(1);
  }
  return onglet;
}

function assurerOngletClubs(classeur) {
  return assurerOngletModele(classeur, 'Clubs', ENTETES.Clubs);
}

function assurerOngletParticipations(classeur) {
  return assurerOngletModele(classeur, 'Participations', ENTETES.Participations);
}

/**
 * ⭐ LE GARDE-FOU DE R-105, REPORTÉ SUR LA NOUVELLE STRUCTURE — et c'est bien un report, pas
 * une copie : `colonnesClubsNonClassees` protégeait `ClubsInvites`, dont le reset vidait des
 * colonnes. Ici le reset ne vide plus rien ; le danger a changé de forme.
 *
 * ⚠️ LE NOUVEAU DANGER : une colonne d'ENGAGEMENT ajoutée par erreur à `Clubs`. Elle
 * survivrait à toutes les éditions — exactement R-099, mais d'un cran plus haut, et cette
 * fois AUCUN reset ne pourrait la rattraper, puisque le carnet est fait pour durer.
 * @return {Array<string>} les colonnes de `Clubs` qui décrivent un engagement. ⭐ Vide = sain.
 */
function colonnesCarnetMalPlacees(entetesClubs) {
  var engagement = {};
  CLUBS_COLONNES_ENGAGEMENT.forEach(function (h) { engagement[h] = true; });
  return (entetesClubs || []).filter(function (h) {
    return engagement[String(h == null ? '' : h).trim()] === true;
  });
}

/**
 * ⭐ L'AUTRE MOITIÉ DU GARDE-FOU : toute colonne de `Participations` doit avoir un rôle connu —
 * clé de rattachement, engagement, ou snapshot. Une colonne inconnue des trois est une décision
 * qui n'a pas été prise ; elle est SIGNALÉE, ⛔ jamais devinée (même doctrine que B2-0 / T8).
 * @return {Array<string>} les colonnes sans rôle. ⭐ Vide = sain.
 */
function colonnesParticipationNonClassees(entetesParticipations) {
  var connues = {};
  ['edition_id', 'club_id'].forEach(function (h) { connues[h] = true; });
  CLUBS_COLONNES_ENGAGEMENT.forEach(function (h) { connues[h] = true; });
  PARTICIPATION_COLONNES_SNAPSHOT.forEach(function (h) { connues[h] = true; });
  return (entetesParticipations || []).filter(function (h) {
    var nom = String(h == null ? '' : h).trim();
    return nom !== '' && connues[nom] !== true;
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
 * LECTURES — elles ne créent RIEN. Même règle que `editionActive` (B2-1) : un onglet absent
 * se lit comme une liste vide, ⛔ jamais comme une invitation à le peupler.
 * ───────────────────────────────────────────────────────────────────────────── */

/** Le carnet, tel quel. Un onglet absent ⇒ []. ⛔ Ne crée pas l'onglet. */
function lireClubs(classeur) { return lireOngletSimple(classeur, 'Clubs'); }

/** Toutes les participations, toutes éditions confondues. Un onglet absent ⇒ []. */
function lireParticipations(classeur) { return lireOngletSimple(classeur, 'Participations'); }

/** Vrai si le club est actif au carnet. ⭐ Colonne absente ou vide ⇒ ACTIF : un carnet d'avant
 *  la suppression logique ne doit pas voir tous ses clubs disparaître d'un coup. */
function clubEstActif(club) {
  // ⚠️ `club` absent ⇒ FAUX, et sans lever d'erreur. (Une mutation de B2-2 — « supprimer
  //   physiquement l'identité au lieu de la désactiver » — a fait passer `null` ici et l'a
  //   révélé : la condition d'origine lisait `club.actif` même quand `club` valait `null`.)
  if (!club) return false;
  var v = (club.actif === undefined || club.actif === null) ? '' : String(club.actif).trim();
  return v === '' || memeTexteSouple(v, 'oui');
}

/** ⭐ PUR — le club du carnet portant ce nom (comparaison souple, comme partout ailleurs). */
function trouverClubParNom(clubs, nom) {
  var cible = String(nom || '').trim();
  if (!cible) return null;
  for (var i = 0; i < (clubs || []).length; i++) {
    if (memeTexteSouple(clubs[i].club_nom, cible)) return clubs[i];
  }
  return null;
}

/** ⭐ PUR — la participation d'un club à UNE édition précise, ou null. */
function trouverParticipation(participations, editionId, clubId) {
  var e = String(editionId || '').trim(), c = String(clubId || '').trim();
  if (!e || !c) return null;
  for (var i = 0; i < (participations || []).length; i++) {
    if (String(participations[i].edition_id || '').trim() === e &&
        String(participations[i].club_id || '').trim() === c) return participations[i];
  }
  return null;
}

/** Ajoute des lignes en bas d'un onglet, en respectant l'ordre RÉEL de ses en-têtes.
 *  @param {Array<Object>} objets  une entrée par ligne, clés = noms de colonnes */
function ajouterLignesModele(onglet, objets) {
  if (!objets || !objets.length) return 0;
  var entetes = onglet.getRange(1, 1, 1, Math.max(onglet.getLastColumn(), 1)).getValues()[0];
  var lignes = objets.map(function (o) {
    return entetes.map(function (h) { return (o[h] === undefined || o[h] === null) ? '' : o[h]; });
  });
  var plage = onglet.getRange(onglet.getLastRow() + 1, 1, lignes.length, entetes.length);
  plage.setNumberFormat('@');
  plage.setValues(lignes);
  return lignes.length;
}


/* ─────────────────────────────────────────────────────────────────────────────
 * ⭐ LA MIGRATION — et son idempotence, qui ne repose sur AUCUN drapeau.
 *
 * ⚠️ CE QU'ON NE PEUT PAS FAIRE, et pourquoi : « l'onglet existe et porte au moins une ligne
 * de l'édition active » serait un critère FAUX. **Zéro participation active est un état
 * parfaitement valide** — c'est exactement celui du classeur réel après le reset du
 * 2026-08-27 : trois clubs au carnet, aucune participation. Un tel critère conclurait
 * « pas encore migré » sur un classeur déjà migré, et rejouerait tout.
 *
 * ⭐ CE QU'ON FAIT À LA PLACE : la migration ne se DEMANDE pas si elle a déjà eu lieu, elle
 * CALCULE l'écart entre ce qui devrait exister et ce qui existe, puis n'écrit que la
 * différence. Rejouée, l'écart est nul, donc elle n'écrit rien. C'est une CONVERGENCE, pas
 * une bascule — et c'est ce qui rend une interruption inoffensive : une seconde exécution
 * termine simplement le travail, sans jamais dupliquer ce qui est déjà là.
 *
 * ⛔ ELLE N'EFFACE RIEN. `ClubsInvites` reste intact, ligne pour ligne, cellule pour cellule
 * (arbitrage du 2026-08-27). Tant que la nouvelle structure n'a pas fait ses preuves sur le
 * classeur réel, l'ancienne reste lisible — et une donnée qu'on n'a pas su reprendre reste
 * consultable là où elle a toujours été.
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * ⭐ CŒUR PUR (aucun classeur) — le PLAN de migration : que faut-il créer, et rien de plus ?
 *
 * @param {Array<Object>} legacy         les lignes de `ClubsInvites`
 * @param {Array<Object>} clubs          le carnet DÉJÀ présent (vide à la première exécution)
 * @param {Array<Object>} participations les participations DÉJÀ présentes
 * @param {string}        editionId      l'édition ACTIVE — celle à laquelle rattacher
 * @param {function():string} faireUuid  fabrique d'identifiants (injectée : le plan reste pur)
 * @return {Object} { error } ou
 *   { clubsACreer, participationsACreer, clubsReutilises, participationsExistantes,
 *     sansParticipation, ignores }
 *   ⭐ `sansParticipation` liste les clubs migrés SANS engagement : ce n'est pas un incident,
 *      c'est le résultat normal pour un carnet après reset — et il doit être DIT.
 */
function planifierMigrationClubs(legacy, clubs, participations, editionId, faireUuid) {
  var edition = String(editionId || '').trim();
  if (!edition) {
    return { error: 'Aucune édition active : lance d\'abord `migrerEditionsMaintenant()` ' +
      '(M1-B2 / B2-1). ⛔ Sans édition, une participation n\'aurait à quoi se rattacher.' };
  }

  var carnet = (clubs || []).slice();          // copie de travail : le plan ne modifie rien
  var dejaLa = (participations || []).slice();
  var plan = { clubsACreer: [], participationsACreer: [], clubsReutilises: 0,
    participationsExistantes: 0, sansParticipation: [], ignores: [] };

  (legacy || []).forEach(function (ligne) {
    var nom = String((ligne && ligne.club_nom) || '').trim();
    if (!nom) { plan.ignores.push('(ligne sans nom de club)'); return; }

    // ① L'IDENTITÉ — réutilisée si elle existe déjà, ⛔ jamais recréée. C'est ce qui rend le
    //    `club_id` STABLE d'une exécution à l'autre, et ce qui interdit les doublons.
    var club = trouverClubParNom(carnet, nom);
    if (club) {
      plan.clubsReutilises++;
    } else {
      club = {
        club_id: faireUuid(), club_nom: nom,
        club_contact_nom: String((ligne.club_contact_nom == null) ? '' : ligne.club_contact_nom).trim(),
        club_contact_prenom: String((ligne.club_contact_prenom == null) ? '' : ligne.club_contact_prenom).trim(),
        club_contact_email: String((ligne.club_contact_email == null) ? '' : ligne.club_contact_email).trim(),
        date_ajout: String((ligne.date_ajout == null) ? '' : ligne.date_ajout).trim(),
        actif: 'oui'
      };
      carnet.push(club);                       // visible pour les lignes suivantes : anti-doublon
      plan.clubsACreer.push(club);
    }

    // ② L'ENGAGEMENT — ⛔ SEULEMENT s'il est PROUVÉ. C'est tout l'objet du prédicat : un club
    //    seulement connu du carnet ne reçoit AUCUNE participation, et c'est le cas normal
    //    d'un classeur réinitialisé.
    if (!participationLegacyReelle(ligne)) { plan.sansParticipation.push(nom); return; }

    if (trouverParticipation(dejaLa, edition, club.club_id)) {
      plan.participationsExistantes++;         // déjà migrée : ⛔ on ne la réécrit pas
      return;
    }

    var participation = { edition_id: edition, club_id: club.club_id };
    CLUBS_COLONNES_ENGAGEMENT.forEach(function (h) {
      participation[h] = (ligne[h] === undefined || ligne[h] === null) ? '' : ligne[h];
    });
    // 📸 SNAPSHOTS — ⭐ ET ILS NE SE REMPLISSENT PAS TOUJOURS. Deux cas, à ne pas confondre :
    //
    //  A · L'INVITATION PRINCIPALE A EU LIEU — `invitation_envoyee` porte une date. Elle n'est
    //      posée qu'au SUCCÈS d'un envoi, jamais autrement : c'est la seule preuve d'un envoi
    //      principal que le classeur conserve. ⚠️ Les valeurs EXACTES alors utilisées, elles,
    //      ne sont plus reconstructibles — on fige donc la MEILLEURE APPROXIMATION DISPONIBLE,
    //      l'identité au moment de la migration. ⛔ Ce n'est PAS une preuve de l'adresse
    //      historiquement employée, et ce commentaire est là pour qu'on ne l'oublie jamais ;
    //
    //  B · LA PARTICIPATION EST PROUVÉE AUTREMENT — une réponse du club, des effectifs, une
    //      sélection enregistrée. ⭐ La participation existe bel et bien, ⛔ mais rien ne dit
    //      qu'une invitation principale soit partie de l'application. On ne FABRIQUE donc pas
    //      un historique d'invitation : les snapshots restent VIDES, et se figeront au premier
    //      envoi principal réellement réussi — exactement comme pour une participation neuve.
    //
    // ⚠️ `dossier_envoye` est délibérément écarté comme preuve : il atteste l'envoi du DOSSIER
    //    (phase 2), pas de l'invitation principale (phase 1) — un club a pu être invité de vive
    //    voix. ⛔ Déduire l'un de l'autre serait affirmer plus que la donnée ne permet.
    var invitationPrincipaleProuvee = !valeurLegacyAbsente(ligne.invitation_envoyee);
    PARTICIPATION_COLONNES_SNAPSHOT.forEach(function (snap) {
      if (!invitationPrincipaleProuvee) { participation[snap] = ''; return; }
      var v = ligne[PARTICIPATION_SNAPSHOT_SOURCE[snap]];
      participation[snap] = (v === undefined || v === null) ? '' : String(v).trim();
    });
    dejaLa.push(participation);                // anti-doublon si deux lignes legacy homonymes
    plan.participationsACreer.push(participation);
  });

  return plan;
}


/**
 * ⭐ CŒUR PUR — LE CONTRÔLE DE COHÉRENCE COMPLÈTE, celui qui autorise (ou non) à poser la marque.
 *
 * ⚠️ « Les deux onglets existent » ne prouve RIEN, et l'arbitrage l'exige explicitement : la
 * preuve de succès doit être forte. On vérifie donc, ligne à ligne, que le résultat EST celui
 * qu'on attendait — ⛔ pas qu'un traitement a tourné.
 *
 * @return {Array<string>} les écarts constatés. ⭐ Liste vide = migration RÉELLEMENT terminée.
 */
function ecartsMigrationClubs(legacy, clubs, participations, editionId) {
  var ecarts = [];
  var edition = String(editionId || '').trim();
  if (!edition) { ecarts.push('aucune édition active'); return ecarts; }

  // ① Chaque identité legacy attendue existe EXACTEMENT une fois au carnet.
  var vusCarnet = {};
  (clubs || []).forEach(function (c) {
    var cle = normaliserTexteSouple(c.club_nom);
    if (!cle) { ecarts.push('une ligne de `Clubs` n\'a pas de nom'); return; }
    if (vusCarnet[cle]) ecarts.push('« ' + c.club_nom +' » apparaît DEUX FOIS au carnet');
    vusCarnet[cle] = c;
    if (!String(c.club_id || '').trim()) ecarts.push('« ' + c.club_nom + ' » n\'a pas de `club_id`');
  });
  var vusId = {};
  (clubs || []).forEach(function (c) {
    var id = String(c.club_id || '').trim();
    if (!id) return;
    if (vusId[id]) ecarts.push('le `club_id` ' + id + ' est porté par DEUX clubs');
    vusId[id] = true;
  });

  // ② Chaque ligne legacy a son identité, et — si et seulement si elle le PROUVE — sa participation.
  (legacy || []).forEach(function (ligne) {
    var nom = String((ligne && ligne.club_nom) || '').trim();
    if (!nom) return;                               // ligne sans nom : ignorée des deux côtés
    var club = vusCarnet[normaliserTexteSouple(nom)];
    if (!club) { ecarts.push('« ' + nom + ' » est absent du carnet'); return; }
    var p = trouverParticipation(participations, edition, club.club_id);
    if (participationLegacyReelle(ligne)) {
      if (!p) ecarts.push('« ' + nom + ' » prouve un engagement mais n\'a AUCUNE participation');
    } else if (p) {
      ecarts.push('« ' + nom + ' » a une participation qu\'aucune donnée legacy ne justifie');
    }
  });

  // ③ ⛔ Aucun doublon (edition_id, club_id) — l'invariant structurel de `Participations`.
  var vusP = {};
  (participations || []).forEach(function (p) {
    var cle = String(p.edition_id || '').trim() + '|' + String(p.club_id || '').trim();
    if (vusP[cle]) ecarts.push('participation en DOUBLE : ' + cle);
    vusP[cle] = true;
    if (!vusId[String(p.club_id || '').trim()]) {
      ecarts.push('une participation renvoie à un `club_id` inconnu du carnet : ' + p.club_id);
    }
  });

  // ④ ⛔ Aucune colonne mal placée — le garde-fou de R-105, appliqué au résultat réel.
  var malPlacees = colonnesCarnetMalPlacees(Object.keys((clubs || [])[0] || {}));
  if (malPlacees.length) ecarts.push('colonnes d\'engagement dans le carnet : ' + malPlacees.join(', '));
  var orphelines = colonnesParticipationNonClassees(Object.keys((participations || [])[0] || {}));
  if (orphelines.length) ecarts.push('colonnes sans rôle dans `Participations` : ' + orphelines.join(', '));
  return ecarts;
}

/**
 * ⭐ CŒUR PUR — un état PARTIEL est-il REPRENABLE, ou faut-il refuser ?
 *
 * ⚠️ Une migration interrompue laisse un carnet incomplet : c'est normal, et cela se reprend.
 * ⛔ Mais si le carnet contient une identité que le legacy ne peut pas expliquer, on ne sait
 * plus d'où elle vient — et deviner reviendrait à INVENTER une identité. On refuse alors, en
 * disant précisément quoi regarder.
 * @return {Array<string>} les raisons de refuser. ⭐ Vide = la reprise est sûre.
 */
function obstaclesRepriseMigrationClubs(legacy, clubs) {
  var obstacles = [];
  var connusLegacy = {};
  (legacy || []).forEach(function (l) {
    var cle = normaliserTexteSouple((l && l.club_nom) || '');
    if (cle) connusLegacy[cle] = true;
  });
  var vus = {};
  (clubs || []).forEach(function (c) {
    var cle = normaliserTexteSouple(c.club_nom);
    if (!cle) { obstacles.push('une ligne de `Clubs` est sans nom'); return; }
    if (vus[cle]) obstacles.push('« ' + c.club_nom + ' » apparaît deux fois dans `Clubs`');
    vus[cle] = true;
    if (!String(c.club_id || '').trim()) obstacles.push('« ' + c.club_nom + ' » est sans `club_id`');
    if (!connusLegacy[cle]) {
      obstacles.push('« ' + c.club_nom + ' » est dans `Clubs` sans exister dans `ClubsInvites` — ' +
        'impossible de savoir si la migration l\'a créé ou si quelqu\'un l\'a ajouté à la main');
    }
  });
  return obstacles;
}

/**
 * ▶ MIGRATION — à lancer À LA MAIN depuis l'éditeur Apps Script, comme `setupSheet`,
 * `configurerCles` ou `migrerEditionsMaintenant`.
 *
 * ⭐ Ce qu'elle fait : lit `ClubsInvites`, crée les identités manquantes dans `Clubs`, et les
 * participations manquantes dans `Participations` — pour les seules lignes qui PROUVENT un
 * engagement. ⛔ Ce qu'elle ne fait PAS : effacer quoi que ce soit, toucher à `ClubsInvites`,
 * réinitialiser, ni ouvrir une édition (elle REFUSE s'il n'y en a pas).
 * ⭐ Rejouée : 0 création, 0 doublon, 0 réécriture. Interrompue : reprise sans perte.
 */
function migrerClubsMaintenant() {
  return executerMigrationClubs(SpreadsheetApp.openById(sheetId()), true);
}

/**
 * ⭐ LE CORPS DE LA MIGRATION, séparé de son enveloppe pour être exécutable SANS Google (donc
 * éprouvable de bout en bout, cas d'interruption compris).
 * @param {boolean} validerFin  ⛔ false pour SIMULER une interruption juste avant la marque.
 */
function executerMigrationClubs(classeur, validerFin) {
  var deja = etatMigrationClubs(classeur);
  if (deja.etat === 'terminee') {
    // ⭐ LE POINT QUI FERME LE DÉFAUT DU RENOMMAGE : une fois la marque posée, `ClubsInvites`
    //   n'est PLUS une source d'identités. On ne rapproche plus rien par le nom — donc un club
    //   renommé dans `Clubs` ne peut pas renaître sous son ancien nom, resté dans l'ancien onglet.
    return _b22Journaliser('ℹ️ Rien à faire : la migration est déjà TERMINÉE (marquée le ' +
      deja.marque + '). ⛔ `ClubsInvites` n\'est plus une source d\'identités : un club renommé ' +
      'depuis ne sera JAMAIS recréé sous son ancien nom.');
  }

  var registre = editionActive(classeur);
  if (registre.etat === 'plusieurs_actives') {
    return _b22Journaliser('⛔ Migration refusée — ' + erreurPlusieursEditionsActives(registre));
  }
  if (registre.etat !== 'ok') {
    return _b22Journaliser('⛔ Migration refusée — aucune édition active. Lance d\'abord ' +
      '`migrerEditionsMaintenant()` (M1-B2 / B2-1).');
  }
  var editionId = registre.edition.edition_id;
  var legacy = lireOngletSimple(classeur, 'ClubsInvites');

  // ⚠️ REPRISE D'UN ÉTAT PARTIEL : on refuse plutôt que d'inventer une identité (arbitrage,
  //   cas D). Un carnet qui contient un club inconnu de `ClubsInvites` est un carnet dont on ne
  //   sait pas d'où il vient — et deviner serait pire que s'arrêter.
  if (deja.etat === 'partielle') {
    var obstacles = obstaclesRepriseMigrationClubs(legacy, lireClubs(classeur));
    if (obstacles.length) {
      return _b22Journaliser('⛔ Migration REFUSÉE — un état partiel a été trouvé, et il ne peut ' +
        'pas être repris sans risque :\n\n· ' + obstacles.join('\n· ') +
        '\n\n⭐ Rien n\'a été modifié. Corrige à la main, puis relance.');
    }
  }

  assurerOngletClubs(classeur);
  assurerOngletParticipations(classeur);
  var plan = planifierMigrationClubs(legacy, lireClubs(classeur), lireParticipations(classeur),
    editionId, function () { return Utilities.getUuid(); });
  if (plan.error) return _b22Journaliser('⛔ Migration refusée — ' + plan.error);

  var nbClubs = ajouterLignesModele(assurerOngletClubs(classeur), plan.clubsACreer);
  var nbPart = ajouterLignesModele(assurerOngletParticipations(classeur), plan.participationsACreer);

  // ⭐ LE CONTRÔLE DE COHÉRENCE COMPLÈTE — ⛔ et c'est LUI qui autorise la marque, jamais le
  //   simple fait qu'un traitement se soit déroulé sans erreur.
  var ecarts = ecartsMigrationClubs(legacy, lireClubs(classeur), lireParticipations(classeur), editionId);
  if (ecarts.length) {
    return _b22Journaliser('⚠️ Migration INCOMPLÈTE — ' + nbClubs + ' club(s) et ' + nbPart +
      ' participation(s) écrits, ⛔ mais la vérification finale a trouvé des écarts :\n\n· ' +
      ecarts.join('\n· ') + '\n\n⛔ La migration N\'EST PAS marquée terminée : le logiciel ' +
      'continue de travailler sur `ClubsInvites`. Corrige, puis relance.');
  }
  if (!validerFin) {
    return '⏸️ (simulation) migration écrite, ⛔ marque NON posée — état partiel reprenable.';
  }

  var horodatage = horodatageEdition(classeur);
  ecrireParamGlobal(classeur.getSheetByName('Config'), CLE_MIGRATION_CLUBS, horodatage);

  var message = '✅ Migration TERMINÉE et vérifiée — marquée le ' + horodatage + '.\n\n' +
    nbClubs + ' club(s) au carnet, ' + nbPart + ' participation(s) rattachée(s) à l\'édition ' +
    editionId + '.';
  if (plan.sansParticipation.length) {
    message += '\n\nℹ️ ' + plan.sansParticipation.length + ' club(s) au carnet SANS participation ' +
      'à cette édition — c\'est normal après une réinitialisation : ' +
      plan.sansParticipation.join(', ') + '.';
  }
  message += '\n\n⭐ `ClubsInvites` n\'a PAS été modifié : aucune donnée n\'a été déplacée, ' +
    'seulement recopiée. ⛔ Il n\'est simplement plus consulté.';
  return _b22Journaliser(message);
}


/* ─────────────────────────────────────────────────────────────────────────────
 * ⭐ LA COUCHE D'ADAPTATION — « le frontend ne doit rien voir changer » (D-050).
 *
 * L'administration manipule aujourd'hui une LISTE PLATE : un objet par club, portant à la
 * fois son identité et son engagement. Toutes les cartes, les badges, les liserés, les tris,
 * les statuts et les actions en dépendent — six fichiers du navigateur, et ⛔ B2-2 s'interdit
 * de les réécrire. Cette fonction reconstruit donc EXACTEMENT cet objet, à partir des deux
 * onglets. C'est le seul endroit du serveur qui sait que la structure a changé.
 *
 * ⭐ CE QUI EN DÉCOULE, ET QUI EST LE VRAI GAIN : un club connu SANS participation à l'édition
 * active reçoit des champs d'engagement VIDES — pas « hérités », pas « anciens ». Une
 * participation d'une édition fermée ne peut pas contaminer cet objet : elle n'est jamais lue.
 * C'est le comportement d'après-reset, obtenu ici par construction et non par un effacement.
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * ⭐ PUR — la liste plate attendue par l'administration, reconstruite depuis le nouveau modèle.
 * @param {Array<Object>} clubs          le carnet
 * @param {Array<Object>} participations toutes les participations, toutes éditions
 * @param {string}        editionId      l'édition ACTIVE — ⛔ la seule qui soit lue
 * @return {Array<Object>} un objet par club ACTIF, aux 17 clés de l'ancien `ClubsInvites`
 */
function clubsPlats(clubs, participations, editionId) {
  var edition = String(editionId || '').trim();
  return (clubs || []).filter(clubEstActif).map(function (club) {
    var plat = {};
    // ① L'identité, depuis le carnet — c'est elle qui est à jour, pas le snapshot.
    CLUBS_COLONNES_CONTACT.forEach(function (h) {
      plat[h] = (club[h] === undefined || club[h] === null) ? '' : club[h];
    });
    // ② L'engagement, depuis la participation de l'ÉDITION ACTIVE — et d'elle seule.
    //    ⛔ Aucune participation : tous ces champs restent VIDES. C'est un club connu, pas
    //    un club invité (D-050) : son statut vide signifie « sans participation cette fois ».
    var p = edition ? trouverParticipation(participations, edition, club.club_id) : null;
    CLUBS_COLONNES_ENGAGEMENT.forEach(function (h) {
      var v = p ? p[h] : '';
      plat[h] = (v === undefined || v === null) ? '' : v;
    });
    return plat;
  });
}


/* ═══════════════════════════════════════════════════════════════════════════════
 * ⭐ LES TROIS ÉTATS D'UN CLASSEUR, ET LA RÈGLE QUI LES SÉPARE — « un modèle actif à la
 * fois, jamais un mélange » (arbitrage de Romain, 2026-08-27).
 *
 * ⚠️ POURQUOI « LES ONGLETS EXISTENT » NE PEUT PAS ÊTRE LE CRITÈRE, et c'est le cœur du
 * problème : une migration interrompue laisse `Clubs` à moitié rempli. Si le métier basculait
 * sur ce seul constat, la fonction suivante travaillerait sur un carnet INCOMPLET — des clubs
 * disparaîtraient de l'écran, et une écriture les recréerait en double. ⛔ Un état partiel ne
 * doit JAMAIS ressembler à un succès.
 *
 *   ① NON COMMENCÉE — pas de marque, carnet vide.        → le modèle LEGACY fait foi
 *   ② PARTIELLE     — pas de marque, carnet non vide.    → le modèle LEGACY fait foi ENCORE
 *                     ⭐ La reprise est possible ; le métier, lui, ne bascule pas.
 *   ③ TERMINÉE      — la MARQUE est posée.               → le modèle B2-2 fait foi
 *
 * ⭐ ET LA MARQUE RÈGLE UN SECOND PROBLÈME, plus discret : une fois posée, `ClubsInvites`
 * n'est PLUS une source d'identités. Sans elle, renommer un club dans `Clubs` puis relancer la
 * migration ferait renaître un second club sous son ancien nom — l'ancien onglet portant
 * toujours le nom d'avant. ⛔ Le rapprochement par le nom n'a lieu qu'AVANT la marque.
 * ═══════════════════════════════════════════════════════════════════════════════ */

/* La MARQUE de fin de migration. ⭐ Elle vit dans `Config`, donc DANS LE CLASSEUR : elle suit
 * ses sauvegardes et ses restaurations. ⛔ Surtout pas dans les propriétés du script, qui ne
 * sont PAS sauvegardées avec le fichier — restaurer une copie d'avant migration laisserait une
 * marque orpheline affirmant que tout est migré. Sa valeur est l'horodatage de la validation. */
var CLE_MIGRATION_CLUBS = 'migration_clubs_b22';

/**
 * ⭐ LE MODÈLE QUI FAIT FOI, et c'est la SEULE question que le métier a le droit de poser.
 * ⛔ Ne regarde ni les onglets, ni leur contenu : uniquement la marque de fin de migration.
 * @return {boolean} vrai si le classeur travaille sur `Clubs` + `Participations`
 */
function modeleClubsEnPlace(classeur) {
  var g = lireConfig(classeur).global || {};
  return String(g[CLE_MIGRATION_CLUBS] || '').trim() !== '';
}

/**
 * ⭐ L'ÉTAT DE LA MIGRATION, pour la migration elle-même — ⛔ jamais pour le métier.
 * @return {Object} { etat: 'non_commencee' | 'partielle' | 'terminee', marque }
 */
function etatMigrationClubs(classeur) {
  var g = lireConfig(classeur).global || {};
  var marque = String(g[CLE_MIGRATION_CLUBS] || '').trim();
  if (marque) return { etat: 'terminee', marque: marque };
  return { etat: lireClubs(classeur).length ? 'partielle' : 'non_commencee', marque: '' };
}

/* ─────────────────────────────────────────────────────────────────────────────
 * ⭐ LE CONTEXTE D'ÉCRITURE — le SEUL endroit du serveur qui sache qu'il existe deux modèles.
 *
 * ⭐ L'astuce qui évite de dédoubler les douze fonctions d'écriture : sur l'ancien modèle,
 * l'identité et l'engagement partagent la MÊME ligne du MÊME onglet. `ClubsInvites` est donc
 * simplement le cas dégénéré où `ongletIdentite === ongletEngagement`. Les appelants écrivent
 * « l'identité » ou « l'engagement » sans jamais savoir où cela atterrit.
 * ───────────────────────────────────────────────────────────────────────────── */

/**
 * @return {Object} { modele, club, ongletIdentite, ligneIdentite, ongletEngagement,
 *                    ligneEngagement, editionId }
 *   `club` est null si le nom est inconnu ; `ligneEngagement` vaut -1 si le club n'est pas
 *   engagé dans l'édition active. ⛔ Rien n'est créé ici, jamais.
 */
function contexteEcritureClub(classeur, nom) {
  if (!modeleClubsEnPlace(classeur)) {
    var oLegacy = assurerOngletClubsInvites(classeur);
    var ligneL = ligneClubInvite(oLegacy, nom);
    var clubL = null;
    if (ligneL !== -1) {
      lireOngletSimple(classeur, 'ClubsInvites').forEach(function (c) {
        if (!clubL && memeTexteSouple(c.club_nom, nom)) clubL = c;
      });
    }
    return { modele: 'legacy', club: clubL, ongletIdentite: oLegacy, ligneIdentite: ligneL,
      ongletEngagement: oLegacy, ligneEngagement: ligneL, editionId: '' };
  }
  var ctx = contexteClub(classeur, nom);
  return { modele: 'b22', club: ctx.club,
    ongletIdentite: assurerOngletClubs(classeur), ligneIdentite: ctx.ligneCarnet,
    ongletEngagement: assurerOngletParticipations(classeur),
    ligneEngagement: ctx.ligneParticipation, editionId: ctx.editionId };
}

/** Écrit des champs d'IDENTITÉ (nom, contact). ⛔ Ne touche jamais aux snapshots. */
function ecrireIdentiteClub(classeur, nom, valeurs) {
  var ctx = contexteEcritureClub(classeur, nom);
  if (!ctx.club || ctx.ligneIdentite === -1) return { error: 'Club introuvable : ' + String(nom || '') };
  ecrireCellulesModele(ctx.ongletIdentite, ctx.ligneIdentite, valeurs);
  return { ok: true, contexte: ctx };
}

/** Écrit des champs d'ENGAGEMENT, en créant la participation si le geste le justifie.
 *  @param {boolean} creerSiAbsente  ⛔ false pour tout helper passif */
function ecrireEngagementClub(classeur, nom, valeurs, creerSiAbsente) {
  var ctx = contexteEcritureClub(classeur, nom);
  if (!ctx.club) return { error: 'Club introuvable : ' + String(nom || '') };
  if (ctx.ligneEngagement === -1) {
    if (!creerSiAbsente) {
      return { error: 'Le club « ' + String(ctx.club.club_nom) + ' » n\'est pas engagé dans ' +
        'l\'édition en cours.' };
    }
    var cree = assurerParticipation(classeur, ctx.club);
    if (cree.error) return cree;
    ctx = contexteEcritureClub(classeur, nom);
  }
  ecrireCellulesModele(ctx.ongletEngagement, ctx.ligneEngagement, valeurs);
  return { ok: true, contexte: ctx };
}

/**
 * ⭐ LE POINT DE PASSAGE UNIQUE de toute lecture de clubs par l'application.
 *
 * ⚠️ Pourquoi un repli, alors que ce projet s'en méfie : il y a un moment, et un seul, où le
 * serveur neuf tourne sur un classeur pas encore migré — entre le redéploiement et le
 * lancement de `migrerClubsMaintenant()`. Sans repli, l'administration afficherait ZÉRO club
 * pendant cet intervalle. ⭐ Ce repli n'est PAS une devinette : son critère est observable
 * (le carnet est vide ou non), il est déterministe, et il disparaît de lui-même à la migration.
 */
function clubsEditionActive(classeur) {
  if (!modeleClubsEnPlace(classeur)) {
    return lireOngletSimple(classeur, 'ClubsInvites');   // ⛔ classeur pas encore migré
  }
  var registre = editionActive(classeur);
  var edition = (registre.etat === 'ok') ? registre.edition.edition_id : '';
  return clubsPlats(lireClubs(classeur), lireParticipations(classeur), edition);
}


/* ─────────────────────────────────────────────────────────────────────────────
 * ⭐ LES ÉCRITURES — un seul chemin, jamais deux.
 *
 * ⚠️ POURQUOI LA MIGRATION SE DÉCLENCHE À L'ÉCRITURE, ET JAMAIS À LA LECTURE. Entre le
 * redéploiement du serveur et le lancement de `migrerClubsMaintenant()`, le classeur porte
 * encore l'ancienne structure. Faire cohabiter DEUX chemins d'écriture dans douze fonctions
 * doublerait la complexité de chacune — et ce projet a déjà payé le prix des doubles vérités.
 *
 * ⭐ Alors on n'en garde qu'un : la première écriture qui arrive sur un classeur non migré le
 * fait converger d'abord, puis écrit sur le modèle neuf. C'est le patron « migration douce »
 * du dépôt (`assurerColonnesClubsInvites`), appliqué à une structure au lieu d'une colonne.
 *
 * ⛔ ET UNE LECTURE NE MIGRE JAMAIS : une simple ouverture de l'administration ne doit créer
 * aucune participation. Le déclencheur est une INTENTION — ajouter, inviter, répondre — pas
 * un écran qu'on regarde.
 * ───────────────────────────────────────────────────────────────────────────── */

/* ⛔ M1-B2 / B2-2 — IL N'EXISTE AUCUNE FONCTION « ASSURER LE MODÈLE », ET C'EST VOULU.
 *
 * Une première version en avait une : appelée par chaque écriture, elle faisait converger un
 * classeur non migré « en passant ». ⚠️ Romain l'a écartée le 2026-08-27, et l'argument est
 * solide : une écriture métier ordinaire — ajouter un club, enregistrer une réponse — n'a
 * aucune raison de décider, seule et sans qu'on le lui demande, de changer la STRUCTURE du
 * classeur. Si elle échouait à mi-chemin, le classeur se retrouverait dans un état que
 * personne n'a demandé, au milieu d'un geste sans rapport.
 *
 * ⭐ La bascule structurelle est donc réservée à `migrerClubsMaintenant()` : un geste explicite,
 * lancé à la main, qui vérifie sa propre cohérence avant de se déclarer terminé.
 */


/** Ligne (1-based) d'une valeur dans une colonne donnée d'un onglet, ou -1. */
function ligneParColonne(onglet, nomColonne, valeur, souple) {
  var donnees = onglet.getDataRange().getValues();
  if (!donnees.length) return -1;
  var col = donnees[0].indexOf(nomColonne);
  if (col === -1) return -1;
  var cible = String(valeur == null ? '' : valeur).trim();
  if (!cible) return -1;
  for (var i = 1; i < donnees.length; i++) {
    var v = donnees[i][col];
    if (souple ? memeTexteSouple(v, cible) : String(v == null ? '' : v).trim() === cible) return i + 1;
  }
  return -1;
}

/** Écrit plusieurs cellules d'une ligne, PAR NOM DE COLONNE (robuste à l'ordre réel). */
function ecrireCellulesModele(onglet, ligne, valeurs) {
  var entetes = onglet.getRange(1, 1, 1, Math.max(onglet.getLastColumn(), 1)).getValues()[0];
  Object.keys(valeurs).forEach(function (h) {
    var col = entetes.indexOf(h);
    if (col === -1) return;
    var cellule = onglet.getRange(ligne, col + 1);
    cellule.setNumberFormat('@');
    cellule.setValue(valeurs[h]);
  });
}

/**
 * ⭐ LE CONTEXTE D'UN CLUB — tout ce qu'une écriture doit savoir, en une lecture.
 * @return {Object} { club, ligneCarnet, participation, ligneParticipation, editionId }
 *   `club` est null si le nom est inconnu du carnet ; `participation` est null si le club
 *   n'est pas engagé dans l'édition active. ⛔ Rien n'est créé ici.
 */
function contexteClub(classeur, nom) {
  var registre = editionActive(classeur);
  var editionId = (registre.etat === 'ok') ? registre.edition.edition_id : '';
  var club = trouverClubParNom(lireClubs(classeur), nom);
  var ctx = { club: club, ligneCarnet: -1, participation: null, ligneParticipation: -1,
    editionId: editionId };
  if (!club) return ctx;
  ctx.ligneCarnet = ligneParColonne(assurerOngletClubs(classeur), 'club_id', club.club_id, false);
  if (!editionId) return ctx;
  var participations = lireParticipations(classeur);
  ctx.participation = trouverParticipation(participations, editionId, club.club_id);
  if (ctx.participation) {
    var onglet = assurerOngletParticipations(classeur);
    var donnees = onglet.getDataRange().getValues();
    var cE = donnees[0].indexOf('edition_id'), cC = donnees[0].indexOf('club_id');
    for (var i = 1; i < donnees.length; i++) {
      if (String(donnees[i][cE] || '').trim() === editionId &&
          String(donnees[i][cC] || '').trim() === club.club_id) { ctx.ligneParticipation = i + 1; break; }
    }
  }
  return ctx;
}

/**
 * ⭐ CRÉE la participation d'un club à l'édition active — ⛔ SEULEMENT sur un geste EXPLICITE
 * (inviter, enregistrer une sélection, changer un statut à la main). Idempotente : si elle
 * existe déjà, elle est simplement renvoyée.
 *
 * ⚠️ Le jeton est posé ICI, à la création, et NULLE PART AILLEURS de façon passive : c'est ce
 * qui interdit à une ouverture d'écran de fabriquer une participation (arbitrage du
 * 2026-08-27). ⛔ Le statut, lui, reste VIDE : « Invité » ne se pose qu'après un envoi réussi.
 * @return {Object} { ok, participation, cree } ou { error }
 */
function assurerParticipation(classeur, club) {
  var registre = editionActive(classeur);
  if (registre.etat === 'plusieurs_actives') return { error: erreurPlusieursEditionsActives(registre) };
  if (registre.etat !== 'ok') {
    return { error: 'Aucune édition active : impossible de rattacher une participation. ' +
      'Lance `migrerEditionsMaintenant()` (M1-B2 / B2-1).' };
  }
  var editionId = registre.edition.edition_id;
  var existante = trouverParticipation(lireParticipations(classeur), editionId, club.club_id);
  if (existante) return { ok: true, participation: existante, cree: false };

  var participation = { edition_id: editionId, club_id: club.club_id, club_token: genererTokenClub() };
  CLUBS_COLONNES_ENGAGEMENT.forEach(function (h) {
    if (participation[h] === undefined) participation[h] = '';
  });
  // 📸 ⛔ LES SNAPSHOTS RESTENT VIDES ICI, ET C'EST TOUT LEUR SENS.
  //   ⚠️ Une première version les figeait à la création de la participation. C'était FAUX, et
  //   la nuance n'est pas cosmétique : une participation peut exister AVANT tout envoi (on
  //   prépare une invitation, on l'envoie le lendemain). Des snapshots posés là prétendraient
  //   représenter « l'identité au moment de l'invitation » d'une invitation QUI N'A PAS EU LIEU
  //   — et si les coordonnées changeaient entre-temps, ils mentiraient sur ce qui a été envoyé.
  //   ⭐ Ils sont figés au PREMIER ENVOI PRINCIPAL RÉUSSI, avec les valeurs réellement utilisées
  //   (voir `figerSnapshotsInvitation`). ⛔ Vides = « aucune invitation principale à ce jour ».
  PARTICIPATION_COLONNES_SNAPSHOT.forEach(function (snap) { participation[snap] = ''; });
  ajouterLignesModele(assurerOngletParticipations(classeur), [participation]);
  return { ok: true, participation: participation, cree: true };
}

/**
 * 📸 FIGE LES SNAPSHOTS D'INVITATION — ⛔ appelée UNIQUEMENT au SUCCÈS d'un envoi principal.
 *
 * ⭐ « Premier » se lit ici littéralement : si les quatre champs portent déjà quelque chose,
 * ⛔ on ne réécrit RIEN. Un renvoi, une relance, un envoi groupé qui repasse sur le club :
 * aucun ne doit récrire l'histoire. Et un changement de coordonnées APRÈS le premier envoi
 * n'a, par construction, plus aucun moyen de les atteindre.
 *
 * @param {Object} identite  les valeurs RÉELLEMENT utilisées pour cet envoi — ⛔ pas celles du
 *                           carnet relues après coup : ce sont deux choses différentes dès que
 *                           quelqu'un modifie une fiche pendant qu'un envoi groupé tourne.
 */
function figerSnapshotsInvitation(classeur, nom, identite) {
  var ctx = contexteEcritureClub(classeur, nom);
  if (ctx.modele !== 'b22' || ctx.ligneEngagement === -1) return { ok: true, fige: false };
  var participation = trouverParticipation(lireParticipations(classeur), ctx.editionId,
    ctx.club.club_id);
  if (!participation) return { ok: true, fige: false };
  var dejaFiges = PARTICIPATION_COLONNES_SNAPSHOT.some(function (snap) {
    return String(participation[snap] || '').trim() !== '';
  });
  if (dejaFiges) return { ok: true, fige: false };   // ⛔ l'histoire ne se réécrit pas

  var valeurs = {};
  PARTICIPATION_COLONNES_SNAPSHOT.forEach(function (snap) {
    var v = identite ? identite[PARTICIPATION_SNAPSHOT_SOURCE[snap]] : '';
    valeurs[snap] = (v === undefined || v === null) ? '' : String(v).trim();
  });
  ecrireCellulesModele(ctx.ongletEngagement, ctx.ligneEngagement, valeurs);
  return { ok: true, fige: true };
}

/** Journalise et rend la main — ⛔ aucune boîte de dialogue (R-110), voir `retourMaintenance`. */
function _b22Journaliser(message) {
  return retourMaintenance(message);
}

/* ===================== RÉINITIALISATION DU TOURNOI ===================== */
/**
 * Réinitialise le tournoi pour repartir d'une base vierge (bouton « zone de danger »
 * de l'admin). Action IRRÉVERSIBLE. Concrètement :
 *   • vide les onglets Equipes, Poules et Matchs (planning + scores du tournoi en cours) ;
 *   • supprime TOUTES les catégories de l'onglet Config ;
 *   • efface les infos publiques du tournoi (nom, date, lieu, adresse, description), les
 *     contacts & sécurité (référent, poste de secours) et met l'affiche Drive à la corbeille ;
 *   • repasse le tournoi en « masqué » (tournoi_publie = 'non') ;
 *   • FERME l'édition qui s'achève et en OUVRE une vide (onglet Editions, M1-B2 / B2-1).
 * On CONSERVE les réglages « Horaires de la journée » (heure début/fin, pauses…) et le
 * journal de saison (onglet Historique), qui accumule les résultats de toute la saison.
 *
 * ⭐ ORDRE IMPÉRATIF, et ce n'est pas un détail de rédaction : le registre des éditions est
 * CONTRÔLÉ en tout premier (étape 0, avant la moindre écriture) et BASCULÉ en tout dernier
 * (étape 5, une fois tout le reste réussi). Entre les deux, aucune demi-bascule n'est possible.
 */
function reinitialiserTournoi(classeur) {
  // 0) M1-B2 / B2-1 — CONTRÔLE PRÉALABLE DU REGISTRE DES ÉDITIONS, ⛔ AVANT LA MOINDRE ÉCRITURE.
  //   Réinitialiser, c'est fermer une édition et en ouvrir une autre. Si le registre est
  //   incohérent (plusieurs lignes « active »), on ne saurait pas laquelle fermer — et ⛔ en
  //   choisir une au hasard serait pire que de ne rien faire. On REFUSE ici, pendant que le
  //   tournoi est encore intact : rien n'est effacé, l'organisateur corrige, puis relance.
  //   ⭐ Un registre VIDE, lui, n'est pas une anomalie : c'est le classeur qui n'a pas encore
  //   été migré, et la bascule de l'étape 5 se contentera d'ouvrir une édition.
  var registreAvant = editionActive(classeur);
  if (registreAvant.etat === 'plusieurs_actives') {
    return { error: erreurPlusieursEditionsActives(registreAvant) };
  }

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
  //           ⚠️ Seules les COORDONNÉES survivent : leur engagement dans l'édition qui s'achève,
  //           statut compris, est vidé — voir l'étape 3 quinquies et reinitialiserPhase2Clubs.
  //           ✅ Même choix pour l'onglet Sponsors et les réglages d'affichage des partenaires :
  //           un partenariat se reconduit d'une édition à l'autre, le réinitialiser obligerait
  //           à re-téléverser tous les logos. Pour retirer un partenaire, on décoche « actif ».
  var idParking = (lireConfig(classeur).global || {}).parking_photo_id;
  if (idParking) { try { DriveApp.getFileById(idParking).setTrashed(true); } catch (e) {} }
  CHAMPS_INVITATION.concat(['parking_photo_id'])
    .forEach(function (champ) { effacerParamGlobal(ongletConfig, champ); });

  // 3 quinquies) Phase 1 : « Sur place » + « Réponse à l'invitation » (contact référent) sont
  //   propres à l'édition → effacés. email_expediteur (alias Gmail, config d'infrastructure) est
  //   CONSERVÉ, comme les clés. Côté clubs invités (B2-0) : on vide TOUT l'ENGAGEMENT — statut,
  //   jeton, dates, catégories engagées, effectifs, alertes — et on ne garde que le CONTACT
  //   (nom, contacts, prénom, date d'ajout). Voir reinitialiserPhase2Clubs.
  // ⭐ `perfs_mot_cle_club` est DÉLIBÉRÉMENT CONSERVÉ, comme les clés et `email_expediteur` :
  //   il décrit le CLUB ORGANISATEUR, pas l'édition. Le club ne change pas d'un tournoi à
  //   l'autre, et l'effacer obligerait à le ressaisir chaque année — avec, entre-temps, une page
  //   Perfs muette dont personne ne comprendrait la cause. ⛔ Ce n'est pas un oubli.
  // ⚠️ On efface AUSSI les anciens noms des paramètres renommés (ALIAS_CONFIG_LEGACY) : sur un
  // classeur qui n'a pas encore été réenregistré, la ligne canonique n'existe pas, et effacer
  // elle seule ne ferait RIEN — la valeur de l'ancienne ligne serait reprise à la lecture et le
  // réglage réapparaîtrait à l'édition suivante, sans que personne ne l'ait coché.
  CHAMPS_SURPLACE.concat(['date_limite_reponse', 'contact_reponse_nom', 'contact_reponse_tel', 'contact_reponse_email'])
    .forEach(function (champ) {
      effacerParamGlobal(ongletConfig, champ);
      var ancienne = ALIAS_CONFIG_LEGACY[champ];
      if (ancienne) effacerParamGlobal(ongletConfig, ancienne);
    });
  reinitialiserPhase2Clubs(classeur);

  // 3 sexies) DEMANDE D'AUTORISATION : les données propres à l'ÉDITION qui vient de se terminer
  //   (médecin, secours, arbitrage, installations utilisées, hébergement, repas, goûters,
  //   récompenses…) sont effacées — décision D-043. ⛔ Les 10 champs PERMANENTS du club (nom, code,
  //   label, président, représentant) sont CONSERVÉS : ils décrivent le club, pas le tournoi.
  //   Avant ce lot, les 36 `org_*` survivaient TOUS : un tournoi neuf rouvrait la demande
  //   d'autorisation déjà remplie avec les valeurs de l'édition passée, marquées « saisi », et le
  //   compteur annonçait 0 champ manquant — le dossier pouvait partir à la Ligue avec un médecin
  //   absent et un prix périmé, sans aucun signalement.
  reinitialiserDonneesAutorisationTournoi(classeur);

  // 3 septies) B2-0 — `tournoi_id` de l'édition qui s'achève : EFFACÉ.
  //   🔬 Il ne figurait dans aucune liste d'effacement : l'identifiant de l'édition passée
  //   survivait jusqu'à la génération de planning suivante (R-106). Entre-temps, tout résultat
  //   archivé serait allé rejoindre, dans l'onglet Historique, les lignes du tournoi PRÉCÉDENT.
  //   ⭐ L'effacer ne casse rien : `assurerTournoiId` en recrée un à la demande, et les lignes
  //   déjà écrites dans Historique gardent la valeur qu'elles portent — on n'y touche pas.
  //   ⛔ Ce lot ne corrige QUE l'héritage : `tournoi_id` est toujours reposé à CHAQUE génération
  //   de planning, et il le reste — c'est son rôle, il identifie une GÉNÉRATION.
  //   ⭐ L'identité DURABLE de l'édition, elle, ne vit plus ici : c'est `edition_id`, dans
  //   l'onglet Editions (B2-1). Voir la bascule à l'étape 5 ci-dessous.
  effacerParamGlobal(ongletConfig, 'tournoi_id');

  // 4) Le tournoi redevient masqué pour le public.
  ecrireParamGlobal(ongletConfig, 'tournoi_publie', 'non');

  // 5) M1-B2 / B2-1 — LA BASCULE D'ÉDITION, et elle est VOLONTAIREMENT LA DERNIÈRE.
  //   L'édition qui s'achève est FERMÉE et une édition vide est ouverte, en UNE SEULE écriture
  //   dans l'onglet Editions.
  //   ⭐ Pourquoi ici, et nulle part ailleurs : si l'un des effacements ci-dessus échoue, une
  //   exception remonte et cette ligne n'est JAMAIS atteinte — l'ancienne édition reste
  //   `active`, avec son identifiant, et aucune édition parasite n'a été créée. ⛔ Il n'existe
  //   aucun état intermédiaire où l'ancienne serait fermée sans que la nouvelle existe.
  //   ⚠️ Le refus (registre en anomalie) a déjà été traité à l'étape 0, avant tout effacement :
  //   `basculerEditionApresReset` ne peut donc échouer ici que si le registre a bougé pendant
  //   l'opération — on le signale sans prétendre que le reset n'a pas eu lieu, car il a eu lieu.
  var bascule = basculerEditionApresReset(classeur);

  return {
    ok: true,
    nb_equipes: nbEquipes,
    nb_poules: nbPoules,
    nb_matchs: nbMatchs,
    nb_categories: nbCategories,
    edition_id: bascule.edition ? bascule.edition.edition_id : '',
    edition_fermee: (bascule.fermee && bascule.fermee.edition_id) ? bascule.fermee.edition_id : '',
    avertissement_edition: bascule.error || ''
  };
}

/**
 * M1-B (D-043) — Vide les données de la demande d'autorisation qui appartiennent à l'ÉDITION
 * terminée : les 26 champs de CHAMPS_AUTORISATION_A_REINITIALISER, plus toutes les récompenses
 * `org_recompenses_<CAT>` réellement présentes (y compris celles d'une catégorie disparue).
 *
 * La DÉCISION (quelles clés) est prise par `clesAutorisationAEffacer`, pure et testable sans
 * classeur ; cette fonction-ci n'en est que l'EFFET. Elle est séparée de `reinitialiserTournoi`
 * pour être exerçable seule dans les tests.
 *
 * ⛔ Comme partout ailleurs dans la réinitialisation, on VIDE la valeur sans supprimer la ligne
 * (`effacerParamGlobal`) : une ligne vide est comptée « manquant » et le champ du PDF fédéral reste
 * éditable. Une clé absente n'est pas créée.
 * @return {number} le nombre de clés soumises à effacement (26 + récompenses trouvées)
 */
function reinitialiserDonneesAutorisationTournoi(classeur) {
  var onglet = classeur.getSheetByName('Config');
  if (!onglet) return 0;
  var cles = clesAutorisationAEffacer(Object.keys(lireConfig(classeur).global || {}));
  cles.forEach(function (champ) { effacerParamGlobal(onglet, champ); });
  return cles.length;
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

/**
 * Analyse les effectifs des catégories PRÉSENTES (comptage sur l'onglet Equipes, colonne
 * `categorie`). Distingue deux cas, selon la règle FFR (minimum 3 équipes, matchs secs interdits) :
 *   - `vides`  : catégorie présente avec 0 équipe → simple AVERTISSEMENT, la génération continue.
 *   - `bloque` : catégorie présente avec 1 ou 2 équipes → BLOCAGE dur ([{categorie, nb}]).
 * Aucune donnée externe requise (indépendant du référentiel RefFFR).
 */
function analyserEffectifsCategories(config, equipes) {
  var comptes = {};
  (equipes || []).forEach(function (e) {
    var cat = String(e.categorie == null ? '' : e.categorie).trim();
    if (cat) comptes[cat] = (comptes[cat] || 0) + 1;
  });
  var bloque = [], vides = [];
  (config.categories || []).forEach(function (c) {
    if (String(c.presente).toLowerCase() !== 'oui') return;
    var cat = String(c.categorie == null ? '' : c.categorie).trim();
    if (!cat) return;
    var n = comptes[cat] || 0;
    if (n === 0) vides.push(cat);
    else if (n < 3) bloque.push({ categorie: cat, nb: n });
  });
  // `comptes` (nb d'équipes par catégorie) exposé en plus de bloque/vides — ajout NON cassant :
  // les appelants existants n'utilisent que .bloque / .vides. Sert de clé à la grille de temps FFR.
  return { bloque: bloque, vides: vides, comptes: comptes };
}

/**
 * Catégories qui SERONT générées (présentes ET ≥ 3 équipes) mais dont la durée de mi-temps est vide
 * ou ≤ 0 — auquel cas les matchs feraient 0 min. Sert de garde-fou avant génération. Les catégories
 * à 0 équipe (ignorées) et à 1–2 équipes (déjà bloquées) sont écartées. Pur (aucun classeur lu).
 */
function categoriesSansDureeMiTemps(config, comptes) {
  comptes = comptes || {};
  var out = [];
  (config.categories || []).forEach(function (c) {
    if (String(c.presente).toLowerCase() !== 'oui') return;
    var cat = String(c.categorie == null ? '' : c.categorie).trim();
    if (!cat) return;
    if ((comptes[cat] || 0) < 3) return; // 0 équipe (ignorée) ou 1–2 (déjà bloquée par ailleurs)
    var duree = parseInt(String(c.duree_mi_temps_min == null ? '' : c.duree_mi_temps_min).trim(), 10);
    if (!isFinite(duree) || duree <= 0) out.push(cat);
  });
  return out;
}

function genererPoulesEtPlanning(classeur) {
  var config = lireConfig(classeur);
  var equipes = lireOngletSimple(classeur, 'Equipes');
  var global = config.global;

  // RÈGLE FFR — minimum 3 équipes par catégorie présente (note d'accompagnement du 03/06/2026 :
  // « à l'école de rugby les matchs secs ne sont pas autorisés, les seuls formats autorisés sont
  // les tournois avec minimum 3 équipes »). Contrôle INDÉPENDANT du référentiel RefFFR.
  //   - 1 ou 2 équipes  → BLOCAGE dur, AVANT toute écriture ;
  //   - 0 équipe        → simple avertissement (catégorie ignorée), la génération continue.
  var effectifs = analyserEffectifsCategories(config, equipes);
  if (effectifs.bloque.length) {
    var details = effectifs.bloque.map(function (m) { return m.categorie + ' (' + m.nb + ' équipe(s))'; }).join(', ');
    return { error: 'Génération impossible : il faut au minimum 3 équipes par catégorie ' +
      '(règle FFR École de Rugby — les matchs secs ne sont pas autorisés). ' +
      'Catégorie(s) concernée(s) : ' + details + '.' };
  }

  // DURÉE DE MI-TEMPS RENSEIGNÉE — une catégorie neuve est créée vierge (aucune valeur devinée).
  // Sans durée, les matchs feraient 0 min : on BLOQUE, AVANT toute écriture, les catégories qui
  // seront réellement générées (présentes ET ≥ 3 équipes ; les catégories vides sont déjà ignorées).
  // Remède : cliquer « Appliquer la norme FFR » sur la carte, ou saisir la durée à la main.
  var sansDuree = categoriesSansDureeMiTemps(config, effectifs.comptes);
  if (sansDuree.length) {
    return { error: 'Génération impossible : durée de mi-temps manquante pour ' +
      sansDuree.join(', ') + '. Sur la carte de la catégorie, clique « Appliquer la norme FFR » ' +
      'ou saisis la durée de mi-temps, puis relance la génération.' };
  }

  // Migration douce : garantit la colonne nb_poules (Sheet créé avant cette évolution).
  assurerColonneCategorie(classeur, 'nb_poules');

  var r = calculerPlanning(config, equipes, true);
  // Fin réelle du tournoi = fin du dernier match d'après-midi (projeté, structure connue).
  var finApremProj = projeterFinApresMidi(config, r.poules, r.matchsFinaux);
  var finJournee = Math.max(r.maxFin, finApremProj);
  var avert = r.avert.slice();
  // Catégories présentes sans aucune équipe : ignorées, mais on prévient l'organisateur.
  effectifs.vides.forEach(function (cat) {
    avert.push('Catégorie ' + cat + ' : présente mais sans équipe engagée — ignorée pour la génération.');
  });
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
  // Heure de fin de la pause déjeuner échelonnée de la DERNIÈRE équipe (vide si pause classique).
  var finPauseEch = (r.finReposEchelonne > 0) ? minVersHm(r.finReposEchelonne) : '';
  ecrireParamsGlobaux(classeur.getSheetByName('Config'), [
    ['tournoi_id', Utilities.formatDate(new Date(), classeur.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss')],
    ['signature_generation', signatureGeneration(global, config.categories, equipes)],
    ['signature_structure', signatureStructure(config.categories, equipes)],
    ['pause_echelonnee_fin', finPauseEch],
    // PRUDENT PAR CONSTRUCTION : un planning fraîchement généré n'est PAS montré aux clubs.
    // L'organisateur regarde d'abord l'équilibre des poules (une « équipe 1 » avec des équipes 2
    // fait un match sans intérêt), corrige, PUIS publie. Republier est un geste explicite.
    ['planning_visible_clubs', 'non']
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
    pause_echelonnee_fin: finPauseEch,
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

/* ===================== SUPER CHALLENGE DE FRANCE — génération (session 14) =====================
 * PR A : Phase 2 (1 journée, triangulaire/quadrangulaire, 2×15). Le contexte SCF d'une catégorie
 * U14 (voir contexteScfCategorie) change DEUX choses dans calculerPlanning : (1) le TEMPS de jeu,
 * imposé par le règlement (dureeMatchScf), et (2) le FIXTURE d'un groupe de 4 (quadrangulaire), qui
 * n'est pas un round-robin. Un groupe de 3 (triangulaire) est déjà exactement une poule de 3 : on
 * réutilise tourneeToutesRondes sans le dupliquer. Les catégories SCF n'ont PAS d'après-midi.
 * ============================================================================================== */

/** Durée d'un créneau de match Super Challenge : 2 périodes de 15 min (Phase 2) ou 11 min (Phase 3
 *  & clôture), plus la pause de mi-temps de la catégorie. Le règlement IMPOSE le temps de jeu ; on
 *  ne touche pas aux réglages format_mi_temps / duree_mi_temps de la catégorie. Pur. */
function dureeMatchScf(cat, phase) {
  var periode = (phase === 'P3') ? 11 : 15;               // P3 & clôture = 2×11 ; P2 (défaut) = 2×15
  var pause = parseInt(cat && cat.pause_mi_temps_min, 10) || 0;
  return 2 * periode + pause;
}

/**
 * Fixture d'une QUADRANGULAIRE Super Challenge (groupe de 4) : 4 rencontres où CHAQUE équipe joue
 * 2 matchs (≠ round-robin de 4, qui en ferait 6). Ordre du règlement (« l'équipe 1 reçoit ») :
 *   M1 : E2-E4 · M2 : E1-E3 · M3 : E1-E4 · M4 : E2-E3.
 * Réparti en 2 tournées (round 0 : M1+M2 ; round 1 : M3+M4) : chaque équipe joue une fois par
 * tournée (repos garanti entre ses deux matchs). `ids` = [E1,E2,E3,E4] dans l'ordre de la poule.
 * Renvoie null si l'effectif n'est pas exactement 4. Pur, testable.
 */
function fixtureQuadrangulaireScf(ids) {
  if (!ids || ids.length !== 4) return null;
  var e1 = ids[0], e2 = ids[1], e3 = ids[2], e4 = ids[3];
  // arbitre = l'équipe désignée par la table du règlement (M1→E1, M2→E2, M3→E3, M4→E4) : à chaque
  // match, l'une des deux équipes qui ne jouent pas arbitre (chaque équipe arbitre exactement une fois).
  return [
    { a: e2, b: e4, round: 0, arbitre: e1 },
    { a: e1, b: e3, round: 0, arbitre: e2 },
    { a: e1, b: e4, round: 1, arbitre: e3 },
    { a: e2, b: e3, round: 1, arbitre: e4 }
  ];
}

/**
 * Fixtures d'un groupe Super Challenge selon sa taille : 3 → triangulaire (round-robin de 3, via
 * tourneeToutesRondes), 4 → quadrangulaire (fixtureQuadrangulaireScf). Toute autre taille est un
 * cas non prévu par le règlement (SCF = triangulaire ou quadrangulaire) : on RETOMBE sur un
 * round-robin pour ne pas bloquer la génération, et on signale via `avertir` (fonction optionnelle).
 * Renvoie un tableau de { a, b, round }. Pur.
 */
function fixtureScfGroupe(ids, categorie, avertir) {
  if (ids && ids.length === 4) return fixtureQuadrangulaireScf(ids);
  if (ids && ids.length === 3) {
    // Triangulaire : à chaque match, la 3ᵉ équipe (celle qui ne joue pas) arbitre.
    return tourneeToutesRondes(ids).map(function (m) {
      var arb = ids.filter(function (x) { return x !== m.a && x !== m.b; })[0] || '';
      return { a: m.a, b: m.b, round: m.round, arbitre: arb };
    });
  }
  if (typeof avertir === 'function') {
    avertir('Catégorie ' + categorie + ' (Super Challenge) : groupe de ' + (ids ? ids.length : 0) +
            ' équipe(s) — le règlement prévoit 3 (triangulaire) ou 4 (quadrangulaire).');
  }
  return tourneeToutesRondes(ids || []);
}

/** Ligne de match COMPLÈTE (toutes les colonnes de ENTETES.Matchs, dans l'ordre), lue par NOM depuis
 *  l'objet — préserve les colonnes de score détaillé (essais/transfo…) qu'un match déjà saisi porte,
 *  contrairement à matchObjToRow qui s'arrête à `vainqueur`. Sert à réécrire des matchs SANS perte. */
function matchObjToRowComplet(m) {
  return ENTETES.Matchs.map(function (col) { return (m[col] == null) ? '' : m[col]; });
}

/**
 * SUPER CHALLENGE — PR B : brassage du DIMANCHE (Phase 3, 2ᵉ journée). Après les scores du samedi
 * (triangulaires = phase 'poule'), on forme les groupes de niveau — les 1ᵉʳˢ de chaque poule
 * ensemble, les 2ᵉˢ ensemble, les 3ᵉˢ ensemble (poules E/F/G du règlement) — chacun en round-robin.
 * C'est EXACTEMENT le « classement croisé » du moteur : on réutilise fixturesApresMidiCroise tel
 * quel (étiquetage par niveau N1/N2/N3, classement général + podium déjà gérés à l'affichage). Les
 * matchs sont planifiés au DÉBUT de la 2ᵉ journée (sans lien avec le samedi) en 2×11 (via le contexte
 * SCF de planifierApresMidi), écrits en phase 'classement'. Idempotent : régénérer recalcule à partir
 * des scores du samedi. Ne concerne QUE les catégories U14 en Super Challenge Phase 3.
 */
function genererDimancheScf(classeur) {
  assurerColonnesConfig(classeur);
  var config = lireConfig(classeur);
  var matchs = lireOngletSimple(classeur, 'Matchs');
  var avert = [], erreurs = [];

  var catsP3 = config.categories.filter(function (c) {
    if (String(c.presente).toLowerCase() !== 'oui') return false;
    var s = contexteScfCategorie(c);
    return s.estScf && s.phase === 'P3';
  });
  if (!catsP3.length) {
    return { ok: false, error: 'Aucune catégorie U14 en Super Challenge Phase 3 : le brassage du dimanche ne concerne que ce contexte.' };
  }
  var estP3 = {}; catsP3.forEach(function (c) { estP3[c.categorie] = true; });

  // Samedi = les triangulaires (phase 'poule') de ces catégories ; toutes doivent être terminées.
  var samedi = matchs.filter(function (m) { return estP3[m.categorie] && String(m.phase) !== 'classement'; });
  if (!samedi.length) {
    return { ok: false, error: 'Aucune triangulaire du samedi. Génère d\'abord les poules (bouton « Générer les poules »).' };
  }
  var nonTermines = samedi.filter(function (m) { return !estTermineServeur(m.statut); });
  if (nonTermines.length) {
    return { ok: false, error: nonTermines.length + ' match(s) du samedi ne sont pas terminés. ' +
      'Saisis tous les scores du samedi avant de générer le dimanche.' };
  }

  // Classement de chaque poule du samedi (calculerClassement ignore déjà la phase 'classement').
  var classement = calculerClassement(classeur);
  var classParCat = {}; classement.forEach(function (c) { classParCat[c.categorie] = c; });

  var fixturesParCat = {};
  catsP3.forEach(function (cat) {
    var res = fixturesApresMidiCroise(cat, classParCat[cat.categorie]);
    if (res.error) erreurs.push('Catégorie ' + cat.categorie + ' : ' + res.error);
    if (res.avert) res.avert.forEach(function (a) { avert.push('Catégorie ' + cat.categorie + ' : ' + a); });
    if (res.fixtures && res.fixtures.length) fixturesParCat[cat.categorie] = res.fixtures;
  });
  if (!Object.keys(fixturesParCat).length) {
    return { ok: false, error: erreurs.length ? erreurs.join('\n')
             : 'Aucun match de dimanche à générer (il faut au moins 2 poules le samedi pour un brassage).' };
  }

  // Planifie au DÉBUT de la 2ᵉ journée (matin=[] → aucun lien avec le samedi), temps 2×11 (SCF).
  var debutJour2 = hmVersMin(config.global.heure_debut || '09:00');
  var plan = planifierApresMidi(config, fixturesParCat, [], debutJour2);
  avert = avert.concat(plan.avert);

  // On CONSERVE tous les matchs sauf l'ancien dimanche (classement) de ces catégories (regénération),
  // en préservant les colonnes (score détaillé du samedi inclus), puis on ajoute le nouveau dimanche.
  var garder = matchs.filter(function (m) { return !(estP3[m.categorie] && String(m.phase) === 'classement'); });
  var maxNum = 0;
  garder.forEach(function (m) { var mm = String(m.id_match).match(/^M(\d+)$/); if (mm) { var n = parseInt(mm[1], 10); if (n > maxNum) maxNum = n; } });

  var lignesDimanche = plan.matchs.map(function (m, i) {
    return matchObjToRow({
      id_match: idMatch(maxNum + 1 + i), categorie: m.categorie, poule: m.poule, terrain: m.terrain,
      heure_debut: m.heure_debut, heure_fin: m.heure_fin, equipe_A: m.equipe_A, equipe_B: m.equipe_B,
      score_A: '', score_B: '', statut: 'à venir', phase: 'classement',
      format: m.format || 'CROISE', sous_tableau: '', tour: '', match_suivant: '', place_suivant: '', vainqueur: ''
    });
  });
  ecrireMatchs(classeur, garder.map(matchObjToRowComplet).concat(lignesDimanche));

  return { ok: true, nb_matchs_dimanche: plan.matchs.length,
           heure_fin_dimanche: plan.maxFin > 0 ? minVersHm(plan.maxFin) : '',
           avertissements: avert.concat(erreurs) };
}

/* ===================== PAUSE MÉRIDIENNE ÉCHELONNÉE (option par catégorie) =====================
 * Motivation : peu de terrains (ex. 2 pour l'U14) → une pause déjeuner UNIQUE laisse tous les
 * terrains à l'arrêt et la matinée ne « rentre » pas. Solution : la catégorie joue en UN round-robin
 * (tout le monde se rencontre une fois) planifié en DEUX VAGUES, avec un repos ≥ 60 min garanti à
 * chaque équipe et l'ÉQUITÉ (jamais une équipe reposée contre une équipe pas encore reposée).
 * Structure : matin = matchs inter-vagues (tous à égalité) ; pendant que la Vague 1 se repose, la
 * Vague 2 joue ses matchs internes, puis l'inverse ; après-midi = le reste des inter-vagues (tous
 * reposés). Les matchs inter-vagues ne tombent JAMAIS pendant une pause → équité par construction.
 * Éligible si effectif PAIR et ≥ 4 (sinon repli sur la pause classique + avertissement).
 * ============================================================================================== */

/** Vrai si la catégorie demande la pause méridienne échelonnée (colonne Config pause_echelonnee). */
function pauseEchelonneeDe(cat) {
  return String((cat && cat.pause_echelonnee) == null ? '' : cat.pause_echelonnee).trim().toLowerCase() === 'oui';
}

/** Toutes les paires (matchs) internes à un tableau d'identifiants. Pur. */
function pairesInternesEq(arr) {
  var o = [];
  for (var i = 0; i < arr.length; i++) for (var j = i + 1; j < arr.length; j++) o.push({ a: arr[i], b: arr[j] });
  return o;
}

/** Coupe les identifiants (dans l'ordre) en deux vagues : Vague 1 = première moitié (jouent/partent
 *  en pause en premier), Vague 2 = seconde moitié. Vagues INÉGALES d'au plus 1 si effectif impair. Pur. */
function vaguesRepos(ids) {
  var k = Math.ceil(ids.length / 2);
  return { v1: ids.slice(0, k), v2: ids.slice(k) };
}

/** Tournées bipartites V1×V2 (chaque équipe de V1 rencontre chaque équipe de V2 une fois), réparties
 *  en tournées où une équipe joue au plus une fois. Gère les vagues INÉGALES via un « bye » : on
 *  complète la plus courte par des cases vides, et une équipe se repose la tournée où elle tombe en
 *  face du vide. Chaque paire V1×V2 apparaît exactement une fois. Pur, testable. */
function tourneesBipartites(v1, v2) {
  var a = v1.slice(), b = v2.slice();
  while (a.length < b.length) a.push(null);
  while (b.length < a.length) b.push(null);
  var k = a.length, rounds = [];
  for (var r = 0; r < k; r++) {
    var rd = [];
    for (var i = 0; i < k; i++) {
      var x = a[i], y = b[(i + r) % k];
      if (x != null && y != null) rd.push({ a: x, b: y });
    }
    if (rd.length) rounds.push(rd);
  }
  return rounds;
}

/** Planifie un BLOC de matchs en glouton (à chaque étape, le match jouable le plus tôt), en
 *  respectant la disponibilité des équipes et des terrains. Mute terrainLibre/equipeLibre/equipeFin
 *  et ajoute les matchs datés à `sortie`. tMin = départ au plus tôt du bloc. Pur (état passé). */
function planifierBlocRepos(matchs, terrains, duree, battement, recup, terrainLibre, equipeLibre, equipeFin, tMin, sortie) {
  var restants = matchs.slice();
  function dispoEq(id) { return equipeLibre[id] == null ? tMin : Math.max(tMin, equipeLibre[id]); }
  while (restants.length) {
    var best = -1, bestDebut = Infinity, bestTerr = null;
    for (var i = 0; i < restants.length; i++) {
      var m = restants[i];
      var terr = terrains.reduce(function (x, t) { return (terrainLibre[t] || tMin) < (terrainLibre[x] || tMin) ? t : x; }, terrains[0]);
      var debut = Math.max(dispoEq(m.a), dispoEq(m.b), (terrainLibre[terr] || tMin));
      if (debut < bestDebut) { bestDebut = debut; best = i; bestTerr = terr; }
    }
    var mm = restants.splice(best, 1)[0];
    var fin = bestDebut + duree;
    terrainLibre[bestTerr] = fin + battement;
    equipeLibre[mm.a] = fin + recup; equipeLibre[mm.b] = fin + recup;
    equipeFin[mm.a] = fin; equipeFin[mm.b] = fin;
    sortie.push({ terrain: bestTerr, heure_debut_min: bestDebut, heure_fin_min: fin, equipe_A: mm.a, equipe_B: mm.b });
  }
}

/**
 * Planifie une catégorie en round-robin avec pause échelonnée (2 vagues). L'appelant garantit un
 * effectif PAIR et ≥ 4 (vagues égales). Renvoie { matchs:[{terrain, heure_debut_min, heure_fin_min,
 * equipe_A, equipe_B}], repos:{id:min}, maxFin, avert }. Le repos ≥ 60 min est forcé par
 * construction (on repousse la disponibilité d'une vague de `repos` min après ses matchs) ; s'il
 * reste sous le seuil (cas dégénéré), c'est signalé dans `avert`. Pur, testable.
 */
function planifierCategorieEchelonnee(ids, terrains, opts) {
  var duree = opts.duree, battement = opts.battement || 0, recup = opts.recup || 0;
  var repos = opts.repos || 60, t0 = opts.debut || 540;
  // dejDebut = « pause déjeuner à partir de » : heure au plus tôt à laquelle la 1re vague part en
  // pause. Sert d'ANCRE (la pause échelonnée démarre là) ; absent → juste après le matin (t0).
  var dejDebut = (opts.dejDebut != null) ? opts.dejDebut : null;
  var tLunch = (dejDebut != null) ? Math.max(dejDebut, t0) : t0;
  var avert = [];
  var p = vaguesRepos(ids), v1 = p.v1, v2 = p.v2;
  // Tournées bipartites (gèrent les vagues INÉGALES via un bye) : chaque équipe joue le matin.
  var rounds = tourneesBipartites(v1, v2);
  var mR = Math.max(1, Math.round(rounds.length / 2));
  var interMatin = [].concat.apply([], rounds.slice(0, mR));
  var interAprem = [].concat.apply([], rounds.slice(mR));
  var intra1 = pairesInternesEq(v1), intra2 = pairesInternesEq(v2);

  var terrainLibre = {}, equipeLibre = {}, equipeFin = {}, sortie = [];
  // 1) MATIN : matchs inter-vagues (tous à égalité de fatigue).
  planifierBlocRepos(interMatin, terrains, duree, battement, recup, terrainLibre, equipeLibre, equipeFin, t0, sortie);

  // La pause échelonnée démarre à tL = max(fin du matin, « à partir de »). Vague 1 se repose d'abord
  // pendant que la Vague 2 joue ses matchs internes, puis l'inverse. Repos ≥ repos GARANTI par
  // construction (on repousse la dispo d'une vague de `repos` min) ; chaque vague joue pendant la
  // pause de l'autre (terrains occupés + jamais reposé contre épuisé).
  var morningEnd = 0;
  sortie.forEach(function (x) { if (x.heure_fin_min > morningEnd) morningEnd = x.heure_fin_min; });
  var tL = Math.max(morningEnd, tLunch);

  // 2) Vague 1 en pause à partir de tL (≥ repos) ; la Vague 2 joue ses matchs internes.
  v1.forEach(function (id) { equipeLibre[id] = tL + repos; });
  planifierBlocRepos(intra2, terrains, duree, battement, recup, terrainLibre, equipeLibre, equipeFin, tL, sortie);
  // 3) Vague 2 en pause à son tour (≥ repos après ses derniers matchs) ; la Vague 1 joue les siens.
  v2.forEach(function (id) { if (equipeFin[id] != null) equipeLibre[id] = equipeFin[id] + repos; });
  planifierBlocRepos(intra1, terrains, duree, battement, recup, terrainLibre, equipeLibre, equipeFin, tL + repos, sortie);
  // 4) APRÈS-MIDI : le reste des inter-vagues, tout le monde ayant déjeuné.
  planifierBlocRepos(interAprem, terrains, duree, battement, recup, terrainLibre, equipeLibre, equipeFin, t0, sortie);

  sortie.sort(function (a, b) { return a.heure_debut_min - b.heure_debut_min; });
  var repM = {}, maxFin = 0, finRepos = 0;
  ids.forEach(function (id) {
    var mine = sortie.filter(function (x) { return x.equipe_A === id || x.equipe_B === id; })
                     .sort(function (a, b) { return a.heure_debut_min - b.heure_debut_min; });
    var g = 0, finPause = null;
    for (var i = 1; i < mine.length; i++) {
      var trou = mine[i].heure_debut_min - mine[i - 1].heure_fin_min;
      if (trou > g) g = trou;
      // Fin de la PAUSE = reprise après le PREMIER trou ≥ repos (le trou de midi, pas un creux d'après-midi).
      if (finPause === null && trou >= repos) finPause = mine[i].heure_debut_min;
    }
    repM[id] = g;
    if (finPause != null && finPause > finRepos) finRepos = finPause;
  });
  sortie.forEach(function (x) { if (x.heure_fin_min > maxFin) maxFin = x.heure_fin_min; });
  ids.forEach(function (id) {
    if (repM[id] < repos) avert.push('l\'équipe ' + id + ' n\'a que ' + repM[id] + ' min de repos (moins de ' + repos + ').');
  });
  // finRepos = heure (min) à laquelle la DERNIÈRE équipe finit sa pause déjeuner échelonnée.
  return { matchs: sortie, repos: repM, maxFin: maxFin, finRepos: finRepos, avert: avert };
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
