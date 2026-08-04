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
| **A** | **Métier / Product Owner** | ✅ **FAIT** (session 5) — 0 P0 · 5 P1 · 7 P2 · 1 P3 |
| **C** | **Sécurité** | ✅ **FAIT** (session 6) — 0 P0 · 3 P1 · 6 P2 · 3 P3 |
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

> **La question posée** : qui peut faire quoi dans cette application, et qu'est-ce qu'une personne
> mal intentionnée pourrait obtenir ou abîmer ?
>
> **Ce que ce domaine ne traite pas** : la protection des données personnelles en tant que telle
> (durées de conservation, droit à l'effacement, information des personnes). C'est le **domaine B**,
> prévu juste après. Ici on parle de **serrures**, pas de vie privée.

**Méthode** : lecture du code, sans rien exécuter, sans aucun test d'intrusion. Chaque constat est
marqué **CERTAIN** (constaté dans le code), **PROBABLE** (déduit) ou **INCONNU**.

**Ce qui a été lu** : `backend/Code.gs` (les deux portes d'entrée `doGet` et `doPost`, le contrôle
des clés, les jetons des clubs, les envois de courriels, les dépôts d'images, la réinitialisation),
les 26 fichiers de `frontend/js/` (la façon dont la clé est demandée, stockée et envoyée ; la façon
dont les textes sont insérés dans les pages), les 8 pages HTML, `cloudflare/worker-tournoi.js`,
`.gitignore`, `.github/workflows/pages.yml`, et **l'intégralité de l'historique Git** à la recherche
d'un secret qui aurait été publié par accident.

---

## C.0 — Le verdict en une phrase

**Les serrures sont bonnes ; ce sont les clés qui posent problème.**

Le code du serveur est, du point de vue de la sécurité, **nettement meilleur que la moyenne de ce
qu'on trouve dans une application construite ainsi**. Il applique des principes que beaucoup de
professionnels oublient : ne jamais croire le navigateur sur parole, ne laisser sortir que ce qui
est explicitement autorisé, refuser côté serveur ce qui compte vraiment. Ce n'est pas de la chance :
les commentaires du code montrent que ces choix ont été **pensés**.

Le problème n'est pas là. Il est dans **le modèle d'accès lui-même** : toute l'application repose
sur **deux mots de passe partagés**, sans notion de personne, sans expiration, sans possibilité de
retirer l'accès à quelqu'un en particulier, et **sans aucune trace** de qui a fait quoi. Le jour du
tournoi, la clé des scores sera dans les mains de dix bénévoles. Elle n'en sortira jamais.

**Aucun problème classé P0.** **Trois problèmes P1**, six P2, trois P3.

Et un fait de contexte qu'il faut avoir en tête pour tout lire : **le dépôt GitHub est public**
(vérifié le 2026-08-04). Le code source, l'adresse du serveur, la liste exacte des 65 actions et
l'adresse de la page d'administration sont donc **connus de tout le monde**. Ce n'est pas
anormal — la sécurité d'un logiciel ne doit jamais reposer sur le secret de son code — mais cela
signifie qu'**il ne reste que les clés comme barrière**.

---

## C.1 — Ce qui est solide (et qu'il ne faut surtout pas casser)

La règle de vérité marche dans les deux sens. Voici ce que l'audit a trouvé de **réellement bien
fait**, et qu'aucune correction future ne doit dégrader. Cette liste n'est pas de la politesse :
plusieurs de ces points sont exactement ce qui empêche aujourd'hui les problèmes graves.

| Ce qui est bien fait | Pourquoi ça compte |
|---|---|
| **Rien ne sort par défaut** | La configuration du tournoi n'est jamais renvoyée telle quelle : trois « vues » (page des scores, page d'invitation, dossier club) listent **nommément** les champs autorisés. Une colonne ajoutée demain reste **privée** tant que personne ne l'inscrit dans une vue. C'est la bonne règle, et elle est rare |
| **Le carnet d'adresses des clubs ne passe jamais par la porte publique** | L'onglet `ClubsInvites` (emails, jetons) est lu par une action qui **exige la clé admin**, et il est **absent** des données publiques. Le code explique lui-même pourquoi |
| **Les clés ne sont nulle part dans le dépôt** | Elles vivent dans les « propriétés du script » chez Google. **Vérifié sur l'intégralité de l'historique Git** : aucune clé n'a jamais été publiée, même par accident, même dans un commit ancien |
| **Le serveur ne croit jamais le téléphone sur parole** | Le total d'un score détaillé est recalculé ; les effectifs annoncés par un club sont additionnés côté serveur ; les valeurs FFR sont relues du référentiel plutôt que reçues du navigateur |
| **Les protections qui comptent sont tenues par le serveur** | Réorganiser les poules après un score : refusé côté serveur. Gel des réponses des clubs à J-16 : refusé côté serveur — avec un commentaire disant expressément qu'un verrou d'écran serait contournable. L'auteur connaît la règle |
| **Les textes sont échappés partout** | Une fonction unique (`echapper`) neutralise six caractères dangereux, et elle est utilisée **plus de 400 fois** dans le frontend. C'est ce qui empêche qu'un nom d'équipe malicieux devienne du code exécuté dans le navigateur des spectateurs |
| **Les cellules du tableur sont forcées en « texte »** | Avant chaque écriture, le format est mis à « texte brut ». Un nom d'équipe commençant par `=` reste donc un texte, et ne devient pas une formule exécutée par Google Sheets |
| **Le destinataire d'un courriel est toujours relu dans le classeur** | Jamais pris dans la requête. Le code le dit : *« pour éviter tout détournement »*. C'est ce qui empêche l'application de servir de relais d'envoi vers n'importe quelle adresse |
| **Les jetons des clubs sont de vrais jetons aléatoires** | `Utilities.getUuid()` — un identifiant aléatoire de 122 bits. Le deviner est hors de portée. Et la page **l'efface de la barre d'adresse** dès le chargement, pour qu'il ne s'imprime pas en pied de page ni n'apparaisse sur une capture d'écran |
| **Il existe un garde-fou anti-devinette de clé** | Au-delà de 30 essais ratés, le serveur refuse pendant quelques minutes. Une bonne clé passe toujours : les bénévoles ne sont jamais bloqués |
| **Les messages d'erreur ne racontent rien** | Le détail part dans le journal du serveur ; le visiteur reçoit « Erreur serveur ». On n'apprend rien sur la structure interne en provoquant une erreur |
| **Le classeur Google est privé** | Vérifié par capture d'écran (I-06). L'identifiant du classeur est public dans le code, mais le connaître ne suffit pas à l'ouvrir |
| **Les images déposées sont vérifiées** | Type réellement image (PNG/JPEG/WebP/GIF) et taille bornée à 5 Mo **avant** création du fichier Drive |
| **Deux des trois pages à jeton bloquent la fuite d'adresse** | `invitation-club.html` et `reponse-invitation.html` portent `no-referrer`, avec le commentaire qui explique pourquoi |

> **À retenir** : ce n'est pas une application « à trous ». Les mécanismes de base sont en place et
> bien faits. Les problèmes ci-dessous portent presque tous sur **ce qui n'a pas encore été
> pensé** — la gestion des personnes, la trace, la disponibilité — pas sur des serrures cassées.

---

## C.2 — R-014 · La seule porte ouverte à tous n'a aucune limite *(P1)*

### 1. Ce que j'ai trouvé

Il existe **une** action que n'importe qui peut déclencher **sans aucune clé** : `mesureSponsors`.
Elle sert à remonter les statistiques de visibilité des partenaires depuis les téléphones des
spectateurs — qui, évidemment, n'ont pas de clé. Le choix est **délibéré**, documenté par un long
commentaire, et le contenu envoyé est **rigoureusement validé** : identifiants nettoyés, nombres
bornés, champs reconstruits un par un. Rien d'anormal ne peut être *stocké*.

Mais il n'y a **aucune limite au nombre d'appels**. Ni par appareil, ni par minute, ni par jour.
Chaque appel ouvre le classeur et **ajoute une ligne** à l'onglet `Mesures` — un onglet dont la
cartographie a déjà noté (C-09) qu'il n'est **jamais purgé automatiquement**.

**CERTAIN** — constaté ligne 2825 de `backend/Code.gs` : l'action est traitée *avant* le contrôle
de clé, et rien dans le fichier ne compte ni ne plafonne ces appels.

### 2. Pourquoi c'est important

Toute l'application — la page publique, la saisie des scores, l'administration, les courriels —
tourne sur **un seul compte Google Apps Script**, avec **un seul budget quotidien** et une limite
d'environ **30 exécutions en même temps**. Ce budget est **commun**. Il n'y a pas de cloison entre
« les statistiques des partenaires » et « la saisie des scores ».

Donc : si quelqu'un fait tourner cette porte ouverte à plein régime, ce n'est pas seulement l'onglet
`Mesures` qui grossit. C'est **le budget de toute l'application** qui se vide, et les 30 places
d'exécution qui se remplissent.

### 3. Exemple concret

Samedi 14 h. Six terrains, quatre catégories, des marqueurs qui valident un score toutes les
deux minutes, deux cents parents sur la page des scores.

Quelqu'un — un plaisantin qui a lu le code sur GitHub, ou simplement un bug dans une future version
de `sponsors.js` qui boucle — envoie des relevés en continu. Le marqueur du terrain 3 appuie sur
« Valider » : *« Serveur momentanément occupé, réessaie dans un instant. »* Il réessaie. Même
message. La page publique n'affiche plus rien. Personne, sur place, ne comprend pourquoi — et
personne n'a le moyen de le voir : il n'y a **aucune trace** des appels reçus.

Et l'onglet `Mesures` grossit sans fin, jusqu'à ce que le classeur atteigne la limite de cellules de
Google Sheets — moment auquel **plus aucune écriture** ne fonctionne, scores compris.

### 4. Ce que je propose

Trois mesures, de la plus simple à la plus solide :

1. **Un plafond global d'appels par tranche de temps**, exactement sur le modèle du garde-fou
   anti-devinette de clé qui existe déjà dix lignes plus bas dans le même fichier. Au-delà, on
   répond « merci » sans rien écrire. Les statistiques des partenaires perdent quelques relevés ; le
   tournoi ne perd rien ;
2. **Un plafond de lignes** sur l'onglet `Mesures` : au-delà de N lignes pour la journée, on
   n'écrit plus ;
3. **Un espacement minimum par appareil** (l'identifiant d'appareil est déjà envoyé) : un même
   appareil ne peut pas déposer plus d'un relevé toutes les X secondes.

### 5. Impact

- **Ce que ça change** : rien de visible. Un spectateur ne verra aucune différence ;
- **Risque de la correction** : faible. Le seul effet possible est de **perdre quelques relevés de
  visibilité** en cas d'affluence — c'est-à-dire d'obtenir des statistiques partenaires légèrement
  sous-estimées un jour de forte fréquentation. À arbitrer avec Romain : mieux vaut une statistique
  approximative qu'une saisie de scores bloquée ;
- **Bénéfice** : la seule voie par laquelle une personne extérieure peut nuire à l'application se
  referme ;
- **Fonctionnalités concernées** : uniquement le comptage de visibilité des partenaires
  (`frontend/js/sponsors.js`, onglet `Mesures`, page `perfs.html`). Aucun contact avec le sportif.

### 6. Ce que je conseille

**Corriger avant la première utilisation réelle.** C'est le seul problème de ce domaine qu'une
personne **totalement extérieure**, sans aucune clé, peut déclencher seule. La correction est de
quelques dizaines de lignes et réutilise un mécanisme déjà écrit dans le fichier.

> **Ce que je ne peux pas affirmer** : le nombre exact d'appels nécessaires pour saturer les quotas
> Google est **INCONNU** — il dépend de limites qui vivent chez Google et qui changent. Ce qui est
> **CERTAIN**, c'est qu'il n'existe **aucune borne** côté application.

---

## C.3 — R-015 · Deux mots de passe partagés, aucune personne derrière *(P1)*

### 1. Ce que j'ai trouvé

Il existe exactement **deux clés** :

- la **clé ADMIN** : ouvre tout — créer, générer, effacer, lire le carnet d'adresses des clubs
  (emails compris), envoyer des courriels au nom de l'organisateur ;
- la **clé SCORES** : permet uniquement d'enregistrer un score. *(Bonne séparation, à souligner :
  un marqueur ne peut rien faire d'autre.)*

Ces clés :

- sont les **mêmes pour tout le monde** — il n'y a **aucune notion de personne** ;
- ne **changent jamais toutes seules** : elles n'ont ni durée de vie, ni renouvellement ;
- ne peuvent pas être **retirées à une seule personne** : changer la clé la change **pour tous** ;
- ne laissent **aucune trace** : le classeur ne garde nulle part qui a saisi quel score.

**CERTAIN** — constaté dans `verifierCle` (`backend/Code.gs` ligne 3026) et dans `api.js`.

### 2. Pourquoi c'est important

Un mot de passe partagé par dix personnes n'est plus un mot de passe : c'est une **information
publique en devenir**. Il circule dans un groupe WhatsApp, il est écrit sur un post-it à la table de
marque, il est photographié, il est transmis « juste pour aujourd'hui » à un parent qui dépanne.

Et comme il **ne change jamais**, le bénévole de l'édition 2026 aura toujours, en 2028, la clé qui
permet de modifier les scores — depuis n'importe où dans le monde, sans être sur le terrain, car
l'adresse du serveur est publique.

Enfin, l'absence de trace n'est pas un détail de confort : c'est ce qui rend un litige
**insoluble**. Si un club conteste un score, il n'existe aucun moyen de savoir qui l'a saisi, ni
quand, ni s'il a été modifié.

### 3. Exemple concret

Un club conteste le score 3-2 du match U12 qui l'a privé de la finale. L'organisateur regarde le
classeur : le score est là. Qui l'a saisi ? **Personne ne peut le dire.** Le marqueur du terrain 2 ?
Un autre bénévole qui avait la clé et s'est trompé de match ? Quelqu'un qui n'était même pas sur
place ? Aucune réponse n'existe. L'organisateur ne peut ni confirmer, ni infirmer, ni corriger en
sachant ce qu'il corrige.

### 4. Ce que je propose

**En trois temps**, du plus simple au plus ambitieux — les deux premiers sont réalisables tout de
suite, le troisième est un vrai chantier :

1. **Une procédure écrite, pas du code** : renouveler les deux clés **avant chaque édition** et
   **après chaque édition** (c'est-à-dire deux fois par tournoi), et les générer avec un
   gestionnaire de mots de passe plutôt que de les inventer. Coût : dix minutes, deux fois par an.
   C'est de très loin le meilleur rapport bénéfice/effort de tout ce domaine ;
2. **Un journal d'écriture** (voir R-019) : un onglet où chaque écriture laisse une ligne — quand,
   quelle action, quel rôle de clé. Cela ne dit pas *qui*, mais cela dit *quand* et *combien*, ce
   qui suffit déjà à instruire un litige ;
3. **Des accès par personne** — chaque bénévole reçoit son propre code, révocable
   individuellement. C'est le seul moyen de répondre à « qui a fait ça ». Mais c'est une
   transformation profonde de l'application : je la classe **P3 / roadmap**, à traiter le jour où
   l'application servira plusieurs clubs.

### 5. Impact

- **Ce que ça change** : le point 1 ne change **rien** dans le code. Le point 2 ajoute une écriture
  discrète. Le point 3 change la façon dont on se connecte ;
- **Risque** : le point 1 a un risque **d'organisation**, pas technique — si la nouvelle clé n'est
  pas transmise aux bons bénévoles avant le coup d'envoi, la saisie est bloquée le matin du
  tournoi. La procédure doit donc dire **quand** renouveler (la veille, pas le jour même) ;
- **Bénéfice** : une clé qui a fuité cesse de valoir à vie ;
- **Fonctionnalités concernées** : aucune, pour les points 1 et 2.

### 6. Ce que je conseille

**Le point 1 avant la première utilisation réelle** — c'est une décision d'organisation, pas de
code, et elle ne coûte presque rien. **Le point 2 dans le plan d'industrialisation.** **Le point 3
en roadmap.**

> ⚠️ **Une question pour Romain, et elle compte** : la clé ADMIN actuellement en service est-elle
> une suite **aléatoire** (générée par un gestionnaire de mots de passe), ou une phrase choisie de
> tête ? Le code impose 12 caractères minimum, mais 12 caractères mémorisables et 12 caractères
> aléatoires n'offrent pas du tout la même résistance. Cette information est **INCONNU** depuis le
> dépôt (I-12), et elle change la gravité de R-017 ci-dessous.

---

## C.4 — R-016 · Deux gestes qui effacent tout ne sont retenus que par l'écran *(P1)*

### 1. Ce que j'ai trouvé

Deux actions détruisent des données de façon **irréversible** :

- **`genererPoulesEtPlanning`** — regénérer les poules **efface tous les scores déjà saisis** ;
- **`reinitialiserTournoi`** — vide les équipes, les poules, les matchs, les catégories, les
  horaires, les contacts de sécurité, et met l'affiche à la corbeille.

Dans les deux cas, la protection existe **uniquement dans le navigateur** : double confirmation et
re-saisie de la clé pour la première, fenêtre de confirmation pour la seconde. **Le serveur, lui,
exécute dès qu'il reçoit la bonne clé.** Il ne vérifie pas s'il y a des scores. Il ne demande aucune
confirmation.

**CERTAIN** — constaté dans le `switch` de `doPost` : ces deux actions n'ont aucun contrôle
préalable, contrairement à leurs voisines.

Ce qui rend ce constat sérieux, c'est justement que **le code sait faire l'inverse**. Trente lignes
plus loin, `reorganiserPoulesMatin` **refuse côté serveur** dès qu'un score existe. Et le gel des
réponses des clubs à J-16 est protégé côté serveur, avec ce commentaire : *« un verrou d'écran seul
serait contournable »*. La règle est connue de l'auteur ; elle n'a simplement pas été appliquée à
ces deux endroits-là.

### 2. Pourquoi c'est important

Une protection dans le navigateur protège contre **la maladresse**. Elle ne protège pas contre :

- un **appel direct** au serveur — et le code étant public, tout le monde sait exactement quoi
  envoyer ;
- un **futur bug du frontend** qui appellerait l'action sans passer par la confirmation ;
- un **double-clic** ou un rechargement qui rejouerait la requête.

Et surtout : ce qui est effacé est **définitivement perdu**. Il n'existe aucune sauvegarde, aucune
corbeille, aucun « annuler ».

### 3. Exemple concret

Milieu de journée, 40 matchs déjà saisis. L'organisateur veut ajouter une équipe arrivée en retard.
Il ajoute l'équipe, puis l'application lui signale « il faut regénérer ». Il regénère. **Les 40
scores disparaissent.** Il n'y a pas de retour arrière. La seule ressource est de tout ressaisir de
mémoire, à partir des feuilles papier — si elles existent.

*(La double confirmation le protège aujourd'hui, et c'est précisément pourquoi ce n'est pas
classé P0. Mais la dernière ligne de défense n'est pas au bon endroit.)*

### 4. Ce que je propose

**Déplacer le garde-fou du navigateur vers le serveur**, en recopiant très exactement ce qui est
déjà écrit pour `reorganiserPoulesMatin` :

1. `genererPoulesEtPlanning` **refuse** s'il existe au moins un score saisi — sauf si la requête
   porte un drapeau explicite (`confirme_effacement: true`) que seule la fenêtre de confirmation
   du navigateur ajoute. L'écran garde exactement le même comportement pour l'organisateur ;
2. `reinitialiserTournoi` exige le même drapeau explicite.

C'est la **ceinture en plus des bretelles** : l'écran continue de prévenir, mais le serveur ne peut
plus être surpris.

### 5. Impact

- **Ce que ça change pour Romain** : **rien de visible**. Les mêmes boutons, les mêmes fenêtres de
  confirmation ;
- **Risque de la correction** : réel et à surveiller — si le drapeau n'est pas ajouté correctement
  côté navigateur, le bouton « Générer les poules » **cesse de fonctionner**. C'est un changement
  qui touche deux fichiers en même temps et qui doit être testé sur les deux ;
- **Bénéfice** : la perte irréversible des scores devient impossible par accident technique ;
- **Fonctionnalités concernées** : génération des poules et du planning, réinitialisation. **Deux
  fonctions centrales** — d'où l'exigence de test.

### 6. Ce que je conseille

**Corriger, mais pas isolément** : cette correction touche le même code que **R-003** (déplacer un
match) et que la question du forfait. Elle doit être **regroupée avec elles** à l'ÉTAPE 3, pour ne
pas ouvrir deux fois le même fichier. Priorité **P1** parce que le critère « perte de données
irréversible » est atteint ; mais la correction se planifie, elle ne se bricole pas.

---

## C.5 — Les problèmes P2 (à corriger, mais qui ne bloquent pas le premier tournoi)

### R-017 · Le garde-fou anti-devinette se remet à zéro avec la clé la plus partagée *(P2)*

**Ce que j'ai trouvé** — Le compteur d'essais ratés est **unique** et **commun aux deux clés**.
Surtout, il est **remis à zéro dès qu'une clé valide arrive** — **y compris la clé SCORES**, celle
qui sera dans les mains de tous les bénévoles. **CERTAIN** (`verifierCle`, ligne 3026).

**Concrètement** : quelqu'un qui possède la clé des scores — donc n'importe quel bénévole d'une
édition passée — peut essayer de deviner la clé ADMIN **sans jamais être bloqué** : il lui suffit
d'intercaler de temps en temps un appel avec sa clé valide, qui remet le compteur à zéro.

**Ce que ça change vraiment** : cela dépend entièrement de la nature de la clé ADMIN. Si elle est
une suite aléatoire, la deviner reste hors de portée même sans aucune limite. Si c'est une phrase
choisie de tête, la limite était la seule chose qui protégeait. C'est pourquoi la question posée en
C.3 (**I-12**) n'est pas rhétorique.

**Ce que je propose** — Deux compteurs séparés (un par clé), et **ne jamais remettre à zéro le
compteur ADMIN** avec un succès sur la clé SCORES. Quelques lignes, aucun risque de régression.

---

### R-018 · Le contenu des courriels est écrit par le navigateur, le serveur ne fait que poster *(P2)*

**Ce que j'ai trouvé** — Pour l'invitation, le dossier et la feuille de fin de journée, le **texte
HTML complet** du courriel est fabriqué dans le navigateur de l'administrateur et envoyé au serveur,
qui l'expédie **tel quel**, sous l'adresse Gmail du propriétaire, sans le regarder.
**CERTAIN** (`envoyerDossierEmail`, `envoyerFeuilleJour`, `envoyerInvitationClub`).

**La bonne nouvelle** : le **destinataire**, lui, est toujours relu dans le classeur. L'application
ne peut donc **pas** servir à écrire à une adresse arbitraire — c'est la protection qui compte le
plus, et elle est en place. On ne peut écrire qu'aux clubs déjà inscrits dans le carnet.

**Ce qui reste** : quiconque détient la clé ADMIN peut faire partir, **depuis l'adresse authentique
de l'organisateur**, un message dont il choisit entièrement le contenu, vers **tous les clubs
acceptés d'un coup**. Un courriel qui vient réellement de la bonne adresse, avec le blason du club,
est presque impossible à distinguer d'un vrai. C'est un risque de **hameçonnage** (= un faux message
qui pousse à cliquer sur un mauvais lien), amplifié par la crédibilité de l'expéditeur.

**Ce que je propose** — À terme, fabriquer le courriel **côté serveur** à partir de données, plutôt
que de recevoir du HTML tout fait. C'est un chantier réel (le rendu est riche et il existe un aperçu
fidèle dans l'administration). À court terme : en prendre acte, et considérer que **la clé ADMIN
donne le droit de parler au nom du club** — ce qui est une raison de plus de la renouveler
régulièrement (R-015).

---

### R-019 · Personne ne sait qui a fait quoi *(P2)*

**Ce que j'ai trouvé** — Aucune trace, nulle part, d'aucune action : ni la saisie d'un score, ni la
consultation du carnet d'adresses, ni l'envoi d'un courriel, ni une réinitialisation. **CERTAIN**
côté application. Ce que le journal d'exécution de Google conserve, et pendant combien de temps,
est **INCONNU** (I-09).

**Pourquoi ça compte** — Sans trace, on ne peut ni instruire un litige sportif (C.3), ni détecter un
abus, ni même constater qu'il a eu lieu. C'est aussi ce qui rendrait **invisible** une saturation
comme celle décrite en R-014.

**Ce que je propose** — Un onglet `Journal` très simple : date-heure, action, rôle de clé utilisé,
résultat (accepté / refusé). **Sans donnée personnelle** — c'est important pour le domaine B :
un journal ne doit pas devenir un fichier de surveillance des bénévoles. Écriture légère, une ligne
par écriture. À arbitrer avec le domaine F (performance) : une ligne de plus par écriture a un coût,
faible mais non nul, et le jour J chaque écriture compte.

---

### R-020 · Une seule requête donne tout le carnet d'adresses et tous les jetons *(P2)*

**Ce que j'ai trouvé** — L'action `listerClubsInvites` renvoie l'onglet `ClubsInvites` **en entier**,
toutes colonnes comprises : noms, prénoms, **adresses email** et **tous les jetons** des clubs.
C'est nécessaire à l'écran d'administration, qui affiche tout cela. **CERTAIN** (déjà relevé en
cartographie sous C-11).

**Pourquoi ça compte** — Cela veut dire que la clé ADMIN ne donne pas seulement le droit
d'administrer : elle donne, **en un seul appel**, la totalité du carnet d'adresses **et** la
capacité d'ouvrir le dossier de n'importe quel club (les jetons donnent accès aux téléphones du jour
J et à la logistique). À rapprocher de **C-06** : les jetons **ne périment jamais**. Un lien envoyé
en 2026 fonctionne encore en 2028, tant qu'il n'a pas été régénéré à la main.

**Ce que je propose** — Deux choses distinctes, de coût très différent :

1. **Ne pas renvoyer les jetons** dans la liste, et ne les fournir qu'à la demande, club par club,
   au moment où l'administration a réellement besoin de fabriquer un lien. Modification modeste ;
2. **Faire expirer les jetons** — par exemple à la réinitialisation, ou X jours après le tournoi.
   Cela relève autant du **domaine B (RGPD)** que d'ici : je le signale et le laisse à B.

---

### R-021 · Les bibliothèques tierces sont recopiées sans numéro de version *(P2)*

**Ce que j'ai trouvé** — Le dossier `frontend/js/vendor/` contient **quatre bibliothèques** écrites
par d'autres (`pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`), copiées telles quelles. Aucune ne
porte de **numéro de version**, aucune n'a d'empreinte permettant de vérifier qu'elle n'a pas été
modifiée, et **aucun fichier n'indique d'où elles viennent**. **CERTAIN**.

**Pourquoi ça compte** — Une bibliothèque, c'est du code écrit par quelqu'un d'autre qu'on exécute
dans le navigateur de ses utilisateurs. Quand une faille y est découverte, l'auteur publie une
version corrigée. **Ici, on ne peut même pas savoir quelle version on utilise** — donc on ne peut
pas savoir si on est concerné, ni si on est déjà à jour.

Savoir si ces quatre fichiers portent aujourd'hui une faille connue est **INCONNU** : il faudrait
identifier chaque version, ce que l'audit n'a pas pu faire sans exécuter d'outil. La surface reste
**limitée** : ces bibliothèques servent à fabriquer le document d'autorisation FFR et les QR codes,
à partir de données saisies par l'organisateur lui-même, sur des pages qui ne sont pas publiques.

**Ce que je propose** — Un petit fichier `frontend/js/vendor/README.md` : pour chacune, le nom, la
version, l'adresse d'origine et l'empreinte du fichier. Cela ne corrige rien, mais cela rend la
question **posable** — aujourd'hui elle ne l'est pas.

---

### R-022 · Deux liens du dossier club oublient le filtre que le reste du code applique *(P2)*

**Ce que j'ai trouvé** — Le code contient une fonction dédiée, `lienExterneSur`, avec ce commentaire
explicite : *« '' si l'URL n'est pas en http(s) : un schéma exotique (javascript:, data:…) glissé
dans Config ne devient JAMAIS un lien cliquable »*. Le même filtre existe pour les partenaires et
pour le règlement.

Mais dans `frontend/js/dossier.js`, les boutons « Site de l'association » et « Relayer sur les
réseaux » construisent **le même type de lien, à partir des mêmes réglages, sans ce filtre**
(lignes 823 et 827). **CERTAIN.**

**Ce que ça veut dire, simplement** — Un lien peut contenir autre chose qu'une adresse de site : il
peut contenir une instruction. Le filtre sert à n'accepter que de vraies adresses web. Là où il
manque, une instruction glissée dans les réglages du tournoi deviendrait un bouton cliquable sur le
dossier des clubs.

**Portée réelle** : il faut la clé ADMIN pour écrire dans ces réglages. Ce n'est donc pas une porte
ouverte à un inconnu — c'est une **incohérence** : la même donnée est filtrée à un endroit et pas à
l'autre. Le genre d'oubli qui devient un vrai problème le jour où un deuxième club administre
l'outil.

**Ce que je propose** — Faire passer ces deux liens par `lienExterneSur`, qui existe déjà. **Trois
lignes.** Aucun risque : le comportement est identique pour toute adresse normale.

---

## C.6 — Les problèmes P3 (à garder, sans urgence)

### R-023 · La table des droits est interrogée sans précaution *(P3)*

Le contrôle d'accès demande « cette action fait-elle partie de la liste ? » d'une façon qui répond
**oui** pour certains noms techniques hérités du langage (`constructor`, `toString`…). **CERTAIN.**

**Conséquence aujourd'hui : aucune.** Aucune action ne porte ces noms, et une requête qui les
utiliserait retomberait sur « Action inconnue » sans rien faire. Mais c'est un filet qui n'est pas
tendu au bon endroit dans un mécanisme de sécurité — et c'est **une ligne à changer**
(`hasOwnProperty`). À faire au passage lors d'une prochaine intervention sur ce fichier, pas pour
lui-même.

### R-024 · La page du dossier club n'a pas la protection de ses deux pages sœurs *(P3)*

`invitation-club.html` et `reponse-invitation.html` portent une instruction qui empêche l'adresse
de la page — donc le jeton du club — d'être communiquée aux sites tiers vers lesquels on clique.
**`dossier-club.html` ne l'a pas**, alors qu'elle porte le même jeton et qu'elle contient des liens
sortants (site de l'association, Instagram, partenaires, cartes). **CERTAIN.**

**Portée réelle** : faible. Les navigateurs récents ne transmettent par défaut que le **nom du
site**, pas l'adresse complète — le jeton ne fuite donc pas aujourd'hui. C'est une **incohérence de
protection** entre trois pages qui font la même chose, pas une fuite constatée. **Une ligne.**

### R-025 · L'administration n'interdit pas son référencement *(P3)*

Les trois pages destinées aux clubs demandent aux moteurs de recherche de ne pas les référencer.
`admin.html`, `saisie.html` et `perfs.html` ne le font pas. **CERTAIN.**

**Portée réelle : très faible**, et il faut le dire clairement pour ne pas surestimer le sujet — le
dépôt étant **public**, ces adresses sont de toute façon connaissables. Cela évite simplement
qu'elles apparaissent dans une recherche Google, ce qui reste préférable. **Une ligne par page.**

---

## C.7 — Ce que le domaine C ne peut PAS conclure

La transparence exige de dire aussi ce que cet audit **ne prouve pas**.

| Ce qui n'a pas été fait | Pourquoi | Conséquence |
|---|---|---|
| **Aucun test d'intrusion** | Rien n'a été exécuté : ni requête envoyée au serveur, ni tentative réelle | Tout ce qui précède est déduit de la **lecture du code**. Une faille qui n'apparaîtrait qu'à l'exécution n'aurait pas été vue |
| **Le code en service chez Google n'a pas été vu** | Il vit chez Google (I-01, `CLAUDE.md` §13.6) | Si la version déployée est plus ancienne, elle peut ne pas contenir les protections décrites en C.1. **NON VÉRIFIÉ** |
| **Les réglages du déploiement n'ont pas été vus** | Ils vivent dans l'éditeur Apps Script | **I-11** — nouveau point inconnu, à lever par Romain (voir ci-dessous) |
| **La robustesse réelle des deux clés est inconnue** | Seul Romain les connaît | **I-12** — change la gravité de R-017 |
| **Le partage du classeur n'est pas protégé par du code** | Il vit dans Drive (A-13) | Le classeur est privé aujourd'hui (I-06). Rien, dans l'application, ne détecterait un changement de ce réglage : la sécurité de **toutes** les données personnelles tient à un panneau de partage chez Google, et à rien d'autre |
| **Les images déposées sur Drive restent publiques** | Choix assumé (C-08) | Affiches, logos, photo du parking sont lisibles par quiconque a le lien, y compris après suppression (corbeille ~30 jours — I-08). Sans gravité pour une affiche ; à réexaminer au **domaine B** pour la photo du parking |
| **Le relais CDN n'est pas en service** | `SNAPSHOT_URL = ""` | Le fichier `cloudflare/worker-tournoi.js` a été lu : sa clé vit dans les variables secrètes de Cloudflare, **pas dans le dépôt**. Rien à signaler — mais rien n'est vérifié en conditions réelles non plus |

### Deux nouveaux points inconnus, à lever par Romain

| # | Question | Comment la lever |
|---|---|---|
| **I-11** | Comment la Web App est-elle **déployée** ? Précisément : « Exécuter en tant que » vaut-il **moi** (le propriétaire), et « Qui a accès » vaut-il **tout le monde** ? | Éditeur Apps Script → *Déployer* → *Gérer les déploiements* → lire les deux réglages. **Important** : si « Exécuter en tant que » valait autre chose, la lecture du classeur privé cesserait de fonctionner ; et si « Qui a accès » était restreint, la page publique ne fonctionnerait pas. Le fonctionnement actuel rend donc ces valeurs **PROBABLES** — mais probable n'est pas vérifié |
| **I-12** | La clé ADMIN en service est-elle **aléatoire** (issue d'un gestionnaire de mots de passe) ou **choisie de tête** ? Même question pour la clé SCORES | Romain le sait. Ne **jamais** écrire la réponse dans ce dépôt : la réponse attendue est simplement « aléatoire » ou « choisie » |

---

## C.8 — Récapitulatif du domaine C

| Réf | Problème | Priorité | Qui peut l'exploiter | Difficulté de correction |
|---|---|---|---|---|
| **R-014** | La seule porte ouverte à tous n'a aucune limite de débit | **P1** | **N'importe qui**, sans clé | **Faible** — le mécanisme existe déjà dans le fichier |
| **R-015** | Deux mots de passe partagés, sans personne, sans expiration, sans trace | **P1** | Tout ancien porteur d'une clé | **Nulle** pour le renouvellement (procédure) · **Élevée** pour des accès par personne |
| **R-016** | Deux gestes destructeurs retenus par le seul écran | **P1** | Porteur de la clé ADMIN, ou un futur bug | **Moyenne** — touche deux fichiers, exige des tests |
| **R-017** | Le garde-fou anti-devinette est remis à zéro par la clé des scores | P2 | Porteur de la clé SCORES | **Très faible** |
| **R-018** | Le contenu des courriels vient du navigateur, le serveur l'expédie tel quel | P2 | Porteur de la clé ADMIN | **Élevée** (refonte des courriels) |
| **R-019** | Aucune trace de qui fait quoi | P2 | — (empêche de constater) | Faible, mais à arbitrer avec la performance |
| **R-020** | Tout le carnet d'adresses et tous les jetons en une requête ; jetons sans expiration | P2 | Porteur de la clé ADMIN | Faible (jetons hors liste) · Moyenne (expiration) |
| **R-021** | Bibliothèques tierces sans version ni provenance | P2 | — (empêche de savoir) | **Très faible** (documenter) |
| **R-022** | Deux liens du dossier club sans le filtre appliqué partout ailleurs | P2 | Porteur de la clé ADMIN | **Très faible** — 3 lignes |
| **R-023** | La table des droits est interrogée sans précaution | P3 | Personne aujourd'hui | **Très faible** — 1 ligne |
| **R-024** | `dossier-club.html` sans la protection d'adresse de ses pages sœurs | P3 | Personne aujourd'hui | **Très faible** — 1 ligne |
| **R-025** | L'administration ne demande pas à ne pas être référencée | P3 | — | **Très faible** — 1 ligne |

**Total : 0 P0 · 3 P1 · 6 P2 · 3 P3 — soit 12 problèmes.**

### Le fil rouge du domaine C

**Les murs sont bien construits, mais il n'y a qu'une seule clé, tout le monde l'a, et personne ne
note qui entre.**

Les trois P1 racontent la même histoire sous trois angles :

- **R-015** — on ne sait pas *qui* ;
- **R-016** — la dernière serrure est du mauvais côté de la porte ;
- **R-014** — une porte volontairement laissée ouverte n'a pas de portier.

### Si je devais ne corriger que trois choses

1. **R-015, point 1 seulement** — renouveler les deux clés avant et après chaque édition. **Ce n'est
   pas du code**, c'est une décision d'organisation de dix minutes, et c'est ce qui protège le mieux
   pour le moins d'effort de tout ce document ;
2. **R-014** — poser une limite sur la seule porte ouverte à tous. C'est le seul problème qu'une
   personne totalement extérieure peut déclencher, et la correction réutilise un mécanisme déjà
   écrit dix lignes plus bas ;
3. **R-022 + R-017 + R-023 + R-024 + R-025** ensemble — cinq corrections d'une à trois lignes
   chacune, sans risque, qui referment cinq incohérences. À faire en **un seul passage**.

**R-016 vient juste après**, mais ne doit **pas** être traité seul : il touche le même code que
R-003 (déplacer un match) et le forfait. À regrouper à l'ÉTAPE 3.

> ⚠️ **Ce qui reste hors de portée de ce domaine** : la sécurité de toutes les données personnelles
> repose aujourd'hui sur **un réglage de partage chez Google** qu'aucun code ne surveille. C'est le
> point le plus fragile de l'ensemble, et il n'est réparable par **aucune ligne de code** — seulement
> par une vérification humaine régulière.

---
