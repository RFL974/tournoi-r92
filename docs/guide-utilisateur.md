# Mode d'emploi détaillé — Tournoi R92

Ce guide explique **tout** le fonctionnement de l'outil, page par page, avec les **règles** et
les **raisonnements** derrière chaque comportement. Il s'adresse à trois publics :
l'**organisateur** (page Administration), les **marqueurs** (page Saisie des scores) et les
**visiteurs** (page publique). Une page interne **Perfs** est réservée au club.

---

## 0. Vue d'ensemble

L'outil est composé de **4 pages web** (hébergées sur GitHub Pages) qui parlent à un **backend**
Google Apps Script relié à un **Google Sheet** (la base de données).

| Page | Fichier / adresse | Pour qui | Accès en écriture |
|------|-------------------|----------|-------------------|
| 🛠️ Administration | `admin.html` | l'organisateur | **clé admin** |
| 📝 Saisie des scores | `saisie.html` | les marqueurs (par terrain) | **clé scores** |
| 🏉 Le tournoi (public) | `tournoi.html` | les spectateurs | lecture seule |
| 📊 Perfs Racing | `perfs.html` | le club (interne, non lié) | lecture seule |

Adresses en ligne (base `https://rfl974.github.io/tournoi-r92/`) : `admin.html`, `saisie.html`,
`tournoi.html`, `perfs.html`.

**Deux clés protègent les écritures** (voir §5) : une **clé admin** (réglages, génération,
publication…) et une **clé scores** (saisie des résultats). N'importe qui peut *ouvrir* les
pages, mais **rien ne peut être écrit sans la bonne clé**. Les lectures (résultats, classements)
sont publiques : c'est le but.

**Le barème** partout dans l'appli : **Victoire = 3 points, Nul = 2, Défaite = 1** (donc un match
joué rapporte toujours au moins 1 point). **Départage** en cas d'égalité de points :
1) la **différence** (points marqués − encaissés), puis 2) les **points marqués**.

**Déroulé type d'une journée** :
1. (Avant) L'organisateur règle les horaires, les catégories (**dont le format d'après-midi** de
   chacune : croisé / croisé diagonal / libre / coupe + plateau), et saisit les équipes.
2. L'organisateur **génère les poules et le planning du matin**.
3. Il **publie** le tournoi (il devient visible du public).
4. Le matin, les marqueurs **saisissent les scores** des matchs de poule.
5. Une fois le matin terminé, l'organisateur **génère la phase après-midi** : chaque catégorie est
   générée **selon son format** (classement croisé par défaut).
6. Les marqueurs saisissent les scores de l'après-midi (en Coupe : propagation + départage auto).
7. Le **classement général** / **podium** (croisé) ou l'**arbre de Coupe** se mettent à jour en
   direct sur la page publique.

> 🆕 **Formats d'après-midi par catégorie.** L'après-midi peut prendre 3 formes selon la catégorie
> (classement croisé, matchs libres, ou Coupe + Plateau à élimination directe). Le choix se fait au
> **paramétrage**. Tout est expliqué dans le guide dédié : [`formats-apres-midi.md`](formats-apres-midi.md).

> 🆕 **Répartition automatique des terrains.** À partir de tes grands terrains réels (foot / rugby),
> l'appli calcule combien de petits terrains y tiennent et les **attribue automatiquement** aux
> catégories, avec une **carte visuelle** du placement. À faire avant de générer le planning
> (voir §1.4).

---

## 1. Page Administration (`admin.html`)

À l'ouverture, la page charge tous les réglages et affiche plusieurs blocs, de haut en bas.

### 1.0 Connexion + tableau de bord (en haut)
Une **barre de connexion** indique si ta **clé admin** est active : 🔓 **Connecté** (bouton
*Changer de clé*) ou 🔒 **Non connecté — les enregistrements seront refusés** (bouton *Se
connecter*). Pratique pour savoir d'un coup d'œil pourquoi un enregistrement pourrait être refusé.
Par sécurité (page laissée ouverte), *Changer de clé* **exige d'abord la clé actuelle** avant de
pouvoir en saisir une nouvelle. Le bouton **🔒 Verrouiller** efface la clé mémorisée : la page
repasse en « Non connecté » et toute action redemandera la clé — utile si tu laisses l'ordinateur
sans surveillance.

Juste en dessous, un bandeau **tableau de bord** récapitule l'**état du tournoi en un coup d'œil** :
**Catégories** (nombre), **Équipes** (nombre), **Planning matin** (✓ Validé · ⏱ En attente)
et **Publication** (⚪️ non · 🟢 publié). Il se met à jour automatiquement à chaque action (ajout
d'équipe, génération, publication…). Un bouton **🔄 Rafraîchir** (avec l'heure de dernière mise à
jour) recharge les **scores saisis sur les téléphones** : à utiliser **avant de générer
l'après-midi** pour que l'état « scores du matin complets » soit à jour. Il ne touche pas aux
formulaires en cours d'édition.

> Toutes les confirmations et demandes de clé passent désormais par des **fenêtres aux couleurs du
> site** (au lieu des popups gris du navigateur). *Entrée* valide, *Échap* annule.

> **Section repliable** : la carte « Réinitialiser le tournoi » a un **chevron ▸** dans son titre
> et est **repliée** par défaut (rarement utilisée, et on évite de l'ouvrir par erreur).

> 🧭 **Navigation par étapes.** Sur **ordinateur (grand écran)**, la page s'organise en **écrans**
> avec une **barre latérale** qui reprend les **étapes de la préparation** : Infos · Horaires ·
> Catégories · Équipes · Terrains · Poules & planning · Publication · Après-midi · Réinitialiser.
> Chaque item ouvre sa carte ; une étape **complète** reçoit une **coche ✓** (bleu ciel sur fond
> blanc) et une étape reste **🔒 verrouillée** tant qu'une étape précédente n'est pas
> **enregistrée / générée / répartie** (survole le cadenas : l'infobulle dit quoi terminer
> d'abord). La **Publication** vient avant l'Après-midi (on publie le matin ; l'après-midi se
> génère plus tard, une fois les scores saisis, et ne bloque rien). **Réinitialiser** (en rouge,
> tout en bas) reste **toujours accessible** : on peut remettre à zéro un tournoi même à moitié
> préparé. Sur **mobile**, c'est l'**assistant en étapes** (cartes + verrou « Suivant ») qui guide,
> avec la même logique. Le bouton **« Vue classique ✕ »** remet à tout moment la page longue.

### 1.1 Horaires de la journée
Réglages globaux qui pilotent le calcul du planning :

- **Heure de début des matchs** : heure du premier coup d'envoi.
- **Heure de fin des matchs** + case **auto** :
  - **auto coché** (par défaut) : l'heure de fin n'est **pas** une contrainte ; le planning se
    déroule et l'outil t'**affiche** simplement l'heure de fin projetée. *Aucune alerte.*
  - **auto décoché** + une heure : devient une **cible**. Si le tournoi dépasse cette heure, tu
    reçois un **avertissement** et l'**assistant d'arbitrage** (§1.5).
- **Battement terrain entre les matchs (min)** : temps tampon laissé sur un terrain entre deux
  matchs (rangement, transition).
- **Pause déjeuner — début** et **durée (min)** : créneau réservé. **Contrainte dure** :
  - aucun match du **matin** ne peut chevaucher la pause (les matchs qui déborderaient sont
    repoussés après la pause) ;
  - l'**après-midi ne peut pas commencer avant la fin de la pause** (début + durée).
  - Si le matin ne rentre pas avant le début de la pause, la génération **alerte** et propose un
    **arbitrage** (§1.5).

> **Raisonnement** : ces paramètres sont les « boutons » qui permettent de faire tenir la journée
> dans les créneaux réels (terrains disponibles, pause repas, heure de fin de location).

### 1.2 Catégories
Chaque catégorie (U8, U10, U12…) a ses propres réglages. **Toute catégorie que tu ajoutes est
active** : elle apparaît dans le menu déroulant d'ajout d'équipe et entre dans la génération. (Pour
retirer une catégorie, on la **supprime** — il n'y a plus de réglage « Présente ».)

- **Terrains** : deux modes.
  - **Auto** *(par défaut)* : tu ne saisis rien — les terrains sont **attribués par l'onglet
    Terrains & répartition** (§1.4). La carte affiche juste les terrains actuels à titre indicatif.
  - **Manuel** : tu saisis toi-même les numéros séparés par des virgules (ex. `1,2,3`). Une
    **vérification en direct** te conseille au fil de la frappe : terrain déjà utilisé par une autre
    catégorie, numéro qui n'existe pas dans ta répartition, catégorie sans terrain, saisie invalide.
    *(Plus de terrains = plus de matchs en parallèle = journée plus courte.)*

  > 💡 Le bouton **« Répartir / Appliquer »** de l'onglet Terrains **ne touche pas** les catégories en
  > mode Manuel : elles gardent tes numéros.
- **Nombre de poules** : **vide = automatique** (l'outil vise ~4 équipes par poule). Tu peux
  **forcer** un nombre ; si ce forçage rallonge la journée par rapport à l'auto, l'assistant
  d'arbitrage te le signale (§1.5).
- **Nb mi-temps**, **durée mi-temps (min)**, **pause mi-temps (min)** : définissent la **durée
  d'un match** = (nb mi-temps × durée) + (pause si ≥ 2 mi-temps).
- **Récup. entre matchs (min)** : repos minimal garanti à une équipe entre deux de ses matchs.

Boutons : **Enregistrer** (par catégorie), **Supprimer** (la catégorie), et un formulaire
**Ajouter une catégorie**, placé **au-dessus de la liste**. Un **doublon est refusé** avec une
comparaison souple : casse, accents et espaces ignorés («  u10 » = « U10 »).

### 1.3 Équipes
- **Ajouter** : nom (mis automatiquement en MAJUSCULES) + catégorie → **Ajouter**. Un **même nom
  ne peut pas être ajouté deux fois dans la même catégorie** (doublon refusé ; idem au renommage).
  - S'il n'existe **aucune catégorie**, le formulaire est **désactivé** et un message invite à
    **ajouter d'abord une catégorie** (on ne peut pas rattacher une équipe à rien).
- La liste s'affiche **groupée par catégorie**. Pour chaque équipe : **✏️ (crayon)** pour
  **renommer** en ligne (Entrée = valider, Échap = annuler) et **🗑️ (corbeille)** pour
  **supprimer**.
- En tête de chaque catégorie : **Tout supprimer** efface d'un coup toutes ses équipes
  (confirmation demandée).
- **Plusieurs équipes d'un même club** : les nommer `CLUB-1`, `CLUB-2` (tiret + numéro). Elles
  seront placées dans des **poules différentes** au tirage. *(Un chiffre collé au nom, « RACING 92 »,
  fait partie du nom ; utiliser le tiret pour distinguer les équipes.)*

### 1.4 Terrains & répartition automatique
Cette carte part de tes **grands terrains réels** (les terrains de foot / rugby que tu occupes) et
les **découpe automatiquement** en petits terrains à la bonne taille selon les catégories. Elle
remplit ensuite le champ **Terrains** de chaque catégorie à ta place (fini le « au hasard »).

**a) Déclarer les grands terrains.** Pour chaque grand terrain : un **nom** (Rugby 1, Foot 2…), un
**type** (🏉 rugby / ⚽ foot), sa **longueur × largeur** en mètres, et son **emplacement** sur le
site (grille 3×3 : haut-centre, centre-gauche…). Boutons **+ Ajouter un grand terrain** et **✕**
pour en retirer un. Règle aussi le **couloir de circulation** entre les petits terrains (5 m par
défaut).

**b) Taille de chaque catégorie.** Une ligne par catégorie présente : sa **longueur × largeur** de
terrain (ex. U8 30×20, U10 40×30). Coche **« terrain entier »** si un match occupe un grand terrain
complet (cas U14).

**c) Tableau de capacité.** Il se met à jour **en direct** : pour chaque grand terrain, il indique
**combien de mini-terrains** de chaque catégorie y tiennent (couloirs compris). Le bouton
**Enregistrer les terrains** mémorise tout ça.

**d) Répartir.** Le bouton **🧩 Répartir les terrains** calcule la répartition et affiche :
- un **résumé** par catégorie (nombre de terrains attribués + sur quels grands terrains) ;
- une **carte visuelle** dessinée **comme sur le site** (chaque grand terrain à sa vraie position).

Principes de la répartition :
- **Selon le nombre d'équipes** : plus une catégorie a d'équipes, plus elle reçoit de terrains, en
  gardant chaque catégorie **groupée** (déplacements courts). *(La charge est équilibrée : à taille
  de terrain égale, le nombre de terrains suit le nombre d'équipes.)*
- **Partage d'un grand terrain** : s'il y a plus de catégories que de grands terrains, un grand
  terrain peut être **scindé en deux** (une catégorie de chaque côté).
- **Table des marques** : sur chaque grand terrain, **1 mini-terrain central est réservé** à la
  table des marques (zone grise **« TM »**) ; elle est **dessinée en deux** quand deux catégories
  partagent un grand terrain, pour éviter la confusion.
- **Numérotation continue** : les mini-terrains sont numérotés **1, 2, 3… en continu** sur tout le
  tournoi (chaque numéro est **unique** → aucune confusion à la table des marques).
- Sur la carte, **la couleur indique la catégorie** (pas le terrain) ; le **nom du terrain** (Rugby 1,
  Rugby 2…) indique l'emplacement.

**e) Appliquer.** Le bouton **✅ Appliquer aux catégories** écrit les numéros de terrain dans le champ
**Terrains** des catégories **en mode Auto** (celles en **Manuel** sont laissées telles quelles). Ils
seront utilisés **à la prochaine génération du planning** (§1.5). Pour fixer toi-même les terrains
d'une catégorie, passe-la en **Manuel** dans ses réglages (§1.2).
Il mémorise aussi la **composition de chaque grand terrain** (quels numéros de mini-terrains le
composent) : c'est elle qui alimente le filtre **« Grand terrain »** de la page Saisie des scores (§2).

> 💡 À faire **avant** de générer les poules et le planning : c'est le champ **Terrains** rempli ici
> qui sert à répartir les matchs sur les terrains dans le temps.

### 1.5 Poules & planning (génération du matin)
Le bouton **🎲 Générer poules et planning** :

1. **Répartit les équipes en poules** (par catégorie). Règle : deux équipes d'un **même club** ne
   vont pas dans la même poule de départ (les clubs les plus nombreux sont placés d'abord). Si un
   club a plus d'équipes que de poules, un avertissement le signale.
2. **Crée les matchs de poule** en **round-robin** (chacun contre chacun), via l'**algorithme du
   cercle** (chaque équipe rencontre toutes les autres une fois).
3. **Place les matchs sur les terrains et dans le temps**, sans conflit : une équipe ne joue pas
   deux matchs en même temps, un terrain n'accueille qu'un match à la fois, on respecte le
   battement, la récup et la **pause déjeuner**.

> ⚠️ Générer **efface** les poules, matchs et scores précédents (nouveau tournoi).
>
> **Garde-fou** : si des scores sont **déjà saisis** (ex. en plein tournoi), un avertissement
> **rouge** indique **combien** vont être effacés, puis l'outil **redemande la clé admin** avant
> d'effacer. Impossible de tout perdre par un clic malheureux. Sans aucun score saisi (préparation),
> la confirmation reste simple.

**Après la génération**, l'outil affiche : le nombre de poules/matchs, l'**heure de fin du matin**,
l'**heure de fin projetée** du tournoi (après-midi inclus), et d'éventuels **avertissements**.

**L'assistant d'arbitrage** apparaît (pistes cliquables) dans **3 cas** :
- **Matin qui déborde sur la pause déjeuner** : le dernier match du matin finirait après le début
  de la pause. Pistes pour **finir le matin avant la pause**.
- **Heure de fin manuelle dépassée** (auto décoché) : le tournoi finirait après ta cible.
- **Forçage du nombre de poules coûteux** : ton forçage rallonge la journée vs le mode auto.

Chaque piste (ex. « ajouter un terrain », « réduire le battement », « mi-temps −1 min »,
« commencer plus tôt », « une poule de plus ») indique l'heure de fin simulée et le temps gagné ;
un **✅** marque celles qui **tiennent le créneau**. Un clic **applique** le réglage et **régénère**.

**Suivi de l'avancement** : dans le planning affiché, chaque **catégorie** et chaque **phase**
(Matin / Après-midi) portent un badge **« X/Y saisis »** — bleu tant qu'il reste des scores à
entrer, **vert avec ✅** quand tout est saisi. Combiné au bouton **🔄 Rafraîchir**, tu vois d'un
coup d'œil où en est la journée sans quitter la page admin.

**Modifier les poules du matin à la main** : après la génération auto (et **avant de jouer**), le
bouton **✏️ Modifier les poules du matin** ouvre un éditeur pour **rééquilibrer les niveaux** (ex.
éviter qu'une équipe dominante se retrouve dans une poule faible). Clique la **✕** d'une équipe pour
la mettre **« à replacer »**, puis **→ Poule X** pour la réaffecter. L'**équilibre des tailles** est
affiché (⚠️ si écart > 1). En cliquant **Enregistrer et recalculer**, les **matchs du matin sont
recalculés** d'après ta répartition. ⚠️ Impossible **une fois qu'un score du matin est saisi** (les
matchs ne peuvent plus changer). Ne touche pas à l'après-midi (qui, lui, reflète le niveau réel).

### 1.6 Phase après-midi (classement croisé)
Le bouton **🏉 Générer l'après-midi**. Principe : les équipes de **même rang de poule** jouent
ensemble l'après-midi (les 1ᵉʳ de poule entre eux → **Niveau 1**, les 2ᵉ → **Niveau 2**, etc.).

- Une **ligne d'état** au-dessus du bouton indique l'avancement des scores du matin
  (ex. « ✅ 12/12 saisis — prêt à générer » ou « ⏳ 8/12 saisis »). Le **bouton reste désactivé**
  tant que **tous les scores du matin ne sont pas saisis** (le classement du matin détermine les
  niveaux) : plus besoin de cliquer pour découvrir qu'il manque des scores.
- **N'efface pas** les matchs du matin.

### 1.7 Infos du tournoi + affiche
Alimentent la **carte d'actualité** et la **page d'article** du site vitrine (boutique-r92) : nom,
date, lieu, description, et une **affiche** — dépose l'image dans la **zone de glisser-déposer**
(ou clique dessus pour choisir un fichier) ; elle est redimensionnée puis stockée dans Google Drive.
On les sauvegarde avec le bouton **Enregistrer les infos**. Elles sont **modifiables à tout moment,
même après publication** (pour corriger une faute de frappe sans dépublier). Par sécurité, elles
sont aussi enregistrées lors de la publication.

Un bouton **Retirer l'affiche** (sous l'aperçu) permet d'**annuler un choix pas encore enregistré**,
ou de **supprimer l'affiche déjà enregistrée** (le fichier Drive est mis à la corbeille).

**🪟 Aperçu sur le site.** À côté du formulaire (à droite sur ordinateur), une carte **« Aperçu sur
le site »** montre **exactement ce qui apparaîtra** sur le site de l'association : la **carte
d'actualité** (mêmes styles, extrait limité à 160 caractères, format de date, textes par défaut si
un champ est vide, affiche recadrée par le haut) puis, dessous, la **page de l'événement** (celle
qui s'ouvre au clic sur la carte : bandeau navy, Présentation + affiche, Infos pratiques Quand/Où,
boutons). Les deux se mettent à jour **pendant que tu tapes**, avant même d'enregistrer, et la
légende rappelle si le tournoi est **publié** ou non.

### 1.8 Publier le tournoi
Rend le tournoi **visible du public**. Tant qu'il n'est pas publié, les visiteurs voient un écran
« à venir ». Indépendant de la génération des poules : on prépare tout, on publie quand c'est prêt.
Le même bouton permet de **masquer** à nouveau.

### 1.9 Réinitialiser le tournoi (zone de danger)
Remet le tournoi **à zéro** pour repartir d'une base vierge (double confirmation, action
**irréversible**). Sont supprimés : les **catégories**, les **équipes**, les **poules** et
**matchs** (planning + scores), les **infos du tournoi** (nom, date, lieu, description,
**affiche** — le fichier Drive part à la corbeille) et les **horaires de la journée** (remis à
zéro, l'étape « Horaires » repasse « à faire »). Le tournoi repasse en **masqué**.
✅ Seul l'**historique des saisons** (page Perfs) est conservé.

---

## 2. Page Saisie des scores (`saisie.html`)

Pensée pour le **téléphone**, un marqueur par terrain. À l'ouverture, elle demande **une fois** la
**clé scores** (mémorisée le temps de la session).

- **🔄 Rafraîchir** (en haut, avec l'heure de dernière mise à jour) : recharge les scores saisis sur
  les **autres appareils**. La page ne se met **pas** à jour toute seule (pour ne pas effacer un
  score en cours de frappe) → clique Rafraîchir quand tu veux voir l'avancement des autres tables.
- **Catégorie à saisir** : un menu déroulant en haut → une **table de marque par catégorie** (on ne
  voit que les matchs de la catégorie choisie, pour éviter les erreurs). Masqué s'il n'y a qu'une
  catégorie ; le choix est mémorisé.
- **Grand terrain** : un second menu déroulant → ne montre que les matchs des **mini-terrains qui
  composent le grand terrain choisi** (ex. « Rugby 1 (terrains 1, 2, 3, 4) »). À la table de marque
  du terrain Rugby 1, on ne voit ainsi **que ses matchs** → pas d'erreur de saisie. « Tous les
  terrains » par défaut ; le choix est mémorisé. Le menu n'apparaît que si la **répartition
  automatique** a été **appliquée** dans l'admin (§1.4 e) et qu'il y a au moins deux grands terrains.
- **Accordéons Matin / Après-midi** :
  - Le **matin** se **replie** automatiquement quand **tous ses matchs sont saisis ET que
    l'après-midi est généré** (on le range pour se concentrer sur l'après-midi). Sinon il reste
    ouvert. Toujours ré-ouvrable d'un clic.
  - L'**après-midi** se replie **dès la validation de son dernier score** (journée bouclée).
  - Le compteur « X à saisir » se met à jour **en direct** à chaque validation.
- **Saisir un score** : entrer les deux scores → **Valider**. Le match passe en **terminé**, se
  **verrouille** (champs grisés) et compte dans le classement.
- **Corriger** un score déjà validé : bouton **Corriger** → l'outil **redemande la clé scores**
  (confirmation forte, car un score validé est « définitif »), déverrouille les champs, puis
  **Valider la correction**. Fonctionne aussi bien pour le matin (dans son accordéon) que l'après-midi.
  - ⚠️ **Correction d'un score du matin après génération de l'après-midi** : une alerte prévient que
    les **niveaux de l'après-midi** (calculés sur le classement du matin) peuvent être faussés. Il
    faut alors **régénérer l'après-midi** depuis l'admin (§1.6) pour rétablir les bons niveaux.

---

## 3. Page publique « Le tournoi » (`tournoi.html`)

Aux couleurs du site vitrine. Le bandeau de titre prend le **nom de l'événement** (saisi dans
l'admin). Un **bandeau de don** mène à la page « Faire un don » du site. Bouton **Rafraîchir** +
heure de dernière mise à jour ; la page se **rafraîchit toute seule** (~15 s, avec un léger
étalement aléatoire pour la montée en charge — voir `montee-en-charge`/`relais-cdn.md`).

- **Filtre catégorie** (en haut) : restreint tout l'affichage à une catégorie ; masqué s'il n'y en
  a qu'une ; tri **numérique** (U8 avant U10 avant U12).
- **Onglet « Mon équipe »** : on choisit son équipe, puis on voit :
  - ses **matchs** du matin puis de l'après-midi (heure, terrain, poule/niveau, résultat) ;
  - le **classement de sa poule** (matin), de son **niveau** (après-midi) et le **classement
    général** du tournoi. La ligne de l'équipe est surlignée.
- **Onglet « Classements »** : les **derniers scores** du tournoi en tête, puis les **poules** du
  matin (tableau complet : J, V, N, D, BP, BC, Diff, Pts) et les **niveaux croisés** de l'après-midi.

### 3.1 Le podium (top 3) — règle de certitude
Un encadré **🏆 Podium** apparaît (en haut à droite sur ordinateur, pleine largeur sur mobile),
**commun aux deux onglets** et **dynamique selon la catégorie**. Il ne s'affiche **que lorsque le
trio de tête est mathématiquement certain** : c.-à-d. quand **aucun résultat possible des matchs
restants** ne peut changer les 3 premières places **ni leur ordre**.

> **Raisonnement** : le classement général tient compte du **niveau** (figé dès l'après-midi
> généré), puis des résultats **après-midi**, puis **matin**, avec le barème et le départage
> diff/points marqués. Comme les scores sont **libres** (un large succès peut renverser la
> différence), une place n'est jugée « sûre » que si l'**écart de points est devenu
> inatteignable**. Conséquence : le podium peut s'afficher **avant** la fin de tous les matchs, dès
> qu'il est verrouillé. S'il reste une incertitude (ou moins de 3 équipes, ou égalité parfaite
> indépartageable), **rien** ne s'affiche plutôt qu'un ordre faux.

---

## 4. Page Perfs Racing (`perfs.html`) — interne

Non liée dans les menus (accès par l'URL), **lecture seule**. Deux onglets :
- **Ce tournoi** : bilan et frise horaire des équipes du club sur le tournoi en cours.
- **Saison** : cumul des rencontres par adversaire sur toute la saison (lu dans l'onglet
  **Historique** du Sheet, jamais effacé par une génération).

---

## 5. Les clés (sécurité des écritures)

- **Clé admin** : exigée pour tous les réglages, la génération, la publication, la gestion des
  équipes/catégories.
- **Clé scores** : exigée pour saisir/corriger un score.

Les clés sont **stockées côté serveur** (Propriétés du script Apps Script), **jamais dans le
code**. Elles se règlent **une fois** dans l'éditeur Apps Script via `configurerCles('cleAdmin',
'cleScores')`. La page mémorise la clé saisie pour la **session** (onglet ouvert) puis l'oublie.

> **Bonne pratique** : choisir des clés **longues et aléatoires** (≥ 16 caractères) — c'est la
> protection la plus efficace contre les tentatives de devinette. Voir `docs/passation.md`.

---

## 6. Où sont les données ?

Tout vit dans un **Google Sheet** à 5 onglets : **Equipes**, **Poules**, **Matchs**, **Config**
(réglages globaux + catégories), **Historique** (cumul saison). Le détail des colonnes est décrit
dans [`structure-google-sheet.md`](structure-google-sheet.md). L'architecture technique complète
est dans [`architecture.md`](architecture.md).
