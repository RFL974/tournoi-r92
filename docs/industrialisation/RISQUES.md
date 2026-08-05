# RISQUES ET PROBLÈMES IDENTIFIÉS — Tournoi R92

> Ce fichier recense **les problèmes constatés pendant les audits**.
> Il est le **registre de suivi** : un problème = une ligne, un statut, une trace.
> L'**explication** de chaque problème (pourquoi, exemple concret, ce qui est proposé) vit dans
> `AUDIT.md`. Ce fichier-ci **suit** ; `AUDIT.md` **explique**.

**Dernière mise à jour** : 2026-08-05 (session 7)
**Audits réalisés** : domaine A (métier), domaine C (sécurité), domaine B (RGPD). Les 5 autres domaines restent à faire.
**Correction réalisée** : R-014 (le P0), par exception validée — voir D-016.

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
| P1 | **13** | 0 | **5** | 0 | 0 | 0 |
| P2 | **22** | 0 | **2** | 0 | 0 | 0 |
| P3 | **4** | 0 | 0 | 0 | 0 | 0 |

**Total : 40 problèmes** — domaine A (13) + domaine C (14) + domaine B (13).

> ✅ **R-014 est le premier problème du chantier à atteindre le statut TESTÉ**, le 2026-08-04.
> Trois preuves réunies, et c'est la raison pour laquelle ce statut est accordé :
>
> 1. **le code en service est bien le nouveau** — Romain a redéployé chez Google (lève **I-13**) ;
> 2. **573 tests sur 573 passent** dans Apps Script (lève **I-02**), dont les **16 vérifications**
>    ajoutées pour cette correction ;
> 3. **la chaîne fonctionne toujours de bout en bout** — le diagnostic « Tester la remontée »
>    confirme écriture, relecture, et **109 relevés réels** déjà remontés des spectateurs. C'est
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
> Ce tableau ne couvre que les **domaines A, C et B**. Les 5 autres domaines n'ont pas été
> audités : leur absence de ligne ne signifie pas leur absence de problème.

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
| **R-014** | **La seule écriture ouverte sans clé (`mesureSponsors`) n'avait aucune limite** : ni par appareil, ni par minute, ni par jour. Chaque envoi ajoutait une ligne au classeur, rien ne les efface, et l'adresse du serveur est publique. Permettait de saturer le classeur (10 M de cases) et les exécutions simultanées — donc de **bloquer la saisie des scores le jour J** | **P0** | **CERTAIN** (absence de limite constatée) · **PROBABLE** (conséquences chiffrées : plafonds Google non testés) | ✅ **TESTÉ** (2026-08-04) — corrigé par D-016 (commit `c1948fc`), **redéployé chez Google**, **573/573 tests OK** dans Apps Script et **chaîne vérifiée de bout en bout** par le diagnostic « Tester la remontée » (écriture, relecture, 109 relevés réels). ⚠️ **Réserve** : le chemin de REFUS (que se passe-t-il une fois un plafond franchi ?) n'a été prouvé que par les tests unitaires, jamais observé en production | `AUDIT.md` §C.2 |
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
| **R-028** | **Personne n'est jamais informé de rien** : aucune page, aucun courriel, aucune ligne du serveur ne dit qui détient ces informations, pourquoi, combien de temps, ni comment demander leur retrait. Recherche des mots *RGPD / confidentialité / données personnelles / mentions légales / consentement* : **zéro occurrence** dans tout le dépôt applicatif | **P1** | CERTAIN | IDENTIFIÉ · **décision D-018 en attente** | `AUDIT.md` §B.2 |
| **R-029** | **La mesure de visibilité des partenaires écrit sur le téléphone de chaque spectateur et remonte au serveur, sans information ni choix** : identifiant d'appareil rangé en mémoire longue, temps d'exposition par tranche de 30 min, envoi à 20 s puis toutes les 10 min puis à la fermeture. **Seul problème du domaine qui tourne déjà en production** (109 relevés réels) | **P1** | **CERTAIN** (fonctionnement) · **PROBABLE** (appréciation juridique) | IDENTIFIÉ · **décision D-019 en attente** | `AUDIT.md` §B.3 |
| **R-030** | **Aucune durée de conservation, aucune purge, nulle part.** Le carnet d'adresses est conservé **délibérément** d'une édition à l'autre, les copies de courriels restent dans Gmail, les contacts FFR et les effectifs passés traversent les réinitialisations. Rien n'expire | **P1** | CERTAIN | IDENTIFIÉ · **décision D-020 en attente** | `AUDIT.md` §B.4 |
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

### Domaines non audités

| Domaine | Statut |
|---|---|
| D — Tests · E — UX · F — Performance · G — Architecture · H — Code | ⬜ **Non audités.** Les 39 points d'attention de la cartographie (A-01→A-14, B-01→B-12, C-01→C-13) leur serviront de matière première |

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
| **Certitude** | **CERTAIN** — confirmé |
| **Statut** | IDENTIFIÉ — **atténué**, pas résolu |

> ✅ **Le harnais fonctionne, et il est en bonne santé** : Romain a lancé `lancerTestsFFR` dans
> Apps Script le 2026-08-04 → **573/573 OK**. L'inconnue **I-02** est donc levée.
>
> ⚠️ **Le risque de méthode, lui, demeure entier** : les tests ne se lancent toujours que **à la
> main, chez Google**. Rien ne les déclenche automatiquement, donc rien ne garantit qu'ils seront
> relancés à la prochaine modification. Deux atténuations ont été trouvées en session 6 :
>
> - écrire les nouvelles fonctions en **cœur pur** (données injectées, aucun accès au classeur)
>   permet de les **rejouer hors de Google** — c'est ce qui a été fait pour les 16 vérifications
>   de R-014, exécutées ici avant même le redéploiement ;
> - le compte d'assertions sert de **contrôle croisé** : 564 appels statiques + 9 dans des boucles
>   = 573, ce qui confirme que le lot exécuté chez Google contenait bien les tests ajoutés.
>
> À reprendre au **domaine D (QA / tests)**.

**Description** — Le fichier `backend/Tests.gs` existe et semble contenir un grand nombre de tests
automatiques, mais ces tests sont écrits pour être exécutés **chez Google**, pas ici. Tant que ce
point n'est pas résolu, la vérification « les tests passent » dépend d'une action manuelle de
Romain.

**Impact concret** — Le passage d'un problème au statut **TESTÉ** dépend d'une manipulation humaine,
donc peut être oublié.

**Correction recommandée** — À examiner en ÉTAPE 1 puis en domaine D (QA / Tests).
