# RISQUES ET PROBLÈMES IDENTIFIÉS — Tournoi R92

> Ce fichier recense **les problèmes constatés pendant les audits**.
> Il est le **registre de suivi** : un problème = une ligne, un statut, une trace.
> L'**explication** de chaque problème (pourquoi, exemple concret, ce qui est proposé) vit dans
> `AUDIT.md`. Ce fichier-ci **suit** ; `AUDIT.md` **explique**.

> 📕 **La vue d'ensemble des 88 problèmes** — leur répartition, leurs fils rouges, et ce qui s'est
> révélé **sain** — est dans [`RAPPORT-AUDIT.md`](RAPPORT-AUDIT.md). Ce registre-ci donne le
> **détail ligne à ligne** ; le rapport donne **le sens**.

**Dernière mise à jour** : 2026-08-06 (**ÉTAPE 4 — C-011 (PR #181) et C-013 (PR #182) validés, écrits, en attente de fusion**) · *2026-08-05 (**session 13 — ÉTAPE 3, volet ①*** : R-028, R-029, R-030 et R-041 ne sont **plus bloqués par une décision en attente** · ⚡ **addendums : R-089, R-090 et R-091 inscrits** — le tournoi suspendu / annulé (**D-030**), un réglage de pause ignoré sans le dire, et deux modes de pause qui coexistent (**D-032**))
**Audits réalisés** : 🏁 **les 8 domaines** — A (métier), C (sécurité), B (RGPD), D (QA / tests), E (UX / accessibilité), F (performance), G (architecture) et **H (qualité du code)**. **Aucun domaine ne reste à auditer.**
**Correction réalisée** : R-014 (le P0), par exception validée — voir D-016. ⚠️ Une de ses trois preuves est tombée en session 8, ✅ **et a été refaite correctement le jour même** (`589/589 OK` chez Google) — voir la note sous le tableau de synthèse, `AUDIT.md` §D.8 et **M-04**.

---

## 1. RÈGLE D'OR

> **Un problème n'est JAMAIS « corrigé » parce qu'une solution a été proposée.**

Statuts autorisés, dans l'ordre :

| Statut | Signification en langage simple |
|---|---|
| **IDENTIFIÉ** | On a vu le problème. Rien d'autre. |
| **PLANIFIÉ** | On sait comment on veut le corriger, et quand. |
| **VALIDÉ** | Romain a compris la correction proposée et a dit oui. |
| **EN COURS** | La correction est en train d'être écrite. |
| **CORRIGÉ** | Le code est modifié. **Ce n'est pas encore une preuve que ça marche.** |
| **TESTÉ** | Un test ou une vérification réelle prouve que c'est corrigé **et** que rien d'autre n'a cassé. |

Un problème ne peut être considéré comme réglé qu'au statut **TESTÉ**.

---

## 2. NIVEAUX DE PRIORITÉ

| Niveau | Nom | Définition |
|---|---|---|
| **P0** | BLOQUANT | Rend l'application inutilisable, perd ou corrompt des données, expose gravement des données personnelles, permet une compromission importante, **ou produit des résultats sportifs incorrects**. |
| **P1** | IMPORTANT | Doit être corrigé **avant une utilisation réelle** du logiciel. |
| **P2** | AMÉLIORATION | Utile, mais non bloquant. |
| **P3** | ROADMAP | Bonne idée à garder. **Ne pas implémenter maintenant.** |

> Un P2 ou un P3 ne doit **jamais** être traité automatiquement comme un P0.

---

## 3. NIVEAU DE CERTITUDE

Chaque constat porte obligatoirement un niveau de certitude (`CLAUDE.md` §9) :

- **CERTAIN** — constaté directement dans le code, ou vérifié par un test.
- **PROBABLE** — déduction technique, à vérifier.
- **INCONNU** — impossible à établir sans exécution, environnement ou donnée supplémentaire.

---

## 4. TABLEAU DE SYNTHÈSE

| Priorité | Identifiés | Planifiés | Validés | En cours | Corrigés | Testés |
|---|---|---|---|---|---|---|
| **P0** | 0 | 0 | 0 | 0 | 0 | ✅ **1** |
| P1 | **24** | 0 | **6** | 0 | 0 | 0 |
| P2 | **55** | 0 | **2** | 0 | 0 | 0 |
| P3 | **11** | 0 | 0 | 0 | 0 | 0 |

**Total : 91 problèmes** — **88 issus des 8 domaines d'audit** [domaine A (13) + domaine C (14) +
domaine B (13) + domaine D (10) + domaine E (10) + domaine F (11) + domaine G (10) + **domaine H
(7)**] **+ 3 ajoutés après la clôture de l'audit**, tous le **2026-08-05**, tous autour de **D-030** :

| Réf | Quoi | D'où il vient |
|---|---|---|
| ⚡ **R-089** (P1) | Tournoi suspendu / annulé pour force majeure | **Apporté par Romain** — connaissance du terrain |
| ⚡ **R-090** (P2) | Le champ « Pause déjeuner — durée » est ignoré en mode échelonné | **Trouvé en répondant à une question de Romain** |
| ⚡ **R-091** (P2) | Les deux modes de pause coexistent dans le même tournoi | **Trouvé en vérifiant** une règle posée par Romain (**D-032**) |

> 💡 **Ce que ces trois lignes disent de la méthode** : **les questions de Romain trouvent des
> défauts que huit domaines d'audit n'ont pas vus.** Deux des trois n'existent pas parce qu'on a
> relu du code, mais parce qu'on a **confronté le code à ce que l'organisateur croit qu'il fait**.

> ✅ **L'ÉTAPE 2 EST TERMINÉE : les 8 domaines sont audités** (session 12, 2026-08-05).

> ⚡ **Pourquoi 91 et non 88, et pourquoi les deux chiffres sont vrais.** **88** est le résultat de
> l'audit — il ne bougera plus, et c'est le chiffre de `RAPPORT-AUDIT.md`. **91** est l'état du
> **registre de suivi**, qui continue de vivre : **R-089, R-090 et R-091** n'ont été trouvés par
> aucun domaine. Confondre les deux, ce serait laisser croire que l'audit avait vu ce qu'il n'a pas
> vu — l'erreur exacte que **M-06** cherche à empêcher.

> ⚠️ **Le domaine H n'a produit NI P0 NI P1, et il faut dire pourquoi.** Un P0 supposerait un code
> qui **perd des données**, **fausse un résultat sportif** ou **rend l'application inutilisable** ;
> un P1, un défaut à corriger **avant toute utilisation réelle**. La raison de leur absence est
> **mesurée, pas supposée** : les règles écrites en double des deux côtés (**R-044**) ont été
> **exécutées côte à côte sur les mêmes entrées — 179 comparaisons, 0 écart**, dont le barème du
> classement et l'ordre de départage, **identiques au caractère près**. Aucun des 7 problèmes ne
> touche à la génération du planning, au calcul des scores ni au classement ; **six sur sept ne
> touchent aucune ligne exécutable** ou seulement du texte affiché.
>
> ⚠️ **Ce n'est pas un satisfecit** : le domaine H dit que le code est **bien écrit**, pas qu'il est
> **juste**. La justesse métier est le domaine A ; la preuve, le domaine D (**R-041** : rien ne
> vérifie les deux gestes qui décident du classement d'un tournoi).

> ⚠️ **Le domaine G n'a produit AUCUN P0, et il faut dire pourquoi.** Un P0 supposerait une
> architecture qui **fait perdre des données**, **fausse un résultat sportif** ou **rend
> l'application inutilisable**. Rien de tel : le cœur du calcul est isolé de Google, le classeur
> n'est ouvert qu'à **8 endroits**, et les 589 vérifications passent.
>
> **Ses deux P1 ne portent pas sur ce que l'application FAIT, mais sur ce que le projet RACONTE de
> lui-même** — la procédure de redéploiement (**R-072**) et la carte du projet (**R-073**). C'est
> une différence de **nature**, pas de gravité : un logiciel juste et mal décrit se répare ; un
> logiciel faux et bien décrit, non. Et **R-072 n'est pas théorique** : c'est le mécanisme exact
> qui a produit **M-04**.

> ⚠️➜✅ **UNE PREUVE DE R-014 EST TOMBÉE EN SESSION 8 — PUIS A ÉTÉ REFAITE LE JOUR MÊME.**
>
> La preuve n° 2 ci-dessous disait : *« 573/573 passent dans Apps Script, et le contrôle croisé
> confirme que les 16 vérifications de R-014 étaient du lot »*. **C'est faux, et c'est
> démontré** : les deux versions du fichier de tests ont été rejouées, celle d'avant la correction
> donne **exactement 573**, celle d'après en donne **589**. Le nombre 573 est donc le compte du
> fichier **sans** les 16 vérifications. Explication la plus probable (PROBABLE) : `Code.gs` a été
> recollé chez Google, **pas** `Tests.gs`.
>
> **Ce qui tient quand même — et se renforce** : ces 16 vérifications **passent**. Elles ont été
> exécutées en session 8 sur le code du dépôt, avec les 573 autres : **589/589, 0 échec**. La
> logique de la correction est donc **mieux** prouvée qu'avant, mais **pour une autre raison**
> que celle inscrite au dossier.
>
> ✅ **ET LA PREUVE A ÉTÉ REFAITE LE JOUR MÊME.** Romain a recollé `backend/Tests.gs` dans Apps
> Script et relancé `lancerTestsFFR` → **`R92 — 589/589 OK, 0 FAIL`**. Deux contrôles croisés sur
> la capture : le **nombre** (589 = le compte du fichier *après* la correction) et la **dernière
> ligne du fichier** (3711 = exactement le nombre de lignes de `backend/Tests.gs`). **I-17 levée,
> M-04 refermé**, et le statut TESTÉ de R-014 retrouve ses trois preuves.
>
> ⚠️ **Portée exacte de ce résultat** : les tests s'exécutent dans l'**éditeur** Apps Script, donc
> contre le `Code.gs` **enregistré dans le projet**. Ils ne prouvent pas à eux seuls que
> l'**adresse web publique** sert cette version (Apps Script permet de figer un déploiement sur
> une ancienne). **M-02 est fortement réduit, pas supprimé.** Détail : `AUDIT.md` §D.8.

> ✅ **R-014 est le premier problème du chantier à atteindre le statut TESTÉ**, le 2026-08-04.
> Trois preuves réunies, et c'est la raison pour laquelle ce statut est accordé :
>
> 1. **le code en service est bien le nouveau** — Romain a redéployé chez Google (lève **I-13**) ;
> 2. ~~**573 tests sur 573 passent** dans Apps Script, dont les **16 vérifications** ajoutées pour
>    cette correction~~ → ⚠️ **annulée en session 8** (573 = le compte du fichier **sans** ces 16)
>    → ✅ **REFAITE LE MÊME JOUR : `R92 — 589/589 OK, 0 FAIL` dans Apps Script.** Les 16
>    vérifications de R-014 ont bien tourné chez Google. **I-02 reste levée**, **I-17 levée**,
>    **M-04 refermé**. Voir l'encadré du §4 et `AUDIT.md` §D.8 ;
> 3. **la chaîne fonctionne toujours de bout en bout** — le diagnostic « Tester la remontée »
>    confirme écriture, relecture, et **109 relevés** présents dans le classeur. ⚠️ **Corrigé le
>    2026-08-05** : ils viennent des **appareils de Romain**, pas de spectateurs — la preuve tient
>    quand même, des relevés ont bien été écrits puis relus. C'est
>    la preuve de **non-régression** qui manquait : le plafonnement n'a rien cassé.
>
> ⚠️ **Ce qui reste NON VÉRIFIÉ, et qu'il faut dire** : le chemin de **refus** — ce qui se passe
> une fois un plafond franchi — n'est prouvé que par les tests unitaires. Personne n'a envoyé
> 30 001 relevés pour l'observer en vrai, et personne ne le fera. Le diagnostic ne peut pas non
> plus l'atteindre : il tire un identifiant d'appareil neuf à chaque essai, donc il ne consomme
> jamais le plafond par appareil — c'est voulu, il ne doit jamais se bloquer lui-même.

> ⚠️ **« Validé » signifie que la RÈGLE MÉTIER est tranchée par Romain — jamais que le code est
> écrit.** Les **5 problèmes P1 du domaine A** ont leur règle décidée (D-011 à D-014), ainsi que
> R-012 et R-013 (D-015). **Rien n'est corrigé. Aucun fichier de l'application n'a été modifié.**
>
> Le passage à **EN COURS** n'aura pas lieu avant la fin des 8 audits et la validation de
> l'ÉTAPE 4 (`CLAUDE.md` §7) — **sauf décision contraire de Romain sur R-014** (voir D-016,
> en attente dans `DECISIONS.md`).

> ⚠️ **Un seul problème est réglé : R-014**, au statut **TESTÉ**, par exception validée (D-016).
> Tous les autres sont au statut **IDENTIFIÉ** : ils ont été vus, rien de plus.
>
> Ce tableau couvre les **domaines A, C, B, D, E, F et G**. Le domaine **H (qualité du code)** n'a
> pas été audité : son absence de ligne ne signifie pas son absence de problème.

> ⚠️ **Le domaine E n'a produit AUCUN P0, et il faut dire pourquoi.** Un P0 supposerait une
> interface qui **fait perdre ou fausser des données**. Ce n'est pas le cas : les gestes
> destructeurs sont confirmés (28 confirmations dans l'administration, dont deux qui nomment le
> nombre exact de scores effacés), le double-clic est bloqué, et un score en cours de frappe
> n'est jamais écrasé. Les deux P1 portent sur ce que l'application **ne dit pas** à l'utilisateur,
> jamais sur ce qu'elle **fait**.

> ⚠️ **Le domaine B n'a produit AUCUN P0, et il faut dire pourquoi** — sinon le chiffre ne veut
> rien dire. Un P0 supposerait une **exposition grave** de données personnelles. Or le carnet
> d'adresses est exclu des données publiques, il exige la clé admin, le classeur est **privé**
> (I-06) — et surtout, **il ne contient aujourd'hui aucune donnée de tiers** (I-03, I-04). Les
> trois P1 sont à régler **avant la première invitation réelle** : c'est exactement la fenêtre
> dans laquelle se trouve le projet, et elle ne se rouvrira pas.

---

## 5. LISTE DES PROBLÈMES

> Explication détaillée de chacun : `AUDIT.md`, domaine correspondant.
> **Tous sont au statut IDENTIFIÉ** — vus, pas corrigés, pas planifiés.

### Domaine A — Métier (session 5)

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-001** | **Le forfait n'existe pas** : aucun état « équipe absente ». Un 0-0 donne 2 points à l'absent ; un score inventé fausse la différence, qui est un critère de départage | **P1** | CERTAIN | ✅ **VALIDÉ** — règle **et forme** fixées par **D-011 amendé** : un **bouton « Forfait » sous chaque équipe**, 3 points au présent / 0 à l'absent, **aucun score**, double mise en garde. Code **non écrit** | `AUDIT.md` §A.2 |
| **R-002** | **Un seul match du matin non saisi bloque l'après-midi de TOUTES les catégories** — le contrôle ne regarde pas la catégorie, et le message ne dit pas quels matchs manquent | **P1** | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.3 |
| **R-003** | **Aucun ajustement de planning une fois la journée lancée** : impossible de déplacer ou reporter un match. Les seuls outils sont refusés dès qu'un score existe, sauf « tout regénérer », qui efface les scores | **P1** | CERTAIN | ✅ **VALIDÉ** — solution fixée par **D-013** (déplacer un match · décaler toute la journée · le 3ᵉ niveau écarté). Code **non écrit** | `AUDIT.md` §A.4 |
| **R-004** | **Pas de départage au-delà du 3ᵉ critère** : deux équipes strictement à égalité sont classées dans l'ordre du tableur. Ce rang décide de la composition de l'après-midi | **P1** | CERTAIN | ✅ **VALIDÉ** — règle fixée par **D-014** (4ᵉ : confrontation directe · 5ᵉ : ordre alphabétique). Code **non écrit**, et **tests exigés d'abord** | `AUDIT.md` §A.5 |
| **R-005** | **Aucune borne haute sur un score** : 150 au lieu de 15 est accepté sans avertissement, des deux côtés. La différence étant un critère de départage, une faute de frappe fausse toute une poule | **P1** | CERTAIN | ✅ **VALIDÉ** — règle fixée par **D-012** (max 2 chiffres + confirmation avant validation). Code **non écrit** | `AUDIT.md` §A.6 |
| **R-006** | **Forcer le nombre de poules peut produire des poules de 2** (= match sec), ce que la règle des 3 équipes minimum vise à interdire. Le contrôle porte sur la catégorie, pas sur la poule | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.7 |
| **R-007** | **Une catégorie à 1 ou 2 équipes bloque tout le tournoi**, et le message n'indique pas le remède — contrairement au message voisin sur la durée de mi-temps, qui le donne | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.7 |
| **R-008** | **Une date de tournoi vide désactive silencieusement le gel des réponses à J-16.** Le choix est délibéré et documenté ; c'est le silence qui pose problème | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.7 |
| **R-009** | **Super Challenge phase 3 incomplet** — le code l'avertit lui-même (« socle multi-journées pas encore branché ») | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.7 |
| **R-010** | **Les deux interrupteurs de publication sont indépendants** : un tournoi publié montre le planning à qui a le lien public même si les clubs ne le voient pas. Volontaire, mais les libellés ne le disent pas | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.7 |
| **R-011** | **Un tirage ne peut être ni reproduit ni annulé** : aucune trace n'en est gardée. Sans conséquence aujourd'hui ; en aurait dans un usage multi-clubs | P3 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §A.8 |
| **R-012** | **Aucune règle sportive n'est écrite nulle part pour les clubs** : barème et départage n'existent que dans les commentaires du code. La ligne « Règlement » du dossier est un texte libre, et son champ **a été retiré de l'écran d'administration** — il n'existe donc aucun moyen de le remplir | P2 | CERTAIN | ✅ **VALIDÉ** — c'est l'exigence même posée par Romain dans **D-011** : « toutes les équipes doivent être informées de tout point de règlement ». Code **non écrit** | `AUDIT.md` §A.7 |
| **R-013** | **Aucun état « match annulé »** : l'orage, le terrain condamné, la journée écourtée ne peuvent pas être enregistrés. Ce n'est pas un forfait — personne n'est fautif | P2 | CERTAIN | ✅ **VALIDÉ** — solution fixée par **D-015** (même mécanisme que le forfait, libellé distinct ; ne compte pour personne). **Sous réserve d'une règle FFR contraire — voir I-10.** Code **non écrit** | `AUDIT.md` §A.7 |

| ⚡ **R-089** | **L'application ne sait pas gérer un tournoi INTERROMPU ou ANNULÉ.** L'orage, la foudre, le terrain condamné, l'incident de sécurité arrêtent **toute la journée d'un coup** — et rien dans l'application ne permet de le dire. Elle continue d'afficher un programme qui n'aura pas lieu : les matchs à venir restent saisissables, le match en cours n'est pas verrouillé, la page publique annonce des rencontres qui ne se joueront pas, et aucun bandeau n'explique quoi que ce soit aux familles. **Il n'existe aucun état au niveau du TOURNOI** — seulement, depuis D-015, un état au niveau du **match** | **P1** | CERTAIN | ✅ **SPÉCIFIÉ — D-030** *(décision de Romain, 2026-08-05)*. Implémentation en **ÉTAPE 3 volet ③**, **après** le lot ① des tests (D-025) et **après R-042**. ✅ **PLANIFIÉ le 2026-08-05** — découpée en **2 niveaux**, **3 fiches de chantier écrites** : **C-002** *(l'état et sa visibilité)*, **C-003** *(les scénarios de reprise — touche `calculerPlanning`)* et **C-004** *(rendre saisissable le repos minimal de la pause échelonnée)*. ✅ **I-21 levée** : l'adaptation du format et de la durée est **autorisée**, sous réserve du **temps de jeu maximal** et de **l'interdiction des phases finales**. ⚡ **Cadre de reprise fixé par Romain** (**D-030 §9**) : **6 contraintes / 8 leviers / 5 principes** — le moteur **cherche toutes les marges avant de conclure à l'impossibilité**, et **ne modifie jamais seul une valeur configurable** | `DECISIONS.md` **D-030** · `PLAN.md` **§6** |

> ⚡ **R-089 n'est PAS issu d'un audit — et il faut le dire, sinon le chiffre ment.** Les huit
> domaines ont produit **88** problèmes et l'ÉTAPE 2 est close. **R-089 a été inscrit après cette
> clôture**, le 2026-08-05, à la demande de Romain, qui a apporté un besoin de terrain que l'audit
> **n'avait pas vu**. Son numéro suit la série pour rester traçable ; sa **source** est différente.
>
> **Ce que ça illustre** : c'est exactement **M-05** — *l'audit photographie une application qui
> bouge*, et son périmètre fonctionnel bouge aussi. Le registre doit pouvoir grandir après la
> clôture, à condition de dire **d'où vient chaque ligne**.
>
> **Pourquoi P1 et pas P2** : le domaine A avait déjà établi son fil rouge — *« l'application est
> excellente **avant** le coup d'envoi et rigide **après** ; les cinq P1 apparaissent tous le jour J,
> quand la réalité s'écarte du plan »*. Un tournoi arrêté par la foudre est précisément ce cas, et
> il est **au moins aussi probable** qu'une égalité parfaite (R-004, P1). Ce n'est pas un P0 : rien
> n'est perdu ni faussé — l'application est simplement **muette** au moment où elle devrait parler.

| ⚡ **R-090** | **En pause méridienne échelonnée, le champ « Pause déjeuner — durée (min) » est ignoré sans le dire.** Le réglage existe dans l'écran *(`pause_dejeuner_duree_min`, défaut 60)* et **fonctionne en pause classique** — aucun match n'est placé dans la fenêtre. Mais pour les catégories en pause échelonnée, le code l'ignore *(il l'écrit lui-même : « sans pause déjeuner globale »)* et **force 60 minutes en dur**. Un organisateur peut donc régler **45 min** et voir **60** appliqué, **sans aucun avertissement** | **P2** | **CERTAIN** *(lu dans le code)* | ✅ **PLANIFIÉ** — chantier **C-004**, qui ajoute le champ manquant **et** referme cet écart | `PLAN.md` **C-004** |
| ⚡ **R-091** | **Les deux modes de pause méridienne coexistent dans le même tournoi.** La pause échelonnée est un réglage **global** ; une catégorie y est éligible **à partir de 4 équipes** ; en dessous, le code **bascule cette catégorie en pause classique** — avec un avertissement explicite. Le mélange est donc **délibéré**, mais **D-032 l'interdit désormais** | **P2** | **CERTAIN** *(lu dans le code)* | ✅ **SPÉCIFIÉ — D-032**, et **PLANIFIÉ** dans **C-004**. Comportement retenu : la petite catégorie **garde une pause, mais la sienne** *(durée = le repos minimal configuré)* ; la pause classique globale ne s'applique alors **nulle part** | `DECISIONS.md` **D-032** · `PLAN.md` **C-004** |

> ⚡ **R-090 et R-091 ne viennent pas de l'audit non plus.** Ils ont été trouvés le 2026-08-05 en
> instruisant **D-030** — l'un en répondant à une question de Romain sur ce que désignait le repos
> de 60 minutes, l'autre en vérifiant si les deux modes de pause pouvaient coexister. **Aucun des
> huit domaines ne les avait vus** : le domaine A n'a pas ouvert la pause méridienne, et le domaine
> H a cherché les commentaires faux, pas les **réglages sans effet**.
>
> 🔗 **Ils appartiennent pourtant tous deux au fil rouge du domaine H** — *ce n'est pas le code qui
> se trompe, c'est ce que le code raconte*. **R-090 en est même un cas plus grave que ceux du
> domaine H** : ce n'est pas un commentaire qui ment à un développeur, c'est **un écran qui ment à
> l'organisateur**.

### État des décisions métier

| Bloque | Question | État |
|---|---|---|
| R-001 | Quelle règle pour une équipe forfait ? | ✅ **Tranchée** — D-011 |
| ⚡ **R-089** | Que fait-on d'un tournoi suspendu ou annulé pour force majeure ? | ✅ **Tranchée** — **D-030**, décision **apportée par Romain**. ✅ **I-21 répondue** : l'adaptation du format et de la durée est autorisée, sous deux réserves. ⚠️ **I-10** (élargie) reste ouverte et primerait |
| R-005 | Quelle limite / quelle confirmation sur un score ? | ✅ **Tranchée** — D-012 |
| R-003 | Comment ajuster le planning en cours de journée ? | ✅ **Tranchée** — D-013 |
| R-004 | Quels critères de départage ajouter ? | ✅ **Tranchée** — D-014 |
| R-012 | Faut-il publier les règles sportives dans le dossier des clubs ? | ✅ **Acquise** — exigence posée dans D-011 |
| R-013 | Le match annulé (l'orage) | ✅ **Tranchée** — D-015, **par défaut** : une règle FFR primerait (I-10) |

**Toutes les décisions métier du domaine A sont prises**, R-089 comprise. Il ne reste aucune
question bloquante côté Romain ; seules des **questions sortantes** (**I-10 élargie** et **I-21**)
attendent une réponse de la Fédération.

### ⚠️ Questions sortantes — à porter au chantier FFR

Des questions de **règle du jeu** sont apparues et **ne peuvent pas être tranchées ici** (décision
D-003 : les deux chantiers restent séparés). `AUDIT-TOURNOI-R92.md` **ne contient rien** sur le
sujet — aucun de ses 25 points de vérification (Q11 → Q25) ne le couvre. C'est à Romain de les
porter. **Elles tiennent dans un seul courriel.**

> **I-10** *(élargie le 2026-08-05)* — *« La FFR encadre-t-elle le sort d'un match d'École de Rugby
> qui n'a pas pu se jouer — forfait d'une équipe, ou annulation pour intempéries ? **Et le sort
> d'un tournoi entier interrompu ou annulé pour force majeure ?** Existe-t-il une règle de
> classement imposée (points attribués, match à rejouer, match neutralisé, journée non
> classée) ? »*

> ~~⚡ **I-21**~~ — ✅ **RÉPONDUE le 2026-08-05** : *« En cas de force majeure, peut-on réduire le
> temps de jeu ? »* → **OUI. La reprise avec adaptation du format et de la durée est AUTORISÉE**,
> sous **deux réserves** : ⛔ **le temps de jeu maximal** doit être respecté · ⛔ **les phases
> finales sont interdites.** **Le niveau 2 de D-030 est débloqué** — fiche de chantier `PLAN.md`
> **C-003**.

**Destinataires suggérés** : Directeur EDR du Racing / Comité 92 — la même voie qui a résolu Q23.

**Impact si une règle existe** : **I-10** primerait sur D-011 (forfait), D-015 (match annulé) **et
D-030** (tournoi suspendu / annulé).

> ⚠️ **Ce que la réponse à I-21 a révélé au passage, et qui n'était pas la question posée** : la
> réserve *« sous réserve du temps de jeu maximal »* suppose un garde-fou qui **n'existe pas
> encore**. `plafond_joueur_min` est bien lu de `RefFFR_Temps` et **affiché** dans l'écran de
> conformité avec la mention « (sécurité) », mais **rien dans `calculerPlanning` ne refuse un
> planning qui le dépasse** *(constaté dans le code)*. Le respecter n'est donc pas un branchement :
> c'est un **contrôle à construire**. Inscrit dans la fiche **C-003**.

### Domaine C — Sécurité (session 6)

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-014** | **La seule écriture ouverte sans clé (`mesureSponsors`) n'avait aucune limite** : ni par appareil, ni par minute, ni par jour. Chaque envoi ajoutait une ligne au classeur, rien ne les efface, et l'adresse du serveur est publique. Permettait de saturer le classeur (10 M de cases) et les exécutions simultanées — donc de **bloquer la saisie des scores le jour J** | **P0** | **CERTAIN** (absence de limite constatée) · **PROBABLE** (conséquences chiffrées : plafonds Google non testés) | ✅ **TESTÉ** (2026-08-04) — corrigé par D-016 (commit `c1948fc`), **redéployé chez Google**, **573/573 tests OK** dans Apps Script et **chaîne vérifiée de bout en bout** par le diagnostic « Tester la remontée » (écriture, relecture, 109 relevés — venant des appareils de Romain, précision du 2026-08-05). ⚠️ **Réserve** : le chemin de REFUS (que se passe-t-il une fois un plafond franchi ?) n'a été prouvé que par les tests unitaires, jamais observé en production | `AUDIT.md` §C.2 |
| **R-015** | **Regénérer les poules efface tous les scores, et le serveur ne vérifie jamais s'il y en a.** Le garde-fou (double confirmation + re-saisie de la clé) vit **uniquement dans le navigateur** — alors que « réorganiser les poules » refuse, lui, côté serveur | **P1** | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.3 |
| **R-016** | **La réinitialisation efface tout dès réception de la clé admin** : équipes, poules, matchs, catégories, horaires, contacts, dossier, et met affiche et photo de parking à la corbeille. Aucune confirmation serveur, aucune sauvegarde, aucun retour en arrière | **P1** | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.4 |
| **R-017** | **Deux mots de passe partagés, aucune notion de personne** : impossible de retirer l'accès à quelqu'un, aucune trace de l'auteur d'un score dans l'`Historique`, et un score validé peut être réécrit par toute personne ayant la clé SCORES. Une contestation est **inarbitrable** | **P1** | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.5 |
| **R-018** | **Les liens personnels des clubs sont des passe-partout permanents** : jamais expirés, transportés dans l'adresse de la page, transférables par simple renvoi de courriel. Ils ouvrent les **téléphones du référent et du responsable sécurité**. Aucune trace d'utilisation | **P1** | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.6 |
| **R-019** | **Garde-fou anti-devinette global et faible** : 30 échecs / 5 min, compteur non prolongé une fois le seuil atteint (≈ 8 600 essais/jour), mémoire non fiable à 100 %. ⚠️ **Requalifié P2 → P1 le 2026-08-04** : Romain a précisé que **les deux clés sont des mots qu'il a choisis** (I-12 levée). 8 600 essais/jour ne cassent jamais une suite aléatoire, mais peuvent casser des mots — et la clé ADMIN ouvre **tout** | **P1** *(était P2)* | CERTAIN | IDENTIFIÉ · **remède immédiat sans code** : remplacer les deux clés par des suites aléatoires (**D-017**, en attente de Romain). Redeviendra P2 dès que ce sera fait | `AUDIT.md` §C.7 |
| **R-020** | **Le contenu des courriels est fabriqué par le navigateur** et expédié tel quel sous l'identité Gmail du propriétaire. Le destinataire, lui, est toujours relu dans le classeur (bon point) — mais le message peut dire n'importe quoi | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.7 |
| **R-021** | **`Equipes`, `Poules`, `Matchs`, `Historique` sortent en entier, sans clé et sans liste blanche.** Rien de personnel aujourd'hui ; une colonne ajoutée demain serait publique **sans décision** | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.7 |
| **R-022** | **`admin.html` et `saisie.html` sont publics et indexables** — alors que les trois pages à jeton portent bien « ne pas indexer ». Ce n'est pas une protection manquante, c'est une exposition inutile | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.7 |
| **R-023** | **Aucune trace de qui consulte le carnet d'adresses**, qui se lit en une seule requête (emails **et** jetons compris). Ce que garde le journal Google est **INCONNU** (I-09) | P2 | CERTAIN (côté application) | IDENTIFIÉ | `AUDIT.md` §C.7 |
| **R-024** | **Quatre bibliothèques extérieures sans version, sans origine, sans empreinte** (`pdf-lib`, `docxtemplater`, `pizzip`, `qrcode`, ~750 Ko). Hébergées localement (bon point), mais **impossible de savoir si une faille publiée les concerne** | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.7 |
| **R-025** | **Toute la confidentialité tient au réglage de partage du classeur**, qu'aucun code ne protège — l'identifiant, lui, est public dans le dépôt. Le classeur est bien privé aujourd'hui (I-06) | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.7 |
| **R-026** | **Aucune politique de sécurité du contenu (CSP)** : rien ne limiterait les dégâts si un texte piégé passait un jour entre les mailles | P3 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.8 |
| **R-027** | **Les briques d'automatisation GitHub sont épinglées par étiquette mobile** (`@v4`, `@v5`) et non par empreinte figée. Droits accordés minimaux et corrects | P3 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.8 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine C)

À porter au crédit du code — et à ne pas casser en corrigeant le reste :

| Point vérifié | Résultat |
|---|---|
| Mots de passe dans l'historique Git | ✅ **Aucun** — historique **complet** relu (513 enregistrements, dépôt dé-tronqué pour l'occasion) |
| Injection de formule dans le classeur | ✅ Format « texte » forcé avant écriture, ~30 endroits |
| Texte piégé dans les pages (XSS) | ✅ Échappement systématique, des deux côtés — **aucun oubli trouvé** (vérification par sondage, pas exhaustive) |
| Liens des partenaires | ✅ Bornés à `http(s)://` — un lien piégé est refusé ; couleurs validées en hexadécimal |
| Détournement de destinataire d'un courriel | ✅ Impossible — l'adresse est **toujours relue dans le classeur** |
| Dépôt d'images | ✅ Liste blanche de formats + plafond 5 Mo, contrôlés avant écriture |
| Relevés des partenaires | ✅ Entièrement revalidés (format des identifiants, bornes de tous les compteurs) |
| Cloisonnement entre clubs | ✅ Un jeton n'ouvre que la fiche de son club ; **aucun email de club n'est jamais renvoyé** |
| Jetons des clubs | ✅ Vrais identifiants aléatoires (`Utilities.getUuid()`) |
| Messages d'erreur | ✅ Génériques côté visiteur, détail journalisé côté serveur |

### Domaine B — RGPD / Protection des données (session 7)

> ⚠️ **Aucune conformité juridique n'est prononcée ici, ni ailleurs** (`CLAUDE.md` §6.B). Ces
> lignes décrivent des **risques** et des **mesures techniques**, jamais un verdict de légalité.

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-028** | **Personne n'est jamais informé de rien** : aucune page, aucun courriel, aucune ligne du serveur ne dit qui détient ces informations, pourquoi, combien de temps, ni comment demander leur retrait. Recherche des mots *RGPD / confidentialité / données personnelles / mentions légales / consentement* : **zéro occurrence** dans tout le dépôt applicatif | **P1** | CERTAIN | IDENTIFIÉ · ✅ **D-018 TRANCHÉE (session 13)** — la rédaction des trois textes est autorisée. ⚡ **I-16 levée le même jour** : le site vitrine porte **déjà** une page RGPD, qui **nomme le responsable** (*Génération R92*) et **l'adresse de contact** (*generationr92@gmail.com*) — les deux informations qui bloquaient. Le remède devient une **section « Tournoi » à ajouter**, pas une page à créer. ⚠️ **Le problème reste entier** : cette page ne dit **rien** du tournoi (ni clubs, ni contacts, ni effectifs, ni mesure de visibilité). **Seul le coût de correction a baissé** | `AUDIT.md` §B.2 |
| **R-029** | **La mesure de visibilité des partenaires écrit sur le téléphone de chaque spectateur et remonte au serveur, sans information ni choix** : identifiant d'appareil rangé en mémoire longue, temps d'exposition par tranche de 30 min, envoi à 20 s puis toutes les 10 min puis à la fermeture | **P1** | **CERTAIN** (fonctionnement) · **PROBABLE** (appréciation juridique) | IDENTIFIÉ · **SUSPENDU le 2026-08-05** : Romain a **désactivé les partenaires** depuis l'écran Partenaires, ce qui **coupe la mesure** (vérifié dans le code : `tournoi.js` sort avant `sponsorsArmerEnvoi()` si `sponsors_actifs` est faux ; `dossier.js` n'affiche aucun logo). Les 109 relevés déjà présents venaient de **ses propres appareils**, pas de spectateurs. ⚠️ **Le problème n'est pas réglé : il se rallume avec l'interrupteur.** Reste **P1** — à traiter **avant de rallumer**. ✅ **D-019 TRANCHÉE (session 13) : voie (a)** — informer, **sans bandeau**, avec un moyen simple de dire non (une ligne en bas de la page publique + l'explication dans la section « Tournoi » de la page RGPD + un refus mémorisé sur l'appareil). Seule voie de contournement connue : l'adresse `?demo=sponsors`, qui force l'affichage et donc la mesure | `AUDIT.md` §B.3 |
| **R-030** | **Aucune durée de conservation, aucune purge, nulle part.** Le carnet d'adresses est conservé **délibérément** d'une édition à l'autre, les copies de courriels restent dans Gmail, les contacts FFR et les effectifs passés traversent les réinitialisations. Rien n'expire | **P1** | CERTAIN | IDENTIFIÉ · ✅ **D-020 TRANCHÉE (session 13)** — le **tableau des 7 durées est adopté tel quel** (carnet des clubs = 3 éditions · effectifs = effacés à la réinitialisation · contacts FFR = 1 an · champ « équipes étrangères » = effacé après envoi · relevés de visibilité = effacés après remise de la fiche · `Historique` = conservé · courriels Gmail = 1 an). Met **R-031, R-033, R-034** en ordre de marche. ⚠️ **Aucun effacement automatique** : toute suppression restera **déclenchée par un humain** | `AUDIT.md` §B.4 |
| **R-031** | **Le droit d'effacement est partiel et parfois bloqué** : `supprimerClubInvite` est **refusé** tant qu'une équipe du club figure dans un match, il n'existe aucun moyen d'effacer le seul contact en gardant le club, et les copies Gmail restent hors de portée | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-032** | **Les effectifs d'enfants (`nb_joueurs`, `nb_educateurs`) sortent sans aucune clé**, et surtout : toute colonne ajoutée demain à ces onglets sera publique **sans décision**. Se referme en traitant **R-021** | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-033** | **La réinitialisation conserve des données personnelles sans raison écrite** : `detail_effectifs` et le total d'éducateurs de l'édition passée, et **tous** les contacts de la demande FFR — représentant, président, **médecin**, antenne de secours | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-034** | **Un champ libre invite explicitement à saisir noms, prénoms et dates de naissance d'enfants** (« équipes étrangères »). Seul endroit de l'application où un mineur cesse d'être un nombre. Sans durée, sans effacement, sans information des familles | P2 → **P1 le jour où il sert** | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-035** | **Toute image déposée est rendue publique en lecture et ne disparaît pas vraiment** (corbeille Drive ~30 j, I-08). Rien n'avertit qu'une photo de parking peut montrer plaques et visages — le code contrôle format et poids, jamais le contenu | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-036** | **Le droit à l'image n'est plus outillé** : le modèle `autorisation-droit-image-template.docx` reste dans le dépôt, plus rien ne le charge depuis le **retrait décidé par le club** le 2026-08-03. Rien n'écrit ce qui l'a remplacé | P2 | CERTAIN | IDENTIFIÉ · **question au club (I-15)** | `AUDIT.md` §B.5 |
| **R-037** | **Les polices d'écriture sont chargées depuis les serveurs de Google sur les 7 pages** : l'adresse réseau de chaque visiteur y est transmise sans que rien ne le dise. Gain réel mais **modeste** (le serveur est déjà chez Google) | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-038** | **L'adresse du contact d'invitation est servie en clair par le serveur à qui la demande** (liste blanche publique). Volontaire et nécessaire ; le téléphone, lui, a bien été retiré. Risque : aspiration et spam sur l'adresse **personnelle** d'un bénévole | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-039** | **Aucun cadre écrit** : ni responsable désigné, ni registre des traitements, ni conduite à tenir en cas de fuite — et **aucune trace** pour en détecter une (**R-023**). Le classeur, le Drive et la boîte d'envoi vivent dans un **compte Google individuel** : sujet de continuité autant que de responsabilité | P2 | CERTAIN (côté dépôt) | IDENTIFIÉ | `AUDIT.md` §B.5 |
| **R-040** | **Le multi-clubs (SaaS) changera la nature du sujet** : contrat écrit, cloisonnement étanche, restitution des données. Le mot de passe partagé (R-017) et le carnet unique ne tiendront pas | P3 | CERTAIN | IDENTIFIÉ — **ne rien implémenter maintenant** | `AUDIT.md` §B.6 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine B)

À porter au crédit du code — et à ne pas casser en corrigeant le reste :

| Point vérifié | Résultat |
|---|---|
| **Identité des enfants** | ✅ **Aucune, nulle part** — pas un nom, pas une date de naissance, pas une licence dans tout le dépôt. Les mineurs sont **trois nombres**. C'est la protection la plus forte de l'application |
| Emails des clubs | ✅ **Jamais renvoyés à personne**, pas même au club concerné |
| Envoi groupé | ✅ **Un courriel par club** — les clubs ne découvrent pas les adresses les uns des autres |
| Téléphone du contact public | ✅ **Retiré volontairement** de la liste blanche publique, avec la raison écrite |
| Carnet d'adresses | ✅ Exclu des données publiques **et** derrière la clé admin, lue par un chemin qui ne laisse pas la clé dans l'historique du navigateur |
| Liens personnels des clubs | ✅ Retirés de la barre d'adresse dès l'ouverture, rangés dans une mémoire vidée à la fermeture de l'onglet |
| Cookies et traceurs | ✅ **Aucun cookie, aucun traceur tiers, aucun outil de mesure d'audience extérieur** |
| Identifiants de la mesure partenaires | ✅ Aléatoires, **renouvelés chaque jour**, aucun suivi d'un site à l'autre |
| Documents produits (PDF, dossier) | ✅ Fabriqués **entièrement sur l'appareil** — aucune donnée vers un service tiers |
| Relais Cloudflare | ✅ Éteint ; et même rallumé, il ne recopierait que l'instantané public, sans donnée personnelle |

### Domaine D — QA / Tests (session 8)

> ⚠️ **Ce domaine ne dit pas où le code casse. Il dit où personne ne regarde.** L'absence de test
> ne prouve aucun défaut — et n'en écarte aucun.

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-041** | **Le calcul qui décide du vainqueur n'est vérifié par aucun test.** `enregistrerResultat` et `calculerClassement` ne sont **jamais exécutés** ; `comparerClassement` l'est **par accident** (au passage d'un test qui vérifie autre chose). Et **sur 589 vérifications, aucune ne met à l'épreuve le 2ᵉ critère de départage (la différence) ni le 3ᵉ (les points marqués)** : le seul endroit du fichier de tests qui fabrique des statistiques met toujours `diff: 0, bp: 0`. Or **D-014 va modifier ce code** | **P1** | **CERTAIN** (mesuré par exécution instrumentée) | ⚙️ **EN COURS** — ✅ **chantier C-011 VALIDÉ par Romain le 2026-08-06**, écrit et poussé : **5 tests, 27 vérifications**, **`R92 — 616/616 OK, 0 FAIL`** vérifié hors d'Apps Script · **PR #181 ouverte** · ⚠️ passera **CORRIGÉ** à la fusion, **TESTÉ** seulement quand Romain aura relancé `lancerTestsFFR` **chez Google** · préalable de D-014 et D-011 · ✅ **D-025 TRANCHÉE (session 13)** : c'est le **lot ①**, le premier chantier de code du chantier, et il est écrit **AVANT** la correction du départage — pas après | `AUDIT.md` §D.2 |
| **R-042** | **L'enregistrement d'un score n'est vérifié par aucun test.** `enregistrerScore` — le geste le plus répété de la journée — n'est **jamais exécuté** par le harnais, alors qu'il porte **six garde-fous** (Coupe en attente · score déjà validé · vainqueur obligatoire en élimination · correction en cascade · score détaillé · archivage). Seul chantier du domaine qui demande de **séparer le cœur de l'écriture** | **P1** | CERTAIN | IDENTIFIÉ — **préalable de D-012 et D-015** | `AUDIT.md` §D.3 |
| **R-043** | **Les 17 712 lignes du navigateur n'ont aucun test, et rien ne les empêche d'être publiées.** 26 fichiers JS, aucun outil de test, aucun `package.json` — et `.github/workflows/pages.yml` publie `frontend/` sur Internet **à chaque envoi sur `main`**, sans lancer quoi que ce soit, **pas même un contrôle de syntaxe**. C'est le seul chemin vers la production sans aucun contrôle. Il porte le classement public, le podium et la page de saisie | **P1** | CERTAIN | ⚙️ **EN COURS — moitié (a) FAITE ET PROUVÉE** : chantier **C-013** validé le 2026-08-06, **PR #182**. Le workflow porte un travail `verifier` dont `deploy` dépend (`needs`). **Preuves réelles dans GitHub** : branche cassée → contrôle **failure**, publication **skipped** *(#183, fermée sans fusion)* · branche saine → **« 30 fichiers JavaScript vérifiés, aucun cassé »**, contrôle **success**. ⚠️ **Le verrou lui-même n'est prouvé que par construction** : sur une proposition de fusion, `deploy` est neutralisé de toute façon — il sera observé au **premier envoi réel sur `main`**. · **(b)** harnais navigateur : **toujours à planifier**, hors périmètre de C-013 | `AUDIT.md` §D.4 |
| **R-044** | **La même règle métier est écrite deux fois, et rien ne vérifie qu'elles disent la même chose.** **29 mentions de « miroir »** dans le frontend, dont le **barème et le départage** (`comparerClassement` côté serveur / `comparer` côté navigateur) — non testés des deux côtés. Le serveur **génère l'après-midi**, le navigateur **affiche au public** : une divergence rend les deux écrans faux **sans que ni l'un ni l'autre ne paraisse anormal** | **P1** | CERTAIN | IDENTIFIÉ — dépend de **R-043 (b)** | `AUDIT.md` §D.5 |
| **R-045** | **Aucun scénario ne rejoue une journée de bout en bout.** Les 589 vérifications portent sur des morceaux isolés ; rien n'enchaîne création → génération → saisie → classement → après-midi. Or les pannes réelles vivent **entre** les morceaux — c'est exactement là que se trouvent R-002 et R-015 | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §D.6 |
| **R-046** | **Tout ce qui écrit dans le classeur est hors de portée du harnais** : **110 des 277 fonctions** reçoivent le classeur en premier paramètre. C'est un **plafond structurel**, pas une négligence. La réponse n'est pas de les tester, c'est qu'elles contiennent le moins de décisions possible | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §D.6 |
| **R-047** | **Le refus des équipes en double n'existe que dans le navigateur** (`admin-equipes.js`). Le serveur (`ajouterEquipe`) vérifie seulement que le nom n'est pas vide. Même schéma que R-015 / R-016 — et il existe un autre chemin de création : `creerEquipesClub`, déclenché par la réponse d'un club | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §D.6 |
| **R-048** | **Un envoi qui n'aboutit pas fige le bouton indéfiniment** : les lectures (`apiGet`) acceptent un délai maximum, **les écritures (`apiPost`) n'en ont aucun**. Sur une 4G qui décroche sans couper, le bouton reste sur « Enregistrement… », désactivé, sans message. Cas « perte de connexion » de `CLAUDE.md` §6.D — le plus probable, un tournoi se joue dehors | P2 | CERTAIN | IDENTIFIÉ — ✅ le **double envoi**, lui, est sans danger (garde-fou « déjà validé ») | `AUDIT.md` §D.6 |
| **R-049** | **La documentation annonce un test qui n'existe pas** : `docs/sponsors.md` affirme *« Un test compare les deux rendus ligne pour ligne »*. Ce test n'existe **nulle part** (la constante citée n'apparaît dans aucun test). Une documentation qui annonce une preuve inexistante est **pire que muette** : elle décourage la vérification | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §D.6 |
| **R-050** | **Rien n'empêche une nouvelle fonction d'arriver sans test** : aucune mesure de couverture suivie, aucune règle. Le harnais grandit parce que quelqu'un y pense. Ça tient aujourd'hui ; ça ne tiendra pas en multi-clubs (R-040) | P3 | CERTAIN | IDENTIFIÉ — **ne rien imposer maintenant** | `AUDIT.md` §D.7 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine D)

À porter au crédit du projet — et à ne pas casser :

| Point vérifié | Résultat |
|---|---|
| **Le harnais est réel et entretenu** | ✅ `backend/Tests.gs` : 3 711 lignes, **278 tests, 589 vérifications, 0 échec**. Il a grandi de la session 5 à la session 28 |
| **✅ Les tests tournent HORS de Google** | ✅ **Démontré en session 8** : `Code.gs` + `Tests.gs` chargés dans un exécuteur JavaScript ordinaire, avec **une vingtaine de lignes de doublures** → `589/589 OK` en ~1 seconde. **M-03 était surestimé** : les tests n'étaient pas prisonniers de Google, seulement **écrits pour** Google |
| Conception des tests | ✅ « Cœur pur » : données injectées, aucun accès au classeur. C'est la bonne méthode |
| Reproductibilité | ✅ Le tirage au sort est un **interrupteur** (`melange`) que les tests mettent à « non » — aucun test ne dépend du hasard |
| **Prudence par construction** | ✅ Plusieurs tests vérifient qu'un format **inventé de toutes pièces** retombe sur le chemin prudent. On teste ce que le code fait **quand il ne sait pas** — c'est rare |
| **Écritures simultanées** | ✅ Un **verrou** (`LockService`, 20 s) sérialise toutes les écritures. Le risque « concurrence » de `CLAUDE.md` §6.D est **traité** |
| Double-clic sur la saisie | ✅ Bouton désactivé pendant l'envoi, réactivé dans tous les cas (`finally`) |
| Piège du « é » décomposé (NFD) | ✅ Neutralisé des deux côtés (`estTermineServeur` / `estTermine`) |
| Barème documenté | ✅ `docs/regles-classement.md` est une vraie spécification — et **dit lui-même** qu'il n'existe pas de 4ᵉ critère de départage |
| **85 fonctions pures non testées** | ✅ **Bonne nouvelle** : pour elles, l'obstacle n'est **pas** technique. Rien à refactorer, rien à installer — il n'y a qu'à écrire les tests (dont `comparerClassement`, `enregistrerResultat`, `validerScore`) |

### Couverture mesurée (domaine D)

> Chiffres obtenus **par exécution instrumentée** du harnais, pas par estimation.

| Mesure | Valeur |
|---|---|
| Fonctions déclarées dans `backend/Code.gs` | **277** |
| Fonctions **réellement traversées** au moins une fois par les tests | **104 — soit 38 %** |
| Fonctions **jamais exécutées** | **173** |
| Fonctions recevant le classeur en 1ᵉʳ paramètre (hors de portée par construction) | **110** |
| Fonctions **pures et non testées** (testables aujourd'hui, sans rien changer) | **85** |
| Lignes de JavaScript dans le navigateur | **17 712** — **0 test** |

> ⚠️ **Ce chiffre de 38 % n'est pas comparable à une « couverture » standard** : il compte les
> fonctions **traversées**, pas les lignes ni les situations. La couverture des **cas** est plus
> basse — `comparerClassement` est traversée, et pourtant deux de ses trois critères ne sont
> jamais éprouvés.

### Domaine E — UX / UI / Accessibilité (session 9)

> **Méthode** : les écrans ont été **réellement ouverts dans un navigateur**, sur une copie de
> travail hors du dépôt alimentée par un faux serveur, aux tailles 375 × 812 (téléphone),
> 320 × 568 (vieux téléphone) et 1280 × 800 (ordinateur). Les tailles et les contrastes sont
> **mesurés**, pas estimés. Détail et captures : `AUDIT.md` §E.

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-051** | **Le bouton « Rafraîchir » de la saisie échoue en SILENCE COMPLET** : réseau coupé → le bouton revient à la normale, l'heure « Mis à jour à… » ne bouge pas, **aucun message**. Le bénévole croit voir l'état réel du tournoi ; il voit une photographie périmée. Le code le dit : `catch (err) { // On garde l'affichage actuel }`. Une erreur qui **se fait passer pour un succès** | **P1** | **CERTAIN** (reproduit dans le navigateur, réseau coupé) | IDENTIFIÉ | `AUDIT.md` §E.3 |
| **R-052** | **Un échec affiche un message technique, souvent en anglais** : validation d'un score sans réseau → le bénévole lit **« Failed to fetch »**. Aucune indication de ce qu'il doit faire, ni si son score est passé. **38 endroits** du frontend affichent ainsi le message brut de l'erreur. ✅ L'état reste sain (score conservé, bouton réactivé) : seul le **dire** est en cause | **P1** | **CERTAIN** (reproduit) | IDENTIFIÉ — à corriger **d'abord sur la page de saisie** | `AUDIT.md` §E.4 |
| **R-053** | **Le bouton « Valider » ne montre rien pendant l'envoi** : mesuré 1 s après le clic sur un envoi de 4 s → texte inchangé (« Valider »), grisé à 60 %, **aucun message, aucun indicateur**. Or « Rafraîchir » affiche « ⏳ … » et l'administration affiche « Génération… », « Réinitialisation… ». **Le geste le plus répété de la journée est le seul à se taire** | P2 | CERTAIN | IDENTIFIÉ — remède : 2 lignes | `AUDIT.md` §E.5 |
| **R-054** | **Cibles tactiles trop petites sur la saisie simple** : bouton « Valider » **85 × 35 px**, champ de score **72 × 36 px**, menu catégorie 38 px, titre de phase 29 px — pour une cible visée de 44 px. **Alors que la saisie détaillée U14 fait exactement 44 × 44**, avec le commentaire *« grande cible tactile (44px), lisibles sous la pluie »*. La règle est connue du projet ; elle n'a pas été propagée à l'écran le plus utilisé | P2 | CERTAIN (mesuré) | IDENTIFIÉ | `AUDIT.md` §E.5 |
| **R-055** | **Sur la page publique, l'information la plus utile est la moins lisible** : « 09:00 · Terrain 1 · Poule A » à **2,81** de contraste (4,5 exigé), « à venir » à 2,81. C'est précisément ce qu'un parent vient chercher, lu dehors au soleil. Balayage : 46 textes mesurés, **8 sous la norme**. Cas à part : le **bleu d'accent** (blanc sur `#2E8FE0` / `#3E8FD6`) est à **3,43** — il touche **tous les boutons principaux** de l'application. Choix de charte, corrigeable en fonçant le bleu | P2 | CERTAIN (mesuré + revérifié au calcul) | IDENTIFIÉ | `AUDIT.md` §E.5 |
| **R-056** | **La zone de dépôt d'image est INVISIBLE — blanc sur blanc.** « Glisse ton affiche ici » : texte `rgb(255,255,255)` sur fond `rgb(255,255,255)` = contraste **1,00**, soit exactement la même couleur. Sous-titre à 1,49. **3 endroits** (affiche, photo de parking, logo partenaire). Cause : composant dessiné pour le thème **sombre**, resté tel quel quand l'administration est passée au thème **clair** — le piège des deux feuilles de style. C'est un **bug**, pas une préférence | P2 | **CERTAIN** (couleurs calculées relevées dans le navigateur + capture) | IDENTIFIÉ | `AUDIT.md` §E.5 |
| **R-057** | **Rien n'est annoncé aux lecteurs d'écran** : **zéro** zone d'annonce (`aria-live`) sur la page de saisie — « Score enregistré ✓ » n'est jamais dit. **8 champs de score sur 10 sans étiquette** rattachée. Les boutons − / + annoncent « moins » / « plus » sans dire de quoi ni pour qui. Sur tout le frontend : **5** annonces accessibles, toutes ailleurs. Concerne surtout la **page publique**, lue par des centaines de personnes | P2 | CERTAIN (balayage) | IDENTIFIÉ | `AUDIT.md` §E.5 |
| **R-058** | **La touche « Entrée » ne valide rien** : **aucun formulaire** sur la page de saisie. Il faut fermer le clavier du téléphone (qui masque le bas de l'écran) puis viser un bouton de 35 px. Deux gestes au lieu d'un, **à chaque match** — sur une journée à 60 matchs, ce n'est plus un détail | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §E.5 |
| **R-059** | **Le bénévole doit taper un mot de passe partagé, et il lui est redemandé** à chaque nouvelle ouverture de l'onglet (`sessionStorage`, oublié à la fermeture). Sur un téléphone qui ferme ses onglets pour économiser la batterie, cela veut dire retaper un mot de passe au bord d'un terrain. ⚠️ Ce n'est **pas** un défaut de sécurité — oublier la clé est le bon choix ; c'est son **coût d'usage**. Rejoint **R-017** et **R-018**, et se tranchera avec eux | P2 | CERTAIN *(le mécanisme)* · **PROBABLE** *(que le téléphone ferme l'onglet en cours de journée — non éprouvé)* | IDENTIFIÉ | `AUDIT.md` §E.5 |
| **R-060** | **L'administration n'a pas de lien « Aller au contenu »** (la page publique en a un). Navigation au clavier : il faut traverser la barre des 14 écrans. Vrai point d'accessibilité, mais l'administration sert à une ou deux personnes, à la souris | P3 | CERTAIN | IDENTIFIÉ — **ne rien faire maintenant** | `AUDIT.md` §E.6 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine E)

> À lire **avant** la liste ci-dessus : c'est la majorité de ce qui a été mesuré.

| Point vérifié | Résultat |
|---|---|
| **Contrastes de la page de saisie** | ✅ **Excellents — de 9,6 à 21** pour 4,5 exigé. Le fond marine + texte presque blanc est un très bon choix pour un écran vu dehors |
| **Contrastes de l'administration** | ✅ **603 textes mesurés, 578 conformes (96 %)**. Les 25 écarts sont des textes d'aide secondaires |
| **Cibles cliquables de l'administration** | ✅ **212 mesurées, 4 seulement sous 24 × 24 px** (cases à cocher et deux petits liens). Très bon pour un usage à la souris |
| **Saisie détaillée U14** | ✅ **Exemplaire** : boutons − / + de **44 × 44 px** exactement, total en points **en grand (27 px)** et **calculé, jamais saisi** |
| **Confirmations avant destruction** | ✅ **28 confirmations** dans l'administration. La réinitialisation liste ce qui disparaît **et ce qui survit**, puis reconfirme. Régénérer avec des scores annonce **le nombre exact** effacé **et exige la re-saisie du mot de passe** |
| **Boutons de l'administration** | ✅ Ils **annoncent leur progression** : « Génération… », « Réinitialisation… », « Recalcul… » |
| **Double-clic sur « Valider »** | ✅ **Bloqué** — le bouton se désactive pendant l'envoi |
| **Saisie en cours de frappe** | ✅ **Jamais écrasée** : le rechargement est un bouton manuel, volontairement, et c'est écrit dans le code |
| **Correction d'un score validé** | ✅ **Redemande le mot de passe** — vraie protection du geste |
| **Correction d'un score du matin après génération de l'après-midi** | ✅ **Avertissement explicite** qui donne la conséquence **et** le remède |
| **Contexte de chaque match** | ✅ Écrit : « 🏆 Demi-finale — Coupe U12 », « 🎈 Match amical — sans classement », « ⚔️ Élimination directe » |
| **Petits écrans** | ✅ **Aucun débordement horizontal jusqu'à 320 px**. Les noms longs passent à la ligne au lieu de pousser le score hors écran |
| **Mémoire des filtres** | ✅ Catégorie et grand terrain **mémorisés** sur l'appareil |
| **Repli automatique des phases** | ✅ Une phase entièrement saisie se replie et affiche « tous saisis ✓ » / « 2 à saisir sur 3 » |
| **Bases de l'accessibilité** | ✅ `lang="fr"`, un seul `h1` par page, repères `main` / `header`, **lien « Aller au contenu »** sur la page publique |
| **Animations réduites** | ✅ `prefers-reduced-motion` respecté — réflexe que peu de sites ont |
| **Piège du cache mobile** | ✅ **Déjà vu et déjà réglé** : anti-cache sur le rafraîchissement, avec le commentaire qui l'explique |
| **Fenêtres de dialogue** | ✅ Clavier géré (Entrée / Échap), focus donné au bon endroit, bouton destructeur **en rouge** |

### Domaine F — Performance *(session 10)*

| # | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-061** | ✅ **CAPACITÉ CHIFFRÉE LE 2026-08-05 (I-18 levée)** : **≈ 310 écrans actifs simultanés** en régime normal, ≈ 165 en régime moyen, ≈ 110 cache froid. ⚠️ **CORRECTION du même jour (§F.10)** : l'unité est l'**écran allumé sur la page**, **pas** la personne — la page **se met en pause** quand l'onglet n'est pas visible. 310 écrans actifs correspondent donc à un public **bien plus large**. Modèle appliqué au tournoi actuel (37 équipes) : ~145 écrans en régime courant *(large marge)*, saturation **seulement dans les pics**. **Le geste utile aujourd'hui est R-064** (15 s → 30 s, suffit jusqu'à ~1 000 personnes qui suivent), **pas** le relais — qui reste P1 pour plus tard, et parce qu'un dispositif jamais essayé n'est pas un dispositif. Mesure clé : `ping`, qui n'exécute **rien**, occupe déjà le serveur **1,59 s** ; une lecture complète servie du cache, **1,65 s** — soit **+0,06 s**. Le cache est donc excellent, mais **~1,6 s de démarrage par appel est incompressible**. ⚠️ Le commentaire de `doGet` (« répond en quelques millisecondes ») est **faux de deux ordres de grandeur**. **Levier gratuit découvert** : porter le rafraîchissement de **15 s à 30 s double la capacité** (≈ 550). — **La protection contre l'affluence est écrite, documentée… et éteinte.** Le relais CDN (Cloudflare) existe des deux côtés — programme du relais, poussée depuis Apps Script, lecture prioritaire par la page publique avec repli automatique, pas-à-pas d'installation. Il manque **une seule ligne** : `SNAPSHOT_URL = ""` (`frontend/js/config.js:30`). Or **42 appels mesurés** donnent : plancher **2,3 s** (même pour `ping`, qui n'exécute rien), médiane **≈ 2,1 s**, et **deux pointes à 16,8 s et 20,1 s** — soit **au-delà du délai d'abandon de 12 s** de la page publique, donc deux abandons silencieux (R-051) | **P1** | **CERTAIN** *(le dispositif est éteint)* · **INCONNU** *(la capacité réelle — I-18)* | IDENTIFIÉ — décision d'exploitation à l'ÉTAPE 3 | `AUDIT.md` §F.3 |
| **R-062** | **Le filet de repli est programmé pour lâcher quand le tournoi grossit.** Le cache serveur refuse de s'enregistrer au-delà de **95 000 octets** (`mettreEnCacheSnapshot`) — délibéré, mais **totalement silencieux**. Mesures : instantané actuel **30 460 o** pour **51 matchs** (466 o/match, 142 o/équipe) → **bascule vers ~165 matchs**. Un tournoi à 8 catégories, matin + après-midi, l'atteint. Le commentaire du code renvoie alors « au relais CDN » — **qui est éteint** (R-061). Les deux filets sont noués l'un à l'autre | **P1** | **CERTAIN** *(seuil lu dans le code, taille mesurée, projection calculée)* | IDENTIFIÉ | `AUDIT.md` §F.4 |
| **R-063** | **58 % de ce qui voyage jusqu'à chaque spectateur, ce sont des cases vides.** Chaque match transporte **27 champs dont 17 vides** pour un match non joué : `"essais_A":""` pèse 16 octets pour ne rien dire. Mesuré sur les 51 matchs réels : **14 541 o sur 25 029**. Payé par chaque spectateur **toutes les 15 s, toute la journée**. Les retirer ferait passer l'instantané de ~30 Ko à ~16 Ko et repousserait le seuil de R-062 de ~165 à ~330 matchs | P2 | CERTAIN (mesuré) | IDENTIFIÉ — ⚠️ **à ne PAS faire avant R-041/R-042** : un champ absent arrive en `undefined` et non `""`, ce que le frontend compare à de nombreux endroits | `AUDIT.md` §F.5 |
| **R-064** | ⚡ **ÉLARGI le 2026-08-05** — le vrai sujet est que **les réglages de cadence n'ont jamais été accordés entre eux** : ni le cache (10 s) avec l'intervalle (15-19 s), ni l'intervalle avec la capacité réelle du serveur (I-18). **Le levier le plus puissant du chantier est ici** : passer le rafraîchissement de **15 s à 30 s double la capacité** (≈ 310 → ≈ 550 spectateurs), en changeant **un seul chiffre** (`INTERVALLE_MS`), sans rien casser — le bouton « Rafraîchir » reste là pour qui veut tout de suite, et 30 s de fraîcheur suffisent largement pour du rugby. — **Le cache dure 10 s, mais on l'appelle toutes les 15 à 19 s.** Les deux réglages ne se parlent pas : cache serveur **10 s**, rafraîchissement **15 s + jusqu'à 4 s d'étalement**. Conséquence mesurée : **un spectateur seul trouve toujours le cache expiré** → **4,36 à 6,30 s** au lieu de **1,36 à 2,05 s** en cache chaud. **Trois fois plus lent, et c'est le cas normal quand il y a peu de monde.** ✅ Presque gratuit à corriger : **toute écriture repose le cache** (`apresEcriture` vérifié dans `doPost`), donc allonger sa durée ne retarde **pas** un score saisi dans l'application — seulement une modification faite **à la main dans le Sheet** | P2 | CERTAIN (mesuré) | IDENTIFIÉ — **meilleur rapport bénéfice/risque du domaine** | `AUDIT.md` §F.5 |
| **R-065** | **L'administration télécharge 207 Ko d'outil PDF avant d'afficher quoi que ce soit.** Poids réellement transféré mesuré : **468 Ko sur 25 fichiers**, dont **`pdf-lib.min.js` = 207 Ko (44 %)**, qui ne sert qu'à fabriquer le document d'autorisation. Et **aucun des 21 scripts n'a `defer` ni `async`** : tout bloque l'affichage. ℹ️ **Chiffre R-024** (qui parlait de « ~750 Ko sans version documentée »). Atténué : usage sur ordinateur, avant le tournoi (I-05), et mis en cache par le navigateur | P2 | CERTAIN (mesuré) | IDENTIFIÉ — ⚠️ `defer` change l'ordre d'exécution, et le projet a **693 fonctions dans un espace commun** : à vérifier écran par écran | `AUDIT.md` §F.5 |
| **R-066** | **Le logo pèse à lui seul 79 % de la page publique** : **229 Ko** contre **61 Ko** pour tout le reste (6 scripts + 3 feuilles + le HTML). Chargé en **700 × 558** pour être affiché en **60 × 48** (en-tête) et **65 × 52** (pied) — **~8 Ko suffiraient**. C'est la première chose que télécharge chaque spectateur. ⚠️ **Le fichier n'est PAS dans ce dépôt** : il est servi par `boutique-r92`, donc **hors périmètre tant que D-005 n'est pas tranchée**. Cas concret qui donne du poids à cette décision en attente | P2 | CERTAIN (mesuré dans le navigateur) | IDENTIFIÉ — **dépend de D-005** | `AUDIT.md` §F.5 |
| **R-067** | **Le verrou d'écriture est tenu pendant qu'on reconstruit l'instantané public.** `apresEcriture` (qui relit config + équipes + poules + matchs + partenaires) tourne **sous le verrou**, dans `doPost`. Coût mesuré de cette reconstruction : **2,5 à 4,5 s**. Le code a **déjà appliqué ce raisonnement à l'étape suivante** — *« Push CDN APRÈS le verrou »* — mais la reconstruction, elle, est restée dedans. 🔗 **Répond à la question que le domaine E posait au domaine F** : **R-053 n'est PAS un détail** — l'attente après « Valider » est réelle et s'allonge quand plusieurs marqueurs valident ensemble | P2 | ✅ **CERTAIN** *(le code **et** la mesure — 43 écritures réelles : médiane **2,67 s**, max **8,20 s**)* | IDENTIFIÉ — ⚠️ **REVU À LA BAISSE le 2026-08-05 (§F.12)** : le verrou n'est tenu que **~1 s**, et non 2,5-4,5 s comme annoncé en §F.5 — le démarrage Apps Script (**1,59 s, soit 60 % du total**) a lieu **avant** la prise du verrou. Attente du 6ᵉ marqueur : **~8 s**, et non ~16 s. **R-067 reste P2 mais descend dans l'ordre d'intérêt** : le sortir du verrou ferait gagner **moins d'une seconde**. ⚠️ Et cela peut faire écraser un instantané récent par un plus ancien : à réfléchir à l'ÉTAPE 3, pas au fil de l'eau | `AUDIT.md` §F.5, **§F.9**, **§F.12** |
| **R-068** | **Vérifier un mot de passe passe par le chemin le plus coûteux du serveur.** `cleValide` (`frontend/js/api.js`) envoie une **vraie demande d'enregistrement de score** avec un identifiant bidon (`__verif_cle__`) : le serveur **prend le verrou d'écriture** (jusqu'à 20 s d'attente possible) puis **ouvre le classeur** (~0,5 s)… pour ne rien modifier. Six marqueurs qui ouvrent la page le matin = six prises de verrou inutiles | P2 | CERTAIN | IDENTIFIÉ — ⚠️ **à trancher AVEC R-017, R-018 et R-059** : toucher à la vérification des clés, c'est toucher à la sécurité (`CLAUDE.md` §6.C) | `AUDIT.md` §F.5 |
| **R-069** | **Les écritures peuvent attendre indéfiniment.** Les lectures ont un délai d'abandon (12 s sur la page publique) ; **`apiPost` n'en a aucun**. Réseau qui « pend » → bouton grisé sans fin, sans message. C'est la **moitié manquante de R-051 et R-052** : ceux-là disent que l'application ne parle pas quand ça échoue, celui-ci qu'elle peut **ne jamais savoir** que ça a échoué | P2 | CERTAIN | IDENTIFIÉ — ⚠️ abandonner l'attente **n'annule pas** l'écriture : le message devra dire *« pas de réponse, rafraîchis pour vérifier »*, **jamais « échec »** | `AUDIT.md` §F.5 |
| **R-070** | **L'envoi groupé d'invitations bloque tout le reste pendant sa durée** : `envoyerInvitationsGroupe` boucle sur les clubs **en tenant le verrou d'écriture**, ~1-2 s par courriel avec l'affiche en pièce jointe → **1 à 2 minutes pour 50 clubs**. Et Google coupe tout traitement de plus de **6 minutes** (~200 clubs). ℹ️ Un compte Google gratuit est limité à **100 destinataires/jour** ; le projet sait lire ce compteur (`MailApp.getRemainingDailyQuota`) mais **ne le consulte pas avant un envoi groupé**. ✅ Les échecs individuels sont **déjà bien gérés** (collectés et rapportés) | P3 | CERTAIN | IDENTIFIÉ — **ne rien faire maintenant** (jamais le jour J, carnet encore petit) ; à revoir avec **R-040** | `AUDIT.md` §F.6 |
| **R-071** | **Le compteur de visibilité des partenaires s'arrêterait avant la fin d'une grosse journée** : plafond **30 000 relevés / 6 h** (posé en session 6 pour refermer **R-014**) contre **1 300 spectateurs × 36 relevés ≈ 46 800**. La mesure s'arrêterait vers les deux tiers de la journée. ✅ **Ce n'est pas un défaut** : c'est le comportement voulu, et un relevé de visibilité est une donnée de confort. Il faut simplement **le savoir**, pour ne pas lire une chute de fréquentation là où il n'y a qu'un plafond. Partenaires **éteints depuis le 2026-08-05** (R-029 suspendu) | P3 | CERTAIN | IDENTIFIÉ — **ne rien faire** ; à documenter | `AUDIT.md` §F.6 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine F)

> À lire **avant** la liste ci-dessus. Le domaine F ne trouve **aucune négligence** : il trouve un
> travail **bien fait puis arrêté en chemin**, et un réglage devenu faux avec le temps.

| Point vérifié | Résultat |
|---|---|
| **Vitesse d'affichage de la page publique** | ✅ **Prête en 527 ms**, entièrement chargée en **718 ms**. Excellent |
| **Poids de la page publique** | ✅ **59 Ko** transférés hors logo, **12 fichiers seulement**. Très léger |
| **Calculs dans le navigateur** | ✅ **Négligeables** : réaffichage complet des deux vues **0,9 ms**, comparaison anti-clignotement **0,05 ms**. Même sur un téléphone 20× plus lent : 18 ms. **Rien à optimiser — et il ne faut pas y toucher** |
| **Tenue à 25 spectateurs simultanés** | ✅ **25 réponses correctes sur 25**, aucune erreur, aucune troncature, **toutes de taille identique** (le cache a bien servi). Le plus rapide 1,92 s, le plus lent 8,57 s |
| **Cache serveur** | ✅ Réel et efficace : **1,36-2,05 s** en cache chaud contre **4,36-6,30 s** à froid. Il divise le temps par trois |
| **Anti-ruée sur le cache** | ✅ **Traité** : un seul « reconstructeur » est élu par jeton court, les autres reçoivent une **copie de secours** gardée 6 h. C'est le piège classique, et il est évité |
| **Mesure du cache en octets réels** | ✅ `Utilities.newBlob` et non `.length` — parce qu'un « é » compte double. Le commentaire dit que le bug avait déjà été rencontré |
| **`ping` et `getAll` sans ouvrir le classeur** | ✅ Le cas courant (cache chaud) **ne touche jamais au Sheet** — l'ouverture coûte ~0,5 s |
| **Pause en arrière-plan** | ✅ Le rafraîchissement **s'arrête** quand l'onglet est caché et repart au retour : des centaines de téléphones « en poche » n'appellent pas pour rien |
| **Étalement aléatoire** | ✅ Jusqu'à 4 s de décalage : les spectateurs n'appellent pas tous à la même seconde |
| **Pas d'empilement de requêtes** | ✅ Le rafraîchissement **enchaîne après la fin du précédent** (pas de minuteur fixe) |
| **Délai d'abandon sur les lectures** | ✅ **12 s** : une connexion mobile qui « pend » ne gèle pas la boucle |
| **Lectures admin hors verrou** | ✅ `getConfigAdmin`, `listerSponsors`… **court-circuitent le verrou d'écriture** pour ne pas concurrencer la saisie le jour J |
| **Envoi groupé** | ✅ Index construit **une seule fois** au lieu de relire le carnet à chaque club — le commentaire dit que le coût « au carré » avait été repéré et corrigé |
| **Cadence des relevés partenaires** | ✅ **Fausse alerte levée** : le minuteur à 5 s de `sponsors.js` n'écrit **que sur le téléphone** (mémoire locale) ; l'envoi réseau est bien espacé de **10 minutes** |
| **Chargement en parallèle** | ✅ La page de saisie lance ses deux appels **en même temps** (`Promise.all`), et le second est **tolérant à l'échec** |
| **Repli du relais** | ✅ Si le relais est allumé puis tombe, la page publique **retombe automatiquement** sur Apps Script — le code du repli est déjà écrit et lisible |

### Domaine G — Architecture / Maintenabilité *(session 11)*

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-072** | **La procédure de redéploiement du serveur décrit la moitié du geste — et cette lacune a DÉJÀ produit une preuve fausse.** Le serveur, c'est **deux** fichiers : `Code.gs` (8 147 lignes) **et `Tests.gs`** (3 711 lignes, 589 vérifications). Or `Tests.gs` n'est cité par **AUCUN** document : ni `deploiement.md`, ni `passation.md`, ni les trois `README`, ni `CLAUDE.md`. Et `deploiement.md` §A dit textuellement *« Coller le contenu de `backend/Code.gs` »* — **un seul fichier**. 🔗 **C'est le mécanisme exact de M-04** : en session 6 le `Tests.gs` de Google était périmé, a répondu « 573/573 » et cette preuve fausse est entrée au dossier ; il a fallu attendre le 2026-08-05 (**I-17**) pour la refaire. Le même document contient deux autres erreurs : « crée les **5 onglets** » (il en crée **7**) et la fonction **`assurerColonnePhase`**, qui **n'existe plus** | **P1** | **CERTAIN** *(les 6 documents ont été fouillés un par un ; l'incident est daté et documenté)* | 🟡 **DÉSAMORCÉ LÀ OÙ IL SE DÉCLENCHAIT — pas refermé** (2026-08-05, **D-029**). ✅ `docs/deploiement.md` porte désormais la fiche **complète** : le serveur y est déclaré comme **deux** fichiers, le geste *« coller `Tests.gs` »* est explicite, et le **contrôle par deux nombres** (bilan **589**, dernière ligne **3711**) rend une preuve fausse détectable en cinq secondes ; l'incident M-04 y est raconté pour que la raison de la fiche soit lisible. Deux erreurs de fait du même document corrigées au passage (« 5 onglets » → **7** ; `assurerColonnePhase`, supprimée, → `assurerColonnesMatchs`). ⚠️ **RESTE OUVERT** : `Tests.gs` n'est toujours cité ni par `passation.md`, ni par `backend/README.md`, ni par `README.md` — **à traiter à l'ÉTAPE 3 avec R-073** | `AUDIT.md` §G.2 |
| **R-073** | **La carte du projet ne décrit plus le projet.** `docs/architecture.md` (2026-07-20) documente **21 des 65 actions** du serveur — **68 % d'invisible** — et **4 des 8 pages** ; **tout le parcours d'invitation des clubs** (invitation, réponse, dossier — le travail du dernier mois), les partenaires, le référentiel FFR, la demande d'autorisation et le Super Challenge **n'y figurent nulle part**. `README.md` liste **6 fichiers JS sur 26**, **2 feuilles de style sur 6**, **5 pages sur 8**, `backend/` sans `Tests.gs`, et « 5 onglets » là où il y en a jusqu'à **12**. `backend/README.md` : **7 actions de lecture sur 15**, « 6 onglets » pour 7. 🔗 **Le défaut a déjà produit une conclusion fausse dans ce chantier** : le chiffre non sourcé de **« ~1000-1300 spectateurs »**, écrit dans `architecture.md` **et** `relais-cdn.md`, a conduit la session 10 à une conclusion trop pessimiste — corrigée par Romain (**I-19**) | **P1** | **CERTAIN** *(chaque écart compté sur le code)* | 🟡 **L'HÉMORRAGIE EST ARRÊTÉE — le retard reste entier** (2026-08-05, **D-029**). ✅ `CLAUDE.md` **§8 bis** (nouvelle section, valable pour **tous** les chantiers) : *« une session qui ajoute un écran, une action serveur ou un onglet met la carte à jour DANS LE MÊME LOT — pas plus tard »*, avec ce que la règle **ne demande pas**. L'écart cesse donc de se creuser à chaque fonctionnalité. ⚠️ **Les 44 actions, 4 pages et 20 fichiers déjà manquants n'ont PAS été rattrapés** — c'est un travail de vérification ligne à ligne, qui appartient à l'ÉTAPE 3. ⚠️ **une carte fausse est pire qu'une carte absente** : chaque affirmation réécrite devra être **vérifiée dans le code**, jamais déduite | `AUDIT.md` §G.3 |
| **R-074** | **Tout le serveur tient dans un seul fichier de 8 147 lignes**, alors qu'Apps Script en accepte plusieurs : c'est un **choix**, pas une contrainte. L'aiguillage des lectures (l. 312) et celui des écritures (l. 2784) sont séparés par **2 470 lignes** ; la génération du planning est éclatée en **3 blocs non contigus** avec la *réinitialisation* posée au milieu ; la plus longue fonction fait **333 lignes**. ✅ **Atténué** : **26 bandeaux de section** rangent le fichier — ce n'est pas un fouillis | P2 | CERTAIN | ✅ **ARBITRÉ — D-028, validée par Romain le 2026-08-05** : **on ne découpe PAS** tant que le dépôt chez Google est manuel (1 fichier → 5 collages = 5 occasions d'en oublier un, **le mécanisme même de M-04** ; la correction aggraverait **R-072**). ⚠️ **Le problème reste OUVERT** : le fichier est trop long, c'est constaté — c'est la **correction** qui coûte plus cher que le défaut. ⚠️ **Et ce n'est pas un permis d'agrandir** : toute session ajoutant une fonctionnalité importante au serveur doit **reposer la question**. **Réouverture** : le jour où le dépôt cesse d'être manuel (**R-081**) | `AUDIT.md` §G.4 |
| **R-075** | **Rien ne permet de dire quelle version tourne.** `CHANGELOG.md` : **2 406 lignes**, et **toutes** les entrées sous le titre `## [Non publié]` — aucune version n'a **jamais** été publiée. **Aucune étiquette Git** (`git tag` ne renvoie rien). Et le serveur est déposé à la main, sans trace. **C'est la cause structurelle de I-01** (« le code chez Google est-il celui du dépôt ? ») : aujourd'hui la seule réponse possible est de compter des lignes sur une capture d'écran | P2 | CERTAIN | IDENTIFIÉ — piste peu coûteuse : une ligne `var VERSION` renvoyée par `ping`, et **I-01 se lèverait toute seule à chaque fois**. À évaluer avec **R-081** | `AUDIT.md` §G.4 |
| **R-076** | **Les tests sont rangés par date d'écriture, pas par sujet.** **277 groupes**, **31 préfixes** — dont **27 sont des numéros de session** (`testS5_`…`testS28_`). Seuls 4 disent de quoi ils parlent. Et le point d'entrée s'appelle **`lancerTestsFFR`** (en-tête : « TESTS BACKEND — Conformité FFR ») alors qu'il lance **la totalité** des 589 vérifications : classement, scores, clubs, partenaires, planning, Super Challenge. Conséquences : un test existant peut être réécrit sans qu'on le retrouve, et **le nom trompeur invite à créer un second point d'entrée** — le jour où deux coexistent, plus personne ne sait quel nombre fait foi, et **on retombe dans M-04** | P2 | CERTAIN | IDENTIFIÉ — ⛔️ **ne rien renommer en masse** (277 renommages = 277 occasions de perdre un test en silence). Geste sûr : **ajouter** `lancerTousLesTests()` qui appelle l'ancien, corriger l'en-tête, et laisser les **nouveaux** tests prendre un préfixe de sujet | `AUDIT.md` §G.4 |
| **R-077** | **L'administration est un anneau : 13 paires de fichiers s'appellent mutuellement.** La page charge **19 fichiers** ; `admin.js` appelle du code de **9** autres, dont **8** le rappellent. Aucun de ces fichiers ne peut être compris, déplacé ou testé seul — **c'est la raison de fond pour laquelle R-043 (aucun test du navigateur) n'est pas qu'une question de temps**. ✅ **Nuance en faveur du code** : cette forme est **normale** sans outillage d'assemblage — il n'existe ici aucun moyen de dire « ce fichier a besoin de celui-là ». Ce n'est pas de la négligence, c'est la contrainte du terrain | P2 | CERTAIN *(cartographie automatique des appels, 26 fichiers)* | IDENTIFIÉ — **ne rien faire maintenant** : un découpage propre exigerait l'outillage que `CLAUDE.md` §10 met en garde d'ajouter | `AUDIT.md` §G.4 |
| **R-078** | **Tout le code du navigateur partage un seul espace de noms** : **600 fonctions** et **142 variables** visibles — et écrasables — par tous. **12 noms sont déjà en double** : 7 fonctions (`nomEquipe`, `carteMatch`, `basculer`, `majHeure`, `estPublie`, `categoriesPresentes`, `urlAffiche`) et 5 variables (`INTERVALLE_MS` — **15 s** dans `tournoi.js`, **60 s** dans `perfs.js` —, `equipes`, `matchs`, `nomParEquipe`, `derniereSignature`). ✅ **Aucune collision aujourd'hui, vérifié page par page** (les doublons vivent dans `tournoi.js` / `saisie.js` / `perfs.js`, jamais chargés ensemble). ⚠️ **Mais la panne serait brutale** : les variables sont en `const`/`let`, dont la redéclaration est une **erreur de syntaxe qui arrête le fichier entier**. Le jour où quelqu'un voudrait les scores en direct **dans l'administration**, la page deviendrait **blanche** | P2 | CERTAIN | IDENTIFIÉ — ⛔️ **pas de renommage général** (600 fonctions = 600 occasions de casser un appel). Geste proportionné : **renommer les 12 doublons** avec un préfixe de page. À grouper avec **R-043** | `AUDIT.md` §G.4 |
| **R-079** | **Côté navigateur, calculer et afficher sont le même geste** : **137** écritures directes dans la page (`innerHTML`) et **594** recherches d'élément ; les plus longues fonctions (`htmlClubEdition` 254 l., `planRemplissageAutorisation` 239 l., `afficherEquipes` 187 l.) **décident et dessinent** dans le même mouvement — **l'inverse exact du serveur**, où `calculerPlanning` (224 l.) décide sans rien écrire. 🔗 **C'est LA cause de R-043** (et ce que le domaine D ne pouvait pas dire) : le problème n'est pas qu'on n'a pas écrit les tests, c'est qu'**il n'y a rien à tester séparément**. Et c'est ce qui **entretient R-044** : une règle enfermée dans le dessin ne se partage pas, elle se recopie | P2 | CERTAIN (mesuré) | IDENTIFIÉ — ⛔️ **jamais en bloc.** Méthode **opportuniste** : chaque fois qu'une règle doit être corrigée de toute façon, la **sortir** de la fonction d'affichage à ce moment-là | `AUDIT.md` §G.4 |
| **R-080** | **183 Ko sont publiés sur Internet à chaque envoi sans que rien ne les charge** : `docxtemplater.min.js` (93 Ko), `pizzip.min.js` (80 Ko) et `assets/autorisation-droit-image-template.docx` (10 Ko), orphelins depuis le retrait de l'autorisation de droit à l'image le 2026-08-03. ✅ **Ce n'est PAS un oubli** : `frontend/README.md` l'écrit noir sur blanc (*« plus rien ne les charge, mais tout est là si la fonction revient »*) — choix assumé, et le coût pour les spectateurs est **nul** (un fichier jamais demandé n'est jamais téléchargé ; la page publique reste à 59 Ko). ⚠️ En revanche `pizzip.min.js` **annonce une licence absente du dépôt** (`pizzip.min.js.LICENSE.txt`), et aucune des 4 bibliothèques (~750 Ko) ne porte de version ni d'origine — **confirme R-024** | P2 | CERTAIN | IDENTIFIÉ — **ne rien supprimer** ; écrire version + origine + licence, et **fixer une échéance** de retrait, sinon « au cas où » devient définitif | `AUDIT.md` §G.4 |
| **R-081** | **Le serveur est déposé à la main, et c'est la racine commune de quatre problèmes.** Aucun outillage dans le dépôt : pas de `package.json`, pas de vérificateur, pas d'assemblage, **aucun moyen d'envoyer le code chez Google autrement qu'en le collant**. Cause commune de **I-01/M-02** (rien ne relie le dépôt au code en service), **R-072** (le geste manuel doit être décrit — et l'était à moitié), **R-075** (rien à comparer) et **R-043** (rien ne s'exécute avant publication). L'outil officiel de Google (`clasp`) réglerait tout cela d'une commande | P3 | CERTAIN | IDENTIFIÉ — **ne rien faire maintenant** : il exige d'installer Node.js sur l'ordinateur de Romain, soit **exactement** ce que le projet a délibérément refusé (*« aucune dépendance à installer »*). À rouvrir si le rythme de redéploiement augmente **ou** si une 2ᵉ erreur type M-04 survient malgré R-072 corrigé | `AUDIT.md` §G.5 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine G)

> À lire **avant** la liste ci-dessus. Le domaine G aboutit à un verdict inhabituel : **le code est
> en bien meilleur état que sa documentation.** Les deux P1 ne portent pas sur ce que
> l'application **fait**, mais sur ce que le projet **raconte de lui-même**.

| Point vérifié | Résultat |
|---|---|
| **Accès au classeur** | ✅ **8 ouvertures seulement** dans 8 147 lignes (`SpreadsheetApp.openById`), et **92 fonctions** reçoivent le classeur **en paramètre** au lieu d'aller le chercher. C'est exactement ce qui rend possibles les **589 vérifications sans aucun Sheet** |
| **Le cœur du calcul métier** | ✅ `calculerPlanning` — **224 lignes**, la fonction qui décide quel match se joue où et quand — ne contient **aucune** référence à Google. **À ne perdre sous aucun prétexte** : c'est le seul endroit où une erreur produirait des résultats sportifs faux |
| **Séparation aiguillage / travail** | ✅ `doGet` et `doPost` sont des **standards téléphoniques** : ils lisent le nom de la demande et passent l'appel. Les contrôles communs (clé, verrou, rafraîchissement du cache) sont donc écrits **une seule fois** — impossibles à oublier |
| **Rangement du fichier serveur** | ✅ **26 bandeaux de section nommés** (`SAISIE DES SCORES`, `CLASSEMENT DES POULES`…). Long, mais pas en vrac |
| **Qualité des commentaires** | ✅ **Rare et systématique** : ils expliquent le **pourquoi**, donc aussi **ce qu'il ne faut pas défaire**. Ex. : *« si les relevés passaient par le chemin d'écriture normal, quelques centaines de spectateurs suffiraient à faire attendre le marqueur au bord du terrain »* |
| **`frontend/README.md`** | ✅ **À jour (2026-08-04) et excellent** — décrit les 8 pages, leur rôle, et jusqu'aux choix retirés. **C'est le modèle pour réparer R-073**, et la preuve que la discipline est tenable dans ce dépôt |
| **`CHANGELOG.md`** | ✅ Tenu, daté et **raconté** en langage clair — de la mémoire de projet utilisable, pas de la paperasse *(voir toutefois R-075 sur l'absence de version)* |
| **Appels entre fichiers du navigateur** | ✅ **Aucun appel cassé.** Les 26 fichiers ont été confrontés page par page ; **2 suspects** sont ressortis de l'analyse automatique et **les 2 ont été ouverts à la main et se sont révélés faux** (une fonction locale, un faux positif de lecture) |
| **Feuille de style des partenaires** | ✅ `sponsors.css` est partagée par la page publique, l'admin et le dossier club : **un seul endroit par emplacement**, ce qui garantit que l'aperçu admin montre ce que le club recevra. Choix délibéré et documenté |

### Domaine H — Qualité du code *(session 12)*

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-082** | **Le seul miroir en désaccord : l'U14 en Super Challenge.** Le format sportif de la demande d'autorisation est calculé **deux fois** — `formatSportifCategorie` (serveur, ce que tu **vois** dans la feuille de report) et `formatSportifCategorieAut` (navigateur, ce qui est **réellement écrit dans le PDF**). Le second porte une garde « Super Challenge » que le premier n'a pas, alors que son commentaire le dit *« miroir FIDÈLE »*. Résultat, **prouvé en exécutant les deux versions sur le même cas** : le PDF n'écrit **rien** (correct) tandis que l'écran annonce **2 phases** (il n'y en a qu'une : le code saute l'après-midi en SCF), une **phase 2 « manquante »** qui n'existera jamais, et une **durée de match de 1 × 10 min alors que 30 min seront jouées** (2×15 imposé par `dureeMatchScf` ; 22 min en phase 3). Format d'après-midi vide ⇒ l'écran dit *« non configuré — CROISE serait appliqué par défaut »*, ce qui est **faux** et pousse vers l'état le plus faux. ⚠️ Le serveur **sait déjà** reconnaître le SCF : la garde existe une marche plus bas (`predictionPhase2FormatSportif`, l. 2224) | **P2** ⚠️ **→ P1 le jour d'un vrai Super Challenge** | **CERTAIN** *(les deux versions chargées dans un même bac à sable et appelées sur les mêmes entrées)* | IDENTIFIÉ — correction = **3 lignes**, au même endroit que la garde existante. Ne touche **que le remplissage d'un formulaire** : ni génération, ni horaires, ni scores, ni classement | `AUDIT.md` §H.2 |
| **R-083** | **Cinq commentaires annoncent le contraire de ce que le code fait.** Trois disent que le Super Challenge n'est *« pas encore branché (prévu session 14) »* — il l'est depuis la session 14, fusionnée et déployée : `Code.gs:281` (**l'en-tête qui documente les colonnes du classeur**), `admin-reglages.js:511` (*« le récapitulatif est informatif »* — il est appliqué), `Code.gs:7072` (*« socle multi-journées pas encore branché »* — `genererDimancheScf` existe l. 7880, est routée l. 2884 et **a son bouton**). Deux annoncent une réponse *« en quelques millisecondes »* (`Code.gs:320` et `:439`) là où le domaine F a mesuré **1,65 s**, dont 1,59 s incompressible (**I-18**). 🔗 **C'est le mécanisme de R-073 descendu d'un cran** : l'écart entre ce que le projet raconte et ce qu'il fait a commencé à entrer **dans le code**, et toujours dans la partie la plus récente | P2 | **CERTAIN** *(chaque affirmation confrontée à la ligne de code correspondante)* | IDENTIFIÉ — **zéro ligne exécutable** ; balayage fait : 48 occurrences de « pas encore / prévu session », **45 légitimes** (elles décrivent l'application en marche). Règle proposée : *une session qui branche ce qu'une précédente annonçait « pas encore branché » efface la phrase dans le même lot* — le pendant de `CLAUDE.md` §8 bis pour les commentaires. ⚡ **UN SIXIÈME cas trouvé le 2026-08-05**, hors audit : sur l'éligibilité à la pause échelonnée, **deux commentaires du même fichier se contredisent** — l'un annonce *« éligible si effectif **pair** ≥ 4 »*, l'autre *« éligible **dès 4 équipes**, les effectifs impairs sont gérés par un bye »*. **Le code, lui, teste seulement `≥ 4`** : c'est le second qui dit vrai. À corriger avec les cinq autres | `AUDIT.md` §H.3 |
| **R-084** | **Une colonne est créée dans ton classeur, documentée, munie de sa fonction de lecture — et rien ne la lit.** La pause méridienne échelonnée se règle par une case **globale** (`Code.gs:6971`). Mais le code crée aussi une colonne **par catégorie** `pause_echelonnee` (`Code.gs:290`), l'ajoute automatiquement aux classeurs en service (`:6684`), et écrit `pauseEchelonneeDe(cat)` pour la lire (`:7961`) — **la seule fonction morte des 277**. `docs/structure-google-sheet.md` la documente comme active ; `docs/pause-echelonnee.md` se contredit (« Config (global) » puis « pour les catégories `pause_echelonnee = oui` »). Un organisateur qui écrit `oui` dans la ligne U14 obtient **rien, sans aucun message** — et c'est **précisément le cas d'usage qui a motivé la fonctionnalité** (U14 sur 2 terrains) | P2 | CERTAIN | IDENTIFIÉ — **3 voies**, recommandée = **① aligner la documentation sur le code** (texte + 3 lignes mortes). ⛔️ **Pas la voie ②** (brancher le par-catégorie) : elle ouvre `calculerPlanning`, que le domaine G désigne comme *« à ne perdre sous aucun prétexte »* | `AUDIT.md` §H.4 |
| **R-085** | **Jeter une image ne se vérifie jamais — et l'application répond quand même « c'est fait ».** `try { …setTrashed(true); } catch (e) {}` puis `{ ok: true }` : **4 chemins** (affiche remplacée, image retirée, réinitialisation du tournoi ×2). La fonction écrite **exprès pour ce geste**, `corbeilleFichierDrive`, est utilisée 7 fois et **contournée aux 3 autres** par un copier-coller du même `try/catch`. Symétriquement au dépôt, `setSharing(...)` — le geste qui rend l'image publiquement visible — est aussi avalé : le fichier est créé, l'écran dit *« enregistré »*, **et l'affiche n'apparaît nulle part**. 🔗 Touche **R-035 / I-08** : une image dont la mise à la corbeille échoue reste sur le Drive, son lien déjà diffusé continue de fonctionner, **et la suppression est déclarée réussie** | P2 | CERTAIN *(les 4 chemins lus ligne à ligne)* | IDENTIFIÉ — ⛔️ **ne pas retirer les `try`** (un hoquet Drive ne doit jamais empêcher d'enregistrer le tournoi) : les faire **passer par la fonction unique**, et **tracer l'échec** dans l'onglet `Historique` qui existe déjà. ⚠️ **NON VÉRIFIÉ** : aucun de ces échecs n'a jamais été observé — ils sont possibles, pas constatés | `AUDIT.md` §H.5 |
| **R-086** | **Vingt-neuf endroits montrent au bénévole le message d'erreur brut du navigateur.** `afficherMessage(message, '⚠️ ' + erreur.message, 'ko')` — soit **« Failed to fetch »**, **« NetworkError… »**, **« The operation was aborted »**. Compté : **29 endroits sur 21 fichiers**, jusque dans la page de saisie utilisée au bord du terrain. Ces messages sont **exacts et inutilisables** : en anglais, techniques, et **sans aucune conduite à tenir**. 🔗 **C'est le mécanisme chiffré de R-052** : pas un oubli sur un écran, **le geste par défaut de toute l'application** | P2 | CERTAIN (compté) | IDENTIFIÉ — correction = **un seul endroit à écrire** (une fonction qui traduit l'erreur en phrase utile), puis 29 appels à y renvoyer **fichier par fichier, jamais d'un coup**. ⚠️ **Le texte ne doit pas mentir** (**D-027**) : une requête peut échouer côté navigateur alors que le serveur a enregistré ⇒ dire *« nous n'avons pas eu confirmation »*, jamais *« ce n'est pas enregistré »* | `AUDIT.md` §H.6 |
| **R-087** | **Quinze lignes mortes dont le commentaire affirme qu'elles servent.** `FORMAT_COUPE_PLATEAU_LEGACY` (`admin.js:71`) est précédé de six lignes expliquant qu'il est *« conservé pour la rétrocompatibilité de l'AFFICHAGE »* et qu'*« on garde donc son titre disponible ici »*. **Rien ne le lit** — c'est la **seule variable globale morte** des ~142 du navigateur — et le titre qu'il prétend fournir existe vraiment **ailleurs** (`commun.js:266`), qui est celui qui sert. ℹ️ **Instructif plutôt que grave** : le commentaire est détaillé, sourcé (formulaire FFR 2026-2027) et parfaitement convaincant. C'est tout le domaine H en un exemple | P3 | CERTAIN | IDENTIFIÉ — supprimer les 15 lignes ; vérification faite sur les 26 fichiers JS, les 8 pages HTML et les 6 feuilles de style : **aucune référence** | `AUDIT.md` §H.7 |
| **R-088** | **Les noms très courts vivent trop longtemps dans les trois plus longues fonctions.** Les variables d'une ou deux lettres sont **normalement bien employées** — portée **médiane de 4,5 lignes** — mais **17 sur 42** dépassent 20 lignes : `g` (les paramètres généraux) traverse **293 lignes** de `assemblerDossierAutorisation`, `c` 135, `id` 101 dans `enregistrerScore`, `r` 97 dans `genererPoulesEtPlanning`. Coût de **lecture**, pas de fonctionnement : **aucune erreur n'en découle** | P3 | CERTAIN (mesuré) | IDENTIFIÉ — ⛔️ **aucun renommage global.** Méthode **opportuniste** (même que R-079) : quand une de ces fonctions doit être modifiée de toute façon, renommer **ses** variables longues à ce moment-là | `AUDIT.md` §H.7 |

### Ce qui a été VÉRIFIÉ et s'est révélé sain (domaine H)

> À lire **avant** la liste ci-dessus. Verdict du domaine H : **le code tient ses promesses — sauf
> quand il parle de lui-même.** Les sept problèmes ci-dessus portent tous sur ce que le code
> **raconte**, jamais sur ce qu'il **calcule**.

| Point vérifié | Résultat |
|---|---|
| ⭐ **Les 29 règles écrites en double (R-044) disent-elles la même chose ?** | ✅ **OUI — 179 comparaisons exécutées, 0 écart.** Le serveur et 12 fichiers du navigateur ont été chargés dans un même bac à sable sur cet ordinateur, puis les deux versions de chaque règle appelées **sur les mêmes entrées**, y compris tordues (vide, `null`, négatifs, décimaux, accents, emoji, formats inventés). **16 familles** confrontées : barème du classement, ordre de départage, points du rugby, alerte 5 essais, lecture d'un score, contexte SCF, formules de phase 2, tailles des poules de niveau, nom de club, empreintes de génération, comparaison de textes, téléphone, tours de coupe, statuts de club, réglages des partenaires, dispositions de logo |
| **Le barème du classement en particulier** | ✅ **Identique au caractère près.** `enregistrerResultat`/`appliquer` et `comparerClassement`/`comparer` sont ligne pour ligne les mêmes. **C'est ce qui garantit que la page publique — qui recalcule le classement sans redemander au serveur — ne peut pas afficher un classement différent du sien** |
| **Longueur des fonctions** | ✅ **Médiane 10 lignes (serveur) et 9 (navigateur).** 11 fonctions sur 277 dépassent 100 lignes, 3 sur 600 côté navigateur, **aucune n'atteint 150** |
| **Code recopié** | ✅ **0 bloc de 8 lignes répété dans les 8 147 lignes du serveur**, 2 dans les 17 712 du navigateur (au même endroit du même fichier). Quand une règle existe, **elle existe à un seul endroit** |
| **Code mort** | ✅ **0 fonction morte sur 600** côté navigateur, **1 sur 277** côté serveur (R-084) ; **0 constante morte** côté serveur, **1 variable** côté navigateur (R-087). Ce qui a été retiré au fil des sessions l'a été **proprement** |
| **Complexité** | ✅ **6 niveaux d'imbrication au maximum**, des deux côtés. 18 fonctions sur 277 et 14 sur 600 atteignent 5 niveaux |
| **Explications du code** | ✅ **89 % (serveur) et 92 % (navigateur)** des fonctions portent un bloc d'explication ; **31 % et 25 %** des lignes sont des commentaires |
| **Commentaires citant du code disparu** | ✅ **Aucun.** 25 suspects relevés automatiquement, **tous ouverts à la main, tous légitimes** — dont des **panneaux indicateurs** délibérés (*« comparerCat() est désormais comparerCategorie() dans commun.js »*). Quand une fonction déménage, le code laisse une pancarte : **la discipline qui manque à la documentation (R-073) existe donc dans ce dépôt** |
| **Noms de fonctions** | ✅ **Aucune fonction du serveur** n'a un nom de 4 caractères ou moins ; 4 sur 600 côté navigateur, toutes des aides d'une ligne. Les noms disent ce que la fonction **fait** |
| **Gestion des erreurs du serveur** | ✅ **Majoritairement délibérée** : sur 49 `catch`, 37 n'utilisent pas l'erreur — mais **29 portent un commentaire qui explique pourquoi** (*« cache indisponible : on ignore »*, *« migration douce »*, *« JSON illisible : terrains restent manquants »*). Seuls les 4 chemins Drive de **R-085** sont silencieux sans raison écrite |
| **La plus longue fonction du serveur** | ✅ **Longue mais justifiée.** `assemblerDossierAutorisation` (327 l.) a été **lue en entier** : elle suit **section par section** le formulaire officiel (A.1 → B.3), avec **5 niveaux** d'imbrication seulement. Sa longueur vient du **document qu'elle produit**, pas d'un enchevêtrement |
| **Le total en points du score détaillé** | ✅ **Identique des deux côtés** (essai 5 + transformation 2 + pénalité 3 + drop 3), avec une **différence voulue et correcte** : le navigateur affiche 0 pour un champ vide, le serveur **refuse** une valeur invalide. L'affichage est vivant, l'autorité reste au serveur |
| **Les bornes des réglages partenaires** | ✅ **Identiques sur trois fichiers** — défauts *et* bornes min/max (rotation 0-60 s, interstitiel 3-10 s, saut 0-10 s, repos 1-240 min) |

### Modèle de fiche de problème

À recopier pour chaque problème constaté.

```markdown
### R-0XX — <titre court et parlant>

| Champ | Valeur |
|---|---|
| **Priorité** | P0 / P1 / P2 / P3 |
| **Domaine** | A Métier / B RGPD / C Sécurité / D Tests / E UX / F Performance / G Architecture / H Code |
| **Certitude** | CERTAIN / PROBABLE / INCONNU |
| **Statut** | IDENTIFIÉ / PLANIFIÉ / VALIDÉ / EN COURS / CORRIGÉ / TESTÉ |
| **Découvert en** | session N |
| **Chantier** | C-00X (voir PLAN.md) |

**Description** (en langage simple, sans jargon)
> …

**Origine** (d'où vient le problème : quel code, quelle décision, quel oubli)
> …

**Impact concret pour un tournoi réel** (exemple lié à Tournoi R92)
> …

**Fichiers concernés**
> …

**Correction recommandée** (expliquée simplement)
> …

**Ce que la correction pourrait casser**
> …

**Tests nécessaires pour prouver que c'est réglé**
> …

**Vérifié en conditions réelles ?** oui / non / NON VÉRIFIÉ
```

---

## 6. RISQUES DE MÉTHODE (déjà identifiés, session 1)

Ces risques ne concernent pas le code, mais **la façon de travailler**. Ils sont listés ici parce
qu'ils peuvent produire de mauvaises décisions.

### M-01 — Deux systèmes de suivi en parallèle

| Champ | Valeur |
|---|---|
| **Priorité** | P1 (méthode) |
| **Certitude** | CERTAIN |
| **Statut** | IDENTIFIÉ |

**Description** — Le dépôt contient déjà `AUDIT-TOURNOI-R92.md`, un audit de conformité FFR qui a
sa propre méthode par sessions. On ajoute aujourd'hui un second système (`docs/industrialisation/`).
Deux systèmes de suivi = risque d'avoir deux vérités contradictoires sur l'état du projet.

**Correction recommandée** — Trancher explicitement le partage des rôles (voir D-003 dans
`DECISIONS.md`) : l'un traite la **règle du jeu FFR**, l'autre traite la **solidité technique**.

---

### M-02 — Le code du dépôt n'est pas forcément le code en service

| Champ | Valeur |
|---|---|
| **Priorité** | P1 (méthode) |
| **Certitude** | CERTAIN |
| **Statut** | IDENTIFIÉ |

**Description** — Le « moteur » de l'application (le backend) tourne chez Google, dans Google Apps
Script. Le dépôt contient une **copie** de ce code. Rien ne garantit que la version en service soit
la même : il faut la republier à la main chez Google. L'historique du projet montre que ce
redéploiement a souvent été en attente.

**Impact concret** — On pourrait conclure « ce bug est corrigé » alors que les bénévoles utilisent
encore, le jour du tournoi, l'ancienne version.

**Correction recommandée** — Toute affirmation sur le comportement **en production** reste
**INCONNU** tant qu'elle n'a pas été vérifiée en conditions réelles par Romain.

---

### M-03 — Aucun test ne peut être lancé depuis cet ordinateur

| Champ | Valeur |
|---|---|
| **Priorité** | ~~P1~~ → **P2 (méthode)** — requalifié en session 8 |
| **Certitude** | **CERTAIN** |
| **Statut** | ✅ **LARGEMENT LEVÉ** (session 8) — il ne reste que la partie « automatique » |

> ✅ **LEVÉ SUR L'ESSENTIEL — le titre de ce risque était faux.** Les tests **peuvent** être
> lancés depuis cet ordinateur, et ils l'ont été en session 8 : `Code.gs` et `Tests.gs` chargés
> tels quels dans un exécuteur JavaScript ordinaire, avec **une vingtaine de lignes de doublures**
> pour les trois outils Google que les tests touchent (journal, générateur d'identifiants,
> formateur de dates) → **`589/589 OK` en ~1 seconde**.
>
> Ils n'étaient pas **prisonniers** de Google ; ils étaient **écrits pour** Google. Ce n'est pas la
> même chose, et la distance entre les deux est d'environ vingt lignes.
>
> ⚠️ **Ce qui subsiste, et devient P2** : rien ne les **déclenche automatiquement**. Il faut y
> penser. C'est un vrai risque, mais un cran plus bas qu'un empêchement technique.
>
> ⚠️ **Ce que cela ne prouvera jamais** : que le code **en service chez Google** est le même —
> c'est **M-02**, intact.
>
> ✅ **I-02 reste levée** : `lancerTestsFFR` a bien tourné chez Google le 2026-08-04.
> ❌ **Le « contrôle croisé » écrit ici (564 + 9 = 573) était faux** — voir **M-04** ci-dessous.
> ✅ **Rejoué correctement le 2026-08-05 : `589/589 OK, 0 FAIL` chez Google.**

**Description** — `backend/Tests.gs` est écrit pour être exécuté **chez Google**. Il peut
néanmoins être rejoué ailleurs, ce que la session 8 a démontré. Ce qui manque est le
**déclenchement** : aucun mécanisme ne relance les tests à la modification.

**Impact concret** — Le passage d'un problème au statut **TESTÉ** dépend d'un geste humain, donc
peut être oublié. C'est exactement ce qui s'est produit pour R-014 (**M-04**).

**Correction recommandée** — Traitée au domaine D : voir **R-043** (rien ne contrôle la
publication) et les lots de §D.9 de `AUDIT.md`.

---

### M-04 — Un compte de tests ne dit pas quelle VERSION a été exécutée

| Champ | Valeur |
|---|---|
| **Priorité** | **P1 (méthode)** |
| **Certitude** | **CERTAIN** — démontré en rejouant les deux versions du fichier |
| **Statut** | ✅ **TRAITÉ** (session 8, le jour même) — le geste n° 1 est fait ; le point n° 2 reste une règle d'écriture permanente |

**Description** — Le 2026-08-04, « **573/573 OK** » a été inscrit au dossier comme preuve que les
16 vérifications ajoutées pour R-014 avaient tourné chez Google. La session 8 a rejoué les deux
versions du fichier de tests :

| Version | Vérifications |
|---|---|
| Avant la correction de R-014 (`c1948fc^`) | **573** |
| Après la correction (aujourd'hui) | **589** |

**573 est exactement le compte du fichier qui ne contient PAS ces 16 vérifications.** Le contrôle
croisé inscrit dans M-03 rapprochait un décompte fait sur le fichier **d'après** (564 appels) d'un
total obtenu **avant** — les vrais comptes sont 547 + 26 = 573 avant, 563 + 26 = 589 après.

**Explication la plus probable** *(PROBABLE)* — Lors du redéploiement, `Code.gs` a été recollé chez
Google, mais **pas** `Tests.gs`. Ce sont **deux fichiers**, et rien ne le rappelle.

**Impact concret** — Un nombre de tests qui passent est une preuve **de ce qui a tourné**, jamais
**de ce qui aurait dû tourner**. Sans repère de version, il rassure exactement autant qu'il
trompe. C'est le seul cas, à ce jour, où le chantier a inscrit au dossier une preuve **fausse**.

**Correction — faite, et la règle qui en découle** :

1. ✅ **FAIT le 2026-08-05** — Romain a recollé `backend/Tests.gs` dans Apps Script et relancé
   `lancerTestsFFR` → **`R92 — 589/589 OK, 0 FAIL`**. **I-17 levée.** Le `Code.gs` **du projet**
   passe donc bien les 16 vérifications de R-014 ;
2. **Règle permanente à appliquer désormais** — toujours écrire **le nombre attendu** à côté du
   nombre obtenu, et toujours dire **quels fichiers** ont été recollés. *« 589/589, `Code.gs` et
   `Tests.gs` recollés »* est une preuve ; *« 573/573 »* n'en est pas une.

> ⚠️ **Piège de nommage à connaître** : dans le projet Apps Script, le fichier s'appelle
> **`Test.gs`** (au singulier), alors qu'il s'appelle **`Tests.gs`** dans le dépôt. Ce n'est pas
> une erreur — c'est juste une différence à ne pas prendre pour un second fichier.

> ⚠️ **Ce que ce contrôle ne couvre toujours pas** : les tests tournent dans l'**éditeur**, contre
> le code **du projet**. L'adresse web publique peut être figée sur une version antérieure —
> **M-02 reste ouvert**, atténué. La seule vérification qui interroge la vraie adresse publique
> est le bouton « Tester la remontée » de l'écran Partenaires.

---

### M-05 — L'audit photographie une application qui continue de bouger

| Champ | Valeur |
|---|---|
| **Priorité** | **P1 (méthode)** |
| **Certitude** | **CERTAIN** — constaté par Romain le 2026-08-05, et confirmé par l'historique du dépôt |
| **Statut** | 🟡 **ATTÉNUÉ, jamais refermable** — **D-029** tranchée et appliquée le 2026-08-05. Les deux problèmes qui s'aggravaient sont désamorcés ; le risque de méthode, lui, est **permanent** : tant que l'application évolue, les chiffres de l'audit se périment |

**Description** — Tout le cadre de l'industrialisation est écrit comme si l'application était
**stable** pendant qu'on l'audite. `CLAUDE.md` dit « ne rien modifier » ; **D-024** accumule tout
jusqu'à l'ÉTAPE 3. Rien, nulle part, ne dit ce qui se passe quand du **code neuf** arrive pendant
ce temps.

Or c'est le cas, et ce n'est pas une hypothèse : **le chantier fonctionnalités en est à sa session
28** (PR #159, déployée le **2026-08-03**), soit **la veille** du démarrage de l'industrialisation.
Les deux chantiers sont **vivants en même temps**, et c'est **normal** : Romain l'a rappelé — *« une
phase de pré-industrialisation, pas une fermeture totale des fonctionnalités »*.

**Impact concret — trois effets, de gravité croissante** :

**1. Les chiffres de l'audit sont datés, et ils se périment.** « 8 147 lignes », « 65 actions »,
« 68 % non documentées », « 12 noms en double » : tous vrais **au 2026-08-05**, tous faux dès la
prochaine fonctionnalité. Ce n'est pas grave **à condition que ce soit écrit** — sinon une session
future croira lire un état actuel.

**2. Certains problèmes GROSSISSENT tout seuls.** Ils ne sont pas figés en attendant l'ÉTAPE 3 :

| Problème | Comment il grossit |
|---|---|
| **R-073** — la carte est fausse à 68 % | **Chaque** écran, action ou onglet ajouté **élargit l'écart**. La dette documentaire croît à la vitesse du développement |
| **R-074** — 8 147 lignes | Le fichier grandit à chaque fonctionnalité serveur |
| **R-076** — tests rangés par n° de session | Chaque session ajoute `testS29_`, `testS30_`… : le rangement par date **se renforce** |
| **R-078** — 12 noms globaux en double | Plus de code = plus de noms = plus de chances qu'une **vraie** collision arrive |
| **R-044** — 29 règles écrites deux fois | Toute règle nouvelle à faire vivre des deux côtés en ajoute une 30ᵉ |
| **R-079 / R-043** — rien n'est testable dans le navigateur | Chaque écran neuf est écrit dans le style non testable : la dette grandit **en même temps** que la fonctionnalité |

**3. Et un problème ne grossit pas — il SE REDÉCLENCHE.** C'est le plus sérieux :

> **R-072** (la procédure de redéploiement décrit la moitié du geste) ne devient pas « plus gros ».
> Il **rejoue**. **Chaque fonctionnalité serveur = un redéploiement = un nouveau tirage du piège
> M-04.** Le nombre de fonctionnalités à venir est exactement le nombre d'occasions de réinscrire
> une preuve fausse au dossier.

**Ce que ça ne remet PAS en cause** — l'audit lui-même. Un problème constaté le 2026-08-05 ne
devient pas faux parce que du code a été ajouté après ; il devient **plus grand**, ce qui va dans
le sens du constat, pas contre lui.

**Ce que ça remet en cause** — l'idée que *tout* peut attendre l'ÉTAPE 3 sans coût. Pour la plupart
des problèmes, c'est vrai (attendre ne coûte rien). Pour **R-072** et **R-073**, attendre **coûte**,
et le coût est proportionnel au nombre de fonctionnalités livrées entre-temps. → **D-029**.

**Correction — ✅ EN PARTIE FAITE le 2026-08-05 (D-029)** :

> ✅ **Les points 2 et 3 sont traités.** Romain a validé **D-029** : la fiche de redéploiement de
> `docs/deploiement.md` est désormais **complète** (deux fichiers, contrôle par deux nombres), et
> `CLAUDE.md` porte une nouvelle section **§8 bis** qui impose de mettre la carte à jour **dans le
> même lot** que la fonctionnalité. **Les deux problèmes qui coûtaient à attendre cessent donc de
> s'aggraver.**
>
> ⚠️ **M-05 reste OUVERT** : le risque de méthode, lui, ne disparaît pas. Les chiffres du domaine G
> continueront de se périmer, et **six problèmes continuent de grossir** (R-073 pour son retard
> déjà accumulé, R-074, R-076, R-078, R-044, R-079). C'est une donnée permanente du chantier, pas
> un défaut réparable.

1. **Dater les chiffres.** Toute mesure inscrite au dossier porte sa date et la mention qu'elle
   vaut **à cet instant** — déjà fait pour l'inventaire de `ETAT.md` §9, à généraliser.
2. ✅ **FAIT — D-029 tranchée et appliquée** : procédure de redéploiement complète
   (`docs/deploiement.md`) et règle de la carte à jour (`CLAUDE.md` §8 bis).
3. **Rouvrir automatiquement ce qui a été mesuré** quand une fonctionnalité importante atterrit :
   c'est déjà le garde-fou n° 2 de **D-028**, à étendre aux autres chiffres du domaine G.

---

### M-06 — Les chiffres de l'audit ne portent pas leur méthode de mesure

**Découvert en** : session 12 (domaine H), 2026-08-05.

**Le constat.** La session 11 avait inscrit au dossier les longueurs des plus grosses fonctions du
navigateur : `redimensionnerImage` **338 lignes**, `htmlClubEdition` **254**,
`planRemplissageAutorisation` **239**. `ETAT.md` §4 les reprenait comme matière première du domaine
H. En voulant s'en servir, la session 12 a recompté **fonction par fonction** :

| Fonction | Chiffre au dossier | Chiffre réel | Vérifié |
|---|---|---|---|
| `redimensionnerImage` | 338 l. | **23 l.** | `admin.js:215-237`, lue en entier |
| `htmlClubEdition` | 254 l. | **19 l.** | `admin-invitations.js:1188-1206`, lue en entier |
| `planRemplissageAutorisation` | 239 l. | **113 l.** | `admin-autorisation.js:671-783` |

**Pourquoi c'est un risque de méthode, et pas une simple coquille.** Parce que **personne ne pouvait
le vérifier**. Le chiffre était écrit ; la façon de l'obtenir, non. Il a fallu refaire la mesure
avec une méthode différente, puis **ouvrir les fonctions à la main**, pour établir laquelle des deux
avait raison.

> ⚡ **C'est la deuxième fois.** **M-04** était exactement cela : un nombre juste en apparence
> (« 573/573 ») dont rien ne disait **quelle version** l'avait produit. Ici : un nombre dont rien ne
> dit **comment** il a été produit. Même mécanisme, même conséquence — **une preuve non
> reproductible entre au dossier et y reste**.

**Ce que ça ne remet pas en cause.** Le constat de fond du domaine G — *les fonctions d'affichage du
navigateur décident et dessinent en même temps* (**R-079**) — **reste vrai** : ses deux autres chiffres, eux, se
**retrouvent par une méthode indépendante** — 137 écritures directes dans la page et 594 recherches
d'élément, recomptées à **135** et **595** (l'écart tient à la façon de compter `=` et `+=`). C'est
**l'ampleur chiffrée des fonctions** qui était fausse, pas la nature du problème.

**Ce qui a été fait cette session, et qui est le remède.** Chaque chiffre du domaine H a été produit
par un script conservé, et **la méthode est écrite à côté du chiffre** dans `AUDIT.md` §H
(« détecteur de blocs de 8 lignes significatives », « imbrication comptée sur les accolades »,
« recherche dans les 26 fichiers JS, les 8 pages HTML et les 6 feuilles de style »). Une mesure
douteuse a même été **écartée en cours de route et le dit** : une première méthode annonçait 24
niveaux d'imbrication pour `doPost` ; recomptée sur les accolades, la vraie valeur est **5**.

**Correction proposée** *(à l'ÉTAPE 3, avec R-072 et R-073 — c'est le même sujet)* :

1. **Tout chiffre inscrit au dossier dit comment il a été obtenu** — une phrase suffit : *« compté
   sur X »*, *« mesuré par Y »*, *« lu à la main dans Z »*. Sans cette phrase, le chiffre n'est pas
   une preuve, c'est une affirmation.
2. **Un chiffre surprenant se vérifie par une deuxième méthode avant d'entrer au dossier.** Une
   fonction de 338 lignes dans un fichier qui en compte 811 aurait dû appeler cette vérification.
3. **Un chiffre non reproductible se retire**, il ne se corrige pas en silence — c'est ce que fait
   la présente fiche.
