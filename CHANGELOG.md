# Journal des évolutions

Toutes les étapes significatives du projet sont notées ici, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).

## [Non publié]

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
