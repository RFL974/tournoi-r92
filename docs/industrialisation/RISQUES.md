# RISQUES ET PROBLÈMES IDENTIFIÉS — Tournoi R92

> Ce fichier recense **les problèmes constatés pendant les audits**.
> Il est le **registre de suivi** : un problème = une ligne, un statut, une trace.
> L'**explication** de chaque problème (pourquoi, exemple concret, ce qui est proposé) vit dans
> `AUDIT.md`. Ce fichier-ci **suit** ; `AUDIT.md` **explique**.

**Dernière mise à jour** : 2026-08-04 (session 6, close)
**Audits réalisés** : domaine A (métier), domaine C (sécurité). Les 6 autres domaines restent à faire.

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
| P0 | 0 | 0 | 0 | 0 | 0 | 0 |
| P1 | **8** | 0 | **5** | 0 | 0 | 0 |
| P2 | **13** | 0 | **2** | 0 | 0 | 0 |
| P3 | **4** | 0 | 0 | 0 | 0 | 0 |

**Répartition par domaine**

| Domaine | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| A — Métier (session 5) | 0 | 5 | 7 | 1 | **13** |
| C — Sécurité (session 6) | 0 | 3 | 6 | 3 | **12** |
| **Total** | **0** | **8** | **13** | **4** | **25** |

> ⚠️ **« Validé » signifie que la RÈGLE MÉTIER est tranchée par Romain — jamais que le code est
> écrit.** Les **5 problèmes P1 du domaine A** ont leur règle décidée (D-011 à D-014), ainsi que
> R-012 et R-013 (D-015). **Aucun problème du domaine C n'est validé** : ils appellent des
> arbitrages techniques, pas des décisions métier — sauf deux questions posées à Romain (voir plus
> bas). **Rien n'est corrigé. Aucun fichier de l'application n'a été modifié.**
>
> Le passage à **EN COURS** n'aura pas lieu avant la fin des 8 audits et la validation de
> l'ÉTAPE 4 (`CLAUDE.md` §7).

> ⚠️ **Aucun problème n'est corrigé.** Tous sont au statut **IDENTIFIÉ** : ils ont été vus, rien
> de plus. Aucun fichier de l'application n'a été modifié à ce jour.
>
> Ce tableau ne couvre que les domaines **A** et **C**. Les 6 autres domaines n'ont pas été
> audités : leur absence de ligne ne signifie pas leur absence de problème.

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

### État des décisions métier

| Bloque | Question | État |
|---|---|---|
| R-001 | Quelle règle pour une équipe forfait ? | ✅ **Tranchée** — D-011 |
| R-005 | Quelle limite / quelle confirmation sur un score ? | ✅ **Tranchée** — D-012 |
| R-003 | Comment ajuster le planning en cours de journée ? | ✅ **Tranchée** — D-013 |
| R-004 | Quels critères de départage ajouter ? | ✅ **Tranchée** — D-014 |
| R-012 | Faut-il publier les règles sportives dans le dossier des clubs ? | ✅ **Acquise** — exigence posée dans D-011 |
| R-013 | Le match annulé (l'orage) | ✅ **Tranchée** — D-015, **par défaut** : une règle FFR primerait (I-10) |

**Toutes les décisions métier du domaine A sont prises.** Il ne reste aucune question bloquante
côté Romain ; seule une **question sortante** (I-10) attend une réponse de la Fédération.

### ⚠️ Question sortante — à porter au chantier FFR

Une question de **règle du jeu** est apparue et **ne peut pas être tranchée ici** (décision D-003 :
les deux chantiers restent séparés). `AUDIT-TOURNOI-R92.md` **ne contient rien** sur le sujet —
aucun de ses 25 points de vérification (Q11 → Q25) ne le couvre. C'est à Romain de la porter.

> *« La FFR encadre-t-elle le sort d'un match d'École de Rugby qui n'a pas pu se jouer — forfait
> d'une équipe, ou annulation pour intempéries ? Existe-t-il une règle de classement imposée
> (points attribués, match à rejouer, match neutralisé) ? »*

**Destinataires suggérés** : Directeur EDR du Racing / Comité 92 — la même voie qui a résolu Q23.
**Impact si une règle existe** : elle primerait sur D-011 (forfait) **et** sur D-015 (annulation).

### Domaine C — Sécurité (session 6)

| Réf | Problème | Priorité | Certitude | Statut | Détail |
|---|---|---|---|---|---|
| **R-014** | **La seule écriture ouverte à tous (`mesureSponsors`) n'a aucune limite de débit ni de volume.** Le contenu est strictement validé, mais rien ne borne le nombre d'appels : même budget Google et mêmes 30 exécutions simultanées que la saisie des scores et la page publique | **P1** | CERTAIN (absence de borne) · **INCONNU** (seuil exact de saturation, qui vit chez Google) | IDENTIFIÉ | `AUDIT.md` §C.2 |
| **R-015** | **Deux mots de passe partagés, sans notion de personne** : jamais renouvelés, non révocables individuellement, aucune trace de qui les utilise. La clé SCORES sera dans les mains de tous les bénévoles le jour J, et le restera | **P1** | CERTAIN | IDENTIFIÉ — **deux questions posées à Romain** (voir plus bas) | `AUDIT.md` §C.3 |
| **R-016** | **Deux gestes destructeurs ne sont retenus que par l'écran** : regénérer les poules (efface tous les scores) et réinitialiser le tournoi. Le serveur exécute dès qu'il reçoit la clé, sans vérifier ni confirmer — alors que le même fichier refuse côté serveur pour la réorganisation des poules et le gel J-16 | **P1** | CERTAIN | IDENTIFIÉ — **à regrouper avec R-003** (même code) | `AUDIT.md` §C.4 |
| **R-017** | **Le compteur anti-devinette est remis à zéro par n'importe quelle clé valide, y compris la clé SCORES** — la plus partagée. Son porteur peut donc essayer la clé ADMIN sans plafond effectif | P2 | CERTAIN (mécanisme) · **INCONNU** (gravité réelle — dépend de I-12) | IDENTIFIÉ | `AUDIT.md` §C.5 |
| **R-018** | **Le contenu des courriels est fabriqué par le navigateur** et expédié tel quel sous l'adresse du propriétaire, à tous les clubs acceptés. Le **destinataire**, lui, est toujours relu dans le classeur (protection en place) | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.5 |
| **R-019** | **Aucune trace de qui fait quoi** : ni saisie de score, ni consultation du carnet, ni envoi de courriel, ni réinitialisation. Un litige sportif est donc insoluble | P2 | CERTAIN (côté application) · **INCONNU** (côté journal Google — I-09) | IDENTIFIÉ | `AUDIT.md` §C.5 |
| **R-020** | **Tout le carnet d'adresses ET tous les jetons sortent en une seule requête** (`listerClubsInvites`). Les jetons **ne périment jamais** : un lien de 2026 fonctionne encore en 2028 | P2 | CERTAIN | IDENTIFIÉ — l'expiration relève aussi du **domaine B** | `AUDIT.md` §C.5 |
| **R-021** | **Les 4 bibliothèques tierces du frontend sont copiées sans version, sans provenance, sans empreinte.** Impossible de savoir si elles portent une faille connue, ni si elles sont à jour | P2 | CERTAIN (absence de version) · **INCONNU** (exposition réelle) | IDENTIFIÉ | `AUDIT.md` §C.5 |
| **R-022** | **Deux liens du dossier club (« Site de l'association », « Relayer sur les réseaux ») sont construits sans le filtre `http(s)`** que le code applique partout ailleurs, via une fonction dédiée et commentée | P2 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.5 |
| **R-023** | **La table des droits est interrogée avec l'action brute** : des noms hérités du langage (`constructor`, `toString`) répondent « vrai » et sautent le contrôle de clé. **Aucune conséquence aujourd'hui** (le `switch` retombe sur « Action inconnue ») | P3 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.6 |
| **R-024** | **`dossier-club.html` ne porte pas la protection d'adresse** (`no-referrer`) de ses deux pages sœurs, alors qu'elle porte le même jeton. Portée réelle faible : les navigateurs récents ne transmettent déjà que le nom du site | P3 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.6 |
| **R-025** | **`admin.html`, `saisie.html` et `perfs.html` ne demandent pas aux moteurs de recherche de ne pas les référencer**, contrairement aux 3 pages clubs. Portée très faible : le dépôt est public, les adresses sont connaissables | P3 | CERTAIN | IDENTIFIÉ | `AUDIT.md` §C.6 |

### ⚠️ Questions posées à Romain — domaine C

Deux questions, **et il ne faut écrire aucune clé dans ce dépôt en y répondant** :

| # | Question | Pourquoi elle compte |
|---|---|---|
| **I-11** | Dans l'éditeur Apps Script → *Déployer* → *Gérer les déploiements* : que valent « **Exécuter en tant que** » et « **Qui a accès** » ? | C'est le réglage qui décide si la Web App lit le classeur privé au nom du propriétaire, et si le public peut l'appeler. Le fonctionnement actuel rend les valeurs attendues **PROBABLES**, mais rien ne le prouve depuis le dépôt |
| **I-12** | La clé ADMIN en service est-elle **aléatoire** (gestionnaire de mots de passe) ou **choisie de tête** ? Idem pour la clé SCORES | La réponse change directement la gravité de **R-017**. Réponse attendue : le mot « aléatoire » ou le mot « choisie ». **Jamais la clé elle-même** |

### Domaines non audités

| Domaine | Statut |
|---|---|
| B — RGPD · D — Tests · E — UX · F — Performance · G — Architecture · H — Code | ⬜ **Non audités.** Les 39 points d'attention de la cartographie (A-01→A-14, B-01→B-12, C-01→C-13) leur servent de matière première |

> Le **domaine B (RGPD)** est le prochain, et plusieurs constats du domaine C l'attendent
> explicitement : **R-020** (expiration des jetons), les images Drive publiques (C-08), et la
> conception du journal de **R-019**, qui ne doit surtout pas devenir un fichier de surveillance
> des bénévoles.

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
| **Priorité** | P1 (méthode) |
| **Certitude** | PROBABLE — à confirmer en ÉTAPE 1 |
| **Statut** | IDENTIFIÉ |

**Description** — Le fichier `backend/Tests.gs` existe et semble contenir un grand nombre de tests
automatiques, mais ces tests sont écrits pour être exécutés **chez Google**, pas ici. Tant que ce
point n'est pas résolu, la vérification « les tests passent » dépend d'une action manuelle de
Romain.

**Impact concret** — Le passage d'un problème au statut **TESTÉ** dépend d'une manipulation humaine,
donc peut être oublié.

**Correction recommandée** — À examiner en ÉTAPE 1 puis en domaine D (QA / Tests).
