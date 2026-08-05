# DÉCISIONS — Industrialisation de Tournoi R92

> Ce fichier existe pour répondre à une question que se posera toujours une nouvelle session (ou un
> développeur extérieur) : **« pourquoi est-ce fait comme ça ? »**
>
> Une décision non écrite ici est une décision perdue.

**Dernière mise à jour** : 2026-08-05 (session 7)

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

#### ⚠️ AMENDEMENT du 2026-08-04 — le paramètre est abandonné

Romain a précisé sa décision le jour même, en écartant le réglage que je recommandais :

> *« Au lieu de dire "on va paramétrer", on ajoute un bouton forfait en dessous de chaque équipe
> sur chaque match de la table de saisie des scores. Cela reste une victoire à mon sens, donc
> 3 points pour l'équipe présente, 0 pour celle qui est forfait. Quand on clique dessus il faut
> une double mise en garde. »*

**Ce qui change par rapport à la version initiale de D-011** :

| | Version initiale (ma proposition) | ✅ Version retenue (Romain) |
|---|---|---|
| Score attribué | **paramètre réglable** par l'organisateur | **aucun score** — le match n'a pas de score |
| Points | 3 / 0 | 3 / 0 — **inchangé** |
| Déclenchement | non précisé | **un bouton « Forfait » sous chaque équipe**, sur chaque match de la page de saisie |
| Garde-fou | non précisé | **double mise en garde** avant validation |

**Pourquoi la version de Romain est meilleure que la mienne** : le paramètre que je proposais était
un piège. Un organisateur qui l'aurait réglé sur « 25-0 » aurait offert +25 de différence à une
équipe — or la différence sert à départager. Supprimer le réglage supprime le piège. Une règle
fixe, sans score, ne peut fausser aucun classement.

**Compléments techniques proposés en retour et ✅ ACCEPTÉS par Romain le 2026-08-04**
*(détail dans `AUDIT.md` §A.2, point 8)* : le forfait doit être **annulable**, le cas des **deux
équipes absentes** doit être prévu, la deuxième mise en garde doit **afficher la conséquence**
plutôt que répéter la question, l'affichage doit dire « Forfait » et **jamais « 0-0 »**, un match
forfait doit **débloquer** la génération de l'après-midi, et le geste reste protégé par la **clé
scores** (jamais la clé admin, qui ne doit pas circuler au bord d'un terrain).

**La règle métier de R-001 est donc entièrement fixée.** Il ne reste que l'écriture du code, à
l'ÉTAPE 5.

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

### D-013 — Comment ajuster le planning en cours de journée

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ✅ **VALIDÉE PAR ROMAIN** (2026-08-04) |
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
| **Statut** | ✅ **VALIDÉE PAR ROMAIN** (2026-08-04) |
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


### D-015 — Le match annulé (l'orage), distinct du forfait

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 5 |
| **Statut** | ✅ **VALIDÉE PAR ROMAIN** (2026-08-04) — **sous réserve d'une règle FFR contraire** |
| **Couvre** | R-013 |

**Demande de Romain**
> *« Match annulé, j'attends une suggestion de ta part. Je ne sais pas si la FFR met des
> recommandations là-dessus ou si un règlement existe sur le sujet. »*

**Réponse à la question FFR : INCONNU**
> J'ai cherché dans `AUDIT-TOURNOI-R92.md` (l'audit de conformité FFR du dépôt, ~129 000
> caractères) : **il ne contient rien** sur le forfait, l'annulation, les intempéries ou le report
> d'un match. Aucun des 25 points de vérification FFR (Q11 → Q25) ne porte sur le sujet.
> **Je ne sais donc pas ce que la FFR prescrit, et je ne l'inventerai pas.** *(CLAUDE.md §9 et §10.)*

**Question à router vers le chantier FFR** (décision D-003 : les deux chantiers restent séparés,
c'est donc à Romain de la porter là-bas, pas à moi de modifier ce document) :

> *« La FFR encadre-t-elle le sort d'un match d'École de Rugby qui n'a pas pu se jouer — forfait
> d'une équipe, ou annulation pour intempéries ? Existe-t-il une règle de classement imposée
> (points attribués, match à rejouer, match neutralisé) ? »*
> **Destinataire suggéré** : Directeur EDR du Racing / Comité 92 — les mêmes qui ont répondu à Q23.

**Ma proposition, conçue pour rester valable quelle que soit la réponse FFR**

> **Le même mécanisme que le forfait, avec un libellé différent.** Un match annulé **ne compte pour
> personne** : 0 point pour les deux équipes, aucun point marqué ni encaissé, et il **ne bloque
> pas** la génération de l'après-midi.
>
> Techniquement, c'est le résultat d'un « double forfait » — mais le mot compte : un forfait
> **désigne un fautif**, une annulation **n'accuse personne**. Deux libellés, un seul mécanisme :
> une fois le forfait construit (D-011), l'annulation ne coûte presque rien.

**La limite que je signale honnêtement**
> Si **certains** matchs seulement sont annulés, les équipes n'auront pas joué le même nombre de
> matchs, et comparer leurs totaux de points devient inéquitable. Deux options :
> - **accepter, et le rendre visible** — le classement affiche déjà la colonne « J » (matchs
>   joués) : l'inégalité se voit ;
> - classer à la **moyenne de points par match joué** — plus juste sur le papier, mais cela change
>   le classement de **tout le monde**, y compris quand rien n'est annulé, et devient difficile à
>   expliquer à un éducateur.
>
> **Je recommande la première.** Raison de terrain : dans le cas réel — l'orage — ce n'est pas un
> match qui saute, c'est **toute la journée en même temps**. Toutes les équipes sont alors touchées
> également, et l'inégalité ne se produit pas. Changer le cœur du classement pour un cas qui ne se
> présente presque jamais serait exactement l'« optimisation prématurée » que `CLAUDE.md` §6.F
> interdit.

**Où mettre le bouton**
> À côté du bouton « Forfait », sur le match, pour le cas isolé. Le cas de masse (l'orage qui
> arrête tout) est un besoin **d'organisateur**, pas de marqueur : il rejoint la famille d'outils
> de **D-013** (agir sur plusieurs matchs d'un coup) et gagnerait à être traité avec elle.

---


### D-016 — Corriger le P0 (R-014) tout de suite, hors de l'ordre du chantier

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 6 |
| **Statut** | ✅ **VALIDÉE** — option **(b)** retenue par Romain |

**Problème posé**
> L'audit de sécurité a trouvé **un problème P0** : `mesureSponsors`, la seule porte de
> l'application ouverte **sans mot de passe**, n'avait **aucune limite** — ni par appareil, ni par
> minute, ni par jour. Chaque envoi ajoutait une ligne au classeur, et rien ne les efface.
> N'importe qui pouvait donc **remplir le classeur** (limite Google : 10 millions de cases) et,
> ce faisant, **empêcher la saisie des scores le jour du tournoi**. Détail : `AUDIT.md` §C.2.

**La règle du chantier**
> `CLAUDE.md` §7 : l'ÉTAPE 2 est un **audit**, on ne modifie rien ; les corrections viennent à
> l'ÉTAPE 5, après les 8 audits. Trois options ont été présentées : **(a)** attendre ;
> **(b)** corriger R-014 seul ; **(c)** corriger aussi R-015 et R-016.

**Décision de Romain**, le 2026-08-04
> **(b)** — *« va pour B alors je te suis dans ton raisonnement »*. Exception ciblée : R-014 est
> corrigé seul, dans une modification isolée, puis les audits reprennent où ils s'étaient arrêtés.

**Pourquoi (b) et pas (c)**
> R-015 et R-016 touchent à des boutons réellement utilisés (regénérer les poules, réinitialiser).
> Les corriger demande de **vérifier qu'on n'empêche pas Romain de travailler** — donc du temps,
> donc pas dans la précipitation. Ils restent au statut **IDENTIFIÉ** et reviendront à l'ÉTAPE 3.

**Ce qui a été fait** *(commit `c1948fc`)*
> Trois plafonds sur cette seule porte : un **plafond dur** sur la taille de l'onglet `Mesures`
> (déterministe, c'est lui qui protège vraiment), et deux **plafonds de débit** (global et par
> appareil) vérifiés **avant** d'ouvrir le classeur, pour qu'une requête refusée coûte presque
> rien. 9 tests ajoutés.

**Portée réelle, dite sans exagération**
> Cela supprime le **dégât durable** (le classeur rempli) et rend l'abus beaucoup plus coûteux.
> Cela ne rend **pas** l'adresse immunisée contre un envoi massif : Apps Script ne fournit pas
> l'adresse du visiteur, on ne peut donc pas distinguer un abuseur d'un spectateur. Ce qui est
> visé, et atteint : **un abus n'empêche plus jamais la saisie des scores.**

**✅ Correction déployée et vérifiée le 2026-08-04.** Romain a redéployé le backend chez Google,
lancé `lancerTestsFFR` (**573/573 OK**) et rejoué le diagnostic « Tester la remontée » (écriture,
relecture, 109 relevés). R-014 passe au statut **TESTÉ** — le premier du chantier. *(Précision du 2026-08-05 : ces 109 relevés viennent des appareils de Romain, pas de spectateurs. La preuve de non-régression reste entière — des relevés ont bien été écrits puis relus.)*
La règle permanente de `CLAUDE.md` §13.6 est donc satisfaite ici : ce n'est pas le dépôt qui le
dit, c'est une vérification faite en production.

---

### D-017 — Les deux clés doivent être remplacées par des suites aléatoires

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Session** | 6 |
| **Statut** | ⏳ **EN ATTENTE** — action de Romain, aucun code à écrire |

**Ce qui a été appris**
> Romain, le 2026-08-04 : *« pour les MDP c'est moi qui ai choisi ce sont des mots »*.
> Cela **lève l'inconnue I-12** — et cela **change la gravité de R-019**.

**Pourquoi c'est important**
> Le garde-fou anti-devinette laisse passer de l'ordre de **8 600 essais par jour** (30 essais
> toutes les 5 minutes). Ce chiffre ne casse **jamais** une suite tirée au hasard. Il peut casser
> **des mots** : un dictionnaire français courant tient en quelques dizaines de milliers d'entrées,
> et les combinaisons de deux mots familiers d'un club de rugby se comptent en milliers.
>
> Et la porte est trouvable : l'adresse du serveur est publiquement lisible dans le code du site.
> La clé ADMIN, elle, ouvre **tout** — effacer les scores, réinitialiser le tournoi, lire le
> carnet d'adresses, envoyer des courriels sous l'adresse du propriétaire.

**Ce que je propose**
> **Remplacer les deux clés par des suites aléatoires** (par exemple 24 caractères tirés par un
> gestionnaire de mots de passe), via le menu **« Tournoi R92 → Configurer les clés »** du
> classeur. Aucune ligne de code à écrire.
>
> **Conséquence pratique** : ces clés ne se retiennent plus par cœur. Il faut donc décider **où
> elles sont rangées** (gestionnaire de mots de passe, ou note protégée) et **comment la clé
> SCORES est transmise aux bénévoles le jour J**. C'est un changement d'habitude, pas un
> changement d'outil — et c'est la vraie question à trancher.

**Effet sur l'audit**
> Si c'est fait : **R-019 redevient théorique** et retombe en P2. Tant que ce n'est pas fait,
> R-019 est classé **P1** — voir `RISQUES.md`.

---

### D-021 — Phase prototype : tout appartient à Romain, et c'est assumé

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ✅ **VALIDÉE** par Romain le 2026-08-05 |
| **Décidée par** | Romain |
| **Répond à** | I-14 (partiellement), R-039, R-040 |

**Problème posé**
> Le domaine B a demandé **qui est responsable** de ces données, et si le classeur devait rester
> dans un compte Google individuel. La réponse conditionne les textes d'information (D-018) et
> la continuité du projet.

**Décision prise — les mots de Romain**
> *« Dans cette phase de test tout est à moi. […] Tout est sur mes comptes donc tout cela
> m'appartient. »*
>
> Et sur l'avenir : *« aujourd'hui ça fonctionne avec mon classeur ; à terme, si cela doit
> devenir un SaaS, ce ne sera plus possible. Il faudra scinder tout ça. »*

**Ce que cela établit**
> 1. **En phase prototype, il n'y a pas de sujet de responsabilité partagée** : le classeur, le
>    Drive, la boîte d'envoi, les données de test et les 109 relevés de mesure sont tous à
>    Romain, sur ses propres comptes, et ne concernent que lui et son épouse. **Le compte
>    individuel est le bon choix pour un prototype** — le changer maintenant serait du travail
>    sans bénéficiaire.
> 2. **La question du responsable n'est donc pas bloquante aujourd'hui.** Elle le redevient au
>    **déclencheur** (voir D-022) : le jour où les données d'un tiers entrent, il faudra nommer
>    une structure. La piste déjà écrite dans le dépôt reste l'**association Génération R92**,
>    désignée comme telle dans le modèle d'autorisation de droit à l'image.
> 3. **R-040 (P3) est confirmé par Romain lui-même**, et c'est important : le passage en SaaS
>    n'est pas seulement un sujet de contrat, c'est un sujet **d'architecture**. Un classeur
>    unique ne peut pas héberger plusieurs clubs.

**Conséquences**
> - **Rien ne change maintenant.** Aucun compte à créer, aucun classeur à déplacer.
> - **I-14 reste ouverte, mais dégradée** : ce n'est plus une inconnue bloquante, c'est une
>   question à reposer au déclencheur.
> - **R-039 (aucun cadre écrit) reste P2**, mais sa partie « qui est responsable » a une réponse
>   claire pour la phase actuelle : Romain.

---

### D-022 — Le déclencheur : ce qui fait basculer le prototype en usage réel

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ✅ **VALIDÉE** par Romain le 2026-08-05 |
| **Décidée par** | Romain — proposition de Claude, validée sans réserve |

**Problème posé**
> La question posée était : *« quand invites-tu de vrais clubs ? »* Réponse de Romain, le
> 2026-08-05 : *« je ne sais pas, c'est juste sincère. Je suis sur un prototype de démo. Je ne
> sais même pas si celui-ci, même après la phase d'industrialisation, trouvera son public. »*
>
> C'est une réponse honnête et utile — mais elle laisse le chantier sans repère : on ne sait pas
> quand les problèmes théoriques deviennent réels.

**Décision proposée — remplacer la date par un signal**
> **Le jour où l'adresse email d'une personne qui n'est ni Romain ni son épouse entre dans le
> classeur, les trois P1 du domaine B (R-028, R-029, R-030) doivent être réglés — avant, pas
> après.**
>
> Traduction pratique : **tout est permis avec ce prototype, sauf saisir les coordonnées d'un
> vrai contact de club.**

**Raison**
> Une date, Romain ne l'a pas, et ne l'aura probablement pas à l'avance : un prototype ne bascule
> pas à une date, il bascule un jour où quelqu'un dit « on le fait ». Un **déclencheur** ne se
> périme pas, ne peut pas être raté, et se déclenche **exactement** au moment où le risque
> apparaît.
>
> Le vrai danger n'est pas l'oubli, c'est le **glissement** : l'outil est montré, quelqu'un dit
> « on le prend pour le tournoi de mars », et le prototype devient la production sans que
> personne ne l'ait décidé. Ce déclencheur rend ce moment **visible**.

**Ce que le déclencheur commande, le jour venu**
> 1. les trois P1 du domaine B (R-028, R-029, R-030) ;
> 2. le remplacement des deux clés par des suites aléatoires (D-017, R-019) ;
> 3. la désignation d'une structure responsable et le passage à un compte de l'association
>    (D-021, R-039).

**Conséquence tant qu'il n'est pas atteint**
> **Aucune exception à l'ordre du chantier.** On finit les 8 audits, puis le plan, puis les
> corrections. `CLAUDE.md` §7 s'applique sans aménagement.

---

### D-023 — Les trois décisions du domaine B sont reportées à la fin des audits

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ✅ **VALIDÉE** par Romain le 2026-08-05 |
| **Décidée par** | Romain |
| **Porte sur** | D-018, D-019, D-020 |

**Problème posé**
> Les trois décisions du domaine B ne demandent aucune ligne de code, ce qui rendait tentant de
> les prendre tout de suite. Fallait-il ?

**Décision prise — les mots de Romain**
> *« Oui après me semble juste, mais le souci c'est que je n'ai pas encore réfléchi à
> l'hébergement, je n'ai pas encore réfléchi au stockage ni à la conservation des données. »*

**Décision**
> **D-018, D-019 et D-020 sont prises à la fin des 8 audits**, au moment de l'ÉTAPE 3, et non
> pendant l'ÉTAPE 2. Elles restent au statut ⏳ EN ATTENTE.

**Raison**
> Trois raisons, dans l'ordre d'importance :
> 1. **Rien ne presse plus.** `D-022` (le déclencheur) garantit qu'on ne ratera pas le moment où
>    ces décisions deviennent nécessaires, et `R-029` est **suspendu** depuis la désactivation
>    des partenaires. Il n'y a plus aucune horloge qui tourne.
> 2. **C'est l'ordre validé** (`D-010`, `CLAUDE.md` §7). Prendre ces décisions maintenant serait
>    un écart, et il n'y a plus d'urgence pour le justifier.
> 3. **Romain n'a pas les éléments, et il le dit.** Le forcer à décider produirait des décisions
>    de façade, qu'il faudrait défaire.

**⚠️ Ce qu'il faut dissiper, parce que c'est la raison invoquée**
> Romain lie ces décisions à l'**hébergement** et au **stockage**. **Ce lien n'existe pas**, et
> c'est important qu'il soit écrit noir sur blanc pour les sessions suivantes :
>
> | Mot | Ce que c'est | Est-ce décidé ? |
> |---|---|---|
> | **Hébergement** | *Où* le code tourne et où les fichiers vivent | ✅ **Déjà tranché de fait** : Google Apps Script + Google Drive + Gmail pour le serveur et les fichiers, GitHub Pages pour les pages. Ça fonctionne, et `CLAUDE.md` §10 interdit d'en changer sans justification |
> | **Stockage** | *Dans quoi* les données sont rangées | ✅ **Déjà tranché de fait** : le Google Sheet, 12 onglets (cartographie, volet C) |
> | **Conservation** | *Combien de temps* on garde | ❌ **Jamais décidé** — c'est `D-020`, et c'est le seul des trois qui reste ouvert |
>
> **La durée de conservation ne dépend ni de l'hébergement ni du stockage.** « On garde les
> coordonnées d'un contact de club trois éditions » est une phrase **également vraie** dans un
> Google Sheet, dans une base de données, ou dans un cahier à spirale. C'est une décision
> **métier**, que Romain peut prendre sans avoir rien tranché d'autre.
>
> Ce qui dépend vraiment de l'hébergement, c'est la capacité à **appliquer** la durée
> automatiquement — pas à la **décider**.

**Conséquences**
> - L'ÉTAPE 2 continue : domaine D (tests) en session 8, puis E, F, G, H ;
> - `D-018`, `D-019`, `D-020` sont reprises **au début de l'ÉTAPE 3**, avec les 40 problèmes sous
>   les yeux — ce qui est d'ailleurs le meilleur moment pour les prendre ;
> - **Aucune réflexion sur l'hébergement n'est attendue de Romain.** Le sujet appartient au
>   domaine **G (architecture)** et à `R-040` (le SaaS, P3), et il est **prématuré** tant que
>   l'application cherche son public.

---

### D-024 — Tous les points en suspens sont traités à l'issue de l'ensemble des audits

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ✅ **VALIDÉE** par Romain le 2026-08-05 |
| **Décidée par** | Romain |
| **Généralise** | D-023 (qui ne portait que sur le domaine B) |

**Décision prise — les mots de Romain**
> *« Ok on garde les questions, les éléments en suspens à l'issue de l'ensemble de l'audit […]
> comme ça on pourra les traiter une par une, de manière détaillée. »*

**Décision**
> **Aucune question, décision ou inconnue soulevée par un audit n'est tranchée pendant
> l'ÉTAPE 2.** Tout est **accumulé**, puis repris **une par une** au début de l'ÉTAPE 3, quand
> les 8 domaines auront parlé.
>
> Pour que rien ne se perde, un **registre unique** est tenu dans `ETAT.md` §10 — « points en
> suspens » — mis à jour à la fin de chaque session d'audit.

**Raison**
> 1. **Une décision prise trop tôt est prise avec moins d'information.** Le domaine B en a déjà
>    donné la preuve : `R-032` (les effectifs d'enfants publics) se referme **tout seul** en
>    corrigeant `R-021`, trouvé au domaine sécurité la session d'avant. Décider séparément aurait
>    fait modifier deux fois le même fichier.
> 2. **C'est l'ordre validé** (`D-010`, `CLAUDE.md` §7) : audit → plan → validation.
> 3. **Cela protège la qualité des réponses.** Traitées une par une, en fin de parcours, avec le
>    temps qu'il faut — plutôt qu'au fil de l'eau, en fin de session, quand l'attention baisse.

**⚠️ Trois exceptions, à conserver**
> 1. **`D-017` n'est pas une question, c'est une action.** Remplacer les deux clés par des suites
>    aléatoires prend cinq minutes, ne demande aucune réflexion et referme `R-019` (P1). **Ne pas
>    la mettre en attente.**
> 2. **Les questions SORTANTES partent maintenant.** `I-10` (la FFR encadre-t-elle un match non
>    joué ?) et `I-15` (le droit à l'image est-il géré ailleurs ?) s'adressent à des tiers — le
>    Comité 92, le Directeur EDR, le club. **Le délai de réponse ne dépend pas de nous** : les
>    poser tôt ne coûte rien et peut faire gagner des semaines. Les garder en réserve ne
>    protégerait rien.
> 3. **Un P0 casse la règle.** Si un audit à venir trouve un problème bloquant, il sera présenté
>    **immédiatement**, comme `R-014` l'a été (précédent `D-016`). Un P0 ne se met pas en file
>    d'attente.

**Conséquences**
> - L'ÉTAPE 2 se déroule sans interruption : domaines **D → E → F → G → H** ;
> - chaque session d'audit **alimente** le registre `ETAT.md` §10, sans rien trancher ;
> - l'**ÉTAPE 3 s'ouvrira par une série de séances de décision**, une question à la fois.

---

## DÉCISIONS EN ATTENTE DE ROMAIN

### D-018 — Que dit-on aux personnes dont on garde les informations ?

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ⏳ EN ATTENTE DE ROMAIN |
| **Débloque** | R-028 (P1) |

**Problème posé**
> Il n'existe, dans **aucune** page, **aucun** courriel et **aucune** ligne du serveur, une seule
> phrase qui explique aux gens ce qu'on fait de leurs informations. J'ai cherché les mots *RGPD*,
> *confidentialité*, *données personnelles*, *mentions légales*, *consentement* : **zéro
> occurrence**. C'est l'obligation la plus élémentaire du RGPD, et la plus visible de l'extérieur.

**Ce qu'il faut écrire — trois textes courts**
> 1. un **paragraphe en bas du courriel d'invitation** : qui organise, ce qu'on garde (nom,
>    prénom, email du contact ; effectifs déclarés), pourquoi, combien de temps, et à qui écrire
>    pour être retiré ou corrigé ;
> 2. **le même bloc en bas de la page de réponse**, là où le club saisit ses effectifs ;
> 3. **une petite page « Vos données »** sur le site public, vers laquelle les deux autres
>    pointent — elle sert aussi aux spectateurs (voir D-019).

**Question à Romain**
> **Valides-tu que j'en rédige une première version, que tu relis, corriges et fais valider par
> le club ?**
>
> Je ne peux pas les écrire seul et les considérer comme acquis : **ils engagent l'association,
> pas moi.** Et deux informations me manquent, que toi seul as : **qui est officiellement
> responsable** (l'association Génération R92 ? le Racing 92 ?) et **quelle adresse de contact**
> y faire figurer (voir R-038 et R-039).

**Recommandation**
> **Oui, et maintenant.** Le coût est de rédiger trois paragraphes. Après la première vague
> d'invitations réelles, il faudra en plus **revenir vers des gens à qui on aura déjà écrit**.

---

### D-019 — Que fait-on de la mesure de visibilité des partenaires ?

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ⏳ EN ATTENTE DE ROMAIN |
| **Débloque** | R-029 (P1) |

**Problème posé**
> La page publique des scores **écrit un identifiant sur le téléphone de chaque spectateur** (dans
> la mémoire longue du navigateur), compte le temps d'affichage de chaque logo de partenaire par
> tranche de 30 minutes, et **remonte tout cela au serveur**. Sans un mot d'explication, et sans
> aucun moyen de refuser. **C'est le seul problème du domaine B qui tourne déjà en vrai** : le
> classeur contient 109 relevés — **venant des propres appareils de Romain** (précision du 2026-08-05),
> pas de spectateurs. **Et les partenaires ont été désactivés le 2026-08-05**, ce qui coupe la mesure :
> le risque est **suspendu**, pas réglé. Il se rallume avec l'interrupteur.
>
> La règle française ne parle pas seulement de données personnelles : **déposer quelque chose sur
> l'appareil de quelqu'un demande son accord**, sauf si c'est strictement nécessaire au service
> qu'il a demandé. Or le spectateur a demandé **les scores** — pas à prouver à un partenaire
> commercial combien de temps son logo a été vu.

**Trois voies**
> **(a) Informer, sans bandeau** — une ligne visible en bas de la page publique, l'explication
> dans la page « Vos données », et un moyen simple de dire non, mémorisé sur l'appareil.
> Tout est conservé, rien n'est dégradé.
>
> **(b) Informer + demander l'accord** — un vrai bandeau « accepter / refuser » au premier
> chargement. Position la plus sûre, mais **un bandeau devant les scores**, sur un terrain, sous
> la pluie, en 30 secondes : c'est exactement ce que `CLAUDE.md` §11 interdit de dégrader. Et la
> mesure devient incomplète.
>
> **(c) Alléger la mesure** — supprimer l'identifiant d'appareil et ne compter que des totaux. Le
> sujet se referme presque entièrement, mais on perd la **portée** (combien de personnes
> différentes) — le chiffre qu'un partenaire regarde en premier.

**Recommandation**
> **(a).** C'est le seul qui améliore réellement la situation **sans rien casser**. Il transforme
> une collecte silencieuse en collecte annoncée et refusable. Je ne recommande pas d'arrêter la
> mesure : elle est légitime, bien construite, et elle sert un besoin réel du club.

**Calendrier**
> **Avant le prochain tournoi réel**, et **avant** de présenter une fiche de visibilité à un
> partenaire payant.

---

### D-020 — Combien de temps garde-t-on quoi ?

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 |
| **Statut** | ⏳ EN ATTENTE DE ROMAIN |
| **Débloque** | R-030 (P1), R-031, R-033, R-034 |

**Problème posé**
> **Rien ne s'efface jamais tout seul.** Il n'existe dans le code aucune durée de conservation,
> aucune purge, aucune date d'expiration. Le carnet d'adresses est même conservé **délibérément**
> d'une édition à l'autre — ce qui est un choix défendable, mais **sans limite**, ce qui ne l'est
> pas. Ce n'est pas un choix contestable : c'est un **choix qui n'a jamais été fait**.

**Proposition de départ, à valider ou à corriger**

| Donnée | Durée proposée | Pourquoi |
|---|---|---|
| Contacts des clubs (carnet) | **3 éditions** sans participation, puis suppression | Un club absent depuis 3 ans n'a plus de lien avec le tournoi |
| Effectifs déclarés d'une édition | **Effacés à la réinitialisation** | Ils ne servent qu'à l'édition en cours (R-033) |
| Contacts de la demande FFR (représentant, président, **médecin**, secours) | **1 an**, ou à chaque réinitialisation | Ce sont les dirigeants de l'année — et un contact de secours doit être **à jour** |
| Champ libre « équipes étrangères » | **Effacé après envoi du dossier** | Seul endroit où des enfants sont nommés (R-034) |
| Relevés de visibilité (`Mesures`) | **Effacés après remise de la fiche au partenaire** | Aucun usage ensuite |
| Journal de saison (`Historique`) | **Conservé** | **Aucune donnée personnelle** — noms d'équipes et scores |
| Copies de courriels (Gmail) | **1 an** | Nettoyage manuel de la boîte |

**Question à Romain**
> **Ce tableau te convient-il ?** Corrige les durées qui te paraissent fausses : c'est **ton**
> métier qui décide, pas la technique. Une seule règle : chaque ligne doit avoir une durée, même
> longue, même « conservé ».

**Ce que cela déclenche — et ce que cela ne déclenche PAS**
> **Écrire les durées ne touche à aucun code.** L'outillage (un écran qui signale ce qui est
> périmé) vient **après**, à l'ÉTAPE 3, et avec une consigne ferme : **toute suppression reste
> déclenchée par un humain.** Un outil qui efface tout seul est le type de code le plus dangereux
> du projet — le domaine C l'a déjà montré avec la réinitialisation (R-016).

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
