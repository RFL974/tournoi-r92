# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-05 (session 7, close)
**Commit de référence** : session 7 sur la branche `claude/industrialisation-rgpd-donnees-n03yu8`,
partie de `77f8ae7` (`main`). **Documentation uniquement — aucun fichier de l'application modifié.**

> ✅ **Tout le travail décrit ci-dessous est dans `main`.** Une session qui démarre depuis `main`
> voit donc l'état réel du chantier. *(Ce n'était pas le cas au démarrage de la session 6, où une
> PR non fusionnée avait fait croire que le travail des sessions 4 et 5 n'existait pas — d'où
> cette ligne, désormais tenue à jour à chaque fin de session.)*

---

## 1. EN UNE PHRASE

L'**ÉTAPE 1 est terminée** et l'**ÉTAPE 2 avance** : **trois domaines sur huit sont audités** —
le **A (métier)**, le **C (sécurité)** et le **B (protection des données)**, soit **40
problèmes**. Le domaine B, fait en session 7, dit une chose simple : **l'application collecte
remarquablement peu — aucun enfant n'y est identifié — mais elle ne dit rien à personne et
n'efface jamais rien**. **Aucun P0**, **trois P1**. Les trois décisions qui en découlent
(**D-018**, **D-019**, **D-020**) ne demandent aucune ligne de code, et Romain les a **reportées
à la fin des audits** (**D-023**) : plus rien ne presse depuis que **D-022** fixe un déclencheur
— *le jour où l'email d'un tiers entre dans le classeur* — et que **R-029 est suspendu**, les
partenaires ayant été désactivés. **Une seule chose t'attend donc maintenant, et elle n'est pas
technique** : remplacer les deux mots de passe par des suites aléatoires (**D-017**, ce qui
referme R-019). Il reste **5 domaines** à auditer.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | ✅ **TERMINÉE** (sessions 2, 3 et 4) |
| 2 | **ÉTAPE 2 — Audit global** (8 domaines, P0→P3) | 🟡 **EN COURS** — domaines A (session 5), C (session 6) et B (session 7) faits, 5 restants |
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
| **B** | **RGPD / Protection des données** | ✅ **CLOS** (session 7) — 13 problèmes, **0 P0**, 3 P1, 9 P2, 1 P3 · 3 décisions **reportées à l'ÉTAPE 3** (D-018, D-019, D-020 — voir **D-023**) |
| D | QA / Tests | ⬜ **Prochain** |
| E | UX / UI / Accessibilité | ⬜ À faire |
| F | Performance | ⬜ À faire |
| G | Architecture / Maintenabilité | ⬜ À faire |
| H | Qualité du code | ⬜ À faire |

> L'**ÉTAPE 1 (cartographie)** est terminée : volets A (session 2), B (session 3) et C (session 4),
> tous dans `CARTOGRAPHIE.md`. Elle a produit les **39 points d'attention** qui servent de matière
> première à l'audit.

---

## 4. PROCHAINE ÉTAPE

### Ce qui n'appartient qu'à Romain, et qu'aucune session ne peut faire à sa place

**1. Remplacer les deux mots de passe par des suites aléatoires** — **D-017**. Menu du classeur
**« Tournoi R92 → Configurer les clés »**. Cinq minutes, aucune ligne de code, et R-019 redevient
un problème théorique. La vraie question à trancher n'est pas technique : **où ranger ces clés**,
et **comment transmettre celle des scores aux bénévoles le jour J**.

**2. Rien d'autre.** Les trois questions du domaine B — **D-018, D-019, D-020** — ont été
**reportées à la fin des audits** par Romain (**D-023**, 2026-08-05) : plus rien ne presse depuis
que `D-022` fixe un déclencheur et que R-029 est suspendu. Elles seront reprises au début de
l'ÉTAPE 3, avec les 40 problèmes sous les yeux.

> ⚠️ **À dissiper, parce que c'était la raison invoquée** : ces décisions **ne dépendent pas de
> l'hébergement**. Hébergement (Google + GitHub Pages) et stockage (le Google Sheet) sont **déjà
> tranchés de fait** et n'ont pas à être rouverts. Seule la **conservation** reste ouverte — et
> une durée se décide sans savoir où vivent les données. Aucune réflexion sur l'hébergement n'est
> attendue de Romain : c'est le domaine G et R-040 (SaaS, P3), prématuré aujourd'hui.

Pour mémoire, les trois questions reportées :

| Réf | La question, en une phrase | Ma recommandation |
|---|---|---|
| **D-018** | **Que dit-on aux gens ?** Puis-je rédiger une première version des trois textes d'information, que tu relis et fais valider par le club ? | **Oui, et maintenant** — il me manque deux choses que toi seul as : qui est officiellement responsable, et quelle adresse de contact y mettre |
| **D-019** | **Que fait-on de la mesure des partenaires**, qui écrit déjà sur le téléphone de chaque spectateur ? Informer · demander l'accord · alléger | **Informer**, avec un moyen de dire non. C'est le seul qui améliore la situation sans dégrader la page des scores |
| **D-020** | **Combien de temps garde-t-on quoi ?** Valider ou corriger le tableau des durées | **Valider le tableau, corriger ce qui te paraît faux** — c'est ton métier qui décide. Écrire les durées ne touche à aucun code |

### Puis : session 8 — ÉTAPE 2, domaine D : les tests (QA)

*(toujours sans rien modifier)*

C'est l'ordre validé par D-010 (**A → C → B → D → E → F → G → H**). Le domaine D arrive au bon
moment : **trois domaines ont produit 40 problèmes, et pas un seul n'a pu être prouvé par un
test lancé depuis ici** (risque de méthode **M-03**). Avant de corriger quoi que ce soit à
l'ÉTAPE 5, il faut savoir **comment on prouvera que rien n'est cassé**.

Les points qui l'alimentent directement : **M-03** (les tests ne se lancent qu'à la main, chez
Google), le harnais `backend/Tests.gs` (3 594 lignes, 573 vérifications, 301 fonctions), la piste
du **cœur pur** trouvée en session 6 (des fonctions sans accès au classeur, donc rejouables hors
de Google), et les fonctions critiques repérées par les domaines A et C : classement, départage,
génération des poules et du planning, calcul des scores.

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
3. **la chaîne fonctionne toujours de bout en bout** : écriture ✅, relecture ✅, et **109 relevés**
   présents dans le classeur. C'est la **preuve de non-régression** qui manquait — le plafonnement
   n'a rien cassé.
   > ⚠️ **Corrigé le 2026-08-05** : ces 109 relevés viennent des **propres appareils de Romain**
   > (essais depuis plusieurs appareils, pour vérifier que la remontée ne partait pas du seul
   > navigateur de son ordinateur) — **pas de spectateurs**, comme l'écrivait la version
   > précédente de ce document. **La preuve de non-régression tient entièrement** : des relevés
   > ont bien été écrits puis relus. Seule l'origine était fausse.

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

**40 problèmes — 1 corrigé, 39 au statut IDENTIFIÉ** (vus, pas corrigés) — voir `RISQUES.md` pour
le registre et `AUDIT.md` pour l'explication de chacun.

| Priorité | Total | Domaine A (métier) | Domaine C (sécurité) | Domaine B (données) |
|---|---|---|---|---|
| **P0** | **1** | — | ✅ **R-014** porte ouverte sans limite — **TESTÉ, en service** | — |
| **P1** | **13** | R-001 forfait ✅ · R-002 blocage après-midi · R-003 planning figé ✅ · R-004 départage ✅ · R-005 score aberrant ✅ | R-015 scores effacés · R-016 réinitialisation · R-017 mots de passe partagés · R-018 liens des clubs · **R-019 clés devinables** *(monté de P2)* | R-028 personne n'est informé · **R-029 mesure des spectateurs** *(SUSPENDU — partenaires désactivés le 2026-08-05)* · R-030 rien ne s'efface |
| **P2** | 22 | R-006 → R-010 · **R-012** ✅ · **R-013** ✅ | R-020 → R-025 | R-031 → R-039 |
| **P3** | 4 | R-011 | R-026 · R-027 | R-040 |

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

**Le fil rouge du domaine B**, en deux phrases :

1. **La collecte est exemplaire ; le silence ne l'est pas.** L'application ne demande presque
   rien et **n'identifie aucun enfant** — pas un nom, pas une date de naissance, pas une licence.
   Mais elle ne dit **rien à personne** : ni au contact d'un club dont elle garde l'adresse d'une
   édition à l'autre, ni au spectateur dont le téléphone compte des logos de partenaires.
2. **Rien ne s'efface, et personne ne l'a décidé.** L'absence de durée de conservation n'est pas
   un choix contestable : c'est un **choix qui n'a jamais été fait**. Neuf des treize problèmes
   du domaine disparaissent le jour où ces durées sont écrites — et les écrire ne demande
   **aucune ligne de code**.

> ✅ **Ce que la protection des données a montré de bon** : **aucun enfant n'est identifié**
> (recherche sur l'ensemble du dépôt) ; l'email d'un club n'est **jamais** renvoyé, pas même au
> club concerné ; un envoi groupé envoie **un courriel par club**, jamais un courriel commun ; le
> téléphone du contact public a été **volontairement retiré** de la page publique, avec la raison
> écrite ; les documents PDF sont fabriqués **entièrement sur l'appareil** ; et il n'y a **aucun
> cookie, aucun traceur tiers, aucun outil de mesure d'audience extérieur**. La liste complète
> est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain — domaine B »).

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
| **D-023** | **Les trois décisions du domaine B (D-018/019/020) sont reportées à la fin des audits.** Plus rien ne presse : D-022 fixe le déclencheur, R-029 est suspendu. Et elles **ne dépendent pas de l'hébergement**, contrairement à ce qu'on pouvait croire | ✅ **Validée (session 7)** — *« oui après me semble juste »* |
| D-016 | **Corriger R-014 (le P0) tout de suite**, seul, hors de l'ordre du chantier — puis reprendre les audits | ✅ Validée (session 6) — *« va pour B alors je te suis dans ton raisonnement »* |
| **D-021** | **Phase prototype : tout appartient à Romain, et c'est assumé.** Classeur, Drive, boîte d'envoi et données de test sont sur ses comptes personnels — le bon choix pour un prototype. La question du responsable se repose au déclencheur | ✅ **Validée (session 7)** — *« dans cette phase de test tout est à moi »* |
| **D-022** | **Le déclencheur remplace la date** : le jour où l'email d'un tiers entre dans le classeur, les trois P1 du domaine B doivent être réglés. Tant qu'il n'est pas atteint, **aucune exception** à l'ordre du chantier | ⏳ **Proposée (session 7)** — à confirmer |

**En attente** (voir `DECISIONS.md`) :

- **D-017 — Remplacer les deux clés par des suites aléatoires.** *(aucun code : une action de
  Romain, cinq minutes — c'est ce qui referme R-019)* ;
- **D-018 — Que dit-on aux personnes dont on garde les informations ?** *(trois textes courts —
  referme R-028)* ;
- **D-019 — Que fait-on de la mesure de visibilité des partenaires ?** *(informer / demander
  l'accord / alléger — referme R-029, le seul problème du domaine B qui tourne déjà)* ;
- **D-020 — Combien de temps garde-t-on quoi ?** *(un tableau de durées à valider — referme
  R-030, et met R-031, R-033 et R-034 en ordre de marche)* ;
- D-005 — Périmètre exact du dépôt à auditer (le site vitrine `boutique-r92` est un **autre**
  dépôt — et c'est **lui** qui accueillerait naturellement la page « Vos données » de D-018).

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
| **I-14** | **Qui est officiellement responsable** de ces données — l'association Génération R92, le Racing 92, ou Romain à titre personnel ? Et le classeur doit-il rester dans un **compte Google individuel** ? | Aucun document du dépôt ne le dit. Ce n'est pas qu'un sujet RGPD : si ce compte est perdu ou bloqué, **l'association perd d'un coup son carnet d'adresses, ses images et son historique** | Réponse de Romain, à écrire dans `DECISIONS.md`. Elle conditionne D-018 (les textes doivent nommer le responsable) — voir **R-039** |
| **I-15** | **Le droit à l'image des enfants est-il géré ailleurs** — par la licence FFR, un document du club, une consigne aux clubs invités ? | Le mécanisme existait dans l'application et a été **retiré sur décision du club** le 2026-08-03. Le modèle `.docx` reste dans le dépôt, plus rien ne le charge. **Rien n'écrit ce qui l'a remplacé** | Question de Romain au club. Tant que la réponse est inconnue, ce n'est **pas un défaut du code** — voir **R-036** |
| **I-16** | **Le site vitrine `boutique-r92` porte-t-il déjà des mentions légales ou une page « Vos données » ?** | C'est un **autre dépôt**, hors périmètre tant que D-005 n'est pas tranchée — or c'est l'endroit naturel de la page prévue par D-018 | Vérification par Romain, ou extension du périmètre (D-005) |

### Points levés

| # | Point | Réponse | Levé le |
|---|---|---|---|
| **I-06** | Comment le Google Sheet est-il réellement partagé ? | ✅ **LEVÉ — le classeur est PRIVÉ.** Romain a fourni une capture du panneau Drive de « Tournoi R92 - Base de données » : *Qui a accès → **Privé*** (propriétaire seul), et *Limites de sécurité → aucune limite appliquée*. L'identifiant du classeur est donc public dans le dépôt **sans que cela expose les données** : le connaître ne suffit pas à ouvrir le fichier. C'est le réglage attendu. Cela confirme aussi que la Web App s'exécute bien **au nom du propriétaire** — c'est ce qui lui permet de lire un classeur privé au profit de visiteurs qui, eux, n'y ont aucun accès. | 2026-08-04, session 2 |
| **I-07** | Les 4 onglets `RefFFR_*` existent-ils et sont-ils à jour ? | ✅ **LEVÉ — les 4 onglets existent, aux noms exacts attendus.** Capture du bas du classeur fournie par Romain : `RefFFR_Formes`, `RefFFR_Regles`, `RefFFR_Temps`, `RefFFR_Dates` — orthographe **identique** à ce que lit `Code.gs`. Contenu visible cohérent (millésimes 2026-2027, formes de jeu 5x5 / 7x7). Les fichiers Drive `RefFFR-formes-de-jeu` et `RefFFR-dates-federales` sont donc des documents **sources** distincts, sans rôle dans le fonctionnement. | 2026-08-04, session 2 |
| **I-02** | Les tests de `backend/Tests.gs` passent-ils aujourd'hui ? | ✅ **LEVÉ — 573 sur 573 passent.** `lancerTestsFFR` lancé par Romain dans Apps Script, après le redéploiement. Le compte confirme au passage que les 16 vérifications ajoutées pour R-014 étaient bien du lot (564 appels écrits en dur + 9 dans des boucles = 573). ⚠️ **Le risque de méthode M-03 demeure** : rien ne lance ces tests automatiquement, c'est un geste manuel qui peut être oublié. | 2026-08-04, session 6 |
| **I-13** | Le redéploiement du backend a-t-il eu lieu, et la correction de R-014 est-elle active ? | ✅ **LEVÉ — oui.** Le diagnostic « Tester la remontée » confirme la chaîne complète : écriture, relecture, et 109 relevés. ⚠️ **Corrigé le 2026-08-05** : ces relevés viennent des **appareils de Romain**, pas de spectateurs. **La preuve tient quand même** — des relevés ont bien été écrits puis relus. R-014 reste **TESTÉ**. | 2026-08-04, session 6 |
| **I-11** | Comment la Web App est-elle réellement publiée chez Google ? | ✅ **LEVÉ — « Exécuter en tant que : Moi » et « Qui a accès : Tout le monde ».** Capture de l'écran de déploiement fournie par Romain. « Tout le monde » veut dire **sans compte Google, sans rien**. C'est le réglage **nécessaire** (les spectateurs doivent pouvoir lire les scores) : rien à y changer. Mais cela confirme que R-014 n'exigeait aucun préalable — d'où sa correction immédiate. | 2026-08-04, session 6 |
| **I-12** | Les deux clés sont-elles des suites aléatoires ou des mots choisis à la main ? | ⚠️ **LEVÉ — ce sont des MOTS choisis par Romain** : *« pour les MDP c'est moi qui ai choisi ce sont des mots »*. C'est la réponse défavorable : **R-019 passe de P2 à P1**. Le remède ne demande aucun code — remplacer les deux clés par des suites aléatoires (**D-017**). | 2026-08-04, session 6 |
| **I-04** | L'application a-t-elle servi un tournoi réel ? | ✅ **LEVÉ — non : le tournoi actuellement en base est un tournoi de TEST.** Romain : « c'est juste un faux tournoi avec de vrais noms ». Les noms d'équipes visibles (Racing 92, Stade Français, Clamart, Meudon, Vélizy, Antony, Sèvres, Issy-les-Moulineaux) sont de vrais clubs, mais les engagements sont fictifs. | 2026-08-04, session 2 |

> ✅ **À retenir de I-03 + I-04** : le classeur ne contient **aucune donnée personnelle de tiers**
> aujourd'hui. Tournoi fictif, et les seuls emails présents sont ceux de Romain et de son épouse,
> saisis pour tester les envois.
>
> **La question n'est donc pas « faut-il réparer », mais « faut-il préparer ».** L'application est
> conçue pour collecter les coordonnées des contacts de clubs : le jour de la première invitation
> réelle, de vraies données personnelles de tiers entreront dans le classeur.
>
> ✅ **Le domaine B a été traité dans cette fenêtre, comme prévu** (session 7). Ce qui reste à
> faire **avant** la première invitation réelle n'est donc plus un audit, mais **trois décisions**
> — D-018, D-019, D-020 — dont **aucune ne demande d'écrire du code**. La fenêtre est encore
> ouverte ; elle ne se rouvrira pas.
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
