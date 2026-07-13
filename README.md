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
| 1 | **Page admin** : saisie des équipes, réglages par catégorie et horaires globaux, génération automatique des poules et du planning | ✅ Fait (équipes, réglages, génération poules + planning) |
| 2 | **Phase après-midi** : génération du classement croisé (niveaux N1-N4) depuis les résultats du matin, planifiée après le déjeuner | 🟡 Code prêt (`genererApresMidi` + bouton admin) — backend à redéployer |
| 3 | **Saisie des scores** : page `saisie.html`, un match par carte (score A / score B + Valider), scores définitifs verrouillés | 🟡 Code prêt (page + action `enregistrerScore`) — backend à redéployer |
| 4 | **Mon planning** : un visiteur choisit son équipe et voit uniquement ses matchs (matin + après-midi, résultats colorés) + 3 classements en direct (poule, niveau, général croisé), rafraîchis automatiquement | 🟡 Code prêt (page `planning.html`) — en attente d'hébergement |
| 5 | **Live** : classements par catégorie, derniers scores, favoris (étoile), bandeau don HelloAsso | 🟡 Code prêt (page `live.html`) — bandeau don en placeholder, en attente d'hébergement |
| 6 | **Sécurité écriture** : lectures publiques, écritures protégées par 2 clés (admin / scores) ; « connexion » demandée une fois par session | ✅ Implémenté (front + back) — backend à redéployer + `configurerCles` |

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
│   ├── phases-tournoi.md        → logique matin (poules) / après-midi (classement croisé N1-N4)
│   └── guide-admin.md           → mode d'emploi de l'organisateur
│
├── backend/                 → code Google Apps Script
│   └── Code.gs
│
└── frontend/                → pages web
    ├── admin.html           → page organisateur (équipes, réglages, génération)
    ├── saisie.html          → saisie des scores (table de marque)
    ├── classement.html      → classement des poules (lecture seule)
    ├── planning.html        → « Mon planning » visiteur (choix de l'équipe)
    ├── live.html            → live public (favoris, derniers scores, classements)
    ├── css/styles.css
    └── js/
        ├── config.js        → réglages partagés (URL du backend, etc.)
        ├── api.js           → communication avec le backend (apiGet / apiPost)
        ├── admin.js
        ├── saisie.js
        ├── classement.js
        ├── planning.js
        └── live.js
```

---

## 🚀 Installation & configuration

> Le backend et le frontend sont fonctionnels et testés en local. Reste à **redéployer la dernière
> version du backend** puis à **mettre le frontend en ligne**. Voir [`docs/deploiement.md`](docs/deploiement.md).

Étapes :
1. ✅ Créer les 4 onglets du Google Sheet — automatisé via la fonction `setupSheet()` de
   [`backend/Code.gs`](backend/Code.gs) (voir [`docs/structure-google-sheet.md`](docs/structure-google-sheet.md)).
2. ✅ Coller le code de `backend/Code.gs` dans l'éditeur Apps Script du Sheet et déployer la Web App.
   ⚠️ **À redéployer** pour activer la saisie des scores, la phase après-midi et le contrôle des clés.
3. Lancer une fois `configurerCles()` dans l'éditeur Apps Script (clés admin / scores stockées dans
   les Propriétés du script, jamais dans le code).
4. ✅ Renseigner l'URL de la Web App dans `frontend/js/config.js`.
5. Mettre en ligne le dossier `frontend/` (sous-domaine dédié) et coller l'URL HelloAsso du bandeau don.

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

**Au 2026-07-13 :**

- ✅ **Base de données** Google Sheets (4 onglets) créée automatiquement (`setupSheet`).
- ✅ **Backend** déployé en Web App : API de lecture (`doGet`) et d'écriture (`doPost`).
- ✅ **Page admin** complète et testée :
  - horaires modifiables (heure de fin auto ou manuelle, battement terrain, pause déjeuner) ;
  - catégories modifiables (présence, terrains, tailles, durées…) + ajout/suppression ;
  - saisie des équipes (ajout/suppression) ;
  - génération des poules et du planning **sans conflit**, avec **assistant d'arbitrage** si
    l'heure de fin manuelle est dépassée.

- ✅ **Sécurité écriture (2 clés)** : les lectures (`doGet`) restent publiques ; les écritures
  (`doPost`) exigent une **clé admin** (équipes, réglages, génération poules/planning et après-midi)
  ou une **clé scores** (`enregistrerScore`), vérifiées côté backend. Les scores `terminé` sont
  **verrouillés** (correction possible via `modification: true`, qui redemande la clé). Côté
  navigateur, une **« connexion »** demande la clé **une fois par session** (`sessionStorage`) puis
  les écritures passent en silence. Clés stockées dans les Propriétés du script via `configurerCles()`.
  ⚠️ **Backend à redéployer + lancer `configurerCles`**.

- 🟡 **Saisie des scores** : page `saisie.html` (une carte par match, score A/B + Valider) et action
  d'écriture `enregistrerScore` (passe le match en `terminé`, score définitif verrouillé). Code et
  page vérifiés en local ; **backend à redéployer** pour activer l'enregistrement en ligne.
- 🟡 **Classement des poules** : page `classement.html` et action de lecture `getClassement`
  (V=3/N=2/D=1, départage à la différence). Deux sections : poules du matin (A/B/C) et après-midi
  (croisé N1-N4). Code et page vérifiés en local ; **backend à redéployer**.
- 🟡 **Phase après-midi (classement croisé)** : action `genererApresMidi` + bouton dans l'admin.
  Génère les matchs de l'après-midi depuis le classement du matin et les planifie après le déjeuner
  (sans effacer le matin). Logique validée (Node). La colonne `phase` est créée automatiquement ;
  il suffit de **redéployer** le backend — voir [`docs/deploiement.md`](docs/deploiement.md).

- 🟡 **Mon planning** (`planning.html`) : le visiteur choisit son équipe et voit ses matchs (matin /
  après-midi, résultats colorés) + **3 classements en direct** — sa poule, son niveau d'après-midi
  (N1-N4) et le **classement général croisé** — l'équipe surlignée partout. **Rafraîchissement
  automatique** (60 s) + bouton manuel + heure de mise à jour. Vérifié en local sur données réelles.
- 🟡 **Live** (`live.html`) : favoris (étoile), derniers scores, classements par poule, rafraîchis
  automatiquement. Vérifié en local. Le bandeau don HelloAsso est un **placeholder** (URL à renseigner).
- 🟡 **Mon planning** et **Live** : en attente d'hébergement.

**Reste à faire :**
- **Redéployer le backend** (saisie scores + après-midi + clés) et lancer `configurerCles()`.
- **Hébergement / intégration** à generationr92.fr via l'instantané `data.json`
  (voir [`docs/architecture.md`](docs/architecture.md)).
- ⏳ **À faire plus tard — en attente de la création du compte HelloAsso** : brancher l'URL réelle du
  bandeau de don. Le compte HelloAsso n'existe pas encore ; en attendant, le bandeau reste un
  placeholder (`href="#"`, `id="don-lien"` dans `live.html`). L'URL sera à coller une fois le compte créé.

Détail complet dans [`CHANGELOG.md`](CHANGELOG.md).
