# Tournoi R92 — Gestion de tournois de rugby

Mini-logiciel interne de gestion de tournois de rugby pour l'association **Génération R92**
(École de Rugby, Hauts-de-Seine).

Il permet d'organiser une journée de tournoi comportant **plusieurs catégories** (ex : U8 + U10 + U12),
de répartir automatiquement les équipes en poules, de générer le planning horaire sans conflit,
puis de suivre les scores et classements en direct — et de garder un **historique de saison**.

---

## ✨ Fonctionnalités

| # | Fonctionnalité | Statut |
|---|---|---|
| 1 | **Page admin** : équipes, réglages par catégorie et horaires globaux, **nombre de poules Auto ou forcé**, génération automatique des poules et du planning | ✅ Fait, déployé |
| 2 | **Génération poules + planning** sans conflit, avec **assistant d'arbitrage** (pistes si l'heure de fin est dépassée ou si un forçage rallonge la journée) | ✅ Fait, déployé |
| 3 | **Saisie des scores** : page `saisie.html`, un match par carte (score A / score B + Valider), scores définitifs verrouillés | ✅ Fait, déployé |
| 4 | **Phase après-midi** : classement croisé (niveaux N1-N4) depuis les résultats du matin, planifié après le déjeuner | ✅ Fait, déployé |
| 5 | **Page publique** `tournoi.html` : 2 onglets **Mon équipe** / **Classements**, **filtre catégorie**, derniers scores, bandeau don HelloAsso | ✅ Code fait — en attente d'hébergement |
| 6 | **Perfs Racing** (`perfs.html`) : page interne, bilan du tournoi + **cumul de saison** par adversaire | ✅ Code fait |
| 7 | **Historique de saison** : onglet `Historique` alimenté automatiquement à chaque score validé (jamais effacé par une génération) | ✅ Fait, déployé |
| 8 | **Sécurité écriture** : lectures publiques, écritures protégées par 2 clés (admin / scores) ; « connexion » demandée une fois par session | ✅ Fait, déployé + clés configurées |

Légende : 🔲 à faire · 🟡 en cours · ✅ terminé

---

## 🧱 Stack technique

- **Base de données** : Google Sheets (**5 onglets** : `Equipes`, `Poules`, `Matchs`, `Config`, `Historique`)
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
│   ├── phases-tournoi.md        → logique matin (poules) / après-midi (classement croisé N1-N4)
│   └── guide-admin.md           → mode d'emploi de l'organisateur
│
├── backend/                 → code Google Apps Script
│   └── Code.gs
│
└── frontend/                → pages web
    ├── admin.html           → page organisateur (équipes, réglages, génération)
    ├── saisie.html          → saisie des scores (table de marque)
    ├── tournoi.html         → page publique unique (onglets Mon équipe / Classements + filtre catégorie)
    ├── perfs.html           → « Perfs Racing » (page interne, non liée)
    ├── css/styles.css
    └── js/
        ├── config.js        → réglages partagés (URL du backend, etc.)
        ├── api.js           → communication avec le backend (apiGet / apiPost)
        ├── admin.js
        ├── saisie.js
        ├── tournoi.js
        └── perfs.js
```

---

## 🚀 Installation & configuration

> Le backend est **déployé et fonctionnel** (toutes les fonctions ci-dessus répondent en ligne).
> Il reste principalement à **mettre le frontend en ligne**. Voir [`docs/deploiement.md`](docs/deploiement.md).

Étapes :
1. ✅ Créer les onglets du Google Sheet — automatisé via la fonction `setupSheet()` de
   [`backend/Code.gs`](backend/Code.gs) (voir [`docs/structure-google-sheet.md`](docs/structure-google-sheet.md)).
   L'onglet `Historique` et la colonne `nb_poules` sont aussi créés automatiquement au besoin.
2. ✅ Coller le code de `backend/Code.gs` dans l'éditeur Apps Script du Sheet et déployer la Web App.
3. ✅ Lancer une fois `configurerCles()` dans l'éditeur Apps Script (clés admin / scores stockées dans
   les Propriétés du script, jamais dans le code).
4. ✅ Renseigner l'URL de la Web App dans `frontend/js/config.js`.
5. ⏳ Mettre en ligne le dossier `frontend/` (sous-domaine dédié) et coller l'URL HelloAsso du bandeau don.

> ℹ️ Après toute modification de `backend/Code.gs`, penser à **redéployer une nouvelle version**
> de la Web App (Apps Script → Gérer les déploiements → Nouvelle version).

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

**Au 2026-07-14 : l'application est complète, déployée et fonctionnelle.**

- ✅ **Base de données** Google Sheets (5 onglets) créée automatiquement (`setupSheet`).
- ✅ **Backend** déployé en Web App : API de lecture (`doGet`) et d'écriture (`doPost`), **vérifié en
  ligne** (scores, après-midi, historique, nombre de poules, clés).
- ✅ **Page admin** complète : horaires (fin auto ou manuelle, battement, pause déjeuner) ; catégories
  modifiables (présence, terrains, **nombre de poules Auto/forcé**, durées…) + ajout/suppression ;
  saisie des équipes ; génération des poules et du planning **sans conflit**, avec **assistant
  d'arbitrage** (heure de fin dépassée **ou** forçage du nombre de poules qui rallonge la journée).
- ✅ **Saisie des scores** (`saisie.html`) : score validé = **définitif/verrouillé** (correction via
  bouton « Corriger », qui redemande la clé scores).
- ✅ **Phase après-midi** (classement croisé) : `genererApresMidi` + bouton admin — génère l'après-midi
  depuis le classement du matin, planifié après le déjeuner, sans effacer le matin.
- ✅ **Page publique unique** (`tournoi.html`) — fusionne les anciennes pages *live / mon planning /
  classement* en **2 onglets** :
  - **Mon équipe** : le visiteur choisit son équipe → ses matchs (matin + après-midi, résultats
    colorés) + 3 classements (sa poule, son niveau, le général croisé) ;
  - **Classements** : derniers scores du tournoi, puis poules du matin (A/B/C) + niveaux croisés (N1-N4) ;
  - un **filtre catégorie** global (masqué s'il n'y a qu'une catégorie) adapte les deux onglets ;
  - rafraîchissement automatique (60 s). Bandeau don HelloAsso en **placeholder** (`id="don-lien"`).
- ✅ **Perfs Racing** (`perfs.html`) : page **interne** (non liée dans le menu), 2 onglets *Ce tournoi*
  et *Saison* (cumul des rencontres par adversaire, via l'historique).
- ✅ **Historique de saison** : onglet `Historique` alimenté automatiquement à chaque score validé,
  **jamais effacé** par une génération (permet le cumul saison des Perfs).
- ✅ **Sécurité écriture (2 clés)** : lectures publiques ; écritures protégées par **clé admin** ou
  **clé scores**, vérifiées côté backend ; « connexion » demandée **une fois par session**
  (`sessionStorage`). Clés stockées via `configurerCles()` (déjà configurées).

**Reste à faire :**
- **Hébergement / intégration** du frontend à generationr92.fr (via l'instantané `data.json` —
  voir [`docs/architecture.md`](docs/architecture.md)).
- ⏳ **En attente de la création du compte HelloAsso** : brancher l'URL réelle du bandeau de don
  (placeholder `href="#"`, `id="don-lien"` dans `tournoi.html`).
- **Nettoyer les données de test** du Sheet avant le vrai tournoi.

Détail complet dans [`CHANGELOG.md`](CHANGELOG.md).
