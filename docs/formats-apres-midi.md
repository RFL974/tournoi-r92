# Formats d'après-midi (par catégorie)

> ⚠️ **`COUPE_PLATEAU` comporte des phases finales, qui ne sont pas conformes au cadre École de
> Rugby.** Source : *Formulaire de demande d'autorisation — organisation de tournoi École de
> Rugby*, FFR, grille 2026-2027, « Rappel des principes généraux » : « Les phases finales (1/4,
> demi finale et finale) sont interdites sur les tournois ou plateaux Ecoles de Rugby. »
>
> **Ce format reste néanmoins PROPOSÉ** dans l'administration — parce qu'un événement peut relever
> d'un autre règlement, et que **l'application n'a pas à trancher lequel s'applique** *(principe
> **D-031**)*. Ce qu'elle fait, c'est **empêcher qu'on le choisisse sans le savoir** : la carte est
> signalée, et une **confirmation** est demandée avant que le choix soit appliqué.
>
> 👉 **Les trois choses à ne pas confondre**, et ce document les distingue partout :
>
> | | |
> |---|---|
> | **Ce que la règle FFR interdit** | Les phases finales, **sur un tournoi ou plateau École de Rugby** — c'est la citation ci-dessus |
> | **Ce que l'interface fait** | Elle **propose** le format, le **signale** (⚠️ dans le titre de la carte, liseré ambre) et **demande confirmation** avant de l'appliquer |
> | **Ce que l'application ne fait PAS** | Elle ne dit **pas** que le format est interdit partout, et elle ne **détermine pas** quel règlement s'applique à ton événement. Elle informe ; **tu décides** |

Depuis cette évolution, **chaque catégorie choisit son propre format d'après-midi** — dans le
même tournoi, les M8 peuvent jouer en « Matchs libres » pendant que les M12 jouent en
« Poules de niveau ». Le choix se fait **au paramétrage** (page Administration), avant le jour J,
pour pouvoir l'expliquer aux équipes à l'avance.

> 🧭 Le **matin** ne change pas : il reste une phase de **poules** (round-robin) pour toutes les
> catégories. Seul l'**après-midi** devient configurable.

---

## Cas particulier des U14 : contexte « Super Challenge de France » (session 13)

Un tournoi **U14** n'est pas toujours un tournoi club ordinaire : il peut être un plateau du
**Super Challenge de France** (compétition officielle FFR de la catégorie M14), dont la structure
n'a **rien** d'un « matin en poules + après-midi configurable ». Pour ne pas mélanger les deux
mondes, la fiche d'une catégorie **U14** (et elle seule) affiche un choix de **contexte** :

- **Tournoi ordinaire** *(défaut)* — comportement inchangé : matin en poules, après-midi selon le
  format choisi (Poules de niveau / Croisé / Diagonal / Libre / ⚠️ Coupe + Plateau). Les 5 cartes
  de format restent visibles.
- **Super Challenge de France** — le plateau suit le **règlement du Super Challenge** en
  **Jeu à XV (15×15)**. Les cartes « format d'après-midi » sont alors **masquées** (sans objet) et
  un panneau récapitule la structure selon la **phase** retenue :
  - **Phase 2** (janv.–févr.) : **1 journée**, triangulaire ou quadrangulaire, 2 rencontres, **2 × 15 min** ;
  - **Phase 3 & clôture** (avr.–juin) : **2 journées**, triangulaire, samedi 2 matchs / dimanche 3, **2 × 11 min**.

  Barème identique à celui de l'app : **Victoire 3 / Nul 2 / Défaite 1**.

### Ce qui est réellement généré

- **Phase 2 — générée automatiquement.** « Générer les poules » produit directement le plateau :
  chaque groupe de **3** devient une **triangulaire** (3 matchs, 2 par équipe) et chaque groupe de
  **4** une **quadrangulaire** (4 matchs précis, 2 par équipe — pas un round-robin de 6). Le **temps
  de jeu est forcé à 2×15 min** (les réglages de mi-temps de la catégorie sont ignorés en SCF), et
  il n'y a **pas de phase après-midi** séparée. Le regroupement **privilégie les triangulaires** :
  un effectif multiple de 3 donne **uniquement des triangulaires** ; un reste de 1 ou 2 ajoute une
  (ou deux) quadrangulaire(s) d'appoint. Exemple : 12 équipes → **4 triangulaires** ; 10 → 4+3+3.
  *(Le nombre de poules forcé à la main prime toujours si tu le renseignes.)*
- **Phase 3 — sur 2 journées, en deux étapes.**
  - **Samedi** : « Générer les poules » produit les **triangulaires** en **2×11 min** (comme la
    Phase 2, mais avec le temps de la Phase 3). La Phase 3 se joue **en triangulaires uniquement**
    (règlement) : si l'effectif n'est pas un multiple de 3, un **avertissement** le signale.
  - **Dimanche** : une fois **tous les scores du samedi saisis**, le bouton **« Générer le dimanche
    (brassage) »** (page *Poules & planning*, révélé uniquement s'il existe une catégorie U14 en
    Phase 3) crée la 2ᵉ journée **par niveau** : les 1ᵉʳˢ de chaque poule ensemble, les 2ᵉˢ ensemble,
    les 3ᵉˢ ensemble (poules E/F/G du règlement), chacun en round-robin, en **2×11**. C'est
    exactement le **classement croisé** réutilisé : le classement général et le podium fonctionnent
    donc sans code d'affichage dédié. Régénérable si un score du samedi est corrigé (idempotent).

  > Techniquement : le samedi = matchs `phase = poule` ; le dimanche = matchs `phase = classement`
  > (2ᵉ journée), générés par l'action `genererDimancheScf` qui réutilise `fixturesApresMidiCroise`
  > et planifie au **début de journée** (départ forcé, sans lien avec le samedi).

- **Arbitrage désigné.** Sur chaque triangulaire/quadrangulaire, l'app désigne **l'équipe qui ne
  joue pas** comme arbitre du match — triangulaire : la 3ᵉ équipe ; quadrangulaire : la table du
  règlement (M1→E1, M2→E2, M3→E3, M4→E4, chaque équipe arbitre une fois). C'est **affiché** sur les
  3 écrans (« 🧑‍⚖️ Arbitre : … ») et **stocké** (colonne `arbitre` de l'onglet Matchs).
  *(En Phase 3 officielle, l'arbitrage est assuré par des arbitres FFR ; la désignation de la 3ᵉ
  équipe reste un repère pratique.)*

> 🗣️ **Vocabulaire à l'écran.** Pour une catégorie en Super Challenge, les 3 écrans (admin, saisie,
> page publique) affichent **📅 Samedi / 🏆 Dimanche** (Phase 3) ou **🏉 Plateau** (Phase 2), les
> groupes en **Triangulaire / Quadrangulaire A** (selon 3 ou 4 équipes), et le brassage du dimanche
> en **Poule E/F/G** (au lieu du générique « Matin — poules / Poule A / Niveau N1 »). Ces libellés
> sont produits par des helpers partagés de `commun.js` qui renvoient `null` hors Super Challenge —
> les tournois ordinaires sont donc **strictement inchangés**.

> Colonnes `contexte_tournoi` / `scf_phase` de l'onglet Config — voir
> [`structure-google-sheet.md`](structure-google-sheet.md). Tant que rien n'est choisi, ou hors U14,
> **rien ne change** (prudent par construction). *(Le Jeu à 7 / Sevens U14 n'est volontairement pas
> couvert ici.)*

---

## Les 5 formats proposés

> Ils sont présentés ici **dans l'ordre où les cartes apparaissent** dans l'administration.
> Les **quatre premiers** se choisissent sans rien de particulier. Le **cinquième**,
> `COUPE_PLATEAU`, est proposé lui aussi mais **porte un avertissement réglementaire** — il a sa
> propre section, [plus bas](#le-format-signalé--coupe--plateau-coupe_plateau).

### 1. Poules de niveau (`POULES_NIVEAU`)

Le **classement de midi, toutes poules confondues**, est découpé en **tranches de 4 à 5 équipes** :
la **poule haute** (les meilleurs), puis le niveau 2, etc. Chaque tranche joue ensuite un
**round-robin COMPLET** — chacun rencontre chacun **dans sa tranche**.

Le **1ᵉʳ de la poule haute remporte le tournoi**, **sans finale ni match sec** : c'est ce qui rend
ce format **conforme École de Rugby** tout en désignant quand même un vainqueur.

**Pourquoi il existe.** Le croisé classique donne peu de jeu quand le matin ne compte que 2 ou
3 poules : un niveau à 2 équipes, c'est **1 seul match** l'après-midi. Ici, une poule haute de 4
donne **3 matchs à chacun**. C'est le format **recommandé à 2-3 poules le matin**.

- **Comment le classement de midi est établi** : d'abord **tous les 1ᵉʳˢ** de poule, puis tous les
  2ᵉˢ, etc. ; **à rang égal**, on départage aux **points du matin** (points, puis différence, puis
  points marqués — le barème habituel).
- **Comment les tranches sont taillées** : le nombre de tranches est `arrondi_supérieur(équipes ÷ 5)`,
  et **le reste va aux tranches DU BAS**. C'est **voulu** : à effectif inégal, **c'est le bas du
  classement qui joue le plus**. Exemple : **9 équipes → une poule haute de 4 et une poule basse
  de 5**.
- **Fonctionne dès 1 poule le matin** (il lui faut seulement **2 équipes classées**).
- **Paramètre** : aucun.
- **Affichage public** : tableaux **par poule de niveau**, puis le **classement général** et le
  **podium** — exactement comme le croisé, dont il réutilise le calcul.
- **Vocabulaire à l'écran** : les trois écrans (admin, saisie, page publique) disent
  **« Poule haute »**, **« Poule basse »**, **« Poule niveau k »** au milieu, et **« Poule de
  classement »** s'il n'y en a qu'une — au lieu du générique « Niveau N1 ».

| Équipes classées | Tranches obtenues | Matchs de l'après-midi |
|---|---|---|
| 6 | 3 + 3 | 6 |
| 8 | 4 + 4 | 12 |
| **9** | **4 + 5** *(le bas joue plus)* | 16 |
| 12 | 4 + 4 + 4 | 18 |
| 15 | 5 + 5 + 5 | 30 |

### 2. Classement croisé (`CROISE`) — *format historique, par défaut*
Les équipes sont **reclassées par niveau** après les poules du matin (tous les 1ᵉʳˢ de poule
ensemble = Niveau 1, tous les 2ᵉˢ = Niveau 2, etc.), puis chaque niveau joue en **round-robin**.
Un **classement général** et un **podium** sont désignés : le **vainqueur du Niveau 1** (le groupe
des premiers de poule) **remporte le tournoi**. C'est le comportement décrit dans
[`phases-tournoi.md`](phases-tournoi.md).

- **Paramètre** : aucun.
- **Affichage public** : tableaux par niveau **+ classement général (vainqueur en tête) + podium**.
  Le podium 🥇🥈🥉 s'affiche dès qu'il est **mathématiquement certain** ; avant, le classement
  général montre l'équipe **en tête** (provisoire).

### 3. Classement croisé **diagonal** (`CROISE_DIAGONAL`)

> ⚠️ **À ne pas confondre avec le croisé classique ci-dessus.** La différence tient en une phrase :
> - **Croisé** (`CROISE`) : les équipes de **même rang** s'affrontent — **1ᵉʳ contre 1ᵉʳ**, 2ᵉ contre 2ᵉ…
> - **Croisé diagonal** (`CROISE_DIAGONAL`) : les rangs sont **décalés** — **le 1ᵉʳ d'une poule
>   affronte le 2ᵉ d'une AUTRE poule**. Des affiches plus imprévisibles.

Comme le croisé classique, l'après-midi reste organisé **par niveaux** et alimente **le même
classement général + podium** (aucune élimination, ce sont de simples matchs isolés). Mais ici
**chaque niveau regroupe deux rangs consécutifs** croisés en diagonale : Niveau 1 = 1ᵉʳˢ + 2ᵉˢ,
Niveau 2 = 3ᵉˢ + 4ᵉˢ, etc.

**Règles de pairage :**
- **2 poules** : `1ᵉʳA vs 2ᵉB`, `1ᵉʳB vs 2ᵉA`, `3ᵉA vs 4ᵉB`, `3ᵉB vs 4ᵉA`…
- **3 poules ou plus** : **rotation cyclique** — `1ᵉʳA vs 2ᵉB`, `1ᵉʳB vs 2ᵉC`, `1ᵉʳC vs 2ᵉA`…
  Chaque équipe joue **une fois**, contre une équipe de rang voisin d'une autre poule.
- **Effectif impair** (un rang « haut » sans rang « bas » partenaire) : **repli en croisé classique**
  pour ce rang (round-robin des équipes de même rang) ; une équipe restée **seule** est mise **au
  repos**, signalée par un avertissement à la génération.

- **Paramètre** : aucun.
- **Affichage public** : **identique au croisé** (tableaux par niveau + classement général + podium).
  Techniquement, ce format réutilise exactement l'affichage et le calcul de classement du croisé.

### 4. Matchs libres (`LIBRE`)
Des **matchs amicaux tournants**, **sans classement ni podium** — juste du temps de jeu. On génère un
round-robin (chacun rencontre chacun une fois) sur toutes les équipes de la catégorie. Recommandé
pour les plus jeunes (M6–M8), où l'on ne veut **aucune hiérarchie ni pression**.

- **Paramètre** : aucun.
- **Affichage public** : simple liste de matchs, avec la mention « sans classement ». **Pas de podium.**
- **Saisie** : un bandeau « 🎈 Match amical — sans classement » rappelle au bénévole que rien ne bouge
  dans un classement après validation (c'est normal).

---

## Le format signalé : Coupe + Plateau (`COUPE_PLATEAU`)

> ⚠️ **Ce format est proposé comme les autres, mais il est SIGNALÉ.** Il comporte des **phases
> finales** (quarts, demies, finale), qui **ne sont pas conformes au cadre des rencontres École de
> Rugby** *(voir le rappel en tête de document)*.
>
> **Pourquoi on ne l'a pas retiré.** Tous les événements ne relèvent pas du cadre École de Rugby.
> Un organisateur qui sait que le règlement applicable à son événement autorise les phases finales
> doit pouvoir choisir ce format. **Ce qu'il ne faut pas, c'est qu'on le choisisse sans connaître
> la règle** — d'où l'avertissement, et non le retrait. C'est le principe **D-031** : *la
> réglementation appartient au responsable du tournoi, pas à l'application*.
>
> **Ce que fait concrètement l'interface** *(vérifié dans le code)* :
>
> | Quand | Ce qui se passe |
> |---|---|
> | **Sur la carte de choix** | Titre **« ⚠️ Coupe + Plateau — hors cadre École de Rugby »**, liseré ambre, et une description qui explique les phases finales |
> | **Au moment où on le coche** | Une **confirmation** s'ouvre : *« Vous choisissez un format comportant des phases finales… Vérifiez qu'elles correspondent bien au règlement applicable à votre événement. »* — **Annuler** / **Continuer avec Coupe + Plateau** |
> | **Si on annule** | **Rien n'est changé** : le format précédent est remis, bouton compris |
> | **Si on continue** | Le format est appliqué normalement, et le champ « qualifiés en Coupe » apparaît |
> | **Tant que la catégorie le retient** | Un **encart de rappel** reste affiché sur la fiche — l'information est là à chaque ouverture, pas seulement au moment du choix |
> | **Dans la demande d'autorisation FFR** | Le format sportif est rendu **« manquant »**, motif *« hors périmètre École de Rugby »*. ⚠️ **C'est délibéré et cela ne change pas** : ce formulaire-là est **spécifiquement** celui de l'École de Rugby, donc l'app n'y déclare jamais un format que ce cadre interdit |
>
> ✅ **Toute la mécanique décrite ci-dessous est ACTIVE** — génération, propagation, saisie,
> affichage public, podium. Rien n'a été retiré, ni mis en sommeil.

Les **X premiers de chaque poule** partent en **Coupe** : un **tableau à élimination directe**
jusqu'à une **finale** (un vainqueur du tournoi est désigné), avec une **petite finale** pour la
3ᵉ place. Toutes les **autres équipes** jouent un **Plateau** : des matchs supplémentaires **sans
élimination**, pour continuer à jouer.

- **Paramètre** : `nbQualifiesCoupe` = nombre d'équipes de **chaque poule** qui partent en Coupe
  (les autres vont automatiquement en Plateau). Stocké en JSON : `{"nbQualifiesCoupe":2}`.
- **Affichage public** : un **arbre d'élimination** (« Tableau Coupe ») + une **liste** de matchs
  (« Tableau Plateau »).

#### Combien de qualifiés → quels tours ?
Le nombre de qualifiés en Coupe = **(nombre de poules de la catégorie) × `nbQualifiesCoupe`**.
Le bracket crée **automatiquement** les bons tours :

| Qualifiés | Tours générés |
|-----------|---------------|
| 2 | Finale |
| 3–4 | Demi-finales → Finale (+ petite finale dès 4) |
| 5–8 | Quarts → Demies → Finale (+ petite finale) |
| 9–16 | 8èmes → Quarts → Demies → Finale (+ petite finale) |

Si le nombre n'est **pas** une puissance de 2 (3, 5, 6, 7, 12…), les **mieux classés sautent le
1ᵉʳ tour** (un « **bye** ») : par ex. 6 qualifiés → seuls les 4 moins bien classés jouent les
quarts, les 2 premiers filent en demies. Tu n'es donc **jamais obligé** d'avoir un nombre rond.

> ⚠️ Formats **non encore disponibles** (prévus plus tard) : « repoules » et « repêchage ».

---

## La propagation en Coupe (point clé)

En poules (matin) et en croisé/libre, un score ne fait que nourrir un **classement**. En **Coupe**,
un score validé déclenche des **actions automatiques** :

1. **Propagation du vainqueur** — dès qu'un score de Coupe est validé, l'équipe gagnante est
   **placée automatiquement** dans le match suivant (colonne `match_suivant` / `place_suivant`).
   Aucune étape manuelle : le match d'après voit tout de suite son affiche se compléter.
2. **Petite finale** — les **perdants des deux demi-finales** y sont placés automatiquement.
3. **Départage obligatoire** — en élimination directe, **le match nul n'existe pas**. En cas
   d'égalité au score, la saisie **demande au bénévole de désigner le vainqueur** (bouton radio),
   plutôt que d'appliquer une règle automatique fragile (essais marqués…) : plus simple et plus
   fiable sur le terrain avec des enfants.
4. **Match « en attente »** — un match de Coupe dont les deux équipes ne sont pas encore connues
   (les matchs précédents ne sont pas finis) apparaît **verrouillé** dans la saisie, avec le
   message « En attente… » : impossible de le saisir par erreur.
5. **Correction en cascade** — si on **corrige** un score déjà propagé **et** que le match suivant
   a lui-même déjà un score, le système **ne l'écrase pas silencieusement** : il **bloque** et
   demande une **confirmation explicite** (« Ce résultat a déjà été propagé vers la finale… ») avant
   d'appliquer la correction en chaîne (les résultats en aval devenus faux sont réinitialisés).

---

## Mode d'emploi

### Côté organisateur (Administration) — choisir le format
1. Dans la fiche d'une **catégorie**, sous les réglages habituels, une zone **« Format de
   l'après-midi »** propose **5 cartes** (Poules de niveau / Classement croisé / Classement croisé
   diagonal / Matchs libres / ⚠️ Coupe + Plateau), chacune avec une explication.
2. Si tu choisis **⚠️ Coupe + Plateau**, une **confirmation** s'ouvre avant que le choix soit
   appliqué : elle rappelle que ce format comporte des **phases finales**, non conformes au cadre
   École de Rugby, et invite à vérifier le règlement de ton événement. **Annuler** ne change rien ;
   **Continuer avec Coupe + Plateau** applique le choix.
3. Une fois Coupe + Plateau retenu, un champ **« Qualifiés en Coupe (par poule) »** apparaît :
   indique combien d'équipes de chaque poule partent en Coupe.
4. Un **récapitulatif** confirme le choix (« Après-midi : poules de niveau — … »).
5. Clique **Enregistrer** sur la catégorie. *(Les colonnes `format_apresmidi` / `param_format` de
   l'onglet Config sont créées automatiquement dès ce premier enregistrement.)*

Le jour J, une fois **tous les scores du matin saisis**, clique **« Générer l'après-midi »** comme
d'habitude : chaque catégorie est générée **selon son format**. Si les données du matin sont
incomplètes pour une catégorie (poules non terminées, pas assez de qualifiés…), un **message clair**
l'indique au lieu d'un plantage silencieux.

### Côté bénévole (Saisie) — saisir un match de Coupe
- Le titre du match indique l'enjeu : **« 🏆 Demi-finale — Coupe U12 »**, **« Finale — Coupe U12 »**,
  **« Plateau — U12 »**, **« Match amical »**…
- Un match **en attente** est verrouillé (rien à saisir tant que les précédents ne sont pas finis).
- Pour un match de Coupe, si les scores sont **égaux**, coche le **vainqueur** avant de valider
  (« En cas d'égalité, vainqueur : … »).
- Après validation, la liste se **rafraîchit** et le gagnant apparaît dans le match suivant.
- Pour **corriger** un résultat déjà propagé, suis l'avertissement de **cascade** (confirmation).

### Côté spectateur (page publique)
- **Poules de niveau** → tableaux par **poule haute / niveau k / poule basse** + classement général.
- **Croisé** *(classique ou diagonal)* → tableaux par niveau + classement général, comme avant.
- **Libre** → une liste de matchs amicaux (sans classement).
- **Coupe** → un **arbre** (une colonne par tour : 8èmes / quarts / demies / finale) + une
  **petite finale** ; le **gagnant** de chaque match est mis en avant.
- **Plateau** → une liste de matchs sous « 🛡️ Tableau Plateau ».

**Un podium 🥇🥈🥉** est affiché en haut de page dès qu'il est **décidé** — **sauf en Libre**
(volontairement, pour ne pas classer les plus jeunes) :
- **Poules de niveau** et **croisé** → top 3 du classement général (quand il est mathématiquement
  verrouillé) — c'est le **même calcul** pour les deux.
- **Coupe** → 🥇 vainqueur de la finale, 🥈 finaliste, 🥉 vainqueur de la petite finale.
- **Libre** → **pas de podium**.

---

## Où c'est stocké (rappel technique)

Voir [`structure-google-sheet.md`](structure-google-sheet.md) pour le détail des colonnes.

- **Config (par catégorie)** : `format_apresmidi` — **cinq valeurs, toutes proposées au choix** :
  `POULES_NIVEAU` / `CROISE` / `CROISE_DIAGONAL` / `LIBRE`, plus `COUPE_PLATEAU` *(qui demande une
  confirmation avant d'être appliqué)* ; **vide = CROISE** (défaut historique).
  Et `param_format` (JSON, ex. `{"nbQualifiesCoupe":2}` ; utile au seul Coupe + Plateau).
- **Matchs** : `format`, `sous_tableau` (`COUPE`/`PLATEAU`), `tour` (`FINALE`, `DEMI_FINALE`,
  `PETITE_FINALE`, `QUART_DE_FINALE`, `HUITIEME_DE_FINALE`…), `match_suivant` + `place_suivant`
  (où placer le vainqueur), `vainqueur` (équipe désignée en cas d'égalité).

Côté backend ([`../backend/Code.gs`](../backend/Code.gs)) : un **répartiteur** `genererApresMidi`
lit le format de chaque catégorie et appelle `fixturesApresMidiPoulesNiveau` / `…Croise` /
`…CroiseDiagonal` / `…Libre` / `…CoupePlateau` ; la propagation (Coupe uniquement) est gérée par
`propagerVainqueurBracket` (appelée directement depuis `enregistrerScore`). Le croisé diagonal
**et les poules de niveau** étiquettent leurs matchs par niveau (`N1`, `N2`…) exactement comme le
croisé, si bien que le calcul du classement général et du podium est **partagé, sans code
d'affichage dédié**. Les tranches des poules de niveau sont calculées par `taillesPoulesNiveau`,
à partir du classement de midi ordonné par `ordonnerClassementMidi`.
