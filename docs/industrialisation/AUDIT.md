# AUDIT — Tournoi R92

> **À quoi sert ce document ?**
> C'est l'**ÉTAPE 2** du plan (`CLAUDE.md` §7) : chercher ce qui ne va pas, domaine par domaine,
> et le classer P0 / P1 / P2 / P3. **Aucun fichier de l'application n'est modifié ici.**
>
> Le registre des problèmes (avec leur statut de correction) vit dans `RISQUES.md`.
> Ce document-ci **explique** ; `RISQUES.md` **suit**.

**Dernière mise à jour** : 2026-08-04 (session 6, close)

| Domaine | Nom | Statut |
|---|---|---|
| **A** | **Métier / Product Owner** | ✅ **FAIT** (session 5) |
| **C** | **Sécurité** | ✅ **FAIT** (session 6) |
| B | RGPD / Protection des données | ⬜ À faire |
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

**Ce que je propose** : (a) prolonger la fenêtre à chaque tentative, même refusée ; (b) **et
surtout** vérifier que les deux clés actuelles sont bien des suites aléatoires, pas des mots.
Si elles le sont, ce problème devient théorique. → **question I-12 ci-dessous.**

**Difficulté : très faible.**

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
- ❌ **Les réglages de publication de la Web App n'ont pas été vus** → nouvelle inconnue **I-11**.
- ❌ **La force réelle des deux mots de passe est inconnue** → nouvelle inconnue **I-12**. C'est
  la donnée qui décide si R-019 est théorique ou sérieux.
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
| **R-014** | La seule porte ouverte sans clé n'a **aucune limite** | **P0** | L'application peut être rendue inutilisable le jour J | **Faible** — le mécanisme existe déjà |
| **R-015** | Regénérer les poules efface les scores, sans garde-fou serveur | **P1** | Perte de tous les scores du matin | **Faible** — le modèle existe à côté |
| **R-016** | La réinitialisation efface tout, sans confirmation serveur ni sauvegarde | **P1** | Perte de toute la préparation d'un tournoi | Faible (confirmation) à moyenne (sauvegarde) |
| **R-017** | Mots de passe partagés : aucune personne, aucune révocation, aucune trace | **P1** | Une contestation de score est inarbitrable | **Faible** (un prénom dans l'`Historique`) |
| **R-018** | Les liens des clubs sont permanents et transférables | **P1** | Téléphones du jour J accessibles pour toujours | Faible à moyenne — **à tester avec soin** |
| **R-019** | Garde-fou anti-devinette global et faible | P2 | Dépend entièrement de la force du mot de passe | Très faible |
| **R-020** | Le contenu des courriels vient du navigateur | P2 | Message trompeur envoyé sous une adresse de confiance | Moyenne |
| **R-021** | Quatre onglets sortent en entier, sans liste blanche | P2 | Une colonne ajoutée demain devient publique | Faible |
| **R-022** | L'écran d'administration est public et référençable | P2 | Le mot de passe partagé est plus exposé | Très faible |
| **R-023** | Aucune trace de qui consulte le carnet d'adresses | P2 | Aucune enquête possible après un incident | Faible à moyenne |
| **R-024** | Quatre bibliothèques sans version ni origine | P2 | Impossible de savoir si une faille nous concerne | Très faible |
| **R-025** | Tout tient à un réglage Google qu'aucun code ne protège | P2 | Tout le classeur deviendrait lisible | Nulle (habitude) |
| **R-026** | Aucune politique de sécurité du contenu | P3 | Rien aujourd'hui | Moyenne (essais) |
| **R-027** | Briques d'automatisation épinglées par étiquette mobile | P3 | Rien aujourd'hui | Très faible |

**Total : 1 P0 · 4 P1 · 7 P2 · 2 P3 — soit 14 problèmes.**

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

1. **R-014** (mettre une limite sur la porte ouverte) — **c'est le seul point que je traiterais
   en avance**, hors de l'ordre normal du chantier. Peu de travail, aucun risque pour le métier,
   et c'est la seule faiblesse exploitable sans rien connaître ;
2. **R-015 + R-016** ensemble (les deux gestes destructeurs, protégés côté serveur) — même
   famille, même correction, et ils protègent contre l'erreur humaine bien plus que contre une
   attaque. C'est le meilleur rapport bénéfice/risque de tout l'audit ;
3. **R-017 point (1)** (un prénom dans l'`Historique`) — quelques lignes, et une contestation de
   score devient arbitrable.

**R-018 (les liens des clubs) vient juste après**, mais avec une consigne : **le traiter avec le
domaine B, et le tester sérieusement.** Une expiration mal calculée couperait l'accès aux clubs
*avant* le tournoi — un remède pire que le mal.

---
