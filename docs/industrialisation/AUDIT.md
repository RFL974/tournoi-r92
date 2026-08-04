# AUDIT — Tournoi R92

> **À quoi sert ce document ?**
> C'est l'**ÉTAPE 2** du plan (`CLAUDE.md` §7) : chercher ce qui ne va pas, domaine par domaine,
> et le classer P0 / P1 / P2 / P3. **Aucun fichier de l'application n'est modifié ici.**
>
> Le registre des problèmes (avec leur statut de correction) vit dans `RISQUES.md`.
> Ce document-ci **explique** ; `RISQUES.md` **suit**.

**Dernière mise à jour** : 2026-08-04 (session 5, close)

| Domaine | Nom | Statut |
|---|---|---|
| **A** | **Métier / Product Owner** | ✅ **FAIT** (session 5) |
| C | Sécurité | ⬜ À faire |
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
