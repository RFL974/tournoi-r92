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
- `…/exec?action=ping` → `{"ok":true,"message":"API tournoi en ligne"}`
- `…/exec?action=getConfig` → réglages globaux + catégories
- `…/exec?action=getAll` → tout (config, equipes, poules, matchs)

### ⚠️ REDÉPLOYER LE SERVEUR — la fiche complète

> **À suivre en entier, à chaque fois.** Les gestes **1, 2 et 4** comportent chacun des contrôles :
> ⛔ **aucun ne doit être tenu pour acquis sans avoir été effectué.** C'est là que se joue la
> différence entre une preuve et une illusion de preuve.

> 🔴 **UN CONTRÔLE DE VIE N'EST PAS UN CONTRÔLE DE VERSION** *(D-040, 2026-08-20)*
>
> Le `ping` prouve que le serveur **répond**. Il ne dit **jamais quelle version** il sert : sa
> réponse est **la même avant et après** n'importe quelle modification.
>
> ⭐ **La règle générale, et elle vaut pour tout contrôle** : *un contrôle qui donne le **même
> résultat avant et après** ne prouve **rien** sur la version.* Une preuve de version doit être
> **discriminante**.
>
> ⚠️ **Ce n'est pas une précaution théorique — c'est arrivé.** Le **2026-08-20**, une version a été
> publiée en croyant `Code.gs` recopié : le `ping` était **vert**, les tests donnaient
> **`703/703 OK, 0 FAIL`**, et **l'ancien `Code.gs` était toujours présent chez Google**.
>
> ⭐ **Pourquoi aucun des deux voyants ne pouvait le voir, et la nuance est importante :**
>
> - le **`ping`** rend **la même réponse** quelle que soit la version ⇒ il ne discrimine **rien** ;
> - les **703 vérifications**, elles, **s'exécutent bel et bien contre le `Code.gs` du projet** et
>   **détecteraient** une régression sur un comportement qu'elles couvrent. ⛔ **Mais elles ne
>   couvraient pas la modification en cause** — le nom d'expéditeur n'est touché par **aucun**
>   test. Le bilan était donc **vert et sincère**, et **muet sur ce qui avait changé**.
>
> ➡️ **La leçon** : un bilan de tests prouve **une non-régression sur ce qu'il couvre**. Il ne
> devient une preuve de version **que si au moins une vérification échoue sur l'ancien code** —
> autrement dit **que si elle est discriminante pour la modification du jour**. *(Le second repère
> du geste 4, le **nombre de lignes**, relève d'autre chose : il atteste l'**identité du fichier de
> tests** collé, pas celle de `Code.gs`.)*
>
> **Il a fallu un contrôle discriminant dans l'éditeur pour voir l'erreur.**
>
> **Les quatre états à ne jamais confondre :**
>
> ```
>   SOURCE            →   ÉDITEUR           →   VERSION DÉPLOYÉE   →   COMPORTEMENT OBSERVÉ
>   (le dépôt Git)        (geste 1 et 2)        (geste 3)              (ce que voit l'utilisateur)
>   prouvé par            prouvé par les        prouvé par le          prouvé SEULEMENT par
>   git / une empreinte   témoins discriminants geste 3, et lui seul   un résultat constaté
> ```
>
> ⛔ **Aucun de ces quatre états ne prouve le suivant.** Un lot dont l'effet ne s'observe que **hors
> du dépôt** *(un email reçu, une page servie)* exige une preuve **hors du dépôt**.

**1. Coller `Code.gs` — puis ENREGISTRER, puis VÉRIFIER**
Copier tout [`backend/Code.gs`](../backend/Code.gs) → **⌘A** dans le fichier `Code.gs` de l'éditeur
Apps Script *(tout sélectionner : coller sans sélectionner laisserait l'ancien code en dessous)* →
**⌘V** → ⚠️ **⌘S**.

> ⚠️ **Enregistrer explicitement avant de poursuivre.** Ne jamais considérer qu'un collage est
> acquis parce qu'il a été fait : **on enregistre, puis on vérifie ce qui est réellement là.**
>
> ⛔ **Ce garde-fou ne repose pas sur une cause démontrée.** L'incident du **2026-08-20** a établi
> **qu'un contenu attendu n'était pas présent chez Google** ; il n'a **pas** permis d'établir
> **quel geste** avait manqué — collage non fait, collage incomplet, ou état non enregistré. **Le
> contrôle qui suit vaut donc pour les trois cas.**

Puis **trois contrôles dans l'éditeur**, avant d'aller plus loin :

| Ce qu'on vérifie | Comment |
|---|---|
| **Le nombre de lignes** | La dernière ligne affichée doit correspondre à `wc -l backend/Code.gs` — **8519** aujourd'hui *(2026-08-26)*. *(Une **ligne vide en plus** à la fin est normale ; **une de moins** = collage tronqué.)* |
| **La fin du fichier** | La **dernière fonction déclarée** doit être celle du dépôt, au même numéro de ligne — **`viderDonnees`, ligne 8514** aujourd'hui *(2026-08-26)* |
| ⭐ **Une chaîne témoin introduite par le lot** | Une recherche qui donne **un résultat DIFFÉRENT avant et après** la modification — et, quand c'est possible, **son contraire** *(l'ancienne chaîne, attendue à 0)* |

> ⭐ **Les témoins du lot en cours** — à chercher dans l'éditeur, **en entier** :
>
> | Chercher | Attendu | De quel lot |
> |---|---|---|
> | 🆕 `D-048, coupure M1-PUB` | **1** | 🆕 **M1-PUB / PUB-4** — la coupure du lien vers le site de l'association |
> | 🆕 `EST dans cette liste` *(l'ancienne)* | **0** | 🆕 **M1-PUB / PUB-4** — ⭐ **son contraire**, attendu à zéro |
> | `CLUBS_COLONNES_ENGAGEMENT` | **4** | **B2-0** — la liste des colonnes que le reset vide |
> | `colonnesClubsNonClassees` | **2** | **B2-0** — le signalement d'une colonne non classée |
> | `CHAMPS_AUTORISATION_A_REINITIALISER` | **3** | **M1-B** — la liste des 26 champs d'édition |
> | `reinitialiserDonneesAutorisationTournoi` | **2** | **M1-B** — la fonction et son appel |
> | `API tournoi en ligne` | **1** | CF-4b / L8 |
> | `API Tournoi R92 en ligne` *(l'ancienne)* | **0** | CF-4b / L8 |
> | `Racing Club de France Rugby` *(l'ancien défaut)* | **0** | CF-4b / L8 |
>
> ⚡ **Les deux témoins de tête ont été ajoutés le 2026-08-26** *(lot **M1-PUB / PUB-4**)*, et ils
> forment un **couple** : ⭐ `D-048, coupure M1-PUB` **n'existait pas** avant ce lot *(attendu à
> **0** avant collage, **1** après)*, et `EST dans cette liste` est **la phrase qu'il remplace**
> *(attendu à **1** avant collage, **0** après)*. 🎯 **C'est le cas le plus fort au sens de D-040** :
> ⛔ un collage manqué ne peut pas donner les deux comptes à la fois. Tous deux sont **sans
> apostrophe, sans accent et sans guillemet**.
>
> ⚡ *(Cette note disait « les deux premiers témoins ont été ajoutés le 2026-08-25, lot **B2-0** » —
> **vrai jusqu'au 2026-08-26**, où deux lignes se sont insérées au-dessus. ⛔ Elle désignait les
> témoins par leur **position**, ce qui devient faux dès qu'un lot arrive : ils sont désormais
> nommés par leur **lot**.)*
>
> ⛔ **Les témoins B2-0 et M1-B restent valables** *(ils sont toujours dans le fichier)*, mais
> ⛔ **ils ne distinguent plus la version 157 de celle de ce lot** : seuls les deux témoins de tête
> le font.
>
> ⚡ **CORRIGÉ le 2026-08-24 — cette note annonçait que « la part BACKEND de L8 n'a JAMAIS été
> collée chez Google », et c'était FAUX.** Le relevé fait **avant** le collage de M1-B, exactement
> comme cette fiche le demande, a montré l'inverse : dans l'éditeur, `API tournoi en ligne` était
> déjà à **1** et l'ancienne chaîne à **0** — et l'URL publique servait **déjà**
> `{"ok":true,"message":"API tournoi en ligne"}`. **La part backend de L8 était donc déjà en
> service.**
>
> ⛔ **La date et le geste de cette mise en service ne sont PAS établis, et rien ne sera inventé.**
> `be57f97` (2026-08-22) est le **premier commit publié** du dépôt portant cette chaîne — ⛔ **mais
> cela ne date PAS le déploiement chez Google.** Un état **local**, non encore commité, peut être
> collé dans l'éditeur : *c'est même déjà arrivé dans ce projet* — la fiche de L5 parlait d'un
> « patch appliqué, non commité ». **Git date le dépôt, jamais le chantier.**
>
> 🎯 **La leçon, et elle vaut mieux que le constat** : ce sont **les témoins d'avant collage** qui
> l'ont révélé. Sans eux, nous aurions attribué à M1-B une mise en service faite par quelqu'un
> d'autre, un autre jour. **C'est exactement ce que D-040 demande de ne jamais supposer.**
>
> ⚠️ **Les deux témoins M1-B n'existaient pas avant ce lot** : leur compte attendu **avant** collage
> est **0**. C'est ce qui les rend discriminants *(D-040)* — ils sont aussi **sans apostrophe, sans
> accent et sans guillemet**, comme la règle l'exige.
>
> 🔴 **Ne JAMAIS raccourcir à `API tournoi`** : la recherche de l'éditeur est **insensible à la
> casse**, donc ces deux mots trouvent aussi l'**ancienne** chaîne `API **Tournoi** R92 en ligne`.
> Un témoin tronqué répondrait « 1 » sur un fichier **non collé**. ⚠️ Même famille de piège que
> l'apostrophe ci-dessous : *un témoin ne vaut que tapé en entier.*
>
> ⭐ **Et celui-ci a une propriété rare** : il est aussi **observable de l'extérieur**, au geste 5.
> C'est le seul des quatre états — le **comportement observé** — qu'aucun contrôle de l'éditeur
> n'atteint.

> ⚠️ **Le piège des caractères échappés, et il a failli faire conclure à un échec.** Une apostrophe
> dans une chaîne du code s'écrit `\'` : chercher `L'organisation du tournoi` renvoie **0** sur un
> fichier **parfaitement collé**. ➡️ **Choisir un témoin sans apostrophe, sans accent et sans
> guillemet** — ici `organisation du tournoi`.

**2. Coller `Tests.gs` — LE FICHIER QU'ON OUBLIE**
Copier tout [`backend/Tests.gs`](../backend/Tests.gs) → **⌘A**, **⌘V**, ⚠️ **⌘S** dans le fichier
`Test.gs` *(singulier chez Google)*. Son identité, elle, est prouvée au **geste 4**.

**3. Publier une nouvelle version du MÊME déploiement**
Sinon l'URL change et il faudrait la remettre à jour dans `config.js`. Pour garder la même URL :

> **Déployer → Gérer les déploiements → (crayon) Modifier → Version : « Nouvelle version » → Déployer.**

**4. Lancer les tests, et VÉRIFIER DEUX NOMBRES**
Sélectionner la fonction `lancerTestsFFR` → **Exécuter** → lire le journal.

| Ce qu'on vérifie | Valeur attendue **aujourd'hui** | Ce qu'un écart signifie |
|---|---|---|
| **Le bilan** affiché en fin de journal | **`R92 — 881/881 OK, 0 FAIL`** | Un nombre **plus petit** ⇒ c'est l'**ancien** `Tests.gs` qui a tourné. Un `FAIL` ⇒ une vraie régression |
| **La dernière ligne** du fichier collé chez Google | **5141** | Le fichier collé n'est pas celui du dépôt |

> 🎯 **Pourquoi deux nombres et pas un.** Le bilan seul ne dit **jamais quelle version** a été
> exécutée : « 573/573 OK » était un vrai résultat sur un faux fichier. Le nombre de lignes est ce
> qui identifie le fichier. **Les deux ensemble prouvent ce qu'un seul laisse croire.**

> ⚠️ **Ces deux valeurs changent quand les tests évoluent.** Elles sont justes **au 2026-08-26**
> *(lot **M1-PUB / PUB-4** : **+1 vérification** — le test du témoin de publication passe de 4 à 5
> affirmations ; elles étaient de **880** et **5133** depuis B2-0, de **796** et **4645** depuis
> M1-B, et de **715** et **4314** depuis C-012, étape 3)*.
>
> 🟡 **ATTENTION — `881` est PRÉDIT, pas encore MESURÉ** *(`CLAUDE.md` §9 : **PROBABLE**)*. Il est
> calculé hors ligne : **880 − 4 + 5**, les cinq affirmations du test opéré s'exécutant en ligne
> droite, sans boucle ni condition. ⛔ **Tant que le journal chez Google n'a pas été lu, ce nombre
> ne prouve rien** — c'est le geste 4 ci-dessus qui le transforme en **CERTAIN**.
> ⚡ *(Ce bloc annonçait « justes au 2026-08-25, lot B2-0, 880 et 5133 » : **vrai jusqu'au
> 2026-08-26**.)*
>
> ✅ **CONSTATÉ CHEZ GOOGLE le 2026-08-25** : `lancerTestsFFR` exécutée dans l'éditeur Apps Script
> a donné **`R92 — 880/880 OK, 0 FAIL`**, avec `Test.gs` à **5133 lignes** — serveur en **version
> 157**. *(Comme pour M1-B, la valeur avait d'abord été **prédite** hors ligne ; elle est
> désormais **mesurée là où elle compte** — ce n'est plus un **PROBABLE** mais un **CERTAIN**,
> `CLAUDE.md` §9.)*
>
> ⭐ **CE DOCUMENT EST LA SOURCE de ces deux repères** *(`CLAUDE.md` §8 quater)* : ⛔ **ne pas aller
> les chercher ailleurs, et ne pas les recopier ailleurs.** *(Une version antérieure de cette note
> renvoyait à `ETAT.md` §9 « pour le total attendu » — ⛔ **c'était l'inverse de la règle**, et
> `ETAT.md` renvoie désormais ici.)* Pour recalculer le nombre de lignes depuis le dépôt :
> `wc -l backend/Tests.gs`. **Le bilan, lui, ne se calcule pas : il se LIT dans le journal chez
> Google.**

**5. Vérifier que l'adresse publique répond**
`…/exec?action=ping` → `{"ok":true,"message":"API tournoi en ligne"}`

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
| **Ce qui est vérifié — ① la syntaxe** | La **syntaxe** de **tous** les fichiers `.js` de `frontend/`, bibliothèques extérieures comprises *(elles sont déposées à la main, donc elles peuvent arriver tronquées)*. L'outil est `node --check` |
| ⚡ **Ce qui est vérifié — ② trois COMPORTEMENTS** *(ajouté par M1-B / M1-B2, élargi par M1-PUB)* | ⭐ **Ce ne sont plus seulement des fichiers lisibles : ce sont des gestes qui marchent.** `tests/frontend-reinitialisation.test.js` *(ce que « Réinitialiser le tournoi » fait à l'écran)* · `tests/frontend-autorisation-sync.test.js` *(la demande d'autorisation FFR ne reste jamais périmée)* · 🆕 `tests/frontend-assistant-verrou.test.js` *(sur téléphone, ouvrir la carte « Publication » ne déverrouille aucune autre étape et n'en annonce aucune « faite » — **R-098 / B5**, ajouté le 2026-08-26)* · `tests/mutations-frontend.test.js` *(**le garde-fou du garde-fou** : il réintroduit des défauts et exige qu'ils soient attrapés)*. **Un échec de l'un d'eux refuse la publication**, exactement comme un fichier illisible |
| **Ce qui n'est PAS vérifié** | Le **style**, les conventions, la qualité — **rien de tout cela**. Ni le **HTML** : il ne contient aucun script en ligne, et contrôler sa syntaxe exigerait une dépendance que le projet a refusée. ⛔ **Ni le comportement RÉEL dans un navigateur** : ces contrôles de comportement s'exécutent avec des **doublures**, ⛔ **jamais contre le site publié**. ⭐ **C'est exactement ainsi que R-098 / B5 a échappé à 57 contrôles avant d'être trouvé par un doigt sur un vrai téléphone** *(2026-08-26)* |
| **Quand ça tourne** | À chaque envoi sur `main` **et** sur chaque proposition de fusion — on voit le problème **avant** qu'il atteigne `main` |
| **Sur une proposition de fusion** | Le contrôle tourne, **la publication est neutralisée** (`if: github.event_name != 'pull_request'`) |

> 🎯 **Pourquoi la syntaxe et rien d'autre.** Un contrôle trop exigeant qui refuserait de publier une
> **correction urgente le jour du tournoi** serait **pire que pas de contrôle du tout**. Celui-ci
> répond à une seule question : *ce fichier est-il lisible par un navigateur ?*

**Si la publication échoue** : ouvrir l'onglet **Actions** du dépôt → le travail
**« Vérifier la syntaxe des fichiers publiés »** nomme le fichier fautif et affiche l'erreur, avec
son numéro de ligne. ⚡ **Depuis B2-0, ce même travail peut aussi échouer sur un COMPORTEMENT** : le
journal affiche alors une ligne commençant par `ÉCHEC`, qui dit **quel contrôle** n'a pas tenu.

> ⭐ **Dernière publication CONSTATÉE** *(`CLAUDE.md` §8 septies — l'observation, pas le document)* :
> exécution **#227**, événement `push`, branche `main`, `head_sha` **`8dcff2b`**, le **2026-08-25**.
> **Job `verifier` : `success`** · **job `deploy` : `success`**, ⭐ **le journal de déploiement
> nommant `8dcff2b`**.
>
> ⚠️ **Ce que cette ligne prouve, et ce qu'elle ne prouve pas.** Elle établit que **GitHub a
> publié ce commit**. ⛔ **Elle ne dit rien du serveur Apps Script** *(section A — c'est un collage
> manuel, sans rapport)*, ⛔ **ni de ce qu'un visiteur voit** — cela ne se constate que dans un
> vrai navigateur *(`CLAUDE.md` §13.6)*.

Adresses (base `https://rfl974.github.io/tournoi-r92/`) :
- public : `…/tournoi.html` · admin : `…/admin.html` · saisie : `…/saisie.html` · perfs : `…/perfs.html`
- `index.html` redirige la racine vers `tournoi.html`.

**Intégration au site vitrine [boutique-r92](https://rfl974.github.io/boutique-r92/)** (dépôt séparé) :
quand le tournoi est publié, une carte d'actualité et une page d'article y apparaissent (elles
interrogent le même backend).

> **Changer l'URL publique** (nouveau compte GitHub ou **nom de domaine**) : voir la procédure
> complète dans [`passation.md`](passation.md) (DNS, domaine personnalisé, liens croisés à mettre à jour).

## C. Montée en charge spectateurs
Cache serveur + rafraîchissement étalé sont **déjà actifs**. Un **relais CDN Cloudflare** optionnel
(dormant) peut être activé pour une garantie à très grande échelle : voir [`relais-cdn.md`](relais-cdn.md).
