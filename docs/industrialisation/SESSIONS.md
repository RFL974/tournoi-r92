# JOURNAL DES SESSIONS — Industrialisation de Tournoi R92

> Une fiche par session de travail. Ce journal sert à répondre à : « qu'est-ce qui a réellement
> été fait, et qu'est-ce qui ne l'a **pas** été ? »
>
> ⚠️ **Ordre de lecture** : les sessions 1 et 2 sont en **haut** du fichier ; à partir de la
> session 3, les fiches sont ajoutées **à la suite, en bas** (la plus récente en dernier). La
> consigne d'origine (« le plus récent en haut ») n'a pas été suivie, et il vaut mieux le dire
> que de laisser chercher.

> 📕 **Ce journal raconte le chemin, pas le résultat.** Le résultat de l'ÉTAPE 2 — les 8 domaines,
> les 88 problèmes, ce qui s'est révélé sain — est rassemblé dans
> [`RAPPORT-AUDIT.md`](RAPPORT-AUDIT.md) (session 12).
>
> ⚠️ **Les chiffres inscrits dans les fiches de session ci-dessous sont datés et ne sont PAS
> réécrits** : une fiche qui dit « 81 problèmes » en session 11 disait vrai **ce jour-là**. Le
> compte à jour est **88**, et il vit dans `ETAT.md` et `RISQUES.md`. Réécrire un journal
> a posteriori ferait perdre la seule chose qu'il apporte — **ce qu'on savait, et quand**.

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

---

# SESSION 8 — ÉTAPE 2, domaine D : QA / Tests

**Date** : 2026-08-05
**Objectif** : auditer le domaine **D (QA / tests)**, 4ᵉ des 8 domaines dans l'ordre validé
par **D-010** (A → C → B → **D** → E → F → G → H).
**Consigne de Romain** : *« Session 8 — ÉTAPE 2, domaine D : les tests (QA) »*
**Modification de l'application** : **AUCUNE.** Documentation uniquement (D-006).

---

## 0. Mise à jour avant lecture (`CLAUDE.md` §12.3)

`git fetch origin` puis `git status -sb` → `## main...origin/main`, **0 commit d'écart**, dépôt
propre. Contrôle croisé `git rev-list --left-right --count main...origin/main` → `0 0`.
Commit de départ : **`bb0b917`**.

> Le piège documenté (une copie locale en retard qui fait lire un état périmé) **ne s'est pas
> produit cette fois** — c'est la première session où l'étape 0 se déroule sans incident depuis
> qu'elle a été écrite.

---

## 1. Ce qui a été fait

Un audit du domaine D, en cinq temps :

1. **inventaire** du harnais `backend/Tests.gs` et du reste du dépôt ;
2. **mesure de couverture par exécution instrumentée** — chaque fonction de `Code.gs` a été
   enveloppée pour savoir si les tests la traversent réellement ;
3. **recherche des cas limites** listés par `CLAUDE.md` §6.D : doublons, saisies invalides,
   double-clic, perte de connexion, concurrence, caractères spéciaux ;
4. **vérification du couple serveur / navigateur** — les règles écrites en double ;
5. **contrôle des preuves déjà inscrites au dossier** — c'est ce dernier point qui a produit le
   constat le plus gênant.

**Livrables** : `AUDIT.md` §D (nouvelle section, ~610 lignes), 10 problèmes **R-041 → R-050** dans
`RISQUES.md`, un risque de méthode **M-04**, une décision en attente **D-025**, une inconnue
**I-17**, et la requalification de **M-03**.

---

## 2. Le résultat, en trois constats

### ① Le harnais est meilleur que prévu — et tourne hors de Google

**`589 vérifications, 278 tests, 0 échec.`** Et surtout : **`Code.gs` + `Tests.gs` chargés dans un
exécuteur JavaScript ordinaire, avec une vingtaine de lignes de doublures (journal, générateur
d'identifiants, formateur de dates) → `589/589 OK` en ~1 seconde.**

C'est ce qui **lève l'essentiel de M-03**, traîné depuis la session 1. Le titre de ce risque —
*« aucun test ne peut être lancé depuis cet ordinateur »* — était **faux**. Les tests n'étaient
pas prisonniers de Google, ils étaient **écrits pour** Google. M-03 passe de **P1 à P2** : il ne
reste que « rien ne les déclenche automatiquement ».

### ② Mais ils ne regardent pas là où ça compte

Couverture **mesurée** (pas estimée) : **104 fonctions sur 277 traversées = 38 %**.

| Fonction | Rôle | Testée ? |
|---|---|---|
| `enregistrerResultat` | attribue les points d'un match | ❌ **jamais exécutée** |
| `calculerClassement` | assemble le classement des poules | ❌ **jamais exécutée** |
| `comparerClassement` | **le départage** | ⚠️ exécutée **par accident**, aucune vérification ne porte sur elle |
| `enregistrerScore` | le geste le plus répété du jour J, **6 garde-fous** | ❌ **jamais exécutée** |

Et le détail le plus parlant : **dans les 3 711 lignes du fichier de tests, un seul endroit
fabrique des statistiques d'équipe, et il met toujours `diff: 0, bp: 0`.** Conséquence exacte :
**sur 589 vérifications, le 2ᵉ critère de départage (la différence) et le 3ᵉ (les points marqués)
ne sont jamais mis à l'épreuve. Pas une fois.**

Côté navigateur : **17 712 lignes, 0 test** — et `.github/workflows/pages.yml` les publie sur
Internet **à chaque envoi sur `main`**, sans lancer quoi que ce soit, **pas même un contrôle de
syntaxe**.

### ③ Une preuve inscrite au dossier était fausse

C'est le constat le plus inconfortable, et il porte sur **notre méthode**, pas sur le code.

`ETAT.md` et `RISQUES.md` justifiaient le statut **TESTÉ** de **R-014** (le P0 de sécurité) par :
*« 573/573 passent chez Google, et le contrôle croisé confirme que les 16 vérifications ajoutées
étaient du lot »*.

**Vérification faite en rejouant les deux versions du fichier :**

| Version | Vérifications |
|---|---|
| Avant la correction (`c1948fc^`) | **573** |
| Après la correction (aujourd'hui) | **589** |

**573 est exactement le compte du fichier SANS les 16 vérifications.** Le contrôle croisé
rapprochait 564 appels comptés sur le fichier **d'après** d'un total obtenu **avant** ; les vrais
comptes sont 547 + 26 = 573 et 563 + 26 = 589.

**Explication la plus probable** *(PROBABLE)* : `Code.gs` a été recollé chez Google, **pas**
`Tests.gs`. Ce sont deux fichiers, et rien ne le rappelle.

**Ce qui tient quand même** : les 16 vérifications **passent** — exécutées cette session sur le
code du dépôt, avec les 573 autres. La correction est donc **mieux** prouvée qu'avant, mais **pour
une autre raison** que celle inscrite. Ce qui manque est qu'elles tournent **là où c'est utile**.

→ **M-04** (nouveau risque de méthode, P1) et **I-17** (geste de 2 minutes pour Romain).

---

## 3. Ce qui a été mis à jour

| Fichier | Ce qui change |
|---|---|
| `AUDIT.md` | **Nouvelle section DOMAINE D** (§D.0 → §D.11) : verdict, ce qui est solide, 4 fiches P1 en 6 points, les P2, le P3, la preuve tombée (§D.8), **les 4 lots de tests proposés** (§D.9), les limites (§D.10) |
| `RISQUES.md` | **R-041 → R-050** · « ce qui s'est révélé sain — domaine D » · **tableau de couverture mesurée** · **M-03 requalifié P1 → P2 (largement levé)** · **M-04 créé** · encadré sur la preuve tombée · synthèse 40 → **50 problèmes** |
| `ETAT.md` | §1 réécrite · domaine D clos · **I-17** ajoutée · §5 (statut de R-014 rectifié) · §6 (fil rouge D + ce qui est sain) · §9 (chiffres à jour + publication sans contrôle) · §10 (registre : **D-025** et **I-17**) · prochaine session = **domaine E** |
| `PLAN.md` | Domaine D marqué FAIT · domaine E prochain · **4 nouvelles familles de chantiers** dessinées par le domaine D |
| `DECISIONS.md` | **D-025** — quels tests écrit-on, et dans quel ordre (4 lots + recommandation) |

---

## 4. Ce qui a été VÉRIFIÉ, et comment

| Affirmation | Preuve |
|---|---|
| 589 vérifications, 0 échec | Exécution réelle du harnais hors de Google (~1 s) |
| Couverture 38 % (104/277) | Exécution **instrumentée** : chaque fonction enveloppée, appels comptés |
| 573 = version d'avant R-014 | `git show c1948fc^:backend/Tests.gs` puis exécution de cette version |
| Départage jamais éprouvé | `grep "diff:\|bp:\|bc:"` sur `Tests.gs` → **une seule occurrence**, à `0` |
| 17 712 lignes de JS sans test | `wc -l frontend/js/*.js` ; aucun fichier de test, aucun `package.json` |
| Publication sans contrôle | Lecture de `.github/workflows/pages.yml` — aucune étape de test |
| Verrou d'écriture | `LockService.getScriptLock()` + `tryLock(20000)` + `finally { releaseLock() }` |
| Doublons acceptés par le serveur | Lecture de `ajouterEquipe` — seul contrôle : nom non vide |
| `apiPost` sans délai maximum | Lecture de `frontend/js/api.js` — le délai n'existe que sur `apiGet` |
| Test annoncé et inexistant | `docs/sponsors.md` cite un test ; `SPONSORS_APERCU_LARGEUR` n'apparaît dans aucun test |

### Ce qui reste NON VÉRIFIÉ

- **Le code en service chez Google passe-t-il les 589 ?** **INCONNU** — c'est **M-02**, et **I-17**
  est le geste qui permettrait de le savoir ;
- **Les 173 fonctions jamais exécutées contiennent-elles des bugs ?** **INCONNU** — ce domaine dit
  où on ne regarde pas, **pas** où ça casse ;
- **Les 17 712 lignes du navigateur fonctionnent-elles ?** **NON VÉRIFIÉ** — elles fonctionnent en
  usage réel, ce qui est une preuve d'usage, pas une preuve de non-régression ;
- **La couverture mesurée reflète-t-elle Apps Script ?** **PROBABLE** — mesurée hors de Google
  avec des doublures ; les tests étant purs, le chemin devrait être identique, mais ça n'a pas été
  confronté à une exécution réelle.

---

## 5. Ce qui n'a PAS été fait

- **Aucun test n'a été écrit.** `CLAUDE.md` §6.D l'interdit avant que les scénarios soient
  proposés et choisis : c'est **D-025**, en attente ;
- **Aucun fichier de l'application modifié**, conformément à l'ÉTAPE 2 ;
- **Aucun problème corrigé** — les 10 sont au statut **IDENTIFIÉ** ;
- **Aucune décision prise à la place de Romain** (**D-024**).

---

## 6. Prochaine session recommandée

**Session 9 — ÉTAPE 2, domaine E : UX / UI / accessibilité.**

Ordre D-010. Le domaine E regarde l'application **comme un bénévole la voit** : téléphone, debout,
dehors, sous pression. Il hérite déjà de **R-048** (un envoi qui n'aboutit pas fige le bouton sans
rien dire), de **D-012** (confirmation avant de valider un score), de **D-011** (le bouton
« Forfait » et sa double mise en garde), de **R-007** et **R-010** (messages qui ne disent pas ce
qu'il faut faire).

> ⚠️ **Inconnue à lever en début de session** : **I-05** — *qui utilise l'administration le jour J,
> et sur quel matériel ?* Sans cette réponse, le domaine E raisonnerait sur un utilisateur
> imaginaire.

**Condition de démarrage** : instruction explicite de Romain.

---

## Session 8 — ADDENDUM du même jour : I-17 levée, M-04 refermé

**2026-08-05, après la clôture de la session.**

Romain a collé `backend/Tests.gs` dans le projet Apps Script et relancé `lancerTestsFFR`.
Journal d'exécution :

```
R92 — 589/589 OK, 0 FAIL
```

### Ce qui a été vérifié sur la capture fournie

| Contrôle | Attendu | Constaté |
|---|---|---|
| Nombre de vérifications | **589** *(573 = l'ancien fichier)* | ✅ **589**, 0 échec |
| Dernière ligne du fichier chez Google | **3711** *(= `wc -l backend/Tests.gs`)* | ✅ **3711** |
| Trois dernières assertions | `identifiant trop court` · `non alphanumérique` · `normal → accepté` | ✅ identiques mot pour mot au dépôt |

**C'est bien la version actuelle du dépôt qui a tourné chez Google.**

### Conséquences sur le dossier

- **I-17 — LEVÉE.** Déplacée dans les « points levés » de `ETAT.md` §8 ;
- **M-04 — TRAITÉ** pour le geste. Il ne subsiste que la **règle d'écriture permanente** : toujours
  écrire le nombre **attendu** à côté du nombre obtenu, et toujours dire **quels fichiers** ont été
  recollés ;
- **R-014** retrouve sa deuxième preuve, cette fois exacte. Statut **TESTÉ** confirmé, sans réserve
  sur ce point.

### ⚠️ Une précision que je dois apporter à ma propre formulation

Pendant l'audit, j'ai écrit que ce geste vérifierait « que le `Code.gs` **en service** est le bon ».
**C'est trop large, et il faut le corriger** : les tests s'exécutent dans l'**éditeur** Apps Script,
donc contre le `Code.gs` **enregistré dans le projet**.

C'est déjà beaucoup — cela prouve que ce code passe les 589 vérifications, R-014 comprise. Mais
Apps Script distingue **le code du projet** et **le déploiement** : l'adresse web publique peut
rester figée sur une version antérieure. **M-02 est fortement réduit, pas supprimé.** La seule
vérification qui interroge la vraie adresse publique reste le bouton « Tester la remontée » de
l'écran Partenaires.

### 🪤 Piège de nommage, pour les sessions suivantes

Dans le projet Apps Script, le fichier s'appelle **`Test.gs`** (au singulier) ; dans le dépôt,
**`Tests.gs`**. C'est le même fichier — ne pas le prendre pour un second.

### Ce qui reste à Romain

**Un seul geste**, et il n'a pas bougé : **D-017** — remplacer les deux mots de passe par des
suites aléatoires (menu du classeur → « Configurer les clés »), ce qui referme **R-019**.

---

## SESSION 9 — 2026-08-05 — ÉTAPE 2, domaine E : l'expérience d'utilisation

**Objectif** : auditer le domaine **E (UX / UI / accessibilité)**, cinquième des huit, dans
l'ordre validé par **D-010**. **Ne rien modifier.**

**Point de départ** : `main`, commit `98b87db`. `git fetch` + `git status -sb` → **à jour, aucun
retard** (procédure obligatoire de `CLAUDE.md` §12.3, ÉTAPE 0).

### 1. Le préalable : I-05 levée avant toute chose

Un audit d'expérience sans savoir **qui utilise quoi** juge un utilisateur imaginaire. **I-05** a
donc été posée à Romain **en ouverture de session**, avant toute lecture de code. Ses réponses :

| Question | Réponse |
|---|---|
| Qui utilise l'administration le jour J ? | **Pas encore décidé** → on suppose quelqu'un **non formé** |
| Sur quel matériel ? | **Création du tournoi depuis un ordinateur** |
| Qui saisit les scores, sur quoi ? | **Des bénévoles, sur leur propre téléphone** *(à confirmer)* |
| Le réseau tient-il ? | **Excellent au Racing** (Plessis-Robinson, Colombes, 5G). Ailleurs : **inconnu** |

**Conséquence directe sur la méthode** : « leur propre téléphone » = **matériel inconnu**. Les
mesures ont donc été faites à **375 px** (téléphone courant), **320 px** (plus petits téléphones
encore en circulation) **et 1280 px** (ordinateur, pour l'administration).

### 2. Méthode : des écrans réellement ouverts, pas seulement du code lu

Une **copie de travail du frontend** a été montée **hors du dépôt** (dossier temporaire de
session), avec un **faux serveur** (données fictives injectées en remplaçant `fetch`). Les pages
`saisie.html`, `tournoi.html` et `admin.html` ont été **ouvertes dans un navigateur** et
instrumentées.

> ⚠️ **Aucun fichier du dépôt n'a été modifié**, et **aucun appel n'a atteint le vrai serveur
> Google** — c'était l'objectif de la copie : ne toucher ni à la base de données réelle, ni au
> garde-fou anti-devinette des mots de passe (R-019).

Le serveur d'aperçu du dépôt (`.claude/serveur-preview.js`) n'a **pas** été utilisé : il sert le
vrai dossier `frontend/`, donc il aurait parlé au vrai backend.

### 3. ⚠️ Une mesure fausse, détectée et refaite — à retenir

Le **premier** balayage des contrastes annonçait que **tout** échouait, y compris des textes
manifestement lisibles (« Total en points » à 1,05). Le résultat était **trop uniforme pour être
vrai**, et il a été **remis en cause avant d'être écrit**.

**Cause** : la méthode remontait la pile des fonds à la recherche d'une couleur opaque, mais ne
savait pas lire un **fond en dégradé** (`background-image`) — elle retombait alors sur du blanc
par défaut. Or le fond du site **est** un dégradé.

**Correction** : la méthode s'arrête et **renonce** dès qu'elle rencontre un dégradé, plutôt que
de produire un chiffre faux. Les éléments concernés sont **comptés et signalés** comme non
mesurables (5 sur la page publique, 3 dans l'administration).

**Résultat après correction** : l'inverse du diagnostic initial — la page de saisie est **très
bien contrastée** (9,6 à 21 pour 4,5 exigé). Deux chiffres mis en avant ont ensuite été
**revérifiés à la main** : le bleu d'accent (blanc sur `#2E8FE0` = **3,43**) et l'heure/terrain de
la page publique (`rgb(138,151,166)` sur `rgb(245,249,253)` = **2,81**).

> **Règle qui en découle, pour les sessions suivantes** : un outil de mesure se vérifie sur un cas
> dont on connaît la réponse **avant** de croire ses résultats. Un balayage qui condamne tout ne
> condamne probablement que lui-même.

Un second faux positif a été écarté de la même façon : la page publique affichait « Poule
undefined ». Vérification faite, c'est la **maquette** qui ne renseignait pas le champ `poule` des
équipes fictives, **pas** un défaut de l'application.

### 4. Ce qui a été mesuré

| Mesure | Résultat |
|---|---|
| Contrastes — page de **saisie** | **9,6 à 21** (4,5 exigé) — ✅ excellents |
| Contrastes — page **publique** | 46 textes mesurés, **8 sous la norme**, 5 écartés (dégradé) |
| Contrastes — **administration** | 603 textes mesurés, **25 sous la norme** (96 % conformes), 3 écartés |
| Cibles cliquables — **administration** | 212 mesurées, **4** sous 24 × 24 px |
| Cibles tactiles — **saisie simple** | Valider **85 × 35 px** · score **72 × 36 px** · catégorie 38 px · phase 29 px |
| Cibles tactiles — **saisie détaillée U14** | **44 × 44 px** — ✅ conformes |
| Débordement horizontal à **320 px** | **Aucun** |
| Zones d'annonce accessibles (`aria-live`) — saisie | **0** |
| Formulaires sur la page de saisie | **0** (donc « Entrée » ne valide rien) |
| Endroits affichant le message brut d'une erreur | **38** |

**Trois comportements ont été reproduits en direct**, réseau coupé ou ralenti :

1. **« Rafraîchir » sans réseau** → aucun message, horodatage inchangé, bouton normal → **R-051** ;
2. **« Valider » sans réseau** → l'écran affiche **« Failed to fetch »** → **R-052** ;
3. **« Valider » sur un envoi de 4 s** → à 1 s : bouton toujours « Valider », grisé, **aucun
   message ni indicateur** → **R-053**.

### 5. Résultat de l'audit

**10 problèmes — R-051 → R-060.** **Aucun P0**, **2 P1**, 7 P2, 1 P3.

Les deux P1 sont le même sujet : **la page de saisie ne dit pas au bénévole où il en est.**

Une **précision** a par ailleurs été apportée à **R-048** (domaine D) : sa description dit que le
bouton *« reste sur "Enregistrement…" »*. C'est vrai dans l'administration ; sur la page de saisie
il reste sur **« Valider »**, sans rien indiquer du tout.

### 6. Le fil rouge

**L'application sait déjà tout faire bien — elle ne l'a pas fait partout.** Les 44 pixels de cible
tactile, le bouton qui annonce sa progression, la confirmation qui nomme ce qu'elle détruit,
l'anti-cache mobile : **tout cela existe dans ce projet**, souvent avec le commentaire qui
l'explique. Ces bons réflexes sont sur les écrans **récents** ; les écrans **les plus anciens et
les plus utilisés** sont restés en arrière. Il y a peu à inventer, beaucoup à **propager**.

### 7. Ce que cette session ne peut PAS conclure

- **L'application n'a jamais été utilisée dehors.** Tout a été mesuré dans un navigateur
  d'ordinateur simulant un téléphone. Les contrastes calculés sont un **plancher optimiste** : un
  écran au soleil, à luminosité réduite, fait bien pire ;
- **Un seul moteur de rendu** a été utilisé : iPhone vs Android reste **INCONNU** ;
- **Le temps réel d'une validation** de score est **INCONNU** — c'est le **domaine F**, et c'est
  lui qui dira si R-053 est un détail ou un problème ;
- Les **parcours** écran par écran de l'administration (« si je fais ceci puis cela ») n'ont pas
  été éprouvés un par un ; seul le balayage global (603 textes, 212 cibles) les couvre.

### 8. Registre des points en suspens

Le domaine E n'ajoute **aucune décision en attente** et **aucune inconnue** : ses 10 problèmes sont
des choix techniques, à **ordonner** à l'ÉTAPE 3 (**D-024**), pas à arbitrer maintenant. Il **lève
I-05**.

**Une recommandation, qui n'est ni une question ni une décision** : essayer la saisie **pour de
vrai**, trente minutes, dehors, avec deux ou trois bénévoles et **leurs** téléphones.

### 9. Ce qui reste à Romain

**Un seul geste, inchangé depuis la session 6** : **D-017** — remplacer les deux mots de passe par
des suites aléatoires (menu du classeur → « Configurer les clés »), ce qui referme **R-019**.

### 10. Prochaine session

**Session 10 — ÉTAPE 2, domaine F : la performance.** Toujours sans rien modifier.
**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 10 — 2026-08-05 · ÉTAPE 2, domaine F : la performance

**Objectif** : auditer le domaine **F** (performance), sixième des huit dans l'ordre **D-010**.
**Aucun fichier de l'application modifié.** Documentation uniquement.

### 1. Point de départ

`git fetch` puis `git status -sb` — **l'étape 0 a servi** : la branche de la session 9 était à
jour, mais `main` avait avancé de 2 commits (PR **#179**, la session 9 fusionnée). `main` local
était **en retard**. Mise à jour avant toute lecture, conformément à `CLAUDE.md` §12.3.

**Commit de départ** : `48e3451` sur `main`.
**Branche de travail** : `claude/session-10-domaine-f-performance`.

### 2. Méthode : mesurer, pas supposer

`CLAUDE.md` §6.F interdit l'optimisation prématurée et exige qu'une optimisation soit justifiée
par **une mesure ou un risque identifiable**. La session a donc commencé par **mesurer
l'application réellement en ligne**, avant de lire quoi que ce soit comme un défaut.

| Mesure | Moyen | Volume |
|---|---|---|
| Temps de réponse du serveur Google | Appels réels à l'adresse publique (`ping`, `getAll`) | **42 appels** |
| Effet du cache serveur | Rafale (chaud) contre appels espacés de 13 s (froid) | 6 + 4 |
| Tenue à plusieurs | **25 lectures lancées au même instant** | 1 vague |
| Poids transféré | Téléchargement depuis GitHub Pages, compression comprise | 3 pages, 31 fichiers |
| Temps d'affichage | Chronomètre du navigateur sur la page publique en ligne | page réelle |
| Coût des calculs | Chronométrage des fonctions d'affichage (50 répétitions) | page réelle |
| Composition des données | Analyse de l'instantané servi | 51 matchs, 37 équipes |

**Trois choses ont été délibérément NON faites, et il faut le dire** :

1. **Aucun test de charge à grande échelle.** 25 spectateurs simulés, une fois. Simuler trois
   cents personnes sur le service en production de quelqu'un d'autre, sans son accord, n'est pas
   un geste d'audit.
2. **Aucune écriture chronométrée.** Une écriture exige une clé, et une écriture ratée ferait
   monter le compteur anti-force-brute installé en session 6 — au risque de gêner Romain. Le coût
   d'une validation de score est donc **reconstitué**, et marqué **PROBABLE**.
3. **Aucune mesure sur un vrai téléphone.** Le temps de connexion mesuré est de **16 ms** : la
   machine de mesure est très proche des serveurs Google. **Tous les temps donnés sont des temps
   plancher.**

### 3. Résultat : 11 problèmes

| Priorité | Nombre | Références |
|---|---|---|
| **P0** | **0** | — |
| **P1** | **2** | **R-061**, **R-062** |
| **P2** | **7** | R-063 → R-069 |
| **P3** | **2** | R-070, R-071 |

### 4. Ce que la session a appris, et qui n'était pas attendu

**a) Le navigateur n'est pas le problème — pas du tout.** Page prête en **527 ms**, réaffichage
complet des deux vues en **0,9 ms**. Même sur un téléphone vingt fois plus lent : 18 ms. **Il ne
faut rien optimiser là** : ce serait exactement l'optimisation prématurée interdite.

**b) Le plancher est chez Google, et il est infranchissable.** `ping`, l'action qui n'exécute
**rien** et renvoie 48 octets, prend **2,3 à 2,8 secondes**. Ce n'est pas le code du projet qui
est lent : c'est le fait de passer par Apps Script. Conséquence de méthode : **la vraie réponse à
l'affluence n'est pas d'accélérer le serveur, c'est de ne plus l'interroger** — donc le relais.

**c) Les deux filets anti-affluence sont noués l'un à l'autre, et le premier est éteint.** Le
relais CDN est **entièrement écrit** des deux côtés, avec repli automatique et pas-à-pas
d'installation — il manque **une ligne** (`SNAPSHOT_URL = ""`). Et le cache de repli **refuse de
s'enregistrer au-delà de 95 000 octets**, ce qui, mesures à l'appui, arrive vers **165 matchs** —
en silence complet. Le commentaire du code renvoie alors « au relais CDN », qui n'est pas là.

**d) 58 % de ce qui voyage jusqu'à chaque spectateur ne transporte aucune information.**
17 champs vides sur 27 par match : `"essais_A":""` pèse 16 octets pour ne rien dire. Mesuré :
**14 541 octets sur 25 029**.

**e) Le cache dure moins longtemps qu'on ne l'appelle.** Cache 10 s, rafraîchissement 15-19 s :
**un spectateur seul trouve toujours le cache expiré**. D'où le comportement à l'envers de
l'intuition — **l'application est plus rapide quand il y a du monde**. Corollaire de méthode :
**on ne peut rien conclure sur la performance en la testant seul.**

**f) Une inquiétude a été levée, pas confirmée.** Un minuteur à **5 secondes** repéré dans
`sponsors.js` faisait craindre un envoi réseau toutes les 5 s par spectateur. Vérification faite :
ces 5 secondes n'écrivent **que sur le téléphone** ; l'envoi réseau est bien espacé de 10 minutes.
**Le réglage est bon.** — *rappel utile : un minuteur court n'est pas un appel réseau.*

### 5. Le domaine F répond au domaine E

`ETAT.md` demandait explicitement au domaine F de trancher **R-053** (« le bouton Valider ne
montre rien pendant l'envoi ») : détail, ou problème ?

**Réponse : ce n'est pas un détail.** La reconstruction de l'instantané public, **mesurée à
2,5-4,5 secondes**, se fait **pendant que le verrou d'écriture est tenu** (**R-067**). L'attente
après « Valider » est donc réelle, et s'allonge quand plusieurs marqueurs valident ensemble. Un
bouton muet pendant quatre secondes est un bouton sur lequel on reclique. **R-053 monte en
importance relative** — et son remède (deux lignes) devient encore plus rentable.

### 6. Ce que le domaine F ne peut PAS conclure

- **Combien de spectateurs l'application peut servir** → **INCONNU**, dépend de **I-18** ;
- **Combien de spectateurs sont attendus** → **INCONNU**, dépend de **I-19** (seul Romain sait) ;
- **Le temps réel d'une validation de score** → **PROBABLE : 3 à 8 s**, reconstitué, jamais
  chronométré ;
- **Le comportement sur un vrai téléphone, dehors, en 4G** → **INCONNU** (temps plancher) ;
- **L'origine des pointes à 16,8 s et 20,1 s** → **PROBABLE : la plateforme Google**, puisque
  `ping` seul prend déjà 2,3 s.

### 7. Registre des points en suspens

Le domaine F n'ajoute **aucune décision en attente**, mais **deux inconnues** — et toutes deux se
lèvent **sans écrire une ligne de code** :

- **I-18** — la durée d'exécution réelle chez Google. **Cinq minutes** dans l'onglet
  « Exécutions » de l'éditeur Apps Script. **C'est le chiffre sans lequel tout le domaine F est
  une conversation sans données.**
- **I-19** — combien de spectateurs viennent vraiment. Le chiffre de 1 300 est écrit dans
  `docs/relais-cdn.md` **sans source**. Seul Romain peut répondre.

Une décision naîtra d'elles à l'ÉTAPE 3 : **allumer ou non le relais** (**R-061**).

### 8. Ce qui reste à Romain

1. **D-017** — remplacer les deux mots de passe par des suites aléatoires *(inchangé depuis la
   session 6, referme R-019)* ;
2. **I-18** — regarder la durée d'une exécution dans « Exécutions » *(nouveau, 5 minutes)* ;
3. **I-19** — dire combien de spectateurs sont attendus *(nouveau, une question de terrain)* ;
4. **I-10** et **I-15** — les deux questions sortantes, inchangées.

### 9. Prochaine session

**Session 11 — ÉTAPE 2, domaine G : l'architecture et la maintenabilité.** Toujours sans rien
modifier. Matière déjà repérée : un fichier serveur de **8 147 lignes / 277 fonctions**, **693
fonctions** dans un espace commun côté navigateur (dont 8 noms en double), **29 « miroirs »** de
règles écrites deux fois (**R-044**), **aucun outillage**, et **D-005** (le périmètre) que
**R-066** vient de rendre concrète.

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 10 *(suite, même jour)* — I-18 levée : les chiffres réels

**2026-08-05, quelques heures après la clôture.** Romain a ouvert le journal « Exécutions »
d'Apps Script et fourni **trois pages de captures**. **I-18 est levée.**

### Ce qu'il a fallu corriger en chemin

Premier essai : Romain a cliqué sur ▶ **Exécuter** avec `doGet` sélectionné. **Piège** — lancé
depuis l'éditeur, `doGet` ne reçoit aucun paramètre et retombe sur `action = 'ping'` par défaut.
**Ce n'est donc pas `getAll` qui a été mesuré, mais l'action vide.** Le bon geste n'était pas de
*lancer* quelque chose, mais de *regarder ce qui s'était déjà passé* : la page « Exécutions ».

> 📌 **À retenir pour les prochaines fois** : le bouton ▶ de l'éditeur **ne reproduit pas un vrai
> visiteur**. Pour mesurer la réalité, c'est la page « Exécutions » — accessible en remplaçant
> `/edit` par `/executions` à la fin de l'adresse.

### Le résultat : 128 exécutions, 0 échec

| Type | Nombre | Médiane | Moyenne | Max |
|---|---|---|---|---|
| Lectures `doGet` (Application Web) | **82** | **2,07 s** | 3,16 s | **19,55 s** |
| Écritures `doPost` (Application Web) | **43** | **2,67 s** | 3,27 s | **8,20 s** |
| `ping` (bouton ▶, n'exécute **rien**) | 1 | **1,59 s** | — | — |

**Les exécutions du 4 août sont l'usage réel de Romain**, pas mes mesures — et elles disent la
même chose (écritures 2,40 s de médiane, lectures 3,11 s). **L'audit et la vie réelle
concordent.**

### Cinq conséquences

1. **Le cache est excellent, et le code n'y est pour presque rien.** Servir tout le tournoi coûte
   **+0,06 s** par rapport à ne rien faire du tout. Mais **~1,6 s de démarrage par appel est
   incompressible** — ce n'est ni le code, ni le classeur, c'est Apps Script.
2. ⚠️ **Un commentaire du code est faux de deux ordres de grandeur.** `doGet` affirme *« servi du
   cache, répond en quelques millisecondes »* : la mesure dit **1 650 millisecondes**. L'intention
   était juste, le chiffre non — **et c'est sur ce chiffre que reposait l'idée d'une capacité
   confortable**.
3. **La capacité est chiffrée : 150 à 300 spectateurs, pas 1 300.** **R-061** passe d'un risque
   théorique à un risque **mesuré**.
4. **Un levier gratuit apparaît, plus puissant que tout le reste** : porter le rafraîchissement de
   **15 s à 30 s double la capacité** (≈ 550). Un seul chiffre à changer. **R-064 est élargi** :
   le vrai sujet n'est pas la durée du cache, c'est que **les réglages de cadence n'ont jamais été
   accordés entre eux**.
5. **R-067 passe de PROBABLE à CERTAIN.** L'estimation « 3 à 8 s pour une validation de score »
   est confirmée par **43 écritures réelles** (médiane 2,67 s, max 8,20 s, dont 7 au-dessus de
   5 s). Et le journal du 4 août montre **quatre exécutions démarrées à la même seconde** : la
   concurrence existe déjà avec une seule personne aux commandes. **R-053 (le bouton muet) est
   définitivement confirmé.**

### Une trouvaille qui n'était pas cherchée — une trace pour M-02

La colonne « Déploiement » distingue **« Version 148 »** (toutes les exécutions Application Web)
de **« Head »** (celles lancées depuis l'éditeur). **C'est le mécanisme de M-02 constaté
directement** : l'adresse publique sert une **version figée**, pas le code de l'éditeur. Cela ne
prouve pas une divergence — mais cela donne enfin un repère concret : **le jour d'un
redéploiement, ce numéro doit changer.** À inscrire dans la procédure de déploiement.

### Ce qui reste ouvert

**I-19 uniquement** : combien de spectateurs viennent réellement ? **C'est désormais la seule
question qui décide** — sous ~150 personnes, on ne touche à rien ; au-delà, il faut agir. Elle
n'est pas technique.

---

## SESSION 10 *(suite)* — I-19 reformulée : le public invisible

**2026-08-05.** Interrogé sur le nombre de spectateurs, Romain répond que c'est **« difficilement
quantifiable »** — et donne la structure : équipes présentes, éducateurs bénévoles, parents sur
place, **et surtout les parents qui n'ont pas pu venir et suivent depuis la maison ou le travail**.

### Ce que cet apport a corrigé

**Une conclusion de F.9 était trop pessimiste.** Elle disait « capacité 150 à 300 spectateurs ».
L'erreur était d'interprétation, pas de mesure : *« exécution simultanée »* avait été assimilé à
*« spectateur »*.

Or **la page se met en pause dès que l'onglet n'est plus visible** — un comportement déjà codé,
déjà salué en F.2, mais dont la conséquence n'avait pas été tirée. **La bonne unité est l'écran
allumé sur la page, pas la personne.** Un parent qui regarde le match ne coûte rien.

### Ce que l'apport ajoute

Deux publics au comportement **opposé**, et le second n'avait jamais été envisagé :

- **sur place** : regarde le terrain, téléphone en poche → **coût faible** ;
- **à distance** : l'écran **est** le seul lien avec le tournoi → **2 à 3 fois plus de charge par
  personne**.

> **Contre-intuitif, et il fallait l'entendre d'un homme de terrain** : *les gens qui ne sont pas
> venus pèsent plus lourd sur le serveur que ceux qui sont là.*

### Conduite à tenir qui en découle

| Public total qui suit | Avec 15 s *(aujourd'hui)* | Avec **30 s** |
|---|---|---|
| 400 | ✅ | ✅ |
| **700** | ❌ saturé au pic | ✅ |
| 1 000 | ❌ | limite |

- **Le tournoi actuel tient en régime courant** (~145 écrans actifs pour une capacité de 310) ;
  **la saturation n'arrive que dans les pics** (fin de match, annonce du classement).
- **R-064 (15 s → 30 s) suffit** jusqu'à ~1 000 personnes qui suivent. Un chiffre, gratuit.
- **R-061 (le relais) redescend en urgence sans changer de priorité** : il reste **P1** — il
  faudra l'allumer un jour, et un dispositif jamais essayé n'est pas un dispositif — mais **ce
  n'est pas le geste utile aujourd'hui**.

### I-19 n'est pas levée : elle est **reformulée**

Réclamer un nombre de spectateurs était **une mauvaise question** — Romain a eu raison de refuser
d'inventer un chiffre. Ce qui la remplace :

- **la partie calculable** : `Equipes` porte déjà `nb_joueurs` et `nb_educateurs`, remplies par
  les clubs à leur réponse d'invitation. **Le jour où de vrais clubs auront répondu, l'application
  connaîtra elle-même le public concerné** ;
- **la partie qui restera inconnue jusqu'au jour J** : la **part du public qui regarde au même
  instant** lors d'un pic. Elle ne se déduit d'aucune donnée — elle s'observera **pendant** le
  tournoi, dans le journal « Exécutions ».

> 📌 **Leçon de méthode.** Une inconnue mal posée produit une réponse inutile. Ici, la bonne
> question n'était pas *« combien de monde ? »* mais *« combien d'écrans allumés au même
> instant ? »* — et c'est la connaissance métier de Romain, pas la mesure, qui l'a fait
> apparaître.

---

## SESSION 11 — 2026-08-05 · ÉTAPE 2, domaine G : l'architecture et la maintenabilité

**Objectif** : auditer le domaine **G** (architecture / maintenabilité), **septième** des huit dans
l'ordre **D-010**. **Aucun fichier de l'application modifié.** Documentation uniquement.

### 1. Point de départ

`git fetch origin` puis `git status -sb` → **`## main...origin/main`**, aucun retard. La copie
locale était **réellement** à jour (et pas seulement « propre » — c'est le piège que `CLAUDE.md`
§12.3 décrit, et qui a déjà coûté deux sessions).

**Commit de départ** : `1667696` sur `main` (fusion de la PR **#180**, session 10).

### 2. La question posée au domaine G

Pas « ce code est-il élégant ? » — question sans intérêt pour ce projet. Mais :

> **Si quelqu'un d'autre que Romain devait reprendre ce projet demain — ou si Romain lui-même
> devait y revenir dans six mois — combien de temps lui faudrait-il avant de pouvoir toucher au
> code sans rien casser ?**

C'est le deuxième objectif final du chantier (`CLAUDE.md` §11 : *« compréhensible par un
développeur extérieur »*).

### 3. Méthode : compter, puis vérifier à la main ce que le comptage prétend

Trois familles de relevés, tous faits **sur le code réel du dépôt**, aucun sur une impression :

1. **Structure et poids** — lignes, fonctions, sections, fichiers, poids publié, dépendances
   extérieures, outillage, étiquettes Git.
2. **Couplage** — un petit programme d'analyse a cartographié, pour les 26 fichiers du navigateur,
   **qui appelle du code de qui**, puis **page par page**, quels noms sont réellement disponibles.
3. **Documentation contre code** — chaque affirmation des documents « carte » (`README.md`,
   `docs/architecture.md`, `backend/README.md`, `docs/deploiement.md`) a été **confrontée au code**,
   pas relue.

> ⚠️ **Un point de méthode qui compte, et qui a failli produire un faux constat.** L'analyse
> automatique a signalé **2 appels de fonction « introuvables »** — ce qui, si c'était vrai,
> vaudrait un défaut sérieux. **Les deux ont été ouverts à la main avant d'être écrits nulle part.
> Les deux étaient faux** : l'un était une fonction déclarée **localement** dans la fonction
> appelante (`majDossier`, `admin-infos-publication.js:510`), l'autre un faux positif de lecture.
>
> **Conclusion inscrite au dossier : aucun appel cassé** — et elle vaut parce qu'elle a été
> vérifiée, pas parce qu'un programme l'a dite. Un audit qui aurait publié la sortie brute de
> l'outil aurait inventé deux bugs.

### 4. Ce qui a été trouvé — 10 problèmes, 0 P0, 2 P1, 7 P2, 1 P3

**Le verdict est inhabituel, et il est dans ce sens-là : le code est en bien meilleur état que sa
documentation.**

**Ce qui est solide** (détail : `AUDIT.md` §G.1) — et qui explique le « 0 P0 » :

- le classeur Google n'est ouvert qu'à **8 endroits** dans 8 147 lignes ; **92 fonctions** le
  reçoivent en paramètre au lieu d'aller le chercher ;
- `calculerPlanning` — **224 lignes**, le cœur qui décide quel match se joue où et quand —
  **ne contient aucune référence à Google** ;
- `doGet` / `doPost` sont des **standards téléphoniques** : les contrôles communs (clé, verrou,
  cache) sont donc écrits **une seule fois** ;
- **26 bandeaux de section** rangent `Code.gs` ; les commentaires expliquent le **pourquoi** ;
- `frontend/README.md` est **à jour et excellent** — **la preuve que la discipline est tenable
  dans ce dépôt**, et le modèle pour réparer les autres.

**Les deux P1 ne portent pas sur ce que l'application FAIT, mais sur ce que le projet RACONTE de
lui-même** :

| Réf | Problème | Ce qui le rend P1 et non P2 |
|---|---|---|
| **R-072** | La procédure de redéploiement décrit **la moitié du geste** : `Tests.gs` (3 711 lignes, 589 vérifications) n'est cité par **aucun** des 6 documents, et `deploiement.md` dit *« coller `Code.gs` »*, point | **Ce n'est pas théorique : c'est le mécanisme exact de M-04.** Et il se **redéclenchera au prochain redéploiement** |
| **R-073** | La carte du projet ne décrit plus le projet : **21 des 65 actions** documentées (**68 % d'invisible**), 4 pages sur 8, tout le parcours d'invitation des clubs absent | **Un chiffre non sourcé de ces documents a déjà produit une conclusion fausse dans ce chantier** (le « 1 000-1 300 », session 10, corrigé par Romain → I-19) |

**Les sept P2** : un seul fichier serveur de 8 147 lignes (**R-074**) · aucune version, aucune
étiquette Git (**R-075**) · tests rangés par n° de session (**R-076**) · l'administration est un
anneau de 13 paires (**R-077**) · 12 noms globaux en double (**R-078**) · calculer et afficher sont
le même geste (**R-079**) · 183 Ko publiés que rien ne charge (**R-080**).
**Le P3** : le dépôt manuel du serveur (**R-081**).

### 5. L'apport principal : le domaine G **explique** trois problèmes déjà ouverts

C'est peut-être ce qu'il faut retenir de cette session. Elle n'ajoute pas seulement des problèmes,
elle donne la **cause** de trois autres :

| Déjà ouvert | Ce que G en dit |
|---|---|
| **R-043** — aucun test du navigateur | Pas un manque de temps : **il n'y a rien à tester séparément**. Calculer et afficher sont le même geste (**R-079**) |
| **R-044** — 29 règles écrites deux fois | Pas de la négligence : **aucun moyen de partager du code** entre Google et le navigateur. Donc la bonne réponse n'est pas « arrêter de recopier », c'est **faire se confronter les deux copies** |
| **M-04 / I-01** — une preuve fausse au dossier | Pas une erreur humaine : **la procédure écrite décrivait la moitié du geste** (**R-072**), et rien ne relie le dépôt au code en service (**R-081**) |

### 6. Une règle transversale qui ressort de ce domaine

Quatre des dix problèmes (**R-074**, **R-076**, **R-077**, **R-081**) ont la même forme : *le
défaut est réel, et la correction évidente est pire que le défaut.*

- découper le serveur en 5 fichiers = **5 collages manuels** au lieu d'un → **aggrave R-072** ;
- renommer 277 groupes de tests = **277 occasions d'en perdre un en silence** ;
- découper l'administration = exige l'outillage que `CLAUDE.md` §10 déconseille d'ajouter ;
- installer `clasp` = installer Node.js sur l'ordinateur de Romain, soit exactement ce que le
  projet a **délibérément** refusé.

> C'est `CLAUDE.md` §6.G appliqué à la lettre : **progressif et réversible, ou rien.** Ces quatre
> problèmes sont donc inscrits **avec leur contre-indication**, et `PLAN.md` porte désormais une
> ligne « ⛔️ Ce qui NE doit PAS être groupé » pour empêcher qu'une future session les traite
> ensemble en croyant bien faire.

### 7. Ce qui a été VÉRIFIÉ, et comment

| Affirmation | Comment elle a été établie |
|---|---|
| « 65 actions, 21 documentées » | Comptées dans `doGet` (15) et `doPost` (50), puis confrontées une à une au tableau de `architecture.md` |
| « `Tests.gs` cité par 0 document » | Recherche exhaustive dans les 6 documents concernés |
| « `assurerColonnePhase` n'existe plus » | Recherche dans `Code.gs` : 0 définition ; le code lui-même le dit (l. 6651) |
| « `setupSheet` crée 7 onglets » | Lu dans la fonction (l. 138-151) |
| « aucune collision de noms aujourd'hui » | Les 7 pages HTML ont été dépouillées ; les doublons vivent dans 3 fichiers **jamais chargés ensemble** |
| « aucun appel cassé » | Analyse automatique **puis vérification manuelle des 2 suspects** — voir §3 |
| « 8 ouvertures du classeur » | `SpreadsheetApp.openById` compté et localisé (l. 139, 318, 336, 462, 808, 1649, 2828, 2844, 2865 — dont 2 dans le même chemin) |
| « aucune étiquette Git » | `git tag` → vide |
| « 183 Ko publiés que rien ne charge » | Chaque bibliothèque cherchée dans les 8 pages HTML et les 26 fichiers JS |

**Chiffre corrigé** : les sessions précédentes annonçaient « **693 fonctions** » côté navigateur.
Le comptage précis donne **600 fonctions globales** (colonne 0) et **131 imbriquées** = 731
déclarations. Le 693 mélangeait les deux catégories. `ETAT.md` §9 porte désormais la valeur exacte
et la mention de l'affinage.

### 8. Ce qui n'a PAS été fait

- **Aucune modification de l'application.** Aucun fichier de `backend/` ou `frontend/` touché.
- **Aucune documentation corrigée** — alors que les deux P1 sont précisément des corrections de
  documentation, et qu'elles ne coûteraient presque rien. **C'est délibéré** : `CLAUDE.md` §7
  interdit de sauter de l'audit à la modification, et **D-024** accumule tout jusqu'à l'ÉTAPE 3.
  Corriger « puisque c'est facile » aurait été exactement le geste que le cadre interdit.
- **Le site vitrine `boutique-r92` n'a pas été regardé** — hors périmètre tant que **D-005** n'est
  pas tranchée.
- **Le temps réel de reprise par une personne extérieure n'a pas été estimé** : cela ne se mesure
  pas en lisant du code (voir `AUDIT.md` §G.7).

### 9. Points ajoutés au registre

- **D-028** — faut-il découper le fichier serveur ? *(décision de Romain, parce que c'est lui qui
  colle le code ; recommandation : **non**, pas tant que le dépôt est manuel)* → ✅ **TRANCHÉE le
  jour même**, voir l'addendum ci-dessous ;
- **I-20** — quelqu'un d'autre reprendra-t-il ce code, et quand ? *(non bloquante : elle change le
  **rang** de R-073, pas sa nature)*.

### 10. Prochaine session recommandée

**Session 12 — ÉTAPE 2, domaine H : la qualité du code. LE DERNIER.**

Le domaine G a regardé le code **de loin** ; le domaine H le regarde **de près** : fonctions trop
longues, logique dupliquée, noms peu explicites, code mort, commentaires devenus faux, gestion
d'erreurs. Il démarre avec de la matière déjà repérée — les fonctions les plus longues sont
mesurées, et **deux commentaires sont déjà démontrés faux** (celui de `doGet` sur les
« millisecondes », l'en-tête de `Tests.gs` sur les tests « FFR »).

> 🏁 **Après lui, l'ÉTAPE 2 est terminée**, et l'ÉTAPE 3 s'ouvre en reprenant une à une les
> inconnues puis les décisions accumulées par **D-024** (`ETAT.md` §10.4).

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 11 — ADDENDUM du même jour : D-028 tranchée, R-074 arbitré

**Objectif** : enregistrer la décision de Romain sur la seule question ouverte par le domaine G.
**Aucun fichier de l'application modifié.** Documentation uniquement.

### 1. Ce que Romain a décidé

Réponse : **« la 2 »** — c'est-à-dire le second des deux conseils du rapport de session, celui qui
se note au dossier.

> ✅ **D-028 — le fichier serveur `backend/Code.gs` (8 147 lignes) n'est PAS découpé tant que le
> dépôt chez Google est manuel.**

La raison retenue est celle du rapport : Apps Script accepterait plusieurs fichiers, mais **c'est
Romain qui colle le code à la main**. Passer de 1 à 5 fichiers, c'est passer de **un** collage à
**cinq**, donc **cinq occasions d'en oublier un** — précisément le mécanisme qui a produit
**M-04** (une preuve fausse restée six sessions au dossier).

### 2. Ce qui a été inscrit, et pourquoi c'est plus qu'une case cochée

La décision, telle qu'elle est enregistrée, porte **trois garde-fous** qui n'étaient pas dans la
question d'origine. Ils comptent autant que la décision elle-même :

| Garde-fou | Pourquoi il est là |
|---|---|
| **R-074 reste OUVERT au registre** | Le fichier **est** trop long — c'est constaté, et ça ne devient pas faux parce qu'on renonce à y toucher. Ce qui est décidé, c'est que la **correction** coûte plus cher que le **défaut**. Un arbitrage, pas un démenti |
| **Ce n'est PAS un permis d'agrandir le fichier** | Renoncer à découper 8 147 lignes n'autorise pas à en écrire 12 000. Toute session future qui ajouterait une fonctionnalité importante au serveur devra **reposer la question**, sans s'abriter derrière cette décision |
| **Une condition de réouverture ÉCRITE** | Le jour où le dépôt du serveur cesse d'être manuel (**R-081**). Sans collage à répéter, le coût du découpage tombe à zéro et son bénéfice reste entier. Un second déclencheur, moins net : si le fichier devenait difficile à modifier sans se tromper — ce qui **n'est pas le cas** aujourd'hui |

> **Sans ces trois lignes, la décision serait devenue, avec le temps, « le fichier unique est le bon
> choix » — ce qui n'est pas ce qui a été décidé.**

### 3. Un effet de bord utile : deux problèmes viennent de se relier

**R-081** (P3 — le dépôt manuel du serveur) n'est plus seulement « automatiser un geste » : c'est
désormais **ce qui débloquerait R-074**. Deux problèmes qui paraissaient indépendants sont
maintenant reliés **par une décision**, et c'est exactement le genre de lien qui sert à l'ÉTAPE 3,
au moment de composer les chantiers.

`PLAN.md` a été mis à jour en conséquence : **R-074 sort** de la ligne « ⛔️ ce qui NE doit PAS être
groupé », qui ne concerne plus que **R-076**, **R-077** et **R-081** — les trois qui n'ont pas été
arbitrés.

### 4. Pourquoi cette décision n'attend pas l'ÉTAPE 3, alors que D-024 l'exigerait

La question mérite d'être posée, parce que **D-024** dit que *tous* les points en suspens sont
traités à l'ÉTAPE 3, et que trois exceptions seulement sont prévues (D-017, les questions
sortantes, un éventuel P0). D-028 n'en fait partie d'aucune.

**Ce n'est pourtant pas une entorse, et voici le raisonnement :**

> D-024 existe pour empêcher de **trancher à l'aveugle** — décider avant d'avoir tous les problèmes
> sous les yeux, et s'apercevoir trop tard qu'on a engagé le chantier dans la mauvaise direction.
>
> Or **D-028 consiste à ne rien faire.** Elle n'engage aucun travail, ne consomme aucun budget, et
> ne ferme aucune porte : au pire, un constat ultérieur la **rouvrirait**, ce que la décision
> prévoit explicitement par écrit.
>
> **Une décision de statu quo ne coûte rien à prendre tôt.** C'est ce qui la distingue de D-018,
> D-019, D-020 ou D-025, qui engagent toutes du travail réel.

Ce raisonnement est inscrit dans `DECISIONS.md` au-dessus de la décision, pour qu'une session
future ne le prenne pas pour un précédent : **une décision qui engage du travail, elle, attend
toujours l'ÉTAPE 3.**

### 5. Ce qui a été mis à jour

| Fichier | Modification |
|---|---|
| `DECISIONS.md` | D-028 **sortie** de « en attente », inscrite comme **validée**, avec ses trois garde-fous et sa condition de réouverture |
| `ETAT.md` | §3 (ligne du domaine G) · §7 (tableau des décisions validées) · §10 (la décision est barrée du registre en suspens) |
| `RISQUES.md` | **R-074** passe de `IDENTIFIÉ` à **`ARBITRÉ`** — avec la mention explicite que **le problème reste ouvert** |
| `PLAN.md` | R-074 sort de la ligne « ⛔️ ce qui NE doit PAS être groupé » |
| `AUDIT.md` | §G.0, §G.4 et §G.6 mis au passé : la question est tranchée |

### 6. État du registre après cet addendum

- **Décisions en attente** : D-005, D-009, D-017, D-018, D-019, D-020, D-025 *(D-028 en sort)* ;
- **Inconnues à lever** : I-01, I-08, I-09, I-10, I-14, I-15, I-16, I-19, **I-20** ;
- **Problèmes** : 81 — 1 TESTÉ (R-014), 80 identifiés, dont **1 désormais arbitré** (R-074).

### 7. Prochaine session recommandée

**Inchangée : session 12 — ÉTAPE 2, domaine H (qualité du code). LE DERNIER.**

Après lui, l'ÉTAPE 2 est terminée et l'ÉTAPE 3 s'ouvre.

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 11 — ADDENDUM n° 2 : « l'industrialisation n'arrête pas les fonctionnalités »

**Objectif** : enregistrer une remarque de Romain qui corrige une **hypothèse implicite du cadre**.
**Aucun fichier de l'application modifié.** Documentation uniquement.

### 1. La remarque

> *« C'est une phase de pré-industrialisation, pas une fermeture totale des fonctionnalités de
> l'app — il y aura forcément des ajouts de code et de fonctionnalités. »*

### 2. Vérification : le cadre est effectivement muet là-dessus

Recherche faite dans `CLAUDE.md` et `DECISIONS.md` avant de répondre quoi que ce soit :
**aucun texte ne prévoit ce qui se passe quand du code neuf arrive pendant l'audit.**

`CLAUDE.md` dit « ne rien modifier » ; **D-024** accumule tout jusqu'à l'ÉTAPE 3 ; **D-003** sépare
bien deux chantiers, mais ce sont l'audit FFR et l'industrialisation — **deux chantiers de
documentation**. Le chantier qui **écrit du code**, lui, n'est mentionné nulle part.

**Et la réalité tranche dans le sens de Romain** : le chantier fonctionnalités en est à sa
**session 28** (PR #159, déployée le **2026-08-03**), soit **la veille** du démarrage de
l'industrialisation. Les deux avancent **en parallèle**, et le cadre fait comme s'il n'y en avait
qu'un.

### 3. Ce que ça change — et ce que ça ne change pas

> ✅ **Ça ne remet PAS en cause l'audit.** Un problème constaté le 2026-08-05 ne devient pas faux
> parce qu'on ajoute du code après : il devient **plus grand**. Le mouvement va **dans le sens** du
> constat, pas contre lui.

> ⚠️ **Ça remet en cause une seule chose : l'idée que TOUT peut attendre l'ÉTAPE 3 sans coût.**

Le travail utile a donc consisté à **trier les 81 problèmes selon leur comportement dans le temps**,
ce qu'aucun domaine n'avait fait :

| Comportement | Problèmes | Conséquence |
|---|---|---|
| **Figés** — attendre ne coûte rien | la grande majorité | Rien à changer : ÉTAPE 3 |
| **Qui grossissent** avec le développement | R-073, R-074, R-076, R-078, R-044, R-079/R-043 | À traiter **tôt dans** l'ÉTAPE 3, pas tard |
| ⚠️ **Qui se REDÉCLENCHE** | **R-072**, seul de son espèce | **Chaque fonctionnalité serveur = un redéploiement = un nouveau tirage du piège M-04** |

**C'est la distinction qui manquait.** R-072 ne devient pas « plus gros » : il **rejoue**. Le nombre
de fonctionnalités à venir est exactement le nombre d'occasions de réinscrire une preuve fausse au
dossier.

### 4. Ce qui a été inscrit

- **M-05** (risque de méthode, P1) — *l'audit photographie une application qui continue de bouger* :
  les chiffres sont datés, six problèmes grossissent, un se redéclenche ;
- **D-029** (décision en attente) — *comment les deux chantiers cohabitent* : faut-il appliquer
  **maintenant** les deux seules mesures dont l'attente coûte quelque chose ?

**Les deux mesures en question, et pourquoi ce sont les seules** :

| | **R-072** | **R-073** |
|---|---|---|
| Ce qu'on ferait | Écrire la procédure de redéploiement **complète** (`Code.gs` **et** `Tests.gs`, + vérification par **deux nombres**) | Poser la **règle** : nouvel écran / nouvelle action / nouvel onglet ⇒ la carte est mise à jour **dans le même lot** |
| Coût | ~5 lignes de texte, une fois | **zéro**, sur une fonctionnalité qu'on écrit de toute façon |
| Code touché | **aucun** | **aucun** |
| Coût d'attendre | un tirage du piège M-04 **par redéploiement** | l'écart de 68 % s'élargit à la vitesse du développement |

> **Ce ne sont pas des corrections, ce sont des habitudes.** Elles ne réparent rien : elles
> empêchent la dette de **grossir** pendant qu'on finit l'audit. C'est ce qui les distingue des
> 79 autres problèmes — et c'est le seul argument qui justifie une exception à **D-024**.

### 5. Ce que je n'ai PAS fait, et pourquoi

**Je n'ai appliqué aucune des deux mesures.** Elles sont proposées, pas faites.

Raison : **D-024 est une décision de Romain**, et y déroger — même pour cinq lignes de texte, même
avec un bon argument — reste **sa décision, pas la mienne**. Un audit qui commence à corriger au fil
de l'eau parce que « c'est vite fait » n'est plus un audit. La question est posée en **D-029**, avec
ma recommandation ; c'est tout.

**Et je n'ai proposé aucune exception au-delà de ces deux-là.** Toutes les corrections qui touchent
au **code** — R-041, R-042, R-074, R-076, R-077, R-078, R-079 — **attendent l'ÉTAPE 3**, sans
exception.

### 6. Trois règles qui s'appliquent quelle que soit la réponse à D-029

1. **Toute mesure inscrite au dossier porte sa date.** « 8 147 lignes » est vrai *au 2026-08-05*,
   pas éternellement. Le récapitulatif du domaine G (`AUDIT.md` §G.8) porte désormais cet
   avertissement en tête.
2. **Une fonctionnalité importante rouvre les chiffres qu'elle change** — c'est déjà le garde-fou
   n° 2 de **D-028**, étendu à l'ensemble du domaine G.
3. **Une session de fonctionnalité n'a PAS à connaître l'industrialisation pour travailler.** Les
   deux chantiers restent indépendants ; **c'est l'industrialisation qui s'adapte au mouvement,
   jamais l'inverse.**

### 7. Prochaine session recommandée

**Inchangée : session 12 — ÉTAPE 2, domaine H (qualité du code). LE DERNIER.**

⚠️ **Mais D-029 se répond avant, ou en même temps** — elle ne dépend d'aucun audit restant, et son
coût d'attente court dès le prochain redéploiement du serveur.

---

## SESSION 11 — ADDENDUM n° 3 : D-029 tranchée **et appliquée**

**Objectif** : appliquer les deux mesures validées par Romain.
**Aucun fichier de l'application modifié** — uniquement `docs/deploiement.md` et `CLAUDE.md`.

### 1. La décision

> *« D-029 applique les deux habitudes dans ce cas stp »* — Romain, 2026-08-05.

⚠️ **Le mot « habitudes » n'avait pas été compris à la première explication**, et c'était ma faute :
mot abstrait, jamais défini. Reformulé avec ce qui serait **littéralement écrit** dans chaque
fichier et **qui fait quoi**, la décision a été immédiate. *Leçon : quand une question reste sans
réponse, suspecter le vocabulaire avant de suspecter la question.*

### 2. Ce qui a été fait — mesure ① : la fiche de redéploiement

**Fichier** : `docs/deploiement.md`, section A.

| Avant | Après |
|---|---|
| *« Coller le contenu de `backend/Code.gs` »* — **un** fichier | Un encadré déclare le serveur comme **DEUX** fichiers, avec la correspondance des noms (`Tests.gs` du dépôt = **`Test.gs`** chez Google, au singulier) |
| Aucune mention de `Tests.gs` | Geste **2** de la fiche : *« Coller `Tests.gs` — LE FICHIER QU'ON OUBLIE »* |
| Aucune vérification | Geste **4** : lancer `lancerTestsFFR` et **vérifier deux nombres** — le bilan (**589**) **et** la dernière ligne du fichier collé (**3711**), avec un tableau disant **ce qu'un écart signifie** |
| — | L'incident **M-04** est raconté en tête, pour que la raison de la fiche soit lisible et non subie |
| — | Un avertissement : **ces deux nombres changent** quand les tests évoluent ; où lire les valeurs à jour |
| — | La **portée exacte** du contrôle : les tests tournent dans l'**éditeur**, pas contre l'adresse publique (**M-02** reste ouvert) |

**Deux corrections de fait faites au passage**, dans le document qu'on réécrivait : « crée les
**5** onglets » → **7** (et la liste nommée), et la fonction **`assurerColonnePhase`** — supprimée
du code depuis — remplacée par `assurerColonnesMatchs`.

> **Réécrire un document en y laissant sciemment des affirmations fausses n'aurait eu aucun sens** —
> c'est le défaut même que R-073 dénonce.

### 3. Ce qui a été fait — mesure ② : la règle de la carte à jour

**Fichier** : `CLAUDE.md`, **nouvelle section §8 bis** (insérée sans renuméroter les suivantes ;
sommaire mis à jour).

> **« Une session qui ajoute un écran, une action serveur ou un onglet met la carte à jour DANS LE
> MÊME LOT — pas plus tard. »**

Trois choix de rédaction, tous délibérés :

1. **Placée dans `CLAUDE.md`, pas dans `docs/industrialisation/`.** La règle vaut pour **toutes**
   les sessions du projet — **fonctionnalités comprises**. La ranger dans le dossier
   d'industrialisation l'aurait rendue invisible pour le chantier qui écrit le plus de code.
2. **Elle dit ce qu'elle NE demande PAS** (pas de réécriture globale, pas de documentation du
   fonctionnement interne) — sans quoi une règle de documentation devient une corvée qu'on contourne.
3. **Elle porte son chiffre** (68 %, 21 actions sur 65) et son incident (le « 1 000-1 300 » non
   sourcé). Une règle dont on a oublié la raison finit par sauter.

### 4. Ce qui n'a PAS été fait — et c'est volontaire

| Non fait | Pourquoi |
|---|---|
| `Tests.gs` toujours absent de `passation.md`, `backend/README.md`, `README.md` | **D-029 portait sur la fiche de redéploiement**, pas sur tout R-072. Élargir sans demander aurait été exactement le geste que D-024 interdit |
| Les **44 actions**, 4 pages et 20 fichiers manquants de la carte **non rattrapés** | C'est un travail de vérification **ligne à ligne** contre le code, pas une habitude. Il appartient à l'ÉTAPE 3 |
| Aucune autre exception à D-024 | Le critère est **cumulatif** : *aucun code touché* **ET** *un coût d'attente qui court à chaque livraison*. R-041, R-042, R-074, R-076, R-077, R-078, R-079 n'en remplissent qu'un au mieux |

### 5. Statut des deux problèmes — la nuance qui compte

**Ni l'un ni l'autre n'est refermé**, et le registre le dit en ces termes :

| | Statut | Ce que ça veut dire |
|---|---|---|
| **R-072** | 🟡 **DÉSAMORCÉ là où il se déclenchait** | Le prochain redéploiement est protégé. Mais `Tests.gs` reste invisible dans trois autres documents |
| **R-073** | 🟡 **L'hémorragie est arrêtée, le retard reste entier** | L'écart cesse de se creuser. Les 68 % déjà accumulés sont toujours là |
| **M-05** | 🟡 **ATTÉNUÉ, jamais refermable** | Tant que l'application évolue, les chiffres de l'audit se périment. C'est une **donnée permanente** du chantier, pas un défaut réparable |

> ⚠️ **Il aurait été facile — et faux — d'écrire « CORRIGÉ ».** On a arrêté une aggravation, on n'a
> pas réparé un retard. Confondre les deux, c'est exactement le genre de preuve trop généreuse qui a
> produit **M-04**.

### 6. Prochaine session recommandée

**Inchangée : session 12 — ÉTAPE 2, domaine H (qualité du code). LE DERNIER.**

Après lui, l'ÉTAPE 2 est terminée et l'ÉTAPE 3 s'ouvre.

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 12 — 2026-08-05 · ÉTAPE 2, domaine H : la qualité du code — 🏁 **LE DERNIER**

**Objectif** : auditer le domaine **H** (qualité du code), **huitième et dernier** dans l'ordre
**D-010**. **Aucun fichier de l'application modifié.** Documentation uniquement.

### 1. Point de départ

`git fetch origin` puis `git status -sb` → **`## main...origin/main`**, aucun retard. La copie
locale était **réellement** à jour, pas seulement « propre ».

**Commit de départ** : `e2fe59c` sur `main` (fin de la session 11, D-029 appliquée).

### 2. La question posée au domaine H

Le domaine G regardait le code **de loin** ; le domaine H le regarde **de près**, sur les sept
points de `CLAUDE.md` §6.H : fonctions trop longues · logique dupliquée · noms peu explicites · code
mort · commentaires devenus faux · complexité inutile · gestion d'erreurs insuffisante.

Mais **la vraie question de cette session était ailleurs**, et le domaine G l'avait posée sans
pouvoir y répondre :

> **Les 29 règles écrites deux fois — une pour Google, une pour le navigateur (R-044) — disent-elles
> la même chose ?**

C'est la question qui compte, parce que **le classement affiché sur la page publique est recalculé
par le navigateur, sans redemander au serveur**. Deux copies qui divergent, ce sont deux classements
différents du même tournoi.

### 3. Méthode : on n'a pas relu les miroirs, on les a **exécutés**

Relire deux versions d'une règle et conclure qu'elles sont pareilles, c'est une **impression**. La
session a donc construit un **harnais** — dans l'esprit de ce qu'avait fait la session 8 pour
`Tests.gs` :

1. `backend/Code.gs` chargé dans un bac à sable sur cet ordinateur, avec des **doublures** pour tous
   les services Google (classeur, cache, verrou, Drive, envoi d'emails) ;
2. **douze fichiers du navigateur** chargés dans des bacs **séparés**, un par page réelle, avec des
   doublures pour l'écran ;
3. les deux versions de chaque règle appelées **sur les mêmes entrées**, y compris tordues : chaîne
   vide, `null`, nombres négatifs, décimaux, accents, emoji, chaîne de 300 caractères, et **formats
   de tournoi inventés**.

**Résultat : 179 comparaisons, 0 écart**, sur 16 familles de règles.

> ⚠️ **Trois pièges rencontrés, et ils valent d'être notés.**
>
> **① Le harnais a reproduit R-078 par accident.** Charger `saisie.js` puis `tournoi.js` dans le
> même bac a échoué : *« Identifier 'equipes' has already been declared »*. C'est **exactement** la
> panne que R-078 annonce — une redéclaration en `const`/`let` **arrête le fichier entier**. La
> prédiction du domaine G est donc constatée, pas seulement déduite. *(Correction du harnais : un
> bac par page, ce qui reflète la réalité — ces fichiers ne sont jamais chargés ensemble.)*
>
> **② Un huitième nom partagé a été découvert au passage** : `STATUTS_CLUB_INVITE`, déclaré **des
> deux côtés** (`Code.gs:4007` et `admin-invitations.js:950`). Le relevé de la session 11 ne
> comptait que les **fonctions** homonymes (6) ; il en existe au moins une **constante** de plus.
>
> **③ Trois premiers « écarts » étaient des artefacts du harnais** (les constantes déclarées en
> `const` ne s'exposent pas comme celles déclarées en `var`). Ils ont été corrigés **avant** d'être
> écrits nulle part. Un audit qui aurait publié la sortie brute aurait annoncé un barème divergent.

### 4. Ce qui a été trouvé — 7 problèmes, **0 P0, 0 P1**, 5 P2, 2 P3

**Le verdict** : *le code tient ses promesses — sauf quand il parle de lui-même.*

**Ce qui est solide** (détail : `AUDIT.md` §H.1) — et qui explique le « 0 P0, 0 P1 » :

| Mesure | Serveur | Navigateur |
|---|---|---|
| Longueur **médiane** d'une fonction | **10 lignes** | **9 lignes** |
| Blocs de 8 lignes répétés | **0** (sur 8 147 l.) | 2 (sur 17 712 l.) |
| Fonctions mortes | **1 sur 277** | **0 sur 600** |
| Imbrication maximale réelle | 6 niveaux | 6 niveaux |
| Fonctions expliquées par un bloc de doc | **89 %** | **92 %** |
| Commentaires citant du code disparu | **0** | **0** |

**Les sept problèmes ont tous la même forme** : ce n'est jamais le code qui se trompe, c'est **ce
que le code raconte**.

| Réf | En une ligne | Prio |
|---|---|---|
| **R-082** | Le seul miroir en désaccord : l'écran annonce des matchs de **10 min** là où **30** seront jouées (U14 Super Challenge) | P2 → **P1 le jour d'un vrai SCF** |
| **R-083** | Cinq commentaires annoncent le contraire de ce que fait le code | P2 |
| **R-084** | Une colonne créée dans le classeur, documentée, et que **rien ne lit** | P2 |
| **R-085** | Jeter une image ne se vérifie jamais — et l'application répond « c'est fait » | P2 |
| **R-086** | **29 endroits** montrent au bénévole le message d'erreur brut du navigateur | P2 |
| **R-087** | 15 lignes mortes dont le commentaire affirme qu'elles servent | P3 |
| **R-088** | Les noms très courts vivent trop longtemps dans les 3 plus longues fonctions | P3 |

### 5. R-082 : trouvé à la lecture, **prouvé par exécution**

Le seul désaccord entre deux miroirs n'a pas été trouvé par le harnais — il a été trouvé **en lisant
les deux versions côte à côte**, puis confirmé en les exécutant sur le même cas :

```
Catégorie U14, contexte « Super Challenge de France », phase 2

  À L'ÉCRAN (serveur)      → 2 phases · Phase 1 : 2 matchs/équipe · durée 1 × 10 min
                              Phase 2 : manquant
  DANS LE PDF (navigateur) → (rien du tout)
  RÉELLEMENT JOUÉ          → 2 × 15 = 30 min
```

Le navigateur a reçu une garde « Super Challenge » ; le serveur ne l'a pas reçue — alors qu'il
**sait déjà** reconnaître le contexte, une marche plus bas dans le même fichier. **Trois lignes** le
corrigent, et la fonction touchée ne sert **qu'à remplir un formulaire** : ni génération, ni
horaires, ni scores, ni classement.

### 6. ⚡ Trois chiffres du dossier étaient faux — **M-06**

En voulant se servir de la matière première laissée par la session 11 (`ETAT.md` §4), la session 12
a recompté les fonctions du navigateur :

| Fonction | Chiffre au dossier | Chiffre réel | Vérifié comment |
|---|---|---|---|
| `redimensionnerImage` | 338 l. | **23 l.** | `admin.js:215-237`, **lue en entier** |
| `htmlClubEdition` | 254 l. | **19 l.** | `admin-invitations.js:1188-1206`, **lue en entier** |
| `planRemplissageAutorisation` | 239 l. | **113 l.** | `admin-autorisation.js:671-783` |

La plus longue fonction du navigateur fait **135 lignes** ; **aucune n'atteint 150**.

> **Ce n'est pas une coquille, c'est un mécanisme — et c'est la deuxième fois.** **M-04** était un
> nombre juste en apparence (« 573/573 ») dont rien ne disait **quelle version** l'avait produit.
> Ici, un nombre dont rien ne disait **comment** il avait été produit. Dans les deux cas : **une
> preuve non reproductible entre au dossier et y reste.**
>
> **Le remède est appliqué dès cette session** : chaque chiffre du domaine H porte sa méthode à côté
> de lui dans `AUDIT.md` §H. Et une mesure douteuse a été **écartée en cours de route, et le dit** :
> une première méthode annonçait **24 niveaux** d'imbrication pour `doPost` ; elle comptait comme
> imbrication des lignes simplement alignées sous une parenthèse. Recomptée sur les accolades : **5**.

**Ce que M-06 ne remet pas en cause** : le constat de fond de **R-079** (*calculer et afficher sont
le même geste côté navigateur*) **reste vrai** — ses deux autres chiffres se **retrouvent par une méthode
indépendante** : 137 écritures directes dans la page et 594 recherches d'élément, recomptées à
**135** et **595**. C'est **l'ampleur chiffrée des fonctions** qui était fausse, pas la nature du
problème.

### 7. Ce que le domaine H apporte aux domaines déjà audités

| Problème | Ce que H en dit |
|---|---|
| **R-044** | ✅ **Requalifié.** Les deux copies sont d'accord — 179 comparaisons, 0 écart, barème et départage **identiques au caractère près**. Passe de *« défaut possible »* à *« dette à surveiller »* |
| **R-052** | ✅ **Chiffré : 29 endroits, 21 fichiers** — et la correction identifiée : **un seul endroit à écrire** (R-086) |
| **R-078** | ✅ **Constaté**, pas seulement prédit : le harnais a reproduit la panne |
| **R-035 / I-08** | ⚠️ **Aggravé** : quand la mise à la corbeille d'une image échoue, personne ne l'apprend (R-085) |
| **R-073** | ⚠️ **Le même écart a commencé à entrer dans le code** (R-083), et au même endroit : la partie la plus récente |
| **R-079** | ✅ Confirmé sur le fond, ⚠️ **corrigé sur les chiffres** (voir §6) |

### 8. État à la fin de la session

- **🏁 L'ÉTAPE 2 EST TERMINÉE** — les 8 domaines audités, **88 problèmes** au registre ;
- **aucune décision ouverte** et **aucune inconnue ajoutée** par le domaine H — le seul des huit
  dans ce cas ;
- **aucun fichier de l'application modifié** ; aucun redéploiement requis ;
- documents mis à jour : `AUDIT.md` (§H.0 → §H.9), `RISQUES.md` (7 problèmes + tableau « vérifié et
  sain » + **M-06**), `ETAT.md`, `PLAN.md`, `SESSIONS.md`.

### 9. Prochaine session recommandée

**Session 13 — l'ÉTAPE 3 : le plan priorisé.** Elle commence, comme le prévoit **§10.4** et la
décision **D-024**, par reprendre le registre des points en suspens : **d'abord les 9 inconnues**
(I-01, I-08, I-09, I-10, I-14, I-15, I-16, I-19, I-20 — on ne décide pas sur du sable), **puis les
6 décisions** (D-005, D-009, D-018, D-019, D-020, D-025), **puis seulement** le tableau des
chantiers.

> ⚠️ **L'ÉTAPE 3 ne tient pas dans une séance.** Un découpage en volets sera proposé au démarrage —
> le plus probable : ① inconnues et décisions ; ② chantiers **sans code** ; ③ chantiers **avec
> code**, ordonnés par ce qui doit être fait **avant** quoi (les tests de R-041 avant de toucher au
> départage, R-042 avant de rouvrir la saisie du score).

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 12 — ADDENDUM : le rapport entre dans la mémoire durable

**Demande de Romain** : *« Le rapport détaillé de l'audit doit faire partie de la mémoire durable du
projet. Consigne-le […] sans modifier son contenu ni perdre les références R-001 à R-088 et M-01 à
M-06. Vérifie également que RISQUES.md, ETAT.md, PLAN.md et SESSIONS.md restent cohérents avec la
clôture de l'étape 2. »*

### 1. Où le consigner — et pourquoi PAS dans `AUDIT.md`

La consigne laissait le choix : `AUDIT.md`, ou *« le fichier jugé approprié si un document
équivalent existe déjà »*. **Le document existait déjà** : `RAPPORT-AUDIT.md`, écrit et poussé le
jour même (`cece8b2`), **dans `docs/industrialisation/`**.

**Il n'a pas été fondu dans `AUDIT.md`, et c'est un choix argumenté** :

| | |
|---|---|
| `AUDIT.md` | **6 200 lignes**, organisé **domaine par domaine** (A.1 → H.9). Il **explique** un problème quand on sait lequel on cherche |
| `RAPPORT-AUDIT.md` | **600 lignes**, organisé **en travers des domaines**. Il donne **le sens de l'ensemble** à qui n'en connaît aucun |

Les fondre reviendrait à ranger la synthèse **à la fin** du plus gros fichier du chantier : elle y
serait techniquement présente et pratiquement introuvable. Le dépôt applique déjà la règle inverse —
*un fichier = un rôle* (`RISQUES.md` **suit**, `AUDIT.md` **explique**) — et cette règle est ce qui
le rend lisible.

### 2. ⚠️ Le vrai trou n'était pas l'emplacement du fichier : c'était que **rien ne le citait**

Vérification faite : `grep -rl "RAPPORT-AUDIT"` sur `docs/`, `CLAUDE.md` et `README.md` →
**aucun résultat**. Le document était dans le dépôt, versionné, complet… et **invisible**.

> **C'est exactement ce que `CLAUDE.md` §12.2 met en garde de faire** : *« une session qui croit
> qu'il n'existe que 5 fichiers ne lira jamais les deux autres »*. J'avais créé un 8ᵉ document sans
> l'inscrire nulle part — donc aucune session future ne l'aurait ouvert. **La même maladie que
> R-073**, commise par la session qui venait de l'auditer.

**Corrigé** :

- `CLAUDE.md` §12.2 → **« Les 8 fichiers de suivi »**, avec le rôle de `RAPPORT-AUDIT.md` et un
  tableau **« lequel ouvrir selon ce qu'on cherche »** ;
- `CLAUDE.md` §12.3 → ajouté à l'ordre de lecture au démarrage, avec une consigne pour les sessions
  qui **découvrent** le chantier : le lire **en entier**, juste après `ETAT.md` ;
- renvois croisés ajoutés dans **`ETAT.md`, `PLAN.md`, `RISQUES.md`, `AUDIT.md` et `SESSIONS.md`**.

### 3. Cohérence de la clôture de l'ÉTAPE 2 — **29 contrôles, 0 échec**

Vérifiée par script, pas à l'œil. Ce que les contrôles établissent :

| Famille | Ce qui est vérifié |
|---|---|
| **Intégrité du rapport** | Contenu **bit à bit identique** (empreinte inchangée) · **88 références R-001 → R-088** présentes · **6 références M-01 → M-06** présentes |
| **Atteignabilité** | Cité par `CLAUDE.md` **et** par les 5 autres documents de suivi |
| **Clôture de l'ÉTAPE 2** | Marquée TERMINÉE dans `ETAT.md`, `PLAN.md`, `AUDIT.md` · plus aucun « domaine prochain » · la section « Domaine non audité » de `RISQUES.md` a disparu |
| **Totaux** | 88 partout · répartition **23 / 53 / 11** · **aucun « 81 problèmes » résiduel** dans les documents vivants |
| **Domaine H** | Registre, tableau « vérifié et sain », section `AUDIT.md` §H, fiche M-06, fiche de session : tous présents |
| **L'ÉTAPE 3 n'est PAS commencée** | Le tableau des chantiers de `PLAN.md` contient **toujours une seule ligne** (C-001) · l'ÉTAPE 3 est marquée « prochaine » et **attend une instruction explicite** |

**Trois en-têtes étaient restés en session 11** et ont été remis à jour : `RISQUES.md` (*« un seul
domaine reste : H »*), `AUDIT.md` (tableau des domaines, H encore « à faire ») et le total de
`PLAN.md` (81 → 88).

### 4. ⚠️ Ce qui n'a **PAS** été touché, délibérément

Deux mentions de « 81 problèmes » subsistent, et **c'est voulu** :

| Où | Pourquoi on n'y touche pas |
|---|---|
| `SESSIONS.md` — fiche de la session 11 | **C'est un journal.** Le 2026-08-05 au matin, il y avait bien 81 problèmes |
| `DECISIONS.md` — motivation de **D-029** | **C'est le raisonnement tel qu'il a été tenu** pour prendre la décision |

> **Réécrire un journal ou la motivation d'une décision a posteriori ferait perdre la seule chose
> qu'ils apportent : ce qu'on savait, et quand.** Une note explicite a été ajoutée en tête de
> `SESSIONS.md` pour que personne ne prenne ces chiffres pour le compte à jour.

### 5. État

- **Aucun fichier de l'application modifié** — vérifié ;
- **l'ÉTAPE 3 n'est pas commencée**, et ne le sera pas sans instruction explicite ;
- fichiers touchés : `CLAUDE.md`, `ETAT.md`, `PLAN.md`, `RISQUES.md`, `AUDIT.md`, `SESSIONS.md`.
  **`RAPPORT-AUDIT.md` n'a pas été modifié d'un caractère.**

---

# SESSION 13 — 2026-08-05 · 🏁 **ÉTAPE 3 OUVERTE — volet ① : les inconnues et les décisions**

> **Objectif unique de la séance** : ouvrir l'ÉTAPE 3 en reprenant le **registre des points en
> suspens** (`ETAT.md` §10), dans l'ordre imposé par **§10.4** — *les inconnues d'abord, les
> décisions ensuite, le tableau des chantiers seulement après*.
>
> ⚠️ **Rappel posé en ouverture, à la demande de Romain** : *aucune modification applicative avant
> validation du plan.* L'ÉTAPE 3 **ne modifie rien** — c'est l'ÉTAPE 4 (validation chantier par
> chantier) qui ouvre l'ÉTAPE 5.

## 0. Mise à jour avant lecture (`CLAUDE.md` §12.3)

`git fetch origin` puis `git status -sb` → **`## main...origin/main`**, aucune mention de
« retard », dépôt propre. Commit de référence **`b5cc9df`**. La copie locale reflète bien l'état
réel du chantier — le piège des sessions 6 et 8 n'a pas joué.

## 1. Ce qui a été fait

1. **Découpage de l'ÉTAPE 3 proposé et appliqué** — trois volets : ① inconnues + décisions
   *(cette séance)* · ② chantiers **sans code** · ③ chantiers **avec code** ;
2. **les 9 inconnues reprises une par une**, avec pour chacune : qui peut la lever, à quel coût, et
   **ce qu'elle bloque réellement** ;
3. **une vérification menée pendant la séance** — la seule qui était à ma portée : lecture des
   pages publiques du **site vitrine** (`index.html`, `rgpd.html`, `mentions-legales.html`) ;
4. **les 6 décisions en attente présentées une par une** (problème en langage simple, options,
   coût, bénéfice, recommandation) puis **soumises à Romain** ;
5. **les 6 tranchées le jour même**, et inscrites dans `DECISIONS.md`.

## 2. Le résultat, en trois constats

### ⭐ Constat n° 1 — **Une lecture de page publique a débloqué la décision qui attendait depuis la session 7**

**I-16 est LEVÉE** : le site vitrine porte déjà **« Mentions légales · CGV · RGPD · Statuts »**.

Les deux informations qui manquaient à **D-018** depuis six sessions — *qui est officiellement
responsable* et *quelle adresse de contact* — y sont **écrites publiquement** :

| Ce qui manquait | Ce que le site déclare |
|---|---|
| Le responsable | **Génération R92 — association loi 1901** |
| L'adresse de contact | **generationr92@gmail.com** |
| Le directeur de la publication | **Jérémy Jost, Président** |

**Deux conséquences, et elles vont dans des directions opposées :**

- ✅ **le coût de R-028 baisse** : il ne s'agit plus de créer une page « Vos données » à partir de
  rien, mais d'**ajouter une section « Tournoi »** à une page qui existe et que les gens trouvent ;
- ⚠️ **R-028 reste entier** : cette page **ne parle pas du tournoi**. Ni clubs invités, ni contacts
  de clubs, ni effectifs d'enfants, ni mesure de visibilité des partenaires. Elle couvre
  l'adhésion, le don et l'achat en boutique. **Seul le coût de correction a changé, pas le
  problème.**

**I-14 est largement répondue** au passage — avec une réserve qu'il faut dire : les mentions légales
précisent *« association loi 1901 (**déclaration en cours**) »*, siège et n° RNA *« à définir »*.
Une association non déclarée n'a pas d'existence juridique propre : **aujourd'hui, c'est Romain qui
porte ces données de fait**, exactement ce que **D-021** avait constaté. Aucune conformité juridique
n'est prononcée (`CLAUDE.md` §6.B) — c'est un **écart de fait**, à corriger quand la déclaration
aboutira.

📌 **Quatre constats hors périmètre** inscrits en **V-01 → V-04** (`DECISIONS.md`, fiche D-005),
dont une durée de conservation affichée publiquement comme *« [À DÉFINIR] »* — **à laquelle D-020
répond**, et un hébergeur déclaré (Netlify) qui n'est pas celui qui sert le site (GitHub Pages).

### ⭐ Constat n° 2 — **Aucune des 7 inconnues restantes ne bloque le plan**

C'est le résultat qui autorise le volet ② à s'ouvrir.

| Réf | Ce qu'il faut pour la lever | Ça bloque quoi ? |
|---|---|---|
| **I-10** | 1 courriel *(FFR / Comité 92)* | Confirmerait D-011 et D-015, **déjà décidées** |
| **I-15** | 1 courriel *(le club)* | R-036 — tant que c'est inconnu, **ce n'est pas un défaut du code** |
| **I-08** | **5 min** *(corbeille Drive + navigation privée)* | R-035 (P2) |
| **I-09** | **2 min** *(journal « Exécutions »)* | R-023, R-039 (P2) |
| **I-19** | **le jour du tournoi** | R-061 seulement — **pas R-064**, qui suffit jusqu'à ~1 000 personnes |
| **I-20** | une phrase de Romain | **Rien** — change le rang de R-073, pas sa nature |
| **I-01** | ❌ **jamais** | **Permanente** (M-02) — elle se **compense** (D-029), elle ne se lève pas |

### ⭐ Constat n° 3 — **Les 6 décisions sont tranchées, et l'une d'elles fixe l'ordre de tout le chantier**

| Réf | Décision retenue | Ce que ça débloque |
|---|---|---|
| **D-025** | **Lot ① seul** — les 5 tests du **barème et du départage** — **écrits AVANT** la correction du départage | **R-041**, et **l'ordre du volet ③** |
| **D-020** | **Le tableau des 7 durées est adopté tel quel.** ⚠️ Aucun effacement automatique : toute suppression reste déclenchée par un humain | **R-030** (P1), R-031, R-033, R-034 — **9 problèmes** |
| **D-018** | **Oui** — trois textes rédigés, dont une **section « Tournoi »** pour la page RGPD existante | **R-028** (P1), R-038 |
| **D-019** | **Voie (a)** — informer, sans bandeau, avec un moyen de dire non | **R-029** (P1), suspendu tant que les partenaires sont éteints |
| **D-005** | **Périmètre fermé** à `tournoi-r92` ; ce qui est vu ailleurs est **signalé** | I-16, et V-01 → V-04 |
| **D-009** | **D-006 conservé** — la doc va sur `main`, une branche imposée y est ramenée avant la fin de session | Une règle de méthode |

> 🏉 **Pourquoi D-025 compte plus que les autres.** Les tests du lot ① sont **le filet qu'on tend
> avant** de toucher au classement. Écrits après la correction du départage, ils graveraient le
> **nouveau** comportement sans avoir jamais vu l'ancien : ils ne prouveraient plus qu'on n'a rien
> cassé, seulement qu'on a bien écrit ce qu'on venait d'écrire. Sans eux, une erreur de départage
> ne produirait **aucune alerte** — juste un autre vainqueur.

## 3. Ce qui a été mis à jour

| Fichier | Ce qui a changé |
|---|---|
| `DECISIONS.md` | Les **6 fiches** passent de ⏳ EN ATTENTE à ✅ VALIDÉE, chacune avec un bloc **« Décision retenue »** ; la section est renommée ; **V-01 → V-04** inscrits sous D-005 |
| `ETAT.md` | §1 réécrit · §2 (ÉTAPE 3 en cours) · §4 entièrement refait *(la prochaine session est le volet ②)* · §7 (6 décisions ajoutées, liste d'attente **vidée**) · §8 (I-14, I-16) · §10.2, §10.3, §10.4 |
| `PLAN.md` | Nouvelle **§0 — découpage de l'ÉTAPE 3** en trois volets, les **deux contraintes d'ordre fixées**, et ce que le volet ① a rendu constructible |
| `SESSIONS.md` | Cette fiche |

## 4. Ce qui a été VÉRIFIÉ, et comment

| Affirmation | Statut | Preuve |
|---|---|---|
| La copie locale est à jour | **CERTAIN** | `git fetch` + `git status -sb` → `## main...origin/main`, sans « retard » |
| Le site vitrine porte des mentions légales et une page RGPD | **CERTAIN** | Lecture des pages publiques, libellés relevés au pied de page |
| Cette page RGPD ne couvre pas le tournoi | **CERTAIN** | Lecture du contenu : adhésion, don, achat — rien d'autre |
| Le responsable déclaré est *Génération R92* | **CERTAIN** *(pour ce que le site déclare)* | Cité mot pour mot dans `rgpd.html` et `mentions-legales.html` |
| L'association existe juridiquement | ❌ **NON VÉRIFIÉ — et le site dit lui-même « déclaration en cours »** | Aucune source hors du site. Ne peut être établi que par Romain |
| Aucun fichier de l'application n'a été modifié | **CERTAIN** | Seuls 4 fichiers de `docs/industrialisation/` sont touchés |

## 5. Ce qui n'a **PAS** été fait

- ❌ **le tableau des chantiers de `PLAN.md` n'est toujours pas rempli** — c'est le volet ② ;
- ❌ **les trois textes de D-018 ne sont pas rédigés** — la décision autorise leur rédaction, elle
  ne la remplace pas. Volet ② ;
- ❌ **aucune ligne de l'application n'a été touchée**, et aucune ne le sera avant l'ÉTAPE 4 ;
- ❌ **I-08, I-09, I-10, I-15 n'ont pas été levées** : elles n'appartiennent qu'à Romain.

## 6. Prochaine session recommandée

**Session 14 — ÉTAPE 3, volet ② : les chantiers SANS code.** Cinq lots entrent dans ce volet
(les trois textes d'information · le tableau des durées écrit noir sur blanc · remettre le projet
en face de lui-même · le barème et le départage communiqués aux clubs · la version des
bibliothèques). Deux d'entre eux referment des **P1**, et **aucun ne touche une ligne exécutable**.

**Condition de démarrage** : instruction explicite de Romain.

---

## SESSION 13 — ADDENDUM du même jour : ⚡ **D-030, le tournoi suspendu ou annulé**

> **Demande de Romain, avant de lancer la session 14** : *« Je veux ajouter une décision
> fonctionnelle au chantier concernant I-10 → FFR : gestion d'un tournoi interrompu / annulé pour
> force majeure. Cette décision doit être prise en compte dans la documentation et le plan de
> travail, mais ne code rien maintenant. »*
>
> ⚠️ **Consigne respectée à la lettre : aucun fichier de l'application n'a été ouvert en écriture.**
> Le livrable de cet addendum est une **spécification conservée**, pas un début d'implémentation.

### 1. Les cinq points demandés, et ce qu'ils ont donné

| # | Demande de Romain | Réponse |
|---|---|---|
| **1** | *Où cette décision doit-elle être documentée ?* | **`DECISIONS.md` → D-030** (fiche complète : les deux états, les contraintes techniques, les points ouverts, l'ordre d'implémentation) · **`RISQUES.md` → R-089** (le registre de suivi) · **`PLAN.md`** (deux nouvelles familles) · **`ETAT.md`** (§1, §4, §6, §7, §8, §10) · **`RAPPORT-AUDIT.md`** (post-scriptum, sans réécrire le rapport) |
| **2** | *Quelles références existantes sont concernées ?* | **I-10 élargie** au tournoi entier · ⚡ **I-21 ouverte** *(peut-on réduire le temps de jeu ?)* · **D-015** *(le match annulé — complété, pas remplacé)* · **D-013** *(son niveau 3 est rouvert)* · **R-002, R-015, R-016, R-047, R-003, R-042, R-041, R-051/052, R-064** |
| **3** | *Dans quel futur lot faut-il l'implémenter ?* | **ÉTAPE 3, volet ③**, découpée en **2 niveaux**. Prérequis, dans l'ordre : **lot ① des tests (D-025)** → **R-042** → **famille « filet côté serveur »**. Le niveau 2 attend en plus **I-21** |
| **4** | *Contredit-elle une décision existante ?* | ✅ **Non — aucune contradiction sur 11 décisions et contraintes passées en revue.** Mais **trois articulations** devaient être écrites, sinon le même code aurait été ouvert deux fois *(détail ci-dessous)* |
| **5** | *Mettre à jour la documentation* | ✅ Fait — **6 fichiers de suivi**, **0 fichier applicatif** |

### 2. ⚠️ Les trois articulations qu'il fallait écrire

**a) D-030 n'est pas D-015 en plus gros.** D-015 annule **un match**, D-030 arrête **la journée**.
Un tournoi annulé n'est **pas** « N matchs annulés un par un » : les deux mécanismes coexistent, à
deux étages différents. Sans cette phrase, l'implémentation aurait pu croire qu'il suffisait de
boucler sur les matchs.

**b) D-030 niveau 2 ROUVRE le niveau 3 de D-013 — et c'est le point le plus important.** D-013
avait **délibérément écarté** *« rendre un terrain indisponible et laisser l'application
redistribuer »*, au motif que c'est *« le seul niveau qui touche au planificateur, donc le seul
réellement risqué »*. Or les scénarios de reprise de D-030 (réduire les périodes, réorganiser les
terrains) touchent **exactement le même code** — `calculerPlanning`, 224 lignes, le cœur qui décide
quel match se joue où et quand. **Les deux doivent donc être traités dans le même chantier.** Les
séparer reviendrait à ouvrir deux fois la pièce la plus délicate du projet.

**c) Le gel doit être tenu par le SERVEUR.** C'est le fil rouge du domaine C : les trois
protections les plus destructrices (R-015, R-016, R-047) sont tenues par **la page web**, donc
contournables. Un gel tenu par le navigateur **ne gèle rien** — il suffit d'ouvrir la page de
saisie sur un autre téléphone. D-030 rejoint donc **obligatoirement** la famille « le filet côté
serveur ».

### 3. Ce que l'addendum a ajouté au registre

| Réf | Quoi | Priorité |
|---|---|---|
| **D-030** | La spécification fonctionnelle complète | ✅ Validée *(décision de Romain)* |
| ⚡ **R-089** | L'application ne sait pas gérer un tournoi interrompu ou annulé | **P1** |
| ⚡ **I-21** | La FFR autorise-t-elle une réduction du temps de jeu en force majeure ? | Bloque le **niveau 2** seulement |
| **I-10** | **Élargie** au sort d'un tournoi entier | *(inchangée par ailleurs)* |

> ⚡ **Pourquoi le registre passe à 89 alors que l'audit en a trouvé 88 — et pourquoi il fallait
> l'écrire noir sur blanc.** **R-089 n'a été trouvé par aucun des huit domaines.** Il vient de la
> connaissance du terrain de Romain, pas d'une lecture de code. Laisser le compteur glisser
> silencieusement de 88 à 89 aurait laissé croire, dans six mois, que l'audit avait vu ce cas —
> c'est exactement le mécanisme de **M-06** *(un chiffre qui ne porte pas sa provenance)*. Les deux
> chiffres coexistent désormais, chacun avec sa source : **88 = l'audit** *(figé)*, **89 = le
> registre** *(vivant)*.

### 4. Ce que j'ai signalé à Romain sans qu'il le demande

- ⚠️ **Le bandeau public n'est pas un système d'alerte de sécurité.** Il voyage dans l'instantané
  mis en cache, rafraîchi toutes les 15 s (30 s si R-064 est appliqué) : une suspension mettra
  **jusqu'à une demi-minute** à apparaître sur les téléphones. On n'évacue pas un terrain sous la
  foudre avec un bandeau. **Il explique ; il n'alerte pas.**
- **Cinq points restent ouverts** dans la spécification (le Super Challenge · la suspension qui
  franchit la pause méridienne · un tournoi annulé peut-il être « dé-annulé » · le classement
  partiel pendant une suspension · le tournoi suspendu qui ne reprend jamais). Ils sont **inscrits
  en D-030 §5** pour ne pas être tranchés à la va-vite pendant l'implémentation.
- **Trois pièges déjà connus du projet** s'appliqueront : la **liste blanche** des champs publics,
  l'**encodage des libellés** accentués venant du tableur, et le **garde-fou R-002** qui ne doit pas
  confondre « match gelé » et « match oublié ».

### 5. État

- **Aucun fichier de l'application modifié** — vérifié ;
- **aucune ligne de code écrite**, conformément à la consigne ;
- fichiers touchés : `DECISIONS.md`, `RISQUES.md`, `ETAT.md`, `PLAN.md`, `RAPPORT-AUDIT.md`,
  `SESSIONS.md` ;
- **la session 14 (volet ②) n'est pas commencée** et ne le sera pas sans instruction explicite.

---

## SESSION 13 — ADDENDUM n° 2 : ✅ **I-21 levée, et le niveau 2 de D-030 est prêt à être implémenté**

> **Réponse rapportée par Romain** : *« La reprise avec adaptation du format/durée est autorisée,
> sous réserve du temps de jeu maximal et de l'interdiction des phases finales. »*
>
> **Demande** : intégrer cette règle à D-030 et **préparer l'implémentation** du niveau 2.
> ⚠️ **Préparer, pas implémenter** — aucun fichier de l'application n'a été ouvert en écriture.

### 1. Ce que la réponse débloque

**I-21 est levée le jour même où elle a été ouverte**, et c'est la réponse la plus favorable
possible : le niveau 2 n'est **plus bloqué**, et il n'est pas non plus laissé sans limites — il
reçoit **deux garde-fous nets**, ce qui est exactement ce qu'il fallait pour ne pas écrire un
moteur qui décide seul.

### 2. ⚡ Trois faits vérifiés dans le code — ils changent la fiche de chantier

*Je n'ai pas planifié sur des suppositions : les trois points ci-dessous sont **constatés**, pas
déduits.*

| # | Fait | Où | Conséquence |
|---|---|---|---|
| **1** | ⚠️ **Le plafond de temps de jeu n'est aujourd'hui qu'un AFFICHAGE.** `plafond_joueur_min` est lu de `RefFFR_Temps`, montré dans l'écran de conformité avec la mention **« (sécurité) »** et injecté dans un prévisionnel — **mais rien dans `calculerPlanning` ne refuse un planning qui le dépasse** | `backend/Code.gs` *(lecture des grilles et plafonds)* · `frontend/js/admin-conformite-ffr.js` | **La première réserve de la FFR n'est pas un branchement, c'est un travail.** Il faut transformer un **indicateur** en **contrôle réel** |
| **2** | ⛔ **Le repos de 60 minutes de la pause méridienne est écrit EN DUR** dans le code *(`repos: 60`)*, et c'est une mesure de **sécurité** | `backend/Code.gs` — `planifierBlocRepos`, `vaguesRepos` | **I-21 n'en parle pas, et c'est le piège.** *« Supprimer les marges »* ne doit **jamais** s'y appliquer. Écrit noir sur blanc dans D-030 §8.3 et dans la fiche C-003 |
| **3** | Il existe **trois marges différentes**, de statuts très différents : le **battement** entre deux matchs sur un terrain *(logistique)*, la **récupération** d'une même équipe entre deux matchs *(repos d'enfants)*, et le **repos méridien de 60 min** *(sécurité)* | `battement_terrain_min` · `recup_entre_matchs_min` · `repos: 60` | Les traiter comme un seul « réglage de marges » serait une faute. La fiche C-003 les sépare et leur donne trois régimes distincts |

> 🏉 **Pourquoi le point 2 compte plus qu'il n'en a l'air.** La formulation de D-030 —
> *« supprimer ou réduire certaines marges entre rencontres »* — est ambiguë. **Quelqu'un de
> parfaitement bien intentionné, moi compris, pourrait optimiser ce 60 en croyant bien faire.**
> C'est exactement le type de régression qu'on ne voit qu'après : le planning est plus dense, il
> tient dans le temps, et des enfants enchaînent sans souffler.

### 3. Le livrable : **deux fiches de chantier**, dans `PLAN.md` §6

| Fiche | Contenu | État |
|---|---|---|
| **C-002** — niveau 1 : l'état et sa visibilité | **Esquisse**, écrite parce que C-003 en dépend et ne peut pas être planifié dans le vide. Sera complétée au volet ③ | **PLANIFIÉ** |
| **C-003** — niveau 2 : les scénarios de reprise | **Fiche complète** : les 6 leviers du moins au plus intrusif, les **3 garde-fous durs**, les 3 règles de conception, la stratégie de test, et les vérifications de non-régression | **PLANIFIÉ** |

**Ordre d'exécution inscrit** :

```
lot ① des tests (D-025)  →  R-042  →  C-002 (niveau 1)  →  C-003 (niveau 2)
```

> ⭐ **La ligne la plus importante de C-003, et elle conditionne tout le chantier** : *sans
> suspension, `calculerPlanning` doit produire **exactement le même planning qu'avant**, comparé
> **caractère par caractère** sur un tournoi de référence. **Si ce test n'existe pas, le chantier ne
> commence pas.*** C'est la seule protection réelle contre une régression qui **ne se voit pas** :
> `calculerPlanning` ne plante pas quand il se trompe — il produit un planning **plausible et faux**.

### 4. Une précision demandée, qui ne bloque rien

*« Phases finales interdites »* est **sans ambiguïté pour le moteur** : il ne propose **jamais** une
phase finale comme moyen de rattrapage. **C'est acté.**

Reste une question plus étroite : **une suspension écarte-t-elle aussi une phase finale déjà prévue
au programme** ? Un seul des quatre formats d'après-midi est concerné — **COUPE_PLATEAU**. Ma
lecture prudente est **oui**, et elle est inscrite comme **point ouvert (f)** de D-030 §5 plutôt que
comme un fait — parce que les deux lectures ne produisent pas le même code.

### 5. État

- **Aucun fichier de l'application modifié** — vérifié ;
- **aucune ligne de code écrite** : la demande était de **préparer**, pas d'implémenter ;
- **7 inconnues ouvertes** *(I-21 ouverte puis levée le même jour)*, **0 décision en attente** ;
- fichiers touchés : `DECISIONS.md`, `PLAN.md`, `ETAT.md`, `RISQUES.md`, `SESSIONS.md` ;
- **la session 14 (volet ②) n'est pas commencée.**

---

## SESSION 13 — ADDENDUM n° 3 : ⚡ **le cadre de la reprise — et une correction de ma part**

> **Précision de Romain**, apportée pour que la règle soit *« pensée dans son contexte fonctionnel
> réel et dans la logique de reprise après interruption »*.
>
> ⚠️ **Aucun code modifié**, conformément à la consigne : *« ne modifie aucun code pour l'instant »*.

### 1. ❌ Ce que j'avais écrit de faux, et pourquoi c'était faux

**L'addendum n° 2 classait le repos méridien de 60 minutes comme un garde-fou dur, à ne franchir
« jamais ».** C'était une **erreur de cadrage**.

Ce 60 n'est pas une constante de sécurité gravée dans le marbre : c'est **une valeur que
l'organisateur choisit**, qui n'a simplement **jamais eu d'écran pour être saisie**. Le vrai
principe n'est pas *« on n'y touche jamais »* — c'est :

> **La machine ne la modifie jamais toute seule. L'organisateur, si.**

> ✅ **L'inquiétude de fond était juste, sa catégorie ne l'était pas.** Le danger réel — qu'un
> planning se densifie en rognant le repos des enfants **sans que personne l'ait décidé** — est
> **exactement** ce que le principe 5 de Romain interdit. Le garde-fou survit donc, sous une forme
> plus juste et plus utile : il protège **la décision**, pas la valeur.
>
> *(Conformément à la doctrine du projet, l'addendum n° 2 n'est **pas réécrit** : un journal dit ce
> qu'on savait, et quand. Cette entrée-ci porte la correction.)*

### 2. Le cadre qui fait désormais foi — `DECISIONS.md` **D-030 §9**

> 🎯 *« Je ne veux pas que C-003 soit construit autour de l'idée "60 minutes = verrou qui bloque la
> reprise". Je veux que le moteur cherche toutes les marges de manœuvre disponibles avant de
> conclure que le tournoi ne peut plus être repris. »* — Romain

**6 CONTRAINTES** que le moteur ne franchit jamais · **8 LEVIERS** ordonnés du moins au plus
intrusif · **5 PRINCIPES** d'escalade.

Le plus structurant des cinq : **quand une contrainte configurable doit changer, on demande une
décision explicite à l'organisateur — on ne la modifie jamais automatiquement.**

### 3. ⚡ Deux faits vérifiés dans le code, qui changent le travail

| # | Fait constaté | Conséquence |
|---|---|---|
| **1** | ✅ **Le cœur de calcul accepte DÉJÀ le repos en paramètre.** `planifierCategorieEchelonnee` reçoit `opts.repos` *(60 par défaut)*, et il existe même déjà un **avertissement** pour le cas dégénéré. **Seul l'appelant passe 60 en dur.** | **Rendre le repos saisissable ne demande AUCUNE modification de l'algorithme** — un champ, sa lecture, son passage. → nouveau chantier **C-004**, petit et **indépendant** |
| **2** | ⚠️ **La règle d'équité n'est vérifiée nulle part.** *« Une équipe reposée n'affronte pas une équipe qui ne l'est pas »* est garantie par la **forme** du planning : matin *(inter-vagues, tous frais)* → vague 1 en pause pendant que la vague 2 joue **ses matchs internes** → l'inverse → après-midi *(inter-vagues, tous ayant déjeuné)* | 🔴 **Un levier qui réorganiserait librement les rencontres casserait l'équité EN SILENCE** — ni erreur, ni avertissement. **Deux mesures inscrites dans C-003** : le levier « réorganiser » **conserve la structure en 4 blocs**, et un **test d'équité** est ajouté pour que la règle devienne **prouvable** |

### 4. Ce qui a été écrit

| Document | Changement |
|---|---|
| `DECISIONS.md` **D-030 §8.3** | **Réécrit** — trois marges, trois régimes. Le repos passe de « jamais » à « levier sous décision explicite » |
| `DECISIONS.md` **D-030 §8.3 bis / ter** | Les deux faits vérifiés dans le code |
| `DECISIONS.md` **D-030 §9** *(nouveau)* | ⭐ **Le cadre de la reprise** : 6 contraintes / 8 leviers / 5 principes + vérification de compatibilité |
| `DECISIONS.md` **D-030 §5** | Point ouvert **(g)** : existe-t-il un **repos minimal réglementaire** en École de Rugby ? |
| `PLAN.md` **C-003** | **Réécrit** autour du cadre. Nouveaux tests : **équité**, **escalade** *(un retard rattrapable au levier 1 n'en utilise pas d'autre)*, **épuisement** *(« impossible » seulement après les 8 leviers)* |
| `PLAN.md` **C-004** *(nouveau)* | Rendre saisissable le repos minimal — **P2, indépendant, faisable à tout moment**, migration douce *(absent ⇒ 60)* |
| `ETAT.md`, `RISQUES.md` | Mis en cohérence |

### 5. ✅ Vérification des contradictions *(demandée par Romain)*

| Ce qui existe | Verdict |
|---|---|
| **D-013** — *« avertir, jamais interdire »* | ✅ **Même idée.** Le principe 5 en est la version pour les valeurs configurables |
| **D-027** — *« un message ne ment jamais »* | ✅ **Renforcé, et étendu** : annoncer *« la reprise est impossible »* sans avoir parcouru les 8 leviers **serait un message qui ment** |
| **Réponse à I-21** *(temps de jeu max, pas de phase finale)* | ✅ **Intacte** — contraintes 2 et 5 |
| **Règle d'équité implémentée par Romain** | ✅ **Préservée explicitement** *(contrainte 4)*, et **rendue prouvable** par un test |
| **`CLAUDE.md` §11** — la fonctionnalité métier prime | ✅ **Renforcé** : refuser une reprise à cause d'une valeur qu'un humain aurait pu ajuster serait une **rigidité technique qui dégrade l'usage métier** — donc, au sens de §11, **pas une amélioration** |
| **D-030 §8.3, version du matin** | ❌ **Contredite → CORRIGÉE** |
| **`PLAN.md` C-003, version du matin** | ❌ **Contredite → RÉÉCRITE** |

**Aucune autre contradiction.** Les décisions métier (D-011, D-012, D-014, D-015), les décisions de
données (D-018 → D-020) et les décisions de méthode (D-005, D-009, D-025, D-028, D-029) ne sont pas
touchées.

### 6. État

- **Aucun fichier de l'application modifié** — vérifié ;
- **aucune ligne de code écrite** ;
- **7 inconnues ouvertes**, **0 décision en attente**, **4 fiches de chantier** *(C-001 → C-004)* ;
- fichiers touchés : `DECISIONS.md`, `PLAN.md`, `ETAT.md`, `RISQUES.md`, `SESSIONS.md` ;
- **la session 14 (volet ②) n'est pas commencée.**
