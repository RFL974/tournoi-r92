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

**Règle transverse** — Toute règle inscrite dans l'app est **sourcée** : quel document, quel
millésime. Voir le *Registre des sources* en tête de Partie 2.

---

# PARTIE 1 — État de l'app

> ⚠️ Cette partie est **réécrite intégralement à chaque session**.
> **Version de référence lue** : commit de merge `dfbeec1` du 2026-07-25 (branche `main`,
> `RFL974/tournoi-r92`, PR #81). Backend Apps Script **redéployé en production** le même soir.

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
qui touche au backend.

## 1.2 — Onglets Google Sheets

| Onglet | Contenu | Colonnes notables |
|---|---|---|
| `Config` | Zone A (réglages globaux, paires paramètre/valeur) + Zone B (une ligne par catégorie) | voir 1.3 |
| `Equipes` | Une ligne par équipe | `id_equipe`, `nom_equipe`, `categorie`, `poule`, `source` (`auto`/`manuel`) |
| `Poules` | Définition des poules | `id_poule`, `categorie`, `nom_poule` |
| `Matchs` | Une ligne par match | `id_match`, `categorie`, `poule`, `terrain`, `heure_debut`, `heure_fin`, `equipe_A`, `equipe_B`, `score_A`, `score_B`, `statut`, `phase`, `format`, `sous_tableau`, `tour`, `match_suivant`, `place_suivant`, `vainqueur` |
| `Historique` | Journal de saison, jamais effacé | `date`, `tournoi_id`, `id_match`, `categorie`, `phase`, `equipe_A`, `equipe_B`, `score_A`, `score_B` |
| `ClubsInvites` | Carnet d'adresses + suivi des deux phases | `club_nom`, `club_contact_prenom/nom/email`, `statut`, `date_ajout`, `categories_engagees`, `invitation_envoyee`, `dossier_envoye`, `club_token`, `date_reponse`, `nb_equipes_par_categorie`, `nb_joueurs_total`, `alerte_ecart` |
| **`RefFFR_Formes`** ⭐ | Référentiel des formes de jeu, 60 lignes (6 catégories × 10 mois) | `categorie`, `mois`, `forme_jeu`, `effectif`, `tournoi_autorise`, `note`, `source`, `millesime` |
| **`RefFFR_Dates`** ⭐ | Référentiel des dates fédérales, 74 lignes | `date`, `type`, `libelle`, `zone`, `categories`, `bloque_tournoi_club`, `source`, `millesime` |

`ClubsInvites` contient des emails : **jamais** exposé dans `getAll`, le cache ni le relais CDN.
Les deux onglets `RefFFR_*` ne contiennent **aucune donnée personnelle** : lecture publique assumée.

**Note d'import** — Les colonnes `date` et `mois` ont été converties en objets `Date` par Google
Sheets à l'import CSV. Ce n'est pas un problème : le backend normalise à la lecture (voir 1.4).

## 1.3 — Config, Zone B (réglages par catégorie)

`categorie`, `presente`, `terrains`, `terrains_auto`, `nb_poules`, `format_mi_temps`,
`duree_mi_temps_min`, `pause_mi_temps_min`, `recup_entre_matchs_min`, `format_apresmidi`,
`param_format`, `reglement`, `effectif_min`, `effectif_max`, `arbitrage_organisation`,
`max_equipes_par_club`.

**Zone A — nouveau paramètre** : `zone_vacances` (défaut `C`, Île-de-France). Absent = traité
comme `C`.

Toutes les colonnes récentes bénéficient d'une **migration douce** (ajout automatique à droite,
vide = comportement historique).

## 1.4 — Actions backend (47)

**Lecture (`doGet`, 12)** — `ping`, `getConfig`, `getEquipes`, `getPoules`, `getMatchs`, `getAll`,
`getClassement`, `getHistorique`, `getClubDossier`, `getReponseInvitation`, **`getRefFFR`** ⭐,
**`getConformiteFFR`** ⭐

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
| `evaluerConformiteFFR` | **cœur pur et testable**, référentiel injecté, ne lit aucun classeur |
| `verifierConformiteFFR` | wrapper : lit le classeur puis délègue au cœur pur |
| `analyserEffectifsCategories` | compte les équipes par catégorie présente → `{ bloque, vides }` |

## 1.5 — Pages frontend

| Page | Public | Rôle |
|---|---|---|
| `tournoi.html` | public | Page live : onglets *Mon équipe* / *Classements*, filtre catégorie, podium, refresh ~15 s |
| `admin.html` | organisateur (clé admin) | Équipes, réglages, horaires, terrains & répartition, clubs invités, infos tournoi, **bloc Conformité FFR** ⭐, génération, publication |
| `saisie.html` | table de marque (clé scores) | Saisie des scores, filtre catégorie + grand terrain, verrouillage |
| `perfs.html` | interne | Bilan tournoi + cumul de saison par adversaire |
| `invitation-club.html` | public | Invitation Phase 1 (version web complète) |
| `reponse-invitation.html` | club (jeton) | Réponse en libre-service : accepte/décline, catégories, nb d'équipes, nb de joueurs |
| `dossier-club.html` | public | Dossier Phase 2 personnalisé : format sportif, jour J, logistique, QR live, autorisation droit à l'image en `.docx`, **mentions licence FFR + FDM EDR** ⭐ |

Nouveau fichier : `frontend/js/admin-conformite-ffr.js` (restitution du verdict et de la forme
attendue), avec son miroir `normaliserCategorieFFR`.

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

Quatre formats implémentés, sélectionnés par catégorie via `format_apresmidi` :

| Format | Statut FFR EDR | Implémentation |
|---|---|---|
| `CROISE` | ✅ conforme | Défaut historique (vide = CROISE) |
| `CROISE_DIAGONAL` | ✅ conforme | Rangs consécutifs croisés entre poules |
| `LIBRE` | ✅ conforme | Matchs amicaux, sans classement |
| `COUPE_PLATEAU` | ❌ **interdit en EDR** | Bracket complet : `construireBracketCoupe`, `propagerVainqueurBracket`, `majPetiteFinale`, `invaliderMatchAval`, départage manuel `vainqueur`. **Toujours proposé sans réserve dans l'admin** — masquage à faire |

## 1.8 — État de la conformité FFR

| Point de conformité | État |
|---|---|
| Onglets `RefFFR_Formes` / `RefFFR_Dates` | ✅ créés, remplis, lus |
| Formes de jeu par catégorie et par mois | ✅ en donnée, jamais en dur, affichées en admin |
| Contrôle « minimum 3 équipes » par catégorie | ✅ blocage dur en tête de `genererPoulesEtPlanning`, avant toute écriture ; 0 équipe = avertissement |
| Dates fédérales bloquantes | ✅ contrôle informatif, filtré par zone et par catégorie |
| Règle des **72 heures** (art. 230-2 RG) | ✅ implémentée (`\|écart\| ≤ 3 jours`, avant ou après) |
| Zone de vacances scolaires | ✅ `zone_vacances`, défaut `C` |
| Mention « joueurs licenciés FFR » | ✅ dossier Phase 2 |
| Mention **FDM EDR** | ✅ dossier Phase 2 |
| Traçabilité des sources | ✅ colonnes `source` + `millesime` dans les deux onglets |
| Migration douce (référentiel absent) | ✅ prouvée en conditions réelles : bandeau gris, zéro erreur, app inchangée |
| Masquage de `COUPE_PLATEAU` en EDR | ❌ à faire |
| Demande d'autorisation (art. 411-2 RG) — dates, n° d'autorisation, dépôt | ❌ aucun champ, aucune checklist |
| Jalons amont (J-90 / J-60 / J-45) | ❌ deux dates limites existent, non reliées à un rétroplanning |
| Dimensions de terrain réglementaires | ⚠️ `dimensions_categories` existe (JSON manuel), non contraint — **source à confirmer** |
| Blocage **dur** sur date fédérale | ⚠️ volontairement informatif à ce stade |
| Dates de plateaux du **Comité 92** | ❌ absentes du référentiel (le calendrier FFR est national) |

**Tests** — `backend/Tests.gs` (nommé `Test.gs` côté éditeur Apps Script, sans incidence :
Apps Script partage la portée entre fichiers). Harnais autonome, sans Sheet ni effet de bord.
Point d'entrée `lancerTestsFFR()`. **32/32 OK** en production le 2026-07-25.

## 1.9 — Points d'ancrage pour la suite

- **`RefFFR_Dates`** → accueillera les dates du **Comité 92** via la colonne `source`
- **Zone A de `Config`** → paramètres de rétroplanning et d'autorisation
- **`admin-reglages.js` / `formulaireCategorie()`** → masquage de `COUPE_PLATEAU` (ce sont des
  **cartes**, pas un tableau)
- **`invitation-club.html`** → années de naissance éligibles par catégorie
- **Tournoi du 92** — le comité organise son propre tournoi départemental des écoles de rugby
  (M8 à M14, historiquement en juin). C'est une date bloquante absente du calendrier national, à
  ajouter à `RefFFR_Dates` avec `source = CD92`.
- Un **écran « Amont / conformité »** dans l'admin reste à créer : seul vrai manque structurel

**Dette identifiée** : `normaliserCategorie` (backend) a un miroir `normaliserCategorieFFR`
(frontend). Deux implémentations d'une même règle, susceptibles de diverger. Acceptable
aujourd'hui — la logique est triviale et la source de vérité reste le backend testé — mais à
surveiller. Même situation que le barème de classement, déjà dupliqué et documenté.

---

# PARTIE 2 — Journal des sessions

> On ajoute, on n'efface jamais.

## Registre des sources

| # | Document | Millésime | Date de lecture | Sessions concernées |
|---|---|---|---|---|
| S1 | Règlements Généraux FFR, Titre IV, art. 411-2 | 2019-2020 *(à revérifier)* | 2026-07 | pré-audit |
| S2 | Formulaire de demande d'autorisation de tournoi EDR | à confirmer | 2026-07 | pré-audit |
| S3 | Cahier des charges École de Rugby | 2025-2026 | 2026-07 | pré-audit |
| **S4** | **Calendrier Fédéral Écoles de Rugby (FFR-CNEDR) + Note d'accompagnement** | **2026-2027**, note du **03/06/2026** | **2026-07-25** | **session 1** |
| S5 | Règlements Généraux FFR, **art. 230-2** (72 h) — *cité par S4, texte vérifié le 2026-07-25 — l'article précise que le délai de 72 h s'apprécie entre le coup d'envoi de la première rencontre et celui de la seconde, et que la participation est définie comme l'entrée effective sur le terrain. Millésime en vigueur restant à confirmer (versions consultées : 2023-2024 et reprise Ligue Nouvelle-Aquitaine 2024).* | à confirmer | 2026-07-25 | session 1 |

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

## Session 2 — *(à venir)*

**Document du jour** :
**Millésime** :
**Existe déjà** :
**À créer** :
**À corriger** :
**Décidé** :
**Prompt Claude Code produit** :
**Résumé d'exécution Claude Code** :

---

# PARTIE 3 — Questions ouvertes

**Règles de clôture** — Une question se ferme soit *par document* (source et passage cités), soit *par le comité / la ligue*. Une réponse partielle ne ferme rien : la question reste ouverte, assortie d'une note sur ce qui manque. La liste finale des points sans réponse textuelle n'est établie qu'une fois tous les documents FFR traités.

| # | Question | Destinataire | Statut |
|---|---|---|---|
| Q1 | Le formulaire d'autorisation ne demande que des **nombres** de clubs et d'équipes, alors que l'art. 411-2 des RG exige le **nom** des clubs participants et leur **accord de participation**. Faut-il joindre la liste nominative et les accords écrits en annexe ? | Ligue IDF / Comité 92 | ⏳ ouverte |
| Q2 | Quelle est l'**adresse de dépôt** de la demande d'autorisation, et existe-t-il un **formulaire en ligne** ? *(`edr@idfrugby.fr` circule mais n'est pas vérifiée — ne pas l'utiliser sans confirmation)* | Ligue IDF / Comité 92 | ⏳ ouverte |
| Q3 | **Homologation des terrains** : exigence applicable à un tournoi EDR non officiel ? | Comité 92 | ⏳ ouverte |
| Q4 | Le **millésime des RG** consulté (Titre IV, 2019-2020) est ancien. L'art. 411-2 a-t-il évolué ? Vérifier aussi l'**art. 230-2** (72 h), cité par la note FFR mais non consulté directement. | vérification Romain | ⏳ ouverte |
| Q5 | Le **cahier des charges EDR 2026-2027** est-il paru ? Si oui, il remplace le 2025-2026. | vérification Romain | ⏳ ouverte |
| Q6 | L'onglet **RAPPORTS** existe-t-il dans l'Oval-e du club ? | vérification Romain | ⏳ ouverte |
| **Q7** | Les dates **« REPLI »** (repli plateau départemental, repli SCF/CF) bloquent-elles un tournoi club ? Le texte interdit les tournois « sur les dates de plateaux départementaux » ; un repli est une date de réserve. *Traité en `AVERTISSEMENT` dans le référentiel en attendant.* | Comité 92 | ⏳ ouverte |
| **Q8** | **Cas concret** : le Challenge Marc Chevallier du **mercredi 11/11/2026** est-il compatible avec le plateau départemental du **samedi 14/11** ? Écart de 3 jours = limite exacte des 72 h. | Comité 92 | ⏳ ouverte |
| **Q9** | Le **calendrier des plateaux du Comité 92** — celui qui bloque en pratique — n'est pas dans le calendrier national. Où le récupérer, et sous quelle forme ? *(à intégrer dans `RefFFR_Dates` avec `source = CD92`)* | Comité 92 | ⏳ ouverte |
| **Q10** | Les mentions **(A)/(B)/(C)** désignent bien les zones de vacances scolaires — la légende du calendrier (page 1) l'indique explicitement : « A,B ou C = zone si vacances scolaires ». L'Île-de-France est en zone C. Le référentiel et le paramètre `zone_vacances` sont corrects. Source : S4, légende page 1. | Comité 92 | ✅ résolue (document) |
| **Q11** | **Source des dimensions de terrain** (M8 30×20, M10 30×25, M12 56×45) : reportée du pré-audit sans document identifié. Quel texte ? | vérification Romain | ⏳ ouverte |
