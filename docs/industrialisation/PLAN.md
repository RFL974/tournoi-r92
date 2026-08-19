# PLAN D'INDUSTRIALISATION — Tournoi R92

> Ce fichier contient le **plan global**. Il évolue au fur et à mesure des audits.
> Tant que l'audit (ÉTAPE 2) n'a pas eu lieu, le tableau des chantiers reste **vide** :
> on ne planifie pas des travaux qu'on n'a pas encore constatés.

> 📕 **L'ÉTAPE 2 est close** (2026-08-05). La matière première de ce plan est dans
> [`RAPPORT-AUDIT.md`](RAPPORT-AUDIT.md) — dont le **§6** contient déjà une **proposition d'ordre
> de traitement en 6 étapes**, ainsi qu'une liste de ce qu'il ne faut **PAS** faire. ⚠️ C'est une
> **proposition**, pas une décision : elle sera construite à l'ÉTAPE 3 et validée à l'ÉTAPE 4,
> chantier par chantier.

**Dernière mise à jour** : 2026-08-19 *(soir)* — ⚡ **ARBITRAGE DE R-092 ET R-093** *(**D-037**)* :
**R-092 rejoint C-015** *(toute invalidation d'un résultat doit effacer le détail périmé)* · ⚡ **R-093
devient le chantier C-031**, *« les colonnes du classeur : une seule façon de les désigner »*, dont le
périmètre couvre **au minimum `Matchs` ET `Equipes`** · 🛡️ une **règle de protection provisoire** est
inscrite dans **C-015** *(toute colonne nouvelle s'ajoute **à la fin**)*, qui protège ce chantier
**sans refermer R-093** · ✅ **§12 corrigé** : *« 91 sur 91 placés »* était devenu faux — le registre
compte **93 problèmes**, et **aucun n'est désormais sans situation connue**. ⏳ **C-015 reste le
prochain chantier à ouvrir**, sa conception n'est **pas** commencée.

*Rappel de la mise à jour précédente — 2026-08-19* : (🏁 ⭐ **§13 — LA REMISE À NIVEAU DOCUMENTAIRE EST TERMINÉE** :
chantier hors audit ouvert et clos le 2026-08-19, défini par **D-036**. **Les 6 lots sont terminés et
publiés** — `8e08552`, `969e673`, `b91cbfe`, `22d2186`, `eadb61a` + le commit de clôture du lot 5, et
`3af61f2`. **Son critère de fin est ATTEINT** — voir **§13.5**, qui dit aussi ce que « terminé » ne
veut PAS dire.)
Rappel du même jour : (🏁 ⭐ **C-012 EST TERMINÉ — son étape 5 est CLOSE, et
R-042 passe à `TESTÉ`**, avec la réserve **V-12 / N-3 non concluante** conservée. Voir **§10,
fiche C-012**. ⚠️ Cela **lève la dépendance** `C-011 → C-012 → C-015`.)
Rappel du 2026-08-06 : (**session 16 — 🏁 L'ÉTAPE 3 EST TERMINÉE** : vague 2 écrite,
**C-017 → C-030**, voir **§10**, et **la couverture des 91 problèmes est prouvée** — **§12**).
Sessions 13-15 : volets ①, ② et vague 1 du ③. Rappel du 2026-08-05 : volet ① terminé, D-030/031/032
inscrites, I-21 levée, fiches **C-002 / C-003 / C-004** — voir **§6**.

---

## 0. DÉCOUPAGE DE L'ÉTAPE 3

Reprendre 9 inconnues, 6 décisions et 88 problèmes ne tient pas dans une séance. Trois volets :

| Volet | Contenu | Session | Statut |
|---|---|---|---|
| **①** | **Les inconnues et les décisions** — elles conditionnent tout le reste | 13 | ✅ **TERMINÉ** — 9 inconnues → 7 *(dont **0 bloquante**)*, **6 décisions → 0 en attente** |
| **②** | Les chantiers **sans code** : documentation, textes d'information, durées de conservation, commentaires faux | 14 | ✅ **TERMINÉ** — **6 fiches** écrites (C-005 → C-010), voir **§7**. ⚠️ **2 des 6 touchent des fichiers source** : le volet n'était pas aussi « sans code » qu'annoncé |
| **③** | Les chantiers **avec code**, ordonnés par ce qui doit passer **avant** quoi | 15-16 | ✅ **TERMINÉ** — **vague 1** (C-011 → C-016, **§8**) et **vague 2** (C-017 → C-030, **§10**). ⚡ C-002 à C-004 en font aussi partie (**§6**) |

### ⚠️ Les deux contraintes d'ordre déjà FIXÉES — elles ne se négocient plus

Elles s'imposeront au volet ③ et à l'ÉTAPE 5 :

1. **Les 5 tests du barème et du départage (R-041) AVANT la correction du départage** — décision
   **D-025**, validée par Romain le 2026-08-05. *Raison : **D-014 est déjà décidée**, le départage
   **sera** modifié. Écrits après, ces tests graveraient le **nouveau** comportement sans avoir
   jamais vu l'ancien — ils ne prouveraient plus qu'on n'a rien cassé.*
2. **R-042 — séparer le cœur de la saisie du score de son écriture — AVANT** d'y toucher, sinon
   **D-011** (forfait), **D-012** (limite de score), **D-015** (match annulé) ⚡ **et D-030** (le
   gel d'un tournoi suspendu) rouvrent **quatre fois** le même code.

### ⚡ Ce qui est entré au chantier APRÈS la clôture de l'audit

> **Le registre n'est pas figé par la fin de l'ÉTAPE 2.** Une décision fonctionnelle apportée par
> Romain le 2026-08-05 ajoute un **89ᵉ** problème — **R-089** — qui n'a été trouvé par **aucun**
> domaine. C'est la démonstration de **M-05** : *l'audit photographie une application qui bouge*,
> et son **périmètre fonctionnel** bouge aussi.

| Réf | Ce que c'est | Où ça atterrit |
|---|---|---|
| **D-030 / R-089** (P1) | **Tournoi SUSPENDU / ANNULÉ pour force majeure** — deux états au niveau du **tournoi**, un cran au-dessus du match annulé de D-015. Spécification complète en `DECISIONS.md` **D-030** | **Volet ③**, en **2 niveaux** — voir la famille « 🌩️ Le tournoi qui s'arrête » ci-dessous |

### Ce que le volet ① a rendu constructible

| Rendu possible par | Ce qui peut enfin être planifié |
|---|---|
| **D-020** *(durées adoptées)* | **R-030** (P1), R-031, R-033, R-034 — **9 problèmes** cessent d'attendre |
| **D-018** *(textes autorisés)* + **I-16** *(la page RGPD existe déjà)* | **R-028** (P1), R-038 — et le coût baisse : une **section** à ajouter, pas une page à créer |
| **D-019** *(voie « informer »)* | **R-029** (P1) — reste **suspendu** tant que les partenaires sont éteints |
| **D-025** *(lot ① des tests)* | **R-041**, et l'ordre de tout le volet ③ |
| **D-005** *(périmètre fermé)* | Les textes de D-018 sont **livrés**, jamais posés par le chantier |

---

## 1. LES 6 ÉTAPES (cadre fixé par `CLAUDE.md`)

| Étape | Nom | Ce qu'elle produit | Statut |
|---|---|---|---|
| 0 | Mise en place du suivi | `CLAUDE.md` + `docs/industrialisation/` | ✅ TERMINÉE |
| 1 | **Cartographie** | Comprendre le projet, en langage simple. Aucune modification. → `CARTOGRAPHIE.md` | ✅ **TERMINÉE** (volets A, B et C) |
| 2 | **Audit global** | Rapport des 8 domaines, problèmes classés P0/P1/P2/P3. Aucune modification. → `AUDIT.md` + `RISQUES.md` | ✅ **TERMINÉE** — **8 sur 8**, sessions 5 à 12, **88 problèmes** |
| 3 | **Plan priorisé** | Le tableau des chantiers ci-dessous, rempli | ✅ **TERMINÉE** (sessions 13 → 16) — **30 chantiers**, **91 problèmes placés sur les 91 connus alors**. ⚡ **31 chantiers et 93 problèmes depuis le 2026-08-19** *(D-037)* — voir **§12** |
| 4 | **Validation** | Accord explicite de Romain, chantier par chantier | 🚧 **EN COURS** — ✅ **C-011 validé** (2026-08-06) |
| 5 | **Implémentation** | Une modification cohérente à la fois | 🚧 **DÉMARRÉE** — **C-011**, PR #181 |
| 6 | **Commit** | Un commit atomique par chantier validé | ⬜ À faire |

> **Règle** : on ne passe pas à l'étape suivante sans que la précédente soit terminée **et**
> que Romain ait donné son accord quand une validation est requise.

### Découpage de l'ÉTAPE 1

Le projet est trop volumineux pour être cartographié en une fois (plus de 11 000 lignes rien que
pour le serveur). L'étape est donc découpée en **trois volets**, un par session, tous écrits dans
`CARTOGRAPHIE.md` :

| Volet | Contenu | Session | Statut |
|---|---|---|---|
| **A — Le squelette** | Les morceaux de l'application, où ils tournent, comment ils se parlent, comment le code arrive en ligne, qui a le droit de quoi | 2 | ✅ FAIT |
| **B — Les fonctionnalités** | Ce que l'application sait faire : les 14 écrans d'administration, la génération des poules et du planning, la saisie des scores, le classement, la page publique, le parcours d'invitation des clubs | 3 | ✅ FAIT |
| **C — Les données** | Quelles données sont stockées, dans quel onglet, qui peut les voir, combien de temps elles restent — en particulier les données personnelles (clubs, contacts, mineurs) | 4 | ✅ FAIT |

> Le volet C prépare directement le domaine B (RGPD) de l'ÉTAPE 2, sans le remplacer : il **décrit**
> ce qui existe, il ne juge pas.

> ✅ **L'ÉTAPE 1 est terminée.** Elle a produit `CARTOGRAPHIE.md` (3 volets) et **39 points
> d'attention** (A-01→A-14, B-01→B-12, C-01→C-13), qui sont la matière première de l'ÉTAPE 2.

---

## 2. LES 8 DOMAINES D'AUDIT — AVANCEMENT

| Domaine | Nom | Statut | Session |
|---|---|---|---|
| A | Métier / Product Owner | ✅ **FAIT** — 0 P0 · 5 P1 · 7 P2 · 1 P3 | 5 |
| C | Sécurité | ✅ **FAIT** — **1 P0 (TESTÉ)** · 5 P1 · 6 P2 · 2 P3 | 6 |
| B | RGPD / Protection des données | ✅ **FAIT** — 0 P0 · 3 P1 · 9 P2 · 1 P3 · **3 décisions en attente** (D-018/019/020) | 7 |
| D | QA / Tests | ✅ **FAIT** — 0 P0 · 4 P1 · 5 P2 · 1 P3 · **+ M-04** (risque de méthode) | 8 |
| E | UX / UI / Accessibilité | ✅ **FAIT** — 0 P0 · 2 P1 · 7 P2 · 1 P3 · **I-05 levée** | 9 |
| F | Performance | ✅ **FAIT** — 0 P0 · 2 P1 · 7 P2 · 2 P3 · **2 inconnues ouvertes** (I-18, I-19) | 10 |
| G | Architecture / Maintenabilité | ✅ **FAIT** — 0 P0 · 2 P1 · 7 P2 · 1 P3 · **D-028 tranchée le jour même** (on ne découpe pas `Code.gs`) · **1 inconnue** (I-20) | 11 |
| **H** | **Qualité du code** | ✅ **FAIT** — **0 P0 · 0 P1** · 5 P2 · 2 P3 · **aucune décision, aucune inconnue** · **179 comparaisons serveur ↔ navigateur, 0 écart** (répond à **R-044**) · **+ M-06** | 12 |

> 🏁 **L'ÉTAPE 2 EST TERMINÉE** (2026-08-05). Les huit domaines ont parlé, dans l'ordre exact validé
> par **D-010**. Total : **88 problèmes** — 1 P0 (corrigé et testé), 23 P1, 53 P2, 11 P3 — et
> **6 risques de méthode** (M-01 → M-06).
>
> ⚡ **Le registre de suivi en compte 89 depuis le 2026-08-05**, et les deux chiffres sont vrais :
> **88** = ce que l'audit a trouvé *(figé)* · **89** = l'état du registre, qui continue de vivre.
> **R-089** n'a été trouvé par aucun domaine — il a été **apporté par Romain** (**D-030**).

> ✅ **Ordre d'audit VALIDÉ par Romain le 2026-08-04** (décision D-010) : **A → C → B → D → E → F
> → G → H**. Raison : le métier d'abord (priorité n°1 du prompt maître), puis ce qui peut faire du
> mal (sécurité, données personnelles), puis ce qui prouve (tests), puis le confort.
>
> L'alternative — remonter le domaine B pour profiter de la fenêtre où le classeur est encore vide
> de données de tiers — a été **écartée** : *« on fait les choses dans l'ordre pour bien les faire,
> la production attendra »*. La fenêtre reste ouverte tant qu'aucun vrai club n'est invité.

---

## 3. TABLEAU DES CHANTIERS

> Se remplit à l'ÉTAPE 3, à partir de `RISQUES.md`.
> Un chantier = un ensemble de corrections qui doivent être faites **ensemble**.

| ID | Chantier | Priorité | Statut | Dépend de | Validé par Romain | Implémenté | Testé |
|---|---|---|---|---|---|---|---|
| **C-013** | **Un contrôle de syntaxe avant publication** (R-043 moitié a, R-049, R-050) | **P1** | 🏁 **CLÔTURÉ** | — | ✅ **oui** (2026-08-06) | ✅ **PR #182 fusionnée** | 🏁 **TESTÉ** — contrôle prouvé, chaînage observé, publication réussie, site vérifié |
| **C-011** | **Les tests du barème et du départage** (R-041) — *premier chantier de l'ÉTAPE 5* | **P1** | 🏁 **CLÔTURÉ** | — | ✅ **oui** (2026-08-06) | ✅ **PR #181 fusionnée** | 🏁 **TESTÉ** — `R92 — 616/616 OK, 0 FAIL` **chez Google** |
| **C-001** | **Plafonner l'écriture publique des relevés de partenaires** (R-014) — *hors ordre normal, par exception D-016* | **P0** | ✅ **TESTÉ** | — | ✅ oui (D-016) | ✅ commit `c1948fc`, **redéployé** | ✅ **573/573** dans Apps Script + chaîne vérifiée en réel |
| — | *(les autres chantiers se rempliront à l'ÉTAPE 3, quand les 8 audits seront finis)* | — | — | — | — | — | — |

> **Pourquoi ce tableau ne contient-il qu'une ligne, alors que 88 problèmes sont identifiés ?**
> Parce qu'un chantier regroupe des corrections qui doivent être faites **ensemble**, et qu'on ne
> peut pas savoir ce qui va ensemble tant que les 8 domaines n'ont pas parlé. Exemple : R-005
> (borne haute sur un score) touchera peut-être le même code qu'un futur constat du domaine D
> (tests). Les regrouper évitera de modifier deux fois le même fichier.
>
> ✅ **C-001 est une exception assumée**, validée par Romain (**D-016**) : le domaine C a trouvé un
> **P0**, corrigé seul et en avance parce que c'était la seule faiblesse exploitable sans
> connaître aucun secret. Il est aujourd'hui **TESTÉ** et **en service**. Cette exception ne crée
> pas de précédent : tout le reste attend l'ÉTAPE 3.

### Regroupements déjà visibles (à confirmer à l'ÉTAPE 3)

Ce ne sont pas encore des chantiers, mais des **familles** qui se dessinent après deux audits :

| Famille | Problèmes | Pourquoi ils vont ensemble |
|---|---|---|
| **Filet de sécurité sur les gestes destructeurs** | R-015, R-016 | Même cause (protection tenue par la page, pas par le serveur), même correction, mêmes tests |
| **Savoir qui a fait quoi** | R-017, R-023 | Les deux ajoutent une trace ; autant toucher l'`Historique` une seule fois |
| **Ce qui sort de l'application** | R-021, R-018, **R-032** | Le domaine B a parlé : R-021 (liste blanche sur les 4 onglets) referme aussi R-032, et R-018 (jetons permanents) est le pendant technique de R-030 (durées) |
| **Dire aux gens ce qu'on fait de leurs données** | **R-028, R-029, R-038** | Même livrable : trois textes + une page « Vos données ». **Zéro code** pour R-028 et R-038 |
| **Savoir jeter** | **R-030, R-031, R-033, R-034**, R-018 | Une seule décision (D-020) les met tous en ordre de marche ; même écran, même code de suppression, mêmes tests |
| **Cadre écrit, hors code** | **R-036, R-039** | Ni l'un ni l'autre ne se corrige dans le dépôt : ce sont des questions au club et des documents |
| **Le forfait, l'annulation et le classement** | R-001, R-004, R-013, R-012 | Domaine A : même code (classement, états d'un match), même besoin de tests préalables |
| **⚠️ Le filet AVANT les corrections** | **R-041**, R-004, R-001 | Le domaine D a parlé : le départage et le barème n'ont **aucun test**, et **D-014 va les modifier**. Les tests de R-041 sont le **préalable** de ce chantier, pas son complément — écrits après, ils graveraient le nouveau comportement sans avoir jamais vu l'ancien |
| **Le geste du jour J** | **R-042**, R-005, R-013, R-001 | D-011, D-012 et D-015 rouvrent toutes `enregistrerScore`. R-042 (séparer le cœur de l'écriture) doit être fait **une fois, avant**, sinon on touche trois fois au même code |
| **Le chemin vers la production** | **R-043**, R-049, R-050 | Rien ne contrôle ce qui part en ligne, et un document annonce une preuve qui n'existe pas. Même sujet : ce qu'on croit vérifié et qui ne l'est pas |
| **Le filet côté serveur** | R-015, R-016, **R-047** | Trois protections tenues par la **page** et non par le serveur. R-047 (équipes en double) rejoint la famille déjà repérée au domaine C |
| **⚡ Terminer le travail d'affluence** | **R-061**, **R-062**, **R-064** | Le domaine F a parlé : le relais est écrit mais éteint, le cache de repli s'éteint tout seul vers 165 matchs, et sa durée (10 s) est plus courte que le rythme d'appel (15-19 s). **Un seul sujet, une seule séance.** Précédé de **I-18** (5 minutes) et **I-19** (une question à Romain), sans lesquelles on décide à l'aveugle |
| **Faire parler le geste du jour J** | **R-051**, **R-052**, **R-053**, **R-069** | Les trois premiers viennent du domaine E (l'écran ne dit rien), le quatrième du domaine F (l'écriture peut attendre sans fin). **Même fichier, même correction, mêmes essais.** Et R-067 explique *pourquoi* ça compte : l'attente après « Valider » est réelle, mesurée |
| **Alléger ce qui voyage** | **R-063**, **R-065**, **R-066**, R-024 | Champs vides (58 % du poids), outil PDF chargé pour rien (44 % de l'admin), logo surdimensionné (79 % de la page publique). ⚠️ **R-063 exige les tests de R-041/R-042 AVANT** ; **R-066 dépend de D-005** (autre dépôt) |
| **Le verrou et ce qu'on met dedans** | **R-067**, **R-068**, R-070 | Trois fois le même sujet : du travail fait **sous le verrou d'écriture** alors qu'il pourrait être fait dehors — ou pas du tout. ⚠️ **R-068 touche à la sécurité** : à trancher avec R-017, R-018, R-059 |
| **📄 Remettre le projet en face de lui-même** | **R-072**, **R-073**, R-024 *(+ R-080)* | Le domaine G a parlé : la procédure de redéploiement décrit la moitié du geste, la carte du projet décrit une autre application, les bibliothèques n'ont ni version ni origine. **Zéro ligne de code, zéro risque technique, un seul livrable** — et ça referme la porte par laquelle **M-04** est déjà entré. ⚠️ **R-072 d'abord et seul si le temps manque** : c'est le seul problème du chantier qui **se redéclenchera au prochain redéploiement** |
| **Les noms qui se marchent dessus** | **R-078**, R-043 | 12 noms globaux en double dans le navigateur. Aucun ne collisionne aujourd'hui, mais la panne serait **une page blanche**, pas un bouton en panne. Une douzaine de renommages ciblés — **à faire sous la protection des tests de R-043**, jamais à l'aveugle |
| **📝 Ce que le code raconte de faux sur lui-même** | **R-083**, **R-084**, **R-087** *(+ R-072, R-073)* | Le domaine H a parlé : cinq commentaires annoncent l'inverse de ce que fait le code, une colonne du classeur est documentée mais lue par personne, et quinze lignes mortes affirment servir. **Zéro ligne exécutable, zéro risque, un seul livrable** — et c'est exactement le lot documentaire de R-072/R-073, un cran plus bas. ⚠️ **Même avertissement** : chaque phrase réécrite doit être **vérifiée dans le code**, jamais déduite |
| **🔇 Faire parler le geste du jour J** *(élargi)* | **R-051**, **R-052**, **R-053**, **R-069**, **R-086**, **R-085** | Le domaine H apporte les deux pièces qui manquaient : **R-086** chiffre le problème (**29 endroits sur 21 fichiers** montrent l'erreur brute du navigateur) **et porte la correction** — un seul endroit à écrire ; **R-085** en est le pendant côté serveur (une image qu'on jette sans vérifier, et l'application répond « c'est fait »). **Même sujet : l'application dit qu'elle a réussi sans le savoir.** ⚠️ Sous contrainte **D-027** : un message ne doit jamais mentir |
| **🏉 Le Super Challenge** | **R-082**, **R-083** *(sa part SCF)* | Trois lignes de garde côté serveur, et trois commentaires à effacer. Tout est au même endroit et ne touche **que le remplissage d'un formulaire**. ⚠️ **Ce lot change de priorité tout seul** : P2 aujourd'hui, **P1 le jour où le club accueille réellement un Super Challenge** |
| ⚡ **🌩️ Le tournoi qui s'arrête** — ***niveau 1*** | **R-089** *(D-030)*, **R-015**, **R-016**, **R-047**, R-051, R-052 | **L'état SUSPENDU / ANNULÉ, son gel et sa visibilité.** Il rejoint **obligatoirement** la famille « le filet côté serveur » : un gel tenu par la page web **ne gèle rien** — il suffit d'ouvrir la saisie ailleurs. Même cause, même correction, mêmes tests. Le **bandeau public** rejoint « faire parler le geste du jour J », sous contrainte **D-027** *(un message ne ment jamais)*. ⚠️ **Prérequis : le lot ① des tests** (le « pas de classement final si annulé » touche le classement) **et R-042** (le gel verrouille la saisie) |
| ⚡ **🌩️ Le tournoi qui s'arrête** — ***niveau 2*** | **R-089** *(D-030, scénarios de reprise)*, **R-003** *(niveau 3 de D-013)* | **Les propositions de rattrapage** : périodes réduites, deux périodes → une, marges, terrains. ⚠️ **Ces deux-là ne doivent JAMAIS être faits séparément** : D-013 avait écarté son niveau 3 (*« redistribuer un terrain devenu impraticable »*) comme *« le seul niveau qui touche au planificateur, donc le seul réellement risqué »* — or D-030 niveau 2 touche **exactement** le même code. Les séparer, c'est ouvrir `calculerPlanning` deux fois. ✅ **I-21 LEVÉE le 2026-08-05** : la reprise avec adaptation du format et de la durée est **autorisée**, sous deux réserves — ⛔ **temps de jeu maximal** *(aujourd'hui simple affichage, à transformer en contrôle réel)* et ⛔ **aucune phase finale**. ⚡ **Cadre précisé par Romain le même jour** : **6 contraintes / 8 leviers / 5 principes** (`DECISIONS.md` D-030 §9) — le moteur **cherche toutes les marges avant de conclure à l'impossibilité**. → **fiches C-003 et C-004** |
| **⛔️ Ce qui NE doit PAS être groupé** | ~~R-074~~, **R-076**, **R-077**, **R-081**, **R-088** | Des problèmes qui se **ressemblent** (découper, ranger, outiller) et qu'il serait tentant de traiter ensemble. **Ils ne doivent pas l'être** : chacun, fait en bloc, aggrave un problème plus grave que lui — renommer 277 tests fait perdre un test en silence, découper l'admin exige l'outillage que `CLAUDE.md` §10 déconseille. **Progressif et réversible, ou rien.** ✅ **R-074 est sorti de cette liste : il est ARBITRÉ** (**D-028**, 2026-08-05) — on ne découpe pas `Code.gs` tant que le dépôt est manuel. ➕ **R-088 rejoint la liste** (domaine H) : renommer en masse des variables courtes, c'est 42 occasions de casser un appel pour un gain de **confort de lecture**. Méthode **opportuniste** uniquement, la même que R-079 |

### Modèle de fiche de chantier

À recopier pour chaque chantier créé à l'ÉTAPE 3.

```markdown
### C-00X — <titre court>

- **Problème** (en langage simple) :
- **Risques couverts** : R-0XX, R-0XX (voir RISQUES.md)
- **Priorité** : P0 / P1 / P2 / P3
- **Bénéfice** (ce que Romain y gagne concrètement) :
- **Risque de la correction elle-même** (ce qui pourrait casser) :
- **Fichiers concernés** :
- **Dépendances** (ce qui doit être fait avant) :
- **Stratégie de test** (comment on prouve que ça marche et que rien n'est cassé) :
- **Vérifications de non-régression prévues** :
- **Statut** : IDENTIFIÉ / PLANIFIÉ / VALIDÉ / EN COURS / CORRIGÉ / TESTÉ
- **Validation de Romain** : oui / non / date
- **Commit** :
```

---

## 4. RÈGLES DE PRIORISATION

Ordre de priorité imposé par `CLAUDE.md` §11, en cas d'arbitrage :

1. Fonctionnalité métier
2. Fiabilité
3. Sécurité
4. Protection des données
5. Expérience utilisateur
6. Maintenabilité
7. Performance
8. Élégance du code

**Traduction concrète** : si une amélioration technique rend l'organisation d'un tournoi plus
compliquée le jour J, ce n'est pas une amélioration — elle est refusée ou repensée.

---

## 5. CE QUI EST HORS PÉRIMÈTRE (jusqu'à décision contraire)

| Élément | Pourquoi |
|---|---|
| Le dépôt `boutique-r92` (site vitrine) | Autre dépôt, autre cycle. À trancher — voir D-005 dans `DECISIONS.md` |
| La conformité réglementaire FFR | Traitée par `AUDIT-TOURNOI-R92.md`, chantier distinct — voir D-003 |
| Toute réécriture complète de l'application | Interdite par `CLAUDE.md` §2 et §10 |
| Tout changement de technologie | Interdit sans justification explicite (`CLAUDE.md` §10) |

---

## 6. FICHES DE CHANTIER RÉDIGÉES

> **Comment lire les identifiants** : `C-00X` est un **identifiant, pas un rang**. Il est attribué
> au moment où la fiche est écrite, pas selon l'ordre d'exécution. **L'ordre réel se lit dans le
> champ « Dépendances »** de chaque fiche.

> ## ⛔ CE QU'AUCUN CHANTIER NE DOIT TOUCHER
>
> *Liste courte, tenue à jour, à lire avant d'ouvrir n'importe quelle fiche.*
>
> | Ce qui est protégé | Décision | Pourquoi |
> |---|---|---|
> | **Le bouton « Appliquer les valeurs FFR » par catégorie**, la lecture des onglets `RefFFR_*`, l'écran de conformité et ses avertissements | **D-031** | C'est **une aide à la saisie**, pas une décision de l'application : elle pré-remplit, **le responsable garde le dernier mot**. *« On ne touche pas au bouton »* — Romain, 2026-08-05 |
> | **La règle d'équité de la pause échelonnée** *(une équipe reposée n'affronte jamais une équipe qui ne l'est pas)* | **D-030 §9.1**, contrainte 4 | Déjà implémentée par Romain. ⚠️ Tenue par la **forme** du planning, **vérifiée nulle part** — donc cassable en silence |
> | **Le mode de pause classique pur** *(case décochée)* | — | C'est le mode **historique**, celui de tous les tournois passés. Il doit rester **strictement identique** |
> | **Les calculs d'affichage du navigateur** | `RAPPORT-AUDIT.md` §6 | Mesurés à **0,9 ms** : rien à y gagner, tout à y perdre |
> | **Le découpage de `Code.gs`** | **D-028** | 1 fichier → 5 collages à la main, soit le mécanisme même de **M-04** |

**Ordre d'exécution connu à ce jour**, du premier au dernier :

```
SANS CODE, à tout moment et en parallèle :
    C-005 (textes d'information)  ·  C-006 (durées)  ·  C-007 (la carte du projet)
    C-010 moitié ① (le texte du règlement)

AVEC CODE, dans cet ordre :
    C-011 (tests du barème et du départage)
       ↓
    C-012 (séparer le cœur de la saisie du score)
       ↓
    C-015 (les règles du jour J)  ·  C-002 (tournoi suspendu/annulé)   ← adjacents
       ↓
    C-016 (le filet côté serveur)  ·  C-014 (faire parler l'application)
       ↓
    C-003 (les scénarios de reprise)   ← le plus risqué, en dernier

    INDÉPENDANTS, à tout moment :
    C-013 (contrôle avant publication) — le moins cher du plan
    C-004 (repos minimal saisissable) — mais AVANT C-003 et AVANT C-009
    C-008 (commentaires)  ·  C-009 (code mort, APRÈS C-004)  ·  C-010 moitié ②
```

> 💡 **Ce que ce schéma dit, et qui n'était pas évident** : **quatre chantiers ne dépendent de
> rien.** C-005, C-006, C-007 et la moitié ① de C-010 peuvent commencer **dès que Romain les
> valide**, sans attendre une seule ligne de code — et **deux d'entre eux referment des P1**.

---

### C-002 — 🌩️ Le tournoi qui s'arrête · **niveau 1 : l'état et sa visibilité**

> ⚠️ **Esquisse.** Cette fiche est écrite parce que **C-003 en dépend** et ne peut pas être planifié
> dans le vide. Elle sera complétée au **volet ③**, avec les six points ouverts de `DECISIONS.md`
> D-030 §5 tranchés.

- **Problème** (en langage simple) : quand l'orage arrête le tournoi, l'application continue
  d'afficher un programme qui n'aura pas lieu. Les matchs à venir restent saisissables, le match en
  cours n'est pas verrouillé, et rien n'explique quoi que ce soit aux familles.
- **Risques couverts** : **R-089** *(partie 1)* · rejoint **R-015**, **R-016**, **R-047**
  *(le filet côté serveur)* · **R-051**, **R-052** *(faire parler l'application)*
- **Priorité** : **P1**
- **Bénéfice** : le jour où ça arrive, l'organisateur appuie sur un bouton. Tout se fige, la page
  publique l'explique, et **rien ne peut plus être saisi par erreur**.
- **Risque de la correction** : **moyen.** Touche la saisie du score et le calcul du classement
  *(« aucun classement final si annulé »)* — d'où ses deux prérequis.
- **Fichiers concernés** : `backend/Code.gs` *(état, garde-fous, instantané public)* ·
  `backend/Tests.gs` · `frontend/js/admin-*.js` · la page publique · la page de saisie
- **Dépendances** : **lot ① des tests (D-025)** → **R-042**
- **Statut** : **PLANIFIÉ**
- **Validation de Romain** : ✅ **oui** — décision **D-030**, 2026-08-05
- **Commit** : —

---

### C-003 — 🌩️ Le tournoi qui s'arrête · **niveau 2 : les scénarios de reprise**

- **Problème** (en langage simple) :
  > Le tournoi a été suspendu à 11 h 20. Il reste **23 matchs** et **2 h 40** avant que les terrains
  > ferment. **Aujourd'hui, personne ne sait dire ce qui rentre.** L'organisateur décide de tête,
  > sous la pluie, avec deux cents personnes qui attendent une réponse.
  >
  > Ce chantier fait faire ce calcul par la machine : elle **propose** deux ou trois combinaisons
  > chiffrées, l'organisateur **choisit**.

- **Risques couverts** : **R-089** *(partie 2)* · **R-003** — ⚠️ **le niveau 3 de D-013**, celui qui
  avait été écarté *(« rendre un terrain indisponible et laisser l'application redistribuer »)*.
  **Les deux ne doivent jamais être faits séparément** : ils ouvrent le même code.

- **Priorité** : **P1** *(hérité de R-089)* — mais **le dernier de la file d'exécution**.

- **Bénéfice** : une décision prise en **trente secondes sur des chiffres**, au lieu d'un pari.

- **Risque de la correction elle-même** : ⚠️⚠️ **c'est le chantier le plus risqué de tout le plan.**
  `calculerPlanning` *(`backend/Code.gs:6953`, **224 lignes**)* est le cœur qui décide **quel match
  se joue où et quand**. Une régression ici **ne se voit pas** : elle ne plante pas, elle produit un
  planning **plausible et faux**.

> ⚠️ **Cette section a été RÉÉCRITE le 2026-08-05**, après une précision de Romain. La version du
> matin traitait le repos méridien de 60 min comme un **verrou infranchissable** — c'était une
> erreur de cadrage de ma part. **Le cadre qui fait foi est `DECISIONS.md` D-030 §9** ; ce qui suit
> l'applique.

#### 🔒 CONTRAINTES — aucun scénario proposé ne peut les franchir

| # | Contrainte | Origine | État aujourd'hui |
|---|---|---|---|
| ⛔ **1** | Une équipe ne joue **jamais deux rencontres en même temps** | Physique | ✅ Déjà tenu par le planificateur |
| ⛔ **2** | **Le temps de jeu maximal applicable** | **Réglementaire** *(réponse à I-21)* | ⚠️ **Simple AFFICHAGE.** `plafond_joueur_min` est lu de `RefFFR_Temps`, montré dans l'écran de conformité avec la mention « (sécurité) » et injecté dans un prévisionnel — **mais rien dans `calculerPlanning` ne refuse un planning qui le dépasse** → **à transformer en contrôle réel : c'est du travail, pas un branchement** |
| ⛔ **3** | **La cohérence du repos entre adversaires** | Sécurité + équité | Tenue par la **forme** du planning |
| ⛔ **4** | **Une équipe reposée n'affronte jamais une équipe qui ne l'est pas encore** | **Règle déjà implémentée par Romain — elle doit impérativement rester** | ⚠️ **Garantie par CONSTRUCTION, vérifiée nulle part.** Elle vient de l'ordre des blocs : matin *(inter-vagues, tous frais)* → vague 1 en pause pendant que la vague 2 joue **ses matchs internes** → l'inverse → après-midi *(inter-vagues, tous ayant déjeuné)*. **Un levier qui réorganiserait librement les rencontres la casserait EN SILENCE** |
| ⛔ **5** | **Aucune phase finale** | **Réglementaire** *(réponse à I-21)* | À écrire. *(Le sort d'un COUPE_PLATEAU déjà prévu = point ouvert (f) de D-030 §5)* |
| ⛔ **6** | Toute autre contrainte réglementaire explicitement applicable | Ouvert par construction | — |

#### 🔧 LEVIERS — du moins au plus intrusif, et on ne monte que si nécessaire

| Ordre | Levier | Réglage concerné | Touche au jeu ? | Qui décide |
|---|---|---|---|---|
| **1** | Réduire les **battements logistiques** entre matchs | `battement_terrain_min` *(5 min par défaut)* | ❌ Non | Le moteur propose |
| **2** | Réduire ou supprimer des **marges entre les séquences** | ordonnancement | ❌ Non | Le moteur propose |
| **3** | **Réorganiser les rencontres** sur les terrains disponibles | affectation | ❌ Non | Le moteur propose — ⚠️ **en conservant la structure en 4 blocs** *(contrainte 4)* |
| **4** | Modifier le **nombre de périodes** d'un match | `format_mi_temps` | ⚠️ Oui | Le moteur propose, **sous la contrainte 2** |
| **5** | Réduire la **durée des périodes** ou la durée totale | `duree_mi_temps_min` | ⚠️ Oui | Le moteur propose, **sous la contrainte 2** |
| **6** | Ajuster certaines **marges de récupération** | `recup_entre_matchs_min` | ⚠️ Oui — repos d'enfants | Le moteur propose, **sous les contraintes 3 et 4** |
| **7** | Modifier le **repos minimal configuré** de la pause échelonnée | `repos` — *à rendre saisissable, chantier **C-004*** | ⚠️ Oui — sécurité | 🔴 **UNIQUEMENT par décision explicite de l'organisateur.** Le moteur peut **montrer** ce que ça débloquerait ; il ne l'applique **jamais** seul |
| **8** | **Retirer des rencontres** de la reprise | le planning | ⚠️ Oui — équité sportive | 🔴 **Dernier recours**, annoncé comme tel. Les équipes n'auront pas joué le même nombre de matchs — la colonne « J » du classement existe déjà pour le montrer |

#### Les cinq principes *(D-030 §9.3)*

1. **conserver autant que possible les contraintes initiales** ;
2. **utiliser d'abord les leviers les moins intrusifs** ;
3. **n'utiliser un levier plus important que si nécessaire** — et le dire ;
4. **ne jamais franchir une contrainte de sécurité ou réglementaire impérative** ;
5. **quand une contrainte CONFIGURABLE doit changer, demander une décision explicite** — jamais la
   modifier automatiquement.

#### Trois règles de conception qui en découlent

1. ⭐ **Le moteur n'a pas le droit de conclure « impossible » avant d'avoir parcouru les huit
   leviers.** C'est l'exigence centrale de ce chantier, et elle rejoint **D-027** *(un message ne
   ment jamais)* : annoncer *« la reprise est impossible »* sans avoir cherché **serait un message
   qui ment** ;
2. **Le moteur propose, l'organisateur tranche** — identique à **D-013** *(« le jour J,
   l'organisateur en sait plus que l'algorithme »)*. Chaque scénario annonce **quels leviers il a
   utilisés et jusqu'où**, pour qu'on choisisse en connaissance de cause ;
3. **Le choix retenu laisse une trace** : qui a choisi quel scénario, à quelle heure, et **quelles
   valeurs configurables ont été modifiées**. Même exigence que R-017 *(savoir qui a fait quoi)* —
   et elle coûte une ligne si on y pense maintenant.

#### Stratégie de test

- **Cœur pur** : le calcul des scénarios reçoit ses données en paramètre et **ne touche pas au
  classeur**. C'est ce qui rend les 589 vérifications existantes exécutables **hors de Google**, en
  une seconde ;
- un test **par contrainte** : aucun scénario proposé ne dépasse le **temps de jeu maximal** · aucun
  ne contient de **phase finale** · aucun ne fait jouer une équipe **deux fois en même temps** ;
- ⭐ un test **d'équité, qui n'existe pas aujourd'hui** : dans tout scénario, **aucun match n'oppose
  une équipe déjà reposée à une équipe qui ne l'est pas encore**. C'est la contrainte 4 — elle est
  aujourd'hui garantie par la **forme** du planning et **vérifiée nulle part**. Ce test la rend
  **prouvable**, ce qui est le préalable de tout levier de réorganisation ;
- un test : **le repos réellement obtenu est ≥ à la valeur configurée** — quelle qu'elle soit, pas
  seulement 60 ;
- ⭐ un test **d'escalade** : sur un retard qui se rattrape avec le levier 1 seul, **les leviers 2 à
  8 ne sont pas utilisés**. C'est ce qui prouve le principe *« du moins au plus intrusif »* ;
- ⭐ un test **d'épuisement** : le moteur ne conclut *« impossible »* **qu'après** avoir essayé les
  huit leviers — et il **dit lesquels** ;
- un test : le levier 7 *(le repos configuré)* **n'est jamais appliqué sans décision explicite** ;
- un test : **un format inventé ne produit aucun scénario** *(protège la forme de la règle, pas son
  contenu)* ;
- un test : **zéro minute disponible → aucun scénario, et un message clair** — pas une liste vide
  qu'on prendrait pour un bug.

#### ⭐ Vérifications de non-régression — la première conditionne tout le chantier

> **Sans suspension, `calculerPlanning` doit produire EXACTEMENT le même planning qu'avant** —
> comparaison **caractère par caractère** sur un tournoi de référence.
> **Si ce test n'existe pas, ce chantier ne commence pas.** C'est la seule protection réelle contre
> une régression qui ne se voit pas.

Puis, dans l'ordre : les **quatre formats d'après-midi** *(CROISE, CROISE_DIAGONAL, LIBRE,
COUPE_PLATEAU)* · le **Super Challenge** *(samedi poules, dimanche brassage)* · la **pause
méridienne échelonnée** *(les deux vagues, le repos garanti)* · la **génération de l'après-midi**
à partir du classement du matin.

- **Dépendances** *(ordre strict)* :
  1. **lot ① des tests** (R-041, **D-025**) ;
  2. **R-042** ;
  3. **C-002** — sans état SUSPENDU, il n'y a **rien à reprendre** ;
  4. **C-004** — le levier n° 7 suppose que le repos minimal soit **saisissable**. *(C-004 est
     indépendant et peut être fait bien avant.)* ;
  5. ~~**I-21**~~ ✅ **LEVÉE le 2026-08-05**.
- **Statut** : **PLANIFIÉ**
- **Validation de Romain** : ✅ **oui** — décision **D-030** *(+ réponse I-21 et précision du cadre
  de reprise, D-030 §9)*, 2026-08-05
- **Commit** : —

> ⚠️ **Ce que cette fiche ne fait pas** : elle ne décide **pas** des planchers *(battement minimal,
> récupération minimale, repos minimal réglementaire — point ouvert **(g)** de D-030 §5)*. Ce sont
> des **choix de terrain**, à trancher avec Romain à l'ouverture du chantier — pas des constantes à
> choisir en écrivant le code.

---

### C-004 — ⏱️ Rendre **saisissable** le temps de repos minimal de la pause échelonnée

> **Petit chantier, indépendant, et utile même sans aucune suspension.** Il naît de la précision de
> Romain du 2026-08-05 : *« lorsque l'organisateur choisit un fonctionnement avec des pauses
> méridiennes échelonnées, c'est à ce moment-là qu'il doit pouvoir définir le temps de repos minimal
> à respecter. »*

- **Problème** (en langage simple) : le repos minimal entre les deux vagues de la pause de midi est
  **fixé à 60 minutes dans le code**. Aucun écran ne permet de le changer. Or ce n'est pas une
  constante de la nature : c'est **un choix d'organisateur**, qui dépend du terrain, des catégories
  et de la journée.

- ⚠️ **ET IL Y A PIRE — un champ existant est ignoré en silence** *(constaté le 2026-08-05)* :

  | | Comportement réel |
  |---|---|
  | **Pause classique** *(tout le monde s'arrête ensemble)* | ✅ Le champ **« Pause déjeuner — durée (min) »** *(`pause_dejeuner_duree_min`, défaut 60)* **fonctionne** : aucun match n'est placé dans la fenêtre |
  | **Pause échelonnée** *(deux vagues)* | ❌ **Ce champ est IGNORÉ** pour les catégories concernées — le code le dit lui-même *(« sans pause déjeuner globale »)* — et le repos est **forcé à 60 en dur** |

  > 🔴 **Autrement dit** : un organisateur peut écrire *« Pause déjeuner — durée : 45 min »* et voir
  > les catégories en pause échelonnée appliquer **60**, **sans un mot d'avertissement**. **L'écran
  > dit une chose, le moteur en fait une autre** — exactement la famille de défauts du domaine H
  > *(ce que le code raconte de faux sur lui-même)*.

- 🎯 **Décision de conception : un champ DISTINCT, pas la réutilisation de l'existant.** Les deux
  réglages ne désignent pas la même chose :
  - **« Pause déjeuner — durée »** = une **fenêtre** pendant laquelle **personne** ne joue ;
  - **« Temps de repos minimal »** = un **minimum garanti à chaque équipe**, pendant que **l'autre
    vague joue**.

  > Réutiliser le même champ ferait qu'un organisateur réglant 45 min pour une raison d'intendance
  > **raccourcirait en silence le repos des enfants**. C'est précisément le type de couplage
  > invisible que ce projet a déjà payé.

  **L'écran cible** *(formulation de Romain)* :

  ```
  ☑ Pause méridienne échelonnée
      → Temps de repos minimal : [ 60 ] min
  ```

  Le champ **n'apparaît que si la case est cochée**, et l'ancien champ « durée » est **estompé pour
  les catégories concernées**, puisqu'il ne s'y applique pas. *(L'écran porte déjà une bascule de
  libellé selon le mode — la plomberie existe.)*

- **Ce que ça donne concrètement**, dans la page de configuration horaire :

  ```
  ☑ Pause méridienne échelonnée
      → Temps de repos minimal : [ 60 ] min
  ```

  Cette valeur **devient une contrainte du planning**.

- ⛔ **ET UNE TROISIÈME PIÈCE — l'exclusivité des deux modes** *(décision **D-032**, 2026-08-05)* :

  > *« Quand la pause échelonnée est cochée, la pause classique ne s'applique pas, et inversement.
  > Elles ne doivent jamais coexister. »* — Romain

  **Aujourd'hui elles coexistent**, délibérément : la pause échelonnée est un réglage **global**,
  une catégorie y est éligible **à partir de 4 équipes**, et **en dessous le code bascule cette
  catégorie en pause classique** — avec un avertissement écrit tel quel.

  **✅ Comportement retenu** *(arbitré par Romain)* : **la petite catégorie garde une pause, mais la
  sienne.** Elle n'est pas planifiée en deux vagues *(impossible à moins de 4 équipes)*, mais elle
  obtient **une coupure de midi propre, de la durée du repos minimal configuré**. **La pause
  classique globale ne s'applique alors nulle part.**

  > 🏉 **Ce que ça garantit** : aucune coexistence des deux modes, **et aucun enfant sans coupure**.
  >
  > ⚠️ **Ce que ça n'autorise pas** : supprimer le **repli** lui-même. Une catégorie de moins de
  > 4 équipes doit continuer d'être planifiée, et l'avertissement doit continuer d'exister — **son
  > texte change, pas sa présence**.

- **Risques couverts** : **R-090** *(le champ ignoré sans le dire)* · **R-091** *(les deux modes qui
  coexistent)* · préalable du **levier n° 7** de **C-003** · confort d'organisation immédiat, hors
  de toute suspension.
- **Priorité** : **P2** — mais pour une raison qui a changé. Ce n'est plus seulement *« 60 est une
  valeur raisonnable »* : c'est qu'aujourd'hui **un réglage affiché n'a pas l'effet annoncé**. Le
  risque reste faible *(60 est plus protecteur que ce que l'organisateur aurait choisi)*, mais
  **c'est un écran qui ment**. → **P1 dès qu'on veut C-003**, dont il est le préalable.

- ⚡ **Bénéfice / coût — c'est la bonne surprise** : le cœur de calcul **est déjà prêt**.
  `planifierCategorieEchelonnee` **reçoit déjà le repos en paramètre** *(`opts.repos`, avec 60 comme
  valeur par défaut)*, et il existe même déjà un **avertissement** pour le cas dégénéré où le repos
  réel tomberait sous le seuil demandé. **Seul l'appelant passe la valeur en dur.** Il n'y a donc
  **rien à changer dans l'algorithme** — un champ, sa lecture, son passage.

- **Risque de la correction** : **faible**, mais **non nul** : cela touche l'appel du planificateur.
  D'où la vérification de non-régression ci-dessous, qui n'est pas négociable.

- **Fichiers concernés** : `backend/Code.gs` *(le réglage horaire, l'appel de
  `planifierCategorieEchelonnee`)* · `backend/Tests.gs` · l'écran de configuration horaire du
  frontend.

- **Migration douce** — la règle constante de ce projet : **valeur absente ⇒ 60**, exactement le
  comportement actuel. Un tournoi déjà configuré ne bouge pas d'une minute.

- **Stratégie de test** :
  - ⭐ **valeur absente ou vide ⇒ planning identique à aujourd'hui, caractère par caractère** ;
  - une valeur saisie ⇒ le repos réellement obtenu est **≥ à cette valeur** ;
  - une valeur aberrante *(0, négative, texte)* ⇒ **repli prudent sur 60**, jamais un plantage ;
  - l'avertissement du cas dégénéré **fonctionne toujours** avec une valeur autre que 60 ;
  - ⭐ **le nouveau champ et `pause_dejeuner_duree_min` restent INDÉPENDANTS** : changer l'un ne
    déplace jamais l'autre. C'est le test qui protège la décision de conception ci-dessus ;
  - ⭐ **exclusivité (D-032)** : pause échelonnée active ⇒ **aucune catégorie** ne subit la fenêtre
    de pause classique — **y compris celles de moins de 4 équipes** ;
  - ⭐ **aucun enfant sans coupure** : une catégorie de 3 équipes, en mode échelonné, obtient **quand
    même** un trou de midi ≥ au repos configuré ;
  - le **repli reste présent et averti** : une catégorie sous 4 équipes est toujours planifiée, et
    l'avertissement existe toujours *(son texte change)*.

- **Vérifications de non-régression** : la **pause échelonnée** *(les deux vagues, l'équité, le
  repos garanti)* · les catégories **sans** pause échelonnée, qui ne doivent pas être effleurées ·
  ⭐ **le mode classique pur** *(case décochée)*, qui doit rester **strictement identique** — c'est
  le mode historique, et la majorité des tournois passés.

- **Dépendances** : **aucune.** ✅ **Ce chantier peut être fait à tout moment**, y compris avant
  C-002 et C-003.
- **Statut** : **PLANIFIÉ**
- **Validation de Romain** : ✅ **oui** — précision du 2026-08-05
- **Commit** : —

> ✅ **Il n'y a plus de point à trancher.** J'avais ouvert une question — *« faut-il un plancher
> réglementaire sous lequel l'application avertit ? »*. **Romain a tranché autrement, et plus
> simplement** (**D-031**) : *« la réglementation importe au responsable du tournoi, pas à l'app. »*
> **Aucun plancher, aucun avertissement réglementaire, aucune règle écrite dans le code.** Le
> responsable saisit la valeur qu'il doit respecter — l'application l'applique.

---

## 7. VOLET ② — LES CHANTIERS SANS CODE *(session 14, 2026-08-06)*

> ⚠️ **UNE CORRECTION D'ABORD, PARCE QU'ELLE CHANGE LA ROUTE DE DEUX CHANTIERS.**
>
> Le volet ② avait été annoncé comme *« cinq lots qui ne touchent aucune ligne exécutable »*.
> **En les instruisant, c'est faux pour deux d'entre eux** : effacer un commentaire faux et
> supprimer du code mort, **ce sont des fichiers source qu'on ouvre**. Le comportement ne change
> pas — mais **D-006 impose alors branche + PR + validation**, pas un commit direct sur `main`.
>
> **Le volet ② se répartit donc en trois groupes**, et ce n'est pas une nuance administrative :
> c'est ce qui décide de **comment le travail arrive dans le dépôt**.

| Groupe | Ce que ça touche | Comment ça arrive dans le dépôt |
|---|---|---|
| **① Documentation pure** — C-005, C-006, C-007 | Uniquement des `.md` | **Commit direct sur `main`** *(D-006)* |
| **② Commentaires** — C-008 | Des fichiers source, **zéro ligne exécutable** | **Branche + PR** *(D-006)* |
| **③ Code mort** — C-009 | Des fichiers source, **des lignes supprimées** | **Branche + PR + tests** *(D-006)* |
| **⚠️ Mixte** — C-010 | Le texte est de la doc ; **le rendre atteignable est du code** | **Coupé en deux** — voir la fiche |

---

### C-005 — 📣 Les trois textes d'information

- **Problème** (en langage simple) : **personne n'est jamais informé de rien.** Aucune page, aucun
  courriel, aucune ligne du serveur ne dit qui détient les informations des clubs, pourquoi,
  combien de temps, ni comment demander leur retrait. *(Recherche des mots « RGPD »,
  « confidentialité », « données personnelles », « mentions légales », « consentement » dans tout le
  dépôt applicatif : **zéro occurrence**.)*
- **Risques couverts** : **R-028** *(P1)* · **R-038**
- **Priorité** : **P1** — et c'est **le seul P1 du volet ②** dont la correction complète tienne en
  une séance.
- **Bénéfice** : le jour de la première invitation réelle, un contact de club qui demande *« vous
  gardez mon adresse combien de temps ? »* obtient une réponse écrite. Et **on n'a pas à revenir
  vers des gens à qui on a déjà écrit.**
- **Ce qu'il y a à écrire — trois textes courts** :
  1. un **paragraphe en bas du courriel d'invitation** ;
  2. **le même bloc en bas de la page de réponse** du club ;
  3. une **section « Tournoi »** pour la page RGPD **qui existe déjà** sur le site vitrine.
- ✅ **Ce qui a débloqué ce chantier** *(session 13)* : les deux informations qui manquaient sont
  trouvées — **responsable : Génération R92** · **contact : `generationr92@gmail.com`**.
- ⚠️ **La réserve à porter dans les textes** : l'association est déclarée *« déclaration en
  cours »*. **Aujourd'hui, c'est Romain qui porte ces données de fait** *(D-021)*.
- ⚡ **R-038 se referme par une phrase, pas par du code** : l'adresse du contact d'invitation est
  **servie en clair** à qui la demande — c'est **voulu et nécessaire**. Le remède est de **le dire
  au bénévole concerné**, et de **recommander une adresse partagée du club plutôt qu'une adresse
  personnelle**.
- **Risque de la correction** : ⚪ **nul** — aucun fichier de l'application.
- **Fichiers concernés** : un document livrable dans `docs/` · ⚠️ **rien n'est posé** sur le site
  vitrine *(D-005 : périmètre fermé)*.
- **Dépendances** : ✅ **aucune** — **D-018 est tranchée**.
- **Comment on prouve que c'est fait** : les trois textes existent, **chacun nomme le responsable,
  la finalité, la durée** *(de C-006)* **et le moyen de demander un retrait**.
- ⚠️ **Ce chantier ne referme pas R-028 tout seul** : il **produit** les textes. **R-028 ne sera
  clos que le jour où ils sont en ligne** — ce qui appartient à Romain *(D-005)*.
- **Statut** : 🏁 **CLÔTURÉ CÔTÉ TRAVAIL DOCUMENTAIRE** *(validé par Romain le 2026-08-06)* — **livrable écrit** : `docs/textes-information-donnees.md` *(252 lignes)*. **Aucun fichier de l'application touché, rien mis en ligne.** ⚠️ **Ne referme PAS R-028** : un texte que personne ne peut lire n'informe personne — la clôture du problème demande la **mise en ligne**, et la validation du bureau
- **Validation de Romain** : ✅ **oui, le 2026-08-06** *(+ D-018)*
- ✅ **2026-08-06 — les deux points qui pouvaient rendre le texte FAUX sont tranchés** : **point 1** *(le champ « équipes étrangères » attend « nom du club, pays » — aucune demande de nom d'enfant, constat d'origine de R-034 corrigé)* et **point 6** *(**D-033** : les durées sont garanties par un **rappel manuel**)*
- ⏳ **Restent 3 points, tous administratifs — ils retardent la mise en ligne, ils ne remettent rien en cause dans le texte** : validation du **bureau** · les **cinq crochets** · mentionner ou non la situation en cours
- ⚠️ **Point conditionnel** : si l'interrupteur des partenaires est rallumé, **un quatrième texte** devient nécessaire *(D-019, et c'est du code)*
- ⚠️ **Ne referme PAS R-028** — voir §7 du livrable

---

### C-006 — 🗑️ La politique de conservation, écrite là où on la lira

- **Problème** (en langage simple) : **rien ne s'efface jamais tout seul.** Aucune durée, aucune
  purge, aucune date d'expiration nulle part. Ce n'est pas un choix contestable : c'est **un choix
  qui n'avait jamais été fait**.
- **Risques couverts** : **R-030** *(P1)* · **R-031** · **R-033** · **R-034**
- **Priorité** : **P1**
- ✅ **La décision est déjà prise** — **D-020**, les 7 durées adoptées telles quelles. **Ce chantier
  ne redécide rien** : il **écrit**.
- ⚠️ **Pourquoi ce n'est PAS déjà fait, alors que D-020 existe** : les durées vivent aujourd'hui
  dans `DECISIONS.md`, **un document que personne n'ouvre pour organiser un tournoi**. Une règle
  rangée là où on ne la lit pas n'est pas appliquée.
- **Ce qu'il y a à écrire** :
  1. un document de conservation **dans `docs/`**, à l'endroit où on cherche les règles
     d'exploitation ;
  2. les durées **reprises dans les textes de C-005** — c'est la même information, vue par le club ;
  3. ⭐ **une liste des gestes à faire À LA MAIN en attendant l'outillage** — c'est la partie qui
     sert **dès demain**.
- ⚠️ **Ce que ce chantier NE fait PAS, et il faut le dire** :
  - il **n'efface rien** et **ne construit aucun outil** de purge — l'outillage est du **code**, il
    ira au volet ③ ;
  - il ne corrige donc **ni R-031** *(le droit d'effacement partiel : `supprimerClubInvite` est
    refusé tant qu'une équipe figure dans un match)* **ni R-033** *(la réinitialisation conserve les
    contacts FFR, dont le **médecin**)*. Il les met **en ordre de marche** — il ne les referme pas.
  - ⛔ **Garde permanente** *(D-020)* : **toute suppression restera déclenchée par un humain.** Un
    outil qui efface tout seul est le type de code le plus dangereux du projet.
- 🏉 **Le point le plus urgent de tout le chantier, et il ne coûte rien** : **R-034** — un champ
  libre *(« équipes étrangères »)* **invite explicitement à saisir noms, prénoms et dates de
  naissance d'enfants**. C'est le **seul endroit de l'application où un mineur cesse d'être un
  nombre**. D-020 tranche : **effacé après envoi du dossier**. Écrire cette ligne, et l'appliquer à
  la main, est **le meilleur rapport effort / risque évité de tout le plan**.
- **Risque de la correction** : ⚪ **nul**.
- **Dépendances** : ✅ **aucune** — **D-020 est tranchée**. Fournit une entrée à **C-005**.
- **Comment on prouve que c'est fait** : **chaque donnée personnelle listée au volet C de la
  cartographie a une durée écrite**, sans exception — même « conservé ».
- **Statut** : 🏁 **CLÔTURÉ CÔTÉ TRAVAIL DOCUMENTAIRE** *(validé par Romain le 2026-08-06)* — `docs/conservation-donnees.md`. **Aucun fichier de l'application touché, aucune donnée supprimée, aucun outil construit.**
- **Validation de Romain** : ✅ **oui, le 2026-08-06** *(+ D-020, D-033)*
- ⭐ **Ce que la vérification a trouvé, et qui n'était pas connu** : **5 gestes sur 7 sont VÉRIFIÉS** dans le code · **2 restent À CONFIRMER** *(le détail des effectifs, les copies de courriels)* · et surtout : **la réinitialisation N'EFFACE PAS les contacts de la demande fédérale, médecin compris** — la règle décidée et le code divergent
- ⚠️ **Ne referme NI R-030 (part outillage), NI R-031, NI R-033** — ce sont des **comportements du code**. Validé explicitement par Romain : *« sans fermer les problèmes du registre qui dépendent encore d'un changement de comportement »*
- ⛔ **DEUX CONSTATS À CONSERVER POUR LES FUTURS CHANTIERS DE CODE** *(demande expresse de Romain)* :
  1. **la réinitialisation n'efface PAS les contacts de la demande fédérale**, médecin compris — la règle décidée (D-020) et le code **divergent** ;
  2. **`detail_effectifs` et `nb_educateurs_total` ne sont effacés par RIEN** : ni la réinitialisation, ni aucun écran *(l'édition d'une fiche ne touche que 4 colonnes)*, et ils sont **lus** par le calcul des effectifs

---

### C-007 — 📄 Remettre le projet en face de lui-même

- **Problème** (en langage simple) : **la carte du projet décrit une autre application.**
  `docs/architecture.md` documente **21 des 65 actions** du serveur *(68 % d'invisible)* et **4 des
  8 pages** ; **tout le parcours d'invitation des clubs — le travail d'un mois — n'y figure nulle
  part**. `README.md` liste **6 fichiers JS sur 26** et « 5 onglets » là où il y en a jusqu'à **12**.
- **Risques couverts** : **R-073** *(P1)* · **R-072** *(P1 — **reliquat seulement**, voir ci-dessous)*
  · **R-024**
- **Priorité** : **P1**
- ✅ **Bonne nouvelle vérifiée ce jour : la partie dangereuse de R-072 est DÉJÀ CORRIGÉE.**
  `docs/deploiement.md` dit maintenant que le serveur est **deux** fichiers, nomme `Tests.gs`, et
  donne **les deux nombres de contrôle** — **589** *(le bilan attendu)* et **3711** *(la dernière
  ligne du fichier)*. C'était **le mécanisme exact de M-04**, et il est refermé *(D-029, appliquée
  en session 11)*.
  ⚠️ **Le reliquat** : `Tests.gs` n'est toujours cité **ni par `passation.md`, ni par
  `backend/README.md`, ni par `README.md`**. C'est **du confort**, plus un piège.
- **Bénéfice** : quelqu'un d'autre — ou Romain dans six mois — peut comprendre l'application **sans
  lire 8 000 lignes de code**.
- ⚡ **R-024 rejoint ce lot parce que c'est le même geste** : les **4 bibliothèques extérieures**
  *(`pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`, ~750 Ko)* n'ont **ni version, ni origine, ni
  empreinte**. Les héberger localement est un **bon point** ; ne pas savoir **laquelle** on héberge
  fait qu'**on ne peut pas savoir si une faille publiée nous concerne**. Le remède : un tableau —
  nom, version, origine, date. **Zéro code.**
- **Risque de la correction** : ⚪ **nul** — uniquement des `.md`.
- ⚠️ **Le vrai risque de ce chantier n'est pas de casser, c'est de MENTIR** *(leçon **M-06**)* :
  chaque phrase écrite doit être **vérifiée dans le code**, jamais déduite. Un document faux est
  pire qu'un document absent — **c'est exactement comme ça que R-073 est né.**
- **Dépendances** : aucune. ⚠️ **Ce chantier vieillit** *(M-05)* : chaque fonctionnalité livrée
  élargit l'écart. **`CLAUDE.md` §8 bis empêche désormais qu'il se recreuse** ; ce chantier comble
  le retard **déjà accumulé**.
- **Comment on prouve que c'est fait** : on **recompte**. Les 65 actions du serveur sont-elles
  listées ? Les 8 pages ? Les 26 fichiers JS ? Le compte doit **tomber juste**, et la méthode de
  comptage doit être **écrite à côté du chiffre**.

#### 🔁 Recomptage du 2026-08-09 — **tous les chiffres tiennent**, méthode incluse

*(Fait à l'ouverture de l'ÉTAPE 4 pour ce chantier, précisément parce que **M-05** dit que
l'application bouge pendant qu'on l'audite, et **M-06** qu'un chiffre sans méthode est un piège.)*

| Ce qu'on compte | Chiffre | Comment il a été obtenu |
|---|---|---|
| Actions du serveur | **65** | 61 `case '…'` des trois `switch` de `doGet`/`doPost` *(les 6 `case` de tours — `FINALE`, `DEMI_FINALE`… — exclus : ce n'est pas un aiguillage d'action)* **+ 4 traitées par `if`** : `ping`, `getAll`, `getRefFFR`, `mesureSponsors` |
| Actions citées par `docs/architecture.md` | **21** | Recherche du **nom exact** de chacune des 65 dans le fichier → **21 présentes, 44 absentes** = **67,7 % d'invisible** |
| Pages | **8** | `frontend/*.html` |
| Pages citées par `docs/architecture.md` | **4** | `admin`, `saisie`, `tournoi`, `perfs` ✅ · **absentes** : `index`, `dossier-club`, `invitation-club`, `reponse-invitation` — **soit tout le parcours d'invitation des clubs** |
| Fichiers JS | **26** | `frontend/js/*.js` |
| Fichiers JS cités par `README.md` | **6** | Recherche du nom de fichier → **20 absents** |
| Onglets du classeur cités par `README.md` | **5** | `README.md` ligne 34. ⚠️ **Le compte réel est 12**, et il a fallu deux tentatives pour l'établir — voir la correction ci-dessous. **Le « jusqu'à 12 » de la session 11 était JUSTE** |
| Bibliothèques extérieures **(R-024)** | **4**, **~737 Ko** | `frontend/js/vendor/` : `pdf-lib.min.js` (525 Ko), `docxtemplater.min.js` (93 Ko), `pizzip.min.js` (80 Ko), `qrcode.js` (57 Ko). **Aucune version, aucune origine, aucune empreinte** nulle part dans le dépôt |

> ✅ **Le reliquat de R-072 a rétréci depuis l'écriture de la fiche** : `docs/deploiement.md` porte
> désormais les **bons** nombres de contrôle — **616** *(le bilan des tests)* et **3859** *(la
> dernière ligne de `Tests.gs`)* — remis d'aplomb par **C-011**. La preuve que **§8 bis fonctionne**
> quand on l'applique. Reste le confort : `Tests.gs` n'est toujours cité ni par `passation.md`, ni
> par `backend/README.md`, ni par `README.md`.

> ⛔ **CORRECTION DU 2026-08-09 — mon compte des onglets était FAUX, et c'est instructif.**
> J'avais écrit **8**, en cherchant les `getSheetByName('…')` du serveur. **La méthode était
> incomplète** : les **4 onglets de référence FFR** *(`RefFFR_Formes`, `RefFFR_Dates`,
> `RefFFR_Regles`, `RefFFR_Temps`)* sont lus par `lireOngletSimple(classeur, '…')`, sans passer par
> `getSheetByName`. **Le compte réel est 12**, et **la note de la session 11 — « jusqu'à 12 onglets »
> — avait raison** : c'est moi qui l'avais écartée, faute d'avoir su la revérifier.
>
> **Ce qui a rattrapé l'erreur n'est pas une relecture, c'est le contrôle croisé entre documents** :
> `deploiement.md` documentait **déjà** ces 4 onglets. Un document seul se relit sans se contredire ;
> **c'est la confrontation de plusieurs documents qui fait apparaître le trou.**
>
> ⚡ **Et la leçon dépasse le chiffre** : une méthode de comptage écrite peut être **prise en
> défaut** — c'est précisément ce qui vient de se passer. Une méthode non écrite, non. C'est
> l'argument le plus fort en faveur du §7 de `architecture.md`.

> ⚡ **Un constat trouvé pendant le recomptage, qui n'appartient pas à ce chantier.**
> `frontend/README.md` écrit que `pizzip.min.js` + `docxtemplater.min.js` sont conservés alors que
> *« plus rien ne les charge »* — **173 Ko sur les 737**. Ce n'est **pas** de la documentation
> fausse : c'est du **code mort assumé et écrit**. Il relève donc de **C-009**, pas d'ici.
> **Signalé, pas traité.**

#### 🏁 Statut final

- **Validation de Romain** : ✅ **oui, le 2026-08-09**, **périmètre complet** — les 65 actions, les
  8 pages, les 26 fichiers navigateur, les **12 onglets** *(le périmètre validé disait « 8 onglets » :
  le comptage a établi qu'il y en a **12**)*, et les 4 bibliothèques avec nom, version, origine et
  date. Consigne explicite : *« si une version ou une origine ne peut pas être établie
  avec certitude, écris « à confirmer » plutôt que de l'inventer »*.
- **Statut** : 🏁 **LIVRÉ** — **documentation uniquement, aucun fichier applicatif touché, aucun
  changement de comportement, aucun redéploiement Google.**

| Fichier | Ce qui a changé |
|---|---|
| `docs/architecture.md` | **Réécrit.** Les **65 actions** une par une, groupées en 11 familles, chacune avec son **niveau d'accès** ; les **8 pages** ; les **26 fichiers JS** ; les **12 onglets**, séparés entre **8 de travail** et **4 de référence FFR** ; le schéma de ce qui se passe après une écriture ; et **§7 : la méthode de comptage de chaque chiffre** |
| `docs/dependances-externes.md` | **Créé.** Les 4 bibliothèques : taille, licence, date d'entrée, page qui la charge, **empreinte SHA-256**, et ce qui reste « à confirmer » — avec la liste de ce qui a été cherché en vain |
| `README.md` | « 5 onglets » → **12** ; les **26 fichiers JS** listés au lieu de 6 ; les 8 pages ; `Tests.gs` ajouté ; **une affirmation fausse corrigée** *(voir ci-dessous)* |
| `backend/README.md` | **Réécrit.** « un seul fichier » → **deux** ; « 6 onglets » → **7 créés par `setupSheet()`, 12 en service** ; les exceptions d'accès expliquées |
| `docs/structure-google-sheet.md` | « 6 onglets » → **12** ; **la même affirmation fausse sur la mesure de visibilité**, corrigée |
| `docs/guide-utilisateur.md` | « 5 onglets » → **12** |
| `docs/passation.md` | `Tests.gs` ajouté au geste de re-déploiement — **reliquat de R-072 refermé** |

**Preuve que c'est fait** — vérification automatique repassée après écriture :

| Contrôle | Résultat |
|---|---|
| Les 65 actions du code sont-elles citées dans `architecture.md` ? | ✅ **65 / 65** |
| Les 26 fichiers JS sont-ils cités dans `README.md` ? | ✅ **26 / 26** |
| … et dans `architecture.md` ? | ✅ **26 / 26** |
| Les 8 pages sont-elles citées ? | ✅ **8 / 8** |
| Les onglets ? | ✅ **12 / 12** *(compte corrigé — voir ci-dessus)* |
| Les 4 bibliothèques inventoriées ? | ✅ **4 / 4** |
| Les comptes de lignes cités concordent-ils avec `wc -l` ? | ✅ **tous** |
| Les empreintes SHA-256 concordent-elles avec les fichiers ? | ✅ **4 / 4** |

> ⚡ **Ce que le chantier a trouvé EN PLUS, et que l'audit n'avait pas vu.** `README.md` annonçait
> que la mesure de visibilité des partenaires était *« 100 % locale (aucun envoi, aucun cookie) »*.
> **Le code contredit cette phrase** : `sponsors.js` range un identifiant d'appareil dans
> `localStorage` **et envoie** les relevés au serveur (action `mesureSponsors`). Corrigé dans le
> README, avec renvoi à **R-029**. C'est exactement le danger que ce chantier visait : **une carte
> fausse est pire qu'une carte absente**.

> ⚠️ **Ce que ce chantier ne prouve pas.** Que la documentation restera juste. Elle le restera si
> **§8 bis** est appliquée — et C-011 vient d'en donner la démonstration : les nombres de contrôle
> de `deploiement.md` (616 / 3859) avaient été mis à jour **dans le même lot**, sans que personne
> n'ait à y revenir.

---

### C-008 — 📝 Les commentaires qui disent le contraire du code

> ⚠️ **Ce chantier ouvre des fichiers source.** Il ne change **aucune ligne exécutable**, mais
> **D-006 s'applique : branche + PR**, pas de commit direct sur `main`.

- **Problème** (en langage simple) : **six commentaires annoncent l'inverse de ce que fait la ligne
  d'en dessous.** Trois disent que le Super Challenge n'est *« pas encore branché »* — il l'est.
  Et deux commentaires du même fichier **se contredisent** sur l'éligibilité à la pause échelonnée
  *(« effectif pair ≥ 4 » contre « dès 4 équipes »)* — **le code teste seulement `≥ 4`**.
- **Risques couverts** : **R-083** *(6 cas)*
- **Priorité** : **P2**
- **Bénéfice** : le prochain qui lit ce code — Romain, moi, ou quelqu'un d'autre — **ne part pas sur
  une fausse piste**. Un commentaire faux fait perdre plus de temps qu'un commentaire absent.
- **Risque de la correction** : 🟡 **faible mais réel** — on ouvre `Code.gs` et des fichiers du
  navigateur. Le risque n'est pas de changer le comportement *(on ne touche que des commentaires)*,
  c'est la **faute de frappe** qui casse une accolade ou un `*/`.
- **Vérification** : le nombre de lignes doit changer **uniquement** dans les blocs de commentaires
  modifiés. ⚠️ **Chiffre corrigé le 2026-08-11** : la fiche annonçait *« les **589** tests »* — c'est
  **616** depuis **C-011**. *(Et voir ci-dessous : ces tests n'ont finalement PAS servi de preuve.)*
- ⭐ **Ce chantier doit poser une règle en même temps qu'il corrige** : `CLAUDE.md` **§8 bis**
  protège la **documentation** ; **il lui manque son pendant pour les commentaires** — *une session
  qui branche ce qu'une précédente annonçait « pas encore branché » efface la phrase dans le même
  lot.* **Sans cette règle, ce chantier sera à refaire.** → ✅ **FAIT : `CLAUDE.md` §8 ter.**
- **Dépendances** : aucune. ⚠️ **Contradiction de plan relevée le 2026-08-11, et tranchée par
  Romain** : la fiche **C-023** annonçait *« à faire avec la part SCF de C-008 : même endroit, même
  lot »*. **Décision : les 6 cas sont traités ici**, C-023 reste un chantier **distinct** et n'est
  **pas** anticipé — C-023 change du *code*, C-008 du *texte* ; les mélanger irait contre *« un
  commit = un seul sujet »*.
- **Statut** : ✅ **LIVRÉ le 2026-08-11** *(branche `chantier/c-008-commentaires-faux`)* ·
  **Validation de Romain** : ✅ **DONNÉE** *(périmètre complet, les 6 cas)*

---

### C-009 — 🧹 Le code mort qui affirme servir

> ⚠️ **Ce chantier SUPPRIME du code.** Branche + PR + tests, **obligatoirement** *(D-006)*.

- **Problème** (en langage simple) : deux morceaux de code **ne servent à rien**, et **le
  commentaire qui les accompagne affirme le contraire** :
  - **R-084** — une colonne `pause_echelonnee` est **créée dans ton classeur**, ajoutée
    automatiquement aux classeurs en service, munie de sa fonction de lecture — **et rien ne la
    lit**. C'est la **seule fonction morte des 277** du serveur. Deux documents la décrivent comme
    active, et l'un des deux **se contredit lui-même** ;
  - **R-087** — une variable du navigateur est précédée de **six lignes** expliquant qu'elle est
    *« conservée pour la rétrocompatibilité de l'affichage »*. **Rien ne la lit**, et le titre
    qu'elle prétend fournir existe vraiment **ailleurs**.
- **Risques couverts** : **R-084** · **R-087**
- **Priorité** : **P2**
- ⚠️ **La question qu'il faut poser AVANT de supprimer, et elle est métier** : la colonne
  `pause_echelonnee` **par catégorie** est morte aujourd'hui — mais **D-032 vient de rendre le
  sujet vivant**. **Faut-il la supprimer, ou la brancher ?** *(Le réglage est aujourd'hui
  **global** ; une pause échelonnée **par catégorie** est une fonctionnalité différente, que
  personne n'a demandée.)*
  > ⛔ **Ce chantier ne tranche pas cette question tout seul.** `CLAUDE.md` §10 interdit de supprimer
  > du code « qui semble inutile » sans vérifier ses usages — ici l'usage est **potentiel**, pas
  > passé. **À poser à Romain à l'ÉTAPE 4.**
- **Risque de la correction** : 🟡 **faible**, mais c'est le seul chantier du volet ② où une erreur
  **casse quelque chose**. ⚠️ **La colonne existe déjà dans le classeur de Romain** : la retirer du
  code ne la retire pas du classeur.
- **Vérification** : **589 tests** au vert · la pause échelonnée fonctionne à l'identique · aucun
  écran ne perd un titre.
- **Dépendances** : ⚠️ **à traiter APRÈS C-004**, qui touche la même zone *(la pause échelonnée)*.
  Les faire dans l'ordre inverse, c'est modifier deux fois le même code.
- **Statut** : **PLANIFIÉ** · **Validation de Romain** : ⏳ **à donner** — **avec la question
  ci-dessus**

---

### C-010 — 🏉 Écrire le barème et le départage pour les clubs

> ⚠️ **Chantier MIXTE — et c'est sa principale information.**

- **Problème** (en langage simple) : **aucune règle sportive n'est écrite nulle part pour les
  clubs.** Le barème *(victoire 3 / nul 2 / défaite 1)* et l'ordre de départage n'existent que dans
  les **commentaires du code**. Et la ligne « Règlement » du dossier **a été retirée de l'écran
  d'administration** : **il n'existe aujourd'hui aucun moyen de la remplir.**
- **Risques couverts** : **R-012**
- **Priorité** : **P2** — mais ⚠️ **c'est une exigence posée par Romain lui-même dans D-011** :
  *« toutes les équipes doivent être informées de tout point de règlement »*. Et **D-011 (forfait)
  et D-014 (départage) vont MODIFIER ces règles** : elles seront **encore moins connues** des clubs
  qu'aujourd'hui.
- **Les deux moitiés, et elles ne vont pas au même endroit** :

  | Moitié | Ce que c'est | Où |
  |---|---|---|
  | **① Le texte** | Écrire le barème, l'ordre de départage, la règle du forfait *(D-011)* et celle du match annulé *(D-015)*, en français lisible par un éducateur | ✅ **Volet ②** — zéro code |
  | **② Le rendre atteignable** | **Remettre le champ « Règlement » dans l'écran d'administration** pour qu'il puisse être rempli et parvenir aux clubs | ⚠️ **Volet ③** — c'est du code |

- ⚠️ **Conséquence à assumer** : **la moitié ① ne referme pas R-012.** Un texte que personne ne peut
  publier ne prévient personne. Le chantier **prépare** ; il ne clôt pas.
- 🔗 **Dépendance de contenu** : le texte doit refléter les règles **décidées**, donc **D-011** et
  **D-014**. Elles sont tranchées — mais **pas encore écrites dans le code**. Le texte décrira donc
  **la règle voulue**, et devra être **relu au moment où le code l'appliquera**.
- **Risque de la correction** : ⚪ **nul** pour la moitié ①.
- **Statut** : **PLANIFIÉ** *(moitié ①)* · **Validation de Romain** : ⏳ **à donner**

---

## 8. VOLET ③ — LES CHANTIERS AVEC CODE · **vague 1** *(session 15, 2026-08-06)*

> ⚠️ **Le volet ③ est coupé en deux vagues, et il faut dire pourquoi.** Il reste une cinquantaine de
> problèmes à répartir. Les écrire tous en une séance produirait des fiches creuses — or **une fiche
> creuse est pire que pas de fiche** : elle donne l'illusion que le travail est instruit.
>
> **La vague 1 (ci-dessous) contient ce qui doit passer EN PREMIER**, et rien d'autre : les
> chantiers dont dépendent tous les suivants, plus ceux qui rendent l'application tenable **le jour
> du tournoi**. La **vague 2** est listée en **§9**, pour que rien ne se perde.

### Ordre d'exécution de la vague 1

```
C-011 (les tests du barème et du départage)     ← le filet, il passe d'abord
   ↓
C-012 (séparer le cœur de la saisie du score)   ← sinon 4 chantiers rouvrent le même code
   ↓
C-015 (les règles du jour J)  ·  C-002 (tournoi suspendu/annulé)  ← adjacents, même zone
   ↓
C-016 (le filet côté serveur)  ·  C-014 (faire parler l'application)

C-013 (un contrôle avant publication) — indépendant, le moins cher du plan, à tout moment
```

---

### C-011 — 🥅 Le filet : les tests du barème et du départage

> ⭐ **C'est le premier chantier de code de tout l'ouvrage.** Décidé par **D-025**.

- **Problème** (en langage simple) : **le calcul qui décide du vainqueur n'est vérifié par aucun
  test.** Et sur les 589 vérifications existantes, **aucune ne met à l'épreuve le 2ᵉ critère de
  départage (la différence) ni le 3ᵉ (les points marqués)** — le seul endroit qui fabrique des
  statistiques met toujours `diff: 0, bp: 0`.
- **Risques couverts** : **R-041** *(P1)*
- **Priorité** : **P1** — et ⚠️ **il a une date de péremption.** **D-014 va modifier le départage.**
  Écrits après, ces tests graveraient le **nouveau** comportement sans avoir jamais vu l'ancien :
  ils ne prouveraient plus qu'on n'a rien cassé.
- ✅ **Vérifié dans le code ce jour — la promesse de D-025 tient** : les deux fonctions qui décident
  sont **déjà pures et minuscules**.

  | Fonction | Taille | Touche le classeur ? |
  |---|---|---|
  | `enregistrerResultat(s, pour, contre)` | **6 lignes** | ❌ non |
  | `comparerClassement(a, b)` | **5 lignes** | ❌ non |

  > **Conséquence** : **aucune ligne de l'application n'est modifiée par ce chantier.** On ajoute
  > des tests, c'est tout. C'est le meilleur rapport protection / risque du plan entier.

- ⚠️ **Le périmètre exact, et il ne faut pas le surestimer** : `calculerClassement(classeur)`,
  **lui, lit le classeur** — il n'est pas pur. **C-011 protège les RÈGLES** *(le barème, l'ordre de
  départage)*, **pas la chaîne complète** qui va des matchs au tableau affiché. Cette chaîne-là
  relève du lot ② de D-025, différé.
- **Les 5 tests** : victoire / nul / défaite donnent bien 3 / 2 / 1 · la différence et les points
  marqués sont **cumulés correctement** · ⭐ **deux équipes à égalité de points sont départagées par
  la différence** · ⭐ **à égalité de points ET de différence, par les points marqués** · l'ordre est
  **stable** quand tout est égal.
- **Risque de la correction** : ⚪ **nul** — on n'ajoute que des tests.
- **Fichiers concernés** : `backend/Tests.gs` **uniquement**.
- **Dépendances** : ✅ **aucune.**
- **Comment on prouve que c'est fait** : le bilan passe de **589** à **589 + n**, `0 FAIL`, **chez
  Google**. ⚠️ Et **`docs/deploiement.md` doit être mis à jour avec le nouveau nombre** — sinon le
  contrôle à deux nombres devient faux, et on rouvre **M-04** de nos propres mains.
- **Statut** : 🏁 **TESTÉ — CHANTIER DÉFINITIVEMENT CLÔTURÉ** *(2026-08-06)*. PR #181 **fusionnée**. Preuve **chez Google** : `R92 — 616/616 OK, 0 FAIL`
- **Validation de Romain** : ✅ **oui, le 2026-08-06** *(+ D-025)*
- **Commit** : `af31664` sur `chantier/c-011-tests-bareme-departage`

---

### C-012 — 🔧 Séparer le cœur de la saisie du score de son écriture

- **Problème** (en langage simple) : `enregistrerScore` fait **111 lignes** et **mélange deux
  choses** — décider *(le score est-il valide ? le match est-il verrouillé ? faut-il recalculer ?)*
  et **écrire dans le classeur**. Tant que les deux sont mêlés, **on ne peut pas tester les
  décisions** sans un vrai Google Sheet.
- **Risques couverts** : **R-042** *(P1)*
- **Priorité** : **P1**
- ⭐ **Pourquoi il passe tôt, et c'est l'argument principal** : **D-011** *(forfait)*, **D-012**
  *(limite de score)*, **D-015** *(match annulé)* **et D-030** *(le gel d'un tournoi suspendu)*
  rouvrent **toutes** cette fonction. Fait une fois, avant : **un seul chantier**. Fait après :
  **quatre fois le même code**, avec quatre occasions de casser le geste le plus répété de la
  journée.
- **Risque de la correction** : 🟠 **le plus élevé de la vague 1 après C-003.** On déplace du code
  qui tourne **à chaque score saisi**. ⚠️ **Aucun comportement ne doit changer** — c'est un
  déménagement, pas une réécriture.
- **Fichiers concernés** : `backend/Code.gs` *(`enregistrerScore`, ligne ~5538)* · `backend/Tests.gs`
- **Dépendances** : **C-011 d'abord** — on ne déplace pas du code qui décide d'un classement sans
  filet.
- **Stratégie de test** : les **8 tests du lot ④ de D-025** — les 6 garde-fous du geste *(score
  verrouillé, double-clic, score hors bornes, match inconnu, saisie concurrente, recalcul)*.
- **Non-régression** : ⭐ **une saisie de score de bout en bout donne exactement le même résultat
  qu'avant**, y compris la saisie détaillée U14 *(essais / transformations / pénalités / drops)* et
  l'alerte des 5 essais d'écart.
- 📐 **Conception** : ✅ **VALIDÉE le 2026-08-16** — `C-012-SPECIFICATION.md`, PR #186 fusionnée.
  Les 4 décisions ouvertes y sont tranchées *(D-C012-1 à D-C012-4)*. **Découpage retenu : 3 étapes.**
- **Statut** : 🏁 ⭐ **TERMINÉ — 5 étapes sur 5** *(clos le 2026-08-19)* :

  | Étape | Ce qu'elle fait | État |
  |---|---|---|
  | **1** | `litSaisieScore` extrait *(la lecture de ce que le bénévole a envoyé)* · **T-1 à T-5** | ✅ **FUSIONNÉE** — PR **#187** |
  | **2** | `cascadeAVerifier` extrait *(faut-il lire le match suivant ?)* · **T-14** | ✅ **FUSIONNÉE** — PR **#188** |
  | **3** | `deciderEnregistrementScore` — **les 6 garde-fous** · T-6 à T-13, T-15 à T-17 | ✅ **FUSIONNÉE** — PR **#189** |
  | **4** | **Redéploiement chez Google** + `lancerTestsFFR` exécuté là-bas | ✅ **FAIT le 2026-08-18** — `Code.gs` **et** `Tests.gs` collés, **nouvelle version du MÊME déploiement** publiée |
  | **5** | Les **12 vérifications manuelles** du §8, **V-10 obligatoire** | 🏁 ⭐ **CLOSE — 11 sur 12** *(2026-08-19)* : ✅ V-1 à V-11 *(V-11 avec réserve)*, dont ⭐ **V-7, V-8 et V-10** · 🟠 **V-12 NON CONCLUANTE** *(réserve conservée)* |

  Suite actuelle : ⭐ **`R92 — 703/703 OK, 0 FAIL`** *(616 + 33 + 12 + 42)*, **obtenue CHEZ GOOGLE**
  le 2026-08-18, avec la **dernière ligne de `Test.gs` = 4244** comme seconde preuve, et l'adresse
  publique vérifiée *(`ping` OK, `getConfig` OK)*.

  ✅ **Ce que les 703 tests ne prouvaient pas — qu'une saisie de score fonctionne en vrai — est
  désormais établi par les vérifications manuelles.**

  🚧 **Mise à jour du 2026-08-18 — l'étape 5 a été autorisée et partiellement exécutée : 9 sur 12.**

  - ✅ **RÉUSSIES** : **V-1** *(saisie ordinaire)*, **V-2** *(refus d'une revalidation, dans ses deux
    formes)*, **V-3** *(correction avec la clé)*, **V-6** *(journal de saison : une correction
    réécrit LA MÊME ligne)*, **V-9** *(la vérification de clé n'écrit aucune ligne parasite)*,
    **V-11** *(migration douce des 8 colonnes de détail)* ;
  - 🟠 **V-12 NON CONCLUANTE** : validation mesurée à **7,099 s**, au-dessus de l'enveloppe de **7 s**
    du critère de substitution *(D-C012-5)* ; les lectures **contemporaines** sont restées dans leur
    plage habituelle ; **la cause reste INDÉTERMINÉE** et **aucune régression C-012 n'est démontrée**.
    ⚠️ **Aucune mesure homogène d'une validation avant C-012 n'existe ni ne peut plus être obtenue** ;
  - ✅ **V-4 et V-5 RÉUSSIES le 2026-08-18**, après préparation d'une catégorie **U14** dans la copie
    de test *(3 équipes, `forme_jeu = RE — 15x15`, une seule régénération)*. ⚡ **V-4 a révélé un
    défaut ANTÉRIEUR à C-012** — l'écriture des colonnes par **position** alors que la lecture se
    fait par **nom** : **R-093** *(P2, NON CORRIGÉ)*. **Aucune régression C-012** ;
  - ⛔ **NON EXÉCUTÉES : V-7, V-8 et ⭐ V-10.** Les données de test ne contiennent **aucun tableau
    final de Coupe**. ⭐ **V-10 est déclarée obligatoire** : sans elle, l'étape 5 ne peut aboutir ;
  - 🟠 **N-3 reste NON CONCLUANT** — le chemin `match_suivant` n'a jamais été exécuté. **V-12 ne le
    teste pas.**

  🏁 ⭐ **Mise à jour du 2026-08-19 — L'ÉTAPE 5 EST CLOSE, ET LE CHANTIER EST TERMINÉ.**

  - ✅ **V-7 RÉUSSIE** — l'égalité en élimination directe est refusée, message **identique au code
    au caractère près** *(72/72)*, et ⭐ **le refus n'écrit aucune cellule** ;
  - ✅ **V-8 RÉUSSIE, ses deux volets** — le vainqueur arrive **aussitôt** dans le match suivant, et
    la petite finale est **recalculée** *(un perdant s'y déplace de A vers B — annoncé avant le
    geste, constaté après)* ;
  - ✅ ⭐ **V-10 RÉUSSIE, dans ses DEUX branches** : « Annuler » ne modifie **aucune des 4 536
    cellules** ; « Modifier quand même » réinitialise la suite du tableau **exactement comme prédit**
    *(4 matchs, 11 cellules)*, ⭐ **sans déborder sur l'autre moitié du tableau** ;
  - ⭐ **N-5 et N-6 sont ÉCARTÉS** — dont **N-6, « le mauvais vainqueur propagé »**, dernier risque
    encore ⛔ NON VÉRIFIÉ. **La limite assumée par D-C012-1 est couverte** ;
  - ⚠️ **RÉSERVE CONSERVÉE : 🟠 V-12 / N-3 reste NON CONCLUANTE** *(D-C012-5)*.

  ⚡ **Ce qui bloquait V-7/V-8/V-10 n'était pas technique** : `COUPE_PLATEAU` était réputé
  **supprimé** — il n'avait été que **masqué de l'interface** *(`21a4f2b`, **aucun fichier backend
  touché**)*. Il a été réactivé **dans la copie de test uniquement**, sur décision explicite de
  Romain, *sans* redevenir une fonctionnalité de l'application.

  ✅ **Aucune ligne de code, aucun test, aucune configuration de l'application n'ont été touchés par
  l'étape 5**, et **aucun redéploiement.** Les vérifications se sont faites sur une **copie de
  test** ; ✅ **le routage a été rétabli sur la production et vérifié** *(4 tests concordants)*, et
  ✅ **la production vérifiée NON CONTAMINÉE**.

  ⭐ **R-042 est passé à `TESTÉ` le 2026-08-19**, avec la réserve ci-dessus.

---

### C-013 — 🚦 Un contrôle avant publication

> 💡 **Le chantier le moins cher de tout le plan, et probablement le meilleur rapport
> effort / risque.**

- **Problème** (en langage simple) : **rien ne vérifie ce qui part en ligne.** La publication se
  déclenche **à chaque envoi sur `main`** touchant `frontend/`, et le fichier de publication ne
  contient **aucune étape de contrôle** — pas même une vérification de syntaxe. **Une virgule
  oubliée met une page blanche en ligne**, et personne ne l'apprend avant qu'un bénévole appelle.
- **Risques couverts** : **R-043** *(P1, partie « contrôle de syntaxe »)* · **R-049** · **R-050**
- **Priorité** : **P1**
- **Bénéfice** : la faute de frappe est arrêtée **avant** la mise en ligne, pas après.
- **Risque de la correction** : 🟢 **très faible** — on ajoute une étape au fichier de publication.
  ⚠️ **Le seul vrai risque est de trop en demander** : un contrôle trop strict qui refuse de publier
  une correction urgente **le jour du tournoi** serait pire que pas de contrôle. **Il vérifie la
  syntaxe, il ne juge pas le style.**
- **Fichiers concernés** : `.github/workflows/pages.yml` · aucun fichier de l'application.
- **Dépendances** : ✅ **aucune.** Peut être fait **à tout moment**, y compris avant C-011.
- **Comment on prouve que c'est fait** : on introduit **volontairement** une faute de syntaxe dans
  une branche → **la publication doit échouer**. Sans cette démonstration, on ne sait pas si le
  contrôle contrôle quelque chose.
- **Statut** : 🏁 **TESTÉ — CHANTIER DÉFINITIVEMENT CLÔTURÉ** *(2026-08-06)*. PR #182 **fusionnée**. **Contrôle de syntaxe PROUVÉ** · **chaînage `verifier → deploy` OBSERVÉ sur un vrai envoi sur `main`** · **publication réussie** · **site vérifié après publication**
- **Validation de Romain** : ✅ **oui, le 2026-08-06**
- **Preuves** : branche cassée → contrôle **failure** *(#183, fermée)* · branche saine → **30 fichiers vérifiés**, **success**
- ✅ **Statut final** : **CORRIGÉ = oui** · **contrôle de syntaxe = PROUVÉ** · ✅ **chaînage `needs` = OBSERVÉ le 2026-08-06** *(exécution `31090376142` sur `main`, événement `push` : `verifier` fini à 09:44:46, `deploy` démarré à **09:44:57** — il a attendu)*
- ✅ **Bout en bout** : le site réellement en ligne répond HTTP 200 et son JavaScript se lit sans erreur
- ⛔ **Essai supplémentaire refusé** *(déclencher le workflow sur la branche cassée)* : il visait le chemin de publication du site en production. Branche de preuve **supprimée** ; preuve conservée dans la **PR #183** et son journal
- 🏁 **Clôturé le 2026-08-06**, après vérification commune du premier passage dans Actions

---

### C-014 — 🔊 Faire parler l'application le jour J

- **Problème** (en langage simple) : **l'application dit qu'elle a réussi sans le savoir.** Le
  bouton « Rafraîchir » peut **échouer en silence** et laisser croire que les scores affichés sont à
  jour — c'est le plus grave. Une erreur réseau s'affiche en anglais *(« Failed to fetch »)* devant
  un bénévole. Le bouton « Valider » reste **muet pendant 3 à 8 secondes**, alors on reclique. Et
  côté serveur, une image supprimée répond *« c'est fait »* sans avoir vérifié.
- **Risques couverts** : **R-051** *(P1)* · **R-052** *(P1)* · **R-053** · **R-069** · **R-085** ·
  **R-086** · **R-048** *(rattaché en vague 2)*
  > ⚡ **R-048 rejoint ce lot parce que c'est le même écran et le même sujet** : un envoi qui
  > n'aboutit pas **fige le bouton indéfiniment**. Les lectures acceptent un délai d'abandon *(12 s)*
  > ; **les écritures n'en ont aucun.** Sur une 4G qui décroche sans couper, le bénévole reste devant
  > un bouton mort. **Rendre l'application bavarde sans borner l'attente ne servirait à rien.**
- **Priorité** : **P1**
- ⭐ **Ce chantier a déjà sa conception validée — c'est rare, et ça change tout** : **D-027**, dont
  les 4 arbitrages ont été tranchés par Romain. *Une animation ne doit jamais mentir* : **trois
  issues** — ça arrive / c'est arrivé / **ça a échoué**. **CSS pur**, jamais d'image. **Aucun chiffre
  annoncé** *(un délai annoncé devient une promesse — or 4 % des appels dépassent 10 s)*.
- ⚡ **R-086 porte sa propre correction** : **29 endroits sur 21 fichiers** montrent l'erreur brute
  du navigateur. **Un seul endroit à écrire** — une fonction qui traduit — et les 29 se referment.
- 🔗 **Et R-067 explique pourquoi ça compte** : l'attente après « Valider » est **réelle et
  mesurée** — la reconstruction de l'instantané public prend **2,5 à 4,5 s**, **pendant que le
  verrou d'écriture est tenu**. **Un bouton muet pendant quatre secondes est un bouton sur lequel on
  reclique.**
- ⚠️ **Contrainte forte, posée par D-026** : accepter l'attente **interdit le silence**. Ce chantier
  est donc le **préalable** de tout allongement de délai *(vague 2, R-064)*.
- **Risque de la correction** : 🟡 **faible à moyen** — on touche les écrans les plus utilisés
  *(saisie, page publique)*, mais **on ajoute de l'information, on ne change aucun calcul**.
- **Fichiers concernés** : la page de saisie · la page publique · un utilitaire commun *(R-086)* ·
  `backend/Code.gs` *(R-085)*
- **Dépendances** : aucune techniquement. **À faire après C-012** si les deux touchent la saisie,
  pour ne pas la rouvrir deux fois.
- **Non-régression** : la saisie ne doit **rien perdre** de ses garde-fous existants *(double-clic
  bloqué, saisie en cours jamais écrasée, mot de passe redemandé sur un score validé)*.
- **Statut** : **PLANIFIÉ** · **Validation** : ✅ **D-027** *(conception)* · ⏳ **le lot reste à
  valider**

---

### C-015 — 🏉 Les règles du jour J : forfait, annulation, planning, départage, score

- **Problème** (en langage simple) : **l'application est excellente avant le coup d'envoi et rigide
  après.** Une équipe ne vient pas : rien ne permet de l'enregistrer. L'orage annule un match :
  rien. Un match doit être décalé : impossible dès qu'un score existe. Deux équipes sont à égalité
  parfaite : elles sont classées **dans l'ordre du tableur**. Un score de 150 au lieu de 15 est
  accepté **sans un mot**.
- **Risques couverts** : **R-001** *(P1)* · **R-003** *(P1)* · **R-004** *(P1)* · **R-005** *(P1)* ·
  **R-013** · ⚡ **R-092** *(priorité **à confirmer** — rattaché ici le 2026-08-19 par **D-037**)*
- **Priorité** : **P1** — **quatre P1 dans un seul chantier**, et ce sont **les quatre du fil rouge
  métier** : ils apparaissent **tous le jour J**, quand la réalité s'écarte du plan.
- ✅ **Toutes les règles sont DÉJÀ décidées** — **D-011** *(forfait : absent 0 point, présent gagne,
  aucun score attribué, double mise en garde)* · **D-012** *(2 chiffres maximum + confirmation)* ·
  **D-013** *(déplacer un match, décaler la journée — le niveau 3 est écarté et rejoint C-003)* ·
  **D-014** *(confrontation directe puis ordre alphabétique, ajoutés **à la suite** des trois
  critères existants)* · **D-015** *(match annulé : même mécanisme, libellé distinct)*.
  **Il ne reste qu'à les écrire.**
- ⚠️ **Une réserve permanente** : **I-10** *(la FFR encadre-t-elle le sort d'un match non joué ?)*
  **reste ouverte**, et une règle fédérale **primerait sur D-011 et D-015**. Ce n'est pas bloquant
  *(D-015 est validée « par défaut »)*, mais **le texte de C-010 devra être relu** si la réponse
  arrive.
- **Risque de la correction** : 🟠 **élevé** — on modifie **le calcul du classement** et **la saisie
  du score**. C'est précisément pourquoi **C-011 et C-012 passent avant**.
- **Dépendances** *(strictes)* : **C-011** → **C-012** → C-015.
  🔗 **À traiter en voisinage immédiat de C-002** *(tournoi suspendu / annulé)* : même zone, mêmes
  états de match, mêmes tests.
- **Non-régression** : le classement d'un tournoi **sans** forfait ni annulation doit être
  **identique au caractère près** · les 4 formats d'après-midi · le Super Challenge.
- **Statut** : **PLANIFIÉ** · **Validation** : ✅ **D-011 → D-015** *(les règles)* · ⏳ **le lot reste
  à valider**

> ⚡ **R-092 REJOINT CE CHANTIER** *(**D-037**, 2026-08-19)* — **le détail du score n'est effacé par
> aucun des chemins d'INVALIDATION d'un résultat.** Quand une catégorie joue au tir au but, le
> résultat est rangé dans **8 compteurs** *(essais, transformations, pénalités, drops)*. Le score,
> lui, est effacé quand un résultat est invalidé — **les compteurs, non**. L'écran de saisie rouvre
> alors la carte **pré-remplie avec les chiffres du match précédent**, qui n'existe plus.
>
> ⚠️ **Le périmètre exact, et il est plus étroit que la formulation d'origine** *(vérifié le
> 2026-08-19)* : le défaut est **INTRA-TOURNOI**. 🟢 **La réinitialisation générale du tournoi,
> elle, EFFACE bien les 8 compteurs** — `viderDonnees` vide toute la largeur de l'onglet. Dire
> *« le détail n'est effacé nulle part »* serait donc **faux aujourd'hui**.
>
> 🎯 **Pourquoi ici, et pas ailleurs** : C-015 construit **l'annulation** *(D-015)*, le **forfait**
> *(D-011)* et la **correction de score** *(D-012)* — c'est-à-dire **exactement les trois gestes qui
> invalident un résultat**. R-092 est le trou dans ces gestes. ⚠️ **Et sans lui, C-015 créerait un
> chemin d'invalidation de plus qui reproduirait le défaut.**
>
> **Exigence portée par la décision** *(mot pour mot)* : *« toute invalidation d'un résultat efface
> également les données détaillées devenues périmées »*. Les trois chemins connus au 2026-08-19 :
> une correction repassée en **mode simple** *(`enregistrerScore` — pas de branche « sinon »)*, la
> **réinitialisation en cascade** d'un bracket *(`invaliderMatchAval`)*, et la remise à zéro de la
> **petite finale** *(`majPetiteFinale`)*.
>
> ⚠️ **Sa priorité reste « À CONFIRMER »**, et ce n'est plus bloquant : rattaché ici, R-092 suit le
> calendrier de C-015, qui est **P1**. Détail de ce qui reste à vérifier : `RISQUES.md`.

> 🛡️ **RÈGLE DE PROTECTION PROVISOIRE — à respecter par ce chantier** *(**D-037**, 2026-08-19)*
>
> **Aucune colonne nouvelle utilisée par un mécanisme d'écriture positionnelle ne doit être insérée
> AU MILIEU de la structure existante. Si `Matchs` a besoin d'une colonne, elle s'ajoute À LA FIN de
> `ENTETES.Matchs`.**
>
> **Pourquoi** : `assurerColonnesMatchs` ajoute les colonnes manquantes **à droite**. Une colonne
> insérée au milieu de la constante ferait donc diverger l'ordre du **code** et celui du
> **classeur** — et **toute écriture par rang partirait d'un cran à côté, en silence**. C'est
> **R-093**, et une colonne `forfait` posée « à côté des scores » **par souci de lisibilité** serait
> exactement le geste qui le déclenche.
>
> 🟢 **Cette règle suffit à C-015, et elle ne coûte rien** : l'analyse du 2026-08-19 a établi que
> **trois de ses cinq fonctionnalités ne persistent aucune donnée nouvelle** *(plafond de score,
> départage, déplacement de match)*, et que **le forfait et l'annulation peuvent se passer d'une
> colonne** — l'état peut tenir dans `statut`, ou dans une colonne ajoutée en fin. **Aucune décision
> D-011 → D-015 n'impose de colonne.**
>
> ⛔ **Elle ne referme PAS R-093** : elle protège **ce chantier**, par la vigilance. Le problème
> structurel appartient à **C-031**.

---

### C-016 — 🔒 Le filet côté serveur

- **Problème** (en langage simple) : **les trois gestes les plus destructeurs de l'application sont
  retenus par la page web, pas par le serveur.** Effacer tous les scores, tout réinitialiser,
  créer des équipes en double : les garde-fous vivent **dans le navigateur**, donc ils sont
  **contournables**. Toutes les autres protections du projet — le gel des réponses à J-16, le refus
  de réorganiser les poules — sont, elles, tenues par le serveur.
- **Risques couverts** : **R-015** *(P1)* · **R-016** *(P1)* · **R-047**
- **Priorité** : **P1**
- 🏉 **L'image qui dit tout** : le stade a une salle de contrôle. La porte est fermée à clé partout
  — **sauf sur les trois boutons qui peuvent effacer la journée.**
- **Risque de la correction** : 🟡 **moyen** — on **ajoute** des refus côté serveur. ⚠️ **Le vrai
  danger est de refuser trop** : un serveur qui bloque une réinitialisation légitime le jour J
  serait pire que le problème. **Les protections doivent reproduire exactement ce que la page fait
  déjà**, pas inventer de nouvelles règles.
- **Fichiers concernés** : `backend/Code.gs` · `backend/Tests.gs`
- **Dépendances** : aucune. 🔗 **C-002 rejoint ce chantier** : l'état SUSPENDU / ANNULÉ **doit** être
  tenu par le serveur — un gel tenu par le navigateur **ne gèle rien**.
- **Stratégie de test** : un test **par refus**, appelé **sans passer par la page** — c'est le seul
  moyen de prouver que la protection est bien côté serveur.
- **Statut** : **PLANIFIÉ** · **Validation** : ⏳ **à donner**

---

## 9. VOLET ③ — **vague 2** : la liste de départ *(historique)*

> ✅ **Ces familles ONT MAINTENANT LEUR FICHE** — voir **§10** *(C-017 → C-030)*. Ce tableau est
> conservé parce qu'il montre **le regroupement de départ**, avant instruction.

| Famille | Problèmes | Pourquoi elle attend |
|---|---|---|
| ⚡ **Terminer le travail d'affluence** | R-061, R-062, **R-064** | **Précédée de C-014** *(D-026 : accepter l'attente interdit le silence)*. R-064 est **un chiffre à changer**, et c'est le levier le plus puissant |
| **Alléger ce qui voyage** | R-063, R-065, R-066 | ⚠️ **R-063 exige C-011 et C-012 AVANT** *(un champ absent arrive en `undefined`, pas `""`)* |
| **Le verrou et ce qu'on met dedans** | R-067, R-068, R-070 | ⚠️ **R-068 touche la sécurité** — à trancher avec R-017, R-018, R-059 |
| **Savoir qui a fait quoi** | R-017, R-023 | Les deux ajoutent une trace : autant toucher l'`Historique` une seule fois |
| **Ce qui sort de l'application** | R-018, R-021, R-032 | Liste blanche + jetons permanents ; le pendant technique de C-006 |
| **L'interface sur le terrain** | R-054 → R-059 | Cibles trop petites, contrastes, zone invisible, touche « Entrée » |
| **Les noms qui se marchent dessus** | R-078 | ⚠️ **Sous la protection des tests de R-043**, jamais à l'aveugle |
| **Le Super Challenge** | R-082 | **P2 aujourd'hui, P1 le jour où le club en accueille un** |
| **Les miroirs serveur ↔ navigateur** | R-044 | Requalifié : **dette à surveiller**. La méthode qui l'a prouvé tient en une minute |
| **Le reste** | R-002, R-006 → R-011, R-019 *(= D-017)*, R-020, R-022, R-025 → R-027, R-035 → R-037, R-039, R-040, R-045, R-046, R-048, R-071, R-074 → R-077, R-079 → R-081, R-088 | À répartir |
| ⛔ **Ce qui ne doit PAS être groupé** | R-076, R-077, R-081, R-088 | Chacun, fait en bloc, aggrave un problème plus grave que lui |

---

## 10. VOLET ③ — **vague 2** : les chantiers restants *(session 16, 2026-08-06)*

> 📏 **Ces fiches sont volontairement plus courtes que celles de la vague 1**, et c'est un choix, pas
> un relâchement : ce sont des **P2 et des P3**. Écrire trois pages pour un problème de confort
> serait de la sur-instrumentation — et ferait perdre de vue les quatre P1 qui, eux, méritent le
> détail. **Chaque fiche garde ce qui décide** : ce que ça referme, ce que ça risque, ce qui doit
> passer avant, et comment on prouve que c'est fait.

---

### C-017 — ⚡ Terminer le travail d'affluence

- **Problème** : le travail de performance a été fait **puis arrêté juste avant la fin**. Les
  cadences n'ont **jamais été accordées entre elles** *(le cache dure 10 s, l'intervalle d'appel
  15-19 s, la capacité ~310 écrans actifs)*, le **relais est écrit des deux côtés et n'a jamais été
  allumé**, et le cache de repli **refuse de s'enregistrer au-delà de 95 000 octets** — soit
  **~165 matchs** — sans que rien ne le dise.
- **Risques couverts** : **R-064** *(P1)* · **R-061** *(P1)* · **R-062** · **R-071**
- ⭐ **R-064 est le meilleur levier de tout le plan** : **un chiffre à changer** *(15 s → 30 s)*
  **double la capacité**, gratuitement.
- **Risque** : 🟡 moyen — ⚠️ **allonger le délai sans prévenir transforme une attente voulue en
  panne apparente**, et les gens rechargent. **D-026 l'a tranché** : accepter l'attente **interdit
  le silence**.
- **Dépendances** : ⛔ **C-014 EN PREMIER**, sans exception. Puis **I-19** *(observation le jour J)*
  pour décider s'il faut allumer le relais.
- **R-071 ne demande aucun code** : le plafond anti-abus arrêterait le compteur de partenaires avant
  la fin d'une grosse journée. **C'est voulu — il faut juste l'écrire**, pour ne pas lire une chute
  de fréquentation là où il n'y a qu'un plafond.
- **Preuve** : on **recompte** la capacité après le changement, dans le journal « Exécutions ».

---

### C-018 — 🪶 Alléger ce qui voyage

- **Problème** : chaque spectateur télécharge, **toutes les 15 secondes et toute la journée**, des
  choses qui ne servent à rien. **58 % du poids des matchs = des cases vides.** Le **logo pèse 79 %
  de la page publique** *(229 Ko, chargé en 700×558 pour être affiché en 60×48)*. L'administration
  télécharge **207 Ko d'outil PDF avant d'afficher quoi que ce soit**. Et **183 Ko sont publiés sur
  Internet sans que rien ne les charge**.
- **Risques couverts** : **R-066** · **R-065** · **R-063** · **R-080**
- **Risque** : 🟡 variable selon la pièce. **R-066 (le logo) est presque gratuit** ; **R-063 est le
  plus délicat** — ⚠️ **exige C-011 et C-012 AVANT** : un champ absent arrive en `undefined` et non
  en `""`, or le navigateur compare cette valeur à de nombreux endroits.
- **Dépendances** : R-066 ⚠️ **dépend de D-005** *(le logo est servi par l'autre dépôt)* · R-063
  après C-011/C-012.
- **Preuve** : le poids transféré, **remesuré** — pas estimé.

---

### C-019 — 🔐 Le verrou et ce qu'on met dedans

- **Problème** : trois fois le même sujet — **du travail lourd fait pendant que le verrou d'écriture
  est tenu**, alors qu'il pourrait être fait dehors, ou pas du tout. La reconstruction de
  l'instantané public *(2,5-4,5 s)* tourne **sous le verrou**. Vérifier un mot de passe passe par
  **le chemin le plus coûteux du serveur** *(une fausse écriture de score)*. Et **un envoi groupé
  d'invitations bloque tout le reste** pendant sa durée.
- **Risques couverts** : **R-067** · **R-068** · **R-070**
- **Risque** : 🟠 **élevé** — on touche à la sérialisation des écritures, c'est-à-dire **à ce qui
  empêche deux marqueurs de s'écraser**. ⚠️ **R-068 touche la sécurité** *(le chemin de
  vérification d'une clé)* : à trancher **avec** R-017, R-018 et R-059, jamais isolément.
- **Dépendances** : après **C-016** *(le filet côté serveur)*, même zone.
- **Preuve** : les **écritures simultanées restent sérialisées** — un test qui le prouve, pas une
  relecture.

---

### C-020 — 🕵️ Savoir qui a fait quoi

- **Problème** : **il n'y a pas de personnes, seulement deux mots de passe partagés.** On ne peut
  retirer l'accès à personne, on ne sait **jamais qui a saisi un score**, et une contestation de
  résultat est **inarbitrable**. Personne ne sait non plus **qui a consulté le carnet d'adresses**,
  qui se lit en une seule requête, jetons compris. Et le bénévole doit **retaper le mot de passe à
  chaque ouverture d'onglet**.
- **Risques couverts** : **R-017** *(P1)* · **R-023** · **R-059**
- 🏉 **C'est le fil rouge n° 1 de la sécurité** : **sept des quatorze problèmes du domaine C en
  découlent.**
- **Risque** : 🟠 **élevé, et c'est le plus structurant du plan.** Introduire des personnes change
  la façon dont **tout le monde se connecte le jour J**. ⚠️ **Une amélioration technique qui rend
  l'organisation plus compliquée n'est pas une amélioration** *(`CLAUDE.md` §11)* — il y a un vrai
  risque de dégrader l'usage terrain.
- **Dépendances** : aucune techniquement. ⚠️ **Mais c'est le chantier qui appelle le plus une
  décision de Romain AVANT d'être conçu** : jusqu'où va-t-on ? *(une trace nominative ? de vrais
  comptes ? un simple prénom saisi ?)*
- **Preuve** : l'`Historique` porte l'auteur de chaque score.

---

### C-021 — 🚪 Fermer ce qui sort

- **Problème** : **quatre onglets sortent en entier, sans clé et sans liste blanche.** Rien de
  personnel aujourd'hui — mais **une colonne ajoutée demain serait publique sans que personne ne
  l'ait décidé**. Les **liens des clubs sont des passe-partout permanents** : jamais expirés,
  transportés dans l'adresse de la page, transférables par simple renvoi de courriel. Et le
  **contenu des courriels est fabriqué par le navigateur** puis expédié tel quel sous l'identité
  Gmail du propriétaire.
- **Risques couverts** : **R-021** · **R-018** *(P1)* · **R-032** · **R-020**
- ⭐ **Le principe qui referme R-021 et R-032 d'un coup** : une **liste blanche** — on décide **ce
  qui sort**, au lieu de tout laisser sortir et de retirer au cas par cas. *(Le projet a déjà ce
  réflexe pour la configuration publique : il suffit de l'étendre.)*
- **Risque** : 🟡 moyen. ⚠️ **Une liste blanche trop serrée casse la page publique en silence** :
  un champ oublié disparaît de l'affichage **sans erreur**. Ce piège est **déjà connu du projet**.
- **Dépendances** : **R-018 dépend de D-020** *(les durées)* — un jeton sans expiration est le
  pendant technique de « rien ne s'efface ».
- **Preuve** : ajouter une colonne de test dans le classeur → **elle ne doit PAS apparaître** dans
  la réponse publique.

---

### C-022 — 📱 L'interface sur le terrain

- **Problème** : les bons réflexes existent **déjà** dans ce projet — 44 px de cible, contrastes
  excellents, confirmations qui nomment ce qu'elles détruisent. **Mais ils sont sur les écrans
  récents.** Les plus anciens et les plus utilisés sont restés en arrière : bouton « Valider »
  **85 × 35 px**, champ de score **72 × 36 px**, l'information la plus utile de la page publique à
  **2,81 de contraste** *(4,5 exigé)*, une zone de dépôt d'image **littéralement invisible**
  *(blanc sur blanc, contraste 1,00)*, **rien n'est annoncé aux lecteurs d'écran**, et la touche
  **« Entrée » ne valide rien**.
- **Risques couverts** : **R-054** · **R-055** · **R-056** · **R-057** · **R-058** · **R-060**
- 💡 **Il y a peu à inventer, beaucoup à propager.**
- **Risque** : 🟢 **faible** — ce sont des tailles, des couleurs et des attributs. ⚠️ Sauf **R-058**
  *(la touche Entrée)*, qui introduit un **formulaire** là où il n'y en avait pas : un
  comportement nouveau, à tester.
- ⚠️ **La limite à garder en tête** : tout a été mesuré **dans un navigateur d'ordinateur simulant
  un téléphone**. **Personne n'a jamais saisi un score dehors.** **Trente minutes d'essai réel avec
  deux ou trois bénévoles vaudraient mieux que tout ce chantier.**
- **Preuve** : on **remesure** — contrastes et tailles de cible, avec la méthode écrite à côté.

---

### C-023 — 🏉 Le Super Challenge

- **Problème** : **le seul miroir en désaccord de toute l'application.** Le format sportif de la
  demande d'autorisation pour l'U14 en Super Challenge est calculé **deux fois**, et les deux
  copies **ne disent pas la même chose** — l'écran annonce une durée de match qui ne sera pas jouée.
  Par ailleurs, la **phase 3 est incomplète** et le code **l'avertit lui-même**.
- **Risques couverts** : **R-082** · **R-009**
- ⚠️ **Ce lot change de priorité tout seul** : **P2 aujourd'hui, P1 le jour où le club accueille
  réellement un Super Challenge de France.** Même logique de déclencheur que D-022.
- **Risque** : 🟢 **faible** — trois lignes de garde côté serveur, et ça ne touche **que le
  remplissage d'un formulaire**.
- **Dépendances** : à faire **avec la part SCF de C-008** *(les trois commentaires à effacer)* :
  même endroit, même lot.

---

### C-024 — 🪞 Le miroir qui se vérifie tout seul

- **Problème** : **29 règles métier sont écrites deux fois** — une pour Google, une pour le
  navigateur — et **rien ne vérifie qu'elles disent la même chose**. Le classement affiché sur la
  page publique est **recalculé par le navigateur**, sans redemander au serveur : si les deux
  copies divergeaient, **deux personnes pourraient voir deux classements différents du même
  tournoi**.
- **Risques couverts** : **R-044** *(P1)*
- ✅ **Ce chantier part d'une bonne nouvelle** : **elles sont d'accord aujourd'hui** —
  **179 comparaisons exécutées, 0 écart**, barème et départage **identiques au caractère près**
  *(session 12)*. R-044 est passé de *« défaut possible »* à **« dette à surveiller »**.
- ⭐ **Ce qu'il faut faire n'est donc PAS de fusionner les deux copies** *(ce serait un chantier
  d'architecture disproportionné, et `CLAUDE.md` §10 l'interdit sans justification forte)* — **c'est
  de rendre la comparaison automatique.** *La méthode qui l'a prouvé une fois tient en une minute :
  il s'agit de la rejouer à chaque fois.*
- **Risque** : ⚪ **nul** — on ajoute une vérification, on ne touche à aucune règle.
- **Dépendances** : idéalement après **C-013** *(qui installe l'endroit où faire tourner un
  contrôle automatique)*.

---

### C-025 — 🧱 Les rigidités de génération

- **Problème** : cinq petits blocages, tous de la même famille — **l'application refuse, mais ne dit
  pas comment s'en sortir**. **Un seul match du matin non saisi bloque l'après-midi de TOUTES les
  catégories** *(et le message ne dit pas lesquels manquent)*. Une catégorie à 1 ou 2 équipes
  **bloque tout le tournoi**, sans indiquer le remède. Forcer le nombre de poules **peut produire
  des poules de 2**, ce que la règle des 3 équipes vise justement à interdire. Une date vide
  **désactive silencieusement** le gel des réponses. Et les deux interrupteurs de publication sont
  indépendants **sans que les libellés le disent**.
- **Risques couverts** : **R-002** *(P1)* · **R-006** · **R-007** · **R-008** · **R-010**
- 💡 **Le fil commun** : ce ne sont pas des bugs, ce sont des **refus muets**. Le remède est presque
  toujours **une phrase**, pas un algorithme.
- **Risque** : 🟡 faible à moyen. ⚠️ **R-002 est le seul à toucher la génération** : il faut que le
  contrôle regarde **la catégorie** et non le tournoi entier.
- **Preuve** : chaque message de refus **nomme ce qui manque et donne le remède**.

---

### C-026 — 🕶️ Les expositions inutiles

- **Problème** : quatre points où l'application **s'expose sans y gagner quoi que ce soit**.
  `admin.html` et `saisie.html` sont **publics et indexables**, alors que les trois pages à jeton
  portent bien « ne pas indexer ». Toute la confidentialité **tient au réglage de partage du
  classeur**, qu'aucun code ne protège. Les **polices d'écriture sont chargées depuis les serveurs
  de Google** sur 7 pages — l'adresse réseau de chaque visiteur y est transmise, sans que rien ne le
  dise. Et il n'existe **aucune politique de sécurité du contenu**.
- **Risques couverts** : **R-022** · **R-025** · **R-037** · **R-026** *(P3)* · **R-027** *(P3)*
- **Risque** : 🟢 **faible** — ⚠️ sauf la politique de sécurité du contenu (**R-026**), qui **casse
  silencieusement une page** si elle est trop stricte. **À faire en dernier, et en observant.**
- 💡 **R-037 a un bénéfice double** : héberger les polices localement **supprime une transmission
  d'adresse réseau** *(protection des données)* **et** accélère l'affichage *(performance)*.

---

### C-027 — 🧪 Les tests qui manquent encore

- **Problème** : **aucun scénario ne rejoue une journée de bout en bout.** Les 589 vérifications
  portent sur des morceaux isolés ; **rien n'enchaîne** création → génération → saisie → classement
  → après-midi. Or **c'est aux jonctions que vivent les problèmes** *(R-002, R-015)*. Et **tout ce
  qui écrit dans le classeur est hors de portée du harnais** : **110 des 277 fonctions** le
  reçoivent en paramètre.
- **Risques couverts** : **R-045** · **R-046**
- ⚠️ **R-046 est un plafond structurel, pas une négligence.** Le lever demanderait une **doublure de
  classeur** — un vrai chantier. **Ce n'est pas une priorité** : la valeur est dans **R-045**.
- **Dépendances** : après **C-011** et **C-012**.
- **Preuve** : un scénario complet qui tourne **hors de Google**, en quelques secondes.

---

### C-028 — 🔏 La protection des données : ce qui reste

- **Problème** : quatre points que ni C-005 *(les textes)* ni C-006 *(les durées)* ne referment.
  **Toute image déposée est rendue publique** et ne disparaît pas vraiment — et rien n'avertit
  qu'**une photo de parking peut montrer des plaques et des visages**. Le **droit à l'image n'est
  plus outillé** depuis son retrait, et **rien n'écrit ce qui l'a remplacé**. Il n'existe **aucun
  cadre écrit** : ni registre, ni conduite à tenir en cas de fuite. Et la **mesure de visibilité des
  partenaires** attend l'implémentation de **D-019**.
- **Risques couverts** : **R-035** · **R-036** · **R-039** · **R-029** *(P1, suspendu)*
- **Risque** : 🟢 faible — l'essentiel est **documentaire**, sauf **R-029** *(voie (a) : une ligne
  visible + un moyen de dire non)*, qui est du code.
- **Dépendances** : **R-036 attend I-15** *(question au club)* · **R-029 doit être fait AVANT que
  l'interrupteur des partenaires soit rallumé** · **R-039 s'appuie sur C-005 et C-006**.

---

### C-029 — 📌 Savoir quelle version tourne

- **Problème** : **rien ne permet de dire quelle version est en service.** `CHANGELOG.md` fait
  **2 406 lignes** et **toutes** ses entrées sont sous le titre « Non publié » ; **`git tag` ne
  renvoie rien**. Quand quelque chose se passe mal un dimanche, on ne peut pas dire *« on est passé
  de telle version à telle version »*.
- **Risques couverts** : **R-075**
- **Risque** : ⚪ **nul** — ce sont des étiquettes et un fichier texte.
- 🔗 **Complète C-007** : la carte dit **ce que fait** l'application, les versions disent **depuis
  quand**.

---

### C-030 — 🧭 La maintenabilité : **en opportuniste, jamais en bloc**

> ⛔ **Ce n'est pas un chantier qu'on ouvre. C'est une RÈGLE qu'on applique quand on passe déjà par
> là.**

- **Problème** : sept constats d'architecture réels — un fichier serveur de **8 147 lignes**, des
  tests rangés **par date d'écriture** et non par sujet, une administration **en anneau** *(13
  paires de fichiers qui s'appellent mutuellement)*, **12 noms globaux en double**, calculer et
  afficher confondus, **aucun outillage**, et des variables trop courtes dans les longues fonctions.
- **Risques couverts** : **R-074** · **R-076** · **R-077** · **R-078** · **R-079** · **R-081** ·
  **R-088**
- 🔴 **Pourquoi aucun d'eux ne doit être traité en bloc** — chacun, fait d'un coup, **aggrave un
  problème plus grave que lui** :

  | | Ce que « le faire en bloc » coûterait |
  |---|---|
  | **R-074** *(découper `Code.gs`)* | ✅ **Déjà arbitré — NON** *(**D-028**)* : 1 fichier → **5 collages à la main**, soit le mécanisme même de **M-04**. Réouverture le jour où le dépôt cesse d'être manuel |
  | **R-076** *(renommer 277 groupes de tests)* | **277 occasions de perdre un test en silence** |
  | **R-078** *(12 noms en double)* | La panne serait **une page blanche**, pas un bouton en panne. ⚠️ **Sous la protection des tests de C-013**, jamais à l'aveugle |
  | **R-077 / R-079** *(découper l'administration)* | Exige l'outillage que le projet a **délibérément refusé** |
  | **R-088** *(variables courtes)* | **42 occasions de casser un appel** pour un gain de **confort de lecture** |
  | **R-081** *(le dépôt manuel du serveur)* | C'est la **racine commune** de M-04, I-01 et D-028 — mais l'automatiser est un chantier à part entière, pas un nettoyage |

- ⭐ **La règle retenue** : **quand on ouvre un fichier pour une autre raison, on améliore ce qu'on
  touche — et rien d'autre.** Progressif et réversible, ou rien.
- **Statut** : **RÈGLE PERMANENTE**, pas un chantier daté.

---

### C-031 — 🏛️ Les colonnes du classeur : **une seule façon de les désigner**

> 🏛️ **Chantier créé le 2026-08-19, hors ÉTAPE 3**, par **décision de Romain** *(**D-037**)*. Il ne
> vient pas de l'audit des 8 domaines : il porte **R-093**, entré au registre le 2026-08-18 par les
> vérifications manuelles de C-012. ⚠️ **Sa solution technique n'est PAS conçue** — cette fiche
> cadre le problème et son périmètre, rien de plus.

- **Problème** (en langage simple) : **l'application désigne les colonnes du classeur de deux façons
  différentes, et rien ne garantit qu'elles parlent de la même chose.** Pour *lire* les données
  publiques, elle va chercher la colonne **par son titre** — méthode juste quel que soit l'ordre.
  Pour *écrire*, elle compte les colonnes **par leur rang** — « la 19ᵉ » — d'après l'ordre inscrit
  dans le code, **pas d'après le classeur**. Tant que les deux ordres coïncident, tout va bien. Le
  jour où ils divergent, l'application **écrit à côté, sans rien signaler**.
- **Risques couverts** : **R-093** *(P2)*
- **Priorité** : **P2** — ⚠️ mais lire la nuance ci-dessous : la priorité décrit **la probabilité
  aujourd'hui**, pas la gravité du jour où cela se produirait.
- 🏉 **L'image qui dit tout** : les dossards sont rangés dans un vestiaire. Pour les **prendre**, on
  lit le nom écrit sur chacun. Pour les **ranger**, on compte les casiers depuis la porte, d'après
  un plan affiché ailleurs. Tant que le vestiaire correspond au plan, personne ne voit rien. Le jour
  où un casier a été ajouté au mauvais endroit, **chaque maillot part chez le voisin** — et le plan,
  lui, continue d'avoir l'air juste.
- ⚠️ **Ce n'est pas théorique** : **constaté en vrai le 2026-08-18** *(C-012, vérification V-4)* —
  les 8 compteurs du score détaillé écrits **une colonne trop à gauche**, la colonne `arbitre`
  **écrasée** par un nombre d'essais, `drop_B` **perdue**. Le score et le statut restaient justes,
  et ⭐ **l'application n'a rien signalé du tout**.
- 🎯 **Le périmètre couvre AU MINIMUM DEUX onglets** *(exigence de **D-037**)* :

  | Onglet | Ce qui a été constaté |
  |---|---|
  | **`Matchs`** | `colMatchs()` calcule le rang depuis `ENTETES.Matchs` *(la constante du **code**)*, et `assurerColonnesMatchs` ajoute les colonnes manquantes **à droite** — une colonne du milieu qui manque revient donc **en queue**, et tout ce qui suit est décalé. ⚡ **Et le chemin d'écriture du score LIT AUSSI par rang** *(`objetDepuisLigneMatch`)* : les six garde-fous décident alors sur des valeurs mal étiquetées |
  | **`Equipes`** | **Même schéma**, et le code le dit lui-même : *« les colonnes manquantes sont AJOUTÉES à la suite, dans l'ordre de `ENTETES.Equipes` — `ecrireNouvelleEquipe` écrit positionnellement »* *(`assurerColonnesEquipes`)* |

  ⚠️ **Le chantier commence donc par un relevé**, pas par une correction : *quels onglets, quelles
  écritures, quelles lectures* — les deux ci-dessus sont **constatés**, la liste n'est pas déclarée
  close.
- 💡 **Le remède existe déjà dans le projet, appliqué à un AUTRE onglet** : `assurerOngletSponsors`
  compare les en-têtes **rang par rang** et réécrit la ligne si l'ordre diverge. Son commentaire
  nomme le risque exact : *« la valeur partirait dans le Sheet pour n'être jamais relue, en
  silence »*.
  🔴 **Mais il ne doit PAS être recopié tel quel** : il **renomme les en-têtes sans déplacer les
  données**. Sans danger sur `Sponsors` ; sur un `Matchs` réellement désordonné **contenant des
  scores**, il transformerait un décalage en **corruption définitive**. ⭐ **C'est la contrainte
  numéro un de la conception.**
- **Risque de la correction** : 🟠 **élevé si mal conçue, faible si bien conçue.** Le chantier touche
  **la façon dont l'application écrit dans le classeur** — donc tout. Trois exigences se dégagent
  déjà : ① **ne jamais réécrire une ligne d'en-tête sur un classeur contenant des données** sans
  avoir traité leur déplacement ; ② **savoir dire** que l'ordre diverge, plutôt que de corriger en
  silence ; ③ **ne rien changer** au comportement quand l'ordre est correct — ce qui est le cas
  partout aujourd'hui.
- **Fichiers concernés** : `backend/Code.gs` · `backend/Tests.gs`
- **Dépendances** : **aucune** — ⚠️ mais lire l'encadré ci-dessous, qui est la raison d'être de sa
  date de création.
- **Stratégie de test** *(piste, non arrêtée)* : le défaut est **hors de portée du harnais actuel** —
  ⭐ **les 703 vérifications ne touchent aucun classeur**, et c'est précisément pourquoi elles ne
  l'ont jamais vu. C'est **une vérification manuelle** qui l'a trouvé. Toute solution devra dire
  **comment elle se prouve**.
- **Non-régression** : un classeur dont l'ordre est **canonique** — c'est-à-dire tous ceux en service
  aujourd'hui — doit se comporter **exactement** comme avant.
- **Statut** : **IDENTIFIÉ** · **Validation** : ✅ **création du chantier validée (D-037)** · ⏳ **le
  contenu reste à concevoir ET à valider**

> ⚠️ **CE QUE CE CHANTIER NE FAIT PAS, et c'est important pour ne pas se croire protégé.**
> La règle provisoire inscrite dans **C-015** *(toute colonne nouvelle s'ajoute **à la fin**)*
> **protège C-015, elle ne referme pas R-093.** Elle repose sur la vigilance de chaque session ;
> **C-031 existe pour que le dépôt cesse d'en dépendre.**
>
> 🟢 **Pourquoi le problème n'est pas atteignable en production aujourd'hui** *(vérifié le
> 2026-08-19, et c'est ce qui autorise à ne pas en faire un préalable bloquant)* : toutes les
> colonnes ajoutées après coup l'ont été **en fin de `ENTETES`**, et dans cet ordre — les 8
> compteurs le 2026-07-31 à 12 h 51, `arbitre` **en dernière position** le même jour à 16 h 31.
> `assurerColonnesMatchs`, qui ajoute à droite, a donc **reproduit l'ordre canonique**.
> ⚠️ **C'est un heureux enchaînement, pas une garantie** : il tient tant que personne n'insère une
> colonne au milieu.

---

## 11. ⛔ CE QU'ON NE FAIT PAS — et pourquoi

> **Trois problèmes du registre n'auront pas de fiche**, et c'est une décision, pas un oubli.

| Réf | Pourquoi |
|---|---|
| **R-019** *(P1)* | **Ce n'est pas un chantier, c'est une action de Romain** : remplacer les deux clés par des suites aléatoires, cinq minutes dans le menu du classeur *(**D-017**)*. Aucun code ne peut le faire à sa place |
| **R-011** *(P3)* | Un tirage ne peut être ni reproduit ni annulé. **Sans conséquence aujourd'hui** : le tirage se fait avant le tournoi et le refaire ne coûte rien. Le sujet naîtrait dans un usage multi-clubs |
| **R-040** *(P3)* | Le multi-clubs (SaaS) changera la nature du sujet des données. **Prématuré** — `RAPPORT-AUDIT.md` §6 le classe explicitement dans « ce qu'il ne faut PAS faire » |

---

## 12. 🎯 LA COUVERTURE — **les 93 problèmes ont tous une situation connue**

> **C'est la pièce qui clôt l'ÉTAPE 3**, et la raison pour laquelle Romain a voulu la vision
> complète avant de commencer : *« plutôt que commencer un chantier pour ensuite devoir repasser
> dessus parce qu'une session ultérieure devra ajouter, supprimer ou modifier quelque chose ».*
>
> **Ce tableau est vérifiable** : il a été produit en relisant les fiches, pas de mémoire.

> ⚡ **MISE À JOUR DU 2026-08-19 — ce titre disait « les 91 problèmes sont tous placés », et cette
> phrase était devenue fausse.** Deux problèmes sont entrés au registre **après** la clôture de
> l'ÉTAPE 3, trouvés par le chantier **C-012** : **R-092** *(2026-08-16)* et **R-093**
> *(2026-08-18)*. Ni l'un ni l'autre n'était rattaché à un chantier — l'écart était **signalé dans
> `RISQUES.md`**, en attente d'un arbitrage.
>
> ✅ **Il a eu lieu le 2026-08-19** *(**D-037**)* : **R-092 rejoint C-015**, **R-093 devient
> C-031**. **Le registre n'a de nouveau aucun problème sans situation connue.**

| | |
|---|---|
| **Problèmes au registre** | **93** *(88 de l'audit + 5 post-clôture)* |
| **Placés dans un chantier** | **90** |
| **Explicitement hors chantier** | **3** *(R-011, R-019, R-040 — voir §11)* |
| **Sans place** | ✅ **0** |
| **Chantiers écrits** | **31** *(C-001 → C-031)* |

> 📌 **93 n'est pas 88, et il ne faut pas confondre les deux** : **88** est le résultat de
> **l'audit**, figé, celui de `RAPPORT-AUDIT.md` ; **93** est l'état du **registre de suivi**, qui
> continue de vivre. **R-089 → R-093 n'ont été trouvés par aucun domaine d'audit.**

### 12.1 — Le tableau complet

| Réf | Priorité | Où il est traité |
|---|---|---|
| **R-001** | P1 | C-015 |
| **R-002** | P1 | C-025 |
| **R-003** | P1 | C-003 + C-015 |
| **R-004** | P1 | C-015 |
| **R-005** | P1 | C-015 |
| **R-006** | P2 | C-025 |
| **R-007** | P2 | C-025 |
| **R-008** | P2 | C-025 |
| **R-009** | P2 | C-023 |
| **R-010** | P2 | C-025 |
| **R-011** | P3 | ⛔ hors chantier |
| **R-012** | P2 | C-010 |
| **R-013** | P2 | C-015 |
| **R-014** | P0 | C-001 |
| **R-015** | P1 | C-002 + C-016 |
| **R-016** | P1 | C-002 + C-016 |
| **R-017** | P1 | C-020 |
| **R-018** | P1 | C-021 |
| **R-019** | — | ⛔ hors chantier |
| **R-020** | P2 | C-021 |
| **R-021** | P2 | C-021 |
| **R-022** | P2 | C-026 |
| **R-023** | P2 | C-020 |
| **R-024** | P2 | C-007 |
| **R-025** | P2 | C-026 |
| **R-026** | P3 | C-026 |
| **R-027** | P3 | C-026 |
| **R-028** | P1 | C-005 |
| **R-029** | P1 | C-028 |
| **R-030** | P1 | C-006 |
| **R-031** | P2 | C-006 |
| **R-032** | P2 | C-021 |
| **R-033** | P2 | C-006 |
| **R-034** | P2 | C-006 |
| **R-035** | P2 | C-028 |
| **R-036** | P2 | C-028 |
| **R-037** | P2 | C-026 |
| **R-038** | P2 | C-005 |
| **R-039** | P2 | C-028 |
| **R-040** | P3 | ⛔ hors chantier |
| **R-041** | P1 | C-011 |
| **R-042** | P1 | C-012 |
| **R-043** | P1 | C-013 |
| **R-044** | P1 | C-024 |
| **R-045** | P2 | C-027 |
| **R-046** | P2 | C-027 |
| **R-047** | P2 | C-002 + C-016 |
| **R-048** | P2 | C-014 |
| **R-049** | P2 | C-013 |
| **R-050** | P3 | C-013 |
| **R-051** | P1 | C-002 + C-014 |
| **R-052** | P1 | C-002 + C-014 |
| **R-053** | P2 | C-014 |
| **R-054** | P2 | C-022 |
| **R-055** | P2 | C-022 |
| **R-056** | P2 | C-022 |
| **R-057** | P2 | C-022 |
| **R-058** | P2 | C-022 |
| **R-059** | P2 | C-020 |
| **R-060** | P3 | C-022 |
| **R-061** | P1 | C-017 |
| **R-062** | P1 | C-017 |
| **R-063** | P2 | C-018 |
| **R-064** | P2 | C-017 |
| **R-065** | P2 | C-018 |
| **R-066** | P2 | C-018 |
| **R-067** | P2 | C-019 |
| **R-068** | P2 | C-019 |
| **R-069** | P2 | C-014 |
| **R-070** | P3 | C-019 |
| **R-071** | P3 | C-017 |
| **R-072** | P1 | C-007 |
| **R-073** | P1 | C-007 |
| **R-074** | P2 | C-030 |
| **R-075** | P2 | C-029 |
| **R-076** | P2 | C-030 |
| **R-077** | P2 | C-030 |
| **R-078** | P2 | C-030 |
| **R-079** | P2 | C-030 |
| **R-080** | P2 | C-018 |
| **R-081** | P3 | C-030 |
| **R-082** | — | C-023 |
| **R-083** | P2 | C-008 |
| **R-084** | P2 | C-009 |
| **R-085** | P2 | C-014 |
| **R-086** | P2 | C-014 |
| **R-087** | P3 | C-009 |
| **R-088** | P3 | C-030 |
| **R-089** | P1 | C-002 + C-003 |
| **R-090** | P2 | C-004 |
| **R-091** | P2 | C-004 |
| ⚡ **R-092** | *à confirmer* | **C-015** *(D-037)* |
| ⚡ **R-093** | P2 | **C-031** *(D-037)* |

### 12.2 — Ce que ce tableau permet, et qui n'était pas possible avant

1. **Aucun chantier ne sera à refaire** parce qu'un problème oublié aurait forcé à rouvrir le même
   fichier — c'était l'inquiétude exacte de Romain, et elle est levée ;
2. **L'ordre est établi de bout en bout** : on sait ce qui doit passer avant quoi, et **pourquoi** ;
3. **L'ÉTAPE 3 est terminée.** La suivante est l'**ÉTAPE 4** — la validation, chantier par chantier.

> ⚠️ **Ce que ce tableau ne prouve PAS** : que les 93 problèmes seront corrigés. Il prouve que
> **chacun a une place et une décision** — y compris *« on ne le fait pas, et voici pourquoi »*.
> Trois sont dans ce cas, et c'est écrit.
>
> ⚡ **Et il ne prouve pas non plus que la liste est close.** Elle ne l'est pas : **R-092 et R-093
> sont entrés après la clôture de l'ÉTAPE 3**, trouvés par un chantier en cours. 🎯 **La leçon vaut
> pour la suite** — *un chantier qui travaille vraiment trouve des problèmes que l'audit n'avait pas
> vus*, et le tableau doit alors être **rouvert**, pas défendu.

---

## 13. 📄 REMISE À NIVEAU DOCUMENTAIRE — **6 lots**

> 🏁 **CHANTIER TERMINÉ le 2026-08-19** — les 6 lots sont faits et publiés. Voir **§13.5** pour le
> critère de fin atteint, **et pour ce que « terminé » ne veut pas dire**.
>
> ⚠️ **Ce chantier n'est PAS issu de l'audit de l'ÉTAPE 2.** Il n'a pas de numéro `C-0XX`, et il ne
> figure pas au tableau des chantiers du **§3** : il a été **ouvert par Romain le 2026-08-19**,
> hors plan, après le chantier **C-012**.
>
> 📌 **Comment lire cette section.** Elle mélange deux registres, et ils sont **signalés
> séparément partout** :
>
> | | |
> |---|---|
> | 🧾 **Constaté** | Les **LOT 1 à 3** : ils sont **faits**, et chaque affirmation est vérifiable dans le dépôt *(commit, fichiers, décision)* |
> | 🏛️ **Décidé** | Les **LOT 4 à 6** : leur définition **n'existait nulle part** dans le dépôt. Elle est fixée par **décision du propriétaire du projet, le 2026-08-19** — voir **D-036**. Ce n'est pas une reconstitution : c'est une décision |

### 13.1 — Pourquoi ce chantier existe

La documentation du dépôt avait **décroché de l'état réel du logiciel** — pas d'un coup, mais
fonctionnalité après fonctionnalité. Le constat d'entrée, chiffré et vérifiable :

- **`backend/README.md`** annonçait un bilan de tests **`616/616`** alors que le vrai bilan est
  **`703/703`**. Le sens de l'écart est le piège : `deploiement.md` enseigne qu'un nombre **plus
  petit** signifie que l'**ancien** fichier de tests a tourné. Quelqu'un obtenant le **bon**
  résultat aurait donc conclu à une panne ;
- **`frontend/README.md`** affirmait de la mesure des partenaires qu'elle est *« locale (rien n'est
  envoyé) »* — **le code envoie les relevés au serveur**. Seul écart touchant les **données
  personnelles** ;
- **le format d'après-midi `POULES_NIVEAU`**, livré le 2026-08-01 et **proposé en premier** dans
  l'administration, n'était documenté dans **aucun** document destiné à l'organisateur ;
- **`CHANGELOG.md`** s'était **arrêté au 2026-08-04** : **12 enregistrements** touchant le code, les
  tests ou l'automatisation, sans une ligne de journal.

> 🎯 **Le diagnostic, et il commande tout le chantier.** Ces écarts ne venaient **pas** d'un défaut
> de discipline. Neuf contradictions sur dix opposaient un document **récent et exact** à un
> document **plus ancien qu'on n'avait pas relu quand la valeur avait changé**. Le problème est
> celui de la **propagation**, et — pour le `CHANGELOG` — celui du **périmètre** de la règle
> `CLAUDE.md` **§8 bis**, qui ne le nommait pas.

### 13.2 — Le principe

**Un lot = un sujet = un commit.** Chaque lot est relu, contrôlé et validé **avant** le suivant ; le
suivant ne commence jamais automatiquement. Deux règles ont tenu du début à la fin :

1. ⛔ **Aucun remplacement de masse.** Le dépôt contient ~20 traces historiques légitimes portant
   d'anciens chiffres *(« 8 147 lignes »…)*. Un `sed` global les aurait détruites pour corriger
   **un** repère utile. **Toute correction est ciblée, et chaque passage est relu avant.**
2. ⛔ **Une affirmation se vérifie à sa source**, jamais par recopie d'un document à l'autre — code,
   tests, workflow, configuration, ou décision enregistrée.

### 13.3 — Les six lots, leur ordre et leur état

| # | Lot | État | Commit | Décision |
|---|---|---|---|---|
| **1** | Les repères qui pouvaient tromper | 🧾 ✅ **terminé et publié** | [`8e08552`](https://github.com/RFL974/tournoi-r92/commit/8e08552) | — |
| **2** | Le format que personne ne pouvait découvrir | 🧾 ✅ **terminé et publié** | [`969e673`](https://github.com/RFL974/tournoi-r92/commit/969e673) | **D-034** |
| **3** | Rouvrir le journal des évolutions | 🧾 ✅ **terminé et publié** | [`b91cbfe`](https://github.com/RFL974/tournoi-r92/commit/b91cbfe) | **D-035** |
| **4** | Statuts de déploiement et repères opérationnels | 🏛️ ✅ **terminé et publié** | [`22d2186`](https://github.com/RFL974/tournoi-r92/commit/22d2186) | — |
| **5** | Pilotage documentaire du chantier | 🏛️ ✅ **terminé** | [`eadb61a`](https://github.com/RFL974/tournoi-r92/commit/eadb61a) **+ le commit de clôture** *(voir §13.6)* | **D-036** |
| **6** | Relecture finale et cohérence globale | 🏛️ ✅ **terminé et publié** | [`3af61f2`](https://github.com/RFL974/tournoi-r92/commit/3af61f2) | — |

**L'ordre est contraint, il n'est pas arbitraire** : `1 → 2 → 3 → 4 → 5 → 6`.

---

#### 🧾 LOT 1 — Les repères qui pouvaient tromper · ✅ `8e08552`

| | |
|---|---|
| **Objectif** | Supprimer les deux seules affirmations du dépôt capables de faire prendre une **décision fausse** |
| **Fichiers** | `backend/README.md` · `frontend/README.md` |
| **Dépendances** | Aucune — il pouvait partir immédiatement |
| **Critère de fin** *(atteint)* | Les chiffres concordent avec `wc -l` et `ETAT.md` §9 · plus aucun `616/616` opérationnel · les 3 documents parlant de la mesure des partenaires disent la même chose · liens vérifiés |
| **Fait** | 8 147 → **8 274** · 3 859 → **4 244** · le bilan de tests **n'est plus recopié** : il renvoie à `deploiement.md`, seule adresse. L'affirmation *« rien n'est envoyé »* est remplacée par le comportement réel, écrit depuis le code |

#### 🧾 LOT 2 — Le format que personne ne pouvait découvrir · ✅ `969e673` · **D-034**

| | |
|---|---|
| **Objectif** | Qu'un organisateur sache quels formats d'après-midi existent réellement |
| **Fichiers** | `docs/formats-apres-midi.md` · `README.md` · `docs/guide-utilisateur.md` · `docs/architecture.md` — **plus**, par exception, du code |
| **Dépendances** | Après le LOT 1 |
| **Critère de fin** *(atteint)* | Les formats du code = ceux documentés, même ordre · aucune formulation de l'ancienne doctrine · `COUPE_PLATEAU` jamais présenté comme conforme EDR · sa mécanique métier intacte |
| **⚠️ Exception assumée** | **Ce lot a touché du code**, alors que le chantier est documentaire. **D-034** — décision produit prise *pendant* le lot — a rendu `COUPE_PLATEAU` de nouveau sélectionnable, **signalé** et **confirmé avant application**. La documentation seule ne pouvait pas la porter |

#### 🧾 LOT 3 — Rouvrir le journal des évolutions · ✅ `b91cbfe` · **D-035**

| | |
|---|---|
| **Objectif** | Que le journal couvre à nouveau l'état réel, **et** que la cause du décrochage soit fermée |
| **Fichiers** | `CHANGELOG.md` · `CLAUDE.md` *(§8 bis)* · `DECISIONS.md` |
| **Dépendances** | Après le LOT 2 — l'entrée sur `COUPE_PLATEAU` en dépend |
| **Critère de fin** *(atteint)* | Chaque chiffre vérifié à sa source · ordre chronologique · aucune entrée existante modifiée · `CHANGELOG` inscrit à la règle **§8 bis** |
| **⚠️ Ne referme PAS** | **R-075** reste entier : tout demeure sous `## [Non publié]` et `git tag` ne renvoie rien. **Rouvrir un journal n'est pas publier des versions** |

---

#### 🏛️ LOT 4 — Statuts de déploiement et repères opérationnels · ✅ **terminé et publié** · [`22d2186`](https://github.com/RFL974/tournoi-r92/commit/22d2186)

> 🏛️ Définition fixée par **décision du propriétaire, 2026-08-19** *(**D-036**)*.

| | |
|---|---|
| **Objectif** | Remettre en cohérence **toutes** les affirmations documentaires décrivant l'état réel de **déploiement ou de publication**. Certains documents décrivent encore des fonctionnalités comme *« à déployer »*, *« non déployées »* ou *« en attente de publication »*, alors que le dépôt, GitHub Pages ou le backend ont évolué depuis |
| **⛔ Ne doit PAS** | Modifier le produit. **Uniquement** faire correspondre les statuts documentaires à l'état réel vérifiable |
| **Fichiers** | **À déterminer par recherche dans le dépôt.** Au minimum les documents contenant `à déployer`, `déployé`, `non déployé`, `publié`, `en production`, `à publier`, ou toute formulation équivalente. ⚠️ **Cas connu** : `README.md` porte `✅ Fait (à déployer)` — **la recherche ne doit pas s'y limiter** |
| **Dépendances** | Après **LOT 1** *(les README sont corrigés)*, **LOT 2** *(D-034 a changé l'état réellement publié)* et **LOT 3** *(le CHANGELOG est à niveau et sa règle fixée)* |
| **Méthode** | Pour chaque statut : ① relever le texte · ② identifier ce qu'il prétend · ③ **vérifier l'état réel** *(dépôt, commit publié, GitHub Pages, workflow, backend Apps Script si nécessaire, décision ou test)* · ④ **corriger uniquement si l'affirmation est réellement fausse ou périmée**. ⚠️ **Ne jamais transformer un statut historique daté en statut actuel** |
| **Critères de fin** | Aucune mention actuelle de type *« à déployer »* si la fonctionnalité l'est réellement · aucune fonctionnalité non déployée présentée comme déployée · **états frontend et backend distingués** si nécessaire · aucune trace historique datée réécrite · aucun code, test ou workflow modifié · liens vérifiés · diff inspecté · **commit local, arrêt avant push** |
| **✅ Fait** *(2026-08-19)* | **3 corrections**, chacune vérifiée à sa source : `README.md` fonctionnalité 4 *« (à déployer) »* → **déployé** *(la production sert déjà les colonnes d'après-midi — `sous_tableau`, `tour`, `match_suivant`, `vainqueur`, `arbitre`)* · la date de fraîcheur du **§Statut d'avancement** remplacée par un relevé **reproductible** · `backend/README.md` : `Code.gs` **8 274 → 8 277** *(les 3 lignes de commentaire ajoutées par le lot 2)*. **9 documents examinés et laissés intacts parce qu'exacts**, dont `textes-information-donnees.md` *(« aucun de ces textes n'est en ligne » — **vrai**, R-028 est EN COURS)*. **Aucun état historique daté réécrit** : les deux *« Backend PAS redéployé »* de `ETAT.md` sont sous bandeaux datés |

#### 🏛️ LOT 5 — Pilotage documentaire du chantier · ✅ **terminé** · **D-036**

> 🏛️ Définition fixée par **décision du propriétaire, 2026-08-19** *(**D-036**)*.

| | |
|---|---|
| **Objectif** | Qu'une **nouvelle session** puisse comprendre et reprendre ce chantier **sans accès à la conversation d'origine** |
| **Le problème** | Découvert pendant le **LOT 3** : le chantier n'était documenté **nulle part** comme un chantier cohérent de 6 lots. Recherche exhaustive — fichiers suivis, historique complet, 103 branches locales, 44 distantes, `stash`, notes, **27 objets orphelins** : **zéro définition** des LOT 4 à 6 |
| **Fichiers** | Principalement `PLAN.md` · et `DECISIONS.md` pour la décision propriétaire · éventuellement un document d'état **si les conventions du dépôt l'imposent**. ⛔ **Ne pas créer de nouveau document** si les existants suffisent |
| **Dépendances** | **Après le LOT 4**, pour que le plan reflète un état documentaire déjà réaligné · **avant le LOT 6**, qui s'appuie sur un plan complet |
| **Critères de fin** | Une session neuve retrouve les 6 lots sans conversation externe · chaque lot a un objectif compréhensible · les états terminé / en cours / à faire sont exacts · les commits sont vérifiés · **D-034** et **D-035** correctement rattachées · **la source propriétaire des LOT 4 à 6 est explicitement indiquée** · aucune information spéculative présentée comme historique · aucun code, test ou workflow modifié · **commit local, arrêt avant push** |
| **✅ Fait — en deux temps** | **①** `eadb61a` *(2026-08-19)* : la section **§13** et la décision **D-036**, écrites **en avance sur le LOT 4** parce que le plan devait exister pour poursuivre. **②** Le **commit de clôture** *(voir §13.6)* : état et commit du LOT 4 inscrits, dépendance du LOT 6 rendue explicite, **critère de fin du chantier ajouté (§13.5)**, et les **critères de fin ci-dessus repassés un par un** — les **12 questions** d'une session neuve testées **sur les documents eux-mêmes** |

#### 🏛️ LOT 6 — Relecture finale et cohérence globale · ✅ **terminé et publié** · [`3af61f2`](https://github.com/RFL974/tournoi-r92/commit/3af61f2)

> 🏛️ Définition fixée par **décision du propriétaire, 2026-08-19** *(**D-036**)*.

| | |
|---|---|
| **Objectif** | Le balayage **final** de cohérence, après les LOT 1 à 5. Éliminer les **résidus** documentaires que les corrections ciblées ont laissés |
| **Critère de fin** | **Un lecteur qui parcourt aujourd'hui la documentation active ne rencontre plus** : de contradiction connue · de lien interne cassé connu · de formulation obsolète non volontaire · d'écart manifeste avec l'état actuel du dépôt |
| **Fichiers** | Tous les documents **actifs** peuvent être **inspectés** — mais les **modifications** restent limitées aux écarts **réellement démontrés** |
| **Dépendances** | **Après les LOT 1 à 5.** En particulier après le **LOT 5** : la relecture finale s'appuie sur un plan complet — c'est ce que dit la fiche du LOT 5, et c'est repris ici pour qu'on n'ait pas à la chercher |
| **Points connus à RÉÉVALUER** *(à vérifier, pas à corriger d'office)* | ① le lien cassé de `AUDIT-TOURNOI-R92.md` vers `../backend/Code.gs` · ② la formulation résiduelle signalée dans `docs/sponsors.md` · ③ le **§1.6** de `docs/guide-utilisateur.md`, *« Phase après-midi (classement croisé) »*, **si après les autres lots** il reste trompeur ou incomplet · ④ tout autre résidu trouvé au contrôle global |
| **⛔ Ne doit PAS** | Rouvrir **D-034** · rouvrir **D-035** · modifier le comportement métier · refaire l'architecture documentaire · corriger un document **explicitement historique** au seul motif qu'il décrit un ancien état · transformer une amélioration de style en chantier · créer du code ou des tests |
| **Méthode** | ① balayer les documents actifs · ② chercher les incohérences connues · ③ contrôler les liens internes · ④ chercher les contradictions entre `README`, guide, architecture, formats, sponsors, déploiement, `CHANGELOG` et documents d'industrialisation actifs · ⑤ **distinguer soigneusement** document actif / document historique daté / décision en vigueur / ancien état conservé pour mémoire · ⑥ **corriger uniquement ce qui est objectivement faux, cassé ou trompeur aujourd'hui** |
| **Critères de fin** | Liens internes de **tout** le dépôt contrôlés · aucune nouvelle rupture · les liens cassés connus **corrigés ou explicitement justifiés** s'ils doivent rester · aucune contradiction connue entre documents actifs · `README`, guide, architecture, formats, sponsors, déploiement, `CHANGELOG`, `PLAN` et décisions actives vérifiés · aucune réécriture abusive des documents historiques · aucun code, test ou workflow modifié · diff inspecté · **commit local, rapport avant push** |
| **✅ Fait** *(2026-08-19)* | **24 documents actifs balayés** · ⭐ **87 liens internes contrôlés, ZÉRO cassé**. Les **3 points connus** traités : le lien d'`AUDIT-TOURNOI-R92.md` *(coquille d'origine — seuls les 3 caractères `../` retirés, sur une ligne de 1 038)*, le *« mesure locale »* de `sponsors.md`, et les **deux** occurrences de *« (classement croisé) »*. ⚡ **Et trois écarts que personne n'avait vus** : `sponsors.md` §7 renvoyait vers des styles **déménagés** *(la « Section 19 » n'existe plus ; `sponsors.css`, qui porte les 91 règles, n'était pas citée)* · `sponsors.md` §8 listait comme **manquantes deux fonctions CONSTRUITES** *(consolidation entre appareils, compteur admin)* · l'arborescence du `README` ignorait **4 feuilles de style sur 6** et 2 documents. **Laissé intact volontairement** : `phases-tournoi.md`, note de conception **datée** qui renvoie déjà à la source courante |

### 13.4 — Les décisions nées de ce chantier

| Décision | Objet | Lot |
|---|---|---|
| **D-034** | `COUPE_PLATEAU` reste **proposé**, mais **signalé** : l'application informe, elle n'interdit pas | 2 |
| **D-035** | Le `CHANGELOG` raconte le produit et la fiabilité, **et il entre dans la règle de la carte** *(§8 bis passe à 4 documents)* | 3 |
| **D-036** | **Le découpage en 6 lots** — constat pour les LOT 1 à 3, **décision propriétaire** pour les LOT 4 à 6 | 5 |

### 13.5 — 🏁 Le chantier est TERMINÉ

**Il ne reste aucun lot.** Les **six** sont terminés et publiés — la remise à niveau documentaire
est close le **2026-08-19**.

> 🏁 **Le critère de fin est ATTEINT**, et c'était celui du LOT 6 :
>
> **« Un lecteur qui parcourt aujourd'hui la documentation active ne rencontre plus de
> contradiction connue, de lien interne cassé connu, de formulation obsolète non volontaire, ni
> d'écart manifeste avec l'état actuel du dépôt. »**
>
> ⚠️ **Ce critère porte sur la documentation ACTIVE.** Il ne demandait **pas** que les documents
> **historiques datés** *(`AUDIT.md`, `SESSIONS.md`, `RAPPORT-AUDIT.md`, les entrées passées du
> `CHANGELOG`, les bandeaux « Rappel de la mise à jour précédente » de `ETAT.md`)* soient réécrits :
> ils décrivent un état ancien, et c'est leur rôle. **Aucun ne l'a été.**

**⚠️ Ce que « terminé » ne veut PAS dire.** Le chantier est clos **dans le périmètre de ce §13**, et
rien de plus :

- ❌ **pas** que le projet soit fonctionnellement parfait ;
- ❌ **pas** que les risques d'industrialisation soient résolus — **R-075** *(aucune version publiée,
  `git tag` vide)*, **R-092** et **R-093** restent ouverts au registre ;
- ❌ **pas** qu'aucune amélioration éditoriale ne soit imaginable ;
- ✅ **seulement** ceci : *ce que la documentation active affirme aujourd'hui correspond à ce que le
  dépôt contient.*

> 🧭 **Ce qui empêche le retour en arrière.** Trois règles nées de ce chantier restent en vigueur —
> `CLAUDE.md` **§8 bis** *(la carte, désormais **4** documents, `CHANGELOG` compris — **D-035**)*,
> **§8 ter** *(le commentaire à jour)*, et le principe qui a tenu du premier au dernier lot :
> **une affirmation se vérifie à sa source, jamais par recopie.**

### 13.6 — Pourquoi le LOT 5 cite deux commits, dont un sans identifiant

> 🔁 **Un lot qui documente son propre achèvement ne peut pas connaître le numéro du commit qui
> l'achève** : Git ne le calcule qu'au moment où le commit est créé, à partir du contenu — donc
> après que ce contenu a été écrit. Écrire son propre identifiant à l'avance est **impossible**, et
> l'inventer serait pire que l'omettre.
>
> **La solution retenue, la plus simple :** le LOT 5 est **fait en deux commits**, et le document
> le dit.
>
> | | |
> |---|---|
> | **①** `eadb61a` | La section **§13** et la décision **D-036** — la partie substantielle, et elle **a** un identifiant |
> | **②** le commit de clôture | Celui qui porte **cette ligne**. Il n'y a **pas de SHA écrit ici**, et ce n'est pas un oubli |
>
> **Comment le retrouver**, en une commande : `git log --grep="lot 5"`.
>
> ⛔ **Ce qui a été écarté** : enchaîner un second commit dont le seul objet serait d'inscrire le
> SHA du premier. Cela ferait deux enregistrements pour une seule idée, et le second aurait à son
> tour un SHA que rien ne citerait. **Un chantier de traçabilité ne se paie pas en bruit.**
>
> *(Rien d'exceptionnel par ailleurs : plusieurs chantiers de ce plan couvrent déjà plusieurs
> commits — voir **C-012** et ses trois PR.)*

---

> ⚠️ **Une session qui reprend ce chantier lit d'abord §13.1** *(pourquoi)* **puis §13.2**
> *(le principe)*. Les deux règles du §13.2 — **aucun remplacement de masse**, **une affirmation se
> vérifie à sa source** — sont ce qui a évité, à chaque lot, de détruire des traces historiques
> légitimes en croyant corriger une erreur.

---

## 14. 🛡️ CHANTIER CONFIANCE — cybersécurité et juridique de l'existant

> ⚡ **Ouvert par Romain le 2026-08-19, HORS du plan d'audit** — exactement comme la remise à niveau
> documentaire du **§13**. Il **n'a pas** de numéro `C-0XX`, et le §12 *(31 chantiers, 93 problèmes)*
> **reste inchangé** : ce chantier ne provient pas des huit domaines.
>
> 📕 **Sa source de vérité pour les textes officiels est [`REFERENTIELS.md`](REFERENTIELS.md).**
> Les fiches ci-dessous citent des identifiants `[Rn]`, `[On]`, `[RCn]` — ⛔ **jamais le contenu
> d'un texte** *(règle `CLAUDE.md` **§8 quinquies**)*.
>
> 🎯 **Décision fondatrice : [`DECISIONS.md`](DECISIONS.md) **D-038**.**

---

### 14.1 — ⭐ CE QUE CE CHANTIER PRÉPARE, ET CE QU'IL NE FAIT PAS SEMBLANT DE FAIRE

> ⚠️ **À lire avant toute fiche.** Sans cette section, chaque « obligation » ci-dessous se lit comme
> un manquement — alors que **presque toutes sont des préalables**.

| | Ce que c'est | Ce qui est vrai |
|---|---|---|
| 🔵 **ÉTAT ACTUEL** | Ce que Maxilou **est** | **Développement personnel**, mené par Romain **de sa propre initiative**. **Données fictives.** ⛔ **Aucune exploitation réelle n'a jamais eu lieu** |
| 🟡 **PRÉREQUIS AVANT UTILISATION RÉELLE** | Ce qu'on prépare dès maintenant | La quasi-totalité des étapes ci-dessous |
| ⛔ **DÉCISIONS FUTURES DES STRUCTURES** | Ce que ce chantier **ne peut pas décider** | Tout ce qui suppose qu'une structure ait tranché |

**Ce qui est établi, et vérifié dans ce dépôt** *(`ETAT.md` I-03 et I-04, levés le 2026-08-04 ·
`RAPPORT-AUDIT.md` §7)* :

- **le tournoi en base est fictif** — de vrais noms de clubs, des engagements inventés ;
- **le classeur ne contient aucune donnée personnelle de tiers** : les seules adresses présentes sont
  celles de Romain et de son épouse, saisies pour tester les envois ;
- **aucune journée réelle n'a jamais été jouée** avec cette application.

➡️ **D'où la phrase que `ETAT.md` porte depuis le 2026-08-04** :
> **« La question n'est donc pas "faut-il réparer", mais "faut-il préparer". »**

> ⛔ **INTERDICTION PERMANENTE.** L'École de Rugby du Racing Club de France et l'association
> Génération R92 **n'ont ni commandé, ni étudié, ni validé, ni adopté Maxilou**. ⚠️ **Aucune fiche,
> aucune session, aucun document ne doit leur attribuer une décision qu'elles n'ont pas prise**, ni
> présumer de leur adoption future : elles pourront accepter, demander des modifications, **ou ne
> pas souhaiter utiliser la solution**.

**Le parcours réel, et le jalon qui compte :**

```
 ① construire et fiabiliser  ← 🔵 NOUS SOMMES ICI (données fictives)
 ② atteindre un état jugé suffisamment propre
 ③ présenter à l'EDR et/ou à Génération R92    ⚠️ démonstration, données fictives
 ④ recueillir validation et retours            ⛔ elles peuvent refuser
 ⑤ implémenter les retours validés             (toujours données fictives)
 ⑥ retester
 ⑦ ⚠️ RECONTRÔLER LA CONFIANCE si les retours changent données, finalités, utilisateurs,
      accès, architecture ou services tiers
 ⑧ 🔴 JALON EXPLICITE : passage aux données réelles — jamais une conséquence automatique
```

⭐ **Il n'existe AUCUNE échéance** : ni date de tournoi réel, ni date de première invitation, ni date
de mise en production. **La priorité est la qualité, jamais la vitesse.**

---

### 14.2 — Les zones de confiance

Établies par la reconnaissance du 2026-08-19. Chaque fiche renvoie à une ou plusieurs zones.

| Zone | Ce qu'elle couvre |
|---|---|
| **Z1** | Le cadre juridique : responsable du traitement, contrat d'hébergement, information des personnes |
| **Z2** | La mesure de visibilité des partenaires |
| **Z3** | Les deux clés d'écriture partagées |
| **Z4** | La sortie brute des onglets `Equipes`, `Poules`, `Matchs`, `Historique` |
| **Z5** | Les polices d'écriture chargées chez un tiers |
| **Z6** | La configuration du dépôt GitHub |
| **Z7** | Les jetons de club |
| **Z8** | L'écart entre le dépôt et le code réellement en service *(déploiement manuel)* |
| **Z9** | Les usages de `innerHTML` dans le frontend — ⚠️ **NON VÉRIFIÉS** |
| **Z10** | Les images rendues publiques par lien dans Drive |
| **Z11** | **Sauvegarde et restauration — aucun mécanisme trouvé** |

---

### 14.3 — Les étapes, et leur trace

**Chaque fiche est la trace A de la chaîne de clôture** *(`CLAUDE.md` §8 quinquies)* : elle porte
les contrôles ① à ⑥. Les traces B, C et D suivent au moment de l'exécution.

> ⛔ **Aucune étape ne démarre sans instruction explicite de Romain** *(`CLAUDE.md` §12.3)*.

#### ✅ CF-0 — Vérification des référentiels · **TERMINÉE le 2026-08-19**

| | |
|---|---|
| **Objet** | Établir quels textes officiels s'appliquent réellement, et sous quelle qualification |
| **Résultat** | **18 sources primaires consultées** · **9 hypothèses corrigées** · **3 textes formellement écartés** *(NIS 2, Cyber Resilience Act, RGAA)* · **2 référentiels manquants trouvés** |
| **Livrable** | [`REFERENTIELS.md`](REFERENTIELS.md) |
| **Ce qu'elle a changé** | ⚡ **6 référentiels sur 15 étaient faux, périmés ou mal calibrés.** Sans cette étape, Maxilou aurait été corrigé contre des textes inexistants |

#### 🚧 CF-1 — Poser le cadre documentaire

| | |
|---|---|
| **Objet** | Créer la source unique, inscrire la règle, ouvrir le chantier dans le suivi |
| **Livrables** | `REFERENTIELS.md` · `CLAUDE.md` **§8 quinquies** et **§12.2** *(8 → 9 fichiers)* · ce **§14** · `ETAT.md` · `DECISIONS.md` **D-038** · `SESSIONS.md` |
| **Référentiel** | — *(étape de méthode)* |
| **Touche du code** | ❌ **Aucune ligne** |

#### 🚧 CF-2 — Déterminer le responsable du traitement · **dossier produit le 2026-08-19**

| | |
|---|---|
| **Référentiel** | **[R1]** art. 4(7), 4(8), 26, 29 · 🆕 **[R20]** *(CEPD, LD 07/2020)* · 🆕 **[R21]** *(fiche CNIL)* |
| **Exigences** | **[O1] [O2] [O5] [O7]** en dépendent pour leur **contenu** |
| **Constat** | Le critère légal est *« qui **détermine les finalités et les moyens** »* — jamais qui code ni qui saisit |
| **Nature** | ⛔ **DÉCISION ORGANISATIONNELLE** — hors de portée de ce chantier |
| ✅ **Livrable** | 📋 **[`CF-2-RESPONSABLE-TRAITEMENT.md`](CF-2-RESPONSABLE-TRAITEMENT.md)** — un dossier de décision présentable, en 9 sections : la question · pourquoi elle existe · **la frontière concevoir/administrer/saisir/décider** · les 3 configurations · **17 conséquences comparées** · les 4 rôles possibles de Romain · ce qui ne change pas · **11 questions pour trancher** · 🔲 **la case NON DÉCIDÉE** |
| ⭐ **Ce que [R20] et [R21] ont apporté** | **[R20]** : la distinction **moyens ESSENTIELS / NON ESSENTIELS**, où *« le choix d'un logiciel »* est **NON essentiel**. ⚠️ **[R21] en pose la limite** : *« même si un acteur choisit un traitement sur étagère, il peut être considéré comme responsable dès lors qu'il effectue ce choix au regard de ses besoins »*. ➡️ ⭐ **Concevoir ou choisir un logiciel ne suffit pas à soi seul ; décider de l'utiliser POUR SES FINALITÉS, si** |
| ⚠️ **Ce que [R21] a aussi tranché** | Le **développeur qui intervient sur les données pour la maintenance ou l'infogérance** est **sous-traitant** — alors que le simple fournisseur **sans accès** ne l'est pas. ⭐ **C'est l'ACCÈS et le CADRE qui départagent, jamais le métier** |
| ⚠️ **Un point de fait relevé** | Plusieurs **moyens essentiels** ont déjà été arrêtés pendant le développement *(quelles données, quelles durées, quels accès)*. ⛔ **Cela ne qualifie personne** — aucun traitement réel n'existe — mais ces choix **redeviendront des décisions** le jour venu. ✅ **Ils sont tous écrits, donc tous révisables** |
| ⚠️ **Question de fait ouverte** | ❓ **Quelle entité juridique porte l'École de Rugby ?** ⛔ **Ce n'est PAS un motif d'exclusion** : **[R1]** vise aussi *« le service ou un autre organisme »*, et **[R20]** pose qu'*« il n'existe aucune limitation quant au type d'entité »*. ⭐ **Mais il faut une entité capable de signer, d'ouvrir un compte et de répondre.** **INDÉTERMINÉ** — question **Q-I** |
| **Quand le présenter** | ⭐ **Au moment de la présentation de Maxilou (étape ③ du parcours)** — ⛔ **pas avant**. Les structures n'ont rien étudié : leur poser la question aujourd'hui serait leur demander de décider d'un logiciel qu'elles n'ont pas vu |
| ⚠️ **Non bloquant** | **Cette étape ne bloque PAS les travaux réalisables sans connaître l'entité.** CF-4, CF-5 et CF-6 se préparent **avec des champs à compléter** — c'est déjà la forme retenue par le chantier **C-005** |
| ⛔ **Ce que l'étape N'A PAS fait** | Aucune structure contactée · aucune option retenue · aucun compte créé · aucune démarche engagée · **la case du §9 reste vide** |

#### ⬜ CF-3 — L'architecture de compte institutionnelle

| | |
|---|---|
| **Référentiel** | **[R13]** *(CDPA)* · **[R14]** *(Workspace for Nonprofits)* |
| **Exigence** | **[O7]** — contrat de sous-traitance |
| **Constat** | Le compte actuel est un **Gmail personnel gratuit** : hors du champ du CDPA, donc **sans contrat de sous-traitance**. ⚠️ **Sans conséquence aujourd'hui** — aucune donnée de tiers n'est traitée |
| **Piste** | ⭐ **Google Workspace for Nonprofits, gratuit**, couvert par le CDPA. ⚠️ **L'éligibilité n'est pas acquise : elle se demande** |
| **Dépend de** | **CF-2** *(au nom de quelle structure ?)* |
| **Déjà écrit** | ⭐ La procédure de transfert existe **déjà**, pas à pas, dans [`../passation.md`](../passation.md) |
| ⛔ **Interdit à ce stade** | Créer un compte · engager une démarche d'éligibilité · migrer quoi que ce soit |

#### ⬜ CF-4 — Mentions légales

| | |
|---|---|
| **Référentiel** | **[R10]** — LCEN **art. 1-1**, en vigueur depuis le **23/05/2024** |
| **Exigence** | **[O5]** |
| **Constat** | Les pages **sont publiées** ; aucune mention légale n'existe dans ce dépôt |
| **Écart** | 🔴 **RÉEL ET ACTUEL — le seul de tout le chantier.** Cette obligation **ne dépend d'aucune donnée personnelle** : elle naît de la seule publication d'un service en ligne |
| **Piste proportionnée** | ⭐ L'édition étant aujourd'hui le fait d'une personne **à titre non professionnel**, l'art. 1-1 permet de **ne publier que le nom et l'adresse de l'hébergeur**, à condition d'avoir communiqué son identité à celui-ci. **À instruire** |
| **Dépend de** | Rien pour la forme minimale ; **CF-2** pour la forme « personne morale » |

#### ⬜ CF-5 — Information des personnes

| | |
|---|---|
| **Référentiel** | **[R1]** art. 13-14 · **[R6]** |
| **Exigence** | **[O1]** |
| **Constat** | 🟡 **PRÉREQUIS** — aucune personne à informer aujourd'hui. Les trois textes sont **rédigés** *(chantier **C-005**, [`../textes-information-donnees.md`](../textes-information-donnees.md))*, **non publiés**, avec leurs champs entre crochets |
| **Dépend de** | **CF-2** pour remplir les crochets — ⭐ **mais le travail de rédaction est déjà fait** |

#### ⬜ CF-6 — Registre des traitements

| | |
|---|---|
| **Référentiel** | **[R1]** art. 30 · **[R7]** |
| **Exigence** | **[O2]** |
| **Constat** | ⚠️ **L'exemption « moins de 250 personnes » ne joue pas** : elle tombe si le traitement *« n'est pas occasionnel »*, et le carnet des clubs serait **conservé d'une édition à l'autre** *(D-020)* |
| **Dépend de** | **CF-2** *(tenu par qui ?)* |

#### ⬜ CF-7 — La mesure de visibilité des partenaires

| | |
|---|---|
| **Référentiel** | **[R2]** art. 82 · **[R3]** · **[R5]** · **[R12]** |
| **Exigence** | **[O4]** |
| **Constat** | 🟡 **PRÉREQUIS** — fonction **désactivée** ; les relevés existants viennent des appareils de Romain. Grille **[R5]** : **4 conditions sur 7** tenues ; c'est **la finalité** qui bloque |
| **Valeur métier à conserver** | ⭐ **Décision de Romain, 2026-08-19** : fournir au partenaire une mesure **utile** de sa visibilité. ✅ **« Nombre de visites » peut remplacer « nombre de personnes »** si cela supprime la persistance sur le terminal — *« je préfère une mesure honnêtement qualifiée de visites »* |
| **Les 4 options à étudier** | **A** statu quo · ⭐ **B zéro persistance** *(tout en mémoire vive)* · **C** mesure serveur seule · **D** part calculée |
| **Pourquoi B mérite d'être étudiée d'abord** | Elle **ne supprime pas la fonctionnalité, seulement sa mémoire**. **[R2]** vise *« accéder à des informations **déjà stockées** »* ou *« **inscrire** des informations »* : une variable en mémoire de page n'est ni l'un ni l'autre ⇒ **hors champ**, donc plus d'exemption à démontrer. Et **[R12]** établit qu'Apps Script **ne voit ni l'IP ni les en-têtes** |
| **Ce qu'on perdrait** | La **portée par personne**. On dirait *« 4 h 20 d'affichage sur 512 visites »* au lieu de *« vu par 340 personnes »* |
| ⛔ **Réserve de Romain** | **L'étude et la démonstration formelle précèdent toute modification.** Aucune autorisation de toucher à l'implémentation |

#### ⬜ CF-8 — Les deux clés d'écriture

| | |
|---|---|
| **Référentiel** | **[R8]** — délibération CNIL 2022-100 |
| **Exigence** | **[RC2]** |
| **Constat** | Les deux clés sont **des mots choisis** *(R-019)*. Le garde-fou tolère environ 8 600 essais par jour |
| **Cadrage apporté par CF-0** | ⭐ Maxilou relève du **cas n° 2** : l'anti-force-brute existant **est** la mesure complémentaire attendue ⇒ le seuil est **50 bits**, non 80. ⚠️ **Limite du texte** : il ne traite **pas** le partage d'un secret **entre plusieurs personnes** |
| **Solution** | Remplacer les deux clés par des suites aléatoires — menu **« Tournoi R92 → Configurer les clés »** |
| **Effort** | ⭐ **Cinq minutes, à la main, par Romain. Aucune ligne de code** |

#### ⬜ CF-9 — Liste blanche des onglets exposés

| | |
|---|---|
| **Référentiel** | **[R1]** art. 32 |
| **Exigence** | **[O3]**, part préventive |
| **Constat** | `lireOngletSimple` renvoie **toutes les colonnes** sans filtre ; `Equipes`, `Poules`, `Matchs` et `Historique` sortent en entier, sans clé *(R-021, R-032)* |
| **Enjeu réel** | ⚠️ Moins ce qui sort aujourd'hui *(des nombres)* que ceci : **toute colonne ajoutée demain sera publique sans décision** |
| **Modèle à suivre** | ⭐ La doctrine **opt-in** déjà exemplaire de `CONFIG_PUBLIQUE_VUES` |
| **Touche du code** | ✅ **Backend + tests + redéploiement** |

#### ⬜ CF-10 — Sauvegarde et restauration

| | |
|---|---|
| **Référentiel** | **[R9]** |
| **Exigence** | **[RC3]** |
| **Constat** | ⚠️ **Aucun mécanisme de sauvegarde n'a été trouvé** — et la réinitialisation du tournoi est **irréversible** |
| **Nature attendue** | Probablement **documentaire** *(une procédure vérifiée)*, pas du code |

#### ⬜ CF-11 — Durcir GitHub, et retirer les bibliothèques inutilisées

| | |
|---|---|
| **Référentiel** | **[R15]** |
| **Constat** | Dépôt **public**, sans licence, `main` **non protégée**, secret scanning **désactivé**. Deux bibliothèques *(`docxtemplater`, `pizzip`)* ne sont **chargées par aucune page** mais restent publiées |
| **Nature** | 🟢 **Bonne pratique** — aucun texte ne l'impose |
| ⚠️ **Ce qu'il ne faut PAS faire** | **Activer Dependabot** : le projet n'a **aucun manifeste de dépendances**. **Ce serait une mesure de façade** |

#### ⬜ CF-12 — Durcissements de cohérence

| | |
|---|---|
| **Référentiel** | **[R16]** — OWASP ASVS **5.0.0** |
| **Contenu** | `no-referrer` sur `dossier-club.html` · politique de sécurité du contenu *(CSP)* · revue des usages de `innerHTML` |
| **Nature** | ⚪ **DURCISSEMENT VOLONTAIRE** — ⛔ aucun texte ne le demande |
| ⚠️ **Honnêteté requise** | Les navigateurs modernes n'envoient **déjà pas** la partie `?token=` vers un tiers : c'est de la **cohérence**, pas une correction. Et **[R16]** précise que **le niveau 1 ne prouve aucune conformité** |
| **Zone Z9** | ⚠️ **NON VÉRIFIÉE** — les usages de `innerHTML` n'ont **jamais** été relus un par un |

#### ⬜ CF-13 — Polices d'écriture auto-hébergées

| | |
|---|---|
| **Référentiel** | **[R11]** |
| **Nature** | ⚪ **DURCISSEMENT VOLONTAIRE** |
| ⚠️ **Requalification issue de CF-0** | ⛔ **Ce n'est PAS une mise en conformité.** Le transfert est **licite** : Google LLC est certifié au cadre d'adéquation. C'est un durcissement qui **supprime par avance un risque**, la décision d'adéquation ayant fait l'objet d'un **pourvoi** dont **l'issue est INCONNUE** — ⚠️ **[R11] impose de la vérifier sur CURIA AVANT d'ouvrir cette étape** |
| **Effet** | Supprime les 7 transferts d'un coup, sur les 7 pages concernées |

---

### 14.4 — Ordre et dépendances

> ⭐ **Le critère d'ordonnancement n'est pas la gravité, c'est le jalon** : *avant ou après le
> passage aux données réelles ?* ⚠️ **Et ce jalon n'a aucune date.**

| Bloc | Étapes | Pourquoi ce bloc |
|---|---|---|
| 🔴 **Avant tout passage aux données réelles** | CF-2 · CF-3 · CF-4 · CF-5 · CF-6 · CF-7 · CF-8 | Le cadre juridique et les secrets |
| 🟢 **Peut suivre** | CF-9 · CF-10 · CF-11 · CF-12 · CF-13 | Durcissements et prévention |

**Dépendances réelles** *(et elles sont peu nombreuses)* :

```
CF-1 ──▶ toutes les autres (le cadre)
CF-2 ──▶ CF-3   (au nom de quelle structure ?)
     └──▶ CF-4, CF-5, CF-6   ⚠️ pour le CONTENU seulement — la rédaction se prépare avant
CF-7, CF-8, CF-9, CF-10, CF-11, CF-12, CF-13 : ⭐ AUCUNE dépendance
```

> ⚠️ **Ce qui a changé par rapport à la première proposition du 2026-08-19**, et il faut le savoir :
> **CF-8 (les clés) était initialement la première étape.** La vérification a établi qu'**aucun
> compte n'a de données de tiers à protéger aujourd'hui** : le geste reste de cinq minutes, mais il
> **n'est plus le point de départ**. À l'inverse, **CF-4 (mentions légales) est remonté** — c'est
> le seul écart réel et actuel.
