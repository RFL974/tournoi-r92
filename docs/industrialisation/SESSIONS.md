# JOURNAL DES SESSIONS — Industrialisation de Tournoi R92

> Une ligne par session de travail. Le plus récent **en haut**.
> Ce journal sert à répondre à : « qu'est-ce qui a réellement été fait, et qu'est-ce qui ne l'a
> **pas** été ? »

---

## Modèle de fiche

```markdown
## Session N — <objectif en une phrase>

| Champ | Valeur |
|---|---|
| **Date** | AAAA-MM-JJ |
| **Objectif** | … |
| **Étape du plan** | ÉTAPE X |
| **Résultat** | ✅ Objectif atteint / ⚠️ Partiel / ❌ Bloqué |

**Travail effectué**
> …

**Fichiers analysés (lus)**
> …

**Fichiers modifiés**
> …

**Problèmes découverts** (→ ajoutés à RISQUES.md)
> …

**Tests réalisés**
> …

**Tests NON réalisés** (et pourquoi)
> …

**Décisions prises** (→ DECISIONS.md)
> …

**Commit**
> …

**Prochaine session recommandée**
> …
```

---

## Session 2 — ÉTAPE 1, volet A : cartographier le squelette de l'application

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Objectif** | Comprendre et expliquer **de quoi l'application est faite** : les morceaux qui la composent, où ils s'exécutent, comment ils communiquent, qui a le droit de quoi, et comment le code arrive en ligne. **Aucune modification de l'application.** |
| **Étape du plan** | ÉTAPE 1 — Cartographie, volet A sur 3 |
| **Résultat** | ✅ Objectif atteint |

**Travail effectué**

1. Vérification préalable demandée par Romain : `docs/industrialisation/ETAT.md` est bien présent
   dans la copie du dépôt (les 5 fichiers de suivi sont là). Branche
   `claude/industrialisation-phase2-cartographie-usis7l`, dépôt **propre**, commit `beb12d6`.
2. Lecture des 4 fichiers de suivi pour reprendre le fil laissé par la session 1.
3. Relevé structurel du dépôt : arborescence, tailles, nombre de fonctions, ordre de chargement des
   scripts de chaque page HTML, services Google utilisés, onglets du classeur, clés de cache,
   propriétés de script, workflow de publication.
4. Lecture ciblée des points d'entrée : `doGet` (`Code.gs` l. 313), `doPost` (l. 2801), les tables
   d'actions (`ACTIONS_SCORES`, `ACTIONS_TOKEN`, `ACTIONS_LECTURE`), la vérification de clé,
   `config.js`, `api.js`, le relais Cloudflare, `.github/workflows/pages.yml`.
5. Vérification **factuelle** des 8 noms de fonctions en double du frontend : contrôle page par page
   qu'aucune page ne charge deux fichiers en conflit → **aucune collision effective aujourd'hui**.
6. Rédaction de `docs/industrialisation/CARTOGRAPHIE.md`, volet A (12 sections), en langage simple.
7. Mise à jour de `ETAT.md`, `PLAN.md` (découpage de l'ÉTAPE 1 en trois volets) et `SESSIONS.md`.

**Fichiers analysés (lus)**

- `backend/Code.gs` — lecture ciblée (~600 lignes sur 8 030) : en-tête et définition des onglets,
  `doGet`, `doPost`, sécurité des clés, anti-force-brute, snapshot public, partenaires
- `backend/README.md`
- `frontend/js/config.js` et `frontend/js/api.js` — **intégralement**
- `frontend/*.html` — ordre de chargement des scripts et rôle de chaque page
- `cloudflare/worker-tournoi.js` — intégralement
- `.github/workflows/pages.yml`, `.gitignore`, `.claude/launch.json`, `.claude/serveur-preview.js`
- `docs/architecture.md`, `docs/deploiement.md` — intégralement
- Relevés automatiques sur les 26 fichiers de `frontend/js/` (fonctions, appels API, stockage local)

> Non lus à ce stade : le corps des 274 fonctions de `Code.gs`, `Tests.gs`, le détail des fichiers
> `admin-*.js` (→ volet B), `structure-google-sheet.md` (→ volet C), `AUDIT-TOURNOI-R92.md`.

**Fichiers modifiés**

Aucun fichier de l'application. Uniquement de la documentation :

- **créé** : `docs/industrialisation/CARTOGRAPHIE.md`
- **modifiés** : `docs/industrialisation/ETAT.md`, `PLAN.md`, `SESSIONS.md`

**Problèmes découverts**

Aucun problème classé : **la classification est le travail de l'ÉTAPE 2**, pas de la cartographie.
13 **points d'attention** (A-01 à A-13) ont été notés au passage dans `CARTOGRAPHIE.md` §A.10, avec
le domaine d'audit qui les reprendra. Les trois plus structurants :

- **A-02** — la publication du backend est **manuelle** (copier-coller dans l'éditeur Apps Script) :
  rien ne garantit que le dépôt reflète ce qui tourne. Confirme **I-01** comme un fait de structure.
- **A-05** — les deux clés sont des **mots de passe partagés**, sans notion de personne : impossible
  de savoir *qui* a fait quoi.
- **A-06** — `mesureSponsors` est une **écriture publique sans clé** (relevés de visibilité des
  partenaires déposés par les téléphones des spectateurs).

Deux nouveaux points **INCONNU** ajoutés à `ETAT.md` : **I-06** (partage réel du Google Sheet) et
**I-07** (présence et fraîcheur des onglets `RefFFR_*`). **Tous deux levés le jour même par Romain**,
en fin de session :

- **I-06 → LEVÉ.** Capture du panneau Drive fournie : *Qui a accès → **Privé***. Le classeur n'est
  accessible qu'à son propriétaire. L'identifiant public dans le dépôt n'expose donc rien.
- **I-07 → LEVÉ.** Seconde capture fournie (bas du classeur) : les onglets `RefFFR_Formes`,
  `RefFFR_Regles`, `RefFFR_Temps`, `RefFFR_Dates` existent, **aux noms exacts** attendus par le code,
  avec un contenu cohérent (millésimes 2026-2027, formes 5x5 / 7x7). Les fichiers Drive
  `RefFFR-formes-de-jeu` et `RefFFR-dates-federales` sont des documents sources distincts, sans rôle
  dans le fonctionnement.
- **I-04 → LEVÉ.** Le tournoi présent en base est un tournoi de **test** : « un faux tournoi avec de
  vrais noms ». Les clubs affichés sont réels, les engagements non.
- **I-03 → LEVÉ pour l'état actuel.** Après un échange en deux temps : les seules adresses email
  présentes dans le classeur sont **celle de Romain et celle de son épouse**, saisies pour tester les
  envois. **Aucune donnée personnelle de tiers à ce jour.** La question reste entière pour l'avenir —
  l'application est conçue pour collecter les coordonnées de contacts de clubs. Nouveau point
  d'attention **A-14** ajouté à `CARTOGRAPHIE.md` §A.10, formulé comme une **préparation** (avant la
  première invitation réelle) et non comme une correction.

  > *Note de méthode* : la première formulation de A-14, écrite sur une lecture erronée de la
  > réponse de Romain, annonçait de « vraies adresses de contacts de clubs ». Corrigée le jour même
  > après précision. Rappel utile de la règle §9 de `CLAUDE.md` : une déclaration ambiguë doit être
  > **confirmée** avant d'être écrite comme un fait.

**Tests réalisés**

Aucun test d'exécution. Une seule vérification a été **réellement conduite** : le croisement des
8 noms de fonctions en double avec la liste des scripts chargés par chacune des 8 pages HTML →
aucune page ne charge deux définitions du même nom. **CERTAIN.**

**Tests NON réalisés (et pourquoi)**

- `backend/Tests.gs` : **NON VÉRIFIÉ** — les 301 tests ne s'exécutent que dans Google Apps Script.
- Le fonctionnement réel de l'application : **NON VÉRIFIÉ** — rien n'a été lancé, aucune page
  ouverte, aucune requête envoyée au backend.
- La correspondance entre `backend/Code.gs` et le code en service chez Google : **NON VÉRIFIÉ**
  (impossible depuis le dépôt — voir I-01).

**Décisions prises**

- **D-007** — l'ÉTAPE 1 est découpée en **trois volets** (A squelette / B fonctionnalités /
  C données), un par session, tous rassemblés dans un seul fichier `CARTOGRAPHIE.md`.
- **D-008** — la cartographie **décrit** et **ne classe pas** : les points remarqués sont notés
  comme observations, jamais comme problèmes P0/P1/P2/P3.
- **D-009** *(en attente)* — cette session a produit de la documentation, qui selon **D-006** part
  directement sur `main` ; mais la consigne d'exécution impose la branche
  `claude/industrialisation-phase2-cartographie-usis7l`. La branche a été respectée. **À trancher
  par Romain.**

**Commit**

`docs(industrialisation): cartographier le squelette de l'application` — sur la branche
`claude/industrialisation-phase2-cartographie-usis7l`. Aucun fichier de l'application dans ce commit.

**Prochaine session recommandée**

**Session 3 — ÉTAPE 1, volet B : les fonctionnalités.** Parcourir ce que l'application sait faire,
du premier réglage au tournoi terminé : les 14 écrans d'administration, la génération des poules et
du planning, la saisie des scores, le calcul du classement, la page publique, et le parcours
d'invitation des clubs. Toujours **sans rien modifier**.

---

## Session 1 — Mettre en place le système de travail par sessions

| Champ | Valeur |
|---|---|
| **Date** | 2026-08-04 |
| **Objectif** | Créer l'organisation documentaire permettant de travailler sur plusieurs sessions sans dépendre de la mémoire de la conversation. **Aucune analyse, aucune correction.** |
| **Étape du plan** | ÉTAPE 0 (préalable) |
| **Résultat** | ✅ Objectif atteint |

**Travail effectué**

1. Vérification de l'état de départ : branche `main`, dépôt **propre**, dernier commit `6e4f3c2`.
   Aucun `CLAUDE.md` n'existait à la racine.
2. Création de `CLAUDE.md` à la racine, contenant l'intégralité du « Prompt maître —
   Industrialisation de Tournoi R92 », structuré et complété de deux sections d'application :
   le fonctionnement par sessions (§12) et les points de clarification signalés (§13).
3. Création de `docs/industrialisation/` avec ses 5 fichiers de suivi.
4. Relevé **factuel** de ce que contient le dépôt (noms et tailles de fichiers uniquement), reporté
   dans `ETAT.md` §9. **Aucun fichier de l'application n'a été lu en profondeur ni analysé.**

**Fichiers analysés (lus)**

Uniquement pour situer le contexte, en surface :

- listing de la racine, de `backend/`, `frontend/`, `docs/`, `.github/workflows/`, `.claude/`
- 40 premières lignes de `AUDIT-TOURNOI-R92.md` (pour comprendre son rôle et éviter un doublon)
- 30 premières lignes de `docs/passation.md`
- état Git et 3 derniers commits

**Fichiers modifiés**

Aucun fichier de l'application. Fichiers **créés** :

- `CLAUDE.md`
- `docs/industrialisation/ETAT.md`
- `docs/industrialisation/PLAN.md`
- `docs/industrialisation/RISQUES.md`
- `docs/industrialisation/DECISIONS.md`
- `docs/industrialisation/SESSIONS.md`

**Problèmes découverts**

Aucun problème applicatif (aucun audit réalisé). Trois **risques de méthode** enregistrés dans
`RISQUES.md` :

- **M-01** — deux systèmes de suivi en parallèle (l'audit FFR existant + celui-ci)
- **M-02** — le code du dépôt n'est pas forcément le code réellement en service chez Google
- **M-03** — les tests automatiques ne peuvent pas être lancés depuis cet ordinateur *(PROBABLE, à confirmer)*

**Tests réalisés**

Aucun. Il n'y avait rien à tester : aucune ligne de code n'a été touchée.

**Tests NON réalisés (et pourquoi)**

- Les tests de `backend/Tests.gs` : **NON VÉRIFIÉ**. Ils s'exécutent chez Google, pas ici, et rien
  ne le justifiait dans cette session.
- Le fonctionnement de l'application : **NON VÉRIFIÉ**. Hors objectif de la session.

**Décisions prises**

- **D-001** — la mémoire durable du projet est `CLAUDE.md` + `docs/industrialisation/` ✅ validée
- **D-002** — une session = un objectif, puis arrêt ✅ validée
- **D-003** — audit FFR et industrialisation = deux chantiers séparés ✅ validée par Romain
- **D-004** — commits : `type(scope): description en français` (convention du dépôt conservée) ✅ validée par Romain
- **D-006** — documentation = commit direct sur `main` ; code = branche + PR ✅ validée par Romain
- **D-005** — périmètre `boutique-r92` : **toujours en attente**, non posée à Romain à ce stade

**Commit**

`docs(industrialisation): mettre en place le cadre de travail par sessions` — commit direct sur
`main` (conformément à D-006). Contenu : `CLAUDE.md` + les 5 fichiers de
`docs/industrialisation/`. Aucun fichier de l'application dans ce commit.

**Prochaine session recommandée**

**Session 2 — ÉTAPE 1 : CARTOGRAPHIE.** Lire le projet **sans rien modifier**, et expliquer en
langage simple : comment les différentes parties communiquent, quelles fonctionnalités existent,
par où passent les données, quels sont les points critiques, et quelles données personnelles sont
manipulées.

Attention : le projet est volumineux (le seul fichier `backend/Code.gs` fait environ 427 000
caractères). La cartographie prendra probablement **plus d'une session**. Il faudra sans doute la
découper — par exemple : (2a) le squelette et les échanges entre parties, (2b) les fonctionnalités
métier, (2c) les données manipulées.

---

## SESSION 3 — 2026-08-04

**Objectif**

ÉTAPE 1 — CARTOGRAPHIE, **volet B : les fonctionnalités**. Parcourir ce que l'application sait
faire, du premier réglage jusqu'au tournoi terminé, et l'expliquer en langage simple.
**Aucun fichier de l'application ne devait être modifié — et aucun ne l'a été.**

**Vérification préalable demandée par Romain**

`docs/industrialisation/CARTOGRAPHIE.md` existe bien et contient le **volet A complet**
(§A.1 à §A.12, 451 lignes, points d'attention A-01 à A-14). Condition remplie → session lancée.

**Ce qui a été fait**

Lecture (sans modification) du backend et du frontend, sur les zones qui portent les
fonctionnalités :

- `backend/Code.gs` : `doGet` / `doPost` et l'inventaire complet des actions ; le moteur sportif
  (`genererPoulesEtPlanning`, `calculerPlanning`, `nombrePoules`, `calculerClassement`,
  `comparerClassement`) ; les cinq formats d'après-midi et le bracket de coupe ; la saisie des
  scores (`enregistrerScore`, score détaillé, propagation) ; le parcours d'invitation
  (`repondreInvitation`, `creerEquipesClub`, `planifierSyncEquipesClub`, envois de courriels) ;
  la conformité et l'autorisation FFR ; les partenaires et leurs relevés ; la réinitialisation ;
  le Super Challenge de France ;
- `frontend/js/` : `ecrans.js` et `assistant.js` (les deux présentations de l'administration),
  les 11 modules `admin-*.js`, `tournoi.js`, `saisie.js`, `dossier.js`, `invitation.js`,
  `reponse.js`, `sponsors.js`, `perfs.js`.

**Résultat produit**

`docs/industrialisation/CARTOGRAPHIE.md` — **volet B** ajouté (§B.1 à §B.14) :

- la ligne de vie d'un tournoi, du premier réglage à la feuille de fin de journée ;
- l'inventaire des **65 actions** du serveur (15 lectures + 50 écritures), regroupées par sujet ;
- les **14 écrans** de l'administration et le verrou d'étapes ;
- le parcours des clubs en **deux phases** (invitation → réponse en libre-service → dossier) ;
- le moteur sportif : les deux refus avant écriture, la composition des poules, le placement des
  horaires, l'assistant d'arbitrage, la pause échelonnée, le Super Challenge ;
- le barème de classement et son départage ;
- les **cinq formats d'après-midi** ;
- la saisie des scores et ses protections ;
- ce que voit le public, plus les fonctionnalités annexes (autorisation FFR, conformité,
  partenaires, feuille de journée, page Perfs, réinitialisation).

**Points d'attention relevés** — B-01 à B-12 (`CARTOGRAPHIE.md` §B.12). Ce sont des
**observations**, pas des verdicts : la classification P0/P1/P2/P3 est le travail de l'ÉTAPE 2.

Les trois plus structurants :

- **B-03** — regénérer les poules efface tous les scores. Le garde-fou (double confirmation +
  re-saisie de la clé admin) existe **uniquement dans le navigateur** ; le serveur ne vérifie pas.
  À comparer avec deux protections comparables **tenues par le serveur** : la réorganisation des
  poules et le gel des réponses à J-16 ;
- **B-01 / B-02 / B-12** — trois calculs vivent **en double** (serveur + navigateur) : le barème de
  classement, les empreintes de réglages, et le classement général affiché au public ;
- **B-04 / B-05 / B-06** — trois situations de terrain que l'application ne sait pas gérer :
  le **forfait**, le **déplacement d'un match**, et un match du matin resté non saisi (qui bloque
  toute la génération de l'après-midi).

**Contradictions avec la mémoire automatique**

Aucune constatée.

**Tests réalisés**

Aucun. Volet de cartographie : aucune ligne de code n'a été touchée, il n'y avait rien à tester.

**Tests NON réalisés (et pourquoi)**

- Le fonctionnement réel des fonctionnalités décrites : **NON VÉRIFIÉ**. Tout ce volet décrit ce
  que le code **prévoit**, pas ce qui se produit à l'exécution. Rien n'a été lancé.
- Les tests de `backend/Tests.gs` : **NON VÉRIFIÉ** — ils ne s'exécutent que chez Google (I-02).
- Le comportement en production : **INCONNU** (I-01, règle permanente de `CLAUDE.md` §13.6).

**Décisions prises**

Aucune décision nouvelle. Aucune validation n'était requise pour ce volet (cartographie =
description, pas modification).

**Commit**

`docs(industrialisation): cartographier les fonctionnalités de l'application` — sur la branche
`claude/cartographie-volet-b-fonctionnalites-busrpe`. Contenu : `CARTOGRAPHIE.md` (volet B),
`ETAT.md`, `PLAN.md`, `SESSIONS.md`. **Aucun fichier de l'application.**

**Prochaine session recommandée**

**Session 4 — ÉTAPE 1, volet C : les données.** Dernier volet de la cartographie. Inventorier
ce qui est stocké, onglet par onglet et colonne par colonne : qui peut le voir, combien de temps
cela reste, et ce qui relève de la vie privée — contacts de clubs, effectifs d'enfants mineurs,
images déposées sur Drive, relevés de visibilité des partenaires.

Ce volet prépare le domaine B (RGPD) de l'ÉTAPE 2 **sans le remplacer** : il décrit, il ne juge
pas. Il est particulièrement utile **maintenant**, avant la première invitation réelle : c'est à ce
moment-là que de vraies données personnelles de tiers entreront dans le classeur (voir I-03).
