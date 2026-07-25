# AUDIT-TOURNOI-R92.md

**Objet** — Fichier pivot de l'audit de conformité **FFR École de Rugby** de l'application
Tournoi R92. Il est la **source de vérité** de l'audit : il se transmet à chaque session, avec le
document FFR du jour.

**Méthode** — 1 session = 1 document FFR.

1. Romain envoie : ce fichier + le document FFR du jour
2. Analyse du document (millésime vérifié) confronté à la Partie 1
3. Verdict en trois colonnes : ce qui **existe déjà** / ce qui **doit être créé** / ce qui **doit être corrigé**
4. Discussion, Romain tranche
5. Rédaction du **prompt Claude Code** — toujours avec une **phase d'inspection avant modification**
6. Romain colle le **résumé d'exécution de Claude Code** (pas le prompt de départ)
7. Mise à jour du fichier : Partie 1 **réécrite**, Partie 2 **complétée**, Partie 3 **ajustée**

**Règle transverse** — Toute règle inscrite dans l'app est **sourcée** : quel document, quel
millésime. Voir le *Registre des sources* en tête de Partie 2.

---

# PARTIE 1 — État de l'app

> ⚠️ Cette partie est **réécrite intégralement à chaque session**.
> **Version de référence lue** : commit `ef81489` du 2026-07-24 (branche `main`,
> `RFL974/tournoi-r92`). Lecture faite le 2026-07-25.

## 1.1 — Architecture

Trois briques qui communiquent en JSON, aucun framework, aucun serveur à gérer.

| Brique | Technologie | Rôle |
|---|---|---|
| Base de données | **Google Sheets** (6 onglets) | Stocke tout |
| Backend | **Google Apps Script**, déployé en Web App | `doGet` (lecture) / `doPost` (écriture), répond en JSON |
| Frontend | HTML/CSS/JS statiques, **GitHub Pages** | 7 pages, mobile-first |
| Relais CDN | **Cloudflare Worker** | Codé, **dormant** — activable pour la montée en charge |

Sécurité : lectures publiques ; écritures protégées par **2 clés** (admin / scores). Exception —
la page de réponse du club est sécurisée **par jeton**, pas par clé. Toutes les écritures sont
sérialisées par `LockService`. Cache serveur ~10 s sur `getAll`.

## 1.2 — Onglets Google Sheets

| Onglet | Contenu | Colonnes notables |
|---|---|---|
| `Config` | Zone A (réglages globaux, paires paramètre/valeur) + Zone B (une ligne par catégorie) | voir 1.3 |
| `Equipes` | Une ligne par équipe | `id_equipe`, `nom_equipe`, `categorie`, `poule`, `source` (`auto`/`manuel`) |
| `Poules` | Définition des poules | `id_poule`, `categorie`, `nom_poule` |
| `Matchs` | Une ligne par match | `id_match`, `categorie`, `poule`, `terrain`, `heure_debut`, `heure_fin`, `equipe_A`, `equipe_B`, `score_A`, `score_B`, `statut`, `phase`, `format`, `sous_tableau`, `tour`, `match_suivant`, `place_suivant`, `vainqueur` |
| `Historique` | Journal de saison, jamais effacé | `date`, `tournoi_id`, `id_match`, `categorie`, `phase`, `equipe_A`, `equipe_B`, `score_A`, `score_B` |
| `ClubsInvites` | Carnet d'adresses + suivi des deux phases | `club_nom`, `club_contact_prenom/nom/email`, `statut`, `date_ajout`, `categories_engagees`, `invitation_envoyee`, `dossier_envoye`, `club_token`, `date_reponse`, `nb_equipes_par_categorie`, `nb_joueurs_total`, `alerte_ecart` |

`ClubsInvites` contient des emails : **jamais** exposé dans `getAll`, le cache ni le relais CDN.

**Il n'existe aucun onglet `RefFFR`.**

## 1.3 — Config, Zone B (réglages par catégorie)

`categorie`, `presente`, `terrains`, `terrains_auto`, `nb_poules`, `format_mi_temps`,
`duree_mi_temps_min`, `pause_mi_temps_min`, `recup_entre_matchs_min`, `format_apresmidi`,
`param_format`, `reglement`, `effectif_min`, `effectif_max`, `arbitrage_organisation`,
`max_equipes_par_club`.

Toutes les colonnes récentes bénéficient d'une **migration douce** (ajout automatique à droite,
vide = comportement historique).

## 1.4 — Actions backend (45)

**Lecture (`doGet`)** — `ping`, `getConfig`, `getEquipes`, `getPoules`, `getMatchs`, `getAll`,
`getClassement`, `getHistorique`, `getClubDossier`, `getReponseInvitation`

**Écriture (`doPost`, clé admin sauf mention)** — `ajouterEquipe`, `modifierEquipe`,
`supprimerEquipe`, `supprimerEquipesCategorie`, `enregistrerHoraires`, `enregistrerCategorie`,
`supprimerCategorie`, `genererPoulesEtPlanning`, `reorganiserPoulesMatin`, `recalculerHoraires`,
`genererApresMidi`, `enregistrerScore` *(clé scores)*, `publierTournoi`, `reinitialiserTournoi`,
`enregistrerInfosTournoi`, `enregistrerAffiche`, `supprimerAffiche`, `enregistrerContactsSecurite`,
`enregistrerPlanTerrains`, `enregistrerInvitation`, `enregistrerSurPlace`,
`enregistrerReponseInvitation`, `enregistrerPhotoParking`, `supprimerPhotoParking`,
`ajouterClubInvite`, `modifierClubInvite`, `supprimerClubInvite`, `modifierStatutClubInvite`,
`listerClubsInvites`, `enregistrerCategoriesEngagees`, `creerEquipesClub`, `envoyerInvitationClub`,
`envoyerInvitationsGroupe`, `envoyerDossierEmail`, `repondreInvitation` *(jeton)*

## 1.5 — Pages frontend

| Page | Public | Rôle |
|---|---|---|
| `tournoi.html` | public | Page live : onglets *Mon équipe* / *Classements*, filtre catégorie, podium, refresh ~15 s |
| `admin.html` | organisateur (clé admin) | Équipes, réglages, horaires, terrains & répartition, clubs invités, infos tournoi, génération, publication |
| `saisie.html` | table de marque (clé scores) | Saisie des scores, filtre catégorie + grand terrain, verrouillage |
| `perfs.html` | interne | Bilan tournoi + cumul de saison par adversaire |
| `invitation-club.html` | public | Invitation Phase 1 (version web complète) |
| `reponse-invitation.html` | club (jeton) | Réponse en libre-service : accepte/décline, catégories, nb d'équipes, nb de joueurs |
| `dossier-club.html` | public | Dossier Phase 2 personnalisé : format sportif, jour J, logistique, QR live, **autorisation droit à l'image** générée en `.docx` côté client |

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
| `COUPE_PLATEAU` | ❌ **interdit en EDR** | Bracket complet : `construireBracketCoupe`, `propagerVainqueurBracket`, `majPetiteFinale`, `invaliderMatchAval`, départage manuel `vainqueur` |

## 1.8 — État de la conformité FFR : ce qui existe aujourd'hui

**Quasiment rien.** Recherche exhaustive dans le code (`ffr`, `autorisation`, `licenc`,
`homolog`, `surclass`) : la seule occurrence est le modèle `.docx` d'**autorisation de droit à
l'image**, sans rapport avec la réglementation sportive.

| Point de conformité | État |
|---|---|
| Onglet `RefFFR` (référentiel formes de jeu par mois) | ❌ inexistant |
| Formes de jeu (5c5 / 7c7 / 10c10) par catégorie et par mois | ❌ nulle part, ni en dur ni en donnée |
| Masquage de `COUPE_PLATEAU` en EDR | ❌ le format est proposé sans réserve |
| Demande d'autorisation (art. 411-2 RG) — dates, n° d'autorisation, dépôt | ❌ aucun champ, aucune checklist |
| Jalons amont (J-90 invitations / J-60 réponses / J-45 dépôt) | ❌ deux dates limites existent, non reliées à un rétroplanning |
| Dimensions de terrain réglementaires par catégorie | ⚠️ `dimensions_categories` existe (JSON, saisi à la main) mais **non contraint** par le référentiel FFR |
| Règle des 3 jours francs | ❌ absente |
| Mention « tous les joueurs doivent être licenciés FFR » | ❌ absente du dossier Phase 2 |
| Articulation avec la **FDM EDR** (fdm-edr.ffr.fr) | ❌ non mentionnée nulle part |
| Traçabilité des sources réglementaires | ❌ inexistante |

## 1.9 — Points d'ancrage identifiés pour la suite

Là où la conformité viendra se brancher, sans réécriture d'architecture :

- **Onglet `RefFFR`** → nouveau, lu par `lireConfig` / la génération
- **Zone B de `Config`** → colonnes de conformité supplémentaires (migration douce, mécanisme déjà rodé)
- **Zone A de `Config`** → paramètres de rétroplanning et d'autorisation
- **`admin.html` + `admin-reglages.js`** → masquage de `COUPE_PLATEAU`, affichage de la forme de jeu attendue
- **`dossier-club.html` + `dossier.js`** → mentions réglementaires (licence, 3 jours francs, n° d'autorisation)
- **`invitation-club.html`** → années de naissance éligibles par catégorie
- Un **écran « Amont / conformité »** dans l'admin reste à créer : c'est le seul vrai manque structurel

---

# PARTIE 2 — Journal des sessions

> On ajoute, on n'efface jamais.

## Registre des sources

| # | Document | Millésime | Date de lecture | Sessions concernées |
|---|---|---|---|---|
| S1 | Règlements Généraux FFR, Titre IV, art. 411-2 | 2019-2020 *(à revérifier)* | 2026-07 | pré-audit |
| S2 | Formulaire de demande d'autorisation de tournoi EDR | à confirmer | 2026-07 | pré-audit |
| S3 | Cahier des charges École de Rugby | 2025-2026 | 2026-07 | pré-audit |

---

## Session 0 — 2026-07-25 — Cadrage et état initial

**Document du jour** : aucun (lecture du dépôt).

**Fait** : lecture complète du dépôt au commit `ef81489`, rédaction de la Partie 1, report des
acquis du pré-audit et des questions ouvertes.

**Acquis reportés du pré-audit** (conversation de juillet 2026, avant ouverture de ce fichier) :

- L'app couvre U8/M8 à U12/M12 → **100 % du périmètre EDR**
- **Phases finales interdites** (quarts, demies, finale) → `COUPE_PLATEAU` à **masquer** en admin,
  pas à supprimer (45 tests backend derrière). `CROISE`, `CROISE_DIAGONAL`, `LIBRE` conformes
- **Formes de jeu variables selon le mois** → à stocker dans un onglet `RefFFR`, jamais en dur
- **FDM EDR** remplace composition d'équipe / feuille de régulation / feuille de score dès
  2026-2027. **Aucune API publique FFR.** Zéro recouvrement fonctionnel avec Tournoi R92
- **Demande d'autorisation** : minimum **15 jours** avant (art. 411-2 RG), cible pratique **J-45**.
  Invitations **J-90**, réponse des clubs **J-60**
- **Circuit** : club → comité départemental → ligue régionale
- **Récompenses / podiums autorisés** (champ « Récompenses oui/non » du formulaire)
- **Pass Rugby tranché** : au Racing, tests sans licence possibles à l'entraînement jusqu'en
  octobre, **jamais en match** → tout joueur en tournoi est licencié, **rien à gérer dans l'app**
- **Pas de modèle FFR** d'invitation ni de dossier club : la FFR spécifie le contenu, pas le format
  → les structures Phase 1 / Phase 2 existantes sont valides
- **Dimensions officielles** : M8 30×20 m · M10 30×25 m · M12 56×45 m · M14 terrain senior

**Décidé** : rien encore. L'audit document par document commence en session 1.

**Prompt Claude Code produit** : aucun.

---

## Session 1 — *(à venir)*

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

| # | Question | Destinataire | Statut |
|---|---|---|---|
| Q1 | Le formulaire d'autorisation ne demande que des **nombres** de clubs et d'équipes, alors que l'art. 411-2 des RG exige le **nom** des clubs participants et leur **accord de participation**. Faut-il joindre la liste nominative et les accords écrits en annexe, ou le formulaire seul suffit-il ? | Ligue IDF / Comité 92 | ⏳ ouverte |
| Q2 | Quelle est l'**adresse de dépôt** de la demande d'autorisation, et existe-t-il un **formulaire en ligne** ? *(l'adresse `edr@idfrugby.fr` circule mais n'est pas vérifiée — ne pas l'utiliser sans confirmation)* | Ligue IDF / Comité 92 | ⏳ ouverte |
| Q3 | **Homologation des terrains** : exigence applicable à un tournoi EDR non officiel ? Aucun texte trouvé à ce jour. | Comité 92 | ⏳ ouverte |
| Q4 | Le **millésime des RG** consulté (Titre IV, 2019-2020) est ancien. L'art. 411-2 a-t-il évolué ? | vérification Romain | ⏳ ouverte |
| Q5 | Le **cahier des charges EDR 2026-2027** est-il paru ? Si oui, il remplace le 2025-2026 comme référence. | vérification Romain | ⏳ ouverte |
| Q6 | L'onglet **RAPPORTS** existe-t-il dans l'Oval-e du club ? | vérification Romain | ⏳ ouverte |
