# Déploiement

## A. Backend — Google Apps Script ✅ (fait)

État : **déployé en Web App et fonctionnel** (l'API répond en JSON).

> ⚠️ **Le serveur, c'est DEUX fichiers — pas un.**
>
> | Fichier du dépôt | Nom chez Google | Rôle |
> |---|---|---|
> | [`backend/Code.gs`](../backend/Code.gs) | `Code.gs` | **le logiciel** — tout ce que le serveur sait faire |
> | [`backend/Tests.gs`](../backend/Tests.gs) | **`Test.gs`** *(au singulier chez Google — ce n'est pas un autre fichier)* | **la preuve** — les vérifications automatiques |
>
> **Coller l'un sans l'autre est le piège n° 1 de ce projet**, et il s'est déjà refermé : le
> 2026-08-04, seul `Code.gs` a été recollé. Les tests ont répondu « **573/573 OK** » — un résultat
> **vrai** mais qui portait sur l'**ancien** fichier de tests, donc une **preuve fausse** inscrite
> au dossier pendant quatre jours. Voir `docs/industrialisation/RISQUES.md` (**M-04**).

Étapes réalisées :
1. Coller le contenu de [`backend/Code.gs`](../backend/Code.gs) dans l'éditeur Apps Script du Sheet.
2. Coller le contenu de [`backend/Tests.gs`](../backend/Tests.gs) dans le fichier `Test.gs`.
3. Lancer une fois `setupSheet()` → crée les **7 onglets** (`Equipes`, `Poules`, `Matchs`,
   `Historique`, `ClubsInvites`, `Sponsors`, `Config`).
4. **Déployer → Nouveau déploiement → Type : Application Web**.
   - Exécuter en tant que : **Moi**.
   - Qui a accès : **Tout le monde** (nécessaire pour que les visiteurs lisent le planning/live).
5. Copier l'**URL de la Web App** (se termine par `/exec`).
6. Coller cette URL dans [`frontend/js/config.js`](../frontend/js/config.js) (constante `API_URL`).

> ℹ️ Les 4 onglets `RefFFR_*` (référentiel fédéral) ne sont **pas** créés par `setupSheet` : ils se
> remplissent à la main. L'onglet `Mesures` est créé **à la demande**, au premier relevé.

### Tester l'API
Ouvrir l'URL dans un navigateur en ajoutant un paramètre `action` :
- `…/exec?action=ping` → `{"ok":true,"message":"API Tournoi R92 en ligne"}`
- `…/exec?action=getConfig` → réglages globaux + catégories
- `…/exec?action=getAll` → tout (config, equipes, poules, matchs)

### ⚠️ REDÉPLOYER LE SERVEUR — la fiche complète

> **À suivre en entier, à chaque fois.** Les gestes 2 et 4 sont ceux qu'on oublie, et ce sont
> précisément ceux qui font la différence entre une preuve et une illusion de preuve.

**1. Coller `Code.gs`**
Copier tout [`backend/Code.gs`](../backend/Code.gs) → coller dans le fichier `Code.gs` de l'éditeur
Apps Script.

**2. Coller `Tests.gs` — LE FICHIER QU'ON OUBLIE**
Copier tout [`backend/Tests.gs`](../backend/Tests.gs) → coller dans le fichier `Test.gs`
*(singulier chez Google)*.

**3. Publier une nouvelle version du MÊME déploiement**
Sinon l'URL change et il faudrait la remettre à jour dans `config.js`. Pour garder la même URL :

> **Déployer → Gérer les déploiements → (crayon) Modifier → Version : « Nouvelle version » → Déployer.**

**4. Lancer les tests, et VÉRIFIER DEUX NOMBRES**
Sélectionner la fonction `lancerTestsFFR` → **Exécuter** → lire le journal.

| Ce qu'on vérifie | Valeur attendue **aujourd'hui** | Ce qu'un écart signifie |
|---|---|---|
| **Le bilan** affiché en fin de journal | **`R92 — 661/661 OK, 0 FAIL`** | Un nombre **plus petit** ⇒ c'est l'**ancien** `Tests.gs` qui a tourné. Un `FAIL` ⇒ une vraie régression |
| **La dernière ligne** du fichier collé chez Google | **4038** | Le fichier collé n'est pas celui du dépôt |

> 🎯 **Pourquoi deux nombres et pas un.** Le bilan seul ne dit **jamais quelle version** a été
> exécutée : « 573/573 OK » était un vrai résultat sur un faux fichier. Le nombre de lignes est ce
> qui identifie le fichier. **Les deux ensemble prouvent ce qu'un seul laisse croire.**

> ⚠️ **Ces deux valeurs changent quand les tests évoluent.** Elles sont justes **au 2026-08-06**
> *(chantier **C-011** : +27 vérifications sur le barème et le départage)*.
> Les valeurs de référence à jour se lisent toujours dans le dépôt :
> `wc -l backend/Tests.gs` pour le nombre de lignes, et
> `docs/industrialisation/ETAT.md` §9 pour le total attendu.

**5. Vérifier que l'adresse publique répond**
`…/exec?action=ping` → `{"ok":true,"message":"API Tournoi R92 en ligne"}`

> ⚠️ **Portée exacte de ce contrôle, et il faut la connaître** : les tests tournent dans
> l'**éditeur**, donc contre le code **enregistré dans le projet**. Ils ne prouvent pas à eux seuls
> que l'**adresse web publique** sert cette version — Apps Script permet de figer un déploiement sur
> une version antérieure. C'est le geste **3** qui couvre ça, et lui seul.

### 🔧 Colonnes de l'onglet `Matchs` — migration automatique
Les évolutions successives (phase après-midi, formats, score détaillé, arbitre) ont ajouté des
colonnes à l'onglet `Matchs`. **Aucune manip manuelle** : après redéploiement, les en-têtes
manquants sont **créés automatiquement à droite** (fonction `assurerColonnesMatchs`) dès la première
génération. Il suffit donc de **redéployer** le backend.

*(Cette fonction remplace l'ancienne `assurerColonnePhase`, qui n'existe plus.)*

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

### 🚦 Un contrôle passe AVANT la publication *(chantier C-013, referme R-043)*

**Depuis le 2026-08-06, rien ne part en ligne sans avoir été vérifié.**

Le workflow contient **deux travaux** : `verifier` s'exécute **d'abord**, `deploy` en **dépend**
(`needs: verifier`). Si le contrôle échoue, **la publication n'a pas lieu du tout** — et
**le site déjà en ligne reste intact**.

| | |
|---|---|
| **Ce qui est vérifié** | La **syntaxe** de **tous** les fichiers `.js` de `frontend/`, bibliothèques extérieures comprises *(elles sont déposées à la main, donc elles peuvent arriver tronquées)*. L'outil est `node --check` |
| **Ce qui n'est PAS vérifié** | Le **style**, les conventions, la qualité — **rien de tout cela**. Ni le **HTML** : il ne contient aucun script en ligne, et contrôler sa syntaxe exigerait une dépendance que le projet a refusée |
| **Quand ça tourne** | À chaque envoi sur `main` **et** sur chaque proposition de fusion — on voit le problème **avant** qu'il atteigne `main` |
| **Sur une proposition de fusion** | Le contrôle tourne, **la publication est neutralisée** (`if: github.event_name != 'pull_request'`) |

> 🎯 **Pourquoi la syntaxe et rien d'autre.** Un contrôle trop exigeant qui refuserait de publier une
> **correction urgente le jour du tournoi** serait **pire que pas de contrôle du tout**. Celui-ci
> répond à une seule question : *ce fichier est-il lisible par un navigateur ?*

**Si la publication échoue** : ouvrir l'onglet **Actions** du dépôt → le travail
**« Vérifier la syntaxe des fichiers publiés »** nomme le fichier fautif et affiche l'erreur, avec
son numéro de ligne.

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
