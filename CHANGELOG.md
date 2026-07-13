# Journal des évolutions

Toutes les étapes significatives du projet sont notées ici, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).

## [Non publié]

### Session 7 — 2026-07-13
- Page admin **étape 4 — génération des poules et du planning (backend)**.
- `backend/Code.gs` : `genererPoulesEtPlanning()` + helpers (`tourneeToutesRondes`, `dureeMatch`,
  `hmVersMin`/`minVersHm`, `idMatch`, `melanger`, `ecrireGeneration`, `viderDonnees`).
  Répartit en poules (taille cible), crée les matchs (round-robin), planifie sans conflit
  (récup entre matchs, terrains dédiés, pause déjeuner évitée, alerte si dépassement de l'heure
  de fin). Écrit dans Poules, Equipes.poule et Matchs. Action doPost `genererPoulesEtPlanning`.
- Algorithme validé hors-ligne (Node) : 0 conflit terrains/équipes/récup/déjeuner, round-robin complet.
- Reste : bouton dans la page admin + affichage du planning généré.

### Session 6 — 2026-07-13
- Page admin **étape 3b — catégories modifiables depuis la page** (frontend seul, backend déjà en place).
  - Chaque catégorie devient un formulaire : interrupteur « Présente », terrains, taille de poule,
    nb de mi-temps, durées, pauses, récup → enregistrement via `enregistrerCategorie`.
  - Ajout et suppression de catégorie depuis la page (`enregistrerCategorie` / `supprimerCategorie`).
  - Écouteurs « délégués » sur la zone réglages (résistent au re-rendu) ; le menu des équipes suit
    les catégories présentes.
- Page admin **étape 3a — horaires modifiables depuis la page** (écriture dans Config).
- `backend/Code.gs` : nouvelles actions d'écriture des réglages : `enregistrerHoraires()`,
  `enregistrerCategorie()` (créer/mettre à jour), `supprimerCategorie()`. → **1 redéploiement**
  couvre aussi l'étape 3b (catégories modifiables) à venir.
- `frontend/js/admin.js` : la carte « Horaires » devient un formulaire (champs `<input type="time">`
  = rouleau natif sur mobile) ; enregistrement via `apiPost('enregistrerHoraires', …)`.
- `frontend/css/styles.css` : styles du formulaire de réglages (libellé/valeur, champ heure sombre).

### Session 5 — 2026-07-13
- Page admin **étape 2 — saisie des équipes** (première ÉCRITURE dans le Sheet).
- `backend/Code.gs` : ajout de `doPost()` + `ajouterEquipe()`, `supprimerEquipe()`,
  `genererIdEquipe()` (identifiants auto E01, E02…). → nécessite un **redéploiement** du backend.
- `frontend/js/api.js` : ajout de `apiPost(action, data)` (POST en `text/plain` pour éviter le
  preflight CORS non géré par Apps Script).
- `frontend/admin.html` : section « Équipes » (formulaire nom + catégorie, liste).
- `frontend/js/admin.js` : chargement via `getAll`, remplissage du menu catégories (présentes),
  ajout/suppression d'équipe avec rechargement de la liste, messages de retour.
- `frontend/css/styles.css` : styles du formulaire, boutons et liste d'équipes.
- ✅ **Testé avec succès** : ajout et suppression d'équipes depuis la page fonctionnent
  (écriture réelle dans l'onglet `Equipes`). POST navigateur → 302 → JSON confirmé.

### Session 4 — 2026-07-13
- Début du frontend : **page admin (étape 1 — affichage)**.
- Ajout de `frontend/css/styles.css` : charte R92 (couleurs, polices Bebas Neue / Barlow
  Condensed / Barlow), mobile-first, cartes et grilles de réglages.
- Ajout de `frontend/js/api.js` : `apiGet(action)` (lecture des données via `fetch`).
- Ajout de `frontend/js/admin.js` : lit `getConfig` et affiche horaires globaux + catégories.
- Ajout de `frontend/admin.html` : structure de la page + chargement des scripts.
- Ajout de `.claude/launch.json` : config de serveur local pour prévisualiser le frontend.
- Vérifié : le backend renvoie `access-control-allow-origin: *` → lecture navigateur autorisée.

### Note de migration — 2026-07-11
- Développement fait sur les **comptes personnels** de Romain ; tout devra basculer sur les
  **comptes de l'association** (en création). Ajout de `docs/migration-association.md` : check-list
  de bascule (Sheet, Apps Script/déploiement, dépôt GitHub, domaine, HelloAsso). La centralisation
  de `SHEET_ID` et `API_URL` rend la migration simple (transférer 3 objets + màj 1-2 valeurs).

### Note d'intégration — 2026-07-11
- Précision : les résultats publics seront une **section intégrée au site principal
  generationr92.fr** (développé en parallèle, dépôt GitHub séparé, pas encore en ligne), et non
  un simple sous-domaine autonome. Le `data.json` reste le pont d'intégration (techno-agnostique).
  Docs mises à jour (`README.md`, `deploiement.md`) + correction d'un doublon dans `deploiement.md`.

### Note d'architecture — 2026-07-11
- Décision **scalabilité/trafic** documentée (`architecture.md`) : pour supporter potentiellement
  ~1000 visiteurs le jour J, les pages publiques (planning/live) liront un **instantané `data.json`
  servi par CDN** (régénéré par Apps Script à chaque score + toutes les ~1 min), plutôt que
  d'interroger Apps Script à chaque vue. Écriture = Apps Script ; lecture publique = fichier statique.
  À implémenter au moment de construire les pages publiques.

### Session 3 — 2026-07-11
- `backend/Code.gs` : ajout de l'API de **lecture** (`doGet`) qui répond en JSON.
  Actions : `ping`, `getConfig`, `getEquipes`, `getPoules`, `getMatchs`, `getAll`.
  Helpers : `lireOngletSimple()` (Equipes/Poules/Matchs) et `lireConfig()` (2 zones).
- **Backend déployé en Web App** (accès « Tout le monde ») et **testé avec succès** :
  l'API renvoie bien la config et les catégories.
- `frontend/js/config.js` : création, stocke l'URL du backend (`API_URL`) — source unique.
- Documentation `deploiement.md` mise à jour : backend déployé, comment tester, comment
  redéployer sans changer l'URL, et note sécurité pour la future écriture.

### Session 2 — 2026-07-11
- Ajout de `backend/Code.gs` avec la fonction `setupSheet()` : crée automatiquement les 4 onglets
  (`Equipes`, `Poules`, `Matchs`, `Config`) et leurs en-têtes, stylise les en-têtes (charte R92),
  fige la 1re ligne, et pré-remplit `Config` (réglages globaux + exemples de catégories M8/M10/M12).
- Onglet `Config` forcé au format texte pour préserver les heures (`09:00`) et listes de terrains (`1,2`).
- `setupSheet()` cible le Sheet par son identifiant (`SpreadsheetApp.openById(SHEET_ID)`) plutôt que
  par le classeur actif : robuste que l'éditeur Apps Script soit lié au Sheet ou en projet indépendant.
- ✅ **Testé avec succès** : les 4 onglets ont été créés dans le Sheet.
- Documentation mise à jour (`structure-google-sheet.md` : création auto + disposition exacte des zones).

### Session 1 — 2026-07-11
- Création de la structure de dossiers du projet (`docs/`, `backend/`, `frontend/`).
- Rédaction de la documentation initiale : `README.md`, `docs/architecture.md`,
  `docs/structure-google-sheet.md`, `docs/deploiement.md`, `docs/guide-admin.md`.
- Ajout de `CHANGELOG.md` et `.gitignore`.
- Décisions techniques structurantes :
  - Terrains **dédiés par catégorie** (chaque catégorie tourne sur ses propres terrains).
  - Classement de poule **simplifié** : Victoire = 3, Nul = 2, Défaite = 1 ; départage à la
    différence de points marqués/encaissés.
  - Génération des poules par **taille cible** (l'algo crée autant de poules que nécessaire).
- Définition finalisée de la structure des 4 onglets du Google Sheet.

_À venir : initialisation Git + dépôt GitHub, puis premier code (backend Apps Script)._
