# M1 — LES LIBELLÉS OFFICIELS DU FORMULAIRE FFR

> **À quoi sert ce document, en une phrase :** il dit, pour chaque information que Maxilou demande à
> l'organisateur, **quel mot emploie le formulaire officiel de la FFR** — pour que l'écran et le
> document fédéral parlent la même langue.

> 🗓️ **Créé le 2026-08-24** *(chantier M1, étape **M1-A**)*. Il porte la décision **D-045**.

---

## SOMMAIRE

- [1. Pourquoi ce document existe](#1-pourquoi-ce-document-existe)
- [2. La source, et comment elle a été lue](#2-la-source-et-comment-elle-a-été-lue)
- [3. Les titres de sections du formulaire](#3-les-titres-de-sections-du-formulaire)
- [4. La table de correspondance](#4-la-table-de-correspondance)
- [5. Les champs propres à Maxilou](#5-les-champs-propres-à-maxilou)
- [6. Nom officiel et nom d'usage](#6-nom-officiel-et-nom-dusage)
- [7. Les écarts constatés, et ce qu'on en fait](#7-les-écarts-constatés-et-ce-quon-en-fait)

---

## 1. Pourquoi ce document existe

Quand un organisateur remplit une case dans Maxilou, il la retrouvera ensuite **sur un document
qu'il dépose à sa Ligue**. Si les deux ne portent pas le même nom, il doit deviner la
correspondance — et une devinette, sur un dossier administratif, finit par une erreur.

**Un exemple, et il est réel.** Maxilou demandait *« Nombre de vestiaires »*. Le formulaire, lui,
demande *« Nombre de vestiaires utilisés »*. Ce n'est pas la même question : un stade peut **avoir**
six vestiaires et n'en **utiliser** que quatre ce jour-là. Le mot manquant changeait la réponse.

> 🎯 **La règle qui en découle** *(**D-045**)* : **le libellé visible reprend le vocabulaire de la
> source officielle.** La clé technique interne, elle, garde son nom — `org_code_club` reste
> `org_code_club`, personne ne le voit. Une explication pédagogique peut être ajoutée **sous** le
> champ ; ⛔ elle ne remplace jamais le libellé.

### Ce que la règle ne demande PAS

- ❌ **Pas** de reproduire les coquilles de la source. L'original écrit *« Ecole »* et
  *« SECURITE »* sans accents : c'est un **artefact de saisie**, pas un terme. **On reprend le mot,
  on normalise l'accentuation** *(arbitrage **L1**, validé par Romain le 2026-08-24)* ;
- ❌ **Pas** d'aligner la **structure** de Maxilou sur celle du formulaire. Maxilou a le droit
  d'avoir **deux champs** là où le formulaire n'en a qu'un, quand ses propres écrans en ont besoin
  *(arbitrage **L2** — voir §7)* ;
- ❌ **Pas** de faire passer un champ inventé par l'application pour une case du formulaire —
  **c'est l'inverse** : il doit être **identifié comme propre à Maxilou** *(§5)* ;
- ✅ **Seulement** ceci : *le mot que je fais lire à l'organisateur est-il celui qu'il retrouvera sur
  le document officiel ?*

---

## 2. La source, et comment elle a été lue

| | |
|---|---|
| **Source unique** | [`../../frontend/modeles/demande-autorisation-ffr.pdf`](../../frontend/modeles/demande-autorisation-ffr.pdf) — millésime **2026-2027**, 7 pages, 1 019 057 octets |
| **Relevé le** | **2026-08-24** |

⚠️ **Les libellés ne sont PAS lisibles directement dans le fichier**, et c'est important à savoir
pour quiconque voudra refaire le contrôle : le PDF emploie des **polices en sous-ensemble à
encodage propre** — chaque lettre y est stockée sous un autre code. Une lecture naïve renvoie du
charabia, et la page 5 ne renvoie **rien du tout**.

**La méthode qui marche, en trois gestes :**

1. extraire les **26 tables `ToUnicode`** que le PDF embarque *(ce sont ses propres tables de
   décodage : elles disent quel code vaut quelle lettre)* ;
2. décompresser les **7 flux de page** ;
3. décoder chaque page **police par police** — ⚠️ **la page 5 en utilise six différentes**, et c'est
   exactement pourquoi elle paraît vide quand on n'en applique qu'une.

> ⚠️ **La limite de cette méthode, et elle doit être lue.** L'extraction restitue **le texte, pas la
> mise en page**. Elle établit donc **le vocabulaire**, et **pas** le rattachement d'un libellé à
> son champ. Ce rattachement-là reste celui qu'a vérifié
> [`../../frontend/js/admin-autorisation.js`](../../frontend/js/admin-autorisation.js)
> — *« Mapping VÉRIFIÉ par la position de chaque champ face à son libellé »*. **Les deux
> vérifications sont complémentaires ; aucune ne remplace l'autre.**

---

## 3. Les titres de sections du formulaire

Reproduits **tels quels** *(accentuation normalisée, **L1**)*. Maxilou emploie déjà la numérotation
`A.1`, `A.2`… `B.5` : elle est **fidèle** et n'a pas à changer.

| Repère Maxilou | Titre officiel |
|---|---|
| *(page 1)* | **FORMULAIRE – DEMANDE D'AUTORISATION ORGANISATION DE TOURNOI ÉCOLE DE RUGBY** |
| **A** | **A. INFORMATIONS GÉNÉRALES** |
| **A.1** | **1. ORGANISATEUR** |
| **A.2** | **2. INFORMATIONS DU TOURNOI** |
| **A.3** | **3. CATÉGORIES ET FORMES DE JEU** |
| **A.4** | **4. PARTICIPANTS** |
| **B** | **B. ORGANISATION DU TOURNOI** |
| **B.1** | **1. INSTALLATIONS SPORTIVES** |
| **B.2** | **2. FORMAT SPORTIF** |
| **B.3** | **3. ARBITRAGE** |
| **B.4** | **4. SÉCURITÉ** |
| **B.5** | **5. LOGISTIQUE** |
| *(page 7)* | **AVIS ET AUTORISATION** — *Club demandeur · Comité Départemental · Ligue Régionale · FFR (si tournoi international)* |

---

## 4. La table de correspondance

**Légende des familles** *(définies par **D-042**)* :
🏛️ permanente du club · 🏟️ valeur proposée par défaut · 🗓️ événementielle · 🧮 calculée ·
📜 référentielle · ⚙️ **propre à Maxilou, absente du formulaire**.
🔒 = donnée personnelle.

### A.1 — Organisateur

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| `org_club_nom` | **Nom du club ou de la structure organisatrice** | feuille : *idem* ✅ · saisie : *« Nom du club organisateur »* ⚠️ | 🏛️ | PDF `Texte1` **et** `Club demandeurRow1` · feuille A.1 |
| `org_code_club` | **Code club** | *idem* ✅ | 🏛️ | PDF `Texte2` |
| `org_representant_nom` | **Représenté par M. ou Mme.** | feuille : *« Représenté par (M./Mme) »* ⚠️ · saisie : *« Représentant (M./Mme) »* ⚠️ | 🏛️ 🔒 | PDF `Texte3` |
| `org_representant_tel` | **Tel** *(du bloc « Représenté par »)* | *« Téléphone du représentant »* / *« Tél. représentant »* ⚠️ | 🏛️ 🔒 | PDF `Texte5` |
| `org_representant_mail` | **Mail** *(du bloc « Représenté par »)* | *« Mail du représentant »* / *« Mail représentant »* ⚠️ | 🏛️ 🔒 | PDF `Texte6` |
| `org_president_nom` | **Sous couvert de son Président, M** | feuille : *« Sous couvert de son Président (M.) »* ⚠️ · saisie : *« Président du club (M.) »* ⚠️ | 🏛️ 🔒 | PDF `Texte10` |
| `org_president_tel` | **Tel** *(du bloc « Sous couvert »)* | *« Téléphone du président »* / *« Tél. président »* ⚠️ | 🏛️ 🔒 | PDF `Texte9` |
| `org_president_mail` | **Mail** *(du bloc « Sous couvert »)* | *« Mail du président »* / *« Mail président »* ⚠️ | 🏛️ 🔒 | PDF `Texte7` |
| `org_label_edr` | **École de rugby labellisée** *(oui / non)* | *idem* ✅ | 🏛️ | Cases 62 / 63 |
| `org_label_date` | **Date du dernier label** | *idem* ✅ | 🏛️ | PDF `Texte8` |

> ⚠️ **Les deux « Tel » et les deux « Mail » sont AMBIGUS hors contexte** : sur le papier, chacun est
> posé **sous** le bloc de la personne qu'il concerne. Un écran ne peut pas s'en remettre à la mise
> en page — le libellé y devient donc **« Tel » ou « Mail », dans un groupe de champs titré
> « Représenté par M. ou Mme. » ou « Sous couvert de son Président, M »**. La fidélité porte sur
> **le mot ET son groupe**, jamais sur le mot seul.

### A.2 — Informations du tournoi

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| `tournoi_nom` | **Nom du tournoi** | *idem* ✅ | 🗓️ | PDF `Texte11` |
| `tournoi_lieu` + `tournoi_adresse` | **Adresse du tournoi (stade, ville, cp)** — ⚠️ **un seul champ au formulaire** | feuille : deux lignes *« Lieu (stade) »* + *« Adresse (ville, code postal) »* ⚠️ | 🗓️ ← 🏟️ | PDF `Texte12` — voir **§7 / R-095** |
| `tournoi_date` | **Date** | *idem* ✅ | 🗓️ | PDF `Date64_es_:signer:date` |
| `heure_debut` | **Heure de début** | *idem* ✅ | 🗓️ | PDF `Texte13` |
| `heure_fin` *(ou `heure_fin_communiquee`)* | **Heure de fin** | *idem* ✅ | 🗓️ | PDF `Texte14` |
| `org_niveau_tournoi` | **Niveau du tournoi** — *International · National · Territorial · Départemental* | *idem* ✅ | 🗓️ | Cases 65 → 68 |

### A.3 — Catégories et formes de jeu *(entièrement calculé)*

| Élément | Libellé **officiel** | Famille |
|---|---|---|
| En-têtes du tableau | **CATÉGORIE** · **FORME DE JEU** | 📜 |
| Lignes | **Moins de 6 ans (cf règlement Baby Rugby)** · **Moins de 8 ans** · **Moins de 10 ans** · **Moins de 12 ans** · **Moins de 14 ans** · **Moins de 15 ans féminines** | 📜 |
| Case M6 | **Plateau M6 premiers pas à l'EDR** — *« Uniquement le Toucher + 2 secondes »* | 📜 |
| Formes | **5x5 (T+2)** · **5x5 (J CO)** · **7X7 (RE)** · **10X10 (RE)** · **15X15 (RE)** · **7X7 (SEVENS)** · **7X7 (T+2)** · **7X7 (J CO)** | 📜 |
| Légende | **T+2 : Toucher 2 secondes ; J CO : Jeu au Contact ; RE : Rugby Éducatif** | 📜 |

> ✅ **Maxilou est déjà fidèle ici** : `PDF_FORMES_TABLE` et `CASES_FORMULAIRE_AUTORISATION`
> reprennent ces libellés, **`Plateau M6 premiers pas à l'EDR` compris**. ⛔ **Rien à changer.**

### A.4 — Participants

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| *(calculé)* | **Nombre de clubs** | *idem* ✅ | 🧮 | PDF `Texte15` |
| *(calculé)* | **Nombre d'équipes (minimum 3)** | *idem* ✅ | 🧮 | PDF `Texte16` |
| `org_nb_participants` | **Nombre de participants** | feuille : *idem* ✅ · saisie : *« Nombre de participants (si les équipes sont saisies à la main) »* ⚙️ | 🧮 *(repli* ⚙️ *)* | PDF `Texte17` |
| `org_equipes_etrangeres` | **Si le tournoi accueille des équipes étrangères** | *« Équipes étrangères »* ⚠️ | 🗓️ | — |
| `org_equipes_etrangeres_liste` | **Précisez ci-dessous les équipes étrangères (nom du club, pays)** | *« Liste des équipes étrangères »* ⚠️ | 🗓️ | PDF `Texte18` |

> 📜 **Mention réglementaire à ne jamais transformer en réglage** : *« Liste des pièces à fournir à
> la ligue régionale — la présente demande d'autorisation dûment complétée ; la liste précisant les
> noms, prénoms et dates de naissance des joueurs et dirigeants étrangers participant à la
> manifestation ; l'autorisation des fédérations étrangères (ce document peut être transmis au plus
> tard la veille de la manifestation). »*

### B.1 — Installations sportives

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| *(calculé)* | **Nombre de terrains utilisés** | *idem* ✅ | 🧮 | — |
| `org_type_terrain` | **Type de terrain** — *Gazon · Synthétique · Sable · Neige · Argile* | *idem* ✅ | 🗓️ ← 🏟️ | Cases 91 → 94 + case 1 |
| `org_nb_vestiaires` | **Nombre de vestiaires utilisés** | feuille : *idem* ✅ · saisie : *« Nombre de vestiaires »* ⚠️ | 🗓️ ← 🏟️ | PDF `Texte20` |

### B.2 — Format sportif *(entièrement calculé)*

| Élément | Libellé **officiel** | Famille |
|---|---|---|
| Bloc par catégorie | **Organisation sportive catégorie M6 / M8 / M10 / M12 / M14** | 📜 |
| Une phase | **Si en 1 phase : Nombre de matchs/équipe** | 🧮 |
| Deux phases | **Si en 2 phases (poules de qualification puis poules de niveau) :** | 🧮 |
| Phase 1 | **Phase 1 qualificative : nombre de matchs/équipe** | 🧮 |
| Phase 2 | **Phase 2 de niveau : nombre de matchs/équipes** | 🧮 |
| Durée | **durée match** | 🧮 |
| `org_recompenses_<CAT>` | **Récompenses** *(oui / non)* | 🗓️ |

### B.3 — Arbitrage

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| `org_nb_arbitres` | **Nombre d'arbitres prévus** | *« Nombre d'arbitres »* ⚠️ | 🗓️ | PDF `Texte46` |
| `org_nb_educateurs` | **Nombre d'éducateurs accompagnants prévus** | *« Nombre d'éducateurs »* ⚠️ | 🧮 *(repli* ⚙️ *)* | PDF `Texte47` |
| `org_nb_doublettes` | **Nombre de doublettes de jeunes arbitres prévus** | *« Nombre de doublettes »* ⚠️ | 🗓️ | PDF `Texte48` |
| `org_nb_educateurs_club` | ⛔ **AUCUN — ce champ n'existe pas au formulaire** | *« Éducateurs du club organisateur »* | ⚙️ | Alimente la cascade de `Texte47` |

### B.4 — Sécurité

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| `securite_referent_*` / `referent_*` | **Responsable sécurité** — **Nom** · **Tel** | *« Responsable sécurité — nom / téléphone »* ✅ | 🧮 *(cascade)* 🔒 | PDF `Texte50` / `Texte51` |
| `org_medecin_oui` | **Médecin** *(oui / non)* | *« Médecin présent »* ⚠️ | 🗓️ 🔒 | Cases 123 / 124 |
| `org_medecin_nom` / `_tel` | **Nom** · **Tel** *(du bloc « Médecin »)* | *« Médecin — nom / tél. »* ⚠️ | 🗓️ 🔒 | PDF `Texte52` / `Texte53` |
| `securite_secours_oui` | **Antenne de secours** *(oui / non)* | *« Antenne de secours présente »* ⚠️ | 🗓️ | Case 125 |
| `org_secours_nom` / `_tel` | **Nom** · **Tel** *(du bloc « Antenne de secours »)* | *« Antenne de secours — nom / tél. »* ⚠️ | 🗓️ 🔒 | PDF `Texte54` / `Texte55` |
| `org_ambulance` | **Ambulance** *(oui / non)* | *idem* ✅ | 🗓️ | Cases 103 / 104 |

### B.5 — Logistique

| Clé technique | Libellé **officiel** | Libellé Maxilou aujourd'hui | Famille | Usage |
|---|---|---|---|---|
| `org_droits_oui` | **Droits d'inscription** *(oui / non)* | *idem* ✅ | 🗓️ | Cases 105 / 106 |
| `org_droits_montant` | **Montant par équipe** | feuille : *« Droits — montant par équipe »* ⚠️ · saisie : *« Montant / équipe »* ⚠️ | 🗓️ | PDF `Texte56` |
| `org_hebergement_oui` | **Hébergement** *(oui / non)* | feuille : *« Hébergement proposé »* ⚠️ · saisie : *idem* ✅ | 🗓️ | Cases 107 / 108 |
| `org_hebergement_structure` | **Structure d'accueil** | *« Hébergement — structure »* ⚠️ | 🗓️ | PDF `Texte57` |
| `org_repas_oui` | **Repas** *(oui / non)* | feuille : *« Repas proposés »* ⚠️ · saisie : *idem* ✅ | 🗓️ | Cases 109 / 110 |
| `org_repas_fournisseur` | **Fournisseur** *(du bloc « Repas »)* | *« Repas — fournisseur »* ⚠️ | 🗓️ | PDF `Texte58` |
| `org_repas_prix` | **prix/personne** *(du bloc « Repas »)* | *« Repas — prix par personne » / « prix / pers. »* ⚠️ | 🗓️ | PDF `Texte59` |
| `org_gouters_oui` | **Goûters** *(oui / non)* | *« Goûters proposés »* ⚠️ | 🗓️ | Cases 111 / 112 |
| `org_gouters_fournisseur` | **Fournisseur** *(du bloc « Goûters »)* | *« Goûters — fournisseur »* ⚠️ | 🗓️ | PDF `Texte60` |
| `org_gouters_prix` | **prix/personne** *(du bloc « Goûters »)* | *« Goûters — prix par personne » / « prix / pers. »* ⚠️ | 🗓️ | PDF `Texte61` |

---

## 5. Les champs propres à Maxilou

⛔ **Ces champs n'existent PAS sur le formulaire fédéral.** Les présenter comme les autres
laisserait croire à l'organisateur qu'il doit les retrouver sur le papier — **il les chercherait en
vain**. Ils doivent donc porter une **mention visible** du type *« outil Maxilou — n'apparaît pas
sur le formulaire »*.

| Clé | Ce que c'est | Pourquoi il existe |
|---|---|---|
| `org_nb_educateurs_club` | Le nombre d'éducateurs **du club organisateur** | Le club organisateur ne s'invite pas lui-même : ses éducateurs ne figurent dans **aucune** réponse d'invitation. Ce nombre **s'ajoute** à la somme déclarée par les clubs pour produire la seule case officielle, *« Nombre d'éducateurs accompagnants prévus »* |
| `org_nb_participants` | Le nombre de participants **saisi à la main** | **Repli** : il ne sert que si aucun club n'a déclaré ses effectifs. Quand la cascade fonctionne, Maxilou **ne pose plus la question** |
| `org_nb_educateurs` | Le total d'éducateurs **saisi à la main** | Même logique de repli |
| `perfs_mot_cle_club` | Le mot qui reconnaît une équipe du club dans son nom | Page interne « Perfs du club » — **sans rapport** avec le formulaire |
| `zone_vacances` | La zone de vacances scolaires du club | Contrôle de conformité du **calendrier** FFR — **sans rapport** avec ce formulaire |
| 🆕 `club_nom_usage` | Le nom d'usage du club | ⛔ **Interdit dans ce formulaire** — voir §6. *(Prévu par **D-045**, non créé à ce jour.)* |

---

## 6. Nom officiel et nom d'usage

**Ce sont deux choses différentes, et les confondre est une faute administrative.**

> **Une image.** Sur une carte d'identité on lit *« Jean-Baptiste »*. Ses amis l'appellent *« JB »*.
> Les deux désignent la même personne — mais **on ne signe pas un acte notarié « JB »**.

| | Nom **officiel** *(`org_club_nom`)* | Nom **d'usage** *(`club_nom_usage`, à créer)* |
|---|---|---|
| **Ce que c'est** | La dénomination administrative du club | Le nom court par lequel on le connaît |
| **Où il sert** | ⭐ **Toute démarche réglementaire** : formulaire FFR, feuille de report, page des signatures | Signatures de documents, emails, communication, interface |
| **Obligatoire ?** | **Oui**, pour déposer une demande | **Non** |
| **S'il est absent** | La feuille de report le compte **« manquant »** et le champ du PDF reste **éditable** — ⛔ **l'application n'invente aucun nom** *(D-039)* | ⭐ **Repli sur le nom officiel** |

> ⛔ **INTERDICTION ABSOLUE, et elle doit être couverte par un test négatif :**
> **le nom d'usage n'entre JAMAIS, par aucun chemin, dans un formulaire réglementaire.**
> Concrètement : `planRemplissageAutorisation` et `assemblerDossierAutorisation` lisent
> **`org_club_nom`**, et rien d'autre.

---

## 7. Les écarts constatés, et ce qu'on en fait

**Relevé du 2026-08-24. Aucun n'est corrigé par M1-A** — ce lot est documentaire.

| # | Écart | Traité par |
|---|---|---|
| **É-1** | **21 libellés** de la carte de saisie et de la feuille de report s'écartent du vocabulaire officiel *(marqués ⚠️ au §4)* | **M1-D**, quand l'écran « Mon club » et la carte d'autorisation seront revus. ⚠️ **Changement visible ⇒ entrée au `CHANGELOG`** |
| **É-2** | **Les champs propres à Maxilou ne sont pas identifiés comme tels** — rien ne dit à l'organisateur qu'ils n'existent pas sur le papier | **M1-D** |
| **É-3** | 🔴 **Le nom du stade disparaît du document fédéral.** Le formulaire demande **« Adresse du tournoi (stade, ville, cp) »** en **un seul champ** ; `admin-autorisation.js:698` écrit `tournoi_adresse` **OU** `tournoi_lieu` — jamais les deux. Adresse renseignée ⇒ **le nom du stade n'est pas transmis à la Ligue** | ⛔ **HORS M1** — registre **R-095**, micro-lot séparé *(arbitrage **H13**, Romain, 2026-08-24)* |

> ⚠️ **Pourquoi É-3 est volontairement sorti de M1**, et ce n'est pas un renvoi de commodité : le
> critère de validation de **M1-E1** est *« le PDF est strictement identique avant et après »* — on
> y prouve qu'on a changé **la provenance** d'une valeur sans changer **la valeur**. Corriger É-3
> dans le même lot rendrait ce critère **inapplicable**, et masquerait l'un des deux changements.
> **Il lui faut son propre avant/après.**

### L'arbitrage L2 — pourquoi Maxilou garde deux champs

Le formulaire n'a **qu'un** champ d'adresse. Maxilou en a **deux**, et **il les garde**
*(arbitrage **L2**, Romain, 2026-08-24)* : le dossier du club, l'itinéraire et le fichier d'agenda
ont besoin du **nom du stade seul**, sans l'adresse postale collée derrière.

➡️ **La fidélité s'applique alors au GROUPE** : les deux champs sont présentés **sous le libellé
officiel « Adresse du tournoi (stade, ville, cp) »**, avec une aide qui explique pourquoi Maxilou
les sépare — et **É-3 garantira** que le document fédéral les réunit.
