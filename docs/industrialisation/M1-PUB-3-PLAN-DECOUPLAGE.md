# M1-PUB / PUB-3 — Plan technique et preuves du découplage

> 📄 **Document d'EXÉCUTION.** Il est écrit par **PUB-3** et exécuté par **PUB-4**.
>
> ⛔ **PUB-3 ne coupe rien.** Aucun clic sur « Publier », aucun clic sur « Masquer », aucune preuve
> produite, aucune modification fonctionnelle. Ce document **écrit** ce que PUB-4 fera.
>
> 🎯 **Critère de validation de PUB-3** *(`PLAN.md` §15.3 bis)* : *le plan est assez précis pour que
> **PUB-4 n'ait plus aucune décision à prendre** — seulement à exécuter.*
> ✅ **ATTEINT le 2026-08-26** : les **quatre décisions** que ce plan avait laissées ouvertes ont été
> **tranchées par Romain** — **D-054**. Elles sont intégrées aux §③, §④ et §⑥.
> ⚡ *(Ce bloc annonçait « quatre décisions restent ouvertes » : vrai jusqu'au 2026-08-26.)*

| | |
|---|---|
| **Rattachement** | `PLAN.md` **§15.3 bis** · risque **R-097** · doctrine **D-048** |
| **Écrit le** | 2026-08-26 *(session 28)* |
| **Nature** | 📄 **Documentaire** — ⛔ aucun `backend/`, aucun `frontend/`, aucun test, aucun redéploiement |
| **Niveaux de preuve** | 🔬 lu dans le code · 📄 écrit dans un document · ⛔ non établi *(`CLAUDE.md` §9)* |

---

## ① Vérification directe des DEUX côtés — **constatée le 2026-08-26**

⚠️ **Le livrable ① exige une vérification À LA DATE DE PUB-3**, pas la reprise du relevé de PUB-1.
Elle a été faite, et **elle a trouvé un écart**.

### Côté vitrine — `RFL974/boutique-r92`

| Contrôle | Relevé du 2026-08-26 | §9 |
|---|---|---|
| Tête de la branche par défaut | **`164bb8e`** — ⭐ **identique au relevé de PUB-1**, dernière poussée le 2026-08-03 | 🔬 |
| Visibilité | **public** | 🔬 |
| Les 10 repères de ligne cités par R-097 | ✅ **Tous encore exacts** *(333, 343, 348, 353, 389, 409, 429, 476, 481, 797)* | 🔬 |

### Côté Maxilou — ce dépôt

| Contrôle | Relevé du 2026-08-26 | §9 |
|---|---|---|
| ⚠️ **Les repères de ligne de R-097 ont DÉRIVÉ** | `publierTournoi` était cité en **`Code.gs:7467-7472`** ; il est aujourd'hui en **`Code.gs:7547-7552`**. ⭐ **Le code n'a pas changé — le fichier, oui** *(`main` a avancé de 40 enregistrements depuis PUB-1)*. **L'inventaire ② porte les lignes du jour** | 🔬 |
| Le témoin est-il toujours exposé par les deux vues ? | ✅ **Oui** — `live` *(`Code.gs:707`)* et `invitation` *(`Code.gs:729`)* | 🔬 |

### Les deux sites visent-ils le même serveur ?

✅ **OUI** — ⛔ **et aucune adresse n'est recopiée ici** *(`CLAUDE.md` §8 quater)*.

> **La méthode, écrite pour pouvoir être prise en défaut** : les adresses de déploiement Apps Script
> ont été extraites des deux côtés par la même expression
> *(`https://script.google.com/macros/s/…/exec`)*, puis réduites aux **8 premiers caractères de leur
> empreinte SHA-256**. Vitrine : **`52e5c658`**. Maxilou *(`frontend/js/config.js`)* : **`52e5c658`**.
> **Une seule empreinte de chaque côté, et la même.**
>
> ⚠️ **Cette empreinte n'est PAS comparable à celle notée dans R-097** *(`c8c92c4e…`)* : **la méthode
> de calcul diffère**. ⛔ **Ce n'est pas une contradiction** — c'est pourquoi la méthode est écrite
> ici plutôt que le seul résultat.

---

## ② L'inventaire précis du périmètre

### ⛔ Côté vitrine — `boutique-r92`, commit `164bb8e` — **dépôt que ce chantier NE PILOTE PAS**

| # | Élément | `fichier:ligne` | Rôle |
|---|---|---|---|
| V1 | `TOURNOI_API_URL` | `assets/js/main.js:333` | L'adresse du serveur Maxilou. ⭐ **Utilisée NULLE PART ailleurs** dans ce fichier |
| V2 | `__infosTournoi` | `assets/js/main.js:338` | Mémoire locale du témoin |
| V3 | `chargerInfosTournoi()` | `assets/js/main.js:343-366` | Appelle `?action=getConfig` et calcule `publie` |
| V4 | `actuTournoi(t)` | `assets/js/main.js:389` | Fabrique la carte d'actualité |
| V5 | **L'insertion de la carte EN TÊTE** | `assets/js/main.js:427-432` | `if (t && t.publie) { rendreActus(…) }` |
| V6 | `chargerArticleTournoi()` | `assets/js/main.js:476-…` | Remplit la page `tournoi.html` de la vitrine |
| V7 | Les **deux appels au chargement** | `assets/js/main.js:798` *(`chargerActus`)* et `:799` *(`chargerArticleTournoi`)* | Déclenchés à **chaque** page du site |
| V8 | La page `tournoi.html` de la vitrine | `tournoi.html` | 🔴 **À RÉÉCRIRE en page STATIQUE et INDÉPENDANTE**, avec lien explicite vers Maxilou *(**D-054 / ③**)* — geste **G2** |

> ⭐ **Un point qui simplifie beaucoup la coupure, et il a été vérifié** : 🔬 `TOURNOI_API_URL`
> n'apparaît **qu'aux lignes 333 et 348**. Les autres chargements du site *(produits, sponsors,
> projets)* **n'utilisent pas ce serveur**. ⛔ **Couper le tournoi ne peut donc rien casser
> d'autre sur la vitrine.**

### Côté Maxilou — ce dépôt, commit `06800be`

| # | Élément | `fichier:ligne` | Sort attendu |
|---|---|---|---|
| M1 | `tournoi_publie` dans la vue **`invitation`** | `backend/Code.gs:729` *(1er champ)* | 🔴 **À RETIRER** |
| M2 | Le **commentaire** qui justifie M1 par la vitrine | `backend/Code.gs:723-727` | 🔴 **À RÉÉCRIRE** *(§8 ter)* |
| M3 | `testCfg_vitrineVoitTournoiPublie` | `backend/Tests.gs:776-790`, appelé en `:46` | 🔴 **À OPÉRER — ⛔ PAS à supprimer.** Voir l'encadré |
| M4 | `tournoi_publie` dans la vue **`live`** | `backend/Code.gs:707` | 🟢 **À CONSERVER — impératif** |
| M5 | `publierTournoi()` | `backend/Code.gs:7547-7552` | 🟢 **INCHANGÉ** — il écrit une ligne, il n'appelle personne |
| M6 | La réinitialisation remet le témoin à `non` | `backend/Code.gs:7658` | 🟢 **INCHANGÉ** |
| M7 | `estPublie()` de la page publique | `frontend/js/tournoi.js:206` | 🟢 **INCHANGÉ** — lit `getAll` *(vue `live`)* |
| M8 | `estPublie()` de l'admin | `frontend/js/admin-infos-publication.js:603` | 🟢 **INCHANGÉ** |
| M9 | Le **faux aperçu « Aperçu sur le site »** | `frontend/admin.html:162-180` + `majApercuTournoi` *(`admin-infos-publication.js:103`)* | 🟠 **DEVIENT FAUX** — ⚠️ appartient à **PUB-5**, ⛔ pas à PUB-4 |
| M10 | Le README annonce l'intégration comme livrée | `README.md:19, 22, 44, 232-233` | 🟠 **DEVIENT FAUX** — à corriger en PUB-4 *(§8 bis)* |
| M11 | Le renvoi d'architecture | `docs/architecture.md:230-242, 273` | 🟠 **À METTRE À JOUR** en PUB-4 |

> 🔴 **M3 — le test ne se supprime pas, il s'opère.** 🔬 `testCfg_vitrineVoitTournoiPublie` porte
> **quatre** affirmations, et elles n'ont pas le même sort :
>
> | # | Ce qu'elle affirme | Sort |
> |---|---|---|
> | 1 | la vue **`invitation`** expose `tournoi_publie` | 🔴 **À INVERSER** — devra affirmer qu'elle **ne l'expose PLUS** |
> | 2 | la vue **`live`** l'expose aussi | 🟢 **À CONSERVER** — ⭐ **c'est elle qui protège `tournoi.html` de Maxilou** |
> | 3 | le masquage remonte aussi *(via `invitation`)* | 🔴 **À DÉPLACER sur `live`** |
> | 4 | ouvrir le témoin n'ouvre rien d'autre *(le téléphone reste exclu)* | 🟢 **À CONSERVER** — frontière de vue, sans rapport avec la vitrine |
>
> 🎯 **Supprimer ce test en bloc supprimerait aussi la seule garantie que `live` expose encore le
> témoin** — exactement l'étape 6 du cadrage PUB-1, et exactement le défaut **silencieux** qu'elle
> existe pour empêcher.

### 🟢 Ce qui ne doit PAS bouger — la liste de non-régression

| | Pourquoi |
|---|---|
| La vue **`live`** et son `tournoi_publie` | 🔬 `tournoi.js` appelle **`getAll`** *(`frontend/js/tournoi.js:132`)*, **pas** `getConfig`. ⛔ **Retirer le témoin de `live` casserait la page publique de Maxilou en silence** |
| `publierTournoi` | Il n'a jamais parlé à personne — **D-048 est déjà respectée dans son code** |
| Le **jeu de tournoi fictif** du classeur | ⛔ **À CONSERVER jusqu'à PUB-4** *(`ETAT.md`)* |
| `url_tournoi_public` | ⛔ Rattaché à **R-096 / M1-D** *(D-049)*, hors périmètre |

---

## ③ L'ordre technique exact — gestes numérotés

> ⚠️ **L'ordre est impératif, et le cadrage PUB-1 dit pourquoi** : couper dans le désordre
> supprimerait l'ancien chemin de diffusion **avant** que l'organisateur dispose d'un accès
> autonome. ✅ **Cette condition est remplie — PUB-2 est clôturé.**
>
> ⚡ **Les gestes ci-dessous intègrent les quatre arbitrages de D-054** *(2026-08-26)*.

| Geste | Dépôt | Ce qu'on fait | ⛔ Ce qui doit être acquis AVANT le geste suivant |
|---|---|---|---|
| **G0** | — | ✅ **Déjà acquis** : PUB-2 clôturé, accès autonome vérifié en réel | — |
| **G1** | 🔴 `boutique-r92` | Sur une **branche dédiée** *(⛔ **jamais directement sur `main`** — **D-054 / ①**)* : retirer **V5** et **V7** *(les deux appels)*, puis **V1→V4, V6** devenus sans appelant. ⭐ **Les appels AVANT le code appelé** : à l'inverse, un instant de code cassé serait servi | ⛔ **RIEN** — la branche existe, ⛔ **aucune fusion, aucun déploiement** |
| **G2** | 🔴 `boutique-r92` | **Même branche** : réécrire `tournoi.html` en **page STATIQUE et INDÉPENDANTE**, avec un lien ou bouton **explicite** vers la page publique de Maxilou *(**D-054 / ③**)*. ⛔ **Aucun appel au serveur, aucune redirection automatique, aucune dépendance à `tournoi_publie`, ⛔ jamais « Aucun tournoi »** | ⭐ **Le TEXTE et la PRÉSENTATION sont proposés à Romain et validés AVANT mise en œuvre** |
| **G3** | 🔴 `boutique-r92` | **Présenter le diff complet et les contrôles**, puis — ⛔ **et seulement après autorisation explicite de Romain** — fusionner et déployer | ⭐ **Le découplage est RÉELLEMENT EN LIGNE côté vitrine** *(**D-054 / ④.1**)* |
| **G4** | 🔬 **preuve** | ⭐ **Vérifier EN PRODUCTION que la vitrine n'interroge plus le serveur Maxilou** — preuve `P1` *(**D-054 / ④.2**)* | La preuve `P1` est obtenue et notée |
| **G5** | 🔬 **preuve** | ⭐ **Vérifier que la page publique de Maxilou fonctionne TOUJOURS, indépendamment** — preuve `P2` *(**D-054 / ④.3**)* | La preuve `P2` est obtenue et notée |
| **G6** | 🔬 **preuve** | ⭐ **La séquence contrôlée en six temps** — preuves `P3` à `P8` du §④. ⛔ **Elle ne commence pas avant que G4 et G5 soient acquis** | ⭐ **Le témoin est revenu à `non`, constaté** |
| **G7** | 🟢 Maxilou | Retirer **M1** *(le témoin de la vue `invitation`)* et réécrire **M2** *(le commentaire, §8 ter)* | ⛔ Rien — le serveur n'est pas redéployé |
| **G8** | 🟢 Maxilou | Opérer **M3** — le test, selon le tableau des 4 affirmations | Bilan de tests local vert |
| **G9** | 🟢 Maxilou | **Redéployer Apps Script** | ⭐ **Preuve DISCRIMINANTE du redéploiement** *(**D-040**)* — ⛔ ni un `ping`, ni un bilan vert |
| **G10** | 🟢 Maxilou | Preuves `P9`/`P10`, puis mise à jour de **M10**, **M11** et des documents de suivi | — |

> ⭐ **Pourquoi la séquence de preuves (G6) vient AVANT le retrait côté Maxilou (G7), et c'est un
> renforcement, pas un détail d'ordonnancement.** À G6, la vue `invitation` **expose encore**
> `tournoi_publie` : la donnée est **toujours là, toujours servie, toujours accessible**. Constater
> qu'une publication reste **sans effet** dans ces conditions prouve que **c'est bien le lien qui a
> été coupé** — ⛔ et non que la donnée a disparu. 🎯 **Une preuve obtenue après G7 serait plus
> faible : on ne saurait pas laquelle des deux coupures a agi.**

---

## ④ Les preuves — ⛔ ÉCRITES ici, PRODUITES en PUB-4

> ⚡ **Qui produit quoi** *(**D-054 / ④** et `CLAUDE.md` **§8 octies**)* : les contrôles **sur
> ordinateur** sont conduits **par Claude Code avec Playwright MCP, dans un Chrome visible**, depuis
> une session locale. ⛔ **Toute preuve exigeant un téléphone réel reste produite par Romain.**
>
> 🟢 **Le jeu de tournoi fictif est CONSERVÉ jusqu'à l'enregistrement COMPLET de ces preuves**
> *(**D-054 / ④**)* — ⛔ pas jusqu'au début de PUB-4.

### ✅ La preuve « AVANT » — **déjà acquise, et sans rien publier** *(D-052)*

🔬 Constaté en production sur `rfl974.github.io/boutique-r92/tournoi.html` :

> *« Aucun tournoi en cours pour le moment. Reviens quand un tournoi sera annoncé ! »*

⭐ **Re-constaté le 2026-08-26 par Playwright**, dans un Chrome visible — ⚠️ **et l'écran affichait
d'abord `Chargement…`** : la preuve est le **second** état, jamais le premier *(§8 octies)*.

Cette phrase prouve **trois** choses : ① la vitrine interroge réellement ce serveur ; ② elle lit
réellement le témoin ; ③ elle réagit réellement à sa valeur.

⛔ **Reste non prouvée en production** : la moitié `oui`. ⭐ **Elle ne le sera jamais** — la produire
exigerait d'annoncer un tournoi **fictif** sur le site d'une association **réelle** *(D-052)*, ⛔ ce
que **D-054 / ②** interdit désormais explicitement.

### Les preuves « APRÈS » — dans l'ordre exact de D-054 / ④

| # | Après | Ce qu'on observe | ⭐ Ce qui rend la preuve valable |
|---|---|---|---|
| **P1** | G3 | ⛔ **Aucune requête** de la vitrine vers le serveur Maxilou | 🔬 Onglet réseau, ⛔ **pas la lecture du code**. ⚠️ **Cache du navigateur vidé d'abord** — `main.js` est servi par GitHub Pages |
| **P2** | P1 | La page publique **de Maxilou** fonctionne toujours, **indépendamment** | 🔬 Elle lit `getAll` *(vue `live`)* — ⛔ à constater, pas à déduire |
| **P3** | P2 | ⭐ **État INITIAL de la vitrine constaté** — page Actualités **et** `tournoi.html` | ⭐ **Le point de comparaison.** ⛔ Sans lui, « la vitrine n'a pas bougé » n'est pas démontrable |
| **P4** | P3 | **Publier le tournoi fictif dans Maxilou** → ⭐ **Maxilou RÉAGIT** | 🔬 La page publique de Maxilou passe en mode publié |
| **P5** | P4 | ⭐ **La vitrine ne réagit PAS** — identique à `P3` | 🎯 **C'est LA preuve du découplage** |
| **P6** | P4 | **Condition 5 de R-098** : *« Masquer » n'est JAMAIS grisé* · **contrôles 6 et 8** de `SESSIONS.md` §21.10 ter | ⭐ **Ferme les preuves reportées par D-052** |
| **P7** | P6 | ⭐ **Masquer IMMÉDIATEMENT** | ⛔ **Sans attendre.** Le tournoi fictif ne reste publié que le temps des constats |
| **P8** | P7 | ⭐ **État FINAL constaté : `tournoi_publie` = `non`** | ⛔ **La séquence n'est close qu'ici** |
| **P9** | G9 | Le serveur redéployé sert la **nouvelle** vue `invitation` | 🔬 `?action=getConfig` : ⛔ plus de `tournoi_publie` — ⭐ **preuve discriminante, D-040** |
| **P10** | G9 | Bilan de tests du serveur | ✅ Vert, **et le test opéré affirme désormais l'inverse pour `invitation`** |

> 🎯 **L'enchaînement G3 → G6 résout la contradiction qui a bloqué PUB-2.** Publier était impossible
> **tant que le lien existait**. En coupant d'abord, **publier devient inoffensif** — et la preuve
> qui manquait devient **gratuite**.

---

## ⑤ Le retour arrière

> ⛔ **Règle générale : ne jamais laisser un état intermédiaire en service.** Chaque geste se défait
> **dans l'ordre inverse** ; un retour arrière **partiel** est pire que pas de retour du tout.
>
> ⭐ **D-054 / ① réduit fortement le risque de G1-G2** : tant que la branche n'est pas fusionnée,
> **il n'y a rien à défaire** — la vitrine en ligne est intacte.

| Si… | Retour arrière | Coût |
|---|---|---|
| **G1/G2** ne conviennent pas | ⛔ **Rien à défaire** — la branche n'est pas fusionnée. On la corrige, ou on l'abandonne | Nul |
| **G3** casse la vitrine | `git revert` du commit de fusion dans `boutique-r92`, puis republication Pages. ⭐ **`164bb8e` est le point de retour connu** | Quelques minutes |
| **P1 échoue** *(la vitrine appelle encore)* | ⛔ **NE PAS aller à P4.** Chercher : cache navigateur ? page appelante non inventoriée ? ⭐ **Rien n'a été publié — aucun tort en cours** | Analyse seule |
| **P5 échoue** *(la vitrine réagit ENCORE)* | ⛔ **MASQUER IMMÉDIATEMENT**, avant toute analyse. ⚠️ **C'est le seul scénario où une fausse annonce est en ligne** — ⭐ **le masquage est la première action, l'analyse vient après** | Minutes, si le masquage est immédiat |
| **G7/G8** cassent un test | Revert local **avant** G9. ⛔ Rien n'est en service | Nul |
| **G9** casse la page publique de Maxilou | ⭐ Recoller la version précédente de `Code.gs` et redéployer, **avec preuve discriminante**. ⚠️ **Le classeur n'est pas touché** — aucune donnée en jeu | Minutes |
| **Une dépendance inattendue apparaît** | ⛔ **Arrêt.** Retour au dernier état prouvé, dépendance inscrite dans **R-097**, et **le plan est rouvert** — ⛔ pas contourné | — |

> ⭐ **Ce qu'aucun retour arrière n'a à traiter** : le **classeur**. Aucun geste n'écrit dans les
> données. `publierTournoi` reste inchangé, et le jeu fictif est conservé jusqu'à `P8`.

---

## ⑥ ⛔ Rien d'autre — et les quatre décisions, désormais PRISES

**PUB-3 n'a réalisé aucune modification fonctionnelle.** ⛔ Aucun `backend/`, aucun `frontend/`,
aucun test, aucun classeur, aucun redéploiement, ⛔ **aucune touche au dépôt `boutique-r92`**.

⚡ **Les quatre décisions que PUB-3 avait laissées ouvertes sont TRANCHÉES** — **D-054**, prise par
Romain le **2026-08-26**. ⛔ **Leur contenu vit dans `DECISIONS.md`** ; ci-dessous, seulement **ce
que PUB-4 doit en faire** *(`CLAUDE.md` §8 quater)*.

| # | Ce que PUB-4 doit respecter | Où c'est appliqué |
|---|---|---|
| **①** | `boutique-r92` : **branche dédiée**, ⛔ jamais `main` directement · ⛔ **aucune fusion, aucun déploiement** sans autorisation explicite **après présentation du diff et des contrôles** | **G1, G2, G3** |
| **②** | L'annonce du tournoi sur la vitrine reste **éditoriale et manuelle**. ⛔ **Jamais créée, modifiée ou retirée automatiquement** par Maxilou, `tournoi_publie` ou le serveur. ⛔ **PUB-4 ne fabrique AUCUNE annonce fictive** | **G1** *(la suppression du mécanisme automatique)* et **§④** |
| **③** | `tournoi.html` de la vitrine est **conservée**, en page **statique et indépendante**, avec lien/bouton **explicite** vers Maxilou. ⛔ Ni « Aucun tournoi » perpétuel, ni redirection automatique, ni appel au serveur, ni dépendance à `tournoi_publie`. ⭐ **Texte et présentation proposés à Romain AVANT mise en œuvre** | **G2** |
| **④** | Les preuves reportées se produisent **pendant PUB-4**, dans l'ordre **G3 → G4 → G5 → G6**, séquence en six temps *(P3→P8)*. ⭐ **Contrôles ordinateur par Playwright, Chrome visible** ; ⛔ **preuve téléphone par Romain**. 🟢 **Jeu fictif conservé jusqu'à `P8`** | **§③** et **§④** |

> ⭐ **Le visiteur reste sur le site de l'association tant qu'il ne choisit pas lui-même d'ouvrir
> Maxilou** — c'est la formulation de Romain, et elle porte tout le sens de **D-054 / ③** : la
> vitrine **informe**, elle ne **transfère** pas.

### ✅ Le critère de validation de PUB-3 est désormais atteint

> *« Le plan est assez précis pour que **PUB-4 n'ait plus aucune décision à prendre** — seulement à
> exécuter. »*

⛔ **Une seule chose reste à soumettre avant exécution**, et **D-054 / ③ l'exige explicitement** :
le **texte et la présentation** de la nouvelle `tournoi.html`. ⭐ **Ce n'est pas une décision
laissée ouverte** — c'est une **validation de rédaction**, inscrite comme une étape du plan *(G2)*.
