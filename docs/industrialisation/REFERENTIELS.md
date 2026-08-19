# RÉFÉRENTIELS — la source unique du chantier Confiance

> ⚖️ **À quoi sert ce document.** Il répond à **une seule question** : *sur quel texte officiel
> repose telle exigence de cybersécurité ou de protection des données ?*
>
> Il est né du chantier **Confiance** (étape **CF-0**, 2026-08-19), et il est la **source unique**
> du lien entre une mesure et le texte qui la fonde — au sens de `CLAUDE.md` **§8 quater**.
>
> 🔗 **Ailleurs dans le dépôt, on écrit l'identifiant — jamais le contenu.** *(Voir `CLAUDE.md`
> **§8 quinquies**.)*

---

## SOMMAIRE

- [0. Ce que ce document n'est PAS](#0-ce-que-ce-document-nest-pas)
- [0 bis. ⭐ Où en est réellement Maxilou — à lire en premier](#0-bis--où-en-est-réellement-maxilou--à-lire-en-premier)
- [1. Comment lire une fiche, et les 6 qualifications](#1-comment-lire-une-fiche-et-les-6-qualifications)
- [2. Les référentiels applicables (R1 → R16)](#2-les-référentiels-applicables-r1--r16)
- [3. Les textes ÉCARTÉS, et pourquoi (R17 → R19)](#3-les-textes-écartés-et-pourquoi-r17--r19)
- [4. Les obligations établies (O1 → O7)](#4-les-obligations-établies-o1--o7)
- [5. Les recommandations officielles établies (RC1 → RC5)](#5-les-recommandations-officielles-établies-rc1--rc5)
- [6. Bonnes pratiques et durcissements volontaires](#6-bonnes-pratiques-et-durcissements-volontaires)
- [7. Table mesure ↔ référentiel](#7-table-mesure--référentiel)
- [8. Journal des vérifications](#8-journal-des-vérifications)

---

## 0. CE QUE CE DOCUMENT N'EST PAS

**Ce document n'est pas un avis juridique, et il ne prétend pas l'être.**

Il ne dit pas que Maxilou est « en règle ». Il ne remplace ni l'avis d'un juriste, ni la décision
d'une structure. Ce qu'il fait, et rien d'autre :

- il **nomme** les textes officiels réellement consultés, avec leur **version** et leur **adresse** ;
- il dit **pourquoi** chacun s'applique — ou **pourquoi il ne s'applique pas** ;
- il **sépare** ce qui est obligatoire de ce qui est conseillé, et de ce qui n'est qu'un confort ;
- il **date** chaque vérification, pour qu'on sache quand le texte a été lu pour la dernière fois.

> 🎯 **Pourquoi ce document existe, et c'est une leçon payée comptant.** Lors de **CF-0**, la
> vérification des sources a montré que **sur 15 référentiels proposés de mémoire, 6 étaient faux,
> périmés ou mal calibrés** : une position de la CNIL sur les polices d'écriture **qui n'existe
> pas**, une recommandation **modifiée en décembre 2025**, un article de loi **déplacé en mai
> 2024**, un guide de l'ANSSI **marqué obsolète par l'ANSSI elle-même**.
>
> **Sans vérification, nous aurions corrigé Maxilou contre des textes inexistants.**

---

## 0 bis. ⭐ OÙ EN EST RÉELLEMENT MAXILOU — à lire en premier

> ⚠️ **Cette section commande la lecture de tout le reste du document.** Sans elle, chaque
> « obligation » ci-dessous se lit comme un manquement — alors que la quasi-totalité sont des
> **préalables**.

### Les trois états, à ne jamais confondre

| | Ce que c'est | Ce qui est vrai aujourd'hui |
|---|---|---|
| 🔵 **ÉTAT ACTUEL** | Ce que Maxilou **est** au moment où ces lignes sont écrites | **Développement personnel.** Romain construit Maxilou **de sa propre initiative**. **Données fictives.** ⛔ **Aucune exploitation réelle n'a jamais eu lieu** |
| 🟡 **PRÉREQUIS AVANT UTILISATION RÉELLE** | Ce qu'il faudra avoir fait **avant** que de vraies données entrent | La plus grande partie de ce document |
| ⛔ **DÉCISIONS FUTURES DES STRUCTURES** | Ce qui **n'appartient pas à ce chantier** | Tout ce qui suppose qu'une structure ait décidé quelque chose |

### Ce qui est établi sur l'état actuel, et vérifié dans le dépôt

| Fait | Où il est établi |
|---|---|
| **Le tournoi en base est fictif** — de vrais noms de clubs, des engagements inventés | `ETAT.md` **I-04**, levé le 2026-08-04 |
| **Le classeur ne contient aucune donnée personnelle de tiers** — les seules adresses présentes sont celles de Romain et de son épouse, saisies pour tester les envois | `ETAT.md` **I-03 + I-04** |
| **Aucune journée réelle n'a jamais été jouée avec cette application** | `RAPPORT-AUDIT.md` §7 |
| **Les 109 relevés de mesure de visibilité viennent des appareils de Romain** | `DECISIONS.md` |

➡️ **Conséquence, et elle est écrite depuis le 2026-08-04 dans `ETAT.md`** :

> **« La question n'est donc pas "faut-il réparer", mais "faut-il préparer". »**

### ⛔ Ce que ce document ne dira JAMAIS

- ❌ Il ne dira **jamais** que Maxilou est utilisé en conditions réelles — **ce n'est pas le cas** ;
- ❌ Il ne dira **jamais** que l'École de Rugby du Racing Club de France ou l'association
  Génération R92 ont **commandé**, **étudié**, **validé** ou **adopté** Maxilou. **Aucune des deux
  ne l'a fait à ce jour**, et aucune décision ne doit leur être attribuée à leur place ;
- ❌ Il ne présumera **jamais** de leur adoption future. Elles pourront accepter, demander des
  modifications, ou **ne pas souhaiter utiliser la solution**.

### Le parcours réel, tel qu'il est prévu

```
  ① Construire et fiabiliser Maxilou   ← 🔵 NOUS SOMMES ICI
       développement · industrialisation · chantier Confiance · tests sur données FICTIVES
              ↓
  ② Atteindre un état jugé suffisamment propre
              ↓
  ③ Présenter Maxilou à l'EDR et/ou à Génération R92    ⚠️ démonstration, données FICTIVES
              ↓
  ④ Recueillir leur validation et leurs retours    ⛔ elles peuvent refuser
              ↓
  ⑤ Implémenter les retours validés — toujours sur données fictives
              ↓
  ⑥ Retester l'ensemble
              ↓
  ⑦ ⚠️ RECONTRÔLER LA CONFIANCE si les retours changent : données collectées · finalités ·
       utilisateurs · accès · architecture · services tiers · toute autre surface
              ↓
  ⑧ 🔴 JALON EXPLICITE : passage aux données réelles
       ⛔ Ce n'est PAS une conséquence automatique de la validation fonctionnelle.
       Les prérequis juridiques et cyber applicables sont recontrôlés AVANT.
```

> ⭐ **Il n'existe aucune échéance.** Ni date de premier tournoi réel, ni date de première
> invitation, ni date de mise en production. **Le projet avance sans contrainte de calendrier**, et
> la priorité est la qualité, jamais la vitesse.

---

## 1. COMMENT LIRE UNE FICHE, ET LES 6 QUALIFICATIONS

### Les 6 qualifications — à ne jamais mélanger

| | Qualification | Ce que ça veut dire, simplement |
|---|---|---|
| 🔴 | **Obligation juridique** | Un texte de loi ou un règlement l'impose. **Ne pas le respecter est une infraction** |
| 🟠 | **Lignes directrices** | Une autorité explique comment elle lit la loi. **Opposable** : un juge ou la CNIL s'y référera |
| 🟡 | **Recommandation officielle** | Une autorité conseille une manière de faire. **Non contraignante**, mais elle fait autorité |
| 🔵 | **Documentation fournisseur** | Ce que dit le prestataire réellement utilisé. **Contractuel ou technique**, jamais légal |
| 🟢 | **Standard / bonne pratique** | Une référence de la profession. **Aucune valeur réglementaire** |
| ⚪ | **Durcissement volontaire** | **Aucun texte ne le demande.** C'est un choix de confort ou de prudence |

> ⚠️ **Le mélange de ces catégories est la faute principale que ce document existe pour empêcher.**
> Présenter une bonne pratique comme une obligation, c'est imposer à Maxilou une contrainte que
> personne ne lui impose. Présenter une obligation comme une bonne pratique, c'est l'inverse — et
> c'est pire.

### Ce que contient chaque fiche

| Champ | Ce qu'il donne |
|---|---|
| **Texte** | Le nom **exact**, et son numéro |
| **Autorité** | Qui le publie |
| **Version** | ⭐ **La version en vigueur constatée**, avec sa date. Un texte se réécrit sans prévenir |
| **Source** | L'adresse officielle, jamais un blog ni un article |
| **Qualification** | Une des 6 ci-dessus |
| **Applicabilité** | ✅ / ❌ / ⚠️, **et pourquoi** |
| **Ce qu'il dit d'utile ici** | Uniquement ce qui touche Maxilou |
| **Zones** | Les surfaces de Maxilou concernées *(voir `PLAN.md` §14)* |

---

## 2. LES RÉFÉRENTIELS APPLICABLES (R1 → R16)

### 🔴 R1 — RGPD (Règlement (UE) 2016/679)

| | |
|---|---|
| **Autorité** | Union européenne · CNIL pour la France |
| **Version** | En vigueur ; articles consultés : **2, 4, 13, 14, 26, 28, 29, 30, 32, 33** |
| **Source** | <https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre1> · [chapitre 3](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre3) · [chapitre 4](https://www.cnil.fr/fr/reglement-europeen-protection-donnees/chapitre4) |
| **Qualification** | 🔴 **Obligation juridique** |
| **Applicabilité** | ✅ **OUI** — dès que de vraies données entreront. ⚠️ **Voir §0 bis** : le traitement à protéger **n'a pas encore commencé** |

**Ce qu'il dit d'utile ici :**

- **art. 4(7)** — le responsable du traitement est *« la personne physique ou morale […] qui, seul
  ou conjointement avec d'autres, **détermine les finalités et les moyens** du traitement »*.
  ⭐ **Le critère est QUI DÉCIDE, jamais qui code ni qui saisit** ;
- **art. 4(8)** — le sous-traitant *« traite des données à caractère personnel **pour le compte** du
  responsable »* ;
- **art. 26** — si deux structures déterminent **ensemble** les finalités, elles sont **responsables
  conjoints**, et un **accord entre elles est obligatoire**. *« La personne concernée peut exercer
  ses droits à l'égard de **et contre chacun** des responsables »* ;
- **art. 29** — une personne agissant **sous l'autorité** du responsable *« ne peut pas traiter ces
  données, excepté sur instruction du responsable »*. **Elle n'est pas responsable du traitement** ;
- **art. 30(5)** — ⚠️ l'exemption de registre pour les organisations de moins de 250 personnes
  **tombe si le traitement « n'est pas occasionnel »** ;
- **art. 32** — sécurité *« adaptée au risque »*. ⭐ **La proportionnalité est dans le texte
  lui-même** : « approprié » n'est pas « maximal » ;
- **art. 13 et 14** — information des personnes. L'art. 14 impose un délai *« ne dépassant pas un
  mois »* quand les données ne viennent pas de la personne elle-même ;
- **art. 33** — notification d'une violation à l'autorité *« 72 heures au plus tard »*.

**Zones** : Z1 · Z2 · Z4 · Z7 → **[O1] [O2] [O3] [O6] [O7]**

---

### 🔴 R2 — Article 82 de la loi n° 78-17 du 6 janvier 1978

| | |
|---|---|
| **Autorité** | France · CNIL |
| **Version** | ⭐ **En vigueur depuis le 1er juin 2019** *(constaté le 2026-08-19)* |
| **Source** | <https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000037813978> |
| **Qualification** | 🔴 **Obligation juridique** *(transpose l'art. 5(3) de la directive 2002/58/CE dite « ePrivacy »)* |
| **Applicabilité** | ⚠️ **PARTIELLE — voir le tableau ci-dessous** |

**Le texte exact, et il est plus large que « les cookies » :**

> *« Ces accès ou inscriptions ne peuvent avoir lieu qu'à condition que l'abonné ou la personne
> utilisatrice ait exprimé, après avoir reçu cette information, son consentement […]*
> *Ces dispositions ne sont pas applicables si […] 2° Soit, est **strictement nécessaire à la
> fourniture d'un service de communication en ligne à la demande expresse de l'utilisateur**. »*

> ⭐ **Le point capital : le texte ne dit JAMAIS « cookie ».** Il vise *« accéder […] à des
> informations déjà stockées dans son équipement terminal, ou **inscrire** des informations dans cet
> équipement »*. Toute mémoire du navigateur est concernée — et **rien d'autre ne l'est**.

**Ce que cela donne, fonction par fonction :**

| Fonction de Maxilou | R2 s'applique ? |
|---|---|
| Mesure de visibilité des partenaires — identifiant d'appareil en `localStorage` | 🔴 **OUI** |
| Clé admin / scores en `sessionStorage` | ✅ Techniquement oui, mais **EXEMPTÉ** — sans elle la page ne peut pas fonctionner à la demande de l'utilisateur |
| Jeton de club en `sessionStorage` | ✅ Techniquement oui, mais **EXEMPTÉ** — même motif |
| Polices d'écriture chargées chez un tiers | ❌ **NON** — charger une police ne lit ni n'écrit rien dans le terminal |

**Zones** : Z2 → **[O4]**

---

### 🟠 R3 — Délibération CNIL n° 2020-091 du 17 septembre 2020

| | |
|---|---|
| **Objet** | Lignes directrices sur l'application de l'article 82 aux « cookies et autres traceurs » |
| **Autorité** | CNIL |
| **Version** | Du 17/09/2020, abrogeant la délibération n° 2019-093 |
| **Source** | <https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042388179> |
| **Qualification** | 🟠 **Lignes directrices — droit souple opposable** |
| **Applicabilité** | ✅ OUI, par **[R2]** |

**Ce qu'elles apportent** : elles interprètent l'article 82 et fixent, à leur article 5, les
critères de l'exemption « mesure d'audience » — détaillés en **[R5]**.

**Zones** : Z2

---

### 🟡 R4 — Délibération CNIL n° 2020-092, **modifiée par la n° 2025-131**

| | |
|---|---|
| **Objet** | Recommandation proposant des **modalités pratiques** de mise en conformité |
| **Autorité** | CNIL |
| **Version** | ⚡ **2020-092 du 17/09/2020, MODIFIÉE par la délibération n° 2025-131 du 18 décembre 2025.** Version consolidée publiée le **16 janvier 2026** |
| **Source** | <https://www.cnil.fr/sites/default/files/2026-01/recommandation_cookies_consolidee.pdf> · [délibération 2025-131](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053380953) |
| **Qualification** | 🟡 **Recommandation officielle — non contraignante** |
| **Applicabilité** | ⚠️ **MARGINALE** |

> ⚠️ **Pourquoi elle est presque hors sujet, et c'est utile de le savoir** : la modification de
> décembre 2025 porte sur le **consentement multi-terminaux** — comment un utilisateur retrouve ses
> choix d'un appareil à l'autre via son compte. ⛔ **Maxilou n'a aucun compte utilisateur.** Cette
> partie ne le concerne pas.
>
> 🎯 **Elle reste inscrite ici pour une seule raison** : c'est **la preuve qu'un référentiel se
> réécrit sans prévenir**. La référence « 2020-092 » seule, citée aujourd'hui, serait **périmée**.

**Zones** : Z2

---

### 🟡 R5 — CNIL : les conditions de l'exemption « mesure d'audience »

| | |
|---|---|
| **Autorité** | CNIL |
| **Version** | Doctrine en ligne, consultée le **2026-08-19** |
| **Source** | <https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience> |
| **Qualification** | 🟡 **Doctrine CNIL** — elle précise les conditions d'une **exemption légale**, donc son enjeu est 🔴 |
| **Applicabilité** | ✅ **OUI** — c'est la grille qui décide du sort de la mesure de visibilité |

**Les 7 conditions, cumulatives, et l'état constaté le 2026-08-19 :**

| # | Condition | État de Maxilou *(lu dans `frontend/js/sponsors.js`)* |
|---|---|---|
| 1 | Finalité **strictement** limitée à la mesure d'audience, **pour le seul compte de l'éditeur** | 🔴 **Probablement hors exemption** — la finalité est de **remettre une fiche à un partenaire** |
| 2 | Statistiques **anonymes** uniquement | 🟠 Identifiant d'appareil **journalier persistant** |
| 3 | Pas de recoupement, pas de transmission de données non anonymes à un tiers | ✅ **Tenu** |
| 4 | Pas de suivi entre plusieurs sites | ✅ **Tenu** |
| 5 | Durée de vie du traceur ≤ **13 mois**, sans renouvellement automatique | ⭐ **Largement tenu** — remis à zéro **chaque jour** |
| 6 | Conservation des données ≤ **25 mois** | 🟠 Aucune purge automatique *(effacement manuel, D-020)* |
| 7 | **Droit d'opposition** offert | 🔴 **Absent** |

> 🎯 **Ce que cette grille apprend, et c'est plus fin qu'un verdict** : Maxilou tient **4 conditions
> sur 7**, dont une brillamment. **C'est la première — la finalité — qui bloque.**

**Zones** : Z2 → **[O4]**

---

### 🟡 R6 — ⭐ CNIL : dispositif « Sport amateur (hors contrat) et RGPD »

| | |
|---|---|
| **Autorité** | CNIL |
| **Version** | Publié en 2022 ; consulté le **2026-08-19** |
| **Source** | <https://cnil.fr/fr/sport-amateur-hors-contrat> · [questionnaire d'auto-évaluation](https://www.cnil.fr/fr/sport-amateur-hors-contrat/tester-votre-conformite-au-rgpd) · [FAQ](https://www.cnil.fr/fr/sport-amateur-hors-contrat/questions-reponses) |
| **Qualification** | 🟡 **Outil pédagogique et doctrine sectorielle** |
| **Applicabilité** | ✅ **OUI — et c'est le référentiel le mieux calibré de tous** |

> ⭐ **Pourquoi il prime sur les guides généralistes.** Il vise *« les structures du sport amateur,
> **essentiellement des associations** »*, et il traite nommément des données des *« sportifs
> adhérents, sportifs **d'une équipe adverse**, éducateurs sportifs rémunérés ou bénévoles,
> arbitres »*, pour l'usage *« organisation de compétitions »*.
>
> 🏉 **C'est exactement la situation de Maxilou** — les clubs invités **sont** les équipes adverses.

**Trois positions de la FAQ à retenir :**

1. **Échanges entre clubs** — les informations sont collectées *« pour organiser la pratique
   sportive uniquement »* ;
2. **Photographies** — autorisation préalable pour une publication en ligne, et information des
   représentants légaux lorsqu'un mineur est concerné ;
3. **Conservation** — trois ans après la fin de l'adhésion, pour un fichier de membres.

**Zones** : Z1 · Z4 · Z7 · Z10

---

### 🟡 R7 — CNIL : Guide de sensibilisation au RGPD pour les associations

| | |
|---|---|
| **Autorité** | CNIL |
| **Source** | <https://www.cnil.fr/sites/cnil/files/atoms/files/cnil-guide_association.pdf> |
| **Qualification** | 🟡 **Guide de sensibilisation — non contraignant** |
| **Applicabilité** | ✅ OUI, en complément de **[R6]** |

**Ce qu'il apporte** : il confirme que les associations *« doivent inscrire leurs fichiers dans leur
registre des activités de traitement, informer leurs membres, bénévoles et donateurs […] et mettre
en place des mesures de sécurité adaptées aux risques »*. Il rappelle qu'une association peut être
contrôlée et sanctionnée comme une entreprise.

**Zones** : Z1 → **[O2]**

---

### 🟡 R8 — Délibération CNIL n° 2022-100 du 21 juillet 2022

| | |
|---|---|
| **Objet** | Recommandation relative aux **mots de passe et autres secrets partagés** |
| **Autorité** | CNIL |
| **Version** | Du 21/07/2022, abrogeant la délibération n° 2017-012. **Toujours en vigueur** *(constaté le 2026-08-19)* |
| **Source** | <https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000046432885> · [PDF CNIL](https://www.cnil.fr/sites/cnil/files/atoms/files/deliberation-2022-100-du-21-juillet-2022_recommandation-aux-mots-de-passe.pdf) |
| **Qualification** | 🟡 **Recommandation officielle** |
| **Applicabilité** | ✅ **OUI, partiellement** |

**Les trois cas d'usage, et celui qui correspond à Maxilou :**

| Cas | Situation | Entropie minimale |
|---|---|---|
| **1** | Mot de passe **seul** | **80 bits** *(ex. 12 caractères avec 4 catégories ; ou une phrase de 7 mots)* |
| ⭐ **2** | Mot de passe **+ restriction d'accès** *(temporisation, blocage après échecs, captcha)* | **50 bits** *(ex. 8 caractères avec 3 catégories ; ou une phrase de 5 mots ; ou 16 chiffres)* |
| **3** | Code de déverrouillage matériel | 13 bits |

> ⭐ **Maxilou relève du cas n° 2, et ce n'est pas une faveur** : l'anti-force-brute déjà présent
> dans le serveur *(30 échecs tolérés sur une fenêtre de 5 minutes)* **est** exactement le type de
> mesure complémentaire que ce cas exige. **Le seuil applicable est donc 50 bits, non 80.**

> ⚠️ **La limite du texte, et il faut la connaître** : malgré son titre, cette recommandation
> **ne traite pas** le cas d'un secret partagé entre **plusieurs personnes physiques** — plusieurs
> bénévoles marqueurs se passant la même clé. Elle raisonne sur l'authentification d'**une**
> personne. 🔴 **Sur ce point précis, aucun référentiel directement applicable n'a été trouvé.**

**Zones** : Z3 → **[RC2]**

---

### 🟡 R9 — CNIL : Guide de la sécurité des données personnelles

| | |
|---|---|
| **Autorité** | CNIL |
| **Version** | **Édition 2024**, **25 fiches** en 5 parties. La CNIL publie un **suivi des modifications** entre versions |
| **Source** | <https://www.cnil.fr/fr/guide-de-la-securite-des-donnees-personnelles> · [suivi des modifications](https://www.cnil.fr/fr/modifications-guide-de-la-securite-des-donnees-personnelles) |
| **Qualification** | 🟡 **Recommandation officielle** — la CNIL parle de *« précautions élémentaires »*, jamais d'exigences |
| **Applicabilité** | ✅ **OUI** |

**Ce qu'il apporte** : c'est la traduction concrète de l'**art. 32 [R1]** en gestes vérifiables. Les
fiches utiles à Maxilou concernent l'**authentification**, la **sauvegarde**, la **journalisation**,
les **API** et le **cloud**.

**Zones** : Z3 · Z6 · Z8 · Z11 → **[RC3]**

---

### 🔴 R10 — LCEN, article 1-1 (loi n° 2004-575 du 21 juin 2004)

| | |
|---|---|
| **Objet** | Mentions légales des éditeurs de services de communication au public en ligne |
| **Autorité** | France |
| **Version** | ⚡ **Article 1-1, créé par la loi SREN n° 2024-449 — en vigueur depuis le 23 mai 2024** |
| **Source** | <https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000049568614> |
| **Qualification** | 🔴 **Obligation juridique** *(sanction : 1 an d'emprisonnement et 75 000 € d'amende)* |
| **Applicabilité** | ✅ **OUI — et c'est le seul écart réel et ACTUEL de tout ce document** |

> ⚡ **Attention à la référence, et c'est un piège vérifié** : ces dispositions étaient
> historiquement à l'**article 6-III**. **Elles n'y sont plus.** L'article 6-III traite aujourd'hui
> du **contrôle parental et des avertissements sur le tabac**. Citer « LCEN art. 6-III » pour les
> mentions légales est **faux depuis mai 2024**.

**Ce qu'il exige** — pour une **personne morale** : dénomination ou raison sociale, siège social,
téléphone, numéro d'inscription le cas échéant, nom du **directeur de publication**, et identité de
l'**hébergeur**. Pour une **personne physique** : nom, prénoms, domicile, téléphone.

⭐ **La dérogation qui compte ici** : les personnes éditant *« à titre **non professionnel** »*
peuvent, pour préserver leur anonymat, ne publier que **le nom et l'adresse de l'hébergeur**, à
condition d'avoir communiqué leurs éléments d'identification à celui-ci.

> ⚠️ **Pourquoi cet écart est ACTUEL alors que tous les autres sont des préalables** : cette
> obligation **ne dépend d'aucune donnée personnelle**. Elle naît de la seule **publication d'un
> service en ligne** — et les pages de Maxilou **sont publiées aujourd'hui**.

**Zones** : Z1 → **[O5]**

---

### 🔴 R11 — Transferts hors UE : décision d'adéquation EU-US Data Privacy Framework

| | |
|---|---|
| **Autorité** | Commission européenne · Tribunal de l'Union européenne · Cour de justice |
| **Acte de base** | **Décision d'exécution (UE) 2023/1795** de la Commission, du **10 juillet 2023** |
| **Version / état** | ⚠️ **Recours en annulation REJETÉ en première instance** — Tribunal *(dixième chambre élargie)*, **3 septembre 2025**, *Latombe / Commission*, **T-553/23**, **ECLI:EU:T:2025:831**. ⚡ **Pourvoi formé le 31 octobre 2025** : **C-703/25 P** |
| **Sources primaires** | **L'arrêt** : [EUR-Lex, CELEX 62023TJ0553 — `ECLI:EU:T:2025:831`](https://eur-lex.europa.eu/legal-content/en/TXT/?uri=CELEX:62023TJ0553) · **le pourvoi** : [communication au JOUE, CELEX 62025CN0703](https://eur-lex.europa.eu/eli/C/2025/6610/oj/eng) · **la déclaration du fournisseur** : [Google — cadres de transfert](https://policies.google.com/privacy/frameworks) |
| **Source d'appoint** | [Communiqué de presse CJUE **n° 106/25**, Luxembourg, 3 septembre 2025](https://curia.europa.eu/site/upload/docs/application/pdf/2025-09/cp250106fr.pdf) — ⚠️ **émis par la Cour, mais il porte lui-même la mention *« Document non officiel à l'usage des médias, qui n'engage pas le Tribunal »***. Il **complète** l'arrêt, il ne le remplace jamais |
| **Qualification** | 🔴 **Obligation** *(chapitre V du RGPD)* — 🟢 **satisfaite aujourd'hui** |
| **Applicabilité** | ✅ OUI |

**Ce qui est établi, et par quelle source :**

| Fait | Source |
|---|---|
| Google LLC *« has certified that it adheres to the DPF Principles »* | Déclaration de Google |
| Le Tribunal **rejette le recours en annulation** — et *« partant, le recours dans son ensemble »* | Arrêt `ECLI:EU:T:2025:831` · communiqué n° 106/25 |
| ⚡ **Le Tribunal confirme l'adéquation *« à la date d'adoption de la décision attaquée »*** | Communiqué n° 106/25, chapeau |
| La Commission est tenue de **suivre en permanence** le cadre, et peut *« suspendre, modifier ou abroger »* sa décision si le droit américain change | Motifs de l'arrêt, repris au communiqué |
| Le pourvoi soulève **4 moyens** *(impartialité de la DPRC, établissement de cette juridiction, collecte en vrac, exigences de la CEDH sur l'*executive order* 14086)* | Communication au JOUE, CELEX 62025CN0703 |

> ⭐ **La nuance qui compte le plus, et elle vient du texte lui-même** : le Tribunal valide
> l'adéquation **à la date d'adoption de la décision**, et rappelle que la Commission doit en suivre
> l'application **en permanence**. ⛔ **Ce n'est donc pas un blanc-seing définitif.**

> ⚠️ **Ce qui doit rester écrit, et c'est la raison d'être de cette fiche** : cette base **peut
> disparaître**. Elle a déjà disparu deux fois — *Safe Harbor*, puis *Privacy Shield*. **Un pourvoi
> a été formé.** ⛔ **Ce n'est pas un écart ; c'est un risque à surveiller** — et c'est ce qui
> justifierait, un jour, d'héberger les polices d'écriture localement *(voir §6)*.

> ⚠️ **Limite de vérification à connaître** *(2026-08-19)* : **l'issue du pourvoi C-703/25 P n'a pas
> pu être confirmée à sa source primaire** — la fiche procédurale d'InfoCuria est une page dynamique
> qui n'a pas pu être lue. **Ce qui est certain et sourcé** : le pourvoi a été **formé le 31 octobre
> 2025**. **Ce qui ne l'est pas** : s'il est encore pendant à ce jour. ➡️ **À vérifier sur CURIA
> avant toute mesure qui en dépendrait** — c'est-à-dire avant **CF-13**.

**Zones** : Z1 · Z5 → **[O6]**

---

### 🔵 R12 — Documentation Google Apps Script (Web App)

| | |
|---|---|
| **Autorité** | Google *(fournisseur réellement utilisé)* |
| **Source** | <https://developers.google.com/apps-script/guides/web> |
| **Qualification** | 🔵 **Documentation fournisseur** |
| **Applicabilité** | ✅ **OUI** — c'est la plateforme d'exécution réelle du serveur |

**Ce qu'elle apporte, et un point est décisif :**

- les deux modes d'exécution *(« as me » / « as user accessing »)* et leurs conséquences ;
- l'avertissement sur les jetons OAuth : *« never transmit them to the client »* ;
- Apps Script limite le rythme d'autorisation de nouveaux utilisateurs *(« to prevent abuse »)* ;
- ⭐ **l'objet reçu par `doGet` et `doPost` ne contient QUE** : `queryString`, `parameter`,
  `parameters`, `pathInfo`, `contextPath`, `contentLength`, `postData`.
  🔴 **Ni l'adresse IP du visiteur, ni les en-têtes HTTP n'y figurent.**

> 🎯 **Pourquoi ce dernier point change une analyse entière** : le serveur de Maxilou **ne peut pas**
> identifier un visiteur, même s'il le voulait. C'est un argument **technique et vérifiable** en
> faveur du caractère non personnel des relevés de visibilité.

**Zones** : Z3 · Z7 · Z8

---

### 🔵 R13 — Google Cloud Data Processing Addendum (CDPA)

| | |
|---|---|
| **Autorité** | Google |
| **Source** | <https://cloud.google.com/terms/data-processing-addendum> |
| **Qualification** | 🔵 **Documentation fournisseur** — de nature **contractuelle** |
| **Applicabilité** | ⚠️ **DÉPEND DU TYPE DE COMPTE** |

**Ce qui est établi :**

- le CDPA couvre **Google Workspace, toutes éditions**, ainsi que Cloud Platform et Cloud Identity ;
- il pose : *« **Google is a processor and Customer is a controller or processor**, as applicable, of
  Customer Personal Data »* — c'est-à-dire exactement le partage des rôles qu'exige l'**art. 28
  [R1]** ;
- il est **incorporé automatiquement** à l'accord, sans démarche séparée.

> 🔴 **Le point qui compte pour Maxilou** : le CDPA vise un *« Customer »* — un client Workspace ou
> Cloud. **Un compte Gmail grand public n'entre pas dans ce cadre.** Or l'état actuel repose sur un
> **compte Gmail personnel gratuit**.
>
> ➡️ **Il n'existe donc aujourd'hui aucun contrat de sous-traitance.** ⚠️ **Sans conséquence
> immédiate** : il n'y a **aucune donnée personnelle de tiers à protéger** *(voir §0 bis)*. C'est un
> **prérequis avant utilisation réelle**, pas un manquement actuel.

**Zones** : Z1 → **[O7]**

---

### 🔵 R14 — Google for Nonprofits / Google Workspace for Nonprofits

| | |
|---|---|
| **Autorité** | Google |
| **Version** | Conditions d'éligibilité **France**, consultées le **2026-08-19** |
| **Source** | [éligibilité France](https://support.google.com/nonprofits/answer/3215869?hl=en&co=GENIE.CountryCode%3DFR) · [édition Nonprofits](https://knowledge.workspace.google.com/admin/getting-started/editions/google-workspace-for-nonprofits-edition) |
| **Qualification** | 🔵 **Documentation fournisseur** |
| **Applicabilité** | ⚠️ **Piste à instruire** — voir la réserve ci-dessous |

**Ce qui est établi :**

- l'édition **Workspace for Nonprofits est gratuite** pour les organisations qualifiées ;
- **en France**, l'éligibilité suppose une association *« registered in French Legal Publication
  (Journal Officiel des Associations) »*, validée par le partenaire de Google, **Goodstack** ;
- l'édition offre **100 To de stockage**, **jusqu'à 2 000 utilisateurs** *(300 pour un compte
  nouveau)* et une **console d'administration centralisée** ;
- ⭐ **elle est couverte par le CDPA [R13]**, qui vise Workspace **toutes éditions**.

> ⭐ **Pourquoi c'est la piste la plus proportionnée pour [O7]** : elle règle le contrat de
> sous-traitance **sans changer une ligne de code** et **sans coût**, tout en sortant le classeur, le
> Drive et la boîte d'envoi d'un compte individuel — ce qui est aussi un sujet de **continuité**.

> ⛔ **Deux réserves, et elles sont fermes.**
>
> **1.** Ouvrir un tel compte suppose de savoir **au nom de quelle structure** — ce qui n'est pas
> déterminé *(voir §0 bis et `PLAN.md` §14, CF-2)*.
> **2.** ⚠️ **L'éligibilité n'est pas acquise : elle se demande.** Rien dans le dépôt ne permet de
> dire si une structure y serait admise. **Aucune démarche n'a été engagée, et aucune ne doit l'être
> sans décision.**

**Zones** : Z1 → **[O7]**

---

### 🔵 R15 — Documentation GitHub Pages

| | |
|---|---|
| **Autorité** | GitHub *(hébergeur réellement utilisé)* |
| **Source** | [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) · [what is GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) |
| **Qualification** | 🔵 **Documentation fournisseur** — de nature **contractuelle** |
| **Applicabilité** | ✅ OUI |

**Trois passages concernent Maxilou :**

**1. Sur l'envoi de secrets** *(🔵 aujourd'hui)*
> *« GitHub Pages sites shouldn't be used for sensitive transactions like sending passwords or credit
> card numbers. »*

⚠️ **Portée exacte, sans exagération** : GitHub Pages **ne voit jamais** les clés de Maxilou — la
page est servie par GitHub, mais la clé part vers Apps Script en HTTPS, et **HTTPS est forcé** sur ce
dépôt *(constaté : `https_enforced: true`)*. **Ce n'est donc pas une faille, mais un usage que
l'hébergeur déconseille dans sa documentation.**

**2. Sur le SaaS** *(🔭 vision future uniquement)*
> *« GitHub Pages is not intended for or allowed to be used as a free web-hosting service to run your
> online business […] or providing commercial software as a service (SaaS). »*

⛔ **Aucune conséquence aujourd'hui** : Maxilou n'est fourni à personne. ➡️ **Mais le jour où il
serait loué à des clubs, GitHub Pages ne serait plus un hébergement autorisé.**

**3. Un fait à connaître** : *« When a GitHub Pages site is visited, the visitor's IP address is
logged and stored for security purposes. »*

**Zones** : Z6 · Z8

---

### 🟢 R16 — OWASP Application Security Verification Standard (ASVS)

| | |
|---|---|
| **Autorité** | ⚠️ **OWASP Foundation — une association privée, pas une autorité publique** |
| **Version** | ⭐ **5.0.0 (mai 2025)** — et non 4.x |
| **Source** | <https://owasp.org/www-project-application-security-verification-standard/> · [dépôt v5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0) |
| **Qualification** | 🟢 **Standard de place / bonne pratique — aucune valeur réglementaire** |
| **Applicabilité** | ⚠️ **Comme grille de revue uniquement** |

> ⚠️ **Deux précautions, données par OWASP lui-même** : le **niveau 1 ne prouve aucune conformité**
> *(seuls les niveaux 2 et 3 y prétendent)*, et les niveaux sont pensés **par le risque**, pas par la
> facilité de test. ⛔ **Aucune obligation ne peut être fondée sur ce standard.**

**Zones** : Z9

---

## 3. LES TEXTES ÉCARTÉS, ET POURQUOI (R17 → R19)

> ⭐ **Écarter est un résultat, pas un vide.** Chacun de ces trois textes aurait pu imposer des
> contraintes lourdes à Maxilou. **Aucun ne s'applique**, et la démonstration est ici — pour qu'on
> n'ait pas à la refaire, et pour qu'aucune session future ne les rouvre par précaution.

### ⚫ R17 — Directive (UE) 2022/2555 (NIS 2) — **ÉCARTÉE, pour trois motifs**

| | |
|---|---|
| **Source** | [ANSSI — champ d'application](https://aide.monespacenis2.cyber.gouv.fr/fr/article/comment-savoir-si-la-directive-nis-2-sapplique-a-mon-entite-1o0q47s/) · [ANSSI — avancement de la transposition](https://aide.monespacenis2.cyber.gouv.fr/fr/article/avancement-de-la-transposition-de-la-directive-nis-2-1b3j1da/) |
| **Consulté le** | 2026-08-19 |

**Motif 1 — hors champ matériel.** La directive ne vise que les entités exerçant dans un **secteur
listé à ses annexes I ou II** : énergie, transports, banque, santé, eau, infrastructure numérique,
administration publique, espace *(annexe I)* ; postes, déchets, chimie, alimentaire, fabrication,
fournisseurs numériques, recherche *(annexe II)*. **L'organisation d'un tournoi sportif amateur ne
figure dans aucun.**

**Motif 2 — hors seuils.** Même dans un secteur listé, il faut **≥ 50 salariés**, ou **> 10 M€** de
chiffre d'affaires **et** de bilan.

**Motif 3 — et il suffirait seul.** ⚡ **Aucun droit français applicable n'existe à ce jour** : le
projet de loi de transposition *(« résilience des infrastructures critiques et renforcement de la
cybersécurité »)* **n'est pas promulgué**. L'ANSSI indiquait, à la date de vérification, un examen
renvoyé à la session extraordinaire de **juillet 2026**.

➡️ **Conclusion : NIS 2 ne crée aucune obligation pour Maxilou — ni aujourd'hui, ni dans la vision
future**, les seuils restant hors d'atteinte.

---

### ⚫ R18 — Règlement (UE) 2024/2847 (Cyber Resilience Act) — **ÉCARTÉ aujourd'hui**

| | |
|---|---|
| **Source** | [EUR-Lex 2024/2847](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng) · [résumé de la Commission](https://digital-strategy.ec.europa.eu/en/policies/cra-summary) |
| **Consulté le** | 2026-08-19 |

**Motif — hors champ.** Le CRA vise les *« produits comportant des éléments numériques **mis à
disposition sur le marché** »*. ⛔ **Maxilou n'est pas mis sur le marché** : c'est un outil construit
par son auteur, qui n'a été fourni à personne.

**Calendrier constaté, à connaître car il approche :**

| Étape | Date |
|---|---|
| Entrée en vigueur | **10 décembre 2024** |
| Obligations de **signalement** des vulnérabilités activement exploitées | **11 septembre 2026** |
| Obligations principales | **11 décembre 2027** |

➡️ **Aucune obligation aujourd'hui.** 🔭 **Mais si Maxilou était un jour fourni à d'autres clubs, ce
règlement deviendrait pertinent** — c'est une **donnée d'aide à la décision**, jamais une contrainte
actuelle.

---

### ⚫ R19 — Accessibilité (art. 47 de la loi n° 2005-102) / RGAA — **ÉCARTÉ**

| | |
|---|---|
| **Source** | [Légifrance, art. 47](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000037388867/) · [RGAA — champ d'application](https://accessibilite.numerique.gouv.fr/obligations/champ-application/) |
| **Consulté le** | 2026-08-19 |

**Motif — exclusion expresse dans le texte.** L'article 47 ne s'applique pas aux services en ligne
*« des **organismes de droit privé à but non lucratif** qui ne fournissent ni services essentiels
pour le public, ni services répondant spécifiquement aux besoins des personnes handicapées ou
destinés à celles-ci »*. Le seuil de **250 M€** de chiffre d'affaires *(décret n° 2019-768)* ne vise
que les entreprises.

➡️ **Aucune obligation d'accessibilité.**

> ⚠️ **Ce que cet écart NE dit PAS.** Il ne dit pas que l'accessibilité est sans intérêt : un
> bénévole qui lit mal un écran en plein soleil est un vrai sujet. Mais cela relève du **domaine E**
> de l'audit *(`AUDIT.md`)*, **hors du chantier Confiance**, et ce ne sera **jamais une obligation**.

---

## 4. LES OBLIGATIONS ÉTABLIES (O1 → O7)

> ⚠️ **Lire d'abord le §0 bis.** La colonne « État » ci-dessous distingue systématiquement un
> **écart actuel** d'un **prérequis avant utilisation réelle**. **Une seule ligne est un écart
> actuel.**

| # | Obligation | Réf. | Ce qu'elle impose | État constaté au 2026-08-19 |
|---|---|---|---|---|
| **O1** | **Informer les personnes** | [R1] art. 13-14 | Dire qui détient les données, pourquoi, combien de temps, comment les faire retirer. Délai d'un mois maximum pour les données non collectées auprès de la personne | 🟡 **PRÉREQUIS** — aucune personne à informer aujourd'hui *(§0 bis)*. Textes **rédigés** *(C-005)*, **non publiés** |
| **O2** | **Tenir un registre des traitements** | [R1] art. 30 · [R7] | ⚠️ L'exemption « moins de 250 personnes » **tombe** : le carnet des clubs serait **permanent**, donc **non occasionnel** | 🟡 **PRÉREQUIS** — aucun traitement à inscrire aujourd'hui |
| **O3** | **Sécurité appropriée au risque** | [R1] art. 32 | Mesures adaptées. ⭐ *« Approprié »* n'est pas *« maximal »* — la proportionnalité est **dans le texte** | 🟡 **PRÉREQUIS**, partiellement anticipé — beaucoup de garde-fous existent déjà |
| **O4** | **Consentement ou exemption** pour la mesure de visibilité | [R2] · [R3] · [R5] | Soit l'exemption est acquise *(4 conditions sur 7 aujourd'hui)*, soit un consentement est requis | 🟡 **PRÉREQUIS** — fonction **désactivée** ; les relevés existants viennent des appareils de Romain |
| **O5** | **Mentions légales** | [R10] | Identité de l'éditeur, directeur de publication, hébergeur — ⭐ **ou l'hébergeur seul** si l'édition est **non professionnelle** | 🔴 **ÉCART ACTUEL — le seul.** Le site est publié ; aucune mention n'existe |
| **O6** | **Encadrer le transfert hors UE** | [R1] ch. V · [R11] | Une base de transfert valide | 🟢 **SATISFAITE** — Google LLC certifié DPF. ⚠️ Base **fragile** *(un pourvoi a été formé ; son issue est **INCONNUE** — voir [R11])* |
| **O7** | **Contrat de sous-traitance** | [R1] art. 28 · [R13] · [R14] | Un contrat encadrant le rôle de Google | 🟡 **PRÉREQUIS** — ⚠️ **aucun contrat aujourd'hui** *(compte Gmail personnel)*. Sans conséquence tant qu'aucune donnée de tiers n'est traitée |

---

## 5. LES RECOMMANDATIONS OFFICIELLES ÉTABLIES (RC1 → RC5)

> 🟡 **Non contraignantes.** Elles disent comment une autorité juge une situation. **Aucune sanction
> ne découle de leur seul non-respect** — mais une autorité s'y référera.

| # | Recommandation | Réf. | Ce qu'elle apporte à Maxilou |
|---|---|---|---|
| **RC1** | ⭐ **Auto-évaluation « sport amateur »** | [R6] | **Le meilleur point de départ** : un questionnaire en 4 étapes, écrit pour des associations sportives, qui traite nommément des équipes adverses |
| **RC2** | **Secrets partagés : 50 bits d'entropie** *(cas n° 2)* | [R8] | L'anti-force-brute déjà présent **est** la mesure complémentaire qui autorise ce seuil au lieu de 80 bits. ⚠️ Le cas du secret partagé **entre personnes** reste sans référentiel |
| **RC3** | **25 fiches de sécurité** | [R9] | Traduit l'art. 32 en gestes concrets — notamment **sauvegarde** et **journalisation**, aujourd'hui absentes |
| **RC4** | **Les 7 conditions de l'exemption mesure d'audience** | [R5] | La grille applicable telle quelle, avec l'état constaté |
| **RC5** | **Registre + information des membres et bénévoles** | [R7] | Confirme **[O1]** et **[O2]** dans le contexte associatif |

---

## 6. BONNES PRATIQUES ET DURCISSEMENTS VOLONTAIRES

> ⛔ **Rien dans cette section n'est exigible.** Ce sont des choix d'ingénierie. **Aucun ne doit
> jamais être présenté comme une mise en conformité.**

### 🟢 Bonnes pratiques *(standards de place)*

| Sujet | Réf. | Ce qu'il faut en dire honnêtement |
|---|---|---|
| Revue des usages de `innerHTML` | [R16] | Grille de lecture utile. ⚠️ OWASP est une **association privée** ; le niveau 1 **ne prouve rien** |
| Épinglage des actions GitHub par empreinte | [R15] | Bonne pratique de chaîne d'approvisionnement |
| Hygiène générale | — | ⚠️ **Voir la note ci-dessous sur l'ANSSI** |

> ⚠️ **Note sur l'ANSSI, et elle évite une erreur coûteuse.** Deux guides ont été envisagés puis
> écartés comme référentiels :
> - le **« Guide d'hygiène informatique » (42 mesures)** est **mal calibré** : il vise des systèmes
>   d'entreprise avec parc de postes, réseau et administrateurs. **Maxilou n'a ni serveur, ni poste,
>   ni réseau** ;
> - le **« Guide des bonnes pratiques de l'informatique » ANSSI/CPME** est ⚡ **marqué OBSOLÈTE par
>   l'ANSSI elle-même**.
>
> Le texte vivant est **« La cybersécurité pour les TPE/PME en 13 questions », v2 du 12 décembre
> 2024** — [source](https://messervices.cyber.gouv.fr/guides/la-cybersecurite-pour-les-tpepme-en-treize-questions).
> ⚠️ **Mais il vise les entreprises, et les associations ne figurent pas dans son public annoncé.**
> **Aucune obligation ne peut en découler** ; il ne vaut que **par analogie**.

### ⚪ Durcissements volontaires *(aucun texte ne les demande)*

| Sujet | Pourquoi c'est un durcissement, et pas une conformité |
|---|---|
| **Politique de sécurité du contenu (CSP)** | Aucun texte ne l'impose. Réduit les dégâts d'une faille **non démontrée** |
| **`no-referrer` sur la page du dossier club** | Les navigateurs modernes n'envoient déjà pas la partie `?token=` vers un tiers. **Cohérence, pas correction** |
| **Secret scanning GitHub** | Utile et gratuit. Aucun texte ne l'exige |
| **Dependabot** | ⛔ **Sans objet** — le projet n'a **aucun manifeste de dépendances**. **L'activer serait une mesure de façade** |
| **Retrait des bibliothèques inutilisées** | Réduit la surface. Aucun texte ne l'impose |
| **Polices d'écriture auto-hébergées** | ⚠️ **Qualification exacte** : ce n'est **pas** une mise en conformité — le transfert est **licite** via **[R11]**. C'est un durcissement qui **supprime par avance un risque** si la décision d'adéquation tombait |
| **Licence du dépôt** | Aucune obligation. Un dépôt sans licence est « tous droits réservés » par défaut |

---

## 7. TABLE MESURE ↔ RÉFÉRENTIEL

> ⭐ **C'est le cœur du document.** Une ligne par étape du chantier. Les fiches détaillées de chaque
> étape vivent dans **`PLAN.md` §14** — ici, on ne donne que **le lien avec son texte**.
>
> ⚠️ **Colonne « Preuve de clôture »** : elle reste vide tant que le **maillon ⑯** n'est pas franchi
> *(`CLAUDE.md` §8 quinquies)*. **Une ligne sans preuve est une mesure non terminée.**

| Étape | Objet | Référentiel | Exigence | Nature | Preuve de clôture |
|---|---|---|---|---|---|
| **CF-0** | Vérification des référentiels | — | — | — | ✅ **Terminée le 2026-08-19** — 18 sources primaires consultées, 9 corrections, 3 textes écartés |
| **CF-1** | Poser le cadre documentaire | — | — | — | *(cette session)* |
| **CF-2** | Déterminer le responsable du traitement | [R1] art. 4(7), 26, 29 | **[O1] [O2] [O5] [O7]** | ⛔ **Décision organisationnelle** | ⬜ |
| **CF-3** | Architecture de compte institutionnelle | [R13] · [R14] | **[O7]** | 🔵 Doc fournisseur | ⬜ |
| **CF-4** | Mentions légales | **[R10]** | **[O5]** | 🔴 **Obligation — écart ACTUEL** | ⬜ |
| **CF-5** | Information des personnes | [R1] art. 13-14 · [R6] | **[O1]** | 🔴 Obligation *(prérequis)* | ⬜ |
| **CF-6** | Registre des traitements | [R1] art. 30 · [R7] | **[O2]** | 🔴 Obligation *(prérequis)* | ⬜ |
| **CF-7** | Mesure de visibilité des partenaires | [R2] · [R3] · [R5] · [R12] | **[O4]** | 🔴 Obligation *(prérequis)* | ⬜ |
| **CF-8** | Les deux clés d'écriture | **[R8]** | **[RC2]** | 🟡 Recommandation | ⬜ |
| **CF-9** | Liste blanche des onglets exposés | [R1] art. 32 | **[O3]** | 🔴 Obligation, part préventive | ⬜ |
| **CF-10** | Sauvegarde et restauration | [R9] | **[RC3]** | 🟡 Recommandation | ⬜ |
| **CF-11** | Durcir GitHub + ménage des bibliothèques | [R15] | — | 🟢 Bonne pratique | ⬜ |
| **CF-12** | Durcissements de cohérence *(CSP, referrer, `innerHTML`)* | [R16] | — | ⚪ **Durcissement volontaire** | ⬜ |
| **CF-13** | Polices d'écriture auto-hébergées | [R11] | — | ⚪ **Durcissement volontaire** | ⬜ |

---

## 8. JOURNAL DES VÉRIFICATIONS

> ⭐ **Pourquoi ce journal existe, et pourquoi il est le maillon anti-péremption.** **CF-0 a établi
> qu'un texte se réécrit sans prévenir** : la recommandation cookies a été modifiée en **décembre
> 2025**, l'article des mentions légales déplacé en **mai 2024**, un guide de l'ANSSI marqué
> obsolète. **Une référence sans date de vérification ne prouve rien.**

### Comment s'en servir

| Question | Réponse |
|---|---|
| *« Quand a-t-on lu ce texte pour la dernière fois ? »* | La colonne **Date** |
| *« Faut-il tout revérifier à chaque session ? »* | ⛔ **Non.** On revérifie **le référentiel qu'on utilise**, au moment où on s'en sert |
| *« Et si rien n'a changé ? »* | On l'écrit. *« Vérifié, inchangé »* **est une ligne valable** |

### Le journal

| Date | Étape | Référentiels vérifiés | Ce qui a été constaté |
|---|---|---|---|
| **2026-08-19** | **CF-0** | **R1 → R19** — 18 sources primaires | ⚡ **9 corrections d'hypothèses.** Détail ci-dessous |
| **2026-08-19** | **CF-1** | — | Report intégral des constats de CF-0 dans ce document. **Aucune source nouvelle consultée** à ce stade |
| **2026-08-19** | **CF-1** *(correction)* | **R11** | ⚡ **Dette de source DÉTECTÉE puis SOLDÉE avant le premier commit.** La fiche s'appuyait sur un **média spécialisé** *(IAPP)*. Remplacé par **trois sources primaires** : l'arrêt sur EUR-Lex *(`ECLI:EU:T:2025:831`, CELEX 62023TJ0553)*, la communication du pourvoi au JOUE *(CELEX 62025CN0703)*, et la déclaration du fournisseur. ⭐ **Le lien IAPP est supprimé** — il n'apportait rien que les sources primaires ne donnent. Ajout du **communiqué CJUE n° 106/25** comme source d'appoint, **explicitement qualifiée**. ⚠️ **Une limite subsiste et elle est écrite dans la fiche** : l'**issue** du pourvoi n'a pas pu être confirmée à sa source *(InfoCuria est une page dynamique)* |

> ✅ **Aucune dette de source ouverte à ce jour.** Toutes les fiches reposent sur une source
> **primaire** — texte officiel, décision d'une juridiction, autorité publique, ou documentation du
> fournisseur réellement utilisé.
>
> ⚠️ **Une limite de vérification subsiste, et ce n'est pas la même chose qu'une dette** : l'**état
> procédural** du pourvoi **C-703/25 P** *(fiche **[R11]**)* n'a pas pu être lu à sa source. Le fait
> **sourcé** est que le pourvoi a été **formé le 31 octobre 2025** ; son **issue** est **INCONNUE**
> et doit être vérifiée avant **CF-13**.

### Les 9 corrections de CF-0 — à conserver, elles expliquent la méthode

| # | Hypothèse initiale | Ce que le texte réel a montré |
|---|---|---|
| **1** | *« Position de la CNIL sur Google Fonts »* | 🔴 **Cette position n'existe pas.** Aucun document de la CNIL ne traite du sujet ; la jurisprudence connue est **allemande**. Le vrai fondement est le **ch. V du RGPD** + l'**art. 13** — ⛔ **et surtout pas [R2]** |
| **2** | *« Recommandation CNIL 2020-092 »* | ⚡ **Périmée** — modifiée par la **délibération 2025-131 du 18/12/2025** |
| **3** | *« LCEN, art. 6-III »* | ⚡ **Périmée** — les mentions légales sont à l'**art. 1-1** depuis le **23/05/2024** |
| **4** | *« Guide d'hygiène ANSSI (42 mesures) »* comme référentiel principal | ⚠️ **Mal calibré** ; et le guide ANSSI/CPME envisagé en remplacement est **marqué obsolète** |
| **5** | *« Recommandation sur les mots de passe »* | ✅ Titre plus favorable *(« **et autres secrets partagés** »)*, ❌ **mais elle ne traite pas** le partage entre personnes. Et le seuil est **50 bits**, non 80 |
| **6** | *« Moins de 250 personnes, donc pas de registre »* | 🔴 **Faux** — l'exemption tombe si le traitement **n'est pas occasionnel** |
| **7** | *« OWASP ASVS niveau 1 »* | ⚡ Version **5.0.0 (mai 2025)** ; **le niveau 1 ne prouve pas la conformité** |
| **8** | *« Décision d'adéquation de 2023 »* | ⚡ **Incomplet** — contestée, recours **rejeté** le 3/09/2025 *(`ECLI:EU:T:2025:831`)*, **pourvoi formé** le 31/10/2025 |
| **9** | *« NIS 2 : probablement non applicable »* | ✅ **Plus fort** — écartée pour **trois** motifs, dont l'absence de droit français applicable |

### Vérifications qui n'ont RIEN trouvé — et c'est un résultat

| Sujet | Conclusion |
|---|---|
| **Recommandation CNIL « pixels de suivi »** *(adoptée le 12 mars 2026)* | ✅ **Ne s'applique pas.** Vérifié dans le code : les courriels de Maxilou **ne contiennent aucune image distante** — l'affiche voyage en image *inline* *(`inlineImages`, `cid:affiche`)*, ce qui n'appelle aucun serveur à l'ouverture. **Aucun pixel de suivi, nulle part** |
| **Outils de mesure d'audience tiers** | ✅ **Aucun.** Ni Google Analytics, ni Matomo, ni pixel publicitaire, ni service de rapport d'erreurs |
| **Cookies** | ✅ **Aucun.** Recherche faite : pas un seul `document.cookie` dans le frontend |
