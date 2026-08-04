# PLAN D'INDUSTRIALISATION — Tournoi R92

> Ce fichier contient le **plan global**. Il évolue au fur et à mesure des audits.
> Tant que l'audit (ÉTAPE 2) n'a pas eu lieu, le tableau des chantiers reste **vide** :
> on ne planifie pas des travaux qu'on n'a pas encore constatés.

**Dernière mise à jour** : 2026-08-04 (session 6)

---

## 1. LES 6 ÉTAPES (cadre fixé par `CLAUDE.md`)

| Étape | Nom | Ce qu'elle produit | Statut |
|---|---|---|---|
| 0 | Mise en place du suivi | `CLAUDE.md` + `docs/industrialisation/` | ✅ TERMINÉE |
| 1 | **Cartographie** | Comprendre le projet, en langage simple. Aucune modification. → `CARTOGRAPHIE.md` | ✅ **TERMINÉE** (volets A, B et C) |
| 2 | **Audit global** | Rapport des 8 domaines, problèmes classés P0/P1/P2/P3. Aucune modification. → `AUDIT.md` + `RISQUES.md` | 🟡 **EN COURS** — domaines A et C faits |
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
| B | RGPD / Protection des données | ⬜ **Prochain** | 7 |
| D | QA / Tests | ⬜ Non commencé | — |
| E | UX / UI / Accessibilité | ⬜ Non commencé | — |
| F | Performance | ⬜ Non commencé | — |
| G | Architecture / Maintenabilité | ⬜ Non commencé | — |
| H | Qualité du code | ⬜ Non commencé | — |

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

> **Pourquoi ce tableau ne contient-il qu'une ligne, alors que 27 problèmes sont identifiés ?**
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
| **Ce qui sort de l'application** | R-021, R-018 | Tous deux dépendent du domaine B (RGPD), qui vient ensuite — à ne pas figer avant |
| **Le forfait, l'annulation et le classement** | R-001, R-004, R-013, R-012 | Domaine A : même code (classement, états d'un match), même besoin de tests préalables |

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
