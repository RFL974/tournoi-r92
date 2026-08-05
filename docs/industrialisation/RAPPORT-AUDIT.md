# RAPPORT D'AUDIT — Tournoi R92

> **Ce document est la synthèse complète de l'ÉTAPE 2** : les huit domaines d'audit, les
> **88 problèmes** trouvés, ce qui a été vérifié et s'est révélé sain, ce qui reste à décider, et
> ce que je recommande de faire — dans quel ordre.
>
> Il ne remplace aucun des documents de suivi. Il les **rassemble** :
> `AUDIT.md` **explique** chaque problème · `RISQUES.md` les **suit** · `ETAT.md` dit **où on en
> est** · `PLAN.md` dira **quoi faire**.

**Établi le** : 2026-08-05, à la clôture de la session 12
**Périmètre** : dépôt `tournoi-r92` — serveur (`backend/`), navigateur (`frontend/`),
documentation (`docs/`), automatisation (`.github/`)
**Hors périmètre** : le dépôt `boutique-r92` (site vitrine — ✅ décision **D-005** tranchée le
2026-08-05 : il **reste hors périmètre**) et la conformité réglementaire FFR (chantier distinct,
décision **D-003**)

---

> ## ⚠️ POST-SCRIPTUM — à lire avant de citer un chiffre de ce rapport
>
> **Ce rapport est CLOS. Il photographie l'ÉTAPE 2 au 2026-08-05, et ses chiffres ne sont pas mis
> à jour.** Il n'est pas réécrit après coup — le réécrire ferait perdre la seule chose qu'il
> apporte : **ce qu'on savait, et quand.**
>
> Deux choses ont bougé **après** sa clôture. Elles ne l'invalident pas, mais un lecteur qui
> l'ouvre aujourd'hui doit les connaître :
>
> | Quoi | Où en lire l'état à jour |
> |---|---|
> | **Les 6 décisions listées en §5.2 comme « en attente » sont TOUTES TRANCHÉES** *(session 13, 2026-08-05)* — dont **D-025** *(lot ① des tests avant la correction du départage)*, **D-020** *(les 7 durées de conservation)*, **D-018**, **D-019**, **D-005**, **D-009** | `ETAT.md` §7 · `DECISIONS.md` |
> | **I-16 est levée** — le site vitrine porte déjà une page RGPD, qui **nomme le responsable et l'adresse de contact**. Le remède de **R-028** devient une **section à ajouter**, pas une page à créer *(le problème, lui, reste entier)* | `ETAT.md` §8 |
> | ⚡ **Un 89ᵉ problème est entré au registre — R-089**, le **tournoi suspendu ou annulé** pour force majeure. **Aucun des huit domaines ne l'avait vu** : il a été **apporté par Romain** (**D-030**). Deux inconnues en découlent : **I-10 élargie** au tournoi entier, et **I-21** *(peut-on réduire le temps de jeu ?)* | `DECISIONS.md` **D-030** · `RISQUES.md` |
>
> **En clair** : le **88** de ce rapport reste juste — c'est le résultat de l'audit, et il ne
> bougera plus. Le registre de suivi, lui, en compte **89** parce qu'il continue de vivre.
> Confondre les deux laisserait croire que l'audit avait vu ce qu'il n'a pas vu — exactement
> l'erreur que **M-06** cherche à empêcher. C'est aussi **M-05** en action : *l'audit photographie
> une application qui bouge*, et son **périmètre fonctionnel** bouge aussi.

---

## SOMMAIRE

- [Comment lire ce rapport](#comment-lire-ce-rapport)
- [1. Le résultat en une page](#1-le-résultat-en-une-page)
- [2. Ce qui est sain — et qu'il ne faut surtout pas casser](#2-ce-qui-est-sain--et-quil-ne-faut-surtout-pas-casser)
- [3. Les huit domaines, un par un](#3-les-huit-domaines-un-par-un)
  - [A — Métier](#domaine-a--métier--13-problèmes)
  - [C — Sécurité](#domaine-c--sécurité--14-problèmes)
  - [B — Protection des données](#domaine-b--protection-des-données--13-problèmes)
  - [D — Tests](#domaine-d--tests--10-problèmes)
  - [E — Expérience d'utilisation](#domaine-e--expérience-dutilisation--10-problèmes)
  - [F — Performance](#domaine-f--performance--11-problèmes)
  - [G — Architecture](#domaine-g--architecture--10-problèmes)
  - [H — Qualité du code](#domaine-h--qualité-du-code--7-problèmes)
- [4. Les six risques de méthode](#4-les-six-risques-de-méthode)
- [5. Ce qui reste à décider, et ce qui reste à savoir](#5-ce-qui-reste-à-décider-et-ce-qui-reste-à-savoir)
- [6. Ce que je recommande, et dans quel ordre](#6-ce-que-je-recommande-et-dans-quel-ordre)
- [7. Les limites de cet audit — ce qu'il ne prouve pas](#7-les-limites-de-cet-audit--ce-quil-ne-prouve-pas)

---

## COMMENT LIRE CE RAPPORT

### Les quatre niveaux de gravité

| | Ce que ça veut dire, en français courant |
|---|---|
| **P0 — BLOQUANT** | Peut **rendre l'application inutilisable**, **perdre des données**, **exposer gravement des informations personnelles** ou **produire un résultat sportif faux** |
| **P1 — IMPORTANT** | À corriger **avant une vraie utilisation** du logiciel |
| **P2 — AMÉLIORATION** | Utile, mais rien ne casse si on attend |
| **P3 — ROADMAP** | Bonne idée à garder, **à ne pas faire maintenant** |

### Les trois niveaux de certitude

| | |
|---|---|
| **CERTAIN** | Constaté directement dans le code, ou vérifié par une mesure |
| **PROBABLE** | Déduction technique solide, qui demanderait une vérification |
| **INCONNU** | Impossible à établir sans une information ou un essai supplémentaire |

> ⚠️ **Une règle a été tenue d'un bout à l'autre** : *ne jamais présenter une hypothèse comme un
> fait*. Quand quelque chose n'a pas pu être vérifié, c'est écrit **NON VÉRIFIÉ**, en toutes lettres.

### Où sont passés les problèmes déjà corrigés ?

**Un seul l'a été** : **R-014**, l'unique P0. Il est **corrigé, déployé et testé**. Tous les autres
sont au statut **IDENTIFIÉ** : ils ont été vus, rien de plus. **Aucune ligne de l'application n'a
été modifiée par ce chantier**, à cette exception près.

---

## 1. LE RÉSULTAT EN UNE PAGE

### Le tableau de bord

| Gravité | Nombre | Où ils sont |
|---|---|---|
| **P0 — bloquant** | **1** | ✅ **corrigé, déployé, testé** (R-014) |
| **P1 — important** | **23** | 5 métier · 5 sécurité · 3 données · 4 tests · 2 expérience · 2 performance · 2 architecture · 0 qualité du code |
| **P2 — amélioration** | **53** | répartis sur les 8 domaines |
| **P3 — plus tard** | **11** | répartis sur les 8 domaines |
| **TOTAL** | **88** | |
| **Risques de méthode** | **6** | M-01 → M-06 — ils ne portent pas sur le logiciel, mais sur **la façon dont il est audité** |

| Domaine | Problèmes | P0 | P1 | P2 | P3 | Session |
|---|---|---|---|---|---|---|
| **A** — Métier | 13 | — | 5 | 7 | 1 | 5 |
| **C** — Sécurité | 14 | **1** ✅ | 5 | 6 | 2 | 6 |
| **B** — Protection des données | 13 | — | 3 | 9 | 1 | 7 |
| **D** — Tests | 10 | — | 4 | 5 | 1 | 8 |
| **E** — Expérience d'utilisation | 10 | — | 2 | 7 | 1 | 9 |
| **F** — Performance | 11 | — | 2 | 7 | 2 | 10 |
| **G** — Architecture | 10 | — | 2 | 7 | 1 | 11 |
| **H** — Qualité du code | 7 | — | **0** | 5 | 2 | 12 |

### Les six phrases à retenir

**1. L'application est excellente AVANT le coup d'envoi, et rigide APRÈS.**
Les cinq problèmes importants du métier apparaissent tous **le jour J**, quand la réalité s'écarte
du plan : un forfait, un match non saisi, un terrain impraticable, une égalité parfaite, une faute
de frappe sur un score. Avant le tournoi, tout est prévu. Pendant, presque rien.

**2. Il n'y a pas de personnes, seulement deux mots de passe partagés.**
Sept des quatorze problèmes de sécurité en découlent : on ne peut retirer l'accès à personne, on ne
sait jamais qui a fait quoi, et **une contestation de score est inarbitrable**.

**3. La collecte de données est exemplaire ; le silence ne l'est pas.**
L'application **n'identifie aucun enfant** — pas un nom, pas une date de naissance. Mais elle ne dit
**rien à personne**, et **rien ne s'efface jamais** : ce n'est pas un choix contestable, c'est un
choix **qui n'a jamais été fait**.

**4. On teste ce qui a été construit récemment, pas ce qui compte depuis le début.**
589 vérifications existent et passent — mais **aucune ne met deux équipes à égalité** pour vérifier
le départage. Le cœur historique (classement, saisie du score) marche depuis si longtemps que
personne n'a éprouvé le besoin de le protéger. **C'est précisément ce que les corrections vont
modifier.**

**5. Ce qui est lent, ce n'est pas le code : c'est le lieu.**
Une action qui ne fait **strictement rien** met déjà **1,6 seconde** à répondre, parce qu'elle passe
par Google Apps Script. Aucune optimisation ne descendra sous ce plancher. Le relais qui règle ce
problème est **écrit, documenté — et n'a jamais été allumé**.

**6. Le code est en bien meilleur état que ce que le projet raconte de lui-même.**
Les deux derniers domaines rendent le même verdict. Les fondations sont saines ; ce sont les
documents — et, depuis peu, les commentaires — qui décrivent une application qui n'existe plus.

---

## 2. CE QUI EST SAIN — ET QU'IL NE FAUT SURTOUT PAS CASSER

> ⚠️ **Cette section compte autant que la liste des problèmes.** Un audit qui ne liste que ce qui
> ne va pas donne une image fausse — et, pire, il laisse casser à la correction suivante ce qui
> marchait très bien.

### Le cœur sportif est juste, et il est isolé

- **`calculerPlanning`** — 213 lignes, la fonction qui décide **quel match se joue où et quand** —
  ne contient **aucune référence à Google**. C'est du calcul pur. ⚠️ **À ne perdre sous aucun
  prétexte** : c'est le seul endroit où une erreur produirait des résultats sportifs faux.
- Le classeur Google n'est ouvert qu'à **8 endroits** dans 8 147 lignes ; **92 fonctions** le
  reçoivent en paramètre au lieu d'aller le chercher. C'est ce qui rend possibles **589
  vérifications sans aucun classeur**.
- **Le barème du classement est écrit deux fois — et les deux copies sont identiques au caractère
  près.** Vérifié en **exécutant** les deux versions côte à côte : **179 comparaisons, 0 écart**.

### La sécurité est meilleure que la moyenne

- Les mots de passe ne sont **nulle part** dans le dépôt — historique **complet** relu, 513
  enregistrements, **aucune fuite**.
- Les textes affichés sont **systématiquement neutralisés** (personne ne peut injecter du code par
  un nom d'équipe).
- L'adresse d'un courriel est **toujours relue dans le classeur**, jamais fournie par le navigateur.
- **Un club ne peut jamais voir la fiche d'un autre.**
- Le classeur est **privé** (vérifié), et la page qui le sert s'exécute au nom du propriétaire.

### La protection des données part de très haut

- **Aucun enfant n'est identifié** — recherche sur l'ensemble du dépôt. Les mineurs sont des
  **nombres**, jamais des noms.
- L'email d'un club n'est **jamais renvoyé**, pas même au club concerné.
- Un envoi groupé envoie **un courriel par club**, jamais un courriel commun.
- Le téléphone du contact public a été **volontairement retiré** de la page publique, **avec la
  raison écrite dans le code**.
- **Aucun cookie, aucun traceur tiers, aucun outil de mesure d'audience extérieur.**
- Les documents PDF sont fabriqués **entièrement sur l'appareil**.

### Le harnais de tests est réel et entretenu

- **3 711 lignes, 278 tests, 589 vérifications, 0 échec** — et il grandit depuis la session 5.
- Il est **rejouable hors de Google** : démontré, `589/589` en une seconde sur cet ordinateur.
- Il est **reproductible** : le tirage au sort est un interrupteur que les tests coupent.
- Il est **prudent par construction** : des tests vérifient qu'un **format de tournoi inventé**
  retombe sur le chemin prudent. C'est rare, et c'est excellent.
- Les écritures simultanées sont **sérialisées par un verrou**.

### L'interface sait déjà bien faire — là où elle a été faite récemment

- Contrastes de la page de saisie : **de 9,6 à 21** pour 4,5 exigé.
- Administration : **578 textes conformes sur 603** (96 %), **208 cibles cliquables sur 212**
  au-dessus du seuil.
- La saisie détaillée U14 est **exemplaire** : boutons de **44 × 44 px**, total en points **calculé
  et affiché en grand**.
- **28 confirmations** dans l'administration, dont deux qui **nomment le nombre exact de scores**
  qui seront effacés **et exigent la re-saisie du mot de passe**.
- **Le double-clic est bloqué.** Une saisie en cours de frappe **n'est jamais écrasée**. Corriger un
  score validé **redemande le mot de passe**.
- **Aucun débordement horizontal jusqu'à 320 px** de large.

### Le travail de performance a été fait — et bien fait

- Page publique **prête en 527 ms**, **59 Ko** transférés hors logo, 12 fichiers.
- Les calculs du navigateur sont **négligeables** : réaffichage complet des deux vues en **0,9 ms**.
  ⚠️ **Il ne faut surtout pas y toucher.**
- **25 lectures simultanées** servies **25 fois sur 25, sans une erreur**.
- Le cache serveur **divise le temps par trois** ; la « ruée sur le cache » est **traitée** ; la
  taille est mesurée en **octets réels** et non en caractères, avec le commentaire disant que le
  piège avait déjà été rencontré.
- Le rafraîchissement **se met en pause en arrière-plan**, est **étalé au hasard**, **n'empile
  jamais** deux requêtes et **abandonne au bout de 12 s**.

### Le code lui-même est propre

| | Serveur | Navigateur |
|---|---|---|
| Longueur **médiane** d'une fonction | **10 lignes** | **9 lignes** |
| Blocs de 8 lignes recopiés | **0** sur 8 147 l. | 2 sur 17 712 l. |
| Fonctions mortes | **1** sur 277 | **0** sur 600 |
| Fonctions expliquées par un commentaire | **89 %** | **92 %** |
| Commentaires citant du code disparu | **0** | **0** |

- Les commentaires expliquent le **pourquoi**, donc aussi **ce qu'il ne faut pas défaire**.
- Quand une fonction déménage, le code **laisse une pancarte** à l'ancienne adresse.
- `frontend/README.md` est **à jour et excellent** — la preuve que la discipline documentaire est
  tenable dans ce dépôt.

---

## 3. LES HUIT DOMAINES, UN PAR UN

---

### DOMAINE A — MÉTIER — 13 problèmes

**La question posée** : l'application sait-elle gérer un vrai tournoi, y compris quand la journée
ne se passe pas comme prévu ?

> 🎯 **Le fil rouge** : **l'application est excellente avant le coup d'envoi et rigide après.** Les
> cinq problèmes importants apparaissent tous **le jour J**.

| Réf | Problème | Prio | État |
|---|---|---|---|
| **R-001** | **Le forfait n'existe pas.** Aucun état « équipe absente ». Un 0-0 donne 2 points à l'absent ; un score inventé fausse la différence, qui sert au départage | **P1** | ✅ règle tranchée — **D-011** |
| **R-002** | **Un seul match du matin non saisi bloque l'après-midi de TOUTES les catégories** — et le message ne dit pas lesquels manquent | **P1** | identifié |
| **R-003** | **Aucun ajustement de planning une fois la journée lancée.** Impossible de déplacer un match. Le seul outil est « tout regénérer », qui **efface les scores** | **P1** | ✅ solution tranchée — **D-013** |
| **R-004** | **Pas de départage au-delà du 3ᵉ critère.** Deux équipes strictement à égalité sont classées **dans l'ordre du tableur** — et ce rang décide de la composition de l'après-midi | **P1** | ✅ règle tranchée — **D-014** |
| **R-005** | **Aucune limite haute sur un score.** 150 au lieu de 15 est accepté sans un mot, des deux côtés | **P1** | ✅ règle tranchée — **D-012** |
| **R-006** | Forcer le nombre de poules peut produire des **poules de 2** (= match sec), ce que la règle des 3 équipes minimum vise à interdire | P2 | identifié |
| **R-007** | Une catégorie à 1 ou 2 équipes **bloque tout le tournoi**, et le message n'indique pas le remède | P2 | identifié |
| **R-008** | Une **date de tournoi vide** désactive silencieusement le gel des réponses à J-16 | P2 | identifié |
| **R-009** | Super Challenge phase 3 incomplet — **le code l'avertit lui-même** | P2 | identifié |
| **R-010** | Les deux interrupteurs de publication sont indépendants : un tournoi publié montre le planning à qui a le lien, même si les clubs ne le voient pas. Volontaire, mais **les libellés ne le disent pas** | P2 | identifié |
| **R-011** | Un tirage au sort **ne peut être ni reproduit ni annulé** | P3 | identifié |
| **R-012** | **Aucune règle sportive n'est écrite nulle part pour les clubs.** Barème et départage n'existent que dans les commentaires du code — et le champ « Règlement » **a été retiré de l'écran d'administration** | P2 | ✅ exigence acquise (D-011) |
| **R-013** | **Aucun état « match annulé ».** L'orage, le terrain condamné, la journée écourtée ne peuvent pas être enregistrés. **Ce n'est pas un forfait** — personne n'est fautif | P2 | ✅ solution tranchée — **D-015** |

> ✅ **Les cinq décisions métier sont prises** (D-011 à D-015, validées le 2026-08-04). **La règle
> est décidée ; le code n'est pas écrit.**
>
> ⚠️ **Une question reste, et elle est extérieure au dépôt** — **I-10** : la FFR encadre-t-elle le
> sort d'un match qui n'a pas pu se jouer ? `AUDIT-TOURNOI-R92.md` **ne dit rien** du sujet. Une
> règle fédérale primerait sur **D-011 et D-015**.

---

### DOMAINE C — SÉCURITÉ — 14 problèmes

**La question posée** : qui peut faire quoi, et que se passerait-il si quelqu'un de mal intentionné
trouvait l'adresse du serveur ?

> 🎯 **Le fil rouge, en deux phrases :**
> **① Il n'y a pas de personnes, seulement deux mots de passe partagés.** Sept problèmes sur
> quatorze en découlent.
> **② Les protections sont au bon endroit — sauf les trois plus destructrices.** Le gel des
> réponses, le refus de réorganiser les poules, la revalidation des relevés : tous tenus par le
> **serveur**, donc incontournables. Mais **effacer tous les scores**, **tout réinitialiser** et
> **limiter la seule porte ouverte** : tenus par personne, ou par la seule page web.

| Réf | Problème | Prio | État |
|---|---|---|---|
| **R-014** | **La seule écriture ouverte sans mot de passe n'avait aucune limite.** Chaque envoi ajoutait une ligne au classeur, rien ne les efface, et l'adresse du serveur est publique. Permettait de **saturer le classeur** | **P0** | ✅ **CORRIGÉ, DÉPLOYÉ, TESTÉ** |
| **R-015** | **Regénérer les poules efface tous les scores, et le serveur ne vérifie jamais s'il y en a.** Le garde-fou vit **uniquement dans le navigateur** | **P1** | identifié |
| **R-016** | **La réinitialisation efface tout dès réception du mot de passe** : équipes, poules, matchs, catégories, horaires, contacts, dossier, affiche. **Aucune confirmation serveur, aucune sauvegarde, aucun retour arrière** | **P1** | identifié |
| **R-017** | **Deux mots de passe partagés, aucune notion de personne.** Impossible de retirer l'accès à quelqu'un, aucune trace de l'auteur d'un score. **Une contestation est inarbitrable** | **P1** | identifié |
| **R-018** | **Les liens personnels des clubs sont des passe-partout permanents** : jamais expirés, transférables par simple renvoi de courriel. Ils ouvrent **les téléphones du référent et du responsable sécurité** | **P1** | identifié |
| **R-019** | **Les deux mots de passe sont des mots choisis à la main**, et le garde-fou anti-devinette laisse passer ≈ **8 600 essais par jour** | **P1** | ⏳ **D-017 — cinq minutes, et c'est refermé** |
| **R-020** | Le **contenu** des courriels est fabriqué par le navigateur et expédié sous l'identité Gmail du propriétaire. Le destinataire, lui, est toujours relu dans le classeur *(bon point)* | P2 | identifié |
| **R-021** | Quatre onglets sortent **en entier, sans mot de passe et sans liste blanche**. Rien de personnel aujourd'hui — **une colonne ajoutée demain serait publique sans décision** | P2 | identifié |
| **R-022** | `admin.html` et `saisie.html` sont **publics et indexables** par les moteurs de recherche | P2 | identifié |
| **R-023** | **Aucune trace de qui consulte le carnet d'adresses**, qui se lit en une seule requête | P2 | identifié |
| **R-024** | **Quatre bibliothèques extérieures sans version, sans origine, sans empreinte** (~750 Ko) : impossible de savoir si une faille publiée les concerne | P2 | identifié |
| **R-025** | **Toute la confidentialité tient au réglage de partage du classeur**, qu'aucun code ne protège | P2 | identifié |
| **R-026** | Aucune politique de sécurité du contenu (rien ne limiterait les dégâts si un texte piégé passait) | P3 | identifié |
| **R-027** | Les briques d'automatisation GitHub sont épinglées par **étiquette mobile** et non par empreinte figée | P3 | identifié |

---

### DOMAINE B — PROTECTION DES DONNÉES — 13 problèmes

**La question posée** : quelles informations personnelles l'application collecte-t-elle, et
qu'en fait-elle ?

> ⚠️ **Aucune conformité juridique n'est prononcée ici, ni ailleurs.** Ces lignes décrivent des
> **risques** et des **mesures techniques**, jamais un verdict de légalité.

> 🎯 **Le fil rouge, en deux phrases :**
> **① La collecte est exemplaire ; le silence ne l'est pas.** L'application ne demande presque rien
> et **n'identifie aucun enfant**. Mais elle ne dit **rien à personne**.
> **② Rien ne s'efface, et personne ne l'a décidé.** L'absence de durée de conservation n'est pas un
> choix contestable : c'est **un choix qui n'a jamais été fait**. **Neuf des treize problèmes
> disparaissent le jour où ces durées sont écrites** — et les écrire ne demande **aucune ligne de
> code**.

| Réf | Problème | Prio | État |
|---|---|---|---|
| **R-028** | **Personne n'est jamais informé de rien** : aucune page, aucun courriel, aucune ligne ne dit qui détient ces informations, pourquoi, combien de temps, ni comment demander leur retrait | **P1** | ⏳ décision **D-018** |
| **R-029** | **La mesure de visibilité des partenaires écrit sur le téléphone de chaque spectateur** et remonte au serveur, **sans information ni choix** | **P1** | ⏳ décision **D-019** — **suspendu** (partenaires éteints) |
| **R-030** | **Aucune durée de conservation, aucune purge, nulle part.** Rien n'expire | **P1** | ⏳ décision **D-020** |
| **R-031** | Le **droit d'effacement est partiel et parfois bloqué** : supprimer un club est refusé tant qu'une de ses équipes figure dans un match | P2 | identifié |
| **R-032** | Les **effectifs d'enfants sortent sans aucun mot de passe** — et toute colonne ajoutée demain le sera aussi | P2 | identifié |
| **R-033** | **La réinitialisation conserve des données personnelles sans raison écrite** : effectifs de l'édition passée, et **tous** les contacts de la demande FFR — représentant, président, **médecin**, antenne de secours | P2 | identifié |
| **R-034** | **Un champ libre invite explicitement à saisir noms, prénoms et dates de naissance d'enfants** (« équipes étrangères »). **Seul endroit où un mineur cesse d'être un nombre** | P2 → **P1 s'il est rempli** | identifié |
| **R-035** | **Toute image déposée est rendue publique et ne disparaît pas vraiment** (corbeille Drive ~30 j). Rien n'avertit qu'une photo de parking peut montrer **plaques et visages** | P2 | identifié |
| **R-036** | **Le droit à l'image n'est plus outillé** depuis son retrait décidé par le club le 2026-08-03, et **rien n'écrit ce qui l'a remplacé** | P2 | ⏳ question au club — **I-15** |
| **R-037** | Les **polices d'écriture sont chargées depuis les serveurs de Google** sur les 7 pages : l'adresse réseau de chaque visiteur y est transmise | P2 | identifié |
| **R-038** | L'adresse du contact d'invitation est **servie en clair à qui la demande**. Volontaire et nécessaire ; risque d'aspiration et de spam sur une adresse **personnelle** de bénévole | P2 | identifié |
| **R-039** | **Aucun cadre écrit** : ni responsable désigné, ni registre, ni conduite à tenir en cas de fuite — **et aucune trace pour en détecter une**. Le classeur, le Drive et la boîte d'envoi vivent dans un **compte Google individuel** | P2 | ⏳ **I-14** |
| **R-040** | Le **multi-clubs (SaaS)** changera la nature du sujet : contrat, cloisonnement, restitution | P3 | **ne rien faire maintenant** |

> ✅ **La fenêtre est encore ouverte, et elle ne se rouvrira pas.** Le classeur ne contient
> aujourd'hui **aucune donnée personnelle de tiers** : le tournoi en base est fictif, et les seules
> adresses présentes sont celles de Romain et de son épouse. Les trois problèmes importants sont à
> régler **avant la première invitation réelle** — et **aucun ne demande d'écrire du code**.

---

### DOMAINE D — TESTS — 10 problèmes

**La question posée** : qu'est-ce qui est **prouvé**, et qu'est-ce qui marche seulement parce que
personne n'a essayé de le casser ?

> ⚠️ **Ce domaine ne dit pas où le code casse. Il dit où personne ne regarde.** L'absence de test ne
> prouve aucun défaut — et n'en écarte aucun.

> 🎯 **Le fil rouge, en deux phrases :**
> **① On teste ce qui a été construit récemment, pas ce qui compte depuis le début.** Le harnais
> suit fidèlement le chantier FFR — c'est-à-dire tout ce qui se passe **avant** le tournoi. Le
> classement, le départage et la saisie des scores sont le **cœur historique** : ils marchent depuis
> si longtemps que personne n'a jamais éprouvé le besoin de les protéger.
> **② L'obstacle n'était pas là où on le croyait.** On pensait les tests prisonniers de Google : ils
> tournent ici en **une seconde**. On croyait le harnais trop petit : il fait **589 vérifications**.
> Le vrai manque **n'est ni technique ni quantitatif**.

| Réf | Problème | Prio |
|---|---|---|
| **R-041** | **Le calcul qui décide du vainqueur n'est vérifié par aucun test.** Et surtout : **sur 589 vérifications, aucune ne met deux équipes à égalité** | **P1** |
| **R-042** | **L'enregistrement d'un score n'est vérifié par aucun test** — le geste le plus répété de la journée, qui porte pourtant **six garde-fous** | **P1** |
| **R-043** | **Les 17 712 lignes du navigateur n'ont aucun test — et rien ne les empêche d'être publiées.** La publication part sur Internet **à chaque envoi**, sans lancer quoi que ce soit, **pas même un contrôle de syntaxe** | **P1** |
| **R-044** | **La même règle est écrite deux fois, et rien ne vérifie qu'elles disent la même chose** | **P1** ⚠️ **requalifié** — voir ci-dessous |
| **R-045** | **Aucun scénario ne rejoue une journée de bout en bout.** Or les pannes réelles vivent **entre** les morceaux | P2 |
| **R-046** | **110 des 277 fonctions sont hors de portée du harnais** (elles reçoivent le classeur). **Plafond structurel, pas négligence** | P2 |
| **R-047** | **Le refus des équipes en double n'existe que dans le navigateur.** Le serveur vérifie seulement que le nom n'est pas vide | P2 |
| **R-048** | **Un envoi qui n'aboutit pas fige le bouton indéfiniment** : les lectures ont un délai d'abandon, **les écritures n'en ont aucun** | P2 |
| **R-049** | **La documentation annonce un test qui n'existe pas.** Une documentation qui annonce une preuve inexistante est **pire que pas de documentation** | P2 |
| **R-050** | **Rien n'empêche une nouvelle fonction d'arriver sans test** | P3 |

> ⭐ **R-044 a été requalifié par le domaine H, et c'est une bonne nouvelle.** Les deux copies ont
> été **exécutées côte à côte** sur les mêmes entrées : **179 comparaisons, 0 écart**. Le barème du
> classement et l'ordre de départage sont **identiques au caractère près**. Le problème passe de
> *« défaut possible »* à *« dette à surveiller »* : rien ne les empêche de diverger **demain**,
> mais elles ne divergent pas **aujourd'hui**.

---

### DOMAINE E — EXPÉRIENCE D'UTILISATION — 10 problèmes

**La question posée** : un bénévole non formé, debout au bord d'un terrain, sur **son propre
téléphone**, en plein soleil, peut-il utiliser cette application sans se tromper ?

> **Méthode** : les écrans ont été **réellement ouverts dans un navigateur**, aux tailles
> 375 × 812 (téléphone), 320 × 568 (vieux téléphone) et 1280 × 800 (ordinateur). Les tailles et
> les contrastes sont **mesurés**, pas estimés.

> 🎯 **Le fil rouge, en deux phrases :**
> **① L'application sait déjà tout faire bien — elle ne l'a pas fait partout.** Les 44 pixels de
> cible tactile, le bouton qui annonce sa progression, la confirmation qui nomme ce qu'elle va
> détruire : **tout cela existe dans ce projet**, écrit par la même main. Mais sur les écrans
> **récents**. Les écrans **les plus anciens et les plus utilisés** — la saisie simple, la page
> publique — sont restés en arrière. **Il y a peu à inventer, beaucoup à propager.**
> **② Le seul vrai défaut de conception est le silence.** La page de saisie ne dit pas qu'elle
> travaille, ne dit pas qu'elle a échoué, et — le plus grave — **peut affirmer qu'elle est à jour
> quand elle ne l'est pas**. Rendre l'interface difficile à utiliser incorrectement, ici, ce n'est
> pas la redessiner : **c'est la faire parler**.

| Réf | Problème | Prio |
|---|---|---|
| **R-051** | **Le bouton « Rafraîchir » échoue en SILENCE COMPLET.** Réseau coupé → le bouton revient à la normale, l'heure ne bouge pas, **aucun message**. Le bénévole croit voir l'état réel du tournoi ; **il voit une photographie périmée** | **P1** |
| **R-052** | **Un échec affiche un message technique, souvent en anglais** — le bénévole lit **« Failed to fetch »**, sans savoir si son score est passé | **P1** |
| **R-053** | **Le bouton « Valider » ne montre rien pendant l'envoi.** Mesuré : 1 s après le clic sur un envoi de 4 s → texte inchangé, **aucun indicateur** | P2 |
| **R-054** | **Cibles tactiles trop petites sur la saisie simple** : « Valider » **85 × 35 px**, champ de score **72 × 36 px** — pour 44 px visés. **Alors que la saisie détaillée U14 fait exactement 44 × 44** | P2 |
| **R-055** | **Sur la page publique, l'information la plus utile est la moins lisible** : « 09:00 · Terrain 1 · Poule A » à **2,81** de contraste pour 4,5 exigé — précisément ce qu'un parent vient chercher, **lu dehors au soleil** | P2 |
| **R-056** | **La zone de dépôt d'image est INVISIBLE — blanc sur blanc**, contraste **1,00** (exactement la même couleur). 3 endroits | P2 |
| **R-057** | **Rien n'est annoncé aux lecteurs d'écran** : « Score enregistré ✓ » n'est jamais dit. **8 champs de score sur 10 sans étiquette** | P2 |
| **R-058** | **La touche « Entrée » ne valide rien.** Il faut fermer le clavier du téléphone puis viser un bouton de 35 px : **deux gestes au lieu d'un, à chaque match** | P2 |
| **R-059** | **Le mot de passe est redemandé à chaque nouvelle ouverture de l'onglet** — sur un téléphone qui ferme ses onglets pour économiser la batterie, c'est le retaper au bord du terrain | P2 |
| **R-060** | L'administration n'a pas de lien « Aller au contenu » (la page publique en a un) | P3 |

> ⚠️ **La limite principale, et il faut la dire** : tout a été mesuré **dans un navigateur
> d'ordinateur simulant un téléphone**. **Personne n'a jamais saisi un score dehors**, en plein
> soleil, debout, avec de vrais doigts. Les contrastes calculés sont un **plancher optimiste**.
> **Trente minutes d'essai réel avec deux ou trois bénévoles vaudraient mieux que tout ce domaine.**

---

### DOMAINE F — PERFORMANCE — 11 problèmes

**La question posée** : combien de personnes peuvent regarder les scores en même temps avant que ça
ne tienne plus ?

> **Méthode** : **42 appels réels chronométrés** sur l'application en ligne, poids transféré mesuré,
> **25 lectures simultanées** essayées, puis **128 exécutions réelles** analysées dans le journal de
> Google.

> 🎯 **Le fil rouge, en deux phrases :**
> **① Le travail de performance a été fait, puis arrêté juste avant la fin.** Cache serveur,
> anti-ruée, copie de secours, pause en arrière-plan, étalement aléatoire, délai d'abandon : **tout
> est là, et bien fait**. Le relais qui couronne l'édifice est **écrit des deux côtés, documenté pas
> à pas — et il n'a jamais été allumé.** Ce domaine ne demande pas de construire : il demande de
> **terminer**.
> **② Ce qui est lent n'est pas le code, c'est le lieu.** Une action qui ne fait strictement rien
> met déjà **1,6 seconde**. Aucune optimisation ne descendra sous ce plancher — et c'est pourquoi la
> vraie réponse à l'affluence n'est pas d'accélérer le serveur, mais de **ne plus l'interroger**.

| Réf | Problème | Prio |
|---|---|---|
| **R-061** | **Le relais anti-affluence est écrit, documenté — et éteint.** Capacité chiffrée sans lui : **≈ 310 écrans allumés simultanément** en régime normal | **P1** |
| **R-062** | **Le filet de repli est programmé pour lâcher quand le tournoi grossit** : le cache refuse de s'enregistrer au-delà de 95 000 octets, soit **≈ 165 matchs** — délibéré, mais **totalement silencieux** | **P1** |
| **R-063** | **58 % de ce qui voyage jusqu'à chaque spectateur, ce sont des cases vides.** Mesuré : 14 541 octets sur 25 029 | P2 |
| **R-064** | **Les réglages de cadence n'ont jamais été accordés entre eux** : ni le cache (10 s) avec l'intervalle (15-19 s), ni l'intervalle avec la capacité réelle. **Le levier le plus puissant du chantier est ici** — et c'est **un chiffre à changer** | P2 |
| **R-065** | **L'administration télécharge 207 Ko d'outil PDF avant d'afficher quoi que ce soit** — 44 % du poids de la page, pour un document rarement fabriqué | P2 |
| **R-066** | **Le logo pèse à lui seul 79 % de la page publique** : **229 Ko**, chargé en 700 × 558 pour être affiché en 60 × 48. **~8 Ko suffiraient** | P2 |
| **R-067** | **Le verrou d'écriture est tenu pendant qu'on reconstruit l'instantané public** | P2 |
| **R-068** | **Vérifier un mot de passe passe par le chemin le plus coûteux du serveur** : une vraie demande d'enregistrement de score avec un identifiant bidon, qui **prend le verrou d'écriture** | P2 |
| **R-069** | **Les écritures peuvent attendre indéfiniment** : les lectures ont un délai d'abandon, **les écritures n'en ont aucun** | P2 |
| **R-070** | **L'envoi groupé d'invitations bloque tout le reste pendant sa durée** : 1 à 2 minutes pour 50 clubs, **en tenant le verrou d'écriture** | P3 |
| **R-071** | Le compteur de visibilité des partenaires **s'arrêterait avant la fin d'une grosse journée** | P3 |

> 🔗 **Le domaine F répond à la question que le domaine E lui avait laissée.** L'attente après
> « Valider » est-elle un détail ? **Non** — elle est réelle et mesurée. **Un bouton muet pendant
> quatre secondes est un bouton sur lequel on reclique.**

> ⚠️ **Les limites, et il faut les dire** : toutes les mesures viennent d'un **ordinateur situé à
> 16 millisecondes des serveurs Google** — ce sont des temps **plancher**, jamais des temps réels de
> téléphone en bord de terrain. **Je n'ai pas simulé trois cents spectateurs** : j'en ai simulé
> **vingt-cinq, une fois**.

---

### DOMAINE G — ARCHITECTURE — 10 problèmes

**La question posée** : si quelqu'un d'autre devait reprendre ce projet demain — ou si Romain
lui-même devait y revenir dans six mois — combien de temps avant de pouvoir toucher au code sans
rien casser ?

> 🎯 **Le verdict est inhabituel, et il faut le dire tel quel : le code est en bien meilleur état
> que sa documentation.** Les deux problèmes importants **ne portent pas sur ce que l'application
> FAIT, mais sur ce que le projet RACONTE de lui-même.**

| Réf | Problème | Prio |
|---|---|---|
| **R-072** | **La procédure de redéploiement décrit la moitié du geste.** Le serveur, c'est **deux** fichiers — `Code.gs` **et `Tests.gs`** — or `Tests.gs` n'est cité par **aucun** document. 🔗 **C'est le mécanisme exact qui a produit une preuve fausse dans ce chantier** | **P1** — 🟡 **désamorcé là où il se déclenchait** |
| **R-073** | **La carte du projet ne décrit plus le projet.** `architecture.md` documente **21 des 65 actions** du serveur (**68 % d'invisible**) et 4 pages sur 8 ; **tout le parcours d'invitation des clubs — le travail du dernier mois — n'y figure nulle part** | **P1** — 🟡 **l'hémorragie est arrêtée, le retard reste entier** |
| **R-074** | Tout le serveur tient dans **un seul fichier de 8 147 lignes**, alors que Google en accepte plusieurs | P2 — ✅ **arbitré : on ne découpe pas** (**D-028**) |
| **R-075** | **Rien ne permet de dire quelle version tourne** : aucune version publiée, aucune étiquette | P2 |
| **R-076** | **Les tests sont rangés par date d'écriture, pas par sujet** — et leur point d'entrée porte **un nom trompeur** | P2 |
| **R-077** | **L'administration est un anneau** : 13 paires de fichiers s'appellent mutuellement | P2 |
| **R-078** | **Tout le code du navigateur partage un seul espace de noms** — et **12 noms y sont déjà en double**. Aucune collision aujourd'hui, mais **la panne serait une page blanche** | P2 |
| **R-079** | **Côté navigateur, calculer et afficher sont le même geste** — l'inverse exact du serveur. 🔗 **C'est LA cause de R-043** : le problème n'est pas qu'on n'a pas écrit les tests, c'est **qu'il n'y a rien à tester séparément** | P2 |
| **R-080** | **183 Ko sont publiés sur Internet à chaque envoi sans que rien ne les charge.** ✅ Ce n'est **pas** un oubli : c'est écrit noir sur blanc | P2 |
| **R-081** | **Le serveur est déposé à la main**, et c'est la **racine commune de quatre problèmes** | P3 — **ne rien faire maintenant** |

> ✅ **Deux mesures ont été appliquées dès la session 11** (décision **D-029**), parce qu'elles ne
> touchaient aucun code **et** que les attendre coûtait à chaque livraison : la fiche de
> redéploiement est **complète**, et `CLAUDE.md` §8 bis impose désormais de **mettre la carte à jour
> dans le même lot** que la fonctionnalité.

---

### DOMAINE H — QUALITÉ DU CODE — 7 problèmes

**La question posée** : le code, ligne à ligne — fonctions trop longues, logique dupliquée, noms
peu explicites, code mort, commentaires devenus faux, complexité inutile, gestion d'erreurs.

> 🎯 **Le verdict : le code tient ses promesses — sauf quand il parle de lui-même.** **Aucun P0,
> aucun P1.** Les sept problèmes ont tous la même forme : ce n'est jamais le code qui se trompe,
> c'est **ce que le code raconte**.

| Réf | Problème | Prio |
|---|---|---|
| **R-082** | **Le seul miroir en désaccord** : pour l'U14 en Super Challenge, l'écran de préparation du dossier d'autorisation annonce **deux phases et des matchs de 10 minutes** là où **30 minutes** seront jouées — pendant que le PDF, lui, n'écrit rien | P2 ⚠️ **→ P1 le jour d'un vrai Super Challenge** |
| **R-083** | **Cinq commentaires annoncent le contraire de ce que fait le code** | P2 |
| **R-084** | **Une colonne est créée dans le classeur, documentée, munie de sa fonction de lecture — et rien ne la lit.** Un organisateur qui la remplit n'obtient **rien, sans aucun message** | P2 |
| **R-085** | **Jeter une image ne se vérifie jamais** : quatre chemins avalent l'échec en silence puis répondent **« c'est fait »** | P2 |
| **R-086** | **29 endroits montrent au bénévole le message d'erreur brut du navigateur.** 🔗 C'est **R-052 chiffré** — pas un oubli sur un écran, **le geste par défaut de toute l'application** | P2 |
| **R-087** | **15 lignes mortes dont le commentaire affirme qu'elles servent** | P3 |
| **R-088** | Les **noms très courts vivent trop longtemps** dans les trois plus longues fonctions | P3 |

> ⭐ **Le résultat principal de ce domaine dépasse ses sept problèmes** : les 29 règles écrites en
> double ont été **exécutées** côte à côte — **179 comparaisons, 0 écart**. C'est ce qui garantit
> que la page publique, qui recalcule le classement **sans redemander au serveur**, ne peut pas
> afficher un classement différent du sien.

---

## 4. LES SIX RISQUES DE MÉTHODE

> Ces six-là ne portent pas sur le logiciel. Ils portent sur **la façon dont il est audité** — et
> donc sur **la confiance qu'on peut accorder à ce rapport**.

| Réf | Le risque | État |
|---|---|---|
| **M-01** | **Deux systèmes de suivi en parallèle** : l'audit FFR (`AUDIT-TOURNOI-R92.md`) a sa propre méthode par sessions. Risque de deux vérités | Cadré par **D-003** : chantiers distincts, l'un traite la **règle du jeu**, l'autre la **solidité de l'outil** |
| **M-02** | **Le code du dépôt n'est pas forcément le code en service.** Le serveur s'exécute chez Google ; rien ne relie mécaniquement les deux | ⚠️ **Permanent.** Fortement réduit (les tests ont tourné chez Google), **jamais supprimé** |
| **M-03** | **Aucun test ne pouvait être lancé depuis cet ordinateur** | ✅ **Largement levé** : les tests tournent ici en une seconde |
| **M-04** | **Un compte de tests ne dit pas quelle VERSION a été exécutée.** Une preuve fausse (« 573/573 ») est entrée au dossier et y est restée deux sessions | ✅ **Refermé** — preuve refaite, et la fiche de redéploiement porte désormais **un contrôle par deux nombres** |
| **M-05** | **L'audit photographie une application qui continue de bouger.** Le chantier fonctionnalités en est à sa session 28, déployée **la veille** du démarrage de celui-ci | ⚠️ **Ouvert, et c'est une donnée permanente.** Un problème constaté ne devient pas faux parce qu'on ajoute du code après : **il devient plus grand** |
| **M-06** | **Les chiffres de l'audit ne portent pas leur méthode de mesure** — et trois d'entre eux étaient faux (les longueurs de trois fonctions du navigateur) | ⚠️ **Ouvert.** **Deuxième occurrence du même mécanisme après M-04.** Remède appliqué dès la session 12 : chaque chiffre porte désormais **sa méthode écrite à côté de lui** |

---

## 5. CE QUI RESTE À DÉCIDER, ET CE QUI RESTE À SAVOIR

> **Règle appliquée pendant tout l'audit (décision D-024)** : *rien n'est tranché pendant l'ÉTAPE 2*.
> Tout ce qui attend une réponse a été **accumulé**, pour être repris **un par un** à l'ÉTAPE 3.

### 5.1 — Ce qui ne doit PAS attendre (trois exceptions)

| # | Quoi | Pourquoi ça ne peut pas attendre |
|---|---|---|
| **D-017** | **Remplacer les deux mots de passe par des suites aléatoires** | Ce n'est pas une question, c'est une **action** : cinq minutes, aucune réflexion, et elle referme **R-019** (P1). Menu du classeur → « Configurer les clés » |
| **I-10** | **Question à la FFR** : le sort d'un match qui n'a pas pu se jouer est-il encadré ? | **Question sortante** — le délai de réponse ne dépend pas de nous. Une règle fédérale primerait sur **D-011** et **D-015** |
| **I-15** | **Question au club** : le droit à l'image des enfants est-il géré ailleurs ? | **Question sortante** — même raison. Le mécanisme a été retiré le 2026-08-03, **sans que rien n'écrive ce qui l'a remplacé** |

### 5.2 — Les six décisions en attente

| Réf | La question | Bloque |
|---|---|---|
| **D-005** | **Périmètre** : le site vitrine `boutique-r92` entre-t-il dans le chantier ? | **I-16**, et l'emplacement de la future page « Vos données » |
| **D-009** | **Où atterrit la documentation** quand une branche de travail est imposée ? | Rien de fonctionnel — question de méthode |
| **D-018** | **Que dit-on aux personnes** dont on garde les informations ? *(trois textes courts)* | **R-028** (P1) |
| **D-019** | **Que fait-on de la mesure des partenaires ?** Informer · demander l'accord · alléger | **R-029** (P1) — suspendu tant que les partenaires restent éteints |
| **D-020** | **Combien de temps garde-t-on quoi ?** *(un tableau de durées à valider)* | **R-030** (P1), **R-031**, **R-033**, **R-034** |
| **D-025** | **Quels tests écrit-on, et dans quel ordre ?** 4 lots proposés | **R-041**, et le calendrier de D-011/D-012/D-014 |

> **Ma recommandation sur D-025, si un seul lot devait être fait** : **le barème et le départage**.
> Il est le moins cher, il protège ce qui compte le plus, et **D-014 est déjà décidée** — écrits
> après la modification, ces tests graveraient le **nouveau** comportement sans avoir jamais vu
> l'ancien.

### 5.3 — Les neuf inconnues à lever

| Réf | Ce qu'on ne sait pas | Comment le lever |
|---|---|---|
| **I-01** | Le code en service chez Google est-il identique à celui du dépôt ? | Vérification dans Apps Script — **permanent** (M-02) |
| **I-08** | Une image mise à la corbeille du Drive reste-t-elle visible par un lien déjà diffusé ? | **Essai de 5 minutes** : corbeille, puis rouvrir le lien en navigation privée |
| **I-09** | Que conserve le journal d'exécution de Google, et combien de temps ? | Consultation dans l'éditeur Apps Script |
| **I-10** | La FFR encadre-t-elle le sort d'un match non joué ? | **Question sortante** — voir §5.1 |
| **I-14** | **Qui est officiellement responsable** de ces données, et le classeur doit-il rester dans un compte individuel ? | Réponse de Romain **au déclencheur** — non bloquant aujourd'hui |
| **I-15** | Le droit à l'image des enfants est-il géré ailleurs ? | **Question sortante** — voir §5.1 |
| **I-16** | Le site vitrine porte-t-il déjà des mentions légales ? | Vérification, ou extension du périmètre (D-005) |
| **I-19** | **Quelle part du public regarde son écran au même instant** lors d'un pic ? | **Observation le jour J** — regarder le journal d'exécutions **pendant** le tournoi |
| **I-20** | Quelqu'un d'autre reprendra-t-il ce code, et quand ? | Réponse de Romain — **non bloquante** |

---

## 6. CE QUE JE RECOMMANDE, ET DANS QUEL ORDRE

> ⚠️ **Ceci est une PROPOSITION, pas une décision.** L'ordre définitif sera construit à l'**ÉTAPE 3**
> et validé par Romain à l'**ÉTAPE 4**, chantier par chantier. Rien ne sera modifié dans
> l'application avant.

### Étape 0 — Ce qui ne coûte rien et se fait tout de suite

| Quoi | Durée | Ce que ça referme |
|---|---|---|
| **Remplacer les deux mots de passe** par des suites aléatoires (D-017) | **5 min** | **R-019** (P1) |
| **Poser les deux questions sortantes** (I-10 à la FFR, I-15 au club) | 2 courriels | Débloque D-011, D-015, R-036 |
| **Essayer la saisie pour de vrai** : 30 minutes dehors, avec 2-3 bénévoles et **leurs** téléphones | 30 min | **Vaudrait mieux que tout le domaine E** |

### Étape 1 — Le filet AVANT les corrections

> **C'est la seule contrainte d'ordre qui soit vraiment impérative.** Les cinq décisions métier
> (D-011 à D-015) vont **modifier le classement, le départage et la saisie du score** — c'est-à-dire
> exactement ce qui **n'a aucun test**. Écrits après, les tests graveraient le nouveau comportement
> **sans avoir jamais vu l'ancien**.

1. **R-041** — tests du barème et du départage ;
2. **R-042** — séparer le cœur de la saisie du score de son écriture, puis le tester.

### Étape 2 — Tout ce qui ne touche aucune ligne de code

> **Nombreux, sans risque technique, et plusieurs referment des P1.** C'est le meilleur rapport
> entre ce que ça coûte et ce que ça apporte.

- **R-072, R-073, R-083, R-084, R-087** — remettre le projet en face de lui-même : la fiche de
  redéploiement, la carte du projet, les commentaires faux, la colonne fantôme, le code mort ;
- **R-028, R-038** *(D-018)* — les trois textes d'information ;
- **R-030, R-031, R-033, R-034** *(D-020)* — **le tableau des durées de conservation**. Une seule
  décision met **neuf problèmes** en ordre de marche ;
- **R-012** — écrire le barème et le départage pour les clubs ;
- **R-024** — noter la version et l'origine des quatre bibliothèques.

### Étape 3 — Le jour J : rendre l'application utilisable quand ça se passe mal

- **R-051, R-052, R-053, R-069, R-086, R-085** — **faire parler l'application**. Six problèmes, un
  seul sujet : *elle dit qu'elle a réussi sans le savoir*. La correction principale tient en **un
  seul endroit à écrire** ;
- **R-001, R-013, R-003, R-004, R-005** — le forfait, l'annulation, le déplacement d'un match, le
  départage, la limite de score. **Les règles sont déjà décidées** ; il reste à les écrire, sous la
  protection des tests de l'étape 1 ;
- **R-054, R-055, R-056, R-058** — les cibles trop petites, les contrastes, la zone invisible, la
  touche « Entrée ».

### Étape 4 — Le filet côté serveur

- **R-015, R-016, R-047** — trois protections tenues par **la page** et non par le serveur. Même
  cause, même correction, mêmes tests.

### Étape 5 — Terminer le travail d'affluence

> **Précédé de I-19**, sans laquelle on décide à l'aveugle.

- **R-064** — accorder les cadences entre elles *(un chiffre à changer, le levier le plus puissant)* ;
- **R-061, R-062** — allumer le relais, et faire parler le cache quand il abandonne ;
- **R-063, R-065, R-066** — alléger ce qui voyage *(le logo à lui seul : 229 Ko → ~8 Ko)*.

### Étape 6 — Le reste, à mesure

**R-017, R-018, R-023** (savoir qui a fait quoi) · **R-021, R-032** (fermer ce qui sort) ·
**R-067, R-068, R-070** (le verrou) · **R-078** (les noms en double) · les P3.

### ⛔️ Ce qu'il ne faut PAS faire

| | Pourquoi |
|---|---|
| **Découper le fichier serveur** de 8 147 lignes | 1 fichier → **5 collages à la main**, donc cinq occasions d'en oublier un : **le mécanisme même de M-04**. ✅ Déjà arbitré (**D-028**) |
| **Renommer les 277 groupes de tests** | 277 occasions de **perdre un test en silence** |
| **Renommer les 600 fonctions du navigateur** | 600 occasions de casser un appel, pour un gain de **confort de lecture** |
| **Découper l'administration** | Exige d'installer un outillage que le projet a **délibérément refusé** |
| **Toucher aux calculs d'affichage du navigateur** | Ils sont **négligeables** (0,9 ms) : il n'y a rien à y gagner et tout à y perdre |
| **Implémenter quoi que ce soit pour le multi-clubs** | **Prématuré** (R-040, P3) |

---

## 7. LES LIMITES DE CET AUDIT — CE QU'IL NE PROUVE PAS

> Cette section est la plus importante du rapport pour qui veut s'en servir honnêtement.

**1. Il ne prouve rien sur le code réellement en service.** Tout a été lu et mesuré **dans le
dépôt**. Le serveur s'exécute chez Google, et rien ne relie mécaniquement les deux. C'est **M-02**,
et c'est **permanent**.

**2. Il n'a pas été mené sur un vrai tournoi.** Le tournoi en base est **fictif** — de vrais noms de
clubs, des engagements inventés. **Aucune journée réelle n'a jamais été jouée avec cette
application.**

**3. Personne n'a jamais saisi un score dehors.** Les contrastes, les tailles de bouton et la
lisibilité ont été mesurés dans un navigateur d'ordinateur simulant un téléphone. **Ce sont des
planchers optimistes.**

**4. La charge n'a pas été éprouvée.** 25 lectures simultanées ont été essayées ; pas 300. Un vrai
test de charge sur un service en production n'est pas un geste d'audit.

**5. Aucune écriture n'a été chronométrée.** Le coût d'une validation de score est **reconstitué**,
pas mesuré directement — parce qu'une écriture ratée ferait monter le compteur anti-devinette.

**6. Aucune conformité juridique n'est prononcée.** Le domaine B identifie des **risques** et des
**mesures techniques**. Il ne dit **jamais** si l'application est en règle : ce n'est ni son rôle ni
sa compétence.

**7. L'absence de problème ne prouve pas l'absence de défaut.** C'est particulièrement vrai du
domaine D : **il dit où personne ne regarde**, pas où le code casse.

**8. L'audit photographie une application qui bouge** (**M-05**). Le chantier fonctionnalités
continue — et c'est un choix assumé. Les chiffres de ce rapport valent **au 2026-08-05**.

**9. Deux fois déjà, un chiffre non reproductible est entré au dossier** (**M-04**, **M-06**). Le
remède est appliqué depuis la session 12 — chaque chiffre porte sa méthode — mais **les chiffres
antérieurs à cette date n'ont pas tous été refaits**.

---

> **Ce rapport clôt l'ÉTAPE 2.** La suite est l'**ÉTAPE 3** : transformer ces 88 constats en un plan
> de travail ordonné, puis le soumettre à validation — **chantier par chantier**, avant qu'une seule
> ligne de l'application ne soit modifiée.
