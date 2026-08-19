# C-012 — SPÉCIFICATION : séparer le cœur de la saisie du score de son écriture

> **Statut de ce document** : ✅ **SPÉCIFICATION VALIDÉE PAR ROMAIN le 2026-08-16.**
> Écrite le 2026-08-16, validée le jour même. **Les quatre décisions ouvertes sont tranchées** — voir
> **§11**.
> 🚧 **Mise à jour du 2026-08-17 — les TROIS étapes de code sont fusionnées, le chantier n'est pas
> fini pour autant** : **étape 1** *(PR #187, `litSaisieScore` + T-1 à T-5)* · **étape 2**
> *(PR #188, `cascadeAVerifier` + T-14)* · **étape 3** *(PR #189, `deciderEnregistrementScore` +
> T-6 à T-13 et T-15 à T-17)*. Suite : **`R92 — 703/703 OK, 0 FAIL`**. Voir le **§10**.
> ✅ **Mise à jour du 2026-08-18 — l'ÉTAPE 4 est TERMINÉE** *(autorisée par Romain, puis exécutée le
> jour même)* : le backend est **redéployé chez Google** *(`Code.gs` **et** `Tests.gs`)*, une
> **nouvelle version du MÊME déploiement** est publiée, et `lancerTestsFFR` y donne
> **`R92 — 703/703 OK, 0 FAIL`**. Les preuves complètes sont au **§10**.
> 🏁 **Mise à jour du 2026-08-19 — l'ÉTAPE 5 est CLOSE : 11 vérifications sur 12, et C-012 est
> TERMINÉ.** ✅ **V-1 à V-11 RÉUSSIES** *(V-11 avec réserve)*, dont ⭐ **V-7, V-8 et V-10, exécutées
> ce jour** · 🟠 **V-12 NON CONCLUANTE**. Résultats et preuves : **§8 bis**, **§8 ter** et **§8 quater**.
> ⭐ **R-042 est passé à `TESTÉ`** *(décision de Romain, 2026-08-19)*, **avec une réserve
> explicitement conservée : V-12 / N-3 demeure non concluante**, sous le critère de substitution
> **D-C012-5** déjà accepté.
> ⚡ **V-4 a révélé un défaut ANTÉRIEUR à C-012** — l'écriture des colonnes par position alors que la
> lecture se fait par nom : inscrit au registre sous **R-093** *(P2, NON CORRIGÉ)*. **Aucune
> régression C-012.**
> ✅ **Routage rétabli sur la PRODUCTION et vérifié** *(4 tests concordants)* · ✅ **production
> NON CONTAMINÉE**.
> ⚠️ **Aucune ligne de code, aucun test et aucun déploiement n'ont été touchés par l'étape 5.**
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

| # | À faire | Ce qu'on doit voir | **Résultat — 2026-08-18** |
|---|---|---|---|
| **V-1** | Saisir un score de poule ordinaire *(ex. 12-7)*, valider | ✅ écrit, carte verrouillée, **classement mis à jour**, page publique à jour en ~10 s | ✅ **RÉUSSIE** |
| **V-2** | Recliquer « Valider » sur ce même match | ✅ refus *« déjà validé »* + la clé est redemandée par « Corriger » | ✅ **RÉUSSIE** |
| **V-3** | Corriger le score *(clé scores)* et valider | ✅ nouveau score écrit, classement recalculé | ✅ **RÉUSSIE** |
| **V-4** | Catégorie **U14 en tir au but** : saisir un score **détaillé** | ✅ total en points juste, **8 compteurs écrits** dans le Sheet | ✅ **RÉUSSIE** *(2ᵉ tentative — voir §8 ter)* |
| **V-5** | Vérifier l'**alerte des 5 essais d'écart** | ✅ comportement identique à avant | ✅ **RÉUSSIE** |
| **V-6** | Ouvrir l'onglet **`Historique`** | ✅ une ligne par match, **une correction met à jour la MÊME ligne** | ✅ **RÉUSSIE** |
| **V-7** | **Coupe** : saisir une **égalité** en demi-finale | ✅ l'application **exige** un vainqueur | ✅ **RÉUSSIE** *(2026-08-19 — §8 quater)* |
| **V-8** | **Coupe** : le vainqueur apparaît **tout de suite** dans le match suivant · les **perdants** des 2 demies alimentent la **petite finale** | ✅ propagation intacte | ✅ **RÉUSSIE** *(les deux volets — §8 quater)* |
| **V-9** | ⚠️ **Se déconnecter, rouvrir la page de saisie, entrer la clé** | ✅ **la clé est acceptée** *(c'est la sonde `__verif_cle__` — §2.4-2)* · et **aucune ligne parasite** n'apparaît dans `Matchs` | ✅ **RÉUSSIE** |
| **V-10** | ⭐ **Cascade** : corriger un quart déjà propagé vers une demi **jouée** | ✅ l'avertissement s'affiche · « Annuler » ne change **rien** · « Modifier quand même » **réinitialise la suite du tableau** | ✅ ⭐ **RÉUSSIE — les DEUX branches** *(§8 quater)* |
| **V-11** | Sheet **sans** les colonnes de détail *(migration douce)* | ✅ les colonnes sont ajoutées, la saisie simple fonctionne | ✅ **RÉUSSIE — avec réserve** *(voir §8 bis et **R-093**)* |
| **V-12** | Chronométrer une validation *(onglet « Exécutions »)* | ✅ **pas plus lente qu'avant** *(rappel : plancher ~1,6 s)* | 🟠 **NON CONCLUANTE** *(voir l'encadré ci-dessous)* |

> 🔴 **V-10 était le scénario à ne jamais sauter** : c'est le seul qui exerce la partie **non
> couverte par les tests** *(§3.5)*. ✅ **Elle a été exécutée le 2026-08-19 — voir §8 quater.**

### 8 bis — RÉSULTATS DE L'ÉTAPE 5 *(exécutée le 2026-08-18)*

⚡ **Mise à jour du 2026-08-18 (soir) : 9 vérifications sur 12** — 8 réussies, 1 non concluante.
*(Le premier relevé, plus haut dans la journée, en comptait 7 : la matière manquante pour **V-4** et
**V-5** a été préparée depuis — voir **§8 ter**.)*

> ⚠️ **Cette section décrit l'état au 2026-08-18.** Elle est conservée telle quelle comme trace.
> ✅ **V-7, V-8 et V-10 ont été exécutées et réussies le 2026-08-19 — voir §8 quater**, qui clôt
> l'étape 5.

**Environnement** : toutes les vérifications ont été faites sur une **copie de test** du classeur
*(`Tournoi R92 — COPIE DE TEST C-012`)*, la propriété de script `SHEET_ID` ayant été basculée
temporairement vers cette copie. **Aucune écriture n'a touché le classeur de production.** Le
routage a été prouvé par contraste `getConfig` **avant / après** bascule, et ⭐ **`SHEET_ID` a été
restaurée en fin de session** *(propriété supprimée : elle n'existait pas avant)* — la réponse
publique est redevenue **identique octet pour octet** à celle d'avant bascule, et la production a
été vérifiée **intacte** *(3 matchs terminés, 211 lignes d'historique — inchangés)*. Détail et
preuves : `SESSIONS.md` **§2 et §9**.

#### Ce que chaque vérification réussie a établi

| # | Preuve retenue |
|---|---|
| **V-1** | M001 écrit **12-7**, statut `terminé`, carte verrouillée, classement recalculé, score servi par l'adresse publique |
| **V-2** | **deux moitiés vérifiées** — *(a)* la clé est redemandée par « Corriger », « Annuler » n'écrit **rien** ; *(b)* depuis un écran périmé, le serveur refuse avec le message **conforme au code au caractère près**, et un score concurrent *(8-6)* est **rejeté sans laisser de trace**. ⭐ **Parade du risque N-1 vérifiée en conditions réelles** |
| **V-3** | M001 corrigé en **10-14**, classement **réordonné** *(MEUDON 1→3 pts, VERSAILLES-1 3→1 pt)* |
| **V-6** | `Historique` : **une seule ligne** pour M001, portant le score **corrigé** — la correction a **réécrit la ligne**, pas ajouté une seconde. **0 doublon** sur 213 lignes |
| **V-9** | Reconnexion + clé : **aucune ligne `__verif_cle__`**, 51 matchs avant et après, `Historique` identique. ⭐ **Parade du risque N-2 vérifiée** |
| **V-11** | Les 8 colonnes de détail supprimées à la main sont **toutes recréées** *(à droite : `arbitre` remonte en 19ᵉ position)*, la saisie simple fonctionne, et **n'écrit rien** dans les colonnes de détail. ⚠️ **RÉSERVE — voir sous ce tableau** |
| ⚡ **V-4** | **M053** *(U14)* : détail 3 essais / 2 transfos / 1 pénalité / 1 drop contre 1 / 1 / 2 / 1 → **25-16**, score **calculé par le serveur** *(recalcul indépendant du barème : conforme)* · ⭐ **les 8 compteurs écrits chacun dans SA colonne** · `arbitre` **vide** |
| ⚡ **V-5** | **M054** *(U14)* : 6 essais contre 1 → **écart de 5, exactement le seuil** · ⭐ **bandeau affiché**, texte **conforme au code au caractère près** : `⚠️ 5 essais d'écart — pense au rééquilibrage (règle des 5 essais).` · 8 compteurs justes, **zéros écrits et non laissés vides** |

> ### ⚠️ V-11 — RÉUSSIE, **avec réserve** *(ajoutée le 2026-08-18)*
>
> Les 8 colonnes sont bien recréées et la saisie **simple** fonctionne : **le périmètre de V-11 est
> rempli, son verdict ne change pas**. ⚠️ **Mais la migration les recrée en FIN de tableau, dans un
> ordre que l'écriture du score détaillé ne supporte pas** — défaut **antérieur à C-012**, inscrit
> au registre sous **R-093**, et révélé par **V-4 immédiatement après**.
>
> **V-11 n'avait pas testé la saisie détaillée après migration** : c'est cet angle mort qui est
> consigné ici, pas une erreur de son exécution.

#### ⭐ V-12 — 🟠 **NON CONCLUANTE**

> **V-12 — NON CONCLUANTE.** La validation de M007 a duré **7,099 s** *(journal « Exécutions »,
> 2026-08-18 à 14:30:30, déploiement « Version 151 » — **rapporté par Romain**, non vérifiable
> depuis le dépôt : `CLAUDE.md` §13.6)*, au-dessus de l'enveloppe opérationnelle de **7 s** retenue
> comme **critère de substitution** *(D-C012-5)*. Les lectures `doGet` **contemporaines** sont
> restées **majoritairement dans leur plage habituelle** *(1,6 à 4,8 s ; médiane des 14 lectures
> suivantes : **2,218 s**, contre **2,07 s** de repère historique)* — **aucun signe de dégradation
> générale de la plateforme au même moment**. **La cause de cette durée reste INDÉTERMINÉE**, et
> **la responsabilité de C-012 n'est pas établie**. L'absence de mesure homogène d'une validation
> **avant** C-012 demeure une **limite méthodologique définitive**.

**Contexte statistique — faits nus, sans lien de cause :**

| Série | Valeurs |
|---|---|
| Validations réelles observées **sur le code actuel** | **4,408 · 4,667 · 4,968 · 5,243 · 6,887 · 7,099 s** |
| Série V-12 antérieure *(3 validations consécutives)* | **7,079 · 11,592 · 9,216 s** |
| Écart client / serveur relevé sur **une** lecture | **17,027 s côté client** pour **≈ 2,145 s côté serveur** ⚠️ *observation d'écart, **à ne pas** utiliser pour expliquer les `doPost`* |

⚠️ **Ce qui n'est PAS écrit ici, et ne doit pas l'être** : aucune cause n'est désignée — ni C-012,
ni la plateforme, ni le relais, ni la reconstruction de l'instantané. **Rien de tout cela n'est
démontré.**

#### Les 5 vérifications non exécutées, et ce qui les bloque

| # | Ce qui manque |
|---|---|
| **V-4**, **V-5** | ✅ **DÉBLOQUÉES le 2026-08-18** — une catégorie U14 a été préparée *(§8 ter)*. **Les deux sont désormais RÉUSSIES** |
| **V-7**, **V-8**, ⭐ **V-10** | **Aucun match de Coupe** : `sous_tableau` vide sur les 51 matchs, `match_suivant` renseigné **0 fois**. Les garde-fous ①, ③ et ④ ne peuvent pas se déclencher. ⚠️ Le format `COUPE_PLATEAU` n'est **plus proposé par l'interface** *(interdit EDR — `frontend/js/admin-reglages.js:442`)* : le produire demanderait de l'écrire directement dans l'onglet `Config` |

---

### 8 ter — LA PRÉPARATION DE V-4/V-5, ET CE QU'ELLE A RÉVÉLÉ *(2026-08-18, soir)*

#### Ce qui a été préparé — dans la copie de test uniquement

| Élément | Valeur |
|---|---|
| Catégorie **U14** | présente · ⭐ **`forme_jeu = RE — 15x15`** · durée de mi-temps **15** · contexte `LAMBDA` · après-midi `POULES_NIVEAU` |
| Équipes | **3** — `TEST U14-1/2/3` *(minimum FFR : les matchs secs sont interdits)* |
| Génération | ⭐ **une seule fois** → **11 poules, 54 matchs**, fin du matin à **11:51** |

> ⭐ **Le référentiel FFR n'a eu besoin d'AUCUNE préparation.** `RefFFR_Regles` portait déjà
> `tir_au_but = OUI` pour **M14 / RE / 15x15** — la seule des 15 lignes à l'avoir. Contrairement à
> ce que laissait craindre la mémoire du projet, il n'y avait ni colonne à créer ni valeur à saisir.
>
> ⚠️ **Le point qui décide de tout** : mars 2027 propose **deux** formes pour M14 *(RE 10x10 et
> RE 15x15)*, et le code exige que **toutes** portent `OUI` (`regles.every`). Sans
> `Config.forme_jeu = RE — 15x15`, la capacité serait restée à `false` et V-4 aurait été impossible.
> **Ce n'est pas un réglage esthétique : c'est la condition d'existence de la vérification.**

#### ⚠️ V-4, PREMIÈRE TENTATIVE — ÉCHEC

Saisie détaillée sur **M052**, dans un classeur dont **V-11 venait de réordonner les colonnes**
*(`arbitre` remonté en 19ᵉ position)*. Le serveur écrit les 8 compteurs à partir de
`colMatchs('essais_A')` = **19** — la position dans le **code** — soit `arbitre` dans le **classeur** :

| Valeur envoyée | Colonne visée | Colonne **réelle** | Observé |
|---|---|---|---|
| `essais_A` = 3 | 19 | ⚠️ **`arbitre`** | **3** *(colonne métier écrasée)* |
| `essais_B` = 1 | 20 | `essais_A` | 1 |
| `transfo_A` = 2 | 21 | `essais_B` | 2 |
| `transfo_B` = 1 | 22 | `transfo_A` | 1 |
| `pen_A` = 1 | 23 | `transfo_B` | 1 |
| `pen_B` = 2 | 24 | `pen_A` | 2 |
| `drop_A` = 1 | 25 | `pen_B` | 1 |
| `drop_B` = 1 | 26 | `drop_A` | 1 |
| *(rien)* | — | `drop_B` | ⚠️ **vide — valeur perdue** |

**Les neuf cases correspondent, une à une.** Le score *(25-16)*, le statut et l'`Historique`
restaient **justes** — le serveur calcule le score avant d'écrire — et **l'application n'a rien
signalé**.

> ⛔ **Ce défaut n'est PAS imputable à C-012, et c'est vérifié** : la ligne d'écriture existait
> **déjà au point de départ du chantier** (`4af5003`), `colMatchs` date du **2026-07-24** et
> `assurerColonnesMatchs` du **2026-07-19**. C-012 n'a fait que remplacer des valeurs écrites en dur
> par `plan.compteurs`. ⚡ **Inscrit au registre : R-093** *(P2)*.

#### La remise en ordre, puis la reprise

La colonne `arbitre` a été **remise en dernière position** dans la copie. Contrôle : les **27
colonnes** correspondent alors **une à une** à `ENTETES.Matchs`, et **aucune valeur n'a bougé**
*(54 lignes × 27 colonnes comparées : 0 écart)*.

⭐ **V-4 refaite ensuite : conforme.** Les 8 compteurs à leur place, `arbitre` vide, `drop_B` écrit.

> 🎯 **La cause a été supprimée, l'effet a disparu.** C'est la démonstration inverse — la plus forte
> qu'on puisse produire sans instrumenter le code.

#### ⭐ Les trois matchs U14 sont trois preuves parallèles, et le restent

| Match | Score | Compteurs `essais_A`…`drop_B` | `arbitre` | Ce qu'il prouve |
|---|---|---|---|---|
| **M052** | 25-16 | `1, 2, 1, 1, 2, 1, 1, (vide)` | ⚠️ **3** | 🔒 **R-093** — le décalage, en vrai |
| **M053** | 25-16 | ⭐ `3, 1, 2, 1, 1, 2, 1, 1` | vide | ✅ **V-4** |
| **M054** | 38-7 | ⭐ `6, 1, 4, 1, 0, 0, 0, 0` | vide | ✅ **V-5** |

⚠️ **M052 est VOLONTAIREMENT laissé en l'état.** Ses données sont incohérentes — c'est précisément
ce qui en fait une preuve. **Ne pas le « réparer ».**

⚠️ **Il ne reste plus aucun match U14 vierge.** Une reprise de V-4 ou V-5 exigerait d'abîmer une
preuve ou d'ajouter des équipes.


---

### 8 quater — ⭐ V-7, V-8 ET V-10 : L'ÉTAPE 5 EST CLOSE *(2026-08-19)*

> 🏁 **Les trois vérifications qui manquaient sont faites, et les trois sont RÉUSSIES.**
> **R-042 passe à `TESTÉ`** *(décision de Romain le 2026-08-19)*, **avec la réserve V-12 / N-3
> explicitement conservée**.

#### Ce qui bloquait : une croyance fausse, pas une limite technique

V-7, V-8 et V-10 attendaient un **tableau final de Coupe**. Or le format `COUPE_PLATEAU` était
réputé **supprimé**. **Il ne l'a jamais été.** Établi en lecture seule :

- **50 occurrences** de `COUPE_PLATEAU` dans le code exécutable, sur **10 fichiers** ;
- le commit qui l'a retiré — **`21a4f2b`** *(2026-07-27)* — ne touche que **3 fichiers frontend** et
  ⭐ **AUCUN fichier backend**. Son propre message le dit : *« La CAPACITÉ reste entière »* ;
- `git log -S"COUPE_PLATEAU"` : **12 commits, aucune suppression**.

⭐ **Et une découverte qui justifie rétroactivement D-C012-1** : `propagerVainqueurBracket`,
`invaliderMatchAval`, `majPetiteFinale`, `construireBracketCoupe` et `fixturesApresMidiCoupePlateau`
**ne sont nommées nulle part dans `backend/Tests.gs`**. Sur 703 tests, **zéro** ne touche la
propagation. V-10 était bien **le seul filet**.

> ⚠️ **Le Super Challenge n'a rien à voir** : `genererDimancheScf` écrit `sous_tableau: ''` et
> `match_suivant: ''` **en dur** *(`Code.gs:8066`)*, et une catégorie SCF est **sautée** par le
> générateur d'après-midi *(`Code.gs:6199`)*. Il ne peut pas armer les garde-fous ①, ③ et ④.

#### La préparation, et son coût réel

| Obstacle | Fait |
|---|---|
| **51 matchs du matin non terminés** — `genererApresMidi` refuse de démarrer *(`Code.gs:6182`)* | scores `15 – 5` collés dans les seules colonnes `score_A`, `score_B`, `statut` *(plage `I2:K52`)*. **Diff : 153 cellules = 51 × 3, exactement. 0 ailleurs** |
| Aucun tableau de Coupe | U10 passée en `COUPE_PLATEAU` + `{"nbQualifiesCoupe":1}` — ⚠️ **copie de test uniquement**, sur décision explicite de Romain, *sans* que le format redevienne une fonctionnalité de l'application |

**Génération : 114 matchs**, conforme à la prédiction. Le tableau obtenu est **identique, match pour
match**, à celui simulé depuis `ordreSeeds` et `construireBracketCoupe` — ce qui **prouve
indirectement** que `nbQualifiesCoupe` valait 1 *(sinon : 10 matchs et des huitièmes)*.
⛔ **`param_format` n'a jamais pu être relu** : il n'est exposé par aucune lecture publique.

#### Les résultats

| | Geste | Preuve |
|---|---|---|
| ✅ **V-7** | égalité `10 – 10` en demi-finale, sans vainqueur | message **identique au code, 72 / 72 caractères** · ⭐ **0 cellule modifiée** sur 168 × 27. Le garde-fou ③ refuse **avant toute écriture, et sans payer de lecture** |
| ✅ **V-8 (a)** | saisie du quart | `M102.equipe_B` passe de vide à **ANTONY** — **5 cellules, 2 matchs**. M111 **ne bouge pas** *(correct : un quart n'appelle pas `majPetiteFinale`)* |
| ✅ **V-8 (b)** | saisie de la 2ᵉ demie | la petite finale est **recalculée** : STADE FRANÇAIS **se déplace de A vers B** — annoncé avant le geste, constaté après. Une fonction qui aurait « rempli le trou » aurait rangé les perdants **dans le mauvais ordre** |
| ✅ ⭐ **V-10 · branche « Annuler »** | correction refusée | message **identique au code, 152 / 152 caractères** · ⭐ **0 cellule modifiée** sur 4 536. ⚠️ L'écran affichait encore le nouveau score : **la preuve est la relecture du classeur, pas l'affichage** |
| ✅ ⭐ **V-10 · branche « Modifier quand même »** | cascade forcée | **prédiction annoncée avant le clic : 4 matchs, 11 cellules — constaté : les mêmes**. La demi-finale perd son score, la finale perd son finaliste, la petite finale revient en arrière. ⭐ **L'autre demi-finale est INTACTE : la cascade n'a pas débordé** |

**Aucun match hors Coupe touché à aucune étape. M052 / M053 / M054 intacts de bout en bout.**

#### Où en sont les six risques, au 2026-08-19

| # | État | Établi par |
|---|---|---|
| **N-1** | ✅ **ÉCARTÉ** — désormais sur **deux** messages vérifiés **caractère par caractère** *(72 et 152 signes)* | V-2b, **V-7**, **V-10** |
| **N-2** | ✅ **ÉCARTÉ** | V-9 |
| **N-3** | 🟠 **TOUJOURS NON CONCLUANT** — ⚠️ **réserve conservée au moment de passer R-042 à `TESTÉ`** | V-12 |
| **N-4** | ✅ **ÉCARTÉ pour C-012** *(R-093 reste ouvert, et lui est antérieur)* | V-4, V-11 |
| **N-5** | ✅ ⭐ **ÉCARTÉ** *(était 🟡 partiel)* — la propagation a tourné **5 fois** sans jamais gêner un enregistrement | V-6, **V-8** |
| **N-6** | ✅ ⭐ **ÉCARTÉ** *(était ⛔ NON VÉRIFIÉ)* — **le vainqueur propagé est le bon** | **V-8**, **V-10** |

> ⭐ **La limite assumée par D-C012-1 est couverte.** Les trois fonctions laissées hors du
> refactoring **et** hors des 703 tests ont tourné en conditions réelles et ont fait exactement ce
> que le code annonce.

#### Remise en état, et preuve que la production n'a rien vu

| # | Geste | Contrôle |
|---|---|---|
| 1 | `format_apresmidi` U10 → `POULES_NIVEAU` | ✅ vérifié |
| 2 | `param_format` U10 vidé | ⛔ **NON VÉRIFIÉ** *(hors liste blanche — l'observation de Romain fait foi)* |
| 3 | `heure_fin` → `17:18` | ✅ vérifié |
| 4 | ⭐ `SHEET_ID` supprimée | ✅ **vérifié — contrôle renforcé** |

**Routage production — 4 tests concordants** : `tournoi_nom` sans « COPIE DE TEST » · ⭐ **M095
ABSENT et 0 ligne `sous_tableau = COUPE`** *(la copie en avait 5)* · **51 matchs** *(la copie : 168)*
· horaires et catégories différents *(pas d'U14 en production)*.

> 💡 **Le test négatif est le plus solide** : un quart de finale U10 opposant ANTONY à CLAMART sur
> `7 – 12` **n'existe que dans la copie de test — parce que nous venons de le créer**.

✅ **Production vérifiée NON CONTAMINÉE** : aucun `COUPE_PLATEAU`, aucun `sous_tableau`, aucun
`match_suivant`, aucun match d'après-midi, aucune trace des scores collés.

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
| **N-3** | **La lecture du match suivant devient systématique** → chaque saisie ralentit, sous le verrou | 🟠 moyen | `cascadeAVerifier` (§4.3) ; **T-14** ; **V-12** — 🟠 **NON CONCLUANT au 2026-08-18** *(voir sous le tableau)* |
| **N-4** | **Les 8 colonnes de détail sont écrites en mode simple** *(ou l'inverse)* → migration douce cassée, détail écrasé | 🟠 moyen | **T-17** ; **V-4** et **V-11** |
| **N-5** | **L'archivage ou la propagation redevient bloquant** → un journal en erreur **empêcherait d'enregistrer un score** le jour J | 🔴 **élevé** | Les deux `try/catch` sont **transportés tels quels** ; **V-6**, **V-8** |
| **N-6** | **L'objet passé à la propagation n'est plus à jour** *(l'optimisation « en mémoire », §2.4-5)* → **le mauvais vainqueur propagé** | 🔴 **élevé** | `matchApresEcriture` est **explicitement dans le plan** (§5.2b) ; **V-8** et **V-10** |

> ### ⭐ Où en sont les six risques, au 2026-08-18
>
> ⚠️ **Tableau conservé comme trace. L'état À JOUR est au §8 quater** *(2026-08-19)* : **N-5 et
> N-6 sont désormais ÉCARTÉS**.
>
> | # | État | Établi par |
> |---|---|---|
> | **N-1** *(messages et drapeaux)* | ✅ **ÉCARTÉ en conditions réelles** | **V-2b** — message serveur conforme **au caractère près** |
> | **N-2** *(ordre des contrôles / sonde de clé)* | ✅ **ÉCARTÉ en conditions réelles** | **V-9** — aucune ligne `__verif_cle__` |
> | **N-3** *(lecture systématique du match suivant)* | 🟠 **NON CONCLUANT** | voir ci-dessous |
> | **N-4** *(colonnes de détail)* | ✅ **ÉCARTÉ pour ce qui concerne C-012** — la migration recrée bien les colonnes *(V-11)*, le mode simple n'y écrit rien *(V-11)*, le mode détail les remplit correctement *(V-4)*. ⚠️ **Mais V-4 a révélé un défaut ANTÉRIEUR** : l'écriture suppose l'ordre canonique que la migration ne garantit pas → **R-093** | **V-11** et **V-4** |
> | **N-5** *(archivage / propagation bloquants)* | 🟡 **partiellement écarté** — le journal n'a jamais bloqué une saisie *(V-1, V-3, V-6)* ; **la propagation n'a pas été exercée** *(V-8 non exécutée)* | — |
> | **N-6** *(mauvais vainqueur propagé)* | ⛔ **NON VÉRIFIÉ** | V-8 et V-10 non exécutées |
>
> **N-3 — 🟠 NON CONCLUANT.** Le chemin fonctionnel `match_suivant` **n'a jamais été exécuté** lors
> des validations disponibles, **faute de match de Coupe dans les données de test** *(0 match avec
> `sous_tableau = COUPE`, 0 `match_suivant` renseigné)*. **Aucun résultat, positif ou négatif, ne
> peut donc être attribué à ce scénario.**
>
> ⚠️ **V-12 ne teste pas N-3, et n'a pas été utilisée pour en conclure quoi que ce soit** : les
> validations mesurées portaient toutes sur des matchs de **poule**.

---

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
| **0 bis** | ✅ **Autorisation d'implémenter donnée le 2026-08-16 — étape par étape.** Chaque étape a reçu la sienne séparément ; **l'étape 4 le 2026-08-18**, **l'étape 5 les 2026-08-18 et 2026-08-19** | — | — |
| **1** | ✅ **FAIT — PR #187 fusionnée le 2026-08-16.** **Cœur 1** `litSaisieScore` extrait · `enregistrerScore` l'appelle · **T-1 à T-5** | `refactor(scores): C-012 étape 1 — extraire litSaisieScore, et T-1 à T-5 (R-042)` | **616 + 33 = 649** verts |
| **2** | ✅ **FAIT — PR #188 fusionnée le 2026-08-16.** **`cascadeAVerifier`** extrait · **T-14** | `refactor(scores): C-012 étape 2 — extraire cascadeAVerifier et ajouter T-14` | **649 + 12 = 661** verts |
| **3** | ✅ **FAIT — PR #189 fusionnée le 2026-08-17.** ⭐ **Cœur 2** `deciderEnregistrementScore` — les 6 garde-fous · **T-6 à T-13, T-15 à T-17** | `refactor(scores): C-012 étape 3 — les six garde-fous passent sous test (R-042)` | **661 + 42 = 703** verts |
| **4** | ✅ **FAIT le 2026-08-18** — **redéploiement chez Google** *(`Code.gs` **ET** `Tests.gs` → `Test.gs`)* · **nouvelle version du MÊME déploiement** publiée · `lancerTestsFFR` exécuté là-bas | *(pas de commit de code — seulement celui-ci, documentaire)* | ⭐ **`R92 — 703/703 OK, 0 FAIL` obtenu CHEZ GOOGLE** · **dernière ligne de `Test.gs` = 4244** · `?action=ping` **OK** · `?action=getConfig` **OK** *(les 5 preuves sont détaillées sous le tableau)* |
| **5** | 🏁 **CLOSE le 2026-08-19 — 11 vérifications sur 12.** ✅ **V-1 à V-11 RÉUSSIES** *(V-11 avec réserve)*, dont ⭐ **V-7, V-8 et V-10** · 🟠 **V-12 NON CONCLUANTE** *(réserve conservée)*. ✅ **Routage production rétabli et vérifié**, ✅ **production non contaminée** | *(lots documentaires)* | **§8 bis**, **§8 ter** et ⭐ **§8 quater** — résultats et preuves |

> ⚠️ **Le compte annoncé au §7 était faux, et il faut le dire.** Ce document estimait *« 616 + 5 »*
> pour l'étape 1 et *« ~633 »* pour l'ensemble : il **comptait les fonctions de test**, alors que le
> harnais compte les **vérifications**. Le réel est **616 + 33 + 12 + 42 = 703**, et le total
> annoncé était donc **très en dessous**. ✅ **Il est désormais MESURÉ, plus estimé.**
>
> 🏁 **Mise à jour du 2026-08-19 — L'ÉTAPE 5 EST CLOSE, ET C-012 EST TERMINÉ.** Les **3
> vérifications restantes** ont été exécutées : ⭐ **V-7, V-8 et V-10 sont RÉUSSIES** — V-10 dans
> ses **deux branches**, aucune sautée *(§8 quater)*.
>
> ⭐ **R-042 est passé à `TESTÉ`** *(décision de Romain, 2026-08-19)*, **avec une réserve
> explicitement conservée** : 🟠 **V-12 / N-3 demeure NON CONCLUANTE**, sous le critère de
> substitution **D-C012-5** déjà accepté. Cette réserve n'est pas un détail de forme — elle dit
> précisément ce que le chantier **ne prouve pas** : que la lecture du match suivant n'est pas
> devenue systématique.
>
> ✅ **Aucune ligne de code, aucun test, aucune configuration de l'application n'ont été modifiés
> pendant toute l'étape 5**, et **aucun redéploiement n'a eu lieu.** Les vérifications se sont faites
> sur une **copie de test**, et le **routage a été rétabli sur la production**, vérifiée
> **non contaminée** *(4 tests concordants — §8 quater)*.

### ⭐ Étape 4 — les preuves obtenues le 2026-08-18

| # | Preuve | Résultat | Qui l'a constatée |
|---|---|---|---|
| **1** | `lancerTestsFFR` exécuté **chez Google** | **`R92 — 703/703 OK, 0 FAIL`** | **Romain**, dans l'éditeur Apps Script |
| **2** | **Dernière ligne** de `Test.gs` **chez Google** | **4244** — soit exactement `wc -l backend/Tests.gs` | **Romain**, dans l'éditeur Apps Script |
| **3** | **Nouvelle version du MÊME déploiement** publiée *(et non un « Nouveau déploiement »)* | **OK** — l'URL publique est inchangée | **Romain** |
| **4** | `…/exec?action=ping` | **OK** — `{"ok":true,"message":"API Tournoi R92 en ligne"}` | **vérifié directement**, appel réel |
| **5** | `…/exec?action=getConfig` | **OK** — **contenu réel du tournoi renvoyé** *(« CHALLENGE MARC CHEVALIER »)* : l'adresse ne fait pas que répondre, elle **sert la donnée** | **vérifié directement**, appel réel |

> 🎯 **Pourquoi les preuves 1 et 2 vont ensemble, et jamais l'une sans l'autre.** Le **bilan** dit
> *combien* de vérifications passent ; la **dernière ligne** dit **quel fichier** les a produites.
> Le 2026-08-04, un « 573/573 OK » **vrai** portait sur l'**ancien** `Tests.gs` — une preuve fausse
> restée quatre jours au dossier *(`RISQUES.md` **M-04**)*. Ici le passage de **661 à 703** est la
> signature des 42 vérifications de l'étape 3 : c'est bien le **bon** fichier qui a tourné.
>
> ⚠️ **Portée exacte, et il faut la connaître.** Les preuves 1 et 2 ont été constatées **par Romain**
> dans l'éditeur Apps Script — elles ne sont pas vérifiables depuis le dépôt *(cadre §13.6)*. Les
> preuves 4 et 5 l'ont été **directement**, par appel réel. Et surtout : **703 tests verts ne
> prouvent pas qu'une saisie de score fonctionne en vrai** — ils prouvent que les six garde-fous
> **raisonnent** juste, isolés. Ni le classeur, ni l'écran de saisie, ni la cascade du tableau final
> ne sont traversés. **C'est exactement l'objet de l'étape 5, et de V-10 en particulier.**

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
| ⚡ **D-C012-5** | **Critère de V-12**, faute de mesure « avant » | ✅ **Critère de substitution accepté le 2026-08-18** *(voir ci-dessous)* |

---

### ⚡ D-C012-5 — Critère de substitution pour V-12 *(accepté par Romain le 2026-08-18)*

**Le problème.** Le §8 demandait pour V-12 une validation *« pas plus lente qu'avant »*. Or
**aucune mesure homogène d'une validation de score avant C-012 n'existe** — l'audit du domaine F
l'écrit lui-même : *« Aucune écriture réelle n'a été chronométrée »* *(`AUDIT.md` §F.7 ; la
fourchette « 3 à 8 s » y est une **reconstitution par calcul**, pas une mesure)*. Le repère
**2,67 s** souvent cité est la **médiane de 43 écritures toutes catégories confondues** —
publications, horaires, équipes — et **non** de validations de score. Et l'ancien code n'étant plus
en service, **cette mesure ne peut plus être obtenue**.

**Le critère retenu à la place** :

> *« La validation reste dans l'enveloppe des validations mesurées sur le code actuellement
> déployé, et aucune opération ajoutée par C-012 n'intervient sur ce chemin. »*

⚠️ **Les trois réserves posées par Romain, conservées telles quelles** :

1. ce critère permet de statuer **opérationnellement** sur V-12 ;
2. il **ne constitue pas** une preuve historique que la validation est aussi rapide qu'avant C-012 ;
3. **l'absence de mesure réelle avant C-012 reste documentée comme une limite méthodologique.**

**Application à M007** *(les seuils ont été fixés **avant** le geste)* :

| Condition | Seuil | Observé | Verdict |
|---|---|---|---|
| Rester dans l'enveloppe | **≤ 7 s** | **7,099 s** | ❌ **non satisfaite** |
| Aucune opération C-012 sur ce chemin | — | `litSaisieScore` et `deciderEnregistrementScore` sont **pures** ; la lecture conditionnelle du match suivant **n'a pas été franchie** *(aucun match de Coupe)* | ✅ **établie** |

**Le critère n'est donc rempli qu'à moitié → V-12 est `NON CONCLUANTE`.** Ce n'est **pas** un
échec : un échec supposerait de démontrer que C-012 a ralenti la validation, ce qui exigerait soit
une mesure d'avant *(inexistante et désormais impossible)*, soit un mécanisme identifié dans le code
ajouté *(il n'y en a pas)*.

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
