# Passation & portabilité — Tournoi R92

Ce document décrit **tout** ce qu'il faut transférer pour que l'outil quitte l'ordinateur et les
comptes personnels de Romain et devienne **100 % propriété de l'association** — de la réception du
nom de domaine à la passation complète. Il remplace l'ancien `migration-association.md`.

> **Bonne nouvelle sur l'« ordi »** : rien n'est stocké *localement* de façon critique. Tout vit
> dans le cloud (GitHub, Google, éventuellement Cloudflare). L'ordinateur ne sert qu'à éditer le
> code. Une simple **copie du dépôt Git** suffit à ne rien perdre (voir §7).

---

## 1. Inventaire : tout ce qui est lié à un compte personnel

| # | Élément | Où c'est aujourd'hui | À transférer vers |
|---|---------|----------------------|-------------------|
| 1 | **Google Sheet** (la base de données) | Compte Google de Romain | Compte Google de l'asso |
| 2 | **Projet Apps Script** (backend, lié au Sheet) + **déploiement** (URL `/exec`) | idem Sheet | idem Sheet (re-déploiement) |
| 3 | **Clés** admin/scores + réglages relais (Propriétés du script) | Script Properties | idem (à re-régler) |
| 4 | **Fichiers Drive** (affiches du tournoi) | Google Drive de Romain | Drive de l'asso |
| 5 | **Dépôt GitHub + GitHub Pages** (`tournoi-r92`) | Compte GitHub `RFL974` | Compte/orga GitHub de l'asso |
| 6 | **Compte Cloudflare** (relais CDN, *si activé*) | Cloudflare de Romain | Cloudflare de l'asso |
| 7 | **Nom de domaine** | (en cours de réception) | Géré par l'asso |
| 8 | **Liens croisés** avec le site vitrine `boutique-r92` | URLs `rfl974.github.io/...` | URLs du domaine de l'asso |

---

## 2. Les 3 (et seulement 3) points de configuration à connaître

Toute la « tuyauterie » tient en **trois valeurs** :

1. **`SHEET_ID`** — dans `backend/Code.gs` (ligne ~11) : l'identifiant du Google Sheet.
2. **`API_URL`** — dans `frontend/js/config.js` : l'URL `/exec` du déploiement Apps Script (le
   backend que le frontend appelle).
3. **`SNAPSHOT_URL`** — dans `frontend/js/config.js` : l'URL du relais Cloudflare (vide si le relais
   n'est pas utilisé).

Plus, **hors code** (Propriétés du script Apps Script) : `CLE_ADMIN`, `CLE_SCORES`, et si relais
`RELAIS_URL` + `RELAIS_CLE`. On les (re)règle avec `configurerCles(...)` et `configurerRelais(...)`.

Si tu ne devais retenir qu'une chose : **après un transfert, ces valeurs doivent pointer vers les
nouveaux comptes.**

---

## 3. Passation Google (Sheet + Apps Script + Drive + clés)

### 3.1 Transférer la propriété du Google Sheet
1. Ouvrir le Sheet → **Partager** → ajouter l'adresse Google de l'asso.
2. Sur cette adresse, ouvrir le menu de rôle → **« En faire le propriétaire »** → confirmer.
   *(Le projet Apps Script, étant « lié » au Sheet, suit automatiquement.)*
3. Vérifier ensuite, côté compte asso, que le Sheet reste en partage **Restreint** (propriétaire
   seul) — ne jamais le passer en « toute personne disposant du lien » (l'ID est public dans le code).

> **Alternative** si le transfert de propriété direct n'est pas possible (comptes de domaines
> différents) : depuis le compte asso, **faire une copie** du Sheet. Attention, une copie **recrée
> un projet Apps Script vierge** (voir 3.2) et un **nouveau `SHEET_ID`** (à reporter dans `Code.gs`).

### 3.2 Re-déployer le backend sous le compte asso (NOUVELLE `API_URL`)
Même après transfert, il faut **re-déployer** pour que le web app s'exécute sous le compte asso :
1. Google Sheet (compte asso) → **Extensions → Apps Script**.
2. Vérifier que `SHEET_ID` (en tête de `Code.gs`) correspond bien au Sheet de l'asso.
3. **Déployer → Nouveau déploiement → Type : Application Web**, « Exécuter en tant que : moi »,
   « Accès : tout le monde » → **Déployer**. **Copier la nouvelle URL `/exec`.**
4. Reporter cette URL dans `frontend/js/config.js` → `API_URL = "…/exec"`, puis pousser sur GitHub.
5. Lancer une fois **`autoriserDrive()`** (menu Exécuter) pour ré-autoriser l'accès Drive (affiche).

### 3.3 Re-régler les clés et le relais
Dans l'éditeur Apps Script du compte asso, lancer une fois :
```js
configurerCles('NOUVELLE_CLE_ADMIN_LONGUE', 'NOUVELLE_CLE_SCORES_LONGUE')
// et si le relais Cloudflare est utilisé :
configurerRelais('https://…workers.dev', 'NOUVELLE_CLE_RELAIS')
```
> **Sécurité** : profiter de la passation pour choisir des **clés longues et aléatoires** (≥ 16
> caractères, ex. générées par un gestionnaire de mots de passe). C'est la meilleure protection
> contre les tentatives de devinette. Communiquer la clé **scores** aux marqueurs le jour J, garder
> la clé **admin** pour l'organisation.

### 3.4 Fichiers Drive (affiches)
Les affiches téléversées sont des fichiers Drive (champ `tournoi_affiche_id`). Si l'historique des
affiches doit être conservé, les **déplacer/partager** vers le Drive de l'asso. Sinon, il suffit de
**re-téléverser** une affiche depuis la page admin après passation (l'ancienne reste en corbeille).

---

## 4. Passation GitHub (dépôt + Pages)

### 4.1 Transférer le dépôt
GitHub → dépôt `tournoi-r92` → **Settings → General → Transfer ownership** → indiquer le
compte/organisation GitHub de l'asso. Le dépôt `boutique-r92` (site vitrine) se transfère de la
même façon.

### 4.2 Réactiver GitHub Pages
Sous le compte asso : dépôt → **Settings → Pages → Source : GitHub Actions**. Le workflow
`.github/workflows/pages.yml` republie automatiquement le dossier `frontend/`.

> ⚠️ **Sans domaine personnalisé**, l'URL de base **change** (`https://<compte-asso>.github.io/
> tournoi-r92/`). Il faut alors mettre à jour **tous les liens absolus** (voir §6). **Avec** un
> domaine personnalisé (§5), l'URL devient stable et indépendante du compte — **c'est recommandé**.

---

## 5. Nom de domaine (de la réception à la mise en ligne)

Objectif : servir les deux sites sous le domaine de l'asso (ex. `generationr92.fr`), ce qui
**découple** les adresses du nom de compte GitHub. Deux schémas possibles :
- **Sous-domaines** : `tournoi.generationr92.fr` (cette appli) et `www.generationr92.fr` (vitrine).
- **Sous-chemins** : un seul domaine, plusieurs dépôts (plus complexe côté GitHub Pages).
  → **Recommandé : les sous-domaines.**

### 5.1 À la réception du domaine
1. Créer un compte chez le **registrar** (OVH, Gandi, Cloudflare Registrar…) ou récupérer les accès.
2. Repérer la zone **DNS** (là où on ajoute des enregistrements).

### 5.2 Brancher un sous-domaine sur GitHub Pages
Pour `tournoi.generationr92.fr` → dépôt `tournoi-r92` :
1. **DNS** : ajouter un enregistrement **CNAME** : `tournoi` → `<compte-asso>.github.io`.
2. **GitHub** : dépôt → **Settings → Pages → Custom domain** : saisir `tournoi.generationr92.fr` →
   Save. (GitHub ajoute un fichier `CNAME` dans le dépôt.)
3. Attendre la propagation DNS (quelques minutes à quelques heures), puis cocher **Enforce HTTPS**.
4. Faire de même pour la vitrine (`www` → dépôt `boutique-r92`) et rediriger l'apex
   `generationr92.fr` → `www` (enregistrements **A** vers les IP GitHub Pages, ou redirection du
   registrar).

### 5.3 Après bascule sur le domaine
Mettre à jour les **liens croisés** (§6) pour utiliser le domaine plutôt que `*.github.io`.

---

## 6. Liens croisés à mettre à jour (tournoi ⇄ vitrine)

L'appli tournoi référence le site vitrine (et réciproquement) par des **URL absolues**. Après un
changement d'URL de base (nouveau compte GitHub **ou** nouveau domaine), rechercher/remplacer :

- Dans **`frontend/tournoi.html`** et **`frontend/css/tournoi-public.css`** : les
  `https://rfl974.github.io/boutique-r92/...` (logo, favicon, grain de fond, lien « Retour au
  site », page de don, contact).
- Dans **`frontend/js/config.js`** : `API_URL` et `SNAPSHOT_URL` (voir §2).
- Dans le dépôt **`boutique-r92`** : les liens et l'agenda/itinéraire qui pointent vers
  `rfl974.github.io/tournoi-r92/...` (carte d'actu + page d'article du tournoi).
- Repère utile : `grep -rn "rfl974.github.io" frontend/` liste tous les liens à revoir.

> **Astuce** : basculer sur le **domaine** (§5) une bonne fois, puis n'utiliser QUE des liens en
> `…generationr92.fr/…` — ainsi un futur changement de compte GitHub n'impactera plus rien.

---

## 7. Relais Cloudflare (uniquement s'il est activé)

Par défaut le relais est **dormant** (la montée en charge est assurée par le cache serveur + le
rafraîchissement étalé, voir [`relais-cdn.md`](relais-cdn.md)). S'il a été activé :
1. Recréer (ou transférer) le **Worker** + le **namespace KV** sous le compte Cloudflare de l'asso
   (code dans `cloudflare/worker-tournoi.js`, procédure dans `relais-cdn.md`).
2. Régénérer le secret `SNAPSHOT_KEY`, le reporter côté Apps Script via `configurerRelais(...)`.
3. Mettre la nouvelle URL du Worker dans `frontend/js/config.js` → `SNAPSHOT_URL`.
> Le repli étant automatique, si le relais n'est pas recréé, la page publique lit simplement Apps
> Script (cache serveur) — rien ne casse.

---

## 8. « Tout doit quitter mon ordi » — que garder ?

- **Le code** vit sur GitHub : une fois le dépôt transféré, l'ordi n'a plus rien d'indispensable.
  Par prudence, garder une **copie du dépôt** : `git clone` (ou télécharger le ZIP) sur un support
  de l'asso.
- **Les données** vivent dans le Google Sheet (transféré en §3).
- **Aucun secret** n'est sur l'ordi ni dans le dépôt : les clés sont dans les Propriétés du script.
- Désinstaller/oublier les outils locaux (éditeur, etc.) n'a aucun impact sur l'appli en ligne.

---

## 9. Checklist de vérification finale (après passation)

- [ ] Le Google Sheet appartient au compte asso et est en partage **Restreint**.
- [ ] `SHEET_ID` (dans `Code.gs`) pointe sur le Sheet de l'asso.
- [ ] Le backend est **re-déployé** sous le compte asso ; `API_URL` (config.js) = nouvelle URL `/exec`.
- [ ] `configurerCles(...)` relancé avec des **clés longues** ; saisie d'un score de test OK.
- [ ] `autoriserDrive()` relancé ; téléversement d'une affiche de test OK.
- [ ] Dépôts GitHub (`tournoi-r92`, `boutique-r92`) transférés ; **Pages** réactivées.
- [ ] Domaine branché (`tournoi.…` et `www.…`), **HTTPS** actif.
- [ ] **Liens croisés** mis à jour (plus aucun `rfl974.github.io` : `grep -rn "rfl974.github.io"`).
- [ ] Page publique : scores + classements + podium s'affichent et se rafraîchissent.
- [ ] (Si relais) Worker Cloudflare recréé, `SNAPSHOT_URL` + `configurerRelais(...)` à jour.
- [ ] Une **copie du dépôt** est archivée du côté de l'asso.

---

## 10. Ordre recommandé

1. Google : transfert du Sheet → re-déploiement (`API_URL`) → clés/Drive.
2. GitHub : transfert des dépôts → Pages.
3. Domaine : DNS → Pages custom domain → HTTPS.
4. Liens croisés : remplacer les URLs → pousser.
5. (Option) Relais Cloudflare.
6. Checklist §9 de bout en bout, avec un score et une affiche de test.
