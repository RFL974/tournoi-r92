# PLAN D'INDUSTRIALISATION — Tournoi R92

> Ce fichier contient le **plan global**. Il évolue au fur et à mesure des audits.
> Tant que l'audit (ÉTAPE 2) n'a pas eu lieu, le tableau des chantiers reste **vide** :
> on ne planifie pas des travaux qu'on n'a pas encore constatés.

**Dernière mise à jour** : 2026-08-05 (session 11)

---

## 1. LES 6 ÉTAPES (cadre fixé par `CLAUDE.md`)

| Étape | Nom | Ce qu'elle produit | Statut |
|---|---|---|---|
| 0 | Mise en place du suivi | `CLAUDE.md` + `docs/industrialisation/` | ✅ TERMINÉE |
| 1 | **Cartographie** | Comprendre le projet, en langage simple. Aucune modification. → `CARTOGRAPHIE.md` | ✅ **TERMINÉE** (volets A, B et C) |
| 2 | **Audit global** | Rapport des 8 domaines, problèmes classés P0/P1/P2/P3. Aucune modification. → `AUDIT.md` + `RISQUES.md` | 🟡 **EN COURS** — A, C, B, D, E, F et G faits (**7 sur 8**) |
| 3 | **Plan priorisé** | Le tableau des chantiers ci-dessous, rempli | ⬜ À faire |
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
| H | Qualité du code | ⬜ **Prochain — dernier domaine** | — |

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

> **Pourquoi ce tableau ne contient-il qu'une ligne, alors que 81 problèmes sont identifiés ?**
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
| **⛔️ Ce qui NE doit PAS être groupé** | ~~R-074~~, **R-076**, **R-077**, **R-081** | Des problèmes qui se **ressemblent** (découper, ranger, outiller) et qu'il serait tentant de traiter ensemble. **Ils ne doivent pas l'être** : chacun, fait en bloc, aggrave un problème plus grave que lui — renommer 277 tests fait perdre un test en silence, découper l'admin exige l'outillage que `CLAUDE.md` §10 déconseille. **Progressif et réversible, ou rien.** ✅ **R-074 est sorti de cette liste : il est ARBITRÉ** (**D-028**, 2026-08-05) — on ne découpe pas `Code.gs` tant que le dépôt est manuel |

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
