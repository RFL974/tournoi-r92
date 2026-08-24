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

- `backend/Code.gs` — la déclaration `ENTETES` (les colonnes des **7** onglets qu'elle décrit) ;
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

---

## SESSION 13 — ADDENDUM n° 4 : **D-031 et D-032** — deux règles de Romain, deux défauts trouvés

> **Deux précisions apportées par Romain**, et une troisième en cours de rédaction :
>
> 1. *« La réglementation importe au responsable du tournoi, pas à l'app — à lui de renseigner ce
>    que la réglementation impose. »*
> 2. *« Quand la pause échelonnée est cochée, la pause classique ne s'applique pas, et inversement.
>    Elles ne doivent jamais coexister. »*
> 3. *« On ne touche pas au bouton "Appliquer les valeurs FFR" aux catégories — ici c'est juste une
>    aide à la saisie qu'il peut modifier. »*
>
> ⚠️ **Aucun code modifié.**

### 1. D-031 — la réglementation appartient au responsable

**Ce que ça change** : aucun seuil réglementaire n'est écrit dans le code. L'application applique
**les valeurs saisies**, et **rien d'autre**.

**Ce que ça ferme immédiatement** : le point ouvert **(g)** de D-030 — *« existe-t-il un repos
méridien minimal réglementaire ? »*. **La question ne se pose plus** : ce n'est pas l'affaire de
l'application. Une question sortante de moins, un avertissement de moins à construire, et **C-004
se simplifie**.

> ⚠️ **La contrepartie, et elle n'est pas négociable** : quand une valeur **manque**, l'application
> ne doit **ni inventer, ni faire comme si le contrôle avait eu lieu**. Elle le dit :
> *« aucun plafond renseigné pour cette catégorie — cette proposition n'a pas pu être vérifiée sur
> ce point »*. C'est **D-027** : une case non cochée n'est pas une case verte.

> 🚧 **Garde-fou inscrit explicitement, à la demande de Romain.** D-031 ne vise **pas** le bouton
> **« Appliquer les valeurs FFR »**, ni la lecture des `RefFFR_*`, ni l'écran de conformité.
> **Loin de contredire D-031, ce bouton en est le meilleur exemple** : D-031 dit que *c'est le
> responsable qui renseigne* — le bouton est l'outil qui l'aide à le faire vite, **et il garde le
> dernier mot**. Ce que D-031 interdit est autre chose : que l'application **décide** à sa place ou
> **refuse** une valeur au nom d'une règle qu'elle croirait connaître.
>
> 🏉 **En une image** : le bouton est un **formulaire pré-rempli**, pas un **agent qui vérifie à la
> sortie**. → une **liste « ce qu'aucun chantier ne doit toucher »** est désormais en tête de
> `PLAN.md` §6, pour qu'aucune session future ne le « nettoie » au nom de D-031.

### 2. D-032 — et le défaut qu'elle a révélé

**Vérification faite avant d'écrire quoi que ce soit** : aujourd'hui, **les deux modes coexistent**.
La pause échelonnée est un réglage **global**, une catégorie y est éligible **dès 4 équipes**, et
**en dessous le code la bascule en pause classique** — avec cet avertissement, écrit tel quel :

> *« Catégorie X : pause échelonnée demandée mais seulement 3 équipe(s) — **pause classique
> conservée pour cette catégorie**. »*

C'est **délibéré**, et **D-032 l'interdit désormais**. → **R-091** inscrit au registre.

**✅ Arbitrage de Romain** : *la petite catégorie garde une pause, mais la sienne* — pas de deux
vagues *(impossible à 3 équipes)*, mais **une coupure de midi propre, de la durée du repos minimal
configuré**. Les trois autres options ont été écartées : *tout ou rien* aurait privé toutes les
catégories pour une seule ; *interdire de cocher la case* était trop rigide (un désistement la
veille) ; *aucune pause* aurait laissé **des enfants jouer toute la journée sans coupure**.

### 3. ⚡ Deux défauts trouvés — et aucun ne vient de l'audit

| Réf | Défaut | Comment il a été trouvé |
|---|---|---|
| **R-090** (P2) | **En pause échelonnée, le champ « Pause déjeuner — durée (min) » est ignoré sans le dire.** Il fonctionne en pause classique ; pour les catégories échelonnées le code l'ignore et **force 60 en dur**. On peut donc régler **45** et voir **60**, sans avertissement | **En répondant à la question de Romain** *« tu parles du repos du midi ? »* |
| **R-091** (P2) | **Les deux modes de pause coexistent** dans le même tournoi | **En vérifiant** la règle que Romain venait de poser |

> 💡 **Ce que ces deux lignes disent de la méthode, et c'est le vrai enseignement de l'addendum** :
> **les questions de Romain trouvent des défauts que huit domaines d'audit n'ont pas vus.** Ni l'un
> ni l'autre n'a été trouvé en relisant du code — mais en **confrontant le code à ce que
> l'organisateur croit qu'il fait**.
>
> 🔗 **R-090 appartient au fil rouge du domaine H** *(ce n'est pas le code qui se trompe, c'est ce
> qu'il raconte)* — **en pire** : ce n'est pas un commentaire qui ment à un développeur, c'est
> **un écran qui ment à l'organisateur**.

**Un sixième commentaire faux** a été relevé au passage et rattaché à **R-083** : sur l'éligibilité
à la pause échelonnée, deux commentaires du même fichier se contredisent *(« effectif pair ≥ 4 »
contre « dès 4 équipes, impairs gérés par un bye »)*. **Le code teste seulement `≥ 4`.**

### 4. État

- **Aucun fichier de l'application modifié** ;
- registre : **91 problèmes** — **88 de l'audit** *(figé)* **+ 3 post-clôture** (R-089, R-090, R-091) ;
- **0 décision en attente** · **7 inconnues** · **4 fiches de chantier** (C-001 → C-004) ;
- fichiers touchés : `DECISIONS.md`, `RISQUES.md`, `PLAN.md`, `ETAT.md`, `SESSIONS.md` ;
- **la session 14 (volet ②) n'est pas commencée.**

---

# SESSION 14 — 2026-08-06 · **ÉTAPE 3, volet ② : les chantiers SANS CODE**

> **Objectif unique** : écrire les **fiches de chantier** de tout ce qui ne touche aucune ligne
> exécutable. ⚠️ **Écrire les fiches, pas faire le travail** — l'exécution appartient à l'ÉTAPE 5,
> après validation de Romain à l'ÉTAPE 4.

## 0. Mise à jour avant lecture (`CLAUDE.md` §12.3)

`git fetch origin` puis `git status -sb` → **`## main...origin/main`**, aucun « retard », dépôt
propre, dernier commit `64f863b`. **Rien de neuf côté chantier fonctionnalités** depuis la veille.

## 1. Ce qui a été fait

**Six fiches de chantier écrites** — `PLAN.md` **§7**, une par lot, au format du modèle.

| Fiche | Chantier | Problèmes | Priorité |
|---|---|---|---|
| **C-005** | 📣 Les trois textes d'information | **R-028** (P1), R-038 | **P1** |
| **C-006** | 🗑️ La politique de conservation, écrite là où on la lira | **R-030** (P1), R-031, R-033, R-034 | **P1** |
| **C-007** | 📄 Remettre le projet en face de lui-même | **R-073** (P1), R-072 *(reliquat)*, R-024 | **P1** |
| **C-008** | 📝 Les commentaires qui disent le contraire du code | R-083 *(6 cas)* | P2 |
| **C-009** | 🧹 Le code mort qui affirme servir | R-084, R-087 | P2 |
| **C-010** | 🏉 Le barème et le départage pour les clubs | R-012 | P2 |

## 2. Le résultat, en trois constats

### ⭐ Constat n° 1 — **Le volet ② n'était pas « sans code », et ça change une route**

Annoncé comme *« cinq lots qui ne touchent aucune ligne exécutable »*. **En les instruisant, c'est
faux pour deux d'entre eux** : effacer un commentaire faux (**C-008**) et supprimer du code mort
(**C-009**), **ce sont des fichiers source qu'on ouvre**.

Le comportement ne change pas — mais **D-006 impose alors branche + PR + validation**, pas un commit
direct sur `main`. Le volet se répartit donc en **trois groupes** selon **comment le travail arrive
dans le dépôt** :

| Groupe | Fiches | Route |
|---|---|---|
| Documentation pure | C-005, C-006, C-007 | Commit direct sur `main` |
| Commentaires *(0 ligne exécutable)* | C-008 | Branche + PR |
| Code mort *(des lignes supprimées)* | C-009 | Branche + PR + tests |
| Mixte | C-010 | Coupé en deux : le texte au volet ②, le champ au volet ③ |

> 💡 **Ce n'est pas une nuance administrative.** C'est la différence entre *« je peux le faire ce
> soir »* et *« il faut que tu relises avant »*.

### ⭐ Constat n° 2 — **La partie dangereuse de R-072 est déjà corrigée** *(vérifié dans les fichiers)*

`docs/deploiement.md` nomme désormais les **deux** fichiers du serveur — `Code.gs` **et
`Tests.gs`** — et donne les **deux nombres de contrôle** : **589** *(le bilan attendu)* et **3711**
*(la dernière ligne du fichier collé)*.

**C'était le mécanisme exact de M-04** — la preuve fausse entrée au dossier en session 6 — et il est
**refermé** *(D-029, appliquée en session 11)*.

⚠️ **Le reliquat est réel mais petit** : `Tests.gs` n'est toujours cité ni par `passation.md`, ni par
`backend/README.md`, ni par `README.md`. **C'est du confort, ce n'est plus un piège.** Le registre
le disait déjà correctement — la vérification l'a confirmé plutôt que corrigé.

### ⭐ Constat n° 3 — **Quatre chantiers ne dépendent de rien**

**C-005**, **C-006**, **C-007** et la **moitié ① de C-010** peuvent commencer **dès validation**,
sans attendre une seule ligne de code. **Deux d'entre eux referment des P1.**

> 🏉 **Et l'un d'eux a le meilleur rapport effort / risque évité de tout le plan** : **R-034** — un
> champ libre *(« équipes étrangères »)* **invite explicitement à saisir noms, prénoms et dates de
> naissance d'enfants**. C'est le **seul endroit de l'application où un mineur cesse d'être un
> nombre**. D-020 a tranché : **effacé après envoi du dossier**. Écrire cette ligne — et l'appliquer
> à la main — ne coûte rien.

## 3. Ce que les fiches disent d'inconfortable, et qu'il fallait écrire

- **C-005 ne referme pas R-028 tout seul** : il **produit** les textes. R-028 ne sera clos que
  lorsqu'ils seront **en ligne** — ce qui appartient à Romain *(D-005 : périmètre fermé)* ;
- **C-006 n'efface rien** : il écrit les durées et liste les **gestes à faire à la main**.
  L'outillage de purge est du **code**, il ira au volet ③. Il **ne referme donc ni R-031 ni R-033** ;
- **C-010 moitié ① ne referme pas R-012** : le champ « Règlement » **a été retiré de l'écran
  d'administration**. Un texte que personne ne peut publier ne prévient personne ;
- **C-009 pose une question métier avant de supprimer** : la colonne `pause_echelonnee` **par
  catégorie** est morte — mais **D-032 vient de rendre le sujet vivant**. Faut-il la **supprimer**,
  ou la **brancher** ? `CLAUDE.md` §10 interdit de supprimer du code « qui semble inutile » sans
  vérifier ses usages : ici l'usage est **potentiel**, pas passé. **→ à trancher à l'ÉTAPE 4** ;
- **C-007 a un risque qui n'est pas de casser, mais de mentir** *(leçon **M-06**)* : chaque phrase
  écrite doit être **vérifiée dans le code**, jamais déduite. **Un document faux est pire qu'un
  document absent — c'est exactement comme ça que R-073 est né.**

## 4. Une règle que C-008 doit poser en même temps qu'il corrige

`CLAUDE.md` **§8 bis** protège la **documentation**. **Il lui manque son pendant pour les
commentaires** :

> *Une session qui branche ce qu'une précédente annonçait « pas encore branché » efface la phrase
> dans le même lot.*

**Sans cette règle, C-008 sera à refaire.**

## 5. Ce qui n'a **PAS** été fait

- ❌ **Aucun texte n'a été rédigé** — C-005 et C-010 **planifient** la rédaction, ils ne la font pas ;
- ❌ **aucune durée n'a été écrite** ailleurs que dans `DECISIONS.md` ;
- ❌ **aucun commentaire, aucun code mort n'a été touché** ;
- ❌ **aucun fichier de l'application modifié** — vérifié.

## 6. Prochaine session recommandée

**Session 15 — ÉTAPE 3, volet ③ : les chantiers AVEC code.** Il reste à écrire les fiches du lot ①
des tests (**R-041**/D-025), de **R-042**, et des familles déjà repérées *(le filet côté serveur,
faire parler le geste du jour J, terminer le travail d'affluence, alléger ce qui voyage)*.

> ⚠️ **Ou bien — et c'est un choix qui t'appartient — l'ÉTAPE 4 peut commencer AVANT le volet ③**,
> sur les quatre chantiers qui ne dépendent de rien. Deux referment des P1, et **rien ne les oblige
> à attendre que le reste du plan soit écrit.**

**Condition de démarrage** : instruction explicite de Romain.

---

# SESSION 15 — 2026-08-06 · **ÉTAPE 3, volet ③ (vague 1) : les chantiers AVEC code**

> **Objectif** : écrire les fiches des chantiers qui touchent au code, en commençant par **ceux qui
> doivent passer en premier**. ⚠️ **Écrire les fiches, pas coder.**

## 0. Mise à jour avant lecture (`CLAUDE.md` §12.3)

`git fetch` + `git status -sb` → **`## main...origin/main`**, aucun retard, dépôt propre.

## 1. Une décision de méthode prise en ouverture : **deux vagues**

Il restait **une cinquantaine de problèmes** à répartir. Les instruire tous en une séance aurait
produit des **fiches creuses**.

> ⚠️ **Et une fiche creuse est pire que pas de fiche** : elle donne l'illusion que le travail est
> instruit, donc plus personne ne le refait.

**Vague 1** *(cette séance)* = ce qui doit passer en premier, et rien d'autre. **Vague 2**
*(session 16)* = listée en `PLAN.md` §9, pour que rien ne se perde.

## 2. Les six fiches

| Fiche | Chantier | Referme | Risque de la correction |
|---|---|---|---|
| **C-011** | 🥅 Les tests du barème et du départage | **R-041** (P1) | ⚪ **nul** |
| **C-012** | 🔧 Séparer le cœur de la saisie du score | **R-042** (P1) | 🟠 élevé |
| **C-013** | 🚦 Un contrôle avant publication | **R-043** (P1), R-049, R-050 | 🟢 très faible |
| **C-014** | 🔊 Faire parler l'application le jour J | **R-051**, **R-052** (P1), R-053, R-069, R-085, R-086 | 🟡 faible à moyen |
| **C-015** | 🏉 Les règles du jour J | **R-001, R-003, R-004, R-005** (4 P1), R-013 | 🟠 élevé |
| **C-016** | 🔒 Le filet côté serveur | **R-015**, **R-016** (P1), R-047 | 🟡 moyen |

**Ordre d'exécution inscrit** :

```
C-011 → C-012 → C-015 · C-002 → C-016 · C-014 → C-003
C-013 : indépendant, à tout moment
```

## 3. Ce que la vérification dans le code a apporté

### ⭐ **C-011 ne modifie AUCUNE ligne de l'application** — et c'est vérifié, pas supposé

| Fonction | Taille réelle | Touche le classeur ? |
|---|---|---|
| `enregistrerResultat(s, pour, contre)` | **6 lignes** | ❌ non |
| `comparerClassement(a, b)` | **5 lignes** | ❌ non |

**La promesse de D-025 tient** : les deux fonctions qui décident du vainqueur sont déjà pures et
minuscules. **On ajoute des tests, c'est tout.** Meilleur rapport protection / risque du plan.

> ⚠️ **Sans surestimer la portée, et c'est important** : `calculerClassement(classeur)`, lui, **lit
> le classeur** — il n'est pas pur. **C-011 protège les RÈGLES, pas la chaîne complète.** Confondre
> les deux ferait croire le classement protégé de bout en bout, ce qui serait faux.

### Deux autres constats

- **`enregistrerScore` fait 111 lignes** et reçoit le classeur → **C-012 est bien un déménagement**,
  pas une réécriture. Et **quatre décisions** *(D-011, D-012, D-015, D-030)* rouvrent cette même
  fonction : fait une fois avant, c'est **un** chantier ; fait après, **quatre** ;
- **le fichier de publication ne contient aucune étape de contrôle** — la publication part sur
  `main` sans même une vérification de syntaxe. **C-013 confirmé, et c'est le moins cher du plan.**

## 4. Deux pièges inscrits dans les fiches, pour ne pas les redécouvrir

- ⚠️ **C-011 oblige à mettre à jour `docs/deploiement.md`** : le bilan passera de **589** à un autre
  nombre. Si on l'oublie, **le contrôle à deux nombres devient faux** — et on rouvre **M-04** de nos
  propres mains, après l'avoir refermé ;
- ⚠️ **C-013 ne doit pas trop en demander** : un contrôle trop strict qui refuserait de publier une
  correction urgente **le jour du tournoi** serait pire que pas de contrôle. **Il vérifie la
  syntaxe, il ne juge pas le style.** Et il se prouve en **cassant volontairement** une branche —
  sans cette démonstration, on ne sait pas si le contrôle contrôle quelque chose.

## 5. Ce qui n'a **PAS** été fait

- ❌ **aucune ligne de code écrite** ; ❌ **aucun test ajouté** ;
- ❌ **la vague 2 n'est pas instruite** — seulement **listée** ;
- ❌ **aucun fichier de l'application modifié** — vérifié.

## 6. Prochaine session recommandée

**Session 16 — volet ③, vague 2** *(affluence, alléger ce qui voyage, le verrou, savoir qui a fait
quoi, l'interface sur le terrain, et le reste)*.

> ⚠️ **Ou l'ÉTAPE 4 — la validation.** **16 chantiers ont maintenant une fiche**, dont **six qui ne
> dépendent de rien** et **plusieurs qui referment des P1**. Écrire le reste du plan avant de
> commencer à corriger est **défendable, mais ce n'est pas obligatoire** — et ce choix
> t'appartient.

**Condition de démarrage** : instruction explicite de Romain.

---

# SESSION 16 — 2026-08-06 · 🏁 **ÉTAPE 3, vague 2 — ET CLÔTURE DE L'ÉTAPE 3**

> **Choix de Romain, et il commande toute la séance** : *« Je préfère qu'on ait la vision complète
> plutôt que commencer un chantier pour ensuite devoir repasser dessus parce qu'une session
> ultérieure devra ajouter, supprimer ou modifier quelque chose sur lequel on a décidé de travailler
> trop tôt. »*
>
> ⚠️ **Aucune ligne de code écrite.**

## 0. Mise à jour avant lecture

`git fetch` + `git status -sb` → **`## main...origin/main`**, propre, aucun retard.

## 1. La séance a commencé par une mesure, pas par de la rédaction

**Puisque l'objectif était la couverture complète, il fallait d'abord savoir ce qui manquait.**
Extraction du registre et confrontation aux fiches existantes :

> **36 problèmes sur 91 avaient une fiche. 55 n'en avaient aucune.**

C'est ce chiffre qui a défini la séance — pas une intuition.

## 2. Ce qui a été écrit

**14 fiches** — **C-017 → C-030** :

| Fiche | Chantier | Referme |
|---|---|---|
| **C-017** | ⚡ Terminer le travail d'affluence | **R-064**, **R-061** (P1), R-062, R-071 |
| **C-018** | 🪶 Alléger ce qui voyage | R-066, R-065, R-063, R-080 |
| **C-019** | 🔐 Le verrou et ce qu'on met dedans | R-067, R-068, R-070 |
| **C-020** | 🕵️ Savoir qui a fait quoi | **R-017** (P1), R-023, R-059 |
| **C-021** | 🚪 Fermer ce qui sort | R-021, **R-018** (P1), R-032, R-020 |
| **C-022** | 📱 L'interface sur le terrain | R-054 → R-058, R-060 |
| **C-023** | 🏉 Le Super Challenge | R-082, R-009 |
| **C-024** | 🪞 Le miroir qui se vérifie tout seul | **R-044** (P1) |
| **C-025** | 🧱 Les rigidités de génération | **R-002** (P1), R-006 → R-008, R-010 |
| **C-026** | 🕶️ Les expositions inutiles | R-022, R-025, R-037, R-026, R-027 |
| **C-027** | 🧪 Les tests qui manquent encore | R-045, R-046 |
| **C-028** | 🔏 La protection des données : ce qui reste | R-035, R-036, R-039, **R-029** (P1) |
| **C-029** | 📌 Savoir quelle version tourne | R-075 |
| **C-030** | 🧭 La maintenabilité, **en opportuniste** | R-074, R-076 → R-079, R-081, R-088 |

**Plus un rattachement** : **R-048** *(un envoi qui n'aboutit pas fige le bouton indéfiniment — les
lectures ont un délai d'abandon, **les écritures n'en ont aucun**)* rejoint **C-014**. Même écran,
même sujet : **rendre l'application bavarde sans borner l'attente ne servirait à rien.**

## 3. 🎯 Le livrable principal : **la couverture est prouvée**

| | |
|---|---|
| Problèmes au registre | **91** |
| Placés dans un chantier | **88** |
| Explicitement écartés | **3** — R-011, R-019, R-040 |
| **Sans place** | ✅ **0** |
| Chantiers | **30** *(C-001 → C-030)* |

**Le tableau complet est en `PLAN.md` §12**, ligne par ligne, et il a été **produit en relisant les
fiches** — pas de mémoire.

> ⚠️ **Ce que ce tableau ne prouve pas** : que les 91 seront corrigés. Il prouve que **chacun a une
> place et une décision** — y compris *« on ne le fait pas, et voici pourquoi »*.

## 4. Trois choix de méthode assumés

1. **Les fiches de la vague 2 sont plus courtes**, et c'est délibéré : ce sont des P2 et des P3.
   Trois pages pour un problème de confort seraient de la sur-instrumentation, et feraient perdre de
   vue les P1 ;
2. **C-030 n'est pas un chantier, c'est une RÈGLE** : les sept constats d'architecture *(fichier de
   8 147 lignes, tests rangés par date, administration en anneau, 12 noms en double…)* ne doivent
   **jamais** être traités en bloc — chacun, fait d'un coup, **aggrave un problème plus grave que
   lui**. La règle retenue : *quand on ouvre un fichier pour une autre raison, on améliore ce qu'on
   touche, et rien d'autre* ;
3. **Trois problèmes n'auront pas de fiche**, et c'est écrit noir sur blanc : **R-019** *(ce n'est
   pas un chantier, c'est l'action D-017 de Romain)*, **R-011** et **R-040** *(P3, prématurés)*.

## 5. `ETAT.md` a été raccourci

Le fichier accumulait des sections historiques *(« 1 bis », « 1 ter », « 1 quater »…)* alors qu'il
est censé rester **court volontairement**. Les quatre ont été **condensées en un tableau de cinq
lignes**. Rien n'est perdu : le détail vit dans `SESSIONS.md`, `RAPPORT-AUDIT.md` et `PLAN.md`.

## 6. Prochaine étape : **l'ÉTAPE 4 — LA VALIDATION**

Ce n'est plus une étape d'écriture. C'est **celle de Romain** : accepter, refuser ou réordonner les
chantiers, **un par un**.

> 💡 **Ma recommandation** : **ne pas les prendre dans l'ordre du numéro.** Commencer par **ce qui
> ne peut rien casser** — **C-011** *(les tests)*, **C-013** *(le contrôle avant publication)*,
> **C-005 · C-006 · C-007** *(documentation pure)*. **Six P1 y sont refermés, et aucun ne touche au
> comportement de l'application.** Le premier chantier qui modifie vraiment quelque chose serait
> alors **C-012** — et il serait déjà protégé par les tests de C-011.

**Trois questions attendent Romain à l'ÉTAPE 4** : la colonne morte de **C-009** *(supprimer ou
brancher ?)*, jusqu'où va **C-020** *(savoir qui a fait quoi)*, et les **cinq points ouverts** de
D-030 §5 pour **C-003**.

---

# ÉTAPE 4 — LA VALIDATION · **C-011** *(2026-08-06)*

> **Ouverture de l'ÉTAPE 4.** Romain : *« Nous allons valider les chantiers un par un avant toute
> modification du code. Commence par C-011. »* Format de présentation imposé par lui : problème
> couvert · problèmes du registre · objectif · ce qui sera modifié · ce qui ne le sera pas · risques
> · dépendances · critères de fin.

## 1. Deux décisions prises

| | |
|---|---|
| **C-011** | ✅ **VALIDÉ** le 2026-08-06 |
| **L'ordre des chantiers** | ✅ **« D'abord tout ce qui ne peut rien casser »** → **C-011 → C-013 → C-005 · C-006 · C-007**, puis C-012 |

> 💡 **Ce que cet ordre garantit** : **six P1 sont refermés avant que la première ligne de
> comportement ne bouge.** Le premier chantier qui modifie vraiment quelque chose sera **C-012** —
> et il sera déjà protégé par les tests de C-011.

## 2. C-011 — ce qui a été fait

**5 fonctions de test, 27 vérifications**, dans `backend/Tests.gs` :

| Test | Ce qu'il protège |
|---|---|
| `testClassement_baremeVictoireNulDefaite` | Victoire 3 / nul 2 / défaite 1, les compteurs V-N-D, et **0-0 est un nul, pas une défaite** |
| `testClassement_cumulSurPlusieursMatchs` | Marqués, encaissés, différence — **y compris une différence négative** |
| `testClassement_departageParLesPoints` | Les points priment sur tout le reste |
| ⭐ `testClassement_departageParLaDifference` | **Le 2ᵉ critère — que rien ne testait** |
| ⭐ `testClassement_departageParLesPointsMarquesEtOrdreStable` | **Le 3ᵉ critère — que rien ne testait**, l'égalité stricte qui ne départage pas, et un tri complet de poule |

**`backend/Code.gs` n'a pas été touché d'une ligne** — vérifié par `git diff`.

## 3. La preuve

```
R92 — 616/616 OK, 0 FAIL
```

Exécuté **hors d'Apps Script**, sur les fichiers réels du dépôt : `Code.gs` et `Tests.gs` chargés
dans un bac à sable avec une vingtaine de lignes de doublures *(la méthode démontrée en session 8)*.
**Les 27 nouvelles vérifications passent, et aucune des 589 existantes n'est cassée.**

> ⚠️ **Ce que cette preuve ne prouve pas** : que ça passe **chez Google**. Le statut reste donc
> `EN COURS` → `CORRIGÉ` à la fusion → **`TESTÉ` seulement quand Romain aura relancé
> `lancerTestsFFR` dans Apps Script**. C'est exactement la règle qui a coûté **M-04**.

## 4. Les deux nombres de contrôle ont suivi — dans le même lot

`docs/deploiement.md` : **589 → 616** et **3711 → 3859**.

> 🔗 **Les mettre « plus tard » aurait rouvert M-04 de nos propres mains**, juste après l'avoir
> refermé. C'est pourquoi ce fichier de documentation est **dans la PR** et non sur `main` : il est
> **inséparable** du changement de code.

## 5. Une amélioration opportuniste, au passage

Les tests sont nommés **par sujet** (`testClassement_…`), **pas par numéro de session**. **R-076**
avait montré que **27 préfixes sur 31** sont des numéros de session — ce qui ne dit jamais de quoi
le test parle. **On n'aggrave pas le compte.** C'est l'application de la règle de **C-030** :
*quand on ouvre un fichier pour une autre raison, on améliore ce qu'on touche, et rien d'autre.*

## 6. État

- **PR [#181](https://github.com/RFL974/tournoi-r92/pull/181)** ouverte, commit `af31664` ;
- **R-041** : `IDENTIFIÉ` → ⚙️ **`EN COURS`** ;
- ⚠️ **à faire à la main après fusion** : coller `Tests.gs` chez Google, lancer `lancerTestsFFR`,
  vérifier **616/616** et **la dernière ligne à 3859**.

---

# ÉTAPE 5 — **C-013** : un contrôle avant publication *(2026-08-06)*

> **Consigne de Romain** : *« Respecte exactement le périmètre présenté : syntaxe uniquement ;
> aucun changement applicatif ; documentation dans le même lot ; contrôle placé avant la
> publication. »* Et : *« Ne considère pas C-013 comme "testé" sur la seule base d'une inspection du
> workflow. Je veux la preuve réelle dans GitHub. »*

## 1. Ce qui a été fait

Le workflow de publication contient désormais **deux travaux** :

```
verifier  ──(needs)──►  deploy
```

`node --check` sur **tous les `.js` de `frontend/`** — **30 fichiers**, bibliothèques extérieures
comprises *(elles sont déposées à la main, donc elles peuvent arriver tronquées)*.

**Fichiers modifiés** : `.github/workflows/pages.yml` · `docs/deploiement.md` §B.
**Aucun fichier de l'application** — ni serveur, ni navigateur, ni page.

## 2. ⚠️ Une correction de périmètre, annoncée AVANT d'écrire

J'avais présenté *« JavaScript **ou HTML** »*. **Le HTML n'est pas vérifié** : les 8 pages ne
contiennent **aucun script en ligne** *(constaté)*, et contrôler la syntaxe HTML exigerait
**une dépendance que le projet a délibérément refusée**. C'est écrit dans la documentation, pas
seulement dit ici.

## 3. Les deux preuves — **réelles, dans GitHub**

### Preuve 1 — branche volontairement cassée → le contrôle refuse

Branche jetable `preuve/c-013-syntaxe-cassee` *(PR **#183**, **fermée sans fusion**)* : une accolade
jamais fermée dans `frontend/js/commun.js`.

```
  CASSÉ  frontend/js/commun.js
         frontend/js/commun.js:3
         SyntaxError: Unexpected string
----------------------------------------------
PUBLICATION REFUSÉE — au moins un fichier ne se lit pas.
Le site actuellement en ligne n'est pas remplacé.
##[error]Process completed with exit code 1.
```

| Travail | Résultat |
|---|---|
| Vérifier la syntaxe des fichiers publiés | ❌ **failure** |
| Publier sur GitHub Pages | ⏭️ **skipped** |

### Preuve 2 — branche saine → le contrôle passe

```
30 fichiers JavaScript vérifiés, aucun cassé.
```

Travail **success**.

## 4. ⚠️ CE QUE CES PREUVES NE PROUVENT PAS — et pourquoi je l'écris

Sur **les deux** exécutions, « Publier sur GitHub Pages » est **skipped**. Ce n'est pas le verrou qui
l'explique : c'est que **sur une proposition de fusion, la publication est neutralisée de toute
façon** *(`if: github.event_name != 'pull_request'`)*.

> **Le contrôle est prouvé. Le verrou `needs: verifier` ne l'est que par construction.**
>
> Il sera **observé au premier envoi réel sur `main`** : la publication n'aura lieu qu'après un
> contrôle réussi, et cela se lira dans l'onglet Actions.
>
> 🔗 **C'est exactement la discipline de M-04** : ne pas appeler « prouvé » ce qui est seulement
> « très probable ». Un moyen de l'observer tout de suite existe — déclencher le workflow à la main
> sur la branche cassée — **mais il vise le chemin de publication du site en production**, et il ne
> sera pas employé sans accord explicite de Romain.

## 5. Deux précautions prises au passage, qui n'étaient pas demandées

1. **Les droits `pages: write` et `id-token: write` sont descendus au niveau du travail `deploy`.**
   Une exécution déclenchée par une proposition de fusion n'obtient donc **jamais** le droit
   d'écrire sur Pages ;
2. **Le verrou de concurrence `pages` est descendu lui aussi sur `deploy`.** Sans cela, un contrôle
   lancé par une proposition de fusion aurait pu **annuler une publication en cours sur `main`** —
   le workflow portant `cancel-in-progress: true`. **C'aurait été une régression introduite par le
   chantier censé protéger la publication.**

## 6. État

- **PR [#182](https://github.com/RFL974/tournoi-r92/pull/182)** ouverte · **#183** fermée sans fusion ;
- **R-043** : `IDENTIFIÉ` → ⚙️ **`EN COURS`**, **moitié (a) faite et prouvée** ; la moitié (b)
  *(harnais du navigateur)* **reste entière** et hors périmètre ;
- **R-049**, **R-050** : couverts par la documentation du même lot.

---

## C-013 — **ADDENDUM : statuts arrêtés par Romain, et essai refusé** *(2026-08-06)*

### Les trois statuts, dans ses termes

| | |
|---|---|
| **CORRIGÉ** | ✅ **oui** |
| **CONTRÔLE DE SYNTAXE** | ✅ **PROUVÉ** |
| **CHAÎNAGE `needs` sur le chemin réel de publication** | ⏳ **À OBSERVER** au premier déploiement sur `main` |

### ⛔ L'essai supplémentaire a été refusé — et c'est le bon arbitrage

J'avais proposé de déclencher le workflow à la main sur la branche cassée, pour **observer** le
verrou plutôt que de le déduire. **Romain a refusé**, et sa raison est meilleure que ma proposition :

> *« Je préfère cette preuve réelle plutôt que de provoquer volontairement une exécution du chemin de
> publication. »*

**Le raisonnement, écrit pour les sessions futures** : on a déjà une preuve réelle que le contrôle
échoue sur une faute de syntaxe **et** que la publication est neutralisée dans ce contexte. Le
chaînage manquant s'observera **gratuitement**, sur un déploiement **légitime**, dès la fusion.
**Provoquer une exécution du chemin de publication pour prouver quelque chose qu'un événement
normal prouvera de toute façon, c'est prendre un risque de production pour rien.**

### Ce qui a été fait ensuite

- 🗑️ **Branche `preuve/c-013-syntaxe-cassee` supprimée**, locale et distante, sur autorisation
  explicite. ✅ **La preuve n'est pas perdue** : la **PR #183** *(fermée)* et son **journal
  d'exécution** sont conservés par GitHub ;
- ⏸️ **L'ÉTAPE 4 est en pause.** Consigne : *« Ne passe pas au chantier suivant tant que la PR #182
  n'est pas fusionnée. »* À la reprise, on vérifie **ensemble** le premier passage dans Actions et
  on confirme le résultat du déploiement réel.

---

## C-013 — ✅ **LE CHAÎNAGE EST OBSERVÉ** · C-011 fusionné *(2026-08-06)*

**Romain a fusionné les deux propositions** : #181 *(C-011)* puis #182 *(C-013)*.

### La preuve qui manquait, obtenue sur un déploiement **légitime**

Exécution **`31090376142`** sur `main`, **événement `push`** — donc, cette fois, `deploy` **n'était
pas neutralisé** :

| Travail | Résultat | Démarré | Fini |
|---|---|---|---|
| Vérifier la syntaxe des fichiers publiés | ✅ **success** | 09:44:42 | 09:44:46 |
| Publier sur GitHub Pages | ✅ **success** | **09:44:57** | 09:52:03 |

> ⭐ **`deploy` a démarré 11 secondes APRÈS la fin de `verifier`.** Il ne s'est pas lancé en
> parallèle : **il a attendu**. Le verrou `needs:` passe donc de *« prouvé par construction »* à
> **« observé »**.
>
> 🎯 **Et l'arbitrage de Romain est validé par le résultat** : refuser de provoquer une exécution du
> chemin de publication n'a rien coûté — **la preuve est arrivée seule, 90 secondes après la
> fusion**, sur un déploiement qui devait avoir lieu de toute façon.

### Vérification de bout en bout — le site, pas seulement le journal

| Contrôle | Résultat |
|---|---|
| `js/commun.js` servi par GitHub Pages | **HTTP 200**, 17 054 octets |
| Le fichier réellement en ligne passe `node --check` | ✅ **oui** |
| Trace de la faute volontaire dans le fichier en ligne | ✅ **aucune** |
| Page publique `tournoi.html` | **HTTP 200** |

### 🏁 C-013 est TERMINÉ

| | |
|---|---|
| **CORRIGÉ** | ✅ oui |
| **Contrôle de syntaxe** | ✅ **PROUVÉ** |
| **Chaînage `needs`** | ✅ **OBSERVÉ** |

**R-043 moitié (a) : refermée.** ⚠️ La moitié **(b)** — un vrai harnais de tests du navigateur —
**reste entière** et hors périmètre. **R-049** et **R-050** sont couverts par la documentation.

### ⚠️ C-011, lui, n'est PAS terminé

La PR #181 est fusionnée, `backend/Tests.gs` fait bien **3859 lignes** sur `main`, et
`docs/deploiement.md` annonce **616**. **Mais rien n'a encore tourné chez Google.**

> **R-041 reste `CORRIGÉ`, pas `TESTÉ`.** Il faut coller `Tests.gs` dans Apps Script et lancer
> `lancerTestsFFR`. C'est **exactement la règle qui a coûté M-04** : un compte de tests ne dit pas
> quelle version a été exécutée.

---

## 🏁 C-011 et C-013 — **définitivement clôturés** *(2026-08-06)*

**Confirmation de Romain**, preuve Apps Script à l'appui :

```
R92 — 616/616 OK, 0 FAIL
```

| Chantier | Statut final | Ce qui le prouve |
|---|---|---|
| **C-011** | 🏁 **TESTÉ — CLÔTURÉ** | Le bilan ci-dessus, obtenu **chez Google**. **R-041 : `CORRIGÉ` → `TESTÉ`** |
| **C-013** | 🏁 **TESTÉ — CLÔTURÉ** | Contrôle de syntaxe **PROUVÉ** · chaînage `verifier → deploy` **OBSERVÉ sur un vrai envoi sur `main`** · **publication réussie** · **site vérifié après publication** |

> 🏉 **Deux P1 refermés — et pas une ligne du comportement de l'application n'a bougé.** L'un ajoute
> des tests, l'autre un garde-fou avant publication. Un bénévole ne verra aucune différence le jour
> J : c'était tout l'intérêt de l'ordre choisi par Romain, *« d'abord tout ce qui ne peut rien
> casser »*.

**Ce qui reste ouvert et qu'il ne faut pas confondre avec une victoire complète** :

- **R-043 moitié (b)** — un vrai **harnais de tests du navigateur** — **entière**, hors périmètre ;
- **R-041** protège les deux **règles** *(barème, départage)*, **pas la chaîne complète** du
  classement : `calculerClassement` lit le classeur et reste hors de portée du harnais (**R-046**).

**Reprise de l'ÉTAPE 4** : chantier suivant présenté à Romain — **C-005**, les trois textes
d'information.

---

## 🏁 C-005 et C-006 — clôturés côté travail documentaire *(2026-08-06)*

| Chantier | Livrable | Statut |
|---|---|---|
| **C-005** | `docs/textes-information-donnees.md` | 🏁 **Travail documentaire terminé** — ⚠️ **R-028 reste OUVERT** : rien n'est en ligne |
| **C-006** | `docs/conservation-donnees.md` | 🏁 **Travail documentaire terminé** — ⚠️ **R-030, R-031 et R-033 restent OUVERTS** : ils dépendent d'un changement de comportement |

> ✅ **Validation de Romain, mot pour mot** : *« Tu peux donc clôturer C-006 côté travail
> documentaire et mettre à jour le suivi **sans fermer les problèmes du registre qui dépendent
> encore d'un changement de comportement**. »*

### ⛔ Les deux constats à conserver pour les futurs chantiers de code

**Demande expresse de Romain.** Ils sont inscrits en tête de la fiche C-006 et dans le registre :

1. **La réinitialisation n'efface PAS les contacts de la demande fédérale** — représentant,
   président, **médecin**, secours. **La règle décidée (D-020) et le code divergent.** C'est le
   geste le plus facile à oublier, parce que la réinitialisation donne le sentiment que tout est
   fait ;
2. **`detail_effectifs` et `nb_educateurs_total` ne sont effacés par RIEN** : ni la réinitialisation
   *(ils ne figurent dans aucune des huit colonnes remises à zéro)*, ni aucun écran *(l'édition
   d'une fiche ne touche que quatre colonnes)*. Et ils sont **lus** par le calcul des effectifs —
   d'où le refus d'inventer un vidage manuel.

### ⚠️ Une lacune de MON plan, découverte en clôturant

Le tableau de couverture *(`PLAN.md` §12)* dit que **R-030, R-031 et R-033 sont « placés » dans
C-006**. **C'est vrai pour la documentation, et faux pour la correction** : C-006 est un chantier
sans code, et ces trois-là demandent un changement de comportement.

> **Il manque donc une fiche** — celle du chantier de code qui corrigera l'effacement.
> **Signalé à Romain, pas créé d'office** : ajouter un chantier au plan est une décision qui lui
> appartient.

---

## ÉTAPE 4 — **C-007 présenté à la validation** *(2026-08-09)*

**Objectif de la séance** : reprendre l'ÉTAPE 4 là où elle s'était arrêtée, c'est-à-dire présenter à
Romain le **chantier suivant dans l'ordre qu'il a retenu** — *« d'abord ce qui ne peut rien
casser »*. Après C-011, C-013, C-005 et C-006, c'est **C-007**.

### 0. Mise à jour avant lecture

`git fetch origin` puis `git status -sb` : la branche de travail est **exactement au niveau de
`origin/main`**, 0 commit d'écart. *(Le `main` local, lui, est en retard — mais on ne travaille pas
dessus.)*

### 1. Un retard de `ETAT.md` corrigé

`ETAT.md` n'avait **pas** été mis à jour par le dernier commit `d665575` : il annonçait encore
*« chantier présenté ensuite : C-005 »* et ne mentionnait ni la clôture de C-005, ni celle de C-006.
**Corrigé** — avec, inscrits noir sur blanc, les problèmes qui **restent ouverts** *(R-028, R-030
part outillage, R-031, R-033)* et les **deux constats à conserver** pour les futurs chantiers de
code.

### 2. Deux cellules de tableau en trop dans `RISQUES.md`

Les lignes **R-031** et **R-033** portaient leur dernière colonne **en double**
(`| AUDIT.md §B.5 | AUDIT.md §B.5 |`), ce qui décale la lecture du tableau. **Corrigé.** Sans
conséquence sur le fond.

### 3. 🎯 Le vrai travail : **les chiffres de C-007 ont été recomptés dans le code d'aujourd'hui**

> 📌 *Note du 2026-08-09 : cette séance avait été datée par erreur du 2026-08-08. Corrigé.*

C'est le point qui compte. La fiche C-007 s'appuie sur des chiffres relevés en **session 11**, et
**M-05** dit que l'application bouge pendant qu'on l'audite. Un chantier dont tout l'objet est de
*« ne pas mentir »* ne pouvait pas être présenté sur des chiffres non revérifiés.

**Résultat : les sept chiffres tiennent.** Le détail, et surtout **la méthode de comptage de
chacun**, sont désormais dans la fiche `PLAN.md` C-007 — pas dans ce journal, pour qu'ils soient là
où on ira les chercher.

En résumé : **65 actions du serveur, 21 documentées** *(44 absentes, 67,7 %)* · **8 pages,
4 documentées** *(tout le parcours d'invitation des clubs est absent)* · **26 fichiers JS, 6 cités**
· **4 bibliothèques extérieures, ~737 Ko, sans version ni origine**.

### 4. Trois précisions apportées par le recomptage

1. ✅ **Le reliquat de R-072 a rétréci** : `docs/deploiement.md` porte les **bons** nombres de
   contrôle — **616** et **3859** — remis d'aplomb par C-011. **§8 bis a fonctionné.** Reste le
   confort : `Tests.gs` absent de `passation.md`, `backend/README.md` et `README.md` ;
2. ⚠️ **Un chiffre de la session 11 n'a PAS été reconfirmé** : le *« jusqu'à 12 onglets »*.
   Le code en nomme **8** en clair. **La fiche n'écrit donc que 8** — on n'inscrit pas un chiffre
   qu'on n'a pas revu ;
3. ⚡ **Un constat trouvé au passage, et renvoyé ailleurs** : `frontend/README.md` écrit que
   `pizzip` + `docxtemplater` *(173 Ko)* sont conservés alors que *« plus rien ne les charge »*.
   Ce n'est pas de la documentation fausse, c'est du **code mort assumé** → **C-009**, pas ici.
   **Signalé, pas traité.**

### 5. Ce qui n'a **PAS** été fait

- ❌ **Aucune ligne de C-007 n'a été écrite.** C'est l'ÉTAPE 4 : on présente, Romain décide ;
- ❌ **La fiche manquante** *(le chantier de code qui corrigera l'effacement)* **n'a pas été créée** :
  ajouter un chantier au plan appartient à Romain ;
- ❌ **Aucun fichier de l'application touché.** Aucun redéploiement requis.

### 6. Prochaine session recommandée

**La décision de Romain sur C-007** — accepté, refusé ou réordonné. Puis, selon sa réponse, soit
l'exécution de C-007, soit la présentation du chantier suivant.

**Deux questions ouvertes l'accompagnent** : la fiche manquante du chantier d'effacement, et
**C-009**, qui ne peut pas être validé sans trancher d'abord *« supprimer ou brancher »* la colonne
`pause_echelonnee`.

---

## 🏁 C-007 — **LIVRÉ** : la carte du projet décrit enfin le projet *(2026-08-09)*

**Validation de Romain, périmètre complet** : les 65 actions, les 8 pages, les 26 fichiers
navigateur, les onglets, et les 4 bibliothèques avec nom, version, origine et date. Avec deux
consignes explicites, toutes deux tenues :

1. *« uniquement de la documentation, aucun fichier applicatif, aucun changement de comportement et
   aucun redéploiement Google »* ;
2. *« si une version ou une origine ne peut pas être établie avec certitude, écris « à confirmer »
   plutôt que de l'inventer »*.

### 1. Ce qui a été écrit

| Fichier | Ce qui a changé |
|---|---|
| `docs/architecture.md` | **Réécrit** — 140 → ~380 lignes. Les **65 actions** une par une, groupées en 11 familles *(A → K)*, chacune avec son **niveau d'accès** ; les **8 pages** ; les **26 fichiers JS** ; les **12 onglets** ; un schéma de ce qui se passe après une écriture ; et **§7 : la méthode de comptage de chaque chiffre** |
| `docs/dependances-externes.md` | **Créé** — les 4 bibliothèques : taille exacte, licence, date d'entrée *(retrouvée dans l'historique Git)*, page qui la charge, **empreinte SHA-256**, et la liste de ce qui a été cherché en vain pour établir les versions |
| `README.md` | « 5 onglets » → **12** · les **26 fichiers JS** listés au lieu de 6 · les 8 pages · `Tests.gs` ajouté · **une affirmation fausse corrigée** *(§3)* |
| `backend/README.md` | **Réécrit** — « un seul fichier » → **deux** · « 6 onglets » → **7 créés par `setupSheet()`, 12 en service** · les deux exceptions d'accès expliquées |
| `docs/passation.md` | `Tests.gs` ajouté au geste de re-déploiement — **reliquat de R-072 refermé** |

**Trois problèmes refermés** : **R-073** (P1), le **reliquat de R-072** (P1), **R-024** (P2).

### 2. La preuve — une vérification automatique, repassée APRÈS écriture

La fiche demandait : *« on recompte. Le compte doit tomber juste. »* Il tombe juste.

| Contrôle | Résultat |
|---|---|
| Les 65 actions du code sont-elles citées dans `architecture.md` ? | ✅ **65 / 65** |
| Les 26 fichiers JS, dans `README.md` ? | ✅ **26 / 26** |
| … et dans `architecture.md` ? | ✅ **26 / 26** |
| Les 8 pages ? | ✅ **8 / 8** |
| Les onglets ? | ✅ **12 / 12** — ⚠️ **ce contrôle avait d'abord conclu « 8 / 8 »** : le compte a été corrigé le jour même, voir l'entrée « passe de nettoyage » plus bas |
| Les 4 bibliothèques inventoriées ? | ✅ **4 / 4** |
| Les comptes de lignes cités concordent-ils avec `wc -l` ? | ✅ **tous** |
| Les empreintes SHA-256 concordent-elles avec les fichiers ? | ✅ **4 / 4** |

**Et un contrôle croisé, par deux chemins indépendants** : la somme des 11 familles
*(12+4+5+4+5+5+1+8+15+5+1)* et la somme des 4 niveaux d'accès *(13+4+1+47)* tombent toutes deux
sur **65**. Un seul chemin aurait pu se tromper deux fois de la même façon ; deux, beaucoup moins.

### 3. ⚡ Ce que le chantier a trouvé EN PLUS — et que l'audit n'avait pas vu

`README.md` annonçait que la mesure de visibilité des partenaires était **« 100 % locale (aucun
envoi, aucun cookie) »**. **Le code dit le contraire** : `sponsors.js` range un identifiant
d'appareil dans `localStorage` **et envoie** les relevés au serveur (action `mesureSponsors`).

**Il n'y a bien aucun cookie et aucun service extérieur — mais il y a un envoi.** Corrigé dans le
README, avec renvoi à **R-029**. C'est précisément le danger que ce chantier visait : **une carte
fausse est pire qu'une carte absente.**

### 4. Trois choix de méthode assumés

1. **Le « jusqu'à 12 onglets » de la session 11 n'a pas été repris.** Le code en nomme **8** en
   clair *(7 clés de `ENTETES` + `Config`)*. C'est **8** qui est écrit, avec la note expliquant que
   des onglets ajoutés à la main dans un classeur réel resteraient hors du code ;
2. **Le chiffre « ~1000-1300 spectateurs » a été RETIRÉ de `architecture.md`.** Il n'a aucune source
   et a déjà conduit un audit à une conclusion fausse *(M-06)*. Remplacé par ce qui est **mesuré**
   — 1,65 s par lecture, 1,59 s pour un `ping` vide, capacité estimée 150-300 — et par le renvoi
   explicite à la question ouverte **I-19**, qui appartient à Romain ;
3. **Les 170 Kio de `pizzip` + `docxtemplater` n'ont pas été supprimés.** Ils sont **constatés**
   comme non chargés, et renvoyés à **R-080**, dont la décision appartient à Romain. Ce chantier
   documente, il ne tranche pas.

### 5. Ce qui n'a **PAS** été fait

- ❌ **aucun fichier de l'application touché** — ni `.gs`, ni `.js`, ni `.html`, ni `.css` ;
- ❌ **aucun changement de comportement**, donc **aucun redéploiement Google requis** ;
- ❌ **aucune version de bibliothèque inventée** : les quatre restent « à confirmer », avec la
  méthode pour les établir un jour *(comparer l'empreinte SHA-256 d'une version officielle)* ;
- ❌ **la fiche manquante du chantier d'effacement (C-031) n'a toujours pas été créée** — c'est la
  décision de Romain, et il ne l'a pas prise.

### 6. Prochaine session recommandée

**L'ordre *« d'abord ce qui ne peut rien casser »* est épuisé** : C-011, C-013, C-005, C-006 et
C-007 sont tous livrés. La suite demande donc **une décision de Romain sur l'ordre**, et deux
questions restent en attente :

| Question | Pourquoi elle bloque |
|---|---|
| **C-031** — créer, ou non, la fiche du chantier d'effacement | R-030, R-031 et R-033 sont « placés » dans un chantier qui n'écrit que du texte |
| **C-009** — `pause_echelonnee` : supprimer ou brancher ? | Décision **métier**, personne ne peut la prendre à sa place |

Les candidats naturels pour la suite : **C-012** *(séparer le cœur de la saisie du score de son
écriture)*, protégé par les tests de C-011 ; ou **C-008** *(les commentaires qui disent le contraire
du code)*, encore très peu risqué.

---

## 🧹 C-007 — **passe de nettoyage demandée par Romain** *(2026-08-09)*

**Demande, mot pour mot** : *« une passe de nettoyage de C-007 : supprimer les anciennes
affirmations devenues fausses ou contradictoires ; conserver une seule version de chaque
information ; ne rien ajouter au périmètre. »*

### 1. ⚠️ Trois des quatre points signalés n'étaient PAS dans les fichiers

Romain relisait la **vue « diff » de GitHub**, qui affiche les lignes **supprimées** (en rouge)
au-dessus des lignes ajoutées. Les anciennes phrases y apparaissent donc encore, alors que le
fichier, lui, ne les contient plus. Vérifié un par un :

| Point signalé | État réel du fichier |
|---|---|
| `README.md` — « 5 onglets » toujours présent | ❌ **absent** — 0 occurrence |
| `backend/README.md` — « un seul fichier `Code.gs` » | ❌ **absent** — le fichier s'ouvre sur *« ce sont DEUX fichiers »* |
| `backend/README.md` — `setupSheet()` « 6 onglets » | ❌ **absent** |
| `README.md` — « mesure 100 % locale » | ✅ **VRAI** — la phrase subsistait, citée dans un encadré de correction |

### 2. Le vrai défaut, et il était réel : de l'**archéologie documentaire**

J'avais gardé, dans la documentation produit, des encadrés du type *« cette ligne annonçait X,
c'est faux »*. **Deux versions de la même information cohabitaient** — l'ancienne citée, la nouvelle
énoncée. Romain a raison : la documentation produit doit porter **l'état actuel**, un point c'est
tout. L'histoire appartient au suivi et à Git.

**Quatre encadrés supprimés**, remplacés par l'énoncé direct du fait :

| Fichier | Encadré retiré |
|---|---|
| `README.md` | la « correction » qui recitait *« mesure 100 % locale »* |
| `docs/architecture.md` | *« un chiffre a été retiré… il annonçait ~1000-1300 personnes »* |
| `docs/architecture.md` | *« un chiffre plus ancien n'a PAS été repris… jusqu'à 12 onglets »* |
| `docs/architecture.md` | *« le message n'est pas faux, il est partiel »* sur `setupSheet()` |

### 3. ⛔ Et le contrôle de cohérence a trouvé une ERREUR DE FOND : **12 onglets, pas 8**

C'est le point le plus important de cette passe.

**Mon compte était faux.** J'avais établi **8** en cherchant les `getSheetByName('…')` du serveur.
**La méthode était incomplète** : les **4 onglets de référence FFR** — `RefFFR_Formes`,
`RefFFR_Dates`, `RefFFR_Regles`, `RefFFR_Temps` — sont lus par `lireOngletSimple(classeur, '…')`,
sans jamais passer par `getSheetByName`.

> 🎯 **La note de la session 11 — « jusqu'à 12 onglets » — était JUSTE.** Je l'avais écartée en
> écrivant *« je n'écris que ce que j'ai vu »*. La prudence était bonne ; **la méthode qui l'a
> justifiée ne l'était pas.**

**Ce qui a rattrapé l'erreur n'est pas une relecture, c'est le contrôle croisé entre documents** :
`deploiement.md` documentait **déjà** ces 4 onglets, depuis toujours. Un document seul se relit
sans se contredire ; **c'est la confrontation de plusieurs documents qui fait apparaître le trou.**

⚡ **Et la leçon dépasse le chiffre** : une méthode de comptage **écrite** peut être prise en défaut
— c'est exactement ce qui vient de se passer, en quelques secondes. Une méthode **non écrite**, non.
C'est l'argument le plus fort en faveur du §7 de `architecture.md`.

**Corrigé dans 5 documents** : `architecture.md` *(schéma, §1 scindé en « 8 de travail » + « 4 de
référence », §7 avec la méthode juste)*, `README.md`, `backend/README.md`,
`structure-google-sheet.md` *(« 6 onglets » → 12)*, `guide-utilisateur.md` *(« 5 onglets » → 12)*.

### 4. Une seconde affirmation fausse trouvée, dans un autre fichier

`structure-google-sheet.md` écrivait que la mesure de visibilité *« ne passe PAS par le Sheet :
elle reste dans le navigateur du spectateur (aucun envoi) »*. **C'est la même erreur que celle du
README**, dans un fichier que C-007 n'avait pas ouvert. Corrigée : les relevés sont bien écrits dans
l'onglet `Mesures`.

### 5. ⛔ Ce que je n'ai PAS touché, et pourquoi

**`docs/relais-cdn.md` contient trois fois le chiffre « ~1300 spectateurs »** — le chiffre non
sourcé à l'origine de **M-06**. Je l'ai **laissé tel quel**.

**La raison** : dans `architecture.md`, ce chiffre était une phrase isolée, retirable sans rien
changer. Dans `relais-cdn.md`, il est le **fondement du raisonnement entier** du document — quand
allumer le relais, et à partir de quel volume. Le corriger, ce n'est pas nettoyer une contradiction :
c'est **refaire le raisonnement de capacité**, donc toucher à **R-061** et à la question ouverte
**I-19**. C'est un chantier, pas une passe de nettoyage. **Signalé à Romain, pas fait.**

### 6. Contrôle final — tout repassé après correction

| Contrôle | Résultat |
|---|---|
| Tournures d'archéologie restantes | ✅ **aucune** |
| Contradictions sur le nombre d'onglets | ✅ **aucune** — 12 partout |
| « aucun envoi » / « 100 % locale » | ✅ **aucune occurrence** |
| Les 65 actions citées dans `architecture.md` | ✅ **65 / 65** |
| Les **12** onglets cités | ✅ **12 / 12** |
| Les 26 fichiers JS cités dans `README.md` | ✅ **26 / 26** |
| Les 8 pages, les 4 bibliothèques | ✅ **8 / 8** · **4 / 4** |

### 7. Ce qui n'a pas bougé

**R-029, R-080, C-031 et C-009 : intacts**, comme demandé. Aucun fichier applicatif touché, aucun
nouveau chantier, aucune décision prise.

---

## 🔍 C-007 — **contrôle ciblé demandé par Romain : le compte des onglets** *(2026-08-09)*

**Romain avait raison, et j'avais tort de dire que tout était corrigé.**

À la passe de nettoyage précédente, j'avais annoncé le compte corrigé « partout ». **C'était faux** :
j'avais corrigé la **documentation produit** *(architecture, README, backend/README,
structure-google-sheet, guide-utilisateur)* et **oublié les documents de suivi**, où la fiche C-007
et le journal de livraison affirmaient encore **8**.

### 1. Le code, revérifié sans rien supposer

Les quatre sources réunies et dédupliquées :

| Source | Onglets trouvés |
|---|---|
| `getSheetByName('…')` | 8 |
| `lireOngletSimple(classeur, '…')` | 11 *(dont les 4 `RefFFR_*`)* |
| `creerOngletAvecEntetes(…)` | 7 |
| `insertSheet('…')` | 1 *(`Config`)* |
| **Total dédupliqué** | **12** ✅ |

### 2. Les 11 endroits qui affirmaient encore 8

| Fichier | Quoi |
|---|---|
| `PLAN.md` | le périmètre validé, le tableau des livrables ×2, *« 5 onglets » → 8*, *« 7 créés, 8 en service »* |
| `SESSIONS.md` | l'entrée de livraison : périmètre, tableau des livrables ×2, et — le plus gênant — **son tableau de preuve, qui annonçait « Les 8 onglets ? ✅ 8/8 »** |
| `SESSIONS.md` | une vieille entrée de la **session 2** : *« les colonnes des 8 onglets créés par le code »* — `ENTETES` en décrit **7** |
| `architecture.md` | *« un classeur peut tourner avec 8 onglets seulement »* — vrai mais ambigu, précisé en *« les 8 onglets de travail »* |

> ⚠️ **Le tableau de preuve était le pire des onze.** Un contrôle qui affiche « ✅ 8/8 » ne dit pas
> seulement un chiffre faux : il **certifie** un chiffre faux. C'est exactement ce que M-06
> décrit — un chiffre qui porte l'apparence de la vérification sans l'avoir.
>
> Il n'a pas été effacé : il porte désormais **12/12**, **et** la mention que ce contrôle avait
> d'abord conclu 8/8. Un résultat de contrôle qui a changé doit dire qu'il a changé.

### 3. La leçon, et elle est différente de la précédente

La fois d'avant, l'erreur était **une méthode de comptage incomplète**. Cette fois, la méthode était
bonne : **c'est la propagation de la correction qui a été incomplète**. J'ai corrigé là où je
regardais — les documents du produit — sans repasser sur les documents qui **parlaient** de cette
correction.

> 🎯 **Corriger un chiffre ne suffit pas : il faut corriger tout ce qui le cite.** Et la seule
> manière fiable de s'en assurer est de **chercher le chiffre faux dans tous les fichiers**, pas de
> se rappeler où on l'a écrit.

C'est ce qui a été fait cette fois : recherche de toute occurrence dans **les 11 fichiers de la PR**,
puis revue à l'œil de **chaque** compte restant pour distinguer les légitimes *(« 8 onglets de
travail », « 7 créés par `setupSheet()` », les citations des anciennes erreurs corrigées)* des
fautifs.

### 4. Contrôle final — tout recalculé depuis le code

| Contrôle | Résultat |
|---|---|
| 65 actions → `architecture.md` | ✅ **65 / 65** |
| **12 onglets** → `architecture.md` | ✅ **12 / 12** |
| 8 pages → `architecture.md` | ✅ **8 / 8** |
| 26 fichiers JS → `architecture.md` **et** `README.md` | ✅ **26 / 26** *(les deux)* |
| 4 bibliothèques → `dependances-externes.md` | ✅ **4 / 4** |
| Empreintes SHA-256 | ✅ **4 / 4** |
| Tournures d'archéologie | ✅ **aucune** |
| « aucun envoi » / « 100 % locale » | ✅ **aucune** |
| **Un total d'onglets ≠ 12, où que ce soit** | ✅ **aucun** |
| Fichiers applicatifs touchés | ✅ **aucun — que du `.md`** |

### 5. Ce qui n'a pas bougé

**R-029, R-080, C-031, C-009 : intacts.** `docs/relais-cdn.md` : **non touché**, hors périmètre par
décision de Romain. Aucun chantier lancé.

---

# 🏁 C-008 — **LIVRÉ** : les commentaires qui disaient le contraire du code *(2026-08-11)*

> **Objectif de la séance** : ÉTAPE 5 de **C-008** — réécrire les **6 commentaires** qui annoncent
> l'inverse de ce que fait le code, et **poser la règle** qui empêche le défaut de revenir.
>
> **Validation de Romain, mot pour mot** : *« Je valide C-008 dans le périmètre complet : les 6 cas,
> y compris les 3 cas SCF. »* — avec : aucune modification de comportement · **aucun redéploiement
> Apps Script** · PR obligatoire · vérification stricte qu'aucune ligne exécutable ne bouge ·
> chiffre 589 → 616 corrigé · **C-023 reste distinct et n'est pas anticipé**.

## 0. Mise à jour avant lecture — ⚠️ **et elle a servi**

`git fetch` + `git status -sb` → **`## main...origin/main [derrière 5]`**.

**La copie locale était en retard de 5 commits** : tout **C-007** manquait. `git status` seul aurait
répondu « propre » — c'est exactement le piège documenté en `CLAUDE.md` §12.3, et **il s'est
re-déclenché**. Mise à jour en **avance rapide** (aucune modification locale à préserver) **avant**
d'ouvrir le moindre fichier de suivi.

> 🎯 **Troisième déclenchement du même piège** *(sessions 6, 8, puis celle-ci)*. La règle a tenu :
> elle a été appliquée avant lecture, donc elle n'a rien coûté cette fois.

## 1. Les 6 cas, vérifiés dans le code avant d'être touchés

**Aucune affirmation de la fiche n'a été reprise telle quelle** — chaque ligne a été ouverte, et les
numéros de ligne avaient bougé depuis la session 12.

| # | Où | Ce qui était écrit | Vérification |
|---|---|---|---|
| 1 | `Code.gs:281` | *« ne consomment pas encore ces colonnes (prévu session 14) »* | ❌ Faux — `contexteScfCategorie` lu dans `calculerPlanning`, durée imposée par `dureeMatchScf` |
| 2 | `Code.gs:285` | *« Éligible si effectif **pair** ≥ 4 »* | ❌ Faux — le code teste `eqCat.length >= 4`, **sans parité** |
| 3 | `Code.gs:320` | *« doit répondre en quelques millisecondes »* | ❌ Faux — **1,65 s** mesuré *(I-18)* |
| 4 | `Code.gs:439` | *« répond en quelques millisecondes »* | ❌ Faux — idem |
| 5 | `Code.gs:7072` | *« socle multi-journées pas encore branché (prévu PR B/C) »* | ❌ Faux — `genererDimancheScf` existe, est routée **et a son bouton** |
| 6 | `admin-reglages.js:511` | *« ne fait que DÉCLARER le cadre […] informatif »* | ❌ Faux — les temps sont réellement appliqués |

**Une précision trouvée en vérifiant, et elle est entrée dans le commentaire** : `dureeMatchScf`
impose bien 2×15 / 2×11, **mais conserve `pause_mi_temps_min`**. Le nouveau commentaire le dit —
l'ancien laissait croire que la colonne n'était pas lue du tout.

**Le cas 2 avait déjà sa version vraie dans le même fichier**, 6 700 lignes plus bas
*(« éligible dès 4 équipes, les vagues inégales sont gérées par un bye »)*. **Celle-là n'a pas été
touchée** : c'est la fausse qui a été alignée sur elle.

## 2. La preuve qu'aucune ligne exécutable n'a bougé

C'était **la** condition posée par Romain. Trois contrôles, du plus faible au plus fort :

| Contrôle | Résultat |
|---|---|
| Syntaxe relue avant **et** après *(`node --check`)* | ✅ les 3 fichiers |
| **Chaque ligne du diff est-elle un commentaire ?** *(automatique)* | ✅ **oui, les 42** |
| ⭐ **Les fichiers, commentaires retirés, sont-ils identiques ?** | ✅ **`diff` VIDE** — 5 816 et 565 lignes de code, au caractère près |

> 🎯 **Le troisième contrôle est le seul qui prouve vraiment quelque chose.** Les deux premiers
> disent « je n'ai pas vu d'erreur » ; celui-ci dit **« le code est le même »**. C'est une preuve,
> pas une relecture.

> ⚠️ **Ce qui n'a PAS servi de preuve, et il faut le dire** : les **616 tests**. Ils tournent chez
> Google, on a décidé de ne pas redéployer — et surtout **ils ne peuvent rien prouver sur du
> texte**. La fiche les réclamait ; c'était une exigence mal calibrée, corrigée dans la fiche.

## 3. La règle posée — `CLAUDE.md` **§8 ter**

> *Une session qui branche ce qu'une session précédente annonçait « pas encore branché » efface la
> phrase DANS LE MÊME LOT.*

C'est le **pendant de §8 bis pour l'intérieur du code** : §8 bis protège la carte, §8 ter protège les
commentaires. La règle **dit aussi ce qu'elle ne demande pas** — sur les 48 occurrences de
*« pas encore »* du projet, **45 sont légitimes** et ne doivent pas être effacées.

**Balayage refait après correction** : plus **aucune** occurrence annonçant une version future du
code. *(La seule occurrence restante de « quelques millisecondes » est la phrase qui explique que ce
serait faux.)*

## 4. Ce qui a été signalé à Romain **sans être corrigé**

Conformément à sa consigne — *« si tu découvres un problème qui dépasse le périmètre, tu t'arrêtes
et tu me le signales au lieu de l'intégrer »* :

1. ⚠️ **Contradiction entre deux fiches du plan** — C-008 disait *« Dépendances : aucune »*, C-023
   disait *« à faire avec la part SCF de C-008 : même endroit, même lot »*. **Tranché par Romain
   avant le début** : les 6 cas ici, C-023 distinct ;
2. ⚠️ **`Code.gs:283-285` décrit la colonne `pause_echelonnee` par catégorie comme active** — or
   **rien ne la lit** *(c'est **R-084**, chantier **C-009**)*. **Seule la parité a été corrigée** ;
   la formulation retenue ne dit rien de plus sur l'activité de la colonne, pour ne pas empiéter ;
3. ⚠️ **`Code.gs:320` parle de *« milliers de spectateurs »*** — or **I-18** donne une capacité de
   **150 à 300**, et **I-19** *(combien de spectateurs viennent vraiment ?)* **n'est pas tranchée**.
   La phrase a été **conservée mot pour mot** : hors périmètre de R-083 ;
4. 🚨 **UN SUJET NOUVEAU, trouvé en vérifiant ma propre rédaction — voir §5.**

## 5. 🚨 Un sujet à ouvrir : **pause échelonnée + Super Challenge se marchent dessus**

**Comment il a été trouvé** : j'allais écrire *« duree_mi_temps_min est ignorée tant que
contexte_tournoi = SCF »*. Avant de l'écrire, j'ai listé **tous** les appels à `dureeMatch` et
`dureeMatchScf` — pour ne pas remplacer un commentaire faux par un autre. **C'est là que le cas est
apparu.**

**Ce qui a été CONSTATÉ dans le code** *(pas déduit)* :

- dans `calculerPlanning`, étape « 1) Poules + affectation », la branche `if (echGlobal)` marque la
  catégorie `echelonneParCat` puis fait `return` — **avant** le regroupement Super Challenge
  *(triangulaires/quadrangulaires)* qui vient plus bas ;
- **il n'y a aucune garde `estScf` avant cette branche** *(les gardes `estScf` du fichier sont
  ailleurs : `genererApresMidi`, et deux autres fonctions)* ;
- la planification échelonnée utilise **`dureeMatch(cat)`** — donc `duree_mi_temps_min` — et
  **jamais `dureeMatchScf`**.

**Ce que ça donnerait, si les deux réglages sont actifs en même temps** : une catégorie U14 en Super
Challenge, avec la pause échelonnée **globale** cochée et **≥ 4 équipes**, serait planifiée en
round-robin échelonné — **ni triangulaires, ni 2×15/2×11**, alors que l'écran d'administration
annonce ces temps.

| | |
|---|---|
| **Statut** | 🔶 **PROBABLE** — lu dans le code, **jamais exécuté ni testé**. Il faut le vérifier avant d'en faire un problème |
| **Déclencheur** | Les **deux** réglages actifs ensemble. Ni l'un ni l'autre n'est le cas courant |
| **Ce qui a été fait** | ✅ **Rien** — c'est un **changement de comportement**, hors périmètre de C-008 |
| **Ce qui a été fait à la place** | La phrase du commentaire a été **rendue prudente** : *« Là où `dureeMatchScf` s'applique, duree_mi_temps_min n'est PAS lue »* — vrai, et qui **n'affirme rien** sur le cas échelonné |

> 🎯 **C'est la règle de travail de Romain qui a fonctionné** : *« si tu découvres un problème qui
> nécessite un chantier distinct, arrête-toi sur ce point et inscris-le comme sujet séparé. »*
> **Décision à prendre par Romain** : ouvrir un problème au registre *(il toucherait **C-004**, la
> pause échelonnée, et **C-023**, le Super Challenge)* — ou constater qu'il ne se produira jamais.

## 6. Ce qui n'a **PAS** été fait

- ❌ **Aucun redéploiement Apps Script** — décision de Romain. ⚠️ **Conséquence à retenir : le code
  lu dans l'éditeur Google garde les anciennes phrases** jusqu'au prochain redéploiement utile ;
- ❌ **Aucune ligne exécutable modifiée** — prouvé, §2 ;
- ❌ **C-023 non anticipé**, `Code.gs:7002` non touché, R-084 non traité ;
- ❌ **aucun chantier suivant lancé** ;
- ❌ **le sujet du §5 n'a PAS été corrigé** — signalé, pas intégré.

---

# 📐 C-012 — **OUVERT, CARTOGRAPHIÉ, SPÉCIFIÉ ET VALIDÉ** *(2026-08-16)*

> **Trois sessions en une journée**, et il faut les distinguer pour comprendre la suite :
> **(1)** un démarrage qui s'est arrêté net · **(2)** la spécification écrite depuis le code réel ·
> **(3)** la validation des quatre décisions par Romain.
>
> ⚠️ **Aucune ligne de code n'a été écrite. C-012 n'est PAS implémenté.**

## 0. ⚠️ Le démarrage : trois sessions annoncées qui n'existaient pas

Romain a demandé de *« reprendre C-012 après une interruption »* et de relire *« le compte rendu de
C-012 Session 3 »*.

**Les six vérifications Git ont été faites d'abord** — `main` propre, à jour, `4af5003`, C-008 bien
fusionné. Puis la recherche : **aucune branche, aucun commit, aucun fichier, aucune ligne de
`SESSIONS.md` ne portait la moindre trace de C-012.** Son statut dans `PLAN.md` était encore
`PLANIFIÉ`, sa validation **jamais demandée**.

**Ce qui a été fait** : ❌ **rien inventé**. La session s'est arrêtée pour poser la question.

> 🎯 **La leçon, et elle vaut plus que la session perdue** : soit trois sessions de travail se sont
> évaporées **faute d'avoir été écrites dans `docs/industrialisation/` au fil de l'eau**, soit il y
> avait confusion avec le chantier FFR *(qui a sa propre numérotation et a lui aussi touché la
> saisie du score, en « session 12 » et « session 13 »)*. **C'est exactement le cas que §12.1 du
> cadre prévoit** : *la conversation n'est jamais la mémoire du projet.*
>
> **Réponse de Romain** : *« le dépôt ne contient aucune trace exploitable des prétendues Sessions 1
> à 3 de C-012. Nous ne devons rien inventer. »* → **repartir proprement.**

## 1. Ouverture officielle du chantier

**Validation de Romain, mot pour mot** : *« Je valide officiellement l'ouverture du chantier C-012.
Cette validation signifie uniquement que le chantier peut maintenant être étudié et spécifié. Elle
n'autorise PAS encore la modification du code applicatif. »*

## 2. Ce que la cartographie du code réel a établi

**Lu ligne à ligne** : `enregistrerScore`, **`backend/Code.gs` 5548 → 5658 (111 lignes)**, plus ses
9 fonctions appelées, plus ses **deux** appelants *(`doPost` et l'écran de saisie)*, plus le
recensement dans **tout le dépôt** de qui appelle quoi.

**Cinq comportements fins ont été trouvés, qui ne se voient pas à la lecture rapide** :

| # | Le comportement | Pourquoi il compte |
|---|---|---|
| 1 | Les scores sont validés **AVANT** que le match soit cherché | l'ordre porte du sens |
| 2 | ⚠️ **Une fonctionnalité cachée en dépend** : `api.js:177` vérifie la clé « scores » en envoyant un **vrai** enregistrement avec l'identifiant bidon `__verif_cle__` | le casser = **plus personne ne peut se connecter à l'écran de saisie** |
| 3 | La lecture du match suivant est **paresseuse** *(cas ④ seulement)* | elle a lieu **sous le verrou d'écriture** : la rendre systématique ralentirait chaque saisie |
| 4 | `vainqueur` est renvoyé même hors Coupe, mais **jamais écrit** | à préserver tel quel |
| 5 | Archivage et propagation sont sous `try/catch` : ils **ne bloquent jamais** la saisie | délibéré, et bien : le geste du bénévole passe avant le journal de saison |

> ⭐ **Le n° 2 est la vraie trouvaille de la cartographie.** Personne ne l'aurait deviné en lisant
> `enregistrerScore` seule : c'est le **frontend** qui s'en sert. Sans ce recensement des appelants,
> un déménagement « propre » aurait pu casser la connexion à l'écran de saisie **sans qu'aucun test
> ne le voie**.

## 3. La conception retenue : **deux cœurs, pas un**

`litSaisieScore` *(ce que le bénévole a envoyé est-il lisible ?)* → puis l'I/O lit le match → puis
`deciderEnregistrementScore` *(les six garde-fous)* → qui rend **un refus motivé, ou un plan
d'écriture**. Plus un prédicat pur `cascadeAVerifier`.

**Pourquoi deux et pas un — c'est la raison d'être du découpage** : un cœur unique obligerait à lire
le match **avant** de valider les scores, donc à déclencher la migration des colonnes même sur un
score invalide. **Minuscule, inoffensif — et quand même un changement de comportement.** Deux cœurs
le rendent impossible.

**La correction en cascade est résolue sans donner au cœur accès au classeur** : on ne lui fait pas
chercher le match suivant, **on le lui apporte** — et seulement quand `cascadeAVerifier` dit que ça
vaut la lecture.

## 4. Les quatre décisions de Romain — et **pourquoi** elles ont été prises

| # | Décision | Le raisonnement de Romain |
|---|---|---|
| **D-C012-1** | ✅ **OPTION A** — la propagation reste **hors** du cœur | *« C-012 doit isoler les décisions métier nécessaires à la validation du score, mais ne doit pas transformer la mécanique du bracket en nouveau moteur métier. »* → fidèle au plan : **déménagement, pas réécriture** |
| **D-C012-2** | ✅ **Problème distinct → R-092, NON corrigé** | *« Inscris-le avec les preuves disponibles ; statut indiquant clairement qu'il est découvert mais non corrigé ; ne modifie aucun code. Si le registre ne permet pas de lui attribuer proprement une priorité sans analyse supplémentaire, indique-le au lieu d'inventer. »* |
| **D-C012-3** | ✅ **Comportement actuel conservé** *(détail partiel ⇒ l'autre côté à 0)* | *« C-012 ne change aucune règle. Ne transforme pas cela en nouvelle validation métier. »* |
| **D-C012-4** | ✅ **17 tests** *(au lieu des 8 annoncés)* | *« Ils doivent être conservés dans la spécification comme filet de non-régression prévu pour C-012. »* |

> 🧠 **Le fil commun aux quatre, et il mérite d'être nommé** : **trois d'entre elles disent « ne
> change rien »**, et la quatrième dit **« prouve-le mieux »**. C'est la définition même d'un
> déménagement réussi. Un chantier qui aurait, au passage, corrigé R-092 et durci le détail partiel
> aurait été *« meilleur »* en apparence — et **aurait rendu impossible de prouver que rien n'avait
> changé**. C'est la leçon de C-008, appliquée avant d'écrire une ligne.

## 5. ⚡ R-092 — le problème trouvé en chemin

**Le détail du score n'est effacé nulle part.** Les 8 colonnes `essais_*`, `transfo_*`, `pen_*`,
`drop_*` sont écrites en mode détaillé, mais **aucune ligne ne les remet à vide** : ni une correction
repassée en mode simple *(5625, `if (modeDetail)` sans `else`)*, ni une réinitialisation en cascade
*(`invaliderMatchAval`, 5816)*, ni la remise à zéro de la petite finale *(5800)*.

**Deux consommateurs les relisent** : l'écran de saisie **pré-remplit ses compteurs depuis ces
colonnes** *(`blocSaisieDetail`, `saisie.js:465`)*, et l'alerte des 5 essais leur fait confiance **en
priorité** *(`essaisConnusEquipe`, `Code.gs:1453`)*.

### ⚠️ Sa priorité n'a **pas** été fixée — et c'est volontaire

**Elle ne peut pas l'être depuis le dépôt.** Le scénario grave suppose une catégorie **à la fois** en
mode détaillé *(tir au but)* **et** dans un **tableau de Coupe**. Or `RefFFR_Regles.tir_au_but` vit
**dans le classeur Google, pas dans le dépôt** *(cadre §13.6)*.

- combinaison **impossible** → **P2** *(chiffres morts + alerte informative faussée ; le classement
  n'est pas touché, il lit `score_A`/`score_B` qui sont bien écrasés)* ;
- combinaison **possible** → **P1 à instruire** *(un bénévole pourrait valider un score pré-rempli
  qui n'est plus le sien)*.

➡️ **Une seule vérification tranche** : une catégorie `tir_au_but = OUI` peut-elle recevoir le format
**COUPE_PLATEAU** ? **Statut en attendant : À CONFIRMER.**

> 🎯 **C'est la consigne de Romain qui a produit ce résultat** — *« indique-le au lieu d'inventer »*.
> Sans elle, la ligne aurait reçu un **P2** confortable et faux.

## 6. Fichiers touchés — et **rien d'autre**

| Fichier | Ce qui a changé |
|---|---|
| `docs/industrialisation/C-012-SPECIFICATION.md` | **créé** *(session 2)*, puis **les 4 décisions y sont inscrites comme tranchées** *(session 3)* |
| `docs/industrialisation/RISQUES.md` | ⚡ **R-092 inscrit** — IDENTIFIÉ, **NON CORRIGÉ**, priorité **À CONFIRMER** · ligne « Dernière mise à jour » |
| `docs/industrialisation/SESSIONS.md` | la présente entrée |

## 7. Ce qui n'a **PAS** été fait

- ❌ **aucun fichier applicatif modifié** — `backend/`, `frontend/`, `.github/` : `git diff` **vide** ;
- ❌ **aucun test modifié** — `backend/Tests.gs` intact, toujours **616 tests** ;
- ❌ **aucune fonction créée**, aucune règle métier ajoutée ou changée ;
- ❌ **R-092 non corrigé** — signalé, inscrit, **pas touché** ;
- ❌ **aucune PR d'implémentation**, aucune branche ;
- ❌ **aucun autre chantier ouvert** ;
- ❌ **aucun redéploiement Apps Script** — il n'y avait rien à déployer.

## 8. Statut à la fin de la journée

| | |
|---|---|
| **C-012** | ✅ **OUVERT** *(2026-08-16)* · ✅ **SPÉCIFIÉ** · ✅ **VALIDÉ (conception)** · ⏳ **implémentation NON commencée, NON autorisée** |
| **R-042** | **IDENTIFIÉ** — inchangé. Il ne bougera qu'avec les tests de l'étape 3 |
| **R-092** | 🔴 **IDENTIFIÉ — NON CORRIGÉ** · priorité **À CONFIRMER** |
| **Prochaine étape** | **étape 1 du §10** de la spécification — extraire `litSaisieScore` + tests **T-1 à T-5**. ⛔ **Attend une autorisation explicite de Romain.** |

---

# 🚧 C-012 — **CONCEPTION VALIDÉE, ÉTAPES 1 ET 2 FUSIONNÉES** *(2026-08-16)*

> ⚠️ **C-012 n'est PAS terminé, et R-042 reste OUVERT.** Cette entrée couvre **une journée** et
> **six sessions** : le démarrage arrêté, la spécification, sa validation, l'étape 1, l'étape 2, et
> les vérifications post-fusion de chacune.
>
> **Ce qui a été livré** : la **lecture de la saisie** et la **condition de la cascade** sont sorties
> dans deux fonctions pures et testées. **Les six garde-fous, eux, sont toujours dans le code qui
> lit le classeur** — c'est l'objet de l'**étape 3**, non commencée.

## 1. Le fil de la journée

| # | Ce qui s'est passé | Résultat |
|---|---|---|
| **0** | Romain demande de *« reprendre C-012 »* et de relire *« le compte rendu de la Session 3 »* | ⛔ **Arrêt** : aucune trace de C-012 nulle part |
| **1** | Ouverture officielle du chantier, et **cartographie du code réel** | `C-012-SPECIFICATION.md` écrite |
| **2** | Les **4 décisions** ouvertes sont tranchées par Romain | **PR #186 fusionnée** |
| **3** | **Étape 1** — `litSaisieScore` + T-1 à T-5 | **PR #187 fusionnée** · `649/649` |
| **4** | **Étape 2** — `cascadeAVerifier` + T-14 | **PR #188 fusionnée** · `661/661` |
| **5** | Vérification post-fusion après chacune | ✅ conformes |

## 2. ⚠️ Le démarrage : trois sessions annoncées qui n'existaient pas

Romain demandait de reprendre à *« C-012 Session 3 »*. Les six vérifications Git ont été faites
d'abord — puis la recherche : **aucune branche, aucun commit, aucun fichier, aucune ligne de ce
journal ne portait la moindre trace de C-012.** Son statut dans `PLAN.md` était encore `PLANIFIÉ`,
sa validation **jamais demandée**.

**Rien n'a été inventé.** La session s'est arrêtée pour poser la question.

> **Réponse de Romain** : *« le dépôt ne contient aucune trace exploitable des prétendues Sessions 1
> à 3 de C-012. Nous ne devons rien inventer. »* → **on repart proprement.**
>
> 🎯 **C'est §12.1 du cadre en action** : *la conversation n'est jamais la mémoire du projet.*

## 3. La conception — et ce que la cartographie a trouvé

**Lu ligne à ligne** : les **111 lignes** de `enregistrerScore`, ses 9 fonctions appelées, et ses
**deux appelants**. Découpage retenu : **deux cœurs purs, pas un** — un cœur unique aurait obligé à
lire le match avant de valider les scores, donc à migrer les colonnes même sur un score invalide.
Minuscule, inoffensif, **et quand même un changement de comportement**.

> ⭐ **La trouvaille de la cartographie** : `frontend/js/api.js` vérifie la clé « scores » en
> envoyant **un vrai enregistrement** avec l'identifiant bidon `__verif_cle__`, et attend
> « Match introuvable » **sans aucune écriture**. Personne ne l'aurait deviné en lisant
> `enregistrerScore` seule. **Sans ce recensement des appelants, un déménagement « propre » aurait
> pu casser la connexion à l'écran de saisie sans qu'aucun test ne le voie.**

## 4. Les 4 décisions de Romain *(détail : `C-012-SPECIFICATION.md` §11)*

| # | Décision |
|---|---|
| **D-C012-1** | **Option A** — la propagation reste **hors** du cœur : *« ne pas transformer la mécanique du bracket en nouveau moteur métier »* |
| **D-C012-2** | Le détail du score jamais effacé devient **R-092** — inscrit, **NON corrigé** |
| **D-C012-3** | Détail partiel ⇒ l'autre côté à zéro : **comportement conservé** |
| **D-C012-4** | **17 tests** au lieu des 8 annoncés |

> 🧠 **Trois de ces quatre décisions disent « ne change rien », la quatrième dit « prouve-le
> mieux ».** C'est la définition d'un déménagement réussi. Un chantier qui aurait corrigé R-092 au
> passage aurait paru meilleur — et **aurait rendu impossible de prouver que rien n'avait changé.**

## 5. Étape 1 — `litSaisieScore` *(PR #187)*

`litSaisieScore(data)` : lit ce que le bénévole a envoyé, rend `{ error }` ou
`{ id, score_A, score_B, modeDetail, detA, detB }`.

**Preuve du déménagement** : sur les **5 170 lignes exécutables** de `Code.gs`, le diff en montre
**10** — celles de l'extraction. Et le bloc déplacé est **identique caractère pour caractère** sur
ses 20 lignes *(seuls s'ajoutent le `return` et l'accolade)*.

**33 vérifications** *(T-1 à T-5)* → **`R92 — 649/649 OK, 0 FAIL`**.

⚠️ **Un défaut introduit puis corrigé** : l'insertion avait laissé le commentaire d'en-tête de
`enregistrerScore` au-dessus de `litSaisieScore`, laissant `enregistrerScore` sans documentation —
**exactement ce que §8 ter interdit**. Repéré **à la relecture du diff**, corrigé, tout relancé.

## 6. Étape 2 — `cascadeAVerifier` *(PR #188)*

**Deux lignes exécutables touchées dans tout `Code.gs`** : la fonction ajoutée, et la condition du
garde-fou ④ remplacée par son appel.

> ⚡ **Ce qu'elle protège** : la lecture du match suivant coûte **un balayage complet de l'onglet
> `Matchs`**, **sous le verrou d'écriture** — donc pendant que les autres marqueurs attendent. Cette
> condition n'avait **aucun nom et aucun test** : la rendre systématique par mégarde aurait ralenti
> **chaque score saisi de la journée**, sans que rien ne le signale.

**12 vérifications** *(T-14)* → **`R92 — 661/661 OK, 0 FAIL`**. Le compte se referme :
**616 + 33 + 12 = 661**.

## 7. Les preuves, et elles vont plus loin que le harnais

Pour chaque étape, `enregistrerScore` a été exécutée **dans les deux versions** sur le **même faux
classeur**, en comparant **l'objet renvoyé**, **la suite exacte des opérations sur le classeur** et
**le nombre d'appels à `lireMatchParId`** :

> **22 cas identiques, 0 différent** — refus de saisie, sonde `__verif_cle__`, mode simple, mode
> détail, détail partiel, garde-fous ① ② ③ ④ *(cascade refusée **et** forcée)*, statut « terminé »
> en **é décomposé**, match introuvable, `vainqueur` hors Coupe.

**Et la lecture paresseuse, mesurée** — appels réels comptés **avant la première écriture**, pour ne
pas les confondre avec ceux de la propagation *(qui lit **après**)* :

| Situation | Avant | Après |
|---|---|---|
| Les 4 conditions réunies | **2** | **2** |
| Chacune des 4 manquant, une à une | **1** | **1** |

⚠️ **Une attente de ce test était fausse au premier essai, et elle n'a pas été masquée** : la 2ᵉ
lecture observée venait de la **propagation**, pas du garde-fou — **les deux versions donnaient le
même chiffre**. C'est la **mesure** qui a été corrigée, pas le code.

## 8. ⚠️ Deux erreurs de lecture, des deux côtés — et c'est instructif

| Qui | Quoi | Issue |
|---|---|---|
| **Moi** | J'ai annoncé `Tests.gs` à **4034 lignes** — une **estimation**, pas une mesure. Le réel est **4038** | Corrigé avant d'écrire le repère : écrire 4034 aurait mis un chiffre **faux** dans le document de déploiement |
| **Romain** | Deux « défauts » relevés dans le diff GitHub *(ancien prédicat conservé, deux générations de repères)* | **Aucun des deux n'existait** : le diff affiche les lignes supprimées **en rouge**. Vérifié dans le contenu réel, **rien n'a été modifié** |

> 🎯 **La leçon commune** : **un diff n'est pas un fichier.** Dans les deux cas, la vérification a
> porté sur le **contenu réel** — et dans les deux cas elle a évité une correction qui aurait cassé
> quelque chose. Appliquer le « correctif » du prédicat aurait **vidé `cascadeAVerifier` de sa
> substance**.

## 9. ⚡ R-092 — trouvé en chemin, **non corrigé**

**Le détail du score n'est effacé nulle part** : ni une correction repassée en mode simple, ni une
réinitialisation en cascade, ni la remise à zéro de la petite finale. Deux consommateurs relisent
ces colonnes — l'écran de saisie **pré-remplit ses compteurs** depuis elles, et l'alerte des 5
essais leur fait **confiance en priorité**.

**Sa priorité n'a pas été attribuée**, et c'est la consigne de Romain qui l'a voulu :
*« indique-le au lieu d'inventer »*. Le scénario grave suppose une catégorie **à la fois** en tir au
but **et** dans un tableau de Coupe — or `RefFFR_Regles.tir_au_but` vit **dans le classeur Google,
pas dans le dépôt**.

➡️ **Une seule question tranche** : une catégorie `tir_au_but = OUI` peut-elle recevoir le format
**COUPE_PLATEAU** ? **Tant qu'elle est sans réponse, R-092 reste `À CONFIRMER`.**

## 10. Ce qui n'a **PAS** été fait

- ❌ **Étape 3 non commencée** — `deciderEnregistrementScore` n'existe pas *(0 occurrence)*, et les
  **six garde-fous restent sans test** : **R-042 est toujours OUVERT** ;
- ❌ **aucun redéploiement Apps Script** — `661/661` vient d'une exécution **hors d'Apps Script** ;
  le comportement en production reste **INCONNU** *(cadre §13.6)* ;
- ❌ **la propagation n'a pas bougé** — `propagerVainqueurBracket`, `invaliderMatchAval`,
  `majPetiteFinale`, `vainqueurPerdantCoupe` : empreintes identiques ;
- ❌ **R-092 non corrigé** ;
- ❌ **les 12 vérifications manuelles du §8** de la spécification n'ont **pas** été faites —
  ⚠️ **V-10 *(la cascade)* est la seule preuve prévue** pour la partie que les tests ne couvrent pas.

## 11. État à la fin de la journée

| | |
|---|---|
| **`main`** | `ad2fb9f` — merge de la PR #188 |
| **Suite** | **`R92 — 661/661 OK, 0 FAIL`** *(616 + 33 + 12)*, `backend/Tests.gs` = **4 038 lignes** |
| **C-012** | 🚧 **EN COURS — 2 étapes sur 3** |
| **R-042** | ⛔ **OUVERT** — il ne se refermera qu'avec l'étape 3 |
| **R-092** | 🔴 **IDENTIFIÉ — NON CORRIGÉ**, priorité **À CONFIRMER** |
| **Prochaine étape** | **étape 3 du §10** — `deciderEnregistrementScore` et les 6 garde-fous. ⛔ **Attend une autorisation explicite de Romain.** |

---

# ⭐ C-012 — **ÉTAPE 3 FUSIONNÉE : les six garde-fous passent sous test** *(2026-08-17)*

> **C'est l'étape que tout le chantier visait.** Les étapes 1 et 2 avaient sorti ce qui *entoure*
> les décisions ; celle-ci sort **les décisions elles-mêmes**.
>
> ⛔ **Et pourtant C-012 n'est pas terminé, ni R-042 refermé** : rien n'a encore tourné chez Google.

## 1. Ce qui a été livré — **PR #189, fusionnée** *(`2a3477f`)*

`deciderEnregistrementScore(m, saisie, data, suivant)` : reçoit le match tel qu'il est et ce que le
bénévole a envoyé, rend **soit un refus motivé, soit un plan d'écriture**. Elle ne lit ni n'écrit
aucun classeur.

`enregistrerScore` devient de la plomberie — elle applique le plan, archive, propage, répond :

| | |
|---|---|
| **111 lignes** | au début du chantier |
| **97** | après l'étape 1 |
| **50** | aujourd'hui |

**11 tests, 42 vérifications** *(T-6 à T-13, T-15 à T-17)* → **`R92 — 703/703 OK, 0 FAIL`**.
Le compte se referme : **616 + 33 + 12 + 42 = 703**.

## 2. ⚡ Le point délicat : la conception validée était fausse sur un détail

La spécification *(§6.3)* prévoyait que la couche d'écriture lise le match suivant **avant**
d'appeler le cœur. **Mesuré avant d'écrire une ligne**, sur une maquette hors dépôt : cela ajoutait
**une lecture complète de l'onglet `Matchs`, sous le verrou d'écriture**, dans un cas réel et
atteignable — *corriger un match de Coupe vers une égalité sans désigner de vainqueur*. Le garde-fou
③ refuse, et ce refus ne payait **aucune** lecture jusque-là.

**Décision de Romain : préserver l'ordre.** Le cœur **réclame** donc le match suivant
*(`besoin_suivant`)*, la couche d'écriture lit, et rappelle. Le second appel réévalue ① ② ③ à
l'identique — fonction pure, mêmes entrées.

> 🎯 **Ce que ça illustre, et qui vaut au-delà de C-012** : la conception était bonne dans son
> principe et **fausse dans un détail que seule la mesure pouvait révéler**. La règle du chantier —
> *extraire sans changer le comportement* — a primé sur la lettre du document, et **c'est le
> document qui a été corrigé pour dire ce que le code fait** *(§6.3, puis §3.2, §3.4, §4.2, §4.3)*.

## 3. Les preuves

- **23 cas différentiels contre `de97cf0`, 0 différent** — objet renvoyé, **suite exacte des
  opérations sur le classeur** et **nombre d'appels à `lireMatchParId`** ;
- **lecture paresseuse : 7 situations, mêmes comptes avant et après** — 2 lectures quand les quatre
  conditions sont réunies, **1 seule partout ailleurs** ;
- **propagation intacte** : `propagerVainqueurBracket`, `invaliderMatchAval`, `majPetiteFinale`,
  `vainqueurPerdantCoupe` — empreintes identiques *(D-C012-1 option A respectée)*.

## 4. ⚠️ Deux erreurs de lecture, des deux côtés — et elles ont servi

| Qui | Quoi | Issue |
|---|---|---|
| **Moi** | L'extraction avait laissé **cinq variables mortes** dans `enregistrerScore` | Repérées par Romain à la relecture du diff, **confirmées par contre-vérification sur le contenu poussé**, retirées *(4ᵉ commit)* |
| **Nous deux** | La page GitHub de la PR affichait 3 commits au lieu de 4 | **Panne partielle de GitHub** *(GraphQL en 503, API REST et protocole Git corrects)* — vérifié par trois sources indépendantes. **Rien n'a été corrigé à tort** |

> 🎯 **La leçon commune** : **un diff n'est pas un fichier, et une page web n'est pas un dépôt.**
> Dans les deux cas, la vérification a porté sur le **contenu réel** — et dans les deux cas elle a
> évité une correction qui aurait cassé quelque chose.

## 5. Ce qui reste — et ce qui n'est **PAS** autorisé

| Étape | État |
|---|---|
| **4** — redéploiement chez Google *(`Code.gs` **ET** `Tests.gs`)* + `lancerTestsFFR` là-bas | ⏳ **À FAIRE — NON AUTORISÉE** |
| **5** — les **12 vérifications manuelles** du §8, **V-10 obligatoire** | ⏳ **À FAIRE** |
| **R-042** | ⛔ **OUVERT** — il ne passera à `TESTÉ` qu'après les étapes 4 et 5 |
| **R-092** | 🔴 **IDENTIFIÉ — NON CORRIGÉ**, priorité **À CONFIRMER** |

## 6. État à la fin de la journée

| | |
|---|---|
| **`main`** | `2a3477f` — merge de la PR #189 |
| **Suite** | **`R92 — 703/703 OK, 0 FAIL`**, `backend/Tests.gs` = **4 244 lignes** |
| **C-012** | 🚧 **EN COURS — les 3 étapes de code fusionnées, les étapes 4 et 5 restent** |
| **Prochaine étape** | **étape 4 du §10** — redéploiement chez Google. ⛔ **Attend une autorisation explicite de Romain.** |

---

# ⭐ C-012 — **ÉTAPE 4 : LE BACKEND EST REDÉPLOYÉ CHEZ GOOGLE** *(2026-08-18)*

> **Objectif unique de la session, et rien d'autre** : déployer chez Google exactement le `Code.gs`
> et le `Tests.gs` du `main` actuel, publier une **nouvelle version du MÊME déploiement**, exécuter
> `lancerTestsFFR` là-bas, et vérifier que l'adresse publique sert bien cette version.
>
> ⚠️ **L'étape 5 n'a PAS été commencée**, et **R-042 reste OUVERT**.

## 0. Mise à jour avant lecture (`CLAUDE.md` §12.3)

`git fetch origin` puis `git status -sb` → `## main...origin/main`, **aucun mot « retard »**, arbre
de travail **propre**. `main` local et `origin/main` sur le même commit **`2a49777`**.

## 1. L'audit préalable, en lecture seule — ce qu'il a établi

| Contrôle | Résultat |
|---|---|
| `backend/Code.gs` | **8 274 lignes** · SHA-256 `45727fe5…` |
| `backend/Tests.gs` | **4 244 lignes** · SHA-256 `f7ba5827…` |
| ⭐ **Les mêmes fichiers téléchargés depuis GitHub** *(`raw.githubusercontent.com`, branche `main`)* | **empreintes identiques** — copier depuis le disque ou depuis GitHub revient au même |
| Suite de tests **rejouée** hors d'Apps Script sur ces fichiers exacts | **`R92 — 703/703 OK, 0 FAIL`** |
| `?action=ping` **avant** intervention | déjà **OK** — sert de point de comparaison |

> 🎯 **Le chiffre de 703 n'a pas été recopié : il a été refait.** Le harnais a été relancé dans un
> bac à sable *(les fichiers réels du dépôt, doublures pour les services Google)*, **hors du dépôt**
> — aucun fichier du projet touché.

**Constat opérationnel** : `clasp` *(l'outil en ligne de commande de Google Apps Script)* **n'est ni
installé ni authentifié** sur cette machine, et le dépôt ne contient aucune configuration `clasp`.
⛔ **Le collage et la publication de version ne peuvent donc être faits qu'à la main, par Romain.**
La session s'est **arrêtée exactement avant** cette intervention, instructions à l'appui.

## 2. Ce que Romain a fait chez Google

1. collé `backend/Code.gs` dans **`Code.gs`** ;
2. collé `backend/Tests.gs` dans **`Test.gs`** *(au singulier chez Google — **le fichier qu'on
   oublie**, cf. `docs/deploiement.md`)* ;
3. **Déployer → Gérer les déploiements → crayon → Version : « Nouvelle version » → Déployer** —
   et **non** « Nouveau déploiement », qui aurait changé l'URL ;
4. exécuté **`lancerTestsFFR`**.

## 3. Les preuves — les cinq, telles qu'obtenues

| # | Preuve | Résultat | Constatée par |
|---|---|---|---|
| **1** | `lancerTestsFFR` **chez Google** | ⭐ **`R92 — 703/703 OK, 0 FAIL`** | **Romain**, éditeur Apps Script |
| **2** | **Dernière ligne de `Test.gs`** chez Google | **4244** | **Romain**, éditeur Apps Script |
| **3** | **Nouvelle version du MÊME déploiement** publiée | **OK** — URL publique inchangée | **Romain** |
| **4** | `…/exec?action=ping` | **OK** — `{"ok":true,"message":"API Tournoi R92 en ligne"}` | **appel réel, vérifié directement** |
| **5** | `…/exec?action=getConfig` | **OK** — **contenu réel du tournoi** renvoyé *(« CHALLENGE MARC CHEVALIER »)* | **appel réel, vérifié directement** |

> 🎯 **Pourquoi la preuve 5 a été ajoutée aux quatre attendues.** Un `ping` dit seulement *« le
> serveur est allumé »*. Le `getConfig` montre que l'adresse **lit le classeur et sert la donnée** —
> elle n'est pas en erreur silencieuse.
>
> ⭐ **Pourquoi 1 et 2 vont ensemble, toujours.** Le bilan dit *combien* de vérifications passent ;
> la dernière ligne dit **quel fichier** les a produites. Le 2026-08-04, un « 573/573 OK » **vrai**
> portait sur l'**ancien** fichier de tests — preuve fausse restée quatre jours au dossier
> *(**M-04**)*. Ici, le passage de **661 à 703** est la signature des 42 vérifications de l'étape 3.

## 4. Ce qui a été VÉRIFIÉ, et comment — la ligne de partage

- ✅ **CERTAIN, vérifié directement** : l'état du dépôt *(`2a49777`, propre, synchronisé)*, les
  empreintes des deux fichiers, l'égalité disque ↔ GitHub, `703/703` hors d'Apps Script, `ping`,
  `getConfig`.
- 🟠 **RAPPORTÉ PAR ROMAIN**, non vérifiable depuis le dépôt *(cadre §13.6)* : le `703/703` **chez
  Google**, la **dernière ligne 4244**, et le fait que la publication soit une **nouvelle version du
  même déploiement**. C'est la procédure normale du projet — c'est écrit ainsi plutôt que « vérifié ».
- ⛔ **NON VÉRIFIÉ** : **qu'une saisie de score fonctionne en vrai.** Les 703 tests prouvent que les
  six garde-fous **raisonnent** juste, **isolés** — ils ne touchent ni le classeur, ni l'écran de
  saisie, ni la cascade du tableau final.

## 5. Ce qui n'a **PAS** été fait

- ❌ **aucune des 12 vérifications manuelles V-1 à V-12** — l'étape 5 n'est **pas commencée**, et
  **pas autorisée** ;
- ❌ **aucun fichier de code modifié** — `git status` est resté vide pendant toute l'opération ;
- ❌ **`RISQUES.md` non touché**, sur consigne explicite : **R-042 reste OUVERT**, **R-092** reste
  **NON corrigé**, priorité **À CONFIRMER** ;
- ❌ **aucun déploiement supplémentaire**.

## 6. ⚡ Un effet de bord attendu : **C-008 est enfin parvenu chez Google**

`C-008` *(les 6 commentaires qui disaient le contraire du code, livrés le 2026-08-11)* était marqué
**« PAS redéployé chez Google — jusqu'au prochain redéploiement utile »**. ⭐ **Ce redéploiement
utile, c'est celui-ci** : recoller `Code.gs` a emporté les 6 commentaires réécrits. `ETAT.md` a été
réaligné en conséquence, dans le même lot *(règle **§8 ter**)*.

## 7. ⚠️ Une contradiction repérée à l'audit — et corrigée dans le MÊME lot

`PLAN.md` *(fiche **C-012**)* affichait encore, pour l'étape 4 : **« ⏳ À FAIRE — non autorisée »**,
et plus bas **« ⛔ Backend PAS redéployé »**. C'était devenu **faux**.

Le fichier n'était pas dans le périmètre initialement autorisé ; la contradiction a donc été
**signalée à Romain avant le commit**, qui a **étendu l'autorisation à `PLAN.md`**. **3 lignes**
corrigées, rien d'autre touché dans le fichier.

> 🎯 **Pourquoi ça comptait.** `PLAN.md` est le document qui répond à *« qu'est-ce qu'on corrige, et
> dans quel ordre ? »*. Y laisser « backend PAS redéployé » aurait fait exactement ce que la règle
> **§8 bis** cherche à empêcher : un écart qui se creuse **fonctionnalité après fonctionnalité**,
> sans que personne ne le décide.

## 8. État à la fin de la journée

| | |
|---|---|
| **`main`** | `2a49777` — inchangé par l'étape 4 *(aucun code modifié)* |
| **Suite** | ⭐ **`R92 — 703/703 OK, 0 FAIL` — obtenu CHEZ GOOGLE**, `Test.gs` = **4244** lignes |
| **Adresse publique** | ✅ **sert la nouvelle version** — même URL, `ping` et `getConfig` OK |
| **C-012** | 🚧 **EN COURS — 4 étapes sur 5** |
| **R-042** | ⛔ **OUVERT** — il ne passera à `TESTÉ` qu'après l'étape 5 |
| **R-092** | 🔴 **IDENTIFIÉ — NON CORRIGÉ**, priorité **À CONFIRMER** |
| **Prochaine étape** | **étape 5 du §10** — les **12 vérifications manuelles**, **V-10 obligatoire** *(la cascade du tableau final : la seule preuve prévue pour ce que les tests ne couvrent pas)*. ⛔ **Attend une autorisation explicite de Romain.** |

---

# 🚧 C-012 — **ÉTAPE 5 : LES VÉRIFICATIONS MANUELLES — 7 SUR 12** *(2026-08-18, soir)*

> **Objectif de la session** : exécuter les 12 vérifications manuelles du **§8** de
> `C-012-SPECIFICATION.md`, sur autorisation explicite de Romain.
> **Résultat** : **7 exécutées** — 6 réussies, 1 non concluante. **5 bloquées** faute de matière
> dans les données de test. ⛔ **L'étape 5 reste OUVERTE, et R-042 reste OUVERT.**

## 0. Mise à jour avant lecture (`CLAUDE.md` §12.3)

`git fetch origin` puis `git status -sb` : **`## main...origin/main`** — ni en avance ni en retard,
arbre de travail vide. **`HEAD` = `ffe4463`**, identique à `origin/main`. Vérifié **au début et à la
fin** de la session : **inchangé**.

## 1. L'audit préalable en lecture seule

Demandé par Romain avant toute action, et concordant sur les six points : `main` synchronisée ·
`ffe4463` · étapes 1 à 4 documentées comme terminées dans **quatre** documents sans contradiction ·
étape 5 « à faire / non autorisée » · **R-042 OUVERT** · **aucune** trace de travail d'étape 5.

Contrôles supplémentaires : les trois fonctions extraites existent bien dans `backend/Code.gs`
(`litSaisieScore` l. 5554, `cascadeAVerifier` l. 5596, `deciderEnregistrementScore` l. 5628), et
`backend/Tests.gs` fait **exactement 4 244 lignes** — ce qui concorde avec la seconde preuve de
l'étape 4.

> ⚠️ **Écart mineur signalé, non corrigé** : `RISQUES.md` affiche R-042 au statut `IDENTIFIÉ` alors
> que le chantier est **en cours**. C'est délibéré *(le fichier n'a pas été touché, sur consigne)*
> et le fond reste juste — R-042 **est** ouvert.

## 2. ⭐ L'environnement de test — et le piège qui a failli tout fausser

Romain a exigé que les vérifications se fassent sur une **copie de test**, jamais sur la production.

**Le piège** : le serveur n'ouvre pas « le classeur où il est rangé », il ouvre **un classeur désigné
par son identifiant** (`SHEET_ID_DEFAUT`, `backend/Code.gs:15`). **Copier le classeur ne suffit
donc pas** — le serveur aurait continué d'écrire en production.

**Et le piège s'est refermé une première fois.** Le projet Apps Script est **logé dans le classeur**
(`onOpen`, `Code.gs:2958` ; `docs/deploiement.md:19`) : copier le classeur a **copié le programme
avec lui**. Le premier réglage de `SHEET_ID` a été posé sur ce **sosie**, que rien n'appelle.

**Ce qui l'a révélé** : `?action=getConfig` renvoyait toujours `CHALLENGE MARC CHEVALIER`, **sans le
témoin**. Ce n'était pas un effet de cache — `getConfig` **n'est pas mis en cache** et ouvre le
classeur à chaque appel (`Code.gs:340`). L'empreinte de la réponse était **identique au bit près**.

> 🎯 **L'indice qui a tranché** : Romain avait constaté `SHEET_ID` **absente**. Or le projet de
> production contient forcément `CLE_ADMIN` et `CLE_SCORES`. Une liste de propriétés sans elles =
> **mauvais projet**. Vérification faite : c'était bien le cas.

**La chaîne de preuve du routage, par contraste :**

| Moment | `global.tournoi_nom` | Empreinte SHA-256 |
|---|---|---|
| **Avant bascule** | `CHALLENGE MARC CHEVALIER` | `6b9189c6e40f0cdc…` |
| Après bascule sur le **sosie** | `CHALLENGE MARC CHEVALIER` *(inchangé)* | `6b9189c6e40f0cdc…` — **identique** |
| ⭐ **Après bascule sur le bon projet** | ⭐ **`CHALLENGE MARC CHEVALIER — COPIE DE TEST`** | `0534a851d8357f59…` |

Contrôle complémentaire : sur les **21 réglages** de la configuration, **un seul** diffère entre la
production et la copie — `tournoi_nom`, le témoin lui-même. La copie est donc **fidèle**.

> 📌 **`SHEET_ID` n'existait PAS avant** dans le projet de production. La restaurer signifie
> **supprimer la ligne entière**, et non la vider ni y remettre l'identifiant de production.

## 3. Inventaire de la copie — ce qui a décidé du périmètre réel

Relevé **en lecture seule**, par `getMatchs`, `getEquipes`, `getPoules`, `getHistorique`,
`getCapacitesCategories` et `getConfig`. *(`getAll` a été volontairement écarté : c'est le seul
servi par un cache de secours de 6 h, il aurait pu montrer un reste de la production.)*

| Constat | Valeur | Conséquence |
|---|---|---|
| Matchs | **51**, tous en phase `poule` — 48 non joués | V-1, V-2, V-3, V-6, V-9, V-11, V-12 **possibles** |
| Catégories | **U8 et U10 seulement** — `tir_au_but: false` pour les deux | ⛔ **V-4 et V-5 impossibles** |
| Tableau final | **aucun** — `sous_tableau` vide sur les 51 matchs, `match_suivant` renseigné **0 fois** | ⛔ **V-7, V-8 et ⭐ V-10 impossibles** |

> ⚠️ **Obstacle à connaître pour la suite** : le seul format produisant un tableau à élimination est
> **`COUPE_PLATEAU`**, et il **n'est plus proposé par l'interface** — *« INTERDIT en EDR »*
> (`frontend/js/admin-reglages.js:442`). Le produire demanderait de l'écrire directement dans
> l'onglet `Config`. **Rien n'a été créé : le manque a été signalé, comme demandé.**

## 4. Les 7 vérifications exécutées

**Répartition des rôles** : Romain a fait **tous** les gestes exigeant la clé scores ou l'interface ;
Claude n'a fait que des **lectures** et les relevés avant/après. **Aucune clé n'a été saisie par
Claude.**

### ✅ V-1 — saisie ordinaire — **RÉUSSIE**

M001 *(U8, poule A, VERSAILLES-1 vs MEUDON)* saisi **12-7**. Observé à l'écran : `✔️ terminé`,
champs grisés, bouton devenu `CORRIGER`, message `Score enregistré ✓`, compteur passé de 28 à 27.
Vérifié dans le classeur : `score_A = 12`, `score_B = 7`, `statut = terminé`, `vainqueur` vide
*(correct hors Coupe)*, **les 8 colonnes de détail restées vides**, 51 lignes avant et après.
Classement recalculé : VERSAILLES-1 **3 pts (+5)**, MEUDON **1 pt (−5)**, les deux autres équipes
inchangées. Score servi par l'adresse publique.

> ⚠️ **Le délai d'apparition publique n'a PAS été chronométré** — relevé trop tardif. Consigné comme
> **non mesuré**, jamais reconstitué.

### ✅ V-2 — refus d'une revalidation — **RÉUSSIE** *(deux moitiés)*

La spécification attend **deux** choses. Elles ne s'obtiennent pas par le même chemin, et c'est un
constat de méthode utile pour la suite.

- **V-2a** — clic sur `CORRIGER` (M001) puis « Annuler » : la clé **est redemandée**, et le
  renoncement **n'écrit rien**. Vérifié exhaustivement : **aucun champ modifié** sur les 51 matchs
  *(27 colonnes × 51 lignes comparées)*, `Historique` **identique au caractère près**, classement
  **identique au bit près**.
- **V-2b** — validation depuis un **second onglet non rafraîchi** (M002) : le serveur refuse avec
  ⭐ **`Ce score est déjà validé (définitif). Utilise « Corriger » pour le modifier.`** — **identique
  au caractère près** au message de `backend/Code.gs:5643`, guillemets français compris.
  **Preuve complémentaire** : la tentative refusée portait un score **différent (8-6)**, et **aucune
  trace de 8-6** n'existe dans `Matchs`, dans `Historique` ni dans le classement.

> ⭐ **Parade du risque N-1 vérifiée en conditions réelles.** L'écran protège si bien en amont que le
> refus serveur n'est atteignable **que** par un écran périmé — soit le scénario réel du jour J :
> deux bénévoles, deux téléphones, le même match.

### ✅ V-3 — correction avec la clé — **RÉUSSIE**

M001 corrigé de **12-7** en **10-14**. **Seuls `score_A` et `score_B` ont changé** sur les 51 matchs.
Classement **réordonné**, conformément à la prédiction faite **avant** le geste : MEUDON **1 → 3 pts**
*(diff +4)*, VERSAILLES-1 **3 → 1 pt** *(diff −4)*, MASSY-1 prend la tête *(3 pts, +5)*. Le départage
se fait bien à la différence de points — constaté, non supposé.

**Délai public** : sonde de 27 interrogations, ancien score encore présent à **13:28:25**, nouveau à
**13:28:27**. Consigné comme **« quasi immédiat, apparition constatée à 13:28:27 »**, avec **l'heure
du clic non relevée** — le délai chiffré ne sera donc jamais établi pour V-3.

### ✅ V-6 — journal de saison — **RÉUSSIE**

Onglet `Historique`, **ligne 213** : `2026-08-18 | 2026-08-04 14:17:43 | M001 | U8 | poule |
VERSAILLES-1 | MEUDON | 10 | 14`. ⭐ **Le score est celui de la correction, et il n'existe qu'une
seule ligne M001 pour ce tournoi** : la correction a **réécrit la ligne**, pas ajouté une seconde.
**213 lignes avant et après la correction**, **0 doublon** `(tournoi_id, id_match)`.

> **Piège écarté** : cinq lignes portent `M001` dans l'onglet, mais elles appartiennent à **cinq
> tournois différents**. Ce n'est pas un doublon — l'identité d'une ligne est le **couple**
> `tournoi_id` + `id_match`.

### ✅ V-9 — la sonde de vérification de clé — **RÉUSSIE**

Tous les onglets fermés, page rouverte, clé saisie. **Aucune ligne `__verif_cle__`** dans `Matchs`
*(51 → 51, dernier identifiant `M051`, ligne 53 du Sheet vide — vérifié à l'écran par Romain)*,
**aucun champ modifié**, `Historique` **identique**.

> ⭐ **Parade du risque N-2 vérifiée.** La page teste la clé en **feignant** d'enregistrer un score
> sur un match inexistant (`frontend/js/api.js:175`). L'astuce ne tient que si le serveur vérifie
> l'existence du match **avant** toute écriture. **L'ordre des contrôles a survécu au déménagement
> de C-012.** Sans cela, chaque connexion de bénévole aurait laissé une ligne fantôme, toute la
> journée, sans que rien ne le signale.

### ✅ V-11 — migration douce des colonnes — **RÉUSSIE**

Les 8 colonnes de détail *(S à Z)* supprimées à la main dans la copie, puis M003 saisi **6-3**.
**Les 8 colonnes sont toutes revenues**, aux bons noms, et le total est à nouveau de **27 colonnes**.

⭐ **L'ordre a changé, et c'est normal** : `assurerColonnesMatchs` ajoute les colonnes manquantes
**à droite** (`Code.gs:6778`). `arbitre` remonte donc en 19ᵉ position, suivi de `essais_A` … `drop_B`.
**Le serveur retrouve ses colonnes par leur NOM, jamais par leur position** — ce changement d'ordre
avait été **annoncé avant le geste**, précisément pour qu'il ne soit pas pris pour une anomalie.

**Seconde moitié, aussi importante** : les 8 valeurs de détail de M003 sont restées **vides**. Une
saisie simple **recrée** les colonnes mais **ne les remplit pas**.

> ⭐ **Parade du risque N-4 vérifiée dans ses deux sens.**

### 🟠 V-12 — chronométrage — **NON CONCLUANTE**

**Trois validations** (M004, M005, M006) ont donné **7,079 s · 11,592 s · 9,216 s** *(médiane
9,216 s)*. **Une faute de méthode a été commise et elle est assumée** : Claude s'était abstenu de
toute lecture pendant ces saisies « pour ne pas ajouter de charge parasite », **supprimant du même
coup le témoin** qui aurait dit si la plateforme était lente au même moment.

**Un test complémentaire a donc été décidé**, avec des lectures témoins **contemporaines** :

| Élément | Valeur |
|---|---|
| Match | **M007** — U8, poule D, CLAMART-2 vs CHATENAY-MALABRY |
| ⚠️ Score saisi | **2-4** — le protocole prévoyait **8-4**. **Erreur de saisie**, confirmée par Romain. **Sans incidence** : la durée d'une validation ne dépend pas de la valeur du score |
| ⭐ **`doPost`** | **2026-08-18 à 14:30:30 — 7,099 s — Terminée** *(déploiement « Version 151 »)* |
| Lectures témoins | **1,6 à 4,8 s** ; médiane des 14 lectures suivantes : **2,218 s** *(repère historique : 2,07 s)* |

> **V-12 — NON CONCLUANTE.** La validation de M007 a duré **7,099 s**, au-dessus de l'enveloppe
> opérationnelle de **7 s** retenue comme critère de substitution *(D-C012-5)*. Les lectures `doGet`
> **contemporaines** sont restées **majoritairement dans leur plage habituelle**, sans signe de
> dégradation générale de la plateforme au même moment. **La cause de cette durée reste
> INDÉTERMINÉE**, et **la responsabilité de C-012 n'est pas établie**. L'absence de mesure homogène
> d'une validation **avant** C-012 demeure une **limite méthodologique définitive**.

**Cohérence horaire vérifiée** *(et ce n'est pas une contradiction)* : le `doPost` démarre à 14:30:30
et dure 7,099 s — fin à 14:30:37 — alors que la sonde voyait déjà `2-4` vers 14:30:36. Les cellules
sont écrites **tôt** dans l'exécution, avant la reconstruction de l'instantané et l'envoi au relais.

**Contexte statistique — faits nus, sans lien de cause :**

| Série | Valeurs |
|---|---|
| Validations réelles observées **sur le code actuel** | **4,408 · 4,667 · 4,968 · 5,243 · 6,887 · 7,099 s** |
| Série V-12 antérieure | **7,079 · 11,592 · 9,216 s** |
| Écart client / serveur sur **une** lecture | **17,027 s côté client** pour **≈ 2,145 s côté serveur** |

> ⚠️ **Ce dernier écart montre que le journal « Exécutions » sous-estime le temps réellement subi**
> *(il chronomètre à partir du début du travail serveur, pas de la réception de la requête)*. Il
> **ne doit pas** servir à expliquer les `doPost`, qui sont des durées de travail effectif.
>
> ⛔ **Aucune cause n'est désignée** — ni C-012, ni la plateforme, ni le relais, ni la reconstruction
> de l'instantané. **Rien de tout cela n'est démontré.**

## 5. Les 5 vérifications NON exécutées

| # | Bloquée par |
|---|---|
| **V-4**, **V-5** | Aucune catégorie **U14** dans les données de test |
| **V-7**, **V-8**, ⭐ **V-10** | Aucun **tableau final de Coupe** |

⭐ **V-10 est déclarée obligatoire** par le §8 : c'est *« le seul scénario qui exerce la partie non
couverte par les tests »* (§3.5). **Sans elle, l'étape 5 ne peut pas aboutir.**

## 6. Où en sont les six risques de non-régression

| # | État |
|---|---|
| **N-1** *(messages et drapeaux)* | ✅ **ÉCARTÉ en conditions réelles** — V-2b |
| **N-2** *(ordre des contrôles)* | ✅ **ÉCARTÉ en conditions réelles** — V-9 |
| **N-3** *(lecture du match suivant)* | 🟠 **NON CONCLUANT** |
| **N-4** *(colonnes de détail)* | ✅ **ÉCARTÉ dans ses deux sens** — V-11 |
| **N-5** *(archivage bloquant)* | 🟡 **partiellement** — le journal n'a jamais bloqué une saisie ; la propagation n'a pas été exercée |
| **N-6** *(mauvais vainqueur propagé)* | ⛔ **NON VÉRIFIÉ** — V-8 et V-10 non exécutées |

> **N-3 — NON CONCLUANT.** Le chemin fonctionnel `match_suivant` **n'a jamais été exécuté** lors des
> validations disponibles, **faute de match de Coupe dans les données de test**. **Aucun résultat,
> positif ou négatif, ne peut être attribué à ce scénario.** ⚠️ **V-12 ne teste pas N-3** et n'a pas
> été utilisée pour en conclure quoi que ce soit : toutes les validations portaient sur des matchs
> de **poule**.

## 7. Ce qui a été VÉRIFIÉ, et comment — la ligne de partage

- ✅ **CERTAIN, vérifié directement** : l'état du dépôt · le routage vers la copie *(contraste
  `getConfig` avec empreintes)* · **tous** les états avant/après du classeur *(matchs, historique,
  classement, en-têtes)* · les messages serveur comparés au code · l'absence de ligne parasite ·
  l'absence de doublon.
- 🟠 **RAPPORTÉ PAR ROMAIN**, non vérifiable depuis le dépôt *(cadre §13.6)* : ce qui s'affiche à
  l'écran de saisie *(verrouillage, boutons, messages)* · **toutes les durées du journal
  « Exécutions »**, dont les **7,099 s** · le déploiement « Version 151 » · l'état des Propriétés du
  script.
- ⛔ **NON VÉRIFIÉ** : **la cascade réelle du tableau final** *(V-10)* · **la propagation du
  vainqueur** *(V-8)* · **le score détaillé** *(V-4, V-5)* · **la cause de la durée de 7,099 s**.

## 8. Ce qui n'a **PAS** été fait

- ❌ **aucune ligne de code modifiée** — `git status` est resté vide du début à la fin ;
- ❌ **aucun test ajouté ni modifié** ;
- ❌ **aucun déploiement** ;
- ❌ **aucune écriture dans le classeur de production** — les **8 écritures** portant sur **7 matchs**
  *(M001 saisi puis corrigé, M002, M003, M004, M005, M006, M007)* ont **toutes** eu lieu dans la
  **copie de test** ;
- ❌ **`RISQUES.md` non touché** : **R-042 reste OUVERT**, et le phénomène de performance est déjà
  couvert par **R-067** *(le verrou tenu pendant la reconstruction de l'instantané)* — **aucun
  nouveau risque n'a été créé**, et rien n'a été ajouté à R-067, car cela reviendrait à lui
  **attribuer** les 7,099 s, ce qui n'est pas démontré ;
- ❌ **`DECISIONS.md` et `docs/passation.md` non touchés** — les décisions de C-012 vivent dans sa
  spécification *(§11)*, et `passation.md` ne mentionne ni C-012 ni R-042.

## 9. ⭐ Retour à la production — le routage est restauré, et la production est INTACTE

`SHEET_ID` a été **supprimée** des Propriétés du script de production *(et non vidée : elle
**n'existait pas** avant l'étape 5 — la remettre à l'état initial, c'est la faire disparaître)*.

**La chaîne de preuve complète, du début à la fin :**

| Moment | `global.tournoi_nom` | Empreinte SHA-256 |
|---|---|---|
| **Avant bascule** *(12:2x)* | `CHALLENGE MARC CHEVALIER` | `6b9189c6e40f0cdc…` |
| **Pendant l'étape 5** | `CHALLENGE MARC CHEVALIER — COPIE DE TEST` | `0534a851d8357f59…` |
| ⭐ **Après restauration** *(14:54:41)* | ⭐ **`CHALLENGE MARC CHEVALIER`** | ⭐ **`6b9189c6e40f0cdc…`** |

> ⭐ **La réponse d'après restauration est identique OCTET POUR OCTET à celle d'avant bascule.**
> Même empreinte, même taille *(2 398 octets)*. Le routage est revenu **exactement** à son état
> initial — ce n'est pas « à peu près pareil », c'est le même contenu, au bit près.

### La production n'a rien reçu — vérifié, pas supposé

| Contrôle sur la **production**, après restauration | Valeur | Attendu |
|---|---|---|
| Lignes dans `Matchs` | **51** | 51 |
| Matchs terminés | ⭐ **3** — `M010`, `M019`, `M031` | les 3 d'origine |
| **M001 → M007** *(les 7 matchs saisis pendant les tests)* | ⭐ **tous vides, tous `à venir`** | intacts |
| Lignes dans `Historique` | ⭐ **211** | 211 |
| `Historique` — tournoi courant | ⭐ **3 lignes** : `M010`, `M019`, `M031` | 3 |

> 🎯 **La copie de test, elle, est passée de 211 à 214 lignes d'historique** et compte 7 matchs
> terminés de plus. **Les deux classeurs se sont séparés au moment de la bascule, et la production
> n'a pas bougé d'une ligne.** Les 8 écritures de l'étape 5 sont **toutes** restées dans la copie.

### Ce qui reste, et qui n'est pas un problème

La **copie de test** existe toujours, avec ses 7 matchs saisis et ses colonnes de détail dans un
ordre différent *(conséquence de V-11)*. Elle **n'est plus reliée à rien** — plus aucun programme ne
l'ouvre. Elle reste **disponible** si l'étape 5 doit être reprise pour les 5 vérifications
manquantes ; sinon elle peut être supprimée sans conséquence.

## 10. État à la fin de la session

| | |
|---|---|
| **`main`** | `ffe4463` — **inchangé** *(vérifié en début et en fin de session)* |
| **C-012** | 🚧 **étape 5 OUVERTE — 7 vérifications sur 12** |
| **R-042** | ⛔ **OUVERT** — il ne passera à `TESTÉ` qu'après l'étape 5 **complète** |
| **N-3** | 🟠 **NON CONCLUANT** |
| **Régression C-012** | ❌ **NON DÉMONTRÉE** |
| **Routage** | ✅ **RESTAURÉ** — `SHEET_ID` supprimée, l'adresse publique ressert la **production** *(réponse identique **octet pour octet** à celle d'avant bascule)* |
| **Production** | ✅ **INTACTE** — 3 matchs terminés, 211 lignes d'historique, les 7 matchs de test **vides et « à venir »** |
| **Copie de test** | conservée, **plus reliée à rien** — utile si l'étape 5 doit être reprise |
| **Prochaine étape** | ⛔ **Attend une décision de Romain** : préparer la matière manquante — une **catégorie U14 en tir au but** *(V-4, V-5)* et un **tableau final de Coupe** *(V-7, V-8, ⭐ V-10)* — sans laquelle l'étape 5 ne peut pas aboutir |

---

# ⚡ C-012 — **ÉTAPE 5 (suite) : PRÉPARATION, V-4 ET V-5 — 9 SUR 12** *(2026-08-18, soir)*

> **Objectif** : débloquer puis exécuter **V-4** et **V-5**, restées impossibles faute de catégorie
> U14 dans les données de test.
> **Résultat** : ✅ **les deux sont RÉUSSIES** — et ⚡ **V-4 a fait entrer un nouveau problème au
> registre : R-093**, un défaut **antérieur à C-012** qu'aucun test automatique ne pouvait voir.

## 1. Ce qui a été préparé — dans la copie de test uniquement

`SHEET_ID` a été **rebasculée** vers la copie *(elle avait été supprimée en fin de session
précédente)*. Routage prouvé par contraste `getConfig` : `CHALLENGE MARC CHEVALIER — COPIE DE TEST`,
empreinte `0534a851d8357f59…`.

| Élément | Valeur |
|---|---|
| Catégorie **U14** | présente · ⭐ **`forme_jeu = RE — 15x15`** · mi-temps **15** · contexte `LAMBDA` · après-midi `POULES_NIVEAU` |
| Équipes | **3** — `TEST U14-1/2/3` *(minimum FFR : les matchs secs sont interdits)* |
| U10 | ⏳ **laissé en `POULES_NIVEAU`** — le passage en `COUPE_PLATEAU` a été **reporté après la génération**, pour choisir `nbQualifiesCoupe` en connaissance du nombre réel de poules |
| Génération | ⭐ **une seule fois** → **11 poules**, **54 matchs**, fin du matin **11:51** |

> ⭐ **Le référentiel FFR n'a eu besoin d'AUCUNE préparation.** `RefFFR_Regles` portait déjà
> `tir_au_but = OUI` pour **M14 / RE / 15x15** — la seule des 15 lignes à l'avoir. La mémoire du
> projet laissait croire qu'il faudrait créer et remplir cette colonne : **c'était faux**.
>
> ⚠️ **Le réglage qui décide de tout** : mars 2027 propose **deux** formes pour M14 *(RE 10x10 et
> RE 15x15)*, et le code exige que **toutes** portent `OUI` (`regles.every`). Sans
> `Config.forme_jeu = RE — 15x15`, la capacité serait restée à `false` et **V-4 aurait été
> impossible** — non pas par défaut du code, mais par ambiguïté réglementaire non levée.

**Contrôle avant l'opération irréversible** : les deux garde-fous de génération franchis pour les
trois catégories *(≥ 3 équipes ; durée de mi-temps > 0)*, présenté à Romain **avant** son accord.

## 2. ⚠️ V-4, PREMIÈRE TENTATIVE — ÉCHEC

Saisie détaillée sur **M052**, dans un classeur dont **V-11 venait de réordonner les colonnes**
*(`arbitre` remonté en 19ᵉ position, les 8 colonnes de détail décalées d'un cran)*.

Le serveur écrit les compteurs à partir de `colMatchs('essais_A')` = **19** — la position dans le
**code** — soit `arbitre` dans le **classeur réel** :

| Valeur envoyée | Colonne visée | Colonne **réelle** | Observé |
|---|---|---|---|
| `essais_A` = 3 | 19 | ⚠️ **`arbitre`** | **3** — colonne métier **écrasée** |
| `essais_B` = 1 | 20 | `essais_A` | 1 |
| `transfo_A` = 2 | 21 | `essais_B` | 2 |
| `transfo_B` = 1 | 22 | `transfo_A` | 1 |
| `pen_A` = 1 | 23 | `transfo_B` | 1 |
| `pen_B` = 2 | 24 | `pen_A` | 2 |
| `drop_A` = 1 | 25 | `pen_B` | 1 |
| `drop_B` = 1 | 26 | `drop_A` | 1 |
| *(rien)* | — | `drop_B` | ⚠️ **vide — valeur perdue** |

**Les neuf cases correspondent, une à une**, au relevé fait par Romain dans le Sheet.

**Le score (25-16), le statut et l'`Historique` étaient JUSTES** — le serveur calcule le score à
partir du détail **avant** d'écrire. **Et l'application n'a rien signalé.**

> ⛔ **Vérification de responsabilité, faite avant toute conclusion** : la ligne d'écriture existait
> **déjà au point de départ de C-012** (`4af5003`) ; `colMatchs` date du **2026-07-24**,
> `assurerColonnesMatchs` du **2026-07-19**. C-012 n'a fait que remplacer des valeurs écrites en dur
> par `plan.compteurs`. ⛔ **AUCUNE RÉGRESSION C-012.**

⚡ **Inscrit au registre : R-093** *(P2, CERTAIN, NON CORRIGÉ)*.

## 3. ⚠️ Une erreur d'appréciation de Claude, et il faut la nommer

Au compte rendu de **V-11**, Claude avait écrit :

> *« L'ordre des colonnes de la copie de test diffère maintenant de celui de la production.
> **C'est sans conséquence sur le fonctionnement** »*

**C'était faux.** L'affirmation venait d'un raisonnement à moitié fait : la **lecture** se fait bien
par nom *(vrai)*, mais l'**écriture** se fait par position *(non vérifié à ce moment-là)*. **C'est
cette phrase qui a laissé la voie libre à l'anomalie.**

**Conséquence sur V-11** : son verdict **ne change pas** — les colonnes sont bien recréées et la
saisie simple fonctionne, son périmètre est rempli. Mais **une réserve est ajoutée** : V-11 a créé
une condition qu'elle n'a pas testée, la saisie **détaillée** après migration.

## 4. La remise en ordre, puis la reprise

La colonne `arbitre` a été **remise en dernière position** dans la copie *(la valeur parasite `3` l'a
suivie — c'est voulu, elle reste la trace de l'anomalie)*.

**Contrôle avant toute nouvelle saisie** : les **27 colonnes** correspondent alors **une à une** à
`ENTETES.Matchs`, et **aucune valeur n'a bougé** *(54 lignes × 27 colonnes comparées : **0 écart**)*.

## 5. ✅ V-4 — RÉUSSIE *(sur M053)*

⚠️ **Une erreur de sélection de Romain a fait valider M053 au lieu de M054.** Sans conséquence : le
match importe peu, seule compte la conformité de l'écriture. **Les rôles ont simplement été
intervertis**, et aucune preuve n'a été détruite.

| Contrôle | Résultat |
|---|---|
| Score | **25-16** — ⭐ recalcul indépendant du barème *(3×5+2×2+1×3+1×3 = 25 ; 1×5+1×2+2×3+1×3 = 16)* : **conforme** |
| ⭐ Les 8 compteurs | ⭐ **`3, 1, 2, 1, 1, 2, 1, 1` — chacun dans SA colonne** |
| ⭐ `arbitre` | ⭐ **vide** — plus d'écrasement |
| `drop_B` | **écrit** — la valeur n'est plus perdue |
| Intégrité | **11 champs modifiés, tous sur M053** · M052 intact |

> 🎯 **La cause a été supprimée, l'effet a disparu.** C'est la démonstration inverse — la plus forte
> qu'on puisse produire sans instrumenter le code.

## 6. ✅ V-5 — RÉUSSIE *(sur M054)*

| Contrôle | Résultat |
|---|---|
| Score | **38-7** — recalcul : 6×5+4×2 = 38 · 1×5+1×2 = 7 ✅ |
| Les 8 compteurs | **`6, 1, 4, 1, 0, 0, 0, 0`** — ⭐ **les zéros sont ÉCRITS**, pas laissés vides |
| Écart d'essais | ⭐ **exactement 5** — le seuil du code (`if (ecart >= 5)`), volontairement testé **au bord** |
| ⭐ **Bandeau** | ⭐ **AFFICHÉ** — `⚠️ 5 essais d'écart — pense au rééquilibrage (règle des 5 essais).` **conforme au code au caractère près** *(`saisie.js:564`)* |
| `Historique` | 220 → **221**, une seule ligne, **0 doublon** |

*(Détail : le « 5 » du début est l'**écart calculé**, pas le seuil — avec 7 d'écart, le bandeau
aurait affiché « 7 essais d'écart ». Le « 5 » de la fin, lui, est bien le seuil.)*

## 7. ⭐ Les trois matchs U14 sont trois preuves parallèles

| Match | Score | Compteurs `essais_A`…`drop_B` | `arbitre` | Ce qu'il prouve |
|---|---|---|---|---|
| **M052** | 25-16 | `1, 2, 1, 1, 2, 1, 1, (vide)` | ⚠️ **3** | 🔒 **R-093** — le décalage, en vrai |
| **M053** | 25-16 | ⭐ `3, 1, 2, 1, 1, 2, 1, 1` | vide | ✅ **V-4** |
| **M054** | 38-7 | ⭐ `6, 1, 4, 1, 0, 0, 0, 0` | vide | ✅ **V-5** |

⚠️ **M052 est VOLONTAIREMENT laissé en l'état.** Ses données sont incohérentes — c'est ce qui en
fait une preuve. **Ne pas le « réparer ».**

⚠️ **Il ne reste plus aucun match U14 vierge.** Une reprise de V-4 ou V-5 exigerait d'abîmer une
preuve ou d'ajouter des équipes.

## 8. Ce que cette session dit de la méthode

> 🎯 **Les 703 tests automatiques n'auraient JAMAIS pu trouver R-093** : ils ne touchent aucun
> classeur, et le défaut n'existe que dans la rencontre entre le code et la disposition réelle des
> colonnes.
>
> **C'est exactement ce que l'étape 5 est censée attraper — et c'est la première fois qu'elle le
> prouve.** La spécification l'annonçait au §8 : *« un test vérifie une décision ; il ne prouve rien
> sur l'écriture réelle dans Google Sheets »*. On en a maintenant la démonstration.

## 9. Ce qui a été VÉRIFIÉ, et comment

- ✅ **CERTAIN, vérifié directement** : le routage · l'état de la copie avant et après chaque geste ·
  les 8 compteurs et `arbitre` de chaque match · le barème recalculé indépendamment · l'ordre des 27
  colonnes avant et après remise en ordre · l'intégrité des 54 matchs · l'`Historique` · la
  datation du code fautif (`git blame`, état à `4af5003`) · le contenu du référentiel FFR.
- 🟠 **RAPPORTÉ PAR ROMAIN**, non vérifiable depuis le dépôt *(cadre §13.6)* : ce qui s'affiche à
  l'écran de saisie — les totaux avant validation, le verrouillage des cartes, et ⭐ **la présence du
  bandeau d'alerte de V-5**, qui **ne laisse aucune trace dans le classeur**.
- ⛔ **NON VÉRIFIÉ** : **la cascade du tableau final** *(V-10)* · **la propagation du vainqueur**
  *(V-8)* · **le refus de l'égalité en Coupe** *(V-7)*.

## 10. Ce qui n'a **PAS** été fait

- ❌ **aucune ligne de code, aucun test, aucune configuration modifiés** ;
- ❌ **aucun déploiement** ;
- ❌ **aucune écriture dans le classeur de production** — le routage pointait sur la copie ;
- ❌ **V-7, V-8 et V-10 non lancées** ;
- ❌ **`format_apresmidi` et `param_format` de U10 non renseignés** — l'étape reste à faire ;
- ❌ **M052 non « réparé »**, délibérément.

## 11. État à la fin de la session

| | |
|---|---|
| **`main`** | `09994e0` au départ — ce lot est le suivant |
| **C-012** | 🚧 **étape 5 OUVERTE — 9 vérifications sur 12** |
| **R-042** | ⛔ **OUVERT** |
| ⚡ **R-093** | 🔴 **INSCRIT — P2, CERTAIN, NON CORRIGÉ**, non imputable à C-012 |
| **V-11** | ✅ **RÉUSSIE, avec réserve** |
| **N-3** | 🟠 **NON CONCLUANT** *(inchangé)* |
| **Routage** | ⚠️ **pointe encore sur la COPIE DE TEST** — `SHEET_ID` à supprimer en fin de travaux |
| **Prochaine étape** | **V-7, V-8 et ⭐ V-10** — elles exigent de passer U10 en `COUPE_PLATEAU` avec ⭐ **`{"nbQualifiesCoupe":1}`** *(valeur calculée sur les 5 poules réelles : bracket de 8, **1 quart alimentant une demi**, 2 demies, finale, petite finale — **2 saisies suffisent** pour installer V-10)*, puis à générer l'après-midi |

---

# 🏁 C-012 — **ÉTAPE 5 CLOSE : V-7, V-8 ET V-10 RÉUSSIES — LE CHANTIER EST TERMINÉ** *(2026-08-19)*

> **Objectif de la session** : exécuter les **3 vérifications manquantes** — V-7, V-8 et
> ⭐ **V-10, déclarée obligatoire** — puis remettre l'environnement de test en état.
> **Résultat** : ✅ **les trois sont réussies**, ⭐ **R-042 passe à `TESTÉ`**, **l'étape 5 est close**
> et **C-012 est terminé**. Le routage est revenu sur la **production**, vérifiée **non contaminée**.

**Point de départ** : `main` = `origin/main` = **`d5653a9`**, arbre propre.
**Aucune ligne de code, aucun test, aucune configuration de l'application n'a été modifiée.**

---

## 1. Ce qui bloquait, et pourquoi ce n'était pas ce qu'on croyait

La session s'ouvre sur une question de Romain : *le « bloc Coupe » que testent V-7/V-8/V-10, est-ce
le **Super Challenge**, ou un **ancien mode Coupe éliminatoire supprimé** ?*

⚠️ **La prémisse était fausse sur un point, et c'est le point qui débloquait tout.**

| Ce qu'on croyait | Ce que dit le dépôt |
|---|---|
| Le mode Coupe a été **supprimé** | ❌ Il a été **MASQUÉ de l'interface**, jamais supprimé |

**Preuves relevées en lecture seule** :

- **50 occurrences** de `COUPE_PLATEAU` dans le code exécutable, sur **10 fichiers** ;
- le commit qui l'a retiré — **`21a4f2b`** *(2026-07-27, « masque COUPE_PLATEAU (interdit EDR), sans
  réécrire la donnée »)* — ne touche que **3 fichiers frontend** et ⭐ **AUCUN fichier backend** ;
- `git log -S"COUPE_PLATEAU"` sur tout l'historique : **12 commits, aucune suppression** ;
- les **5 fonctions** du mécanisme sont intactes : `fixturesApresMidiCoupePlateau`,
  `construireBracketCoupe`, `propagerVainqueurBracket`, `invaliderMatchAval`, `majPetiteFinale`.

> ⭐ **Découverte à retenir** : **aucune de ces 5 fonctions n'est nommée une seule fois dans
> `backend/Tests.gs`.** Sur 703 tests automatiques, **zéro** ne touche la propagation des vainqueurs.
> C'est exactement la limite que **D-C012-1** avait assumée — et c'est pourquoi V-10 était obligatoire.

**Et le Super Challenge est techniquement étranger à tout cela** : `genererDimancheScf` écrit
`sous_tableau: ''` et `match_suivant: ''` **en dur** *(`Code.gs:8066`)*, et une catégorie SCF est
**sautée** par le générateur d'après-midi *(`Code.gs:6199`)*. Il ne peut **structurellement pas**
armer les garde-fous ①, ③ et ④.

**Chaîne de dépendance établie** : V-7/V-8/V-10 → garde-fous ① ③ ④ → `sous_tableau = 'COUPE'` →
`construireBracketCoupe` *(seul producteur, `Code.gs:6588` et `6602`)* → `format_apresmidi =
COUPE_PLATEAU`. **Aucun autre chemin n'existe.**

---

## 2. L'obstacle que personne n'avait vu : 51 scores manquants

Le contrôle préalable de l'onglet `Matchs` *(lecture seule, autorisée par Romain)* révèle un
blocage qui **ne figurait dans aucun document** :

| Mesure | Valeur |
|---|---|
| Matchs | **54** |
| Matchs de phase `classement` | ⭐ **0** — l'après-midi n'avait **jamais** été généré |
| Matchs **non terminés** | 🔴 **51** *(30 U8 + 21 U10)* |

Or `genererApresMidi` refuse de démarrer si **un seul** match du matin n'est pas terminé
*(`Code.gs:6182`)*. **Aucune fonction d'aide au remplissage n'existe** dans `Code.gs` ni `Tests.gs`.

✅ **Bonne nouvelle du même contrôle** : les **3 preuves de V-4/V-5** *(M052, M053, M054)* sont en
phase `poule` et occupent les **3 dernières lignes** (53-55). La génération les **conserve**, et les
51 lignes à remplir sont **contiguës** (2 à 52) : aucune ligne à préserver au milieu de la plage.

---

## 3. Le remplissage — voie **A-2**, validée par Romain

**2 cellules d'écart avec le geste minimal**, mais 51 lignes à faire exister. Romain a choisi le
**collage direct dans le Sheet** plutôt que 51 saisies écran.

- **Colonnes touchées** : `score_A`, `score_B`, `statut` — **et elles seules** *(plage `I2:K52`)* ;
- **Motif** : `15 – 5`, vainqueur = l'équipe apparaissant **en premier** dans le calendrier de sa
  poule. ⭐ **Règle transitive par construction** : aucun cycle possible, donc **aucun ex æquo**.

**Vérification des classements avant écriture** *(simulation avec le barème réel V=3 N=2 D=1 et
`comparerClassement`)* : les 5 poules U10 ressortent **strictement ordonnées par les points seuls**
— 9/7/5/3 et 6/4/2. **Le départage n'a jamais besoin d'intervenir.**

**Contrôle après collage — diff exhaustif sur 54 × 27 = 1 458 cellules** :

```
cellules modifiées : 153  =  51 lignes × 3 colonnes, exactement
cellules modifiées hors score_A/score_B/statut : 0
cellules modifiées sur M052/M053/M054          : 0
```

---

## 4. Réactivation de `COUPE_PLATEAU` — copie de test uniquement

Décision explicite de Romain : *« Cela ne signifie pas que ce format doit redevenir une
fonctionnalité utilisable dans l'application. »*

**2 cellules**, ligne U10 de `Config` : `format_apresmidi = COUPE_PLATEAU` et
`param_format = {"nbQualifiesCoupe":1}`.

⚠️ **`param_format` n'est exposé par aucune lecture publique** — il n'a donc **jamais pu être
relu**. Sa valeur a été établie **indirectement**, par la structure produite à la génération.

**Génération** : ✅ **114 matchs d'après-midi**, conforme à la prédiction faite avant le clic
*(U10 : 5 Coupe + 66 Plateau · U8 : 40 · U14 : 3)*. Les 54 matchs du matin : **0 cellule modifiée**.

⭐ **La structure obtenue est identique, match pour match, à celle prédite en simulant `ordreSeeds`
et `construireBracketCoupe`** — ce qui **prouve indirectement** que `nbQualifiesCoupe` valait bien
**1** *(sinon : 10 matchs et des huitièmes)* :

```
M095  QUART_DE_FINALE   ANTONY vs CLAMART          → M102 (place B)
M102  DEMI_FINALE       LE PUC-2 vs (vainqueur)    → M110 (place A)
M103  DEMI_FINALE       LE PUC-1 vs STADE FRANÇAIS → M110 (place B)
M110  FINALE
M111  PETITE_FINALE
```

**Têtes de série confirmées par `getClassement`** *(le serveur, pas la simulation)* :
E38 · E37 · E07 · E17 · E08 — **identiques à la prédiction**.

---

## 5. ✅ V-7 — le refus n'écrit rien

**Geste** : égalité `10 – 10` sur M103 **sans désigner de vainqueur**.

| Contrôle | Résultat |
|---|---|
| Message affiché | ⭐ **identique au code, octet pour octet — 72 / 72 caractères** |
| ⭐ Cellules modifiées | **0** sur 168 × 27 |
| Ligne parasite `__verif_cle__` | aucune |

> **Le garde-fou ③ refuse AVANT toute écriture** — et **sans payer de lecture** : le refus ③
> intervient avant le garde-fou ④, donc la lecture paresseuse du §6.3 est préservée **en réel**.

---

## 6. ✅ V-8 — la propagation, en deux temps

**(a) Le vainqueur arrive dans le match suivant.** Saisie de M095 *(`ANTONY 12 – 7 CLAMART`)* :

```
M095   score_A '' → '12' · score_B '' → '7' · statut → 'terminé' · vainqueur → E17 [ANTONY]
M102   equipe_B '' → 'E17' [ANTONY]        ⭐ la propagation
```

**5 cellules, 2 matchs.** M111 **n'a pas bougé** — correct : M095 est un **quart**, et
`majPetiteFinale` n'est appelée que pour une `DEMI_FINALE`.

**(b) Les perdants alimentent la petite finale.** Saisie de M102 *(`LE PUC-2 15 – 5 ANTONY`)* :

```
M102   score 15-5 · terminé · vainqueur E38 [LE PUC-2]
M110   equipe_A '' → 'E38' [LE PUC-2]
M111   equipe_A  E07 [STADE FRANÇAIS] → E17 [ANTONY]     ⭐ recalcul
M111   equipe_B  ''  → E07 [STADE FRANÇAIS]              ⭐ recalcul
```

> ⭐ **STADE FRANÇAIS s'est déplacé de A vers B — annoncé avant le geste, constaté après.**
> `majPetiteFinale` ne complète pas une case vide : elle **recalcule les deux emplacements** à
> partir des demies terminées. Une fonction qui aurait « rempli le trou » aurait rangé les perdants
> **dans le mauvais ordre**.

**Verdict V-8 : ✅ RÉUSSIE** *(les deux volets)*.

---

## 7. ⭐ V-10 — les DEUX branches, aucune sautée

Romain a exigé de tester **les deux boutons**, dans l'ordre.

### Branche 1 — « Annuler »

Correction de M095 vers `7 – 12` *(on inverse le vainqueur — sans quoi la cascade ne se déclenche
pas : `propagerVainqueurBracket` ne réagit que si le vainqueur **change**, `Code.gs:5869`)*.

**Message affiché** : ⭐ **identique au code, 152 / 152 caractères**, tiret cadratin compris.

| Contrôle | Résultat |
|---|---|
| ⭐ **Cellules modifiées** | **0** sur 4 536 |

> ⚠️ **Romain a explicitement refusé de conclure depuis l'écran** — l'interface affichait encore
> `7 – 12` dans ses champs. **La preuve est la relecture du classeur, pas l'affichage.**

### Branche 2 — « Modifier quand même »

**Prédiction annoncée avant le clic : 4 matchs, 11 cellules. Constaté : 4 matchs, 11 cellules —
les mêmes.**

```
M095   score 12-7 → 7-12 · vainqueur ANTONY → CLAMART
M102   equipe_B ANTONY → CLAMART · score 15-5 EFFACÉ · statut 'terminé' → 'à venir' · vainqueur effacé
M110   equipe_A LE PUC-2 → (vide)
M111   equipe_A ANTONY → STADE FRANÇAIS · equipe_B STADE FRANÇAIS → (vide)
```

| Contrôle | Résultat |
|---|---|
| ⭐ **M103** *(l'autre moitié du tableau)* | ✅ **INTACTE** — la cascade n'a pas débordé |
| Matchs hors Coupe modifiés | **aucun** |
| M052 / M053 / M054 | ✅ intacts |

**Confirmation croisée par l'interface** : le compteur est passé de **68/71 à 69/71** — c'est-à-dire
*« 69 à saisir sur 71 »* *(`saisie.js:258`)*. Il **augmente** parce que la demi-finale **a perdu son
score**. Les données concordent : **2** matchs U10 d'après-midi terminés, contre 3 avant.

**Verdict V-10 : ✅ RÉUSSIE.**

---

## 8. Ce que l'étape 5 établit sur les risques

| Risque | Avant | Après |
|---|---|---|
| **N-1** *(un message change)* | mesuré par tests | ✅ **écarté en réel** — 2 messages vérifiés **caractère par caractère** *(72 et 152 signes)* |
| **N-2** *(ordre des contrôles)* | ✅ écarté *(V-9)* | inchangé |
| **N-3** *(lecture systématique)* | 🟠 non concluant | 🟠 **TOUJOURS NON CONCLUANT** *(V-12)* |
| **N-4** *(colonnes de détail)* | ✅ écarté | inchangé *(R-093 reste ouvert)* |
| **N-5** *(propagation bloquante)* | 🟡 partiel | ✅ **ÉCARTÉ** — la propagation a tourné 5 fois sans jamais gêner un enregistrement |
| ⭐ **N-6** *(mauvais vainqueur propagé)* | ⛔ **NON VÉRIFIÉ** | ✅ ⭐ **ÉCARTÉ** |

> ⭐ **La limite assumée par D-C012-1 est désormais couverte.** Les trois fonctions laissées hors du
> refactoring et hors des 703 tests — `propagerVainqueurBracket`, `invaliderMatchAval`,
> `majPetiteFinale` — ont tourné en conditions réelles et ont fait exactement ce que le code annonce.

---

## 9. Remise en état de l'environnement

| # | Geste | Contrôle |
|---|---|---|
| 1 | `format_apresmidi` U10 → `POULES_NIVEAU` | ✅ **vérifié** — 1 seule valeur changée |
| 2 | `param_format` U10 vidé | ⛔ **NON VÉRIFIÉ** *(hors liste blanche — l'observation de Romain fait foi)* |
| 3 | `heure_fin` → `17:18` *(la génération l'avait réécrite à `22:26`)* | ✅ **vérifié** |
| 4 | ⭐ **Propriété `SHEET_ID` supprimée** | ✅ **vérifié — contrôle renforcé** |

**Bilan du nettoyage, contre la référence figée** : exactement **2 changements** dans la
configuration lisible — `heure_fin` et `U10.format_apresmidi`.

### ⭐ Le contrôle renforcé du routage — 4 tests concordants

| # | Test | Résultat |
|---|---|---|
| 1 | `tournoi_nom` | `CHALLENGE MARC CHEVALIER` — **plus de « COPIE DE TEST »** |
| 2 | ⭐ **Test négatif** — la signature de nos vérifications | **M095 ABSENT** · **0 ligne `sous_tableau = COUPE`** *(la copie en avait 5)* |
| 3 | Volume | **51** matchs *(la copie : 168)* |
| 4 | Contraste | `heure_debut` 10:00 *(vs 09:30)* · `heure_fin` 16:35 *(vs 17:18)* · **U8 + U10 seulement, pas d'U14** |

> 💡 **Le test n° 2 est le plus solide** : un quart de finale U10 opposant ANTONY à CLAMART sur
> `7 – 12` **n'existe que dans la copie de test — parce que nous venons de le créer**.

### ✅ Production non contaminée *(vérification supplémentaire, non promise)*

```
U8, U10 : format_apresmidi = POULES_NIVEAU   ← aucun COUPE_PLATEAU
51 matchs, phase 'poule' uniquement, 48 à venir / 3 terminés
sous_tableau non vide : 0   ·   match_suivant non vide : 0
```

**Aucune trace des scores collés, du tableau de Coupe ni des 114 matchs générés.**
⭐ **La production est strictement dans l'état où elle était avant la session.**

---

## 10. Ce qui n'a PAS été fait, et c'est volontaire

- ❌ **aucune ligne de code, aucun test, aucune configuration de l'application modifiés** ;
- ❌ **aucun déploiement** ;
- ❌ **V-12 non rejouée** — elle reste **non concluante**, réserve **explicitement conservée** par
  Romain au moment de valider `TESTÉ` ;
- ❌ **R-093 non corrigé** *(P2, antérieur à C-012)* · **R-092 non corrigé** ;
- ❌ **`param_format` non relu** — impossible par les lectures publiques ;
- ❌ **la copie de test n'est pas remise à zéro** : les 51 scores du matin, les 114 matchs
  d'après-midi et le tableau de Coupe y demeurent. **Signalé à Romain, sans conséquence sur la
  production** *(établi par les 4 tests ci-dessus)*.

---

## 11. Leçon de méthode

> ⭐ **Deux vérifications ont été bloquées pendant une session entière par une croyance fausse :
> « ce mode a été supprimé ».** Il avait seulement été **retiré de l'interface**. Le commit qui l'a
> fait le disait pourtant explicitement — *« La CAPACITÉ reste entière »* — et **ne touchait aucun
> fichier backend**.
>
> **Ce qui a débloqué la session, ce n'est pas une idée : c'est `git log -S` et un `grep` exhaustif.**
> **Masqué n'est pas supprimé**, et seul le dépôt peut trancher entre les deux.

Second enseignement, plus discret : **chaque geste a été précédé d'une prédiction chiffrée**
*(« 153 cellules », « 11 cellules », « E07 va passer de A à B »)*, puis confronté à un **diff
exhaustif**. Une prédiction juste vaut vérification ; **une prédiction fausse aurait été le signal**.
C'est ce qui a permis d'affirmer *« la cascade n'a pas débordé »* — plutôt que de l'espérer.

---

## 12. État à la fin de la session

| | |
|---|---|
| **`main`** | `d5653a9` au départ — ce lot est le suivant |
| ⭐ **C-012** | 🏁 **TERMINÉ — étape 5 CLOSE, 5 étapes sur 5** |
| ⭐ **R-042** | ✅ **`IDENTIFIÉ` → `TESTÉ`** — avec la réserve **V-12 / N-3 non concluante** *(D-C012-5)*. ⚡ **Au passage, l'écart signalé le 2026-08-18 est résorbé** : le registre affichait encore `IDENTIFIÉ` alors que le chantier était en cours *(§8 de l'entrée précédente — « écart mineur signalé, non corrigé »)*. **R-042 n'est jamais passé par `CORRIGÉ`** : il saute de `IDENTIFIÉ` à `TESTÉ`, le registre n'ayant pas été touché pendant les étapes 1 à 4 |
| **V-7 · V-8 · V-10** | ✅ **RÉUSSIES** |
| **V-12 / N-3** | 🟠 **NON CONCLUANTE** — réserve conservée |
| **R-093** | 🔴 **P2, CERTAIN, NON CORRIGÉ** *(antérieur à C-012)* |
| **R-092** | ⚠️ **NON CORRIGÉ**, priorité **À CONFIRMER** |
| ⭐ **Routage** | ✅ **PRODUCTION — rétabli et vérifié** *(4 tests concordants)* |
| ⭐ **Production** | ✅ **NON CONTAMINÉE** |
| **Prochaine session recommandée** | **C-015** *(dépendances `C-011 → C-012 → C-015`, désormais levées)*, ou l'arbitrage de la **priorité de R-092** et du **traitement de R-093** |

---

# 📄 REMISE À NIVEAU DOCUMENTAIRE — **LES 6 LOTS SONT FAITS ET PUBLIÉS** *(2026-08-19, après-midi)*

> **Objectif de la session** : la documentation du dépôt avait **décroché de l'état réel du
> logiciel**. Remettre la documentation **active** en face de ce que le dépôt contient — **sans**
> toucher au produit, et **sans** réécrire les documents historiques.
> **Résultat** : 🏁 **les 6 lots sont terminés et publiés**, le chantier est **clos**, et **trois
> décisions** en sont nées — **D-034**, **D-035**, **D-036**.

**Point de départ** : `main` = `origin/main` = **`60d93dd`** *(la clôture de C-012, le matin même)*,
arbre propre.

> ⚠️ **Ce chantier n'est PAS issu de l'audit de l'ÉTAPE 2.** Il n'a **pas** de numéro `C-0XX`, ne
> figure **pas** au tableau des chantiers de `PLAN.md` §3, et a été **ouvert par Romain hors plan**,
> après C-012. Sa fiche complète — objectifs, critères de fin, méthode, ce qu'il ne devait **pas**
> faire — vit dans **`PLAN.md` §13**, et n'est pas recopiée ici.

---

## 1. Pourquoi ce chantier a été ouvert — le constat d'entrée, chiffré

| Ce qui avait décroché | L'écart |
|---|---|
| **`backend/README.md`** | Annonçait un bilan de tests **`616/616`** quand le vrai bilan est **`703/703`** |
| **`frontend/README.md`** | Disait de la mesure des partenaires qu'elle est *« locale (rien n'est envoyé) »* — **le code envoie les relevés au serveur**. ⚠️ Seul écart touchant des **données personnelles** |
| **Le format `POULES_NIVEAU`** | Livré le **2026-08-01**, **proposé en premier** dans l'administration, et documenté dans **aucun** document destiné à l'organisateur |
| **`CHANGELOG.md`** | **Arrêté au 2026-08-04** : **12 enregistrements** touchant le code, les tests ou l'automatisation, sans une ligne de journal |

> 🎯 **Le piège du premier écart, et c'est lui qui a fixé l'ordre des lots.** `deploiement.md`
> enseigne qu'un bilan **plus petit** signifie que l'**ancien** fichier de tests a tourné. Un
> `README` bloqué sur `616` faisait donc qu'une personne obtenant le **bon** résultat — `703` —
> aurait conclu à une **panne**. Un repère faux ne se contente pas d'être faux : **il inverse la
> conclusion.**

> 🎯 **Le diagnostic, et il commande tout le chantier.** Ces écarts ne venaient **pas** d'un défaut
> de discipline. Neuf contradictions sur dix opposaient un document **récent et exact** à un
> document **plus ancien qu'on n'avait pas relu quand la valeur avait changé**. Le problème est
> celui de la **propagation** — et, pour le `CHANGELOG`, celui du **périmètre** de la règle
> `CLAUDE.md` **§8 bis**, qui ne le nommait pas.

---

## 2. Le principe de travail : un lot = un sujet = un commit

Chaque lot a été relu, contrôlé et validé **avant** le suivant ; le suivant n'a jamais démarré
automatiquement. **Deux règles ont tenu du premier au dernier lot** :

1. ⛔ **Aucun remplacement de masse.** Le dépôt contient **~20 traces historiques légitimes**
   portant d'anciens chiffres *(« 8 147 lignes »…)*. Un `sed` global les aurait **détruites** pour
   corriger **un** repère utile ;
2. ⛔ **Une affirmation se vérifie à SA SOURCE**, jamais par recopie d'un document à l'autre — code,
   tests, workflow, configuration, ou décision enregistrée.

---

## 3. Les six lots, et ce que chacun a réglé

| # | Lot | Commit | Ce qui a été fait |
|---|---|---|---|
| **1** | Les repères qui pouvaient tromper | [`8e08552`](https://github.com/RFL974/tournoi-r92/commit/8e08552) | 8 147 → **8 274** · 3 859 → **4 244** · ⭐ **le bilan de tests n'est plus RECOPIÉ** : il renvoie à `deploiement.md`, **seule adresse**. Le *« rien n'est envoyé »* remplacé par le comportement réel, **écrit depuis le code** |
| **2** | Le format que personne ne pouvait découvrir | [`969e673`](https://github.com/RFL974/tournoi-r92/commit/969e673) | Les formats du code = ceux documentés, **même ordre**. ⚠️ **Ce lot a touché du CODE** — voir **D-034** ci-dessous |
| **3** | Rouvrir le journal des évolutions | [`b91cbfe`](https://github.com/RFL974/tournoi-r92/commit/b91cbfe) | **+76 lignes** au `CHANGELOG`, chaque chiffre vérifié à sa source, **aucune entrée existante modifiée** · et **la cause fermée** : le `CHANGELOG` entre dans `CLAUDE.md` §8 bis — voir **D-035** |
| **4** | Statuts de déploiement et repères opérationnels | [`22d2186`](https://github.com/RFL974/tournoi-r92/commit/22d2186) | **3 corrections**, chacune vérifiée à sa source *(dont `Code.gs` **8 274 → 8 277**, les 3 lignes de commentaire du lot 2)*. ⭐ **9 documents examinés et LAISSÉS INTACTS parce qu'exacts** · **aucun état historique daté réécrit** |
| **5** | Pilotage documentaire du chantier | [`eadb61a`](https://github.com/RFL974/tournoi-r92/commit/eadb61a) **+** [`934b87d`](https://github.com/RFL974/tournoi-r92/commit/934b87d) | `PLAN.md` **§13** et **D-036**. ⚡ **Le problème qu'il referme** : le découpage n'existait **dans aucun document** — voir §4 |
| **6** | Relecture finale et cohérence globale | [`3af61f2`](https://github.com/RFL974/tournoi-r92/commit/3af61f2) | **24 documents actifs balayés** · ⭐ **87 liens internes contrôlés, ZÉRO cassé** · les 3 points connus traités, **+ 3 écarts que personne n'avait vus** *(`sponsors.md` renvoyait à des styles déménagés ; il listait comme manquantes **deux fonctions construites** ; l'arborescence du `README` ignorait **4 feuilles de style sur 6**)* |

**Clôture du chantier** : [`217f39f`](https://github.com/RFL974/tournoi-r92/commit/217f39f) — `PLAN.md`
§13.5, le critère de fin déclaré **atteint**.

> 🔁 **Pourquoi le lot 5 porte deux commits.** Un lot qui documente **son propre achèvement** ne peut
> pas connaître le numéro du commit qui l'achève : Git ne le calcule qu'**au moment** où le commit
> est créé, à partir du contenu. L'inventer serait pire que l'omettre. Le document le dit lui-même
> *(`PLAN.md` §13.6)*, et donne la commande pour le retrouver : `git log --grep="lot 5"`.

---

## 4. Les trois décisions nées du chantier

| Décision | Ce qu'elle fixe | Lot |
|---|---|---|
| **D-034** | ⚡ **`COUPE_PLATEAU` reste PROPOSÉ, mais SIGNALÉ.** *« Il reste disponible et sélectionnable, mais doit être explicitement signalé comme comportant des phases finales qui ne sont pas conformes au cadre École de Rugby. L'utilisateur doit être averti avant de l'utiliser. »* L'application **informe et sécurise le choix** ; elle **ne supprime pas** la possibilité — **D-031 appliquée à la lettre**. ⛔ **REMPLACE** la doctrine du même lot *(« interdit en EDR, non proposé dans l'interface »)*, **jamais publiée**, et **à ne plus reprendre** | 2 |
| **D-035** | ⚡ **Le `CHANGELOG` raconte le produit et la fiabilité, et il entre dans la règle de la carte** — `CLAUDE.md` §8 bis passe de **3 à 4** documents. ⚠️ **Ne demande PAS** une entrée par commit : le critère est *« quelqu'un qui utilise l'application le remarquerait-il, ou cela change-t-il ce sur quoi on peut compter ? »* | 3 |
| 🏛️ **D-036** | **Le découpage en 6 lots lui-même** : ordre, périmètre, critères de fin. ⚠️ **Deux registres, jamais mélangés** — 🧾 **constat** pour les lots 1 à 3 *(vérifiables dans le dépôt)*, 🏛️ **décision du propriétaire** pour les lots 4 à 6, **dont la définition n'existait nulle part**. Ce n'est **pas** une reconstitution | 5 |

> ⚡ **Ce que la recherche du lot 3 a établi, et c'est ce qui a rendu D-036 nécessaire.** Le
> découpage complet en 6 lots **n'existait dans AUCUN document** du dépôt. Cherché de façon
> exhaustive : tous les fichiers suivis, **l'historique complet toutes branches**
> *(`git log --all -S`, 8 variantes de casse)*, **103 branches locales**, **44 distantes**, les
> `notes`, le `stash`, les **étiquettes**, et les **27 objets orphelins**. **Zéro définition.**
> Sans D-036, une session neuve n'aurait pas pu reprendre le chantier.

---

## 5. ⚠️ L'exception assumée : un chantier documentaire qui a touché du code

**Le lot 2 est le seul**, et c'est **D-034** qui l'a imposé — la documentation seule ne pouvait pas
porter une décision produit.

| Fichier | Ce qui a changé |
|---|---|
| `frontend/js/admin.js` | `COUPE_PLATEAU` revient dans les formats proposés, en **5ᵉ carte**, avec un drapeau `horsCadreEdr` · **confirmation demandée AVANT application** *(mécanisme `dialogConfirmer` existant, aucun composant nouveau)* · ⭐ **le tableau `FORMAT_COUPE_PLATEAU_LEGACY` disparaît : il était déclaré, mais consommé nulle part — du code mort** |
| `frontend/js/admin-reglages.js` | La carte signalée · l'encart passe de *« Choisissez un autre format »* à un **rappel informatif** · ⚡ **3 commentaires devenus faux réécrits** *(`CLAUDE.md` §8 ter)* |
| `frontend/css/styles.css` **et** `theme-r92.css` | Le liseré ambre — dans **LES DEUX** feuilles, à cause du **piège connu du projet** : en thème clair, `theme-r92.css` repeint la carte en navy, où un titre ambre foncé aurait été **illisible** |
| `backend/Code.gs` | ⭐ **UN COMMENTAIRE, ET RIEN D'AUTRE.** La demande d'autorisation FFR continue de rendre `COUPE_PLATEAU` *« manquant »* : ce formulaire est **spécifiquement** celui de l'École de Rugby, et y déclarer un format que ce cadre interdit ferait dire à l'application **le contraire de la règle qu'elle cite** |

**Vérifications rapportées par le commit `969e673`** : preuve *« zéro ligne exécutable »* côté
serveur — commentaires retirés, `Code.gs` **identique avant/après sur 5 192 lignes** · harnais
**703/703 OK, 0 FAIL** *(exécuté sous Node)* · les fonctions `fixturesApresMidiCoupePlateau`,
`propagerVainqueurBracket` et `construireBracket` : **0 ligne modifiée** · scénario complet joué
**dans le navigateur** sur la vraie page d'administration.

> ⚠️ **Conséquence de déploiement, à connaître.** `backend/Code.gs` compte **8 277** lignes dans le
> dépôt ; la version collée chez Google date du **2026-08-18** et en compte **8 274**. **L'écart est
> exactement ces 3 commentaires** — **aucun effet sur le comportement**, et **aucun faux signal
> possible** : les deux repères de contrôle de `deploiement.md` portent sur `Tests.gs`
> *(**703/703**, dernière ligne **4244**)*, **inchangé**. Le frontend, lui, est **publié**
> automatiquement — l'exécution GitHub Pages de `969e673` est **réussie**.

---

## 6. Après la clôture — la micro-correction préventive de `CLAUDE.md` *(`2706813`)*

⚠️ **Elle ne rouvre PAS le chantier**, terminé et publié à `217f39f` : c'est une mesure **de
règles**, prise à la suite du diagnostic qui a suivi.

**Le diagnostic, en une phrase** : le principe existait et sa liste de documents était juste — c'est
son **déclencheur** qui ne se déclenchait pas. **§8 bis nommait trois cas** *(écran, action serveur,
onglet)* et **a laissé passer quatre décrochages, dont DEUX alors que la règle existait déjà**.
Aucun n'était un écran, une action serveur ni un onglet.

| Mesure | Ce qu'elle change |
|---|---|
| **§8 bis** | Le déclencheur devient une **QUESTION** au lieu d'une liste fermée : *« une session qui change ce que l'application **fait**, ce qu'elle **montre**, ou **ce sur quoi on peut compter** vérifie la carte dans le même lot »*. ⚠️ **Garde-fou ajouté** : le déclencheur demande de **VÉRIFIER**, **pas de MODIFIER** — *« vérifié, rien à changer »* est une réponse valable |
| **§12.4** | Un **point 2** avant la clôture : dire quels documents **ACTIFS** deviennent faux — **et si aucun, l'écrire**. 🎯 **Le trou le plus silencieux** : sans lui, une session qui a vérifié sans rien trouver et une session qui a **oublié d'y penser** laissaient **la même trace — aucune** |
| **§8 quater** *(nouvelle)* | **La règle de la source unique**, remontée depuis `PLAN.md` §13.2 où elle vivait dans la section d'un chantier **clos** — donc là où une session future ne l'aurait pas lue |

---

## 7. ⛔ Ce que ce chantier NE referme PAS

Le critère de fin atteint est celui du **lot 6**, et il porte sur la documentation **active** :
*« un lecteur qui parcourt aujourd'hui la documentation active ne rencontre plus de contradiction
connue, de lien interne cassé connu, de formulation obsolète non volontaire, ni d'écart manifeste
avec l'état actuel du dépôt. »* **Rien de plus.**

- ❌ **Pas** que le projet soit fonctionnellement parfait ;
- ❌ **Pas** que les risques d'industrialisation soient résolus : **R-075** *(aucune version publiée,
  `git tag` vide — **rouvrir un journal n'est pas publier des versions**)*, **R-092** et **R-093**
  **restent ouverts au registre** ;
- ❌ **Pas** que les documents **historiques datés** aient été réécrits — `AUDIT.md`, `SESSIONS.md`,
  `RAPPORT-AUDIT.md`, les entrées passées du `CHANGELOG`, les bandeaux *« Rappel de la mise à jour
  précédente »* de `ETAT.md` : **aucun ne l'a été**, et c'est leur rôle de décrire un état ancien.

---

## 8. État à la fin de la session

| | |
|---|---|
| **`main`** | `2706813` — publié, `origin/main` au même enregistrement, arbre **propre** |
| 📄 **Remise à niveau documentaire** | 🏁 **TERMINÉE — 6 lots sur 6** *(`PLAN.md` §13.5)* |
| **Décisions nées** | **D-034**, **D-035**, **D-036** — toutes **validées** |
| **Code touché** | ⚠️ **Le lot 2 seul** *(D-034)* — frontend + **un commentaire** côté serveur |
| **Backend chez Google** | ⚠️ **Version du 2026-08-18** : **3 lignes de commentaire** de retard, **aucun effet fonctionnel** |
| **Frontend** | ✅ **Publié** — exécution GitHub Pages de `969e673` **réussie** |
| **R-075 · R-092 · R-093** | ⛔ **Toujours ouverts** — aucun n'était dans le périmètre |
| **Chantier ouvert** | ✅ **Aucun** |
| **Prochaine session recommandée** | Inchangée depuis la clôture de C-012 : **C-015** *(dépendances `C-011 → C-012 → C-015` levées)*, **ou** l'arbitrage de la **priorité de R-092** et du **traitement de R-093**. ⛔ **Ni l'un ni l'autre n'est lancé** — condition de démarrage : **instruction explicite de Romain** |

> 🧭 **Ce qui empêche le retour en arrière** — trois règles restent en vigueur : `CLAUDE.md`
> **§8 bis** *(la carte, désormais **4** documents)*, **§8 ter** *(le commentaire à jour)*, et
> **§8 quater** *(une affirmation se vérifie à sa source, jamais par recopie)*.

---

## 9. ⚠️ Note de traçabilité — cette entrée a été écrite APRÈS COUP

**Elle a été rédigée le 2026-08-19 en fin de journée**, à la suite d'un diagnostic d'état de dépôt
qui a constaté que **`ETAT.md` et `SESSIONS.md` s'étaient arrêtés à la clôture de C-012**, alors que
les 6 lots avaient eu lieu et étaient **déjà publiés**.

**Aucun fait n'a été reconstruit de mémoire.** Chaque affirmation ci-dessus provient de **sources
déjà publiées** : l'historique Git *(commits, statistiques de fichiers, messages)*, **`PLAN.md`
§13**, **`DECISIONS.md`** *(D-034, D-035, D-036)*, et — pour les points recoupés dans le code —
`backend/Code.gs`, `frontend/js/admin.js` et `git tag`.

> 🎯 **La leçon, et elle est la même que celle du chantier qu'elle raconte** : le journal a décroché
> **là où la règle ne regardait pas**. `PLAN.md` et `DECISIONS.md` ont été tenus lot après lot ;
> **`ETAT.md` et `SESSIONS.md` ne l'ont pas été** — alors que `CLAUDE.md` **§12.4** point 1 le
> demande à **chaque** fin de session. C'est exactement le **défaut de propagation** décrit au §1.


---

# ⚖️ ARBITRAGE DE **R-092** ET **R-093** — les deux derniers problèmes sans rattachement *(2026-08-19, soir)*

> **Objectif de la session** : avant d'ouvrir le chantier suivant, **résoudre proprement la situation
> des deux problèmes du registre qu'aucun chantier ne portait**. Analyse en lecture seule, puis
> arbitrage, puis formalisation.
> **Résultat** : ✅ **R-092 rejoint C-015** · ✅ **R-093 devient le chantier C-031** · 🛡️ une **règle
> de protection provisoire** entre dans C-015 · ✅ **`PLAN.md` §12 corrigé**. **Décision : D-037.**

**Point de départ** : `main` = `origin/main` = **`74ef231`**, arbre propre.
⚠️ **Aucune ligne de code, aucun test, aucune colonne. R-092 et R-093 restent NON CORRIGÉS.**

---

## 1. Ce que l'analyse a vérifié dans le code — et non repris de `RISQUES.md`

**R-093 — l'affirmation « écrit par position, lit par nom »** :

| Vérification | Résultat |
|---|---|
| La lecture publique se fait bien par nom | 🟢 **OUI** — `lireOngletSimple` associe chaque valeur à **l'en-tête réel du classeur** |
| L'écriture se fait bien par rang | 🟢 **OUI** — `colMatchs()` → `ENTETES.Matchs.indexOf(nom) + 1`, **l'ordre du code**, 13 usages |
| Le code organise-t-il leur désaccord ? | 🟢 **OUI** — `assurerColonnesMatchs` ajoute les colonnes manquantes **à droite** |
| ⚡ **Le chemin d'écriture du score lit-il par nom ?** | 🔴 **NON — il lit AUSSI par rang** *(`objetDepuisLigneMatch`)*, et c'est lui qui alimente **les six garde-fous**. L'énoncé de la fiche n'est vrai **que des lectures publiques** |
| Portée réelle | ⚡ **plus large que `Matchs`** : `assurerColonnesEquipes` porte **le même schéma**, son commentaire le dit |
| C-012 en est-il la cause ? | 🟢 **NON — révélateur, pas créateur** : les écritures existaient au point de départ `4af5003`, et **13 usages avant comme après** |
| Atteignable en production ? | 🟢 **NON aujourd'hui** — les 8 compteurs ajoutés le 2026-07-31 à **12 h 51**, `arbitre` **en dernier** à **16 h 31** : l'ordre canonique a été **reproduit** |
| Erreur détectable ? | 🔴 **NON — silencieuse.** L'écriture réussit, la relecture par nom renvoie la valeur sous un autre nom. **Aucune exception** |

> 💡 **Le remède existe déjà dans le projet, sur un AUTRE onglet** : `assurerOngletSponsors` compare
> les en-têtes **rang par rang** et réécrit la ligne si l'ordre diverge.
> 🔴 **Mais il ne doit pas être recopié tel quel** : il **renomme sans déplacer les données**. Sur un
> `Matchs` désordonné **contenant des scores**, il changerait un décalage en **corruption
> définitive**. C'est la contrainte n° 1 de C-031.

**R-092 — les trois chemins d'invalidation** : 🟢 confirmés *(pas de branche « sinon » dans
`enregistrerScore` · `invaliderMatchAval` · `majPetiteFinale`)*. ⚡ **Deux nuances trouvées** :
la réinitialisation **générale** du tournoi, elle, **efface bien** le détail *(`viderDonnees`)* ; et
le consommateur cité par la fiche côté serveur, `essaisConnusEquipe`, est **défini et testé mais
jamais appelé** — le vrai consommateur est son **miroir dans le navigateur**.

---

## 2. La question qui décidait de l'ordre : C-015 doit-il ajouter une colonne ?

**Réponse : AUCUNE COLONNE NOUVELLE N'EST IMPOSÉE PAR C-015 — mais le choix de conception du
forfait reste à faire.** ⚠️ C'est une nuance, pas une formule de prudence : *« aucune n'est
imposée »* n'est **pas** *« il n'y en aura pas »*. **Trois** des cinq fonctionnalités ne peuvent
structurellement pas en créer ; pour le **forfait** et l'**annulation**, une colonne dédiée reste
une **option de conception ouverte** — c'est précisément ce que la règle 🛡️ encadre.

| Fonctionnalité | Donnée nouvelle ? | Colonne ? |
|---|---|---|
| Plafond de score *(D-012)* | 🟢 aucune — c'est une **validation** | 🟢 **non**, certain |
| Départage *(D-014)* | 🟢 aucune — **calculé**, jamais stocké | 🟢 **non**, certain |
| Déplacement de match *(D-013)* | 🟢 aucune — on **modifie** `heure_debut`, `heure_fin`, `terrain` | 🟢 **non**, certain |
| **Forfait** *(D-011)* | **oui** : l'état + **quelle équipe** | 🔵 **non établi** — `statut` peut le porter |
| **Annulation** *(D-015)* | oui : une valeur de plus | 🔵 **non** — *« deux libellés, un seul mécanisme »* |

> 🟢 **Pourquoi une donnée nouvelle est bien nécessaire pour le forfait** : `calculerClassement`
> déduit victoire/nul/défaite **de la seule comparaison des scores**, et ignore tout match sans
> score. Or D-011, amendée par Romain, supprime le score. **C'est l'état qui doit porter la
> victoire** — la décision l'avait annoncé.
>
> ⚡ **Le vrai risque n'est donc pas « une colonne nouvelle », c'est « une colonne AU MILIEU »** —
> par exemple `forfait` placée à côté des scores **par souci de lisibilité**. D'où la règle
> provisoire : elle **n'interdit pas** d'ajouter une colonne, elle impose **où** la mettre. ⛔ **Le
> choix du support de l'état forfait — `statut` enrichi, colonne dédiée, ou autre — n'est PAS
> tranché**, et il appartient à la conception de C-015.

---

## 3. Les décisions de Romain — **D-037**

| | Décision |
|---|---|
| **R-092** | **Rattaché à C-015** — *« toute invalidation d'un résultat efface également les données détaillées devenues périmées »* |
| **R-093** | **Chantier autonome C-031** — périmètre **non limité à `Matchs`** : `Equipes` porte le même schéma |
| **Ordre** | **C-015 reste le prochain chantier à ouvrir** ; R-093 **n'est pas** un préalable bloquant |
| **La règle** | Aucune colonne nouvelle **au milieu** ; si `Matchs` en a besoin, **à la fin de `ENTETES.Matchs`** |
| **La limite** | ⛔ *« Cette règle protège C-015 mais ne referme pas R-093. »* |

**Sur la priorité de R-092** : ⚠️ **elle reste « à confirmer », et elle n'a pas été inventée.** Le
critère de **D-C012-2** *(P2 si la combinaison « tir au but + Coupe » est impossible, P1 sinon)* a
reçu **la moitié de sa réponse** : 🟢 le code **n'exclut pas** la combinaison, et ⚡ **D-034 a rendu
le format Coupe de nouveau proposé** le 2026-08-19 — il était **masqué** le jour où D-C012-2 a été
prise. 🔵 **Reste inconnu** : si une catégorie a réellement `tir_au_but = OUI`, donnée qui vit
**dans le classeur, pas dans le dépôt**. ✅ **Ce n'est plus bloquant** : rattaché à C-015 *(P1)*,
R-092 en suit le calendrier.

> 🎯 **La leçon de méthode de cette session** : *une question laissée ouverte par un chantier a reçu
> la moitié de sa réponse d'un AUTRE chantier, trois jours plus tard, sans que personne l'ait
> cherché.* **D-034 a déplacé une barrière dont R-092 dépendait.** C'est ce qu'un registre est censé
> attraper — et il l'a attrapé.

---

## 4. État à la fin de la session

| | |
|---|---|
| **Documents modifiés** | `PLAN.md` · `RISQUES.md` · `DECISIONS.md` · `ETAT.md` · `SESSIONS.md` — **documentation de suivi uniquement** |
| **Nouveau chantier** | **C-031** — *« les colonnes du classeur : une seule façon de les désigner »*, **IDENTIFIÉ**, solution **non conçue** |
| **Couverture du plan** | ✅ **31 chantiers, 93 problèmes, aucun sans situation connue** |
| **R-092 · R-093** | ⛔ **NON CORRIGÉS** — seul leur **rattachement** a changé |
| **Prochaine session** | **C-015**, dont la **conception n'est pas commencée**. ⚠️ Elle devra respecter la règle 🛡️ et traiter **R-092** dans le même lot |

> ⚠️ **Documents ACTIFS vérifiés** *(`CLAUDE.md` §12.4, point 2)* : **aucun ne devient faux.**
> `README.md`, `docs/architecture.md`, `backend/README.md` et `CHANGELOG.md` décrivent le produit ;
> cette session n'a touché ni comportement, ni écran, ni action serveur, ni état de déploiement.
> **Aucune entrée de `CHANGELOG` n'est requise** : personne qui utilise l'application ne le
> remarquerait.

---

# 🛡️ OUVERTURE DU CHANTIER **CONFIANCE** — CF-0 et CF-1 *(2026-08-19, nuit)*

> **Objectif de la session** : Romain **met C-015 en pause** et ouvre un chantier prioritaire —
> **Confiance : cybersécurité + juridique de l'existant**. Deux étapes ont été autorisées, l'une
> après l'autre : **CF-0** *(vérifier les référentiels à leur source)* puis **CF-1** *(poser le
> cadre documentaire)*.
> **Résultat** : ✅ **CF-0 terminée** — 18 sources primaires, **9 hypothèses corrigées**, 3 textes
> **formellement écartés** · ✅ **CF-1 terminée** — 🆕 `REFERENTIELS.md`, `CLAUDE.md` **§8
> quinquies**, `PLAN.md` **§14**. **Décision : D-038.**

**Point de départ** : `main` = `origin/main` = **`d5a6c64`**, arbre propre *(vérifié deux fois : au
lancement, puis à nouveau avant la première écriture)*.
⛔ **Aucune ligne de code, aucun test, aucune configuration, aucun déploiement.**

---

## 1. La méthode imposée par Romain, et pourquoi elle a payé dès le premier jour

Romain a posé, **avant toute analyse**, une **chaîne de preuve** en dix points : *référentiel
officiel → applicabilité → état réel → écart → qualification → solution proportionnée → exécution →
contrôle après exécution → contrôle Git → contrôle du dépôt publié.*

La session s'est déroulée en **trois temps**, chacun autorisé séparément :

| Temps | Ce qui était autorisé | Ce qui en est sorti |
|---|---|---|
| **Reconnaissance** | **Lecture seule**, aucune modification | Cartographie cyber et données · 15 référentiels **proposés de mémoire** |
| **CF-0** | Consulter les sources, **rien modifier** | ⚡ **6 des 15 référentiels étaient faux, périmés ou mal calibrés** |
| **CF-1** | Documentaire uniquement | Le cadre : source unique, règle, fiches |

> 🎯 **La leçon de la session, et elle vaut plus que son contenu.** La reconnaissance avait produit
> une liste de référentiels **d'apparence sérieuse**. En allant les lire, **un tiers était
> inutilisable**. ⛔ **Sans CF-0, Maxilou aurait été corrigé contre des textes inexistants** — et le
> travail aurait été **indéfendable devant un tiers**, quelle qu'en soit la qualité technique.

---

## 2. CF-0 — ce que la lecture des textes a corrigé

**18 sources primaires consultées** *(Légifrance, CNIL, EUR-Lex, ANSSI, documentation Google et
GitHub, OWASP)*. Le détail complet vit dans **[`REFERENTIELS.md`](REFERENTIELS.md) §8** ; voici les
corrections les plus lourdes :

| Hypothèse de la reconnaissance | Ce que le texte réel a montré |
|---|---|
| *« Position de la CNIL sur Google Fonts »* | 🔴 **Elle n'existe pas.** Aucun document de la CNIL ne traite du sujet ; la jurisprudence connue est **allemande**. ⚠️ **Une source avait été inventée** |
| *« Recommandation CNIL 2020-092 »* | ⚡ **Périmée** — modifiée par la **délibération 2025-131 du 18/12/2025** |
| *« LCEN art. 6-III »* | ⚡ **Périmée** — les mentions légales sont à l'**art. 1-1** depuis le **23/05/2024**. L'art. 6-III parle aujourd'hui de **contrôle parental et de tabac** |
| *« Guide d'hygiène ANSSI, 42 mesures »* | ⚠️ **Mal calibré** *(conçu pour des SI d'entreprise)* ; et le guide ANSSI/CPME envisagé en remplacement est **marqué obsolète par l'ANSSI** |
| *« Moins de 250 personnes ⇒ pas de registre »* | 🔴 **Faux** — l'exemption tombe si le traitement **n'est pas occasionnel** |
| *« ASVS niveau 1 »* | ⚡ Version **5.0.0** ; **le niveau 1 ne prouve aucune conformité** |

**Deux référentiels manquaient**, et le second était le mieux calibré de tous :

- ⭐ **CNIL — dispositif « Sport amateur (hors contrat) et RGPD »** : il vise *« les structures du
  sport amateur, essentiellement des associations »* et traite nommément des données des
  *« sportifs **d'une équipe adverse** »*. 🏉 **C'est exactement la situation de Maxilou** ;
- **Documentation GitHub Pages** : elle **interdit expressément** l'usage en SaaS commercial — sans
  effet aujourd'hui, mais c'est une contrainte réelle sur la vision future.

**Trois textes formellement écartés**, avec leur démonstration : **NIS 2** *(hors annexes, hors
seuils, et **loi de transposition française non promulguée**)* · **Cyber Resilience Act** *(Maxilou
n'est **pas mis sur le marché**)* · **RGAA** *(l'art. 47 **exclut expressément** les organismes de
droit privé à but non lucratif)*.

---

## 3. ⭐ Le constat qui a réorganisé tout le chantier

En cherchant à établir qui était responsable du traitement, la session a relu ce que le dépôt
disait déjà des données réellement présentes :

| Ce qui est établi | Où |
|---|---|
| **Le tournoi en base est fictif** — vrais noms de clubs, engagements inventés | `ETAT.md` **I-04**, levé le 2026-08-04 |
| **Le classeur ne contient aucune donnée personnelle de tiers** *(seules adresses : Romain et son épouse, pour tester)* | `ETAT.md` **I-03 + I-04** |
| **Aucune journée réelle n'a jamais été jouée** | `RAPPORT-AUDIT.md` §7 |

➡️ **Conséquence** : le traitement que le chantier doit protéger **n'a pas encore commencé**. La
formule était déjà écrite dans `ETAT.md` depuis le 2026-08-04 — *« la question n'est pas "faut-il
réparer", mais "faut-il préparer" »*.

⚡ **Trois « obligations » présentées comme des manquements dans la reconnaissance sont en réalité
des PRÉREQUIS** *(information des personnes, registre, mesure de visibilité)*. **Un seul écart est
réel et actuel** : les **mentions légales** — parce qu'elles ne dépendent d'aucune donnée
personnelle, mais de la seule **publication** d'un service en ligne.

---

## 4. Les réponses de Romain — **D-038**

| Question | Sa réponse, et ce qu'elle change |
|---|---|
| **Q1 — responsable du traitement** | ⛔ **Ne pas conclure qu'il l'est** parce qu'il développe et publie. Les données réelles seront traitées pour l'**EDR**, **Génération R92**, **ou les deux** — répartition **non définie**. ⭐ **[R1] art. 4(7) le confirme** : le critère est *« qui détermine les finalités et les moyens »* |
| **Q2 — compte Google** | Gmail **personnel gratuit** aujourd'hui, ⭐ **mais ce n'est pas l'architecture cible**. Piste établie : **Google Workspace for Nonprofits, gratuit**, couvert par le **CDPA** |
| **Q3 — mesure de visibilité** | Garder la **valeur métier**, pas le mécanisme. ✅ **« Visites » peut remplacer « personnes »** si cela supprime la persistance sur le terminal |

⚡ **Un point de contexte décisif, apporté par Romain** : *« je développe actuellement Maxilou de ma
propre initiative. L'EDR et Génération R92 ne m'ont pas commandé ce logiciel. »* Il n'existe **aucune
échéance** : ni tournoi réel, ni invitation, ni mise en production.
➡️ **Ce fait est devenu une interdiction permanente** *(`CLAUDE.md` §8 quinquies)* : ⛔ **ne jamais
attribuer à ces structures une décision qu'elles n'ont pas prise.**

---

## 5. CF-1 — ce qui a été écrit

| Fichier | Ce qui a changé |
|---|---|
| 🆕 **`REFERENTIELS.md`** | **Créé** — la source unique : 16 référentiels applicables, 3 écartés, 7 obligations, 5 recommandations, bonnes pratiques et durcissements **séparés**, la table **mesure ↔ référentiel**, et le **journal des vérifications** |
| **`CLAUDE.md`** | **§8 quinquies** *(règle de la mesure complète)* · sommaire · **§12.2 : 8 → 9 fichiers de suivi** · une ligne au tableau *« lequel ouvrir »* |
| **`PLAN.md`** | **§14** — le chantier, ses 11 zones, les fiches **CF-0 → CF-13**, l'ordre et les dépendances |
| **`ETAT.md`** | En-tête · §1 · §2 *(la note des chantiers hors audit)* · §4 |
| **`DECISIONS.md`** | **D-038** |
| **`SESSIONS.md`** | Cette entrée |

**Le choix d'architecture, et sa raison** : ⭐ **un seul document nouveau.** Le dépôt possédait déjà
8 fichiers de suivi qui font exactement ce travail — état, plan, risques, décisions, journal. **Les
dupliquer aurait été précisément l'erreur que la règle de la source unique interdit.** Le chantier
Confiance n'avait besoin que d'une chose inexistante : **le lien entre une mesure et le texte qui la
fonde**.

### ⚡ Ce que le contrôle de cohérence a trouvé — et il a servi dès sa première application

Le contrôle des documents actifs entre eux *(contrôle ⑫ de la chaîne)* a relevé une **tension de
lecture** que rien n'avait signalée jusque-là :

> **C-005** *(`PLAN.md`)* et **D-018** écrivent *« responsable : **Génération R92** »*. **D-038**
> écrit que le responsable du traitement **n'est pas déterminé**.

🎯 **Ce n'est pas une contradiction**, et la vérification l'a établi : ces deux mentions constatent
ce que la page RGPD **du site vitrine** affiche déjà — le responsable **de ce site**, pas celui du
traitement de Maxilou. C-005 porte d'ailleurs lui-même la réserve *(« déclaration en cours »,
D-021)*. ⭐ **Et le livrable réel, `textes-information-donnees.md`, ne nomme personne** : il écrit
`[ASSOCIATION ORGANISATRICE]` **entre crochets** et désigne le responsable **par son rôle**.

✅ **Action retenue, et elle est proportionnée** : ⛔ **ne rien modifier dans C-005 ni D-018** — ce
sont des constats **vrais à leur date**, et la règle interdit de réécrire les traces passées.
L'écart est **inscrit dans D-038**, qui fait foi sur ce point. **Une source, une adresse.**

### ⚡ Une dette de source détectée — et **soldée avant le premier commit**

Le contrôle des sources *(contrôle ④ de la chaîne)* a relevé que la fiche **[R11]** *(transferts
hors UE)* s'appuyait, pour l'arrêt *Latombe*, sur un **média spécialisé** — ⛔ **exactement ce que
la hiérarchie des sources du chantier interdit** lorsqu'une source primaire existe.

⚠️ **Romain a refusé le commit tant que cette dette n'était pas soldée**, et il a eu raison : la
recherche a livré **davantage** que le lien manquant.

| Ce qui a remplacé la source secondaire | Nature |
|---|---|
| **L'arrêt lui-même** — Tribunal *(dixième chambre élargie)*, 3 septembre 2025, **T-553/23**, **`ECLI:EU:T:2025:831`** *(EUR-Lex, CELEX 62023TJ0553)* | ⭐ **Source primaire** |
| **La communication du pourvoi au JOUE** — **C-703/25 P**, formé le **31 octobre 2025**, 4 moyens *(CELEX 62025CN0703)* | ⭐ **Source primaire** |
| **Le communiqué CJUE n° 106/25** du 3 septembre 2025 | Source d'appoint, ⚠️ **qualifiée comme telle** : elle porte elle-même la mention *« Document non officiel à l'usage des médias »* |

⭐ **Le lien IAPP a été SUPPRIMÉ** : il n'apportait rien que les sources primaires ne donnent.

🎯 **Et la lecture du texte a apporté une nuance que le média n'avait pas** : le Tribunal confirme
l'adéquation **« à la date d'adoption de la décision attaquée »**, et rappelle que la Commission
doit suivre le cadre **en permanence**, avec le pouvoir de *« suspendre, modifier ou abroger »* sa
décision. ⛔ **Ce n'est pas un blanc-seing définitif** — ce qui renforce le classement de **CF-13**
en durcissement **de prudence**.

⚠️ **Ce qui reste, et ce n'est pas une dette de source** : **l'issue** du pourvoi n'a pas pu être
lue à sa source *(la fiche procédurale d'InfoCuria est une page dynamique)*. Le fait **sourcé** est
que le pourvoi **a été formé** ; son issue est **INCONNUE**, et la fiche **[R11]** le dit — à
vérifier avant **CF-13**.

---

## 6. ⛔ Ce que cette session NE fait PAS

> - ❌ **Aucune ligne de code**, aucun test, aucune configuration, aucun déploiement ;
> - ❌ **Aucune clé changée** — ⚠️ **CF-8 était initialement proposée en première étape ; Romain l'a
>   refusée** tant que sa chaîne de preuve n'est pas constituée. ⭐ *« Même si une correction te
>   paraît évidente ou réalisable en cinq minutes, elle attendra »* ;
> - ❌ **Aucun compte créé**, aucune démarche engagée auprès d'un fournisseur ;
> - ❌ **Aucun problème corrigé** — R-014 → R-040 restent dans l'état où l'audit les a laissés ;
> - ❌ **Aucune décision attribuée** à l'EDR ou à Génération R92 ;
> - ❌ **C-015 n'est ni poursuivi, ni modifié, ni anticipé.**

---

## 7. État à la fin de la session

| | |
|---|---|
| **Documents modifiés** | `REFERENTIELS.md` *(créé)* · `CLAUDE.md` · `PLAN.md` · `ETAT.md` · `DECISIONS.md` · `SESSIONS.md` — **documentation uniquement** |
| **Nouveau chantier** | 🛡️ **Confiance**, hors plan d'audit — **CF-0 et CF-1 terminées**, **CF-2 → CF-13 non lancées** |
| **Nouveau fichier de suivi** | **9ᵉ** — `REFERENTIELS.md`, inscrit à `CLAUDE.md` **§12.2** |
| **Écart réel et actuel trouvé** | ⚡ **Un seul** : les **mentions légales** *(CF-4)*. Tout le reste est un **prérequis** |
| **Prochaine session recommandée** | **CF-2** — préparer le **dossier** de détermination du responsable du traitement. ⚠️ **Un dossier, pas une décision**, et à ne présenter qu'au moment de la présentation de Maxilou |

> ⚠️ **Documents ACTIFS vérifiés** *(`CLAUDE.md` §12.4, point 2)* : **aucun ne devient faux.**
> `README.md`, `CHANGELOG.md`, `docs/architecture.md`, `backend/README.md` et `docs/passation.md`
> décrivent le produit et son exploitation ; cette session n'a touché ni comportement, ni écran, ni
> action serveur, ni état de déploiement, ni compte. **Aucune entrée de `CHANGELOG` n'est requise** :
> personne qui utilise l'application ne le remarquerait.
>
> ⏳ **`docs/passation.md` sera concerné par CF-3**, quand l'architecture de compte changera
> réellement — ⛔ **pas avant** : rien n'a bougé.

---

# 📋 CF-2 — LE DOSSIER DU RESPONSABLE DU TRAITEMENT *(2026-08-19, nuit)*

> **Objectif de la session** : produire un **dossier de décision** permettant, le moment venu, à
> l'EDR du Racing Club de France et/ou à l'association Génération R92 de comprendre **qui devra
> décider de l'usage des données** — et ce que chaque configuration implique.
> **Résultat** : ✅ **dossier produit** *(`CF-2-RESPONSABLE-TRAITEMENT.md`)* · ⭐ **2 référentiels
> ajoutés** *(**R20**, **R21**)* · ⛔ **aucune décision prise, aucune structure contactée**.

**Point de départ** : `main` = `origin/main` = **`2cb0b12`**, arbre propre.
⛔ **Aucune ligne de code. Aucun compte créé. Aucune démarche engagée. CF-3 non lancée.**

---

## 1. Le référentiel qui manquait, et ce qu'il a changé

Le RGPD **[R1]** dit *« qui détermine les finalités et les **moyens** »*. ⚠️ **Mais il ne définit
nulle part ce qu'est un « moyen »** — or c'est exactement la question posée par Romain : *où passe
la frontière entre concevoir, administrer, saisir, et décider ?*

⭐ **La réponse est dans [R20]** — lignes directrices **07/2020** du **CEPD**, version **2.0** du
**7 juillet 2021**, qui coupe les moyens en deux :

| | Exemples **donnés par le texte** | Qui décide |
|---|---|---|
| **Moyens ESSENTIELS** | **quelles données** · **combien de temps** · **qui y a accès** · **de qui** | 🔴 Réservés au responsable |
| **Moyens NON ESSENTIELS** | ⭐ **le choix d'un logiciel ou d'un matériel** · les mesures de sécurité détaillées | ✅ Peuvent être laissés à un prestataire |

> ⚠️ **Mais la première rédaction en avait tiré une conclusion trop large**, et Romain l'a arrêtée
> avant le commit : *« concevoir Maxilou — ou choisir de l'utiliser — ne rend responsable de rien »*.
> ⛔ **C'était faux dans sa seconde moitié**, et **[R21]** le dit littéralement :
>
> > *« Même si un acteur choisit un **"traitement sur étagère"**, défini à l'avance, **il peut être
> > considéré comme responsable du traitement dès lors qu'il effectue ce choix au regard de ses
> > besoins**. »*
>
> ⭐ **La formulation retenue tient les deux bouts** : concevoir techniquement ou choisir un logiciel
> **ne suffit pas à soi seul** ; **décider de l'utiliser pour ses propres finalités**, si.

**[R20]** apporte deux autres appuis décisifs : *« le rôle ne découle pas de la nature d'une entité
mais de ses **activités concrètes** »*, et — conformément à l'**art. 29** — les personnes qui
accèdent aux données **au sein** d'un organisme **ne sont ni responsable ni sous-traitant**.

**[R21]** *(fiche CNIL)* complète par des **questions pratiques** formulées pour des non-juristes,
et par une exigence que le dossier applique : ⭐ *« tracer le raisonnement et la justification »* de
la qualification.

---

## 2. ⚠️ Un point de fait que l'analyse a mis au jour

En appliquant la grille des **moyens essentiels**, un constat s'impose : **plusieurs d'entre eux ont
déjà été arrêtés pendant le développement, par Romain seul.**

| Moyen essentiel | Où il est déjà tranché |
|---|---|
| **Quelles données** sont demandées à un club | Structure du classeur |
| **Combien de temps** on les garde | **D-020** · `conservation-donnees.md` |
| **Qui y a accès** | Liste blanche des vues publiques · jeton par club |
| **De qui** — des adultes, ⭐ **aucune donnée nominative d'enfant** | `textes-information-donnees.md` §2 |

> ⛔ **Ce que ce constat NE dit PAS** : il ne fait de Romain le responsable de rien. **Aucun
> traitement de données réelles n'existe** *(I-03, I-04)* — on ne peut pas être responsable d'un
> traitement qui n'a pas commencé. Ce sont des **choix de conception sur données fictives**.
>
> ⭐ **Ce qu'il dit, et c'est utile** : ces choix **redeviendront des décisions au sens du RGPD** le
> jour où de vraies données entreront. Une structure devra alors **les reprendre à son compte, ou
> les changer**. ✅ **Ils sont tous écrits, donc tous révisables** — c'est précisément ce que le
> travail documentaire des chantiers précédents rend possible.

---

## 3. Une question de fait ouverte — et une conclusion hâtive écartée

La première rédaction affirmait : *« [R1] exige une personne physique ou morale ; si l'EDR n'a pas de
personnalité morale, le responsable serait le club »*. ⛔ **Romain a demandé de la réexaminer, et
elle était fausse.**

**Ce que le texte dit réellement** : l'**art. 4(7)** vise *« la personne physique ou morale,
l'autorité publique, **le service ou un autre organisme** »*, et **[R20]** en tire qu'*« en principe,
il n'existe **aucune limitation quant au type d'entité** »* pouvant être responsable. ⚠️ *(La portée
du mot « organisme » pour une entité sans personnalité juridique a été soulevée en consultation
publique du CEPD et **reste discutée**.)*

✅ **La réserve juste, et elle est pratique** : ⭐ **l'entité juridique qui porte l'École de Rugby
doit être identifiée avant toute qualification définitive** — parce qu'il faudra pouvoir **signer**,
**ouvrir un compte** et **répondre**. ❓ **INDÉTERMINÉ** — question **Q-I**.

## 3 bis. La troisième nuance : « saisir sur instruction » n'est pas un blanc-seing

La première rédaction posait : *« saisir sur instruction → rien, art. 29 »*. ⚠️ **Vrai seulement si
l'intervention est INTERNE.** **[R21]** vise nommément le cas inverse :

> *« Le **développeur d'une application** doit être qualifié de **sous-traitant** lorsqu'il réalise
> des opérations sur des données […] à des fins de **maintenance ou d'infogérance**. »*

Et il donne le contre-exemple qui borne l'autre côté : *« les **fabricants** de matériels
(**logiciels**…) **ne sont pas des sous-traitants** puisqu'ils **n'ont pas accès** »*.

⭐ **Le §6 du dossier a donc été refait** : il compte désormais **cinq rôles** — le cinquième,
**responsable ou responsable conjoint**, manquait alors que **§3.3 en posait le fait déclencheur**.
⚠️ **Et sa conclusion contenait une erreur de comptage** : *« trois des quatre rôles ne font ni
responsable ni sous-traitant »*. **C'est deux sur cinq.**

---

## 4. Ce que le dossier contient

📋 **[`CF-2-RESPONSABLE-TRAITEMENT.md`](CF-2-RESPONSABLE-TRAITEMENT.md)**, en 9 sections :

| § | Contenu |
|---|---|
| **0** | L'état réel — développement personnel, données fictives, **aucune adoption** |
| **1** | La question, en une phrase |
| **2** | Pourquoi elle existe, et pourquoi il faut y répondre **avant** le premier vrai tournoi |
| **3** | ⭐ **La frontière** : les 4 gestes *(concevoir · administrer · saisir · décider)* et ce que chacun emporte |
| **4** | Les 3 configurations, une fiche chacune |
| **5** | **17 conséquences comparées** en un tableau |
| **6** | Les **4 rôles possibles de Romain**, chacun avec ses **conditions**, ce qui est **vérifié**, et ce qui **dépend d'une décision future** |
| **7** | **Ce qui ne change pas** — 5 choses qui ne décident rien, 5 qui restent vraies |
| **8** | **11 questions** pour trancher, construites depuis **[R20]** et **[R21]** |
| **9** | 🔲 **La case de décision — VIDE, et elle doit le rester** |

⭐ **Une quatrième option a été ajoutée à la case** : *« Aucune des deux ne souhaite utiliser
Maxilou »*. **C'est une réponse possible, et le dossier le dit** — ne pas l'offrir serait présumer
de l'adoption.

---

## 5. ⛔ Ce que cette session NE fait PAS

> - ❌ **Elle ne décide pas** qui sera responsable — la case du §9 est **vide** ;
> - ❌ **Elle ne contacte aucune structure**, et ⛔ **n'attribue aucune décision à l'EDR ou à
>   Génération R92** ;
> - ❌ **Elle ne qualifie pas définitivement le rôle de Romain** : les 4 possibilités sont
>   présentées **avec leurs conditions**, et trois d'entre elles dépendent d'une organisation qui
>   n'existe pas encore ;
> - ❌ **Aucun compte créé, aucune démarche Google engagée, aucune ressource transférée** ;
> - ❌ **Aucune ligne de code, aucune configuration, aucun déploiement** ;
> - ❌ **CF-3 n'est pas lancée.**

---

## 6. État à la fin de la session

| | |
|---|---|
| **Documents modifiés** | 🆕 `CF-2-RESPONSABLE-TRAITEMENT.md` *(créé)* · `REFERENTIELS.md` · `PLAN.md` · `ETAT.md` · `SESSIONS.md` |
| ⛔ **Documents volontairement NON touchés** | **`DECISIONS.md`** — ⭐ **CF-2 ne décide rien**, y ajouter une entrée laisserait croire le contraire · **`CLAUDE.md`** — le nouveau document est un **livrable de chantier**, pas un fichier de suivi *(même statut que `C-012-SPECIFICATION.md`, qui n'est pas non plus en §12.2)* |
| **Référentiels ajoutés** | **R20** *(CEPD, LD 07/2020 v2.0)* · **R21** *(fiche CNIL)* — vérifiés à leur source et journalisés |
| **Preuve de clôture CF-1** | ✅ **Complétée avec le SHA `2cb0b12`** dans la table §7 de `REFERENTIELS.md` — sans micro-commit dédié, comme demandé |
| **Décision obtenue** | ⛔ **AUCUNE — et c'est le résultat attendu** |
| **Prochaine session recommandée** | **CF-4** *(mentions légales)* — ⭐ **le seul écart réel et actuel**, et il ne dépend d'aucune donnée personnelle |

> ⚠️ **Documents ACTIFS vérifiés** *(`CLAUDE.md` §12.4, point 2)* : **aucun ne devient faux.**
> `README.md`, `CHANGELOG.md`, `docs/architecture.md`, `backend/README.md` et `docs/passation.md`
> décrivent le produit et son exploitation ; cette session n'a touché ni comportement, ni écran, ni
> action serveur, ni compte, ni état de déploiement.
>
> ⏳ **`docs/passation.md` sera concerné par CF-3**, quand l'architecture de compte changera
> réellement — ⛔ **et CF-3 est suspendue à une décision qui n'est pas prise.**

---

# Session — CF-4b : la neutralisation institutionnelle (cadre et premier lot)

**Date** : 2026-08-19 *(nuit, 3)* · **Point de départ** : `5907bce` · **Point d'arrivée** : voir §7

## 1. Ce qui a ouvert cette session

La session précédente avait clos **CF-2** et recommandé **CF-4** *(mentions légales)*. En
l'instruisant, deux objets distincts sont apparus sous un seul numéro :

| | |
|---|---|
| **Ce qu'il faut publier** | Les mentions légales, au titre de **[R10]** → devient **CF-4a** |
| **Ce qu'il faut cesser d'affirmer** | Les attributions institutionnelles → devient **CF-4b** |

⭐ **Et l'ordre s'est imposé de lui-même** : on ne peut pas rédiger des mentions légales exactes sur
un site qui s'attribue par ailleurs à une structure n'ayant rien décidé. **CF-4b passe d'abord.**

## 2. Ce que la cartographie a trouvé

**Deux surfaces**, et la seconde a dû être ajoutée après coup — la première passe ne regardait que
l'application :

| Surface | Volume |
|---|---|
| ① **L'application publiée** | **107 points de code**, 8 ressources graphiques, 9 liens institutionnels |
| ② **Le dépôt GitHub public actif** | **~46 points**, 7 documents |

✅ **Les paramètres du dépôt sont vierges** — description, site, sujets, licence, wiki, tickets,
versions : tous vides ou absents. **Rien à neutraliser dans la vitrine GitHub elle-même.**

✅ **Le nom « Maxilou » est absent** du code et de la documentation active *(82 occurrences, toutes
dans les fichiers de suivi)*. **Rien à faire.**

### 🔴 Ce que la cartographie n'aurait pas dû rater — et qui n'était visible dans aucun texte

`frontend/assets/autorisation-droit-image-template.docx` est un **fichier binaire zippé** :
**aucune recherche textuelle ne pouvait l'atteindre**. Il a fallu l'ouvrir pour découvrir qu'il ne
s'agissait pas d'un modèle inerte mais d'un **document juridique en quatre articles** :

- il désignait une association comme **organisatrice** du tournoi ;
- il lui faisait **céder par les clubs des droits sur l'image de joueurs mineurs** ;
- il lui confiait le **traitement des demandes de retrait** ;
- et il était **téléchargeable par n'importe qui**, sans clé, sur GitHub Pages.

⚠️ **Trois attributions de décisions non prises**, dans un document public. C'est ce qui a fait de
sa suppression le **lot L1**, isolé et prioritaire.

## 3. ⚡ La découverte de méthode — un « 0 occurrence » qui était faux

En cherchant un prénom dans le dépôt, la commande a répondu **0**. Le prénom y figurait **10 fois**.

```
locale absente          : grep -niE "j[ée]r[ée]my"  →  0   ❌
LC_ALL=en_US.UTF-8      : idem                      →  10  ✅
```

**Sans locale UTF-8, `grep` sur une classe de caractères accentués renvoie un résultat vide au lieu
d'échouer.** Un faux négatif **parfaitement silencieux**.

> 🎯 **Pourquoi c'est grave ici.** Le contrôle final de CF-4b repose **entièrement** sur des
> recherches. Une recherche qui répond « 0 » parce que la locale est mal réglée produit **exactement
> le même résultat visuel** qu'un dépôt réellement propre. ⛔ **CF-4b aurait pu être déclarée
> terminée sur une preuve vide** — même mécanisme que le piège `616/616` de `deploiement.md`.

Toutes les recherches ont été refaites. **Quatre occurrences institutionnelles réelles avaient été
manquées**, dont ⭐ `frontend/js/tournoi.js:394`, qui **réécrit le titre de la page publique après
le chargement** : corriger le HTML sans corriger cette ligne n'aurait **rien changé de visible**.

## 4. Les décisions obtenues

**D-039**, quinze arbitrages. *(Le détail vit dans `DECISIONS.md` — il n'est pas recopié ici.)*

Trois méritent d'être rappelées, parce qu'elles **limitent** le chantier :

| | |
|---|---|
| ⏸️ **Le nom du dépôt `tournoi-r92`** | **Conservé.** Le renommer casserait les liens à jeton déjà envoyés. **Réserve d'infrastructure assumée — n'empêche pas CF-4b de fermer** |
| ⏸️ **Les identifiants CSS `--r92-*`** *(~130)* | **Conservés.** Invisibles pour l'utilisateur ; les renommer serait un risque de régression sans bénéfice |
| 🔧 **M1** | Les valeurs institutionnelles du **classeur** *(`url_site_association`, `url_instagram`)* — ⚠️ **le code est déjà neutre**, seules les données pointent quelque part. **Opération manuelle, hors Git, sur autorisation explicite** |

## 5. ⚠️ Une contrainte technique enregistrée pour plus tard

`frontend/js/tournoi.js:216` fait `document.getElementById('don-lien').hidden = !pub;` **sans test
d'existence**. ⛔ **Retirer le seul HTML du bandeau de don casserait la page publique au
chargement** — et `node --check` **ne le verrait pas** : il vérifie la syntaxe, jamais l'exécution.
**Le lot L3 exigera un contrôle d'exécution ciblé.**

## 6. Vérification demandée : « retrait décidé par le club »

`RISQUES.md` **R-036** affirme un *« retrait décidé par le club le 2026-08-03 »*. Cette attribution
a été **remontée à sa source primaire**, sans se fier à la mémoire :

| | |
|---|---|
| **Source** | Commit **`2c52b15`** *(2026-08-03 14:35, PR #153)* |
| **Ce qu'il dit** | *« Demande du club : "on enlève pour le moment tout ce qui concerne le droit à l'image". »* |
| **Corroboration** | Entrée `CHANGELOG.md` du même jour : *« Sur décision du club »* |
| **Verdict** | ✅ **DÉMONTRABLE — formulation conservée** |
| ⭐ **Et un point en sa faveur** | La source **ne nomme aucune structure**. *« Le club »* n'est ni « Génération R92 » ni « l'École de Rugby » : **aucune décision n'est attribuée à une entité identifiée**, donc **D-038 n'est pas en cause** |

## 7. État à la fin de la session

| | |
|---|---|
| **Lots faits** | **L0** *(ce cadre)* et **L1** *(suppression du modèle)* — **2 sur 8** |
| **Documents modifiés** | **L1** : `README.md` · `frontend/README.md` · `RISQUES.md` — **L0** : `PLAN.md` · `DECISIONS.md` · `ETAT.md` · `REFERENTIELS.md` · `SESSIONS.md` |
| ⛔ **Document volontairement NON touché** | **`CLAUDE.md`** — L0 ne crée **aucun** fichier de suivi nouveau *(D-039 entre dans `DECISIONS.md`, CF-4b dans `PLAN.md`)*. Sa carte **§12.2** reste **exacte à 9 fichiers** |
| **Code, tests, configuration, déploiement** | ⛔ **Aucun** |
| **Emails, classeur, paramètres GitHub ou Google** | ⛔ **Aucun** |
| **Prochaine étape recommandée** | **L6** — la réécriture générique de `../passation.md` : le seul lot restant qui touche un **tiers réel aujourd'hui** |

> ⚠️ **Documents ACTIFS vérifiés** *(`CLAUDE.md` §12.4, point 2)* : pour **L0**, **aucun ne devient
> faux** — il est strictement documentaire et interne au suivi. Pour **L1**, deux le devenaient et
> ont été corrigés **dans le même lot** : `README.md` *(la carte listait un dossier disparu)* et
> `frontend/README.md` *(il décrivait le modèle comme présent)*.
>
> ⏳ **`CHANGELOG.md` sera concerné par L7**, quand les changements visibles par un utilisateur
> auront réellement eu lieu — ⛔ **L0 et L1 n'en produisent aucun** : le fichier supprimé n'était
> chargé par aucune page.

---

## 8. Lot L6 — la réécriture de `passation.md`

**Le problème, et il n'était pas seulement institutionnel.** Le document ne contenait pas quelques
attributions à corriger : **il était entièrement construit sur une adoption présumée** — *« pour que
l'outil […] devienne 100 % propriété de l'association »*, un domaine cible, une adresse de
messagerie cible, et ⭐ **une personne physique nommée quatre fois**, à qui il attribuait un rôle
d'administrateur futur *(« compte géré par … », « nécessite l'accès de … », « une action de … est
requise »)*.

> 🔴 **Trois problèmes cumulés sur ce seul prénom** : une **décision attribuée** à quelqu'un qui ne
> l'a pas prise · une **donnée personnelle publiée** sur Internet sans base légale ni information de
> l'intéressé *(cela relève autant de **CF-5** que de CF-4b)* · et **invisible de toute recherche
> institutionnelle**, puisqu'un prénom ne contient ni « Racing » ni « R92 ». ⚠️ **Sans la correction
> de locale trouvée pendant la cartographie, il ne serait jamais apparu.**

**La méthode : réécriture d'ensemble, pas remplacement mot à mot** *(arbitrage de Romain)*. Sur ~30
points dans un document de 277 lignes dont c'était le sujet même, le remplacement mécanique aurait
produit un texte incohérent.

### Ce que le document a gagné

| | |
|---|---|
| 🆕 **§0 — Prérequis** | **Sept conditions** avant d'ouvrir le §1, dont ⭐ **la validation du jalon CF-14**. ➡️ **La procédure est désormais inapplicable tant que CF-14 n'a pas eu lieu** — et le document le dit lui-même |
| 🆕 **§0.1 — L'administrateur désigné** | Le rôle est **décrit** *(cinq accès nécessaires, en tableau)* et ⛔ **jamais attribué**. Il peut être tenu par plusieurs personnes |
| 🆕 **§0.2 — Ce que ce document ne décide PAS** | Nom du dépôt, GitHub Pages, domaine, Apps Script : ⏸️ **quatre points explicitement laissés à l'organisation** |
| 🆕 **Trois garde-fous qui manquaient** | 🛟 **sauvegarde du Sheet avant transfert** · 🔒 **révocation des anciens accès** *(avec le rappel que les anciennes clés restent valides tant qu'on ne les a pas remplacées)* · 🛟 **retour arrière** tant que la recette n'est pas close |
| 🔴 **Un avertissement neuf** | **Les liens à jeton déjà envoyés aux clubs contiennent l'URL de base : tout changement d'URL les casse.** Rien ne le disait |
| ⚠️ **Une mise en garde sur l'option B** | Elle laisse le script s'exécuter sous un compte **personnel** en affichant une adresse **institutionnelle** : l'organisation n'a alors la maîtrise **ni du script, ni des données** |

### Ce qu'il n'a pas perdu — vérifié, pas supposé

**25 repères techniques comptés avant/après**, un par un : `SHEET_ID`, `API_URL`, `SNAPSHOT_URL`,
`CLE_ADMIN`, `CLE_SCORES`, `configurerCles`, `configurerRelais`, `autoriserDrive`,
`autoriserEnvoiEmail`, `lancerTestsFFR`, `email_expediteur`, `tournoi_affiche_id`,
*Transfer ownership*, *Enforce HTTPS*, `CNAME`, `MailApp.sendEmail`, `GmailApp.sendEmail`,
`pages.yml`, `worker-tournoi.js`, `SNAPSHOT_KEY`, `Tests.gs`, `Code.gs`, les renvois vers
`deploiement.md` et `relais-cdn.md`, le partage *Restreint*. ✅ **Aucun perdu.** La structure §1 à
§11.4 est **identique**.

### Ce qui reste dans le document, et pourquoi

| Ce qui reste | Justification |
|---|---|
| `RFL974`, `rfl974.github.io`, `tournoi-r92`, `boutique-r92` | ⭐ **Ce sont les SOURCES du transfert et les chaînes exactes à rechercher dans le code** *(§6)*. Les retirer rendrait la procédure **inexécutable**. Le §1 les étiquette *« source »*, face à des destinations *« à déterminer »* |
| `tournoi-r92` en §0.2 | Y figure **comme réserve assumée**, pas comme choix |

⛔ **Retiré, en revanche : l'adresse de messagerie personnelle du développeur.** Elle n'était
**pas nécessaire** à l'exécution — *« un compte Gmail personnel de développement »* suffit, et le
document reste vrai si le compte change.

### Contrôles

| Contrôle | Résultat |
|---|---|
| **Institutionnel** *(locale UTF-8)* | ✅ **0** pour chacun : nom d'association, « Racing », « École de Rugby », domaine, adresse Gmail, prénom, « l'asso », « compte asso » |
| **Fonctionnel** | ✅ 25 repères sur 25 conservés · structure identique |
| **D-039** | ✅ aucune adoption, aucun administrateur, aucun compte, aucun domaine, aucune responsabilité attribués |
| **CF-14** | ✅ la passation est **conditionnée** au jalon d'adoption, et le document rappelle que **CF-14 n'est pas réalisée** |

> ⚠️ **Documents ACTIFS vérifiés** : **aucun ne devient faux.** `README.md` ne décrit `passation.md`
> que par son rôle *(« portabilité : tout transférer »)*, pas par son contenu — vérifié.
> ⛔ **`CHANGELOG.md` non touché** : L6 ne change rien de ce qu'un utilisateur remarquerait.
> ⛔ **`DECISIONS.md` non touché** : L6 **exécute** D-039, il ne décide rien de neuf.

---

## 9. Lot L2 — les textes de l'application

### ⚡ Le recomptage : 50 points, et non 45

Le repère de cartographie annonçait **45**. Le recomptage exhaustif *(locale UTF-8)* en a trouvé
**50**. **Deux causes, et la seconde vaut d'être retenue :**

| Cause | Ce qui manquait |
|---|---|
| **3 commentaires** | `commun-dossier.js:250`, `invitation.js:12`, `perfs.js:14` — la première regex cherchait *« École de Rugby **du Racing** »*, or ces commentaires disent seulement *« l'École de Rugby »* |
| 🔴 **2 champs du fichier `.ics`** | `PRODID` portait `Generation R92` *(déjà repéré)*, mais surtout ⭐ **`UID` portait `@generation-r92`** — ⛔ **introuvable par toute recherche sur « Génération R92 »**, à cause du tiret et de la minuscule |

> 🎯 **La leçon est la même que celle de la locale, sous une autre forme** : *une recherche ne trouve
> que ce que sa formulation permet de trouver.* L'`UID` voyage dans l'agenda de chaque club qui
> importe l'événement — un endroit que personne ne regarde jamais.
>
> ⚠️ **Il a été signalé avant d'être traité**, et rattaché à L2 parce qu'il relève **manifestement du
> même périmètre textuel** *(le fichier calendrier, explicitement dans L2)* — aucune décision
> nouvelle n'était en jeu.

### ⭐ Le piège du titre dynamique — confirmé et traité

`frontend/js/tournoi.js:394` faisait `document.title = (nom || 'Le tournoi') + ' — Génération R92';`.
**Corriger `tournoi.html:6` seul n'aurait rien changé** : le JavaScript réécrit le titre deux
secondes après le chargement.

**Vérifié par exécution réelle de `majTitre()`** *(la vraie fonction, extraite et lancée dans Node
avec un `document` factice)* :

| Cas | `document.title` obtenu |
|---|---|
| Nom configuré « Tournoi de Colombes » | `"Tournoi de Colombes"` ✅ **le vrai nom est préservé** |
| Champ vide | `"Le tournoi"` ✅ |
| Champ absent | `"Le tournoi"` ✅ |

### Ce qui a été neutralisé

| Catégorie | Points |
|---|---|
| Titres HTML *(8 pages)* + métadonnées `description` *(4)* + sous-titres *(2)* + pied public *(1)* | **15** |
| Valeurs de repli du nom du tournoi | **12** |
| Titre dynamique | **1** |
| En-têtes et signatures des emails — HTML **et** texte | **8** |
| Pages publiques miroirs — surtitres et pieds | **6** |
| Fichier calendrier `.ics` — `PRODID`, `UID`, `SUMMARY` | **3** |
| Sous-titre de la barre latérale admin | **1** |
| Commentaires devenus faux *(§8 ter)* | **4** |
| **Total** | **50** |

### Contrôles

| | |
|---|---|
| **Syntaxe** | ✅ `node --check` sur **30 fichiers JS**, 0 erreur *(le même contrôle que le workflow)* |
| **Recherches UTF-8** | ✅ **0** pour *Generation R92*, *École de Rugby du Racing*, *Tournoi Génération R92*, *Tournoi R92*, *generation-r92* |
| **Non-régression** | ✅ **50 insertions / 50 suppressions** — substitutions ligne à ligne. ⛔ **Aucune URL modifiée**, aucune classe, aucun style, aucune balise |
| **Titre dynamique** | ✅ exécution réelle, 3 cas |
| **Sorties texte** | ✅ les deux signatures d'email texte vérifiées par extrait — ⚠️ **elles n'apparaissent dans aucun aperçu**, c'est pourquoi le contrôle est explicite |

### ⚠️ Ce qui reste volontairement, et à quel lot

| Ce qui reste | Où | Lot |
|---|---|---|
| `LIENS_ASSOCIATION` *(2 libellés)* | `commun.js:306,308` | **L3** |
| Bandeau de don | `tournoi.html:75` | **L3** |
| `alt` et commentaire du logo | `admin.html:30,32` · `tournoi.html:35,144` | **L4** |
| « Perfs Racing » | `frontend/README.md:12` | **L7** |

> ⚠️ **Une dette temporaire, à dire clairement** : la page **Perfs** est désormais *textuellement*
> générique — « Perfs du club », « Perfs des équipes du club » — mais **son filtre reste
> `MOT_CLE_CLUB = 'racing'` jusqu'à L8**. ⭐ **Les commentaires ont été reformulés en termes qui
> restent vrais dans les deux états** *(« les équipes du club », « vue de son côté »)*, conformément
> à §8 ter : un commentaire ne doit jamais annoncer autre chose que ce que fait la ligne d'en
> dessous.

> ⚠️ **Documents ACTIFS** : **`CHANGELOG.md` mis à jour** — c'est le premier lot de CF-4b qu'un
> utilisateur remarque. ✅ **Aucune entrée datée modifiée.** `README.md`, `docs/architecture.md` et
> `backend/README.md` vérifiés : ils ne décrivent **aucun** des textes touchés.

---

## 10. Lot L3 — les liens institutionnels et le bandeau de don

### ⭐ Le piège annoncé, démontré par comparaison

`tournoi.js:216` faisait `document.getElementById('don-lien').hidden = !pub;` **sans test
d'existence**. Retirer le seul HTML aurait cassé la page publique **au chargement**, et
`node --check` **ne l'aurait pas vu** — il vérifie la syntaxe, jamais l'exécution.

**Le même test d'exécution, lancé sur les deux versions** *(la vraie fonction `appliquerPublication`,
dans un DOM où `#don-lien` renvoie `null`)* :

| Version | Résultat |
|---|---|
| **Avant L3** | ❌ `TypeError: Cannot set properties of null (setting 'hidden')` |
| **Après L3** | ✅ aucune erreur — dans les **deux** états, tournoi publié et non publié |

> 🎯 **C'est la différence entre « je crois » et « je montre ».** Le piège était réel : la preuve
> n'est pas que le code marche, c'est que **l'ancien code, lui, cassait**.

⚠️ **Traitement retenu : suppression, pas garde.** Le bandeau disparaît définitivement dans l'état
neutre — ajouter un `if (don)` aurait conservé du code mort. **Les 4 références ont donc été
retirées**, et la ligne `pub` qui sert à cinq autres éléments a été **laissée intacte** : elle est
utilisée ailleurs.

### Le comptage : 21 points, et non 19

| Ce qui s'ajoutait aux 19 | Pourquoi |
|---|---|
| `tournoi-public.css:156` | Le commentaire de `.carte-app` expliquait la colonne flex **par le réordonnancement du bandeau de don** — devenu faux *(§8 ter)*. ⚠️ **La colonne flex elle-même a été conservée** : les autres `order:` en dépendent |
| `sponsors.css:148` | Même chose, pour `.don-bandeau-bas` |

### ⚠️ Deux pièges de rendu évités

| | |
|---|---|
| **Le logo aurait grossi** | `<a class="logo">` enveloppait l'image, et **c'est la règle `.logo img` qui lui donne ses 48 px**. Retirer la balise aurait affiché l'image en **700 px**. ➡️ Le lien devient une `<div class="logo">` : la classe survit, la destination disparaît |
| **Le pied d'email aurait gardé une marge** | `barreLiensEmail()` avec une liste vide produisait `<table style="margin:16px auto 0;"><tr></tr></table>`. ➡️ Elle renvoie désormais **chaîne vide**. Même correction côté texte : le bloc est conditionnel, sinon deux lignes vides se suivaient |

### Ce qui a été supprimé, jamais remplacé

⛔ **Aucun lien n'a été remplacé par `#` ni par un faux lien générique** — un bouton mort est pire
qu'un bouton absent. **Les éléments ont été retirés :** bandeau de don *(texte, lien, conteneur,
commentaire)* · « ← Retour au site » · le paragraphe `.pied-liens` en entier · les 4 destinations de
`LIENS_ASSOCIATION`.

⭐ **Le mécanisme, lui, est conservé** : `LIENS_ASSOCIATION` reste déclaré, **vide**, avec un
commentaire qui dit pourquoi. ⛔ **Aucun nouveau système de configuration n'a été créé** — ce serait
à l'organisation adoptante d'en décider, le jour venu *(CF-14)*.

### CSS retiré — orphelin uniquement

`.don-bandeau` *(section 9 entière, 3 règles)* · `.don-bandeau { order: 20; }` ·
`.don-bandeau.don-bandeau-bas` · `.lien-retour` *(2 règles)* · `.pied-liens` et `.pied-sep`
*(4 règles)*. ⛔ **Aucun nettoyage opportuniste** : `.logo img` conservé, `.carte-app` conservée,
`.inv-pied-liens` *(dossier, mécanisme configurable)* **non touchée**, variables `--r92-*` hors
périmètre.

### Contrôles

| | |
|---|---|
| **Syntaxe** | ✅ `node --check`, 30 fichiers, 0 erreur |
| **Exécution** | ✅ `appliquerPublication()` sans `#don-lien`, deux états — **et le témoin d'avant échoue** |
| **Emails** | ✅ `barreLiensEmail()` exécutée : renvoie `""`, **aucune URL** · version texte : **0 ligne de liens** |
| **Liens fonctionnels** | ✅ « Répondre à l'invitation », « Ouvrir mon espace », « Voir la version en ligne », itinéraire, agenda — **tous présents** |
| **Recherches UTF-8** | ✅ **0** pour `generationr92`, `racing92.fr`, `instagram.com`, `don-lien`, `don-bandeau`, `faire-un-don` |

### ⚠️ Ce qui reste, et à quel lot

| Ce qui reste | Où | Lot |
|---|---|---|
| Logo, `alt`, favicon, `noise.svg` | `tournoi.html:9,35,135` · `admin.html:30,32` · `tournoi-public.css:54` | **L4** |
| Nom d'expéditeur | `Code.gs` | **L5** |
| 🟡 **3 commentaires de style** nommant la vitrine | `theme-r92.css:409` · `tournoi-public.css:5` · `tournoi.html:16` | ⚠️ **Signalés, non rattachés** — ce sont des commentaires décrivant l'**origine d'une charte graphique**, ni liens actifs ni attributions. **À trancher avec L4**, qui traite l'identité visuelle |

> ⚠️ **Documents ACTIFS** : `CHANGELOG.md` mis à jour — **et la phrase de l'entrée L2 qui annonçait
> que liens et don « n'ont pas encore changé » a été rendue exacte**, car elle datait du même jour et
> devenait fausse en quelques heures. ⛔ **Aucune entrée publiée n'a été réécrite.** `README.md`,
> `docs/architecture.md` et `backend/README.md` vérifiés : aucun ne décrit ces liens.

---

## 11. Lot L4 — l'identité graphique

### Le symbole créé, et ce qu'il n'est pas

Un **écusson géométrique simplifié, non héraldique**, portant la seule lettre **T** *(Tournoi)*.
Deux formes, deux couleurs reprises de la charte existante *(`#0C1C2E` navy, `#B8D8F8` ciel)*.

⛔ **Ce qu'il ne contient pas, et c'était la contrainte** : aucun ballon, aucun 92, aucune lettre R
ou M, aucune couronne, aucun slogan, aucune référence à un club, ⭐ **et aucun nom de produit — le
nom « Maxilou » n'apparaît toujours nulle part dans l'application**.

> 🎯 **Il est temporaire, et fait pour se voir comme tel.** L4 **ne crée pas une marque** : il donne
> à l'application un repère cohérent en attendant une décision qui n'est pas prise.

### ⚡ Le PNG a dû être fabriqué à la main

Les clients de messagerie **n'affichent pas le SVG** : il fallait un PNG du même dessin. Or
**aucun convertisseur n'est installé** *(ni `rsvg-convert`, ni Inkscape, ni ImageMagick, ni Pillow)*,
et `CLAUDE.md` §10 interdit d'ajouter une dépendance pour cela.

➡️ **Le PNG a donc été généré par un court script `zlib` + `struct`** : même géométrie que le SVG,
suréchantillonnage 4×4 pour lisser les bords, fond transparent. **1 249 octets.**

### Les ressources

| | Fichier | Taille | Rôle |
|---|---|---|---|
| 🆕 | `frontend/assets/logo-tournoi.svg` | 620 o | Pages web **et** favicon des 8 pages |
| 🆕 | `frontend/assets/logo-tournoi.png` | 1,2 Ko | Emails |
| 🆕 | `frontend/assets/grain.svg` | 648 o | Grain de fond, **produit par le navigateur** *(`feTurbulence`)* — aucune image téléchargée |
| 🗑️ | `frontend/img/logo-r92.png` | 164 Ko | supprimé |
| 🗑️ | `frontend/img/blason-racing92.png` | 20 Ko | supprimé |
| 🗑️ | `frontend/img/blason-racing92.svg` | 40 Ko | supprimé |

⭐ **224 Ko retirés, 2,5 Ko ajoutés.**

### ⚠️ Deux adaptations CSS, et elles n'étaient pas cosmétiques

L'ancien logo était un **bandeau large** ; le nouveau est **carré**. Les règles écrites pour le
premier maltraitaient le second :

| Règle | Avant | Après | Sans quoi |
|---|---|---|---|
| `.entete .logo` | `width:100%; max-width:260px` *(320 px au-delà de 700 px)* | `width:64px` | Le symbole se serait affiché en **260 px de côté** dans l'en-tête d'administration |
| `.ecr-logo` | `max-width:110px` | `width:56px` | Disproportionné dans la barre latérale |

⛔ **Rien d'autre n'a été touché** : ni palette, ni typographie, ni espacements, ni disposition.
`.logo img` *(48 px)*, `.pied-logo` *(52 px)*, `.inv-blason` *(150 px)* et `.d-pied-logo` *(34 px)*
conviennent déjà à un carré et sont **inchangées**.

### `noise.svg` — option B retenue, et pourquoi

Le grain était chargé depuis la vitrine. Rôle constaté : décoratif, `opacity: 0.04`,
`mix-blend-mode: soft-light`, sur tout le fond de la page publique.

⭐ **Une ressource locale a été créée plutôt que l'usage supprimé** : `CLAUDE.md` §15 de la consigne
demande de ne pas modifier le rendu, et supprimer le grain l'aurait fait — légèrement, mais
réellement, sur les grands aplats. ⛔ **Aucun asset de la vitrine n'a été copié** : `grain.svg`
utilise `feTurbulence`, un bruit **calculé par le navigateur**. **Rien n'est téléchargé.**

### ⏸️ Les deux icônes de liens — conservées, et c'est motivé

`icone-instagram.png` et `icone-site.png` étaient annoncées orphelines après L3. **Le contrôle a
montré qu'une référence subsiste** : `urlIconeEmail()`, qui construit `img/icone-<nom>.png`.

⛔ **Elles n'ont donc pas été supprimées**, pour trois raisons :

- **elles ne sont pas institutionnelles** — ce sont des pictogrammes génériques *(appareil photo,
  globe)*, sans marque ;
- **elles outillent le mécanisme `LIENS_ASSOCIATION`**, que **D-039 #7 demande de conserver** ;
- ⭐ **les supprimer casserait ce mécanisme** le jour où une organisation y mettrait ses liens.

*(La consigne du lot posait la suppression sous condition — « si aucune référence active ne
subsiste ». La condition n'est pas remplie.)*

### Les commentaires signalés en L3

| Fichier | Traitement |
|---|---|
| `tournoi-public.css:5` | *« charte du site vitrine (boutique-r92) »* → *« charte de la page publique »* |
| `tournoi-public.css:55` | *« comme sur le site vitrine »* → *« sur toute la page. Ressource LOCALE. »* |
| `theme-r92.css:409` | La référence à la feuille de style d'un site extérieur retirée |
| `tournoi.html:16` | *« calqué sur boutique-r92 »* retiré |
| `admin.html:30` | *« Logo Génération R92 »* → *« Repère visuel neutre et temporaire »* |

⚠️ **`theme-r92.css` n'est PAS renommé** — identifiant technique, même statut que `--r92-*` :
réserve assumée.

### Contrôles

| | |
|---|---|
| **Recherche finale** *(locale UTF-8)* | ✅ **0** pour `boutique-r92`, `logo-r92`, `blason-racing`, `noise.svg`, `Génération R92`, `Racing 92`, `favicon.svg` |
| **Syntaxe** | ✅ `node --check`, 30 fichiers, 0 erreur |
| **Assets** | ✅ PNG valide *(220×220 RGBA)*, SVG valides, **aucune dépendance externe** |
| **Accessibilité** | ✅ Les logos sont **décoratifs** *(le nom du tournoi est déjà en texte à côté)* ⇒ `alt=""` partout, plutôt qu'un texte redondant pour les lecteurs d'écran |

> ⚠️ **Documents ACTIFS** : `CHANGELOG.md` mis à jour — **et la phrase de l'entrée L3 annonçant que
> les logos « n'ont pas encore changé » a été rendue exacte**, comme pour L2 la veille. Ces deux
> entrées datent du **même jour** et n'ont jamais été publiées ailleurs. ⛔ **Aucune entrée
> historique réécrite.**
>
> ⚠️ **`README.md` : sa carte de structure annonce `img/ → 5 images (blasons, logos, icônes)`** —
> devenu faux *(il en reste 2, et `assets/` est réapparu)*. ⭐ **Corrigé dans ce lot** *(§8 bis :
> la carte se vérifie dans le même lot)*.

---

## 12. Lot L5, phase A — le nom d'expéditeur, côté dépôt

### ⚠️ Pourquoi ce lot est le seul à être coupé en deux

Tous les lots précédents étaient prouvés dès leur publication : une page servie, une recherche sur
un clone neuf, un rendu dans un navigateur. **L5 ne peut pas l'être**, pour deux raisons qui
s'ajoutent :

| | |
|---|---|
| **① Le serveur est déposé à la main** | Le dépôt contient une **copie** du code ; le serveur qui envoie réellement les messages vit chez Google. **Rien ne garantit qu'ils soient identiques** — c'est la limite permanente de `CLAUDE.md` **§13.6** |
| **② Le nom d'expéditeur ne s'affiche nulle part ailleurs** | Ni écran, ni aperçu, ni test, ni fonction ne l'expose. ⭐ **Il n'apparaît que dans l'en-tête d'un message reçu** |

➡️ D'où le découpage : **L5-A** *(dépôt)* ici, **L5-B** *(redéploiement)* ensuite, et un envoi réel
**seulement sur autorisation**.

### La modification

**4 substitutions littérales**, recomptées et confirmées : `name: 'Génération R92'` →
`name: 'L\'organisation du tournoi'`, dans `envoyerEmailAvec` *(lignes 5067, 5069)* et
`envoyerEmailHtml` *(5082, 5086)*.

⛔ **Aucune constante créée, aucune fonction refactorée, aucune signature changée** — décision déjà
prise lors de la cartographie : c'est une correction juridique, pas un travail de style.

### Ce qui hérite du nouveau nom — chaîne d'appel tracée

```
envoyerEmailAvec  ←── envoyerDossierEmail (repli texte)
envoyerEmailHtml  ←── envoyerDossierEmail
                  ←── envoyerFeuilleJour
                  ←── envoyerInvitationEmail ←── envoyerInvitationClub
                                             └── envoyerInvitationsGroupe
```

⭐ **Quatre actions serveur**, donc **trois types de messages** : l'invitation *(unitaire et
groupée)*, le dossier final, et **la feuille de journée** — cette dernière n'a aucune signature dans
son corps : c'est le seul endroit où elle était identifiée.

### Contrôles

| | |
|---|---|
| **Syntaxe** | ✅ `node --check` sur `Code.gs` **et** `Tests.gs` — 0 erreur. ⚠️ *`node --check` refuse l'extension `.gs` : les fichiers sont copiés en `.js` dans un dossier temporaire, hors dépôt* |
| **Exécution** | ✅ `envoyerEmailAvec` lancée avec des doublures : les deux branches produisent bien `name = "L'organisation du tournoi"`, et `from`, `to`, `subject` sont **inchangés** |
| **Non-régression** | ✅ Comparaison ligne à ligne du diff : en retirant la seule clé `name:`, **les 4 lignes sont identiques avant/après** |
| **Recherche** | ✅ `Génération R92` → **0** dans `Code.gs` · les 4 `name:` neutres présents |
| **`Tests.gs`** | ✅ **INTACT** — 0 modification, **4 244 lignes**. Re-vérifié : **aucun des 703 tests ne touche le nom d'expéditeur** |

### ⭐ Ce que L5-A prouve — et ce qu'elle ne prouve pas

| ✅ **Prouvé** | ⛔ **NON prouvé** |
|---|---|
| Le code **publié** demande à GmailApp et MailApp d'utiliser *« L'organisation du tournoi »* | Que le serveur **en service** le fasse — il n'a pas été redéployé |
| Les 4 substitutions sont exactes, et rien d'autre n'a bougé | Que le nom **réellement affiché** dans une boîte de réception ait changé |

> ⚠️ **À dire tel quel** : **un email envoyé aujourd'hui partirait toujours sous l'ancien nom.**
> Et même après L5-B, seul un **message reçu** pourra établir ce que le service d'envoi affiche —
> aucun test, aucun aperçu ne le fera à sa place.

### ⛔ Ce que cette phase n'a pas fait

Aucun redéploiement · aucun email · aucun test ajouté ou modifié · aucun frontend touché · aucune
configuration · ⛔ **aucune entrée `CHANGELOG`** : annoncer un changement qui n'est pas en service
serait faux.

> ⚠️ **Documents ACTIFS vérifiés** : **aucun ne devient faux.** [`../deploiement.md`](../deploiement.md)
> conserve ses deux repères *(`703/703` et `4244`)* — ils restent **exacts**, aucun test n'ayant
> bougé. ⛔ **Il n'a pas été transformé en journal de L5.** `README.md`, `docs/architecture.md` et
> `backend/README.md` ne décrivent ni ces fonctions bas niveau ni le nom d'expéditeur.

---

## 13. Lot L5, phase B — le serveur, et ce qu'un email a prouvé

### ⚠️ D'abord, ce qui s'est mal passé — parce que c'est le plus instructif

Une première tentative de L5-B a eu lieu le matin du **2026-08-20**. Elle a été **déclarée faite**,
sur la foi de trois signaux :

| Signal obtenu | Pourquoi il ne prouvait rien **sur la modification du jour** |
|---|---|
| **`R92 — 703/703 OK, 0 FAIL`** | ⭐ **Un bilan vert et sincère** : ces vérifications **s'exécutent bien contre le `Code.gs` du projet**, et **détecteraient** une régression sur un comportement qu'elles couvrent. ⛔ **Mais aucune ne touche le nom d'expéditeur** — le bilan était donc **muet sur ce qui avait changé** |
| **Dernière ligne `4244`** | Ce repère atteste l'**identité du fichier de tests** collé — **4244, c'est `Tests.gs`** *(`Code.gs` en fait **8277**)*. Il était **juste**, et il parlait **de l'autre fichier** |
| **`ping` conforme** | Sa réponse est **identique avant et après** L5-A : elle ne discrimine **rien** |

⛔ **Les trois voyants étaient verts, et l'ancien `Code.gs` était toujours présent chez Google.** La
preuve en est venue d'ailleurs : un email réel, envoyé pendant le diagnostic, portait encore
`From: "Génération R92" <romain.rifleu@gmail.com>` — puis une recherche en lecture seule dans
l'éditeur Apps Script a donné **`Génération R92` → 4 sur 4** et **`organisation du tournoi` → 0**.

> ⛔ **Ce qui n'a PAS été établi, et ne le sera pas** : **quel geste avait manqué.** Collage non
> effectué, collage incomplet, ou état non enregistré — **les trois restent possibles**. Le constat
> démontré est **l'absence du contenu attendu chez Google**, rien de plus. ⚠️ **Aucune des mesures
> prises ensuite ne doit être présentée comme la correction d'une cause connue** : ce sont des
> **garde-fous**, et ils couvrent les trois cas.

> 🎯 **Le défaut n'était pas la rigueur, c'était le PÉRIMÈTRE du contrôle.** La procédure portait
> **deux repères sur `Tests.gs`** et **aucun sur `Code.gs`**. ➡️ **D-040**.

### La chaîne de preuve reconstruite

```
SOURCE PUBLIÉE  →  identité Git  →  empreinte du presse-papiers  →  collage  →  ENREGISTREMENT
   →  témoins discriminants DANS L'ÉDITEUR  →  redéploiement  →  tests  →  ping  →  PREUVE MÉTIER
```

**Les valeurs réellement obtenues, à chaque maillon :**

| Maillon | `backend/Code.gs` | `backend/Tests.gs` |
|---|---|---|
| **Identique au commit publié `5649f83`** | ✅ blob `7924e2f8…` | ✅ blob `3f098ba8…` |
| **Empreinte SHA-256 du presse-papiers** | `eb511f735f5df0b73a1138b562a7d9108de9c01157b7ac7caf75dcaf0dd103c9` | `f7ba5827e00fc94116ae2cc94b3c2b489c871b2ebcbb19186b2d568ee583f48e` |
| **= empreinte du fichier source ?** | ✅ **oui**, saut de ligne final inclus | ✅ **oui** |
| **Lignes** | **8277** | **4244** |
| **Ancre de fin** | `viderDonnees` en **8272** | `testDecisionScore_modeSimpleNeTouchePasAuDetail` en **4226** |
| **Témoin** | ⭐ `organisation du tournoi` → **4** *(était **0**)* | `T-17` → **6** *(était **0**)* · `deciderEnregistrementScore` → **25** *(était **0**)* |
| **Contre-témoin** | `Génération R92` → **0** *(était **4**)* | — |

⭐ **Tous ces repères ont été fixés AVANT le collage**, jamais après : ils ne pouvaient donc pas être
ajustés au résultat.

> 🚨 **Le piège de l'échappement, et il aurait fait conclure à un échec.** Dans le code, le texte
> s'écrit **`L\'organisation du tournoi`** — la barre oblique inversée permet de mettre une
> apostrophe **à l'intérieur** d'un texte lui-même délimité par des apostrophes. **Conséquence
> mesurée** : chercher `L'organisation du tournoi` dans un fichier **parfaitement collé** donne
> **0 résultat**. ➡️ **Le témoin est `organisation du tournoi`, sans le `L'`.**

### Le déploiement

Les deux fichiers collés *(⌘A / ⌘V / **⌘S**)*, puis **une nouvelle version du MÊME déploiement**
*(l'URL publique ne change pas)*, puis :

- ✅ `lancerTestsFFR` → **`R92 — 703/703 OK, 0 FAIL`**, exécution terminée normalement ;
- ✅ `?action=ping` → `{"ok":true,"message":"API Tournoi R92 en ligne"}`.

> ⚠️ **Une réserve de traçabilité, à dire plutôt qu'à masquer** : le second nombre du geste 4 de
> [`../deploiement.md`](../deploiement.md) — la **dernière ligne du fichier collé** — **n'a pas été
> relevé** cette fois. Il a été **remplacé par des contrôles plus forts** *(`T-17` → 6,
> `deciderEnregistrementScore` → 25, dernière fonction en 4226, fin conforme à 4244)*, qui sont
> **discriminants** là où le nombre `4244` seul ne l'est pas. **Le geste est satisfait par des
> moyens supérieurs — ce n'est pas la même chose que « satisfait tel qu'écrit ».**

### ⭐ La preuve métier — un email réel

| | |
|---|---|
| **Club fictif** | *LE TEST RUGBY CLUB* |
| **Destinataire** | `rifleu@hotmail.com` |
| **Chemin** | ⭐ **icône d'envoi INDIVIDUELLE** de ce club uniquement. ⛔ **Aucun envoi groupé.** Boîte de confirmation affichée : *« Envoyer l'invitation à « LE TEST RUGBY CLUB » (rifleu@hotmail.com) ? »* |
| **Configuration constatée avant l'envoi** | `email_expediteur` **VIDE** *(le texte gris « Vide = adresse du compte exécutant le script » n'est qu'une aide de saisie)* ⇒ branche **`MailApp`** |

**L'en-tête brut reçu :**

```
From: "L'organisation du tournoi" <romain.rifleu@gmail.com>
To: rifleu@hotmail.com
Date: Thu, 20 Aug 2026 17:08:34 +0000
```

**Le témoin avant/après, dans la MÊME boîte de réception :**

| | Nom affiché | Adresse d'envoi |
|---|---|---|
| **Message du matin** *(ancien code en service)* | `"Génération R92"` | `romain.rifleu@gmail.com` |
| **Message de 17:08** *(après redéploiement)* | ⭐ `"L'organisation du tournoi"` | `romain.rifleu@gmail.com` |

> ⭐ **Ce que cette symétrie élimine, et c'est ce qui rend la preuve solide** : les deux messages
> viennent de **la même adresse** et affichent **des noms différents**. Si Outlook tirait ce nom de
> son **carnet d'adresses** — l'explication la plus banale — il afficherait **le même nom pour les
> deux**. Le nom lu vient donc bien **de l'en-tête du message**, c'est-à-dire **du serveur**.

**SPF, DKIM et DMARC : `pass` — ce qu'ils prouvent, et ce qu'ils ne prouvent pas.**

| ✅ Ils établissent | ⛔ Ils n'établissent PAS |
|---|---|
| Le message vient réellement de l'infrastructure d'envoi autorisée pour cette adresse — **ce n'est pas un message falsifié** | **Quelle ligne du code** a produit ce nom |
| La signature **DKIM** couvre les en-têtes, `From:` compris : le nom lu est bien **celui émis au départ**, non modifié en route | Quoi que ce soit sur les **autres branches** du code |
| — | Une quelconque **légitimité juridique** du nom affiché — ce sont des contrôles **techniques** |

### 🎯 Portée exacte de L5 — le tableau à ne jamais élargir

| Ligne de `backend/Code.gs` | Fonction / branche | Statut |
|---|---|---|
| ⭐ **5086** | `envoyerEmailHtml` — branche **`MailApp`** | ✅ **CERTAIN — exercée en conditions réelles**, prouvée par l'en-tête reçu |
| **5082** | `envoyerEmailHtml` — branche **`GmailApp`** *(alias configuré)* | ⚠️ **CERTAIN dans le code · ⛔ NON TESTÉ EN RÉEL** |
| **5067** | `envoyerEmailAvec` — branche **`GmailApp`** | ⚠️ **CERTAIN dans le code · ⛔ NON TESTÉ EN RÉEL** |
| **5069** | `envoyerEmailAvec` — branche **`MailApp`** | ⚠️ **CERTAIN dans le code · ⛔ NON TESTÉ EN RÉEL** |

> ⛔ **Ce qu'il ne faut JAMAIS écrire** : *« les quatre lignes sont testées en réel »*. **Une l'est.**
> Les trois autres sont **corrigées, lues et vérifiées dans le code** — pas à l'usage. Les atteindre
> demanderait un **envoi de dossier Phase 2** *(repli texte)* et un **alias Gmail configuré**,
> c'est-à-dire **deux envois réels de plus**, pour un bénéfice de preuve faible : la chaîne de
> caractères est **littéralement la même** aux quatre endroits.

### 🔧 Un constat annexe, inscrit et NON corrigé — l'affiche

Pendant le contrôle de l'aperçu de l'email, l'interface affichait bien le **repère visuel neutre
« T »** *(L4)* — mais **l'affiche du tournoi enregistrée dans le classeur** porte, elle, encore des
éléments **Racing / Génération R92**.

⚠️ **Ce n'est pas un défaut de L5**, et **pas un lot Git** : le code gère parfaitement une affiche
absente ou neutre. C'est une **donnée du classeur**, comme `url_instagram` — donc **M1**, où le
constat a été inscrit *(`PLAN.md` §CF-4b)*. ⛔ **Aucune affiche supprimée, aucune donnée modifiée**
— conformément à **D-039 §4**.

### ⛔ Ce que cette phase n'a pas fait

Aucun code applicatif modifié · aucun test ajouté ou modifié · aucune donnée du classeur touchée ·
aucune suppression · **un seul email**, individuel, vers une adresse de test, avec un club fictif.

### ⚠️ Documents ACTIFS vérifiés

- ✅ [`../deploiement.md`](../deploiement.md) — **devenait insuffisant** : renforcé *(D-040)*. Ses
  repères **`703/703`** et **`4244`** restent **exacts**, `backend/Tests.gs` n'ayant pas bougé ;
- ✅ [`../../CHANGELOG.md`](../../CHANGELOG.md) — **une entrée devenait due** : L5-A s'en était
  abstenue au motif que *« annoncer un changement qui n'est pas en service serait faux »*. **Ce
  motif a disparu** ;
- ✅ `README.md`, `docs/architecture.md`, `backend/README.md` — **aucun ne devient faux** : ils ne
  décrivent ni ces fonctions bas niveau, ni le nom d'expéditeur ;
- ⚡ ✅ [`REFERENTIELS.md`](REFERENTIELS.md) — **était DÉJÀ faux, et pas à cause de L5** : il
  recopiait *« L2 → L8 à faire »* alors que L2, L3, L4 et L6 étaient publiés. La recopie a été
  **remplacée par un renvoi** vers `PLAN.md` §CF-4b *(**§8 quater** — un repère volatil n'a qu'une
  seule adresse)*. 📌 **Troisième occurrence du même mécanisme** après `architecture.md` et le
  `CHANGELOG` : la question de faire entrer ce document dans la carte de **§8 bis** est **posée à
  Romain**, et **volontairement non tranchée ici**.

---

## 14. Lot L7 — le reste de la documentation active du dépôt public

**2026-08-22** · commit à venir · ⛔ **aucun code, aucun test, aucun déploiement, aucune donnée du
classeur.**

### 1. Ce que le lot a corrigé — 26 points, 8 fichiers

| Bloc | Points | Ce qui a changé |
|---|---|---|
| 🔴 **L'attribution du `README`** | 1 | *« Mini-logiciel **interne** […] pour l'association **Génération R92** (École de Rugby, Hauts-de-Seine) »* devient *« Mini-logiciel de gestion de tournois de rugby à l'échelle d'une école de rugby »* |
| **« Perfs Racing » → « Perfs du club »** | 10 | `README.md` *(4)* · `frontend/README.md` *(1)* · `../architecture.md` *(2)* · `../guide-utilisateur.md` *(2)* · `../structure-google-sheet.md` *(1)* |
| ⚡ **Le bandeau de don, qui n'existe plus** | 6 | `README.md` *(2)* · `../architecture.md` · `../deploiement.md` · `../guide-utilisateur.md` · `../sponsors.md` |
| **La carte du `README` sur `passation.md`** | 1 | *« vers les comptes de **l'asso** »* → *« vers les comptes **d'une organisation** »* |
| **Exemples institutionnels du classeur** | 2 | *« Tenue par les bénévoles **R92** »* → *« du club »* · *« pointe directement vers le compte Instagram **Génération R92** »* → *« pointe vers le compte configuré ici ; vide ⇒ pas de bouton »* |
| **Le mot « blason », faux depuis L4** | 2 | `frontend/README.md` — *« blason centré »* → *« repère visuel centré »* ; `heroDocument (blason + …)` → `heroDocument (repère visuel + …)` |
| **`CF-4` → `CF-4a`** | 4 | `CF-2-RESPONSABLE-TRAITEMENT.md` l. 111, 308, 546, 551 — ⛔ **aucune ne devient `CF-4b`** : les quatre parlent de **mentions légales** |
| **TOTAL** | **26** | ⭐ **Vérifié au diff** : `git diff -U0` sur les 8 documents donne **exactement 26 blocs de modification** — 8 dans `README.md`, 3 dans `frontend/README.md`, 3 dans `../architecture.md`, 3 dans `../guide-utilisateur.md`, 1 dans `../deploiement.md`, 1 dans `../sponsors.md`, 3 dans `../structure-google-sheet.md`, 4 dans `CF-2-…` |

⭐ **La ligne du `README` mérite d'être soulignée** : c'est **celle que D-039 citait nommément**
*(« sa première phrase annonçait un logiciel "pour l'association …" »)*. Elle a survécu à **six
lots** — parce que L1 n'avait retiré que le document Word, et que personne n'était revenu à la
phrase d'accueil.

### 2. ⚡ Pourquoi 26 et non 16 — et c'est la leçon du lot

Le plan annonçait **16 points**. Il ne les a **jamais énumérés**. Le compte réel se décompose ainsi :

| | | |
|---|---|---|
| **14** | attributions institutionnelles traitées | ⭐ **C'est bien le compte annoncé** : la passe d'analyse en avait relevé **15 fermes**, dont **`contact@r92.fr` reporté à L8** *(arbitrage 3)* ; les **2 exemples réels** *(« RACING 92 », « Racing 92 »)* sont restés en réserve *(arbitrage 2)* |
| **+ 4** | références `CF-4` → `CF-4a` | Annoncées **séparément** par le plan, en plus des 16 |
| **+ 2** | descriptions *« blason »* | ⚡ **Ajoutées par l'arbitrage 4** : elles ne nomment aucune structure, elles étaient simplement **fausses depuis L4** |
| ⚡ **+ 6** | descriptions du **bandeau de don** | ⛔ **L0 ne pouvait PAS les compter** — voir ci-dessous |
| **= 26** | | |

> ⚠️ **Une erreur d'arithmétique a été commise pendant ce lot, et elle est notée ici plutôt que
> corrigée en silence.** Le rapport de fin de patch a d'abord annoncé **25 points** — un chiffre
> **repris de la proposition rédigée AVANT les arbitrages**, où `contact@r92.fr` était encore
> compté *(−1)* et où les deux *« blason »* ne l'étaient pas encore *(+2)*. **25 − 1 + 2 = 26.**
> ⛔ **Aucune ligne n'avait été comptée deux fois, et aucune retouche de forme n'avait été comptée
> comme un point** : le total du tableau était juste, c'est **l'en-tête qui était périmé**. 🎯 **Un
> chiffre juste devenu faux parce que la décision a bougé sous lui** — exactement le mécanisme de
> **§8 quater**, cette fois à l'échelle d'une seule session.

> 🎯 **Le mécanisme, et il n'accuse personne.** **L3** a supprimé le bandeau de don le 2026-08-20.
> Six documents actifs continuaient de le décrire comme **présent** — non par négligence de L3, mais
> parce qu'**un lot qui RETIRE quelque chose de l'application rend faux tout ce qui le décrivait**.
> Cette dette n'existait pas quand L7 a été dimensionné : **elle a été créée entre-temps, par les
> lots intermédiaires eux-mêmes.**
>
> ⭐ **C'est la même famille que l'élargissement de §8 bis** : le déclencheur regardait *« ce qui
> nomme une structure »*, jamais *« ce qui est devenu faux »*. ⚠️ **Et ce n'est pas une invitation à
> la refonte documentaire** : L7 a corrigé **l'état réel constaté**, rien de plus.

**Preuve que le bandeau n'existe plus** : `grep -rn "don-bandeau\|don-lien\|Je fais un don\|Soutenez"
frontend` → **0**. Six documents décrivaient donc une fonctionnalité absente du code.

### 3. Les quatre arbitrages de Romain

| Arbitrage | Décision | Pourquoi |
|---|---|---|
| **Titres « Tournoi R92 »** | ⏸️ **CONSERVÉS** — rejoignent la réserve du **nom du dépôt** *(D-039 #13)* | Neutraliser le titre sans renommer le dépôt afficherait un nom neutre **au-dessus d'une URL `tournoi-r92`**. ⚠️ **Ce n'est PAS une autorisation générale de garder « R92 »** |
| **Exemples « RACING 92 » / « Racing 92 »** | ⏸️ **CONSERVÉS** | Ce sont **des équipes qui jouent**, comme `MASSY` et `PUC-2` à côté — ⛔ pas une attribution. Et l'exemple **enseigne une vraie règle de nommage** |
| **`contact@r92.fr`** | ⏭️ **REPORTÉ À L8** | ⭐ Il vit **deux fois** : dans `../structure-google-sheet.md:113` **et** comme donnée de test dans `Tests.gs:920,947,952`. Les changer séparément créerait **deux vérités différentes** entre un document et le test qu'il décrit |
| **Le mot « blason »** | ✅ **CORRIGÉ** | Depuis **L4**, l'image est un repère neutre : le mot était devenu **faux**. ⛔ **La classe `.inv-blason` n'a PAS été touchée** — identifiant technique, réserve #14 |

### 4. 🔴 La découverte du lot : « Boutique R92 » est encore VISIBLE

```
frontend/admin.html:608,609            « Boutique R92 » (écran organisateur)
frontend/js/admin-invitations.js:431   pastille « 🛍️ Boutique R92 »
frontend/js/admin-invitations.js:549   service « boutique R92 »
frontend/js/invitation.js:108          pastille « 🛍️ Boutique R92 »
```

⚠️ **La pastille figure dans l'INVITATION envoyée aux clubs** — c'est donc une attribution
institutionnelle **vue par un tiers**, exactement du type que **L2** avait pour mission de retirer.

🎯 **Pourquoi L2 l'a manquée, et c'est instructif** : le mot est **collé au nom du réglage**
(`boutique_r92_disponible`). Une recherche sur *« R92 »* isolé, ou sur *« Génération R92 »*, ne le
voit pas. **C'est le même mécanisme que l'`UID` `@generation-r92` du fichier calendrier**, trouvé de
justesse pendant L2.

⛔ **NON corrigé ici** — c'est du **code et une clé de configuration**, donc **L8**. ✅ **Inscrit au
périmètre de L8** dans `PLAN.md` §CF-4b, avec `contact@r92.fr` et les chaînes serveur à qualifier
une par une. ⚠️ **Le périmètre est inscrit, PAS la solution** : L8 aura sa propre analyse.

### 5. Contrôles

Toutes les recherches en **`LC_ALL=C.UTF-8`** *(D-039 §3a)*, avec un garde-fou vérifiant que les
accents sont bien vus **avant** de conclure quoi que ce soit.

| Contrôle | Résultat |
|---|---|
| `Perfs Racing`, `Génération R92`, `bandeau de don`, `Faire un don`, `comptes de l'asso`, `bénévoles R92`, `blason` — dans les **7 documents actifs traités** | ✅ **0** |
| `CF-4` non suivi de `a`/`b` dans `CF-2-…` | ✅ **0** · `CF-4a` = **4** · `CF-4b` = **0** |
| ⭐ **Réserves, qui doivent SURVIVRE** : `tournoi-r92` **53** · `boutique-r92` **40** · `theme-r92` **18** · `--r92-`/`.r92-` **124** · `.inv-blason` **5** | ✅ **toutes inchangées, avant et après** |
| Fichiers applicatifs modifiés *(`frontend/js`, `frontend/css`, `*.html`, `backend/*.gs`, `cloudflare/`, `.github/`)* | ✅ **aucun** |
| Formulations retenues, vraies dans l'état actuel du produit | ✅ *« Perfs du club »* est **déjà** le titre réel de la page *(`perfs.html:6` et `:26`, depuis L2)* — le lot **aligne la documentation sur le produit**, il n'invente aucun nom |

> ⚠️ **Le critère n'était PAS « zéro occurrence de Racing/R92 dans le dépôt », et il ne le sera
> jamais** *(`PLAN.md`, définition de la neutralité)*. Le critère est : **aucune attribution
> institutionnelle ACTIVE au présent dans le périmètre traité**. Les réserves techniques et
> l'historique **doivent** rester — et ils sont là, au compte près.

### 6. ⚠️ Documents ACTIFS vérifiés *(`CLAUDE.md` §12.4 point 2)*

- ✅ `README.md`, [`../architecture.md`](../architecture.md), `frontend/README.md`,
  [`../guide-utilisateur.md`](../guide-utilisateur.md), [`../deploiement.md`](../deploiement.md),
  [`../sponsors.md`](../sponsors.md), [`../structure-google-sheet.md`](../structure-google-sheet.md)
  — **ils SONT le patch**, corrigés dans le même lot ;
- ✅ [`../../backend/README.md`](../../backend/README.md) — **vérifié : ne devient pas faux.** Sa
  seule mention *(menu « Tournoi R92 »)* est un repère de **L8** ;
- ✅ [`../../CHANGELOG.md`](../../CHANGELOG.md) — **vérifié : aucune entrée à ajouter.** L7 est
  **strictement documentaire** : ⛔ un utilisateur ne remarquerait **rien**, et rien ne change dans
  ce sur quoi on peut compter *(critère de **D-035**)*. Le seul changement produit visible — la
  suppression du bandeau de don — **y figure déjà, daté du 2026-08-20** ;
- ✅ [`REFERENTIELS.md`](REFERENTIELS.md) — **vérifié : rien à changer.** L7 ne repose sur **aucun
  texte extérieur**, mais sur **D-038 / D-039**, fondement interne ;
- ✅ `CLAUDE.md` — **volontairement NON touché** : c'est le cadre de travail, pas la vitrine du
  produit ; sa seule mention institutionnelle *(§8 quinquies)* **est l'interdiction elle-même**.

### 7. ⛔ Ce que ce lot n'a pas fait

Aucun fichier de code, de style, de test, de workflow ni de configuration · aucun déploiement Apps
Script · aucune valeur du classeur · ⛔ **l'affiche du tournoi n'a pas été touchée**.

🔧 **M1 reste entier et reste BLOQUANT pour la clôture de CF-4b** : les valeurs
`url_site_association` / `url_instagram` du classeur, et surtout **l'affiche**, qui **voyage dans les
emails** *(image intégrée `cid:affiche`)*. ⚠️ **Un message parfaitement neutre portant une affiche
siglée rétablirait par l'image l'attribution que tout le chantier retire.**

### 8. Prochaine session recommandée

**Lot L8 — la neutralisation fonctionnelle du club.** ⚠️ **Second lot du chantier à exiger un
redéploiement chez Google** : **D-040** s'y applique directement — *une preuve de version doit être
discriminante*, et le témoin se choisit **sans apostrophe, sans accent et sans guillemet**.

---

## 15. Lot L8 — la neutralisation fonctionnelle du club

**2026-08-22** · ⛔ **patch appliqué localement, NON commité, NON redéployé.**

### 1. Ce qui rend cette session différente : quatre regards avant une seule main

**Méthode retenue par Romain** : trois audits **indépendants et parallèles**, en **lecture seule**
*(l'outillage lui-même les privait de toute écriture)*, puis **un seul intégrateur**, puis un
**contre-audit** sur le diff — sans lui donner le raisonnement qui l'avait produit.

| | Périmètre | Ce qu'il a rapporté |
|---|---|---|
| **A** | Perfs, architecture | 🔴 **Le piège du mot-clé vide** · le coût réseau réel · le rejet argumenté de trois solutions alternatives |
| **B** | Surfaces visibles | 🔴 **La clé boutique sort publiquement** · preuve **binaire** du faux positif `Case à cocher92` |
| **C** | Backend, tests, D-040 | ⛔ **Rejet du témoin proposé pour `Tests.gs`** · 🔴 **le risque N-3**, que personne n'avait demandé de chercher |
| **D** | Contre-audit du diff | *(voir §7)* |

🎯 **Ce que le dispositif a réellement produit, et c'est le point de la session** : **trois
arbitrages déjà validés ont dû être rouverts**, parce que les agents ont démontré que leurs
prémisses étaient **fausses**. ⛔ **Aucune relecture textuelle n'aurait pu le voir** — il fallait
lire ce que le code **fait**, pas ce qu'il dit.

### 2. 🔴 Les deux prémisses fausses, et comment elles ont été prises en défaut

**a) « `boutique_r92_disponible` est un identifiant interne. »** — **Faux.**

```
Code.gs:345   // getConfig est PUBLIC (page vitrine) → vue INVITATION filtrée
Code.gs:736   v.global.forEach(function (k) { ... gOut[k] = gIn[k]; });   ← les NOMS, verbatim
config.js:20  const API_URL = "https://script.google.com/.../exec"        ← fichier public
```

Ouvrir cette adresse renvoyait littéralement `"boutique_r92_disponible": "oui"`. ⭐ **La réserve des
identifiants CSS ne s'appliquait pas** : `--r92-navy` ne quitte jamais la feuille de style ; ce
nom-là était **publié par une API publique**.

**b) « Vide par défaut = état neutre. »** — **C'était l'état le plus dangereux.**

`String(nom).toLowerCase().indexOf('')` renvoie **0**, et `0 >= 0` est **vrai**. Démontré **par
exécution**, sur les deux versions du vrai fichier :

| Mot-clé vide, 5 équipes de test | Équipes retenues |
|---|---|
| **Ancienne logique** | 🔴 **5 sur 5** — bilan ≈ 50 % de victoires, plausible et faux |
| **Nouvelle logique** | ✅ **0** — et la page dit *« mot-clé non configuré »* |

### 3. La migration douce de la clé, et pourquoi elle tient en une fonction

⛔ **Renommer un paramètre ne renomme pas la ligne du classeur.** Sans reprise, le réglage de
l'organisateur disparaissait **sans un mot**.

⭐ **Ce qui a rendu la solution petite** : `lireConfig` est le **point de lecture UNIQUE** du
classeur — **20 appelants** y passent. Une seule fonction `appliquerAliasConfig`, **pure et
testable**, insérée là, couvre la vue publique, l'admin, les emails et les documents.

**Règle** : la clé canonique gagne dès qu'elle porte une valeur · l'ancienne n'est lue qu'en repli ·
elle n'est **jamais réécrite** · elle ne figure dans **aucune** liste blanche publique.
⛔ **Aucune manipulation du classeur n'a été faite ni n'est nécessaire.**

### 4. ⭐ Une découverte de méthode qui dépasse le lot

**Les 703 vérifications ont pu être exécutées hors d'Apps Script**, avec des doublures
*(`Logger`, `SpreadsheetApp`, `CacheService`…)*. Le harnais **reproduit exactement `703/703 OK,
0 FAIL` sur le commit `0f3dadb`** — c'est ce qui le valide — et donne **`715/715 OK, 0 FAIL`** après
le lot.

> 🎯 **Le projet tenait cette exécution pour impossible** *(« les tests ne tournent que dans
> l'éditeur »)*. Elle ne remplace pas le contrôle chez Google — `CLAUDE.md` **§13.6** reste entier,
> et **seule l'exécution réelle fait foi** — mais elle transforme un chiffre **supposé** en chiffre
> **mesuré avant le collage**. ⚠️ **À confirmer sur d'autres lots avant d'en faire une pratique.**

### 5. Ce qui a été CONSERVÉ, et pourquoi ce n'est pas un renoncement

| Conservé | Motif |
|---|---|
| Préfixe `R92 — ` du bilan | Invisible de l'utilisateur, et **c'est le repère de preuve de D-040** |
| Menu « Tournoi R92 » du classeur | Même réserve · ⚠️ `onOpen` n'est **pas** rechargé par un redéploiement |
| `92350 Le Plessis-Robinson` · « associations du 92 » | Un **code postal** et un **département** |
| `Case à cocher91/92` | **Identifiants Adobe** du formulaire fédéral — preuve binaire d'Agent B |
| `--r92-*`, `.r92-*`, `theme-r92.css`, `r92_*`, nom du dépôt | Réserves **D-039 #13/#14** |

### 6. ⚠️ Le risque que personne n'avait demandé de chercher — N-3

Agent C a relevé que **`docs/deploiement.md` porte deux nombres volatils** *(bilan et nombre de
lignes)* et que `backend/README.md` **en recopie un**. Une seule ligne reformatée les rendait faux
— *« un repère qui ne correspond plus ne prouve plus rien »*. ➡️ **Tous remesurés**, jamais
recopiés : `Code.gs` **8342**, `Tests.gs` **4314**, bilan **715/715**.

### 7. ⚠️ Documents ACTIFS vérifiés *(`CLAUDE.md` §12.4 point 2)*

- ✅ **Corrigés dans le lot** : `docs/deploiement.md` *(ping ×2, les deux repères, le témoin du lot)*
  · `backend/README.md` *(le nombre de lignes recopié)* · `docs/structure-google-sheet.md`
  *(les deux clés, le contact)* · `docs/guide-utilisateur.md` *(le réglage Perfs)* ·
  `CHANGELOG.md` *(un club voit changer la pastille et le fichier d'agenda)* ;
- ✅ **Vérifiés, ne deviennent PAS faux** : `README.md` et `docs/architecture.md` — ils décrivent la
  page Perfs sous son nom générique et ne mentionnent ni la clé boutique, ni le mot-clé du club ;
- ⚡ **`PLAN.md` corrigé** : son affirmation *« la page Perfs est textuellement générique »* était
  **inexacte**. ⛔ **L'histoire n'est pas réécrite** — la correction dit ce que L2 avait bien
  neutralisé *(le HTML)*, ce qui lui avait échappé *(le JS)*, et qui l'a trouvé.

### 8. ⛔ Ce que ce lot n'a PAS fait

Aucun commit · aucun push · **aucun redéploiement** · aucune modification du classeur ·
⛔ **l'affiche n'a pas été touchée**. 🔧 **M1 reste entier et BLOQUANT pour la clôture de CF-4b.**

---

## 16. Lot correctif R-094 — la date civile

**2026-08-22** · ⛔ **patch appliqué localement, NON commité, NON redéployé.**
🔖 **Hors CF-4b** — ce lot ne neutralise rien : c'est une **correction de fiabilité P1**, ouverte
séparément à la demande de Romain pour ne pas la mélanger au chantier institutionnel.

### 1. Comment le défaut a été découvert, et pourquoi c'est l'essentiel

Romain a testé le parcours réel d'un club **depuis l'aéroport JFK, fuseau `America/New_York`
(EDT, UTC−4)**, pendant une rotation. La date du tournoi configurée à l'administration était
**13/03/2027**. Le dossier du club et l'email affichaient **« 12 mars 2027 »**.

> 🎯 **Ce défaut est INVISIBLE depuis la France.** À Paris, `new Date('2027-03-13')` donne bien le
> 13 mars — parce que l'heure locale y est **en avance** sur l'heure de référence mondiale. Il ne
> se manifeste qu'à l'**ouest** de Greenwich. Aucune relecture de code faite en métropole ne
> l'aurait vu ; **seul un test réel en déplacement l'a fait apparaître.**

### 2. ⚠️ Le premier diagnostic était FAUX, et il venait du rapport initial

Le signalement disait : *« le fichier est nommé `tournoi-2027-03-13.ics` alors que l'événement est
le 12/03 — à corriger côté nom de fichier. »*

⛔ **La correction demandée aurait aggravé le défaut.** Le nom du fichier et la date de l'événement
sont fabriqués **à partir de la même chaîne**, côté serveur : ils ne *peuvent pas* se contredire.
Lecture faite du `.ics` téléchargé, `DTSTART` portait bien **le 13** — **le fichier d'agenda était
sain**. Le décalage était **ailleurs** : à l'**affichage** du dossier et de l'email.

> ⭐ **La leçon de méthode** : ne pas corriger ce qui est *rapporté*, corriger ce qui est *établi*.
> Le seul geste utile a été de demander à lire la ligne `DTSTART` du fichier réel.

### 3. La cause exacte, en une ligne de langage courant

**`tournoi_date` est une DATE CIVILE — « le 13 mars » — pas un INSTANT.** Or l'application la
donnait à lire à une fonction qui, devant `'2027-03-13'`, comprend **« minuit à l'heure de
Greenwich »**. Ramenée à l'heure de New York, ce minuit devient **19 h la veille** : le 12.

| Surface | Fichier | Avant | Après |
|---|---|---|---|
| Dossier du club, email | `frontend/js/commun-dossier.js:91` `dateLongueFr` | 🔴 décalée | ✅ |
| Bandeau d'administration | `frontend/js/admin-infos-publication.js:77` `formaterDateFr` | 🔴 décalée | ✅ |
| Fichier d'agenda `.ics` | `backend/Code.gs` | ✅ **déjà sain** | inchangé |
| Trois autres formateurs | `admin-conformite-ffr.js` · `admin-autorisation.js` · `perfs.js` | ✅ déjà sains *(découpage de la chaîne, sans conversion)* | inchangés |

### 4. La correction : **un seul** point commun, pas trois rustines

Un helper unique **`dateLocaleDepuisISO`** est posé dans `frontend/js/commun.js` — vérifié **chargé
en rang 1** sur les **4** pages qui consomment un formateur. Il distingue **deux natures** :

- une **date civile** `AAAA-MM-JJ` *(motif **ancré aux deux bouts**)* → construite **jour par jour**
  dans le fuseau du lecteur : le 13 reste le 13, partout ;
- un **instant** *(la chaîne porte une heure, `…T…`)* → laissé à l'interprétation native,
  **exactement comme avant**.

⚠️ **Contrôle de retour obligatoire** : `new Date(2027, 12, 45)` ne proteste pas, il **déborde** sur
février 2028. Sans relecture des trois composants, `2027-13-45` se serait affiché
*« lundi 14 février 2028 »* — **une date fausse mais plausible**, pire que la chaîne brute.
C'est un **test qui l'a attrapé**, pas une relecture.

### 5. Ce que le contre-audit indépendant a corrigé — et il avait raison

| | Ce qu'il a établi |
|---|---|
| 🔴 **Motif non ancré** | Sans ancrage, `'2027-03-12T23:00:00.000Z'` aurait été **tronqué** à sa date UTC : *« vendredi 12 mars »* à Paris, là où l'ancien code affichait correctement *« samedi 13 »*. ➡️ **Le correctif aurait inversé le défaut contre la France.** Ancrage + `.trim()` + branche « instant » ajoutés. |
| ✅ **Aucune régression d'entrée réelle** | Les **7 surfaces** reçoivent toutes du `AAAA-MM-JJ` **strict** — garanti soit par un motif ancré côté serveur *(`Code.gs:4031-4033`, `3982-3984`)*, soit par `Utilities.formatDate('yyyy-MM-dd')`, soit par concaténation *(`Code.gs:1809`)*. |
| ⚠️ **Deux documents obligatoires** | `AUDIT-TOURNOI-R92.md` classait ce défaut *« connu et non traité »* — **devenu faux** · `CHANGELOG.md` — un club **remarque** la date de son tournoi. |

### 6. Preuves exécutées *(6 fuseaux, `Europe/Paris` → `Pacific/Kiritimati`)*

- **Dates civiles** *(`2027-03-13`, `2027-01-01`, `2027-12-31`, `2028-02-29`)* : **1 seule valeur**
  sur les 6 fuseaux. Avant : `2027-03-13` donnait *« vendredi 12 mars »* à New York et Honolulu ;
- **Instants** *(12 comparaisons avant/après)* : **12 IDENTIQUE / 12** ;
- **Entrées invalides** *(`2027-02-30`, `2027-13-45`, vide, `null`, `abc`)* : chaîne brute, stable ;
- **26 fichiers JS** : `node --check`, 0 erreur.

> ⚡ **Seule différence à Paris** : `2027-02-30` n'affiche plus *« mardi 2 mars 2027 »* mais la
> chaîne brute. **C'est une amélioration** — une date inexistante ne doit pas devenir plausible.

### 7. ⚠️ Dette consignée, NON traitée : le dépôt `boutique-r92`

`assets/js/main.js:12-14` du dépôt **séparé** `boutique-r92` porte **le même défaut**.
⛔ **Volontairement non corrigé ici** : autre dépôt, autre lot. Consigné à **R-094**.

### 8. Documents ACTIFS vérifiés *(`CLAUDE.md` §12.4 point 2)*

- ✅ **Corrigés dans le lot** : `CHANGELOG.md` · `AUDIT-TOURNOI-R92.md` ·
  🆕 `CLAUDE.md` **§8 sexies — règle de la date civile** *(garde-fou permanent validé par Romain)* ;
- ✅ **Vérifiés, ne deviennent PAS faux** : `README.md` · `docs/architecture.md` ·
  `backend/README.md` · `docs/deploiement.md` — **aucun fichier serveur n'est touché**, donc aucun
  repère de redéploiement ni bilan de tests ne bouge · `docs/guide-utilisateur.md` — la date
  s'affiche au même endroit, seule sa **valeur** cesse d'être fausse.

### 9. ⛔ Ce que ce lot n'a PAS fait

Aucun commit · aucun push · **aucun redéploiement** · **aucun fichier `backend/` touché** · aucune
modification du classeur · ⛔ **le dépôt `boutique-r92` n'a pas été ouvert en écriture**.
🔧 **M1 et le redéploiement de L8 restent entiers.**

---

## 17. M1-A — la mise à plat documentaire du chantier « profil du club »

**2026-08-24** · ✅ **commit `9abaebc`** sur la branche `claude/m1-club-config-analysis-zrqy6g`.
⛔ **Aucune fusion vers `main`.** ⛔ **Aucun code, aucun test, aucune configuration, aucun
déploiement, aucune donnée du classeur.**

### 1. Ce qui a été demandé, et ce qui a changé en route

Romain a demandé de **remettre en question le périmètre de M1** avant toute modification. M1 était
inscrit au plan comme une **opération manuelle** : vider `url_site_association` et `url_instagram`,
remplacer l'affiche du tournoi.

L'audit a conclu que **ces valeurs sont le symptôme, pas la cause** : l'application **n'a aucun
endroit où un club se décrit**. Les vider retire l'attribution résiduelle ; cela ne donne à aucun
club le moyen de mettre la sienne.

➡️ **M1 devient un chantier d'externalisation progressive en 6 étapes M1-A → M1-F**
*(`PLAN.md` **§15**)*. ⭐ **Arbitrage de Romain** : *« je préfère que la neutralisation finale soit
la conséquence de la bonne architecture plutôt qu'une modification temporaire que nous devrions
reprendre ensuite. »*

### 2. Le défaut qui commande la suite

`reinitialiserTournoi` *(`Code.gs:7437-7512`)* efface **40 paramètres** de la zone A.
⛔ **Aucun n'est un `org_*` : les 36 sur 36 survivent**, dont **26 purement événementiels**.

**Ce que ça produit** : un tournoi neuf rouvre la demande d'autorisation **déjà remplie** avec les
valeurs de l'édition passée — médecin, association de secours, prix des repas, nombre d'arbitres —
marquées *« saisi »*, et le compteur annonce **0 champ manquant**. Le dossier peut partir à la Ligue
avec des chiffres périmés, **sans aucun signalement**.

> ⚠️ **Ce n'est PAS une découverte, et il faut le dire.** **R-033 le décrivait depuis le
> 2026-08-06**, sous l'angle des **données personnelles** : *« la réinitialisation conserve […] tous
> les contacts de la demande FFR »*. L'audit du domaine B l'avait vu, et avait même noté que
> *« `CHAMPS_AUTORISATION` n'est utilisé qu'en écriture, jamais en effacement »*.
>
> **Ce qui est réellement nouveau** : ① **l'étendue** — 36 sur 36, pas seulement les contacts ;
> ② **la nature de la conséquence** — elle est aussi **métier**, pas seulement RGPD.
> ➡️ **R-033 a donc été ÉLARGI par un addendum daté, jamais dupliqué.**

### 3. Les quatre décisions

| | Ce qu'elle porte |
|---|---|
| **D-042** | Principe directeur *(et son garde-fou : une habitude n'est pas une vérité)* · les **7 familles** · ⭐ le **cycle de vie A/B/C** · la **règle des rôles** · le **profil vivant** |
| **D-043** | Les 36 `org_*` : **10 conservés / 26 vidés + récompenses**, et les 3 points d'application |
| **D-044** | Profil ≠ **répertoire de tiers** · logo ≠ **charte graphique** |
| **D-045** | **Fidélité aux libellés officiels** · **nom officiel ≠ nom d'usage** |

⭐ **Le cœur du chantier tient en trois lignes** *(D-042)* :
🏛️ **permanente ⇒ lecture directe** · 🏟️ **proposée ⇒ copie volontaire, aucun lien vivant** ·
🗓️ **événementielle ⇒ aucun lien**.

### 4. Le document neuf, et comment il a été fabriqué

🆕 **`M1-LIBELLES-OFFICIELS.md`** — la table **clé technique ↔ libellé officiel FFR ↔ usage**.

⚠️ **Les libellés ne sont pas lisibles directement dans le PDF** : il emploie des **polices en
sous-ensemble à encodage propre**. Une lecture naïve renvoie du charabia, et **la page 5 ne renvoie
rien du tout**. La méthode qui marche — et elle est écrite dans le document, sans quoi personne ne
pourrait la revérifier : extraire les **26 tables `ToUnicode`** du PDF, décompresser les **7 flux de
page**, puis décoder **police par police** *(la page 5 en utilise **six**)*.

**Résultat : 21 libellés de Maxilou s'écartent du vocabulaire officiel.** Le plus parlant :
Maxilou demande *« Nombre de vestiaires »*, le formulaire demande *« Nombre de vestiaires
**utilisés** »*. ⭐ **Un stade peut en avoir six et n'en utiliser que quatre — le mot manquant
changeait la réponse.**

### 5. ⚠️ Une correction que la session a dû se faire à elle-même

Le plan validé annonçait de corriger `admin-autorisation.js` de **1 011 → 1 014** dans
`architecture.md`. **Deux choses étaient fausses.**

**① Le nombre.** `1 014` venait d'un lecteur comptant une **ligne fantôme** après le dernier saut de
ligne. La méthode écrite par le projet — `architecture.md` §7, *« `wc -l` sur chaque fichier »* —
donne **1013**.

**② Et surtout : `1 011` n'était pas FAUX, il était DATÉ.** Le §7 annonce *« Relevé du
2026-08-09 »*, et `git show` confirme qu'à cette date le fichier faisait **exactement 1 011
lignes**. Il a grandi avec le lot CF-4b/L8.

> 🎯 **La leçon, et elle vaut au-delà de ce chiffre.** Corriger **une seule ligne** d'un tableau daté
> l'aurait rendu **plus trompeur qu'avant** : un chiffre frais parmi vingt-cinq anciens, sans qu'on
> puisse dire lesquels. ➡️ **Les 26 fichiers ont été remesurés et le relevé redaté.** Contrôle
> final : **26/26 concordent avec `wc -l`.**
>
> ⭐ **C'est exactement ce à quoi sert le §7** : *un chiffre juste ne prouve pas une méthode juste ;
> seule une méthode écrite peut être prise en défaut.*

### 6. Le registre

| | |
|---|---|
| 🆕 **R-095** *(P2)* | **Le nom du stade disparaît du document déposé à la Ligue** — le formulaire demande *« Adresse du tournoi (stade, ville, cp) »* en **un seul champ**, et `admin-autorisation.js:698` écrit l'adresse **OU** le stade. ⛔ **HORS M1** *(arbitrage **H13** de Romain)* : le critère de M1-E1 est *« PDF identique »*, il **masquerait** la correction |
| 🆕 **R-096** *(P2)* | **Douze réglages n'ont aucun écran** et s'écrivent à la main dans le classeur, dont `nb_demi_journees`, **clé de la grille de temps FFR** |
| ⚡ **R-033** | **Périmètre élargi** *(voir §2)*. Cible fixée par **D-043**, correction en **M1-B** — ⛔ **NON FAITE** |

> ⛔ **Rien n'a été inscrit là où le registre couvrait déjà** : les miroirs serveur/navigateur
> restent **R-044** et **R-082**, les bibliothèques orphelines **R-080**, la destructivité de la
> réinitialisation **R-016**.

### 7. ⛔ Ce qui n'a PAS pu être fait, et ce n'est pas un choix

Romain avait **explicitement autorisé** la lecture seule de `url_site_association` et
`url_instagram` dans le classeur en service, puis leur vidage **si** elles portaient encore une
attribution institutionnelle.

⛔ **La lecture est impossible depuis cette session** : la politique réseau de l'environnement
distant refuse `script.google.com` *(**403** au `CONNECT`)*. Sa documentation interdit de contourner
un refus de politique. ➡️ **La condition n'a donc pas pu être établie, et rien n'a été vidé.**

⛔ **Aucune valeur du classeur n'a été lue ni modifiée.** **La lecture reste en attente**, et peut
être faite depuis un navigateur : l'action `getConfig` est **publique**.

### 8. Corrections d'état apportées à la documentation de suivi

- **`ETAT.md` / R-094** — la ligne annonçait *« appliqué localement, non commité »*. **C'était faux
  depuis le 2026-08-22 à 17 h 04** : le travail **est** le commit `94cd6a2`, présent sur
  `origin/main`. ⚠️ *(La fiche **§16** de ce journal, elle, **n'est pas réécrite** : elle disait vrai
  à sa date — règle de l'en-tête de ce fichier.)* La mention **« non redéployé » reste vraie**, et
  vaut aussi pour **CF-4b/L8** ;
- **`ETAT.md` / CF-4b** — *« 2 lots sur 8 »* datait du jour de l'ouverture ; **les 8 lots sont
  faits**. Le chantier reste **non clos** *(redéploiement + M1)* ;
- **`architecture.md`** — voir §5.

### 9. Contrôles passés

| Contrôle | Résultat |
|---|---|
| Les 36 `org_*` documentés = ceux du code | ✅ **36 = 36**, aucun écart · et **3 sources concordent** *(`creerOngletConfig` = `CHAMPS_AUTORISATION` = `AUTORISATION_SAISIE`)* |
| Les libellés officiels retrouvés dans le PDF | ✅ **55/55** *(le seul « manquant » était une notation compacte, vérifiée ensuite une à une)* |
| Comptes de lignes de `architecture.md` | ✅ **26/26** concordent avec `wc -l` |
| Liens relatifs des 7 documents | ✅ **45/45** valides |
| Comptes structurels remesurés | ✅ **inchangés** : 65 actions · 8 pages · 26 fichiers JS · 4 bibliothèques · 12 onglets · 20 scripts |
| Fichiers hors périmètre dans l'index | ✅ **aucun** — 7 fichiers indexés nommément |

### 10. Documents ACTIFS vérifiés *(`CLAUDE.md` §12.4 point 2)*

- ✅ **Corrigés dans le lot** : `docs/architecture.md` *(11 comptes de lignes, relevé redaté)* ·
  `docs/structure-google-sheet.md` *(les 36 `org_*` + 4 paramètres non documentés)* ;
- ✅ **Vérifiés, ne deviennent PAS faux** : `README.md` *(aucune page, aucun fichier, aucun onglet
  nouveau)* · `backend/README.md` *(aucun fichier serveur touché)* · `docs/deploiement.md` *(aucun
  repère de redéploiement ne bouge — ni le bilan de tests, ni les nombres de lignes de `Code.gs` et
  `Tests.gs`)* · `CHANGELOG.md` — ⭐ **et c'est un choix, pas un oubli** : ce lot **ne change ni ce
  que l'application fait, ni ce qu'elle montre, ni ce sur quoi on peut compter**. Le journal du
  produit s'ouvrira à **M1-B**, qui change réellement un comportement.

### 11. ⛔ Ce que ce lot n'a PAS fait

Aucune fusion vers `main` · aucun code · aucun test · aucune configuration · **aucun
redéploiement** · **aucune donnée du classeur lue ou modifiée** · ⛔ **l'affiche, `tournoi_affiche_id`
et le logo n'ont pas été touchés** · ⛔ **M1-B n'est pas commencée.**

🔧 **Reste entier** : la lecture des deux URL · le redéploiement de la **part backend de L8** ·
**M1-B → M1-F** · la clôture de **CF-4b**, et **CF-4a** suspendue derrière elle.

### 12. ⚡ Addendum du 2026-08-24 *(suite)* — deux corrections apportées après le commit `9abaebc`

> ⚠️ **Cette fiche a été publiée avec deux affirmations fausses. Elles sont corrigées ci-dessous, et
> la correction est inscrite plutôt que la trace effacée** — la première d'entre elles figurait à la
> ligne « Reste entier » du §11, qui annonçait *« le redéploiement de **L5** et L8 »*.

#### 12.1 — 🔴 L5 EST déployé : l'affirmation contraire était fausse

Le rapport de session de M1-A, comme le §11 ci-dessus, affirmait que le serveur en service
*« ignore toujours CF-4b/L5 »*. ⛔ **C'est faux, et le dépôt le disait déjà** — `SESSIONS.md` **§13**
et `PLAN.md` §14.3 documentent **L5-B** en détail : `Code.gs` et `Tests.gs` recopiés chez Google et
**enregistrés**, **nouvelle version du même déploiement**, `R92 — 703/703 OK, 0 FAIL`, ping conforme,
et ⭐ **un email réellement reçu** portant `From: "L'organisation du tournoi"` *(20/08/2026,
17:08 UTC)* là où un message du matin même, **même boîte, même adresse d'envoi**, portait
`From: "Génération R92"`.

#### 12.2 — ⭐ Ce que l'erreur a révélé : il y a DEUX surfaces de déploiement, pas une

C'est la vraie leçon de cet addendum, et elle vaut au-delà de M1.

| Surface | Comment elle se déploie | Qui la déclenche |
|---|---|---|
| **Frontend** *(`frontend/**`)* | **AUTOMATIQUE** — workflow GitHub Pages à chaque poussée vers `main` | ⚙️ la machine |
| **Backend** *(`backend/Code.gs`, `Tests.gs`)* | **MANUEL** — copier-coller chez Google, puis nouvelle version du même déploiement | 🧑 un humain |

➡️ **Dire « le lot X n'est pas déployé » n'a donc aucun sens tant qu'on n'a pas dit DE QUELLE
SURFACE on parle.** C'est exactement l'imprécision qui a produit les deux erreurs.

**L'état réel, vérifié le 2026-08-24 :**

| Lot | Part backend | Part frontend |
|---|---|---|
| **CF-4b/L5** *(`5649f83`)* | ✅ **redéployée** *(L5-B, prouvée par un email reçu)* | — *(le lot ne touche que `Code.gs`)* |
| **CF-4b/L8** *(`be57f97`)* | ⛔ **NON redéployée** | ✅ **publiée** — workflow Pages **`success`**, 2026-08-22 **15:24:34 UTC** |
| **R-094** *(`94cd6a2`)* | — ⭐ **le lot ne touche AUCUN fichier `backend/`** | ✅ **publiée** — Pages **`success`**, 2026-08-22 **17:04:24 UTC** |

> 🎯 **Le point le plus contre-intuitif, et il mérite d'être retenu** : **R-094 n'attend aucun
> redéploiement.** Son correctif vit dans `commun.js`, `commun-dossier.js` et
> `admin-infos-publication.js` — **que du frontend**. Écrire *« R-094 n'est pas redéployé »* laissait
> croire à une correction en attente, alors qu'**elle est en service depuis le 22 août à 17 h 04**.

#### 12.3 — Deux affirmations PRÉEXISTANTES corrigées au passage

Le contrôle a trouvé deux cases de suivi devenues fausses **avant** M1-A, et qui contredisaient
d'autres passages des mêmes fichiers :

- `ETAT.md` *(tableau des chantiers)* et `PLAN.md` §14.3 annonçaient **L8 « patch appliqué, non
  commité »** — faux depuis le **2026-08-22** *(`be57f97`, poussé sur `origin/main`)* ;
- `PLAN.md` §14.3 annonçait **« 7 lots sur 8 terminés, 1 non commencé (L8) »** — **les 8 sont
  terminés**.

> ⭐ **Trois décrochages du même type en trois jours** *(R-094, « 2 lots sur 8 », L8)*, et **toujours
> la même cause** : *un état écrit AVANT le geste, jamais relu APRÈS.* C'est **§12.4** appliqué à
> moitié — le point 1 *(mettre à jour le suivi)* est fait, mais **avant** que le geste n'ait eu lieu.

#### 12.4 — Ce que cet addendum n'a PAS fait

⛔ Aucune fusion vers `main` · aucun code · **aucun redéploiement** · **aucune donnée du classeur** ·
⛔ **les commits `9abaebc` et `b65a6b0` n'ont été ni amendés ni rebasés** — leurs SHA sont intacts ·
⛔ **M1-B n'est pas commencée.**

### 13. 🏁 Addendum du 2026-08-24 *(fin de journée)* — M1-A est fusionnée dans `main`

> ⚠️ **Les §11 et §12.4 ci-dessus écrivent « Aucune fusion vers `main` ». C'était VRAI à leur date**,
> et ces lignes **ne sont pas réécrites** : au moment où chacun de ces deux lots a été produit,
> aucune fusion n'avait eu lieu. **Le nouvel état s'ajoute, il ne remplace pas.**

**Romain a validé M1-A le 2026-08-24 et autorisé sa fusion contrôlée.**

| | |
|---|---|
| **Mode** | ⭐ **Fast-forward UNIQUEMENT** *(`git merge --ff-only`)* — exigé par Romain pour **préserver les trois SHA** |
| **Avant** | `origin/main` = `94cd6a2` · branche = `aff6d5f`, **3 commits d'avance, 0 de retard** |
| **Après** | `origin/main` = **`aff6d5f`** |
| **Commits réécrits** | ⛔ **aucun** — ni squash, ni rebase, ni amend |
| **Commit de fusion créé** | ⛔ **aucun** — le fast-forward n'en produit pas |
| **Périmètre réellement publié** | **8 fichiers, tous `.md`, tous sous `docs/`** — 1 412 insertions, 24 suppressions |

**Les trois commits, désormais dans l'historique de `main`** : `9abaebc` · `b65a6b0` · `aff6d5f`.

#### 13.1 — ⚠️ Un piège de lecture rencontré pendant la fusion, et il vaut d'être noté

La sortie du `git merge --ff-only` a listé **33 fichiers**, dont `backend/Code.gs`, `backend/Tests.gs`
et une dizaine de fichiers `frontend/`. **De quoi croire que M1-A touchait au serveur.**

⛔ **Ce n'était pas le cas.** La cause est ailleurs : **le `main` LOCAL de cette session était resté à
`ce64f35`, trois commits derrière `origin/main`**. Le fast-forward a donc rattrapé **six** commits —
les trois de M1-A **plus** les trois qui étaient déjà publiés *(`0f3dadb`, `be57f97`, `94cd6a2`)*.
**`backend/Code.gs` vient de `be57f97`** *(le lot L8)*, présent sur `origin/main` depuis le
2026-08-22.

> 🎯 **La leçon, et elle est simple** : *ce qu'un fast-forward affiche n'est pas ce qu'il publie.*
> Le périmètre réellement poussé se lit avec `git diff origin/main..HEAD` **avant** le push — et il
> donnait bien **8 fichiers `.md`**.

#### 13.2 — Les deux surfaces, une fois de plus

⛔ **Le push n'a déclenché AUCUNE publication.** Vérifié dans les exécutions GitHub Actions : **aucun
run du workflow Pages pour `aff6d5f`**. C'est le comportement attendu — le workflow ne se déclenche
que sur `paths: frontend/**`, et cette fusion ne touche que `docs/`.

➡️ **Donc : ni frontend republié, ni backend redéployé.** ⛔ **Rien n'a changé dans ce que voit un
utilisateur.**

#### 13.3 — Ce que cet addendum n'a PAS fait

⛔ Aucun redéploiement Apps Script · aucun collage de `Code.gs` ni de `Tests.gs` · **aucune donnée du
classeur** · aucune modification des deux URL *(toujours **non lues** — politique réseau)* · aucune
modification de l'affiche · ⛔ **M1-B n'est pas commencée.**

---

## 18. Micro-lot méthodologique — la règle de l'état constaté après le geste

> 🗓️ **2026-08-24 *(soir)***, entre **M1-A** *(close)* et **M1-B** *(non commencée)*.
> ⛔ **Aucun changement fonctionnel.** Lot **documentaire et méthodologique**.
>
> ⭐ **Cette fiche est écrite APRÈS la poussée, et c'est le but** : elle est la **première
> application** de la règle qu'elle raconte. Chaque affirmation ci-dessous a été **constatée par une
> commande ou par l'interface de GitHub**, pas déduite d'une intention.

### 18.1 — Ce qui a été demandé

Romain a constaté que **quatre fois en trois jours**, un état de suivi avait été écrit **avant** un
geste, le geste avait eu lieu, et l'état n'avait **jamais été relu après** — laissant la
documentation fausse alors que l'opération, elle, s'était correctement déroulée.

**Les quatre** : **R-094** *(« appliqué localement, non commité »)* · le **« 2 lots sur 8 »** de
CF-4b · **CF-4b/L8** *(« patch appliqué, non commité »)* · **M1-A** *(« NON FUSIONNÉE dans `main` »
après sa fusion)*.

🎯 **La demande** : en faire une **règle permanente**, et lever au passage une ambiguïté de M1-A.

### 18.2 — Ce qui a été écrit

| Où | Quoi |
|---|---|
| 🆕 **`CLAUDE.md` §8 septies** | **« Règle de l'état constaté APRÈS le geste »** — la règle, le tableau *« geste ➡️ ce qui le constate »*, les trois temps, le repérage mécanique, et ⛔ **la protection explicite des traces historiques** |
| **`CLAUDE.md` §12.4** | un **point 5 neuf** : relire, après le geste, ce que les documents d'état en affirment. Les anciens 5, 6, 7 deviennent 6, 7, 8 — ⛔ **les points 1 et 2, seuls cités ailleurs dans le dépôt, sont inchangés** |
| **`CLAUDE.md` §12.4 bis** | le **rapport de fin de session** dit ce qui a été **constaté** |
| **`DECISIONS.md`** | **D-046** *(la règle)* et **D-047** *(clôture de M1-A, reliquat externe)* |
| **`ETAT.md`** · **`PLAN.md`** | la levée d'ambiguïté de M1-A, et le suivi du reliquat |

> 🎯 **La cause n'était pas l'attention, c'était l'ORDRE** — et c'est pour cela que §12.4 a dû
> bouger : elle demandait d'écrire l'état *(point 1)* **avant** le commit *(point 4)*, et rien
> ensuite ne demandait de le relire. **Une méthode suivie correctement produisait un document faux.**

### 18.3 — La levée d'ambiguïté sur M1-A

Deux affirmations coexistaient : **« M1-A est TERMINÉE »** et **« une seule chose reste en attente
dans M1-A »**. ⚠️ **Une étape dont quelque chose reste en attente n'est pas close.**

- 🏁 **M1-A est DÉFINITIVEMENT CLÔTURÉE** — son statut ne dépend plus de rien ;
- 🔻 la lecture de `url_site_association` et `url_instagram` devient un **RELIQUAT EXTERNE, non
  bloquant** : l'empêchement vient de **l'environnement** *(403 réseau vers `script.google.com`)*,
  pas du projet ;
- il reste **tracé** au `PLAN.md` **§15.8** et **repris par M1-F** à défaut d'être fait avant ;
- ⛔ **il ne déclenche pas M1-B**, qui n'a **pas commencé**.

### 18.4 — ⭐ Les gestes, et ce qui les a CONSTATÉS

**Commit 1** — `docs(methode): une règle permanente pour les états écrits avant le geste`

| | Constaté |
|---|---|
| **SHA réel** | **`d771a0e`** *(`git rev-parse HEAD` après le commit)* |
| **Contenu réel** | **4 fichiers, tous `.md`** : `CLAUDE.md` · `DECISIONS.md` · `ETAT.md` · `PLAN.md` — **374 insertions, 17 suppressions** *(`git show --stat`)* |
| **Aucun autre fichier** | ✅ `git status --porcelain` **vide** après le commit |
| **Branche poussée** | **`claude/verification-post-geste-nar0sp`**, et elle **seule** |
| **Tête distante** | `origin/claude/verification-post-geste-nar0sp` = **`d771a0e`**, écart local/distant **0 / 0** |
| **`origin/main`** | **`3300fca`**, ⛔ **inchangé** — vérifié **après** un nouveau `git fetch` |
| **Fusion vers `main`** | ⛔ **AUCUNE** — `git branch -r --contains d771a0e` ne renvoie que la branche de travail |
| **GitHub Actions** | ⛔ **AUCUNE exécution déclenchée.** Vérifié dans la liste des exécutions du dépôt : la dernière date du **2026-08-22 17:04 UTC** *(commit `94cd6a2`)*. ⚠️ **Ce n'est pas une déduction** — c'est le comportement attendu *(le workflow ne se déclenche que sur `frontend/**`)*, **mais il a été constaté avant d'être écrit** |
| **Déploiement applicatif** | ⛔ **AUCUN** — ni GitHub Pages, ni Apps Script |

⛔ **Aucun fichier `frontend/`, aucun fichier `backend/`, aucun test, aucune donnée du classeur.**

### 18.5 — Ce que ce lot n'a PAS fait

⛔ **M1-B n'est pas commencée** · ⛔ aucune fusion vers `main` · ⛔ aucun redéploiement Apps Script ·
⛔ aucune publication frontend · ⛔ **les deux URL n'ont toujours PAS été lues** *(§9 : leur contenu
est un **INCONNU**, pas un probable)* · ⛔ aucune trace historique réécrite — `AUDIT.md`,
`RAPPORT-AUDIT.md`, le `CHANGELOG` et les fiches §1 à §17 de ce journal **ne sont pas touchés**.

### 18.6 — Documents ACTIFS vérifiés *(`CLAUDE.md` §12.4 point 2)*

✅ **`README.md`, `docs/architecture.md`, `backend/README.md` et `CHANGELOG.md` ont été vérifiés :
aucun ne devient faux.** Le lot ne change ni comportement, ni écran, ni action serveur, ni fiabilité
— le critère du `CHANGELOG` *(« quelqu'un qui utilise l'application le remarquerait-il ? »)* n'est
pas atteint.

### 18.7 — Trois points relevés, ⛔ NON corrigés dans ce lot — à arbitrer

1. **`ETAT.md` §7 « DÉCISIONS VALIDÉES » a décroché** : son tableau s'arrête à **D-029**, alors que
   `DECISIONS.md` porte **47 fiches** *(D-001 → D-047, comptées le 2026-08-24)*. C'est **§8 bis
   appliqué aux documents de suivi eux-mêmes** — un tableau qu'aucune règle ne garde ;
2. **les risques de méthode** *(`RAPPORT-AUDIT.md`, M-01 → M-06)* **ne portent pas ce défaut** :
   faut-il un **M-07** ? ⚠️ `RAPPORT-AUDIT.md` étant une **synthèse close**, cela ne se fait pas sans
   décision ;
3. **le `main` LOCAL de la session était resté 7 commits en arrière** — le piège exact qui, pendant
   la fusion de M1-A, avait fait croire que le lot touchait au serveur *(§13.1)*. ⚠️ **Ce n'est pas
   un fait du dépôt** mais l'état d'une **copie de travail**, et il ne se constate donc pas depuis
   GitHub. ⏳ **Au moment où cette fiche est écrite, sa remise à niveau n'a pas encore eu lieu** —
   elle est demandée juste après, **par fast-forward seul**, ⛔ sans aucun commit ni aucune poussée
   sur `main`. **Son résultat est constaté dans le rapport de fin de session, pas ici.**

> ⭐ **Cette dernière ligne est la règle en action, et elle mérite d'être lue deux fois.** Une
> première rédaction de cette fiche annonçait ce geste **comme fait** — alors qu'il ne l'était pas.
> ⛔ **Écrire au passé un geste qu'on s'apprête à faire est EXACTEMENT le défaut que §8 septies
> corrige**, et il s'est présenté **dans la fiche même qui l'institue**. La phrase a été remise
> **au futur** *(§12.4 bis)*.

---

## 19. M1-B — la réinitialisation cesse de conserver l'édition passée

> 🗓️ **2026-08-24**, chantier **M1**, étape **M1-B**. Décision **D-043**, problème **R-033**.
>
> ⭐ **Cette fiche est écrite APRÈS le commit et APRÈS la poussée** *(`CLAUDE.md` §8 septies)* : tout
> ce qu'elle affirme d'un geste a été **constaté** par une commande ou par l'API GitHub. Elle ne
> nomme pas le commit qui la contient — **on n'écrit pas le SHA d'un commit qui n'existe pas
> encore.**

### 19.1 — Le défaut, et pourquoi il était dangereux

Une réinitialisation effaçait 40 paramètres — ⛔ **et aucun n'était un `org_*` : les 36 sur 36
survivaient**. Un tournoi neuf rouvrait donc la demande d'autorisation **déjà remplie** avec les
valeurs de l'édition passée *(médecin, poste de secours, arbitres, traiteur, prix des repas,
récompenses)*, marquées **« saisi »**, et le compteur annonçait **0 champ manquant**.

> 🎯 **Ce qui rend ce défaut pire qu'un champ vide** : le dossier pouvait partir à la Ligue
> **complet en apparence**, avec un médecin qui ne serait pas là et un prix qui n'était plus le bon.
> **Un champ vide se voit. Une valeur périmée, non.**

### 19.2 — Ce qui a été écrit

| Où | Quoi |
|---|---|
| `backend/Code.gs` | ⭐ **`CHAMPS_AUTORISATION_A_REINITIALISER`** — allowlist **explicite** des **26** champs d'édition · `PREFIXE_RECOMPENSES_AUTORISATION` · `clesAutorisationAEffacer()` *(la **décision**, pure)* · `reinitialiserDonneesAutorisationTournoi()` *(l'**effet**)* · son appel dans `reinitialiserTournoi` |
| `backend/Tests.gs` | **13 fonctions de test**, **+81 vérifications** — ⛔ **aucune ligne supprimée** |
| `frontend/js/admin.js` | **le message de confirmation, et rien d'autre** *(diff strictement texte + commentaires)* |
| Documentation | `deploiement.md` *(4 repères + témoins)* · `CHANGELOG.md` · `structure-google-sheet.md` · `ETAT.md` · `PLAN.md` · `RISQUES.md` |

⭐ **Pourquoi une allowlist EXPLICITE, et non « tout sauf les 10 permanents »** *(arbitrage de
Romain)* : sur une opération **destructive**, une clé `org_*` ajoutée plus tard ne doit jamais
devenir effaçable parce qu'on aurait oublié de la classer. **L'oubli doit conserver la donnée, pas
la détruire.**

### 19.3 — Ce que les tests prouvent, et comment on l'a vérifié

**La DÉCISION et le BRANCHEMENT sont prouvés séparément** — une liste juste que personne n'appelle
n'efface rien.

| Preuve | Résultat |
|---|---|
| **26 champs d'édition effacés** · **10 permanents conservés** | ✅ comparaison **ensembliste** avec D-043, listes réécrites dans le test |
| **Récompenses `org_recompenses_*`** | ✅ effacées, **y compris ORPHELINES** *(catégorie supprimée : la clé reste en zone A)* |
| ⭐ **Test de BRANCHEMENT réel** | ✅ `reinitialiserTournoi` exercée **de bout en bout** sur un **faux classeur en mémoire** — ⛔ aucun Sheet réel, aucun appel Drive |
| ⭐ **Test négatif R-B2** | ✅ **11 voisins du préfixe rejetés** — `org_representant_*`, `org_president_*`, `org_recompense_U8` *(sans « s »)*, `org_recompenses` *(sans « _ »)*, le préfixe nu |
| **Non-régression** | ✅ les effacements historiques tiennent, `perfs_mot_cle_club` et `email_expediteur` restent **conservés** |
| **Stockage ≠ affichage** | ✅ `org_type_terrain` vidé retombe **légitimement** sur la nature des terrains déclarés : ⛔ **on n'a PAS transformé une cascade correcte en champ manquant** pour faire passer un test |

> 🎯 **Trois mutations de contrôle ont été jouées pour vérifier que les tests MORDENT** — un test qui
> ne tombe jamais ne prouve rien :
>
> | Mutation | Effet |
> |---|---|
> | Appel de l'effacement **retiré** | **4 FAIL**, dont *« les 26 champs vidés : **constaté 0/26** »* |
> | Préfixe raccourci à `org_re` | **12 FAIL**, dont *« les 10 permanents SURVIVENT »* |
> | Une **37ᵉ clé** ajoutée sans être classée | **3 FAIL** — et la clé **n'était pas effacée** |

**Bilan : `R92 — 796/796 OK, 0 FAIL`** *(était 715)*. ⚠️ **Mesuré HORS LIGNE**, en exécutant
`lancerTestsFFR` sur les deux fichiers du dépôt : la même méthode donnait **715** avant ce lot,
exactement le bilan de Google. ⛔ **Cela reste un PROBABLE** *(§9)* — seul le geste 4 du
redéploiement le confirmera.

### 19.4 — Le message de confirmation, rendu exact

L'ancienne phrase *« Seul l'historique de saison (page Perfs) est conservé »* a été **retirée** :
elle était **déjà fausse avant ce lot** *(le carnet des clubs et les partenaires survivent)*. Le
nouveau texte distingue **ce qui part** et **ce qui reste**, ⛔ **sans prétendre à l'exhaustivité**
*(« notamment », des deux côtés)*.

> ⚠️ **Une ligne a été écrite, puis corrigée avant commit** : *« les réponses des clubs sont
> supprimées »* était **trop large**. La vérification colonne par colonne de
> `reinitialiserPhase2Clubs` donne **8 colonnes sur 17 remises à zéro** — `categories_engagees`,
> `dossier_envoye`, `invitation_envoyee`, `club_token`, `date_reponse`, `nb_equipes_par_categorie`,
> `nb_joueurs_total`, `selection_enregistree` — et **9 conservées**, dont **`statut`**,
> **`detail_effectifs`** et **`nb_educateurs_total`**.
>
> ⭐ **La formulation d'exemple proposée en consigne — *« les statuts de réponse »* — aurait donc été
> FAUSSE**, et elle a été écartée pour cette raison. *Un message d'action irréversible ne vaut que
> s'il dit vrai.*

### 19.5 — 🔎 Point DÉCOUVERT, ⛔ NON corrigé — à arbitrer plus tard

> **Après une réinitialisation, un club peut rester marqué `statut = Accepté` (ou `Décliné`) alors
> que plusieurs éléments propres à sa participation à cette édition ont été remis à zéro** —
> catégories engagées, nombre d'équipes et de joueurs, date de réponse, lien d'accès.
>
> ⛔ **Aucune logique n'a été modifiée** : c'est le comportement **antérieur à M1-B**, hors de son
> périmètre. Il est consigné ici pour ne pas être perdu ; ⛔ **aucun risque ni aucune décision
> n'a été créé** dans ce lot pour l'accueillir.

### 19.6 — Les gestes, et ce qui les a CONSTATÉS

| | Constaté |
|---|---|
| **Branche** | `claude/m1b-reinitialisation-cycle-de-vie`, créée sur **`1c5cd4f`** *(= `origin/main`)* |
| **Commit d'implémentation** | **`dc034880230aef9778ad745db38f135f77351129`** — **9 fichiers**, 551 insertions, 27 suppressions |
| **Poussée** | ✅ la **branche seule** ; tête locale = tête distante, écart **0 / 0** |
| **GitHub Actions** | ⛔ **AUCUNE exécution déclenchée** — vérifié par l'API *(0 run sur la branche, aucun run pour `dc03488`)*. ⭐ **Et la cause est lue dans le fichier, pas supposée** : `pages.yml` déclare `on: push: branches: [main]` — un push sur une autre branche ne déclenche rien, **même en touchant `frontend/**`** |
| **Fusion vers `main`** | ⛔ **AUCUNE** — `git branch -r --contains` ne renvoie que la branche M1-B ; `origin/main` reste à **`1c5cd4f`** |
| **Déploiement** | ⛔ **AUCUN** — ni GitHub Pages, ni collage Apps Script, ⛔ **aucune donnée du classeur touchée, aucune réinitialisation réelle jouée** |

### 19.7 — Ce que ce lot NE ferme PAS

- 🔴 **R-033 reste OUVERT** : sa part `org_*` est traitée, mais **`detail_effectifs` et
  `nb_educateurs_total`** sont des **colonnes de `ClubsInvites`**, hors périmètre — **D-020 continue
  de diverger du code** sur les effectifs ;
- ⏳ **la friction N2 assumée** : type de terrain, vestiaires et éducateurs du club sont à ressaisir
  jusqu'à **M1-D** ;
- ⛔ **le comportement en production est INCONNU** tant que le redéploiement n'a pas eu lieu
  *(§13.6)* ;
- ⚠️ **l'ordre de déploiement est décidé mais NON exécuté** : **backend d'abord**, vérification
  réelle, **frontend ensuite** — sinon la page publiée annoncerait un effacement que le serveur ne
  ferait pas encore. ⭐ **Et ce redéploiement mettra DEUX lots en service** : M1-B **et** la part
  backend de **CF-4b/L8**, jamais collée.

### 19.8 — ⚡ Addendum du 2026-08-24 — le backend est redéployé, et une doctrine tombe

> ⛔ **Les §19.1 à §19.7 ci-dessus ne sont PAS réécrits.** Ils disaient vrai à leur date — y compris
> §19.7, qui annonçait que le redéploiement *« mettra DEUX lots en service : M1-B et la part backend
> de CF-4b/L8, jamais collée »*. **La seconde moitié de cette phrase s'est révélée fausse**, et
> c'est l'objet de cet addendum. **Le nouvel état s'ajoute, il ne remplace pas.**

**Le redéploiement a eu lieu**, exécuté à la main par Romain dans Apps Script.

| | Constaté |
|---|---|
| **Avant collage — M1-B** | `CHAMPS_AUTORISATION_A_REINITIALISER` **0** · `reinitialiserDonneesAutorisationTournoi` **0** ➡️ ✅ M1-B n'était bien pas dans l'éditeur |
| **Après collage — `Code.gs`** | **8423** lignes · `viderDonnees` ligne **8418** · témoins **3** et **2** · `API tournoi en ligne` **1** · anciennes chaînes **0** |
| **Après collage — `Test.gs`** | **4645** lignes |
| ⭐ **Tests CHEZ GOOGLE** | **`R92 — 796/796 OK, 0 FAIL`** — ⛔ ce n'est plus une prédiction hors ligne |
| **Publication** | **Version 156, 2026-08-24 à 11:13** *(la précédente : 155, du 22/08 à 17:31)* — **même déploiement, même adresse**, ⛔ aucune Web App nouvelle |
| **Ping public après v156** | `{"ok":true,"message":"API tournoi en ligne"}` |

### 19.9 — 🔴 La découverte : L8 backend était DÉJÀ en service

**Le relevé d'avant collage — celui que la fiche de redéploiement impose depuis D-040 — a démenti
une affirmation que le dépôt portait en cinq endroits depuis le 2026-08-22.**

| Ce que la documentation affirmait | Ce qui a été relevé le 2026-08-24, avant tout collage |
|---|---|
| *« la part backend de CF-4b/L8 n'a JAMAIS été redéployée »* | `API tournoi en ligne` = **1** dans l'éditeur · ancienne chaîne = **0** · et l'URL publique servait **déjà** la nouvelle réponse |

⛔ **La date et le geste de cette mise en service ne sont pas établis, et rien n'est supposé ici.**
`be57f97` (2026-08-22) est le **premier commit publié** du dépôt portant la chaîne témoin, ⛔ **mais
il ne permet PAS de dater le déploiement chez Google** : un état **local**, non encore commité, peut
parfaitement être collé dans l'éditeur — ⭐ **ce projet en porte l'exemple**, la fiche de L5 ayant
parlé d'un *« patch appliqué, non commité »*.

> 🎯 **Et cette nuance vaut d'être gardée, car elle a failli passer** : une première rédaction
> concluait que la mise en service était *« nécessairement postérieure au 22/08 »*. **La conclusion
> dépassait la preuve** — Git atteste ce qui entre dans le dépôt, ⛔ **jamais ce qui est collé chez
> Google.** *(`CLAUDE.md` §9 : ne jamais présenter une déduction comme un fait.)*

> 🎯 **Ce que cet épisode démontre, et il faut le lire à l'endroit** : ce n'est **pas** un contrôle
> qui a échoué, c'est un contrôle qui a **fonctionné**. Sans le relevé d'avant collage, nous
> aurions écrit que M1-B avait mis L8 en service — **une phrase fausse, et flatteuse pour notre
> propre lot**. ⭐ *Un état qu'on n'a pas relevé soi-même n'est pas un état : c'est une croyance.*
>
> ⚠️ **Et la leçon rejoint §8 septies par l'autre bout** : la règle protège contre l'état écrit
> **avant** son geste. Ici, l'erreur venait d'un geste **qu'aucune session n'avait vu se produire**.
> **Un document ne constate jamais un geste — même son absence.**

### 19.10 — Ce que cet addendum ne dit PAS

⛔ **M1-B n'est pas « vérifiée en réel »** : aucune réinitialisation n'a été lancée, ni sur la
production, ni sur une copie. Les tests prouvent que le code fait ce qu'il annonce ; ⛔ **ils ne
prouvent pas qu'on l'ait exercé sur un vrai classeur.**
⛔ **Le frontend n'est pas publié** : le dialogue en ligne est encore l'ancien, qui n'annonce pas les
nouveaux effacements. ⚠️ **Tant que cette fenêtre est ouverte, aucune réinitialisation réelle ne
doit être déclenchée.**
⛔ **Aucune donnée du classeur n'a été volontairement modifiée**, ⛔ aucune fusion vers `main`.

### 19.11 — ⚡ Addendum du 2026-08-24 — M1-B est fusionnée et le frontend est publié

> ⛔ **Les §19.8 à §19.10 ne sont pas réécrits.** Ils disaient vrai à leur date, y compris §19.10 qui
> annonçait *« le frontend n'est pas publié »* et demandait de ne lancer aucune réinitialisation
> **tant que la fenêtre est ouverte**. ⭐ **Cette fenêtre est désormais FERMÉE**, et c'est l'objet de
> cet addendum.

| | Constaté |
|---|---|
| **Fusion** | **Fast-forward** `1c5cd4f` → **`8dfd28a`** — ⛔ aucun SHA réécrit, ⛔ aucun commit de fusion. Les 3 commits *(`dc03488`, `e515fd7`, `8dfd28a`)* sont ancêtres de `origin/main`, vérifié un par un |
| **Périmètre publié** | **10 fichiers**, contrôlés **avant** la poussée par `git diff origin/main..HEAD` — dont `backend/Code.gs`, `backend/Tests.gs` et `frontend/js/admin.js` |
| **Push** | `1c5cd4f..8dfd28a  main -> main` · après coup : `HEAD` = `origin/main`, écart **0/0**, working tree propre |
| ⭐ **GitHub Pages** | Run **32712062024** sur **`8dfd28a`**, **`success`** — **les deux jobs** : *« Vérifier la syntaxe des fichiers publiés »* ✅ *(3 s)* et *« Publier sur GitHub Pages »* ✅. 2026-08-24, 09:32:02 → 09:32:35 UTC |
| **Fenêtre backend-nouveau / frontend-ancien** | ✅ **FERMÉE** — ouverte à 11:13 *(v156)*, refermée par la publication |

⚠️ **Ce qui N'A PAS pu être vérifié, et il faut le dire plutôt que de le supposer** : **la page
réellement servie n'a pas été observée.** L'environnement de travail refuse `github.io` *(403 au
tunnel, comme `script.google.com`)*. ⭐ **Ce qui est prouvé est donc le DÉPLOIEMENT, pas
l'AFFICHAGE** — la distinction est exactement celle des quatre états de `deploiement.md`, et
**§13.6** la pose comme limite permanente.

**Ce qui a pu être vérifié en revanche** : le contenu de `frontend/js/admin.js` **dans `origin/main`**
— c'est-à-dire la source exacte de l'artefact empaqueté par le job de publication. Le message y
annonce bien ce qui part *(catégories, équipes, poules, matchs · infos et horaires · données de
participation des clubs invités · médecin, secours, arbitrage, installations utilisées, hébergement,
repas, goûters, récompenses)* et ce qui reste *(informations permanentes du club · historique de
saison · carnet des clubs avec noms, contacts et statut · partenaires)*. ⛔ **L'ancienne phrase
« Seul l'historique de saison est conservé » n'y figure plus.**

⛔ **Le point ⑦ reste NON.** Aucune réinitialisation n'a été jouée — ni en production, ni sur une
copie. ⭐ **Que les deux surfaces soient en service ne prouve toujours pas l'effet destructif** :
cela reste à établir par un geste réel, organisé séparément.

### 19.12 — ⚡ Addendum du 2026-08-24 — la vérification visuelle a finalement été faite

> ⛔ **Le §19.11 n'est pas réécrit.** Il disait que *« la page réellement servie n'a pas été
> observée »*, et c'était vrai : l'environnement de travail refuse `github.io`. ⭐ **Ce que cet
> addendum ajoute, c'est que la limite n'était pas celle du projet — c'était celle de l'outil. Un
> humain devant un navigateur l'a levée en deux minutes.**

**Contrôle manuel, mené par Romain sur `https://rfl974.github.io/tournoi-r92/admin.html` :**

| Étape | Constaté |
|---|---|
| Rubrique **Réinitialiser**, bouton *« Réinitialiser le tournoi »* | Le **premier dialogue** s'affiche |
| Son contenu | ✅ **le nouveau texte M1-B** — les quatre lignes de « CE QUI EST SUPPRIMÉ » *(dont les données de la demande d'autorisation : médecin, secours, arbitrage, terrain et vestiaires utilisés, hébergement, repas, goûters, récompenses)* et celles de « CE QUI EST CONSERVÉ » |
| Ses deux choix | **`ANNULER`** et **`CONTINUER`** |
| Geste effectué | ⭐ **`ANNULER` uniquement.** ⛔ **`CONTINUER` n'a JAMAIS été cliqué** |
| État après annulation | **2 catégories, 38 équipes, planning matin toujours « Validé »** — la page a retrouvé son état |

**Ce que cette observation établit — et c'est plus que « la page est à jour » :**

| | |
|---|---|
| ✅ **Frontend déployé** | workflow Pages `success` |
| ✅ **Frontend réellement observé** | ⭐ dans un navigateur, sur l'adresse publique |
| ✅ **Le garde-fou s'affiche AVANT toute opération** | l'ordre est le bon : on prévient, puis on agit |
| ✅ **L'annulation ne déclenche aucune réinitialisation observable** | ⚠️ **preuve d'OBSERVATION** : l'état visible est resté inchangé *(2 catégories, 38 équipes, planning matin « Validé »)*. ⛔ **Les compteurs visibles ne prouvent pas, à eux seuls, l'intégrité de TOUTES les données** — voir la preuve de code ci-dessous |
| ⛔ **Le comportement destructif** | **PAS testé** |

> 🎯 **Pourquoi le point ⑦ reste NON, et la nuance est exactement celle qui compte** : ce contrôle
> prouve **la moitié rassurante** — celle où l'on ne casse rien. ⛔ **Il ne prouve rien de la moitié
> qui fait peur** : que les 26 champs et les récompenses soient réellement vidés, et que les 10
> permanents survivent réellement. **`CONTINUER` n'a pas été cliqué, et c'était le bon choix** :
> ⛔ cela ne se teste pas sur des données en service.
>
> ⭐ **Un garde-fou vérifié n'est pas un effet vérifié.** La suite est de décider **comment** exercer
> le geste destructif sur une **copie sécurisée** du classeur — jamais sur la production.

#### 19.12 bis — ⭐ Deux preuves de nature différente, et il ne faut pas les confondre

> ⚠️ **Une première rédaction écrivait *« ANNULER n'efface rien — vérifié sur les compteurs
> réels »*.** ⛔ **C'était plus fort que l'observation** : trois compteurs à l'écran ne disent rien
> des **36 `org_*`**, des récompenses, ni du reste du classeur. **La formulation a été ramenée à ce
> qui a réellement été vu**, et la partie forte a été cherchée là où elle pouvait être **établie** :
> dans le code.

| | Ce qu'elle établit | Ce qu'elle n'établit PAS |
|---|---|---|
| **① Observation au navigateur** | L'annulation **n'a déclenché aucune réinitialisation observable** ; l'état visible est resté inchangé *(2 catégories, 38 équipes, planning matin « Validé »)* | ⛔ **rien** sur les données non affichées |
| **② Lecture du code PUBLIÉ** *(`origin/main`)* | ⭐ **Aucun appel serveur n'est atteignable avant la double confirmation** | ⛔ rien sur ce qui se passe **après** `CONTINUER` |

**Le détail de la preuve ②, vérifiable ligne à ligne dans `origin/main` :**

- `onReinitialiser` *(`frontend/js/admin.js:664`)* n'exécute, avant sa première confirmation, que
  **deux lectures du DOM** *(`getElementById`)* — ⛔ **aucun appel réseau** ;
- `dialogConfirmer` *(`frontend/js/dialog.js`)* ne contient **ni `fetch`, ni `XMLHttpRequest`, ni
  `ecrireAdmin`, ni écriture persistante** : il construit un panneau, attend, puis rend une valeur.
  À l'annulation *(bouton, `Échap`, ou clic hors du panneau)*, il rend **`false`** ;
- `if (!await dialogConfirmer(…)) return;` ➡️ la fonction **sort à la ligne 692** ;
- le **seul** appel d'écriture, `ecrireAdmin('reinitialiserTournoi', {})`, est à la **ligne 702**,
  ⭐ **après une SECONDE confirmation**.

> 🎯 **Ce que la distinction protège** : si l'on avait écrit *« Annuler n'efface rien »* sur la foi
> de trois compteurs, on aurait fabriqué **une preuve d'apparence** — exactement le mécanisme du
> `ping` vert de **D-040**, qui répondait pareil avant et après. ⭐ *Une observation prouve ce
> qu'elle montre ; c'est le code qui dit ce qui est atteignable.*

### 19.13 — 🏁 Addendum du 2026-08-24 — le point ⑦ est exercé : M1-B est COMPLET

> ⛔ **Les §19.8 à §19.12 bis ne sont pas réécrits.** Ils disaient vrai à leur date, et notamment
> que *« le geste destructif n'a pas été exercé »*. ⭐ **Il l'a été.**

**La chaîne parcourue, de bout en bout — et c'est ce qui fait la valeur de cette preuve :**

```
frontend GitHub Pages publié  →  1er dialogue M1-B  →  CONTINUER
   →  2e dialogue irréversible  →  OUI, TOUT EFFACER
      →  backend Apps Script v156  →  classeur connecté
```

⚠️ **Décision assumée, et il faut qu'elle reste lisible** : le test a été mené sur le **classeur
réellement connecté à l'application**, ⛔ **pas sur une copie**. Les données présentes étaient des
**données d'essai** ; leur destruction a été **décidée à l'avance** et acceptée comme prix de la
preuve. **L'application a répondu** : *« Supprimés : 2 catégorie(s), 38 équipe(s), 10 poule(s),
51 match(s). Tournoi masqué. »*

#### Le verdict, relevé DANS `Config` — valeur stockée, avant et après

| | Résultat |
|---|---|
| **PERMANENTS** | ✅ **10 / 10 CONSERVÉS** — chaque valeur après **strictement identique** à avant |
| **ÉVÉNEMENTIELS** | ✅ **26 / 26 EFFACÉS** — cellules vides, ⭐ **et les 26 lignes existent toujours** |
| **RÉCOMPENSES** | ✅ **2 / 2 EFFACÉES** — `org_recompenses_U8`, `org_recompenses_U10` : clés présentes, valeurs vides |
| **Contrôles annexes** | `tournoi_publie` = **`non`** · `tournoi_affiche_id` **vidé** · `parking_photo_id` **vidé** |

#### Le protocole — pourquoi ce verdict a du sens

⚠️ **Un champ vide avant et vide après ne prouverait rien.** Chacun des 36 a donc été rendu
**contrôlable** avant le geste :

**La règle appliquée, et elle est simple** : ⭐ **une sentinelle n'a été posée que sur une cellule
VIDE.** Une cellule déjà renseignée est sa propre sentinelle — l'écraser aurait fait perdre une
valeur pour rien.

- les **10 permanents** étaient tous **NON VIDES** au relevé AVANT. **Trois** étaient vides et ont
  reçu une **sentinelle générique** — `TEST_M1B_PERM_CODE`, `TEST_M1B_PERM_REPRES`,
  `TEST_M1B_PERM_PRESID` ; **les sept autres étaient déjà renseignés et n'ont pas été touchés**.
  ⭐ **L'égalité stricte avant/après porte donc sur des valeurs réellement présentes** ;
- les **26 événementiels** portaient tous une valeur au relevé AVANT : **les cellules initialement
  vides ont reçu les sentinelles prévues**, **les cellules déjà renseignées ont été laissées telles
  quelles** ;
- les **2 récompenses** étaient **déjà non vides** avant, **vides** après ;
- ⭐ le **relevé AVANT complet a été relu** avant de lancer le reset, et le **relevé APRÈS a porté
  directement sur `Config`**.

> ⚡ **RECTIFIÉ le 2026-08-24 — et il faut dire ce que ce paragraphe affirmait.** Une première
> rédaction écrivait que `org_label_edr` *(défaut `oui`)* et `org_equipes_etrangeres`
> *(défaut `non`)* **avaient reçu la valeur contraire à leur défaut**, et les présentait tous deux
> comme des **événementiels**. ⛔ **Les deux affirmations étaient fausses** — voir le rectificatif
> **§19.14**.

> ⛔ **Les valeurs préexistantes du classeur ne sont PAS reproduites ici** — elles identifieraient un
> club ou des personnes, et ⭐ **la preuve n'en a aucun besoin** : ce qui l'établit est l'**égalité
> stricte**, jamais le contenu. *(Principe du dépôt public neutre — chantier **CF-4b**.)*

> ⭐ **Le piège annoncé a été évité, et c'est ce qui rend la preuve solide** : `org_type_terrain` a
> été contrôlé **sur la cellule du classeur**, ⛔ **pas sur l'affichage** — qui aurait pu montrer une
> nature **recalculée** depuis `terrains_physiques`, lequel survit au reset. *Un relevé fait au bon
> endroit vaut mieux qu'un relevé fait au bon moment.*

#### ⚠️ Incident de PRÉPARATION — à ne pas confondre avec le comportement de M1-B

Pendant la pose des sentinelles, **une mauvaise requête d'écriture passée par le connecteur Google
Sheets a temporairement vidé le bloc `A54:B91`** de `Config`.

| | |
|---|---|
| **Détection** | immédiate |
| **Signalement** | explicite, sur le moment |
| **Restauration** | **ligne par ligne**, depuis le relevé AVANT effectué juste auparavant |
| **Contrôle** | relecture **intégrale** de `Config!A53:B91`, conformité **confirmée** |
| **Puis seulement** | la réinitialisation M1-B a été lancée |

> ⛔ **Cet incident n'est PAS un effet de M1-B**, et rien dans ce journal ne doit laisser croire le
> contraire : il s'est produit **avant** le geste, par un **outil d'écriture externe**, et il a été
> **entièrement réparé et relu** avant que quoi que ce soit ne soit testé.
>
> 🎯 **Il est consigné parce qu'il enseigne deux choses.** ⭐ **La première** : c'est **le relevé
> AVANT** — fait pour la preuve — qui a permis de restaurer. Sans lui, l'incident aurait été
> irréparable. ⭐ **La seconde** : un outil d'écriture par plage *(`A54:B91`)* n'a **aucune idée de
> ce qu'il écrase**, là où l'application écrit **paramètre par paramètre**. C'est exactement la
> différence que **M1-C1** posera comme contrainte : *écriture partielle, liste blanche, un champ
> absent n'est jamais effacé.*

#### Ce que cet addendum établit — et ce qu'il n'établit pas

✅ **M1-B est COMPLET** : les sept états sont atteints, le septième par un **geste réel**, mesuré
sur le **stockage** et non sur l'affichage.

⛔ **Ce qu'il n'établit pas** : rien sur **R-033** dans sa part `detail_effectifs` /
`nb_educateurs_total` *(colonnes de `ClubsInvites`, toujours ouvertes)* · rien sur le point
**`statut`** *(§19.5, toujours à arbitrer)* · et ⛔ **le classeur est désormais VIDE de données de
tournoi** — voir le repère en tête de `ETAT.md`.

🔧 **Un constat pour M1-F, relevé au passage** : la lecture de `Config` confirme qu'**une valeur
institutionnelle non neutralisée subsiste dans `org_club_nom`** — ⛔ **son contenu n'est pas
reproduit ici**. Ce n'est **pas** un défaut de M1-B *(le code, lui, est neutre : il ne nomme aucun
club par défaut depuis **L8**)* : c'est une **donnée** du classeur, et son traitement reste prévu
en **M1-F**. ⭐ **Au passage, elle a servi la démonstration** : c'est l'un des permanents dont la
conservation a été vérifiée.

### 19.14 — ⚡ RECTIFICATIF du 2026-08-24 — le protocole de preuve de M1-B

> ⛔ **Le commit `7ebacfb` n'est PAS réécrit** — ni amend, ni rebase, ni force. **Son message porte
> l'erreur, et il la portera toujours.** ⭐ *Une preuve erronée se corrige explicitement, elle ne
> s'efface pas de l'histoire* — c'est la même doctrine que **§8 septies** pour les états.

**Ce qui avait été écrit, et qui est faux :**

> *« Les deux champs à défaut documenté — `org_label_edr` (défaut `oui`) et
> `org_equipes_etrangeres` (défaut `non`) — ont reçu la valeur contraire à leur défaut. »*

**Ce qui est vrai, d'après le relevé brut de `Config` :**

| | AVANT | Modifié avant le reset ? | APRÈS |
|---|---|---|---|
| `org_label_edr` *(⭐ **un des 10 PERMANENTS**)* | `oui` | ⛔ **NON** — déjà renseigné | `oui` ➡️ ✅ **conservé** |
| `org_equipes_etrangeres` *(⭐ **un des 26 ÉVÉNEMENTIELS**)* | `non` | ⛔ **NON** — déjà renseigné | **cellule vide** ➡️ ✅ **effacé** |

**Deux erreurs, donc, et non une :**

1. ⛔ ces deux cellules **n'ont pas été modifiées** : elles étaient **déjà non vides**, et la règle
   appliquée était *« une sentinelle seulement sur une cellule vide »* ;
2. ⛔ elles ont été présentées comme **deux exemples parmi les 26 événementiels**, alors que
   **`org_label_edr` appartient aux 10 PERMANENTS**. Les mettre dans le même sac effaçait la
   distinction que tout M1-B sert à établir.

#### ⭐ Pourquoi le verdict, lui, ne bouge pas d'un pouce

**Parce que la preuve n'a jamais reposé sur l'affichage.** Le raisonnement erroné portait sur un
risque d'**écran** : *« une cellule vide s'affiche comme une valeur, donc il faut une valeur
contraire au défaut »*. ⛔ **Ce risque n'existe pas ici** : le relevé a porté sur **la cellule**,
avant et après.

- `org_label_edr` : `oui` ➡️ `oui`. **La cellule a gardé son contenu** — conservation constatée ;
- `org_equipes_etrangeres` : `non` ➡️ **vide**. **La cellule a été vidée** — effacement constaté.
  *(Que l'écran réaffiche `non` par défaut est vrai, et sans effet : on n'a pas regardé l'écran.)*

➡️ **Les verdicts restent identiques** : **PERMANENTS 10/10 conservés** · **ÉVÉNEMENTIELS 26/26
effacés** · **RÉCOMPENSES 2/2 effacées** · **M1-B ✅ COMPLÈTE ①→⑦**. Même logique pour
`org_type_terrain`, contrôlé lui aussi sur le stockage brut.

> 🎯 **La leçon, et elle est exactement celle de ce chantier** : j'ai décrit **ce que le plan
> proposait** — les sentinelles que j'avais suggérées pour ces deux champs — au lieu de **ce qui a
> été fait**. ⭐ **C'est §8 septies transposé à la preuve** : *un protocole écrit avant le geste est
> une intention ; seul le relevé dit ce qui s'est passé.* ⛔ **Et une preuve mal décrite est une
> preuve fragile**, même quand son résultat est juste — car le premier lecteur qui vérifierait la
> description y trouverait un mensonge, et douterait du reste.
