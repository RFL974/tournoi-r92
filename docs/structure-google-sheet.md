# Structure du Google Sheet

Le Google Sheet sert de **base de données** du tournoi. Il contient **5 onglets**
(le 5e, `Historique`, est le journal de saison décrit tout en bas).

> URL du Sheet :
> https://docs.google.com/spreadsheets/d/17jcZMNHJywE6e1qEXMnp_g6rsVeLo05vbQ-0njdlL7U/edit

**Règle importante :** la **première ligne de chaque onglet contient les en-têtes de colonnes**
(exactement les noms indiqués ci-dessous, en minuscules, sans accents). Le backend s'appuie sur
ces noms pour lire/écrire les données — il ne faut donc pas les renommer.

> 🛠️ **Création automatique.** Ces onglets et en-têtes sont créés automatiquement par la fonction
> `setupSheet()` du fichier [`../backend/Code.gs`](../backend/Code.gs), à lancer une fois depuis
> l'éditeur Apps Script. Pas besoin de les saisir à la main.

---

## Onglet `Config`

Cet onglet contient deux zones : **Zone A** (réglages globaux, en haut, paires
`parametre`/`valeur`), une ligne vide, un titre `— Réglages par catégorie —`, puis la **Zone B**
(en-têtes + une ligne par catégorie). Le backend repère les zones **par leur contenu** (nom du
paramètre, ou ligne dont la 1re cellule vaut `categorie`), donc les numéros de ligne peuvent varier.

Tout l'onglet `Config` est au **format texte** (pour éviter que `09:00` devienne une heure
et `1,2` un nombre décimal).

### Zone A — Réglages globaux de la journée

Deux colonnes : `parametre` et `valeur`.

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `heure_debut` | `09:00` | Heure de début du tournoi |
| `heure_fin` | `17:00` | Heure de fin — **calculée automatiquement** si `heure_fin_auto = oui` |
| `heure_fin_auto` | `oui` | Si `oui`, l'heure de fin = fin du dernier match (recalculée à chaque génération) |
| `battement_terrain_min` | `5` | Temps (min) pour libérer un terrain entre 2 matchs |
| `pause_dejeuner_debut` | `12:30` | Début de la pause déjeuner |
| `pause_dejeuner_duree_min` | `60` | Durée de la pause déjeuner, en minutes |

Paramètres ajoutés **automatiquement** (pas à saisir à la main) :

| parametre | valeur (exemple) | Signification |
|---|---|---|
| `tournoi_id` | `2026-11-11 21:37:00` | Identifiant du tournoi, posé à chaque génération (clé de l'onglet `Historique`) |
| `tournoi_publie` | `oui` | `oui` = la page publique est visible ; sinon écran « à venir ». Piloté par « Générer le tournoi » |
| `tournoi_nom` | `Challenge Marc Chevalier` | Nom affiché sur la carte + la page d'article du site vitrine |
| `tournoi_date` | `2026-11-11` | Date du tournoi (carte, article, agenda .ics) |
| `tournoi_lieu` | `11 av. Paul Langevin, 92350…` | Lieu (article + itinéraire + agenda .ics) |
| `tournoi_description` | `Le Challenge…` | Description (carte + article) |
| `tournoi_affiche_id` | `1-3DZBDd…` | Identifiant du fichier **Google Drive** de l'affiche (affichée via `lh3.googleusercontent.com/d/{id}`) |
| `terrains_physiques` | `[{"nom":"Rugby 1",…}]` | JSON — les **grands terrains** réels déclarés (onglet admin « Terrains & répartition ») |
| `dimensions_categories` | `{"U8":{"l":30,"w":20},…}` | JSON — taille de mini-terrain par catégorie (`plein:true` = grand terrain entier) |
| `couloir_terrain_m` | `5` | Couloir de circulation entre mini-terrains (m) |
| `tm_longueur_m` / `tm_largeur_m` | `4` | Taille de la table des marques (m) |
| `repartition_grands_terrains` | `{"Rugby 1":["1","2"],…}` | JSON — **composition de chaque grand terrain** (numéros de mini-terrains), écrite quand la répartition est **appliquée** ; alimente le filtre « Grand terrain » de la page Saisie |

### Zone B — Réglages par catégorie

Un tableau, **une ligne par catégorie**. En-têtes :

| Colonne | Exemple | Signification |
|---|---|---|
| `categorie` | `U8` | Nom de la catégorie |
| `presente` | `oui` | La catégorie participe-t-elle à cette édition ? (`oui`/`non`) |
| `terrains` | `1,2` | Terrains dédiés à cette catégorie (numéros séparés par des virgules) |
| `terrains_auto` | `oui` | Source des terrains : `oui` (défaut) = attribués par l'onglet **Terrains & répartition** ; `non` = **saisis à la main** dans les réglages (avec vérification en direct). **Vide = `oui`** |
| `nb_poules` | *(vide)* | Nombre de poules. **Vide = Auto** (calculé pour viser ~4 équipes/poule) ; un entier = **forcé** |
| `format_mi_temps` | `2` | Nombre de mi-temps par match (`1` ou `2`) |
| `duree_mi_temps_min` | `10` | Durée d'une mi-temps, en minutes |
| `pause_mi_temps_min` | `2` | Pause entre les deux mi-temps, en minutes (0 si `format_mi_temps = 1`) |
| `recup_entre_matchs_min` | `15` | Temps de récupération minimum d'une équipe entre 2 de ses matchs |
| `format_apresmidi` | `CROISE` | Format de l'après-midi : `CROISE` / `CROISE_DIAGONAL` / `LIBRE` / `COUPE_PLATEAU`. **Vide = `CROISE`** (comportement historique) |
| `param_format` | `{"nbQualifiesCoupe":2}` | Réglages JSON du format. Pour `COUPE_PLATEAU` : nb de qualifiés en Coupe par poule. Vide pour `CROISE`/`CROISE_DIAGONAL`/`LIBRE` |

> ℹ️ **Migration automatique** : `format_apresmidi`, `param_format` et `terrains_auto` sont **ajoutées
> automatiquement** à droite de la Zone B dès la première génération d'après-midi (ou enregistrement de
> catégorie) sur un Sheet déjà en service. Une catégorie sans `format_apresmidi` = **classement croisé**,
> et sans `terrains_auto` = **mode Auto**, comme avant.

> **Durée totale d'un match** (calculée par le backend) :
> `format_mi_temps × duree_mi_temps_min + pause_mi_temps_min` (si 2 mi-temps).
> Exemple U8 : `2 × 8 + 2 = 18 min`.

---

## Onglet `Equipes`

Une ligne par équipe. En-têtes :

| Colonne | Exemple | Rempli par |
|---|---|---|
| `id_equipe` | `E01` | Identifiant unique (généré ou saisi) |
| `nom_equipe` | `Suresnes 1` | Saisi par l'admin |
| `categorie` | `U8` | Saisi par l'admin |
| `poule` | `A` | **Auto** — rempli par « Générer poules et planning » |

---

## Onglet `Poules`

Définit les poules existantes. La **composition** se lit dans `Equipes` (colonne `poule`),
et le **classement se calcule** à partir des scores de l'onglet `Matchs`.

| Colonne | Exemple | Signification |
|---|---|---|
| `id_poule` | `P01` | Identifiant unique de la poule |
| `categorie` | `U8` | Catégorie de la poule |
| `nom_poule` | `A` | Nom court (A, B, C…) |

---

## Onglet `Matchs`

Une ligne par match. En-têtes :

| Colonne | Exemple | Rempli par |
|---|---|---|
| `id_match` | `M001` | Identifiant unique |
| `categorie` | `U8` | Auto (génération) |
| `poule` | `A` | Auto (génération) |
| `terrain` | `1` | Auto (génération) |
| `heure_debut` | `09:00` | Auto (génération) |
| `heure_fin` | `09:22` | Auto (génération) |
| `equipe_A` | `E01` | Auto (génération) — identifiant d'équipe |
| `equipe_B` | `E02` | Auto (génération) — identifiant d'équipe |
| `score_A` | `15` | **Page de saisie des scores** |
| `score_B` | `10` | **Page de saisie des scores** |
| `statut` | `à venir` | `à venir` / `en cours` / `terminé` |
| `phase` | `poule` | Auto — `poule` (matin) ou `classement` (après-midi, **tous formats**) |
| `format` | `COUPE_PLATEAU` | Auto — format de l'après-midi de la ligne (`CROISE`/`CROISE_DIAGONAL`/`LIBRE`/`COUPE_PLATEAU` ; vide pour le matin) |
| `sous_tableau` | `COUPE` | Auto — `COUPE` ou `PLATEAU` (uniquement en `COUPE_PLATEAU` ; vide sinon) |
| `tour` | `DEMI_FINALE` | Auto — tour de bracket (`FINALE`, `DEMI_FINALE`, `PETITE_FINALE`, `QUART_DE_FINALE`…) ; vide hors Coupe |
| `match_suivant` | `M042` | Auto — `id_match` qui reçoit le **vainqueur** de ce match (vide si terminal) |
| `place_suivant` | `A` | Auto — emplacement (`A`/`B`) du match suivant où placer le vainqueur |
| `vainqueur` | `E07` | En cas d'**égalité** en Coupe, `id_equipe` désignée vainqueur (départage manuel par le bénévole) |

> ℹ️ **Migration automatique** : les colonnes `phase` puis `format`, `sous_tableau`, `tour`,
> `match_suivant`, `place_suivant`, `vainqueur` sont **ajoutées automatiquement** à droite dès la
> première génération sur un Sheet déjà en service — aucune manip manuelle. Les `setupSheet()`
> neufs les créent déjà.

Pour les matchs de l'**après-midi** (`phase = classement`), la lecture de la ligne dépend du `format` :
- **CROISE** — la colonne `poule` contient le **niveau** (`N1` = 1ers de poule, `N2` = les 2es, etc.).
- **CROISE_DIAGONAL** — même étiquetage de **niveau** (`N1`, `N2`…) que `CROISE`, mais chaque niveau
  regroupe **deux rangs consécutifs** croisés en diagonale (1ᵉʳ d'une poule vs 2ᵉ d'une autre). Lu et
  classé **exactement comme `CROISE`**.
- **LIBRE** — `poule` vaut `Libre` (matchs amicaux, sans classement ni qualification).
- **COUPE_PLATEAU** — `poule` vaut `Coupe` ou `Plateau` ; en Coupe, `sous_tableau=COUPE` + `tour` +
  `match_suivant`/`place_suivant` décrivent le **bracket à élimination directe** (avec petite finale).
  Un score de Coupe validé **propage automatiquement** le vainqueur dans `match_suivant`.

---

## Onglet `Historique` (journal de saison)

Cet onglet **n'est jamais effacé** par « Générer poules et planning » (qui, lui, vide
l'onglet `Matchs`). Il **accumule tous les matchs terminés de la saison**, tournoi après
tournoi. La page interne **Perfs Racing** (`frontend/perfs.html`, onglet « Saison ») s'en
sert pour cumuler les rencontres — utile quand le club croise plusieurs fois la même équipe.

**Alimentation automatique :** dès qu'un score est validé (page saisie), le match est recopié
ici par le backend (`archiverResultat` dans [`../backend/Code.gs`](../backend/Code.gs)). Une
**correction de score met à jour la même ligne** (pas de doublon). Rien à faire à la main.

| Colonne | Exemple | Signification |
|---|---|---|
| `date` | `2026-01-12` | Jour où le score a été validé (≈ date du tournoi) |
| `tournoi_id` | `2026-01-12 09:03:00` | Identifiant du tournoi (posé à chaque génération). Sert de clé avec `id_match` |
| `id_match` | `M001` | Identifiant du match **dans son tournoi** |
| `categorie` | `U8` | Catégorie |
| `phase` | `poule` | `poule` (matin) ou `classement` (après-midi) |
| `equipe_A` | `Racing 92` | **Nom** de l'équipe A (et non son id : les noms sont stables d'un tournoi à l'autre) |
| `equipe_B` | `MASSY` | **Nom** de l'équipe B |
| `score_A` | `20` | Score de l'équipe A |
| `score_B` | `5` | Score de l'équipe B |

> 🛠️ **Création automatique.** L'onglet et son en-tête sont créés tout seuls à la première
> validation de score (fonction `assurerOngletHistorique`) — inutile de les saisir. Les
> `setupSheet()` neufs le créent déjà. Le paramètre `tournoi_id` apparaît aussi dans la
> **Zone A** de l'onglet `Config`.

---

## Système de classement (rappel)

Calculé en direct à partir des matchs `terminé` :
- **Victoire** = 3 points
- **Match nul** = 2 points
- **Défaite** = 1 point

En cas d'égalité de points, départage par la **différence** (points marqués − points encaissés),
puis par les points marqués.
