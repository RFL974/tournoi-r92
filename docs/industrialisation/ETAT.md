# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-04 (session 5, après décisions de Romain)
**Commit de référence** : `d0a0ea5` (branche `claude/cartographie-donnees-etape-1-t1e9xq`)

---

## 1. EN UNE PHRASE

L'**ÉTAPE 1 est terminée** et l'**ÉTAPE 2 a commencé** : le **domaine A (métier)** est audité —
**12 problèmes identifiés, dont 5 P1, aucun P0**. Romain a tranché **deux règles métier**
(forfait, limite des scores) et **deux propositions attendent sa validation** (ajustement du
planning, critères de départage). Il reste **7 domaines** à auditer.
**Aucun fichier de l'application n'a été modifié** et **aucun problème n'est corrigé**.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | ✅ **TERMINÉE** (sessions 2, 3 et 4) |
| 2 | **ÉTAPE 2 — Audit global** (8 domaines, P0→P3) | 🟡 **EN COURS** — domaine A fait (session 5), 7 restants |
| 3 | ÉTAPE 3 — Plan d'industrialisation priorisé | ⬜ À faire |
| 4 | ÉTAPE 4 — Validation par Romain | ⬜ À faire |
| 5 | ÉTAPE 5 — Implémentation par petites unités | ⬜ À faire |
| 6 | ÉTAPE 6 — Commits atomiques | ⬜ À faire |

---

## 3. PHASE EN COURS — L'ÉTAPE 2 (audit)

**Ordre validé par Romain** (décision D-010) : **A → C → B → D → E → F → G → H**.

| Domaine | Nom | Statut |
|---|---|---|
| **A** | **Métier / Product Owner** | ✅ **FAIT** (session 5) — 12 problèmes, 0 P0, 5 P1, 6 P2, 1 P3 |
| C | Sécurité | ⬜ **Prochain** |
| B | RGPD / Protection des données | ⬜ À faire |
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

**Session 6 — ÉTAPE 2, domaine C : la sécurité.** *(toujours sans rien modifier)*

Objectif : passer en revue qui peut faire quoi, et ce qu'un visiteur mal intentionné pourrait
obtenir. Les points de la cartographie qui l'alimentent directement : **A-05** (clés = mots de
passe partagés, sans notion de personne), **A-06** (une écriture publique sans clé), **A-10**
(jetons voyageant par courriel), **B-03** (garde-fou d'effacement des scores tenu par la seule
page), **B-09** (le contenu des courriels est fabriqué par le navigateur), **B-11** (la
réinitialisation ne demande aucune confirmation au serveur), **C-11** (une requête donne tout le
carnet d'adresses).

Pour chaque faille : criticité, scénario d'exploitation, impact, recommandation, difficulté de
correction — comme l'impose `CLAUDE.md` §6.C. **Aucune mesure de sécurité ne sera modifiée sans
validation préalable.**

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

**11 problèmes identifiés, tous au statut IDENTIFIÉ** (vus, pas corrigés) — voir `RISQUES.md` pour
le registre et `AUDIT.md` pour l'explication de chacun.

| Priorité | Nombre | Domaine A |
|---|---|---|
| **P0** | **0** | — |
| **P1** | **5** | R-001 forfait ✅ *(règle tranchée)* · R-002 blocage après-midi · R-003 planning figé ⏳ · R-004 départage ⏳ · R-005 score aberrant ✅ *(règle tranchée)* |
| **P2** | 6 | R-006 → R-010, plus **R-012** (aucune règle sportive n'est écrite pour les clubs) |
| **P3** | 1 | R-011 |

✅ = la **règle métier** est décidée, le **code n'est pas écrit**. ⏳ = ma proposition attend la
validation de Romain.

**Le fil rouge du domaine A** : l'application est excellente **avant** le coup d'envoi et rigide
**après**. Les 5 P1 apparaissent tous le jour J, quand la réalité s'écarte du plan — forfait,
match non saisi, terrain impraticable, égalité parfaite, faute de frappe.

**Décisions métier prises le 2026-08-04** :

- **D-011 — forfait** : l'absent marque **0 point**, le présent **gagne**, le score attribué est un
  **paramètre de l'organisateur**, et la règle retenue doit être **communiquée aux clubs** ;
- **D-012 — scores** : **2 chiffres maximum** (au-delà, refus) et **confirmation avant chaque
  validation**.

**Deux propositions attendent la validation de Romain** : **D-013** (déplacer un match + décaler
toute la journée de X minutes) et **D-014** (ajouter la confrontation directe puis l'ordre
alphabétique au départage).

> L'exigence de transparence posée par D-011 a fait apparaître **R-012** : ni le barème, ni le
> départage ne sont écrits où que ce soit pour les clubs, et le champ « Règlement » du dossier a
> été **retiré de l'écran d'administration**. La règle décidée ne serait donc, en l'état,
> communicable à personne.

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

**En attente de validation** (voir `DECISIONS.md`) :

- D-005 — Périmètre exact du dépôt à auditer (le site vitrine `boutique-r92` est un **autre** dépôt)
- **D-013** — Comment ajuster le planning en cours de journée (proposition faite à sa demande)
- **D-014** — Quels critères de départage ajouter (proposition faite à sa demande)

---

## 8. POINTS INCONNUS

Ces points sont **INCONNU** au sens de la règle de transparence : impossibles à établir sans
vérification supplémentaire.

| # | Point inconnu | Pourquoi | Comment le lever |
|---|---|---|---|
| I-01 | Le code réellement en service chez Google est-il identique à `backend/Code.gs` ? | Le backend s'exécute chez Google, hors du dépôt | Vérification manuelle par Romain dans Apps Script |
| I-02 | Les tests du fichier `backend/Tests.gs` passent-ils aujourd'hui ? | Ils ne peuvent être exécutés que dans Google Apps Script | Lancement manuel par Romain |
| I-03 | Quelles données personnelles de **tiers** seront présentes dans le Google Sheet une fois de vrais clubs invités ? | ✅ **Rien à ce jour** (précisé par Romain le 2026-08-04) : les seules adresses email présentes sont **la sienne et celle de son épouse**, utilisées pour tester les envois. ✅ L'**inventaire de ce que l'application peut collecter** est désormais **fait** (volet C, session 4) : nom / prénom / email du contact de chaque club, et des **effectifs** d'enfants (jamais leur nom). Ce qui reste ouvert n'est plus « quoi », mais « **que décide-t-on d'en faire** » | Instruction au **domaine B (RGPD)** de l'ÉTAPE 2 — **avant** la première invitation réelle |
| I-05 | Qui utilise l'administration le jour J, et sur quel matériel ? | Information de terrain | Question à Romain (domaine E — UX) |
| I-08 | Une image mise à la corbeille du Drive (affiche, logo, photo de parking) reste-t-elle visible par un lien déjà diffusé, pendant les ~30 jours avant que Google vide la corbeille ? | Le comportement de la corbeille Drive appartient à Google, il n'est pas dans le code | Test réel : mettre une image à la corbeille, puis rouvrir son lien depuis une navigation privée |
| I-09 | Que conserve le **journal d'exécution** de Google Apps Script, et pendant combien de temps ? | Ce journal vit chez Google, hors du dépôt | Consultation par Romain dans l'éditeur Apps Script (« Exécutions ») |

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
