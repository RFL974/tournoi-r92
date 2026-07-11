# Journal des évolutions

Toutes les étapes significatives du projet sont notées ici, de la plus récente à la plus ancienne.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/).

## [Non publié]

### Session 2 — 2026-07-11
- Ajout de `backend/Code.gs` avec la fonction `setupSheet()` : crée automatiquement les 4 onglets
  (`Equipes`, `Poules`, `Matchs`, `Config`) et leurs en-têtes, stylise les en-têtes (charte R92),
  fige la 1re ligne, et pré-remplit `Config` (réglages globaux + exemples de catégories M8/M10/M12).
- Onglet `Config` forcé au format texte pour préserver les heures (`09:00`) et listes de terrains (`1,2`).
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
