# Déploiement

## A. Backend — Google Apps Script ✅ (fait)

État : **déployé en Web App et fonctionnel** (l'API répond en JSON).

Étapes réalisées :
1. Coller le contenu de [`backend/Code.gs`](../backend/Code.gs) dans l'éditeur Apps Script du Sheet.
2. Lancer une fois `setupSheet()` → crée les 4 onglets.
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

### 🔒 À prévoir plus tard (sécurité écriture)
La Web App est en accès « Tout le monde » (lecture publique nécessaire). Quand on ajoutera
l'**écriture** (`doPost` : saisie des scores, génération…), il faudra protéger ces actions
(ex : un mot de passe/clé partagé côté admin) pour qu'un visiteur ne puisse pas modifier les données.

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
