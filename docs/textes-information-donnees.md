# Textes d'information sur les données — Tournoi R92

> **Livrable du chantier C-005** *(industrialisation, prépare **R-028**)*.
> Rédigé le **2026-08-06**, corrigé le même jour à la demande de Romain.
> ✅ **Travail documentaire TERMINÉ le 2026-08-06** — les deux points qui pouvaient rendre un texte
> **faux** sont tranchés *(§9, points 1 et 6)*. Les trois points restants sont **administratifs** :
> ils retardent la mise en ligne, ils ne remettent rien en cause dans ce qui est écrit.
> Destiné à être **relu**, puis **transmis au bureau de l'association organisatrice** pour validation.

---

## ⚠️ CE QUE CE DOCUMENT N'EST PAS

**Ce document n'est pas une validation juridique, et il ne prétend pas l'être.**

Il ne dit pas que l'application est « en règle ». Il ne remplace ni l'avis d'un juriste, ni la
décision du bureau. Ce qu'il fait, et rien d'autre :

- il **inventorie** ce que l'application collecte réellement, en disant **d'où vient chaque
  affirmation** ;
- il propose **trois textes** à relire, corriger et valider ;
- il signale **ce qui reste à confirmer par un humain**.

**Aucun de ces textes n'est en ligne.**

---

## 0. AUCUN NOM RÉEL DANS CE DOCUMENT — c'est délibéré

> **Décision de Romain, 2026-08-06** : *« Je ne souhaite pas, à ce stade, faire apparaître de noms
> réels d'associations, de clubs, d'écoles de rugby, d'entreprises ou de structures partenaires.
> C'est trop prématuré dans notre phase actuelle. »*

Le document utilise donc **des désignations génériques** et **des champs à compléter**, notés entre
crochets. Il reste **exact et utilisable** en l'état ; il devient **publiable** une fois les crochets
remplis.

| Champ à compléter | Ce qu'on y mettra |
|---|---|
| `[ASSOCIATION ORGANISATRICE]` | Le nom de l'association qui organise le tournoi |
| `[ADRESSE DE CONTACT]` | L'adresse électronique où écrire pour consulter, corriger ou supprimer |
| `[PRESTATAIRE D'HÉBERGEMENT DU SITE]` | L'hébergeur des pages web |
| `[SERVICE DE TABLEUR EN LIGNE]` | Le service qui héberge le classeur de données |
| `[PRESTATAIRE DES POLICES D'ÉCRITURE]` | Le service extérieur qui fournit les polices des pages |

> ✅ **Avantage de cette forme** : le jour où la situation de l'association évolue, ou si un
> prestataire change, **on remplit les crochets — on ne réécrit pas le document.**

---

## 1. D'OÙ VIENT CHAQUE AFFIRMATION

| Marque | Signification |
|---|---|
| 🔎 **VÉRIFIÉ** | Constaté **dans le code ou la cartographie**, le 2026-08-06. ⚠️ Vérifié dans le **code lui-même**, pas dans ses commentaires — le projet a déjà rencontré des commentaires faux *(R-083)* |
| 📋 **DÉCIDÉ** | Provient d'une **décision déjà validée**, inscrite dans `docs/industrialisation/DECISIONS.md` |
| ❓ **À CONFIRMER** | **Ne peut pas être établi depuis le dépôt.** Demande une réponse humaine |

---

## 2. ⭐ LES TROIS CATÉGORIES DE DONNÉES

> **Correction demandée par Romain**, et elle porte sur le point le plus délicat du document.
>
> Ma première version affirmait qu'aucune information nominative concernant un enfant **ne pouvait**
> être enregistrée. **C'était une affirmation trop forte** : elle confondait *ce que l'application
> demande* avec *ce qu'un champ libre permet techniquement d'écrire*. Un texte d'information qui
> promet plus que ce qui est garanti **est pire qu'un texte absent**.

### Catégorie 1 — ce que l'application DEMANDE et traite par conception

*Champs prévus, nommés, avec un type et un usage définis.*

| Donnée | Où | Provenance |
|---|---|---|
| Nom, prénom, adresse électronique du **contact d'un club participant** | `ClubsInvites` — `club_contact_nom`, `club_contact_prenom`, `club_contact_email` | 🔎 **VÉRIFIÉ** |
| Un **jeton d'accès** unique par structure invitée | `club_token` | 🔎 **VÉRIFIÉ** |
| **Effectifs déclarés** — nombres de joueurs et d'éducateurs | `nb_joueurs_total`, `nb_educateurs_total`, `detail_effectifs` | 🔎 **VÉRIFIÉ** |
| **Effectifs par équipe** — ⭐ des **nombres**, et rien d'autre | `Equipes` — `nb_joueurs`, `nb_educateurs` | 🔎 **VÉRIFIÉ** |
| **Contacts exigés par la demande d'autorisation fédérale** : représentant, président, **médecin**, secours *(noms, téléphones, adresses)* | `org_representant_*`, `org_president_*`, `org_medecin_*`, `org_secours_*` | 🔎 **VÉRIFIÉ** |
| **Relevés de visibilité des partenaires** | Onglet `Mesures` | 🔎 **VÉRIFIÉ** · ❓ **actuellement désactivés** |

> ⭐ **Par conception, l'application ne demande aucune information nominative concernant un
> enfant** — ni nom, ni prénom, ni date de naissance, ni numéro de licence. **Aucun champ n'est
> prévu pour cela.** Les enfants n'y sont représentés que par des **effectifs**. 🔎 **VÉRIFIÉ.**

### Catégorie 2 — ⚠️ les champs libres, où l'organisateur POURRAIT écrire autre chose

*Zones de texte sans format imposé. L'application ne demande rien de particulier — mais elle
n'empêche rien non plus.*

| Champ libre | Libellé à l'écran | Ce qui y est attendu | Qui peut y écrire |
|---|---|---|---|
| `org_equipes_etrangeres_liste` | « **Liste des équipes étrangères** » | ✅ **« Nom du club, pays »** — libellé du formulaire fédéral, vérifié le 2026-08-06. **Aucune information nominative n'y est demandée** | L'organisateur *(écran d'administration)* |
| `tournoi_description` | La description du tournoi | L'organisateur |
| `tarif_engagement_modalites` | Les modalités de règlement | L'organisateur |
| `reglement` | Le règlement sportif — ⚠️ **le champ existe mais a été retiré de l'écran** : il ne peut pas être rempli aujourd'hui *(R-012)* | *(personne, en l'état)* |

> ✅ **Un fait vérifié qui compte, et qui n'était pas acquis : un club participant NE PEUT SAISIR
> AUCUN TEXTE LIBRE.** Sa page de réponse ne contient **aucune zone de texte** — uniquement des
> nombres et des choix. 🔎 **VÉRIFIÉ.**
>
> **Autrement dit : le risque de la catégorie 2 est entièrement du côté de l'organisateur**, jamais
> du côté des structures invitées.

> ⚠️ **Ce que cela implique pour les textes d'information** : on ne peut pas écrire *« aucune
> information nominative concernant un enfant ne sera jamais enregistrée »*. On peut écrire
> *« l'application n'en demande aucune »*, et **s'engager à ne pas en saisir dans les champs
> libres**. C'est un **engagement de l'organisateur**, pas une garantie technique — et le dire
> ainsi est la seule formulation exacte.

### Catégorie 3 — ce qui n'est ni demandé ni nécessaire

*L'application fonctionne entièrement sans.* 🔎 **VÉRIFIÉ.**

- **Identité des enfants** : nom, prénom, date de naissance, numéro de licence, photo ;
- **Coordonnées des familles** ;
- **Toute donnée de santé** *(hors le contact du médecin exigé par la demande fédérale, qui concerne
  un adulte responsable et non un enfant)* ;
- **Toute donnée de paiement** ;
- **Aucun cookie publicitaire, aucun traceur, aucun outil de mesure d'audience extérieur.**

---

## 3. CE QUI SORT DE L'APPLICATION, ET CE QUI N'EN SORT JAMAIS

| | Provenance |
|---|---|
| ✅ **L'adresse d'un club n'est JAMAIS renvoyée** — pas même au club concerné. La fonction qui construit son dossier ne reçoit que **le nom de la structure et le prénom du contact** | 🔎 **VÉRIFIÉ dans le code**, et non dans le commentaire qui l'affirme |
| ✅ **Les contacts président, représentant, médecin et secours ne sortent JAMAIS** — absents de toutes les vues publiques | 🔎 **VÉRIFIÉ** |
| ✅ **Le contenu des champs libres ne sort pas non plus** — la « liste des équipes étrangères » n'est exposée dans aucune vue publique | 🔎 **VÉRIFIÉ** |
| ✅ **Le téléphone du référent du jour** n'est visible que **derrière le jeton** d'une structure invitée | 🔎 **VÉRIFIÉ** |
| ⚠️ **Le nom et l'adresse du contact d'inscription SONT publics** — servis à qui les demande, sans jeton. C'est **voulu** : il faut pouvoir répondre à l'invitation. **Le téléphone, lui, a été volontairement retiré** | 🔎 **VÉRIFIÉ** |
| ⚠️ **Les polices d'écriture sont chargées depuis un prestataire extérieur sur 7 pages** — l'adresse réseau de chaque visiteur lui est donc transmise, sans que rien ne le dise | 🔎 **VÉRIFIÉ** |
| ✅ **Le classeur de données est privé** *(propriétaire seul)* | ❓ **CONFIRMÉ HUMAINEMENT** le 2026-08-04, capture à l'appui |

---

## 4. LES DURÉES DE CONSERVATION

📋 **DÉCIDÉ — décision D-020.** Reprises **telles quelles**, sans ajout ni interprétation.

| Donnée | Durée retenue |
|---|---|
| Contacts des structures invitées *(le carnet d'adresses)* | **3 éditions** sans participation, puis suppression |
| Effectifs déclarés d'une édition | **Effacés à la réinitialisation** du tournoi |
| Contacts de la demande fédérale *(représentant, président, médecin, secours)* | **1 an**, ou à chaque réinitialisation |
| Champ libre « équipes étrangères » | **Effacé après envoi du dossier** |
| Relevés de visibilité des partenaires | **Effacés après remise de la fiche au partenaire** |
| Journal de saison | **Conservé** — aucune donnée personnelle |
| Copies des courriels envoyés | **1 an** |

> ⚠️ **Ces durées sont décidées, elles ne sont pas encore appliquées automatiquement** — et c'est
> volontaire : **toute suppression reste déclenchée par un humain** *(D-020)*. Les textes ci-dessous
> annoncent donc un engagement **qui doit être tenu à la main**.

---

## 5. TEXTE 1 — bas du courriel d'invitation

---

**Vos informations**

[ASSOCIATION ORGANISATRICE] conserve le nom, le prénom et l'adresse électronique du contact de votre
structure, ainsi que le nombre de joueurs et d'éducateurs que vous déclarez. Ces informations
servent uniquement à organiser le tournoi : vous inviter, préparer les équipes et vous transmettre
le dossier de la journée.

**Nous ne vous demandons aucune information nominative concernant un enfant** — ni nom, ni date de
naissance, ni numéro de licence. Seuls des effectifs, c'est-à-dire des nombres.

Les coordonnées de votre contact sont conservées d'une édition à l'autre, puis supprimées après
**trois éditions sans participation**. Les effectifs déclarés sont effacés à la remise à zéro du
tournoi.

Pour consulter, corriger ou faire supprimer ces informations, écrivez à **[ADRESSE DE CONTACT]**.

---

## 6. TEXTE 2 — bas de la page de réponse

---

**Ce que deviennent les informations saisies ici**

Les informations de cette page — le nom, le prénom et l'adresse de votre contact, le nombre
d'équipes engagées, le nombre de joueurs et d'éducateurs — sont enregistrées par
[ASSOCIATION ORGANISATRICE] pour organiser le tournoi.

**Aucune information nominative concernant un enfant n'est demandée sur cette page** : uniquement
des effectifs.

Le lien qui vous a permis d'ouvrir cette page vous est propre : ne le transmettez qu'aux personnes
de votre structure qui doivent répondre.

Coordonnées du contact : conservées **3 éditions** sans participation. Effectifs : effacés à la
remise à zéro du tournoi.

Pour consulter, corriger ou faire supprimer ces informations : **[ADRESSE DE CONTACT]**.

---

## 7. TEXTE 3 — section « Tournoi » à ajouter à la page de confidentialité du site

> ⚠️ **À poser par Romain.** Ce chantier ne modifie pas le site *(décision D-005 : périmètre
> fermé)*. La page existe déjà — il s'agit d'y **ajouter une section**.

---

### Tournois et structures invitées

**Responsable :** [ASSOCIATION ORGANISATRICE], organisatrice du tournoi.
**Contact :** [ADRESSE DE CONTACT]

**Ce que nous conservons, et pourquoi**

| Ce que nous conservons | Pourquoi | Combien de temps |
|---|---|---|
| Nom, prénom et adresse électronique du **contact** de chaque structure invitée | Inviter la structure, échanger sur son engagement, lui transmettre le dossier de la journée | **3 éditions** sans participation, puis suppression |
| Nombre d'équipes, de joueurs et d'éducateurs **déclarés** | Constituer les poules, dimensionner les terrains, les repas et l'encadrement | **Effacés à la remise à zéro** du tournoi |
| Coordonnées des personnes exigées par la demande d'autorisation de la fédération *(représentant, président, médecin, secours)* | Obligation fédérale pour autoriser un tournoi | **1 an**, ou à chaque remise à zéro |
| Nom et adresse électronique du **contact d'inscription** affiché sur la page d'invitation | Permettre à une structure de répondre | Le temps de l'édition en cours |

**Concernant les enfants**

> **Notre application ne demande aucune information nominative concernant un enfant** : aucun champ
> n'est prévu pour un nom, une date de naissance ou un numéro de licence. Les enfants n'y sont
> représentés que par des **effectifs**.
>
> Certains champs de commentaire, réservés à l'organisation, sont libres : ils permettent
> techniquement d'y écrire n'importe quel texte. Le seul qui puisse concerner des participants —
> la liste des équipes étrangères — **attend le nom du club et le pays**, et rien d'autre.
> **Nous nous engageons à n'y saisir aucune information nominative concernant un enfant**, et à
> effacer ces champs une fois le dossier de la journée envoyé.

**Ce que nous ne faisons pas**

Aucun cookie publicitaire. Aucun traceur. Aucun outil de mesure d'audience extérieur. Nous ne
revendons ni ne transmettons ces informations à des tiers.

**Ce que vous pouvez demander**

Consulter les informations vous concernant, les faire corriger, ou en demander la suppression — en
écrivant à **[ADRESSE DE CONTACT]**.

**Hébergement.** Les données du tournoi sont conservées dans un classeur en ligne à accès restreint,
fourni par [SERVICE DE TABLEUR EN LIGNE] ; le site est hébergé par [PRESTATAIRE D'HÉBERGEMENT DU
SITE]. Les polices d'écriture des pages sont chargées depuis les serveurs de
[PRESTATAIRE DES POLICES D'ÉCRITURE], ce qui leur transmet l'adresse réseau du visiteur.

---

## 8. LA SITUATION DE L'ASSOCIATION — une formulation qui ne vieillira pas

> **Décision de Romain, 2026-08-06** : *« Je ne souhaite pas figer inutilement l'identité juridique
> dans le document alors que la situation est encore en cours. »*

Les deux formulations proposées dans la version précédente — l'une mentionnant la situation
administrative, l'autre l'ignorant — **sont retirées**. Toutes deux figeaient un état qui va changer.

**Formulation retenue, générique et exacte aujourd'hui comme demain :**

> **Responsable : [ASSOCIATION ORGANISATRICE], organisatrice du tournoi.
> Contact : [ADRESSE DE CONTACT]**

**Pourquoi elle tient dans le temps** : elle désigne le responsable **par son rôle** — celui qui
organise le tournoi et détient les informations — et non par un statut juridique qui évolue. Elle
reste vraie quel que soit l'état d'avancement des formalités.

> ⚠️ **Une précision qui appartient au bureau, pas à ce document** : tant que les formalités ne sont
> pas achevées, **la personne qui détient et gère ces informations en pratique** n'est pas la même
> que celle qui les détiendra ensuite *(constat de la décision **D-021**)*. **Faut-il le mentionner
> dans le texte public ?** C'est une question pour le bureau — elle est signalée ici, elle n'est pas
> tranchée.

---

## 9. CE QUI RESTE À CONFIRMER — par un humain

| # | Ce qu'il faut confirmer | Pourquoi ça compte |
|---|---|---|
| ~~**1**~~ | ✅ **CONFIRMÉ le 2026-08-06 — et le constat d'origine de l'audit était inexact.** Le formulaire fédéral dit : *« Précisez ci-dessous les équipes étrangères (**nom du club, pays**) »*. **Aucune information nominative n'est demandée dans ce champ.** Il reste **libre** *(catégorie 2)*, donc l'engagement des textes est **maintenu** — mais il ne repose plus sur une hypothèse : il confirme une pratique. ⚡ **Point distinct, à porter au bureau** : le formulaire exige **par ailleurs**, dans ses **pièces à fournir**, les noms, prénoms et dates de naissance des joueurs et dirigeants étrangers. **Cette liste vit dans le dossier de l'association, hors de l'application** — elle échappe donc à tout ce que ce document peut couvrir | ✅ **Levé** |
| **2** | **Le bureau valide-t-il ces textes ?** Ils **engagent l'association**, pas moi | Bloquant pour la mise en ligne |
| **3** | **Les crochets** — nom de l'association, adresse de contact, prestataires | Bloquant pour la mise en ligne |
| **4** | **Mentionne-t-on la situation en cours** dans le texte public ? *(§8)* | Question du bureau |
| **5** | **L'interrupteur des partenaires reste-t-il éteint ?** S'il est rallumé, une mesure de visibilité repart sur le téléphone des spectateurs, et il faudra **un texte de plus** *(D-019)* | Non bloquant aujourd'hui |
| **6** | **Les durées annoncées seront-elles tenues ?** Elles sont décidées, mais **aucun outil ne les applique** : ce sont des gestes manuels | ⚠️ **Un engagement écrit non tenu est pire que pas d'engagement** |

---

## 10. CE QUE CE DOCUMENT NE REFERME PAS

> ⚠️ **Le problème R-028 reste OUVERT.**

Ce document **produit** les textes. Il ne les met pas en ligne — et un texte que personne ne lit
n'informe personne.

**R-028 ne pourra être clôturé que lorsque** :

1. le bureau aura **validé** les textes, et les crochets seront remplis ;
2. les textes 1 et 2 seront **dans l'application** ;
3. le texte 3 sera **sur la page de confidentialité du site**.

Les étapes 2 et 3 appartiennent à Romain : le site est **hors périmètre** *(D-005)*, et la
modification de l'application relève d'un chantier de code, pas de celui-ci.

---

*Document produit par le chantier C-005 de l'industrialisation de Tournoi R92 — 2026-08-06.
Aucune ligne de l'application n'a été modifiée pour l'écrire. Aucun nom réel n'y figure.*
