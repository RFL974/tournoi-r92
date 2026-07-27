# AUDIT-TOURNOI-R92.md

**Objet** — Fichier pivot de l'audit de conformité **FFR École de Rugby** de l'application
Tournoi R92. Il est la **source de vérité** de l'audit : il se transmet à chaque session, avec le
document FFR du jour.

**Méthode** — 1 session = 1 document FFR.

1. Romain envoie : ce fichier + le document FFR du jour
2. Analyse du document (millésime vérifié) confronté à la Partie 1
3. Confrontation du document du jour à TOUTES les questions ouvertes de la Partie 3 — un document ultérieur répond souvent à une question posée plus tôt
4. Verdict en trois colonnes : ce qui **existe déjà** / ce qui **doit être créé** / ce qui **doit être corrigé**
5. Discussion, Romain tranche
6. Rédaction du **prompt Claude Code** — toujours avec une **phase d'inspection avant modification**
7. Romain colle le **résumé d'exécution de Claude Code** (pas le prompt de départ)
8. Mise à jour du fichier : Partie 1 **réécrite**, Partie 2 **complétée**, Partie 3 **ajustée**

**Variante « pack »** (session 2) — Quand la FFR publie un *ensemble* de documents liés entre eux
(ex. la page « Documents utiles EDR »), on ne découpe pas en autant de sessions. On traite le pack
en une session, avec **un document pivot** et des satellites, et on enregistre **chaque** document
au registre des sources avec son propre numéro.

**Règle transverse** — Toute règle inscrite dans l'app est **sourcée** : quel document, quel
millésime. Voir le *Registre des sources* en tête de Partie 2.

---

# PARTIE 1 — État de l'app

> ⚠️ Cette partie est **réécrite intégralement à chaque session**.
> **Version de référence lue** : commit de merge `cfe7a7f` du 2026-07-27 (branche `main`,
> `RFL974/tournoi-r92`, PR #82). Backend Apps Script **redéployé en production** le même jour,
> **42/42 tests OK** dans l'éditeur, garde-fou de couverture **vérifié en conditions réelles**
> sur la page admin.

## 1.1 — Architecture

Trois briques qui communiquent en JSON, aucun framework, aucun serveur à gérer.

| Brique | Technologie | Rôle |
|---|---|---|
| Base de données | **Google Sheets** (8 onglets) | Stocke tout |
| Backend | **Google Apps Script**, déployé en Web App | `doGet` (lecture) / `doPost` (écriture), répond en JSON |
| Frontend | HTML/CSS/JS statiques, **GitHub Pages** | 7 pages, mobile-first |
| Relais CDN | **Cloudflare Worker** | Codé, **dormant** — activable pour la montée en charge |

Sécurité : lectures publiques ; écritures protégées par **2 clés** (admin / scores). Exception —
la page de réponse du club est sécurisée **par jeton**, pas par clé. Toutes les écritures sont
sérialisées par `LockService`. Cache serveur ~10 s sur `getAll`, **cache distinct ~10 s sur
`getRefFFR`** (clé `refffr_json`, sans interaction avec `getAll`).

⚠️ **Déploiement backend manuel** : le merge sur `main` ne met pas à jour l'Apps Script. Il faut
recopier `backend/Code.gs` et `backend/Tests.gs` dans l'éditeur, puis **mettre à jour le
déploiement existant** (jamais en créer un nouveau : l'URL changerait). À faire à chaque session
qui touche au backend. Le frontend, lui, se publie tout seul via GitHub Pages à chaque merge.

**Note de nommage** — `backend/Tests.gs` s'appelle **`Test.gs`** (au singulier) dans l'éditeur
Apps Script. Sans incidence : Apps Script partage la portée entre fichiers. Mais il faut coller
dans le fichier existant, ne pas en créer un second.

## 1.2 — Onglets Google Sheets

| Onglet | Contenu | Colonnes notables |
|---|---|---|
| `Config` | Zone A (réglages globaux, paires paramètre/valeur) + Zone B (une ligne par catégorie) | voir 1.3 |
| `Equipes` | Une ligne par équipe | `id_equipe`, `nom_equipe`, `categorie`, `poule`, `source` (`auto`/`manuel`) |
| `Poules` | Définition des poules | `id_poule`, `categorie`, `nom_poule` |
| `Matchs` | Une ligne par match | `id_match`, `categorie`, `poule`, `terrain`, `heure_debut`, `heure_fin`, `equipe_A`, `equipe_B`, `score_A`, `score_B`, `statut`, `phase`, `format`, `sous_tableau`, `tour`, `match_suivant`, `place_suivant`, `vainqueur` |
| `Historique` | Journal de saison, jamais effacé | `date`, `tournoi_id`, `id_match`, `categorie`, `phase`, `equipe_A`, `equipe_B`, `score_A`, `score_B` |
| `ClubsInvites` | Carnet d'adresses + suivi des deux phases | `club_nom`, `club_contact_prenom/nom/email`, `statut`, `date_ajout`, `categories_engagees`, `invitation_envoyee`, `dossier_envoye`, `club_token`, `date_reponse`, `nb_equipes_par_categorie`, `nb_joueurs_total`, `alerte_ecart` |
| `RefFFR_Formes` | Référentiel des formes de jeu, 60 lignes (6 catégories × 10 mois) | `categorie`, `mois`, `forme_jeu`, `effectif`, `tournoi_autorise`, `note`, `source`, `millesime` |
| `RefFFR_Dates` | Référentiel des dates fédérales, 74 lignes | `date`, `type`, `libelle`, `zone`, `categories`, `bloque_tournoi_club`, `source`, `millesime` |

`ClubsInvites` contient des emails : **jamais** exposé dans `getAll`, le cache ni le relais CDN.
Les deux onglets `RefFFR_*` ne contiennent **aucune donnée personnelle** : lecture publique assumée.

⚠️ **La colonne `millesime` est devenue structurante** (voir 1.10) : elle ne sert plus seulement
à la traçabilité, elle **détermine la période de couverture** du référentiel. Une colonne vide
fait basculer l'app en mode dégradé.

**Note d'import** — Les colonnes `date` et `mois` ont été converties en objets `Date` par Google
Sheets à l'import CSV. Ce n'est pas un problème : le backend normalise à la lecture (voir 1.4).

## 1.3 — Config, Zone B (réglages par catégorie)

`categorie`, `presente`, `terrains`, `terrains_auto`, `nb_poules`, `format_mi_temps`,
`duree_mi_temps_min`, `pause_mi_temps_min`, `recup_entre_matchs_min`, `format_apresmidi`,
`param_format`, `reglement`, `effectif_min`, `effectif_max`, `arbitrage_organisation`,
`max_equipes_par_club`.

**Zone A** : `zone_vacances` (défaut `C`, Île-de-France ; absent = traité comme `C`).

⚠️ **Seed corrigé en session 2** — le modèle livré à la création d'un classeur neuf attribuait
`COUPE_PLATEAU` + `{"nbQualifiesCoupe":2}` à **U12**, c'est-à-dire un format **interdit en EDR**
par défaut, sur la catégorie la plus concernée. Corrigé en `CROISE`, `param_format` vide.
**Les classeurs existants ne sont pas migrés** : voir 1.7.

Toutes les colonnes récentes bénéficient d'une **migration douce** (ajout automatique à droite,
vide = comportement historique).

## 1.4 — Actions backend (47)

**Lecture (`doGet`, 12)** — `ping`, `getConfig`, `getEquipes`, `getPoules`, `getMatchs`, `getAll`,
`getClassement`, `getHistorique`, `getClubDossier`, `getReponseInvitation`, `getRefFFR`,
`getConformiteFFR`

**Écriture (`doPost`, 35, clé admin sauf mention)** — `ajouterEquipe`, `modifierEquipe`,
`supprimerEquipe`, `supprimerEquipesCategorie`, `enregistrerHoraires`, `enregistrerCategorie`,
`supprimerCategorie`, `genererPoulesEtPlanning`, `reorganiserPoulesMatin`, `recalculerHoraires`,
`genererApresMidi`, `enregistrerScore` *(clé scores)*, `publierTournoi`, `reinitialiserTournoi`,
`enregistrerInfosTournoi`, `enregistrerAffiche`, `supprimerAffiche`, `enregistrerContactsSecurite`,
`enregistrerPlanTerrains`, `enregistrerInvitation`, `enregistrerSurPlace`,
`enregistrerReponseInvitation`, `enregistrerPhotoParking`, `supprimerPhotoParking`,
`ajouterClubInvite`, `modifierClubInvite`, `supprimerClubInvite`, `modifierStatutClubInvite`,
`listerClubsInvites`, `enregistrerCategoriesEngagees`, `creerEquipesClub`, `envoyerInvitationClub`,
`envoyerInvitationsGroupe`, `envoyerDossierEmail`, `repondreInvitation` *(jeton)*

**Fonctions internes de conformité** (non exposées comme actions) :

| Fonction | Rôle |
|---|---|
| `lireRefFFRFormes` / `lireRefFFRDates` | lecture des deux onglets via `lireOngletSimple` ; `[]` si absent |
| `getRefFFR` | assemble `{ formes, dates, millesime }` |
| `refFFRJsonCache` | cache serveur dédié, clé `refffr_json` |
| `normaliserDateISO` | accepte chaîne ISO, `JJ/MM/AAAA` **ou** objet `Date` → `AAAA-MM-JJ`, composantes **locales** |
| `normaliserMois` | idem → `AAAA-MM` |
| `ecartJoursISO` | écart en jours entiers, calculé en UTC (pas de piège d'heure d'été) |
| `normaliserCategorie` | clé canonique sans préfixe d'âge : `M8`/`U8` → `8`, `M15F`/`U15F` → `15F` |
| **`fenetreMillesimeFFR`** ⭐ | `'2026-2027'` → `{ debut:'2026-07-01', fin:'2027-06-30' }` ; `null` si format inattendu |
| **`couvertureSaisonFFR`** ⭐ | période couverte par le référentiel = **union des fenêtres de saison** des millésimes lus (dates, repli formes) ; repli dégradé sur min/max des dates si aucun millésime lisible |
| **`jourFrFFR`** ⭐ | `'AAAA-MM-JJ'` → `'JJ/MM/AAAA'`, sans dépendance au fuseau |
| `evaluerConformiteFFR` | **cœur pur et testable**, référentiel injecté, ne lit aucun classeur |
| `verifierConformiteFFR` | wrapper : lit le classeur puis délègue au cœur pur |
| `analyserEffectifsCategories` | compte les équipes par catégorie présente → `{ bloque, vides }` |

## 1.5 — Pages frontend

| Page | Public | Rôle |
|---|---|---|
| `tournoi.html` | public | Page live : onglets *Mon équipe* / *Classements*, filtre catégorie, podium, refresh ~15 s |
| `admin.html` | organisateur (clé admin) | Équipes, réglages, horaires, terrains & répartition, clubs invités, infos tournoi, **bloc Conformité FFR**, génération, publication |
| `saisie.html` | table de marque (clé scores) | Saisie des scores, filtre catégorie + grand terrain, verrouillage |
| `perfs.html` | interne | Bilan tournoi + cumul de saison par adversaire |
| `invitation-club.html` | public | Invitation Phase 1 (version web complète) |
| `reponse-invitation.html` | club (jeton) | Réponse en libre-service : accepte/décline, catégories, nb d'équipes, nb de joueurs |
| `dossier-club.html` | public | Dossier Phase 2 personnalisé : format sportif, jour J, logistique, QR live, autorisation droit à l'image en `.docx`, mentions licence FFR + FDM EDR |

`frontend/js/admin-conformite-ffr.js` porte la restitution du verdict, la forme attendue par
catégorie, son miroir `normaliserCategorieFFR`, et depuis la session 2 `messageCouvertureFFR`
(message du bandeau « hors couverture », repris du backend en priorité).

Le bloc Conformité FFR se recalcule **à la volée** dès que la date du tournoi ou la zone de
vacances change dans le formulaire (`admin.js`, écouteur sur `tournoi_date` / `zone_vacances`),
**sans enregistrement**. C'est ce qui permet de tester le contrôle sans écrire dans le classeur.

## 1.6 — Parcours amont existant

Le circuit club est déjà bâti, en deux phases :

- **Phase 1** — invitation légère par email (charte HTML, affiche inline), avec lien personnel à
  jeton vers `reponse-invitation.html`. Envoi individuel ou groupé, `invitation_envoyee` posée
  automatiquement. Date limite de réponse : `date_limite_reponse`.
- **Réponse club** — le club accepte ou décline lui-même ; catégories engagées, nombre d'équipes
  par catégorie (plafonné par `max_equipes_par_club`), nombre total de joueurs. Alerte d'écart si
  réduction d'engagement.
- **Création des équipes** — déclenchée par « Enregistrer la sélection », idempotente,
  `source = auto`.
- **Phase 2** — dossier complet personnalisé, envoyé manuellement en email HTML +
  `dossier-club.html`. Date limite de confirmation : `date_limite_confirmation`.

Paramètres déjà présents et directement utiles à la conformité : `referent_nom`, `referent_tel`,
`securite_secours_oui`, `securite_secours_precisions`, `securite_referent_*`, `reglement`,
`effectif_min`, `effectif_max`, `arbitrage_organisation`, `encadrement_ratio`,
`encadrement_diplomes`, `assurance_attestation_requise`.

## 1.7 — Formats d'après-midi

| Format | Statut FFR EDR | Implémentation |
|---|---|---|
| `CROISE` | ✅ conforme | Défaut historique (vide = CROISE) |
| `CROISE_DIAGONAL` | ✅ conforme | Rangs consécutifs croisés entre poules |
| `LIBRE` | ✅ conforme | Matchs amicaux, sans classement |
| `COUPE_PLATEAU` | ❌ **interdit en EDR** | **Masqué depuis la session 2** — retiré de `FORMATS_APRESMIDI`, plus jamais proposé comme choix. La **capacité** reste entière : `fixturesApresMidiCoupePlateau`, `construireBracketCoupe`, `propagerVainqueurBracket`, `majPetiteFinale`, `invaliderMatchAval` et les branches d'affichage sont intactes |

**Principe retenu : on masque le CHOIX, on ne supprime pas la CAPACITÉ.** Un classeur déjà
configuré en `COUPE_PLATEAU` doit continuer à générer, afficher et saisir sans erreur.

**Comportement pour une catégorie déjà stockée en `COUPE_PLATEAU`** :
- un encart orange « Format non conforme École de Rugby » s'affiche au-dessus des cartes ;
- le champ « Qualifiés en Coupe » reste visible et initialisé depuis la valeur stockée ;
- `format_apresmidi` **et** `param_format` sont **préservés** tant que l'organisateur ne valide
  pas explicitement un format conforme. L'app avertit, elle ne décide pas à la place.

`FORMAT_COUPE_PLATEAU_LEGACY` (dans `admin.js`) conserve le libellé « Coupe + Plateau » pour la
rétrocompatibilité d'affichage. **Actuellement référencé nulle part** — code mort inoffensif,
à nettoyer à l'occasion.

## 1.8 — État de la conformité FFR

| Point de conformité | État |
|---|---|
| Onglets `RefFFR_Formes` / `RefFFR_Dates` | ✅ créés, remplis, lus |
| Formes de jeu par catégorie et par mois | ✅ en donnée, jamais en dur, affichées en admin — **corroborées par 3 sources indépendantes** (S4, S6, S7) sur M8/M10/M12 |
| Contrôle « minimum 3 équipes » par catégorie | ✅ blocage dur en tête de `genererPoulesEtPlanning`, avant toute écriture ; 0 équipe = avertissement. Source directe et datée : S7 |
| Dates fédérales bloquantes | ✅ contrôle informatif, filtré par zone et par catégorie |
| Règle des **72 heures** (art. 230-2 RG) | ✅ implémentée (`\|écart\| ≤ 3 jours`, avant ou après). **Lecture la plus prudente des trois** relevées — voir session 2 |
| **Garde-fou « saison non couverte »** | ✅ **corrigé en session 2** — la couverture est la **saison du millésime** (1ᵉʳ juillet → 30 juin), pas le min/max des dates. Hors couverture ⇒ bandeau orange + avertissement backend ; le vert est formellement interdit |
| Zone de vacances scolaires | ✅ `zone_vacances`, défaut `C` |
| **Masquage de `COUPE_PLATEAU`** | ✅ **fait en session 2**, sans réécriture de la donnée existante |
| **Seed `Config` conforme** | ✅ **corrigé en session 2** (U12 : `COUPE_PLATEAU` → `CROISE`) |
| Mention « joueurs licenciés FFR » | ✅ dossier Phase 2 |
| Mention **FDM EDR** | ✅ dossier Phase 2 |
| Traçabilité des sources | ✅ colonnes `source` + `millesime` dans les deux onglets |
| Migration douce (référentiel absent) | ✅ prouvée en conditions réelles |
| **Directeur de tournoi — n° de licence et mail** | ❌ le rapport RDEDR (S8) les exige le jour J ; l'app n'a que `referent_nom` / `referent_tel` |
| **Champs du formulaire d'autorisation** | ❌ code club, label EDR + date, niveau du tournoi, heure de fin, type de terrain, vestiaires, arbitres/éducateurs/doublettes prévus, droits d'inscription, repas/goûters |
| **Checklist RDEDR jour J** | ❌ téléphone à moins de 50 m, brancard, coordonnées médecin/pompiers, accès secours, état et traçage des terrains, rubalise |
| **Chasubles #BienJoué** | ❌ orange pour les éducateurs, rouge pour l'organisateur — exigence contrôlée par le RDEDR, absente du dossier club |
| **Briefing d'avant-tournoi** | ❌ obligatoire et contrôlé ; la trame minutée existe (S10) et l'app sait déjà produire la feuille de déroulement à remettre aux éducateurs |
| Demande d'autorisation (art. 411-2 RG) — dates, n° d'autorisation, dépôt | ❌ aucun champ, aucune checklist |
| Jalons amont (J-90 / J-60 / J-45) | ❌ deux dates limites existent, non reliées à un rétroplanning |
| Dimensions de terrain réglementaires | ⚠️ `dimensions_categories` existe (JSON manuel), non contraint — **source à confirmer, piste identifiée** (fiches « Les règles du jeu » par forme de jeu, citées par S6) |
| Blocage **dur** sur date fédérale | ⚠️ volontairement informatif à ce stade |
| Dates de plateaux du **Comité 92** | ❌ absentes du référentiel (le calendrier FFR est national) |
| Cartons / discipline | ⛔ **hors périmètre, décidé en session 2** — la FDM EDR est la feuille de match officielle ; l'app n'introduira pas de données joueur |

**Tests** — `backend/Tests.gs`. Harnais autonome, sans Sheet ni effet de bord. Point d'entrée
`lancerTestsFFR()`. **42/42 OK** en production le 2026-07-27 (32 asserts d'origine inchangés
+ 10 nouveaux sur la couverture).

## 1.9 — Points d'ancrage pour la suite

- Un **écran « Amont / conformité »** dans l'admin reste **le seul vrai manque structurel**. Il
  est désormais entièrement spécifiable : le formulaire d'autorisation (S7) en donne le plan
  exact, section par section, et le rapport RDEDR (S8) la grille du jour J.
- **L'app sait déjà calculer ce que le formulaire demande** : nombre de matchs par équipe, durée
  de match, organisation en 1 ou 2 phases — et le vocabulaire fédéral (« poules de qualification
  puis poules de niveau ») décrit exactement `reorganiserPoulesMatin` + `genererApresMidi`. Le
  pré-remplissage de la demande d'autorisation est la fonctionnalité la plus rentable à venir.
- **`RefFFR_Dates`** → accueillera les dates du **Comité 92** via la colonne `source`
- **Zone A de `Config`** → paramètres de rétroplanning et d'autorisation
- **`invitation-club.html`** → années de naissance éligibles par catégorie
- **Tournoi du 92** — le comité organise son propre tournoi départemental des écoles de rugby
  (M8 à M14, historiquement en juin). Date bloquante absente du calendrier national, à ajouter à
  `RefFFR_Dates` avec `source = CD92`.
- **`arbitrage_organisation`** → vérifier que les options correspondent aux quatre du rapport
  RDEDR : *Éducateurs* / *Joueurs + Éducateurs* / *Joueurs* / *Arbitre Référent*
- **Libellé du contrôle des 72 h** → préciser en admin que c'est un garde-fou sur la **date**,
  pas une vérification joueur par joueur (la règle fédérale est individuelle)

**Dette identifiée** :
1. `normaliserCategorie` (backend) a un miroir `normaliserCategorieFFR` (frontend). Deux
   implémentations d'une même règle, susceptibles de diverger. Même situation que le barème de
   classement, déjà dupliqué et documenté.
2. `millesimeRefFFR` renvoie le **premier** millésime trouvé, pas celui de la date examinée.
   Sans effet tant qu'une seule saison cohabite dans le classeur (voir 1.10). Volontairement
   **non traité** en session 2 pour garder la PR resserrée.
3. `FORMAT_COUPE_PLATEAU_LEGACY` : code mort.

## 1.10 — Cycle annuel du référentiel

La FFR publie le calendrier EDR **début juin** (celui de 2026-2027 est daté du 03/06/2026). La
fenêtre de mise à jour est donc **juin – août**, avant l'envoi des invitations.

**Procédure retenue : remplacement, pas empilement.** Les deux onglets RefFFR sont vidés et
rechargés avec la nouvelle saison. Deux raisons : `millesimeRefFFR` renvoie le premier millésime
trouvé et deviendrait faux avec deux saisons cohabitant ; et la traçabilité historique est portée
par **ce fichier d'audit** — registre des sources et journal de session — non par le classeur.

Étapes :
1. Récupérer le calendrier EDR de la nouvelle saison et sa note d'accompagnement
2. Régénérer les deux CSV (extraction de la grille par coordonnées, la lecture du texte brut
   entremêle les mois d'une même page)
3. Vider `RefFFR_Formes` et `RefFFR_Dates`, coller les nouvelles lignes
4. ⚠️ **VÉRIFIER QUE LA COLONNE `millesime` EST REMPLIE**, au format `AAAA-AAAA`, sur **toutes**
   les lignes des deux onglets. Depuis la session 2, cette colonne détermine la période de
   couverture. Si elle est vide, `couvertureSaisonFFR` bascule en repli dégradé (min/max des
   dates) et un tournoi de **juin** — le cas le plus courant — serait annoncé « hors couverture ».
   Le contrôle resterait prudent (orange, jamais de faux vert), mais deviendrait bruyant et
   finirait par être ignoré.
5. **Session d'audit dédiée** : les règles elles-mêmes peuvent changer, pas seulement les dates.
   Une bascule de forme de jeu avancée d'un mois est une règle. Des questions closes peuvent
   rouvrir.

---

# PARTIE 2 — Journal des sessions

> On ajoute, on n'efface jamais.

## Registre des sources

| # | Document | Millésime | Date de lecture | Sessions concernées |
|---|---|---|---|---|
| S1 | Règlements Généraux FFR, Titre IV, art. 411-2 | 2019-2020 *(à revérifier)* | 2026-07 | pré-audit |
| S2 | Formulaire de demande d'autorisation de tournoi EDR | à confirmer | 2026-07 | pré-audit *(relu intégralement en session 2, voir S7)* |
| S3 | Cahier des charges École de Rugby | 2025-2026 | 2026-07 | pré-audit |
| S4 | Calendrier Fédéral Écoles de Rugby (FFR-CNEDR) + Note d'accompagnement | **2026-2027**, note du **03/06/2026** | 2026-07-25 | session 1 |
| S5 | Règlements Généraux FFR, **art. 230-2** (72 h) — *délai apprécié entre le coup d'envoi de la première rencontre et celui de la seconde ; participation = entrée effective sur le terrain* | à confirmer | 2026-07-25 | session 1 |
| **S6** | **Organisation de la pratique École de Rugby** — document pivot du pack | **2026-2027**, explicite | **2026-07-27** | **session 2** |
| **S7** | **Formulaire – demande d'autorisation, organisation de tournoi EDR** (lecture intégrale) | grille **2026-2027** | 2026-07-27 | session 2 |
| **S8** | **Fiche mission + Rapport + Rapport complémentaire du Représentant Départemental EDR** | **mise à jour juillet 2026** | 2026-07-27 | session 2 |
| **S9** | **Feuille de présence – Tournoi ou plateau EDR** (M8 / M10 / M12) | non daté | 2026-07-27 | session 2 |
| **S10** | **Briefing Tournoi École de Rugby** (visuel, 5 étapes minutées) | non daté | 2026-07-27 | session 2 |
| S11 | Feuille de présence M14-M15F jeu à X | non daté | 2026-07-27 | session 2 — *hors périmètre* |
| S12 | Feuille de présence M14-M15F jeu à XV | non daté | 2026-07-27 | session 2 — *hors périmètre* |
| S13 | Feuille de régulation jeu à X | non daté | 2026-07-27 | session 2 — *hors périmètre* |
| S14 | Feuille de régulation jeu à XV | non daté | 2026-07-27 | session 2 — *hors périmètre* |

---

## Session 0 — 2026-07-25 — Cadrage et état initial

**Document du jour** : aucun (lecture du dépôt).

**Fait** : lecture complète du dépôt au commit `ef81489`, rédaction de la Partie 1, report des
acquis du pré-audit et des questions ouvertes.

**Acquis reportés du pré-audit** :

- **Phases finales interdites** → `COUPE_PLATEAU` à **masquer** en admin, pas à supprimer.
  `CROISE`, `CROISE_DIAGONAL`, `LIBRE` conformes
- **Formes de jeu variables selon le mois** → à stocker dans un onglet `RefFFR`, jamais en dur
- **FDM EDR** remplace composition d'équipe / feuille de régulation / feuille de score dès
  2026-2027. **Aucune API publique FFR.** Zéro recouvrement fonctionnel avec Tournoi R92
- **Demande d'autorisation** : minimum **15 jours** avant (art. 411-2 RG), cible pratique **J-45**.
  Invitations **J-90**, réponse des clubs **J-60**
- **Circuit** : club → comité départemental → ligue régionale
- **Récompenses / podiums autorisés**
- **Pass Rugby tranché** : tout joueur en tournoi est licencié, **rien à gérer dans l'app**
- **Pas de modèle FFR** d'invitation ni de dossier club → les structures Phase 1 / Phase 2 sont valides
- **Dimensions** : M8 30×20 m · M10 30×25 m · M12 56×45 m · M14 terrain senior — *source non
  retrouvée, à reconfirmer*

⚠️ **Deux erreurs de la session 0, corrigées en session 1** :

1. « `COUPE_PLATEAU` à masquer, pas à supprimer, **45 tests derrière** » — **il n'existait aucun
   test dans le dépôt**. Le chiffre 45 renvoyait aux 45 actions backend (§1.4), repris par erreur.
   La décision de masquer reste valide, mais pour la seule bonne raison : le format est interdit
   en EDR.
2. « L'app couvre M8 à M12 → **100 % du périmètre EDR** » — **faux**. L'EDR au sens FFR couvre
   M5, M6, M8, M10, M12, M14/M15F. Formulation correcte : l'app couvre les catégories **éligibles
   à un tournoi club classique**.

**Décidé** : rien. L'audit document par document commence en session 1.

---

## Session 1 — 2026-07-25 — Calendrier EDR 2026-2027

**Document du jour** : Calendrier Fédéral Écoles de Rugby 2026-2027 (FFR-CNEDR, 2 pages) +
Note d'accompagnement.
**Millésime** : saison 2026-2027, note datée du **03/06/2026** → source **S4**. Fait autorité.
**Méthode de lecture** : extraction de la grille avec coordonnées des cellules (la lecture du
texte brut entremêle les cinq mois d'une même page). Les deux documents se recoupent mois par
mois sur les formes de jeu.

### Existe déjà

- Le format « tournoi » est le **seul autorisé** en EDR : *les matchs secs ne sont pas autorisés,
  les seuls formats autorisés sont les tournois avec minimum 3 équipes*. L'architecture de l'app
  était alignée d'emblée.
- M8 / M10 / M12 sont exactement les catégories portant plateaux départementaux et journées
  Rugby pour Elles.
- `date_limite_reponse` et `date_limite_confirmation` : socle du rétroplanning.
- Licences : *pour toute rencontre les licences doivent obligatoirement être validées* →
  **confirme** la décision Pass Rugby de la session 0.

### Créé

1. **`RefFFR_Formes`** — 60 lignes. Table lue :

   | | Sept | Oct | Nov | Déc | Janv → Juin |
   |---|---|---|---|---|---|
   | **M5** | Baby rugby, aucun tournoi | | | | |
   | **M6** | max 2 plateaux par trimestre et par club | | | | |
   | **M8** | T+2 5x5 | T+2 5x5 | T+2 5x5 | T+2 5x5 | JCO 5x5 |
   | **M10** | T+2/JCO 5x5 | JCO 5x5 | JCO 5x5 | JCO 5x5 | **RE 7x7** |
   | **M12** | T+2/JCO 5x5 | JCO 5x5 | JCO 5x5 | **RE 10x10** | RE 10x10 |
   | **M14/M15F** | T+2/JCO 7x7 | JCO 7x7 puis RE | RE 10x10 / 15x15 | idem | idem |

2. **`RefFFR_Dates`** — 74 lignes datées, avec `type`, `zone`, `categories`,
   `bloque_tournoi_club` (`OUI` / `NON` / `AVERTISSEMENT`).
3. **Contrôle « minimum 3 équipes »** — blocage dur, indépendant du référentiel.
4. **Contrôle de date** — date fédérale directe + règle des 72 h.
5. **Affichage de la forme attendue** par catégorie en admin.
6. **Mentions licence FFR + FDM EDR** dans le dossier Phase 2.

### Corrigé

- Ligne « règle des 3 jours francs » de la Partie 1 : c'est **72 heures**, avant *ou* après
  (art. 230-2 RG). Ce n'est pas la même chose.
- Périmètre EDR mal formulé en session 0 (voir ci-dessus).
- Mention erronée des « 45 tests » (voir ci-dessus).
- **Bug découvert en relecture** : le `<select>` de zone de vacances n'avait aucune `<option>`
  marquée `selected` → le navigateur retenait **Zone A**. L'Île-de-France aurait été traitée en
  zone A, ce qui décale 4 dates de plateaux dans le sens dangereux (l'app aurait dit « libre »
  un jour bloqué). Corrigé : `selected` posé sur Zone C dans le HTML statique.

### Écart repéré entre les deux documents

La bascule M14 d'octobre est datée du **11/10** dans la note et du **12/10** dans la grille du
calendrier. Sans effet pour Tournoi R92 (M14 hors périmètre actuel), mais consigné.

### Résultat concret — samedis 2026-2027, M8/M10/M12, zone C

- **Bloqués** : 19/09, 10/10, 17/10, 14/11, 28/11, 05/12, 16/01, 30/01, 06/03, 20/03, 27/03,
  24/04, 29/05
- **Bloqué par la règle des 72 h** : **samedi 08/05/2027**, à cause de la journée Rugby pour
  Elles du **jeudi 06/05** (Ascension). Invisible en ne regardant que les samedis.
- **À vérifier** (dates de repli) : 26/09, 21/11, 12/12, 23/01, 06/02
- **Libres** : mai à partir du 15, et **tout juin** — cohérent avec la recommandation FFR
  (*les week-ends de mai et juin sont principalement laissés libres pour les tournois clubs*).

### ⚠️ Conflit détecté en conditions réelles

Le contrôle a signalé un conflit sur la date **11/11/2026** (« Challenge Marc Chevallier ») :
plateau départemental le **samedi 14/11**, soit 3 jours après → fenêtre des 72 h. **Précision
importante** : cette date est une **date de TEST** reprise de l'édition précédente, **pas un
tournoi programmé**. Le contrôle a donc été **validé sur une configuration réelle** (il détecte
bien le cas frontière des 72 h), mais **aucune décision d'organisation n'en découle**. → **Q8**
perd son caractère urgent : elle reste ouverte sur le principe, sans échéance.

### Décidé

- Référentiel en **deux onglets** distincts plutôt qu'un onglet à deux zones (schémas trop
  différents).
- Les CSV restent **fidèles à la source FFR** (notation `M…`) ; c'est le **code** qui réconcilie
  avec la notation `U…` de l'app, via `normaliserCategorie`. La donnée n'est jamais dénaturée
  pour arranger le code.
- Le contrôle de date est **informatif**, pas bloquant : l'organisateur décide, l'app alerte.
  Le blocage dur viendra avec la demande d'autorisation.
- Le contrôle « min 3 équipes » est **dur**, et actif même sans référentiel.
- `getConformiteFFR` exposée en plus de `getRefFFR` : une seule source de vérité côté backend
  testé, plutôt que la règle des 72 h dupliquée en JavaScript.
- Tests dans un fichier `Tests.gs` séparé (pas dans `Code.gs`, déjà > 3 500 lignes).

**Prompt Claude Code produit** : `PROMPT-CLAUDE-CODE-S1.md`, deux phases (inspection seule, puis
implémentation sur branche + PR).

**Résumé d'exécution** : branche `feat/conformite-ffr-refffr`, PR **#81**, 7 commits, 10 fichiers,
+844 / −5, tests **32/32 OK**. Mergée en `dfbeec1`. Migration douce prouvée en conditions réelles
(page admin chargée contre un backend non redéployé → bandeau gris, zéro erreur console).
Backend redéployé et vérifié en production le soir même.

---

## Session 2 — 2026-07-27 — Pack « Documents utiles EDR »

**Documents du jour** : **9 documents**, pack complet de la page « Documents utiles EDR » du site
FFR → sources **S6 à S14**. Traités en une seule session (voir la variante « pack » en tête de
fichier).
**Millésimes** : S6 explicitement **2026-2027** ; S8 « mise à jour **juillet 2026** » ; S7 porte
la grille **2026-2027**. Les cinq autres ne sont pas datés.

**Périmètre** : **quatre documents sur neuf** concernent M8/M10/M12 (S6, S7, S8, S9) plus le
briefing (S10). Les quatre restants (S11–S14 : feuilles de présence et de régulation à X et à XV)
sont **entièrement M14/M15F** — enregistrés comme sources, ils ne génèrent aucun travail.

### Confrontation aux questions ouvertes

**Aucune clôture.** Cinq questions se resserrent nettement :

- **Q1** — S7 lu en entier : la section « Participants » ne demande que des **nombres** (clubs,
  équipes, participants). La liste nominative n'est exigée **que pour les équipes étrangères**
  (noms, prénoms, dates de naissance + autorisation des fédérations étrangères). Choix délibéré
  du formulaire, pas un oubli. La contradiction avec l'art. 411-2 n'est pas levée.
- **Q2** — S7 décrit un circuit **papier à signatures** (Club demandeur → Comité Départemental →
  Ligue Régionale → FFR si international), chaque instance apposant un avis favorable ou non.
  Aucune adresse, aucune mention de saisie en ligne.
- **Q3** — faisceau négatif solide : S7 demande le nombre et le **type** de terrain (gazon,
  synthétique, sable, neige, argile) et le nombre de vestiaires ; S8 contrôle « terrains en bon
  état », « traçage des terrains », « pose éventuelle de rubalise en l'absence de main courante ».
  Aucune mention d'homologation nulle part. Mais aucune phrase ne tranche.
- **Q4** — deux articles nouveaux identifiés : S8 renvoie aux **art. 233 et 422** des RG, et
  reproduit l'art. 422 intégralement. Toujours aucun millésime affiché.
- **Q5** — **point important** : « Organisation de la pratique EDR 2026-2027 » (S6) **n'est pas**
  le cahier des charges. S8 cite le cahier des charges comme un **document distinct** que le
  RDEDR doit contrôler. Un document 2026-2027 est bien paru, mais ce n'est pas celui de la
  question. Réponse partielle ⇒ on ne clôt pas.
- **Q11** — S6 renvoie explicitement à des fiches **« Les règles du jeu »** téléchargeables, une
  par forme de jeu. C'est là que se trouvent les dimensions. On sait enfin où chercher.

Q6, Q7, Q8, Q9 : rien dans le pack.

### Existe déjà — confirmé

- **Minimum 3 équipes, pas de match sec, phases finales interdites** : S7 l'écrit en tête, dans
  les « Rappels des principes généraux ». Le blocage dur de l'app est désormais sourcé par un
  document du millésime en cours.
- **Le modèle sportif fédéral est « poules de qualification puis poules de niveau »** — vocabulaire
  exact de S7, section « Format sportif ». C'est ce que font `reorganiserPoulesMatin` +
  `genererApresMidi`. `CROISE` / `CROISE_DIAGONAL` sont **dans** le modèle fédéral.
- **Récompenses autorisées** : case « Récompenses oui/non » présente pour chaque catégorie (S7).
- **Aucun recouvrement avec la FDM EDR** : S6 précise que la feuille de présence se renseigne
  *via la feuille de match dématérialisée des EDR*, et S8 contient une case de contrôle
  « Utilisation de la feuille de match dématérialisée ».
- **Pas de passeports en dessous de M14** : S9 ne demande que Nom, Prénom, N° de licence. Les
  colonnes « Passeport joueur de devant / arbitrage » n'existent que sur S11 et S12 (M14/M15F).
- **Référentiel des formes de jeu corroboré** : les grilles de S6 et S7 redonnent, indépendamment
  de S4, les mêmes formes mois par mois pour M8, M10 et M12. **Troisième source concordante** sur
  tout le périmètre de l'app. S7 ajoute la **liste fermée** des formes autorisées par catégorie
  (M8 : 5x5 T+2 ou JCO ; M10 : + 7x7 RE ; M12 : + 10x10 RE) — concordante elle aussi.

### La règle des 72 h — convergence, avec une nuance

S9, S11 et S12 font signer à chaque éducateur qu'aucun joueur n'a participé à une rencontre FFR
**« dans les 3 jours francs précédents »**. Ce n'est pas la formulation de l'art. 230-2 (S5).

**Arithmétiquement, les deux coïncident** avec l'implémentation actuelle : match le mercredi,
tournoi le samedi ⇒ 2 jours francs ⇒ non conforme, et `|écart| ≤ 3` bloque. Match le mardi ⇒
3 jours francs ⇒ conforme, et l'app ne bloque pas. **Le code est juste**, et c'est même la
lecture la plus prudente des trois : une lecture horaire stricte (mercredi 10 h → samedi 14 h =
76 h) laisserait passer un cas que l'app bloque.

Deux nuances consignées :
1. La feuille de présence n'engage que **le passé** (« précédents ») ; l'app contrôle dans les
   deux sens. Plus sévère, probablement correct au regard de l'art. 230-2, mais non démontré par
   le pack → **Q14**.
2. La règle est **individuelle** (par joueur). L'app l'applique **au niveau de la date du
   tournoi**, comme proxy. Légitime, mais le libellé affiché doit le dire (voir §1.9).

### À créer — relevé, non implémenté en session 2

1. **Bloc « Directeur du tournoi »** — S8 exige Nom, Prénom, **N° de licence**, mail, téléphone.
   S6 précise qu'un responsable de plateau est **nommé par l'organisateur**.
2. **Champs du formulaire d'autorisation** absents de l'app (voir la liste au §1.8).
3. **Checklist RDEDR jour J**, reprise mot pour mot de S8.
4. **Chasubles #BienJoué** — **orange** pour les éducateurs, obligatoire pour accéder aux zones
   techniques ; **rouge** pour l'organisateur. Réassort annuel par la FFR dans les Comités
   Départementaux. Contrôlé par le RDEDR.
5. **Briefing d'avant-tournoi** — obligatoire (S6), contrôlé (S8), trame minutée disponible (S10) :
   30 s accueil / 1 min sens et rôles / 1 min organisation sportive / 3 min règles du jeu /
   15 s conclusion ≈ 5 min 45. S10 recommande de **remettre la feuille de déroulement à chaque
   éducateur** — l'app sait déjà la produire.
6. **Durée de carton jaune** : 2 minutes pour toutes les formes de jeu sauf le XV (5 min).
   Information utile à la table de marque.

### Écarts entre documents — consignés

1. **Bascule M14 d'octobre** : **11/10** dans le texte de S6, **12/10** dans la grille de S7.
   C'est le même écart qu'en session 1 — désormais confirmé sur quatre documents. Constante :
   **les textes disent 11, les grilles disent 12.** Sans effet pour R92 (M14 hors périmètre).
2. **Légende contradictoire de S6** : la légende annonce « T+2 et JCO = effectif réduit **7x7** »,
   alors que la grille du même document impose 5x5 en M8/M10/M12. La légende est manifestement
   écrite pour M14/M15F. **La grille prime.** Consigné pour qu'une future mise à jour du
   référentiel ne « corrige » pas la donnée d'après la légende.

### Décidé

- **Cartons / discipline : hors périmètre de l'app.** S6 pose des règles qui traversent les
  matchs (2 jaunes dans un match ⇒ interdit du match suivant ; 3 jaunes sur le tournoi ⇒ plus
  aucun match ; rouge ⇒ suspendu pour le reste du tournoi). Un logiciel les tiendrait bien, mais
  l'app n'a **aucune donnée joueur** : les compter supposerait d'introduire des **noms de mineurs**
  dans un classeur dont `getAll` est en lecture publique. La FDM EDR est la feuille de match
  officielle et porte les cartons. **L'app ne duplique pas.**
- **Périmètre de la PR de session 2 volontairement resserré** : garde-fou de couverture +
  masquage de `COUPE_PLATEAU`. L'écran « Amont / conformité » attend la session 3.
- **Définition de la couverture corrigée en cours de route** (voir ci-dessous).

### ⚠️ Correction de méthode en cours de session — la définition de la couverture

Le prompt initial définissait la couverture comme le **min/max des dates de `RefFFR_Dates`**.
**C'était structurellement faux**, et un test existant l'a révélé : Claude Code a signalé que
`testFFR_dateLibre` (date du 13/06/2027) casserait, et a proposé d'**étendre la fixture de test**.

Proposition **refusée** : elle traitait le symptôme. La session 1 avait établi que la FFR laisse
**mai à partir du 15 et tout juin libres** pour les tournois de club — une saison se termine donc
par plusieurs semaines **sans aucune date bloquante**. Avec le min/max, un tournoi de **juin**,
c'est-à-dire **la date la plus probable pour R92**, aurait été annoncé « hors couverture ». Faux
positif sur le cas le plus courant : la fonctionnalité aurait été ignorée en trois semaines.

**Règle retenue** : un référentiel couvre une **saison**, pas l'étendue de ses dates bloquantes.
Le millésime `2026-2027` couvre du **1ᵉʳ juillet 2026 au 30 juin 2027**, bornes incluses, qu'il y
ait ou non des lignes datées à l'intérieur. Union si plusieurs millésimes. Repli dégradé sur le
min/max seulement si aucun millésime n'est lisible.

Avec cette règle, `testFFR_dateLibre` passe **sans modification de la fixture ni de l'assertion**.

**Leçon** : un test qui casse est une information, pas un obstacle. La consigne « si un test casse,
ne le modifie pas pour le faire passer, arrête-toi et explique » a fonctionné exactement comme
prévu et a évité un faux positif en production. À conserver dans tous les prompts.

### Vérification indépendante avant merge

La PR a été relue et **rejouée hors Apps Script** (harnais Node avec stubs) avant le merge :
42/42 OK confirmé, puis six scénarios réels passés contre un référentiel dont la dernière date
bloquante est le 29/05 et qui n'a **rien** en juin :

| Date | Attendu | Obtenu |
|---|---|---|
| 19/06/2027 (cas le plus probable) | couvert | ✅ couvert, aucun avertissement |
| 15/05/2027 | couvert | ✅ |
| 01/07/2026 et 30/06/2027 (bornes) | couvert | ✅ bornes bien incluses |
| 18/09/2027 (saison suivante) | hors couverture | ✅ avertissement poussé |
| 20/06/2026 (saison précédente) | hors couverture | ✅ avertissement poussé |

**Angle mort découvert à cette occasion** : si la colonne `millesime` est vide, le repli dégradé
retombe sur le min/max et annoncerait « hors couverture » en juin. Sans effet aujourd'hui (la
colonne est remplie), mais c'est un piège pour la mise à jour annuelle → inscrit au §1.10, étape 4.

**Prompt Claude Code produit** : `PROMPT-CLAUDE-CODE-S2.md`, deux phases (inspection seule, puis
implémentation sur branche + PR), avec la correction de la règle de couverture envoyée entre les
deux phases.

**Résumé d'exécution** : branche `fix/garde-fou-couverture-et-masquage-coupe`, PR **#82**,
4 commits, 7 fichiers, **+239 / −16**, tests **42/42 OK**. Mergée en `cfe7a7f`.

**Écarts au prompt déclarés par Claude Code**, tous acceptés :
1. Règle de couverture selon la correction envoyée, et non selon le §2.2 initial.
2. Correction du seed `Config` U12 intégrée au commit 1 au lieu d'un commit dédié (les deux
   modifications sont dans `Code.gs`). Cosmétique.
3. Nouvelle classe CSS `.format-interdit-edr` pour l'encart d'avertissement — l'interdiction de
   créer une classe visait le bandeau de couverture (objectif 1), qui réutilise bien
   `ffr-orange` / `ffr-neutre`.
4. `param_format` reconstruit depuis le champ « Qualifiés en Coupe » resté visible plutôt que
   recopié en chaîne brute. Vérifié : le champ est bien visible et initialisé pour une catégorie
   déjà en Coupe.

**Vérification en production** : backend redéployé le 2026-07-27, `lancerTestsFFR()` exécuté dans
l'éditeur, puis deux tests en conditions réelles sur `admin.html` — bandeau orange « hors
couverture » sur une date de septembre 2027 (sans enregistrement, le contrôle se recalculant à la
volée sur le champ de saisie), et disparition de la carte « Coupe + Plateau » des réglages. Les
deux **conformes**.

---

# PARTIE 3 — Questions ouvertes

**Règles de clôture** — Une question se ferme soit *par document* (source et passage cités), soit *par le comité / la ligue*. Une réponse partielle ne ferme rien : la question reste ouverte, assortie d'une note sur ce qui manque. La liste finale des points sans réponse textuelle n'est établie qu'une fois tous les documents FFR traités.

| # | Question | Destinataire | Statut |
|---|---|---|---|
| Q1 | Le formulaire d'autorisation ne demande que des **nombres** de clubs et d'équipes, alors que l'art. 411-2 des RG exige le **nom** des clubs participants et leur **accord de participation**. Faut-il joindre la liste nominative et les accords écrits en annexe ? *S7 lu intégralement (session 2) : la liste nominative n'est exigée que pour les **équipes étrangères**. Choix délibéré, contradiction non levée.* | Ligue IDF / Comité 92 | ⏳ ouverte |
| Q2 | Quelle est l'**adresse de dépôt** de la demande d'autorisation, et existe-t-il un **formulaire en ligne** ? *(`edr@idfrugby.fr` circule mais n'est pas vérifiée — ne pas l'utiliser sans confirmation)* *S7 décrit un circuit papier à signatures et ne mentionne aucune saisie en ligne (session 2).* | Ligue IDF / Comité 92 | ⏳ ouverte |
| Q3 | **Homologation des terrains** : exigence applicable à un tournoi EDR non officiel ? *Faisceau négatif : S7 ne demande que type et nombre de terrains, S8 ne contrôle qu'état, traçage et rubalise. Aucune mention d'homologation dans tout le pack (session 2).* | Comité 92 | ⏳ ouverte |
| Q4 | Le **millésime des RG** consulté (Titre IV, 2019-2020) est ancien. L'art. 411-2 a-t-il évolué ? Vérifier aussi l'**art. 230-2** (72 h), et les **art. 233 et 422** (représentant départemental EDR) identifiés en session 2 via S8. | vérification Romain | ⏳ ouverte |
| Q5 | Le **cahier des charges EDR 2026-2027** est-il paru ? *Attention : « Organisation de la pratique EDR 2026-2027 » (S6) **n'est pas** le cahier des charges — S8 le cite comme un document distinct que le RDEDR doit contrôler. Réponse partielle (session 2).* | vérification Romain | ⏳ ouverte |
| Q6 | L'onglet **RAPPORTS** existe-t-il dans l'Oval-e du club ? *(S6 mentionne « Ovale 2 » pour la saisie des passeports — piste voisine, pas une réponse.)* | vérification Romain | ⏳ ouverte |
| Q7 | Les dates **« REPLI »** (repli plateau départemental, repli SCF/CF) bloquent-elles un tournoi club ? Le texte interdit les tournois « sur les dates de plateaux départementaux » ; un repli est une date de réserve. *Traité en `AVERTISSEMENT` dans le référentiel en attendant.* | Comité 92 | ⏳ ouverte |
| Q8 | **Cas concret** : le Challenge Marc Chevallier du **mercredi 11/11/2026** est-il compatible avec le plateau départemental du **samedi 14/11** ? Écart de 3 jours = limite exacte des 72 h. *Sans échéance : la date est une date de test, pas un tournoi programmé.* | Comité 92 | ⏳ ouverte |
| Q9 | Le **calendrier des plateaux du Comité 92** — celui qui bloque en pratique — n'est pas dans le calendrier national. Où le récupérer, et sous quelle forme ? *(à intégrer dans `RefFFR_Dates` avec `source = CD92`)* | Comité 92 | ⏳ ouverte |
| Q10 | Les mentions **(A)/(B)/(C)** désignent bien les zones de vacances scolaires — la légende du calendrier (page 1) l'indique explicitement : « A,B ou C = zone si vacances scolaires ». L'Île-de-France est en zone C. Le référentiel et le paramètre `zone_vacances` sont corrects. Source : S4, légende page 1. | Comité 92 | ✅ résolue (document) |
| Q11 | **Source des dimensions de terrain** (M8 30×20, M10 30×25, M12 56×45) : reportée du pré-audit sans document identifié. *Piste ouverte en session 2 : S6 renvoie aux fiches « Les règles du jeu », une par forme de jeu, téléchargeables sur ffr.fr. C'est là qu'il faut chercher.* | vérification Romain | ⏳ ouverte |
| **Q12** | **Qui dépose la demande d'autorisation ?** S7 exige un **code club** et la signature « sous couvert de son Président ». **Génération R92 est une association, pas un club affilié à la FFR.** La demande doit-elle partir du **Racing 92** ? Question structurante pour tout le parcours amont. | Comité 92 / Racing 92 | ⏳ ouverte |
| **Q13** | **L'école de rugby du Racing 92 est-elle labellisée FFR**, et à quelle date remonte le **dernier label** ? S7 en fait un champ obligatoire et précise qu'une association non labellisée **ne peut pas organiser** de tournoi EDR à son initiative. | vérification Romain | ⏳ ouverte |
| **Q14** | **Symétrie de la règle des 72 h.** Les feuilles de présence (S9, S11, S12) n'engagent que le **passé** (« 3 jours francs précédents »), alors que l'app contrôle **avant et après**. L'art. 230-2 est-il bien symétrique ? *L'implémentation actuelle est la plus prudente des lectures relevées — on ne change rien tant que ce n'est pas tranché.* | vérification Romain / Comité 92 | ⏳ ouverte |
