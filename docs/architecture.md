# Architecture

Le projet repose sur **3 briques** qui se parlent en JSON.

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌─────────────────────┐
│   Frontend (web)    │  HTTP  │  Backend Apps Script     │        │   Google Sheet      │
│  admin / planning / │ <────> │  (Web App, répond JSON)  │ <────> │  Equipes / Poules / │
│  live / scores      │  JSON  │  doGet() / doPost()      │        │  Matchs / Config    │
└─────────────────────┘        └──────────────────────────┘        └─────────────────────┘
     HTML/CSS/JS                    Google Apps Script                 Base de données
   (sous-domaine R92)              (lié au Google Sheet)
```

## 1. Google Sheet — la base de données
Stocke toutes les données (équipes, poules, matchs, réglages). Voir
[`structure-google-sheet.md`](structure-google-sheet.md) pour le détail des colonnes.
C'est aussi l'endroit où toi, l'organisateur, peux vérifier/corriger les données à la main
si besoin.

## 2. Google Apps Script — le backend
Un script **rattaché au Sheet**, déployé en **Web App** accessible via une URL.
Il expose deux points d'entrée standard :

- **`doGet(e)`** : répond aux demandes de **lecture** (ex : « donne-moi tous les matchs de M8 »).
- **`doPost(e)`** : répond aux demandes d'**écriture** (ex : « enregistre le score du match M001 »,
  « génère les poules et le planning »).

Le frontend appelle l'URL de la Web App avec un paramètre `action` (ex : `?action=getMatchs`),
et le backend renvoie du **JSON**. Le frontend n'accède **jamais** directement au Sheet : tout
passe par le backend. Ça garde le Sheet protégé et la logique centralisée.

### Actions prévues (indicatif, complété au fil du code)
| Action | Type | Rôle |
|---|---|---|
| `getConfig` | lecture | Réglages globaux + par catégorie |
| `getEquipes` | lecture | Liste des équipes |
| `getMatchs` | lecture | Matchs (filtrables par catégorie/équipe) |
| `getClassements` | lecture | Classements calculés par poule |
| `saveEquipes` | écriture | Enregistrer/mettre à jour les équipes |
| `saveConfig` | écriture | Enregistrer les réglages |
| `genererPoulesEtPlanning` | écriture | Répartir en poules + calculer le planning |
| `saveScore` | écriture | Enregistrer le score d'un match |

## 3. Frontend — les pages web
Pages statiques (HTML/CSS/JS), **mobile-first**. Chaque page a un rôle :

- **`admin.html`** — saisie des équipes, réglages, bouton de génération.
- **`planning.html`** — un visiteur choisit son équipe → voit ses matchs.
- **`live.html`** — classements par catégorie, derniers scores, favoris, don HelloAsso.
- **`scores.html`** — saisie des scores match par match.

Fichiers JS partagés :
- **`config.js`** — contient l'URL de la Web App et les constantes communes (couleurs, etc.).
  C'est le **seul** endroit à modifier si l'URL du backend change.
- **`api.js`** — petites fonctions `fetch()` qui appellent le backend et renvoient le JSON.

## Pourquoi ce choix d'architecture ?
- **Zéro serveur à gérer** : Google héberge le Sheet et le script gratuitement.
- **Simple pour un débutant** : pas de base SQL, pas de déploiement complexe.
- **Séparation claire** : les données (Sheet), la logique (Apps Script), l'affichage (frontend)
  sont indépendants et faciles à faire évoluer un par un.

## Limites connues (à garder en tête)
- Un seul organisateur à la fois écrit dans le Sheet : pas de gestion de conflits d'écriture
  simultanée (acceptable pour ce cas d'usage).

## Scalabilité et trafic — décision importante

Le jour du tournoi, le public peut être **très nombreux** (estimation : plusieurs centaines à
~1000 personnes sur site, susceptibles de consulter le planning/live depuis leur téléphone).

Il faut distinguer deux charges :
- **Écriture** (admin : équipes, réglages, scores) → très peu d'utilisateurs, ponctuel.
  Google Apps Script gère ça sans problème.
- **Lecture** (planning, live, classements) → potentiellement des centaines de connexions
  simultanées. **C'est le point critique.**

**Limites d'Apps Script (compte Gmail gratuit)** qui empêchent de faire lire Apps Script
directement par chaque visiteur à grande échelle :
- ~**30 exécutions simultanées** maximum → des pics de trafic génèrent des erreurs/attentes.
- **Quota de temps d'exécution journalier** (~90 min/jour en compte consommateur) → dépassé si
  des centaines de visiteurs rechargent en boucle toute la journée.
- **Latence** de ~0,5 à 2 s par appel (pas instantané, cold starts possibles).

### Stratégie retenue : séparer lecture et écriture
- **Écriture** → reste sur Apps Script (`doPost`), rare.
- **Lecture publique** → NE PAS interroger Apps Script à chaque vue. À la place :
  - Apps Script **régénère un instantané `data.json`** (planning + scores + classements calculés)
    à chaque saisie de score **et** via un déclencheur temporel (~toutes les 1 min).
  - Cet instantané est servi par un **CDN** (hébergement statique) → scale à des milliers de
    visiteurs, latence ~50 ms, très fiable.
  - Les pages `planning.html` et `live.html` lisent ce **fichier statique**, jamais Apps Script.
  - Fraîcheur du live : rafraîchissement toutes les 30–60 s (largement suffisant pour un tournoi).
- **Favoris** → déjà en `localStorage` (navigateur du visiteur) : zéro charge serveur.

> ⏳ **À implémenter au moment de construire les pages publiques (live/planning).** L'architecture
> actuelle (base + API de lecture Apps Script) reste valable pour l'admin et le développement ;
> l'instantané `data.json` sera ajouté avant la mise en production grand public.
