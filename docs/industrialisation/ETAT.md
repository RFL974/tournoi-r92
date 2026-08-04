# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-04 (session 6, close)
**Commit de référence** : `7617d6c` sur **`main`** — la session 6 est **fusionnée** (PR #175).

> ✅ **Tout le travail décrit ci-dessous est dans `main`.** Une session qui démarre depuis `main`
> voit donc l'état réel du chantier. *(Ce n'était pas le cas au démarrage de la session 6, où une
> PR non fusionnée avait fait croire que le travail des sessions 4 et 5 n'existait pas — d'où
> cette ligne, désormais tenue à jour à chaque fin de session.)*

---

## 1. EN UNE PHRASE

L'**ÉTAPE 1 est terminée** et l'**ÉTAPE 2 avance** : **deux domaines sur huit sont audités** —
le **A (métier)** et le **C (sécurité)**, soit **27 problèmes**. La sécurité a fait apparaître
**le premier P0 du chantier** (**R-014**), qui est aujourd'hui le **premier problème réglé de
bout en bout** : corrigé par exception validée (**D-016**), **redéployé chez Google**,
**573/573 tests OK**, chaîne vérifiée en conditions réelles → statut **TESTÉ**. Une seule chose
t'attend encore, et elle ne demande aucun code : **remplacer les deux mots de passe par des
suites aléatoires** (**D-017**) — ce sont aujourd'hui des mots choisis à la main, ce qui fait
passer **R-019 de P2 à P1**. Il reste **6 domaines** à auditer.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | ✅ **TERMINÉE** (sessions 2, 3 et 4) |
| 2 | **ÉTAPE 2 — Audit global** (8 domaines, P0→P3) | 🟡 **EN COURS** — domaines A (session 5) et C (session 6) faits, 6 restants |
| 3 | ÉTAPE 3 — Plan d'industrialisation priorisé | ⬜ À faire |
| 4 | ÉTAPE 4 — Validation par Romain | ⬜ À faire |
| 5 | ÉTAPE 5 — Implémentation par petites unités | ⬜ À faire |
| 6 | ÉTAPE 6 — Commits atomiques | ⬜ À faire |

---

## 3. PHASE EN COURS — L'ÉTAPE 2 (audit)

**Ordre validé par Romain** (décision D-010) : **A → C → B → D → E → F → G → H**.

| Domaine | Nom | Statut |
|---|---|---|
| **A** | **Métier / Product Owner** | ✅ **CLOS** (session 5) — 13 problèmes, 0 P0, 5 P1, 7 P2, 1 P3 · **toutes les décisions métier prises** |
| **C** | **Sécurité** | ✅ **CLOS** (session 6) — 14 problèmes, **1 P0**, 4 P1, 7 P2, 2 P3 · **1 décision en attente (D-016)** |
| B | RGPD / Protection des données | ⬜ **Prochain** |
| D | QA / Tests | ⬜ À faire |
| E | UX / UI / Accessibilité | ⬜ À faire |
| F | Performance | ⬜ À faire |
| G | Architecture / Maintenabilité | ⬜ À faire |
| H | Qualité du code | ⬜ À faire |

> L'**ÉTAPE 1 (cartographie)** est terminée : volets A (session 2), B (session 3) et C (session 4),
> tous dans `CARTOGRAPHIE.md`. Elle a produit les **39 points d'attention** qui servent de matière
> première à l'audit.

---

## 4. PROCHAINE ÉTAPE

### Un geste qui n'appartient qu'à Romain, et qu'aucune session ne peut faire à sa place

~~**1. Redéployer le backend chez Google**~~ → ✅ **FAIT le 2026-08-04.** 573/573 tests OK, et le
diagnostic « Tester la remontée » confirme la chaîne complète. R-014 est **TESTÉ**.

**Remplacer les deux mots de passe par des suites aléatoires** — **D-017**. Menu du classeur
**« Tournoi R92 → Configurer les clés »**. Cinq minutes, aucune ligne de code, et R-019 redevient
un problème théorique. La vraie question à trancher n'est pas technique : **où ranger ces clés**,
et **comment transmettre celle des scores aux bénévoles le jour J**.

### Puis : session 7 — ÉTAPE 2, domaine B : la protection des données (RGPD)

*(toujours sans rien modifier)*

C'est l'ordre validé par D-010, et c'est aussi le bon moment : le classeur ne contient **aucune
donnée personnelle de tiers aujourd'hui** (I-03, I-04). Le domaine B doit être traité **avant la
première invitation réelle**, pas après.

Les points qui l'alimentent directement, tous déjà repérés : **C-01** (quatre onglets sortent en
entier — c'est R-021), **C-02** (effectifs d'enfants accessibles sans clé), **C-03 / C-04** (la
réinitialisation laisse derrière elle des effectifs et des contacts de dirigeants), **C-05**
(aucune durée de conservation nulle part), **C-06** (jetons qui ne périment pas — c'est R-018),
**C-07** (une copie de chaque courriel reste dans Gmail), **C-08** (images du Drive publiques),
**C-10** (le champ libre qui invite à saisir des identités d'enfants), **A-08**, et le chargement
des polices depuis les serveurs de Google, relevé en session 6.

**Condition de démarrage** : instruction explicite de Romain.

---

## 5. CORRECTIONS DÉJÀ RÉALISÉES DANS CE CADRE

**Une seule — R-014, le P0 de sécurité** *(session 6, commit `c1948fc`, exception validée D-016)*.

| Ce qui a changé | Où | État |
|---|---|---|
| Trois plafonds sur `mesureSponsors`, la seule écriture ouverte sans mot de passe : un plafond **dur** sur la taille de l'onglet des relevés, et deux plafonds de **débit** (global et par appareil) vérifiés **avant** d'ouvrir le classeur | `backend/Code.gs` | ✅ **En service** |
| 9 tests ajoutés (16 vérifications) | `backend/Tests.gs` | ✅ **Passent chez Google** |
| Le diagnostic « Tester la remontée » dit désormais qu'un plafond est atteint, au lieu d'annoncer une écriture réussie suivie d'une relecture introuvable | `frontend/js/admin-sponsors.js` | ✅ **En ligne** |

**✅ Statut : TESTÉ** *(2026-08-04)* — **le premier problème du chantier à l'atteindre.** Trois
preuves, apportées par Romain :

1. **le backend a été redéployé** chez Google → lève **I-13** ;
2. **573 tests sur 573 passent** dans Apps Script → lève **I-02**. *(Contrôle croisé : 564 appels
   de test écrits en dur dans le fichier + 9 situés dans des boucles = 573. Le compte confirme
   que le lot exécuté contenait bien les 16 vérifications ajoutées pour cette correction.)* ;
3. **la chaîne fonctionne toujours de bout en bout** : écriture ✅, relecture ✅, et **109 relevés
   réels** déjà remontés des spectateurs. C'est la **preuve de non-régression** qui manquait —
   le plafonnement n'a rien cassé.

> ⚠️ **Ce qui reste NON VÉRIFIÉ, et le restera** : le chemin de **refus** — ce qui se passe une
> fois un plafond franchi — n'est prouvé que par les tests. Personne n'a envoyé 30 001 relevés
> pour l'observer en vrai, et personne ne le fera. Le bouton de diagnostic ne peut pas non plus
> l'atteindre : il tire un identifiant d'appareil neuf à chaque essai, donc il ne se bloque jamais
> lui-même — c'est voulu.

> ⚠️ Le projet a une longue histoire de corrections **antérieures** à ce cadre (voir `CHANGELOG.md`
> et l'historique Git). Elles ne sont **pas** considérées comme vérifiées par ce chantier tant que
> l'audit ne les a pas reprises.

---

## 6. PROBLÈMES RESTANT À TRAITER

**27 problèmes — 1 corrigé, 26 au statut IDENTIFIÉ** (vus, pas corrigés) — voir `RISQUES.md` pour
le registre et `AUDIT.md` pour l'explication de chacun.

| Priorité | Total | Domaine A (métier) | Domaine C (sécurité) |
|---|---|---|---|
| **P0** | **1** | — | ✅ **R-014** porte ouverte sans limite — **TESTÉ, en service** |
| **P1** | **10** | R-001 forfait ✅ · R-002 blocage après-midi · R-003 planning figé ✅ · R-004 départage ✅ · R-005 score aberrant ✅ | R-015 scores effacés · R-016 réinitialisation · R-017 mots de passe partagés · R-018 liens des clubs · **R-019 clés devinables** *(monté de P2)* |
| **P2** | 13 | R-006 → R-010 · **R-012** ✅ · **R-013** ✅ | R-020 → R-025 |
| **P3** | 3 | R-011 | R-026 · R-027 |

✅ = la **règle métier est décidée**, le **code n'est pas écrit**. R-002 et R-006 → R-010
n'appelaient aucune décision de Romain : ce sont des choix techniques, réglés à l'ÉTAPE 3.
**Aucun problème du domaine C n'est encore tranché** — seul D-016 (quand corriger le P0) est posé.

**Le fil rouge du domaine A** : l'application est excellente **avant** le coup d'envoi et rigide
**après**. Les 5 P1 apparaissent tous le jour J, quand la réalité s'écarte du plan — forfait,
match non saisi, terrain impraticable, égalité parfaite, faute de frappe.

**Le fil rouge du domaine C**, en deux phrases :

1. **Il n'y a pas de personnes, seulement des mots de passe partagés.** Sept des quatorze
   problèmes en découlent : on ne peut retirer l'accès à personne, on ne sait jamais qui a fait
   quoi, et une contestation de score est inarbitrable.
2. **Les protections sont au bon endroit — sauf les trois plus destructrices.** Le gel des
   réponses à J-16, le refus de réorganiser les poules, la revalidation des relevés : tous tenus
   par le serveur, donc incontournables. Mais effacer tous les scores, tout réinitialiser, et
   limiter la seule porte ouverte : **tenus par personne, ou par la seule page web.**

> ✅ **Ce que la sécurité a aussi montré, et qu'il faut dire** : le code est **bien meilleur que la
> moyenne** sur ce terrain. Les mots de passe ne sont **nulle part** dans le dépôt (historique
> **complet** relu, 513 enregistrements) ; les textes affichés sont systématiquement neutralisés ;
> les liens des partenaires sont bornés ; l'adresse d'un courriel est toujours relue dans le
> classeur, jamais fournie par le navigateur ; un club ne peut jamais voir la fiche d'un autre.
> La liste complète est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain »).

**Décisions métier prises le 2026-08-04** — les 5 P1 sont tous tranchés :

- **D-011 — forfait** : un **bouton « Forfait » sous chaque équipe** dans la page de saisie.
  L'absent marque **0 point**, le présent **gagne** (3 points), **aucun score n'est attribué**,
  et une **double mise en garde** protège le geste. *(Le réglage que j'avais recommandé a été
  écarté par Romain, à juste titre : il aurait permis de fausser la différence.)* La règle retenue
  doit être **communiquée aux clubs** ;
- **D-012 — scores** : **2 chiffres maximum** (au-delà, refus) et **confirmation avant chaque
  validation** ;
- **D-013 — planning** : **déplacer un match** (heure et/ou terrain) et **décaler toute la journée
  de X minutes**. Le 3ᵉ niveau — redistribuer automatiquement un terrain devenu impraticable — est
  **écarté pour l'instant** : c'est le seul qui touche au moteur de planification ;
- **D-014 — départage** : ajouter la **confrontation directe** (4ᵉ critère) puis l'**ordre
  alphabétique** (5ᵉ), **à la suite** des trois critères existants, sans y toucher.

> L'exigence de transparence posée par D-011 a fait apparaître **R-012** : ni le barème, ni le
> départage ne sont écrits où que ce soit pour les clubs, et le champ « Règlement » du dossier a
> été **retiré de l'écran d'administration**. La règle décidée ne serait donc, en l'état,
> communicable à personne.

- **D-015 — match annulé** : le **même mécanisme que le forfait, avec un libellé distinct**. Un
  match annulé ne compte pour personne et ne bloque pas l'après-midi. **Validé par défaut** : une
  règle fédérale primerait.

**Une seule inconnue subsiste, et elle est extérieure au dépôt** — **I-10** : `AUDIT-TOURNOI-R92.md`
**ne dit rien** du forfait ni de l'annulation. C'est une **question de règle du jeu**, qui
appartient au chantier FFR (D-003) et que Romain doit porter au Directeur EDR du Racing ou au
Comité 92. Sa réponse primerait sur D-011 **et** D-015.

> ⚠️ Les 7 autres domaines ne sont **pas** audités. L'absence de problème n'y signifie rien.

La cartographie a par ailleurs relevé **39 points d'attention**, qui sont des **observations**, pas
des verdicts. Ils seront classés à l'ÉTAPE 2 :

- **A-01 à A-14** (session 2, le squelette) → `CARTOGRAPHIE.md` §A.10 ;
- **B-01 à B-12** (session 3, les fonctionnalités) → `CARTOGRAPHIE.md` §B.12 ;
- **C-01 à C-13** (session 4, les données) → `CARTOGRAPHIE.md` §C.12.

Le plus structurant du volet B est **B-03** : le garde-fou qui empêche d'effacer tous les scores en
regénérant les poules vit **uniquement dans le navigateur**, alors que des protections comparables
(réorganisation des poules, gel des réponses à J-16) sont, elles, tenues par le serveur.

Le plus structurant du volet C est **C-05** : **aucune donnée ne disparaît d'elle-même**. Il
n'existe nulle part de durée de conservation ni de purge automatique — toute suppression est un
geste manuel. À rapprocher de **C-07** (une copie de chaque courriel envoyé reste dans la boîte
Gmail, hors de portée de la réinitialisation) et de **C-03 / C-04** (la réinitialisation laisse
derrière elle des effectifs d'enfants et des contacts de dirigeants, sans que ce soit expliqué).

---

## 7. DÉCISIONS VALIDÉES

| Réf | Décision | Statut |
|---|---|---|
| D-001 | Le cadre de travail est `CLAUDE.md` + `docs/industrialisation/` | ✅ Validée |
| D-002 | Une session = un objectif précis, puis arrêt | ✅ Validée |
| D-003 | Audit FFR et industrialisation restent **deux chantiers séparés** : l'un traite la règle du jeu, l'autre la solidité de l'outil | ✅ Validée |
| D-004 | Messages de commit : convention existante conservée — `type(scope): description en français` | ✅ Validée |
| D-006 | Documentation → commit direct sur `main` ; code de l'application → branche + PR + validation préalable | ✅ Validée |
| D-010 | Ordre d'audit des 8 domaines : **A → C → B → D → E → F → G → H** — « on fait les choses dans l'ordre pour bien les faire » | ✅ Validée (session 5) |
| D-011 | Règle du **forfait** : absent = 0 point, présent gagne, score = paramètre de l'organisateur, règle à communiquer aux clubs | ✅ Validée (session 5) |
| D-012 | **Scores** : 2 chiffres maximum, plus confirmation avant chaque validation | ✅ Validée (session 5) |
| D-013 | **Planning** : déplacer un match, et décaler toute la journée de X minutes | ✅ Validée (session 5) |
| D-014 | **Départage** : confrontation directe, puis ordre alphabétique en dernier recours | ✅ Validée (session 5) |
| D-015 | **Match annulé** : même mécanisme que le forfait, libellé distinct, ne compte pour personne | ✅ Validée (session 5), **par défaut** — une règle FFR primerait |
| D-016 | **Corriger R-014 (le P0) tout de suite**, seul, hors de l'ordre du chantier — puis reprendre les audits | ✅ Validée (session 6) — *« va pour B alors je te suis dans ton raisonnement »* |

**En attente** (voir `DECISIONS.md`) :

- **D-017 — Remplacer les deux clés par des suites aléatoires.** *(aucun code : une action de
  Romain, cinq minutes — c'est ce qui referme R-019)* ;
- D-005 — Périmètre exact du dépôt à auditer (le site vitrine `boutique-r92` est un **autre** dépôt).

*(Aucune décision du domaine A n'est en attente.)*

---

## 8. POINTS INCONNUS

Ces points sont **INCONNU** au sens de la règle de transparence : impossibles à établir sans
vérification supplémentaire.

| # | Point inconnu | Pourquoi | Comment le lever |
|---|---|---|---|
| I-01 | Le code réellement en service chez Google est-il identique à `backend/Code.gs` ? | Le backend s'exécute chez Google, hors du dépôt | Vérification manuelle par Romain dans Apps Script |
| I-03 | Quelles données personnelles de **tiers** seront présentes dans le Google Sheet une fois de vrais clubs invités ? | ✅ **Rien à ce jour** (précisé par Romain le 2026-08-04) : les seules adresses email présentes sont **la sienne et celle de son épouse**, utilisées pour tester les envois. ✅ L'**inventaire de ce que l'application peut collecter** est désormais **fait** (volet C, session 4) : nom / prénom / email du contact de chaque club, et des **effectifs** d'enfants (jamais leur nom). Ce qui reste ouvert n'est plus « quoi », mais « **que décide-t-on d'en faire** » | Instruction au **domaine B (RGPD)** de l'ÉTAPE 2 — **avant** la première invitation réelle |
| I-05 | Qui utilise l'administration le jour J, et sur quel matériel ? | Information de terrain | Question à Romain (domaine E — UX) |
| I-10 | La FFR encadre-t-elle le sort d'un match d'École de Rugby **qui n'a pas pu se jouer** (forfait, ou annulation pour intempéries) ? Existe-t-il une règle de classement imposée ? | `AUDIT-TOURNOI-R92.md` **ne contient rien** sur le sujet : aucun de ses 25 points de vérification (Q11→Q25) ne le couvre. C'est une question de **règle du jeu**, donc du chantier FFR (D-003) | Question de Romain au **Directeur EDR du Racing** ou au **Comité 92** — la voie qui a déjà résolu Q23. Une règle fédérale primerait sur D-011 **et** D-015 |
| I-08 | Une image mise à la corbeille du Drive (affiche, logo, photo de parking) reste-t-elle visible par un lien déjà diffusé, pendant les ~30 jours avant que Google vide la corbeille ? | Le comportement de la corbeille Drive appartient à Google, il n'est pas dans le code | Test réel : mettre une image à la corbeille, puis rouvrir son lien depuis une navigation privée |
| I-09 | Que conserve le **journal d'exécution** de Google Apps Script, et pendant combien de temps ? | Ce journal vit chez Google, hors du dépôt | Consultation par Romain dans l'éditeur Apps Script (« Exécutions ») |

### Points levés

| # | Point | Réponse | Levé le |
|---|---|---|---|
| **I-06** | Comment le Google Sheet est-il réellement partagé ? | ✅ **LEVÉ — le classeur est PRIVÉ.** Romain a fourni une capture du panneau Drive de « Tournoi R92 - Base de données » : *Qui a accès → **Privé*** (propriétaire seul), et *Limites de sécurité → aucune limite appliquée*. L'identifiant du classeur est donc public dans le dépôt **sans que cela expose les données** : le connaître ne suffit pas à ouvrir le fichier. C'est le réglage attendu. Cela confirme aussi que la Web App s'exécute bien **au nom du propriétaire** — c'est ce qui lui permet de lire un classeur privé au profit de visiteurs qui, eux, n'y ont aucun accès. | 2026-08-04, session 2 |
| **I-07** | Les 4 onglets `RefFFR_*` existent-ils et sont-ils à jour ? | ✅ **LEVÉ — les 4 onglets existent, aux noms exacts attendus.** Capture du bas du classeur fournie par Romain : `RefFFR_Formes`, `RefFFR_Regles`, `RefFFR_Temps`, `RefFFR_Dates` — orthographe **identique** à ce que lit `Code.gs`. Contenu visible cohérent (millésimes 2026-2027, formes de jeu 5x5 / 7x7). Les fichiers Drive `RefFFR-formes-de-jeu` et `RefFFR-dates-federales` sont donc des documents **sources** distincts, sans rôle dans le fonctionnement. | 2026-08-04, session 2 |
| **I-02** | Les tests de `backend/Tests.gs` passent-ils aujourd'hui ? | ✅ **LEVÉ — 573 sur 573 passent.** `lancerTestsFFR` lancé par Romain dans Apps Script, après le redéploiement. Le compte confirme au passage que les 16 vérifications ajoutées pour R-014 étaient bien du lot (564 appels écrits en dur + 9 dans des boucles = 573). ⚠️ **Le risque de méthode M-03 demeure** : rien ne lance ces tests automatiquement, c'est un geste manuel qui peut être oublié. | 2026-08-04, session 6 |
| **I-13** | Le redéploiement du backend a-t-il eu lieu, et la correction de R-014 est-elle active ? | ✅ **LEVÉ — oui.** Le diagnostic « Tester la remontée » confirme la chaîne complète : écriture, relecture, et 109 relevés réels de spectateurs. R-014 passe au statut **TESTÉ**. | 2026-08-04, session 6 |
| **I-11** | Comment la Web App est-elle réellement publiée chez Google ? | ✅ **LEVÉ — « Exécuter en tant que : Moi » et « Qui a accès : Tout le monde ».** Capture de l'écran de déploiement fournie par Romain. « Tout le monde » veut dire **sans compte Google, sans rien**. C'est le réglage **nécessaire** (les spectateurs doivent pouvoir lire les scores) : rien à y changer. Mais cela confirme que R-014 n'exigeait aucun préalable — d'où sa correction immédiate. | 2026-08-04, session 6 |
| **I-12** | Les deux clés sont-elles des suites aléatoires ou des mots choisis à la main ? | ⚠️ **LEVÉ — ce sont des MOTS choisis par Romain** : *« pour les MDP c'est moi qui ai choisi ce sont des mots »*. C'est la réponse défavorable : **R-019 passe de P2 à P1**. Le remède ne demande aucun code — remplacer les deux clés par des suites aléatoires (**D-017**). | 2026-08-04, session 6 |
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
| Historique Git | **513 enregistrements** au total (relus **en entier** en session 6, à la recherche de mots de passe : **aucune fuite**). Branche de travail `claude/session-6-etape-2-securite-0tul4c`, partie de `dda3987` |
| `frontend/js/vendor/` | **4 bibliothèques extérieures**, ~750 Ko, **sans version ni origine documentée** (`pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`) — voir R-024 |
