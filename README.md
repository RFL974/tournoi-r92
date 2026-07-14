# Tournoi R92 — Gestion de tournois de rugby

Mini-logiciel interne de gestion de tournois de rugby pour l'association **Génération R92**
(École de Rugby, Hauts-de-Seine).

Il permet d'organiser une journée de tournoi comportant **plusieurs catégories** (ex : U8 + U10 + U12 + U14),
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
| 5 | **Page publique** `tournoi.html` (thème clair, charte du site vitrine) : 2 onglets **Mon équipe** / **Classements**, **filtre catégorie**, derniers scores, **podium certain**, bandeau de don vers la page « Faire un don » du site | ✅ Fait, **en ligne** (GitHub Pages) |
| 6 | **Publication du tournoi** : bouton admin « Générer le tournoi » (publier / masquer) — la page publique reste un écran « à venir » tant que le tournoi n'est pas publié | ✅ Fait, déployé |
| 7 | **Infos du tournoi + affiche** : nom, date, lieu, description + **chargeur d'affiche** (stockée dans Google Drive). Enregistrés + publiés d'un clic (« Générer le tournoi ») | ✅ Fait, déployé |
| 8 | **Intégration au site vitrine** [boutique-r92](https://rfl974.github.io/boutique-r92/) : carte d'actu dynamique (nom + affiche) + **page d'article** (agenda .ics 2 rappels + itinéraire) quand le tournoi est publié | ✅ Fait, en ligne |
| 9 | **Perfs Racing** (`perfs.html`) : page interne, bilan du tournoi + **cumul de saison** par adversaire | ✅ Fait, en ligne |
| 10 | **Historique de saison** : onglet `Historique` alimenté automatiquement à chaque score validé (jamais effacé par une génération) | ✅ Fait, déployé |
| 11 | **Sécurité écriture** : lectures publiques, écritures protégées par 2 clés (admin / scores) ; « connexion » demandée une fois par session | ✅ Fait, déployé + clés configurées |

Légende : 🔲 à faire · 🟡 en cours · ✅ terminé

---

## 🧱 Stack technique

- **Base de données** : Google Sheets (**5 onglets** : `Equipes`, `Poules`, `Matchs`, `Config`, `Historique`)
- **Backend** : Google Apps Script, déployé en **Web App** qui répond en **JSON**
- **Frontend** : pages web statiques **HTML / CSS / JS**, pensées **mobile-first**, **hébergées sur
  GitHub Pages** (workflow `.github/workflows/pages.yml` qui publie le dossier `frontend/`) :
  - public : **https://rfl974.github.io/tournoi-r92/tournoi.html**
  - admin : `…/admin.html` · saisie : `…/saisie.html` · perfs (interne) : `…/perfs.html`
- **Intégration au site vitrine** [boutique-r92](https://github.com/RFL974/boutique-r92) (dépôt séparé) :
  quand le tournoi est publié, une carte + une page d'article apparaissent dans ses Actualités
  (elles interrogent le même backend). Voir [`docs/architecture.md`](docs/architecture.md).

Aucun framework, aucune dépendance à installer : c'est volontairement simple et léger.

---

## 📁 Structure du projet

```
tournoi-r92/
├── README.md                → ce fichier
├── CHANGELOG.md             → journal des évolutions
├── .gitignore               → fichiers ignorés par Git
├── .github/workflows/
│   └── pages.yml            → déploiement auto du dossier frontend/ sur GitHub Pages
│
├── docs/                    → documentation détaillée
│   ├── guide-utilisateur.md     → ⭐ mode d'emploi complet (organisateur / saisie / visiteur)
│   ├── passation.md             → ⭐ portabilité : tout transférer vers les comptes de l'asso
│   ├── architecture.md          → comment les briques communiquent
│   ├── structure-google-sheet.md→ colonnes de chaque onglet du Sheet
│   ├── deploiement.md           → déploiement backend + mise en ligne frontend
│   ├── relais-cdn.md            → montée en charge (cache serveur + relais CDN Cloudflare)
│   └── phases-tournoi.md        → note de conception (après-midi : classement croisé)
│
├── backend/                 → code Google Apps Script
│   └── Code.gs
│
├── cloudflare/              → relais CDN optionnel (dormant par défaut)
│   └── worker-tournoi.js
│
└── frontend/                → pages web
    ├── index.html           → redirige la racine vers tournoi.html
    ├── admin.html           → page organisateur (équipes, réglages, infos tournoi, génération, publication)
    ├── saisie.html          → saisie des scores (table de marque)
    ├── tournoi.html         → page publique unique (onglets Mon équipe / Classements + filtre catégorie)
    ├── perfs.html           → « Perfs Racing » (page interne, non liée)
    ├── css/
    │   ├── styles.css           → thème sombre (admin / saisie / perfs)
    │   └── tournoi-public.css   → thème clair de la page publique (charte du site vitrine)
    └── js/
        ├── config.js        → réglages partagés (API_URL du backend, SNAPSHOT_URL du relais)
        ├── api.js           → communication avec le backend (apiGet / apiPost + clés)
        ├── admin.js
        ├── saisie.js
        ├── tournoi.js
        └── perfs.js
```

---

## 🚀 Installation & configuration

> Le backend **et** le frontend sont **en ligne et fonctionnels**. Voir [`docs/deploiement.md`](docs/deploiement.md).

Étapes (toutes faites) :
1. ✅ Créer les onglets du Google Sheet — automatisé via `setupSheet()` de
   [`backend/Code.gs`](backend/Code.gs) (voir [`docs/structure-google-sheet.md`](docs/structure-google-sheet.md)).
   L'onglet `Historique` et la colonne `nb_poules` sont créés automatiquement au besoin.
2. ✅ Coller `backend/Code.gs` dans l'éditeur Apps Script et déployer la Web App.
   **Autorisation Google Drive** requise une fois (pour l'affiche) : lancer `autoriserDrive()` dans l'éditeur.
3. ✅ Lancer une fois `configurerCles()` (clés admin / scores dans les Propriétés du script, jamais dans le code).
4. ✅ Renseigner l'URL de la Web App dans `frontend/js/config.js`.
5. ✅ **Frontend hébergé sur GitHub Pages** (Settings → Pages → Source : **GitHub Actions** ; le workflow
   `.github/workflows/pages.yml` publie le dossier `frontend/` à chaque push).

> ℹ️ Après toute modification de `backend/Code.gs`, penser à **redéployer une nouvelle version**
> de la Web App (Apps Script → Gérer les déploiements → Nouvelle version). Le **frontend**, lui, se
> redéploie **automatiquement** à chaque push sur `main`.

---

## 🎨 Charte graphique

| Usage | Couleur |
|---|---|
| Fond marine | `#0B2138` / `#031024` |
| Bleu ciel | `#B8D8F8` |
| Bleu vif (accent) | `#2E8FE0` |
| Texte blanc cassé | `#F2F6FB` |

Typographies : **Bebas Neue** (titres), **Barlow Condensed** (données / labels), **Barlow** (texte courant).

> Cette charte **sombre** s'applique aux pages **admin / saisie / perfs** (`css/styles.css`). La
> **page publique** (`tournoi.html`) a été redesignée en **thème clair** aux couleurs du site
> vitrine (navy `#0C1C2E` / bleu vif `#2E8FE0`, **Barlow** + **Barlow Condensed**, sans Bebas Neue)
> via `css/tournoi-public.css`.

---

## 📌 Statut d'avancement

**Au 2026-07-14 : l'application est complète, EN LIGNE et fonctionnelle** (backend Apps Script + frontend GitHub Pages + intégration au site vitrine boutique-r92).

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
  - un **podium** (top 3) s'affiche dès qu'il est mathématiquement certain (par catégorie) ;
  - rafraîchissement automatique **~15 s** (avec étalement, cf. montée en charge). Le bandeau de don
    pointe vers la page **« Faire un don »** du site vitrine.
- ✅ **Publication du tournoi** : dans l'admin, bouton **« Générer le tournoi »** — distinct de la
  génération des poules. Il **enregistre les infos (nom, date, lieu, description) + l'affiche, puis
  publie**. Tant que le tournoi n'est pas publié, la page publique affiche un écran **« à venir »**.
- ✅ **Affiche du tournoi** : chargeur d'image dans l'admin ; l'image est redimensionnée côté navigateur
  puis **stockée dans Google Drive** (`tournoi_affiche_id` dans Config). Affichée via `lh3.googleusercontent.com`.
- ✅ **Intégration boutique-r92** : quand le tournoi est publié, une **carte** (nom + affiche) et une
  **page d'article** (`boutique-r92/tournoi.html`) apparaissent dans les Actualités du site vitrine ;
  l'article contient un bouton vers le tournoi en direct, un **agenda .ics (2 rappels : veille + 2 h)**
  et un bouton **itinéraire « On y va »**.
- ✅ **Perfs Racing** (`perfs.html`) : page **interne** (non liée dans le menu), 2 onglets *Ce tournoi*
  et *Saison* (cumul des rencontres par adversaire, via l'historique).
- ✅ **Historique de saison** : onglet `Historique` alimenté automatiquement à chaque score validé,
  **jamais effacé** par une génération (permet le cumul saison des Perfs).
- ✅ **Sécurité écriture (2 clés)** : lectures publiques ; écritures protégées par **clé admin** ou
  **clé scores**, vérifiées côté backend ; « connexion » demandée **une fois par session**
  (`sessionStorage`). Clés stockées via `configurerCles()` (déjà configurées).

- ✅ **Montée en charge** (milliers de spectateurs) : **cache serveur** (`CacheService`) sur `getAll`
  + **rafraîchissement étalé ~15 s** côté navigateur ; **relais CDN Cloudflare** codé mais **dormant**
  (activable pour une garantie « béton »). Repli automatique intégré. Voir [`docs/relais-cdn.md`](docs/relais-cdn.md).
- ✅ **Saisie** : filtre par catégorie (table de marque) + **accordéons** matin/après-midi qui se
  replient dès leur dernier score ; lisible sur téléphone (scoreboard vertical).

**Reste à faire (confort / avant le vrai tournoi) :**
- **Nettoyer les données de test** du Sheet avant le vrai tournoi (le bouton « Générer poules et
  planning » repart de zéro ; l'onglet `Historique` n'est PAS effacé).
- Choisir des **clés admin / scores longues et aléatoires** (voir [`docs/passation.md`](docs/passation.md)).

📖 **Mode d'emploi complet** : [`docs/guide-utilisateur.md`](docs/guide-utilisateur.md). ·
🔀 **Passation / portabilité** : [`docs/passation.md`](docs/passation.md). ·
🗒️ Détail des évolutions : [`CHANGELOG.md`](CHANGELOG.md).
