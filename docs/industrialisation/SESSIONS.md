# JOURNAL DES SESSIONS — Industrialisation de Tournoi R92

> Une fiche par session de travail. Ce journal sert à répondre à : « qu'est-ce qui a réellement
> été fait, et qu'est-ce qui ne l'a **pas** été ? »
>
> ⚠️ **Ordre de lecture** : les sessions 1 et 2 sont en **haut** du fichier ; à partir de la
> session 3, les fiches sont ajoutées **à la suite, en bas** (la plus récente en dernier). La
> consigne d'origine (« le plus récent en haut ») n'a pas été suivie, et il vaut mieux le dire
> que de laisser chercher.

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

---

## SESSION 4 — 2026-08-04

**Objectif**

ÉTAPE 1 — CARTOGRAPHIE, **volet C : les données**. Inventorier ce que l'application stocke, onglet
par onglet et colonne par colonne : où c'est rangé, qui peut le voir, combien de temps cela reste,
et ce qui relève de la vie privée. **Aucun fichier de l'application ne devait être modifié — et
aucun ne l'a été.**

**Vérification préalable**

`CARTOGRAPHIE.md` contenait bien les volets A (§A.1→A.12) et B (§B.1→B.14), soit 996 lignes et
26 points d'attention. Dépôt propre, branche `claude/cartographie-donnees-etape-1-t1e9xq` à jour
sur `6382f7e`. Condition remplie → session lancée.

**Ce qui a été fait**

Lecture (sans modification) des zones du code qui **définissent, écrivent, filtrent ou effacent**
des données :

- `backend/Code.gs` — la déclaration `ENTETES` (les colonnes des 8 onglets créés par le code) ;
  `creerOngletConfig` (la zone A et la zone B de `Config`) ; les listes `CHAMPS_AUTORISATION`,
  `CHAMPS_CONTACTS_SECURITE`, `CHAMPS_INVITATION`, `CHAMPS_SURPLACE`, `CHAMPS_REPONSE` ;
  `CONFIG_PUBLIQUE_VUES` et `filtrerConfigPublique` (les trois listes blanches) ;
  `lireOngletSimple` et `construireSnapshot` (ce qui sort en public) ; `lireSponsorsPublics` ;
  `getClubDossier`, `getConfigClub`, `getReponseInvitation`, `trouverClubParToken`,
  `repondreInvitation`, `validerDetailEffectifs`, `listerClubsInvites` ; les envois de courriels
  (`envoyerEmailAvec`, `envoyerEmailHtml`, `envoyerInvitationsGroupe`, `envoyerFeuilleJour`) ;
  `enregistrerMesureSponsors`, `lireMesuresSponsors`, `viderMesuresSponsors` ;
  `reinitialiserTournoi` et `reinitialiserPhase2Clubs` ; tous les appels `DriveApp` et `Logger.log` ;
- `frontend/js/` — `api.js` (rangement des clés), `commun-dossier.js` (le jeton retiré de la barre
  d'adresse), `sponsors.js` (les identifiants aléatoires et les compteurs), `dossier.js`,
  `admin-invitations.js`, `admin-feuille-jour.js`, `saisie.js`, `tournoi.js`, `ecrans.js` ;
- `cloudflare/worker-tournoi.js` (ce que stockerait le relais s'il était rallumé).

Recherche systématique de champs nominatifs d'enfants (`nom_joueur`, `prenom`, `date_naissance`,
`licence`) sur l'ensemble du dépôt : **aucun**, sauf le champ libre décrit ci-dessous.

**Résultat produit**

`docs/industrialisation/CARTOGRAPHIE.md` — **volet C** ajouté (§C.1 à §C.14) :

- les **cinq endroits** où vivent des données (classeur, Drive, Gmail, appareils des visiteurs,
  relais CDN éteint) — et pourquoi vider le classeur ne vide pas les quatre autres ;
- les **12 onglets** du classeur, avec pour chacun : contenu, qui l'écrit, lisibilité sans clé,
  présence ou non de données personnelles ;
- `ClubsInvites` détaillé **colonne par colonne** (17 colonnes), et les protections déjà en place ;
- les **11 champs personnels** de la zone A de `Config` et leur exposition réelle ;
- la doctrine « rien ne sort sauf ce qui est nommé » (trois listes blanches) **et sa limite** ;
- les **cinq niveaux d'accès** : public, club à jeton, marqueur, organisateur, propriétaire Google ;
- une réponse nette à la question des **mineurs** ;
- les **durées de conservation**, et le détail de ce que la réinitialisation efface / conserve ;
- ce qui **sort** du classeur et ce qui reste sur les appareils des visiteurs.

**Points d'attention relevés** — C-01 à C-13 (`CARTOGRAPHIE.md` §C.12). Ce sont des
**observations**, pas des verdicts : la classification P0/P1/P2/P3 et l'appréciation de conformité
sont le travail de l'ÉTAPE 2, domaine B.

Les plus structurants :

- **C-05** — **rien ne disparaît tout seul** : aucune durée de conservation, aucune purge
  automatique nulle part. Toute suppression est un geste manuel ;
- **C-07** — une **copie de chaque courriel envoyé** reste dans la boîte Gmail du propriétaire,
  avec l'adresse du club : le classeur n'est pas le seul endroit où vivent ces coordonnées, et la
  réinitialisation n'y a aucune prise ;
- **C-03 / C-04** — la réinitialisation **conserve sans l'expliquer** les effectifs d'enfants
  déclarés équipe par équipe (`detail_effectifs`) et **tous** les contacts de la demande
  d'autorisation (représentant, président, médecin, secours), alors que les autres conservations
  volontaires, elles, sont documentées dans le code ;
- **C-01** — quatre onglets (`Equipes`, `Poules`, `Matchs`, `Historique`) sortent **en entier,
  sans clé**, à rebours de la doctrine « liste blanche » appliquée à `Config` et `Sponsors`. Aucune
  conséquence aujourd'hui ; aucun garde-fou demain ;
- **C-10** — un champ libre invite explicitement à saisir **noms, prénoms et dates de naissance**
  d'enfants (« liste des équipes étrangères ») : le seul endroit de l'application où des identités
  de mineurs peuvent entrer.

**Ce qui est plutôt rassurant, et mérite d'être dit**

- **Aucun enfant n'est identifié** : ni nom, ni date de naissance, ni licence. Que des nombres ;
- la doctrine **opt-in** de la config publique est explicite, appliquée en trois vues, avec le
  défaut le plus fermé en cas d'erreur de nom ;
- l'email d'un club **n'est jamais renvoyé à personne** — pas même au club ;
- un envoi groupé envoie **un courriel par club**, jamais un courriel commun ;
- le destinataire d'un envoi est **toujours relu dans le classeur**, jamais pris dans la demande ;
- **aucun cookie, aucun traceur tiers** ; les deux identifiants de mesure sont aléatoires et remis
  à zéro chaque jour ; le serveur revalide chaque compteur reçu.

**Points INCONNU ajoutés**

- **I-08** — une image mise à la corbeille du Drive reste-t-elle atteignable par un lien déjà
  diffusé, pendant les ~30 jours avant purge par Google ?
- **I-09** — que conserve le journal d'exécution Apps Script, et pendant combien de temps ?

**Point INCONNU précisé**

- **I-03** — l'inventaire de ce que l'application **peut** collecter est désormais **fait**. La
  question restante n'est plus « quoi », mais « qu'en décide-t-on », et elle relève du domaine B.

**Contradictions avec la mémoire automatique**

Aucune constatée.

**Tests réalisés**

Aucun. Volet de cartographie : aucune ligne de code n'a été touchée, il n'y avait rien à tester.

**Tests NON réalisés (et pourquoi)**

- **Le contenu réel du classeur : NON VÉRIFIÉ.** Ce volet décrit ce que le code est capable
  d'écrire, pas ce que le classeur contient à cet instant — il n'est pas lisible depuis le dépôt.
- **L'efficacité des protections décrites : NON VÉRIFIÉE.** Le code prévoit que l'email d'un club
  ne sorte jamais et que `ClubsInvites` exige la clé admin ; rien n'a été exécuté pour le prouver.
- Les tests de `backend/Tests.gs` : **NON VÉRIFIÉ** — ils ne s'exécutent que chez Google (I-02).
- Le comportement en production : **INCONNU** (I-01, règle permanente de `CLAUDE.md` §13.6).

**Décisions prises**

Aucune décision nouvelle. Aucune validation n'était requise pour ce volet (cartographie =
description, pas modification).

**Commit**

`docs(industrialisation): cartographier les données de l'application` — sur la branche
`claude/cartographie-donnees-etape-1-t1e9xq`. Contenu : `CARTOGRAPHIE.md` (volet C), `ETAT.md`,
`PLAN.md`, `SESSIONS.md`. **Aucun fichier de l'application.**

**Prochaine session recommandée**

**Session 5 — ÉTAPE 2 : début de l'audit.** L'ÉTAPE 1 est terminée : les trois volets de la
cartographie sont écrits et ont produit **39 points d'attention** (A-01→A-14, B-01→B-12,
C-01→C-13) qui attendent d'être classés P0/P1/P2/P3.

⚠️ **Une décision de Romain est requise avant de commencer** : l'ordre de passage des 8 domaines.
L'ordre recommandé reste **A → C → B → D → E → F → G → H** (métier, sécurité, données
personnelles, tests, puis le confort). Le volet C apporte toutefois un argument pour **remonter le
domaine B** si de vrais clubs doivent être invités prochainement : le classeur est encore vide de
données de tiers, donc tout peut être **préparé** plutôt que **rattrapé**.

---

## SESSION 5 — 2026-08-04

**Objectif**

ÉTAPE 2 — AUDIT, **domaine A : métier / Product Owner**. Répondre à une seule question : un
organisateur réel, le jour d'un vrai tournoi, peut-il faire son travail avec cet outil — et
l'outil produit-il des **résultats sportifs justes** ? **Aucun fichier de l'application ne devait
être modifié — et aucun ne l'a été.**

**Décision préalable prise par Romain**

L'ordre de passage des 8 domaines : **A → C → B → D → E → F → G → H** (décision **D-010**,
validée). L'alternative proposée — remonter le domaine B pour profiter de la fenêtre où le
classeur est encore vide de données de tiers — a été **écartée par Romain** : *« on fait les
choses dans l'ordre pour bien les faire, la production attendra, de toute façon personne ne sait
ce qui est en train d'être construit pour le moment »*. La fenêtre du domaine B reste ouverte tant
qu'aucun vrai club n'est invité : l'urgence invoquée n'en était pas une.

**Ce qui a été fait**

Lecture ciblée (sans exécution) du code qui porte les **règles sportives** et le **déroulé de la
journée** :

- `backend/Code.gs` — `calculerClassement`, `comparerClassement`, `enregistrerResultat` (le barème
  et le départage) ; `validerScore`, `validerCompteur`, `litDetailEquipe`, `enregistrerScore` (ce
  qu'un score peut valoir) ; `genererPoulesEtPlanning`, `analyserEffectifsCategories`,
  `categoriesSansDureeMiTemps`, `nombrePoules`, `nbGroupesScf` et la répartition en poules ;
  `genererApresMidi` et les cinq sous-générateurs de format ; `recalculerHoraires`,
  `reorganiserPoulesMatin` (les outils de rattrapage et leurs refus) ; `reponsesGelees` ;
- `frontend/js/` — `saisie.js` (les contrôles réels de la saisie), `tournoi.js` (`comparer`,
  `podiumCertain`, `podiumCroise`, `garantiDevant`) ;
- `docs/regles-classement.md` — la spécification de référence du barème.

Recherche systématique des états possibles d'un match (`statut`) : **deux seulement**, « à venir »
et « terminé ».

**Résultat produit**

Nouveau fichier `docs/industrialisation/AUDIT.md` — domaine A (§A.0 à §A.10) :

- le verdict en une phrase, **ce qui est solide** (9 points, à ne pas casser), puis les problèmes ;
- les 5 problèmes P1 traités au format complet de `CLAUDE.md` §1 (ce que j'ai trouvé / pourquoi
  c'est important / exemple concret / ce que je propose / impact / ce que je conseille) ;
- les 5 P2 et le P3 en format court ;
- ce que le domaine A **ne peut pas** conclure, et les 3 questions qui n'appartiennent qu'à Romain ;
- un récapitulatif chiffré, et « si je devais ne corriger que trois choses ».

`RISQUES.md` — le registre est ouvert : **R-001 à R-011**, tous au statut **IDENTIFIÉ**.

**Problèmes découverts** — 11 au total : **0 P0 · 5 P1 · 5 P2 · 1 P3**.

Les cinq P1, qui ont tous le même point commun (ils apparaissent **le jour J**) :

- **R-001** — **le forfait n'existe pas.** Un match n'a que deux états. Une équipe absente n'a
  aucune façon correcte d'être enregistrée : un 0-0 donne **2 points à l'absent** (match nul),
  un score inventé offre de la différence — or la différence est le 2ᵉ critère de départage.
  Quel que soit le choix de l'organisateur, le classement est faux ;
- **R-002** — **un seul match du matin non saisi bloque l'après-midi de toutes les catégories**
  (le contrôle ne regarde pas la catégorie), et le message ne dit pas quels matchs manquent ;
- **R-003** — **aucun ajustement de planning une fois la journée lancée.** Impossible de déplacer
  ou reporter un match. « Réorganiser les poules » est refusé dès le premier score ; « recalculer
  les horaires » est refusé dès que l'après-midi est généré ; il ne reste que « tout regénérer »,
  qui efface les scores. Terrain impraticable = gestion papier, pendant que l'affichage public
  continue d'annoncer les anciens horaires ;
- **R-004** — **pas de départage au-delà du 3ᵉ critère.** Deux équipes strictement à égalité sont
  classées dans l'ordre des lignes du tableur. Ce rang **décide de la composition de l'après-midi**
  (en croisé, les 1ᵉʳˢ jouent ensemble). Limite déjà documentée dans `docs/regles-classement.md`,
  jamais traitée ;
- **R-005** — **aucune borne haute sur un score**, ni côté serveur ni côté navigateur. 150 au lieu
  de 15 passe sans un mot, et fausse toute la poule via la différence.

**Ce qui est ressorti de solide** (et qui ne doit pas être dégradé) : les refus **avant** écriture,
le tirage qui sépare les clubs et le dit quand il n'y arrive pas, le planning à trois contraintes,
l'assistant d'arbitrage, la synchronisation qui ne détruit jamais à l'aveugle, « recalculer les
horaires » qui **préserve les scores**, les protections critiques tenues **par le serveur**, et
surtout le **podium qui refuse de s'afficher tant qu'il n'est pas mathématiquement certain** —
vérification faite jusqu'à la frontière avec le 4ᵉ, en tenant compte des matchs restants.

**Tests réalisés**

Aucun. Audit de lecture : rien n'a été exécuté, aucune ligne de code n'a été touchée.

**Tests NON réalisés (et pourquoi)**

- **Aucun scénario n'a été joué** : tous les constats portent sur ce que le code **prévoit**.
  Statut **NON VÉRIFIÉ** pour tout comportement réel.
- Les tests de `backend/Tests.gs` : **NON VÉRIFIÉ** — ils ne s'exécutent que chez Google (I-02).
- Le comportement en production : **INCONNU** (I-01).

**Décisions prises**

- **D-010** — ordre d'audit des 8 domaines : **A → C → B → D → E → F → G → H**. ✅ Validée par
  Romain.

**Questions ouvertes qui bloquent une correction** (à poser à l'ÉTAPE 4, pas maintenant)

1. quelle règle appliquer à une équipe forfait (R-001) ?
2. quels critères de départage ajouter, et dans quel ordre (R-004) ?
3. à partir de quel score faut-il demander une confirmation (R-005) ?

**Commit**

`docs(industrialisation): auditer le domaine métier` — sur la branche
`claude/cartographie-donnees-etape-1-t1e9xq`. Contenu : `AUDIT.md` (nouveau), `RISQUES.md`,
`DECISIONS.md`, `ETAT.md`, `PLAN.md`, `SESSIONS.md`. **Aucun fichier de l'application.**

**Prochaine session recommandée**

**Session 6 — ÉTAPE 2, domaine C : la sécurité.** Qui peut faire quoi, et ce qu'un visiteur mal
intentionné pourrait obtenir. Points de la cartographie qui l'alimentent directement : **A-05**
(les clés sont des mots de passe partagés, sans notion de personne), **A-06** (une écriture
publique sans clé), **A-10** (les jetons voyagent par courriel), **B-03** (le garde-fou qui évite
d'effacer tous les scores ne vit que dans la page), **B-09** (le contenu des courriels est fabriqué
par le navigateur), **B-11** (la réinitialisation ne demande aucune confirmation au serveur),
**C-11** (une seule requête rend tout le carnet d'adresses).

Format imposé par `CLAUDE.md` §6.C, pour chaque faille : criticité, scénario d'exploitation,
impact, recommandation, difficulté de correction. **Aucune mesure de sécurité ne sera modifiée
sans validation préalable.**

### Session 5 — complément du même jour : réponses de Romain

Romain a répondu aux trois questions ouvertes du domaine A **le jour même**, avant la clôture de
la session. Le travail ci-dessous est donc rattaché à la session 5, et non à une session 6.

**Ce qu'il a tranché**

- **D-011 — le forfait** : *« l'absent marque 0 point et le présent gagne (différence de points à
  mettre en paramètre à la discrétion de l'organisateur du tournoi). Peu importe son choix, toutes
  les équipes doivent être informées de tout point de règlement dans leur dossier final a
  minima. »* → R-001 passe au statut **VALIDÉ** (la règle, pas le code).
- **D-012 — les scores** : *« max un nombre à 2 chiffres plus demande de confirmation du score
  avant de valider »* → R-005 passe au statut **VALIDÉ** (la règle, pas le code).

**Ce que j'avais mal posé**

Romain : *« je ne comprends pas les questions 2 et 3 »*. Les deux questions étaient formulées en
vocabulaire technique, ce que `CLAUDE.md` §0 interdit :

- la question 2 (« quels critères de départage ? ») supposait connu le mot **départage** ;
- la question 3 (« à partir de quel score demander confirmation ? ») supposait qu'il fallait un
  **seuil** — alors que Romain, en répondant sur R-005, a proposé quelque chose de **plus simple et
  plus sûr** : une limite dure à 2 chiffres. La question portait sur une solution que je lui
  imposais implicitement, pas sur son besoin.

Leçon retenue pour les prochains domaines : **poser la question sur le besoin, pas sur la solution
technique que j'ai en tête.**

**Deux propositions faites à sa demande** (« que me suggères-tu ? »)

- **D-013 (R-003)** — ajuster le planning en cours de journée. Trois niveaux proposés ; je
  recommande de ne faire que les deux premiers : **déplacer un match** (heure et/ou terrain, sans
  rien regénérer) et **décaler toute la journée de X minutes** (les matchs pas encore joués).
  Le troisième — redistribuer automatiquement les matchs d'un terrain devenu impraticable — est le
  seul qui touche au planificateur, donc le seul réellement risqué : à garder pour plus tard.
- **D-014 (R-004)** — le départage. Proposition : ajouter **deux critères à la suite des trois
  existants**, sans toucher aux trois — (4) la **confrontation directe**, (5) l'**ordre
  alphabétique** en dernier recours. Argument central : ces critères n'interviennent que là où
  l'application n'a **aujourd'hui aucune règle**, donc aucun classement actuellement correct ne
  change. Et le dernier recours doit être **déterministe** (pas un tirage au sort), parce que le
  classement est calculé deux fois : un tirage donnerait un classement à la page publique et un
  autre au tirage de l'après-midi.

**Nouveau problème découvert — R-012**

L'exigence de transparence posée par Romain dans D-011 m'a fait vérifier ce que les clubs
reçoivent réellement. Constat : **ni le barème (3/2/1), ni l'ordre de départage ne sont écrits où
que ce soit** pour les clubs — ils n'existent que dans les commentaires du code et dans
`docs/regles-classement.md`, un document technique. Il y a bien une ligne « Règlement » dans le
dossier des clubs, mais c'est un **texte libre**, et son champ **a été retiré de l'écran
d'administration** (`admin.js` le dit explicitement) : **il n'existe aujourd'hui aucun moyen de le
remplir.** *(CERTAIN, vérifié.)*

Autrement dit : la règle que Romain vient de fixer ne serait, en l'état, **communicable à
personne**. → **R-012**, P2, à traiter **avec** R-001 et R-004 plutôt que séparément.

**Question adjacente laissée ouverte** (sans urgence) : faut-il un état « **match annulé** »
(l'orage qui arrête le tournoi), distinct du forfait ? Personne n'a tort, personne n'est absent —
le match n'a simplement pas eu lieu. C'est le même chantier technique que R-001, donc le bon moment
pour y penser.

**Tests réalisés**

Aucun. Toujours aucune ligne de code touchée.

**Commit**

`docs(industrialisation): enregistrer les règles de forfait et de saisie des scores` — branche
`claude/cartographie-donnees-etape-1-t1e9xq`. Contenu : `AUDIT.md`, `RISQUES.md`, `DECISIONS.md`,
`ETAT.md`, `SESSIONS.md`. **Aucun fichier de l'application.**

**Prochaine session recommandée**

Inchangée : **session 6 — ÉTAPE 2, domaine C (sécurité)**. Les propositions D-013 et D-014
n'empêchent pas d'avancer : elles attendront l'ÉTAPE 4, comme le reste. Rien ne sera codé avant la
fin des 8 audits.

### Session 5 — 3ᵉ échange : les 5 P1 sont tranchés

Troisième aller-retour du même jour. Romain a validé les deux propositions en attente, précisé la
forme du forfait, et posé une question que ce chantier ne peut pas trancher.

**Ce qu'il a validé**

- **D-013 (R-003)** — ajuster le planning : déplacer un match, et décaler toute la journée de
  X minutes. Le 3ᵉ niveau (redistribuer automatiquement un terrain condamné) reste écarté ;
- **D-014 (R-004)** — départage : confrontation directe en 4ᵉ critère, ordre alphabétique en 5ᵉ ;
- **D-012 (R-005)** — confirmé.

**Ce qu'il a amendé — et il a eu raison contre moi**

J'avais recommandé que le score attribué en cas de forfait soit un **paramètre réglable**. Romain
l'a écarté au profit d'un **bouton « Forfait » sous chaque équipe**, avec une règle fixe : 3 points
au présent, 0 à l'absent, **aucun score**, et une **double mise en garde**.

Sa version est meilleure que la mienne. Le paramètre que je proposais était un piège : réglé sur
« 25-0 », il aurait offert +25 de différence à une équipe — or la différence sert à départager.
Une règle fixe sans score ne peut fausser aucun classement. **Un réglage en moins, c'est une façon
de se tromper en moins.** Amendement porté dans `DECISIONS.md`, D-011.

**Ce que j'ai proposé en retour** — six compléments techniques (`AUDIT.md` §A.2, point 8), dont le
plus important : **le forfait doit être annulable**. Sans cela, un appui malheureux à 9h coûterait
une regénération complète, donc tous les scores de la journée. Les cinq autres : prévoir les deux
équipes forfait, faire afficher **la conséquence** par la deuxième mise en garde plutôt que de
répéter la question, afficher « Forfait » et jamais « 0-0 », faire **débloquer** la génération de
l'après-midi par un match forfait, et **garder la clé scores** plutôt que la clé admin (qui ne doit
pas circuler au bord d'un terrain).

**Nouveau problème — R-013, le match annulé**

Romain : *« match annulé, j'attends une suggestion de ta part, je ne sais pas si la FFR met des
recommandations là-dessus ou si un règlement existe sur le sujet. »*

**Vérification faite** : `AUDIT-TOURNOI-R92.md` (~129 000 caractères) **ne contient rien** sur le
forfait, l'annulation, les intempéries ou le report. Aucun de ses 25 points de vérification
(Q11 → Q25) ne porte sur le sujet. **Je ne sais donc pas ce que la FFR prescrit, et je ne l'ai pas
inventé** (`CLAUDE.md` §9 et §10).

- **Question sortante** ouverte : **I-10** dans `ETAT.md`, à porter au chantier FFR par Romain
  (Directeur EDR du Racing / Comité 92 — la voie qui a résolu Q23). Ce chantier-ci ne modifie pas
  `AUDIT-TOURNOI-R92.md` : décision D-003.
- **Ma proposition, valable tant qu'aucune règle fédérale ne la contredit** (D-015) : le **même
  mécanisme que le forfait, avec un libellé différent**. Un match annulé ne compte pour personne,
  et ne bloque pas l'après-midi. Techniquement c'est un « double forfait », mais le mot compte :
  un forfait désigne un fautif, une annulation n'accuse personne. Une fois le forfait construit,
  l'annulation ne coûte presque rien.
- **Limite signalée** : si seuls *certains* matchs sont annulés, les équipes n'auront pas joué le
  même nombre de matchs. Je recommande de l'accepter et de le rendre visible (la colonne « J »
  existe déjà) plutôt que de passer à une moyenne de points par match — parce que dans le cas réel,
  l'orage n'annule pas un match mais **toute la journée en même temps**.

**Bilan du domaine A après ces trois échanges**

**13 problèmes : 0 P0 · 5 P1 · 7 P2 · 1 P3.** Les **5 P1 ont tous leur règle métier tranchée**
(D-011 à D-014), ainsi que R-012. Seul R-013 attend une réponse extérieure.

> ⚠️ **Rien n'est corrigé.** « Validé » signifie que la règle est décidée, jamais que le code est
> écrit. Aucun fichier de l'application n'a été modifié.

**Tests réalisés**

Aucun. Toujours aucune ligne de code touchée.

**Commit**

`docs(industrialisation): trancher les cinq règles métier du domaine A` — branche
`claude/cartographie-donnees-etape-1-t1e9xq`. Contenu : `AUDIT.md`, `RISQUES.md`, `DECISIONS.md`,
`ETAT.md`, `SESSIONS.md`. **Aucun fichier de l'application.**

**Prochaine session recommandée**

Inchangée : **session 6 — ÉTAPE 2, domaine C (sécurité)**. Les décisions prises ici n'accélèrent
rien : le code ne sera écrit qu'à l'ÉTAPE 5, après les 8 audits et la validation de l'ÉTAPE 4.

### Session 5 — CLÔTURE

Romain : *« ok tout ça me va. »*

**Ce que cela valide**

- les **six compléments techniques** proposés sur le bouton forfait (annulabilité, double forfait,
  deuxième mise en garde qui affiche la conséquence, affichage « Forfait » et jamais « 0-0 »,
  déblocage de l'après-midi, clé scores conservée) → **D-011 est entièrement fixée** ;
- **D-015** — le match annulé : même mécanisme que le forfait, libellé distinct, ne compte pour
  personne. **Validée par défaut** : une règle fédérale primerait si elle existe.

**Bilan définitif du domaine A**

**13 problèmes — 0 P0 · 5 P1 · 7 P2 · 1 P3.** **Toutes les décisions métier sont prises**
(D-011 → D-015). Aucune question n'attend plus Romain sur ce domaine.

| Réf | Priorité | Décision |
|---|---|---|
| R-001 forfait | P1 | D-011 amendée — bouton par équipe, 3/0, sans score, double mise en garde, annulable |
| R-002 blocage après-midi | P1 | Aucune décision métier requise — choix technique, ÉTAPE 3 |
| R-003 planning figé | P1 | D-013 — déplacer un match · décaler la journée · 3ᵉ niveau écarté |
| R-004 départage | P1 | D-014 — confrontation directe, puis ordre alphabétique |
| R-005 score aberrant | P1 | D-012 — 2 chiffres max + confirmation |
| R-006 → R-010 | P2 | Choix techniques, ÉTAPE 3 |
| R-012 règles non publiées | P2 | Exigence posée par Romain dans D-011 |
| R-013 match annulé | P2 | D-015, par défaut |
| R-011 tirage non reproductible | P3 | Rien à faire maintenant |

**Ce qui reste ouvert, et qui ne dépend pas de ce chantier**

**I-10** — la FFR encadre-t-elle le sort d'un match qui n'a pas pu se jouer ?
`AUDIT-TOURNOI-R92.md` ne contient rien sur le sujet. Question à porter au Directeur EDR du Racing
ou au Comité 92 (même voie que Q23). Sa réponse **primerait sur D-011 et D-015**.

**Tests réalisés**

Aucun sur les cinq échanges de cette session. **Aucune ligne de code n'a été touchée.**

**Tests NON réalisés (et pourquoi)**

- Aucun scénario n'a été joué : tous les constats portent sur ce que le code **prévoit**.
  **NON VÉRIFIÉ** pour tout comportement réel.
- `backend/Tests.gs` : **NON VÉRIFIÉ** — exécutable seulement chez Google (I-02).
- Comportement en production : **INCONNU** (I-01).

**Leçon de méthode retenue**

Deux des trois questions posées à Romain en fin d'audit étaient **mal formulées** : elles
supposaient un mot technique connu (« départage ») ou imposaient implicitement ma solution
(« à partir de quel seuil ? »). Ses réponses ont produit **deux solutions meilleures que les
miennes** — la limite dure à 2 chiffres plutôt qu'un seuil d'alerte, et le bouton à règle fixe
plutôt qu'un paramètre réglable. **Poser la question sur le besoin, jamais sur la solution.**

**Commit**

`docs(industrialisation): clore le domaine A — toutes les décisions métier prises` — branche
`claude/cartographie-donnees-etape-1-t1e9xq`. **Aucun fichier de l'application.**

**Prochaine session recommandée**

**Session 6 — ÉTAPE 2, domaine C : la sécurité.** Condition de démarrage : instruction explicite
de Romain. Rien ne sera codé avant la fin des 8 audits et la validation de l'ÉTAPE 4.

---

## SESSION 6 — 2026-08-04

**Objectif**

ÉTAPE 2 — AUDIT, **domaine C : sécurité / DevSecOps**. Répondre à une seule question : **qui peut
faire quoi, et que pourrait obtenir, casser ou détourner quelqu'un de mal intentionné ?**
**Aucun fichier de l'application ne devait être modifié — et aucun ne l'a été.**

**Note de contexte** — cette session a été **relancée** : la précédente tentative n'avait pas été
fusionnée (branche restée de côté). Le point de départ réel est `dda3987`, qui contient bien tout
le travail des sessions 1 à 5. Vérifié avant de commencer.

**Ce qui a été fait**

Lecture ciblée (sans exécution, sans aucune tentative d'attaque) de tout ce qui porte le contrôle
d'accès et l'exposition des données :

- `backend/Code.gs` — les **deux points d'entrée** (`doGet`, `doPost`) et l'ordre exact dans lequel
  ils traitent une demande ; `verifierCle`, `lireCle`, `configurerCles` et le compteur
  anti-devinette (`nbEchecsCleRecents`, `incrementerEchecsCle`) ; les trois tables d'actions
  (`ACTIONS_SCORES`, `ACTIONS_TOKEN`, `ACTIONS_LECTURE`) ; `trouverClubParToken`,
  `getClubDossier`, `getConfigClub`, `getReponseInvitation`, `repondreInvitation`,
  `regenererJetonClub` ; `enregistrerMesureSponsors`, `mesureIdentifiant`, `lireMesuresSponsors` ;
  `envoyerDossierEmail`, `envoyerFeuilleJour`, `envoyerEmailAvec`, `envoyerEmailHtml`,
  `personnaliserInvitation`, `echapperHtmlServeur` ; `creerFichierImageDrive`,
  `corbeilleFichierDrive`, `enregistrerSponsor`, `supprimerSponsor` ; `genererPoulesEtPlanning`,
  `reinitialiserTournoi`, `enregistrerScore` ; `lireOngletSimple`, `lireConfigPublique`,
  `lireSponsorsPublics`, `snapshotJsonCache` ;
- `frontend/js/` — `api.js` (comment la clé est rangée et envoyée, `connexion`, `cleValide`),
  `commun.js` (`echapper`), `sponsors.js` (rendu des liens et des couleurs), et sondage des
  ~130 endroits où du texte est injecté dans une page (`tournoi.js`, `saisie.js`,
  `admin-sponsors.js`, `admin-invitations.js`, `dossier.js`) ;
- `frontend/*.html` — ressources extérieures chargées, mentions « ne pas indexer » ;
- `cloudflare/worker-tournoi.js`, `.github/workflows/pages.yml`, `.gitignore`,
  `docs/passation.md` ;
- **l'historique Git complet** : le dépôt était **tronqué** (110 enregistrements seulement) ; il a
  été **dé-tronqué** (`git fetch --unshallow`) pour permettre une vraie recherche de secrets sur
  les **513** enregistrements. Recherche sur `CLE_ADMIN`, `CLE_SCORES`, `SNAPSHOT_KEY`,
  `RELAIS_CLE` et sur les formes courantes de mot de passe en dur.

**Résultat produit**

`AUDIT.md` — nouvelle partie **DOMAINE C** (§C.0 à §C.11) :

- le verdict en une phrase, puis **13 points solides** listés d'abord (ce qu'il ne faut pas casser
  en corrigeant le reste) ;
- le **P0** et les **4 P1** au format complet de `CLAUDE.md` §1, chacun avec **criticité, scénario
  d'exploitation, impact, recommandation et difficulté de correction**, comme l'exige §6.C ;
- les 7 P2 et les 2 P3 en format court ;
- ce que le domaine C **ne peut pas** conclure, et **deux nouvelles inconnues** ;
- un récapitulatif chiffré, le fil rouge, et « si je devais ne corriger que trois choses ».

`RISQUES.md` — **R-014 à R-027** ajoutés, tous au statut **IDENTIFIÉ**, plus un tableau nouveau :
**« ce qui a été vérifié et s'est révélé sain »** (10 points).

`DECISIONS.md` — **D-016** ouverte, en attente de Romain.

`ETAT.md`, `PLAN.md` — mis à jour (compteurs, prochaine étape, familles de chantiers qui se
dessinent).

**Problèmes découverts** — 14 au total : **1 P0 · 4 P1 · 7 P2 · 2 P3**.

**Le P0** :

- **R-014** — **la seule porte ouverte sans mot de passe n'a aucune limite.** `mesureSponsors`
  reçoit les statistiques d'affichage des partenaires envoyées par les téléphones des spectateurs.
  Elle est publique **à raison** (les spectateurs n'ont pas de clé) et traitée avant tout le reste
  **à raison** (pour ne pas faire attendre le marqueur). Mais elle n'a **aucun plafond**, chaque
  envoi **ajoute une ligne** au classeur, **rien ne les efface**, et l'adresse du serveur est
  publiquement lisible. Conséquence : on peut remplir le classeur (limite Google : 10 millions de
  cases) ou saturer les exécutions simultanées, et donc **bloquer la saisie des scores le jour du
  tournoi**. Correction **facile** : le mécanisme de comptage nécessaire existe déjà dans le
  fichier (c'est celui qui compte les mauvaises tentatives de mot de passe).

**Les quatre P1**, dont trois ont la même cause :

- **R-015** — **regénérer les poules efface tous les scores, et le serveur ne vérifie jamais s'il
  y en a.** Le garde-fou vit uniquement dans le navigateur — alors que « réorganiser les poules »
  refuse, lui, côté serveur, quelques dizaines de lignes plus loin ;
- **R-016** — **la réinitialisation efface tout dès réception de la clé admin**, sans confirmation
  serveur, sans sauvegarde, sans retour en arrière — et met affiche et photo de parking à la
  corbeille du Drive ;
- **R-017** — **deux mots de passe partagés, aucune notion de personne.** Aucun retrait d'accès
  individuel possible, aucune trace de l'auteur d'un score, et un score validé peut être réécrit
  par toute personne ayant la clé SCORES. Une contestation est **inarbitrable** ;
- **R-018** — **les liens personnels des clubs sont des passe-partout permanents** : jamais
  expirés, transportés dans l'adresse de la page, transférables par simple renvoi de courriel. Ils
  ouvrent les **téléphones du jour J**. Sans conséquence aujourd'hui (aucun vrai club invité) ;
  indispensable à traiter **avant** la première invitation réelle.

**Ce qui a été vérifié et s'est révélé SAIN** — à dire aussi clairement que le reste :

- **aucun mot de passe dans l'historique Git**, sur les 513 enregistrements ;
- **aucune injection de formule possible** dans le classeur (format « texte » forcé, ~30 endroits) ;
- **aucun oubli d'échappement trouvé** dans les pages (vérification par sondage, pas exhaustive) ;
- **liens des partenaires bornés** à `http(s)://` — un lien piégé est refusé ; couleurs validées ;
- **impossible de détourner le destinataire d'un courriel** : l'adresse est toujours relue dans le
  classeur ;
- **cloisonnement entre clubs correct** : un jeton n'ouvre que sa propre fiche, et **aucun email
  de club n'est jamais renvoyé** ;
- **dépôt d'images verrouillé** (formats + 5 Mo), **relevés des partenaires entièrement
  revalidés**, **messages d'erreur génériques**.

**Deux nouvelles inconnues, toutes deux levables par Romain en deux minutes**

- **I-11** — comment la Web App est **réellement publiée** chez Google (« Qui a accès » = tout le
  monde, ou tout le monde disposant d'un compte Google ?). Ce réglage change complètement
  l'exposition de R-014, et il n'est **pas dans le code** ;
- **I-12** — les deux mots de passe actuels sont-ils des **suites aléatoires** ou des **mots
  choisis à la main** ? C'est la donnée qui décide si **R-019** est théorique ou sérieux.

**Décision ouverte**

- **D-016** — faut-il corriger **R-014** tout de suite, hors de l'ordre du chantier ?
  Trois options présentées (attendre / le corriger seul / le corriger avec R-015 et R-016).
  **Recommandation : le corriger seul.** En attente de Romain.

**Non-régression**

**Sans objet** : aucun fichier de l'application n'a été touché. Aucune fonctionnalité n'a pu être
affectée, et aucune n'a été vérifiée non plus. Tous les constats portent sur **ce que le code
prévoit**, jamais sur ce qui se produit réellement — **NON VÉRIFIÉ** pour tout comportement réel,
et **INCONNU** (I-01) pour la version en service chez Google.

**Ce qui n'a PAS été fait, volontairement**

- **aucune tentative d'attaque, aucun test d'intrusion** : lecture de code uniquement ;
- **aucune analyse des bibliothèques extérieures** (impossible sans connaître leur version — c'est
  précisément R-024) ;
- **aucune appréciation RGPD** : c'est le domaine B, session 7. Les points croisés en chemin
  (polices chargées depuis Google, effacement partiel à la réinitialisation) y ont été renvoyés,
  pas jugés ici ;
- **aucune certification de sécurité**, et il n'y en aura jamais (`CLAUDE.md` §10). Cet audit dit
  ce qui a été trouvé, **pas** qu'il n'y a rien d'autre.

**Prochaine session recommandée**

**Session 7 — ÉTAPE 2, domaine B : la protection des données (RGPD).** C'est l'ordre validé
(D-010), et c'est le bon moment : le classeur ne contient **aucune donnée personnelle de tiers**
aujourd'hui (I-03, I-04). Le domaine B doit être traité **avant la première invitation réelle**.

**Mais avant** : la décision **D-016**, et si possible les réponses à **I-11** et **I-12**.

---

---

## SESSION 6 (suite) — 2026-08-04 — correction du P0

**Ce qui a déclenché cette suite**

Deux réponses de Romain, le même jour :

1. **D-016, option (b)** — *« va pour B alors je te suis dans ton raisonnement »* : R-014 est
   corrigé **seul**, tout de suite, hors de l'ordre normal du chantier ;
2. **I-12 levée, et défavorablement** — *« pour les MDP c'est moi qui ai choisi ce sont des
   mots »*.

Il a également fourni une capture de l'écran de déploiement Apps Script, qui **lève I-11**.

**Ce qui a été modifié** *(commit `c1948fc`)*

Premier commit de code du chantier d'industrialisation. Trois fichiers :

- `backend/Code.gs` — trois plafonds sur `mesureSponsors` : `MESURE_MAX_LIGNES` (100 000 lignes,
  plafond **dur** lu dans le classeur), `MESURE_MAX_FENETRE` (30 000 / 6 h) et
  `MESURE_MAX_APPAREIL` (30 / h). Nouvelles fonctions `mesureMotifRefus` (cœur **pur**),
  `mesureCompteurFenetre` (cache injecté, donc testable) et `mesureDebitAutorise`. Les plafonds de
  débit sont appelés depuis `doPost` **avant** `openById`, pour qu'une requête refusée coûte une
  lecture de mémoire au lieu d'une demi-seconde de serveur ;
- `backend/Tests.gs` — **9 tests**, enregistrés dans `lancerTestsFFR` ;
- `frontend/js/admin-sponsors.js` — le diagnostic « Tester la remontée » distingue désormais
  « rien écrit parce qu'un plafond est atteint » de « écriture réussie ». **Nécessité technique**,
  pas une amélioration d'ergonomie : sans cela, la correction aurait rendu ce diagnostic menteur
  (✅ écriture, puis ❌ relecture introuvable, et un verdict qui envoie chercher une panne
  inexistante). C'est la seule raison pour laquelle un fichier du frontend est dans ce commit.

**Deux choix de mise en œuvre à connaître**

- **la clé de cache porte le numéro de tranche horaire**, et non un compteur reconduit. Sans cela,
  chaque envoi aurait repoussé la date d'expiration : le plafond, une fois atteint, ne se serait
  **jamais** relâché tant que le trafic dure — et ce sont les spectateurs légitimes qui auraient
  été bloqués ;
- **un compteur inconnu (cache en panne) ne refuse jamais.** Une panne de mémoire temporaire ne
  doit pas éteindre la mesure des partenaires. Le plafond dur, lui, reste actif dans tous les cas.

**Vérifications réellement faites**

- ✅ syntaxe des trois fichiers contrôlée ;
- ✅ **16 vérifications sur 16 passent** : les fonctions ajoutées étant pures, les 9 tests ont pu
  être **réellement exécutés** hors de Google, en les extrayant dans un harnais jetable ;
- ✅ relecture des chemins voisins : `doPost` n'est modifié qu'à l'intérieur de la branche
  `mesureSponsors`, qui sort avant tout le reste. `enregistrerScore` et les 49 autres actions
  sont **intacts**.

**Ce qui reste NON VÉRIFIÉ — à ne pas confondre avec « ça marche »**

- ❌ **les 301 tests existants n'ont pas été lancés** : ils n'existent que dans Apps Script
  (M-03, I-02) ;
- ❌ **rien n'a été exécuté en conditions réelles.** Le comportement sous charge est **INCONNU** ;
- ❌ **la correction n'est PAS en production.** Le backend doit être recopié à la main chez Google
  et redéployé. Tant que ce n'est pas fait, **la version en service est l'ancienne, sans
  plafond** — nouvelle inconnue **I-13**.

**Portée réelle de la correction, dite sans exagération**

Elle supprime le **dégât durable** (le classeur rempli, donc la saisie des scores bloquée) et rend
l'abus beaucoup plus coûteux. Elle **ne rend pas** l'adresse immunisée contre un envoi massif :
Apps Script ne fournit pas l'adresse du visiteur, on ne peut donc pas distinguer un abuseur d'un
spectateur. Ce qui est visé, et atteint : **un abus n'empêche plus jamais la saisie des scores.**

**Requalification : R-019 passe de P2 à P1**

Les clés étant des **mots**, les ~8 600 essais par jour tolérés par le garde-fou anti-devinette
cessent d'être une limite théorique. Un dictionnaire courant tient en quelques dizaines de
milliers d'entrées. Et la clé ADMIN ouvre **tout** : effacer les scores, réinitialiser, lire le
carnet d'adresses, envoyer des courriels sous l'adresse du propriétaire.

**Le remède ne demande aucun code** — remplacer les deux clés par des suites aléatoires, via le
menu « Tournoi R92 → Configurer les clés » du classeur. C'est la **décision D-017**, en attente.
La vraie question n'est pas technique : où ranger des clés qui ne se retiennent plus, et comment
transmettre celle des scores aux bénévoles le jour J.

**Deux inconnues levées, une ouverte**

- ✅ **I-11** — la Web App s'exécute au nom du propriétaire, et son accès est ouvert à **« Tout le
  monde »** (donc sans compte Google). Réglage **nécessaire**, rien à y changer : cela confirme
  simplement que R-014 n'exigeait aucun préalable ;
- ⚠️ **I-12** — les clés sont des mots (voir ci-dessus) ;
- 🆕 **I-13** — le redéploiement a-t-il eu lieu, et la correction est-elle active ?

**Prochaine session recommandée** — inchangée : **session 7, ÉTAPE 2, domaine B (RGPD)**.
Mais **deux gestes de Romain d'abord** : redéployer le backend, et remplacer les deux clés.

---

---

## SESSION 6 (fin) — 2026-08-04 — vérification en conditions réelles

**Ce que Romain a fait de son côté**

1. **redéployé le backend** chez Google ;
2. lancé `lancerTestsFFR` dans Apps Script → **573 / 573 OK** ;
3. rejoué le diagnostic **« Tester la remontée »** de l'écran Partenaires →
   *« ✅ Écriture · ✅ Relecture · ✅ 109 relevés réels déjà remontés des spectateurs. La chaîne
   fonctionne de bout en bout. »*

**Ce que cela prouve, et ce que cela ne prouve pas**

| Question | Réponse |
|---|---|
| Le code en service est-il bien le nouveau ? | ✅ oui — **I-13 levée** |
| Les tests passent-ils ? | ✅ **573/573** — **I-02 levée** |
| Les 16 vérifications ajoutées étaient-elles du lot ? | ✅ oui — **contrôle croisé** : 564 appels écrits en dur dans `Tests.gs` + 9 situés dans des boucles = 573 |
| La mesure des partenaires fonctionne-t-elle toujours ? | ✅ oui — écriture, relecture, **109 relevés réels**. C'est la **preuve de non-régression** |
| Que se passe-t-il une fois un plafond franchi ? | ❌ **NON VÉRIFIÉ en réel** — prouvé par les tests unitaires seulement |

Le dernier point mérite d'être explicité plutôt que passé sous silence : personne n'a envoyé
30 001 relevés pour observer le refus, et personne ne le fera. Le bouton de diagnostic ne peut pas
davantage l'atteindre — il tire un identifiant d'appareil **neuf à chaque essai**, donc il ne
consomme jamais le plafond par appareil. C'est voulu : un outil de diagnostic qui se bloquerait
lui-même serait pire qu'inutile.

**Conséquence sur le registre**

**R-014 passe au statut TESTÉ** — le **premier problème du chantier** à l'atteindre. Le chantier
**C-001** est clos dans `PLAN.md`.

**Ce que cela ne change PAS**

- **M-03 reste ouvert.** Le harnais fonctionne, mais rien ne le lance automatiquement : c'est un
  geste manuel, donc oubliable. À reprendre au **domaine D**. Une atténuation utile a été validée
  au passage : écrire les fonctions en **cœur pur** permet de les rejouer hors de Google, ce qui a
  permis de vérifier les 16 nouvelles avant même le redéploiement ;
- **R-019 reste P1** et attend toujours **D-017** : remplacer les deux mots de passe, qui sont des
  mots choisis à la main, par des suites aléatoires. Aucun code — cinq minutes dans le menu du
  classeur.

**Prochaine session recommandée** — **session 7, ÉTAPE 2, domaine B (RGPD)**.

---

---

## SESSION 6 — CLÔTURE — 2026-08-04

**PR #175 fusionnée dans `main`** (commit de fusion `7617d6c`). Les quatre commits de la session y
sont : l'audit du domaine C, la correction du P0, la mise à jour du suivi, la vérification en
conditions réelles.

**Pourquoi cette fiche existe** — la session 6 a dû être **relancée** parce que le travail des
sessions 4 et 5 vivait sur une branche **non fusionnée** : une session repartant de `main` ne le
voyait pas et aurait pu le refaire. La leçon est simple et vaut pour la suite :

> **Une session n'est réellement terminée que lorsque son travail est dans `main`.**
> Tant qu'il vit sur une branche, il est invisible pour la session suivante.

`ETAT.md` porte désormais, en tête, le **commit de référence sur `main`** et la mention explicite
que le travail y est fusionné. C'est ce qu'une prochaine session lira en premier.

**Bilan chiffré de la session 6**

| | |
|---|---|
| Domaines audités | **2 sur 8** — A (métier, session 5) et C (sécurité, session 6) |
| Problèmes du domaine C | 14 — **1 P0 · 5 P1 · 6 P2 · 2 P3** |
| Problèmes réglés | **1** — R-014, statut **TESTÉ** (le premier du chantier) |
| Inconnues levées | **I-02**, **I-11**, **I-12**, **I-13** |
| Décisions | **D-016** validée · **D-017** ouverte, en attente |
| Fichiers de l'application modifiés | 3 (`Code.gs`, `Tests.gs`, `admin-sponsors.js`) |

**Ce qui attend Romain, et lui seul** — **D-017** : remplacer les deux clés, qui sont des mots
choisis à la main, par des suites aléatoires (menu « Tournoi R92 → Configurer les clés »). Aucun
code. Tant que ce n'est pas fait, **R-019 reste P1**.

**Prochaine session** — **session 7, ÉTAPE 2, domaine B (RGPD)**, à démarrer sur instruction
explicite de Romain.

---

---

## SESSION 7 — 2026-08-05

**Objectif** : ÉTAPE 2, **domaine B — RGPD / protection des données**. Auditer, classer, expliquer.
**Ne rien modifier dans l'application.**

**Branche** : `claude/industrialisation-rgpd-donnees-n03yu8`, partie de `77f8ae7` (`main`).

### Ce qui a été fait

Lecture ciblée du dépôt sous l'angle « données personnelles », à partir du volet C de la
cartographie (session 4) qui avait déjà ouvert tous les tiroirs. **Aucun fichier de l'application
n'a été modifié.**

Vérifications menées, et ce qu'elles ont donné :

| Ce qui a été cherché | Résultat |
|---|---|
| Les mots *RGPD*, *confidentialité*, *données personnelles*, *mentions légales*, *CNIL*, *consentement* dans toutes les pages, tout le serveur et tous les modèles de courriels | **Zéro occurrence** → R-028 |
| Le fonctionnement réel de la mesure de visibilité des partenaires (`sponsors.js`, `tournoi.js`) | Identifiant d'appareil en mémoire longue, compteurs par tranche de 30 min, envois à 20 s / 10 min / fermeture de page → R-029 |
| Les listes blanches publiques (`filtrerConfigPublique`) | Confirmées ; `contact_reponse_email` est bien public, `contact_reponse_tel` bien exclu → R-038 |
| La colonne `arbitre` de l'onglet `Matchs` | ✅ C'est un **identifiant d'équipe**, jamais un nom de personne. La cartographie disait vrai |
| Les ressources chargées depuis l'extérieur | Polices Google sur **7 pages** ; aucun autre appel externe → R-037 |
| Le chemin de suppression d'un club (`supprimerClubInvite`) | Existe, mais **refusé** si une équipe du club figure dans un match → R-031 |
| Le champ libre « équipes étrangères » (`Code.gs` 2490) | Confirmé : seul endroit où des enfants peuvent être nommés ; part dans le PDF fabriqué sur l'appareil → R-034 |
| Les bibliothèques et fichiers non chargés | `docxtemplater` et `pizzip` ne sont chargés par **aucune page**, et le modèle `autorisation-droit-image-template.docx` est **orphelin** → R-036 |

### La trouvaille de la session

**Le modèle d'autorisation de droit à l'image existe dans le dépôt, bien écrit, et plus rien ne
l'utilise.** Le `CHANGELOG` du 2026-08-03 est explicite : le bouton a été retiré **sur décision du
club**. Ce n'est donc **pas un oubli du code**, et l'audit ne le présente pas comme tel — mais
rien n'écrit ce qui l'a remplacé, alors que des photos d'enfants seront prises et publiées. C'est
devenu **R-036** et le point inconnu **I-15** : une question à poser au club, pas un chantier.

### Résultat

**13 problèmes** — **0 P0**, **3 P1**, **9 P2**, **1 P3**. Total du chantier : **40 problèmes**.

- **R-028** *(P1)* — personne n'est jamais informé de rien ;
- **R-029** *(P1)* — la mesure des partenaires écrit sur le téléphone des spectateurs sans le
  dire. **Seul problème du domaine qui tourne déjà en production** ;
- **R-030** *(P1)* — aucune durée de conservation, aucune purge, nulle part ;
- R-031 → R-039 *(P2)* · R-040 *(P3)*.

**Pourquoi aucun P0** — et c'est important de le dire, sinon le chiffre ne veut rien dire : un P0
supposerait une exposition **grave** de données personnelles. Or le carnet d'adresses est exclu
des données publiques, il exige la clé admin, le classeur est privé (I-06), et **il ne contient
aujourd'hui aucune donnée de tiers** (I-03, I-04).

### Trois décisions ouvertes

**D-018** (que dit-on aux gens ?), **D-019** (que fait-on de la mesure des partenaires ?),
**D-020** (combien de temps garde-t-on quoi ?). **Aucune ne demande d'écrire du code.** Toutes
les trois doivent être prises **avant la première invitation réelle**.

### Trois inconnues nouvelles

**I-14** (qui est responsable, et le classeur doit-il rester dans un compte Google individuel ?),
**I-15** (le droit à l'image est-il géré ailleurs ?), **I-16** (le site vitrine porte-t-il déjà
des mentions légales ?).

### Ce qui n'a PAS été fait, et pourquoi

- ❌ **Aucune conformité n'est prononcée** — `CLAUDE.md` §6.B l'interdit, et c'est une bonne règle ;
- ❌ **Rien n'a été exécuté** : que l'email d'un club ne sorte jamais est **écrit dans le code**,
  ce n'est pas **prouvé**. Statut **NON VÉRIFIÉ** → domaine D ;
- ❌ **Le contenu réel du classeur n'a pas été lu** — impossible depuis le dépôt ;
- ❌ **Le site vitrine `boutique-r92` n'a pas été audité** (autre dépôt, D-005 en attente) — or
  c'est lui qui accueillerait la page « Vos données ».

### Prochaine session recommandée

**Session 8 — ÉTAPE 2, domaine D : les tests (QA).** C'est l'ordre de D-010, et c'est le bon
moment : trois domaines ont produit **40 problèmes**, et pas un seul n'a pu être prouvé par un
test lancé depuis ici (**M-03**). Avant de corriger quoi que ce soit à l'ÉTAPE 5, il faut savoir
comment on prouvera que rien n'est cassé.

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 7 — CLÔTURE — 2026-08-05

**Objectif de la session : atteint.** Le domaine B est audité, classé et expliqué.

**Fichiers modifiés** — **documentation uniquement** :

| Fichier | Ce qui a changé |
|---|---|
| `docs/industrialisation/AUDIT.md` | Section **DOMAINE B** complète (B.0 → B.9) |
| `docs/industrialisation/RISQUES.md` | 13 problèmes R-028 → R-040, tableau de synthèse, « ce qui s'est révélé sain (domaine B) » |
| `docs/industrialisation/DECISIONS.md` | **D-018**, **D-019**, **D-020** en attente |
| `docs/industrialisation/ETAT.md` | Avancement, prochaine étape, problèmes, décisions, I-14 → I-16 |
| `docs/industrialisation/PLAN.md` | Domaine B ✅, familles de chantiers complétées |
| `docs/industrialisation/SESSIONS.md` | Cette fiche |

**Aucun fichier de l'application n'a été modifié.** Aucun redéploiement nécessaire.

**Rappel de méthode** : rien n'est corrigé. Les 13 problèmes sont au statut **IDENTIFIÉ**, et les
trois décisions attendent Romain. Le passage à **EN COURS** n'aura pas lieu avant la fin des 8
audits et la validation de l'ÉTAPE 4 (`CLAUDE.md` §7).

---

## SESSION 7 — COMPLÉMENT — 2026-08-05 — réponses de Romain, et une correction

Après le rapport de fin de session, Romain a répondu aux deux premières questions ouvertes. Ses
réponses **corrigent une erreur** de la documentation et **font naître deux décisions**.

### Question 1 — « Quand invites-tu de vrais clubs ? »

> *« Je ne sais pas, c'est juste sincère. Je suis sur un prototype de démo. Je ne sais même pas
> si celui-ci, même après la phase d'industrialisation, trouvera son public. »*

**Conséquence** : aucune exception à l'ordre du chantier. Et une proposition — **D-022** :
remplacer la date, qu'il n'a pas, par un **déclencheur** — *le jour où l'email d'une personne qui
n'est ni lui ni son épouse entre dans le classeur*. Un prototype ne bascule pas à une date : il
bascule le jour où quelqu'un dit « on le fait ». Le déclencheur rend ce moment visible.

### Question 2 — « Qui est responsable, et où doivent vivre les données ? »

> *« Dans cette phase de test tout est à moi. […] Tout est sur mes comptes donc tout cela
> m'appartient. Par ailleurs je viens de désactiver la pub par précaution depuis l'onglet
> partenariat. Je vais aussi être honnête : aujourd'hui ça fonctionne avec mon classeur ; à
> terme, si cela doit devenir un SaaS, ce ne sera plus possible. Il faudra scinder tout ça. »*

**Conséquence** : **D-021** — le compte individuel est le bon choix pour un prototype, rien ne
change maintenant, et la question du responsable se repose au déclencheur. **R-040 (P3) est
confirmé par Romain lui-même**, avec une précision qui compte : le passage en SaaS n'est pas
seulement un sujet de contrat, c'est un sujet **d'architecture**.

### ⚠️ Une erreur de la documentation, corrigée

La documentation écrite en **session 6** affirmait que les 109 relevés de mesure des partenaires
venaient **« de spectateurs »**. **C'est faux** : ils viennent des **propres appareils de
Romain**, ouverts depuis plusieurs machines pour vérifier que la remontée ne partait pas du seul
navigateur de son ordinateur. L'affirmation a été reprise telle quelle dans l'audit du domaine B
avant d'être corrigée.

**Ce que cela change** :

- **Aucune personne extérieure n'a jamais été mesurée** par ce dispositif ;
- **R-029 n'est donc pas « le seul problème qui tourne déjà sur de vraies personnes »** — c'était
  la formulation de l'audit initial, elle était fausse ;
- **la preuve de non-régression de R-014 tient entièrement** : des relevés ont bien été écrits
  puis relus. Seule leur **origine** était mal décrite. R-014 reste **TESTÉ**.

Corrigé dans `AUDIT.md`, `ETAT.md`, `RISQUES.md` et `DECISIONS.md`.

### R-029 passe au statut SUSPENDU — et la vérification qui va avec

Romain a **désactivé les partenaires** depuis l'écran Partenaires. **Vérifié dans le code** que
cela coupe bien la mesure *(CERTAIN)* :

| Chemin | Preuve |
|---|---|
| Page publique | `frontend/js/tournoi.js` ligne 251 — sortie de fonction **avant** `sponsorsArmerEnvoi()` (ligne 297) si `sponsors_actifs` est faux |
| Dossier club | `frontend/js/dossier.js` ligne 374 — `if (!reglages.actifs) return '';` : aucun logo produit, donc la mesure n'est jamais branchée |
| **Exception connue** | `?demo=sponsors` force `actifs = true` (`sponsors.js` ligne 147) et **rallume la mesure**. Paramètre à taper à la main, pas un chemin emprunté par hasard |

**R-029 reste P1** — « à corriger avant une utilisation réelle », et rallumer l'interrupteur *est*
l'utilisation réelle. Son statut opérationnel devient **SUSPENDU** : une pause, pas une
correction. Un clic la défait.

> **Dit honnêtement** : la désactivation **n'était pas nécessaire**, puisque personne d'extérieur
> n'avait été mesuré. Ce n'est pas une erreur pour autant — elle ne coûte rien. Son seul coût est
> **commercial** : sans partenaires affichés, la démonstration perd un argument. **D-019** reste
> la vraie réponse.

### Questions encore ouvertes

**D-018** (les textes), **D-019** (la mesure), **D-020** (les durées), **I-15** (droit à l'image),
**I-16** (mentions légales du site vitrine). Elles seront posées **une par une**, à la demande de
Romain.
