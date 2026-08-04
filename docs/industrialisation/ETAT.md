# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-04 (session 3)
**Commit de référence** : `c6b3cf3` (branche `claude/cartographie-volet-b-fonctionnalites-busrpe`)

---

## 1. EN UNE PHRASE

Le **squelette** (volet A) et les **fonctionnalités** (volet B) de l'application sont
cartographiés et expliqués dans `CARTOGRAPHIE.md` ; il reste le volet C (les données).
**Aucun audit n'a encore été fait** et **aucun fichier de l'application n'a été modifié**.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | 🟡 **EN COURS** — volets A (session 2) et B (session 3) faits, volet C à faire |
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
| B — Les fonctionnalités | Ce que l'application sait faire, écran par écran | ✅ **FAIT** (session 3) |
| C — Les données | Ce qui est stocké, où, combien de temps, et ce qui touche à la vie privée | ⬜ À faire |

---

## 4. PROCHAINE ÉTAPE

**Session 4 — ÉTAPE 1, volet C : les données.** *(dernier volet de la cartographie)*

Objectif : inventorier **ce qui est stocké**, onglet par onglet et colonne par colonne — qui peut
le voir, combien de temps cela reste, et ce qui relève de la **vie privée** (contacts de clubs,
effectifs d'enfants mineurs, images, relevés de visibilité). Ce volet prépare directement le
domaine B (RGPD) de l'ÉTAPE 2, **sans le remplacer** : il décrit, il ne juge pas.
**Toujours sans rien modifier.**

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

La cartographie a toutefois relevé **26 points d'attention**, qui sont des **observations**, pas
des verdicts. Ils seront classés à l'ÉTAPE 2 :

- **A-01 à A-14** (session 2, le squelette) → `CARTOGRAPHIE.md` §A.10 ;
- **B-01 à B-12** (session 3, les fonctionnalités) → `CARTOGRAPHIE.md` §B.12.

Le plus structurant du volet B est **B-03** : le garde-fou qui empêche d'effacer tous les scores en
regénérant les poules vit **uniquement dans le navigateur**, alors que des protections comparables
(réorganisation des poules, gel des réponses à J-16) sont, elles, tenues par le serveur.

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
| I-03 | Quelles données personnelles de **tiers** seront présentes dans le Google Sheet une fois de vrais clubs invités ? | ✅ **Rien à ce jour** (précisé par Romain le 2026-08-04) : les seules adresses email présentes sont **la sienne et celle de son épouse**, utilisées pour tester les envois. Aucune donnée d'un tiers extérieur. La question reste ouverte pour **l'avenir** : l'application est conçue pour collecter les coordonnées de contacts de clubs, et le fera dès la première invitation réelle | Inventaire de ce que l'application **est capable de collecter** au **volet C**, puis instruction au **domaine B (RGPD)** — **avant** la première invitation réelle |
| I-05 | Qui utilise l'administration le jour J, et sur quel matériel ? | Information de terrain | Question à Romain (domaine E — UX) |

### Points levés

| # | Point | Réponse | Levé le |
|---|---|---|---|
| **I-06** | Comment le Google Sheet est-il réellement partagé ? | ✅ **LEVÉ — le classeur est PRIVÉ.** Romain a fourni une capture du panneau Drive de « Tournoi R92 - Base de données » : *Qui a accès → **Privé*** (propriétaire seul), et *Limites de sécurité → aucune limite appliquée*. L'identifiant du classeur est donc public dans le dépôt **sans que cela expose les données** : le connaître ne suffit pas à ouvrir le fichier. C'est le réglage attendu. Cela confirme aussi que la Web App s'exécute bien **au nom du propriétaire** — c'est ce qui lui permet de lire un classeur privé au profit de visiteurs qui, eux, n'y ont aucun accès. | 2026-08-04, session 2 |
| **I-07** | Les 4 onglets `RefFFR_*` existent-ils et sont-ils à jour ? | ✅ **LEVÉ — les 4 onglets existent, aux noms exacts attendus.** Capture du bas du classeur fournie par Romain : `RefFFR_Formes`, `RefFFR_Regles`, `RefFFR_Temps`, `RefFFR_Dates` — orthographe **identique** à ce que lit `Code.gs`. Contenu visible cohérent (millésimes 2026-2027, formes de jeu 5x5 / 7x7). Les fichiers Drive `RefFFR-formes-de-jeu` et `RefFFR-dates-federales` sont donc des documents **sources** distincts, sans rôle dans le fonctionnement. | 2026-08-04, session 2 |
| **I-04** | L'application a-t-elle servi un tournoi réel ? | ✅ **LEVÉ — non : le tournoi actuellement en base est un tournoi de TEST.** Romain : « c'est juste un faux tournoi avec de vrais noms ». Les noms d'équipes visibles (Racing 92, Stade Français, Clamart, Meudon, Vélizy, Antony, Sèvres, Issy-les-Moulineaux) sont de vrais clubs, mais les engagements sont fictifs. | 2026-08-04, session 2 |

> ✅ **À retenir de I-03 + I-04** : le classeur ne contient **aucune donnée personnelle de tiers**
> aujourd'hui. Tournoi fictif, et les seuls emails présents sont ceux de Romain et de son épouse,
> saisis pour tester les envois.
>
> **La question n'est donc pas « faut-il réparer », mais « faut-il préparer ».** L'application est
> conçue pour collecter les coordonnées des contacts de clubs : le jour de la première invitation
> réelle, de vraies données personnelles de tiers entreront dans le classeur. Le bon moment pour
> traiter le domaine B (RGPD) est donc **avant ce jour-là**, pas après.
>
> Deux protections sont déjà constatées dans le code : le classeur est **privé** (I-06) et l'onglet
> `ClubsInvites` est **exclu** des données publiques (`getAll`) et de tout accès sans clé admin.
> Leur efficacité réelle reste **NON VÉRIFIÉE** — elle sera éprouvée au domaine B.

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
