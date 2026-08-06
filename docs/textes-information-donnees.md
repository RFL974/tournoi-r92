# Textes d'information sur les données — Tournoi R92

> **Livrable du chantier C-005** *(industrialisation, referme partiellement **R-028**)*.
> Rédigé le **2026-08-06**. Destiné à être **relu par Romain**, puis **transmis au bureau de
> Génération R92** pour validation.

---

## ⚠️ CE QUE CE DOCUMENT N'EST PAS

**Ce document n'est pas une validation juridique, et il ne prétend pas l'être.**

Il ne dit pas que l'application est « en règle ». Il ne remplace ni l'avis d'un juriste, ni la
décision du bureau. Ce qu'il fait, et rien d'autre :

- il **inventorie** ce que l'application collecte réellement, en disant **d'où vient chaque
  affirmation** ;
- il propose **trois textes** à relire, corriger et valider ;
- il signale **ce qui reste à confirmer par un humain**.

**Aucun de ces textes n'est en ligne.** Les mettre en ligne est une décision de Romain et du bureau.

---

## 1. D'OÙ VIENT CHAQUE AFFIRMATION

Trois provenances, distinguées partout dans ce document :

| Marque | Signification |
|---|---|
| 🔎 **VÉRIFIÉ** | Constaté **dans le code ou la cartographie**, le 2026-08-06. ⚠️ Vérifié dans le **code lui-même**, pas dans ses commentaires — le projet a déjà rencontré des commentaires faux *(R-083)* |
| 📋 **DÉCIDÉ** | Provient d'une **décision déjà validée** par Romain, inscrite dans `docs/industrialisation/DECISIONS.md` |
| ❓ **À CONFIRMER** | **Ne peut pas être établi depuis le dépôt.** Demande une réponse humaine |

### 1.1 — Ce que l'application collecte

| Donnée | Où elle vit | Provenance |
|---|---|---|
| **Nom, prénom et adresse électronique du contact d'un club** | Onglet `ClubsInvites` — colonnes `club_contact_nom`, `club_contact_prenom`, `club_contact_email` | 🔎 **VÉRIFIÉ** |
| **Un jeton d'accès unique par club** *(suite de caractères aléatoire)* | `club_token` | 🔎 **VÉRIFIÉ** |
| **Effectifs déclarés par un club** — nombres de joueurs et d'éducateurs | `nb_joueurs_total`, `nb_educateurs_total`, `detail_effectifs` | 🔎 **VÉRIFIÉ** |
| **Effectifs par équipe** — ⭐ **des nombres, et rien d'autre** | Onglet `Equipes` — `nb_joueurs`, `nb_educateurs` | 🔎 **VÉRIFIÉ** |
| **Contacts de la demande d'autorisation fédérale** : représentant, président, **médecin**, secours *(noms, téléphones, adresses)* | `org_representant_*`, `org_president_*`, `org_medecin_nom`, `org_medecin_tel`, `org_secours_nom`, `org_secours_tel` | 🔎 **VÉRIFIÉ** |
| **Un champ de texte libre « Liste des équipes étrangères »** | `org_equipes_etrangeres_liste` | 🔎 **VÉRIFIÉ** *(le champ existe et est libre)* · ❓ **À CONFIRMER** *(ce qu'on y écrit réellement — voir §5)* |
| **Relevés de visibilité des partenaires** | Onglet `Mesures` | 🔎 **VÉRIFIÉ** · ❓ **actuellement désactivés** — à confirmer que l'interrupteur reste éteint |

> ⭐ **Le point le plus important de tout cet inventaire** : **aucun enfant n'est identifié.**
> L'application ne stocke **ni nom, ni prénom, ni date de naissance, ni numéro de licence** d'un
> joueur. Les enfants n'y existent que comme **des nombres**. 🔎 **VÉRIFIÉ.**

### 1.2 — Ce qui sort de l'application, et ce qui n'en sort jamais

| | Provenance |
|---|---|
| ✅ **L'adresse d'un club n'est JAMAIS renvoyée** — pas même au club concerné. La fonction qui construit son dossier ne reçoit que **le nom du club et le prénom du contact** | 🔎 **VÉRIFIÉ dans le code** *(et non dans le commentaire qui l'affirme)* |
| ✅ **Les contacts président, représentant, médecin et secours ne sortent JAMAIS** — absents de toutes les vues publiques | 🔎 **VÉRIFIÉ** |
| ✅ **Le téléphone du référent du jour** n'est visible que **derrière le jeton** d'un club invité | 🔎 **VÉRIFIÉ** |
| ⚠️ **Le nom et l'adresse du contact d'invitation SONT publics** — servis à qui les demande, sans jeton *(c'est voulu : il faut bien pouvoir répondre à l'invitation)*. **Le téléphone, lui, a été volontairement retiré** | 🔎 **VÉRIFIÉ** |
| ✅ **Aucun cookie, aucun traceur publicitaire, aucun outil de mesure d'audience extérieur** | 🔎 **VÉRIFIÉ** |
| ⚠️ **Les polices d'écriture sont chargées depuis les serveurs de Google sur 7 pages** — l'adresse réseau de chaque visiteur y est donc transmise, sans que rien ne le dise | 🔎 **VÉRIFIÉ** |
| ✅ **Le classeur de données est privé** *(propriétaire seul)* | ❓ **CONFIRMÉ HUMAINEMENT** par Romain le 2026-08-04, capture à l'appui |

### 1.3 — Les durées de conservation

📋 **DÉCIDÉ — décision D-020, validée par Romain le 2026-08-05.** Reprises ici **telles quelles**,
sans ajout ni interprétation.

| Donnée | Durée retenue |
|---|---|
| Contacts des clubs *(le carnet d'adresses)* | **3 éditions** sans participation, puis suppression |
| Effectifs déclarés d'une édition | **Effacés à la réinitialisation** du tournoi |
| Contacts de la demande fédérale *(représentant, président, médecin, secours)* | **1 an**, ou à chaque réinitialisation |
| Champ libre « équipes étrangères » | **Effacé après envoi du dossier** |
| Relevés de visibilité des partenaires | **Effacés après remise de la fiche au partenaire** |
| Journal de saison *(`Historique`)* | **Conservé** — aucune donnée personnelle |
| Copies des courriels envoyés *(boîte Gmail)* | **1 an** |

> ⚠️ **Ces durées sont décidées, elles ne sont pas encore appliquées automatiquement** — et c'est
> volontaire : **toute suppression reste déclenchée par un humain** *(D-020)*. Les textes ci-dessous
> annoncent donc un engagement **qui doit être tenu à la main** tant que l'outillage n'existe pas.

---

## 2. TEXTE 1 — bas du courriel d'invitation

> À placer en fin de message, après la signature.

---

**Vos informations**

Génération R92 conserve le nom, le prénom et l'adresse électronique du contact de votre club, ainsi
que le nombre de joueurs et d'éducateurs que vous déclarez. Ces informations servent uniquement à
organiser le tournoi : vous inviter, préparer les équipes et vous transmettre le dossier de la
journée.

Nous ne conservons **aucune information nominative sur les enfants** : ni nom, ni date de naissance,
ni numéro de licence. Seuls des effectifs, c'est-à-dire des nombres.

Les coordonnées de votre contact sont conservées d'une édition à l'autre, puis supprimées après
**trois éditions sans participation**. Les effectifs déclarés sont effacés à la remise à zéro du
tournoi.

Pour consulter, corriger ou faire supprimer ces informations, écrivez à **generationr92@gmail.com**.

---

## 3. TEXTE 2 — bas de la page de réponse du club

> Même substance, formulation adaptée à un écran où l'on saisit des effectifs.

---

**Ce que deviennent les informations que vous saisissez ici**

Les informations de cette page — le nom, le prénom et l'adresse de votre contact, le nombre
d'équipes engagées, le nombre de joueurs et d'éducateurs — sont enregistrées par Génération R92 pour
organiser le tournoi.

**Aucune information nominative sur les enfants n'est demandée ni conservée** : uniquement des
effectifs.

Le lien qui vous a permis d'ouvrir cette page vous est propre : ne le transmettez qu'aux personnes
de votre club qui doivent répondre.

Coordonnées du contact : conservées **3 éditions** sans participation. Effectifs : effacés à la
remise à zéro du tournoi.

Pour consulter, corriger ou faire supprimer ces informations : **generationr92@gmail.com**.

---

## 4. TEXTE 3 — section « Tournoi » à ajouter à la page RGPD du site

> ⚠️ **À poser par Romain sur le site vitrine.** Ce chantier ne modifie pas ce site *(décision
> D-005 : périmètre fermé)*. La page RGPD **existe déjà** — il s'agit d'y **ajouter une section**,
> pas d'en créer une.

---

### Tournois et clubs invités

**Qui est responsable.** Génération R92 *(voir la formulation à retenir au §6)*.
**Contact :** generationr92@gmail.com

**Ce que nous conservons, et pourquoi**

| Ce que nous conservons | Pourquoi | Combien de temps |
|---|---|---|
| Nom, prénom et adresse électronique du **contact** de chaque club invité | Inviter le club, échanger sur son engagement, lui transmettre le dossier de la journée | **3 éditions** sans participation, puis suppression |
| Nombre d'équipes, de joueurs et d'éducateurs **déclarés** par le club | Constituer les poules, dimensionner les terrains, les repas et l'encadrement | **Effacés à la remise à zéro** du tournoi |
| Coordonnées des personnes requises par la demande d'autorisation fédérale *(représentant du club, président, médecin, secours)* | Obligation de la Fédération Française de Rugby pour autoriser un tournoi | **1 an**, ou à chaque remise à zéro |
| Nom et adresse électronique du **contact d'inscription** affiché sur la page d'invitation | Permettre à un club de répondre | Le temps de l'édition en cours |

**Ce que nous ne conservons pas — et c'est le point le plus important**

> **Aucune information nominative concernant un enfant.** Ni nom, ni prénom, ni date de naissance,
> ni numéro de licence. Les enfants n'apparaissent dans nos données **que sous forme d'effectifs**,
> c'est-à-dire de nombres.

**Ce que nous ne faisons pas**

Aucun cookie publicitaire. Aucun traceur. Aucun outil de mesure d'audience extérieur. Nous ne
revendons ni ne transmettons ces informations à personne.

**Ce que vous pouvez demander**

Consulter les informations vous concernant, les faire corriger, ou en demander la suppression —
en écrivant à **generationr92@gmail.com**.

**Hébergement.** Les données du tournoi sont conservées dans un classeur Google Sheets à accès
restreint, et le site est hébergé par GitHub Pages. Les polices d'écriture des pages sont chargées
depuis les serveurs de Google, ce qui leur transmet l'adresse réseau du visiteur.

---

## 5. CE QUI RESTE À CONFIRMER — par un humain, pas par le code

❓ Ces cinq points **ne peuvent pas être établis depuis le dépôt**. Ils doivent être tranchés avant
que les textes soient mis en ligne.

| # | Ce qu'il faut confirmer | Pourquoi ça compte |
|---|---|---|
| **1** | **Qu'écrit-on réellement dans le champ « Liste des équipes étrangères » ?** Le champ est **libre**, et il alimente le formulaire fédéral. S'il devait contenir des **noms d'enfants**, ce serait **le seul endroit** de l'application où un mineur cesse d'être un nombre — et les textes ci-dessus deviendraient **inexacts** | ⚠️ **Bloquant** pour la phrase « aucune information nominative sur un enfant » |
| **2** | **Le bureau valide-t-il ces textes ?** Ils **engagent l'association**, pas moi | Bloquant pour la mise en ligne |
| **3** | **Quelle formulation retenir** pour la situation de l'association *(§6)* | Bloquant pour la mise en ligne |
| **4** | **L'interrupteur des partenaires reste-t-il éteint ?** S'il est rallumé, **une mesure de visibilité repart** sur le téléphone des spectateurs, et il faudra **un texte de plus** *(décision D-019, voie « informer »)* | Non bloquant aujourd'hui |
| **5** | **Les durées annoncées seront-elles réellement tenues ?** Elles sont décidées, mais **aucun outil ne les applique** : ce sont des gestes manuels | ⚠️ **Un engagement écrit non tenu est pire que pas d'engagement** |

---

## 6. LA SITUATION DE L'ASSOCIATION — deux formulations, à choisir

Les mentions légales du site indiquent aujourd'hui : *« Génération R92 — Association loi 1901
**(déclaration en cours)** »*, avec l'adresse du siège et le numéro RNA marqués *« à définir »*.
🔎 **VÉRIFIÉ** le 2026-08-05.

**Conséquence de fait** : tant que la déclaration n'a pas abouti, l'association n'a pas d'existence
juridique propre. **La personne qui détient et gère ces données aujourd'hui est Romain**, à titre
personnel. *(C'est exactement ce que constatait la décision **D-021**.)*

### Formulation A — elle dit la situation

> **Responsable des informations : Génération R92**, association loi 1901 **en cours de
> déclaration**. Dans l'attente de cette déclaration, ces informations sont détenues et gérées par
> **Romain Rifleu**, qui organise le tournoi pour le compte de l'association.
> **Contact : generationr92@gmail.com**

### Formulation B — elle reste simple

> **Responsable des informations : Génération R92**, association loi 1901.
> **Contact : generationr92@gmail.com**

### Ce qui les sépare

| | **A** | **B** |
|---|---|---|
| **Exactitude** | ✅ Exacte | ⚠️ Dit « association loi 1901 » sans réserve, alors que la déclaration est en cours |
| **Cohérence avec le site** | ✅ **Cohérente** — les mentions légales disent déjà « déclaration en cours » | ⚠️ **En contradiction avec la page voisine** du même site |
| **Nomme la personne réellement responsable** | ✅ Oui | ❌ Non |
| **Simplicité de lecture** | Plus longue | Plus courte |

> **Ma recommandation : la formulation A**, pour une raison qui n'est pas juridique mais pratique :
> **le site dit déjà « déclaration en cours » sur sa page voisine.** Écrire l'inverse deux clics
> plus loin serait remarqué — et dans un texte dont le seul objet est d'inspirer confiance, une
> contradiction visible coûte plus cher qu'une phrase de trois lignes.
>
> **La formulation B redevient la bonne le jour où la déclaration aboutit.** Ce n'est donc pas un
> choix définitif : c'est un choix **pour maintenant**.

---

## 7. CE QUE CE DOCUMENT NE REFERME PAS

> ⚠️ **Le problème R-028 reste OUVERT.**

Ce document **produit** les textes. Il ne les met pas en ligne — et un texte que personne ne lit
n'informe personne.

**R-028 ne pourra être clôturé que lorsque** :

1. le bureau aura **validé** les textes ;
2. les textes 1 et 2 seront **dans l'application** *(courriel d'invitation, page de réponse)* ;
3. le texte 3 sera **sur la page RGPD** du site vitrine.

Les étapes 2 et 3 appartiennent à Romain : le site vitrine est **hors périmètre** *(D-005)*, et
la modification de l'application relève d'un chantier de code, pas de celui-ci.

---

*Document produit par le chantier C-005 de l'industrialisation de Tournoi R92 — 2026-08-06.
Aucune ligne de l'application n'a été modifiée pour l'écrire.*
