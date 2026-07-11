# Tournoi R92 — Gestion de tournois de rugby

Mini-logiciel interne de gestion de tournois de rugby pour l'association **Génération R92**
(École de Rugby, Hauts-de-Seine).

Il permet d'organiser une journée de tournoi comportant **plusieurs catégories** (ex : M8 + M10 + M12),
de répartir automatiquement les équipes en poules, de générer le planning horaire sans conflit,
puis de suivre les scores et classements en direct.

---

## ✨ Fonctionnalités

| # | Fonctionnalité | Statut |
|---|---|---|
| 1 | **Page admin** : saisie des équipes, réglages par catégorie et horaires globaux, génération automatique des poules et du planning | 🔲 À faire |
| 2 | **Mon planning** : un visiteur choisit son équipe et voit uniquement ses matchs | 🔲 À faire |
| 3 | **Live** : classements par catégorie, derniers scores, favoris (étoile), bannière don HelloAsso | 🔲 À faire |
| 4 | **Saisie des scores** : formulaire match par match | 🔲 À faire |

Légende : 🔲 à faire · 🟡 en cours · ✅ terminé

---

## 🧱 Stack technique

- **Base de données** : Google Sheets (4 onglets : `Equipes`, `Poules`, `Matchs`, `Config`)
- **Backend** : Google Apps Script, déployé en **Web App** qui répond en **JSON**
- **Frontend** : pages web statiques **HTML / CSS / JS**, pensées **mobile-first**.
  Les résultats publics seront **intégrés comme une section du site principal generationr92.fr**
  (site développé en parallèle, dans un dépôt GitHub séparé). Le pont entre les deux est le
  fichier `data.json` (voir [`docs/architecture.md`](docs/architecture.md))

Aucun framework, aucune dépendance à installer : c'est volontairement simple et léger.

---

## 📁 Structure du projet

```
tournoi-r92/
├── README.md                → ce fichier
├── CHANGELOG.md             → journal des évolutions
├── .gitignore               → fichiers ignorés par Git
│
├── docs/                    → documentation détaillée
│   ├── architecture.md          → comment les 3 briques communiquent
│   ├── structure-google-sheet.md→ colonnes de chaque onglet du Sheet
│   ├── deploiement.md           → déploiement backend + mise en ligne frontend
│   ├── migration-association.md → check-list pour passer des comptes perso à ceux de l'asso
│   └── guide-admin.md           → mode d'emploi de l'organisateur
│
├── backend/                 → code Google Apps Script
│   └── Code.gs
│
└── frontend/                → pages web
    ├── admin.html
    ├── planning.html
    ├── live.html
    ├── scores.html
    ├── css/styles.css
    └── js/
        ├── config.js        → réglages partagés (URL du backend, etc.)
        ├── api.js           → communication avec le backend
        ├── admin.js
        ├── planning.js
        ├── live.js
        └── scores.js
```

---

## 🚀 Installation & configuration

> Le projet n'est pas encore installable : le code arrive dans les prochaines sessions.
> Cette section sera complétée au fur et à mesure. Voir aussi [`docs/deploiement.md`](docs/deploiement.md).

Étapes prévues :
1. ✅ Créer les 4 onglets du Google Sheet — automatisé via la fonction `setupSheet()` de
   [`backend/Code.gs`](backend/Code.gs) (voir [`docs/structure-google-sheet.md`](docs/structure-google-sheet.md)).
2. Coller le code de `backend/Code.gs` dans l'éditeur Apps Script du Sheet et déployer la Web App.
3. Renseigner l'URL de la Web App dans `frontend/js/config.js`.
4. Mettre en ligne le dossier `frontend/` (sous-domaine dédié).

---

## 🎨 Charte graphique

| Usage | Couleur |
|---|---|
| Fond marine | `#0B2138` / `#031024` |
| Bleu ciel | `#B8D8F8` |
| Bleu vif (accent) | `#2E8FE0` |
| Texte blanc cassé | `#F2F6FB` |

Typographies : **Bebas Neue** (titres), **Barlow Condensed** (données / labels), **Barlow** (texte courant).

---

## 📌 Statut d'avancement

**Session 3 (2026-07-11)** — Backend **déployé en Web App** et fonctionnel : l'API de lecture
(`doGet`) répond en JSON (`ping`, `getConfig`, `getEquipes`, `getPoules`, `getMatchs`, `getAll`).
URL rangée dans `frontend/js/config.js`. Prochaine étape : première page web (admin) + écriture
des données.

**Session 2 (2026-07-11)** — Premier code backend : `setupSheet()` crée automatiquement les 4
onglets du Sheet avec leurs en-têtes.

**Session 1 (2026-07-11)** — Mise en place : structure du projet, documentation initiale,
définition de la structure du Google Sheet.

Voir [`CHANGELOG.md`](CHANGELOG.md) pour le détail.
