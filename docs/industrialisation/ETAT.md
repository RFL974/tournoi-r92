# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-04 (session 2)
**Commit de référence** : `beb12d6` (branche `claude/industrialisation-phase2-cartographie-usis7l`)

---

## 1. EN UNE PHRASE

Le **squelette** de l'application est cartographié et expliqué
(`CARTOGRAPHIE.md`, volet A) ; **aucun audit n'a encore été fait** et **aucun fichier de
l'application n'a été modifié**.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | 🟡 **EN COURS** — volet A fait (session 2), volets B et C à faire |
| 2 | ÉTAPE 2 — Audit global (8 domaines, P0→P3) | ⬜ À faire |
| 3 | ÉTAPE 3 — Plan d'industrialisation priorisé | ⬜ À faire |
| 4 | ÉTAPE 4 — Validation par Romain | ⬜ À faire |
| 5 | ÉTAPE 5 — Implémentation par petites unités | ⬜ À faire |
| 6 | ÉTAPE 6 — Commits atomiques | ⬜ À faire |

---

## 3. PHASE EN COURS

**ÉTAPE 1 — Cartographie**, découpée en trois volets :

| Volet | Contenu | Statut |
|---|---|---|
| A — Le squelette | De quoi l'application est faite, où ça tourne, comment ça se parle, comment le code arrive en ligne | ✅ **FAIT** (session 2) |
| B — Les fonctionnalités | Ce que l'application sait faire, écran par écran | ⬜ À faire |
| C — Les données | Ce qui est stocké, où, combien de temps, et ce qui touche à la vie privée | ⬜ À faire |

---

## 4. PROCHAINE ÉTAPE

**Session 3 — ÉTAPE 1, volet B : les fonctionnalités.**

Objectif : parcourir ce que l'application **sait faire**, du premier réglage jusqu'au tournoi
terminé — les 14 écrans de l'administration, la saisie des scores, la page publique, le parcours
d'invitation des clubs — et l'expliquer en langage simple. **Toujours sans rien modifier.**

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

**L'audit n'a pas commencé** : aucun problème n'est classé P0/P1/P2/P3 à ce jour.

La session 2 a toutefois relevé **13 points d'attention** (A-01 à A-13) en cartographiant le
squelette. Ce sont des **observations**, pas des verdicts : ils sont listés dans
`CARTOGRAPHIE.md` §A.10 et seront classés à l'ÉTAPE 2.

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
| I-06 | Comment le Google Sheet est-il réellement partagé ? | Les réglages de partage vivent chez Google, pas dans le dépôt. Or l'identifiant du classeur, lui, est public (`Code.gs` ligne 15) | Vérification par Romain : Sheet → Partager → la ligne « Accès général » doit être **Restreint**, jamais « Toute personne disposant du lien » |
| I-07 | Les 4 onglets `RefFFR_*` existent-ils et sont-ils à jour dans le classeur ? | Aucun code ne les crée : ils sont remplis à la main. Le programme se contente de renvoyer une liste vide s'ils manquent | Vérification par Romain dans le classeur |

---

## 9. INVENTAIRE FACTUEL DU DÉPÔT (constaté)

> Relevé chiffré de ce qui existe. Complété en session 2 par la lecture réelle des fichiers.
> L'explication de **ce que tout cela fait** est dans `CARTOGRAPHIE.md`.

| Élément | Constat |
|---|---|
| `backend/Code.gs` | ~427 000 caractères — **8 030 lignes, 274 fonctions, un seul fichier** |
| `backend/Tests.gs` | ~216 000 caractères — **3 594 lignes, 301 fonctions** (exécutables uniquement dans Apps Script) |
| Points d'entrée backend | `doGet` (ligne 313) = **15 actions de lecture** · `doPost` (ligne 2801) = **50 actions** |
| Onglets du Google Sheet | jusqu'à **12** (7 créés par `setupSheet`, `Mesures` à la demande, 4 `RefFFR_*` remplis à la main) |
| `frontend/` | 8 pages HTML, **26 fichiers JS** (+ 4 bibliothèques dans `js/vendor/`), 6 feuilles CSS |
| Frontend — code | **693 fonctions globales** dans un espace unique ; 8 noms en double, **sans collision effective aujourd'hui** |
| Outillage | **aucun** `package.json`, aucune étape de construction, aucune vérification automatique |
| `docs/` | 11 documents existants (architecture, déploiement, guide utilisateur, passation…) |
| `AUDIT-TOURNOI-R92.md` | Audit de conformité FFR, ~129 000 caractères, méthode par sessions propre |
| `CHANGELOG.md` | ~197 000 caractères |
| `.github/workflows/pages.yml` | 1 automatisation de publication |
| `cloudflare/` | 1 dossier |
| Historique Git | branche `main`, dernier commit `6e4f3c2`, dépôt **propre** |
