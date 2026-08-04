# PLAN D'INDUSTRIALISATION — Tournoi R92

> Ce fichier contient le **plan global**. Il évolue au fur et à mesure des audits.
> Tant que l'audit (ÉTAPE 2) n'a pas eu lieu, le tableau des chantiers reste **vide** :
> on ne planifie pas des travaux qu'on n'a pas encore constatés.

**Dernière mise à jour** : 2026-08-04 (session 1)

---

## 1. LES 6 ÉTAPES (cadre fixé par `CLAUDE.md`)

| Étape | Nom | Ce qu'elle produit | Statut |
|---|---|---|---|
| 0 | Mise en place du suivi | `CLAUDE.md` + `docs/industrialisation/` | ✅ TERMINÉE |
| 1 | **Cartographie** | Comprendre le projet, en langage simple. Aucune modification. | ⬜ À FAIRE |
| 2 | **Audit global** | Rapport des 8 domaines, problèmes classés P0/P1/P2/P3. Aucune modification. | ⬜ À faire |
| 3 | **Plan priorisé** | Le tableau des chantiers ci-dessous, rempli | ⬜ À faire |
| 4 | **Validation** | Accord explicite de Romain, chantier par chantier | ⬜ À faire |
| 5 | **Implémentation** | Une modification cohérente à la fois | ⬜ À faire |
| 6 | **Commit** | Un commit atomique par chantier validé | ⬜ À faire |

> **Règle** : on ne passe pas à l'étape suivante sans que la précédente soit terminée **et**
> que Romain ait donné son accord quand une validation est requise.

---

## 2. LES 8 DOMAINES D'AUDIT — AVANCEMENT

| Domaine | Nom | Statut | Session |
|---|---|---|---|
| A | Métier / Product Owner | ⬜ Non commencé | — |
| B | RGPD / Protection des données | ⬜ Non commencé | — |
| C | Sécurité | ⬜ Non commencé | — |
| D | QA / Tests | ⬜ Non commencé | — |
| E | UX / UI / Accessibilité | ⬜ Non commencé | — |
| F | Performance | ⬜ Non commencé | — |
| G | Architecture / Maintenabilité | ⬜ Non commencé | — |
| H | Qualité du code | ⬜ Non commencé | — |

> **Ordre d'audit recommandé** (à valider en fin d'ÉTAPE 1) : A → C → B → D → E → F → G → H.
> Raison : le métier d'abord (c'est la priorité n°1 du prompt maître), puis ce qui peut faire du
> mal (sécurité, données personnelles), puis ce qui prouve (tests), puis le confort.
> **Non validé à ce stade.**

---

## 3. TABLEAU DES CHANTIERS

> Se remplit à l'ÉTAPE 3, à partir de `RISQUES.md`.
> Un chantier = un ensemble de corrections qui doivent être faites **ensemble**.

| ID | Chantier | Priorité | Statut | Dépend de | Validé par Romain | Implémenté | Testé |
|---|---|---|---|---|---|---|---|
| — | *(aucun chantier — audit non commencé)* | — | — | — | — | — | — |

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
