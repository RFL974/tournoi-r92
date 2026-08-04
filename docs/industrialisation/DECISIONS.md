# DÉCISIONS — Industrialisation de Tournoi R92

> Ce fichier existe pour répondre à une question que se posera toujours une nouvelle session (ou un
> développeur extérieur) : **« pourquoi est-ce fait comme ça ? »**
>
> Une décision non écrite ici est une décision perdue.

**Dernière mise à jour** : 2026-08-04 (session 5, après réponses de Romain)

---

## Modèle de fiche

```markdown
### D-0XX — <sujet>

| Champ | Valeur |
|---|---|
| **Date** | AAAA-MM-JJ |
| **Session** | N |
| **Statut** | PROPOSÉE / VALIDÉE / REFUSÉE / EN ATTENTE DE ROMAIN |
| **Décidée par** | Romain / Claude (technique) |

**Problème posé**
> …

**Décision prise**
> …

**Raison**
> …

**Conséquences**
> …

**Ce qui aurait été possible à la place** (et pourquoi ça n'a pas été retenu)
> …
```

---

## DÉCISIONS VALIDÉES

### D-001 — La mémoire du projet est dans le dépôt, pas dans la conversation

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE |
| **Décidée par** | Romain |

**Problème posé**
> Jusqu'ici, ce qui avait été compris du projet vivait dans la conversation en cours. Quand la
> conversation se termine, cette compréhension disparaît. Chaque nouvelle session risquait de
> refaire le même travail, ou pire, de repartir sur de fausses bases.

**Décision prise**
> La mémoire durable du projet est constituée de deux choses : le fichier `CLAUDE.md` à la racine
> (les règles de travail) et le dossier `docs/industrialisation/` (l'état réel du chantier). Une
> nouvelle session lit ces documents avant de décider quoi faire.

**Raison**
> Ces fichiers sont dans le dépôt Git : ils survivent aux conversations, ils sont datés, et on peut
> voir leur historique.

**Conséquences**
> Chaque session doit **écrire** ce qu'elle a fait avant de s'arrêter. Une session qui ne met pas à
> jour ces fichiers est une session perdue.

---

### D-002 — Une session = un objectif, puis arrêt

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE |
| **Décidée par** | Romain |

**Problème posé**
> Un travail d'industrialisation touche à tout : sécurité, données, interface, tests. Tout mélanger
> dans une même séance rend impossible de savoir ce qui a été vérifié et ce qui ne l'a pas été.

**Décision prise**
> Chaque session a **un seul objectif précis**. Quand il est atteint : mise à jour de la
> documentation, vérification de l'état Git, commit si nécessaire, rapport de fin de session,
> recommandation pour la suivante, puis **arrêt**. Jamais d'enchaînement automatique.

**Raison**
> Cela laisse à Romain le contrôle du rythme et la possibilité de valider chaque étape en la
> comprenant.

**Conséquences**
> Le travail avance par petits pas. C'est volontairement plus lent, et volontairement plus sûr.

---

### D-003 — Articulation avec l'audit de conformité FFR existant

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE par Romain le 2026-08-04 |

**Problème posé**
> Le dépôt contient déjà `AUDIT-TOURNOI-R92.md` : un gros document (~129 000 caractères) qui audite
> la conformité du tournoi aux règles de la Fédération Française de Rugby, avec sa **propre méthode
> par sessions**. Si on ne dit rien, on se retrouve avec deux systèmes de suivi qui racontent chacun
> une version de l'état du projet.

**Décision proposée**
> Les deux chantiers restent **séparés et complémentaires** :
> - `AUDIT-TOURNOI-R92.md` = **la règle du jeu** (ce que la FFR impose : catégories, durées, formes
>   de jeu, points). Il reste la source de vérité pour tout ce qui est réglementaire.
> - `docs/industrialisation/` = **la solidité de l'outil** (est-ce fiable, sûr, testé, respectueux
>   des données personnelles, utilisable sur le terrain).
>
> Quand l'audit métier (domaine A) touchera une règle FFR, on **renvoie** à `AUDIT-TOURNOI-R92.md`
> plutôt que de recopier son contenu.

**Raison**
> Recopier créerait deux versions de la même règle, qui finiraient par diverger.

**Conséquences si validée**
> `AUDIT-TOURNOI-R92.md` n'est pas modifié par ce chantier. Le domaine A se concentre sur ce que
> l'application **sait faire ou ne sait pas faire**, pas sur ce que la FFR impose.

---

### D-004 — Langue des messages de commit

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE par Romain le 2026-08-04 |

**Problème posé**
> Le prompt maître donne des exemples de commits en anglais
> (`fix(ranking): correct tie-break calculation`). Le dépôt utilise en réalité, depuis plus de 170
> commits, un format mixte : type et catégorie en anglais, description **en français**
> (`fix(sponsors): le bandeau du dossier écrasait son accroche`).
>
> *Un « commit », c'est une photo enregistrée du projet à un instant donné, avec une phrase qui
> explique ce qui a changé. L'ensemble des commits forme l'historique.*

**Décision proposée**
> Conserver la convention existante du dépôt : `type(scope): description en français`.

**Raison**
> Changer maintenant produirait un historique à deux langues, plus difficile à relire. Et la
> description en français est plus utile à Romain, qui est le premier lecteur de cet historique.

---

### D-006 — Comment les modifications arrivent dans le dépôt : documentation vs. code

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ✅ VALIDÉE par Romain le 2026-08-04 |
| **Décidée par** | Romain |

**Problème posé**
> L'habitude du projet est de passer par une « branche + pull request » : on travaille sur une copie
> de côté, et on la fusionne dans la version officielle après relecture. C'est une sécurité utile
> pour du code. Mais l'appliquer aux fichiers de suivi ralentirait chaque session sans rien
> protéger : ces fichiers ne s'exécutent pas, ils ne peuvent rien casser.

**Décision prise**
> - **Documentation** (`CLAUDE.md`, `docs/industrialisation/`, autres documents) : commit **direct
>   sur `main`**, sans branche ni pull request.
> - **Code de l'application** (`backend/`, `frontend/`, configuration) : la règle habituelle reste
>   entière — **branche + pull request**, et **validation de Romain avant toute modification**
>   (`CLAUDE.md` §7 ÉTAPE 4).

**Raison**
> Séparer ce qui est risqué de ce qui ne l'est pas. Un texte qui décrit le travail ne mérite pas la
> même cérémonie qu'un code qui calcule des scores le jour d'un tournoi.

**Conséquences**
> La mise à jour de fin de session est rapide et systématique — donc elle sera réellement faite.
> Une session qui mélangerait documentation **et** code devra faire **deux** choses distinctes :
> le commit de doc sur `main`, et une branche + PR pour le code.

---

### D-007 — La cartographie est découpée en trois volets

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 2 |
| **Statut** | ✅ VALIDÉE |
| **Décidée par** | Claude (technique) |

**Problème posé**
> L'ÉTAPE 1 demande de « comprendre entièrement le projet ». Mais le serveur fait à lui seul
> 8 030 lignes, et le reste du code environ autant. Tout embrasser en une session produirait soit
> un survol trop vague pour être utile, soit un document trop long pour être lu.

**Décision prise**
> L'ÉTAPE 1 est découpée en **trois volets**, un par session, écrits dans un **seul** fichier
> `docs/industrialisation/CARTOGRAPHIE.md` :
> - **A — le squelette** : de quoi l'application est faite, comment les morceaux se parlent, comment
>   le code arrive en ligne, qui a le droit de quoi ;
> - **B — les fonctionnalités** : ce que l'application sait faire, écran par écran ;
> - **C — les données** : ce qui est stocké, où, combien de temps, et ce qui touche à la vie privée.

**Raison**
> Chaque volet répond à une question différente, et chacun tient dans une session. Un seul fichier
> évite d'éparpiller la compréhension du projet dans plusieurs documents.

**Conséquences**
> L'ÉTAPE 2 (l'audit) ne peut pas commencer avant la fin des trois volets — auditer sans connaître
> les données manipulées reviendrait à juger sans avoir tout lu.

---

### D-008 — La cartographie décrit, elle ne classe pas

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 2 |
| **Statut** | ✅ VALIDÉE |
| **Décidée par** | Claude (technique) |

**Problème posé**
> En lisant le code pour le cartographier, on remarque forcément des choses discutables. La
> tentation est de les classer tout de suite en P0/P1/P2/P3. Ce serait un mélange dangereux : un
> problème signalé sans avoir été instruit devient soit une alerte injustifiée, soit une fausse
> réassurance.

**Décision prise**
> Les observations faites pendant la cartographie sont notées comme **points d'attention**
> (`CARTOGRAPHIE.md` §A.10), avec le domaine d'audit qui les reprendra, et **sans aucune priorité**.
> La classification P0/P1/P2/P3 appartient exclusivement à l'ÉTAPE 2, dans `RISQUES.md`.

**Raison**
> `CLAUDE.md` §5 l'impose : « ne jamais traiter automatiquement un P2 ou P3 comme un P0 ». La façon
> la plus sûre de respecter cette règle est de ne pas classer avant d'avoir instruit.

**Conséquences**
> Un point d'attention de la cartographie n'a **aucune valeur d'alerte**. Il ne faut ni s'en
> inquiéter, ni le corriger, tant que l'ÉTAPE 2 ne l'a pas repris.

---

### D-010 — Ordre de passage des 8 domaines d'audit

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ✅ **VALIDÉE PAR ROMAIN** |

**Problème posé**
> L'ÉTAPE 2 comporte 8 domaines d'audit. `CLAUDE.md` §7 impose de ne **pas** les traiter
> simultanément, mais ne fixe pas leur ordre. Il fallait donc le décider avant de commencer.

**Décision retenue**
> **A → C → B → D → E → F → G → H.**
> Métier d'abord, puis sécurité, puis données personnelles, puis tests, puis le confort
> (UX, performance, architecture, qualité du code).

**Raison**
> C'est l'ordre de priorité imposé par `CLAUDE.md` §11 : la fonctionnalité métier passe avant
> tout, puis ce qui peut faire du mal, puis ce qui prouve, puis ce qui rend agréable.

**Alternative écartée**
> Remonter le domaine B (données personnelles) juste après A, au motif que le classeur est encore
> vide de données de tiers et que tout pourrait être **préparé** plutôt que **rattrapé**
> (argument issu du volet C de la cartographie).
>
> **Écartée par Romain le 2026-08-04**, avec sa raison : *« on fait les choses dans l'ordre pour
> bien les faire, la production attendra — de toute façon personne ne sait ce qui est en train
> d'être construit pour le moment »*. La fenêtre de tir du domaine B reste ouverte tant qu'aucun
> vrai club n'est invité ; l'urgence invoquée n'en était donc pas une.

**Conséquence concrète**
> Aucune correction de code ne commence avant la fin des 8 audits **et** la validation de
> l'ÉTAPE 4. Le rythme est assumé : la mise en production attend.

---

### D-011 — La règle du forfait (équipe absente)

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ✅ **VALIDÉE PAR ROMAIN** |
| **Couvre** | R-001 |

**Problème posé**
> Un match n'a que deux états : « à venir » et « terminé ». Une équipe absente n'a aucune façon
> correcte d'être enregistrée : un 0-0 lui donne 2 points (match nul), un score inventé lui offre
> de la différence — or la différence sert à départager.

**Décision de Romain, mot pour mot**
> *« L'absent marque 0 point et le présent gagne (différence de points à mettre en paramètre à la
> discrétion de l'organisateur du tournoi). Peu importe son choix, toutes les équipes doivent être
> informées de tout point de règlement dans leur dossier final a minima. »*

**Ce que cela fixe**
> - équipe **absente** : **0 point** de classement (et non 1, comme une défaite jouée) ;
> - équipe **présente** : **elle gagne** — 3 points ;
> - le **score attribué**, donc la différence : **paramètre réglable par l'organisateur** ;
> - **exigence de transparence** : la règle retenue doit figurer dans le dossier final des clubs.

**Conséquence technique à retenir pour l'ÉTAPE 3**
> C'est **l'état « forfait » qui porte la victoire**, pas le score. L'application déduit
> aujourd'hui victoire/nul/défaite en comparant les deux scores : un forfait réglé à « 0-0 » ne
> pourrait donc pas produire une victoire sans cet état explicite. C'est la raison technique pour
> laquelle « inventer un score » ne peut pas suffire.

**Recommandation de valeur par défaut (non tranchée, sans urgence)**
> **`0 – 0`** : la victoire par forfait pèse alors exactement 3 points et rien de plus, sans
> fausser aucun départage. L'organisateur qui veut autre chose règle le paramètre — c'est
> précisément ce que la décision prévoit.

**Conséquence non prévue, remontée le jour même**
> L'exigence de transparence **n'est pas réalisable en l'état** : ni le barème, ni le départage ne
> sont écrits où que ce soit pour les clubs, et le champ « Règlement » du dossier a été retiré de
> l'écran d'administration. Nouveau constat **R-012**.

---

### D-012 — Limite et confirmation des scores saisis

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ✅ **VALIDÉE PAR ROMAIN** |
| **Couvre** | R-005 |

**Problème posé**
> Un score est accepté dès lors qu'il est un entier ≥ 0. Aucune borne haute, ni dans la page ni
> dans le serveur : 150 au lieu de 15 passe sans un mot et fausse toute une poule via la différence.

**Décision de Romain, mot pour mot**
> *« R-005 max un nombre à 2 chiffres plus demande de confirmation du score avant de valider. »*

**Ce que cela fixe**
> - **maximum 2 chiffres** : au-delà de 99, la saisie est **refusée** (pas seulement signalée) ;
> - **confirmation demandée avant chaque validation** de score.

**Précision de ma part sur la question posée**
> J'avais demandé « à partir de quel score demander confirmation ? ». La question était mal posée :
> Romain ne veut pas d'un seuil, mais d'une **limite dure** doublée d'une **confirmation
> systématique**. C'est plus simple et plus sûr que ce que je proposais.

**Conséquences techniques à retenir pour l'ÉTAPE 3**
> - la limite s'applique à **tout champ tapé par un humain**, donc aussi aux compteurs du mode
>   détaillé (essais, transformations, pénalités, drops) : une seule règle couvre les deux modes ;
> - elle doit être posée **des deux côtés** — dans la page (le marqueur voit l'erreur tout de
>   suite) **et** dans le serveur (elle n'est pas contournable). C'est la leçon du point B-03.

**Point mineur reporté au domaine E (UX)**
> Une confirmation à **chaque** score, c'est un appui de plus sur 60 matchs, sur un téléphone,
> debout, sous la pluie. La décision est appliquée telle quelle ; seul le **confort du geste** sera
> réexaminé au domaine E, jamais le principe.

---

## DÉCISIONS EN ATTENTE DE ROMAIN

### D-013 — Comment ajuster le planning en cours de journée

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ⏳ **PROPOSITION FAITE — EN ATTENTE DE ROMAIN** |
| **Couvre** | R-003 |

**Demande de Romain**
> *« R-003 en effet je n'ai pas prévu ce cas, que me suggères-tu ? »*

**Proposition — trois niveaux, dont je recommande de ne faire que les deux premiers**
> 1. **Déplacer un match** : changer son heure et/ou son terrain, un match à la fois, sans rien
>    regénérer. Coût faible (3 cellules d'une ligne), aucun impact sur les poules, les scores ou
>    le tirage ;
> 2. **Tout décaler de X minutes** : un bouton qui décale tous les matchs **pas encore joués**.
>    C'est le besoin le plus fréquent de tous — la journée qui démarre en retard ;
> 3. *(plus tard, si l'expérience le réclame)* **rendre un terrain indisponible** et laisser
>    l'application redistribuer ses matchs restants. Seul niveau qui touche au planificateur, donc
>    seul niveau réellement risqué.

**Trois règles de conception proposées**
> - **avertir, jamais interdire** : si le terrain est occupé ou l'équipe déjà en jeu, on le
>   signale, on laisse faire. Le jour J, l'organisateur en sait plus que l'algorithme ;
> - **ne jamais bloquer parce que l'après-midi est généré** : c'est précisément là que le besoin naît ;
> - **réservé à la clé admin** : cela change ce que les parents lisent sur la page publique.

**Détail complet** : `AUDIT.md` §A.4, point 7.

---

### D-014 — Quels critères de départage ajouter

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ⏳ **PROPOSITION FAITE — EN ATTENTE DE ROMAIN** |
| **Couvre** | R-004 |

**Demande de Romain**
> *« R-004 que me suggères-tu ? »*

**Proposition — ajouter deux critères À LA SUITE des trois existants, sans toucher aux trois**
> 4. **la confrontation directe** — si les deux équipes se sont rencontrées, celle qui a gagné
>    passe devant ;
> 5. **l'ordre alphabétique** du nom d'équipe, en dernier recours.

**Pourquoi c'est peu risqué**
> Ces critères n'interviennent **qu'après** les trois existants, donc uniquement dans les cas où
> l'application n'a aujourd'hui **aucune règle**. Aucun classement actuellement correct ne change.

**Pourquoi l'alphabétique et pas un tirage au sort**
> Le classement est calculé **deux fois** (serveur pour tirer l'après-midi, navigateur pour
> l'affichage public). Un tirage au sort donnerait **deux réponses différentes** : la page publique
> afficherait un classement, l'après-midi serait tiré sur un autre. Le dernier recours doit donc
> être **déterministe**.

**Condition non négociable**
> Cette correction touche au cœur sportif, écrit deux fois. Elle ne doit pas être écrite avant que
> des **tests** couvrent les cas d'égalité (domaine D).

**Détail complet** : `AUDIT.md` §A.5, point 7.

---


### D-009 — Où atterrit la documentation quand une branche est imposée

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 2 |
| **Statut** | ⏳ EN ATTENTE DE ROMAIN |

**Problème posé**
> **D-006** dit que la documentation part **directement sur `main`**, sans branche ni relecture.
> Mais la session 2 a été lancée avec une consigne d'exécution qui impose une branche de travail
> (`claude/industrialisation-phase2-cartographie-usis7l`) et interdit de pousser ailleurs.
>
> *Une « branche », c'est une copie de côté du projet : on y travaille sans toucher à la version
> officielle (`main`), jusqu'à ce qu'on décide de l'y ramener.*

**Ce qui a été fait**
> La **consigne d'exécution l'a emporté** : le travail de la session 2 a été poussé sur la branche
> imposée, pas sur `main`. C'est le choix prudent — pousser sur `main` contre une consigne explicite
> aurait été pire que le léger détour.

**Conséquence concrète**
> Tant que cette branche n'est pas ramenée dans `main`, `CARTOGRAPHIE.md` **n'existe pas** pour une
> session qui démarrerait depuis `main`. Elle croirait la cartographie non commencée et risquerait
> de la refaire.

**Question à Romain** — deux possibilités :
> **(a)** ramener la branche dans `main` dès maintenant (fusion), et garder D-006 tel quel : la
> documentation continue d'aller directement sur `main` quand aucune branche n'est imposée ;
> **(b)** modifier D-006 : toute session, documentation comprise, passe désormais par une branche.
>
> **Recommandation : (a).** C'est le comportement décrit par D-006, que tu as déjà validé, et il
> garantit qu'une nouvelle session partant de `main` retrouve toujours l'état réel du chantier.

---

### D-005 — Périmètre du dépôt à auditer

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 1 |
| **Statut** | ⏳ EN ATTENTE DE ROMAIN |

**Problème posé**
> L'application Tournoi R92 est reliée à un autre projet, le site vitrine `boutique-r92`, qui vit
> dans un **dépôt séparé** (non présent ici). Certains affichages publics existent des deux côtés.

**Décision proposée**
> L'industrialisation porte **uniquement** sur le dépôt `tournoi-r92`. Si l'audit révèle un risque
> qui concerne aussi `boutique-r92`, il est **signalé** dans `RISQUES.md`, mais non corrigé ici.

**Raison**
> Corriger à l'aveugle dans un dépôt qu'on ne peut pas lire est le meilleur moyen de casser quelque
> chose.

**Question à Romain** : veux-tu inclure `boutique-r92` dans le périmètre plus tard, et si oui,
peux-tu le rendre accessible ?
