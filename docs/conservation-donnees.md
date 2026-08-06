# Conservation des données — ce qu'on garde, et comment on l'efface

> **Document interne**, livrable du chantier **C-006**. Rédigé le **2026-08-06**.
> Il s'adresse à **la personne qui range une saison**, pas à celle qui audite le projet.
>
> 🔗 Son jumeau tourné vers l'extérieur est `docs/textes-information-donnees.md` *(chantier C-005)* :
> **mêmes durées, deux lecteurs.** Ce qu'on annonce là-bas, on l'applique ici.

---

## ⚠️ LA RÈGLE DE CE DOCUMENT — aucun geste inventé

> **Exigence posée par Romain le 2026-08-06** : *« Ne déduis jamais une procédure à partir de ce
> qui semble logique dans le tableur. Chaque geste doit être vérifié dans le code et/ou dans la
> procédure réellement existante. Si une suppression ne peut pas être vérifiée avec certitude,
> indique-le comme "à confirmer" plutôt que d'inventer une manipulation. »*

| Marque | Ce que ça veut dire |
|---|---|
| ✅ **GESTE VÉRIFIÉ** | L'action existe, elle a été **lue dans le code**, et son effet est connu |
| ⚠️ **À CONFIRMER** | **Aucune action de l'application ne fait ce travail.** Ce qu'il faudrait faire n'a **pas** été éprouvé — ce document ne l'invente pas |
| ⛔ **NE PAS TOUCHER** | Conservation **volontaire**. L'effacer casserait quelque chose ou perdrait de la mémoire utile |

**Aucune donnée n'a été supprimée pour écrire ce document. Aucun outil de purge n'a été construit.**

---

## 1. LE TABLEAU DE BORD — les 7 durées et leur geste

*Durées reprises de la décision **D-020**, telles quelles.*

| # | Donnée | Durée retenue | Le geste | Statut |
|---|---|---|---|---|
| **1** | Contacts des structures invitées *(le carnet)* | **3 éditions** sans participation | Écran **Clubs invités** → supprimer la structure | ✅ **VÉRIFIÉ** *(avec une condition de refus — §2.1)* |
| **2a** | Effectifs déclarés — *nombre de joueurs, nombre d'équipes* | Effacés **à la réinitialisation** | ⭐ **Rien à faire : c'est automatique** | ✅ **VÉRIFIÉ** |
| **2b** | Effectifs déclarés — *le détail par équipe et le total d'éducateurs* | Effacés **à la réinitialisation** | ⚠️ **La réinitialisation NE les efface PAS** | ⚠️ **À CONFIRMER — §2.2** |
| **3** | Contacts de la demande fédérale *(représentant, président, **médecin**, secours)* | **1 an**, ou à chaque réinitialisation | Écran **Demande d'autorisation** → vider les champs → **Enregistrer** | ✅ **VÉRIFIÉ** ⚠️ *(la réinitialisation ne les efface pas — §2.3)* |
| **4** | Champ libre « Liste des équipes étrangères » | **Après envoi du dossier** | Même écran → vider le champ → **Enregistrer** | ✅ **VÉRIFIÉ** |
| **5** | Relevés de visibilité des partenaires | **Après remise de la fiche** au partenaire | Écran **Partenaires** → bouton **« Repartir de zéro »** | ✅ **VÉRIFIÉ** |
| **6** | Journal de saison | **Conservé** | ⛔ **Ne rien faire** | ⛔ **NE PAS TOUCHER** |
| **7** | Copies des courriels envoyés | **1 an** | Hors de l'application — boîte d'envoi | ⚠️ **À CONFIRMER — §2.4** |

---

## 2. LES GESTES, UN PAR UN

### 2.1 — Supprimer une structure du carnet ✅ GESTE VÉRIFIÉ

**Quand** : quand une structure n'a pas participé depuis **3 éditions**.
**Où** : écran **Clubs invités** de l'administration.
**Ce que ça efface** : la ligne entière de la structure — nom, contact, adresse, statut, effectifs.

> ⚠️ **La suppression peut être REFUSÉE, et c'est voulu.** Elle s'arrête si une équipe rattachée à
> cette structure est dans l'un de ces trois cas *(motifs exacts, lus dans le code)* :
>
> | Motif affiché | Ce que ça veut dire |
> |---|---|
> | « **créée à la main** » | L'équipe n'a pas été créée par la réponse du club : la supprimer effacerait un travail manuel |
> | « **déjà placée en poule X** » | Le tirage est fait ; la retirer déséquilibrerait la poule |
> | « **présente dans des matchs générés** » | Le planning existe ; la retirer laisserait des matchs sans équipe |
>
> **L'application affiche le motif.** Si tu vois l'un de ces messages, **ne force pas** : c'est le
> signe que l'édition en cours utilise encore cette structure.

**Le bon moment** : **juste après une réinitialisation**, quand les équipes, poules et matchs
viennent d'être vidés. Aucun des trois motifs ne peut alors se déclencher.

---

### 2.2 — ⚠️ Le détail des effectifs et le total d'éducateurs — À CONFIRMER

**Le constat, vérifié** : la réinitialisation remet bien à zéro **huit colonnes** des structures
invitées — dont le nombre de joueurs et le nombre d'équipes par catégorie.

> ❌ **Mais deux colonnes ne sont dans aucune de ces listes** : `detail_effectifs` *(le détail équipe
> par équipe)* et `nb_educateurs_total`.
>
> ❌ **Et aucun écran ne permet de les modifier** : l'édition d'une fiche de structure ne touche que
> **quatre** colonnes — nom de la structure, nom, prénom et adresse du contact.

**Conclusion honnête : il n'existe aucun geste vérifié pour appliquer cette durée.**

⚠️ **Ce que ce document N'ÉCRIT PAS** : « ouvre le classeur et vide les colonnes à la main ».
Ce serait une procédure inventée. **Deux raisons de ne pas la recommander sans essai** :

1. ces deux colonnes **sont lues** par le calcul des effectifs, qui alimente le **nombre de
   participants** de la demande d'autorisation ;
2. **l'effet d'un vidage manuel n'a pas été éprouvé.**

➡️ **À confirmer par un essai réel**, ou à corriger dans l'application *(voir §5)*.

---

### 2.3 — Vider les contacts de la demande fédérale ✅ GESTE VÉRIFIÉ

**Quand** : **1 an** après la saisie, ou à chaque changement d'édition.
**Où** : écran de la **demande d'autorisation**.
**Comment** : **effacer le contenu des champs**, puis **Enregistrer**.

**Pourquoi c'est vérifié** : le contrôle a été fait **des deux côtés**.

- l'écran envoie bien une **valeur vide** quand un champ est vidé ;
- le serveur **écrit** cette valeur vide *(il n'ignore qu'une valeur absente, pas une valeur vide)*.

**Les champs concernés** : représentant *(nom, téléphone, adresse)* · président *(nom, téléphone,
adresse)* · **médecin** *(nom, téléphone)* · secours *(nom, téléphone)*.

> ⚠️ **ATTENTION — la réinitialisation du tournoi ne les efface PAS.** Elle efface le référent du
> jour et le poste de secours, **mais pas les contacts de la demande fédérale**. **Ce geste est donc
> à faire séparément, à la main.** *(C'est le problème **R-033**, voir §5.)*
>
> 🩺 **Et c'est le contact du médecin qui rend ce geste important** : un contact de secours périmé
> est pire qu'un contact absent — on croit l'avoir, et il ne répond pas.

---

### 2.4 — Le champ « Liste des équipes étrangères » ✅ GESTE VÉRIFIÉ

**Quand** : **une fois le dossier envoyé**.
**Où** : même écran que ci-dessus. **Vider le champ, puis Enregistrer.** Même mécanisme vérifié.

**Ce que ce champ attend** : *« nom du club, pays »* — c'est le libellé du formulaire fédéral.
**Aucune information nominative n'y est demandée.**

---

### 2.5 — Effacer les relevés de visibilité ✅ GESTE VÉRIFIÉ

**Quand** : **après avoir remis la fiche** au partenaire.
**Où** : écran **Partenaires** → bouton **« Repartir de zéro »**.

**Ce que ça fait, exactement** : toutes les lignes de l'onglet des relevés sont supprimées *(l'en-tête
reste)*, **et** les compteurs de l'appareil sont remis à zéro. Une confirmation le demande avant.

> ✅ **Les fiches des partenaires et leurs logos ne bougent pas** — seuls les relevés partent.

---

### 2.6 — Les copies de courriels ⚠️ À CONFIRMER

**Le constat** : chaque envoi laisse une copie dans la boîte d'envoi, **entièrement hors de
l'application**. Aucune réinitialisation ne peut l'atteindre.

⚠️ **Aucune procédure n'existe aujourd'hui**, et ce document n'en invente pas. Ce qu'il faut
décider : **qui** nettoie, **quand**, et **selon quel critère**.

---

## 3. ⛔ CE QU'IL NE FAUT SURTOUT PAS TOUCHER

| Ne pas effacer | Pourquoi |
|---|---|
| **Le journal de saison** | **Aucune donnée personnelle** — des noms d'équipes et des scores. C'est la mémoire des éditions passées, et **D-020 dit « conservé »** |
| **Le carnet des structures invitées, lors d'une réinitialisation** | ⭐ **C'est volontaire** : le carnet se réutilise d'une édition à l'autre. La réinitialisation remet à zéro les colonnes **de l'édition**, pas le carnet. **Ne pas « compléter le ménage » à la main** |
| **Les partenaires et leurs logos** | Un partenariat se reconduit. Les effacer obligerait à **re-téléverser tous les logos**. Pour retirer un partenaire : **décocher « actif »** |
| **L'adresse d'expédition et les deux clés** | Configuration d'infrastructure, **conservée volontairement** — les effacer casserait les envois et les écritures |
| **Les colonnes des structures hors des huit remises à zéro** | Elles portent le carnet lui-même. *(Deux d'entre elles font exception — §2.2 — mais **le geste n'est pas confirmé**.)* |

---

## 4. QUAND DÉCLENCHER — le rappel

> 📋 **Décision D-033** : tant qu'aucun outil ne signale ce qui est périmé, **le respect des durées
> est assuré par un rappel explicite** — pas par la mémoire de quelqu'un.

**Chaque geste est rattaché à un moment qui existe déjà**, jamais à une date abstraite :

| Moment de la saison | Ce qu'on fait |
|---|---|
| **Après l'envoi du dossier** aux structures | Vider le champ « Liste des équipes étrangères » *(§2.4)* |
| **Après la remise de la fiche** à un partenaire | Effacer les relevés de visibilité *(§2.5)* |
| ⭐ **À la réinitialisation, en fin d'édition** | **Trois gestes à la suite** : ① lancer la réinitialisation *(automatique)* · ② **vider les contacts de la demande fédérale** — elle ne le fait pas *(§2.3)* · ③ supprimer les structures absentes depuis 3 éditions *(§2.1 — c'est le moment où aucun refus ne peut se déclencher)* |
| **Une fois par an** | Nettoyer les copies de courriels *(§2.6 — à confirmer)* |

> 🎯 **Le geste le plus facile à oublier est le ②** : la réinitialisation donne le sentiment que tout
> est fait. **Elle ne vide pas les contacts de la demande fédérale, médecin compris.**

---

## 5. ⚠️ CE QUE CE DOCUMENT NE PEUT PAS RÉGLER

> **Distinction demandée par Romain, et elle est essentielle** : ce qui suit n'est pas une lacune de
> ce document — ce sont **des comportements de l'application**. Aucun geste manuel ne les corrige ;
> ils demandent **un chantier de code**, au volet ③.

| # | Le comportement | Conséquence | Réf |
|---|---|---|---|
| **1** | **La réinitialisation conserve des données que D-020 dit d'effacer** : le détail des effectifs, le total d'éducateurs, et **tous les contacts de la demande fédérale** | ⚠️ **La règle décidée et le code ne disent pas la même chose.** Tant que ce n'est pas corrigé, **la durée n'est tenue que si quelqu'un pense à faire le geste** | **R-033** |
| **2** | **Le droit d'effacement est partiel** : on ne peut pas effacer le seul contact d'une structure en gardant la structure ; et la suppression est refusée tant qu'une équipe est engagée | Une demande de retrait peut être **impossible à satisfaire** au mauvais moment de la saison | **R-031** |
| **3** | **Rien ne signale ce qui est périmé** | Le rappel de **D-033** repose entièrement sur un humain | **R-030** *(part outillage)* |

> ⛔ **Garde permanente, rappelée ici parce que c'est ici qu'on serait tenté de l'oublier** *(D-020)* :
> le jour où cet outillage existera, **il signalera — il n'effacera jamais tout seul.** Un outil qui
> supprime sans qu'on le lui demande est le type de code le plus dangereux du projet.

---

## 6. LES POINTS À CONFIRMER

| # | Ce qu'il faut confirmer | Qui | Ce que ça bloque |
|---|---|---|---|
| **1** | **Comment effacer le détail des effectifs et le total d'éducateurs** *(§2.2)*. Aucun geste vérifié n'existe. Un essai réel, ou une correction dans l'application | Romain | **La durée n° 2b n'est pas applicable** aujourd'hui |
| **2** | **Qui nettoie les copies de courriels, quand, et selon quel critère** *(§2.6)* | Romain / le bureau | La durée n° 7 |
| **3** | **Où placer le rappel** pour qu'il soit vu au bon moment *(§4)* | Romain | L'efficacité de **D-033** |

---

*Document produit par le chantier C-006 de l'industrialisation de Tournoi R92 — 2026-08-06.
Aucune ligne de l'application n'a été modifiée, aucune donnée supprimée, aucun outil construit.
Aucun geste n'y est décrit qui n'ait été lu dans le code.*
