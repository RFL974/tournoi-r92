# Déploiement

## A. Backend — Google Apps Script ✅ (fait)

État : **déployé en Web App et fonctionnel** (l'API répond en JSON).

Étapes réalisées :
1. Coller le contenu de [`backend/Code.gs`](../backend/Code.gs) dans l'éditeur Apps Script du Sheet.
2. Lancer une fois `setupSheet()` → crée les 5 onglets (dont `Historique`).
3. **Déployer → Nouveau déploiement → Type : Application Web**.
   - Exécuter en tant que : **Moi**.
   - Qui a accès : **Tout le monde** (nécessaire pour que les visiteurs lisent le planning/live).
4. Copier l'**URL de la Web App** (se termine par `/exec`).
5. Coller cette URL dans [`frontend/js/config.js`](../frontend/js/config.js) (constante `API_URL`).

### Tester l'API
Ouvrir l'URL dans un navigateur en ajoutant un paramètre `action` :
- `…/exec?action=ping` → `{"ok":true,"message":"API Tournoi R92 en ligne"}`
- `…/exec?action=getConfig` → réglages globaux + catégories
- `…/exec?action=getAll` → tout (config, equipes, poules, matchs)

### ⚠️ Redéployer sans changer l'URL
Quand on modifie `Code.gs`, il faut publier une **nouvelle version du MÊME déploiement**, sinon
l'URL change et il faudrait la remettre à jour dans `config.js`. Pour garder la même URL :

> **Déployer → Gérer les déploiements → (crayon) Modifier → Version : « Nouvelle version » → Déployer.**

### 🔧 Colonne `phase` (session 13) — migration automatique
La phase après-midi introduit une colonne **`phase`** en **dernière colonne** de l'onglet `Matchs`.
Aucune manip manuelle : après **redéploiement**, l'en-tête `phase` est **créé automatiquement**
(fonction `assurerColonnePhase`) dès la première génération (matin ou après-midi). Il suffit donc de
**redéployer** le backend.

### 🔒 Sécurité écriture — 2 clés (fait)
La Web App reste en accès « Tout le monde » (la **lecture** publique est nécessaire), mais les
**écritures** (`doPost`) sont désormais **protégées par une clé** :

- **Clé ADMIN** → génération des poules/planning, génération de l'après-midi, équipes, réglages.
- **Clé SCORES** → saisie des scores (page `saisie.html`). Un score validé est **définitif** : le
  corriger exige la clé scores + une confirmation explicite (bouton « Corriger »).

Les clés sont rangées dans les **Propriétés du script** (jamais dans le code / GitHub).

**Mise en service (une seule fois) — définir les 2 clés.** Deux méthodes :

- **A. À la main (la plus simple, aucune exécution)** : éditeur Apps Script → **⚙️ Paramètres du
  projet** → section **« Propriétés du script »** → **Ajouter une propriété** ×2 :
  `CLE_ADMIN` = *(mot de passe admin)* et `CLE_SCORES` = *(mot de passe scores)* → **Enregistrer**.
  Effet immédiat, **pas besoin de redéployer** pour ça.

- **B. Par le menu du Sheet** : après avoir collé/déployé le code, **recharger le Google Sheet** →
  un menu **« Tournoi R92 »** apparaît → **« Configurer les clés »** → saisir les 2 clés dans les
  popups. *(La 1ʳᵉ fois, autoriser le script.)*

> ⚠️ Ne **pas** lancer `configurerCles` via le bouton ▶ de l'éditeur : les popups ne s'affichent que
> dans le contexte du Sheet (menu), sinon l'exécution attend une réponse et **expire** au bout de ~6 min.

Ensuite, côté pages : au premier enregistrement, `admin.html` demande la clé admin et `saisie.html`
la clé scores. Elles sont **mémorisées sur l'appareil** (pas à re-saisir à chaque fois).

> ⚠️ Tant que `configurerCles` n'a pas été lancé, **toute écriture est refusée** (« Clé non
> configurée »). C'est voulu : pas de clé côté serveur = pas d'écriture possible.

> 🔑 Pour **changer une clé** plus tard : relancer `configurerCles`. Les appareils déjà configurés
> redemanderont automatiquement la nouvelle clé (message « Clé incorrecte »).

## B. Frontend — mise en ligne (à venir)

**Intégration retenue :** les résultats publics seront affichés comme une **section intégrée au
site principal generationr92.fr**, développé **en parallèle dans un dépôt GitHub séparé** (aussi
via Claude Code). Ce site n'est pas encore en ligne.

Principe d'intégration :
- La partie tournoi est construite de façon **autonome** (elle fonctionne seule pour le développement).
- Le **`data.json`** (voir `architecture.md`) sert de pont : le site principal lira ce fichier et
  affichera planning/live/classements dans son propre design.
- Au moment de l'intégration, reprendre le style (couleurs, en-tête) du dépôt du site principal
  pour une section « résultats » cohérente.

L'hébergement précis (et l'URL publique) sera défini avec le site principal.
