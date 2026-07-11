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

### 🔒 À prévoir plus tard (sécurité écriture)
La Web App est en accès « Tout le monde » (lecture publique nécessaire). Quand on ajoutera
l'**écriture** (`doPost` : saisie des scores, génération…), il faudra protéger ces actions
(ex : un mot de passe/clé partagé côté admin) pour qu'un visiteur ne puisse pas modifier les données.

## B. Frontend — mise en ligne (à venir)

Options envisagées pour héberger le dossier `frontend/` sur un sous-domaine de `generationr92.fr` :
- Hébergement statique classique (FTP vers le sous-domaine).
- Ou GitHub Pages, puis pointage du sous-domaine.

Cette section sera précisée selon l'hébergeur retenu.

## B. Frontend — mise en ligne (à venir)

Options envisagées pour héberger le dossier `frontend/` sur un sous-domaine de `generationr92.fr` :
- Hébergement statique classique (FTP vers le sous-domaine).
- Ou GitHub Pages, puis pointage du sous-domaine.

Cette section sera précisée selon l'hébergeur retenu.
