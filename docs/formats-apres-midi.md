# Formats d'après-midi (par catégorie)

Depuis cette évolution, **chaque catégorie choisit son propre format d'après-midi** — dans le
même tournoi, les M8 peuvent jouer en « Matchs libres » pendant que les M12 jouent en
« Coupe + Plateau ». Le choix se fait **au paramétrage** (page Administration), avant le jour J,
pour pouvoir l'expliquer aux équipes à l'avance.

> 🧭 Le **matin** ne change pas : il reste une phase de **poules** (round-robin) pour toutes les
> catégories. Seul l'**après-midi** devient configurable.

---

## Les 3 formats disponibles

### 1. Classement croisé (`CROISE`) — *format historique, par défaut*
Les équipes sont **reclassées par niveau** après les poules du matin (tous les 1ᵉʳˢ de poule
ensemble = Niveau 1, tous les 2ᵉˢ = Niveau 2, etc.), puis chaque niveau joue en **round-robin**.
Un **classement général** et un **podium** sont désignés : le **vainqueur du Niveau 1** (le groupe
des premiers de poule) **remporte le tournoi**. C'est le comportement décrit dans
[`phases-tournoi.md`](phases-tournoi.md).

- **Paramètre** : aucun.
- **Affichage public** : tableaux par niveau **+ classement général (vainqueur en tête) + podium**.
  Le podium 🥇🥈🥉 s'affiche dès qu'il est **mathématiquement certain** ; avant, le classement
  général montre l'équipe **en tête** (provisoire).

### 2. Matchs libres (`LIBRE`)
Des **matchs amicaux tournants**, **sans classement ni qualification** — juste du temps de jeu.
On génère un round-robin (chacun rencontre chacun une fois) sur toutes les équipes de la catégorie.
Recommandé pour les plus jeunes (M6–M8), où l'enjeu n'a pas d'intérêt.

- **Paramètre** : aucun.
- **Affichage public** : simple liste de matchs, avec la mention « sans classement ».
- **Saisie** : un bandeau « 🎈 Match amical — sans classement » rappelle au bénévole que rien ne
  bouge dans un classement après validation (c'est normal).

### 3. Coupe + Plateau (`COUPE_PLATEAU`)
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
   l'après-midi »** propose **3 cartes** (Classement croisé / Matchs libres / Coupe + Plateau),
   chacune avec une explication.
2. Si tu choisis **Coupe + Plateau**, un champ **« Qualifiés en Coupe (par poule) »** apparaît :
   indique combien d'équipes de chaque poule partent en Coupe.
3. Un **récapitulatif** confirme le choix (« Après-midi : Coupe + Plateau — … »).
4. Clique **Enregistrer** sur la catégorie. *(Les colonnes `format_apresmidi` / `param_format` de
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
- **Coupe** → un **arbre** (une colonne par tour : 8èmes / quarts / demies / finale) + une **petite
  finale** ; le **gagnant** de chaque match est mis en avant.
- **Plateau** → une liste de matchs sous « 🛡️ Tableau Plateau ».
- **Libre** → une liste de matchs amicaux (sans classement).
- **Croisé** → tableaux par niveau + podium, comme avant.

---

## Où c'est stocké (rappel technique)

Voir [`structure-google-sheet.md`](structure-google-sheet.md) pour le détail des colonnes.

- **Config (par catégorie)** : `format_apresmidi` (`CROISE`/`LIBRE`/`COUPE_PLATEAU`, vide = CROISE) et
  `param_format` (JSON, ex. `{"nbQualifiesCoupe":2}`).
- **Matchs** : `format`, `sous_tableau` (`COUPE`/`PLATEAU`), `tour` (`FINALE`, `DEMI_FINALE`,
  `PETITE_FINALE`, `QUART_DE_FINALE`, `HUITIEME_DE_FINALE`…), `match_suivant` + `place_suivant`
  (où placer le vainqueur), `vainqueur` (équipe désignée en cas d'égalité).

Côté backend ([`../backend/Code.gs`](../backend/Code.gs)) : un **répartiteur** `genererApresMidi`
lit le format de chaque catégorie et appelle `fixturesApresMidiCroise` / `…Libre` /
`…CoupePlateau` ; la propagation est gérée par `propagerVainqueurBracket` (appelée directement
depuis `enregistrerScore`).
