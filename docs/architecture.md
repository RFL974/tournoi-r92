# Architecture

Le projet repose sur **3 briques** qui se parlent en JSON.

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌──────────────────────────┐
│   Frontend (web)    │  HTTP  │  Backend Apps Script     │        │   Google Sheet           │
│  tournoi / admin /  │ <────> │  (Web App, répond JSON)  │ <────> │  Equipes / Poules /      │
│  saisie / perfs     │  JSON  │  doGet() / doPost()      │        │  Matchs / Config /       │
└─────────────────────┘        └──────────────────────────┘        │  Historique              │
     HTML/CSS/JS                    Google Apps Script              └──────────────────────────┘
  (GitHub Pages)                  (lié au Google Sheet)                   Base de données (5 onglets)
```

> Montée en charge spectateurs : la page publique lit `getAll` **mis en cache serveur ~10 s** (et
> peut basculer sur un **relais CDN Cloudflare** dormant). Voir [`relais-cdn.md`](relais-cdn.md).

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

### Actions disponibles
Lecture via `GET` (`doGet`), écriture via `POST` (`doPost`).

> 🔒 **Les écritures exigent une clé** (dans le corps de la requête, champ `cle`) : clé **SCORES**
> pour `enregistrerScore`, clé **ADMIN** pour toutes les autres écritures. Les lectures sont libres.
> Détails et mise en service dans [`deploiement.md`](deploiement.md).

| Action | Type | Rôle | Statut |
|---|---|---|---|
| `ping` | lecture | Vérifier que l'API répond | ✅ |
| `getConfig` | lecture | Réglages globaux + catégories | ✅ |
| `getEquipes` | lecture | Liste des équipes | ✅ |
| `getPoules` | lecture | Liste des poules | ✅ |
| `getMatchs` | lecture | Liste des matchs (planning + scores) | ✅ |
| `getAll` | lecture | Tout d'un coup (config + equipes + poules + matchs) — **mis en cache serveur ~10 s** | ✅ |
| `getClassement` | lecture | Classement de chaque poule calculé depuis les matchs `terminé` (V=3/N=2/D=1, départage à la différence puis BP) | ✅ |
| `getHistorique` | lecture | Historique de saison (cumul des rencontres, pour la page Perfs) | ✅ |
| `ajouterEquipe` | écriture | Ajouter une équipe (écrite en format texte, anti-injection de formule) | ✅ |
| `modifierEquipe` | écriture | Renommer une équipe existante | ✅ |
| `supprimerEquipe` | écriture | Supprimer une équipe | ✅ |
| `supprimerEquipesCategorie` | écriture | Supprimer toutes les équipes d'une catégorie | ✅ |
| `enregistrerHoraires` | écriture | Enregistrer les réglages globaux (zone A) | ✅ |
| `enregistrerCategorie` | écriture | Créer / mettre à jour une catégorie | ✅ |
| `supprimerCategorie` | écriture | Supprimer une catégorie | ✅ |
| `genererPoulesEtPlanning` | écriture | Répartir en poules + calculer le planning ; renvoie les **arbitrages** (matin qui déborde sur la pause / heure de fin manuelle dépassée / forçage coûteux) | ✅ |
| `genererApresMidi` | écriture | Génère la phase après-midi (classement croisé) depuis le classement du matin + la planifie ; ajoute sans effacer le matin | ✅ |
| `enregistrerScore` | écriture | Enregistrer le score d'un match (`id_match`, `score_A`, `score_B`) et le passer en `terminé` | ✅ |
| `publierTournoi` | écriture | Publier / masquer le tournoi sur la page publique | ✅ |
| `enregistrerInfosTournoi` | écriture | Nom / date / lieu / description du tournoi | ✅ |
| `enregistrerAffiche` | écriture | Enregistrer l'affiche (image redimensionnée → Google Drive) | ✅ |

> Toutes les écritures sont **sérialisées par un verrou** (`LockService`) pour éviter les collisions
> quand plusieurs personnes écrivent en même temps. Après chaque écriture, le **cache serveur est
> rafraîchi** (et le relais CDN alimenté s'il est configuré).

> **Écriture (POST) :** le frontend envoie le JSON en `text/plain` pour éviter la requête
> préliminaire CORS (« preflight ») qu'Apps Script ne gère pas. Le corps contient `{ action, … }`.

> **Génération sans conflit :** l'algorithme respecte terrains dédiés, temps de récupération des
> équipes, **battement terrain** entre 2 matchs, et **saute la pause déjeuner**. L'**heure de fin**
> est calculée automatiquement (fin du dernier match) sauf si fixée manuellement ; dans ce cas, en
> cas de dépassement, l'API propose des **arbitrages** chiffrés (chaque piste est réellement simulée).

## 3. Frontend — les pages web
Pages statiques (HTML/CSS/JS), **mobile-first**. Chaque page a un rôle :

- **`tournoi.html`** — **page publique unique** (2 onglets) : 📋 Mon équipe (matchs + classements
  d'une équipe, onglet par défaut) et 🏆 Classements (derniers scores du tournoi, puis poules +
  niveaux croisés). Un **filtre catégorie global** (au-dessus des onglets, masqué s'il n'y a qu'une
  catégorie) restreint les équipes ET les classements à la catégorie choisie ; « Derniers scores »
  reste global. Affiche un **podium** (top 3) dès qu'il est mathématiquement certain. Thème clair
  (charte du site vitrine, `tournoi-public.css`). Bandeau de don vers la page « Faire un don » du
  site. Un seul appel `getAll` + rafraîchissement auto **étalé (~15 s)**.
- **`admin.html`** — saisie des équipes, réglages, bouton de génération.
- **`saisie.html`** — saisie des scores match par match (protégée par la clé scores).
- **`perfs.html`** — page interne « perfs Racing » (non liée, cf. mémoire projet).

Fichiers JS partagés :
- **`config.js`** — contient l'URL de la Web App et les constantes communes (couleurs, etc.).
  C'est le **seul** endroit à modifier si l'URL du backend change.
- **`api.js`** — petites fonctions `fetch()` qui appellent le backend et renvoient le JSON.

## Pourquoi ce choix d'architecture ?
- **Zéro serveur à gérer** : Google héberge le Sheet et le script gratuitement.
- **Simple pour un débutant** : pas de base SQL, pas de déploiement complexe.
- **Séparation claire** : les données (Sheet), la logique (Apps Script), l'affichage (frontend)
  sont indépendants et faciles à faire évoluer un par un.

## Concurrence des écritures
Plusieurs personnes peuvent saisir des scores en même temps (un marqueur par terrain). Les
écritures sont **sérialisées par un verrou** (`LockService` autour de `doPost`) : deux validations
simultanées ne peuvent plus se télescoper (collision d'identifiant, écrasement d'une ligne de
l'onglet Historique).

## Scalabilité et trafic (montée en charge spectateurs)
Le jour du tournoi, le public peut être **très nombreux** (~1000–1300 personnes susceptibles de
consulter le live depuis leur téléphone). Deux charges à distinguer :
- **Écriture** (réglages, scores) → peu d'utilisateurs, ponctuel : Apps Script gère.
- **Lecture publique** → potentiellement des centaines de requêtes/seconde. **Point critique**, car
  Apps Script (compte Gmail) plafonne à ~**30 exécutions simultanées**.

**Solution en place (gratuite, sans nouvel outil) :**
- **Cache serveur** (`CacheService`) sur `getAll` (~10 s) : un seul appel relit le Sheet par
  tranche, les autres reçoivent la copie en mémoire (~200 ms). Rafraîchi à chaque écriture.
- **Étalement (jitter)** côté navigateur : rafraîchissement auto **~15 s** avec décalage aléatoire,
  pour éviter que tous les spectateurs appellent à la même seconde.

**Solution de secours (dormante) :** un **relais CDN Cloudflare** (`cloudflare/worker-tournoi.js`)
vers lequel Apps Script pousse un instantané à chaque écriture ; la page publique peut le lire au
lieu d'Apps Script (repli automatique si absent/en panne). Détails et activation :
[`relais-cdn.md`](relais-cdn.md).
