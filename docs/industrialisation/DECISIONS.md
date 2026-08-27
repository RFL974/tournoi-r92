# DÉCISIONS — Industrialisation de Tournoi R92

> Ce fichier existe pour répondre à une question que se posera toujours une nouvelle session (ou un
> développeur extérieur) : **« pourquoi est-ce fait comme ça ? »**
>
> Une décision non écrite ici est une décision perdue.

**Dernière mise à jour** : 2026-08-27 *(session 32, suite)* — ⚡ **D-059 EST COMPLÉTÉE**, et non
remplacée : migration structurelle **uniquement explicite** · aucun déclenchement à l'écriture ·
migration terminée reconnue par une **marque**, ⛔ jamais par un rematching de nom · snapshots
figés au **premier envoi principal réussi** · distinction migration legacy **avec / sans preuve
d'invitation**. ⚠️ **Trois de ces points corrigent un défaut RÉEL du code**, pas une imprécision
de rédaction.

*Rappel de la mise à jour précédente* — 2026-08-27 *(session 32)* — 🆕 **D-059 — B2-2 : CE QUI PROUVE UNE
PARTICIPATION, CE QUI LA CRÉE, ET POURQUOI RETIRER UN CLUB NE L'EFFACE PAS.** Arbitrages donnés
par Romain le 2026-08-27, **avant** implémentation de la passe locale de B2-2.

*Rappel de la mise à jour précédente* — 2026-08-26 *(suite 6)* — 🏁 **D-056 — LE CRITÈRE DE CLÔTURE DE M1-PUB
EST CORRIGÉ, PAS CONTOURNÉ : L'APERÇU N'EST PAS REMPLACÉ, IL EST SUPPRIMÉ.** Décision prise par
Romain le 2026-08-26, à la mise en œuvre de PUB-5 / M9, puis appliquée à la clôture du chantier.

*Rappel de la mise à jour précédente* — 2026-08-26 *(suite 5)* — 🏁 **D-055 — LA CLÔTURE DE PUB-4 : R-097 ET
R-098 SONT FERMÉS, LA RÉSERVE DE LA CONDITION 5 RESTE ÉCRITE, ET M9 PASSE À PUB-5.** Décision prise
par Romain le 2026-08-26 au vu du rapport technique de PUB-4.

*Rappel de la mise à jour précédente* — 2026-08-26 *(suite 4)* — 🌐 **D-054 — LES QUATRE ARBITRAGES QUI OUVRENT
PUB-4**, pris à la clôture de **M1-PUB / PUB-3**. ① **`boutique-r92` modifiable UNIQUEMENT dans
PUB-4 et pour le découplage**, sur **branche dédiée**, ⛔ sans fusion ni déploiement sans
autorisation après diff et contrôles. ② **L'association garde le droit d'annoncer manuellement son
tournoi** — ⭐ précision essentielle de **D-048** : l'automatisme est interdit, ⛔ **pas l'annonce** ;
⛔ PUB-4 ne fabrique aucune annonce fictive. ③ **`tournoi.html` de la vitrine est conservée**, en
page **statique et indépendante** renvoyant explicitement vers Maxilou — ⭐ *« le visiteur reste sur
le site de l'association tant qu'il ne choisit pas lui-même d'ouvrir Maxilou »*. ④ **Les preuves
reportées attendent que le découplage soit prouvé EN PRODUCTION**, puis une séquence contrôlée en
six temps finissant par un **masquage immédiat**. Le plan d'exécution :
[`M1-PUB-3-PLAN-DECOUPLAGE.md`](M1-PUB-3-PLAN-DECOUPLAGE.md).

*Rappel de la mise à jour précédente — 2026-08-26 (suite 3)* : 🌐 **D-053 — « UNE PREUVE PAR LE NAVIGATEUR
N'EXISTE QU'À L'ÉTAT FINAL »**, prise après le premier essai réel de **Playwright MCP** sur le Mac
de Romain. Elle autorise les preuves fonctionnelles **sur ordinateur** par navigateur piloté —
⛔ **session locale et Chrome visible uniquement** — maintient qu'une **preuve téléphone exige un
téléphone réel manipulé par Romain**, range les sorties dans **`.playwright-mcp/`** *(jamais
commitées)*, et pose la règle centrale : ⛔ **un état transitoire ne vaut jamais preuve**, l'attente
vise **un état final observable** et non un délai, ⚡ **y compris pour une ADRESSE**. Elle est
inscrite en **`CLAUDE.md` §8 octies**.

> ⚠️ **Au passage, un écart de tenue à signaler** *(**§8 septies**)* : ce bloc annonçait encore
> **D-049** alors que **D-050, D-051 et D-052** avaient été enregistrées depuis — la dernière le
> **2026-08-26**. Les trois fiches sont bien présentes et complètes ; **seul l'en-tête avait
> décroché.** Il est remis à jour ici, et les fiches ne sont pas retouchées.

*Rappel de la mise à jour précédente — 2026-08-24 (soir, suite 4)* : 🌐 **D-049 — « CONSOMMER UNE VALEUR
EXISTANTE N'EST PAS ADMINISTRER CETTE VALEUR »**, prise à l'ouverture du micro-lot **PUB-2**. Elle
tranche le chevauchement signalé par PUB-1 : ✅ **PUB-2 LIT `url_tournoi_public`** pour afficher,
copier et ouvrir l'adresse de la page publique ; ⛔ **il ne l'ÉCRIT PAS** — aucun champ, aucun écran
— et sa **configuration reste rattachée à R-096 / M1-D**. Elle pose aussi l'**invariant de la source
unique** : la règle de résolution vit dans **`urlPagePublique` (`frontend/js/commun.js`)**, et
**nulle part ailleurs**, parce que **deux** endroits présentent la **même** adresse — le **dossier
club** *(lien « Scores en direct » + QR code, usage antérieur à PUB-2)* et l'**administration**.

*Rappel de la mise à jour précédente — 2026-08-24 (soir)* : 📏 **DEUX DÉCISIONS DE MÉTHODE, ENTRE M1-A ET
M1-B.** **D-046** — ⭐ **un état ne devient vrai qu'APRÈS le geste** *(commit, fusion, poussée,
publication, redéploiement)*, et ⛔ **une trace historique ne se réécrit jamais** pour la rendre
conforme au présent : c'est la règle permanente **`CLAUDE.md` §8 septies**, née de **quatre états
faux en trois jours**. **D-047** — **M1-A est DÉFINITIVEMENT CLÔTURÉE** ; la lecture des deux URL du
classeur devient un **reliquat EXTERNE non bloquant**, tracé au `PLAN.md` **§15.8**, ⛔ **qui ne
déclenche pas M1-B**.

*Rappel de la mise à jour précédente — 2026-08-24* : 🏛️ **QUATRE DÉCISIONS OUVRENT LE CHANTIER M1** *(étape
**M1-A**)*. **D-042** — le **profil du club** : principe directeur, **7 familles**, et surtout le
**cycle de vie A/B/C** *(permanente ⇒ **lecture directe** · proposée ⇒ **copie volontaire, aucun lien
vivant** · événementielle ⇒ **aucun lien**)*, plus la règle qui interdit de fusionner un rôle
institutionnel et un rôle événementiel. **D-043** — les **36 `org_*`** : **10 survivent, 26 sont
vidés** *(+ les récompenses)* ; ⚠️ **la réinitialisation les conserve TOUS aujourd'hui** — correction
en **M1-B**, ⛔ **non faite**. **D-044** — profil ≠ **répertoire de tiers**, logo ≠ **charte
graphique**. **D-045** — **fidélité aux libellés officiels** du formulaire FFR, et **nom officiel ≠
nom d'usage** *(⛔ interdiction absolue du nom d'usage dans une démarche réglementaire)*.

*Rappel de la mise à jour précédente — 2026-08-19 (soir)* : ⚡ **D-037** : **l'arbitrage de R-092 et R-093**,
les deux derniers problèmes du registre sans rattachement. **R-092 rejoint C-015** · **R-093 devient
le chantier C-031** *(périmètre : au minimum `Matchs` **et** `Equipes`)* · une **règle de protection
provisoire** est inscrite dans C-015 · **C-015 reste le prochain chantier à ouvrir**.

*Rappel de la mise à jour précédente — 2026-08-19* : (🏛️ **D-036** — le **découpage en 6 lots** de la remise à
niveau documentaire : les lots 1 à 3 **constatés**, les lots 4 à 6 **décidés par le propriétaire** ;
inscrit dans `PLAN.md` **§13**. ⚡ **D-035** — le `CHANGELOG` rejoint la règle de la carte **§8 bis**.
⚡ **D-034** — `COUPE_PLATEAU` reste **proposé mais signalé**, ce qui **remplace** la doctrine
« non proposé, conservé pour l'existant », désormais **périmée**)

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

### D-026 — Mieux vaut faire attendre que ne pas délivrer

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 10 |
| **Statut** | ✅ **VALIDÉE** par Romain le 2026-08-05 |
| **Décidée par** | Romain, **spontanément** (aucune question ne le lui demandait) |
| **Porte sur** | Tous les arbitrages entre **fraîcheur** et **fiabilité** — R-061, R-064, et le futur réglage du rafraîchissement |

**Décision prise — les mots de Romain**
> *« Le temps d'attente est souvent une friction pour les gens, et tu sais quoi : même s'ils
> doivent attendre un peu avant de recevoir le résultat, la finalité c'est qu'ils l'obtiennent. »*

**Décision**
> Quand il faut choisir entre **des scores très frais** et **la certitude que chacun finira par
> les obtenir**, on choisit **la certitude**.
>
> Concrètement : **allonger le délai de rafraîchissement est un geste acceptable**, y compris
> jusqu'à 30 ou 60 secondes, si cela évite qu'une partie du public ne reçoive rien du tout un
> jour d'affluence.

**Raison**
> 1. **Elle règle un arbitrage que la technique ne peut pas trancher.** Le domaine F a montré que
>    capacité et fraîcheur sont directement liées : doubler le délai double le nombre de personnes
>    servies (**§F.9**). Choisir entre les deux est un **choix de service**, pas un choix
>    technique — il appartenait à Romain, et il l'a pris sans qu'on le lui demande.
> 2. **Elle est cohérente avec `CLAUDE.md` §11**, qui place la **fiabilité** (n° 2) avant
>    l'**expérience utilisateur** (n° 5) et la **performance** (n° 7).
> 3. **Un score en retard de 30 secondes reste juste. Un score qui n'arrive pas ne l'est pas.**

**⚠️ Conséquence que cette décision NE doit PAS avoir**
> **Accepter l'attente n'autorise pas le silence — au contraire, cela l'interdit.**
>
> Si l'application fait attendre volontairement, elle doit **d'autant plus dire qu'elle
> travaille**. Sans cela, une attente voulue devient indistinguable d'une panne, et le bénévole
> ou le parent reclique — ce qui **aggrave** la charge qu'on cherchait justement à réduire.
>
> **D-026 renforce donc R-051, R-052, R-053 et R-069** (les quatre problèmes « l'écran ne dit
> rien ») au lieu de les affaiblir. Ils deviennent le **préalable** de tout allongement de délai,
> pas son complément.

**Ce que ça change**
> - **R-064** (porter le rafraîchissement de 15 s à 30 s) passe d'une proposition technique à une
>   proposition **conforme à une doctrine validée** ;
> - **R-061** (le relais) reste P1 mais **cesse d'être le premier geste** : la doctrine ouvre une
>   solution gratuite qui suffit dans la plupart des cas ;
> - tout futur arbitrage « plus rapide vs plus sûr » a désormais une **règle de tranchage écrite**.

---

### D-027 — L'attente est annoncée, jamais subie

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 10 |
| **Statut** | ✅ **VALIDÉE** par Romain le 2026-08-05 — **conception proposée par lui** |
| **Découle de** | D-026 (mieux vaut faire attendre que ne pas délivrer) |
| **Porte sur** | R-051, R-052, R-053, R-069 (l'écran ne dit rien) · R-064 (délai de rafraîchissement) · R-067 |

**Décision prise — les mots de Romain**
> *« On va faire ce qu'on fait dans les jeux vidéo : un écran avec une animation qui explique que
> ça charge et que les données vont arriver sous peu. […] informer du potentiel délai d'attente
> […] **sans donner de chiffre que certains prendraient pour comptant**. […] **on accepte mieux
> l'attente quand on a l'information**. Pour la partie bénévole […] une petite animation pour lui
> expliquer que son action est en train d'être prise en compte, puis l'animation change pour lui
> dire c'est ok, c'est tout bon. »*

**Décision**
> **Page publique** — un indicateur de chargement **animé**, qui explique que les données arrivent,
> et une **courte explication du délai possible, SANS aucun chiffre**.
>
> **Page de saisie** — une animation en **deux temps** : *« ton action est prise en compte »* →
> *« c'est bon »*. Et un effort d'**accélération** du délai, **en complément**.

**Raison**
> Une attente annoncée est **acceptée** ; la même attente, non annoncée, est lue comme une
> **panne**. C'est la réponse directe au « fil rouge » du domaine E : *le seul vrai défaut de
> conception est le silence*.

**⭐ Ce que la décision a de particulièrement juste : l'absence de chiffre**
> Un délai annoncé devient une **promesse**. « Environ 10 secondes » qui en prend 20 est **pire**
> que de n'avoir rien annoncé. Or **§F.9 a mesuré que 4 % des appels dépassent 10 secondes**,
> jusqu'à **19,5 s** : **aucun chiffre ne serait tenable**. L'intuition de Romain rejoint donc
> exactement ce que dit la mesure.

**✅ ARBITRAGES VALIDÉS PAR ROMAIN le 2026-08-05** — *« je vais suivre l'ensemble de tes
conseils »*. Les quatre réserves ci-dessous ne sont donc **plus des réserves** : elles font
**partie de la décision**. En particulier : **le délai retenu est 30 secondes, pas 60.**

*(détail en `AUDIT.md` §F.13)*
> 1. ✅ **DÉLAI RETENU : 30 SECONDES** *(et non 60)*. Allonger le délai réduit la charge de fond,
>    **pas le pic** : à la fin d'un match, les gens appuient sur « Rafraîchir » — tous en même
>    temps. À 30 s on capte l'essentiel du gain sans trop donner envie de cliquer. **60 s ne sera
>    envisagé que si une mesure réelle le justifie**, jamais par anticipation.
> 2. **Une animation ne doit JAMAIS mentir.** Une animation qui tourne indéfiniment après un échec
>    réseau serait **R-051 déguisé en interface soignée**. Toute animation doit avoir **trois
>    issues visibles** : *ça arrive* · *c'est arrivé* · **_ça n'a pas marché, voilà quoi faire_**.
> 3. **En CSS pur, jamais en image.** La page publique pèse 59 Ko, ce qui est excellent. Une
>    animation CSS coûte ~1 Ko ; un GIF ou une bibliothèque, cent fois plus.
> 4. **L'ordre des priorités s'inverse côté bénévole.** **60 % du temps d'une validation est un
>    démarrage incompressible** (§F.12) : une validation ne descendra jamais sous ~1,6 s. **On ne
>    peut pas supprimer l'attente, seulement la rendre lisible** — donc **l'animation est la
>    solution principale**, l'accélération le complément.

**Statut de mise en œuvre**
> ⏳ **Rien n'est implémenté** — nous sommes en **ÉTAPE 2 (audit)**. Cette conception sera reprise
> à l'**ÉTAPE 3**, où elle formera vraisemblablement un chantier unique avec R-051, R-052, R-053
> et R-069, qu'elle referme tous les quatre.

---

### D-028 — Le fichier serveur n'est PAS découpé tant que le dépôt chez Google est manuel

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 11 |
| **Statut** | ✅ **VALIDÉE par Romain le 2026-08-05** — *« la 2 »*, en réponse aux deux conseils du rapport de session |
| **Décidée par** | Romain |
| **Concerne** | **R-074** (P2) — et, par ricochet, **R-081** (P3), qui devient la **condition de réouverture** |

> ⚠️ **Première décision du chantier prise AVANT l'ÉTAPE 3, et il faut dire pourquoi ce n'est pas
> une entorse à D-024.** D-024 reporte les points en suspens parce qu'on ne veut pas décider à
> l'aveugle, sans avoir les autres problèmes sous les yeux. Ici, la décision est **de ne rien
> faire** : elle n'engage aucun travail, ne consomme aucun budget, et **ne peut donc pas être
> invalidée par un problème découvert plus tard** — au pire, un futur constat rouvrirait la
> question, ce que la décision prévoit explicitement. Une décision de statu quo ne coûte rien à
> prendre tôt.

**Problème posé**
> Tout le serveur tient dans **un seul fichier** : `backend/Code.gs`, **8 147 lignes**,
> **277 fonctions**. Google Apps Script accepte pourtant **plusieurs fichiers** dans un même
> projet — c'est donc un **choix**, pas une contrainte technique.
>
> Le fichier n'est pas en vrac (**26 bandeaux de section** le découpent), mais trois choses se
> paient : l'aiguillage des lectures et celui des écritures sont séparés par **2 470 lignes** ;
> la génération du planning est éclatée en **trois blocs non contigus** avec la *réinitialisation
> du tournoi* posée au milieu ; et la plus longue fonction fait **333 lignes**.

**Pourquoi c'est TA décision et pas la mienne**
> Parce que **c'est toi qui colles le code chez Google**. Un choix qui améliore le confort d'un
> développeur et qui, en échange, te fait répéter cinq fois un geste que tu fais une fois — ce
> n'est pas un arbitrage technique, c'est un arbitrage sur **ton temps** et sur **le risque
> d'oubli**.

**Les deux options, honnêtement**

| | Garder un seul fichier | Découper en 4 ou 5 |
|---|---|---|
| Ce que tu fais à chaque redéploiement | **1 collage** | **4 ou 5 collages** |
| Risque d'en oublier un | nul | **réel — et c'est exactement ce qui a produit M-04** |
| Confort pour s'y retrouver | correct (26 sections) | meilleur |
| Réversible ? | — | oui, mais le geste manuel reste |

**DÉCISION PRISE : GARDER UN SEUL FICHIER**
> Le confort gagné ne vaut pas le risque ajouté **sur le geste qui a déjà failli**. En session 6,
> un fichier oublié au collage a produit une preuve fausse restée six sessions au dossier
> (**M-04**). Multiplier par cinq le nombre de fichiers à coller multiplie par cinq les occasions
> de recommencer.
>
> **La question se rouvrira d'elle-même** si le dépôt du serveur devient un jour automatique
> (**R-081**, P3) : à ce moment-là, découper ne coûterait plus rien, et deviendrait la bonne idée.

**Ce qu'il ne faut PAS conclure de cette décision**
> Que le fichier est bien comme il est. Il est **trop long**, c'est constaté, et **R-074 reste
> ouvert au registre**. Simplement, la correction disponible aujourd'hui coûte plus cher que le
> problème — et `CLAUDE.md` §6.G l'annonce : *ne pas refactorer massivement pour obtenir une
> architecture théoriquement plus élégante*.
>
> ⚠️ **Et surtout : ce n'est pas un permis d'agrandir le fichier.** Décider de ne pas découper 8 147
> lignes n'autorise pas à en écrire 12 000. Toute session future qui ajouterait une fonctionnalité
> importante au serveur devra **poser la question à nouveau**, pas s'abriter derrière cette
> décision.

**Condition explicite de réouverture**
> **Le jour où le dépôt du serveur cesse d'être manuel** (**R-081**). C'est le seul événement qui
> renverse l'arbitrage : sans collage à répéter, le coût du découpage tombe à zéro et son bénéfice
> reste entier.
>
> Un second déclencheur, moins net mais réel : **si le fichier devenait difficile à modifier sans
> se tromper** — par exemple si une correction en cassait une autre à l'autre bout du fichier. Ce
> n'est **pas** le cas aujourd'hui (les 26 sections font leur travail, et les 589 vérifications
> attrapent les régressions).

**Ce que cette décision change pour la suite du chantier**
> - **R-074** passe de « à trancher » à **arbitré** : aucune session ne doit proposer de découper
>   `Code.gs` sans que la condition de réouverture ci-dessus soit remplie ;
> - **R-081** (P3) gagne un enjeu : ce n'est plus seulement « automatiser un geste », c'est aussi
>   **ce qui débloquerait R-074** ;
> - la ligne « ⛔️ ce qui NE doit PAS être groupé » de `PLAN.md` reste valable pour **R-076**,
>   **R-077** et **R-081**, qui n'ont pas été arbitrés.

---

### D-029 — L'industrialisation n'arrête pas les fonctionnalités : deux mesures s'appliquent tout de suite

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 11 |
| **Statut** | ✅ **VALIDÉE par Romain le 2026-08-05** — *« applique les deux »* · **APPLIQUÉE le jour même** |
| **Décidée par** | Romain |
| **Née de** | Une remarque de Romain : *« c'est une phase de pré-industrialisation, pas une fermeture totale des fonctionnalités de l'app — il y aura forcément des ajouts de code et de fonctionnalités »* |
| **Concerne** | **M-05**, et le calendrier de **R-072** et **R-073** |

**✅ CE QUI A ÉTÉ FAIT** *(2026-08-05, aucun fichier de l'application touché)*

| Mesure | Fichier | Contenu |
|---|---|---|
| **1 — La fiche de redéploiement est complète** | `docs/deploiement.md` | Le serveur est déclaré comme **deux** fichiers ; la fiche passe à **5 gestes** dont *« coller `Tests.gs` — le fichier qu'on oublie »* ; **contrôle par deux nombres** (bilan **589**, dernière ligne **3711**) avec ce qu'un écart signifie ; l'incident **M-04** est raconté en tête, pour que la raison de la fiche soit lisible |
| **2 — La carte se met à jour dans le même lot** | `CLAUDE.md` **§8 bis** *(nouvelle section)* | *« Une session qui ajoute un écran, une action serveur ou un onglet met la carte à jour DANS LE MÊME LOT — pas plus tard. »* Avec ce que la règle **ne demande pas**, pour qu'elle ne devienne pas une corvée |

> **Deux corrections de fait ont été faites au passage**, dans le document qu'on réécrivait : « crée
> les **5** onglets » → **7**, et la fonction **`assurerColonnePhase`** (supprimée depuis) →
> `assurerColonnesMatchs`. Réécrire un document en y laissant sciemment des affirmations fausses
> n'aurait eu aucun sens.

**⚠️ CE QUI RESTE DE R-072, ET QUI N'A PAS ÉTÉ FAIT**
> `Tests.gs` n'est toujours cité ni par `docs/passation.md`, ni par `backend/README.md`, ni par
> `README.md`. **C'est volontaire** : D-029 portait sur la **fiche de redéploiement**, pas sur
> l'ensemble de R-072. Le reste attend l'ÉTAPE 3, avec **R-073**. **R-072 n'est donc PAS refermé** —
> il est *désamorcé là où il se déclenchait*.

**⚠️ CE QUE CETTE DÉCISION N'AUTORISE PAS**
> **Aucune autre exception à D-024.** Toutes les corrections qui touchent au **code** — R-041,
> R-042, R-074, R-076, R-077, R-078, R-079 — attendent l'ÉTAPE 3. Le critère qui a justifié
> l'exception est **cumulatif** : aucun code touché **ET** un coût d'attente qui court à chaque
> livraison. Un problème qui ne remplit pas les deux ne passe pas.

**Problème posé**

> Le cadre de l'industrialisation est écrit comme si l'application était **stable** pendant qu'on
> l'audite : `CLAUDE.md` dit « ne rien modifier », **D-024** accumule tout jusqu'à l'ÉTAPE 3.
> **Rien ne dit ce qui se passe quand du code neuf arrive pendant ce temps.**
>
> Or c'est le cas, et c'est **normal** : le chantier fonctionnalités en est à sa **session 28**
> (PR #159, déployée le 2026-08-03, soit la veille du démarrage de l'industrialisation). Les deux
> chantiers sont vivants en parallèle, et Romain a raison de rappeler qu'il n'est pas question de
> geler l'application pendant des semaines pour finir un audit.

**Ce que ça change — et ce que ça ne change pas**

> ✅ **Ça ne remet pas en cause l'audit.** Un problème constaté le 2026-08-05 ne devient pas faux
> parce qu'on a ajouté du code après : il devient **plus grand**.
>
> ⚠️ **Ça remet en cause une chose : l'idée que TOUT peut attendre l'ÉTAPE 3 sans coût.** Pour la
> grande majorité des 81 problèmes, attendre ne coûte rien. Pour **deux** d'entre eux, attendre
> coûte — et le coût est **proportionnel au nombre de fonctionnalités livrées entre-temps**.

**Les deux exceptions demandées, et pourquoi ce sont les seules**

| | **R-072** — la procédure de redéploiement | **R-073** — la carte du projet |
|---|---|---|
| **Ce qu'on ferait** | Écrire la procédure **complète** : coller `Code.gs` **et** `Tests.gs`, lancer `lancerTestsFFR`, vérifier **deux nombres** (le total attendu et le nombre de lignes du fichier) | Poser la **règle** : un nouvel écran, une nouvelle action serveur ou un nouvel onglet ⇒ la carte est mise à jour **dans le même lot** |
| **Coût** | **~5 lignes de texte**, une fois | **Zéro**, sur une fonctionnalité qu'on écrit de toute façon |
| **Ce que ça touche** | `docs/deploiement.md` — **aucun code** | `README.md` / `docs/architecture.md` — **aucun code** |
| **Coût d'attendre** | **Chaque** fonctionnalité serveur = un redéploiement = **un nouveau tirage du piège M-04** | L'écart (**68 %** aujourd'hui) s'élargit à la vitesse du développement ; le rattrapage devient une session entière au lieu de deux minutes |
| **Réversible ?** | Oui — c'est du texte | Oui — c'est du texte |

> **Ce ne sont pas des corrections, ce sont des habitudes.** Elles ne réparent rien : elles
> empêchent la dette de **grossir** pendant qu'on finit l'audit. C'est précisément ce qui les
> distingue des 79 autres problèmes.

**Ma recommandation : OUI aux deux, et à rien d'autre**

> Ces deux-là rejoignent la courte liste des exceptions à **D-024** (aux côtés de D-017, des
> questions sortantes I-10/I-15, et d'un éventuel P0), **pour la même raison qui a justifié les
> autres** : ce sont des gestes **sans arbitrage et sans risque**, dont l'attente ne protège rien.
>
> ⚠️ **Et rien d'autre.** Toutes les corrections qui touchent au **code** — R-041, R-042, R-074,
> R-076, R-077, R-078, R-079 — **attendent l'ÉTAPE 3**, sans exception. Un audit qui commence à
> corriger au fil de l'eau n'est plus un audit.

**Ce qui découle de cette décision, quelle qu'elle soit**

> **Trois règles à appliquer dans tous les cas**, parce qu'elles ne dépendent d'aucun arbitrage :
>
> 1. **Toute mesure inscrite au dossier porte sa date** et la mention qu'elle vaut à cet instant.
>    « 8 147 lignes » est vrai **au 2026-08-05**, pas éternellement.
> 2. **Une fonctionnalité importante rouvre les chiffres du domaine G** qu'elle change — c'est déjà
>    le garde-fou n° 2 de **D-028** (« ce n'est pas un permis d'agrandir le fichier »), à étendre.
> 3. **Une session de fonctionnalité n'a PAS à connaître l'industrialisation pour travailler.** Les
>    deux chantiers restent indépendants (comme **D-003** l'a fait pour l'audit FFR) ; c'est
>    l'industrialisation qui s'adapte au mouvement, jamais l'inverse.

**Réponse de Romain** — *« D-029 applique les deux dans ce cas stp »* → **option (a)**, les deux
mesures appliquées immédiatement.

---

## DÉCISIONS TRANCHÉES À L'OUVERTURE DE L'ÉTAPE 3 *(session 13, 2026-08-05)*

> 🏁 **Les six décisions qui suivent étaient « en attente de Romain » depuis les sessions 1 à 8.**
> Elles ont été reprises **une par une** au volet ① de l'ÉTAPE 3, conformément à **D-024** et à
> l'ordre de `ETAT.md` §10.4, et **toutes les six sont tranchées**. Le registre des décisions en
> attente est désormais **vide**.

### D-025 — Quels tests écrit-on, et dans quel ordre ?

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 8 (posée) → **13 (tranchée)** |
| **Statut** | ✅ **VALIDÉE (session 13)** — **lot ① seul**, et **avant** la correction du départage |
| **Débloque** | **R-041**, R-042, R-043, R-044, R-045 — et conditionne le **calendrier** de D-014, D-011, D-012, D-015 |

> ### ✅ DÉCISION RETENUE
>
> **Le lot ① — le barème et le départage — et lui seul pour commencer.** Les 5 tests sont écrits
> **AVANT** la correction du départage (**D-014**), pas après. Confirmé explicitement par Romain.
>
> **Ce que cela fixe pour l'ÉTAPE 5** : le premier chantier de code du chantier d'industrialisation
> sera **l'écriture de ces 5 tests** — et **aucune ligne de l'application n'y sera modifiée**, les
> fonctions concernées (`enregistrerResultat`, `comparerClassement`) étant déjà testables telles
> quelles.
>
> **Ce que cela n'exclut pas** : les lots ②, ③ et ④ ne sont **pas refusés**, ils sont **différés**.
> Le lot ④ (la saisie d'un score) reste le préalable de **D-012** et **D-015** — il devra être
> replanifié avant que ces deux règles ne soient écrites.

**Problème posé**
> Le domaine D a montré que **le classement, le départage et la saisie des scores ne sont vérifiés
> par aucun test** — alors que ce sont exactement les trois choses que l'ÉTAPE 5 va modifier
> (D-011 forfait, D-012 limite de score, D-014 départage, D-015 match annulé).
>
> `CLAUDE.md` §6.D impose de **proposer les scénarios avant d'écrire des tests en nombre**. Voici
> donc les lots, sans qu'aucune ligne n'ait été écrite.

**Les 4 lots proposés** *(détail complet : `AUDIT.md` §D.9)*

| # | Lot | Ce qu'il protège | Coût | Préalable |
|---|---|---|---|---|
| **①** | **Le barème et le départage** (R-041) — 5 tests | Le résultat sportif. **Préalable de D-014 et D-011** | Faible — les fonctions sont **déjà pures**, rien à refactorer | Aucun |
| **②** | **La journée de bout en bout** (R-045) — 1 scénario | Les **jonctions** entre étapes, là où vivent R-002 et R-015 | Moyen | Aucun |
| **③** | **Le contrôle de syntaxe à la publication** (R-043 a) | Le seul chemin vers la production sans aucun contrôle | Très faible | Aucun |
| **④** | **La saisie d'un score** (R-042) — 8 tests | Les 6 garde-fous du geste le plus répété. **Préalable de D-012 et D-015** | Le plus élevé : demande de **séparer le cœur de l'écriture** | À planifier |

**Ma recommandation**
> **Le lot ① d'abord, et si un seul lot devait être fait, celui-là.** Trois raisons :
> 1. il est le **moins cher** — les fonctions concernées (`enregistrerResultat`,
>    `comparerClassement`) sont déjà pures, il n'y a **rien à modifier dans l'application** ;
> 2. il protège **ce qui compte le plus** : le calcul qui décide du vainqueur ;
> 3. et surtout, **il a une date de péremption**. **D-014 est déjà décidée** : le départage
>    **sera** modifié. Écrits après, ces tests graveraient le **nouveau** comportement sans avoir
>    jamais vu l'ancien — ils ne prouveraient donc plus qu'on n'a rien cassé, seulement qu'on a
>    bien écrit ce qu'on venait d'écrire.

**Ce que je ne propose pas, et pourquoi**
> **Fusionner les copies serveur / navigateur** (R-044) en une seule. Ce serait la solution
> élégante, mais elle demande de changer la façon dont le code arrive chez Google : un chantier
> d'architecture (domaine G), disproportionné aujourd'hui, et que `CLAUDE.md` §10 interdit sans
> justification forte. Le **test de miroir** obtient 90 % du bénéfice pour 5 % du risque.

**Impact sur l'application** : **aucun**, pour les lots ①②③ — un test n'ajoute aucun comportement.
Seul le lot ④ déplace du code existant, et c'est pourquoi il est le dernier.

**Question à Romain** : par quel lot commence-t-on à l'ÉTAPE 5 — et confirmes-tu que **les tests
du lot ① passent AVANT la correction du départage (D-014)**, et non après ?

---


### D-018 — Que dit-on aux personnes dont on garde les informations ?

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 7 (posée) → **13 (tranchée)** |
| **Statut** | ✅ **VALIDÉE (session 13)** — **oui, je rédige les trois textes** |
| **Débloque** | R-028 (P1) |

> ### ✅ DÉCISION RETENUE
>
> **Oui.** Les trois textes sont rédigés au volet ② de l'ÉTAPE 3, **et la troisième prend la forme
> d'une section « Tournoi » à ajouter à la page RGPD qui existe déjà** sur le site vitrine.
>
> **Ce qui a débloqué cette décision, le jour même** : les deux informations qui manquaient — **qui
> est officiellement responsable** et **quelle adresse de contact** — ont été trouvées en levant
> **I-16** (lecture du site vitrine public) :
>
> | Ce qui manquait | Ce que le site déclare publiquement |
> |---|---|
> | Le responsable | **Génération R92 — association loi 1901** |
> | L'adresse de contact | **generationr92@gmail.com** |
> | Le directeur de la publication | **Jérémy Jost, Président** |
>
> ⚠️ **Réserve à porter dans les textes, et elle est datée** : les mentions légales précisent
> *« association loi 1901 (**déclaration en cours**) »*, avec l'adresse du siège et le numéro RNA
> marqués **« [À DÉFINIR] »**. Une association non déclarée n'a pas d'existence juridique propre :
> **aujourd'hui, c'est donc Romain personnellement qui porte ces données** — exactement ce que
> **D-021** avait constaté. Aucune conformité juridique n'est prononcée ici (`CLAUDE.md` §6.B) :
> c'est un **écart de fait** entre ce que le site annonce et ce qui existe, à corriger le jour où
> la déclaration aboutit.
>
> **Ce que la décision ne fait PAS** : rien n'est mis en ligne. Les textes sont **livrés**, Romain
> les relit et les fait valider **par le bureau** — ils engagent l'association, pas le chantier.
> Leur mise en ligne sur le site vitrine relève de **D-005**, qui reste fermée.

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
| **Session** | 7 (posée) → **13 (tranchée)** |
| **Statut** | ✅ **VALIDÉE (session 13)** — **voie (a) : informer, sans bandeau, avec un moyen de dire non** |
| **Débloque** | R-029 (P1) |

> ### ✅ DÉCISION RETENUE — **(a)**
>
> **On informe, on ne demande pas l'accord, et on n'allège pas la mesure.** Concrètement, trois
> choses à écrire (au volet ③, car elles touchent du code) :
>
> 1. une **ligne visible en bas de la page publique** des scores ;
> 2. **l'explication dans la page « Vos données »** (la section « Tournoi » de D-018) ;
> 3. **un moyen simple de dire non**, mémorisé sur l'appareil.
>
> **Pourquoi (a) et pas (b)** : un bandeau « accepter / refuser » devant les scores, sur un terrain,
> sous la pluie, en 30 secondes, dégrade exactement ce que `CLAUDE.md` §11 place au-dessus de tout
> — l'usage métier. **Pourquoi pas (c)** : supprimer l'identifiant d'appareil ferait perdre la
> **portée** (combien de personnes différentes ont vu le logo), le chiffre qu'un partenaire regarde
> en premier.
>
> ⚠️ **Le calendrier est tenu par un interrupteur, pas par une date.** Les partenaires sont
> désactivés depuis le 2026-08-05, donc **R-029 est suspendu, pas réglé**. Ces trois écritures
> doivent être en place **avant que l'interrupteur soit rallumé**, et en tout état de cause avant
> de présenter une fiche de visibilité à un partenaire payant.

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
| **Session** | 7 (posée) → **13 (tranchée)** |
| **Statut** | ✅ **VALIDÉE (session 13)** — **le tableau est adopté tel quel, les 7 lignes** |
| **Débloque** | R-030 (P1), R-031, R-033, R-034 |

> ### ✅ DÉCISION RETENUE — **le tableau ci-dessous est LA règle de conservation du projet**
>
> | Donnée | Durée retenue |
> |---|---|
> | Contacts des clubs (le carnet) | **3 éditions** sans participation, puis suppression |
> | Effectifs déclarés d'une édition | **Effacés à la réinitialisation** |
> | Contacts de la demande FFR (représentant, président, **médecin**, secours) | **1 an**, ou à chaque réinitialisation |
> | Champ libre « équipes étrangères » | **Effacé après envoi du dossier** |
> | Relevés de visibilité (`Mesures`) | **Effacés après remise de la fiche au partenaire** |
> | Journal de saison (`Historique`) | **Conservé** *(aucune donnée personnelle)* |
> | Copies de courriels (Gmail) | **1 an** *(nettoyage manuel de la boîte)* |
>
> **Ce que cela met en ordre de marche** : **R-030** (P1), **R-031**, **R-033**, **R-034** — et,
> par ricochet, les jetons permanents de **R-018**. Une seule réponse, **neuf problèmes** qui
> cessent d'attendre.
>
> ⚠️ **Ce que cette décision NE déclenche PAS, et c'est une garde permanente** : **aucun
> effacement automatique.** L'outillage (un écran qui *signale* ce qui est périmé) viendra au volet
> ③, et **toute suppression restera déclenchée par un humain**. Un outil qui efface tout seul est le
> type de code le plus dangereux du projet — le domaine C l'a déjà montré avec la réinitialisation
> (**R-016**).
>
> 📌 **À signaler au bureau** : la page RGPD du site vitrine affiche publiquement, aujourd'hui,
> *« [À DÉFINIR une fois la politique de conservation clarifiée avec le bureau] »*. **Ce tableau est
> la réponse à cette phrase.** Sa mise en ligne relève de **D-005**, qui reste fermée.

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
| **Session** | 2 (posée) → **13 (tranchée)** |
| **Statut** | ✅ **VALIDÉE (session 13)** — **option (a) : D-006 est conservé tel quel** |

> ### ✅ DÉCISION RETENUE — **(a)**
>
> **La documentation continue d'aller directement sur `main`.** Si une consigne d'exécution impose
> une branche de travail, cette branche est **ramenée dans `main` avant la fin de la session** —
> jamais laissée de côté.
>
> **Pourquoi (a) et pas (b)** : l'option (b) paraît plus prudente, mais c'est **exactement** ce qui
> a coûté deux sessions au chantier. Session 6 : une PR non fusionnée a fait croire que le travail
> des sessions 4 et 5 n'existait pas. Tentative de session 8 : un `main` local en retard de
> 28 commits a fait produire un audit entier sur un état faux, puis jeté. Une branche non fusionnée
> **fait disparaître le travail** aux yeux de la session suivante.
>
> **Constat de fait au moment de trancher** : tout le travail des sessions 2 à 12 **est dans
> `main`** (vérifié au démarrage de la session 13). Le scénario redouté ne s'est pas reproduit.

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
| **Session** | 1 (posée) → **13 (tranchée)** |
| **Statut** | ✅ **VALIDÉE (session 13)** — **le périmètre reste fermé à `tournoi-r92`** |

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

> ### ✅ DÉCISION RETENUE — **non, le périmètre reste `tournoi-r92`**
>
> **Le chantier ne corrige rien dans `boutique-r92`.** Ce qui y est constaté est **signalé** ici,
> jamais corrigé à l'aveugle dans un dépôt qu'on ne peut pas lire.
>
> **Conséquence pratique sur D-018** : les trois textes sont **rédigés** dans ce chantier et
> **livrés à Romain**, qui les porte lui-même de l'autre côté. La section « Tournoi » de la page
> RGPD est donc **un livrable**, pas une modification.
>
> #### 📌 Ce qui a été constaté sur le site vitrine le 2026-08-05 *(signalé, non corrigé)*
>
> *Relevé en levant **I-16**, par simple lecture des pages publiques. Ce ne sont **pas** des
> problèmes du registre R-0XX : ils sont hors périmètre. Ils sont inscrits ici pour ne pas être
> perdus.*
>
> | # | Constat | Où |
> |---|---|---|
> | **V-01** | La page RGPD **ne parle pas du tournoi** : ni clubs invités, ni contacts de clubs, ni effectifs d'enfants, ni mesure de visibilité des partenaires. Elle ne couvre que l'adhésion, le don et l'achat | `rgpd.html` |
> | **V-02** | La durée de conservation est affichée **publiquement** comme *« [À DÉFINIR une fois la politique de conservation clarifiée avec le bureau] »* — **D-020 y répond** | `rgpd.html` |
> | **V-03** | Les mentions légales déclarent l'hébergeur **Netlify**, alors que le site est servi par **GitHub Pages** (`rfl974.github.io`). Mention obligatoire, information inexacte | `mentions-legales.html` |
> | **V-04** | L'association est déclarée *« loi 1901 (**déclaration en cours**) »*, adresse du siège et numéro **RNA** marqués *« [À DÉFINIR] »* — voir la réserve de **D-018** | `mentions-legales.html` |
>
> **Réouverture** : le jour où Romain rend `boutique-r92` accessible à ce chantier. Rien ne l'oblige
> aujourd'hui — les quatre constats ci-dessus se corrigent à la main en quelques minutes.

---

## DÉCISION FONCTIONNELLE AJOUTÉE APRÈS LA CLÔTURE DE L'AUDIT

### D-030 — Tournoi SUSPENDU / Tournoi ANNULÉ (force majeure)

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 13 *(addendum)* |
| **Statut** | ✅ **VALIDÉE — c'est une décision de Romain, product owner du tournoi** |
| **Nature** | **Spécification fonctionnelle à conserver**, pas une demande d'implémentation |
| **Couvre** | **R-089** *(nouveau)* · complète **R-013 / D-015** (le match) d'un cran au-dessus (la journée) |
| **Implémentation** | **ÉTAPE 3, volet ③** — **pas avant** le lot ① des tests (**D-025**) ni **R-042** |
| **⚠️ Aucun code écrit** | Consigne explicite de Romain : *« ne code rien maintenant »* |

---

#### 1. Le besoin, en une phrase

Quand un événement extérieur impose l'arrêt du tournoi — orage, foudre, terrain impraticable,
problème de sécurité — **l'application doit savoir le dire, le figer et le montrer.** Aujourd'hui
elle ne sait rien faire de tout cela : elle continue d'afficher un programme qui n'aura pas lieu.

#### 2. Les deux états, tels que Romain les a définis

##### 🟠 TOURNOI SUSPENDU — *temporaire, le tournoi peut reprendre*

À l'activation par l'administrateur :

- **l'intégralité du tournoi est immédiatement figée** ;
- **le match en cours est figé** ;
- **les scores saisis pendant ce match sont verrouillés et considérés comme validés à l'instant de
  la suspension** ;
- **aucun score ultérieur** ne peut être ajouté ni modifié sur ce match pendant la suspension ;
- **les matchs à venir sont bloqués** ;
- le moteur de planification prend **l'état du tournoi à cet instant comme nouvel état de
  référence** pour préparer une reprise.

**À la reprise** : le match interrompu **n'est pas rejoué depuis zéro** — son résultat au moment de
la suspension est **conservé et validé**.

Le moteur **propose ensuite des scénarios** pour faire tenir les matchs restants dans le temps
disponible, en respectant la sécurité et le temps de jeu des enfants. Par exemple : réduire la
durée des périodes · passer de deux périodes à une · réduire ou supprimer des marges entre
rencontres · réorganiser les terrains · toute autre adaptation compatible avec les règles.

> 🔑 **La règle d'or posée par Romain** : **le moteur propose, il ne décide jamais seul d'une
> modification réglementaire.**

##### 🔴 TOURNOI ANNULÉ — *définitif pour la journée*

À l'activation par l'administrateur :

- le tournoi est **définitivement** placé dans l'état ANNULÉ ;
- **les matchs à venir deviennent inaccessibles et sont grisés** ;
- le match en cours est **figé et grisé** ; son état et son score au moment de l'annulation sont
  **conservés** ;
- **aucun nouveau résultat ne peut être saisi** ;
- **aucun classement final n'est généré** pour un tournoi **EDR classique** annulé ;
- les résultats **validés avant** l'annulation **restent consultables** comme historique de la
  journée.

##### Dans les deux cas

- **activation ET reprise/désactivation exigent la clé administrateur**, comme les autres
  opérations sensibles ;
- **l'état est clairement visible dans l'interface d'administration** ;
- **un bandeau apparaît sur la page publique** ;
- **le texte du bandeau est personnalisable par l'administrateur**.

---

#### 3. ✅ Vérification de compatibilité — cette décision contredit-elle quelque chose ?

*Passage en revue de toutes les décisions et contraintes déjà inscrites. **Réponse : aucune
contradiction.** Mais trois articulations doivent être écrites, sans quoi le même code sera touché
deux fois.*

| Ce qui existe | Verdict | Ce qu'il faut retenir |
|---|---|---|
| **D-015** — le match annulé (l'orage) | ✅ **Compatible, et complémentaire** | D-015 traite **un match**, D-030 traite **la journée**. Ce ne sont pas deux façons de dire la même chose : un tournoi annulé n'est **pas** « N matchs annulés un par un ». **D-030 est un cran au-dessus** et ne remplace pas D-015 |
| **D-013** — ajuster le planning en cours de journée | ⚠️ **Compatible, mais D-030 ROUVRE son niveau 3** | D-013 avait **écarté** le niveau 3 (*« rendre un terrain indisponible et laisser l'application redistribuer »*), au motif que c'est *« le seul niveau qui touche au planificateur, donc le seul réellement risqué »*. Les scénarios de reprise de D-030 touchent **exactement** ce même code. → **Les deux doivent être traités dans le même chantier**, sinon on ouvre `calculerPlanning` deux fois |
| **D-013** — règle *« avertir, jamais interdire »* | ✅ **Compatible, et c'est même la même idée** | *« Le moteur propose, il ne décide pas seul »* (D-030) est la formulation exacte de *« le jour J, l'organisateur en sait plus que l'algorithme »* (D-013) |
| **D-013** — règle *« réservé à la clé admin »* | ✅ **Identique** | D-030 l'exige aussi, pour l'activation **et** la reprise |
| **D-011** (forfait) · **D-012** (score) | ✅ **Compatible** | Un tournoi figé **interdit toute saisie**, forfait compris. À écrire noir sur blanc : le gel est **au-dessus** de la saisie |
| **D-025** — le lot ① des tests avant de toucher au départage | ⚠️ **CONTRAINTE D'ORDRE** | *« Aucun classement final pour un tournoi annulé »* **touche le calcul du classement**. D-030 passe donc **après** les 5 tests du lot ① |
| **D-020** — durées de conservation | ✅ **Compatible** | L'historique d'une journée annulée vit dans `Historique`, dont la durée retenue est **« conservé »** *(aucune donnée personnelle)* |
| **D-027** — l'attente est annoncée, une animation **ne ment jamais** | ✅ **Compatible, et s'applique au bandeau** | Un bandeau « suspendu » doit refléter l'état **réel**, jamais un état supposé |
| **D-005** — périmètre fermé | ✅ **Sans objet** | Tout se passe dans `tournoi-r92` |
| **D-028** — on ne découpe pas `Code.gs` | ✅ **Sans objet** | D-030 ajoute du code au fichier existant |
| **`CLAUDE.md` §11** — la fonctionnalité métier prime | ✅ **Renforcé** | C'est une fonctionnalité **de terrain**, née d'un besoin réel |

---

#### 4. ⚠️ Les contraintes techniques que l'audit impose à cette fonctionnalité

*Elles ne sont pas des objections : ce sont les pièges déjà connus du projet, écrits maintenant pour
qu'ils ne soient pas redécouverts au moment de coder.*

1. **L'état doit être tenu par le SERVEUR, jamais par la page.** C'est le fil rouge du domaine C :
   les trois protections les plus destructrices (**R-015** effacer les scores, **R-016**
   réinitialiser, **R-047** équipes en double) sont tenues par la page web, donc contournables.
   Un gel tenu par le navigateur **ne gèle rien** : il suffit d'ouvrir la page de saisie ailleurs.
   → **D-030 rejoint la famille « le filet côté serveur ».**
2. **Le bandeau public passe par l'instantané en cache.** La page publique lit une copie
   pré-calculée, rafraîchie toutes les 15 s (**R-064**, qu'on envisage de porter à 30 s). Une
   suspension mettra donc **jusqu'à 15-30 secondes** à apparaître sur les téléphones.
   > ⚠️ **Conséquence à dire clairement, et elle est importante** : ce bandeau est un **moyen
   > d'information**, **pas un système d'alerte de sécurité**. On n'évacue pas un terrain sous la
   > foudre avec un bandeau qui arrive une demi-minute plus tard. La consigne de sécurité passe par
   > la voix et le sifflet ; le bandeau explique, il n'alerte pas.
3. **Tout champ nouveau montré au public doit entrer dans la liste blanche.** Le projet a déjà
   connu ce piège : un réglage enregistré en administration qui ne change rien sur le site public,
   parce que le champ n'était pas déclaré dans la liste des vues publiques. L'état du tournoi et le
   texte du bandeau **devront y être ajoutés**.
4. **Les nouveaux états écrits dans le classeur doivent résister à l'encodage.** Le projet a déjà
   été mordu par un statut *« terminé »* dont le « é » revient décomposé du tableur, ce qui casse
   l'égalité stricte. Les libellés SUSPENDU / ANNULÉ doivent être comparés par un utilitaire, pas
   par un `===` sur du texte accentué.
5. **Le gel doit survivre à R-002.** Le garde-fou qui refuse de générer l'après-midi tant que le
   matin est incomplet doit **savoir** qu'un match gelé ou annulé n'est pas un match « oublié »,
   sinon une reprise sera impossible.
6. **Le gel doit résister aux gestes destructeurs.** « Tout regénérer » et « réinitialiser »
   (R-015, R-016) ne doivent pas pouvoir effacer un état de suspension ni les scores qu'il a
   validés.

---

#### 5. ❓ Ce que la décision ne dit pas encore — points ouverts, à trancher avant de coder

| # | La question laissée ouverte | Pourquoi elle compte |
|---|---|---|
| **a** | **Le Super Challenge est-il concerné par « aucun classement final » ?** Romain a écrit *« tournoi EDR **classique** »* | Le SCF se joue **sur deux journées** (samedi poules / dimanche brassage). Annuler le samedi n'a pas le même sens qu'annuler un tournoi d'un jour |
| **b** | **Une suspension peut-elle franchir la pause méridienne**, ou l'après-midi déjà généré ? | Le tournoi se génère **en deux temps** (matin, puis après-midi d'après le classement du matin). Une suspension le matin change le classement qui sert à fabriquer l'après-midi |
| **c** | **Un tournoi ANNULÉ peut-il être « dé-annulé » ?** | Romain a écrit *« définitif pour la journée »*. Reste à savoir si c'est **définitif dans les données** (irréversible) ou seulement **définitif dans l'intention** (réversible avec la clé admin, comme la suspension) |
| **d** | **Le classement partiel reste-t-il affiché** pendant une SUSPENSION ? | L'annulation dit « pas de classement final ». La suspension ne dit rien — or le tournoi peut reprendre |
| **e** | **Que devient un tournoi suspendu qui ne reprend jamais** ? Bascule-t-il en ANNULÉ à la main, ou reste-t-il suspendu ? | C'est le cas réel le plus probable : l'orage ne s'arrête pas, et personne ne pense à changer l'état avant de rentrer |
| ⚡ **f** *(né de la réponse I-21)* | **« Phases finales interdites » annule-t-il aussi une phase finale DÉJÀ PRÉVUE**, ou seulement celles que le moteur pourrait inventer pour rattraper ? Un seul des quatre formats d'après-midi est concerné : **COUPE_PLATEAU** | Ma lecture prudente : **oui, elle est écartée à la reprise**. Mais les deux lectures ne produisent pas le même code — voir **§8.4** |
| ~~⚡ **g**~~ | ~~Existe-t-il une durée de repos méridien MINIMALE imposée en École de Rugby ?~~ | ✅ **FERMÉ le 2026-08-05 par D-031** — **ce n'est pas une question de l'application.** *« La réglementation importe au responsable du tournoi, pas à l'app »* : c'est lui qui saisit la valeur qu'il doit respecter. Rien à demander à la FFR, rien à coder |

> Ces cinq points **ne bloquent pas l'inscription de la décision** : ils seront présentés à Romain
> au moment de construire la fiche de chantier, au **volet ③**. Les inscrire maintenant évite qu'ils
> soient tranchés à la va-vite pendant l'implémentation — c'est exactement ce que `CLAUDE.md` §4
> demande.

---

#### 6. 🏉 La question fédérale — **I-10 est élargie, et I-21 est ouverte**

`AUDIT-TOURNOI-R92.md` **ne contient rien** sur le forfait, l'annulation, les intempéries ou le
report — vérifié : aucun de ses 25 points (Q11 → Q25) ne couvre le sujet. La décision D-030 ajoute
une deuxième question, d'un niveau au-dessus.

| Réf | La question à porter à la FFR | Ce qu'elle décide |
|---|---|---|
| **I-10** *(élargie)* | Le sort d'un **match** qui n'a pas pu se jouer — **et désormais d'un tournoi entier interrompu ou annulé pour force majeure** — est-il encadré ? | Primerait sur **D-011**, **D-015** **et D-030** |
| **I-21** *(nouvelle)* | En cas de force majeure, **peut-on réduire le temps de jeu** (périodes raccourcies, deux périodes ramenées à une) ? Existe-t-il une **durée minimale** ? Et **combien de rencontres** faut-il avoir jouées pour qu'un classement reste valable ? | **Bloque le niveau 2 de D-030** (les scénarios de reprise) — on ne propose pas de raccourcir un temps de jeu d'enfants sans savoir ce que la Fédération autorise |

> 📮 **Les deux questions tiennent dans le même courriel que I-15**, aux mêmes destinataires
> (Directeur EDR du Racing / Comité 92) — la voie qui a déjà résolu Q23. **Une seule démarche, trois
> questions.**

---

#### 7. Où cette fonctionnalité s'implémente — **volet ③, et découpée en deux niveaux**

> **Ma recommandation, et elle suit exactement la méthode qui a servi à D-013** : découper, faire le
> niveau 1 seul, et ne toucher au moteur qu'après.

| Niveau | Contenu | Ce que ça touche | Quand |
|---|---|---|---|
| **1 — l'état et sa visibilité** | Les deux états · le gel · le verrouillage du score en cours · la clé admin à l'activation **et** à la reprise · le grisage des matchs à venir · le bandeau public personnalisable · pas de classement final si annulé | Le serveur *(état + garde-fous)*, l'écran d'administration, la page publique, le calcul du classement | **Après** le lot ① des tests (**D-025**) et **après R-042** |
| **2 — les scénarios de reprise** | Les propositions de rattrapage : périodes réduites, deux périodes → une, marges, terrains | **`calculerPlanning`** — le cœur de 224 lignes qui décide quel match se joue où et quand | **Après le niveau 1**, et **après la réponse à I-21**. À traiter **avec le niveau 3 de D-013**, jamais séparément |

**Pourquoi cet ordre, en une phrase** : le niveau 1 rend l'application utilisable le jour de
l'orage **sans toucher au moteur de planification** ; le niveau 2 est utile mais il ouvre la pièce
la plus délicate du projet, et il dépend d'une réponse fédérale qu'on n'a pas encore.

**Prérequis, dans l'ordre** :

1. **Lot ① des tests** (R-041, D-025) — parce que le niveau 1 modifie le comportement du classement
   *(pas de classement final si annulé)* ;
2. **R-042** — séparer le cœur de la saisie du score de son écriture, parce que le gel verrouille la
   saisie. Sans cela, **D-011, D-012, D-015 et D-030 rouvrent quatre fois le même code** ;
3. **famille « le filet côté serveur »** (R-015, R-016, R-047) — même cause, même correction, mêmes
   tests que le point 1 des contraintes techniques ci-dessus ;
4. **I-21** — uniquement pour le niveau 2.

---

#### 8. ✅ **I-21 EST RÉSOLUE** — la règle fédérale entre dans la décision *(2026-08-05)*

**Réponse rapportée par Romain** :

> **La reprise avec adaptation du format et de la durée est AUTORISÉE**, sous deux réserves :
> ⛔ **le temps de jeu maximal** doit être respecté ;
> ⛔ **les phases finales sont interdites.**

C'est la réponse la plus favorable possible : **le niveau 2 n'est plus bloqué**, et il n'est pas
non plus laissé sans limites — il reçoit **deux garde-fous nets**, ce qui est exactement ce qu'il
fallait pour ne pas écrire un moteur qui décide seul.

##### 8.1 — Ce que cela change dans D-030

| Avant | Après |
|---|---|
| Le niveau 2 était **suspendu à une réponse fédérale** | ✅ **Débloqué** — il peut être planifié et implémenté |
| Les leviers de rattrapage étaient une **liste d'exemples** | Ils deviennent une **liste encadrée** : tout est permis **sauf** dépasser le temps de jeu maximal et **sauf** introduire une phase finale |
| On ignorait s'il fallait un plancher de durée | ⚠️ **Toujours inconnu** — la réponse encadre le **maximum**, elle ne dit rien d'un **minimum** *(voir §8.3)* |

##### 8.2 — ⚠️ Le point à connaître avant de coder : **le plafond de temps de jeu n'est aujourd'hui qu'un AFFICHAGE**

*Constaté dans le code, pas supposé :*

- `plafond_joueur_min` est bien **lu** de l'onglet `RefFFR_Temps` *(`backend/Code.gs`, lecture des
  grilles et plafonds)* ;
- il est **affiché** dans l'écran de conformité FFR, avec la mention **« (sécurité) »**
  *(`frontend/js/admin-conformite-ffr.js`)* ;
- il alimente un **prévisionnel** de conformité *(`previsionnelCategorieFFR`)* ;
- ❌ **mais rien, dans `calculerPlanning`, ne refuse un planning qui le dépasse.**

> **Conséquence directe sur le chantier** : la première réserve posée par la FFR — *« sous réserve
> du temps de jeu maximal »* — **n'est pas un branchement, c'est un travail à part entière**. Le
> niveau 2 doit transformer un **indicateur** en **contrôle réel**. Le prévoir maintenant évite de
> découvrir en cours de route qu'on croyait le garde-fou déjà là.

##### 8.3 — Les trois marges, et leurs trois régimes *(corrigé par Romain le 2026-08-05)*

> ⚠️ **Correction d'une erreur de cadrage de ma part.** J'avais écrit que le repos méridien de
> 60 minutes ne devait **jamais** être touché. **C'est faux, et Romain l'a rectifié** : ce 60 n'est
> pas une constante de sécurité gravée, c'est **une valeur que l'organisateur choisit** — elle a
> simplement été écrite en dur faute d'écran pour la saisir. Le vrai principe n'est pas *« on n'y
> touche jamais »*, c'est : **la machine ne la modifie jamais toute seule ; l'organisateur, si.**
> *(Le garde-fou survit donc, sous une forme plus juste : voir le principe 5 du §9.)*

D-030 autorise de *« supprimer ou réduire certaines marges entre rencontres »*. Il y en a **trois**,
et elles n'ont pas le même régime :

| Marge | Où elle vit | Régime |
|---|---|---|
| **Le battement entre deux matchs sur un même terrain** *(`battement_terrain_min`, 5 min par défaut)* | Réglage global | ✅ **Levier libre** — c'est de la logistique, pas du jeu |
| **La récupération entre deux matchs d'une même équipe** *(`recup_entre_matchs_min`, par catégorie)* | Réglage par catégorie | ⚠️ **Levier, avec prudence** — c'est du repos d'enfants |
| **Le repos minimal de la pause méridienne échelonnée** *(aujourd'hui `repos: 60`, écrit en dur)* | ⚠️ **Aucun écran ne permet de le saisir** | ⚠️ **Levier — mais SEULEMENT par une modification explicite de l'organisateur**, jamais par le moteur, et dans le respect du cadre réglementaire |

##### 8.3 bis — ⚡ Ce que le code permet déjà, et qui rend la correction bon marché

*Constaté, pas supposé :*

- la fonction de planification échelonnée **accepte déjà** le repos **en paramètre**
  *(`planifierCategorieEchelonnee(ids, terrains, opts)` — `opts.repos`, avec 60 comme valeur par
  défaut)* ;
- ❌ **seul l'appelant** passe la valeur en dur *(`repos: 60`)* ;
- il existe même déjà un **avertissement** pour le cas dégénéré où le repos réel tomberait sous le
  seuil demandé.

> ✅ **Conséquence** : rendre ce repos configurable **ne demande aucune modification du cœur de
> calcul**. Il faut un champ dans l'écran de configuration horaire, sa lecture, et le passage de la
> valeur. → **chantier `PLAN.md` C-004**, petit et indépendant.

##### 8.3 ter — ⚠️ La règle d'équité est tenue par la FORME du planning, pas par un contrôle

*C'est le point le plus important pour le levier « réorganiser les rencontres ».*

La règle *« une équipe qui a déjà bénéficié de son repos ne peut pas affronter une équipe qui ne
l'a pas encore eu »* n'est **vérifiée nulle part** dans le code. Elle est **garantie par
construction**, par l'ordre des blocs :

1. **matin** — les matchs **entre les deux vagues**, tout le monde à égalité de fraîcheur ;
2. **vague 1 en pause**, pendant que la **vague 2** joue ses matchs **internes** *(les deux équipes
   d'un même match sont dans le même état)* ;
3. **vague 2 en pause** à son tour, pendant que la **vague 1** joue les siens ;
4. **après-midi** — le reste des matchs entre vagues, **tout le monde ayant déjeuné**.

> ⚠️ **Conséquence directe, et elle est sévère** : un levier qui **réorganiserait librement** les
> rencontres **casserait l'équité en silence**. Rien ne s'en apercevrait — ni une erreur, ni un
> avertissement : juste une équipe reposée face à une équipe qui ne l'est pas.
>
> **Deux mesures en découlent, inscrites dans C-003** : (1) le levier « réorganiser » **conserve la
> structure en quatre blocs** et ne redate qu'à l'intérieur ; (2) un **contrôle explicite d'équité**
> est ajouté — pour que la règle cesse d'être seulement une propriété de la forme, et devienne
> quelque chose que l'on peut **prouver**.

##### 8.4 — ❓ Une précision demandée sur « phases finales interdites »

La règle est **sans ambiguïté pour le moteur** : *il ne propose jamais une phase finale comme moyen
de rattrapage* — pas de « on saute directement à une finale entre les deux premiers ». **C'est acté.**

Reste une question plus étroite, qui ne bloque rien :

> **Une suspension annule-t-elle aussi une phase finale DÉJÀ PRÉVUE au programme ?** Des quatre
> formats d'après-midi, un seul s'en approche — **COUPE_PLATEAU**.

**Ma lecture, prudente et cohérente avec la doctrine du projet** *(« prudent par construction »)* :
**oui** — après une suspension, le moteur **ne propose ni ne régénère** de format à élimination. Je
l'inscris comme **point ouvert (f)** du §5 plutôt que comme un fait, parce que les deux lectures ne
produisent pas le même code.

##### 8.5 — Le niveau 2 est donc **prêt à être planifié**

➡️ **Fiche de chantier : `PLAN.md` → C-003.** Ses dépendances restantes ne sont plus fédérales,
elles sont **techniques** : le lot ① des tests (**D-025**), puis **R-042**, puis le **niveau 1**
(**C-002**) — sans état SUSPENDU, il n'y a rien à reprendre.

---

#### 9. ⭐ **LE CADRE DE LA REPRISE** — contraintes, leviers, et l'ordre dans lequel on s'en sert

> **Précision apportée par Romain le 2026-08-05**, et c'est **la partie la plus structurante de
> D-030**. Elle remplace toute lecture antérieure : ce chapitre fait foi pour construire **C-003**.

> 🎯 **L'intention, dans les mots de Romain** : *« Je ne veux pas que C-003 soit construit autour de
> l'idée "60 minutes = verrou qui bloque la reprise". Je veux que le moteur cherche toutes les
> marges de manœuvre disponibles avant de conclure que le tournoi ne peut plus être repris. »*

##### 9.1 — 🔒 CONTRAINTES À RESPECTER

*Ce que le moteur ne franchit jamais, quel que soit le retard à absorber.*

| # | Contrainte | Nature |
|---|---|---|
| 1 | **Une équipe ne peut pas jouer deux rencontres en même temps** | Physique — indiscutable |
| 2 | **Le temps de jeu maximal applicable** | ⛔ **Réglementaire** *(réserve posée par la réponse à I-21)*. ⚠️ **N'existe aujourd'hui que comme affichage** — voir §8.2. ⚡ **Sa SOURCE est fixée par D-031** : c'est une **valeur que le responsable a saisie**, pas une règle que l'application connaîtrait. **Valeur absente ⇒ l'application ne vérifie pas, et elle le DIT** |
| 3 | **La cohérence du repos entre adversaires** | Sécurité + équité sportive |
| 4 | **Une équipe ayant déjà bénéficié de son repos ne peut pas affronter une équipe qui ne l'a pas encore eu** | ⛔ **Règle déjà implémentée par Romain — elle doit impérativement rester.** ⚠️ Elle est tenue par la **forme** du planning, pas par un contrôle — voir §8.3 ter |
| 5 | **Aucune phase finale** | ⛔ **Réglementaire** *(réserve posée par la réponse à I-21)* |
| 6 | **Toute autre contrainte réglementaire explicitement applicable** | Ouvert par construction — une règle fédérale nouvelle entre ici |

##### 9.2 — 🔧 LEVIERS D'ADAPTATION, dans l'ordre du moins au plus intrusif

*Ce que le moteur a le droit d'utiliser pour absorber le retard.*

| Ordre | Levier | Touche au jeu ? | Décision |
|---|---|---|---|
| **1** | **Les battements logistiques** entre les matchs | ❌ Non | Le moteur peut proposer |
| **2** | **Les marges entre les séquences** *(réduites ou supprimées)* | ❌ Non | Le moteur peut proposer |
| **3** | **Réorganiser les rencontres** sur les terrains disponibles | ❌ Non | Le moteur peut proposer — ⚠️ **en conservant la structure en 4 blocs** (§8.3 ter) |
| **4** | **Le nombre de périodes** d'un match | ⚠️ Oui | Le moteur peut proposer, **sous la contrainte 2** |
| **5** | **La durée des périodes**, ou la durée totale d'un match | ⚠️ Oui | Le moteur peut proposer, **sous la contrainte 2** *(« dans les limites autorisées »)* |
| **6** | **Certaines marges de récupération** | ⚠️ Oui — repos d'enfants | Le moteur peut proposer, **sous les contraintes 3 et 4** |
| **7** | **Le repos minimal configuré** pour la pause méridienne échelonnée | ⚠️ Oui — sécurité | 🔴 **UNIQUEMENT par une modification EXPLICITE de l'organisateur**, jamais par le moteur, et **dans le respect du cadre réglementaire applicable** |
| **8** | **Retirer des rencontres** de la reprise | ⚠️ Oui — équité sportive | 🔴 **Dernier recours**, et il doit être annoncé comme tel |

##### 9.3 — Les cinq principes qui gouvernent l'usage des leviers

1. **Conserver autant que possible les contraintes initiales** — on ne « nettoie » pas un planning
   parce que l'occasion se présente ;
2. **Utiliser d'abord les leviers les moins intrusifs** ;
3. **N'utiliser un levier plus important que si c'est nécessaire** — et le dire ;
4. **Ne jamais franchir une contrainte de sécurité ou une contrainte réglementaire impérative** ;
5. **Lorsqu'une contrainte CONFIGURABLE doit être modifiée, demander une décision explicite à
   l'organisateur — jamais la modifier automatiquement.**

> 🏉 **Ce que ces cinq principes changent, concrètement.** Le moteur n'a pas le droit de dire
> *« impossible »* tant qu'il n'a pas parcouru les huit leviers. Et il n'a pas le droit de dire
> *« j'ai réussi »* en ayant abaissé le repos des enfants sans que personne l'ait décidé. **Entre
> les deux, il propose — et l'organisateur tranche.**
>
> 🔗 **Cela rejoint deux règles déjà écrites** : *« avertir, jamais interdire »* (**D-013** — *« le
> jour J, l'organisateur en sait plus que l'algorithme »*) et *« un message ne ment jamais »*
> (**D-027**). Annoncer *« aucune solution »* sans avoir exploré toutes les marges **serait un
> message qui ment**.

##### 9.4 — ✅ Vérification de compatibilité de cette précision

| Ce qui existe | Verdict |
|---|---|
| **D-013** — *« avertir, jamais interdire »* | ✅ **Même idée, formulée deux fois.** Le principe 5 en est la version pour les valeurs configurables |
| **D-027** — *« un message ne ment jamais »* | ✅ **Renforcé** — il s'applique désormais aussi au verdict *« la reprise est impossible »* |
| **La réponse à I-21** *(temps de jeu maximal, pas de phase finale)* | ✅ **Intacte** — ce sont les contraintes 2 et 5 |
| **La règle d'équité implémentée par Romain** | ✅ **Préservée explicitement** — contrainte 4, et un contrôle est ajouté pour qu'elle devienne prouvable |
| **`CLAUDE.md` §11** — la fonctionnalité métier prime | ✅ **Renforcé.** Refuser une reprise à cause d'une valeur qu'un humain aurait pu ajuster serait une rigidité technique qui dégrade l'usage métier — donc, au sens de §11, **pas une amélioration** |
| **D-030 §8.3, version du matin** | ❌ **Contredite et CORRIGÉE** — voir l'encadré en tête de §8.3 |
| **`PLAN.md` C-003, version du matin** | ❌ **Contredite et RÉÉCRITE** — le repos passe de « garde-fou dur » à « levier n° 7, sous décision explicite » |

##### 9.5 — ✅ **FERMÉ le 2026-08-05 par D-031** — la question ne se pose pas

> J'avais ouvert un point (g) : *« existe-t-il une durée de repos méridien minimale imposée ? »*.
> **Romain a tranché autrement, et plus simplement** : *« la réglementation importe au responsable
> du tournoi, pas à l'app — à lui de renseigner ce que la réglementation impose. »*
>
> **Conséquence** : le levier n° 7 s'utilise **sans qu'aucune règle soit écrite dans le code**. Le
> responsable saisit la valeur qu'il doit respecter, et l'application l'applique. **Rien à demander
> à la FFR, rien à coder, et un avertissement de moins à construire.** → **D-031**.

---

### D-031 — L'application ne porte pas la réglementation : le responsable la renseigne

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 13 *(addendum n° 4)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Portée** | **Doctrine générale.** S'applique à tout le projet, pas seulement à D-030 |

**Décision, dans les mots de Romain**

> *« La réglementation importe au responsable du tournoi, pas à l'app. À lui de renseigner ce que la
> réglementation impose. »*

**Ce que cela veut dire concrètement**

| ❌ Ce que l'application ne fait PAS | ✅ Ce qu'elle fait |
|---|---|
| Connaître une durée minimale ou maximale imposée par la Fédération | **Utiliser les valeurs que le responsable a saisies** |
| Écrire un seuil réglementaire dans son code | Lire les grilles et plafonds de `RefFFR_*`, **remplis à la main** |
| Refuser une valeur au nom d'une règle qu'elle croirait connaître | Appliquer la contrainte **telle qu'elle a été déclarée** |
| Deviner ce qui manque | **Dire que ça manque** |

> ✅ **Ce n'est pas une nouveauté, c'est la mise en mots d'une doctrine déjà à l'œuvre.** Tout le
> chantier de conformité fédérale est bâti là-dessus : l'application **reporte ce qui est déclaré et
> ne devine jamais**. D-031 l'étend explicitement aux **durées et aux temps de jeu**.

**⚠️ La contrepartie, et elle est indispensable**

Si une valeur n'a **pas** été renseignée, l'application ne peut pas vérifier. Elle ne doit alors ni
inventer une valeur, ni laisser croire que le contrôle a eu lieu. Elle **le dit** :

> *« Aucun plafond de temps de jeu renseigné pour cette catégorie — cette proposition n'a pas pu
> être vérifiée sur ce point. »*

C'est **D-027** appliqué *(un message ne ment jamais)* : une case non cochée n'est pas une case
verte.

**Ce que D-031 referme immédiatement**

- ✅ **le point ouvert (g) de D-030 §5** — *« existe-t-il un repos méridien minimal réglementaire ? »*
  **n'est plus une question de l'application.** Le responsable saisit la valeur qu'il doit
  respecter ;
- ✅ **C-004 se simplifie** : un champ, une valeur, aucun « plancher » à construire, aucun
  avertissement réglementaire à écrire ;
- ✅ **la contrainte n° 2 de D-030 §9.1** *(le temps de jeu maximal)* **reste une contrainte** — mais
  sa **source** est claire : c'est une **valeur déclarée**, pas une règle que l'application
  connaîtrait.

**🚧 CE QUE D-031 NE REMET PAS EN CAUSE — garde-fou explicite**

> ⚠️ **Précision de Romain, le jour même** : *« On ne touche pas au bouton "Appliquer les valeurs
> FFR" aux catégories. Quand je dis que la réglementation importe au responsable du tournoi, ici
> c'est juste une aide à la saisie qu'il peut modifier. »*

| Ce qui est **protégé**, et ne doit être ni retiré ni affaibli | Pourquoi |
|---|---|
| ⛔ **Le bouton « Appliquer les valeurs FFR » par catégorie** | C'est une **aide à la saisie**, pas une décision de l'application. Il **pré-remplit** des champs que le responsable **peut ensuite modifier** |
| ⛔ **La lecture des onglets `RefFFR_*`** et l'écran de conformité | Ils **montrent** ce que le référentiel dit. Montrer n'est pas imposer |
| ⛔ **Les avertissements de conformité existants** | Ils informent ; ils ne bloquent pas |

> ✅ **Loin de contredire D-031, ce bouton en est le meilleur exemple.** D-031 dit que
> **c'est le responsable qui renseigne** — le bouton est précisément **l'outil qui l'aide à le
> faire vite**, et il **garde le dernier mot**. Ce que D-031 interdit, c'est tout autre chose : que
> l'application **décide** à sa place, **refuse** une valeur au nom d'une règle qu'elle croirait
> connaître, ou **fasse comme si** un contrôle avait eu lieu.
>
> 🏉 **En une image** : le bouton est un **formulaire pré-rempli**, pas un **agent qui vérifie à la
> sortie**.

**Compatibilité** : ✅ aucune contradiction. **D-027** est appliqué, la réponse à **I-21** est
intacte *(le temps de jeu maximal reste à respecter — simplement, sa valeur vient de toi)*, le
**bouton « Appliquer les valeurs FFR » est expressément préservé** *(ci-dessus)*, et `CLAUDE.md`
§6.B interdisait déjà de « certifier » une conformité.

---

### D-032 — Les deux pauses méridiennes ne coexistent jamais

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-05 |
| **Session** | 13 *(addendum n° 4)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | **R-091** *(nouveau)* — et conditionne **C-004** |

**Décision, dans les mots de Romain**

> *« Quand la pause échelonnée est cochée, la pause classique ne s'applique pas, et inversement.
> Elles ne doivent jamais coexister. »*

**⚠️ Ce que fait le code AUJOURD'HUI — et qui ne respecte pas cette règle**

*Constaté, pas supposé :*

- la pause échelonnée est un réglage **global** ;
- une catégorie y est éligible **à partir de 4 équipes** ;
- **en dessous**, le code **bascule cette catégorie en pause classique**, avec un avertissement
  écrit tel quel : *« pause échelonnée demandée mais seulement N équipe(s) — **pause classique
  conservée pour cette catégorie** »*.

**Les deux modes coexistent donc dans le même tournoi**, délibérément. C'est ce que D-032 interdit.

**✅ Ce qui remplace ce comportement** *(arbitré par Romain le 2026-08-05)*

> **La petite catégorie garde une pause — mais la sienne.**
>
> Elle n'est pas planifiée en deux vagues *(c'est impossible à moins de 4 équipes)*, mais elle
> obtient **une coupure de midi propre**, **de la durée du repos minimal configuré**.
> **La « pause classique globale » ne s'applique alors nulle part.**

**Pourquoi cette option, et pas les autres**

| Option écartée | Pourquoi |
|---|---|
| **Tout ou rien** *(une petite catégorie ⇒ tout le tournoi en classique)* | Une catégorie à 3 équipes priverait **toutes les autres** du bénéfice de l'échelonné |
| **Interdire de cocher la case** s'il existe une catégorie < 4 équipes | Trop rigide : un club qui se désiste la veille ferait basculer toute l'organisation |
| **Aucune pause pour la petite catégorie** | ⛔ **Des enfants joueraient toute la journée sans coupure de midi**, et personne ne s'en apercevrait avant le jour J |

> 🏉 **Ce que l'option retenue garantit, en une phrase** : **aucune coexistence des deux modes, et
> aucun enfant sans coupure.**

**Compatibilité** : ✅ aucune contradiction avec une décision existante. Elle **change en revanche un
comportement du code** *(le repli en pause classique)* — c'est donc un **problème inscrit au
registre** (**R-091**) et un travail planifié (**C-004**), pas une correction improvisée.

⚠️ **Ce que D-032 n'autorise pas** : à supprimer le **repli** lui-même. Une catégorie de moins de
4 équipes doit continuer d'être planifiée *(elle joue, simplement pas en deux vagues)*, et
l'avertissement doit continuer d'exister — **son texte change**, pas sa présence.


---

### D-033 — Les durées de conservation sont garanties par un **rappel manuel**

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-06 |
| **Chantier** | C-005 *(point 6 des points à confirmer)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | **R-030** (P1), et conditionne **C-006** |

**Le problème posé**

> Les sept durées de **D-020** sont **décidées**, et le livrable de C-005 les **annonce à des
> tiers**. Mais **aucun outil ne les applique** : ce sont des gestes manuels. **Un engagement écrit
> non tenu est pire que pas d'engagement** — un contact de club qui découvre trois ans plus tard
> qu'on a gardé son adresse n'a pas affaire à un oubli technique, mais à une **promesse rompue**.

**Décision retenue**

> ✅ **Le principe du rappel manuel est confirmé** *(Romain, 2026-08-06)*.
>
> Tant qu'aucun outil ne signale ce qui est périmé, **le respect des durées est assuré par un
> rappel explicite**, inscrit dans la procédure — et non par la mémoire de quelqu'un.

**Ce que cela permet, et c'est le point important**

> **Les durées peuvent être annoncées publiquement.** Sans cette décision, il aurait fallu soit
> **les retirer des textes** *(or c'est l'information que les gens attendent le plus)*, soit
> **construire l'outillage d'abord** *(un chantier de code)*. Le rappel manuel est **la seule des
> trois options qui ne coûte rien et ne dégrade rien.**

**Ce que cela n'est pas**

> ⚠️ **Ce n'est pas une solution définitive, et il ne faut pas la présenter comme telle.** Un rappel
> manuel dépend d'un humain disponible et attentif. L'outillage reste souhaitable — il viendra au
> **volet ③**, avec la garde permanente de **D-020** : **toute suppression restera déclenchée par un
> humain.** Le rappel dit *quand* ; il n'efface jamais tout seul.

**Compatibilité** : ✅ aucune contradiction. **D-020** est appliquée, pas modifiée. **D-027**
*(un message ne ment jamais)* est respecté : le texte public annonce une durée que quelqu'un
s'engage à tenir.

---

### D-034 — `COUPE_PLATEAU` reste **proposé**, mais **signalé** : l'application informe, elle n'interdit pas

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-19 |
| **Chantier** | Remise à niveau documentaire, **lot 2** *(décision produit prise pendant le lot)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Remplace** | ⛔ La doctrine précédente du même lot : *« interdit en EDR, non proposé dans l'interface, conservé pour l'existant »*. **Cette formulation-là est PÉRIMÉE et ne doit plus être reprise.** |
| **Couvre** | Le format d'après-midi `COUPE_PLATEAU` — code, interface et documentation |

**Décision, dans les mots de Romain**

> *« `COUPE_PLATEAU` reste disponible et sélectionnable dans Maxilou, mais doit être explicitement
> signalé comme comportant des phases finales qui ne sont pas conformes au cadre École de Rugby.
> L'utilisateur doit être averti avant de l'utiliser. Maxilou informe et sécurise le choix sans
> supprimer techniquement cette possibilité. »*

**Ce que la décision vise — et ce qu'elle ne vise pas**

> ✅ **Permettre** l'usage du format à un organisateur qui **sait** que le cadre applicable à son
> événement l'autorise, ou qui se situe **hors** du cadre École de Rugby.
>
> ✅ **Empêcher** qu'on le sélectionne **par méconnaissance de la règle**.
>
> ⛔ **Ne PAS** présenter le format comme conforme École de Rugby.
> ⛔ **Ne PAS** présenter son usage comme interdit dans tout contexte.
> ⛔ **Ne PAS** prétendre déterminer quel règlement s'applique à l'événement.

**Pourquoi c'est cohérent avec le reste du dossier**

> C'est **D-031 appliquée à la lettre** : *« l'application ne porte pas la réglementation ; le
> responsable la renseigne »*. Retirer le format aurait été une décision **réglementaire prise par
> le logiciel** — exactement ce que D-031 refuse. Le signaler, c'est **informer sans décider**.

**Ce que l'interface fait, concrètement**

| Quand | Ce qui se passe |
|---|---|
| Carte de choix | Titre **« ⚠️ Coupe + Plateau — hors cadre École de Rugby »**, liseré ambre, description qui explique les phases finales |
| À la sélection | **Confirmation** : *« Vous choisissez un format comportant des phases finales… Vérifiez qu'elles correspondent bien au règlement applicable à votre événement. »* — **Annuler** / **Continuer avec Coupe + Plateau** |
| Annuler | **Rien n'est changé** — le format précédent est remis, bouton compris |
| Tant qu'il est retenu | Un **encart de rappel** reste affiché sur la fiche de la catégorie |

**🚧 Ce que la décision NE change PAS — garde-fou explicite**

> ⚠️ Dans la **demande d'autorisation FFR**, `COUPE_PLATEAU` continue de produire un statut
> **« manquant »** avec le motif *« hors périmètre École de Rugby »*. **C'est délibéré, et ce
> n'était pas un effet de l'ancienne doctrine** : ce formulaire est **spécifiquement** celui de
> l'École de Rugby. Y déclarer un format que ce cadre interdit reviendrait à faire dire à
> l'application le contraire de la règle qu'elle cite. Le comportement serveur est donc
> **inchangé**, et le test qui le vérifie l'est aussi.
>
> ⚠️ **Aucune mécanique métier n'est touchée** : générateur Coupe + Plateau, propagation du
> vainqueur, petite finale, départage obligatoire, match en attente, correction en cascade — tout
> fonctionnait déjà et **n'a pas été réécrit**.

**Où cette décision est appliquée**

> `frontend/js/admin.js` *(table des formats, drapeau `horsCadreEdr`, confirmation)* ·
> `frontend/js/admin-reglages.js` *(carte signalée, encart de rappel)* ·
> `frontend/css/styles.css` + `frontend/css/theme-r92.css` *(les DEUX feuilles — voir le piège
> connu du thème clair)* · `docs/formats-apres-midi.md` · `README.md` ·
> `docs/guide-utilisateur.md` · `docs/architecture.md`.

---

### D-035 — Le `CHANGELOG` raconte le produit et la fiabilité, et il entre dans la règle de la carte

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-19 |
| **Chantier** | Remise à niveau documentaire, **lot 3** |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | `CHANGELOG.md` — son critère de contenu, et sa tenue à jour |
| **Étend** | **D-029** *(règle de la carte à jour, `CLAUDE.md` §8 bis)* — la liste passe de **3** à **4** documents |

**Le problème constaté, chiffré**

> `CHANGELOG.md` — **2 406 lignes**, tenu sans interruption pendant des mois — **s'est arrêté au
> 2026-08-04**. Entre cette date et le 2026-08-19, **12 enregistrements** ont touché le code, les
> tests ou l'automatisation **sans qu'une seule ligne y soit ajoutée**. Y figuraient pourtant les
> deux améliorations de fiabilité les plus notables de l'été : le **contrôle avant publication**
> *(C-013)* et **+114 vérifications** *(C-011 et C-012, 589 → 703)*.

**La cause, et elle n'est pas humaine**

> **`CLAUDE.md` §8 bis nommait trois documents. Le `CHANGELOG` n'en faisait pas partie.** Les
> sessions d'industrialisation journalisaient dans `SESSIONS.md`, qui n'a ni la même fonction ni le
> même lecteur. **Le journal a décroché exactement là où la règle ne regardait pas** : un défaut de
> **périmètre**, pas de discipline.

**Décision retenue**

> ✅ **Critère de contenu** *(option (b) retenue par Romain)* : le `CHANGELOG` raconte les
> **évolutions produit visibles** *et* les **évolutions techniques significatives qui changent
> réellement la fiabilité ou le fonctionnement**.
>
> ⛔ Il ne réclame **pas** une entrée par commit, ni pour un travail purement documentaire, ni pour
> une reformulation de commentaires sans effet sur le comportement.
>
> ✅ **Le `CHANGELOG` rejoint la « carte » de `CLAUDE.md` §8 bis**, pour que le décrochage ne puisse
> pas se reproduire — *« au moment approprié »*, c'est-à-dire au moment même où on le rouvre.

**Ce que cela ne change pas**

> **`SESSIONS.md` reste le journal exhaustif du chantier d'industrialisation.** Deux journaux, deux
> lecteurs : l'un pour qui utilise l'application, l'autre pour qui reprend le chantier. Le
> `CHANGELOG` renvoie explicitement vers lui.

**⚠️ Ce que cette décision ne referme PAS**

> **R-075 reste entier.** *« Rien ne permet de dire quelle version tourne »* : toutes les entrées du
> `CHANGELOG` restent sous `## [Non publié]`, et `git tag` ne renvoie toujours rien. Rouvrir le
> journal **n'est pas** publier des versions — ne pas confondre les deux.

---

### D-036 — Le découpage de la remise à niveau documentaire en **6 lots**

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-19 |
| **Chantier** | Remise à niveau documentaire — **le chantier lui-même** |
| **Statut** | ✅ **VALIDÉE — décision du propriétaire du projet** |
| **Couvre** | Le pilotage du chantier : ses 6 lots, leur ordre, leur périmètre et leurs critères de fin |
| **Inscrite dans** | `PLAN.md` **§13** — *« Remise à niveau documentaire — 6 lots »* |
| **Voisines** | **D-034** *(lot 2)* · **D-035** *(lot 3)* |

**Le problème que cette décision referme**

> ⚡ **Le découpage complet en 6 lots n'existait PAS dans le dépôt.** Constaté pendant le **lot 3**,
> par une recherche exhaustive : tous les fichiers suivis, **l'historique complet toutes branches**
> *(`git log --all -S`, 8 variantes de casse)*, **103 branches locales**, **44 distantes**, les
> `notes`, le `stash`, les **étiquettes**, et les **27 objets orphelins** du dépôt.
>
> **Résultat : zéro définition des LOT 4, 5 et 6.** L'unique occurrence du mot *« lot 4 »* se
> trouvait dans un **commit abandonné** *(`89ab0ce`, objet orphelin)*, et elle ne faisait que
> **nommer** le lot sans le définir — elle n'a d'ailleurs pas survécu au commit publié.
>
> **Conséquence** : le chantier n'était **pas reprenable** sans la conversation d'origine. C'est
> exactement le défaut que ce chantier corrige, appliqué au chantier lui-même.

**Décision retenue**

> ✅ **Les LOT 1 à 3 sont CONSTATÉS A POSTERIORI**, à partir de faits que le dépôt prouve seul —
> leurs commits, leurs fichiers, leurs décisions :
>
> | Lot | Commit | Décision |
> |---|---|---|
> | **LOT 1** — les repères qui pouvaient tromper | `8e08552` | — |
> | **LOT 2** — le format que personne ne pouvait découvrir | `969e673` | **D-034** |
> | **LOT 3** — rouvrir le journal des évolutions | `b91cbfe` | **D-035** |
>
> 🏛️ **Les LOT 4, 5 et 6 sont DÉFINIS OFFICIELLEMENT le 2026-08-19 par le propriétaire du
> projet.** Leur définition — objectif, fichiers, dépendances, méthode, critères de fin — est
> reproduite intégralement dans `PLAN.md` **§13**.
>
> ⭐ **Cette décision est désormais LA SOURCE DE VÉRITÉ pour la suite du chantier.**

**⚠️ Ce que cette décision NE dit PAS, et il faut le lire**

> Les LOT 4 à 6 **ne sont pas une reconstitution** de quelque chose qui aurait existé. Ils
> **n'étaient inscrits nulle part** : leur définition **naît ici**. Les présenter comme retrouvés
> serait faire passer une décision pour un fait historique — précisément l'erreur que **M-06**
> cherche à empêcher.
>
> C'est pourquoi `PLAN.md` **§13 sépare visuellement les deux registres** : 🧾 **constaté** pour les
> lots 1 à 3, 🏛️ **décidé** pour les lots 4 à 6.

**Pourquoi la décision a été prise à ce moment-là**

> Parce que le **lot 3 a buté dessus**. Faute de plan écrit, le périmètre du lot 3 a dû être
> reconstitué à partir des seuls faits du dépôt — ce qui a marché, mais **par chance** : rien ne
> garantissait qu'un autre lecteur arrive à la même conclusion. La session suivante aurait pu
> **inventer** un périmètre et le croire officiel.

**Ce que cela change pour les sessions futures**

> Une session qui reprend ce chantier ouvre `PLAN.md` **§13** et y trouve : pourquoi le chantier
> existe, son principe, les 6 lots, leur ordre, leur état, leurs dépendances, leurs commits, les
> décisions associées, les critères de fin, et ce qui reste. **Aucune conversation n'est
> nécessaire.**


---

### D-037 — L'arbitrage de **R-092** et **R-093** : les deux derniers problèmes sans rattachement

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-19 |
| **Chantier** | Aucun — **arbitrage préparatoire**, avant l'ouverture du chantier suivant |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | **R-092** · **R-093** · la couverture du plan *(`PLAN.md` §12)* |
| **Voisines** | **D-C012-2** *(qui avait laissé R-092 délibérément sans priorité)* · **D-034** *(qui a déplacé une barrière dont R-092 dépendait, sans que ce soit son objet)* |

**Le problème posé**

> Deux problèmes étaient entrés au registre **après la clôture de l'ÉTAPE 3**, trouvés par le
> chantier **C-012** : **R-092** *(2026-08-16)* et **R-093** *(2026-08-18)*. **Aucun des deux
> n'était rattaché à un chantier.** Tant qu'ils ne l'étaient pas, l'affirmation de `PLAN.md`
> *« 91 sur 91 placés, 0 sans place »* restait fausse, et **on ne pouvait pas ouvrir le chantier
> suivant en sachant ce qu'on laissait derrière soi**.

**Les quatre décisions, dans les mots de Romain**

> **1.** *« R-092 est rattaché à C-015. Sa correction doit être conçue avec les mécanismes de
> correction, forfait et annulation de match afin que toute invalidation d'un résultat efface
> également les données détaillées devenues périmées. »*
>
> **2.** *« R-093 devient un chantier autonome d'industrialisation. Son périmètre ne doit pas être
> limité à `Matchs` : l'analyse a montré que `Equipes` utilise également un schéma d'écriture
> positionnelle associé à l'ajout de colonnes en fin de tableau. »*
>
> **3.** *« C-015 reste le prochain chantier à ouvrir. R-093 n'est pas un préalable bloquant à
> condition que C-015 respecte la règle suivante : aucune nouvelle colonne utilisée par un mécanisme
> d'écriture positionnelle ne doit être insérée au milieu de la structure existante ; si une
> nouvelle colonne est nécessaire dans `Matchs`, elle doit être ajoutée à la fin de
> `ENTETES.Matchs`. »*
>
> **4.** *« Cette règle protège C-015 mais ne referme pas R-093. Le futur chantier R-093 devra
> traiter le problème structurel proprement. »*

**Ce que cela fixe, et où c'est inscrit**

| | Ce qui est décidé | Où c'est écrit |
|---|---|---|
| **R-092** | Rattaché à **C-015** — l'exigence est que **toute invalidation d'un résultat efface le détail périmé** | `PLAN.md` **C-015** · `RISQUES.md` |
| **R-093** | Devient **C-031**, *« les colonnes du classeur : une seule façon de les désigner »* — ⚠️ **périmètre : au minimum `Matchs` ET `Equipes`** | `PLAN.md` **C-031** · `RISQUES.md` |
| **La règle provisoire** | Toute colonne nouvelle s'ajoute **à la fin** de la structure, **jamais au milieu** | `PLAN.md` **C-015**, encadré 🛡️ |
| **L'ordre** | **C-015 reste le prochain chantier à ouvrir** ; R-093 **n'est pas** un préalable bloquant | `PLAN.md` **C-015** et **C-031** |

**Pourquoi C-015 pour R-092, et pas un chantier à part**

> Parce que C-015 construit **l'annulation** *(D-015)*, le **forfait** *(D-011)* et la **correction
> de score** *(D-012)* — **les trois gestes qui invalident un résultat**. R-092 **est** le trou dans
> ces gestes. ⚠️ **Et le traiter ailleurs coûterait deux fois** : il faudrait rouvrir les mêmes
> fonctions, et faire relire deux fois le même risque de régression sur **le geste le plus répété de
> la journée**. Enfin, sans lui, **C-015 ajouterait un chemin d'invalidation de plus qui
> reproduirait le défaut**.

**Pourquoi un chantier autonome pour R-093, et pas un rattachement**

> Parce qu'**aucun des 30 chantiers ne porte l'intégrité des écritures dans le classeur**. C-016
> protège contre les *gestes destructeurs* — c'est du contrôle d'accès ; C-027 ajoute des *tests de
> bout en bout*. R-093 n'est ni l'un ni l'autre : c'est une **convention de désignation des
> colonnes** que **rien ne vérifie**. L'insérer dans un chantier voisin le rendrait **invisible** —
> et c'est exactement le mécanisme qui a produit les décrochages documentaires de ce projet.

**Pourquoi la règle provisoire suffit à C-015 — et pourquoi elle ne suffit à rien d'autre**

> ✅ **Elle suffit à C-015**, parce que l'analyse du 2026-08-19 a établi, en lisant le code, que
> **trois de ses cinq fonctionnalités ne persistent aucune donnée nouvelle** *(plafond de score,
> départage, déplacement de match)*, que **le forfait et l'annulation peuvent se passer d'une
> colonne**, et qu'**aucune décision D-011 → D-015 n'en impose une**.
>
> ⛔ **Elle ne suffit à rien d'autre**, parce qu'elle **repose sur la vigilance d'une session**. Le
> jour où quelqu'un place une colonne au milieu par souci de lisibilité — *« mettons `forfait` à
> côté des scores »* — le décalage revient, **en silence**. 🎯 **C'est précisément la différence
> entre une règle et une garantie**, et c'est la raison d'être de **C-031**.

**⚠️ Ce que cette décision NE fait PAS**

> - ❌ Elle **ne corrige** ni R-092 ni R-093 — **aucune ligne de code n'a été écrite** ;
> - ❌ Elle **ne conçoit pas** la solution technique de C-031, ni la conception détaillée de C-015 ;
> - ❌ Elle **ne tranche pas la priorité de R-092** *(voir `RISQUES.md` : elle reste « à confirmer »,
>   et la vérification qui la trancherait est nommée)* ;
> - ❌ Elle **ne crée aucune colonne** et **ne change aucune règle métier** — D-011 à D-015 sont
>   inchangées.

---

### D-038 — L'ouverture du chantier **Confiance**, sa méthode, et ses trois réponses fondatrices

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-19 |
| **Chantier** | 🛡️ **Confiance** — cybersécurité et juridique de l'existant *(`PLAN.md` §14)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | L'ouverture du chantier · la règle `CLAUDE.md` **§8 quinquies** · la chaîne de clôture · la source unique `REFERENTIELS.md` · les réponses **Q1**, **Q2**, **Q3** |
| **Voisines** | **D-005** *(périmètre fermé du site)* · **D-016 à D-020** *(sécurité et données, issues des domaines B et C)* · **D-033** *(les durées sont tenues par un rappel manuel)* · **D-035** *(le `CHANGELOG` entre dans la règle de la carte)* |

**Le problème posé**

> L'audit avait déjà identifié **27 problèmes** de sécurité et de protection des données
> *(R-014 → R-040)*. Ils sont sérieux et chiffrés. ⚡ **Mais aucun n'est rattaché à un texte
> officiel** : recherche faite dans tout le dépôt, les mots *CNIL*, *ANSSI*, *article 82* ou
> *RGPD article* n'apparaissaient **nulle part** hors des fichiers de suivi qui les citent en
> passant.
>
> 🎯 **Conséquence pratique** : on savait ce qui n'allait pas, mais on ne pouvait **pas** écrire
> *« nous l'avons corrigé au titre de tel texte »*. Une correction indéfendable devant un tiers,
> même excellente techniquement.

---

#### 1. Ce que Romain a décidé — la méthode

> ✅ **Le chantier ne re-auditera pas. Il adosse l'audit existant à des référentiels, puis corrige.**

**La chaîne de preuve, imposée dès le lancement**, et qui doit pouvoir être reconstruite pour chaque
sujet : *référentiel officiel → applicabilité → état réel de Maxilou → écart → qualification →
solution proportionnée → validation → exécution → contrôle après exécution → contrôle Git →
contrôle du dépôt publié.*

⚡ **Et elle a payé dès la première étape.** **CF-0** a établi que **6 référentiels sur 15**, cités
de mémoire, étaient **faux, périmés ou mal calibrés** — dont une position de la CNIL **qui n'existe
pas**, une recommandation modifiée en **décembre 2025**, et un article de loi déplacé en **mai
2024**. ⛔ **Sans vérification, Maxilou aurait été corrigé contre des textes inexistants.**

---

#### 2. ⭐ Ce que le chantier ne doit JAMAIS faire semblant de croire

> **Principe posé par Romain, et permanent** : *« Le chantier Confiance doit préparer Maxilou à une
> utilisation réelle sans faire semblant que cette utilisation a déjà commencé. »*

| | Ce qui est vrai |
|---|---|
| 🔵 **ÉTAT ACTUEL** | Développement personnel, **de la propre initiative de Romain**. Données **fictives**. ⛔ **Aucune exploitation réelle**, ⛔ **aucune adoption** |
| 🟡 **PRÉREQUIS** | Ce qu'on prépare dès maintenant |
| ⛔ **DÉCISIONS FUTURES** | Ce qu'aucune session ne peut décider à la place des structures |

⛔ **Interdiction permanente** : ne jamais écrire que l'EDR du Racing Club de France ou Génération
R92 ont **commandé**, **étudié**, **validé** ou **adopté** Maxilou. **Aucune ne l'a fait.** Elles
pourront accepter, demander des modifications, **ou ne pas souhaiter utiliser la solution**.

⭐ **Aucune échéance n'existe** : ni date de tournoi réel, ni date de première invitation, ni date de
mise en production. **La priorité est la qualité et la démonstration, pas la vitesse.**

---

#### 3. Q1 — Le responsable du traitement **n'est pas déterminé**, et ce n'est pas à ce chantier de le faire

**Ce que Romain a précisé** : il édite personnellement Maxilou **aujourd'hui**, mais les données
réelles seront un jour traitées pour les besoins de **l'EDR du Racing Club de France**, de
**Génération R92**, ou **des deux**. ⚠️ **La répartition n'est pas définie**, et il ne sera pas
personnellement à l'origine de la décision de traiter ces données pour son propre compte.

**Ce que le texte confirme** — **[R1]** art. 4(7) : le responsable est celui *« qui **détermine les
finalités et les moyens** »*. ⭐ **Le critère est QUI DÉCIDE — jamais qui code, jamais qui saisit.**

| Configuration future | Qualification | Ce qu'elle ajoute |
|---|---|---|
| Une structure décide seule | Elle est **responsable** | Un seul jeu d'obligations |
| ⚠️ **Les deux décident ensemble** | **Responsables conjoints** *(art. 26)* | 🔴 **Un accord écrit entre elles devient obligatoire** |
| Romain saisit à leur demande | **Personne agissant sous l'autorité du responsable** *(art. 29)* | ⭐ **Il n'est pas responsable du traitement** |

✅ **DÉCIDÉ** : ⛔ **ne jamais conclure que Romain est personnellement responsable du traitement du
seul fait qu'il développe et publie Maxilou.** La détermination est une **décision
organisationnelle**, à préparer *(CF-2)* et à présenter **au moment de la présentation de Maxilou**
— ⛔ **pas avant**, les structures n'ayant rien étudié.

⚠️ **Et elle ne doit pas devenir artificiellement bloquante** : CF-4, CF-5 et CF-6 se préparent avec
des **champs à compléter**, comme le chantier **C-005** l'a déjà fait.

##### ⚠️ Une tension à connaître, révélée par le contrôle de cohérence de CF-1

> **Le chantier C-005** *(`PLAN.md`, volet ②)* écrit, à propos de ce qui l'a débloqué :
> *« les deux informations qui manquaient sont trouvées — **responsable : Génération R92** ·
> contact : `generationr92@gmail.com` »*. Et **D-018** reprend la même désignation.
>
> 🎯 **Ce n'est pas une contradiction, mais il faut savoir la lire.** Ces deux mentions constatent
> ce que la page RGPD **du site vitrine** affiche déjà — **le responsable de CE SITE**. Elles ne
> déterminent **pas** le responsable du traitement **de Maxilou**, qui n'existe pas encore.
> D'ailleurs C-005 ajoute lui-même la réserve : *« l'association est déclarée "déclaration en
> cours". **Aujourd'hui, c'est Romain qui porte ces données de fait** »* *(D-021)*.
>
> ⭐ **Et le livrable réel ne nomme personne** : [`../textes-information-donnees.md`](../textes-information-donnees.md)
> écrit **`[ASSOCIATION ORGANISATRICE]` entre crochets**, et désigne le responsable **par son
> rôle** — précisément pour que le nom puisse être posé **une fois qu'il sera déterminé**.
>
> ✅ **Donc : rien à corriger dans C-005 ni dans D-018** — ce sont des constats **vrais à leur
> date**, et la règle interdit de réécrire les traces passées. ⛔ **Mais aucune session ne doit
> lire ces mentions comme une détermination du responsable du traitement.** **C'est la présente
> décision qui fait foi sur ce point**, et elle dit : **non déterminé**.

---

#### 4. Q2 — Le compte Google : ne pas pérenniser le Gmail personnel

**Ce que Romain a précisé** : le compte actuel est bien un **Gmail personnel gratuit**, mais **ce
n'est pas l'architecture cible**. Comme `passation.md` le prévoit déjà, les ressources ne devront
plus dépendre de son identité personnelle.

> *« Je ne souhaite pas que nous cherchions à pérenniser juridiquement une architecture reposant sur
> mon Gmail personnel si la bonne solution consiste à préparer correctement cette sortie. »*

**Ce que CF-0 a établi** :

- **[R13]** — le CDPA couvre **Google Workspace, toutes éditions**, pose *« Google is a processor
  and Customer is a controller »*, et **s'incorpore automatiquement**. ⚠️ **Mais il vise un
  « Customer » Workspace ou Cloud — un compte grand public n'entre pas dans ce cadre** ;
- **[R14]** — ⭐ **Google Workspace for Nonprofits est gratuit**, et l'éligibilité en France suppose
  une association inscrite au **Journal Officiel des Associations**, validée par un tiers.

✅ **DÉCIDÉ** : l'architecture cible est un **compte institutionnel**, ouvert au nom de la structure
qui sera désignée responsable, propriétaire du classeur, du script, du Drive et de la boîte d'envoi.
**La piste gratuite doit être instruite en premier** *(CF-3)*.

⛔ **Aucune migration, aucun compte créé, aucune démarche engagée, aucune configuration modifiée.**

---

#### 5. Q3 — La mesure de visibilité : garder la valeur, pas le mécanisme

**Ce que Romain a décidé** : la **valeur fonctionnelle** est à conserver — fournir aux partenaires
une mesure utile de leur visibilité. ⭐ **Mais il n'est pas attaché au mécanisme actuel.**

> *« Ne cherche pas à sauver le code actuel. Cherche d'abord la manière juridiquement et
> techniquement la plus simple d'obtenir le résultat métier recherché. »*

✅ **Réponse à la question de l'unité de mesure** : **« nombre de visites » peut remplacer « nombre
de personnes »** si cela permet de supprimer la persistance sur le terminal.

> *« Je préfère une mesure honnêtement qualifiée de "visites" à une mesure présentée comme
> "personnes" si cette dernière nécessite une identification ou une persistance supplémentaire. »*

**Ce que CF-0 a apporté à cette question** :

- **[R5]** — Maxilou tient **4 conditions sur 7** de l'exemption. C'est **la finalité** qui bloque ;
- **[R2]** — le texte vise *« accéder à des informations **déjà stockées** »* ou *« **inscrire** des
  informations »* : ⭐ **une variable en mémoire de page n'est ni l'un ni l'autre** ;
- **[R12]** — ⭐ **Apps Script ne voit ni l'adresse IP du visiteur, ni les en-têtes HTTP.**

⛔ **Ce qui n'est PAS décidé** : ni la suppression de la fonctionnalité, ni la conservation de son
implémentation, ni l'ajout d'un mécanisme de consentement. **CF-7 devra étudier et démontrer
formellement la solution avant toute exécution.** La suppression ne sera envisagée **qu'après**
avoir établi qu'aucune solution proportionnée ne conserve la valeur.

---

#### 6. La gouvernance documentaire — **`CLAUDE.md` §8 quinquies**

✅ **VALIDÉ** : *une mesure Confiance n'est terminée que lorsque le code, les preuves, le référentiel
applicable, la documentation active et le dépôt publié décrivent tous le même état.*

✅ **VALIDÉ — la source unique** : **`REFERENTIELS.md`** porte les textes ; ailleurs on écrit
l'identifiant `[Rn]`, **jamais le contenu**.

> *« Je ne veux pas que les références juridiques ou cyber soient recopiées dans de multiples
> documents au risque de devenir divergentes ou périmées. »*

✅ **VALIDÉ — la chaîne de clôture** : **16 contrôles logiques**, regroupés en **4 traces**
*(fiche · décision · commit · clôture)*.

> ⭐ **La proportionnalité est une règle permanente, pas une tolérance.** Les 16 contrôles restent
> obligatoires **lorsqu'ils sont applicables**, mais ⛔ **ils ne doivent pas générer artificiellement
> 16 livrables**. Le **contrôle ⑯** est le contrôle final de clôture.

---

**⚠️ Ce que cette décision NE fait PAS**

> - ❌ Elle **ne corrige** aucun problème — **aucune ligne de code n'a été écrite** ;
> - ❌ Elle **ne change** ni les clés, ni une protection, ni une configuration, ni un déploiement ;
> - ❌ Elle **ne détermine pas** le responsable du traitement, et **n'engage aucune structure** ;
> - ❌ Elle **ne tranche pas** le sort de la mesure de visibilité — seulement son **unité de mesure
>   acceptable** ;
> - ❌ Elle **ne crée aucun compte** et **n'engage aucune démarche** auprès d'un fournisseur.

---

### D-039 — La **neutralité institutionnelle** : l'application et le dépôt public ne s'attribuent à personne

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-19 |
| **Chantier** | 🛡️ **Confiance** — étape **CF-4b** *(`PLAN.md` §14.3)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | Le **principe** de neutralité · les **deux surfaces** · les **quinze arbitraires d'exécution** ci-dessous |
| **Voisines** | **D-038** *(ouverture du chantier Confiance — c'est son fondement direct)* · **D-005** *(périmètre fermé du site)* |

**Le problème posé**

> **D-038** avait posé l'interdiction : *« aucune fiche, aucune session, aucun document ne doit leur
> attribuer une décision qu'elles n'ont pas prise »*. ⚡ **Mais elle visait les documents de
> suivi.** Personne n'avait regardé **l'application elle-même**.
>
> Le contrôle a trouvé qu'elle s'attribue à des structures dans ses **pages**, ses **emails**, ses
> **métadonnées**, ses **logos**, ses **liens** — et jusque dans un **document juridique**
> téléchargeable qui faisait signer aux clubs une cession de droits sur l'image de **mineurs** au
> profit d'une association qui n'a rien décidé.
>
> 🎯 **Et le dépôt GitHub public dit la même chose** : sa première phrase annonçait un logiciel
> *« pour l'association … »*, et sa documentation de passation planifiait un transfert vers un
> domaine, un compte de messagerie et **une personne physique nommée** — aucun des trois n'ayant
> rien accepté.

---

#### 1. Le principe

> ⭐ **Aucune organisation réelle ne doit être présentée par l'application comme son éditeur, son
> propriétaire, son organisateur, son expéditeur, son responsable ou son porteur tant qu'elle ne
> l'a pas décidé explicitement.**

**Il s'applique à DEUX surfaces**, et la seconde a dû être ajoutée après la première cartographie :

| | |
|---|---|
| ① | **L'application publiée** — pages, emails, documents générés, métadonnées |
| ② | **Le dépôt GitHub public actif** — `README.md` et documentation active |

⚠️ **Ce que la neutralité SIGNIFIE** : *aucune attribution institutionnelle **active au présent***.
⛔ **Ce qu'elle ne signifie PAS** : *aucune occurrence textuelle historique*. L'historique Git, les
entrées datées du `CHANGELOG`, les audits et les documents de suivi **restent intacts** — ils
racontent un état vrai à leur date, ou expliquent l'interdiction elle-même.

---

#### 2. Ce que Romain a arbitré — quinze points

| # | Arbitrage |
|---|---|
| 1 | **Neutralité institutionnelle de l'application** |
| 2 | **Neutralité institutionnelle du dépôt GitHub public actif** |
| 3 | ⛔ **Le nom « Maxilou » n'apparaît PAS publiquement** pour le moment — il reste la vision interne du projet, pas une marque. *(Constat : il est **absent** du code et de la documentation active ; il ne vit que dans les fichiers de suivi. **Rien à faire.**)* |
| 4 | 🔴 **Suppression pure et simple** du modèle d'autorisation de droit à l'image — ⛔ ni neutralisation, ni déplacement, ni remplaçant |
| 5 | 🔴 **Suppression complète du bandeau de don** : texte, bouton, lien, style — ⛔ **et pas de don générique à la place** |
| 6 | 🟠 **Remplacement des logos institutionnels par une identité neutre** — forme géométrique simple, sans blason, animal, couronne, chiffre, lettre ni nom de produit |
| 7 | 🟠 **Neutralisation des liens institutionnels**, ✅ **conservation des liens fonctionnels** — ⭐ un bouton qui ouvre réellement la page d'un tournoi, d'une invitation, d'un dossier ou d'une réponse **continue de fonctionner** |
| 8 | ⚙️ **`org_club_nom` sans valeur par défaut nommant un club** — le mécanisme reste, son état initial devient neutre |
| 9 | ⚙️ **Neutralisation de `MOT_CLE_CLUB = 'racing'`**, en réutilisant une configuration générique existante si possible |
| 10 | ✅ **Conservation du mécanisme** `url_site_association` / `url_instagram` — ⛔ **on ne retire pas un réglage parce que sa valeur du jour pointe quelque part**. Les **valeurs** du classeur seront vidées par **M1** |
| 11 | **Neutralisation de « Perfs Racing »** — la fonctionnalité reste, son identité devient générique |
| 12 | **Réécriture d'ensemble de `docs/passation.md`** — la procédure est bonne, c'est son **destinataire** qui change |
| 13 | ⏸️ **Le nom du dépôt `tournoi-r92` est conservé** — **réserve d'infrastructure assumée**, qui **n'empêche pas CF-4b de fermer** |
| 14 | ⏸️ **Les identifiants CSS `--r92-*` sont conservés** — identifiants techniques **invisibles**, hors périmètre assumé |
| 15 | 🆕 **Création future de `CF-14 — Adoption institutionnelle`** — inscrite au plan, **non rédigée** |

---

#### 3. ⚠️ Deux points de méthode que cette décision fixe

**a) Toute recherche de contrôle fixe une locale UTF-8.** Constaté pendant la cartographie : sans
locale, une recherche sur des caractères accentués a répondu **« 0 occurrence »** là où il y en
avait **10**. ⛔ **Ne jamais conclure « 0 occurrence » sans avoir vérifié que la recherche gère les
accents.** *(Même famille que le piège `616/616` : un résultat juste en apparence, faux en réalité.)*

**b) Le contrôle final porte sur le dépôt PUBLIÉ**, depuis un clone neuf — jamais sur la seule copie
locale — **et** sur le site réellement servi par GitHub Pages, qui peut différer du dépôt.

---

#### 4. ⛔ Ce que D-039 ne fait PAS

> - ❌ Elle **ne détermine pas** le responsable du traitement — c'est **CF-2**, et la décision
>   reste **NON PRISE** ;
> - ❌ Elle **n'engage aucune structure**, et **ne présume d'aucune adoption future** ;
> - ❌ Elle **ne renomme** ni le dépôt, ni les identifiants techniques ;
> - ❌ Elle **ne touche** ni les clés, ni une protection, ni le classeur, ni un déploiement ;
> - ❌ Elle **n'abandonne aucune** des questions ouvertes de **CF-4a** *(LCEN, GitHub, droit de
>   réponse)* — elle les **ordonne**, elle ne les ferme pas ;
> - ❌ Elle **ne réécrit pas l'histoire** : traces datées, audits et historique Git sont hors
>   d'atteinte.

---

### D-040 — Une preuve de version doit être **discriminante**, et l'enregistrement fait partie du geste

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-20 |
| **Chantier** | 🛡️ **Confiance** — née du lot **CF-4b / L5**, mais ⭐ **de portée permanente** |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Couvre** | Le renforcement de [`../deploiement.md`](../deploiement.md) : ① l'**enregistrement** explicite après collage · ② un **contrôle discriminant de `Code.gs`** avant publication · ③ la distinction **SOURCE → ÉDITEUR → VERSION DÉPLOYÉE → COMPORTEMENT OBSERVÉ** |
| **Voisines** | **D-035** *(le `CHANGELOG` entre dans la règle de la carte)* · `CLAUDE.md` **§8 quater** *(source unique)* et **§13.6** *(ce qui ne se vérifie pas depuis le dépôt)* |

**Le problème posé — et il s'est produit, il n'est pas théorique**

> Le **2026-08-20**, une version Apps Script a été publiée en croyant `backend/Code.gs` recopié
> chez Google. **Trois voyants étaient au vert** : le `ping` répondait, les tests donnaient
> **`703/703 OK, 0 FAIL`**, et une nouvelle version avait bien été publiée. ⛔ **L'ancien `Code.gs`
> était pourtant toujours présent chez Google** — un email réel, envoyé ensuite, portait encore
> l'ancien nom d'expéditeur.
>
> ⛔ **Ce qui n'a PAS été établi, et ne doit pas être présenté comme tel** : **quel geste avait
> manqué**. Collage non effectué, collage incomplet, ou état non enregistré — **les trois restent
> possibles**. Ce qui est démontré, c'est **l'absence du contenu attendu chez Google**, rien de
> plus.
>
> 🎯 **Le défaut n'était ni de l'étourderie, ni un manque de rigueur : c'était une ASYMÉTRIE de la
> procédure.** Elle portait **deux repères sur `Tests.gs`** — un bilan et un nombre de lignes — et
> **aucun contrôle sur `Code.gs`** : le geste 1 était le seul des cinq à n'être suivi de rien.
>
> ⚠️ **Et une nuance qu'il faut écrire, sous peine de mal accuser les tests** : les 703
> vérifications **s'exécutent contre le `Code.gs` du projet** et **détecteraient** une régression
> sur un comportement qu'elles couvrent. Leur silence ce jour-là n'était pas une faiblesse : ⛔
> **aucune d'elles ne touche le nom d'expéditeur.** Le bilan était **vert, sincère, et sans rapport
> avec la modification du jour**. *(Le second repère, le **nombre de lignes**, atteste bien, lui,
> l'identité du fichier de tests collé — pas celle de `Code.gs`.)*

**Ce qui est décidé**

> ⭐ **La règle, en une phrase :**
>
> > **Un contrôle qui donne le MÊME résultat avant et après une modification ne prouve RIEN sur la
> > version. Une preuve de version doit être discriminante.**
>
> **Trois conséquences pratiques, inscrites dans la fiche de redéploiement :**
>
> | | |
> |---|---|
> | **① L'enregistrement est un geste, pas un réflexe supposé** | Après collage, **enregistrer explicitement avant de poursuivre** — la fiche ne le demandait **nulle part**. ⛔ **Ce n'est pas la cause démontrée de l'incident** *(elle reste inconnue)* : c'est un **garde-fou**, qui couvre aussi bien un collage manqué qu'un état non enregistré |
> | **② `Code.gs` doit être contrôlé avant publication** | Nombre de lignes · dernière fonction déclarée · ⭐ **une chaîne témoin introduite par le lot**, avec **son contraire** quand il existe *(l'ancienne chaîne, attendue à 0)* |
> | **③ Quatre états, jamais confondus** | **SOURCE** *(le dépôt)* → **ÉDITEUR** *(collé et enregistré)* → **VERSION DÉPLOYÉE** *(le geste 3, et lui seul)* → **COMPORTEMENT OBSERVÉ**. ⛔ **Aucun ne prouve le suivant** |
>
> ⚠️ **Et un piège à connaître, découvert le jour même** : une apostrophe dans une chaîne du code
> s'écrit `\'`. Chercher `L'organisation du tournoi` renvoie **0** sur un fichier **parfaitement
> collé**. ➡️ **Un témoin se choisit sans apostrophe, sans accent et sans guillemet.**

**Ce que la décision NE demande PAS**

> - ❌ **Pas** une sixième étape dans la fiche : elle se lit **debout, dans l'urgence**, et
>   l'alourdir la rendrait **moins suivie, pas plus sûre**. Les trois ajouts se logent **dans les
>   gestes existants** ;
> - ❌ **Pas** d'abandonner les deux nombres de `Tests.gs` — ils **restent** la preuve d'identité de
>   ce fichier ;
> - ❌ **Pas** d'outillage nouveau : `clasp` n'est **pas installé**, et l'installer pour recalculer
>   une empreinte chez Google serait **disproportionné** *(`CLAUDE.md` §10)* ;
> - ❌ **Pas** de passe rétroactive sur les déploiements passés — on applique la règle **à ce qu'on
>   fait**, comme **§8 quater**.

**Portée**

> ⭐ **Permanente, et elle servira avant la fin de CF-4b** : le lot **L8** exige lui aussi un
> redéploiement. La règle vaut ensuite pour **tout chantier** touchant le serveur.

---

### D-041 — La neutralisation **fonctionnelle** : ce qui est visible se neutralise, ce qui est technique se réserve

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-22 |
| **Chantier** | 🛡️ **Confiance** — étape **CF-4b**, lot **L8** |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, après un audit à **quatre agents indépendants** |
| **Couvre** | Les **cinq arbitrages** A-1 → A-5 · les **garde-fous obligatoires** issus des constats N-1 → N-8 |
| **Voisines** | **D-039** *(le principe de neutralité)* · **D-040** *(preuve de version discriminante)* · `CLAUDE.md` **§8 quater** |

**Le problème posé — et il n'a pas été trouvé par une relecture**

> Trois des arbitrages initialement validés pour L8 reposaient sur des **prémisses fausses**, et
> aucun contrôle textuel ne pouvait le montrer. Il a fallu **lire ce que le code FAIT** :
>
> - `boutique_r92_disponible` était classé *« identifiant interne »*. ⛔ **Il ne l'est pas** :
>   `getConfig` est **public** *(`Code.gs:345`)*, `filtrerConfigPublique` recopie les **noms de
>   clés verbatim** *(`Code.gs:736`)*, et l'adresse de l'API est **en clair** dans un fichier servi
>   par GitHub Pages. Le nom sortait donc dans une réponse **lisible par n'importe qui** ;
> - *« vide par défaut »* était présenté comme l'état **neutre** du futur mot-clé Perfs. ⛔ **C'est
>   l'état le plus DANGEREUX** : `indexOf('')` renvoie `0`, donc **toutes** les équipes auraient été
>   comptées comme celles du club — avec un bilan ≈ 50 % de victoires, **plausible et faux** ;
> - le préfixe de bilan `'R92 — '` était inscrit au périmètre. ⛔ **Il n'est visible que de
>   l'administrateur** et c'est **le repère de preuve de D-040** : le changer aurait créé plus de
>   risque que de bénéfice.

---

#### 1. Les cinq arbitrages

| # | Arbitrage | Motif |
|---|---|---|
| **A-1** | 🔄 **`boutique_r92_disponible` → `boutique_disponible`**, avec une **migration douce à la LECTURE** | Le nom sortait publiquement. ⛔ **Aucune migration manuelle du classeur** : la reprise est automatique, la valeur existante est conservée |
| **A-2** | ⏸️ **Le préfixe `'R92 — '` est CONSERVÉ** — réserve technique | Invisible de l'utilisateur · **repère de preuve de D-040** · même famille que le nom technique du projet |
| **A-3** | ⏸️ **Le menu « Tournoi R92 » du classeur est CONSERVÉ** | Même réserve. ⚠️ Et `onOpen` n'est **pas** rechargé par un redéploiement : le changer ferait croire à un collage manqué **au moment où l'on configure les clés** |
| **A-4** | ⏸️ **`92350 Le Plessis-Robinson` et « associations du 92 » CONSERVÉS** | ⭐ Un **code postal** et un **numéro de département**. ⛔ Ni Racing 92, ni Génération R92 |
| **A-5** | **Deux sous-lots de contrôle, UN SEUL commit** | Frontend et backend passent par **deux canaux de publication différents** ; le geste risqué reste le collage chez Google, qu'on ne répète pas |

> ⚠️ **A-2, A-3 et A-4 ne sont PAS une autorisation générale de conserver « R92 ».** Chaque
> occurrence se qualifie **une par une**, sur un seul critère : *est-elle visible, au présent, par
> quelqu'un d'autre que l'administrateur ?*

---

#### 2. Les garde-fous rendus OBLIGATOIRES

| | |
|---|---|
| 🔴 **Mot-clé vide ⇒ `estDuClub()` renvoie `false`** | ⛔ Interdiction formelle de laisser `indexOf('') >= 0` valoir `true` |
| 🔴 **Deux messages DISTINCTS** | *« mot-clé non configuré »* ≠ *« aucune équipe correspondante »*. ⛔ **Aucun chiffre n'est calculé** quand la configuration manque : un message qui accuse les données à la place du réglage envoie chercher au mauvais endroit |
| **Normalisation des deux côtés** | `trim()` + `toLowerCase()` sur le mot-clé **et** sur le nom d'équipe — l'ancien code ne normalisait que le nom |
| **Exposition en vue `live` uniquement** | ⭐ `getAll` transporte **déjà** la config : **zéro appel réseau supplémentaire**. ⛔ Pas dans `invitation`, rien n'y en a besoin |
| **Cache versionné `_v2` → `_v3`** | Sans ce saut, la copie de secours **de 6 h** aurait masqué la nouvelle configuration après le redéploiement. ⛔ **Aucune infrastructure nouvelle** : le mécanisme existait |
| ⭐ **Un repère volatil se REMESURE** | Les nombres de lignes et le bilan de tests ne se recopient **jamais** : ils se mesurent après le lot *(**§8 quater**, et c'est le mécanisme du `616/616`)* |

---

#### 3. ⛔ Ce que D-041 ne fait PAS

> - ❌ Elle **ne renomme** ni le dépôt, ni les identifiants CSS, ni les clés de stockage local ;
> - ❌ Elle **ne touche pas** aux champs du **PDF fédéral** *(`Case à cocher92` est un identifiant
>   Adobe — le renommer produirait un formulaire officiel incomplet, sans la moindre erreur)* ;
> - ❌ Elle **ne présume d'aucune adoption** : elle **retire** un nom de club, elle n'en met aucun ;
> - ❌ Elle **ne clôt pas CF-4b** — **M1** *(les valeurs du classeur et l'**affiche**)* reste entier
>   et **bloquant**.

---

### D-042 — Le **profil du club** : principe directeur, familles de données, et cycle de vie

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1**, étape **M1-A** |
| **Statut** | **VALIDÉE** |
| **Décidée par** | Romain |

**Problème posé**

> L'application ne dispose d'**aucun endroit où un club se décrit**. Son identité, ses responsables
> et ses habitudes sont dispersés : certains dans l'onglet `Config`, d'autres **en dur dans le
> code** *(7 signatures de documents, 4 noms d'expéditeur, 1 repère visuel sur 8 pages)*, d'autres
> encore nulle part. Conséquence : **le cœur du logiciel connaît, ou ignore, le club au hasard des
> fichiers.**

**Décision prise**

> **① Le principe directeur.**
> **Le cœur de l'application ne doit pas connaître en dur l'identité ni les caractéristiques
> permanentes du club qui l'utilise.** Les données réellement permanentes sont centralisées, puis
> utilisées aux bons endroits.
>
> ⚠️ **Et son garde-fou, tout aussi important** : *une donnée n'est permanente au niveau du club que
> si elle reste vraie **indépendamment de l'organisation d'un tournoi particulier**.* Une habitude,
> un prestataire souvent retenu, un partenaire régulier ou une pratique fréquente **ne suffisent
> pas**. ⛔ **On ne transforme pas des habitudes en vérités automatiques.**
>
> **② Les sept familles.**
>
> | Famille | Ce qu'elle contient |
> |---|---|
> | 🏛️ **P — Identité permanente du club** | Nom, code club, label EDR et sa date, président, représentant, zone de vacances, mot-clé Perfs, liens, logo, adresse de contact « données » |
> | 🏟️ **D — Valeur proposée par défaut** | Site habituel *(nom, adresse, type de terrain, vestiaires)*, géométrie du stade, infos pratiques, doctrine sportive, encadrement |
> | 🗓️ **E — Donnée de l'événement** | Tout `tournoi_*`, horaires, dates limites, référents du jour, médecin, secours, fournisseurs, prix, récompenses, effectifs |
> | 🧮 **C — Donnée calculable** | Nombres de clubs, d'équipes, de participants, d'éducateurs, de terrains ; formes de jeu ; format sportif ; responsable sécurité ; droits d'inscription |
> | 📜 **R — Référentiel réglementaire** | `RefFFR_*`, formulaire officiel, mentions FDM EDR, circuit de dépôt, barème, grilles de temps |
> | 🔒 **Transversal — données personnelles** | Voir **D-043** |
> | ⚙️ **Transversal — champs propres à Maxilou** | Voir **D-045** |
>
> ⛔ **Deux interdictions permanentes attachées aux familles :**
> **C** — une donnée que le logiciel sait calculer **ne se stocke jamais** dans une configuration
> permanente ; elle se recalcule *(sinon on reproduit le mécanisme du `616/616` : un chiffre juste
> recopié, la source bouge, la copie reste — **§8 quater**)*.
> **R** — une règle FFR, un formulaire officiel, un barème ou un circuit réglementaire **ne devient
> jamais un réglage propre au club**. Un club qui pourrait changer la règle ne serait plus conforme.
>
> **③ Le cycle de vie — ce qui se passe quand on MODIFIE une donnée.**
>
> | Famille | Effet d'une modification | Mécanisme |
> |---|---|---|
> | 🏛️ **A — permanente** | La nouvelle valeur devient **la valeur courante de référence du club**. Tous les consommateurs qui représentent **l'état actuel** l'utilisent | **LECTURE DIRECTE** |
> | 🏟️ **B — proposée par défaut** | Elle devient la **nouvelle proposition** pour l'avenir. ⛔ **Aucun effet** sur un tournoi déjà renseigné | **COPIE VOLONTAIRE**, puis ⛔ **aucun lien vivant** |
> | 🗓️ **C — événementielle** | Se modifie **dans le tournoi**, et nulle part ailleurs. Une modification du profil n'a **aucun effet** | ⛔ **aucun lien** |
>
> **④ Le profil est un référentiel VIVANT.**
> ⛔ Ce n'est **pas** un formulaire rempli une fois à l'installation. Toute information du club doit
> pouvoir être **consultée, complétée et modifiée** plus tard, depuis l'application — changement de
> président, de représentant, de coordonnées, de site, de compte Instagram, de labellisation, de
> stade habituel, de logo. Une modification suit ensuite le régime A/B/C de sa donnée.

**Raison**

> **Une image, pour tenir la règle en tête.** Le profil du club est un **carnet d'identité**. Un
> tournoi est une **photo**. Corriger le carnet — nouveau président, nouveau stade habituel — **ne
> retouche aucune photo déjà prise** : elles montrent ce qui était vrai ce jour-là. Mais le **nom du
> club** n'est pas photographié : c'est le club lui-même. S'il change, il change **partout où l'on
> parle du club aujourd'hui**.
>
> ⚠️ **Un fait de structure à connaître** *(vérifié le 2026-08-24)* : **le classeur ne conserve la
> configuration que d'UN SEUL tournoi**. L'onglet `Historique` garde les matchs terminés, ⛔ **aucun
> réglage**. Le risque que le régime **B** écarte ne peut donc concerner que **le tournoi en
> cours** — ce qui suffit largement à le justifier.

**Ce que D-042 ne fait PAS**

> - ❌ Elle **n'ouvre pas** une plateforme multi-clubs, un système loué en ligne, ni une gestion de
>   comptes. **Une installation / un classeur = une organisation utilisatrice** ;
> - ❌ Elle **ne renomme aucun paramètre existant** — le profil est une **couche au-dessus** ;
> - ❌ Elle **ne construit pas** l'assistant de première configuration.

---

### D-043 — Ce qui survit à une réinitialisation, et ce qui doit être vidé

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1**, étape **M1-A** |
| **Statut** | **VALIDÉE** — ⛔ **appliquée par M1-B, NON FAITE à ce jour** |
| **Décidée par** | Romain |

**Problème posé**

> ⚠️ **Constaté dans le code le 2026-08-24, et vérifié ligne à ligne** : `reinitialiserTournoi`
> *(`Code.gs:7437-7512`)* efface **40 paramètres** de la zone A — ⛔ **et aucun n'est un `org_*`.
> Les 36 sur 36 survivent.**
>
> **Ce n'est pas une décision** : le fichier justifie systématiquement ce qu'il conserve
> *(`perfs_mot_cle_club` : « DÉLIBÉRÉMENT CONSERVÉ […] ⛔ ce n'est pas un oubli » ; `email_expediteur`
> : « config d'infrastructure »)*. ⭐ **Pour les 36 `org_*`, aucune justification n'existe** — et
> cette absence, dans un fichier qui en écrit partout, est l'indice que c'est un **effet de bord**.
>
> **Ce que ça produit, concrètement.** Un club joue en novembre : médecin, association de secours,
> repas à 7 € chez un traiteur, 6 arbitres. Il réinitialise en février et rouvre la demande
> d'autorisation : **tout est déjà rempli**, avec les valeurs de novembre, marquées *« saisi »*, et
> le compteur annonce **0 champ manquant**. Le dossier part à la Ligue avec un médecin qui ne sera
> pas là et un prix qui n'est plus le bon. **Rien ne le signale.**

**Décision prise**

> **✅ DOIVENT SURVIVRE — 10 champs** *(les seuls vrais permanents)*
> `org_club_nom` · `org_code_club` · `org_label_edr` · `org_label_date` ·
> `org_president_nom` 🔒 · `org_president_tel` 🔒 · `org_president_mail` 🔒 ·
> `org_representant_nom` 🔒 · `org_representant_tel` 🔒 · `org_representant_mail` 🔒
>
> **❌ DOIVENT ÊTRE VIDÉS — 26 champs**, plus **toutes** les clés `org_recompenses_*`
>
> | Groupe | Champs | Fondement |
> |---|---|---|
> | Tournoi | `org_niveau_tournoi` · `org_equipes_etrangeres` · `org_equipes_etrangeres_liste` · `org_nb_participants` | Édition |
> | Installations | `org_type_terrain` · `org_nb_vestiaires` | ⭐ **A1** — elles décrivent le **lieu réellement utilisé**, qui peut changer |
> | Arbitrage | `org_nb_arbitres` · `org_nb_educateurs` · `org_nb_educateurs_club` · `org_nb_doublettes` | Édition · ⭐ **A2** pour le troisième |
> | Santé 🔒 | `org_medecin_oui` · `org_medecin_nom` · `org_medecin_tel` | ⭐ **Q4** |
> | Secours 🔒 | `org_secours_nom` · `org_secours_tel` · `org_ambulance` | ⭐ **Q5** |
> | Logistique | `org_droits_oui` · `org_droits_montant` · `org_hebergement_oui` · `org_hebergement_structure` · `org_repas_oui` · `org_repas_fournisseur` · `org_repas_prix` · `org_gouters_oui` · `org_gouters_fournisseur` · `org_gouters_prix` | ⭐ **Q6** |
> | Récompenses | **toutes** les clés `org_recompenses_*` *(nombre variable)* | ⭐ **A3** |
>
> **10 + 26 = 36.** ⛔ **Aucun cas ambigu ne subsiste.**

**Raison**

> **Les quatre arbitrages qui ont tranché, et pourquoi ils vont tous dans le même sens.**
>
> | | Ce que Romain a tranché |
> |---|---|
> | **Q4 — médecin** | Même si la même personne intervient souvent, ⛔ **l'application ne présume jamais de sa présence** à l'édition suivante |
> | **Q5 — secours** | ⭐ **La proposition initiale de Claude — « rattachée au stade » — a été ÉCARTÉE.** Un club peut travailler avec une association cette année, une autre l'an prochain : **la disponibilité d'un prestataire ne dépend pas du club** |
> | **Q6 — fournisseurs** | Même principe : un fournisseur peut ne pas être disponible ou ne pas être retenu l'année suivante |
> | **A1 / A2** | Type de terrain, vestiaires **utilisés** et éducateurs **présents** décrivent une journée, pas un patrimoine |
>
> 🎯 **Le fil commun, et il vaut au-delà de ces champs** : *ce n'est pas parce qu'une valeur se
> répète qu'elle est vraie d'avance.*

**Trois points d'application, à ne pas découvrir pendant M1-B**

> - **`effacerParamGlobal` VIDE la valeur, ne supprime pas la ligne.** C'est le comportement de tous
>   les autres effacements — on le conserve. Une ligne vide est comptée « manquant », et le champ du
>   PDF reste éditable. ⛔ Supprimer des lignes obligerait à manipuler des index : risque
>   disproportionné ;
> - **Les récompenses ont des noms DYNAMIQUES.** Une liste fixe ne peut pas les attraper : il faut
>   **énumérer les clés existantes** et filtrer sur le préfixe — ⚠️ avec un **test négatif**, car
>   `org_representant_nom` ne doit surtout pas être emporté ;
> - **Vider `org_equipes_etrangeres` est sûr** : `DEFAUTS_AUTORISATION` restitue `non`.

**Friction temporaire assumée** *(arbitrage **N2**, Romain, 2026-08-24)*

> Les trois champs de **A1/A2** sont vidés dès **M1-B**, **avant** que **M1-D** n'offre la valeur
> proposée. Entre les deux étapes, l'organisateur les ressaisit. ⭐ **C'est accepté** : un chiffre
> faux sur un document fédéral est plus grave qu'une ressaisie.

---

### D-044 — Le profil du club n'est ni un répertoire de tiers, ni une charte graphique

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1**, étape **M1-A** |
| **Statut** | **VALIDÉE** |
| **Décidée par** | Romain |

**Problème posé**

> Deux confusions guettent le profil, et toutes deux le feraient grossir jusqu'à perdre son sens.

**Décision prise**

> **① Profil ≠ répertoire de tiers.**
>
> | | Ce que c'est |
> |---|---|
> | **Le profil** | Il décrit **le club lui-même** |
> | **Un répertoire** | Il décrit **des tiers** que le club connaît ou avec lesquels il a déjà travaillé — associations de secours, fournisseurs, partenaires, contacts de clubs |
>
> ⛔ **M1 ne construit AUCUN répertoire.** Il doit seulement **ne pas concevoir le profil d'une façon
> qui empêcherait cette évolution**.
> ⚠️ **Et la règle qui les sépare vraiment** : *un répertoire propose une SÉLECTION ; il n'applique
> jamais une valeur au seul motif qu'elle a déjà servi.* **Historique ≠ valeur par défaut.**
>
> ⭐ **Le modèle existe déjà, deux fois, et il fonctionne** : `ClubsInvites` *(le carnet d'adresses
> survit, les colonnes de l'édition sont remises à zéro)* et `Sponsors` *(les fiches survivent, la
> colonne `actif` est la sélection de l'édition)*.
>
> **② Logo ≠ charte graphique.**
>
> | | Décision |
> |---|---|
> | **Le logo du club** | ✅ **Candidat clair.** Prévu au modèle du profil dès **M1-C1**, ⛔ **branché seulement en M1-F**, après la clôture de CF-4b |
> | **La charte complète de Maxilou** *(couleurs, polices)* | ⏸️ **NON ACQUISE — décision ultérieure.** ⛔ Ne pas la glisser derrière le logo |

**Raison**

> Le logo répond à *« à qui est ce document ? »*. La charte répond à *« à quoi ressemble le
> logiciel ? »*. **Ce ne sont pas les mêmes questions**, et rien n'oblige un outil à se déguiser aux
> couleurs de chacun de ses utilisateurs.
>
> Pour le répertoire : un club a le droit de changer d'association de secours ou de traiteur sans
> que son **identité** ait changé. Les ranger au même endroit reviendrait à dire que le club **est**
> ses prestataires.

---

### D-045 — Fidélité aux libellés officiels, et nom officiel ≠ nom d'usage

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1**, étape **M1-A** |
| **Statut** | **VALIDÉE** |
| **Décidée par** | Romain |

**Problème posé**

> Quand un organisateur remplit une case dans Maxilou, il la retrouve ensuite **sur un document
> déposé à sa Ligue**. Si les deux ne portent pas le même nom, il doit **deviner** la
> correspondance — et une devinette, sur un dossier administratif, finit par une erreur.
>
> **Exemple réel, relevé le 2026-08-24** : Maxilou demande *« Nombre de vestiaires »* ; le
> formulaire demande *« Nombre de vestiaires **utilisés** »*. Un stade peut **avoir** six vestiaires
> et n'en **utiliser** que quatre. **Le mot manquant changeait la réponse.**

**Décision prise**

> **① La règle.** Lorsqu'un champ correspond à une information du formulaire officiel FFR présent
> dans le dépôt, **le libellé visible reprend le vocabulaire de la source**. Les clés techniques
> internes gardent leur nom *(`org_code_club` reste `org_code_club` — personne ne le voit)*. Une
> explication UX peut être placée **sous** le champ ; ⛔ **elle ne remplace jamais le libellé.**
>
> **② Les champs propres à Maxilou sont identifiés comme tels**, explicitement, pour qu'aucun
> organisateur ne les cherche en vain sur le papier. Ils sont **six** à ce jour :
> `org_nb_educateurs_club`, `org_nb_participants` *(repli)*, `org_nb_educateurs` *(repli)*,
> `perfs_mot_cle_club`, `zone_vacances`, et le futur `club_nom_usage`.
>
> **③ Nom officiel et nom d'usage sont deux choses différentes.**
>
> | | Nom **officiel** *(`org_club_nom`)* | Nom **d'usage** *(`club_nom_usage`, à créer)* |
> |---|---|---|
> | Où il sert | ⭐ **Toute démarche réglementaire** | Signatures, emails, communication, interface |
> | Obligatoire ? | Oui, pour déposer | Non |
> | Absent ⇒ | « manquant », champ du PDF **éditable** — ⛔ l'application n'invente aucun nom *(D-039)* | ⭐ **repli sur le nom officiel** |
>
> ⛔ **INTERDICTION ABSOLUE, à couvrir par un test négatif** : **le nom d'usage n'entre jamais, par
> aucun chemin, dans un formulaire réglementaire.** `planRemplissageAutorisation` et
> `assemblerDossierAutorisation` lisent `org_club_nom`, et rien d'autre.
>
> **④ La source de vérité** est [`../../frontend/modeles/demande-autorisation-ffr.pdf`](../../frontend/modeles/demande-autorisation-ffr.pdf).
> La table complète vit dans [`M1-LIBELLES-OFFICIELS.md`](M1-LIBELLES-OFFICIELS.md), **avec la
> méthode d'extraction** — sans quoi personne ne pourrait la revérifier *(§8 quater)*.

**Deux arbitrages d'application** *(Romain, 2026-08-24)*

> - **L1 — l'accentuation est normalisée.** L'original écrit *« Ecole »* et *« SECURITE »* sans
>   accents : c'est un **artefact de saisie**, pas un terme. On reprend **le mot**, pas la coquille ;
> - **L2 — Maxilou garde deux champs d'adresse.** Le formulaire n'en a qu'un,
>   *« Adresse du tournoi (stade, ville, cp) »* ; Maxilou sépare `tournoi_lieu` et `tournoi_adresse`
>   parce que le dossier du club, l'itinéraire et le fichier d'agenda ont besoin du **nom du stade
>   seul**. ➡️ **La fidélité s'applique alors au GROUPE** : les deux champs sont présentés sous le
>   libellé officiel, avec une aide qui explique la séparation.

**Raison**

> ⭐ **Un mot de travers sur un écran devient une erreur sur un document officiel** — et cette
> erreur-là, personne ne la voit passer : le formulaire est **complet**, il est simplement **faux**.
>
> Pour le nom d'usage, l'image tient en une phrase : *sur une carte d'identité on lit
> « Jean-Baptiste » ; ses amis l'appellent « JB » — mais on ne signe pas un acte notarié « JB ».*

---

### D-046 — Un état ne devient vrai qu'APRÈS le geste, et une trace historique ne se réécrit pas

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 *(soir)* |
| **Session** | Micro-lot **méthodologique**, entre **M1-A** *(close)* et **M1-B** *(non commencée)* |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Décidée par** | Romain |
| **Couvre** | La règle permanente **`CLAUDE.md` §8 septies** · le **point 5 neuf** de la règle d'arrêt **§12.4** · la **§12.4 bis** *(le rapport de fin de session dit ce qui a été constaté)* |
| **Voisines** | **§8 bis** *(la carte à jour)* · **§8 ter** *(le commentaire à jour)* · **§8 quater** *(la source unique)* · **D-040** *(une preuve de version doit être discriminante)* |

**Le problème posé — et il s'est produit quatre fois, il n'est pas théorique**

> Entre le 2026-08-22 et le 2026-08-24, **quatre états de suivi ont annoncé qu'un travail restait à
> faire alors qu'il était fait** :
>
> | Ce que le document annonçait | Ce qui était vrai au même moment |
> |---|---|
> | **R-094** *« appliqué localement, non commité »* | commit `94cd6a2`, poussé, **publié** par GitHub Pages |
> | **CF-4b** *« 2 lots sur 8 »* | **8 lots sur 8** livrés |
> | **CF-4b / L8** *« patch appliqué, non commité »* | commité `be57f97`, poussé, part frontend **publiée** |
> | **M1-A** *« NON FUSIONNÉE dans `main` »* | **fusionnée** en fast-forward le jour même |
>
> ⭐ **Aucune de ces phrases n'était fausse quand elle a été écrite.** Elles décrivaient toutes une
> intention correcte **au moment de la rédaction**, et sont devenues fausses **au geste suivant**.
>
> 🎯 **La cause n'est pas l'attention, c'est l'ORDRE.** La règle d'arrêt **§12.4** demandait de
> mettre à jour la documentation de suivi *(point 1)* **avant** de créer le commit *(point 4)*, et
> **rien ne demandait de la relire ensuite**. Une méthode suivie correctement produisait donc un
> document faux : ⛔ **c'est un défaut de méthode, pas de rigueur.**
>
> ⚠️ **Et c'est le sens de l'erreur qui la rend coûteuse** : un état qui annonce du travail
> **restant** là où il n'en reste pas conduit la session suivante à **refaire un geste déjà fait** —
> republier, réécrire, ou retarder ce qui en dépendait.

**Ce qui est décidé**

> **① Une règle permanente, `CLAUDE.md` §8 septies :** *un état qui décrit un geste — commit,
> fusion, poussée, publication, redéploiement, opération manuelle sur le classeur — se contrôle
> **après** l'exécution effective du geste ; un état écrit avant est **une intention, pas un
> état**.* Avant de clore un lot ou une session, les documents d'état concernés sont **relus contre
> ce qui est constaté**.
>
> **② Un tableau « geste ➡️ ce qui le constate »**, pour que la règle soit **opérationnelle** et non
> une recommandation : ⛔ **un document ne constate jamais un geste**. Le commit se constate par
> `git log`, la poussée par `git rev-parse origin/<branche>`, la publication du frontend par
> l'exécution **`success`** du workflow Pages **sur ce commit**, le redéploiement du serveur par un
> **témoin discriminant** *(**D-040**)*, une opération sur le classeur par un **relevé avant/après**,
> et le comportement en production **ne se constate pas depuis le dépôt** *(§13.6)*.
>
> **③ La protection explicite des traces historiques** — et c'est la moitié de la décision :
>
> > **Une phrase vraie à sa date reste écrite telle quelle.** On **ajoute** le nouvel état, ou on
> > corrige la **source d'état courant**. ⛔ **On ne réécrit jamais une trace historique pour la
> > rendre conforme au présent.**
>
> `CLAUDE.md` **§8 septies** nomme les deux colonnes : d'un côté les **sources d'état courant** *(les
> blocs de tête, les tableaux d'avancement, les statuts de `RISQUES.md`, les fiches de `PLAN.md`, la
> carte de §8 bis)*, qui **se corrigent** ; de l'autre les **traces historiques** *(`SESSIONS.md`,
> `AUDIT.md`, `RAPPORT-AUDIT.md`, les entrées passées du `CHANGELOG`, les « rappels », les fiches de
> décision déjà validées)*, qui **ne se réécrivent pas**.
>
> **④ Un point 5 neuf dans §12.4**, placé **après** la création du commit : relire ce que les
> documents d'état affirment du geste. ⛔ **L'ordre existant n'est pas modifié** — écrire d'abord
> reste utile ; **une relecture est simplement ajoutée après**. *(Les anciens points 5, 6 et 7
> deviennent 6, 7 et 8 ; ⛔ **les points 1 et 2 — les seuls cités ailleurs dans le dépôt — sont
> inchangés**.)*
>
> **⑤ Une §12.4 bis** : le **rapport de fin de session** est lui aussi une source d'état.
> *« Je vais commiter »* n'est pas *« c'est commité »*.

**Raison, en langage simple**

> C'est la différence entre **une liste de courses et un ticket de caisse**. La liste dit ce qu'on
> *comptait* prendre ; le ticket dit ce qu'on a *réellement* pris. Les deux sont utiles — mais si on
> range la liste en croyant que c'est le ticket, on repart au magasin acheter ce qu'on a déjà dans
> le coffre.
>
> ⭐ **Et le vieux ticket ne se corrige pas au stylo** : il raconte ce qui s'est passé **ce jour-là**,
> et c'est précisément ce qu'on lui demande.

**Ce que la décision NE demande PAS**

> - ❌ **Pas** d'interdire d'écrire la documentation avant le geste — **préparer est utile** ;
> - ❌ **Pas** de recopier un SHA ou un état de publication dans plusieurs documents : **§8 quater**
>   l'interdit déjà ;
> - ❌ **Pas** de passe rétroactive sur les documents anciens ;
> - ❌ **Pas** d'outil, de script ni de contrôle automatique : la relecture coûte **une minute**, et
>   un outil de plus serait disproportionné *(`CLAUDE.md` §10)*.

**Portée**

> ⭐ **Permanente, et elle servira dès M1-B** — qui comporte un **commit**, une **poussée** et un
> **redéploiement chez Google**, c'est-à-dire les trois gestes que la règle vise.

---

### D-047 — M1-A est close ; la lecture des deux URL devient un reliquat EXTERNE non bloquant

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 *(soir)* |
| **Session** | Micro-lot **méthodologique**, entre **M1-A** et **M1-B** |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Décidée par** | Romain |
| **Couvre** | `ETAT.md` *(bloc de tête et fiche M1-A)* · `PLAN.md` **§15.6** et **§15.8** |

**Le problème posé**

> Les documents d'état disaient **deux choses incompatibles** : **M1-A est TERMINÉE** — et
> *« une seule chose reste en attente dans M1-A »*, la lecture de `url_site_association` et
> `url_instagram` dans le classeur.
>
> ⚠️ **Une étape dont quelque chose « reste en attente » n'est pas close.** La formulation laissait
> donc croire que le statut de M1-A pouvait encore bouger, et qu'il fallait peut-être **attendre**
> ce geste avant la suite.

**Ce qui est décidé**

> | | |
> |---|---|
> | **M1-A** | 🏁 **DÉFINITIVEMENT CLÔTURÉE.** Son objectif était **documentaire**, et il est atteint |
> | **La lecture des deux URL** | 🔻 **RELIQUAT EXTERNE**, ⛔ **non bloquant**, **sorti du périmètre de M1-A** |
> | **Pourquoi « externe »** | ⛔ Le geste n'est pas empêché par le projet mais par **l'environnement d'exécution** : la politique réseau refuse `script.google.com` *(403 au `CONNECT`)*. **Aucune session ne peut le lever depuis ici** |
> | **Où il est tracé** | `PLAN.md` **§15.8**, sous-section dédiée — ⛔ **et il ne doit pas être oublié** |
> | **Quand** | **Dès qu'un environnement autorisant cette lecture sera disponible** ; à défaut, **repris par M1-F**, qui traite déjà les valeurs institutionnelles du classeur |
> | ⛔ **Ce qu'il ne déclenche pas** | **M1-B ne démarre pas pour autant.** Aucune étape ne démarre sans validation explicite *(`PLAN.md` §15.2)* |
>
> ⚠️ **L'autorisation donnée par Romain le 2026-08-24 reste valable** — lecture seule, vidage
> **uniquement** si une attribution institutionnelle réelle subsiste, relevé avant/après, ⛔ **rien
> d'autre du classeur**.

**Raison**

> Un chantier a besoin de **statuts qui tranchent**. *« Terminé sauf une chose »* n'est pas un
> statut : c'est une question laissée ouverte, que la session suivante devra rouvrir pour savoir si
> elle a le droit d'avancer.
>
> ⭐ **Ce qui compte ici, c'est la distinction entre ce que le projet doit faire et ce que
> l'environnement lui interdit.** Le premier est un travail ; le second est une **contrainte
> extérieure**. Les confondre bloque un chantier entier au nom d'un geste que personne, ici, n'a le
> pouvoir d'accomplir.

**Ce que la décision NE demande PAS**

> - ❌ **Pas** d'abandonner le geste : il **reste tracé**, et c'est tout l'objet de la ligne dédiée ;
> - ❌ **Pas** de le déclarer fait, ni de supposer ce que contiennent les deux valeurs — ⛔ **elles
>   n'ont jamais été lues** *(§9 : c'est un **INCONNU**, pas un probable)* ;
> - ❌ **Pas** de démarrer **M1-B** au motif que M1-A est close.

---

### D-048 — Publier ouvre une page. Publier ne parle à personne.

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1-PUB**, micro-lot **PUB-1** |
| **Statut** | ✅ **VALIDÉE — décision de Romain** |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§15.3 bis** · `RISQUES.md` **R-097** · `../architecture.md` **§2.H** |

**Le problème posé**

> Le mot « publier » recouvrait **trois gestes différents** que rien ne distinguait, et cette
> confusion a une conséquence concrète : dans Maxilou, un clic sur **« Publier le tournoi »** fait
> apparaître **automatiquement** une carte d'actualité et une page d'événement sur un **site
> extérieur**, sans que personne ne l'ait demandé à ce moment-là.

**Ce qui est décidé — les trois mots, et ils ne se mélangent plus**

> | Mot | Ce qu'il veut dire, exactement |
> |---|---|
> | **Publication** | **Rendre la page publique accessible.** Rien d'autre |
> | **Accès** | **Fournir son adresse à l'organisateur** — pour qu'il puisse l'ouvrir et la donner |
> | **Diffusion** | **Un geste volontaire vers un canal externe** — email, réseau social, site tiers |

**⚠️ Ce que « accessible » veut dire ici, précisément — et c'est ce qui évite de contredire PUB-2**

> **« Accessible » signifie que le CONTENU public du tournoi devient visible.**
>
> ⭐ **L'adresse de la page, elle, peut exister et être ouverte AVANT la publication ou APRÈS le
> masquage** : elle présente alors son **état non publié**.
>
> 🎯 **Les deux ne sont donc pas le même objet, et c'est tout l'intérêt de la distinction** : une
> **adresse** n'est pas une **autorisation**. C'est ce qui rend **PUB-2** *(l'accès autonome)*
> possible **sans** toucher à la publication — et ce qui empêche de lire cette doctrine comme si
> « publier » faisait naître une adresse qui n'existait pas.

> 🎯 **La formule à conserver telle quelle, et elle fait règle :**
>
> > **« Publier ouvre une page. Publier ne parle à personne. »**

**La règle d'absence d'effet externe**

> ⛔ Un clic sur « Publier » ne doit **jamais**, à lui seul :
>
> ① envoyer un email · ② publier sur un site tiers · ③ créer une actualité · ④ créer une page sur
> un autre site · ⑤ envoyer un message · ⑥ notifier un club · ⑦ déclencher une diffusion externe
> quelconque.
>
> ⭐ **Une diffusion externe éventuelle relèvera TOUJOURS d'une action distincte et volontaire de
> l'utilisateur.**

**Ce que cette décision ne dit PAS**

> - ❌ **Pas** que la diffusion externe est interdite — elle devient **une action distincte et
>   volontaire**, pas un effet de bord ;
> - ❌ **Pas** que le site vitrine doit disparaître — il doit cesser de **deviner** ;
> - ❌ **Pas** que `tournoi_publie` disparaît : la page publique Maxilou en a **besoin** *(vue
>   `live`)*. C'est son usage comme **signal implicite vers l'extérieur** qui est visé ;
> - ❌ **Pas** que la page publique Maxilou n'existe pas — ⭐ **`tournoi.html` existe déjà et son
>   code consomme `tournoi_publie` via la vue `live`** *(🔬 `frontend/js/tournoi.js:206`,
>   `backend/Code.gs:707`)*. Ce qui manque est **un accès explicite et autonome pour
>   l'organisateur depuis Maxilou** *(PUB-2)*.

---

### D-049 — Consommer une valeur existante n'est pas administrer cette valeur

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1-PUB**, micro-lot **PUB-2** |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, avant implémentation |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§15.3 bis** *(PUB-2)* · `RISQUES.md` **R-096** · `../architecture.md` **§2.H** |

**Le problème posé**

> `url_tournoi_public` — le paramètre qui porte l'adresse de la page publique — appartient aux
> **douze réglages sans écran** de **R-096**, rattachés au chantier **M1-D**. Or **PUB-2** a besoin
> de cette valeur pour afficher l'adresse à l'organisateur.
>
> ⚠️ **Le risque était de « régler le problème en passant »** : ajouter un champ de saisie dans la
> carte Publication. Cela aurait déplacé un morceau de M1-D dans M1-PUB **sans que personne ne le
> décide** — exactement la façon dont un chantier en avale un autre.

**Ce qui est décidé**

> | | |
> |---|---|
> | ✅ **PUB-2 LIT** `url_tournoi_public` | pour afficher, copier et ouvrir l'adresse |
> | ⛔ **PUB-2 n'ÉCRIT PAS** `url_tournoi_public` | aucun champ, aucun écran, aucune action serveur |
> | ⛔ **La CONFIGURATION reste R-096 / M1-D** | ce que PUB-2 ne change en rien |
>
> 🎯 **La formule à conserver :**
>
> > **« Consommer une valeur existante n'est pas administrer cette valeur. »**

**La règle de résolution, et elle vit à UN SEUL ENDROIT**

> ① `url_tournoi_public` si renseignée · ② sinon `tournoi.html` **voisine de la page courante**.
>
> ⭐ Cette règle est écrite dans **`urlPagePublique`** *(`frontend/js/commun.js`)*, et **nulle part
> ailleurs**. Elle sert **deux** présentations de la **même** adresse :
> le **dossier club** *(lien « Scores en direct » + QR code — l'usage le plus ancien, antérieur à
> PUB-2)* et l'**administration** *(carte « Publier le tournoi »)*.
>
> ⚠️ **L'invariant qui en découle, et c'est lui qui compte** : *à configuration identique,
> l'administration et le dossier club affichent la MÊME adresse.* Deux règles séparées auraient
> divergé **en silence** — les deux pages se seraient affichées normalement, et l'organisateur
> aurait communiqué une adresse que les clubs n'avaient pas reçue.

**⭐ Le vocabulaire, et il engage l'avenir : l'adresse est celle du TOURNOI, jamais celle du CLUB**
*(précision de Romain, 2026-08-24, avant le figeage de PUB-2)*

> **L'état actuel, et il est volontaire** : ⭐ **Maxilou organise UN tournoi à la fois.** PUB-2
> **reste strictement dans ce modèle** — ⛔ **aucun `tournoi_id`, aucun sélecteur, aucune gestion
> multi-tournois, aucune table, aucune route, aucune modification backend** n'a été créé, et il
> n'en est pas demandé.
>
> **Le besoin futur, ⛔ HORS PÉRIMÈTRE** : un même club organisera un jour **plusieurs tournois
> distincts** — *U10 le samedi, U8 le dimanche* — qui devront porter des **liens et des QR codes
> distincts**.
>
> | ✅ On écrit | ⛔ On n'écrit JAMAIS |
> |---|---|
> | « la page publique **du tournoi** » | « la page publique du club » |
> | « l'adresse **de ce tournoi** » · « du tournoi actuellement géré » | « l'URL du club » · « l'adresse du club » |
>
> 🎯 **Pourquoi cette précision est une DÉCISION et pas une coquetterie.** ⭐ **Le vocabulaire d'une
> interface survit au code qui l'a produit** : il est recopié dans les documents, dans les emails,
> dans les habitudes de celui qui s'en sert. Écrire aujourd'hui *« la page publique du club »*
> graverait la règle conceptuelle **`un club = une URL`** — fausse, et **coûteuse à défaire le jour
> du multi-tournois**, bien au-delà d'une phrase à corriger.
>
> ⚠️ **La conséquence directe sur la note affichée.** Elle dit **« Publier ou masquer le tournoi ne
> change pas cette adresse »** — la garantie **réelle** de PUB-2, qui porte sur le **bouton**.
> ⛔ Elle ne dit **PAS** *« cette adresse ne change jamais »* : `url_tournoi_public` **peut** être
> modifié, et le multi-tournois amènera **plusieurs** adresses. ⭐ *Une interface ne promet que ce
> que le code garantit.*

**Ce que cette décision ne dit PAS**

> - ❌ **Pas** que le multi-tournois est décidé, planifié ou préparé : ⛔ **il est seulement
>   SIGNALÉ**, pour que PUB-2 ne grave pas une règle qui lui barrerait la route ;
> - ❌ **Pas** que `url_tournoi_public` est bien administré : ⛔ **il n'a toujours aucun écran**, et
>   **R-096 reste OUVERT**. PUB-2 ne referme rien de M1-D ;
> - ❌ **Pas** que l'adresse dépend de la publication — ⭐ elle existe **avant** et **après**
>   *(D-048)*. « Copier » et « Ouvrir » restent **actifs** quand le tournoi n'est pas publié ;
> - ❌ **Pas** que le dossier club change : ⭐ **son comportement est strictement conservé**. Une
>   seule ligne de `dossier.js` a bougé — elle **délègue** la résolution, elle ne la modifie pas ;
> - ❌ **Pas** que R-097 avance : ⛔ la vitrine externe **lit toujours** `tournoi_publie`. La
>   coupure appartient à **PUB-3** puis **PUB-4**.

---

### D-050 — Un club connu n'est pas un club invité : `Clubs` et `Participations` sont deux choses

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1-B2** — cadrage d'architecture |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, avant implémentation |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§16** *(M1-B2)* · `RISQUES.md` **R-099, R-100, R-102, R-104, R-105, R-106** |

**Le problème posé**

> Le code décrit `ClubsInvites` comme *« un carnet d'adresses réutilisable d'une édition à
> l'autre »*. ⚠️ **Mais il ne contient pas un carnet d'adresses : il contient un carnet d'adresses
> ET un registre de participation, dans les mêmes 17 colonnes.** Le reset s'en remet à une liste
> écrite à la main — et **trois colonnes ont été oubliées** *(R-099)*.

**Ce qui a été comparé**

| | **Option A** — un onglet, deux listes déclaratives | **Option B** — séparation réelle |
|---|---|---|
| Ferme R-099/100/102 | ✅ | ✅ |
| Migration | ✅ aucune | ⚠️ une |
| **Plusieurs éditions par club** | 🔴 **IMPOSSIBLE** | ✅ |

> 🎯 **L'argument qui a tranché n'est pas esthétique, il est arithmétique.** L'historique doit
> conserver, **pour chaque édition passée**, le statut final, les catégories engagées et les
> effectifs de chaque club. Dans l'Option A, un club a **une seule ligne** : il ne peut porter
> qu'**un seul** statut, **un seul** effectif. ⛔ **L'Option A rend l'historique des clubs
> structurellement impossible.**
>
> ⚠️ **La recommandation initiale était l'Option A** — elle répondait à un cahier des charges
> **sans historique**. L'horizon a changé le 2026-08-24 ; la réponse a changé avec lui. **Cette
> trace est conservée volontairement** : elle explique pourquoi le dépôt ne doit plus chercher
> l'Option A.

**Ce qui est décidé**

| | |
|---|---|
| 🆕 **`Clubs`** | `club_id` *(UUID stable, jamais réutilisé)* · nom · contact · prénom · email · date d'ajout · `actif`. ⛔ **Aucun statut, aucun jeton, aucun effectif** |
| 🆕 **`Participations`** | `edition_id` + `club_id` + **tout ce qui appartient à l'édition** : statut, jeton, dates d'envoi, catégories engagées, effectifs, alertes · 📸 **snapshots** du nom et du contact au moment de l'invitation |
| ⭐ **Couche d'adaptation** | `listerClubsInvites` **garde sa signature** et renvoie **le même objet plat qu'aujourd'hui** ⇒ badges, tris, liserés, statuts, catégories et actions des cartes actuelles sont **préservés sans réécriture** |
| ⭐ **`statut` vide** | Nouveau sens : **connu au carnet, sans participation** — l'état d'un club après reset. `Invité` ne se pose plus qu'**après un envoi réussi** |

**Corollaire — `edition_id`**

> **Une édition possède un identifiant stable pendant toute sa vie.** Il est créé **à l'ouverture**
> de l'édition, jamais à l'archivage : les participations, messages, matchs et terrains le portent
> **dès leur création**, sans rétro-étiquetage.
>
> ⛔ **Il ne change JAMAIS** : ni à une régénération des poules, ni du planning, ni à une
> modification des équipes. ⭐ **Régénérer un planning ne crée pas une nouvelle édition** — c'est
> précisément ce que fait `tournoi_id` aujourd'hui, et c'est **R-106**.
>
> ⛔ **`edition_id` ne rend PAS Maxilou multi-tournois** : une seule ligne `active` dans `Editions`,
> aucun sélecteur d'édition. **C'est une étiquette de rattachement, jamais un sélecteur.**

**Corollaire — B2-0 comme harnais**

> La correction immédiate du reset *(B2-0)* n'est **pas un bricolage transitoire** : c'est **la
> spécification exécutable du comportement cible**. ⭐ Ses **tests métier survivent à B2-2** — ils
> décrivent un résultat *(« après reset : aucun statut, aucun effectif hérité »)*, pas une
> structure. **Seules ~10 lignes de code seront remplacées.**
>
> 🎯 **Et c'est ce qui rend la migration sûre** : B2-2 est une migration de structure — l'opération
> la plus risquée du chantier. ⛔ **La faire sans test préalable du comportement attendu, ce serait
> migrer à l'aveugle.**

---

### D-051 — Le classement d'une édition passée est un fait historique, jamais recalculé

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-24 |
| **Session** | Chantier **M1-B2** — cadrage de l'historique |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, avant implémentation |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§16** *(B2-6)* · `RISQUES.md` **R-103, R-108** · [`../regles-classement.md`](../regles-classement.md) |

**Le problème posé**

> Fallait-il **stocker** le classement de chaque édition, ou le **recalculer** au besoin depuis les
> matchs archivés ?

**Ce qui a tranché — une preuve dans le code**

```
backend/Code.gs    var POINTS_VICTOIRE = 3;   ⭐ CODÉ EN DUR, pas un paramètre de Config
```

> 🎯 **Le barème n'est pas dans les données : il est dans le code**, en deux exemplaires. Un
> classement recalculé plus tard le serait donc **forcément avec les règles du code du jour** —
> l'ancien barème n'existe plus nulle part après un redéploiement.
>
> ⭐ **Recalculer, ce n'est donc pas « reconstituer » : c'est réécrire l'histoire avec les règles
> d'aujourd'hui.**

**Ce qui est décidé**

> **L'historique est la photographie de l'édition telle qu'elle a réellement eu lieu. Il ne
> réinterprète jamais une édition passée avec les règles courantes.**

| | |
|---|---|
| 🆕 **`Arch_Classements`** | Une ligne = une équipe dans une poule d'une édition. ⭐ **`position` MATÉRIALISÉE** — 🔬 le moteur ne la produit pas, elle n'est que l'index du tri ; sans elle, deux équipes strictement à égalité pourraient permuter à la relecture |
| ⭐ **Condition de remplissage** | ⛔ **N'écrire le classement QUE si au moins un match comptant est terminé avec deux scores valides.** Sinon l'archive afficherait un classement **qui n'a jamais existé** — l'inverse exact de cette doctrine. **Une édition peut être archivée sans classement** |
| 🆕 **`regles_classement_json`** | Dans `Editions` : barème, ordre de départage, périmètre des matchs comptés — ⭐ **le strict nécessaire pour EXPLIQUER le résultat**, ⛔ pas la configuration du logiciel |
| 🆕 **`regles_classement_version`** | Un **entier simple**, incrémenté **uniquement** quand [`../regles-classement.md`](../regles-classement.md) change. ⭐ **C'est le SEUL repère possible**, puisque le barème vit dans le code : il dit *avec quelle implémentation* l'édition a été calculée |
| ⭐ **Snapshot par valeur** | L'archive contient les **noms**, pas les identifiants — 🔬 **doctrine déjà en vigueur** dans l'onglet `Historique` : *« on stocke les NOMS d'équipe (stables), contrairement aux id »*. `club_id` est conservé **en plus**, pour la relation durable |
| ⭐ **Faits ≠ indicateurs** | **Faits figés** *(classement, scores, clubs, règles de l'époque)* : **lus, jamais recalculés**. **Indicateurs analytiques** *(moyennes, évolutions, fréquences)* : **recalculés au vol**. ⭐ Cette distinction guide la structure — et devient une distinction **de tables** |

**Ce que la décision permet, et c'est sa raison d'être**

> *« Le club X était 2ᵉ en 2027 avec 7 points ; 2ᵉ en 2028 avec 8 points. »* Deux **faits lus**,
> chacun produit sous ses propres règles — **dont on connaît la version**. ⭐ **On peut donc étudier
> si un écart vient de la performance sportive ou d'un changement de règle.** Un classement
> recalculé détruirait cette information.

⛔ **Aucune simulation** *(« qu'aurait donné 2027 avec les règles 2029 ? »)* n'est développée. Si
elle existait un jour, ce serait explicitement un **résultat dérivé**, ⛔ **jamais le classement
historique**.

⛔ **Les phases finales** restent conservées via `Historique` étendu *(`vainqueur`, `tour`,
`sous_tableau`)* — ⛔ **sans inventer un « classement général » qui n'existe pas aujourd'hui.**

---

### D-052 — Une preuve dangereuse n'est pas supprimée : elle est déplacée au premier moment où elle devient inoffensive, et reste tracée jusque-là

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-26 |
| **Session** | Chantier **M1-PUB** — audit de la contradiction de séquence entre PUB-2, PUB-3 et PUB-4 |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, après audit et avant toute écriture |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§15.3 bis** *(PUB-2, PUB-3, PUB-4, critère de clôture M1-PUB)* · `RISQUES.md` **R-097, R-098** |
| **Doctrine de référence** | **D-048** — *« Publier ouvre une page. Publier ne parle à personne. »* |

**Le problème posé, et il n'était pas théorique**

> Quatre exigences du chantier se contredisaient **en boucle** :
>
> | | |
> |---|---|
> | **PUB-2** | ne se clôt que si **« Masquer »** est vérifié *(condition 5 de R-098)* |
> | **« Masquer »** | 🔬 n'existe à l'écran que si le tournoi est **PUBLIÉ** *(`admin-infos-publication.js`, `estPublie()`)* — le prouver **exige donc de publier** |
> | **Publier aujourd'hui** | ⛔ atteint **le site d'une association tierce** — c'est **R-097**, et c'est **précisément ce que M1-PUB existe pour supprimer** |
> | **PUB-3** | ne démarre qu'**après la clôture de PUB-2** |
>
> 🎯 **La boucle, en une phrase** : *pour clore PUB-2 il fallait causer le tort que PUB-4 doit
> supprimer — et PUB-4 ne pouvait pas venir avant, puisqu'il dépend de PUB-3, qui dépend de PUB-2.*

**Ce qui a tranché — trois constats, tous vérifiés le 2026-08-26**

| # | Constat | Nature |
|---|---|---|
| ① | 🔬 **Les deux sites interrogent le MÊME déploiement Apps Script**, donc **le même classeur** — établi par **comparaison d'empreintes**, ⛔ sans recopier d'adresse. Publier depuis le classeur de test atteindrait **réellement** la vitrine | **CERTAIN** *(code)* |
| ② | 🔬 **Le jeu de données serait FICTIF.** Publier ferait donc apparaître, sur le site public d'une association réelle, **l'annonce d'un tournoi qui n'existe pas** — nom, date, lieu, affiche, **en tête de ses actualités**. ⭐ **Ce n'est plus une entorse de doctrine, c'est une fausse information chez un tiers** | **CERTAIN** *(code)* |
| ③ | ⭐ **La preuve « avant » était obtenable SANS publier**, et elle l'a été : `tournoi.html` de la vitrine affiche, **en production**, *« Aucun tournoi en cours pour le moment. »* | **CERTAIN** *(production, constaté par Romain)* |

> ⭐ **Le constat ③ est ce qui rend la décision possible**, et il mérite d'être compris : cette
> seule phrase, lue en ligne, prouve **trois choses à la fois** — que la vitrine **interroge
> réellement** ce serveur, qu'elle **lit réellement** le témoin, et qu'elle **réagit réellement à
> sa valeur**. ⛔ **Sans jamais rien publier.**
>
> Il ne reste non prouvé **en production** que la moitié `oui`, dont le code des deux dépôts fait
> déjà une **certitude**. 🎯 **Produire cette moitié-là coûterait exactement le tort que le
> chantier existe pour supprimer. C'est un prix que la preuve ne vaut pas.**

**Ce qui est décidé**

> **Une preuve dont l'OBTENTION causerait le tort que le chantier doit supprimer n'est ni
> abandonnée, ni réputée acquise : elle est DÉPLACÉE au premier moment de la trajectoire où elle
> devient inoffensive — et elle reste TRACÉE, nommément, jusqu'à ce qu'elle soit produite.**

Trois obligations en découlent, et **aucune n'est facultative** :

| | |
|---|---|
| ⛔ **Ne jamais cocher** | Une preuve déplacée **n'est pas validée**. Elle reste **comptée** dans le total de son critère — R-098 garde **cinq** conditions, pas quatre |
| ⛔ **Ne jamais effacer** | Elle est **nommée** à son point d'arrivée, une par une. ⛔ *« les preuves restantes »* ne suffit pas : ce qui n'est pas nommé se perd |
| ⭐ **Un filet de fin de chantier** | Le critère de clôture du chantier porte : **« aucune preuve reportée ne reste ouverte »**. ⭐ **Sans lui, un report devient un oubli** — et personne ne s'en aperçoit, puisque chaque lot intermédiaire, lui, aura été déclaré clos |

**⭐ Ce n'est pas une exception fabriquée pour l'occasion**

> Le dépôt porte **déjà** ce mécanisme : **D-047** a sorti la lecture des deux URL de M1-A en la
> qualifiant de **reliquat externe non bloquant**, tracé au `PLAN.md` §15.8. ⭐ **D-052 généralise
> ce geste et lui ajoute ce qui manquait à D-047 : le filet de clôture.**
>
> ⚠️ **La différence entre les deux mérite d'être notée** : le reliquat de D-047 est bloqué par
> **l'environnement** *(un blocage réseau que personne ne peut lever depuis ici)*. Celui-ci est
> bloqué par **une conséquence** — nous *pouvons* le produire, ⛔ **nous choisissons de ne pas le
> faire tant qu'il est nuisible.** ⭐ **C'est un choix, et c'est pour cela qu'il doit être écrit.**

**Ce que la décision ne dit PAS**

- ❌ **Pas** que toute preuve gênante peut être repoussée : le déclencheur est étroit — **l'obtention
  de la preuve cause le tort que le chantier corrige**. ⛔ *« C'est long »*, *« c'est compliqué »*,
  *« on verra plus tard »* ne sont **pas** des motifs ;
- ❌ **Pas** que le lot d'accueil peut être clos sans elle — **c'est l'inverse** : il ne peut PAS ;
- ❌ **Pas** de report en cascade : une preuve se déplace **une fois**, vers un point **nommé**. La
  redéplacer exige une **nouvelle décision**, ⛔ pas une reconduction tacite ;
- ✅ **Seulement ceci** : *cette preuve, l'obtenir maintenant causerait-il ce que je suis en train de
  corriger — et si oui, où devient-elle inoffensive, et qui garantit qu'elle sera produite là ?*

---

### D-053 — Une preuve par le navigateur n'existe qu'à l'état FINAL — et une preuve téléphone exige un téléphone

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-26 |
| **Session** | **Session 27** — installation et premier essai réel de **Playwright MCP** sur le Mac de Romain |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, après essai réel et avant tout commit |
| **Décidée par** | Romain |
| **Couvre** | `CLAUDE.md` **§8 octies** *(la règle permanente qui en découle)* |
| **Doctrine de référence** | **D-046** — *« un état ne devient vrai qu'APRÈS le geste »* *(`CLAUDE.md` §8 septies)* |

**Ce qui a changé, et pourquoi il fallait décider**

> Jusqu'ici, aucune session ne pouvait atteindre le site publié ni le serveur : la **session 24**
> l'a constaté deux fois, `403 Forbidden`. ⭐ **C'est ce blocage qui a produit la meilleure
> discipline du chantier** — faute de pouvoir observer, les sessions ont **refusé de déduire**, et
> c'est **le doigt de Romain sur un vrai téléphone** qui a trouvé le défaut de B5.
>
> 🎯 **Playwright change cette contrainte, et c'est précisément le danger.** Un outil qui atteint
> enfin la cible rend soudain facile de **conclure vite** — donc de conclure **mal**. La décision
> ouvre l'outil **et** referme la porte que l'outil entrouvre.

**Ce qui est décidé — six points**

| # | | |
|---|---|---|
| ① | **Preuve sur ordinateur** | ✅ Autorisée avec **Playwright MCP**, ⛔ **uniquement depuis une session locale, dans un Chrome VISIBLE**. Ni session distante, ni navigateur sans fenêtre |
| ② | **Preuve téléphone** | ⛔ **Exige toujours un téléphone réel manipulé par Romain.** Une émulation ou une fenêtre rétrécie montre une **mise en page**, ⛔ **jamais une preuve** |
| ③ | **Sorties de l'outil** | Captures et relevés dans **`.playwright-mcp/`**, ⛔ **jamais commitées** *(exclusion locale, hors dépôt suivi)* |
| ④ | **État transitoire** | ⛔ **Ne vaut jamais preuve** — `Chargement…` en particulier |
| ⑤ | **Nature de l'attente** | L'attente vise **l'apparition d'un état final OBSERVABLE**, ⛔ **jamais un délai arbitraire** |
| ⑥ | ⚡ **Repère relevé après une action asynchrone** | **Adresse, identifiant, numéro** : se constatent dans leur **état DÉFINITIF**, ⛔ jamais au premier affichage |

**⭐ La démonstration, et elle est du jour même**

> Deux faits **constatés**, à quelques heures d'intervalle, et ils ne disent pas la même chose :

| Fait constaté | Ce qu'il prouve |
|---|---|
| 🔬 `boutique-r92/tournoi.html` affichait `Chargement…` à la **première** lecture ; le message réel n'est apparu qu'à la **seconde** | ⑤ — **un contrôle qui lit trop vite relève l'écran d'attente et conclut à tort** |
| 🔬 À l'envoi d'un message ChatGPT, l'adresse était `…/c/WEB:cb5ac131-…` — numéro **provisoire** du navigateur. **Douze secondes plus tard** : `…/c/6a8ee7e5-…`, ⛔ **ni le même identifiant, ni le même format** | ⑥ — ⭐ **c'est la première démonstration RÉELLE de la règle**, et la plus instructive |

> 🎯 **Pourquoi le second cas est le plus grave des deux, et c'est ce qui a motivé le point ⑥.**
> L'écran `Chargement…` **se voit** : quiconque relit le rapport comprend que la mesure est
> prématurée. ⛔ **Une adresse provisoire, non.** Elle a la bonne forme, elle passe une validation
> JSON, elle s'écrit sans erreur dans un fichier — et **elle ne mène nulle part**. Le défaut ne se
> révèle qu'au premier clic, des semaines plus tard, quand plus personne ne sait d'où vient
> l'adresse.
>
> ⭐ **Un état transitoire VISIBLE trompe une fois ; un état transitoire PLAUSIBLE trompe
> durablement.**

**⛔ Ce que la décision ne fait PAS**

- ❌ **Pas** lever l'exigence de constater : Playwright **déplace** la frontière du vérifiable, il
  ne supprime pas ce qui reste derrière — le comportement **du serveur en production** reste hors
  d'atteinte du dépôt *(**§13.6**)* ;
- ❌ **Pas** autoriser l'outil hors d'une session locale, ni en navigateur sans fenêtre : ⛔ ce qui
  ne peut pas être **vu par Romain** ne peut pas être **présenté comme vu** ;
- ❌ **Pas** transformer une preuve téléphone en preuve ordinateur, quel que soit le réglage
  d'affichage employé ;
- ✅ **Seulement ceci** : *ai-je VU l'état final attendu, dans un vrai navigateur visible — ou
  seulement l'écran d'attente, une durée écoulée, ou le code ?*

---

### D-054 — Les quatre arbitrages qui ouvrent PUB-4 : un dépôt tiers sous branche, une annonce qui redevient éditoriale, une page qui informe sans transférer, et des preuves qui attendent le découplage

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-26 |
| **Session** | **Session 28** — clôture de **M1-PUB / PUB-3** |
| **Statut** | ✅ **VALIDÉE — décision de Romain**, après présentation du plan et avant tout commit |
| **Décidée par** | Romain |
| **Couvre** | [`M1-PUB-3-PLAN-DECOUPLAGE.md`](M1-PUB-3-PLAN-DECOUPLAGE.md) *(§③, §④, §⑥)* · `PLAN.md` **§15.3 bis** *(PUB-3, PUB-4)* · `RISQUES.md` **R-097, R-098** |
| **Doctrine de référence** | **D-048** — *« Publier ouvre une page. Publier ne parle à personne. »* · **D-052** *(preuve déplacée)* · **D-040** *(preuve discriminante)* |

**Pourquoi cette décision existe**

> ⭐ **PUB-3 a produit un plan technique complet — et s'est arrêté net sur quatre questions.**
> 🎯 **Aucune n'était technique** : *qui a le droit de modifier le dépôt d'une association ?* ·
> *cette association peut-elle encore annoncer son tournoi ?* · *que doit montrer sa page ?* ·
> *quand accepter de publier pour de vrai ?*
>
> ⛔ **Un chantier technique n'a pas à trancher cela seul.** Ce qui manquait à PUB-3 n'était pas de
> l'analyse : **c'était de l'autorité.** Cette fiche l'apporte.

**Les quatre arbitrages**

| # | Ce qui est décidé | ⭐ Ce que ça protège |
|---|---|---|
| **①** | ⛔ **`boutique-r92` ne peut être modifié QUE dans le cadre de PUB-4, et QUE pour le découplage défini par PUB-3.** Travail sur **branche dédiée** ; ⛔ **aucun changement direct de `main`, aucune fusion, aucun déploiement** sans autorisation explicite **après présentation du diff et des contrôles** | ⭐ **Le dépôt d'une association tierce n'est pas le terrain de jeu d'un chantier technique.** La branche rend tout réversible **sans rien défaire** : tant qu'elle n'est pas fusionnée, le site en ligne est intact |
| **②** | **L'association conserve le droit d'annoncer manuellement un tournoi.** Cette annonce est une **décision éditoriale indépendante** : ⛔ **jamais créée, modifiée ou retirée automatiquement** par Maxilou, par `tournoi_publie` ou par le serveur. ⛔ **PUB-4 ne fabrique aucune annonce fictive** | 🎯 **Précision essentielle de D-048.** *« Publier ne parle à personne »* interdit l'**automatisme**, ⛔ **pas l'annonce**. Sans cet arbitrage, une session future aurait pu conclure que toute mention du tournoi sur la vitrine viole la doctrine — **et supprimer un droit que l'association n'a jamais perdu** |
| **③** | **`tournoi.html` est CONSERVÉE** dans `boutique-r92`, en page **statique et indépendante**, proposant un **lien ou bouton explicite** vers la page publique de Maxilou. ⛔ **Ni page condamnée à « Aucun tournoi », ni redirection automatique, ni appel au serveur Maxilou, ni dépendance à `tournoi_publie`.** ⭐ **Texte et présentation soumis à Romain AVANT mise en œuvre** | ⭐ **« Le visiteur reste sur le site de l'association tant qu'il ne choisit pas lui-même d'ouvrir Maxilou. »** 🎯 **La vitrine INFORME, elle ne TRANSFÈRE pas** — une redirection automatique aurait remplacé un couplage invisible par un autre |
| **④** | Les preuves reportées se produisent **pendant PUB-4**, ⛔ **uniquement après** ① le déploiement réel du découplage côté vitrine, ② la vérification **en production** que la vitrine n'interroge plus le serveur, ③ la vérification que Maxilou public fonctionne toujours **indépendamment**. Puis, en **séquence contrôlée** : état initial · publier · Maxilou réagit / la vitrine non · condition 5 de **R-098** + contrôles **6** et **8** · ⭐ **masquer immédiatement** · état final `tournoi_publie = non`. ⭐ **Contrôles ordinateur par Playwright MCP, Chrome visible** *(**§8 octies**)* ; ⛔ **preuve téléphone par Romain**. 🟢 **Jeu fictif conservé jusqu'à l'enregistrement COMPLET des preuves** | 🎯 **C'est l'arbitrage qui rend la preuve inoffensive.** Publier était impossible **tant que le lien existait** ; en exigeant que le découplage soit **prouvé en production d'abord**, la publication du tournoi fictif ⛔ **n'atteint plus personne**. ⭐ **Et « masquer immédiatement » borne la seule fenêtre de risque restante** |

**⭐ Ce que l'arbitrage ④ apporte au plan, et qui n'avait pas été vu**

> Au moment où la séquence de preuves se joue, la vue `invitation` **expose encore**
> `tournoi_publie` : la donnée est **toujours là, toujours servie**. ⭐ **Constater qu'une
> publication reste sans effet dans ces conditions prouve que c'est bien LE LIEN qui a été coupé** —
> ⛔ et non que la donnée a disparu.
>
> 🎯 **Une preuve obtenue après le retrait côté Maxilou serait plus faible : on ne saurait pas
> laquelle des deux coupures a agi.** L'ordre imposé par ④ **renforce** la preuve, il ne fait pas
> que la sécuriser.

**⛔ Ce que cette décision ne fait PAS**

- ❌ **Pas** ouvrir `boutique-r92` aux modifications en général : le périmètre est **PUB-4 et le
  découplage**, ⛔ rien d'autre ;
- ❌ **Pas** autoriser PUB-4 à démarrer — ⛔ **il ne commence pas** sans décision explicite ;
- ❌ **Pas** valider par avance le texte de la nouvelle `tournoi.html` : ⭐ **il sera soumis** ;
- ❌ **Pas** supprimer les preuves reportées par **D-052** : elle les **date**, elle ne les efface pas ;
- ✅ **Seulement ceci** : *ce que je m'apprête à faire dans PUB-4, est-ce couvert par l'un des quatre
  arbitrages — et si non, qui l'a autorisé ?*

---

### D-055 — Une réserve écrite vaut mieux qu'une preuve inventée : R-097 et R-098 se ferment, la limite de la condition 5 reste inscrite pour toujours, et le défaut restant change de lot au lieu de rouvrir celui-ci

| | |
|---|---|
| **Date** | 2026-08-26 *(suite 5)* |
| **Prise par** | **Romain**, au vu du rapport technique de clôture de **M1-PUB / PUB-4** |
| **Porte sur** | `RISQUES.md` *(R-097, R-098)* · `ETAT.md` · `PLAN.md` *(§15.3 bis, PUB-4 et PUB-5)* |
| **Doctrine de référence** | **D-048** — *« Publier ouvre une page. Publier ne parle à personne. »* · **D-052** *(la preuve déplacée)* · **D-054** *(les quatre arbitrages)* |

**Les cinq points de la décision**

| # | Ce que Romain a tranché |
|---|---|
| **①** | **PUB-4 passe à CLOS.** Le résultat technique lui convient |
| **②** | **R-097 est formellement CLÔTURÉ** — le couplage est supprimé des deux côtés, en service, et prouvé |
| **③** | **R-098 est formellement CLÔTURÉ** — ses cinq conditions sont honorées |
| **④** | ⚠️ **La réserve de la condition 5 reste EXPLICITEMENT ÉCRITE**, et ne se détache jamais de la condition |
| **⑤** | **M9** *(le texte obsolète « Aperçu sur le site »)* ⛔ **NE ROUVRE PAS PUB-4** : il est **transmis à PUB-5 comme son PREMIER point à traiter** |

**⭐ Pourquoi le point ④ est le cœur de cette décision**

> 🔬 **Ce qui a été observé** : *« Masquer »* actif en état publié, sur **quatre affichages**, dont
> un **téléphone réel**. 🔬 **Ce que le code démontre** : le tournoi publié, la branche **retourne
> avant toute lecture des prérequis** — le grisage ne peut donc pas s'y appliquer.
>
> ⛔ **Ce qui n'a PAS été joué** : le scénario **littéral** *« publié **+** prérequis volontairement
> cassés »*.
>
> 🎯 **La décision n'est pas « c'est équivalent ».** Elle est : *« deux chemins indépendants — une
> observation répétée et une lecture de code — concluent la même chose, et cela me suffit pour
> fermer. Mais je veux que le dépôt dise pour toujours ce qui n'a pas été fait. »*
>
> ⭐ **C'est exactement `CLAUDE.md` §9 appliqué à une clôture** : on ne présente **jamais** une
> déduction comme une observation. Une session future qui doutera saura **exactement** ce qui
> manque — ⛔ **un seul essai**, publié et prérequis cassés — au lieu de devoir tout refaire.

**⭐ Pourquoi le point ⑤ n'est pas un renvoi de commodité**

> ⚠️ **M9 est un vrai défaut, et il est visible par l'utilisateur** : l'administration promet encore
> *« la carte d'actualité, puis la page de l'événement, tels qu'ils apparaîtront sur le site de
> l'association »* — ⛔ **elles n'existent plus**.
>
> 🎯 **Mais ce n'est PAS le couplage.** R-097 était un **lien technique** entre deux systèmes ; il
> est coupé et prouvé. Ce qui reste est un **texte devenu faux dans un écran**, sans aucun effet
> sur un site tiers. ⭐ **Rouvrir PUB-4 pour cela reviendrait à confondre le défaut avec sa trace**
> — et **PUB-5 existe précisément pour cet écran**, depuis PUB-1.
>
> ⛔ **Le risque à éviter était l'autre** : classer M9 « pour plus tard » sans dire **où**. Il est
> donc inscrit comme **premier point** de PUB-5, dans `PLAN.md` **et** dans `ETAT.md`.

**⛔ Ce que cette décision ne fait PAS**

- ❌ **Pas** clore **M1-PUB** : ⛔ **PUB-5 reste à faire**, et le chantier n'est clos qu'à cinq lots sur cinq ;
- ❌ **Pas** démarrer PUB-5 — ⛔ **il ne commence pas** sans décision explicite *(`CLAUDE.md` §12.4)* ;
- ❌ **Pas** corriger le frontend de l'administration : ⛔ **aucun fichier applicatif n'est touché** par la clôture ;
- ❌ **Pas** décider du sort du **jeu de tournoi fictif** : ⏳ **il reste en place**, et la décision appartient à Romain ;
- ❌ **Pas** réputer joué le scénario littéral de la condition 5 — ⛔ **c'est exactement l'inverse** ;
- ✅ **Seulement ceci** : *ce que je cite de la condition 5, est-ce que je cite AUSSI sa réserve ?*

---

### D-056 — Un aperçu qui affirme sa propre fidélité finit par mentir : la seule copie fiable de la page publique, c'est la page publique elle-même

| | |
|---|---|
| **Date** | 2026-08-26 *(suite 6)* |
| **Prise par** | **Romain**, à la mise en œuvre de **PUB-5 / M9**, sur la base de l'audit en lecture seule |
| **Porte sur** | `PLAN.md` — **fiche PUB-5** et **critère de clôture de M1-PUB, condition ③** |
| **Doctrine de référence** | **D-048** *(publier ne parle à personne)* · **D-054 / ②** *(l'annonce reste éditoriale)* · **D-055** *(M9 transmis à PUB-5)* |

**⚠️ POURQUOI CETTE DÉCISION EXISTE — et ce n'est pas pour numéroter une clôture**

> Le **critère de clôture de M1-PUB**, écrit par **PUB-1**, exige à sa **condition ③** *deux* choses,
> pas une :
>
> | | Le texte d'origine | État |
> |---|---|---|
> | ⛔ | *« L'ancien aperçu de la vitrine externe n'existe plus dans l'admin »* | ✅ **FAIT** *(M9)* |
> | ✅ | *« L'aperçu présenté est celui de la page publique Maxilou »* | ⛔ **NON FAIT — délibérément** |
>
> 🎯 **Sans cette fiche, M1-PUB serait déclaré clos alors que son propre critère dit autre chose.**
> Une session future y lirait soit *« la clôture était irrégulière »*, soit — bien pire —
> *« il manque l'aperçu, construisons-le »*, ⛔ **ce qui défairait M9.** C'est exactement le
> mécanisme que **D-055 / ⑤** a déjà eu à traiter, et il se répète ici.

**Ce que Romain a tranché**

| # | |
|---|---|
| **①** | Le faux aperçu est **SUPPRIMÉ**, ⛔ **pas remplacé** par une réplique HTML de la page publique Maxilou |
| **②** | Le principe qui remplace la seconde moitié de la condition ③ : ⭐ **on OUVRE la vraie page publique, on ne la copie pas.** Le bouton **« Ouvrir la page »**, déjà présent dans la carte *« Publier le tournoi »*, la montre telle qu'elle est |
| **③** | La condition ③ du critère de clôture est **RÉÉCRITE** en conséquence — ⛔ **elle n'est ni supprimée, ni réputée satisfaite en l'état** |

**⭐ Les deux raisons, et la seconde est la vraie**

> **① La réplique serait pauvre.** 🔬 La page publique Maxilou n'affiche aujourd'hui que le **nom**
> du tournoi : la vue `live` n'expose ni la description, ni le lieu, ni l'affiche
> *(`backend/Code.gs`, `frontend/js/tournoi.js`)*. Un aperçu de cette page ne montrerait presque
> rien de ce que l'organisateur vient de saisir.
>
> **② Elle recréerait le défaut qu'on vient de supprimer.** ⚠️ Le reproche fait à l'ancien aperçu
> n'était pas de montrer le **mauvais site** : c'était d'**affirmer sa propre fidélité**. Il
> s'annonçait *« Aperçu RÉEL »*. Une réplique de la page publique Maxilou aurait exactement la même
> faiblesse — elle serait juste **le jour où on l'écrit**, et fausse dès que la vraie page bouge.
> 🎯 **On aurait déplacé le mensonge, pas supprimé sa cause.**

**⭐ Le dépôt avait déjà tranché la même question, ailleurs**

> L'aperçu du **dossier club** fut jadis un lien figé qui a cessé de fonctionner. La règle inscrite
> alors dans le code *(`admin-infos-publication.js`, `majApercuDossier`)* dit :
>
> > *« Un aperçu “générique” ne peut donc PAS exister — et tant mieux : ce que tu veux relire avant
> > d'envoyer, c'est le dossier tel que le club le recevra. »*
>
> ⭐ **D-056 ne fait qu'étendre à la page publique un principe que ce projet applique déjà.**

**⛔ Ce que cette décision ne fait PAS**

- ❌ **Pas** supprimer la condition ③ : elle est **réécrite**, et son exigence de fond — ⛔ *aucun
  aperçu mensonger dans l'administration* — est **plus fortement** satisfaite qu'elle ne l'aurait
  été par une réplique ;
- ❌ **Pas** interdire tout aperçu dans l'administration : `bloc-apercu-invitation` *(l'email réel)*
  et `majApercuDossier` *(le dossier réel d'un club réel)* restent — ⭐ **ils montrent des artefacts
  RÉELS, pas des copies** ;
- ❌ **Pas** prétendre que la seconde moitié du texte d'origine a été exécutée : ⛔ **elle ne l'a pas
  été**, et ce document est là pour qu'on ne puisse jamais l'écrire ;
- ❌ **Pas** décider du sort du **jeu de tournoi fictif** : ⏳ **il reste en place** ;
- ✅ **Seulement ceci** : *cet aperçu que je m'apprête à écrire, est-ce l'artefact RÉEL — ou une
  copie qui devra rester fidèle toute seule ?*

---

### D-057 — `edition_id` est l'identité durable d'une édition ; `tournoi_id` garde son rôle de génération, et on ne le lui retire pas

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-27 |
| **Session** | **31** — chantier **M1-B2 / B2-1**, première passe locale |
| **Statut** | ✅ **CADRAGE VALIDÉ PAR ROMAIN le 2026-08-27**, avant implémentation |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§16.5** *(lot B2-1)* · `RISQUES.md` **R-106** · corollaire de **D-050** |

**Le problème posé**

> `tournoi_id` est reposé **à chaque « Générer poules et planning »**. Régénérer étant un geste
> normal et répété, un seul tournoi réel produit plusieurs identifiants — et l'onglet `Historique`
> répartit alors ses matchs entre plusieurs « éditions » fantômes. ⭐ **Il identifie une
> GÉNÉRATION, pas une ÉDITION** *(R-106)*.

**Ce qui est décidé**

| | |
|---|---|
| 🆕 **`edition_id`** | UUID tiré **une seule fois, à l'ouverture** de l'édition. ⛔ **Ne change JAMAIS** : ni à une régénération des poules ou du planning, ni à une modification d'équipes, ni à la publication ou au masquage, ni à la saisie ou à la correction d'un score |
| 🆕 **Registre `Editions`** | `edition_id`, `statut` *(`active` / `fermee`)*, date de création, date de fermeture. ⭐ **UNE SEULE ligne `active`** |
| ⭐ **Une seule adresse** | `edition_id` vit **dans le registre, et nulle part ailleurs** — ⛔ **surtout pas dans `Config`** *(`CLAUDE.md` §8 quater)*. Effet de bord voulu : il ne peut pas fuir par une vue publique, puisqu'il n'est pas un paramètre de `Config` |
| ⭐ **Cycle de vie** | Reset **RÉUSSI** ⇒ l'ancienne édition passe à `fermee` **et** une édition neuve est ouverte, ⛔ **en une seule écriture**. Reset **ÉCHOUÉ** ⇒ ⛔ **rien ne bouge** : l'ancienne reste `active` |
| ⭐ **Anomalie contrôlée** | Plusieurs `active` ⇒ le logiciel **refuse** d'ouvrir, de basculer **et de réinitialiser** — ce dernier refus **avant tout effacement**. ⛔ **Aucune édition n'est choisie au hasard** |
| ⛔ **Aucun sélecteur** | `edition_id` est une **étiquette de rattachement**, ⛔ **pas** un sélecteur. Maxilou reste **mono-tournoi** |
| ⛔ **Aucun `club_id`** | B2-1 n'en crée pas. La colonne du club organisateur, si elle vient, s'ajoutera **à droite**, en migration douce |

**⚠️ LE POINT D'ÉCART À CONNAÎTRE — et il faut le dire, pas le lisser**

> La ligne **B2-1** du tableau §16.5 de `PLAN.md` annonce, depuis le 2026-08-24 :
> *« `edition_id` propre + registre `Editions` **+ fin du renouvellement de `tournoi_id`** »*.
>
> ⛔ **Le cadrage validé le 2026-08-27 dit AUTRE CHOSE**, en toutes lettres : *« `tournoi_id` peut
> continuer d'exister pour ses rôles techniques actuels, mais ne doit plus porter la sémantique
> historique de l'édition »*. ⭐ **C'est le cadrage validé qui fait foi**, et l'implémentation le
> suit : **le renouvellement de `tournoi_id` n'a PAS été supprimé.**
>
> 🎯 **Et c'est le choix prudent, pour une raison technique précise** : `tournoi_id` est la **clé de
> dédoublonnage de l'onglet `Historique`**, avec `id_match` *(`archiverResultat`)*. Le figer
> reviendrait à faire écraser les lignes d'une génération par celles de la suivante dès que deux
> `id_match` coïncident. ⛔ **Ce serait une perte de données silencieuse dans le journal de saison,
> pour un bénéfice nul** : l'identité de l'édition est désormais portée par `edition_id`.
>
> ⏭️ **Ce qui reste à trancher, et ce n'est PAS à une session de le faire** : faut-il, en **B2-6**,
> remplacer `tournoi_id` par `edition_id` comme clé de `Historique` *(c'est ce que §16.2 prévoit :
> « `tournoi_id` → `edition_id` »)*, et selon quelle règle de dédoublonnage ? ⛔ **Question ouverte.**

**Ce que cette décision ne dit PAS**

- ❌ **Pas** que R-106 est clos : il ne le sera qu'après **déploiement, migration réelle et
  constat en conditions réelles** *(`CLAUDE.md` §13.6)* ;
- ❌ **Pas** que quoi que ce soit porte déjà un `edition_id` : ⛔ **rien** n'est rattaché en B2-1 —
  ni participation, ni match, ni terrain. Le rattachement appartient à **B2-2** et **B2-6** ;
- ❌ **Pas** que le classeur en service a changé : ⛔ **aucune écriture n'y a été faite.**

---

### D-058 — B2-1 et R-106 se ferment sur une preuve réelle, pas sur un critère satisfait ; le cas d'échec reste au harnais, et une déduction prise pour un constat a valu la sauvegarde qui rend la comparaison possible

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-27 |
| **Session** | **31** *(suite 3)* — chantier **M1-B2 / B2-1**, clôture |
| **Statut** | ✅ **VALIDÉE — décision explicite de Romain**, après le reset nominal réel et le contrôle direct du classeur |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§16.5** *(lot B2-1)* · `RISQUES.md` **R-106** · suite de **D-057** |

**Ce qui est décidé**

| | |
|---|---|
| 🏁 **B2-1** | **CLÔTURÉ** |
| ✅ **R-106** | **CLOS** |

**Ce qui l'établit — et il faut distinguer les deux natures de preuve**

⭐ **Prouvé EN RÉEL, sur le classeur** :

| | |
|---|---|
| Déploiement | Version **159**, même URL, mêmes droits, aucun second déploiement |
| Tests | **`974/974 OK, 0 FAIL`** lu **deux fois** dans le journal Apps Script — ⚠️ **les deux AVANT le reset** ; ⛔ **aucun lancement après le reset n'a été fait, et rien ne sera écrit qui le laisse croire** |
| Migration | Onglet `Editions` créé, une édition `active` |
| Idempotence | Relance : *« rien à faire »*, ⛔ aucun doublon, même date **à la seconde près** |
| Stabilité | **3 régénérations ⇒ 3 `tournoi_id` distincts, 1 seul `edition_id`** |
| ⭐ **Bascule au reset** | Ancienne édition **`fermee`** avec sa date · **neuve `active`**, autre identifiant · **1 active / 1 fermée** — ⛔ **jamais deux actives** |
| Conservation | `Historique` **211 lignes, contenu strictement identique à la sauvegarde** · `ClubsInvites` **3 lignes**, **5 colonnes d'identité et de contact identiques**, **11 champs d'engagement vidés**, **jetons renouvelés** |
| Effacement | `Equipes` / `Poules` / `Matchs` = **0 / 0 / 0** · catégorie supprimée · `tournoi_id` vidé · tournoi masqué |

⛔ **Prouvé par le HARNAIS SEUL — et assumé comme tel** :

> **Le cas d'ÉCHEC du reset** *(une panne en cours d'effacement laisse l'édition inchangée)*.
> ⭐ **Il n'a délibérément PAS été provoqué en production** : le provoquer exigerait de casser
> volontairement le classeur, pour établir une propriété qui n'est pas comportementale mais
> **structurelle** — la bascule est la **dernière instruction** de `reinitialiserTournoi`, donc
> toute exception antérieure l'empêche mécaniquement. Le test
> `testB21_resetEchecPasDeDemiBascule` l'établit, et ⭐ **il a été vu échouer sur code muté**
> *(bascule remontée avant les effacements → 3 échecs)*. ⚠️ **Ne jamais l'écrire comme constaté en
> production** *(`CLAUDE.md` §13.6)*.

**🎯 Les deux leçons de méthode, et elles valent au-delà de ce lot**

> **① Le critère n'est pas le contrat.**
>
> Les deux critères **écrits** — *« régénérer 3× ⇒ un seul `edition_id` »* *(`PLAN.md` §16.5)* et
> *« redéploiement + migration + constat réel »* *(fiche R-106)* — étaient **littéralement
> satisfaits AVANT le reset**. ⛔ **La clôture a pourtant été refusée**, parce qu'ils avaient été
> rédigés le **2026-08-24**, avant le contrat détaillé **D-057** du **2026-08-27**, qui exige aussi
> le comportement au reset.
>
> ⭐ *Un critère écrit trop tôt peut être satisfait avant que le travail ne soit fini.* La clôture a
> été retardée d'une passe, et elle repose maintenant sur une **observation**, pas sur une case
> cochée.

> **② ⚠️ Une déduction présentée comme un constat a failli faire prendre un risque inutile.**
>
> L'audit préparatoire au reset annonçait `Historique` et `ClubsInvites` **vides**, et concluait
> qu'une sauvegarde serait superflue. ⛔ **Ils contenaient respectivement 211 et 3 lignes.**
>
> 🔬 **La cause n'était pas une mauvaise lecture du code** — l'audit du code était juste. Elle
> venait du **repère du jeu de tournoi fictif**, qui décrit *« aucun club invité »* : vrai **de ce
> jeu-là**, ⛔ **pas du classeur**. La déduction avait été écrite **entre parenthèses, sans être
> marquée comme hypothèse** — exactement ce que **`CLAUDE.md` §9** interdit.
>
> ⭐ **Repérée par Romain, elle a produit un meilleur résultat que si elle n'avait jamais existé** :
> la recommandation *« pas de sauvegarde »* a été retirée, **une copie complète du classeur a été
> créée avant le reset**, et c'est elle qui permet aujourd'hui d'écrire *« strictement identique à
> la sauvegarde »* au lieu de *« probablement intact »*. ⛔ **Sans la correction, cette comparaison
> n'existerait pas.**
>
> 🎯 **Ce qu'il faut en retenir** : *une déduction non marquée ne se distingue pas d'un constat — et
> c'est le lecteur suivant qui paie la différence.*

**Ce que cette décision ne dit PAS**

- ❌ **Pas** que **R-101** est réglé : les 6 réglages de terrains ont **survécu** au reset — ⭐ résultat
  **attendu**, figé par un test témoin. **R-101 RESTE OUVERT**, il appartient à **B2-3** ;
- ❌ **Pas** que quoi que ce soit porte un `edition_id` : ⛔ **rien** n'est rattaché — ni participation,
  ni match, ni terrain. C'est **B2-2** et **B2-6** ;
- ❌ **Pas** que `tournoi_id` a été corrigé : il reste **délibérément** renouvelé à chaque génération
  *(**D-057**)*. Son remplacement éventuel comme clé de `Historique` reste **ouvert pour B2-6** ;
- ❌ **Pas** que le classeur est prêt : il est **vierge de tournoi** depuis le reset, et ⛔ **il n'a
  pas été reconstruit**. Le refaire appartient à Romain.

---

### D-059 — B2-2 : ce qui prouve une participation, ce qui la crée, et pourquoi retirer un club ne l'efface pas

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-27 |
| **Session** | Chantier **M1-B2** — sous-lot **B2-2**, passe locale |
| **Statut** | ✅ **VALIDÉE — arbitrages de Romain**, donnés avant implémentation |
| **Décidée par** | Romain |
| **Couvre** | `PLAN.md` **§16.5 quinquies** · `RISQUES.md` **R-102, R-104, R-105** · précise **D-050** |

**Le problème posé**

> **D-050** avait décidé *quoi* faire : séparer `Clubs` et `Participations`. ⛔ Il ne disait pas
> *comment migrer les données existantes*, et c'est là que tout se joue. Migrer oblige à répondre,
> ligne par ligne : **ce club a-t-il réellement participé, ou est-il seulement inscrit au carnet ?**
>
> ⚠️ **La réponse évidente était fausse.** L'équivalence *« 1 ligne `ClubsInvites` = 1 club + 1
> participation »* fabriquerait une participation pour **tout club du carnet** — l'inverse exact de
> D-050. Deux colonnes d'engagement se posent en effet **avant tout envoi** : `club_token`
> *(`assurerTokensClubs` en pose un à chaque ouverture de l'administration)* et `statut = 'Invité'`
> *(valeur par défaut d'`ajouterClubInvite`)*.

**Ce qui est décidé**

| | |
|---|---|
| ⭐ **La règle de migration** | **1 ligne `ClubsInvites` = 1 `Club`.** Une **`Participation`** n'est créée que si la ligne porte une **preuve réelle d'engagement** |
| ⭐ **Le prédicat** | ⛔ `club_token` et `statut = 'Invité'` ne sont **jamais** des preuves. Les **dix autres** colonnes le sont : envois réussis, réponse du club, effectifs, catégories, sélection, alerte d'écart |
| ⭐ **Le cas ambigu** | `Invité` **sans** `invitation_envoyee` ⇒ ⛔ **aucune participation**, toujours, de façon déterministe. On ne fabrique jamais un engagement dont on n'a pas la preuve — et rien n'est perdu, `ClubsInvites` reste intact |
| ⭐ **Une participation naît d'une INTENTION** | Inviter, enregistrer une sélection, changer un statut à la main. ⛔ **Jamais** d'une lecture, d'un écran ouvert ou d'un helper passif |
| ⭐ **Le jeton suit la participation** | Il naît avec elle, ⛔ jamais tout seul. `assurerTokensClubs` ne complète plus que les participations **existantes** |
| ⭐ **`Invité` après l'envoi** | Le statut n'est plus écrit d'office à la création : le voir signifie désormais **« l'email est parti »** *(application littérale de D-050)* |
| ⭐ **Suppression LOGIQUE** | Retirer un club le fait disparaître de l'écran et emporte ses équipes, **comme avant** — mais son identité reste au carnet, `actif = non`. ⛔ La participation de l'édition **en cours** part ; celles des éditions **fermées**, jamais |
| ⭐ **Idempotence par CONVERGENCE** | ⛔ **Aucun drapeau « déjà migré »** : *zéro participation active* est un état **valide** — c'est celui du classeur réel depuis le reset. La migration calcule l'écart entre ce qui devrait exister et ce qui existe, et n'écrit que la différence |
| ⭐ **`ClubsInvites` reste intact** | Rien n'est déplacé, seulement **recopié**. Sa suppression n'est **pas** l'objet de B2-2 et devra être décidée séparément |

**Le risque que la conservation CRÉE — et qui devait être nommé**

> ⭐ **Garder l'histoire garde aussi les jetons.** Les participations passées ne sont plus effacées ;
> leurs `club_token` non plus. ⛔ Sans filtre, **un lien de l'édition précédente redeviendrait
> valide du seul fait qu'on conserve désormais le passé** — la régression exacte de **T6**,
> introduite par la structure censée l'empêcher.
>
> 🎯 **C'est le genre de défaut qu'une migration réussie peut produire sans qu'aucun test existant
> ne bronche.** Toute lecture par jeton est donc bornée à l'**édition active**, et le test
> **B2-2 / N3** l'éprouve en vérifiant d'abord que le jeton **est bien encore en base**.

---

### ⚡ COMPLÉMENT DU 2026-08-27 *(seconde passe locale)* — quatre points verrouillés avant toute preuve réelle

> ⭐ **Ces clarifications appartiennent au MÊME arbitrage** : elles précisent B2-2 avant son
> intégration, elles ne le remplacent pas. ⛔ **C'est pourquoi elles vivent ici et non sous un
> D-060** — la décision est une, sa mise au point s'est faite en deux temps.
>
> ⚠️ **Trois des quatre corrigent un DÉFAUT RÉEL du code de la première passe**, pas une simple
> imprécision de rédaction. Le dire est le seul moyen qu'une session future comprenne pourquoi
> ces règles sont écrites aussi fermement.

**① LA MIGRATION EST EXPLICITE, ET ELLE SEULE.**

| | |
|---|---|
| **Ce qui a été écarté** | La première passe faisait converger un classeur non migré **à la première écriture métier**. Séduisant — c'est le patron « migration douce » du dépôt — ⛔ **mais faux ici** |
| ⭐ **Pourquoi** | Une écriture ordinaire *(ajouter un club, enregistrer une réponse)* n'a **aucune raison** de décider seule de changer la STRUCTURE du classeur. Si elle échouait à mi-chemin, celui-ci se retrouverait dans un état **que personne n'a demandé**, au milieu d'un geste sans rapport |
| ✅ **La règle** | Seul `migrerClubsMaintenant()` crée ou fait basculer la structure. Un classeur non migré suit le chemin **legacy de bout en bout** — `Invité` d'office et jeton à l'ajout compris |

**② TROIS ÉTATS, ET « LES ONGLETS EXISTENT » N'EN EST PAS UN.**

| État | Ce qui fait foi |
|---|---|
| **① non commencée** — pas de marque, carnet vide | ⭐ **LEGACY** |
| **② partielle** — pas de marque, carnet non vide | ⭐ **LEGACY ENCORE.** La reprise est possible ; ⛔ **le métier ne bascule pas** |
| **③ terminée** — la **marque** est posée | ⭐ **B2-2** |

> ⚠️ **Le danger que cela ferme, nommément** : une migration interrompue laisse un carnet
> **incomplet**. Si le métier basculait sur ce seul constat, des clubs **disparaîtraient de
> l'écran** — et la première écriture les **recréerait en double**. ⛔ Un état partiel ne doit
> jamais ressembler à un succès.
>
> ⭐ **La marque est `Config.migration_clubs_b22`**, posée **uniquement après** un contrôle de
> cohérence ligne à ligne. ⛔ **Pas dans les propriétés du script** : elles ne sont **pas
> sauvegardées avec le classeur**, et restaurer une copie d'avant migration y laisserait une
> marque **orpheline** affirmant que tout est migré.

**③ APRÈS LA MARQUE, `ClubsInvites` N'EST PLUS UNE SOURCE D'IDENTITÉS.**

> 🎯 **Le défaut fermé** : la première passe rapprochait le legacy du carnet **par le nom**, à
> chaque exécution. Renommer un club dans `Clubs`, puis relancer la migration, aurait fait
> **renaître un second club** sous son ancien nom — resté, lui, dans l'ancien onglet.
>
> ⭐ **Une migration terminée se reconnaît à sa marque, ⛔ jamais en rematchant un nom mutable.**
> Relancée, elle **constate** et s'arrête. Et si un état **partiel** n'est pas reprenable sans
> ambiguïté — un club présent dans `Clubs` mais **inconnu** de `ClubsInvites` — elle **REFUSE en
> nommant l'obstacle**, plutôt que d'inventer une identité.

**④ 📸 LES SNAPSHOTS SE FIGENT AU PREMIER ENVOI PRINCIPAL RÉUSSI — ⛔ pas à la création.**

> ⚠️ **Le code de la première passe les figeait à la création de la participation, et c'était un
> vrai défaut**, pas une imprécision du rapport. Une participation peut exister **avant tout
> envoi** — on prépare une invitation, on l'envoie le lendemain. Des snapshots posés là
> **prétendent décrire une invitation qui n'a pas eu lieu**, et **mentent** sur ce qui a été
> envoyé si les coordonnées changent entre-temps.

| Moment | Ce qui se passe |
|---|---|
| **Création de la participation** | ⛔ Les 4 snapshots restent **vides**. ⛔ Ni `Invité`, ni date |
| **Contact modifié avant l'envoi** | ⭐ Le premier envoi part sur les coordonnées **réellement courantes**, et ce sont **elles** qui sont figées |
| **Premier envoi RÉUSSI** | ⭐ Les 4 snapshots sont posés, avec les valeurs **réellement utilisées** — ⛔ pas celles relues après coup, qui diffèrent dès qu'une fiche change pendant un envoi groupé. `Invité` et la date sont posés |
| **Contact modifié après** | ⛔ Les snapshots **ne bougent pas**. C'est leur raison d'être |
| **Renvoi** | ⛔ **Aucune réécriture** — l'histoire ne se refait pas |
| **Échec de l'envoi** | ⛔ Rien : ni snapshot, ni `Invité`, ni date. Le club reste **invitable** |
| ⭐ **Création d'un JETON** | ⛔ Ne fige rien et ne pose rien : **un jeton n'est pas un envoi** |

**⑤ MIGRATION LEGACY — deux cas, et le prédicat qui les sépare.**

| Cas | Condition | Snapshots |
|---|---|---|
| **A — invitation principale PROUVÉE** | `invitation_envoyee` porte une date *(elle n'est posée qu'au **succès** d'un envoi)* | ✅ Remplis avec les valeurs legacy — ⚠️ **meilleure approximation disponible**, ⛔ **jamais présentée comme preuve exacte de l'adresse historiquement employée** |
| **B — participation prouvée AUTREMENT** | Réponse du club, effectifs, catégories, sélection… ⛔ mais aucune trace d'envoi | ⛔ **VIDES.** La participation existe, ⛔ mais **on ne fabrique pas un historique d'invitation**. Ils se figeront au premier envoi réel |

> ⚠️ **`dossier_envoye` est délibérément ÉCARTÉ comme preuve d'invitation principale** : il
> atteste l'envoi du **dossier** *(phase 2)*, pas de l'**invitation** *(phase 1)* — un club a pu
> être invité de vive voix. ⛔ **Déduire l'un de l'autre serait affirmer plus que la donnée ne
> permet.**

**⑥ `statut = 'Invité'` legacy seul — règle CONFIRMÉE, inchangée.**

> Il ne crée **aucune** participation à la migration : le code ancien le posait **par défaut** à
> la création de la fiche. ⭐ **La donnée reste intacte dans `ClubsInvites`** — elle n'est pas
> perdue, elle n'est pas reprise.

---

**Ce que cette décision NE dit PAS**

- ❌ **Pas** qu'un moteur de dédoublonnage par nom ou par email existe : ⛔ **il n'y en a
  aucun**, et l'arbitrage l'a explicitement exclu du périmètre ;
- ❌ **Pas** que `ClubsInvites` disparaît : il reste, intact, et sa suppression sera décidée à part ;
- ❌ **Pas** que Maxilou devient multi-éditions : ⛔ **une seule reste active**, aucun sélecteur ;
- ❌ **Pas** que le club organisateur est traité : la **structure** le permettra, ⛔ **le parcours
  n'est pas écrit** *(hors périmètre B2-2)* ;
- ❌ **Pas** qu'un moteur de fusion, de réactivation ou de dédoublonnage de clubs existe : ⛔ **il
  n'y en a aucun**, et il n'était pas demandé ;
- ❌ **Pas** que la migration a eu lieu sur le classeur réel : ⛔ **elle n'a PAS été exécutée**.
