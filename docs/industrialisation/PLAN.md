# PLAN D'INDUSTRIALISATION — Tournoi R92

> Ce fichier contient le **plan global**. Il évolue au fur et à mesure des audits.
> Tant que l'audit (ÉTAPE 2) n'a pas eu lieu, le tableau des chantiers reste **vide** :
> on ne planifie pas des travaux qu'on n'a pas encore constatés.

> 📕 **L'ÉTAPE 2 est close** (2026-08-05). La matière première de ce plan est dans
> [`RAPPORT-AUDIT.md`](RAPPORT-AUDIT.md) — dont le **§6** contient déjà une **proposition d'ordre
> de traitement en 6 étapes**, ainsi qu'une liste de ce qu'il ne faut **PAS** faire. ⚠️ C'est une
> **proposition**, pas une décision : elle sera construite à l'ÉTAPE 3 et validée à l'ÉTAPE 4,
> chantier par chantier.

**Dernière mise à jour** : 2026-08-05 (session 13 + addendums — **l'ÉTAPE 3 est ouverte, volet ①
terminé** · ⚡ **D-030 inscrite, I-21 levée, cadre de reprise précisé par Romain, et les fiches de
chantier C-002 / C-003 / C-004 rédigées** — voir **§6**)

---

## 0. DÉCOUPAGE DE L'ÉTAPE 3

Reprendre 9 inconnues, 6 décisions et 88 problèmes ne tient pas dans une séance. Trois volets :

| Volet | Contenu | Session | Statut |
|---|---|---|---|
| **①** | **Les inconnues et les décisions** — elles conditionnent tout le reste | 13 | ✅ **TERMINÉ** — 9 inconnues → 7 *(dont **0 bloquante**)*, **6 décisions → 0 en attente** |
| **②** | Les chantiers **sans code** : documentation, textes d'information, durées de conservation, commentaires faux | 14 | 🔜 **PROCHAIN** |
| **③** | Les chantiers **avec code**, ordonnés par ce qui doit passer **avant** quoi | — | ⬜ À faire — ⚡ **mais ses deux premières fiches sont DÉJÀ écrites** : **C-002** et **C-003** *(le tournoi suspendu ou annulé, D-030)*, voir **§6** |

### ⚠️ Les deux contraintes d'ordre déjà FIXÉES — elles ne se négocient plus

Elles s'imposeront au volet ③ et à l'ÉTAPE 5 :

1. **Les 5 tests du barème et du départage (R-041) AVANT la correction du départage** — décision
   **D-025**, validée par Romain le 2026-08-05. *Raison : **D-014 est déjà décidée**, le départage
   **sera** modifié. Écrits après, ces tests graveraient le **nouveau** comportement sans avoir
   jamais vu l'ancien — ils ne prouveraient plus qu'on n'a rien cassé.*
2. **R-042 — séparer le cœur de la saisie du score de son écriture — AVANT** d'y toucher, sinon
   **D-011** (forfait), **D-012** (limite de score), **D-015** (match annulé) ⚡ **et D-030** (le
   gel d'un tournoi suspendu) rouvrent **quatre fois** le même code.

### ⚡ Ce qui est entré au chantier APRÈS la clôture de l'audit

> **Le registre n'est pas figé par la fin de l'ÉTAPE 2.** Une décision fonctionnelle apportée par
> Romain le 2026-08-05 ajoute un **89ᵉ** problème — **R-089** — qui n'a été trouvé par **aucun**
> domaine. C'est la démonstration de **M-05** : *l'audit photographie une application qui bouge*,
> et son **périmètre fonctionnel** bouge aussi.

| Réf | Ce que c'est | Où ça atterrit |
|---|---|---|
| **D-030 / R-089** (P1) | **Tournoi SUSPENDU / ANNULÉ pour force majeure** — deux états au niveau du **tournoi**, un cran au-dessus du match annulé de D-015. Spécification complète en `DECISIONS.md` **D-030** | **Volet ③**, en **2 niveaux** — voir la famille « 🌩️ Le tournoi qui s'arrête » ci-dessous |

### Ce que le volet ① a rendu constructible

| Rendu possible par | Ce qui peut enfin être planifié |
|---|---|
| **D-020** *(durées adoptées)* | **R-030** (P1), R-031, R-033, R-034 — **9 problèmes** cessent d'attendre |
| **D-018** *(textes autorisés)* + **I-16** *(la page RGPD existe déjà)* | **R-028** (P1), R-038 — et le coût baisse : une **section** à ajouter, pas une page à créer |
| **D-019** *(voie « informer »)* | **R-029** (P1) — reste **suspendu** tant que les partenaires sont éteints |
| **D-025** *(lot ① des tests)* | **R-041**, et l'ordre de tout le volet ③ |
| **D-005** *(périmètre fermé)* | Les textes de D-018 sont **livrés**, jamais posés par le chantier |

---

## 1. LES 6 ÉTAPES (cadre fixé par `CLAUDE.md`)

| Étape | Nom | Ce qu'elle produit | Statut |
|---|---|---|---|
| 0 | Mise en place du suivi | `CLAUDE.md` + `docs/industrialisation/` | ✅ TERMINÉE |
| 1 | **Cartographie** | Comprendre le projet, en langage simple. Aucune modification. → `CARTOGRAPHIE.md` | ✅ **TERMINÉE** (volets A, B et C) |
| 2 | **Audit global** | Rapport des 8 domaines, problèmes classés P0/P1/P2/P3. Aucune modification. → `AUDIT.md` + `RISQUES.md` | ✅ **TERMINÉE** — **8 sur 8**, sessions 5 à 12, **88 problèmes** |
| 3 | **Plan priorisé** | Le tableau des chantiers ci-dessous, rempli | 🚧 **EN COURS** — **volet ① ✅ fait** (session 13) · ② et ③ à venir |
| 4 | **Validation** | Accord explicite de Romain, chantier par chantier | ⬜ À faire |
| 5 | **Implémentation** | Une modification cohérente à la fois | ⬜ À faire |
| 6 | **Commit** | Un commit atomique par chantier validé | ⬜ À faire |

> **Règle** : on ne passe pas à l'étape suivante sans que la précédente soit terminée **et**
> que Romain ait donné son accord quand une validation est requise.

### Découpage de l'ÉTAPE 1

Le projet est trop volumineux pour être cartographié en une fois (plus de 11 000 lignes rien que
pour le serveur). L'étape est donc découpée en **trois volets**, un par session, tous écrits dans
`CARTOGRAPHIE.md` :

| Volet | Contenu | Session | Statut |
|---|---|---|---|
| **A — Le squelette** | Les morceaux de l'application, où ils tournent, comment ils se parlent, comment le code arrive en ligne, qui a le droit de quoi | 2 | ✅ FAIT |
| **B — Les fonctionnalités** | Ce que l'application sait faire : les 14 écrans d'administration, la génération des poules et du planning, la saisie des scores, le classement, la page publique, le parcours d'invitation des clubs | 3 | ✅ FAIT |
| **C — Les données** | Quelles données sont stockées, dans quel onglet, qui peut les voir, combien de temps elles restent — en particulier les données personnelles (clubs, contacts, mineurs) | 4 | ✅ FAIT |

> Le volet C prépare directement le domaine B (RGPD) de l'ÉTAPE 2, sans le remplacer : il **décrit**
> ce qui existe, il ne juge pas.

> ✅ **L'ÉTAPE 1 est terminée.** Elle a produit `CARTOGRAPHIE.md` (3 volets) et **39 points
> d'attention** (A-01→A-14, B-01→B-12, C-01→C-13), qui sont la matière première de l'ÉTAPE 2.

---

## 2. LES 8 DOMAINES D'AUDIT — AVANCEMENT

| Domaine | Nom | Statut | Session |
|---|---|---|---|
| A | Métier / Product Owner | ✅ **FAIT** — 0 P0 · 5 P1 · 7 P2 · 1 P3 | 5 |
| C | Sécurité | ✅ **FAIT** — **1 P0 (TESTÉ)** · 5 P1 · 6 P2 · 2 P3 | 6 |
| B | RGPD / Protection des données | ✅ **FAIT** — 0 P0 · 3 P1 · 9 P2 · 1 P3 · **3 décisions en attente** (D-018/019/020) | 7 |
| D | QA / Tests | ✅ **FAIT** — 0 P0 · 4 P1 · 5 P2 · 1 P3 · **+ M-04** (risque de méthode) | 8 |
| E | UX / UI / Accessibilité | ✅ **FAIT** — 0 P0 · 2 P1 · 7 P2 · 1 P3 · **I-05 levée** | 9 |
| F | Performance | ✅ **FAIT** — 0 P0 · 2 P1 · 7 P2 · 2 P3 · **2 inconnues ouvertes** (I-18, I-19) | 10 |
| G | Architecture / Maintenabilité | ✅ **FAIT** — 0 P0 · 2 P1 · 7 P2 · 1 P3 · **D-028 tranchée le jour même** (on ne découpe pas `Code.gs`) · **1 inconnue** (I-20) | 11 |
| **H** | **Qualité du code** | ✅ **FAIT** — **0 P0 · 0 P1** · 5 P2 · 2 P3 · **aucune décision, aucune inconnue** · **179 comparaisons serveur ↔ navigateur, 0 écart** (répond à **R-044**) · **+ M-06** | 12 |

> 🏁 **L'ÉTAPE 2 EST TERMINÉE** (2026-08-05). Les huit domaines ont parlé, dans l'ordre exact validé
> par **D-010**. Total : **88 problèmes** — 1 P0 (corrigé et testé), 23 P1, 53 P2, 11 P3 — et
> **6 risques de méthode** (M-01 → M-06).
>
> ⚡ **Le registre de suivi en compte 89 depuis le 2026-08-05**, et les deux chiffres sont vrais :
> **88** = ce que l'audit a trouvé *(figé)* · **89** = l'état du registre, qui continue de vivre.
> **R-089** n'a été trouvé par aucun domaine — il a été **apporté par Romain** (**D-030**).

> ✅ **Ordre d'audit VALIDÉ par Romain le 2026-08-04** (décision D-010) : **A → C → B → D → E → F
> → G → H**. Raison : le métier d'abord (priorité n°1 du prompt maître), puis ce qui peut faire du
> mal (sécurité, données personnelles), puis ce qui prouve (tests), puis le confort.
>
> L'alternative — remonter le domaine B pour profiter de la fenêtre où le classeur est encore vide
> de données de tiers — a été **écartée** : *« on fait les choses dans l'ordre pour bien les faire,
> la production attendra »*. La fenêtre reste ouverte tant qu'aucun vrai club n'est invité.

---

## 3. TABLEAU DES CHANTIERS

> Se remplit à l'ÉTAPE 3, à partir de `RISQUES.md`.
> Un chantier = un ensemble de corrections qui doivent être faites **ensemble**.

| ID | Chantier | Priorité | Statut | Dépend de | Validé par Romain | Implémenté | Testé |
|---|---|---|---|---|---|---|---|
| **C-001** | **Plafonner l'écriture publique des relevés de partenaires** (R-014) — *hors ordre normal, par exception D-016* | **P0** | ✅ **TESTÉ** | — | ✅ oui (D-016) | ✅ commit `c1948fc`, **redéployé** | ✅ **573/573** dans Apps Script + chaîne vérifiée en réel |
| — | *(les autres chantiers se rempliront à l'ÉTAPE 3, quand les 8 audits seront finis)* | — | — | — | — | — | — |

> **Pourquoi ce tableau ne contient-il qu'une ligne, alors que 88 problèmes sont identifiés ?**
> Parce qu'un chantier regroupe des corrections qui doivent être faites **ensemble**, et qu'on ne
> peut pas savoir ce qui va ensemble tant que les 8 domaines n'ont pas parlé. Exemple : R-005
> (borne haute sur un score) touchera peut-être le même code qu'un futur constat du domaine D
> (tests). Les regrouper évitera de modifier deux fois le même fichier.
>
> ✅ **C-001 est une exception assumée**, validée par Romain (**D-016**) : le domaine C a trouvé un
> **P0**, corrigé seul et en avance parce que c'était la seule faiblesse exploitable sans
> connaître aucun secret. Il est aujourd'hui **TESTÉ** et **en service**. Cette exception ne crée
> pas de précédent : tout le reste attend l'ÉTAPE 3.

### Regroupements déjà visibles (à confirmer à l'ÉTAPE 3)

Ce ne sont pas encore des chantiers, mais des **familles** qui se dessinent après deux audits :

| Famille | Problèmes | Pourquoi ils vont ensemble |
|---|---|---|
| **Filet de sécurité sur les gestes destructeurs** | R-015, R-016 | Même cause (protection tenue par la page, pas par le serveur), même correction, mêmes tests |
| **Savoir qui a fait quoi** | R-017, R-023 | Les deux ajoutent une trace ; autant toucher l'`Historique` une seule fois |
| **Ce qui sort de l'application** | R-021, R-018, **R-032** | Le domaine B a parlé : R-021 (liste blanche sur les 4 onglets) referme aussi R-032, et R-018 (jetons permanents) est le pendant technique de R-030 (durées) |
| **Dire aux gens ce qu'on fait de leurs données** | **R-028, R-029, R-038** | Même livrable : trois textes + une page « Vos données ». **Zéro code** pour R-028 et R-038 |
| **Savoir jeter** | **R-030, R-031, R-033, R-034**, R-018 | Une seule décision (D-020) les met tous en ordre de marche ; même écran, même code de suppression, mêmes tests |
| **Cadre écrit, hors code** | **R-036, R-039** | Ni l'un ni l'autre ne se corrige dans le dépôt : ce sont des questions au club et des documents |
| **Le forfait, l'annulation et le classement** | R-001, R-004, R-013, R-012 | Domaine A : même code (classement, états d'un match), même besoin de tests préalables |
| **⚠️ Le filet AVANT les corrections** | **R-041**, R-004, R-001 | Le domaine D a parlé : le départage et le barème n'ont **aucun test**, et **D-014 va les modifier**. Les tests de R-041 sont le **préalable** de ce chantier, pas son complément — écrits après, ils graveraient le nouveau comportement sans avoir jamais vu l'ancien |
| **Le geste du jour J** | **R-042**, R-005, R-013, R-001 | D-011, D-012 et D-015 rouvrent toutes `enregistrerScore`. R-042 (séparer le cœur de l'écriture) doit être fait **une fois, avant**, sinon on touche trois fois au même code |
| **Le chemin vers la production** | **R-043**, R-049, R-050 | Rien ne contrôle ce qui part en ligne, et un document annonce une preuve qui n'existe pas. Même sujet : ce qu'on croit vérifié et qui ne l'est pas |
| **Le filet côté serveur** | R-015, R-016, **R-047** | Trois protections tenues par la **page** et non par le serveur. R-047 (équipes en double) rejoint la famille déjà repérée au domaine C |
| **⚡ Terminer le travail d'affluence** | **R-061**, **R-062**, **R-064** | Le domaine F a parlé : le relais est écrit mais éteint, le cache de repli s'éteint tout seul vers 165 matchs, et sa durée (10 s) est plus courte que le rythme d'appel (15-19 s). **Un seul sujet, une seule séance.** Précédé de **I-18** (5 minutes) et **I-19** (une question à Romain), sans lesquelles on décide à l'aveugle |
| **Faire parler le geste du jour J** | **R-051**, **R-052**, **R-053**, **R-069** | Les trois premiers viennent du domaine E (l'écran ne dit rien), le quatrième du domaine F (l'écriture peut attendre sans fin). **Même fichier, même correction, mêmes essais.** Et R-067 explique *pourquoi* ça compte : l'attente après « Valider » est réelle, mesurée |
| **Alléger ce qui voyage** | **R-063**, **R-065**, **R-066**, R-024 | Champs vides (58 % du poids), outil PDF chargé pour rien (44 % de l'admin), logo surdimensionné (79 % de la page publique). ⚠️ **R-063 exige les tests de R-041/R-042 AVANT** ; **R-066 dépend de D-005** (autre dépôt) |
| **Le verrou et ce qu'on met dedans** | **R-067**, **R-068**, R-070 | Trois fois le même sujet : du travail fait **sous le verrou d'écriture** alors qu'il pourrait être fait dehors — ou pas du tout. ⚠️ **R-068 touche à la sécurité** : à trancher avec R-017, R-018, R-059 |
| **📄 Remettre le projet en face de lui-même** | **R-072**, **R-073**, R-024 *(+ R-080)* | Le domaine G a parlé : la procédure de redéploiement décrit la moitié du geste, la carte du projet décrit une autre application, les bibliothèques n'ont ni version ni origine. **Zéro ligne de code, zéro risque technique, un seul livrable** — et ça referme la porte par laquelle **M-04** est déjà entré. ⚠️ **R-072 d'abord et seul si le temps manque** : c'est le seul problème du chantier qui **se redéclenchera au prochain redéploiement** |
| **Les noms qui se marchent dessus** | **R-078**, R-043 | 12 noms globaux en double dans le navigateur. Aucun ne collisionne aujourd'hui, mais la panne serait **une page blanche**, pas un bouton en panne. Une douzaine de renommages ciblés — **à faire sous la protection des tests de R-043**, jamais à l'aveugle |
| **📝 Ce que le code raconte de faux sur lui-même** | **R-083**, **R-084**, **R-087** *(+ R-072, R-073)* | Le domaine H a parlé : cinq commentaires annoncent l'inverse de ce que fait le code, une colonne du classeur est documentée mais lue par personne, et quinze lignes mortes affirment servir. **Zéro ligne exécutable, zéro risque, un seul livrable** — et c'est exactement le lot documentaire de R-072/R-073, un cran plus bas. ⚠️ **Même avertissement** : chaque phrase réécrite doit être **vérifiée dans le code**, jamais déduite |
| **🔇 Faire parler le geste du jour J** *(élargi)* | **R-051**, **R-052**, **R-053**, **R-069**, **R-086**, **R-085** | Le domaine H apporte les deux pièces qui manquaient : **R-086** chiffre le problème (**29 endroits sur 21 fichiers** montrent l'erreur brute du navigateur) **et porte la correction** — un seul endroit à écrire ; **R-085** en est le pendant côté serveur (une image qu'on jette sans vérifier, et l'application répond « c'est fait »). **Même sujet : l'application dit qu'elle a réussi sans le savoir.** ⚠️ Sous contrainte **D-027** : un message ne doit jamais mentir |
| **🏉 Le Super Challenge** | **R-082**, **R-083** *(sa part SCF)* | Trois lignes de garde côté serveur, et trois commentaires à effacer. Tout est au même endroit et ne touche **que le remplissage d'un formulaire**. ⚠️ **Ce lot change de priorité tout seul** : P2 aujourd'hui, **P1 le jour où le club accueille réellement un Super Challenge** |
| ⚡ **🌩️ Le tournoi qui s'arrête** — ***niveau 1*** | **R-089** *(D-030)*, **R-015**, **R-016**, **R-047**, R-051, R-052 | **L'état SUSPENDU / ANNULÉ, son gel et sa visibilité.** Il rejoint **obligatoirement** la famille « le filet côté serveur » : un gel tenu par la page web **ne gèle rien** — il suffit d'ouvrir la saisie ailleurs. Même cause, même correction, mêmes tests. Le **bandeau public** rejoint « faire parler le geste du jour J », sous contrainte **D-027** *(un message ne ment jamais)*. ⚠️ **Prérequis : le lot ① des tests** (le « pas de classement final si annulé » touche le classement) **et R-042** (le gel verrouille la saisie) |
| ⚡ **🌩️ Le tournoi qui s'arrête** — ***niveau 2*** | **R-089** *(D-030, scénarios de reprise)*, **R-003** *(niveau 3 de D-013)* | **Les propositions de rattrapage** : périodes réduites, deux périodes → une, marges, terrains. ⚠️ **Ces deux-là ne doivent JAMAIS être faits séparément** : D-013 avait écarté son niveau 3 (*« redistribuer un terrain devenu impraticable »*) comme *« le seul niveau qui touche au planificateur, donc le seul réellement risqué »* — or D-030 niveau 2 touche **exactement** le même code. Les séparer, c'est ouvrir `calculerPlanning` deux fois. ✅ **I-21 LEVÉE le 2026-08-05** : la reprise avec adaptation du format et de la durée est **autorisée**, sous deux réserves — ⛔ **temps de jeu maximal** *(aujourd'hui simple affichage, à transformer en contrôle réel)* et ⛔ **aucune phase finale**. ⚡ **Cadre précisé par Romain le même jour** : **6 contraintes / 8 leviers / 5 principes** (`DECISIONS.md` D-030 §9) — le moteur **cherche toutes les marges avant de conclure à l'impossibilité**. → **fiches C-003 et C-004** |
| **⛔️ Ce qui NE doit PAS être groupé** | ~~R-074~~, **R-076**, **R-077**, **R-081**, **R-088** | Des problèmes qui se **ressemblent** (découper, ranger, outiller) et qu'il serait tentant de traiter ensemble. **Ils ne doivent pas l'être** : chacun, fait en bloc, aggrave un problème plus grave que lui — renommer 277 tests fait perdre un test en silence, découper l'admin exige l'outillage que `CLAUDE.md` §10 déconseille. **Progressif et réversible, ou rien.** ✅ **R-074 est sorti de cette liste : il est ARBITRÉ** (**D-028**, 2026-08-05) — on ne découpe pas `Code.gs` tant que le dépôt est manuel. ➕ **R-088 rejoint la liste** (domaine H) : renommer en masse des variables courtes, c'est 42 occasions de casser un appel pour un gain de **confort de lecture**. Méthode **opportuniste** uniquement, la même que R-079 |

### Modèle de fiche de chantier

À recopier pour chaque chantier créé à l'ÉTAPE 3.

```markdown
### C-00X — <titre court>

- **Problème** (en langage simple) :
- **Risques couverts** : R-0XX, R-0XX (voir RISQUES.md)
- **Priorité** : P0 / P1 / P2 / P3
- **Bénéfice** (ce que Romain y gagne concrètement) :
- **Risque de la correction elle-même** (ce qui pourrait casser) :
- **Fichiers concernés** :
- **Dépendances** (ce qui doit être fait avant) :
- **Stratégie de test** (comment on prouve que ça marche et que rien n'est cassé) :
- **Vérifications de non-régression prévues** :
- **Statut** : IDENTIFIÉ / PLANIFIÉ / VALIDÉ / EN COURS / CORRIGÉ / TESTÉ
- **Validation de Romain** : oui / non / date
- **Commit** :
```

---

## 4. RÈGLES DE PRIORISATION

Ordre de priorité imposé par `CLAUDE.md` §11, en cas d'arbitrage :

1. Fonctionnalité métier
2. Fiabilité
3. Sécurité
4. Protection des données
5. Expérience utilisateur
6. Maintenabilité
7. Performance
8. Élégance du code

**Traduction concrète** : si une amélioration technique rend l'organisation d'un tournoi plus
compliquée le jour J, ce n'est pas une amélioration — elle est refusée ou repensée.

---

## 5. CE QUI EST HORS PÉRIMÈTRE (jusqu'à décision contraire)

| Élément | Pourquoi |
|---|---|
| Le dépôt `boutique-r92` (site vitrine) | Autre dépôt, autre cycle. À trancher — voir D-005 dans `DECISIONS.md` |
| La conformité réglementaire FFR | Traitée par `AUDIT-TOURNOI-R92.md`, chantier distinct — voir D-003 |
| Toute réécriture complète de l'application | Interdite par `CLAUDE.md` §2 et §10 |
| Tout changement de technologie | Interdit sans justification explicite (`CLAUDE.md` §10) |

---

## 6. FICHES DE CHANTIER RÉDIGÉES

> **Comment lire les identifiants** : `C-00X` est un **identifiant, pas un rang**. Il est attribué
> au moment où la fiche est écrite, pas selon l'ordre d'exécution. **L'ordre réel se lit dans le
> champ « Dépendances »** de chaque fiche.

**Ordre d'exécution connu à ce jour**, du premier au dernier :

```
lot ① des tests (D-025)  →  R-042  →  C-002 (niveau 1)  →  C-003 (niveau 2)

C-004 (repos minimal saisissable) — indépendant, à tout moment, mais AVANT C-003
```

---

### C-002 — 🌩️ Le tournoi qui s'arrête · **niveau 1 : l'état et sa visibilité**

> ⚠️ **Esquisse.** Cette fiche est écrite parce que **C-003 en dépend** et ne peut pas être planifié
> dans le vide. Elle sera complétée au **volet ③**, avec les six points ouverts de `DECISIONS.md`
> D-030 §5 tranchés.

- **Problème** (en langage simple) : quand l'orage arrête le tournoi, l'application continue
  d'afficher un programme qui n'aura pas lieu. Les matchs à venir restent saisissables, le match en
  cours n'est pas verrouillé, et rien n'explique quoi que ce soit aux familles.
- **Risques couverts** : **R-089** *(partie 1)* · rejoint **R-015**, **R-016**, **R-047**
  *(le filet côté serveur)* · **R-051**, **R-052** *(faire parler l'application)*
- **Priorité** : **P1**
- **Bénéfice** : le jour où ça arrive, l'organisateur appuie sur un bouton. Tout se fige, la page
  publique l'explique, et **rien ne peut plus être saisi par erreur**.
- **Risque de la correction** : **moyen.** Touche la saisie du score et le calcul du classement
  *(« aucun classement final si annulé »)* — d'où ses deux prérequis.
- **Fichiers concernés** : `backend/Code.gs` *(état, garde-fous, instantané public)* ·
  `backend/Tests.gs` · `frontend/js/admin-*.js` · la page publique · la page de saisie
- **Dépendances** : **lot ① des tests (D-025)** → **R-042**
- **Statut** : **PLANIFIÉ**
- **Validation de Romain** : ✅ **oui** — décision **D-030**, 2026-08-05
- **Commit** : —

---

### C-003 — 🌩️ Le tournoi qui s'arrête · **niveau 2 : les scénarios de reprise**

- **Problème** (en langage simple) :
  > Le tournoi a été suspendu à 11 h 20. Il reste **23 matchs** et **2 h 40** avant que les terrains
  > ferment. **Aujourd'hui, personne ne sait dire ce qui rentre.** L'organisateur décide de tête,
  > sous la pluie, avec deux cents personnes qui attendent une réponse.
  >
  > Ce chantier fait faire ce calcul par la machine : elle **propose** deux ou trois combinaisons
  > chiffrées, l'organisateur **choisit**.

- **Risques couverts** : **R-089** *(partie 2)* · **R-003** — ⚠️ **le niveau 3 de D-013**, celui qui
  avait été écarté *(« rendre un terrain indisponible et laisser l'application redistribuer »)*.
  **Les deux ne doivent jamais être faits séparément** : ils ouvrent le même code.

- **Priorité** : **P1** *(hérité de R-089)* — mais **le dernier de la file d'exécution**.

- **Bénéfice** : une décision prise en **trente secondes sur des chiffres**, au lieu d'un pari.

- **Risque de la correction elle-même** : ⚠️⚠️ **c'est le chantier le plus risqué de tout le plan.**
  `calculerPlanning` *(`backend/Code.gs:6953`, **224 lignes**)* est le cœur qui décide **quel match
  se joue où et quand**. Une régression ici **ne se voit pas** : elle ne plante pas, elle produit un
  planning **plausible et faux**.

> ⚠️ **Cette section a été RÉÉCRITE le 2026-08-05**, après une précision de Romain. La version du
> matin traitait le repos méridien de 60 min comme un **verrou infranchissable** — c'était une
> erreur de cadrage de ma part. **Le cadre qui fait foi est `DECISIONS.md` D-030 §9** ; ce qui suit
> l'applique.

#### 🔒 CONTRAINTES — aucun scénario proposé ne peut les franchir

| # | Contrainte | Origine | État aujourd'hui |
|---|---|---|---|
| ⛔ **1** | Une équipe ne joue **jamais deux rencontres en même temps** | Physique | ✅ Déjà tenu par le planificateur |
| ⛔ **2** | **Le temps de jeu maximal applicable** | **Réglementaire** *(réponse à I-21)* | ⚠️ **Simple AFFICHAGE.** `plafond_joueur_min` est lu de `RefFFR_Temps`, montré dans l'écran de conformité avec la mention « (sécurité) » et injecté dans un prévisionnel — **mais rien dans `calculerPlanning` ne refuse un planning qui le dépasse** → **à transformer en contrôle réel : c'est du travail, pas un branchement** |
| ⛔ **3** | **La cohérence du repos entre adversaires** | Sécurité + équité | Tenue par la **forme** du planning |
| ⛔ **4** | **Une équipe reposée n'affronte jamais une équipe qui ne l'est pas encore** | **Règle déjà implémentée par Romain — elle doit impérativement rester** | ⚠️ **Garantie par CONSTRUCTION, vérifiée nulle part.** Elle vient de l'ordre des blocs : matin *(inter-vagues, tous frais)* → vague 1 en pause pendant que la vague 2 joue **ses matchs internes** → l'inverse → après-midi *(inter-vagues, tous ayant déjeuné)*. **Un levier qui réorganiserait librement les rencontres la casserait EN SILENCE** |
| ⛔ **5** | **Aucune phase finale** | **Réglementaire** *(réponse à I-21)* | À écrire. *(Le sort d'un COUPE_PLATEAU déjà prévu = point ouvert (f) de D-030 §5)* |
| ⛔ **6** | Toute autre contrainte réglementaire explicitement applicable | Ouvert par construction | — |

#### 🔧 LEVIERS — du moins au plus intrusif, et on ne monte que si nécessaire

| Ordre | Levier | Réglage concerné | Touche au jeu ? | Qui décide |
|---|---|---|---|---|
| **1** | Réduire les **battements logistiques** entre matchs | `battement_terrain_min` *(5 min par défaut)* | ❌ Non | Le moteur propose |
| **2** | Réduire ou supprimer des **marges entre les séquences** | ordonnancement | ❌ Non | Le moteur propose |
| **3** | **Réorganiser les rencontres** sur les terrains disponibles | affectation | ❌ Non | Le moteur propose — ⚠️ **en conservant la structure en 4 blocs** *(contrainte 4)* |
| **4** | Modifier le **nombre de périodes** d'un match | `format_mi_temps` | ⚠️ Oui | Le moteur propose, **sous la contrainte 2** |
| **5** | Réduire la **durée des périodes** ou la durée totale | `duree_mi_temps_min` | ⚠️ Oui | Le moteur propose, **sous la contrainte 2** |
| **6** | Ajuster certaines **marges de récupération** | `recup_entre_matchs_min` | ⚠️ Oui — repos d'enfants | Le moteur propose, **sous les contraintes 3 et 4** |
| **7** | Modifier le **repos minimal configuré** de la pause échelonnée | `repos` — *à rendre saisissable, chantier **C-004*** | ⚠️ Oui — sécurité | 🔴 **UNIQUEMENT par décision explicite de l'organisateur.** Le moteur peut **montrer** ce que ça débloquerait ; il ne l'applique **jamais** seul |
| **8** | **Retirer des rencontres** de la reprise | le planning | ⚠️ Oui — équité sportive | 🔴 **Dernier recours**, annoncé comme tel. Les équipes n'auront pas joué le même nombre de matchs — la colonne « J » du classement existe déjà pour le montrer |

#### Les cinq principes *(D-030 §9.3)*

1. **conserver autant que possible les contraintes initiales** ;
2. **utiliser d'abord les leviers les moins intrusifs** ;
3. **n'utiliser un levier plus important que si nécessaire** — et le dire ;
4. **ne jamais franchir une contrainte de sécurité ou réglementaire impérative** ;
5. **quand une contrainte CONFIGURABLE doit changer, demander une décision explicite** — jamais la
   modifier automatiquement.

#### Trois règles de conception qui en découlent

1. ⭐ **Le moteur n'a pas le droit de conclure « impossible » avant d'avoir parcouru les huit
   leviers.** C'est l'exigence centrale de ce chantier, et elle rejoint **D-027** *(un message ne
   ment jamais)* : annoncer *« la reprise est impossible »* sans avoir cherché **serait un message
   qui ment** ;
2. **Le moteur propose, l'organisateur tranche** — identique à **D-013** *(« le jour J,
   l'organisateur en sait plus que l'algorithme »)*. Chaque scénario annonce **quels leviers il a
   utilisés et jusqu'où**, pour qu'on choisisse en connaissance de cause ;
3. **Le choix retenu laisse une trace** : qui a choisi quel scénario, à quelle heure, et **quelles
   valeurs configurables ont été modifiées**. Même exigence que R-017 *(savoir qui a fait quoi)* —
   et elle coûte une ligne si on y pense maintenant.

#### Stratégie de test

- **Cœur pur** : le calcul des scénarios reçoit ses données en paramètre et **ne touche pas au
  classeur**. C'est ce qui rend les 589 vérifications existantes exécutables **hors de Google**, en
  une seconde ;
- un test **par contrainte** : aucun scénario proposé ne dépasse le **temps de jeu maximal** · aucun
  ne contient de **phase finale** · aucun ne fait jouer une équipe **deux fois en même temps** ;
- ⭐ un test **d'équité, qui n'existe pas aujourd'hui** : dans tout scénario, **aucun match n'oppose
  une équipe déjà reposée à une équipe qui ne l'est pas encore**. C'est la contrainte 4 — elle est
  aujourd'hui garantie par la **forme** du planning et **vérifiée nulle part**. Ce test la rend
  **prouvable**, ce qui est le préalable de tout levier de réorganisation ;
- un test : **le repos réellement obtenu est ≥ à la valeur configurée** — quelle qu'elle soit, pas
  seulement 60 ;
- ⭐ un test **d'escalade** : sur un retard qui se rattrape avec le levier 1 seul, **les leviers 2 à
  8 ne sont pas utilisés**. C'est ce qui prouve le principe *« du moins au plus intrusif »* ;
- ⭐ un test **d'épuisement** : le moteur ne conclut *« impossible »* **qu'après** avoir essayé les
  huit leviers — et il **dit lesquels** ;
- un test : le levier 7 *(le repos configuré)* **n'est jamais appliqué sans décision explicite** ;
- un test : **un format inventé ne produit aucun scénario** *(protège la forme de la règle, pas son
  contenu)* ;
- un test : **zéro minute disponible → aucun scénario, et un message clair** — pas une liste vide
  qu'on prendrait pour un bug.

#### ⭐ Vérifications de non-régression — la première conditionne tout le chantier

> **Sans suspension, `calculerPlanning` doit produire EXACTEMENT le même planning qu'avant** —
> comparaison **caractère par caractère** sur un tournoi de référence.
> **Si ce test n'existe pas, ce chantier ne commence pas.** C'est la seule protection réelle contre
> une régression qui ne se voit pas.

Puis, dans l'ordre : les **quatre formats d'après-midi** *(CROISE, CROISE_DIAGONAL, LIBRE,
COUPE_PLATEAU)* · le **Super Challenge** *(samedi poules, dimanche brassage)* · la **pause
méridienne échelonnée** *(les deux vagues, le repos garanti)* · la **génération de l'après-midi**
à partir du classement du matin.

- **Dépendances** *(ordre strict)* :
  1. **lot ① des tests** (R-041, **D-025**) ;
  2. **R-042** ;
  3. **C-002** — sans état SUSPENDU, il n'y a **rien à reprendre** ;
  4. **C-004** — le levier n° 7 suppose que le repos minimal soit **saisissable**. *(C-004 est
     indépendant et peut être fait bien avant.)* ;
  5. ~~**I-21**~~ ✅ **LEVÉE le 2026-08-05**.
- **Statut** : **PLANIFIÉ**
- **Validation de Romain** : ✅ **oui** — décision **D-030** *(+ réponse I-21 et précision du cadre
  de reprise, D-030 §9)*, 2026-08-05
- **Commit** : —

> ⚠️ **Ce que cette fiche ne fait pas** : elle ne décide **pas** des planchers *(battement minimal,
> récupération minimale, repos minimal réglementaire — point ouvert **(g)** de D-030 §5)*. Ce sont
> des **choix de terrain**, à trancher avec Romain à l'ouverture du chantier — pas des constantes à
> choisir en écrivant le code.

---

### C-004 — ⏱️ Rendre **saisissable** le temps de repos minimal de la pause échelonnée

> **Petit chantier, indépendant, et utile même sans aucune suspension.** Il naît de la précision de
> Romain du 2026-08-05 : *« lorsque l'organisateur choisit un fonctionnement avec des pauses
> méridiennes échelonnées, c'est à ce moment-là qu'il doit pouvoir définir le temps de repos minimal
> à respecter. »*

- **Problème** (en langage simple) : le repos minimal entre les deux vagues de la pause de midi est
  **fixé à 60 minutes dans le code**. Aucun écran ne permet de le changer. Or ce n'est pas une
  constante de la nature : c'est **un choix d'organisateur**, qui dépend du terrain, des catégories
  et de la journée.

- ⚠️ **ET IL Y A PIRE — un champ existant est ignoré en silence** *(constaté le 2026-08-05)* :

  | | Comportement réel |
  |---|---|
  | **Pause classique** *(tout le monde s'arrête ensemble)* | ✅ Le champ **« Pause déjeuner — durée (min) »** *(`pause_dejeuner_duree_min`, défaut 60)* **fonctionne** : aucun match n'est placé dans la fenêtre |
  | **Pause échelonnée** *(deux vagues)* | ❌ **Ce champ est IGNORÉ** pour les catégories concernées — le code le dit lui-même *(« sans pause déjeuner globale »)* — et le repos est **forcé à 60 en dur** |

  > 🔴 **Autrement dit** : un organisateur peut écrire *« Pause déjeuner — durée : 45 min »* et voir
  > les catégories en pause échelonnée appliquer **60**, **sans un mot d'avertissement**. **L'écran
  > dit une chose, le moteur en fait une autre** — exactement la famille de défauts du domaine H
  > *(ce que le code raconte de faux sur lui-même)*.

- 🎯 **Décision de conception : un champ DISTINCT, pas la réutilisation de l'existant.** Les deux
  réglages ne désignent pas la même chose :
  - **« Pause déjeuner — durée »** = une **fenêtre** pendant laquelle **personne** ne joue ;
  - **« Temps de repos minimal »** = un **minimum garanti à chaque équipe**, pendant que **l'autre
    vague joue**.

  > Réutiliser le même champ ferait qu'un organisateur réglant 45 min pour une raison d'intendance
  > **raccourcirait en silence le repos des enfants**. C'est précisément le type de couplage
  > invisible que ce projet a déjà payé.

  **L'écran cible** *(formulation de Romain)* :

  ```
  ☑ Pause méridienne échelonnée
      → Temps de repos minimal : [ 60 ] min
  ```

  Le champ **n'apparaît que si la case est cochée**, et l'ancien champ « durée » est **estompé pour
  les catégories concernées**, puisqu'il ne s'y applique pas. *(L'écran porte déjà une bascule de
  libellé selon le mode — la plomberie existe.)*

- **Ce que ça donne concrètement**, dans la page de configuration horaire :

  ```
  ☑ Pause méridienne échelonnée
      → Temps de repos minimal : [ 60 ] min
  ```

  Cette valeur **devient une contrainte du planning**.

- **Risques couverts** : préalable du **levier n° 7** de **C-003** · **referme l'écart entre le
  champ affiché et le comportement réel** *(ci-dessus)* · confort d'organisation immédiat, hors de
  toute suspension.
- **Priorité** : **P2** — mais pour une raison qui a changé. Ce n'est plus seulement *« 60 est une
  valeur raisonnable »* : c'est qu'aujourd'hui **un réglage affiché n'a pas l'effet annoncé**. Le
  risque reste faible *(60 est plus protecteur que ce que l'organisateur aurait choisi)*, mais
  **c'est un écran qui ment**. → **P1 dès qu'on veut C-003**, dont il est le préalable.

- ⚡ **Bénéfice / coût — c'est la bonne surprise** : le cœur de calcul **est déjà prêt**.
  `planifierCategorieEchelonnee` **reçoit déjà le repos en paramètre** *(`opts.repos`, avec 60 comme
  valeur par défaut)*, et il existe même déjà un **avertissement** pour le cas dégénéré où le repos
  réel tomberait sous le seuil demandé. **Seul l'appelant passe la valeur en dur.** Il n'y a donc
  **rien à changer dans l'algorithme** — un champ, sa lecture, son passage.

- **Risque de la correction** : **faible**, mais **non nul** : cela touche l'appel du planificateur.
  D'où la vérification de non-régression ci-dessous, qui n'est pas négociable.

- **Fichiers concernés** : `backend/Code.gs` *(le réglage horaire, l'appel de
  `planifierCategorieEchelonnee`)* · `backend/Tests.gs` · l'écran de configuration horaire du
  frontend.

- **Migration douce** — la règle constante de ce projet : **valeur absente ⇒ 60**, exactement le
  comportement actuel. Un tournoi déjà configuré ne bouge pas d'une minute.

- **Stratégie de test** :
  - ⭐ **valeur absente ou vide ⇒ planning identique à aujourd'hui, caractère par caractère** ;
  - une valeur saisie ⇒ le repos réellement obtenu est **≥ à cette valeur** ;
  - une valeur aberrante *(0, négative, texte)* ⇒ **repli prudent sur 60**, jamais un plantage ;
  - l'avertissement du cas dégénéré **fonctionne toujours** avec une valeur autre que 60 ;
  - ⭐ **le nouveau champ et `pause_dejeuner_duree_min` restent INDÉPENDANTS** : changer l'un ne
    déplace jamais l'autre. C'est le test qui protège la décision de conception ci-dessus.

- **Vérifications de non-régression** : la **pause échelonnée** *(les deux vagues, l'équité, le
  repos garanti)* · les catégories **sans** pause échelonnée, qui ne doivent pas être effleurées.

- **Dépendances** : **aucune.** ✅ **Ce chantier peut être fait à tout moment**, y compris avant
  C-002 et C-003.
- **Statut** : **PLANIFIÉ**
- **Validation de Romain** : ✅ **oui** — précision du 2026-08-05
- **Commit** : —

> ❓ **Le seul point à trancher** : faut-il un **plancher** sous lequel l'application avertit
> l'organisateur ? Cela suppose de savoir s'il existe une **durée de repos minimale réglementaire**
> en École de Rugby — **point ouvert (g)** de D-030 §5, à poser dans le même courriel que **I-10**.
> ⚠️ **Cela ne bloque pas C-004** : sans cette réponse, le champ existe et fonctionne ; il n'avertit
> simplement pas.
