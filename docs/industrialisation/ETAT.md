# ÉTAT DE L'INDUSTRIALISATION — Tournoi R92

> **Ce fichier répond à une seule question : où en sommes-nous ?**
> Il est court **volontairement**. Il est mis à jour **à la fin de chaque session**.
> Le détail vit dans `PLAN.md`, `RISQUES.md`, `DECISIONS.md`, `SESSIONS.md`.

**Dernière mise à jour** : 2026-08-05 (session 11, close — **domaine G audité**)
**Commit de référence** : `1667696` sur **`main`** — la session 11 part de là.
**Documentation uniquement — aucun fichier de l'application modifié**, aucun redéploiement requis.

> ✅ **Tout le travail décrit ci-dessous est dans `main`.** Une session qui démarre depuis `main`
> voit donc l'état réel du chantier. *(Ce n'était pas le cas au démarrage de la session 6, où une
> PR non fusionnée avait fait croire que le travail des sessions 4 et 5 n'existait pas — d'où
> cette ligne, désormais tenue à jour à chaque fin de session.)*

---

## 1. EN UNE PHRASE

L'**ÉTAPE 1 est terminée** et l'**ÉTAPE 2 touche au but** : **sept domaines sur huit sont
audités** — le **A (métier)**, le **C (sécurité)**, le **B (protection des données)**, le
**D (tests)**, le **E (expérience d'utilisation)**, le **F (performance)** et le
**G (architecture)**, soit **81 problèmes**. Le domaine G, fait en session 11, rend un verdict
inhabituel et rassurant sur le fond : **le code est en bien meilleur état que sa documentation.**
Les fondations sont saines — le classeur Google n'est ouvert qu'à **8 endroits** dans 8 147 lignes,
et le cœur qui décide du planning ne connaît même pas l'existence de Google. Le problème est
ailleurs, et il est mesuré : **les trois documents qui servent de carte au projet décrivent une
application qui n'existe plus** (68 % des actions du serveur n'y figurent pas, et tout le parcours
d'invitation des clubs est absent) — et **le fichier de tests, qui est la seule preuve dont ce
projet dispose, n'est cité par aucun document**. Ce n'est pas de la paperasse : **c'est exactement
ce qui a produit la preuve fausse de M-04**. **Aucun P0**, **deux P1**, tous deux réparables **sans
toucher une ligne de l'application**. **Une seule chose t'attend et n'est pas technique** :
remplacer les deux mots de passe par des suites aléatoires (**D-017**, ce qui referme R-019). Il
reste **1 domaine** à auditer : le **H (qualité du code)**.

---

## 2. PHASES

| # | Phase | Statut |
|---|---|---|
| 0 | Mise en place du système de suivi | ✅ **TERMINÉE** (session 1) |
| 1 | **ÉTAPE 1 — Cartographie** (comprendre le projet, ne rien modifier) | ✅ **TERMINÉE** (sessions 2, 3 et 4) |
| 2 | **ÉTAPE 2 — Audit global** (8 domaines, P0→P3) | 🟡 **EN COURS** — A (s. 5), C (s. 6), B (s. 7), D (s. 8), E (s. 9), F (s. 10) et G (s. 11) faits, **1 restant** |
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
| **D** | **QA / Tests** | ✅ **CLOS** (session 8) — 10 problèmes, **0 P0**, 4 P1, 5 P2, 1 P3 · **+ M-04** (une preuve du dossier était fausse) · aucune décision de Romain requise pour constater |
| **E** | **UX / UI / Accessibilité** | ✅ **CLOS** (session 9) — 10 problèmes, **0 P0**, 2 P1, 7 P2, 1 P3 · **I-05 levée** · écrans **réellement ouverts et mesurés** dans un navigateur · aucune décision de Romain requise pour constater |
| **F** | **Performance** | ✅ **CLOS** (session 10) — 11 problèmes, **0 P0**, 2 P1, 7 P2, 2 P3 · **2 inconnues ouvertes** (I-18, I-19) · **42 appels réels chronométrés**, poids transféré mesuré, **25 lectures simultanées** essayées · aucune décision de Romain requise pour constater |
| **G** | **Architecture / Maintenabilité** | ✅ **CLOS** (session 11) — 10 problèmes, **0 P0**, 2 P1, 7 P2, 1 P3 · **sa seule décision (D-028) est déjà tranchée** le jour même · **1 inconnue** (I-20), non bloquante · relevés faits **sur le code réel**, et les 2 suspects de l'analyse automatique **ouverts à la main** avant d'être écartés |
| H | Qualité du code | ⬜ **Prochain — dernier domaine** |

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

**2. ✅ FAIT le 2026-08-05 — recoller `Tests.gs` chez Google et relancer** (**I-17**). Romain a
collé le fichier et lancé `lancerTestsFFR` → **`R92 — 589/589 OK, 0 FAIL`**. Contrôle croisé sur
la capture fournie : la dernière ligne du fichier chez Google est la **3711**, et
`backend/Tests.gs` en compte exactement **3 711** — c'est bien la version du dépôt, au caractère
près. **M-04 est refermé**, et le statut TESTÉ de **R-014** retrouve une troisième preuve, cette
fois vraie.

**3. Poser les deux questions sortantes** — **I-10** (à la FFR : le sort d'un match non joué) et
**I-15** (au club : le droit à l'image). Le délai de réponse ne dépend pas de nous, donc les poser
tôt ne coûte rien et peut faire gagner des semaines. Ce sont les deux seules exceptions à D-024,
avec D-017.

**4. ✅ FAIT le 2026-08-05 — I-18 levée.** Romain a fourni **trois pages** du journal
« Exécutions ». **128 exécutions réelles analysées, 100 % « Terminée », aucun échec.** Le
résultat n'est pas celui qu'on espérait : une lecture occupe le serveur **1,65 s** — alors que
`ping`, qui n'exécute **rien**, en occupe déjà **1,59 s**. Le cache est donc **excellent**
(+0,06 s pour servir tout le tournoi), mais **~1,6 s de démarrage par appel est incompressible**.
**Capacité : 150 à 300 spectateurs, pas 1 300.** Détail complet en `AUDIT.md` **§F.9**.

**5. 🏉 LA question, et toi seul peux y répondre** : **combien de spectateurs viennent
réellement ?** (**I-19**). Le chiffre de **1 300** est écrit dans `docs/relais-cdn.md`, **sans
source**. Depuis que I-18 est levée, **c'est la seule question qui décide** : sous ~150 personnes,
on ne touche à rien ; au-delà, il faut allonger le rafraîchissement (gratuit, double la capacité)
et probablement allumer le relais (**R-061**). Ce n'est pas une question technique : c'est ta
connaissance du terrain.

**6. Rien d'autre.** Les trois questions du domaine B — **D-018, D-019, D-020** — ont été
**reportées à la fin des audits** par Romain (**D-023**, puis généralisé par **D-024** à *tous*
les points en suspens — registre en **§10**) : plus rien ne presse depuis
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

### Puis : session 12 — ÉTAPE 2, domaine H : la qualité du code — **LE DERNIER**

*(toujours sans rien modifier)*

C'est l'ordre validé par D-010 (**A → C → B → D → E → F → G → H**). Le domaine H regarde le code
**de près**, ligne à ligne, là où le domaine G le regardait **de loin** : fonctions trop longues,
logique dupliquée, noms peu explicites, code mort, commentaires devenus faux, complexité inutile,
gestion d'erreurs insuffisante.

> ⚠️ **Règle rappelée par `CLAUDE.md` §6.H** : toute modification doit conserver **exactement** le
> comportement métier attendu. Le domaine H **constate**, il ne nettoie pas.

Ce qui l'alimente déjà, et c'est copieux :

- **les fonctions les plus longues sont repérées et mesurées** — côté serveur
  `assemblerDossierAutorisation` (**333 lignes**), `calculerPlanning` (224), `evaluerConformiteFFR`
  (179), `enregistrerSponsor` (159) ; côté navigateur `redimensionnerImage` (338),
  `htmlClubEdition` (254), `planRemplissageAutorisation` (239) ;
- **des commentaires déjà démontrés faux** : celui de `doGet` annonce une réponse « en quelques
  millisecondes » alors que la mesure donne **1,65 s** (domaine F), et l'en-tête de `Tests.gs`
  annonce des tests « de conformité FFR » alors qu'il teste tout le serveur (**R-076**) ;
- **du code mort à qualifier** : le domaine G a trouvé **183 Ko publiés que rien ne charge**
  (**R-080**) — reste à chercher l'équivalent *dans* le code ;
- **les 29 « miroirs »** (**R-044**) : le domaine G a dit **pourquoi** ils existent ; le domaine H
  doit dire **s'ils disent la même chose**.

**Condition de démarrage** : instruction explicite de Romain.

> 🏁 **Après le domaine H, l'ÉTAPE 2 sera terminée** et l'ÉTAPE 3 (le plan priorisé) pourra
> s'ouvrir — en commençant, comme le prévoit **§10.4**, par reprendre une à une les inconnues puis
> les décisions accumulées par **D-024**.

---

## 5. CORRECTIONS DÉJÀ RÉALISÉES DANS CE CADRE

**Une seule — R-014, le P0 de sécurité** *(session 6, commit `c1948fc`, exception validée D-016)*.

| Ce qui a changé | Où | État |
|---|---|---|
| Trois plafonds sur `mesureSponsors`, la seule écriture ouverte sans mot de passe : un plafond **dur** sur la taille de l'onglet des relevés, et deux plafonds de **débit** (global et par appareil) vérifiés **avant** d'ouvrir le classeur | `backend/Code.gs` | ✅ **En service** |
| 9 tests ajoutés (16 vérifications) | `backend/Tests.gs` | ✅ **Passent chez Google** |
| Le diagnostic « Tester la remontée » dit désormais qu'un plafond est atteint, au lieu d'annoncer une écriture réussie suivie d'une relecture introuvable | `frontend/js/admin-sponsors.js` | ✅ **En ligne** |

**✅ Statut : TESTÉ** *(2026-08-04)* — **le premier problème du chantier à l'atteindre**, mais
**une de ses trois preuves est tombée en session 8** (voir l'encadré juste après). Les trois
preuves, telles qu'inscrites au départ :

1. **le backend a été redéployé** chez Google → lève **I-13** ;
2. ~~**573 tests sur 573 passent**~~ → ❌ **preuve annulée en session 8** (573 = le compte du
   fichier ***avant*** la correction) → ✅ **REMPLACÉE LE MÊME JOUR, ET CETTE FOIS ELLE EST
   VRAIE** : Romain a recollé `Tests.gs` chez Google et relancé `lancerTestsFFR` →
   **`R92 — 589/589 OK, 0 FAIL`**. Les 16 vérifications de R-014 ont donc bien tourné **chez
   Google**. **I-17 levée**, **M-04 refermé** ;
3. **la chaîne fonctionne toujours de bout en bout** : écriture ✅, relecture ✅, et **109 relevés**
   présents dans le classeur. C'est la **preuve de non-régression** qui manquait — le plafonnement
   n'a rien cassé.
   > ⚠️ **Corrigé le 2026-08-05** : ces 109 relevés viennent des **propres appareils de Romain**
   > (essais depuis plusieurs appareils, pour vérifier que la remontée ne partait pas du seul
   > navigateur de son ordinateur) — **pas de spectateurs**, comme l'écrivait la version
   > précédente de ce document. **La preuve de non-régression tient entièrement** : des relevés
   > ont bien été écrits puis relus. Seule l'origine était fausse.

> ✅ **La preuve a été refaite, correctement, le 2026-08-05** — **`589/589 OK, 0 FAIL`** dans Apps
> Script. Deux contrôles croisés sur la capture fournie par Romain : le **nombre** (589 = le
> compte du fichier *après* la correction) et la **dernière ligne du fichier** (3711, exactement
> le nombre de lignes de `backend/Tests.gs`). C'est bien la bonne version qui a tourné.
>
> ⚠️ **Ce que ce résultat prouve — et ce qu'il ne prouve pas.** Les tests s'exécutent dans
> l'**éditeur** Apps Script, donc contre le `Code.gs` **enregistré dans le projet**. Ils prouvent
> que **ce** code passe les 589 vérifications, R-014 comprise. Ils ne prouvent pas à eux seuls que
> l'**adresse web publique** sert cette version : Apps Script permet de figer un déploiement sur
> une ancienne version. **M-02 est donc fortement réduit, pas supprimé** — et la vérification qui
> le supprimerait est celle qui existe déjà : le bouton « Tester la remontée » de l'écran
> Partenaires, qui interroge, lui, la vraie adresse publique.

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

**81 problèmes — 1 corrigé, 80 au statut IDENTIFIÉ** (vus, pas corrigés) — voir `RISQUES.md` pour
le registre et `AUDIT.md` pour l'explication de chacun.

| Priorité | Total | Domaine A (métier) | Domaine C (sécurité) | Domaine B (données) | Domaine D (tests) | Domaine E (expérience) | Domaine F (performance) | Domaine G (architecture) |
|---|---|---|---|---|---|---|---|---|
| **P0** | **1** | — | ✅ **R-014** porte ouverte sans limite — **TESTÉ, en service** *(une preuve remplacée, voir §5)* | — | — | — | — | — |
| **P1** | **23** | R-001 forfait ✅ · R-002 blocage après-midi · R-003 planning figé ✅ · R-004 départage ✅ · R-005 score aberrant ✅ | R-015 scores effacés · R-016 réinitialisation · R-017 mots de passe partagés · R-018 liens des clubs · **R-019 clés devinables** *(monté de P2)* | R-028 personne n'est informé · **R-029 mesure des spectateurs** *(SUSPENDU — partenaires désactivés le 2026-08-05)* · R-030 rien ne s'efface | **R-041 classement/départage non testés** · **R-042 saisie du score non testée** · **R-043 le navigateur part en ligne sans contrôle** · **R-044 règles écrites en double, jamais confrontées** | **R-051 « Rafraîchir » échoue en silence** · **R-052 « Failed to fetch » affiché au bénévole** | **R-061 le relais anti-affluence est éteint** · **R-062 le cache s'éteint tout seul vers 165 matchs** | **R-072 la procédure de redéploiement décrit la moitié du geste** *(le mécanisme même de M-04)* · **R-073 la carte du projet décrit une autre application** |
| **P2** | 48 | R-006 → R-010 · **R-012** ✅ · **R-013** ✅ | R-020 → R-025 | R-031 → R-039 | R-045 → R-049 | R-053 → R-059 | R-063 → R-069 | R-074 → R-080 |
| **P3** | 9 | R-011 | R-026 · R-027 | R-040 | R-050 | R-060 | R-070 · R-071 | R-081 |

**Risques de méthode** : M-01 · M-02 · M-03 *(largement levé en session 8)* · M-04 *(traité en
session 8 — un compte de tests ne dit pas quelle version a été exécutée)* · ⚡ **M-05** *(nouveau,
session 11 — **l'audit photographie une application qui continue de bouger**)*.

> ⚡ **M-05, et pourquoi il compte plus qu'il n'en a l'air.** Le cadre est écrit comme si
> l'application était **stable** pendant qu'on l'audite. Elle ne l'est pas, et **elle ne doit pas
> l'être** : *« c'est une phase de pré-industrialisation, pas une fermeture totale des
> fonctionnalités »* (Romain, 2026-08-05). Le chantier fonctionnalités en est à sa **session 28**,
> déployée la **veille** du démarrage de celui-ci.
>
> **Ce que ça ne change pas** : l'audit reste valable. Un problème constaté ne devient pas faux
> parce qu'on ajoute du code après — il devient **plus grand**.
>
> **Ce que ça change** : six problèmes **grossissent tout seuls** (R-073, R-074, R-076, R-078,
> R-044, R-079), et **un se REDÉCLENCHE** — **R-072** : chaque fonctionnalité serveur est un
> redéploiement, donc **un nouveau tirage du piège de M-04**. → **D-029**.

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

**Le fil rouge du domaine D**, en deux phrases :

1. **On teste ce qui a été construit récemment, pas ce qui compte depuis le début.** Le harnais
   suit fidèlement le chantier FFR — conformité, invitations, feuille de report, Super Challenge —
   c'est-à-dire tout ce qui se passe **avant** le tournoi. Le classement, le départage et la saisie
   des scores sont le **cœur historique** : ils marchent depuis si longtemps que personne n'a
   jamais éprouvé le besoin de les protéger. **Ce sont précisément ceux que l'ÉTAPE 5 va
   modifier** (D-011, D-012, D-014, D-015).
2. **L'obstacle n'était pas là où on le croyait.** On pensait les tests prisonniers de Google
   (M-03) : ils tournent ici en une seconde. On croyait le harnais trop petit : il fait 589
   vérifications. Le vrai manque n'est ni technique ni quantitatif — **c'est que rien ne vérifie
   les deux gestes qui décident du classement d'un tournoi.**

**Le fil rouge du domaine E**, en deux phrases :

1. **L'application sait déjà tout faire bien — elle ne l'a pas fait partout.** Les 44 pixels de
   cible tactile, le bouton qui annonce sa progression, la confirmation qui nomme ce qu'elle va
   détruire, l'anti-cache mobile : tout cela **existe dans ce projet**, écrit par la même main,
   souvent avec le commentaire qui explique pourquoi. Ces bons réflexes sont sur les écrans
   **construits récemment**. Les écrans **les plus anciens et les plus utilisés** — la saisie
   simple, la page publique — sont restés en arrière. Il y a peu à **inventer**, beaucoup à
   **propager**.
2. **Le seul vrai défaut de conception est le silence.** La page de saisie ne dit pas qu'elle
   travaille, ne dit pas qu'elle a échoué, et — le plus grave — peut affirmer qu'elle est à jour
   quand elle ne l'est pas. Rendre l'interface *« difficile à utiliser incorrectement »*, ici, ce
   n'est pas la redessiner : **c'est la faire parler**.

> ✅ **Ce que le domaine E a montré de bon** : les contrastes de la page de saisie sont
> **excellents** (de **9,6 à 21** pour 4,5 exigé) ; l'administration mesure **578 textes conformes
> sur 603** (96 %) et **208 cibles cliquables sur 212** au-dessus du seuil ; la saisie détaillée
> U14 est **exemplaire** (boutons de **44 × 44 px**, total en points **calculé et affiché en
> grand**) ; l'administration porte **28 confirmations**, dont deux qui **nomment le nombre exact
> de scores** qui seront effacés **et exigent la re-saisie du mot de passe** ; le **double-clic est
> bloqué** ; une saisie en cours de frappe **n'est jamais écrasée** ; corriger un score validé
> **redemande le mot de passe** ; corriger un score du matin après génération de l'après-midi
> **avertit et donne le remède** ; **aucun débordement horizontal jusqu'à 320 px** ; et les bases
> de l'accessibilité sont là (`lang="fr"`, un seul `h1`, repères de structure, lien « Aller au
> contenu » sur la page publique, animations réduites respectées). La liste complète est dans
> `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain — domaine E »).

> ⚠️ **La limite principale du domaine E, et il faut la dire** : tout a été mesuré **dans un
> navigateur d'ordinateur simulant un téléphone**. **Personne n'a jamais saisi un score dehors**,
> en plein soleil, debout, avec de vrais doigts, sur son propre téléphone. Les contrastes calculés
> sont un **plancher optimiste** : un écran au soleil, à luminosité réduite, fait bien pire.
> **Trente minutes d'essai réel** avec deux ou trois bénévoles vaudraient mieux que tout ce
> domaine — et feraient probablement apparaître des problèmes qu'aucune mesure ne trouve.

> ✅ **Ce que le domaine D a montré de bon** : le harnais est **réel et entretenu** (3 711 lignes,
> 278 tests, **589 vérifications, 0 échec**, en croissance de la session 5 à la 28) ; il est écrit
> en **cœur pur** (données injectées, aucun accès au classeur), donc **rejouable hors de Google** —
> démontré cette session, `589/589` en ~1 seconde avec une vingtaine de lignes de doublures ; il
> est **reproductible** (le tirage au sort est un interrupteur que les tests coupent) ; il est
> **prudent par construction** (des tests vérifient qu'un format inventé retombe sur le chemin
> prudent — c'est rare et c'est excellent) ; les **écritures simultanées sont sérialisées** par un
> verrou, donc le risque de concurrence est traité ; le **double-clic** est bloqué sur la saisie ;
> et **85 fonctions** sont déjà « pures », donc testables **aujourd'hui sans rien changer au
> code**. La liste complète est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain —
> domaine D »).

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

**Le fil rouge du domaine F**, en deux phrases :

1. **Le travail de performance a été fait, puis arrêté juste avant la fin.** Cache serveur,
   anti-ruée, copie de secours, pause en arrière-plan, étalement aléatoire, délai d'abandon,
   verrou court-circuité pour les lectures d'administration : **tout est là, et bien fait**. Le
   relais qui couronne l'édifice est écrit des deux côtés, documenté pas à pas — et **il n'a
   jamais été allumé**. Ce domaine ne demande pas de construire : il demande de **terminer**.
2. **Ce qui est lent n'est pas le code, c'est le lieu.** Une action qui ne fait strictement rien
   met déjà **2,3 secondes** à répondre, parce qu'elle passe par Google Apps Script. Aucune
   optimisation ne descendra sous ce plancher — et c'est pourquoi la vraie réponse à l'affluence
   n'est pas d'accélérer le serveur, mais de **ne plus l'interroger** : c'est exactement ce que
   fait le relais éteint.

> ✅ **Ce que le domaine F a montré de bon** : la page publique est **prête en 527 ms** et pèse
> **59 Ko** hors logo, sur 12 fichiers seulement ; les calculs du navigateur sont **négligeables**
> (réaffichage complet des deux vues en **0,9 ms**) — **il ne faut surtout pas y toucher** ;
> **25 lectures simultanées** ont été servies **25 fois sur 25, sans une erreur**, toutes depuis
> la même copie en cache ; le cache serveur **divise le temps par trois** (1,4-2 s contre 4,4-6,3 s) ;
> la « ruée sur le cache » est **traitée** (un seul reconstructeur élu, copie de secours pour les
> autres) ; la taille du cache est mesurée en **octets réels** et non en caractères, avec le
> commentaire disant que le piège avait déjà été rencontré ; le rafraîchissement **se met en pause
> en arrière-plan**, est **étalé au hasard**, **n'empile jamais** deux requêtes et **abandonne au
> bout de 12 s** ; les lectures d'administration **court-circuitent le verrou** pour ne pas
> concurrencer la saisie le jour J ; et une fausse alerte a été **levée** — le minuteur à 5 s des
> partenaires n'écrit que sur le téléphone, l'envoi réseau est bien espacé de 10 minutes. La liste
> complète est dans `RISQUES.md` (« ce qui a été vérifié et s'est révélé sain — domaine F »).

> ⚠️ **Les limites du domaine F, et il faut les dire** : toutes les mesures viennent d'un
> **ordinateur situé à 16 millisecondes des serveurs Google** — ce sont donc des temps
> **plancher**, jamais des temps réels de téléphone en bord de terrain. **Je n'ai pas simulé
> trois cents spectateurs** : j'en ai simulé **vingt-cinq**, une fois — un vrai test de charge sur
> le service en production n'est pas un geste d'audit. Et **aucune écriture n'a été chronométrée**
> (une écriture exige une clé, et une écriture ratée ferait monter le compteur anti-force-brute) :
> le coût d'une validation de score — **3 à 8 s** — est **reconstitué**, donc **PROBABLE**.

> 🔗 **Le domaine F répond à la question que le domaine E lui avait laissée.** `R-053` demandait
> si l'attente après « Valider » était un détail. **Réponse : non.** La reconstruction de
> l'instantané public, mesurée à **2,5-4,5 s**, se fait **pendant que le verrou d'écriture est
> tenu** (**R-067**) — l'attente est donc réelle et s'allonge quand plusieurs marqueurs valident
> ensemble. Un bouton muet pendant quatre secondes est un bouton sur lequel on reclique.

### Domaine G — architecture et maintenabilité *(session 11)* — **10 problèmes, 0 P0, 2 P1**

> 🟢 **Verdict inhabituel, et il faut le dire tel quel : le code est en bien meilleur état que sa
> documentation.** Le classeur Google n'est ouvert qu'à **8 endroits** dans 8 147 lignes ;
> `calculerPlanning` — **224 lignes**, le cœur qui décide quel match se joue où et quand — ne
> contient **aucune** référence à Google ; l'aiguillage des demandes est séparé du travail ; et les
> commentaires expliquent le **pourquoi**, ce qui est rare. C'est exactement ce qui rend possibles
> les **589 vérifications sans aucun Sheet**.

> ⚠️ **Les deux P1 ne portent pas sur ce que l'application FAIT, mais sur ce que le projet RACONTE
> de lui-même.**
>
> **R-072** — la procédure de redéploiement décrit **la moitié du geste** : le serveur, c'est
> `Code.gs` **et `Tests.gs`** (3 711 lignes, 589 vérifications), or `Tests.gs` n'est cité par
> **aucun** des six documents du projet, et `deploiement.md` dit *« coller `Code.gs` »*, point.
> **Ce n'est pas théorique : c'est le mécanisme exact de M-04**, la preuve fausse entrée au dossier
> en session 6 et refaite seulement le 2026-08-05.
>
> **R-073** — la carte du projet ne décrit plus le projet : `architecture.md` documente **21 des
> 65 actions** du serveur (**68 % d'invisible**) et 4 pages sur 8 ; **tout le parcours d'invitation
> des clubs — le travail du dernier mois — n'y figure nulle part**. Là non plus ce n'est pas
> théorique : le chiffre non sourcé de « 1 000-1 300 spectateurs », écrit dans deux documents, a
> conduit la session 10 à une conclusion trop pessimiste, corrigée par Romain (**I-19**).

> 🔗 **Le domaine G explique trois problèmes déjà ouverts** — c'est peut-être son apport principal :
> **R-043** (aucun test du navigateur) n'est pas un manque de temps mais un manque de **prise** :
> calculer et afficher sont le même geste (**R-079**) ; **R-044** (29 règles écrites deux fois)
> n'est pas de la négligence mais une **contrainte** (aucun moyen de partager du code entre Google
> et le navigateur) — donc la bonne réponse n'est pas « arrêter de recopier » mais **faire se
> confronter les deux copies** ; et **M-04 / I-01** ont une cause commune : le dépôt manuel du
> serveur (**R-081**).

> ⚠️ **Le dernier domaine (H — qualité du code) n'est pas audité.** L'absence de problème n'y
> signifie rien.

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
| **D-027** | **L'attente est annoncée, jamais subie.** Page publique : indicateur de chargement **animé** + courte explication du délai, **sans aucun chiffre** (un délai annoncé devient une promesse — or 4 % des appels dépassent 10 s). Page de saisie : animation en **deux temps**, « c'est pris en compte » → « c'est bon ». ✅ **4 arbitrages validés par Romain** (*« je vais suivre l'ensemble de tes conseils »*) : **délai retenu = 30 s, PAS 60** (le bouton « Rafraîchir » concentre la charge au pic ; 60 s seulement si une mesure le justifie) · une animation **ne doit jamais mentir** (3 issues : ça arrive / c'est arrivé / **ça a échoué**) · **CSS pur**, jamais d'image · **l'animation prime sur l'accélération**, car 60 % du temps d'une validation est incompressible | ✅ **Validée (session 10)** — **conception proposée par Romain** |
| **D-026** | **Mieux vaut faire attendre que ne pas délivrer.** Entre des scores très frais et la certitude que chacun finira par les obtenir, on choisit **la certitude** — allonger le rafraîchissement est donc un geste acceptable. ⚠️ **Mais accepter l'attente INTERDIT le silence** : une attente voulue que l'écran n'annonce pas devient indistinguable d'une panne, et les gens rechargent — ce qui aggrave la charge. **D-026 renforce donc R-051, R-052, R-053 et R-069**, qui deviennent le **préalable** de tout allongement de délai | ✅ **Validée (session 10)** — décision **spontanée** de Romain : *« même s'ils doivent attendre un peu […] la finalité c'est qu'ils l'obtiennent »* |
| **D-024** | **Tous les points en suspens (questions, décisions, inconnues) sont accumulés pendant l'ÉTAPE 2 et traités un par un à l'ÉTAPE 3.** Registre unique en **§10**. Trois exceptions : D-017 (une action, pas une question), les questions **sortantes** (I-10, I-15), et un éventuel **P0** | ✅ **Validée (session 7)** — *« on pourra les traiter une par une, de manière détaillée »* |
| **D-023** | **Les trois décisions du domaine B (D-018/019/020) sont reportées à la fin des audits.** Plus rien ne presse : D-022 fixe le déclencheur, R-029 est suspendu. Et elles **ne dépendent pas de l'hébergement**, contrairement à ce qu'on pouvait croire | ✅ **Validée (session 7)** — *« oui après me semble juste »* |
| D-016 | **Corriger R-014 (le P0) tout de suite**, seul, hors de l'ordre du chantier — puis reprendre les audits | ✅ Validée (session 6) — *« va pour B alors je te suis dans ton raisonnement »* |
| **D-021** | **Phase prototype : tout appartient à Romain, et c'est assumé.** Classeur, Drive, boîte d'envoi et données de test sont sur ses comptes personnels — le bon choix pour un prototype. La question du responsable se repose au déclencheur | ✅ **Validée (session 7)** — *« dans cette phase de test tout est à moi »* |
| **D-022** | **Le déclencheur remplace la date** : le jour où l'email d'un tiers entre dans le classeur, les trois P1 du domaine B doivent être réglés. Tant qu'il n'est pas atteint, **aucune exception** à l'ordre du chantier | ✅ **Validée (session 7)** |
| **D-029** | ⚡ **L'industrialisation n'arrête pas les fonctionnalités — et deux mesures s'appliquent donc TOUT DE SUITE.** *« Une phase de pré-industrialisation, pas une fermeture totale des fonctionnalités »* (Romain). **① La fiche de redéploiement est complète** (`docs/deploiement.md` : le serveur = **deux** fichiers, `Tests.gs` compris, + contrôle par **deux nombres** — 589 et 3711). **② La carte se met à jour dans le même lot** que la fonctionnalité (`CLAUDE.md` **§8 bis**, nouvelle section, valable pour **tous** les chantiers). ⚠️ **Aucune autre exception à D-024** : le critère est **cumulatif** — aucun code touché **ET** un coût d'attente qui court à chaque livraison | ✅ **Validée ET APPLIQUÉE (session 11)** — *« applique les deux »*. Seule décision du chantier à avoir été **exécutée** hors ÉTAPE 3 |
| **D-028** | **Le fichier serveur n'est PAS découpé tant que le dépôt chez Google est manuel.** `Code.gs` fait 8 147 lignes et Apps Script accepte plusieurs fichiers — mais 1 fichier → **5 collages à la main**, soit cinq occasions d'en oublier un : **le mécanisme même de M-04**. ⚠️ **Ce n'est pas un permis d'agrandir le fichier**, et **R-074 reste ouvert au registre**. **Réouverture** : le jour où le dépôt cesse d'être manuel (**R-081**) | ✅ **Validée (session 11)** — *« la 2 »*. Première décision prise **avant** l'ÉTAPE 3, et sans entorse à **D-024** : décider de **ne rien faire** n'engage aucun travail et ne peut pas être invalidé par un constat ultérieur |

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
| I-10 | La FFR encadre-t-elle le sort d'un match d'École de Rugby **qui n'a pas pu se jouer** (forfait, ou annulation pour intempéries) ? Existe-t-il une règle de classement imposée ? | `AUDIT-TOURNOI-R92.md` **ne contient rien** sur le sujet : aucun de ses 25 points de vérification (Q11→Q25) ne le couvre. C'est une question de **règle du jeu**, donc du chantier FFR (D-003) | Question de Romain au **Directeur EDR du Racing** ou au **Comité 92** — la voie qui a déjà résolu Q23. Une règle fédérale primerait sur D-011 **et** D-015 |
| I-08 | Une image mise à la corbeille du Drive (affiche, logo, photo de parking) reste-t-elle visible par un lien déjà diffusé, pendant les ~30 jours avant que Google vide la corbeille ? | Le comportement de la corbeille Drive appartient à Google, il n'est pas dans le code | Test réel : mettre une image à la corbeille, puis rouvrir son lien depuis une navigation privée |
| I-09 | Que conserve le **journal d'exécution** de Google Apps Script, et pendant combien de temps ? | Ce journal vit chez Google, hors du dépôt | Consultation par Romain dans l'éditeur Apps Script (« Exécutions ») |
| **I-14** | **Qui est officiellement responsable** de ces données — l'association Génération R92, le Racing 92, ou Romain à titre personnel ? Et le classeur doit-il rester dans un **compte Google individuel** ? | Aucun document du dépôt ne le dit. Ce n'est pas qu'un sujet RGPD : si ce compte est perdu ou bloqué, **l'association perd d'un coup son carnet d'adresses, ses images et son historique** | Réponse de Romain, à écrire dans `DECISIONS.md`. Elle conditionne D-018 (les textes doivent nommer le responsable) — voir **R-039** |
| **I-15** | **Le droit à l'image des enfants est-il géré ailleurs** — par la licence FFR, un document du club, une consigne aux clubs invités ? | Le mécanisme existait dans l'application et a été **retiré sur décision du club** le 2026-08-03. Le modèle `.docx` reste dans le dépôt, plus rien ne le charge. **Rien n'écrit ce qui l'a remplacé** | Question de Romain au club. Tant que la réponse est inconnue, ce n'est **pas un défaut du code** — voir **R-036** |
| **I-16** | **Le site vitrine `boutique-r92` porte-t-il déjà des mentions légales ou une page « Vos données » ?** | C'est un **autre dépôt**, hors périmètre tant que D-005 n'est pas tranchée — or c'est l'endroit naturel de la page prévue par D-018 | Vérification par Romain, ou extension du périmètre (D-005) |
| **I-19** | **Combien de spectateurs sont réellement attendus ?** Le chiffre de **1 300** vient de `docs/relais-cdn.md`, **sans source**. C'est lui qui décide s'il faut allumer le relais (**R-061**) ou non | Aucun document du dépôt ne le justifie. C'est une connaissance de terrain, pas une donnée technique | Réponse de Romain — **il est le seul à savoir** combien de familles viennent à ce tournoi |

### Points levés

| # | Point | Réponse | Levé le |
|---|---|---|---|
| **I-06** | Comment le Google Sheet est-il réellement partagé ? | ✅ **LEVÉ — le classeur est PRIVÉ.** Romain a fourni une capture du panneau Drive de « Tournoi R92 - Base de données » : *Qui a accès → **Privé*** (propriétaire seul), et *Limites de sécurité → aucune limite appliquée*. L'identifiant du classeur est donc public dans le dépôt **sans que cela expose les données** : le connaître ne suffit pas à ouvrir le fichier. C'est le réglage attendu. Cela confirme aussi que la Web App s'exécute bien **au nom du propriétaire** — c'est ce qui lui permet de lire un classeur privé au profit de visiteurs qui, eux, n'y ont aucun accès. | 2026-08-04, session 2 |
| **I-07** | Les 4 onglets `RefFFR_*` existent-ils et sont-ils à jour ? | ✅ **LEVÉ — les 4 onglets existent, aux noms exacts attendus.** Capture du bas du classeur fournie par Romain : `RefFFR_Formes`, `RefFFR_Regles`, `RefFFR_Temps`, `RefFFR_Dates` — orthographe **identique** à ce que lit `Code.gs`. Contenu visible cohérent (millésimes 2026-2027, formes de jeu 5x5 / 7x7). Les fichiers Drive `RefFFR-formes-de-jeu` et `RefFFR-dates-federales` sont donc des documents **sources** distincts, sans rôle dans le fonctionnement. | 2026-08-04, session 2 |
| **I-02** | Les tests de `backend/Tests.gs` passent-ils aujourd'hui ? | ✅ **LEVÉ — 573 sur 573 passent.** `lancerTestsFFR` lancé par Romain dans Apps Script, après le redéploiement. Le compte confirme au passage que les 16 vérifications ajoutées pour R-014 étaient bien du lot (564 appels écrits en dur + 9 dans des boucles = 573). ⚠️ **Le risque de méthode M-03 demeure** : rien ne lance ces tests automatiquement, c'est un geste manuel qui peut être oublié. | 2026-08-04, session 6 |
| **I-13** | Le redéploiement du backend a-t-il eu lieu, et la correction de R-014 est-elle active ? | ✅ **LEVÉ — oui.** Le diagnostic « Tester la remontée » confirme la chaîne complète : écriture, relecture, et 109 relevés. ⚠️ **Corrigé le 2026-08-05** : ces relevés viennent des **appareils de Romain**, pas de spectateurs. **La preuve tient quand même** — des relevés ont bien été écrits puis relus. R-014 reste **TESTÉ**. | 2026-08-04, session 6 |
| **I-11** | Comment la Web App est-elle réellement publiée chez Google ? | ✅ **LEVÉ — « Exécuter en tant que : Moi » et « Qui a accès : Tout le monde ».** Capture de l'écran de déploiement fournie par Romain. « Tout le monde » veut dire **sans compte Google, sans rien**. C'est le réglage **nécessaire** (les spectateurs doivent pouvoir lire les scores) : rien à y changer. Mais cela confirme que R-014 n'exigeait aucun préalable — d'où sa correction immédiate. | 2026-08-04, session 6 |
| **I-12** | Les deux clés sont-elles des suites aléatoires ou des mots choisis à la main ? | ⚠️ **LEVÉ — ce sont des MOTS choisis par Romain** : *« pour les MDP c'est moi qui ai choisi ce sont des mots »*. C'est la réponse défavorable : **R-019 passe de P2 à P1**. Le remède ne demande aucun code — remplacer les deux clés par des suites aléatoires (**D-017**). | 2026-08-04, session 6 |
| **I-17** | Les 16 vérifications de R-014 passent-elles **chez Google** ? | ✅ **LEVÉ — OUI, `R92 — 589/589 OK, 0 FAIL`.** Romain a recollé `backend/Tests.gs` dans Apps Script et relancé `lancerTestsFFR` le jour même où le problème a été signalé. Deux contrôles croisés sur la capture : le **nombre** (589 = le compte du fichier *après* la correction ; 573 était celui d'avant) et la **dernière ligne du fichier** (3711 = exactement le nombre de lignes de `backend/Tests.gs`). **M-04 refermé** ; la 2ᵉ preuve du statut TESTÉ de **R-014** est reconstituée. ⚠️ **Portée exacte** : les tests tournent dans l'**éditeur**, donc contre le `Code.gs` **du projet** — pas nécessairement contre la version figée à l'adresse publique. **M-02 fortement réduit, pas supprimé.** | 2026-08-05, session 8 |
| **I-18** | **Combien de temps une demande occupe-t-elle réellement le serveur de Google ?** | ✅ **LEVÉE — 1,59 s pour ne RIEN faire, 1,65 s pour tout servir.** Romain a fourni **trois pages** du journal « Exécutions » : **128 exécutions réelles, 100 % « Terminée », aucun échec**. Lectures : médiane **2,07 s** (max 19,55 s). Écritures : médiane **2,67 s** (max 8,20 s) — ce qui **confirme** l'estimation « PROBABLE 3 à 8 s » de R-067, désormais **CERTAIN**. ⚠️ **Trois conséquences** : (1) **capacité ≈ 150 à 300 spectateurs, pas 1 300** ; (2) le commentaire de `doGet` (« quelques millisecondes ») est **faux de deux ordres de grandeur** — le coût est un **démarrage incompressible de ~1,6 s**, que le code ne peut pas réduire ; (3) **levier gratuit** : porter le rafraîchissement de 15 s à 30 s **double la capacité**. ✅ Au passage, une trace inédite pour **M-02** : les exécutions web portent **« Version 148 »**, l'éditeur **« Head »** — le mécanisme du risque est constaté directement. Détail : `AUDIT.md` §F.9 | 2026-08-05, session 10 |
| **I-05** | Qui utilise l'administration le jour J, et sur quel matériel ? | ✅ **LEVÉE — partiellement, et c'est suffisant pour le domaine E.** Réponses de Romain : **création du tournoi depuis un ordinateur** ; **scores saisis par des bénévoles sur leur propre téléphone** *(à confirmer)* ; **qui** fera quoi le jour J n'est **pas encore décidé** — on raisonne donc sur quelqu'un **qui n'a pas été formé** ; **réseau excellent au Racing** (Plessis-Robinson, Colombes, 5G), **inconnu ailleurs**. ⚠️ **« Leur propre téléphone » est la contrainte la plus lourde** : matériel **inconnu** (petit écran, vieil appareil, plein soleil) — d'où les mesures faites jusqu'à **320 px** de large. | 2026-08-05, session 9 |
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
| `backend/Code.gs` | **8 147 lignes, 277 fonctions**, un seul fichier |
| `backend/Tests.gs` | **3 711 lignes** — **278 tests, 589 vérifications, 0 échec**. ✅ **Exécutables hors d'Apps Script** (démontré en session 8, ~1 s, avec une vingtaine de lignes de doublures) |
| **Couverture mesurée** (session 8) | **104 fonctions sur 277 traversées = 38 %** · 173 jamais exécutées · **110** reçoivent le classeur (hors de portée par construction) · **85 pures et non testées** = testables aujourd'hui sans rien changer |
| Points d'entrée backend | `doGet` (ligne 313) = **15 actions de lecture** · `doPost` (ligne 2801) = **50 actions** |
| Onglets du Google Sheet | jusqu'à **12** (7 créés par `setupSheet`, `Mesures` à la demande, 4 `RefFFR_*` remplis à la main) |
| `frontend/` | 8 pages HTML, **26 fichiers JS = 17 712 lignes** (+ 4 bibliothèques dans `js/vendor/`), 6 feuilles CSS — **0 test**. Dossier publié : **3,2 Mo**, dont **183 Ko que rien ne charge** (R-080) |
| Frontend — code | **600 fonctions globales** (colonne 0) + 131 imbriquées, et **142 variables globales**, dans un espace unique ; **12 noms en double** (7 fonctions + 5 variables), **sans collision effective aujourd'hui — vérifié page par page** *(chiffre affiné en session 11 : le « 693 » des sessions précédentes mélangeait fonctions globales et imbriquées)* |
| Frontend — dépendances internes | **13 paires de fichiers s'appellent mutuellement** ; `admin.js` appelle du code de **9** autres fichiers, dont **8** le rappellent (**R-077**) |
| Backend — couplage au classeur | ✅ `SpreadsheetApp.openById` **8 fois** en 8 147 lignes · **92 fonctions** reçoivent le classeur en paramètre · `calculerPlanning` (224 l., le cœur métier) **n'y touche pas du tout** |
| Backend — rangement | **26 bandeaux de section** dans `Code.gs` · `Tests.gs` : **277 groupes de tests**, **31 préfixes dont 27 sont des n° de session** (**R-076**) |
| Documentation — état | `architecture.md` documente **21 des 65 actions** (**68 % d'invisible**) et 4 pages sur 8 · `README.md` : 6 fichiers JS sur 26 · **`Tests.gs` cité par 0 document sur 6** (**R-072**, **R-073**) |
| Versions | **aucune** : `CHANGELOG.md` (2 406 lignes) est **intégralement** sous `## [Non publié]`, et **`git tag` ne renvoie rien** (**R-075**) |
| Outillage | **aucun** `package.json`, aucune étape de construction, aucune vérification automatique, **aucun dépôt automatisé du serveur** (**R-081**) |
| Publication du frontend | `.github/workflows/pages.yml` publie `frontend/` sur Internet **à chaque envoi sur `main`** — **sans lancer aucun test, pas même un contrôle de syntaxe** (R-043) |
| Règles écrites **en double** (serveur + navigateur) | **29 mentions de « miroir »** dans le frontend, dont le **barème et le départage**. Rien ne vérifie qu'elles disent la même chose (R-044) |
| `docs/` | 11 documents existants (architecture, déploiement, guide utilisateur, passation…) |
| `AUDIT-TOURNOI-R92.md` | Audit de conformité FFR, ~129 000 caractères, méthode par sessions propre |
| `CHANGELOG.md` | ~197 000 caractères |
| `.github/workflows/pages.yml` | 1 automatisation de publication |
| `cloudflare/` | 1 dossier |
| Historique Git | **513 enregistrements** au total (relus **en entier** en session 6, à la recherche de mots de passe : **aucune fuite**). Branche de travail `claude/session-6-etape-2-securite-0tul4c`, partie de `dda3987` |
| `frontend/js/vendor/` | **4 bibliothèques extérieures**, ~750 Ko, **sans version ni origine documentée** (`pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`) — voir R-024 |
| **Mesures de performance** *(session 10, sur l'application EN LIGNE)* | **Page publique** : prête en **527 ms**, chargée en **718 ms**, **59 Ko** transférés hors logo, **12 fichiers**. **Page de saisie** : **47 Ko**. **Administration** : **468 Ko** sur 25 fichiers, dont **207 Ko de `pdf-lib`** (44 %). **Logo** : **229 Ko** à lui seul (chargé en 700×558, affiché en 60×48) — servi par l'autre dépôt |
| **Serveur Google** *(42 appels chronométrés)* | Plancher **2,3 s** (`ping`, qui n'exécute rien) · `getAll` médiane **≈ 2,1 s** · cache chaud **1,36-2,05 s** · cache froid **4,36-6,30 s** · pointes observées **16,8 s** et **20,1 s** (au-delà du délai d'abandon de 12 s) · **25 lectures simultanées → 25/25 servies**, la plus lente à 8,57 s |
| **Instantané public servi** | **30 460 octets** pour **51 matchs / 37 équipes** — **466 o par match**, **142 o par équipe**. **58 % du poids des matchs = des champs vides** (17 champs vides sur 27). Le cache serveur **s'éteint au-delà de 95 000 o**, soit **≈ 165 matchs** (R-062) |

---

## 10. REGISTRE DES POINTS EN SUSPENS

> **À quoi sert cette section.** Décision **D-024** : rien n'est tranché pendant l'ÉTAPE 2. Tout
> ce qui attend une réponse est **accumulé ici**, puis repris **une par une** au début de
> l'ÉTAPE 3. Ce tableau est **mis à jour à la fin de chaque session d'audit** — c'est le seul
> endroit où regarder pour savoir ce qui reste ouvert.

**Dernière mise à jour du registre** : 2026-08-05 (fin du domaine **G**, complétée le soir même —
**D-028 tranchée**, **D-029 ouverte**).

> ⚡ **UNE REMARQUE DE ROMAIN A OUVERT LA SEULE QUESTION QUE LE CADRE NE POSAIT PAS.**
>
> *« C'est une phase de pré-industrialisation, pas une fermeture totale des fonctionnalités de
> l'app — il y aura forcément des ajouts de code et de fonctionnalités. »*
>
> **C'est exact, et le cadre n'en disait rien** : ni `CLAUDE.md`, ni `DECISIONS.md` ne prévoient ce
> qui se passe quand du code neuf arrive **pendant** l'audit. Or c'est le cas — chantier
> fonctionnalités à sa **session 28**, déployée la **veille** du démarrage de l'industrialisation.
>
> Conséquence inscrite : **M-05** (risque de méthode) et **D-029** — ✅ **tranchée ET appliquée le
> jour même**. Le point à retenir : **deux problèmes sur 81 coûtaient quelque chose à attendre** —
> **R-072** et **R-073** — et ce sont justement les deux qui ne demandaient **aucune ligne de code**.
>
> ✅ **Ce sont donc les deux SEULES mesures exécutées hors ÉTAPE 3 depuis le début du chantier**
> (avec la correction du P0, R-014, par exception D-016). Le critère qui les a fait passer est
> **cumulatif** : *aucun code touché* **ET** *un coût d'attente qui court à chaque livraison*.
> Aucun autre problème ne remplit les deux.

> ✅ **Le domaine G a ajouté UNE décision (D-028) et UNE inconnue (I-20) — et la décision est déjà
> tranchée.**
>
> ✅ **D-028 — TRANCHÉE le 2026-08-05 : le fichier serveur n'est PAS découpé** tant que le dépôt
> chez Google est manuel. Découper en 5 fichiers transformerait **un** collage en **cinq**, donc
> cinq occasions d'en oublier un — précisément ce qui a produit **M-04**. ⚠️ **Ce n'est pas un
> permis d'agrandir le fichier**, et **R-074 reste ouvert** : le fichier est trop long, c'est
> constaté ; c'est la **correction** qui coûte plus cher que le problème. **Réouverture** : le jour
> où le dépôt cesse d'être manuel (**R-081**).
>
> **I-20 — quelqu'un d'autre reprendra-t-il ce code, et quand ?** Elle ne change **pas la nature**
> de **R-073** (la carte est fausse, que quelqu'un la lise ou non), seulement son **rang** de
> priorité. `docs/passation.md` §11 prévoit déjà une bascule vers les comptes de l'association.
>
> ⚠️ **Et une chose que le domaine G n'ajoute pas mais confirme** : **R-072 est le seul problème
> de tout le chantier qui se redéclenchera au prochain geste technique** — le prochain
> redéploiement du serveur, quel qu'il soit. Cinq lignes de texte le referment.

> ✅ **Le domaine F n'a ajouté AUCUNE décision en attente**, mais **deux inconnues — et les deux
> ont bougé le soir même.**
>
> **I-18 est LEVÉE** : 128 exécutions réelles analysées, la capacité est chiffrée.
>
> **I-19 est REFORMULÉE**, parce que Romain a montré qu'elle était **mal posée** : le nombre de
> spectateurs n'est pas prévisible (il dépend des équipes, des éducateurs, des parents présents
> **et de ceux qui suivent depuis la maison ou le travail** — un public que l'audit avait
> entièrement oublié). Sa remarque a **corrigé une conclusion trop pessimiste** : la capacité se
> compte en **écrans allumés sur la page**, pas en personnes — or la page **se met en pause** dès
> que l'onglet n'est plus visible. **Conduite à tenir qui en découle** : porter le rafraîchissement
> de 15 s à 30 s (**R-064**, un chiffre à changer) suffit jusqu'à ~1 000 personnes qui suivent ;
> le relais (**R-061**) ne devient nécessaire qu'au-delà. Détail : `AUDIT.md` **§F.10**.
>
> ✅ **Le domaine E n'avait ajouté AUCUNE décision en attente et AUCUNE inconnue.** Ses 10 problèmes
> sont des **choix techniques** — ils n'appellent aucun arbitrage de Romain pour être constatés,
> seulement pour être **ordonnés**, à l'ÉTAPE 3 (**D-024**). Il a en revanche **levé I-05**.
>
> Une seule chose lui est **recommandée**, et elle n'est ni une question ni une décision :
> **essayer la saisie pour de vrai**, trente minutes, dehors, avec deux ou trois bénévoles et
> **leurs** téléphones. C'est la seule façon de vérifier ce qu'aucune mesure ne peut établir.

### 10.1 — Ce qui ne doit PAS attendre *(les trois exceptions de D-024)*

| # | Quoi | Pourquoi ça ne peut pas attendre |
|---|---|---|
| **D-017** | **Remplacer les deux clés par des suites aléatoires** | Ce n'est pas une question, c'est une **action** : cinq minutes, aucune réflexion, et elle referme **R-019** (P1). Menu du classeur → « Configurer les clés » |
| **I-10** | **Question à la FFR** : le sort d'un match qui n'a pas pu se jouer (forfait, intempéries) est-il encadré ? | **Question sortante** — Directeur EDR du Racing / Comité 92. Le délai de réponse ne dépend pas de nous. Une règle fédérale primerait sur **D-011** et **D-015** |
| **I-15** | **Question au club** : le droit à l'image des enfants est-il géré ailleurs (licence FFR, document du club, consigne aux clubs invités) ? | **Question sortante** — même raison. Le mécanisme a été retiré de l'application le 2026-08-03 sur décision du club, sans que rien n'écrive ce qui l'a remplacé (**R-036**) |

| ~~**I-17**~~ | ~~Recoller `Tests.gs` chez Google et relancer~~ | ✅ **FAIT le 2026-08-05 — `589/589 OK, 0 FAIL`.** M-04 refermé |

> Ces trois-là ne coûtent rien à traiter tout de suite, et les garder en réserve ne protégerait
> rien. **Un P0 découvert dans un audit à venir constituerait une quatrième exception** : il
> serait présenté immédiatement, comme R-014 l'a été (**D-016**).

### 10.2 — Décisions en attente

| Réf | La question | Née en | Bloque |
|---|---|---|---|
| ~~**D-029**~~ | ~~Comment les deux chantiers cohabitent~~ | ~~Session 11~~ | ✅ **TRANCHÉE ET APPLIQUÉE le 2026-08-05** — *« applique les deux »*. Voir §7 |
| **D-005** | **Périmètre du dépôt à auditer** : le site vitrine `boutique-r92` entre-t-il dans le chantier ? | Session 1 | **I-16**, et l'emplacement de la future page « Vos données » (**D-018**) |
| **D-009** | **Où atterrit la documentation** quand une branche de travail est imposée ? | Session 2 | Rien de fonctionnel — une question de méthode |
| **D-018** | **Que dit-on aux personnes** dont on garde les informations ? *(trois textes courts)* | Session 7 | **R-028** (P1) |
| **D-019** | **Que fait-on de la mesure des partenaires ?** Informer · demander l'accord · alléger | Session 7 | **R-029** (P1) — **suspendu** tant que les partenaires restent éteints |
| **D-020** | **Combien de temps garde-t-on quoi ?** *(tableau de durées à valider)* | Session 7 | **R-030** (P1), **R-031**, **R-033**, **R-034** |
| ~~**D-028**~~ | ~~Faut-il découper le fichier serveur de 8 147 lignes ?~~ | ~~Session 11~~ | ✅ **TRANCHÉE le 2026-08-05** — **non**, tant que le dépôt chez Google est manuel. Voir §7 et `DECISIONS.md` |
| **D-025** | **Quels tests écrit-on, et dans quel ordre ?** 4 lots proposés (`AUDIT.md` §D.9) : ① barème et départage ② une journée de bout en bout ③ contrôle de syntaxe à la publication ④ la saisie d'un score. **Ma recommandation si un seul devait être fait : le lot ①** — il est le moins cher, il protège ce qui compte le plus, et **D-014 est déjà décidée** : écrits après la modification, ces tests graveraient le nouveau comportement sans avoir jamais vu l'ancien | Session 8 | **R-041** (et le calendrier de D-014, D-011, D-012) |

### 10.3 — Inconnues à lever

| Réf | Ce qu'on ne sait pas | Comment le lever | Pour quel domaine |
|---|---|---|---|
| **I-01** | Le code en service chez Google est-il identique à `backend/Code.gs` ? | Vérification de Romain dans Apps Script | Permanent (**M-02**) |
| ~~**I-05**~~ | ~~Qui utilise l'administration le jour J, et sur quel matériel ?~~ | ✅ **LEVÉE le 2026-08-05** (session 9) — voir §8 | ~~E — UX~~ |
| **I-08** | Une image mise à la corbeille du Drive reste-t-elle visible par un lien déjà diffusé pendant ~30 jours ? | Test réel de 5 minutes : corbeille, puis rouvrir le lien en navigation privée | **B** — **R-035** |
| **I-09** | Que conserve le journal d'exécution de Google Apps Script, et combien de temps ? | Consultation dans l'éditeur Apps Script (« Exécutions ») | **B / C** — **R-023**, **R-039** |
| **I-10** | La FFR encadre-t-elle le sort d'un match non joué ? | **Question sortante** — voir §10.1 | **A** — D-011, D-015 |
| **I-14** | Qui est officiellement responsable des données, et le classeur doit-il rester dans un compte individuel ? | Réponse de Romain **au déclencheur** — non bloquant aujourd'hui (**D-021**) | **B** — **R-039** |
| **I-15** | Le droit à l'image des enfants est-il géré ailleurs ? | **Question sortante** — voir §10.1 | **B** — **R-036** |
| **I-16** | Le site vitrine `boutique-r92` porte-t-il déjà des mentions légales ou une page de confidentialité ? | Vérification de Romain, ou extension du périmètre (**D-005**) | **B** — **D-018** |
| ~~**I-18**~~ | ~~Combien de temps une demande occupe-t-elle réellement le serveur de Google ?~~ | ✅ **LEVÉE le 2026-08-05** — 128 exécutions analysées, capacité ≈ 150-300 spectateurs. Voir §8 et `AUDIT.md` §F.9 | ~~F~~ |
| **I-20** | **Quelqu'un d'autre que Romain reprendra-t-il ce code, et quand ?** `docs/passation.md` §11 prévoit une bascule vers les comptes de l'association (dont l'adresse d'envoi, vers le compte de Jérémy) — mais cela concerne les **comptes**, pas forcément le **code** | **Réponse de Romain.** ⚠️ **Non bloquante** : elle ne change pas la nature de **R-073** (la carte est fausse, que quelqu'un la lise ou non), seulement son rang de priorité | **G** — **R-073** |
| **I-19** *(reformulée le 2026-08-05)* | **Quelle part du public regarde son écran au MÊME INSTANT lors d'un pic** (fin de match, annonce du classement) ? ⚠️ **La question d'origine — « combien de spectateurs ? » — était mal posée** : Romain a montré qu'elle n'est pas prévisible (elle dépend des équipes présentes, des éducateurs, des parents sur place **et de ceux qui suivent depuis la maison ou le travail**). Elle est en revanche **calculable** : `Equipes` porte déjà `nb_joueurs` et `nb_educateurs`, remplies par les clubs à leur réponse | Le seul paramètre qui ne se déduit d'aucune donnée. La page se mettant en pause quand l'onglet n'est pas visible, seuls comptent les **écrans allumés sur la page** | **Observation le jour J** : regarder le journal « Exécutions » **pendant** le tournoi | **F** — **R-061**, **R-064** |

### 10.4 — Comment ce registre sera traité

À l'ouverture de l'**ÉTAPE 3**, les points ci-dessus seront repris **un par un**, dans cet ordre :

1. **les inconnues d'abord** — on ne décide pas sur du sable ;
2. **puis les décisions**, chacune présentée avec : le problème en langage simple, les options,
   ce que chacune coûte et apporte, et une recommandation ;
3. **puis seulement** le tableau des chantiers de `PLAN.md`.

> ⚠️ **Chaque session d'audit doit alimenter ce registre avant de se clore.** Une question
> soulevée mais non inscrite ici est une question perdue — c'est exactement ce que **D-001**
> cherche à empêcher.
