# AUDIT — Tournoi R92

> **À quoi sert ce document ?**
> C'est l'**ÉTAPE 2** du plan (`CLAUDE.md` §7) : chercher ce qui ne va pas, domaine par domaine,
> et le classer P0 / P1 / P2 / P3. **Aucun fichier de l'application n'est modifié ici.**
>
> Le registre des problèmes (avec leur statut de correction) vit dans `RISQUES.md`.
> Ce document-ci **explique** ; `RISQUES.md` **suit**.

**Dernière mise à jour** : 2026-08-05 (session 7)

| Domaine | Nom | Statut |
|---|---|---|
| **A** | **Métier / Product Owner** | ✅ **FAIT** (session 5) |
| **C** | **Sécurité** | ✅ **FAIT** (session 6) |
| **B** | **RGPD / Protection des données** | ✅ **FAIT** (session 7) |
| D | QA / Tests | ⬜ À faire |
| E | UX / UI / Accessibilité | ⬜ À faire |
| F | Performance | ⬜ À faire |
| G | Architecture / Maintenabilité | ⬜ À faire |
| H | Qualité du code | ⬜ À faire |

> **Ordre validé par Romain le 2026-08-04** : A → C → B → D → E → F → G → H (décision D-010).

---

# DOMAINE A — MÉTIER / PRODUCT OWNER

> **La question posée** : un organisateur réel, le jour d'un vrai tournoi, peut-il faire son
> travail avec cet outil ? Et l'outil produit-il des **résultats sportifs justes** ?
>
> **Ce que ce domaine ne traite pas** : la conformité au règlement de la Fédération. C'est le
> chantier séparé `AUDIT-TOURNOI-R92.md` (décision D-003). Quand une règle FFR est citée ici,
> c'est parce qu'elle est **déjà implémentée dans le code** — pas pour la juger.

**Méthode** : lecture du code, sans rien exécuter. Chaque constat est marqué **CERTAIN**
(constaté dans le code), **PROBABLE** (déduit) ou **INCONNU**.

---

## A.0 — Le verdict en une phrase

**L'application est remarquable pour préparer un tournoi, et rigide dès que le tournoi a
commencé.** Tout ce qui se passe avant le coup d'envoi est solide, réfléchi, plein de garde-fous.
Mais à partir du premier score saisi, la journée devient une mécanique qu'on ne peut presque plus
ajuster — alors que c'est précisément le moment où la réalité du terrain s'écarte du plan.

Aucun problème classé **P0** n'a été trouvé dans ce domaine. **Cinq problèmes P1** — c'est-à-dire
« à corriger avant une utilisation réelle » — et ils se ressemblent tous : ils apparaissent **le
jour J**, sous pression, quand quelque chose ne se passe pas comme prévu.

---

## A.1 — Ce qui est solide (et qu'il ne faut pas casser)

La règle de vérité de `CLAUDE.md` marche dans les deux sens : il faut dire ce qui est mauvais,
donc aussi ce qui est bon. Voici ce que l'audit a trouvé de **réellement bien fait**, et qu'aucune
correction future ne doit dégrader.

| Ce qui est bien fait | Pourquoi ça compte |
|---|---|
| **L'application refuse d'écrire quand elle n'est pas sûre** | Moins de 3 équipes, durée de mi-temps manquante : elle bloque **avant** toute écriture, pas au milieu. Rien n'est laissé à moitié fait |
| **Le tirage sépare les équipes d'un même club** | Il place les clubs les plus nombreux en premier (les plus contraints), et **prévient** quand la séparation est impossible au lieu de faire semblant |
| **Le planning respecte trois contraintes à la fois** | Terrain libre + équipes reposées + pas de chevauchement de la pause déjeuner. Et il choisit le terrain qui se libère le plus tôt |
| **L'assistant d'arbitrage propose des solutions** | Quand la journée ne rentre pas, l'application ne dit pas « impossible » : elle simule et propose jusqu'à 6 pistes, classées par efficacité |
| **Le podium refuse de s'afficher tant qu'il n'est pas mathématiquement certain** | C'est du travail d'orfèvre : il vérifie que le 1er est **garanti** devant le 2e, le 2e devant le 3e, et le 3e devant **tous** les suivants, en tenant compte des matchs restants. Aucun podium prématuré |
| **La synchronisation des équipes ne détruit jamais à l'aveugle** | Un club qui réduit sa participation ne fait pas disparaître une équipe déjà placée en poule : l'application **refuse et laisse une alerte** à traiter à la main |
| **« Recalculer les horaires » préserve les scores** | Il réinjecte les scores existants sur les affrontements identiques, et échange même les scores si A et B sont inversés dans le nouveau tirage |
| **Les protections vraiment critiques sont tenues par le serveur** | Réorganiser les poules après un score : refusé **côté serveur**. Gel des réponses des clubs à J-16 : refusé **côté serveur**, avec un commentaire expliquant qu'un verrou d'écran serait contournable |
| **Le score détaillé est recalculé par le serveur** | Le total envoyé par le téléphone n'est jamais cru sur parole |

> **À retenir** : ce n'est pas un prototype. C'est un outil pensé par quelqu'un qui connaît son
> métier, avec de vrais garde-fous. Les problèmes ci-dessous ne remettent pas cela en cause — ils
> décrivent **le trou qui reste** : la journée elle-même.

---

## A.2 — R-001 · Le forfait n'existe pas *(P1)*

### 1. Ce que j'ai trouvé

Dans toute l'application, un match n'a que **deux états possibles** : « à venir » ou « terminé ».
Il n'existe **aucun** état « forfait », « équipe absente », « match annulé » ou « non joué ».
*(CERTAIN — les deux seules valeurs écrites dans la colonne `statut` sont `'à venir'` et
`'terminé'`.)*

Et l'application **calcule les points de la même façon pour tout le monde** : si les deux scores
sont égaux, les deux équipes marquent **2 points** (match nul).

### 2. Pourquoi c'est important

Parce qu'il n'y a **aucune façon correcte** d'enregistrer une équipe qui ne vient pas. Or, dans un
tournoi École de Rugby, cela arrive : un club annule la veille, un car tombe en panne, une équipe
ne se présente pas sur le terrain.

L'organisateur n'a alors que des mauvaises options, et **chacune fausse le classement** — un
classement qui ne sert pas qu'à faire joli : c'est lui qui **décide de la composition de
l'après-midi**.

### 3. Exemple concret

Poule B des U10. Meudon ne se présente pas.

| Ce que l'organisateur peut faire | Ce que ça produit vraiment |
|---|---|
| Saisir **0 – 0** | Meudon marque **2 points** pour ne pas être venu. Une équipe qui a joué et perdu 12-14 n'en marque qu'**1**. L'absent passe devant le présent |
| Saisir **25 – 0** en faveur du présent | Le présent gagne 3 points — mais aussi **+25 de différence**, offerts par une équipe fantôme. Or la différence est le **2ᵉ critère de départage** : il peut ainsi doubler une équipe qui a réellement joué |
| Supprimer l'équipe Meudon | Il faut **tout regénérer** — ce qui **efface tous les scores déjà saisis** |
| Ne rien saisir | **Toute la génération de l'après-midi est bloquée** — pour toutes les catégories (voir R-002) |

Il n'y a pas de bonne case. **Quel que soit le choix, le classement est faux.**

### 4. Ce que je propose

Ajouter un **troisième état de match** : « forfait », avec l'équipe fautive désignée. À charge du
calcul de classement de le traiter comme une règle explicite plutôt que comme un score inventé —
la règle exacte (l'absent marque-t-il 0 point ? le présent marque-t-il une victoire sans
différence ?) est **une décision de Romain**, pas une décision technique.

### 5. Impact

- **Ce que ça change** : un nouvel état dans la colonne `statut` de l'onglet `Matchs`, une option
  supplémentaire dans la page de saisie, et une branche dans le calcul du classement.
- **Fonctionnalités concernées** : saisie des scores, classement des poules, génération de
  l'après-midi, podium, feuille de fin de journée, journal de saison.
- **Risque de la correction** : le classement est le cœur sportif de l'application, et il est
  **écrit deux fois** (serveur + navigateur, voir B-01). Toute modification doit être répercutée
  des deux côtés, sinon le classement affiché au public cesse de correspondre à celui qui génère
  l'après-midi.
- **Bénéfice** : c'est la différence entre « un outil qui tient une vraie journée » et « un outil
  qui tient une journée idéale ».

### 6. Ce que je conseille

**À corriger avant la première utilisation réelle** — et à traiter **en premier** parmi les P1.
C'est le seul problème de ce domaine qui produit des **résultats sportifs faux** de façon
certaine, dès la première fois qu'il se manifeste.

> **Note de transparence.** Ce constat frôle le P0 (« produit des résultats sportifs
> incorrects »). Je le classe **P1** parce que la définition du P1 dans `CLAUDE.md` est
> exactement celle-ci : *« doit être corrigé avant une utilisation réelle du logiciel »* — et
> l'application n'a **jamais servi de tournoi réel** (point I-04). Il ne casse rien aujourd'hui ;
> il cassera la première fois.

### ✅ 7. La règle, tranchée par Romain le 2026-08-04 *(décision D-011)*

| Point | Décision |
|---|---|
| L'équipe **absente** | **0 point** de classement — pas 1 comme une défaite jouée |
| L'équipe **présente** | **Elle gagne** : 3 points, comme une victoire |
| Le **score** attribué (donc la différence) | **Paramètre réglable par l'organisateur**, à sa discrétion |
| **Transparence** | Quel que soit le réglage choisi, **toutes les équipes doivent en être informées** — au minimum dans leur dossier final |

**Ce que cela implique techniquement** *(à retenir pour l'ÉTAPE 3)* :

- c'est bien **l'état « forfait » qui porte la victoire**, pas le score. Aujourd'hui l'application
  déduit victoire/nul/défaite en comparant les deux scores : un forfait réglé à « 0-0 » ne pourrait
  donc **pas** produire une victoire sans cet état explicite. C'est la raison technique qui rend la
  solution « inventer un score » définitivement insuffisante ;
- le paramètre ne pilote **que la différence de points**, jamais le résultat ;
- **recommandation de valeur par défaut : `0 – 0`.** Raison : la différence est le 2ᵉ critère de
  départage ; un défaut à 0 laisse la victoire par forfait peser exactement 3 points et **rien de
  plus**, ce qui ne fausse aucun classement. Un organisateur qui veut un autre usage règle la
  valeur — c'est précisément ce que la décision prévoit ;
- la **transparence exigée par Romain n'est pas réalisable aujourd'hui** : voir **R-012**.

### ✅ 8. La forme retenue : un bouton, pas un réglage *(amendement du 2026-08-04)*

Romain a précisé sa décision en **écartant le paramètre que je recommandais** :

> *« Au lieu de dire "on va paramétrer", on ajoute un bouton forfait en dessous de chaque équipe
> sur chaque match de la table de saisie des scores. Cela reste une victoire à mon sens, donc
> 3 points pour l'équipe présente, 0 pour celle qui est forfait. Quand on clique dessus il faut une
> double mise en garde. »*

**Et il a raison contre moi.** Le paramètre que je proposais était un piège : réglé sur « 25-0 »,
il aurait offert +25 de différence à une équipe — or la différence sert à départager. Une règle
fixe, **sans aucun score**, ne peut fausser aucun classement. Un réglage en moins, c'est une façon
de se tromper en moins.

Le **bouton sous chaque équipe** est également le bon geste : il fait dire à l'application **qui**
est forfait, qui est exactement l'information qui manque aujourd'hui.

#### Six compléments techniques à retenir pour l'ÉTAPE 3

| # | Complément | Pourquoi |
|---|---|---|
| 1 | **Le forfait doit être annulable** — un bouton « annuler le forfait » qui remet le match « à venir » | C'est le plus important. Sans cela, un appui malheureux à 9h coûte une regénération complète, donc tous les scores de la journée |
| 2 | **Prévoir les DEUX équipes forfait** sur le même match | Le cas existe : un club annule et retire toutes ses équipes. Un bouton par équipe le permet naturellement — reste à décider que personne ne marque alors |
| 3 | **La 2ᵉ mise en garde doit montrer la CONSÉQUENCE**, pas répéter la question | Deux fenêtres identiques s'enchaînent par réflexe. « MEUDON forfait → 0 point pour MEUDON, victoire pour ANTONY. Valider ? » oblige à *lire*, pas à *recliquer* |
| 4 | **Afficher « Forfait » partout, jamais « 0-0 »** — page publique, feuille de journée, journal de saison | Un « 0-0 » affiché ressemble à un match nul. Les parents et les clubs liraient un résultat qui n'a pas eu lieu |
| 5 | **Un match forfait doit DÉBLOQUER la génération de l'après-midi** | Sinon le forfait ne résout que la moitié du problème : le match reste « non terminé » et bloque tout (R-002) |
| 6 | **Garder la clé SCORES**, pas la clé admin | Déclarer un forfait a des conséquences sportives, mais exiger la clé admin obligerait à la partager au bord d'un terrain — or c'est elle qui peut effacer tout le tournoi. La double mise en garde **est** le garde-fou ; l'annulabilité (point 1) en est le filet |

> **Statut** : la règle métier de R-001 est **entièrement tranchée**. Il ne reste que l'écriture du
> code, à l'ÉTAPE 5, après les 8 audits.

---

## A.3 — R-002 · Un seul match non saisi bloque **tout** l'après-midi *(P1)*

### 1. Ce que j'ai trouvé

Pour générer l'après-midi, l'application exige que **tous** les matchs du matin soient terminés.
Et ce contrôle **ne regarde pas les catégories** : il porte sur l'ensemble des matchs du matin,
toutes catégories confondues. *(CERTAIN — le filtre de contrôle ne retient que la phase, jamais la
catégorie.)*

### 2. Pourquoi c'est important

Un oubli dans **une** catégorie fige **toutes** les autres. Le message affiché dit combien de
matchs manquent, mais pas **lesquels** ni **où** : l'organisateur doit les chercher.

### 3. Exemple concret

12h15. Les U8, U10 et U12 ont fini. En U14, un marqueur a oublié de valider le dernier match et il
est parti déjeuner. Résultat : **aucune** catégorie ne peut démarrer son après-midi. Trois cents
enfants attendent qu'on retrouve un score.

### 4. Ce que je propose

Deux pistes, à trancher :

- **la plus simple** : générer l'après-midi **catégorie par catégorie**, chacune n'attendant que
  ses propres matchs ;
- **la plus rapide à mettre en place** : garder le blocage global, mais **dire précisément quels
  matchs manquent** (catégorie, terrain, équipes) pour qu'on aille les chercher en 10 secondes.

Les deux sont compatibles. La seconde est un filet, la première est le vrai remède.

### 5. Impact

- **Ce que ça change** : le contrôle avant génération, et le message d'erreur.
- **Fonctionnalités concernées** : génération de l'après-midi uniquement.
- **Risque de la correction** : générer catégorie par catégorie touche à la planification des
  horaires de l'après-midi, qui est commune à toutes les catégories (les terrains sont partagés).
  Ce n'est pas anodin.
- **Bénéfice** : la journée ne s'arrête plus pour un oubli.

### 6. Ce que je conseille

**À corriger avant une utilisation réelle.** Au minimum le message détaillé, qui coûte peu et
résout 90 % de la douleur.

---

## A.4 — R-003 · Rien ne peut être ajusté une fois la journée lancée *(P1)*

### 1. Ce que j'ai trouvé

Il n'existe **aucun moyen de déplacer un match** : ni changer son heure, ni changer son terrain,
ni le reporter. *(CERTAIN — aucune action du serveur ne modifie l'heure ou le terrain d'un match
isolé.)*

Les seuls outils sont :

| Outil | Ce qu'il fait | Quand il refuse |
|---|---|---|
| **Recalculer les horaires** | Replanifie **tout le matin** | Refusé dès que **l'après-midi est généré**, et refusé si la composition a changé |
| **Réorganiser les poules** | Déplace des équipes puis replanifie | Refusé dès qu'**un seul score du matin** est saisi |
| **Tout regénérer** | Nouveau tirage complet | Jamais refusé — mais **efface tous les scores** |

En combinant ces trois lignes : **à partir du premier score saisi**, la structure du tournoi est
gelée ; et **à partir de la génération de l'après-midi**, même les horaires le sont. Le seul outil
qui fonctionne encore est celui qui détruit la journée.

### 2. Pourquoi c'est important

Parce qu'un tournoi ne se déroule jamais comme le planning. Il pleut, un terrain devient
impraticable, on a 40 minutes de retard, une remise des maillots s'éternise, un enfant se blesse
et il faut décaler.

### 3. Exemple concret

14h30. Le terrain Rugby 2 devient impraticable — de la boue et un trou. Il reste 9 matchs dessus.

L'application ne propose rien. « Recalculer les horaires » est refusé (l'après-midi est généré).
« Tout regénérer » effacerait les 40 scores du matin. **La seule issue est de gérer à la main, sur
papier** — et l'affichage public continue d'annoncer les anciens horaires et l'ancien terrain à
tous les parents.

### 4. Ce que je propose

Une action **« déplacer un match »** : changer son heure et/ou son terrain, un match à la fois,
sans rien regénérer et sans toucher aux scores. Avec un contrôle de cohérence qui **avertit** en
cas de conflit (terrain occupé, équipe déjà en jeu) **sans interdire** — le jour J, c'est
l'organisateur qui sait.

À noter : il existe déjà un contournement, **modifier la ligne directement dans le Google Sheet**.
Il fonctionne (l'application relit le classeur), mais il demande d'ouvrir le tableur sur un
téléphone, au bord d'un terrain, sans se tromper de colonne. Ce n'est pas une solution de terrain.

### 5. Impact

- **Ce que ça change** : une nouvelle action serveur, écrivant **deux cellules** d'une ligne de
  l'onglet `Matchs`, et un écran pour la déclencher.
- **Fonctionnalités concernées** : affichage public (les horaires changent), page de saisie (les
  matchs sont filtrés par terrain), dossier des clubs.
- **Risque de la correction** : **faible** — c'est une écriture ciblée, qui ne touche ni aux
  poules, ni aux scores, ni au tirage. C'est probablement le meilleur rapport bénéfice/risque de
  tout ce domaine.
- **Bénéfice** : l'application cesse d'être fausse dès que la réalité s'écarte du plan. Aujourd'hui,
  quand l'organisateur improvise, l'affichage public **ment aux parents**.

### 6. Ce que je conseille

**À corriger avant une utilisation réelle.** C'est le problème le plus fréquent en pratique : le
forfait arrive parfois, le décalage d'horaire arrive **toujours**.

### ⏳ 7. Ma proposition détaillée, en attente de validation *(D-013)*

Romain a répondu le 2026-08-04 : *« en effet je n'ai pas prévu ce cas, que me suggères-tu ? »*.
Voici trois niveaux, du plus simple au plus ambitieux. **Je recommande de ne faire que les deux
premiers.**

| Niveau | Ce que ça fait | Ce que ça coûte | Ce que ça couvre |
|---|---|---|---|
| **1 — Déplacer un match** | Changer l'heure et/ou le terrain **d'un match**, sans rien regénérer | **Faible** : on écrit 3 cellules d'une ligne. Ni poule, ni score, ni tirage touchés | Le terrain qui devient inutilisable, le match qu'on avance ou qu'on recule |
| **2 — Tout décaler de X minutes** | Un bouton qui décale **tous les matchs pas encore joués** de +15 / +30 min | **Faible** : même écriture, en masse, sur les seuls matchs « à venir » | **Le retard général** — le besoin le plus fréquent de tous |
| **3 — Rendre un terrain indisponible** | L'application **redistribue** les matchs restants de ce terrain sur les autres | **Moyen à élevé** : cela touche au planificateur | La pluie qui condamne un terrain pour la journée |

**Pourquoi s'arrêter aux niveaux 1 et 2** : ensemble, ils couvrent presque toutes les situations
réelles, pour un risque quasi nul — ce ne sont que des écritures ciblées dans l'onglet `Matchs`.
Le niveau 3 est le seul qui touche au moteur de planification, donc le seul qui puisse casser
quelque chose. Autant attendre de savoir, après un vrai tournoi, s'il manque vraiment.

**Trois règles de conception à retenir** :

1. **avertir, ne jamais interdire.** Si le terrain visé est occupé ou si une équipe joue déjà à
   cette heure-là, l'application le **signale** — mais elle laisse faire. Le jour J, c'est
   l'organisateur qui sait, pas l'algorithme ;
2. **ne jamais bloquer parce que l'après-midi est généré.** C'est précisément là que le besoin
   apparaît ;
3. **réservé à la clé admin.** Déplacer un match change ce que les parents lisent sur la page
   publique : ce n'est pas un geste de marqueur.

**Le gain immédiat, même avec le seul niveau 1** : aujourd'hui, quand l'organisateur improvise sur
le terrain, l'affichage public **continue d'annoncer les anciens horaires**. L'application ment aux
parents. Le niveau 1 suffit à faire cesser cela.

---

## A.5 — R-004 · Deux équipes à égalité parfaite sont départagées par l'ordre du tableur *(P1)*

### 1. Ce que j'ai trouvé

Le départage compte **trois critères**, dans l'ordre : points, puis différence, puis points
marqués. **Au-delà, il n'y a rien.** Deux équipes strictement égales sur les trois sont classées
dans l'ordre où elles se trouvent dans l'onglet `Equipes`. *(CERTAIN — et c'est déjà écrit noir
sur blanc dans `docs/regles-classement.md` : « Au-delà, l'ordre est celui du moteur de tri (non
garanti) — pas de critère supplémentaire (ex. confrontation directe) à ce jour ».)*

### 2. Pourquoi c'est important

Ce n'est pas une question d'affichage. Le rang d'une équipe dans sa poule **décide de son
après-midi** : en format croisé, tous les 1ers jouent ensemble, tous les 2es ensemble. Une équipe
classée 1ʳᵉ par l'ordre du tableur monte dans le groupe fort ; sa jumelle descend d'un niveau.

Et l'égalité parfaite n'est pas rare : avec des poules de 3 ou 4 équipes, 2 ou 3 matchs par équipe,
et un barème serré (3 / 2 / 1), les égalités sont **fréquentes**.

### 3. Exemple concret

Poule A des U12. Antony et Sèvres finissent toutes deux à 7 points, +4 de différence, 22 points
marqués. Sèvres a pourtant **battu Antony** en face à face le matin même.

L'application classe Antony 1ʳᵉ — parce que sa ligne est au-dessus dans le tableur. Antony joue le
groupe des 1ers l'après-midi, Sèvres celui des 2es. Aucun éducateur ne pourra comprendre pourquoi,
et **personne dans l'application ne saura expliquer la raison** : il n'y en a pas.

### 4. Ce que je propose

Ajouter un **4ᵉ critère : la confrontation directe** — quand deux équipes à égalité se sont
rencontrées, celle qui a gagné passe devant. C'est la règle la plus courante, et la plus facile à
expliquer à un éducateur.

Et **un 5ᵉ critère de dernier recours**, déterministe et assumé (par exemple l'ordre alphabétique),
pour qu'il n'y ait jamais d'ordre « au hasard ». Le choix exact de ces règles est **une décision de
Romain**, pas une décision technique.

### 5. Impact

- **Ce que ça change** : la fonction de comparaison du classement — **des deux côtés** (serveur et
  navigateur), puisqu'elle est écrite deux fois.
- **Fonctionnalités concernées** : classement des poules, génération de l'après-midi (tous
  formats), classement général, podium, affichage public.
- **Risque de la correction** : **réel**. C'est le cœur sportif. Une divergence entre les deux
  implémentations produirait un affichage public qui ne correspond plus au tirage de l'après-midi.
  Cette correction **exige des tests** avant d'être considérée comme faite.
- **Bénéfice** : un classement toujours explicable. Aujourd'hui, dans le cas d'égalité, il ne
  l'est pas.

### 6. Ce que je conseille

**À corriger avant une utilisation réelle**, mais **après** R-001 et R-003, et **avec des tests
écrits d'abord** (le domaine D en fera son sujet). C'est le problème le plus délicat des cinq :
celui où une correction bâclée ferait plus de dégâts que le problème lui-même.

### ⏳ 7. Ma proposition détaillée, en attente de validation *(D-014)*

Romain a répondu le 2026-08-04 : *« que me suggères-tu ? »*.

**Ma proposition : ajouter deux critères À LA SUITE des trois existants, sans toucher aux trois.**

| Rang | Critère | Statut |
|---|---|---|
| 1 | Le plus de **points** | existe déjà |
| 2 | La meilleure **différence** (marqués − encaissés) | existe déjà |
| 3 | Le plus de **points marqués** | existe déjà |
| **4** | **La confrontation directe** — si les deux équipes se sont rencontrées, celle qui a gagné passe devant | **à ajouter** |
| **5** | **L'ordre alphabétique** du nom d'équipe | **à ajouter** |

**Pourquoi la confrontation directe en 4ᵉ** :

- c'est la règle **la plus facile à expliquer à un éducateur** : « on s'est joué, tu as gagné, tu
  passes devant » ;
- dans une poule du matin, **elle existe toujours** : chaque équipe rencontre chacune des autres
  une fois. Deux équipes à égalité se sont donc forcément affrontées ;
- et surtout : **elle ne peut rien casser.** Elle n'intervient qu'après les trois critères
  existants, c'est-à-dire **uniquement dans les cas où l'application n'a aujourd'hui aucune règle**.
  Aucun classement actuellement correct ne changera. C'est ce qui rend cette correction beaucoup
  moins risquée qu'elle n'en a l'air.

**Pourquoi un 5ᵉ critère, et pourquoi l'ordre alphabétique plutôt qu'un tirage au sort** :

Il faut un dernier recours, parce que la confrontation directe ne tranche pas toujours : si trois
équipes sont à égalité et que chacune a battu une autre (A bat B, B bat C, C bat A), il n'y a pas
de vainqueur à désigner.

Et ce dernier recours doit être **déterministe** — c'est-à-dire donner **toujours** la même
réponse. Raison technique, et elle est décisive : le classement est calculé **deux fois**, une fois
par le serveur (pour tirer l'après-midi) et une fois par le navigateur (pour l'affichage public).
Un **tirage au sort** donnerait deux réponses différentes : **la page publique afficherait un
classement, et l'après-midi serait tiré sur un autre**. L'ordre alphabétique, lui, donne le même
résultat des deux côtés, toujours.

> Ce n'est pas « juste » au sens sportif — mais à ce stade, plus aucun critère sportif ne
> départage. Le choix est entre **un ordre arbitraire mais annoncé** et **un ordre arbitraire et
> caché**, qui est la situation actuelle.

**Et la transparence** : conformément à la règle que Romain a posée en tranchant le forfait
(D-011), cet ordre de départage devra figurer dans le dossier des clubs. C'est l'objet de **R-012**.

**Condition de mise en œuvre, non négociable** : cette correction touche au cœur sportif, et le
classement est **écrit deux fois**. Elle ne doit pas être écrite avant que des **tests** couvrent
les cas d'égalité — sinon rien ne prouvera que les deux versions donnent la même réponse. C'est
un sujet pour le domaine D.

---

## A.6 — R-005 · Un score aberrant est accepté sans le moindre avertissement *(P1)*

### 1. Ce que j'ai trouvé

Un score est accepté s'il est un **entier positif ou nul**. C'est tout. **Il n'y a aucune borne
haute**, ni côté serveur, ni côté navigateur. *(CERTAIN — le champ de saisie porte `min="0"` et
aucun `max` ; la vérification serveur refuse les négatifs et les décimaux, rien d'autre.)*

Un marqueur qui tape **150** au lieu de **15**, ou **1510** en glissant sur le clavier, voit son
score enregistré sans un mot.

### 2. Pourquoi c'est important

À cause du **2ᵉ critère de départage : la différence**. Une seule faute de frappe ne fausse pas un
match — elle **fausse tout le classement de la poule**, définitivement, tant que personne ne la
repère.

Et si l'après-midi est généré entre-temps, la faute de frappe est **cristallisée** : le tirage a
été fait sur un classement faux, et le seul moyen de le refaire est « tout regénérer », qui efface
les scores.

### 3. Exemple concret

U10, terrain 3. Le marqueur valide **150 – 8** au lieu de 15 – 8.

Racing prend **+142** de différence. Il finit 1ᵉʳ de sa poule quoi qu'il arrive, devant une équipe
qui avait fini à +12 en jouant mieux. Personne ne remarque rien avant la fin de la journée : sur la
page publique, le score de ce match précis s'affiche loin dans la liste, et c'est le **classement**
que tout le monde regarde.

### 4. Ce que je propose

Une **demande de confirmation au-delà d'un seuil** — pas un refus. Un score de 60 est rare mais
possible ; un score de 150 en École de Rugby ne l'est pas. Un simple *« 150 points, c'est
inhabituel — tu confirmes ? »* attrape la faute de frappe sans jamais empêcher un vrai score.

Le seuil est **une décision de Romain** : il connaît les scores réels de ces catégories.

### 5. Impact

- **Ce que ça change** : une confirmation dans la page de saisie, et (recommandé) une borne haute
  côté serveur pour que le garde-fou ne soit pas seulement dans la page — la leçon du point B-03.
- **Fonctionnalités concernées** : saisie des scores uniquement.
- **Risque de la correction** : **très faible**, à condition que le seuil soit large. Le seul
  risque serait de refuser un score légitime.
- **Bénéfice** : le classement cesse de dépendre du fait que personne ne se trompe de touche sur
  un téléphone, debout, sous la pluie.

### 6. Ce que je conseille

**À corriger avant une utilisation réelle.** C'est le meilleur rapport bénéfice/effort du domaine :
peu de code, aucune logique métier touchée, et cela protège directement la justesse des résultats.

### ✅ 7. La règle, tranchée par Romain le 2026-08-04 *(décision D-012)*

| Point | Décision |
|---|---|
| **Valeur maximale** | **2 chiffres** — au-delà de 99, la saisie est **refusée** |
| **Confirmation** | **Demandée avant chaque validation** de score |

**Ce que cela implique techniquement** *(à retenir pour l'ÉTAPE 3)* :

- la limite de 2 chiffres s'applique à **tout champ qu'un humain tape** — donc aussi aux compteurs
  du mode détaillé (essais, transformations, pénalités, drops). Une seule règle couvre ainsi les
  deux modes de saisie, et le total calculé par le serveur reste borné sans qu'on ait à le brider
  séparément ;
- la limite doit être posée **des deux côtés** : dans la page (pour que le marqueur voie l'erreur
  tout de suite) **et** dans le serveur (pour qu'elle ne soit pas contournable). C'est la leçon du
  point B-03 de la cartographie ;
- **question restante, mineure, à trancher au domaine E (UX)** : une confirmation à **chaque**
  score, c'est un appui de plus sur 60 matchs. Elle attrape la faute de frappe au bon moment, mais
  elle ajoute de la friction sur un téléphone, debout, sous la pluie. La décision de Romain est
  « toujours » et elle est appliquée telle quelle ; le confort de ce geste sera réexaminé au
  domaine E, sans revenir sur le principe.

---

## A.7 — Les problèmes P2 (améliorations utiles, non bloquantes)

### R-006 · Forcer le nombre de poules peut recréer des poules de 2 *(P2)*

L'application interdit une **catégorie** de moins de 3 équipes — c'est la règle de la Fédération,
et le code l'explique : à l'École de Rugby, les matchs secs ne sont pas autorisés.

Mais quand l'organisateur **force le nombre de poules**, ce contrôle ne s'applique plus : rien ne
vérifie la taille des poules obtenues. *(CERTAIN — le nombre forcé n'est borné que par le nombre
d'équipes.)*

**Exemple** : 6 équipes en U8, nombre de poules forcé à 3 → **trois poules de 2 équipes**, donc
trois matchs secs. Exactement ce que la règle des 3 équipes visait à empêcher.

**Ce que je propose** : avertir (ou refuser) quand un nombre de poules forcé produit une poule de
moins de 3 équipes. **Ce qu'il faut vérifier d'abord** : est-ce que le fait de forcer les poules
sert justement, parfois, à faire autre chose ? C'est une question pour Romain.

**Conseil** : à corriger, mais **pas en urgence** — il faut une action délibérée de l'organisateur
pour tomber dedans.

---

### R-007 · Une catégorie à 1 ou 2 équipes bloque la génération de tout le tournoi, sans dire quoi faire *(P2)*

Le blocage lui-même est **correct** (c'est la règle FFR) et il se produit **avant toute écriture**,
ce qui est le bon comportement. Deux choses sont perfectibles :

1. il bloque **tout le tournoi**, pas seulement la catégorie concernée ;
2. le message dit ce qui ne va pas, mais **pas ce qu'il faut faire**. Le remède (retirer les
   équipes, ou passer la catégorie en « non présente ») n'est pas indiqué.

C'est d'autant plus visible que le message voisin, celui sur la durée de mi-temps manquante,
**donne le remède** : *« clique Appliquer la norme FFR, ou saisis la durée »*. Le modèle existe
donc déjà dans le code.

**Conseil** : corriger le message (coût minime, gain réel). Le blocage global est un vrai sujet,
mais il relève du même chantier que R-002.

---

### R-008 · Une date de tournoi vide désactive silencieusement le gel des réponses *(P2)*

Le gel des réponses des clubs à J-16 est une bonne protection, tenue par le serveur. Mais si la
**date du tournoi** est absente ou illisible, la fonction qui calcule le gel répond « non gelé » —
donc les réponses restent ouvertes, **sans que rien ne le signale**. *(CERTAIN — déjà noté en
B-08.)*

Le choix est délibéré et documenté dans le code (*« on ne bloque pas les clubs sur une donnée
manquante »*), et c'est un raisonnement défendable. Le problème n'est pas le choix : c'est le
**silence**. L'organisateur croit que le gel le protège alors qu'il ne s'applique pas.

**Conseil** : afficher un avertissement dans l'administration tant que la date du tournoi est vide.
Ne pas changer le comportement lui-même sans validation.

---

### R-009 · Le Super Challenge phase 3 est incomplet, et le code le dit lui-même *(P2)*

Le code émet un avertissement explicite : le socle multi-journées *« n'est pas encore branché
(prévu PR B/C) »*, et la génération ne produit que le samedi. *(CERTAIN — déjà noté en B-07.)*

Ce n'est pas un défaut caché : c'est un chantier annoncé, honnêtement signalé à l'utilisateur au
moment où il génère. Il est listé ici pour ne pas être oublié, pas pour être reproché.

**Conseil** : à traiter quand un vrai Super Challenge phase 3 sera au programme. **Pas avant** —
c'est du travail conséquent pour un cas qui ne se présentera peut-être pas cette saison. Question
pour Romain : **est-ce prévu ?**

---

### R-010 · Les deux interrupteurs de publication peuvent surprendre *(P2)*

« Publier le tournoi » (page publique) et « Montrer le planning aux clubs » (dossiers des clubs)
sont **indépendants**. C'est volontaire et documenté, et le second est remis à « non » à chaque
regénération — une protection intelligente. *(CERTAIN — déjà noté en B-10.)*

Le point d'attention est uniquement de compréhension : un tournoi publié rend le planning visible
à qui a le lien public, **même si les clubs ne le voient pas dans leur dossier**. Un organisateur
qui croit avoir « tout caché » se trompe.

**Conseil** : clarifier le libellé des deux boutons dans l'administration. Ne pas toucher au
mécanisme, qui est bon.

---

### R-012 · Aucune règle sportive n'est écrite nulle part pour les clubs *(P2)*

**Constat.** Le barème (3 / 2 / 1) et l'ordre de départage n'existent que dans les **commentaires
du code** et dans `docs/regles-classement.md`, un document technique que personne d'autre que le
développeur ne lira. Ni la page publique, ni le dossier des clubs, ni l'invitation ne les affichent.
*(CERTAIN — recherche faite sur tout le frontend.)*

Il existe bien une ligne « **Règlement** » dans le dossier des clubs, mais :

1. c'est un **champ de texte libre** que l'organisateur doit remplir lui-même — l'application n'y
   met rien automatiquement ;
2. ce champ **a été retiré de l'écran d'administration**. Le commentaire du code le dit :
   *« le champ `reglement` a été retiré de la carte (sa valeur stockée est PRÉSERVÉE à
   l'enregistrement) »*. Autrement dit : **il n'existe aujourd'hui aucun moyen, dans l'interface,
   de le remplir.** *(CERTAIN.)*

**Pourquoi ça compte, et pourquoi ça remonte maintenant.** Romain a posé une exigence claire en
tranchant la règle du forfait (D-011) : *« toutes les équipes doivent être informées de tout point
de règlement dans leur dossier final, a minima »*. **Cette exigence n'est pas réalisable
aujourd'hui** — ni pour le forfait, ni pour le barème, ni pour le départage.

**Exemple concret.** Sèvres finit à égalité parfaite avec Antony et se retrouve 2ᵉ. L'éducateur
demande pourquoi. Personne ne peut lui montrer la règle : elle n'est écrite dans aucun document
que le club ait reçu.

**Ce que je propose.** Que le dossier des clubs affiche les règles que **l'application applique
réellement**, générées automatiquement à partir de ses propres valeurs :

- le barème (victoire 3, nul 2, défaite 1) ;
- l'ordre de départage complet ;
- la règle de forfait, avec le score paramétré par l'organisateur ;
- le format d'après-midi (déjà affiché aujourd'hui — le modèle existe donc).

**Le point clé** : ces règles ne doivent **pas** être retapées à la main. L'application connaît
ses propres valeurs ; les afficher depuis la source garantit que le document remis aux clubs ne
pourra jamais raconter autre chose que ce que le classement calcule.

**Conseil** : à traiter **en même temps que R-001 et R-004**, pas séparément. C'est ce qui rend
ces deux corrections opposables aux clubs — sans quoi on aura corrigé la règle sans que personne
ne la connaisse.

---

### R-013 · Aucun état « match annulé » — l'orage n'est pas prévu *(P2)*

**Constat.** Le même que R-001, vu sous un autre angle : un match n'a que deux états. Il n'existe
aucune façon d'enregistrer un match **qui n'a pas eu lieu sans que personne soit fautif** —
l'orage, le terrain condamné, la journée écourtée. *(CERTAIN.)*

**Ce que dit la FFR : INCONNU.** J'ai cherché dans `AUDIT-TOURNOI-R92.md`, l'audit de conformité
fédérale du dépôt : **il ne contient rien** sur le forfait, l'annulation, les intempéries ou le
report. Aucun de ses 25 points de vérification (Q11 → Q25) ne porte sur le sujet. Je ne sais donc
pas ce que la Fédération prescrit, **et je ne l'inventerai pas**.

> **Question à porter au chantier FFR** (décision D-003 — les deux chantiers restent séparés,
> c'est donc à Romain de la poser là-bas) :
> *« La FFR encadre-t-elle le sort d'un match d'École de Rugby qui n'a pas pu se jouer — forfait
> d'une équipe, ou annulation pour intempéries ? Existe-t-il une règle de classement imposée ? »*
> Mêmes destinataires que la question Q23, qui a déjà été résolue par cette voie.

**Ma proposition** *(détail complet dans `DECISIONS.md`, D-015)* : **le même mécanisme que le
forfait, avec un libellé différent.** Un match annulé ne compte pour personne — 0 point pour les
deux équipes, aucun point marqué ni encaissé — et il **ne bloque pas** la génération de
l'après-midi.

Techniquement, c'est un « double forfait ». Mais le mot compte : un forfait **désigne un fautif**,
une annulation **n'accuse personne**. Deux libellés, un seul mécanisme : une fois le forfait
construit, l'annulation ne coûte presque rien.

**La limite, signalée honnêtement.** Si **certains** matchs seulement sont annulés, les équipes
n'auront pas joué le même nombre de matchs et comparer leurs totaux devient inéquitable. Je
recommande néanmoins de **l'accepter et de le rendre visible** (la colonne « J » du classement
existe déjà) plutôt que de passer à une moyenne de points par match — parce que dans le cas réel,
l'orage n'annule pas un match, il annule **toute la journée en même temps** : toutes les équipes
sont alors touchées également. Changer le cœur du classement pour un cas qui ne se présente
presque jamais serait exactement l'optimisation prématurée que `CLAUDE.md` interdit.

**Conseil** : à traiter **avec R-001**, dont il réutilise toute la machinerie. Mais **poser la
question à la FFR d'abord** : si une règle fédérale existe, elle prime sur ma proposition.

> ✅ **Validé par Romain le 2026-08-04**, *par défaut* : la proposition D-015 s'applique tant
> qu'aucune règle fédérale ne la contredit. La question à la Fédération reste ouverte (**I-10**)
> et sa réponse primerait — sur D-015 comme sur D-011.

---

## A.8 — Le problème P3 (à garder pour plus tard)

### R-011 · Un tirage ne peut être ni reproduit, ni annulé *(P3)*

Le tirage est aléatoire et **rien n'en garde la trace**. Deux conséquences :

- **on ne peut pas revenir en arrière** : un tirage qui ne plaît pas ne se « défait » pas, il se
  refait — et donne autre chose ;
- **on ne peut pas le rejouer à l'identique**, donc on ne peut pas prouver après coup qu'il n'a pas
  été refait jusqu'à obtenir un résultat arrangeant.

Aujourd'hui ce n'est pas un problème : le tirage se fait avant le tournoi, et le refaire ne coûte
rien. Cela le deviendrait si l'application servait plusieurs clubs (l'objectif SaaS de
`CLAUDE.md` §11), où la question « le tirage était-il honnête ? » finit toujours par se poser.

**Conseil** : **ne rien faire maintenant.** À garder en tête pour le jour où l'outil sortira du
Racing.

---

## A.9 — Ce que le domaine A ne peut PAS conclure

Par honnêteté sur les limites de cet audit :

- ❌ **Rien n'a été exécuté.** Tous les constats portent sur ce que le code **prévoit**. Aucun
  scénario n'a été joué. Statut : **NON VÉRIFIÉ** pour tout comportement réel.
- ❌ **Le code réellement en service chez Google n'a pas été vu** → **INCONNU** (I-01). Il est
  possible que la version en ligne diffère de celle auditée ici.
- ❌ **La conformité au règlement FFR n'est pas jugée** : chantier séparé (D-003).
- ✅ **Deux des trois questions ouvertes ont été tranchées par Romain** le 2026-08-04 :
  1. **la règle du forfait** → décision **D-011** (§A.2, point 7) ;
  2. le seuil de confirmation d'un score → **la question était mal posée de ma part** : Romain n'a
     pas voulu d'un seuil, mais d'une **limite dure à 2 chiffres** doublée d'une **confirmation
     systématique** → décision **D-012** (§A.6, point 7).
- ⏳ **Deux propositions attendent sa validation**, formulées à sa demande :
  - **D-013** — comment ajuster le planning en cours de journée (§A.4, point 7) ;
  - **D-014** — quels critères de départage ajouter (§A.5, point 7).
- ❓ **Une question adjacente, non urgente, reste posée** : faut-il un état « **match annulé** »
  (l'orage qui arrête le tournoi), distinct du forfait ? Personne n'a tort, personne n'est absent :
  le match n'a simplement pas eu lieu. C'est le même chantier technique que R-001, donc le bon
  moment pour trancher — mais rien ne presse.

---

## A.10 — Récapitulatif du domaine A

| Réf | Problème | Priorité | Où ça fait mal | Difficulté de correction |
|---|---|---|---|---|
| **R-001** | Le forfait n'existe pas | **P1** | Résultats sportifs faux | Moyenne — touche au classement |
| **R-002** | Un match non saisi bloque tout l'après-midi | **P1** | La journée s'arrête | Faible (message) à moyenne (par catégorie) |
| **R-003** | Aucun ajustement de planning en cours de journée | **P1** | L'affichage public devient faux | **Faible** — écriture ciblée |
| **R-004** | Pas de départage au-delà du 3ᵉ critère | **P1** | Classement inexplicable, après-midi faussé | **Élevée** — cœur sportif, écrit deux fois |
| **R-005** | Aucune borne haute sur un score | **P1** | Une faute de frappe fausse une poule | **Très faible** |
| **R-006** | Poules forcées : poules de 2 possibles | P2 | Contourne la règle des 3 équipes | Faible |
| **R-007** | Catégorie à 1-2 équipes : blocage global, sans remède affiché | P2 | Perte de temps | Très faible (message) |
| **R-008** | Date vide = gel des réponses désactivé en silence | P2 | Fausse sécurité | Très faible |
| **R-009** | Super Challenge phase 3 incomplet | P2 | Fonctionnalité partielle, annoncée | Élevée |
| **R-010** | Deux publications indépendantes, libellés ambigus | P2 | Malentendu | Très faible |
| **R-011** | Tirage non reproductible ni annulable | P3 | Rien aujourd'hui | Moyenne |
| **R-012** | Aucune règle sportive n'est écrite nulle part pour les clubs (et le champ prévu pour le faire a été retiré de l'interface) | P2 | Une règle qu'on ne peut opposer à personne | Faible |
| **R-013** | Aucun état « match annulé » : l'orage n'est pas prévu | P2 | La journée écourtée ne peut pas être enregistrée | Faible **si** traité avec R-001 |

**Total : 0 P0 · 5 P1 · 7 P2 · 1 P3 — soit 13 problèmes.**

### État des décisions

| Réf | Décision attendue | Statut |
|---|---|---|
| R-001 | Règle **et forme** du forfait | ✅ **Tranchée** — D-011 + son amendement (bouton par équipe, 3/0, sans score, double mise en garde) |
| R-005 | Limite et confirmation des scores | ✅ **Tranchée** — D-012 (2 chiffres max + confirmation) |
| R-003 | Ajuster le planning en cours de journée | ✅ **Tranchée** — D-013 (déplacer un match + décaler toute la journée de X minutes) |
| R-004 | Critères de départage à ajouter | ✅ **Tranchée** — D-014 (confrontation directe, puis ordre alphabétique) |
| R-012 | Publier les règles dans le dossier des clubs | ✅ **Acquise** — c'est l'exigence même posée par Romain dans D-011 |
| R-013 | Le match annulé | ✅ **Tranchée par défaut** — D-015 ; une règle FFR primerait (**I-10**, question sortante) |

> ✅ **Le domaine A est clos.** Les **13 problèmes** sont identifiés et **toutes les décisions
> métier sont prises**. Il ne reste que l'écriture du code, qui n'aura pas lieu avant la fin des
> **8 audits** et la validation de l'**ÉTAPE 4**.
>
> Une seule inconnue subsiste, et elle est **extérieure au dépôt** : ce que la FFR prescrit pour un
> match qui n'a pas pu se jouer (**I-10**).

### Si je devais ne corriger que trois choses

1. **R-005** (limite à 2 chiffres + confirmation) — quelques lignes, aucun risque, protège
   directement la justesse des résultats. **La règle est tranchée : c'est prêt à être planifié** ;
2. **R-003** (déplacer un match, + le décalage global) — risque faible, et c'est le besoin qui se
   présentera **à chaque tournoi** ;
3. **R-001** (le forfait) — le plus structurant. **La règle est tranchée** ; reste à l'écrire.

R-004 (le départage) vient juste après, mais mérite qu'on écrive des tests **avant** d'y toucher.

**Et R-012 ne doit pas être traité seul** : il est ce qui rend R-001 et R-004 opposables aux clubs.
Corriger une règle que personne ne peut lire ne règle qu'une moitié du problème.

---

# DOMAINE C — SÉCURITÉ / DEVSECOPS

> **La question posée** : qui peut faire quoi dans cette application — et que pourrait obtenir,
> casser ou détourner quelqu'un de mal intentionné ? **Aucun fichier de l'application n'a été
> modifié.** Comme l'exige `CLAUDE.md` §6.C, chaque faille est décrite avec : sa criticité, un
> **scénario d'exploitation**, son impact, une recommandation et la **difficulté de correction**.

**Audité en session 6, le 2026-08-04.**

---

## C.0 — Le verdict en une phrase

**Le code est bien plus propre en sécurité que la moyenne des projets amateurs** — les mots de
passe ne sont nulle part dans le dépôt, les textes affichés sont systématiquement neutralisés,
les liens des clubs sont de vrais numéros aléatoires — **mais une seule porte est ouverte à tout
le monde, sans aucune clé et sans aucune limite, et c'est par elle qu'on peut mettre l'application
à genoux le jour du tournoi**. Le reste des problèmes tient en une phrase : **il n'y a pas de
personnes, seulement des mots de passe partagés**, et personne ne peut donc être ni reconnu, ni
retiré, ni retrouvé après coup.

---

## C.1 — Ce qui est solide (et qu'il ne faut surtout pas casser)

Il faut le dire avant les problèmes, parce que c'est vrai et que ce sont des acquis fragiles :
les casser en corrigeant autre chose serait un très mauvais échange.

1. **Les deux clés ne sont PAS dans le dépôt.** J'ai vérifié **l'historique complet** du projet —
   **513 enregistrements**, pas seulement les récents — en cherchant les mots de passe et les
   secrets du relais : **aucune fuite**. Seuls apparaissent le code qui *range* les clés et des
   exemples volontairement bidons (`NOUVELLE_CLE_ADMIN_LONGUE`). *(CERTAIN.)*
2. **La règle « rien ne sort sauf ce qui est nommé ».** Pour les réglages (`Config`) et les
   partenaires, le serveur ne renvoie que des champs **listés à la main**, et il existe **trois
   listes différentes** selon l'interlocuteur (public / vitrine / club). Un réglage ajouté demain
   est **privé par défaut** : personne n'a à y penser. C'est la bonne façon de faire.
3. **Tout ce qui est écrit dans le classeur est forcé en « texte ».** Une trentaine d'endroits du
   code posent ce format avant d'écrire. Conséquence : un nom d'équipe commençant par `=` reste
   un texte et **ne devient jamais une formule de calcul** — un piège classique, ici évité.
4. **Tout ce qui est affiché est neutralisé.** Les deux côtés (navigateur et serveur) possèdent la
   même fonction d'échappement, appliquée partout où du texte venant du classeur est injecté dans
   une page. J'ai vérifié par sondage sur la page publique, la saisie, les partenaires, le dossier
   club : **je n'ai pas trouvé d'oubli**.
5. **Les liens des partenaires sont bornés** : seuls `http://` et `https://` sont acceptés à
   l'affichage — un lien piégé de type `javascript:` est **refusé**. Les couleurs sont validées
   comme code couleur à 6 caractères. Deux pièges classiques, tous deux fermés.
6. **Les liens personnels des clubs sont de vrais numéros aléatoires** (`Utilities.getUuid()` —
   le générateur cryptographique de Google), pas des suites devinables.
7. **Le destinataire d'un courriel est TOUJOURS relu dans le classeur**, jamais pris dans la
   demande du navigateur. Impossible de faire envoyer un message à une adresse choisie par
   l'attaquant. Ce point est explicitement commenté dans le code : c'était un choix conscient.
8. **Le dépôt d'images est verrouillé** : liste blanche stricte de formats (PNG / JPEG / WebP /
   GIF) et plafond de 5 Mo, contrôlés **avant** d'écrire quoi que ce soit dans le Drive.
9. **Les relevés des partenaires sont entièrement revalidés** : identifiants au format strict
   (4 à 40 caractères, lettres/chiffres/tiret), nombre de partenaires borné, chaque compteur
   plafonné. Le commentaire du code dit juste : *« Rien de ce qui entre n'est cru sur parole. »*
10. **Les messages d'erreur inattendus sont génériques.** Le détail part dans le journal du
    serveur, jamais dans la réponse : l'intérieur du système n'est pas raconté au visiteur.
11. **Le gel des réponses à J-16 est tenu par le serveur**, avec un commentaire expliquant
    pourquoi un verrou d'écran seul serait contournable. C'est exactement le bon raisonnement.
12. **Les trois pages qui contiennent un lien personnel** (dossier club, invitation, réponse) sont
    marquées « ne pas indexer » : elles ne remonteront pas dans un moteur de recherche.
13. **L'onglet des clubs invités est exclu** des données publiques, et **le classeur est privé**
    (vérifié par Romain, I-06). Deux barrières indépendantes sur le carnet d'adresses.

> **À retenir** : la personne qui a écrit ce code **connaissait** les pièges de sécurité classiques
> et les a fermés un par un. Les problèmes ci-dessous ne sont pas des négligences ; ce sont des
> **choix de conception** qui tiennent tant que l'application reste petite et confidentielle.

---

## C.2 — R-014 · La seule porte ouverte sans clé n'a aucun garde-fou *(P0)*

### 1. Ce que j'ai trouvé

Toutes les écritures de l'application exigent un mot de passe — **sauf une**. Elle s'appelle
`mesureSponsors`. C'est celle qui reçoit les **statistiques d'affichage des partenaires** envoyées
par les téléphones des spectateurs : « le logo du garage X a été vu 4 secondes ».

Elle est traitée **en tout premier**, avant le contrôle de clé, et pour de bonnes raisons
expliquées dans le code : les spectateurs n'ont évidemment pas de mot de passe, et il ne faut
surtout pas que ces relevés fassent attendre le marqueur au bord du terrain.

**Le problème n'est pas qu'elle soit ouverte. Le problème est qu'elle n'a AUCUNE limite** :

- **aucun plafond du nombre d'envois** — ni par appareil, ni par minute, ni par jour ;
- **chaque envoi ajoute une ligne** dans l'onglet `Mesures` ;
- **rien n'efface jamais ces lignes** automatiquement (déjà relevé en cartographie, point C-09) ;
- l'adresse du serveur est **publiquement lisible** dans `frontend/js/config.js` — c'est
  inévitable (le navigateur doit la connaître), mais cela veut dire que **n'importe qui** peut
  trouver cette porte en trente secondes.

*(CERTAIN — constaté dans `backend/Code.gs`, `doPost` et `enregistrerMesureSponsors`.)*

### 2. Pourquoi c'est important

Deux plafonds existent chez Google, et l'application dépend des deux :

- un classeur Google Sheets ne peut pas dépasser **10 millions de cases**. Chaque relevé occupe
  5 cases. **Environ 2 millions de relevés suffisent donc à remplir le classeur** — et quand un
  classeur est plein, **plus AUCUNE écriture ne passe** : ni les scores, ni les équipes, ni rien ;
- le programme ne peut exécuter qu'un **nombre limité de demandes en même temps** (~30). Les
  saturer, c'est faire échouer ou attendre toutes les autres.

Autrement dit : **une porte prévue pour compter des logos de sponsors peut servir à empêcher la
saisie des scores.**

### 3. Exemple concret

Le samedi du tournoi, 9 h 30. Une personne — un plaisantin, un club mécontent, ou simplement un
programme mal écrit qui tourne en boucle — envoie des relevés en continu depuis un ordinateur
portable, sur le réseau mobile du stade.

À 10 h, le marqueur du terrain 3 valide un score. La page tourne, tourne, puis affiche
*« Serveur momentanément occupé, réessaie dans un instant. »* Il réessaie. Même chose.

Sur les téléviseurs de la buvette, la page publique reste figée sur les scores de 9 h 15.

Personne ne comprend ce qui se passe : **rien n'est cassé, rien n'a été piraté, aucune donnée
n'a été volée**. L'application est simplement occupée à compter des logos.

Et la remise en route n'est pas immédiate : il faut ouvrir le classeur à la main et supprimer
les lignes accumulées.

### 4. Ce que je propose

Trois mesures, de la plus simple à la plus complète. La première suffit déjà à écarter le pire.

1. **Un plafond quotidien global** : au-delà de N relevés dans la journée (par exemple 20 000 —
   très au-delà d'un vrai tournoi), le serveur répond « merci » **sans rien écrire**. La mesure
   des partenaires continue de fonctionner normalement pour tout le monde, elle cesse simplement
   d'être enregistrée quand le chiffre devient absurde ;
2. **Un plafond par appareil** : un même identifiant d'appareil ne peut déposer qu'un petit nombre
   de relevés par heure. Le code connaît déjà cet identifiant, il n'y a rien à inventer ;
3. **Une purge automatique** : les relevés de plus de X jours sont effacés d'eux-mêmes. Cela règle
   du même coup le point C-09 (l'onglet qui grossit sans fin) et prépare le domaine B.

**Difficulté de correction : FAIBLE.** Le mécanisme de comptage nécessaire **existe déjà** dans le
fichier — c'est exactement celui qui compte les mauvaises tentatives de mot de passe. Il s'agit de
le réutiliser, pas de l'écrire.

### 5. Impact

- **Ce que cela change** : rien de visible. Un spectateur ne verra aucune différence ; l'écran des
  partenaires affichera les mêmes chiffres.
- **Risques de la correction** : très faibles. Le seul effet possible serait de **sous-compter**
  les partenaires si le plafond était mal réglé — d'où l'importance de le placer très haut.
- **Bénéfices** : la seule porte ouverte de l'application cesse d'être un levier ; l'onglet
  `Mesures` cesse de grossir indéfiniment.
- **Fonctionnalités concernées** : uniquement la mesure de visibilité des partenaires. **Ni les
  scores, ni le classement, ni les clubs, ni le planning** ne sont touchés.

### 6. Ce que je conseille

**Corriger avant la production — et c'est le seul point de tout cet audit dont je dirais qu'il
mérite d'être traité en avance, hors de l'ordre normal.**

Pourquoi je le classe **P0** alors que rien n'est cassé aujourd'hui :

- c'est **le seul problème exploitable sans connaître aucun secret** ;
- il frappe exactement **le moment et la fonction qui comptent** (la saisie des scores, le jour J) ;
- il coûte **peu** à corriger et **ne présente presque aucun risque de régression**.

**Ce que je ne dis pas** : je ne dis pas que cela va arriver. Aucun tournoi réel n'a encore eu
lieu, l'adresse n'est connue de personne, et il n'existe aucune raison qu'on s'en prenne à un
tournoi d'école de rugby. Je dis que **la porte est ouverte et qu'elle est bon marché à fermer**.

> **Niveau de certitude** : **CERTAIN** pour le code (l'absence de limite est constatée).
> **PROBABLE** pour les conséquences chiffrées : les plafonds exacts de Google et le temps
> nécessaire pour remplir le classeur **n'ont pas été testés** et ne peuvent pas l'être depuis
> le dépôt. Le raisonnement tient, la mesure n'a pas été faite.

### ✅ 7. Ce qui a été fait — décision D-016, option (b), le 2026-08-04

Romain a retenu l'**exception ciblée** : *« va pour B alors je te suis dans ton raisonnement »*.
R-014 a donc été corrigé **seul**, en avance sur l'ordre du chantier. Commit `c1948fc`.

**Le réglage qui rend l'exposition sérieuse a été confirmé au passage** — l'inconnue **I-11** est
levée. Romain a fourni la capture de l'écran de déploiement Apps Script :

> *Exécuter en tant que* : **Moi (romain.rifleu@gmail.com)** · *Qui a accès* : **Tout le monde**

« Tout le monde » signifie **sans compte Google, sans rien** : le scénario décrit plus haut ne
supposait donc aucun préalable. C'est aussi le réglage **nécessaire** au fonctionnement — la page
publique des scores doit être lisible par des spectateurs anonymes. Il n'y a rien à changer là ;
c'est précisément pour cela que la porte devait être plafonnée.

**Trois plafonds, énoncés du plus fiable au moins fiable** :

| # | Plafond | Valeur | Fiabilité |
|---|---|---|---|
| 1 | **Taille de l'onglet `Mesures`** | 100 000 lignes | **Déterministe** — lu dans le classeur. C'est lui qui rend le remplissage **définitivement impossible** |
| 2 | **Débit global**, tous appareils | 30 000 par tranche de 6 h | Best-effort (mémoire temporaire non transactionnelle) |
| 3 | **Débit d'un même appareil** | 30 par heure | Best-effort, et **contournable** : l'identifiant d'appareil est choisi par le client. Il arrête une page partie en boucle, pas quelqu'un de déterminé |

Deux choix de mise en œuvre méritent d'être expliqués :

- **les plafonds de débit sont vérifiés AVANT d'ouvrir le classeur.** Ouvrir le classeur coûte à
  lui seul environ une demi-seconde de serveur ; une requête refusée ne coûte plus qu'une lecture
  de mémoire. Sans cela, le garde-fou aurait coûté presque aussi cher que l'abus qu'il empêche ;
- **le compteur est rangé sous un numéro de tranche horaire**, et non reconduit. Sinon, chaque
  nouvel envoi aurait repoussé sa date d'expiration : une fois le plafond atteint, il ne se serait
  **jamais** relâché tant que le trafic dure — et ce sont les spectateurs légitimes qui auraient
  été bloqués.

**Ce que la correction NE fait PAS — à lire, c'est important** :

- ❌ **elle ne rend pas l'adresse immunisée contre un envoi massif.** Google Apps Script ne fournit
  pas l'adresse du visiteur : on ne peut donc pas distinguer un abuseur d'un spectateur. Ce qui est
  visé, et atteint, c'est qu'un abus **n'empêche plus jamais la saisie des scores** — et qu'il ne
  laisse plus de **dégât durable** ;
- ❌ **elle n'ajoute pas la purge automatique des vieux relevés** (point C-09). C'est volontaire :
  c'est un autre sujet, qui relève du domaine B. Tant qu'elle n'existe pas, l'onglet finit par
  atteindre le plafond dur et la mesure s'arrête — **sans rien casser d'autre**. Le bouton
  « Vider les relevés » de l'écran Partenaires reste disponible ;
- ❌ **elle n'est pas active tant que le backend n'a pas été redéployé chez Google.** Statut :
  **CORRIGÉ dans le dépôt**, **PAS en production** (`CLAUDE.md` §13.6).

**Un effet de bord qu'il a fallu traiter dans le même geste** : le bouton « Tester la remontée »
de l'écran Partenaires aurait annoncé *« ✅ Écriture acceptée »* puis *« ❌ Relecture introuvable »*,
et envoyé chercher une panne qui n'existe pas. Il dit désormais explicitement qu'un plafond est
atteint, et lequel.

### ✅ 8. Vérifié en conditions réelles — statut **TESTÉ** *(2026-08-04)*

R-014 est **le premier problème du chantier à atteindre le statut TESTÉ**. Trois preuves,
apportées par Romain après le redéploiement :

| Preuve | Résultat |
|---|---|
| Le backend en service est-il bien le nouveau ? | ✅ **Redéployé** → lève **I-13** |
| Les tests passent-ils ? | ✅ **573 sur 573** dans Apps Script → lève **I-02** |
| La mesure des partenaires fonctionne-t-elle toujours ? | ✅ Écriture, relecture, et **109 relevés réels** de spectateurs |

La troisième ligne est la plus importante des trois : c'est la **preuve de non-régression**.
Le plafonnement n'a rien cassé — les relevés continuent d'arriver et d'être relus.

**Contrôle croisé du nombre de tests** : le fichier contient **564** appels de vérification écrits
en dur, plus **9** situés à l'intérieur de boucles — soit 573. Le compte annoncé par Google
correspond exactement, ce qui confirme que **les 16 vérifications ajoutées pour cette correction
étaient bien dans le lot exécuté**. Sans ce recoupement, « 573/573 » ne prouverait pas que les
nouveaux tests ont tourné.

**⚠️ Ce qui reste NON VÉRIFIÉ, et le restera** : le chemin de **refus** — ce qui se passe une fois
un plafond franchi — n'est prouvé que par les tests unitaires. Personne n'a envoyé 30 001 relevés
pour l'observer en vrai, et personne ne le fera. Le bouton de diagnostic ne peut pas non plus
l'atteindre : il tire un identifiant d'appareil neuf à chaque essai, donc il ne consomme jamais le
plafond par appareil — c'est voulu, il ne doit jamais se bloquer lui-même.

---

## C.3 — R-015 · Regénérer les poules efface tous les scores, et seul le navigateur s'y oppose *(P1)*

### 1. Ce que j'ai trouvé

Le bouton « regénérer les poules et le planning » **efface tous les matchs**, donc tous les scores
déjà saisis. C'est normal : on refait le tirage.

Ce qui ne l'est pas : **le serveur ne vérifie jamais si des scores existent**. J'ai lu la fonction
en entier. Elle refuse une catégorie à moins de 3 équipes, elle refuse une durée de mi-temps
manquante — **elle ne regarde pas une seule fois si la journée a déjà commencé**.

La protection existe, mais **uniquement dans la page web** : double confirmation, puis re-saisie
du mot de passe admin.

*(CERTAIN — `genererPoulesEtPlanning`, `backend/Code.gs`.)*

### 2. Pourquoi c'est important

Une protection qui ne vit que dans la page est **une protection qu'on peut contourner sans le
vouloir**. Et surtout : elle disparaît si la page est rechargée pendant l'opération, si un autre
outil parle au serveur, ou si quelqu'un utilise un vieil onglet ouvert la veille.

Le comparatif est ce qui rend le constat gênant : dans **le même fichier**, deux protections
voisines sont, elles, tenues par le serveur — « réorganiser les poules » **refuse** dès qu'un
score existe, et le gel des réponses à J-16 est vérifié côté serveur avec un commentaire
expliquant pourquoi. **Le raisonnement correct a été fait ailleurs, mais pas ici.**

### 3. Exemple concret

15 h 10. Les poules du matin sont jouées, les scores sont saisis, l'après-midi est généré.

Un bénévole ouvre l'onglet admin resté ouvert depuis ce matin, cherche « où en est le planning ? »,
et clique sur le bouton de génération en pensant qu'il rafraîchit l'affichage. Deux confirmations
apparaissent, il les valide machinalement — la journée est chargée, il va vite.

**Tous les scores du matin sont perdus.** Il n'existe **aucune annulation** et **aucune
sauvegarde**. L'onglet `Historique` a bien gardé une ligne par score, mais rien dans l'application
ne sait les remettre en place : il faudrait tout ressaisir à la main.

### 4. Ce que je propose

**Déplacer le garde-fou côté serveur**, exactement comme c'est déjà fait pour « réorganiser les
poules » : si au moins un match est terminé, la génération est **refusée**, sauf si la demande
porte une confirmation explicite (un champ que seule la page envoie après ses deux avertissements).

**Difficulté : FAIBLE.** Le code de référence existe déjà quelques dizaines de lignes plus loin.

### 5. Impact

- **Ce que cela change** : rien tant qu'aucun score n'est saisi. Après le premier score, le
  bouton demandera une confirmation supplémentaire au lieu de faire confiance à la page.
- **Risques** : faibles, mais réels — si la confirmation était mal branchée, l'organisateur ne
  pourrait plus regénérer du tout. À tester avec soin.
- **Bénéfices** : la perte de données devient **impossible par accident**.
- **Fonctionnalités concernées** : la génération des poules et du planning, uniquement.

### 6. Ce que je conseille

**Corriger avant la production.** Ce n'est pas une faille au sens « quelqu'un vous attaque » :
c'est un filet de sécurité manquant sur **l'action la plus destructrice de l'application**.

---

## C.4 — R-016 · La réinitialisation efface tout sans que le serveur demande quoi que ce soit *(P1)*

### 1. Ce que j'ai trouvé

L'action « réinitialiser le tournoi » vide les équipes, les poules, les matchs, toutes les
catégories, les horaires, les contacts, le dossier d'invitation, et **met à la corbeille du Drive
l'affiche et la photo du parking**.

Le serveur **exécute dès qu'il reçoit le bon mot de passe**. Aucune question, aucune confirmation,
aucune sauvegarde préalable, aucun retour en arrière. La confirmation vit **uniquement dans la
page** (déjà relevé en cartographie, point B-11).

*(CERTAIN — `reinitialiserTournoi`, `backend/Code.gs`.)*

### 2. Pourquoi c'est important

C'est **la même faiblesse que R-015, en pire** : là où la génération détruit les scores, la
réinitialisation détruit **toute l'édition en cours**, y compris des fichiers du Drive qui ne
sont pas dans le classeur.

Un mot de passe donne le droit de tout effacer. Il ne devrait pas suffire à le faire **par
inadvertance**.

### 3. Exemple concret

Trois jours avant le tournoi. Tout est prêt : 14 clubs, 38 équipes, le planning, l'affiche, la
photo du parking, les contacts de secours.

Une personne qui prépare **l'édition suivante** sur le même écran clique sur « Réinitialiser ».
Elle comprend le message, elle est sûre d'elle : elle veut repartir de zéro pour l'année
prochaine. Elle ne réalise pas que le tournoi de samedi est **dans la même base**.

Tout est effacé. Il reste : le carnet d'adresses des clubs, les partenaires, l'historique — **et
c'est tout**. Le planning, les équipes, les horaires, l'affiche : à refaire.

### 4. Ce que je propose

Trois pistes, à combiner ou non — **ce choix appartient à Romain**, parce qu'il change sa façon
de travailler :

1. **Une confirmation vérifiée par le serveur** : la demande doit contenir un mot exact (par
   exemple le nom du tournoi en cours). Un clic seul ne suffit plus ;
2. **Une sauvegarde automatique avant effacement** : le serveur recopie les onglets dans un
   classeur daté avant de vider. C'est la seule mesure qui rende l'erreur **réparable** ;
3. **Ne rien effacer, mais archiver** : la réinitialisation crée une nouvelle « édition » et met
   l'ancienne de côté. C'est le plus propre, et **de loin le plus lourd** — cela touche à la
   structure des données. **Je ne le recommande pas maintenant** (à garder pour la piste SaaS).

**Ma recommandation : (1) tout de suite, (2) si c'est acceptable.** Difficulté : **faible** pour
(1), **moyenne** pour (2), **élevée** pour (3).

### 5. Impact

- **Ce que cela change** : un geste de plus pour réinitialiser. C'est voulu.
- **Risques** : faibles pour (1). Pour (2), il faut vérifier que la copie ne dépasse pas les
  quotas de Drive.
- **Bénéfices** : la seule action réellement irréversible de l'application cesse de l'être.
- **Fonctionnalités concernées** : la réinitialisation, et elle seule.

### 6. Ce que je conseille

**Corriger avant la production**, au moins la mesure (1). C'est peu de travail pour supprimer le
risque le plus coûteux du logiciel : perdre la préparation d'un tournoi entier.

---

## C.5 — R-017 · Deux mots de passe partagés, aucune personne, aucune révocation, aucune trace *(P1)*

### 1. Ce que j'ai trouvé

Il n'existe **aucun compte utilisateur** dans l'application. Personne ne « se connecte » à son
nom. Il y a **deux mots de passe** :

- la **clé ADMIN**, qui ouvre tout (44 actions) ;
- la **clé SCORES**, qui ouvre une seule chose : enregistrer un score.

**Qui connaît la clé EST l'administrateur.** Et le jour du tournoi, la clé SCORES est
nécessairement communiquée à plusieurs bénévoles — c'est le principe même de l'outil.

Trois conséquences, toutes constatées dans le code :

- **on ne peut retirer l'accès à personne** sans le retirer à tout le monde (changer la clé oblige
  à la redistribuer à tous, en pleine journée) ;
- **le classeur ne garde aucune trace de qui a fait quoi.** L'onglet `Historique` enregistre bien
  chaque score, mais avec **le match et le score, jamais l'auteur** ;
- **un score validé peut être réécrit** : le serveur refuse une deuxième saisie… sauf si la
  demande porte un simple indicateur « je corrige » — que la page envoie quand on clique sur
  « Corriger ». C'est **volontaire et nécessaire**, mais cela signifie que **toute personne ayant
  la clé SCORES peut modifier n'importe quel score, à n'importe quel moment, sans être identifiée.**

*(CERTAIN — `verifierCle`, `enregistrerScore`, `ENTETES.Historique`.)*

### 2. Pourquoi c'est important

Le critère P0 de ce projet inclut « produire des résultats sportifs incorrects ». Ici, on n'y est
pas — il faut connaître la clé — mais on en est à un seul pas.

Et surtout : **en cas de contestation, il n'y a rien à montrer.** Un club affirme que son score a
été changé ? L'application peut dire *ce qui* a changé, jamais *qui* l'a changé.

### 3. Exemple concret

16 h. Le Racing et Clamart sont à égalité parfaite dans la poule U10. Le classement décide de la
composition de l'après-midi.

Un bénévole — de bonne foi — croit se souvenir que le score du match Racing/Vélizy était 15-10 et
non 10-15. Il ouvre la saisie, clique « Corriger », valide.

Le classement bascule. Personne ne s'en aperçoit sur le moment.

Le soir, un dirigeant conteste. On ouvre l'`Historique` : on y voit bien les deux versions du
score, à deux heures d'intervalle. **On ne peut pas dire qui a fait la seconde.** Il n'y a pas de
mauvaise foi dans cette histoire — juste **aucun moyen de trancher**.

### 4. Ce que je propose

Par ordre de coût croissant. **Je ne recommande PAS de créer des comptes utilisateurs** : ce
serait une transformation profonde, pour un besoin qui n'existe pas encore.

1. **Ajouter une colonne « qui » à l'`Historique`** — pas un compte, juste un **prénom saisi une
   fois** par le marqueur au début de sa session (« Terrain 3 — Julien »), envoyé avec chaque
   score. Ce n'est **pas une sécurité** (rien ne l'empêche de mentir), c'est une **traçabilité de
   bonne foi** — et cela suffit à trancher 99 % des contestations réelles ;
2. **Distinguer une correction d'une saisie dans l'`Historique`**, pour qu'on voie d'un coup
   d'œil les scores réécrits ;
3. **Écrire une procédure de changement de clé** (aujourd'hui il n'en existe aucune) : quand,
   comment, qui prévenir. C'est de la documentation, pas du code ;
4. *(plus tard)* de vrais comptes, le jour où plusieurs clubs utiliseraient l'outil — **P3**.

**Difficulté : faible** pour (1) à (3).

### 5. Impact

- **Ce que cela change** : le marqueur saisit son prénom une fois en ouvrant la page. C'est tout.
- **Risques** : quasi nuls — on **ajoute** une information, on n'en modifie aucune. Attention
  toutefois : un prénom est une **donnée personnelle** ; à signaler au domaine B (RGPD).
- **Bénéfices** : une contestation devient arbitrable.
- **Fonctionnalités concernées** : la saisie des scores, l'`Historique`.

### 6. Ce que je conseille

**Corriger avant la production** pour (1) et (3). Le point (4) — de vrais comptes — est **P3** :
à garder pour le jour où l'outil servirait à plusieurs clubs.

---

## C.6 — R-018 · Les liens envoyés aux clubs sont des passe-partout permanents *(P1)*

### 1. Ce que j'ai trouvé

Chaque club reçoit par courriel **un lien personnel** contenant son numéro secret. Ce lien lui
ouvre son dossier et sa page de réponse.

Ce que ce lien donne à voir, exactement *(constaté dans la vue « club » du serveur)* : l'adresse
précise du tournoi, le parking, les tarifs, le poste de secours, **et les numéros de téléphone du
référent et du responsable sécurité** — les contacts du jour J.

Quatre constats sur ce lien :

- **il n'expire jamais.** Aucune date de validité. Il reste valable tant que personne ne le
  régénère à la main ou ne réinitialise le tournoi ;
- **il voyage dans l'adresse de la page** (`?club=…&token=…`). Il se retrouve donc dans
  l'historique du navigateur, dans les copier-coller, et dans les journaux de Google ;
- **un courriel se transfère.** Il suffit qu'un contact de club fasse suivre le message à son
  équipe, ou qu'il utilise une boîte partagée, pour que le lien circule ;
- **il n'y a aucun moyen de savoir s'il a fuité** : aucune trace de qui l'utilise.

*(CERTAIN — `trouverClubParToken`, `getConfigClub`, `lireConfigPublique(…, 'club')`.)*

**Deux points rassurants, à ne pas perdre de vue** : le lien d'un club **n'ouvre que sa propre
fiche** (jamais celle d'un autre), et il **ne révèle jamais l'adresse email d'un club** — j'ai
vérifié les trois fonctions concernées. Le cloisonnement entre clubs est correct.

### 2. Pourquoi c'est important

Ce lien est **un mot de passe déguisé en adresse web**. Or on ne traite pas une adresse web comme
un mot de passe : on la colle dans un message, on la partage, on la garde dans ses favoris.

**Aujourd'hui, cela n'a aucune conséquence** : les seuls contacts en base sont ceux de Romain et
de son épouse (I-03, I-04). **Le jour de la première invitation réelle**, ce lien donnera accès
aux numéros de téléphone des responsables du tournoi, à toute personne l'ayant reçu de seconde
main — et pour toujours.

### 3. Exemple concret

Le club de Meudon reçoit son invitation sur une boîte partagée `contact@…`. Le lien est transféré
à quatre personnes pour organiser le déplacement, puis oublié dans une conversation.

Trois ans plus tard, une de ces personnes n'a plus rien à voir avec le club. Elle retrouve le
message, clique par curiosité. **Le lien fonctionne encore** — et lui affiche le numéro de
portable du responsable sécurité.

Personne n'a rien fait de mal. Le lien n'a simplement jamais cessé d'être valable.

### 4. Ce que je propose

1. **Faire expirer les liens** — au minimum, les périmer automatiquement **après le tournoi**. Le
   code sait déjà comparer la date du jour à la date du tournoi (c'est le mécanisme du gel à
   J-16) : il y a là un outil réutilisable ;
2. **Réduire ce que le lien donne à voir après le tournoi** : les numéros du jour J n'ont plus
   d'utilité le lundi ;
3. **Prévoir un bouton « invalider tous les liens »** — l'équivalent d'un changement de serrure ;
   le code sait déjà régénérer un jeton club par club ;
4. **Expliquer aux clubs, dans le courriel, que ce lien est personnel** et ne doit pas être
   transféré. C'est du texte, et c'est probablement la mesure la plus efficace par euro dépensé.

**Difficulté : faible à moyenne.** (1) et (4) sont simples ; (3) existe presque.

### 5. Impact

- **Ce que cela change** : un club qui rouvrirait son lien longtemps après le tournoi verrait un
  message « lien expiré » au lieu de son dossier.
- **Risques** : **réels et à surveiller.** Si l'expiration était mal calculée, des clubs
  perdraient l'accès à leur dossier **avant** le tournoi — ce qui serait bien pire que le
  problème. À tester en priorité ; c'est la principale raison de ne pas bâcler cette correction.
- **Bénéfices** : un lien qui traîne cesse d'être une porte ouverte.
- **Fonctionnalités concernées** : dossier club, page de réponse, envoi des invitations.

### 6. Ce que je conseille

**Corriger avant la première invitation réelle.** Ce n'est pas urgent aujourd'hui — il n'y a rien
derrière la porte. C'est indispensable **avant** qu'il y ait quelque chose.

À traiter **avec le domaine B (RGPD)**, qui viendra juste après : c'est le même sujet vu sous deux
angles.

---

## C.7 — Les problèmes P2 (à corriger, mais pas dans l'urgence)

### R-019 · Le garde-fou contre la devinette de mot de passe est global et faible *(P2)*

**Ce qui existe** : au-delà de **30 mauvaises tentatives en 5 minutes**, les mauvaises clés sont
refusées un moment. Une **bonne** clé passe toujours — donc **le marqueur n'est jamais bloqué**,
même si quelqu'un attaque au même instant. C'est bien pensé.

**Trois limites** :

1. le compteur est **global**, pas par personne ni par appareil — Google Apps Script ne fournit
   pas l'adresse du visiteur, donc **on ne peut pas faire mieux simplement** ;
2. une fois le seuil atteint, le compteur **cesse d'être prolongé** : après 5 minutes de calme,
   30 nouvelles tentatives sont possibles. Cela laisse de l'ordre de **8 600 essais par jour** ;
3. le compteur vit dans une mémoire temporaire **non fiable à 100 %** (le code le reconnaît :
   « best-effort ») : des tentatives simultanées peuvent en échapper.

**Ce que cela veut dire concrètement** : 8 600 essais par jour ne cassent **jamais** un mot de
passe tiré au hasard. Ils peuvent casser un mot de passe **choisi par un humain** — `racing92club`
fait bien 12 caractères et se devine en quelques milliers d'essais.

### ⚠️ Requalifié **P2 → P1** le 2026-08-04 — I-12 est levée, et la réponse est la mauvaise

Romain : *« pour les MDP c'est moi qui ai choisi ce sont des mots »*.

Le raisonnement bascule donc du côté défavorable. Trois éléments qui se combinent :

1. **la porte est trouvable** — l'adresse du serveur est publiquement lisible dans le code du
   site, et l'écran d'administration est en ligne (R-022) ;
2. **le débit toléré est de l'ordre de 8 600 essais par jour**, sans alerte ni notification ;
3. **des mots se devinent.** Un dictionnaire français courant tient en quelques dizaines de
   milliers d'entrées ; les combinaisons de deux mots familiers d'un club de rugby se comptent en
   milliers. Ce n'est plus une hypothèse d'école.

Et ce qu'ouvre la clé ADMIN, c'est **tout** : effacer les scores, réinitialiser le tournoi, lire
le carnet d'adresses complet avec les liens personnels, envoyer des courriels sous l'adresse du
propriétaire.

**Ce que je propose — et ce n'est pas du code** : remplacer les deux clés par des **suites
aléatoires** (24 caractères tirés par un gestionnaire de mots de passe), via le menu
**« Tournoi R92 → Configurer les clés »** du classeur. **Cinq minutes, aucune ligne à écrire**, et
le problème redevient théorique — parce que 8 600 essais par jour contre une suite aléatoire, ce
n'est rien du tout.

**La vraie question n'est donc pas technique, elle est pratique** : une clé aléatoire ne se retient
plus par cœur. Il faut décider **où elle est rangée** et **comment la clé SCORES est transmise aux
bénévoles le jour J**. C'est un changement d'habitude, et c'est le seul point à trancher.
→ **décision D-017**, en attente.

**Amélioration de code utile mais secondaire** : prolonger la fenêtre à chaque tentative, même
refusée. **Difficulté : très faible.** Elle ne remplace pas le changement de clés — elle
diviserait le débit toléré, sans changer la nature du problème.

---

### R-020 · Le contenu des courriels est fabriqué par le navigateur, le serveur ne fait que poster *(P2)*

Le serveur reçoit **l'objet et le corps HTML complets** depuis la page d'administration et les
expédie tels quels, sous l'identité Gmail du propriétaire.

**Le bon côté** — et il est important : **le destinataire est toujours relu dans le classeur**,
jamais fourni par le navigateur. Impossible d'envoyer à une adresse arbitraire.

**Le problème restant** : toute personne disposant de la clé admin peut faire partir, **depuis
une adresse que les clubs reconnaissent**, un message dont elle a écrit chaque mot — par exemple
un faux message d'inscription renvoyant vers un site qu'elle contrôle. Le serveur ne vérifie
rien de ce qui part en son nom.

**Ce que je propose** : construire le squelette du message **côté serveur** (l'en-tête, le pied,
les liens officiels), et ne laisser venir du navigateur que le **texte libre**. Le code sait déjà
faire cela — c'est exactement le mécanisme `{{SALUTATION}}` / `{{LIEN_REPONSE}}` déjà en place.

**Difficulté : moyenne** (il faut déplacer les gabarits). **Bénéfice** : réel mais différé — il
suppose que la clé admin ait fuité.

---

### R-021 · Quatre onglets sortent en entier, sans aucune clé et sans liste blanche *(P2)*

`Equipes`, `Poules`, `Matchs` et `Historique` sont renvoyés **toutes colonnes comprises**, à qui
les demande, **sans mot de passe** — la règle exactement inverse de celle appliquée aux réglages
et aux partenaires.

**Aujourd'hui, rien de personnel n'en sort.** Ce qui s'en rapproche le plus, ce sont les effectifs
(« MASSY-1 est venue avec 12 enfants ») : des nombres, jamais des noms.

**Le problème est dans le futur** : le jour où quelqu'un ajoute une colonne à `Equipes` — un nom
de contact, un téléphone d'entraîneur, une remarque — **elle devient publique sans que personne
l'ait décidé.**

**Ce que je propose** : appliquer à ces quatre onglets la même règle qu'au reste — une liste des
colonnes autorisées. C'est **une trentaine de lignes**, et le modèle existe déjà dans le fichier.

**Difficulté : faible.** **À traiter avec le domaine B**, qui en dépend directement.

---

### R-022 · L'écran d'administration est public et référençable *(P2)*

`admin.html` et `saisie.html` sont publiés sur GitHub Pages comme toutes les autres pages :
**n'importe qui peut les ouvrir**. Elles ne montrent aucune donnée sans la clé — le contrôle est
côté serveur, c'est correct — mais elles sont **accessibles et indexables**.

Le détail qui rend le constat parlant : les trois pages contenant un lien personnel de club, elles,
portent bien la mention « ne pas indexer ». **La réflexion a été faite pour les pages des clubs,
pas pour la page d'administration.**

**Ce que je propose** : ajouter la mention « ne pas indexer » sur `admin.html` et `saisie.html`
(une ligne chacune), et un fichier `robots.txt`. **Ce n'est pas de la sécurité** — cela ne protège
rien — c'est de la **discrétion** : moins la page est trouvée par hasard, moins le mot de passe
partagé est mis à l'épreuve.

**Difficulté : très faible.**

---

### R-023 · Aucune trace de qui accède à quoi *(P2)*

Complément de R-017, côté lecture : le carnet d'adresses des clubs se lit **en une seule demande**,
avec la clé admin — emails **et** liens personnels compris (point C-11 de la cartographie). Le
classeur ne garde **aucune trace** de ces consultations.

Ce que le **journal d'exécution de Google** conserve, et pendant combien de temps, est **INCONNU**
depuis le dépôt (I-09).

**Ce que je propose** : ne pas renvoyer les liens personnels des clubs quand l'écran n'en a pas
besoin (ils ne servent qu'au bouton « copier le lien »), et consigner les lectures du carnet dans
l'`Historique`. **Difficulté : faible** pour le premier, **moyenne** pour le second.

---

### R-024 · Quatre bibliothèques extérieures, sans version, sans origine, sans contrôle *(P2)*

Le dossier `frontend/js/vendor/` contient **quatre fichiers de code écrits par d'autres**
(~750 Ko au total) : `pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`. Ils servent à fabriquer les
documents PDF et Word.

**Le bon côté** : ils sont **hébergés localement**. Aucune page ne charge de programme depuis un
site extérieur — c'est le bon choix, et il évite toute une famille de problèmes.

**Le problème** : **rien n'indique d'où ils viennent ni quelle version c'est.** Ni fichier de
suivi, ni commentaire, ni empreinte de contrôle. Conséquence pratique : **il est impossible de
savoir si une faille publiée un jour concerne ces fichiers.** Personne ne peut répondre à la
question « sommes-nous à jour ? ».

**Ce que je propose** : un simple fichier texte listant, pour chacun, **le nom, la version, la
date et l'adresse d'origine**. Cinq lignes. Cela ne corrige rien, mais cela rend la question
**vérifiable** — c'est le préalable à toute mise à jour.

**Difficulté : très faible** (mais il faudra retrouver les versions, ce qui n'est pas immédiat).

---

### R-025 · Toute la sécurité des données tient à un réglage Google qu'aucun code ne protège *(P2)*

L'identifiant du classeur est **écrit en clair dans le dépôt public**. Ce n'est pas un problème
**tant que le classeur est privé** — et il l'est, Romain l'a vérifié (I-06).

Mais : **rien dans le code ne protège ce réglage.** Un partage fait un jour par commodité
(« je le passe en lien pour envoyer les scores à un collègue ») rendrait **tout le contenu
lisible** par quiconque a lu le dépôt — carnet d'adresses compris.

**Ce que je propose** : ce n'est **pas une correction de code**. C'est (a) une note explicite dans
la documentation de passation, et (b) une **vérification périodique** — deux minutes, à faire
avant chaque tournoi. À inscrire dans la future liste de contrôle d'avant-tournoi.

**Difficulté : nulle côté code.** C'est une habitude à prendre.

---

## C.8 — Les problèmes P3 (à garder pour plus tard)

### R-026 · Aucune politique de sécurité du contenu *(P3)*

Les pages ne déclarent pas ce qu'elles s'autorisent à charger. Si un jour un texte piégé passait
entre les mailles (ce que je n'ai **pas** trouvé aujourd'hui — voir C.1 point 4), rien ne
limiterait les dégâts.

**Pourquoi P3** : c'est une **deuxième ceinture**, utile seulement si la première lâche. Et sa
mise en place demande des essais page par page (les polices Google, les images du Drive et les
appels au serveur doivent rester autorisés) — pour un bénéfice invisible.

À reprendre le jour d'une refonte du frontend.

---

### R-027 · Les briques d'automatisation GitHub sont épinglées par étiquette mobile *(P3)*

La publication automatique du site utilise quatre briques externes désignées par `@v4` / `@v5`.
Ces étiquettes **peuvent être déplacées** par leur auteur : le code exécuté demain ne sera pas
forcément celui d'aujourd'hui.

**Pourquoi P3** : ce sont les briques officielles de GitHub, les droits accordés sont **minimaux
et corrects** (lecture du code, écriture des pages), et le risque est théorique.

À reprendre si le dépôt devenait le socle d'un service pour plusieurs clubs.

---

### Un point renvoyé au domaine B (RGPD), pas classé ici

Chaque page charge ses **polices d'écriture depuis les serveurs de Google**
(`fonts.googleapis.com`). Ce n'est **pas une faille de sécurité** : c'est une requête vers un
tiers à chaque visite, et donc un sujet de **protection des données**. Je le note ici pour qu'il
ne se perde pas, et je le laisse au **domaine B**.

---

## C.9 — Ce que le domaine C ne peut PAS conclure

Par honnêteté sur les limites de cet audit :

- ❌ **Rien n'a été exécuté. Aucune attaque n'a été tentée.** Tous les constats portent sur ce que
  le code **prévoit**. Statut : **NON VÉRIFIÉ** pour tout comportement réel.
- ❌ **Le code réellement en service chez Google n'a pas été vu** → **INCONNU** (I-01). La version
  en ligne peut différer de celle auditée ici. **C'est particulièrement gênant en sécurité** : une
  correction non redéployée ne protège personne.
- ✅ **I-11 est LEVÉE** *(2026-08-04, capture fournie par Romain)* : la Web App s'exécute **au nom
  du propriétaire** et son accès est ouvert à **« Tout le monde »** — donc sans compte Google.
  C'est le réglage **nécessaire** (les spectateurs doivent pouvoir lire les scores) : rien à y
  changer, mais cela confirme que R-014 n'exigeait aucun préalable.
- ✅ **I-12 est LEVÉE** *(2026-08-04)* : **les deux clés sont des mots choisis à la main.**
  R-019 passe donc de **P2 à P1**, et la réponse est une action de Romain, pas du code (D-017).
- ❌ **Les bibliothèques extérieures n'ont pas été analysées** (R-024) : sans version, il n'y a
  rien à comparer à une liste de failles connues.
- ❌ **Aucune certification de sécurité n'est prononcée** — et il n'y en aura jamais
  (`CLAUDE.md` §10). Cet audit dit ce que j'ai trouvé, **pas** qu'il n'y a rien d'autre.
- ✅ **Ce que j'ai réellement vérifié, en revanche** : l'historique Git **complet** (513
  enregistrements, dépôt « dé-tronqué » pour l'occasion) ne contient **aucun mot de passe**.

---

## C.10 — Récapitulatif du domaine C

| Réf | Problème | Priorité | Où ça fait mal | Difficulté de correction |
|---|---|---|---|---|
| **R-014** | La seule porte ouverte sans clé n'a **aucune limite** | **P0** | L'application peut être rendue inutilisable le jour J | ✅ **TESTÉ** et en service (D-016) — 573/573, chaîne vérifiée |
| **R-015** | Regénérer les poules efface les scores, sans garde-fou serveur | **P1** | Perte de tous les scores du matin | **Faible** — le modèle existe à côté |
| **R-016** | La réinitialisation efface tout, sans confirmation serveur ni sauvegarde | **P1** | Perte de toute la préparation d'un tournoi | Faible (confirmation) à moyenne (sauvegarde) |
| **R-017** | Mots de passe partagés : aucune personne, aucune révocation, aucune trace | **P1** | Une contestation de score est inarbitrable | **Faible** (un prénom dans l'`Historique`) |
| **R-018** | Les liens des clubs sont permanents et transférables | **P1** | Téléphones du jour J accessibles pour toujours | Faible à moyenne — **à tester avec soin** |
| **R-019** | Garde-fou anti-devinette global et faible — **et les clés sont des mots** | **P1** *(était P2)* | La clé ADMIN ouvre tout : scores, réinitialisation, carnet d'adresses, courriels | **Nulle côté code** — remplacer les deux clés suffit (D-017) |
| **R-020** | Le contenu des courriels vient du navigateur | P2 | Message trompeur envoyé sous une adresse de confiance | Moyenne |
| **R-021** | Quatre onglets sortent en entier, sans liste blanche | P2 | Une colonne ajoutée demain devient publique | Faible |
| **R-022** | L'écran d'administration est public et référençable | P2 | Le mot de passe partagé est plus exposé | Très faible |
| **R-023** | Aucune trace de qui consulte le carnet d'adresses | P2 | Aucune enquête possible après un incident | Faible à moyenne |
| **R-024** | Quatre bibliothèques sans version ni origine | P2 | Impossible de savoir si une faille nous concerne | Très faible |
| **R-025** | Tout tient à un réglage Google qu'aucun code ne protège | P2 | Tout le classeur deviendrait lisible | Nulle (habitude) |
| **R-026** | Aucune politique de sécurité du contenu | P3 | Rien aujourd'hui | Moyenne (essais) |
| **R-027** | Briques d'automatisation épinglées par étiquette mobile | P3 | Rien aujourd'hui | Très faible |

**Total : 1 P0 · 5 P1 · 6 P2 · 2 P3 — soit 14 problèmes**, après la requalification de R-019.

**État au 2026-08-04, en fin de session 6** : **R-014 est TESTÉ et en service** (D-016).
**R-019 attend une action de Romain**, pas du code (D-017). Les douze autres sont au statut
**IDENTIFIÉ**.

### Le fil rouge du domaine C

**Le domaine A avait le sien** : l'application est excellente **avant** le coup d'envoi et rigide
**après**.

**Celui du domaine C tient en deux phrases** :

1. **Il n'y a pas de personnes, seulement des mots de passe.** Sept des quatorze problèmes en
   découlent : pas de retrait d'accès, pas de trace, pas d'arbitrage, pas d'enquête.
2. **Les protections les plus importantes sont au bon endroit — sauf les trois plus
   destructrices.** Le gel des réponses, le refus de réorganiser les poules, la revalidation des
   relevés : tenus par le serveur. Effacer les scores, tout réinitialiser, limiter la porte
   ouverte : **tenus par personne, ou par la seule page web**.

### Si je devais ne corriger que trois choses

1. ✅ **R-014** (mettre une limite sur la porte ouverte) — **fait, déployé et vérifié** (D-016) ;
2. ⏳ **R-019 / D-017** (remplacer les deux clés par des suites aléatoires) — **c'est désormais
   la première chose à faire, et elle ne demande aucun code** : cinq minutes dans le menu du
   classeur. Elle est passée devant les deux suivantes le jour où on a appris que les clés
   étaient des mots ;
3. **R-015 + R-016** ensemble (les deux gestes destructeurs, protégés côté serveur) — même
   famille, même correction, et ils protègent contre l'erreur humaine bien plus que contre une
   attaque. C'est le meilleur rapport bénéfice/risque de ce qui reste.

**R-017 point (1)** (un prénom dans l'`Historique`) vient juste après : quelques lignes, et une
contestation de score devient arbitrable.

**R-018 (les liens des clubs) vient juste après**, mais avec une consigne : **le traiter avec le
domaine B, et le tester sérieusement.** Une expiration mal calculée couperait l'accès aux clubs
*avant* le tournoi — un remède pire que le mal.

---

# DOMAINE B — RGPD / PROTECTION DES DONNÉES

> **La question posée** : quelles informations sur des **personnes** cette application recueille,
> garde, montre et envoie — et que faudrait-il mettre en place pour que ce soit fait proprement,
> **avant** que de vraies coordonnées y entrent ? **Aucun fichier de l'application n'a été
> modifié.**
>
> ⚠️ **Ce que ce domaine ne fera jamais** (`CLAUDE.md` §6.B) : **prononcer une conformité
> juridique**. Je ne suis pas juriste, et personne ici ne peut dire « l'application est conforme
> au RGPD ». Ce que je peux faire, et ce que je fais ci-dessous : **décrire les risques** et
> **proposer les mesures techniques** qui les réduisent.

**Audité en session 7, le 2026-08-05.**

> 📖 **Un mot de vocabulaire, une fois pour toutes.**
> **RGPD** = *Règlement Général sur la Protection des Données*. C'est la loi européenne qui dit
> ce qu'on a le droit de faire avec les informations concernant des personnes. Son idée tient en
> une phrase : **on ne collecte que ce dont on a besoin, on dit aux gens ce qu'on en fait, et on
> ne les garde pas pour toujours.**
>
> **Donnée personnelle** = toute information qui permet de reconnaître quelqu'un : un nom, un
> email, un téléphone. Un **nombre** (« 12 joueurs ») n'en est pas une : il ne désigne personne.

---

## B.0 — Le verdict en une phrase

**L'application collecte remarquablement peu, et elle protège bien ce qu'elle collecte — mais
elle ne dit rien à personne, et elle ne jette jamais rien.** Le point le plus important d'abord,
parce qu'il est excellent et qu'il n'était pas gagné d'avance : **aucun enfant n'est identifié**.
Pas un nom, pas une date de naissance, pas un numéro de licence. Les mineurs n'existent dans ce
logiciel que sous forme de **nombres**. C'est la meilleure protection qui soit, et c'est un choix
de conception, pas un hasard.

Ce qui manque est d'un autre ordre, et c'est du **cadre**, pas du code : **il n'existe nulle
part, dans aucune page et dans aucun courriel, une seule phrase qui explique aux personnes ce
qu'on fait de leurs informations** — et **rien ne s'efface jamais tout seul**. À quoi s'ajoute
une chose qui, elle, tourne **déjà en production aujourd'hui** : la mesure de visibilité des
partenaires **écrit sur le téléphone de chaque spectateur** et **remonte au serveur** sans que
personne n'en soit informé ni n'ait le choix.

**Aucun problème P0.** Et il faut dire pourquoi, sinon le chiffre ne veut rien dire : un P0
supposerait une **exposition grave** de données personnelles. Or le carnet d'adresses est
**exclu** des données publiques, il exige la clé admin, le classeur est **privé** (I-06), et
surtout — aujourd'hui — **il n'y a aucune donnée de tiers dedans** (I-03, I-04). **Trois
problèmes P1**, tous à régler **avant la première invitation réelle**. C'est exactement la
fenêtre dans laquelle on se trouve.

---

## B.1 — Ce qui est solide (et qu'il ne faut surtout pas casser)

Cette liste n'est pas de la politesse. En protection des données, la plupart des projets amateurs
collectent **tout ce qu'ils peuvent**, « au cas où ». Ici, c'est l'inverse, et c'est visible dans
le code.

1. **Aucun enfant n'est identifié. Nulle part.** Aucune colonne de nom de joueur, de prénom, de
   date de naissance ou de licence dans tout le dépôt. Les mineurs sont **trois nombres** :
   combien par équipe, combien par club, combien d'éducateurs. *(CERTAIN — recherche sur
   l'ensemble du dépôt, confirmée en session 4.)* **C'est la protection la plus forte de toute
   l'application** : ce qu'on ne collecte pas ne peut ni fuiter, ni être réclamé, ni être perdu.
2. **La règle « rien ne sort sauf ce qui est nommé sur une liste »**, appliquée aux réglages et
   aux partenaires, avec **trois listes selon l'interlocuteur** (public / vitrine / club) et la
   plus fermée par défaut. Un réglage ajouté demain est **privé d'office**.
3. **L'email d'un club n'est jamais renvoyé à personne** — pas même au club lui-même. Le code
   l'écrit noir sur blanc.
4. **Un envoi groupé envoie un courriel par club**, jamais un courriel commun. Les clubs ne
   découvrent donc pas les adresses les uns des autres. *(C'est l'erreur la plus banale du monde
   associatif : mettre 40 adresses en copie visible. Elle est évitée ici.)*
5. **Le destinataire d'un courriel est toujours relu dans le classeur**, jamais fourni par le
   navigateur.
6. **Le téléphone du contact d'invitation a été volontairement retiré de la page publique**, avec
   une raison écrite : *« le portable d'un bénévole n'a rien à faire sur une page mise en
   avant »*. C'est exactement le bon réflexe, et il a été pris **spontanément**.
7. **Le carnet d'adresses est doublement protégé** : exclu des données publiques, **et** derrière
   la clé admin — dont la lecture passe volontairement par le chemin d'écriture pour que la clé
   ne traîne pas dans l'historique du navigateur.
8. **Les liens personnels des clubs sont retirés de la barre d'adresse** dès l'ouverture de la
   page, et rangés dans une mémoire vidée à la fermeture de l'onglet. Conséquence directe : ils
   ne partent pas dans une impression, ni dans une capture d'écran.
9. **Aucun cookie, aucun traceur tiers, aucun outil de mesure d'audience extérieur.** Pas de
   Google Analytics, pas de bouton Facebook, rien. *(CERTAIN.)*
10. **Les documents (PDF de la feuille de fin de journée, dossier club) sont fabriqués
    entièrement sur l'appareil**, sans qu'aucune donnée ne parte vers un service extérieur.
11. **Le classeur est privé** (vérifié, I-06) et **le relais Cloudflare est éteint** — et même
    rallumé, il ne recopierait que l'instantané public, qui ne contient aucune donnée personnelle.
12. **La documentation du projet signale déjà la sensibilité du carnet d'adresses**
    (`docs/structure-google-sheet.md` : *« Cet onglet contient des emails de contact »*).

> **À retenir** : la **collecte** est saine et le **cloisonnement** est bon. Ce qui suit ne
> conteste pas cela. Ce qui manque, c'est **le mode d'emploi** : dire aux gens, et savoir jeter.

---

## B.2 — R-028 · Personne n'est jamais informé de rien *(P1)*

### 1. Ce que j'ai trouvé

J'ai cherché dans **toutes** les pages, **tout** le code du serveur et **tous** les modèles de
courriels les mots : *RGPD*, *confidentialité*, *données personnelles*, *mentions légales*,
*CNIL*, *consentement*.

**Résultat : zéro occurrence.** *(CERTAIN.)*

Il n'existe donc, nulle part dans l'application :

- aucune page qui explique **qui** est responsable de ces informations ;
- aucune phrase, dans le courriel d'invitation, qui dise au contact du club **pourquoi** on
  détient son nom, son prénom et son email, ni **combien de temps** ;
- aucune indication, sur la page où le club déclare ses effectifs, de ce que deviennent les
  chiffres qu'il saisit ;
- aucune mention de la façon dont on demande à être retiré du carnet d'adresses.

### 2. Pourquoi c'est important

C'est **l'obligation la plus élémentaire** du RGPD, et c'est aussi la plus facile à constater de
l'extérieur : au moment où on recueille des informations sur quelqu'un, on doit lui dire ce qu'on
en fait. Pas un contrat, pas un texte de juriste : **quelques lignes honnêtes**.

Ce n'est pas une formalité vide. C'est ce qui fait la différence entre *« le Racing garde mon
email »* et *« le Racing garde mon email, je sais pourquoi, et je sais à qui écrire pour qu'il
l'efface »*. Le premier crée de la méfiance ; le second n'en crée aucune.

Et il y a un aspect très concret : le jour où un club invité demandera *« qu'est-ce que vous avez
sur moi ? »*, il n'existe aujourd'hui **aucune réponse écrite** à lui donner. Il faudra
l'improviser.

### 3. Exemple concret

Le référent de Clamart reçoit l'invitation. Il voit son prénom dans la formule de politesse. Il
se demande — légitimement — *« comment ont-ils mon adresse ? »* Réponse réelle : Romain l'a saisie
à la main dans le carnet, parce qu'il l'avait par ailleurs. C'est parfaitement normal et
parfaitement légal. **Mais rien ne le lui dit**, et la seule façon de le savoir est de
téléphoner.

Un an plus tard, ce référent a quitté le club. Son adresse est **toujours** dans le carnet — le
code le dit explicitement : *« c'est un carnet d'adresses réutilisable d'une édition à l'autre »*.
Il recevra l'invitation de l'année suivante. Il n'a jamais été informé, et il n'a jamais eu de
moyen simple de dire non.

### 4. Ce que je propose

**Trois textes courts, écrits une fois, et c'est réglé.** Aucune refonte, aucun juriste.

1. **Un paragraphe dans le courriel d'invitation** (5 à 8 lignes) : qui organise, quelles
   informations sont conservées (nom, prénom, email du contact ; effectifs déclarés), pourquoi
   (organiser le tournoi et inviter les éditions suivantes), combien de temps, et **à quelle
   adresse écrire** pour être retiré ou corrigé.
2. **Le même bloc, en bas de la page de réponse** — l'endroit exact où le club saisit ses
   effectifs.
3. **Une petite page « Vos données » sur le site public**, vers laquelle les deux autres
   pointent. Elle sert aussi aux spectateurs (voir R-029).

### 5. Impact

| | |
|---|---|
| **Ce que ça change dans l'application** | Rien de fonctionnel. Du **texte** ajouté à un modèle de courriel, à une page, et une page nouvelle |
| **Risques** | **Très faibles.** Le seul point d'attention : le courriel d'invitation s'allonge un peu. À placer **en bas**, pas en tête, pour ne pas noyer le message principal |
| **Bénéfices** | L'obligation la plus visible est remplie ; un club qui pose la question a une réponse écrite ; et le jour où l'outil servira plusieurs clubs, la base est déjà là |
| **Fonctionnalités concernées** | Envoi des invitations, page de réponse, site public. **Aucune règle sportive, aucun calcul, aucun score** |

### 6. Ce que je conseille

**À corriger avant la première invitation réelle** — c'est-à-dire **maintenant**, pendant que le
carnet ne contient que ton adresse et celle de ton épouse. Le coût est de **rédiger trois
paragraphes**. Après la première vague d'invitations, il faudra en plus recontacter les gens.

> ⚠️ **Ce que je ne peux pas faire** : rédiger ces textes **à ta place et seul**. Ils engagent
> l'association, pas moi. Je peux en proposer une **première version** que tu relis, corriges et
> fais valider par le club — c'est ce que je recommande, et c'est le sujet de la **décision
> D-018**.

---

## B.3 — R-029 · La mesure des partenaires écrit sur le téléphone des spectateurs, sans le leur dire *(P1)*

### 1. Ce que j'ai trouvé

C'est le seul problème de ce domaine qui **tourne déjà en vrai** : le classeur contient
aujourd'hui **109 relevés réels** remontés par des téléphones de spectateurs.

Voici ce que fait la page publique des scores, en détail *(CERTAIN, `frontend/js/sponsors.js` et
`frontend/js/tournoi.js` ligne 297)* :

1. elle **tire un numéro au hasard** pour l'appareil, et le **range dans la mémoire longue du
   navigateur** — celle qui survit à la fermeture de la page ;
2. elle compte, pour chaque partenaire, **combien de temps son logo a été à l'écran**, combien de
   fois il est apparu, combien de clics il a reçus, **par tranche de 30 minutes** ;
3. elle **envoie tout cela au serveur** : 20 secondes après l'arrivée, puis toutes les 10
   minutes, puis **au moment où on quitte la page** (avec un mécanisme spécial pour que la
   requête parte même si l'onglet se ferme) ;
4. le serveur range chaque relevé dans l'onglet `Mesures`, et **rien ne les efface**.

Il n'y a **aucune information affichée**, **aucun choix proposé**, et **aucun moyen de refuser**.

### 2. Pourquoi c'est important

Il faut être précis ici, parce que c'est le point le plus technique du domaine — et aussi le plus
solide juridiquement.

**La règle française ne parle pas seulement de « données personnelles ».** Elle dit, en substance :
**déposer ou lire quelque chose sur l'appareil de quelqu'un exige son accord**, sauf si c'est
*strictement nécessaire au service qu'il a demandé*.

Or :

- le spectateur a demandé **une chose** : voir les scores ;
- l'identifiant d'appareil et les compteurs d'exposition ne servent **pas** à lui montrer les
  scores. Ils servent à **prouver à un partenaire commercial** combien de personnes ont vu son
  logo et pendant combien de temps.

Ce n'est donc pas « strictement nécessaire au service demandé ». Il existe bien une tolérance
pour la **mesure d'audience** — compter ses visiteurs pour soi —, mais elle est **étroite**, et
le fait que le résultat serve à **rendre des comptes à un tiers commercial** la fragilise
sérieusement.

> **Niveau de certitude, et je pèse mes mots** : le **fonctionnement** est **CERTAIN** (je l'ai
> lu ligne à ligne). L'**appréciation juridique** est **PROBABLE**, pas certaine — et
> conformément à `CLAUDE.md` §6.B, **je ne certifie rien**. Ce que je peux dire sans hésiter :
> c'est **le point de toute l'application qu'un tiers attentif remarquerait en premier**, parce
> qu'il concerne **des milliers de personnes** au lieu de quelques dizaines de contacts de clubs.

### 3. Exemple concret

Un parent est au bord du terrain, il ouvre la page des scores sur son téléphone pour suivre la
poule de son fils. Sans qu'aucun message n'apparaisse :

- un numéro est écrit dans la mémoire de son navigateur ;
- pendant les 3 heures de la journée, chaque fois qu'un logo de partenaire est à l'écran, le
  temps est compté ;
- une quinzaine de relevés partent vers le classeur ;
- à la fin, la fiche de visibilité annonce au partenaire : *« 312 appareils, 41 minutes
  d'exposition moyenne »*.

Rien de tout cela n'est malveillant — c'est même **très bien fait techniquement** : identifiants
aléatoires, remis à zéro chaque jour, aucun suivi d'un site à l'autre, tout revalidé par le
serveur. **Le problème n'est pas ce qui est fait. C'est que personne ne l'a dit, et que personne
n'a pu dire non.**

### 4. Ce que je propose

Trois voies possibles. **Je recommande la première** — c'est le sujet de la **décision D-019**.

| | Ce que c'est | Ce qu'on garde | Ce qu'on perd |
|---|---|---|---|
| **(a) Informer, sans bandeau** *(recommandé)* | Une ligne visible en bas de la page publique (« cette page compte l'affichage des logos de nos partenaires — [en savoir plus] »), et l'explication dans la page « Vos données » de R-028. **Plus** un moyen simple de dire non, mémorisé sur l'appareil | Toute la mesure actuelle | Rien de fonctionnel. Reste **PROBABLE** que ce ne soit pas suffisant si l'on considère qu'un accord préalable est requis |
| **(b) Informer + demander l'accord** | Un vrai bandeau au premier chargement : « accepter / refuser ». Sans accord, aucune écriture sur l'appareil et aucun relevé | La position la plus sûre | **Un bandeau devant les scores** — sur un terrain, sous la pluie, en 30 secondes. C'est exactement ce que `CLAUDE.md` §11 interdit de dégrader : *« une amélioration technique qui dégrade l'expérience métier n'est pas une amélioration »*. Et la mesure devient **incomplète** : les refus ne comptent plus |
| **(c) Alléger la mesure** | Supprimer l'identifiant d'appareil rangé dans la mémoire longue ; ne compter que des totaux, sans « portée » (= combien de personnes différentes) | Aucune écriture durable sur l'appareil, donc le sujet se referme presque entièrement | La **portée** — le chiffre qu'un partenaire regarde en premier. C'est perdre l'argument commercial principal |

**Pourquoi (a)** : c'est le seul qui améliore réellement la situation **sans rien casser**. Il
transforme une collecte silencieuse en collecte annoncée, et il donne un moyen de refuser à qui
le demande. (b) protège mieux mais abîme l'usage terrain ; (c) protège mieux encore mais retire
au dispositif partenaires sa valeur.

### 5. Impact

| | |
|---|---|
| **Ce que ça change** | Option (a) : une ligne de texte en bas de la page publique, un interrupteur « ne pas compter » mémorisé sur l'appareil, un paragraphe dans la page « Vos données ». **Aucune modification du serveur** |
| **Risques** | Faibles. Le point d'attention est l'**affichage sur téléphone** : cette ligne ne doit pas pousser les scores vers le bas |
| **Bénéfices** | Le seul traitement qui touche **des milliers de personnes** devient annoncé et refusable. C'est le meilleur rapport effort/risque de tout le domaine B |
| **Fonctionnalités concernées** | Page publique des scores, fiche de visibilité des partenaires. **Aucun score, aucun classement** |

### 6. Ce que je conseille

**À traiter avant le prochain tournoi réel**, et **avant** de présenter la fiche de visibilité à
un partenaire payant. C'est le seul problème de ce domaine qui produit **déjà** des données, tous
les jours, sur de vraies personnes.

> ⚠️ **Précision qui compte** : je ne dis pas d'arrêter la mesure. Elle est **légitime**, elle
> est **bien construite**, et elle sert un besoin réel du club. Je dis qu'elle doit être
> **annoncée**, et qu'on doit pouvoir la refuser.

---

## B.4 — R-030 · Rien ne s'efface jamais, et c'est écrit nulle part *(P1)*

### 1. Ce que j'ai trouvé

**Il n'existe, dans tout le code, aucune durée de conservation, aucune purge automatique, aucune
date d'expiration.** *(CERTAIN — confirmé en session 4, §C.9.)*

Toute suppression est un **geste manuel**. Concrètement :

| Ce qui s'accumule | Ce qui pourrait l'effacer | Automatique ? |
|---|---|---|
| Le **carnet d'adresses** (nom, prénom, email des contacts de clubs) | Suppression d'un club, un par un | ❌ Non — et la réinitialisation le **conserve volontairement** |
| Les **copies de courriels** dans la boîte Gmail | Rien | ❌ Non |
| Les **contacts de la demande d'autorisation FFR** (représentant, président, médecin, secours) | Rien — la réinitialisation ne les touche pas | ❌ Non |
| Les **effectifs déclarés équipe par équipe** des éditions passées | Rien — la réinitialisation les conserve | ❌ Non |
| Les **relevés de visibilité** (`Mesures`) | Un bouton « repartir de zéro », à la main | ❌ Non |
| Le **journal de saison** (`Historique`) | Rien — conservé délibérément | ❌ Non |

### 2. Pourquoi c'est important

C'est le **deuxième pilier** du RGPD, après l'information : on ne garde pas les informations sur
les gens **indéfiniment**. On les garde **le temps qu'il faut**, puis on les supprime.

Et ce n'est pas qu'une question de loi — c'est aussi une question de **risque**. Chaque année qui
passe ajoute des adresses au carnet et n'en retire aucune. Dans cinq ans, il contiendra les
contacts de personnes qui ne sont plus dans leur club depuis longtemps, qui ne s'attendent plus à
recevoir quoi que ce soit, et dont plus personne ne sait pourquoi elles sont là. **Le jour d'une
fuite, ce sont ces adresses-là qui font le plus de dégâts** : les gens ne comprennent pas
pourquoi on les avait encore.

> **L'image** : c'est une armoire à laquelle on ajoute un dossier par an et dont on n'a jamais
> ouvert le tiroir du bas. Le jour où elle prend l'eau, ce qu'on perd, ce n'est pas l'année en
> cours — c'est dix ans d'archives dont personne ne se souvenait.

### 3. Exemple concret

Le référent de Sèvres est saisi dans le carnet en 2026. Il quitte son club en 2027. En 2031,
l'application lui envoie toujours l'invitation annuelle. Il répond, agacé : *« retirez-moi de
votre liste »*. Aujourd'hui, la seule façon de le faire est que **Romain** ouvre l'écran
d'administration, retrouve la ligne, la supprime — et pense en plus à supprimer les copies dans
sa boîte Gmail, sans quoi l'adresse y reste (**C-07**).

Rien de tout cela n'est impossible. Mais **rien de tout cela n'est écrit**, donc rien ne garantit
que ce sera fait, ni par Romain, ni par la personne qui reprendra le tournoi après lui.

### 4. Ce que je propose

**Deux choses, dans cet ordre.**

**a) Écrire les durées.** C'est une décision, pas du code — c'est la **décision D-020**. Une
proposition de départ, à ajuster :

| Donnée | Durée proposée | Pourquoi |
|---|---|---|
| Contacts des clubs (carnet) | **3 éditions**, puis suppression si aucun contact entre-temps | Un club qui n'a pas participé depuis 3 ans n'a plus de lien avec le tournoi |
| Effectifs déclarés d'une édition | **Effacés à la réinitialisation** | Ils ne servent qu'à l'édition en cours (voir R-033) |
| Contacts de la demande FFR | **1 an**, ou à chaque réinitialisation | Ce sont les dirigeants de l'année |
| Relevés de visibilité (`Mesures`) | **Effacés après remise de la fiche au partenaire** | Ils n'ont plus d'usage ensuite |
| Journal de saison (`Historique`) | **Conservé** | Il ne contient **aucune donnée personnelle** — noms d'équipes et scores. Rien à purger |
| Copies de courriels (Gmail) | **1 an** | Nettoyage manuel de la boîte |

**b) Outiller ce qui peut l'être.** Une fois les durées écrites, une partie devient automatisable
— un écran qui signale *« 4 contacts n'ont pas participé depuis 3 éditions : les retirer ? »* est
bien plus efficace qu'une consigne que personne ne relit. **Mais l'outil vient après la
décision**, jamais avant.

### 5. Impact

| | |
|---|---|
| **Ce que ça change** | **Étape (a) : rien du tout dans l'application.** C'est un texte. Étape (b), plus tard : un écran d'administration supplémentaire |
| **Risques** | Le vrai risque est à l'étape (b) : **une purge automatique qui se déclenche toute seule peut effacer ce qu'il ne fallait pas.** D'où ma recommandation ferme : **toute suppression reste déclenchée par un humain**, l'application se contentant de **signaler** ce qui est périmé |
| **Bénéfices** | Le carnet cesse de grossir indéfiniment ; une demande de retrait a une réponse ; et la personne qui reprendra le tournoi trouve une règle écrite |
| **Fonctionnalités concernées** | Carnet d'adresses, réinitialisation, écran Partenaires. **Aucune fonctionnalité sportive** |

### 6. Ce que je conseille

**Écrire les durées maintenant** (étape a) : c'est gratuit, ça ne touche à rien, et c'est le
préalable de tout le reste. **Reporter l'outillage** (étape b) à l'ÉTAPE 3 : il faudra le tester
sérieusement, parce qu'un outil qui efface est le type de code le plus dangereux du projet — le
domaine C l'a déjà montré avec la réinitialisation (R-016).

---

## B.5 — Les problèmes P2 (utiles, non bloquants)

### R-031 · Effacer quelqu'un est possible, mais partiel et parfois bloqué *(P2)*

**Ce que j'ai trouvé.** L'application sait supprimer un club du carnet (`supprimerClubInvite`).
Deux limites, toutes deux constatées dans le code :

1. **La suppression est refusée** si l'une des équipes du club apparaît déjà dans un match — le
   message dit alors de retirer d'abord ces équipes, ou de régénérer le planning. Autrement dit :
   **pendant tout un tournoi, on ne peut pas retirer un contact** sans casser le planning.
2. **Elle ne touche que le classeur.** Les copies des courriels dans Gmail restent (C-07), et il
   n'existe **aucun moyen d'effacer seulement le contact** en gardant le club.

**Pourquoi ça compte.** Le droit d'être effacé est l'un des plus connus, et c'est celui qu'on
vous demandera d'exercer en premier. Aujourd'hui la réponse est *« oui, mais à la main, en
plusieurs endroits, et pas tout de suite »*.

**Ce que je propose.** Séparer deux gestes qui n'ont rien à voir : **retirer un club du tournoi**
(qui touche aux équipes, aux poules, aux matchs — donc légitimement bloquant) et **effacer les
coordonnées d'un contact** (nom, prénom, email), qui ne devrait **jamais** être bloqué par un
planning. Le second est quelques lignes : vider trois cases.

**Difficulté** : faible. **À traiter avec** R-030 (les durées) : même écran, même famille.

---

### R-032 · Les effectifs d'enfants sont publics, et tout ce qu'on ajoutera demain le sera aussi *(P2)*

**Ce que j'ai trouvé.** Les colonnes `nb_joueurs` et `nb_educateurs` de l'onglet `Equipes` sortent
**sans aucune clé** : n'importe qui peut lire *« MASSY-1 : 12 joueurs, 2 éducateurs »*
*(CERTAIN)*. Ce sont des **nombres**, pas des personnes : le risque direct est **très faible**.

**Le vrai sujet est ailleurs**, et il est déjà connu du domaine C sous la référence **R-021** :
ces quatre onglets (`Equipes`, `Poules`, `Matchs`, `Historique`) sont servis **en entier, toutes
colonnes comprises**, sur la règle **inverse** du reste de l'application. Une colonne ajoutée
demain — « nom du capitaine », « téléphone de l'éducateur » — serait publique **sans que personne
ne l'ait décidé**.

**Pourquoi ça compte pour ce domaine.** C'est la différence entre *« aujourd'hui il n'y a rien de
personnel »* et *« il ne peut rien y avoir de personnel »*. Aujourd'hui, seule la première phrase
est vraie. C'est le principe même de **protection dès la conception** : mettre la barrière avant
d'en avoir besoin, pas après.

**Ce que je propose.** Traiter **R-021** (une liste blanche sur ces quatre onglets, comme partout
ailleurs) et considérer R-032 comme réglé du même coup. Sur les effectifs eux-mêmes : les laisser
publics est défendable — un tournoi affiche ses équipes — mais c'est une **décision à prendre**,
pas un état de fait à subir.

**Difficulté** : faible. **À traiter avec R-021.**

---

### R-033 · La réinitialisation garde des choses sans que ce soit expliqué *(P2)*

**Ce que j'ai trouvé** *(CERTAIN, points C-03 et C-04 de la cartographie)*. La réinitialisation
efface beaucoup, et documente ce qu'elle conserve — sauf deux familles :

- **les effectifs déclarés équipe par équipe** (`detail_effectifs`) et le total d'éducateurs
  restent, alors que le total de joueurs, lui, est bien effacé. C'est **incohérent** : soit les
  effectifs d'une édition passée servent encore, soit ils doivent partir — mais pas l'un et
  l'autre ;
- **aucun champ de la demande d'autorisation FFR n'est effacé** : noms, téléphones et emails du
  **représentant**, du **président**, du **médecin** et de l'**antenne de secours** traversent
  toutes les éditions.

**Pourquoi ça compte.** Le second point est le plus sérieux : ce sont des **données personnelles
d'adultes identifiés**, dont un **médecin**, conservées sans limite et sans raison écrite. C'est
peut-être délibéré (mêmes dirigeants d'une année sur l'autre) — mais **ce n'est écrit nulle
part**, alors que les autres conservations, elles, le sont.

**Ce que je propose.** Trancher chaque cas dans D-020, puis aligner le code sur la décision. Ma
recommandation : effacer `detail_effectifs` avec le reste de l'édition, et remettre à zéro les
contacts FFR à chaque réinitialisation — les redemander une fois par an coûte cinq minutes et
garantit qu'ils sont **à jour**, ce qui compte pour un contact de secours.

**Difficulté** : très faible (quelques lignes dans la fonction de réinitialisation).

---

### R-034 · Un champ libre invite à saisir les noms et dates de naissance d'enfants *(P2 — deviendrait P1 s'il servait)*

**Ce que j'ai trouvé** *(CERTAIN, `Code.gs` ligne 2490)*. Un champ, et un seul, invite
explicitement à saisir des identités de mineurs :

> **« Liste des équipes étrangères (noms, prénoms, dates de naissance) »**

Il n'apparaît que si l'organisateur répond « oui » à *« équipes étrangères »*, il est protégé par
la clé admin, il ne sort jamais en public — et son contenu part dans le **PDF de la demande
d'autorisation**, fabriqué sur l'ordinateur de l'organisateur puis téléchargé.

**Pourquoi ça compte.** C'est le **seul endroit de toute l'application** où des enfants peuvent
cesser d'être des nombres pour devenir des personnes nommées. Or ce champ n'a **aucun** des
garde-fous du reste : pas de durée de conservation, pas d'effacement à la réinitialisation,
aucune information des familles, et un fichier qui atterrit dans un dossier « Téléchargements ».

**Pourquoi P2 et pas P1.** Parce que ce champ n'existe à l'écran **que** si l'organisateur
répond « oui », et qu'un tournoi d'École de Rugby départemental n'accueille pas d'équipes
étrangères. **Aujourd'hui il est vide et le restera.** Mais si la réponse devient « oui » un
jour, ce problème passe **immédiatement en P1** : ce sont les données les plus sensibles que
l'application puisse contenir.

**Ce que je propose.** Trois lignes de travail, dans l'ordre de coût croissant :

1. **une phrase d'avertissement sous le champ** : *« ces informations sont exigées par le
   formulaire fédéral ; elles sont effacées après l'envoi du dossier »* ;
2. **l'effacer à la réinitialisation**, avec les autres champs FFR (R-033) ;
3. **vérifier ce que la FFR exige réellement** — si le formulaire accepte une liste jointe
   séparément, ce champ n'a pas à vivre dans le classeur. → **question sortante**, chantier FFR
   (D-003), au même titre que I-10.

**Difficulté** : très faible pour (1) et (2).

---

### R-035 · Toute image déposée devient publique, et ne disparaît pas vraiment *(P2)*

**Ce que j'ai trouvé** *(CERTAIN)*. L'affiche du tournoi, les logos des partenaires et **la photo
du parking** sont déposés sur le Drive puis **explicitement rendus publics en lecture** (« toute
personne disposant du lien »). C'est **nécessaire** : sans cela, ni la page publique ni les
courriels ne peuvent les afficher.

Deux conséquences, dont une déjà notée en session 4 :

- **la suppression met à la corbeille**, elle ne détruit pas : Google vide la corbeille ~30 jours
  plus tard. Ce qu'un lien déjà diffusé donne encore à voir pendant ce délai est **INCONNU**
  (I-08) ;
- **rien ne contrôle ce que montre l'image.** Une photo de parking prise sur place peut contenir
  des **plaques d'immatriculation**, des visages, l'entrée d'une maison voisine. Le code vérifie
  le **format** et le **poids** du fichier — jamais son contenu, et c'est normal : aucun
  programme ne sait faire cela de façon fiable.

**Ce que je propose.** Une **phrase sous le bouton de dépôt** : *« cette image sera publique.
Vérifie qu'on n'y voit ni visage, ni plaque d'immatriculation. »* C'est le meilleur rapport
effort/bénéfice du domaine : **une ligne de texte**, au moment exact où la décision se prend.
Et pour I-08, un test réel de 5 minutes (mettre une image à la corbeille, rouvrir son lien depuis
une navigation privée) lèvera l'inconnue une fois pour toutes.

**Difficulté** : très faible.

---

### R-036 · Le droit à l'image n'est plus outillé, et rien ne dit ce qui l'a remplacé *(P2)*

**Ce que j'ai trouvé** *(CERTAIN)*. Le dépôt contient un modèle de document
`frontend/assets/autorisation-droit-image-template.docx` — une **autorisation de droit à l'image**
bien écrite, qui couvre les photos et vidéos des joueurs, leur usage (site, Instagram, affiches),
l'absence de cession à un tiers, le consentement des familles recueilli par le club, et le droit
de retrait.

**Plus rien ne l'utilise.** Le `CHANGELOG` est explicite : le 2026-08-03, *« sur décision du
club »*, le bouton a été retiré du dossier, avec la mécanique qui allait avec. Le modèle et les
deux bibliothèques nécessaires **restent dans le dépôt**, chargés par aucune page.

**Pourquoi je le signale quand même.** Parce que **c'est une décision du club, pas un oubli du
code** — et je ne la conteste pas. Mais le domaine B doit dire ce qu'il constate : lors d'un
tournoi d'École de Rugby, **des photos d'enfants seront prises et publiées**, y compris sur
Instagram (l'application connaît déjà le champ `url_instagram`). C'est, de loin, le traitement de
données le plus sensible autour de cet événement — et **l'outil n'en porte plus aucune trace**.

**Ce que je propose.** Rien dans le code. **Une question à poser au club**, et sa réponse à
écrire dans `DECISIONS.md` :

> *« Le droit à l'image des enfants est-il géré ailleurs — par la licence FFR, par un document
> du club, par une consigne aux clubs invités ? Si oui, où est-ce écrit ? Si non, souhaite-t-on
> remettre le bouton ? »*

Tant que la réponse n'est pas connue, c'est un **point INCONNU** (I-15), pas un défaut du code.

**Difficulté** : nulle côté code. C'est une question, pas un chantier.

---

### R-037 · Les polices d'écriture sont chargées chez Google, sur les 7 pages *(P2)*

**Ce que j'ai trouvé** *(CERTAIN)*. Les sept pages de l'application chargent leurs polices
d'écriture depuis `fonts.googleapis.com` et `fonts.gstatic.com`. Conséquence : à chaque
ouverture, le navigateur du visiteur **contacte les serveurs de Google** et leur transmet son
adresse réseau, sans que rien ne le lui dise.

**Pourquoi ça compte — et pourquoi je ne le monte pas plus haut.** Ce point est régulièrement
reproché aux sites français. **Mais soyons honnêtes sur le gain réel** : cette application parle
**déjà** à Google à chaque chargement, puisque le serveur *est* chez Google (Apps Script).
Supprimer les polices distantes ne fait donc pas disparaître Google du parcours du spectateur.
Le gain est **réel mais modeste** ; il est surtout de **cohérence** : le projet héberge déjà
750 Ko de bibliothèques localement, précisément pour ne dépendre de personne.

**Ce que je propose.** Recopier les 3 ou 4 fichiers de polices dans le dépôt et remplacer 7
lignes. **Bénéfice secondaire, et pas le plus petit : la page s'affiche plus vite**, surtout sur
un téléphone en 4G au bord d'un terrain — c'est un sujet qui reviendra au domaine F.

**Difficulté** : très faible. **À traiter avec le domaine F (performance)**, pas seul.

---

### R-038 · L'adresse d'un bénévole est lisible par n'importe quel programme *(P2)*

**Ce que j'ai trouvé** *(CERTAIN)*. Les champs `contact_reponse_nom` et `contact_reponse_email`
font partie de la liste blanche **publique** : ils sortent par une simple lecture sans clé, et
s'affichent sur la page d'invitation sous forme de lien cliquable.

C'est **volontaire et nécessaire** : un club doit pouvoir répondre. Et le travail déjà fait est
bon — le **téléphone**, lui, a été délibérément retiré de cette liste.

**Le point d'attention** : cette adresse n'est pas seulement *affichée*, elle est **servie en
clair par le serveur à qui la demande**, sous une forme qu'un programme lit sans effort. La page
porte bien « ne pas indexer », ce qui la protège des moteurs de recherche — mais pas d'un
aspirateur d'adresses. **Résultat probable : du spam**, sur ce qui est le plus souvent l'adresse
personnelle d'un bénévole.

**Ce que je propose.** Pas de code : une **habitude**. Utiliser à cet endroit une **adresse de
fonction** (`tournoi@…`, `contact@…`) plutôt que l'adresse personnelle de quelqu'un. Elle se
transmet au bénévole suivant, elle se filtre, et elle se ferme. Si l'association n'en a pas, une
redirection suffit.

**Difficulté** : nulle côté code.

---

### R-039 · Il n'existe aucun cadre écrit : ni responsable, ni registre, ni conduite à tenir *(P2)*

**Ce que j'ai trouvé** *(CERTAIN pour ce qui est du dépôt)*. Aucun document du projet ne dit :

- **qui est responsable** de ces informations. L'association Génération R92 ? Le Racing 92 ?
  Romain à titre personnel ? Le classeur, le Drive et la boîte d'envoi vivent aujourd'hui dans
  **un compte Google individuel** ;
- **quels traitements existent** — la liste de ce qu'on collecte, pourquoi, et pour combien de
  temps. C'est ce qu'on appelle un **registre** : une simple feuille, obligatoire même pour une
  petite association, mais surtout **utile** : c'est le document que la cartographie a déjà
  presque entièrement écrit (volet C) ;
- **ce qu'on fait si les données fuitent.** Le RGPD impose de signaler une fuite grave **sous
  72 heures**. Or l'application ne garde **aucune trace** des accès (c'est **R-023**), donc on ne
  saurait probablement même pas qu'il s'est passé quelque chose.

**Pourquoi ça compte.** Le point le plus concret n'est pas le registre : c'est le **compte
individuel**. Si ce compte est perdu, bloqué, ou si Romain cesse un jour d'organiser le tournoi,
**l'association perd d'un coup son carnet d'adresses, ses images et son historique** — et
personne d'autre ne peut y accéder. Ce n'est pas seulement un sujet RGPD : c'est un sujet de
**continuité**.

**Ce que je propose.**

1. **Écrire qui est responsable** — une phrase dans `DECISIONS.md`, et la même dans les textes de
   R-028 ;
2. **Fabriquer le registre à partir du volet C de la cartographie** — le travail est déjà fait à
   90 %, il ne reste qu'à le mettre en forme ;
3. **Poser la question du compte** : le classeur doit-il rester dans un compte individuel ? Un
   compte au nom de l'association, avec un second administrateur, règle à la fois la continuité
   et la question du responsable.

**Difficulté** : nulle côté code — c'est du document et de l'organisation.

---

## B.6 — Le problème P3 (à garder pour plus tard)

### R-040 · Le jour où l'outil servira plusieurs clubs, le sujet change de nature *(P3)*

**Ce que j'ai trouvé.** `ETAT.md` fixe comme horizon un outil « capable d'évoluer vers un
véritable SaaS » — un logiciel loué en ligne à plusieurs clubs. Aujourd'hui, l'application
héberge les données **d'un seul organisateur**, dans **son** classeur. Tout ce domaine B a été
écrit dans ce cadre.

**Pourquoi ça change tout.** Le jour où le club de Massy saisit ses contacts dans une application
tenue par Génération R92, ce n'est plus la même situation : Génération R92 devient un
**prestataire** qui traite les données **de quelqu'un d'autre**. Cela implique un **contrat
écrit** entre les deux, un **cloisonnement étanche** entre les clubs, et des engagements sur la
sécurité et la restitution des données.

**Ce que je propose.** **Rien maintenant** — c'est précisément la définition d'un P3. Mais deux
choix d'aujourd'hui pèseront lourd ce jour-là, et il faut les avoir en tête :

- **le cloisonnement par mot de passe partagé** (R-017) ne tient pas à plusieurs clubs : il
  faudra de vrais comptes ;
- **le carnet d'adresses unique** devra être découpé par club.

**Ne rien implémenter maintenant.** Le noter suffit.

---

## B.7 — Les trois décisions qui t'attendent

Le domaine B ne se corrige pas d'abord avec du code : il se corrige avec **trois décisions**.
Elles sont détaillées dans `DECISIONS.md` et **aucune n'est prise** à ce stade.

| Réf | La question, en une phrase | Ce que ça débloque |
|---|---|---|
| **D-018** | **Que dit-on aux gens ?** Valides-tu que je rédige une première version des trois textes d'information, que tu relis et fais valider par le club ? | R-028 |
| **D-019** | **Que fait-on de la mesure des partenaires ?** Informer seulement (recommandé), demander l'accord, ou alléger la mesure ? | R-029 |
| **D-020** | **Combien de temps garde-t-on quoi ?** Valider (ou corriger) le tableau des durées proposé en B.4 | R-030, R-031, R-033, R-034 |

> Aucune de ces trois décisions ne demande d'écrire une ligne de code. Toutes les trois **doivent
> être prises avant la première invitation réelle** — après, il faudra en plus revenir vers des
> gens à qui on aura déjà écrit.

---

## B.8 — Ce que le domaine B ne peut PAS conclure

La règle de transparence (`CLAUDE.md` §9) impose de dire ce que cet audit **ne prouve pas**.

- ❌ **Aucune conformité n'est prononcée, et il n'y en aura jamais.** `CLAUDE.md` §6.B l'interdit
  explicitement, et c'est une bonne règle : je n'ai pas la compétence juridique pour cela. Ce
  document dit **ce que j'ai trouvé** et **ce que je propose** — pas que le reste est en ordre.
- ❌ **Je n'ai pas lu le contenu réel du classeur.** Je décris ce que le **code** est capable
  d'écrire. Ce qui s'y trouve réellement à cet instant ne peut pas être vu depuis le dépôt.
  *(Ce qu'on sait vient de toi : I-03 et I-04.)*
- ❌ **Je n'ai rien exécuté.** Que l'email d'un club ne sorte jamais est **écrit dans le code** —
  ce n'est pas **prouvé par un test**. Statut : **NON VÉRIFIÉ**. Le domaine D (tests) devra
  fabriquer cette preuve.
- ❌ **Je ne sais pas ce que Google conserve** : journaux d'exécution, corbeille du Drive,
  sauvegardes internes. **INCONNU** (I-09, I-08).
- ❌ **Je ne sais pas si le code en service chez Google est celui du dépôt.** **INCONNU** (I-01).
- ❌ **Je n'ai pas audité le site vitrine** `boutique-r92` : c'est un autre dépôt (D-005, en
  attente). Or c'est **lui** qui accueillerait naturellement la page « Vos données » de R-028.
- ✅ **Ce que j'ai réellement vérifié, en revanche** : qu'aucune page, aucun modèle de courriel et
  aucune ligne du serveur ne contient les mots *RGPD*, *confidentialité*, *données personnelles*,
  *mentions légales* ou *consentement*. **Zéro occurrence** — c'est le constat le plus solide de
  ce domaine.

---

## B.9 — Récapitulatif du domaine B

| Réf | Problème | Priorité | Où ça fait mal | Difficulté de correction |
|---|---|---|---|---|
| **R-028** | Personne n'est jamais informé de rien | **P1** | Obligation la plus élémentaire, et la plus visible de l'extérieur | **Nulle côté code** — trois textes à écrire |
| **R-029** | La mesure des partenaires écrit sur le téléphone des spectateurs, sans le dire | **P1** | Le seul traitement qui touche **des milliers de personnes**, et il tourne **déjà** | Faible (option recommandée) |
| **R-030** | Aucune durée de conservation, aucune purge | **P1** | Le carnet grossit sans fin ; une fuite ferait bien plus de dégâts | **Nulle** pour décider · moyenne pour outiller |
| **R-031** | Effacer quelqu'un est partiel, et parfois bloqué par le planning | P2 | Une demande d'effacement n'a pas de réponse simple | Faible |
| **R-032** | Effectifs d'enfants publics, et tout ajout futur le sera aussi | P2 | Rien aujourd'hui ; une colonne demain | Faible — **c'est R-021** |
| **R-033** | La réinitialisation conserve des contacts sans raison écrite | P2 | Médecin, président, secours conservés sans limite | Très faible |
| **R-034** | Un champ libre invite à saisir noms et dates de naissance d'enfants | P2 → **P1 s'il sert** | Les données les plus sensibles de l'application | Très faible |
| **R-035** | Toute image déposée devient publique et ne disparaît pas vraiment | P2 | Plaques, visages sur une photo de parking | Très faible (une phrase) |
| **R-036** | Le droit à l'image n'est plus outillé, et rien ne dit ce qui l'a remplacé | P2 | Photos d'enfants sur Instagram | **Nulle** — c'est une question au club |
| **R-037** | Les polices sont chargées chez Google sur les 7 pages | P2 | Reproche classique ; gain réel mais modeste | Très faible |
| **R-038** | L'adresse d'un bénévole est servie en clair à qui la demande | P2 | Spam sur une adresse personnelle | **Nulle** — une habitude |
| **R-039** | Aucun cadre écrit : ni responsable, ni registre, ni conduite à tenir | P2 | Le compte individuel : continuité **et** responsabilité | Nulle côté code |
| **R-040** | Le multi-clubs changera la nature du sujet | P3 | Rien aujourd'hui | À ne pas traiter maintenant |

**Total : 0 P0 · 3 P1 · 9 P2 · 1 P3 — soit 13 problèmes.**

### Le fil rouge du domaine B

Le domaine A avait le sien : excellent **avant** le coup d'envoi, rigide **après**.
Le domaine C avait le sien : il n'y a **pas de personnes, seulement des mots de passe**.

**Celui du domaine B tient en deux phrases :**

1. **La collecte est exemplaire ; le silence ne l'est pas.** L'application ne demande presque
   rien, et n'identifie **aucun enfant**. Mais elle ne dit **rien à personne** — ni au contact
   d'un club, ni au spectateur dont le téléphone compte des logos.
2. **Rien ne s'efface, et personne ne l'a décidé.** L'absence de durée de conservation n'est pas
   un choix contestable : c'est un **choix qui n'a jamais été fait**. Neuf des treize problèmes
   disparaissent le jour où ces durées sont écrites.

### Si je devais ne corriger que trois choses

1. **R-029 — la mesure des partenaires.** Parce que c'est le **seul** qui produit déjà, tous les
   jours, des données sur des milliers de vraies personnes. Les douze autres sont pour l'instant
   théoriques ; celui-là ne l'est pas.
2. **R-028 — les trois textes d'information.** Parce que c'est **gratuit**, que ça ne touche
   aucun code, et que c'est la première chose qu'un tiers regarde.
3. **R-030 — écrire les durées de conservation** (étape a seulement, pas l'outillage). Parce que
   c'est le préalable de R-031, R-033 et R-034 : quatre problèmes que cette seule décision met en
   ordre de marche.

**Les trois tiennent en un après-midi d'écriture et zéro ligne de code**, et ils referment le
domaine B pour l'essentiel. **La condition est le calendrier** : ils doivent être faits **avant
la première invitation réelle**, pendant que le classeur est encore vide de données de tiers.
C'est la fenêtre décrite par I-03 et I-04, et elle ne se rouvrira pas.
