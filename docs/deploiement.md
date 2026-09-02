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
| **Le nombre de lignes** | La dernière ligne affichée doit correspondre à `wc -l backend/Code.gs` — **8847** aujourd'hui *(2026-08-27)*. *(Une **ligne vide en plus** à la fin est normale ; **une de moins** = collage tronqué.)* ⚡ *(C'était **8519** au 2026-08-26 ; le lot **B2-1** a ajouté le registre des éditions.)* |
| **La fin du fichier** | La **dernière fonction déclarée** doit être celle du dépôt, au même numéro de ligne — **`viderDonnees`, ligne 8842** aujourd'hui *(2026-08-27)*. ⚡ *(C'était la ligne **8514** au 2026-08-26.)* |
| ⭐ **Une chaîne témoin introduite par le lot** | Une recherche qui donne **un résultat DIFFÉRENT avant et après** la modification — et, quand c'est possible, **son contraire** *(l'ancienne chaîne, attendue à 0)* |

> ⭐ **Les témoins du lot en cours** — à chercher dans l'éditeur, **en entier** :
>
> | Chercher | Attendu | De quel lot |
> |---|---|---|
> | 🆕 `basculerEditionApresReset` | **3** | 🆕 **M1-B2 / B2-1** — la bascule d'édition de la réinitialisation |
> | 🆕 `migrerEditionsMaintenant` | **2** | 🆕 **M1-B2 / B2-1** — la migration à lancer une fois, à la main |
> | 🆕 `Les 7 onglets ont été créés` *(l'ancienne)* | **0** | 🆕 **M1-B2 / B2-1** — ⭐ **son contraire**, attendu à zéro *(`setupSheet` en crée 8 désormais)* |
> | `D-048, coupure M1-PUB` | **1** | **M1-PUB / PUB-4** — la coupure du lien vers le site de l'association |
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
| **Le bilan** affiché en fin de journal | ⚡ **`R92 — 1367/1367 OK, 0 FAIL`** | Un nombre **plus petit** ⇒ c'est l'**ancien** `Tests.gs` qui a tourné. Un `FAIL` ⇒ une vraie régression |
| **La dernière ligne** du fichier collé chez Google | ⚡ **8275** *(et `Code.gs` à **11168**)* | Le fichier collé n'est pas celui du dépôt |

> 🚨 ⚡ **ATTENTION — CES TROIS VALEURS SONT ATTENDUES, ⛔ PAS ENCORE CONSTATÉES**
> *(portées le **2026-09-02**, lot **M1-B2 / B2-3.a/b**, commit `ed815fd`)*.
>
> ⭐ **C'est la première fois que ce tableau annonce des valeurs qui n'ont jamais été lues chez
> Google**, et il faut le dire net, parce que tout le reste de cette page enseigne le contraire.
>
> | | Bilan | `Test.gs` | `Code.gs` |
> |---|---|---|---|
> | 📁 **Dépôt GitHub, après B2-3.a/b** *(mesuré, commit `ed815fd`)* | **`1367/1367`** *(attendu)* | **8 275** lignes | **11 168** lignes |
> | ☁️ **Dernier constat RÉEL chez Google** *(2026-09-01, lot R-110)* | **`1238/1238`** | **7 130** lignes | **9 921** lignes |
>
> 🔬 **D'où vient le 1367** : `1238` *(dernier bilan réellement lu chez Google)* **+ 76** *(série
> B2-3.a)* **+ 53** *(série B2-3.b)*. ⭐ Ces 129 assertions **tournent déjà**, mais **sur GitHub
> Actions et sur la machine de développement**, ⛔ **pas chez Google** : les deux bancs Node
> extraient les vraies fonctions de `backend/Code.gs` et rejouent les séries `lancerTestsFFR`.
>
> ⛔ **CE QUI N'A PAS EU LIEU, ET QUI DOIT ÊTRE LU AVANT TOUT COLLAGE** : ⛔ **aucun collage**
> Apps Script, ⛔ **aucune exécution** chez Google, ⛔ **aucune migration**, ⛔ **aucune version
> nouvelle**, ⛔ **aucun déploiement**. La **Web App reste en version 161**.
>
> ⚠️ **Donc, au prochain collage complet** : lire **`1367/1367`** confirme que les deux fichiers du
> dépôt sont bien en place. ⭐ **Lire `1238/1238` ne serait PAS un succès** — ce serait le signe que
> l'ancien `Test.gs` a tourné, exactement ce que la colonne de droite décrit.
> ⭐ **Et ce n'est qu'à ce moment-là que ces trois valeurs deviendront des CONSTATS.**
>
> ⚡ *(Ce tableau annonçait **`1238`** / **7130** / **9921** — valeurs **constatées** chez Google le
> 2026-09-01, et vraies jusqu'au commit `ed815fd`. ⛔ Elles ne décrivent plus le dépôt.)*

> ⚡ **CES DEUX REPÈRES ONT ÉTÉ PORTÉS À `1238` / `7130` / `9921` LE 2026-09-01** *(lot **R-110**)*,
> et ils sont **constatés chez Google**, pas prédits : `lancerTestsFFR` a rendu
> **`R92 — 1238/1238 OK, 0 FAIL`** à **18:07:14**, après collage des deux fichiers.
> ⚡ *(Ils annonçaient **`1222/1222`**, `Test.gs` à **6958** et `Code.gs` à **9893** — vrai jusqu'à
> cette date. R-110 ajoute **16 assertions** : ⛔ **chercher `1222` après ce collage serait chercher
> la mauvaise valeur.**)*

> ⚡ **CES DEUX VALEURS ONT ÉTÉ CORRIGÉES LE 2026-09-01, ET L'ÉCART MÉRITE D'ÊTRE DIT.** Ce tableau
> annonçait encore **`974/974`** et **5554** comme « valeurs attendues aujourd'hui », alors que
> **`1222/1222`** avait été **constaté chez Google dès le 2026-08-27**. ⛔ **La source unique des
> repères de redéploiement a donc porté une valeur périmée pendant cinq jours** — exactement le
> mécanisme que **§8 quater** décrit, sur le document même qui est censé faire foi.
> 🎯 **Et le sens de l'écart était le piège habituel** : quelqu'un obtenant le **bon** résultat
> *(1222)* aurait lu ici qu'il devait en attendre 974, et aurait pu conclure à une anomalie.

> ✅ ⚡ **CONSTATÉ CHEZ GOOGLE — ces valeurs ne sont PLUS des prédictions** *(voir plus bas, relevé
> du 2026-08-27 sur le transport d'email, et session 33 du 2026-09-01)*. Le bloc ci-dessous est
> conservé pour son explication du **pourquoi** le nombre a changé.
>
> ⛔ ⚡ **CE BLOC N'EST PLUS L'ATTENDU DU JOUR — il est conservé pour son EXPLICATION seule**
> *(annoté le 2026-09-01, lot **R-110**)*. ⭐ **L'attendu du jour est dans le tableau ci-dessus :
> `1238` / `7130` / `9921`.** ⛔ Chercher les valeurs ci-dessous après un collage serait chercher
> les mauvaises.
>
> ⚠️ ⚡ **VALEURS À ATTENDRE APRÈS LE PROCHAIN COLLAGE — ⛔ PLUS `1210` !**
> *(branche `claude/b2-2-transport-email`, commit `c1d6309`)* :
> **`R92 — 1222/1222 OK, 0 FAIL`**, `Test.gs` à **6958** lignes et `Code.gs` à **9893**
> *(relevé par `wc -l` sur la branche, le 2026-08-27)*.
>
> ⚠️ **POURQUOI LE NOMBRE A CHANGÉ, ET CE QU'IL FAUT EN RETENIR.** La version **160** a donné
> **`1203/1210`** chez Google alors que le local donnait `1210/1210` : sept tests appelaient le
> **vrai** service d'envoi, que la doublure Node remplaçait par un succès silencieux *(**R-109**)*.
> La correction ajoute **12 assertions** — d'où **1222**. ⛔ **Chercher `1210` après ce collage
> serait chercher la mauvaise valeur.** ⚡ *(Ces valeurs ont d'abord été annoncées à
> **1134**, **6313** et **9586** — celles de la première passe, vraies jusqu'à ce que les
> quatre points de sûreté soient verrouillés le même jour.)*
>
> ⚠️ **CE SONT DES VALEURS PRÉDITES EN LOCAL, ⛔ PAS ENCORE MESURÉES CHEZ GOOGLE** *(`CLAUDE.md`
> §9 : **PROBABLE**, pas **CERTAIN**)*. ⛔ **Les valeurs du tableau ci-dessus restent celles à
> attendre tant que B2-2 n'est pas déployé.** ⭐ Elles ont été obtenues en exécutant le harnais
> **hors de Google**, dans une doublure Node — laquelle reproduit **exactement** `974/974` sur le
> code en service, ce qui est la seule raison de leur accorder du crédit.
>
> ✅ ⚡ **CE GESTE A ÉTÉ FAIT — `migrerClubsMaintenant()` a été LANCÉE le 2026-09-01**, sous le
> déploiement **version 161** : le classeur porte désormais **15 onglets**, `Clubs` *(3 lignes)* et
> `Participations` *(0 ligne)*, avec la marque `Config.migration_clubs_b22` = `2026-09-01 14:04:02`.
> ⛔ **Elle n'est donc plus à faire.** ⚡ *(Ce bloc disait « ⚠️ **ET UN GESTE DE PLUS SERA NÉCESSAIRE
> APRÈS LE REDÉPLOIEMENT** […] les deux nouveaux onglets n'apparaîtront pas d'eux-mêmes » : vrai
> jusqu'à cette date.)*
>
> ✅ **ELLE PEUT ÊTRE RELANCÉE SANS AUCUNE PRÉCAUTION D'INTERFACE** *(**R-110**, corrigé le
> 2026-09-01)*. Son message final est **journalisé** et n'attend **aucun clic** : elle rend la main
> même si le classeur est **fermé**. ⭐ **Prouvé en réel le 2026-09-01, 18:17:19 → 18:17:21**,
> classeur fermé : **2 secondes**, `Exécution terminée`, ⛔ aucune boîte de dialogue, aucune erreur,
> et le classeur **strictement inchangé** *(3 clubs, 0 participation, marque non réécrite)*.
>
> ⚡ *(Ce bloc disait : « elle affiche une **boîte de dialogue** après avoir terminé. Si le classeur
> n'est pas **ouvert et visible**, l'exécution attend **6 minutes** puis échoue sur `Exceeded
> maximum execution time` — **alors que tout a réussi**. Garder l'onglet du classeur visible et
> cliquer sur **OK** : la relance prend alors **4 secondes**. » — **vrai du 2026-09-01 14:09 au
> 2026-09-01 18:07**, jusqu'à la synchronisation du correctif dans la source Apps Script.)*
>
> ⭐ **Le même correctif vaut pour `migrerEditionsMaintenant()` et pour le message final de
> `setupSheet()`** : les trois passent par le point de passage unique `retourMaintenance(message)`.
> ⛔ **`configurerCles()` n'est PAS concernée** — ses fenêtres demandent une **vraie décision**,
> leur réponse est **lue**, et elle se lance depuis le **menu du classeur**.

> ✅ **CONSTATÉ CHEZ GOOGLE le 2026-09-01** *(lot **M1-B2 / B2-2**, phase réelle 2A)* : le serveur
> exécute la **version 161** — ⭐ **numéro relevé par Romain** dans *Déployer → Gérer les
> déploiements*, ⛔ aucun accès automatisé n'existe. C'est cette version qui a exécuté
> `migrerClubsMaintenant()`, et c'est elle qui porte le bilan **`1222/1222`**.
>
> ⚠️ ⚡ **ET CE CHIFFRE RESTE CELUI DE LA VERSION 161 — c'est exactement la divergence ouverte le
> 2026-09-01** *(**D-061**)*. ⭐ La **source de l'éditeur** porte désormais **`1238/1238`** *(lot
> R-110)* ; ⛔ **la version déployée 161, elle, en est restée à `1222`.** ⛔ **Les deux chiffres sont
> justes — ils ne décrivent simplement pas le même état.**
>
> ✅ ⚡ **VERSION 161 RECONSTATÉE LE 2026-09-01** *(lot **R-110**, en lecture seule dans
> *Déployer → Gérer les déploiements*)* : **un seul déploiement actif**, type **Application Web**,
> **version 161**, datée du **2026-08-27 20:47**. ⛔ **Aucune version nouvelle n'a été créée.**
>
> ⚠️ 🔴 **ET UNE DIVERGENCE EST ASSUMÉE DEPUIS CE JOUR — elle doit être lue avant tout
> redéploiement** *(**D-061**)*. La **source de l'éditeur** Apps Script porte le correctif **R-110**
> *(`Code.gs` **9921**, `Test.gs` **7130**, bilan **`1238/1238`**)* ; ⛔ **la version déployée 161
> ne le porte PAS.**
>
> 🎯 **Ce n'est pas un oubli, c'est un arbitrage vérifié.** Les trois fonctions corrigées —
> `migrerClubsMaintenant()`, `migrerEditionsMaintenant()` et `setupSheet()` — se lancent **depuis
> l'éditeur**, qui exécute la **source**, ⛔ **jamais la version déployée**. Et **aucun chemin
> `doGet`, `doPost` ni aucune action de la Web App ne les appelle** : `retourMaintenance` n'a que
> ces trois appelants, `executerMigrationClubs` un seul. ⭐ **Redéployer n'aurait donc rien changé
> pour un utilisateur** — c'est pourquoi aucune version n'a été publiée pour ce seul lot.
>
> ⭐ **CE QU'IL FAUT EN FAIRE** : ⛔ **ne jamais écrire que R-110 est présent dans la version
> déployée** ; ⭐ **le prochain déploiement fonctionnel du backend l'embarquera naturellement**, et
> c'est à ce moment-là que cette divergence se refermera — ⚠️ **sans geste supplémentaire, mais
> sans surprise non plus, puisqu'elle est écrite ici.**

> ⚡ **LA DIVERGENCE S'EST ÉLARGIE LE 2026-09-02, ET ELLE A CHANGÉ DE NATURE** *(lot **B2-3.a/b**,
> commit `ed815fd`)*. Elle ne portait que sur **R-110** ; elle porte désormais aussi sur **tout le
> socle et toute la persistance des terrains** — ⭐ **environ 1 200 lignes de `Code.gs` et 1 145 de
> `Tests.gs` qui n'existent QUE dans le dépôt.**
>
> ⛔ **Et cela ne change RIEN pour un utilisateur**, pour la même raison qu'en R-110, mais poussée
> plus loin : **aucune de ces fonctions n'est appelée**. Elles ne sont ni routées *(`ACTIONS_*`,
> `doGet`, `doPost`)*, ni lues par un écran, ni par `reinitialiserTournoi`, `enregistrerPlanTerrains`,
> `appliquerValeursFFR`, `getAll`, `getConfigClub`, `getConfigAdmin`, `getCapacitesCategories` ni
> `getDossierAutorisation`. ⭐ **Du code présent mais jamais appelé ne modifie aucun comportement.**
>
> ⚠️ **CE QUI CHANGERA AU PROCHAIN COLLAGE, et il faut s'y attendre** : le bilan passera de
> `1238` à **`1367`**, et les deux fichiers grandiront de ~1 200 et ~1 145 lignes. ⛔ **Ce n'est pas
> une anomalie** : c'est ce lot. ⛔ **Les trois onglets `TerrainsPlan`, `Terrains` et `MiniTerrains`
> et la colonne `Editions.terrains_plan_publie` ne seront PAS créés pour autant** — leur mise en
> place est un **geste explicite** *(`assurerStructureTerrainsB23`)* qui appartient à B2-3.e.

> ⚠️ **Le numéro **161** n'apparaissait NULLE PART dans le dépôt avant ce jour.** La dernière
> version nommée était la **160** *(celle qui donnait `1203/1210`)* ; le redéploiement du correctif
> de transport a bien eu lieu le 2026-08-27, ⛔ **mais son numéro n'avait pas été consigné**.
> 🎯 **C'est ici qu'il vit** *(**§8 quater** : une seule adresse de référence)*.

> ✅ **CONSTATÉ CHEZ GOOGLE le 2026-08-27** *(lot **M1-B2 / B2-1**)* : `lancerTestsFFR` exécutée
> **deux fois** dans l'éditeur Apps Script a donné **`R92 — 974/974 OK, 0 FAIL`**, avec `Test.gs` à
> **5554 lignes** et `Code.gs` à **8847** *(`viderDonnees` ligne **8842**)* — serveur passé en
> **version 159** *(la précédente était la **158**)*.
>
> ⭐ **Les DEUX exécutions, et la seconde n'est pas un doublon** : la première **avant** toute
> écriture *(10:09:44, 2,194 s)*, la seconde **après** la migration et trois régénérations
> *(11:00:06, 2,525 s)*. La seconde répond à une question que la première ne pouvait pas poser :
> l'onglet `Editions` existait alors, et un test qui aurait ouvert le vrai classeur par erreur
> aurait pu l'abîmer. ⭐ **Bilan vert ET registre intact après coup** : les deux ensemble prouvent
> que le harnais reste sans effet de bord.
>
> ⚡ *(Cette note disait « ⛔ **CES DEUX VALEURS SONT PRÉDITES, PAS ENCORE MESURÉES CHEZ GOOGLE**
> […] chez Google, le bilan est **toujours 881/881** avec `Tests.gs` à **5141 lignes** » — **vrai
> jusqu'au 2026-08-27**. ⭐ **974 n'est plus un PROBABLE mais un CERTAIN**, `CLAUDE.md` §9.)*

> 🎯 **Pourquoi deux nombres et pas un.** Le bilan seul ne dit **jamais quelle version** a été
> exécutée : « 573/573 OK » était un vrai résultat sur un faux fichier. Le nombre de lignes est ce
> qui identifie le fichier. **Les deux ensemble prouvent ce qu'un seul laisse croire.**

> ⚠️ **Ces deux valeurs changent quand les tests évoluent.** ⚡ Elles étaient de **881** et **5141**
> au 2026-08-26 *(lot **M1-PUB / PUB-4** : **+1 vérification** — le test du témoin de publication passe de 4 à 5
> affirmations ; elles étaient de **880** et **5133** depuis B2-0, de **796** et **4645** depuis
> M1-B, et de **715** et **4314** depuis C-012, étape 3)*.
>
> ✅ **CONSTATÉ CHEZ GOOGLE le 2026-08-26** : `lancerTestsFFR` exécutée dans l'éditeur Apps Script
> a donné **`R92 — 881/881 OK, 0 FAIL`**, exécution terminée normalement, avec `Test.gs` à
> **5141 lignes** et `Code.gs` à **8519** *(`viderDonnees` ligne **8514**)*. Le couple de témoins a
> répondu **1** et **0**, ⭐ **dans le bon sens tous les deux**.
> ⛔ **Le numéro de version du déploiement n'a PAS été relevé** au moment du collage : il n'est donc
> pas inscrit ici, et ⛔ **rien ne sera deviné** *(la version précédente, elle, était la **157**)*.
>
> ⚡ **ADDENDUM du 2026-08-27 — la lacune ci-dessus est comblée, et voici avec quelle certitude.**
> Le relevé fait **avant** le déploiement de B2-1 établit que la version en service ce jour-là était
> la **158**. ⭐ **Cela, c'est un CERTAIN** *(relevé dans « Gérer les déploiements »)*.
> ⚠️ **Que ce soit le collage du 2026-08-26 qui l'ait produite est un PROBABLE, pas un CERTAIN**
> *(`CLAUDE.md` §9)* : la déduction ne tient que si aucun autre déploiement n'a eu lieu entre les
> deux dates — ⛔ **et cela n'a pas été vérifié.** ⭐ **La phrase ci-dessus n'est donc pas réécrite** :
> elle reste vraie *(le numéro n'a effectivement pas été relevé ce jour-là)*, et ce qu'on sait de
> plus s'ajoute ici plutôt que de repeindre ce qu'on ne savait pas.
>
> ⚡ *(Ce bloc a d'abord annoncé « **881** est PRÉDIT, pas encore MESURÉ » — c'était vrai le
> 2026-08-26 **avant** le redéploiement, et faux **après**. ⭐ La valeur avait été calculée hors
> ligne *(880 − 4 + 5)*, puis **mesurée là où elle compte** : ce n'est plus un **PROBABLE** mais un
> **CERTAIN**, `CLAUDE.md` §9.)*
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

### 🆕 ✅ Onglet `Editions` — la migration a été FAITE *(M1-B2 / B2-1)*

> ✅ **CE GESTE A ÉTÉ EXÉCUTÉ le 2026-08-27**, après le redéploiement : `migrerEditionsMaintenant()`
> a répondu **`✅ Édition ouverte : f21ec93b-…`**, puis, relancée, **`ℹ️ Rien à faire : une édition
> est déjà active`** — ⭐ **avec le MÊME identifiant et la MÊME date de création, à la seconde près**.
> ⚡ *(Ce bloc disait « ⛔ **CE GESTE N'A PAS ENCORE ÉTÉ FAIT** » : vrai jusqu'à cette date.)*
>
> ⭐ **La procédure ci-dessous reste écrite, et c'est délibéré** : elle servira à **tout autre
> classeur** *(un second club, une réinstallation)*, et elle documente ce qui a réellement été fait.

**Ce que c'est.** Le lot **B2-1** introduit un **registre des éditions** *(onglet `Editions`)* qui
donne au tournoi une identité durable, `edition_id` — voir
[`structure-google-sheet.md`](structure-google-sheet.md). Un classeur **déjà en service** ne
possède pas cet onglet : il faut l'ouvrir une fois.

**Ce qu'il faut faire, après avoir recollé `Code.gs` :**

1. éditeur Apps Script → sélectionner la fonction **`migrerEditionsMaintenant`** → **Exécuter** ;
2. lire le message : *« ✅ Édition ouverte : … »* la première fois, *« ℹ️ Rien à faire : une édition
   est déjà active — … »* ensuite ;
3. ouvrir le classeur : l'onglet **`Editions`** contient **une ligne**, `statut` = `active`.

| ⭐ Ce que cette migration fait | ⛔ Ce qu'elle ne fait PAS |
|---|---|
| Créer l'onglet `Editions` s'il manque | ⛔ **Aucune réinitialisation**, aucune donnée effacée |
| Y écrire **une** ligne : identifiant, `active`, date de création | ⛔ Elle ne touche **ni** `Config`, **ni** les équipes, **ni** les poules, **ni** les matchs, **ni** les clubs |
| ⭐ **Rien du tout** si une édition est déjà active *(idempotente)* | ⛔ Elle ne crée **jamais** de doublon, même relancée dix fois |

> ⚠️ **Si le message dit « Migration refusée — Registre des éditions incohérent »** : c'est que
> plusieurs lignes portent `active`. ⭐ **Le logiciel ne choisit pas à votre place** — corrigez
> l'onglet à la main *(une seule ligne `active`, les autres `fermee`)*, puis relancez.

---

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

⛔ **Aucun lien avec le site vitrine [boutique-r92](https://rfl974.github.io/boutique-r92/)** (dépôt
séparé) : depuis le **2026-08-26**, ce site **n'interroge plus ce backend**, et publier un tournoi
n'y crée rien. ⚡ *(Ce paragraphe annonçait « quand le tournoi est publié, une carte d'actualité et
une page d'article y apparaissent » : vrai jusqu'au découplage M1-PUB / PUB-4.)*

> **Changer l'URL publique** (nouveau compte GitHub ou **nom de domaine**) : voir la procédure
> complète dans [`passation.md`](passation.md) (DNS, domaine personnalisé, liens croisés à mettre à jour).

## C. Montée en charge spectateurs
Cache serveur + rafraîchissement étalé sont **déjà actifs**. Un **relais CDN Cloudflare** optionnel
(dormant) peut être activé pour une garantie à très grande échelle : voir [`relais-cdn.md`](relais-cdn.md).
