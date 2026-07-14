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

### 🖼️ Autorisation Google Drive (affiche) — une fois
L'affiche du tournoi est stockée dans **Google Drive**. Après avoir collé/déployé le code, lancer
une fois **`autoriserDrive()`** depuis l'éditeur (menu Exécuter) et **autoriser** l'accès Drive.
Sans cela, l'enregistrement de l'affiche échouerait.

## B. Frontend — en ligne sur GitHub Pages ✅ (fait)

Le dossier `frontend/` est **publié automatiquement sur GitHub Pages** à chaque push sur `main`,
via le workflow [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

Mise en service (déjà faite) : dépôt GitHub → **Settings → Pages → Source : GitHub Actions**.

Adresses (base `https://rfl974.github.io/tournoi-r92/`) :
- public : `…/tournoi.html` · admin : `…/admin.html` · saisie : `…/saisie.html` · perfs : `…/perfs.html`
- `index.html` redirige la racine vers `tournoi.html`.

**Intégration au site vitrine [boutique-r92](https://rfl974.github.io/boutique-r92/)** (dépôt séparé) :
quand le tournoi est publié, une carte d'actualité et une page d'article y apparaissent (elles
interrogent le même backend). Le bandeau de don de la page publique pointe vers la page « Faire un
don » du site vitrine.

> **Changer l'URL publique** (nouveau compte GitHub ou **nom de domaine**) : voir la procédure
> complète dans [`passation.md`](passation.md) (DNS, domaine personnalisé, liens croisés à mettre à jour).

## C. Montée en charge spectateurs
Cache serveur + rafraîchissement étalé sont **déjà actifs**. Un **relais CDN Cloudflare** optionnel
(dormant) peut être activé pour une garantie à très grande échelle : voir [`relais-cdn.md`](relais-cdn.md).
