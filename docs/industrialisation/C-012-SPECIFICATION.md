# C-012 — SPÉCIFICATION : séparer le cœur de la saisie du score de son écriture

> **Statut de ce document** : ✅ **SPÉCIFICATION VALIDÉE PAR ROMAIN le 2026-08-16.**
> Écrite le 2026-08-16, validée le jour même. **Les quatre décisions ouvertes sont tranchées** — voir
> **§11**.
> 🚧 **Mise à jour du 2026-08-16 — l'implémentation a commencé, et elle n'est pas finie** :
> **étape 1 fusionnée** *(PR #187, `litSaisieScore` + T-1 à T-5)* · **étape 2 fusionnée**
> *(PR #188, `cascadeAVerifier` + T-14)* · **étape 3 NON commencée**. Voir le **§10**.
> ⛔ **R-042 reste OUVERT**, et **rien n'a été vérifié chez Google** *(backend non redéployé)*.
>
> **Chantier** : `PLAN.md` → **C-012** · **Problème couvert** : **R-042** *(P1)* · **Explication du
> problème** : `AUDIT.md` **§D.3**
>
> **Problème découvert en chemin, NON corrigé** : ⚡ **R-092** *(le détail du score n'est effacé nulle
> part)* — inscrit au registre, **exclu de C-012** par **D-C012-2**.
>
> **Point de départ du code** : `main` au commit **`4af5003`** — `backend/Code.gs`,
> `enregistrerScore`, **lignes 5548 à 5658 (111 lignes)**.

---

## SOMMAIRE

1. [Objectif de C-012](#1--objectif-de-c-012)
2. [État actuel de `enregistrerScore`](#2--état-actuel-de-enregistrerscore)
3. [Frontière proposée entre cœur métier et I/O](#3--frontière-proposée-entre-cœur-métier-et-io)
4. [Contrat d'entrée du cœur](#4--contrat-dentrée-du-cœur)
5. [Contrat de sortie du cœur](#5--contrat-de-sortie-du-cœur)
6. [Traitement de la correction en cascade](#6--traitement-de-la-correction-en-cascade)
7. [Scénarios de tests](#7--scénarios-de-tests-automatisés)
8. [Scénarios de vérification manuelle](#8--scénarios-de-vérification-manuelle)
9. [Risques de non-régression](#9--risques-de-non-régression)
10. [Ordre proposé pour l'implémentation](#10--ordre-proposé-pour-limplémentation)
11. [**Décisions — ✅ TRANCHÉES le 2026-08-16**](#11--décisions--tranchées-le-2026-08-16)

---

## 1 — OBJECTIF DE C-012

### En une phrase

> **Séparer ce qui DÉCIDE de ce qui ÉCRIT**, pour que les décisions puissent être vérifiées
> automatiquement — sans Google Sheet, sans tournoi, sans attendre le jour J.

### L'image

Aujourd'hui, `enregistrerScore` fait deux métiers en même temps, mélangés dans la même pièce :

- **l'arbitre** : *ce score est-il recevable ? le match est-il verrouillé ? qui a gagné ? faut-il
  prévenir avant d'effacer la suite du tableau ?* ;
- **le greffier** : *j'écris dans le classeur, j'archive au journal de saison, je reporte le
  vainqueur au tour suivant.*

**Tant que l'arbitre et le greffier partagent le même bureau, on ne peut pas interroger l'arbitre
sans déranger le classeur.** C'est exactement pour cela que **les six garde-fous de la saisie ne
sont vérifiés par aucun test** — c'est le problème **R-042**.

### Ce que C-012 fait — et surtout ce qu'il ne fait pas

| | |
|---|---|
| ✅ **Ce qu'il fait** | Sortir les **décisions** dans des fonctions qui ne touchent à rien, et les **couvrir par des tests** |
| ✅ **Ce qu'il fait** | Laisser l'écriture dans le classeur exactement où elle est |
| ❌ **Ce qu'il NE fait PAS** | **Changer un seul comportement.** ⚠️ **C'est un déménagement, pas une réécriture** |
| ❌ **Ce qu'il NE fait PAS** | Ajouter une règle métier — pas de limite de score *(D-012)*, pas de forfait *(D-011)*, pas de match annulé *(D-015)*, pas de tournoi suspendu *(D-030)* |
| ❌ **Ce qu'il NE fait PAS** | Corriger les défauts trouvés en chemin *(ils sont **signalés** au §11, pas corrigés)* |

### Pourquoi maintenant, et pas plus tard

**Quatre décisions déjà prises rouvriront cette même fonction** : **D-011** *(forfait)*, **D-012**
*(limite de score)*, **D-015** *(match annulé)*, **D-030** *(tournoi suspendu)*.

- fait **une fois, avant** : un seul chantier ;
- fait **après** : **quatre fois le même déménagement**, avec quatre occasions de casser le geste le
  plus répété de la journée.

Et le filet est **déjà tendu** : **C-011** est livré et testé — `R92 — 616/616 OK, 0 FAIL` obtenu
chez Google. Le classement et le départage sont sous test **avant** qu'on touche à ce qui les
alimente.

---

## 2 — ÉTAT ACTUEL DE `enregistrerScore`

### 2.1 — Comment on y arrive

```
Bénévole (téléphone)
      │  clic sur « Valider »
      ▼
frontend/js/saisie.js:661     apiPostProtege('enregistrerScore', data, 'scores', …)
      │
      ▼
backend/Code.gs — doPost()
      ├─ contrôle de la CLÉ « scores »      (ACTIONS_SCORES, ligne 2797)
      ├─ 🔒 VERROU d'écriture, 20 s max     (ligne 2866)
      ├─ SpreadsheetApp.openById(…)         (ligne 2872)
      ├─────▶ enregistrerScore(classeur, requete)   ← LES 111 LIGNES  (ligne 2889)
      ├─ si pas d'erreur : apresEcriture(classeur)  → reconstruit l'instantané public
      └─ 🔓 verrou relâché, puis push CDN hors verrou
```

> 🧠 **À retenir** : tout ce qui se passe dans ces 111 lignes se déroule **pendant que le verrou est
> tenu** — c'est-à-dire pendant que **tous les autres marqueurs attendent**. C'est pourquoi chaque
> lecture supplémentaire du classeur compte *(voir R-067 : la reconstruction de l'instantané prend
> déjà 2,5 à 4,5 s)*.

### 2.2 — La carte des 111 lignes, bloc par bloc

**Légende** : 🧠 décision *(ne touche à rien)* · 📖 lecture du classeur · ✍️ écriture dans le
classeur · 📤 réponse

| Lignes | Ce que fait le bloc | Nature |
|---|---|---|
| 5549-5550 | Lit `id_match`, le nettoie, **refuse si vide** | 🧠 |
| 5552-5559 | Lit le **détail** du score des deux équipes *(`litDetailEquipe`, déjà pur et déjà testé)*. Une erreur de détail **refuse tout de suite** | 🧠 |
| 5561-5571 | **Deux modes, pilotés par la donnée** : si un champ de détail est présent → le score est **calculé** *(essai 5, transfo 2, pénalité 3, drop 3)* ; sinon → `score_A`/`score_B` saisis, validés en entiers ≥ 0 | 🧠 |
| 5573 | Ouvre l'onglet `Matchs` | 📖 |
| 5574 | `assurerColonnesMatchs` — **migration douce** : ajoute les en-têtes manquants | ✍️ *(en-tête)* |
| 5575 | `lireMatchParId` — **balaye tout l'onglet** pour retrouver la ligne du match | 📖 |
| 5576 | **Refuse si le match est introuvable** | 🧠 |
| 5577-5579 | Déduit `estCoupe` *(sous_tableau = COUPE)* et `dejaTermine` *(`estTermineServeur`, robuste au « é » décomposé)* | 🧠 |
| 5582-5585 | **① Garde-fou** — match de Coupe **en attente** *(une équipe pas encore connue)* → refus, drapeau `en_attente` | 🧠 |
| 5588-5591 | **② Garde-fou** — score **déjà validé** et `modification !== true` → refus, drapeau `deja_valide` | 🧠 |
| 5594-5607 | **③ Garde-fou** — en Coupe : égalité ⇒ **vainqueur obligatoire** *(drapeau `departage_requis`)*, et il doit être l'une des deux équipes. Sinon le vainqueur est **imposé par le score** | 🧠 |
| 5611-5618 | **④ Garde-fou** — **correction en cascade** : corriger un match de Coupe déjà propagé, dont le **match suivant a lui-même un score**, est bloqué sauf `forcerCascade`. ⚠️ **Ce bloc contient une lecture** *(ligne 5612 : le match suivant)* | 🧠 + 📖 |
| 5621-5622 | Écrit `score_A`, `score_B`, `statut = 'terminé'` — et le `vainqueur` **si Coupe** | ✍️ |
| 5625-5629 | **⑤** Écrit les **8 colonnes de détail** — ⚠️ **seulement en mode détail** | ✍️ |
| 5632-5637 | **⑥** `archiverResultat` — journal de saison. **Sous `try/catch` : ne bloque JAMAIS la saisie** | ✍️ + 📖 |
| 5643-5648 | **Propagation** en Coupe : met l'objet à jour **en mémoire** *(optimisation volontaire : une relecture de moins sous le verrou)* puis `propagerVainqueurBracket`. **Sous `try/catch` : ne bloque jamais** | ✍️ + 📖 |
| 5650-5657 | Construit la réponse : `{ ok, propagation, detail, match }` | 📤 |

### 2.3 — Ce que la fonction lit et écrit, en clair

| | Quoi |
|---|---|
| 📖 **Lit** | l'onglet **`Matchs`** *(deux balayages complets possibles : le match, puis le match suivant)* · l'onglet **`Equipes`** *(via `archiverResultat`, pour retrouver les **noms**)* · l'onglet **`Config`** *(via `assurerTournoiId`)* · les matchs de la Coupe de la catégorie *(via la propagation)* |
| ✍️ **Écrit** | l'onglet **`Matchs`** *(la ligne du match ; + le match suivant, + toute la chaîne aval en cas de réinitialisation ; + la petite finale)* · l'onglet **`Historique`** · l'onglet **`Config`** *(`tournoi_id`, seulement s'il manquait)* · l'**en-tête** de `Matchs` *(migration)* |
| 💥 **Effets de bord hors fonction** | à son retour, `doPost` **reconstruit l'instantané public** — la page des scores voit le résultat en ~10 s |

### 2.4 — Cinq comportements fins, faciles à casser sans le vouloir

> Ce sont ceux qui ne se voient pas à la lecture rapide. **Chacun doit survivre au déménagement à
> l'identique.**

1. **L'ORDRE des contrôles est chargé de sens.** Les scores sont validés **AVANT** que le match soit
   cherché. Conséquence : un score invalide sur un match inexistant répond *« Score A invalide »*,
   **pas** *« Match introuvable »*.

2. ⚠️ **Une fonctionnalité cachée en dépend : la vérification de la clé.**
   `frontend/js/api.js:177` vérifie la clé « scores » en envoyant **un vrai `enregistrerScore`**
   avec l'identifiant bidon `__verif_cle__` et des scores `0`. Le serveur doit répondre
   **« Match introuvable »** — une erreur qui **n'est pas** un refus de clé — **et n'écrire
   rien**. Si un jour ce chemin écrivait quoi que ce soit, ou renvoyait un message contenant
   « incorrecte », **la connexion à l'écran de saisie serait cassée**.
   *(→ test **T-13** et vérification manuelle **V-9**.)*

3. **La lecture du match suivant est PARESSEUSE.** Elle n'a lieu que dans le cas ④, très rare. La
   rendre systématique ajouterait **un balayage complet de l'onglet à chaque score saisi**, sous le
   verrou. **À préserver absolument.**

4. **`vainqueur` est lu depuis la requête même hors Coupe**, et **renvoyé** dans la réponse — mais
   **jamais écrit** si le match n'est pas de Coupe. *(En pratique le frontend ne l'envoie qu'en
   Coupe. Comportement à préserver tel quel.)*

5. **Deux blocs ne doivent jamais faire échouer la saisie** : l'archivage ⑥ et la propagation. Ils
   sont sous `try/catch` avec un simple `Logger.log`. **Le score est enregistré même si le journal
   de saison ou le tableau final échouent.** C'est délibéré, et c'est bien : le geste du bénévole
   passe avant tout le reste.

---

## 3 — FRONTIÈRE PROPOSÉE ENTRE CŒUR MÉTIER ET I/O

### 3.1 — Le principe

> **Le cœur ne voit jamais Google Sheets. Il reçoit des données ordinaires, et il rend un verdict.**

Ce n'est pas une invention : **le projet le fait déjà à 24 endroits**, avec une convention établie
*(« Cœur PUR et testable : ne lit AUCUN classeur »)* — par exemple `evaluerConformiteFFR`,
`planifierSuppressionClub`, `mesureMotifRefus`, `effectifsClubAjustes`. C'est aussi **exactement ce
que propose `AUDIT.md` §D.3** : *« une fonction qui reçoit (le match tel qu'il est, ce que le
bénévole a envoyé) et qui répond (accepté / refusé, et pourquoi) — sans toucher au classeur. »*

### 3.2 — Le découpage proposé : **deux cœurs, pas un**

```
          enregistrerScore(classeur, data)     ← reste le seul point d'entrée, même nom
                     │
   ┌─────────────────┴──────────────────────────────────────────────┐
   │                                                                │
   ▼  🧠 CŒUR 1                                                     │
 litSaisieScore(data)                                               │
   « ce que le bénévole a envoyé est-il lisible ? »                 │
   → refus, ou { id, score_A, score_B, modeDetail, detA, detB }     │
   │                                                                │
   ▼  📖 I/O                                                        │
 onglet Matchs · assurerColonnesMatchs · lireMatchParId             │
   │                                                                │
   ▼  🧠 CŒUR 2 — 1er appel, sans `suivant`                         │
 deciderEnregistrementScore(m, saisie, data)                        │
   « les six garde-fous », dans l'ordre ① ② ③ ④                     │
   ├─ un garde-fou refuse        → refus motivé  ⚡ AUCUNE lecture   │
   ├─ tout passe, pas de cascade → un PLAN d'écriture               │
   └─ il atteint ④ et lui manque le match suivant                   │
              → { besoin_suivant: <id> }                            │
   │                                                                │
   ▼  📖 I/O — la lecture, ET SEULEMENT ICI                         │
 lireMatchParId(match suivant)                                      │
   │                                                                │
   ▼  🧠 CŒUR 2 — 2e appel, avec `suivant`                          │
 deciderEnregistrementScore(m, saisie, data, suivant)               │
   → refus « cascade_requise », OU un PLAN d'écriture               │
   │                                                                │
   ▼  ✍️ I/O — applique le plan, sans rien décider                  │
 écriture ligne · détail · archivage · propagation                  │
   │                                                                │
   ▼  📤                                                            │
 la réponse, telle qu'elle est aujourd'hui  ◀──────────────────────┘
```

### 3.3 — Pourquoi **deux** cœurs et pas un seul

Parce qu'un seul cœur **changerait un comportement**, et c'est interdit ici.

Si le cœur recevait tout d'un coup, il faudrait **lire le match avant de l'appeler** — donc exécuter
`assurerColonnesMatchs` *(qui **écrit** l'en-tête)* **même quand le score est invalide**. Aujourd'hui
ce n'est pas le cas. C'est minuscule, c'est inoffensif — **et c'est quand même un changement de
comportement.** Le découpage en deux temps **rend ce changement impossible** : l'ordre du code reste
mot pour mot celui d'aujourd'hui.

### 3.4 — Le tableau de partage, ligne à ligne

| Bloc actuel | Va dans… | Pourquoi |
|---|---|---|
| 5549-5550 identifiant | **Cœur 1** | pure lecture de la requête |
| 5552-5571 scores / détail | **Cœur 1** | déjà pur *(s'appuie sur `litDetailEquipe`, testé)* |
| 5573-5575 ouverture, migration, recherche | **I/O** | ne décide rien |
| 5576 match introuvable | **Cœur 2** *(`m` vaut `null`)* | c'est un **verdict** |
| 5577-5579 `estCoupe`, `dejaTermine` | **Cœur 2** | déduction pure |
| 5582-5618 **garde-fous ① à ④** | **Cœur 2** | ⭐ **le cœur du chantier** |
| lecture du match suivant *(5612)* | **I/O**, déclenchée par la **demande explicite du cœur** *(`besoin_suivant`)* | une lecture reste une lecture — et elle reste chez celui qui a le droit de lire |
| 5621-5629 écritures | **I/O** | applique le plan |
| 5632-5637 archivage ⑥ | **I/O** *(le **contenu** archivé est décidé par le Cœur 2)* | écriture + `try/catch` |
| 5643-5648 propagation | **I/O — inchangée** *(voir §6 et **décision D-C012-1**)* | zone la plus délicate |
| 5650-5657 réponse | **Cœur 2** *(assemblage)* + I/O *(y greffe `propagation`)* | l'objet renvoyé est une décision |

### 3.5 — Ce qui reste **NON testé**, et il faut le dire

> **Règle de transparence (§9 du cadre)** — C-012 ne rend pas tout vérifiable :

- ❌ l'écriture réelle dans le classeur ;
- ❌ l'archivage au journal de saison ;
- ❌ **l'exécution** de la propagation et de la réinitialisation en cascade
  *(`propagerVainqueurBracket`, `invaliderMatchAval`, `majPetiteFinale`)* — **seule la DÉCISION de
  demander confirmation devient testée**, pas le fait que la chaîne aval soit correctement effacée ;
- ❌ le verrou, la clé, l'instantané public.

**Ces parties restent couvertes uniquement par la vérification manuelle du §8.**

---

## 4 — CONTRAT D'ENTRÉE DU CŒUR

### 4.1 — Cœur 1 : `litSaisieScore(data)`

**Reçoit** un seul objet, celui envoyé par le téléphone du bénévole. **Aucun classeur.**

| Champ | Type | Rôle | Obligatoire |
|---|---|---|---|
| `id_match` | texte | identifiant du match | **oui** *(vide ⇒ refus)* |
| `score_A`, `score_B` | texte ou nombre | mode **simple** | oui **si aucun champ de détail** |
| `essais_A/B`, `transfo_A/B`, `pen_A/B`, `drop_A/B` | texte ou nombre | mode **détail** | non — **leur simple présence bascule en mode détail** |

> ⚠️ **Règle capitale à préserver — « piloté par la donnée »** : ce n'est **pas** la catégorie ni un
> réglage qui choisit le mode, c'est **la présence d'au moins un champ de détail**. En mode détail,
> `score_A`/`score_B` sont **totalement ignorés**.

### 4.2 — Cœur 2 : `deciderEnregistrementScore(m, saisie, data, suivant)`

**Reçoit quatre choses, toutes ordinaires. Aucun classeur, aucune fonction Google.**

| Argument | Ce que c'est | Valeur particulière |
|---|---|---|
| `m` | **le match tel qu'il est aujourd'hui dans le classeur**, en objet simple *(`{ id_match, categorie, equipe_A, equipe_B, score_A, score_B, statut, sous_tableau, tour, match_suivant, place_suivant, vainqueur, … }`)* | **`null` = match introuvable** |
| `saisie` | la sortie **acceptée** du Cœur 1 | — |
| `data` | la requête brute, pour les **trois drapeaux d'intention** : `modification`, `forcerCascade`, `vainqueur` | — |
| `suivant` | **le match suivant**, même forme que `m` | ⚠️ **TROIS valeurs distinctes** — voir juste en dessous |

> ⚠️ **`suivant` a TROIS valeurs, et les confondre casserait la lecture paresseuse.** Ce n'est pas
> un détail d'écriture : c'est **ce qui permet au cœur de savoir s'il doit réclamer** *(§6.3)*.
>
> | Valeur | Sens | Ce que fait le cœur |
> |---|---|---|
> | `undefined` | **le match suivant n'a pas encore été lu** | il le **réclame** : `{ besoin_suivant }` |
> | `null` | **il a été lu, et il est introuvable** | il **ne bloque pas** — comme avant l'extraction |
> | un objet | il a été lu et trouvé | il **tranche** *(refus `cascade_requise`, ou le plan)* |
>
> ⛔ **`null` ne veut PAS dire « pas lu ».** Passer `null` au premier appel ferait croire au cœur que
> la lecture a eu lieu : il conclurait « rien à réinitialiser » et **le garde-fou ④ ne se
> déclencherait jamais**. C'est le seul point subtil du contrat — il est couvert par **T-15**.

**Ce que le cœur n'a PAS le droit de recevoir** : le classeur, un onglet, une fonction qui lit, une
date, une horloge. *(La date d'archivage et `tournoi_id` restent du ressort de l'I/O — ils ne
participent à aucune décision.)*

### 4.3 — Le prédicat du garde-fou ④ : `cascadeAVerifier(m, data)`

Une fonction pure, minuscule, qui répond à **une seule question** :

> *« La cascade doit-elle être vérifiée pour ce match ? »*

Vrai **seulement si** : match de Coupe **et** déjà terminé **et** `modification === true` **et**
`m.match_suivant` renseigné. **C'est la condition exacte de la ligne 5611 d'avant l'extraction** —
elle est simplement rendue nommable et testable *(T-14)*.

> 📌 **Elle est appelée PAR LE CŒUR, pas par la couche d'écriture.** C'est le cœur qui l'évalue, au
> garde-fou ④, **une fois ① ② ③ passés** — et c'est de là que naît la demande `besoin_suivant`. La
> couche d'écriture, elle, ne consulte aucun prédicat : elle **obéit** à la demande du cœur.
>
> ⚡ **C'est ce qui préserve la lecture paresseuse** *(§2.4-3)*. Si la couche d'écriture évaluait
> elle-même ce prédicat pour décider de lire **avant** d'appeler le cœur, elle paierait une lecture
> dans les cas où ① ② ③ refusent — ce qui **n'arrive pas aujourd'hui**. Le détail, mesuré, est en
> **§6.3**.

---

## 5 — CONTRAT DE SORTIE DU CŒUR

### 5.1 — Cœur 1

| Cas | Sortie |
|---|---|
| Refus | `{ error: '…' }` — **exactement les 4 messages actuels** : identifiant manquant · détail invalide *(A ou B)* · `Score A invalide (entier ≥ 0 attendu).` · `Score B invalide…` |
| Accepté | `{ id, score_A, score_B, modeDetail, detA, detB }` |

### 5.2 — Cœur 2 — **un refus, ou un plan**

#### a) Les cinq refus, avec leurs drapeaux — **au mot près**

Le frontend **se sert de ces drapeaux** pour piloter l'écran. Les changer casserait l'interface.

| # | Situation | Sortie exacte |
|---|---|---|
| — | match introuvable | `{ error: 'Match introuvable : ' + id }` |
| ① | Coupe en attente | `{ error: '…en attente : les deux équipes ne sont pas encore connues…', en_attente: true }` |
| ② | déjà validé | `{ error: '…déjà validé (définitif). Utilise « Corriger »…', deja_valide: true }` |
| ③ | égalité en Coupe **sans** vainqueur | `{ error: '…désigne le vainqueur du match.', departage_requis: true, equipe_A, equipe_B }` |
| ③ | vainqueur désigné **inconnu** | `{ error: 'Le vainqueur désigné ne correspond à aucune des deux équipes.' }` *(pas de drapeau)* |
| ④ | cascade | `{ error: '…déjà propagé vers <libellé>, qui a lui-même un score…', cascade_requise: true, match_suivant }` |

> 🔗 **Vérifié dans le frontend** : `saisie.js` teste `info.cascade_requise` pour ouvrir la
> confirmation, et `api.js` distingue un refus de clé d'une autre erreur. **Ces drapeaux sont un
> contrat, pas un détail.**

#### b) L'acceptation : **un plan d'écriture, pas une écriture**

Le cœur ne dit pas *« j'ai écrit »*, il dit *« voici ce qu'il faut écrire »* — comme
`planifierSuppressionClub` le fait déjà pour la poubelle des clubs.

```
{
  ok: true,
  estCoupe:  <vrai/faux>,
  ecriture:  { score_A, score_B, statut: 'terminé' },     // 3 colonnes, ligne du match
  vainqueur: <texte>,                    // écrit SEULEMENT si estCoupe
  detail:    <vrai/faux>,                // si vrai → les 8 compteurs, dans l'ordre exact
  compteurs: { essais_A, essais_B, transfo_A, transfo_B, pen_A, pen_B, drop_A, drop_B },
  archive:   { id_match, categorie, phase, equipe_A, equipe_B, score_A, score_B },
  matchApresEcriture: <l'objet m mis à jour>,  // ce que la propagation reçoit (§2.4-5)
  reponse:   { ok: true, detail, match: { id_match, score_A, score_B, statut, vainqueur, …détail } }
}
```

> ⚠️ **`propagation` n'est PAS dans le plan** : sa valeur n'est connue **qu'après** exécution.
> L'I/O la greffe sur `reponse` juste avant de répondre — **et vaut `null` si le match n'est pas de
> Coupe ou si la propagation a échoué**, exactement comme aujourd'hui.

### 5.3 — La règle d'or de ce contrat

> **L'octet près.** Pour une même entrée, la réponse renvoyée au téléphone du bénévole doit être
> **rigoureusement identique** à celle d'aujourd'hui — mêmes messages, mêmes drapeaux, mêmes champs,
> même `vainqueur: ''` hors Coupe *(§2.4-4)*.

---

## 6 — TRAITEMENT DE LA CORRECTION EN CASCADE

**C'est le point le plus délicat du chantier**, et celui qui a motivé la question posée à cette
session.

### 6.1 — Le problème, en langage simple

> Imagine le tableau final affiché au mur. Le vainqueur du quart de finale est déjà **écrit** dans
> la case de la demi-finale, et la demi-finale a **déjà été jouée**.
>
> Un bénévole revient sur le quart et corrige le score. **L'autre équipe gagne.** Toute la suite du
> tableau — la demi, la finale, la petite finale — **repose sur une équipe qui n'aurait pas dû être
> là**.
>
> L'application refuse alors, **et explique** : *« ce résultat a déjà été propagé vers la
> demi-finale, qui a elle-même un score. Modifier va réinitialiser la suite du tableau. »* Le
> bénévole confirme *(`forcerCascade`)*, ou renonce.

### 6.2 — La difficulté technique, dite simplement

**Pour prendre cette décision, il faut savoir si le match SUIVANT a un score.** Or cette information
est dans le classeur — et **le cœur n'a pas le droit d'y toucher**.

### 6.3 — La solution retenue : **le cœur réclame, l'I/O lit, le cœur tranche**

> 📌 **Ce paragraphe a été réaligné le 2026-08-17, après l'implémentation de l'étape 3.** Il
> décrivait un protocole qui ne tenait pas la promesse de lecture paresseuse — voir l'encadré
> « Pourquoi ce protocole, et pas le plus simple » plus bas. **Ce n'est pas une règle métier
> nouvelle** : c'est la conséquence d'extraire le cœur de décision **sans changer le comportement
> existant**.

**Le cœur ne va pas chercher le match suivant. Il dit quand il en a besoin.**

```
I/O :   deciderEnregistrementScore(m, saisie, data)          ← appelé avec ce qu'on a déjà
          │
Cœur :   ① Coupe en attente ?   → REFUS
          ② déjà validé ?        → REFUS
          ③ départage manquant ? → REFUS
          ④ cascade à vérifier ET match suivant pas encore lu ?
                  └─ → { besoin_suivant: <id> }        ⚡ AUCUNE lecture n'a eu lieu jusqu'ici
          │
I/O :   📖 lireMatchParId(match_suivant)   ← la lecture, ET SEULEMENT ICI
          │
I/O :   deciderEnregistrementScore(m, saisie, data, suivant)  ← mêmes m / saisie / data
          │
Cœur :   ① ② ③ réévalués à l'identique (fonction pure, mêmes entrées) puis
          ④ suivant terminé ET forcerCascade ≠ true → REFUS « cascade_requise »
          sinon → LE PLAN
```

**Quatre propriétés à retenir** :

1. ⚡ **la lecture reste paresseuse, et exactement comme avant** — **aucun `match_suivant` n'est lu
   lorsqu'un garde-fou antérieur suffit à refuser l'enregistrement** ;
2. 🧠 **le cœur reste pur** — il ne reçoit ni classeur, ni onglet, ni fonction qui lit ;
3. 🧪 **la décision devient testable** — il suffit de **fabriquer** un match suivant en mémoire ;
4. 🔁 **le second appel ne coûte rien et ne change rien** — le cœur est pur, donc ① ② ③ rendent le
   même verdict qu'au premier appel.

> ⚠️ **`suivant` a TROIS valeurs, et les confondre casserait la paresse** :
>
> | Valeur | Sens | Ce que fait le cœur |
> |---|---|---|
> | `undefined` | **pas encore lu** | il réclame : `{ besoin_suivant }` |
> | `null` | **lu, introuvable** | il **ne bloque pas** — comme avant l'extraction |
> | un objet | lu et trouvé | il tranche |
>
> C'est le seul point subtil du contrat. Il est **couvert par T-15**.

#### ⚠️ Pourquoi ce protocole, et pas le plus simple

La première rédaction de ce paragraphe prévoyait que **l'I/O lise le match suivant AVANT d'appeler
le cœur**, dès que `cascadeAVerifier` était vrai. C'était plus simple — et **c'était faux**.

**Mesuré avant d'écrire une ligne** *(maquette hors dépôt, harnais différentiel)* : ce protocole
ajoutait **une lecture complète de l'onglet `Matchs`, sous le verrou d'écriture**, dans un cas réel
et atteignable — **corriger un match de Coupe vers une égalité sans désigner de vainqueur**. Le
garde-fou ③ refuse, et **avant l'extraction ce refus ne payait aucune lecture**.

| | Protocole « on lit avant » | Protocole retenu |
|---|---|---|
| Cas `③ + cascade` | **1 lecture → 2** | **1 → 1** ✅ |
| Les 22 autres cas | identiques | identiques |
| Résultat renvoyé | identique | identique |

> 🎯 **Ce que ça illustre, et qui vaut au-delà de C-012** : la conception validée était bonne dans
> son principe *(un cœur pur, à qui l'on apporte les données)* et **fausse dans un détail que seule
> la mesure pouvait révéler**. La règle du chantier — *extraire sans changer le comportement* — a
> primé sur la lettre du document, et **le document a été corrigé pour dire ce que le code fait**.
> C'est `CLAUDE.md` **§8 bis** et **§8 ter** appliqués à une spécification.
>
> ⛔ **Ce n'est pas une nouvelle règle métier.** Aucune décision de la saisie ne change : mêmes
> refus, mêmes messages, mêmes drapeaux. Seul change **le moment où l'on paie une lecture** — et il
> ne change pas : il est **préservé**.

### 6.4 — Ce qui reste dehors, et pourquoi

**L'EXÉCUTION de la cascade ne bouge pas d'un pouce** : `propagerVainqueurBracket`,
`invaliderMatchAval` *(récursive)* et `majPetiteFinale` restent exactement telles quelles.

**Trois raisons** :

1. `PLAN.md` le dit : **déménagement, pas réécriture**. C-012 est déjà le chantier le plus risqué de
   la vague 1 après C-003 ;
2. la rendre pure supposerait de **changer sa façon de lire le classeur** *(tout charger d'un coup au
   lieu de lectures ciblées)* — ce serait un gain de vitesse **probable**, mais c'est **un autre
   chantier, avec son propre risque** ;
3. `propagerVainqueurBracket` **n'est appelée que par `enregistrerScore`** *(vérifié)* : rien
   d'autre ne dépend de ce choix, il pourra donc être repris plus tard **sans rien rouvrir**.

> ✅ **TRANCHÉ le 2026-08-16 — D-C012-1, option A** : ce choix est **la règle de C-012**, plus une
> proposition. **La limite est donc assumée** : la vérification manuelle **V-10** devient
> **obligatoire**, puisqu'elle est le seul filet sur cette partie.

---

## 7 — SCÉNARIOS DE TESTS AUTOMATISÉS

**Où** : `backend/Tests.gs`, harnais existant *(`lancerTestsFFR`, `_ffrAssert`)* — **616 tests
aujourd'hui**. **Aucun classeur requis** : tous les objets sont fabriqués à la main.

### 7.1 — Les 15 scénarios

| # | Scénario | Ce qu'il prouve | Garde-fou |
|---|---|---|---|
| **T-1** | identifiant vide | refus explicite | — |
| **T-2** | `score_A = 'abc'`, `-1`, `2.5`, `''` | **refus** — jamais un score fabriqué | — |
| **T-3** | mode simple `12 / 7` | scores repris **tels quels** | ⑤ |
| **T-4** | mode détail `3 essais + 2 transfo + 1 pén` | **25 points calculés**, `score_A` envoyé **ignoré** | ⑤ |
| **T-5** | détail sur **une seule équipe** | l'autre équipe = **0** — ✅ **comportement conservé, validé par D-C012-3.** Le test le **fige**, il ne le juge pas | ⑤ |
| **T-6** | match **introuvable** *(`m = null`)* | refus `Match introuvable`, **aucun plan d'écriture** | — |
| **T-7** | Coupe, `equipe_B` vide | refus + `en_attente: true` | ① |
| **T-8** | match terminé, `modification` absent / `false` | refus + `deja_valide: true` | ② |
| **T-9** | statut `'terminé'` en **é décomposé (NFD)** | ⚠️ le refus fonctionne quand même *(piège connu du Sheet)* | ② |
| **T-10** | Coupe, **égalité 10-10**, pas de vainqueur | refus + `departage_requis` + les 2 équipes | ③ |
| **T-11** | Coupe, égalité, vainqueur = **une équipe étrangère** | refus | ③ |
| **T-12** | Coupe **14-7** avec un `vainqueur` contradictoire envoyé | ⭐ **le score l'emporte** : vainqueur = équipe A | ③ |
| **T-13** | ⚠️ sonde `__verif_cle__`, scores `0/0`, `m = null` | refus **non-clé**, **aucune écriture** → *la connexion à l'écran de saisie tient* | §2.4-2 |
| **T-14** | `cascadeAVerifier` : les **4 conditions**, une à une | la lecture reste **paresseuse** | ④ |
| **T-15** | cascade : `suivant` terminé sans `forcerCascade` → **refus** · avec → **accepté** · `suivant = null` → **accepté** · `suivant` non terminé → **accepté** | ④ | ④ |

### 7.2 — Deux tests de forme, qui protègent la règle elle-même

| # | Scénario | Pourquoi |
|---|---|---|
| **T-16** | **hors Coupe**, un `vainqueur` est envoyé | il est **renvoyé** dans la réponse mais **absent du plan d'écriture** *(§2.4-4)* |
| **T-17** | un plan accepté ne contient **jamais** `essais_*` en mode simple | ⚠️ **c'est la migration douce** : en mode simple on **ne touche pas** aux 8 colonnes |

> **Total : 17 tests** — ✅ **validés par Romain le 2026-08-16 (D-C012-4)**, et **contractuels** : ils
> sont le filet de non-régression de C-012, pas une liste indicative.
>
> La fiche `PLAN.md` en annonçait 8. **L'écart s'explique** : la fiche comptait « un test par
> garde-fou » ; l'examen du code réel a fait apparaître le piège NFD *(T-9)*, la sonde de clé
> *(T-13)*, la paresse de la lecture *(T-14)* et les deux tests de forme. **Le compteur attendu
> passerait de 616 à ~633** — le chiffre exact sera annoncé avant écriture, puis **vérifié chez
> Google**.

---

## 8 — SCÉNARIOS DE VÉRIFICATION MANUELLE

> **Pourquoi cette liste existe** : un test vérifie une **décision**. Il ne prouve **rien** sur
> l'écriture réelle dans Google Sheets, ni sur ce que voit le bénévole. Et **§13.6 du cadre** le
> rappelle : le backend s'exécute **chez Google** — une affirmation sur la production reste
> **INCONNUE** tant qu'elle n'a pas été vérifiée en vrai.

**Condition préalable** : `Code.gs` **redéployé** chez Google, `lancerTestsFFR` exécuté et vert.

| # | À faire | Ce qu'on doit voir |
|---|---|---|
| **V-1** | Saisir un score de poule ordinaire *(ex. 12-7)*, valider | ✅ écrit, carte verrouillée, **classement mis à jour**, page publique à jour en ~10 s |
| **V-2** | Recliquer « Valider » sur ce même match | ✅ refus *« déjà validé »* + la clé est redemandée par « Corriger » |
| **V-3** | Corriger le score *(clé scores)* et valider | ✅ nouveau score écrit, classement recalculé |
| **V-4** | Catégorie **U14 en tir au but** : saisir un score **détaillé** | ✅ total en points juste, **8 compteurs écrits** dans le Sheet |
| **V-5** | Vérifier l'**alerte des 5 essais d'écart** | ✅ comportement identique à avant |
| **V-6** | Ouvrir l'onglet **`Historique`** | ✅ une ligne par match, **une correction met à jour la MÊME ligne** |
| **V-7** | **Coupe** : saisir une **égalité** en demi-finale | ✅ l'application **exige** un vainqueur |
| **V-8** | **Coupe** : le vainqueur apparaît **tout de suite** dans le match suivant · les **perdants** des 2 demies alimentent la **petite finale** | ✅ propagation intacte |
| **V-9** | ⚠️ **Se déconnecter, rouvrir la page de saisie, entrer la clé** | ✅ **la clé est acceptée** *(c'est la sonde `__verif_cle__` — §2.4-2)* · et **aucune ligne parasite** n'apparaît dans `Matchs` |
| **V-10** | ⭐ **Cascade** : corriger un quart déjà propagé vers une demi **jouée** | ✅ l'avertissement s'affiche · « Annuler » ne change **rien** · « Modifier quand même » **réinitialise la suite du tableau** |
| **V-11** | Sheet **sans** les colonnes de détail *(migration douce)* | ✅ les colonnes sont ajoutées, la saisie simple fonctionne |
| **V-12** | Chronométrer une validation *(onglet « Exécutions »)* | ✅ **pas plus lente qu'avant** *(rappel : plancher ~1,6 s)* |

> 🔴 **V-10 est le scénario à ne jamais sauter** : c'est le seul qui exerce la partie **non couverte
> par les tests** *(§3.5)*.

---

## 9 — RISQUES DE NON-RÉGRESSION

### 9.1 — Ce qui doit être vérifié après la modification *(cadre §8)*

| Fonctionnalité | Concernée ? |
|---|---|
| Calcul des scores | 🔴 **directement** |
| Classement | 🔴 **indirectement** *(il se nourrit des scores)* |
| Affichage public | 🔴 **indirectement** *(instantané reconstruit après écriture)* |
| Génération des matchs | 🟢 non touchée |
| Gestion des équipes | 🟠 lue seulement *(noms, pour l'archivage)* |
| Création / modification du tournoi | 🟢 non touchée |
| Administration | 🟢 non touchée |
| Google Apps Script | 🔴 **redéploiement obligatoire** |

### 9.2 — Les six risques, et la parade de chacun

| # | Risque | Gravité | Parade |
|---|---|---|---|
| **N-1** | **Un message d'erreur ou un drapeau change** *(une virgule, un accent)* → l'écran de saisie ne réagit plus | 🔴 **élevé** | Les 6 messages et les 5 drapeaux sont **recopiés à l'identique** (§5.2) ; **T-7 à T-15** les vérifient ; **V-2, V-7, V-10** les voient en vrai |
| **N-2** | **L'ordre des contrôles change** → la sonde de clé casse, ou la migration s'exécute trop tôt | 🔴 **élevé** | **Deux cœurs** au lieu d'un (§3.3) ; **T-13** ; **V-9** |
| **N-3** | **La lecture du match suivant devient systématique** → chaque saisie ralentit, sous le verrou | 🟠 moyen | `cascadeAVerifier` (§4.3) ; **T-14** ; **V-12** |
| **N-4** | **Les 8 colonnes de détail sont écrites en mode simple** *(ou l'inverse)* → migration douce cassée, détail écrasé | 🟠 moyen | **T-17** ; **V-4** et **V-11** |
| **N-5** | **L'archivage ou la propagation redevient bloquant** → un journal en erreur **empêcherait d'enregistrer un score** le jour J | 🔴 **élevé** | Les deux `try/catch` sont **transportés tels quels** ; **V-6**, **V-8** |
| **N-6** | **L'objet passé à la propagation n'est plus à jour** *(l'optimisation « en mémoire », §2.4-5)* → **le mauvais vainqueur propagé** | 🔴 **élevé** | `matchApresEcriture` est **explicitement dans le plan** (§5.2b) ; **V-8** et **V-10** |

### 9.3 — La preuve à produire, et elle est exigeante

> ⭐ **La preuve « zéro comportement changé » réutilisable, établie par C-008** : ne pas se contenter
> de relire le diff.

Pour C-012, cette preuve prend **trois formes cumulatives** :

1. **`lancerTestsFFR` chez Google** : **616 tests d'avant TOUS encore verts**, plus les nouveaux.
   *(Un seul test antérieur qui tombe = le déménagement a changé quelque chose.)* ;
2. **la liste des 12 vérifications manuelles du §8, cochée une par une**, en vrai ;
3. ⚠️ **ce qui n'est PAS vérifiable est écrit comme tel — `NON VÉRIFIÉ`** — sans exception.

---

## 10 — ORDRE PROPOSÉ POUR L'IMPLÉMENTATION

> **Principe** : **les tests d'abord, le déménagement ensuite.** Écrire un test contre le code
> **actuel** est la seule façon de prouver plus tard qu'on ne l'a pas changé. Un test écrit **après**
> ne prouve que la conformité au nouveau code.

| Étape | Ce qu'on fait | Commit | Prouvé par |
|---|---|---|---|
| **0** | ✅ **FAIT le 2026-08-16** — ce document est **validé par Romain**, les 4 décisions sont tranchées *(§11)* | *(le présent document)* | — |
| **0 bis** | ✅ **Autorisation d'implémenter donnée le 2026-08-16 — étape par étape.** Chaque étape a reçu son autorisation séparément ; **l'étape 3 n'a pas encore la sienne** | — | — |
| **1** | ✅ **FAIT — PR #187 fusionnée le 2026-08-16.** **Cœur 1** `litSaisieScore` extrait · `enregistrerScore` l'appelle · **T-1 à T-5** | `refactor(scores): C-012 étape 1 — extraire litSaisieScore, et T-1 à T-5 (R-042)` | **616 + 33 = 649** verts |
| **2** | ✅ **FAIT — PR #188 fusionnée le 2026-08-16.** **`cascadeAVerifier`** extrait · **T-14** | `refactor(scores): C-012 étape 2 — extraire cascadeAVerifier et ajouter T-14` | **649 + 12 = 661** verts |
| **3** | ⏳ **NON COMMENCÉE, NON AUTORISÉE.** ⭐ **Cœur 2** `deciderEnregistrementScore` — les 6 garde-fous · **T-6 à T-13, T-15 à T-17** | `refactor(scores): séparer les décisions de l'écriture (R-042)` | à mesurer |
| **4** | ⏳ **À FAIRE** — **redéploiement chez Google** + `lancerTestsFFR` exécuté | *(pas de commit)* | le total du moment, **chez Google** |
| **5** | ⏳ **À FAIRE** — **les 12 vérifications manuelles** du §8, avec **V-10 obligatoire** | `docs(industrialisation): C-012 livré` | la liste cochée |

> ⚠️ **Le compte annoncé au §7 était faux, et il faut le dire.** Ce document estimait *« 616 + 5 »*
> pour l'étape 1 et *« ~633 »* pour l'ensemble : il **comptait les fonctions de test**, alors que le
> harnais compte les **vérifications**. Le réel est **616 + 33 + 12 = 661** après deux étapes, et le
> total final de C-012 sera donc **nettement supérieur à 633**. **Il ne sera connu qu'après l'étape
> 3** — il n'est pas ré-estimé ici, il sera **mesuré**.
>
> ⛔ **R-042 reste OUVERT.** Les six garde-fous de la saisie ne sont **toujours pas sous test** :
> c'est l'objet de l'étape 3. Les étapes 1 et 2 ont sorti la **lecture de la saisie** et la
> **condition de la cascade**, pas les décisions elles-mêmes.
>
> ⛔ **Rien n'a été vérifié chez Google.** `661/661` vient d'une exécution **hors d'Apps Script**,
> sur les fichiers réels du dépôt. **Le backend n'est pas redéployé** *(étape 4)*.

**Trois règles pour ces étapes** :

- **une étape = une PR = un lot** *(règle du dépôt : ne jamais repousser sur une branche de PR déjà
  annoncée)* ;
- **après chaque étape, l'application doit fonctionner** — aucune étape ne laisse le code à moitié
  déménagé ;
- **si une étape révèle un défaut**, on **s'arrête et on le signale** *(règle de Romain)* — on ne le
  corrige pas dans le même lot.

---

## 11 — DÉCISIONS — ✅ TRANCHÉES le 2026-08-16

> Les quatre points ouverts ont été soumis à Romain et **tranchés le 2026-08-16**.
> **Ce ne sont plus des questions : ce sont les règles de C-012.**

| # | Sujet | Décision |
|---|---|---|
| **D-C012-1** | Périmètre du cœur | ✅ **OPTION A** — la propagation reste **hors** du cœur |
| **D-C012-2** | Détail du score jamais effacé | ✅ **Problème distinct — inscrit R-092, NON corrigé** |
| **D-C012-3** | Détail partiel ⇒ l'autre côté à zéro | ✅ **Comportement actuel conservé** |
| **D-C012-4** | Nombre de tests | ✅ **17 tests validés** |

---

### ✅ D-C012-1 — Périmètre du cœur : **OPTION A**

**Décision de Romain** :

> *« La propagation dans le tableau final reste hors du cœur testable pour C-012. C-012 doit isoler
> les décisions métier nécessaires à la validation du score, mais ne doit pas transformer la
> mécanique du bracket en nouveau moteur métier. »*

**Ce que ça fixe, concrètement** :

- ✅ `propagerVainqueurBracket`, `invaliderMatchAval`, `majPetiteFinale` **ne sont pas touchées** —
  pas d'une ligne ;
- ✅ le **garde-fou ④** *(la décision de demander confirmation)* entre bien dans le cœur, via le
  match suivant **apporté** au cœur (§6.3) ;
- ⛔ **l'option B est écartée pour C-012.** Elle reste techniquement ouverte pour plus tard :
  `propagerVainqueurBracket` **n'est appelée que par `enregistrerScore`** *(vérifié dans tout le
  dépôt)*, donc y revenir un jour ne rouvrira rien d'autre.

> ⚠️ **Le prix de cette décision, redit franchement** : après C-012, **l'exécution** de la cascade
> restera **non testée**. La vérification manuelle **V-10** est alors le **seul** filet sur la partie
> la plus dangereuse du tableau final. **Elle devient obligatoire, pas recommandée.**

---

### ✅ D-C012-2 — Le détail du score jamais effacé : **problème distinct, NON corrigé**

**Décision de Romain** :

> *« Le comportement constaté est à signaler comme problème distinct. NE LE CORRIGE PAS dans C-012.
> Inscris-le dans le registre de risques avec les preuves actuellement disponibles ; donne-lui un
> statut indiquant clairement qu'il est découvert mais non corrigé ; ne modifie aucun code pour ce
> problème. Si le registre ne permet pas de lui attribuer proprement une priorité sans analyse
> supplémentaire, indique-le au lieu d'inventer. »*

**Ce qui a été fait, et rien de plus** :

| | |
|---|---|
| ✅ **Inscrit au registre** | **R-092**, dans `RISQUES.md`, avec les **trois preuves** *(lignes 5625, 5816, 5800)* et ses **deux consommateurs** *(`blocSaisieDetail` `saisie.js:465` et `essaisConnusEquipe` `Code.gs:1453`)* |
| ✅ **Statut sans ambiguïté** | 🔴 **IDENTIFIÉ — NON CORRIGÉ**, et **explicitement hors de C-012** |
| ✅ **Aucun code modifié** | pas une ligne, ni pour le constater, ni pour le contourner |
| ⚠️ **Priorité NON tranchée** | **elle n'a pas été inventée** — voir juste en dessous |

#### ⚠️ Pourquoi la priorité reste ouverte

**Elle ne peut pas être établie depuis le dépôt.** Le scénario grave — un match de Coupe réinitialisé
qui **rouvre pré-rempli avec les compteurs de l'ancien match** — suppose une catégorie **à la fois**
en mode détaillé *(tir au but)* **et** placée dans un **tableau de Coupe**. Or le mode détaillé
dépend de la colonne `RefFFR_Regles.tir_au_but`, qui vit **dans le classeur Google, pas dans le
dépôt** *(cadre §13.6)*.

| Si cette combinaison est **impossible** | Si elle est **possible** |
|---|---|
| **P2** — des chiffres morts dans le classeur et une **alerte informative** faussée. Rien de sportif n'est touché : le classement lit `score_A`/`score_B`, qui sont bien écrasés | **P1, à instruire** — un bénévole pourrait **valider un score pré-rempli qui n'est plus le sien** |

➡️ **Une seule vérification suffit à trancher** : une catégorie ayant `tir_au_but = OUI` peut-elle
recevoir le format d'après-midi **COUPE_PLATEAU** ? **Tant que la réponse n'est pas donnée, R-092
reste « À CONFIRMER ».**

> 🔁 **Et C-012 dans tout ça ?** Il **reproduit ce comportement à l'identique**. C'est cohérent, pas
> contradictoire : **un déménagement ne corrige pas.** Corriger R-092 en même temps rendrait
> impossible de prouver que rien n'a changé — c'est exactement ce que la règle de C-008 nous a
> appris.

---

### ✅ D-C012-3 — Détail partiel : **comportement actuel conservé**

**Décision de Romain** :

> *« Je valide la conservation du comportement actuel. C-012 ne change aucune règle : si un seul côté
> possède des détails, le comportement actuel est conservé. Ne transforme pas cela en nouvelle
> validation métier. »*

**Ce que ça fixe** :

- ✅ un détail présent d'un seul côté ⇒ **l'autre équipe vaut 0** *(lignes 5562-5565)*, **inchangé** ;
- ⛔ **aucun refus n'est ajouté** — pas de « détail incomplet », pas de nouveau message d'erreur ;
- ✅ le comportement est **mis sous test** *(T-5)* — non pour le juger, mais pour **le figer** : à
  partir de là, personne ne pourra le changer sans le voir.

> 🧠 **La nuance qui compte** : mettre un comportement sous test, ce n'est pas l'approuver. C'est
> **empêcher qu'il change par accident.**

---

### ✅ D-C012-4 — **17 tests validés**

**Décision de Romain** :

> *« Je valide les 17 tests proposés. Ils doivent être conservés dans la spécification comme filet de
> non-régression prévu pour C-012. »*

**Ce que ça fixe** :

- ✅ les **17 scénarios du §7** sont le **filet de non-régression contractuel** de C-012 — ils ne
  sont pas indicatifs ;
- ✅ **`PLAN.md` annonçait 8** ; le chiffre de référence devient **17**, et le compteur du harnais
  passerait de **616 à ~633** *(le nombre exact sera annoncé avant écriture, et vérifié chez
  Google)* ;
- ✅ les cinq tests qui n'étaient pas prévus sont **conservés**, y compris les deux que je jugeais
  indispensables : **T-13** *(protège la connexion à l'écran de saisie)* et **T-9** *(protège du
  piège d'encodage qui a déjà mordu ce projet)*.

---

### 📌 Deux constats, sans décision requise

- **Le `vainqueur` hors Coupe** *(§2.4-4)* : lu et renvoyé, jamais écrit. Sans conséquence — le
  frontend ne l'envoie pas. **Préservé tel quel.**
- **Le garde-fou ④ ne regarde qu'UN match en aval**, alors que la réinitialisation, elle, **descend
  toute la chaîne**. Léger déséquilibre, sans effet connu *(pour que le 3ᵉ match soit joué, le 2ᵉ
  doit l'être aussi)*. **Préservé tel quel.**

---

## ⛔ CE QUE CETTE SPÉCIFICATION NE PROUVE PAS

*(Règle de transparence — §9 du cadre)*

- **CERTAIN** : tout ce qui est décrit au §2 a été **lu ligne à ligne** dans `backend/Code.gs` sur
  `main` au commit `4af5003`, et les appelants ont été recensés dans le dépôt entier ;
- **PROBABLE** : que le découpage proposé soit réalisable **sans changer un comportement**. C'est
  une **conception**, pas une réalisation. **Seule l'implémentation le dira** ;
- **INCONNU** : le comportement **en production**. Le backend s'exécute **chez Google** *(cadre
  §13.6)* — et rien ne garantit que la version en service soit identique à celle du dépôt. **Aucune
  affirmation de ce document ne vaut pour la production tant qu'elle n'a pas été vérifiée en vrai.**
