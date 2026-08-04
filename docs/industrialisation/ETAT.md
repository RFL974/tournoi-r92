# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-04 (session 1)
**Commit de référence** : `6e4f3c2` (branche `main`, dépôt propre)

---

## 1. EN UNE PHRASE

Le **système de travail** est en place ; **aucune analyse du projet n'a encore été faite** dans ce
cadre.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | ⬜ **À FAIRE** — prochaine étape |
| 2 | ÉTAPE 2 — Audit global (8 domaines, P0→P3) | ⬜ À faire |
| 3 | ÉTAPE 3 — Plan d'industrialisation priorisé | ⬜ À faire |
| 4 | ÉTAPE 4 — Validation par Romain | ⬜ À faire |
| 5 | ÉTAPE 5 — Implémentation par petites unités | ⬜ À faire |
| 6 | ÉTAPE 6 — Commits atomiques | ⬜ À faire |

---

## 3. PHASE EN COURS

**Aucune.** La session 1 est terminée et attend l'instruction de Romain pour démarrer la session 2.

---

## 4. PROCHAINE ÉTAPE

**Session 2 — ÉTAPE 1 : CARTOGRAPHIE.**

Objectif : lire le projet **sans rien modifier**, et produire une explication en langage simple de :

- l'architecture actuelle (qui parle à qui) ;
- les fonctionnalités existantes ;
- les flux de données principaux (par où passe une information, de la saisie à l'affichage) ;
- les dépendances entre parties ;
- les points critiques ;
- les données manipulées (dont les données personnelles).

**Condition de démarrage** : instruction explicite de Romain.

---

## 5. CORRECTIONS DÉJÀ RÉALISÉES DANS CE CADRE

**Aucune.** Aucun fichier de l'application n'a été modifié à ce jour dans le cadre de
l'industrialisation.

> ⚠️ Le projet a une longue histoire de corrections **antérieures** à ce cadre (voir `CHANGELOG.md`
> et l'historique Git). Elles ne sont **pas** considérées comme vérifiées par ce chantier tant que
> l'audit ne les a pas reprises.

---

## 6. PROBLÈMES RESTANT À TRAITER

**Inconnu à ce stade** — l'audit n'a pas commencé. `RISQUES.md` est vide de tout constat.

---

## 7. DÉCISIONS VALIDÉES

| Réf | Décision | Statut |
|---|---|---|
| D-001 | Le cadre de travail est `CLAUDE.md` + `docs/industrialisation/` | ✅ Validée |
| D-002 | Une session = un objectif précis, puis arrêt | ✅ Validée |
| D-003 | Audit FFR et industrialisation restent **deux chantiers séparés** : l'un traite la règle du jeu, l'autre la solidité de l'outil | ✅ Validée |
| D-004 | Messages de commit : convention existante conservée — `type(scope): description en français` | ✅ Validée |
| D-006 | Documentation → commit direct sur `main` ; code de l'application → branche + PR + validation préalable | ✅ Validée |

**En attente de validation** (voir `DECISIONS.md`) :

- D-005 — Périmètre exact du dépôt à auditer (le site vitrine `boutique-r92` est un **autre** dépôt)

---

## 8. POINTS INCONNUS

Ces points sont **INCONNU** au sens de la règle de transparence : impossibles à établir sans
vérification supplémentaire.

| # | Point inconnu | Pourquoi | Comment le lever |
|---|---|---|---|
| I-01 | Le code réellement en service chez Google est-il identique à `backend/Code.gs` ? | Le backend s'exécute chez Google, hors du dépôt | Vérification manuelle par Romain dans Apps Script |
| I-02 | Les tests du fichier `backend/Tests.gs` passent-ils aujourd'hui ? | Ils ne peuvent être exécutés que dans Google Apps Script | Lancement manuel par Romain |
| I-03 | Quelles données personnelles réelles sont présentes dans le Google Sheet en production ? | Le Sheet n'est pas dans le dépôt | À examiner avec Romain (domaine B — RGPD) |
| I-04 | L'application a-t-elle déjà servi un tournoi réel, ou seulement des tests ? | Non déterminable depuis le code | Question à Romain |
| I-05 | Qui utilise l'administration le jour J, et sur quel matériel ? | Information de terrain | Question à Romain (domaine E — UX) |

---

## 9. INVENTAIRE FACTUEL DU DÉPÔT (constaté, non analysé)

> Simple relevé de ce qui existe. **Ce n'est pas une cartographie** : rien n'a été lu ni compris à
> ce stade.

| Élément | Constat |
|---|---|
| `backend/Code.gs` | ~427 000 caractères |
| `backend/Tests.gs` | ~216 000 caractères |
| `frontend/` | 8 pages HTML, dossiers `js/` (29 entrées), `css/` (8 entrées), `img/`, `modeles/`, `assets/` |
| `docs/` | 11 documents existants (architecture, déploiement, guide utilisateur, passation…) |
| `AUDIT-TOURNOI-R92.md` | Audit de conformité FFR, ~129 000 caractères, méthode par sessions propre |
| `CHANGELOG.md` | ~197 000 caractères |
| `.github/workflows/pages.yml` | 1 automatisation de publication |
| `cloudflare/` | 1 dossier |
| Historique Git | branche `main`, dernier commit `6e4f3c2`, dépôt **propre** |
