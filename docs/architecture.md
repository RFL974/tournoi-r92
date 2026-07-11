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
- Apps Script a des quotas d'usage (largement suffisants pour un usage interne ponctuel).
- Un seul organisateur à la fois écrit dans le Sheet : pas de gestion de conflits d'écriture
  simultanée (acceptable pour ce cas d'usage).
