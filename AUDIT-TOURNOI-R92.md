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
> **Version de référence lue** : commit de merge `6306d27` du 2026-07-27 (branche `main`,
> `RFL974/tournoi-r92`, PR #83). Backend Apps Script **redéployé en production** le même jour,
> **66/66 tests OK**, et fermeture de la lecture publique **vérifiée en conditions réelles**
> (`?action=getConfig` et `?action=getAll` : `tournoi_nom` présent, `referent_tel` introuvable).

## 1.1 — Architecture

Trois briques qui communiquent en JSON, aucun framework, aucun serveur à gérer.

| Brique | Technologie | Rôle |
|---|---|---|
| Base de données | **Google Sheets** (8 onglets) | Stocke tout |
| Backend | **Google Apps Script**, déployé en Web App | `doGet` (lecture) / `doPost` (écriture), répond en JSON |
| Frontend | HTML/CSS/JS statiques, **GitHub Pages** | 7 pages, mobile-first |
| Relais CDN | **Cloudflare Worker** | Codé, **dormant** — activable pour la montée en charge |

Sécurité — **les lectures publiques sont filtrées depuis la session 3** : toute sortie de
configuration passe par `lireConfigPublique`, avec une **liste blanche opt-in** (rien ne sort
sauf ce qui est nommément autorisé). Trois vues : `live` (page des scores), `invitation`
(vitrine publique), `club` (dossier, **protégé par jeton**). Une vue inconnue retombe sur `live`,
la plus fermée : le défaut est fermé. Écritures protégées par **2 clés** (admin / scores). Deux
pages club sont sécurisées **par jeton**, pas par clé : la réponse à l'invitation et le dossier.
Toutes les écritures sont sérialisées par `LockService` ; les **lectures authentifiées** en sont
exemptées (voir 1.4). Cache serveur ~10 s sur `getAll` (clés `snapshot_json_v2` et
`snapshot_json_secours_v2`, cette dernière conservée **6 h**), **cache distinct ~10 s sur
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

## 1.4 — Actions backend (49)

**Lecture (`doGet`, 13, publiques)** — `ping`, `getConfig` *(vue `invitation`)*, `getEquipes`,
`getPoules`, `getMatchs`, `getAll` *(vue `live`)*, `getClassement`, `getHistorique`,
`getClubDossier` *(jeton)*, **`getConfigClub`** ⭐ *(jeton, vue `club`)*, `getReponseInvitation`
*(jeton)*, `getRefFFR`, `getConformiteFFR`

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

**Lecture authentifiée (`doPost`, 1)** — **`getConfigAdmin`** ⭐ *(clé admin)* : renvoie la
configuration **complète** à l'administration. Regroupée dans `ACTIONS_LECTURE` et traitée
**après** la vérification de clé mais **avant** la prise du verrou d'écriture — une lecture ne
doit jamais entrer en concurrence avec la saisie des scores un jour de tournoi.

**Fonctions internes de filtrage public** :

| Fonction | Rôle |
|---|---|
| `CONFIG_PUBLIQUE_VUES` | Les trois listes blanches, déclarées **côte à côte** : `live`, `invitation`, `club` |
| `filtrerConfigPublique` | **Cœur pur et testable**, config injectée, ne lit aucun classeur. Vue inconnue ⇒ `live` |
| `lireConfigPublique` | **Seul point de sortie** de la config vers l'extérieur : lit le classeur puis applique la vue |
| `lireConfig` | **Usage interne authentifié uniquement** — ne jamais renvoyer son résultat à un appelant non authentifié |

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
| `admin.html` | organisateur (clé admin) | Équipes, réglages, horaires, terrains & répartition, clubs invités, infos tournoi, **bloc Conformité FFR**, génération, publication. ⚠️ **Depuis la session 3, la clé est demandée au CHARGEMENT**, avant le rendu des réglages (auparavant : rendu d'abord, clé ensuite). Conséquence directe du filtrage : les contacts ne peuvent plus être servis sans authentification. Sans clé, état verrouillé courtois |
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
| **Dimensions de terrain réglementaires** | ❌ **deux valeurs fausses identifiées en session 4** dans `DIMENSIONS_CATEGORIE_DEFAUT` (`frontend/js/admin-terrains.js`) : `U12 = 56×45` est **la dimension de M14**, la bonne est **56×30** (M12 T+2, S21) ; `U10 = 40×30` n'est valable **qu'en jeu à 7**, en 5x5 c'est **30×25** (S18/S19). Seul `U8 = 30×20` est correct |
| **Le terrain dépend de la FORME, pas de la catégorie** | ❌ **découvert en session 4** — M10 joue sur 30×25 en 5x5 (sept–déc) puis sur 40×30 en jeu à 7 (janv–juin) : **la surface change de 60 % en cours de saison**. `dimensions_categories` est clé par catégorie seule ⇒ la répartition des terrains est fausse sur une moitié de saison |
| **Plafond de temps de jeu par joueur et par jour** | ❌ inconnu de l'app — M8 : 50 / 75 / 90 min ; M10 : 65 / 85 / 100 ; M12 et M14 : 65 / 90 / 110 (sur 1, 2 ou 3 demi-journées). Contrainte de **sécurité**, source S16–S22 |
| Blocage **dur** sur date fédérale | ⚠️ volontairement informatif à ce stade |
| Dates de plateaux du **Comité 92** | ❌ absentes du référentiel (le calendrier FFR est national) |
| **Exposition de la zone A de `Config` en lecture publique** | ✅ **fermée en session 3** — `lireConfigPublique` + liste blanche **opt-in**, trois vues, défaut fermé. Les huit champs personnels ne sortent plus d'aucune lecture publique. Vérifié en production : `?action=getConfig` et `?action=getAll` ne contiennent plus `referent_tel` |
| **Protection des données à venir** | ✅ le filtrage étant **opt-in**, tout paramètre ajouté dans `Config` est privé **par défaut**. Garanti par le test `testCfg_champInconnuNeSortPas` : si quelqu'un remplaçait un jour la liste blanche par une liste noire, ce test casserait |
| Cartons / discipline | ⛔ **hors périmètre, décidé en session 2** — la FDM EDR est la feuille de match officielle ; l'app n'introduira pas de données joueur |

**Tests** — `backend/Tests.gs`. Harnais autonome, sans Sheet ni effet de bord. Point d'entrée
`lancerTestsFFR()` (le bilan affiche désormais `R92 — n/n`, la suite ne couvrant plus seulement
la conformité). **66/66 OK** en production le 2026-07-27 : 32 asserts d'origine, +10 sur la
couverture de saison (session 2), +24 sur le filtrage et les jetons (session 3).

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
- ~~`construireSnapshot` → liste blanche~~ **fait en session 3.** Reste à surveiller : toute
  nouvelle page publique devra passer par `lireConfigPublique` avec une vue explicite, jamais par
  `lireConfig`
- **Jalons d'autorisation** → `demande_envoyee_le`, `autorisation_recue_le`, `autorisation_reference`,
  pièce jointe, statut. C'est ce qui débloque le **contrôle dur** repoussé depuis la session 1 :
  pas d'autorisation enregistrée ⇒ avertissement, puis blocage de la publication le jour où on
  le décide
- **Cloudflare Worker** → son activation est désormais liée au **succès** du modèle de trafic,
  pas à une hypothétique montée en charge. À allumer **avant** la première mise en avant, pas après

- **`RefFFR_Regles`** (à créer) → clé **catégorie × forme de jeu** : effectif sur le terrain,
  effectif maximum sur la feuille, longueur et largeur de terrain, taille de ballon, arbitrage,
  durée de carton, écart maximal d'essais, plateaux maximum par trimestre, `source`, `millesime`
- **`RefFFR_Temps`** (à créer) → clé **catégorie × nombre de demi-journées × nombre d'équipes** :
  rencontres totales, rencontres par équipe, périodes, durée de période, pause entre périodes,
  arrêt entre matchs, temps total, plafond de la catégorie.
  ⚠️ **La forme de jeu n'entre PAS dans cette clé** — vérifié sur les trois fiches M10 et les deux
  fiches M8, qui partagent exactement le même tableau de temps
- **`DIMENSIONS_CATEGORIE_DEFAUT`** → deux valeurs à corriger, et la clé à faire évoluer vers
  catégorie × forme (voir §1.8)
- **Règle des 5 essais d'écart** → présente sur **toutes** les fiches, M6 comprise : *score acquis
  définitivement et rééquilibrage obligatoire*. Utile à la table de marque, qui ne la connaît pas.
  Suppose de trancher Q21 (essais ou points ?)

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

## 1.11 — Positionnement : deux entités distinctes

Tranché le 2026-07-27. L'app modélisait **un** organisateur ; il en faut **deux**, aux rôles
disjoints.

| Entité | Rôle | Présence dans les documents FFR |
|---|---|---|
| **Racing 92** | **Organisateur au sens FFR.** Club affilié, labellisé EDR. C'est son code club, son président, son directeur de tournoi et son n° de licence qui figurent sur la demande d'autorisation et sur le rapport du représentant départemental. Il signe et il est responsable devant la ligue | ✅ partout |
| **Génération R92** | **Éditeur de l'outil.** Association, non affiliée FFR. Propriétaire de la page publique des scores et de son audience | ❌ nulle part |

**Conséquence sur l'écran « Amont / conformité »** : ce n'est pas un formulaire que l'association
remplit pour elle-même. C'est un **livrable remis au Racing, prêt à signer**. Ce qui était perçu
comme de l'hygiène de conformité est en réalité **le produit** — la contrepartie du partenariat.

**Modèle de partenariat** : l'association fournit l'outil (création de tournoi, centralisation,
gain de temps) ; en échange, les scores sont diffusés sur le site de l'association, ce qui génère
du trafic, et la page des scores accueille les sponsors de l'association. Aucun flux financier
entre les deux structures.

**Atout à faire valoir** : l'app **ne contient aucune donnée de joueur** — ni nom, ni licence, ni
date de naissance. La page publique n'affiche que des noms d'équipes et des scores. Conséquence
directe de la décision « cartons hors périmètre » (session 2). Pour un club qui expose des enfants
de 6 à 12 ans, c'est un argument de premier plan.

**Séparation technique** : `admin.html` est protégée par clé et **ne sera jamais publique** ;
`tournoi.html` est la seule surface exposée. La faiblesse ne venait pas de la séparation mais de
ce que la lecture publique transportait — **corrigé en session 3**. La page des scores ne reçoit
plus que trois paramètres, aucun personnel. **Le verrou technique à la mise en avant est levé** ;
restent les verrous contractuels (Q15, Q16, Q17).

**Diffusion sur le site de l'association** : commencer par une **iframe** de `tournoi.html` dans
une page du site — aucune duplication de code, page maintenue à un seul endroit, emplacements
sponsors disposés autour de l'iframe donc sur la page de l'association. L'hébergement natif
(deuxième copie du JavaScript) n'est pas recommandé à ce stade.

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
| **S15** | **Règlement Moins de 6 ans — Premiers pas à l'École de Rugby** (`a01`) | Rugby éducatif **2026-2027**, MAJ du **17/06/2026** | 2026-07-27 | **session 4** |
| **S16** | **Règlement Moins de 8 ans — Toucher + 2 secondes** (`b02`) | idem | 2026-07-27 | session 4 |
| **S17** | **Règlement Moins de 8 ans — Jouer au contact** (`b03`) | idem | 2026-07-27 | session 4 |
| **S18** | **Règlement Moins de 10 ans — Toucher + 2 secondes** (`b04`) | idem | 2026-07-27 | session 4 |
| **S19** | **Règlement Moins de 10 ans — Jouer au contact** (`b05`) | idem | 2026-07-27 | session 4 |
| **S20** | **Règlement Moins de 10 ans — Jeu à 7** (`b06`) | idem | 2026-07-27 | session 4 |
| **S21** | **Règlement Moins de 12 ans — Toucher + 2 secondes** (`c07`) | idem | 2026-07-27 | session 4 |
| **S22** | **Règlement Moins de 14 ans — Toucher + 2 secondes** (`c10`) | idem | 2026-07-27 | session 4 |
| S23 | Règlement Super Challenge de France — **Jeu à XV** M14/M15F | 2026-2027 | 2026-07-27 | session 4 — *hors périmètre tournoi club* |
| S24 | Règlement Super Challenge de France — **Sevens** M14/M15F | 2026-2027 | 2026-07-27 | session 4 — *hors périmètre tournoi club* |

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

## Session 2 bis — 2026-07-27 — Positionnement, partenariat et exposition publique

**Document du jour** : aucun. Session de décision, faisant suite aux questions Q12 et Q13
ouvertes en session 2.

### Tranché

- **Q12 close** — c'est le **Racing 92** qui dépose la demande d'autorisation. Club affilié,
  code club, sous couvert de son président. Génération R92 n'apparaît pas dans le circuit fédéral.
- **Q13 à moitié** — le label EDR du Racing est **confirmé**. La **date du dernier label**, champ
  obligatoire du formulaire, reste à obtenir. Réponse partielle ⇒ la question reste ouverte.
- **Positionnement à deux entités** formalisé (voir §1.11).
- **Modèle de partenariat** : outil contre diffusion des scores et emplacement sponsors.

### Flux d'autorisation — arbitrage

Deux approches ont été mises en regard :

- **Pré-remplissage** du formulaire d'autorisation par l'app ;
- **Enregistrement** de l'autorisation : l'EDR envoie le document comme d'habitude, le document
  signé revient, le Racing l'alimente dans l'admin.

**Retenu : l'enregistrement d'abord.** Trois raisons. Le circuit fédéral est **papier, à trois
signatures successives** (club → comité → ligue) : aucun logiciel ne le remplacera. La moitié du
formulaire est de la donnée **club** que l'app n'a pas (code club, président, date du label,
assurance, restauration). Et surtout, un document pré-rempli mais **non autorisé n'empêche rien** :
c'est l'enregistrement de l'autorisation qui débloque le contrôle dur repoussé depuis la session 1.

**Si le pré-remplissage est repris plus tard, ne pas reproduire le formulaire FFR** : produire une
**fiche de préparation** listant, dans l'ordre du formulaire, les seules valeurs que l'app sait
calculer (matchs par équipe, durée de match, 1 ou 2 phases, nombre d'équipes et de clubs, terrains,
horaires). 90 % du gain de temps, 10 % du risque, et rien à refaire quand la FFR republie son PDF.

### Découvert — exposition de la zone A de `Config`

`construireSnapshot` renvoie `lireConfig()` **sans aucun filtre**. L'action `getAll`, publique et
sans clé, appelée toutes les ~15 s par la page des scores, transporte donc **toute la zone A** :
`referent_nom`, `referent_tel`, `securite_referent_nom`, `securite_referent_tel`. L'adresse du
backend est en clair dans `frontend/js/config.js` (dépôt public) et dans le code source de la page.

La page **n'affiche** pas ces valeurs — mais elles **arrivent** dans le navigateur de chaque
visiteur. Vérifiable en ouvrant l'URL du backend suivie de `?action=getAll`.

Rien n'a changé techniquement ; ce qui change, c'est le **nombre de gens qui passent devant**. Le
modèle de partenariat consiste précisément à amener du trafic sur cette page. **À corriger avant
la mise en avant, pas après.** Voir §1.8 et §1.9.

### Conséquence sur le relais CDN

Le Cloudflare Worker, codé et dormant depuis l'origine, change de statut : son activation n'est
plus une hypothèse de montée en charge mais la **conséquence attendue du succès** du modèle. Apps
Script a des quotas journaliers de durée d'exécution ; plusieurs centaines de parents rafraîchissant
la même page pendant trois heures, c'est le scénario pour lequel le relais a été écrit.

### Tension à surveiller

Le briefing officiel FFR (S10) insiste : les matchs sont des moments d'apprentissage, *« ce n'est
pas la coupe du monde »*. Le modèle repose sur une page de résultats attractive. Ce n'est pas
contradictoire, mais ce n'est pas neutre. Si la ligue ou le club regarde un jour cette page, mieux
vaut qu'elle valorise l'ensemble des participants qu'un classement agressif — l'app sait déjà le
faire, avec le format `LIBRE` sans classement, recommandé pour les plus jeunes.

**Prompt Claude Code produit** : `PATCH-AUDIT-S2BIS.md` (documentation seule).

---

## Session 3 — 2026-07-27 — Fermeture de la lecture publique

**Document du jour** : aucun. Session technique, suite directe de la découverte de la session 2 bis.

### L'inventaire d'abord, le mécanisme ensuite

Trois options de protection avaient été mises sur la table (jeton sur le dossier / séparer les
alimentations / retirer le téléphone). **Romain a refusé de choisir avant l'inventaire**, avec
deux exigences : savoir s'il n'y avait pas d'autres données sensibles, et protéger aussi **les
données à venir**.

Bien lui en a pris. L'inventaire a montré que la description initiale était **fausse sur deux
points** :

- **8 champs personnels**, pas 4 : `referent_nom/_tel`, `securite_referent_nom/_tel`,
  `contact_reponse_nom/_tel/_email`, `email_expediteur` ;
- **trois portes sans clé**, pas une : `getAll` → `construireSnapshot` → `lireConfig()`,
  **`getConfig` → `lireConfig()` en direct**, et `getClubDossier?club=NOM` qui renvoie un prénom.

La correction prescrite en session 2 bis (liste blanche dans `construireSnapshot`) aurait donc
laissé `getConfig` grande ouverte, tout en donnant le sentiment que le problème était réglé.

Et la seconde exigence a dicté l'architecture : filtrage **opt-in** (« rien ne sort sauf ce qui
est autorisé ») plutôt qu'opt-out, dans **une seule fonction** que toutes les portes appellent.

### Décision — option A, le jeton

`dossier-club.html` passe au **jeton**. Motif : filtrer le backend ne protège pas une valeur
qu'une page publique affiche de toute façon. Le dossier expose aussi le poste de secours, le
parking et les tarifs — une page destinée à dix clubs invités, pas au web ouvert. Le `club_token`
existait déjà (UUID persistant, attribué à tous les clubs, avec reprise automatique) et protégeait
déjà `reponse-invitation.html` : aucune tuyauterie à inventer.

### Décision 1.3 — deux contacts, pas un

`invitation-club.html` est **générique par conception** : aucun jeton possible sans la dénaturer.
La question posée était : garde-t-on le téléphone sur cette vitrine ?

Romain a d'abord objecté qu'un appel vaut mieux qu'un mail sur un tournoi. L'objection a révélé
une confusion qu'il fallait lever, et qui mérite d'être consignée : **ce sont deux contacts
distincts**.

| Champ | Usage | Où | Quand |
|---|---|---|---|
| `contact_reponse_tel` | question d'inscription | vitrine **publique** | J-90 → J-60 |
| `referent_tel` | contact **jour J** | dossier, **derrière le jeton** | le samedi matin |

**Retenu** : `contact_reponse_tel` retiré de la vue `invitation` (nom + email conservés) ;
`referent_tel` **inchangé** dans la vue `club`, avec son lien cliquable `tel:`. Le numéro du jour J
n'a jamais été menacé — il change de porte, pas de disponibilité.

**Note d'organisation** (hors code) : mettre le numéro du jour J sur **l'affiche** et le **plan des
terrains**. Sur un tournoi, le contact d'urgence ne doit pas dépendre d'une page web qui charge.

### Objection majeure de Claude Code — acceptée

`apiGet` **n'envoie aucune clé** : toutes les lectures `doGet` sont publiques, sans exception. Or
l'administration peuplait ses formulaires depuis `getAll` et `getConfig` **en huit endroits**.
Filtrer sans rien d'autre aurait affiché des formulaires **vides**, et un ré-enregistrement aurait
écrit du vide sur les contacts via `ecrireChampsConfig` — **perte de données silencieuse**, pire
que le problème corrigé.

→ Quatrième voie créée : **`getConfigAdmin`**, en `doPost` avec clé admin. La clé n'a rien à faire
dans une URL, où elle finirait dans l'historique du navigateur et les journaux serveur.

**Ajout de l'audit** : `doPost` prend le verrou d'écriture **avant** le `switch`. Une lecture par
cette voie l'aurait pris huit fois par chargement, en concurrence avec la saisie des scores.
`ACTIONS_LECTURE` répond donc **après** la vérification de clé et **avant** la prise du verrou.

### Résultat — test adversarial

Config piégée (huit champs personnels + un champ inventé `parametre_invente_de_2027`) :

| Vue | Champs sortis | Sensibles |
|---|---|---|
| `live` | 2 | aucun |
| `invitation` | 3 | `contact_reponse_nom`, `contact_reponse_email` |
| `club` *(jeton)* | 5 | `referent_nom/_tel`, `securite_referent_nom/_tel` |
| vue inconnue | 2 | aucun — retombe sur `live` |

Le champ inventé **ne sort d'aucune vue**. `email_expediteur` non plus : il n'est lu par aucune
page, il ne figure dans aucune liste.

**Résumé d'exécution** : branche `fix/lecture-publique-liste-blanche`, PR **#83**, 2 commits,
7 fichiers, **+417 / −107**, tests **66/66 OK**. Mergée en `6306d27`.

**Écarts déclarés**, tous acceptés : périmètre admin plus large que prévu (6 points de chargement
re-routés via un helper `lireConfigAdmin`) ; changement de comportement de la page admin (clé au
chargement) ; `dossier.js` entièrement basculé sur `getConfigClub`, ne dépendant plus du tout de
`getAll` ; les deux clés de cache versionnées `_v2`, dont celle de **6 h** — le prompt annonçait
10 s, c'était faux.

**Vérification en production** : redéploiement, `66/66` dans l'éditeur, page admin qui demande la
clé puis charge les infos, puis le test qui avait servi à démontrer le problème — `?action=getConfig`
et `?action=getAll`, avec un **contrôle positif** (`tournoi_nom` doit être trouvé) avant le test
négatif (`referent_tel` doit être introuvable). Conforme sur les quatre combinaisons.

### Conséquence opérationnelle

Les **liens de dossier envoyés avant le 2026-07-27 ne fonctionnent plus** : ils affichent un
message courtois renvoyant vers l'email de l'organisateur. Tout dossier Phase 2 déjà transmis doit
être renvoyé.

### Leçon de méthode

**L'inventaire avant le mécanisme.** Le choix du dispositif de protection était sur le point d'être
tranché sur une description fausse — quatre champs au lieu de huit, une porte au lieu de trois.
C'est le refus de choisir avant d'avoir la liste complète qui a évité une correction cosmétique.
À rejouer systématiquement : *avant de décider comment protéger, établir ce qu'il y a à protéger,
et vérifier que le dispositif couvre ce qui n'existe pas encore.*

**Prompt Claude Code produit** : `PROMPT-CLAUDE-CODE-S3.md`, deux phases, avec la décision 1.3 et
la validation de l'objection majeure envoyées entre les deux.

---

## Session 4 — 2026-07-27 — Fiches « règles du jeu » et extension à U6 / U14

> ⚠️ **SESSION SUSPENDUE, PAS TERMINÉE.** Rien n'a été codé, aucune PR ouverte. Cette entrée
> enregistre l'état d'avancement.

**Origine** : demande de Romain d'étendre le périmètre de l'app à **U6** et **U14**.

**Documents du jour** : **8 fiches « règles du jeu »** (S15–S22), toutes datées de la
**MAJ du 17/06/2026**, plus **2 règlements Super Challenge de France** (S23, S24).

**Méthode retenue, sur proposition de Romain** : ne pas auditer les fiches une par une, mais
traiter **la famille**. Les fiches partagent un gabarit ; on conçoit la structure contre le cas
le plus simple (M6) **et** le cas le plus dur (M14) en même temps, pour ne pas la refaire.

### Ce qui existait déjà, et qu'on ignorait

- **`RefFFR_Formes` couvre déjà M5, M6, M8, M10, M12 et M14/M15F** — 60 lignes = 6 catégories ×
  10 mois. La session 1 avait tout chargé, pas seulement le périmètre d'alors. Le moteur de
  conformité sait donc déjà lire M6 et M14 ; il ne les regardait pas, faute de catégorie présente.
- **U14 est déjà à moitié implémentée** : présente dans le seed `Config`, et traitée
  spécifiquement par la répartition des terrains (`U14: { plein: true }` — un match occupe un
  grand terrain entier).
- **U6 n'existe nulle part** dans le code.

### ⚠️ Erreur d'analyse corrigée par le document

Sur la seule foi de la ligne « ateliers rugby » de la grille du calendrier, il avait été affirmé
que **la FFR ne prévoyait pas de matchs en M6**, qu'il n'y avait « ni score, ni classement, ni
podium », et un choix avait été proposé entre *matchs sans score* et *rotation d'ateliers*.

Le règlement M6 (S15) dit l'inverse :

> « Les plateaux ou tournois sont **obligatoirement organisés sous la forme de poules (brassage
> et de niveaux)**. »

Il y a des essais, un score, et une règle d'écart. **Le modèle de l'app est exactement le modèle
FFR** — poules de brassage le matin, poules de niveau l'après-midi. Le choix proposé n'avait pas
lieu d'être, et U6 est bien moins coûteux à intégrer qu'annoncé.

**Leçon** : une grille de calendrier n'est pas un règlement. Ne pas conclure d'une synthèse ce
qu'un texte dédié peut contredire.

### Le gabarit tient

Rubriques **structurantes** (donnée exploitable), constantes sur les huit fiches : nombre de
joueurs, remplacements et effectif maximum, terrain, ballon, arbitrage, jeu déloyal (2 minutes),
marque (essai = 5 points), 5 essais d'écart, tableau des temps, rappel poules / phases finales
interdites.

Rubriques **pédagogiques**, variables : utilisateurs, opposants, consignes d'arbitrage, remises
en jeu. **Hors périmètre de l'app** — c'est l'affaire des éducateurs.

**M6 est l'exception** : pas de grille de matchs, un seul tableau de temps (pas de distinction
1 / 2 demi-journées), et la seule fiche portant *« 1 ou 2 plateaux maximum par trimestre »*.

### Trois découvertes

**1. Le temps dépend de la catégorie, pas de la forme de jeu.** Les trois fiches M10 (T+2, JCO,
jeu à 7) partagent **exactement** le même tableau ; idem pour les deux fiches M8. `RefFFR_Temps`
se clé donc sans la forme.

Plafonds de temps de jeu par joueur et par jour :

| | 1 demi-journée | 2 demi-journées | 3 demi-journées |
|---|---|---|---|
| M8 | 50 min | 75 min | 90 min |
| M10 | 65 min | 85 min | 100 min |
| M12 | 65 min | 90 min | 110 min |
| M14 | 65 min | 90 min | 110 min |

**2. Le terrain dépend de la forme — donc il change en cours de saison.** M10 joue sur 30×25 en
5x5 puis sur 40×30 en jeu à 7 : **+60 % de surface**, au changement de forme de janvier. L'app a
une valeur fixe par catégorie.

**3. La FFR prescrit littéralement l'architecture de l'app.** La ligne « 6 équipes » de chaque
tableau dit : *poules de brassage = 2 poules de 3, puis poules de niveau = 2 poules de 3*. C'est
`reorganiserPoulesMatin` suivi de `genererApresMidi` en `CROISE`. Ce n'est plus une convergence
heureuse, c'est une **conformité démontrable**.

### Dimensions relevées (en-but non compris, sauf M6)

| Catégorie | Forme | Terrain | Ballon | Effectif max / feuille |
|---|---|---|---|---|
| M6 | Premiers pas (4 ou 5) | **22 × 15** *(plus en-buts)* | T3 | non précisé |
| M8 | T+2 et JCO (5x5) | **30 × 20** | T3 | 9 |
| M10 | T+2 et JCO (5x5) | **30 × 25** | T3 | 9 |
| M10 | Jeu à 7 | **40 × 30** | T3 | 13 |
| M12 | T+2 (5x5) | **56 × 30** | T4 | 9 |
| M14 | T+2 (7x7) | **56 × 45** | T4 | 13 |

### Confirmation

Le barème de l'app — **Victoire 3, Nul 2, Défaite 1** — est **exactement** celui du règlement SCF
(S23). Ce n'est plus une convention maison : c'est le barème fédéral, désormais sourcé.

### Structure proposée (hypothèse, non validée)

Deux nouveaux onglets, sur le modèle des deux `RefFFR_*` existants — voir §1.9.

### Écarts et coquilles consignés

1. **M6, ligne « 7 équipes »** : 6 rencontres × 2 périodes × 5' = 60 minutes, alors que le tableau
   annonce 30. Les trois autres lignes sont cohérentes. Sans conséquence pratique.
2. **M6, lignes à 1 période** : une « pause entre 2 périodes » est indiquée, sans objet.
3. **Pieds de page** : les fiches M8 JCO, M10 JCO et M10 jeu à 7 portent « saison 2025-2026 » sur
   leur seconde page, alors que le document est 2026-2027. Coquille éditoriale — **la MAJ du
   17/06/2026 fait foi**.
4. **Grilles de matchs à 3 équipes** (M8 JCO, M10 JCO) : « A—AC / B—BC » au lieu de AB/AC/BC.
   Coquille ; le total annoncé (3 matchs) est juste.

### Les deux règlements SCF

D'une autre nature : ce sont des règlements de **compétition**, applicables aux phases 2, 3 et
journées de clôture du Super Challenge — **pas à un tournoi de club**. Enregistrés comme sources,
sans effet direct.

Deux points à retenir tout de même : le barème confirmé ci-dessus, et un **modèle d'organisation
triangulaire où l'équipe qui ne joue pas arbitre** (Match 1 : Équipe 1 vs Équipe 3, arbitrage
Équipe 2). Transposable si l'on veut un jour le proposer en option.

### ⚠️ Transmission incomplète — la liste des sources est partielle par accident

**Cause** : l'analyse a demandé l'envoi de **tous** les documents en une fois (« envoie-les tous
d'un coup, sans les trier »), alors que Romain avait proposé à deux reprises de procéder par
étapes — d'abord U6, puis la question du gabarit. Un message de dépassement de limite est survenu
pendant le chargement, et un tour de conversation est resté sans réponse.

**S15 à S24 enregistrent ce qui a été réellement lu et analysé** — pas ce qui a été envoyé.

Conséquence à connaître pour un lecteur futur : les documents absents ont produit des **trous**
identifiés, jamais des valeurs fausses. Le tableau des dimensions ci-dessus compte six lignes
parce que six couples catégorie × forme ont été lus, pas parce que les autres seraient inconnus
de la FFR.

**Leçon de méthode** : « l'inventaire avant le mécanisme » (session 3) ne veut pas dire « tout
charger d'un coup ». Un corpus se transmet **par lots vérifiables** — deux ou trois documents par
tour, avec accusé de ce qui est arrivé. Quand l'utilisateur propose une progression, elle vaut
mieux que le volume : elle rend la perte détectable.

### ⚠️ Erreur de déduction, corrigée par Romain

Il avait été déduit, à partir du nommage des fichiers et du fait que les règlements SCF citent
nommément « C13 » et « C14 », que la collection **s'arrêtait à `c14`** et qu'il manquait
exactement six fiches.

**Faux** : il existe au moins un `c15`, et deux règlements Super Challenge supplémentaires.
Une borne citée dans un document n'est pas la fin d'une collection.

### Documents manquants

| Manquant | Contenu | Criticité |
|---|---|---|
| `c08` | M12 — Jouer au contact | moyenne |
| **`c09`** | **M12 — Jeu à 10** | **haute** — U12 joue en RE 10x10 de **décembre à juin** |
| `c11` · `c12` | M14 — JCO · Jeu à 10 *(contenu déduit, à confirmer)* | selon décision U14 |
| `c13` | M14 — Jeu à 15 | *cité nommément par S23* |
| `c14` | M14 — Jeu à 7 | *cité nommément par S24* |
| **`c15`** | **contenu inconnu** — signalé par Romain, non déduit | à identifier |
| **2 règlements SCF** | **contenu inconnu** — en plus de S23 et S24 déjà reçus | à identifier |

Source : ffr.fr, rubrique *Jouer au rugby → École de rugby → Rugby éducatif*.

### Décisions

- **U6 — tranché par document** : le modèle de l'app convient tel quel (poules de brassage puis
  poules de niveau, matchs, essais). Aucune refonte nécessaire.
- **U14 — OUVERT** : jeu à X ou jeu à XV ? Voir **Q20**.
- **Mesure empirique non faite** : ajouter U6 et U14 comme catégories présentes en admin, saisir
  une date réaliste et relever les dates devenues bloquantes. Le contrôle filtre par catégorie
  présente ; les journées Challenge Fédéral et Super Challenge sont marquées M14 dans
  `RefFFR_Dates` et vont s'activer. **À faire avant tout engagement de date auprès des clubs.**

### État à la suspension

Rien codé. Aucune PR. Aucun prompt Claude Code produit. La structure des deux onglets reste une
hypothèse à valider une fois les six fiches manquantes obtenues.

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
| **Q11** | **Source des dimensions de terrain.** ✅ **Résolue pour six couples catégorie × forme** par les fiches S15–S22 (voir session 4) : M6 22×15, M8 30×20, M10 5x5 30×25, M10 jeu à 7 40×30, M12 T+2 56×30, M14 T+2 56×45. ⚠️ **Le chiffre du pré-audit pour M12 (56×45) était faux** — c'est la valeur M14, et elle est passée dans le code. **Reste ouverte** pour les formes en Rugby Éducatif (M12 jeu à 10, M14 jeu à 10 / 15 / 7), faute des fiches `c09`, `c12`, `c13`, `c14`. | vérification Romain | ⏳ **partiellement résolue** |
| **Q12** | **Qui dépose la demande d'autorisation ?** → C'est le **Racing 92**, club affilié et labellisé EDR, sous couvert de son président. Génération R92 est éditeur de l'outil, pas organisateur au sens FFR. Voir §1.11. | Comité 92 / Racing 92 | ✅ **résolue (club)** |
| **Q13** | **Date du dernier label EDR du Racing 92.** Le label est **confirmé** ; seule la **date**, champ obligatoire du formulaire d'autorisation, reste à obtenir. *Réponse partielle : la question reste ouverte conformément aux règles de clôture.* | vérification Romain | ⏳ ouverte |
| **Q14** | **Symétrie de la règle des 72 h.** Les feuilles de présence (S9, S11, S12) n'engagent que le **passé** (« 3 jours francs précédents »), alors que l'app contrôle **avant et après**. L'art. 230-2 est-il bien symétrique ? *L'implémentation actuelle est la plus prudente des lectures relevées — on ne change rien tant que ce n'est pas tranché.* | vérification Romain / Comité 92 | ⏳ ouverte |
| **Q15** | **Convention écrite Racing 92 ↔ Génération R92.** L'association diffuse les scores d'une manifestation dont le Racing est responsable, et monétise l'audience de cette page. Accord écrit du club nécessaire sur les **deux** volets : publication des scores, et présence de sponsors sur la page. Protège autant l'association que le club, et survit à un changement de dirigeant. | Racing 92 | ⏳ ouverte |
| **Q16** | **Catégories de sponsors admissibles.** L'audience est composée de parents d'enfants de 6 à 12 ans, dans un cadre sportif fédéral. Au moins trois régimes à vérifier : loi Évin (alcool exclu du parrainage sportif), publicité des jeux d'argent visant les mineurs, messages sanitaires obligatoires sur la publicité alimentaire. **À faire regarder une fois par une personne qualifiée, avant tout engagement avec un sponsor.** | conseil juridique | ⏳ ouverte |
| **Q17** | **Usage des marques.** L'écusson « École de Rugby », le logo #BienJoué et les marques du Racing 92 n'appartiennent pas à l'association. Leur affichage sur une page comportant des sponsors est une question distincte de la convention avec le club. | Ligue IDF / Racing 92 | ⏳ ouverte |
| **Q18** | **Adresse de rôle pour `contact_reponse_email`.** Cette adresse reste publique sur la vitrine (décision 1.3, S3). Est-ce aujourd'hui une adresse **personnelle** ou une adresse de **rôle** (type `tournoi@…`) ? Une adresse de rôle survit aux changements de bénévole et n'expose personne. *Réglage de donnée dans `Config`, pas de code.* | vérification Romain | ⏳ ouverte |
| **Q19** | **Documents manquants — la collection lue est incomplète.** Fiches « règles du jeu » : `c08`, `c09`, `c11`, `c12`, `c13`, `c14` et **`c15`** (contenu inconnu, la déduction « la collection s'arrête à c14 » était fausse). Plus **deux règlements Super Challenge de France** en sus de S23 et S24. **`c09` est la plus urgente** : U12 joue en Rugby Éducatif 10x10 de décembre à juin, et c'est précisément la dimension de terrain aujourd'hui fausse dans le code. Récupérer la **liste exhaustive des fichiers** de la rubrique avant de conclure quoi que ce soit sur le périmètre. Source : ffr.fr, *Jouer au rugby → École de rugby → Rugby éducatif*. | vérification Romain | ⏳ ouverte |
| **Q20** | **U14 : jeu à X ou jeu à XV ?** Les deux pratiques sont autorisées au même mois, avec des effectifs, des passeports et des terrains différents. La FFR demande même que les clubs puissent basculer de l'une à l'autre en cours de saison. Détermine quelles fiches sont nécessaires et quels contrôles ajouter. | décision Romain | ⏳ ouverte |
| **Q21** | **La table de marque saisit-elle des essais ou des points ?** Le backend stocke `score_A` / `score_B` sans unité. Toutes les fiches posent la règle des **5 essais d'écart** (score acquis, rééquilibrage obligatoire) : elle n'est implémentable que si l'unité est l'essai, sinon il faut convertir (essai = 5 points). | vérification Romain | ⏳ ouverte |
